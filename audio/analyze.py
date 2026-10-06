"""
analyze.py -- objective QC for rendered WAV files (nobody on the team can listen).

Per file: duration, sample peak, true peak (4x oversampled), integrated LUFS
(short files zero-padded), max momentary (400 ms) loudness, RMS, DC offset,
NaN/inf check, clipped samples, click detection (sample-to-sample jump
outliers + abrupt starts/ends), leading/trailing silence, spectral centroid,
band-energy balance, prominent narrow resonances, L/R correlation, and a
waveform + log-frequency spectrogram PNG.

Usage
-----
    python audio/analyze.py                         # everything under audio/_demo
    python audio/analyze.py a.wav some/dir ...      # specific files / folders
    python audio/analyze.py --report out.md --png-dir pngs --no-png

Writes a Markdown report (default ``audio/_reports/demo_report.md``) with a
summary table, per-file flags and the spectrogram images, and prints a
console summary.  Exit code 1 if any file has a hard failure (NaN, clipping,
true peak > 0 dBTP, DC, clicks, abrupt start/end).
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time

import numpy as np
import soundfile as sf
from scipy import ndimage as ndi
from scipy import signal as sps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from lib import dsp  # noqa: E402

DEFAULT_IN = os.path.join(ROOT, "audio", "_demo")
DEFAULT_REPORT = os.path.join(HERE, "_reports", "demo_report.md")

# hard failures -> exit code 1; the rest are advisory
HARD_FLAGS = {"NAN", "CLIP", "TP>0", "DC", "CLICKS", "ABRUPT_START", "ABRUPT_END", "SR"}

# BS.1770 K-weighting at 48 kHz (pre-filter shelf + RLB high-pass)
_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


# --------------------------------------------------------------------------
# metrics
# --------------------------------------------------------------------------


def momentary_max(data: np.ndarray, sr: int, win: float = 0.4) -> float:
    """Maximum momentary (400 ms) or short-term (3 s) loudness in LUFS (sliding, 10 ms hop)."""
    z = sps.lfilter(*_K1, data, axis=0)
    z = sps.lfilter(*_K2, z, axis=0)
    p = np.sum(z ** 2, axis=1)
    W = max(1, int(win * sr))
    if len(p) < W:
        p = np.pad(p, (0, W - len(p)))
    ms = ndi.uniform_filter1d(p, W, mode="constant")[:: max(1, sr // 100)]
    m = float(np.max(ms)) if len(ms) else 0.0
    return -0.691 + 10.0 * math.log10(m) if m > 0 else -240.0


def detect_clicks(x: np.ndarray, sr: int, win_ms: float = 2.0, k: float = 12.0,
                  abs_thresh: float = 0.01) -> list[float]:
    """Sample-jump outliers (discontinuities, spikes, unramped onsets) -> event times (s).

    Uses the second difference d2[n] = x[n+1] - 2x[n] + x[n-1] (a step or spike
    produces a few huge values; smooth tones produce tiny ones).  A sample is a
    click when |d2| > ``abs_thresh`` AND > ``k`` x the RMS of d2 in the
    surrounding +/- win_ms/2 *excluding* the +/-3-sample neighbourhood.  Natural
    bright transients (noise bursts, fast tones) have many similar-sized values
    around them and are not flagged; isolated steps/spikes are.

    Calibration (100 seeds of each drum voice vs synthetic defects): natural
    transients reach ratios of 4-9 (p99 7.4); genuine defects score 27 (phase
    jump in a 2 kHz tone) to 1500+ (phase jump at 220 Hz), a 0.03 spike on a
    sine 210, an unramped -20 dBFS onset 85.  k = 12 sits between the two.
    """
    if len(x) < 16:
        return []
    d2 = x[2:] - 2.0 * x[1:-1] + x[:-2]
    a2 = d2 * d2
    W = max(15, int(win_ms * 1e-3 * sr)) | 1
    sw = ndi.uniform_filter1d(a2, W, mode="constant") * W
    s7 = ndi.uniform_filter1d(a2, 7, mode="constant") * 7
    ex = np.sqrt(np.maximum(sw - s7, 0.0) / (W - 7))
    ad = np.abs(d2)
    idx = np.nonzero((ad > abs_thresh) & (ad > k * ex))[0]
    events = []
    last = -10 ** 9
    for i in idx:
        if i - last > int(0.005 * sr):
            events.append((i + 1) / sr)
        last = i
    return events


def silence_bounds(a: np.ndarray, sr: int, thresh_db: float = -60.0) -> tuple[float, float]:
    """(leading, trailing) silence in seconds below ``thresh_db`` dBFS."""
    loud = np.nonzero(a > dsp.db_to_amp(thresh_db))[0]
    if not len(loud):
        return len(a) / sr, len(a) / sr
    return loud[0] / sr, (len(a) - 1 - loud[-1]) / sr


def spectrum_stats(mono: np.ndarray, sr: int) -> dict:
    """Welch spectrum -> centroid, band-energy shares, prominent narrow peaks."""
    nper = int(min(8192, max(256, 2 ** int(math.log2(max(len(mono), 256))))))
    f, P = sps.welch(mono, sr, nperseg=nper, noverlap=nper // 2, scaling="spectrum")
    tot = float(np.sum(P)) + 1e-30
    centroid = float(np.sum(f * P) / tot)
    bands = [(0, 60, "sub"), (60, 250, "low"), (250, 2000, "mid"), (2000, 6000, "pres"),
             (6000, 12000, "brill"), (12000, sr / 2 + 1, "air")]
    shares = {name: float(np.sum(P[(f >= lo) & (f < hi)]) / tot * 100.0) for lo, hi, name in bands}
    # prominent narrow peaks: compare with a half-octave moving average in log-frequency
    peaks = []
    ok = f > 20
    if np.sum(ok) > 32:
        lf = np.log2(f[ok])
        db = 10 * np.log10(P[ok] + 1e-20)
        grid = np.arange(lf[0], lf[-1], 1.0 / 48.0)
        g_db = np.interp(grid, lf, db)
        base = ndi.uniform_filter1d(g_db, 25, mode="nearest")
        prom = g_db - base
        top = float(np.max(g_db))
        cand, props = sps.find_peaks(prom, height=15.0, distance=12)
        for c in cand:
            fc = 2 ** grid[c]
            if fc >= 1000 and g_db[c] > top - 30:
                peaks.append((round(fc), round(float(prom[c]), 1)))
        peaks.sort(key=lambda p: -p[1])
    return dict(centroid=centroid, bands=shares, peaks=peaks[:4])


def analyze(path: str) -> dict:
    """Analyze one WAV file -> metrics + flags (see module docstring)."""
    data, sr = sf.read(path, dtype="float64", always_2d=True)
    res: dict = dict(file=path, name=os.path.basename(path), sr=sr, channels=data.shape[1],
                     duration=len(data) / sr, flags=[], notes=[])
    flags = res["flags"]
    if sr != dsp.SR:
        flags.append("SR")
    if not np.all(np.isfinite(data)):
        flags.append("NAN")
        data = np.nan_to_num(data)
    if len(data) == 0:
        flags.append("EMPTY")
        return res
    a = np.max(np.abs(data), axis=1)
    pk = float(np.max(a))
    res["peak_dbfs"] = dsp.amp_to_db(pk)
    res["true_peak_dbtp"] = dsp.true_peak_db(data)
    res["lufs"] = dsp.lufs(data)
    res["momentary_max"] = momentary_max(data, sr, 0.4)
    res["short_term_max"] = momentary_max(data, sr, 3.0) if res["duration"] >= 3.0 else None
    res["rms_dbfs"] = dsp.rms_db(data)
    res["dc"] = float(np.max(np.abs(np.mean(data, axis=0))))
    res["clipped"] = int(np.sum(np.abs(data) >= 0.9999))
    clicks = []
    for c in range(data.shape[1]):
        clicks += detect_clicks(data[:, c], sr)
    res["clicks"] = sorted(set(round(t, 4) for t in clicks))
    res["first"] = float(np.max(np.abs(data[0])))
    res["last"] = float(np.max(np.abs(data[-1])))
    tail = data[-max(1, int(0.001 * sr)):]
    res["end_rms_rel"] = dsp.amp_to_db(math.sqrt(float(np.mean(tail ** 2))) / max(pk, 1e-12))
    lead, trail = silence_bounds(a, sr)
    res["lead_silence"], res["trail_silence"] = lead, trail
    mono = data.mean(axis=1)
    res.update(spectrum_stats(mono, sr))
    if data.shape[1] == 2 and np.std(data[:, 0]) > 0 and np.std(data[:, 1]) > 0:
        res["lr_corr"] = float(np.corrcoef(data[:, 0], data[:, 1])[0, 1])
    else:
        res["lr_corr"] = 1.0
    # ---- flags
    if res["clipped"]:
        flags.append("CLIP")
    if res["true_peak_dbtp"] > 0.0:
        flags.append("TP>0")
    elif res["true_peak_dbtp"] > -1.0:
        flags.append("TP>-1")
    if res["dc"] > 1e-3:
        flags.append("DC")
    if res["clicks"]:
        flags.append("CLICKS")
    if res["first"] > 1e-3:
        flags.append("ABRUPT_START")
    if res["last"] > 1e-3 or res["end_rms_rel"] > -12.0:
        flags.append("ABRUPT_END")
    if res["momentary_max"] < -45.0 or res["peak_dbfs"] < -35.0:
        flags.append("TOO_QUIET")
    if lead > 0.05:
        flags.append("LATE_START")
    if trail > 0.25:
        flags.append("LONG_TAIL")
    if res["bands"]["sub"] > 40.0 and res["duration"] < 3.0:
        res["notes"].append("mostly sub-bass energy")
    if res["lr_corr"] < -0.2:
        flags.append("PHASE")
    return res


# --------------------------------------------------------------------------
# spectrogram
# --------------------------------------------------------------------------


def spectrogram_png(path: str, out_png: str, title: str | None = None) -> str:
    """Waveform envelope + log-frequency spectrogram (dB) as a PNG."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    data, sr = sf.read(path, dtype="float64", always_2d=True)
    mono = data.mean(axis=1)
    dur = len(mono) / sr
    nper = 2048 if dur > 6 else (1024 if dur > 1.5 else 512)
    hop = nper // 4 if dur < 20 else nper // 2
    f, t, Z = sps.stft(mono, sr, window="hann", nperseg=nper, noverlap=nper - hop, boundary=None)
    S = 20 * np.log10(np.abs(Z) + 1e-9)
    vmax = float(np.max(S)) if S.size else 0.0
    width = float(np.clip(6 + dur * 0.35, 9, 30))
    fig = plt.figure(figsize=(width, 5.6), dpi=90)
    gsp = fig.add_gridspec(2, 1, height_ratios=[1, 3], hspace=0.08)
    ax1 = fig.add_subplot(gsp[0])
    ax2 = fig.add_subplot(gsp[1], sharex=ax1)
    step = max(1, len(mono) // 6000)
    nn = (len(mono) // step) * step
    if nn:
        for c, col in zip(range(data.shape[1]), ["#2a7fff", "#ff5a8a"]):
            seg = data[:nn, c].reshape(-1, step)
            tt = (np.arange(seg.shape[0]) * step) / sr
            ax1.fill_between(tt, seg.min(axis=1), seg.max(axis=1), color=col, alpha=0.5, lw=0)
    ax1.set_ylim(-1, 1)
    ax1.axhline(dsp.db_to_amp(-1), color="#999", lw=0.5, ls="--")
    ax1.axhline(-dsp.db_to_amp(-1), color="#999", lw=0.5, ls="--")
    ax1.set_ylabel("amp")
    ax1.tick_params(labelbottom=False)
    if S.size:
        ax2.pcolormesh(t, f[1:], S[1:], shading="auto", cmap="magma", vmin=vmax - 100, vmax=vmax,
                       rasterized=True)
    ax2.set_yscale("log")
    ax2.set_ylim(30, sr / 2)
    ax2.set_xlim(0, dur)
    ax2.set_ylabel("Hz")
    ax2.set_xlabel("s")
    ax1.set_title(title or os.path.basename(path), fontsize=10, loc="left")
    os.makedirs(os.path.dirname(os.path.abspath(out_png)), exist_ok=True)
    fig.savefig(out_png, bbox_inches="tight")
    plt.close(fig)
    return out_png


# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------


def _fmt(v, nd=1, unit=""):
    if v is None:
        return "-"
    return f"{v:.{nd}f}{unit}"


def collect(paths: list[str]) -> list[str]:
    out = []
    for p in paths:
        if os.path.isdir(p):
            for dp, _, fs in os.walk(p):
                out += [os.path.join(dp, f) for f in fs if f.lower().endswith(".wav")]
        elif p.lower().endswith(".wav"):
            out.append(p)
    # boards first, then individual files alphabetically
    return sorted(set(out), key=lambda s: (os.path.dirname(s), os.path.basename(s)))


def write_report(results: list[dict], report: str, png_dir: str | None, title: str, elapsed: float) -> None:
    rd = os.path.dirname(os.path.abspath(report))
    lines = [f"# {title}", "",
             f"Generated {time.strftime('%Y-%m-%d %H:%M:%S')} by `audio/analyze.py` "
             f"({len(results)} files, {elapsed:.1f} s).", "",
             "Metrics: peak = sample peak dBFS; TP = true peak (4x oversampled) dBTP; LUFS = integrated "
             "(BS.1770; files < 0.5 s are zero-padded so the value reads like a momentary loudness); "
             "Mmax = max momentary (400 ms) loudness; centroid = spectral centroid; clicks = isolated "
             "sample-jump outliers; tail = trailing silence below -60 dBFS.", "",
             "Hard flags (must be fixed): " + ", ".join(sorted(HARD_FLAGS)) + ". Advisory: TP>-1, "
             "TOO_QUIET, LATE_START, LONG_TAIL, PHASE.", "",
             "| file | dur s | peak dBFS | TP dBTP | LUFS | Mmax | centroid Hz | DC | clicks | tail s | flags |",
             "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|"]
    for r in results:
        rel = os.path.relpath(r["file"], ROOT).replace("\\", "/")
        lines.append(
            f"| `{rel}` | {r['duration']:.2f} | {_fmt(r.get('peak_dbfs'))} | {_fmt(r.get('true_peak_dbtp'))} | "
            f"{_fmt(r.get('lufs'))} | {_fmt(r.get('momentary_max'))} | {_fmt(r.get('centroid'), 0)} | "
            f"{r.get('dc', 0):.1e} | {len(r.get('clicks', []))} | {_fmt(r.get('trail_silence'), 2)} | "
            f"{' '.join(r['flags']) or 'ok'} |")
    lines += ["", "## Details", ""]
    for r in results:
        rel = os.path.relpath(r["file"], ROOT).replace("\\", "/")
        lines.append(f"### {r['name']}")
        lines.append("")
        b = r.get("bands", {})
        lines.append(
            f"- `{rel}` - {r['duration']:.2f} s, {r['channels']} ch, {r['sr']} Hz; peak {_fmt(r.get('peak_dbfs'))} dBFS, "
            f"TP {_fmt(r.get('true_peak_dbtp'))} dBTP, LUFS {_fmt(r.get('lufs'))}, Mmax {_fmt(r.get('momentary_max'))}"
            + (f", short-term max {_fmt(r.get('short_term_max'))}" if r.get("short_term_max") is not None else "")
            + f", RMS {_fmt(r.get('rms_dbfs'))} dBFS")
        lines.append(
            f"- spectrum: centroid {_fmt(r.get('centroid'), 0)} Hz; energy % sub {b.get('sub', 0):.1f} / low "
            f"{b.get('low', 0):.1f} / mid {b.get('mid', 0):.1f} / presence {b.get('pres', 0):.1f} / brilliance "
            f"{b.get('brill', 0):.1f} / air {b.get('air', 0):.2f}; narrow peaks (Hz, dB prominence): "
            f"{r.get('peaks') or 'none'}")
        lines.append(
            f"- edges: first {r.get('first', 0):.1e}, last {r.get('last', 0):.1e}, last-1ms RMS {_fmt(r.get('end_rms_rel'))} dB re peak; "
            f"lead silence {_fmt(r.get('lead_silence'), 3)} s, tail {_fmt(r.get('trail_silence'), 3)} s; "
            f"DC {r.get('dc', 0):.1e}; clipped {r.get('clipped', 0)}; L/R corr {_fmt(r.get('lr_corr'), 2)}")
        if r.get("clicks"):
            lines.append(f"- clicks at: {r['clicks'][:12]}")
        if r["notes"]:
            lines.append(f"- notes: {'; '.join(r['notes'])}")
        lines.append(f"- flags: **{' '.join(r['flags']) or 'ok'}**")
        if r.get("png"):
            lines.append("")
            lines.append(f"![{r['name']}]({os.path.relpath(r['png'], rd).replace(os.sep, '/')})")
        lines.append("")
    os.makedirs(rd, exist_ok=True)
    with open(report, "w", encoding="utf8") as fh:
        fh.write("\n".join(lines) + "\n")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="*", default=[DEFAULT_IN])
    ap.add_argument("--report", default=DEFAULT_REPORT)
    ap.add_argument("--png-dir", default=None, help="default: <report dir>/spectrograms")
    ap.add_argument("--no-png", action="store_true")
    ap.add_argument("--title", default="Audio demo QC report")
    ap.add_argument("--json", default=None, help="also dump raw metrics as JSON")
    args = ap.parse_args(argv)
    t0 = time.perf_counter()
    files = collect(args.paths)
    if not files:
        print("no WAV files found")
        return 1
    png_dir = args.png_dir or os.path.join(os.path.dirname(os.path.abspath(args.report)), "spectrograms")
    results = []
    for fpath in files:
        r = analyze(fpath)
        if not args.no_png:
            stem = os.path.splitext(os.path.relpath(fpath, ROOT))[0].replace("\\", "/")
            stem = stem.replace("public/audio/", "").replace("/", "__")
            ttl = (f"{r['name']}  |  {r['duration']:.2f}s  peak {_fmt(r.get('peak_dbfs'))} dBFS  "
                   f"TP {_fmt(r.get('true_peak_dbtp'))}  LUFS {_fmt(r.get('lufs'))}  flags: {' '.join(r['flags']) or 'ok'}")
            r["png"] = spectrogram_png(fpath, os.path.join(png_dir, stem + ".png"), ttl)
        results.append(r)
        print(f"{r['name']:34s} {r['duration']:6.2f}s  peak {_fmt(r.get('peak_dbfs')):>6}  TP {_fmt(r.get('true_peak_dbtp')):>6}  "
              f"LUFS {_fmt(r.get('lufs')):>6}  Mmax {_fmt(r.get('momentary_max')):>6}  cent {_fmt(r.get('centroid'), 0):>6}  "
              f"{' '.join(r['flags']) or 'ok'}")
    elapsed = time.perf_counter() - t0
    write_report(results, args.report, png_dir, args.title, elapsed)
    if args.json:
        with open(args.json, "w", encoding="utf8") as fh:
            json.dump(results, fh, indent=1, default=float)
    hard = [r for r in results if set(r["flags"]) & HARD_FLAGS]
    print(f"\n{len(results)} files analyzed in {elapsed:.1f}s; {len(hard)} with hard flags. Report: {args.report}")
    return 1 if hard else 0


if __name__ == "__main__":
    sys.exit(main())
