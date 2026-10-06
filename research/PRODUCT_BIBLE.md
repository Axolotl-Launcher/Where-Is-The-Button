# PRODUCT BIBLE · 《启动按钮去哪了？》 × Axolotl Launcher（美西螈启动器）

Single source of truth for the film's art direction and product fidelity. It condenses the seven area reports and settles every conflict between them by reading the source again.

- **Product source (read-only):** `E:\GitHub\Axolotl-animation\upstream\Axolotl`. App version **1.9.7**, HEAD `2b5c22d` (2026-10-05). Desktop app = Tauri 2 + Vue 3 (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend`); shared UI = `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui`; tokens, icons and branding = `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets`; website = `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website`.
- **Area reports (exhaustive detail lives there):** `E:\GitHub\Axolotl-animation\research\01-design-tokens.md` · `02-brand-assets.md` · `03-shell-home-launch.md` · `04-browse-search-project.md` · `05-library-instance.md` · `06-lab-seedmap-schematic.md` · `07-website-motion-misc.md`.
- **Reference screenshots:** `E:\GitHub\Axolotl-animation\research\ref\` (`launcher-home.png`, `axolotl-lab.png`, `theme-accent.png`, `account-login.png`, plus `cover-schematic.png`, `cover-seedmap.png`, `logo256.png`, `superball.png`, `axolotl-run.png`).
- **Film project (Remotion):** `E:\GitHub\Axolotl-animation` with fonts in `E:\GitHub\Axolotl-animation\public\fonts`, icon SVGs copied in `E:\GitHub\Axolotl-animation\src\assets\icons` and generated as `E:\GitHub\Axolotl-animation\src\ui\icons.generated.ts`.

**Conventions.** All sizes are CSS px at 1× with `1rem = 16px`. All colours are sRGB hex. The **primary look is the LIGHT theme with the default pink accent** (`html.light-mode.accent-pink`); dark values are given beside it. Tailwind v3 defaults apply (preflight is off, but `* { box-sizing: border-box }` is set globally in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\defaults.scss` L4–6, so borders are inside the stated heights).

**Evidence marks.** ✔ = re-verified by the editor in source (file:line given). ◇ = computed or inferred from code (not seen running). ▣ = measured on a reference screenshot. ✎ = recommendation for the film; not a product fact.

---

## 0. Read me first

### 0.1 The facts that must never be wrong

| # | Fact | Value |
|---|---|---|
| 1 | Label on the launch button | **「开始游戏」** (`button.play`) ✔. 「启动」 is **not** the button's label; it appears only as a tooltip, server button, in-flight state and menu item (§3.6). |
| 2 | Brand pink | **`#db2777`** (light) / `#f472b6` (dark) ✔. Hover `#c5236b` ◇. Label on pink: **white** (light) / **black** (dark) ✔. |
| 3 | Hero geometry | **144 × 48**, radius **16**, padding-x 14, gap 8, label **16 px / 800**, **24 px outline play triangle** shifted +1 px ✔. |
| 4 | Shell | Title bar **48** `#f8f8f8` · nav rail **64** `#f8f8f8` · content well `#ebebeb` with **20 px top-left radius**, inner shadow and 1 px `#dddddd` stroke · right panel **300** with a pink wash ✔. |
| 5 | Surfaces and text | `#ebebeb` · `#f5f5f5` · `#f8f8f8` · `#ffffff` · `#dddddd`; text `#1a202c` · `#2c2e31` · `#484d54` ✔. Chrome is *lighter* than the page. |
| 6 | Fonts | **Inter 3.19** (Latin + digits) ✔ + system CJK (PingFang SC in the refs). The film uses Inter v3.019 + Noto Sans SC as the PingFang stand-in ✔ (files in `E:\GitHub\Axolotl-animation\public\fonts`). |
| 7 | Nav order (v1.9.7) | 主页 · 截图中心 · 发现内容 · 皮肤选择器 · 多人游戏 · 实例库 · 实验室 · 下载 │ quick instances │ 创建新实例 · 设置 ✔ |
| 8 | Discover search | 48 px white field, radius 12, magnifier at x = 12, placeholder **「搜索模组……」** (Chinese 6-dot ellipsis) ✔ |
| 9 | Seed-map marker | Canvas teardrop pin: head circle r = 7 centred 3 px above the point, tail tip 11 px below, **2 px white stroke**, fill = user colour (default `#22C55E`; **pink is a legitimate choice**) ✔ |
| 10 | 投影工坊 viewer | **`#0a0a0a`** WebGL stage, pixelated real block models, grid `#404040` / `#6b6b6b`, selection = **brand pink at 24 % fill + solid pink edges** ✔ |
| 11 | Brand marks | Only the **voxel pink axolotl** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.svg`). **Never** `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\logo.svg` (Modrinth) ✔ |

### 0.2 Version and era map

| Source | Version / era | What it shows | Use it for |
|---|---|---|---|
| Code (truth) | **1.9.7** | Everything in this bible unless marked otherwise | All screens |
| `research\ref\launcher-home.png` (= website hero) | Pre-widget Home, commit `f12c3a85` (2026-07-29/31) | Home with row cards and **white** 「▷ 开始游戏」 112 × 36 buttons; nav without 截图中心; a "→" sidebar button in the title bar | Colour and type calibration; "as on the website" shots only |
| `research\ref\axolotl-lab.png`, `theme-accent.png`, `account-login.png` | **1.6.0** (footer reads "Axolotl Launcher 1.6.0 / macOS 26.3.0") | Lab as a 3-column grid of 3 tools; Settings as a modal with 12 colour dots | Calibration only; these layouts no longer exist |

✎ **Rule:** stage every screen in the **1.9.7** era. Do not mix era features in one shot (for example, if the nav rail shows 截图中心, the Home must be the widget dashboard or Minimal Home, not the pre-widget rows).

**Screenshot calibration ▣.** `launcher-home.png` is 2560 × 1489 at **≈1.645 image px per CSS px**: the nav rail spans image x 92 → 197 = 105 px = 64 CSS px. The captured window is therefore **≈1440 × 792 CSS px**. Report 05's note that it is "a 2× capture of 1280 logical px" is wrong. The 1600 × 936 refs are ≈1 px per CSS px and are Display-P3-encoded with the ICC profile stripped, so brand pink reads `#c93b76` there; it is sRGB `#db2777`.

### 0.3 Verification log (conflicts and critical facts, re-checked in source)

| Topic | Verified value | Evidence | Resolves |
|---|---|---|---|
| Hero button | `<Button type="colored" color="brand" size="xl" class="w-36 justify-center">` + `<PlayIcon class="translate-x-px">` + `<span class="truncate">开始游戏</span>` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeMinimal.vue` L273–282 | Protagonist choice |
| xl size | `h-12 gap-2 rounded-2xl px-3.5 text-base font-extrabold leading-5 [&>svg]:size-6` → 48 / 8 / 16 / 14 / 16 px / 800 / lh 20 / 24 px icon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\ButtonFrame.vue` L38 | — |
| Border box | 1 px transparent border counts inside the 48 px (global `* { box-sizing: border-box }`) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\defaults.scss` L4–6 | Confirms 48 px overall (not 50) |
| Coloured paint | ring `0 0 0 1px color-mix(button 30 %)` + `0 2px 4px / 0 5px 8px rgba(0,0,0,.04)` + `0 10px 18px / 0 24px 48px rgba(0,0,0,.03)`; `::before` 1 px rim `linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0))` | `ButtonFrame.vue` L180–202 | — |
| Interactions | 150 ms `ease-out` on bg/colour/shadow/filter/opacity/transform; press `scale(.97)`; hover `brightness(var(--hover-brightness))`; focus `ring-4 ring-brand-shadow`; disabled `opacity .5` | `ButtonFrame.vue` L21–28 | — |
| Home states | running → coloured **red** 「停止」 + StopCircle; busy → **base (white)**, disabled, Spinner + 「实例正在加载……」/「安装中……」; installed → pink 「开始游戏」; else pink 「安装」 + Download (disabled offline) | `HomeMinimal.vue` L255–295 | — |
| Instance-page states | installing → pink disabled 「安装中……」 (no icon); broken → pink 「修复」 + Download; running → red 「停止」/「正在停止……」; idle → pink 「开始游戏」; launching → pink disabled Spinner + 「正在启动…… {n} 秒」; server instance → ButtonGroup + dropdown 「加入服务器」/「启动实例」 | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Index.vue` L130–219 | — |
| Label strings | `button.play` 开始游戏 (ui); `app.home.calendar.play` 启动; `app.instance.starting` 正在启动…… {seconds, number} 秒; `app.servers.action.start` 启动; `console.empty.server-description` 点击启动按钮即可启动服务器！ | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json`; `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\utils\common-messages.ts` L230 | "启动 vs 开始游戏" |
| Light tokens | surfaces `#ebebeb #ededed #f5f5f5 #eef1f5 #f8f8f8 #ffffff #dddddd`; text `#1a202c #2c2e31 #484d54`; `--color-pink` = pink-600 `#db2777`; accent-contrast `#ffffff`; hover-brightness .9 | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\variables.scss` L2–8, 81, 86, 101–103, 119, 274 | — |
| Dark tokens | surfaces `#101215 #15181c #1a1e24 #20242b #262b34 #333a46 #424854`; text `#ffffff #b0bac5 #96a2b0`; pink-400 `#f472b6`; accent-contrast **`#000000`**; selected pill = 25 % tint; hover 1.25 | `variables.scss` L326–332, 410, 425–427, 443, 551–552, 578 | — |
| Accent cascade | base palette sets brand = **green** (Modrinth leftover); `.accent-pink { --color-brand: var(--color-pink) }` and `:is(.accent-*)` gradients override it | `variables.scss` L212, 610–638, 683–685 | Recreating CSS: define pink explicitly |
| Fonts | `@font-face inter` 400/500/600/700/800 from `cdn-raw.modrinth.com/fonts/inter/Inter-*.woff2?v=3.19`; stack `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, …, sans-serif`; body 16 px / 400 | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\inter.scss`; `defaults.scss` L12–18 | — |
| Film fonts | `E:\GitHub\Axolotl-animation\public\fonts\Inter-*.woff2` are **Inter Version 3.019** ✔ (fontTools); `NotoSansSC-subset.woff2` is Noto Sans SC 2.004 variable (subset: GB2312 + punctuation per `fonts.ts`) and covers every CJK / full-width character used in this bible (checked with fontTools) ✔ | `E:\GitHub\Axolotl-animation\public\fonts\` | Inter 3.19 vs 4.x worry |
| Nav order | Home, Images, [World, flag], Compass, ChangeSkin, Users, Library, FlaskConical, Download │ divider + QuickInstanceSwitcher │ Plus, Settings | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\App.vue` L2924–3041 | Reports 02/03 agree |
| Nav pill | one slider behind the active item; active button bg forced transparent; `top/bottom 150ms cubic-bezier(.4,0,.2,1)`, trailing edge delayed **120 ms** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavRail.vue` L37, 63–64, 97–115 | — |
| Tab pill | same mechanism, trailing delay **200 ms** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\NavTabs.vue` L254–260, 442–448 | — |
| Search field | `StyledInput :icon="SearchIcon" clearable input-class="h-12"`, placeholder `搜索{projectType}……` → 搜索模组…… | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\browse-tab\layout.vue` L43–47, 175–189; `StyledInput.vue` L12–91 | — |
| Project card | list card `p-4 grid gap-x-3 gap-y-2`, `rounded-2xl bg-surface-3 border-surface-4`, icon 100 px, title `text-xl font-semibold leading-none`, provider pill `bg-surface-5 text-xs font-semibold` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\project\card\ProjectCard.vue` L197–241, 377–378, 458–490; `ProjectCardTitle.vue` | — |
| Marker | `arc(x, y-3, 7)`, tail `(x-4,y+2)→(x,y+11)→(x+4,y+2)`, fill `marker.color`, stroke `#FFFFFF` 2 px; label `600 11px system-ui` on `rgba(20,22,26,.86)` 22 px tall at `(x+10, y-12)` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\LabSeedMap.vue` L1349–1382; default colour `lab\seed-map\workspace.ts` L294 | — |
| Workshop | clear `#0a0a0a`, ACES tone mapping, exposure 1.5, ambient .8 + hemisphere `#87ceeb/#444444` .6 + key `#fffbf0` 4.0 + fill .3; FOV 50; camera at centre + (m, .8 m, m); grid `#404040`/`#6b6b6b`; region `#58736a`; selection = `--color-brand` .24 + edges + .65 box | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\schematic-preview\scene.ts` L53, 125–139, 203, 375, 430–484, 661–666, 755–760 | — |
| Toggle ON knob | **black** `bg-black/90` on pink track (not white) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Toggle.vue` L8–30 | — |
| Minimal Home icon | class `size-20` (80 px) loses to Avatar's scoped `.avatar[data-v]` rule with inline `--_size: 2rem`, so it renders **32 × 32** ◇ | `HomeMinimal.vue` L225–230; `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\InstanceIcon.vue`; `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Avatar.vue` (scoped `.avatar`) | Report 03 vs others (80 px) |
| Seed-map layer toggles | every structure/ore toggle is `type="colored"`; an undefined colour still resolves to brand, so **on and off both render pink** (only `aria-pressed` differs) | `LabSeedMap.vue` L2561–2616 + `ButtonFrame.vue` L151–153 | Report 06 suspicion confirmed |
| Defaults | fresh install: theme **dark**, accent **pink**, home layout `standard` (信息主页) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\store\theme.ts` L183–184, 203 | Film uses light + pink by choice |
| Website pink | website overrides pink to `#c72f6c` (light) / `#ff82b2` (dark) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\layouts\default.vue` L32, 52 | Never use for the app UI |

---

## 1. Product essence

**What it is.** Axolotl Launcher（美西螈启动器, also "AXL Launcher"） is a free, open-source (GPL-3.0), ad-free, cross-platform (Windows / macOS / Linux) desktop launcher for **Minecraft: Java Edition**. It is built with Tauri 2 + Rust + Vue 3 by **Garbage Human Studio** (developer **Mystic Stars**). It is an extended, rebranded fork of the Modrinth App: the code is credited, Modrinth branding is excluded (`E:\GitHub\Axolotl-animation\upstream\Axolotl\COPYING.md`). Current release **1.9.7** (2026-09-30).

**What it does (features that can be stages).**
- **主页**: 信息主页 (widget dashboard: greeting, calendar heat-map, recent, pinned worlds/servers/instances) or 极简主页 (one card with one big pink 「开始游戏」).
- **发现内容**: one search over Modrinth + CurseForge for 整合包 / 模组 / 资源包 / 数据包 / 地图 / 光影包 / 服务器 / 收藏夹. Chinese search via a bundled MC百科 dictionary (typing 「钠」 finds 「钠 (Sodium)」), bilingual titles, one-click translation, a cart-style install with dependency resolution, download toasts.
- **实例库 + 实例页**: instances with groups, import from PCL2/HMCL etc., backups, cross-instance sync. Per instance: 内容 / 文件 / 截图 / 世界 / 日志, a big pink 「开始游戏」, world quick-join.
- **实验室**: six local tools: 皮肤编辑器 · 渐变文字生成器 · **种子地图** (native cubiomes renderer, markers) · **投影工坊** (3D .litematic/.schem viewer-editor) · 模组翻译 · 配方生成器.
- Also 截图中心, 皮肤选择器 (3D player), 多人游戏 (local servers; 陶瓦联机 / 红石联机 rooms), 下载 centre, accounts (Microsoft / offline / Yggdrasil-LittleSkin), deep theming (light / dark / OLED, five accents + custom, background image, transparency).

**Personality.**
- **Look:** quiet, flat, light-grey chrome; separation by hairline strokes, not heavy shadows. One expressive colour, the brand pink, marks everything "selected / primary / alive". Mascot: a flat-shaded voxel pink axolotl.
- **Voice:** warm, short, second person, Minecraft vocabulary, lightly self-aware: 「没有东西会失踪」, 「我坚持不替你按确认。」, 「这才是值得掉进去的坑。」, 「下一个项目只差一次启动。」
- **Motion:** crisp UI reactions (150 ms ease-out, press 0.97). Pills "inchworm" between targets. Small springy overshoots. Long expo-out curves for brand moments.
- **Taglines:** 「你的最后一款启动器。」 (About) · 「次世代 Minecraft 桌面客户端，全能、美观、全平台覆盖。」 (README) · 「你的下一个世界，从这里开始。」 (website, unused copy).

---

## 2. Visual system

### 2.1 Palette

**Core tokens** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\variables.scss`; flattened values ◇ computed from `color-mix`).

