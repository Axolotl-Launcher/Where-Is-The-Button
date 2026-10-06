"""
sfx.py -- parameterized cartoon / UI foley for the "Axolotl Launcher" short.

Aesthetic: restrained, tactile, premium product-UI foley (soft rubber, plastic,
paper, wood, glass, air) with Pixar-ish character timing -- no 8-bit bleeps.
Recipes are classic physically-inspired ones: modal resonators for struck
objects, stick-slip impulse trains for rubber creaks, band-passed noise sweeps
for air, Helmholtz-style pitch sweeps for pops, FM bells for the hologram.

Every generator
---------------
* is pure and deterministic: ``seed`` selects the variation (pitch jitter,
  noise, timing); the same arguments give bit-identical audio;
* returns stereo float64 ``(n, 2)`` at 48 kHz, DC-free, with click-free fades,
  trimmed tail, normalized to a *nominal peak* (see ``fn.nominal_peak_db``,
  listed in ``CATALOG``) -- ``gain_db`` offsets it;
* takes ``pitch`` (ratio) or ``note``/``root`` (note name, MIDI int or Hz)
  where tonal, so the sound can be tuned to the score (defaults sit in F major).

Use ``CATALOG[name]`` to look functions up by name and ``DEMO_VARIANTS`` for
the curated list of variants rendered by ``render_demo.py``.
"""
from __future__ import annotations

import functools
import math
from typing import Callable

import numpy as np

try:  # package import
    from . import dsp
    from . import instruments as ins
except ImportError:  # pragma: no cover - direct script use
    import dsp  # type: ignore
    import instruments as ins  # type: ignore

SR = dsp.SR
SQRT2 = math.sqrt(2.0)

#: name -> generator (every public SFX function registers itself here)
CATALOG: dict[str, Callable[..., np.ndarray]] = {}


def _sfx(peak_db: float, fade_in: float = 0.0004, fade_out: float = 0.006, trim_rel_db: float = -56.0):
    """Decorator: register in CATALOG and finish the sound (DC, fades, exact peak, tail trimmed
    56 dB below the peak (never below -66 dBFS), stereo).

    The wrapped function may return ``y`` or ``(y, offset_db)`` (variant-specific level).
    """

    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*args, seed: int = 0, gain_db: float = 0.0, **kw):
            res = fn(*args, seed=seed, **kw)
            y, off = (res if isinstance(res, tuple) else (res, 0.0))
            target = peak_db + off + gain_db
            y = np.nan_to_num(dsp.as_array(y))
            y = dsp.dc_block(dsp.to_stereo(y), 12.0)
            y = dsp.normalize_peak(dsp.fade(y, fade_in, 0.0), target)
            y = dsp.trim(y, max(target + trim_rel_db, -66.0))
            return dsp.fade(y, 0.0, fade_out)

        wrapper.nominal_peak_db = peak_db
        wrapper.__doc__ = (fn.__doc__ or "").rstrip() + (
            f"\n\n    Common kwargs: ``seed`` (variation), ``gain_db`` (offset from the nominal "
            f"{peak_db:+.0f} dBFS peak).  Returns stereo (n, 2) float64 @ 48 kHz.\n")
        CATALOG[fn.__name__] = wrapper
        return wrapper

    return deco


# --------------------------------------------------------------------------
# building blocks
# --------------------------------------------------------------------------


def _hz(note) -> float:
    return ins.to_hz(note)


def _jit(seed: int, salt: str, semis: float) -> float:
    """Deterministic pitch jitter ratio within +/- ``semis`` semitones."""
    return dsp.semitones(dsp.rng(seed, salt).uniform(-semis, semis))


def _click(dur: float, seed: int, salt: str, center: float, q: float = 0.8, tau: float = 0.0008,
           attack: float = 0.0002) -> np.ndarray:
    """Band-passed noise transient normalized to peak 1 (mono)."""
    w = dsp.white(dur, seed, salt) * dsp.perc(dur, attack, tau)
    y = dsp.bandpass(w, center, q)
    return y / max(dsp.peak(y), 1e-12)


