"""
score.py -- the music of 《启动按钮去哪了？》 as data, plus a deterministic renderer.

Source of truth: design/STORYBOARD.md section 6 (music map) and design/concept-product.md
section 6 (motifs).  Grid: 87.0 s at 120 BPM, 4/4, F major -- 1 beat = 0.5 s = 30 frames,
bar n starts at 2(n-1) s (``bt(bar, beat)``).

Palette (audio/lib/instruments.py): kalimba (the button's own voice), marimba (the chase),
pizz / nylon / harp plucks, celesta / glockenspiel / fm_bell / vibes, a warm saw pad, a round
sub bass and a soft kit (kick, clap, hats, shaker, woodblock, rim, toms), plus a riser and a
reverse cymbal for the two big transitions.

Motifs (concept section 6)
--------------------------
play      C5 F5 A5 G5            kalimba 0.50 and 69.50 ("开·始·游·戏", ends open on the 2nd)
question  F4 G4 A4 Bb4 C5 D5 E5  nylon, 16th-triplets from 18.00, landing on E5 together with
                                 the glockenspiel E6 "？" at 18.50, which hangs to the cut
answer    F4 G4 A4 F4            fm_bell from 46.90 (the question's head in augmentation,
                                 resolving onto F as the hero becomes the colour swatch, 47.40)
resolved  C5 F5 A5 C6            marimba + glock at the 76.00 downbeat (the play motif, closed)

Groups
------
bed   sustained / rhythmic music -- mix.py ducks it under key SFX
hits  stabs, motifs and downbeats that ARE the sync points -- never ducked
solo  the notes that live inside a silence (neener 8.50, celesta 62.00); not affected by GATE
dry   like solo, with almost no reverb (the deadpan bass "dun" at 21.00)
bed and hits pass through GATE (hard cuts / silences of the map) *after* their reverb,
so no tail leaks into a silence.

``python audio/score.py`` prints an event summary per section (``--wav x.wav`` renders the
music alone).  mix.py imports ``render``.
"""
from __future__ import annotations

import argparse
import os
import sys
import zlib
from dataclasses import dataclass, field

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)
from lib import dsp, instruments as ins  # noqa: E402

SR = dsp.SR
DURATION = 87.0
BPM = 120.0
SPB = 60.0 / BPM          # 0.5 s per beat
BAR = 4 * SPB             # 2.0 s per bar


def bt(bar: int, beat: float = 1.0) -> float:
    """Bar (1-based) + beat (1-based) -> seconds, e.g. bt(12, 3) = 23.0."""
    return (bar - 1) * BAR + (beat - 1) * SPB


# ==========================================================================
# map, sync points, gate
# ==========================================================================

SECTIONS = [  # (id, name, start, end) -- STORYBOARD section 6
    ("A", "Home", 0.00, 5.00),
    ("-", "silence", 5.00, 7.75),
    ("st", "sting", 7.75, 8.75),
    ("B", "Reveal", 9.00, 13.00),
    ("C", "sneaky", 13.00, 16.00),
    ("D", "Question", 16.00, 20.50),
    ("-", "silence (dun)", 20.50, 22.50),
    ("C", "full", 22.50, 30.00),
    ("C'", "instance", 30.00, 37.00),
    ("C''", "Lab", 37.00, 42.00),
    ("E", "Map", 42.00, 50.00),
    ("-", "silence", 50.00, 52.50),
    ("F", "Workshop", 52.50, 61.00),
    ("-", "near-silence", 61.00, 63.00),
    ("G", "Return", 63.00, 69.00),
    ("A'", "Home", 69.00, 75.00),
    ("H", "World", 75.30, 80.00),
    ("I", "End card", 80.00, 87.00),
]

NOTCHES = [64.00, 64.50, 65.00, 65.50, 65.75, 66.00, 66.25, 66.50, 66.75, 67.00]

SYNC = [  # intended hits checked by review.py: (t, label, carried by: music | sfx | both)
    (5.00, "press 1 + hard cut", "sfx"), (8.00, "peek pop/boing", "sfx"), (12.00, "B downbeat", "music"),
    (18.00, "question motif", "both"), (23.00, "click 1 stab", "both"), (24.50, "click 2 stab", "both"),
    (26.00, "click 3 stab", "both"), (27.50, "click 4 stab", "both"), (30.00, "landing chord", "both"),
    (34.00, "toggle-off stab", "both"), (36.50, "cadence, lands on Lab", "both"),
    (39.00, "lands on Enter, stab", "both"), (42.00, "E Map downbeat", "music"),
    (48.00, "add marker / pin", "both"), (50.00, "press 2 + cut", "sfx"),
    (53.00, "lands in workshop", "sfx"), (59.50, "selection, F maj9", "both"),
] + [(t, f"notch {i + 1}", "both") for i, t in enumerate(NOTCHES)] + [
    (68.00, "tonic + snap_into_place", "both"), (75.00, "press 3", "sfx"), (76.00, "H downbeat", "music"),
]
PRE_HIT_GAP = 0.06   # risers / reverse cymbals stop this long before their downbeat (a breath = punch)

# music-bus gain breakpoints (cosine segments).  Cuts are 12-15 ms: dead, but click-free.
GATE = [
    (0.000, 1.0), (4.988, 1.0), (5.000, 0.0),        # hard cut at 5.00 (press 1)
    (8.950, 0.0), (9.000, 1.0),                      # B riser
    (20.485, 1.0), (20.500, 0.0),                    # cut to the empty state
    (22.450, 0.0), (22.500, 1.0),                    # C full
    (49.988, 1.0), (50.000, 0.0),                    # press 2
    (52.450, 0.0), (52.500, 1.0),                    # F Workshop
    (60.400, 1.0), (61.000, 0.0),                    # into the breath (near-silence)
    (62.950, 0.0), (63.000, 1.0),                    # G Return
    (74.650, 1.0), (74.960, 0.0),                    # nothing at 75.00 but the press
    (75.280, 0.0), (75.300, 1.0),                    # H World
    (86.000, 1.0), (86.500, 0.0), (DURATION, 0.0),   # out by 86.5
]


def gate_curve(dur: float = DURATION) -> np.ndarray:
    return dsp.breakpoints(GATE, dur, "cos")


# ==========================================================================
# events
# ==========================================================================