| Token | Role in the UI | LIGHT + pink (primary) | DARK + pink |
|---|---|---|---|
| `--surface-1` = `--color-bg` | Content well / page floor; Browse sticky toolbar; onboarding bg | **`#ebebeb`** | `#101215` |
| `--surface-1-5` | Odd table rows | `#ededed` | `#15181c` |
| `--surface-2` | Library standard card, list rows, even table rows, log viewport, workshop inspector, seed-map toolbar | `#f5f5f5` | `#1a1e24` |
| `--surface-2-5` | Selected table row (slightly blue) | `#eef1f5` | `#20242b` |
| `--surface-3` | **Chrome** (title bar, nav rail), `.card`, home widgets, modals, menus, tooltips, NavTabs capsule, toasts, cart bar | **`#f8f8f8`** | `#262b34` |
| `--surface-4` | Base buttons, inputs, combobox, tags, toggle-off track, avatar fill; **the 1 px stroke of cards** | **`#ffffff`** | `#333a46` |
| `--surface-5` = `--color-divider` | Strong strokes: button inset ring, modal/menu/tooltip borders, dividers, provider pill fill | **`#dddddd`** | `#424854` |
| `--color-text-primary` | Titles, names, base-button labels | **`#1a202c`** | `#ffffff` |
| `--color-text-default` | Body text, nav icons, base-button icons | **`#2c2e31`** | `#b0bac5` |
| `--color-text-tertiary` | Meta, descriptions, placeholders (placeholders at 60 % opacity) | **`#484d54`** | `#96a2b0` |
| `--color-brand` | Primary buttons, active pills, toggles on, progress, focus | **`#db2777`** | `#f472b6` |
| `--color-accent-contrast` | Label and icon on any coloured button | **`#ffffff`** | **`#000000`** |
| Brand hover ◇ | `brightness(.9)` light / `1.25` dark | **`#c5236b`** (white label → `#e6e6e6`) | `#ff8ee4` |
| `--color-brand-highlight` (25 %) | Selected chips/options, progress tracks, Lab fallback tiles | `rgba(219,39,119,.25)` → `#f6c9dd` on `#fff`, `#f1c4d8` on `#f8f8f8`, `#eec2d6` on `#f5f5f5`, `#e7bace` on `#ebebeb` ◇ | `rgba(244,114,182,.25)` → `#5a3d54` on `#262b34` |
| `--color-brand-shadow` (68 %) | **4 px focus ring** | `rgba(219,39,119,.68)` | `rgba(244,114,182,.68)` |
| Coloured-button hairline (30 %) | 1 px ring around pink buttons | `rgba(219,39,119,.30)` → `#efb9d1` on `#f8f8f8` ◇ | `rgba(244,114,182,.30)` |
| `--color-button-bg-selected` | Nav pill, NavTabs slider | **solid `#db2777`, white icon/label** | 25 % tint, **pink** icon/label |
| `--brand-gradient-bg` (right panel, 0deg = bottom→top) | 14 % → 9 % brand over `#ebebeb` | bottom **`#e9d0db`** → top **`#ead9e1`** ◇ (▣ `#dbc0ce` → `#ebd9e2`) | `#301f2c` → `#251b23` |
| `--brand-gradient-border` (16 %) | Panel left edge and section dividers | `rgba(219,39,119,.16)` ≈ `#e8ccd8` | `rgba(244,114,182,.16)` |
| `--brand-gradient-button` | Control fills inside the panel | `rgba(255,255,255,.5)` | `rgba(255,255,255,.08)` |
| `--loading-bar-gradient` | 2 px route loading bar | `#db2777 → #e76ca3` ◇ | `#f472b6 → #f89fcd` |
| Calendar heat L1 / L2 / L3 / L4 | Home calendar (oklab mix with white) | `#fdc9d7` / `#f7a2bb` / `#ee769e` / `#db2777` (▣ pixel-matched) | `#674b63` / `#8d5779` / `#b86393` / `#f472b6` |
| Disabled coloured button | `opacity .5` on the whole element | ≈ `#ea90b8` on `#f8f8f8` ◇ | — |
| Modal scrim | gradient + `backdrop-filter: blur(5px)` | `rgba(28,5,15,.536)` → `rgba(3,1,2,.945)` ◇ | similar |
| `--color-tooltip-bg` | Tooltips | `#f8f8f8` | `#262b34` |
| Scrollbar thumb | | `#96a2b0` | `#424854` |

**Semantic colours** (default shade per theme).

| Name | LIGHT | DARK | Used for |
|---|---|---|---|
| red | `#cb2245` | `#ff496e` | 「停止」, delete, hardcore, ERROR |
| green | `#00af5c` | `#1bd96a` | online dot, 「已选择」, update arrow, INFO, completed progress |
| orange | `#e08325` | `#ffa347` | warnings, 「进行中」 |
| blue | `#1f68c0` | `#4f9cff` | links, log timestamps, 「排队中」 |
| purple | `#8e32f3` | `#c78aff` | accent option |
| gray | `#595b61` | `#9fa4b3` | toggle knob (off) |
| Pink scale (both themes) | 50 `#fdf2f8` · 100 `#fce7f3` · 200 `#fbcfe8` · 300 `#f9a8d4` · 400 `#f472b6` · 500 `#ec4899` · 600 `#db2777` · 700 `#be185d` · 800 `#9d174d` · 900 `#831843` · 950 `#500724` | | |
| Loader tags (light / dark) | Fabric `#8a7b71`/`#dbb69b` · NeoForge `#dc895c`/`#f99e6b` · Forge `#5b6197`/`#959eef` · Quilt `#8b61b4`/`#c796f9` | | text + icon colour of loader pills |

**Accent presets** (Settings › 外观 › 强调色; light / dark): 粉色 `#db2777`/`#f472b6` (**default**) · 橙色 `#e08325`/`#ffa347` · 绿色 `#00af5c`/`#1bd96a` · 蓝色 `#1f68c0`/`#4f9cff` · 紫色 `#8e32f3`/`#c78aff` · 跟随系统 · 自定义 (custom `#db2777` derives `#db2777` / `#f16da8`). In the real app the protagonist follows the accent; the film locks it to pink.

**Logo palette** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.svg`, flat polygons): light top `#FED6EB` · body `#FEB8DA` · side shade `#E79EC5` · gills `#FE3D8C` / `#FE71B1` · deep crest `#DF3177` · eyes **`#43147C`** · mouth `#FE60A4`. The deep crest `#DF3177` sits next to UI `#db2777`: one pink ties logo and button.

**Stage-specific palettes** (only inside their screens).

| Screen | Colours |
|---|---|
| 投影工坊 3D stage ✔ | clear `#0a0a0a`; grid cells `#404040` @ .72, sections every 12 blocks `#6b6b6b` @ .9; region bounds `#58736a` @ .52; selection brand @ .24 + solid brand edges; glass overlays `rgba(235,235,235,.9)` + blur 12 px |
| 投影工坊 cover art (not the viewer) | cyan wireframe ghost blocks `#00F8F8` on a `#0A0A0A` → `#F9F9F9` diagonal gradient |
| 种子地图 canvas (cubiomes) | ocean `#000070`, deep ocean `#000030`, river `#0000FF`, beach `#FADE55`, plains `#8DB360`, forest `#056621`, cherry grove `#FF91C8`, desert `#FA9418`, badlands `#D94515`, mushroom `#FF00FF`, swamp `#07F9B2`; loading checker `#f5f5f5` / `#f8f8f8`; marker default `#22C55E`; label tab `rgba(20,22,26,.86)`; ruler `#F2B84B`; completion check `#1BD96A` |
| Website only — **do not use in app shots** | pink `#c72f6c` (light) / `#ff82b2` (dark); hero glows teal `rgb(70 190 176/11%)`, lavender `rgb(142 119 230/11%)`; feature icon gradient `#A7D0FF → #F472B6` |

### 2.2 Typography

**Families.**

| Use | Product | Film file |
|---|---|---|
| UI Latin + digits | **Inter 3.19** static 400/500/600/700/800, loaded from Modrinth's CDN at runtime ✔ | `E:\GitHub\Axolotl-animation\public\fonts\Inter-Regular.woff2` … `Inter-ExtraBold.woff2` (v3.019 ✔), registered in `E:\GitHub\Axolotl-animation\src\fonts.ts` |
| UI CJK | **none shipped**; OS fallback (PingFang SC in the macOS refs; Microsoft YaHei on Windows ◇) | `E:\GitHub\Axolotl-animation\public\fonts\NotoSansSC-subset.woff2` (variable 100–900, GB2312 + punctuation) as the PingFang SC stand-in ✎; verified to cover every CJK and full-width character in this bible ✔ (any new copy must be re-checked against the subset) |
| Mono (logs, seed field) | `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace` | system mono ✎ |
| Minecraft in-world text | `bundled-minecraft-font-mrapp` from Modrinth's CDN (MOTDs, nametags) | not cleared; see §5.2 |

**CJK weight policy ✎.** PingFang SC tops out at Semibold, so in the macOS refs every Chinese label set at 700/800 (button labels, headings) renders as **Semibold 600** while Latin in the same string renders at the true Inter weight (e.g. 「Mystic_Stars，」 in ExtraBold beside Semibold Chinese). For fidelity, cap Chinese at **600** (register a static Noto Sans SC 600 instance for weights 600–900) and keep Inter at the requested weight.

**Type scale (verified class strings; px / weight / line-height).**

| Role | Spec | Where |
|---|---|---|
| Hero button label | 16 / **800** / 20, white | xl buttons |
| md / lg button label | 16 / 600 / 20 | most buttons |
| 2xs / xs / sm button label | 14 / 600 / 20 | small buttons (Lab 「进入」) |
| Page title | 24 / 700 / 32 (Lab 实验室); 24 / 600 / 1 (instance & project headers) | `Lab.vue`, `ContentPageHeader.vue` |
| Minimal greeting | 24 / 800 / 32, centred | `HomeGreeting.vue` |
| Dashboard greeting | 22 / 800 / 1.35 (user can set 16–32) | `HomeGreeting.vue` |
| Section headings (showcase rows) | 18 / 700 / 28 | pre-widget Home |
| Widget headings | 16 / 700 | Home widgets |
| Project card title | 20 / 600 / 1 (16 below 550 px card width) | `ProjectCardTitle.vue` |
| Lab card title / description | 18 / 700 / 22.5 · 14 / 400 / 20 tertiary | `Lab.vue` |
| Body / summary | 16 / 400 (card summary, 2-line clamp) · 14 / 400–500 tertiary (meta) | |
| NavTabs labels | 14 / **700** / 20 | `NavTabs.vue` |
| Input text | 16 / 500 / 20; placeholder tertiary at 60 % (80 % focused) | `StyledInput.vue` |
| Tag pill | 14 / 400 / 1 | `TagItem.vue` |
| Tooltip | 14.4 / 500 / 1 | `overlays.css` |
| Nav badge | 10 / 700 / 16 white on pink | `App.vue` L3015 |
| Top-bar wordmark | "Axolotl" 14 / 800, tracking .025em, `#1a202c` | `AxolotlLogo.vue` |
| Onboarding wordmark | "Axolotl" 72 / 800 + "Launcher" 72 / 650 tertiary | `OnboardingWelcome.vue` |
| Logs | mono 12 / 17 | `LogViewport.vue` |
| Seed-map canvas label | `600 11px system-ui` | `LabSeedMap.vue` L1371 |

**Number and date formats.** Downloads: < 10,000 → `9,876`; < 1 M → `45.7K`; ≥ 1 M → `74.62M` (English suffixes even in zh-CN); tooltip `74,620,000 次下载`. Relative times from `Intl.RelativeTimeFormat('zh-CN')`: 「54秒钟前」「2分钟前」「10小时前」「3天前」「上周」. Dates: 「2026年10月」「10月6日星期二」. Chinese ellipsis is **「……」** (two U+2026); punctuation is full-width （，：！「」）.

### 2.3 Shape: radii, spacing, strokes

| Radius | Value | Used by |
|---|---|---|
| `--radius-xs/sm/md/lg/xl` | 4 / 8 / 12 / 16 / 20 | tokens |
| Buttons by size | 2xs 8 · xs 8 · sm **10** · md **12** · lg **14** · xl **16** (≈ **height ÷ 3** across the family); `circular` → full | `ButtonFrame.vue` |
| Cards `.card`, widgets, project cards, Lab covers, modal body | 16 | |
| Content well top-left, toasts, cart bar, library tile, content table, `BigOptionButton` | 20 | |
| Inputs, Combobox trigger, menus, seed-map panels, workshop overlays | 12 | |
| Combobox dropdown | 14 | |
| Tooltips, list rows (InstanceItem / WorldItem) | 8 | |
| Checkbox | 6 | `Checkbox.vue` |
| Avatars | `16/96 × size` (48 → 8, 64 → 10.67, 100 → 16.67) | `Avatar.vue` |
| Pills, nav circles, NavTabs, toggles, tags | full | |

**Spacing** tokens 4 / 8 / 12 / 16 / 24 (`gap-1/2/3/4/6`). Page padding 24 (`p-6`); card padding 16; nav rail padding 8 and gap 8 (48 px circles on a **56 px pitch**).

**Strokes.** Almost always 1 px solid. In light theme the **stroke carries separation**: `#f8f8f8` cards on the `#ebebeb` floor get a **1 px `#ffffff`** border; base buttons get an inset 1 px `#dddddd` ring. Exceptions: 2 px dashed pink drop overlay, 2 px pink underline on active content-table status tab, 4 px focus ring.

### 2.4 Elevation and the 2.5D layer stack

| z | Layer | Fill | Real edge / shadow | ✎ suggested depth in the 2.5D stage |
|---|---|---|---|---|
| 0 | Window | — | macOS window shadow (OS), window corner ≈ 18 px ▣ | base plate |
| 1 | Chrome: title bar 48 + nav rail 64 | `#f8f8f8` | flat | 0 |
| 2 | Content well | `#ebebeb` | `inset 1px 1px 15px rgba(0,0,0,.1)` + 1 px `#dddddd` (`.app-contents::before`, z 30, top-left r 20) | recessed −6…−10 |
| 3 | Right panel | pink gradient | `inset -15px 0 15px -15px rgba(0,0,0,.1)` cast onto the well; 1 px brand 16 % left edge | 0 |
| 4 | Cards / widgets / rows | `#f8f8f8` (+1 px `#fff`) or `#f5f5f5` | `--shadow-card: rgba(50,50,100,.1) 0 2px 4px` (widgets, list rows, avatars) | +4 |
| 5 | Controls | `#ffffff` | `inset 0 0 0 1px #dddddd, 0 1px 1px rgba(0,0,0,.12)` | +8 |
| 6 | **Pink coloured buttons** | `#db2777` | 30 % ring + `0 2px 4px / 0 5px 8px rgba(0,0,0,.04), 0 10px 18px / 0 24px 48px rgba(0,0,0,.03)` + **1 px white top rim** | +12 (hero) |
| 7 | Sticky / floating | NavTabs capsule, Browse toolbar (z 20), cart bar (z 107) | `shadow-xl: 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)`; cart bar `0 1px 3px rgba(0,0,0,.3), 0 6px 10px rgba(0,0,0,.15)` + `drop-shadow-2xl` | +20 |
| 8 | Toasts (z 200), menus, tooltips | `#f8f8f8` | toast `0 4px 8px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.2)`; menu `3px 3px .8rem rgba(0,0,0,.3)`; tooltip `drop-shadow(2px 2px .4rem rgba(0,0,0,.5))` | +28 |
| 9 | Modal + scrim | `#f8f8f8`, r 16, 1 px `#ddd` | `4px 4px 26px 10px rgba(0,0,0,.08)`; scrim + blur 5 px | top |

