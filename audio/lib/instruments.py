"""
instruments.py -- musical voices for the "Axolotl Launcher" score.

A light, warm "toybox" palette: modal marimba / mallets / kalimba / bells,
Karplus-Strong plucks, an FM electric piano, a warm analog-style pad, a round
sub bass, a soft synth lead, and a soft modern drum kit with transition FX.

Conventions (all voices)
------------------------
* ``note``: note name ``'F#4'`` / ``'Bb3'`` (C4 = middle C = MIDI 60), an *int*
  MIDI number, or a *float* frequency in Hz (see :func:`to_hz`).
* ``dur``: gate length in seconds (how long the key is held / until the damper).
  Returned buffers last ``dur + release`` (percussive voices may decay sooner).
* ``vel``: 0..1 -> loudness (amplitude ~ vel**1.3) *and* brightness.
* ``seed``: integer for the small deterministic humanizing variations.
* ``pan``: -1..1 (``None`` = instrument default, e.g. keyboard-position pan).
* Output: stereo float64 ``(n, 2)`` at 48 kHz, click-free (ramped onsets,
  damped endings, DC-free).  A centred single note at ``vel=1`` peaks around
  -9 dBFS so chords and mixes have headroom; use :func:`render_events` or
  ``dsp.Timeline`` to sequence notes.
"""
from __future__ import annotations

import math
import re
from typing import Callable, Iterable, Sequence

import numpy as np
from scipy import signal as sps

try:  # package import (from lib import instruments)
    from . import dsp
except ImportError:  # pragma: no cover - direct script use
    import dsp  # type: ignore

SR = dsp.SR
SQRT2 = math.sqrt(2.0)

# ==========================================================================
# pitch, scales, chords
# ==========================================================================

_NOTE_BASE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
_NOTE_RE = re.compile(r"^\s*([A-Ga-g])([#b]*)(-?\d+)\s*$")
_SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
_FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]


def note_to_midi(name: str) -> int:
    """Note name -> MIDI number: 'C4' -> 60, 'F#3' -> 54, 'Bb5' -> 82 ('#' sharp, 'b' flat)."""
    m = _NOTE_RE.match(name)
    if not m:
        raise ValueError(f"bad note name {name!r}")
    letter, acc, octv = m.groups()
    semis = _NOTE_BASE[letter.upper()] + acc.count("#") - acc.count("b")
    return 12 * (int(octv) + 1) + semis


def midi_to_name(m: int, flats: bool = True) -> str:
    """MIDI number -> note name (flats by default, matching F major: 70 -> 'Bb4')."""
    m = int(round(m))
    names = _FLAT_NAMES if flats else _SHARP_NAMES
    return f"{names[m % 12]}{m // 12 - 1}"


def to_midi(note) -> float:
    """Note name / MIDI int / Hz float -> (possibly fractional) MIDI number."""
    if isinstance(note, str):
        return float(note_to_midi(note))
    if isinstance(note, (int, np.integer)):
        return float(note)
    return float(dsp.hz_to_midi(float(note)))


def to_hz(note) -> float:
    """Note name ('A4') / MIDI int (69) / frequency float (440.0) -> Hz."""
    if isinstance(note, str):
        return float(dsp.midi_to_hz(note_to_midi(note)))
    if isinstance(note, (int, np.integer)):
        return float(dsp.midi_to_hz(int(note)))
    return float(note)


def transpose(note, semis: float) -> float:
    """Return the frequency (Hz) of ``note`` shifted by ``semis`` semitones."""
    return to_hz(note) * dsp.semitones(semis)


SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "dorian": [0, 2, 3, 5, 7, 9, 10],
    "mixolydian": [0, 2, 4, 5, 7, 9, 10],
    "lydian": [0, 2, 4, 6, 7, 9, 11],
    "major_pent": [0, 2, 4, 7, 9],
    "minor_pent": [0, 3, 5, 7, 10],
    "whole": [0, 2, 4, 6, 8, 10],
}

CHORDS = {
    "": [0, 4, 7], "maj": [0, 4, 7], "m": [0, 3, 7], "min": [0, 3, 7], "dim": [0, 3, 6],
    "aug": [0, 4, 8], "sus2": [0, 2, 7], "sus4": [0, 5, 7], "5": [0, 7],
    "6": [0, 4, 7, 9], "m6": [0, 3, 7, 9], "7": [0, 4, 7, 10], "maj7": [0, 4, 7, 11],
    "m7": [0, 3, 7, 10], "m7b5": [0, 3, 6, 10], "dim7": [0, 3, 6, 9], "7sus4": [0, 5, 7, 10],
    "add9": [0, 4, 7, 14], "madd9": [0, 3, 7, 14], "6/9": [0, 4, 7, 9, 14], "9": [0, 4, 7, 10, 14],
    "maj9": [0, 4, 7, 11, 14], "m9": [0, 3, 7, 10, 14], "m11": [0, 3, 7, 10, 14, 17],
    "maj13": [0, 4, 7, 11, 14, 21], "13": [0, 4, 7, 10, 14, 21],
}


def scale(root="F4", mode: str = "major", octaves: int = 1) -> list[int]:
    """MIDI notes of a scale starting at ``root`` for ``octaves`` octaves (plus the top root)."""
    r = int(round(to_midi(root)))
    steps = SCALES[mode]
    out = [r + 12 * o + s for o in range(octaves) for s in steps]
    return out + [r + 12 * octaves]


def degree(root="F4", mode: str = "major", deg: int = 1) -> int:
    """MIDI note of scale degree ``deg`` (1-based; 8 = octave, 0/negatives go below)."""
    steps = SCALES[mode]
    k = deg - 1
    octv, idx = divmod(k, len(steps))
    return int(round(to_midi(root))) + 12 * octv + steps[idx]