@dataclass
class N:
    t: float
    inst: str
    note: object = None
    dur: float = 0.25
    vel: float = 0.7
    grp: str = "bed"
    pan: float | None = None
    kw: dict = field(default_factory=dict)
    hum: float = 0.0


def n(t, inst, note=None, dur=0.25, vel=0.7, grp="bed", pan=None, hum=0.0, **kw) -> N:
    return N(float(t), inst, note, float(dur), float(vel), grp, pan, kw, hum)


def mel(inst, items, grp="bed", hum=0.0, **kw) -> list[N]:
    """[(t, note, dur, vel), ...] -> events."""
    return [n(t, inst, nt, d, v, grp=grp, hum=hum, **kw) for t, nt, d, v in items]


def pad(t, chord, dur, vel=0.4, grp="bed", **kw) -> N:
    return n(t, "pad", chord, dur, vel, grp=grp, **kw)


def mid(note, octs: int = 0) -> int:
    return int(ins.note_to_midi(note)) + 12 * octs


PLAY_RHYTHM = [0.0, 0.25, 0.5, 1.0]          # 8th, 8th, quarter, held
PLAY = ["C5", "F5", "A5", "G5"]
QUESTION = ["F4", "G4", "A4", "Bb4", "C5", "D5", "E5"]
ANSWER = ["F4", "G4", "A4", "F4"]
RESOLVED = ["C5", "F5", "A5", "C6"]

V = {  # pad voicings (bass notes are played by the bass)
    "Fadd9": ["F3", "C4", "G4", "A4"],
    "F": ["F3", "A3", "C4", "F4"],
    "Fmaj9": ["F3", "A3", "C4", "E4", "G4"],
    "F/A": ["C4", "E4", "F4", "A4"],
    "C9sus4": ["Bb3", "D4", "F4", "G4"],
    "C7": ["Bb3", "C4", "E4", "G4"],
    "Bbmaj7": ["Bb3", "D4", "F4", "A4"],
    "Bbadd9": ["Bb3", "C4", "D4", "F4"],
    "Dm7": ["A3", "C4", "D4", "F4"],
    "Gm7": ["G3", "Bb3", "D4", "F4"],
    "drone": ["F2", "C3"],
}

STAB = {  # chord: (upper voicing, bass)
    "F": (["F4", "A4", "C5"], "F2"),
    "Gm7": (["G4", "Bb4", "D5", "F5"], "G2"),
    "Am7": (["A4", "C5", "E5", "G5"], "A2"),
    "Bbmaj7": (["Bb4", "D5", "F5", "A5"], "Bb1"),
    "Fland": (["F4", "A4", "C5", "F5"], "F2"),
    "Dm7": (["D4", "F4", "A4", "C5"], "D2"),
    "C9sus4": (["Bb4", "D5", "F5", "G5"], "C2"),
    "Fcad": (["A4", "C5", "F5"], "F2"),
}


def stab(t, chord, power=0.85, ring=0.18, glock=True) -> list[N]:
    """Click stab: hard-mallet marimba chord + pizz an octave down + bass + kick (+ glock top)."""
    up, bass = STAB[chord]
    ev = []
    for k, nt in enumerate(up):
        ev.append(n(t, "marimba", nt, ring, power * 0.74 * (1.0 - 0.04 * k), grp="hits", mallet=0.85))
        ev.append(n(t, "pizz", mid(nt, -1), ring * 0.8, power * 0.62, grp="hits"))
    ev.append(n(t, "bass", bass, 0.3 + 0.4 * (ring > 0.3), power * 0.75, grp="hits", tone=0.55))
    ev.append(n(t, "kick", None, 0.0, power * 0.62, grp="hits"))
    if glock:
        ev.append(n(t, "glock", mid(up[-1], 1), 0.5, power * 0.5, grp="hits"))
    return ev


def shaker_line(t0, t1, vel=0.3, step=0.125) -> list[N]:
    acc = (1.0, 0.62, 0.82, 0.62)
    out, k, t = [], 0, t0
    while t < t1 - 1e-6:
        out.append(n(round(t, 4), "shaker", None, 0.0, vel * acc[k % 4], hum=0.003))
        t += step
        k += 1
    return out


def hats(t0, t1, vel=0.36, step=0.25) -> list[N]:
    out, k, t = [], 0, t0
    while t < t1 - 1e-6:
        out.append(n(round(t, 4), "hat", None, 0.0, vel * (0.8 if k % 2 == 0 else 1.0), hum=0.003))
        t += step
        k += 1
    return out


# ==========================================================================
# the sections
# ==========================================================================

def section_A() -> list[N]:
    """A · Home 0-5: pad F(add9), kalimba play motif at 0.50, a soft echo, then an
    anticipation C-D-E that never reaches F: the press cuts it dead at 5.00."""
    ev = [pad(0.0, "Fadd9", 4.15, 0.34, attack=1.4, release=0.8, cutoff=1150.0),
          pad(4.0, "C9sus4", 1.2, 0.34, attack=0.45, release=0.4, cutoff=1300.0)]
    ev += mel("kalimba", [(0.50 + o, nt, d, v) for o, nt, d, v in
                          zip(PLAY_RHYTHM, PLAY, [0.25, 0.25, 0.5, 1.6], [0.66, 0.62, 0.71, 0.64])], grp="hits")
    ev += [n(0.50, "marimba", "F3", 1.6, 0.30, mallet="soft")]
    ev += mel("kalimba", [(2.50 + o, nt, d, v) for o, nt, d, v in
                          zip(PLAY_RHYTHM, ["C4", "F4", "A4", "G4"], [0.25, 0.25, 0.5, 1.0], [0.45, 0.43, 0.48, 0.45])])
    ev += [n(4.0, "bass", "C2", 0.95, 0.38, tone=0.2)]
    ev += mel("kalimba", [(4.25, "C5", 0.25, 0.46), (4.50, "D5", 0.25, 0.54), (4.75, "E5", 0.6, 0.62)])
    ev += mel("pizz", [(4.25, "C4", 0.15, 0.40), (4.50, "D4", 0.15, 0.46), (4.75, "E4", 0.3, 0.52)])
    return ev