def _thump(f0: float, f1: float, dur: float, t60: float, glide_tau: float = 0.03,
           attack: float = 0.0015) -> np.ndarray:
    """Pitch-settling sine thump (f0 -> f1 with time constant ``glide_tau``), mono."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    f = f1 + (f0 - f1) * np.exp(-t / glide_tau)
    return np.sin(dsp.TAU * dsp.phase_cycles(f, n)) * dsp.exp_decay(dur, t60, attack)


def _ping(f, dur: float, t60: float, ratios=(1.0,), amps=(1.0,), attack: float = 0.0004) -> np.ndarray:
    """Damped (multi-)partial tone; partials decay faster with ratio (mono)."""
    t60s = [t60 / (r ** 0.6) for r in ratios]
    return dsp.modal(f, list(ratios), list(amps), t60s, dur, attack)


def _layer(dur: float, *parts) -> np.ndarray:
    """Sum parts ``(signal, at_s, gain[, pan])`` into a stereo buffer at least ``dur`` long."""
    tl = dsp.Timeline(dur)
    for p in parts:
        sig, at, g = p[0], p[1], p[2]
        pn = p[3] if len(p) > 3 else 0.0
        s = dsp.as_array(sig)
        if s.ndim == 1:
            s = dsp.pan(s, pn) * SQRT2
        tl.add(s * g, at)
    return tl.render()


def _norm(y: np.ndarray) -> np.ndarray:
    return y / max(dsp.peak(y), 1e-12)


# ==========================================================================
# UI
# ==========================================================================


@_sfx(-14.0, fade_in=0.0002)
def ui_click(seed: int = 0, pitch: float = 1.0) -> np.ndarray:
    """Crisp tiny UI click (~40 ms): bright tick + small plastic body + air transient."""
    j = pitch * _jit(seed, "ui_click", 0.4)
    dur = 0.045
    tick = _ping(2900.0 * j, dur, 0.022, (1.0, 2.13), (1.0, 0.3), 0.0002)
    body = _ping(1150.0 * j, dur, 0.035, (1.0,), (1.0,), 0.0004)
    air = _click(dur, seed, "uic", 5200.0 * j, 0.9, 0.0005)
    return _layer(dur, (tick, 0, 1.0), (body, 0, 0.45), (air, 0, 0.35))


@_sfx(-9.0)
def button_press(seed: int = 0, pitch: float = 1.0, hold: float = 0.12) -> np.ndarray:
    """Soft rubbery button press-in (squishy 'thup') + release ('tup' rising) after ``hold`` s."""
    j = pitch * _jit(seed, "button_press", 0.3)
    dur_p = 0.16
    n = dsp.n_samples(dur_p)
    t = dsp.timebase(n)
    thup = _thump(250.0 * j, 165.0 * j, dur_p, 0.09, 0.02, 0.002)
    rub = _ping(430.0 * j, dur_p, 0.06)
    sq = dsp.svf(dsp.white(dur_p, seed, "bp_sq"), 1600.0 * j * (550.0 / 1600.0) ** np.clip(t / 0.07, 0, 1), 3.5, "bp")
    sq = _norm(sq * dsp.perc(dur_p, 0.003, 0.018))
    clk = _click(0.02, seed, "bp_c", 3800.0 * j, 0.9, 0.0004)
    dur_r = 0.14
    tr = dsp.timebase(dsp.n_samples(dur_r))
    tup = _thump(200.0 * j, 300.0 * j, dur_r, 0.07, 0.025, 0.0015)
    squ = dsp.svf(dsp.white(dur_r, seed, "bp_sq2"), 600.0 * j * (1500.0 / 600.0) ** np.clip(tr / 0.05, 0, 1), 3.0, "bp")
    squ = _norm(squ * dsp.perc(dur_r, 0.002, 0.012))
    clk2 = _click(0.02, seed, "bp_c2", 3200.0 * j, 0.9, 0.0004)
    return _layer(hold + dur_r,
                  (thup, 0, 1.0), (rub, 0, 0.3), (sq, 0, 0.3), (clk, 0, 0.22),
                  (tup, hold, 0.6), (squ, hold, 0.18), (clk2, hold, 0.14))


@_sfx(-18.0, fade_in=0.0002)
def hover_tick(seed: int = 0, pitch: float = 1.0) -> np.ndarray:
    """Very soft, airy hover tick (~30 ms) - nearly subliminal UI feedback."""
    j = pitch * _jit(seed, "hover", 0.3)
    dur = 0.032
    a = _ping(4200.0 * j, dur, 0.012)
    b = _ping(2100.0 * j, dur, 0.02)
    c = _click(dur, seed, "hov", 7000.0 * j, 0.8, 0.00025)
    return _layer(dur, (a, 0, 1.0), (b, 0, 0.35), (c, 0, 0.2))


@_sfx(-20.0, fade_in=0.0002)
def caret_tick(seed: int = 0, pitch: float = 1.0) -> np.ndarray:
    """Text-caret blink tick: a tiny glassy 'tik' meant to sit far back in the mix."""
    j = pitch * _jit(seed, "caret", 0.2)
    dur = 0.03
    y = _ping(3300.0 * j, dur, 0.012, (1.0, 2.0), (1.0, 0.2), 0.0002)
    return _layer(dur, (y, 0, 1.0), (_click(dur, seed, "car", 6500.0, 0.8, 0.0002), 0, 0.15))


@_sfx(-18.0, fade_in=0.0002)
def key_click(seed: int = 0, vel: float = 0.7, space: bool = False) -> np.ndarray:
    """One soft laptop (scissor) key: bottom-out clack + 'tock' + lighter release click.

    Every seed varies pitch, brightness and release timing; ``space=True`` gives
    the deeper, longer space-bar version; ``vel`` 0..1 changes level and brightness.
    """
    r = dsp.rng(seed, "key")
    jf = (0.78 if space else 1.0) * (1 + r.uniform(-0.08, 0.08))
    rel_t = r.uniform(0.045, 0.075) * (1.3 if space else 1.0)
    v = float(np.clip(vel, 0.05, 1.0))
    clack = _click(0.02, seed, "kc", 2800.0 * jf * (0.85 + 0.3 * v), 1.0, 0.0012)
    tock = _ping(450.0 * jf, 0.05, 0.03 * (1.6 if space else 1.0), (1.0, 2.3), (1.0, 0.3))
    plastic = _ping(1350.0 * jf, 0.03, 0.02)
    rel = _click(0.015, seed, "kr", 3600.0 * jf, 1.0, 0.0008)
    rel_tock = _ping(600.0 * jf, 0.03, 0.02)
    y = _layer(rel_t + 0.04, (clack, 0, 1.0), (tock, 0, 0.6), (plastic, 0, 0.3),
               (rel, rel_t, 0.35), (rel_tock, rel_t, 0.2))
    return y, 20 * math.log10(0.4 + 0.6 * v) - 20 * math.log10(0.82)


@_sfx(-16.0, fade_in=0.0002)
def typing(seed: int = 0, keys: int = 8, speed: float = 1.0, vel: float = 0.7) -> np.ndarray:
    """A burst of ``keys`` soft key presses with human timing (occasional space bar / pause).

    ``speed`` scales the typing rate (1.0 ~ 9 keys/s).
    """
    r = dsp.rng(seed, "typing")
    tl = dsp.Timeline()
    t = 0.0
    for i in range(keys):
        space = i > 0 and r.random() < 0.15
        v = float(np.clip(vel * r.uniform(0.75, 1.1), 0.05, 1.0))
        k = key_click(seed=seed * 101 + i, vel=v, space=space)
        tl.add(k, t, gain_db=-0.0, pan=None)
        gap = r.uniform(0.075, 0.15) / speed
        if r.random() < 0.12:
            gap += r.uniform(0.08, 0.2) / speed
        t += gap
    return tl.render()


@_sfx(-13.0)
def toggle_switch(seed: int = 0, on: bool = True, pitch: float = 1.0,
                  note_on="A6", note_off="E6") -> np.ndarray:
    """Toggle switch flick: lever release click, snap into detent, tiny tuned 'tink' (up for on)."""
    r = dsp.rng(seed, "toggle")
    j = pitch * (1 + r.uniform(-0.02, 0.02))
    gap = 0.028 + r.uniform(-0.004, 0.004)
    first = _click(0.02, seed, "tg1", 3000.0 * j, 0.9, 0.0006)
    snap = _click(0.02, seed, "tg2", 4200.0 * j, 0.9, 0.0008)
    body = _thump((310.0 if on else 240.0) * j, (270.0 if on else 200.0) * j, 0.1, 0.05, 0.01, 0.001)
    tink = _ping(_hz(note_on if on else note_off) * pitch, 0.2, 0.09, (1.0, 2.76), (1.0, 0.2), 0.0005)
    return _layer(gap + 0.2, (first, 0, 0.35), (snap, gap, 0.9), (body, gap, 0.5), (tink, gap + 0.002, 0.18))


# ==========================================================================
# character motion: pops, boings, rubber, air
# ==========================================================================


@_sfx(-8.0)
def pop(seed: int = 0, pitch: float = 1.0, kind: str = "bubble") -> np.ndarray:
    """Pop. kind='bubble': rising-pitch 'bloop' (Minnaert-style sweep);
    kind='cork': thump + crack + Helmholtz 'plonk' + a breath of air."""
    j = pitch * _jit(seed, "pop", 0.5)
    if kind == "bubble":
        dur = 0.1
        n = dsp.n_samples(dur)
        t = dsp.timebase(n)
        f = 520.0 * j * (1.0 + 1.6 * (1.0 - np.exp(-t / 0.022)))
        ph = dsp.TAU * dsp.phase_cycles(f, n)
        env = dsp.perc(dur, 0.0015, 0.016)
        y = (np.sin(ph) + 0.12 * np.sin(2 * ph)) * env
        return _layer(dur, (y, 0, 1.0), (_click(0.02, seed, "lip", 1800.0 * j, 0.8, 0.0006), 0, 0.12))
    dur = 0.3
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    thump = _thump(210.0 * j, 120.0 * j, dur, 0.08, 0.015)
    crack = _click(dur, seed, "cork", 1900.0 * j, 1.1, 0.0035)
    fh = 640.0 * j * (1.0 - 0.15 * (1.0 - np.exp(-t / 0.03)))
    plonk = np.sin(dsp.TAU * dsp.phase_cycles(fh, n)) * dsp.perc(dur, 0.001, 0.025)
    hiss = _norm(dsp.bandpass(dsp.white(dur, seed, "hiss"), 6000.0, 0.7) * dsp.perc(dur, 0.004, 0.05))
    return _layer(dur, (thump, 0, 0.6), (crack, 0, 0.7), (plonk, 0.002, 0.5), (hiss, 0.003, 0.06))


_BOING = {
    "short": dict(note="C4", dur=0.38, rate=13.0, depth=0.07, tw=0.12),
    "long": dict(note="A3", dur=0.95, rate=9.0, depth=0.09, tw=0.35),
    "low": dict(note="C3", dur=0.6, rate=8.0, depth=0.08, tw=0.22),
    "high": dict(note="F4", dur=0.32, rate=16.0, depth=0.05, tw=0.1),
}


@_sfx(-9.0)
def boing(seed: int = 0, variant: str = "short", note=None) -> np.ndarray:
    """Spring 'boing': warm harmonic source with a scooped attack, decaying pitch wobble
    and a moving 'oy->ng' formant. variant: 'short' | 'long' | 'low' | 'high';
    ``note`` overrides the base pitch (defaults C4 / A3 / C3 / F4, in F major)."""
    spec = _BOING[variant]
    f0 = _hz(note if note is not None else spec["note"]) * _jit(seed, "boing", 0.15)
    dur = spec["dur"]
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    scoop = np.power(2.0, -4.0 * np.exp(-t / 0.018) / 12.0)
    wob = 1.0 + spec["depth"] * np.exp(-t / spec["tw"]) * np.sin(dsp.TAU * spec["rate"] * t)
    drift = np.power(2.0, 0.5 * (t / dur) / 12.0)
    f = f0 * scoop * wob * drift
    src = dsp.bl_saw(f, dur, 24, rolloff=0.6)
    fm1 = 450.0 + 450.0 * (1.0 - np.exp(-t / 0.05))
    fm2 = 1100.0 + 1300.0 * (1.0 - np.exp(-t / 0.08))
    y = 0.7 * dsp.svf(src, fm1, 3.0, "bp") + 0.45 * dsp.svf(src, fm2, 4.0, "bp") + 0.35 * dsp.sine(f, dur)
    y *= dsp.exp_decay(dur, dur * 0.95, 0.004)
    y = dsp.saturate(_norm(y), 1.3)
    pl = _click(0.03, seed, "boingpl", 2500.0, 0.8, 0.002)
    return _layer(dur, (y, 0, 1.0), (pl, 0, 0.12))


def _rubber_creak(dur: float, rate_from: float, rate_to: float, seed: int, pitch: float,
                  jitter: float = 0.08) -> np.ndarray:
    """Stick-slip impulse train (rate glides from->to) ringing rubbery resonances (mono)."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    rate = rate_from * (rate_to / rate_from) ** u
    jit = 1.0 + jitter * dsp.smooth_random(dur, 40.0, seed)
    ph = dsp.phase_cycles(rate * jit, n)
    idx = np.nonzero(np.diff(np.floor(ph)) > 0)[0] + 1
    imp = np.zeros(n)
    imp[idx] = dsp.rng(seed, "rubber").uniform(0.5, 1.0, len(idx))
    imp = np.convolve(imp, np.hanning(18)[1:-1])[:n]  # ~0.33 ms soft slip pulses (no hard edges)
    y = dsp.modal_resonator(imp, [520.0 * pitch, 1150.0 * pitch, 2300.0 * pitch],
                            [0.03, 0.02, 0.012], [1.0, 0.6, 0.3])
    return _norm(y)