def chord(symbol: str, octave: int = 4, inversion: int = 0) -> list[int]:
    """Chord symbol -> MIDI notes in close position from the root in ``octave``.

    Examples: 'F', 'Dm7', 'Bbmaj7', 'C7sus4', 'F6/9', 'Gm7', 'F/A' (slash bass).
    ``inversion`` rotates the lowest notes up an octave.
    """
    m = re.match(r"^\s*([A-G])([#b]?)(.*?)\s*$", symbol)
    if not m:
        raise ValueError(f"bad chord {symbol!r}")
    root, acc, qual = m.groups()
    bass = None
    if qual not in CHORDS and "/" in qual:
        qual, bass = qual.rsplit("/", 1)
    if qual not in CHORDS:
        raise ValueError(f"unknown chord quality {qual!r} in {symbol!r}")
    r = note_to_midi(f"{root}{acc}{octave}")
    notes = [r + i for i in CHORDS[qual]]
    for _ in range(inversion % max(1, len(notes))):
        notes = notes[1:] + [notes[0] + 12]
    if bass:
        b = note_to_midi(f"{bass}{octave}")
        while b >= min(notes):
            b -= 12
        notes = [b] + notes
    return notes


def voicing(notes: Sequence[int], low="E3", high="E5") -> list[int]:
    """Fold chord tones (MIDI) into the range [low, high] by octaves; sorted, unique."""
    lo, hi = int(to_midi(low)), int(to_midi(high))
    out = set()
    for n in notes:
        n = int(n)
        while n < lo:
            n += 12
        while n > hi:
            n -= 12
        out.add(n)
    return sorted(out)


def voice_lead(prev: Sequence[int], symbol: str, low="E3", high="E5") -> list[int]:
    """Voicing of ``symbol`` (all inversions within [low, high]) with the least motion from ``prev``."""
    base = chord(symbol, 2)
    pcs = sorted({n % 12 for n in base})
    lo, hi = int(to_midi(low)), int(to_midi(high))
    cands = []
    for start in range(lo, hi + 1):
        if start % 12 not in pcs:
            continue
        v = [start]
        for pc in pcs:
            if pc == start % 12:
                continue
            n = start + ((pc - start) % 12)
            v.append(n)
        v = sorted(v)
        if v[-1] <= hi:
            cands.append(v)
    if not cands:
        return voicing(base, low, high)
    p = sorted(prev)

    def cost(v):
        if len(v) == len(p):
            return sum(abs(a - b) for a, b in zip(v, p))
        return abs(np.mean(v) - np.mean(p)) * len(v)

    return min(cands, key=cost)


# ==========================================================================
# shared helpers
# ==========================================================================


def _vel(v: float) -> float:
    """Velocity 0..1 -> amplitude (~ 30 dB range)."""
    return float(np.clip(v, 0.0, 1.0)) ** 1.3


def _keypan(midi: float, width: float = 0.45) -> float:
    """Keyboard-position pan: low notes slightly left, high notes slightly right."""
    return float(np.clip((midi - 66.0) / 30.0, -1.0, 1.0) * width)


def _damper(n_total: int, dur: float, release: float, sr: int = SR) -> np.ndarray:
    """1 while the gate is held, then an exponential-shaped fall to exactly 0 over ``release``."""
    env = np.zeros(n_total)
    ng = min(dsp.n_samples(dur, sr), n_total)
    env[:ng] = 1.0
    nr = min(dsp.n_samples(release, sr), n_total - ng)
    if nr > 0:
        u = np.arange(1, nr + 1) / nr
        env[ng:ng + nr] = (np.exp(-5.0 * u) - math.exp(-5.0)) / (1.0 - math.exp(-5.0))
    return env


def _out(mono: np.ndarray, level: float, pan_pos: float) -> np.ndarray:
    """Mono voice -> stereo at ``level`` (a centred voice gets ``level`` in each channel)."""
    y = dsp.pan(mono * level, pan_pos) * SQRT2
    return dsp.fade(y, 0.0, 0.002)


def _burst(dur: float, seed: int, salt: str, center: float, q: float, tau: float,
           attack: float = 0.0003) -> np.ndarray:
    """Short band-passed noise burst (mallet/stick contact noise)."""
    w = dsp.white(dur, seed, salt) * dsp.perc(dur, attack, tau)
    return dsp.bandpass(w, center, q)


# ==========================================================================
# mallets & bells (modal synthesis)
# ==========================================================================


def marimba(note, dur: float = 1.0, vel: float = 0.8, seed: int = 0, pan: float | None = None,
            mallet="medium", release: float = 0.08) -> np.ndarray:
    """Marimba: modal bar (partials 1 : 3.93 : 9.2) + resonator-tube bloom + mallet noise.

    mallet: 'soft' | 'medium' | 'hard' or a hardness float 0..1 (brighter, shorter contact).
    Low notes ring ~2 s, high notes ~0.4 s; upper modes decay 4-11x faster.
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    hard = {"soft": 0.25, "medium": 0.5, "hard": 0.8}.get(mallet, mallet)
    hard = float(np.clip(hard, 0.0, 1.0))
    r = dsp.rng(seed, "marimba")
    t60 = float(np.clip(1.25 * (262.0 / f) ** 0.55, 0.22, 3.0))
    bright = float(np.clip((0.35 + 0.65 * hard) * (0.45 + 0.55 * v), 0.05, 1.0))
    roll = float(np.clip(2600.0 / (f * 3.93), 0.15, 1.0))
    ratios = [1.0, 3.93 * (1 + r.uniform(-0.004, 0.004)), 9.2 * (1 + r.uniform(-0.006, 0.006)),
              1.0 + 0.4 / f]
    amps = [1.0, 0.45 * bright * roll, 0.18 * bright ** 2 * roll, 0.22]
    t60s = [t60, max(0.04, t60 / 4.0), max(0.018, t60 / 11.0), t60 * 1.35]
    contact = 0.0035 - 0.0022 * hard
    total = dur + release
    y = dsp.modal(f, ratios, amps, t60s, total, attack=contact)
    nb = min(len(y), dsp.n_samples(0.02))
    knock = _burst(0.02, seed, "mallet", 1500 + 2600 * hard, 0.8, 0.0012 + 0.002 * (1 - hard))
    y[:nb] += knock[:nb] * (0.10 + 0.25 * hard) * (0.5 + 0.5 * v)
    y *= _damper(len(y), dur, release)
    y /= sum(amps)
    p = _keypan(to_midi(note)) if pan is None else pan
    return _out(y, 0.36 * _vel(v), p)


def soft_mallet(note, dur: float = 1.5, vel: float = 0.7, seed: int = 0, pan: float | None = None,
                tremolo: float = 0.0, tremolo_rate: float = 5.2, release: float = 0.18) -> np.ndarray:
    """Felt-mallet metal bar (vibraphone-like, partials 1 : 4 : 10), round and sustained.

    ``tremolo`` 0..0.6 adds the classic rotating-disc amplitude shimmer.
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    t60 = float(np.clip(3.2 * (440.0 / f) ** 0.45, 0.8, 5.5))
    total = dur + release
    amps = [1.0, 0.11 * (0.5 + 0.5 * v), 0.025 * v]
    y = dsp.modal(f, [1.0, 3.99, 9.9], amps, [t60, t60 / 5.0, t60 / 14.0], total, attack=0.004)
    if tremolo > 0:
        t = dsp.timebase(len(y))
        y *= 1.0 - tremolo * (0.5 - 0.5 * np.cos(dsp.TAU * tremolo_rate * t))
    y *= _damper(len(y), dur, release)
    y /= sum(amps)
    p = _keypan(to_midi(note)) if pan is None else pan
    return _out(y, 0.34 * _vel(v), p)