def section_sting() -> list[N]:
    """Peek sting: pizz 'neener' G5-E5 at 8.50 (inside the silence -> solo)."""
    return (mel("pizz", [(8.50, "G5", 0.18, 0.62), (8.75, "E5", 0.30, 0.58)], grp="solo")
            + mel("kalimba", [(8.50, "G5", 0.20, 0.35), (8.75, "E5", 0.40, 0.32)], grp="solo"))


def section_B() -> list[N]:
    """B · Reveal 9-13: riser F3->F5 over a C9sus4 swell and a marimba pedal crescendo;
    12.00 downbeat = glock + celesta arpeggio + pad swell on F(add9)."""
    ev = [n(9.0, "riser", None, 3.0 - PRE_HIT_GAP, 0.75, start_note="F3", end_note="F5"),
          pad(9.0, "C9sus4", 3.0, 0.42, attack=2.4, release=0.35, cutoff=1700.0)]
    for i in range(8):
        t, v = 10.0 + 0.25 * i, 0.30 + 0.045 * i
        ev += [n(t, "marimba", "C4", 0.1, v, hum=0.003), n(t, "marimba", "C5", 0.1, v * 0.8, hum=0.003)]
    ev += [n(12.0, "bass", "F2", 0.9, 0.78, grp="hits", tone=0.3),
           n(12.0, "kick", None, 0.0, 0.55, grp="hits"),
           n(12.0, "marimba", "F3", 1.0, 0.65, grp="hits"),
           n(12.0, "marimba", "C4", 1.0, 0.60, grp="hits"),
           n(12.0, "glock", "F6", 1.4, 0.75, grp="hits"),
           n(12.625, "glock", "C7", 1.2, 0.50, grp="hits")]
    ev += mel("celesta", [(12.0 + 0.125 * i, nt, 1.0, v) for i, (nt, v) in
                          enumerate(zip(["F5", "A5", "C6", "F6", "G6", "A6"], [0.62, 0.58, 0.58, 0.56, 0.52, 0.50]))],
              grp="hits")
    ev += [pad(12.0, "Fadd9", 0.8, 0.55, attack=0.25, release=0.5, cutoff=2600.0)]
    return ev


def section_C_sneaky() -> list[N]:
    """C sneaky 13-16: staccato bass walking up, off-beat marimba dyads, shaker; thins at 15.
    Harmony C7 (under the C6-E6-G6 bounce triad SFX) -> F -> Bb -> C7."""
    ev = mel("bass", [(13.0, "C2", 0.2, 0.70), (13.5, "E2", 0.2, 0.60), (14.0, "F2", 0.2, 0.70),
                      (14.5, "A2", 0.2, 0.60), (15.0, "Bb2", 0.2, 0.62), (15.5, "C3", 0.2, 0.58)], tone=0.45)
    for t, dyad in [(13.25, ["G4", "Bb4"]), (13.75, ["G4", "Bb4"]), (14.25, ["A4", "C5"]),
                    (14.75, ["A4", "C5"]), (15.25, ["Bb4", "D5"]), (15.75, ["Bb4", "E5"])]:
        ev += [n(t, "marimba", nt, 0.09, 0.55 - 0.05 * k, mallet=0.7, hum=0.003) for k, nt in enumerate(dyad)]
    ev += shaker_line(13.0, 15.0, vel=0.30)
    return ev


def section_D() -> list[N]:
    """D · Question 16-20.5: soft pad, pizz 8ths under the typing; 18.00 the question run
    (16th-triplets) lands on E5 with the glock E6 "？" at 18.50, left hanging; loading pizz."""
    ev = [pad(16.0, "Fadd9", 4.6, 0.30, attack=0.9, release=0.3, cutoff=1050.0)]
    pat = ["F3", "C4", "A3", "C4"] * 2 + ["F3", "D4", "Bb3", "D4"] * 2
    ev += [n(16.0 + 0.25 * i, "pizz", nt, 0.14, 0.50 if i % 2 == 0 else 0.42, hum=0.003) for i, nt in enumerate(pat)]
    for i, nt in enumerate(QUESTION):
        ev.append(n(18.0 + i / 12.0, "nylon", nt, 0.35 if i < 6 else 1.4,
                    0.68 - 0.012 * i + (0.08 if i == 0 else 0.0), grp="hits"))
    ev += [n(18.0, "bass", "F2", 1.2, 0.52, grp="hits", tone=0.25),
           n(18.0, "marimba", "F3", 1.0, 0.50, grp="hits", mallet="soft"),
           n(18.5, "glock", "E6", 1.95, 0.74, grp="hits")]
    ev += mel("pizz", [(19.5 + 0.25 * i, nt, 0.14, 0.36) for i, nt in enumerate(["C4", "E4", "G4", "E4"])])
    return ev


def section_dun() -> list[N]:
    """Silence 20.5-22.5: one deadpan bass 'dun' at 21.00 (solo)."""
    return [n(21.0, "bass", "F2", 0.30, 0.50, grp="dry", tone=0.45),
            n(21.0, "marimba", "F2", 0.45, 0.48, grp="dry", mallet="soft")]


CYCLES = [(23.0, "F"), (24.5, "Gm7"), (26.0, "Am7"), (27.5, "Bbmaj7")]   # 3-beat cycles = the clicks
OSTINATO = {"F": ["C5", "F5", "A4", "C5", "D5"], "Gm7": ["D5", "G5", "Bb4", "D5", "E5"],
            "Am7": ["E5", "A5", "C5", "E5", "F5"], "Bbmaj7": ["F5", "Bb5", "D5", "F5", "G5"]}
BASS_C = {"F": [(0.75, "C3"), (1.25, "F#2")], "Gm7": [(0.75, "D3"), (1.25, "G#2")],
          "Am7": [(0.75, "E3"), (1.25, "A1")], "Bbmaj7": [(0.75, "F2"), (1.25, "B1")]}