@_sfx(-10.0)
def squash(seed: int = 0, dur: float = 0.32, pitch: float = 1.0) -> np.ndarray:
    """Rubbery squash: falling stick-slip creak + downward elastic tone + wet low 'squelch'."""
    j = pitch * _jit(seed, "squash", 0.4)
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    creak = _rubber_creak(dur, 220.0 * j, 60.0 * j, seed, j)
    f = dsp.glide(420.0 * j, 150.0 * j, dur, dur * 0.8, "fast")
    tone = dsp.harmonic_osc(f, dur, [1.0, 0.35, 0.12])
    sq = dsp.svf(dsp.white(dur, seed, "squelch"), 900.0 * (300.0 / 900.0) ** np.clip(t / (0.6 * dur), 0, 1), 3.0, "bp")
    env = dsp.perc(dur, 0.01, dur * 0.4)
    return _layer(dur, (creak * env, 0, 0.55), (tone * env, 0, 0.5), (_norm(sq) * env, 0, 0.35))


@_sfx(-10.0)
def stretch(seed: int = 0, dur: float = 0.5, pitch: float = 1.0) -> np.ndarray:
    """Elastic stretch 'zwiip': rising stick-slip creak + rising elastic tone, tension crescendo."""
    j = pitch * _jit(seed, "stretch", 0.4)
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    creak = _rubber_creak(dur, 70.0 * j, 240.0 * j, seed + 7, j)
    f = dsp.glide(180.0 * j, 520.0 * j, dur, None, "exp")
    tone = dsp.harmonic_osc(f, dur, [1.0, 0.3, 0.1])
    tone = dsp.svf(tone, f * 3.0, 0.8, "lp")
    env = (0.25 + 0.75 * u ** 0.7) * dsp.attack_ramp(n, 0.02)
    env *= np.clip((dur - t) / 0.04, 0.0, 1.0)
    return _layer(dur, (creak * env, 0, 0.6), (tone * env, 0, 0.45))


