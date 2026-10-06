# 《启动按钮去哪了？》 — FINAL STORYBOARD (build document)

Authoritative timeline for the film. It adopts `design/concept-product.md` ("Product Truth", the strongest concept) as the backbone and **overrides** it where noted. Where a shot below says "as concept ShNN", the concept's shot card (location, UI strings, button/cursor acting, sound) applies **with the timings given here**. Product facts: `research/PRODUCT_BIBLE.md`.

## 0. Key numbers

| | |
|---|---|
| Duration | **87.0 s = 5,220 frames @ 60 fps** (story 80.0 s + end card 7.0 s) |
| Frame | 1920 × 1080. App window = **1440 × 810 CSS px**, shown at **1.3333×** in every "real app" shot (fills the frame) |
| Theme | Light + pink `#db2777`. Home: right panel **collapsed** → hero at **x 911–1055, y 404–452, centre (983, 428)**. Discover: panel forced open (real). Other pages: collapsed |
| Grid | **120 BPM, 4/4, F major**: 1 beat = 30 frames, 1 bar = 120 frames (bar n starts at 2(n−1) s). Story hits sit on beats |
| Route | 主页 → 发现内容 → 实例 Vanilla Perfected → 实验室 → 种子地图 → 投影工坊 → (层间距) → 主页 → the world |
| Rule of three | Press 1 (5.0 s) sinks it · Press 2 (50.0 s) sinks it again · Press 3 (75.0 s) holds → the world |

**Changes vs the concept.** (1) In Discover the hero **stretches into the search field** — it becomes the field's 4 px pink focus ring with its ▷ sitting where the magnifier was — so the cursor types the title *into the button itself* (replaces "edge in the card gap"). (2) New **instance act**: the hero rides the download toast's pink progress bar into the nav rail's quick-instance circle (which turns pink — real active-instance behaviour), lands in the instance page, ignores its pink twin in the header (decoy), and hides as the new mod's **toggle** (「收拢」). The cursor's click turns the toggle off (real: the row goes grey) and squeezes the hero out. (3) The nav-rail "stairs" become two hops *up* from the quick-instance circle: 下载 → 实验室. (4) Everything after 28.5 s is retimed **+6.0 s** relative to the concept, preserving bar alignment. (5) End card trimmed to 7 s.

## 1. World, floors, camera (shared conventions — every module uses these)

- **World units = window CSS px.** Window point (wx, wy) on floor k ↔ world `(wx − 720, wy − 405, Zk)`. **z is up.**
- **Floors** (aligned stack, each a complete app window for its route, 6 px slab, corner r 18):

| Floor | Page | Z | Nav pill | Panel |
|---|---|---|---|---|
| F1 | 主页 Minimal Home | 0 | 主页 pink | collapsed |
| F2 | 发现内容 `/browse/mod` (target Vanilla Perfected) | −720 | 发现内容 pink | open (filters) |
| F3 | 实例 Vanilla Perfected · 内容 | −1440 | 实例库 **white** + quick-instance circle pink | collapsed |
| F4 | 实验室 | −2160 | 实验室 pink | collapsed |
| F5 | 种子地图 | −2880 | 实验室 pink | collapsed |
| F6 | 投影工坊 | −3600 | 实验室 pink | collapsed |

- **The shaft**: every vertical passage *through* a floor happens at window (983, 428): F1 socket, F5 map hole, F6 landing point. The 层间距 collapse (Sh26) stacks everything back onto the socket.
- **Real-app framing**: pitch 0, yaw 0, roll 0, **persp 1000, dist 750** (scale 1.3333) on the floor's centre. Zoom on window point p at screen scale s: target = world(p), dist = 1000 / s.
- **Diorama**: pitch 30–62°, yaw −10…−45°, persp 1600–3200. **Dive**: persp 700–900. **Workshop fit view**: persp 1160, pitch ≈ 60°, yaw ≈ −45°.
- **Dollhouse culling**: floors above the camera's target floor are not rendered in near-top-down shots; wides render all.
- **Elevations on a floor**: cards +4, controls +8, pink buttons +12, floating bars +20, toasts/popups/menus +28, modal +36. Cursor "glass" height +60.
- **Light**: from above-front-left; FloorShadow light offset (0.12, 0.32) per unit height.
- **Environment**: vertical gradient `#f2eef2` → `#d9d4dc` with depth fog toward lower floors.
- **Cursor rendering**: computed in world space, **drawn as a screen-space overlay** at its projected position (always crisp, always on top), 44 px on screen in real-app shots; in diorama shots it may scale ×(0.8–1.2) with depth and casts a FloorShadow on the floor below it. Kinds follow the UI under the hotspot (arrow / pointer / ibeam / grab / grabbing).
- **Realism bookends**: in Sh01–Sh02 and Sh27–Sh29 everything behaves exactly like the real app (no idle breathing, no cursor acting).

