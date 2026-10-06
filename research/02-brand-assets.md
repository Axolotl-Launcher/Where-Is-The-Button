# 02 · Brand identity & reusable visual assets — Axolotl Launcher (美西螈启动器)

> Area: logos, mascot art, icons, images, fonts, licensing.
> Source (read-only clone): `E:/GitHub/Axolotl-animation/upstream/Axolotl` — every path below is an absolute Windows path written with forward slashes.
> Code version analysed: **1.9.7** (`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/package.json`). The reference screenshots are from **1.6.0** (the settings footer in `theme-accent.png` reads "Axolotl Launcher 1.6.0 / macOS 26.3.0"), so where code and screenshots disagree, the code is newer (see §8).
> Previews rendered for this report (logo variants, 3D renders, contact sheets) are in `E:/GitHub/Axolotl-animation/research/_scratch/` (list in Appendix B). Facts are verified in code/files unless marked **(inferred)**.

---

## 0. TL;DR — what to use in the film

| Need | Best file / spec | Notes |
|---|---|---|
| **Titlebar logo** (exact match) | `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/branding/axolotl.svg` | Vector twin of the PNG the titlebar loads (`branding/axolotl.png` = this SVG rendered at 1024 px, bbox matches to the pixel). Render in a 24×24 px box next to live text "Axolotl" (Inter 800, 14 px, tracking 0.025em). §2.3 |
| **End-card logo** | Same `axolotl.svg` + live wordmark **"Axolotl Launcher"** styled like the first-run onboarding reveal (72 px, 800 / 650 weights, brand-pink scan wipe) | The onboarding welcome is a real, choreographed brand reveal in the product — copy its timing. §2.5.1 |
| End-card alt: app icon | `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/Axolotl.icon/Assets/AXL(fixed).svg` on a squircle with vertical gradient white → `#FED6EB` (macOS 26 icon), or `.../apps/app/icons/axolotl-macos.svg` (white tile) | §2.6 |
| **3D mascot** | `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/public/models/axolotl.gltf` | Blockbench export, 64×64 nearest-filtered texture, built-in **"swim"** animation clip; already used in Settings › 关于 hero. §3.1 |
| **Button "visual core"** | `PlayIcon` (`.../packages/assets/icons/play.svg`, triangle `5 3 19 12 5 21`, stroke 2, round joins) + brand pink **`#db2777`** (light) / **`#f472b6`** (dark) | The UI accent `#db2777` is nearly identical to the logo's deep pink `#DF3177`/`#E03178` — one colour ties button and logo together. §7 |
| Cursor | OS arrow (app defines **no custom cursor**); in-system glyph alternative `MousePointer2Icon` (`.../icons/mouse-pointer-2.svg`) | §4.5 |
| Minecraft-flavoured props | Avatar fallback cube (inline SVG), axolotl "balls", seed-map pin (canvas spec), ores, block textures from the schematic atlas, in-game world plate `minecraft-preview.png` | §3, §7 — mind the licensing column in §6 |
| **Never use** | `packages/assets/branding/logo.svg` (Modrinth wrench-in-labyrinth), `icons/omorphia.svg`, `.github/assets/*_cover.png`, `instance-icons/modrinth-3d/*`, `loading/cube.png` | §2.7, §6 |

---

## 1. Brand facts & verbatim copy

**Identity** (from `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/config.ts`, `AxolotlBrandConfig`):

| Key | Value |
|---|---|
| productName / shortProductName | `Axolotl Launcher` / `Axolotl` |
| Chinese name | **美西螈启动器** (`README.md` line 52; website JSON-LD `alternateName: ['美西螈启动器', 'AXL Launcher']` in `apps/website/src/pages/index.vue` L771) |
| Studio / author | **Garbage Human Studio** (© 2026), developed by **Mystic Stars** (`apps/app-frontend/COPYING.md`, `apps/app/COPYING.md`) |
| Bundle id / deep link / UA | `red.ghs.axolotl` · `axolotl://` · `garbage-human-studio/axolotl/<ver>` |
| Website / repo | `https://www.axlmc.org/` · `https://github.com/Mystic-Stars/Axolotl` |

**Taglines and brand lines (zh-CN, verbatim):**

| Text | Source |
|---|---|
| 你的最后一款启动器。 | `app.settings.about.description` (`apps/app-frontend/src/locales/zh-CN/index.json`) — About page |
| 你的最后一款启动器 | `app.onboarding.welcome.footer`; Windows installer `welcomeTitle` (`apps/installer-ui/src/installer.html` L1363) |
| 次世代 Minecraft 桌面客户端，全能、美观、全平台覆盖。 | `README.md` header |
| 你的下一个世界，从这里开始。 | website `axolotl-site.footer.cta-title` (`apps/website/src/locales/site.ts` L178) |
| 免费、开源，为 Minecraft 而生。 | website `axolotl-site.footer.cta-eyebrow` |
| 安装 Axolotl Launcher，开启Minecraft全新体验 | installer `welcomeCopy` (sic, no spaces around "Minecraft") |
| Axolotl Launcher 已就绪 / 启动 Axolotl Launcher | installer `completeTitle` / `launch` |
| MINECRAFT, ORGANIZED | English tagline baked into the NSIS sidebar bitmap (§2.5.4) |
| 一切就绪 / 实例、内容、世界和下载，现在都有了同一个家。正式开玩之前，先快速逛一圈。 | onboarding welcome title/description |

Home greeting pool lines that fit the story (rotating, time-of-day; `app.home.greeting.*`): **下一个项目只差一次启动。** (morning), **下一块方块该你放下。** (evening — the one visible in `launcher-home.png`), 下一局已经准备好，等你出发。 (dawn), 这个世界已经为你保存好了。 (late-night), 坐稳，做点进度。 (morning).

**Legal lines (use on the end card):**
- 非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。 (`axolotl-site.footer.minecraft-disclaimer`)
- Modrinth 是 Rinth, Inc. 的商标。Axolotl Launcher 与 Rinth, Inc. 无关联，亦未获得其认可。 (`app.settings.about.not-affiliated`)
- Axolotl Launcher 是开源项目 Modrinth 代码库的修改版本。 (`app.settings.about.attribution`)

---

## 2. Logo system

### 2.1 The mark: a voxel pink axolotl

