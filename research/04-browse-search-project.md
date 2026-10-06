# 04 — Content discovery: Browse page · search · project card · project page · install flow

> Area owner report for the film 《启动按钮去哪了？》. Everything below was read out of the cloned source at
> `E:\GitHub\Axolotl-animation\upstream\Axolotl` (read-only). Values are **verified in code** unless tagged **(inferred)**.
> Theme baseline: **light theme + default pink accent** (`html.light-mode.accent-pink`). Dark theme deltas are given in §2.4.
> Units: Tailwind classes converted at 1rem = 16px (root font size is the browser default; `body { font-size:16px }`).

---

## 0. TL;DR for the animator

| What | Fact (light theme, pink) |
|---|---|
| Brand pink (the visual thread for our hero) | `--color-brand` = `--color-pink-600` = **`#db2777`** (dark theme `#f472b6`) |
| Pink tint used for selected/track fills | `rgba(219,39,119,.25)` (`--color-brand-highlight`) — over white ≈ `#f6c9dd` |
| Pink focus ring | 4px ring of `rgba(219,39,119,.68)` (`--color-brand-shadow`, `ring-4 ring-brand-shadow`) |
| Page / card / control surfaces | page `#ebebeb` · card `#f8f8f8` · input & base buttons `#ffffff` · strokes `#dddddd` |
| Text | primary `#1a202c` · default `#2c2e31` · tertiary `#484d54` |
| Browse **card install button** | `Button size=md type=outlined color=brand`: **36px** tall, radius **12px**, 1px `#db2777` border, transparent fill, pink 16px/600 label, Plus icon 20px. Labels: **安装 / 已选择 / 已安装 / 选择实例** (compact view: **添加**) |
| **Project-page install button** (the closest thing to a big "launch" button in this area) | `Button size=xl type=colored color=brand`: **48px** tall, radius **16px**, solid `#db2777`, white **16px/800** label **安装**, Download icon 24px, 1px inner top highlight + soft shadow stack |
| Content-type tabs (order) | **整合包 · 模组 · 资源包 · 数据包 · 地图 · 光影包 · 服务器 · 收藏夹** (note: shaders = **光影包**, favorites = **收藏夹**) |
| Search placeholder | `搜索{type}……` → **搜索模组……** (Chinese 6-dot ellipsis) |
| Download count format | `<10,000` → `9,876` · `<1M` → `45.7K` · `≥1M` → `74.62M` (English compact suffixes even in zh-CN) |
| Card title in zh-CN | bilingual from bundled MC百科 dictionary: **钠 (Sodium)**, **锂 (Lithium)**, **模组菜单 (Mod Menu)**; no entry → original (**Iris Shaders**, **Fabric API**) |
| Install progress | top-right **toast** (420px, radius 20, 4px pink bottom bar, "正在下载内容", "2 / 3") + pink count badge on the left-nav Downloads icon + `/downloads` job cards with 8px pink progress bars |
| Key motion | card press `scale .97`; button press `scale .97`/150ms; tab pill slides with 200ms trailing-edge stagger (stretch); cart bar springs in `scale .5 → 1` with `cubic-bezier(.15,1.4,.64,.96)` 250ms; cards fade-up 4px/220ms |

Reconstruction mockups built from these numbers (not screenshots of the real app) are in
`E:\GitHub\Axolotl-animation\research\_scratch\04-browse\` — see §14.

---

## 1. Sources read (absolute paths)

| Topic | File |
|---|---|
| Browse page (app wiring, card actions, sources, search logic) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Browse.vue` |
| Browse layout (toolbar, tabs, search, sort, results list) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\layouts\shared\browse-tab\layout.vue` |
| Browse filter sidebar | `...\packages\ui\src\layouts\shared\browse-tab\sidebar.vue` |
| Install header (instance context) | `...\packages\ui\src\layouts\shared\browse-tab\header.vue` |
| Floating "cart" bar | `...\packages\ui\src\layouts\shared\browse-tab\components\SelectedProjectsFloatingBar.vue`, `...\packages\ui\src\components\base\FloatingActionBar.vue` |
| Project card | `...\packages\ui\src\components\project\card\ProjectCard.vue` (+ `ProjectCardTitle.vue`, `ProjectCardStats.vue`, `ProjectCardDate.vue`, `ProjectCardTags.vue`, `ProjectCardEnvironment.vue`), `...\project\ProjectCardList.vue`, `...\project\ContentCardReveal.vue`, `...\project\ProjectCardSkeleton.vue` |
| Buttons | `...\packages\ui\src\components\base\buttons\ButtonFrame.vue`, `Button.vue`, `IconButton.vue`, `types.ts` |
| Inputs / tabs / combobox / pagination | `...\base\StyledInput.vue`, `...\base\NavTabs.vue`, `...\base\Combobox.vue`, `...\base\Pagination.vue`, `...\base\PopoutMenu.vue`, `...\packages\ui\src\styles\overlays.css` |
| Tags / avatar / clickable | `...\base\TagItem.vue`, `...\base\TagTagItem.vue`, `...\project\TagsOverflow.vue`, `...\base\Avatar.vue`, `...\base\SmartClickable.vue` |
| Filters | `...\packages\ui\src\components\search\SearchFilterControl.vue`, `SearchSidebarFilter.vue`, `SearchFilterOption.vue`, `SearchFilterGroup.vue`, `...\packages\ui\src\utils\search.ts`, `...\utils\tag-messages.ts`, `...\packages\utils\utils.ts` (`sortedCategories`) |
| Project page | `...\apps\app-frontend\src\pages\project\Index.vue`, `Versions.vue`, `CurseForge.vue`; `...\packages\ui\src\components\project\ProjectHeader.vue`, `...\base\ContentPageHeader.vue`, `ProjectSidebarCompatibility.vue`, `ProjectSidebarCreators.vue`, `ProjectSidebarDetails.vue`, `SidebarSection.vue`, `environments.ts` |
| Install flow | `...\apps\app-frontend\src\providers\content-install.ts`, `content-selection.ts`, `content-install-messages.ts`; `...\apps\app-frontend\src\components\browse\BrowseInstanceSelector.vue`; `...\apps\app-frontend\src\components\ui\ContentInstallPreviewModal.vue`; `...\packages\ui\src\layouts\shared\content-tab\components\modals\ContentInstallModal.vue`; `...\apps\app-frontend\src\components\ui\modal\ModpackInstallModal.vue`; `...\packages\ui\src\components\modal\NewModal.vue` |
| Progress / toasts / downloads | `...\apps\app-frontend\src\pages\Downloads.vue`, `...\packages\ui\src\components\base\ProgressBar.vue`, `...\packages\ui\src\components\nav\PopupNotificationPanel.vue`, `...\packages\ui\src\components\notifications\NotificationToast.vue`, `...\apps\app-frontend\src\composables\browse\install-job-notifications.ts`, `...\apps\app-frontend\src\components\ui\AppActionBar.vue`, `...\packages\app-lib\src\install\recovery.rs` |
| Favorites | `...\apps\app-frontend\src\pages\Favorites.vue` |
| Theme tokens | `...\packages\assets\styles\variables.scss`, `...\packages\assets\styles\defaults.scss`, `...\apps\app-frontend\src\assets\stylesheets\global.scss`, `...\apps\app-frontend\src\App.vue` (shell CSS), `...\apps\app-frontend\src\store\theme.ts`, `...\packages\tooling-config\tailwind\tailwind-preset.ts` |
| Bilingual titles & Chinese search | `...\apps\app-frontend\src\helpers\content-search.ts`, `...\packages\app-lib\src\api\content_search.rs`, `...\packages\app-lib\src\api\content_search\WikiEntries.txt` |
| Number / date formatting | `...\packages\ui\src\composables\format-number.ts`, `...\packages\ui\src\composables\how-ago.ts` |
| zh-CN strings | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json` (app ids) and `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json` (ui ids) |
| Reference screenshots | `E:\GitHub\Axolotl-animation\research\ref\launcher-home.png`, `axolotl-lab.png`, `theme-accent.png` |

---

## 2. Design tokens used in this area

### 2.1 Light theme surfaces & text (`variables.scss` `.light-properties`)

| Token | Hex | Used here for |
|---|---|---|
| `--surface-1` | `#ebebeb` | page background of the content pane; Browse sticky toolbar fill |
| `--surface-1-5` | `#ededed` | — |
| `--surface-2` | `#f5f5f5` | compact card fill; locked filter pill fill; preview modal list rows |
| `--surface-3` | `#f8f8f8` | **card fill** (list/grid), app chrome (top bar + left nav), NavTabs track, toasts, floating bar, modal body, popout menus |
| `--surface-4` | `#ffffff` | **search input**, base buttons, combobox trigger, tag pills, card 1px border, avatar background |
| `--surface-5` | `#dddddd` | strokes: toolbar bottom border, base-button inset ring, provider pill fill, avatar border, tag pill border |
| `--color-text-primary` | `#1a202c` | titles, tab labels, button labels (base) |
| `--color-text-default` | `#2c2e31` | body text, card summary, stats |
| `--color-text-tertiary` | `#484d54` | placeholder (×0.6 opacity), tags, secondary lines |
| `--color-accent-contrast` | `#ffffff` | text on colored (pink) buttons and on the active tab pill |
| `--color-green` | `#00af5c` (green-600) | "已选择" state, completed progress, success |
| `--color-red` | `#cb2245` | cancel / danger |
| `--color-orange` | `#e08325` | "进行中" badge |
| `--color-blue` | `#1f68c0` | "排队中" badge, links |
| `--hover-brightness` | `0.9` | hover = `filter: brightness(.9)` (darkens in light theme) |
| `--color-focus-ring` (accent set) | = brand `#db2777` | card focus outline 4px |

### 2.2 Brand (accent) — default is pink (`store/theme.ts`: `selectedAccentColor: 'pink'`)

| Token | Value | Composite |
|---|---|---|
| `--color-brand` | `var(--color-pink)` = **`#db2777`** | — |
| `--color-brand-highlight` | `color-mix(#db2777 25%, transparent)` = `rgba(219,39,119,.25)` | on `#fff` ≈ `#f6c9dd`; on `#f8f8f8` ≈ `#f1c4d8`; on `#ebebeb` ≈ `#e7bace` |
| `--color-brand-shadow` | `color-mix(#db2777 68%, transparent)` = `rgba(219,39,119,.68)` | focus rings |
| `--color-button-bg-selected` | `var(--color-brand)` (solid pink) | active tab pill, active nav-rail circle |
| `--color-button-text-selected` | `#ffffff` | label on active pill |
| `--brand-gradient-bg` (right sidebar) | `linear-gradient(0deg, rgba(219,39,119,.14) 0%, rgba(219,39,119,.09) 100%)` | over `#ebebeb`: bottom ≈ `#e9d0db`, top ≈ `#ead9e1` |
| `--brand-gradient-border` | `rgba(219,39,119,.16)` | sidebar left border & section dividers (≈ `#e8ccd8`) |
| `--brand-gradient-button` | `rgba(255,255,255,.5)` | controls inside the sidebar (replaces `bg-surface-4` there) |
| `--loading-bar-gradient` | `linear-gradient(to right, #db2777, color-mix(#db2777 68%, white))` | top loading bar |
| Pink scale (for extra tints) | 50 `#fdf2f8` · 100 `#fce7f3` · 200 `#fbcfe8` · 300 `#f9a8d4` · 400 `#f472b6` · 500 `#ec4899` · 600 `#db2777` · 700 `#be185d` · 800 `#9d174d` · 900 `#831843` · 950 `#500724` | |