def section_C_full() -> list[N]:
    """C full 22.5-30: the chase in 3-beat cycles locked to the clicks (23.0/24.5/26.0/27.5),
    a stab on every click, I-ii-iii-IV rising, a layer per miss; turnaround into 30.0."""
    ev = [n(22.5, "bass", "C3", 0.2, 0.55, tone=0.4)]
    ev += mel("marimba", [(22.625, "C5", 0.08, 0.50), (22.75, "D5", 0.08, 0.56), (22.875, "E5", 0.08, 0.62)], mallet=0.7)
    for k, (c, ch) in enumerate(CYCLES):
        ev += stab(c, ch, power=0.80 + 0.05 * k)
        ev += [n(c + 0.25 * (i + 1), "marimba", nt, 0.12, (0.56, 0.54, 0.62, 0.54, 0.46)[i], mallet=0.65, hum=0.004)
               for i, nt in enumerate(OSTINATO[ch])]
        ev += [n(c + off, "bass", nt, 0.2, 0.62 if off < 1.0 else 0.45, tone=0.45, hum=0.003) for off, nt in BASS_C[ch]]
        if k >= 1:   # + kick on the and-of-2, woodblock answer
            ev += [n(c + 0.75, "kick", None, 0.0, 0.58),
                   n(c + 1.25, "woodblock", "C6" if k % 2 else "G5", 0.0, 0.50, hum=0.003)]
        if k >= 2:   # + clap on 3, hats on the off-8ths
            ev += [n(c + 1.0, "clap", None, 0.0, 0.60)]
            ev += [n(c + off, "hat", None, 0.0, 0.42, hum=0.003) for off in (0.25, 0.75, 1.25)]
        if k >= 3:   # + shaker 16ths, hats on every 8th
            ev += shaker_line(c, c + 1.5, vel=0.30)
            ev += [n(c + off, "hat", None, 0.0, 0.32, hum=0.003) for off in (0.5, 1.0)]
    # turnaround 29.0-30.0: C7sus4 -> run -> landing
    ev += [n(29.0, "bass", "C2", 0.4, 0.75, tone=0.45), n(29.0, "kick", None, 0.0, 0.65),
           n(29.0, "marimba", "C5", 0.15, 0.62, mallet=0.7), n(29.0, "marimba", "F5", 0.15, 0.58, mallet=0.7),
           n(29.25, "marimba", "G5", 0.12, 0.58, mallet=0.7), n(29.5, "bass", "C3", 0.2, 0.60, tone=0.45),
           n(29.5, "clap", None, 0.0, 0.55)]
    ev += mel("marimba", [(29.5, "C5", 0.08, 0.55), (29.625, "D5", 0.08, 0.60), (29.75, "E5", 0.08, 0.66),
                          (29.875, "G5", 0.08, 0.72)], mallet=0.75)
    ev += [n(t, "tom", nt, 0.0, v) for t, nt, v in
           [(29.5, "F3", 0.45), (29.625, "D3", 0.50), (29.75, "C3", 0.55), (29.875, "A2", 0.60)]]
    ev += shaker_line(29.0, 30.0, vel=0.30)
    return ev


def section_C_instance() -> list[N]:
    """C' instance 30-37: landing chord 30.0; thin groove (marimba plays the play motif,
    pizz, shaker); one long held note 32.6-33.4; stab 34.0; glock F6 36.0, A6 + cadence 36.5."""
    ev = stab(30.0, "Fland", power=0.88, ring=0.5)
    ev += mel("marimba", [(30.50, "C5", 0.12, 0.60), (30.75, "F5", 0.12, 0.58), (31.00, "A5", 0.20, 0.64),
                          (31.25, "G5", 0.12, 0.56), (31.50, "F5", 0.12, 0.56), (31.75, "D5", 0.12, 0.54),
                          (32.00, "Bb4", 0.12, 0.56), (32.00, "D5", 0.12, 0.50), (32.25, "F5", 0.12, 0.52)],
              mallet=0.6, hum=0.003)
    ev += mel("pizz", [(30.5, "F3", 0.14, 0.50), (31.0, "D3", 0.14, 0.50), (31.25, "A3", 0.14, 0.42),
                       (31.5, "F3", 0.14, 0.46), (31.75, "A3", 0.14, 0.42), (32.0, "Bb3", 0.14, 0.50),
                       (32.25, "F3", 0.14, 0.44)], hum=0.003)
    ev += [n(31.0, "bass", "D2", 0.45, 0.55, tone=0.3), n(32.0, "bass", "Bb1", 0.5, 0.55, tone=0.3)]
    ev += shaker_line(30.5, 32.5, vel=0.30)
    # the long held note (the twin just sits there)
    ev += [n(32.6, "vibes", "C5", 0.8, 0.55, tremolo=0.35),
           pad(32.6, ["G3", "C4"], 0.8, 0.30, attack=0.25, release=0.25, cutoff=900.0)]
    ev += stab(34.0, "Dm7", power=0.88)
    ev += mel("marimba", [(34.25, "F5", 0.12, 0.56), (34.50, "A5", 0.12, 0.60), (34.75, "D5", 0.12, 0.54),
                          (35.00, "F5", 0.12, 0.58), (35.25, "Bb5", 0.12, 0.60), (35.50, "D5", 0.12, 0.54),
                          (35.75, "F5", 0.12, 0.56)], mallet=0.65, hum=0.003)
    ev += mel("pizz", [(34.5, "A3", 0.14, 0.48), (35.0, "Bb3", 0.14, 0.50), (35.5, "F3", 0.14, 0.46)], hum=0.003)
    ev += [n(35.0, "bass", "Bb1", 0.45, 0.60, tone=0.35)]
    ev += shaker_line(34.0, 36.0, vel=0.30)
    ev += [n(36.0, "bass", "C2", 0.45, 0.62, tone=0.35),
           n(36.0, "marimba", "Bb4", 0.2, 0.55, mallet=0.6), n(36.0, "marimba", "F5", 0.2, 0.55, mallet=0.6),
           n(36.0, "glock", "F6", 1.0, 0.72, grp="hits")]
    ev += stab(36.5, "Fcad", power=0.85, ring=0.5, glock=False) + [n(36.5, "glock", "A6", 1.2, 0.78, grp="hits")]
    return ev


