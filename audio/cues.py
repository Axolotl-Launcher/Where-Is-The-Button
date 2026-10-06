"""
cues.py -- the SFX cue sheet of 《启动按钮去哪了？》 as data, plus its renderer.

Transcribed from design/STORYBOARD.md section 7 (every entry there is here, at its time)
and filled in where the shot list shows an action without a sound: every visible landing
of the hero, every click and every UI reaction gets a small, dry, product-like sound.
The realism bookends (Sh01-Sh02, Sh27-Sh29) keep to real-app sounds only.  UI foley sits
low (ticks/clicks/keys peak well under the music's hits); the hero's own sounds (pops,
boings, squash/stretch, whistles, lands) get the character.

A cue: ``Cue(t, fn, params, gain_db, pan, ...)``
  t        film time in seconds (frame = t * 60)
  fn       an ``sfx.CATALOG`` name (audio/lib/sfx.py) or a ``LOCAL`` generator below
  params   kwargs for the generator.  ``_note`` tunes a generator that only takes a pitch
           ratio (bounce_tap): the ratio is solved against the generator's own seed jitter
  gain_db  offset from the generator's nominal level;  pan  -1 (L) .. 1 (R)
  duck     music-bed ducking in dB (<= 0) that mix.py applies around the cue, held ``hold`` s
  lp / hp  post filter (Hz) for distance / smallness;  reverse  play backwards
  label    storyboard reference
Generators whose main transient is late inside the buffer are placed early so the transient
lands on the frame: snap_into_place (body at +28 ms) and toggle_switch (detent at +28 ms).

``render()`` mixes the sheet into one stereo bus (87.0 s, 48 kHz).
"""
from __future__ import annotations

import os
import sys
import zlib
from dataclasses import dataclass, field

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)
from lib import dsp, instruments as ins, sfx  # noqa: E402

SR = dsp.SR
DURATION = 87.0


@dataclass
class Cue:
    t: float
    fn: str
    params: dict = field(default_factory=dict)
    gain_db: float = 0.0
    pan: float = 0.0
    duck: float = 0.0
    hold: float = 0.08
    lp: float | None = None
    hp: float | None = None
    reverse: bool = False
    seed: int | None = None
    label: str = ""


def C(t, fn, params=None, gain_db=0.0, pan=0.0, **opts) -> Cue:
    return Cue(float(t), fn, dict(params or {}), float(gain_db), float(pan), **opts)


# where things are on screen (window x -> gentle pan)
HOME = 0.20      # the socket, window x 983
FIELD = -0.15    # Discover search field
CARDS = -0.10    # Discover results
TOAST = 0.40     # download toast, top right
RAIL = -0.45     # nav rail / quick-instance circle
TWIN = 0.40      # instance header 「开始游戏」
ROW = 0.30       # the new mod's toggle
ENTER = 0.45     # 种子地图 「› 进入」, window x 1359
MAP = 0.20
SLIDER = 0.10


def typing_cues(t0: float, t1: float, keys: int, seed: int, gain_db=-2.0, pan=FIELD, label="") -> list[Cue]:
    """``keys`` individual soft key clicks spread over [t0, t1] with human jitter (exact span)."""
    r = dsp.rng(seed, "typing-cues")
    out = []
    for i in range(keys):
        t = t0 + (t1 - t0) * i / (keys - 1)
        if 0 < i < keys - 1:
            t += r.uniform(-0.012, 0.012)
        v = float(np.clip(0.62 * r.uniform(0.8, 1.12), 0.1, 1.0))
        out.append(C(round(t, 4), "key_click", {"vel": v}, gain_db, pan, seed=seed * 100 + i,
                     label=f"{label} key {i + 1}/{keys}"))
    return out


NOTCH_TIMES = [64.00, 64.50, 65.00, 65.50, 65.75, 66.00, 66.25, 66.50, 66.75, 67.00]
NOTCH_NOTES = ["F5", "G5", "A5", "Bb5", "C6", "D6", "E6", "F6", "G6", "A6"]   # an octave over the marimba climb

