# 05 · 实例库 + 实例页 (Library + Instances) — implementation-ready research

> Area owner report for the animated short 《启动按钮去哪了？》. Scope: library page, instance cards, instance detail page (header + PLAY button + tabs), content (mods) table, worlds, logs, files/screenshots (brief), create-instance flow.
> Everything below is read from source unless marked **(inferred)**. All sizes are CSS px at 1× (Tailwind v3 defaults; the shared preset does **not** override spacing/radius/font-size).

---

## 0. Sources, version, conventions

| Item | Value |
|---|---|
| Source tree (read-only) | `E:\GitHub\Axolotl-animation\upstream\Axolotl` |
| Code version | `apps/app-frontend/package.json` → **1.9.7**, HEAD `2b5c22de` (2026-10-05) |
| Reference screenshots | `E:\GitHub\Axolotl-animation\research\ref\*.png` — taken on **v1.6.0** (see theme-accent.png footer “Axolotl Launcher 1.6.0”). Small differences vs. code are expected (e.g. breadcrumb icons). |
| zh-CN strings | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json` (`{"id":{"message":…}}`) and `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json` (`{"id":{"defaultMessage":…}}`). Missing ids fall back to the English `defaultMessage` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\composables\i18n.ts` line ~318). |
| Theme for colors | **Light** theme + **pink accent** (`accent-pink`, store default `selectedAccentColor: 'pink'`; custom default `#db2777`) — `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\store\theme.ts`. Note the store's default *theme* is `dark`; the reference screenshots are light. |
| Tailwind | Preset `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\tooling-config\tailwind\tailwind-preset.ts` (colors only) + `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\tailwind.config.ts` (font families only). `preflight: false`. |
| Fonts | UI: `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, …` (Inter 400/500/600/700/800 from CDN, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\inter.scss`). CJK falls back to system (PingFang SC on macOS — matches screenshots). Mono: `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\font-family.ts`). Body `font-size: 16px`, weight 400, color `--color-base` (= text-default). |

Tailwind scale used throughout: `text-xs 12/16`, `text-sm 14/20`, `text-base 16/24`, `text-lg 18/28`, `text-xl 20/28`, `text-2xl 24/32`; `rounded-md 6`, `rounded-lg 8`, `rounded-xl 12`, `rounded-2xl 16`, `rounded-full 9999`; spacing unit 4px (`p-3`=12, `gap-2`=8 …). Note: **`text-md` is used in Instance.vue but is not a Tailwind class → no-op (inherits 16px)**.

Reference reconstructions I rendered from these values (for proportion sanity checks; fonts are Windows fallbacks):
`E:\GitHub\Axolotl-animation\research\_scratch\05-mock-instance-page.png`, `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-library-page.png`, `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-library-cards-view.png`, `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-worlds-logs.png`, `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-create-modal.png` (+ the `.html` sources next to them; generator kept in my scratchpad). Icon contact sheets: `E:\GitHub\Axolotl-animation\research\_scratch\05-instance-icons-sheet.png`, `E:\GitHub\Axolotl-animation\research\_scratch\05-instance-icons-3d-sheet.png`; axolotl illustration: `E:\GitHub\Axolotl-animation\research\_scratch\05-new-instance-illustration.png`.

---

## 1. Design tokens this area uses (resolved)

### 1.1 Colors — light theme, pink accent (dark in right column)

Source: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\variables.scss`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\stylesheets\global.scss`.

| Token | Light | Dark (`.dark-mode`) | Used for (this area) |
|---|---|---|---|
| `--surface-1` (= `--color-bg`) | `#ebebeb` | `#101215` | Content-pane page background |
| `--surface-1-5` | `#ededed` | `#15181c` | Odd content-table rows (`surface-content-alt`) |
| `--surface-2` | `#f5f5f5` | `#1a1e24` | Library standard card, even table rows, world rows, log viewport |
| `--surface-2-5` | `#eef1f5` | `#20242b` | Selected table row |
| `--surface-3` | `#f8f8f8` | `#262b34` | NavTabs pill bg, table header, library “cards” tile, modal body, menus, shell chrome |
| `--surface-4` | `#ffffff` | `#333a46` | Inputs, base buttons, filter pills, toggle OFF track, avatar bg, table outline/row separators |
| `--surface-5` (= `--color-divider`) | `#dddddd` | `#424854` | Strokes, dividers, avatar border, bullet dots |
| `--color-text-primary` | `#1a202c` | `#ffffff` | Titles, names |
| `--color-text-default` | `#2c2e31` | `#b0bac5` | Body text (body color) |
| `--color-text-tertiary` | `#484d54` | `#96a2b0` | Secondary text, inactive icons |
| `--color-brand` | **`#db2777`** (pink-600) | **`#f472b6`** (pink-400) | Colored buttons, active tab pill, toggle ON, checkbox ON, underline |
| `--color-accent-contrast` | `#ffffff` | **`#000000`** | Text/icon on colored buttons (dark theme = black text on pink!) |
| `--color-brand-highlight` | `rgba(219,39,119,.25)` | `rgba(244,114,182,.25)` | Selected pills/chips |
| `--color-brand-shadow` | `rgba(219,39,119,.68)` | same formula | Focus ring (`ring-4`) |
| `--color-button-bg-selected` | = brand (solid pink) | = brand-highlight (25% pink) | Active NavTabs pill, active nav-rail circle |
| `--color-button-text-selected` | `#ffffff` | = brand | Active tab text |
| `--color-red` | `#cb2245` | `#ff496e` | Stop button, delete, hardcore |
| `--color-green` | `#00af5c` | `#1bd96a` | Update-available icon, INFO in logs |
| `--color-orange` | `#e08325` | `#ffa347` | WARN in logs |
| `--color-blue` | `#1f68c0` | `#4f9cff` | Log timestamps / thread |
| `--color-gray` | `#595b61` | `#9fa4b3` | Toggle knob OFF |
| `--color-red-bg` / `--color-orange-bg` | 10% of red/orange | 20% | Error / warning log line backgrounds |
| `--hover-brightness` | `0.9` (darken) | `1.25` (lighten) | Button hover filter |

Composited (opaque) equivalents for the translucent pinks, handy for flat vector rendering:

| Translucent | over `#ffffff` | over `#f8f8f8` | over `#f5f5f5` | over `#ebebeb` |
|---|---|---|---|---|
| brand-highlight 25% | `#f6c9dd` | `#f1c4d8` | `#eec2d6` | `#e7bace` |
| brand ring 30% (colored button outer ring) | `#f4bed6` | `#efb9d1` | `#edb7cf` | `#e6b0c8` |
| red-bg 10% (error log line) | `#fae9ec` | `#f4e3e6` | `#f1e0e3` | `#e8d7da` |
| orange-bg 10% (warn log line) | `#fcf3e9` | `#f6ece3` | `#f3eae0` | `#eae1d7` |
| brand hover (brightness .9) | `#c5236b` (solid) | | | |

### 1.2 Shadows / elevation (the 2.5D stack)

| Layer (low → high) | Surface | Shadow |
|---|---|---|
| Content pane | `#ebebeb`, top-left radius 20 | inner: `box-shadow: 1px 1px 15px rgba(0,0,0,.1) inset` + 1px `#ddd` border (`App.vue` `.app-contents::before`) |
| Cards / rows | `#f5f5f5` / `#f8f8f8` | `--shadow-card: rgba(50,50,100,.1) 0 2px 4px 0` (world rows, avatars); tables `shadow-sm` = `0 1px 2px 0 rgb(0 0 0/.05)` |
| Controls (inputs, base buttons, pills) | `#ffffff` | base button: `inset 0 0 0 1px #ddd, 0 1px 1px rgba(0,0,0,.12)` |
| Colored (brand) button | `#db2777` | `0 0 0 1px rgba(219,39,119,.3), 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)` + `::before` 1px inner rim gradient `rgba(255,255,255,.3)→0` top-to-bottom (a lit top edge — great for the “thin volume” look) |
| Floating NavTabs pill | `#f8f8f8` + 1px `#fff` border | `shadow-xl` = `0 20px 25px -5px rgb(0 0 0/.1), 0 8px 10px -6px rgb(0 0 0/.1)` |
| Menus (context / popout) | `#f8f8f8` | context menu `--shadow-floating`; popout `3px 3px 0.8rem rgba(0,0,0,.3)` |
| Floating action bar | `#f8f8f8` | `0 1px 3px rgba(0,0,0,.3), 0 6px 10px rgba(0,0,0,.15)` + `drop-shadow-2xl` |
| Modal | `#f8f8f8`, 1px `#ddd`, radius 16 | `4px 4px 26px 10px rgba(0,0,0,.08)`; overlay gradient (see §8) + `backdrop-filter: blur(5px)` |

### 1.3 Button system (the hero is literally one of these)

Source: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\ButtonFrame.vue`.

| Size | Height | Radius | Padding-x | Gap | Font | Icon |
|---|---|---|---|---|---|---|
| `2xs` | 24 | 8 | 6 | 4 | 14 / 600 | 16 |
| `xs` | 28 | 8 | 6 | 4 | 14 / 600 | 16 |
| `sm` | 32 | 10 | 6 | 4 | 14 / 600 | 16 |
| `md` (default) | 36 | 12 | 10 | 6 | 16 / 600 | 20 |
| `lg` | 40 | 14 | 16 | 8 | 16 / 600 | 20 |
| **`xl`** | **48** | **16** | **14** | **8** | **16 / 800 (extrabold)** | **24** |

`icon-only` → square (`w` = height, `px 0`); `circular` → `rounded-full`. All have a 1px transparent border (adds 2px to auto width), line-height 20px.

| Type | Fill | Text/icon |
|---|---|---|
| `base` | `#ffffff` + inset 1px `#ddd` ring + `0 1px 1px rgba(0,0,0,.12)` | text `#1a202c`, icon `#2c2e31` |
| `colored` (brand/red/green…) | `--button-color` (`#db2777` / `#cb2245` …) + layered shadow + rim | `#ffffff` (dark theme: `#000000`) |
| `outlined` | transparent, 1px border `#ddd` | text `#1a202c`, icon `#2c2e31` |
| `quiet` | transparent; hover → `#ffffff` (`interaction="surface"`) or fills with color (`interaction="filled"`) | `#2c2e31` or the color |
| `chip` | `--button-highlight` (25% tint) + inset ring | color (e.g. pink) |

States: hover `filter: brightness(var(--hover-brightness))` (0.9 light), **press `scale(0.97)`**, transition `background-color,color,box-shadow,filter,opacity,transform 150ms ease-out`; disabled `opacity .5`, `cursor: not-allowed`; focus-visible `ring-4` brand-shadow.

### 1.4 Other primitives

- **Avatar / InstanceIcon** — `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Avatar.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\InstanceIcon.vue`: 1px `#ddd` border, `#ffffff` bg, `object-fit: contain`, **radius = size × 16/96** (48→8, 64→10.67, 80→13.33), `box-shadow: --shadow-card`. Pixelated rendering only if natural width < 32px. With no `src` it draws an outlined isometric cube (`viewBox 0 0 104 104`, stroke `#9a9a9a`, width 5) on a 5%-tinted bg (hue = hash(instance id)). **InstanceIcon is *frameless*** (no border/bg/radius/shadow) when the icon is a built-in icon or a loader default — i.e. most freshly created instances render as bare pixel-art objects.
- **NavTabs** — `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\NavTabs.vue`: pill container `rounded-full`, bg `#f8f8f8`, padding 4, 1px `#ffffff` border, `shadow-xl`, text 14px **bold**. Tab: `px-16 py-8`, gap 8, icon 20px → **tab height 36, container 46**. Active = absolutely-positioned slider pill (solid `#db2777`, white label/icon); inactive label `#1a202c`, icon `#484d54`. Slider motion: `left/right/top/bottom 150ms cubic-bezier(.4,0,.2,1)` with the **trailing edge delayed 200ms** (moving right: left edge waits; moving left: right edge waits) → an elastic “inchworm” stretch; opacity `250ms cubic-bezier(.5,0,.2,1) 50ms`. Tab press: `scale(0.95)` (`.button-animation`).
- **StyledInput** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\StyledInput.vue`): bg `#ffffff`, radius 12, height 36 (or `!h-10` = 40), left icon 20px at x=12, opacity .6, color `#484d54` (focus → 1, primary); text 16px/500; placeholder `#484d54`; focus `ring-4 rgba(219,39,119,.68)`.
- **Combobox trigger**: `rounded-xl bg-#fff px-16 py-8`, chevron rotates; dropdown panel radius 14, bg `#fff`, 1px `#ddd`.
- **Toggle** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Toggle.vue`): **48×24**, radius full, padding 4. OFF: track `#ffffff`, knob 16px `#595b61`. ON: track `#db2777`, knob 16px **`rgba(0,0,0,.9)`** (near-black, not white!) at `translateX(24px)`. Hover knob → 18px; press → 14px; all `200ms`. Disabled `opacity .5`.
- **Checkbox** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Checkbox.vue`): 20×20, radius 6, 1px border; OFF bg `#f5f5f5` border `#ddd`; ON bg `#db2777`, border `rgba(161,161,161,.35)`, white check (stroke 3); shadow `1px 1px 2px rgba(0,0,0,.08)`; press `scale(.95)`.
- **TagItem** (count badge): `rounded-full px-8 py-4`, 1px `#ddd`, bg `#fff`, text 14px `#484d54`, line-height 1.
- **Chips** (radio chip row): Button `md` — unselected `base`, selected `chip` + brand (25% pink fill, pink text, leading ✓ CheckIcon).
- **BulletDivider**: 6×6 circle `#ddd`.

### 1.5 Motion vocabulary found in this area

| Where | Motion |
|---|---|
| Page route change | opacity enter `180ms ease`, leave `120ms ease` (`global.scss` `.page-slide-*`) |
| Any Button | press `scale(.97)`, `150ms ease-out` |
| Library card wrapper | hover `brightness(.9)`, press `scale(.98)` |
| Card hover play button | `scale(.75)→1`, `opacity 0→1`, origin-bottom, ~150ms; icon behind `brightness(.75)` |
| NavTabs slider | 150ms `cubic-bezier(.4,0,.2,1)` + 200ms trailing-edge delay |
| Toggle | 200ms all; knob 16→18 (hover) →14 (press) |
| Disabled content row | `grayscale(1) opacity(.5)` over 200ms |
| Floating action bar enter | **`250ms cubic-bezier(0.15, 1.4, 0.64, 0.96)`** from `scale(.5) translateY(-10rem) opacity 0` (overshoot spring) |
| Modal | overlay fade 200ms ease-out + 5px blur; body `scale .97→1`, `opacity 0→1` 200ms; container starts offset by `(click − center)/16` and eases to center |
| Context menu | fade 200ms ease-in-out |
| World row “highlight” on arrival | 4s ease-out: brightness 1.25 held to 75% → 1; `1.5px` brand border + `0 0 8px 2px` brand glow at 50% → 0 |
| Spinner | `animate-spin` 1s linear infinite |
| Group collapse chevron | rotate 180°, 300ms |

The same overshoot curve `cubic-bezier(0.15, 1.4, 0.64, 0.96)` is also used for nav-rail button entrance (`App.vue` `.nav-button-animated-enter-active`, 0.5s). It is the product's own “springy” curve — a natural fit for the button character.

---

## 2. Frame context (where these pages sit)

Source: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\App.vue` (styles ~L3533–3930).

- Shell grid bg `#f8f8f8` (`surface-3`); **top bar 48px**, **left nav 64px**; optional right sidebar 300px (user toggle; forced on /browse & /project only).
- Content pane: `left: 64px; top: 48px`, bg `#ebebeb`, **top-left radius 20px**, inset edge shadow (above). `.app-viewport` has `scrollbar-gutter: stable` (16px webkit scrollbar) **(on macOS overlay scrollbars the gutter is ~0 — inferred)**.
- **Nav rail** buttons: 48×48 circles, icon 24px, `#2c2e31`; hover bg `#fff`. Library button icon = `LibraryIcon` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\library.svg`).
  - On `/library`: library button = **solid pink circle, white icon** (`router-link-active`).
  - On `/instance/:id`: library button = **white circle** (`subpage-active`, primary icon), and if that instance is in the rail's quick switcher (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\QuickInstanceSwitcher.vue`, 28px InstanceIcons inside 48px NavButtons) **its 48px circle turns pink**. → *The pink disc literally hops from the Library icon to the instance icon when you open an instance.*
