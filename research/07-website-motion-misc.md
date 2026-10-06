# 07 · Website design language & copy · App motion language · Easter eggs · Remaining pages · Version

Research area: the official website (`apps/website`), the motion vocabulary of the desktop app (`apps/app-frontend` + shared `packages/ui`), mascot/easter-egg interactions, a survey of the pages not covered elsewhere, and the current version/announcements.

- Source (read-only): `E:\GitHub\Axolotl-animation\upstream\Axolotl` (shallow clone, HEAD `2b5c22d`, 2026-10-05; latest tag `v1.9.7`).
- Rendered previews made for this report: `E:\GitHub\Axolotl-animation\research\_scratch\07\` (file names are listed in §1 and §2.8).
- zh-CN strings were resolved from `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\locales\zh-CN\index.json` (key → `message`), `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\locales\zh-CN\index.json` (key → `defaultMessage`) and `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\locales\site.ts`. Helper script: `E:\GitHub\Axolotl-animation\research\_scratch\07\msgs.js` (`node msgs.js <file.vue>` prints `id | English default | zh-CN`).
- "(inferred)" marks anything not directly verified in code. Pixel values assume 1rem = 16px.

---

## 0. Key takeaways for the animator

1. **Brand core = the pink voxel axolotl + pink accent.** In the app the light-theme accent is `#db2777` (dark theme `#f472b6`). The website uses its own, slightly different pinks: `#c72f6c` (light) and `#ff82b2` (dark, also the `theme-color` meta). Use the app's `#db2777` for the launch button. Use the website's tones only to quote the website.
2. **The brand's secondary palette is cool and watery**, built around the pink. It shows up as gradients and glows, never as flat fills:
   - teal glow `rgb(70 190 176)` in the dark website hero;
   - lavender `rgb(142 119 230)` in the light hero;
   - sky→pink icon gradient `#A7D0FF → #F472B6`;
   - mint→periwinkle `#C1E1B1 → #A7BDE6` (dark);
   - violet `#8b5cf6`/`#a855f7` in the installer.

   This is a good palette for the "underwater stage" around the button.
3. **The ready-made end card is the app's first-run brand intro** (`OnboardingWelcome.vue`):
   - logo pops in with an overshoot (900 ms);
   - the wordmark "Axolotl Launcher" unrolls and slides in (1050 ms);
   - a pink copy of the wordmark wipes away left→right (700 ms);
   - the group lifts upward, then a panel slides up from below.

   Exact keyframes are in §3.8.
4. **Signature motion grammar (verified in code):**
   - **Inchworm sliders.** The left nav highlight pill and every tab bar move the leading edge first; the trailing edge follows 120 ms (nav) or 200 ms (tabs) later. Each edge takes 150 ms on `cubic-bezier(0.4,0,0.2,1)`. Give the button this "inchworm" locomotion and it will feel native.
   - **Modals open from the click point.** They start offset by 1/16 of the click's distance from screen centre, at scale 0.97, and settle in 200 ms ease-out.
   - **Press feedback** is `scale(0.97)` over 150 ms ease-out. Hover is `brightness(0.9)` in light theme. Focus is a 4 px pink ring.
   - **Brand moments** use expo/quint-out curves: `cubic-bezier(0.22,1,0.36,1)` and `(0.16,1,0.3,1)`.
   - **"Pop" arrivals** use spring overshoots: `cubic-bezier(0.15,1.4,0.64,0.96)` and `(0.34,1.56,0.64,1)`.
5. **The easter-egg games already define a weighty, elastic character.** Take "美西螈快跑" squash/stretch numbers straight from code: on landing, X ×(1+0.2·impact) and Y ×(1−0.16·impact), decaying at 4.5/s, plus splash particles. "合成美西螈" literally says `点击场地，投放粉色美西螈` ("click to drop a pink axolotl"). A pink, round thing that drops, bounces and merges is the most on-brand way for the button to fall.
6. **Mascot art you can use directly (vector):**
   - logo SVG;
   - `axo-searching.svg`, the axolotl holding a **magnifying glass**. It fits "启动按钮去哪了？" perfectly;
   - `axo-teaching.svg`, with a mortarboard and book;
   - a Blockbench **3D glTF axolotl with a `swim` animation**;
   - six "axolotl ball" sprites (pink/yellow/cyan/red/blue/rainbow).
7. **The brand voice is warm, concise and lightly self-aware, with Minecraft metaphors.** Lines that wink at our plot:
   - `没有东西会失踪` and `不会神秘消失` (Downloads onboarding);
   - `我坚持不替你按确认。` (instance-creation onboarding);
   - `世界已准备好接住你的下一步。` (greeting);
   - `下一个项目只差一次启动。` (greeting);
   - `点击启动按钮即可启动服务器！` (server console empty state).
8. **End-card slogans (verbatim):**
   - `次世代 Minecraft 桌面客户端，全能、美观、全平台覆盖。` (README);
   - `你的最后一款启动器` (installer hero, About, onboarding);
   - `你的下一个世界，从这里开始。` (website locale, currently unused);
   - `一个启动器，承载每一个世界。` (website locale, currently unused);
   - `免费、开源，为 Minecraft 而生。`;
   - `MINECRAFT, ORGANIZED` (installer sidebar art).
9. **Version:** current app version `1.9.7` (stable, tagged 2026-09-30). The catalog already holds an in-progress `1.9.8-beta.1` (2026-10-01). The "美西螈快跑" game exists on `main` only, after 1.9.7, so it is unreleased.
10. **Avoid these Modrinth leftovers:**
    - `packages/assets/branding/logo.svg` (this is the **Modrinth logo**);
    - the dark maze cube behind the splash (`assets/loading/cube.png`; Modrinth-inherited, inferred);
    - the Friends UI (Modrinth-account based; not mounted in Axolotl);
    - the generic empty-state illustrations (Modrinth design-system art; neutral, not Axolotl-branded).

---

## 1. Asset index (my area)

All paths are absolute. Previews I rendered are in `E:\GitHub\Axolotl-animation\research\_scratch\07\`.

| Asset | Path | Notes |
|---|---|---|
| Brand logo PNG 1024² | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.png` (identical copy: `...\apps\app-frontend\src\assets\axolotl.png`) | Isometric voxel pink axolotl. Used in app top bar (`AxolotlLogo.vue`), splash, Settings footer, Skins sign-in. |
| Brand logo **SVG** (vector) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\axolotl.svg` | Illustrator export, viewBox 566.9². About 26 flat pink tones plus eye `#43147C`. Preview: `_scratch\07\brand-svg.png` (light + dark bg). |
| macOS app icon SVG | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\axolotl-macos.svg` | White squircle (x/y 100, 824², rx 185 in 1024 viewBox) containing the logo. Preview `_scratch\07\macicon.png`. |
| App icons | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\icons\` (`icon.png` 512², `128x128.png`, `Square*Logo.png`, `icon.ico/.icns`) | Same voxel axolotl. |
| Website favicon/logo 256² | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\public\axolotl.png` | Same art. Used by website wordmark and showcase. |
| Onboarding mascot "searching" | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-searching.svg` | Voxel axolotl holding a **dark magnifying glass** (lens tinted `#36BCDF` at 22% plus white 84% glint). viewBox 786.4×652. Preview `_scratch\07\mascots.png` (left). |
| Onboarding mascot "teaching" | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axo-teaching.svg` | Same axolotl wearing a **mortarboard with a gold `#E5B11F` tassel**, holding a brown book. Preview `mascots.png` (right). |
| 3D axolotl model | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\models\axolotl.gltf` | Blockbench 5.1.6 export, 61 KB, embedded 64×64 pink texture (nearest filtering). Nodes: head, top_gills, left_gills, right_gills, body, leg1–4, tail. One animation **`swim`** (10 channels). Texture preview `_scratch\07\axolotl-gltf-texture-x8.png`. |
| 3D label model | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\public\models\axl_label.glb` | Referenced only in commented-out code (unused). |
| Runner sprite | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-run\axolotl.webp` | 200×142 side/three-quarter voxel axolotl render. PNG copy: `_scratch\07\axolotl-run-sprite.png` and `E:\GitHub\Axolotl-animation\research\ref\axolotl-run.png`. |
| Runner item sprites (16×16) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-run\*.png` | Minecraft vanilla textures: brain/bubble/fire/horn/tube coral, clay, conduit, diamond, dolphin (18²), golden apple, kelp, kelp_plant, milk, slowness/swiftness potions, pufferfish, sea lantern, seagrass, suspicious stew, TNT, totem, trident. Sheet: `_scratch\07\run-items-sheet.png`. These are Mojang textures; consider licensing before reuse (inferred). |
| Axolotl balls (2054² each) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\axolotl-balls\{pinkball,yellowball,cyanball,redball,blueball,superball}.png` | Round glossy "bubbles", each containing a voxel axolotl in the matching color. `superball` is rainbow. Sheet: `_scratch\07\balls-sheet.png`. |
| Splash background | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\loading\cube.png` (2880×2788) | Dark navy maze cube. **Modrinth-inherited (inferred); do not use as a brand hero.** Preview `_scratch\07\cube-400.png`. |
| Installer art | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app\nsis\assets\sidebar.bmp` (164×314), `header.bmp` (150×57) | Sidebar: bg `#1d1f23`, 2–3 px left stripe `#f472b6`, logo, text `AXOLOTL` / `LAUNCHER` / `MINECRAFT, ORGANIZED`. Preview `_scratch\07\nsis-sidebar-x2.png`. |
| Modern installer UI | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\installer-ui\src\installer.html` | 940×620 dark installer with animated pink/violet glows. Render: `_scratch\07\installer-welcome.png` (see §2.6, §3.10). |
| Website showcase images | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\public\showcase\{launcher-home.webp (2560×1489), account-login.png, axolotl-lab.png, theme-accent.png}` | PNG copies are in `E:\GitHub\Axolotl-animation\research\ref\`. **They show v1.6.0-era UI; several pages have changed since** (see §5.7). |
| Empty-state illustrations (generic) | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\illustrations\*.svg` (`no-search-result`, `empty`, `no-images`, `done`, …) | "Blob + object" line art filled with `var(--surface-1..4)`. Modrinth design-system heritage, not Axolotl-branded. Preview `_scratch\07\illustrations.png`. |
| Unused pixel font | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\font\minecraft_font.ttf` (10.7 KB) | Not referenced. The app's `.font-minecraft` (nametags, MOTDs) loads `bundled-minecraft-font-mrapp` from `cdn-raw.modrinth.com` (`apps\app-frontend\src\assets\stylesheets\global.scss`). |
| **DO NOT USE** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\branding\logo.svg` | This is the **Modrinth** mark (circular wrench). |

Icons referenced in this report live at `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\assets\icons\<kebab-name>.svg`, exported from `packages\assets\generated-icons.ts` as `<Pascal>Icon`. Examples:

| Component | File |
|---|---|
| `PlayIcon` | `play.svg` |
| `StopCircleIcon` | `stop-circle.svg` |
| `SpinnerIcon` | `spinner.svg` |
| `RightArrowIcon` | `right-arrow.svg` |
| `SearchIcon` | `search.svg` |
| `DownloadIcon` | `download.svg` |
| `UsersIcon` | `users.svg` |
| `HeartHandshakeIcon` | `heart-handshake.svg` |
| `ScaleIcon` | `scale.svg` |
| `MonitorIcon` | `monitor.svg` |
| `UnfoldHorizontalIcon` | `unfold-horizontal.svg` |
| `ImagesIcon` | `images.svg` |
| `WorldIcon` | `world.svg` |
| `CompassIcon` | `compass.svg` |
| `ChangeSkinIcon` | `change-skin.svg` |
| `LibraryIcon` | `library.svg` |
| `FlaskConicalIcon` | `flask-conical.svg` |
| `HomeIcon` | `home.svg` |
| `SettingsIcon` | `settings.svg` |
| `GitGraphIcon` | `git-graph.svg` |
| `BoxesIcon` | `boxes.svg` |
| `GaugeIcon` | `gauge.svg` |
| `ArrowDownIcon` | `arrow-down.svg` |

