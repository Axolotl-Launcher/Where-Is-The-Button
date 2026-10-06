# 03 · App shell + Home page + THE LAUNCH BUTTON (protagonist)

Research for the short film 《启动按钮去哪了？》. This file is the animator's source of truth for the launcher chrome, the Home page and the launch/play button.

**Conventions**

- Repo root (read-only): `E:\GitHub\Axolotl-animation\upstream\Axolotl` — app version **1.9.7** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\package.json`), last commit `2b5c22d` (2026-10-05, shallow clone).
- All sizes are **CSS px at 1×** (root font-size 16px, so 1rem = 16px; Tailwind `h-12` = 48px and so on).
- Colors are resolved for the **light theme with the default `accent-pink`** unless marked *dark*. Every `color-mix()` was computed (sRGB or OKLab, as declared). The computed calendar heat colors match the official screenshot pixel-for-pixel, which validates the token pipeline.
- **(inferred)** = not directly visible in code or pixels; reasoning given. **(computed)** = arithmetic from code values. **(measured)** = pixel measurement on `E:\GitHub\Axolotl-animation\research\ref\launcher-home.png`.

---

## 0. TL;DR for the director

1. **Protagonist = the brand-pink 「开始游戏」 button.** Code: `<Button type="colored" color="brand" size="xl" class="w-36 justify-center">` in Minimal Home. It is **144×48**, radius **16**, fill **#db2777**, white 16px/800 label, white outline play triangle (lucide `play`, 24px, stroke 2), 8px gap. It has a 1px pink ring, a soft layered drop shadow and a 1px white top gloss. The instance page uses the same paint at auto width (126×48).
2. **The real zh-CN label is 「开始游戏」** (`button.play`); no main button reads just "启动". The word **启动** appears in the product as:
   - the tooltip of the calendar's mini play button (`app.home.calendar.play` = 「启动」),
   - the local-server start action (`app.servers.action.start` = 「启动」),
   - the in-flight state 「正在启动…… 3 秒」 (`app.instance.starting`),
   - the menu item 「启动实例」,
   - the Home greeting 「下一个项目只差一次启动。」.

   Suggestion: keep 「开始游戏」 on the button and let 「正在启动…… N 秒」 be the climax.
3. **Shell layers:**
   - chrome (48px title bar plus 64px nav rail) in **#f8f8f8**;
   - a **recessed content well** in **#ebebeb** with a 20px top-left radius, a 1px #dddddd stroke and an inner shadow;
   - a **300px right panel** with a pale-pink gradient.

   The active nav item is a **48px pink circle** with a white icon and a dark glow. The pink pill "inchworms" between nav items: one edge leads and the other follows 120ms later.
4. **Two Home layouts**, switched by a floating pill at the bottom right:
   - **信息主页 / Information Home** — a widget grid, the default;
   - **极简主页 / Minimal Home** — one centered card holding the big pink button. This is the best stage for the opening.
5. **The official screenshot (`launcher-home.png`, also the website hero) shows the *pre-widget* Home** from commit `f12c3a85`, dated 2026-07-29/31. It is **not** the v1.9.7 widget dashboard. Both are documented: §4.2 is current, §4.3 is the showcase. In the showcase the rows end in **white** 「▷ 开始游戏」 buttons, 112×36.

---

## 1. Sources and version map

| Item | Absolute path / ref | Notes |
|---|---|---|
| Shell | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\App.vue` | template L2849–3519, scoped styles L3521–3998, global L3999–4022 |
| Home page | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Index.vue` | layout switch, floating controls, sidebar teleport |
| Home components | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\*` | HomeMinimal, HomeDashboard, HomeGreeting, widgets, `home-dashboard.ts` (grid math) |
| Button primitive | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\ButtonFrame.vue` (+ `Button.vue`, `types.ts`) | exact size, type and shadow classes |
| Tokens | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\variables.scss`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\opacity.scss`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\stylesheets\global.scss`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\defaults.scss` | Tailwind preset: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\tooling-config\tailwind\tailwind-preset.ts` (**preflight off**) |
| zh-CN strings | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json` (`message`), `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json` (`defaultMessage`) | ids resolved in §8 |
| Showcase screenshot | `E:\GitHub\Axolotl-animation\research\ref\launcher-home.png` (2560×1489) = `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\public\showcase\launcher-home.webp` | calendar "today" = 2026-07-29 |
| Showcase-era code | GitHub `Mystic-Stars/Axolotl` at sha `f12c3a85170fadeb373c375fd09e3720c0be499e` (2026-07-31). Read through the API only; nothing was written to the clone. | `Index.vue`, `HomeGreeting.vue`, `HomeRecentWorlds.vue`, `WorldItem.vue`, `ButtonStyled.vue`, `HomePinnedInstances.vue`, tailwind preset |
| Widget redesign | commit `389c820` "redesign information home with widgets" (2026-08-04) → shipped in **1.6.12** (publishedAt 2026-08-04): 「完全重新设计主页, 使其小组件化」 (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\announcements\catalog.ts`) | the theme-accent screenshot shows "Axolotl Launcher 1.6.0", consistent with the showcase being pre-1.6.12 |

**Screenshot calibration (measured):** 1 CSS px = **1.647** image px. The window's top-left is at image (93, 63) and the window is ≈ **1440×792 CSS px**. Checks: the right panel is 494 image px = 300 CSS, the nav rail 105 px = 64 CSS, the title bar 79 px = 48 CSS.

---

## 2. Design tokens (resolved)

### 2.1 Light theme + `accent-pink` (the film's look)

| Token | Value | Used for |
|---|---|---|
| `--surface-1` / `--color-bg` | **#ebebeb** | content well (page) background |
| `--surface-2` | #f5f5f5 | legacy cards (`bg-surface-2`) |
| `--surface-3` / `--surface-bar` / `--surface-card` | **#f8f8f8** | title bar, nav rail, widgets, cards, floating pill, tooltips |
| `--surface-4` | **#ffffff** | base buttons, avatars' fill, layout-switch track, back/forward circles |
| `--surface-5` / `--color-divider` | **#dddddd** | strokes: pill border, button inner ring, dividers |
| `--color-text-primary` | **#1a202c** | headings, button labels (base), names |
| `--color-text-default` | **#2c2e31** | nav icons, body text, base-button icons |
| `--color-text-tertiary` (`--color-secondary`) | **#484d54** | meta text, idle-pill dot (showcase) |
| `--color-brand` (= `--color-pink` = pink-600) | **#db2777** | primary buttons, nav active, heat level 4, thumbs, bars |
| `--color-brand-highlight` | rgba(219,39,119,.25) → ≈#e7bace on #ebebeb | tints |
| `--color-brand-shadow` | rgba(219,39,119,.68) | focus rings (4px) |
| `--color-accent-contrast` | **#ffffff** | text and icons on pink |
| `--color-red` (red-600) | **#cb2245** | 「停止」 buttons, stop icons |
| `--color-green` (green-600) | #00af5c | online indicator, server status dot |
| `--shadow-card` | `rgba(50,50,100,.1) 0 2px 4px 0` | widgets, avatars, row cards |
| `--shadow-button` | `0 1px 3px 0 rgba(0,0,0,.05), 0 1px 2px 0 rgba(0,0,0,.15)` | floating pill, showcase buttons |
| `--hover-brightness` | **0.9** | hover = `filter: brightness(.9)` |
| radii `--radius-xs/sm/md/lg/xl` | 4 / 8 / 12 / **16** / **20** | lg = cards/widgets, xl = content well corner |
| `--brand-gradient-bg` (accent) | `linear-gradient(0deg, brand 14%, brand 9%)` over #ebebeb ⇒ bottom **#e9d0db**, top **#ead9e1** (computed) | right panel |
| `--brand-gradient-border` | brand at 16% alpha ⇒ ≈ **#e8ccd8** | panel border and section dividers |
| `--brand-gradient-button` | rgba(255,255,255,.5) ⇒ ≈ #f4eaee on the panel | controls inside the right panel |
| `--loading-bar-gradient` | `#db2777 → #e76ca3` | 2px route loading bar |
| hover pink (brightness .9) | **#c5236b** (computed) | |
| hover white | #e6e6e6 (computed) | |
| Fonts | `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, …, sans-serif` (Inter 400/500/600/700/800 from `cdn-raw.modrinth.com`) | CJK falls back to the OS font: PingFang SC on macOS (max weight 600), Microsoft YaHei on Windows (700). Minecraft font `bundled-minecraft-font-mrapp` is used for server MOTDs |

The screenshot pixels match the computed values (± macOS color cast):

| Element | Screenshot | Computed |
|---|---|---|
| chrome | #f8f6f8 | #f8f8f8 |
| well | #ebe9eb | #ebebeb |
| nav active | #dc2878 | #db2777 |
| panel top → bottom | #ebd9e2 → #dbc0ce | #ead9e1 → #e9d0db |
| heat level 1 | #fdc8d7 | **#fdc9d7** |
| heat level 2 | #f7a2bb | **#f7a2bb** |
| heat level 3 | #ed739d | **#ee769e** |
| heat level 4 | #db2777 | **#db2777** |

### 2.2 Dark theme (`.dark-mode`, the default on a fresh install)