- **Breadcrumbs** (top bar, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Breadcrumbs.vue`): instance pages show `[20px instance icon, radius 6] 实例名 › [PackageIcon] 内容` (sub-page names: 内容 / 文件 / 截图中心 / 世界 / 日志 / 编辑存档). Library shows `[LibraryIcon] 实例库`. (Icons per current code; v1.6.0 screenshots show text-only crumbs.)

---

## 3. Library page — 实例库 (`/library`)

Files: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\library\Index.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\library\Overview.vue` (all), `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\library\Modpacks.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\library\Servers.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\library\Custom.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\library\Downloaded.vue` (route exists, tab hidden), `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\GridDisplay.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\library\InstanceGroup.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\library\DraggableInstanceCard.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\composables\useGridGrouping.ts`.
(`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\RowDisplay.vue` is **unused** — not imported anywhere.)

### 3.1 Anatomy (content pane coordinates; 1280×800 window → pane 1216 wide)

```
pane (#ebebeb)  padding 24, flex-col gap 12        [h1 "实例库" exists but is `hidden`]
├─ NavTabs (pill, no icons)  [全部实例] 整合包  服务器  自定义          y=24  h=46
└─ GridDisplay  flex-col gap 16, pb 64                                   y=82
   ├─ row 1 (gap 8): [🔍 搜索 ………… flex-1, h36] [＋ 新建分组 base md] [＋ 创建新实例 brand md]
   ├─ row 2 (wrap, gap 8): [⇅ 名称 ˅] [sort-dir 40×40] │ [≋ 分组 ˅] [▦ view (circle 36)]
   └─ sections (InstanceGroup) …  grid repeat(auto-fill, minmax(256px,1fr)) gap 12
        [card 80h] [card] [card] [card]      ← 4 columns at 1280; ~6 at 1920 (inferred)
```

- **Tabs** (zh-CN): `全部实例` (`/library`), `整合包` (`/library/modpacks`, linked instances that aren't server projects), `服务器` (`/library/servers`), `自定义` (`/library/custom`, instances without `link`). `与我共享` / `已保存` exist but `shown:false`.
- Row 1: search = StyledInput, `SearchIcon`, placeholder **搜索**, clearable, h 36. `新建分组` = Button base md + PlusIcon. **`创建新实例` = Button colored brand md + PlusIcon** (36h, radius 12, pink, white text) → `/create`.
- Row 2: sort Combobox (`ArrowUpDownIcon` 20px `#2c2e31` + label 600 `#484d54`, default **名称**; options 名称/上次游玩/创建日期/修改日期/游戏版本); sort-direction square button 40×40 radius 12 bg `#fff` (`SortAscIcon`/`SortDescIcon`, tooltip e.g. `A–Z 正序`); 1×24px `#ddd` divider (mx 8); group Combobox (`LayersIcon` + **分组**; options 分组/加载器/游戏版本/无); view PopoutMenu = circular icon-only base md (36) with `GridIcon` (标准网格) or `CollectionIcon` (实例库卡片).
- Defaults: display **standard**, grouping **Group**, sort **Name asc** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\library-display-mode.ts`, `useGridGrouping.ts`).
- Right-click on empty background → context menu with single item `＋ 创建新实例`.

### 3.2 Section header (InstanceGroup)

Hidden when only ungrouped instances exist (the common case). Otherwise: `h-40`, bottom 1px `#ddd`; `DropdownIcon` 20px `#484d54` (rotates 180° when expanded, 300ms); name 16px/600 `#2c2e31` (`已置顶` for the pinned group, `无分组` for ungrouped, or editable custom name); count TagItem; on hover (custom groups) quiet sm icon buttons ↑ ↓ ✎ ＋ 🗑. Grid starts 10px below (`mt-2.5`); section `pb-12`. Empty group text: `拖放实例到此处添加。` 16px `#484d54` 80% opacity. Drag-over target: dashed 2px border radius 12 at 40% opacity.

### 3.3 Instance card — **standard grid** (default view) ★ portal #1

`Instance.vue` `v-else` branch (L383–476) wrapped by `InstanceGroup.vue` L361–384.

```
wrapper: rounded-8, hover brightness(.9), active scale(.98), transition-all
card (.button-base): flex gap 12, radius 12, bg #f5f5f5, padding 16, font-weight 500
   [48px InstanceIcon]   ┌ name: 16px bold #1a202c, line-height 20, 1 line clamp
   (play btn overlay)    └ [GameIcon 16] "Fabric 26.2" 14px semibold #484d54, capitalize
total size: 80px tall × ≥256px wide
```

- `.button-base` adds its own hover `brightness(.85)` and press `brightness(.8)`/`scale(.95)` → hovering darkens the card by both filters (≈ `#bbbbbb` from `#f5f5f5`) **(inferred from CSS composition)**.
- Second line text = raw `{loader} {game_version}` with CSS `capitalize` → `Fabric 26.2`, **`Neoforge 1.21.1`** (lowercase “f”, confirmed in launcher-home.png pinned cards), `Forge 1.12.2`, `Vanilla 1.21.1`.
- **Hover Play button**: positioned `absolute inset-0` exactly over the 48px icon: `Button colored brand xl circular icon-only` = **48×48 pink disc**, white `PlayIcon` 24px nudged `translateX(2px)` for optical centering. Hidden state `scale(.75) opacity 0`; on card hover → `scale(1) opacity 1`, `transform-origin: bottom`. Meanwhile the icon underneath goes `brightness(.75)`. **The launch button lives *inside* every instance icon.**
- Hover extras (InstanceGroup overlay): top-right ⋮ = quiet `2xs` circular (24×24) at `right 8 / top 8`; bottom-right selection Checkbox (20×20) at `right 8 / bottom 8`, both `opacity 0→1` on hover.
- States:
  - Playing → permanent **red** disc (`#cb2245`) with `StopCircleIcon` (tooltip `停止`).
  - Launching (`modLoading`) / installing → icon `brightness(.25) scale(.85)` + 32px spinner (tooltip `实例正在加载……` / `安装中……`).
  - Not installed → pink disc with `DownloadIcon` (tooltip `修复`).
  - Select mode → unselected cards `opacity .5`, selected show the pink checkbox.
- Click → `/instance/:id`. Long-press 500ms or shift-click → selection mode.

### 3.4 Instance card — **实例库卡片** view (`displayMode === 'cards'`)

`Instance.vue` L283–382. Grid `minmax(208px,1fr)` gap 16.

```
tile: flex-col justify-end gap 12, radius 20, 1px #fff border, bg #f8f8f8, padding 12, overflow clip
  ┌──────────── square (aspect 1/1), radius 16 ────────────┐
  │  Avatar 100% (!rounded-2xl) — loader art or pack icon   │
  │                                     [48px pink ▶] ←6px │  (hover: scale .75→1, opacity 0→1)
  └─────────────────────────────────────────────────────────┘
  name 16px/600 line-height 20 #1a202c (truncate)
  "Neoforge 1.21.1" 14px/500 line-height 18 #2c2e31, capitalize   (padding-x 2)
hover: border #ddd, brightness(1.1); press scale(.98)
```
Loading overlay over the art: `color-mix(surface-1 30%, transparent)` + spinner 30% of tile. Note: loader art like `Fabric.png` (52×56) is upscaled ~4× smoothly (not pixelated) — use `image-rendering: pixelated` in the film for crispness (deliberate deviation).

### 3.5 Library right-click menu (and “⋮”)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\ContextMenu.vue`: bg `#f8f8f8`, radius 12, 1px `#ddd`, padding 8, `--shadow-floating`; items padding 8, radius 8, gap 8, icon 20px, text `#2c2e31`. Hover: base → bg `#fff`; **`primary` → bg `#db2777` + white bold**; `danger` → bg `#cb2245` + white bold. Fade 200ms.

Order (idle instance): **`▷ 开始游戏` (primary)**, `☆ 置顶实例`, —, `＋ 添加内容`, `👁 查看实例`, `⧉ 复制实例`, `📌 固定到主页`, `📂 打开文件夹`, `⧉ 复制路径`, [`− 移出分组`], —, `🗑 删除` (danger). Playing instance: first item `⏹ 停止` (danger).
→ *Another incarnation of the play button: hovering “开始游戏” in the menu turns it into a solid pink pill.*

### 3.6 Empty library — the axolotl illustration

When there are no instances: centered column gap 12 → `NewInstanceImage` **160×160** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\icons\new-instance.svg`, identical to `add-project.svg`) — a **pink voxel axolotl with a cyan `#94E6E4` “＋” block and bubbles** (Axolotl-branded, safe to use; render: `E:\GitHub\Axolotl-animation\research\_scratch\05-new-instance-illustration.png`), heading `未找到实例` (h3), button `＋ 创建新实例` (brand).

### 3.7 Selection floating bar (library)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\FloatingActionBar.vue`: fixed bottom, padding 16; toolbar radius 20, bg `#f8f8f8`, 1px `#ddd`, `px-12 py-10`, `max-w 60vw`. Content: `已选择 {count} 个` 16px/600 tabular-nums │ `清除` │ … `＋ 新建分组`, `− 移出分组`, │ `🗑 删除` (red quiet). **Enters with the overshoot spring** (see §1.5).

---

## 4. Instance page — 实例页 (`/instance/:id`)

File: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Index.vue`; header shell `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\ContentPageHeader.vue`. (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Overview.vue` is a stub, not routed; route `''` renders the Content tab.)

### 4.1 Layout & vertical rhythm (pane coordinates)

```
y=0    pane top
y=24  ┌ header wrapper: padding 24 (top/left), 8 (right), 16 (bottom)
      │ ContentPageHeader: flex-col gap 8; bottom border 1px #ddd; pb 16
      │ row: flex wrap, items-start, gap 16           (row height = icon = 64)
      │  ├ left: flex gap 16 ─ [64px InstanceIcon] [col gap 8, justify-center:
      │  │                                        title h1 24px/600, line-height 1, #1a202c
      │  │                                        stats row (gap 8, wrap) ]
      │  └ right: actions flex gap 8 (items-center): [PLAY xl 48h] [⚙ xl circle 48] [⋮]
y=88   │ icon bottom → +16 (ContentPageHeader pb)
y=104  │ 1px divider #ddd → +16 (wrapper pb)
y=121  ├ tabs wrapper px 24: NavTabs with icons (46h) → bottom y=167
y=183  └ body: padding 24 (sides), 16 (top) → tab content starts here
```
(Window coordinates = pane + (64, 48). Verified against the reconstruction `E:\GitHub\Axolotl-animation\research\_scratch\05-mock-instance-page.png`.)
Header right action buttons are **top-aligned with the icon** (`items-start`). Stats move under the title row only below 768px (`max-md`).

### 4.2 Header contents

- **Icon**: `InstanceIcon size 64px` — frameless loader art (default) or framed pack icon (radius 10.67, 1px `#ddd`, white, shadow-card).
- **Title**: instance name, `text-2xl` 24px, weight 600, `#1a202c`, line-height 1, wraps.
- **Stats** (16px, weight 500, color body `#2c2e31`), separated by 6px `#ddd` dots, gap 8:
  1. `BoxIcon` 16px + game version (e.g. `26.2`).
  2. (green Badge `已升级至 {version}` after an upgrade).
  3. Loader tag icon 16px (`getLoaderIcon`, e.g. `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\fabric.svg`) + `{loader} {loader_version}` capitalized (e.g. `Fabric 0.17.2`, `Neoforge 21.1.x`).
  4. Play time (feature flag `show_instance_play_time`, default **on**): **hard-coded English** `N hour(s)` / `N minute(s)` / `N second(s)` (`timePlayedHumanized`, not localized!) or `从未游玩` when 0. → faithful zh UI literally shows e.g. `37 hours`.
  - Server-linked instances instead show online players / recent plays / ping / region + `关联到 [24px icon] 项目名`.

### 4.3 ★ The PLAY button state machine (header, `Index.vue` L129–219)

All are `Button size="xl"` → **48px tall, radius 16, padding-x 14, gap 8, 16px extrabold (800), icon 24px**. Width auto (≈ 14+24+8+64+14+2 ≈ **126px** for `▷ 开始游戏` **(inferred from metrics)**).

| Condition | Type / color | Icon | Label (zh-CN, verbatim) | Enabled |
|---|---|---|---|---|
| `install_stage` ∈ installing / pack_installing / pack_installed / not_installed / minecraft_installing | colored **brand** `#db2777` | — | `安装中……` | disabled (50% opacity) |
| not installed otherwise | colored brand | `DownloadIcon` | `修复` | yes (disabled offline, tooltip `离线模式只能启动已完整下载的实例。`) |
| **idle** (`playing=false, loading=false`) | **colored brand `#db2777`, white text** | **`PlayIcon`** (outlined triangle, stroke 2, round joins) | **`开始游戏`** | yes |
| launching (`loading=true`) | colored brand | `SpinnerIcon` (spinning) | `正在启动…… {n} 秒` (counter +1 every second) | disabled (50%) |
| running (`playing=true`) | colored **red** `#cb2245` | `StopCircleIcon` | `停止` | yes |
| stopping | colored red | `StopCircleIcon` | `正在停止……` | disabled |
| idle, server-project instance | `ButtonGroup` (1px gap, inner corners squared): [brand `▷ 开始游戏`] + dropdown chevron → menu `▷ 加入服务器` / `▷ 启动实例` | | | |

Visual recipe of the idle button (light): fill `#db2777`; outer ring `0 0 0 1px rgba(219,39,119,.3)`; 4 soft drop shadows (2/5/10/24px blur, ≤4% black); 1px inner top rim highlight (white 30% → 0%); hover `brightness(.9)` → `#c5236b`; press `scale(.97)`; 150ms ease-out. Dark theme: fill `#f472b6`, **black** label/icon.

> Label note for the story: the product's launch button text is **`开始游戏`** everywhere (`button.play`, also on Home and in world rows). `启动` appears as the Home calendar's play tooltip (`app.home.calendar.play`) and in `启动实例` (server dropdown). The empty Logs tab even says `点击右上角「开始游戏」即可接收实时日志`.

### 4.4 Secondary actions

- `⚙` **Instance settings**: `Button xl circular icon-only` base → **48×48 white disc**, inset `#ddd` ring, `SettingsIcon` 24px `#2c2e31`; tooltip `实例设置`; opens a tabbed modal (tabs: 通用 / 安装 / 同步 / 备份 / 核心组件 / 游戏窗口 / Java 及内存 / 启动准备).
- `⋮` overflow: `OverflowMenu` with **no styling classes** → a bare transparent `<button>` with a 16px (`1em`) `MoreVerticalIcon` **(inferred: unstyled in current code)**. Menu (popout: radius 12, bg `#f8f8f8`, 1px `#ddd`, padding 8, arrow 14×7): `📂 打开文件夹`, `📦 导出整合包`, `↗ 创建快捷方式`, [`⟳ 升级实例`].
- Header right-click menu: `▷ 开始游戏` (primary) / `⏹ 停止`, `＋ 添加内容`, —, `✎ 编辑`, `📂 打开文件夹`, `⧉ 复制路径`.

### 4.5 Tabs (NavTabs with icons)

| Order | Label | Icon component → file | Route |
|---|---|---|---|
| 1 | **内容** | `BoxesIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\boxes.svg` | `/instance/:id` |
| 2 | **文件** | `FolderOpenIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\folder-open.svg` | `/files` |
| 3 | **截图** | `ImageIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\image.svg` | `/screenshots` |
| 4 | **世界** | `GlobeIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\globe.svg` | `/worlds` |
| 5 | **日志** | `TerminalSquareIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\terminal-square.svg` | `/logs` (fixed layout: header+tabs pinned, console fills height) |

Active tab: solid pink slider pill, white label + white icon. Estimated widths (14px bold CJK, 2 chars ≈ 28px): each tab ≈ 16+20+8+28+16 = **88px**; whole bar ≈ 5×88 + 8 + 2 ≈ **450px** **(inferred)**.

---

## 5. Content tab — 内容 (mods/resource packs/shaders/… table)

Files: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Mods.vue` (data + actions), `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\layout.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentToolbar.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentTypeFilter.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentCardTable.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentCardItem.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentTableHeaderActions.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentMetadataFilterBar.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentSelectionBar.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\components\ContentEmptyState.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\content-tab\composables\content-pipeline.ts`.

Layout: `flex-col gap 16, pb 24` (optional orange warning admonitions on top).

### 5.1 Toolbar (row, gap 8)

- Search: StyledInput **h 40**, `SearchIcon`, placeholder **`搜索到 {count}个项目……`** (e.g. `搜索到 87个项目……` — `contentType` resolves to `项目`).
- `[🧭 浏览内容]` colored brand, h 40, `CompassIcon` 20 → navigates to Discover `/browse/mod?i=<id>` (vanilla instance → `/browse/resourcepack`; the card/page context-menu `添加内容` uses `/browse/datapack` for vanilla). ★ real exit into the content browser / big search UI.
- `[⑂ 查看依赖关系]` outlined h 40, `GitGraphIcon` (opens dependency graph modal).
- `[⟳ 刷新]` outlined h 40, `RefreshCwIcon` (spins while refreshing).

### 5.2 Type filter chips (row, gap 6)

Pill: `rounded-full px-12 py-6`, 16px/600, line-height 20 → **32px tall**; trailing count 14px/400 at 70% opacity, `ml-4`. Selected: bg 25% pink, text `#db2777`. Unselected: bg `#fff`, text `#2c2e31`, hover `#ddd`. Press `scale(.97)`.
Order: `全部 {total}`, then types by frequency: `模组`, `资源包`, `光影包`, `数据包`, `投影` (schematics), [`重复`].

### 5.3 Table container + header

- Container: 1px `#ffffff` border (`surface-4`), `shadow-sm`, **radius 20**, overflow clip.
- Header row: **48px**, bg `#f8f8f8`, `px-12`, sticky (when stuck: square corners, `shadow-md`, y-borders).
  - Left (gap 16): select-all Checkbox; status tabs (gap 16) `全部` | `可更新 N` | `已启用 N` | `已禁用 N` — 16px/600 `#484d54`, active = `#db2777` + **2px pink underline bar** (`absolute bottom-0`, rounded), counts 14px/400 70%; then a quiet `FilterIcon` button (`筛选`, becomes pink chip when active).
  - Right (gap 8): sort (quiet circular 36, `ArrowDownAZIcon`; menu: `项目名称 A-Z`, `项目名称 Z-A`, `文件名 A-Z`, `文件名 Z-A`, `按从新到旧顺序`, `按从旧到新顺序`, —, `重置视图`); pin view (quiet `PinIcon`, tooltip `固定当前视图`; pinned = pink chip); update-all (quiet **green** `DownloadIcon`, tooltip = `仅更新整合包安装后添加的内容，不会更改整合包自带文件。` — the description wins over the label `更新后装内容`; only shown when updates exist).

### 5.4 Row anatomy (`ContentCardItem.vue` L460–795)

Virtualized, **74px per row**, `px-12`, gap 16, items-center. Backgrounds alternate: even `#f5f5f5` (`surface-content-muted`), odd `#ededed` (`surface-content-alt`), selected `#eef1f5`; each row has a 1px `#ffffff` top border; last row bottom radius 20.

```
┌ col A (45% width ≥800px container; gap 16) ─────────┬ col B (flex-1) ───────────────┬ col C (min 160, right-aligned, gap 8) ┐
│ [☐20] [48px icon] Title (16/600 lh24 #1a202c) [前置] │ 0.6.13 ⏱ 3 个月前               │ [⬇ green | ⇄]  [✎]  [⏻ toggle]  [🗑]  [⋮] │
│               owner⦁24px  CaffeineMC (14 #484d54)    │ sodium-fabric-0.6.13.jar (#484d54)│                                       │
└──────────────────────────────────────────────────────┴───────────────────────────────┴───────────────────────────────────────┘
```

- **Icon**: Avatar 48px, `no-shadow`, 1px `#ddd`, bg `#fff`; class says `rounded-2xl` but Avatar's scoped radius rule has higher specificity → **≈8px radius (inferred)**. Missing icon → grey cube outline. Icons are remote project images (CDN) — the film needs stand-ins (no Modrinth marks).
- **Title** line (gap 4): title (supports MC § colour codes), optional ⚠ orange (post-upgrade), ⚠ red (`此模组已安装 N 次。`), badge `前置` / `孤立前置` (radius 6, bg `#f8f8f8`, px 6 py 2, 12px/500, `#484d54`).
- **Subtitle**: description (14px `#484d54`, truncate) or owner (24px avatar — circle if user — + name 14px `#484d54`).
- **Col B** (≥800px): version number 16px/500 `#1a202c` + `ClockIcon` 16 + relative date 14px/400 `#484d54` (≥600px); file name 16px `#484d54` truncated in the middle (both halves kept).
- **Col C** buttons (all quiet circular 36 unless noted):
  - Update slot (fixed 32px wide): **`DownloadIcon` 20 in green `#00af5c`** (`IconButton` quiet green, `interaction="filled"` → hover fills green, icon white), tooltip `有可用更新`. Otherwise `ArrowLeftRightIcon` (`切换版本`). → the “update arrow” is a **down-arrow-into-tray**, green.
  - Rollback (`UndoIcon`, `回滚到 {fileName}`) when available.
  - **Inline action for schematics (`project_type === 'schematic'`, e.g. `.litematic`)**: `PencilIcon` button, tooltip **`在投影工坊中打开`** → `router.push({ name: 'SchematicWorkshop', query: { instance, path } })`. ★ real portal into Lab 投影工坊.
  - **Toggle** (48×24, §1.4) when the item can be enabled/disabled.
  - Delete: `TrashIcon` 20 `#484d54`; holding Shift while hovering cross-fades to red `TrashExclamationIcon` (`立即删除`).
  - Overflow ⋮ (`MoreVerticalIcon` 20).
- **States**: disabled mod (`enabled === false`) → col A content + col B `grayscale opacity .5` (200ms) while toggle shows OFF; installing → row `opacity .5`, black 20% overlay + white spinner on icon; pending manual download → 20px orange badge with ⚠ at icon top-right; pack-locked/missing → `opacity .5 grayscale`.
- Modpack-linked instances: modpack group header row (rounded-8, bg `#f8f8f8`, chevron expand) listing pack members indented `pl-40`.
- Drag a file over the tab → hint `释放文件以安装到当前实例`.

### 5.5 Selection bar (content)

Same FloatingActionBar; left: stacked 32px item icons (radius 8, 1.5px `#f8f8f8` border, offset), `已选中{count}个项目` (16/600), `清除`; right: `⬇ 更新` (green), `分享 ˅`, `⏻ 启用` (`PowerIcon`), `⭘ 禁用` (`PowerOffIcon`), │, `🗑 删除` (red). Bulk ops show a 4px pink progress bar along the bottom and text like `正在禁用 3/12 项目……`.

### 5.6 Empty state

`EmptyState` (empty-inbox illustration, ≤200px) — `没有安装内容` (24px/600) / `浏览或上传内容以开始使用` (14px `#484d54`) + `[⟳ 刷新]` outlined + `[🧭 浏览内容]` brand.

---

## 6. Worlds tab — 世界

Files: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Worlds.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\WorldItem.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\utils\game-modes.ts`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\WorldEditor.vue`.

### 6.1 Toolbar

- Row 1 (gap 8): search h 40 placeholder `搜索 {count} 个世界……`; `[＋ 添加服务器]` outlined h 40; **`[🧭 浏览服务器]` brand** h 40 (→ `/browse/server?i=…&from=worlds`); `[🌍 浏览地图]` outlined h 40 (`WorldIcon`, → `/browse/world?…&from=world-maps`).
- Row 2: `FilterIcon` 20 `#484d54` + filter pills (bordered: 1px `#ddd`, bg `#fff`; active 1px pink border + 25% pink fill + pink text): `全部`, [`单人游戏`], [`原版` `模组适配`], [`在线` `离线`] (only shown when both kinds exist); right: quiet `⟳ 刷新`.

### 6.2 World row (`WorldItem.vue`, non-flat)

```
grid: [auto | 3fr | 4fr | auto], gap 8, items-center, radius 8, bg #f5f5f5, shadow-card, padding 12; list gap 8
[48px world icon] │ 新的世界 (18px bold #1a202c)  👤 单人游戏 (14/600 #484d54, icon stroke 3)
                  │ 上次游玩于10小时前 (14px #484d54)
                  │                 ⛏ 生存模式 (16/600 #484d54, centered)   │ [▷ 开始游戏] [⋮ 36 circle]
```
- World icon = the save's own `icon.png` thumbnail (smooth), Avatar 48 radius 8 framed; missing → grey cube.
- Game mode (icon 16px + label): survival `PickaxeIcon` `生存模式`; creative `BlocksIcon` `创造模式`; adventure `CompassIcon` `冒险模式`; spectator `EyeIcon` `旁观模式`; hardcore → `SkullIcon` **`极限模式` in red**.
- Server rows: name + signal icon (green bars by ping) + `{count} 人在线` or `NoSignalIcon 离线`; middle column = MOTD in **Minecraft font** (`font-minecraft`, CDN `regular.otf`), 2-line clamp; fallback text `Minecraft 服务器` / red `无法连接至服务器`.
- Action: **`Button` base md** (white, 36h, radius 12) wrapping an inner button: `▷ 开始游戏` (play icon 16px — svg is not a direct child so it falls back to 1em **(inferred)**); while this world launches → spinner; when this world is running → red `⏹ 停止`. Quick-play into a singleplayer world requires MC ≥1.20 (tooltip `只能在 Minecraft 1.20 及以后的版本中快速进入单人游戏世界`). → *Every world row carries its own little “开始游戏” — a family of decoy buttons, and literally “进入世界”.*
- ⋮ menu (singleplayer, inside the Worlds tab): `✎ 编辑`, `📂 打开文件夹`, `📌 固定到主页`, `↗ 创建快照` (sic, zh for “Create shortcut”), —, `🗑 删除` (red, `hoverFilled`). Server rows swap in `⟳ 刷新`, `⧉ 复制地址` and use `删除` (`button.remove`).
- **Arrival highlight** (`?highlight=` query, used when jumping here from Home): row brightens to 1.25 and gets a **1.5px pink border + 8px pink glow** at 50% that fades over **4s ease-out**. ★ ready-made “landing” effect.
- Empty: `未添加服务器或世界` / `通过添加一个服务器或点击浏览以开始` + the three buttons.

### 6.3 World editor (`/instance/:id/worlds/:world/edit`, crumb `编辑存档`)

Header: 48px-ish icon with hover `重设图标`, title 24px/800, chips (`模组存档`, red `极限模式`), `最后游玩于 {ago}`. Sections (h2 18px/800): `基本设置` (名称, 游戏模式, 难度 和平/简单/普通/困难, 允许作弊), **`世界种子`** (orange admonition `修改种子只影响新地形` + **monospace** seed input, max-w 448), `游戏规则`. → The seed field is the natural bridge to Lab **种子地图** (no code link between them — creative connection only, **inferred**).

---

## 7. Logs tab — 日志 (console)

Files: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Logs.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\console\layout.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\console\components\LogViewport.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\console\components\ConsoleFilterPills.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\console\components\ConsoleActionButtons.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\console\composables\log-highlight.ts` (ported from LogShare, MIT).

- Row 1: search h 40 `搜索日志` + source Combobox **220px** (`实时日志`, then file names like `latest.log`, `日志 {n}`).
- Row 2: filter pills `错误` `警告` `信息` — **all three active by default** (25% pink fill, pink text); right: `换行` (chip toggle, `WrapTextIcon`), font-size Combobox 112px (`8px … 24px`, default **12px**), `✕ 清除` (live only), `⇪ 分享`, `⤢ 展开` (fullscreen) / `收起`.
- Viewport: wrapper radius 20, overflow hidden; bg **`#f5f5f5`**, text `#2c2e31`, **mono 12px, line-height 1.4 → 17px rows**, no wrap by default (horizontal scroll). Line-number gutter **52px**, bg `#f8f8f8`, right-aligned `#484d54`, then 8px padding.
- Highlighting for `[10:42:07] [Render thread/INFO]: Setting user: …`:
  - `[10:42:07]` → `#1f68c0`, weight 500.
  - `[Render thread/` → `#1f68c0` at 85% opacity.
  - `INFO` → `#00af5c` 500; `WARN` → `#e08325` 600; `ERROR`/`FATAL` → `#cb2245` 600.
  - whole line bg: error → `#f1e0e3` (red 10%), warning → `#f3eae0` (orange 10%); search hits `<mark>` blue 45%.
  - Stack traces: class orange, location blue, `Caused by` red; mod lists purple headers / blue ids / `#d4a72c` versions; MC § colour codes rendered with the 16 classic colours (`#55ff55`, `#ffaa00` …).
- Floating “scroll to bottom”: `Button highlight xl circular` (48px, `ChevronDownIcon`) bottom-right 16px.
- Empty: **`暂无日志` / `点击右上角「开始游戏」即可接收实时日志`** — the console points at the button's empty parking spot (gag opportunity).
- Crash analysis admonitions (red “critical”) may appear above the toolbar after a crash.

---

## 8. Files & Screenshots tabs (brief)

- **文件** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Files.vue` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\files-tab\layout.vue`): same table language (radius 20, 1px `#fff`, `shadow-sm`, rows on `#f5f5f5`), breadcrumb navbar, `打开 Studio` (`CodeIcon`). Right-click a **`.litematic`/`.schem`** file → **`在投影工坊中打开`** (`FileArchiveIcon`) → Lab 投影工坊. ★ second real portal.
- **截图** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Screenshots.vue` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\screenshots-page\index.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\screenshots-page\card.vue`): heading `截图` 24px bold; grid 1 / 2 (sm) / 4 (2xl) columns, gap 12; card `aspect-video`, radius 12, 1px `#ddd`, bg `#f5f5f5`, `shadow-sm`, hover `brightness(1.1)` + bottom gradient caption + action buttons sliding up 4px; selection dot 24px top-right turns pink with white check. Empty: `暂无截图` / `在游戏中截取的截图将显示在这里。`.

