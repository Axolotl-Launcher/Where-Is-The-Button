[简体中文](README.md) | **English**

<details open>
<summary><strong>Sponsors &amp; Partners</strong></summary>

Thanks to the following sponsors and partners for supporting Axolotl Launcher.

<table>
  <tr>
    <td><img src="./codeflow-logo.png" width="72" alt="CodeFlow Logo" /></td>
    <td><strong>CodeFlow</strong><br>Access top AI models more reliably and affordably<br>Native protocol forwarding · No overseas network required · Instant top-up with Alipay</td>
    <td><a href="https://codeflow.sh/register?invite=4UHP2KYH">Visit CodeFlow</a></td>
  </tr>
</table>

# 《启动按钮去哪了？》 · Axolotl Launcher animated short

An 87-second, 1920 × 1080 / 60 fps animated short for **Axolotl Launcher（美西螈启动器）**. A cursor reaches for the launcher's pink 「开始游戏」 button, and the button sinks out of the interface and leads the cursor on a chase through the launcher's real features — Discover's search field and install flow, an instance's content list, the Lab, the seed map (where it becomes a pink marker named 「启动按钮」) and the 投影工坊 — until the workshop's own 「层间距」 control folds the whole launcher back together and the third press finally opens the world.

Everything on screen is rebuilt from the product's source (Axolotl Launcher v1.9.7): its colour tokens, sizes, icons, zh-CN copy, block textures and brand mark. The soundtrack and every sound effect are synthesized in code.

## Deliverables

- **Final film, mod-icon version:** `videos/启动按钮去哪了-Axolotl-mod图标版.mp4` — Discover cards, cart, install modal, download toast and the instance content list show the real mod icons (Sodium, Lithium, Iris, Fabric API, Litematica, Mod Menu, MaLiLib; fetched from their Modrinth pages into `public/images/mods/`, the same images the launcher loads), with their real Modrinth summaries and download counts.
- **Final film, letter-tile version:** `videos/启动按钮去哪了-Axolotl-字母方块版.mp4` — the same film with neutral letter tiles (Na / Li / FA …) instead of third-party icons.
- Both: 1920 × 1080, 60 fps, H.264 CRF 16, AAC 320 kb/s, 87.0 s, soundtrack at −16 LUFS / −1 dBTP.
- Variant switch: `npm run render` renders with mod icons (default); `npm run render:neutral` passes `--props={"modIcons":false}`. In code: `src/ui/ModIcon.tsx` (`MOD_ICONS`).
- **Editable project:** this repository (Remotion 4 + React/TypeScript, Python audio pipeline).
- `out/` (git-ignored) is where renders and review stills land; everything in it is regenerable.

## Story beats (87 s)

| Time | Module | Beat |
|---|---|---|
| 0–9.75 s | M1 | The real Minimal Home. The cursor presses 「开始游戏」 — and the button keeps sinking through its socket. It peeks back, then drops again; the cursor dives after it. |
| 9.75–13 s | M2 | The launcher revealed as a building: its real pages stacked as floors. |
| 13–30.5 s | M3 | Discover: it bounces over the cards and stretches into the search field as its pink focus ring; the title 「启动按钮去哪了？」 is typed into the button itself; 「这里还是空的」. Four misses accidentally install 「投影 (Litematica)」; it rides the download bar into the instance. |
| 30.5–40 s | M4 | The instance page: it ignores its pink twin and hides as the new mod's toggle; up the nav rail into the Lab; through 种子地图's 「› 进入」 like a trapdoor. |
| 40–51.5 s | M5 | Seed map: camouflaged in a cherry grove, found, named 「启动按钮」 and saved as a pink marker; pressed again — it sinks again. |
| 51.5–63 s | M6 | 投影工坊: 「松开以打开投影」 catches it, the schematic pipeline rebuilds it in blocks, 「框选」 captures it, both look up at the tower. |
| 63–69 s | M7 | 「层间距」 100 → 0 % folds the whole launcher back together; it seats in its socket. |
| 69–80 s | M8 | Home again. The third press holds — through the ▷ into an evening world. |
| 80–87 s | M9 | End card: 「你的下一个世界，从这里开始。」 |

## Quick start