Loader brand colours (tag text + icon on cards, light): Fabric `#8a7b71`, NeoForge `#dc895c`, Quilt `#8b61b4`, Forge `#5b6197` (dark: `#dbb69b`, `#f99e6b`, `#c796f9`, `#959eef`).

### 2.3 Radii, spacing, typography, shadows

- Radii: `rounded-lg` 8 · `rounded-[10px]` 10 · `rounded-xl` 12 · `rounded-[14px]` 14 · `rounded-2xl` 16 · `--radius-xl` 20 (content pane corner, toolbar top corners, toasts, floating bar) · `rounded-full`. Avatar radius = `16/96 × size` (100px → 16.67px, 96 → 16, 64 → 10.67, 48 → 8).
- Gaps: `gap-1` 4 · `gap-1.5` 6 · `gap-2` 8 · `gap-3` 12 · `gap-4` 16 · `p-6` 24.
- Font stack (`defaults.scss`): `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, …, sans-serif`; CJK falls back to the OS font (PingFang SC on the macOS reference screenshots) **(inferred from stack + screenshots)**. Base 16px, weight 400; `html { line-height: 1.15 }` (normalize). Tailwind sizes: `text-xs` 12/16, `text-sm` 14/20, `text-base` 16/24, `text-lg` 18/28, `text-xl` 20/28, `text-2xl` 24/32 (leading-none overrides line height where noted).
- Shadows: `shadow-xl` = `0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)`; `shadow-2xl` = `0 25px 50px -12px rgba(0,0,0,.25)`; `drop-shadow-2xl` = `drop-shadow(0 25px 25px rgba(0,0,0,.15))`; `--shadow-card` = `rgba(50,50,100,.1) 0 2px 4px`.

### 2.4 Dark theme deltas (`.dark-mode`; app default theme is actually **dark**, screenshots use light)

surface-1 `#101215` · surface-2 `#1a1e24` · surface-3 `#262b34` · surface-4 `#333a46` · surface-5 `#424854`; text `#ffffff` / `#b0bac5` / `#96a2b0`; brand pink = `#f472b6`; highlight `rgba(244,114,182,.25)`; **accent-contrast = `#000000` → colored pink buttons get black labels**; active tab pill = pink 25% tint with pink label (not solid); `--hover-brightness: 1.25` (hover brightens).

---

## 3. App frame around these pages (for staging)

From `App.vue` (`.app-grid-layout` / `.app-contents` scoped CSS):

| Element | Spec |
|---|---|
| Top bar | height **48px** (`--top-bar-height: 3rem`), bg `#f8f8f8`. Breadcrumb title on Browse: **发现内容**; on a project: project title (e.g. **Sodium**) |
| Left nav rail | width **64px** (`--left-bar-width: 4rem`), bg `#f8f8f8`; nav buttons 48×48 circles; Discover = `CompassIcon` (tooltip **发现内容**); Downloads = `DownloadIcon` (tooltip **下载**) with a pink count badge while jobs run (see §7.6) |
| Content pane | `left:64 top:48`, bg `#ebebeb`, **top-left radius 20px**, overlay `::before` with `box-shadow: 1px 1px 15px rgba(0,0,0,.1) inset` + 1px `#dddddd` border |
| Viewport | `overflow:auto; scrollbar-gutter: stable` → 16px gutter at right (scrollbar 16px wide, thumb `#96a2b0`, radius 16, 5px transparent border) |
| Right sidebar | **forced visible** on `/browse/*` and `/project/*`; width **300px**; bg = pink `--brand-gradient-bg`; 1px left border `rgba(219,39,119,.16)`; inner shadow `-15px 0 15px -15px rgba(0,0,0,.1) inset` on its left edge. Browse teleports the **filter panel** into it; project pages teleport **兼容性/相关链接/标签/作者/信息** sections |
| Page transitions | `.page-slide`: enter opacity 0→1 **0.18s ease**, leave 0.12s |
| Top-right pill (shell) | "● 没有运行中的实例" (`app.action-bar.no-instances-running`) |

Real stacking order (useful for 2.5D layer separation, back → front): content pane (`z-1`) → result cards → right sidebar (`z-11`) → sticky Browse toolbar (`z-20`) → content-pane inner-shadow frame (`::before`, `z-30`) → floating cart bar (`z-107`, teleported to `<body>`) → popup toasts (`z-200`) → modals (overlay + body above everything; toasts fade out `translateY(-.5rem)` while a modal is open).

Content width math: card width = window W − 64 − 300 − 16 (gutter) − 48 (page padding). W = 1440 → **1012px** (list layout full mode ≥ 850px). The reference screenshot window is ≈1430 CSS px wide (measured: top bar 48px ↔ 79 image px at 1.66×).

---

## 4. Browse page anatomy (`/browse/:projectType`)

### 4.1 Component tree (app variant)

```
<div data-onboarding-id="browse-content" class="flex flex-col gap-3 p-6">          ← Browse.vue root (gap 12, padding 24)
  BrowsePageLayout (packages/ui …/browse-tab/layout.vue)
    <div class="browse-toolbar-chrome sticky top-0 z-20 flex flex-col gap-3
                border-b border-surface-5 bg-surface-1
                -mx-6 -mt-6 rounded-tl-[20px] rounded-tr-[20px]">                   ← full-bleed sticky toolbar, #ebebeb, 1px #ddd bottom
       [BrowseInstallHeader  p-3 pb-0]   ← only when entered from an instance (?i=…)
       <div class="flex flex-col gap-3 p-3">                                         ← padding 12, row gap 12
          Row 1: NavTabs(content types) ……………… ml-auto: Button quiet xl「翻译」
          Row 2: StyledInput(search, h-12, flex-1) · Button md「实例选择」· PopoutMenu Button md「来源」
          Row 3: Combobox(sort) · Combobox(per page) · display-mode circle button · Pagination(ml-auto)
          Row 4: SearchFilterControl (active filter pills; hidden when empty)
    SelectedProjectsFloatingBar   (teleported to <body>, see §4.9)
    [above-results: fuzzy-search notice]
    <div class="search relative"> loading / empty / ProjectCardList(list|compact|grid) + bottom Pagination </div>
  BrowseInstanceSelector (modal)        <Teleport to="#sidebar-teleport-target"> BrowseSidebar (filters) </Teleport>
```

When the toolbar sticks (scrolled): adds `border-t` and `shadow-[0_8px_16px_-12px_rgba(0,0,0,0.35)]`.

Computed geometry at W=1440 (verified by reconstruction, §14): toolbar 185px tall (12+48+12+48+12+40+12 + 1px border); first card starts 12px below; cards 1012×~142px with 12px gaps.

### 4.2 Row 1 — content-type tabs (`NavTabs`, navigation mode)

- Container: `relative flex w-fit rounded-full bg-surface-3 p-1 text-sm font-bold` + `shadow-xl border border-surface-4` → `#f8f8f8` capsule, 4px inner padding, 1px **white** border, `shadow-xl`, **14px / 700**, line-height 20.
- Each tab: `px-4 py-2 gap-2` → 16px × 8px padding → tab height **36px**; container height **46px**. Inactive label `#1a202c`.
- Active indicator = separate absolutely-positioned **pill** (`rounded-full`, `h-[calc(100%-0.5rem)]`), fill **solid `#db2777`**, active label **white**. Subpage match uses `bg-surface-4` instead.
- **Pill motion** (verified): `left/right/top/bottom 150ms cubic-bezier(0.4,0,0.2,1)`; the **trailing edge is delayed 200ms** (moving right: right edge leads, left edge follows 200ms later) → an "inchworm" stretch; opacity `250ms cubic-bezier(0.5,0,0.2,1) 50ms`. Tabs have `.button-animation` → `:active { transform: scale(0.95) }` (50ms).
- Tab order & zh-CN (`helpers/browse-project-tabs.ts` + `Browse.vue` messages):

| # | Route | zh-CN | id | Visibility rule |
|---|---|---|---|---|
| 1 | `/browse/modpack` | **整合包** | `app.browse.project-type.modpacks` | hidden when browsing for a specific instance |
| 2 | `/browse/mod` | **模组** | `app.browse.project-type.mods` | hidden if target instance is vanilla |
| 3 | `/browse/resourcepack` | **资源包** | `app.browse.project-type.resourcepacks` | always |
| 4 | `/browse/datapack` | **数据包** | `app.browse.project-type.datapacks` | hidden for < 1.13 / server instances |
| 5 | `/browse/world` | **地图** | `app.browse.project-type.maps` | always (CurseForge-only content) |
| 6 | `/browse/shader` | **光影包** | `app.browse.project-type.shaders` | always |
| 7 | `/browse/server` | **服务器** | `app.browse.project-type.servers` | hidden in instance context |
| 8 | `/browse/favorites` | **收藏夹** | `app.browse.project-type.favorites` | always (separate page `Favorites.vue`) |

Approx widths: 2-char tab 60px, 3-char tab 74px → full bar ≈ **574 × 46px**.
First visit lands on **整合包** (`getLastBrowseContentProjectType()` default `'modpack'`); afterwards the last tab is remembered.

- Right side: `Button type="quiet" size="xl"` → **48px** tall, radius 16, `px-3.5`, 16px **800**, icon 24px: `LanguagesIcon` + **翻译** (`app.project.translation.translate`); while working `SpinnerIcon`(spin) + **正在翻译…**; when active **显示原文**. Clicking it replaces card summaries with machine/mirror Chinese translations (titles stay bilingual).

### 4.3 Row 2 — search field + instance selector + source switcher

**Search field** = `StyledInput` (`variant=filled`, `clearable`, `input-class="h-12"`, wrapper `flex-1`):

