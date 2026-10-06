# 《启动按钮去哪了？》 · Concept "Product Truth" — treatment + shot list

**Angle:** every beat is triggered by a real mechanic of Axolotl Launcher **1.9.7**, shows a real state, and uses verbatim zh-CN copy. The chase is a tour of the launcher that never explains itself: the viewer learns the features because the story *uses* them.
**Ground truth:** `E:\GitHub\Axolotl-animation\research\PRODUCT_BIBLE.md` (§ numbers below refer to it) and the area reports `research\0*.md`. String sources are listed in §7.6.

| Key number | Value |
|---|---|
| Duration | **82.0 s = 4,920 frames @ 60 fps** (story 74.0 s + end card 8.0 s) |
| Frame / window | 1920 × 1080. The app window is **1440 × 810 CSS px**, shown at **1.3333×** so it fills the frame in every "real app" shot |
| Theme | Light + pink accent (`#db2777`). Right panel **collapsed** (a user setting, so Home shows only grey and one pink button); Discover forces it open (real behaviour, §4.1) |
| Music grid | **120 BPM, 4/4, F major**. 1 beat = 0.5 s = 30 frames; 1 bar = 2.0 s = 120 frames. Every story hit below sits on a beat |
| Route | 主页 (Minimal Home) → 发现内容 → 实验室 → 种子地图 → 投影工坊 → 主页 → the world. Floors are visited in nav-rail order (§4.1) |
| The rule of three | **Press 1** (5.0 s) sinks the button: lost. **Press 2** (44.0 s) sinks it again: comedy. **Press 3** (69.0 s) holds, and opens the world |

---

## 1. Logline and emotional arc

**Logline (zh).** 光标刚按下「开始游戏」，按钮就把自己的名字当了真——它沉了下去，在启动器里开始了一场捉迷藏。光标一路追过发现内容、实验室、种子地图和投影工坊，每一次扑空都按下了一个真实的按钮；直到它学会用启动器自己的工具——搜索、标记、框选、层间距——找到它、圈住它，再把整座启动器合拢，送它回家。第三次按下，世界打开了。

**Logline (en).** The instant it is pressed, the launch button takes its own label, 「开始游戏」 ("start the game"), literally: it sinks through the floor and starts a game of hide-and-seek inside the launcher. The cursor chases it down through Discover, the Lab, the seed map and the schematic workshop. Every lunge that misses presses a real control, until the cursor learns to use the launcher's own tools (search, marker, box select, layer spacing) to find it, catch it and fold the whole launcher back together. The third press opens the world.

### 1.1 What each character wants

| | Wants | Behaviour | Arc |
|---|---|---|---|
| **The button** (「开始游戏」) | **To play.** It has launched a thousand games and never played one, so it treats the press as "tag, you're it". | Mischievous but fair: it never leaves the product's world, and pink follows it everywhere (focus ring, marker colour, drop overlay, selection). It flinches with the product's own hover darken (`#c5236b`) whenever the cursor gets close. | Mischief (sinks, peeks) → play (hides, perches, leads) → **found** (named 「启动按钮」 on the map) → **caught** (box-selected) → goes home willingly → offers itself to the click. |
| **The cursor** | **To start the game**: one click on 「开始游戏」. | It is the player. It only does what a pointer can do: hover, click, type, right-click, drag, scroll. | Frantic (four lunges, four misses) → methodical (search, map, marker) → precise (two calm clicks for 框选; one slow drag on 层间距) → gentle (the final click). |

