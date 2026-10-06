"""
review.py -- objective QC of the rendered soundtrack (nobody can listen).

    python audio/review.py        # after python audio/mix.py (mix.py runs it by default)

1. audio/analyze.py on public/audio/{music,sfx,soundtrack}.wav
   -> audio/_reports/soundtrack_report.md (+ spectrograms/)
2. loudness: integrated LUFS, LRA, max momentary / short-term, true peak, sample peak
3. onsets: spectral-flux onset detector (5 ms hop), times refined to the steepest 1 ms-RMS
   rise; the strongest onsets with what is scheduled there, and every intended hit
   (score.SYNC) matched to its nearest detected onset (offset in ms, rise in dB, rank)
4. silences: music.wav level inside every cut / silence of the music map, plus the solo
   notes that are meant to live there
5. balance: per-section loudness (music / sfx / master); UI foley peaks vs the music's hits
6. audio/_reports/soundtrack_review.png -- coarse waveform + spectrogram, second markers,
   sections and intended hits, for the director
Exit code 1 on a hard failure (analyze.py hard flag, TP > -1 dBTP, wrong length/format,
LUFS off by > 0.5 LU, an intended hit not found, a silence that is not silent).
"""
from __future__ import annotations

import json
import math
import os
import sys

import numpy as np
import soundfile as sf
from scipy import ndimage as ndi
from scipy import signal as sps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if HERE not in sys.path:
    sys.path.insert(0, HERE)
from lib import dsp  # noqa: E402
import analyze  # noqa: E402
import cues  # noqa: E402
import score  # noqa: E402

SR = dsp.SR
AUD = os.path.join(ROOT, "public", "audio")
REP = os.path.join(HERE, "_reports")
FILES = {k: os.path.join(AUD, f"{k}.wav") for k in ("music", "sfx", "soundtrack")}
META = os.path.join(REP, "mix_meta.json")
HOP = 240            # 5 ms
NFFT = 1024

SILENCES = [  # (t0, t1, what) -- the music bus must be silent here
    (5.02, 7.74, "after press 1 (5.0-7.75)"),
    (20.52, 20.98, "empty state, before the dun"),
    (22.10, 22.44, "empty state, after the dun"),
    (50.02, 52.44, "after press 2 (50.0-52.5)"),
    (61.02, 61.95, "breath, before celesta C6"),
    (74.97, 75.27, "nothing at 75.00 but the press"),
    (86.50, 87.00, "end (fade to ground)"),
]
SOLOS = [(8.50, 9.00, "pizz neener G5-E5"), (21.00, 21.60, "bass 'dun'"), (62.00, 62.90, "celesta C6")]
UI_FNS = {"ui_click", "hover_tick", "caret_tick", "key_click", "toggle_switch", "card_flip"}


def load(path):
    x, sr = sf.read(path, dtype="float64", always_2d=True)
    return x, sr


# --------------------------------------------------------------------------
# loudness
# --------------------------------------------------------------------------

def k_power(x):
    z = sps.lfilter(*analyze._K1, x, axis=0)
    z = sps.lfilter(*analyze._K2, z, axis=0)
    return np.sum(z ** 2, axis=1)


def sliding_lufs(x, win, hop=0.1):
    p = k_power(x)
    W, H = int(win * SR), int(hop * SR)
    c = np.concatenate([[0.0], np.cumsum(p)])
    starts = np.arange(0, max(1, len(p) - W + 1), H)
    m = (c[starts + W] - c[starts]) / W
    return starts / SR + win, -0.691 + 10 * np.log10(np.maximum(m, 1e-20))


def lra(x):
    _, st = sliding_lufs(x, 3.0, 0.1)
    st = st[st > -70.0]
    if not len(st):
        return 0.0
    rel = -0.691 + 10 * np.log10(np.mean(10 ** ((st + 0.691) / 10))) - 20.0
    st = st[st > rel]
    return float(np.percentile(st, 95) - np.percentile(st, 10))


# --------------------------------------------------------------------------
# onsets
# --------------------------------------------------------------------------