CUES: list[Cue] = [
    # ---------------- M1 Opening (real app until the press)
    C(4.30, "hover_tick", {}, -1, HOME, label="Sh02 pointer + hover darken"),
    C(4.90, "room_tone", {"dur": 3.0}, 0, 0, label="room tone under the silence 5.0-7.75"),
    C(5.00, "button_press", {"hold": 0.12}, 0, HOME, label="Sh03 PRESS 1 (music cuts dead)"),
    C(5.15, "fall_whistle", {"dur": 1.0, "start_note": "G6", "end_note": "G4"}, -6, HOME, label="sinks, falls to F2"),
    C(6.00, "bounce_tap", {"material": "plastic"}, -13, HOME, lp=2500.0, label="lands on F2 far below (-24 dB)"),
    C(6.90, "swish", {"dur": 0.12, "pitch": 1.2}, -12, 0.0, label="Sh04 cursor double-take"),
    C(7.78, "whoosh", {"dur": 0.22, "weight": "light", "pan_from": 0.2, "pan_to": 0.2}, -10, HOME, label="Sh05 spring-jump up the shaft"),
    C(8.00, "pop", {"kind": "cork"}, -2, HOME, label="pops back into the socket"),
    C(8.00, "boing", {"variant": "short"}, -4, HOME),
    C(8.50, "swish", {}, -4, 0.1, label="drops again at the cursor's twitch"),
    C(8.50, "fall_whistle", {"dur": 0.5, "start_note": "C7", "end_note": "C5"}, -5, HOME),
    C(8.85, "whoosh", {"dur": 0.3, "weight": "light"}, -5, 0.0, label="Sh06 cursor dives into the socket"),
    C(8.85, "wind_whoosh", {"dur": 2.2}, -10, 0.0, label="down the shaft, out through the stack"),
    # ---------------- M2 Tower reveal
    C(10.40, "land", {"weight": 0.9, "plastic": 0.5}, -11, -0.1, lp=3500.0, duck=-3, hold=0.1, label="Sh07 hero lands on F2's results"),
    # ---------------- M3 Discover
    C(13.10, "bounce_tap", {"_note": "C6"}, -2, -0.30, label="Sh08 card 1 (hover .9)"),
    C(13.40, "bounce_tap", {"_note": "E6"}, -2, -0.20, label="card 2"),
    C(13.70, "bounce_tap", {"_note": "G6"}, -1, -0.10, label="card 3"),
    C(14.02, "swish", {"dur": 0.2, "pitch": 0.9}, -8, FIELD, label="darts up the page"),
    C(14.36, "bounce_tap", {"_note": "C6"}, -6, FIELD, label="hops into the search field"),
    C(14.40, "stretch", {"dur": 0.5}, -2, FIELD, duck=-3, hold=0.4, label="stretches along the field"),
    C(14.872, "snap_into_place", {"pitch": 1.4, "note": "F6"}, -12, FIELD, label="wraps it as the focus ring (tiny snap)"),
    C(15.15, "swish", {"dur": 0.25, "pitch": 0.8}, -14, -0.3, label="Sh09 cursor search arc 1"),
    C(15.55, "swish", {"dur": 0.25, "pitch": 0.85, "pan_from": 0.4, "pan_to": -0.4}, -14, 0.0, label="search arc 2"),
    C(16.00, "ui_click", {}, -3, FIELD, duck=-3, label="Sh10 click into the field"),
    C(16.06, "caret_tick", {}, -2, FIELD, label="caret appears"),
    *typing_cues(16.40, 17.90, 17, seed=16, label="qidonganniuqunale"),
    C(18.00, "key_click", {"vel": 0.7, "space": True}, -1, FIELD, label="commit 「启动按钮去哪了」"),
    C(18.00, "caret_tick", {}, 0, FIELD),
    C(18.48, "key_click", {"vel": 0.55}, -3, FIELD, label="types 「？」"),
    C(18.50, "pluck", {"note": "E6", "vel": 0.5, "kind": "harp", "dur": 1.2}, -2, FIELD, label="pluck on 「？」"),
    C(20.50, "pop", {"kind": "bubble", "pitch": 0.6}, -3, CARDS, label="Sh11 empty state 「这里还是空的」"),
    C(20.52, "room_tone", {"dur": 2.0}, 0, 0, label="room tone under the silence 20.5-22.5"),
    C(21.60, "squash", {"dur": 0.15, "pitch": 1.4}, -8, FIELD, label="the ring flinches (#c5236b)"),
    C(21.90, "swish", {"dur": 0.12}, -13, 0.0, label="cursor double-take"),
    C(22.10, "stretch", {"dur": 0.15}, -4, FIELD, reverse=True, label="ring snaps back like a rubber band"),
    C(22.25, "pop", {"kind": "cork"}, -3, FIELD, label="hero pops out of the field"),
    C(22.25, "boing", {"variant": "short"}, -5, FIELD),
    C(22.45, "bounce_tap", {"_note": "A5"}, -3, 0.0, label="arcs onto 「清除搜索」"),
    C(22.90, "swish", {}, -6, 0.0, label="Sh12 cursor swoop"),
    C(23.00, "ui_click", {}, -2, 0.0, duck=-5, label="M1 click 「清除搜索」"),
    C(23.06, "card_flip", {}, -6, -0.30, label="cards fade up"),
    C(23.16, "card_flip", {"pitch": 1.06}, -7, 0.0),
    C(23.26, "card_flip", {"pitch": 1.12}, -8, 0.30),
    C(23.75, "bounce_tap", {"_note": "C6"}, -4, -0.1, label="hero hops"),
    C(24.40, "swish", {}, -6, -0.1),
    C(24.50, "ui_click", {}, -2, -0.1, duck=-5, label="M2 click 「＋ 安装」 -> 「✓ 已选择」"),
    C(24.50, "pop", {"kind": "bubble", "pitch": 1.2}, -4, -0.1),
    C(24.50, "boing", {"variant": "low"}, -5, 0.0, label="cart bar springs in"),
    C(25.25, "bounce_tap", {"_note": "D6"}, -4, 0.1, label="hero hops"),
    C(25.90, "swish", {}, -6, 0.1),
    C(26.00, "ui_click", {}, -2, 0.1, duck=-5, label="M3 click 「＋ 安装 1 个内容」"),
    C(26.20, "whoosh", {"dur": 0.3, "weight": "light", "pan_from": 0.0, "pan_to": 0.0}, -8, 0.0, label="modal grows from the click"),
    C(26.75, "bounce_tap", {"_note": "E6"}, -4, 0.0, label="hero hops"),
    C(27.40, "swish", {}, -6, 0.0),
    C(27.50, "ui_click", {}, -2, 0.0, duck=-5, label="M4 modal 「安装」"),
    C(27.70, "download_zip", {}, -3, 0.3, duck=-3, hold=0.3, label="download toast flies in"),
    C(27.90, "pop", {"kind": "bubble", "pitch": 1.5}, -8, RAIL, label="badge 「1」 on 下载"),
    C(28.00, "land", {"weight": 0.9, "plastic": 0.6}, -11, CARDS, label="hero lands back on the results"),
    C(28.50, "pop", {"kind": "bubble"}, -4, TOAST, duck=-2, label="Sh13 hops onto the toast"),
    C(28.60, "install_ticks", {"n": 8, "interval": 0.11, "root": "F5"}, -4, TOAST, duck=-2, hold=0.6, label="rides the progress bar"),
    C(29.30, "whoosh", {"dur": 0.7, "weight": "light", "pan_from": 0.5, "pan_to": -0.5}, -3, 0.0, label="flung toward the nav rail"),
    C(29.40, "squash", {"dur": 0.15, "pitch": 1.3}, -10, 0.0, label="curls into the Disc mid-air"),
    C(30.00, "button_press", {}, -5, RAIL, duck=-4, hold=0.12, label="lands on the quick-instance circle (turns pink)"),
    C(30.00, "land", {"weight": 0.8, "plastic": 0.7}, -11, RAIL),
    C(30.20, "slide", {"dur": 0.3, "surface": "card"}, -8, 0.0, label="navigation plunge"),
    # ---------------- M4 Instance & Lab
    C(30.50, "pop", {"kind": "bubble"}, -7, -0.3, label="Sh14 Disc pops out onto the table"),
    C(30.60, "bounce_tap", {"_note": "C6"}, -4, -0.1),
    C(31.00, "hover_tick", {"pitch": 0.8}, -2, ROW, label="the new row's toggle appears"),
    C(31.10, "squash", {"dur": 0.4}, -3, ROW, duck=-3, hold=0.3, label="squeezes into the toggle (收拢)"),
    C(31.572, "snap_into_place", {"pitch": 1.5, "note": "F6"}, -12, ROW, label="becomes the pink track"),
    C(31.80, "ui_click", {}, -8, RAIL, label="cursor clicked the quick circle too"),
    C(32.00, "swish", {"pan_from": -0.3, "pan_to": 0.4}, -6, 0.0, label="cursor rushes to the twin"),
    C(32.30, "hover_tick", {}, -2, TWIN, label="twin darkens -- and does not flee"),
    C(33.50, "boing", {"variant": "high"}, -12, ROW, label="the knob wiggles (snicker)"),
    C(33.70, "swish", {"pan_from": 0.4, "pan_to": 0.2}, -5, 0.3, label="cursor whips round"),
    C(34.00, "ui_click", {}, -2, ROW, duck=-5, label="click the toggle"),
    C(33.972, "toggle_switch", {"on": False}, -2, ROW, label="toggle off (row greys); detent lands on 34.00"),
    C(34.05, "pop", {"kind": "cork"}, -3, ROW, label="hero squirts out like soap"),
    C(34.30, "bounce_tap", {"_note": "D6"}, -4, 0.2, label="bounces off the table edge"),
    C(35.20, "stretch", {"dur": 0.3}, -5, -0.3, label="leaps for the rail"),
    C(35.60, "bounce_tap", {"_note": "A5"}, -6, RAIL, label="Sh15 first hop up the rail"),
    C(36.00, "bounce_tap", {"_note": "C6"}, -3, RAIL, label="bonks 下载"),
    C(36.00, "pop", {"kind": "bubble", "pitch": 1.8}, -12, RAIL, label="badge 「1」 jiggles"),
    C(36.50, "button_press", {}, -4, RAIL, duck=-4, hold=0.12, label="lands hard on 实验室 (press .97)"),
    C(36.50, "slide", {"dur": 0.55, "surface": "card"}, -8, RAIL, label="pill inchworms"),
    C(37.30, "stretch", {"dur": 0.2}, -8, 0.0, label="Sh16 the Disc uncurls"),
    C(38.20, "stretch", {"dur": 0.5}, -3, 0.1, label="one long leap"),
    C(38.30, "whoosh", {"dur": 0.7, "weight": "light", "pan_from": -0.2, "pan_to": 0.45}, -8, 0.2),
    C(39.00, "land", {"weight": 1.1}, -11, ENTER, duck=-4, hold=0.12, label="lands on 种子地图 「› 进入」"),
    C(39.00, "boing", {"variant": "short"}, -9, ENTER),
    C(39.00, "button_press", {}, -7, ENTER),
    C(39.15, "whoosh", {"dur": 0.5, "weight": "heavy"}, -4, ENTER, duck=-3, hold=0.3, label="content gives way like a trapdoor"),
    C(39.40, "ui_click", {}, -4, ENTER, label="cursor clicks the same 进入"),
    # ---------------- M5 Seed map
    C(41.30, "land", {"weight": 1.0, "plastic": 0.4}, -9, MAP, duck=-3, label="Sh17 lands at the trapdoor point"),
    C(41.30, "map_rustle", {"dur": 0.8}, -2, MAP),
    C(41.50, "slide", {"dur": 0.8, "surface": "rough"}, -4, MAP, label="skids into the cherry grove"),
    C(43.05, "ui_click", {"pitch": 0.8}, -8, 0.0, label="Sh18 grab"),
    C(43.20, "map_rustle", {"dur": 1.0}, -4, 0.0, label="drag pan"),
    C(44.30, "swish", {"dur": 0.25, "pitch": 0.6}, -6, MAP, label="zoom 1"),
    C(44.40, "caret_tick", {}, -4, -0.3, label="badge 「1 像素 = 4 格」"),
    C(44.80, "swish", {"dur": 0.25, "pitch": 0.55}, -6, MAP, label="zoom 2"),
    C(44.90, "caret_tick", {}, -4, -0.3, label="badge 「1 像素 = 1 格」"),
    C(45.20, "hover_tick", {}, -1, MAP, label="▷ legible; cursor stops dead"),
    C(45.50, "ui_click", {"pitch": 0.85}, -2, MAP, duck=-3, label="Sh19 right-click"),
    C(45.50, "card_flip", {}, -5, MAP, label="popup 「位置」"),
    *typing_cues(46.00, 46.80, 11, seed=46, pan=MAP, label="qidonganniu"),
    C(46.90, "key_click", {"vel": 0.7, "space": True}, -1, MAP, label="commit 「启动按钮」 (answer motif)"),
    C(46.90, "caret_tick", {}, -1, MAP),
    C(47.40, "squash", {"dur": 0.3}, -4, MAP, label="hero squeezes into the colour square"),
    C(48.00, "ui_click", {}, -2, MAP, duck=-4, label="click 「添加标记」"),
    C(48.00, "pin_drop", {}, -2, MAP, label="pin with label 「启动按钮」"),
    C(48.50, "success_chime", {}, -2, 0.3, duck=-4, hold=0.4, label="toast 「标记已保存」"),
    C(49.50, "heartbeat", {"beats": 1}, -5, MAP, duck=-4, hold=0.3, label="Sh20 hover the pin"),
    C(50.00, "button_press", {"hold": 0.12}, 0, MAP, label="PRESS 2 (music cuts)"),
    C(50.02, "room_tone", {"dur": 2.5}, 0, 0, label="room tone under the silence 50.0-52.5"),
    C(50.15, "fall_whistle", {"dur": 1.0, "start_note": "G6", "end_note": "G4"}, -6, MAP, label="sinks through the map"),
    C(51.30, "whoosh", {"dur": 0.5, "weight": "light"}, -6, 0.0, label="cursor dives"),
    # ---------------- M6 Workshop
    C(52.50, "sparkle", {"dur": 0.6, "root": "F6"}, -4, 0.0, label="Sh21 drop overlay lights"),
    C(53.00, "land", {"weight": 0.8, "plastic": 0.3}, -9, HOME, duck=-3, label="lands inside it (released)"),
    C(53.00, "squash", {"dur": 0.3}, -5, HOME),
    C(53.50, "projector_click", {"on": True}, -8, 0.0, duck=-4, hold=0.15, label="Sh22 projector on"),
    C(53.50, "projector_hum", {"dur": 7.5}, -4, 0.0, label="projector bed to 61.0"),
    C(54.00, "hover_tick", {"pitch": 0.7}, -6, -0.2, label="「正在读取资源」"),
    C(54.50, "install_ticks", {"n": 16, "interval": 0.1105, "root": "F4"}, -5, 0.0, lp=8000.0, label="「正在生成模型 n / 40」"),
    C(54.60, "bounce_tap", {"material": "wood"}, -10, HOME, lp=3000.0, label="voxel layer settles"),
    C(55.40, "bounce_tap", {"material": "wood"}, -10, HOME, lp=3000.0, label="voxel layer settles"),
    C(56.65, "stretch", {"dur": 0.3, "pitch": 0.5}, -12, HOME, label="Sh23 too heavy: it rocks"),
    C(57.00, "thud", {"weight": 1.8, "plastic": 0.3}, -6, HOME, duck=-4, hold=0.1, label="thud (heavy)"),
    C(57.50, "thud", {"weight": 1.3, "plastic": 0.4}, -8, HOME, duck=-3, label="rolls one block"),
    C(58.00, "ui_click", {}, -3, -0.2, label="Sh24 「框选」"),
    C(58.50, "ui_click", {}, -3, 0.0, label="corner 「请选择另一对角」"),
    C(59.50, "ui_click", {}, -3, 0.3, label="opposite corner -> 「已选 600 个」"),
    C(59.50, "hologram_shimmer", {"dur": 2.0}, -2, 0.0, duck=-2, label="pink selection shimmer"),
    C(61.00, "room_tone", {"dur": 2.1}, 0, 0, label="room tone under the near-silence"),
    C(61.50, "heartbeat", {"beats": 2, "intensity": 0.5}, -8, 0.0, label="Sh25 the look up (soft)"),
    # ---------------- M7 Return
    C(63.00, "ui_click", {}, -2, SLIDER, duck=-2, label="Sh26 click 「层间距」"),
    C(63.00, "riser_tuned", {"dur": 4.94, "start_note": "F3", "end_note": "F5"}, -8, 0.0, label="riser into the 68.0 tonic"),
    C(63.05, "card_flip", {"pitch": 1.2}, -6, SLIDER, label="glass panel appears"),
    C(63.50, "ui_click", {"pitch": 0.75}, -6, SLIDER, label="grab the slider"),
    *[C(t, "woodblock", {"note": nt, "vel": 0.55 + 0.03 * i}, -3, SLIDER,
        label=f"notch {i + 1}: spacing {90 - 10 * i} %") for i, (t, nt) in enumerate(zip(NOTCH_TIMES, NOTCH_NOTES))],
    C(67.972, "snap_into_place", {"note": "C6"}, -4, HOME, duck=-3, label="hero seats in its socket from below"),
    C(68.00, "land", {"weight": 0.8, "plastic": 0.4}, -11, HOME),
    # ---------------- M8 Finale
    C(72.60, "hover_tick", {}, -1, HOME, label="Sh28 hover -> pointer (it does not flee)"),
    C(73.50, "heartbeat", {"beats": 2}, -5, HOME, duck=-4, hold=0.8, label="heartbeat x2"),
    C(75.00, "button_press", {"hold": 0.28}, -1, HOME, label="Sh29 PRESS 3 (holds)"),
    C(75.00, "thud", {"weight": 0.7, "plastic": 0.2}, -12, HOME, label="fuller press"),
    C(75.30, "launch_impact", {}, -8, 0.0, duck=-6, hold=0.45, label="Sh30 rush into the outline ▷"),
    C(75.40, "wind_whoosh", {"dur": 1.0}, -12, 0.0),
    C(76.00, "wind_whoosh", {"dur": 4.0}, -12, 0.0, label="gliding over the voxel world"),
    C(76.20, "leaves", {"dur": 3.6}, 0, 0.0, label="leaves (soft)"),
    # ---------------- M9 End card
    C(80.20, "sparkle", {"dur": 0.9, "root": "F6"}, -3, 0.0, duck=-2, label="Sh32 logo pop"),
    C(80.90, "slide", {"dur": 1.0, "surface": "card", "pitch": 1.3}, -14, 0.0, label="wordmark unrolls"),
    C(82.05, "swish", {"dur": 0.1}, -8, 0.0, label="pink wipe 1"),
    C(82.40, "swish", {"dur": 0.1, "pan_from": 0.4, "pan_to": -0.4}, -8, 0.0, label="pink wipe 2"),
]
CUES.sort(key=lambda c: c.t)

