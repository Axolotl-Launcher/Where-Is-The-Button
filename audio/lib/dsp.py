"""
dsp.py -- core DSP toolkit for the "Axolotl Launcher" short-film sound design.

Everything in the film's soundtrack is synthesized from code; this module holds
the low-level building blocks used by `instruments.py` and `sfx.py`.

Conventions
-----------
* Sample rate: ``SR = 48000`` Hz everywhere (functions that support
  oversampled rendering take an explicit ``sr`` argument).
* Buffers are float64 numpy arrays. Mono = shape ``(n,)``; stereo = shape
  ``(n, 2)`` (frames x channels -- the layout soundfile reads/writes).
* Durations are seconds, frequencies Hz, gains dB unless documented otherwise.
* Every random draw goes through :func:`rng` with an explicit seed, so every
  function is deterministic: same arguments -> bit-identical output.
* Functions are pure (inputs are never modified).  The only stateful helper
  is :class:`Timeline`, an explicit, growable mixing canvas.
* Control parameters documented as "scalar or per-sample array" accept either
  a number or an array (cropped / extended with its last value to the length
  needed), which is how sweeps, glides and automation are expressed.
"""
from __future__ import annotations

import functools
import math
import os
import warnings
import zlib
from typing import Iterable, Sequence

import numpy as np
from scipy import ndimage as ndi
from scipy import signal as sps

SR = 48000
NYQUIST = SR / 2.0
TAU = 2.0 * np.pi
LN1000 = math.log(1000.0)  # exp(-LN1000 * t / t60) reaches -60 dB at t = t60

# --------------------------------------------------------------------------
# conversions
# --------------------------------------------------------------------------


def _ret(v):
    """Return a Python float for 0-d results, the array otherwise."""
    return float(v) if np.ndim(v) == 0 else v


def db_to_amp(db):
    """Decibels -> linear amplitude (scalar or array)."""
    return _ret(np.power(10.0, np.asarray(db, dtype=np.float64) / 20.0))


def amp_to_db(amp, floor_db: float = -240.0):
    """Linear amplitude -> decibels, clamped at ``floor_db`` (scalar or array)."""
    a = np.maximum(np.abs(np.asarray(amp, dtype=np.float64)), 10.0 ** (floor_db / 20.0))
    return _ret(20.0 * np.log10(a))


def midi_to_hz(m):
    """MIDI note number (69 = A4 = 440 Hz) -> frequency in Hz."""
    return _ret(440.0 * np.power(2.0, (np.asarray(m, dtype=np.float64) - 69.0) / 12.0))


def hz_to_midi(f):
    """Frequency in Hz -> (fractional) MIDI note number."""
    return _ret(69.0 + 12.0 * np.log2(np.asarray(f, dtype=np.float64) / 440.0))


def semitones(st):
    """Semitone offset -> frequency ratio."""
    return _ret(np.power(2.0, np.asarray(st, dtype=np.float64) / 12.0))


def cents(c):
    """Cent offset -> frequency ratio."""
    return _ret(np.power(2.0, np.asarray(c, dtype=np.float64) / 1200.0))


def n_samples(dur: float, sr: int = SR) -> int:
    """Seconds -> whole number of samples (rounded, never negative)."""
    return max(0, int(round(float(dur) * sr)))


def timebase(n: int, sr: int = SR) -> np.ndarray:
    """Time axis in seconds for ``n`` samples: ``arange(n) / sr``."""
    return np.arange(int(n), dtype=np.float64) / sr


def time_axis(dur: float, sr: int = SR) -> np.ndarray:
    """Time axis in seconds for a duration (``timebase(n_samples(dur))``)."""
    return timebase(n_samples(dur, sr), sr)


def smoothstep(u):
    """Cubic ease-in-out of ``u`` clipped to [0, 1] (scalar or array)."""
    u = np.clip(np.asarray(u, dtype=np.float64), 0.0, 1.0)
    return _ret(u * u * (3.0 - 2.0 * u))


# --------------------------------------------------------------------------
# deterministic randomness
# --------------------------------------------------------------------------


def rng(seed: int = 0, *salt) -> np.random.Generator:
    """Deterministic numpy Generator from ``seed`` plus optional salts.

    Salts (ints or strings) derive independent streams from one seed, e.g.
    ``rng(seed, "noise", 1)``.  Strings are hashed with CRC32 (stable across
    processes, unlike Python's ``hash``).
    """
    parts = [int(seed) & 0xFFFFFFFF]
    for s in salt:
        if isinstance(s, str):
            parts.append(zlib.crc32(s.encode("utf8")))
        else:
            parts.append(int(s) & 0xFFFFFFFF)
    return np.random.default_rng(parts)


# --------------------------------------------------------------------------
# buffer helpers
# --------------------------------------------------------------------------


def as_array(x) -> np.ndarray:
    """Return ``x`` as a float64 numpy array (no copy if already one)."""
    return np.asarray(x, dtype=np.float64)


def to_stereo(x) -> np.ndarray:
    """Mono (n,) -> stereo (n, 2) by duplication; stereo passes through."""
    x = as_array(x)
    if x.ndim == 1:
        return np.stack([x, x], axis=1)
    if x.shape[1] == 1:
        return np.repeat(x, 2, axis=1)
    return x


def to_mono(x) -> np.ndarray:
    """Stereo -> mono by averaging channels; mono passes through."""
    x = as_array(x)
    return x.mean(axis=1) if x.ndim == 2 else x


def silence(dur: float, stereo: bool = True) -> np.ndarray:
    """Zero buffer of ``dur`` seconds (stereo by default)."""
    n = n_samples(dur)
    return np.zeros((n, 2)) if stereo else np.zeros(n)


def duration(x) -> float:
    """Length of a buffer in seconds."""
    return len(x) / SR


def pad_to(x, n: int) -> np.ndarray:
    """Zero-pad (or crop) a mono/stereo buffer to exactly ``n`` frames."""
    x = as_array(x)
    if len(x) >= n:
        return x[:n].copy()
    pad = [(0, n - len(x))] + [(0, 0)] * (x.ndim - 1)
    return np.pad(x, pad)


def concat(sounds: Iterable, gap: float = 0.0) -> np.ndarray:
    """Concatenate sounds (converted to stereo) with ``gap`` seconds of silence between."""
    parts = []
    g = np.zeros((n_samples(gap), 2))
    for i, s in enumerate(sounds):
        if i and len(g):
            parts.append(g)
        parts.append(to_stereo(s))
    return np.concatenate(parts, axis=0) if parts else np.zeros((0, 2))


def gain(x, db: float) -> np.ndarray:
    """Scale a buffer by ``db`` decibels."""
    return as_array(x) * db_to_amp(db)


def peak(x) -> float:
    """Absolute sample peak (linear)."""
    x = as_array(x)
    return float(np.max(np.abs(x))) if x.size else 0.0


def normalize_peak(x, peak_db: float = -1.0) -> np.ndarray:
    """Scale so the sample peak equals ``peak_db`` dBFS (silence passes through)."""
    p = peak(x)
    if p <= 0:
        return as_array(x).copy()
    return as_array(x) * (db_to_amp(peak_db) / p)


def place(dst, src, at: float = 0.0, gain_db: float = 0.0) -> np.ndarray:
    """Return a new stereo buffer = ``dst`` + ``src`` starting at ``at`` seconds.

    ``dst`` may be ``None``/empty; the result grows to fit ``src``.  Negative
    ``at`` crops the beginning of ``src``.
    """
    s = to_stereo(src) * db_to_amp(gain_db)
    d = np.zeros((0, 2)) if dst is None else to_stereo(dst)
    start = int(round(at * SR))
    if start < 0:
        s = s[-start:]
        start = 0
    out = pad_to(d, max(len(d), start + len(s)))
    out[start:start + len(s)] += s
    return out


