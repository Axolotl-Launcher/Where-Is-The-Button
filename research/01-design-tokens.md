# 01 — Design tokens, theming, typography & base component styling

Source of truth for the animator: **Axolotl Launcher** (美西螈启动器) desktop app, repo snapshot `v1.9.7-133-g2b5c22d` (commit `2b5c22deef9c1ead1b2443708cfe686935ccedeb`, 2026-10-05), cloned read-only at `E:\GitHub\Axolotl-animation\upstream\Axolotl`.

Everything below was read from code unless marked **(inferred)**. All hex values are **sRGB**. Pixel values assume the CSS root font size of 16px (`1rem = 16px`).

A rendered specimen built only from these tokens (light and dark, pink accent) is at:

- `E:\GitHub\Axolotl-animation\research\_scratch\01-design-tokens-specimen.html` (source, copy-paste friendly CSS)
- `E:\GitHub\Axolotl-animation\research\_scratch\specimen.png` (headless-Chrome render at 1×)
- `E:\GitHub\Axolotl-animation\research\_scratch\colors.py` + `colors_out.txt` (the script that resolves every `color-mix()` below, for all five accents and all three themes)

---

## 0. Cheat sheet (read this first)

| What | Value (LIGHT theme, default pink accent) |
|---|---|
| Brand / accent `--color-brand` | **`#db2777`** (Tailwind pink-600). Dark theme: `#f472b6` |
| Text on brand fills `--color-accent-contrast` | `#ffffff` (light). **Dark theme: `#000000`** (black label on pink) |
| Page / content pane `--surface-1` (`--color-bg`) | `#ebebeb` |
| App chrome (top bar, left rail) `--surface-3` | `#f8f8f8` (chrome is *lighter* than the content pane) |
| Cards, modals, menus, tooltips `--surface-3` | `#f8f8f8` |
| Raised controls (buttons, inputs, dropdown) `--surface-4` | `#ffffff` (also used as the 1px *stroke* of cards) |
| Strong stroke / divider `--surface-5` | `#dddddd` |
| Text primary / default / tertiary | `#1a202c` / `#2c2e31` / `#484d54` |
| Brand tint `--color-brand-highlight` | `rgba(219,39,119,.25)` → on `#f8f8f8` = `#f1c4d8`, on `#fff` = `#f6c9dd` |
| Focus ring | `0 0 0 4px rgba(219,39,119,.68)` |
| Radii | 4 / 8 / 12 / 16 / 20 px (`--radius-xs…xl`); buttons 8/10/12/14/16 px by size |
| Font | **Inter 3.19** (400/500/600/700/800) + system CJK fallback (PingFang SC in the macOS screenshots) |
| Button motion | 150 ms `cubic-bezier(0,0,.2,1)`; hover `filter: brightness(.9)` (light) / `1.25` (dark); press `scale(.97)` |
| Hero "launch" button (real) | `Button type="colored" color="brand" size="xl"`: 48px tall, radius 16px, pad 0 14px, gap 8px, Inter 16px **800**, white label `开始游戏`, 24px outline play triangle, layered shadow + 1px top-lit rim |
| Real label for the launch CTA | **`开始游戏`** (`button.play`). `启动` exists only as the tooltip of the small calendar play icon (`app.home.calendar.play`) and on server cards (`app.servers.action.start`); `启动实例` is an overflow-menu item |

---

## 1. Where the tokens live and how they are wired

| File | Role |
|---|---|
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\variables.scss` | **All colour tokens** (`.light-properties`, `.dark-mode`, `.oled-mode`, accent classes), gaps, radii, shadows |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\defaults.scss` | Body font stack, font-size and font-weight tokens, `.button-animation`, scrollbars, `svg {1em}` |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\classes.scss` | Legacy component classes: `.button-base`, `.btn*`, `.card`/`.base-card`, `.clickable`, tables, markdown |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\inter.scss` | `@font-face` for Inter 400/500/600/700/800 (remote CDN) |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\opacity.scss` | "Signed-ratio opacity model" mixin used by transparent window / custom background modes |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\reset.scss`, `normalize.scss`, `accessibility.scss` | Button reset, normalize (html line-height 1.15), focus outline `0.25rem solid var(--color-focus-ring)` |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\omorphia.scss` | Import order: variables → normalize → classes → defaults → highlightjs → accessibility → inter |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\tooling-config\tailwind\tailwind-preset.ts` | Tailwind (v3.4) preset mapping utilities to the CSS vars (`bg-surface-3`, `bg-brand`, `bg-brand-highlight`, `ring-brand-shadow`, …). **`preflight: false`** |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\tailwind.config.ts` | Extends preset; `font-sans = var(--font-standard, <Inter stack>)`, `font-mono = var(--mono-font, …)` |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\tailwind.config.ts` | Same preset, no overrides |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\stylesheets\global.scss` | App-level globals: Minecraft web font, opaque surface snapshots, transparent-window & custom-background palettes, global `input` style, `.badge`, scrollbar, page transitions |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\store\theme.ts` | Pinia theme store: theme/accent classes on `<html>`, custom-accent derivation, font overrides, opacity settings |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\font-family.ts` | Default UI/mono font stacks |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\index.html` | Boot markup: `<html lang="en" class="dark-mode accent-pink">` |
| `E:\GitHub\Axolotl-animation\upstream\Axolotl\standards\frontend\SURFACE_SYSTEM.md` | Official meaning of `surface-1…5` |

**Class switches on `<html>`** (set by `setThemeClass()` / `setAccentColor()` in `theme.ts`):

- Theme: exactly one of `light-mode`, `dark-mode`, `oled-mode` (`system` resolves to light/dark via `prefers-color-scheme`).
- Accent: exactly one of `accent-pink | accent-orange | accent-green | accent-blue | accent-purple | accent-custom` (system accent → `accent-custom`, or `accent-pink` if the OS gives no colour). Custom accents also set inline `--custom-accent-light` / `--custom-accent-dark` on `<html>`.
- Optional: `transparent-window`, `has-custom-background` (mutually exclusive in practice).

**Defaults** (Rust DB migrations `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\app-lib\migrations\20240711194701_init.sql` and `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\app-lib\migrations\20260713160000_add_accent_color.sql`, mirrored in `DEFAULT_THEME_STORE`): theme **`dark`**, accent **`pink`**. The reference screenshots (and this film) use **LIGHT + pink**.

**Cascade detail** (why accent wins): `html` `@extend`s `.light-properties`, which declares `--color-brand: var(--color-green)` (a Modrinth leftover default). The `.accent-*` rules come later in the same file with equal specificity to `.light-mode`/`.dark-mode`, so the accent class always overrides it. `--color-brand-highlight` is declared once on `:root`, mixing whichever `--color-brand-highlight-opaque` the accent selected.

**CSS `color-mix(in srgb, X p%, transparent)`** resolves to `X` at alpha `p` (premultiplied interpolation), i.e. plain `rgba()`. All `--opacity-ratio-keep-NN` rungs equal `NN%` at the default 100% baseline, so at default settings every tint is a fixed alpha.

---

## 2. LIGHT theme palette (with pink accent) — `.light-properties` / `html` / `.light-mode`

### 2.1 Surface ladder (variables.scss lines 2-8) and their real roles

| Token | Hex | Role in the shipped UI (verified usages) |
|---|---|---|
| `--surface-1` | `#ebebeb` | Content pane background (`--color-bg`), page floor; Lab page, home dashboard floor |
| `--surface-1-5` | `#ededed` | Table odd rows, markdown tables; `content-alt` |
| `--surface-2` | `#f5f5f5` | Settings shell panels; list-row cards (`InstanceItem` non-flat `bg-surface-2`); checkbox off fill; `Avatar.raised` |
| `--surface-2-5` | `#eef1f5` | Slightly bluish; `content-selected` rows |
| `--surface-3` | `#f8f8f8` | **App chrome** (`bg-surface-bar` top bar + left rail, `.app-grid-layout`), `.card`/`base-card`, home widgets, modal body, menus (`.menu-surface`), tooltips, legacy global `input` |
| `--surface-4` | `#ffffff` | Raised controls: `base` buttons, `StyledInput`, `Combobox` trigger and dropdown, toggle off-track, tags, avatar fill; **1px stroke of cards** (`.base-card { border: 1px solid var(--surface-4) }`) |
| `--surface-5` | `#dddddd` | Strong strokes: button inset ring, modal/menu/tooltip borders, dividers (`--color-divider`), content-pane outline |

Tailwind aliases in the preset that fall back to the ladder when the opacity model is off: `bg-surface-content` → `--surface-3`; `content-alt` → `--surface-1-5`; `content-muted` → `--surface-2`; `content-selected` → `--surface-2-5`; `bar` → `--surface-3`; `card` → `--surface-3`.

> Light-theme separation is carried by **strokes**, not luminance: `surface-2 → surface-3` is only ~1.03:1 (SURFACE_SYSTEM.md). Cards therefore get a 1px white (`surface-4`) hairline on a `#f8f8f8` fill, sitting on the `#ebebeb` floor.

### 2.2 Text & semantic aliases

| Token | Value | Notes |
|---|---|---|
| `--color-text-primary` = `--color-contrast` | `#1a202c` | Headings, button labels, h1–h3 default colour |
| `--color-text-default` = `--color-base` | `#2c2e31` | Body text (`body { color: var(--color-base) }`), icons inside base buttons, nav icons |
| `--color-text-tertiary` = `--color-secondary` | `#484d54` | Descriptions, metadata, placeholders, inactive icons |
| `--color-accent-contrast` | `#ffffff` | Text/icon on brand & coloured fills |
| `--color-bg` | `var(--surface-1)` = `#ebebeb` | |
| `--color-super-raised-bg` | `var(--surface-4)` = `#ffffff` | |
| `--color-divider` / `--color-divider-dark` | `#dddddd` / `#dddddd` | |
| `--color-button-border` | `rgba(161,161,161,.35)` (≈ `#dedede` on white) | Checked checkbox border |
| `--color-scrollbar` | `#96a2b0` | |
| `--color-button-text` / `-text-active` | `#2c2e31` / `#1a202c` | |
| `--color-button-bg-selected` | `var(--color-brand)` = **`#db2777`** | Active nav circle, active settings category, NavTabs slider. *Light uses the solid brand; dark uses the 25% tint.* |
| `--color-button-text-selected` | `#ffffff` | |
| `--color-tooltip-bg` / `-text` | `#f8f8f8` / `#1a202c` | |
| `--color-link` | `var(--color-blue)` = `#1f68c0` | |
| `--color-focus-ring` | `var(--color-brand)` under any `.accent-*` (base default `#ea80ff`) | |
| `--color-yellow` | `var(--color-orange)` | |
| `--hover-brightness` | `0.9` | Hover **darkens** 10% in light |
| `--dark-color-base` / `--dark-color-contrast` (on `html`) | `#b0bac5` / `#ecf9fb` | Legacy, rarely used |
| **Undefined in the app** | `--color-text-secondary` | Do not use (AGENTS.md) |