@_sfx(-8.0, fade_out=0.01)
def whoosh(seed: int = 0, dur: float = 0.6, weight: str = "light", pan_from: float = -0.6,
           pan_to: float = 0.6) -> np.ndarray:
    """Air whoosh (0.2-1.5 s): pink noise through a band-pass whose centre and level
    follow a 'pass-by' bell (peak at 62%), with a stereo pan sweep.
    weight='light' (650 Hz-4.8 kHz, airy whistle) or 'heavy' (160 Hz-1.5 kHz + rumble + sub)."""
    dur = float(np.clip(dur, 0.15, 2.0))
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    pk = 0.62
    env = np.where(u < pk, np.sin(0.5 * np.pi * np.clip(u / pk, 0, 1)) ** 1.6,
                   dsp.smoothstep((1.0 - u) / (1.0 - pk)) ** 1.2)
    heavy = weight == "heavy"
    lo, hi, q = (160.0, 1500.0, 0.9) if heavy else (650.0, 4800.0, 1.3)
    j = _jit(seed, "whoosh", 1.0)
    fc = lo * j * (hi / lo) ** env
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    y = _norm(dsp.svf(nz, fc, q, "bp")) * env[:, None]
    if heavy:
        rum = _norm(dsp.lowpass(dsp.brown(dur, seed, "rum"), 180.0)) * env ** 1.5
        sub = dsp.sine(dsp.glide(70.0, 45.0, dur), dur) * env
        y = y + dsp.pan(rum * 0.5 + sub * 0.22, 0.0) * SQRT2
    else:
        wh = _norm(dsp.svf(nz[:, 0], fc * 1.6, 9.0, "bp")) * env
        y = y + dsp.pan(wh * 0.12, 0.0) * SQRT2
    y = dsp.balance(y, pan_from + (pan_to - pan_from) * dsp.smoothstep(u))
    return y, (1.0 if heavy else 0.0)


@_sfx(-11.0, fade_out=0.008)
def swish(seed: int = 0, dur: float = 0.18, pitch: float = 1.0, pan_from: float = -0.4,
          pan_to: float = 0.4) -> np.ndarray:
    """Fast pass-by swish (0.1-0.3 s): bright band-pass sweep 1.8 -> 6 -> 1.8 kHz with a hint of tone."""
    dur = float(np.clip(dur, 0.08, 0.4))
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    env = np.where(u < 0.3, dsp.smoothstep(u / 0.3), dsp.smoothstep((1.0 - u) / 0.7) ** 1.5)
    fc = 1800.0 * pitch * (1.0 + 2.5 * np.sin(np.pi * u))
    nz = dsp.noise(dur, "white", seed, stereo=True)
    y = _norm(dsp.svf(nz, fc, 1.6, "bp")) * env[:, None]
    tone = _norm(dsp.svf(nz[:, 1], fc * 0.7, 6.0, "bp")) * env
    y = y + dsp.pan(tone * 0.25, 0.0) * SQRT2
    return dsp.balance(y, pan_from + (pan_to - pan_from) * u)


@_sfx(-16.0, fade_out=0.02)
def fall_whistle(seed: int = 0, dur: float = 1.1, start_note="G6", end_note="G4") -> np.ndarray:
    """Descending slide whistle (accelerating fall) with breath noise and gentle vibrato."""
    f0, f1 = _hz(start_note), _hz(end_note)
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    lf = math.log(f0) + (math.log(f1) - math.log(f0)) * dsp.smoothstep(u ** 1.25)
    f = dsp.vibrato(np.exp(lf), dur, 5.5, 22.0, 0.05, 0.2, seed)
    tone = dsp.harmonic_osc(f, dur, [1.0, 0.06, 0.02])
    breath = _norm(dsp.svf(dsp.white(dur, seed, "fw"), f, 6.0, "bp")) * 0.08
    air = _norm(dsp.highpass(dsp.white(dur, seed, "fwa"), 3000.0)) * 0.015
    env = dsp.pad_to(dsp.adsr(dur - 0.1, 0.04, 0.2, 0.9, 0.1), n) * (1.0 - 0.35 * u)
    y = (tone + breath + air) * env
    y = dsp.svf(y, 9000.0 - 6000.0 * u, 0.7, "lp")
    return y


@_sfx(-5.0, fade_out=0.02)
def thud(seed: int = 0, weight: float = 1.0, plastic: float = 0.4) -> np.ndarray:
    """Weighty soft thump (landing): settling low body + a hint of plastic knock + impact noise.

    ``weight`` > 1 = heavier/lower/longer; ``plastic`` 0..1 = amount of hard-shell knock.
    """
    j = _jit(seed, "thud", 0.6)
    dur = 0.5
    body = _thump(110.0 / weight ** 0.3 * j, 60.0 / weight ** 0.2, dur, 0.3 * weight ** 0.3, 0.025, 0.0015)
    thock = _ping(165.0 * j / weight ** 0.2, dur, 0.09, (1.0, 2.1), (1.0, 0.3), 0.001)  # reads on small speakers
    knock = dsp.modal(420.0 * j, [1.0, 2.29, 4.12], [1.0, 0.55, 0.25], [0.07, 0.04, 0.02], dur, 0.0006)
    imp = _norm(dsp.lowpass(dsp.pink(dur, seed, "thud"), 900.0) * dsp.perc(dur, 0.0008, 0.012))
    y = _layer(dur, (body, 0, 1.0), (thock, 0, 0.45), (knock, 0, 0.55 * plastic), (imp, 0, 0.45))
    y = dsp.saturate(_norm(y), 1.4)
    return dsp.reverb(y, "room", 0.08, seed=seed)


@_sfx(-5.0, fade_out=0.02)
def land(seed: int = 0, weight: float = 1.3, plastic: float = 0.55) -> np.ndarray:
    """Character landing on a surface: a slightly heavier, more 'plasticky' :func:`thud`."""
    return thud(seed=seed, weight=weight, plastic=plastic)


@_sfx(-11.0)
def bounce_tap(seed: int = 0, pitch: float = 1.0, material: str = "plastic") -> np.ndarray:
    """Light tap of the button bouncing on a card. material: 'plastic' | 'wood'.
    Each seed varies the pitch (+/-1.5 st) like hitting different spots."""
    j = pitch * _jit(seed, "tap", 1.5)
    dur = 0.18
    if material == "wood":
        y = dsp.modal(620.0 * j, [1.0, 2.57, 4.9], [1.0, 0.45, 0.2], [0.07, 0.03, 0.015], dur, 0.0003)
    else:
        y = dsp.modal(780.0 * j, [1.0, 2.31, 4.12, 6.7], [1.0, 0.6, 0.35, 0.15], [0.09, 0.05, 0.03, 0.018], dur, 0.0003)
    clk = _click(0.02, seed, "tapc", 4500.0, 0.9, 0.0005)
    card = _thump(240.0 * j, 200.0 * j, dur, 0.06, 0.01, 0.0008)
    return _layer(dur, (y, 0, 1.0), (clk, 0, 0.3), (card, 0, 0.3))