def section_C_lab() -> list[N]:
    """C'' Lab 37-42: light groove; a run into the 39.0 stab (lands on 进入); riser C3->C5
    over a C9sus4 swell through the dive to the 42.0 downbeat."""
    ev = mel("marimba", [(37.0, "F4", 0.12, 0.50), (37.25, "C5", 0.12, 0.46), (37.5, "A4", 0.12, 0.48),
                         (37.75, "C5", 0.12, 0.46), (38.0, "Bb4", 0.12, 0.50), (38.25, "D5", 0.12, 0.46),
                         (38.5, "F5", 0.12, 0.50), (38.625, "G5", 0.08, 0.52), (38.75, "A5", 0.08, 0.56),
                         (38.875, "Bb5", 0.08, 0.60)], mallet=0.6, hum=0.003)
    ev += [n(37.0, "bass", "F2", 0.4, 0.55, tone=0.3), n(38.0, "bass", "Bb1", 0.4, 0.55, tone=0.3),
           n(38.5, "bass", "C2", 0.3, 0.50, tone=0.3),
           n(37.0, "kick", None, 0.0, 0.50), n(38.0, "kick", None, 0.0, 0.50)]
    ev += hats(37.0, 39.0, vel=0.32) + shaker_line(37.0, 39.0, vel=0.26)
    ev += [pad(37.0, "F", 1.1, 0.30, attack=0.4, release=0.5, cutoff=1300.0),
           pad(38.0, "Bbadd9", 1.0, 0.30, attack=0.3, release=0.3, cutoff=1300.0)]
    ev += stab(39.0, "C9sus4", power=0.85)
    ev += [n(39.0, "riser", None, 3.0 - PRE_HIT_GAP, 0.70, start_note="C3", end_note="C5"),
           pad(39.0, "C9sus4", 3.0, 0.40, attack=2.2, release=0.3, cutoff=1800.0)]
    return ev


KAL_ARPS = [  # E Map kalimba 8ths: (start, notes, vel)
    (42.0, ["Bb4", "D5", "F5", "A5", "C6", "A5", "F5", "D5", "Bb4", "D5", "F5", "A5", "F5", "D5", "C5", "D5"], 0.52),
    (44.0, ["A4", "C5", "F5", "G5", "A5", "G5", "F5", "C5", "A4", "C5"], 0.50),        # rests 45.25-46.0
    (46.0, ["Bb4", "D5", "F5", "D5", "Bb4", "D5", "F5", "G5"], 0.40),                  # under typing / answer
    (48.0, ["F5", "A5", "C6", "A5"], 0.46),
]


def section_E() -> list[N]:
    """E · Map 42-50: half-time; pad Bbmaj7 -> F/A -> Bbmaj7 -> C9sus4 -> F(add9); kalimba arps,
    shaker, rim; answer motif on fm_bell at 46.90; F at the 48.00 pin; thins to the 50.0 cut."""
    ev = [n(42.0, "kick", None, 0.0, 0.60, grp="hits"), n(42.0, "bass", "Bb1", 0.8, 0.58, grp="hits", tone=0.25),
          n(42.0, "marimba", "Bb2", 1.2, 0.55, grp="hits", mallet="soft"),
          n(42.0, "marimba", "F3", 1.2, 0.50, grp="hits", mallet="soft"),
          n(42.0, "celesta", "F6", 1.2, 0.42, grp="hits")]
    ev += [pad(42.0, "Bbmaj7", 2.1, 0.29, attack=0.12, release=0.6, cutoff=1300.0),
           pad(44.0, "F/A", 2.1, 0.28, attack=0.5, release=0.6, cutoff=1200.0),
           pad(46.0, "Bbmaj7", 1.1, 0.28, attack=0.4, release=0.4, cutoff=1200.0),
           pad(47.0, "C9sus4", 1.1, 0.28, attack=0.3, release=0.4, cutoff=1200.0),
           pad(48.0, "Fadd9", 2.2, 0.28, attack=0.15, release=0.5, cutoff=1200.0)]
    for t0, notes, v in KAL_ARPS:
        ev += [n(t0 + 0.25 * i, "kalimba", nt, 0.3, 0.72 * v * (1.0 if i % 2 == 0 else 0.84), hum=0.004)
               for i, nt in enumerate(notes)]
    ev += [n(t, "kick", None, 0.0, v) for t, v in [(43.5, 0.45), (44.0, 0.58), (45.5, 0.45), (46.0, 0.55), (47.5, 0.45)]]
    ev += [n(t, "rim", None, 0.0, 0.45, hum=0.003) for t in (43.0, 45.0, 47.0)]
    ev += shaker_line(42.0, 48.5, vel=0.28, step=0.25)
    ev += mel("bass", [(43.5, "F2", 0.3, 0.50), (44.0, "A1", 0.7, 0.55), (45.5, "C2", 0.3, 0.50),
                       (46.0, "Bb1", 0.5, 0.55), (47.0, "C2", 0.5, 0.55)], tone=0.25)
    ev += mel("fm_bell", [(46.9 + i / 6.0, nt, 0.3 if i < 3 else 1.6, v) for i, (nt, v) in
                          enumerate(zip(ANSWER, [0.64, 0.62, 0.64, 0.68]))], grp="hits")
    ev += [n(48.0, "kick", None, 0.0, 0.56, grp="hits"), n(48.0, "bass", "F2", 0.8, 0.58, grp="hits", tone=0.25),
           n(48.0, "marimba", "F3", 1.2, 0.50, grp="hits", mallet="soft"),
           n(48.0, "marimba", "C4", 1.2, 0.46, grp="hits", mallet="soft")]
    return ev


def section_F() -> list[N]:
    """F · Workshop 52.5-61: low drone F2+C3, the play motif on celesta in augmentation while
    the model is generated, staccato bass with the thuds (57.0/57.5), held F maj9 at 59.50."""
    ev = [pad(52.5, "drone", 7.2, 0.50, attack=1.6, release=0.8, cutoff=650.0, detune=10.0),
          pad(54.5, ["F3", "C4", "G4"], 5.0, 0.26, attack=1.5, release=0.6, cutoff=900.0)]
    ev += mel("celesta", [(54.5, "C6", 0.9, 0.46), (55.0, "F6", 0.9, 0.46), (55.5, "A6", 0.9, 0.50),
                          (56.0, "G6", 1.4, 0.46)])
    ev += [n(57.0, "bass", "C2", 0.18, 0.85, grp="hits", tone=0.55),
           n(57.0, "marimba", "C3", 0.2, 0.60, grp="hits", mallet="soft"),
           n(57.5, "bass", "F1", 0.25, 0.90, grp="hits", tone=0.60),
           n(57.5, "marimba", "F2", 0.25, 0.62, grp="hits", mallet="soft")]
    ev += mel("celesta", [(58.0, "A5", 0.5, 0.36), (58.5, "C6", 0.5, 0.40), (59.0, "E6", 0.5, 0.44)])
    ev += [n(59.5 + 0.018 * k, "celesta", nt, 1.4, 0.55, grp="hits")
           for k, nt in enumerate(["F5", "A5", "C6", "E6", "G6"])]
    ev += [n(59.5, "marimba", "F3", 1.2, 0.50, grp="hits", mallet="soft"),
           n(59.5, "bass", "F2", 1.4, 0.55, grp="hits", tone=0.15),
           pad(59.5, "Fmaj9", 1.4, 0.45, attack=0.25, release=0.8, cutoff=1600.0)]
    return ev