✎ **Extrusion palette for thin volumes** (side faces take the product's own next-darker value): `#ffffff` → `#e6e6e6` (its hover); `#f8f8f8` → `#dfdfdf`; `#ebebeb` → `#d4d4d4`; pink `#db2777` → sides `#c5236b` (its hover), underside `#be185d` (pink-700). Keep slabs thin (2–6 px); the product's only built-in "volume cue" is the pink button's 1 px white top rim.

### 2.5 Icons

- **Source:** `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\*.svg`, exported as `<Name>Icon` by `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\generated-icons.ts` (447 entries). Film copy: `E:\GitHub\Axolotl-animation\src\assets\icons\` (295 plain icons) → `E:\GitHub\Axolotl-animation\src\ui\icons.generated.ts` → `<Icon name=…>` in `E:\GitHub\Axolotl-animation\src\ui\Icon.tsx`.
- **Style:** Lucide/Feather outline; 24 × 24 viewBox; `fill: none`; `stroke: currentColor`; **stroke-width 2**; round caps and joins. Global `svg { width: 1em; height: 1em }`. Sizes by context: buttons 16 (2xs–sm) / 20 (md, lg) / **24 (xl)**; nav 24; inputs 20.
- **Exceptions:** `x.svg` (XIcon, close) and `cube.svg` are **filled** Heroicons 20 × 20; `spinner.svg` = 25 % ring + 75 % filled arc (spins 1 s linear); `download.svg` is Heroicons-outline geometry; `server.svg` draws a hard drive; `sparkles.svg` draws a file-pen; `change-skin.svg` is custom and mirrored by a root `scale(-1 1)`.
- **There is no puzzle, map-pin or plain stop icon:** mods use `box.svg`; pins use `pin.svg` (push-pin, the 「添加标记」 button) or `tags\categories\map-pinned.svg`; stop uses `stop-circle.svg`.
- **Cursor:** the product defines no custom cursor; draw a neutral OS-style arrow (white fill, black outline) ✎; `mouse-pointer-2.svg` is the in-system stylised alternative.

Key icons for the film:

| Component | File (in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\`) | Where |
|---|---|---|
| PlayIcon | `play.svg` — `<polygon points="5 3 19 12 5 21 5 3"/>` | every 「开始游戏」 |
| StopCircleIcon | `stop-circle.svg` (circle r 10 + 6 × 6 square) | 「停止」 |
| SpinnerIcon | `spinner.svg` | launching / installing |
| DownloadIcon | `download.svg` | 「安装」 (project page), 「修复」, update (green), nav 下载 |
| SearchIcon | `search.svg` | every search field |
| PlusIcon / CheckIcon | `plus.svg` / `check.svg` | card 「安装」 / 「已选择」 |
| PinIcon | `pin.svg` | 「添加标记」 |
| FileArchiveIcon | `file-archive.svg` | 「打开文件」, drop overlay, 「在投影工坊中打开」 (Files tab) |
| PencilIcon | `pencil.svg` | 「在投影工坊中打开」 (content row) |
| ChevronRightIcon | `chevron-right.svg` | Lab 「› 进入」 |
| ListIcon | `list.svg` | 「更换主页实例」 (the hero's neighbour) |
| CompassIcon | `compass.svg` | nav 发现内容, 「浏览内容」, 「前往」 |
| BoxIcon / BoxesIcon | `box.svg` / `boxes.svg` | mods, game version / 内容 tab |
| GameIcon / TimerIcon | `game.svg` / `timer.svg` | Minimal card meta |
| OnlineIndicatorIcon | `online-indicator.svg` (green `#00af5c` dot + 25 % halo) | title-bar pill while running |
| TerminalSquareIcon | `terminal-square.svg` | 日志 tab, title-bar pill |
| UnfoldVerticalIcon | `unfold-vertical.svg` | 「层间距」 |
| Loader tags | `tags\loaders\fabric.svg`, `forge.svg`, `neoforge.svg`, `quilt.svg` | loader pills (not yet copied into the film project) |

### 2.6 Motion tokens

| Token | Value | Source |
|---|---|---|
| UI reaction | **150 ms `cubic-bezier(0,0,.2,1)`** on bg/colour/shadow/filter/opacity/transform | `ButtonFrame.vue` |
| Press | **`scale(.97)`** (cards: contents `scale .97` in 125 ms ease-out; library card wrapper .98; nav tabs .95) | ButtonFrame, SmartClickable, Instance.vue |
| Hover | `brightness(.9)` light / `1.25` dark | ButtonFrame |
| Focus | 4 px ring `rgba(219,39,119,.68)` | ButtonFrame |
| **Inchworm pill** | each edge 150 ms `cubic-bezier(.4,0,.2,1)`; leading edge immediately, **trailing edge +120 ms** (nav rail) / **+200 ms** (tab bars); opacity 250 ms `cubic-bezier(.5,0,.2,1)` +50 ms | `NavRail.vue`, `NavTabs.vue` |
| Spring arrival | **`cubic-bezier(.15,1.4,.64,.96)`** 250 ms from `scale(.5) translateY(-10rem)`, opacity 0 (cart / selection bar); 500 ms for nav-button enter | `FloatingActionBar.vue` L270–281, `App.vue` L3946 |
| Back-out pop | `cubic-bezier(.34,1.56,.64,1)` 600 ms (installer completion logo) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\installer-ui\src\installer.html` |
| Expo reveal | `cubic-bezier(.16,1,.3,1)` (logo .72 → 1.04 → 1 in 900 ms) | `OnboardingWelcome.vue` L247, 478–486 |
| Soft settle | `cubic-bezier(.22,1,.36,1)` (sidebar width 320 ms; brand scan 700 ms; lift 3200 ms) | `App.vue` L3684, `OnboardingWelcome.vue` |
| Page change | cross-fade only: enter **180 ms** ease, leave **120 ms** ease | `global.scss` L741–765 |
| Modal | opens from the click: container starts at `(click − centre) / 16` and settles in 200 ms ease-out; body `scale .97 → 1` + fade 200 ms; scrim fade 200 ms + blur 5 px | `NewModal.vue` L338–339 |
| Card reveal | opacity 0 → 1 and `translateY(4px) → 0`, 220 ms ease, all cards at once | `ContentCardReveal.vue` |
| Toast | `translateX(100%) scale(.8)` + fade ↔ rest, 0.3 s ease-in-out | `PopupNotificationPanel.vue` |
| Toggle | 200 ms; knob 16 → 18 (hover) → 14 (press) | `Toggle.vue` |
| Library hover-play | `scale(.75) opacity 0 → scale(1) opacity 1`, `transform-origin: bottom`, 150 ms | `Instance.vue` L441–456 |
| World arrival highlight | 4 s ease-out: brightness 1.25 held to 75 %; 1.5 px brand border + `0 0 8px 2px` brand glow at 50 % fading to 0 | `WorldItem.vue` |
| Seed-map zoom | 250 ms cubic ease-out `1-(1-p)^3`, anchored at the cursor | `LabSeedMap.vue` |
| Drag-gather | 500 ms `cubic-bezier(.2,.8,.2,1)`, stagger `min(i,8) × 10 ms` into a stacked deck | screenshots page |
| Spotlight pulse | brand corner brackets breathe `scale 1 ↔ 1.015`, 1.6 s ease-in-out | `OnboardingOverlay.vue` |
| Spinner | 1 s linear | Tailwind `animate-spin` |

Easing vocabulary: `(0,0,.2,1)` UI · `(.4,0,.2,1)` standard · `(.22,1,.36,1)` settle · `(.16,1,.3,1)` reveal · `(.15,1.4,.64,.96)` spring · `(.34,1.56,.64,1)` pop · `(.2,.8,.2,1)` regroup.

---

## 3. Protagonist spec — the real launch button

### 3.1 Which button

**Minimal Home's primary 「开始游戏」** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeMinimal.vue` L273–282). It is the only control on any Home that is pink, large, labelled and alone on its stage. Its twin (same paint, auto width ≈ 126 × 48 ◇) sits in every instance-page header (`pages\instance\Index.vue` L171–179). The legacy component (`ButtonStyled size="large" color="brand"`) had identical metrics, so the hero looks the same in both eras.

### 3.2 Geometry

| Property | Value |
|---|---|
| Box | **144 × 48** (`w-36 h-12`), border-box, 1 px transparent border (the fill shows under it) |
| Radius | **16** (`rounded-2xl`) |
| Padding / gap | 0 14 / 8; content centred (`justify-center`) |
| Label | 「开始游戏」 in `<span class="truncate">`: 16 px, **800**, line-height 20, `white-space: nowrap`, ellipsis if too long |
| Icon | PlayIcon **24 × 24**, outline, stroke 2, round joins, `translateX(1px)` |
| Local layout ◇ | content 24 + 8 + 64 = 96 px centred in the 114 px content box. **Icon box x 25–49, y 12–36 → triangle vertices (30,15) (44,24) (30,33).** Label box x 56–120, line box y 14–34 (origin = button top-left) |

```
x  0  1        15   25            49    56                    120     129 143 144
y0 ┌───────────────────────────────────────────────────────────────────────────┐
   │ 1px border (transparent) · padding-x 14                                   │
12 │            ┌▷────────────┐        ┌──────────────────┐                     │
   │            │ PlayIcon 24 │  gap 8 │ 开始游戏 16/800  │                     │
36 │            └─────────────┘        └──────────────────┘                     │
48 └───────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Paint (light + pink), paste-ready

```css
.launch-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  box-sizing:border-box;width:144px;height:48px;padding:0 14px;border:1px solid transparent;border-radius:16px;
  background:#db2777;color:#fff;font:800 16px/20px Inter,"Noto Sans SC",sans-serif;white-space:nowrap;
  box-shadow:0 0 0 1px rgba(219,39,119,.3),0 2px 4px rgba(0,0,0,.04),0 5px 8px rgba(0,0,0,.04),
             0 10px 18px rgba(0,0,0,.03),0 24px 48px rgba(0,0,0,.03);
  transition:background-color .15s cubic-bezier(0,0,.2,1),color .15s cubic-bezier(0,0,.2,1),
             box-shadow .15s cubic-bezier(0,0,.2,1),filter .15s cubic-bezier(0,0,.2,1),
             opacity .15s cubic-bezier(0,0,.2,1),transform .15s cubic-bezier(0,0,.2,1)}
.launch-btn::before{content:"";position:absolute;inset:0;padding:1px;border-radius:inherit;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude}             /* 1px top-lit rim */
.launch-btn>svg{width:24px;height:24px;flex-shrink:0;transform:translateX(1px)}
.launch-btn:hover{filter:brightness(.9)}                           /* → #c5236b */
.launch-btn:active{transform:scale(.97)}
.launch-btn:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(219,39,119,.68)}
/* icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> */
```

Dark theme: fill `#f472b6`, label and icon **`#000000`**, hover `brightness(1.25)`. Code-accurate reference render (system fonts): `E:\GitHub\Axolotl-animation\research\_scratch\03-shell-home\protagonist-mock.png`.

### 3.4 States (same 144 × 48 box on Minimal Home; auto width on the instance page)

| State | Trigger | Type / fill | Icon | Label (verbatim) | Opacity |
|---|---|---|---|---|---|
| **Idle** | installed, not running | coloured brand `#db2777` | PlayIcon +1 px | 开始游戏 | 1 |
| Hover | pointer over | `brightness(.9)` → `#c5236b` (label `#e6e6e6`) | | | 1 |
| Pressed | mouse down | `scale(.97)`, 150 ms ease-out | | | 1 |
| Focus-visible | keyboard | + 4 px ring `rgba(219,39,119,.68)` (+ hover filter) | | | 1 |
| **Busy (Minimal Home)** | right after the click, until the process is found; also while installing | **base: white `#fff`**, inset 1 px `#ddd` + `0 1px 1px rgba(0,0,0,.12)`, label `#1a202c` | Spinner 24 `#2c2e31`, 1 s linear | 实例正在加载…… (truncates to ≈「实例正在…」) / 安装中…… | **.5** |
| **Running** | game process alive | coloured **red `#cb2245`** | StopCircleIcon | 停止 | 1 |
| Not installed | | coloured brand | DownloadIcon | 安装 (offline: disabled + tooltip 「离线模式只能启动已完整下载的实例。」) | 1 / .5 |
| Instance page · launching | after click | coloured brand, disabled | Spinner (spinning) | **正在启动…… {n} 秒** (+1 each second) | .5 |
| Instance page · stopping | | coloured red, disabled | StopCircleIcon | 正在停止…… | .5 |
| Instance page · installing | | coloured brand, disabled | — (no icon) | 安装中…… | .5 |
| Instance page · broken | | coloured brand | DownloadIcon | 修复 | 1 |

What else changes on a real launch ✔: the title-bar pill switches from 「● 没有运行中的实例」 to 「[green dot] {instance name} [red stop-circle] [terminal]」; the process events `launched` / `finished` drive the button; no full-screen overlay or route change happens (`helpers\instance.ts` `run()` → Tauri `plugin:instance|instance_run`).

### 3.5 Where it lives — Minimal Home stage (1440 × 792 window, light, macOS)

Computed from the stage CSS ◇ (`.minimal-home-stage { min-height: calc(100vh - 48px - 4rem) }`, `pt-8 pb-14 px-6`, column `max-w-3xl`, `Card mt-10`, right group `flex min-h-11 justify-end gap-2`), cross-checked against report 03.

| Element | Right panel **open** | Right panel **closed** |
|---|---|---|
| Content viewport | x 64 → 1124 (well 64–1140, 16 px scrollbar gutter ◇) | x 64 → 1424 |
| Greeting 「傍晚好，Mystic_Stars」 24/800, centred | y 276–308 (80 px icon) / y 289–321 (32 px icon) | same y |
| Pink bar 32 × 2 (`bg-brand rounded-full`) | 12 px below the greeting | |
| Card (768 wide, `#f8f8f8`, 1 px `#fff`, r 16, p 16) | **x 210–978**, y 362–476 (80 px icon) / y 375–463 (32 px icon) | x 360–1128 |
| **Protagonist 144 × 48** | **x 761–905, y 395–443** (same for either icon size) | **x 911–1055**, y 395–443 |
| Neighbour 「更换主页实例」: quiet xl circle 48, ListIcon 24 `#2c2e31` (hover bg `#fff` + brightness .9) | x 913–961 (8 px right of the hero) | x 1063–1111 |
| Left block | instance icon (**renders 32 × 32** ◇, author intended 80), gap 20, name 20/700 `#1a202c` 「Vanilla Perfected」, meta 14 px `#484d54`: 「[GameIcon] Fabric 26.2」 gap 16 「[TimerIcon] 游玩于 2分钟前」 | |