## 2. Characters

**The hero** (Minimal Home's 「开始游戏」; bible §3): identity core = pink `#db2777` + outline ▷ (never filled, never rotated within the face). It acts by leaning its whole body toward targets (±8°, the ▷ is its nose), flinches with the real hover darken `#c5236b`, trembles 1 px when frozen, squash/stretch per the axolotl-run constants (landing sx 1+0.2·i, sy 1−0.16·i, decay ≈220 ms; airborne sy 1+0.1·v). Forms: **UI** (144×48×8 slab) · **Ring** (stretched into the Discover search field's 4 px focus ring, ▷ at the field's icon slot) · **Disc** (48×48 circle, label hidden, ▷ +2 px) · **Toggle** (48×24 pink track, the ▷ standing in for the black knob) · **Swatch** (36×36 r8 square, 16 px ▷) · **Pin** (exact seed-map canvas marker + label 「启动按钮」) · **Voxel** (30×10×2 blocks of pink concrete with a white-concrete ▷ outline, footprint 144×48) — see concept §2.4 for Pin/Voxel specs.

**The cursor**: the player. Only pointer verbs (hover, click, right-click, type, drag). Arc: frantic → methodical → precise → gentle.

## 3. Scene table (modules)

| Module | Shots | Frames | Seconds | Location |
|---|---|---|---|---|
| **M1 Opening** | Sh01–Sh06 | 0–585 | 0.00–9.75 | F1 Home |
| **M2 Tower reveal** | Sh07 | 585–780 | 9.75–13.00 | all floors |
| **M3 Discover** | Sh08–Sh13 | 780–1830 | 13.00–30.50 | F2 (→ F3 shell) |
| **M4 Instance & Lab** | Sh14–Sh16 | 1830–2400 | 30.50–40.00 | F3 → F4 |
| **M5 Seed map** | (end of Sh16 dive) Sh17–Sh20 | 2400–3090 | 40.00–51.50 | F5 |
| **M6 Workshop** | Sh21–Sh25 | 3090–3780 | 51.50–63.00 | F6 (+ tower wide) |
| **M7 Return** | Sh26 | 3780–4140 | 63.00–69.00 | F6 → all → F1 |
| **M8 Finale** | Sh27–Sh31 | 4140–4800 | 69.00–80.00 | F1 → the world |
| **M9 End card** | Sh32 | 4800–5220 | 80.00–87.00 | end card |

## 4. Shot list (times in seconds; frames = s × 60)

### M1 · Opening — as concept Sh01–Sh06, same timings
- **Sh01 0.00–3.00** The real app, still (panel collapsed). Kalimba play motif at 0.5. Cursor enters bottom-right at 1.8.
- **Sh02 3.00–5.00** Cursor glides to the hero; 4.30 pointer + hover darken (150 ms).
- **Sh03 5.00–6.00** **Press 1**: real `.97` press — and it keeps sinking through its socket, falls to F2 (lands 5.95, seen small through the hole). Music cuts dead at 5.00.
- **Sh04 6.00–7.75** Silence. Dolly-zoom (persp 1000 → 600, dist re-solved) — the hole deepens. 7.20 the hero, far below, leans back: looking up. 6.90 cursor double-take jiggle.
- **Sh05 7.75–8.75** The peek: spring-jump up the shaft, pops back into the socket (8.00, overshoot 1.04→1), innocent hold, drops again at 8.50 at the cursor's twitch. "Neener" pizz G5–E5 at 8.50.
- **Sh06 8.75–9.75** Cursor wind-up then dives into the socket; camera follows (Dive mode), cull F1 at 9.55. Riser F3→F5 from 9.0.

### M2 · Tower reveal — as concept Sh07
- **Sh07 9.75–13.00** Out through the front of the stack, crane to the "bookshelf" wide (pitch 60°, yaw −22°, persp 3200): six real pages stacked, each visible under the one above, fog below; pink nav pills form a staircase down the left. Hero lands on F2's results at 10.40, looks up, runs at 11.0. Riser lands on the **12.0 downbeat** (glock/celesta arpeggio). 12.0–13.0 crane down to F2's results (pitch 50°, yaw −15°, persp 1600).

### M3 · Discover (F2)
Location as concept Sh08–Sh09 (results: 「钠 (Sodium)」 ✓已安装 · **「投影 (Litematica)」 ＋ 安装** · 「Fabric API」 ✓已安装 · 「模组菜单 (Mod Menu)」 ＋ 安装; neutral initial-tile icons; panel open with filters).
- **Sh08 13.00–15.00 · Through the cards, into the search box (OVERRIDE)** — Diorama (pitch 50°, yaw −15°, persp 1600) over the results. 13.10 / 13.40 / 13.70 the hero bounces across three card tops; each touched card plays its **real hover** (brightness .9, 150 ms) like a piano key (bounce_tap pitched up a triad). 13.85 it sees the cursor's shadow growing on the cards and leans back. 14.00–14.40 it darts up the page to the toolbar and hops into the search field; **14.40–14.90 it stretches along the field** (squash-stretch: elongate, thin) and wraps the field as a **4 px pink ring** (the focus ring `rgba(219,39,119,.68)` look, but drawn in the hero's solid pink at 68 % so it reads identical), its ▷ (20 px outline, white→ `#1a202c`? no: **pink ▷ on the white field**, 20 px, stroke 2) sliding into the icon slot at x 12, covering the magnifier. Cursor reaches glass height at 15.00. SFX: bounce_tap ×3 (C6 E6 G6), stretch (14.40, 0.5 s), tiny snap at 14.90. Music C sneaky.
- **Sh09 15.00–16.00 · Top-down Discover** — as concept Sh09 (pitch → 0 by 15.40; full window). The field shows a pink ring and a pink ▷ where the magnifier belongs. Cursor: two searching arcs, then heads for the field.
- **Sh10 16.00–19.50 · TITLE** — as concept Sh10, except the field is already "focused" (the ring is the hero): 16.00 click → caret; pinyin `qidonganniuqunale` 16.40–17.90; **commit 「启动按钮去哪了」 at 18.00**; 「？」 at 18.50; ✕ appears with the first commit. Push in to scale ≈ 4 on the field's left half. **Title frame 18.50–19.50: `[pink ▷] 启动按钮去哪了？ [✕]` inside the pink ring** — the answer is sitting in the question. Question motif at 18.00, glock E6 at 18.50.
- **Sh11 19.50–22.50 · 「这里还是空的」 (OVERRIDE)** — pull back to scale 1.6 on the results; loading skeletons (「正在加载结果……」), **20.50 empty state**: FolderSearch chip, 「这里还是空的」, 「没有找到您的查询结果！」, white 「清除搜索」. Silence; bass "dun" at 21.00. 21.30 the I-beam drifts left along the text toward the ▷; **21.60 the ring flinches** (darkens to `#c5236b` — the tell); 21.90 cursor double-take. **22.10 the ring snaps back** like a rubber band, contracting from both ends into the ▷; the field drops to unfocused (magnifier back, text 「启动按钮去哪了？」 remains); the hero pops out of the field (22.25, pop + boing) and arcs onto 「清除搜索」 (22.45).
- **Sh12 22.50–28.50 · Four misses** — as concept Sh12 (M1 click 23.00 on 「清除搜索」 → field clears, cards fade up; M2 24.50 「＋ 安装」 → green 「✓ 已选择」 + cart bar springs in; M3 26.00 「＋ 安装 1 个内容」 → 「确认安装」 modal grows from the click; M4 27.50 modal 「安装」 → modal closes, **download toast** (「投影 (Litematica)」 / 「正在下载内容」 「1 / 2」, 4 px pink progress bar) + pink badge 「1」 on nav 下载; card 2 → 「安装中……」). After M4 the hero lands back on the results at 28.00 and eyes the toast.