@_sfx(-13.0, fade_out=0.03)
def slide(seed: int = 0, dur: float = 0.6, surface: str = "card", pitch: float = 1.0) -> np.ndarray:
    """Slide / scrape along a surface: friction noise with grain modulation.
    surface='card' (smooth papery glide) or 'rough' (adds stick-slip chatter)."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    speed = dsp.breakpoints([(0.0, 0.0), (0.08, 1.0), (max(dur - 0.12, 0.1), 0.8), (dur, 0.0)], dur, "cos")
    grain = 1.0 + 0.6 * dsp.smooth_random(dur, 35.0, seed)
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    fc = 2400.0 * pitch * (0.8 + 0.4 * speed)
    y = _norm(dsp.svf(nz, fc, 0.9, "bp")) * (speed * grain)[:, None]
    sheen = dsp.comb(dsp.to_mono(y), 1.0 / (330.0 * pitch), 0.45, 3000.0)
    y = y + dsp.pan(_norm(sheen) * 0.25, 0.0) * SQRT2
    if surface == "rough":
        imp = dsp.grain_cloud(dur, 300.0 * speed + 5.0, seed, grain=0.0004, shape="smooth")
        ch = dsp.modal_resonator(imp, [1800.0 * pitch, 3300.0 * pitch], [0.02, 0.012], [1.0, 0.5])
        y = y + dsp.pan(_norm(ch) * 0.5 * speed, 0.1) * SQRT2
    return y


@_sfx(-13.0)
def card_flip(seed: int = 0, pitch: float = 1.0) -> np.ndarray:
    """Paper / card flip 'fwip': fluttering band-pass sweep + soft landing tap."""
    dur = 0.22
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    env = dsp.perc(dur, 0.008, 0.035)
    flutter = 1.0 - 0.55 * np.exp(-t / 0.05) * (0.5 + 0.5 * np.sin(dsp.TAU * 42.0 * t))
    fc = 900.0 * pitch * (4200.0 / 900.0) ** dsp.smoothstep(t / 0.07)
    y = _norm(dsp.svf(dsp.noise(dur, "white", seed, stereo=True), fc, 1.4, "bp")) * (env * flutter)[:, None]
    tap = _ping(1100.0 * pitch, 0.08, 0.04, (1.0, 2.4), (1.0, 0.3), 0.0004)
    low = _thump(190.0, 170.0, 0.08, 0.04, 0.01, 0.001)
    return _layer(dur, (y, 0, 1.0), (tap, 0.105, 0.25), (low, 0.105, 0.15))


# ==========================================================================
# launcher machinery: install, download, map, projector, hologram
# ==========================================================================


@_sfx(-14.0, fade_out=0.04)
def install_ticks(seed: int = 0, n: int = 8, interval: float = 0.11, root="F5",
                  mode: str = "major_pent", accel: float = 0.8) -> np.ndarray:
    """Install-progress ticks: ``n`` soft tuned blips stepping up a scale (accelerating)."""
    notes = ins.scale(root, mode, 3)[:n]
    tl = dsp.Timeline()
    t = 0.0
    for i, m in enumerate(notes):
        k = i / max(1, n - 1)
        f = _hz(int(m))
        blip = _ping(f, 0.16, 0.12, (1.0, 5.9), (1.0, 0.15), 0.0008)
        clk = _click(0.02, seed + i, "it", 5000.0, 0.9, 0.0004)
        g = 0.6 + 0.4 * k
        tl.add(dsp.pan(blip * g + 0.3 * g * dsp.pad_to(clk, len(blip)), -0.3 + 0.6 * k) * SQRT2, t)
        t += interval * accel ** k
    return dsp.reverb(tl.render(), "plate", 0.12, seed=seed)


@_sfx(-9.0, fade_out=0.05)
def success_chime(seed: int = 0, root="F5", quality: str = "maj9", spacing: float = 0.065) -> np.ndarray:
    """Tuned success chime: celesta arpeggio of the chord (+glock sparkle on top, soft marimba root)."""
    r0 = int(round(ins.to_midi(root)))
    iv = ins.CHORDS[quality]
    arp = [r0 + iv[0], r0 + iv[1], r0 + iv[2], r0 + 12, r0 + 12 + (iv[4] - 12 if len(iv) > 4 else iv[1])]
    tl = dsp.Timeline()
    for i, m in enumerate(arp):
        tl.add(ins.celesta(int(m), 1.3, 0.55 + 0.08 * i, seed=seed + i, pan=-0.35 + 0.18 * i), i * spacing)
    tl.add(ins.glockenspiel(int(arp[-1]) + 12, 1.0, 0.4, seed=seed, pan=0.3), (len(arp) - 1) * spacing)
    tl.add(ins.glockenspiel(int(arp[-2]) + 12, 1.0, 0.3, seed=seed + 1, pan=-0.2), (len(arp) - 1) * spacing + 0.02)
    tl.add(ins.marimba(r0 - 12, 1.0, 0.5, seed=seed, mallet="soft", pan=0.0), 0.0)
    return dsp.reverb(tl.render(), "plate", 0.22, seed=seed)


@_sfx(-11.0, fade_out=0.01)
def download_zip(seed: int = 0, dur: float = 0.5, pitch: float = 1.0, pan_from: float = 0.7) -> np.ndarray:
    """Download 'fly-in': airy descending zip that glides in from ``pan_from`` and lands with a soft 'tuk'."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    land_t = 0.82 * dur
    f = dsp.glide(1500.0 * pitch, 380.0 * pitch, dur, land_t, "fast")
    env = dsp.attack_ramp(n, 0.015) * np.clip((land_t + 0.03 - t) / 0.06, 0.0, 1.0)
    src = dsp.bl_saw(f, dur, 30, rolloff=0.8)
    zipt = dsp.svf(src, f * 4.0, 0.8, "lp")
    air = _norm(dsp.svf(dsp.white(dur, seed, "dz"), np.clip(f * 3.0, 200, 16000), 1.5, "bp"))
    body = (_norm(zipt) * 0.55 + air * 0.5) * env
    moving = dsp.pan(body, pan_from * (1.0 - dsp.smoothstep(u / 0.82))) * SQRT2
    tuk = _ping(520.0 * pitch, 0.12, 0.06, (1.0, 2.4), (1.0, 0.3), 0.0004)
    clk = _click(0.02, seed, "dzc", 3800.0, 0.9, 0.0005)
    return _layer(dur + 0.12, (moving, 0, 1.0), (tuk, land_t, 0.55), (clk, land_t, 0.2))


@_sfx(-8.0, fade_out=0.02)
def pin_drop(seed: int = 0, pitch: float = 1.0) -> np.ndarray:
    """Map pin drop: wooden peg 'tok' + small thunk into the map, with two tiny bounces."""
    j = pitch * _jit(seed, "pin", 0.5)
    dur = 0.45

    def peg(k):
        return dsp.modal(780.0 * j * k, [1.0, 2.6, 4.8], [1.0, 0.4, 0.15], [0.08, 0.04, 0.02], dur, 0.0003)

    thunk = _thump(150.0 * j, 95.0 * j, dur, 0.12, 0.02, 0.001)
    surf = _norm(dsp.lowpass(dsp.white(dur, seed, "pins"), 2000.0) * dsp.perc(dur, 0.0005, 0.008))
    return _layer(dur + 0.15, (peg(1.0), 0, 1.0), (thunk, 0, 0.7), (surf, 0, 0.3),
                  (peg(1.03), 0.075, 0.3), (thunk, 0.075, 0.25), (peg(1.05), 0.125, 0.1))