- In a **1440 × 810** (16:9) window everything vertically centred moves down **+9 px** (stage centre 376 → 385). At 1920 × 1080 the window scale is 1.333.
- **The hole it leaves ✔:** the right group is `justify-end`, so if the hero leaves the layout, **nothing visibly reflows**: the list button stays at x 913–961 and an empty 144 × 48 r 16 slot remains, vertically centred in the card, its right edge 56 px (48 + 8) from the card's inner right edge.
- Right panel on Minimal Home (if open) shows only the account block (「当前游玩账号：」 + account card); the insight, challenge and news sections appear only on 信息主页.
- Layout switch (bottom-right floating pill, 16 px from the well's bottom and right edges): 64 × 32 white track, 28 px pink thumb sliding 32 px in 180 ms; tooltips 「切换到极简主页」/「切换到信息主页」.

### 3.6 Label policy: 「开始游戏」 vs 「启动」

- The button's face always reads **「开始游戏」** (`button.play`), the label of every play button in the product.
- 「启动」 exists, verbatim, in exactly these places: the tooltip of the 24 px calendar play glyph (`app.home.calendar.play`); the local-server card button (`app.servers.action.start`); the launching state 「正在启动…… {n} 秒」; the dropdown item 「启动实例」; the greeting line 「下一个项目只差一次启动。」; the server console empty state 「点击启动按钮即可启动服务器！」.
- ✎ The film title 《启动按钮去哪了？》 is legitimate colloquial product language (「启动按钮」 is the product's own phrase in the server console line). Keep 「启动」 for the title and narrative beats; keep 「开始游戏」 on the button.

### 3.7 Identity core (what must survive every transformation)

| # | Core element | Evidence |
|---|---|---|
| 1 | **Brand pink `#db2777`** as the body colour | The single accent used for every primary / selected / "alive" state (nav pill, tab pill, toggle track, focus ring, progress fill, selection in the 3D viewer, drop overlay). The logo's deep crest `#DF3177` is the same pink. |
| 2 | **The outline play triangle** (Lucide `play`, polygon 5 3 19 12 5 21; stroke = size/12; round joins; white on pink; optical +1 px, +2 px in the 48 px circle) | PlayIcon appears only on play/launch affordances, so it uniquely names the character. It is never filled in the product. |
| 3 | **The coloured-button "skin"**: 1 px white→transparent top rim + 1 px 30 % pink hairline + the soft 4-layer shadow | Only coloured buttons carry it; it is the product's own thin-volume cue. |
| 4 | **Proportion: radius ≈ height ÷ 3** (16 @ 48); a full circle when square | Product-wide rule for buttons (8/24, 12/36, 16/48). It is not unique by itself, but it keeps every morph feeling native. |

✎ **Adjustment from evidence.** Radius alone does not identify the hero (every button shares it). **Pink + triangle** is the unique pair, so the triangle should stay visible at every stage, even when small (24 px glyph). When the hero fully becomes another component, it may settle onto that component's real radius (input r 12, pin = circle, tab pill = full) and pick r ≈ h/3 back up as it leaves.

### 3.8 Real relatives and disguises (morph targets that exist in the product)

| Relative | Size / shape | Paint | Where (file) |
|---|---|---|---|
| Hero | 144 × 48, r 16 | pink, label + triangle | `HomeMinimal.vue` |
| Twin | ≈126 × 48, r 16 | pink | instance header `pages\instance\Index.vue` |
| Hover play disc | **48 × 48 circle**, triangle +2 px, `card-shadow`; pops `scale .75→1` from `origin-bottom` over the 48 px instance icon (icon dims to `brightness .75`) | pink | library card `components\ui\Instance.vue` L436–456 |
| Spotlight play | 36 × 36 circle | pink (row variant: white) | pinned-instance widget |
| Shortcut play | 24 × 24 circle | pink | `HomeShortcutWidget.vue` |
| Calendar glyph | 24 × 24 quiet, 16 px pink triangle at 60 % → 100 % on row hover, tooltip **「启动」** | transparent | `HomeCalendar.vue` L363–373 |
| Context-menu row | full-width row, r 8, `▷ 开始游戏` first item; **hover fills solid pink, white bold** | `#f8f8f8` menu | library right-click `ContextMenu.vue` |
| Showcase row button | 112 × 36, r 12, **white** `▷ 开始游戏` 16/600 | base | pre-widget Home (screenshot) |
| Lab 「› 进入」 | 80 × 32, r 10, chevron-right 16 left + 「进入」 14/600 right (`justify-between px-3`) | pink | every Lab card `pages\Lab.vue` L321–330 |
| Browse card 「＋ 安装」 | 36 h, r 12, 1 px pink border, transparent, pink 16/600 label; → green 「✓ 已选择」 | outlined | `Browse.vue` `getCardActions` |
| Cart 「＋ 安装 1 个内容」 | 36 h, r 12 | pink | floating cart bar |
| Project 「⬇ 安装」 | 48 h, r 16 | pink | project page header |
| Search field (focused) | 48 h, r 12, white; **pink appears as the 4 px focus ring** | white | Browse toolbar |
| NavTabs slider / nav pill | full-round pill; solid pink with white label/icon; inchworm motion | pink | everywhere |
| Toggle (on) | 48 × 24 pink track, **black** 16 px knob | pink | content rows |
| Seed-map 「🧭 前往」 / 「📌 添加标记」 | 40 h / 24 h (2xs) | pink | `LabSeedMap.vue` L2466, popup |
| Seed-map marker | teardrop pin ≈ 16 × 23 (§4.6) | **any colour, pink allowed** | canvas |
| Seed-map layer stickers | 40 × 36 buttons holding 24 px stickers | pink (on and off) | layer strip |
| Workshop selection | outer faces at 24 % pink + solid pink edges (+ .65 box) | pink | `scene.ts` |
| Workshop drop overlay | inset 12, **2 px dashed pink**, r 12, 「松开以打开投影」 in pink bold | `#ebebeb` 88 % | `LabSchematicPreview.vue` L2559–2561 |
| Workshop 「替换所选」 / 「打开文件」 | md 36 h, r 12 | pink | inspector / empty state |
| Hue-slider thumb | 20 px pink circle, 3 px white border, `--shadow-button` (looks like a tiny button) | pink | Settings › 外观 |

✎ **Cause-and-effect hint.** Because every one of these UI states is pink *because of the accent*, the film can let the hero "lend" its pink as it passes (a tab pill lights up, a toggle switches on, a focus ring flares) — a native reason for the UI to react.

### 3.9 Character motion presets (all numbers from product code; ✎ scaling for film)

| Moment | Values | Source |
|---|---|---|
| Press / squash | `scale .97`, 150 ms ease-out (film may push to .92 for the climax ✎) | ButtonFrame |
| Landing | `scaleX = 1 + 0.2·impact`, `scaleY = 1 − 0.16·impact`, impact = min(1, abs(vy) / 520) when > .28, decays 4.5/s (≈220 ms); 4–11 splash dots `#ceecff` | `AboutAxolotlRun.vue` |
| Airborne | `scaleY = 1 + 0.1·v`, `scaleX = 1 − 0.1·v`, tilt `−0.16·v` rad (v = vy / 520, clamped ±1); gravity 2300, jump 520 | `AboutAxolotlRun.vue` |
| Idle / run | bob `sin(15t)·1.4 px`, tilt `sin(15t)·0.04` rad | `AboutAxolotlRun.vue` |
| Drop / spawn | easeOutBack 220 ms; floor restitution .16 | `AboutMergeGame.vue` (「点击场地，投放粉色美西螈」) |
| Arrive | spring `cubic-bezier(.15,1.4,.64,.96)` 250 ms from `scale .5` | FloatingActionBar |
| Crawl | inchworm: leading edge first, trailing +120 ms (film ✎ 300 ms legs / 240 ms delay) | NavRail |
| Regroup | 500 ms `cubic-bezier(.2,.8,.2,1)`, 10 ms stagger | drag-gather |
| Lock-on | 2 px pink corner brackets, `scale 1 ↔ 1.015` every 1.6 s; or the 4 px focus ring | onboarding spotlight |
| Landed | 1.5 px pink border + 8 px pink glow fading over 4 s | WorldItem highlight |

---

## 4. Screen anatomies

Reference window **1440 × 792 CSS px**, light + pink, macOS chrome, v1.9.7, unless noted.

### 4.1 App shell

```
x 0      64                                                        1140        1440
y0 ┌──────────── TITLE BAR h48 #f8f8f8 (whole bar is a drag region) ─────────────────┐
   │[mac 80px] logo24 Axolotl (←)(→) ⌂主页 ……………………… 📰36  [● 没有运行中的实例]      │
48 ├────────┬────────────────────────────────────────────────────┬──────────────────┤
   │ RAIL 64│ CONTENT WELL #ebebeb ╭ r20 top-left                 │ RIGHT PANEL 300  │
   │#f8f8f8 │ inset 1px 1px 15px rgba(0,0,0,.1) + 1px #dddddd      │ pink gradient    │
   │ 48px   │ scrollbar gutter 16 (thumb #96a2b0)                 │ #ead9e1 (top)    │
   │ circles│                                                    │ #e9d0db (bottom) │
792└────────┴────────────────────────────────────────────────────┴──────────────────┘
```

**macOS window ▣** (OS-provided, not in code): traffic lights ≈ 13.4 px diameter, centres at x ≈ 22 / 45 / 68, y ≈ 21 (sampled `#ff5c60`, `#f8c800`, `#37c75c`); window corner ≈ 18 px. Title bar content starts at x = 80 (`.mac .app-grid-statusbar { padding-left: 5rem }`).

**Title bar** (`App.vue` L3085–3120): inner `p-3` (24 px row).
1. `AxolotlLogo`: `axolotl.png` in a **24 × 24** box (visible art ≈ 19 × 14) + 8 px + 「Axolotl」 14/800, tracking .025em, `#1a202c` (hidden below 1280 px window width).
2. `ml-3`: back / forward = **24 px white circles** (`bg-surface-4`), 16 px arrows `#1a202c`, gap 4, hover `brightness(.75)`.
3. Breadcrumb (`pl-3 pt-[2px]`): v1.9.7 shows `[HomeIcon 20 #2c2e31] 主页` 16/600 `#1a202c` (the showcase shows text only). Instance pages: `[20 px instance icon, r 6] 名称 › [icon] 内容`.
4. Right (`mr-3`, gap 8): 📰 announcements (quiet 36 circle, NewspaperIcon 20, tooltip 「公告」, 8 px red unread dot) → **running pill**: 34 tall, r 12, 1 px `#dddddd`, px 12, 14 px. Idle: 8 px dot (`#484d54` in the showcase; possibly invisible in 1.9.7 ◇) + 「没有运行中的实例」 `#484d54`. Running: OnlineIndicator 14 + name `#1a202c` + StopCircle 20 `#cb2245` (「停止实例」) + TerminalSquare 20 `#484d54` (「查看日志」).
5. Windows/Linux only: three quiet 36 px window buttons at the far right (close hovers red).

**Nav rail** (`flex-col p-[0.5rem] pt-0 gap-[0.5rem]`, 64 wide): 48 × 48 round buttons, 24 px icons `#2c2e31`; hover white bg + `#1a202c`. Item *i* (from 0) occupies y = 48 + 56·i (first button touches the title bar) ◇.

| # | Tooltip | Icon file (in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\`) | y (top) ◇, 792 px window |
|---|---|---|---|
| 1 | 主页 | `home.svg` | 48 |
| 2 | 截图中心 | `images.svg` | 104 |
| — | 世界 | `world.svg` | hidden (`featureFlags.worlds_tab: false`) |
| 3 | 发现内容 | `compass.svg` | 160 |
| 4 | 皮肤选择器 | `change-skin.svg` | 216 |
| 5 | 多人游戏 | `users.svg` | 272 |
| 6 | 实例库 | `library.svg` | 328 |
| 7 | 实验室 | `flask-conical.svg` | 384 |
| 8 | 下载 | `download.svg` (badge: 16 px pink pill, 10/700 white count) | 440 |
| — | divider 24 × 1 `#dddddd`, `my-2` | | ≈ 504 |
| — | quick instances: 28 px icons in 48 px buttons, most recent first | | ≈ 521 → |
| 9 | 创建新实例 | `plus.svg` | 680 |
| 10 | 设置 | `settings.svg` | 736 (8 px from the bottom) |

- **Active:** a single pink slider (`#db2777`, full round) sits behind the active item; its icon turns white with `filter: drop-shadow(0 0 .5rem black)`. The slider moves with the **inchworm** gait (trailing edge +120 ms). Sub-page active (Library while inside `/instance/*`): the slider turns **white** with a `#1a202c` icon, and that instance's quick-switcher circle turns **pink** (no slide; it is outside the rail) — the pink disc visibly "hops".
- Showcase era: 7 items (no 截图中心), same 56 px pitch.
- **Tooltips** (nav opens to the right): `#f8f8f8`, 1 px `#ddd`, r 8, padding 10 × 12, 14.4 / 500, 14 × 7 arrow, 5 px offset, **200 ms show delay, no fade**, `drop-shadow(2px 2px .4rem rgba(0,0,0,.5))`.

**Content well:** absolute at (64, 48), bg `#ebebeb`, top-left radius 20, `overflow: hidden`; overlay `::before` (z 30) draws the inset shadow and the 1 px `#dddddd` stroke. A 2 px pink LoadingBar (`#db2777 → #e76ca3`) runs along its top while routes load. Route changes cross-fade (180 / 120 ms).

**Right panel** (300, `z 11`): `--brand-gradient-bg`; 1 px brand-16 % left border; 15 × 40 toggle handle hanging off its left edge at 50 % height (`#e9d3dd`, r `12px 0 0 12px`, 10 px arrow, tooltips 「收起边栏」/「展开边栏」). Default expanded; forced open on `/browse` and `/project`; hidden on `/settings`. Account block: 「当前游玩账号：」 16/500 + card (r 12, 1 px `#ddd`, `rgba(255,255,255,.5)`) with 36 px pixel face, name, 「Minecraft 账户」. On 信息主页 only, three more sections (h2 18 bold + 16 px icon): 「游玩洞察」 (ChartIcon) · 「每日小挑战」 (SparklesIcon = file-pen glyph; 24 px shuffle 「换一个」) · 「Minecraft 新闻」 (64 × 36 thumbnails), sliding in 200 ms after Home mounts.

### 4.2 Home

**Minimal Home (protagonist stage)** — §3.5. Tree: `section.minimal-home-stage` → column `max-w-3xl` centred → `HomeGreeting variant="minimal"` (24/800 「{greeting}，{name}」 + 32 × 2 pink bar, gap 12) → `Card mt-10` → grid `[minmax(0,1fr) auto]` gap 20 → [instance link: icon + name + meta] [right group: hero 144 × 48 + list button 48]. Without a player name the greeting is just 「傍晚好」. Empty states: a 64 × 64 r 8 white tile with ListIcon 28 + 「选择实例」 / 「还没有实例」 + pink xl 「☰ 选择实例」 / 「＋ 创建实例」.

**信息主页 (v1.9.7 widget dashboard, the default layout)** — `HomeDashboard.vue` + `home-dashboard.ts`.
- Section `p-6 pb-20`; columns = `min(4, floor((W + 16) / 256))`; rows 160; gap 16. Widget: r 16, `#f8f8f8`, `shadow-card`, padding 16; heading row 32 px with h2 16/700 (calendar and servers prepend a 20 px pink icon).
- Default widgets at 1440 × 792, panel open (4 columns × 241 px, origin x 88, y 72) ◇:

| Widget | Size | Box (x, y, w × h) | Content |
|---|---|---|---|
| greeting | 2 × 1 | 88, 72, 498 × 160 | date 12/700 tertiary (「10月6日星期二」) + line 22/800 (e.g. 「下一块方块该你放下。」) |
| 日历 | 1 × 2 | 602, 72, 241 × 336 | 「2026年10月」; 7-col grid, 22.4 px cells r 8, heat ramp; today 1 px pink border; list 「{date}你游玩了：」 rows with **24 px pink ▷ (tooltip 「启动」)** |
| 从最近的项目开始 | 2 × 2 | 88, 248, 498 × 336 | up to 4 rows; compact rows show a circular ▷ |
| 固定的世界 | 1 × 2 | 859, 72, 241 × 336 | world rows (单人游戏, 生存模式) |
| 固定的服务器 | 2 × 2 | 602, 424, 498 × 336 | 36 px favicons + status dot; 「4/2026 人在线」; 24 px pink ▷ 「加入服务器」 |
| 固定的实例 | 2 × 1 | 88, 600, 498 × 160 | instance cards (row variant: white 36 px ▷; spotlight: pink 36 px ▷; tile: 48 px pink hover disc) |

- Floating controls bottom-right: pill 40 tall (`#f8f8f8`, 1 px `#ddd`, `--shadow-button` + `0 4px 12px rgba(0,0,0,.2)`): [✎ 32 「自定义小组件」] │ [layout switch].

**Showcase-era Home (only to quote the website; `research\ref\launcher-home.png`).** Grid `minmax(0,1fr) 20rem`, gap 24. Left: h1 24/800 「Mystic_Stars，下一块方块该你放下。」 (`{name}，{greeting}`); h2 18/700 「从最近的项目开始」; four 72 px row cards (`p-3 r12 #f8f8f8 shadow-card`, 48 px avatar, name 18/700, meta 14 「上次游玩于54秒钟前 • …」, server MOTDs in the Minecraft font, **white 112 × 36 「▷ 开始游戏」** + 36 px ⋮); 「固定的实例」 + ghost link 「查看全部实例 →」 with 80 px cards (`r12 #f5f5f5 p16`, 48 icon, 「🎮 Fabric 26.2」 / 「🎮 Neoforge 1.21.1」 — CSS `capitalize` keeps the lowercase f); 「固定的世界」. Right column 320: 日历 card + 「固定的服务器」 card.

### 4.3 Discover (发现内容) · search · project card · install

`/browse/mod`, right panel forced open, page `p-6 gap-3`; content x 88–1100 (1012 wide) at 1440 ◇.

**Sticky toolbar** (full-bleed, `#ebebeb`, r 20 top corners, 1 px `#ddd` bottom; once stuck adds `shadow-[0_8px_16px_-12px_rgba(0,0,0,.35)]`), inner `p-3 gap-3`, ≈185 px tall:
1. **NavTabs** capsule: `#f8f8f8`, 1 px `#fff` border, `shadow-xl`, padding 4, 46 tall; tabs 36 tall, `px-4 py-2`, 14/700 `#1a202c`; **active = solid pink pill, white label**, inchworm with 200 ms trailing delay. Order ✔: **整合包 · 模组 · 资源包 · 数据包 · 地图 · 光影包 · 服务器 · 收藏夹** (≈574 × 46). Right: quiet xl 「[LanguagesIcon] 翻译」 (48 tall, 16/800).
2. **Search**: `StyledInput` **48 tall**, flex-1, `#fff`, r 12, no border/shadow, pl 40; SearchIcon 20 at x 12, `#484d54` @ 60 % (focus: `#1a202c` @ 100 %); text 16/500 `#2c2e31` (focus `#1a202c`); placeholder **「搜索模组……」** `#484d54` @ 60 % (80 % focused); **focus = 4 px ring `rgba(219,39,119,.68)`**; XIcon 20 clear button appears with text (pr 32); 200 ms debounce. Beside it: base md 「＋ 选择实例 ⌄」 and base md 「[GlobeIcon] 所有来源」 (36 tall, r 12).
3. Sort Combobox (`[ArrowUpDown] 相关性`, min-h 40, r 12, white) · per-page (`[Eye] 20`) · 36 px view-mode circle (ListIcon) · Pagination (current page = 25 % pink fill, `#1a202c` digits).
4. Active filter pills (hidden when empty).

**Results:** list, gap 12; cards fade up 4 px in 220 ms. Loading: 「正在加载结果……」 + skeletons. Empty: 「这里还是空的」 / 「没有找到您的查询结果！」 / 「清除搜索」.

**Project card, list layout** (`ProjectCard.vue`), ≈1012 × 142:

```
┌ card #f8f8f8 · 1px #ffffff · r16 · p16 · col-gap 12 · row-gap 8 ─────────────────────────────────┐
│ ┌────────┐ 钠 (Sodium) [Modrinth]                                     [＋ 安装][🔖]  ← actions │
│ │ icon   │ The fastest and most compatible rendering optimization mod…   ⬇ 74.62M   ← stats      │
│ │ 100×100│ (2-line clamp, 16/400 #2c2e31)                               ⟲ 3天前                  │
│ └────────┘ [Fabric][NeoForge][Quilt][优化]   ← tags                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
grid-template: 'icon info actions actions' / 'icon info dummy stats' / 'icon tags tags stats'; cols auto 1fr auto auto
```

- Icon: Avatar 100 px, r 16.67, 1 px `#ddd`, `#fff`, contain (missing → grey isometric cube outline `#9a9a9a`). Real mod icons are remote images — use stand-ins ✎.
- Title 20 / 600 / 1 `#1a202c` (bilingual from the MC百科 dictionary: 「钠 (Sodium)」 「锂 (Lithium)」 「模组菜单 (Mod Menu)」 「投影 (Litematica)」; no entry → original 「Iris Shaders」 「Fabric API」). Provider pill: `rounded-full bg #dddddd px-2 py-0.5` 12/600 `#484d54` (text only; ✎ prefer hiding it).
- Stats: DownloadIcon 20 + compact number; HistoryIcon 20 + relative date. Tags: TagItem pills ≈24 tall (r full, 1 px `#ddd`, `#fff`, 14/400 `#484d54`); loader tags first in platform colours. **Authors are never shown on cards.**
- Interaction: hover → whole card `brightness(.9)`, icon opacity .85, title underline; press → contents `scale .97` (125 ms); focus → 4 px `#db2777` outline.
- **Install button** (md outlined, 36 tall, r 12, px 10, gap 6, 1 px `#db2777` border, transparent, pink 16/600, PlusIcon 20): 「选择实例」 (no target; compact 「添加」) → 「安装」 → **「✓ 已选择」 in green `#00af5c`** → 「✓ 已安装」 (disabled .5). Favourite: quiet 36 circle BookmarkIcon 20.

**Cart / install flow:** card 「安装」 → green 「✓ 已选择」 → floating bar springs in (`scale(.5) translateY(-10rem)` → rest, 250 ms spring): fixed bottom between rail and panel, wrapper p 16; toolbar r 20, `#f8f8f8`, 1 px `#ddd`, `px-3 py-2.5 gap-1.5`; content = 32 px icon stack · 「1个已选择的项目」 16/600 · 1 × 24 divider · quiet 「清除」 · ml-auto **pink md 「＋ 安装 1 个内容」** → 「确认安装」 modal (40 rem, opens from the click) → download toast top-right (420 wide, r 20, `#f8f8f8`, 44 px icon, title 18/600 e.g. 「钠 (Sodium)」, status 「正在下载内容」 + `2 / 3`, **4 px solid pink bar along its bottom edge**, enters `translateX(100%) scale(.8)` in 0.3 s) + pink count badge on nav 下载 → card ends 「已安装」.

**Project page** (`/project/:id`): header `ContentPageHeader` (1 px `#ddd` line below): 96 px icon (r 16) · title 24/600 「Sodium」 · summary ≤ 704 px · stats DownloadIcon 24 + 「74.62M」 (600) · HeartIcon 24 + followers · category pills; right: quiet xl 「翻译」 · **pink xl 「⬇ 安装」 (48, r 16)** → 「安装中……」 → 「✓ 已选」 → 「✓ 已安装」; ⋮ is a bare 16 px icon ◇. NavTabs 「描述 · 版本 · 图库」. Right panel sections: 兼容性 · 相关链接 · 标签 · 作者 · 信息.

**Filter panel** (right panel on Browse): accordions (h3 16/700 + DropdownIcon 20; 0.3 s `cubic-bezier(0,.6,.3,1)`): 游戏版本 · 加载器 · 类别 · 运行环境 · 许可证 · 依赖于 · 高级; options 14/600 `#484d54` r 12; selected = 25 % pink + `#1a202c` text + CheckIcon 16.

### 4.4 Library (实例库) · instance page · content · worlds · logs · create

**Library** (`/library`): pane `p-6 gap-3` → NavTabs 「全部实例 · 整合包 · 服务器 · 自定义」 (no icons) → row 1: search 36 「搜索」 (flex-1) + base md 「＋ 新建分组」 + **pink md 「＋ 创建新实例」** → row 2: sort 「[ArrowUpDown] 名称」, 40 × 40 sort-direction square, divider, 「[Layers] 分组」, 36 px view circle → grid `repeat(auto-fill, minmax(256px,1fr))` gap 12.
- **Standard card** (80 tall): r 12, `#f5f5f5`, p 16, gap 12; 48 px instance icon (frameless pixel art by default: vanilla `grass-block.png`, Fabric `Fabric.png`, Forge `anvil.png`, NeoForge `NeoForge.png`, Quilt `Quilt.png`, other `stone.png`); name 16/700 `#1a202c`; `[GameIcon 16] Fabric 26.2` 14/600 `#484d54` (CSS capitalize: 「Neoforge 1.21.1」). Hover: card darkens (brightness .9, plus .85 from `.button-base` ◇); press .98.
- **Hover play ✔:** a 48 px pink circle sits exactly over the 48 px icon, `scale .75 → 1`, opacity 0 → 1, `origin-bottom`, 150 ms; the icon dims to `brightness .75`; ⋮ (24 px) top-right and a checkbox bottom-right fade in. Running → red disc + StopCircle. Launching/installing → icon `brightness .25 scale .85` + 32 px spinner.
- 实例库卡片 view: square-art tiles (r 20, `#f8f8f8`, 1 px `#fff`, p 12) with the 48 px pink disc at the art's bottom-right (6 px inset).
- Right-click menu (`#f8f8f8`, r 12, 1 px `#ddd`, p 8, `--shadow-floating`; items p 8, r 8, gap 8, 20 px icons): **「▷ 开始游戏」 (primary: hover = solid pink, white bold)**, 「☆ 置顶实例」, —, 「＋ 添加内容」, 「查看实例」, 「复制实例」, 「固定到主页」, 「打开文件夹」, 「复制路径」, —, 「删除」 (danger: red fill on hover).
- Empty: `new-instance.svg` (axolotl + cyan `#94E6E4` plus block) 160 px + 「未找到实例」 + pink 「＋ 创建新实例」.

**Instance page** (`/instance/:id`), pane coordinates (window = pane + (64, 48)):

```
y 24  header (p 24 / right 8 / bottom 16): [64 icon] 实例名 24/600 lh1       [▷ 开始游戏 xl ≈126×48][⚙ 48 white disc][⋮]
          stats 16/500: [BoxIcon 16] 26.2 • [loader icon 16] Fabric 0.17.2 • 37 hours   (actions top-aligned, gap 8)
y 104 1px #dddddd divider
y 121 NavTabs with icons: [内容 BoxesIcon][文件 FolderOpenIcon][截图 ImageIcon][世界 GlobeIcon][日志 TerminalSquareIcon]  (each ≈88 wide ◇)
y 183 tab content (px 24)
```

- Play-time stat is hard-coded English (「37 hours」) even in zh-CN ✔ (`timePlayedHumanized`). Server-linked instances replace the stats with players / ping / 「关联到 …」.
- Nav rail on this page: the Library slider turns white; this instance's quick-switcher circle turns pink.

**内容 tab:** toolbar (h 40): search 「搜索到 87个项目……」 · **pink 「🧭 浏览内容」** (exits to Discover `/browse/mod?i=…`) · outlined 「查看依赖关系」 · 「刷新」. Type chips (32 tall, r full, px 12, 16/600; selected 25 % pink + pink text): 「全部 87」 「模组」 「资源包」 「光影包」 「数据包」 「投影」. Table: r 20, 1 px `#fff`, `shadow-sm`; header 48 `#f8f8f8` with status tabs 「全部 · 可更新 · 已启用 · 已禁用」 (16/600; active pink + 2 px pink underline). Rows **74 tall**, alternating `#f5f5f5` / `#ededed`, 1 px `#fff` top border: [☐ 20][48 icon] title 16/600 (+ 「前置」 badge) / author 14 · version + date · [green ⬇ 「有可用更新」] [**Toggle 48 × 24: pink track, black knob**] [🗑] [⋮]. Disabled rows: grayscale + 50 % (200 ms). **Schematic rows** (`投影`, e.g. `starter_house.litematic`) carry an inline PencilIcon button **「在投影工坊中打开」** → routes straight to the workshop with that file ✔ (real portal; the Files tab right-click offers the same).

**世界 tab:** rows (`grid [auto 3fr 4fr auto] gap 8`, r 8, `#f5f5f5`, `shadow-card`, p 12): 48 px world icon · 「新的世界」 18/700 + 「[UserIcon] 单人游戏」 14/600 · 「上次游玩于10小时前」 14 · centre 「[PickaxeIcon] 生存模式」 16/600 · right **white md 「▷ 开始游戏」** + 36 ⋮ (quick-play straight **into the world**; needs MC ≥ 1.20). Arrival highlight: 1.5 px pink border + glow, fading over 4 s. World editor has a monospace 「世界种子」 field (thematic bridge to 种子地图; no code link).

**日志 tab:** viewport r 20, `#f5f5f5`, mono 12/17, 52 px gutter `#f8f8f8`; colours: timestamp `#1f68c0`, INFO `#00af5c`, WARN `#e08325`, ERROR `#cb2245` (error/warn lines tinted 10 %); filter pills 「错误 · 警告 · 信息」 all pink-tinted by default. **Empty state: 「暂无日志」 / 「点击右上角「开始游戏」即可接收实时日志」** — the console points at the button's (empty) spot.

**Create 「创建实例」 modal** (550 wide, r 16, opens from the click): 80 px icon preview that **swaps with the loader chip** (grass block → Fabric scroll → NeoForge fox → Forge anvil → Quilt patchwork); fields 名称 (auto 「26.2-Fabric」) · 游戏目录 · 游戏版本 chips 「正式版 · 快照版 · 愚人节版 · 远古版」 · 加载器 chips 「None · Fabric · NeoForge · Forge · Quilt · OptiFine · Cleanroom · LiteLoader · Legacy Fabric · Babric」 (vanilla shows untranslated 「None」) · pink 「＋ 创建实例」 bottom-right.

### 4.5 Lab (实验室) index

**Current code (1.9.7)** — `pages\Lab.vue` ✔: `main p-6 gap-6` → header h1 「实验室」 24/700 + 「6 个工具」 14 tertiary → filter row (gap 8): StyledInput 「搜索工具」 (36, flex-1, min 224) + two 192 px Combobox 「全部工具」 「全部」 → **vertical list** of 6 cards, gap 12.

```
┌ .card #f8f8f8 · 1px #fff · r16 · p16 · flex items-end gap16 · 146 tall ──────────────────────────────┐
│ ┌──────────────┐ 投影工坊 (18/700, pr 40 for the star)                                   [☆ 32×32] │
│ │ cover 224×112│ 快速预览、编辑你的投影 (14/20 tertiary, 2-line clamp)                              │
│ │ r16 cover    │ [创作]  ← TagItem                                              [› 进入] pink sm  │
│ └──────────────┘                                                         80×32 r10, chevron left │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
hover: border #dddddd + brightness(1.05), 200 ms · favourite star → filled pink
```

Order (registry): 皮肤编辑器 (创作) · 渐变文字生成器 (创作) · **种子地图 (世界)** · **投影工坊 (创作)** · 模组翻译 (维护) · 配方生成器 (创作); favourites float to the top. At a 1440 × 900 window: first card at y ≈ 212, one every 158 px ◇. ✎ Six identical pink 「› 进入」 buttons in a column = a natural hiding place for the hero.

**Legacy grid (screenshot and website only):** 「3 个工具」; search + one combobox; 3 columns ≈386 wide; 2:1 covers with only the top corners rounded and a white category chip at the cover's top-right; no star, no 「进入」. Its starfield-projector 投影工坊 cover no longer exists in the repo (crops in `E:\GitHub\Axolotl-animation\research\_scratch\old-lab-cover-schematic.png`).

**Covers** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\`): every cover = Minecraft render + one centred white line glyph. 种子地图 = hill-shaded biome map + map-pin glyph (softer palette than the in-app map); 投影工坊 = isometric redstone build + cyan `#00F8F8` wireframe ghost blocks + projector-on-tripod glyph (`research\ref\cover-schematic.png`).

### 4.6 种子地图 (seed map) and markers

`pages\LabSeedMap.vue`. Page `max-w 1760, p 16, gap 12`:
1. Header: 「种子地图」 20/700 + 「Java 版 26.2 · 主世界」 12 tertiary; right: scale badge **「1 像素 = 4 格」** (min-w 120, 1 px `#ddd`, r 8, `#f5f5f5`, 11.2/700) + ⓘ 36.
2. Toolbar card (1 px `#ddd`, r 12, `#f5f5f5`, p 12): 版本类型 「Java 版」 · 游戏版本 「26.2」 · 种子 [# 「10292992」 input][⟳ 随机种子][history][⇩ 从实例导入] │ 维度 segmented h 40 「主世界 / 下界 / 末地」 (active = pink) · 坐标 X / Z h 40 + **pink 「🧭 前往」** · 深度 · 「复制地图链接」.
3. Layer strip (min-h 64, `#f8f8f8`, r 12 12 0 0, shadow `0 8px 20px rgba(0,0,0,.2)`): 「地图图层」 + [结构 | 矿物] switch + 👁 + ⌄ + a row of 40 × 36 **pink** sticker toggles (on and off both pink ✔, beyond-zoom layers at 68 %).
4. Canvas shell (`#f5f5f5`, r 0 0 12 12): canvas ≈ **1344 × 527** at 1440 × 900 ◇; ruler tabs on the top/left edges; left stack [+ / − / 🧭 居中显示出生点] and right stack [⤢ 全屏 / ⚖ 测量距离 / ⚙ 地图设置] (r 12, `#f8f8f8`, `0 8px 20px rgba(0,0,0,.28)`, 36 px circle buttons); status pill top-centre 「⟳ 加载中」; bottom toolbar (r 12, `#f8f8f8`): 群系高亮 toggle · 「选择群系」 · 「地形估算」 (pink chip, on by default) · 「显示网格」 · 「搜索附近」.

**Rendering ✔:** native 256 × 256 cubiomes tiles, `imageSmoothingEnabled = false` + `image-rendering: pixelated`; hillshade multiplies brightness 0.72–1.4 (north-west slopes lighter). Zoom −2…4, `scale = 4^zoom` blocks per screen px; default zoom 1 (「1 像素 = 4 格」); **at zoom −2 one block = 16 screen px = one Minecraft texture** (✎ natural "map pixel → 3D block" bridge to the workshop). Draw order: tiles → grid → structures/ores → spawn → **markers** → ruler. Defaults: seed `10292992`, Java 26.2, overworld, hillshade on, spawn shown and selected.

**Map glyphs:** structure stickers drawn 28 px (32 selected + white 2 px ring), shadow `rgba(0,0,0,.48)` blur 5 offsetY 2; spawn = Minecraft compass sticker 32 px (36 selected); ruler = `#F2B84B` 2 px dashed `[6,4]` with 4 px end dots and pill 「⚖ 123 格」.

**MARKER ✔** (`drawMarkers`, exact):

```js
ctx.fillStyle = marker.color            // user-chosen <input type=color>; default '#22C55E'; '#db2777' is legal
ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2
ctx.beginPath()
ctx.arc(x, y - 3, 7, 0, 2 * Math.PI)     // head: 14 px circle, centre 3 px ABOVE the map point
ctx.moveTo(x - 4, y + 2); ctx.lineTo(x, y + 11); ctx.lineTo(x + 4, y + 2)   // tail, tip 11 px BELOW
ctx.fill(); ctx.stroke()                 // white ring drawn over the tail top; tail has white side edges
// label (only while 显示图层名称 is on): rect rgba(20,22,26,.86) at (x+10, y-12), 22 px tall,
// width = text + 10, sharp corners; text '600 11px system-ui' white, left at x+15, middle at y-1
```

≈16 × 23 px pin; no selected-state change on the pin itself; hit radius 13 px. Reference render with pink pins and a 「启动按钮」 label: `E:\GitHub\Axolotl-animation\research\_scratch\seedmap-canvas-glyphs-3x.png`.

**Creating a marker (real flow):** right-click (or 650 ms long-press) → popup at point +14/+14 (272 wide, r 12, `#f8f8f8`, 1 px `#ddd`, `0 12px 28px rgba(0,0,0,.28)`, p 12): title 「位置」, subtitle 「X 120, Z -64」 → draft row [「标记名称」 input][36 × 36 colour square, r 8] → actions **[📌 PinIcon 「添加标记」 pink 2xs (24 tall)]** + [「复制 /tp」 outlined 2xs] → pin appears, popup title becomes the marker name, toast **「标记已保存」**. Saved markers list under 「⚙ 地图设置 → 标记」.

### 4.7 投影工坊 (schematic workshop) viewer

`pages\LabSchematicPreview.vue` + `lab\schematic-preview\scene.ts`. Accepts **`.litematic`** and Sponge **`.schem`** v2/v3 only.

- **Empty state:** page `#ebebeb`; `no-documents.svg` illustration (pale, ≤ 200 tall); h2 「编辑 Minecraft 投影」 24/600; 「打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。」 14 tertiary; [FileArchiveIcon **「打开文件」** pink md] [FolderSearchIcon 「从实例选择」 outlined md]; optional 「最近的投影」 list.
- **Drop overlay ✔ ("落入投影工坊" is literal UI):** inset 12 px, **2 px dashed `#db2777`**, r 12, bg `color-mix(#ebebeb 88%, transparent)`, centred pink bold `[FileArchiveIcon 24] 松开以打开投影`.
- **Loading:** 4 px bar at the very top (track `#dddddd`, fill pink; 12 % → 38 % → 38 % + 62 % × mesh progress, 200 ms width transition) through 「正在解析投影」 → 「正在读取资源」 → 「正在生成模型 n / N」.
- **Loaded layout:** toolbar min-h 68 (`#f5f5f5`, 1 px `#ddd` bottom): filename 16/600 + TagItem 「Litematic v6」 + 「W × H × L · N 方块」 12 px; right [↶ | ↷] (36 circles in a 1 px r 12 group) · 「打开 ⌄」 · 「导出投影 ⌄」 · 「⋯」 (unframed ◇). Workbench grid **`1fr | 340px`**: viewport ≈ 1036 × 768 at 1440 × 900 ◇ + inspector (`#f5f5f5`, p 12): Tabs 「编辑 · 材料」; sections 已选方块 · 可见性 · 编辑 (**pink 「替换所选」**, red outlined 「删除所选」) · 整体变换.
- **Glass overlays on the dark stage** (1 px `#ddd`, r 12, p 4, `rgba(235,235,235,.9)` + `backdrop-filter: blur(12px)`, `shadow-card`): mode toolbar top-centre 「单选 · 框选 · 测量 │ 层间距」 (2xs; active = pink tint + pink label); vertical Y-layer slider at left (pink thumb); view buttons bottom-right (24 px circles: 复位视角 · 切换相机投影 · 显示网格 · 显示区域边界 · 显示透明方块 · 切换全屏); status bar bottom 28 px (`#f5f5f5` 90 % + blur 8, 11.5 px: 「x, y, z · 方块名 · 已选 1 个」).

**3D viewer parameters ✔:**

| Aspect | Value |
|---|---|
| Background | clear colour **`#0a0a0a`** in both themes |
| Colour | sRGB output, **ACESFilmic**, exposure **1.5** |
| Lights | ambient `#ffffff` .8 · hemisphere sky `#87ceeb` / ground `#444444` .6 · key directional `#fffbf0` **4.0** · fill `#ffffff` .3 |
| Blocks | real Minecraft block models (deepslate) textured from the 2048 × 2128 vanilla atlas with **NearestFilter** (pixelated); translucent blocks at .68 |
| Face brightness ◇ | top 1.0 · left (+Z) ≈ .78 · right (+X) ≈ .57 (good CSS-3D cube multipliers) |
| Grid floor | cells every block `#404040` @ .72; sections every 12 blocks `#6b6b6b` @ .9 |
| Region bounds | `#58736a` @ .52 (hidden while layer spacing > 0) |
| **Selection** | outer faces in `--color-brand` @ **.24** (double-sided, not tone-mapped) + **solid brand edge lines** on top; multi-block also a brand box @ .65 |
| Camera | perspective **FOV 50°**; fit view = target centre, camera at centre + (m, 0.8 m, m), m = max(size, 4) → a 3/4 view from +X+Z ≈ 30° above the horizon; orthographic toggle |
| 层间距 | each block's Y += (y − floorY) × t, t 0–100 % (exploded stack) — ✎ built-in "unfolding" move |

### 4.8 Cameo-worthy pages (one line each)

- **皮肤选择器** (`/skins`): 3D player; a click plays `interact` + wobble; ≥ 2 clicks/s for 5 energy flashes it red `#bd2f2f` (hurt gag); signed-out card has the 144 px axolotl logo perched on top.
- **多人游戏**: local-server cards carry a literal **「启动」** button (decoy gag: "wrong 启动"); rooms via 陶瓦联机 / 红石联机 with codes like 「U/ABCD-EFGH-IJKL-MNOP」; console empty state 「欢迎使用 Axolotl 服务器！」/「点击启动按钮即可启动服务器！」.
- **下载**: job cards with 8 px pink progress bars (25 % pink track) and badges 「● 进行中」/「● 排队中」/「● 已完成」; onboarding line **「没有东西会失踪」** / 「安装和内容下载都会在这里报到，不会神秘消失。」.
- **截图中心**: 16:9 cards; multi-drag "drag-gather" flies cards into a deck at the cursor (500 ms `(.2,.8,.2,1)`).
- **设置 › 外观 › 强调色**: chips 粉色 · 橙色 · 绿色 · 蓝色 · 紫色 · 跟随系统 · 自定义; the hue-slider thumb is a 20 px pink circle with a 3 px white border — a tiny double of the hero.
- **设置 › 关于**: 256 px 3D scene with the swimming voxel axolotl (`public\models\axolotl.gltf`, clip `swim`) over pink water lines and rising ring bubbles; 「你的最后一款启动器。」; long-press a team member (800 ms, 4 px pink ring) → mini-games 合成美西螈 (「点击场地，投放粉色美西螈」) / 美西螈快跑.
- **Onboarding welcome** (`OnboardingWelcome.vue`): end-card template — logo `scale .72 → 1.04 → 1` (900 ms expo-out), wordmark 「Axolotl」(800) 「Launcher」(650) unrolls 900–1950 ms, a pink copy wipes away left→right at 2050 ms / 2400 ms, lift 2240–3200 ms, panel with a 2 px pink line at 3200 ms.
- **Onboarding spotlight**: rounded hole in a 55 % black scrim + 2 px pink corner brackets breathing at 1.015 — a ready "cursor lock-on" frame.
- **Splash**: forced dark, logo ≤ 288 px over a maze cube — the cube is Modrinth-inherited art; do not use.

---

## 5. Asset inventory

Licensing: ✅ Axolotl's own or permissive · ⚠ in-UI only, third-party or Mojang content · ⛔ never.

### 5.1 Use

| Asset (absolute path) | What it is | Film use | Lic. |
|---|---|---|---|
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.svg` | Master vector logo (viewBox 566.9², 110 flat polygons), head facing left | Title-bar logo (24 × 24 box, art ≈ 19 × 14); end card (~176 px). At large sizes add a 0.5–0.8 unit same-colour stroke to hide polygon seams ✎ | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.png`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl.png` | 1024² renders (byte-identical; the second has unambiguous Axolotl provenance) | raster fallback | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\axolotl-macos.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\Axolotl.icon\Assets\AXL(fixed).svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\icon.png` | App-icon art (white tile rx 185/824; macOS 26 squircle art) | Dock/app-icon beat, end card alt | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\models\axolotl.gltf` | Blockbench voxel axolotl, 64² nearest texture, clip `swim` | "behind the UI" underwater cameo | ✅ (texture vanilla-derived ◇) |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-searching.svg` / `axo-teaching.svg` | Onboarding mascot with pixel magnifier / mortarboard + book | search beat; "启动按钮去哪了？" face | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\icons\new-instance.svg` | Axolotl + cyan `#94E6E4` plus block (library empty state) | create / empty beats | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-balls\pinkball.png` (+ yellow, cyan, red, blue, super) | 2054² glossy disc badges with the axolotl | "button curls into a ball" reference | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-run\axolotl.webp` | 200 × 142 sprite (faces right) | runner cameo | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\recipe-generator\assets\datapack.png` | Gold axolotl + 「AXOLOTL」 wordmark | recipe / item beat | ✅ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\*.svg` (map: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\generated-icons.ts`); film copy `E:\GitHub\Axolotl-animation\src\assets\icons\` | Lucide-style UI icons | all UI | ✅ ISC/MIT |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\*.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\categories\*.svg` | Loader / category tag icons | card tags, filters (copy into the film when needed) | ✅ |
| `E:\GitHub\Axolotl-animation\public\fonts\Inter-*.woff2` (+ `Inter-LICENSE.txt`), `E:\GitHub\Axolotl-animation\public\fonts\NotoSansSC-subset.woff2` | Inter 3.019; Noto Sans SC (GB2312 subset) | all UI text | ✅ OFL |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\grass-block.png`, `Fabric.png`, `anvil.png`, `NeoForge.png`, `Quilt.png`, `stone.png` (+ 18 item renders) | Default instance icons (frameless pixel art) | library / instance / create-modal morphs | ⚠ Mojang-derived renders + loader logos |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\*-cover.png` | Six Lab covers | Lab cards | ⚠ Minecraft renders + own glyphs |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\schematic-preview\assets\vanilla\texture-atlas.png` + `texture-layout.json` | 2048 × 2128 atlas, 2,859 named 16 px block textures (`block/grass_block_top` → [432,1968,16,16] …; grass/leaves untinted, tint e.g. `#91BD59` ◇) | CSS-3D blocks, workshop build, the world | ⚠ Mojang |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\seed-map-assets\structures\*.webp` (27 × 80², incl. `spawn_point.webp` compass), `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\seed-map-assets\biomes\*.webp` (65 × 512² floating-island dioramas), `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\seed-map-assets\ores\*.png` | Map stickers and dioramas | seed-map scene | ⚠ MinecraftSearch credit; Mojang |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\minecraft-preview.png` | 1920 × 1200 in-game landscape (the only "inside the world" image in the repo) | 「进入世界」 plate reference | ⚠ Mojang; prefer a built voxel world ✎ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\illustrations\no-documents.svg` etc. | Theme-adaptive empty-state art | workshop empty state | ⚠ inherited, neutral |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\public\showcase\launcher-home.webp`, `axolotl-lab.png`, `theme-accent.png`, `account-login.png` | Hi-res reference screenshots (3104 × 1814 / 2560 × 1489) | reference only | — |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\font\minecraft_font.ttf` | "Minecraft" by Pwnage_Block, Latin only | in-world Latin text with credit | ⚠ CC BY-SA 3.0 |

Reference renders (not product captures): `E:\GitHub\Axolotl-animation\research\_scratch\03-shell-home\protagonist-mock.png` · `E:\GitHub\Axolotl-animation\research\_scratch\01-design-tokens-specimen.html` · `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\scene-a-browse.png` / `scene-b-browse-cart.png` / `scene-c-project.png` / `scene-d-parts.png` · `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-instance-page.png` / `05-mock-library-page.png` / `05-mock-worlds-logs.png` / `05-mock-create-modal.png` · `E:\GitHub\Axolotl-animation\research\_scratch\06-mock-lab-index-current.png` · `E:\GitHub\Axolotl-animation\research\_scratch\seedmap-canvas-glyphs-3x.png` · `E:\GitHub\Axolotl-animation\research\_scratch\seedmap-cubiomes-palette.png` · `E:\GitHub\Axolotl-animation\research\_scratch\seedmap-structures-sheet.png` · `E:\GitHub\Axolotl-animation\research\_scratch\seedmap-biomes-sheet.png` · `E:\GitHub\Axolotl-animation\research\_scratch\atlas-samples.png` · `E:\GitHub\Axolotl-animation\research\_scratch\mascots.png` · `E:\GitHub\Axolotl-animation\research\_scratch\axolotl-balls-sheet.png`.

### 5.2 Caution (show only the way the app shows them; keep the disclaimer)

- Minecraft textures, renders and the in-game screenshot (Mojang): incidental, in-UI only. End card must carry 「非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。」.
- Seed-map structure and biome art: credited to **MinecraftSearch** in-app and in `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\COPYING.md`.
- Loader logos (Fabric, Forge, NeoForge, Quilt, OptiFine, Cleanroom, LiteLoader): third-party marks inside the UI only.
- Real mod icons and names (Sodium etc.): remote, author-owned; use neutral stand-ins or plain names ✎.
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\Minecraft_AE.ttf` (16 MB CJK pixel font): **no licence string**; do not use for titles.
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\COPYING.md` still lists `branding/*` as Rinth-reserved (stale text inherited from Modrinth; the root `COPYING.md` says Axolotl's brand is maintained separately ◇).

### 5.3 Do not use ⛔

| Path / item | Why |
|---|---|
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\logo.svg` (exported as `ModrinthIcon`) | **Modrinth** wrench-in-labyrinth logo |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\omorphia.svg` | Modrinth design-system mark |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\.github\assets\*` (`app_cover.png`, `web_cover.png`, `api_cover.png`, `monorepo_cover.png`, `codeflow-logo.png`) | Modrinth banners, sponsor logo |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\modrinth-3d\*` (esp. `wrench-rinth.png`, `mr-pack.png`) | Modrinth-made art and marks |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\loading\cube.png` | Modrinth-inherited splash maze cube ◇ |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\external\*` (e.g. `curseforge.svg`), Java-vendor and launcher logos | third-party trademarks |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\data\about\avatars\*`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\easteregg\*` | real people's likeness; off-brand tank game |
| Anything from `cdn-raw.modrinth.com` (fonts, `https://cdn-raw.modrinth.com/landing-new/landing.webp`) | Modrinth CDN |
| UI strings containing "Modrinth" (「在 Modrinth 中打开」, offline message, 「在 Modrinth 上浏览整合包…」) and the dormant Friends UI | Modrinth branding / not a product feature |
| Website pinks `#c72f6c` / `#ff82b2` on app UI | wrong pink |
| Settings modal with 12 colour dots (v1.6.0) as "current" UI | no longer exists |

---

## 6. zh-CN copy deck (verbatim)

Generated by script from `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json` (`message`) and `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json` (`defaultMessage`); every id resolved (0 missing). ICU placeholders are kept; fill them with plausible values (e.g. `{seconds, number}` → 3; `{count}` → 1).

### 6.1 Protagonist family (launch / play states)

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `button.play` (ui) | 开始游戏 | hero label; every play button |
| `app.home.calendar.play` (app) | 启动 | tooltip of the 24px calendar play glyph |
| `app.servers.action.start` (app) | 启动 | local-server card button |
| `app.instance.loading` (app) | 实例正在加载…… | HomeMinimal busy state (white, 50%) |
| `app.instance.starting` (app) | 正在启动…… {seconds, number} 秒 | instance-page launching (pink, 50%) |
| `button.stop` (ui) | 停止 | running (red) |
| `app.instance.stopping` (app) | 正在停止…… | stopping (red, 50%) |
| `label.installing` (ui) | 安装中…… | installing |
| `button.install` (ui) | 安装 | not installed |
| `button.repair` (ui) | 修复 | broken install |
| `app.instance.launch-instance` (app) | 启动实例 | server-instance dropdown item |
| `app.instance.join-server` (app) | 加入服务器 | server-instance dropdown item |
| `app.instance.offline-installed-only` (app) | 离线模式只能启动已完整下载的实例。 | offline tooltip |
| `app.instance-item.already-open` (app) | 实例已经在运行 | row tooltip |
| `instance.worlds.play_instance` (app) | 游玩实例 | row menu item |
| `app.home.minimal.change-instance` (app) | 更换主页实例 | 48px list button tooltip (the neighbour) |
| `app.action-bar.no-instances-running` (app) | 没有运行中的实例 | title-bar pill, idle |
| `app.action-bar.stop-instance` (app) | 停止实例 | title-bar pill, running |
| `app.action-bar.view-logs` (app) | 查看日志 | title-bar pill, running |
| `console.empty.instance-title` (ui) | 暂无日志 | Logs tab empty state |
| `console.empty.instance-description` (ui) | 点击右上角「开始游戏」即可接收实时日志 | Logs tab empty state (points at the button) |
| `console.empty.server-description` (ui) | 点击启动按钮即可启动服务器！ | server console empty state |

### 6.2 Shell / navigation

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.navigation.home` (app) | 主页 | nav 1 |
| `app.navigation.screenshots` (app) | 截图中心 | nav 2 |
| `app.navigation.worlds` (app) | 世界 | nav (hidden by flag) |
| `app.navigation.discover-content` (app) | 发现内容 | nav 3 |
| `app.navigation.skin-selector` (app) | 皮肤选择器 | nav 4 |
| `app.navigation.multiplayer` (app) | 多人游戏 | nav 5 |
| `app.navigation.library` (app) | 实例库 | nav 6 |
| `app.navigation.lab` (app) | 实验室 | nav 7 |
| `app.navigation.downloads` (app) | 下载 | nav 8 |
| `app.navigation.create-instance` (app) | 创建新实例 | bottom group |
| `label.settings` (ui) | 设置 | bottom group |
| `app.home.breadcrumb` (app) | 主页 | breadcrumb on Home |
| `app.sidebar.collapse` (app) | 收起边栏 | panel handle tooltip |
| `app.sidebar.expand` (app) | 展开边栏 | panel handle tooltip |
| `app.minecraft.playing-as` (app) | 当前游玩账号： | right panel heading |
| `minecraft-account.label` (app) | Minecraft 账户 | right panel account sub-line |
| `app.action-bar.announcements` (app) | 公告 | title-bar 36px newspaper button |

### 6.3 Home

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.home.greeting.minimal.with-player` (app) | {greeting}，{name} | Minimal greeting format |
| `app.home.greeting.minimal.late-night` (app) | 夜深了 | 00:00-04:59 |
| `app.home.greeting.minimal.dawn` (app) | 清晨好 | 05:00-07:59 |
| `app.home.greeting.minimal.morning` (app) | 早上好 | 08:00-11:59 |
| `app.home.greeting.minimal.afternoon` (app) | 下午好 | 12:00-16:59 |
| `app.home.greeting.minimal.evening` (app) | 傍晚好 | 17:00-20:59 |
| `app.home.greeting.minimal.night` (app) | 晚上好 | 21:00-23:59 |
| `app.home.greeting.with-player` (app) | {name}，{greeting} | showcase-era Home format |
| `app.home.layout.switch-to-minimal` (app) | 切换到极简主页 | layout switch tooltip |
| `app.home.layout.switch-to-information` (app) | 切换到信息主页 | layout switch tooltip |
| `app.home.widgets.customize` (app) | 自定义小组件 | floating pill tooltip |
| `app.home.recent.title` (app) | 从最近的项目开始 | widget / section |
| `app.home.instances.pinned` (app) | 固定的实例 | widget / section |
| `app.home.instances.view-all` (app) | 查看全部实例 | link |
| `app.home.worlds.pinned` (app) | 固定的世界 | widget / section |
| `app.home.servers.pinned` (app) | 固定的服务器 | widget |
| `app.home.calendar.title` (app) | 日历 | widget |
| `app.home.calendar.played-on` (app) | {date}你游玩了： | calendar list heading |
| `app.home.insights.title` (app) | 游玩洞察 | right panel |
| `app.home.challenge.title` (app) | 每日小挑战 | right panel |
| `app.home.news.title` (app) | Minecraft 新闻 | right panel |
| `app.instance.played` (app) | 游玩于 {time} | Minimal card meta |
| `app.instance.never-played` (app) | 从未游玩 | Minimal card meta |
| `label.played` (ui) | 上次游玩于{ago} | row meta |
| `label.singleplayer` (ui) | 单人游戏 | world row |
| `instance.worlds.game_mode.survival` (ui) | 生存模式 | world row |
| `app.home.minimal.picker.title` (app) | 选择主页实例 | modal |
| `app.home.minimal.choose-instance` (app) | 选择实例 | empty card |

Greeting lines that fit the story (each id holds 16 lines; a line is chosen per day and time bucket): `app.home.greeting.morning` #11 **「下一个项目只差一次启动。」** · #14 「工作台正在待命。」 · #15 **「地图在等新的标记。」** · `app.home.greeting.evening` #15 **「下一块方块该你放下。」** (the showcase line) · `app.home.greeting.afternoon` #3 「世界已准备好接住你的下一步。」 · #15 「下一章从这里开始。」 · `app.home.greeting.dawn` #2 「新的一天正在加载。」 · #16 「下一局已经准备好，等你出发。」 · `app.home.greeting.late-night` #16 「这个世界已经为你保存好了。」 · `app.home.greeting.night` #16 「开始一段值得的游戏时光吧。」. Full lists: report 03 §8.2.

### 6.4 Discover (Browse) / project page / install

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.browse.project-type.modpacks` (app) | 整合包 | tab 1 |
| `app.browse.project-type.mods` (app) | 模组 | tab 2 |
| `app.browse.project-type.resourcepacks` (app) | 资源包 | tab 3 |
| `app.browse.project-type.datapacks` (app) | 数据包 | tab 4 |
| `app.browse.project-type.maps` (app) | 地图 | tab 5 |
| `app.browse.project-type.shaders` (app) | 光影包 | tab 6 |
| `app.browse.project-type.servers` (app) | 服务器 | tab 7 |
| `app.browse.project-type.favorites` (app) | 收藏夹 | tab 8 |
| `browse.search.placeholder` (ui) | 搜索{projectType}…… | renders 搜索模组…… on the 模组 tab |
| `app.browse.choose-instance` (app) | 选择实例 | instance button and card state |
| `app.browse.source.all` (app) | 所有来源 | source switcher default |
| `label.sort-by` (ui) | 排序方式 | sort tooltip |
| `browse.sort.relevance` (ui) | 相关性 | default sort |
| `app.project.translation.translate` (app) | 翻译 | quiet xl button |
| `app.browse.selected` (app) | 已选择 | card state (green) |
| `label.installed` (ui) | 已安装 | card state (disabled) |
| `app.browse.add` (app) | 添加 | compact card |
| `label.selected` (ui) | 已选 | project-page state |
| `browse.selected-projects-floating-bar.selected-count` (ui) | {count, plural, other {#个已选择的项目}} | cart bar |
| `button.clear` (ui) | 清除 | cart bar |
| `app.browse.install-selected` (app) | 安装 {count} 个内容 | cart bar pink button |
| `app.content-install.preview.header` (app) | 确认安装 | confirm modal |
| `app.install.phase.downloading_content` (app) | 正在下载内容 | toast status |
| `browse.loading-results` (ui) | 正在加载结果…… | loading row |
| `browse.no-results.heading` (ui) | 这里还是空的 | empty results |
| `app.browse.fuzzy-search.prefix` (app) | 未找到「{original}」的结果，已为您显示 | fuzzy notice part 1 |
| `app.browse.fuzzy-search.suffix` (app) | 的相关结果 | fuzzy notice part 2 |
| `project.download-count-tooltip` (ui) | {count, number} {count, plural, other {次下载}} | stat tooltip |
| `header.category.category` (ui) | 类别 | filter section |
| `search.filter_type.game_version` (ui) | 游戏版本 | filter section |
| `search.filter_type.mod_loader` (ui) | 加载器 | filter section |
| `app.browse.instance-selector.title` (app) | 选择一个实例 | modal |
| `app.onboarding.discover.description` (app) | 整合包、模组、插件、资源包、光影：这才是值得掉进去的坑。 | brand voice |

### 6.5 Library / instance page

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.library.tabs.all-instances` (app) | 全部实例 | tab |
| `app.library.tabs.modpacks` (app) | 整合包 | tab |
| `app.library.tabs.servers` (app) | 服务器 | tab |
| `app.library.tabs.custom` (app) | 自定义 | tab |
| `app.instances.search` (app) | 搜索 | search placeholder |
| `app.library.group.new` (app) | 新建分组 | base md button |
| `app.library.create-instance` (app) | 创建新实例 | pink md button |
| `app.library.no-instances` (app) | 未找到实例 | empty state |
| `app.instance.tabs.content` (app) | 内容 | instance tab 1 |
| `app.instance.tabs.files` (app) | 文件 | instance tab 2 |
| `app.instance.tabs.screenshots` (app) | 截图 | instance tab 3 |
| `app.instance.tabs.worlds` (app) | 世界 | instance tab 4 |
| `app.instance.tabs.logs` (app) | 日志 | instance tab 5 |
| `app.instance.settings` (app) | 实例设置 | 48px settings disc tooltip |
| `content.page-layout.search-placeholder` (ui) | 搜索到 {count, number}个{contentType}…… | content search (contentType renders 项目) |
| `content.page-layout.browse-content` (ui) | 浏览内容 | pink button, exits to Discover |
| `content.page-layout.view-dependencies` (ui) | 查看依赖关系 | outlined button |
| `button.refresh` (ui) | 刷新 | outlined button |
| `project-type.all` (ui) | 全部 | type chip |
| `project-type.mod.category` (ui) | 模组 | type chip |
| `project-type.schematic.category` (ui) | 投影 | type chip (schematics) |
| `content.filter.updates` (ui) | 可更新 | status tab |
| `content.filter.enabled` (ui) | 已启用 | status tab |
| `content.filter.disabled` (ui) | 已禁用 | status tab |
| `label.update-available` (ui) | 有可用更新 | green download-icon tooltip |
| `instance.files.open-in-schematic-workshop` (app) | 在投影工坊中打开 | pencil / context-menu portal to 投影工坊 |
| `app.instance.worlds.browse-servers` (app) | 浏览服务器 | worlds toolbar |
| `app.instance.worlds.browse-maps` (app) | 浏览地图 | worlds toolbar |
| `app.world-editor.section.seed` (app) | 世界种子 | world editor section |
| `app.onboarding.library.title` (app) | 你的启动书架 | brand voice |
| `app.onboarding.instance-actions.title` (app) | 主操作台 | brand voice |

### 6.6 Lab (实验室) index

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.lab.title` (app) | 实验室 | page title |
| `app.lab.tool-count` (app) | {count} 个工具 | renders 6 个工具 (legacy screenshot: 3 个工具) |
| `app.lab.search` (app) | 搜索工具 | search placeholder |
| `app.lab.category.all` (app) | 全部工具 | combobox |
| `app.lab.category.creation` (app) | 创作 | category chip |
| `app.lab.category.maintenance` (app) | 维护 | category chip |
| `app.lab.category.world` (app) | 世界 | category chip |
| `app.lab.favorite-filter.all` (app) | 全部 | combobox |
| `app.lab.enter` (app) | 进入 | pink sm button on every card |
| `app.lab.no-results` (app) | 没有匹配的工具。 | empty state |
| `app.lab.skin-editor.title` (app) | 皮肤编辑器 | tool 1 |
| `app.lab.skin-editor.description` (app) | 在本地创建和编辑 Minecraft 玩家皮肤。 | tool 1 |
| `app.lab.gradient-text.title` (app) | 渐变文字生成器 | tool 2 |
| `app.lab.gradient-text.description` (app) | 无需浏览器即可创建适用于 Minecraft 的渐变文字。 | tool 2 |
| `app.lab.seed-map.title` (app) | 种子地图 | tool 3 |
| `app.lab.seed-map.description` (app) | 在本地查看 Minecraft 种子的群系、结构和保存的标记。 | tool 3 |
| `app.lab.schematic-preview.title` (app) | 投影工坊 | tool 4 |
| `app.lab.schematic-preview.description` (app) | 快速预览、编辑你的投影 | tool 4 (no full stop in source) |
| `app.lab.mod-translation.title` (app) | 模组翻译 | tool 5 |
| `app.lab.mod-translation.description` (app) | 把任意 Minecraft 模组 JAR 翻译成简体中文。 | tool 5 |
| `app.lab.recipe-generator.title` (app) | 配方生成器 | tool 6 |
| `app.lab.recipe-generator.description` (app) | 轻易地修改合成表，自定义配方，生成数据包。 | tool 6 |

### 6.7 种子地图 (seed map)

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.lab.seed-map.edition.java` (app) | Java 版 | version-type combobox |
| `app.lab.seed-map.dimension.overworld` (app) | 主世界 | segmented control |
| `app.lab.seed-map.map-scale` (app) | 1 像素 = {scale} 格 | scale badge (default renders 1 像素 = 4 格) |
| `app.lab.seed-map.go` (app) | 前往 | pink h40 button with compass icon |
| `app.lab.seed-map.layers` (app) | 地图图层 | layer strip heading |
| `app.lab.seed-map.spawn-point` (app) | 出生点 | compass sticker layer |
| `app.lab.seed-map.center-spawn` (app) | 居中显示出生点 | left control stack |
| `app.lab.seed-map.search-nearby` (app) | 搜索附近 | bottom toolbar |
| `app.lab.seed-map.add-marker` (app) | 添加标记 | pink 2xs button with PinIcon |
| `app.lab.seed-map.marker-name` (app) | 标记名称 | input placeholder |
| `app.lab.seed-map.marker-color` (app) | 标记颜色 | colour square aria label |
| `app.lab.seed-map.marker-saved` (app) | 标记已保存 | success toast |
| `app.lab.seed-map.copy-teleport` (app) | 复制 /tp | outlined 2xs button |
| `app.lab.seed-map.world-seed-loaded` (app) | 已载入世界 {world} 的种子 | toast after 从实例导入 |

Also (from report 06, verbatim): popup title 「位置」, subtitle 「X 120, Z -64」, panels 「地图设置」 → 「标记」, empty 「暂无保存的标记」, dimensions 「下界」 「末地」, scale examples 「1 像素 = 4 格」.

### 6.8 投影工坊 (schematic workshop)

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.lab.schematic-preview.empty.title` (app) | 编辑 Minecraft 投影 | empty state heading |
| `app.lab.schematic-preview.open-file` (app) | 打开文件 | pink md button |
| `app.lab.schematic-preview.from-instance` (app) | 从实例选择 | outlined md button |
| `app.lab.schematic-preview.drop` (app) | 松开以打开投影 | drop overlay, 2px dashed pink |
| `app.lab.schematic-preview.loading.parse` (app) | 正在解析投影 | progress stage 1 |
| `app.lab.schematic-preview.loading.resources` (app) | 正在读取资源 | progress stage 2 |
| `app.lab.schematic-preview.loading.mesh` (app) | 正在生成模型 | progress stage 3 |
| `app.lab.schematic-preview.selection.single` (app) | 单选 | mode tool |
| `app.lab.schematic-preview.selection.box` (app) | 框选 | mode tool |
| `app.lab.schematic-preview.layers.spacing` (app) | 层间距 | mode tool (exploded view) |
| `app.lab.schematic-preview.edit.replace` (app) | 替换所选 | pink inspector button |

Also (report 06, verbatim): 「打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。」 · 「最近的投影」 · 「已选 {count} 个」 · 「测量」 · 「删除所选」 · 「复位视角」 · 「显示网格」 · 「导出投影」.

### 6.9 Brand lines, taglines, voice

| id (pkg) | zh-CN (verbatim) | where / note |
|---|---|---|
| `app.settings.about.description` (app) | 你的最后一款启动器。 | About page |
| `app.onboarding.welcome.footer` (app) | 你的最后一款启动器 | onboarding footer; installer hero |
| `app.onboarding.welcome.title` (app) | 一切就绪 | onboarding welcome |
| `app.onboarding.welcome.description` (app) | 实例、内容、世界和下载，现在都有了同一个家。正式开玩之前，先快速逛一圈。 | onboarding welcome |
| `app.onboarding.downloads-page.title` (app) | 没有东西会失踪 | Downloads onboarding (ironic for the plot) |
| `app.onboarding.creation-confirm.description` (app) | 这里会按你的选择创建实例。我坚持不替你按确认。 | creation onboarding |
| `app.onboarding.browse.title` (app) | 搜索，不靠玄学 | browse onboarding |

Outside the app locales (verified): `E:\GitHub\Axolotl-animation\upstream\Axolotl\README.md` L4 「次世代 Minecraft 桌面客户端，全能、美观、全平台覆盖。」 and L52 「Axolotl Launcher（美西螈启动器）」 · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\locales\site.ts` L178 「你的下一个世界，从这里开始。」 · L177 「免费、开源，为 Minecraft 而生。」 · L118 「一个启动器，承载每一个世界。」 · L35–36 「管理 Minecraft 内容」/「不再绕路」 · legal L176 **「非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。」** · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\installer-ui\src\installer.html` L1363 「你的最后一款启动器」 · onboarding 「下载指挥室」 / 「安装和内容下载都会在这里报到，不会神秘消失。」 · About games 「合成美西螈」 「点击场地，投放粉色美西螈」 「美西螈搁浅了！」 「美西螈快跑」.

---

## 7. Fidelity rules for the animator

**Identity and copy**
1. The button reads **「开始游戏」**, white 16/800 on `#db2777`, with the outline PlayIcon at 24 px (+1 px). 「启动」 appears only where §3.6 lists it.
2. Every on-screen string comes from §6 (or the area reports) **verbatim**, including full-width punctuation and 「……」. No invented UI copy; narrative text and titles live outside the UI.
3. Only the voxel axolotl represents the brand. No Modrinth or CurseForge logos; no "Modrinth" text in hero shots (§5.3).

**Colour**
4. One pink: `#db2777`. Hover darkens to `#c5236b` (it never gets lighter in light theme). Disabled = 50 % opacity of the whole element. Selected tints are 25 % pink; focus rings are 4 px 68 % pink. No neon glows, gradients or website pinks on app UI.
5. Labels and icons on coloured buttons are white in light theme (black in dark). Running/stop is red `#cb2245`; success/selected-in-cart is green `#00af5c`.
6. Respect the surface ladder: chrome `#f8f8f8` above a recessed `#ebebeb` well; cards `#f8f8f8` + 1 px `#fff`; controls `#fff` + inset 1 px `#ddd`. Separation comes from hairlines; shadows stay at 3–10 % black.

**Shape and type**
7. Radii follow the component (§2.3): buttons r ≈ h/3 (8 / 10 / 12 / 14 / 16), cards 16, well/toasts/bars 20, inputs/menus 12, pills full. Never round everything the same.
8. Inter 3.19 for Latin and digits; Noto Sans SC for Chinese, capped at 600 to read like PingFang SC Semibold ✎. Never use pixel/Minecraft fonts for UI chrome.
9. Icons only from `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons` (stroke 2 at 24, round joins, `currentColor`), at 16 / 20 / 24 per component. The play triangle is **never filled** (the film's `<Icon filled>` option must not be used on PlayIcon). Filled glyphs only where the product uses them (XIcon, CubeIcon).

**Layout**
10. Keep the shell metrics (48 / 64 / 300, 48 px nav circles on a 56 px pitch, 20 px well corner) and nav order (§4.1) in every shot where the shell is visible. Keep component sizes (button heights 24/28/32/36/40/48; Browse search 48; NavTabs 46; content rows 74; library cards 80; Lab cards 146).
11. Exploding or folding the UI into 2.5D: each layer stays a flat, front-facing plane with true proportions; keep the z-order of §2.4; give slabs thin (2–6 px) sides in the product's next-darker tones; never re-letter or re-flow a component while it is "being itself".
12. One era per shot (v1.9.7; showcase-era Home only when quoting the website). Pick one Home layout per scene.

**Behaviour and motion**
13. UI reactions use product timings: 150 ms ease-out, press 0.97, hover brightness 0.9, tooltips appear after 200 ms with no fade, pages cross-fade 180 / 120 ms. Save larger motion for the hero and the finale.
14. The hero's locomotion and squash borrow product physics (inchworm 120 / 200 ms trailing edge; spring `(.15,1.4,.64,.96)`; axolotl-run squash ±16–20 %, decay ≈ 220 ms).
15. State changes follow the real order. On Minimal Home the post-click state is the **white** busy button 「实例正在加载……」, then red 「停止」; the pink counting 「正在启动…… N 秒」 exists only on the instance page. ✎ Either cut to 「进入世界」 on the press frame (scale .97) or show the real busy state, never an invented pink spinner state.
16. Pink morph targets must be real (§3.8): pills, toggles, focus rings, marker pins, selection highlights, drop overlay. A pink seed-map marker is legal; it uses the exact canvas pin geometry (§4.6).
17. Pixel art stays crisp: seed-map tiles, block textures and small icons use nearest-neighbour (`image-rendering: pixelated`), as the product does. Instance-icon art upscaled in library tiles is smooth in the product; rendering it pixelated is a deliberate, accepted deviation ✎.
18. Real Minecraft imagery appears only as product content (instance icons, map tiles, atlas blocks, covers); the end card carries the non-affiliation line.

---

## 8. Open questions and unknowns

| # | Question | Status / recommendation |
|---|---|---|
| 1 | Era for Home and Lab: current code (widget / Minimal Home; Lab list with 「进入」) or the website screenshots (pre-widget Home; 3-column Lab)? | ✎ Use current code; quote the screenshots only in a "website" shot. |
| 2 | Minimal Home instance icon: 32 px (computed from CSS cascade) vs 80 px (author intent) | ◇ Not runtime-verified. ✎ Use 32 px for fidelity; the hero's y does not change either way. |
| 3 | CJK face and weight | Product ships none; refs show PingFang SC (Semibold max). ✎ Noto Sans SC capped at 600. |
| 4 | Window size and framing | Refs = 1440 × 792. ✎ 1440 × 810 for 16:9 (+9 px y on centred content) or a floating 1440 × 792 window on the 2.5D stage; scale 1.333 at 1920 × 1080. |
| 5 | macOS chrome (traffic lights, window radius, window shadow) | OS-provided, measured only (§4.1); draw generic versions ✎. |
| 6 | 「进入世界」 imagery | Only in-repo plate is `minecraft-preview.png` (Mojang content). ✎ Build a voxel world from the block atlas or a stylised plate; keep the disclaimer. |
| 7 | Real mod icons, names, download counts (Sodium 74.62M etc. are placeholders) | Not verifiable offline; fetch live values or use neutral stand-ins ✎. |
| 8 | Seed-map layer toggles render pink when off | Verified code quirk; ✎ animate them as a row of pink stickers or treat "off" as outlined (deviation). |
| 9 | v1.9.7 row play buttons nest a native `<button>` (icon probably 16 px, no gap) | ◇ Not visually verified; ✎ use the showcase look (112 × 36, 20 px icon, 6 px gap) for white row buttons. |
| 10 | Idle running-pill dot (`bg-secondary` alias dropped in 1.9.7) | ◇ Probably invisible now; ✎ draw the showcase `#484d54` 8 px dot. |
| 11 | Workshop toolbar triggers (「打开 ⌄」 「导出投影 ⌄」 「⋯」), project-page and instance-header ⋮ | ◇ Unstyled in code (plain icon + label / bare 16 px icon). |
| 12 | Hard-coded English in zh-CN UI: play time 「37 hours」, vanilla loader chip 「None」, 「Clear all filters」, 「New instance (N)」, 「{n} items」 | Product truth; ✎ avoid framing these in hero shots. |
| 13 | Light-theme About-scene water/bubble colours (≈ `#ff0c70`), modal scrim, loading-bar end stop | ◇ Computed from shader / `color-mix` maths, not observed. |
| 14 | Origin of `loading\cube.png`; staleness of `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\COPYING.md` for the axolotl files | ◇ Inferred; brand use assumes Garbage Human Studio commissions the film. |
| 15 | Licences: MinecraftSearch art, Mojang textures, loader logos, `Minecraft_AE.ttf` | ⚠ Clear before final; keep them incidental and in-UI. |
| 16 | `美西螈快跑` exists only on `main` after 1.9.7 (unreleased) | Use its physics constants freely; avoid presenting the game as a shipped feature. |
| 17 | Nothing was observed in a running app (Tauri app not launched) | All layouts are from code + screenshots; composite widths (≈126 px twin button, ≈88 px instance tabs, ≈574 px Browse tabs) are computed. |

---

## Appendix A · File index (every short file name used above → absolute path)

Icon SVGs: the product source is listed; the film project keeps byte-for-byte copies of the plain icons in `E:\GitHub\Axolotl-animation\src\assets\icons`.

| Short name | Absolute path |
|---|---|
| `02-brand-assets.md` | `E:\GitHub\Axolotl-animation\research\02-brand-assets.md` |
| `03-shell-home-launch.md` | `E:\GitHub\Axolotl-animation\research\03-shell-home-launch.md` |
| `04-browse-search-project.md` | `E:\GitHub\Axolotl-animation\research\04-browse-search-project.md` |
| `05-library-instance.md` | `E:\GitHub\Axolotl-animation\research\05-library-instance.md` |
| `05-mock-create-modal.png` | `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-create-modal.png` |
| `05-mock-library-page.png` | `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-library-page.png` |
| `05-mock-worlds-logs.png` | `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-worlds-logs.png` |
| `06-lab-seedmap-schematic.md` | `E:\GitHub\Axolotl-animation\research\06-lab-seedmap-schematic.md` |
| `07-website-motion-misc.md` | `E:\GitHub\Axolotl-animation\research\07-website-motion-misc.md` |
| `AboutAxolotlRun.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AboutAxolotlRun.vue` |
| `AboutMergeGame.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AboutMergeGame.vue` |
| `account-login.png` | `E:\GitHub\Axolotl-animation\research\ref\account-login.png` |
| `anvil.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\anvil.png` |
| `api_cover.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\.github\assets\api_cover.png` |
| `App.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\App.vue` |
| `app_cover.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\.github\assets\app_cover.png` |
| `Avatar.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Avatar.vue` |
| `axo-teaching.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-teaching.svg` |
| `axolotl-lab.png` | `E:\GitHub\Axolotl-animation\research\ref\axolotl-lab.png` |
| `axolotl-run.png` | `E:\GitHub\Axolotl-animation\research\ref\axolotl-run.png` |
| `axolotl.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.png` |
| `AxolotlLogo.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AxolotlLogo.vue` |
| `Browse.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Browse.vue` |
| `ButtonFrame.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\ButtonFrame.vue` |
| `codeflow-logo.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\.github\assets\codeflow-logo.png` |
| `components\ui\Instance.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue` |
| `ContentCardReveal.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\project\ContentCardReveal.vue` |
| `ContentPageHeader.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\ContentPageHeader.vue` |
| `ContextMenu.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\ContextMenu.vue` |
| `COPYING.md` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\COPYING.md` |
| `cover-schematic.png` | `E:\GitHub\Axolotl-animation\research\ref\cover-schematic.png` |
| `cover-seedmap.png` | `E:\GitHub\Axolotl-animation\research\ref\cover-seedmap.png` |
| `curseforge.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\external\curseforge.svg` |
| `defaults.scss` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\defaults.scss` |
| `Fabric.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\Fabric.png` |
| `FloatingActionBar.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\FloatingActionBar.vue` |
| `global.scss` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\stylesheets\global.scss` |
| `grass-block.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\grass-block.png` |
| `helpers\instance.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\instance.ts` |
| `home-dashboard.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\home-dashboard.ts` |
| `HomeCalendar.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeCalendar.vue` |
| `HomeDashboard.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeDashboard.vue` |
| `HomeGreeting.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeGreeting.vue` |
| `HomeMinimal.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeMinimal.vue` |
| `HomeShortcutWidget.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeShortcutWidget.vue` |
| `Instance.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue` |
| `Inter-ExtraBold.woff2` | `E:\GitHub\Axolotl-animation\public\fonts\Inter-ExtraBold.woff2` |
| `Inter-LICENSE.txt` | `E:\GitHub\Axolotl-animation\public\fonts\Inter-LICENSE.txt` |
| `Lab.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Lab.vue` |
| `lab\schematic-preview\scene.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\schematic-preview\scene.ts` |
| `lab\seed-map\workspace.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\seed-map\workspace.ts` |
| `LabSchematicPreview.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\LabSchematicPreview.vue` |
| `LabSeedMap.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\LabSeedMap.vue` |
| `launcher-home.png` | `E:\GitHub\Axolotl-animation\research\ref\launcher-home.png` |
| `loading\cube.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\loading\cube.png` |
| `logo256.png` | `E:\GitHub\Axolotl-animation\research\ref\logo256.png` |
| `LogViewport.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\console\components\LogViewport.vue` |
| `minecraft-preview.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\minecraft-preview.png` |
| `Minecraft_AE.ttf` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\Minecraft_AE.ttf` |
| `monorepo_cover.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\.github\assets\monorepo_cover.png` |
| `mr-pack.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\modrinth-3d\mr-pack.png` |
| `NavRail.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavRail.vue` |
| `NavTabs.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\NavTabs.vue` |
| `NeoForge.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\NeoForge.png` |
| `new-instance.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\icons\new-instance.svg` |
| `NewModal.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\modal\NewModal.vue` |
| `no-documents.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\illustrations\no-documents.svg` |
| `NotoSansSC-subset.woff2` | `E:\GitHub\Axolotl-animation\public\fonts\NotoSansSC-subset.woff2` |
| `OnboardingOverlay.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\OnboardingOverlay.vue` |
| `OnboardingWelcome.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\OnboardingWelcome.vue` |
| `overlays.css` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\styles\overlays.css` |
| `pages\instance\Index.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Index.vue` |
| `pages\Lab.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Lab.vue` |
| `pages\LabSchematicPreview.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\LabSchematicPreview.vue` |
| `pages\LabSeedMap.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\LabSeedMap.vue` |
| `PopupNotificationPanel.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\nav\PopupNotificationPanel.vue` |
| `ProjectCard.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\project\card\ProjectCard.vue` |
| `ProjectCardTitle.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\project\card\ProjectCardTitle.vue` |
| `public\models\axolotl.gltf` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\models\axolotl.gltf` |
| `Quilt.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\Quilt.png` |
| `research\ref\axolotl-lab.png` | `E:\GitHub\Axolotl-animation\research\ref\axolotl-lab.png` |
| `research\ref\cover-schematic.png` | `E:\GitHub\Axolotl-animation\research\ref\cover-schematic.png` |
| `research\ref\launcher-home.png` | `E:\GitHub\Axolotl-animation\research\ref\launcher-home.png` |
| `scene-b-browse-cart.png` | `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\scene-b-browse-cart.png` |
| `scene-c-project.png` | `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\scene-c-project.png` |
| `scene-d-parts.png` | `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\scene-d-parts.png` |
| `scene.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\schematic-preview\scene.ts` |
| `spawn_point.webp` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\seed-map-assets\structures\spawn_point.webp` |
| `stone.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\stone.png` |
| `StyledInput.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\StyledInput.vue` |
| `superball.png` | `E:\GitHub\Axolotl-animation\research\ref\superball.png` |
| `TagItem.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\TagItem.vue` |
| `texture-layout.json` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\lab\schematic-preview\assets\vanilla\texture-layout.json` |
| `theme-accent.png` | `E:\GitHub\Axolotl-animation\research\ref\theme-accent.png` |
| `Toggle.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Toggle.vue` |
| `variables.scss` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\variables.scss` |
| `web_cover.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\.github\assets\web_cover.png` |
| `WorldItem.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\WorldItem.vue` |
| `wrench-rinth.png` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\modrinth-3d\wrench-rinth.png` |
| `box.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\box.svg` |
| `boxes.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\boxes.svg` |
| `change-skin.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\change-skin.svg` |
| `check.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\check.svg` |
| `chevron-right.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\chevron-right.svg` |
| `compass.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\compass.svg` |
| `cube.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\cube.svg` |
| `download.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\download.svg` |
| `file-archive.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\file-archive.svg` |
| `flask-conical.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\flask-conical.svg` |
| `forge.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\forge.svg` |
| `game.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\game.svg` |
| `home.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\home.svg` |
| `images.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\images.svg` |
| `library.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\library.svg` |
| `list.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\list.svg` |
| `mouse-pointer-2.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\mouse-pointer-2.svg` |
| `neoforge.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\neoforge.svg` |
| `online-indicator.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\online-indicator.svg` |
| `pencil.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\pencil.svg` |
| `pin.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\pin.svg` |
| `play.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\play.svg` |
| `plus.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\plus.svg` |
| `quilt.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\quilt.svg` |
| `search.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\search.svg` |
| `server.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\server.svg` |
| `settings.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\settings.svg` |
| `sparkles.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\sparkles.svg` |
| `spinner.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\spinner.svg` |
| `stop-circle.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\stop-circle.svg` |
| `tags\categories\map-pinned.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\categories\map-pinned.svg` |
| `tags\loaders\fabric.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\fabric.svg` |
| `terminal-square.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\terminal-square.svg` |
| `timer.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\timer.svg` |
| `unfold-vertical.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\unfold-vertical.svg` |
| `users.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\users.svg` |
| `world.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\world.svg` |
| `x.svg` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\x.svg` |
