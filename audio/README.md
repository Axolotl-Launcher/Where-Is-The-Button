# audio/ — the soundtrack of 《启动按钮去哪了？》

Everything you hear is synthesized from code: no samples and no network. Rendering is deterministic, so the same code always produces bit-identical WAVs (`mix.py` prints a SHA-256 for each file).

## Render

```bash
python audio/mix.py              # render + QC (≈ 2–3 min)
python audio/mix.py --no-review  # render only (≈ 1 min)
python audio/mix.py --stems      # also print per-family loudness of the score
python audio/review.py           # QC again on the existing files
```

`package.json` already maps `npm run audio` to `python audio/mix.py`.

Requirements: Python 3.12 with `numpy`, `scipy`, `soundfile`, `pyloudnorm` and `matplotlib`.

## Outputs (`public/audio/`)

All three files are 48 kHz, stereo, 24-bit PCM, and exactly 87.0 s (4,176,000 frames).

| file | what |
|---|---|
| `soundtrack.wav` | The final master. `src/film/Film.tsx` plays it once `AUDIO_READY` in `src/scenes/audio-flag.ts` is set to `true`. |
| `music.wav` | The score after ducking, at mix level. |
| `sfx.wav` | The SFX cue sheet, at mix level. |

`music.wav` and `sfx.wav` carry the master's static gain but no glue compression or limiting, so together they sum to the master as it was before dynamics. A stem is safety-limited to −1 dBTP only when it alone would exceed that.

Targets: −16 LUFS integrated, true peak ≤ −1 dBTP (4× oversampled).

## Files

| file | role |
|---|---|
| `score.py` | The music as data (sections, motifs, voicings, event lists) plus `render()`. Follows `design/STORYBOARD.md` §6. |
| `cues.py` | The SFX cue sheet as data: `Cue(t, fn, params, gain_db, pan, duck=…, …)`. Follows `design/STORYBOARD.md` §7, with gaps filled. |
| `mix.py` | Ducking, the music/SFX balance, the master bus (glue compressor, then a true-peak limiter at −16 LUFS), and file writing. |
| `review.py` | Objective QC (see below) and `_reports/soundtrack_review.png`. |
| `analyze.py` | Per-file QC: loudness, peaks, DC, clicks, edges, spectrum. Writes `_reports/soundtrack_report.md`. |
| `lib/` | The synthesis toolkit: `dsp.py`, `instruments.py`, `sfx.py`. See their docstrings. |
| `render_demo.py` | Demo boards for the toolkit, written to `public/audio/_demo/`. |

## How the score is organised

- **Grid:** 120 BPM, 4/4, F major. One beat is 0.5 s (30 frames), and bar *n* starts at 2(*n*−1) s. Use `score.bt(bar, beat)` to convert.
- **Motifs:**
  - *play*: C5 F5 A5 G5, on kalimba at 0.50 and 69.50.
  - *question*: F4 G4 A4 Bb4 C5 D5 E5, as nylon 16th-triplets from 18.00. The glockenspiel plays E6 at 18.50, the 「？」, and it hangs until the cut.
  - *answer*: F4 G4 A4 F4, on fm_bell from 46.90. It resolves at 47.40, when the hero becomes the swatch.
  - *resolved*: C5 F5 A5 C6, at the 76.00 downbeat. It comes back on celesta at 84.00.
- **Groups:** every note event belongs to one group.
  - `bed` is the groove and the pads. It is ducked under key SFX.
  - `hits` are the stabs, motifs and downbeats that are sync points. They are never ducked.
  - `solo` and `dry` are the few notes inside silences: the neener at 8.50, the bass "dun" at 21.00, and the celesta at 62.00.
- **`GATE`:** applied to `bed` and `hits` after reverb, so it also cuts the tails. It makes:
  - the hard cut at 5.00;
  - the silences at 20.5–22.5 and 50.0–52.5;
  - the near-silence at 61–63;
  - nothing but the press at 75.00;
  - the music being fully out by 86.5.
- **Stabs** land on every click: 23.0, 24.5, 26.0, 27.5, 30.0, 34.0, 36.5 and 39.0. The chase in C runs in 3-beat cycles, so it locks to clicks that are 1.5 s apart.
- **Return:** the marimba climbs F4 → A5, one note per layer-spacing notch (64.00 … 67.00), and the tonic lands at 68.00.

## Editing

- **Move or retune a sound:** edit its `Cue` in `cues.py` (time, `gain_db`, `pan`, `duck`).
  - Cue times are film seconds; the frame is `t × 60`.
  - `snap_into_place` and `toggle_switch` put their main transient 28 ms into the buffer, so those cues start 28 ms early.
- **Change the music:** edit the section functions in `score.py`.
  - Keep sync notes in `grp="hits"`.
  - Keep `SYNC` up to date: `review.py` checks every entry against the detected onsets.
- After any change, run `python audio/mix.py`. It exits non-zero if QC fails:
  - an `analyze.py` hard flag;
  - wrong format or length;
  - loudness more than 0.5 LU from −16 LUFS, or true peak above −1 dBTP;
  - an intended hit missing, or more than 20 ms off;
  - music audible in a silence;
  - UI foley not quieter than the music's hits.

## QC printed by `review.py`

- Loudness: integrated, LRA, maximum momentary and short-term, true peak.
- The 48 strongest onsets. These come from a spectral-flux detector whose times are refined to about 1 ms, and each is shown with what is scheduled there.
- Every intended hit from `score.SYNC` against its detected onset (offset in ms, energy rise in dB).
- The music level inside every silence, loudness per section, and the peaks of UI foley against the music's hits.
- The review image `_reports/soundtrack_review.png`: waveform, spectrogram and momentary loudness, with second ticks, sections and intended hits marked.