# spans where the music bed ducks for a group of cues (typing): (t0, t1, dB, label)
DUCK_SPANS = [(16.38, 17.95, -3.0, "typing 1"), (45.98, 46.95, -3.0, "typing 2")]

# ---------------------------------------------------------------------------
# local generators (instrument-based ticks + two beds the toolkit lacks)
# ---------------------------------------------------------------------------


def _woodblock(seed=0, note="C6", vel=0.6):
    return ins.woodblock(note, vel, seed=seed, pan=0.0)


def _rim(seed=0, vel=0.6, pitch=1.0):
    return ins.rim(vel, seed=seed, pitch=pitch)


def _pluck(seed=0, note="E6", vel=0.5, kind="harp", dur=1.0):
    return ins.pluck(note, dur, vel, seed=seed, kind=kind, pan=0.0)


def _room_tone(seed=0, dur=2.0, level_db=-58.0):
    """Faint air of the room (pink, 60 Hz-1.8 kHz) at ``level_db`` dBFS RMS, soft fades."""
    nz = dsp.noise(dur, "pink", seed, stereo=True)
    nz = dsp.lowpass(dsp.highpass(nz, 60.0), 1800.0)
    rms = float(np.sqrt(np.mean(nz ** 2))) or 1.0
    return dsp.fade(nz / rms * dsp.db_to_amp(level_db), 0.12, 0.35)