### 2.3 Brand (pink) and every derived value — LIGHT

`.accent-pink { --color-brand: var(--color-pink) }` → light `--color-pink: var(--color-pink-600)` = **`#db2777`**.

| Token / usage | Definition | Resolved |
|---|---|---|
| `--color-brand` | `--color-pink-600` | `#db2777` (HSL 333.3°, 71.4%, 50.6%) |
| `--color-brand-highlight-opaque` | `--color-pink-highlight-opaque` | `rgb(219 39 119)` |
| `--color-brand-highlight` (`bg-brand-highlight`, `bg-highlight`) | `color-mix(srgb, base 25%, transparent)` | `rgba(219,39,119,.25)` → flattened: on `#ebebeb` **`#e7bace`**, on `#f5f5f5` `#eec2d6`, on `#f8f8f8` **`#f1c4d8`**, on `#ffffff` **`#f6c9dd`** |
| `--color-pink-highlight` (pink family tint, not the brand tint) | 22% | `rgba(219,39,119,.22)` (on `#f8f8f8` `#f2cadc`) |
| `--color-pink-bg` | 10% | `rgba(219,39,119,.10)` |
| `--color-brand-shadow` (`ring-brand-shadow`) | `color-mix(srgb, brand 68%, transparent)` | `rgba(219,39,119,.68)` (on `#ebebeb` ≈ `#e0669c`) |
| `--color-focus-ring` | `var(--color-brand)` | `#db2777` |
| `--brand-gradient-bg` (right sidebar background) | `linear-gradient(0deg, brand 14% → brand 9%)` (0deg = bottom→top) | bottom `rgba(219,39,119,.14)`, top `rgba(219,39,119,.09)`; flattened on `#ebebeb`: bottom **`#e9d0db`**, top **`#ead9e1`** |
| `--brand-gradient-strong-bg` (unused in app) | `linear-gradient(270deg, mix(brand 18%, surface-1) → mix(brand 11%, surface-1))` | `#e8c8d6 → #e9d5de` |
| `--brand-gradient-border` (sidebar left edge & dividers) | brand 16% | `rgba(219,39,119,.16)` (on `#ebebeb` ≈ `#e8ccd8`) |
| `--brand-gradient-button` (sidebar control fill, light only) | fixed | `rgba(255,255,255,.5)` (≈ `#f4eaee` on the gradient) |
| `--loading-bar-gradient` | `linear-gradient(to right, brand, mix(brand 68%, white))` | `#db2777 → #e76ca3` |
| Calendar heat levels (`HomeCalendar.vue`) | `color-mix(in oklab, brand N%, surface-4)` | L1 28% **`#fdc9d7`**, L2 48% **`#f7a2bb`**, L3 70% **`#ee769e`**, L4 = `#db2777` + white text. (Verified against `launcher-home.png`: `#fec9d9 / #f7a2bb / #ed739d / #db2777`) |
| Sidebar toggle handle | `mix(brand 12% / 20%, --color-bg)` | `#e9d3dd` / hover `#e8c4d4` |
| Modal overlay `.standard` | `linear-gradient(to bottom, mix(brand-shadow 10%, rgba(0,0,0,.52)), mix(brand-shadow 2%, rgba(0,0,0,.95)))` | top `rgba(28,5,15,.536)` → bottom `rgba(3,1,2,.945)` + `backdrop-filter: blur(5px)` |
| Coloured button 1px ring | `mix(button-color 30%, transparent)` | `rgba(219,39,119,.30)` |
| Hover (brightness .9) | `filter` on the whole element | pink `#db2777 → #c5236b`; white label → `#e6e6e6` |
| Disabled coloured button | `opacity: .5` | on `#f8f8f8` ≈ `#ea90b8` (matches login dialog's disabled `登录`) |

### 2.4 Semantic colour scales (LIGHT) — `--color-{family}-{shade}`

| Shade | red | orange | green | blue | purple | pink | gray |
|---|---|---|---|---|---|---|---|
| 50 | `#fef2f2` | `#fdf8ed` | `#eefff6` | `#f2f7fd` | `#faf5ff` | `#fdf2f8` | `#f5f5f6` |
| 100 | `#fee5e7` | `#f9eacc` | `#d7ffeb` | `#e4ecfa` | `#f2e7ff` | `#fce7f3` | `#e5e5e8` |
| 200 | `#fccfd3` | `#f2d495` | `#b2ffd9` | `#c3d9f4` | `#e7d3ff` | `#fbcfe8` | `#cecfd3` |
| 300 | `#faa7b1` | `#ecb85d` | `#76ffbc` | `#8ebaeb` | `#d4b1ff` | `#f9a8d4` | `#adb0b3` |
| 400 | `#f67687` | `#e7a038` | `#33f598` | `#5196df` | `#ba7eff` | `#f472b6` | `#83868d` |
| 500 | `#ed4661` | **`#e08325`** | `#09de78` | `#2b79cc` | `#9f4dff` | `#ec4899` | `#686a72` |
| 600 | **`#cb2245`** | `#c66019` | **`#00af5c`** | **`#1f68c0`** | **`#8e32f3`** | **`#db2777`** | **`#595b61`** |
| 700 | `#b7193d` | `#a44419` | `#04914f` | `#184b8c` | `#761ad6` | `#be185d` | `#4c4e52` |
| 800 | `#9a1739` | `#86351a` | `#0a7141` | `#184174` | `#651bae` | `#9d174d` | `#434447` |
| 900 | `#841738` | `#6e2d19` | `#0a5d38` | `#193861` | `#53178c` | `#831843` | `#3b3b3e` |
| 950 | `#490819` | `#3f1509` | `#00341d` | `#112340` | `#370368` | `#500724` | `#252627` |
| **Default** (`--color-red` etc.) | red-600 | orange-500 | green-600 | blue-600 | purple-600 | pink-600 | gray-600 |

Tints (LIGHT; `-highlight` = 25% except pink 22%, `-bg` = 10%), flattened on `#f8f8f8` / `#ffffff`:

| Family | opaque base | `-highlight` rgba | on s3 | on s4 | `-bg` rgba | on s3 |
|---|---|---|---|---|---|---|
| red | `rgb(203 34 69)` | `.25` | `#edc2cb` | `#f2c8d0` | `.10` | `#f4e3e6` |
| orange | `rgb(224 131 37)` | `.25` | `#f2dbc3` | `#f7e0c8` | `.10` | `#f6ece3` |
| green | `rgb(0 175 92)` | `.25` | `#bae6d1` | `#bfebd6` | `.10` | `#dff1e8` |
| blue | `rgb(31 104 192)` | `.25` | `#c2d4ea` | `#c7d9ef` | `.10` | `#e2eaf2` |
| purple | `rgb(142 50 243)` | `.25` | `#dec6f7` | `#e3ccfc` | `.10` | `#ede4f8` |
| pink | `rgb(219 39 119)` | `.22` | `#f2cadc` | `#f7cfe1` | `.10` | `#f5e3eb` |
| gray | `rgb(89 91 97)` | `.25` | `#d0d1d2` | `#d6d6d8` | — | — |

Mod-loader platform colours (LIGHT / DARK), used for loader tags: fabric `#8a7b71`/`#dbb69b`, quilt `#8b61b4`/`#c796f9`, forge `#5b6197`/`#959eef`, neoforge `#dc895c`/`#f99e6b`, liteloader `#4c90de`/`#7ab0ee`, bukkit `#e78362`/`#f6af7b`, bungeecord `#c69e39`/`#d2c080`, folia `#6aa54f`/`#a5e388`, paper `#e67e7e`/`#eeaaaa`, purpur `#7763a3`/`#c3abf7`, spigot `#cd7a21`/`#f1cc84`, velocity `#4b98b0`/`#83d5ef`, waterfall `#5f83cb`/`#78a4fb`, sponge `#c49528`/`#f9e580`, ornithe `#6097ca`/`#87c7ff`, bta-babric `#5ba938`/`#72cc4a`, nilloader `#dd5088`/`#f45e9a`.

### 2.5 Shadows (LIGHT)

`hsl(221 39% 11%)` = `#111827`; `hsl(221 39% 91%)` = `#dfe5f1`.

| Token | Value | Used by |
|---|---|---|
| `--shadow-card` | `rgba(50,50,100,.1) 0 2px 4px 0` | Home widgets, list-row cards (`.card-shadow`), avatars |
| `--shadow-card-filter` | `drop-shadow(rgba(50,50,100,.1) 0 2px 4px)` | Unframed avatars |
| `--shadow-button` (all themes, on `html`) | `0 1px 3px 0 rgba(0,0,0,.05), 0 1px 2px 0 rgba(0,0,0,.15)` | Home edit bar, hue-slider thumb |
| `--shadow-floating` | `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.1)` | Right-click `ContextMenu` |
| `--shadow-raised` | `0.3px 0.5px 0.6px hsl(221 39% 11%/.15), 1px 2px 2.2px -1.7px …/.12, 4.4px 8.8px 9.7px -3.4px …/.09` | (defined, unused) |
| `--shadow-raised-lg` | `0 2px 4px hsla(221,39%,11%,.2)` | (unused) |
| `--shadow-inset-sm` | `inset 0 -1px 2px hsla(221,39%,91%,.15)` | Legacy `.btn`, global `input` |
| `--shadow-inset` / `-lg` | `inset 0 -2px 2px hsla(221,39%,91%,.05 / .1)` | — |
| Base / chip / highlight button (ButtonFrame) | `inset 0 0 0 1px var(--surface-5), 0 1px 1px rgba(0,0,0,.12)` | |
| Coloured button (ButtonFrame) | `0 0 0 1px mix(color 30%), 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)` | |
| Menu surface (`overlays.css`) | `3px 3px .8rem rgba(0,0,0,.3)` | Overflow menus |
| Tooltip | `filter: drop-shadow(2px 2px .4rem rgba(0,0,0,.5))` | `v-tooltip` |
| Modal body | `4px 4px 26px 10px rgba(0,0,0,.08)` | `NewModal` |
| Combobox dropdown | Tailwind `shadow-2xl` = `0 25px 50px -12px rgba(0,0,0,.25)` (opening upward: `0 -25px 50px -12px …`) | |
| Toast | `0 4px 8px 0 rgba(0,0,0,.1), 0 1px 3px 0 rgba(0,0,0,.2)` | Notifications |
| Content pane inner edge (`.app-contents::before`) | `inset 1px 1px 15px rgba(0,0,0,.1)` + `1px solid var(--surface-5)` | Shell |
| Right sidebar cast shadow (`.app-sidebar::before`) | `inset -15px 0 15px -15px rgba(0,0,0,.1)` on a 2rem strip left of the sidebar | Shell |

When "高级渲染" (advanced rendering) is off, `.disable-advanced-rendering *` removes **all** box-shadows.

---

## 3. DARK and OLED palettes (`.dark-mode` / `.oled-mode`)

### 3.1 Surfaces, text, aliases

| Token | DARK | OLED (overrides only) |
|---|---|---|
| `--surface-1` | `#101215` | `#000000` |
| `--surface-1-5` | `#15181c` | `#070809` |
| `--surface-2` | `#1a1e24` | `#0c0e12` |
| `--surface-2-5` | `#20242b` | `#111419` |
| `--surface-3` | `#262b34` | `#171b21` |
| `--surface-4` | `#333a46` | `#242a33` |
| `--surface-5` | `#424854` | `#333a45` |
| `--color-text-primary` | `#ffffff` | (same as dark) |
| `--color-text-default` | `#b0bac5` | |
| `--color-text-tertiary` | `#96a2b0` | |
| `--color-accent-contrast` | **`#000000`** | |
| `--color-button-border` | `rgba(193,190,209,.12)` | |
| `--color-scrollbar` | `var(--surface-5)` | |
| `--color-divider` / `-dark` | `#424854` / `#646c75` | |
| `--color-button-bg-selected` | `var(--color-brand-highlight)` (25% tint) | |
| `--color-button-text-selected` | `var(--color-brand)` | |
| `--hover-brightness` | **`1.25`** (hover brightens) | |
| `--shadow-card` | `rgba(0,0,0,.25) 0 2px 4px 0` | |
| `--shadow-raised` | `0 -2px 4px hsla(221,39%,11%,.1)` | |
| `--brand-gradient-button` | `rgba(255,255,255,.08)` | |

### 3.2 Semantic scales (DARK)

| Shade | red | orange | green | blue | purple | pink | gray |
|---|---|---|---|---|---|---|---|
| 50 | `#fff0f1` | `#fff8ed` | `#effef5` | `#eef6ff` | `#faf5ff` | `#fdf2f8` | `#f5f7f8` |
| 100 | `#ffe2e6` | `#ffefd4` | `#dafee8` | `#daeaff` | `#f4e7ff` | `#fce7f3` | `#edeff2` |
| 200 | `#ffcad3` | `#ffdba8` | `#b8fad2` | `#bddaff` | `#ead4ff` | `#fbcfe8` | `#dfe2e6` |
| 300 | `#ff9fae` | `#ffc171` | `#81f4af` | `#90c4ff` | `#dab2ff` | `#f9a8d4` | `#cad0d7` |
| 400 | `#ff6984` | **`#ffa347`** | `#42e686` | **`#4f9cff`** | **`#c78aff`** | **`#f472b6`** | `#b4bac5` |
| 500 | **`#ff496e`** | `#fe7e11` | **`#1bd96a`** | `#357ffc` | `#ac51fb` | `#ec4899` | **`#9fa4b3`** |
| 600 | `#ed1148` | `#ef6307` | `#0faa4f` | `#1f5ff1` | `#972eef` | `#db2777` | `#8a8da1` |
| 700 | `#c8083d` | `#c64808` | `#0f8642` | `#1749de` | `#821ed2` | `#be185d` | `#777b8b` |
| 800 | `#a8093a` | `#9d3a0f` | `#126937` | `#193cb4` | `#6e1eab` | `#9d174d` | `#616472` |
| 900 | `#8f0c38` | `#7e3110` | `#11562f` | `#1a378e` | `#5a198a` | `#831843` | `#52555d` |
| 950 | `#50011a` | `#441606` | `#033018` | `#152356` | `#3d0566` | `#500724` | `#303136` |
| Default | red-500 | orange-400 | green-500 | blue-400 | purple-400 | pink-400 | gray-500 |

Dark tints: every `-highlight` = 25%, every `-bg` = 20%. Opaque bases: red `rgb(255 73 110)`, orange `rgb(255 163 71)`, green `rgb(27 217 106)`, blue `rgb(79 156 255)`, purple `rgb(199 138 255)`, pink `rgb(244 114 182)`, gray `rgb(159 164 179)`.

### 3.3 Pink brand derivatives (DARK / OLED)

| Value | DARK | OLED |
|---|---|---|
| `--color-brand` | `#f472b6` | `#f472b6` |
| `--color-brand-highlight` | `rgba(244,114,182,.25)` → on s1 `#492a3d`, s3 `#5a3d54`, s4 `#634862` | on s1 `#3d1c2e`, s3 `#4e3146` |
| `--color-brand-shadow` | `rgba(244,114,182,.68)` | same |
| `--brand-gradient-bg` flattened on s1 | bottom `#301f2c`, top `#251b23` | bottom `#221019`, top `#160a10` |
| Calendar L1/L2/L3 (oklab vs s4) | `#674b63` / `#8d5779` / `#b86393` | `#5b3f55` / `#834e6e` / `#b25d8c` |
| Hover (×1.25) | `#f472b6 → #ff8ee4` | |
| Label on coloured button | black `#000000` | black |

---

## 4. Accent presets (强调色) and custom accent logic

Settings UI: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\settings\AppearanceSettings.vue`. Store: `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\store\theme.ts`.

| Option (`ACCENT_COLOR_OPTIONS`) | zh-CN label (id) | LIGHT `--color-brand` | DARK `--color-brand` | LIGHT highlight on `#f8f8f8` | DARK highlight on `#262b34` |
|---|---|---|---|---|---|
| `pink` (**default**) | 粉色 (`app.appearance-settings.accent-color.pink`) | `#db2777` | `#f472b6` | `#f1c4d8` | `#5a3d54` |
| `orange` | 橙色 (`…accent-color.orange`) | `#e08325` | `#ffa347` | `#f2dbc3` | `#5c4939` |
| `green` | 绿色 (`…accent-color.green`) | `#00af5c` | `#1bd96a` | `#bae6d1` | `#235642` |
| `blue` | 蓝色 (`…accent-color.blue`) | `#1f68c0` | `#4f9cff` | `#c2d4ea` | `#304767` |
| `purple` | 紫色 (`…accent-color.purple`) | `#8e32f3` | `#c78aff` | `#dec6f7` | `#4e4367` |
| `system` | 跟随系统 (`…accent-color.system`); disabled state 系统不支持 / 跟随系统：系统不支持 | OS accent hue + S/L of `#db2777`, then derived | derived | | |
| `custom:#rrggbb` | 自定义 (`…accent-color.custom`) | `deriveAccentVariants(hex).light` | `.dark` | | |

Other labels in that section: 强调色 (`accent-color.title`), 选择用于按钮、选中状态和高亮元素的颜色。 (`accent-color.description`), 色相 (`custom-hue`), 十六进制色号 (`custom-hex`), 浅色主题 / 深色主题 (`custom-preview-light` / `-dark`). Colour theme section: 色彩主题 (`app.appearance-settings.color-theme.title`), 为 Axolotl Launcher 选择偏好的色彩主题。; theme cards 深色 / 浅色 / OLED / 跟随系统 (`settings.display.theme.dark|light|oled|system`, packages/ui locale), tooltips 首选浅色主题 / 首选深色主题.

Custom accent maths (verbatim logic, `theme.ts`):

```ts
export const DEFAULT_CUSTOM_ACCENT_COLOR = '#db2777'
// light: keep hue & saturation, clamp lightness to 34–57
// dark : saturation × 1.15 (max 100), lightness = min(lightL + 18, 80)
export function deriveAccentVariants(hex) {
	const { h, s, l } = hexToHsl(hex)
	const lightL = clamp(l, 34, 57)
	return { light: hslToHex(h, s, lightL), dark: hslToHex(h, Math.min(s * 1.15, 100), Math.min(lightL + 18, 80)) }
}
// system accent: hue from the OS accent, S/L from #db2777
export function applySystemAccentHue(systemHex) { const { h } = hexToHsl(systemHex); const { s, l } = hexToHsl('#db2777'); return hslToHex(h, s, l) }
```

- `#db2777` custom → light **`#db2777`**, dark **`#f16da8`** (verified: the 1.6.0 settings screenshot's "深色主题" swatch converts from Display-P3 to exactly `#f16da8`).
- Custom accents use the accent itself as the highlight base: `--color-brand-highlight-opaque: var(--color-brand)`.
- Hue slider (`.hue-slider`): 12px tall track, `border-radius: 999999999px`, gradient `hsl(0,80%,55%) → hsl(60…) → … → hsl(360,80%,55%)`; thumb 20px circle `background: var(--color-brand)`, `border: 3px solid var(--surface-4)`, `box-shadow: var(--shadow-button)`. Changing hue keeps `max(s, 40)` and `l`.
- Accent radio chips (settings): `rounded-lg` (8px) `border 1px`, `px-2 py-2.5`, `font-semibold`; selected `border-brand bg-brand-highlight text-brand` + 14px check at end; unselected `border-surface-4 bg-surface-3 text-tertiary`, hover `border-surface-5 text-primary`; colour dot 16px with `ring-2 ring-white/20`; `active:scale-[0.97]`.

Accent classes also restyle (all accents): `--color-focus-ring: var(--color-brand)`, `--brand-gradient-*` and `--loading-bar-gradient` as in §2.3.

---

## 5. Transparency, background image and blur blending

Settings (store defaults): custom background blur **12px** (slider 0–40px), background visibility **65%** (10–100%, step 5), component opacity **100%** (0–100%), transparent window **off**, interface opacity **55%**, transparent blur off, home widget background opacity **100%**.

| Mode | Mechanism (global.scss / App.vue) |
|---|---|
| Custom background image (`html.has-custom-background`) | `.launcher-background` fixed, `inset:-3rem`, opaque floor `--surface-3-opaque`; image `background-size: cover; center`, `filter: blur(<blur>px)`, transitions `filter/opacity 180ms ease`. `--custom-bg-page-alpha = (1 − visibility)`; `--custom-bg-component-alpha = 1 − visibility × (1 − component)`. Surfaces become `color-mix(surface-N-opaque, ratio, transparent)` per the ladder below. Chrome (`.app-grid-navbar/.app-grid-statusbar`) uses translucent `--surface-3`. Window corners get `border-radius: 8px` when not maximized; content pane loses its 20px top-left radius. |
| Transparent window (`html.transparent-window`) | Single baseline `--window-alpha` (default 55%). Chrome = `mix(surface-3-opaque, ratio-chrome)`. OS blur: macOS `Effect.UnderWindowBackground`, Windows `Effect.Acrylic`, none on Linux. Inner frame line: `inset 0 0 0 1px rgba(0,0,0,.5), inset 0 0 0 2px rgba(255,255,255,.14)`. |

Opacity ratios (from `opacity.scss`; `b` = baseline, `α = b + (1 − b)·r`): page `b`; `surface-1-5` 0.16 (page baseline); `surface-2` 0.30; chrome 0.38; `surface-3` 0.55; `surface-4` 0.60; `surface-5` 0.78; card `b`; content 0.58; content-selected 0.40; content-muted 0.35; content-alt 0.18; bar 0.15; `keep-NN` = `b × NN%`.

Home widgets: `background: color-mix(in srgb, var(--surface-3) var(--home-widget-bg-opacity, 100%), transparent)`.

---

## 6. How the palette lands on the app shell (for staging)

From `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\App.vue` (style block lines 3521-3998). Layout details belong to the shell report; token usage is summarised here.

| Region | Size | Fill / stroke (LIGHT, pink) |
|---|---|---|
| Window base `.app-grid-layout` | full | `--surface-3` `#f8f8f8` |
| Top bar `.app-grid-statusbar` | **48px** (`--top-bar-height: 3rem`), `p-3` | `bg-surface-bar` = `#f8f8f8`; logo 24px tall + wordmark "Axolotl" 14px/800, `tracking-wide`, only ≥1280px; back/forward 24px circles `bg-surface-4`, hover `brightness-75` |
| Left rail `.app-grid-navbar` | **64px** wide (`--left-bar-width: 4rem`), `p-2 pt-0`, gap 8px | `#f8f8f8`; NavButtons 48×48 round, icon 24px (`text-2xl`) `#2c2e31`, hover `bg-surface-4` + text-primary; divider `24×1px #dddddd` |
| Active nav item | 48px circle | Sliding pill `bg-button-bgSelected` = **`#db2777`**, icon white with `filter: drop-shadow(0 0 .5rem black)`; subpage-active = `bg-surface-4` + text-primary |
| Content pane `.app-contents` | fills rest | `--color-bg` `#ebebeb`, **top-left radius 20px** (`--radius-xl`), overlay `::before`: `1px solid #dddddd` + `inset 1px 1px 15px rgba(0,0,0,.1)` → reads as a recessed tray under the chrome |
| Right sidebar `.app-sidebar` | **300px** (`--right-bar-width`), `mt-px` | `background: var(--brand-gradient-bg)` over `#ebebeb` (pink wash, stronger at bottom), `border-left: 1px solid rgba(219,39,119,.16)`; inside, `bg-surface-4` controls become `rgba(255,255,255,.5)`, dividers/borders become `rgba(219,39,119,.16)` |
| Sidebar toggle handle | 15×40px, radius `12px 0 0 12px`, at `left:-15px` | bg `#e9d3dd` (hover `#e8c4d4`), border `rgba(219,39,119,.16)` (hover brand 45%), `box-shadow: -4px 0 10px rgba(0,0,0,.08)`; icon 10px; transitions 180ms ease; icon hover `scale(1.12)`, active `scale(.9)` |
| Loading bar | 2px tall under top bar | `--loading-bar-gradient` + radial brand glow at 10% |

---

## 7. Typography

### 7.1 Families actually loaded

| Use | Family / stack | Files |
|---|---|---|
| UI (`--font-standard`, declared on `body`; Tailwind `font-sans`) | `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Roboto, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif` | **Inter 3.19**, static, `font-family: inter`, `font-display: swap`, weights **400** `https://cdn-raw.modrinth.com/fonts/inter/Inter-Regular.woff2?v=3.19`, **500** `…/Inter-Medium.woff2?v=3.19`, **600** `…/Inter-SemiBold.woff2?v=3.19`, **700** `…/Inter-Bold.woff2?v=3.19`, **800** `…/Inter-ExtraBold.woff2?v=3.19` (+ `.woff` fallbacks). Declared in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\inter.scss`; allowed by the Tauri CSP `font-src https://cdn-raw.modrinth.com/fonts/` (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\tauri.conf.json`). URLs verified reachable (HTTP 200). No local copy in the repo. |
| Monospace (`--mono-font`, `font-mono`) | `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace` | system |
| Minecraft text (MOTDs, nametags; class `.font-minecraft`) | `'bundled-minecraft-font-mrapp', monospace` | `https://cdn-raw.modrinth.com/fonts/minecraft/regular.otf` (400), `italic.otf`, `bold.otf` (600), `bold-italic.otf` — declared in `global.scss` |
| Lab gradient-text preview | `'axolotl-lab-minecraft'` = **Minecraft AE (Pixel)**, 63,446 glyphs incl. 20,992 CJK (has 启/开/始/游/戏) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\lab\Minecraft_AE.ttf` (16 MB) |
| Unused local file | "Minecraft" Regular, 107 glyphs, no CJK | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\font\minecraft_font.ttf` |

**CJK**: there is no CJK font and no `:lang(zh)` rule anywhere; `<html lang="en">` never changes. Chinese glyphs come from OS fallback: **PingFang SC** in the macOS reference shots; Microsoft YaHei on Windows **(inferred)**. PingFang SC tops out at Semibold, so Chinese text set at 700/800 renders as Semibold on macOS **(inferred)**. For a deterministic render, pair Inter 3.19 with a PingFang-like CJK face such as Noto Sans SC / Source Han Sans SC **(recommendation)**.

Users can override both stacks (`--font-standard` / `--mono-font` on `body`) in 字体 settings; default label 启动器默认.

### 7.2 Size & weight tokens (`defaults.scss`, declared on `body`)

| Token | Value | Token | Value |
|---|---|---|---|
| `--font-size-xxs` | 10px | `--font-weight-regular` | 400 |
| `--font-size-xs` | 12px | `--font-weight-medium` | 500 |
| `--font-size-sm` | 14px | `--font-weight-bold` | 700 |
| `--font-size-nm` | 16px | `--font-weight-extrabold` | 800 |
| `--font-size-md` | 18px | `--font-weight-text` | 500 |
| `--font-size-lg` | 20px | `--font-weight-heading` / `-title` | 800 |
| `--font-size-xl` | 24px | | |
| `--font-size-2xl` | 32px | | |
| `--font-size-3xl` | 48px | | |

`body`: 16px, weight 400, colour `--color-base`. `html` line-height 1.15 (normalize). In practice components use Tailwind sizes: `text-xs` 12/16, `text-sm` 14/20, `text-base` 16/24, `text-lg` 18/28, `text-xl` 20/28, `text-2xl` 24/32. Usage counts across app + ui `.vue`: `text-sm` 586, `font-semibold` 562, `text-xs` 208, `font-medium` 136, `text-base` 134, `text-lg` 124, `font-bold` 84, `font-extrabold` 30, `text-2xl` 28, `text-xl` 25. **Semibold 600 is the house weight.**

### 7.3 Observed type roles (verified class strings)

| Role | Spec | Where |
|---|---|---|
| Brand wordmark (onboarding) | 72px (4.5rem) / 800 / lh 1, "Axolotl" gradient text `primary → default`, "Launcher" 650 weight tertiary; brand-colour scan overlay | `OnboardingWelcome.vue` |
| Top-bar wordmark | "Axolotl" 14px / 800 / `tracking-wide` (0.025em) | `AxolotlLogo.vue` |
| Home greeting h1 | 22px (1.375rem) / 800 / lh 1.35 (user-adjustable size) or `text-2xl` 24px/800 | `HomeGreeting.vue` |
| Page title h1 | 24px / 700 (Lab 实验室) or 24px / 600 / lh 1 (`ContentPageHeader`) | `Lab.vue`, `ContentPageHeader.vue` |
| Modal title | 24px / 600 / text-primary | `NewModal.vue` |
| Section / card title | 18px / 600–700 (`text-lg`), tight leading | Settings sections, Lab tool cards, list rows |
| Widget heading | 16px / 700 / letter-spacing 0 | Home widgets, calendar |
| Button label | 16px / 600 (md–lg), 16px / **800** (xl), 14px / 600 (2xs–sm), lh 20px | `ButtonFrame.vue` |
| Input text | 16px / 500, lh 20px | `StyledInput.vue` |
| Body / description | 14px / 400–500, tertiary, `leading-5` or `leading-relaxed` (1.625) | everywhere |
| Tag / pill text | 14px / 400 / lh 1 | `TagItem.vue` |
| Caption | 12px / 700 (date label), 12px/600 settings sub-labels | |
| Breadcrumb current page | 16px / 600 / text-primary | `Breadcrumbs.vue` |
| Tooltip | 14.4px (0.9rem) / 500 / lh 1 | `overlays.css` |
| Badge counter | 10px / 700 / lh 16px, white on brand | nav downloads badge |

---

## 8. Spacing, radius and borders

| Gap token | px | Tailwind equivalent |
|---|---|---|
| `--gap-xs` | 4 | `gap-1` |
| `--gap-sm` | 8 | `gap-2` |
| `--gap-md` | 12 | `gap-3` |
| `--gap-lg` | 16 | `gap-4` |
| `--gap-xl` | 24 | `gap-6` |

| Radius token | px | Typical use |
|---|---|---|
| `--radius-xs` | 4 | details/summary, headless checkbox |
| `--radius-sm` | 8 | tooltips, settings nav items, markdown code |
| `--radius-md` | 12 | settings section cards, context menu, legacy `.btn`, global `input`, `.badge` |
| `--radius-lg` | 16 | `.card`/`base-card`, home widgets, Lab cover thumbnails, scrollbar thumb |
| `--radius-xl` | 20 | content pane top-left corner, toasts, `BigOptionButton`, floating action bar |
| `--radius-max` | 999999999px | pills/sliders |
| Tailwind | `rounded-md` 6, `rounded-lg` 8, `rounded-[10px]`, `rounded-xl` 12, `rounded-[14px]`, `rounded-2xl` 16, `rounded-full` | buttons by size; modal body `rounded-2xl`; menu surface 12; Combobox dropdown 14 |

Avatar radius scales with size: `border-radius = 16/96 × size` (48px avatar → 8px), 1px `--surface-5` border, `--surface-4` fill, `--shadow-card`. Placeholder avatar = grey isometric cube outline (`stroke #9a9a9a`, width 5 in a 104 viewBox).

Borders are almost always **1px solid** (`border` + `border-solid`, preflight is off). Exceptions: legacy `.btn-outline` 2px, focus outline 4px (`0.25rem`), transparent 2px borders on global inputs.

---

## 9. Button system (`packages/ui` `Button` / `IconButton` / `ButtonLink`, all rendered by `ButtonFrame`)

Files: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\ButtonFrame.vue`, `Button.vue`, `IconButton.vue`, `ButtonLink.vue`, `ButtonGroup.vue`, `CheckCircleButton.vue`, `types.ts` (same folder). The old `ButtonStyled`/`LegacyButton`/`NewButton` are **retired** and blocked by `E:\GitHub\Axolotl-animation\upstream\Axolotl\scripts\axolotl\check-retired-ui.mjs`. 803 `<Button>` usages; 82 `type="colored"`.

### 9.1 Base anatomy (every size/type)

```
relative inline-flex min-w-0 shrink-0 items-center justify-center whitespace-nowrap
border border-solid border-transparent no-underline select-none cursor-pointer
transition-[background-color,color,box-shadow,filter,opacity,transform] duration-150 ease-out
enabled:active:scale-[0.97]
hover / focus-visible (not disabled): filter: brightness(var(--hover-brightness))   → .9 light / 1.25 dark
focus-visible: outline none + ring-4 ring-brand-shadow                              → 0 0 0 4px rgba(219,39,119,.68)
disabled / aria-disabled: opacity .5, cursor not-allowed
```

`ease-out` = `cubic-bezier(0, 0, 0.2, 1)`. The 1px transparent border is part of the height (border-box), so a `md` button is 36px tall overall.

### 9.2 Sizes

| `size` | Height | Radius | Pad-x | Gap | Font | Icon | Icon-only width |
|---|---|---|---|---|---|---|---|
| `2xs` | 24 | 8 | 6 | 4 | 14 / 600 / lh20 | 16 | 24 |
| `xs` | 28 | 8 | 6 | 4 | 14 / 600 | 16 | 28 |
| `sm` | 32 | 10 | 6 | 4 | 14 / 600 | 16 | 32 |
| `md` (default) | **36** | **12** | 10 | 6 | **16 / 600** | 20 | 36 |
| `lg` | 40 | 14 | 16 | 8 | 16 / 600 | 20 | 40 |
| `xl` | **48** | **16** | 14 | 8 | **16 / 800** | **24** | **48** |

`circular` → `rounded-full`. `IconButton` defaults to `circular: true`.

### 9.3 Types (resolved LIGHT + pink; dark in brackets)

| `type` | Fill | Label | Icon | Shadow / stroke |
|---|---|---|---|---|
| `base` (default) | `--surface-4` **#ffffff** [#333a46] | text-primary #1a202c [#fff] | text-default #2c2e31 [#b0bac5] | `inset 0 0 0 1px var(--surface-5)` (#ddd) + `0 1px 1px rgba(0,0,0,.12)` |
| `colored` (+`color`, default brand) | `--button-color` **#db2777** [#f472b6] | accent-contrast **#fff** [**#000**] | inherit | `0 0 0 1px rgba(219,39,119,.3), 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)` **+ `::before` 1px rim**: `linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0))` masked to the border (`padding:1px; mask: content-box xor`) → a top-lit bevel |
| `colored-text` | surface-4 | button colour | inherit | same as base |
| `outlined` | transparent | colour or text-primary | colour or text-default | real 1px border `var(--button-color, var(--surface-5))` |
| `quiet` | transparent | colour or text-default | inherit | none. `interaction`: `surface` (default) hover/focus `bg-surface-4`; `filled` hover `bg = colour`, label white; `none` disables hover brightness |
| `chip` | `--button-highlight` (brand 25% tint) or surface-4 | colour or text-default | inherit | as base |
| `chip-text` | tint | colour | inherit | none |
| `highlight` | tint | text-primary | inherit | as base |

`color` ∈ `brand | red | orange | green | blue | purple` → `--button-color` = `var(--color-{c})`, `--button-highlight` = `var(--color-{c}-highlight)` (brand → `--color-brand-highlight`).

Resolved states, LIGHT pink:

| State | Colored brand | Base |
|---|---|---|
| Rest | fill `#db2777`, label `#ffffff` | fill `#ffffff`, label `#1a202c`, ring `#dddddd` |
| Hover (`brightness(.9)`) | `#c5236b`, label `#e6e6e6` | `#e6e6e6`, label `#171d28` |
| Press | `scale(.97)` over 150ms ease-out (plus hover filter) | same |
| Focus-visible | `box-shadow: 0 0 0 4px rgba(219,39,119,.68)` + hover filter | same |
| Disabled | 50% opacity (`#ea90b8` look on `#f8f8f8`) | 50% opacity |