| Property | Value |
|---|---|
| Size | height **48px**, full remaining width |
| Shape / fill | radius **12px** (`rounded-xl`), bg **`#ffffff`**, no border, no shadow (`shadow-none`) |
| Padding | left **40px** (icon), right 12px (32px when it has text → room for the clear button) |
| Text | 16px / **500**, line-height 24, colour `#2c2e31`; on focus `#1a202c` |
| Placeholder | **搜索模组……** etc. (table below), colour `#484d54` at **60% opacity** (global `::placeholder { opacity:.6 }`), **80%** while focused (`:focus::placeholder { opacity:.8 }`) |
| Search icon | `SearchIcon` 20×20 at `left: 12px`, `#484d54` @ 60% opacity → on focus `#1a202c` @ 100% (`transition-colors`) |
| Focus | `ring-4 ring-brand-shadow` → **0 0 0 4px rgba(219,39,119,.68)** around the 12px-radius box |
| Clear button | appears when non-empty: `absolute right-0.5 p-2`, `XIcon` 20px `#484d54` → hover `#1a202c`; clears query |
| Behaviour | 200ms debounce, then results show the loading state (§4.7) |

Placeholder by tab (`browse.search.placeholder` = `搜索{projectType}……`, `projectType` = `project-type.<type>.lowercase` plural):

| Tab | Placeholder |
|---|---|
| 模组 | **搜索模组……** |
| 整合包 | **搜索整合包……** |
| 资源包 | **搜索资源包……** |
| 数据包 | **搜索数据包……** |
| 光影包 | **搜索光影包……** |
| 服务器 | **搜索服务器……** |
| 地图 (world) | **搜索项目……** (falls back to "project") **(inferred: `world` has no project-type message)** |

Chinese search is a real feature: typing Chinese (e.g. **钠**) runs `resolveChineseContentSearch` against the bundled MC百科 dictionary, rewrites the query to English slugs, injects exact matches first and shows bilingual titles (**钠 (Sodium)**, **钠 · 扩展 (Sodium Extra)** …).
Fuzzy fallback notice (above results): `SparklesIcon` 14px pink + `未找到「{original}」的结果，已为您显示` **{used}** `的相关结果` (ids `app.browse.fuzzy-search.prefix/suffix`), 14px tertiary; the `{used}` word is a 500-weight link that turns pink on hover.

**Instance selector button** (not shown on 整合包/服务器 tabs): `Button size=md` base → **36px**, radius 12, white, inset 1px `#ddd` ring + `0 1px 1px rgba(0,0,0,.12)`, `gap-2`:
- no target: `PlusIcon` 20 + **选择实例** (`app.browse.choose-instance`, weight 500) + `ChevronDownIcon` 16 (`#484d54`);
- with target: instance icon 20px + instance name (max-width 160px, truncate) + chevron.
Clicking opens the **选择一个实例** modal (§7.4).

**Source switcher** (`PopoutMenu` + `Button size=md`, hidden on 服务器 and 地图): icon 20 + label. Default (release builds embed a CurseForge key) = **所有来源** with `GlobeIcon`. Menu options (each a full-width button; current one `type=colored` = solid pink):

| Option | Label | Icon |
|---|---|---|
| all | **所有来源** (`app.browse.source.all`) | `GlobeIcon` |
| modrinth | **Modrinth** (`app.browse.source.modrinth`) | `ModrinthIcon` = `packages\assets\branding\logo.svg` ⚠ third-party logo |
| curseforge | **CurseForge** | `CurseForgeIcon` = `packages\assets\external\curseforge.svg` ⚠ third-party logo |
| mcarchive (mods, ancient versions only) | **MCArchive 来源** | `FileArchiveIcon` |
| planet_minecraft (mods, if connector available) | **Planet Minecraft 来源** | `GlobeIcon` |

Menu surface (`.menu-surface`): padding 8, 1px `#ddd`, radius 12, bg `#f8f8f8`, `box-shadow: 3px 3px 0.8rem rgba(0,0,0,.3)`, 14×7 arrow.

### 4.4 Row 3 — sort, page size, view mode, pagination

| Control | Spec | zh-CN |
|---|---|---|
| Sort `Combobox` | trigger `rounded-xl bg-white px-4 py-2 gap-2.5`, **min-height 40px**, prefix `ArrowUpDownIcon` 20 (`#2c2e31`), label 16px/600 `#484d54`, chevron (`ChevronLeftIcon` rotated −90°) 20px; hover `brightness(115%)`. Tooltip **排序方式** | options: **相关性** (default) · **下载量** · **关注者** · **发布日期** · **更新日期** (`browse.sort.*`) |
| Per-page `Combobox` | same trigger, prefix `EyeIcon`; tooltip **查看** | 5 · 10 · 15 · **20** (default) · 50 · 100 |
| Dropdown panel | `rounded-[14px] bg-white border #ddd shadow-2xl`; rows `px-4 py-3 gap-2.5`; selected row `bg rgba(219,39,119,.25)` + pink text; fade 150ms | |
| View mode | `Button circular icon-only` (36×36 white circle) showing current icon; popout menu `w-44` with 3 options; tooltip **切换视图** | **列表** (`ListIcon`, default) · **紧凑列表** (`GenericListIcon`) · **网格** (`GridIcon`) |
| Pagination (right) | md circular buttons; current page `type=highlight color=brand` → **pink-25% fill**, `#1a202c` digits, inset `#ddd` ring; others quiet (transparent). Gap marker = 32px circle with rotated `EllipsisVerticalIcon` (click → number input with pink border). Prev/next = quiet 36px circle chevrons. Loading page shows a spinner in a white 32px circle. Numbers render **without** thousands separators (`{{ item }}`) | e.g. `[1] 2 ⋯ 5231 ›` |

Also repeated at the bottom of the result list (`flex justify-end mt-3`).

### 4.5 Row 4 — active filter pills (`SearchFilterControl`)

`flex flex-wrap gap-1`, hidden when empty. Each pill = `TagItem`: `rounded-full`, 1px `#ddd` border, bg white, `px-2 py-1`, 14px/400, `#484d54`, icons 16px, gap 4; clickable pills get `hover:underline active:scale-[.95]`.
- User filter: `XIcon` + name (e.g. **优化**, **Fabric**); negative filters add a red `BanIcon`.
- When ≥2 filters: first pill `XCircleIcon` + **"Clear all filters"** — ⚠ hard-coded English in source.
- **Locked (instance-provided) filters**: `LockIcon` + value (e.g. `🔒 26.2`, `🔒 Fabric`), bg `#f5f5f5`; tooltip **由该实例提供** (`search.filter.locked.instance`).

### 4.6 Install header (only when entering Browse from an instance, `?i=<id>`)

`BrowseInstallHeader` inside the toolbar (`p-3 pb-0`):
- `Button size=xl circular icon-only` (48px white circle) with `LeftArrowIcon` (aria **返回实例**);
- instance avatar **48px**;
- name `text-2xl font-semibold leading-8` (24px/600) `#1a202c`;
- sub-line 16px/500 `#2c2e31`: **安装内容** (`label.installing-content`) • `BoxIcon`16 + game version • loader icon 16 + loader name — separated by 6px dots (`opacity .6`).
In this context the 整合包 and 服务器 tabs disappear and the instance's version/loader become locked filters.

### 4.7 Results area states

| State | Visual |
|---|---|
| Loading | centered row: `SpinnerIcon` 16px (spin) + **正在加载结果……** (14px/500 tertiary) above **skeleton cards** (list: up to 8; grid: 6). List skeleton: `rounded-xl border #ddd bg #ebebeb p-4`, 100px `rounded-2xl` block in `#f8f8f8`, bars `animate-pulse` |
| Results | `ProjectCardList`: list/compact → `flex flex-col gap-3`; grid → `grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3`. Each card wrapped in `ContentCardReveal`: **opacity 0→1 and translateY 4px→0, 220ms ease**, triggered next animation frame after mount (all cards together, no stagger) |
| No results | compact `EmptyState`: 40px icon chip (`FolderSearchIcon`, radius 12, `#f5f5f5` bg, `#ddd` border), title **这里还是空的** (18px/600), text **没有找到您的查询结果！** (14px tertiary), button **清除搜索** |
| Offline | title **网络未连接**, text **你目前处于离线状态。连接互联网来浏览Modrinth！** ⚠ contains "Modrinth", button **重试** |
| Maps without CF key | **地图不可用** / **请配置 CurseForge API Key 以浏览和安装地图。** |

Right-click on a Modrinth card → context menu (`#f8f8f8`, radius 12, 1px `#ddd`, `--shadow-floating`): `GlobeIcon` **在 Modrinth 中打开** `ExternalIcon` · `ClipboardCopyIcon` **复制链接**.

### 4.8 Filter panel in the right sidebar (`BrowseSidebar`, app variant)

- Optional first block (only with a target instance): label **隐藏已安装内容** (16px/500 `#1a202c`) + small `Toggle` (40×20 capsule, 12px knob; off: track = sidebar control white-50%, knob `#595b61`; on: track pink, knob `rgba(0,0,0,.9)` shifted 20px; 200ms).
- Sections are accordions: header button `px-3 py-3` (first one `pt-4`), `h3` 16px bold `#1a202c`, `DropdownIcon` 20px at right (rotates 180° when open, 300ms); separator 1px `rgba(219,39,119,.16)`; content `mt-2 mb-3`, inner `ml-2 mr-3`, options `flex-col gap-1`; open/close animates `grid-template-rows 0fr→1fr, 0.3s cubic-bezier(0,.6,.3,1)`.
- Option row (`SearchFilterOption`): `rounded-xl px-2 py-1 gap-2`, **14px/600** `#484d54`, optional 16px icon; hover bg = sidebar hover tint; **selected** → `bg rgba(219,39,119,.25)` + text `#1a202c` + `CheckIcon` 16 at the right; excluded → red tint + `BanIcon`; an "exclude" (`BanIcon`) mini-button appears on hover.
- Section order for **模组** (sorted by `ordering`): **游戏版本** (closed; searchable list with checkbox **列出所有版本**) → **加载器** (closed; Fabric/Forge/NeoForge first, **显示更多**) → **类别** (open) → **更多 CurseForge 分类** (closed, only in "所有来源"/CF) → **运行环境** (open: **客户端** / **服务端**) → **许可证** (open: **开源**) → **依赖于** (open, project search **搜索项目……**) → **高级** (closed; toggles **排除插件** / **排除数据包** on the 模组 tab).
- **类别** options in zh-CN collation order, each with its 16px icon (`packages\assets\icons\tags\categories\<slug>.svg`):
  存储 storage · 地形 worldgen · 管理 management · 机制 game-mechanics · 交通 transportation · 经济 economy · 科技 technology · 库 library · 冒险 adventure · 魔法 magic · 社交 social · 生物 mobs · 实用 utility · 食物 food · 小游戏 minigame · 邪门 cursed · 优化 optimization · 装备 equipment · 装饰 decoration.