def section_breath() -> list[N]:
    """Near-silence 61-63: a single celesta C6 at 62.00 (solo)."""
    return [n(62.0, "celesta", "C6", 1.5, 0.55, grp="solo")]


def section_G() -> list[N]:
    """G · Return 63-69: the marimba climbs one note per notch F4..A5 (64.00-67.00) over a
    rising bass (F2 G2 Bb2 C3), kick on the downbeats, tom fill + reverse cymbal; 68.00 tonic."""
    ev = [pad(63.0, "Fadd9", 1.05, 0.32, attack=0.6, release=0.4, cutoff=1100.0),
          n(63.0, "bass", "F2", 0.9, 0.40, tone=0.2)]
    climb = ["F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5", "G5", "A5"]
    for i, (t, nt) in enumerate(zip(NOTCHES, climb)):
        ev += [n(t, "marimba", nt, 0.45, 0.62 + 0.025 * i, grp="hits", mallet=0.72),
               n(t, "kalimba", mid(nt, 1), 0.3, 0.30)]
    for t, ch, d, b in [(64.0, "F", 1.0, "F2"), (65.0, "Gm7", 0.5, "G2"), (65.5, "Bbmaj7", 1.0, "Bb2"),
                        (66.5, "C9sus4", 1.0, "C3"), (67.5, "C7", 0.5, "C3")]:
        ev += [pad(t, ch, d, 0.34, attack=0.12, release=0.25, cutoff=1500.0 + 300.0 * (t - 64.0)),
               n(t, "bass", b, d * 0.9, 0.50, tone=0.35)]
    ev += [n(t, "kick", None, 0.0, v) for t, v in [(64.0, 0.62), (65.0, 0.44), (66.0, 0.62), (67.0, 0.50)]]
    ev += [n(t, "tom", nt, 0.0, v) for t, nt, v in
           [(67.5, "F3", 0.48), (67.625, "D3", 0.52), (67.75, "C3", 0.56), (67.875, "A2", 0.60)]]
    ev += [n(67.0, "rev_cym", None, 1.0 - PRE_HIT_GAP, 0.40)]
    ev += [n(68.0, "marimba", nt, 1.2, 0.70 - 0.03 * k, grp="hits", mallet=0.8) for k, nt in enumerate(["F4", "A4", "C5", "F5"])]
    ev += [n(68.0, "bass", "F2", 1.8, 0.64, grp="hits", tone=0.35), n(68.0, "kick", None, 0.0, 0.62, grp="hits"),
           n(68.0, "glock", "F6", 1.6, 0.70, grp="hits"), n(68.0, "celesta", "A6", 1.4, 0.50, grp="hits"),
           pad(68.0, "Fadd9", 1.2, 0.45, attack=0.15, release=1.0, cutoff=1700.0)]
    return ev


def section_A2() -> list[N]:
    """A' · Home 69-75: the play motif again at 69.50, an echo, pad -> Bb/C sus; at 74.00 the
    motif starts once more and stops on A -- the press (75.00) has the floor alone."""
    ev = [pad(69.0, "Fadd9", 3.6, 0.34, attack=0.9, release=1.0, cutoff=1100.0)]
    ev += mel("kalimba", [(69.50 + o, nt, d, v) for o, nt, d, v in
                          zip(PLAY_RHYTHM, PLAY, [0.25, 0.25, 0.5, 1.6], [0.66, 0.62, 0.71, 0.64])], grp="hits")
    ev += [n(69.5, "marimba", "F3", 1.6, 0.30, mallet="soft")]
    ev += mel("kalimba", [(71.50 + o, nt, d, v) for o, nt, d, v in
                          zip(PLAY_RHYTHM, ["C4", "F4", "A4", "G4"], [0.25, 0.25, 0.5, 1.0], [0.48, 0.46, 0.52, 0.48])])
    ev += [pad(72.5, "C9sus4", 2.6, 0.40, attack=1.0, release=0.5, cutoff=1250.0),
           n(72.5, "bass", "C2", 2.3, 0.36, tone=0.15)]
    ev += mel("kalimba", [(74.00, "C5", 0.25, 0.50), (74.25, "F5", 0.25, 0.52), (74.50, "A5", 0.6, 0.56)])
    return ev


THEME = [  # H World melody (marimba, hits): the resolved motif, then its consequent
    (76.00, "C5", 0.25, 0.78), (76.25, "F5", 0.25, 0.76), (76.50, "A5", 0.50, 0.80), (77.00, "C6", 0.75, 0.80),
    (77.75, "Bb5", 0.25, 0.72), (78.00, "A5", 0.50, 0.80), (78.50, "F5", 0.25, 0.74), (78.75, "G5", 0.25, 0.74),
    (79.00, "A5", 0.50, 0.80), (79.50, "G5", 0.50, 0.76), (80.00, "F5", 1.60, 0.80),
]
H_CHORDS = [(76.0, "Fadd9", 1.0, "F2"), (77.0, "Dm7", 1.0, "D2"), (78.0, "Bbmaj7", 1.0, "Bb1"),
            (79.0, "C9sus4", 0.5, "C2"), (79.5, "C7", 0.5, "C2")]
H_CELESTA = {"Fadd9": ["F6", "A6", "C7", "A6"], "Dm7": ["F6", "A6", "D7", "A6"], "Bbmaj7": ["F6", "Bb6", "D7", "Bb6"],
             "C9sus4": ["F6", "G6"], "C7": ["E6", "G6"]}
H_NYLON = {"Fadd9": ["F3", "C4", "A3", "C4"], "Dm7": ["D3", "A3", "F3", "A3"], "Bbmaj7": ["Bb2", "F3", "D3", "F3"],
           "C9sus4": ["C3", "G3"], "C7": ["C3", "E3"]}