- **Surfaces:** #101215 / #1a1e24 / #262b34 / #333a46 / #424854.
- **Text:** #ffffff / #b0bac5 / #96a2b0.
- **Brand:** `--color-pink` = pink-400 **#f472b6**.
- **`--color-accent-contrast` = #000000.** Labels and icons on pink buttons turn **black** in dark mode.
- **Hover:** brightness **1.25**.
- **Nav active:** pill = `--color-brand-highlight` (≈#5a3d54 on the bar), icon pink.
- **Red:** #ff496e.
- **Right panel gradient:** ≈#251b23 → #301f2c.
- **Calendar heat levels:** #674b63 / #8d5779 / #b86393 / #f472b6.

Defaults on a fresh install: the SQLite defaults in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\app-lib\migrations\*.sql` are `theme='dark'`, `accent_color='pink'`, `home_layout='standard'`, `native_decorations=false`, `hide_on_process_start=false`.

A custom accent `#db2777` derives light #db2777 and dark #f16da8 (`deriveAccentVariants` in `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\store\theme.ts`).

---

## 3. Shell anatomy

### 3.1 Frame and layers (window 1440×792 example)

```
x: 0        64                                                    1140        1440
y:0 ┌───────────────────────────── TITLE BAR h48 · #f8f8f8 ─────────────────────────────┐
    │ [mac: 80px traffic-light gap] logo 24 · "Axolotl" · (←)(→) · ⌂ 主页 ……  📰 [● 没有运行中的实例] │
 48 ├────────┬───────────────────────────────────────────────────┬───────────────────────┤
    │ NAV    │ CONTENT WELL #ebebeb  ╭ radius 20 (top-left only)  │ RIGHT PANEL 300       │
    │ RAIL   │ 1px #ddd stroke + inset 1px 1px 15px rgba(0,0,0,.1)│ pink gradient bg      │
    │ 64     │ scrolls (gutter ≈10–16px, thumb #96a2b0)            │ 1px pink-16% border-L │
    │#f8f8f8 │                                                    │ ◂15×40 toggle tab     │
792 └────────┴───────────────────────────────────────────────────┴───────────────────────┘
```

- **Grid:** `.app-grid-layout` (bg `--surface-3`). `--top-bar-height: 3rem` (48), `--left-bar-width: 4rem` (64), `--right-bar-width: 300px`. Source: App.vue L3532–3561.
- **Content well:** `.app-contents` is absolutely positioned at left 64 / top 48 with bg `--color-bg`, `border-top-left-radius: 20px`, `overflow:hidden` and `isolation:isolate`. Its grid is `1fr var(--right-bar-width)`; the panel width animates `320ms cubic-bezier(0.22,1,0.36,1)` (App.vue L3638–3686).
- **Well overlay:** `.app-contents::before` sits at z-index 30 (`pointer-events:none`, inset 0, radius 20 top-left) with `box-shadow: 1px 1px 15px rgba(0,0,0,.1) inset` and `border: 1px solid #dddddd` (L3908–3922). This makes the "sunken stage" look, and the stroke also runs along the top of the right panel.
- **Panel shadow:** `.app-sidebar::before` is a 32px strip left of the panel with `box-shadow: -15px 0 15px -15px rgba(0,0,0,.1) inset`. It casts a soft shadow onto the well (L3813–3822).
- **2.5D layer order (suggested depth):**
  1. window
  2. chrome #f8f8f8
  3. sunken well #ebebeb
  4. cards and widgets #f8f8f8 (+`shadow-card`)
  5. buttons (#fff with ring / pink with soft shadow)
  6. floating pill (`shadow-button` + `0 4px 12px rgba(0,0,0,.2)`)
  7. tooltips (`drop-shadow(2px 2px .4rem rgba(0,0,0,.5))`) and modals

### 3.2 Title bar (`.app-grid-statusbar`, h48, `bg-surface-bar` #f8f8f8, z-index 200, whole bar is a drag region)

Left to right (App.vue L3085–3120):

1. **macOS**: native traffic lights. `.mac .app-grid-statusbar { padding-left: 5rem }` (80px). **Windows/Linux**: no left pad; window controls at the far right (item 7).
2. **Inner wrapper** `flex min-w-0 flex-1 overflow-hidden p-3` (12px padding).
3. **Logo group** `flex items-center gap-2`. Component `AxolotlLogo` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AxolotlLogo.vue`):
   - image `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.png` at **24×24** (`h-full` of a 24px row; the PNG has transparent margins, so the visible axolotl is ≈19px wide);
   - wordmark **"Axolotl"**: `text-sm` 14px, `font-extrabold` 800, `tracking-wide` 0.025em, #1a202c, shown only at window width ≥1280 (`hidden xl:inline`);
   - Beta builds only: a pill 「Beta」 (`rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700` → #e4ecfa / #184b8c).
4. **Back/forward** (`ml-3 gap-1`): two **24×24 white circles** (`bg-surface-4 rounded-full`) with `LeftArrowIcon` / `RightArrowIcon` (lucide arrow-left/right, 16px, #1a202c). Hover `brightness(.75)`.
5. **Breadcrumbs** (`pl-3 pt-[2px]`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Breadcrumbs.vue`). On Home the crumb is `[HomeIcon 20px #2c2e31] 主页`, 16px semibold #1a202c. *v1.9.7 adds the icon; the showcase shows only 「主页」.* Long crumbs hover-scroll (10s ease-in-out loop with a 12px edge fade mask).
6. **AppActionBar** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AppActionBar.vue`, `flex gap-2 items-center`, wrapper `mr-3`):
   - 🔔 notifications — only when history exists; quiet 36px circle;
   - 📰 **announcements** — always shown in v1.9.7; quiet circular icon-only, **36×36**, `NewspaperIcon` 20px, tooltip 「公告」, 8px red unread dot;
   - downloads (pink quiet circle, only while downloading), offline label 「离线」, update button (only if an update is available);
   - **running pill** (always shown): `flex items-center gap-2 py-1.5 px-3 rounded-xl border border-surface-5 text-sm`. That is **34px tall**, radius 12, 1px #dddddd stroke, no fill, 14px text.
     - **Idle**: 8px round dot + 「没有运行中的实例」 in #484d54. The dot class is `bg-secondary`. In the showcase era `secondary` meant `--color-text-tertiary` (#484d54; the screenshot shows #4b4d54). In v1.9.7 the alias was removed from the Tailwind preset, so the dot is **probably transparent** (inferred). Use the showcase look.
     - **Running**: `OnlineIndicatorIcon` 14px (green #00af5c core plus a 25% green halo ring) + **instance name** (#1a202c, link) + [▾ only if >1 process] + `StopCircleIcon` 20px **#cb2245** (tooltip 「停止实例」) + `TerminalSquareIcon` 20px #484d54 (tooltip 「查看日志」). The icon buttons press to `scale(.95)`.
7. **WindowControls** (Windows/Linux with custom decorations, the default): three quiet circular icon-only **36×36** buttons, `gap-2`, `mr-1.5`:
   - `MinimizeIcon` (a lucide "minus");
   - `MaximizeIcon` / `RestoreIcon`;
   - `XIcon` — quiet **red** with `interaction="filled"`, so hover fills #cb2245 with a white ×.

*Showcase only:* a white 36px circle with "→" sits left of the pill. That was the old sidebar toggle (inferred from its ←/→ flip between the Home and Lab screenshots). v1.9.7 moved it to the panel-edge tab (§3.5).

### 3.3 Left nav rail (`.app-grid-navbar`)

- **Container:** `flex flex-col p-[0.5rem] pt-0 gap-[0.5rem] w-[4rem]`, bg #f8f8f8. That is 64px wide with 8px side and bottom padding and **no top padding**, so the first button touches the title bar.
- **NavButton** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavButton.vue`): **48×48** `rounded-full`, `text-2xl` (icons render 24×24 because global `svg{width:1em;height:1em}`), color #2c2e31, transparent. Hover: bg #ffffff + text #1a202c. `transition-all` 150ms.
- **Active pill** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavRail.vue`): an absolutely positioned `rounded-full` slider behind the active item.
  - Light: bg `--color-button-bg-selected` = **#db2777**, icon `--color-button-text-selected` = **#fff** with `filter: drop-shadow(0 0 .5rem black)` (measured: rim #db2778, near the glyph #c41f66).
  - Dark: pink-tinted pill with a pink icon.
  - Sub-page active (Library while on `/instance/*`): **white** pill (`bg-surface-4`) with a #1a202c icon.
- **Slider motion** (real "squash and stretch"):
  - moving **down**: the **bottom** edge moves first and the **top** edge follows **120ms** later;
  - moving **up**: the reverse;
  - each edge animates `150ms cubic-bezier(0.4,0,0.2,1)`; left/width 150ms; opacity `250ms cubic-bezier(.5,0,.2,1)` after a 50ms delay.

| # | zh-CN tooltip (id) | Icon component → SVG | Route | Notes |
|---|---|---|---|---|
| 1 | 主页 (`app.navigation.home`) | `HomeIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\home.svg` | `/` | |
| 2 | 截图中心 (`app.navigation.screenshots`) | `ImagesIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\images.svg` | `/screenshots` | **v1.9.x only**, not in the showcase |
| 3 | 世界 (`app.navigation.worlds`) | `WorldIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\world.svg` | `/worlds` | hidden unless feature flag `worlds_tab` (default off) |
| 4 | 发现内容 (`app.navigation.discover-content`) | `CompassIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\compass.svg` | `/browse/<last type>` | disabled offline |
| 5 | 皮肤选择器 (`app.navigation.skin-selector`) | `ChangeSkinIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\change-skin.svg` | `/skins` | |
| 6 | 多人游戏 (`app.navigation.multiplayer`) | `UsersIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\users.svg` | `/multiplayer` | |
| 7 | 实例库 (`app.navigation.library`) | `LibraryIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\library.svg` | `/library` | white pill while inside an instance |
| 8 | 实验室 (`app.navigation.lab`) | `FlaskConicalIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\flask-conical.svg` | `/lab` | |
| 9 | 下载 (`app.navigation.downloads`) | `DownloadIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\download.svg` | `/downloads` | badge: 16px pink pill, white 10px bold count |
| — | divider | `h-px w-6 mx-auto my-2 bg-surface-5` | | 24×1 #dddddd |
| — | quick instances | `InstanceIcon` 28px in a 48px NavButton, tooltip = instance name | `/instance/<id>` | all instances, most recent first; on that instance's page its button gets the **pink** circle; not-installed ones are dimmed (brightness .25, scale .85) with a 16px spinner; followed by a divider |
| ⬇ | 创建新实例 (`app.navigation.create-instance`) | `PlusIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\plus.svg` | `/create` | bottom group |
| ⬇ | 设置 (`label.settings`) | `SettingsIcon` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\settings.svg` | `/settings` | last item, 8px from the bottom |

All icons are lucide-style outlines, `stroke-width 2`, round caps. In the showcase the order is 主页, 发现内容, 皮肤选择器, 多人游戏, 实例库, 实验室, 下载 (7 items, measured pitch 56px = 48 + 8).

**Tooltip** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\styles\overlays.css`):
- bg #f8f8f8, text #1a202c, 1px #dddddd border, radius 8;
- padding 10×12, `0.9rem` (14.4px) weight 500, line-height 1;
- `filter: drop-shadow(2px 2px .4rem rgba(0,0,0,.5))`;
- 14×7 arrow, 5px offset, 200ms show delay. Nav tooltips open to the **right**.

### 3.4 Content well behaviors

- **LoadingBar**: 2px tall, pill-ended, gradient #db2777 → #e76ca3, at the top of the well (`left: 64`, `width: 100% − 64 − 300`). It appears while a route's async data loads.
- **Page transitions** (feature `page_transitions`, on by default): opacity cross-fade, enter **180ms ease** and leave **120ms ease** (global.scss L741–765).
- **Scroll**: `.app-viewport` uses `scrollbar-gutter: stable`. The webkit scrollbar is 16px wide with a #96a2b0 thumb inset 5px, which looks like a ≈6–7px rounded thumb. The screenshot gutter measures ≈10px.

### 3.5 Right panel (`.app-sidebar`, 300px)

- Background `--brand-gradient-bg`: ≈#ead9e1 at the top to ≈#e9d0db at the bottom, painted over #ebebeb. `border-left: 1px` ≈#e8ccd8; `mt-px`.
- **Toggle tab** (v1.9.7, `.sidebar-toggle-handle`):
  - **15×40**, hanging off the panel's left edge at 50% height;
  - border 1px #e8ccd8 with no right border, radius `12px 0 0 12px`;
  - bg `mix(brand 12%, #ebebeb)` ≈ **#e9d3dd** (hover ≈#e8c4d4, border brand 45%);
  - `box-shadow: -4px 0 10px rgba(0,0,0,.08)`;
  - 10px `RightArrowIcon`, rotated 180° when collapsed; hover scales the icon to 1.12, press to 0.9;
  - tooltip 「收起边栏」/「展开边栏」.
  - Default **expanded** (localStorage `axolotl-right-sidebar-expanded` ≠ `'false'`).
  - Forced open on `/browse` and `/project`; hidden on `/settings`.
- **Account block**: `p-4`, 1px #e8ccd8 bottom border.
  - h3 「当前游玩账号：」: 16px, weight 500, #2c2e31.
  - Accordion card: `mt-2 rounded-xl border #dddddd`, bg rgba(255,255,255,.5). Its header (`px-3 py-2`) holds a 36px pixelated skin face, the name (16px), 「Minecraft 账户」 (12px #484d54) and a ▾ chevron.
- **Home only (Information Home)** — three teleported sections, each `p-4 gap-3` with a 1px #e8ccd8 bottom border. Titles are h2, 18px bold #1a202c, with a 16px #484d54 icon.

  | Section | Icon | Content |
  |---|---|---|
  | 「游玩洞察」 | `ChartIcon` | 14px #2c2e31 lines with 16px `ClockIcon` / `TrendingUpIcon` / `GameIcon` |
  | 「每日小挑战」 | `SparklesIcon` | 24px quiet circular shuffle button `UpdatedIcon` (tooltip 「换一个」); 14px body; 8px difficulty dot + 「简单/中等/困难」 at 12px |
  | 「Minecraft 新闻」 | `NewspaperIcon` | rows of a 64×36 radius-8 thumbnail + 14px semibold two-line title + 12px date; hover bg #fff |

  The block slides in (`translateY(30px)→0` and opacity, 0.2s ease) **200ms** after Home mounts.

---

## 4. Home page

### 4.1 Page frame and layout switching (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Index.vue`)

- Route `/` (name `Home`), breadcrumb 「主页」.
- `themeStore.homeLayout`:
  - `'standard'` (default) → **HomeDashboard** (「信息主页」);
  - `'minimal'` → **HomeMinimal** (「极简主页」).
- **Floating controls** (`.home-floating-controls`, `position: fixed`):
  - Position: bottom **16px**; right **16px + 300px** while the panel is open. The control hugs the well's bottom-right corner.
  - Box: 40px tall, padding 4, gap 2, border 1px #dddddd, radius 9999, bg #f8f8f8, shadow `--shadow-button` + `0 4px 12px rgba(0,0,0,.2)`.
  - **Information Home** content: `[✎ 32×32 circle, tooltip 「自定义小组件」] [1×20 #dddddd divider] [layout switch]`.
  - **While editing**: `[+ 「添加小组件」] [↺ 「恢复默认小组件」] [✓ pink filled circle 「完成编辑」] [grid ⇄ free switch] | [layout switch]`.
  - **Minimal Home**: the layout switch alone.
  - **Layout switch** (`.home-layout-switch`, role switch):
    - track **64×32** (two 32px cells), bg #ffffff, radius full;
    - **pink thumb 28×28** inset 2px, slides `translateX(32px)` in **180ms ease**;
    - left glyph `LayoutTemplateIcon` (信息主页), right glyph `MinimizeIcon` (a lucide minus; 极简主页), both 16px — the selected one white, the other #484d54;
    - tooltips 「切换到极简主页」 / 「切换到信息主页」;
    - hover `brightness(.9)`, press `scale(.97)`.

    *Showcase version:* a 72×40 standalone pill with a 32px thumb; in the screenshot it sits bottom-right of the well.

### 4.2 Information Home — v1.9.7 widget dashboard (`HomeDashboard.vue` + `home-dashboard.ts`)

**Grid math** (code):
- Section `p-6 pb-20`; the grid container is centered, `max-w-[96rem]`.
- `columns = min(4, max(1, floor((W + 16) / 256)))` (`getHomeGridColumnCount` in `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\home-dashboard.ts:555`); rows **160px** (`grid-auto-rows: 10rem`), gap **16px**.
- Widgets are first-fit packed in list order. A free-position layout exists in edit mode.
- **Widget card**: radius **16**, bg #f8f8f8 × `--home-widget-bg-opacity` (100% default), 1px transparent border, `box-shadow: rgba(50,50,100,.1) 0 2px 4px`, content padding 16. The greeting widget is transparent with no shadow. Instance/world/server shortcut widgets have 0 padding and darken to brightness .9 on hover.
- **Widget heading**: a 32px row with h2 **16px bold** #1a202c. Calendar and servers prepend a **20px brand-pink** icon.

**Default widget set** (`createDefaultHomeDashboard`), with placement computed at 1440×792, panel open, W ≈ 1012 → **4 columns of 241px**, origin x = 88, y = 72:

| Order | Widget | Size | Title (zh-CN) | Box x, y, w×h (window px, computed) |
|---|---|---|---|---|
| 1 | greeting | 2×1 | date + greeting line | 88, 72, 498×160 |
| 2 | calendar | 1×2 | 日历 | 602, 72, 241×336 |
| 3 | recent | 2×2 | 从最近的项目开始 | 88, 248, 498×336 |
| 4 | pinned-worlds | 1×2 | 固定的世界 | 859, 72, 241×336 |
| 5 | pinned-servers | 2×2 | 固定的服务器 | 602, 424, 498×336 |
| 6 | pinned-instances | 2×1 | 固定的实例 | 88, 600, 498×160 |

A window ≲1435px wide drops to 3 columns. The order is kept and the packing reflows: recent ends up below the greeting, pinned-worlds below the calendar, servers and instances at the bottom.

Widget anatomy (current):

- **Greeting (2×1)** (`HomeGreeting.vue`, dashboard mode):
  - vertically centered column with an 8px gap;
  - date label 12px bold #484d54, for example 「10月6日星期二」 (Intl, zh-CN);
  - **heading 22px** (setting range 16–32), weight 800, line-height 1.35, #1a202c, max-width 704px. The font can be switched to launcher font / Minecraft pixel font / monospace / serif.
  - Default mode `'greeting'` shows **only the time-of-day line** (no name). Editable: on hover the heading lifts 2px and a 16px ✎ fades in.
- **Recent (2×2 default)**:
  - list of up to 4 rows (2/4/6/8 possible) of `WorldItem` (worlds/servers) or `InstanceItem`, `flat`.
  - 2×1 / 2×2 (*compact*): row padding 6, 40px avatar, 14px bold name, 11.2px meta, **circular** play button with no label, ⋮ 36px.
  - 3×1 / 3×2 (*comfortable*): 48px avatar, play button with the 「开始游戏」 label.
  - Empty: `HistoryIcon` + 「还没有最近活动。」.
- **Calendar (1×2)**:
  - header: `CalendarIcon` 20 pink + 「日历」 + ‹ 「2026年10月」 › (24px quiet buttons; tooltips 「上个月」「回到本月」「下个月」);
  - weekday row 「一 二 三 四 五 六 日」 (12px semibold #484d54);
  - 7-column grid with a 3px gap; cells **22.4px tall, radius 8**, 11px semibold;
  - **heat**: L0 #ffffff · L1 (≤30 min) **#fdc9d7** · L2 (≤90 min) **#f7a2bb** · L3 (≤3 h) **#ee769e** · L4 (>3 h) **#db2777** with white digits;
  - today: 1px pink border; selected: 2px pink ring; future days: 50% opacity;
  - below a 1px divider: 「7月29日你游玩了：」 (14px bold), then rows of a 36px icon, name 14px semibold and 「2 小时 14 分钟」 at 12px, with a **24px quiet circular pink ▷** (60%→100% opacity on row hover, tooltip **「启动」**);
  - hover tooltip on a day: e.g. 「2026年7月29日星期三 / 2 小时 14 分钟 / 成功启动 3 次 / 当天常玩：…」.
- **Pinned worlds (1×2)**: 「固定的世界」 + `WorldItem` rows.
  - Singleplayer rows show `UserIcon` + 「单人游戏」 and a game-mode column (e.g. ⛏ 「生存模式」).
  - Empty: 「将世界标记为收藏后，就会固定在这里。」.
- **Pinned servers (2×2)**: `ServerIcon` 20 pink + 「固定的服务器」.
  - Rows: 36px favicon with a 10px status dot (green / red, 2px ring), name 14px semibold, `SignalIcon` 12 + 「4/2026 人在线」 at 12px.
  - Row actions: 24px quiet pink ▷ (tooltip 「加入服务器」) and a 24px ⋮.
  - Local servers show a 「本地」 chip and `localhost:port`.
- **Pinned instances (2×1)**: 「固定的实例」 + a quiet link to `/library` (arrow only in 2×1; 「查看全部实例 →」 in 2×2). Cards come from `Instance.vue`:
  - 1×1 *spotlight* — compact card with a **pink** 36px circular ▷;
  - 2×1 / 1×2 *row* — compact with a **white** 36px circular ▷;
  - 2×2 *tile* — 48px icon with a **48px pink circle ▷ that appears on hover**: `opacity 0→1`, `scale .75→1`, `transform-origin: bottom`, Tailwind `transition-all` 150ms.
- **Single shortcut widgets** (「单个实例入口」「单个世界入口」「单个服务器入口」, 1×1 or 2×1):
  - left/top visual panel #ffffff with a 72px kind-icon watermark at 8% opacity and a 44px (72px in 2×1) icon;
  - body: kind label 11px bold, title 15px (18px in 2×1) weight 750, meta 12px;
  - a **24px pink circular ▷** pinned 12px from the bottom-right (tooltip 「开始游戏」).

### 4.3 Showcase layout — the official screenshot (pre-widget code `f12c3a85`)

Use this when the shot must "look like the website". Source: showcase-era `Index.vue`, `HomeRecentWorlds.vue`, `WorldItem.vue`, `ButtonStyled.vue`, `HomePinnedInstances.vue`, all fetched read-only. Cross-checked by measurement.

- **Layout**: `.home-layout p-6 pb-20` is a grid `minmax(0,1fr) 20rem` (from 1024px up) with a **24px** gap. Left column x ≈ 88 → 756–762 (≈668–674 wide). **Right column 320px** at x 787–1108 (measured).
- **Left column**, `flex-col gap-24`:
  - **Greeting header** `py-2`: h1 **24px/32px extrabold #1a202c** 「Mystic_Stars，下一块方块该你放下。」, format `{name}，{greeting}` (`app.home.greeting.with-player`); y 80–112 (measured centre 95.3).
  - **「从最近的项目开始」**: h2 **18px bold** (y 144–172), then a 12px gap, then **4 row cards**:
    - each **72px tall**, gap 8: y **184**, 264, 344, 424 (measured row 1 top 184.0);
    - card `p-3 rounded-xl(12) bg #f8f8f8 shadow-card`;
    - grid `[48px avatar] [name 18px bold + meta 14px] [centre column] [actions]`;
    - meta reads like 「上次游玩于54秒钟前 • [16px instance icon] Fabulously Optimized」;
    - the centre column shows the server MOTD in the Minecraft font (colored) or the game mode;
    - actions: **white 「▷ 开始游戏」 112×36** + a transparent 36px ⋮ circle. The button sits at y 202–238.
  - **「固定的实例」** h2 18px + ghost link 「查看全部实例 →」 at the right (small transparent button: 24px tall, 14px semibold).
    - Cards in an `auto-fill minmax(16rem,1fr)` grid with a 12px gap; each card `rounded-xl bg-surface-2 p-4`, 80px tall: 48px icon, bold name, `GameIcon` + 「Fabric 26.2」 semibold #484d54, ⋮ top-right.
    - Hovering a card dims the icon (brightness .75) and pops a **48px pink ▷ circle** over it.
  - **「固定的世界」** + world rows.
- **Right column**: the Calendar card (top y 72) and the 「固定的服务器」 card. The right panel holds 当前游玩账号 / 游玩洞察 / 每日小挑战 / Minecraft 新闻.

### 4.4 Minimal Home — the protagonist's stage (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeMinimal.vue`)

```
                    傍晚好，Mystic_Stars               ← h1 24/32 extrabold #1a202c (centered)
                          ▬▬                          ← 32×2 pink bar, 12px below
                                                      ← 40px
 ╭───────────────────────────────────────────────────────────────────╮  card 768 max · #f8f8f8
 │ [icon] Vanilla Perfected                       ╭──────────────╮ ◯ │  1px #fff border · r16 · p16
 │        🎮 Fabric 26.2   ⏱ 游玩于 2分钟前        │ ▷  开始游戏   │ ☰ │  ← 144×48 pink | 48×48 quiet
 ╰───────────────────────────────────────────────────╰──────────────╯──╯
```

- **Stage** `.minimal-home-stage`: flex-centered (both axes), padding 32 / 24 / 56 / 24 (top / sides / bottom), `min-height: calc(100vh − 48px − 64px)`.
- **Column**: `max-w-3xl` (768), centered, `text-center`.
- **Greeting (minimal variant)**:
  - 「{greeting}，{name}」, e.g. 「傍晚好，Mystic_Stars」; without a named Microsoft or Yggdrasil account it is just 「傍晚好」;
  - 24px/32px, weight 800, #1a202c;
  - editable: hover lift 2px and a ✎ appears;
  - then a 12px gap and a **32×2 #db2777 rounded bar**.
- **Card** (`.card`, `mt-10` = 40px): padding 16, bg **#f8f8f8**, **1px #ffffff border**, radius **16**, no shadow. Inner grid `[minmax(0,1fr) auto]`, gap **20**, items centered.
  - **Left** (a link to the instance): `InstanceIcon` (class `size-20` = 80×80, radius ≈13.3, 1px #ddd border, `shadow-card`, hover `scale(1.03)` — but see §10 #3, it likely renders at 32px), gap 20, then a column with a 6px gap:
    - name **20px/28px bold** #1a202c (hover underline);
    - meta row 14px #484d54 with a 16px column gap: 「🎮 Fabric 26.2」 (`GameIcon` 16, loader capitalized + version) and 「⏱ 游玩于 2分钟前」 (`TimerIcon` 16; 「从未游玩」 if never played).
  - **Right**: `flex min-h-11 justify-end gap-2`, holding the **PROTAGONIST** (144×48) and, **8px** to its right, the **「更换主页实例」 button**: quiet circular icon-only 48×48, `ListIcon` 24, #2c2e31, transparent; hover bg #fff + brightness .9. It opens the modal 「选择主页实例」.
- **Computed positions** (1440×792 window, panel open, 16px gutter, 80px icon):
  - greeting top y = 276, bar y = 320;
  - **card x 210–978, y 362–476**;
  - **protagonist x 761–905, y 395–443**;
  - list button x 913–961.

  With the panel closed: card x 360–1128, protagonist x **911–1055**. With a 32px icon the card is 88px tall, but the protagonist's y is still 395–443.
- **Empty states** (same card):
  - a 64×64 radius-8 white tile with a 28px `ListIcon`;
  - h2 18px 「选择实例」 or 「还没有实例」;
  - a pink xl button 「☰ 选择实例」 or 「＋ 创建实例」 (auto width).
- **Picker modal**: 「选择主页实例」, 560px wide. Search placeholder 「搜索实例」; the current instance shows a pink ✓ (20px). Empty states: 「没有可用实例」 / 「没有匹配的实例」.
- **Right panel in Minimal Home**: still shown (if expanded) but with **only** the account block; the insight, challenge and news sections are not teleported.

### 4.5 Greeting copy (`HomeGreeting.vue`, `home-utils.ts`)

- **Time buckets** (local hour): late-night 0–4, dawn 5–7, morning 8–11, afternoon 12–16, evening 17–20, night 21–23.
- **Line choice**: one of 16 lines per bucket, stable for the whole day (hash of locale + date + bucket + name). The clock re-evaluates every 60s.
- **Formats**:

  | Surface | Format | Example |
  |---|---|---|
  | Information Home v1.9.7 (mode `greeting`) | the line only | 「下一块方块该你放下。」 |
  | Mode `text-and-greeting` | `custom text or 欢迎回来，{name}。` + a space + the line | |
  | Showcase era | 「{name}，{greeting}」 | 「Mystic_Stars，下一块方块该你放下。」 |
  | Minimal Home | 「{short greeting}，{name}」 | 「傍晚好，Mystic_Stars」 |

- **Story-perfect lines:** **「下一个项目只差一次启动。」** (morning #11) and **「下一块方块该你放下。」** (evening #15, the showcase line). Full verbatim lists are in §8.2.

---

## 5. Every launch / play button on Home (inventory)

| # | Where | Component (file:line) | Visual | States → label / icon | Size | Click path |
|---|---|---|---|---|---|---|
| A | **Minimal Home hero** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeMinimal.vue:255-305` | `Button colored brand xl w-36` | idle: 「开始游戏」 + `PlayIcon` (shifted 1px right) · busy: **base white, disabled** 「实例正在加载……」 (ellipsizes to ≈「实例正在…」) + spinning `SpinnerIcon` · installing: 「安装中……」 · running: **red** 「停止」 + `StopCircleIcon` · not installed: pink 「安装」 + `DownloadIcon` (disabled offline, tooltip 「离线模式只能启动已完整下载的实例。」) | **144×48**, radius 16 | `playInstance()` → `run()` (see §6) / `stopInstance()` → `kill()` |
| B | Instance page header (the "enter instance" scene) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Index.vue:130-219` | `Button colored brand xl` (auto width) | idle 「开始游戏」 (≈126×48) · launching: **pink, disabled (50%)** 「正在启动…… 3 秒」 + spinner, counting +1 per second · running: red 「停止」 → 「正在停止……」 · installing: disabled pink 「安装中……」 · broken: 「修复」 + `DownloadIcon`. Neighbours: 48px base circle ⚙ (「实例设置」) and ⋮ | 48 tall | `startInstance()` → `run()` |
| C | Recent and pinned-world rows (v1.9.7) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\WorldItem.vue:455-501`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\InstanceItem.vue:233-254` | `Button` (base, md) **wrapping a native `<button>`** | 「▷ 开始游戏」 (comfortable) or circular ▷ only (compact) · starting: spinner · running: red 「停止」 · disabled tooltips 「实例已启动」 / 「实例已经在运行」 / quick-play limits | 36 tall (see §10 #2) | `emit('play')` → `start_join_singleplayer_world` / `start_join_server` (world rows) or `run()` |
| C′ | Same rows, **showcase look** | `ButtonStyled` (default) at `f12c3a85` | white #ffffff, `shadow-button`, 1px transparent border | 「▷ 开始游戏」, 20px icon, 6px gap, 16px/600 #2c2e31 | **112×36**, radius 12, padding 8×10 (measured 112.3×35.8) | same |
| D | Pinned instances (spotlight / row) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue:227-265` | md circular icon-only | spotlight: **pink** ▷ · row: white ▷ · running: red ■ · loading: disabled spinner | 36×36 | `play()` → `run()` |
| E | Pinned instances (tile, 2×2) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue:445-457` | xl colored brand circular icon-only, `card-shadow` | hover-reveal ▷ (shifted 2px right); running: red ■ always shown | **48×48** | `play()` |
| F | Calendar day rows | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeCalendar.vue:352-373` | quiet 2xs circular, `!text-brand opacity-60` → 100 on hover | ▷ tooltip **「启动」** / ■ red tooltip 「停止」 | 24×24 (16px glyph) | `run()` |
| G | Pinned servers rows | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomePinnedServers.vue` (template) | quiet 2xs circular pink at 60%→100% | ▷ 「加入服务器」 (spinner while joining) / ■ 「停止」; local server: ▷ 「启动」 / ■ 「停止」 | 24×24 | `start_join_server()` / local server start |
| H | Shortcut widgets | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeShortcutWidget.vue:373-398` | colored brand 2xs circular icon-only | ▷ 「开始游戏」 / spinner / red ■ 「停止」 | 24×24 | `run()` or `start_join_*` |
| I | Row ⋮ menu | `WorldItem.vue` | menu item | 「▷ 游玩实例」 | menu row | `run()` |

Button-type cheat sheet (`ButtonFrame.vue`; all types: `transition` on bg/color/shadow/filter/opacity/transform **150ms `cubic-bezier(0,0,.2,1)`**, `active: scale(.97)`, hover `brightness(.9)`, focus-visible 4px `rgba(219,39,119,.68)` ring, disabled opacity .5):

| Size | Height | Padding-x | Gap | Radius | Font | Icon | Icon-only width |
|---|---|---|---|---|---|---|---|
| `2xs` | 24 | 6 | 4 | 8 | 14px / 600 / lh 20 | 16 | 24 |
| `xs` | 28 | 6 | 4 | 8 | 14px / 600 / lh 20 | 16 | 28 |
| `sm` | 32 | 6 | 4 | 10 | 14px / 600 / lh 20 | 16 | 32 |
| `md` | 36 | 10 | 6 | 12 | 16px / 600 / lh 20 | 20 | 36 |
| `lg` | 40 | 16 | 8 | 14 | 16px / 600 / lh 20 | 20 | 40 |
| `xl` | **48** | **14** | **8** | **16** | **16px / 800 / lh 20** | **24** | 48 |

Every size adds a 1px transparent border; `circular` makes the radius full.

| Type | Fill | Text | Shadow |
|---|---|---|---|
| `colored` | `--button-color` | `--color-accent-contrast` | ring `0 0 0 1px color-mix(button 30%)` + `0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)`, plus a 1px **top gloss** (`::before`, white 30%→0 gradient ring) |
| `base` | #ffffff | #1a202c (icon #2c2e31) | `inset 0 0 0 1px #dddddd, 0 1px 1px rgba(0,0,0,.12)` |
| `quiet` | transparent | #2c2e31 (or the color given) | none; hover bg #fff |

---

## 6. Launch flow — code path and what changes on screen

**Minimal Home 「开始游戏」** (`HomeMinimal.vue:122-157`, 196-201):

1. `@click="playInstance"` sets `loading = true`. The button instantly becomes the **busy** variant: white, 50% opacity, spinner 1s linear infinite, 「实例正在加载……」. Width stays 144, so nothing reflows.
2. `run(instance.id)` in `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\instance.ts:1222` calls `resolveGcLaunchIntent`, then `invoke('plugin:instance|instance_run', { instanceId, serverAddress: null, offlineMode, extraLaunchArgs, gcIntent })`. The Rust side is `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\src\api\instance.rs:2029` (`instance_run`), which calls the `theseus` lib (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\app-lib`) to launch Java/Minecraft.
3. The backend emits a process event `{instance_id, event: 'launched'}` (`ProcessPayloadType::Launched` in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\app-lib\src\event\mod.rs:365`).
   - `HomeMinimal` sets `currentEvent='launched'` (busy stays until the process is found).
   - `AppActionBar` refreshes and the **title-bar pill switches** from 「● 没有运行中的实例」 to 「🟢 Vanilla Perfected ⏹ ⌨」.
   - The dashboard runtime updates `runningInstanceIds`.
4. `run()` resolves. `trackEvent('InstanceStart', {source:'HomeMinimal'})` fires, then `loading=false` and `refreshProcessState()` (`invoke('plugin:process|process_get_by_instance_id')`) sets `running=true`. The button becomes **red 「停止」** with `StopCircleIcon`.
5. The game exits: event `'finished'` sets `running=false`. The button returns to pink 「开始游戏」 and the pill returns to idle.
6. Errors go to `useMinecraftLaunchError` (account/auth modals) or `handleSevereError` (crash/error modal).
7. 「停止」 calls `kill(id)`: `invoke('plugin:instance|instance_kill')` (`instance.rs:2053`).

Notes:
- The instance page (B) adds the live counter 「正在启动…… N 秒」 (`setInterval` +1 per second, `pages\instance\Index.vue:730-770`).
- World rows (C) call `start_join_singleplayer_world(instanceId, path)` / `start_join_server(instanceId, address)` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\worlds.ts`). That is a quick play straight **into a world**, the literal "进入世界".
- Optional launcher reactions, both **off** by default: 「最小化启动器」 (minimize on game start) and 「启动游戏后进入轻量模式」 (close the webview to the tray).
- No full-screen overlay or route change happens on launch.

---

## 7. PROTAGONIST SPEC (single source of truth)

**Chosen button:** Minimal Home's primary 「开始游戏」 (`HomeMinimal.vue:273-282`). It is the only control on Home that is brand-filled, large, labelled and alone on its stage. Its exact twin (same paint, auto width) is the instance-page header button.

| Property | Value |
|---|---|
| Box | **144 × 48** (`w-36 h-12`), `inline-flex`, centered content, border 1px transparent (fill shows under it) |
| Corner radius | **16px** (`rounded-2xl`); circular variants = 9999 |
| Fill | **#db2777** (light/pink) · hover **#c5236b** (brightness .9) · *dark:* #f472b6 |
| Label | **「开始游戏」** (`button.play`), 16px, **weight 800**, line-height 20, color **#ffffff** (*dark: #000000*), `white-space: nowrap`, ellipsis if too long. Latin uses Inter ExtraBold; CJK renders as PingFang SC Semibold (macOS) or Microsoft YaHei Bold (Windows) |
| Icon | `PlayIcon` = `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\play.svg` (`<polygon points="5 3 19 12 5 21 5 3"/>`, viewBox 24, `fill:none`, `stroke: currentColor`, **stroke-width 2**, round caps and joins), **24×24**, `translateX(1px)` |
| Internal layout | padding-x 14, gap **8**. Content 24 + 8 + 64 = 96px, centered in the 114px content box. **Icon box x 25–49, y 12–36 → triangle vertices (30,15) (44,24) (30,33).** **Text box x 56–120**, line box y 14–34 (button-local coords, origin top-left) |
| Elevation | `0 0 0 1px rgba(219,39,119,.30), 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)` |
| Gloss | `::before` inset 0, padding 1, `background: linear-gradient(180deg, rgba(255,255,255,.30), rgba(255,255,255,0))`, masked to a 1px ring (`mask-composite: exclude`), so a bright **top edge** fades out by the bottom |
| Motion (real) | transition 150ms `cubic-bezier(0,0,.2,1)` on bg/color/shadow/filter/opacity/transform · hover brightness(.9) · **press scale(.97)** · focus-visible 4px ring rgba(219,39,119,.68) |
| States, same box | idle pink 「开始游戏」 ▷ → **busy** white #fff at 50% opacity, `SpinnerIcon` (25%-opacity ring + 75% arc, #2c2e31, `spin 1s linear infinite`) + 「实例正在加载……」 → **running** red **#cb2245** 「停止」 with `stop-circle.svg` (circle r10 + 6×6 square, stroke 2, white) → back to idle on exit. Instance page: **「正在启动…… 3 秒」** pink at 50% (disabled) |
| Neighbours (the hole it leaves) | **+8px right**: 48×48 transparent circle with `ListIcon` 24 #2c2e31 (「更换主页实例」). **Left**: instance block (icon, 「Vanilla Perfected」 20px bold, meta 14px). **Container**: 768-wide card #f8f8f8, 1px #fff border, r16, p16. **Above**: 「傍晚好，Mystic_Stars」 + 32×2 pink bar. Hole = a 144×48 r16 slot, vertically centered in the card's content box, whose right edge sits 56px (48 + 8) left of the card's inner right edge (computed window coords: x 761–905, y 395–443) |
| Real size family (morph targets that exist in the product) | 144×48 labelled (Minimal) · 126×48 auto (instance page) · **48×48 pink circle** (tile hover play) · **36×36 pink circle** (spotlight card) · **24×24 pink circle** (shortcut widget) · 24px quiet pink glyph (calendar rows, tooltip 「启动」; server rows, tooltip 「加入服务器」) · white 112×36 「▷ 开始游戏」 (showcase rows) |
| Brand "visual core" to keep through transformations | the **#db2777** fill, the **outline play triangle with round joins**, the **16px-radius lozenge**, the white top gloss and soft pink ring |

Reference render made from these exact CSS values: `E:\GitHub\Axolotl-animation\research\_scratch\03-shell-home\protagonist-mock.png` (HTML source next to it: `protagonist-mock.html`). It uses system fonts in place of Inter.

Paste-ready CSS (light / pink):

```css
.launch-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  width:144px;height:48px;padding:0 14px;border:1px solid transparent;border-radius:16px;
  background:#db2777;color:#fff;font:800 16px/20px Inter,"PingFang SC","Microsoft YaHei",sans-serif;white-space:nowrap;
  box-shadow:0 0 0 1px rgba(219,39,119,.3),0 2px 4px rgba(0,0,0,.04),0 5px 8px rgba(0,0,0,.04),0 10px 18px rgba(0,0,0,.03),0 24px 48px rgba(0,0,0,.03);
  transition:background-color .15s cubic-bezier(0,0,.2,1),filter .15s cubic-bezier(0,0,.2,1),transform .15s cubic-bezier(0,0,.2,1)}
.launch-btn::before{content:"";position:absolute;inset:0;padding:1px;border-radius:inherit;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.launch-btn:hover{filter:brightness(.9)} .launch-btn:active{transform:scale(.97)}
.launch-btn svg{width:24px;height:24px;flex-shrink:0;transform:translateX(1px)}
/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>开始游戏</span> */
```

---

## 8. zh-CN strings (verbatim, resolved from the locale JSON by script)

`app` = `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json`, `ui` = `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json`. ICU placeholders are kept as-is. Relative times come from `Intl.RelativeTimeFormat('zh-CN')`: 「54秒钟前」「2分钟前」「10小时前」. Date labels come from `Intl.DateTimeFormat('zh-CN')`: 「2026年10月」, 「7月29日」, 「10月6日星期二」, 「2026年7月29日星期三」.

### 8.1 UI strings

#### Launch / play buttons (the protagonist family)

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `button.play` | ui | 开始游戏 | Play |
| `button.stop` | ui | 停止 | Stop |
| `button.install` | ui | 安装 | Install |
| `button.repair` | ui | 修复 | Repair |
| `label.installing` | ui | 安装中…… | Installing... |
| `app.instance.loading` | app | 实例正在加载…… | Instance is loading... |
| `app.instance.starting` | app | 正在启动…… {seconds, number} 秒 | Starting... {seconds, number}s |
| `app.instance.stopping` | app | 正在停止…… | Stopping... |
| `app.instance.launch-instance` | app | 启动实例 | Launch instance |
| `app.instance.join-server` | app | 加入服务器 | Join server |
| `app.instance.offline-installed-only` | app | 离线模式只能启动已完整下载的实例。 | Offline mode can only launch fully downloaded instances. |
| `app.instance.settings` | app | 实例设置 | Instance settings |
| `app.home.calendar.play` | app | 启动 | Play |
| `app.home.calendar.stop` | app | 停止 | Stop |
| `app.home.servers.join` | app | 加入服务器 | Join server |
| `app.home.servers.stop` | app | 停止 | Stop |
| `app.servers.action.start` | app | 启动 | Start |
| `app.servers.action.stop` | app | 停止 | Stop |
| `app.instance-item.already-open` | app | 实例已经在运行 | Instance is already open |
| `instance.worlds.game_already_open` | app | 实例已启动 | Instance is already open |
| `instance.worlds.play_instance` | app | 游玩实例 | Play instance |
| `instance.worlds.no_server_quick_play` | app | 只能在 Minecraft Alpha 1.0.5 及以后的版本中快速进入服务器 | You can only jump straight into servers on Minecraft Alpha 1.0.5+ |
| `instance.worlds.no_singleplayer_quick_play` | app | 只能在 Minecraft 1.20 及以后的版本中快速进入单人游戏世界 | You can only jump straight into singleplayer worlds on Minecraft 1.20+ |
| `instance.worlds.no_contact` | app | 无法连接服务器 | Server couldn't be contacted |
| `instance.worlds.incompatible_server` | app | 服务器不兼容 | Server is incompatible |

#### Shell: navigation tooltips, sidebar, account card

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.navigation.home` | app | 主页 | Home |
| `app.navigation.screenshots` | app | 截图中心 | Screenshots |
| `app.navigation.worlds` | app | 世界 | Worlds |
| `app.navigation.discover-content` | app | 发现内容 | Discover content |
| `app.navigation.skin-selector` | app | 皮肤选择器 | Skin selector |
| `app.navigation.multiplayer` | app | 多人游戏 | Multiplayer |
| `app.navigation.library` | app | 实例库 | Library |
| `app.navigation.lab` | app | 实验室 | Lab |
| `app.navigation.downloads` | app | 下载 | Downloads |
| `app.navigation.create-instance` | app | 创建新实例 | Create new instance |
| `label.settings` | ui | 设置 | Settings |
| `app.sidebar.collapse` | app | 收起边栏 | Collapse sidebar |
| `app.sidebar.expand` | app | 展开边栏 | Expand sidebar |
| `app.minecraft.playing-as` | app | 当前游玩账号： | Playing as |
| `minecraft-account.label` | app | Minecraft 账户 | Minecraft account |
| `minecraft-account.select-account` | app | 选择账户 | Select account |
| `minecraft-account.not-signed-in` | app | 未登录 | Not signed in |
| `minecraft-account.sign-in` | app | 登录 Minecraft | Sign in to Minecraft |
| `app.build.beta` | app | Beta | Beta |