- Locked section (instance provides it): dashed box `p-3 border-2 border-dashed rounded-2xl`, bold title **游戏版本由实例提供** / **加载器版本由实例提供**, 14px text **解锁这个筛选项可能导致安装不兼容的内容。**, button `LockOpenIcon` **解锁筛选**.
- Other headers used by other tabs: **功能特点** (features), **性能要求** (performance impact), **分辨率** (resolution).

### 4.9 Floating "cart" bar (`SelectedProjectsFloatingBar` → `FloatingActionBar`)

Appears as soon as ≥1 project is selected (mods / resource packs / data packs / shaders / maps use a **cart** model):
- Positioning: fixed, `bottom-0`, left = 64px, right = 300px (sidebar), wrapper `p-4` with `drop-shadow-2xl`; z-index 107.
- Toolbar: `rounded-[20px] bg-#f8f8f8 border-#ddd px-3 py-2.5 gap-1.5`, centered, `max-width: 60vw`, `box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 6px 10px rgba(0,0,0,.15)`.
- Content: icon stack (32×32 tiles, radius 8, 1.5px `#f8f8f8` border, overlapping every **24px**, max 3 + "+N") → text **{n}个已选择的项目** (16px/600, tabular) → 1×24px divider `#ddd` → quiet button **清除** → `ml-auto` **`Button type=colored color=brand` (36px, radius 12, white 16px/600)** `PlusIcon` + **安装 {n} 个内容** (`app.browse.install-selected`); while preparing `SpinnerIcon` + **正在准备 {completed}/{total}**.
- Hover/focus on the icon stack (≥2 items) opens a list popover above it (`w ≤ 18rem`, `#f5f5f5`, radius 8, rows `#f8f8f8`).
- **Enter animation**: `transform: scale(0.5) translateY(-10rem); opacity 0` → identity in **0.25s `cubic-bezier(0.15, 1.4, 0.64, 0.96)`** (overshoot spring). Leave: to `scale(.96) translateY(-.25rem)`, opacity 0, 0.25s ease.
- Pressing the install header's back button with a non-empty cart → warning-fade modal **选定的项目尚未安装** with outlined **取消** · red colored **丢弃** · **green** colored **安装**.
- The bar hides itself while any modal is open (`hide-when-modal-open`).

---

## 5. The project (mod) card — `ProjectCard.vue`

### 5.1 Container & interaction

- Outer: `SmartClickable` (a CSS grid where an invisible full-card link sits under the content; content has `pointer-events:none` except buttons/tags).
- Card box (list & grid): `w-full h-full border 1px #ffffff overflow-hidden bg #f8f8f8 rounded-2xl (16px) transition-all`.
- Hover (on the card link or content): whole card `filter: brightness(0.9)`; the icon fades to **opacity .85** (125ms ease-out); title gets **underline**.
- Press: card contents `scale: 0.97` (`transition: scale 0.125s ease-out`) — a natural "squash".
- Keyboard focus: `outline: 4px solid #db2777`.
- Container queries on the card (`container-type: inline-size`) change the layout below 850px / 550px.

### 5.2 List layout (default) — grid template

```
padding 16 · column-gap 12 · row-gap 8
≥850px (with actions):            <850px:                       <550px:
'icon info actions actions'       'icon info actions'           'icon info'
'icon info dummy  stats'          'icon info stats'             'icon info'
'icon tags tags   stats'          'tags tags stats'             'tags tags'
cols: auto 1fr auto auto          cols: auto 1fr auto           'stats stats' / 'actions actions'
icon 100px                        icon 64px                     icon 64px, title 16px, summary 14px
```

| Element | Spec |
|---|---|
| Icon (`Avatar size=100px no-shadow`) | 100×100, radius **16.67px**, 1px `#dddddd` border, bg `#ffffff`, `object-fit: contain`; images < 32px wide render pixelated. Missing icon → grey isometric **cube outline** placeholder (`#9a9a9a`, 5px stroke) |
| Title (`ProjectCardTitle`) | **20px / 600**, `line-height:1`, `#1a202c`, truncate; hover underline |
| Provider pill | right of title, `rounded-full bg #dddddd px-2 py-0.5`, **12px/600** `#484d54`: **Modrinth** / **CurseForge** / MCArchive / Planet Minecraft ⚠ third-party names |
| Summary | 16px / 400, `#2c2e31`, **2-line clamp**, line-height ≈ 18.4px |
| Actions (top-right) | `flex gap-2` → install button + favorite button (see 5.4) |
| Stats column (right, `mt-3` below actions, `items-end`, `gap-3`) | Downloads: `DownloadIcon` 20 + compact number (16px/500); Date: `HistoryIcon` 20 + relative time (updated), or `CalendarIcon` when sorted by 发布日期 |
| Tags row (bottom, `mt-auto`, `gap-1`) | env tag (conditional) + `ProjectCardTags` |

Reference card size at 1012px wide: ≈ **1012 × 142px** (2-line summary).

### 5.3 Stats, dates and tags — formatting rules

- **Downloads** (`useCompactNumber`): `< 10,000` → zh-CN grouping `9,876`; `< 1,000,000` → `Intl('en', compact, 1 decimal)` → `45.7K`, `812.3K`; `≥ 1,000,000` → 2 decimals → `1.23M`, `74.62M`, `112.35M`, `1.23B`. Tooltip: `{count, number} 次下载` → **74,620,000 次下载**.
- Followers (project page): same compact format, tooltip **{n} 人关注**.
- **Relative date** (`Intl.RelativeTimeFormat('zh-CN', numeric:'auto')`): **现在**, **30秒钟前**, **5小时前**, **昨天**, **3天前**, **上周**, **3周前**, **上个月**, **2个月前**, **去年**. Tooltip: **更新于 2026年10月3日 14:05** / **发布于 …**.
- **Tags** (`TagItem`): `rounded-full`, 1px `#dddddd` border, bg `#ffffff`, `px-2 py-1`, `leading-none`, **14px/400**, text `#484d54`, icon 16px, gap 4 → pill height ≈ 24px.
  - Loader tags first, **coloured** (text + icon = platform colour): Fabric `#8a7b71` (`tags\loaders\fabric.svg`), NeoForge `#dc895c`, Quilt `#8b61b4`, Forge `#5b6197`; order: default loaders alphabetically (fabric, forge, neoforge), then others (quilt…).
  - Then categories (localized, alphabetical by slug), **no icon** on cards: 优化, 实用, 库, 装饰, 科技 …
  - Max visible tags by card width (list): ≥800px → 8, ≥600 → 6, ≥400 → 5, else 4 (+1 if no env tag); grid: 5/4/3; compact: 2. Overflow → `+N` pill with popover.
  - **Loader tags are hidden** whenever a target instance is chosen, a loader filter is active, or on 资源包/数据包.
- **Environment tag** (`ProjectCardEnvironment`, mods/modpacks): `ClientIcon` **客户端** · `ServerIcon` **服务端** · `GlobeIcon` **客户端或服务端** / **客户端和服务端**. ⚠ **(inferred)** Browse feeds raw v3 search hits whose `client_side`/`server_side` are not plain strings (CurseForge hits are mapped to `'unknown'`), so in the shipping app this pill is probably **not rendered**; treat it as optional decoration.

### 5.4 Card actions — the install button (key transformation target)

Rendered by `layout.vue` from `getCardActions()` in `Browse.vue`:
`<Button :type="outlined" :color="brand|green" :size="compact ? '2xs' : 'md'">` + icon + label.

**Button geometry** (`ButtonFrame.vue`):

| Size | Height | Radius | Padding-x | Gap | Font | Icon |
|---|---|---|---|---|---|---|
| `md` (list/grid cards) | **36px** | **12px** | 10px | 6px | 16px / **600**, line-height 20 | **20px** |
| `2xs` (compact rows) | 24px | 8px | 6px | 4px | 14px / 600 | 16px |
| `xl` (project page) | 48px | 16px | 14px | 8px | 16px / **800** | 24px |

All buttons: 1px border (transparent unless outlined) that counts in layout; `transition: background-color, color, box-shadow, filter, opacity, transform 150ms ease-out`; hover `brightness(0.9)`; **press `scale(0.97)`**; focus-visible `ring-4` `rgba(219,39,119,.68)` + brightness; disabled `opacity .5`.