@_sfx(-15.0, fade_in=0.01, fade_out=0.03)
def map_rustle(seed: int = 0, dur: float = 0.8) -> np.ndarray:
    """Map pan rustle: paper crinkle grains (3 bands, spread in stereo) over a soft papery swish."""
    n = dsp.n_samples(dur)
    env = dsp.breakpoints([(0.0, 0.0), (0.15 * dur, 1.0), (0.7 * dur, 0.8), (dur, 0.0)], dur, "cos")
    r = dsp.rng(seed, "rustle")
    grains = dsp.dust(dur, 260.0 * env + 10.0, seed)
    sel = r.integers(0, 3, n)
    out = np.zeros((n, 2))
    for b, (fc, pn) in enumerate([(2200.0, -0.4), (3800.0, 0.3), (6500.0, 0.0)]):
        kern = r.standard_normal(72) * np.hanning(74)[1:-1]  # 1.5 ms crinkle grain (not a raw impulse)
        s = dsp.bandpass(np.convolve(grains * (sel == b), kern)[:n], fc, 1.2)
        out += dsp.pan(s, pn) * SQRT2
    bed = dsp.svf(dsp.noise(dur, "pink", seed + 3, stereo=True), 600.0 + 900.0 * env, 0.8, "bp")
    return _norm(out) + 0.35 * _norm(bed) * env[:, None]


def _motor(dur: float, f0, seed: int) -> np.ndarray:
    """Projector motor + shutter whirr + fan (mono components summed to stereo)."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    f = dsp._ctrl(f0, n) * (1.0 + 0.002 * dsp.smooth_random(dur, 2.0, seed))
    motor = dsp.lowpass(dsp.harmonic_osc(f, dur, [1.0, 0.5, 0.25, 0.12, 0.06]), 600.0)
    shutter = f / 55.0 * 24.0
    flutter = 1.0 - 0.45 * (0.5 + 0.5 * np.sin(dsp.TAU * dsp.phase_cycles(shutter, n)))
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    whirr = _norm(dsp.svf(nz, np.clip(950.0 * f / 55.0, 100, 8000), 2.0, "bp")) * flutter[:, None]
    fan = _norm(dsp.lowpass(nz, 2500.0))
    ph = dsp.phase_cycles(shutter, n)
    ticks = np.zeros(n)
    idx = np.nonzero(np.diff(np.floor(ph)) > 0)[0] + 1
    ticks[idx] = 1.0
    tk = dsp.modal_resonator(ticks, [1800.0], [0.01], [1.0])
    y = (dsp.pan(_norm(motor) * 0.5 + _norm(tk) * 0.05, 0.0) * SQRT2 + whirr * 0.4 + fan * 0.2)
    return y


@_sfx(-20.0, fade_in=0.25, fade_out=0.4)
def projector_hum(seed: int = 0, dur: float = 3.0, pitch: float = 1.0) -> np.ndarray:
    """Running projector: low motor hum (55 Hz + harmonics), 24 fps shutter flutter, fan air.
    Loop-friendly bed; fades in/out over 0.25/0.4 s."""
    return _motor(dur, 55.0 * pitch, seed)


@_sfx(-9.0, fade_out=0.05)
def projector_click(seed: int = 0, on: bool = True, pitch: float = 1.0) -> np.ndarray:
    """Projector switch 'ka-chunk' + motor spin-up (on) or spin-down (off)."""
    dur = 1.0
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    if on:
        f = 55.0 * pitch * (0.35 + 0.65 * dsp.smoothstep(t / 0.5))
        lvl = dsp.smoothstep(t / 0.25) * (1.0 - 0.6 * dsp.smoothstep((t - 0.5) / 0.5))
    else:
        f = 55.0 * pitch * (1.0 - 0.75 * dsp.smoothstep(t / 0.8))
        lvl = 1.0 - dsp.smoothstep(t / 0.85)
    spin = _motor(dur, f, seed) * lvl[:, None]
    c1 = _click(0.03, seed, "pc1", 2600.0, 0.9, 0.0015)
    c2 = _click(0.03, seed, "pc2", 3400.0, 0.9, 0.001)
    th = _thump(130.0, 90.0, 0.2, 0.08, 0.02, 0.001)
    return _layer(dur, (c1, 0, 0.8), (c2, 0.034, 0.6), (th, 0.034, 0.6), (_norm(spin), 0.02, 0.28))


@_sfx(-12.0, fade_in=0.02, fade_out=0.3)
def hologram_shimmer(seed: int = 0, dur: float = 2.5, root="F5", quality: str = "maj9",
                     density: float = 10.0) -> np.ndarray:
    """Hologram shimmer: a cloud of glassy FM-bell grains on chord tones (2 octaves), chorus
    sparkle, airy noise and a faint flickering drone; plate space."""
    r = dsp.rng(seed, "holo")
    base = int(round(ins.to_midi(root)))
    pool = [base + i for i in ins.CHORDS[quality]] + [base + 12 + i for i in ins.CHORDS[quality][:3]]
    k = max(3, int(density * dur))
    times = np.sort(r.uniform(0.0, dur * 0.85, k))
    tl = dsp.Timeline(dur)
    for i, tt in enumerate(times):
        m = int(r.choice(pool))
        ratio = 2.0 if r.random() < 0.6 else 3.5
        b = ins.fm_bell(m, 0.5, r.uniform(0.3, 0.7), seed=seed + i, pan=r.uniform(-0.8, 0.8),
                        ratio=ratio, index=1.3, release=0.3, decay=r.uniform(0.6, 1.2))
        tl.add(b, tt)
    cloud = tl.render()
    n = len(cloud)
    t = dsp.timebase(n)
    air = _norm(dsp.svf(dsp.noise(n / SR, "white", seed, stereo=True), 9000.0, 0.7, "bp"))
    air *= (0.5 + 0.5 * dsp.smooth_random(n / SR, 1.5, seed))[:, None] * 0.05
    drone = dsp.sine(_hz(base - 12), n / SR) * (1.0 - 0.3 * (0.5 + 0.5 * np.sin(dsp.TAU * 7.0 * t))) * 0.06
    y = _norm(cloud) + air + dsp.pan(drone, 0.0) * SQRT2
    env = dsp.attack_ramp(n, 0.25) * np.clip((n / SR - t) / 0.6, 0.0, 1.0)
    y = dsp.chorus(y * env[:, None], 0.8, 2.5, 9.0, 3, 0.4, 1.0, seed)
    return dsp.reverb(y, "plate", 0.3, seed=seed)


@_sfx(-13.0, fade_out=0.05)
def sparkle(seed: int = 0, dur: float = 0.9, root="F6", direction: str = "down") -> np.ndarray:
    """Magic sparkle: a quick run of tiny glassy pings on a pentatonic scale + high glitter."""
    r = dsp.rng(seed, "sparkle")
    pool = ins.scale(root, "major_pent", 2)
    k = 12
    tl = dsp.Timeline(dur)
    for i in range(k):
        x = i / (k - 1)
        tt = dur * 0.7 * x ** 1.3
        idx = int(round((1.0 - x if direction == "down" else x) * (len(pool) - 1)))
        idx = int(np.clip(idx + r.integers(-1, 2), 0, len(pool) - 1))
        f = _hz(int(pool[idx]))
        p = _ping(f, 0.5, r.uniform(0.25, 0.4), (1.0, 2.76), (1.0, 0.25), 0.0005)
        tl.add(dsp.pan(p * (1.0 - 0.6 * x), -0.6 + 1.2 * x) * SQRT2, tt)
    y = tl.render()
    n = len(y)
    t = dsp.timebase(n)
    glint = np.sin(dsp.TAU * 9500.0 * np.arange(32) / SR) * np.hanning(34)[1:-1]
    glit = np.convolve(dsp.dust(n / SR, 500.0 * np.clip(1.0 - t / dur, 0, 1), seed), glint)[:n]
    glit = dsp.highpass(glit, 7000.0)
    y = _norm(y) + dsp.pan(_norm(glit) * 0.15, 0.2) * SQRT2
    return dsp.reverb(y, "plate", 0.28, seed=seed)


@_sfx(-9.0, fade_out=0.015)
def riser_tuned(seed: int = 0, dur: float = 1.5, start_note="F3", end_note="F5",
                direction: str = "up") -> np.ndarray:
    """Tuned riser. direction='up': crescendo glide start->end (rise);
    'down': the 'return' - starts bright and glides end->start while fading (projected back home)."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    a, b = _hz(start_note), _hz(end_note)
    if direction == "down":
        a, b = b, a
    f = dsp.glide(a, b, dur, None, "exp")
    tonal = sum(dsp.bl_saw(f * dsp.cents(c), dur, 40, rolloff=0.3) for c in (-8.0, 0.0, 8.0)) / 3.0
    tonal = tonal + 0.5 * dsp.sine(2.0 * f, dur) + 0.3 * dsp.sine(1.5 * f, dur)
    tonal = dsp.svf(tonal, np.clip(f * 3.5, 100, 15000), 0.9, "lp")
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    if direction == "down":
        nfc = 7000.0 * (400.0 / 7000.0) ** u
        amp = dsp.attack_ramp(n, 0.04) * (1.0 - u) ** 1.5
    else:
        nfc = 400.0 * (7000.0 / 400.0) ** u
        amp = (0.03 + 0.97 * u ** 2) * dsp.attack_ramp(n, 0.01)
    noisy = _norm(dsp.svf(nz, nfc, 1.2, "bp"))
    trem = 1.0 - 0.25 * (0.5 + 0.5 * np.sin(dsp.TAU * dsp.phase_cycles(3.0 + 11.0 * (u if direction == "up" else 1 - u) ** 2, n)))
    y = dsp.pan(_norm(tonal) * trem * 0.6, 0.0) * SQRT2 + noisy * 0.45
    return y * amp[:, None]