`GithubIcon` comes from `packages\assets\external\github.svg`.

---

## 2. Official website (`apps/website`, Nuxt 3, https://axlmc.org)

Key files:
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\pages\index.vue` (2201 lines: all landing sections and their scoped CSS)
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\layouts\default.vue` (website palette overrides)
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\assets\styles\global.scss`
- `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\locales\site.ts` (all zh-CN website copy)
- components in `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\website\src\components\{brand,landing,ui}\`

Default locale is **zh-CN** (`plugins\i18n.ts`: `DEFAULT_LOCALE = 'zh-CN'`). The `<html>` starts as `accent-pink dark-mode`. An inline script then applies the saved `axolotl-theme`, falling back to the system preference.

### 2.1 Page structure (top → bottom)

1. **Header** (`components\ui\AxolotlHeader.vue`). Absolute and transparent over the hero, max-width 1360 px, padding 18.4 px 24 px.
   - Left: wordmark `AxolotlWordmark.vue` = 32 px logo with drop-shadow `0 5.6px 11.2px rgb(245 139 174 / 22%)`, plus "Axolotl" at 22 px, weight 800, tracking −0.035em.
   - Centre nav: quiet buttons, 12.5 px, weight 700, uppercase, tracking .04em: `功能` `常见问题` `更新日志` `服务条款` `隐私政策` `开放源代码` (with GitHub icon).
   - Right: brand-filled `下载` button and a gear for `打开显示设置`.
   - Mobile menu: frosted panel (`blur(20px) saturate(150%)`, radius 16 px), entering with translateY(−8px) and scale .98 over 160 ms ease.
2. **Hero** (`.landing-hero`). Pulled up 84 px under the header; top padding clamp(160px,12vw,184px); height ≤ 1008 px.
   - Kicker pill: `Tauri v2 · Rust · Vue 3`.
   - H1: `Axolotl Launcher`.
   - Description paragraph.
   - Primary xl brand button `下载 Axolotl` with OS logo, and outlined xl `更多下载选项` with ArrowDown icon.
   - Product screenshot `/showcase/launcher-home.webp` (2560×1489, width min(1264px,112%), radius 4px).
   - Scroll mark at the bottom, then a 480 px bottom fade.
3. **Highlights** (`#features`, `.axolotl-highlights`). Eyebrow `一个启动器，两个来源`, H2 `管理 Minecraft 内容` / `不再绕路`, and a sub line. Below it, a 6-column grid (max 1096 px, gap 16 px):
   - 3 "promise" cards (01/02/03);
   - a full-width "账户" showcase (copy left, screenshot right);
   - two half cards ("个性化", "实验室");
   - the live **mods table** demo ("已安装模组");
   - the **ProjectsShowcase** marquee ("从发现到安装").
4. **Feature row**: 3 columns (`导入配置`, `每个世界都用得上的能力`, `联机能力`) with gradient-stroke icons.
5. **FAQ** (`#faq`): 2-column grid (0.8fr/1.2fr, gap 64 px), 7 `<details>` items (radius 16 px, `bg-surface-2`, 1 px divider).
6. **Community** (`#community`, `CommunitySection.vue`): two tilted cards, the QQ group card at −2° and the QQ channel card at +4° overlapping by 24 px. Both straighten on hover.
7. **Download** (`#download`): full-bleed section on `--color-accent-contrast`:
   - pure black (`#000000`) in dark theme; overridden to `#f8f7f8` in light theme;
   - square-cornered badge `下载选项`, title `下载 Axolotl Launcher`;
   - channel picker; three OS columns separated by 1 px × 208 px dividers.
8. **Footer** (`components\ui\AxolotlFooter.vue`): minimal, with a hairline pink gradient on top.

### 2.2 Website palette (resolved)

The website overrides the shared tokens in `layouts\default.vue` (`html.accent-pink.light-mode` / `.dark-mode`). Brand = `--color-pink`.

| Token | Light (`html.accent-pink.light-mode`) | Dark (`html.accent-pink.dark-mode`, default) |
|---|---|---|
| `--color-pink` = brand | **`#c72f6c`** | **`#ff82b2`** |
| brand highlight | `rgb(199 47 108 / 14%)` | `rgb(255 130 178 / 18%)` |
| brand shadow | `rgb(199 47 108 / 30%)` | `rgb(255 130 178 / 30%)` |
| surface-1 (page) | `#f8f4f7` | `#101018` |
| surface-2 | `#fcf8fb` | `#15151f` |
| surface-3 | `#fffafd` | `#1b1b27` |
| surface-4 | `#ffffff` | `#242432` |
| surface-5 (strokes) | `#eadde5` | `#343446` |
| text primary / default / tertiary | `#2e2029` / `#493944` / `#75616e` | `#fff7fb` / `#ddd3da` / `#aa9ca6` |
| landing heading / subheading | `#281b24` / `#65515e` | `#fff8fc` / `#bdb0ba` |
| landing border | `rgb(166 107 138 / 32%)` | `rgb(230 170 204 / 24%)` |
| `themeColor` meta | n/a | `#ff82b2` |

Verified by sampling the live site: light button `#c72f6c`, dark button `#ff82b2`, dark hero background ≈ `#11121b`.

**Hero background:**

```scss
/* dark (default) */
background:
  radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgb(255 155 197 / 22%), transparent 20rem), /* follows the mouse */
  radial-gradient(circle at 12% 46%, rgb(70 190 176 / 11%), transparent 26rem),                         /* teal "water" glow */
  linear-gradient(155deg, #161018 0%, #11121a 52%, #121520 100%);
/* light */
background:
  radial-gradient(circle at 18% 20%, rgb(239 126 170 / 20%), transparent 28rem),
  radial-gradient(circle at 82% 36%, rgb(142 119 230 / 11%), transparent 32rem),                         /* lavender */
  linear-gradient(180deg, #fff9fc 0%, #faf6fa 58%, #f8f4f7 100%);
```

**Grid motif:**
- Vertical and horizontal 1 px lines every `min(9vw, 9rem)` (≤ 144 px), at `rgb(255 255 255 / 3%)` (dark) or `rgb(105 73 88 / 5%)` (light). Masked to fade out by about 70% of the hero height.
- A horizontal hairline at y = 148 px, 7% inset from each side: `linear-gradient(90deg, transparent, rgb(255 170 206 / 38%), transparent)`. Light theme: `rgb(199 47 108 / 22%)`.
- The whole site also has faint horizontal lines every 128 px (`.site-layout`).

**Secondary (cool) accents used as gradients:**

| Usage | Light | Dark |
|---|---|---|
| Feature-row icons (`ImportGradientIcon.vue`, `OfflineModeIcon.vue`, `MultiplayerIcon.vue`) | `#A7D0FF → #F472B6` (stop 0.415) | `#C1E1B1 → #A7BDE6` |

**Feature cards (glass):**
- Dark: `radial-gradient(50% 50% at 50% 50%, rgba(44,48,79,.35), rgba(32,35,50,.27))`, shadow `0 20px 48px rgb(0 0 0 / 12%), inset 0 0 64px rgb(57 61 94 / 20%)`, `backdrop-filter: blur(6px)`.
- Light: white `.35 → .27` with `inset 2px 2px 64px rgba(255,255,255,.45), 2px 2px 12px rgba(0,0,0,.16)`.
- 1 px **gradient border** drawn as a mask-composited `::before` (`.gradient-border`, radius 16 px). Dark: `linear-gradient(to bottom right, rgba(168,177,221,.75), rgba(168,177,221,.18))`.

### 2.3 Typography

- **Font stack:** `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Roboto, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif` (`global.scss`). Inter (400–800) is loaded from `cdn-raw.modrinth.com` via `packages\assets\styles\inter.scss`. CJK text falls back to the OS font: PingFang SC in the macOS screenshots, Microsoft YaHei on Windows (inferred). The app uses the same stack (`packages\assets\styles\defaults.scss`). Since 1.9.7 users can choose UI and mono fonts.
- **Hero H1** `Axolotl Launcher`: 84 px (`text-[5.25rem]`), weight 600, line-height 1, max-width 832 px, centred. Colour `#2e2029` (light) / `#fff7fb` (dark).
- **Kicker pill:** 14 px, weight 700, line-height 1, padding 4/12 px, fully rounded, text in brand on 12% brand; `backdrop-filter: blur(12px)`; shadow `0 12px 40px` brand 12%.
- **Hero paragraph:** clamp(16px, 1.6vw, 20px), weight 450, line-height 1.65, max 736 px, `text-wrap: balance`.
- **Eyebrows** (`一个启动器，两个来源`, `常见问题`, `社区`): 12 px, weight 800, uppercase, tracking .1em, brand colour.
- **Section H2:** clamp(40px, 5.5vw, 76px), weight 700, line-height 1.04 (highlights). FAQ/Community H2: clamp(32px, 4vw, 52px), line-height 1.08.
- **Promise cards:**
  - meta row: 21.6 px brand icon and "01" at 12 px/800, tracking .09em;
  - H3: 19.2 px, tracking −.025em, 35.2 px top margin;
  - body: 14.4 px, line-height 1.6;
  - decorative giant number (`::after`, `attr(data-number)`): 128 px/800 at `rgb(255 255 255 / 4%)` (dark) or `rgb(0 0 0 / 5%)` (light), bleeding off the bottom-right corner (right −28 px, bottom −36 px).
- **Showcase copy:** label 11.5 px/800 uppercase brand; H3 clamp(21.6px, 2.4vw, 28.8px), tracking −.035em.
- **Buttons, size `xl`** (`packages\ui\src\components\base\buttons\ButtonFrame.vue`): height 48 px, radius 16 px (`rounded-2xl`), padding-x 14 px, 16 px **weight 800**, icons 24 px, gap 8 px.

### 2.4 Visual motifs / illustration style

- **Mascot and logo style:** isometric **voxel (Minecraft-model) pink axolotl**, flat-shaded vector polygons. There are about 26 pinks; the main ones are listed below.

| Role | Hex values |
|---|---|
| Light faces | `#FED5EB` `#FEBAD8` `#FCC1E0` `#FEB8DA` |
| Mids | `#E59CC3` `#E79EC5` `#D982AD` `#DC73A6` |
| Hot pinks (gills/feet) | `#FE4592` `#FE3D8C` `#F0579A` `#FE60A4` `#FE71B1` |
| Deep pinks (shadows) | `#DF3177` `#E03178` `#D6518C` `#C64F8D` `#A12D72` |
| Eyes | deep purple `#43147C` |

- **Product-first website:** no decorative illustrations. Real screenshots sit in macOS window frames, framed by glass cards with 1 px gradient borders, thin blueprint grid lines, soft pink light pools, and oversized ghost numbers. Playful touches stay small: tilted community cards (−2°/+4°), a mouse-following pink glow (dark only), a scrolling marquee of project cards, and a static pixel axolotl perched above the marquee (56 px, centred, top 24 px, `ProjectsShowcase.vue`).
- **Mods table demo:** rows of 40×40 px rounded icons. Columns `名称`/`版本`/`操作` with a brand-coloured checkbox and a trash button. In light mode the search bar has a **2 px brand border**. Removing a row animates it out: opacity 0 and translateX(−8px) over 200 ms ease.
- **ProjectsShowcase:** five rows of cards (padding 16 px, radius 16 px, 48 px avatar, 20 px/600 title, 14 px/500 two-line description). Rows scroll horizontally on a 40 s linear loop, with odd rows reversed; hover pauses a row.
- **Download badge** `下载选项`: **square corners** (`border-radius: 0`), padding 16/24 px, 1 px brand border at 40%, brand-highlight fill, brand text.

### 2.5 Website copy, zh-CN verbatim (`apps/website/src/locales/site.ts`)