### 9.4 The real "launch" buttons (candidates for the hero)

| Where (file) | Markup | Visual |
|---|---|---|
| Instance page header `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Index.vue` | `<Button type="colored" color="brand" size="xl"><PlayIcon/> 开始游戏</Button>` | 48px pink pill-rect, r16, white 16/800 label, 24px play outline |
| Minimal home `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeMinimal.vue` | same + `class="w-36 justify-center"`, `PlayIcon class="translate-x-px"` | **144×48**, centred content |
| Library grid card `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue` | `type="colored" color="brand" size="xl" circular icon-only` over the instance icon; `PlayIcon translate-x-[1-2px]` | 48px pink circle; appears on card hover: `scale-75 opacity-0 → scale-100 opacity-100`, `transition-all` (150ms, `cubic-bezier(.4,0,.2,1)`), `origin-bottom`, `card-shadow` |
| Home rows `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\InstanceItem.vue` / `WorldItem.vue` | `<Button>` (base md) wrapping a plain `<button>` | white 36px base button `▷ 开始游戏`; the nested `<button>` means the icon falls back to `1em` (16px) **(inferred from markup)** |
| Calendar played-list row `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeCalendar.vue` | `type="quiet" size="2xs" circular icon-only class="!text-brand opacity-60 group-hover:opacity-100"`, tooltip **启动** | 24px pink play glyph |