def section_H() -> list[N]:
    """H · World 75.3-80: reverse cymbal + harp glissando into the 76.00 downbeat; full theme:
    marimba + glock + celesta + pad + bass + soft drums, resolved motif C5 F5 A5 C6."""
    ev = [n(75.3, "rev_cym", None, 0.7 - PRE_HIT_GAP, 0.22)]
    scale = ["F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5", "G5", "A5", "Bb5", "C6", "D6", "E6", "F6"]
    ev += [n(75.52 + 0.025 * i, "harp", nt, 0.15, 0.30 + 0.008 * i) for i, nt in enumerate(scale)]
    ev += [n(76.0, "kick", None, 0.0, 0.64, grp="hits"), n(76.0, "bass", "F2", 0.7, 0.64, grp="hits", tone=0.35),
           n(76.0, "hat_open", None, 0.0, 0.70, grp="hits", decay=1.2),
           n(76.0, "marimba", "F3", 1.0, 0.60, grp="hits", mallet="soft")]
    ev += mel("marimba", THEME, grp="hits", mallet=0.65)
    ev += mel("glock", [(76.00, "C6", 0.6, 0.55), (76.25, "F6", 0.6, 0.52), (76.50, "A6", 0.8, 0.56),
                        (77.00, "C7", 1.0, 0.58), (78.00, "A6", 0.8, 0.46), (79.00, "A6", 0.6, 0.44),
                        (79.50, "G6", 0.6, 0.42), (80.00, "F6", 1.6, 0.48)], grp="hits")
    for t, ch, d, b in H_CHORDS:
        ev.append(pad(t, ch, d, 0.42, attack=0.1 if t == 76.0 else 0.15, release=0.3, cutoff=1900.0))
        cel, nyl = H_CELESTA[ch], H_NYLON[ch]
        ev += [n(t + 0.25 * i, "celesta", nt, 0.4, 0.30, hum=0.003) for i, nt in enumerate(cel)]
        ev += [n(t + 0.25 * i, "nylon", nt, 0.3, 0.44, hum=0.003) for i, nt in enumerate(nyl)]
    ev += mel("bass", [(76.75, "C3", 0.2, 0.60), (77.0, "D2", 0.6, 0.70), (77.75, "A2", 0.2, 0.60),
                       (78.0, "Bb1", 0.6, 0.72), (78.75, "F2", 0.2, 0.60), (79.0, "C2", 0.45, 0.70),
                       (79.5, "C2", 0.2, 0.60), (79.75, "E2", 0.2, 0.62)], tone=0.35)
    ev += [n(t, "kick", None, 0.0, 0.62) for t in (77.0, 78.0, 79.0)]
    ev += [n(t, "clap", None, 0.0, 0.50) for t in (76.5, 77.5, 78.5, 79.5)]
    ev += hats(76.0, 80.0, vel=0.34, step=0.25) + shaker_line(76.0, 80.0, vel=0.27)
    ev += [n(79.75, "hat_open", None, 0.0, 0.40, decay=0.35)]
    return ev


def section_I() -> list[N]:
    """I · End card 80-86.5: the theme thins to pad + celesta; cadence Bb -> C -> F (84.00) with
    the resolved motif once more on celesta; out by 86.5 (GATE)."""
    ev = [pad(80.0, "Fadd9", 2.1, 0.38, attack=0.2, release=0.6, cutoff=1300.0),
          pad(82.0, "Bbadd9", 1.05, 0.38, attack=0.3, release=0.4, cutoff=1200.0),
          pad(83.0, "C9sus4", 0.55, 0.38, attack=0.25, release=0.3, cutoff=1200.0),
          pad(83.5, "C7", 0.55, 0.36, attack=0.2, release=0.3, cutoff=1200.0),
          pad(84.0, "Fadd9", 2.3, 0.36, attack=0.3, release=0.3, cutoff=1100.0)]
    ev += mel("bass", [(80.0, "F2", 0.9, 0.42), (81.0, "C2", 0.9, 0.36), (82.0, "Bb1", 0.9, 0.40),
                       (83.0, "C2", 0.9, 0.40), (84.0, "F2", 2.0, 0.40)], tone=0.15)
    arp = ["F5", "A5", "C6", "F6", "A5", "C6", "F6", "C6"]
    ev += [n(80.0 + 0.25 * i, "celesta", nt, 0.6, 0.36 - 0.02 * i, hum=0.003) for i, nt in enumerate(arp)]
    ev += mel("celesta", [(82.0, "D6", 0.9, 0.38), (83.0, "G5", 0.45, 0.36), (83.5, "E6", 0.45, 0.38)])
    ev += mel("celesta", [(84.0 + o, mid(nt, 1), d, v) for o, nt, d, v in
                          zip(PLAY_RHYTHM, RESOLVED, [0.3, 0.3, 0.6, 1.3], [0.50, 0.50, 0.55, 0.52])])
    ev += [n(84.0, "marimba", "F3", 1.5, 0.40, mallet="soft")]
    return ev


def build() -> list[N]:
    ev = []
    for fn in (section_A, section_sting, section_B, section_C_sneaky, section_D, section_dun, section_C_full,
               section_C_instance, section_C_lab, section_E, section_F, section_breath, section_G, section_A2,
               section_H, section_I):
        ev += fn()
    return sorted(ev, key=lambda e: (e.t, e.inst, str(e.note)))


EVENTS = build()

# ==========================================================================
# render
# ==========================================================================

FAMILY = {"marimba": "mallets", "kalimba": "kalimba", "pizz": "plucks", "nylon": "plucks", "harp": "plucks",
          "glock": "bells", "celesta": "bells", "fm_bell": "bells", "vibes": "bells", "pad": "pad",
          "bass": "bass", "kick": "kick", "clap": "drums", "hat": "drums", "hat_open": "drums",
          "shaker": "drums", "woodblock": "drums", "rim": "drums", "tom": "drums",
          "riser": "fx", "rev_cym": "fx"}