@_sfx(-6.0, fade_out=0.02)
def snap_into_place(seed: int = 0, pitch: float = 1.0, note="C6") -> np.ndarray:
    """Satisfying snap-into-place clunk: slide-in tick, plastic body + knock, tight click, sub,
    and a tiny tuned confirmation 'tink' (``note``)."""
    j = pitch * _jit(seed, "snap", 0.3)
    dur = 0.5
    pre = _click(0.02, seed, "sp0", 5000.0, 0.9, 0.0004)
    body = _thump(215.0 * j, 165.0 * j, dur, 0.12, 0.012, 0.001)
    knock = dsp.modal(640.0 * j, [1.0, 2.21, 3.73], [1.0, 0.5, 0.22], [0.07, 0.04, 0.02], dur, 0.0003)
    clk = _click(0.02, seed, "sp1", 3200.0, 0.9, 0.0007)
    sub = _thump(75.0, 60.0, dur, 0.15, 0.02, 0.002)
    tink = _ping(_hz(note) * pitch, dur, 0.25, (1.0, 2.76), (1.0, 0.15), 0.0005)
    m = 0.028
    y = _layer(dur + m, (pre, 0, 0.15), (body, m, 0.8), (knock, m, 0.6), (clk, m, 0.7),
               (sub, m, 0.35), (tink, m + 0.012, 0.12))
    return dsp.reverb(y, "room", 0.1, seed=seed)


@_sfx(-6.0, fade_out=0.03)
def heartbeat(seed: int = 0, bpm: float = 72.0, beats: int = 2, intensity: float = 0.8) -> np.ndarray:
    """Suspense heartbeat: soft low 'lub-dub' thumps (``beats`` cycles at ``bpm``)."""
    period = 60.0 / bpm
    gap = 0.27 * math.sqrt(72.0 / bpm)
    tl = dsp.Timeline()
    for b in range(beats):
        t0 = b * period
        for k, (f0, f1, g) in enumerate([(68.0, 46.0, 1.0), (78.0, 52.0, 0.72)]):
            th = _thump(f0, f1, 0.35, 0.22, 0.03, 0.004)
            th2 = _thump(2.0 * f0, 2.0 * f1, 0.35, 0.12, 0.03, 0.004)
            nz = _norm(dsp.lowpass(dsp.brown(0.35, seed + b * 2 + k, "hb"), 450.0) * dsp.perc(0.35, 0.002, 0.02))
            s = (th + 0.35 * th2 + 0.3 * nz) * g * (0.85 + 0.15 * intensity)
            tl.add(dsp.pan(s, 0.0) * SQRT2, t0 + k * gap)
    y = dsp.lowpass(tl.render(), 700.0)
    return dsp.reverb(y, "room", 0.06, seed=seed)


# ==========================================================================
# final launch sequence
# ==========================================================================


@_sfx(-6.0, fade_out=0.015)
def power_up(seed: int = 0, dur: float = 1.6, root="F3") -> np.ndarray:
    """Power-up swell into the launch: a tuned detuned-saw chord (root, 5th, octave, 10th)
    opening from dark to bright, rising turbine tone, noise riser, sub swell; ends at its peak."""
    r0 = ins.to_hz(root)
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    u = t / dur
    chord = np.zeros(n)
    for semis in (0, 7, 12, 16):
        f = r0 * dsp.semitones(semis)
        for c in (-7.0, 0.0, 7.0):
            chord += dsp.saw(f * dsp.cents(c), dur, phase=dsp.rng(seed, "pu", semis, int(c)).random(),
                             oversample=2)
    chord = _norm(dsp.svf(chord, 250.0 * (7000.0 / 250.0) ** (u ** 1.5), 1.2, "lp"))
    chord *= (0.04 + 0.96 * u ** 1.6) * dsp.attack_ramp(n, 0.01)  # audible from t=0, swells to the end
    turb = dsp.sine(dsp.glide(2.0 * r0, 8.0 * r0, dur, None, "exp"), dur) * 0.25 * u ** 2
    nz = _norm(dsp.svf(dsp.noise(dur, "pink", seed, stereo=True), 500.0 * (9000.0 / 500.0) ** u, 1.0, "bp")) * (u ** 2)[:, None]
    sub = dsp.sine(r0 / 2.0, dur) * u ** 1.5
    trem = 1.0 - 0.2 * u * (0.5 + 0.5 * np.sin(dsp.TAU * dsp.phase_cycles(4.0 + 14.0 * u ** 2, n)))
    mono = (_norm(chord) * 0.8 + turb + sub * 0.4) * trem
    y = dsp.pan(mono, 0.0) * SQRT2 + nz * 0.35
    return dsp.chorus(y, 0.6, 1.5, 10.0, 2, 0.3, 0.8, seed)