State labels of the same button (zh-CN): 开始游戏 (`button.play`), 停止 (`button.stop`, `color="red"` + StopCircle icon), 正在停止…… (`app.instance.stopping`), 正在启动…… {seconds, number} 秒 (`app.instance.starting`, disabled base xl + spinning SpinnerIcon), 安装中…… (`label.installing`), 修复 (`button.repair`), 安装 (`button.install`), 加入服务器 (`app.instance.join-server`), 启动实例 (`app.instance.launch-instance`), 从未游玩 (`app.instance.never-played`), 离线模式只能启动已完整下载的实例。 (`app.instance.offline-installed-only`). Common: 取消 (`button.cancel`), 关闭 (`button.close`), 保存 (`button.save`), 重试 (`button.retry`), 打开文件夹 (`button.open-folder`), 加载中…… (`label.loading`), 上次游玩于{ago} (`label.played`).

Recommended hero identity to keep constant through every morph **(inferred from the above)**: the `#db2777` fill, the 1px white top-rim + 30%-pink ring, the outline play triangle (Lucide polygon `5 3 19 12 5 21`, 2px stroke at 24px, round joins), and the 16px corner radius at 48px height (radius/height = 1/3).

### 9.5 Other button-family pieces

- **ButtonGroup**: `display:flex; gap:1px`; inner corners squared (`border-*-radius: 0`) for joined buttons.
- **CheckCircleButton**: quiet lg, full width, `!px-2 !gap-4`; checked `!border-brand !bg-brand-highlight`, trailing 24px brand circle with 16px check (`text-brand-inverted`); unchecked trailing 24px ring `border-surface-5`; unchecked hover `bg-surface-3`.
- **Legacy classes** (still in 17 places): `.button-base` (500 weight, hover `brightness(.85)`, active `brightness(.8)`, disabled `grayscale(50%) opacity .5`), `.btn` (radius 12, `padding: 8px 16px`, gap 8, lh 20, svg 20px, `--_background-color: var(--surface-4)`, `--shadow-inset-sm`; variants `.btn-primary` brand/white, `.btn-secondary` highlight/contrast, `.btn-danger|red|orange|green|blue|purple|gray`, `.btn-outline` 2px ring, `.btn-transparent`, `.btn-large` 700/16px pad 12×16 svg 24), `.clickable` / `a` (transitions opacity .5s, filter .2s, scale .05s; `active` scale .95), `.button-animation` (transform .05s ease-in-out; active scale .95). Reduced motion removes the scale.
- **Headless tokens** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\headless\token-classes.ts`): `buttonStandard` h-36 radius 12 `bg-surface-4` 14/500, `buttonBrand` h-36 `bg-brand` 14/600, both `active:scale-[0.98]`, `focus-visible:ring-2 ring-brand`.

---

## 10. Cards and panels

| Recipe | Spec | File |
|---|---|---|
| `.card` / `.base-card` (`Card.vue` renders `<div class="card">`) | `padding:16px; border-radius:16px; background:var(--surface-3) (#f8f8f8); border:1px solid var(--surface-4) (#fff); margin-bottom:12px; min-height:32px; outline:2px solid transparent`. Collapsible header uses a circular icon-only base Button with `DropdownIcon` rotating 0°/180° | `classes.scss`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Card.vue` |
| Settings section card | `Card` with `padding 0; background surface-3; border-color surface-4; border-radius 12px`; header h2 18/600 + description 14px tertiary relaxed | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\settings\SettingsSection.vue` |
| Home widget | `border-radius 16px; border 1px transparent; background surface-3 × widget opacity; box-shadow var(--shadow-card)`; transitions border-color/box-shadow/filter 120ms ease; hover (instance/world/server widgets) `brightness(var(--hover-brightness))`; grid gap 16px, row 10rem | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\HomeDashboard.vue` |
| List-row card (instances/worlds) | `rounded-lg (8px) bg-surface-2 p-3 card-shadow`, grid `auto 3fr 4fr auto`, gap 8; 48px icon; name 18/700 text-primary; meta 14px tertiary; hover via SmartClickable (brightness, scale .97 on press) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\InstanceItem.vue` |
| Lab tool card | `.card` + `!p-4`, hover `border-surface-5` + `brightness(1.05)` over 200ms; 2:1 cover `rounded-[16px] bg-surface-2`, title 18/700, desc 14px tertiary lh20, `TagItem` + colored brand `sm` button `进入` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Lab.vue` |
| `InstanceRowCard` (picker) | `rounded-xl border border-surface-4 bg-surface-2 p-3`, hover `border-brand bg-brand-highlight`, `active:scale-[0.98]`, 200ms | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\InstanceRowCard.vue` |
| `BigOptionButton` | `rounded-[20px] p-3 gap-3`, `bg-surface-4` (selected `bg-brand-highlight`), 56px icon box `rounded-2xl` 1px border (selected `border-brand`), icon 32px stroke 1.5; hover `brightness-110`, `active:scale-[0.98]`; chevron fades in on hover (100ms) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\BigOptionButton.vue` |
| SmartClickable (card-as-link) | hover → `.smart-clickable:highlight-on-hover` brightness(hover-brightness), underline-on-hover; press → contents `scale: .97` (`transition: scale .125s ease-out`) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\SmartClickable.vue` |

---

## 11. Inputs, search field, combobox, sliders

**StyledInput** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\StyledInput.vue`), default `variant="filled"`:

| Part | Spec |
|---|---|
| Field | `h-9` **36px**, `rounded-xl` **12px**, `bg-surface-4` (#fff), no border, `py-2`, `text-base` 16px, `font-medium` 500, text-default `#2c2e31`, placeholder text-tertiary `#484d54` |
| Leading icon | `absolute left-3` (12px), 20×20, `opacity .6` + tertiary; focused `opacity 1` + text-primary; padding-left becomes `pl-10` (40px) |
| Focus | `ring-4 ring-brand-shadow` (`0 0 0 4px rgba(219,39,119,.68)`), text → primary; `transition-[shadow,color]` |
| Clear button | `XIcon` 20px, `absolute right-0.5 p-2`, tertiary → primary on hover; adds `pr-8` |
| Small | `h-8 py-1.5 text-sm` |
| Error | `outline 2px red` + `bg-warning-bg` |
| Outlined variant | transparent, `border 1px surface-4`, `rounded-l-xl` + attached right button (16px search/clear icon, `rounded-r-xl`) |
| Multiline | same skin, `pl-3 pr-3 py-2`, `rounded-xl`, rows 3 |

Real example: Lab search `<StyledInput :icon="SearchIcon" placeholder="搜索工具" clearable wrapper-class="min-w-[14rem] flex-1" />` (`app.lab.search` → 搜索工具), next to two `Combobox` (`w-48`) showing 全部工具 (`app.lab.category.all`) and 全部 (`app.lab.favorite-filter.all`).

Global `input, textarea` fallback (`global.scss`): `background: var(--surface-3)`, `padding: .5rem 1rem`, 500 weight, `border-radius: 12px`, `box-shadow: var(--shadow-inset-sm)`, `min-height 36px`, focus `0 0 0 .25rem var(--color-brand-shadow)`, transition box-shadow .1s ease-in-out, placeholder `--color-button-text` at 60%.

**Combobox** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Combobox.vue`) — replaces the retired `DropdownSelect`:

| Part | Spec |
|---|---|
| Trigger | `rounded-xl bg-surface-4 px-4 py-2 gap-2.5` (≈36px tall), label `font-semibold leading-tight text-default`, placeholder tertiary 70% 500; chevron = `ChevronLeftIcon` 20px rotated −90° (points down), rotates to 90°/−90° when open in 150ms; hover/active `brightness(115%)`; `transition-all 200ms` |
| Dropdown | teleported, `fixed z-[9999]`, `rounded-[14px] bg-surface-4 border 1px surface-5`, `shadow-2xl`, 8px gap below trigger, max-height 300px, fade 150ms |
| Option | `px-4 py-3 gap-2.5`, 600 weight; idle `bg-surface-4 text-primary`, hover `brightness(115%)`; selected `bg-brand-highlight text-brand`; divider 1px `surface-5`; 8px overlay scrollbar handle `--color-scrollbar` |
| Searchable mode | a StyledInput with search icon inside `rounded-xl bg-surface-4` |

**Slider** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Slider.vue`): 4px track `linear-gradient(brand 0 → value%, text-default value% → 100%)`, thumb 12px brand circle (hover 16px, width/height .2s), snap ticks 4px; numeric StyledInput `w-24` at right; min/max labels 12px.