def kalimba(note, dur: float = 1.2, vel: float = 0.8, seed: int = 0, pan: float | None = None,
            release: float = 0.1) -> np.ndarray:
    """Kalimba / thumb piano: clamped-tine modes (1 : ~5.9 : ~17.3), slight onset pitch drop, tine tick."""
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    r = dsp.rng(seed, "kalimba")
    total = dur + release
    n = dsp.n_samples(total)
    t = dsp.timebase(n)
    fcurve = f * (1.0 + 0.004 * np.exp(-t / 0.015))
    t60 = float(np.clip(1.8 * (440.0 / f) ** 0.35, 0.6, 3.0))
    roll = float(np.clip(3000.0 / (5.93 * f), 0.2, 1.0))
    ratios = [1.0, 5.93 * (1 + r.uniform(-0.01, 0.01)), 17.3 * (1 + r.uniform(-0.01, 0.01)), 2.0]
    amps = [1.0, 0.28 * (0.5 + 0.5 * v) * roll, 0.06 * roll * v, 0.05]
    t60s = [t60, 0.16, 0.045, t60 * 0.5]
    y = dsp.modal(fcurve, ratios, amps, t60s, total, attack=0.0006)
    nb = min(n, dsp.n_samples(0.01))
    y[:nb] += _burst(0.01, seed, "tine", 3200.0, 1.2, 0.0006)[:nb] * 0.12 * v
    y *= _damper(n, dur, release)
    y /= sum(amps)
    p = _keypan(to_midi(note)) if pan is None else pan
    return _out(y, 0.36 * _vel(v), p)


def glockenspiel(note, dur: float = 2.0, vel: float = 0.75, seed: int = 0, pan: float | None = None,
                 release: float = 0.25) -> np.ndarray:
    """Glockenspiel: steel bar modes (1 : 2.76 : 5.40 : 8.93), hard-mallet ping, long ring.

    Natural range F5..C8; partials above ~20 kHz are dropped (no aliasing).
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    r = dsp.rng(seed, "glock")
    t60 = float(np.clip(2.6 * (1047.0 / f) ** 0.35, 0.8, 4.0))
    b = 0.55 + 0.45 * v
    ratios = [1.0, 2.76 * (1 + r.uniform(-0.003, 0.003)), 5.40, 8.93]
    amps = [1.0, 0.40 * b, 0.20 * b * b, 0.08 * b ** 3]
    t60s = [t60, t60 * 0.45, t60 * 0.22, t60 * 0.12]
    total = dur + release
    y = dsp.modal(f, ratios, amps, t60s, total, attack=0.0004)
    nb = min(len(y), dsp.n_samples(0.008))
    y[:nb] += _burst(0.008, seed, "glockping", 7000.0, 0.9, 0.0005)[:nb] * 0.10 * v
    y *= _damper(len(y), dur, release)
    y /= sum(amps)
    p = _keypan(to_midi(note), 0.35) if pan is None else pan
    return _out(y, 0.30 * _vel(v), p)


def celesta(note, dur: float = 1.5, vel: float = 0.75, seed: int = 0, pan: float | None = None,
            release: float = 0.2) -> np.ndarray:
    """Celesta / music-box bell: felt-hammered plate over a resonator - sweet, fundamental-heavy."""
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    t60 = float(np.clip(1.6 * (1047.0 / f) ** 0.4, 0.5, 3.0))
    amps = [1.0, 0.10 * (0.4 + 0.6 * v), 0.035, 0.07 * v]
    ratios = [1.0, 2.0, 3.0, 4.07]
    t60s = [t60, t60 * 0.5, t60 * 0.3, t60 * 0.18]
    total = dur + release
    y = dsp.modal(f, ratios, amps, t60s, total, attack=0.0015)
    nb = min(len(y), dsp.n_samples(0.01))
    y[:nb] += _burst(0.01, seed, "celhammer", 2400.0, 0.7, 0.0010)[:nb] * 0.05 * v
    y *= _damper(len(y), dur, release)
    y /= sum(amps)
    p = _keypan(to_midi(note), 0.35) if pan is None else pan
    return _out(y, 0.32 * _vel(v), p)


def fm_bell(note, dur: float = 2.5, vel: float = 0.7, seed: int = 0, pan: float | None = None,
            ratio: float = 3.5, index: float = 2.2, release: float = 0.4, decay: float | None = None) -> np.ndarray:
    """FM bell (DX-style tubular/glass bell). Rendered 2x oversampled with key-scaled index.

    ratio: modulator:carrier (3.5 = tubular/glass, 1.4 = Chowning clang, 2.0 = hollow);
    index: brightness at the strike (decays faster than the amplitude).
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    os = 2
    sr2 = SR * os
    total = dur + release
    n2 = dsp.n_samples(total, sr2)
    t = dsp.timebase(n2, sr2)
    T = decay if decay is not None else float(np.clip(3.0 * (880.0 / f) ** 0.3, 0.8, 5.0))
    ks = float(np.clip((1200.0 / f) ** 0.5, 0.25, 1.0))
    idx = index * ks * (0.5 + 0.5 * v) * (0.15 + 0.85 * np.exp(-t / (0.25 * T)))
    y = dsp.fm(f, ratio, idx, total, sr=sr2)
    y += 0.25 * dsp.fm(f * 2.005, ratio, idx * 0.5, total, sr=sr2)  # shimmer partial
    y *= np.exp(-dsp.LN1000 * t / T) * dsp.attack_ramp(n2, 0.0012, sr2)
    y *= _damper(n2, dur, release, sr2)
    y = dsp.pad_to(dsp.resample(y, 1, os), dsp.n_samples(total))
    p = _keypan(to_midi(note), 0.35) if pan is None else pan
    return _out(y / 1.25, 0.30 * _vel(v), p)