- **What it is:** a Minecraft-style axolotl (leucistic/"Lucy" pink morph) drawn as a **flat-shaded vector "voxel" illustration** — crisp polygons, no gradients, no outlines. Not a pixel-grid bitmap: it scales infinitely. It reads as 3D blocks lit from above: **top faces lightest, front faces base pink, right-side faces muted rose**.
- **Pose & facing:** 3/4 view, **head at the left facing the viewer/left**, body extending back to the upper right, flat tail fin with two magenta stripes at top-right, 3 gill "antlers" per side, four splayed feet with 5-square "plus" toes. Projection is hand-drawn oblique (the head's front face is a skewed quad: corners (101.6,265.3)→(286,293.4)→(285.1,424)→(104.4,390.8) in the 566.9 viewBox; top edge slopes ~8.7° down to the right) — not a true isometric grid.
- **Face:** two deep indigo eye squares and a hot-pink mouth bar between them.
- **Construction (vector):** `axolotl.svg` = Adobe Illustrator 26.4.1 export, `viewBox="0 0 566.9 566.9"`, 110 `<polygon>` + 2 `<polyline>` (head front `#FEB8DA`, head top `#FED6EB`) + 1 `<rect>` (head side detail) + 2 empty `<path>`s, 26 CSS classes `.st0–.st26`, transparent background, no width/height attributes.
- **Art bounds:** x 49.6–508.0, y 140.3–473.1 (458.4 × 332.8 units, aspect ≈ 1.377 : 1); art centre (278.8, 306.7) vs canvas centre (283.45, 283.45) → the art sits ~4% of the canvas **below** centre. In the 1024 px PNG the art occupies (89,253)–(918,855) = 829 × 602 px (81% × 59% of the square).

**Logo palette** (ranked by painted area, computed from the SVG polygons):

| Role | Hex | Class | Area |
|---|---|---|---|
| Head front face (the "body pink") | `#FEB8DA` | st15 | 20.7% |
| Body right side | `#E7A1C6` | st18 | 8.8% |
| Dorsal crest / tail-fin stripes (deep pink) | `#DF3177` | st5 | 8.6% |
| Body top | `#FED5EB` | st3 | 8.4% |
| Gill blocks, front faces (hot pink) | `#FE3D8C` | st11 | 8.4% |
| Gill blocks, light faces | `#FE71B1` / `#FD71B2` | st12 / st14 | 6.7% / 1.3% |
| Head top face | `#FED6EB` | st16 | 6.5% |
| Head right side | `#E79EC5` | st17 | 5.7% |
| Tail fin body | `#E59CC3` | st0 | 4.9% |
| Feet | `#FE4592` (+ toe centre `#FCC1E0`) | st8 / st7 | 3.0% / 1.2% |
| Body side details | `#D772A4`, `#DC73A6`, `#E589BD` | st6 / st23 / st21 | 2.4 / 2.2 / 1.7% |
| Gill shadow faces | `#E03178` | st13 | 2.1% |
| **Eyes** | `#43147C` | st19 | 1.5% (2 squares) |
| **Mouth** | `#FE60A4` | st20 | 1.3% |
| Small accents / leg shadows | `#FEBAD8`, `#E65895`, `#A12D72`, `#FE6DAF`, `#C64F8D`, `#D982AD`, `#F0579A`, `#D6518C` | — | ≤1.1% each |

Practical reduction for animation: **light `#FED6EB` · base `#FEB8DA` · shade `#E79EC5` · gill `#FE3D8C` · deep `#DF3177` · eye `#43147C`**. Related brand colours elsewhere: UI accent light `#db2777` (Tailwind pink-600) / dark `#f472b6` (pink-400); website logo glow `rgb(245 139 174)` = `#F58BAE`; splash gradient `rgba(255,77,157,…)` = `#FF4D9D`.

> Rendering tip: at large sizes on dark backgrounds the vector shows faint **hairline seams** between adjacent polygons (anti-aliasing conflation; see `_scratch/seams.png`). For an end card either add a 0.5–0.8 unit same-colour stroke with `stroke-linejoin:round` to every polygon, or render the SVG to a large bitmap with supersampling.

### 2.2 Every logo file

| File (absolute) | Format / size | What it is | Used by |
|---|---|---|---|
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/branding/axolotl.svg` | SVG, viewBox 566.9², 10,716 B | **Master vector**, transparent | — (source; exact twin of the PNG below) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/branding/axolotl.png` | PNG 1024×1024 RGBA, 47,681 B, md5 `4527bb…` | Render of the SVG | **Titlebar** (`AxolotlLogo.vue`), onboarding welcome |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axolotl.png` | identical bytes to the above | — | Splash, Settings footer, Skins sign-in card, AccountsCard placeholder, `index.html` favicon |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/axolotl-macos.svg` | SVG viewBox 1024², 11,113 B | macOS tile: `<rect x=100 y=100 w=824 h=824 rx=185 fill=#FFFFFF>` + the same art `translate(100 100) scale(1.45351914)` | Source art only (not referenced by build config) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/Axolotl.icon/Assets/AXL(fixed).svg` | SVG viewBox 566.9², 10,781 B | Same art with the **back-left gill cluster nudged/shrunk** (polygons 19–29) so it fits the macOS 26 mask | Icon Composer bundle `Axolotl.icon` |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/Axolotl.icon/icon.json` | JSON | macOS 26 icon recipe (gradient + layer transform) — §2.6 | → compiled `AxolotlAssets.car` |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/AxolotlAssets.car` | Asset catalog, 1.28 MB | Compiled macOS icon | `tauri.conf.json` bundle icons |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/icon.png` | PNG 512×512 transparent (art bbox 44,126–459,428) | Separate export | Default icon for desktop shortcuts the app creates (`apps/app/src/api/shortcuts/mod.rs` L28) |
| `.../apps/app/icons/32x32.png`, `64x64.png`, `128x128.png`, `128x128@2x.png` (256) | PNG transparent | Sizes | Tauri bundle; `128x128.png` also the Windows installer logo (`apps/installer-ui/src/windows.rs` L37) and README |
| `.../apps/app/icons/icon.icns`, `icon.ico`, `favicon.ico` | ICNS / ICO (6 sizes each) | Platform icons | Tauri |
| `.../apps/app/icons/Square30x30Logo.png` … `Square310x310Logo.png`, `StoreLogo.png` (50) | PNG transparent | Windows tiles | — |
| `.../apps/app/icons/ios/AppIcon-*.png` (20 → 1024, e.g. `AppIcon-512@2x.png` 1024²) | PNG **opaque white background** | iOS set | — |
| `.../apps/app/icons/android/mipmap-*/ic_launcher*.png` (48 → 432) | PNG transparent | Android set | — |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/website/src/public/axolotl.png` | PNG 256×256 (= `128x128@2x.png`, md5 `49637f…`) | Website logo | Header wordmark, favicon (`favicon.ico` and `favicon-light.ico` are this same PNG renamed) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axolotl-run/axolotl.webp` | WebP 200×142 | Raster sprite, **mirrored (faces right)** | Axolotl Run mini-game (§3.2) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/lab/recipe-generator/assets/datapack.png` | PNG 512×512 | **Gold** axolotl + black heavy sans "AXOLOTL" below | `pack.png` written into generated data packs (`lab/recipe-generator/datapack.ts` L89 via `datapack-icon.ts`) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/public/models/axl_label.glb` | GLB 11.6 KB (Blender) | **Unused** 3D extruded "AXL" letters (light grey) on a pink-purple outline backplate (§2.5.5) | Commented out in `AboutScene.vue` |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/nsis/assets/sidebar.bmp` (164×314), `header.bmp` (150×57) | BMP | Pre-rendered lockups for the NSIS installer (§2.5.4) | NSIS |

Is there a clean vector? **Yes** — `axolotl.svg` (and the two variants). **There is no vector wordmark**: the word "Axolotl" is always live text in the UI font (or baked into bitmaps).

### 2.3 The titlebar logo (component + exact sizing)

Rendered by `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AxolotlLogo.vue`:

```vue
<div aria-label="Axolotl"
     class="flex h-full items-center gap-2 font-extrabold text-[var(--color-text-primary)]">
  <img aria-hidden="true" class="aspect-square h-full object-contain" :src="axolotlVisual" />
  <span v-if="!iconOnly" class="hidden text-sm tracking-wide xl:inline">Axolotl</span>
</div>
<!-- import axolotlVisual from '@modrinth/assets/branding/axolotl.png' -->
```

Mounted in `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/App.vue` (L3085–3115):

```vue
<div data-tauri-drag-region class="app-grid-statusbar bg-surface-bar h-[--top-bar-height] flex">
  <div class="flex min-w-0 flex-1 overflow-hidden p-3">
    <div class="flex shrink-0 items-center gap-2">
      <AxolotlLogo class="h-full w-auto shrink-0 pointer-events-none" />
      <span v-if="isBetaBuild" class="… rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Beta</span>
    </div>
    <div class="flex shrink-0 items-center gap-1 ml-3"> <!-- back / forward -->
      <button class="… bg-surface-4 rounded-full w-6 h-6 hover:brightness-75"><LeftArrowIcon /></button>
      <button class="…"><RightArrowIcon /></button>
    </div>
    <Breadcrumbs class="pt-[2px]" />   <!-- "主页" (app.home.breadcrumb) -->
  </div>
  <section class="flex shrink-0 ml-auto items-center"> <AppActionBar/> <WindowControls/> </section>
</div>
```

Resolved geometry (light theme):
- Bar height `--top-bar-height: 3rem` = **48 px**, background `--surface-bar` = `--surface-3` = `#f8f8f8` (dark `#262b34`). On macOS `.mac .app-grid-statusbar { padding-left: 5rem }` (80 px) clears the traffic lights (App.vue L4007).
- Inner padding `p-3` = 12 px → logo row is **24 px** tall.
- Logo `<img>`: **24 × 24 px** box (`aspect-square h-full`); visible art ≈ **19.4 × 14.1 px**, centred ~1 px below the box centre.
- Gap logo → text `gap-2` = 8 px. Text "Axolotl": **14 px / 20 px, weight 800, letter-spacing 0.025em**, colour `--color-text-primary` = `#1a202c` (dark `#ffffff`), font = UI stack (Inter). Hidden below the Tailwind default `xl` breakpoint (**viewport < 1280 px** shows only the axolotl).
- Then `ml-3` (12 px) → two **24 px round** nav buttons (`bg-surface-4` = `#ffffff`), `gap-1`; their arrows are `LeftArrowIcon`/`RightArrowIcon` at 1em (≈16 px). Then the breadcrumb ("主页").
- Verified against `ref/launcher-home.png` (crop `_scratch/titlebar-crop.png`): traffic lights · axolotl · **Axolotl** · (←)(→) · 主页.

### 2.4 Other in-app logo placements

| Where | Spec | Source |
|---|---|---|
| **Splash screen** (app start) | Forced `dark` scope. Logo `height: min(18rem,45vh)` × `width: min(18rem,45vw)` (≤288 px), `gap-4` above a `ProgressBar max-w-xs` (320 px) + optional message (正在检查更新…… / 正在更新应用目录……). Layers bottom→top: `bg-bg` (z 9995) → `loading/cube.png` (`background-size: contain`, 180vw×180vh, opacity .8, on `--surface-1`, z 9996) → gradient `linear-gradient(180deg, rgba(255,77,157,.24) 0%, rgba(48,16,40,.56) 97.29%), linear-gradient(0deg, rgba(22,18,28,.68), rgba(22,18,28,.68))` (z 9997) → logo/progress (z 9998). Min display 500 ms; leaves with `opacity` 0.3 s ease-in-out. | `apps/app-frontend/src/components/ui/SplashScreen.vue` |
| **Settings footer** | 36 px rounded-lg button (`size-9`) holding the logo at 32 px (`size-8`); click toggles developer mode (logo area turns `text-brand`). Two lines: "Axolotl Launcher {version}" / "{platform} {osVersion}". | `apps/app-frontend/src/pages/Settings.vue` L476–488 |
| **About hero** (设置 › 关于) | 256 px tall (`h-64`), `rounded-xl` box hosting the **3D swimming axolotl** (§3.1), bottom 3% mask fade; below: h2 "关于 Axolotl Launcher" (`text-xl font-semibold`), "版本 {version}", then "你的最后一款启动器。". Clicking team members swaps the box for the mini-games. | `apps/app-frontend/src/components/ui/settings/AboutSettings.vue` L333–365 |
| **Onboarding welcome** (first run) | `AxolotlLogo icon-only` in a `clamp(7rem,15vw,11rem)` square + animated wordmark — §2.5.1 | `apps/app-frontend/src/components/ui/onboarding/OnboardingWelcome.vue` |
| **Skins page, signed-out card** | `axolotl.png` 144×144 (`h-36 w-36`) **perched on top** of the card: `absolute -top-32 right-8 md:right-20`; card `bg-surface-3 rounded-lg p-7 shadow-lg`; title 请登录 | `apps/app-frontend/src/pages/Skins.vue` L1287–1300 |
| **Accounts card** | `axolotl.png` as the avatar placeholder when no account is selected | `apps/app-frontend/src/components/ui/AccountsCard.vue` L52, L399, L769 |
| **Library empty state** | `NewInstanceImage` (axolotl with a cyan "+" thought bubble, §3.4) at 160×160, h3 未找到实例, brand button [`PlusIcon`] 创建新实例 | `apps/app-frontend/src/pages/library/Index.vue` L76–90 |
| **Browser favicon** | `<link rel="icon" href="/src/assets/axolotl.png">` | `apps/app-frontend/index.html` L5 |

### 2.5 Wordmarks & lockups

#### 2.5.1 Onboarding welcome reveal (the product's own brand animation) — best end-card reference
`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/onboarding/OnboardingWelcome.vue` (template L130–145, styles L211+):

- Lockup: `[logo] [Axolotl][Launcher]`, centred; gap `clamp(0.75rem, 2vw, 1.5rem)` (24 px at 1920 w). Background `var(--color-bg)` = `--surface-1` = `#ebebeb` (dark `#101215`).
- Logo box `clamp(7rem, 15vw, 11rem)` → **176 px** at ≥1174 px wide.
- Wordmark: **72 px (4.5rem), line-height 1, letter-spacing 0**, words gap 0.35em. "Axolotl": weight **800**, gradient text `linear-gradient(90deg, var(--color-text-primary), var(--color-text-default))` (light `#1a202c → #2c2e31`, dark `#ffffff → #b0bac5`). "Launcher": weight **650**, colour `--color-text-tertiary` (`#484d54` / dark `#96a2b0`). Responsive: 56 px at 701–1000 px wide; 40 px ≤700 px.
- **Timeline** (t = 0 at mount):

| t (ms) | What | Easing |
|---|---|---|
| 0 → 900 | Logo pop: `opacity 0, scale .72` → 65%: `opacity 1, scale 1.04` → `scale 1` | `cubic-bezier(0.16,1,0.3,1)` |
| 900 → 1950 | Wordmark container wipe `max-width 0 → 42rem`; each word `translateX(-4rem) opacity 0 → 0, 1` | `cubic-bezier(0.16,1,0.3,1)` |
| 2050 → 2750 | "Axolotl" **brand scan**: a `::after` copy in `var(--color-brand)` (pink) covers the word, holds 12%, then `clip-path: inset(0 0 0 0) → inset(0 0 0 100%)` (pink wipes away left→right) | `cubic-bezier(0.22,1,0.36,1)` |
| 2400 → 3100 | Same scan on "Launcher" | same |
| 0 → 3200 | Whole lockup stays at `top:50%` until 70% (2240 ms), then lifts to `top: clamp(9rem,33vh,18rem)` | `cubic-bezier(0.22,1,0.36,1)` |
| 3200 → 3850 | Bottom panel slides up (`translateY(100%) → 0`, opacity 0→1), `background: var(--surface-3)`, top border `--color-divider`, plus a **2 px brand-pink line** at its top-left, width `clamp(4rem,12vw,10rem)` | `cubic-bezier(0.22,1,0.36,1)` |

`prefers-reduced-motion` disables all of it (useful as a static end-card layout reference).

#### 2.5.2 Website header wordmark
`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/website/src/components/brand/AxolotlWordmark.vue` (used by `components/ui/AxolotlHeader.vue` L77): `inline-flex items-center gap-2.5` (10 px); text **22 px (1.375rem), weight 800, line-height 1, letter-spacing −0.035em**, colour `--color-contrast`; logo `/axolotl.png` 32×32 with `filter: drop-shadow(0 0.35rem 0.7rem rgb(245 139 174 / 22%))` (pink glow `#F58BAE`).

#### 2.5.3 Website `LogoAnimated` (unused in pages, but a ready-made brand motion)
`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/website/src/components/brand/LogoAnimated.vue`: logo 80×80 (5rem), `drop-shadow(0 0.75rem 1.5rem rgb(245 139 174 / 28%))`, keyframes `float` **3.5 s ease-in-out infinite**: `translateY(0) rotate(-2deg)` ↔ 50% `translateY(-0.4rem) rotate(2deg)`. A perfect idle "breathing" for an end-card logo.

#### 2.5.4 Installer lockups
- **NSIS sidebar** `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/nsis/assets/sidebar.bmp` (164×314): bg `#1d1f23`, **4 px pink stripe `#f472b6` on the left edge**, the axolotl, uppercase bold "AXOLOTL" (white) / "LAUNCHER" (`#96a2b0`), small caps tagline "MINECRAFT, ORGANIZED" (`#96a2b0`).
- **NSIS header** `.../nsis/assets/header.bmp` (150×57): bg `#16181c`, small axolotl + "Axolotl" (bold white) / "Launcher" (grey).
- **WebView installer** `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/installer-ui/src/installer.html`: dark `#09090b`, brand `#f472b6` / strong `#ec4899`; two blurred glow orbs (`filter: blur(120px)`): pink top-right 50vw at opacity .55 (`float1` 10 s) and violet `#8b5cf6` bottom-left 40vw (`float2` 14 s alternate); while installing they switch to `#ec4899` + `#a855f7` at .7 with 4 s / 3 s flows. Titlebar logo 22×22 + name 14 px/700 with gradient text `#fff → #a1a1aa`. Completion logo tile: radius 16, `box-shadow: 0 8px 32px rgba(244,114,182,.4), inset 0 1px 0 rgba(255,255,255,.2)`.

#### 2.5.5 Unused 3D "AXL" label
`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/public/models/axl_label.glb` — Blender text meshes "文本" (letters) and "文本.001" (outline plate, offset −0.041 on X, ~0.05 larger). Materials: letters `baseColorFactor 0.8,0.8,0.8` (≈ `#E7E7E7` sRGB) roughness .73; plate `0.80,0.34,0.75` (≈ `#E79EE0` sRGB, computed from linear). Heavy geometric sans "A X L", extrusion depth 0.08. Previews: `_scratch/axl-label-persp.png`. Loader code is commented out in `AboutScene.vue` (scale ×8, `rotateY(-π/2)`, position (0, 5.2, 0)).

#### 2.5.6 Data-pack icon
`datapack.png` (§2.2): gold-morph axolotl (same voxel art recoloured, palette like `yellowball.png`) above a black, very heavy sans "AXOLOTL" (≈ 85% of width). A ready-made "Minecraft item" for the recipe / data-pack beat.

### 2.6 App-icon treatments

| Platform | Look | Spec |
|---|---|---|
| **macOS 26 (Tahoe) Dock** | Axolotl on a squircle with a **vertical gradient: white at the bottom → `#FED6EB` from 30% height up** (display-p3 (0.99608, 0.83922, 0.92157)); art layer scale 1.6, translated (0, −21 pt); neutral shadow 0.5; translucency 0.5 | `apps/app/icons/Axolotl.icon/icon.json`; approximation `_scratch/macos26-icon.png` |
| macOS (pre-26) | White rounded tile 824/1024 (rx 185) + art | `axolotl-macos.svg` |
| iOS | Opaque white square | `ios/AppIcon-512@2x.png` |
| Windows / Linux / Android | Transparent background | `icon.ico`, `Square*Logo.png`, `mipmap-*` |

### 2.7 Look-alikes that are NOT the Axolotl brand (never use)

| File | What it is |
|---|---|
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/branding/logo.svg` | **Modrinth wrench-in-labyrinth logo** (512×514, `currentColor`), still exported as `ModrinthIcon` (`packages/assets/index.ts` L12/61) and shown for "Modrinth" source chips (Browse/Downloads) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/icons/omorphia.svg` | `OmorphiaIcon` — Modrinth design-system mark (unused) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/.github/assets/app_cover.png`, `web_cover.png`, `api_cover.png`, `monorepo_cover.png` | Modrinth README banners ("modrinth app / theseus", "knossos", "labrinth") |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/.github/assets/codeflow-logo.png` | Sponsor (Codeflow) logo |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/loading/cube.png` | Dark navy isometric **labyrinth cube** behind the splash — inherited Modrinth App splash art, labyrinth motif **(inferred origin)** |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/instance-icons/modrinth-3d/*` | Modrinth-made 3D icon set (incl. `wrench-rinth.png` "Modrinth Wrench", `mr-pack.png`) |

---

## 3. Mascot & illustration assets

### 3.1 3D axolotl model + About scene
- **File:** `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/public/models/axolotl.gltf` (61,263 B, glTF 2.0, "Blockbench 5.1.6 glTF exporter"; buffers and texture embedded as data URIs).
- **Rig:** 21 nodes, pivot-parent pairs: `head`, `top_gills`, `left_gills`, `right_gills`, `body` (2 meshes), `leg1`–`leg4` (each rotated 65° about X), `tail` (yaw −12.5°). No skin/bones — rigid parts. Units: 1 = 16 Minecraft pixels; bounds X −0.4375…0.4375, Y 0…0.75, Z −0.625…1.0625 (≈ 14 × 12 × 27 px voxels).
- **Material/texture:** single 64×64 PNG, **nearest filtering** (mag/min 9728), clamp; `alphaMode MASK` (cutoff 0.05), double-sided, metallic 0 / roughness 1. Texture follows the vanilla Minecraft axolotl UV layout (pink/lucy morph): `#fbc1e3`, `#e384bc`, `#f3add6`, `#c8629e`, `#b14283`, `#d64e8a`, eyes `#3a006c`. Extracted: `_scratch/axolotl-gltf-texture-x8.png`; render: `_scratch/axolotl-gltf-render.png`.
- **Animation:** one clip **`swim`** (10 channels, 0–9.42/10 s, LINEAR, 21–182 keys per channel): head pitch up to 11°, top gills 11°, side gills flap up to 15° (left/right mirrored), body bob +0.019 units (≈0.3 px), legs fold back and paddle (up to 160° from rest), tail sway up to 25°.
- **How the app stages it** (`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AboutScene.vue`): three.js, `PerspectiveCamera(30°)` at (−10, 5, 30); model ×5, `rotateY(π/2)`, y −2.5; per frame `y = y0 + sin(t)`, `rotation.y = sin(0.3t)·0.2 + 100°`; three shader water planes (120×16) tinted by `--color-brand` ×2.4 (light) / ×0.6 (dark); rising ring "bubbles" (0.6×0.6 planes) every `rand·0.8 s`, +2 units/s, tinted brand ×3 (light) / ×1.2 (dark); mouse parallax on the camera (±1 x, ±0.5 y). Canvas background `linear-gradient(to bottom, color-mix(in srgb, var(--color-brand) 36%, var(--surface-1)), transparent 40%)`.

### 3.2 Axolotl Run — 美西螈快跑 (Chrome-dino style runner)
- **Where:** an About-page easter egg (team-member click; hint 点击以打开彩蛋小游戏). Component `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AboutAxolotlRun.vue` (canvas, all sprites inlined via `?inline`).
- **Assets** `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axolotl-run/`: `axolotl.webp` (200×142, the logo axolotl **facing right**) + 22 vanilla Minecraft 16×16 item/block textures: `brain_coral, bubble_coral, fire_coral, horn_coral, tube_coral, clay, conduit, diamond, dolphin (18×18), golden_apple, kelp, kelp_plant, milk, potion_slow, potion_swift, pufferfish, sea_lantern, seagrass, stew, tnt, totem, trident`. Sheet: `_scratch/axolotl-run-sheet.png`.
- **Personality constants — reuse for the button's squash & stretch:**

```ts
const PLAYER_W = 52, PLAYER_H = 37            // sprite drawn 52×37 in a 256-px-tall world
const GRAVITY = 2300, JUMP_VELOCITY = 520, HOLD_GRAVITY_FACTOR = 0.55
const bob     = running ? Math.sin(t * 15) * 1.4 : 0           // px
const v       = clamp(player.vy / JUMP_VELOCITY, -1, 1)
const stretch = 1 + v * 0.1 - landImpulse * 0.16                // scaleY
const squash  = 1 - v * 0.1 + landImpulse * 0.2                 // scaleX
const tilt    = running ? Math.sin(t * 15) * 0.04 : -v * 0.16   // radians
// landImpulse = impact on landing, decays 4.5/s; transform origin = feet
```

- **Look:** underwater day/night sky gradient (48 s cycle): night top `rgb(10,37,64)`/mid `rgb(18,58,94)`; noon top `rgb(16,98,152)`/mid `rgb(56,150,192)`; coral colours `#7fd4ff #ff6b6b #c96bff #ffd24a #ff7fb5`; splash `#ceecff`; shield/totem gold `#ffd75e`/`#ffdf6b`; pixel heart HUD.
- **zh-CN UI:** 美西螈快跑 · 按空格或点击开始 · 轻点为小跳，按住可高跳 · 得分：{score} · 最佳：{score} · 游戏结束 · 新纪录！ · 重新开始 · 退出游戏 · power-ups 潮涌核心 / 海豚的恩惠 / 不死图腾 / 迅捷 / 迟缓 / 钻石 / 牛奶 / TNT / 迷之炖菜 · 连击 {count} · 连锁！

### 3.3 Merge game — 合成美西螈 (Suika-style) and the axolotl "balls"
- Component `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AboutMergeGame.vue`; assets `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axolotl-balls/` — six 2054×2054 PNG discs, each the voxel axolotl in a colour morph inside a glossy circular badge (soft tinted radial background, white top highlight). Merge order (level 0→5): **`pinkball.png` → `yellowball.png` → `cyanball.png` → `redball.png` → `blueball.png` → `superball.png`** (rainbow, 1 MB). Radius ratios `[0.055, 0.075, 0.098, 0.128, 0.164, 0.21] × min(w,h)`; the rainbow ball pulses `1 + 0.05·sin(3.2t)` with a glow. Sheet: `_scratch/axolotl-balls-sheet.png`.
- zh-CN: 合成美西螈 · 点击场地，投放粉色美西螈 · 潮水正在退去，别让美西螈搁浅！ · 美西螈搁浅了！ · 彩虹美西螈！ · 潮水大涨！ · 水位回升，继续合成！ · 结算.
- Film use: **`pinkball.png` is a round, pink, glossy, brand-native object** — an excellent "the button curls into a ball" transformation target.

### 3.4 Onboarding guide mascot & empty-state art (all original vector, same voxel style)

| File | Look | Used |
|---|---|---|
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axo-searching.svg` (viewBox 786.4×652) | Axolotl holding a **pixel magnifying glass** (dark grey frame, lavender lens) | Onboarding dialogue mascot (random 1 of 2), alt text 引导吉祥物 |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axo-teaching.svg` (786.4×652) | Axolotl wearing a **grey mortarboard with gold tassel**, holding a brown book | Onboarding dialogue mascot |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/icons/new-instance.svg` (= byte-identical `add-project.svg`) (786.4×652) | Axolotl with a **cyan "+" tile and two small cyan square "thought bubbles"** | Library empty state (`NewInstanceImage`, 160×160) |

`OnboardingMascotStage.vue` sizes the mascot `clamp(6rem, 11vw, 9rem)` wide (`apps/app-frontend/src/components/ui/onboarding/OnboardingMascotStage.vue`). Repo rule: future mascot art goes only through `OnboardingMascotStage` (AGENTS.md). Preview: `_scratch/mascots.png`. Great fits: **searching** pose → search-box scene; **"+" pose** → "create instance".

### 3.5 Lab covers (`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/lab/`)
Every cover = a Minecraft render background + a **centred solid-white glyph** (thick rounded strokes, a thin dark knock-out edge). In the current Lab page each card shows its cover at `w-56` (224 px) `aspect-[2/1]` (224×112), `rounded-[var(--radius-lg)]` (16 px), `object-cover` (`apps/app-frontend/src/pages/Lab.vue` L283–296). Registry order (`apps/app-frontend/src/lab/registry.ts`):

| Tool (zh title · id · category) | zh description (verbatim) | Cover | Background | Glyph | Fallback icon |
|---|---|---|---|---|---|
| **皮肤编辑器** · skin-editor · 创作 | 在本地创建和编辑 Minecraft 玩家皮肤。 | `skin-editor-tool-cover.png` 768×382 | Night sky with stars, five armour stands (diamond/iron/gold/…) | T-shirt + pencil | `PencilIcon` |
| **渐变文字生成器** · gradient-text · 创作 | 无需浏览器即可创建适用于 Minecraft 的渐变文字。 | `gradient-text-tool-cover.png` 1282×638 | Near-black (avg `#171d23`) static/starfield with green pixel-font **End Poem** lines | Heavy "#HEX" + text I-beam + 4-point sparkles | `PaletteIcon` |
| **种子地图** · seed-map · 世界 | 在本地查看 Minecraft 种子的群系、结构和保存的标记。 | `seed-map-tool-cover.png` 1278×636 | Top-down biome map: navy ocean, yellow beaches, green plains/forests, orange badlands | **Map pin** over rolling hills + 3 horizontal lines | `WorldIcon` |
| **投影工坊** · schematic-preview · 创作 | 快速预览、编辑你的投影 | `schematic-preview-cover.png` 770×383 | Light→dark isometric grid floor, redstone blocks/observers/pistons/dispensers wrapped in a **cyan wireframe hologram** | Projector on a tripod casting dashed rays onto a frame containing a cube | `BoxIcon` |
| **模组翻译** · mod-translation · 维护 | 把任意 Minecraft 模组 JAR 翻译成简体中文。 | `mod-translation-cover.png` 1780×884 | Open beige pixel-art Minecraft book (avg `#c5ac86`) | Document with "EN → 文" | `LanguagesIcon` |
| **配方生成器** · recipe-generator · 创作 | 轻易地修改合成表，自定义配方，生成数据包。 | `recipe-generator-tool-cover.png` 768×382 | Close-up isometric crafting tables / furnaces / stonecutters | Rounded square with 3×3 grid + centre sparkle | `BlocksIcon` |

Also in the folder: `minecraft-preview.png` (1920×1200 **in-game Minecraft screenshot**: grassy dirt terraces, oak/birch forest, clear blue sky — backdrop of the gradient-text chat preview, `LabGradientText.vue` L40) → the only "inside the world" plate in the repo, ideal for the **进入世界** finale; `gradient-text-tool-light.png` / `-dark.png` (220×212 gradient "TEXT" thumbnails, unused); `Minecraft_AE.ttf` (§5). Lab strings: 实验室 · {count} 个工具 · 搜索工具 · 全部工具 / 创作 / 维护 / 世界 · 进入 · 加入收藏 / 取消收藏.
Sheets: `_scratch/lab-covers.png`, `_scratch/cover-centers.png`.

### 3.6 Instance icons (`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/instance-icons/`)
- **Default/fallback logic** (`apps/app-frontend/src/helpers/instance-icons.ts`): an instance without a custom icon shows a loader icon, drawn **frameless** (no border/background/radius): vanilla → `grass-block.png`; fabric / legacy_fabric / babric → `Fabric.png`; forge → `anvil.png`; neoforge → `NeoForge.png`; quilt → `Quilt.png`; optifine → `OptiFine.png`; cleanroom → `Cleanroom.png`; lite_loader → `LiteLoader.png`; any other loader → `stone.png`. If there is no loader at all, the `Avatar` shows its **built-in isometric cube outline** (below) — this is the grey cube seen next to "Cobblemon…/RLCraft" in `launcher-home.png`.
- **Avatar fallback cube** (`E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/ui/src/components/base/Avatar.vue` L19–43), a perfect Minecraft-flavoured vector prop:

```html
<svg viewBox="0 0 104 104" stroke-linecap="round" stroke-linejoin="round">
  <path fill="none" stroke="#9a9a9a" stroke-width="5"
        d="M51.7 92.5V51.7L16.4 31.3l35.3 20.4L87 31.3 51.7 11 16.4 31.3v40.8l35.3 20.4L87 72V31.3L51.7 11"/>
</svg>
```

  Avatar box: default 2rem, `border 1px var(--surface-5)` (`#dddddd`), bg `var(--surface-4)` (`#ffffff`; with `tintBy`: `color-mix(in oklch, surface-4, oklch(50% 75% <hue>) 5%)`), radius `16/96 × size`, `box-shadow: var(--shadow-card)` = `rgba(50,50,100,.1) 0 2px 4px`.
- **Generic set (picker "built-in")**, 1024² renders of vanilla items/blocks: `bread, carrot, cooked-chicken, crafting-table, diamond-axe, diamond-block, diamond-sword, end-stone, furnace, glass-bottle, gold-block, golden-apple, grass-block, iron-block, item-frame, netherrack, oak-sapling, stone, totem-of-undying, water-bucket` + `anvil.png` and `command-block.png` (300²) + loader logos `Cleanroom.png, Fabric.png, Forge.jpeg, LiteLoader.png/.svg, Mojang.svg, NeoForge.png, OptiFine.png, Paper.svg, Quilt.png`. Sheet: `_scratch/instance-icons-generic.png`.
- **`modrinth-3d/` set** (45 × 600² isometric renders: backpack … zombie, incl. `wrench-rinth`, `mr-pack`) — Modrinth-made; avoid (§6). Sheet: `_scratch/instance-icons-modrinth3d.png`.

### 3.7 Seed-map assets (`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/public/seed-map-assets/`)
- `structures/*.webp` — 27 × 80×80 **sticker-style markers** (white outline + soft drop shadow): amethyst_geode, ancient_city, bastion_remnant, buried_treasure, desert_pyramid, desert_well, end_city(+_ship/_no_ship), end_gateway, igloo, jungle_temple, mineshaft, nether_fortress, ocean_monument, ocean_ruin, pillager_outpost, ruined_portal, shipwreck, slime_chunks, spawn_point, stronghold, swamp_hut, trail_ruin, trial_chambers, village, woodland_mansion. On the map they're drawn at 28 px (32 selected), `shadow rgba(0,0,0,.48) blur 5 offsetY 2`, selected adds a 2 px white ring; completed ones fade to α .48 with a green check badge (`#1BD96A` r 7). Feature colours: `apps/app-frontend/src/lab/seed-map/visuals.ts`.
- `biomes/*.webp` — 65 × 512² **floating-island biome dioramas** (cherry grove, mushroom fields, deep dark, …).
- `ores/*.png` — 10 × 300² isometric ore/raw-block cubes; `ores/ore-flat/*.png` — 15 × 16² flat ore textures.
- **User marker (the "map marker" the button can become)** — canvas-drawn in `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/pages/LabSeedMap.vue` L1349–1380:

```ts
ctx.fillStyle = marker.color            // user-chosen via <input type=color>, default '#22C55E'
ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2
ctx.arc(x, y - 3, 7, 0, 2 * Math.PI)    // head: r = 7 px, centre 3 px above the point
ctx.moveTo(x - 4, y + 2); ctx.lineTo(x, y + 11); ctx.lineTo(x + 4, y + 2)   // tail tip 11 px below
// label: '600 11px system-ui', white text on rgba(20,22,26,.86) rect, 22 px tall, at (x+10, y-12), 5 px side padding
```

  The "add marker" button is brand-coloured `size="2xs"` with `PinIcon` (pushpin) + 添加标记 (§4). Strings: 标记 · 标记名称 · 标记颜色 · 标记已保存. Sheets: `_scratch/seedmap-structures.png`, `seedmap-biomes.png`, `seedmap-ores.png`.

### 3.8 Other image assets

| Path (absolute) | Content | Note |
|---|---|---|
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/lab/schematic-preview/assets/vanilla/texture-atlas.png` + `texture-layout.json` | 2048×2128 atlas, **2,859 named textures** (`block/grass_block_top` → `[432,1968,16,16]`, `block/grass_block_side` → `[944,1984,16,16]`, `block/dirt` → `[1680,1904,16,16]`, `block/stone`, `block/oak_planks`, `block/crafting_table_front`, `block/tnt_side`, `block/diamond_block`, `block/pink_wool`, `block/cherry_leaves`, …) | Build CSS-3D blocks from this. `grass_block_top`/`oak_leaves` are **untinted grey** — apply a grass tint, e.g. plains `#91BD59` **(inferred, vanilla biome colour)**. Sample: `_scratch/atlas-samples.png` |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/lab/recipe-generator/assets/texture-atlas.png` + `.json` | 2048×1312 item atlas (2,566 hashed keys) | Less convenient (hashed names) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/lab/recipe-generator/bg/{切石机,合成,熔炼,篝火,锻造}.png` | 696-wide Minecraft-GUI-style recipe layouts (stonecutter, crafting 3×3 → result, smelting, campfire, smithing) | Recipe-generator visuals |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/models/classic-player.gltf` / `slim-player.gltf` (+ `.fbx`) | Minecraft player rig (Blockbench → C4D → FBX2glTF), clips `idle`, `idle_sub_1..3`, `interact`, `CINEMA_4D_Main`; skin applied at runtime | Skins page 3D preview (`packages/ui/src/components/skin/SkinPreviewRenderer.vue`) — a candidate "player entering the world" |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/skins/steve.png`, `herobrine.png` | 64×64 skin textures | Mojang default skin / community skin |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/ui/src/assets/minecraft-armor/**` | 132 vanilla armour/trim/item textures | Skin editor armour preview |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/multiplayer/hongshi.png` (300², red block), `terracotta.png` (256², glazed terracotta) | Multiplayer provider icons (陶瓦联机 etc.) | — |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/illustrations/*.svg` (13, viewBox 250×200) | Empty-state illustrations (done, empty-inbox, error, no-connection, no-search-result …) built from `var(--surface-1..4)` "speed-line" blobs — theme-adaptive grey | Inherited Modrinth UI art; generic (`EmptyState.vue`) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/external/illustrations/minecraft_server_icon.png` | 128² greyscale Minecraft landscape | Fallback server/notification icon |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/external/*`, `java-vendors/*`, `packages/assets/external/*`, `apps/website/src/assets/images/external/*` | Third-party logos (Discord, GitHub, Microsoft, QQ, Ko-fi, afdian, Oracle, Azul, CurseForge, Prism, MultiMC, GDLauncher, ATLauncher, …) | Trademarks — avoid |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/data/about/avatars/*`, `public/easteregg/avatars/cyf112233.jpg` | Real contributors' avatars | Personal likeness — do not use |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/website/src/public/showcase/{account-login,axolotl-lab,theme-accent}.png` (3104×1814) + `launcher-home.webp` (2560×1489, also the OG image) | Hi-res versions of the reference screenshots | Use as high-res reference |

---

## 4. Icon system

### 4.1 Style & rendering rules
- **Source & export:** SVGs in `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/icons/` (+ `icons/tags/{categories,loaders}/`, `icons/badges/`), auto-exported as Vue functional components by `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/generated-icons.ts` (447 imports: `import _HomeIcon from './icons/home.svg?component'` → `export const HomeIcon`). Naming: kebab file → `PascalCase + "Icon"`; tag icons get `TagCategory…Icon` / `TagLoader…Icon`. Full map: `E:/GitHub/Axolotl-animation/research/_scratch/icon-map.tsv`. README: "Axolotl uses the Lucide icon set" (dev dep `lucide-static ^0.562.0`). No `lucide-vue-next` import anywhere — every icon comes from `@modrinth/assets`.
- **Style:** Lucide/Feather outline. Of 295 plain icons: **287 use `viewBox 0 0 24 24`**, **282 use `stroke-width 2`**, `stroke="currentColor"`, `fill="none"`, **`stroke-linecap/linejoin: round`**. 179 are tagged lucide (several newer v0.562 glyphs), 8 Feather, the rest untagged older Lucide/Feather/Heroicons-outline copies.
- **Exceptions to know:** `x.svg` (`XIcon`, the close ×) is a **filled Heroicons mini 20×20**; `cube.svg`, `cog.svg`, `cloud.svg` are filled 20×20; `change-skin.svg` is custom (viewBox 49.915×52.72, strokes 4.331/3.993 ≈ 2 px at 24 px, root `transform="scale(-1 1)"` mirrors it — keep that when inlining); `spinner.svg` is a two-tone Tailwind-style spinner (ring stroke 4 @ 25% + filled arc @ 75%, spun with `animate-spin` = 1 s linear infinite); `online-indicator.svg` 18×18 filled; `download.svg` is Heroicons-outline geometry; `server.svg` is actually Lucide **hard-drive**; `world.svg` is Lucide **earth**; **`sparkles.svg` contains Lucide "file-pen"** (that is what 每日小挑战 shows).
- **Sizing & colour:** global `svg { width: 1em; height: 1em }` (`E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/styles/defaults.scss` L56) → icons follow `font-size`; colour = `currentColor`. Nav icons are **24 px** (`text-2xl`). Buttons: `[&>svg]:size-4` (2xs–sm), `size-5` (md/lg), `size-6` (xl) (`packages/ui/src/components/base/buttons/ButtonFrame.vue` L33–38).

### 4.2 Sidebar navigation (left rail) — exact mapping
Source: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/App.vue` L2924–3083 (code order). Tooltip strings from `apps/app-frontend/src/locales/zh-CN/index.json` (settings from `packages/ui/src/locales/zh-CN/index.json`).

| # | Route | Component | SVG file (absolute) | zh tooltip (message id) | Default visibility |
|---|---|---|---|---|---|
| 1 | `/` | `HomeIcon` | `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/icons/home.svg` | 主页 (`app.navigation.home`) | shown |
| 2 | `/screenshots` | `ImagesIcon` | `.../packages/assets/icons/images.svg` | 截图中心 (`app.navigation.screenshots`) | **shown in 1.9.7** (absent from the 1.6.0 screenshot) |
| 3 | `/worlds` | `WorldIcon` | `.../packages/assets/icons/world.svg` | 世界 (`app.navigation.worlds`) | hidden — `featureFlags.worlds_tab: false` |
| 4 | `/browse/…` | `CompassIcon` | `.../packages/assets/icons/compass.svg` | 发现内容 (`app.navigation.discover-content`) | shown |
| 5 | `/skins` | `ChangeSkinIcon` | `.../packages/assets/icons/change-skin.svg` | 皮肤选择器 (`app.navigation.skin-selector`) | shown |
| 6 | `/multiplayer` | `UsersIcon` | `.../packages/assets/icons/users.svg` | 多人游戏 (`app.navigation.multiplayer`) | shown |
| 7 | `/library` | `LibraryIcon` | `.../packages/assets/icons/library.svg` | 实例库 (`app.navigation.library`) | shown |
| 8 | `/lab` | `FlaskConicalIcon` | `.../packages/assets/icons/flask-conical.svg` | 实验室 (`app.navigation.lab`) | shown |
| 9 | `/downloads` | `DownloadIcon` | `.../packages/assets/icons/download.svg` | 下载 (`app.navigation.downloads`) | shown (auto-hide option); badge `absolute right-0 top-0 min-w-4 rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-white` |
| — | divider `h-px w-6 mx-auto my-2 bg-surface-5` → `QuickInstanceSwitcher` (instance avatars) | | | | |
| 10 | `/create` | `PlusIcon` | `.../packages/assets/icons/plus.svg` | 创建新实例 (`app.navigation.create-instance`) | shown |
| 11 | `/settings` | `SettingsIcon` | `.../packages/assets/icons/settings.svg` | 设置 (`label.settings`) | shown |
| — | Modrinth sign-in (`LogInIcon`) | | | | **never rendered** (`capabilities.privateModrinthServices: false`) |

Nav button states (`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/NavButton.vue`, `NavRail.vue`): 48×48 circles (`w-12 h-12 rounded-full text-2xl`), rail width `--left-bar-width: 4rem` (64 px), padding 8 px, gap 8 px. Idle icon colour `--color-text-default` `#2c2e31` (dark `#b0bac5`); hover `bg-surface-4` (`#ffffff`) + `--color-text-primary`; **active**: a shared sliding pill `bg-[--color-button-bg-selected]` = brand `#db2777` (dark: 25% brand highlight) moving with `top/bottom 150ms cubic-bezier(.4,0,.2,1)` and a **120 ms stagger** on the trailing edge (stretch-then-catch-up), icon `--color-button-text-selected` `#ffffff` (dark: brand) plus `filter: drop-shadow(0 0 0.5rem black)` on the active svg; sub-page state uses `bg-surface-4`.

### 4.3 Requested icons → component → file

All files under `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/icons/` unless a full path is given. Visual check: `_scratch/icons.png`, `_scratch/icons-lastrow.png`.

| Concept | Component | File | Notes / where it appears |
|---|---|---|---|
| home | `HomeIcon` | `home.svg` | Nav; seed-map village marker fallback |
| compass / discover | `CompassIcon` | `compass.svg` | Nav Discover |
| skins | `ChangeSkinIcon` | `change-skin.svg` | Nav Skins (hanger hook + shirt, mirrored). Alt `ShirtIcon` `shirt.svg` |
| friends / users | `UsersIcon` | `users.svg` | Nav Multiplayer; About 开发组 |
| library | `LibraryIcon` | `library.svg` | Nav Library (4 spines, last leaning) |
| lab / flask | `FlaskConicalIcon` | `flask-conical.svg` | Nav Lab |
| downloads / download | `DownloadIcon` | `download.svg` | Nav, action bar |
| settings / gear | `SettingsIcon` | `settings.svg` | Nav Settings (Feather gear). Alts `Settings2Icon`, `CogIcon` (filled) |
| plus | `PlusIcon` | `plus.svg` | Create instance, add widget |
| **play** | `PlayIcon` | `play.svg` — `<polygon points="5 3 19 12 5 21 5 3"/>` | Every 开始游戏 button; calendar icon-button tooltip **启动** (`app.home.calendar.play`) |
| stop | `StopCircleIcon` | `stop-circle.svg` (circle r10 + 6×6 square) | Stop buttons (`color="red"`), 停止. No plain stop-square; `SquareIcon` `square.svg` exists |
| spinner | `SpinnerIcon` | `spinner.svg` | Loading play button / quick-instance (`animate-spin`). Alts `LoaderCircleIcon` `loader-circle.svg`, `RefreshCwIcon` `refresh-cw.svg` (spins while restarting) |
| search | `SearchIcon` | `search.svg` | Lab 搜索工具, widget picker |
| filter | `FilterIcon` (funnel), `ListFilterIcon` (3 bars) | `filter.svg`, `list-filter.svg` | — |
| x / close | `XIcon` | `x.svg` (**filled**, 20×20) | Modal close, window close, action bar |
| check | `CheckIcon` | `check.svg` | Pickers. `CheckCircleIcon` `check-circle.svg` |
| chevrons | `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `DropdownIcon` | `chevron-down.svg`, `chevron-left.svg`, `chevron-right.svg`, `chevron-up.svg`, `dropdown.svg` | Calendar month nav, Lab 进入 button, selects |
| arrows | `LeftArrowIcon`, `RightArrowIcon`, `ArrowUpRightIcon` | `left-arrow.svg`, `right-arrow.svg`, `arrow-up-right.svg` | Titlebar back/forward; 查看全部实例 → |
| more (kebab) | `MoreVerticalIcon` | `more-vertical.svg` (3 dots r=1) | ⋮ on instance cards/rows. Same glyph `EllipsisVerticalIcon`; `MoreHorizontalIcon` |
| map-pin | *(no MapPinIcon)* → `TagCategoryMapPinnedIcon` / `MapIcon` / `PinIcon` | `tags/categories/map-pinned.svg` (pin over map base), `map.svg`, `pin.svg` (pushpin) | `PinIcon` = 添加标记 + pinned instances. Real map marker is canvas-drawn (§3.7) |
| box / package / cube | `BoxIcon`, `PackageIcon`, `PackageOpenIcon`, `CubeIcon`, `BlocksIcon`, `BoxesIcon` | `box.svg`, `package.svg`, `package-open.svg`, `cube.svg` (filled), `blocks.svg`, `boxes.svg` | `BoxIcon` = **mod** project type & schematic tool; `PackageOpenIcon` = modpack; `BlocksIcon` = recipe tool |
| puzzle (mods) | *(none in the set)* | — | Mods are represented by **`BoxIcon`** (`PROJECT_TYPE_ICONS.mod`, `packages/ui/src/utils/auto-icons.ts` L48) |
| image | `ImageIcon`, `ImagesIcon`, `FileImageIcon` | `image.svg`, `images.svg`, `file-image.svg` | Screenshots nav; background picker |
| globe / world | `GlobeIcon`, `WorldIcon`, `TagCategoryGlobeIcon` | `globe.svg` (Feather), `world.svg` (Lucide earth), `tags/categories/globe.svg` | `WorldIcon` = seed-map tool icon |
| server | `ServerIcon` | `server.svg` (hard-drive glyph) | 固定的服务器 header; `ServerStackIcon`, `ServerPlusIcon` |
| calendar | `CalendarIcon` | `calendar.svg` | 日历 header (brand-pink in screenshot) |
| clock | `ClockIcon`, `TimerIcon`, `HistoryIcon` | `clock.svg`, `timer.svg`, `history.svg` | 游玩洞察 rows; recent worlds |
| heart | `HeartIcon` | `heart.svg` (Heroicons outline) | — |
| star | `StarIcon` | `star.svg` | Lab favourite (`fill-brand text-brand` when on); primary instance |
| folder | `FolderIcon`, `FolderOpenIcon` | `folder.svg`, `folder-open.svg` | World/directory icons |
| terminal | `TerminalSquareIcon`, `TagCategoryTerminalIcon` | `terminal-square.svg`, `tags/categories/terminal.svg` | Action bar "view logs" |
| layers | `LayersIcon` | `layers.svg` | Seed-map layers / trail-ruins fallback |
| eye | `EyeIcon`, `EyeOffIcon` | `eye.svg`, `eye-off.svg` | — |
| gamepad | `GameIcon` | `game.svg` | 本周常玩, pinned instance loader line ("🎮 Fabric 26.2") |
| other home-widget headers | `ChartIcon` 游玩洞察 · `TrendingUpIcon` 已连续游玩 · `SparklesIcon` (file-pen glyph) 每日小挑战 · `UpdatedIcon` refresh · `NewspaperIcon` Minecraft 新闻 · `SignalIcon` player-count bars | `chart.svg`, `trending-up.svg`, `sparkles.svg`, `updated.svg`, `newspaper.svg`, `signal.svg` | Verified in `apps/app-frontend/src/components/home/*.vue` imports |
| running indicator | `OnlineIndicatorIcon` | `online-indicator.svg` (18×18: green `#00af5c` dot + 25% ring) | Titlebar action pill when an instance runs |
| pointer | `MousePointer2Icon` | `mouse-pointer-2.svg` | Image editor "select" tool |
| misc tools | `PaletteIcon`, `LanguagesIcon`, `PencilIcon`, `PickaxeIcon`, `RocketIcon`, `PowerIcon`, `ExternalIcon`, `GridIcon`, `LogInIcon`, `UserIcon`, `MinimizeIcon`, `MaximizeIcon`, `RestoreIcon` | same-named `.svg` | Lab tool fallbacks; window controls (Windows/Linux only) |

### 4.4 Titlebar action pill icons (next to the logo)
`E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AppActionBar.vue` L160–256: pill `border border-surface-5 rounded-xl py-1.5 px-3 text-sm gap-2`. Idle: an 8 px dot `size-2 rounded-full bg-secondary` + **没有运行中的实例** (`app.action-bar.no-instances-running`, tertiary text). Running: `OnlineIndicatorIcon` + instance name, `StopCircleIcon` (`text-red size-5`), `TerminalSquareIcon` (`size-5`). → a natural "after the click" beat.

### 4.5 Cursor
No CSS custom cursor anywhere (`cursor: url(...)` count = 0). The screenshots are macOS, so the in-world cursor is the system arrow — draw a generic white-fill/black-outline arrow (do not trace Apple artwork). `MousePointer2Icon` (Lucide) is the in-system stylised alternative.

---

## 5. Fonts

| Font | Status in repo | Licence | Notes |
|---|---|---|---|
| **UI stack** `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Roboto, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif` | `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/styles/defaults.scss` L12–14; mirrored in `apps/app-frontend/src/helpers/font-family.ts` (`DEFAULT_UI_FONT_STACK`) | — | Size scale 10/12/14/16/18/20/24/32 px; weights 400/500/700/800 (`--font-weight-*`), headings 800 |
| **Inter** (400/500/600/700/800) | **Not bundled** — `@font-face inter` loads `https://cdn-raw.modrinth.com/fonts/inter/Inter-*.woff2?v=3.19` (`packages/assets/styles/inter.scss`, imported by `omorphia.scss`) | SIL OFL 1.1 (Inter itself) | Get Inter from the official release, not Modrinth's CDN. Onboarding uses 650/750 weights → with static Inter they snap to 600/700/800 **(inferred)**; a variable Inter renders them exactly |
| CJK text | System fallback | — | macOS screenshots → **PingFang SC**; Windows → Microsoft YaHei **(inferred)**. Open substitute for production: Noto Sans SC / Source Han Sans SC (OFL) |
| Mono | `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace` | — | Logs/editors |
| `bundled-minecraft-font-mrapp` (regular/italic/bold/bold-italic `.otf`) | **Not bundled** — loaded from `https://cdn-raw.modrinth.com/fonts/minecraft/*.otf` (`apps/app-frontend/src/assets/stylesheets/global.scss` L7–41); used by `.font-minecraft` and the greeting option "Minecraft 像素字体" | Unknown in repo (4-style "Minecraft" family, plausibly IdreesInc/Minecraft-Font, OFL **(inferred, unverified)**) | Don't pull from Modrinth's CDN |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/font/minecraft_font.ttf` | Bundled, **unused** by code; 10.7 KB, 107 Latin glyphs | **CC BY-SA 3.0** — "Minecraft" by **Pwnage_Block** (2011), built with FontStruct (name table) | Safe for Latin pixel text with credit ("Minecraft font by Pwnage_Block, CC BY-SA 3.0"); no CJK |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/lab/Minecraft_AE.ttf` | Bundled, 16.2 MB; "Minecraft AE Pixel" (`MinecraftAE-Pixel`), weight 500, **63,449 glyphs incl. 20,992 CJK ideographs** (has 启/动) | **No licence string** (copyright/trademark fields just "AE"; fsType 0) | Used only as the gradient-text in-game preview font (`apps/app-frontend/src/pages/LabGradientText.vue` L39). Treat as **not cleared** for titles; OFL CJK pixel alternatives exist (e.g. Fusion Pixel / Ark Pixel) |
| `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/public/monaco/codicon/codicon.ttf` | VS Code codicons for the Monaco editor | MIT **(inferred)** | Irrelevant |

---

## 6. Licensing & what is safe for an Axolotl promo film

**Key documents**
- `E:/GitHub/Axolotl-animation/upstream/Axolotl/COPYING.md` — "Modrinth trademarks, logos, cover images, and other restricted branding are **not part of the Axolotl Launcher brand** and must not be reintroduced… **Axolotl Launcher, its independent brand assets, and Garbage Human Studio attribution are maintained separately** from the upstream project."
- `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/COPYING.md` and `apps/app/COPYING.md` — GPL-3.0-only; Axolotl modifications © 2026 Garbage Human Studio (Mystic Stars); Minecraft resources © Mojang; seed-map icons partly from **MinecraftSearch** (rights retained); schematic atlas from misode/mcmeta (Minecraft client resources); recipe textures from `minecraft-textures` (GPL-3.0, derived from Mojang).
- `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/COPYING.md` + `LICENSE` (GPL-3.0) — **inherited from Modrinth**: says `branding/*` is Rinth-reserved and `external/*` belongs to their owners. That clause was written for Modrinth's `logo.svg`; the axolotl files now sitting in `branding/` are Axolotl's own (root COPYING) — the text is stale **(inferred)**. To avoid any ambiguity, take the logo from `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/axolotl.png` / `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app/icons/*` (identical art).
- `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/website/COPYING.md` — also inherited (lists `src/components/brand/*`, favicons as Rinth); those files are now Axolotl's wordmark/axolotl PNG — stale **(inferred)**.
- `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/ui/COPYING.md` — Modrinth `src/components/brand/*` (folder **no longer exists**); LogShare (MIT) attribution.
- `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/lab/recipe-generator/THIRD_PARTY_NOTICES.md`; licence texts in `E:/GitHub/Axolotl-animation/upstream/Axolotl/third-party/licenses/`.

| Verdict | Assets |
|---|---|
| ✅ **Safe — Axolotl's own brand** | Axolotl logo (all §2.2 files except Modrinth items), `axolotl-run/axolotl.webp`, `axolotl-balls/*.png`, `axo-searching.svg`, `axo-teaching.svg`, `icons/new-instance.svg`/`add-project.svg`, `datapack.png`, `public/models/axolotl.gltf` (model & animation; texture see caution), `axl_label.glb`, NSIS bitmaps, installer and onboarding styling, Lab cover glyph designs, brand copy. (The mascot depicts Minecraft's axolotl mob in an original rendering; it is the product's official mark — use as-is and keep the non-affiliation line.) |
| ✅ Safe — permissive | UI icons (Lucide ISC / Feather MIT / Heroicons MIT + custom); Inter (OFL); `minecraft_font.ttf` (CC BY-SA 3.0, credit); recreating the GPL UI on screen |
| ⚠️ Caution — incidental, in-UI only | Vanilla Minecraft textures/renders (axolotl-run items, `instance-icons/*.png` item renders, ores, schematic & recipe atlases, armour, `skins/steve.png`, `minecraft-preview.png`, recipe GUI backgrounds, glTF axolotl texture **(inferred vanilla-derived)**, Lab cover backgrounds). Show them the way the app does, add 非 Minecraft 官方服务… disclaimer; don't make them the brand. |
| ⚠️ Caution — third party | Seed-map `structures/` & `biomes/` (MinecraftSearch & creators); loader logos (Fabric, Forge, NeoForge, Quilt, OptiFine, Cleanroom, LiteLoader, Paper, Mojang); inherited Modrinth GPL art that is not branding (`packages/assets/illustrations/*`, player `.gltf/.fbx` models) |
| ⛔ **Avoid** | `branding/logo.svg` (Modrinth), `icons/omorphia.svg`, `.github/assets/*`, `instance-icons/modrinth-3d/*`, `loading/cube.png`, any `cdn-raw.modrinth.com` asset, `external/*` / `java-vendors/*` / website external launcher logos, contributor avatars, sponsor logo, `Minecraft_AE.ttf` (until licence is confirmed) |

---

## 7. Recommendations for the film

1. **Titlebar logo:** vector `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/branding/axolotl.svg` in a 24×24 box (art ≈19×14), 8 px gap, live "Axolotl" Inter 800 14 px tracking 0.025em `#1a202c`. For the 2.5D stage, give it a separate thin layer so the logo can "peek" when the button falls.
2. **End-card logo:** the same SVG at ~176 px + "Axolotl Launcher" (72 px, 800/650) reproducing the onboarding timeline (pop 0.72→1.04→1 in 900 ms, wordmark wipe, pink scan wipes at 2.05 s / 2.4 s), idle with the website `float` (±2°, −6.4 px, 3.5 s). Sub-line options: 你的最后一款启动器。 or 你的下一个世界，从这里开始。; legal line underneath. For an app-icon variant use `AXL(fixed).svg` on the white→`#FED6EB` squircle.
3. **Button visual core (keeps it recognisable through every morph):** the **`PlayIcon` rounded triangle** + **brand pink `#db2777`**; the real hero button is `Button type="colored" color="brand" size="xl"` = 48 px tall, radius 16, padding-x 14, gap 8, 16 px/800 text "开始游戏", 24 px icon, white text (`packages/ui/src/components/base/buttons/ButtonFrame.vue` L38/53/79; instance page `apps/app-frontend/src/pages/instance/Index.vue` L171–178). In dark theme the same button is `#f472b6` with **black** text (`--color-accent-contrast: #000000`). Squash/stretch: borrow Axolotl Run's constants (§3.2).
4. **Cursor-adjacent icons:** `PlayIcon`, `SpinnerIcon` (launching), `StopCircleIcon`, `CheckIcon`, `MoreVerticalIcon`, `SearchIcon`, `PinIcon`, `BoxIcon` (mods), `LeftArrowIcon`/`RightArrowIcon`, `PlusIcon` — all 24-grid, stroke 2, round joins; scale stroke with the icon, don't mix in the filled `XIcon`/`CubeIcon` unless reproducing a real screen.
5. **Minecraft-flavoured props, in order of brand safety:** axolotl balls (pink ball = round button cousin), 3D `axolotl.gltf` swimming cameo, `axo-searching`/`axo-teaching` mascots, Avatar cube outline, seed-map pin (exact canvas spec, recolour to brand pink via the user colour picker — legit in-product), block textures from the schematic atlas for CSS-3D cubes, ore cubes, `minecraft-preview.png` as the 进入世界 plate, gold `datapack.png` for the recipe beat.

---

## 8. Discrepancies & gotchas

1. **Screenshots = v1.6.0, code = v1.9.7.** Lab page in code is a vertical list of **6** cards (224×112 cover, ★ favourite, TagItem, brand 进入 button), not the 3-column, 3-tool grid in `axolotl-lab.png`; the repo's 投影工坊 cover is the light isometric/cyan-hologram image, **not** the dark starfield projector shown in the screenshot; nav now includes 截图中心 between 主页 and 发现内容.
2. Default theme in code is **dark** (`selectedTheme: 'dark'`, `apps/app-frontend/src/store/theme.ts` L183) with accent `pink` (dark `#f472b6`); the references are light (`#db2777`). Custom accent `#db2777` derives light `#db2777` / dark ≈ `#f16da8` (computed from `deriveAccentVariants`).
3. `SparklesIcon` draws a file-with-pen; `ServerIcon` draws a hard drive; `WorldIcon` ≠ `GlobeIcon`; `XIcon`/`CubeIcon` are filled; `ChangeSkinIcon` is mirrored by a root transform.
4. The logo **faces left**; `axolotl-run/axolotl.webp` faces right; the glTF is rotated ~100° in the About scene.
5. The titlebar loads a 1024 px PNG scaled to 24 px — use the SVG for 4K renders; watch for polygon seams at large sizes (§2.1).
6. Inherited COPYING files still name `branding/*` and website `components/brand/*` as Rinth property; only `branding/logo.svg` actually is.
7. `bg-brand` / `text-brand` everywhere = `var(--color-brand)` → pink by default; `--color-brand` in the base light palette is Modrinth green and is overridden by the `accent-pink` class on `<html>` — when recreating CSS, define the pink explicitly.

---

## Appendix A — key source files (absolute)

- Logo component: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AxolotlLogo.vue`
- Shell/titlebar/nav: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/App.vue`
- Nav buttons: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/NavButton.vue`, `.../NavRail.vue`
- Splash: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/SplashScreen.vue`
- Onboarding brand reveal: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/onboarding/OnboardingWelcome.vue`
- About 3D scene / games: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/components/ui/AboutScene.vue`, `AboutAxolotlRun.vue`, `AboutMergeGame.vue`
- Icon exports: `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/generated-icons.ts`, `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/index.ts`
- Project-type icons: `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/ui/src/utils/auto-icons.ts`
- Theme tokens: `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/assets/styles/variables.scss`, `.../defaults.scss`, `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/assets/stylesheets/global.scss`
- Brand config: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/config.ts`
- Locales: `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/app-frontend/src/locales/zh-CN/index.json`, `E:/GitHub/Axolotl-animation/upstream/Axolotl/packages/ui/src/locales/zh-CN/index.json`, `E:/GitHub/Axolotl-animation/upstream/Axolotl/apps/website/src/locales/site.ts`

## Appendix B — previews generated for this report (`E:/GitHub/Axolotl-animation/research/_scratch/`)

`logos2.png` (all logo SVGs incl. Modrinth look-alike) · `platform-icons.png` · `macos26-icon.png` · `seams.png` · `titlebar-crop.png` · `settings-footer-crop.png` · `axolotl-gltf-render.png` · `axolotl-gltf-texture-x8.png` · `axl-label-persp.png` / `axl-label-side.png` · `axolotl-run-sheet.png` · `axolotl-balls-sheet.png` · `mascots.png` · `cube-preview.png` · `lab-covers.png` · `cover-centers.png` · `minecraft-preview-thumb.png` · `instance-icons-generic.png` · `instance-icons-modrinth3d.png` · `seedmap-structures.png` · `seedmap-biomes.png` · `seedmap-ores.png` · `atlas-samples.png` · `misc-assets.png` · `nsis-assets.png` · `github-assets.png` · `illus.png` · `ext-illus.png` · `icons.png` / `icons-lastrow.png` (icon contact sheet, 24 px + 48 px brand pink) · `icon-map.tsv` (all 447 component → file pairs) · `render_gltf.py` (tiny numpy rasteriser used for the 3D previews).