---

## 12. Toggle, checkbox, radio, chips, tags, pills, tabs

| Component (file under `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\`) | Spec (LIGHT pink) |
|---|---|
| **Toggle** `Toggle.vue` | Track `48×24` (small `40×20`), `rounded-full`, `p-1` 4px; off `bg-surface-4` (#fff), on `bg-brand` (#db2777). Knob 16px (small 12px): off `bg-gray` (#595b61), on `translate-x-[24px]` (small 20px) and **`bg-black/90`** (black knob on pink, both themes). Hover knob grows to 18px (`m:-1px`), active shrinks to 14px. `transition-all duration-200` (`cubic-bezier(.4,0,.2,1)`). Disabled 50% |
| **Checkbox** `Checkbox.vue` | Box 20×20 `rounded-md` 6px, 1px border; off `bg-surface-2` + `border-divider-dark` (#ddd); on `bg-brand` + `border-button-border` + white `CheckIcon` (stroke-width 3); shadow `1px 1px 2px rgba(0,0,0,.08)`; `active:scale-95`; label 12px gap, text-primary; hover brightness. Seen in login dialog: 在此设备上保存登录 |
| **RadioButtons** `RadioButtons.vue` | Rows `py-2 px-2 rounded-xl gap-2 font-medium`, selected `bg-surface-4 text-primary` + `RadioButtonCheckedIcon` brand 20px; idle transparent, hover `bg-surface-4`; `active:scale-95` |
| **Chips** (radio group) `Chips.vue` | `<Button>` md (sm when small) — selected `type="chip" color="brand"` (pink tint fill, pink label, CheckIcon), unselected `type="base"`; gap 8px; labels capitalised |
| **TagItem** `TagItem.vue` | `rounded-full px-2 py-1 leading-none text-sm font-normal gap-1`, `bg-surface-4` + 1px `border-surface-5`, text tertiary (override via `--_bg-color` / `--_color`), icons 16px. Clickable variant: `hover:underline active:scale-[0.95]`. Lab category tags: 创作 / 维护 / 世界 (`app.lab.category.creation|maintenance|world`) |
| **TagTagItem** | TagItem + loader icon; loader tags colour text with `--color-platform-{loader}` |
| **FilterPills** `FilterPills.vue` | Leading `FilterIcon` 20px tertiary; pills `rounded-full border 1px px-3 py-1.5 text-base font-semibold leading-5`, `transition-all duration-100 active:scale-[0.97]`; active `border-brand bg-brand-highlight text-brand`; idle `border-surface-5 bg-surface-4 text-default hover:bg-surface-5` |
| **Tabs** (segmented) `Tabs.vue` | Container `h-[38px] rounded-xl border 1px surface-5 p-0.5 gap-1 shadow-sm`; tab `rounded-[10px] px-2.5 text-sm font-medium gap-2`, selected `border-brand bg-brand-highlight text-brand` (icon brand), idle transparent text-default (icon tertiary), hover `bg-surface-4`, `active:scale-[0.97]`, focus `ring-4 ring-brand-shadow` |
| **NavTabs** (pill nav w/ slider) `NavTabs.vue` | `rounded-full bg-surface-3 p-1 text-sm font-bold`; navigation mode adds `shadow-xl border 1px surface-4`; links `px-4 py-2 gap-2`, icons 20px; active label/icon `--color-button-text-selected` (white in light), idle label text-primary / icon tertiary; **slider** `bg-button-bgSelected` (solid pink in light, tint in dark), subpage `bg-surface-4`; motion in §15 |
| **Badge** `Badge.vue` | Inline 700-weight label with 8px dot in `--badge-color` (gray/red/orange/green/blue/purple) |
| **`.badge`** (app global) | `rounded 12px`, `padding 8px 16px`, `background --color-bg`; `.featured` → brand-highlight + text-primary |
| **StatusLabel** | `inline-flex gap-1 font-semibold text-tertiary` |

---

## 13. Dropdowns, menus, tooltips, modals, toasts

| Surface | Spec | File |
|---|---|---|
| **Menu surface** (PopoutMenu / OverflowMenu, reka-ui) | `.menu-surface { padding:8px; border:1px solid var(--surface-5); border-radius:12px; background:var(--surface-3); box-shadow:3px 3px .8rem rgba(0,0,0,.3) }`, arrow 14×7 fill surface-3 stroke surface-5, `side-offset 4px`, default placement `bottom-end`. Items = `Button type="quiet"` md, full width, left-aligned (h36, r12, 16/600, icons 20px; hover `bg-surface-4` + brightness); `color: danger` → red label, `hoverFilled` → solid colour on hover; dividers `h-px mx-[10px] my-2 bg-surface-5` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\styles\overlays.css`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\PopoutMenu.vue`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\OverflowMenu.vue` |
| Kebab trigger (home rows) | `size-9 rounded-full transparent text-default hover:bg-surface-4 hover:brightness active:scale-[0.97]`, `MoreVerticalIcon` 20px | `InstanceItem.vue` / `WorldItem.vue` |
| **TeleportOverflowMenu** | `rounded-2xl border 1px surface-5 bg-surface-3 p-2 gap-2 shadow-lg`; enter/leave `scale-75 ↔ 100` + opacity, ease-out/ease-in (`duration-125` is not a default Tailwind v3 step, so effectively 150ms **(inferred)**) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\TeleportOverflowMenu.vue` |
| **ContextMenu** (right click) | `bg surface-3, radius 12, box-shadow --shadow-floating, border 1px --color-divider, padding 8`; items `padding 8, radius 8, gap 8`, hover `base` → surface-4 + primary, `primary` → brand fill white bold, `danger` → red fill; fade .2s ease-in-out | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\ContextMenu.vue` |
| **Tooltip** (`v-tooltip`) | `background var(--color-tooltip-bg)` (#f8f8f8), text primary, `padding 10px 12px`, `border 1px surface-5`, `radius 8px`, `filter: drop-shadow(2px 2px .4rem rgba(0,0,0,.5))`, 14.4px/500/lh1, max-width `min(28rem, 100vw-2rem)`; arrow 14×7 two-layer triangles; **show delay 200ms**, offset 5px, default placement top, no fade | `overlays.css`, `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\directives\tooltip.ts` |
| Calendar tooltip | `padding 8px 10px`, radius 8, border 1px surface-5, tooltip bg, `box-shadow 0 2px 8px rgba(0,0,0,.18)`, 13px/500/lh1.4, rotated-square tail | `HomeCalendar.vue` |
| Headless tooltip | `rounded-[8px] border surface-5 bg-surface-4 px-2 py-1 text-sm shadow-md`, arrow fill surface-4 | `token-classes.ts` |
| **NewModal** | Overlay `inset:-5rem; border-radius:180px`, pink-tinted black gradient (§2.3), `backdrop-filter: blur(5px)`, fade 0.2s ease-out. Container starts offset toward the click point by `(click − centre)/16` and settles to 0 in 0.2s ease-out. Body `bg-surface-3 rounded-2xl (16px) border 1px surface-5`, `box-shadow 4px 4px 26px 10px rgba(0,0,0,.08)`, `scale .97 → 1` + opacity, 0.2s ease-in-out; max-width 60rem. Header `p-6` (24px) + bottom border 1px surface-5, title 24/600, close = circular icon-only base Button (36px) with `XIcon`. Content `p-6`; actions bar `p-4` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\modal\NewModal.vue` |
| Onboarding spotlight | Mask hole `box-shadow 0 0 0 9999px rgba(0,0,0,.55)`, radius 12, moves 160ms ease; 12px brand-coloured 2px **corner brackets**; pulse `scale 1 → 1.015 → 1`, 1.6s ease-in-out infinite | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\OnboardingOverlay.vue` |
| Toast | `w = min(420px, 100vw−1.5rem)`, `rounded-[20px] border 1px surface-5 bg-surface-3 p-4`, shadow `0 4px 8px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.2)`, title 18/600 | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\notifications\NotificationToast.vue` |
| Floating action bar | `rounded-[20px] bg-surface-3 border 1px surface-5 px-3 py-2.5 gap-1.5`, shadow `0 1px 3px rgba(0,0,0,.3), 0 6px 10px rgba(0,0,0,.15)`, wrapper `drop-shadow-2xl` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\FloatingActionBar.vue` |
| Admonition (banners) | `rounded-2xl border 1px p-4`, grid `24px 1fr auto`; info `border-blue bg-blue-bg`, warning orange, critical red, success green; header 18/600 | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\Admonition.vue` |

---

## 14. Progress & loading

| Piece | Spec |
|---|---|
| **LoadingBar** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\LoadingBar.vue`) | 2px tall, `border-radius 2px`, `background: var(--loading-bar-gradient)` (`#db2777 → #e76ca3`), `::before` radial brand glow at 10% opacity; width grows every 100ms; `transition: width .1s ease-in-out, height .1s ease-out, opacity .4s`; hides 500ms after finish |
| **ProgressBar** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\ProgressBar.vue`) | Track `h-2` (8px) `rounded-full`, brand track = `bg-brand-highlight`, fill `bg-brand`; width transition .2s ease-in-out; indeterminate keyframe `progress-bar-waiting` 1s linear infinite; optional 2px white-30% gradient rim; striped variant 135° stripes, 9.38px tiles |
| **LoadingIndicator** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\LoadingIndicator.vue`) | Title 加载中 (`omorphia.component.loading-indicator.label`) with animated dots (2s); three 64px placeholders `radius 16px bg-surface-2` pulsing `opacity .25 ↔ .5` + border flash (4s ease-in-out, staggered 0 / .3 / .6s) and a −45° shimmer sweep |
| **SpinnerIcon** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\spinner.svg` (25%-opacity ring + 75% arc), Tailwind `animate-spin` = 1s linear infinite |

---

## 15. Motion tokens (global and component)

| Name | Duration / easing | Effect | Source |
|---|---|---|---|
| Button (ButtonFrame) | 150ms `cubic-bezier(0,0,.2,1)` | bg/colour/shadow/filter/opacity/transform; press `scale(.97)` | ButtonFrame.vue |
| Legacy click (`.clickable`, `a`) | opacity .5s, filter .2s, scale .05s, outline .2s (ease-in-out) | press `scale .95` | classes.scss |
| `.button-animation` | transform .05s ease-in-out, filter .2s | press `scale(.95)` | defaults.scss |
| Tailwind default `transition` | 150ms `cubic-bezier(.4,0,.2,1)` | | Tailwind 3.4 |
| Toggle | 200ms (default curve) | knob translate 24px, grow 18px on hover, 14px on press | Toggle.vue |
| Nav rail active pill | 150ms `cubic-bezier(.4,0,.2,1)`; **trailing edge delayed 120ms** (top edge when moving down, bottom edge when moving up); opacity 250ms `cubic-bezier(.5,0,.2,1)` 50ms | elastic stretch-then-catch-up between items | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavRail.vue` |
| NavTabs slider | same curve, **trailing edge delayed 200ms** | horizontal rubber-band pill | NavTabs.vue |
| Quick-instance nav button enter | 0.5s **`cubic-bezier(.15,1.4,.64,.96)`** (overshoot) from `scale .5, translate -2rem, opacity 0`; `::before` brand-highlight ring `pop` (scale .5 → 1.5, peak opacity .5) 0.5s ease-in | spring-in of a new round button | App.vue |
| Quick-instance nav button leave | 0.25s ease → `scale .75, opacity 0` | | App.vue |
| Right sidebar width | `--right-bar-width` 320ms `cubic-bezier(.22,1,.36,1)` | | App.vue |
| Page change | enter opacity 0→1 180ms ease; leave 120ms ease (feature flag 页面切换过渡动画, on by default) | | global.scss |
| `.slide-*` | transform+opacity .2s ease, from `translateY(30px)`, to `translateY(-30px)` | | global.scss |
| `.fade-*` | .25s ease-in-out | | App.vue |
| Modal | 0.2s ease-out (overlay, container), body 0.2s ease-in-out `scale .97→1` | | NewModal.vue |
| Combobox | dropdown opacity 150ms; chevron rotate 150ms; trigger `transition-all 200ms` | | Combobox.vue |
| Tooltip | 200ms show delay, instant | | tooltip.ts |
| Library card play button | `transition-all` 150ms; `scale .75 → 1`, opacity 0 → 1, `origin-bottom` | | Instance.vue |
| SmartClickable | `scale .125s ease-out` → `.97` on press; hover brightness | | SmartClickable.vue |
| Home widget | 120ms ease (border, shadow, filter) | | HomeDashboard.vue |
| Calendar cell | 100ms ease (box-shadow, bg); selected `0 0 0 2px brand` | | HomeCalendar.vue |
| Sidebar handle | 180ms ease; icon `scale 1.12` hover, `.9` press | | App.vue |
| Accordion | `grid-template-rows` 0.3s `cubic-bezier(0,.6,.3,1)`; chevron 300ms | | Accordion.vue |
| Collapsible | 0.3s ease-in-out | | Collapsible.vue |
| Toasts | 0.25s ease-in-out, enter from `translateY(100%) scale(.8)` + fade; popups 0.3s ease-in-out from `translateX(100%) scale(.8)` | | NotificationPanel.vue / PopupNotificationPanel.vue |
| Scroll-to-top | .24s ease, `translateY(10px)` + fade; hover `brightness-110 shadow-xl`, press `scale-95` | | ScrollToTopButton.vue |
| Onboarding brand intro | logo `scale .72 → 1.04 (65%) → 1` + fade, 900ms **`cubic-bezier(.16,1,.3,1)`**; wordmark width reveal + `translateX(-4rem → 0)` 1050ms delay 900ms (same curve); **brand scan**: a `--color-brand` copy of the wordmark wiped away left→right by `clip-path: inset(0 0 0 100%)` 700ms at 2050ms (suffix at 2400ms) `cubic-bezier(.22,1,.36,1)`; lift 3200ms; bottom panel slides up 650ms at 3200ms with a 2px brand bar at its top-left | | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\OnboardingWelcome.vue` |
| Onboarding spotlight | 160ms ease move; 1.6s pulse (scale 1.015) | | OnboardingOverlay.vue |
| `prefers-reduced-motion` | removes button scale, page transitions, modal transitions | | several |

Easing vocabulary to reuse: `cubic-bezier(0,0,.2,1)` (UI ease-out), `cubic-bezier(.4,0,.2,1)` (standard), `cubic-bezier(.22,1,.36,1)` (soft settle), `cubic-bezier(.16,1,.3,1)` (expo-out reveal), `cubic-bezier(.15,1.4,.64,.96)` (overshoot spring), `cubic-bezier(0,.6,.3,1)` (accordion).

---

## 16. Icons used by the base components

Style: Lucide-derived, 24×24 viewBox, `fill:none; stroke:currentColor; stroke-width:2; stroke-linecap/linejoin: round` (a few are filled, e.g. `x.svg` is a 20×20 solid glyph). Default `svg { width:1em; height:1em }`; buttons force 16/20/24px. Exports: `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\generated-icons.ts` (generated), `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\index.ts`.

| Component name | SVG file |
|---|---|
| `PlayIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\play.svg` (`<polygon points="5 3 19 12 5 21 5 3"/>`) |
| `StopCircleIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\stop-circle.svg` |
| `SpinnerIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\spinner.svg` |
| `DownloadIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\download.svg` |
| `SearchIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\search.svg` |
| `XIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\x.svg` |
| `CheckIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\check.svg` |
| `MinusIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\minus.svg` |
| `ChevronLeftIcon` (Combobox chevron, rotated) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\chevron-left.svg` |
| `ChevronRightIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\chevron-right.svg` |
| `DropdownIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\dropdown.svg` |
| `MoreVerticalIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\more-vertical.svg` |
| `LeftArrowIcon` / `RightArrowIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\left-arrow.svg` / `right-arrow.svg` |
| `RadioButtonIcon` / `RadioButtonCheckedIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\radio-button.svg` / `radio-button-checked.svg` |
| `FilterIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\filter.svg` |
| `ExternalIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\external.svg` |
| `SunIcon` / `MoonIcon` (theme cards) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\sun.svg` / `moon.svg` |
| `StarIcon` (Lab favourite, `fill-brand` when on) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\star.svg` |
| `ImageIcon`, `UploadIcon`, `TrashIcon` (background picker) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\image.svg`, `upload.svg`, `trash.svg` |
| Nav rail: `HomeIcon`, `ImagesIcon`, `WorldIcon`, `CompassIcon`, `ChangeSkinIcon`, `UsersIcon`, `LibraryIcon`, `FlaskConicalIcon`, `DownloadIcon`, `PlusIcon`, `SettingsIcon` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\home.svg`, `images.svg`, `world.svg`, `compass.svg`, `change-skin.svg`, `users.svg`, `library.svg`, `flask-conical.svg`, `download.svg`, `plus.svg`, `settings.svg` |