**Outlined variant** = transparent fill (shows the card's `#f8f8f8`), border colour = `--button-color`, text & icon colour = `--button-color`.

**State table — mods / resource packs / data packs / shaders / maps (cart model)**

| Situation | Label (list/grid) | Compact label | Icon | Colour | Disabled |
|---|---|---|---|---|---|
| No target instance chosen | **选择实例** (`app.browse.choose-instance`) | **添加** (`app.browse.add`) | `PlusIcon` | brand `#db2777` | no — click opens the instance picker |
| Target chosen, not selected | **安装** (`button.install`) | 安装 | `PlusIcon` | brand | no |
| Added to cart | **已选择** (`app.browse.selected`) | 已选择 | `CheckIcon` | **green `#00af5c`** | no — click removes from cart |
| Already in instance | **已安装** (`label.installed`) | 已安装 | `CheckIcon` | brand @ 50% opacity | yes |

**State table — modpacks / other direct installs**

| Situation | Label | Icon |
|---|---|---|
| idle (modpack, or any type inside an instance context) | **安装** | `PlusIcon` |
| idle (non-modpack without instance) | **添加到实例** (`app.browse.add-to-an-instance`), compact **添加** | `PlusIcon` |
| installing | **安装中** (`app.browse.server.installing`) | `SpinnerIcon` spinning, disabled |
| installed | **已安装** | `CheckIcon`, disabled |

Approximate widths (md): **安装** ≈ 80px · **已选择** ≈ 96px · **选择实例** ≈ 112px.

**Favorite button** (mods, resource packs, data packs, shaders): `Button type=quiet circular icon-only size=md` → **36×36 circle**, transparent; `BookmarkIcon` 20px in `#2c2e31`; when saved → `BookmarkFilledIcon` in pink; pending → spinner. Tooltip **添加到收藏夹** / **从收藏夹移除**.

Server cards (服务器 tab) use different actions (play/add to instance) — out of scope here.

### 5.5 Compact list layout

Row box: `h-16` (**64px**), radius **8px**, 1px white border, bg **`#f5f5f5`**, `px-2 py-[7px]`, `gap-3`, grid columns `48px | 1fr | 5rem | 10rem | 4.5rem | 4.5rem | 5.5rem` (icon · title+summary · provider · tags(≤2) · downloads · date · actions). Title 16px/600; summary 13px/16 tertiary 1-line; provider/stat text 13px; icons 16px; actions `2xs`. Columns drop out below 720/600/520/440px container widths.

### 5.6 Grid layout

Card `flex-col`; **banner** `aspect-ratio 2/1`, 1px `#fff` bottom border: featured gallery image `object-cover`, else a gradient from the project's colour (`oklch` shifted ×0.8 light/+15° hue → ×0.5) with a fallback image ⚠ `https://cdn-raw.modrinth.com/landing-new/landing.webp` (Modrinth asset — replace with gradient). Body `p-4 gap-3`: icon **96px** + title **18px/600** + provider pill + 2-line summary; footer: tags + stats (left), actions (right). Min column 350px.

### 5.7 Hit data mapping (what fields feed the card)

`title` ← hit `name` (Modrinth v3) then bilingual rewrite; `summary` ← `summary`/`description`; `downloads`; `date_modified` (or `date_created` when sorted by 发布日期); `display_categories` + `categories`; `featured_gallery`, `color`; `icon_url`; `provider`. **Author is not displayed on browse cards** (the `author` prop exists but the template never renders it — verified).

---

## 6. Project page (`/project/:id`, `pages/project/Index.vue`)

### 6.1 Layout

`div.flex.flex-col.gap-4.p-6` (gap 16, padding 24). Optional sticky install header (same `BrowseInstallHeader`, `sticky top-0 z-20 -mx-6 -mt-6 rounded-tl-[20px] border-b #ddd bg #ebebeb p-3`) when coming from an instance; otherwise an `InstanceIndicator`. Then `ProjectHeader` → `NavTabs` → tab content (`Card`: bg `#f8f8f8`, radius 16, 1px white border, padding 16) . Loading uses `ProjectPageSkeleton` (main + sidebar variants).

### 6.2 Header (`ProjectHeader` in `ContentPageHeader`)

- Wrapper: `flex flex-col gap-2 border-b border-divider pb-4` (1px `#ddd` line under the header).
- Left: **icon 96×96** (radius 16, 1px `#ddd`, shadow `rgba(50,50,100,.1) 0 2px 4px`), gap 16 to text column.
- Title `h1`: **24px / 600, line-height 1**, `#1a202c` — the **original** project title (e.g. **Sodium**; not bilingual unless 翻译 is on → translated title appears below in 16px/600 tertiary).
- Summary: `max-w-[44rem]` (704px), 2-line clamp, 16px.
- Stats row (`gap-3`): `DownloadIcon` 24 tertiary + **74.62M** (600) · `HeartIcon` 24 + followers (600) · category pills (clickable `TagItem`s: **优化**). (The followers item carries `md:border-r` but no border-style; with Tailwind preflight disabled this draws **no visible divider** — the line in the scene-c mock is an artefact.)
- Right actions (`flex gap-2 items-center`):
  1. **翻译** — quiet xl (`LanguagesIcon`).
  2. **Install button — `type=colored color=brand size=xl`**: 48px, radius 16, bg **`#db2777`**, label **white 16px/800**, icon 24px, `box-shadow: 0 0 0 1px rgba(219,39,119,.3), 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)` + `::before` 1px inner border gradient **white 30% → 0** (top highlight).
     States: `DownloadIcon` **安装** → `SpinnerIcon` **安装中……** (`label.installing`, disabled .5) → `CheckIcon` **已选** (`label.selected`, cart flow from Browse) → `CheckIcon` **已安装** (disabled; tooltip **此项目已安装**). Inside an instance that already has it: base xl button `SwapIcon` (`apps\app-frontend\src\assets\icons\arrow-left-right.svg`) **切换版本**.
  3. Overflow menu trigger: bare button with `MoreVerticalIcon` (1em ≈ 16px; buttons are unstyled by the reset). Items: `HeartIcon` **关注** (disabled, "Coming soon"), `BookmarkIcon` **添加到收藏夹**, `SearchIcon` **查看依赖项目** / **查看依赖此项目的{type}**, `PackageIcon` **查看整合包**, `ExternalIcon` **在浏览器中打开**, `BookOpenIcon` **在 MC 百科中打开** (when the dictionary knows the project), divider, red `ReportIcon` "Report" (⚠ hard-coded English).
- Server projects instead show `PlayIcon` **开始游戏** (colored brand xl) / `StopCircleIcon` **停止** (colored red) + circular `PlusIcon` (**将服务器添加到实例**).

### 6.3 Tabs

`NavTabs` (same capsule/pill as §4.2): **描述** (`project.settings.description.title`) · **版本** (`project.settings.versions.title`) · **图库** (`project.settings.gallery.title`, only when gallery exists).
Versions tab rows end with a quiet circular `DownloadIcon` (tooltip **安装**; green colour), or `SwapIcon` (**切换到此版本**) / `CheckIcon` (**已安装**), plus `ExternalIcon` (**在浏览器中打开**).

### 6.4 Sidebar (right 300px column), each section `p-4 gap-2`, separated by `rgba(219,39,119,.16)` lines; section title `h2` 18px

- **兼容性**: **Minecraft：Java版** + version pills (e.g. `1.21.x`, `1.20–1.20.4`), **平台** + coloured loader pills (Fabric/NeoForge/Quilt, clickable), **支持的运行环境** + pills (**客户端** / **服务端** / **客户端和服务端** / **单人游戏** …).
- **相关链接**: **报告问题**, **查看源代码**, **前往 Wiki**, **加入 Discord 服务器**, **MC Mod** (MC百科) …
- **标签**: category pills.
- **作者**: org/members, 32px avatars, `CrownIcon` (orange) for owner.
- **信息**: `BookTextIcon` **许可证：{license}**, `CalendarIcon` **{date} 发布**, `VersionIcon` **{date} 更新**.

---

## 7. Install flow (what the user sees, step by step)

### 7.1 Cart flow (mods · resource packs · data packs · shaders · maps) — the main path

1. Browse card shows **选择实例** → click → **选择一个实例** modal (§7.4) → pick → card buttons become **安装**, loader tags disappear, locked pills `🔒 <version>` `🔒 <loader>` appear, sidebar shows **隐藏已安装内容**.
2. Click **安装** on a card → button turns green **✓ 已选择**; floating bar springs up: `[icon] 1个已选择的项目 | 清除 …… [+ 安装 1 个内容]`.
3. Click **安装 N 个内容** → button shows **正在准备 0/1** with spinner (state `validating`) → **确认安装** modal always opens (§7.5).
4. Click **安装** in the modal → job queued (`queueing`); selected items leave the cart; bar hides.
5. Progress: top-right download toast + nav badge + Downloads page (§7.6). When the instance reports `content_install_finished`, cards refresh to **已安装** (disabled).

### 7.2 Modpacks

Card/project **安装** → **安装整合包** modal (`ModpackInstallModal`, width `min(36rem, 95vw−10rem)`): 48px icon + title (18px/600); **版本** combobox (placeholder **选择版本**) + release badge + loaders/versions line; **实例名称** input (placeholder **我的整合包实例**); **实例文件夹：{name}**; warning box **此版本已安装** if applicable; actions `XIcon` **取消** (outlined) · `DownloadIcon` **安装** (colored brand). After starting, Browse navigates to **/downloads**.

### 7.3 Direct install without a target (non-cart paths)

**安装项目** modal (`ContentInstallModal`, 560px, no padding): project chip (`rounded-[20px] bg #f5f5f5 p-3`, 56px icon, title, owner), **实例类型** chips **已有实例** / **新实例**; existing-instance list (search **搜索实例**, rows with 32px icon + name + base button **安装** / disabled **✓ 已安装**; incompatible ones outlined orange with `TriangleAlertIcon`), footer `BoxIcon` **{n} 个兼容 实例** + **取消**; new-instance tab: icon picker (**选择图标** / **移除图标**), **名称** (default ⚠ "New instance (N)" English), **加载器** chips, **游戏版本** combobox (**选择游戏版本**, footer **显示所有版本**/**隐藏快照版本**), actions **取消** · colored **安装**.

### 7.4 Instance picker (`BrowseInstanceSelector`)

`NewModal` 560px: header **选择一个实例**; `StyledInput` search **搜索实例**; rows `min-h-16 rounded-lg px-3 py-2 gap-3` with **40px** instance icon, name (600 `#1a202c`) and `loader version` line (14px tertiary, capitalized), current target marked with pink `CheckIcon`; hover `bg-white`; footer quiet **+ 创建实例**. Empty: **请先创建实例再安装内容**. Switching target with a non-empty cart → **更改安装目标？** modal showing **当前目标** | **新目标** cards and buttons **取消** · red outlined `TrashIcon` **清空并切换** · colored `DownloadIcon` **安装到当前实例** (busy: **正在准备安装…**).

### 7.5 Confirm modal (`ContentInstallPreviewModal`, width 40rem)

- Header **确认安装** (24px/600, 24px padding, 1px `#ddd` divider).
- **已选内容** list: rows `rounded-lg border #ffffff bg #f5f5f5 p-3 gap-3`, 40px avatar, title (600) + `versionNumber · provider · contentType` (14px tertiary, raw lowercase e.g. `mc1.21.1-0.6.13-fabric · modrinth · mod` **(inferred example)**), quiet `XIcon` to remove.
- Sentence: **请确认将在 {instance} 中安装 {n} 个内容 和 {m} 个前置。**
- **前置** with count pill **{n} 个前置**; groups **必要前置** / **可选前置**; dependency cards `rounded-xl border #fff bg #f5f5f5` with checkbox, 40px icon, title + chevron (expands description **暂无简介。** + outlined **打开项目页面**), lines **被 {projects} 需要**, chips **下载的版本可能与当前版本不兼容。** (warning tint), **已安装**/**已包含**; footnote **只会安装勾选的前置。**; quiet 2xs **全选**/**全部取消**.
- **跳过** list with reasons (**已安装**, **找不到兼容版本**, **已内置于项目中** …).
- Actions: outlined **取消** · colored brand **安装** (or **安装已解析内容**).
- Conflict variant: header **可能重复的内容**, warning card, text **{candidate} 可能与已安装或已选择的内容相同，仍要继续吗？**, button **仍然安装**.

**Modal motion** (`NewModal`): overlay = vertical gradient `color-mix(brand-shadow 10%, rgba(0,0,0,.52)) → color-mix(brand-shadow 2%, rgba(0,0,0,.95))` + `backdrop-filter: blur(5px)`, fade 0.2s; the modal container starts translated toward the **click position** and moves to centre (0.2s ease-out) while the body goes `scale .97 → 1`, opacity 0 → 1. Body: `bg #f8f8f8 rounded-2xl border #ddd`, `box-shadow: 4px 4px 26px 10px rgba(0,0,0,.08)`.

### 7.6 Progress visuals

**A. Download toast** (`PopupNotificationPanel` + `NotificationToast type="instance-download"`) — the in-flight install indicator:
- Stack position: fixed, `top: calc(var(--top-bar-height, 3rem) + 1.5rem)` = **72px**; `right: calc(var(--right-bar-width, 0px) + 1.5rem)`. The panel is mounted at the app root where `--right-bar-width` is not defined (it is only set on `.app-grid-layout/.app-contents`), so it resolves to **right: 24px — i.e. the toasts float over the pink right sidebar** **(inferred from CSS variable scoping)**. Width **420px**, gap 12 between toasts.
- Card: `rounded-[20px]` border 1px `#ddd`, bg `#f8f8f8`, `p-4`, `box-shadow: 0 4px 8px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.2)`.
- Content: **44px** icon (radius 12, 1px `#ddd`) · title **18px/600** line-height 24 (the content title, e.g. **钠 (Sodium)**; for multi-item batches ⚠ "{n} items" in English with the instance icon) · dismiss quiet 2xs `XIcon` · status line 16px `#1a202c` @85% (e.g. **正在下载内容**, **准备实例**, **完成**, then **已完成**) with right-aligned **12px tabular** progress label (`2 / 3`, `12.4 MiB / 18.9 MiB` or `66%`) · action row: colored red `XIcon` **取消** (while queued/running), **重试** (failed), **复制详情** (stalled ≥30s).
- **Bottom progress bar**: absolute, `h-1` (**4px**) full width at the bottom edge, track `rgba(245,245,245,.5)`, fill **solid `#db2777`**, `transition: left,width 200ms ease-in-out`; indeterminate = 20%-wide segment sliding left→right 1s linear infinite.
- Enter/leave: `translateX(100%) scale(0.8)`, opacity 0 ↔ identity, **0.3s ease-in-out**. When all items are finished and have no progress, auto-closes after 30s.
- When the toast is collapsed/dismissed, the top bar shows a quiet pink circular `DownloadIcon` button (tooltip **查看正在下载内容**).

**B. Left-nav badge**: on the Downloads nav button, `absolute right-0 top-0 min-w-4 rounded-full bg-#db2777 px-1 text-[10px] font-bold leading-4 text-white` with the active job count.

**C. Downloads page** (`/downloads`, nav **下载**):
- Header row: local `NavTabs` **正在进行** (`DownloadIcon`) / **历史记录** (`ClockIcon`) + colored brand `PlusIcon` **新建下载**.
- Filter row: `StyledInput` **搜索下载任务** (36px) + combobox **所有来源** (176px) [+ **所有状态**, outlined `TrashIcon` **清空历史** on history].
- Job card (`Card !p-0`: `#f8f8f8`, radius 16, 1px white border): `p-4 gap-4`: **48px** icon (radius 12; fallback = pink-tint square with pink `DownloadIcon`) · title `h2` **18px/600** + provider `TagItem` + status `Badge` (8px dot + bold label: **● 进行中** orange `#e08325`, **● 排队中** blue, **● 已完成** green, **● 失败** red) · meta line 14px tertiary: phase • time • **目标实例：{instance}** · telemetry: **来源：官方** • **速度：3.2 MiB/秒** • **预计剩余 12 秒** **(values illustrative)** · buttons 2xs: red outlined **取消**, quiet **详细信息**/**收起详情**, outlined **打开实例** …
- Progress (`ProgressBar full-width`, `px-4 pb-4`): label row (left text e.g. `12.4 MiB / 18.9 MiB` or phase; right `66%` 14px tertiary + spinning `SpinnerIcon` 20px → green `CheckCircleIcon` when the track completes); bar **8px** (`h-2`) `rounded-full`, track **`rgba(219,39,119,.25)`**, fill **`#db2777`** → **green** when complete; fill has a 2px inner gradient border `rgba(255,255,255,.3) → transparent`; width transition **0.2s ease-in-out**; indeterminate = segment sweeping `left -50% → 100%`, width 20%→60%→20%, 1s linear.
- Empty: **暂无下载任务** / **新的下载与安装进度会显示在这里。**

Install phases (toast text, `app.install.phase.*`): **准备实例** · **正在解析内容** · **正在下载 .mrpack** · **正在读取整合包清单** · **正在下载内容** · **提取覆盖项** · **正在解析 Minecraft** · **正在解析加载器** · **正在准备 Java** · **正在下载 Minecraft** · **正在安装加载器** · **完成** · **回滚**. Downloads-page phase labels (`app.downloads.phase.*`): **正在准备实例**, **正在下载内容**, **正在完成安装**, **已完成** …

**D. Post-install notifications** (generic popup card: `rounded-2xl bg #f8f8f8 shadow-xl border #ddd p-4`, type icon 20px coloured): **已安装前置** / **已自动安装 {n} 个前置：{list}**; **部分前置已跳过** / **以下前置未安装：{list}**.

---

## 8. Favorites page (`/browse/favorites`, tab **收藏夹**)

Same NavTabs; search `StyledInput h-12` **搜索收藏夹**; instance button (**选择实例**); type filter button `BookmarkIcon` + **全部内容类型** (menu: 模组/资源包/数据包/光影包/整合包/地图/服务器); left label **最近收藏** (14px/500 tertiary), view-mode circle (tooltip **切换视图**), pagination. Cards = `ProjectCard` with actions: outlined brand install (**安装** / **已选择** / **验证** while installing) + quiet pink circular `BookmarkFilledIcon` (tooltip **从收藏夹移除**). Empty: **暂无收藏** / **收藏模组、资源包、数据包和光影包，之后随时安装。**

---

## 9. zh-CN string catalog (verbatim; `[app]` = app locale file, `[ui]` = packages/ui locale file)

### 9.1 Browse chrome

| id | zh-CN | en |
|---|---|---|
| `app.browse.discover-content` [app] | 发现内容 | Discover content |
| `app.navigation.discover-content` [app] | 发现内容 | Discover content |
| `app.browse.project-type.modpacks` | 整合包 | Modpacks |
| `app.browse.project-type.mods` | 模组 | Mods |
| `app.browse.project-type.resourcepacks` | 资源包 | Resource Packs |
| `app.browse.project-type.datapacks` | 数据包 | Data Packs |
| `app.browse.project-type.maps` | 地图 | Maps |
| `app.browse.project-type.shaders` | 光影包 | Shaders |
| `app.browse.project-type.servers` | 服务器 | Servers |
| `app.browse.project-type.favorites` | 收藏夹 | Favorites |
| `browse.search.placeholder` [ui] | 搜索{projectType}…… | Search {projectType}... |
| `project-type.mod.lowercase` [ui] | {count, plural, other {模组}} | |
| `app.project.translation.translate` | 翻译 | Translate |
| `app.project.translation.show-original` | 显示原文 | Show original |
| `app.project.translation.translating` | 正在翻译… | Translating… |
| `app.browse.choose-instance` | 选择实例 | Choose instance |
| `app.browse.source.all` | 所有来源 | All sources |
| `app.browse.source.modrinth` | Modrinth | |
| `app.browse.source.curseforge` | CurseForge | |
| `app.browse.source.mcarchive` | MCArchive 来源 | |
| `app.browse.source.planet-minecraft` | Planet Minecraft 来源 | |
| `label.sort-by` [ui] | 排序方式 | Sort by: |
| `browse.sort.relevance` [ui] | 相关性 | Relevance |
| `browse.sort.downloads` [ui] | 下载量 | Downloads |
| `browse.sort.followers` [ui] | 关注者 | Followers |
| `browse.sort.date-published` [ui] | 发布日期 | Date published |
| `browse.sort.date-updated` [ui] | 更新日期 | Date updated |
| `browse.view-prefix` [ui] | 查看 | View: |
| `app.browse.display-mode.switch` | 切换视图 | Switch view |
| `app.browse.display-mode.list` | 列表 | List |
| `app.browse.display-mode.compact-list` | 紧凑列表 | Compact list |
| `app.browse.display-mode.grid` | 网格 | Grid |
| `browse.loading-results` [ui] | 正在加载结果…… | Loading results… |
| `browse.no-results.heading` [ui] | 这里还是空的 | Nothing here yet |
| `browse.no-results` [ui] | 没有找到您的查询结果！ | No results found for your query! |
| `browse.clear-search` [ui] | 清除搜索 | Clear search |
| `browse.offline.heading` [ui] | 网络未连接 | No connection |
| `browse.retry` [ui] | 重试 | Try again |
| `app.browse.fuzzy-search.prefix` | 未找到「{original}」的结果，已为您显示 | |
| `app.browse.fuzzy-search.suffix` | 的相关结果 | instead |
| `pagination.go-to-page` [ui] | 跳转到页码 | Go to page |
| `pagination.go-to-page.placeholder` [ui] | 页码 | Page |
| `pagination.loading-page` [ui] | 正在加载页面…… | Loading page… |

### 9.2 Filters

| id | zh-CN |
|---|---|
| `search.filter_type.game_version` | 游戏版本 |
| `search.filter_type.game_version.all_versions` | 列出所有版本 |
| `search.filter_type.mod_loader` | 加载器 |
| `header.category.category` | 类别 |
| `header.category.feature` | 功能特点 |
| `header.category.performance-impact` | 性能要求 |
| `header.category.resolutions` | 分辨率 |
| `header.category.cf-extra` | 更多 CurseForge 分类 |
| `search.filter_type.environment` | 运行环境 |
| `search.filter_type.environment.client` / `.server` | 客户端 / 服务端 |
| `search.filter_type.license` / `.open_source` | 许可证 / 开源 |
| `search.filter_type.compatible_dependency_project_ids` | 依赖于 |
| `search.filter_type.advanced` / `.exclude_plugin` / `.exclude_datapack` / `.exclude_mod` | 高级 / 排除插件 / 排除数据包 / 排除模组 |
| `search.filter.dependent_project.search_placeholder` | 搜索项目…… |
| `search.filter.option.show_more` / `show_fewer` | 显示更多 / 显示更少 |
| `search.filter.option.search.placeholder` | 搜索… |
| `search.filter.option.exclusion.add.tooltip` | 排除 |
| `search.filter.locked.instance` [app] | 由该实例提供 |
| `search.filter.locked.instance-game-version.title` [app] | 游戏版本由实例提供 |
| `search.filter.locked.instance-loader.title` [app] | 加载器版本由实例提供 |
| `search.filter.locked.default.description` | 解锁这个筛选项可能导致安装不兼容的内容。 |
| `search.filter.locked.default.unlock` | 解锁筛选 |
| `search.filter.locked.instance.sync` [app] | 与实例同步 |
| `label.hide-installed-content` | 隐藏已安装内容 |
| `label.filters` | 过滤器 |
| Category names (`tag.category.*`) | 优化 optimization · 实用 utility · 库 library · 科技 technology · 冒险 adventure · 装饰 decoration · 魔法 magic · 存储 storage · 地形 worldgen · 管理 management · 机制 game-mechanics · 交通 transportation · 经济 economy · 社交 social · 生物 mobs · 食物 food · 小游戏 minigame · 邪门 cursed · 装备 equipment |
| Loader names (`tag.loader.*`) | Fabric · Forge · NeoForge · Quilt · Iris · OptiFine · 原版着色器 (vanilla) |

### 9.3 Card

| id | zh-CN |
|---|---|
| `button.install` [ui] | 安装 |
| `label.installed` [ui] | 已安装 |
| `app.browse.selected` | 已选择 |
| `label.selected` [ui] (project page) | 已选 |
| `app.browse.add` | 添加 |
| `app.browse.add-to-an-instance` | 添加到实例 |
| `app.browse.server.installing` | 安装中 |
| `label.installing` [ui] (project page) | 安装中…… |
| `label.validating` [ui] | 验证 |
| `app.content-favorites.add` / `.remove` | 添加到收藏夹 / 从收藏夹移除 |
| `project.download-count-tooltip` [ui] | {count, number} {count, plural, other {次下载}} |
| `project.follower-count-tooltip` [ui] | {count, number} {count, plural, other {人关注}} |
| `project-card.date.updated.tooltip` / `published` | 更新于 {date} / 发布于 {date} |
| `project-card.environment.client` / `server` / `client-or-server` / `client-and-server` | 客户端 / 服务端 / 客户端或服务端 / 客户端和服务端 |
| `button.open-in-modrinth` | 在 Modrinth 中打开 |
| `button.copy-link` | 复制链接 |

### 9.4 Cart, instance picker, install

| id | zh-CN |
|---|---|
| `browse.selected-projects-floating-bar.selected-count` [ui] | {count, plural, other {#个已选择的项目}} |
| `app.browse.install-selected` | 安装 {count} 个内容 |
| `app.browse.preparing-selected` | 正在准备 {completed}/{total} |
| `button.clear` | 清除 |
| `browse.selected-projects-leave-modal.header` | 选定的项目尚未安装 |
| `browse.selected-projects-leave-modal.discard` | 丢弃 |
| `app.browse.instance-selector.title` | 选择一个实例 |
| `app.browse.instance-selector.search` | 搜索实例 |
| `app.browse.instance-selector.create` | 创建实例 |
| `app.browse.instance-selector.no-instances` | 请先创建实例再安装内容 |
| `app.browse.instance-selector.switch-title` | 更改安装目标？ |
| `app.browse.instance-selector.current-target` / `new-target` | 当前目标 / 新目标 |
| `app.browse.instance-selector.install-current` | 安装到当前实例 |
| `app.browse.instance-selector.clear-and-switch` | 清空并切换 |
| `app.browse.back-to-instance` | 返回实例 |
| `label.installing-content` | 安装内容 |
| `app.content-install.preview.header` | 确认安装 |
| `app.content-install.preview.selected-content-header` | 已选内容 |
| `app.content-install.preview.batch-description` | 请确认将在 {instance} 中安装 {projectCount, plural, other {# 个内容}} 和 {dependencyCount, plural, other {# 个前置}}。 |
| `app.content-install.preview.description` | 将在 {instance} 中为 {project} 自动安装 {count, plural, other {# 个前置}}。 |
| `app.content-install.preview.dependencies-header` | 前置 |
| `app.content-install.preview.dependencies-count` | {count, number} 个前置 |
| `app.content-install.preview.required-dependencies-header` / `optional-…` | 必要前置 / 可选前置 |
| `app.content-install.preview.required-by` | 被 {projects} 需要 |
| `app.content-install.preview.only-checked` | 只会安装勾选的前置。 |
| `app.content-install.preview.skipped-header` | 跳过 |
| `app.content-install.preview.install` / `install-resolved` | 安装 / 安装已解析内容 |
| `app.content-install.preview.cancel` | 取消 |
| `app.content-install.preview.conflict-header` | 可能重复的内容 |
| `instances.content-install.header` [ui] | 安装项目 |
| `instances.content-install.existing-tab` / `new-tab` | 已有实例 / 新实例 |
| `instances.content-install.compatible-count` | {count} 个兼容 {count, plural, one {实例} other {实例}} |
| `app.modpack-install.title` | 安装整合包 |
| `app.modpack-install.version` / `select-version` | 版本 / 选择版本 |
| `app.modpack-install.instance-name` / `-placeholder` | 实例名称 / 我的整合包实例 |
| `app.content-install.dependencies-installed.notification-title` / `-body` | 已安装前置 / 已自动安装 {count, plural, other {# 个前置}}：{list} |

### 9.5 Project page

| id | zh-CN |
|---|---|
| `project.settings.description.title` / `versions` / `gallery` | 描述 / 版本 / 图库 |
| `app.project.install-button.already-installed` | 此项目已安装 |
| `app.project.install-button.switch-version` | 切换版本 |
| `button.switch-to-version` [ui] (versions tab) | 切换到此版本 |
| `app.project.install-context.install-content-to-instance` | 将内容安装到实例中 |
| `app.project.install-context.back-to-browse` | 返回发现页 |
| `app.project.open-in-mcmod` | 在 MC 百科中打开 |
| `button.more-options` / `button.open-in-browser` | 更多选项 / 在浏览器中打开 |
| `button.follow` | 关注 |
| `button.play` | 开始游戏 |
| `project.actions.view-dependents` / `view-modpacks` | 查看依赖项目 / 查看整合包 |
| `project.about.compatibility.title` | 兼容性 |
| `project.about.compatibility.game.minecraftJava` | Minecraft：Java版 |
| `project.about.compatibility.platforms` | 平台 |
| `project.about.compatibility.environments` | 支持的运行环境 |
| `project.about.links.title` | 相关链接 |
| `project.about.tags.title` | 标签 |
| `project.about.creators.title` | 作者 |
| `label.details` | 信息 |
| `project.about.details.licensed` / `published` / `updated` | 许可证：{license} / {date} 发布 / {date} 更新 |

### 9.6 Progress / downloads

| id | zh-CN |
|---|---|
| `app.navigation.downloads` | 下载 |
| `app.action-bar.view-active-downloads` | 查看正在下载内容 |
| `app.downloads.in-progress` / `history` | 正在进行 / 历史记录 |
| `app.downloads.new-download` | 新建下载 |
| `app.downloads.search` | 搜索下载任务 |
| `app.downloads.status.running` / `queued` / `succeeded` / `failed` / `canceled` | 进行中 / 排队中 / 已完成 / 失败 / 已取消 |
| `app.downloads.progress` | 进度 |
| `app.downloads.download-speed` | 速度：{speed}/秒 |
| `app.downloads.download-eta-seconds` | 预计剩余 {seconds} 秒 |
| `app.downloads.download-source` | 来源：{source} |
| `app.downloads.instance-target` | 目标实例：{instance} |
| `app.downloads.open-instance` | 打开实例 |
| `app.downloads.details` / `hide-details` | 详细信息 / 收起详情 |
| `app.downloads.empty-title` / `empty-description` | 暂无下载任务 / 新的下载与安装进度会显示在这里。 |
| `app.install.phase.downloading_content` | 正在下载内容 |
| `app.install.phase.preparing_instance` | 准备实例 |
| `app.install.phase.finalizing` | 完成 |
| `app.action-bar.install.cancel` / `retry` | 取消 / 重试 |

### 9.7 Onboarding copy for this area (great for tone)

| id | zh-CN |
|---|---|
| `app.onboarding.discover.title` | 找点新鲜的 |
| `app.onboarding.discover.description` | 整合包、模组、插件、资源包、光影：这才是值得掉进去的坑。 |
| `app.onboarding.browse.title` | 搜索，不靠玄学 |
| `app.onboarding.browse.description` | 用类型、搜索和筛选快速收敛范围，项目页把版本、更新日志、图库和安装选择都放在一个地方。 |
| `app.onboarding.favorites.title` | 留个清单 |

---

## 10. Icons used in this area → SVG files

All under `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\` (exported via `generated-icons.ts` / `index.ts`; most are Lucide-style, 24×24 viewBox, `stroke=currentColor`, `stroke-width=2`, round caps/joins).

| Component | File | Where |
|---|---|---|
| `SearchIcon` | `icons\search.svg` | search field |
| `XIcon` (filled 20×20 viewBox) | `icons\x.svg` | clear search, remove pill, dismiss toast |
| `PlusIcon` | `icons\plus.svg` | **install button**, choose instance, cart install |
| `CheckIcon` | `icons\check.svg` | 已选择 / 已安装 |
| `SpinnerIcon` (25% ring + 75% arc, fill) | `icons\spinner.svg` | installing, loading |
| `DownloadIcon` | `icons\download.svg` | download count, project install button, downloads nav |
| `HistoryIcon` / `CalendarIcon` | `icons\history.svg` / `icons\calendar.svg` | card date |
| `HeartIcon` | `icons\heart.svg` | followers |
| `BookmarkIcon` / `BookmarkFilledIcon` | `icons\bookmark.svg` / `icons\bookmark-filled.svg` | favorite |
| `LanguagesIcon` | `icons\languages.svg` | 翻译 |
| `GlobeIcon` | `icons\globe.svg` | 所有来源, env "客户端或服务端" |
| `ArrowUpDownIcon` / `EyeIcon` | `icons\arrow-up-down.svg` / `icons\eye.svg` | sort / per-page |
| `ListIcon` / `GenericListIcon` / `GridIcon` | `icons\list.svg` / `icons\generic-list.svg` / `icons\grid.svg` | view modes |
| `ChevronDownIcon` / `ChevronLeftIcon` / `ChevronRightIcon` | `icons\chevron-down.svg` / `chevron-left.svg` / `chevron-right.svg` | selectors, pagination |
| `DropdownIcon` | `icons\dropdown.svg` | accordion headers |
| `EllipsisVerticalIcon` / `MoreVerticalIcon` | `icons\ellipsis-vertical.svg` / `icons\more-vertical.svg` | pagination gap / overflow |
| `LockIcon` / `LockOpenIcon` | `icons\lock.svg` / `icons\lock-open.svg` | locked filters |
| `BanIcon` / `XCircleIcon` | `icons\ban.svg` / `icons\x-circle.svg` | exclude / clear all |
| `SparklesIcon` | `icons\sparkles.svg` | fuzzy-search notice |
| `ClientIcon` / `ServerIcon` | `icons\client.svg` / `icons\server.svg` | environment tags |
| `LeftArrowIcon` | `icons\left-arrow.svg` | back (install header) |
| `BoxIcon` | `icons\box.svg` | game version |
| `CompassIcon` | `icons\compass.svg` | Discover nav |
| `FolderSearchIcon` | `icons\folder-search.svg` | empty state |
| `CheckCircleIcon` | `icons\check-circle.svg` | completed progress |
| `ExternalIcon` / `ClipboardCopyIcon` | `icons\external.svg` / `icons\clipboard-copy.svg` | context menu |
| `TriangleAlertIcon` | `icons\triangle-alert.svg` | incompatible instance |
| `EyeIcon` / `EyeOffIcon` | `icons\eye.svg` / `icons\eye-off.svg` | 安装项目 modal visibility toggle |
| `BookOpenIcon` / `PackageIcon` / `ReportIcon` | `icons\book-open.svg` / `icons\package.svg` / `icons\report.svg` | project overflow menu |
| `PlayIcon` / `StopCircleIcon` | `icons\play.svg` / `icons\stop-circle.svg` | server projects 开始游戏 / 停止 |
| `ClockIcon` / `RefreshCwIcon` | `icons\clock.svg` / `icons\refresh-cw.svg` | Downloads tabs / retry |
| `CrownIcon` / `OrganizationIcon` | `icons\crown.svg` / `icons\organization.svg` | 作者 sidebar |
| `SwapIcon` (app) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\icons\arrow-left-right.svg` | 切换版本 |
| Loader tags | `icons\tags\loaders\fabric.svg`, `forge.svg`, `neoforge.svg`, `quilt.svg`, `iris.svg`, `optifine.svg`, `vanilla.svg` | card tags, filters, platform pills |
| Category icons (sidebar) | `icons\tags\categories\<slug>.svg` (e.g. `optimization.svg` = lightning bolt, `library.svg`, `technology.svg`, `utility.svg`, `decoration.svg`, `adventure.svg`) | filter options |
| ⚠ `ModrinthIcon` | `branding\logo.svg` (**Modrinth** logo) | source switcher option, Downloads provider tag — **do not use** |
| ⚠ `CurseForgeIcon` | `external\curseforge.svg` | source option / provider tag — third-party |

Axolotl's own brand marks: `packages\assets\branding\axolotl.svg` / `axolotl.png` (pixel axolotl). Mascot illustration that fits this area perfectly: **`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-searching.svg`** (pixel axolotl holding a magnifying glass; used by onboarding `OnboardingMascotStage.vue`) and `axo-teaching.svg` (mortarboard + book). Rendered preview: `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\mascots.png`.

---

## 11. Realistic example data (Sodium / Iris / Fabric API …)

How a hit looks on a zh-CN card: **title** (bilingual if the bundled MC百科 dictionary `WikiEntries.txt` has a Chinese name; rule `bilingualTitle()` → `中文名 (English)`), **Modrinth/CurseForge** pill, **English summary** (until 翻译), compact downloads, relative "updated" date, loader + category tags. Authors are not shown on cards (they appear on the project page sidebar 作者 and in the 安装项目 modal).

| Project | Modrinth slug | Card title in zh-CN (from dictionary) | MC百科 class (line no.) | Summary (Modrinth, English — verify) | Typical tags |
|---|---|---|---|---|---|
| Sodium | `sodium` — id **`AANobbMI`** (verified in `content-identity.test.ts`); CurseForge id **394468** (verified) | **钠 (Sodium)** | 2785 | "The fastest and most compatible rendering optimization mod for Minecraft. Now available for both NeoForge and Fabric!" **(from memory)** | Fabric · NeoForge · Quilt · 优化 |
| Iris Shaders | `iris` (id `YL57xq9U` **(from memory)**) | **Iris Shaders** (dictionary entry `irisshaders@iris` has no Chinese name) | 3697 | "A modern shader pack loader for Minecraft intended to be compatible with existing OptiFine shader packs" **(from memory)** | Fabric · NeoForge · Quilt · 装饰 · 优化 **(inferred)** |
| Fabric API | `fabric-api` (id `P7dR8mSH` **(from memory)**) | **Fabric API** (no Chinese name) | 3124 | "Lightweight and modular API providing common hooks and intercompatibility measures utilized by mods using the Fabric toolchain." **(from memory)** | Fabric · 库 |
| Lithium | `lithium` | **锂 (Lithium)** | 2292 | | Fabric · NeoForge · 优化 **(inferred)** |
| Mod Menu | `modmenu` | **模组菜单 (Mod Menu)** | 1675 | | Fabric · Quilt · 实用 **(inferred)** |
| Sodium Extra | `sodium-extra` | **钠 · 扩展 (Sodium Extra)** | 3701 | | |
| Reese's Sodium Options | `reeses-sodium-options` | **Reese的钠视频界面 (Reese's Sodium Options)** | 4905 | | |
| Indium | `indium` | **铟 (Indium)** | 3413 | | |
| FerriteCore | `ferrite-core` | **铁氧体磁芯 (FerriteCore)** | 3888 | | |
| Entity Culling | `entityculling` | **实体渲染机制优化 (Entity Culling)** | 3629 | | |
| Create | `create` | **机械动力 (Create)** | 2021 | | |
| Litematica | `litematica` | **投影 (Litematica)** ← same word as the Lab's **投影工坊** | 2261 | | |
| JEI / REI | `jei` / `rei` | **JEI物品管理器 (Just Enough Items)** / **REI物品管理器 (Roughly Enough Items)** | 459 / 1674 | | |
| Cobblemon | `cobblemon` | **方块宝可梦 (Cobblemon)** | 9300 | | |

Numbers: download/follower counts change daily — fetch live values right before the final render from `https://api.modrinth.com/v2/project/<slug>` (fields `downloads`, `followers`, `icon_url`, `description`, `categories`, `loaders`, `updated`) and format with the rules in §5.3. The mockups use **placeholder** values (e.g. `74.62M`, `58.31M`, `141.9M`) that only demonstrate the format. Real mod icons are external Modrinth CDN images — use the `icon_url` from that API (not stored in the repo).

---

## 12. Brand caveats in this area (do not show Modrinth branding)

- `ModrinthIcon` = `packages\assets\branding\logo.svg` is the **Modrinth logo**; it appears only if the source switcher is set to "Modrinth" and on Downloads provider tags. Keep the switcher on **所有来源** (GlobeIcon) — this is also the real default when CurseForge is configured (release builds embed a CF key, `packages\app-lib\build.rs`).
- Text "Modrinth" appears in the card **provider pill**, the context menu **在 Modrinth 中打开**, the offline message, and Downloads provider tags. For the film: either keep the plain-text pill (factual, unbranded typography) or drop it; never draw the Modrinth logo.
- Grid-card fallback banner loads `https://cdn-raw.modrinth.com/landing-new/landing.webp` — replace with the colour gradient.
- Fonts are served from `cdn-raw.modrinth.com` (Inter) — use a local Inter.
- CurseForge logo (`external\curseforge.svg`) is a third-party mark as well.

---

## 13. Creative hooks found in the real product (suggestions, clearly not product facts)

1. **Pink continuity**: the hero's `#db2777` maps 1:1 onto real UI states — solid in the active tab pill and colored buttons, 1px stroke in the card's outlined **安装**, 4px translucent ring around the focused search field, 25% tint in selected filters/pagination/progress tracks, and the 4px / 8px progress fills. The button can "change state" by literally becoming these.
2. **Stretch for free**: the NavTabs pill already animates as an inchworm (leading edge first, trailing edge +200ms). Let the hero stretch from **模组** into the 48px search field (radius 999 → 12, solid → white with pink focus ring).
3. **Squash for free**: cards and buttons scale to **0.97** on press; the floating cart bar enters with an overshoot spring `cubic-bezier(.15,1.4,.64,.96)`.
4. **"Fall into" line** from the product's own onboarding: **这才是值得掉进去的坑。** (the good kind of rabbit hole).
5. **Search gag**: typing Chinese **钠** surfaces **钠 (Sodium)** (real Chinese-search feature); a typo like `sodiumextra` triggers the real notice **未找到「sodiumextra」的结果，已为您显示 sodium extra 的相关结果**; an empty result shows **这里还是空的**.
6. **Bridge to the Lab**: Litematica's Chinese name is **投影 (Litematica)** — same word as **投影工坊**.
7. **Card → cart → progress**: 安装 (pink outline) → ✓ 已选择 (green outline) → floating **安装 1 个内容** (solid pink) → **确认安装** modal → toast with a 4px pink bar → ✓ 已安装.
8. **Mascot**: `axo-searching.svg` (axolotl with magnifying glass) is a native asset for the search beat.

---

## 14. Reconstruction mockups (built from the extracted values; NOT real screenshots)

Generated by `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\gen.js` + `scenes.js` (inline real SVG icons from `packages\assets\icons`, placeholder mod icons, Chrome headless at 1440×900, 1×):

| File | Shows |
|---|---|
| `E:\GitHub\Axolotl-animation\research\_scratch\04-browse\scene-a-browse.png` | Browse › 模组, no target instance: tabs, search placeholder, 选择实例 / 所有来源, sort/per-page/view/pagination, 3 list cards (钠 (Sodium), Iris Shaders, Fabric API) with **选择实例** buttons, sidebar 类别 list |
| `...\scene-b-browse-cart.png` | Target instance chosen, query **钠** focused (pink ring), locked pills, cards in **已选择 / 安装 / 已安装** states, sidebar locked sections + 隐藏已安装内容, floating cart bar **安装 1 个内容** |
| `...\scene-c-project.png` | Project header (Sodium), 翻译 + big **安装** button, 描述/版本/图库 tabs, sidebar 兼容性…, strip of xl install states (安装 / 安装中…… / 已选 / 已安装 / 切换版本) |
| `...\scene-d-parts.png` and `scene-d-parts@2x.png` | Button state sheet, focus ring, cart/project buttons, compact row, grid card, download toast, ProgressBar |
| `...\mascots.png` | `axo-searching.svg` and `axo-teaching.svg` rendered |

Caveats: Windows Chrome rendered CJK with Microsoft YaHei (the real macOS app uses PingFang SC); mod icons/colours, download numbers and the instance name are placeholders; the environment pill is included although it is probably not rendered in the shipping app (§5.3).

---

## 15. Uncertainties / things not verifiable offline

- Environment tag on browse cards: probably hidden for real hits (v3 search hits lack string `client_side`/`server_side`) — **inferred**.
- Whether Modrinth v3 hits include loader slugs in `display_categories`/`categories` (drives the coloured loader tags) — **inferred yes**, not verified at runtime.
- Exact Modrinth summaries, download/follower counts, icons, categories of Sodium/Iris/Fabric API in 2026 — must be fetched live.
- Maps (`world`) search placeholder falls back to **搜索项目……** — inferred from message lookup (no `world` key).
- Some UI copy is hard-coded English in source: "Clear all filters", "New instance (N)", "{n} items" (batch toast title), project overflow "Report"/"More options"/"Coming soon".
- CJK font face on Windows builds (Microsoft YaHei UI) vs macOS (PingFang SC) — product ships no CJK font; choose one for the film.