### M4 · Into the instance, through the Lab (NEW)
- **Sh13 28.50–30.50 · Riding the progress bar** — Real-app framing pushed to scale 1.5 on the top-right (toast) then panning left. 28.50 the hero hops onto the toast (pop), lands on its bottom edge and **rides the 4 px pink progress bar** as it fills (28.60–29.30: conveyor, the bar's leading edge pushes it; install_ticks under it). 29.30 at the bar's end it's flung (whoosh) in a long arc across the window toward the nav rail, **curling into the Disc** mid-air (29.40); **30.00 it lands on Vanilla Perfected's quick-instance circle** (Fabric icon, first quick slot) — the circle turns **pink** (it now *is* the pink disc: the real "you are in this instance" state), the 实例库 pill turns **white**, breadcrumb → `[Fabric icon] Vanilla Perfected › 内容`. **Navigation**: content plunge (30.00–30.50, R3: shell stays, Discover content fades out 120→200 ms film, camera dollies 720 down, instance content fades in 180→300 ms film). SFX: pop, install_ticks, whoosh (light), button_press (30.00). Music: groove turnaround, landing chord on 30.00.
- **Sh14 30.50–35.50 · The instance** — F3 instance page (bible §4.4; concept mock `research/_scratch/05-mock-instance-page.png`): header 64 px Fabric icon, 「Vanilla Perfected」 24/600, stats `[Box] 26.2 • [Fabric] Fabric 0.17.2`; right: **the twin pink 「▷ 开始游戏」 (≈126×48)** + white ⚙ disc + ⋮. NavTabs 「内容 · 文件 · 截图 · 世界 · 日志」 (内容 pink). Toolbar 「搜索到 87个项目……」 + pink 「浏览内容」 + 「查看依赖关系」 + 「刷新」. Chips 「全部 87 · 模组 79 · 资源包 5 · 光影包 2 · 投影 1」. Table header 「全部 · 可更新 · 已启用 · 已禁用」. Rows (74 tall): 「Sodium」 on · 「Lithium」 on · 「Iris Shaders」 off (grey) · 「Fabric API」 「前置」 on · **「Litematica」 (new; 「安装中……」 resolves to a toggle at 31.0) ** · `starter_house.litematic` (投影 row with ✎). Camera: real-app framing, slight diorama tilt (pitch 0 → 18°) for the hops, back to 0 by 33.0.
  - 30.50 the Disc pops out of the quick circle onto the table (the circle stays pink — they are in the instance now), uncurls to UI, looks around.
  - 31.00 the new row's toggle appears (real: install finished) — **31.10–31.60 the hero squeezes into it** (「收拢」): compresses to 48×24, becomes the pink track, its ▷ (12 px, white) takes the knob's place on the right. Every other toggle has a black knob.
  - 31.80 the cursor arrives (it clicked the quick circle too), sees **the pink 「开始游戏」 in the header** and rushes to it (32.00–32.60, pointer). Hover: the twin darkens normally (`#c5236b`) — **and does not flee**. 32.60–33.40 the cursor hovers, wiggles, waits: nothing. (A real button just sits there — that's how you tell.) Music: one long held note.
  - 33.50 down in the table, the ▷-knob wiggles (a snicker). 33.70 the cursor whips round. **34.00 click on the toggle** → the toggle turns **off** (real: track white with #ddd inset, knob gray, row → grayscale 50 %, 200 ms) — but the hero has already squirted out of the track's end (34.05, like soap) and bounces off the table edge toward the nav rail. Cursor droops (−3°).
  - 34.60–35.50 the hero runs left and leaps for the rail.
  SFX: squash (31.10), toggle_switch (off, 34.00), pop (cork, 34.05), bounce_tap; heartbeat-free. Music: sneaky groove (marimba + pizz), held note 32.60–33.40, stab on 34.00.
- **Sh15 35.50–37.00 · Up the rail** — Real-app framing pushed on the nav rail (scale ≈ 2.4). The hero, curled into the Disc, hops **up** the rail: **36.00 bonks 下载** (its badge 「1」 jiggles) · **36.50 lands hard on 实验室** → press `.97` → **navigation**: the pink pill inchworms from the instance state to 实验室 (leading 300 ms, trailing +240 ms), breadcrumb 「实验室」, content plunge to F4 (36.50–37.00). Cursor one step behind. SFX: glock F6 · A6 on the hops, bounce_tap, button_press 36.50, slide under the inchworm.
- **Sh16 37.00–41.00 · The Lab in passing** — as concept Sh14 retimed: Lab page (「实验室」 「6 个工具」, search 「搜索工具」, 「全部工具」 「全部」, the six cards with pink 「› 进入」). 37.30 the Disc uncurls; one long leap across the page (38.20–39.00) clearing 渐变文字生成器; **39.00 lands on 种子地图's 「› 进入」** → `.97` → navigation → the content gives way like a trapdoor (39.15) and it drops. Cursor clicks the same 进入 at 39.40 and dives; camera tips into a dive (pitch 60°, persp 900) down to F5 (39.50–41.00). Riser 39.0 → 42.0.

### M5 · Seed map (F5) — as concept Sh15–Sh18, **+6.0 s**
- **Sh17 41.00–43.00** Lands at the trapdoor point (41.30), skids into the cherry-grove patch (`#FF91C8`) around (983, 428), still by 42.30. **Music E downbeat 42.0.**
- **Sh18 43.00–45.50** Grab/drag pan, two cursor-anchored zooms (44.30, 44.80; badge 「1 像素 = 4 格」 → 「1 像素 = 1 格」); 45.20 the ▷ and 「开始游戏」 legible in the grove; cursor stops dead.
- **Sh19 45.50–49.50** Right-click → popup 「位置」/「X 120, Z -64」; types 「标记名称」 → pinyin → **commit 「启动按钮」 46.90** (answer motif); 47.40 the hero squeezes into the colour square (Swatch, pink); **48.00 click 「添加标记」** → Pin with label 「启动按钮」; **48.50 toast 「标记已保存」**; hold.
- **Sh20 49.50–51.50** Hover the pin, heartbeat at 49.50, **50.00 press 2** → uncurls and **sinks** through the map at (983, 428) (same sound/framing as Sh03); 51.00 droop, 51.30 cursor dives.

### M6 · Workshop (F6) — as concept Sh19–Sh23, **+6.0 s**
- **Sh21 51.50–53.50** Down the shaft into the 投影工坊 empty state; 52.50 drop overlay 「松开以打开投影」 (2 px dashed pink) lights; **53.00 lands inside it** ("released"); overlay clears 53.30.
- **Sh22 53.50–56.50** 「正在解析投影」 53.50 → 「正在读取资源」 54.00 → 「正在生成模型 n / 40」 54.50–56.00; the stage goes `#0a0a0a` with the grid; glass overlays settle; the hero is rebuilt as the **Voxel** form layer by layer (54.60–56.20). Projector click + hum.
- **Sh23 56.50–58.00** Too heavy: rocks and thuds (57.00), rolls one block (57.50). Cursor arrives (57.20).
- **Sh24 58.00–61.00** 「框选」 58.00 → corner 58.50 (「请选择另一对角」) → opposite corner **59.50** → pink selection (24 % faces + solid edges + .65 box), status 「已选 600 个」. Hologram shimmer; held F maj9.
- **Sh25 61.00–63.00** The look up: tower wide (persp 3200, pitch 62°, yaw −22°) — all six floors; the tiny pink box at the bottom; both characters tilt up; the cursor nods (62.40).

### M7 · Return — as concept Sh24, **+6.0 s**
- **Sh26 63.00–69.00** 63.00 click 「层间距」 → glass panel with the slider at 100 %; 63.50 grab; notches at **64.00, 64.50, 65.00, 65.50, 65.75, 66.00, 66.25, 66.50, 66.75, 67.00 (= 0 %)**. Each notch shrinks the floor spacing by 10 %; the floors converge **up** onto Home; camera cranes up with the stack to exactly the Sh01 framing by **68.00**; voxel steps dissolve into the smooth slab (from 40 %), selection pink dissolves (30 %); F2–F6 fold under Home over the last 20 %; **68.00 the hero seats in its socket from below** (snap_into_place, overshoot 1.04→1) — bar 35 downbeat, tonic.

### M8 · Finale — as concept Sh25–Sh29, **+6.0 s**
- **Sh27 69.00–72.50** Home again, pixel-identical to Sh01. Kalimba play motif. Cursor approaches slowly from lower left.
- **Sh28 72.50–75.00** Hover → pointer; hover darken; **it does not flee**; a 2° lean toward the cursor. Heartbeat ×2 at 73.50. Pad Bb/C suspension.
- **Sh29 75.00–75.30** **Press 3**: real `.97`, **holds** (4 held frames). button_press, then silence.
- **Sh30 75.30–78.50** Rush into the outline ▷ (centroid ≈ window (946, 428)); its interior is a window onto an **evening voxel world** (grass terraces, pond, cherry grove, low sun, blocky clouds, drifting petals); outline passes the frame edges at 75.80; glide low toward the cherry trees. launch_impact 75.30; **music H downbeat 76.00**: resolved play motif C5–F5–A5–C6.
- **Sh31 78.50–80.00** Ease to a stop facing the sun through blossoms (optional ≤0.6 s pink axolotl in the pond); 79.60–80.00 dissolve to `#ebebeb`.

### M9 · End card — concept §5.2 compressed to 7 s
- **Sh32 80.00–87.00**: 80.00–80.90 logo (`branding/axolotl.svg`, 235 px on screen) `scale .72 → 1.04 → 1`; 80.90–81.95 wordmark 「Axolotl」 (800) 「Launcher」 (700, `#484d54`) unrolls; 82.05 / 82.40 pink wipes; 82.20–83.20 lift; 83.20–83.80 tagline **「你的下一个世界，从这里开始。」** (32 px, CJK 600) + the 32×2 pink bar; 83.80 「美西螈启动器」 (18 px, `#484d54`); 84.00–84.40 disclaimer **「非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。」** (16 px, `#484d54` @80 %, bottom, 48 px from edge); hold; fade to ground over the last 0.5 s.

## 5. Hand-offs between modules (state at the cut)

| Cut (s / frame) | From → To | State |
|---|---|---|
| 9.75 / 585 | M1 → M2 | Camera in Dive mode inside the F1 socket shaft, pitch 20°, F1 culled; cursor billboard just below F1 plane at (983, 428) heading down; hero already on F2 near (983, 428), visible far below |
| 13.00 / 780 | M2 → M3 | Diorama pitch 50°, yaw −15°, persp 1600, target F2 results around window (700, 470); hero on card 1 top (≈ (620, 430)); cursor descending at ≈ +260 above F2 |
| 30.50 / 1830 | M3 → M4 | Navigation plunge finished: camera = real-app framing of F3 (flatCam(FLOOR_Z.instance)); F3 shell visible (breadcrumb `[Fabric icon] Vanilla Perfected › 内容`, 实例库 slider WHITE, quick-instance circle #1 PINK = the hero curled as the Disc sitting in it), **content well empty** (#ebebeb, between fade-out and fade-in); cursor (arrow) ≈ window (300, 160) on the F3 surface (z = floor) |
| 40.00 / 2400 | M4 → M5 | Dive camera (pitch 60°, persp 900) has just passed through F4's trapdoor at the 种子地图 「› 进入」 point (≈ window (1359, 641)); F4 culled from this frame; hero (UI) falling ≈ 360 above F5 near that point; cursor ≈ 250 above the hero |
| 51.50 / 3090 | M5 → M6 | Dive camera in the map hole shaft at (983, 428), F5 culled; hero (UI) falling ≈ 300 above F6; cursor ≈ 200 behind |
| 63.00 / 3780 | M6 → M7 | Tower wide (persp 3200, pitch 62°, yaw −22°); hero = Voxel inside the pink selection on F6 at (983, 428); cursor beside it at glass height |
| 69.00 / 4140 | M7 → M8 | Exactly the Sh01 framing; hero seated, idle; cursor (arrow) ≈ 180 px left of and 120 px below the hero |
| 80.00 / 4800 | M8 → M9 | Dissolve to `#ebebeb` complete |

## 6. Music map (120 BPM, F major; 30 frames per beat)

| Section | Seconds | Notes |
|---|---|---|
| A Home | 0.0–5.0 | pad F(add9) + kalimba play motif C5 F5 A5 G5 at 0.5; **hard cut 5.00** |
| silence | 5.0–7.75 | fall_whistle, room tone |
| sting | 7.75–8.75 | pop/boing 8.00; pizz "neener" G5–E5 at 8.50 |
| B Reveal | 9.0–13.0 | riser F3→F5 → **12.0 downbeat** glock + celesta arpeggio + pad swell |
| C sneaky | 13.0–16.0 | staccato marimba, shaker, bass; bounce triad 13.1/13.4/13.7 |
| D Question | 16.0–20.5 | pizz 8ths, soft pad; question motif F4 G4 A4 Bb4 C5 D5 E5 from 18.00; glock E6 at 18.50 hangs |
| silence | 20.5–22.5 | bass "dun" 21.00 |
| C full | 22.5–30.0 | marimba ostinato, bass, kick, clap, woodblock, hats; stab chords on clicks 23.0 / 24.5 / 26.0 / 27.5; turnaround into 30.0 landing chord |
| C′ instance | 30.0–37.0 | thinner: marimba + pizz + shaker; long held note 32.6–33.4; stab 34.0; glock F6/A6 at 36.0/36.5; cadence 36.5 |
| C″ Lab | 37.0–42.0 | light groove; riser 39.0→42.0 |
| E Map | 42.0–50.0 | half-time; pad Bbmaj7→F, kalimba arps, shaker; answer motif F4 G4 A4 F4 (fm_bell) 46.90; success_chime 48.50 |
| silence | 50.0–52.5 | heartbeat 49.50, press 2 at 50.00, fall_whistle |
| F Workshop | 52.5–61.0 | low pad drone F2+C3, celesta, staccato bass 57.0/57.5; held F maj9 at 59.50 |
| near-silence | 61.0–63.0 | soft heartbeat, celesta C6 at 62.00 |
| G Return | 63.0–69.0 | marimba climbs one note per notch F4…A5; riser; kick on downbeats; **68.00 tonic** + snap_into_place |
| A′ Home | 69.0–75.0 | kalimba play motif, pad → Bb/C sus; heartbeat 73.50; nothing at 75.00 but the press |
| H World | 75.3–80.0 | **downbeat 76.00** full theme: marimba + glock + celesta + pad + bass + soft drums, resolved motif C5 F5 A5 C6 |
| I End card | 80.0–87.0 | theme thinning to pad + celesta; sparkle 80.20; cadence Bb → C → F; out by 86.5 |

## 7. SFX cue list (seconds → toolkit name)

4.30 hover_tick · 5.00 button_press · 5.15 fall_whistle(G6→G4,1.0) · 6.00 bounce_tap(−24 dB) · 8.00 pop(cork)+boing(short) · 8.50 swish + fall_whistle(0.5, higher) · 8.85 whoosh(light,short) + wind_whoosh · 10.40 land(light) · 13.10/13.40/13.70 bounce_tap(C6/E6/G6) · 14.40 stretch(0.5) · 14.90 snap(tiny) · 16.00 ui_click · 16.40–17.90 typing(17 keys) · 18.00 caret_tick · 18.50 pluck · 20.50 pop(bubble,low) · 21.60 squash(tiny) · 22.10 stretch(reverse/short) · 22.25 pop(cork)+boing(short) · 22.45 bounce_tap · 22.90 swish · 23.00 ui_click + card_flip×3 · 23.75 bounce_tap · 24.40 swish · 24.50 ui_click + pop + boing(low) · 25.25 bounce_tap · 25.90 swish · 26.00 ui_click · 26.20 whoosh(light,short) · 26.75 bounce_tap · 27.40 swish · 27.50 ui_click · 27.70 download_zip · 27.90 pop · 28.00 land(light) · 28.50 pop · 28.60–29.30 install_ticks · 29.30 whoosh(light) · 30.00 button_press + land · 30.20 slide(card) · 30.60 bounce_tap · 31.10 squash · 31.60 snap(tiny) · 32.00 swish · 32.30 hover_tick · 33.50 squeak(boing high, quiet) · 33.70 swish · 34.00 ui_click + toggle_switch(off) · 34.05 pop(cork) · 34.30 bounce_tap · 35.20 stretch(short) · 36.00 bounce_tap + glock · 36.50 button_press + slide(card) · 38.20 stretch · 39.00 land + boing(short) + button_press · 39.15 whoosh(heavy,short) · 39.40 ui_click · 41.30 map_rustle · 41.50 slide(rough) · 43.20 map_rustle · 44.30/44.80 swish(low) · 45.20 hover_tick · 45.50 ui_click(right) + card_flip · 46.00–46.90 typing · 47.40 squash · 48.00 ui_click + pin_drop · 48.50 success_chime · 49.50 heartbeat(1) · 50.00 button_press · 50.15 fall_whistle(G6→G4,1.0) · 51.30 whoosh(light) · 52.50 sparkle(down) · 53.00 land(soft) + squash · 53.50 projector_click(on) · 53.50–61.00 projector_hum (bed) · 54.50–56.00 install_ticks · 54.60/55.40 bounce_tap(wood, muted) · 57.00 thud(heavy) · 57.50 thud · 58.00/58.50/59.50 ui_click · 59.50 hologram_shimmer · 61.50 heartbeat(soft,2) · 63.00 ui_click · 63.50 grab tick · notches (64.00…67.00) rim/woodblock pitched up the scale · 63.00–68.00 riser_tuned(F3→F5,"return") · 68.00 snap_into_place(C6) + land(soft) · 73.50 heartbeat(2) · 75.00 button_press (fuller) · 75.30 launch_impact · 75.40 wind_whoosh · 76–80 wind + leaves (soft) · 80.20 sparkle(down) · 82.05/82.40 swish(tiny).

## 8. Production breakdown

**Shared (exists):** `src/lib/anim.ts` (tracks, easing, springs, hop, squash), `src/stage/Stage.tsx` (Stage/Cam, Obj, Plane, Slab, FloorShadow, `project()`), `src/stage/Voxel.tsx`, `src/characters/LaunchButton.tsx` (ButtonFace, Hero, PlayGlyph), `src/characters/Cursor.tsx`, `src/ui/kit.tsx`, `src/ui/shell/AppWindow.tsx`, `src/ui/pages/MinimalHome.tsx`, `src/theme/tokens.ts`, `src/film/*` (timeline, Floor, CursorOverlay, cameras).

**Modules** (each a file under `src/scenes/`, local frame 0 = module start; uses `src/film/timeline.ts` constants):
1. M1 Opening + M8 Finale + M9 End card + World (`src/world/World.tsx`) — one engineer (same Home stage, bookends).
2. M3 Discover — page `src/ui/pages/Discover.tsx` + scene.
3. M4 Instance & Lab — pages `src/ui/pages/InstancePage.tsx`, `src/ui/pages/LabPage.tsx` + scene.
4. M5 Seed map — page `src/ui/pages/SeedMap.tsx` (+ generated biome canvas image) + scene.
5. M6 Workshop + M7 Return — page `src/ui/pages/Workshop.tsx` + scenes.
6. M2 Tower reveal + Sh25/Sh26 tower framing — needs all pages; built after 2–5 land.
7. Audio — `audio/score.py` + `audio/mix.py` from §6–§7 → `public/audio/soundtrack.wav`.

**Risk notes:** floor holes via clip-path on flat leaves only; never put opacity/filter/overflow on preserve-3d containers; keep visible voxel faces < ~1,500; the tower shots render six windows — keep page DOM lean (no hidden off-screen content).