MIX = {  # family: (gain dB, hall send, room send)
    "mallets": (0.0, 0.30, 0.10),
    "kalimba": (0.0, 0.40, 0.05),
    "plucks": (-1.0, 0.35, 0.08),
    "bells": (-3.0, 0.55, 0.00),
    "pad": (-4.0, 0.40, 0.00),
    "bass": (-7.0, 0.00, 0.00),
    "kick": (-1.0, 0.00, 0.06),
    "drums": (-4.0, 0.06, 0.30),
    "fx": (-7.0, 0.20, 0.00),
}
HALL_DB, ROOM_DB = -6.0, -9.0
GROUPS = ("bed", "hits", "solo", "dry")
GROUP_SEND = {"bed": 1.0, "hits": 1.0, "solo": 0.5, "dry": 0.15}   # notes inside silences stay drier
GATED = ("bed", "hits")


def _seed(ev: N) -> int:
    return zlib.crc32(f"{ev.inst}|{ev.t:.4f}|{ev.note}".encode()) & 0x7FFF


def _voice(ev: N, seed: int, vel: float) -> np.ndarray:
    k = dict(ev.kw)
    i, nt, d = ev.inst, ev.note, ev.dur
    p = {} if ev.pan is None else {"pan": ev.pan}
    if i == "marimba":
        return ins.marimba(nt, d, vel, seed=seed, mallet=k.pop("mallet", "medium"), **p, **k)
    if i == "kalimba":
        return ins.kalimba(nt, d, vel, seed=seed, **p, **k)
    if i in ("pizz", "nylon", "harp"):
        return ins.pluck(nt, d, vel, seed=seed, kind=i, **p, **k)
    if i == "glock":
        return ins.glockenspiel(nt, d, vel, seed=seed, **p, **k)
    if i == "celesta":
        return ins.celesta(nt, d, vel, seed=seed, **p, **k)
    if i == "fm_bell":
        return ins.fm_bell(nt, d, vel, seed=seed, **p, **k)
    if i == "vibes":
        return ins.soft_mallet(nt, d, vel, seed=seed, **p, **k)
    if i == "pad":
        notes = V[nt] if isinstance(nt, str) else list(nt)
        return ins.pad(notes, d, vel, seed=seed, **k)
    if i == "bass":
        return ins.bass(nt, d, vel, seed=seed, **p, **k)
    if i == "kick":
        return ins.kick(vel, seed=seed, **k)
    if i == "clap":
        return ins.clap(vel, seed=seed, room=k.pop("room", 0.0), **k)
    if i == "hat":
        return ins.hat_closed(vel, seed=seed, **k)
    if i == "hat_open":
        return ins.hat_open(vel, seed=seed, **k)
    if i == "shaker":
        return ins.shaker(vel, seed=seed, length=k.pop("length", 0.08), **p, **k)
    if i == "woodblock":
        return ins.woodblock(nt, vel, seed=seed, **p, **k)
    if i == "rim":
        return ins.rim(vel, seed=seed, **k)
    if i == "tom":
        return ins.tom(nt, vel, seed=seed, **p, **k)
    if i == "riser":
        return ins.riser(d, seed=seed, vel=vel, **k)
    if i == "rev_cym":
        return ins.reverse_cymbal(d, seed=seed, vel=vel, **k)
    raise ValueError(f"unknown instrument {i!r}")


def _mix_group(stems: dict, n: int, send: float = 1.0) -> np.ndarray:
    stems = dict(stems)
    if "bass" in stems and "kick" in stems:  # light sidechain: bass makes room for the kick
        stems["bass"] = dsp.compressor(stems["bass"], threshold_db=-16.0, ratio=2.0, attack_ms=2.0,
                                       release_ms=80.0, sidechain=stems["kick"])
    dry, hall, room = np.zeros((n, 2)), np.zeros((n, 2)), np.zeros((n, 2))
    for fam in sorted(stems):
        g, hs, rs = MIX[fam]
        y = stems[fam] * dsp.db_to_amp(g)
        dry += y
        if hs:
            hall += hs * send * y
        if rs:
            room += rs * send * y
    out = dry
    if np.any(hall):
        out = out + dsp.db_to_amp(HALL_DB) * dsp.pad_to(dsp.reverb_send(hall, "hall", seed=21), n)
    if np.any(room):
        out = out + dsp.db_to_amp(ROOM_DB) * dsp.pad_to(dsp.reverb_send(room, "room", seed=22), n)
    return dsp.highpass(out, 28.0)


def render(events: list[N] | None = None, dur: float = DURATION, stems: bool = False):
    """Render the score -> {'bed', 'hits', 'solo': stereo (n, 2), 'gate': (n,)}.

    bed and hits are already gated; with ``stems=True`` also returns the per-family dry
    stems per group (diagnostics)."""
    events = EVENTS if events is None else events
    n_total = dsp.n_samples(dur)
    tls: dict[tuple[str, str], dsp.Timeline] = {}
    for ev in events:
        seed = _seed(ev)
        t, vel = ev.t, ev.vel
        if ev.hum > 0:
            r = dsp.rng(seed, "hum")
            t += r.uniform(-ev.hum, ev.hum)
            vel = float(np.clip(vel * (1.0 + r.uniform(-0.05, 0.05)), 0.0, 1.0))
        y = _voice(ev, seed, vel)
        key = (ev.grp, FAMILY[ev.inst])
        if key not in tls:
            tls[key] = dsp.Timeline(dur)
        tls[key].add(y, t)
    gate = gate_curve(dur)
    out, fam = {}, {}
    for grp in GROUPS:
        st = {f: dsp.pad_to(tl.render(), n_total) for (g, f), tl in sorted(tls.items()) if g == grp}
        bus = _mix_group(st, n_total, GROUP_SEND[grp]) if st else np.zeros((n_total, 2))
        out[grp] = bus * gate[:, None] if grp in GATED else bus
        fam[grp] = st
    out["gate"] = gate
    return (out, fam) if stems else out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--wav", default=None, help="also render the music alone to this file")
    a = ap.parse_args(argv)
    for sid, name, t0, t1 in SECTIONS:
        evs = [e for e in EVENTS if t0 <= e.t < t1]
        insts = sorted({e.inst for e in evs})
        print(f"{sid:4s} {name:15s} {t0:6.2f}-{t1:6.2f}  {len(evs):4d} events  {', '.join(insts)}")
    print(f"total {len(EVENTS)} events")
    if a.wav:
        r = render()
        dsp.write_wav(a.wav, r["bed"] + r["hits"] + r["solo"])
        print("wrote", a.wav)
    return 0


if __name__ == "__main__":
    sys.exit(main())