def _leaves(seed=0, dur=3.0, level_db=-30.0):
    """Soft leaf rustle: sparse crinkle grains (2.5-8 kHz) in slow gusts, wide stereo."""
    gust = 0.5 + 0.5 * dsp.smooth_random(dur, 0.7, seed)
    out = []
    for ch in range(2):
        g = dsp.grain_cloud(dur, 90.0 * gust + 15.0, seed * 7 + ch, grain=0.0015)
        g = dsp.bandpass(g, 4200.0, 0.8) + 0.4 * dsp.highpass(g, 7000.0)
        out.append(g * (0.4 + 0.6 * gust))
    y = np.stack(out, axis=1)
    y = y / max(dsp.peak(y), 1e-12) * dsp.db_to_amp(level_db)
    return dsp.fade(y, 0.4, 0.8)


LOCAL = {"woodblock": _woodblock, "rim": _rim, "pluck": _pluck, "room_tone": _room_tone, "leaves": _leaves}

_TAP_BASE = {"plastic": 780.0, "wood": 620.0}


def cue_seed(c: Cue) -> int:
    if c.seed is not None:
        return int(c.seed)
    return zlib.crc32(f"{c.fn}@{c.t:.3f}".encode()) % 10000


def make(c: Cue) -> np.ndarray:
    """Render one cue at its nominal level (gain/pan are applied by ``render``)."""
    seed = cue_seed(c)
    p = dict(c.params)
    note = p.pop("_note", None)
    if c.fn in sfx.CATALOG:
        if note is not None:
            if c.fn != "bounce_tap":
                raise ValueError(f"_note is only solved for bounce_tap, not {c.fn}")
            base = _TAP_BASE[p.get("material", "plastic")]
            p["pitch"] = ins.to_hz(note) / (base * sfx._jit(seed, "tap", 1.5))
        y = sfx.CATALOG[c.fn](seed=seed, **p)
    else:
        y = LOCAL[c.fn](seed=seed, **p)
    y = dsp.to_stereo(y)
    if c.hp:
        y = dsp.highpass(y, c.hp)
    if c.lp:
        y = dsp.lowpass(y, c.lp)
    if c.reverse:
        y = dsp.fade(y[::-1].copy(), 0.002, 0.004)
    return y


def render(dur: float = DURATION, cues: list[Cue] | None = None, info: list | None = None) -> np.ndarray:
    """Mix the cue sheet -> stereo (n, 2).  ``info`` (a list) receives (cue, length_s) pairs."""
    cues = CUES if cues is None else cues
    tl = dsp.Timeline(dur)
    for c in cues:
        y = make(c)
        tl.add(y, c.t, gain_db=c.gain_db, pan=c.pan)
        if info is not None:
            info.append((c, len(y) / SR))
    return dsp.pad_to(tl.render(), dsp.n_samples(dur))


def duck_events() -> list[tuple[float, float, float, str]]:
    """(t0, t1, depth dB, label) for every ducking cue and span."""
    ev = [(c.t, c.t + c.hold, c.duck, c.label or c.fn) for c in CUES if c.duck < 0]
    return sorted(ev + list(DUCK_SPANS))


if __name__ == "__main__":
    for c in CUES:
        print(f"{c.t:7.2f}  {c.fn:17s} {c.gain_db:+5.1f} dB  pan {c.pan:+.2f}  duck {c.duck:+.0f}  {c.label}")
    print(f"{len(CUES)} cues")