Hero

| Key | zh-CN |
|---|---|
| `axolotl-marketing.hero.open-source` (kicker) | `Tauri v2 · Rust · Vue 3` |
| `axolotl-marketing.hero.download` (H1) | `Axolotl Launcher` |
| `app-marketing.hero.description` | `Axolotl Launcher 是一款免费、开源、无广告的跨平台 Minecraft Java 版启动器，可在同一个客户端中搜索、安装和更新来自 Modrinth 与 CurseForge 的模组、整合包、资源包和光影，并内置 Axolotl 实验室。` |
| `axolotl-marketing.hero.download-button` | `下载 Axolotl` |
| `app-marketing.hero.more-download-options` | `更多下载选项` |
| `axolotl-marketing.download.fetching-links` | `正在获取下载链接…` |

Highlights and cards

| Key | zh-CN |
|---|---|
| `axolotl-marketing.highlights.eyebrow` | `一个启动器，两个来源` |
| `axolotl-marketing.highlights.title` + `title-second` | `管理 Minecraft 内容` / `不再绕路` |
| `axolotl-marketing.highlights.description` | `搜索 Modrinth 与 CurseForge，查看项目详情、选择版本并安装内容，由启动器处理依赖和更新。` |
| 01 `…ad-free.title` / `.description` | `免费、开源且独立` / `基于 GPL-3.0 发布，免费使用且无广告。Axolotl 不是 Modrinth 官方客户端。` |
| 02 `…localized.title` / `.description` | `井然有序的内容管理` / `同时安装和管理整合包与单个项目。部分 CurseForge 文件受分发限制，可能需要手动下载。` |
| 03 `app-marketing.features.performance.title` / `.description` | `高性能` / `Axolotl 以灵敏的界面与轻量的桌面核心保持安静、高效，不打扰你的游戏。` |
| Accounts label / title / desc | `账户` / `由你选择账户方式` / `使用 Microsoft 正版账户、本地离线身份，或 Yggdrasil 认证；支持 LittleSkin 预设和自定义服务器。` |
| Personalize label / title / desc | `个性化` / `每套设备，都有适合的色彩主题` / `在浅色、深色、OLED 和系统模式之间切换，并设置适合自己的强调色、背景和透明效果。` |
| Lab label / title / desc | `实验室` / `启动器里的 Axolotl 实验室` / `直接在 Axolotl 中使用渐变文字生成器、Java 版种子地图和 3D 投影工坊，而不是跳转到外部网页。` |
| Mods demo | `已安装模组` · `搜索模组` · `名称` · `版本` · `操作` · `作者：{author}` · `高效实例管理` · `创建、导入和批量管理实例；集中管理模组、资源包、光影、文件、世界、截图和日志，以及更新、启动设置与整合包导出。` |
| Projects showcase | `从发现到安装` · `从 Modrinth 或 CurseForge 发现内容后，通过项目详情和版本选择直接安装到实例中，并在原处处理依赖和更新。` |
| Feature row | `导入配置` · `从 PCL2, HMCL 或任意你喜欢的启动器一键导入现有配置，无需手动重建即可继续游玩。` · `每个世界都用得上的能力` · `中文搜索和项目翻译、拖拽导入、Java 管理、离线模式与皮肤管理，随时为你准备好。` · `联机能力` · `由陶瓦联机强力驱动，一键体验启动器联机功能，方便快捷。` |

FAQ (`axolotl-site.faq.*`):
- `常见问题` · `关于 Axolotl Launcher，你需要了解的一切` · `了解支持平台、账户类型、内容来源与官方下载方式。`
- Questions: `Axolotl Launcher 支持哪些操作系统？` / `Axolotl Launcher 免费且开源吗？` / `可以使用 Microsoft 正版账户和离线账户吗？` / `Axolotl 从哪里获取模组和其他 Minecraft 内容？` / `应该从哪里下载 Axolotl Launcher？` / `什么是 Axolotl 实验室？` / `Axolotl Launcher 和 Axolotl Client 是同一个项目吗？`
- Lab answer: `Axolotl 实验室是一个内置的网页工具集合，提供渐变文字生成器、Java 版种子地图、3D 投影工坊、配方生成器、Minecraft 模组翻译工具等功能。内容持续更新中。`

Community:
- `社区` · `加入我们的社区` · `加入官方 QQ 群与 QQ 频道，获取帮助、参与讨论，第一时间了解新版本。`
- `官方 QQ 群` · `群号 {number}，与其他玩家交流反馈、获取帮助。` (number `737601250`) · `复制群号` → `已复制`
- `QQ 频道` · `第一时间获取官方公告、版本动态与频道活动。` · `加入频道`

Download:
- `下载选项` · `下载 Axolotl Launcher` · `桌面应用支持多个平台，请选择适合你的版本。`
- `版本通道` · `Release（稳定版）` / `Beta（测试版）` · `最新版本：{version}` (live site shows `最新版本：1.9.7`)
- `Windows` / `macOS` / `Linux` · `下载安装程序` · `下载 AppImage` · `显示其他软件包` / `隐藏其他软件包` · `下载 DEB` · `下载 RPM`
- `Axolotl 是基于 GPL-3.0 发布的自由软件。安装前请阅读隐私政策。`

Footer and navigation:
- `© {year} Axolotl Launcher 开发组` · `Axolotl 是 开源软件.`
- Links: `功能` `常见问题` `下载` `版本历史` `服务条款` `隐私政策`
- Disclaimer: `非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。`
- Header nav adds `更新日志`, `开放源代码`, `下载`.

Changelog page (`pages\changelog.vue`): `版本历史` · `更新日志` · `查看每个已公开发布版本的功能改进、变更与修复。`. Categories: `新增` `变更` `弃用` `移除` `修复` `安全`.

SEO:
- Title: `Axolotl Launcher - 支持 Modrinth 与 CurseForge 的开源 Minecraft 启动器`
- Static `<title>` in `nuxt.config.ts`: `Axolotl Launcher - 免费开源的 Minecraft 启动器`
- Structured data `alternateName`: `美西螈启动器`, `AXL Launcher`; organisation "Axolotl Launcher Team".

**Defined but currently not rendered** (still valid brand copy):
- `axolotl-marketing.demo.one-launcher` = `一个启动器，承载每一个世界。`
- `axolotl-marketing.demo.everything-together` = `配置、模组、存档和设置始终井然有序。`
- `axolotl-site.footer.cta-eyebrow` = `免费、开源，为 Minecraft 而生。`
- `axolotl-site.footer.cta-title` = `你的下一个世界，从这里开始。`
- `axolotl-site.footer.cta-description` = `安装 Axolotl，在一个清爽有序的空间中管理实例、模组与存档。`
- `axolotl-site.footer.download-now` = `立即下载`
- `axolotl-site.footer.view-github` = `前往 GitHub`
- `app-marketing.features.unlike-any-launcher` = `与众不同的启动器`
- `app-marketing.features.youve-used-before` = `带来前所未有的体验`

### 2.6 End-card slogan candidates (verbatim, with source)

| Slogan | Source |
|---|---|
| `次世代 Minecraft 桌面客户端，全能、美观、全平台覆盖。` | `E:\GitHub\Axolotl-animation\upstream\Axolotl\README.md` line 4 (the only occurrence of "次世代" in the repo) |
| `你的最后一款启动器` | installer hero `welcomeTitle` (`apps\installer-ui\src\installer.html`); onboarding footer `app.onboarding.welcome.footer`; About `app.settings.about.description` = `你的最后一款启动器。` |
| `你的下一个世界，从这里开始。` | website locale `axolotl-site.footer.cta-title` (unused) |
| `一个启动器，承载每一个世界。` | website locale (unused) |
| `免费、开源，为 Minecraft 而生。` | website locale (unused) |
| `管理 Minecraft 内容，不再绕路` | website highlights H2 (two lines) |
| `安装 Axolotl Launcher，开启Minecraft全新体验` | installer `welcomeCopy` (note: no spaces around "Minecraft" in source) |
| `MINECRAFT, ORGANIZED` | NSIS sidebar bitmap |
| `一切就绪` | onboarding welcome title `app.onboarding.welcome.title` (good for "the world is ready") |
| `下一个项目只差一次启动。` / `下一章从这里开始。` / `这个世界已经为你保存好了。` | home greetings (see §2.7) |

The installer hero is effectively a pre-designed dark end card. Render: `_scratch\07\installer-welcome.png`.
- `你的最后一款启动器`: 84 px, **weight 900**, tracking −0.04em, gradient text `linear-gradient(180deg,#fbcfe8,#f472b6)`, overlaid by a white radial "spotlight" that wanders over 16 s, plus drop-shadow `0 16px 32px rgba(244,114,182,.2)`.
- Behind it, blurred (120 px) pink `#f472b6` and violet `#8b5cf6` blobs drift slowly on `#09090b`.

### 2.7 Brand-voice cues

Tone: friendly, short, second person ("你"), light self-irony, Minecraft vocabulary (区块, 方块, 红石, 村民, 苦力怕, 营火, 出生点). The narrator jokes and never lectures. Examples (app `zh-CN/index.json`):

- Onboarding (`app.onboarding.*`):
  - `一切就绪`
  - `实例、内容、世界和下载，现在都有了同一个家。正式开玩之前，先快速逛一圈。`
  - Action buttons: `带我逛逛` / `先不逛了`
  - `搜索，不靠玄学`
  - `这才是值得掉进去的坑。`
  - `不会意外炖成一锅模组汤。`
  - `没人打卡。`
  - **`下载指挥室` / `安装和内容下载都会在这里报到，不会神秘消失。`**
  - **`没有东西会失踪`**
  - **`这里会按你的选择创建实例。我坚持不替你按确认。`**
  - `别把电脑烤熟`
  - `乱中有序。`
  - `Java，在后台` / `技术活，但它很听话。`
  - `点击任意位置，接着说` / `点击任意位置，收工`
- Home greetings (`app.home.greeting.{dawn,morning,afternoon,evening,night,late-night}`; each key holds a newline-separated list):
  - `下一块方块该你放下。` (visible in the reference screenshot)
  - **`世界已准备好接住你的下一步。`**
  - **`下一个项目只差一次启动。`**
  - `地图在等新的标记。`
  - `工作台正在待命。`
  - `下一章从这里开始。`
  - `新的一天正在加载。`
  - `这个世界已经为你保存好了。`
  - `下一局已经准备好，等你出发。`
  - `开始一段值得的游戏时光吧。`
  - `末地可以等等，除非它等不了。`
  - `苦力怕也不太像早起的人。`
  - `月亮还在加班。`
- Empty consoles (`packages\ui\src\locales\zh-CN\index.json`):
  - `暂无日志` / `点击右上角「开始游戏」即可接收实时日志`
  - server console: `欢迎使用 Axolotl 服务器！` / **`点击启动按钮即可启动服务器！`**
- Changelog jokes: `大幅提升下载性能（对的对的）。` (1.9.6), `关于页面新增彩蛋！可能较难发现哦~` (1.9.2).

### 2.8 Live-site captures (for reference)

These were taken from https://axlmc.org with headless Chrome on 2026-10-06. They match the source.

| Capture | File |
|---|---|
| Light hero | `E:\GitHub\Axolotl-animation\research\_scratch\07\site-hero-light.png` |
| Dark hero | `E:\GitHub\Axolotl-animation\research\_scratch\07\site-hero-dark.png` |
| Full pages | `site-full.png` (dark), `site-full-light.png` |
| 1000 px slices | `site-part-0..5.png`, `site-light-part-1..4.png` |

---

## 3. Motion language inventory (desktop app + shared UI)

### 3.1 Duration/easing usage tally (all `cubic-bezier` in `apps/app-frontend/src`, `packages/ui/src`, `apps/website/src`)