# ==========================================================================
# plucked strings (Karplus-Strong)
# ==========================================================================


def pluck(note, dur: float = 1.0, vel: float = 0.8, seed: int = 0, pan: float | None = None,
          kind: str = "nylon", brightness: float | None = None, decay: float | None = None,
          release: float = 0.07) -> np.ndarray:
    """Karplus-Strong plucked string, exactly tuned (allpass fractional delay in the loop).

    kind: 'nylon' (warm guitar/harp-like), 'pizz' (short string pizzicato),
    'harp' (plucked mid-string, mellow, long).  ``brightness`` 0..1 overrides the
    velocity-driven pluck hardness; ``decay`` overrides the T60 (s).
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    cfg = {
        "nylon": dict(S=0.5, t60=float(np.clip(3.0 * (220.0 / f) ** 0.65, 0.5, 6.0)), beta=0.18),
        "pizz": dict(S=0.45, t60=float(np.clip(0.5 * (220.0 / f) ** 0.45, 0.12, 0.9)), beta=0.22),
        "harp": dict(S=0.5, t60=float(np.clip(4.0 * (220.0 / f) ** 0.6, 0.8, 7.0)), beta=0.45),
    }[kind]
    S = cfg["S"]
    T60 = decay if decay is not None else cfg["t60"]
    bright = brightness if brightness is not None else 0.3 + 0.45 * v
    total = dur + release
    n = dsp.n_samples(total)
    P = SR / f
    N = int(math.floor(P - S - 0.5))
    d = P - S - N
    eta = (1.0 - d) / (1.0 + d)
    w = dsp.TAU * f / SR
    hlp = abs((1 - S) + S * np.exp(-1j * w))
    g = min(10.0 ** (-3.0 / (T60 * f)) / hlp, 0.99997)
    a = np.zeros(N + 3)
    a[0] = 1.0
    a[1] += eta
    a[N] -= g * (1 - S) * eta
    a[N + 1] -= g * ((1 - S) + S * eta)
    a[N + 2] -= g * S
    b = [1.0, eta]
    # excitation: triangle string shape (apex at pluck position) + a little noise, softened
    L = max(4, int(round(P)))
    r = dsp.rng(seed, "pluck")
    pos = (np.arange(L) + 0.5) / L
    beta = cfg["beta"]
    tri = np.where(pos < beta, pos / beta, (1.0 - pos) / (1.0 - beta))
    exc = tri - tri.mean() + 0.3 * (0.3 + 0.7 * bright) * r.standard_normal(L)
    exc = dsp.one_pole(exc, 600.0 + 7500.0 * bright ** 1.5)
    exc -= exc.mean()
    exc *= np.hanning(L + 2)[1:-1] ** 0.25
    x = np.zeros(n)
    x[:min(L, n)] = exc[:n]
    y = sps.lfilter(b, a, x)
    y = dsp.dc_block(y, 20.0)
    if kind == "pizz":
        y = dsp.highpass(y, 140.0)
        y = dsp.peaking(y, 290.0, 4.0, 1.4)
        y = dsp.peaking(y, 520.0, 2.0, 1.2)
        y = dsp.lowpass(y, 5500.0)
    else:
        y = dsp.peaking(y, 105.0, 3.0, 1.0)
        y = dsp.peaking(y, 210.0, 2.0, 1.2)
        y = dsp.high_shelf(y, 5000.0, -3.0)
    y *= dsp.attack_ramp(n, 0.0008)
    y *= _damper(n, dur, release)
    pk = np.max(np.abs(y[: dsp.n_samples(0.15)])) if n else 1.0
    y /= max(pk, 1e-9)
    p = _keypan(to_midi(note), 0.3) if pan is None else pan
    return _out(y, 0.34 * _vel(v), p)


# ==========================================================================
# keys, pads, bass, lead
# ==========================================================================


def epiano(note, dur: float = 1.0, vel: float = 0.8, seed: int = 0, pan: float = 0.0,
           release: float = 0.3, tremolo: float = 0.0, tremolo_rate: float = 4.8,
           bark: float = 1.0) -> np.ndarray:
    """FM electric piano (Rhodes-ish): 1:1 'body' pair + 1:14 'tine' pair, velocity bark.

    Rendered 2x oversampled with key scaling (no aliasing up top).  ``tremolo``
    0..1 = suitcase-style stereo auto-pan depth.
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    os = 2
    sr2 = SR * os
    total = dur + release
    n2 = dsp.n_samples(total, sr2)
    t = dsp.timebase(n2, sr2)
    ks = float(np.clip((700.0 / f) ** 0.4, 0.3, 1.0))
    I1 = (0.25 + 1.35 * v ** 1.6 * bark) * ks
    pc = dsp.phase_cycles(f, n2, 0.0, sr2)
    body = np.sin(dsp.TAU * pc + I1 * (0.28 + 0.72 * np.exp(-t / 0.5)) * np.sin(dsp.TAU * pc))
    I2 = 0.9 * v * ks
    pt = dsp.phase_cycles(14.0 * f, n2, 0.0, sr2)
    tine = np.sin(dsp.TAU * pc + I2 * np.exp(-t / 0.035) * np.sin(dsp.TAU * pt))
    T60 = float(np.clip(4.5 * (262.0 / f) ** 0.6, 1.0, 9.0))
    amp = np.exp(-dsp.LN1000 * t / T60) * dsp.attack_ramp(n2, 0.0012, sr2)
    tenv = np.exp(-t / 0.08) * dsp.attack_ramp(n2, 0.0005, sr2)
    y = body * amp + 0.4 * v * ks * tine * tenv
    y *= _damper(n2, dur, release, sr2)
    y = dsp.pad_to(dsp.resample(y, 1, os), dsp.n_samples(total))
    y = dsp.saturate(y, 1.0 + 1.2 * v * bark, "asym", mix=0.5, bias=0.3)
    y = dsp.highpass(y, max(35.0, 0.5 * f))  # remove envelope 'rectification' rumble of the bark
    y /= 1.0 + 0.4 * v
    out = _out(y, 0.34 * _vel(v), pan)
    if tremolo > 0:
        tt = dsp.timebase(len(out))
        lfo = np.sin(dsp.TAU * tremolo_rate * tt)
        out[:, 0] *= 1.0 - 0.5 * tremolo * (1.0 + lfo)
        out[:, 1] *= 1.0 - 0.5 * tremolo * (1.0 - lfo)
    return out