---

## 9. Create-instance flow

### 9.1 `/create` landing (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Create.vue`)

Centered column, max-w 672, gap 24: `创建实例` (24px/700) + subtitle 14px `#484d54` `实例是带有特定加载器、游戏版本和模组的一套 Minecraft 配置。`; two `BigOptionButton`s side by side (gap 16): **`✦ 全新创建`** (`SparklesIcon`) `创建一个新的 Minecraft 实例，自选模组加载器。` and **`📂 导入已有`** `从其他启动器导入实例，或安装整合包。`; quiet `← 返回库`.
BigOptionButton (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\BigOptionButton.vue`): radius 20, padding 12, gap 12, bg `#fff` (selected: 25% pink); icon box 48 with 28px icon `#484d54` stroke 1.5; title 16/600 `#1a202c`; description 14/500 `#2c2e31`; `ChevronRightIcon` fades in on hover; hover `brightness(1.1)`, press `scale(.98)`.

### 9.2 Modal 「创建实例」 (`CreationFlowModal type="instance"`, mounted in `App.vue` ~L2909)

Files: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\flows\creation-flow-modal\index.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\flows\creation-flow-modal\components\CustomSetupStage.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\flows\creation-flow-modal\components\SetupTypeStage.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\flows\creation-flow-modal\stages\custom-setup-stage.ts`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\MultiStageModal.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\modal\NewModal.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\utils\loaders.ts`.

- Frame: width **550px**, radius 16, bg `#f8f8f8`, 1px `#ddd`; header `p-24` + bottom border, title `创建实例` 18px→20px (sm) bold `#1a202c`, close = base md circular 36 `XIcon`. Content padding 24 (bottom 4, `!pb-1`), `space-y 24`, max 72vh scroll with 24px fade edges. Actions bar `p-16` (+16 top margin), buttons right-aligned gap 8: `[← 返回]` outlined + **`[＋ 创建实例]` colored brand** (spinner when loading). Overlay: `linear-gradient(to bottom, mix(brand-shadow 10%, rgba(0,0,0,.52)), mix(brand-shadow 2%, rgba(0,0,0,.95)))` + blur 5px. Progress bar disabled.
- Fields in order (labels 16px/600 `#1a202c`, gap 8):
  1. **Icon**: framed Avatar **80px** (radius 13.33) + column `[⇪ 选择图标]` / `[✕ 移除图标]` (outlined md). The default preview **follows the selected loader**: vanilla → `grass-block.png`, Fabric/Legacy Fabric/Babric → `Fabric.png`, Forge → `anvil.png`, NeoForge → `NeoForge.png` (pixel fox), Quilt → `Quilt.png`, OptiFine → `OptiFine.png`, Cleanroom → `Cleanroom.png`, LiteLoader → `LiteLoader.png`; unknown → `stone.png`. ★ swapping chips makes the icon morph — a ready-made transformation beat.
  2. `名称`: StyledInput, placeholder = auto name `${gameVersion}-${Loader}` (e.g. `26.2-Fabric`; vanilla → `1.21.1-Vanilla`) or `输入实例名称`.
  3. `游戏目录`: RadioButtons — `◉ Axolotl 目录` (row bg `#fff`, radius 12, brand radio icon) + configured `.minecraft` paths.
  4. `游戏版本`: chips `正式版` `快照版` `愚人节版` `远古版` + searchable Combobox (`选择游戏版本` / `搜索游戏版本……`).
  5. `加载器` chips (zh UI, verbatim): **`None`** · `Fabric` · `NeoForge` · `Forge` · `Quilt` · `OptiFine` · `Cleanroom` · `LiteLoader` · `Legacy Fabric` · `Babric`. Default selected = vanilla, shown as **“None”** because `loader.vanilla` has no translation (falls back to English defaultMessage). Unsupported loaders for the chosen version are disabled with tooltip `此加载器不支持所选游戏版本`.
  6. `加载器版本` (collapsible, hidden for vanilla) + summary `将会安装：Fabric 0.17.2` + chips `稳定版` `最新版` `其他`.
  7. `附加加载器` checkboxes (Forge: LiteLoader/OptiFine; NeoForge/Fabric: OptiFine) + hint `下载前会自动选择兼容版本。`.
- If opened without `skipSetupType`, a first stage `选择实例类型` offers BigOptionButtons (with 56px bordered icon boxes): `自定义设置` (BoxesIcon), `安装整合包` (PackageIcon; zh text mentions “Modrinth” — avoid showing), `导入实例` (BoxImportIcon), footnote `实例是带有特定加载器、游戏版本和模组的一套 Minecraft 配置。`.
- After create → modal hides, a new card appears in the library in installing state (spinner over dimmed icon) and the button becomes `安装中……` until installed (§3.3/§4.3).

---

## 10. zh-CN string catalogue (verbatim, with ids)

> Source JSONs listed in §0. `{…}` are ICU placeholders. All rows verified by script against both locale files.

### Library page (实例库) — tabs, toolbar, grouping, view

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `app.library.title` | 实例库 | Library |
| `app.navigation.library` | 实例库 | Library |
| `app.library.tabs.all-instances` | 全部实例 | All instances |
| `app.library.tabs.modpacks` | 整合包 | Modpacks |
| `app.library.tabs.servers` | 服务器 | Servers |
| `app.library.tabs.custom` | 自定义 | Custom |
| `app.library.no-instances` | 未找到实例 | No instances found |
| `app.library.create-instance` | 创建新实例 | Create new instance |
| `app.library.group.new` | 新建分组 | New group |
| `app.instances.search` | 搜索 | Search |
| `app.instances.select` | 请选择…… | Select... |
| `app.instances.sort-by` | 排序方式 | Sort by |
| `app.instances.sort.name` | 名称 | Name |
| `app.instances.sort.last-played` | 上次游玩 | Last played |
| `app.instances.sort.date-created` | 创建日期 | Date created |
| `app.instances.sort.date-modified` | 修改日期 | Date modified |
| `app.instances.group.game-version` | 游戏版本 | Game version |
| `app.instances.sort.direction.asc-alphabetical` | A–Z 正序 | A–Z |
| `app.instances.sort.direction.desc-alphabetical` | Z–A 倒序 | Z–A |
| `app.instances.sort.direction.asc-version` | 旧版本在前 | Oldest version first |
| `app.instances.sort.direction.desc-version` | 新版本在前 | Newest version first |
| `app.instances.sort.direction.asc-recency` | 最早游玩在前 | Least recent first |
| `app.instances.sort.direction.desc-recency` | 最近游玩在前 | Most recent first |
| `app.instances.sort.direction.asc-date` | 最早的在前 | Oldest first |
| `app.instances.sort.direction.desc-date` | 最新的在前 | Newest first |
| `app.instances.group-by` | 分组方式 | Group by |
| `app.instances.group.group` | 分组 | Custom group |
| `app.instances.group.loader` | 加载器 | Loader |
| `app.instances.group.none` | 无 | No grouping |
| `app.instances.group.ungrouped` | 无分组 | No group |
| `app.instances.group.pinned` | 已置顶 | Pinned |
| `app.instances.group.empty` | 拖放实例到此处添加。 | Drag and drop to add instances. |
| `app.instances.group.collapse` | 折叠分组 | Collapse group |
| `app.instances.group.expand` | 展开分组 | Expand group |
| `app.instances.group.new-instance` | 新建实例 | New instance |
| `app.instances.group.add-to-group` | 添加到分组 | Add to group |
| `app.instances.group.edit-name` | 编辑分组名称 | Edit group name |
| `app.instances.group.delete-group` | 删除分组 | Delete group |
| `app.instances.group.move-up` | 上移分组 | Move group up |
| `app.instances.group.move-down` | 下移分组 | Move group down |
| `app.library.view` | 视图 | View |
| `app.library.view.standard` | 标准网格 | Standard grid |
| `app.library.view.cards` | 实例库卡片 | Library cards |
| `app.instances.selected-count` | 已选择 {count} 个 | {count, plural, one {# selected} other {# selected}} |
| `app.library.selection.new-group` | 新建分组 | New group |
| `app.library.selection.remove-from-group` | 移出分组 | Remove from group |

### Instance card + library context menu

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `button.play` | 开始游戏 | Play |
| `button.stop` | 停止 | Stop |
| `button.repair` | 修复 | Repair |
| `label.installing` | 安装中…… | Installing... |
| `app.instance.loading` | 实例正在加载…… | Instance is loading... |
| `app.instance.offline-installed-only` | 离线模式只能启动已完整下载的实例。 | Offline mode can only launch fully downloaded instances. |
| `app.library.context-menu.pin-instance` | 置顶实例 | Pin instance |
| `app.library.context-menu.unpin-instance` | 取消置顶 | Unpin instance |
| `app.instances.add-content` | 添加内容 | Add content |
| `app.instances.view-instance` | 查看实例 | View instance |
| `app.instances.duplicate-instance` | 复制实例 | Duplicate instance |
| `app.instances.pin-to-home` | 固定到主页 | Pin to Home |
| `app.instances.unpin-from-home` | 取消固定 | Unpin from Home |
| `button.open-folder` | 打开文件夹 | Open folder |
| `app.instances.copy-path` | 复制路径 | Copy path |
| `app.library.context-menu.remove-from-group` | 移出分组 | Remove from group |
| `label.delete` | 删除 | Delete |

### Instance page header, primary button states, overflow menu, tabs

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `app.instance.never-played` | 从未游玩 | Never played |
| `app.instance.post-upgrade-status` | 已升级至 {version} | Upgraded to {version} |
| `app.instance.linked-to` | 关联到 | Linked to |
| `button.play` | 开始游戏 | Play |
| `app.instance.starting` | 正在启动…… {seconds, number} 秒 | Starting... {seconds, number}s |
| `button.stop` | 停止 | Stop |
| `app.instance.stopping` | 正在停止…… | Stopping... |
| `label.installing` | 安装中…… | Installing... |
| `button.repair` | 修复 | Repair |
| `app.instance.join-server` | 加入服务器 | Join server |
| `app.instance.launch-instance` | 启动实例 | Launch instance |
| `app.instance.settings` | 实例设置 | Instance settings |
| `button.open-folder` | 打开文件夹 | Open folder |
| `app.instance.export-modpack` | 导出整合包 | Export modpack |
| `app.instance.create-shortcut` | 创建快捷方式 | Create shortcut |
| `app.instance.upgrade-instance` | 升级实例 | Upgrade instance |
| `app.instance.tabs.content` | 内容 | Content |
| `app.instance.tabs.files` | 文件 | Files |
| `app.instance.tabs.screenshots` | 截图 | Screenshots |
| `app.instance.tabs.worlds` | 世界 | Worlds |
| `app.instance.tabs.logs` | 日志 | Logs |
| `button.edit` | 编辑 | Edit |
| `app.instance.copy-names` | 复制名称 | Copy names |
| `app.instance.copy-slugs` | 复制短标识 | Copy slugs |
| `app.instance.copy-links` | 复制链接 | Copy links |
| `app.instance.toggle-selected` | 切换所选项 | Toggle selected |
| `app.instance.disable-selected` | 禁用所选项 | Disable selected |
| `app.instance.enable-selected` | 启用所选项 | Enable selected |
| `app.instance.update-selected` | 更新所选项 | Update selected |
| `app.instance.update-all` | 全部更新 | Update all |
| `app.instance.select-updatable` | 选择可更新项 | Select updatable |
| *(not localized)* | `N hours` / `N minutes` / `N seconds` | play-time stat, hard-coded English in `Index.vue` `timePlayedHumanized` |

### Content tab (内容) — toolbar, filters, table, rows, selection bar

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `content.page-layout.search-placeholder` | 搜索到 {count, number}个{contentType}…… | Search {count, number} {contentType}... |
| `app.instance.mods.content-type-project` | 项目 | project |
| `content.page-layout.browse-content` | 浏览内容 | Browse content |
| `content.page-layout.view-dependencies` | 查看依赖关系 | View dependencies |
| `button.refresh` | 刷新 | Refresh |
| `project-type.all` | 全部 | All |
| `project-type.mod.category` | 模组 | Mods |
| `project-type.resourcepack.category` | 资源包 | Resource Packs |
| `project-type.shader.category` | 光影包 | Shaders |
| `project-type.datapack.category` | 数据包 | Data Packs |
| `project-type.schematic.category` | 投影 | Schematics |
| `content.filter.duplicates` | 重复 | Duplicates |
| `content.filter.updates` | 可更新 | Update available |
| `content.filter.enabled` | 已启用 | Enabled |
| `content.filter.disabled` | 已禁用 | Disabled |
| `content.metadata-filter.toggle` | 筛选 | Filter |
| `content.metadata-filter.toggle-active` | 筛选（已启用 {count, number} 项） | Filter ({count, number} active) |
| `content.page-layout.sort.label` | 按{mode}排序 | Sort by {mode} |
| `content.page-layout.sort.project-name-ascending` | 项目名称 A-Z | Project name A-Z |
| `content.page-layout.sort.project-name-descending` | 项目名称 Z-A | Project name Z-A |
| `content.page-layout.sort.file-name-ascending` | 文件名 A-Z | File name A-Z |
| `content.page-layout.sort.file-name-descending` | 文件名 Z-A | File name Z-A |
| `content.page-layout.sort.date-added-newest` | 按从新到旧顺序 | Newest first |
| `content.page-layout.sort.date-added-oldest` | 按从旧到新顺序 | Oldest first |
| `content.page-layout.reset-view` | 重置视图 | Reset view |
| `content.page-layout.pin-view` | 固定当前视图 | Pin current view |
| `content.page-layout.unpin-view` | 取消固定当前视图 | Unpin current view |
| `app.instance.mods.update-added-content` | 更新后装内容 | Update added content |
| `app.instance.mods.update-added-content.description` | 仅更新整合包安装后添加的内容，不会更改整合包自带文件。 | Updates only content added after the modpack was installed. Modpack files are not changed. |
| `label.update-available` | 有可用更新 | Update available |
| `button.switch-version` | 切换版本 | Switch version |
| `label.delete-immediately` | 立即删除 | Delete immediately |
| `content.card.dependency-badge` | 前置 | Dependency |
| `content.card.orphaned-dependency-badge` | 孤立前置 | Orphaned dependency |
| `content.card.duplicate-mod` | 此模组已安装 {count, number} 次。 | This mod is installed {count, number} times. |
| `content.card.pending-manual-download` | 需要手动下载 | Manual download required |
| `content.card.rollback-tooltip` | 回滚到 {fileName} | Roll back to {fileName} |
| `label.unknown` | 未知 | Unknown |
| `instance.files.open-in-schematic-workshop` | 在投影工坊中打开 | Open in schematic workshop |
| `content.page-layout.no-content-found` | 未找到内容。 | No content found. |
| `content.page-layout.empty.no-content-installed` | 没有安装内容 | No content installed |
| `content.page-layout.empty.hint` | 浏览或上传{contentType}以开始使用 | Browse or upload {contentType} to get started |
| `content.selection-bar.selected-count` | 已选中{count, number}个{contentType} | {count, number} {contentType} selected |
| `button.clear` | 清除 | Clear |
| `button.enable` | 启用 | Enable |
| `button.disable` | 禁用 | Disable |
| `button.update` | 更新 | Update |
| `content.page-layout.share.label` | 分享 | Share |
| `content.selection-bar.bulk.disabling` | 正在禁用 {progress}/{total} {contentType}…… | Disabling {progress}/{total} {contentType}... |
| `app.instance.mods.drag-drop-hint` | 释放文件以安装到当前实例 | Release the file to install it into the current instance |

### Worlds tab (世界) + world editor

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `app.instance.worlds.search-worlds-placeholder` | 搜索 {count} 个世界…… | Search {count} worlds... |
| `app.instance.worlds.add-server` | 添加服务器 | Add server |
| `app.instance.worlds.browse-servers` | 浏览服务器 | Browse servers |
| `app.instance.worlds.browse-maps` | 浏览地图 | Browse maps |
| `app.instance.worlds.no-worlds-heading` | 未添加服务器或世界 | No servers or worlds added |
| `app.instance.worlds.no-worlds-description` | 通过添加一个服务器或点击浏览以开始 | Add a server or browse to get started |
| `label.singleplayer` | 单人游戏 | Singleplayer |
| `app.instance.worlds.filter-vanilla` | 原版 | Vanilla |
| `app.instance.worlds.filter-modded` | 模组适配 | Modded |
| `app.instance.worlds.filter-online` | 在线 | Online |
| `app.instance.worlds.filter-offline` | 离线 | Offline |
| `label.played` | 上次游玩于{ago} | Played {ago} |
| `app.world.world-item.not-played-yet` | 暂未游玩 | Not played yet |
| `app.world.world-item.players-online` | {count} 人在线 | {count} online |
| `app.world.world-item.offline` | 离线 | Offline |
| `instance.worlds.a_minecraft_server` | Minecraft 服务器 | A Minecraft Server |
| `instance.worlds.cant_connect` | 无法连接至服务器 | Can't connect to server |
| `instance.worlds.game_mode.survival` | 生存模式 | Survival mode |
| `instance.worlds.game_mode.creative` | 创造模式 | Creative mode |
| `instance.worlds.game_mode.adventure` | 冒险模式 | Adventure mode |
| `instance.worlds.game_mode.spectator` | 旁观模式 | Spectator mode |
| `instance.worlds.hardcore` | 极限模式 | Hardcore mode |
| `instance.worlds.game_already_open` | 实例已启动 | Instance is already open |
| `instance.worlds.no_singleplayer_quick_play` | 只能在 Minecraft 1.20 及以后的版本中快速进入单人游戏世界 | You can only jump straight into singleplayer worlds on Minecraft 1.20+ |
| `instance.worlds.copy_address` | 复制地址 | Copy address |
| `instance.worlds.play_instance` | 游玩实例 | Play instance |
| `instance.worlds.view_instance` | 查看实例 | View instance |
| `instance.worlds.create_shortcut` | 创建快照 | Create shortcut |
| `app.navigation.edit-world` | 编辑存档 | Edit world |
| `app.world-editor.section.basic` | 基本设置 | Basic settings |
| `app.world-editor.game-mode.label` | 游戏模式 | Game mode |
| `app.world-editor.difficulty.label` | 难度 | Difficulty |
| `app.world-editor.section.seed` | 世界种子 | World seed |
| `app.world-editor.seed.warning-heading` | 修改种子只影响新地形 | Changing the seed only affects new terrain |
| `app.world-editor.section.game-rules` | 游戏规则 | Game rules |
| `app.world-editor.badge.modded` | 模组存档 | Modded |
| `app.world-editor.last-played` | 最后游玩于 {ago} | Last played {ago} |

### Logs tab (日志)

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `console.search.placeholder` | 搜索日志 | Search logs |
| `instance.logs.source.live` | 实时日志 | Live Log |
| `instance.logs.source.numbered` | 日志 {index} | Log {index} |
| `console.filter.error` | 错误 | Error |
| `console.filter.warn` | 警告 | Warn |
| `console.filter.info` | 信息 | Info |
| `console.log.wrap-label` | 换行 | Wrap |
| `console.log.toggle-wrap` | 切换换行 | Toggle line wrapping |
| `button.clear` | 清除 | Clear |
| `console.action.share` | 分享 | Share |
| `console.action.expand` | 展开 | Expand |
| `console.action.collapse` | 收起 | Collapse |
| `console.empty.instance-title` | 暂无日志 | No logs yet |
| `console.empty.instance-description` | 点击右上角「开始游戏」即可接收实时日志 | Click the Play button to start receiving live logs. |
| `console.log-viewport.scroll-to-bottom` | 滚动到底部 | Scroll to bottom |
| `console.crash.export-context` | 导出崩溃上下文 | Export crash context |

### Screenshots / Files tabs (brief)

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `app.screenshots.heading` | 截图 | Screenshots |
| `app.screenshots.empty-heading` | 暂无截图 | No screenshots yet |
| `app.screenshots.empty-description` | 在游戏中截取的截图将显示在这里。 | Screenshots you take in-game will appear here. |
| `instance.files.open-studio` | 打开 Studio | Open Studio |

### Create instance (/create page + 创建实例 modal)

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `create.title` | 创建实例 | Create Instance |
| `create.subtitle` | 实例是带有特定加载器、游戏版本和模组的一套 Minecraft 配置。 | Start a new adventure or bring your existing worlds |
| `create.new.title` | 全新创建 | Start Fresh |
| `create.new.description` | 创建一个新的 Minecraft 实例，自选模组加载器。 | Create a new Minecraft instance from scratch. |
| `create.import.title` | 导入已有 | Import Existing |
| `create.import.description` | 从其他启动器导入实例，或安装整合包。 | Import instances from other launchers or install a modpack. |
| `create.back` | 返回库 | Back to Library |
| `creation-flow.title.create-instance` | 创建实例 | Create instance |
| `creation-flow.modal.setup-type.title.instance` | 选择实例类型 | Choose instance type |
| `creation-flow.modal.setup-type.option.custom-setup.title` | 自定义设置 | Custom setup |
| `creation-flow.modal.setup-type.option.custom-setup.description` | 从头开始，选择一个加载器和游戏版本。 | Start from scratch by picking a loader and game version. |
| `creation-flow.modal.setup-type.option.modpack-base.title` | 安装整合包 | Install modpack |
| `creation-flow.modal.setup-type.option.modpack-base.description` | 在 Modrinth 上浏览整合包或从文件中导入一个。 | Browse modpacks on Modrinth or import one from a file. |
| `creation-flow.modal.setup-type.option.import-instance.title` | 导入实例 | Import instance |
| `creation-flow.modal.setup-type.option.import-instance.description` | 从 Prism、CurseForge 或类似平台导入实例。 | Import an instance from Prism, CurseForge, or similar. |
| `creation-flow.modal.setup-type.instance.description` | 实例是带有特定加载器、游戏版本和模组的一套 Minecraft 配置。 | An instance is a Minecraft setup with a specific loader, version, and mods. |
| `creation-flow.modal.custom-setup.icon.select` | 选择图标 | Select icon |
| `creation-flow.modal.custom-setup.icon.remove` | 移除图标 | Remove icon |
| `creation-flow.modal.custom-setup.name.label` | 名称 | Name |
| `creation-flow.modal.custom-setup.name.placeholder` | 输入实例名称 | Enter instance name |
| `creation-flow.modal.custom-setup.game-dir.label` | 游戏目录 | Game directory |
| `creation-flow.modal.custom-setup.game-dir.managed` | Axolotl 目录 | Axolotl directory |
| `label.game-version` | 游戏版本 | Game version |
| `creation-flow.modal.custom-setup.game-version-type.release` | 正式版 | Release |
| `creation-flow.modal.custom-setup.game-version-type.snapshot` | 快照版 | Snapshot |
| `creation-flow.modal.custom-setup.game-version-type.alpha` | 愚人节版 | April Fools |
| `creation-flow.modal.custom-setup.game-version-type.ancient` | 远古版 | Ancient |
| `creation-flow.modal.custom-setup.game-version.placeholder` | 选择游戏版本 | Select game version |
| `creation-flow.modal.custom-setup.game-version.search-placeholder` | 搜索游戏版本…… | Search game version... |
| `creation-flow.modal.custom-setup.loader.label` | 加载器 | Mod Loader |
| `loader.vanilla` | **None** *(no zh-CN/en-US entry → English defaultMessage; this is what the vanilla chip shows)* | None |
| *(loader chip labels, not translated)* | Fabric · NeoForge · Forge · Quilt · OptiFine · Cleanroom · LiteLoader · Legacy Fabric · Babric | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\utils\loaders.ts` `loaderDisplayNames` |
| `creation-flow.modal.custom-setup.loader-version.label` | 加载器版本 | Mod Loader version |
| `creation-flow.modal.custom-setup.will-install-loader-version` | 将会安装：{loader} {version} | Will install: {loader} {version} |
| `creation-flow.modal.custom-setup.loader-version-type.stable` | 稳定版 | Stable |
| `creation-flow.modal.custom-setup.loader-version-type.latest` | 最新版 | Latest |
| `creation-flow.modal.custom-setup.loader-version-type.other` | 其他 | Custom |
| `creation-flow.modal.custom-setup.adjunct.label` | 附加加载器 | Additional loaders |
| `creation-flow.modal.custom-setup.loader.unsupported-tooltip` | 此加载器不支持所选游戏版本 | This loader does not support the selected game version |
| `button.back` | 返回 | Back |
| `creation-flow.button.create-instance` | 创建实例 | Create instance |

### Navigation / status (cross-reference)

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `app.navigation.home` | 主页 | Home |
| `app.navigation.lab` | 实验室 | Lab |
| `app.lab.seed-map.title` | 种子地图 | Seed map |
| `app.lab.schematic-preview.title` | 投影工坊 | Schematic workshop |
| `app.navigation.screenshots` | 截图中心 | Screenshots |
| `app.action-bar.no-instances-running` | 没有运行中的实例 | No instances running |
| `app.home.calendar.play` | 启动 | Play |

### Onboarding copy (the product's own playful voice)

| id | zh-CN (verbatim) | en-US |
|---|---|---|
| `app.onboarding.library.title` | 你的启动书架 | Your launch shelf |
| `app.onboarding.library.description` | 实例会把版本、加载器、内容和存档分开。不会意外炖成一锅模组汤。 | Instances keep versions, loaders, content, and saves separate. No accidental mod soup. |
| `app.onboarding.library-page.title` | 各就各位 | Everything, in its place |
| `app.onboarding.library-page.description` | 按整合包、服务器或自定义配置筛选，再打开任意实例管理。 | Filter by modpack, server, or custom setup, then open any instance to manage it. |
| `app.onboarding.instance-actions.title` | 主操作台 | The main controls |
| `app.onboarding.instance-actions.description` | 从实例页头部启动、停止、修复、配置、导出或打开这个实例。 | Launch, stop, repair, configure, export, or open the instance from its header. |
| `app.onboarding.instance-tabs.title` | 剩下的工作台 | The rest of the workshop |
| `app.onboarding.instance-tabs.description` | 内容、文件、截图、世界和日志都在这些标签里。乱中有序。 | Use these tabs for content, files, screenshots, worlds, and logs. Tidy chaos. |
| `app.onboarding.create.title` | 开个新档 | Make a fresh start |
| `app.onboarding.create.description` | 从零开始，或导入已有实例或整合包。你说了算。 | Start from scratch or bring in an existing instance or modpack. Your call. |
| `app.onboarding.creation-loader.title` | 选个引擎 | Choose the engine |
| `app.onboarding.creation-loader.description` | Vanilla、Fabric、Forge、NeoForge 和它们的朋友们，按内容需要来选。 | Vanilla, Fabric, Forge, NeoForge, and friends. Pick what your content needs. |
| `app.onboarding.creation-confirm.title` | 最后看一眼 | One last look |
| `app.onboarding.creation-confirm.description` | 这里会按你的选择创建实例。我坚持不替你按确认。 | This creates the instance with your choices. I keep a strict hands-off policy. |

---

## 11. Icon map (component → SVG file)

Icons are Lucide/Feather-style strokes (`stroke-width 2`, round caps/joins, `currentColor`, 24×24 viewBox) exported from `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\generated-icons.ts`. Base folder: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\`.

| Component | File | Used for |
|---|---|---|
| **PlayIcon** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\play.svg` (`<polygon points="5 3 19 12 5 21 5 3">`, outlined) | 开始游戏 everywhere |
| StopCircleIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\stop-circle.svg` | 停止 |
| SpinnerIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\spinner.svg` (25% ring + 75% arc) | launching/installing |
| DownloadIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\download.svg` | 修复, update-available (green), bulk 更新 |
| SettingsIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\settings.svg` | 实例设置 |
| MoreVerticalIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\more-vertical.svg` | ⋮ menus |
| BoxIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\box.svg` | game-version stat |
| BoxesIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\boxes.svg` | 内容 tab, 自定义设置 |
| FolderOpenIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\folder-open.svg` | 文件 tab, 打开文件夹, 导入已有 |
| ImageIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\image.svg` | 截图 tab |
| GlobeIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\globe.svg` | 世界 tab |
| TerminalSquareIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\terminal-square.svg` | 日志 tab |
| GameIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\game.svg` (gamepad) | card subtitle |
| TimerIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\timer.svg` | compact card “played” |
| SearchIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\search.svg` | all search inputs |
| PlusIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\plus.svg` | 创建新实例 / 新建分组 / 创建实例 |
| CompassIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\compass.svg` | 浏览内容 / 浏览服务器 / adventure mode |
| GitGraphIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\git-graph.svg` | 查看依赖关系 |
| RefreshCwIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\refresh-cw.svg` | 刷新 |
| ArrowUpDownIcon / SortAscIcon / SortDescIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\arrow-up-down.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\sort-asc.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\sort-desc.svg` | library sort |
| LayersIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\layers.svg` | library group-by |
| GridIcon / CollectionIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\grid.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\collection.svg` | library view modes |
| DropdownIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\dropdown.svg` | group collapse chevron |
| ArrowDownAZIcon / ArrowUpZAIcon / ClockArrowDownIcon / ClockArrowUpIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\arrow-down-a-z.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\arrow-up-z-a.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\clock-arrow-down.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\clock-arrow-up.svg` | content sort |
| PinIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\pin.svg` | 固定到主页 / pin view |
| StarIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\star.svg` | 置顶实例 |
| ArrowLeftRightIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\arrow-left-right.svg` | 切换版本 |
| PencilIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\pencil.svg` | 在投影工坊中打开 (content row) |
| FileArchiveIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\file-archive.svg` | 在投影工坊中打开 (files) |
| TrashIcon / TrashExclamationIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\trash.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\trash-exclamation.svg` | delete |
| UndoIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\undo.svg` | rollback |
| ClockIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\clock.svg` | version date |
| TriangleAlertIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\triangle-alert.svg` | warnings |
| CheckIcon / MinusIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\check.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\minus.svg` | checkbox, selected chip |
| PowerIcon / PowerOffIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\power.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\power-off.svg` | 启用 / 禁用 bulk |
| FilterIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\filter.svg` | filters |
| UserIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\user.svg` | 单人游戏 |
| PickaxeIcon / BlocksIcon / EyeIcon / SkullIcon / UnknownIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\pickaxe.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\blocks.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\eye.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\skull.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\unknown.svg` | game modes |
| SignalIcon / NoSignalIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\signal.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\no-signal.svg` | server ping |
| WorldIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\world.svg` | 浏览地图 |
| WrapTextIcon / ExpandIcon / ContractIcon / ShareIcon / XIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\wrap-text.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\expand.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\contract.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\share.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\x.svg` | console |
| PackageIcon / ExternalIcon / UpdatedIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\package.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\external.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\updated.svg` | header overflow |
| SparklesIcon / BoxImportIcon / UploadIcon / LeftArrowIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\sparkles.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\box-import.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\upload.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\left-arrow.svg` | create flow |
| RadioButtonIcon / RadioButtonCheckedIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\radio-button.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\radio-button-checked.svg` | 游戏目录 |
| LibraryIcon / HomeIcon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\library.svg`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\home.svg` | nav rail / crumbs |
| Loader tag icons (`getLoaderIcon`) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\tags\loaders\{vanilla,fabric,forge,neoforge,quilt,optifine,liteloader,…}.svg` | header loader stat |

Global rule: `svg { width: 1em; height: 1em }` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\defaults.scss`) — icons without size classes take the font-size (usually 16px).

---

## 12. Assets (absolute paths) & branding cautions

### 12.1 Built-in instance icons (frameless pixel art) — `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\`

| Default for loader | File | Size |
|---|---|---|
| vanilla | `grass-block.png` | 1024² |
| fabric / legacy_fabric / babric | `Fabric.png` | 52×56 (tiny pixel scroll) |
| forge | `anvil.png` | 300² |
| neoforge | `NeoForge.png` | 128² (pixel fox face) |
| quilt | `Quilt.png` | 851×852 (patchwork squares) |
| optifine | `OptiFine.png` | 256² |
| cleanroom | `Cleanroom.png` | 460² |
| lite_loader | `LiteLoader.png` | 160² |
| fallback | `stone.png` | 1024² |

Other pickable built-ins: `bread.png`, `carrot.png`, `cooked-chicken.png`, `crafting-table.png`, `diamond-axe.png`, `diamond-block.png`, `diamond-sword.png`, `end-stone.png`, `furnace.png`, `glass-bottle.png`, `golden-apple.png`, `gold-block.png`, `iron-block.png`, `item-frame.png`, `netherrack.png`, `oak-sapling.png`, `totem-of-undying.png`, `water-bucket.png` (isometric Minecraft renders, mostly 1024²). Contact sheet: `E:\GitHub\Axolotl-animation\research\_scratch\05-instance-icons-sheet.png`. Registry: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\instance-icons.ts`; frameless detection by SHA-1 list `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\instance-icon-frame.ts`.

### 12.2 “Modrinth 3D” icon set — `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\modrinth-3d\*.png` (45 files, 600², isometric 3D with drop shadow)

Beautiful for 2.5D, **but these are Modrinth-made assets** (picker category literally named “Modrinth 3D”). **Do not use `mr-pack.png` or `wrench-rinth.png` (“Modrinth Wrench”) — Modrinth brand mascots/marks.** Prefer the classic built-ins above; use the others only with art-director sign-off. Sheet: `E:\GitHub\Axolotl-animation\research\_scratch\05-instance-icons-3d-sheet.png`.

### 12.3 Axolotl-specific art in this area

- `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\icons\new-instance.svg` (= `add-project.svg`): pink voxel axolotl + cyan “＋” block (palette `#FE4592 #F0579A #FED5EB #DF3177 #43147C (eyes) #94E6E4 (cyan block)` …). Empty-library hero.
- Avoid in shots: any “Modrinth” text (`在 Modrinth 中打开`, `在 Modrinth 上浏览整合包…`), `ModrinthIcon` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\logo.svg`), the console empty-state for *servers* (`Welcome to your Modrinth server!` en default).

---

## 13. ★ Portals & story hooks (ranked, all grounded in real UI)

1. **The play button lives inside every instance icon (library standard card).** On hover the 48px pink disc grows out of the 48px icon (`scale .75→1`, origin-bottom, icon dims to 75%). The runaway button can *dive into* a card's icon (reverse: disc shrinks to .75 & fades while the icon re-brightens) → cut to that instance's page. Exit is symmetric.
2. **Pink disc hand-off in the nav rail.** Entering an instance: the solid pink circle leaves the Library nav icon (it turns white “subpage”) and lands on the 28px instance icon in the quick switcher. A perfect “the button jumped” visual rhyme.
3. **Instance header = the button's “home pose”.** 64px icon + title + the real `▷ 开始游戏` (xl, 48h, r16). Show it *empty* (button missing → the ⚙ disc and bare ⋮ slide left to fill the gap?) — the state machine (§4.3) gives free acting beats: `正在启动…… 3 秒` (nervous counting), red `停止` (panic), `安装中……`.
4. **NavTabs slider as the button's body.** The pink pill stretches with a 200ms trailing-edge delay when changing tabs: 内容 → 文件 → 截图 → 世界 → 日志. The button can *become* the slider and inchworm along the tab bar.
5. **Squeeze into a Toggle.** Content rows have 48×24 pink pills with a black knob; flicking a mod OFF greys its row (grayscale + 50%, 200ms). The button could hide among the toggles, turning one pink→white as it leaves.
6. **Chip / pill family.** `全部 87` filter pill, `Fabric ✓` loader chip, `错误/警告/信息` log pills — all 25%-pink capsules: the button can “deflate” into a tinted pill.
7. **Real exit to 投影工坊.** A `投影` row (e.g. `starter_house.litematic`) has the inline ✎ button **`在投影工坊中打开`**; Files tab right-click offers the same. Code jumps straight to `SchematicWorkshop` with that file.
8. **Real exit to Discover (search).** `🧭 浏览内容` (brand button) → content browser; `浏览服务器` / `浏览地图` from Worlds. Good bridge to “stretch into a search box”.
9. **Worlds → seed map.** World editor's monospace `世界种子` field ↔ Lab `种子地图` (thematic, not linked in code). World rows also carry their own `▷ 开始游戏` (direct “进入世界”).
10. **Landing glow.** World row arrival highlight (pink 1.5px border + glow fading over 4s) and the floating action bar's overshoot entrance are ready-made “arrival” moves in the product's own language.
11. **Gags with real copy:** Logs empty state `点击右上角「开始游戏」即可接收实时日志` pointing at an empty spot; context menu's first item `开始游戏` lighting up pink on hover; library empty state with the axolotl + `未找到实例`.
12. **Create-flow morph.** In 「创建实例」 the 80px icon swaps with the loader chip (grass block → Fabric scroll → NeoForge fox → Forge anvil → Quilt patchwork) and the modal itself grows from the click point (offset/16, scale .97→1).

---

## 14. Quirks, discrepancies, uncertainties

- **Label**: the button says `开始游戏`, not `启动` (see §4.3 note).
- **Play-time stat is English** (`37 hours`) even in zh-CN.
- **Vanilla loader chip reads “None”** in the create modal (missing translation).
- `create.subtitle` zh text differs in meaning from en (zh = definition of an instance).
- `instance.worlds.create_shortcut` zh = `创建快照` (“snapshot”), a mistranslation — verbatim.
- Header ⋮ trigger has no button styling in current code (bare 16px icon) **(inferred; could not run the app)**.
- Content-row avatar radius: class `rounded-2xl` vs Avatar scoped rule → 8px **(inferred from CSS specificity)**.
- Card hover darkness compounds two brightness filters **(inferred)**.
- World-row play icon size 16px (1em) because it's nested inside an inner `<button>` **(inferred)**.
- Mod icons in the content table are remote images; none ship in the repo — need neutral stand-ins.
- Reference screenshots are v1.6.0; code is v1.9.7 (e.g. breadcrumb icons, possibly other polish).
- Pixel sizes assume 1× and a 16px root; the macOS screenshots are 2× captures (2560px wide ≈ 1280 logical).
- I could not launch the app (read-only research); measurements of composite widths (tab ≈88px, play button ≈126px) are computed from metrics, not measured.