def mix(*sounds, gains_db: Sequence[float] | None = None) -> np.ndarray:
    """Sum sounds aligned at t=0 (all converted to stereo, padded to the longest)."""
    if not sounds:
        return np.zeros((0, 2))
    n = max(len(s) for s in sounds)
    out = np.zeros((n, 2))
    for i, s in enumerate(sounds):
        g = 1.0 if gains_db is None else db_to_amp(gains_db[i])
        out[: len(s)] += to_stereo(s) * g
    return out


class Timeline:
    """Growable stereo mixing canvas (the one intentionally stateful helper).

    >>> tl = Timeline()
    >>> tl.add(sound, at=1.25, gain_db=-6, pan=0.3)
    >>> buf = tl.render(dur=10.0)
    """

    def __init__(self, dur: float = 0.0, sr: int = SR):
        self.sr = sr
        self.buf = np.zeros((max(1, n_samples(dur, sr)), 2))
        self.end = n_samples(dur, sr)

    def add(self, sound, at: float = 0.0, gain_db: float = 0.0, pan: float | None = None):
        """Mix ``sound`` in at ``at`` seconds. Mono sounds are panned (equal power) if ``pan`` is given."""
        s = as_array(sound)
        if s.ndim == 1 and pan is not None:
            s = _pan(s, pan)
        elif s.ndim == 2 and pan is not None:
            s = balance(s, pan)
        s = to_stereo(s) * db_to_amp(gain_db)
        start = int(round(at * self.sr))
        if start < 0:
            s = s[-start:]
            start = 0
        need = start + len(s)
        if need > len(self.buf):
            grow = np.zeros((max(need, 2 * len(self.buf)), 2))
            grow[: len(self.buf)] = self.buf
            self.buf = grow
        self.buf[start:need] += s
        self.end = max(self.end, need)
        return self

    @property
    def duration(self) -> float:
        return self.end / self.sr

    def render(self, dur: float | None = None) -> np.ndarray:
        """Return a copy of the mix, cropped/padded to ``dur`` seconds (default: written length)."""
        n = self.end if dur is None else n_samples(dur, self.sr)
        return pad_to(self.buf[: self.end], n)


# --------------------------------------------------------------------------
# oscillators
# --------------------------------------------------------------------------


def _ctrl(v, n: int) -> np.ndarray:
    """Scalar or array-like control -> float64 array of length n (extends with last value)."""
    a = np.asarray(v, dtype=np.float64)
    if a.ndim == 0:
        return np.full(n, float(a))
    a = a.ravel()
    if len(a) >= n:
        return a[:n]
    fill = a[-1] if len(a) else 0.0
    return np.concatenate([a, np.full(n - len(a), fill)])


def phase_cycles(freq, n: int, phase: float = 0.0, sr: int = SR) -> np.ndarray:
    """Integrated phase in *cycles* for a (time-varying) frequency.

    Sample 0 has exactly ``phase``; use ``sin(TAU * phase_cycles(...))``.
    ``freq`` is a scalar or per-sample array (glides, vibrato, FM).
    """
    f = _ctrl(freq, n)
    ph = np.empty(n)
    if n:
        ph[0] = 0.0
        np.cumsum(f[:-1] / sr, out=ph[1:])
        ph += phase
    return ph


def bl_gain(f, fmax: float | None = None, sr: int = SR):
    """Band-limit taper: 1 below 0.82*fmax, raised-cosine to 0 at fmax (default 0.45*sr)."""
    fmax = 0.45 * sr if fmax is None else fmax
    f = np.abs(np.asarray(f, dtype=np.float64))
    lo = 0.82 * fmax
    u = np.clip((fmax - f) / (fmax - lo), 0.0, 1.0)
    return _ret(0.5 - 0.5 * np.cos(np.pi * u))


def sine(freq, dur: float, phase: float = 0.0, sr: int = SR) -> np.ndarray:
    """Sine oscillator (mono). ``freq`` scalar or per-sample array; ``phase`` in cycles."""
    n = n_samples(dur, sr)
    return np.sin(TAU * phase_cycles(freq, n, phase, sr))


def _polyblep(t: np.ndarray, dt: np.ndarray) -> np.ndarray:
    """PolyBLEP residual for a unit step at phase 0 (vectorized)."""
    out = np.zeros_like(t)
    m = t < dt
    if m.any():
        x = t[m] / dt[m]
        out[m] = x + x - x * x - 1.0
    m = t > 1.0 - dt
    if m.any():
        x = (t[m] - 1.0) / dt[m]
        out[m] = x * x + x + x + 1.0
    return out


def saw(freq, dur: float, phase: float = 0.5, sr: int = SR, oversample: int = 1) -> np.ndarray:
    """Band-limited rising sawtooth in [-1, 1] (polyBLEP). Default phase 0.5 starts at 0.

    polyBLEP alone leaves aliases at about -40..-55 dB for high notes;
    ``oversample=2`` (-57 dB worst case at 3.5 kHz) or ``4`` (-80 dB) renders
    at a higher rate and decimates with an anti-alias filter.
    """
    if oversample > 1:
        f = _ctrl(freq, n_samples(dur, sr))
        f_os = np.repeat(f, oversample)
        y = saw(f_os, dur, phase, sr * oversample, 1)
        return pad_to(resample(y, 1, oversample), n_samples(dur, sr))
    n = n_samples(dur, sr)
    f = _ctrl(freq, n)
    dt = np.clip(np.abs(f) / sr, 1e-9, 0.5)
    t = phase_cycles(f, n, phase, sr) % 1.0
    return 2.0 * t - 1.0 - _polyblep(t, dt)


def square(freq, dur: float, pw=0.5, phase: float = 0.0, sr: int = SR, oversample: int = 1) -> np.ndarray:
    """Band-limited pulse/square in [-1, 1] (polyBLEP). ``pw`` (pulse width) scalar or array.

    ``oversample`` as in :func:`saw` (use 2-4 for high notes).
    """
    if oversample > 1:
        nn = n_samples(dur, sr)
        f_os = np.repeat(_ctrl(freq, nn), oversample)
        w_os = np.repeat(_ctrl(pw, nn), oversample)
        y = square(f_os, dur, w_os, phase, sr * oversample, 1)
        return pad_to(resample(y, 1, oversample), nn)
    n = n_samples(dur, sr)
    f = _ctrl(freq, n)
    w = np.clip(_ctrl(pw, n), 0.02, 0.98)
    dt = np.clip(np.abs(f) / sr, 1e-9, 0.5)
    t = phase_cycles(f, n, phase, sr) % 1.0
    y = np.where(t < w, 1.0, -1.0)
    y += _polyblep(t, dt)
    y -= _polyblep((t + 1.0 - w) % 1.0, dt)
    return y


def harmonic_osc(freq, dur: float, amps: Sequence[float], phase: float = 0.0,
                 sr: int = SR, fmax: float | None = None) -> np.ndarray:
    """Additive (perfectly band-limited) oscillator: sum_k amps[k-1] * sin(k * phi).

    Harmonics are faded out smoothly as they approach ``fmax`` (default 0.45*sr),
    also while the pitch glides, so sweeps never alias.
    """
    n = n_samples(dur, sr)
    f = _ctrl(freq, n)
    ph = TAU * phase_cycles(f, n, phase, sr)
    y = np.zeros(n)
    for k, a in enumerate(amps, start=1):
        if a == 0:
            continue
        g = bl_gain(k * f, fmax, sr)
        if not np.any(g):
            break
        y += a * g * np.sin(k * ph)
    return y


def bl_saw(freq, dur: float, n_harm: int = 48, rolloff: float = 0.0, sr: int = SR) -> np.ndarray:
    """Additive band-limited saw with up to ``n_harm`` harmonics (cleanest option for glides).

    ``rolloff`` > 0 adds an extra 1/k**rolloff tilt (darker).  Starts at 0 (no click).
    """
    amps = [(2.0 / np.pi) / (k ** (1.0 + rolloff)) for k in range(1, n_harm + 1)]
    return harmonic_osc(freq, dur, amps, sr=sr)