def pad(notes, dur: float = 4.0, vel: float = 0.6, seed: int = 0, attack: float = 0.9,
        release: float = 1.6, cutoff: float = 1700.0, voices: int = 5, detune: float = 14.0,
        width: float = 0.85, motion: float = 0.25, chorus_mix: float = 0.3) -> np.ndarray:
    """Warm pad: detuned band-limited saws (2x oversampled) -> slow-opening lowpass -> chorus.

    notes: one note or a list (chord).  ``cutoff`` = fully-open filter (Hz),
    ``detune`` = voice spread (cents), ``motion`` = slow filter drift amount,
    ``width`` = stereo spread of the voices.  Length = dur + release.
    """
    if isinstance(notes, (str, int, float, np.integer, np.floating)):
        notes = [notes]
    v = float(np.clip(vel, 0.0, 1.0))
    total = dur + release
    os = 2
    sr2 = SR * os
    n2 = dsp.n_samples(total, sr2)
    r = dsp.rng(seed, "pad")
    L = np.zeros(n2)
    R = np.zeros(n2)
    for j, note in enumerate(notes):
        f = to_hz(note)
        for k in range(voices):
            c = 0.0 if voices == 1 else detune * (-1.0 + 2.0 * k / (voices - 1))
            fv = f * dsp.cents(c + r.uniform(-1.5, 1.5))
            drift = 1.0 + 0.0006 * dsp.smooth_random(total, 0.4, seed * 97 + j * 13 + k, sr2)
            s = dsp.saw(fv * drift, total, phase=r.random(), sr=sr2)
            p = 0.0 if voices == 1 else width * (-1.0 + 2.0 * k / (voices - 1)) * (1 if j % 2 == 0 else -1)
            th = (p + 1.0) * math.pi / 4.0
            L += s * math.cos(th)
            R += s * math.sin(th)
    st = np.stack([L, R], axis=1) * (SQRT2 / math.sqrt(len(notes) * voices))
    st = dsp.pad_to(dsp.resample(st, 1, os), dsp.n_samples(total))
    n = len(st)
    t = dsp.timebase(n)
    open_ = dsp.smoothstep(t / max(attack * 1.6, 1e-3))
    wob = 1.0 + motion * 0.35 * dsp.smooth_random(total, 0.35, seed + 5)
    fc = cutoff * (0.35 + 0.65 * open_) * wob * (0.7 + 0.3 * v)
    st = dsp.svf(st, fc, 0.65, "lp")
    st = dsp.lowpass(st, 6000.0)
    st *= dsp.pad_to(dsp.adsr(dur, attack, 0.8, 0.85, release), n)[:, None]
    if chorus_mix > 0:
        st = dsp.chorus(st, 0.33, 2.5, 14.0, 3, chorus_mix, 0.9, seed)
    st = dsp.dc_block(st, 25.0)
    return dsp.fade(st * 0.30 * _vel(v), 0.0, 0.01)


def bass(note, dur: float = 0.5, vel: float = 0.8, seed: int = 0, pan: float = 0.0, tone: float = 0.25,
         glide_from=None, glide_time: float = 0.06, drive: float = 1.4, release: float = 0.07) -> np.ndarray:
    """Round sub bass: sine + 2nd/3rd harmonics, soft saturation, optional filtered-saw 'tone'.

    ``tone`` 0..1 mixes in a short lowpassed saw for definition on small speakers;
    ``glide_from`` (note) slides into the pitch over ``glide_time``.
    """
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    total = dur + release
    n = dsp.n_samples(total)
    if glide_from is not None:
        freq = dsp.glide(to_hz(glide_from), f, total, glide_time, "fast")
    else:
        freq = np.full(n, f)
    ph = dsp.TAU * dsp.phase_cycles(freq, n)
    y = np.sin(ph) + 0.30 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    if tone > 0:
        s = dsp.bl_saw(freq, total, 40)
        t = dsp.timebase(n)
        fc = freq * (2.0 + 6.0 * np.exp(-t / 0.08))
        y += tone * 0.6 * dsp.svf(s, fc, 0.9, "lp") * np.exp(-t / 0.25)
    env = dsp.adsr(dur, 0.006, 0.35, 0.75, release)
    y = y * dsp.pad_to(env, n)
    y = dsp.saturate(y * 0.8, drive, "tanh")
    y = dsp.highpass(y, 30.0)
    y = dsp.lowpass(y, 3500.0)
    y /= 1.05
    return _out(y, 0.40 * _vel(v), pan)