---

## 17. Brand assets relevant to the token layer

| Asset | Path | Notes |
|---|---|---|
| **Axolotl mascot logo (raster)** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.png` (1024×1024 RGBA; byte-identical copy at `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl.png`) | Voxel pink axolotl; used by `AxolotlLogo.vue` (top bar, onboarding), splash, settings footer, window icon |
| **Axolotl mascot logo (vector)** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.svg` (Illustrator, viewBox 566.9²) | Same drawing (render check: `E:\GitHub\Axolotl-animation\research\_scratch\branding-axolotl-svg.png`). Main fills by area: `#E7A1C6`, `#DF3177`, `#FED5EB`, `#FE3D8C`, `#FE71B1`, `#E79EC5`, `#E59CC3`, `#FE4592`, `#FEB8DA`, `#D772A4`, `#DC73A6`, `#E03178`, eyes `#43147C` |
| **Do NOT use** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\logo.svg` | This is the **Modrinth** mark (exported as `ModrinthIcon`; still shown as a content-source icon on Browse/Downloads and in `Badge` "Modrinth Team") |

The mascot is pink-on-pink with a deep-purple accent; the UI accent `#db2777` sits inside that family (`#DF3177`/`#E03178` are the closest logo tones).

---

## 18. Reference-screenshot notes (to avoid colour-picking mistakes)

- `E:\GitHub\Axolotl-animation\research\ref\theme-accent.png`, `account-login.png`, `axolotl-lab.png` (1600×936) are **Display-P3-encoded with the ICC profile stripped**. Example: the brand renders as `#c93b76` in the file, which converts back to sRGB `#db2777` exactly; the dark-preview swatch `#e175a6` converts to `#f16da8` (= `deriveAccentVariants('#db2777').dark`). Neutral greys are unaffected. Scale ≈ **1.0 px per CSS px** (search input measures 36px, nav circle 48-49px).
- `E:\GitHub\Axolotl-animation\research\ref\launcher-home.png` (2560×1489) is roughly sRGB (nav pill `#de2677`, slight magenta cast on greys: `#f8f6f8` for `#f8f8f8`, `#ebe9ec` for `#ebebeb`). Scale ≈ **1.667 px per CSS px** (base "开始游戏" button measures 183×60 px = 110×36 CSS px: 10 + 20 + 6 + 64 + 10).
- The screenshots show **v1.6.0** (per the settings footer "Axolotl Launcher 1.6.0"); the code is **v1.9.7+**. Token values match the screenshots (surfaces, brand, calendar ramp verified), but some layouts differ: the 1.6.0 Lab page is a 3-column grid (code: list with 2:1 covers and 进入 buttons), the 1.6.0 custom-accent panel shows a 12-swatch row (code: hue slider + hex + previews only), 1.6.0 base buttons show a soft drop shadow without the crisp 1px `#dddddd` inset ring the code now draws.
- Verified samples (sRGB after conversion): page `#ebebeb`, chrome `#f8f8f8`, home rows/calendar card `#f8f8f8`, Lab search & combobox `#ffffff`, Lab card body `#f8f8f8`, modal body `#f8f8f8`, modal inputs `#ffffff`, active nav `#db2777`, difficulty dot `#00af5c`, right sidebar wash top `#ebd9e2` (computed `#ead9e1`).