#### Shell: titlebar action bar (running pill)

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.action-bar.no-instances-running` | app | 没有运行中的实例 | No instances running |
| `app.action-bar.view-instance` | app | 查看实例 | View instance |
| `app.action-bar.stop-instance` | app | 停止实例 | Stop instance |
| `app.action-bar.view-logs` | app | 查看日志 | View logs |
| `app.action-bar.show-more-running-instances` | app | 显示更多运行中的实例 | Show more running instances |
| `app.action-bar.hide-more-running-instances` | app | 隐藏更多运行中的实例 | Hide more running instances |
| `app.action-bar.primary-instance` | app | 主实例 | Primary instance |
| `app.action-bar.make-primary-instance` | app | 设为主实例 | Make primary instance |
| `app.action-bar.announcements` | app | 公告 | Announcements |
| `app.action-bar.notifications` | app | 通知 | Notifications |
| `app.action-bar.offline` | app | 离线 | Offline |
| `app.action-bar.view-active-downloads` | app | 查看正在下载内容 | View active downloads |

#### Home: page, layout switch, widget editing

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.home.breadcrumb` | app | 主页 | Home |
| `app.home.layout.toggle` | app | 极简主页 | Minimal Home |
| `app.home.layout.switch-to-minimal` | app | 切换到极简主页 | Switch to Minimal Home |
| `app.home.layout.switch-to-information` | app | 切换到信息主页 | Switch to Information Home |
| `app.home.widgets.customize` | app | 自定义小组件 | Customize widgets |
| `app.home.widgets.done` | app | 完成编辑 | Finish editing |
| `app.home.widgets.add` | app | 添加小组件 | Add widget |
| `app.home.widgets.reset` | app | 恢复默认小组件 | Restore default widgets |
| `app.home.widgets.reset-confirm` | app | 要恢复默认小组件布局吗？ | Restore the default widget layout? |
| `app.home.widgets.layout.toggle` | app | 小组件布局模式 | Widget layout mode |
| `app.home.widgets.layout.switch-to-grid` | app | 切换到网格小组件布局 | Switch to grid widget layout |
| `app.home.widgets.layout.switch-to-free` | app | 切换到自由小组件布局 | Switch to free widget layout |
| `app.home.widgets.drag` | app | 拖动小组件 | Drag to move widget |
| `app.home.widgets.options` | app | 小组件选项 | Widget options |
| `app.home.widgets.size` | app | 尺寸 {size} | Size {size} |
| `app.home.widgets.remove` | app | 删除小组件 | Remove widget |
| `app.home.widgets.replace` | app | 替换目标 | Replace target |
| `app.home.widgets.move-earlier` | app | 向前移动 | Move earlier |
| `app.home.widgets.move-later` | app | 向后移动 | Move later |
| `app.home.widgets.empty` | app | 添加小组件来布置你的主页。 | Add a widget to build your Home. |
| `app.home.widgets.unavailable` | app | 内容已不可用 | Content unavailable |