| Curve | Count | Character | Where |
|---|---|---|---|
| `cubic-bezier(0.4, 0, 0.2, 1)` | 8 | Material "standard" | NavRail and NavTabs sliding pills |
| `cubic-bezier(0.22, 1, 0.36, 1)` | 8 | ease-out-quint, soft long tail | sidebar width 320 ms (`App.vue`); onboarding brand lift, scan and panel; onboarding progress 280 ms; project page 280 ms (`pages\project\Index.vue`); merge-game banners; installer progress/text |
| `cubic-bezier(0.16, 1, 0.3, 1)` | 3 | ease-out-expo | onboarding logo reveal and wordmark |
| `cubic-bezier(0.15, 1.4, 0.64, 0.96)` | 3 | **springy overshoot** | `FloatingActionBar` enter (250 ms); `.nav-button-animated` (500 ms, `App.vue`, defined but unused) |
| `cubic-bezier(0.5, 0, 0.2, 1)` | 2 | — | slider opacity (250 ms, delay 50 ms) |
| `cubic-bezier(0.4, 0, 1, 1)` / `(0, 0, 0.2, 1)` | 2 / 2 | accel / decel | page-out 150 ms / page-in 170 ms (`SymlinkMethodCards.vue`) |
| `cubic-bezier(0.2, 0.8, 0.2, 1)` | 1 (+2 installer) | snappy decel | screenshot drag-gather 500 ms; installer screens 400 ms |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | installer only | back-out overshoot | installer completion logo 600 ms and badge 400 ms |
| `cubic-bezier(0, 0.6, 0.3, 1)` | 1 | fast-out | `Accordion.vue` expand (`grid-template-rows` 0.3 s), used by the website download "显示其他软件包" and the changelog entries. The website FAQ uses native `<details>` without animation. |

Plain `ease` / `ease-in-out` covers almost all chrome. Typical durations: 100, 120, 140, 150, 160, 180, 200 and 250 ms.

### 3.2 Press / hover / focus (the "button feel")

**Shared button** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\buttons\ButtonFrame.vue`):

```text
transition-[background-color,color,box-shadow,filter,opacity,transform] duration-150 ease-out
enabled:active:scale-[0.97]                                    // press
hover / focus-visible: brightness(var(--hover-brightness))      // light .9 (darker), dark 1.25 (brighter)
focus-visible: ring-4 ring-brand-shadow                         // 4px ring, rgba(219,39,119,.68) in light pink
disabled: opacity .5
```

- **`colored` (brand) button:**
  - fill `--color-brand` (`#db2777`), white text;
  - box-shadow `0 0 0 1px <brand 30%>, 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)`;
  - a **1 px inner top highlight**: `::before` with `linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0))`, mask-composited to a hairline that follows the radius.
- **`base` button:** `bg-surface-4` (`#ffffff`), `box-shadow: inset 0 0 0 1px var(--surface-5), 0 1px 1px rgba(0,0,0,.12)`.
- **Sizes:**

| Size | Height | Radius | Text / weight |
|---|---|---|---|
| `md` | 36 px | 12 px | 16 px / 600 |
| `lg` | 40 px | 14 px | — |
| `xl` | 48 px | 16 px | 16 px / **800**, icon 24 px |

- **Other press/hover patterns:**
  - Skins page action buttons: `active:scale-95`, `transition-[filter,transform] duration-200`.
  - Accent chips: `active:scale-[0.97]`, `transition-all`.
  - Home greeting title: hover lifts −2 px over 150 ms.
  - Instance icons (minimal home): hover scale 1.03.
  - Screenshot cards: hover `brightness(110%)`.
  - Nav buttons: hover `bg-surface-4`.
  - Back/forward pills: `hover:brightness-75`.
  - Sidebar handle: icon hover scale 1.12, press 0.9, 180 ms.
- **Website:** links change colour over 140 ms; community cards rotate to 0° over 160 ms ease; `.button-animation` = opacity .5 s, filter .2 s, transform .05 s.

### 3.3 Page and route transitions

- **Route change** (`App.vue` lines ~3168–3191; CSS in `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\assets\stylesheets\global.scss` lines 730–765). Pure **cross-fade**, no slide (despite the name `page-slide`):

  ```scss
  .page-slide-enter-active { transition: opacity 0.18s ease; }   .page-slide-enter-from { opacity: 0; }
  .page-slide-leave-active { transition: opacity 0.12s ease; pointer-events: none; } .page-slide-leave-to { opacity: 0; }
  ```

  - Both pages occupy the same grid cell, so the fade is a true cross-dissolve.
  - The animation is skipped when moving inside Settings (it keys on `settings-shell`).
  - It can be toggled off in Settings via feature flag `page_transitions` (default `true`). Copy: `页面切换过渡动画` / `在启动器页面之间切换时播放过渡动画。`
  - Heavy loading is deferred by `PAGE_TRANSITION_SETTLE_MS = 200` (`helpers\page-transition.ts`).
- **Generic `.slide`:** translateY(30px) → 0 → −30px, 200 ms ease (global.scss).
- **Settings content swap** (`pages\Settings.vue`):

| Element | Motion | Duration |
|---|---|---|
| header | opacity + translateY(−4px), mode out-in | 140 ms |
| skeleton | opacity + translateY(4px) | 160 ms |
| body | from opacity 0 / translateY(4px) | 180 ms ease |
| search results | stagger `--search-stagger` = min(index×28, 168) ms | — |
| search hit | flashes `bg-surface-3` twice (`settings-search-result-highlight`) | 0.9 s ease-in-out ×2 |

- **Skins page list ↔ armor tab:** opacity + translateY(8px), 180 ms, out-in.
- **Translation text** (`TranslatedProjectDescription.vue`, gallery): `translation-float-in`, opacity 0 → 1 and translateY 12px → 0, batch by batch.
- **Content cards:** fade-in for images, e.g. `.screenshot-card-fade` opacity 350 ms ease-in-out. Skeleton pulse uses Tailwind `animate-pulse` (2 s `cubic-bezier(.4,0,.6,1)`, opacity 1 → .5).

### 3.4 Navigation sliders: the "inchworm" (key signature)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\NavRail.vue` (left nav), and the same logic in `E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\base\NavTabs.vue` (all pill tab bars).

- A single absolutely positioned pill (`rounded-full`) sits behind the active 48×48 nav button. Its fill is `bg-button-bgSelected`: brand `#db2777` with a white icon in light theme; 25% brand with a brand-coloured icon in dark. Sub-page state uses `bg-surface-4`.
- On navigation, `top` and `bottom` animate independently. The edge in the direction of travel moves immediately and the trailing edge starts **120 ms later** (NavTabs: **200 ms**), with left/right handled the same way. The pill therefore **stretches toward the target, then contracts**, like a caterpillar.

```css
/* NavRail.vue */
transition:
  top    150ms cubic-bezier(0.4, 0, 0.2, 1) v-bind(topDelay),     /* 0ms when moving up, 120ms when moving down */
  bottom 150ms cubic-bezier(0.4, 0, 0.2, 1) v-bind(bottomDelay),  /* 0ms when moving down, 120ms when moving up */
  left   150ms cubic-bezier(0.4, 0, 0.2, 1),
  width  150ms cubic-bezier(0.4, 0, 0.2, 1),
  opacity 250ms cubic-bezier(0.5, 0, 0.2, 1) 50ms;
```

- NavTabs container: `rounded-full bg-surface-3 p-1 text-sm font-bold`, tabs `px-4 py-2`, slider `h-[calc(100%-0.5rem)]`.
- The active nav icon gets `filter: drop-shadow(0 0 0.5rem black)` (`NavButton.vue`).
- Release note (1.5.2): `左侧导航栏切换页面时, 选中高亮改为滑动过渡动画, 与顶部内容类型标签栏保持一致。`
- **Use for the film:** the launch button can travel with this same stretch-and-catch-up gait, at a slower cinematic scale (for example 300 ms legs with a 240 ms trailing delay).

### 3.5 Overlays: modals, tooltips, context menus, notifications, floating bars

- **NewModal** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\modal\NewModal.vue`):
  - **Opens from the mouse-down position.** The container starts at `translate((clickX − 50vw)/16, (clickY − 50vh)/16)` and the body at `scale: .97; opacity: 0`. Both settle to 0 / 1 in **200 ms** (container ease-out, body ease-in-out).
  - Body: `bg-surface-3`, `rounded-2xl` (16 px), 1 px `surface-5` border, shadow `4px 4px 26px 10px rgba(0,0,0,.08)`. Header `p-6` with a 1 px bottom border and a 24 px semibold title; the close button is a circular icon button.
  - Overlay: oversized (`inset: -5rem`, `border-radius: 180px`), fades in over 200 ms ease-out, `backdrop-filter: blur(5px)`.
  - Standard overlay tint: `linear-gradient(to bottom, color-mix(in srgb, var(--color-brand-shadow) 10%, rgba(0,0,0,.52)), color-mix(in srgb, var(--color-brand-shadow) 2%, rgba(0,0,0,.95)))`. Computed for light pink this is ≈ `rgba(28,5,15,.54)` → `rgba(3,1,2,.94)`, a near-black scrim with a faint wine tint (computed).
- **Tooltips** (`packages\ui\src\directives\tooltip.ts`, `packages\ui\src\styles\overlays.css`):
  - 200 ms show delay, 5 px offset, **no animation** (they pop in).
  - Fill `--color-tooltip-bg` (= surface-3), 1 px `surface-5` border, 8 px radius, `drop-shadow(2px 2px .4rem rgba(0,0,0,.5))`, 14.4 px/500, 14×7 px arrow.
- **Context menu** (`apps\app-frontend\src\components\ui\ContextMenu.vue`): fade, opacity 200 ms ease-in-out.
- **Notifications** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\nav\NotificationPanel.vue`):
  - Stack: 450 px wide, fixed bottom-right (24 px; 325 px from the right when the sidebar is open).
  - Each toast: `rounded-lg` (8 px), `bg-surface-3`, `shadow-xl`, with an **8 px coloured left stripe**. Stripe and icon colours: `bg-red` error, `bg-orange` warning, `bg-green` success, `bg-blue` info. Icons are 24 px (Issues / CheckCircle / XCircle / Info). Bold title, 14 px body (max 5 lines), copy/dismiss 24 px circular buttons, `x{count}` collapse counter.
  - **Enter:** `translateY(100%) scale(.8)` + opacity 0 → rest, **0.25 s ease-in-out**. **Leave:** `translateX(100%) scale(.8)` + fade. List reorders with the same 0.25 s move.
- **NotificationToast** (rich): radius 20 px, padding 16 px, 44 px avatar, `shadow 0 4px 8px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.2)`, bottom progress strip.
- **FloatingActionBar** (`packages\ui\src\components\base\FloatingActionBar.vue`): enters from `scale(.5) translateY(-10rem)`, opacity 0, over **0.25 s `cubic-bezier(0.15,1.4,0.64,0.96)`** (overshoot). Leaves to `scale(.96) translateY(-.25rem)` over 0.25 s ease.
- **Home calendar tooltip:** rises 4 px with opacity, 100 ms.

### 3.6 Loading states