def onsets(x):
    """-> (times_s, strength, rise_db) of detected onsets (spectral flux + time refinement)."""
    mono = x.mean(axis=1)
    _, _, Z = sps.stft(mono, SR, window="hann", nperseg=NFFT, noverlap=NFFT - HOP, boundary=None, padded=False)
    P = np.abs(Z) ** 2
    fr = np.fft.rfftfreq(NFFT, 1.0 / SR)
    edges = np.geomspace(60.0, 16000.0, 33)                      # 32 log bands (mel-like)
    rows = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        sel = (fr >= lo) & (fr < hi)
        if not np.any(sel):                                      # narrow low band: nearest bin
            sel = np.abs(fr - math.sqrt(lo * hi)) == np.min(np.abs(fr - math.sqrt(lo * hi)))
        rows.append(P[sel].mean(axis=0))
    B = np.stack(rows)
    L = 10 * np.log10(B + 1e-20)
    M = np.maximum(L - (np.percentile(L, 99.9) - 70.0), 0.0)     # dB above a floor 70 dB under the max
    flux = np.concatenate([[0.0], np.maximum(M[:, 1:] - M[:, :-1], 0.0).mean(axis=0)])
    centers = (np.arange(len(flux)) * HOP + NFFT / 2) / SR
    base = ndi.median_filter(flux, size=201, mode="nearest")              # 1 s running median
    strength = flux - base
    is_max = strength == ndi.maximum_filter1d(strength, size=17, mode="nearest")   # +/- 40 ms
    thr = 0.05 * np.max(strength)
    pk = np.nonzero(is_max & (strength > thr))[0]
    # refine the time on the attack band (> 1.5 kHz, 2 ms RMS: free of bass / pad ripple):
    # steepest 2 ms rise inside the frame's leading part; rise dB is measured broadband
    hp = dsp.highpass(mono, 100.0)
    env = np.sqrt(np.maximum(ndi.uniform_filter1d(hp ** 2, 48, mode="constant"), 0.0))
    D = 96                                                                # 2 ms
    rise = np.full(len(mono), -99.0)
    for f_hp, win in ((1500.0, 96), (300.0, 144)):   # attack band; and mid band for soft thuds
        band = dsp.highpass(mono, f_hp, order=4)
        e = 20 * np.log10(np.sqrt(np.maximum(ndi.uniform_filter1d(band ** 2, win, mode="constant"), 0.0)) + 1e-7)
        r = np.full_like(e, -99.0)
        r[D:] = e[D:] - e[:-D]
        rise = np.maximum(rise, r)
    times, strengths, rises = [], [], []
    for k in pk:
        c = int(centers[k] * SR)
        a, b = max(D, c - NFFT // 2 - 480), min(len(rise) - 1, c + 480)
        if b <= a:
            continue
        i = a + int(np.argmax(rise[a:b]))
        t = (i - D // 2) / SR
        pre = np.mean(env[max(0, i - 1440 - 480):max(1, i - 480)] ** 2)      # 40..10 ms before
        post = np.mean(env[i:i + 1440] ** 2)                                  # 30 ms after
        times.append(t)
        strengths.append(float(strength[k]))
        rises.append(10 * math.log10((post + 1e-14) / (pre + 1e-14)))
    order = np.argsort(times)
    return np.array(times)[order], np.array(strengths)[order], np.array(rises)[order]


def scheduled():
    """(t, label) of everything scheduled: score hits + all cues."""
    ev = []
    seen = set()
    for e in score.EVENTS:
        if e.grp in ("hits", "solo", "dry"):
            key = (round(e.t, 3), e.inst)
            if key not in seen:
                seen.add(key)
                ev.append((e.t, f"{e.inst}"))
        elif e.grp == "bed" and e.inst in ("marimba", "bass", "kick", "woodblock", "clap", "tom"):
            key = (round(e.t, 2), "bed")
            if key not in seen:
                seen.add(key)
                ev.append((e.t, "(bed groove)"))
    for c in cues.CUES:
        ev.append((c.t, c.fn))
        if c.fn == "button_press":
            ev.append((c.t + c.params.get("hold", 0.12), "button_press release"))
    return sorted(ev)


def near(t, items, tol):
    out = [lab for tt, lab in items if abs(tt - t) <= tol]
    return ", ".join(dict.fromkeys(out))


# --------------------------------------------------------------------------
# picture
# --------------------------------------------------------------------------

def review_png(x, out_png, ost=None):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "Noto Sans CJK SC", "DejaVu Sans"]

    mono = x.mean(axis=1)
    dur = len(mono) / SR
    nfft, hop = 2048, 480
    _, _, Z = sps.stft(mono, SR, window="hann", nperseg=nfft, noverlap=nfft - hop, boundary=None, padded=False)
    S = 20 * np.log10(np.abs(Z) + 1e-9)
    fr = np.fft.rfftfreq(nfft, 1.0 / SR)
    fgrid = np.geomspace(40.0, 20000.0, 260)
    Sl = np.array([np.interp(fgrid, fr, S[:, k]) for k in range(S.shape[1])]).T
    tcol = (np.arange(S.shape[1]) * hop + nfft / 2) / SR
    vmax = float(np.percentile(Sl, 99.9))
    tl, ml = sliding_lufs(x, 0.4, 0.05)
    halves = [(0.0, 44.0), (43.0, dur)]
    fig, axes = plt.subplots(6, 1, figsize=(26, 15), dpi=80,
                             gridspec_kw=dict(height_ratios=[1.1, 2.2, 0.8, 1.1, 2.2, 0.8], hspace=0.12))
    colors = ["#f3e6ee", "#e6eef7"]
    for h, (t0, t1) in enumerate(halves):
        aw, asp, al = axes[3 * h], axes[3 * h + 1], axes[3 * h + 2]
        i0, i1 = int(t0 * SR), int(min(t1, dur) * SR)
        step = 400
        seg = x[i0:i1]
        nn = (len(seg) // step) * step
        tt = t0 + np.arange(nn // step) * step / SR
        for c, col in ((0, "#2a7fff"), (1, "#db2777")):
            s = seg[:nn, c].reshape(-1, step)
            aw.fill_between(tt, s.min(axis=1), s.max(axis=1), color=col, alpha=0.45, lw=0)
        for j, (sid, name, s0, s1) in enumerate(score.SECTIONS):
            if s1 < t0 or s0 > t1:
                continue
            aw.axvspan(s0, s1, color=colors[j % 2], zorder=0)
            aw.text(max(s0, t0) + 0.05, 0.93, f"{sid} {name}", fontsize=8, va="top", color="#555")
        aw.set_ylim(-1, 1)
        aw.set_ylabel("wave")
        m = (tcol >= t0) & (tcol <= t1)
        asp.imshow(Sl[:, m], origin="lower", aspect="auto", cmap="magma", vmin=vmax - 90, vmax=vmax,
                   extent=[tcol[m][0], tcol[m][-1], 0, len(fgrid)])
        ticks = [50, 100, 200, 500, 1000, 2000, 5000, 10000]
        asp.set_yticks([np.interp(np.log(f), np.log(fgrid), np.arange(len(fgrid))) for f in ticks])
        asp.set_yticklabels(["50", "100", "200", "500", "1k", "2k", "5k", "10k"], fontsize=7)
        asp.set_ylabel("Hz")
        mm = (tl >= t0) & (tl <= t1)
        al.plot(tl[mm] - 0.2, ml[mm], color="#333", lw=0.8)
        al.axhline(-16, color="#db2777", lw=0.6, ls="--")
        al.set_ylim(-50, -5)
        al.set_ylabel("M LUFS", fontsize=8)
        for ax in (aw, asp, al):
            ax.set_xlim(t0, t1)
            ax.set_xticks(np.arange(math.ceil(t0), math.floor(t1) + 1, 1.0))
            ax.grid(axis="x", color="#999", lw=0.3, alpha=0.6)
        for ts, lab, _ in score.SYNC:
            if t0 <= ts <= t1:
                for ax in (aw, al):
                    ax.axvline(ts, color="#e00", lw=0.7, ls="--", alpha=0.8)
                asp.axvline(ts, color="#0ff", lw=0.5, ls="--", alpha=0.6)
        aw.tick_params(labelbottom=False)
        asp.tick_params(labelbottom=False)
        al.set_xticklabels([f"{int(v)}" for v in al.get_xticks()], fontsize=7)
        al.set_xlabel("seconds  (red/cyan dashes = intended hits; dashed pink = -16 LUFS)", fontsize=8)
    axes[0].set_title("《启动按钮去哪了？》 soundtrack.wav -- waveform (L blue / R pink), spectrogram, "
                      "momentary loudness", fontsize=11, loc="left")
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    fig.savefig(out_png, bbox_inches="tight")
    plt.close(fig)
    return out_png


# --------------------------------------------------------------------------

def main(argv=None) -> int:
    fails = []
    print("\n=== analyze.py ===")
    rc = analyze.main([FILES["music"], FILES["sfx"], FILES["soundtrack"],
                       "--report", os.path.join(REP, "soundtrack_report.md"),
                       "--title", "Soundtrack QC report (audio/analyze.py)"])
    if rc:
        fails.append("analyze.py hard flag")
    x, sr = load(FILES["soundtrack"])
    mus, _ = load(FILES["music"])
    sfx, _ = load(FILES["sfx"])
    info = sf.info(FILES["soundtrack"])
    print(f"\n=== format ===\nsoundtrack.wav: {info.samplerate} Hz, {info.channels} ch, {info.subtype}, "
          f"{info.frames} frames = {info.frames / info.samplerate:.4f} s")
    if (info.samplerate, info.channels, info.subtype, info.frames) != (48000, 2, "PCM_24", 4176000):
        fails.append("format/length")

    I = dsp.lufs(x)
    tp = dsp.true_peak_db(x)
    _, mom = sliding_lufs(x, 0.4, 0.05)
    _, st = sliding_lufs(x, 3.0, 0.1)
    print("\n=== loudness (soundtrack.wav) ===")
    print(f"integrated {I:.2f} LUFS | LRA {lra(x):.1f} LU | max momentary {mom.max():.1f} LUFS | "
          f"max short-term {st.max():.1f} LUFS | true peak {tp:.2f} dBTP | sample peak {dsp.peak_db(x):.2f} dBFS")
    print(f"music.wav {dsp.lufs(mus):.2f} LUFS, TP {dsp.true_peak_db(mus):.2f} | sfx.wav {dsp.lufs(sfx):.2f} LUFS, "
          f"TP {dsp.true_peak_db(sfx):.2f}")
    if abs(I + 16.0) > 0.5:
        fails.append(f"integrated {I:.2f} LUFS")
    if tp > -1.0:
        fails.append(f"true peak {tp:.2f} dBTP")

    # ---- onsets
    times, strength, rise = onsets(x)
    sched = scheduled()
    rank = np.empty(len(times), dtype=int)
    rank[np.argsort(-strength)] = np.arange(1, len(times) + 1)
    top = 48
    print(f"\n=== strongest onsets (top {top} of {len(times)} detected, in time order) ===")
    print(f"{'t (s)':>8} {'frame':>6} {'rank':>4} {'flux':>6} {'rise dB':>7}  scheduled within +/-25 ms")
    smax = float(strength.max())
    for i in np.nonzero(rank <= top)[0]:
        print(f"{times[i]:8.3f} {times[i] * 60:6.1f} {rank[i]:4d} {strength[i] / smax:6.2f} {rise[i]:7.1f}  "
              f"{near(times[i], sched, 0.025)}")
    print(f"\n=== intended hits vs detected onsets (match window +/-40 ms) ===")
    print(f"{'hit':>7}  {'label':26s} {'onset':>8} {'dt ms':>6} {'rank':>5} {'rise dB':>7}  verdict")
    miss = 0
    for ts, lab, _ in score.SYNC:
        j = int(np.argmin(np.abs(times - ts))) if len(times) else -1
        dt = (times[j] - ts) * 1000 if j >= 0 else 1e9
        if j < 0 or abs(dt) > 40:
            print(f"{ts:7.2f}  {lab:26s} {'-':>8} {'-':>6} {'-':>5} {'-':>7}  MISSING")
            miss += 1
            continue
        ok = abs(dt) <= 20 and (rank[j] <= 60 or rise[j] >= 3.0)
        print(f"{ts:7.2f}  {lab:26s} {times[j]:8.3f} {dt:+6.1f} {rank[j]:5d} {rise[j]:7.1f}  {'ok' if ok else 'WEAK'}")
        if not ok:
            miss += 1
    if miss:
        fails.append(f"{miss} intended hits missing/weak")

    # ---- silences
    print("\n=== silences (music.wav) ===")
    for t0, t1, what in SILENCES:
        seg = mus[int(t0 * SR):int(t1 * SR)]
        pk = dsp.peak_db(seg)
        rms = dsp.rms_db(seg)
        segx = x[int(t0 * SR):int(t1 * SR)]
        flag = "silent" if pk < -70 else ("near-silent" if pk < -55 else "NOT SILENT")
        print(f"{t0:6.2f}-{t1:6.2f}  {what:34s} music peak {pk:7.1f} dBFS rms {rms:7.1f} | "
              f"soundtrack peak {dsp.peak_db(segx):6.1f}  {flag}")
        if pk >= -55:
            fails.append(f"music not silent {t0}-{t1}")
    for t0, t1, what in SOLOS:
        seg = mus[int(t0 * SR):int(t1 * SR)]
        print(f"{t0:6.2f}-{t1:6.2f}  solo: {what:28s} music peak {dsp.peak_db(seg):7.1f} dBFS")

    # ---- per-section balance
    print("\n=== per-section loudness (integrated over the section, LUFS) ===")
    print(f"{'section':22s} {'music':>7} {'sfx':>7} {'master':>7} {'max M':>7}")
    for sid, name, t0, t1 in score.SECTIONS:
        a, b = int(t0 * SR), int(t1 * SR)
        vals = [dsp.lufs(y[a:b]) for y in (mus, sfx, x)]
        mm = sliding_lufs(x[a:b], 0.4, 0.05)[1].max() if b - a > 0.4 * SR else float("nan")
        print(f"{sid + ' ' + name:22s} " + " ".join(f"{v:7.1f}" if v > -200 else "    -inf" for v in vals) + f" {mm:7.1f}")

    # ---- UI foley vs the music's hits (final levels)
    meta = json.load(open(META, encoding="utf8")) if os.path.exists(META) else {"gains": {"stem": 0.0, "sfx_trim": 0.0}}
    g_sfx = meta["gains"]["stem"] + meta["gains"].get("sfx_trim", 0.0)
    ui, other = [], []
    for c in cues.CUES:                       # each cue alone, at its delivered level
        y = dsp.gain(dsp.balance(cues.make(c), c.pan), c.gain_db + g_sfx)
        (ui if c.fn in UI_FNS else other).append((dsp.peak_db(y), c))
    hits = []
    for ts, lab, who in score.SYNC:
        if who == "sfx":
            continue
        a = int(ts * SR)
        hits.append((dsp.peak_db(mus[a:a + int(0.12 * SR)]), ts, lab))
    print("\n=== UI foley (each cue alone) vs the music's hits (peak dBFS in 120 ms), as delivered ===")
    uip = np.array([p for p, _ in ui])
    hp = np.array([p for p, _, _ in hits])
    print(f"UI foley ({len(ui)} cues): max {uip.max():.1f}, median {np.median(uip):.1f} | "
          f"music hits ({len(hits)}): min {hp.min():.1f}, median {np.median(hp):.1f}")
    loud_ui = sorted(ui, key=lambda p: -p[0])[:5]
    print("loudest UI cues: " + "; ".join(f"{c.t:.2f} {c.fn} {p:.1f}" for p, c in loud_ui))
    print("hero/character cues, loudest: " + "; ".join(f"{c.t:.2f} {c.fn} {p:.1f}"
                                                        for p, c in sorted(other, key=lambda p: -p[0])[:6]))
    if np.median(uip) >= np.median(hp):
        fails.append("UI foley not below music hits")

    png = review_png(x, os.path.join(REP, "soundtrack_review.png"))
    print(f"\nreview image: {png}")
    print(f"\nQC: {'PASS' if not fails else 'FAIL: ' + '; '.join(fails)}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