def lead_phrase(events: Sequence[tuple], seed: int = 0, pan: float = 0.0, glide: float = 0.045,
                vibrato_cents: float = 14.0, vibrato_rate: float = 5.3, cutoff: float = 3.2,
                pw: float = 0.42, attack: float = 0.012, release: float = 0.18,
                legato_gap: float = 0.03, chorus_mix: float = 0.25) -> np.ndarray:
    """Soft synth lead for a whole phrase: filtered PWM pulse + sine, portamento, delayed vibrato.

    events: ``[(start_s, dur_s, note, vel), ...]`` in seconds.  Notes that start
    within ``legato_gap`` of the previous note's end are slurred (no re-attack)
    and every pitch change glides with time constant ``glide`` s.
    ``cutoff`` = filter cutoff as a multiple of the played frequency.
    """
    ev = sorted([(float(e[0]), float(e[1]), e[2], float(e[3]) if len(e) > 3 else 0.8) for e in events])
    if not ev:
        return np.zeros((0, 2))
    total = max(s + d for s, d, _, _ in ev) + release + 0.05
    n = dsp.n_samples(total)
    t = dsp.timebase(n)
    target = np.full(n, math.log2(to_hz(ev[0][2])))
    velc = np.full(n, ev[0][3])
    vib_env = np.zeros(n)
    note_env = np.zeros(n)
    for i, (s, d, note, vv) in enumerate(ev):
        a = dsp.n_samples(s)
        b = dsp.n_samples(ev[i + 1][0]) if i + 1 < len(ev) else n
        target[a:b] = math.log2(to_hz(note))
        velc[a:b] = vv
        seg = slice(a, min(n, dsp.n_samples(s + d + 0.05)))
        tt = t[seg] - s
        fade_out = np.clip((d + 0.05 - tt) / 0.05, 0.0, 1.0)
        vib_env[seg] = np.maximum(vib_env[seg], dsp.smoothstep((tt - 0.18) / 0.3) * fade_out)
        rise = np.clip((t[a:] - s) / 0.004, 0.0, 1.0)
        note_env[a:] = np.maximum(note_env[a:], np.exp(-(t[a:] - s) / 0.12) * rise)
    if glide > 0:
        ac = math.exp(-1.0 / (glide * SR))
        logf, _ = sps.lfilter([1 - ac], [1, -ac], target, zi=[ac * target[0]])
    else:
        logf = target
    freq = np.power(2.0, logf)
    vib = vibrato_cents * vib_env * np.sin(dsp.TAU * dsp.phase_cycles(
        vibrato_rate * (1 + 0.08 * dsp.smooth_random(total, 1.3, seed)), n))
    freq = freq * np.power(2.0, vib / 1200.0)
    # amplitude: merge legato runs into single gates
    gates = []
    cs, ce = ev[0][0], ev[0][0] + ev[0][1]
    for s, d, _, _ in ev[1:]:
        if s <= ce + legato_gap:
            ce = max(ce, s + d)
        else:
            gates.append((cs, ce))
            cs, ce = s, s + d
    gates.append((cs, ce))
    amp = np.zeros(n)
    for gs, ge in gates:
        e = dsp.adsr(ge - gs, attack, 0.25, 0.8, release)
        a = dsp.n_samples(gs)
        m = min(len(e), n - a)
        amp[a:a + m] = np.maximum(amp[a:a + m], e[:m])
    velc = dsp.smooth(velc, 8.0)
    pwm = pw + 0.07 * np.sin(dsp.TAU * 0.35 * t)
    osc = 0.55 * dsp.square(freq, total, pwm, oversample=2) + 0.45 * dsp.sine(freq, total)
    fc = dsp.smooth(freq * cutoff * (1.0 + 1.1 * note_env), 2.0)
    y = dsp.svf(osc, np.clip(fc, 80, 16000), 0.8, "lp")
    y = y * amp * np.power(np.clip(velc, 0.0, 1.0), 1.3)
    out = dsp.pan(y * 0.30, pan) * SQRT2
    if chorus_mix > 0:
        out = dsp.chorus(out, 0.5, 1.8, 11.0, 2, chorus_mix, 0.7, seed)
    return dsp.fade(dsp.dc_block(out, 30.0), 0.0, 0.005)


def lead(note, dur: float = 0.5, vel: float = 0.8, seed: int = 0, pan: float = 0.0,
         glide_from=None, **kw) -> np.ndarray:
    """Single soft-lead note (see :func:`lead_phrase`); ``glide_from`` slides in from another note."""
    if glide_from is not None:
        ev = [(0.0, 0.001, glide_from, vel), (0.001, dur, note, vel)]
    else:
        ev = [(0.0, dur, note, vel)]
    return lead_phrase(ev, seed=seed, pan=pan, **kw)


# ==========================================================================
# drums & transition FX
# ==========================================================================


def kick(vel: float = 0.9, seed: int = 0, pitch: float = 1.0, decay: float = 0.42,
         click: float = 0.3, drive: float = 1.6) -> np.ndarray:
    """Soft kick: pitch-swept sine (150 -> 48 Hz) + tiny filtered click, warm saturation."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = decay * 1.25 + 0.05
    n = dsp.n_samples(total)
    t = dsp.timebase(n)
    f = 48.0 * pitch + (102.0 * pitch) * np.exp(-t / 0.032)
    y = np.sin(dsp.TAU * dsp.phase_cycles(f, n)) * dsp.exp_decay(total, decay, 0.0015)
    nb = min(n, dsp.n_samples(0.012))
    y[:nb] += _burst(0.012, seed, "kickclick", 3200.0, 0.7, 0.0012)[:nb] * click * 0.6 * (0.5 + 0.5 * v)
    y = dsp.saturate(y, drive, "tanh")
    y = dsp.highpass(y, 28.0)
    return _out(dsp.fade(y, 0, 0.01), 0.55 * _vel(v), 0.0)


def clap(vel: float = 0.8, seed: int = 0, tone: float = 1.0, room: float = 0.16, spread: float = 0.25) -> np.ndarray:
    """Hand clap: 3 fast band-passed noise bursts + a longer tail burst, small room."""
    v = float(np.clip(vel, 0.0, 1.0))
    r = dsp.rng(seed, "clap")
    total = 0.5
    n = dsp.n_samples(total)
    w = dsp.white(total, seed, "clapnoise")
    st = np.zeros((n, 2))
    offs = [0.0, 0.0095 + r.uniform(-0.0015, 0.0015), 0.019 + r.uniform(-0.002, 0.002),
            0.029 + r.uniform(-0.002, 0.002)]
    t = dsp.timebase(n)
    for i, o in enumerate(offs):
        tau = 0.0028 if i < 3 else 0.055
        env = np.where(t >= o, np.exp(-np.maximum(t - o, 0) / tau), 0.0)
        env *= np.clip((t - o) / 0.0004, 0.0, 1.0)
        b = w * env * (0.85 if i < 3 else 1.0)
        b = dsp.bandpass(b, 1250.0 * tone, 0.85) + 0.35 * dsp.bandpass(b, 2600.0 * tone, 1.2)
        st += dsp.pan(b, r.uniform(-spread, spread))
    st = dsp.highpass(st, 400.0)
    st /= max(dsp.peak(st), 1e-9)
    if room > 0:
        st = dsp.trim(dsp.reverb(st, "room", room, seed=seed), -80.0)
    return dsp.fade(st * 0.42 * _vel(v), 0.0, 0.01)


def snap(vel: float = 0.8, seed: int = 0, pitch: float = 1.0, room: float = 0.12) -> np.ndarray:
    """Finger snap: bright band-passed crack + skin thump + small tonal ring."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = 0.12
    n = dsp.n_samples(total)
    crack = _burst(total, seed, "snap", 2900.0 * pitch, 1.6, 0.0035)
    crack /= max(dsp.peak(crack), 1e-9)
    tone_ = dsp.modal(1850.0 * pitch, [1.0], [1.0], [0.06], total, 0.0003) * 0.3
    thump = dsp.modal(320.0 * pitch, [1.0], [1.0], [0.04], total, 0.0008) * 0.25
    y = crack + tone_ + thump
    st = dsp.pan(y, 0.0) * SQRT2
    if room > 0:
        st = dsp.reverb(st, "room", room, seed=seed)
    st = dsp.trim(st, -80.0)
    st /= max(dsp.peak(st), 1e-9)
    return dsp.fade(st * 0.38 * _vel(v), 0.0, 0.006)