- **Splash** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\SplashScreen.vue`). Always dark (`.dark` class):
  - centred `axolotl.png` at min(288px, 45vh/45vw);
  - a `ProgressBar` (max 320 px wide; 8 px track, fully rounded) with a fake fill of +2% every 5 ms up to 95%;
  - optional message `正在检查更新...` / `正在更新应用目录...`;
  - background layers: `linear-gradient(180deg, rgba(255,77,157,.24), rgba(48,16,40,.56))` over `rgba(22,18,28,.68)`, over the maze-cube image (180vw/180vh, opacity .8), over `surface-1`;
  - minimum 500 ms on screen, then **fades out 0.3 s ease-in-out**;
  - its glow effect was removed in 1.9.6 (`移除启动画面的发光效果，使其外观更加简洁。`).
- **Top LoadingBar** (`packages\ui\src\components\base\LoadingBar.vue`):
  - 2 px tall, radius 2 px, pinned under the top bar inside the content pane;
  - gradient `--loading-bar-gradient` = `linear-gradient(to right, #db2777, #e76ca3)` (second stop = `color-mix(#db2777 68%, white)`, computed);
  - width grows every 100 ms; transitions `width .1s ease-in-out, height .1s ease-out, opacity .4s`; hides 500 ms after finishing;
  - faint radial brand glow behind (`::before`, opacity .1).
- **ProgressBar** (`packages\ui\src\components\base\ProgressBar.vue`):
  - 8 px (`h-2`), fully rounded; track `bg-brand-highlight` (25% pink), fill `bg-brand`;
  - fill has a 2 px white→transparent gradient inner border (`::after`);
  - width transition 0.2 s ease-in-out;
  - indeterminate mode slides a 20–60% segment across, 1 s linear infinite; striped variants available.
- **Spinners:** `SpinnerIcon` + Tailwind `animate-spin` (1 s linear). The Downloads page and play buttons use it ("正在启动…… {n} 秒").
- **LoadingIndicator** (`packages\ui\src\components\base\LoadingIndicator.vue`): "Loading" title with animated dots (2 s steps). Three 64 px placeholders (radius 16 px) breathe their opacity .25 ↔ .5 over 4 s with 0.3 s staggers; a diagonal shimmer sweeps across over 4 s.
- **SkinButton skeleton:** horizontal wave gradient, 1500 ms linear.

### 3.7 Selection, highlight and attention effects

- **World highlight** (`apps\app-frontend\src\components\ui\world\WorldItem.vue`, class `.world-item-highlighted`). Both keyframes run **4 s ease-out**:
  - `fade-highlight` holds `brightness(1.25)` until 75% (about 3 s), then eases back to 1;
  - a `rounded-xl` `::before` draws a **1.5 px brand border plus `0 0 8px 2px` brand glow**. It holds opacity .5 until 75%, then fades to 0.

  This is a natural "you landed here" effect.
- **Onboarding spotlight** (§3.9): breathing brand corner brackets.
- **Screenshot card highlight:** `!border-brand ring-2 ring-brand animate-pulse`.
- **Shake (error):** `method-shake`, 0.45 s, translateX −6/6/−4/4 px (`packages\ui\src\components\flows\drop\SymlinkMethodCards.vue`).
- **Long-press progress:** `long-press-bar-fill` 0 → 100% width, 480 ms linear (`ContentMetadataFilterBar.vue`). **Capture drain:** 100% → 0 (`KeybindingModal.vue`).
- **Breadcrumb overflow:** text ping-pongs horizontally over 10 s ease-in-out (`Breadcrumbs.vue`).
- **Screenshot drag-gather** (`apps\app-frontend\src\components\ui\screenshots-page\drag-gather.vue`, `use-screenshot-drag-gather.ts`). When several selected screenshots are dragged:
  - every selected card flies from its grid position to the pointer in **500 ms `cubic-bezier(0.2,0.8,0.2,1)`**, staggered `min(index,8)×10 ms`;
  - they form a **stacked deck**: a back card inset 12 px at opacity .6, a middle card inset 6 px at opacity .8, and a count `TagItem` badge that appears at 350 ms;
  - the overlay fades out over 150 ms.

  This is a ready-made "everything regroups around the cursor" finale move.

### 3.8 Brand intro: first-run welcome (copy this for the end card)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\OnboardingWelcome.vue`. Full-screen `--color-bg`, with logo and wordmark centred side by side (gap clamp(12px, 2vw, 24px)).

| t (ms) | Element | Animation |
|---|---|---|
| 0–900 | Logo (clamp(112px, 15vw, 176px)) | `scale .72 → 1.04 (65%) → 1`, opacity 0 → 1, `cubic-bezier(0.16,1,0.3,1)` |
| 900–1950 | Wordmark container | `max-width 0 → 42rem` (unrolls left→right), same curve |
| 900–1950 | Each word (`Axolotl`, `Launcher`) | `translateX(-4rem) → 0`, opacity 0 → 1 |
| 2050–2750 | "Axolotl" pink overlay copy (`::after`, `color: var(--color-brand)`) | `clip-path: inset(0 0 0 0) → inset(0 0 0 100%)` (pink wipes away left→right), holds the first 12%, `cubic-bezier(0.22,1,0.36,1)` |
| 2400–3100 | "Launcher" pink overlay | same, delayed |
| 0–3200 | Whole brand group | stays centred until 70% (2240 ms), then rises to `top: clamp(9rem, 33vh, 18rem)` |
| 3200–3850 | Bottom panel | `translateY(100%) → 0`, opacity 0 → 1; has a 2 px brand line on its top-left (width clamp(64px, 12vw, 160px)) |

Wordmark styling:
- "Axolotl": 72 px (`4.5rem`), weight 800, gradient text `linear-gradient(90deg, var(--color-text-primary), var(--color-text-default))`, i.e. `#1a202c → #2c2e31` in light.
- "Launcher": colour `--color-text-tertiary` (`#484d54`), weight 650.

Copy: `一切就绪` (36 px, weight 750) · `实例、内容、世界和下载，现在都有了同一个家。正式开玩之前，先快速逛一圈。` · language picker `语言` / `系统语言` · primary brand button `带我逛逛` with `→` · footer `你的最后一款启动器` and a quiet `先不逛了`.

### 3.9 Onboarding tour overlay

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\onboarding\OnboardingOverlay.vue`, `OnboardingDialogue.vue`, `OnboardingMascotStage.vue`.

- **Mask:** a rounded hole (radius 12 px) in a `rgba(0,0,0,.55)` scrim (`box-shadow: 0 0 0 9999px`). The hole glides to each target over **160 ms ease** (left/top/width/height).
- **Spotlight corners:** four 12×12 px L-brackets, 2 px brand stroke, at the target's corners. The set breathes (`onboarding-focus`, scale 1 ↔ 1.015, 1.6 s ease-in-out infinite). This is a "viewfinder" look; good for the cursor locking onto the button.
- **Dialogue:** docked at the bottom (border-top 1 px divider) or a floating card (radius 16 px, padding 20 px, shadow `0 18px 48px rgba(0,0,0,.35)`, `--color-super-raised-bg` = white).
  - The mascot is picked at random (`axo-teaching` or `axo-searching`) and shown at 96–128 px (×1.35 when floating).
  - Step counter `3 / 18` in 13 px bold brand; title 20 px/700; body 16 px, line-height 1.55.
  - Hint row: brand-coloured `→` plus text such as `点击发现内容，继续`.
  - A 2 px brand progress line on top animates its width over 280 ms `cubic-bezier(0.22,1,0.36,1)`.
  - Mascot alt text: `引导吉祥物`.

### 3.10 Website and installer motion (brand-adjacent)

**Website** (`apps\website\src\pages\index.vue`):
- Hero pointer glow follows the mouse instantly (dark theme only).
- **Scroll mark:** a 1×48 px line at bottom 36 px with a pink 45%-tall segment that travels `translateY(-110%) → 220% (55%) → -110%` over **2.3 s ease-in-out infinite**.
- Projects marquee: 40 s linear, alternating direction; hover pauses.
- Mods table row removal: 200 ms.
- Header mobile menu: 160 ms.
- `LogoAnimated.vue` (defined, unused): 80 px logo floating `translateY(0) rotate(-2deg) ↔ translateY(-0.4rem) rotate(2deg)`, 3.5 s ease-in-out infinite, with drop-shadow `0 12px 24px rgb(245 139 174 / 28%)`. An on-brand idle bob.
- Reduced motion is honoured (an extra `.reduced-motion` class kills all animation).

**Modern installer** (`apps\installer-ui\src\installer.html`, 940×620, bg `#09090b`):
- Ambient blobs (`filter: blur(120px)`):
  - idle: pink `#f472b6` and violet `#8b5cf6` at .55 opacity, drifting 10 s / 14 s (`float1` / `float2`: translate ±15–25%, scale .85–1.2);
  - while installing: they cross-fade over 1.5 s to stronger `#ec4899` / `#a855f7` at .7 and flow faster (4 s / 3 s, scale up to 1.4).
- Screens: `translateY(20px) scale(.98)` → rest, 400 ms `cubic-bezier(0.2,0.8,0.2,1)`.
- Progress:
  - big 48 px/800 percentage with a white text-glow;
  - 6 px track `rgba(255,255,255,.1)`;
  - fill `linear-gradient(90deg,#ec4899,#f472b6,#fff)` with `box-shadow 0 0 12px #f472b6`, width 400 ms `cubic-bezier(0.22,1,0.36,1)`.
- **Completion:**
  - 80 px logo tile (radius 16 px, shadow `0 8px 32px rgba(244,114,182,.4)`) pops from scale .5 / +20 px over 600 ms `cubic-bezier(0.34,1.56,0.64,1)` (delay .1 s);
  - a 32 px green `#1bd96a` check badge pops at 0.5 s (400 ms, same curve);
  - title `Axolotl Launcher 已就绪` and line `安装已成功完成，现在可以开始使用你的全新启动器。` slide up 20 px (600 ms, delays .2 s / .3 s);
  - footer button `启动 Axolotl Launcher` (pill, `#db2777` fill, `#be185d` border, hover `#ec4899` with glow).

### 3.11 What feels on-brand (synthesis, to guide the film)

1. **Quiet chrome, expressive brand.**
   - Functional UI changes are short and fade-led: 120–200 ms, opacity-first, small 4–12 px nudges.
   - Brand moments use long-tail expo/quint curves of 600–1000 ms (logo, wordmark, completion).
   - Keep UI reactions crisp and save big moves for the button and the finale.
2. **Elastic but restrained.**
   - Overshoots are small: logo 1.04, FloatingActionBar spring, easeOutBack spawns.
   - Press is a gentle 0.97 squash.
   - The game physics allow bigger squash (about ±20%) with fast decay (about 220 ms). That is the right range for the button character.
3. **Spatial continuity.** Modals grow from the click; tabs and nav pills slide and stretch toward the target; screenshots fly to the cursor. Things in Axolotl always come from or go to where the user is. Let every transformation of the button start where the previous one ended.
4. **Light as material.** Use pink glows, faint grid lines, inner 1 px white top highlights on brand buttons, and soft layered shadows (`0 2px 4px … 0 24px 48px` at 3–4%). Avoid neon or hard drop shadows.
5. **Suggested numeric presets for the button**, all derived from code:

| Moment | Values | Code source |
|---|---|---|
| Press | scale 0.97 → (film) 0.92, 150 ms ease-out; release `cubic-bezier(0.34,1.56,0.64,1)` 400–600 ms | ButtonFrame, installer |
| Landing | `sx = 1 + 0.2·impact`, `sy = 1 − 0.16·impact`, decay 4.5/s (≈ 220 ms); 4–11 splash dots `#ceecff` | axolotl-run |
| Airborne | stretch Y `+0.1·v`, tilt `−0.16·v` rad (v = normalised vertical speed) | axolotl-run |
| Ground idle / run | bob `sin(15t)·1.4px`, tilt `sin(15t)·0.04` rad | axolotl-run |
| Spawn pop | easeOutBack over 220 ms | merge game |
| Arrive | from scale .5 + −10rem, 250 ms `cubic-bezier(0.15,1.4,0.64,0.96)` | FloatingActionBar |
| Crawl | inchworm, leading edge first, trailing edge +120 ms, 150 ms legs `cubic-bezier(0.4,0,0.2,1)` | NavRail |
| Regroup | 500 ms `cubic-bezier(0.2,0.8,0.2,1)`, 10 ms stagger | drag-gather |
| Highlight on arrival | 1.5 px brand ring + 8 px glow, fading over 4 s; or breathing corner brackets 1.6 s | WorldItem / onboarding |

---

## 4. Easter eggs and mascot interactions

All of these live in **Settings → 关于** (`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\settings\AboutSettings.vue`) unless noted.

### 4.1 About hero: 3D swimming axolotl (`AboutScene.vue`)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AboutScene.vue` (three.js).

- **Host:** a 256 px tall (`h-64`), full-width, `rounded-xl` canvas inside the About panel (panel: `surface-3`, 1 px `surface-4` border, radius 12 px, padding 20 px). The bottom 3% fades out through a mask.
- **Canvas background:** `linear-gradient(to bottom, color-mix(in srgb, var(--color-brand) 36%, var(--surface-1) 100%), transparent 40%)`. In light pink that resolves to about `#e7b7cc` → transparent (computed).
- **Scene:**
  - the **glTF voxel axolotl** (`public\models\axolotl.gltf`) scaled ×5 and playing its **`swim`** clip;
  - it bobs `y = sin(t)` and yaws `sin(0.3t)·0.2 + 100°`;
  - camera: perspective FOV 21°, at (−10, 5, 30), with **mouse parallax** of ±1 unit x and ±0.5 unit y;
  - **three wavy "water line" planes** (Perlin-noise shader) tinted with the accent: ×2.4 in light, ×0.6 in dark;
  - a stream of **glowing ring bubbles** (0.6-unit planes, ring shader) spawning every 0–0.8 s and rising at 2 units/s, tinted accent ×3 (light) or ×1.2 (dark).

  In light theme the multiplied accent saturates toward a hot magenta (inferred, about `#ff0c70`).
- Below the canvas: `关于 Axolotl Launcher` (20 px semibold), `版本 1.9.7` (tertiary), `你的最后一款启动器。`.

### 4.2 Long-press a team member → a mini-game (added 1.9.2: `关于页面新增彩蛋！可能较难发现哦~`)

- Team grid `开发组` (`data\about\team.json`): 2–3 columns, gap 12 px. Cards are `bg-surface-4` (white), `rounded-xl`, padding 16 px, with a 64 px round avatar and a bold name.
- **Pointer-down on a member that has an `experience`, held 800 ms** (cancelled if the pointer moves > 8 px), starts the game:
  - while pressing, the card shows **`ring-4 ring-brand-shadow`** (4 px pink ring at 68%);
  - the game then **replaces the 3D scene inside the same 256 px host** (absolute, `inset-0`, `z-10`) and the page smooth-scrolls it to centre (`about-member-experiences.ts`).
- Mapping: **Mystic Stars → `axolotl-merge`** ("合成美西螈", shipped in v1.9.7). **zzhzhouzhou → `axolotl-run`** ("美西螈快跑", on `main` only after v1.9.7).
- Both games share a header: 48 px tall, `bg-surface-2`, 1 px `surface-5` bottom border, title 14 px semibold, pill counters `bg-surface-3`, small base buttons.

### 4.3 合成美西螈: axolotl merge (Suika-style)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AboutMergeGame.vue`. Ball art: `assets\axolotl-balls\*.png`.

- **Play:** click the field to **drop a pink axolotl ball**: `点击场地，投放粉色美西螈`. Two balls of the same level merge into the next level.

| Level | Colour | Radius (× min(w,h)) | Points |
|---|---|---|---|
| 0 pink | `#ff8fb3` | .055 | 10 |
| 1 yellow | `#ffd866` | .075 | 25 |
| 2 cyan | `#54c9c4` | .098 | 60 |
| 3 red | `#e5484d` | .128 | 120 |
| 4 blue | `#5c8ee8` | .164 | 250 |
| 5 rainbow | `#f05ed2` | .21 | 1200 |

- **Physics:** gravity `max(650, 2.8·height)` px/s²; floor bounce restitution 0.16 (only if |vy| > 35); wall restitution 0.3; ball–ball impulse 0.35; 3 solver passes; drop cooldown 180 ms.
- **Spawn:** scale with **easeOutBack over 0.22 s** (a little "boing").
- **Merge FX:**
  - particle burst (10 + 3·level particles, speed 130 + 20·level, life .55–1.05 s);
  - **white shockwave ring** (radius 46 + 26·level, 0.45 s easeOutCubic, line width 1.4–3 px);
  - screen shake `min(2 + 1.2·level, 7)` px (exponential decay, rate 7/s);
  - floating `+points` text (800 weight, 15 + 3·level px, 55% black stroke, rising 34 px/s for 1.1 s).
- **Water:**
  - playfield = page `surface-1` with a 7% brand tint toward the floor;
  - water body `rgba(120,200,255,.32) → rgba(24,70,190,.2)`;
  - surface drawn as a wavy double line (5 px `rgba(96,178,255,.4)` plus 1.8 px white `.75`);
  - rising bubble rings; a sandy 26 px floor.
- **Tide:** the water falls 0.5% of the height per second (`潮水正在退去，别让美西螈搁浅！`). A ball resting above the waterline for 0.5 s flashes a red ring and ends the game: **`美西螈搁浅了！`**. On game over a brand-tinted "tide drain" sheet slides down (900 ms ease-in).
- **Rainbow + rainbow:**
  - `潮水大涨！` / `水位回升，继续合成！`, +2000;
  - double shockwave (white, `#ffd866`) and shake 13;
  - water surges back to 5% in 0.8 s (easeInOutCubic) and holds for 15 s;
  - rainbow banner (`glow-pop`: from translateY(−8px) scale .7 to rest, 600 ms `cubic-bezier(0.22,1,0.36,1)`);
  - rainbow-text gradient `#ff8fb3 → #ffd866 → #54c9c4 → #5c8ee8 → #f05ed2`.
- **Strings:** `合成美西螈` · `分数：{score}` · `最高等级：{level}` · `最高分：{score}` · `结算` · `重新开始` · `退出游戏` · `彩虹美西螈！` · `结算完成！` · `新纪录！` · `加时次数`.

### 4.4 美西螈快跑: axolotl run (Chrome-dino-style; unreleased on `main`)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AboutAxolotlRun.vue` (2134 lines). Canvas with a logical height of 256 and pixelated rendering.

- **Hero:** the 200×142 voxel axolotl sprite drawn at 52×37, at x = 42, on a 16 px tiled **clay** floor at y = 222.
- **Controls:** Space / ↑ / W / click to jump; `轻点为小跳，按住可高跳`; `按空格或点击开始`.
- **Physics (copy for "weight + elasticity"):**

```ts
GRAVITY = 2300; JUMP_VELOCITY = 520; HOLD_GRAVITY_FACTOR = 0.55 /* floatier while held */; JUMP_CUT = 0.45
// drawPlayer():
const bob     = running ? Math.sin(elapsed * 15) * 1.4 : 0
const v       = clamp(player.vy / JUMP_VELOCITY, -1, 1)
const stretch = 1 + v * 0.1 - landImpulse * 0.16   // Y scale
const squash  = 1 - v * 0.1 + landImpulse * 0.2    // X scale
const tilt    = running ? Math.sin(elapsed * 15) * 0.04 : -v * 0.16  // radians
// landing: landImpulse = min(1, |vy|/520) if > 0.28, decays 4.5/s; splash = 4+7·impact dots (#ceecff), gravity 620
```

- **World:**
  - underwater sky with a 48 s day/night colour cycle: a three-stop vertical gradient interpolated between keyframes. Night top/mid/bottom = `rgb(10,37,64)` / `rgb(18,58,94)` / `rgb(12,32,54)`; midday = `rgb(16,98,152)` / `rgb(56,150,192)` / `rgb(24,78,116)`. The sky is independent of the app theme.
  - a muted sun/moon riding an arc as a timer;
  - 5 parallax light rays `#8fe0ff` (opacity .09–.18);
  - floating sea lanterns (alpha .4) and background corals (alpha .22), scrolling at 0.12 / 0.22 / 0.42× parallax;
  - 30 swaying seagrass/kelp sprites; 18 rising bubbles `rgba(190,232,255,.15)`.
- **Obstacles:** stacked corals (colours `#7fd4ff #ff6b6b #c96bff #ffd24a #ff7fb5`); pufferfish (pulsing ±6%); **thrown tridents** at 1.65× world speed, telegraphed by a pulsing red lane warning with chevrons.
- **Power-ups:** bob ±4 px with a coloured radial glow.
  - Effects: conduit `潮涌核心` (blue aura), dolphin `海豚的恩惠`, golden apple, totem `不死图腾` (golden rays plus screen flash), swiftness `迅捷` / slowness `迟缓`, stew `迷之炖菜`, milk `牛奶`, diamond `钻石` (+500), TNT.
  - Effect chips sit top-left on the canvas: dark translucent pill with a 2 px coloured left edge.
- **Feedback:**
  - damage = red flash `rgba(229,72,77,.4)` plus shake;
  - floaters `连跳 +{score}` `极限高度 +{score}` `残血通关 +{score}`;
  - 3 pixel hearts (7×6 grid, `#e5484d`) in the header.
- **Strings:** `美西螈快跑` · `得分：{score}` · `最佳：{score}` · `游戏结束` · `新纪录！` · `重新开始` · `退出游戏`.

### 4.5 Keyboard secrets → "坦克动荡" (off-brand)

In About:
- typing **`cyf112233`** or **`cxkcxkckx`** opens `彩蛋小游戏` (an 832 px `NewModal` with a 800×600 iframe of `public\easteregg\games\game.html`);
- the **Konami code** (↑↑↓↓←→←→BA) opens `贡献者彩蛋` with `点击以打开彩蛋小游戏`.

The game is a green-themed PIXI tank game titled `坦克动荡 - 战术版`. It is unrelated to the brand, so do not use it.

### 4.6 Developer mode: tap the logo 6 times

In the Settings sidebar footer, the 32 px `axolotl.png` button next to `Axolotl Launcher 1.9.7` / `macOS 26.3.0` toggles developer mode on the **6th click** (`pages\Settings.vue`, `toggleDeveloperMode`). The logo button turns brand-coloured and `开发者模式已启用。` appears. Modrinth heritage.

### 4.7 Skin viewer: poke the player (fun cameo)

`E:\GitHub\Axolotl-animation\upstream\Axolotl\packages\ui\src\components\skin\SkinPreviewRenderer.vue` and `packages\ui\src\composables\skin-rendering\use-skin-preview-animation.ts`.

- The 3D player idles (`idle` plus random `idle_sub_1..3`, about every 10 s). Dragging rotates it (`拖动以旋转`). A plain click plays the **`interact`** animation (0.5 s) and adds a **wobble impulse**:
  - shake offset ±0.035 and roll ±0.055 rad;
  - squash X +1.8%, Y −2.5%;
  - phase speed 18 + 7·energy;
  - energy decays at 2/s.
- **Clicking fast enough to reach 5 energy (≥ 2 clicks/s) makes the model flash red** like Minecraft damage: colour `#bd2f2f` at 0.7 intensity for 0.2 s, at most once per 0.7 s.
- Visuals: nametag in the Minecraft font on a translucent dark chip; a soft radial spotlight disc under the feet; the canvas fades in over 500 ms.

### 4.8 Mascot art in onboarding

The randomly chosen `axo-teaching.svg` or `axo-searching.svg` (§1) appears beside every tour step. There is no other mascot animation; the mascot is static.

### 4.9 Historic ASCII axolotl (removed)

In 1.5.2 the empty log console showed `中文启动提示, 以及贴近启动器图标的粉色美西螈侧视字符画`. In the current code, `packages\ui\src\layouts\shared\console\components\LogViewport.vue` uses the generic `EmptyState` (`暂无日志` / `点击右上角「开始游戏」即可接收实时日志`). The ASCII art is gone.

---

## 5. Survey of remaining pages

Theme assumed: light + pink.

| Token | Value |
|---|---|
| Page `surface-1` | `#ebebeb` (sampled ≈ `#ebe9eb`) |
| Cards `surface-3` | `#f8f8f8` |
| Raised `surface-4` | `#ffffff` |
| Strokes `surface-5` | `#dddddd` |
| Brand | `#db2777` |
| Text | `#1a202c` / `#2c2e31` / `#484d54` |
| Right sidebar | `--brand-gradient-bg` (brand 14% → 9%; sampled `#ebd9e2`) with a 1 px `rgba(219,39,119,.16)` left border |

Default theme for new installs is **dark** (`DEFAULT_THEME_STORE.selectedTheme = 'dark'`, accent `pink`, in `apps\app-frontend\src\store\theme.ts`).

Nav labels (`App.vue` → zh-CN):

| Label | Notes |
|---|---|
| `主页` | — |
| `截图中心` | — |
| `世界` | hidden by flag `worlds_tab:false` |
| `发现内容` | — |
| `皮肤选择器` | — |
| `多人游戏` | — |
| `实例库` | — |
| `实验室` | — |
| `下载` | — |
| `创建新实例` | — |
| `设置` | — |

When downloads are active, the 下载 nav icon shows a **pink count badge** (min 16 px, height 16 px, 10 px bold white text, `bg-brand`, top-right).

### 5.1 Skins (`/skins`) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Skins.vue`

**Layout.** Two columns (1fr : 2.5fr, gap 40 px).
- Left (sticky): H1 `皮肤选择器` (24 px bold), then a large 3D `SkinPreviewRenderer`. It has a nametag, an initial yaw of π/8, and a `预览` badge (blue chip with an Eye icon) when an unsaved skin is shown. Its height is the window height minus 176 px (min 224 px).
- Under the preview, an action row of 40 px pill-ish buttons (radius 14 px, `shadow-md`, `active:scale-95`): `编辑皮肤` · or `重置` + `应用` (brand fill) · armor preview controls (盔甲/纹饰, since 1.9.7).
- Right: `NavTabs` `已保存皮肤` / `官方皮肤` plus a brand button `+ 创建皮肤` (opens Lab skin editor). Then a virtualized grid of skin cards (aspect 31:40, radius 20 px, front/back renders, hover overlay buttons sliding up 8 px). Official sections include `默认皮肤`, `MINECON Earth 2017`, `建造者与生物群系`, `苍园觉醒`, `追逐天空`, `铜器时代`, `群骑纷争`, `小鬼当家`, `混沌立方`.
- Signed-out state: a centred `surface-3` card (`请登录`, `请登录您的 Minecraft 账号，以便使用 Axolotl Launcher 的皮肤管理功能。`, brand `登录` button) with **the 144 px axolotl logo perched on top of the card** (−128 px). Its 1 px top accent line uses `--color-green` (a Modrinth leftover).

**Other strings:** `慢点！` · `应用` · `拖动以旋转` · `离线皮肤兼容性` · `第三方皮肤管理`.

**Cameo idea:** the button bumps into the 3D player and the model plays its interact wobble. If the cursor clicks it impatiently 5×, it flashes **red** (`#bd2f2f`) as if hurt, which is a gag that exists in the product. The player could also "wear" pink armor trim.

### 5.2 Worlds (`/worlds`) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Worlds.vue`

**Placeholder only:** it renders the word `世界` and is hidden by default (`worlds_tab: false`). In practice worlds appear as the home widget `固定的世界` (see the home screenshot: `新的世界` · `单人游戏` · `生存模式` · `开始游戏`) and in each instance's worlds tab (`WorldItem.vue`).

**Strings:** `极限模式` · `世界正在使用中` · `游玩实例` · `固定到主页` · `暂未游玩` · `{count} 人在线` · `离线`. Note the mistranslation `instance.worlds.create_shortcut` = `创建快照`.

**Cameo:** when the button "lands" on a world row, use the WorldItem highlight: a 1.5 px brand ring plus 8 px glow fading over 4 s, with a 1.25 brightness pulse.

### 5.3 Multiplayer (`/multiplayer`) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Multiplayer.vue` + `components\multiplayer\`

Page: H1 `多人游戏`, `NavTabs` `服务器` (ServerIcon) / `联机房间` (UsersIcon).

**Servers tab** (`components\multiplayer\servers\ServersOverview.vue`, `ServerCard.vue`): locally hosted servers.
- Strings: `创建服务器` · `还没有服务器` · `在启动器中创建服务器，与好友一起游玩。`
- Cards have a literal **`启动`** / `停止` button (`app.servers.action.start` / `.stop`).
- The server console empty state reads **`欢迎使用 Axolotl 服务器！` / `点击启动按钮即可启动服务器！`**.

**Rooms tab** (`components\multiplayer\MultiplayerRooms.vue`): virtual-LAN rooms via **陶瓦联机 (Terracotta)** or **红石联机 2 (RedStone Online 2)**.
- Strings: `创建房间` / `加入房间` · `创建虚拟局域网房间，让好友直接连接到你的游戏。` · `房间码` (example `例如 U/ABCD-EFGH-IJKL-MNOP`) · `将此代码分享给好友：` · `房主` / `访客` · `由 Terracotta | 陶瓦联机 强力驱动`.
- Statuses: `正在扫描...` `房间已就绪` `正在加入...` `已连接到房间`.
- RedStone: `中转节点` · `自动优选 — 最低延迟` · `创建公网房间` · `公网地址`.

**Cameo:** the button "teleports" through a room code `U/XXXX-XXXX-XXXX-XXXX`, or hides among server cards that each have a `启动` button (a decoy gag: "wrong 启动!").

### 5.4 Friends (`components\ui\friends\FriendsList.vue`, `FriendsSection.vue`)

**Dormant Modrinth feature.** It is not mounted anywhere and needs a Modrinth account (`AxolotlBrandConfig.capabilities.privateModrinthServices = false` in `apps\app-frontend\src\config.ts`). Strings exist (`好友`, `添加好友`, `你好友的 Modrinth 用户名是什么？`, `没有待处理的好友请求 :C`) but **do not depict it** as a product feature.

### 5.5 Downloads (`/downloads`) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Downloads.vue`

**Layout.**
- Top row: `NavTabs` `正在进行` / `历史记录` and a brand button `+ 新建下载`.
- Filter row: search `搜索下载任务`, comboboxes `所有来源`, `所有状态`, and `清空历史`.
- Job **cards** (`Card`, padding 16 px):
  - 48 px rounded-xl icon tile (instance icon, or `bg-brand-highlight` with a brand `DownloadIcon`);
  - title (18 px semibold);
  - `TagItem` job type (e.g. `升级`, `内容更新`);
  - status **Badge** coloured green `已完成` / orange `进行中`, `需要操作` / red `失败`, `已中断`, `已取消` / blue `排队中`;
  - phase line (e.g. `正在下载 Minecraft`, `正在安装加载器`, `正在解析整合包`, `正在下载内容`, `正在完成安装`), date, `目标实例：{instance}`;
  - 8 px brand `ProgressBar`, speed `速度：{speed}/秒`, ETA `预计剩余 {seconds} 秒`.
- Sources: `官方`, `OpenBMCLAPI 镜像`, `MCIM 镜像`, `Tianpao 镜像`.
- Empty state: `暂无下载任务` / `新的下载与安装进度会显示在这里。`

**Onboarding copy:** `下载指挥室` / `安装和内容下载都会在这里报到，不会神秘消失。` / `没有东西会失踪`. This is perfect irony for the missing button.

**Cameo:** the cursor checks the download queue for the missing button. A job card named after the button could sit `排队中` (queued), or the nav badge could tick "1".

### 5.6 Screenshot Center (`/screenshots`, new in 1.9.7) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\screenshots-page\`

**Layout.**
- Heading `截图`; toolbar: `搜索` · `排序方式` (`最新` / `从旧到新` / `截图名`) · `分组方式` (`按日期` / `实例` / `自定义分组` / `不分组`) · `新建分组`.
- Collapsible sections: `今天` `昨天` `本周` `本月` `全部截图` `未分组`.
- Grid of **16:9 cards**: `rounded-xl`, 1 px `surface-5`, `bg-surface-2`, `shadow-sm`, hover brightness 110%.
  - On hover a bottom gradient overlay reveals the name and actions (translateY 4 px → 0).
  - A round selection check appears on hover.
- Selection bar: `已选 {count} 项`, `导出为ZIP`, `将其移出分组`.
- Empty states: `暂无截图` / `在游戏中截取的截图将显示在这里。`

**Signature motion:** the **drag-gather deck** (§3.7). The film can borrow it: UI cards fly into a deck around the cursor.

Note: the leftover export filename `Modrinth 截图.zip`; avoid showing it.

### 5.7 Settings (`/settings`) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\pages\Settings.vue`

**Current layout (v1.9.7):** a full-page shell, **not** the modal shown in `research\ref\theme-accent.png` (that image is v1.6.0).
- Left sidebar:
  - search `搜索设置`;
  - grouped, collapsible categories: `外观`, `首页与导航`, `键盘快捷键`, `语言与翻译`, `AI 功能` · `启动默认值`, `实例同步`, `Java 与性能`, `内容与下载`, `网络与多人游戏` · `存储与备份`, `隐私与数据共享` · `更新`, `关于`, `日志与诊断` (`功能开关` for developers);
  - footer identity: 32 px logo + `Axolotl Launcher 1.9.7` / `macOS 26.3.0`.
- Right: content header (icon + 20 px title) with the transitions in §3.3.

**Accent picker 强调色** (`components\ui\settings\AppearanceSettings.vue`). Description: `选择用于按钮、选中状态和高亮元素的颜色。`
- A flex-wrap row of chips (radius 8 px, padding 10 px vertical / 8 px horizontal, 1 px border, weight 600, 16 px colour dot with a `ring-2 white/20`): `粉色` `橙色` `绿色` `蓝色` `紫色`, plus `跟随系统` and `自定义`.
  - Unselected chips: `border-surface-4 bg-surface-3`, tertiary text.
  - The custom dot is a conic rainbow `#ef4444,#f59e0b,#22c55e,#06b6d4,#6366f1,#ec4899`.
  - Selected chip: `border-brand bg-brand-highlight text-brand` with a 14 px check at the right.
  - Press: `active:scale-[0.97]`.
- Custom panel:
  - `色相` hue slider: 12 px tall, fully rounded, `linear-gradient(to right, hsl(0..360, 80%, 55%))`;
  - the **thumb is a 20 px brand-coloured circle with a 3 px `surface-4` border and `--shadow-button`**, i.e. it looks like a tiny pink button;
  - `十六进制色号` hex input (default `#db2777`);
  - preview dots `浅色主题` / `深色主题`.
- Accent hexes: pink `#db2777` (light) / `#f472b6` (dark); orange `#e08325` / `#ffa347`; green `#00af5c` / `#1bd96a`; blue `#1f68c0` / `#4f9cff`; purple `#8e32f3` / `#c78aff`.
- The v1.6.0 screenshot instead shows a row of 12 preset dots. That UI no longer exists.

**Launcher background 启动器背景.** Description: `选择或拖入自定义图片，并调整它与启动器界面的融合效果。`
- 176 px drop zone (radius 8 px, 1 px `surface-4`, `bg-surface-1`; `border-brand` while dragging) with an image icon and `尚未选择自定义背景` / `点击选择，或拖放图片到此处`.
- With an image: sliders `背景模糊` (0–40 px, default 12), `背景可见度` (10–100%, default 65), `组件不透明度` (0–100%, default 100), and buttons `更换图片` / `移除`.
- `透明背景` (`让桌面透过启动器窗口显示出来。`) with `界面不透明度` (default 55%).
- Other appearance rows: `页面切换过渡动画`, `高级渲染`, `主页布局` (`信息` / `极简`), `字体`, `原生窗口`.

**Cameo:** the button rides the hue-slider thumb (they share the same look). Optionally the whole UI re-tints while the protagonist stays pink; that is a creative liberty, because in the real app the button follows the accent.

### 5.8 Account login (right sidebar `AccountsCard.vue`) · `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\components\ui\AccountsCard.vue`

- Sidebar label `当前游玩账号：` and an account dropdown (avatar, name, type such as `Minecraft 账户`). Menu items: `添加 Microsoft 账户` · `添加第三方账号` · `添加离线账户`.
- Third-party modal (`research\ref\account-login.png`):
  - `登录第三方账号` · `使用 LittleSkin 或其他兼容的 Yggdrasil 外置登录服务。` · full-width `使用 LittleSkin`;
  - `Yggdrasil API 地址` (prefilled `https://littleskin.cn/api/yggdrasil`) · `账号或邮箱` / `请输入账号或邮箱` · `密码`;
  - brand checkbox `在此设备上保存登录` · `取消` + brand `登录` (with log-in icon).
- Offline modal: `添加离线账户` · `选择离线游戏中使用的用户名。此账户只能加入允许离线玩家的服务器。` · `Minecraft 用户名` · `创建账户`.
- Badges: `官方` / `离线` / `第三方`. Microsoft login help: `遇到问题？` · `使用浏览器登录` · `使用设备代码`.

**Cameo:** a modal opening from the click point (§3.5) can briefly "trap" the button. Not essential.

### 5.9 Favorites, Create, instance page, minimal home (cross-reference)

- **Favorites** (`pages\Favorites.vue`): `收藏夹` · `搜索收藏夹` · `全部内容类型` · types `模组/资源包/数据包/光影包/整合包/地图/服务器` · `暂无收藏` / `收藏模组、资源包、数据包和光影包，之后随时安装。` · views `列表` / `紧凑列表` / `网格`.
- **Create** (`pages\Create.vue`): `创建实例` · `实例是带有特定加载器、游戏版本和模组的一套 Minecraft 配置。` (onboarding `开个新档`).
- **Instance page play button state machine** (`pages\instance\Index.vue`): this is the climax reference. All are `xl` buttons (48 px, radius 16 px, weight 800):

| State | Button |
|---|---|
| Ready | brand `PlayIcon` + `开始游戏` |
| Launching | disabled brand with spinning `SpinnerIcon` + **`正在启动…… {n} 秒`** |
| Running | **red** `StopCircleIcon` + `停止` (`正在停止……` while stopping) |
| Needs repair | `修复` |
| Server instance | button group with a chevron menu (`加入服务器` / `启动实例`) |

- Status bar idle text `没有运行中的实例`; running instances appear in the action bar.
- **Minimal home layout** (`components\home\HomeMinimal.vue`, `主页布局 → 极简`): a centred greeting and a single instance card (80 px icon, name, loader/version, last played). It has **one 144 px-wide xl brand `开始游戏` button**. This is the cleanest "home with one launch button" composition for the opening and finale.
- Calendar widget play label is `启动` (`app.home.calendar.play`).
- The home page itself is covered in other reports.

### 5.10 Update announcements UI

- `components\ui\announcement\UpdateAnnouncementModal.vue`: shown after an update, title `本次更新内容`, `版本 {version}`.
- Categories with coloured dots: `新增` (green), `变更` (blue), `弃用` (orange), `移除` (red), **`Bug 修复`** (purple), `安全修复` (orange). Button `查看完整更新日志`.
- Settings → 更新: `更新公告` / `查看当前版本的更新内容和历史版本公告。` / `历史版本`.
- Remote announcement centre: `公告` · `暂无公告` · `查看公告` · `未读`.

---

## 6. Version and announcements

| Item | Value | Source |
|---|---|---|
| App version | **`1.9.7`** | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\package.json` (`tauri.conf.json` points to it); `apps\app\Cargo.toml`, `packages\app-lib\Cargo.toml` |
| Latest tag | `v1.9.7` → commit `c4a1b6c`, 2026-09-30 21:14 +0800 | `git tag` |
| Website "latest" | `v1.9.7` (`最新版本：1.9.7` on the live site) | `apps\website\releases\latest.json`; `catalog.json` updated 2026-09-30 |
| Newest catalog entry | `1.9.8-beta.1` (2026-10-01), not yet tagged locally | `E:\GitHub\Axolotl-animation\upstream\Axolotl\apps\app-frontend\src\announcements\catalog.ts` (4488 lines, 56 entries from 1.4.0 / 2026-07-23 to 1.9.8-beta.1) |
| HEAD | `2b5c22d` 2026-10-05 | shallow clone |
| How the version is displayed | About `版本 1.9.7`; Settings footer `Axolotl Launcher 1.9.7`; beta builds show a `Beta` pill (blue-100/blue-700) next to the top-bar logo | `AboutSettings.vue`, `Settings.vue`, `App.vue` |

**1.9.7 highlights** (2026-09-30, zh-CN verbatim, abridged):
- `新增截图中心，支持跨实例浏览、预览、编辑和管理截图。`
- `新增游戏选项、资源包选择、快捷栏、命令历史、服务器列表、语言、截图和内容文件的跨实例同步。`
- `新增实例备份管理，支持配置备份仓库、排除规则、恢复预览和后台操作。`
- `新增实例分组，支持创建、重命名、删除、折叠、拖拽排序和批量管理。`
- `新增 Cleanroom 加载器支持，包括外部实例识别和 mrpack 导出。`
- `新增界面字体和等宽字体自定义选择，支持读取系统已安装字体。`
- `新增皮肤预览中的盔甲和盔甲纹饰渲染。`
- `新增结构化崩溃日志分析，支持选择日志文件、查看 LogAgent 结果以及分离的日志和分析视图。`
- `新增现代化公告中心、公告分类和版本更新历史。`
- `新增将本地服务器固定到主页的功能。`
- `新增自定义 Minecraft 窗口标题、启动快捷方式图标、桌面快捷方式导出、服务器启动前钩子和更多 URL Scheme 命令。`
- `新增实验性功能设置页面和灰度发布控制。`
- `改进依赖关系图的导航、关系分组、选择交互和大型关系图性能。`
- `改进主页组件、固定服务器布局、账户问候语和路由状态保留。`

**1.9.8-beta.1** (2026-10-01):
- `修复发现页和库页面搜索框无法通过右键菜单复制、粘贴的问题。`
- `导入实例时，将优先以.minecraft文件夹直用方式导入。`
- `新增更多URL Scheme能力。`

**Feature timeline** (useful for "what is the launcher made of"):

| Version | Date | Additions |
|---|---|---|
| 1.4.0 | 07-23 | `新增首次使用引导, 并支持从设置中重新播放。` · update announcement modal |
| 1.5.0 | 07-23 | HMCL/PCL2 import · drag-and-drop import · OptiFine |
| 1.5.2 | 07-25 | nav pill sliding animation · translation float-in · (former) ASCII axolotl |
| 1.6.0 | 07-28 | `新增实验室, 首批提供渐变颜色生成器和 Java 版种子地图。` |
| 1.6.6 | 08-01 | `实验室新增投影工坊：可打开本地或实例内的 .litematic 和 .schem 文件, 在 3D 工作区查看建筑、测量并管理层级和材料、编辑方块, 以及导出修改后的投影。` |
| 1.7.0 | 08-06 | AI integration |
| 1.7.1 | 08-08 | `实验室新增配方生成器` · `实验室新增模组翻译工具` |
| 1.7.3 | 08-10 | `为启动器页面切换添加了动画` |
| 1.7.4 | 08-12 | `新增了红石联机` · `新增启动器设置项, 可开启/关闭页面切换动画。` |
| 1.8.0 | 08-15 | logshare and AI log analysis · datapack management |
| 1.8.7 | 08-19 | `新增实例图标生成器…以及一组新的 3D 图标。` · `投影工坊新增起始层和结束层控制` |
| 1.9.0 | 08-26 | dependency graph · `Lab 新增皮肤编辑工具` · `皮肤选择器页面右上角新增「创建皮肤」按钮` |
| 1.9.2 | 08-29 | `关于页面新增彩蛋！可能较难发现哦~` |
| 1.9.5 | 09-04 | notification centre · Beta badge · tray lightweight mode · `新增种子地图中选择主世界群系高度的选项。` |
| 1.9.6 | 09-15 | announcement system · `为浏览页面统一添加加载骨架屏、内容卡片淡入效果、刷新遮罩和空状态。` · `优化彩蛋游戏，修改部分机制。` · `移除启动画面的发光效果，使其外观更加简洁。` |
| 1.9.7 | 09-30 | see above |

Parser for the catalog (prints zh-CN per version): `node E:\GitHub\Axolotl-animation\research\_scratch\07\cat.mjs [version ...]`.

---

## 7. Story hooks from this area (ranked)

1. **Mascot as the searcher.** `axo-searching.svg` (magnifier) is the natural face of "启动按钮去哪了？". Use it as a tiny cameo when the cursor searches, or on the end card. Pair it with the `NoSearchResultIllustration` style only if a "no results" beat is wanted.
2. **Inchworm locomotion** (NavRail/NavTabs). The button's travel gait is borrowed from the app's own selection pill. This gives a causal link: the nav pill and the launch button share a body language.
3. **Pink ball drop** (合成美西螈). The button falls out of the UI as a "pink axolotl ball": easeOutBack spawn, small floor bounce (restitution 0.16), white shockwave ring on impact. That is a real in-app easter egg reference.
4. **Underwater layer** (About scene and axolotl-run). Behind the UI, a pink-tinted water stage with Perlin wave lines, rising ring bubbles and a swimming voxel axolotl. Good for the "behind the interface" passage.
5. **Click-origin modals and drag-gather.** These are the grammar for the final regroup: every displaced UI piece flies back to the cursor and button in 500 ms `(0.2,0.8,0.2,1)` with 10 ms staggers.
6. **Viewfinder corners** (onboarding spotlight). They mark the moment the cursor finally locks onto the restored button: 2 px brand brackets breathing at 1.015.
7. **Launch climax:** `开始游戏` → spinner `正在启动…… 1 秒` → "enter the world". Optionally finish with the installer-style completion pop, `cubic-bezier(0.34,1.56,0.64,1)`.
8. **End card:** the OnboardingWelcome sequence (logo overshoot → wordmark unroll → pink scan wipe → lift), then the slogan `你的最后一款启动器` or `次世代 Minecraft 桌面客户端，全能、美观、全平台覆盖。`.
9. **Voice-over or on-screen micro-copy** (sparingly): `没有东西会失踪` · `世界已准备好接住你的下一步。` · `下一个项目只差一次启动。` · `点击启动按钮即可启动服务器！`.

Do not use: the Modrinth logo (`packages\assets\branding\logo.svg`), the maze cube as a brand image, Friends UI, `坦克动荡`, or the v1.6.0 settings modal with 12 colour dots as a "current" UI.

---

## 8. Uncertainties / inferred items

- The AboutScene water and bubble colours in light theme were computed from the shader logic (ShaderMaterial without colour-space conversion, values clamped). Expect a saturated magenta, about `#ff0c70` (inferred).
- The modal overlay tint and loading-bar second stop are computed `color-mix` results: `rgba(28,5,15,.54)`→`rgba(3,1,2,.94)` and `#e76ca3`.
- The origin of `assets\loading\cube.png` as Modrinth artwork is inferred (the clone is shallow and the design matches the Modrinth App splash).
- The `axolotl-run` game and `zzhzhouzhou` team entry are not in tag v1.9.7 (`git merge-base --is-ancestor` check). They appear in commit `2275686` (2026-10-02) on `main`, which is presumably targeting 1.9.8.
- CJK font in the reference screenshots is presumably PingFang SC (macOS). The code only specifies the Inter/system stack.
- The live website rendered light only when `prefers-color-scheme: light` was forced. Both themes match the source.
- The surface colours sampled from `research\ref\launcher-home.png` differ by ±2 from the tokens (e.g. `#ebe9eb` vs `#ebebeb`), probably colour-profile shift. The tokens are authoritative.
- `LogoAnimated.vue` (website) and `.nav-button-animated` (`App.vue`) are defined but not used. Treat them as on-brand references, not visible features.