@_sfx(-3.0, fade_out=0.1)
def launch_impact(seed: int = 0, root="F") -> np.ndarray:
    """Bright launch impact: tuned sub boom (root in octave 1) + glock/celesta/EP add9 stab
    + crack + airy cymbal shimmer in a hall."""
    rname = root if isinstance(root, str) else ins.midi_to_name(int(round(ins.to_midi(root))))[:-1]
    rname = rname.rstrip("0123456789-")
    f1 = _hz(f"{rname}1")
    boom = ins.impact_boom(2.8, seed, pitch=f1 / 34.0, brightness=0.6, vel=1.0)
    stab = dsp.Timeline()
    base5 = ins.note_to_midi(f"{rname}5")
    for i, iv in enumerate([0, 4, 7, 14]):
        m = base5 + iv
        stab.add(ins.glockenspiel(m, 2.0, 0.75, seed=seed + i), 0.0)
        stab.add(ins.celesta(m - 12, 1.6, 0.7, seed=seed + i), 0.0)
        stab.add(ins.epiano(m - 12, 1.2, 0.85, seed=seed + i, pan=-0.3 + 0.2 * i), 0.0)
    stab_y = stab.render()
    crack = _click(0.15, seed, "lic", 3000.0, 0.7, 0.02)
    shim = dsp.highpass(dsp.noise(1.8, "white", seed, stereo=True), 6000.0) * dsp.exp_decay(1.8, 1.2, 0.002)[:, None]
    y = _layer(3.0, (_norm(boom), 0, 0.9), (_norm(stab_y), 0, 0.55), (crack, 0, 0.25), (_norm(shim), 0, 0.1))
    return dsp.reverb(y, "hall", 0.22, seed=seed)


@_sfx(-8.0, fade_in=0.02, fade_out=0.08)
def wind_whoosh(seed: int = 0, dur: float = 2.5) -> np.ndarray:
    """Airy wind whoosh for flying into the blocky world: gusting band-passed wind (two drifting
    resonances), a faint whistle, an initial pass-by, swelling then settling; wide stereo."""
    n = dsp.n_samples(dur)
    t = dsp.timebase(n)
    gust = 0.6 + 0.4 * dsp.smooth_random(dur, 1.2, seed)
    c1 = 700.0 * (1.0 + 0.6 * dsp.smooth_random(dur, 0.8, seed + 1))
    c2 = 1600.0 * (1.0 + 0.5 * dsp.smooth_random(dur, 0.6, seed + 2))
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    body = 0.7 * _norm(dsp.svf(nz, c1, 1.6, "bp")) + 0.45 * _norm(dsp.svf(nz[:, ::-1], c2, 2.5, "bp"))
    wf = 1900.0 * (1.0 + 0.3 * dsp.smooth_random(dur, 0.5, seed + 3))
    whistle = _norm(dsp.svf(dsp.white(dur, seed, "ww"), wf, 14.0, "bp")) * 0.12
    env = dsp.breakpoints([(0.0, 0.0), (0.35 * dur, 1.0), (0.75 * dur, 0.85), (dur, 0.0)], dur, "cos")
    y = body * gust[:, None] + dsp.pan(whistle, 0.3 * np.sin(dsp.TAU * 0.2 * t)) * SQRT2
    y = y * env[:, None]
    pas = dsp.as_array(whoosh(seed=seed + 11, dur=min(0.9, dur * 0.4), weight="light", pan_from=-0.8, pan_to=0.5))
    return _layer(dur, (_norm(y), 0, 1.0), (_norm(pas), 0.02, 0.5))


# ==========================================================================
# curated variants rendered by render_demo.py  (file name, function, kwargs)
# ==========================================================================

DEMO_VARIANTS: list[tuple[str, str, dict]] = [
    ("ui_click", "ui_click", {}),
    ("button_press", "button_press", {}),
    ("hover_tick", "hover_tick", {}),
    ("caret_tick", "caret_tick", {}),
    ("key_click", "key_click", {}),
    ("typing", "typing", {"keys": 9}),
    ("toggle_on", "toggle_switch", {"on": True}),
    ("toggle_off", "toggle_switch", {"on": False}),
    ("pop_bubble", "pop", {"kind": "bubble"}),
    ("pop_cork", "pop", {"kind": "cork"}),
    ("boing_short", "boing", {"variant": "short"}),
    ("boing_long", "boing", {"variant": "long"}),
    ("boing_low", "boing", {"variant": "low"}),
    ("boing_high", "boing", {"variant": "high"}),
    ("squash", "squash", {}),
    ("stretch", "stretch", {}),
    ("whoosh_light_short", "whoosh", {"dur": 0.3, "weight": "light"}),
    ("whoosh_light_long", "whoosh", {"dur": 0.9, "weight": "light"}),
    ("whoosh_heavy_short", "whoosh", {"dur": 0.5, "weight": "heavy"}),
    ("whoosh_heavy_long", "whoosh", {"dur": 1.4, "weight": "heavy"}),
    ("swish", "swish", {}),
    ("fall_whistle", "fall_whistle", {}),
    ("thud", "thud", {}),
    ("land", "land", {}),
    ("bounce_tap_plastic", "bounce_tap", {"material": "plastic"}),
    ("bounce_tap_wood", "bounce_tap", {"material": "wood"}),
    ("slide_card", "slide", {"surface": "card"}),
    ("slide_rough", "slide", {"surface": "rough", "dur": 0.8}),
    ("card_flip", "card_flip", {}),
    ("install_ticks", "install_ticks", {}),
    ("success_chime", "success_chime", {}),
    ("download_zip", "download_zip", {}),
    ("pin_drop", "pin_drop", {}),
    ("map_rustle", "map_rustle", {}),
    ("projector_on", "projector_click", {"on": True}),
    ("projector_hum", "projector_hum", {}),
    ("projector_off", "projector_click", {"on": False}),
    ("hologram_shimmer", "hologram_shimmer", {}),
    ("sparkle", "sparkle", {}),
    ("rise", "riser_tuned", {"direction": "up"}),
    ("return", "riser_tuned", {"direction": "down"}),
    ("snap_into_place", "snap_into_place", {}),
    ("heartbeat", "heartbeat", {}),
    ("power_up", "power_up", {}),
    ("launch_impact", "launch_impact", {}),
    ("wind_whoosh", "wind_whoosh", {}),
]