**Resolution.** The hide-and-seek ends when the button is *found* (the marker answers the title's question) and *caught* (the selection). The cursor does not click it in the workshop, where a click only selects blocks. It brings the whole launcher back together so the button can do its job where it lives. The button lets itself be pressed, and 「开始游戏」 comes true twice: the button's game is over, and the real game begins.

### 1.2 Tension map

| Time | Intensity | Beat |
|---|---|---|
| 0.0–5.0 | ▁ | The real app, calm; the familiar gesture |
| 5.0–7.75 | ▅ then ▁ | Shock (it sinks), then a dead-silent stare |
| 7.75–13.0 | ▃▅▇ | Peek gag → dive → the launcher revealed as a building |
| 13.0–20.5 | ▃▂ | Hide in plain sight; the title is typed into search |
| 20.5–22.5 | ▁ (silence) | 「这里还是空的」 while the button lies right there |
| 22.5–31.0 | ▆▇█ | Four misses that install a mod; down the nav rail like stairs |
| 31.0–36.0 | ▅ | Through the Lab, into the map |
| 36.0–43.5 | ▂▃ | A calm, colourful search; the marker answers the title |
| 43.5–47.0 | ▁ then ▅ | Callback: press 2 sinks it again; drop into the workshop |
| 47.0–55.0 | ▃▄▆ | Dark stage, voxel comedy, the capture |
| 55.0–57.0 | ▁ | The look up: both want the same thing now |
| 57.0–62.0 | ▅▆▇█ | 层间距 100 → 0: the launcher folds back together |
| 62.0–69.0 | ▂ → ▁ | Home again; will it run? Heartbeat |
| 69.0–74.0 | █ then ▃ | Press 3 → through the triangle into an evening world |
| 74.0–82.0 | ▂ | End card |

---

## 2. World rules (read before animating)

### 2.1 The launcher as a building

Every page is a **floor**: a complete app window for that route (title bar, nav rail with its pink pill on the correct item, content well, right-panel state), built as a thin slab. The floors form an **aligned vertical stack** (same x/y footprint). World units are window CSS px; **z is up**, so lower floors have negative z.

| Floor | Route / page (v1.9.7) | z | Shell state on that floor | Nav pill |
|---|---|---|---|---|
| F1 | 主页 · Minimal Home | 0 | panel collapsed; breadcrumb 「主页」 | 主页 (y 48) |
| F2 | 发现内容 `/browse/mod`, target 「Vanilla Perfected」 | −720 | panel **forced open** (filters) | 发现内容 (y 160) |
| F3 | 实验室 `/lab` | −1440 | panel collapsed | 实验室 (y 384) |
| F4 | 种子地图 `/lab/seed-map` | −2160 | panel collapsed | 实验室 |
| F5 | 投影工坊 `/lab/schematic-preview` | −2880 | panel collapsed | 实验室 |

- **Floor slab:** 6 thick; well face `#ebebeb`, sides `#d4d4d4` (bible §2.4 extrusion palette). UI elevations on a floor: cards +4, controls +8, pink buttons +12, floating bars +20, toasts / popups / menus +28, modal +36. **Cursor "glass" height: +60** above the floor it is on.
- **Environment** around the stack: vertical gradient `#f2eef2` → `#d9d4dc`, with linear depth fog toward the lower floors. No other set dressing.
- **The shaft (staging constant).** The Home socket is the hero's rectangle **x 911–1055, y 404–452, centre (983, 428)** (bible §3.5, panel closed, +9 px for 1440 × 810). Every vertical passage the hero makes *through* a floor (F1 socket, F4 map hole) is staged at this x/y, and it lands in the F5 drop zone at the same point. This is what lets the stack collapse straight back into the socket at 62.0 s.

### 2.2 Physics and causality rules

| # | Rule | Product root |
|---|---|---|
| R1 | **Press = sink.** The real press is `scale(.97)` in 150 ms; from top-down that is exactly what a key sinking 3 % away from the camera looks like. For the hero only, the sink can continue through its socket and out of the floor. | ButtonFrame press (§3.3) |
| R2 | **Landing on a control presses it.** When the hero lands on a button, the button plays its real press (.97) and fires its real action (navigation, toggle, select). | real click response |
| R3 | **Navigation = the content well plunges one floor.** The title bar and nav rail stay put as a screen overlay, exactly as the real shell persists. The pill inchworms (leading edge 150 ms, trailing +120 ms; film ×2), the old content fades out (120 → 200 ms film) while the camera dollies 720 down, and the new content fades in (180 → 300 ms film). Anything standing on the old content drops with it. | NavRail inchworm, page cross-fade (§2.6) |
| R4 | **The hero is squishy, the UI is not.** The hero squashes, stretches, curls and stands on its edge; UI components never deform. They only play their own states. | fidelity rule 11 |
| R5 | **Pink follows the hero.** Every pink thing it touches is pink because of the accent: the marker it hides in turns pink, the drop overlay lights pink, the selection is pink. It never paints anything that is not pink in the product. | §3.8 hint |
| R6 | **Gravity (film):** g = 900 world px/s² for falls the audience must read (F1 → F2 lands in ≈1.25 s); cartoon exceptions are the peek jump (Sh05) and hops (spring timing). | AboutAxolotlRun constants scaled |
| R7 | **Culling (dollhouse rule).** When the camera targets floor N in a top-down or near-top-down shot, floors above N are not rendered (they would sit between the eye and the floor). In the wide shots (Sh07, Sh23, Sh24) all floors render. | CSS 3D has no near clip |
| R8 | **Nothing reflows when the hero leaves.** Minimal Home's right group is `justify-end`, so the list button stays at x 1063–1111 and an empty 144 × 48 r16 socket remains (drawn as a hole with soft inner shading). | §3.5 |

### 2.3 Camera grammar

| Mode | Use | Settings |
|---|---|---|
| **Real app (flat)** | Opening, every page arrival, finale | pitch 0, yaw 0, roll 0; scale 1.3333 at the floor (dist = 0.75 × persp). **persp 1000** by default: the flat UI is unaffected (it lies in the focal plane), but anything that leaves the plane (falls, hops) reads strongly. The cursor is a **screen-space sprite** here. |
| **Diorama** | Hiding, perching, the workshop, the tower wides | pitch 30–62°, yaw −10…−45°, persp 1600–3200 (longer = more "miniature"). Cursor = **billboard** at glass height with a FloorShadow. |
| **Dive** | Through the socket, the trapdoor, the map hole | persp 700–900 (wide), fast dolly; cull the floor being passed **before** the camera crosses its plane, at the frame where the hole fills the screen. |
| **Workshop fit view** | The 3D stage (Sh20–Sh22) | **persp 1160 ≈ FOV 50°** (the product's camera), elevation ≈ 30° above the horizon (pitch ≈ 60°), looking from +X+Z (screen bottom-right: yaw ≈ −45°) — the product's own fit view (§4.7). |

Moves use the product's easing vocabulary: camera `(.45,0,.2,1)`; arrivals `(.16,1,.3,1)`; springs `(.15,1.4,.64,.96)`.

### 2.4 The hero: form sheet

Identity core (§3.7): **pink `#db2777` + the outline play triangle** (never filled), plus the coloured-button skin (1 px white top rim, 30 % pink hairline, soft 4-layer shadow) and radius ≈ h/3. The triangle is visible in every form except the edge-on sliver (a brief hide the audience watches happen) and the pin (where the marker label 「启动按钮」 carries the identity).

| Form | Spec | Used in |
|---|---|---|
| **UI** | 144 × 48 × 8 slab, r 16; top face = the real button (§3.3 CSS, PlayIcon 24 outline +1 px, 「开始游戏」 16/800, Chinese capped at 600 per §2.2); sides `#c5236b` → `#be185d` underside. States: idle, hover `#c5236b`, press .97 | everywhere |
| **Edge** | The UI slab rotated 90° about its long axis, standing on its edge: 144 × 8 footprint, 48 tall. From top-down: a pink line | Sh08–Sh11 (in the 12 px card gap) |
| **Disc** | 48 × 48 circle, 8 thick, pink, triangle 24 px offset +2 px, label hidden: the library hover-play disc (§3.8) | Sh13 (nav rail) |
| **Swatch** | 36 × 36 r8 pink square (the marker colour square), triangle shrunk to 16 px | Sh17 (0.6 s) |
| **Pin** | Exact canvas marker (§4.6): head r7 centred 3 px above the point, 2 px white ring, tail to +11; label tab rgba(20,22,26,.86) 22 tall, `600 11px` white 「启动按钮」 at (x+10, y−12) | Sh17–Sh18 |
| **Voxel** | 30 × 10 blocks × 2 layers, block = 4.8 world px, so the footprint is exactly 144 × 48 × 9.6. Body `block/pink_concrete` (atlas [1872,1904]); a pixel-art ▷ **outline** in `block/white_concrete` ([1552,1872]): 7 rows × 6 columns, 1-block stroke, left edge at column 5 (the icon's real position). Corners stepped (r ≈ 3 blocks). The label area stays plain pink, because text cannot survive voxelization. Face shading top 1.0 / left 0.78 / right 0.57 (§4.7) | Sh20–Sh24 |

**Morph timings.** UI → Edge 200 ms; UI ↔ Disc 220 ms (label fades first, triangle recentres); UI → Swatch 160 ms (squash in); Swatch → Pin 400 ms; Pin → UI 150 ms; UI → Voxel 1.7 s (built by the mesh progress, Sh20); Voxel → UI 1.2 s (during the collapse).

**Motion presets** (§3.9, all from product code). Landing squash `sx = 1 + 0.2·impact, sy = 1 − 0.16·impact`, decay ≈ 220 ms. Airborne stretch `sy = 1 + 0.1·v`, tilt `−0.16·v` rad. Hop and pop arrivals use the spring `(.15,1.4,.64,.96)`. Inchworm legs 300 ms, trailing 240 ms. Idle breathing is **off** in real-app shots (Sh01–Sh02, Sh25–Sh27); the app must look exactly like the app.

**Acting vocabulary.** It "looks" by leaning its whole slab toward a target (±8°; the triangle is its nose). It flinches with the product hover darken. It freezes with a 1 px tremble. It gets smug with a hop plus a ½-turn spin in M4 only.

### 2.5 The cursor

- **Kinds follow the UI under the hotspot**, as a real pointer would. Arrow over plain surfaces; pointer hand over buttons; I-beam in text fields; open hand on the seed-map canvas (closed while dragging); arrow in the 3D viewport. The engine provides arrow, pointer, ibeam, grab, grabbing, move.
- **Screen size 44 px** (≈1.4× a real macOS pointer at this scale) so it reads at film size. Constant size in flat shots. In 3D it is a billboard at glass height (+60), casting a soft shadow, and dips to the target's surface on each click (a visible "poke" in tilted shots).
- **Realism bookends:** in Sh01–Sh02 and Sh25–Sh27 it behaves exactly like a real pointer: no rotation, no squash, constant speed curves. Between them it may act: double-take jiggle (±4 px), wind-up before a lunge, dizzy wobble, droop (−3°), nod (4 px).

### 2.6 How I adapted the director's spatial proposal

Adopted: floors = pages, top-down = the real app, tilting reveals the diorama, gravity points to the next floor, the cursor dives after the button, and the film opens and closes on the flat Home. Three refinements:

1. **An aligned stack plus dollhouse culling (R7).** The proposal's "return" needs every floor to close onto the same plane. Aligned floors seen from the front at ~30° below horizontal also give the best reveal composition: each page is visible in the gap beneath the one above, like a lit bookshelf of screens (Sh07, Sh23).
2. **Floor changes are real navigations (R3).** The shell stays still, the content plunges, the pill inchworms. That is the product's own page change with depth added. Floors are in nav-rail order, so "down" always agrees with the app's own map.
3. **The return is not a projector beam but the workshop's 「层间距」 slider.** Its real job is to spread a build's layers apart (0–100 %, step 10). In the climax it closes the launcher's own layers, 100 % → 0 %. Same spatial loop, but the trigger is a control a viewer can use tomorrow. The only alignment it needs, the shaft under the Home socket, is staged deliberately (§2.1).

---

## 3. Causal chain (every hand-off)

| # | Time (s) | Form before | Trigger (real mechanic) | Form after | Visual core kept |
|---|---|---|---|---|---|
| 1 | 5.00 | UI, idle in its socket | Cursor click: the real press `.97` / 150 ms (R1) | UI, sinking → falls to F2, runs off | pink, ▷, label, skin; true perspective shrink only |
| 2 | 7.75 | UI, on F2 under the hole | The cursor stares down the hole (no click) — it is playing | UI, spring-jumps up into the socket, then drops again at the cursor's twitch | all |
| 3 | 8.85 | UI, falling | The cursor dives through the same socket | UI, lands on F2 (Discover) ahead of it | all |
| 4 | 13.30 | UI | The cursor's shadow descending; the only cover is the real **12 px gap** between result cards | Edge (pink line in the gap) | pink (form change seen in close-up) |
| 5 | 20.50 | Edge | The cursor's **search** (「启动按钮去哪了？」): 200 ms debounce → skeletons → **empty state** removes the cards around it | UI, tipped flat, exposed | all |
| 6 | 22.50–27.50 | UI, perched on 「清除搜索」 → 「＋ 安装」 → 「＋ 安装 1 个内容」 → modal 「安装」 | Four cursor lunges miss; each click lands on the control underneath (R2) and advances the real install flow | UI, airborne as the modal closes | all |
| 7 | 28.80 | UI, running | Reaches the nav rail: 48 px circles on a 56 px pitch | **Disc** | pink, ▷ |
| 8 | 31.00 | Disc on 实验室 | Its landing presses 实验室 (R2) → real navigation, pill inchworm, content plunge (R3) | Disc → UI on F3 | pink, ▷ |
| 9 | 33.00 | UI, leaping | Lands on 种子地图's 「› 进入」 → press → navigation; the content gives way (trapdoor) | UI, falling to F4 | all |
| 10 | 36.30 | UI | Skids into a cherry-grove patch (`#FF91C8`) and lies still | UI, camouflaged | pink-on-pink, ▷ legible on zoom |
| 11 | 41.40 → 42.00 | UI | Right-click → marker popup; the cursor names it 「启动按钮」. The hero squeezes into the colour square; the cursor clicks 「添加标记」 | Swatch → **Pin**, pink because the swatch was the hero; toast 「标记已保存」 | pink + white ring (echo of the white rim) + the name |
| 12 | 44.00 | Pin | Cursor clicks the pin = **press 2** (R1) | UI, uncurls and sinks through the map at (983, 428) | all |
| 13 | 46.50 → 47.00 | UI, falling onto F5 | Something "dragged" over the workshop → **drop overlay** 「松开以打开投影」; landing = release | UI inside the drop zone | all |
| 14 | 47.50 → 50.20 | UI | The workshop "opens" it: 「正在解析投影」 → 「正在读取资源」 → 「正在生成模型」 | **Voxel** (pink concrete + white ▷) | pink, ▷ |
| 15 | 53.50 | Voxel | Cursor 「框选」: corner block → 「请选择另一对角」 → opposite corner | Voxel inside a pink selection (24 % faces + solid edges + .65 box) | pink, ▷ |
| 16 | 57.80 → 62.00 | Voxel, selected | Cursor drags 「层间距」 100 → 0 % in ten 10 % notches; floors converge; voxel steps smooth out | UI, rising into the Home socket; spring settle | all; selection pink dissolves into its own pink |
| 17 | 69.00 | UI, idle | Cursor click = **press 3**: `.97` and it **holds** | (cut on the press frame, bible rule 15) the outline ▷ becomes the portal to the world | ▷ is the last thing we see |

---

## 4. Shot list

### 4.1 Overview

| Shot | Time (s) | Where | One line |
|---|---|---|---|
| Sh01 | 0.00–3.00 | F1 Home | The real app, still |
| Sh02 | 3.00–5.00 | F1 | The cursor approaches; hover darken |
| Sh03 | 5.00–6.00 | F1 | **Press 1**: it sinks and is gone |
| Sh04 | 6.00–7.75 | F1 | Silence; the hole deepens; double-take |
| Sh05 | 7.75–8.75 | F1 | The peek: it springs back into place, then drops again |
| Sh06 | 8.75–9.75 | F1 → shaft | The cursor dives after it |
| Sh07 | 9.75–13.00 | the building | Reveal: the launcher is a stack of pages |
| Sh08 | 13.00–15.00 | F2 Discover | It stands on its edge and hides in the card gap |
| Sh09 | 15.00–16.00 | F2 | Top-down Discover; the cursor arrives |
| Sh10 | 16.00–19.50 | F2 | **TITLE**: 「启动按钮去哪了？」 typed into search |
| Sh11 | 19.50–22.50 | F2 | 「这里还是空的」 while it lies right there |
| Sh12 | 22.50–28.50 | F2 | Four misses install 「投影 (Litematica)」 |
| Sh13 | 28.50–31.50 | F2 nav rail | Down the nav rail like stairs; presses 实验室 |
| Sh14 | 31.50–35.00 | F3 Lab | Leap onto 种子地图's 「› 进入」: trapdoor |
| Sh15 | 35.00–37.00 | F4 Seed map | Lands in the cherry grove |
| Sh16 | 37.00–39.50 | F4 | Pan and zoom; found |
| Sh17 | 39.50–43.50 | F4 | Named 「启动按钮」; becomes the pink pin; 「标记已保存」 |
| Sh18 | 43.50–45.50 | F4 | **Press 2**: it sinks again (callback) |
| Sh19 | 45.50–47.50 | F5 Workshop | 「松开以打开投影」 catches it |
| Sh20 | 47.50–50.50 | F5 | Opened as a schematic: voxel button |
| Sh21 | 50.50–52.00 | F5 | Too heavy to hop |
| Sh22 | 52.00–55.00 | F5 | 「框选」: caught |
| Sh23 | 55.00–57.00 | the building | The look up: the whole tower |
| Sh24 | 57.00–63.00 | F5 → building → F1 | 「层间距」 100 → 0: the launcher folds shut; home |
| Sh25 | 63.00–66.50 | F1 | Home again, exactly as the opening |
| Sh26 | 66.50–69.00 | F1 | Hover. Will it run? |
| Sh27 | 69.00–69.30 | F1 | **Press 3**: it holds |
| Sh28 | 69.30–72.50 | F1 → world | Through the outline triangle into an evening world |
| Sh29 | 72.50–74.00 | world | The instant of arrival; dissolve |
| Sh30 | 74.00–82.00 | end card | Logo, wordmark, tagline, disclaimer |

### 4.2 Shot cards

Coordinates are window CSS px (1440 × 810) unless marked "world". "Music" names the section in §6.

---

#### ACT I · 「开始游戏」

**Sh01 · 0.00–3.00 · The real app**
- **Location:** F1, Minimal Home, exactly as shipped (bible §3.5 panel-closed column, §4.1 shell). Title bar: traffic lights; logo + 「Axolotl」; ← → circles; breadcrumb ⌂ 「主页」; 📰; running pill 「● 没有运行中的实例」. Nav rail: 主页 pill pink (white icon), 截图中心 · 发现内容 · 皮肤选择器 · 多人游戏 · 实例库 · 实验室 · 下载 │ quick instances (Vanilla Perfected's Fabric icon first) │ ＋ · ⚙. Collapsed right-panel handle at the right edge. Well: 「傍晚好，Mystic_Stars」 (24/800, CJK at 600) + 32 × 2 pink bar; card x 360–1128: 32 px Fabric icon, 「Vanilla Perfected」, 「Fabric 26.2」 · 「游玩于 2分钟前」 (with Game / Timer icons); **hero 「▷ 开始游戏」 at x 911–1055, y 404–452**; list button ☰ (48). Layout-switch pill bottom-right.
- **Camera:** Real app (flat), persp 1000, scale 1.3333 → 1.36 (a 2 % push over 3 s, centred on the window).
- **Button:** idle, still. No breathing.
- **Cursor:** enters at 1.8 s from the bottom-right corner (arrow), gliding on a soft arc toward the card.
- **UI reactions:** none.
- **Sound:** room tone; Music A ("Home"): pad F(add9) fades in; kalimba plays the **play motif** at 0.5 s (C5–F5–A5–G5, unresolved).
- **Purpose:** establish the real product and its one pink button. The ironic status 「没有运行中的实例」 sits top-right all film.

**Sh02 · 3.00–5.00 · The ritual**
- **Camera:** continue the push; drift x so the hero sits on the right third.
- **Cursor:** glides over the card (arrow), enters the hero at 4.30 → pointer hand, settles over the triangle. Real pointer behaviour only.
- **Button:** hover `brightness(.9)` → `#c5236b` (150 ms ease-out) at 4.30.
- **Sound:** hover_tick at 4.30; pad sustains.
- **Purpose:** the gesture every user knows; anticipation.

**Sh03 · 5.00–6.00 · Press 1**
- **Button:** 5.00 mouse-down → the real press `.97` (150 ms) — **and it keeps going** (R1). The slab sinks through its socket (z +12 → −6 by 5.30), clears the floor, and falls under g to F2 (720 below). From top-down this is a pure perspective shrink: 1.0 → 0.51 at F2's plane with persp 1000. The label and ▷ stay crisp all the way. Lands on F2 at 5.95 (seen through the hole: a small pink plop), then scoots sideways out of the hole's view.
- **Socket:** an empty 144 × 48 r16 hole with soft inner shading (card side `#dfdfdf`, well side `#d4d4d4`). Nothing reflows (R8).
- **Cursor:** pointer frozen at the click point (button still down).
- **Sound:** **button_press** at 5.00 (the "press motif" sound, reused for presses 2 and 3); **fall_whistle** (G6 → G4, 1.0 s) from 5.15. Music **cuts dead at 5.00**.
- **Purpose:** inciting incident. The most familiar interaction becomes a disappearance.

**Sh04 · 6.00–7.75 · The hole**
- **Camera:** static framing, but a slow **dolly-zoom (vertigo)** from 6.2 to 7.5: persp 1000 → 600 with dist re-solved, so F1 keeps its exact size while the floor seen through the hole recedes ("the hole deepens").
- **Through the hole:** a fragment of Discover far below: the gap between two result cards, the corner of an outlined pink 「＋ 安装」. At 7.20 the hero slides back into view down there and leans back: it is looking up.
- **Cursor:** frozen; at 6.90 a double-take jiggle (±4 px, 3 cycles in 0.25 s).
- **Sound:** silence (room tone only); a faint distant bounce_tap (plastic, −24 dB) at 6.00.
- **Purpose:** suspense and comic timing. The silence is the joke's setup.

**Sh05 · 7.75–8.75 · The peek**
- **Button:** 7.75 squashes on F2 (seen through the hole); 7.85 cartoon spring-jump straight up the shaft (R6 exception): it grows fast in the hole. 8.00 it **pops into the socket**, perfectly in place, as if nothing happened (spring `(.15,1.4,.64,.96)`, overshoot 1.04 → 1). Innocent hold 8.20–8.45. At the cursor's twitch it **drops again** at 8.50 (same sink, faster).
- **Cursor:** 8.45 a small twitch toward it, pointer hand.
- **Sound:** pop (cork) at 8.00 + boing (short) on the overshoot; at 8.50 swish + a short fall_whistle (0.5 s, higher). Music: a two-note pizzicato "neener" (G5–E5) on 8.50.
- **Purpose:** personality. It is not broken; it is **playing**. This is the invitation to chase.

**Sh06 · 8.75–9.75 · The dive**
- **Cursor:** wind-up (moves back 6 px, 8.75–8.85), then dives tip-first into the socket. From here on it is a billboard in 3D (§2.5).
- **Camera:** Dive mode. Follows the cursor down into the socket: dolly in (scale 1.33 → 30), pitch 0 → 20°. The socket walls rush past (the card's 1 px white rim, `#dfdfdf` card side, `#d4d4d4` floor side). Cull F1 at 9.55, when the hole fills the frame (R7).
- **Sound:** whoosh (light, short) at 8.85; wind starts. Music B ("Reveal"): **riser_tuned F3 → F5** begins at 9.0 and peaks at 12.0.
- **Purpose:** commitment; the transition into the launcher's insides.

**Sh07 · 9.75–13.00 · The building**
- **Camera:** from inside the gap under F1, pitch up toward the horizon while dollying back out through the front of the stack (9.75–10.5). Then crane up and back to the **wide "bookshelf" view** (10.5–12.0): target between F2 and F3, pitch 60°, yaw −22°, persp 3200 (long lens, miniature feel). Frames F1 on top and F2–F4 below, each page visible in the gap under the one above, fading into fog. The staircase of pink nav pills reads down the left edge. 12.0–13.0: crane down toward F2's results (pitch 50°, yaw −15°, persp 1600).
- **Visible:** each floor is its real page: F2 Discover (tabs, search, cards, pink-washed filter panel), F3 Lab (six cards with pink 「› 进入」), F4 seed map (a vivid band of biome colours), F5 workshop empty state. F1's socket is a dark slot.
- **Button:** in the chase with the cursor: it lands on F2 at 10.40 (tiny bounce), looks up, then runs for cover at 11.0.
- **Cursor:** gliding down the F1–F2 gap with its shadow growing on F2.
- **Sound:** wind_whoosh; land (light) at 10.40. Music: the riser lands on the **12.0 downbeat**: glockenspiel and celesta arpeggio over a pad swell (F maj9), then a marimba pickup into the chase groove.
- **Purpose:** world-building: the launcher's insides are a miniature building of its own pages. Down means deeper into the app.

---

#### ACT II-A · 发现内容

**Sh08 · 13.00–15.00 · The slot**
- **Location:** F2, Discover with target Vanilla Perfected (scene-b state, §4.3). Results (relevance, 「隐藏已安装内容」 off): card 1 「钠 (Sodium)」 [「✓ 已安装」, disabled .5]; **card 2 「投影 (Litematica)」 [「＋ 安装」 outlined pink]**; card 3 「Fabric API」 [「✓ 已安装」]; card 4 「模组菜单 (Mod Menu)」 [「＋ 安装」] partly visible. Mod icons are neutral initial tiles (no real logos); download counts and summaries are plausible stand-ins, never in focus.
- **Camera:** Diorama, pitch 50°, yaw −15°, persp 1600, close on the gap between card 1 and card 2 (≈ y 425–437), right above the landing point.
- **Button:** sees the cursor's shadow, leans back (13.20), then flips onto its **edge** (13.30–13.50) and slides into the 12 px gap (13.50–14.00) like a coin into a slot. Only a pink line shows, below the card tops.
- **Cursor:** descends into frame; lands (stops at glass height) at **15.00**.
- **Sound:** squash (on the flip), slide (card) on the slot, a tiny rubber creak; bounce_tap (soft) at 15.00. Music C ("Chase groove") enters sneaky: staccato marimba, shaker.
- **Purpose:** through the gaps. Dramatic irony: we know exactly where it is.

**Sh09 · 15.00–16.00 · Top-down Discover**
- **Camera:** pitch 50° → 0 by 15.40, framing the full window (Real app). F1 culled (R7).
- **Visible:** title bar breadcrumb 「发现内容」; nav pill on 发现内容; NavTabs 「整合包 · 模组 · 资源包 · 数据包 · 地图 · 光影包 · 服务器 · 收藏夹」 (模组 active) + 「翻译」; search 「搜索模组……」; [Fabric icon] 「Vanilla Perfected ⌄」; 「所有来源」; 「相关性」 · 「20」 · view · pagination; locked pills 「🔒 26.2」 「🔒 Fabric」; results; right panel 「隐藏已安装内容」 (toggle off), 「游戏版本」 locked box 「游戏版本由实例提供」 / 「解锁这个筛选项可能导致安装不兼容的内容。」 / 「解锁筛选」, 「加载器」 「加载器版本由实例提供」, 「类别」. The pink sliver in the gap is visible if you look for it.
- **Cursor:** arrow; two small searching arcs.
- **Music:** groove thins to bass + shaker.
- **Purpose:** we are back in the real app, on a new page.

**Sh10 · 16.00–19.50 · TITLE: 「启动按钮去哪了？」**
- **Cursor:** 16.00 moves into the search field → I-beam; click.
- **UI reactions (real StyledInput):** focus at 16.00: **4 px pink ring `rgba(219,39,119,.68)`** fades in (150 ms); the SearchIcon goes `#1a202c` @100 %; the placeholder 「搜索模组……」 goes to 80 %. Typing uses whole-sentence pinyin, as Chinese users really type: 16.40–17.90 the inline IME composition grows, underlined: `qidonganniuqunale`. **18.00 commit** → 「启动按钮去哪了」 replaces the pinyin in one beat (Latin turning into Chinese is the title's reveal). **18.50** 「？」 is committed. The ✕ clear button appears with the first commit. Caret blinks (530 ms).
- **Camera:** 16.00–16.60 push in to frame the left half of the field (scale ≈ 4; the field spans the frame; text ≈ 64 px tall on screen; ring visible top, left and bottom). Hold 18.50–19.50: **this frame is the title card**.
- **Off-frame truth:** 200 ms after 「？」 (18.70) the real search fires and the results area below switches to loading. We are too close to see it.
- **Sound:** key_click bursts for the pinyin (17 keys at ~11 keys/s); a caret_tick on the commit; 「？」 on a pluck. Music D ("Question"): pizz pluck ticks on 8ths; at the 18.00 commit the **question motif** runs up seven notes, F4 G4 A4 Bb4 C5 D5 E5, one per syllable 启·动·按·钮·去·哪·了. At 18.50 the 「？」 rings a single glockenspiel E6 that hangs unresolved over the F pad.
- **Purpose:** the film's title as product UI: the cursor's goal stated, in the field the product built for finding things.

**Sh11 · 19.50–22.50 · 「这里还是空的」**
- **Camera:** pull back 19.50–20.00 to a medium (scale 1.6, centred on the results).
- **UI reactions:** loading state already showing: spinner + 「正在加载结果……」 + pulsing skeleton cards (the hero, still on edge, now stands between skeletons). **20.50 empty state** replaces them: 40 px FolderSearch chip, 「这里还是空的」, 「没有找到您的查询结果！」, [「清除搜索」] (white base button).
- **Button:** with no cards around it, it wobbles and **tips over flat** (20.50–20.75), lying fully exposed to the right of the empty-state block: 「▷ 开始游戏」 in plain sight. It freezes with a 1 px tremble.
- **Cursor:** the I-beam leaves the field → arrow; freezes, pointed at the empty state.
- **Sound:** a soft low pop (bubble) on the tip-over, then **silence**. One bass "dun" at 21.00. Music stops.
- **Purpose:** the search answers 「这里还是空的」 with the button lying right there. The longest held laugh in the film; let it sit.

**Sh12 · 22.50–28.50 · Four misses ("productive misses")**
Camera: Real app framing at scale 1.33 for M1–M2, pushing to 1.5 centred on the modal for M3–M4 (slight tilt allowed for hop arcs; FloorShadows show the hop height). Each miss is a 3-beat cycle (1.5 s), and **every click lands on a beat**: 23.0 / 24.5 / 26.0 / 27.5. As the cursor arrives over the hero, the hero darkens (the real hover) then hops away one frame before contact.
- **M1 (22.50–24.00):** 22.50 the hero springs up (boing) and perches on 「清除搜索」. 22.90 the cursor swoops (pointer, motion blur). **23.00 click** lands on 「清除搜索」 (.97): the field clears (placeholder 「搜索模组……」 returns, ✕ gone, focus leaves so the ring fades) → a skeleton flash → **cards fade up 4 px together** (220 ms → 300 ms film). 23.75 the hero lands on card 2's 「＋ 安装」.
- **M2 (24.00–25.50):** **24.50 click** → 「✓ 已选择」 (green `#00af5c`, CheckIcon). 24.60 the **cart bar springs in** (`scale(.5) translateY(-10rem)` → rest, spring `(.15,1.4,.64,.96)`, 250 → 400 ms film): [Li tile] 「1个已选择的项目」 │ 「清除」 … pink 「＋ 安装 1 个内容」. 25.25 the hero lands on 「＋ 安装 1 个内容」.
- **M3 (25.50–27.00):** **26.00 click** → 「正在准备 0/1」 (spinner). 26.20 the **「确认安装」 modal grows from the click point** (container starts offset toward the click by (click − centre)/16, body `.97 → 1`, scrim + 5 px blur). Contents: 「已选内容」 (「投影 (Litematica)」 row), 「请确认将在 Vanilla Perfected 中安装 1 个内容 和 1 个前置。」, 「前置」 · 「1 个前置」 · 「必要前置」 (its dependency card soft-focused), 「只会安装勾选的前置。」, 「取消」 / pink 「安装」. The hero is scooped up by the growing modal and ends on its pink 「安装」 (26.75). The cart bar hides while the modal is open (real `hide-when-modal-open`).
- **M4 (27.00–28.50):** 27.45 the hero's biggest hop, with a smug half-spin. **27.50 click** lands on 「安装」 → the modal closes (.97 + fade), the scrim lifts. 27.70 the **download toast** slides in top-right (`translateX(100%) scale(.8)` → rest; 420 wide, top 72, right 24): [icon] 「投影 (Litematica)」 / 「正在下载内容」 「1 / 2」 + red 「取消」, with the **4 px pink progress bar** filling along its bottom. 27.90 a pink badge 「1」 pops on nav 下载. Card 2 now shows 「安装中……」 (spinner). 28.00 the hero comes down where the modal used to be, lands on the results and **bolts left** at 28.20.
- **Cursor:** lunges grow longer each time; after M4 it overshoots and wobbles, dizzy (27.6–28.2).
- **Sound:** per miss: swish (lunge) + ui_click (the click) + the UI's answer: M1 card_flip ×3 as cards appear; M2 pop + boing (low) on the bar's overshoot; M3 whoosh (light, short) as the modal grows; M4 download_zip (toast) + install_ticks (progress) + pop (badge). Hero landings: bounce_tap (plastic). Music C at full: marimba ostinato, bass, kick on beat 1, clap, woodblock; a marimba stab chord on every click; one new layer per miss.
- **Purpose:** comic set piece and a complete, silent tour of Discover's install flow. The cursor's mistakes do real work: it installs 「投影 (Litematica)」, the mod that makes schematics, and that foreshadows the 投影工坊.

---

#### ACT II-B · down the stairs, through the Lab

**Sh13 · 28.50–31.50 · Down the nav rail**
- **Camera:** whip-pan left and push in on the nav rail (top-down, scale ≈ 2.4, window y ≈ 140–440 in frame). The shell is the persistent overlay (R3).
- **Button:** runs left across the well (run cycle: bob `sin(15t)·1.4`, tilt `sin(15t)·0.04`), leaps for the rail and curls into the **Disc** in the air (28.80). It lands on the 发现内容 pill (29.00, pink on pink, the compass hidden behind it), then **bounces down the rail like stairs**, one item per beat: 皮肤选择器 29.50 · 多人游戏 30.00 · 实例库 30.50 · **实验室 31.00**, landing hard. Each item it touches shows its real hover (white 48 circle, darker icon) for the contact frames. No tooltips: they need 200 ms and it never stays that long, which is product-true.
- **UI reactions:** 31.00 its weight presses 实验室 (.97 = a click, R2) → **navigation**: the real pill inchworms from 发现内容 down to 实验室 (leading edge 300 ms, trailing +240 ms, film ×2); breadcrumb → 「实验室」; the Discover content fades (31.05–31.25). The 下载 badge 「1」 stays.
- **Cursor:** chases down the rail one step behind; arrives at 31.20, too late.
- **Sound:** glockenspiel down F6 · D6 · Bb5 · G5 on the bounces, bounce_tap on each; at 31.00 button_press + a cadence hit on F5 (downbeat-feel); slide (card) under the inchworm. Music: the groove's turnaround fill resolves on 31.0.
- **Purpose:** the nav rail is the app's staircase and table of contents. The hero triggers real navigation.

**Sh14 · 31.50–35.00 · The Lab, in passing**
- **Camera:** 31.25–31.75 the **navigation plunge**: top-down dolly down 720 through the fading Discover content; the shell overlay stays. The Lab fades in (31.55–31.85) at full-window framing. 32.20–33.00 pitch 0 → 25° to show the leap's arc and shadow. 33.10 tip into a dive (pitch 60°, persp 900) after the hero, down to F4 (33.2–35.0).
- **Visible:** 「实验室」 · 「6 个工具」 · 「搜索工具」 · 「全部工具」 · 「全部」; cards 皮肤编辑器 (「在本地创建和编辑 Minecraft 玩家皮肤。」, 创作), 渐变文字生成器 (创作), **种子地图** (「在本地查看 Minecraft 种子的群系、结构和保存的标记。」, 世界), 投影工坊 (「快速预览、编辑你的投影」, 创作). A column of pink 「› 进入」 buttons.
- **Button:** on the rail at 实验室, uncurls to UI (32.00) and makes one long leap across the page (32.20–33.00), clearing the 渐变文字生成器 card. It lands squarely on 种子地图's 「› 进入」 (≈ x 1319–1399, y 625–657) at **33.00** → .97 → navigation → that content gives way like a trapdoor and it drops (33.15).
- **Cursor:** clicks the same 「› 进入」 at 33.40 (following, as a user would) and dives.
- **Sound:** stretch on the leap; land + boing (short) on 进入; button_press; whoosh (heavy, short) on the drop. Music: a short riser 33.0 → 36.0.
- **Purpose:** a glimpse of the Lab and its six tools (Axolotl's own features); the real 进入 portal.

---

#### ACT II-C · 种子地图

**Sh15 · 35.00–37.00 · The map**
- **Location:** F4 seed map (§4.6, panel collapsed): 「种子地图」 · 「Java 版 26.2 · 主世界」 · badge 「1 像素 = 4 格」. Toolbar: 版本类型 「Java 版」 · 游戏版本 「26.2」 · 种子 `10292992` · 「从实例导入」 │ 维度 「主世界 | 下界 | 末地」 (主世界 pink) · 坐标 X / Z · pink 「🧭 前往」 · 深度 「地表 (Y=128)」 · 「复制地图链接」. Layer strip 「地图图层」 [结构 | 矿物] + pink sticker toggles. Canvas: cubiomes palette with hillshade, structure stickers, the spawn compass; control stacks; bottom bar 「群系高亮」 · 「选择群系」 · 「地形估算」 · 「显示网格」 · 「搜索附近」. **A cherry-grove patch (`#FF91C8`) is painted around (983, 428).**
- **Camera:** exits the plunge above F4 at pitch 45°, yaw −10°, settling to Real app top-down by 36.60.
- **Button:** lands on the map at the trapdoor's x/y (≈ 1359, 641) at 35.30 and skids up-left into the cherry grove, lying still by 36.30 (pink on pink).
- **Sound:** map_rustle on landing; slide (rough) on the skid. Music E ("Map"), downbeat **36.0**: half-time, open; pad Bbmaj7 → F, kalimba arpeggios, soft shaker.
- **Purpose:** a visual breath after the chaos, and literally "the world, from above".

**Sh16 · 37.00–39.50 · Searching the map**
- **Cursor:** over the canvas → **open hand**; 37.20–38.00 drags (closed hand), panning 1:1. Two wheel zooms anchored at the cursor (38.30, 38.80; each 250 ms cubic ease-out): the badge reads 「1 像素 = 4 格」 → 「1 像素 = 1 格」; tiles re-stream nearest-first (the status pill 「⟳ 加载中」 flickers at the top centre); pixels get chunkier and stay crisp (nearest-neighbour).
- **Camera:** gentle push to scale 1.6 centred on (983, 470).
- **Reveal:** at 39.20 the cherry grove fills the view and the ▷ and 「开始游戏」 are legible inside it. The cursor stops dead (hover_tick).
- **Sound:** map_rustle (drag); two low swishes (zoom). Music E continues; a curious two-note kalimba figure.
- **Purpose:** the seed map's interactions (pan, cursor-anchored zoom, crisp pixels): seeking by **place** after seeking by **name** failed.

**Sh17 · 39.50–43.50 · The name**
- **Cursor:** 39.50 right-click on the hero → the marker draft **popup** at the point +14/+14 (272 wide, `#f8f8f8`, r 12): 「位置」 / 「X 120, Z -64」; row [「标记名称」 input][36 × 36 colour square, default green]; [📌 「添加标记」 pink 2xs] [「复制 /tp」 outlined 2xs]. 39.80 I-beam in 「标记名称」; 40.00–40.90 pinyin `qidonganniu`; **40.90 commit 「启动按钮」**.
- **Button:** at 41.40 it squeezes out from under the popup's anchor into the **colour square**, which turns pink because it now *is* the hero (Swatch form, a 16 px ▷ still visible).
- **Cursor:** 41.60 moves to 「添加标记」 (pointer); **42.00 click**.
- **UI reactions:** the marker is created with the swatch's colour. The hero shoots from the swatch to the map point and becomes the **Pin** (42.00–42.40): pink head, white 2 px ring, tail, label tab 「启动按钮」. The popup's title becomes 「启动按钮」. **42.50 toast 「标记已保存」.** Hold to 43.50: a pink pin named 「启动按钮」 on a pixel map. The title's question has its answer.
- **Camera:** push to scale ≈ 2.6 on the hero + popup, then ≈ 3.2 on the pin and its label for the hold.
- **Sound:** ui_click (right-click), card_flip (popup), typing bursts, squash (into the swatch), **pin_drop** (42.00), **success_chime** (42.50). Music: the **answer motif** on fm_bell at the 40.90 commit. The question's first four notes now come home: F4 G4 A4 → F4.
- **Purpose:** the cursor's first success, made with product UI. 「启动按钮去哪了？」 → 「启动按钮」, right here.

**Sh18 · 43.50–45.50 · Press 2 (callback)**
- **Cursor:** hovers the pin (pointer), one heartbeat of hesitation, **44.00 click**.
- **Button:** the pin uncurls back to UI (44.00–44.15) and — exactly like 5.00 — **sinks** through the map at (983, 428) (44.15–44.80), leaving a dark socket-shaped hole in the map. Framing, timing and sound mirror Sh03–Sh04.
- **Cursor:** frozen; 45.00 a droop (−3°); 45.30 dives.
- **Camera:** Real app framing (scale 1.6 → 1.33), then a short vertigo push on the hole; follows the cursor into it (cull F4 when the hole fills the frame).
- **Sound:** heartbeat (1 beat) at 43.50; **button_press** at 44.00; the **same fall_whistle** as Sh03; silence. Music cuts at 44.00.
- **Purpose:** rule of three, part 2: comedy of repetition. It is also the physical route down the shaft to F5.

---

#### ACT II-D · 投影工坊

**Sh19 · 45.50–47.50 · 「松开以打开投影」**
- **Location:** F5, workshop empty state (§4.7): `#ebebeb`, the no-documents illustration, 「编辑 Minecraft 投影」, 「打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。」, [「打开文件」 pink] [「从实例选择」 outlined].
- **Camera:** Dive down the shaft, pitch 0 → 35°, persp 1100; the hero falls ahead.
- **UI reaction:** 46.50 something is being dragged over the workspace (the falling hero), so the **drop overlay** lights: inset 12, 2 px **dashed pink**, r 12, bg `#ebebeb` @88 %, centred pink bold [FileArchiveIcon 24] **「松开以打开投影」**.
- **Button:** lands inside the dashed frame at (983, 428) at **47.00**: "released". The overlay clears at 47.30.
- **Cursor:** falls behind it; its shadow crosses the overlay text.
- **Sound:** wind (short); sparkle (down) as the overlay lights; land (soft) + squash at 47.00. Music F ("Workshop"): a suspended low pad, no beat.
- **Purpose:** "falling into the 投影工坊" is literal UI. The product's own drop target catches it.

**Sh20 · 47.50–50.50 · Opened as a schematic**
- **UI reactions:** the 4 px progress bar runs along the page top (track `#dddddd`, fill pink, 200 ms width transitions): **47.50** 12 % 「正在解析投影」 → **48.00** 38 % 「正在读取资源」 → **48.50–50.00** 「正在生成模型」 with the counter 「0 / 40」 … 「40 / 40」 (status, top-right of the viewport: Spinner 16 + text, 12 px). The viewport goes **`#0a0a0a`** with the grid floor (cells `#404040` @.72, section lines every 12 blocks `#6b6b6b` @.9) receding. Glass overlays settle in: mode toolbar 「单选 · 框选 · 测量 │ 层间距」, Y-layer control (pink thumb), canvas controls (复位视角 …), status bar. Inspector (340, `#f5f5f5`): tabs 「编辑 · 材料」. The file toolbar stays out of frame (no invented filename).
- **Button:** rebuilt as the **Voxel** form from the grid up: layer 1 of pink concrete sweeps in (48.60–49.40), layer 2 with the white ▷ outline (49.40–50.20), with ~20 loose blocks dropping into place as accents. Pink and ▷ survive.
- **Camera:** into the **workshop fit view** around (983, 428, −2880): persp 1160 (FOV 50°), pitch ≈ 60°, yaw ≈ −45°.
- **Sound:** projector_click (on) at 47.50; projector_hum as a bed; install_ticks synced to the mesh counter; a muted wooden bounce_tap per layer. Music F: low drone (F2 + C3) and a slow celesta figure.
- **Purpose:** the workshop's real pipeline and look (dark stage, real block textures, pixelated). The elastic hero is now made of Minecraft blocks.

**Sh21 · 50.50–52.00 · Too heavy**
- **Button:** tries to hop and only rocks: one end lifts and slams (thud at 51.00). Tries again: rolls one block-width, thunk (51.50). No squash any more; it is rigid.
- **Cursor:** arrives from above at 51.20 (arrow in the viewport), hovering at glass height over the stage.
- **Sound:** thud ×2 (heavy), a subtle sub_drop. Music: two low staccato bass notes.
- **Purpose:** humour, and vulnerability: it has lost its bounce.

**Sh22 · 52.00–55.00 · 「框选」**
- **Cursor:** **52.00** clicks 「框选」 on the glass toolbar: active = pink tint fill + pink label. **52.50** clicks one corner block of the hero: the block gets pink edges; the inspector hint reads 「请选择另一对角」 (pink). It moves slowly and diagonally (deliberate, the opposite of the lunges) and clicks the opposite corner at **53.50**.
- **UI reactions:** the **selection**: all outer faces filled with brand pink @24 %, solid pink edge lines on top, and a pink bounding box @.65 (+0.025). Status bar 「14, 1, 5 · 粉红色混凝土 · 已选 600 个」; inspector 「已选方块」 「已选 600 个」 with 「粉红色混凝土」 / 「白色混凝土」.
- **Button:** shivers once inside the pink box, then goes still.
- **Camera:** slow orbit, yaw −45° → −35°.
- **Sound:** ui_click ×3; **hologram_shimmer** (F5, maj9) at 53.50; a low snap. Music: a held F maj9 chord, the first full resolution since 12.0.
- **Purpose:** the cursor finally succeeds with the product's own precise tool. Caught.

**Sh23 · 55.00–57.00 · The look up**
- **Camera:** cut to the **tower wide**: the bookshelf view of Sh07 seen whole, far and long-lensed (persp 3200, pitch 62°, yaw −22°). All five floors stack up the frame: at the bottom F5's dark stage with a tiny pink box in it; F4's map with its hole; F3; F2; and Home on top, catching light.
- **Button:** inside its selection, it leans back toward the top of the tower (55.50).
- **Cursor:** beside it, tilts its tip up too; at 56.40 turns back to the hero and gives a small nod (4 px).
- **Sound:** heartbeat (soft, 2 beats); a single celesta C6 at 56.00. Near silence.
- **Purpose:** the film's breath before the finale. Both characters now want the same thing.

**Sh24 · 57.00–63.00 · 「层间距」 100 → 0**
- **Cursor:** **57.00** clicks 「层间距」 (UnfoldVerticalIcon) on the mode toolbar → its tool context appears (top-centre glass panel): pink layers icon + 「层间距」 + slider **thumb at the far right (100 %)**. 57.50 grabs the pink thumb (grab → grabbing) and drags it left in **ten notches** (step 10 %): 58.00, 58.50, 59.00, 59.50, 59.75, 60.00, 60.25, 60.50, 60.75, **61.00 = 0 %**.
- **Camera:** 57.00–57.80 close on the glass panel (scale ≈ 3.5, the dark stage soft behind). At the first notch, pull back fast to the **tower wide** (the Sh23 framing). With each notch the floor spacing shrinks 10 % (z = −720 × k × t): the floors converge **upward** onto Home like an accordion closing. The camera cranes up with the stack and tilts toward top-down, arriving at **exactly the Sh01 framing (pitch 0, persp 1000, scale 1.3333) at 62.00**.
- **Button:** rides F5 up the shaft under the socket (§2.1). From t ≈ 40 % the voxel steps dissolve into the smooth slab, the label 「开始游戏」 fades back and the ▷ becomes the 2 px outline again; at t ≈ 30 % the selection's pink dissolves into its own. Floors F2–F4 fade into F1 over the last 20 % (they fold under Home). **62.00: it seats in its socket** from below: snap, spring overshoot 1.04 → 1.
- **Sound:** a ratchet tick on each notch (rim / woodblock, pitched up the scale), riser_tuned (F3 → F5, "return") underneath, **snap_into_place (C6) at 62.00**, soft land. Music G ("Return"): marimba climbs one note per notch (F4 G4 A4 Bb4 C5 D5 E5 F5 G5 A5), quarters into 8ths; kick on downbeats; **62.00 (bar 32 downbeat) = the tonic**, F major on pad + glockenspiel, then diminuendo to 63.0.
- **Purpose:** the return. The launcher is put back together by its own layer-spacing control, closing the spatial loop. The building was the app at 「层间距」 100 % all along.

---

#### ACT III · 开始游戏

**Sh25 · 63.00–66.50 · Home again**
- **Location / camera:** identical to Sh01 (pixel-identical UI, same framing). The status pill still reads 「● 没有运行中的实例」.
- **Button:** idle in its socket; when the cursor nears, it nestles (1 % squash and back, once). Otherwise real-app still.
- **Cursor:** arrow, resting ~180 px left of and below the hero; 64.00–66.00 approaches slowly. Real pointer behaviour again.
- **Sound:** room tone; Music A returns: kalimba plays the play motif softly (as at 0.5 s), pad.
- **Purpose:** bookend. Everything is where it belongs.

**Sh26 · 66.50–69.00 · The hover**
- **Cursor:** over the hero → pointer. Holds.
- **Button:** hover darken `#c5236b`. **It does not flee.** A 2° lean toward the cursor (a cat leaning into a hand): permission.
- **Camera:** very slow push (2 %).
- **Sound:** heartbeat ×2 (67.50); pad holds a Bb/C suspension.
- **Purpose:** suspense. The audience remembers that a press means a sink.

**Sh27 · 69.00–69.30 · Press 3**
- **Cursor:** click at **69.00**.
- **Button:** the real press, `.97` in 150 ms, **and it holds**. It stays in its socket. Hold the pressed frame 4 frames.
- **Sound:** **button_press** (the same sound as presses 1 and 2, slightly fuller), then 4 frames of silence.
- **Purpose:** the rule of three subverted: this time the press does not lose it.

**Sh28 · 69.30–72.50 · Through the triangle**
- **Transition (bible rule 15: cut on the press frame, no invented loading state):** the camera rushes into the **outline play triangle** (centroid ≈ window (946, 428)). Scale 1.33 → ~120 in 0.5 s (ease-in). The triangle's interior is a window onto the world (clip-path from its projected vertices); the white 2 px outline frames it and passes beyond the frame edges at **69.80**.
- **The world (no UI):** an **evening** landscape (the greeting said 「傍晚好」): grass terraces, a pond, a **cherry grove** (pink cherry leaves: the pink biome it hid in on the map), a low square sun, blocky clouds, a few drifting pink petals. The camera glides forward low over the grass toward the cherry trees, decelerating (69.80–72.50).
- **Sound:** **launch_impact** (soft, airy) at 69.30; wind_whoosh; then soft wind and leaves. Music H ("World"): **downbeat 70.00**, the play motif resolved (C5–F5–A5–C6) in marimba, glockenspiel and celesta over pad F maj9, bass F2 and soft drums.
- **Purpose:** the instant of entering the world. The story ends here.

**Sh29 · 72.50–74.00 · Arrival**
- **Camera:** eases to a stop facing the sun through cherry blossoms. Optional easter egg: a small pink axolotl in the pond's foreground (brand voxel model, ≤0.6 s on screen).
- **Transition:** 73.60–74.00 dissolve to the end card's `#ebebeb`.
- **Sound:** the theme's last phrase; wind tails.

---

#### END CARD

**Sh30 · 74.00–82.00** — see §5.

---

## 5. Title and end card

### 5.1 Title: diegetic, in the product's search field

- **Where:** Sh10, Discover's real search field (`StyledInput`, 48 tall, r 12, white, 4 px pink focus ring), typed by the cursor through a real Chinese IME. The pinyin `qidonganniuqunale` commits as 「启动按钮去哪了」, then 「？」.
- **The title frame:** 18.50–19.50, the field framed large: 「启动按钮去哪了？」 in the product's input type (16 / 500, `#1a202c`; Noto Sans SC 500), caret blinking, the ✕ at the right, the pink ring around it. **No separate title card.** For thumbnails and festival stills, use this frame.
- **The answer:** the film answers itself in the same product language: 「这里还是空的」 (Sh11, search fails), then 「启动按钮」 (Sh17, the marker label on the map), and finally the end-card tagline.
- **Why 「启动」:** the product itself says 「启动按钮」 (「点击启动按钮即可启动服务器！」, §3.6). The button's face never stops reading 「开始游戏」.

### 5.2 End card (74.00–82.00)

Built on the product's own brand intro (`OnboardingWelcome.vue`, report 07 §3.8), in the light theme.

| Time | Element | Spec |
|---|---|---|
| 74.00 | Ground | `#ebebeb` (app well) with a faint brand wash along the bottom 30 % (`#ead9e1` → `#e9d0db` @50 %) |
| 74.00–74.90 | **Logo** | `branding/axolotl.svg` (voxel pink axolotl; never `logo.svg`), 176 CSS px → 235 px on screen; `scale .72 → 1.04 → 1`, opacity 0 → 1, `(.16,1,.3,1)`; same-colour 0.6-unit stroke to hide polygon seams |
| 74.90–75.95 | **Wordmark** | 「Axolotl」 72 / 800, gradient `#1a202c → #2c2e31`; 「Launcher」 72 / 700 (the product's 650 resolves to 700 with static Inter), `#484d54`. Gap 24. Unrolls left → right (max-width 0 → full) while each word slides `translateX(-4rem) → 0` |
| 76.05 / 76.40 | Pink wipes | a pink copy of each word wipes away left → right (`clip-path: inset(0 0 0 0) → inset(0 0 0 100%)`, `(.22,1,.36,1)`) |
| 76.20–77.20 | Lift | the logo + wordmark group rises to 40 % frame height |
| 77.20–77.80 | **Tagline** | **「你的下一个世界，从这里开始。」** (website copy, §6.9), 32 px on screen, `#1a202c`, CJK 600; fades up 4 px |
| 77.60–77.90 | Accent | the Minimal Home greeting's **32 × 2 pink bar** draws in under the tagline (a quiet echo of the first frame) |
| 77.80 | Name | 「美西螈启动器」, 18 px on screen, `#484d54` (from 「Axolotl Launcher（美西螈启动器）」, README) |
| 78.00–78.40 | **Disclaimer** | 「非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。」, 16 px on screen, `#484d54` @80 %, bottom-centred, 48 px from the bottom edge |
| 78.40–82.00 | Hold | optional small 「axlmc.org」 under the name (client's call); fade to the ground over the last 0.5 s |

**Tagline choice.** 「你的下一个世界，从这里开始。」 answers the title's 「去哪了？」 with 「从这里开始」 ("it starts here"), right after we have entered a world. Alternates, in order: 「一个启动器，承载每一个世界。」 (fits the stacked-pages building) and 「你的最后一款启动器。」 (wittier, less tied to the story).

---

## 6. Music and sound plan

**Grid:** 120 BPM, 4/4, F major. Bars start at even seconds (bar n starts at 2(n−1) s). The toolkit's default root is F, and all motifs below are in F.

**Motifs.**
- **Play motif** (「开·始·游·戏」): C5 F5 A5 G5. Playful, ends open on the 2nd. Kalimba at 0.5 s and at 64.0 s; **resolved** as C5 F5 A5 C6 at 70.0 s.
- **Question motif** (「启·动·按·钮·去·哪·了？」): F4 G4 A4 Bb4 C5 D5 E5, rising stepwise and hanging on the leading tone. Plucked at the 18.00 commit; the 「？」 is a glockenspiel E6 left unresolved over the F pad.
- **Answer motif** (「启·动·按·钮」): F4 G4 A4 F4 on fm_bell at the 40.90 commit. The question comes home.

**Sections.**

| Section | Time (s) | Bars | Instruments (audio/lib) | Notes |
|---|---|---|---|---|
| A · Home | 0.0–5.0 | 1–3 | `pad` F(add9), `kalimba` | intimate; **hard cut at 5.00** |
| — silence | 5.0–7.75 | | | fall_whistle and room tone only |
| peek sting | 7.75–8.75 | | `pluck` "boop", `boing` | G5–E5 "neener" at 8.50 |
| B · Reveal | 9.0–13.0 | 5–7 | `riser_tuned` F3→F5 → `glockenspiel` + `celesta` arpeggio, `pad` swell | riser peaks on the **12.0 downbeat** |
| C · Chase groove (light) | 13.0–16.0 | 7–8 | `marimba` staccato, `shaker`, `bass` | sneaky; thins at 15.0 |
| D · Question | 16.0–20.5 | 9–11 | `pluck` 8ths, soft `pad`, `glockenspiel` E6 | question run at 18.00; 「？」 at 18.50 |
| — silence | 20.5–22.5 | | | one `bass` "dun" at 21.00 |
| C · Chase groove (full) | 22.5–31.0 | 12–16 | `marimba` ostinato, `bass`, `kick`, `clap`, `woodblock`, `hat_closed` | 3-beat cycles; a stab chord on each click (23.0 / 24.5 / 26.0 / 27.5); a layer per miss; nav-rail `glockenspiel` F6 D6 Bb5 G5 on 29.5–30.5; cadence on 31.0 |
| C′ · Lab pass | 31.0–36.0 | 16–18 | lighter groove; `riser` 33.0→36.0 | |
| E · Map | 36.0–44.0 | 19–22 | `pad` Bbmaj7→F, `kalimba` arpeggios, `shaker` | half-time; answer motif 40.90 (`fm_bell`); success_chime 42.50 |
| — silence | 44.0–46.5 | | | heartbeat 43.50; press 2 at 44.00; the Sh03 fall_whistle again |
| F · Workshop | 46.5–55.0 | 24–28 | low `pad` drone (F2 + C3), `celesta`, `bass` staccato (51.0, 51.5) | projector bed; resolves to a held F maj9 at 53.50 |
| — near-silence | 55.0–57.0 | | `heartbeat` (soft), single `celesta` C6 at 56.00 | the breath |
| G · Return | 57.0–63.0 | 29–32 | `marimba` rising scale (one note per notch), `riser_tuned`, `kick` | **62.00 (bar 32) = tonic arrival** with snap_into_place |
| A′ · Home | 63.0–69.0 | 32–35 | `kalimba` play motif, `pad` → Bb/C sus | heartbeat at 67.50; nothing at 69.00 but the press |
| H · World | 69.3–74.0 | 35–37 | full theme: `marimba` + `glockenspiel` + `celesta` + `pad` + `bass` + soft drums | **downbeat 70.00**; resolved play motif |
| I · End card | 74.0–82.0 | 38–41 | the same theme thinning to `pad` + `celesta` | sparkle (down) on the logo pop at 74.20; cadence Bb → C → F; out by 81.5 |

**SFX cue sheet (toolkit names).**

| Time | SFX |
|---|---|
| 4.30 | hover_tick |
| 5.00 | **button_press** (press 1) |
| 5.15 | fall_whistle (G6→G4, 1.0 s) |
| 6.00 | bounce_tap (plastic, −24 dB, distant) |
| 8.00 | pop (cork) + boing (short) |
| 8.50 | swish + fall_whistle (0.5 s, higher) |
| 8.85 | whoosh (light, short), wind_whoosh begins |
| 10.40 | land (light) |
| 13.30–14.00 | squash, slide (card) |
| 15.00 | bounce_tap (soft) |
| 16.00 | ui_click |
| 16.40–17.90 | typing / key_click ×17 |
| 18.00, 18.50 | caret_tick; pluck on 「？」 |
| 20.50 | pop (bubble, low) |
| 23.00 / 24.50 / 26.00 / 27.50 | swish + ui_click, then card_flip ×3 / pop + boing (low) / whoosh (light, short) / download_zip + install_ticks + pop |
| 29.00–30.50 | bounce_tap ×4 |
| 31.00 | button_press; slide (card) for the inchworm |
| 32.20 | stretch |
| 33.00 | land + boing (short), button_press, whoosh (heavy, short) |
| 35.30 | map_rustle; slide (rough) |
| 37.20, 38.30, 38.80 | map_rustle; swish ×2 (zoom) |
| 39.20 | hover_tick |
| 39.50 | ui_click, card_flip |
| 40.00–40.90 | typing |
| 41.40 | squash |
| 42.00 | ui_click, **pin_drop** |
| 42.50 | **success_chime** |
| 43.50 | heartbeat (1) |
| 44.00 | **button_press** (press 2) + the Sh03 fall_whistle |
| 45.30 | whoosh (light) |
| 46.50 | sparkle (down) |
| 47.00 | land (soft), squash |
| 47.50 | projector_click (on); projector_hum bed to 57.0 |
| 48.50–50.00 | install_ticks (40 ticks, synced to 「正在生成模型」) |
| 51.00, 51.50 | thud (heavy) ×2; sub_drop (subtle) |
| 52.00, 52.50, 53.50 | ui_click ×3 |
| 53.50 | **hologram_shimmer** (F5 maj9) |
| 55.0–57.0 | heartbeat (soft, 2) |
| 58.00–61.00 | ratchet ticks ×10 (rim / woodblock up the scale); riser_tuned "return" |
| 62.00 | **snap_into_place** (C6), land (soft) |
| 66.00 | hover_tick |
| 67.50 | heartbeat ×2 |
| 69.00 | **button_press** (press 3, fuller) |
| 69.30 | **launch_impact** (soft), wind_whoosh |
| 74.20 | sparkle (down) |

**Mix.** Silences are real: no music bed in the four silent windows (5.0–7.75, 20.5–22.5, 44.0–46.5, 55.0–57.0 near-silent). Keep UI SFX small and dry (they are product sounds); give the hero's sounds the most character (boing, squash, whistle). Duck music −6 dB under every click. Loudness target −16 LUFS integrated, true peak ≤ −1 dBTP (the toolkit's analyzer already checks this).

---

## 7. Production notes

### 7.1 Scene modules and hand-off states

| Module | Shots | Frames | Enters with | Leaves with (hand-off) |
|---|---|---|---|---|
| **S1 HomeOpen** | Sh01–Sh06 | 0–585 | — | cam diving at the F1 socket (scale ≈ 30, pitch 20°, persp 900); F1 culled at f573; hero falling in the F1–F2 gap at z ≈ −300 under (983, 428); cursor billboard just below the socket |
| **S2 BuildingReveal** | Sh07 | 585–780 | S1 exit | cam 3/4 on F2 results (pitch 50°, yaw −15°, persp 1600, target (983, 431, −720)); hero UI form on F2 near (930, 440) leaning back; cursor at z ≈ −480 descending |
| **S3 Discover** | Sh08–Sh12 | 780–1710 | S2 exit | cam Real app on F2; hero UI form running left at ≈ (520, 560); cursor pointer dizzy at ≈ (980, 560); toast in, badge 「1」, card 2 「安装中……」 |
| **S4 StairsAndLab** | Sh13–Sh14 | 1710–2100 | S3 exit | cam diving after the hero into F4 (pitch 60°, persp 900); hero UI form at z −2100 above (1359, 641); cursor following |
| **S5 SeedMap** | Sh15–Sh18 | 2100–2730 | S4 exit | cam diving into the map hole at (983, 428); F4 culled; hero UI form falling in the F4–F5 gap; cursor diving |
| **S6 Workshop** | Sh19–Sh23 | 2730–3420 | S5 exit | tower wide (persp 3200, pitch 62°, yaw −22°); hero Voxel form, selected, at (983, 428, −2880); 层间距 tool not yet clicked; cursor beside the hero |
| **S7 Collapse** | Sh24 | 3420–3780 | S6 exit | Real app F1, exact Sh01 framing; hero UI form seated (spring settling); cursor arrow at ≈ (800, 520) |
| **S8 Finale** | Sh25–Sh29 | 3780–4440 | S7 exit | world shot dissolving to `#ebebeb` |
| **S9 EndCard** | Sh30 | 4440–4920 | `#ebebeb` | — |

Each module owns its sound cues (frame-stamped, from §6). The music is one continuous render on the 120 BPM grid; module boundaries do not cut it.

### 7.2 Shared components (build once, before the scene modules)

- **`<LaunchButton form state t sx sy tilt z shadow>`**: forms UI / Edge / Disc / Swatch / Pin / Voxel (§2.4) with morph parameter `t` between adjacent forms; states idle / hover / press; extruded sides; FloorShadow when lifted. **The PlayIcon is always the outline polygon `5 3 19 12 5 21 5 3`, stroke 2, never filled, and the label is 「开始游戏」.** The current `src/test/TechTest.tsx` prototype fills the triangle and labels the button 「启动」; both are wrong for the hero (bible rules 1 and 9).
- **`<Cursor kind billboard glassZ poke blur>`**: extend the existing sprite with billboard mode, floor shadow, click poke, motion blur on lunges.
- **`<AppWindow route shellMode panel pill breadcrumb>`**: title bar (traffic lights, logo, ←→, breadcrumb, 📰, running pill), nav rail with an **inchworm pill** helper, right panel (collapsed handle / forced-open filters), content well. `shellMode = overlay | onFloor` (overlay in top-down navigation, on-floor in wides).
- **Pages:** `HomeMinimal`, `Discover` (tabs, StyledInput with focus ring + IME composition underline + clear ✕, cards, skeletons, EmptyState, FloatingActionBar, NewModal with click-origin growth, NotificationToast with 4 px bar, filter sidebar), `LabIndex`, `SeedMap` (pre-rendered map art, stickers, popup, marker glyph, toast, zoom), `Workshop` (empty state, drop overlay, progress bar, dark stage + grid, glass overlays, inspector, status bar).
- **`<Building floors spacing=t cull>`**: the five floors with `z = −720 × k × t`, per-floor opacity/fog, LOD switching (below), and the culling rule (R7).
- **`<VoxelSlab>`**: textured faces from the atlas (`texture-atlas.png` crops with `image-rendering: pixelated`), layer-sweep reveal, selection overlay (24 % faces + 2 px edges + .65 box).
- **`<World>`** (Sh28–Sh29) and **`<EndCard>`**.
- **Helpers:** `imeType(frames, pinyin, commit)`, `inchworm(from, to, lead, trail)`, spring presets from §2.4, and the constants below.

### 7.3 Constants

```ts
export const WINDOW = {w: 1440, h: 810, scale: 4 / 3};
export const FLOOR_Z = {home: 0, discover: -720, lab: -1440, seedMap: -2160, workshop: -2880};
export const FLOOR_GAP = 720;               // world px
export const SOCKET = {x: 911, y: 404, w: 144, h: 48, cx: 983, cy: 428}; // window px, panel collapsed, 16:9
export const ELEV = {card: 4, control: 8, pink: 12, floating: 20, toast: 28, modal: 36, cursorGlass: 60};
export const BPM = 120;                     // 1 beat = 30 frames
export const G_FILM = 900;                  // world px / s^2
export const WORKSHOP_PERSP = 1160;         // ≈ FOV 50° at 1080 px tall
export const VOXEL = {cols: 30, rows: 10, layers: 2, block: 4.8,
  pink: [1872, 1904], white: [1552, 1872]}; // atlas crops, 16 px tiles
```

### 7.4 Hardest shots, and how to keep them feasible in CSS 3D

1. **Sh07 / Sh23 / Sh24, five full pages in one 3D scene.** Use **impostors**: render each floor's page once as a 2× PNG still (Remotion `<Still>` per floor) and use it as the floor's top face whenever the floor is small or far. Switch to live DOM only for the floor the camera is on. A floor is then a 6-layer Slab + one image: ~10 faces. Fog is a per-floor colour overlay (no CSS `filter: blur` on big planes; pre-blur the impostor if depth of field is wanted).
2. **Dives through holes (Sh06, Sh14, Sh18, Sh19).** CSS 3D has **no near-plane clipping**: a plane the eye crosses renders inverted or huge. Build every holed floor as four strips around the hole, and **remove the floor on the frame the hole fills the screen** (scale ≥ 13 for a 144 × 48 hole at 1920 wide).
3. **Text crispness under zoom (Sh10 ≈ 4×, Sh17 ≈ 3.2×, Sh24 panel ≈ 3.5×, Sh28 ≈ 120×).** Do not let the browser upscale rasterized layers. Avoid `will-change` on UI planes; for extreme close-ups render a dedicated 2D layout of that component at native screen resolution and cross-cut to it at the matching framing. Sh28 is pure 2D: the hero's face as SVG plus the masked world.
4. **Sh12, the four misses.** Many state machines in six seconds. Script each UI component's state on frame keys (the times in Sh12). Keep each UI response visible ≥ 12 frames before the next lunge. The modal must grow from the real click point (offset = (click − centre)/16, body `.97 → 1`, 200 → 350 ms film).
5. **Sh17, the pin morph.** Implement the pin as one SVG path family (rounded square → circle + tail) driven by `t`, with the white 2 px stroke appearing as the head shrinks below 24 px; cross-fade the 16 px ▷ out at the same moment. Draw the final pin exactly as the canvas code (§4.6), then hand it to the map layer.
6. **Sh20, the voxel build.** Do not build 600 cubes. Use one textured top face per layer (pre-composited from the two atlas crops, block grid included), four stepped side strips, and ~20 real cubes as falling accents (≈ 120 faces). Reveal layers with a `clip-path` sweep synced to 「正在生成模型 n / 40」.
7. **Sh24, voxel → UI during the collapse.** Two slabs in the same place: cross-fade the voxel slab out and the UI slab in between t = 0.4 and 0.2, while the stepped corners scale into r 16. The pink selection overlay fades out at t = 0.3.
8. **Sh28–Sh29, the world.** CSS 3D terraces with repeating textures (`grass_block_top` tinted `#91BD59`, `grass_block_side`, `dirt`, `cherry_log`, `cherry_leaves` untinted pink, `water_still` tinted), a block scale of 64 px, ≈ 130 faces total, sky gradient and a flat square sun. The world sits inside a **2D mask**, so it may use its own camera, or `@remotion/three` if the team prefers. This is the one place WebGL is allowed without matching another camera.
9. **Determinism.** Every animation is a pure function of the frame (the existing `track`, `springStep`, `hop` helpers). Typing, toasts and progress bars are keyed to frames, never timers.

### 7.5 Fidelity guards and declared deviations

**Guards (check every shot).** One pink `#db2777` (hover `#c5236b`, never lighter). White labels on pink. Radii by component (button h/3, cards 16, inputs 12, toasts and cart 20). Shell metrics 48 / 64 / 300 and the 56 px nav pitch. Chinese capped at weight 600. Real icons only, outline at stroke 2. No Modrinth or CurseForge marks; provider pills hidden on cards. Every string comes from §7.6. UI reactions at product timings (150 ms, tooltips 200 ms, page fades 120 / 180 ms), stretched at most ×2 for legibility and stated per shot.

**Declared film license (each one grounded in a real mechanic):**

| Deviation | Grounded in |
|---|---|
| The hero sinks past the 3 % press (presses 1 and 2) | the real `.97` press read as depth (R1) |
| The hero's landing counts as a click | the real press response of the control it lands on |
| The marker is pink because the hero sat in the colour square | markers take any colour; pink is legal (§4.6) |
| The workshop "opens" a falling button as a schematic | the drop overlay and parse / read / mesh pipeline are real; the payload is fiction |
| The ▷ in the voxel form is enlarged to 7 rows | below ~7 rows an outline triangle cannot read in blocks |
| 「层间距」 closes the launcher's floors | the control and its formula `Y += (y − floorY) × t` are real; its reach is the film's metaphor |
| Product timings stretched up to ×2 (inchworm, page fade, cart spring) | legibility at film scale |
| The final cut skips the busy state 「实例正在加载……」 | bible rule 15 allows a cut on the press frame |

**Data, not copy (plausible values, flagged):** download counts, card summaries, mod icon stand-ins, the result order, seed map art around `10292992`, the coordinates 「14, 1, 5」, the toast counter 「1 / 2」 (Litematica + its required dependency; the real toast title rule is `included.length === 1 → item.title`, `content-selection.ts` L1056).

### 7.6 Copy audit (every on-screen string → source)

| String | Source id / file |
|---|---|
| 开始游戏 | `button.play` (ui) |
| 没有运行中的实例 | `app.action-bar.no-instances-running` |
| 主页 · 发现内容 · 实验室 (nav / breadcrumb) | `app.navigation.*`, `app.home.breadcrumb` |
| 傍晚好，Mystic_Stars | `app.home.greeting.minimal.with-player` + `…minimal.evening` |
| 游玩于 2分钟前 | `app.instance.played` |
| 整合包 · 模组 · 资源包 · 数据包 · 地图 · 光影包 · 服务器 · 收藏夹 | `app.browse.project-type.*` |
| 翻译 · 所有来源 · 相关性 | `app.project.translation.translate`, `app.browse.source.all`, `browse.sort.relevance` |
| 搜索模组…… | `browse.search.placeholder` |
| 隐藏已安装内容 · 游戏版本由实例提供 · 加载器版本由实例提供 · 解锁筛选 | `label.hide-installed-content`, `search.filter.locked.instance-game-version.title`, `…instance-loader.title`, `search.filter.locked.default.unlock` |
| 钠 (Sodium) · 投影 (Litematica) · 模组菜单 (Mod Menu) | MC百科 dictionary `packages\app-lib\src\api\content_search\WikiEntries.txt` (L2785, L2261, L1675) |
| 安装 · 已选择 · 已安装 · 安装中…… | `button.install`, `app.browse.selected`, `label.installed`, `label.installing` |
| 正在加载结果…… | `browse.loading-results` |
| 这里还是空的 · 没有找到您的查询结果！ · 清除搜索 | `browse.no-results.heading`, `browse.no-results`, `browse.clear-search` |
| 1个已选择的项目 · 清除 · 安装 1 个内容 · 正在准备 0/1 | `browse.selected-projects-floating-bar.selected-count`, `button.clear`, `app.browse.install-selected`, `app.browse.preparing-selected` |
| 确认安装 · 已选内容 · 前置 · 1 个前置 · 必要前置 · 只会安装勾选的前置。 · 取消 · 安装 | `app.content-install.preview.*` |
| 请确认将在 Vanilla Perfected 中安装 1 个内容 和 1 个前置。 | `app.content-install.preview.batch-description` |
| 正在下载内容 | `app.install.phase.downloading_content` |
| 实验室 · 6 个工具 · 搜索工具 · 全部工具 · 全部 · 进入 | `app.lab.title`, `app.lab.tool-count`, `app.lab.search`, `app.lab.category.all`, `app.lab.favorite-filter.all`, `app.lab.enter` |
| Lab card titles, descriptions and tags (创作 / 世界) | `app.lab.*.title`, `app.lab.*.description`, `app.lab.category.*` |
| 种子地图 · Java 版 · 主世界 · 下界 · 末地 · 前往 · 地图图层 · 结构 · 矿物 · 从实例导入 · 复制地图链接 · 地表 (Y=128) | `app.lab.seed-map.*` (report 06 §3.11) |
| 1 像素 = 4 格 / 1 像素 = 1 格 | `app.lab.seed-map.map-scale` (format: `toFixed(2)`, trailing .00 dropped) |
| 加载中 · 群系高亮 · 选择群系 · 地形估算 · 显示网格 · 搜索附近 | report 06 §3.11 |
| 位置 · X 120, Z -64 · 标记名称 · 添加标记 · 复制 /tp · 标记已保存 | report 06 §3.6; `app.lab.seed-map.marker-name`, `…add-marker`, `…copy-teleport`, `…marker-saved` |
| 启动按钮 (marker label) | user data typed by the cursor (the product's own phrase, §3.6) |
| 编辑 Minecraft 投影 · 打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。 · 打开文件 · 从实例选择 | `app.lab.schematic-preview.empty.title`, report 06 §4.6, `…open-file`, `…from-instance` |
| 松开以打开投影 | `app.lab.schematic-preview.drop` |
| 正在解析投影 · 正在读取资源 · 正在生成模型 | `app.lab.schematic-preview.loading.*` |
| 单选 · 框选 · 测量 · 层间距 · 请选择另一对角 · 已选方块 · 已选 600 个 · 编辑 · 材料 | `app.lab.schematic-preview.selection.*`, `…layers.spacing`, `…selected-block`, report 06 §4.6 |
| 粉红色混凝土 · 白色混凝土 | `block-name-index.json` zh_cn (`block.minecraft.pink_concrete`, `…white_concrete`) |
| 你的下一个世界，从这里开始。 | website `site.ts` L178 |
| 美西螈启动器 | README L52 「Axolotl Launcher（美西螈启动器）」 |
| 非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。 | website `site.ts` L176 |

**Assets used.** `branding/axolotl.svg` (end card); instance icon `Fabric.png` (Home card, quick switcher); seed-map stickers `public/seed-map-assets/structures/*.webp` and `spawn_point.webp` (⚠ MinecraftSearch credit); block textures from `schematic-preview/assets/vanilla/texture-atlas.png` (⚠ Mojang; covered by the disclaimer); `no-documents.svg` (workshop empty state); the product's icon set via `<Icon>`. Never: `branding/logo.svg`, the Modrinth 3D icons, `loading/cube.png`, any real mod logo.