```bash
npm install
npm run studio          # Remotion Studio: scrub, inspect and edit every shot at http://localhost:3000
npm run render          # mod-icon version → out/where-is-the-launch-button.mp4 (H.264, CRF 16, AAC 320k)
npm run render:neutral  # letter-tile version → out/where-is-the-launch-button-neutral.mp4
npm run render:master   # ProRes HQ master → out/master/
npm run audio           # re-synthesize the soundtrack → public/audio/soundtrack.wav (Python 3.12 + numpy/scipy/soundfile/pyloudnorm)
```

Render a range of frames as stills / a contact sheet for review:

```bash
node scripts/stills.mjs WhereIsTheLaunchButton 0-5219:120 out/review --sheet --scale=0.5
```

## How the project is organised

| Path | What it is |
|---|---|
| `design/STORYBOARD.md` | The build document: timeline (frames), shots, hand-offs, music map, SFX cue list |
| `design/concept-product.md` | Detailed shot cards the storyboard builds on |
| `research/PRODUCT_BIBLE.md` | Verified product facts (palette, type, layouts, copy) + area reports `research/0*.md` |
| `docs/session-log/` | Chronological record of how the film was made with Claude Code: the conversation, every command and file change, every sub-agent (exported from Claude Code's session transcripts by `scripts/export-session-log.py`) |
| `src/film/` | Global timeline (`timeline.ts`), camera helpers & projection, floors, cursor overlay, the `Film` composition |
| `src/scenes/M1…M9.tsx` | The nine modules of the film (frame 0 = module start); helpers in `src/scenes/<module>/` |
| `src/ui/` | Faithful re-creations of the launcher: shell (`shell/AppWindow.tsx`), base components (`kit.tsx`), pages (`pages/*`), the product's icons (`Icon.tsx`, generated from `src/assets/icons`), mod icons (`ModIcon.tsx`) |
| `src/characters/` | The protagonist button (`LaunchButton.tsx`) and the cursor (`Cursor.tsx`) |
| `src/stage/` | The 2.5D engine: CSS-3D stage & camera, extruded slabs, soft floor shadows, textured voxels |
| `src/world/` | The evening voxel world of the finale |
| `audio/` | Synthesis toolkit (`lib/`), score, SFX cue sheet and mixer |
| `public/` | Fonts (Inter 3.19 + Noto Sans SC subset, OFL), product images, block textures, mod icons, rendered audio |
| `videos/` | The two final films |

The product source used as reference is not included in this repository. To consult it locally: `git clone https://github.com/Mystic-Stars/Axolotl upstream/Axolotl` (the folder is git-ignored).

### Editing tips
- Timings live in each module's keyframe tracks (`track(frame, [[f, v, ease], …])`) and in `src/film/timeline.ts` (module ranges). Change a module's length there and shift the following modules together.
- The camera is plain data (`Cam {x, y, z, dist, pitch, yaw, roll, persp}`); `flatCam(floorZ)` gives the exact "real app" framing.
- Sound: edit `audio/cues.py` (SFX) or `audio/score.py` (music), then `npm run audio`.

## Quality checks done
- Every module cut verified on the encoded film: seamless (mean frame difference at each cut matches the motion on either side; M7→M8 and M8→M9 are pixel-identical).
- Three frame-by-frame motion reviews at 10 fps, followed by two fix passes (arcs, anticipation, perch clipping, camera/cursor velocity spikes, framing, readability of key gags, UI fidelity).
- Soundtrack: deterministic, every intended hit within ±0.5 ms of its frame; measured, not listened to by a human — give it a listen and adjust levels in `audio/cues.py` / `audio/score.py` if needed.
- Known nits: a faint double-exposure of the Discover floor for ~0.1 s at 66.8 s while the floors fold; the trapdoor squeeze at 39.1 s is a rigid squash rather than a true hourglass.

## Credits & licences
- Axolotl Launcher brand mark and UI design © the Axolotl Launcher project (Garbage Human Studio); used for the project's own promotional film.
- Icons: the product's icon set (Lucide-derived, ISC/MIT).
- Fonts: Inter 3.19 (SIL OFL 1.1), Noto Sans SC (SIL OFL 1.1) — licences in `public/fonts/`.
- Mod icons belong to their respective authors (CaffeineMC, the Iris team, FabricMC, masa, TerraformersMC) and appear only as product content, as the launcher itself displays them.
- Minecraft block textures appear only as product content, as in the launcher itself. 非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。
- Built with [Remotion](https://www.remotion.dev) (free for individuals and small teams; companies above 3 people need a Remotion company licence to render commercially).
