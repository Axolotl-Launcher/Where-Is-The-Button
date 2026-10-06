"""
mix.py -- render the soundtrack of 《启动按钮去哪了？》 (deterministic, offline).

    python audio/mix.py               # render + QC (audio/review.py)
    python audio/mix.py --no-review   # render only
    python audio/mix.py --stems       # also print per-family loudness of the score

Outputs (48 kHz, stereo, 24-bit PCM, exactly 87.0 s = 4,176,000 frames):
  public/audio/music.wav       the score (audio/score.py) after ducking, at mix level
  public/audio/sfx.wav         the SFX cue sheet (audio/cues.py), at mix level
  public/audio/soundtrack.wav  the final master -> src/film/Film.tsx

Signal flow
-----------
score.render() -> bed (ducked under key SFX: cues.duck_events(), -2..-6 dB, 12 ms attack,
250 ms release) + hits (never ducked) + solo  -> music, normalized to MUSIC_LUFS
cues.render()  -> sfx (+ SFX_TRIM_DB)
music + sfx -> 22 Hz high-pass -> PRE_LUFS -> glue compressor (RMS 10 ms, 1.6:1, soft knee,
20/250 ms) -> dsp.master: -16 LUFS integrated, true-peak limiter (ceiling -1.1 dBTP, 4x)
-> 2 ms / 0.5 s edge fades -> exactly 87.0 s.
music.wav and sfx.wav carry the same static gain as the master (no glue / limiter), so
they sum to the pre-dynamics master; a stem is only safety-limited if it alone would
exceed -1 dBTP.  Everything is seeded: same code -> bit-identical files (SHA-256 printed).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time

import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if HERE not in sys.path:
    sys.path.insert(0, HERE)
from lib import dsp  # noqa: E402
import cues  # noqa: E402
import score  # noqa: E402

SR = dsp.SR
DURATION = 87.0
N_TOTAL = dsp.n_samples(DURATION)
OUT_DIR = os.path.join(ROOT, "public", "audio")

MUSIC_LUFS = -20.0      # music bus reference before the SFX are added
SFX_TRIM_DB = 0.0       # SFX bus trim against it
PRE_LUFS = -18.0        # mix level into the glue compressor
TARGET_LUFS = -16.0
CEILING_DBTP = -1.0
DUCK_ATTACK, DUCK_LEAD, DUCK_RELEASE = 0.012, 0.020, 0.25


def duck_curve(events, n: int = N_TOTAL) -> np.ndarray:
    """Linear gain curve: min over events of a cosine dip (lead/attack, hold, release)."""
    t = dsp.timebase(n)
    env_db = np.zeros(n)
    for t0, t1, depth, _ in events:
        a0 = t0 - DUCK_LEAD - DUCK_ATTACK
        i0, i1 = max(0, int(a0 * SR)), min(n, int((t1 + DUCK_RELEASE) * SR) + 2)
        tt = t[i0:i1]
        shape = np.ones_like(tt)
        att = (tt - a0) / DUCK_ATTACK
        shape = np.where(tt < t0 - DUCK_LEAD, dsp.smoothstep(att), shape)
        rel = (tt - t1) / DUCK_RELEASE
        shape = np.where(tt > t1, 1.0 - dsp.smoothstep(rel), shape)
        env_db[i0:i1] = np.minimum(env_db[i0:i1], depth * shape)
    return dsp.db_to_amp(env_db)


def rms_detector(x: np.ndarray, ms: float) -> np.ndarray:
    """Linked RMS level (sine-calibrated) over ``ms`` -- used as the glue compressor's sidechain.
    (dsp.compressor's own rms_ms path can take sqrt of a tiny negative running mean -> NaN.)"""
    p = ndi.uniform_filter1d(np.mean(np.square(x), axis=1), max(1, dsp.n_samples(ms / 1000.0)))
    return np.sqrt(2.0 * np.maximum(p, 0.0))


def build(stems: bool = False) -> dict:
    t0 = time.perf_counter()
    res = score.render(stems=stems)
    groups, fam = (res if stems else (res, None))
    t_score = time.perf_counter() - t0
    duck = duck_curve(cues.duck_events())
    music = groups["bed"] * duck[:, None]
    for g in score.GROUPS:
        if g != "bed":
            music = music + groups[g]
    g_music = MUSIC_LUFS - dsp.lufs(music)
    music = dsp.gain(music, g_music)
    t1 = time.perf_counter()
    info: list = []
    sfx = dsp.gain(cues.render(info=info), SFX_TRIM_DB)
    t_sfx = time.perf_counter() - t1
    mixbus = dsp.highpass(music + sfx, 22.0)
    g_pre = PRE_LUFS - dsp.lufs(mixbus)
    pre = dsp.gain(mixbus, g_pre)
    glue = dsp.compressor(pre, threshold_db=-15.0, ratio=1.6, attack_ms=20.0, release_ms=250.0,
                          knee_db=8.0, sidechain=rms_detector(pre, 10.0))
    master = dsp.master(glue, target_lufs=TARGET_LUFS, ceiling_dbtp=CEILING_DBTP)
    master = dsp.fade(dsp.pad_to(master, N_TOTAL), 0.002, 0.5)
    # static gain the master applied on top of g_pre (measured on the un-limited glue bus)
    g_master = TARGET_LUFS - dsp.lufs(glue)
    g_stem = g_pre + g_master
    def ref(x):  # a pre-limiter signal at the master's static gain, aligned with the master
        return dsp.fade(dsp.pad_to(dsp.gain(dsp.dc_block(x, 15.0), g_master), N_TOTAL), 0.002, 0.5)

    out = dict(master=master, pre_ref=ref(pre), glue_ref=ref(glue),
               music=_stem(dsp.highpass(music, 22.0), g_stem), sfx=_stem(dsp.highpass(sfx, 22.0), g_stem),
               duck=duck, gate=groups["gate"], info=info, groups=groups, fam=fam,
               gains=dict(music=g_music, pre=g_pre, master=g_master, stem=g_stem),
               times=dict(score=t_score, sfx=t_sfx, total=time.perf_counter() - t0))
    return out


def _stem(x: np.ndarray, g_db: float) -> np.ndarray:
    y = dsp.gain(x, g_db)
    if dsp.true_peak_db(y) > CEILING_DBTP:
        y = dsp.limiter(y, ceiling_db=CEILING_DBTP - 0.1)
    return dsp.fade(dsp.pad_to(y, N_TOTAL), 0.002, 0.5)


def limiter_gr(ref: np.ndarray, out: np.ndarray) -> dict:
    """Gain reduction of the master dynamics: 10 ms RMS of ``out`` vs ``ref`` (where audible)."""
    w = dsp.n_samples(0.01)
    er = ndi.uniform_filter1d(np.mean(np.square(ref), axis=1), w)
    eo = ndi.uniform_filter1d(np.mean(np.square(out), axis=1), w)
    ok = er > dsp.db_to_amp(-50.0) ** 2
    gr = 10 * np.log10(np.maximum(eo[ok], 1e-20) / np.maximum(er[ok], 1e-20))
    full = np.zeros(len(er))
    full[ok] = gr
    worst = []
    g = full.copy()
    for _ in range(6):                      # the six deepest moments, >= 0.3 s apart
        i = int(np.argmin(g))
        if g[i] > -1.0:
            break
        worst.append((round(i / SR, 3), round(float(-g[i]), 1)))
        g[max(0, i - int(0.3 * SR)):i + int(0.3 * SR)] = 0.0
    return dict(max=float(-gr.min()) if gr.size else 0.0, over1=float(np.sum(gr < -1.0) / SR),
                over3=float(np.sum(gr < -3.0) / SR), worst=worst)


def write_wav_safe(path: str, x: np.ndarray, tries: int = 20) -> str:
    """Write via a temp file + atomic replace, retrying while another process (indexer,
    antivirus, a preview) briefly holds the target open."""
    tmp = path + ".tmp.wav"
    dsp.write_wav(tmp, x)
    for i in range(tries):
        try:
            os.replace(tmp, path)
            return path
        except PermissionError:
            time.sleep(0.25 * (i + 1))
    raise PermissionError(f"{path} is locked by another process; the render is in {tmp}")


def _sha(x: np.ndarray) -> str:
    q = np.round(np.clip(x, -1.0, 1.0) * (2 ** 23 - 1)).astype(np.int32)
    return hashlib.sha256(q.tobytes()).hexdigest()[:16]


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--no-review", action="store_true", help="skip audio/review.py")
    ap.add_argument("--stems", action="store_true", help="print per-family loudness of the score")
    ap.add_argument("--out", default=OUT_DIR)
    a = ap.parse_args(argv)
    r = build(stems=a.stems)
    os.makedirs(a.out, exist_ok=True)
    paths = {}
    for k in ("music", "sfx", "master"):
        name = "soundtrack.wav" if k == "master" else f"{k}.wav"
        paths[k] = write_wav_safe(os.path.join(a.out, name), r[k])
    m = r["master"]
    print(f"rendered in {r['times']['total']:.1f} s (score {r['times']['score']:.1f} s, sfx {r['times']['sfx']:.1f} s)")
    print(f"gains: music {r['gains']['music']:+.2f} dB, pre {r['gains']['pre']:+.2f} dB, "
          f"master {r['gains']['master']:+.2f} dB")
    for k in ("music", "sfx", "master"):
        x = r[k]
        print(f"  {os.path.basename(paths[k]):15s} {len(x) / SR:.3f} s  {dsp.lufs(x):6.2f} LUFS  "
              f"TP {dsp.true_peak_db(x):6.2f} dBTP  peak {dsp.peak_db(x):6.2f} dBFS  sha {_sha(x)}")
    gg = limiter_gr(r["pre_ref"], r["glue_ref"])
    gr = limiter_gr(r["glue_ref"], m)
    for name, d in (("glue compressor", gg), ("true-peak limiter", gr)):
        print(f"{name}: max gain reduction {d['max']:.1f} dB (10 ms RMS), > 1 dB for {d['over1']:.2f} s, "
              f"> 3 dB for {d['over3']:.2f} s; deepest at " + ", ".join(f"{t:.2f} s ({v} dB)" for t, v in d["worst"][:4]))
    meta = dict(gains=dict(r["gains"], sfx_trim=SFX_TRIM_DB), glue=gg, limiter=gr,
                sha={k: _sha(r[k]) for k in ("music", "sfx", "master")},
                lufs={k: dsp.lufs(r[k]) for k in ("music", "sfx", "master")})
    os.makedirs(os.path.join(HERE, "_reports"), exist_ok=True)
    with open(os.path.join(HERE, "_reports", "mix_meta.json"), "w", encoding="utf8") as fh:
        json.dump(meta, fh, indent=1)
    if a.stems and r["fam"]:
        ref = dsp.lufs(m)
        print("score families (dry, pre-gate; LU re master):")
        for grp, st in r["fam"].items():
            for f, y in st.items():
                g = score.MIX[f][0]
                print(f"  {grp:5s} {f:8s} {dsp.lufs(dsp.gain(y, g + r['gains']['music'] + r['gains']['stem'])) - ref:+6.1f}")
    if not a.no_review:
        import review
        return review.main([])
    return 0


if __name__ == "__main__":
    sys.exit(main())