#### Home: widget picker names & descriptions

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.home.widgets.group.overview` | app | 概览 | Overview |
| `app.home.widgets.group.collections` | app | 收藏内容集合 | Pinned collections |
| `app.home.widgets.group.shortcuts` | app | 单项快捷入口 | Single-item shortcuts |
| `app.home.widgets.greeting` | app | 问候 | Greeting |
| `app.home.widgets.greeting-description` | app | 随一天中的时间变化的个性化欢迎语。 | A personal welcome that changes throughout the day. |
| `app.home.widgets.recent` | app | 最近游玩 | Recently played |
| `app.home.widgets.recent-description` | app | 继续游玩最近打开过的世界或实例。 | Resume the worlds and instances you played most recently. |
| `app.home.widgets.calendar` | app | 日历 | Calendar |
| `app.home.widgets.calendar-description` | app | 快速查看本月日期与游玩记录。 | See the month and your play activity at a glance. |
| `app.home.widgets.pinned-instances` | app | 全部固定实例 | All pinned instances |
| `app.home.widgets.pinned-instances-description` | app | 自动汇总所有固定到主页的实例。 | Automatically collects every instance pinned to Home. |
| `app.home.widgets.pinned-worlds` | app | 全部收藏世界 | All favorite worlds |
| `app.home.widgets.pinned-worlds-description` | app | 自动汇总所有收藏的单人世界。 | Automatically collects favorite singleplayer worlds. |
| `app.home.widgets.pinned-servers` | app | 全部收藏服务器 | All favorite servers |
| `app.home.widgets.pinned-servers-description` | app | 自动汇总所有收藏的多人服务器。 | Automatically collects favorite multiplayer servers. |
| `app.home.widgets.instance` | app | 单个实例入口 | Single instance |
| `app.home.widgets.instance-description` | app | 选择一个实例，创建独立的快速启动入口。 | Choose one instance for a dedicated launch shortcut. |
| `app.home.widgets.world` | app | 单个世界入口 | Single world |
| `app.home.widgets.world-description` | app | 选择一个世界，创建独立的快速游玩入口。 | Choose one world for a dedicated play shortcut. |
| `app.home.widgets.server` | app | 单个服务器入口 | Single server |
| `app.home.widgets.server-description` | app | 选择一个服务器，创建独立的快速加入入口。 | Choose one server for a dedicated join shortcut. |

#### Home: section / widget titles & row content

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.home.recent.title` | app | 从最近的项目开始 | Start from your recent projects |
| `app.home.recent.empty` | app | 还没有最近活动。 | No recent activity yet. |
| `app.home.instances.pinned` | app | 固定的实例 | Pinned instances |
| `app.home.instances.view-all` | app | 查看全部实例 | View all instances |
| `app.home.instances.pinned-empty` | app | 在实例卡片菜单或实例库中选择「固定到主页」，实例就会显示在这里。 | Pin an instance from its card menu or the library to keep it here. |
| `app.home.instances.pin` | app | 固定到主页 | Pin to Home |
| `app.home.instances.unpin` | app | 取消固定 | Unpin from Home |
| `app.home.worlds.pinned` | app | 固定的世界 | Pinned worlds |
| `app.home.worlds.empty` | app | 将世界标记为收藏后，就会固定在这里。 | Favorite a world and it will be pinned here. |
| `app.home.servers.pinned` | app | 固定的服务器 | Pinned servers |
| `app.home.servers.empty` | app | 将服务器标记为收藏后，就会固定在这里。 | Favorite a server and it will be pinned here. |
| `app.home.servers.players-online` | app | {online}/{max} 人在线 | {online}/{max} online |
| `app.home.servers.offline` | app | 离线 | Offline |
| `app.home.servers.local` | app | 本地 | Local |
| `app.home.calendar.title` | app | 日历 | Calendar |
| `app.home.calendar.played-on` | app | {date}你游玩了： | On {date} you played: |
| `app.home.calendar.no-activity` | app | 这一天没有游玩记录。 | No playtime recorded on this day. |
| `app.home.calendar.previous` | app | 上个月 | Previous month |
| `app.home.calendar.next` | app | 下个月 | Next month |
| `app.home.calendar.this-month` | app | 回到本月 | This month |
| `app.home.playtime.hours-minutes` | app | {hours} 小时 {minutes} 分钟 | {hours}h {minutes}m |
| `app.home.playtime.minutes` | app | {minutes} 分钟 | {minutes}m |
| `app.home.playtime.seconds` | app | {seconds} 秒 | {seconds}s |
| `app.home.playtime.sessions` | app | 成功启动 {count} 次 | {count, plural, one {# successful launch} other {# successful launches}} |
| `app.home.playtime.most-played` | app | 当天常玩：{name} | Most played: {name} |
| `app.home.shortcut.kind.instance` | app | 实例 | Instance |
| `app.home.shortcut.kind.world` | app | 世界 | World |
| `app.home.shortcut.kind.server` | app | 服务器 | Server |
| `app.home.shortcut.server.offline` | app | 服务器离线 | Server offline |
| `app.home.shortcut.server.players-online` | app | {count} 人在线 | {count} online |
| `label.played` | ui | 上次游玩于{ago} | Played {ago} |
| `app.instance.played` | app | 游玩于 {time} | Played {time} |
| `app.instance.never-played` | app | 从未游玩 | Never played |
| `app.instance-item.not-played-yet` | app | 还没有游玩过 | Not played yet |
| `app.world.world-item.players-online` | app | {count} 人在线 | {count} online |
| `app.world.world-item.offline` | app | 离线 | Offline |
| `label.singleplayer` | ui | 单人游戏 | Singleplayer |
| `instance.worlds.game_mode.survival` | ui | 生存模式 | Survival mode |
| `instance.worlds.game_mode.creative` | ui | 创造模式 | Creative mode |
| `instance.worlds.game_mode.adventure` | ui | 冒险模式 | Adventure mode |
| `instance.worlds.hardcore` | app | 极限模式 | Hardcore mode |

#### Home: right-panel widgets

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.home.insights.title` | app | 游玩洞察 | Play insights |
| `app.home.insights.empty` | app | 开始游玩后，这里会显示你的统计。 | Play something and your stats will show up here. |
| `app.home.insights.this-week` | app | 本周游玩 {duration} | This week: {duration} |
| `app.home.insights.this-week-less` | app | 本周游玩 {duration}（比上周少 {percent}%） | This week: {duration} ({percent}% less than last week) |
| `app.home.insights.this-week-more` | app | 本周游玩 {duration}（比上周多 {percent}%） | This week: {duration} ({percent}% more than last week) |
| `app.home.insights.this-week-same` | app | 本周游玩 {duration}（与上周持平） | This week: {duration} (same as last week) |
| `app.home.insights.streak` | app | 已连续游玩 {days} 天 | {days, plural, one {# day played in a row} other {# days played in a row}} |
| `app.home.insights.week-top` | app | 本周常玩：{name} | Most played: {name} |
| `app.home.challenge.title` | app | 每日小挑战 | Daily challenge |
| `app.home.challenge.shuffle` | app | 换一个 | Try another |
| `app.home.challenge.easy` | app | 简单 | Easy |
| `app.home.challenge.medium` | app | 中等 | Medium |
| `app.home.challenge.hard` | app | 困难 | Hard |
| `app.home.news.title` | app | Minecraft 新闻 | Minecraft news |
| `app.home.news.open-article` | app | 在 minecraft.net 上阅读 | Read on minecraft.net |

#### Home: greeting framing & Minimal Home

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.home.greeting.with-player` | app | {name}，{greeting} | Welcome back, {name}. {greeting} |
| `app.home.greeting.welcome-with-player` | app | 欢迎回来，{name}。 | Welcome back, {name}. |
| `app.home.greeting.welcome` | app | 欢迎回来。 | Welcome back. |
| `app.home.greeting.minimal.with-player` | app | {greeting}，{name} | {greeting}, {name} |
| `app.home.greeting.edit` | app | 编辑问候语 | Edit greeting |
| `app.home.minimal.choose-instance` | app | 选择实例 | Choose instance |
| `app.home.minimal.change-instance` | app | 更换主页实例 | Change Home instance |
| `app.home.instances.create` | app | 创建实例 | Create instance |
| `app.home.instances.empty` | app | 还没有实例 | No instances yet |
| `app.home.minimal.picker.title` | app | 选择主页实例 | Choose a Home instance |
| `app.home.minimal.picker.search` | app | 搜索实例 | Search instances |
| `app.home.minimal.picker.no-instances` | app | 没有可用实例 | No instances available |
| `app.home.minimal.picker.no-results` | app | 没有匹配的实例 | No matching instances |
| `app.home.minimal.picker.select` | app | 选择 {name} | Choose {name} |

#### Onboarding copy about Home, taglines, splash

| id | pkg | zh-CN (verbatim) | en-US default |
|---|---|---|---|
| `app.onboarding.welcome.title` | app | 一切就绪 | Everything is ready |
| `app.onboarding.welcome.description` | app | 实例、内容、世界和下载，现在都有了同一个家。正式开玩之前，先快速逛一圈。 | Your instances, content, worlds, and downloads now have one home. Let us take a quick lap before you settle in. |
| `app.onboarding.welcome.footer` | app | 你的最后一款启动器 | Your last next launcher. |
| `app.onboarding.home-widgets.title` | app | 你的主页，你的布局 | Your Home, your layout |
| `app.onboarding.home-widgets.description` | app | 信息主页由最近活动、游玩时间、实例、世界和服务器小组件组成。窗口或账号侧边栏变化时，网格会自动重排。 | Information Home is built from widgets for recent activity, playtime, instances, worlds, and servers. The grid reflows as the window or account sidebar changes. |
| `app.onboarding.home-customize.title` | app | 按你的方式排列 | Arrange it your way |
| `app.onboarding.home-layout.title` | app | 切换信息密度 | Change the amount of detail |
| `app.onboarding.home-layout.description` | app | 使用右下角控件切换信息主页和极简主页；小组件编辑仅在信息主页中提供。 | Use the bottom-right control to switch between Information Home and Minimal Home. Widget editing stays with Information Home. |
| `app.onboarding.library.title` | app | 你的启动书架 | Your launch shelf |
| `app.splash.checking-for-updates` | app | 正在检查更新…… | Checking for updates... |

### 8.2 Greeting lines (all 6 × 16, zh-CN verbatim; minimal short form in column 3)

| id | Hours | Minimal | Lines |
|---|---|---|---|
| `app.home.greeting.late-night` | 00:00–04:59 | 夜深了 | 1. 月亮还在加班。 2. 安静的世界正等着你。 3. 夜班总能写出好故事。 4. 黎明前再放一块方块？ 5. 星光会照看好你的服务器。 6. 深夜时段，也能留下传奇存档。 7. 现在的火把光格外好看。 8. 下一场冒险还没睡。 9. 午夜后的矿洞更安静。 10. 和平的出生点在等你。 11. 耐心的建造者属于夜晚。 12. 把音乐调低，把灵感调高。 13. 每一座好基地都从一块方块开始。 14. 末地可以等等，除非它等不了。 15. 短短一局也算数。 16. 这个世界已经为你保存好了。 |
| `app.home.greeting.dawn` | 05:00–07:59 | 清晨好 | 1. 天刚亮，区块正新。 2. 新的一天正在加载。 3. 日出增益已生效。 4. 清晨的世界总像全新的。 5. 先喝咖啡，再挖钻石。 6. 你的基地想你一整晚了。 7. 从容开局，也能成就好冒险。 8. 主世界正在苏醒。 9. 新鲜空气，新鲜资源包。 10. 今天很适合去探索。 11. 村庄已经开门交易了。 12. 安静的早晨适合大工程。 13. 新的一天，新的坐标。 14. 苦力怕也不太像早起的人。 15. 先从小事开始，看看会去向何处。 16. 下一局已经准备好，等你出发。 |
| `app.home.greeting.morning` | 08:00–11:59 | 早上好 | 1. 早上好，冒险家。 2. 今天还有许多未探索的区块。 3. 正适合重新开始。 4. 你的工具已为今天就绪。 5. 主世界有不少好计划。 6. 造点未来的你会喜欢的东西。 7. 新的一局像一张干净画布。 8. 太阳升起了，村民也是。 9. 让今天多一点方块感。 10. 矿井安静得有点可疑。 11. 下一个项目只差一次启动。 12. 好早晨，配好世界。 13. 总能再装下一个新点子。 14. 工作台正在待命。 15. 地图在等新的标记。 16. 坐稳，做点进度。 |
| `app.home.greeting.afternoon` | 12:00–16:59 | 下午好 | 1. 午后休息，时机正好。 2. 短短一局也可能很精彩。 3. 世界已准备好接住你的下一步。 4. 该去看看那座半成品建筑了。 5. 一点探索就能走很远。 6. 下一个生物群系正在呼唤。 7. 你的背包耐心等候很久了。 8. 村庄市场还没关门。 9. 这一小时适合专心做个项目。 10. 红石今天大概会听话。 11. 你的镐子准备开工。 12. 出生点外还有新路线。 13. 午后天生适合支线任务。 14. 要不要快速回世界看看？ 15. 下一章从这里开始。 16. 花一点时间，做点东西。 |
| `app.home.greeting.evening` | 17:00–20:59 | 傍晚好 | 1. 傍晚正是建造的黄金时间。 2. 白天将尽，世界刚刚展开。 3. 熟悉的世界是个好去处。 4. 该回到你最爱的项目了。 5. 从新塔上看日落更美。 6. 基地的灯正等着你。 7. 轻松玩一局正合适。 8. 村民很快要收摊了。 9. 你的下一座建筑值得一层暮色。 10. 适合没有计划地四处走走。 11. 营火已经点好了。 12. 基地要不要再加一间房？ 13. 地平线看起来格外诱人。 14. 安静的夜晚从好世界开始。 15. 下一块方块该你放下。 16. 让今晚的进度算数。 |
| `app.home.greeting.night` | 21:00–23:59 | 晚上好 | 1. 夜班准备好了。 2. 熟悉的世界适合这个夜晚。 3. 你最爱的实例就在附近。 4. 星星出来了，计划也定好了。 5. 平静的一局能好好结束今天。 6. 天黑后世界更安静。 7. 该再放几块方块了。 8. 远处的基地正在发光。 9. 下一场冒险从日落开始。 10. 一个好存档配得上一个好夜晚。 11. 不知何处，营火正噼啪作响。 12. 月光让每座建筑都更有戏剧感。 13. 明天之前来一点 Minecraft。 14. 你的世界随时欢迎你回去。 15. 按区块算，夜还很长。 16. 开始一段值得的游戏时光吧。 |

---

## 9. Assets (absolute paths) and brand cautions

| Asset | Path | Notes |
|---|---|---|
| **Axolotl logo (raster)** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.png` (1024² RGBA, identical md5 to `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl.png`) | voxel pink axolotl; title-bar logo (24px), splash logo (`min(18rem,45vh)`), account placeholder, settings |
| **Axolotl logo (vector)** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.svg` (viewBox 566.9², palette #E59CC3 #F0579A #D982AD #FED5EB #FEBAD8 #DF3177 #D772A4 #FCC1E0 #FE4592 #A12D72 …) | best source for a crisp 2.5D logo |
| App icon | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\icon.png` (512²), `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\128x128.png`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\axolotl-macos.svg` (white rounded square rx 185/824 + axolotl) | |
| Mascot poses (onboarding) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-searching.svg` (magnifier), `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-teaching.svg` (mortarboard + book) | used by `OnboardingMascotStage.vue`; good cameo or "search" material |
| Splash background | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\loading\cube.png` (2880×2788 maze cube) | splash = dark; cube at 0.8 opacity, 180vw/vh; overlay `linear-gradient(180deg, rgba(255,77,157,.24), rgba(48,16,40,.56))` over `rgba(22,18,28,.68)`; logo + progress bar; fades out 0.3s ease-in-out |
| Mini-game sprites | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-run\` (axolotl.webp, corals, trident …) and `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-balls\*.png` | About-page easter-egg games 「美西螈快跑」 / 「合成美西螈」 |
| Instance fallback icons | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\instance-icons\` | vanilla → `grass-block.png`, fabric → `Fabric.png`, forge → `anvil.png`, neoforge → `NeoForge.png`, quilt → `Quilt.png`, unknown → `stone.png` (frameless when built-in) |
| Icons used here | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\` | `play.svg`, `stop-circle.svg`, `spinner.svg`, `download.svg`, `list.svg`, `plus.svg`, `home.svg`, `images.svg`, `world.svg`, `compass.svg`, `change-skin.svg`, `users.svg`, `library.svg`, `flask-conical.svg`, `settings.svg`, `left-arrow.svg`, `right-arrow.svg`, `layout-template.svg`, `minimize.svg`, `pencil.svg`, `check.svg`, `grid.svg`, `move.svg`, `rotate-counter-clockwise.svg`, `more-vertical.svg`, `calendar.svg`, `chevron-left.svg`, `chevron-right.svg`, `server.svg`, `online-indicator.svg`, `terminal-square.svg`, `chart.svg`, `clock.svg`, `trending-up.svg`, `sparkles.svg`, `updated.svg`, `newspaper.svg`, `history.svg`, `game.svg`, `timer.svg`, `box.svg`, `user.svg`, `signal.svg`, `pin.svg`, `x.svg`, `maximize.svg`, `restore.svg`. Component → file map is in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\generated-icons.ts` (`import _PlayIcon from './icons/play.svg?component'` etc.) |
| Fonts | Inter (remote `https://cdn-raw.modrinth.com/fonts/inter/Inter-*.woff2`); Minecraft font (remote `.../fonts/minecraft/*.otf`; local copy `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\font\minecraft_font.ttf`, unreferenced) | |

**Do NOT use:**
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\logo.svg`. It is the **Modrinth logo** (exported as `ModrinthIcon`).
- Any "Modrinth" wordmarks.
- `instance-icons\modrinth-3d\*` is item art named after Modrinth. It is not a brand mark, but avoid it if in doubt (inferred).

The visible product name is **Axolotl** (title bar) / **Axolotl Launcher** (美西螈启动器). Website taglines: 「下载 Axolotl」, 「免费、开源、无广告」. The onboarding footer reads **「你的最后一款启动器」** — a strong end-card line.

---

## 10. Discrepancies and uncertainties (read before animating)

1. **Showcase ≠ current build.** `launcher-home.png` is the pre-widget Home (commit `f12c3a85`). Differences from v1.9.7:
   - no 「截图中心」 nav item;
   - an "→" sidebar button in the title bar (v1.9.7 has 📰 plus an edge tab);
   - the greeting includes the name;
   - white 112×36 「开始游戏」 row buttons;
   - section headers at 18px (v1.9.7 widgets: 16px);
   - no widget cards on the left column.

   Pick one era per shot. The protagonist spec (§7) is identical in both eras: legacy `ButtonStyled size="large" color="brand"` = 48px tall, padding 14, gap 8, radius 16, 24px icon, weight 800.
2. **v1.9.7 row play buttons (inferred visual regression).** WorldItem and InstanceItem render `<Button>` (a ButtonFrame `<button data-button>`) with a **native `<button>` inside it**. The frame's `[&>svg]:size-5` and `gap` do not reach the nested icon, so the icon falls back to 1em (16px) with no gap ("▷开始游戏", ≈102×36). Nothing in the repo styles `[data-button] > button`. I could not run the Tauri app to confirm. The showcase look (112×36, 20px icon, 6px gap) is safer for the film.
3. **Minimal Home instance icon size (inferred).** `class="size-20"` (80px, specificity 0,1,0) loses to `Avatar`'s scoped `.avatar[data-v-…] { width/height: var(--_size) }` (0,2,0). `--_size` defaults to 2rem, so it likely renders at **32×32**. The author intended 80px; choose deliberately.
4. **Idle-pill dot**: `bg-secondary` has no Tailwind definition in v1.9.7 (the `secondary` alias was dropped from `tailwind-preset.ts`), so the dot is probably invisible now. The screenshot shows #4b4d54.
5. **Breadcrumb icon**: v1.9.7 maps `Home` → `HomeIcon` (20px) before 「主页」; the screenshot has no icon (older code).
6. **Fonts**: Inter is fetched from a CDN at runtime; CJK weights depend on the OS (PingFang SC tops out at 600, YaHei at 700). Labels set at weight 800 look Semibold or Bold.
7. **Window size and columns**: layout maps assume 1440×792 (the screenshot's measured size). The dashboard's column count flips between 3 and 4 at ≈1436px wide (with the panel open).
8. **Theme default** is dark on a fresh install; the film's light look matches the screenshots and the user's own settings.
9. Remaining computed boxes (§4.2, §4.4) were not measured in a running app; the scrollbar gutter (10 vs 16px) can shift x by up to ±3px.
10. `Card` margin-bottom: `.card` (omorphia, emitted after the Tailwind utilities) likely overrides `mb-0`, adding 12px below the Minimal card. This is invisible on screen.

## 11. Working files produced (scratch)

All under `E:\GitHub\Axolotl-animation\research\_scratch\03-shell-home\`:
- `protagonist-mock.html` / `protagonist-mock.png` — code-accurate render of the Minimal card, protagonist states, the instance-page states, showcase vs v1.9.7 row buttons, the nav active pill and the running pill;
- screenshot crops: `titlebar_left_x3.png`, `titlebar_right_x3.png`, `play_btn_row1_x3.png`, `play_btn_row2_x3.png`, `nav_active_x4.png`, `nav_rail_full.png`, `home_crop_recentrows.png`, `home_crop_topleft.png`, `website-launcher-home.png`;
- brand previews: `brand_axolotl_png_on_gray.png`, `app_icon_png.png`, `cube_png_preview.png`, `mascots.png` (searching / teaching / logo SVGs).