def _metal(dur: float, seed: int, base: float = 1.0) -> np.ndarray:
    """Inharmonic square cluster (TR-808 cymbal recipe), 2x oversampled polyBLEP squares."""
    r = dsp.rng(seed, "metal")
    freqs = np.array([205.3, 304.4, 369.6, 522.7, 540.0, 800.0]) * base
    y = 0.0
    for fq in freqs:
        y = y + dsp.square(fq * (1 + r.uniform(-0.01, 0.01)), dur, 0.5, r.random(), oversample=2)
    return y / len(freqs)


def hat_closed(vel: float = 0.6, seed: int = 0, tone: float = 1.0, decay: float = 0.045) -> np.ndarray:
    """Closed hi-hat: metallic cluster + noise, high-passed, short decay (soft, not fizzy)."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = decay * 2.2 + 0.01
    src = 0.45 * _metal(total, seed) + 0.25 * dsp.white(total, seed, "hatc")
    src = dsp.bandpass(src, 9500.0 * tone, 0.9) + 0.5 * dsp.highpass(src, 7000.0 * tone)
    y = dsp.highpass(src * dsp.exp_decay(total, decay, 0.0004), 6000.0)
    y = dsp.high_shelf(y, 13000.0, -4.0)
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.0, 0.004), 0.22 * _vel(v), 0.2)


def hat_open(vel: float = 0.6, seed: int = 0, tone: float = 1.0, decay: float = 0.42) -> np.ndarray:
    """Open hi-hat: same source as the closed hat with a two-stage longer decay."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = decay * 1.4 + 0.02
    n = dsp.n_samples(total)
    src = 0.45 * _metal(total, seed, 1.01) + 0.3 * dsp.white(total, seed, "hato")
    src = dsp.bandpass(src, 9000.0 * tone, 0.8) + 0.5 * dsp.highpass(src, 6500.0 * tone)
    env = 0.6 * dsp.exp_decay(total, 0.05, 0.0004) + 0.4 * dsp.exp_decay(total, decay, 0.002)
    y = dsp.highpass(src * env, 5500.0)
    y = dsp.high_shelf(y, 13000.0, -4.0)
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.0, 0.03), 0.20 * _vel(v), 0.2)[:n]


def shaker(vel: float = 0.6, seed: int = 0, length: float = 0.11, tone: float = 1.0, pan: float = -0.3) -> np.ndarray:
    """Shaker: granular bead hits (Poisson grains) shaped by a swell-and-decay, band-passed ~5 kHz."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = length + 0.07
    pts = [(0.0, 0.0), (0.35 * length, 1.0), (length, 0.3), (total, 0.0)]
    env = dsp.breakpoints(pts, total, "cos")
    grains = dsp.grain_cloud(total, 9000.0 * env + 50.0, seed, grain=0.0008)
    bed = dsp.white(total, seed, "shk") * 0.25
    src = grains * env ** 1.5 + bed * env  # sparse grains fade first -> the tail is a soft hiss
    y = dsp.bandpass(src, 5200.0 * tone, 1.1) + 0.4 * dsp.highpass(src, 8000.0 * tone)
    y = dsp.highpass(y, 2500.0)
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.001, 0.01), 0.16 * _vel(v), pan)


def rim(vel: float = 0.8, seed: int = 0, pitch: float = 1.0) -> np.ndarray:
    """Rim click / cross-stick: short woody-metallic modes + a crisp click."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = 0.12
    y = dsp.modal(1720.0 * pitch, [1.0, 0.317, 1.98], [1.0, 0.6, 0.35], [0.035, 0.05, 0.016], total, 0.0003)
    y += _burst(total, seed, "rim", 4000.0, 0.7, 0.0008) * 0.4
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.0, 0.005), 0.30 * _vel(v), 0.0)


def woodblock(note="C6", vel: float = 0.8, seed: int = 0, pan: float = 0.15) -> np.ndarray:
    """Wood block (tunable): inharmonic wooden modes (1 : 2.32 : 4.25), very short decay."""
    f = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    total = 0.2
    y = dsp.modal(f, [1.0, 2.32, 4.25], [1.0, 0.32, 0.12], [0.11, 0.045, 0.02], total, 0.00025)
    y += _burst(total, seed, "wb", 3500.0, 0.8, 0.0008) * 0.18
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.0, 0.01), 0.30 * _vel(v), pan)


def tom(note="A2", vel: float = 0.8, seed: int = 0, decay: float = 0.45, pan: float = 0.0) -> np.ndarray:
    """Soft tom: pitch-settling membrane (fundamental + 1.59x mode) + stick noise."""
    f0 = to_hz(note)
    v = float(np.clip(vel, 0.0, 1.0))
    total = decay * 1.2 + 0.05
    n = dsp.n_samples(total)
    t = dsp.timebase(n)
    f = f0 * (1.0 + 0.28 * np.exp(-t / 0.045))
    y = np.sin(dsp.TAU * dsp.phase_cycles(f, n)) * dsp.exp_decay(total, decay, 0.001)
    y += 0.35 * np.sin(dsp.TAU * dsp.phase_cycles(1.59 * f, n)) * dsp.exp_decay(total, decay * 0.5, 0.001)
    stick = dsp.lowpass(dsp.white(total, seed, "tom") * dsp.perc(total, 0.0003, 0.006), 2000.0)
    y += 0.25 * stick
    y = dsp.saturate(y, 1.3)
    y = dsp.highpass(y, 40.0)
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.0, 0.01), 0.42 * _vel(v), pan)