---

## 19. Ready-to-paste token block (LIGHT + pink, with DARK overrides)

```css
:root {
	/* surfaces */
	--surface-1: #ebebeb; --surface-1-5: #ededed; --surface-2: #f5f5f5; --surface-2-5: #eef1f5;
	--surface-3: #f8f8f8; --surface-4: #ffffff; --surface-5: #dddddd;
	/* text */
	--color-text-primary: #1a202c; --color-text-default: #2c2e31; --color-text-tertiary: #484d54;
	--color-accent-contrast: #ffffff;
	/* brand (accent-pink) */
	--color-brand: #db2777;
	--color-brand-highlight: rgba(219, 39, 119, 0.25);
	--color-brand-shadow: rgba(219, 39, 119, 0.68);
	--brand-gradient-bg: linear-gradient(0deg, rgba(219, 39, 119, 0.14) 0%, rgba(219, 39, 119, 0.09) 100%);
	--brand-gradient-border: rgba(219, 39, 119, 0.16);
	--brand-gradient-button: rgba(255, 255, 255, 0.5);
	--loading-bar-gradient: linear-gradient(to right, #db2777 0%, #e76ca3 100%);
	--color-button-bg-selected: #db2777; --color-button-text-selected: #ffffff;
	--color-focus-ring: #db2777;
	/* semantic defaults */
	--color-red: #cb2245; --color-orange: #e08325; --color-green: #00af5c; --color-blue: #1f68c0;
	--color-purple: #8e32f3; --color-pink: #db2777; --color-gray: #595b61;
	--color-divider: #dddddd; --color-scrollbar: #96a2b0; --color-button-border: rgba(161, 161, 161, 0.35);
	/* shape */
	--gap-xs: 4px; --gap-sm: 8px; --gap-md: 12px; --gap-lg: 16px; --gap-xl: 24px;
	--radius-xs: 4px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
	/* elevation */
	--shadow-card: rgba(50, 50, 100, 0.1) 0px 2px 4px 0px;
	--shadow-button: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.15);
	--shadow-floating: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
	--hover-brightness: 0.9;
	/* type */
	--font-standard: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Roboto, Cantarell,
		'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
	--ease-ui: cubic-bezier(0, 0, 0.2, 1); --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
	--ease-settle: cubic-bezier(0.22, 1, 0.36, 1); --ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
	--ease-spring: cubic-bezier(0.15, 1.4, 0.64, 0.96);
}
.dark {
	--surface-1: #101215; --surface-1-5: #15181c; --surface-2: #1a1e24; --surface-2-5: #20242b;
	--surface-3: #262b34; --surface-4: #333a46; --surface-5: #424854;
	--color-text-primary: #ffffff; --color-text-default: #b0bac5; --color-text-tertiary: #96a2b0;
	--color-accent-contrast: #000000;
	--color-brand: #f472b6; --color-brand-highlight: rgba(244, 114, 182, 0.25); --color-brand-shadow: rgba(244, 114, 182, 0.68);
	--brand-gradient-bg: linear-gradient(0deg, rgba(244, 114, 182, 0.14) 0%, rgba(244, 114, 182, 0.09) 100%);
	--brand-gradient-border: rgba(244, 114, 182, 0.16); --brand-gradient-button: rgba(255, 255, 255, 0.08);
	--loading-bar-gradient: linear-gradient(to right, #f472b6 0%, #f89fcd 100%);
	--color-button-bg-selected: rgba(244, 114, 182, 0.25); --color-button-text-selected: #f472b6;
	--color-red: #ff496e; --color-orange: #ffa347; --color-green: #1bd96a; --color-blue: #4f9cff;
	--color-purple: #c78aff; --color-pink: #f472b6; --color-gray: #9fa4b3;
	--color-divider: #424854; --color-scrollbar: #424854; --color-button-border: rgba(193, 190, 209, 0.12);
	--shadow-card: rgba(0, 0, 0, 0.25) 0px 2px 4px 0px;
	--hover-brightness: 1.25;
}
/* the hero: Button type="colored" color="brand" size="xl" */
.launch-btn {
	position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
	height: 48px; padding: 0 14px; border: 1px solid transparent; border-radius: 16px;
	background: var(--color-brand); color: var(--color-accent-contrast);
	font: 800 16px/20px var(--font-standard);
	box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-brand) 30%, transparent), 0 2px 4px rgba(0,0,0,.04),
		0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03);
	transition: background-color .15s var(--ease-ui), color .15s var(--ease-ui), box-shadow .15s var(--ease-ui),
		filter .15s var(--ease-ui), opacity .15s var(--ease-ui), transform .15s var(--ease-ui);
}
.launch-btn::before { /* 1px top-lit rim */
	content: ''; position: absolute; inset: 0; padding: 1px; border-radius: inherit; pointer-events: none;
	background: linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0));
	-webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
	-webkit-mask-composite: xor; mask-composite: exclude;
}
.launch-btn > svg { width: 24px; height: 24px; }
.launch-btn:hover { filter: brightness(var(--hover-brightness)); }
.launch-btn:active { transform: scale(.97); }
.launch-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px var(--color-brand-shadow); }
```

The full specimen (all buttons, inputs, toggles, chips, tabs, cards, calendar ramp, nav pill, tooltip, menu in both themes) is `E:\GitHub\Axolotl-animation\research\_scratch\01-design-tokens-specimen.html`.

---

## 20. Uncertainties

- CJK face in the film: the product ships none; screenshots show macOS PingFang SC. Any substitute (Noto Sans SC / Source Han Sans SC) is a choice, not product truth.
- Inter version: product pins **3.19** static files from Modrinth's CDN; Google Fonts now serves Inter 4.x (slightly different metrics/glyphs).
- Screenshots predate the code by several versions (1.6.0 vs 1.9.7+); where they disagree on layout, the code is newer. Colour tokens agree.
- `TeleportOverflowMenu` uses `duration-125`, which Tailwind 3.4 does not generate by default; the effective duration is assumed to be 150ms.
- Home-row "开始游戏" buttons nest a plain `<button>` inside `<Button>`, so their icon likely renders at 16px rather than 20px; the 1.6.0 screenshot looks like ~20px, so this may have changed between versions.
- macOS window chrome (traffic lights, window corner radius, OS shadow) comes from the OS and is not defined in code.

---

## 21. File index (absolute paths for every short file name used above)

Desktop frontend — `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\`

| Short name | Absolute path |
|---|---|
| `App.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\App.vue` |
| `global.scss` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\stylesheets\global.scss` |
| `theme.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\store\theme.ts` |
| `font-family.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\helpers\font-family.ts` |
| `index.html` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\index.html` |
| `tailwind.config.ts` (app) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\tailwind.config.ts` |
| `AppearanceSettings.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\settings\AppearanceSettings.vue` |
| `SettingsSection.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\settings\SettingsSection.vue` |
| `NavButton.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavButton.vue` |
| `NavRail.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavRail.vue` |
| `ContextMenu.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\ContextMenu.vue` |
| `AxolotlLogo.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AxolotlLogo.vue` |
| `Breadcrumbs.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Breadcrumbs.vue` |
| `Instance.vue` (library card) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\Instance.vue` |
| `InstanceItem.vue` / `WorldItem.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\InstanceItem.vue` / `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\world\WorldItem.vue` |
| `HomeCalendar.vue`, `HomeDashboard.vue`, `HomeGreeting.vue`, `HomeMinimal.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\home\` + name |
| `OnboardingWelcome.vue`, `OnboardingOverlay.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\` + name |
| `token-classes.ts`, `HeadlessTooltip.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\headless\` + name |
| `Lab.vue`, `Settings.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\` + name |
| instance page `Index.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\instance\Index.vue` |
| zh-CN app strings | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json` (`"message"` keys) |

Shared UI — `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\`

| Short name | Absolute path |
|---|---|
| `ButtonFrame.vue`, `Button.vue`, `IconButton.vue`, `ButtonLink.vue`, `ButtonGroup.vue`, `CheckCircleButton.vue`, `types.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\` + name |
| `Card.vue`, `StyledInput.vue`, `Toggle.vue`, `Checkbox.vue`, `RadioButtons.vue`, `Chips.vue`, `TagItem.vue`, `TagTagItem.vue`, `FilterPills.vue`, `Tabs.vue`, `NavTabs.vue`, `Combobox.vue`, `PopoutMenu.vue`, `OverflowMenu.vue`, `TeleportOverflowMenu.vue`, `Slider.vue`, `LoadingBar.vue`, `ProgressBar.vue`, `LoadingIndicator.vue`, `Avatar.vue`, `BigOptionButton.vue`, `Badge.vue`, `StatusLabel.vue`, `SmartClickable.vue`, `InstanceRowCard.vue`, `ContentPageHeader.vue`, `Accordion.vue`, `Collapsible.vue`, `Admonition.vue`, `ScrollToTopButton.vue`, `FloatingActionBar.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\` + name |
| `ThemeSelector.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\settings\ThemeSelector.vue` |
| `NewModal.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\modal\NewModal.vue` |
| `NotificationPanel.vue`, `PopupNotificationPanel.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\nav\` + name |
| `NotificationToast.vue` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\notifications\NotificationToast.vue` |
| `overlays.css` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\styles\overlays.css` |
| `tooltip.ts` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\directives\tooltip.ts` |
| `common-messages.ts` (`button.play` etc.) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\utils\common-messages.ts` |
| zh-CN shared strings | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json` (`"defaultMessage"` keys) |

Assets & config: `variables.scss`, `defaults.scss`, `classes.scss`, `inter.scss`, `opacity.scss`, `reset.scss`, `normalize.scss`, `accessibility.scss` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\styles\` + name; `omorphia.scss`, `generated-icons.ts`, `index.ts` → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\` + name; Tailwind preset → `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\tooling-config\tailwind\tailwind-preset.ts`; Tauri CSP → `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\tauri.conf.json`; retired-UI guard → `E:\GitHub\Axolotl-animation\upstream\Axolotl\scripts\axolotl\check-retired-ui.mjs`; surface standard → `E:\GitHub\Axolotl-animation\upstream\Axolotl\standards\frontend\SURFACE_SYSTEM.md`.

Research helpers (this report): `E:\GitHub\Axolotl-animation\research\_scratch\colors.py`, `colors_out.txt`, `msgs.py`, `zh.py`, `appearance_msgs.txt`, `base_msgs.txt`, `instance_msgs.txt`, `01-design-tokens-specimen.html`, `specimen.png`, `compare_base_btn.png`, `branding-axolotl-svg.png` (all in `E:\GitHub\Axolotl-animation\research\_scratch\`).