def triangle(freq, dur: float, phase: float = 0.0, sr: int = SR, n_harm: int = 31) -> np.ndarray:
    """Band-limited triangle (additive odd harmonics, 1/k^2)."""
    amps = []
    for k in range(1, n_harm + 1):
        if k % 2 == 0:
            amps.append(0.0)
        else:
            amps.append((8.0 / np.pi ** 2) * (-1.0) ** ((k - 1) // 2) / (k * k))
    return harmonic_osc(freq, dur, amps, phase, sr)


def modal(freq, ratios: Sequence[float], amps: Sequence[float], t60s: Sequence[float],
          dur: float, attack: float = 0.001, phases: Sequence[float] | None = None,
          sr: int = SR, fmax: float | None = None) -> np.ndarray:
    """Modal synthesis: sum of exponentially decaying sinusoids (mono).

    freq   : base frequency (scalar or per-sample array for pitch bends)
    ratios : partial frequency ratios, amps: amplitudes, t60s: decay time (s) to -60 dB
    attack : raised-cosine attack (s) = mallet/hammer contact time (click-free onset)
    Partials near/above ``fmax`` (default 0.45*sr) are tapered away (no aliasing).
    """
    n = n_samples(dur, sr)
    t = timebase(n, sr)
    f = _ctrl(freq, n)
    y = np.zeros(n)
    for i, (r, a, T) in enumerate(zip(ratios, amps, t60s)):
        fk = f * r
        g = bl_gain(fk, fmax, sr)
        if not np.any(g) or a == 0:
            continue
        ph0 = 0.0 if phases is None else phases[i]
        y += a * g * np.exp(-LN1000 * t / max(T, 1e-4)) * np.sin(TAU * phase_cycles(fk, n, ph0, sr))
    if attack > 0:
        y *= attack_ramp(n, attack, sr)
    return y


def fm(freq, ratio: float, index, dur: float, mod_phase: float = 0.0, sr: int = SR) -> np.ndarray:
    """Two-operator FM (phase modulation): sin(2pi*phi_c + index * sin(2pi*phi_m)).

    ``freq`` and ``index`` may be per-sample arrays.  Render at an oversampled
    ``sr`` (and decimate with :func:`resample`) when sidebands approach Nyquist.
    """
    n = n_samples(dur, sr)
    f = _ctrl(freq, n)
    pc = phase_cycles(f, n, 0.0, sr)
    pm = phase_cycles(f * ratio, n, mod_phase, sr)
    return np.sin(TAU * pc + _ctrl(index, n) * np.sin(TAU * pm))


# --------------------------------------------------------------------------
# noise
# --------------------------------------------------------------------------


def white(dur: float, seed: int = 0, salt="", sr: int = SR) -> np.ndarray:
    """Gaussian white noise, unit RMS (mono, deterministic)."""
    return rng(seed, "white", salt).standard_normal(n_samples(dur, sr))


def _colored(dur, seed, salt, exponent, sr):
    n = n_samples(dur, sr)
    if n < 2:
        return np.zeros(n)
    w = rng(seed, "colored", salt, int(exponent * 100)).standard_normal(n)
    spec = np.fft.rfft(w)
    f = np.fft.rfftfreq(n, 1.0 / sr)
    f = np.maximum(f, 15.0)
    spec *= (1000.0 / f) ** (exponent / 2.0)
    spec[0] = 0.0
    y = np.fft.irfft(spec, n)
    y -= y.mean()
    s = y.std()
    return y / s if s > 0 else y


def pink(dur: float, seed: int = 0, salt="", sr: int = SR) -> np.ndarray:
    """Pink (1/f power) noise, unit RMS, via FFT spectral shaping (deterministic)."""
    return _colored(dur, seed, salt, 1.0, sr)


def brown(dur: float, seed: int = 0, salt="", sr: int = SR) -> np.ndarray:
    """Brown/red (1/f^2 power) noise, unit RMS, DC-free (deterministic)."""
    return _colored(dur, seed, salt, 2.0, sr)


def noise(dur: float, color: str = "white", seed: int = 0, stereo: bool = False, sr: int = SR) -> np.ndarray:
    """Noise of ``color`` in {'white','pink','brown'}; ``stereo=True`` gives decorrelated L/R."""
    fn = {"white": white, "pink": pink, "brown": brown}[color]
    if not stereo:
        return fn(dur, seed, "mono", sr)
    return np.stack([fn(dur, seed, "L", sr), fn(dur, seed, "R", sr)], axis=1)


def dust(dur: float, density, seed: int = 0, bipolar: bool = True, sr: int = SR) -> np.ndarray:
    """Sparse random impulses (Poisson process) - raw material for crackle, grains, rain.

    density : events per second, scalar or per-sample array (time-varying).
    Amplitudes are random in (0.2, 1] (random sign when ``bipolar``).
    """
    n = n_samples(dur, sr)
    d = np.maximum(_ctrl(density, n), 0.0)
    r = rng(seed, "dust")
    p = np.clip(d / sr, 0.0, 1.0)
    hit = r.random(n) < p
    amp = r.uniform(0.2, 1.0, n)
    if bipolar:
        amp *= np.where(r.random(n) < 0.5, -1.0, 1.0)
    return np.where(hit, amp, 0.0)


def grain_cloud(dur: float, density, seed: int = 0, grain: float = 0.0006, shape: str = "noise",
                sr: int = SR) -> np.ndarray:
    """Poisson cloud of tiny *windowed* grains (beads, crackle, grit) -- click-safe ``dust``.

    density : grains per second (scalar or per-sample array).
    grain   : grain length in seconds (Hann-windowed so no grain has a hard edge).
    shape   : 'noise' (broadband tick) or 'smooth' (soft Hann bump, darker).
    """
    imp = dust(dur, density, seed, True, sr)
    L = max(4, int(round(grain * sr)))
    w = np.hanning(L + 2)[1:-1]
    if shape == "noise":
        k = rng(seed, "grain_kernel").standard_normal(L) * w
    else:
        k = w / w.sum() * 4.0
    return np.convolve(imp, k)[: len(imp)]


def smooth_random(dur: float, rate: float = 3.0, seed: int = 0, sr: int = SR) -> np.ndarray:
    """Smooth random control signal in about [-1, 1] (cosine-interpolated random points at ``rate`` Hz)."""
    n = n_samples(dur, sr)
    if n == 0:
        return np.zeros(0)
    k = int(np.ceil(dur * rate)) + 2
    pts = rng(seed, "smooth_random").uniform(-1.0, 1.0, k)
    pos = timebase(n, sr) * rate
    i = np.floor(pos).astype(np.int64)
    u = pos - i
    u = 0.5 - 0.5 * np.cos(np.pi * u)
    return pts[i] * (1.0 - u) + pts[i + 1] * u


# --------------------------------------------------------------------------
# envelopes & control curves
# --------------------------------------------------------------------------


def attack_ramp(n: int, attack: float, sr: int = SR) -> np.ndarray:
    """Length-n gain curve: raised-cosine rise from 0 over ``attack`` s, then 1."""
    na = n_samples(attack, sr)
    g = np.ones(n)
    if na > 0:
        m = min(na, n)
        g[:m] = 0.5 - 0.5 * np.cos(np.pi * np.arange(m) / na)
    return g


def adsr(dur: float, attack: float = 0.005, decay: float = 0.1, sustain: float = 0.7,
         release: float = 0.1, sr: int = SR) -> np.ndarray:
    """ADSR envelope. Gate (key held) lasts ``dur`` s; output length = dur + release.

    Attack is a raised cosine 0->1, decay an exponential approach to ``sustain``
    (99% after ``decay`` s), release an exponential-shaped fall that ends exactly
    at 0 (click-free).  A gate shorter than the attack releases from where it got.
    """
    ng = n_samples(dur, sr)
    nr = n_samples(release, sr)
    t = timebase(ng, sr)
    if attack > 0:
        att = 0.5 - 0.5 * np.cos(np.pi * np.clip(t / attack, 0.0, 1.0))
    else:
        att = np.ones(ng)
    if decay > 0:
        dec = sustain + (1.0 - sustain) * np.exp(-np.maximum(t - attack, 0.0) * 4.6 / decay)
    else:
        dec = np.full(ng, float(sustain))
    gate = np.where(t < attack, att, dec)
    level = gate[-1] if ng else 0.0
    if nr > 0:
        k = 5.0
        tr = np.arange(1, nr + 1) / nr
        rel = level * (np.exp(-k * tr) - np.exp(-k)) / (1.0 - np.exp(-k))
    else:
        rel = np.zeros(0)
    return np.concatenate([gate, rel])


def exp_decay(dur: float, t60: float, attack: float = 0.001, sr: int = SR) -> np.ndarray:
    """Exponential decay envelope reaching -60 dB at ``t60`` s, with a raised-cosine attack."""
    n = n_samples(dur, sr)
    t = timebase(n, sr)
    return np.exp(-LN1000 * t / max(t60, 1e-5)) * attack_ramp(n, attack, sr)


def perc(dur: float, attack: float = 0.002, tau: float = 0.05, sr: int = SR) -> np.ndarray:
    """Percussive envelope: raised-cosine attack then exp(-t/tau) (time constant ``tau``)."""
    n = n_samples(dur, sr)
    t = timebase(n, sr)
    return np.exp(-np.maximum(t - attack, 0.0) / max(tau, 1e-5)) * attack_ramp(n, attack, sr)


def breakpoints(points: Sequence[tuple], dur: float | None = None, curve: str = "lin",
                sr: int = SR) -> np.ndarray:
    """Piecewise curve through ``[(t, value), ...]`` sampled per-sample.

    curve: 'lin' (linear), 'exp' (linear in log-domain; values must be > 0 --
    use for frequencies), 'cos' (smooth ease-in-out per segment).
    Holds the first/last value outside the given times.  ``dur`` defaults to
    the last breakpoint time.
    """
    pts = sorted(points, key=lambda p: p[0])
    ts = np.array([p[0] for p in pts], dtype=np.float64)
    vs = np.array([p[1] for p in pts], dtype=np.float64)
    dur = ts[-1] if dur is None else dur
    t = time_axis(dur, sr)
    if len(ts) == 1:
        return np.full(len(t), vs[0])
    if curve == "lin":
        return np.interp(t, ts, vs)
    if curve == "exp":
        return np.exp(np.interp(t, ts, np.log(np.maximum(vs, 1e-12))))
    if curve in ("cos", "smooth"):
        idx = np.clip(np.searchsorted(ts, t, side="right") - 1, 0, len(ts) - 2)
        t0, t1 = ts[idx], ts[idx + 1]
        span = np.where(t1 > t0, t1 - t0, 1.0)
        u = np.clip((t - t0) / span, 0.0, 1.0)
        u = 0.5 - 0.5 * np.cos(np.pi * u)
        return vs[idx] + (vs[idx + 1] - vs[idx]) * u
    raise ValueError(f"unknown curve {curve!r}")


def ramp(dur: float, start: float, end: float, curve: str = "lin", sr: int = SR) -> np.ndarray:
    """Ramp from ``start`` to ``end`` over ``dur`` (curve: 'lin', 'exp', 'cos')."""
    return breakpoints([(0.0, start), (dur, end)], dur, curve, sr)


def glide(f_start: float, f_end: float, dur: float, glide_time: float | None = None,
          curve: str = "exp", delay: float = 0.0, sr: int = SR) -> np.ndarray:
    """Per-sample pitch-glide curve (Hz) from ``f_start`` to ``f_end``.

    The move takes ``glide_time`` s (default: whole ``dur``) after ``delay`` s,
    then holds.  curve: 'exp' (constant semitones/s), 'smooth' (eased, in pitch),
    'fast' (quick start, soft landing - natural portamento), 'lin' (Hz-linear).
    """
    n = n_samples(dur, sr)
    t = timebase(n, sr)
    gt = dur if glide_time is None else max(glide_time, 1e-6)
    u = np.clip((t - delay) / gt, 0.0, 1.0)
    if curve == "lin":
        return f_start + (f_end - f_start) * u
    if curve == "smooth":
        u = u * u * (3.0 - 2.0 * u)
    elif curve == "fast":
        u = 1.0 - (1.0 - u) ** 3
    elif curve != "exp":
        raise ValueError(f"unknown curve {curve!r}")
    return f_start * np.power(f_end / f_start, u)


def vibrato(freq, dur: float, rate: float = 5.5, depth_cents: float = 12.0, delay: float = 0.15,
            fade: float = 0.3, seed: int = 0, drift: float = 0.12, sr: int = SR) -> np.ndarray:
    """Apply vibrato to a frequency (scalar or per-sample array) -> per-sample Hz array.

    Vibrato fades in after ``delay`` over ``fade`` s; ``drift`` adds a slightly
    irregular, human rate (fraction of ``rate``).
    """
    n = n_samples(dur, sr)
    f = _ctrl(freq, n)
    t = timebase(n, sr)
    wobble = 1.0 + drift * smooth_random(dur, 1.5, seed, sr)
    ph = phase_cycles(rate * wobble, n, rng(seed, "vib").random(), sr)
    depth = depth_cents * smoothstep((t - delay) / max(fade, 1e-6))
    return f * np.power(2.0, depth * np.sin(TAU * ph) / 1200.0)


# --------------------------------------------------------------------------
# filters
# --------------------------------------------------------------------------


def biquad_coeffs(kind: str, f0: float, q: float = 0.7071, gain_db: float = 0.0,
                  sr: int = SR) -> np.ndarray:
    """RBJ-cookbook biquad as a (1, 6) SOS row.

    kind: 'lp', 'hp', 'bp' (0 dB peak), 'notch', 'peak', 'lowshelf',
    'highshelf', 'allpass'.  For shelves ``q`` acts as the shelf slope S (1 = steepest monotonic).
    """
    f0 = float(np.clip(f0, 1.0, 0.495 * sr))
    w0 = TAU * f0 / sr
    cw, sw = math.cos(w0), math.sin(w0)
    A = 10.0 ** (gain_db / 40.0)
    if kind in ("lowshelf", "highshelf"):
        S = max(q, 1e-3)
        alpha = sw / 2.0 * math.sqrt(max((A + 1.0 / A) * (1.0 / S - 1.0) + 2.0, 0.0))
    else:
        alpha = sw / (2.0 * max(q, 1e-3))
    sa = 2.0 * math.sqrt(A) * alpha
    if kind == "lp":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "hp":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "bp":
        b = [alpha, 0.0, -alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "notch":
        b = [1.0, -2 * cw, 1.0]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "peak":
        b = [1 + alpha * A, -2 * cw, 1 - alpha * A]
        a = [1 + alpha / A, -2 * cw, 1 - alpha / A]
    elif kind == "lowshelf":
        b = [A * ((A + 1) - (A - 1) * cw + sa), 2 * A * ((A - 1) - (A + 1) * cw),
             A * ((A + 1) - (A - 1) * cw - sa)]
        a = [(A + 1) + (A - 1) * cw + sa, -2 * ((A - 1) + (A + 1) * cw),
             (A + 1) + (A - 1) * cw - sa]
    elif kind == "highshelf":
        b = [A * ((A + 1) + (A - 1) * cw + sa), -2 * A * ((A - 1) + (A + 1) * cw),
             A * ((A + 1) + (A - 1) * cw - sa)]
        a = [(A + 1) - (A - 1) * cw + sa, 2 * ((A - 1) - (A + 1) * cw),
             (A + 1) - (A - 1) * cw - sa]
    elif kind == "allpass":
        b = [1 - alpha, -2 * cw, 1 + alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    else:
        raise ValueError(f"unknown biquad kind {kind!r}")
    b = np.array(b) / a[0]
    a = np.array(a) / a[0]
    return np.concatenate([b, a])[None, :]


def biquad(x, kind: str, f0: float, q: float = 0.7071, gain_db: float = 0.0) -> np.ndarray:
    """Static RBJ biquad on a mono or stereo buffer (see :func:`biquad_coeffs`)."""
    x = as_array(x)
    if not len(x):
        return x.copy()
    return sps.sosfilt(biquad_coeffs(kind, f0, q, gain_db), x, axis=0)


def lowpass(x, cutoff: float, q: float = 0.7071, order: int = 2) -> np.ndarray:
    """Lowpass. ``order`` 2 = RBJ biquad with ``q``; 4/6/8 = Butterworth cascade (q ignored)."""
    return biquad(x, "lp", cutoff, q) if order <= 2 else butter(x, "lp", cutoff, order)


def highpass(x, cutoff: float, q: float = 0.7071, order: int = 2) -> np.ndarray:
    """Highpass. ``order`` 2 = RBJ biquad with ``q``; 4/6/8 = Butterworth cascade."""
    return biquad(x, "hp", cutoff, q) if order <= 2 else butter(x, "hp", cutoff, order)


def bandpass(x, center: float, q: float = 1.0) -> np.ndarray:
    """Constant 0 dB-peak bandpass (RBJ)."""
    return biquad(x, "bp", center, q)


def notch(x, center: float, q: float = 4.0) -> np.ndarray:
    """Notch (band-reject) filter."""
    return biquad(x, "notch", center, q)


def peaking(x, center: float, gain_db: float, q: float = 1.0) -> np.ndarray:
    """Peaking EQ bell (boost/cut ``gain_db`` at ``center``)."""
    return biquad(x, "peak", center, q, gain_db)


def low_shelf(x, freq: float, gain_db: float, slope: float = 1.0) -> np.ndarray:
    """Low shelf EQ."""
    return biquad(x, "lowshelf", freq, slope, gain_db)


def high_shelf(x, freq: float, gain_db: float, slope: float = 1.0) -> np.ndarray:
    """High shelf EQ."""
    return biquad(x, "highshelf", freq, slope, gain_db)


def butter(x, kind: str, cutoff, order: int = 4) -> np.ndarray:
    """Butterworth filter via SOS. kind: 'lp','hp' (cutoff Hz) or 'bp','bs' (cutoff=(lo, hi))."""
    x = as_array(x)
    btype = {"lp": "lowpass", "hp": "highpass", "bp": "bandpass", "bs": "bandstop"}[kind]
    if np.ndim(cutoff):
        wn = [float(np.clip(c, 1.0, 0.49 * SR)) for c in cutoff]
    else:
        wn = float(np.clip(cutoff, 1.0, 0.49 * SR))
    sos = sps.butter(order, wn, btype=btype, fs=SR, output="sos")
    return sps.sosfilt(sos, x, axis=0) if len(x) else x.copy()


def _svf_core(x: np.ndarray, a1: np.ndarray, a2: np.ndarray, a3: np.ndarray):
    """Per-sample Simper/Cytomic trapezoidal SVF recursion (returns band, low)."""
    v1o = []
    v2o = []
    ap1 = v1o.append
    ap2 = v2o.append
    ic1 = 0.0
    ic2 = 0.0
    for xi, b1, b2, b3 in zip(x.tolist(), a1.tolist(), a2.tolist(), a3.tolist()):
        v3 = xi - ic2
        v1 = b1 * ic1 + b2 * v3
        v2 = ic2 + b2 * ic1 + b3 * v3
        ic1 = v1 + v1 - ic1
        ic2 = v2 + v2 - ic2
        ap1(v1)
        ap2(v2)
    return np.array(v1o), np.array(v2o)


def svf(x, cutoff, q=0.7071, mode: str = "lp") -> np.ndarray:
    """Time-varying state-variable filter (Simper/Cytomic TPT topology).

    ``cutoff`` and ``q`` may be per-sample arrays -> smooth, zipper-free sweeps
    that stay stable under fast modulation.  mode: 'lp', 'hp', 'bp' (unity peak),
    'bpq' (bandpass with gain Q), 'notch', 'peak' (lp - hp), 'ap' (allpass).
    Constant parameters fall back to the equivalent RBJ biquad (faster).
    """
    x = as_array(x)
    if x.ndim == 2:
        return np.stack([svf(x[:, c], cutoff, q, mode) for c in range(x.shape[1])], axis=1)
    n = len(x)
    if n == 0:
        return x.copy()
    if np.ndim(cutoff) == 0 and np.ndim(q) == 0 and mode in ("lp", "hp", "bp", "notch"):
        return biquad(x, mode, float(cutoff), float(q))
    fc = np.clip(_ctrl(cutoff, n), 5.0, 0.49 * SR)
    g = np.tan(np.pi * fc / SR)
    k = 1.0 / np.clip(_ctrl(q, n), 0.05, 200.0)
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    v1, v2 = _svf_core(x, a1, a2, a3)
    if mode == "lp":
        return v2
    if mode == "bp":
        return k * v1
    if mode == "bpq":
        return v1
    if mode == "hp":
        return x - k * v1 - v2
    if mode == "notch":
        return x - k * v1
    if mode == "peak":
        return 2.0 * v2 - x + k * v1
    if mode == "ap":
        return x - 2.0 * k * v1
    raise ValueError(f"unknown svf mode {mode!r}")


def one_pole(x, cutoff: float, mode: str = "lp") -> np.ndarray:
    """6 dB/oct one-pole lowpass ('lp') or highpass ('hp')."""
    x = as_array(x)
    a = math.exp(-TAU * float(np.clip(cutoff, 0.01, 0.49 * SR)) / SR)
    lp = sps.lfilter([1.0 - a], [1.0, -a], x, axis=0) if len(x) else x.copy()
    return lp if mode == "lp" else x - lp


def smooth(ctrl, time_ms: float = 10.0) -> np.ndarray:
    """One-pole smoothing of a control signal (time constant ``time_ms``); starts at ctrl[0]."""
    c = as_array(ctrl)
    if not len(c) or time_ms <= 0:
        return c.copy()
    a = math.exp(-1.0 / (time_ms * 1e-3 * SR))
    zi = np.array([a * c[0]])
    y, _ = sps.lfilter([1.0 - a], [1.0, -a], c, zi=zi)
    return y


def dc_block(x, cutoff: float = 10.0) -> np.ndarray:
    """Remove DC/sub-sonic drift (2nd-order Butterworth highpass, default 10 Hz)."""
    return butter(x, "hp", cutoff, 2)


def modal_resonator(x, freqs: Sequence[float], t60s: Sequence[float],
                    gains: Sequence[float] | None = None) -> np.ndarray:
    """Bank of 2-pole resonators: each mode rings as a decaying sine (T60 per mode).

    Excite with impulses / noise bursts / stick-slip trains to get struck or
    rubbed objects (wood, plastic, rubber).  Mono or stereo in, same shape out.
    """
    x = as_array(x)
    out = np.zeros_like(x)
    gains = [1.0] * len(freqs) if gains is None else gains
    for f, T, g in zip(freqs, t60s, gains):
        if f >= 0.45 * SR or g == 0:
            continue
        w = TAU * f / SR
        r = 10.0 ** (-3.0 / (max(T, 1e-4) * SR))
        b = [g * math.sin(w)]
        a = [1.0, -2.0 * r * math.cos(w), r * r]
        out += sps.lfilter(b, a, x, axis=0)
    return out


def comb(x, delay: float, feedback: float = 0.5, damping_hz: float | None = None) -> np.ndarray:
    """Feedback comb filter (resonates at 1/delay Hz and harmonics); optional damping lowpass."""
    x = as_array(x)
    D = max(1, n_samples(delay))
    a = np.zeros(D + 2)
    a[0] = 1.0
    if damping_hz is None:
        a[D] = -feedback
        return sps.lfilter([1.0], a, x, axis=0)
    p = math.exp(-TAU * damping_hz / SR)
    # loop filter (1-p)/(1-p z^-1): denominator (1 - p z^-1) - fb (1-p) z^-D
    a = np.zeros(D + 2)
    a[0] = 1.0
    a[1] = -p
    a[D] += -feedback * (1 - p)
    return sps.lfilter([1.0, -p], a, x, axis=0)


# --------------------------------------------------------------------------
# nonlinear
# --------------------------------------------------------------------------


def resample(x, up: int, down: int) -> np.ndarray:
    """Polyphase resampling by ``up/down`` (Kaiser-windowed anti-alias FIR) along time."""
    x = as_array(x)
    if not len(x):
        return x.copy()
    return sps.resample_poly(x, up, down, axis=0)


def saturate(x, drive: float = 2.0, kind: str = "tanh", oversample: int = 2,
             mix: float = 1.0, bias: float = 0.0) -> np.ndarray:
    """Soft saturation with 2x oversampling (no aliasing from the generated harmonics).

    kind: 'tanh' (normalized so full scale stays ~full scale), 'soft' (cubic soft
    clip), 'asym' (tanh with ``bias`` -> even harmonics; DC is removed).
    ``mix`` blends dry/wet.
    """
    x = as_array(x)
    if drive <= 0 or not len(x):
        return x.copy()

    def f(v):
        if kind == "tanh":
            return np.tanh(drive * v) / math.tanh(drive)
        if kind == "soft":
            u = np.clip(drive * v, -1.0, 1.0)
            return (1.5 * u - 0.5 * u ** 3) / 1.0
        if kind == "asym":
            b = bias if bias else 0.25
            return (np.tanh(drive * v + b) - math.tanh(b)) / math.tanh(drive)
        raise ValueError(kind)

    if oversample > 1:
        y = resample(f(resample(x, oversample, 1)), 1, oversample)[: len(x)]
    else:
        y = f(x)
    if kind == "asym":
        y = dc_block(y)
    return mix * y + (1.0 - mix) * x


def soft_clip(x, threshold: float = 0.9) -> np.ndarray:
    """Gentle safety clipper: linear below ``threshold``, smooth knee up to 1.0."""
    x = as_array(x)
    t = threshold
    a = np.abs(x)
    over = np.maximum(a - t, 0.0)
    knee = (1.0 - t)
    y = np.where(a <= t, a, t + knee * np.tanh(over / max(knee, 1e-6)))
    return np.sign(x) * y


# --------------------------------------------------------------------------
# space: pan, width, chorus, delay, reverb
# --------------------------------------------------------------------------


def pan(x, pos=0.0) -> np.ndarray:
    """Equal-power pan of a mono signal -> stereo. ``pos`` in [-1 (L), 1 (R)], scalar or array.

    Uses the -3 dB-at-centre sin/cos law.  Stereo input is passed to :func:`balance`.
    """
    x = as_array(x)
    if x.ndim == 2:
        return balance(x, pos)
    p = np.clip(_ctrl(pos, len(x)), -1.0, 1.0) if np.ndim(pos) else float(np.clip(pos, -1, 1))
    th = (p + 1.0) * np.pi / 4.0
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1)


_pan = pan


def balance(x, pos=0.0) -> np.ndarray:
    """Stereo balance: attenuates the opposite side with an equal-power law (unity at centre)."""
    x = to_stereo(x)
    p = np.clip(_ctrl(pos, len(x)), -1.0, 1.0) if np.ndim(pos) else float(np.clip(pos, -1, 1))
    th = (p + 1.0) * np.pi / 4.0
    gl = np.minimum(np.cos(th) * math.sqrt(2.0), 1.0)
    gr = np.minimum(np.sin(th) * math.sqrt(2.0), 1.0)
    return np.stack([x[:, 0] * gl, x[:, 1] * gr], axis=1)


def widen(x, width: float = 1.4) -> np.ndarray:
    """Mid/side width: 0 = mono, 1 = unchanged, >1 = wider."""
    x = to_stereo(x)
    m = 0.5 * (x[:, 0] + x[:, 1])
    s = 0.5 * (x[:, 0] - x[:, 1]) * width
    return np.stack([m + s, m - s], axis=1)


def haas(x, ms: float = 8.0, side: str = "R", level: float = 1.0) -> np.ndarray:
    """Haas widening: delay one channel by ``ms`` (use small values to stay mono-safe)."""
    x = to_stereo(x)
    d = n_samples(ms / 1000.0)
    out = np.zeros((len(x) + d, 2))
    c = 1 if side == "R" else 0
    o = 1 - c
    out[: len(x), o] = x[:, o]
    out[d:, c] = x[:, c] * level
    return out


def frac_read(x: np.ndarray, pos: np.ndarray) -> np.ndarray:
    """Read mono ``x`` at fractional sample positions (4-point cubic Hermite; zero outside)."""
    x = as_array(x)
    i = np.floor(pos).astype(np.int64)
    f = pos - i
    xp = np.concatenate([[0.0, 0.0], x, [0.0, 0.0, 0.0]])
    off = 2

    def g(k):
        idx = i + k + off
        ok = (idx >= 0) & (idx < len(xp))
        return np.where(ok, xp[np.clip(idx, 0, len(xp) - 1)], 0.0)

    xm1, x0, x1, x2 = g(-1), g(0), g(1), g(2)
    c1 = 0.5 * (x1 - xm1)
    c2 = xm1 - 2.5 * x0 + 2.0 * x1 - 0.5 * x2
    c3 = 0.5 * (x2 - xm1) + 1.5 * (x0 - x1)
    return ((c3 * f + c2) * f + c1) * f + x0


def chorus(x, rate: float = 0.45, depth_ms: float = 2.2, delay_ms: float = 13.0, voices: int = 3,
           mix: float = 0.35, spread: float = 0.9, seed: int = 0) -> np.ndarray:
    """Multi-voice stereo chorus (modulated fractional delays, Hermite interpolation).

    Returns stereo of the same length; ``mix`` = wet amount (0..1).
    """
    xs = to_stereo(x)
    n = len(xs)
    if n == 0:
        return xs.copy()
    src = xs.mean(axis=1)
    t = timebase(n)
    r = rng(seed, "chorus")
    wet = np.zeros((n, 2))
    for v in range(voices):
        rv = rate * (1.0 + 0.17 * v + r.uniform(-0.04, 0.04))
        lfo = np.sin(TAU * (rv * t + r.random())) + 0.25 * smooth_random(n / SR, 0.7, seed * 31 + v)
        d_ms = delay_ms * (1.0 + 0.23 * v) + depth_ms * lfo
        y = frac_read(src, np.arange(n) - d_ms * SR / 1000.0)
        p = 0.0 if voices == 1 else spread * (-1.0 + 2.0 * v / (voices - 1))
        if v % 2:
            p = -p
        wet += pan(y, p) * (math.sqrt(2.0) / math.sqrt(voices))
    return xs * (1.0 - mix) + wet * mix


def delay(x, time: float = 0.3, feedback: float = 0.35, mix: float = 0.25, damping_hz: float = 4500.0,
          highpass_hz: float = 150.0, pingpong: bool = False, tail: bool = True) -> np.ndarray:
    """Feedback echo with a damped feedback path (lowpass + highpass), optional ping-pong.

    Processed in delay-length blocks (vectorized).  Output is stereo and, with
    ``tail=True``, extended until the echoes fall below -60 dB.
    """
    xs = to_stereo(x)
    n = len(xs)
    D = max(1, n_samples(time))
    fb = float(np.clip(feedback, 0.0, 0.95))
    reps = int(math.ceil(math.log(1e-3) / math.log(fb))) if fb > 0 else 1
    N = n + (D * (reps + 1) if tail else 0)
    inp = np.zeros((N, 2))
    inp[:n] = xs
    if pingpong:
        m = inp.mean(axis=1)
        inp = np.stack([m, np.zeros(N)], axis=1)
    line = np.zeros((N, 2))
    sos = np.concatenate([biquad_coeffs("lp", damping_hz, 0.6), biquad_coeffs("hp", highpass_hz, 0.6)])
    zi = np.zeros((sos.shape[0], 2, 2))
    for s in range(D, N, D):
        e = min(s + D, N)
        prev = line[s - D:e - D]
        filt, zi = sps.sosfilt(sos, prev, axis=0, zi=zi)
        if pingpong:
            filt = filt[:, ::-1]
        line[s:e] = inp[s - D:e - D] + fb * filt
    out = np.zeros((N, 2))
    out[:n] = xs * (1.0 - mix)
    out += line * mix
    return out


REVERB_PRESETS = {
    # rt60 at 125 Hz / 1 kHz / 8 kHz, pre-delay, early reflections, density build-up, tone
    "room": dict(rt=(0.75, 0.55, 0.28), predelay=0.004, er_n=16, er_t=(0.002, 0.038), er_gain=0.55,
                 er_decay=0.020, onset=0.010, hp=110.0, lp=9500.0),
    "hall": dict(rt=(2.70, 2.10, 1.05), predelay=0.020, er_n=26, er_t=(0.008, 0.085), er_gain=0.38,
                 er_decay=0.055, onset=0.035, hp=70.0, lp=7500.0),
    "plate": dict(rt=(1.50, 1.75, 1.25), predelay=0.002, er_n=0, er_t=(0.0, 0.0), er_gain=0.0,
                  er_decay=0.0, onset=0.004, hp=180.0, lp=12500.0),
}


@functools.lru_cache(maxsize=32)
def _reverb_ir_cached(preset: str, seed: int, decay: float) -> np.ndarray:
    p = REVERB_PRESETS[preset]
    rt_lo, rt_mid, rt_hi = (r * decay for r in p["rt"])
    rt_max = max(rt_lo, rt_mid, rt_hi)
    n = n_samples(rt_max * 1.1 + p["predelay"] + 0.06)
    t = timebase(n)
    freqs = np.fft.rfftfreq(n, 1.0 / SR)
    centers = 31.25 * 2.0 ** np.arange(10)  # 31 Hz .. 16 kHz octave bands
    rts = np.interp(np.log2(centers), np.log2([125.0, 1000.0, 8000.0]), [rt_lo, rt_mid, rt_hi])
    lf = np.log2(np.maximum(freqs, 1.0))
    lc = np.log2(centers)
    masks = []
    for i in range(len(centers)):
        onehot = np.zeros(len(centers))
        onehot[i] = 1.0
        masks.append(np.interp(lf, lc, onehot))  # partition of unity in log-frequency
    ir = np.zeros((n, 2))
    pre = n_samples(p["predelay"])
    for ch in range(2):
        r = rng(seed, "reverb", preset, ch)
        spec = np.fft.rfft(r.standard_normal(n))
        tail = np.zeros(n)
        for m, rt in zip(masks, rts):
            tail += np.fft.irfft(spec * m, n) * np.exp(-LN1000 * t / rt)
        tail *= attack_ramp(n, p["onset"])
        er = np.zeros(n)
        if p["er_n"]:
            lo, hi = p["er_t"]
            times = np.sort(r.uniform(lo, hi, p["er_n"]))
            for tt in times:
                k = n_samples(tt)
                if k < n:
                    er[k] += r.choice([-1.0, 1.0]) * p["er_gain"] * math.exp(-(tt - lo) / p["er_decay"]) * r.uniform(0.6, 1.0)
            er = one_pole(er, 6500.0)
            tail *= np.clip(t / max(hi, 1e-3), 0.0, 1.0) ** 0.5  # tail grows in under the reflections
        sig = tail / max(np.sqrt(np.sum(tail ** 2)), 1e-12) + er * 0.35
        sig = np.concatenate([np.zeros(pre), sig])[:n]
        ir[:, ch] = sig
    ir = butter(ir, "hp", p["hp"], 2)
    ir = butter(ir, "lp", p["lp"], 2)
    ir = fade(ir, 0.0, 0.05)  # tail is already ~-60 dB; guarantee it ends exactly at zero
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))  # unit energy per channel
    ir.flags.writeable = False
    return ir


def reverb_ir(preset: str = "room", seed: int = 0, decay: float = 1.0) -> np.ndarray:
    """Generated stereo impulse response (unit energy per channel, cached).

    Decaying, decorrelated noise with frequency-dependent RT60 (10 octave bands),
    density build-up and sparse early reflections.  presets: 'room', 'hall', 'plate'.
    ``decay`` scales all RT60s.
    """
    return _reverb_ir_cached(preset, int(seed), float(decay))


def reverb_send(x, preset: str = "room", seed: int = 0, decay: float = 1.0,
                image: float = 0.35) -> np.ndarray:
    """100% wet stereo reverb return (length = len(x) + IR length - 1).

    ``image`` (0..1) keeps some of the source's left/right image in the tail
    (0 = the tail is fed from the mono sum).
    """
    xs = to_stereo(x)
    if not len(xs):
        return xs.copy()
    ir = reverb_ir(preset, seed, decay)
    m = xs.mean(axis=1, keepdims=True)
    src = (1.0 - image) * m + image * xs
    return sps.oaconvolve(src, ir, mode="full", axes=0)


def reverb(x, preset: str = "room", mix: float = 0.2, seed: int = 0, decay: float = 1.0,
           tail: bool = True) -> np.ndarray:
    """Convolution reverb insert: (1-mix)*dry + mix*wet; stereo out, tail kept if ``tail``."""
    xs = to_stereo(x)
    wet = reverb_send(xs, preset, seed, decay)
    out = wet * mix
    out[: len(xs)] += xs * (1.0 - mix)
    return out if tail else out[: len(xs)]


# --------------------------------------------------------------------------
# dynamics
# --------------------------------------------------------------------------


def compressor(x, threshold_db: float = -18.0, ratio: float = 3.0, attack_ms: float = 8.0,
               release_ms: float = 150.0, knee_db: float = 6.0, makeup_db: float = 0.0,
               sidechain=None, rms_ms: float = 0.0, block: int = 16) -> np.ndarray:
    """Feed-forward compressor (soft knee, attack/release in the dB domain).

    Detector = linked peak (or RMS over ``rms_ms``) of ``sidechain`` (default: x),
    evaluated at a control rate of SR/``block``; gain is interpolated per sample.
    """
    xs = as_array(x)
    n = len(xs)
    if n == 0:
        return xs.copy()
    sc = xs if sidechain is None else as_array(sidechain)
    det = np.abs(sc) if sc.ndim == 1 else np.abs(sc).max(axis=1)
    det = pad_to(det, n)
    if rms_ms > 0:
        det = np.sqrt(2.0 * ndi.uniform_filter1d(det ** 2, max(1, n_samples(rms_ms / 1000))))
    nb = int(math.ceil(n / block))
    det_b = pad_to(det, nb * block).reshape(nb, block).max(axis=1)
    lvl = 20.0 * np.log10(np.maximum(det_b, 1e-9))
    over = lvl - threshold_db
    slope = 1.0 / ratio - 1.0
    if knee_db > 0:
        gr = np.where(over <= -knee_db / 2, 0.0,
                      np.where(over >= knee_db / 2, slope * over,
                               slope * (over + knee_db / 2) ** 2 / (2 * knee_db)))
    else:
        gr = np.minimum(slope * over, 0.0)
    csr = SR / block
    aa = math.exp(-1.0 / max(attack_ms * 1e-3 * csr, 1e-6))
    ar = math.exp(-1.0 / max(release_ms * 1e-3 * csr, 1e-6))
    s = 0.0
    out = []
    ap = out.append
    for v in gr.tolist():
        if v < s:
            s = aa * s + (1.0 - aa) * v
        else:
            s = ar * s + (1.0 - ar) * v
        ap(s)
    centers = (np.arange(nb) + 0.5) * block
    g = db_to_amp(np.interp(np.arange(n), centers, np.array(out)) + makeup_db)
    return xs * (g[:, None] if xs.ndim == 2 else g)


def limiter(x, ceiling_db: float = -1.0, lookahead_ms: float = 1.5, release_ms: float = 120.0,
            true_peak: bool = True) -> np.ndarray:
    """Look-ahead brickwall limiter (offline, vectorized, true-peak aware).

    Gain = required reduction -> min-hold over +/-lookahead -> constant-rate
    release (recovers 10 dB per ``release_ms``) -> double moving-average smoothing.
    The hold window spans the smoothing kernel, so no sample (or 4x-oversampled
    inter-sample peak) exceeds ``ceiling_db``.
    """
    xs = as_array(x)
    n = len(xs)
    if n == 0:
        return xs.copy()
    c = db_to_amp(ceiling_db)
    a = np.abs(xs) if xs.ndim == 1 else np.abs(xs).max(axis=1)
    if true_peak:
        up = resample(xs, 4, 1)
        ua = np.abs(up) if up.ndim == 1 else np.abs(up).max(axis=1)
        ua = pad_to(ua, 4 * n).reshape(n, 4).max(axis=1)
        a = np.maximum(a, ua)
        a = np.maximum(a, np.concatenate([[0.0], a[:-1]]))
    g_req = np.minimum(1.0, c / np.maximum(a, 1e-12))
    L = max(2, 2 * int(math.ceil(n_samples(lookahead_ms / 1000.0) / 2)))
    h = ndi.minimum_filter1d(g_req, size=2 * L + 1, mode="nearest")
    r = 10.0 / max(1, n_samples(release_ms / 1000.0))
    hdb = 20.0 * np.log10(np.maximum(h, 1e-12))
    idx = np.arange(n, dtype=np.float64)
    rel = r * idx + np.minimum.accumulate(hdb - r * idx)
    hdb = np.minimum(hdb, rel)
    g = 10.0 ** (hdb / 20.0)
    g = ndi.uniform_filter1d(g, size=L + 1, mode="nearest")
    g = ndi.uniform_filter1d(g, size=L + 1, mode="nearest")
    y = xs * (g[:, None] if xs.ndim == 2 else g)
    tp = true_peak_db(y) if true_peak else amp_to_db(peak(y))
    if tp > ceiling_db:
        y *= db_to_amp(ceiling_db - tp)
    return y


# --------------------------------------------------------------------------
# levels & loudness
# --------------------------------------------------------------------------


def peak_db(x) -> float:
    """Sample peak in dBFS."""
    return amp_to_db(peak(x))


def true_peak_db(x, oversample: int = 4) -> float:
    """True-peak estimate in dBTP (``oversample``x polyphase interpolation)."""
    x = as_array(x)
    if not len(x):
        return -240.0
    return amp_to_db(peak(resample(x, oversample, 1)))


def rms_db(x) -> float:
    """RMS level in dBFS (all channels together)."""
    x = as_array(x)
    return amp_to_db(math.sqrt(float(np.mean(x ** 2)))) if x.size else -240.0


_METER = None


def lufs(x) -> float:
    """Integrated loudness (ITU-R BS.1770-4 via pyloudnorm), LUFS.

    Buffers shorter than 0.5 s are zero-padded so a value is always returned
    (for very short sounds this behaves like a momentary-loudness reading).
    """
    global _METER
    import pyloudnorm as pyln

    if _METER is None:
        _METER = pyln.Meter(SR)
    xs = to_stereo(x)
    if len(xs) < n_samples(0.5):
        xs = pad_to(xs, n_samples(0.5))
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        v = _METER.integrated_loudness(xs)
    return float(v) if np.isfinite(v) else -240.0


def normalize_lufs(x, target: float = -16.0) -> np.ndarray:
    """Gain a buffer so its integrated loudness equals ``target`` LUFS (no limiting)."""
    L = lufs(x)
    if L <= -200:
        return as_array(x).copy()
    return gain(x, target - L)


def master(x, target_lufs: float = -16.0, ceiling_dbtp: float = -1.0, release_ms: float = 120.0,
           iterations: int = 6) -> np.ndarray:
    """Loudness-normalize to ``target_lufs`` then true-peak limit to ``ceiling_dbtp``.

    Iterates gain -> limiter -> measure until within 0.1 LU (limiting can lower
    loudness).  Returns stereo.
    """
    xs = dc_block(to_stereo(x), 15.0)
    g = target_lufs - lufs(xs)
    y = xs
    for _ in range(iterations):
        y = limiter(gain(xs, g), ceiling_db=ceiling_dbtp - 0.1, release_ms=release_ms)
        err = target_lufs - lufs(y)
        if abs(err) < 0.1:
            break
        g += err
    return y


# --------------------------------------------------------------------------
# fades, trimming, finishing, I/O
# --------------------------------------------------------------------------


def fade(x, fade_in: float = 0.0, fade_out: float = 0.0) -> np.ndarray:
    """Equal-power (sin^2) fades; the first/last sample become exactly 0 (click-free)."""
    y = as_array(x).copy()
    n = len(y)
    ni = min(n_samples(fade_in), n)
    no = min(n_samples(fade_out), n)
    if ni > 0:
        w = np.sin(0.5 * np.pi * np.arange(ni) / ni) ** 2
        y[:ni] *= w[:, None] if y.ndim == 2 else w
    if no > 0:
        w = np.cos(0.5 * np.pi * np.arange(1, no + 1) / no) ** 2
        y[n - no:] *= w[:, None] if y.ndim == 2 else w
    return y


def trim(x, thresh_db: float = -80.0, head: bool = False, keep: float = 0.003) -> np.ndarray:
    """Drop trailing (and optionally leading) samples quieter than ``thresh_db`` dBFS."""
    x = as_array(x)
    if not len(x):
        return x.copy()
    a = np.abs(x) if x.ndim == 1 else np.abs(x).max(axis=1)
    loud = np.nonzero(a > db_to_amp(thresh_db))[0]
    if not len(loud):
        return x[:0].copy()
    k = n_samples(keep)
    end = min(len(x), loud[-1] + 1 + k)
    start = max(0, loud[0] - k) if head else 0
    return x[start:end].copy()


def finalize(x, peak_db: float | None = None, fade_in: float = 0.0005, fade_out: float = 0.004,
             trim_db: float | None = -80.0, dc: bool = True, stereo: bool = True) -> np.ndarray:
    """Make a sound delivery-clean: NaN guard, DC block, trim silent tail, click-free fades,
    optional peak normalization (``peak_db`` dBFS), stereo output."""
    y = np.nan_to_num(as_array(x), nan=0.0, posinf=0.0, neginf=0.0)
    if dc:
        y = dc_block(y)
    if trim_db is not None:
        y = trim(y, trim_db)
    y = fade(y, fade_in, fade_out)
    if peak_db is not None:
        y = normalize_peak(y, peak_db)
    return to_stereo(y) if stereo else y


def write_wav(path: str, x, sr: int = SR, subtype: str = "PCM_24") -> str:
    """Write a 24-bit PCM WAV (stereo). Refuses NaN/inf; clips (with a warning) above 0 dBFS."""
    import soundfile as sf

    y = to_stereo(as_array(x))
    if not np.all(np.isfinite(y)):
        raise ValueError(f"non-finite samples in {path}")
    p = peak(y)
    if p > 1.0:
        warnings.warn(f"{os.path.basename(path)}: peak {amp_to_db(p):+.2f} dBFS clipped")
        y = np.clip(y, -1.0, 1.0)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    sf.write(path, y, sr, subtype=subtype)
    return path


def read_wav(path: str):
    """Read any WAV -> (float64 array (n, ch), sample_rate)."""
    import soundfile as sf

    data, sr = sf.read(path, dtype="float64", always_2d=True)
    return data, sr