def reverse_cymbal(dur: float = 1.6, seed: int = 0, tone: float = 1.0, vel: float = 0.8) -> np.ndarray:
    """Reversed cymbal swell that peaks exactly at ``dur`` (place it so it ends on the hit)."""
    v = float(np.clip(vel, 0.0, 1.0))
    total = dur
    cym = 0.4 * _metal(total, seed, 1.47) + 0.6 * dsp.white(total, seed, "cym")
    cym = dsp.bandpass(cym, 7000.0 * tone, 0.6) + 0.4 * dsp.highpass(cym, 9000.0 * tone)
    cym = dsp.highpass(cym, 3000.0, order=4) * dsp.exp_decay(total, dur * 1.1, 0.001)
    st = dsp.reverb(cym, "plate", 0.3, seed=seed)[: dsp.n_samples(total)]
    st = st[::-1]
    st = dsp.high_shelf(st, 12000.0, -3.0)
    st /= max(dsp.peak(st), 1e-9)
    return dsp.fade(st * 0.30 * _vel(v), 0.05, 0.006)


def riser(dur: float = 2.0, seed: int = 0, start_note="F3", end_note="F5", noise_amt: float = 0.6,
          tone_amt: float = 0.4, vel: float = 0.8) -> np.ndarray:
    """Tension riser: noise sweep (400 Hz -> 7 kHz) + detuned saw glide with accelerating tremolo."""
    v = float(np.clip(vel, 0.0, 1.0))
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    nz = dsp.svf(nz, 400.0 * (7000.0 / 400.0) ** u, 1.2, "bp")
    f = dsp.glide(to_hz(start_note), to_hz(end_note), dur, None, "exp")
    tonal = sum(dsp.bl_saw(f * dsp.cents(c), dur, 40) for c in (-9.0, 0.0, 9.0)) / 3.0
    tonal += 0.5 * dsp.sine(2.0 * f, dur)
    tonal = dsp.svf(tonal, np.clip(f * 3.0, 100, 15000), 0.9, "lp")
    trem = 1.0 - 0.3 * (0.5 + 0.5 * np.sin(dsp.TAU * dsp.phase_cycles(3.0 + 11.0 * u ** 2, n)))
    st = noise_amt * nz / max(dsp.peak(nz), 1e-9) + tone_amt * dsp.pan(tonal * trem, 0.0) * SQRT2
    st *= (u ** 2)[:, None]
    st /= max(dsp.peak(st), 1e-9)
    return dsp.fade(st * 0.4 * _vel(v), 0.01, 0.012)


def sub_drop(dur: float = 1.8, seed: int = 0, f_start: float = 90.0, f_end: float = 32.0, vel: float = 0.9) -> np.ndarray:
    """Sub drop: sine diving from ``f_start`` to ``f_end`` with a 2nd harmonic for small speakers."""
    v = float(np.clip(vel, 0.0, 1.0))
    n = dsp.n_samples(dur)
    f = dsp.glide(f_start, f_end, dur, dur * 0.8, "fast")
    ph = dsp.TAU * dsp.phase_cycles(f, n)
    y = (np.sin(ph) + 0.18 * np.sin(2 * ph)) * dsp.exp_decay(dur, dur * 1.1, 0.005)
    y = dsp.saturate(y, 1.2)
    y = dsp.highpass(y, 22.0)
    y /= max(dsp.peak(y), 1e-9)
    return _out(dsp.fade(y, 0.0, 0.05), 0.5 * _vel(v), 0.0)


def impact_boom(dur: float = 2.5, seed: int = 0, pitch: float = 1.0, brightness: float = 0.5,
                vel: float = 0.9) -> np.ndarray:
    """Cinematic-but-soft impact: sub drop + punchy body + noise burst + hall tail."""
    v = float(np.clip(vel, 0.0, 1.0))
    n = dsp.n_samples(dur)
    sub = dsp.to_mono(sub_drop(dur, seed, 75.0 * pitch, 34.0 * pitch, 1.0))
    t = dsp.timebase(n)
    fb = 55.0 * pitch + 60.0 * pitch * np.exp(-t / 0.03)
    body = np.sin(dsp.TAU * dsp.phase_cycles(fb, n)) * dsp.exp_decay(dur, 0.35, 0.001)
    nz = dsp.lowpass(dsp.brown(dur, seed, "boom"), 400.0) * dsp.perc(dur, 0.001, 0.09)
    nz /= max(dsp.peak(nz), 1e-9)
    mid = dsp.bandpass(dsp.white(dur, seed, "boommid"), 1200.0, 0.8) * dsp.perc(dur, 0.0005, 0.03)
    mid /= max(dsp.peak(mid), 1e-9)
    y = 0.9 * dsp.pad_to(sub, n) + 0.8 * body + 0.35 * nz + 0.25 * brightness * mid
    st = dsp.reverb(dsp.pan(y, 0.0) * SQRT2, "hall", 0.22, seed=seed)
    st = dsp.dc_block(st, 18.0)
    st /= max(dsp.peak(st), 1e-9)
    return dsp.fade(st * 0.55 * _vel(v), 0.0, 0.08)


# ==========================================================================
# sequencing helper
# ==========================================================================


def render_events(fn: Callable, events: Iterable[tuple], bpm: float | None = None, seed: int = 0,
                  **kw) -> np.ndarray:
    """Render ``(start, dur, note[, vel])`` events with one voice into a stereo buffer.

    With ``bpm`` given, start/dur are in beats; otherwise seconds.  Event *i*
    gets seed ``seed*1000 + i`` (deterministic humanizing).  Extra keyword
    arguments are forwarded to ``fn`` (e.g. ``mallet='soft'``).
    """
    spb = 60.0 / bpm if bpm else 1.0
    tl = dsp.Timeline()
    for i, ev in enumerate(events):
        start, d, note = ev[0], ev[1], ev[2]
        vel = ev[3] if len(ev) > 3 else 0.8
        tl.add(fn(note, d * spb, vel, seed=seed * 1000 + i, **kw), start * spb)
    return tl.render()
