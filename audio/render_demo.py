"""
render_demo.py -- render the demo boards for the procedural audio toolkit.

Outputs (48 kHz / 24-bit stereo WAV) under ``audio/_demo/``:

* ``sfx/<name>.wav``          every SFX variant in ``sfx.DEMO_VARIANTS`` on its own
* ``sfx_board.wav``           all of them in sequence with 0.4 s gaps
* ``sfx_board_cues.json``     cue sheet for the board (name, function, kwargs, start, end)
* ``instrument_board.wav``    8-bar playful phrase in F major @ 112 BPM (marimba melody,
                              nylon pluck, round bass, soft drums, warm pad, glockenspiel),
                              mixed with buses / sends / sidechain and mastered to
                              -16 LUFS integrated, <= -1 dBTP.

Usage::

    python audio/render_demo.py            # everything
    python audio/render_demo.py --only sfx
    python audio/render_demo.py --only instruments
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from lib import dsp, instruments as ins, sfx  # noqa: E402

SR = dsp.SR
OUT = os.path.join(ROOT, "audio", "_demo")  # kept out of public/ so Remotion bundles stay small


# ==========================================================================
# (a) + (c): SFX files and board
# ==========================================================================


def render_sfx(gap: float = 0.4) -> dict:
    """Render every DEMO_VARIANTS entry to its own file and to the board (0.4 s gaps)."""
    sfx_dir = os.path.join(OUT, "sfx")
    os.makedirs(sfx_dir, exist_ok=True)
    board = dsp.Timeline()
    cues = []
    t = 0.0
    for name, fn, kw in sfx.DEMO_VARIANTS:
        y = sfx.CATALOG[fn](seed=0, **kw)
        dsp.write_wav(os.path.join(sfx_dir, f"{name}.wav"), y)
        board.add(y, t)
        d = len(y) / SR
        cues.append(dict(name=name, function=fn, kwargs=kw, start=round(t, 3), end=round(t + d, 3)))
        t += d + gap
    y = board.render()
    dsp.write_wav(os.path.join(OUT, "sfx_board.wav"), y)
    with open(os.path.join(OUT, "sfx_board_cues.json"), "w", encoding="utf8") as fh:
        json.dump(cues, fh, indent=1)
    return dict(count=len(cues), duration=len(y) / SR, peak=dsp.peak_db(y))


# ==========================================================================
# (b): instrument board -- 8 bars, F major, 112 BPM
# ==========================================================================

BPM = 112.0
SPB = 60.0 / BPM


def at(bar: int, beat: float) -> float:
    """Bar (0-based) + beat -> seconds."""
    return (bar * 4 + beat) * SPB


# (bar, beat, symbol): two chords in bars 3 and 6
PROGRESSION = [(0, 0, "Fmaj7"), (1, 0, "Dm7"), (2, 0, "Bbmaj7"), (3, 0, "C7sus4"), (3, 2, "C7"),
               (4, 0, "Fmaj7"), (5, 0, "Bb6"), (6, 0, "Gm7"), (6, 2, "C7"), (7, 0, "F6/9")]

# marimba melody: bar -> [(beat, dur_beats, note)]
MELODY = {
    0: [(0, .5, "C5"), (.5, .5, "A4"), (1, .5, "C5"), (1.5, 1, "F5"), (2.5, .5, "E5"), (3, 1, "C5")],
    1: [(0, .5, "D5"), (.5, .5, "F5"), (1, .75, "A5"), (1.75, .25, "G5"), (2, .5, "F5"), (2.5, .5, "D5"),
        (3, .5, "C5"), (3.5, .5, "A4")],
    2: [(0, .5, "Bb4"), (.5, .5, "D5"), (1, .5, "F5"), (1.5, 1, "A5"), (2.5, .5, "G5"), (3, .5, "F5"),
        (3.5, .5, "D5")],
    3: [(0, .5, "C5"), (.5, .5, "F5"), (1, 1, "G5"), (2, .5, "E5"), (2.5, .5, "G5"), (3, .5, "Bb5"),
        (3.5, .5, "G5")],
    4: [(0, .75, "A5"), (.75, .25, "F5"), (1, .5, "C5"), (1.5, .5, "F5"), (2, .5, "A5"), (2.5, 1, "C6"),
        (3.5, .5, "A5")],
    5: [(0, .5, "Bb5"), (.5, .5, "G5"), (1, .5, "D5"), (1.5, .5, "G5"), (2, 1, "F5"), (3, .5, "D5"),
        (3.5, .5, "Bb4")],
    6: [(0, .5, "A4"), (.5, .5, "Bb4"), (1, .5, "D5"), (1.5, .5, "F5"), (2, .5, "E5"), (2.5, .5, "G5"),
        (3, .5, "Bb5"), (3.5, .25, "A5"), (3.75, .25, "G5")],
    7: [(0, 3, "F5"), (0, 3, "C6")],
}

GLOCK = [(4, 0, "A6"), (4, 2.5, "C7"), (5, 0, "Bb6"), (5, 2, "F6"), (6, 1.5, "F6"), (6, 3, "Bb6"),
         (7, 0, "A6"), (7, 0, "C7")]

PLUCK_TRIADS = {"Fmaj7": ["A3", "C4", "E4"], "Dm7": ["A3", "C4", "F4"], "Bbmaj7": ["Bb3", "D4", "F4"],
                "C7sus4": ["Bb3", "C4", "F4"], "C7": ["Bb3", "C4", "E4"], "Bb6": ["Bb3", "D4", "G4"],
                "Gm7": ["Bb3", "D4", "F4"], "F6/9": ["A3", "D4", "G4"]}
PLUCK_PATTERN = [(0.5, 1), (1.5, 2), (2.0, 0), (2.5, 1), (3.5, 2)]  # (beat, triad index)

BASS = {
    0: [(0, .75, "F2"), (1.5, .5, "F2"), (2, .75, "C3"), (3.5, .5, "A2")],
    1: [(0, .75, "D2"), (1.5, .5, "D2"), (2, .75, "A2"), (3.5, .5, "C3")],
    2: [(0, .75, "Bb1"), (1.5, .5, "Bb1"), (2, .75, "F2"), (3.5, .5, "D2")],
    3: [(0, .75, "C2"), (1.5, .5, "C2"), (2, .5, "G2"), (2.5, .5, "Bb2"), (3, .5, "C3"), (3.5, .5, "E2")],
    4: [(0, .75, "F2", "E2"), (1.5, .5, "F2"), (2, .75, "C3"), (3.5, .5, "A2")],
    5: [(0, .75, "Bb1"), (1.5, .5, "Bb1"), (2, .75, "F2"), (3.5, .5, "G2")],
    6: [(0, .75, "G2"), (1.5, .5, "G2"), (2, .75, "C2"), (3, .5, "C2"), (3.5, .5, "E2")],
    7: [(0, 3, "F2", "E2")],
}


# stem gains (dB) -> melody-led balance, measured with AXO_STEMS=1:
# marimba ~-5 LU re mix, drums/bass ~-8, pluck/pad/glock/hall ~-12..-13, room ~-20
MIX_DB = dict(marimba=0.0, pluck=-3.5, glock=-1.5, pad=-4.9, bass=-7.5, drums=1.0, hall=-9.5, room=-6.0)


def chord_at(bar: int, beat: float) -> str:
    sym = PROGRESSION[0][2]
    for b, bt, s in PROGRESSION:
        if (b, bt) <= (bar, beat):
            sym = s
    return sym


def render_instrument_board() -> dict:
    """Compose, mix and master the 8-bar demo phrase."""
    r = dsp.rng(2024, "board")

    def hum(t):  # tiny deterministic timing humanization (+/- 5 ms)
        return t + r.uniform(-0.005, 0.005)

    mallets, plucks, bass_bus, pads, bells = dsp.Timeline(), dsp.Timeline(), dsp.Timeline(), dsp.Timeline(), dsp.Timeline()
    kick_bus, drums, room_send, hall_send = dsp.Timeline(), dsp.Timeline(), dsp.Timeline(), dsp.Timeline()
    seed = 0

    # ---- marimba melody
    for bar, notes in MELODY.items():
        for beat, d, note in notes:
            seed += 1
            accent = 0.82 if beat == int(beat) else 0.66
            v = float(np.clip(accent + r.uniform(-0.05, 0.05), 0, 1))
            ring = d * SPB + (1.2 if bar == 7 else 0.12)
            y = ins.marimba(note, ring, v, seed=seed, mallet="medium")
            mallets.add(y, hum(at(bar, beat)))
    # ---- glockenspiel doubling (bars 5-8)
    for bar, beat, note in GLOCK:
        seed += 1
        y = ins.glockenspiel(note, 1.6 if bar == 7 else 0.9, 0.42, seed=seed, pan=0.25)
        bells.add(y, hum(at(bar, beat)))
    # ---- nylon pluck off-beat arpeggios (bars 1-7) + final strum
    for bar in range(7):
        for beat, idx in PLUCK_PATTERN:
            seed += 1
            note = PLUCK_TRIADS[chord_at(bar, beat)][idx]
            y = ins.pluck(note, 0.75 * SPB, 0.5 + r.uniform(-0.05, 0.08), seed=seed, pan=0.35)
            plucks.add(y, hum(at(bar, beat)))
    for i, note in enumerate(PLUCK_TRIADS["F6/9"]):
        seed += 1
        plucks.add(ins.pluck(note, 2.5, 0.55, seed=seed, pan=0.35), at(7, 0) + 0.025 * i)
    # ---- round bass
    for bar, notes in BASS.items():
        for item in notes:
            beat, d, note = item[:3]
            gl = item[3] if len(item) > 3 else None
            seed += 1
            y = ins.bass(note, d * SPB * 0.92, 0.78 + r.uniform(-0.04, 0.04), seed=seed, tone=0.3,
                         glide_from=gl, glide_time=0.07)
            bass_bus.add(y, at(bar, beat))
    # ---- pad: voice-led chords, slow swells
    voicing = [53, 57, 60, 64]
    for i, (bar, beat, sym) in enumerate(PROGRESSION):
        nxt = PROGRESSION[i + 1] if i + 1 < len(PROGRESSION) else (7, 4.0, None)
        dur = at(nxt[0], nxt[1]) - at(bar, beat)
        voicing = ins.voice_lead(voicing, sym, "E3", "E5") if i else ins.voicing(ins.chord(sym, 3), "E3", "E5")
        seed += 1
        y = ins.pad(voicing, dur + 0.15, 0.55, seed=seed, attack=0.45, release=1.4 if sym != "F6/9" else 2.0,
                    cutoff=1500.0, voices=5, detune=12.0)
        pads.add(y, at(bar, beat) - 0.05)
    # ---- drums
    for bar in range(8):
        for beat in range(4):
            t0 = at(bar, beat)
            # kick: bars 3-7 on 1 and 3 (+ syncopation), final downbeat
            if (2 <= bar <= 6 and beat in (0, 2)) or (bar == 7 and beat == 0):
                kick_bus.add(ins.kick(0.85, seed=bar * 4 + beat), t0)
            if bar in (3, 5) and beat == 2:
                kick_bus.add(ins.kick(0.6, seed=99 + bar), at(bar, 2.75))
            # snaps (bars 1-2) then claps on 2 & 4
            if beat in (1, 3) and bar <= 1:
                y = ins.snap(0.55, seed=bar * 4 + beat)
                drums.add(y, hum(t0), gain_db=-4)
                room_send.add(y, hum(t0), gain_db=-10)
            if beat in (1, 3) and 2 <= bar <= 6:
                y = ins.clap(0.7, seed=bar * 4 + beat, room=0.0)
                drums.add(y, hum(t0), gain_db=-3)
                room_send.add(y, hum(t0), gain_db=-6)
            # hats: 8ths bars 1-7, open hat on the last off-beat of bars 4 and 6
            if bar <= 6:
                for off in (0.0, 0.5):
                    tt = at(bar, beat + off)
                    if off and beat == 3 and bar in (3, 5):
                        drums.add(ins.hat_open(0.5, seed=bar * 8 + beat), hum(tt), gain_db=-1)
                    else:
                        v = 0.42 if off == 0 else 0.6
                        drums.add(ins.hat_closed(v + r.uniform(-0.04, 0.04), seed=bar * 8 + beat * 2 + int(off * 2)),
                                  hum(tt), gain_db=-2)
            # shaker 16ths, bars 3-7
            if 2 <= bar <= 6:
                for k, acc in enumerate((0.35, 0.2, 0.28, 0.2)):
                    drums.add(ins.shaker(acc + 0.1, seed=bar * 16 + beat * 4 + k, length=0.08),
                              hum(at(bar, beat + k * 0.25)), gain_db=-3)
    # playful wood-block answers
    for bar, beat, note in [(1, 3.0, "G5"), (1, 3.5, "C6"), (5, 3.0, "G5"), (5, 3.25, "A5"), (5, 3.5, "C6")]:
        y = ins.woodblock(note, 0.7, seed=int(beat * 4))
        drums.add(y, at(bar, beat), gain_db=-4)
        room_send.add(y, at(bar, beat), gain_db=-8)
    # little tom fill into the last bar
    for beat, note in [(3.25, "F3"), (3.5, "D3"), (3.75, "A2")]:
        drums.add(ins.tom(note, 0.6, seed=int(beat * 4)), at(6, beat), gain_db=-6)
    # transition: reverse cymbal into the final downbeat + a soft impact
    rc = ins.reverse_cymbal(1.6, seed=3)
    drums.add(rc, at(7, 0) - 1.6, gain_db=-5)
    drums.add(ins.impact_boom(2.5, seed=1, pitch=ins.to_hz("F1") / 34.0, brightness=0.3, vel=0.55),
              at(7, 0), gain_db=-8)

    # ---- mix
    n_total = dsp.n_samples(at(7, 0) + 4.2)
    def bus(tl):
        return dsp.pad_to(tl.render(), n_total)

    mal = bus(mallets)
    plk = bus(plucks)
    bel = bus(bells)
    pad_b = bus(pads)
    bas = bus(bass_bus)
    kik = bus(kick_bus)
    drm = bus(drums)
    # bass ducks under the kick a little (classic sidechain), then gentle compression
    bas = dsp.compressor(bas, threshold_db=-30.0, ratio=3.0, attack_ms=2.0, release_ms=90.0, sidechain=kik)
    drum_bus = dsp.compressor(drm + kik, threshold_db=-20.0, ratio=2.5, attack_ms=6.0, release_ms=120.0, knee_db=6.0)
    # sends
    hall_in = 0.35 * mal + 0.3 * plk + 0.5 * bel + 0.5 * pad_b
    hall = dsp.pad_to(dsp.reverb_send(hall_in, "hall", seed=7), n_total)
    room = dsp.pad_to(dsp.reverb_send(bus(room_send), "room", seed=8), n_total)
    stems = {k: dsp.gain(v, MIX_DB[k]) for k, v in dict(
        marimba=mal, pluck=plk, glock=bel, pad=pad_b, bass=bas, drums=drum_bus, hall=hall, room=room).items()}
    music = sum(stems.values())
    if os.environ.get("AXO_STEMS"):  # diagnostics: per-stem loudness relative to the mix
        ref = dsp.lufs(music)
        for k, v in stems.items():
            print(f"  stem {k:8s} {dsp.lufs(v) - ref:+6.1f} LU re mix")
    if os.environ.get("AXO_STEMS_DIR"):  # diagnostics: dump stems (normalized to -1 dBFS)
        for k, v in dict(stems, kick=kik, drums_raw=drm).items():
            dsp.write_wav(os.path.join(os.environ["AXO_STEMS_DIR"], f"stem_{k}.wav"), dsp.normalize_peak(v, -1.0))
    music = dsp.highpass(music, 25.0)
    music = dsp.normalize_lufs(music, -18.0)
    music = dsp.compressor(music, threshold_db=-16.0, ratio=1.8, attack_ms=20.0, release_ms=180.0, knee_db=8.0)
    music = dsp.fade(dsp.trim(music, -80.0), 0.0, 0.6)
    master = dsp.master(music, target_lufs=-16.0, ceiling_dbtp=-1.0)
    master = dsp.fade(dsp.trim(master, -64.0), 0.002, 0.25)
    dsp.write_wav(os.path.join(OUT, "instrument_board.wav"), master)
    return dict(duration=len(master) / SR, lufs=dsp.lufs(master), true_peak=dsp.true_peak_db(master),
                peak=dsp.peak_db(master))


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", choices=["sfx", "instruments"], default=None)
    args = ap.parse_args(argv)
    os.makedirs(OUT, exist_ok=True)
    t0 = time.perf_counter()
    if args.only in (None, "sfx"):
        t = time.perf_counter()
        info = render_sfx()
        print(f"sfx: {info['count']} files + board ({info['duration']:.1f} s, peak {info['peak']:.1f} dBFS) "
              f"in {time.perf_counter() - t:.1f} s")
    if args.only in (None, "instruments"):
        t = time.perf_counter()
        info = render_instrument_board()
        print(f"instrument_board: {info['duration']:.1f} s, {info['lufs']:.2f} LUFS, true peak "
              f"{info['true_peak']:.2f} dBTP, sample peak {info['peak']:.2f} dBFS in {time.perf_counter() - t:.1f} s")
    print(f"done in {time.perf_counter() - t0:.1f} s -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
