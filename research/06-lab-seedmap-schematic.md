# 06 · The Lab (实验室): index, 种子地图 (Seed map), 投影工坊 (Schematic workshop) and the other tools

This is the animator's source of truth for the Lab area of **Axolotl Launcher (美西螈启动器)**. Every fact was read from the upstream source (read-only clone) unless it is marked **(inferred)**. All px values assume 1rem = 16px (`body { font-size: 16px }` in `packages/assets/styles/defaults.scss`) and the **light theme + default pink accent**. The dark theme is noted where it differs.

- Upstream root (abbreviated `UP` below): `E:\GitHub\Axolotl-animation\upstream\Axolotl`
- My reference renders: `E:\GitHub\Axolotl-animation\research\_scratch\` (files listed in §9)
- Shallow clone: `git log` only reaches 2026‑10‑02, so the older Lab layout shown in the reference screenshot cannot be traced in history (see §2.3).

---

## 0. Key takeaways for the film

1. **The Lab index exists in two real versions.** The *current code* has a vertical **list** of 6 horizontal cards, each with a pink **"› 进入"** button. The *published screenshot* (`research\ref\axolotl-lab.png`, identical to the website showcase `UP\apps\website\src\public\showcase\axolotl-lab.png`) shows an older **3‑column grid** with 3 tools and the category chip on the cover. Both are real; the grid looks more cinematic and is what the website markets.
2. **The Lab's "进入" button is a pink primary button**: `Button type="colored" color="brand"`, which has a pink `#db2777` fill, white label, a 1px top-light inner edge, and layered soft shadows. The same pink primary style marks the main action in each tool: 前往, 添加标记, 替换所选, 打开文件, 导出输出, and so on. A runaway pink launch button could plausibly disguise itself as a Lab card's "进入" button. Note that the Home rows' **"▷ 开始游戏"** buttons in `research\ref\launcher-home.png` are **white base‑style** buttons (shared‑UI string `button.play` = 开始游戏). The pink in the shell is the active nav circle and the brand accents, so the film's "启动" button design must come from the Home research, not from here.
3. **Seed map markers are user-coloured pins.** A marker is a canvas-drawn teardrop pin (14px head with a 2px white ring and a white-edged tail), filled with `marker.color` (default `#22C55E`, chosen with a native colour input). **Pink `#db2777` is a legitimate marker colour**, so the button can become a pin and keep its colour. An optional name label sits in a dark tab beside it. The popup action **"📌 添加标记"** is itself a pink brand button.
4. **The seed map is pixel art.** It shows native 256×256 tiles drawn with nearest-neighbour scaling in the cubiomes biome palette (navy `#000070` oceans, `#8DB360` plains, `#FADE55` beaches, `#0000FF` rivers), with Minecraft‑map hillshading. At maximum zoom‑in one block = **16 screen px**, the same size as a Minecraft texture. This gives a natural "map pixel → 3D block" transition into the Schematic workshop.
5. **The Schematic workshop is a black 3D stage (`#0a0a0a`) inside the light UI.** It shows real pixelated Minecraft block models, a dark two‑tone grid floor, frosted light glass toolbars floating over the stage, and **selection highlights in the brand pink** (24% fill with solid edges). "层间距" (layer spacing) pulls the layers apart vertically, which gives a built‑in exploded view.
6. **"落入投影工坊" is literal UI.** Dragging a `.litematic` or `.schem` file over the viewport shows an inset panel with a **2px dashed pink border** and the copy **"松开以打开投影"**. The file then loads with a 4px pink progress bar (正在解析投影 → 正在读取资源 → 正在生成模型 n / N).
7. **Real links between features** (useful for cause and effect in the story):
   - Instance → Files tab → right-click a schematic file → **"在投影工坊中打开"**.
   - Instance content list → schematic item → inline ✎ **"在投影工坊中打开"**.
   - Seed map → **"从实例导入"** → pick instance → pick single-player world → its seed loads (toast **"已载入世界 {world} 的种子"**).
   - The spawn point on the map is a **Minecraft compass sticker**.

---

## 1. Theme tokens used in this area

Source: `UP\packages\assets\styles\variables.scss`. The default accent is `selectedAccentColor: 'pink'` in `UP\apps\app-frontend\src\store\theme.ts:184`, applied as the class `accent-pink`.

| Token | Light (pink accent) | Dark (pink accent) | Notes |
|---|---|---|---|
| `--surface-1` (page bg, `--color-bg`) | `#ebebeb` | `#101215` | OLED: `#000000` |
| `--surface-2` | `#f5f5f5` | `#1a1e24` | raised panels |
| `--surface-3` | `#f8f8f8` | `#262b34` | cards (`.card`), inputs/headers |
| `--surface-4` | `#ffffff` | `#333a46` | inputs, combobox, tag fill, base button |
| `--surface-5` | `#dddddd` | `#424854` | strokes, `--color-divider` |
| `--color-text-primary` | `#1a202c` | `#ffffff` | titles |
| `--color-text-default` | `#2c2e31` | `#b0bac5` | body |
| `--color-text-tertiary` | `#484d54` | `#96a2b0` | captions, labels |
| `--color-brand` | `#db2777` (pink‑600) | `#f472b6` (pink‑400) | |
| `--color-brand-highlight` | `rgba(219,39,119,.25)` | `rgba(244,114,182,.25)` | `color-mix(... 25%, transparent)`. On white this is ≈ `#F6C9DD` |
| `--color-accent-contrast` (text on colored buttons) | `#ffffff` | **`#000000`** | dark mode uses black text on pink buttons |
| `--color-brand-shadow` (focus ring) | `color-mix(#db2777 68%, transparent)` | same with `#f472b6` | `ring-4` |
| `--hover-brightness` | `0.9` | `1.25` | buttons `brightness()` on hover |
| `--radius-xs/sm/md/lg/xl` | 4 / **8** / **12** / **16** / 20 px | same | |
| `--gap-xs/sm/md/lg/xl` | 4 / 8 / 12 / 16 / 24 px | same | |
| `--shadow-card` | `rgba(50,50,100,.1) 0 2px 4px` | `rgba(0,0,0,.25) 0 2px 4px` | |
| `--color-red` | `#cb2245` | `#ff496e` | delete/error |

**Typography.** Font stack: `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, …, sans-serif` (`defaults.scss`). Inter is loaded from a remote CDN in `packages/assets/styles/inter.scss`. CJK glyphs fall back to the OS font: PingFang SC in the macOS screenshot, Microsoft YaHei on Windows. Tailwind sizes are stock: `text-xs` 12/16, `text-sm` 14/20, `text-base` 16/24, `text-lg` 18/28, `text-xl` 20/28, `text-2xl` 24/32 (px size / line height).

**Shared component metrics** (from `UP\packages\ui\src\components\base\…`):

| Component | Metrics |
|---|---|
| `Button` (`buttons\ButtonFrame.vue`) | Sizes: `2xs` h24 r8 px6 14px/600 icon16 · `xs` h28 · `sm` h32 **r10** px6 14px/600 icon16 · `md` (default) h36 **r12** px10 16px/600 icon20 gap6 · `lg` h40 r14 px16. `icon-only` makes it square; `circular` makes it fully round. Transition 150ms ease‑out, `active:scale(.97)`, hover `brightness(var(--hover-brightness))`, disabled `opacity .5`. |
| Button types | **colored**: bg `--button-color` (brand), text accent‑contrast, `box-shadow: 0 0 0 1px brand@30%, 0 2px 4px #0000000a, 0 5px 8px #0000000a, 0 10px 18px #00000008, 0 24px 48px #00000008`, plus `::before` 1px mask border `linear-gradient(180deg, #ffffff4d, #fff0)` (a top light edge). **base**: bg surface‑4, text primary, `inset 0 0 0 1px surface‑5, 0 1px 1px #0000001f`. **outlined**: transparent, 1px border surface‑5 (or the button colour), text primary. **quiet**: transparent, text‑default, hover bg surface‑4. **chip‑text** + brand: bg brand‑highlight, text brand. |
| `StyledInput` | h36, bg surface‑4, **no border**, r12, `pl-3` (12px), or `pl-10` (40px) with a left icon. The icon is 20×20 at left 12px, tertiary, opacity .6 (1.0 when filled). Text 16px/500 text‑default; placeholder tertiary. Focus: `ring-4` brand‑shadow. |
| `Combobox` trigger | bg surface‑4, r12, px16 py8, label 600 text‑default `leading-tight`, chevron (ChevronLeftIcon rotated −90° so it points down) 20px. Menu: r14, bg surface‑4, border surface‑5, options px16 py12, selected option `bg-brand-highlight text-brand`. |
| `TagItem` | pill: bg surface‑4, 1px border surface‑5, px8 py4, `leading-none`, `rounded-full`, 14px/400, text tertiary. |
| `.card` (`Card.vue` → `.base-card`) | padding 16, bg **surface‑3**, r16, border 1px **surface‑4**. |
| `Toggle small` | 40×20 pill, p4, knob 12px. On: bg brand, knob `black/90` translated 20px. Off: bg surface‑4, knob gray. |
| `Checkbox` | 20×20, r6. Checked: bg brand with a check icon. Unchecked: bg surface‑2, border divider‑dark. |
| `Slider` | 4px track: brand up to the value, text‑default after it. Thumb 12px brand circle (16px on hover). |
| `Tabs` | container h38 r12, 1px border surface‑5, p2, gap4, `shadow-sm`. Tab r10 px10 14px/500. Active: `border-brand bg-brand-highlight text-brand` (icon brand). Inactive: transparent, text‑default (icon tertiary). |
| Popover `.menu-surface` (`packages\ui\src\styles\overlays.css`) | p8, 1px surface‑5, r12, bg surface‑3, `3px 3px 0.8rem rgba(0,0,0,.3)`, 14×7 arrow. |

**App shell context** (from `UP\apps\app-frontend\src\App.vue`): top bar `--top-bar-height: 3rem` (48px), left nav `--left-bar-width: 4rem` (64px). The Lab nav button uses `FlaskConicalIcon` (`UP\packages\assets\icons\flask-conical.svg`) with tooltip **实验室** (`app.navigation.lab`). Breadcrumbs (current code) prefix a 20px icon: 实验室 = flask‑conical, 种子地图 = `MapIcon` (`icons\map.svg`), 投影工坊 = `CodeIcon` (`icons\code.svg`), with a `›` separator (ChevronRight, 20px). The reference screenshot shows breadcrumbs without icons (older build). **Route change** is a plain cross‑fade: enter `opacity .18s ease`, leave `opacity .12s ease` (`global.scss`, `.page-slide-*`), active when the `page_transitions` feature flag is on.

---

## 2. Lab index (`/lab`, 实验室)

Files: `UP\apps\app-frontend\src\pages\Lab.vue`, `UP\apps\app-frontend\src\lab\registry.ts`, `UP\apps\app-frontend\src\helpers\lab-preferences.ts`, `UP\apps\app-frontend\src\routes\lab.ts`.

### 2.1 Current layout (code), component tree with px

```
<main class="flex w-full flex-col gap-6 p-6">                 padding 24, vertical gap 24
├─ header
│   ├─ h1 "实验室"            24px/32px, 700, text-primary
│   └─ p  "6 个工具"           mt 4, 14px/20px, text-tertiary   ({count} 个工具, count = labTools.length = 6)
├─ div.flex.flex-wrap.gap-2  (aria "Lab tool filters")        gap 8
│   ├─ StyledInput  icon=SearchIcon, placeholder "搜索工具", clearable, wrapper min-w 224 + flex-1   (h36, white, r12)
│   ├─ Combobox  w-48 (192px)  value "全部工具"  options 全部工具 / 创作 / 维护 / 世界
│   └─ Combobox  w-48 (192px)  value "全部"      options 全部 / 已收藏 / 未收藏
│        (≤576px window: each combobox goes full width)
└─ section.flex.flex-col.gap-3  data-onboarding-id="lab-tools"   gap 12 between cards
    └─ Card ×6  "!m-0 relative flex items-end gap-4 !p-4"
         transition-[border-color,filter] 200ms; hover: border surface-5 + brightness(1.05)
         ├─ button.absolute.right-4.top-4  32×32, r6, StarIcon 20px tertiary
         │     favourited → `fill-brand text-brand` (filled pink star); hover text-brand
         ├─ RouterLink (cover, aria-hidden) → div aspect-[2/1] w-56 (224×112), r16, overflow-hidden, bg surface-2
         │     └─ img object-cover (≤576px window: w-36 = 144×72)
         └─ div.flex.min-w-0.flex-1.flex-col
              ├─ RouterLink (title+desc block; focus ring-2 brand)
              │    ├─ h2  18px, 700, leading-tight (22.5px), line-clamp-1, pr-10 (40px for the star), text-primary
              │    └─ p   mt 4, 14px/20px, line-clamp-2, text-tertiary
              └─ div.mt-auto.flex.items-center.justify-between.gap-3.pt-4      (pt 16)
                   ├─ TagItem  category label  (创作 / 世界 / 维护)
                   └─ Button colored brand size=sm  "min-w-20 justify-between px-3"
                        → 32px tall, min 80px wide, r10, px12, [ChevronRightIcon 16px] … ["进入" 14px/600 white]
                          (icon on the LEFT, label on the RIGHT, pushed apart by justify-between)
```

- **Card height:** the 112px cover is the tallest child (`items-end`), so a card is 112 + 2×16 + 2×1 border = **146px**. The text column is bottom‑aligned. With a one‑line description its height is 22.5 + 4 + 20 + 16 + 32 = 94.5px, so the title sits about 17px below the cover top.
- **At a 1440×900 window** the content viewport is 1376×852 (window minus the 64px nav and 48px top bar):
  - page padding puts content at x 88–1416 (1328 wide);
  - title y 72–104, count y 108–128;
  - filter row y 152–188; the search field is 928px wide;
  - the first card starts at y 212, then one every 158px. About 4.5 cards are visible, so the page scrolls.
  - Verification mock: `research\_scratch\06-mock-lab-index-current.png` (reconstruction from code, not a capture).
- **Order:** registry order, with favourited tools moved to the top (favourites keep their relative order). Search matches title + description (case‑insensitive). Filter selections persist in `localStorage` (`axolotl-lab-category-filter`, `axolotl-lab-favorite-filter`, `axolotl-lab-favorite-tool-ids`).
- **Empty result:** `EmptyState type="no-search-result"` shows a 48px icon chip (r16, 1px divider border, bg surface‑2, FolderSearchIcon 24px tertiary), then the heading **"没有匹配的工具。"** (24px/600). With the favourites filter and no favourites, the heading is **"还没有收藏任何工具。"**.
- Onboarding anchors (handy for automated captures): `data-onboarding-id` = `lab-tools`, `lab-gradient-text-card`, `lab-recipe-generator-card`, `lab-seed-map-card`, `lab-schematic-preview-card`.

### 2.2 Registered tools

All six have cover art, so the fallback icon tile (`size-8` icon on `bg-brand-highlight text-brand`, or `bg-highlight-green` for seed-map) never renders.

| # | id / route | zh title | zh description (verbatim) | Category chip | Fallback icon (registry) | Cover (abs path, px) |
|---|---|---|---|---|---|---|
| 1 | `skin-editor` `/lab/skin-editor` | **皮肤编辑器** | 在本地创建和编辑 Minecraft 玩家皮肤。 | 创作 | PencilIcon | `UP\apps\app-frontend\src\assets\lab\skin-editor-tool-cover.png` 768×382 |
| 2 | `gradient-text` `/lab/gradient-text` | **渐变文字生成器** | 无需浏览器即可创建适用于 Minecraft 的渐变文字。 | 创作 | PaletteIcon | `…\assets\lab\gradient-text-tool-cover.png` 1282×638 |
| 3 | `seed-map` `/lab/seed-map` | **种子地图** | 在本地查看 Minecraft 种子的群系、结构和保存的标记。 | 世界 | WorldIcon | `…\assets\lab\seed-map-tool-cover.png` 1278×636 |
| 4 | `schematic-preview` `/lab/schematic-preview` | **投影工坊** | 快速预览、编辑你的投影 *(no full stop in the source string)* | 创作 | BoxIcon | `…\assets\lab\schematic-preview-cover.png` 770×383 |
| 5 | `mod-translation` `/lab/mod-translation` | **模组翻译** | 把任意 Minecraft 模组 JAR 翻译成简体中文。 | 维护 | LanguagesIcon | `…\assets\lab\mod-translation-cover.png` 1780×884 |
| 6 | `recipe-generator` `/lab/recipe-generator` | **配方生成器** | 轻易地修改合成表，自定义配方，生成数据包。 | 创作 | BlocksIcon | `…\assets\lab\recipe-generator-tool-cover.png` 768×382 |

Cover art. Every cover is a scene with one **white line‑art glyph** centred on it:
- **Skin editor:** five Minecraft armour stands wearing diamond/iron/gold/copper/netherite armour on a near‑black starfield. Glyph: T‑shirt + pencil.
- **Gradient text:** dark starfield with a faint green/teal Minecraft‑font "End Poem" text block. Glyph: chunky "#HEX" with a text cursor and 4‑point sparkles.
- **Seed map:** a hill‑shaded biome map (softer "natural" palette: ocean `#1C2D66`, deep ocean `#080F2B`, forest `#136334`, plains `#89AD5F`, beach `#F1D759`, river `#1C499E`). Glyph: map pin on a landscape with horizon lines. **This palette is not the in‑app cubiomes palette** (§3.4).
- **Schematic (current):** isometric redstone build (redstone blocks, slime, observers, pistons, note blocks) on a dark gradient (`#0A0A0A` bottom‑left, which equals the 3D viewer's clear colour, to `#F9F9F9` top‑right), a faint perspective grid, and **cyan `#00F8F8` wireframe cubes**. These are Litematica "projection" ghost blocks: the hologram language. Glyph: a projector on a tripod casting dashed rays onto a framed cube.
- **Mod translation:** an open pixel‑art book (parchment) on brown. Glyph: file + "EN → 文".
- **Recipe generator:** close‑up isometric crafting table, furnace and blast furnace faces. Glyph: rounded 3×3 crafting grid with a 4‑point sparkle.

Downscaled copies of the current seed/schematic covers are in `research\ref\cover-seedmap.png` and `research\ref\cover-schematic.png` (800×398).

### 2.3 Legacy layout (reference screenshot and website showcase)

`E:\GitHub\Axolotl-animation\research\ref\axolotl-lab.png` (1600×936, macOS, light, pink) is the same picture as `UP\apps\website\src\public\showcase\axolotl-lab.png` (3104×1814, which is 2× of a ~1440×900 window). Differences from the current code:

- **3 tools only** (渐变文字生成器 · 种子地图 · 投影工坊), so the count reads **"3 个工具"**.
- One wide search field **"搜索工具"** plus **one** combobox **"全部工具"** (≈330px). There is no favourites filter.
- Cards sit in a **3‑column grid**, about 386 css px wide. The 2:1 cover is on top with only the top corners rounded, and the category chip (TagItem: white pill, gray border, "创作"/"世界") sits at the cover's top‑right (≈12px inset). Below the cover: title (≈18px/700) and description (≈14px tertiary) on a near‑white body. No star and no "进入" button.
- The **schematic card cover differs**: a dark starfield with teal/blue "data noise" specks and a white line projector on a tripod beaming dashed rays at a grid screen that holds a white/gray pixel cube, with 4‑point sparkles. That cover is **no longer in the repo**. Crops: `research\_scratch\old-lab-cover-schematic.png` (763×380), `old-lab-card-schematic-full.png` (773×547), `old-lab-cover-gradient.png`, `old-lab-header-filters.png`.
- The breadcrumb shows "实验室" without an icon, and the sidebar Lab button is a filled pink circle with a white flask.

### 2.4 Lab index strings (zh‑CN verbatim, `UP\apps\app-frontend\src\locales\zh-CN\index.json`)

| id | zh‑CN | en |
|---|---|---|
| app.lab.title / app.navigation.lab | 实验室 | Lab |
| app.lab.tool-count / -plural | {count} 个工具 | {count} tool(s) |
| app.lab.search | 搜索工具 | Search tools |
| app.lab.category.all | 全部工具 | All tools |
| app.lab.category.creation | 创作 | Creation |
| app.lab.category.maintenance | 维护 | Maintenance |
| app.lab.category.world | 世界 | World |
| app.lab.enter | 进入 | Enter |
| app.lab.favorite-filter.all / .favorite / .unfavorite | 全部 / 已收藏 / 未收藏 | |
| app.lab.favorite.add / .remove | 加入收藏 / 取消收藏 | |
| app.lab.no-results | 没有匹配的工具。 | |
| app.lab.no-favorites | 还没有收藏任何工具。 | |
| app.onboarding.lab.title / .description | 内置的实用工具 / 实验室将本地 Minecraft 工具放进启动器，无需打开其他网站或注册额外账号。 | |
| app.onboarding.lab-tools.title / .description | Minecraft 本地工具 / 生成带格式的文字、探索 Java 世界，并直接在启动器中检查投影建筑。 | |

---

## 3. 种子地图 (Seed map, `/lab/seed-map`)

Files:
- page: `UP\apps\app-frontend\src\pages\LabSeedMap.vue` (3953 lines)
- library: `UP\apps\app-frontend\src\lab\seed-map\{visuals,biomes,features,ores,workspace,backend,history,ore-layer}.ts`
- components: `UP\apps\app-frontend\src\components\lab\seed-map\{SeedMapBiomePicker,SeedMapWorldImportModal,SeedMapCopyrightModal}.vue`
- native engine: `UP\apps\app\src\seed_map\cubiomes_bridge.c`, `mod.rs`, `UP\apps\app\src\api\seed_map.rs` (cubiomes submodule `apps\app\vendor\cubiomes`, not checked out)
- assets: `UP\apps\app-frontend\public\seed-map-assets\`

### 3.1 Page anatomy (≥1201px window), component tree with px

```
main.seed-map-page  max-w 1760 (110rem), p 16, gap 12, flex-col, h-full
├─ header  min-h 36, flex justify-between
│   ├─ h1 "种子地图"                       20px/28px 700 text-primary
│   ├─ p  "Java 版 26.2 · 主世界"          12px/16px text-tertiary   (= edition + version + " · " + dimension)
│   └─ right: [map-scale-badge "1 像素 = 4 格"]  [ⓘ outlined circular icon btn 36px → "版权与来源说明" modal]
│        badge: min-w 120, 1px surface-5, r8, bg surface-2, p 5.6/8.8, 11.2px 700 tabular, tertiary, centred
├─ section.seed-map-toolbar  (onboarding "seed-map-toolbar")  1px surface-5, r12, bg surface-2, p12, gap 12, z20
│   ├─ toolbar-primary  grid: minmax(176px,.8fr) | minmax(112px,.45fr) | minmax(288px,1.75fr), gap 12
│   │   ├─ control-group "版本类型"   → Combobox "Java 版"  (options: Java 版 / Java 版：大型生物群系)
│   │   ├─ control-group "游戏版本"   → Combobox "26.2"     (26.2, 26.1.2, 26.1, 1.21.9 … 1.0)
│   │   └─ control-group "种子"       → grid [1fr auto auto auto] gap 8:
│   │        StyledInput icon=HashIcon placeholder "输入数字或文本种子" (default seed "10292992")
│   │        [⟳ outlined circular icon btn 36 = "随机种子"]
│   │        [🕘 HistoryIcon trigger → popout "种子历史记录"] (unstyled reset <button>, 24px icon) (inferred look)
│   │        [⇩ ImportIcon "从实例导入" outlined md btn]
│   │     control-label: 11.2px 700 tertiary, line-height 1; label→control gap 5.6
│   └─ toolbar-secondary  grid [auto 1fr auto auto], align-end, gap 12, border-top 1px surface-5, pt 12
│       ├─ "维度": segmented control h40, r12, 1px surface-5, bg surface-3, overflow hidden
│       │     three 2xs buttons stretched to full height, min-w 88: 主世界 | 下界 | 末地
│       │     active = colored brand (pink fill, white text); others quiet; outer corners r11
│       ├─ "坐标" (min-w 320): grid [1fr 1fr auto] gap 8
│       │     X field / Z field: StyledInput h40, pl 28; floating label "X"/"Z" at left 10.4, 11.2px 800 tertiary
│       │     [🧭 CompassIcon "前往"] colored brand h40          (Enter key also triggers)
│       ├─ "深度" (overworld only): Combobox "地表 (Y=128)" | "浅层地下 (Y=16)" | "深层地下 (Y=-32)"
│       └─ [ShareIcon "复制地图链接"] outlined h40 → copies axolotl://lab/seed-map?seed=…&edition=…&version=…
│                                              &dimension=…&mode=…&ores=…&yMin=&yMax=&x=…&z=…&zoom=…
├─ Admonition type=critical "地图生成失败" + message (only on error)
└─ section.seed-map-experience (onboarding "seed-map-workspace") flex-1, r12, bg surface-1, focusable (keyboard)
    ├─ div.layer-strip  grid [auto 1fr] gap 8, min-h 64, 1px surface-5, p 7.2/9.6, r 12 12 0 0, bg surface-3,
    │                   shadow 0 8px 20px rgb(0 0 0/.2), z10
    │   ├─ heading (12px 800 tertiary): "地图图层" (or "矿物图层")
    │   │   + mode switch [1px surface-5, r8, bg surface-2, p3.2, gap3.2]:
    │   │       [LandmarkIcon 结构] [PickaxeIcon 矿物]   (2xs; active = colored brand)
    │   │   + [👁 显示/隐藏图层名称] [⌄ 展开/收起图层] (base circular icon buttons 36)
    │   └─ layer-options: horizontal scroll row, gap 6.4, scrollbar hidden
    │        each = Button type="colored" w40 h36 p4 holding a 24×24 sticker image
    │        (with "show names" on: auto width, min-w 128, px 10.4, sticker + label)
    │        + final button = 出生点 (spawn_point.webp)
    │        (inferred from code: inactive toggles also render pink, because ButtonFrame defaults
    │         colored+undefined colour to brand; only aria-pressed differs. Layers beyond their
    │         zoom limit get opacity .68)
    │   expanded panel (floats below, z30): 1px surface-5, r12, bg surface-3, shadow 0 16px 34px rgb(0 0 0/.36), p 9.6,
    │        max-h min(416px, 56vh): [全选][清除][重置] outlined 2xs + checklist grid (auto-fill min 192px)
    │        of Checkbox + 21.6px icon + name (+ "Y min~max" for ores) + ore "Y 范围" sliders (最低 Y / 最高 Y)
    └─ div.seed-map-canvas-shell (onboarding "seed-map-canvas") flex-1, min-h 512, 1px surface-5 (no top), r 0 0 12 12,
                                 bg surface-2, overflow hidden
        ├─ <canvas> block size-full touch-none, image-rendering: pixelated (crosshair cursor while ruler on)
        ├─ coordinate ruler X: top edge, inset 0 56px, 5 tabs (justify-between) showing world X at −2…+2 quarter-widths
        │   coordinate ruler Z: left edge, inset 48px 0, 3 tabs showing world Z
        │   tabs: 10.4px 700 text-primary, bg surface-3, 1px surface-5, r 0 0 8 8 (Z: 0 8 8 0), p 2.4/5.6,
        │         shadow 0 3px 8px rgb(0 0 0/.24)
        ├─ control stack LEFT  (top 40, left 12): [+ 放大] [− 缩小] [🧭 居中显示出生点]
        │  control stack RIGHT (top 40, right 12): [⤢ 全屏] [⚖ 测量距离] [⚙ 地图设置]
        │     stack: column gap 4.8, 1px surface-5, r12, bg surface-3, shadow 0 8px 20px rgb(0 0 0/.28), p 5.6, z7
        │     buttons: circular icon-only 36 (base). Ruler and settings are outlined when off, base when on.
        ├─ status pill (top 12, centred): "⟳ 加载中" (spinning RefreshCw 12px) | "正在扫描矿物 n/N" |
        │     "⛏ 放大地图以扫描矿物" | "末地不支持矿物扫描"
        │     pill: 1px surface-5, r12, bg surface-3, p 5.6/8.8, 11.5px 700 tertiary
        ├─ ruler pill (bottom 84, left 12): "⚖ {n} 格" + [×] (清除测距)
        ├─ map-popup (selection, §3.6)
        ├─ advanced-panel "地图设置" (right 12, bottom 68.8, w 272, max-h min(448px, 100% − 112px), scroll)
        └─ map-bottom-toolbar (left/right/bottom 12, z6): 1px surface-5, r12, bg surface-3, p 8/9.6,
              shadow 0 10px 26px rgb(0 0 0/.3), flex-wrap, gap 8
              ├─ SeedMapBiomePicker (flex 1 1 320):
              │    pill "群系高亮" + small Toggle (h40, bg surface-4, 1px surface-5, r12, px 9.6, 12px 700)
              │    + trigger [LayersIcon "选择群系" ⌄] (h36 from its own `h-9` class: the scoped 40px rule
              │      targets a nested button that does not exist; 1px surface-5, r12, transparent, px10, 16px 600, icons 20)
              └─ actions (ml-auto, gap 8; each min-w 116, h40):
                   [LayersIcon 地形估算]  chip-text brand when ON (default ON) / outlined when off (disabled in Nether)
                   [GridIcon 显示网格]    chip-text brand when ON / outlined (default off)
                   [SearchIcon 搜索附近]  outlined (focuses the nearest displayed structure)
```

Responsive: at ≤1200px the seed control spans a full row and Share moves to its own row. At ≤900px controls stack vertically and the page scrolls. At ≤640px the checklist becomes one column.

**Approximate geometry at a 1440×900 window (content 1376×852)** (inferred from CSS math): header y 64–108, toolbar y 120–281, layer strip y 293–357, **map canvas ≈ 1344×527 px** at x 80–1424, y 357–884.

### 3.2 Default state (fresh install), from `workspace.ts`

| Setting | Default |
|---|---|
| seed | `10292992` |
| edition / version | `java` / `26.2` (`SEED_MAP_DEFAULT_VERSION`) |
| dimension / mode | 主世界 / 结构 |
| centre / zoom | (0, 0) / **zoom 1, so scale 4 ("1 像素 = 4 格")** |
| elevation | 128 (地表) |
| visibleFeatures | 村庄, 废弃传送门, 要塞, 下界要塞, 堡垒遗迹, 末地城 |
| showSpawn | true |
| terrainEstimation (hillshade) | **true** |
| contourLines / showGrid / chunk coords | false |
| selectedOres | 钻石矿石 |
| markers | [] (localStorage key `axolotl.lab.seed-map.v1`; history `axolotl.lab.seed-map.history.v1`, max 60) |

When the seed changes, the view resets to the overworld, recentres on spawn and selects the spawn point (popup "出生点").

### 3.3 How the map is rendered

- **Native tiles.** `renderSeedMapTile` → Tauri `plugin:seed-map|seed_map_render_tile` returns **256×256 RGBA** produced by cubiomes (`cubiomes_bridge.c::axolotl_seed_map_render`). One tile pixel = `tileScale` blocks, with `tileScale ∈ {1, 4, 16, 64, 256}` chosen as `SEED_MAP_SCALES[floor(zoom)]`.
- **Zoom.** `zoom ∈ [−2, 4]`; `scale = 4^zoom` blocks per screen px, so 1/16 at max zoom‑in and 256 at max zoom‑out. The ± buttons move by 0.5. **At zoom −2 one block is drawn as a 16×16 screen‑px square**, the native size of a Minecraft texture.
- **Pixel style.** The canvas draws tiles with `imageSmoothingEnabled = false` and CSS `image-rendering: pixelated`, so zooming in reveals hard‑edged square pixels with no blur.
- **Background while tiles load.** The canvas fills with surface‑2 and then a 32px checkerboard of surface‑3 squares (light: `#f5f5f5` / `#f8f8f8`, almost flat; dark: `#1a1e24` / `#262b34`). Tiles stream in nearest‑first (sorted by distance to centre), 2–8 in parallel. The previous zoom level's tiles stay visible underneath as a fallback.
- **Biome colours:** cubiomes `initBiomeColors` palette, mirrored in `biomes.ts` (§3.9). Sulfur Caves is patched to `#C8C828`. The End void is `#0D0D16`.
- **Terrain hillshade** (`axolotl_shade_height_map`, overworld; separate End routine):
  - Each pixel compares its height with its west, north and north‑west neighbours, like a Minecraft map item: `slope = 3h − w − n − nw`, then `factor = 1 ± clamp(slope/16, ±.3) ± .1`, never below `.72`. Slopes facing north‑west brighten (up to about ×1.4); slopes facing south‑east darken.
  - At scale ≤4 the height grid uses 4‑block cells, so at max zoom the shading steps are 4 blocks (64 screen px) wide. Coarser scales use a sparse 96² or 64² grid.
  - Nether: flat (no relief).
  - **Contour lines** (等高线, optional): pixels crossing a 16‑block height band are multiplied by **0.15** (near‑black lines).
- **Biome highlight** (群系高亮): pixels outside the selected biomes are dimmed to **30% brightness** in the overworld (`77/256`), or washed **80% toward white** in the Nether/End.
- **Overlay drawing order on the canvas:** tiles → grid → structures **or** ores → spawn → **markers** → ruler.
- **Grid overlay** (显示网格 / 区块坐标): 1px lines `rgba(255,255,255,.24)` every `max(16, 16·ceil(scale/16))` blocks. Chunk numbers are `11px system-ui`, `rgba(255,255,255,.84)`.

### 3.4 In‑app palette vs cover palette

The **in‑app** map uses the saturated cubiomes palette: oceans are deep navy `#000070`/`#000030`, rivers pure `#0000FF`, swamp mint `#07F9B2`, mushroom fields magenta `#FF00FF`. The **cover art** uses a softened natural palette (§2.2). For a faithful app shot, use the cubiomes palette with hillshade. For a "lab cover" moment, the cover image is itself a real asset. Labelled swatch sheet: `research\_scratch\seedmap-cubiomes-palette.png`.

### 3.5 Map glyphs, exact canvas drawing (all theme‑independent)

Reference render of the shapes: `research\_scratch\seedmap-canvas-glyphs-3x.png` (and `-1x`).

| Glyph | Drawing (LabSeedMap.vue) |
|---|---|
| **Structure** | `drawImage` of the sticker WebP at **28×28** (32×32 when selected), centred on the point, with canvas shadow `rgba(0,0,0,.48)` blur 5 offsetY 2. Selected: extra **white 2px ring**, radius `size/2 + 2` (18px). If the image is missing: circle r8 (r10 selected) in the feature colour, stroke `rgba(15,18,20,.86)` 2px (white 3px when selected), white `700 9px` initial. |
| **Slime chunk** | Filled square `#83B735`, size `clamp(16/scale, 5, 14)` px, stroke `rgba(15,18,20,.86)` 2px (white 3px when selected). |
| **Completed structure/ore** | `globalAlpha .48` (ores .42) plus a **green check badge** at (+10, −10): circle r7 `#1BD96A`, stroke `rgba(15,18,20,.9)` 2px, white tick 1.75px with round caps. |
| **Spawn** | `spawn_point.webp` (Minecraft compass sticker) 32px (36 selected) with the same shadow; selected gets a white 2px ring. Fallback: circle r10 `#2E3138` with white stroke. |
| **Ore hit** (mode 矿物, only when scale ≤ 0.25) | pixelated 16×16 ore texture (deepslate variant if y < 0) drawn **10–18px** (+4 when selected), stroke `rgba(15,18,20,.82)` 1.5px (white 2.5px selected), alpha .78 if not verified. |
| **Ruler** (测量距离) | `#F2B84B` (amber) 2px line with dash `[6,4]`, 4px dots at both ends. The pill reads "⚖ 123 格". |

### 3.6 MARKERS (标记)

**Data** (`SeedMapMarker`, workspace.ts): `{ id: uuid, name ≤128 chars, x, z (integers), color: '#RRGGBB' }`. Up to 1000 are saved in localStorage. An invalid colour falls back to `#22C55E`.

**Canvas drawing** (`drawMarkers`), at screen point `(x, y)`:
```js
ctx.fillStyle = marker.color; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2
ctx.beginPath()
ctx.arc(x, y - 3, 7, 0, 2π)                 // head: 14px circle, centre 3px ABOVE the point
ctx.moveTo(x - 4, y + 2); ctx.lineTo(x, y + 11); ctx.lineTo(x + 4, y + 2)   // tail, tip 11px BELOW
ctx.fill(); ctx.stroke()                      // the white ring is stroked over the tail top, then the two tail edges
```
- **Shape:** a teardrop map pin about 16×23 px. The coloured round head has a full white 2px ring, and the ring visibly separates the head from the tail. The pointed tail has white edges, with its tip 11px below the true point.
- **Colour:** user‑chosen; the default is **`#22C55E`** (green‑500). It is picked with a native `<input type="color">` (36×36, 1px surface‑5, r8, bg surface‑4, p3.2) next to the name field.
- **Label** (only while **显示图层名称** 👁 is on): a sharp‑cornered rectangle `rgba(20,22,26,.86)` at `(x+10, y−12)`, **22px tall**, width = text + 10px. Text is white `600 11px system-ui`, left‑aligned at `x+15`, vertically centred on `y−1`. The default name is `"{x}, {z}"` when left blank.
- **Selected state:** the canvas pin itself does not change. Selection shows as the popup anchored to it, whose title becomes the marker name and whose actions become 复制 /tp and 删除标记.
- **Hit‑test radius:** 13px. Markers win over structures, then ores, then spawn, then plain location.

**Creating a marker:**
1. **Right‑click** on the map (or **long‑press 650ms** on touch) opens a *marker draft* at that point. Alternatively, left‑click selects a location and the popup offers **"＋ 添加标记"** (outlined 2xs).
2. The popup shows a title and subtitle:
   - right‑click draft (no biome lookup): title **"位置"**, subtitle **"X 120, Z -64"**;
   - after a left‑click, the async biome lookup changes them to a coloured dot + biome name (e.g. "● 平原") and **"X 120, Z -64 · 生物群系"**.
3. Draft row: grid `[1fr 36px]` gap 8 holding StyledInput placeholder **"标记名称"** and the colour square (aria **"标记颜色"**).
4. Actions: **[📌 PinIcon "添加标记"]** colored brand 2xs (pink, 24px tall) and **[ClipboardCopy "复制 /tp"]** outlined 2xs.
5. On click, the marker is pushed, the selection jumps to the new marker, and a success toast **"标记已保存"** appears.
6. Saved markers are listed in **⚙ 地图设置 → 标记** (count on the right). Each row is a button `grid [auto 1fr auto]` gap 7.2, p 5.6, r8 (hover surface‑4): a 9.6px colour dot, the name (12px 700) and the coords "x, z" (10.4px tertiary), followed by a quiet 🗑 2xs button. Clicking a row recentres the map on the marker, selects it and closes the panel. **"暂无保存的标记"** shows when the list is empty.

**Selection popup** (`.map-popup`):
- absolute at the point **+14px/+14px**, clamped inside the canvas; w **272** (17rem); 1px surface‑5, r12, bg surface‑3, `0 12px 28px rgb(0 0 0/.28)`, p12, z8.
- Title line: optional 9.6px **biome colour dot** (1px surface‑5), then a 14px strong text‑primary title. Subtitle: 12px tertiary. Close: quiet 2xs circular ✕ (24px).
- Ore extras: chips (1px surface‑5, r8, bg surface‑4, p 3.2/6.4, 10.9px 700 tertiary): "已验证" (brand tint, pink text) or "可能存在", "精度 {n}%", "Y {min} 到 {max}".
- Action row: flex‑wrap gap 8. For a structure: a Checkbox **"已完成"** in a framed chip (min‑h 32, 1px surface‑5, r8, bg surface‑4). For an ore: **"已挖掘"**.

### 3.7 Interactions and motion

| Input | Behaviour |
|---|---|
| Drag (pointer, >3px) | Pan; the centre follows the pointer 1:1, applied once per animation frame. |
| Mouse wheel | Zoom **anchored at the cursor**, eased over **250ms** with cubic ease‑out `1-(1-p)^3`; Δzoom = wheelΔ/600, clamped to ±0.5 per gesture. |
| Trackpad | Continuous zoom (Δ/600 per event), with a refresh 80ms after the gesture ends. |
| Double‑click | Zoom in 0.5 at the cursor (250ms ease). |
| Pinch (2 pointers) | ±0.35 zoom steps when the finger distance changes by ×1.45 or ×0.69. |
| Click (no drag) | Select marker > structure > ore > spawn > location (location triggers a biome lookup). Also sets ruler points while the ruler is on. |
| Right‑click / long‑press 650ms | Marker draft (§3.6). |
| Keys | ←↑→↓ pan by `max(64 blocks, 18% of the view)`; `+` / `=` zoom in, `-` zoom out; `F` fullscreen; `Esc` closes the popup and panels. |
| 前往 / Enter in X or Z | Centre on the typed coordinates and select that location (popup). |
| 居中显示出生点 | Centre on spawn and select it. |
| 搜索附近 | Centre on and select the nearest displayed structure. |
| 全屏 | Browser fullscreen of the map section (12px inner padding). |

### 3.8 Structure, ore and biome assets (all absolute)

Structure stickers: `UP\apps\app-frontend\public\seed-map-assets\structures\*.webp`, **80×80** RGBA. Pixel‑art icons with a **white die‑cut sticker border (≈3px at 80px)** and a baked soft gray drop shadow toward the bottom‑right. Contact sheets: `research\_scratch\seedmap-structures-sheet.png`; 3× zoom of village/spawn/stronghold/portal/slime: `research\_scratch\seedmap-icons-zoom.png`.

| kind | zh (layer label) | file | depicts | fallback colour | dimension | hidden when zoomed out past scale |
|---|---|---|---|---|---|---|
| slime-chunk | 史莱姆区块 | slime_chunks.webp | slime face (map: green square) | #83B735 | all | 4 |
| village | 村庄 | village.webp | villager head | #D58B35 | overworld | 16 |
| outpost | 掠夺者前哨站 | pillager_outpost.webp | dark oak planks | #C94B52 | overworld | 64 |
| shipwreck | 沉船 | shipwreck.webp | black anchor | #3B9CC6 | overworld | 16 |
| monument | 海底神殿 | ocean_monument.webp | elder guardian face | #34A99A | overworld | 16 |
| mansion | 林地府邸 | woodland_mansion.webp | dark wooden house | #8C67C5 | overworld | 64 |
| ancient-city | 远古城市 | ancient_city.webp | soul lantern | #6677D9 | overworld | 16 |
| trail-ruins | 古迹废墟 | trail_ruin.webp | brush | #C96F3C | overworld | 16 |
| trial-chambers | 试炼密室 | trial_chambers.webp | copper/spawner spiral block | #4DAE72 | overworld | 4 |
| ruined-portal | 废弃传送门 | ruined_portal.webp | nether portal block (purple) | #C95B92 | overworld + nether | 4 |
| stronghold | 要塞 | stronghold.webp | eye of ender | #8793A4 | overworld | 64 |
| desert-pyramid | 沙漠神殿 | desert_pyramid.webp | sandstone temple facade | #D0A23E | overworld | 16 |
| jungle-temple | 丛林神庙 | jungle_temple.webp | mossy cobblestone | #4B9A56 | overworld | 16 |
| swamp-hut | 沼泽小屋 | swamp_hut.webp | witch's black cat | #6A8D58 | overworld | 16 |
| igloo | 雪屋 | igloo.webp | snow dome + ice window | #80B6CA | overworld | 16 |
| ocean-ruin | 海底废墟 | ocean_ruin.webp | drowned face | #4F9EAB | overworld | 4 |
| buried-treasure | 埋藏的宝藏 | buried_treasure.webp | chest | #E0B84E | overworld | 16 |
| mineshaft | 废弃矿井 | mineshaft.webp | rail track | #9B7657 | overworld | 4 |
| desert-well | 沙漠水井 | desert_well.webp | water bucket | #D6AF62 | overworld | 16 |
| geode | 紫晶洞 | amethyst_geode.webp | amethyst cluster | #9969C7 | overworld | 4 |
| fortress | 下界要塞 | nether_fortress.webp | blaze head | #A94A51 | nether | 64 |
| bastion | 堡垒遗迹 | bastion_remnant.webp | piglin face | #7E6658 | nether | 16 |
| end-city | 末地城 | end_city.webp (layer button); map uses end_city_ship.webp (末地城（有末地船）, elytra) / end_city_no_ship.webp (末地城（无末地船）, purpur) | purpur tower | #A57BC5 | end | 16 |
| end-gateway | 末地折跃门 | end_gateway.webp | ender pearl | #70559F | end | 4 |
| spawn | 出生点 | spawn_point.webp | **Minecraft compass** | (#2E3138 fallback) | overworld | n/a |

The "fallback colour" column only applies when a sticker image fails to load; slime chunks always draw as a square. The last column is `maxScale`: the layer is not drawn and its button dims to 68% once `tileScale` exceeds it. The layer strip shows each dimension's layers in this table's order (overworld: 20 + spawn = 21 buttons).

Lucide fallback icons (`SEED_MAP_FEATURE_ICONS`, used only without an image): Home, TagCategoryFlag, Compass, Landmark, Database, Layers, World, Grid, Pin, Pickaxe.

**Ores** (`ores.ts`):
- Layer buttons use **3D‑rendered isometric ore cubes**, `UP\apps\app-frontend\public\seed-map-assets\ores\*.png` (300×300).
- The map uses **flat 16×16 textures** from `…\ores\ore-flat\*.png`.
- Sheet: `research\_scratch\seedmap-ores-sheet.png`.

| kind | zh | Y range | button image |
|---|---|---|---|
| diamond | 钻石矿石 | −144 … 16 | diamond-ore.png |
| iron | 铁矿石 | −64 … 319 | iron-ore.png |
| iron_vein | 铁矿脉 | −60 … −8 | block-of-raw-iron.png |
| copper | 铜矿石 | −16 … 112 | copper-ore.png |
| copper_vein | 铜矿脉 | 0 … 50 | block-of-raw-copper.png |
| gold | 金矿石 | −64 … 32 | gold-ore.png |
| redstone | 红石矿石 | −96 … 15 | redstone-ore.png |
| lapis | 青金石矿石 | −64 … 64 | lapis-lazuli-ore.png |
| coal | 煤矿石 | 0 … 319 | coal-ore.png |
| netherite (nether) | 远古残骸 | 8 … 119 | ancient-debris.png |

Ore mode needs Java 1.18 or newer ("矿物预测需要 Java 版 1.18 或更新版本") and is unavailable in The End.

**Biome icons:** `UP\apps\app-frontend\public\seed-map-assets\biomes\{slug}.webp`, 65 files, **512×512 RGBA isometric voxel *floating‑island dioramas*** (cherry trees, ice spikes, nether wastes, and so on). In the picker each sits in a **28×28** tile: r8, background = biome colour, 1px border `color-mix(biome 70%, surface-5)`, `object-fit: cover`, pixelated. Sheet: `research\_scratch\seedmap-biomes-sheet.png`. These are the most "2.5D miniature stage"‑like real assets in the product. Attribution: the biome and structure art is credited to **MinecraftSearch** in‑app and in `UP\apps\app\COPYING.md`.

### 3.9 Biome palette (`biomes.ts`, identical to the native renderer), with zh names

| Group (zh) | Biomes: zh name `hex` |
|---|---|
| 沙滩 | 沙滩 `#FADE55` · 雪滩 `#FAF0C0` · 石岸 `#A2A284` |
| 洞穴 | 深暗之域 `#031F29` · 溶洞 `#4E3012` · 繁茂洞穴 `#283C00` · 硫磺洞穴 `#C8C828` |
| 沙漠 | 沙漠 `#FA9418` |
| 森林 | 白桦林 `#307444` · 樱花树林 `#FF91C8` · 黑森林 `#40511A` · 繁花森林 `#2D8E49` · 森林 `#056621` · 雪林 `#47726C` · 原始白桦林 `#589C6C` · 苍白之园 `#696D95` · 风袭森林 `#5B7352` |
| 冰雪群系 | 冰封山峰 `#B0B3CE` · 冻河 `#A0A0FF` · 冰刺之地 `#B4DCDC` |
| 丛林 | 竹林 `#849500` · 丛林 `#507B0A` · 稀疏丛林 `#60930F` |
| 恶地 | 恶地 `#D94515` · 被侵蚀的恶地 `#FF6D3D` · 疏林恶地 `#B09765` |
| 山地 | 尖峭山峰 `#DCDCC8` · 草甸 `#60A445` · 雪坡 `#C4C4C4` · 裸岩山峰 `#7B8F74` · 风袭砂砾丘陵 `#888888` · 风袭丘陵 `#606060` |
| 蘑菇岛 | 蘑菇岛 `#FF00FF` |
| 海洋 | 冷水海洋 `#202070` · 深海冷水海洋 `#202038` · 深海冻洋 `#404090` · 深海温水海洋 `#000040` · 深海 `#000030` · 冻洋 `#7070D6` · 温水海洋 `#000090` · 海洋 `#000070` · 暖水海洋 `#0000AC` |
| 平原 | 平原 `#8DB360` · 雪原 `#FFFFFF` · 向日葵平原 `#B5DB88` |
| 河流 | 河流 `#0000FF` |
| 热带草原 | 热带草原 `#BDB25F` · 高原草原 `#A79D64` · 风袭热带草原 `#E5DA87` |
| 沼泽 | 红树林沼泽 `#2CCC8E` · 沼泽 `#07F9B2` |
| 针叶林 | 原始松木针叶林 `#596651` · 原始云杉针叶林 `#818E79` · 雪原针叶林 `#31554A` · 针叶林 `#0B6A5F` |
| 下界 | 下界荒地 `#572526` · 灵魂沙峡谷 `#4D3A2E` · 绯红森林 `#981A11` · 诡异森林 `#49907B` · 玄武岩三角洲 `#645F63` |
| 末地 | 末地 `#8080FF` · 末地小型岛屿 `#4B4BAB` · 末地中部之地 `#C9C959` · 末地高地 `#B5B536` · 末地荒地 `#7070CC` (void `#0D0D16`) |

### 3.10 Other seed‑map surfaces

- **Seed history popout** (`HistoryIcon`):
  - width min(368px, 100vw − 24px), max height min(384px, 100dvh − 64px);
  - header **"种子历史记录"** + quiet **"清空历史"**;
  - rows: 1px surface‑5, r8, bg surface‑4, hover = brand‑tinted border + bg surface‑3;
  - each row: seed (13px 700 tabular), then meta (10.9px tertiary) "26.2 · 手动输入 · 3 分钟前", plus a "✓ n" brand chip;
  - empty state: **"查看过的种子会出现在这里"**.
- **Biome picker popout** (top‑start):
  - w min(480px, 100vw − 24px); header **"选择群系"** + "已选 {n} / {total}", with quiet buttons 全选 / 反选 / 清除;
  - search **"搜索群系"**;
  - accordion groups (1px surface‑5, r8, bg surface‑2): title, dimension pill (brand tint when it matches the current dimension) and "n/total";
  - 2‑column checkbox grid with the 28px island tiles.
- **从实例世界载入种子 modal:**
  - hint **"选择包含该世界的实例"**;
  - instance rows (1px surface‑5, r12, bg surface‑2, px 10.4 py 8, gap 10.4): InstanceIcon + name + "版本 · loader" + chevron;
  - then **"返回实例列表"**, **"选择一个单人世界"**, world rows (world icon or WorldIcon) with "{ago}游玩过" / "尚未游玩";
  - on success: toast **"已载入世界 {world} 的种子"**.
- **版权与来源说明 modal** (w min(544px, 100vw − 48px)), three sections with 20px tertiary icons:
  - 地图图稿 (MinecraftSearch) [访问 MinecraftSearch ↗];
  - 本地地图引擎 (cubiomes, MIT) [查看 cubiomes ↗];
  - 非官方工具.

### 3.11 Seed‑map strings (zh‑CN verbatim)

| Area | zh‑CN |
|---|---|
| Title / subtitle parts | 种子地图 · Java 版 · Java 版：大型生物群系 · 主世界 · 下界 · 末地 |
| Toolbar labels | 版本类型 · 游戏版本 · 种子 · 维度 · 坐标 · 深度 |
| Seed | 输入数字或文本种子 · 随机种子 · 从实例导入 · 种子历史记录 · 清空历史 · 从历史中移除 · 查看过的种子会出现在这里 · 手动输入 · 分享链接 |
| Elevation | 地表 (Y=128) · 浅层地下 (Y=16) · 深层地下 (Y=-32) |
| Actions | 前往 · 复制地图链接 · 已复制地图链接 · 复制 /tp · 已复制传送命令 |
| Layers | 地图图层 · 矿物图层 · 结构 · 矿物 · 显示图层名称 · 隐藏图层名称 · 展开图层 · 收起图层 · 全选 · 清除 · 重置 · 出生点 · 放大以显示{layer} |
| Ores UI | 放大地图以扫描矿物 · 末地不支持矿物扫描 · 矿物预测需要 Java 版 1.18 或更新版本 · Y 范围 · 最低 Y · 最高 Y · 重置 Y 范围 · 正在扫描矿物 {processed}/{total} · 矿物扫描失败，请刷新地图后重试。 · 已验证 · 可能存在 · 精度 {precision}% · Y {min} 到 {max} · 已挖掘 |
| Map chrome | 1 像素 = {scale} 格 · 放大 · 缩小 · 居中显示出生点 · 全屏 · 退出全屏 · 测量距离 · {distance} 格 · 清除测距 · 地图设置 · 区块坐标 · 等高线 · 地形估算 · 显示网格 · 搜索附近 · 加载中 · 地图生成失败 · 关闭面板 · 估算 · 版权与来源说明 |
| Selection / markers | 位置 · 生物群系 · 添加标记 · 标记名称 · 标记颜色 · **标记已保存** · 标记 · 暂无保存的标记 · 删除标记 · 已完成 |
| Biome picker | 群系高亮 · 选择群系 · 已选择 {count} 个群系 · 已选 {selected} / {total} · 搜索群系 · 反选 · 没有匹配的群系 · groups: 沙滩 洞穴 沙漠 森林 冰雪群系 丛林 恶地 山地 蘑菇岛 海洋 平原 河流 热带草原 沼泽 针叶林 下界 末地 |
| Import modal | 从实例世界载入种子 · 选择包含该世界的实例 · 选择一个单人世界 · 返回实例列表 · 未找到实例，请先安装一个实例。 · 该实例还没有单人世界。 · {ago}游玩过 · 尚未游玩 · 已载入世界 {world} 的种子 |
| Copyright modal | 地图图稿 · 本地地图引擎 · 非官方工具 · 访问 MinecraftSearch · 查看 cubiomes |
| Onboarding | 加载世界前先找到它 / 输入种子或从实例载入，然后在本地地图中查看群系、结构与矿物图层。 |

Note: some zh strings intentionally differ from the English. `share` = 复制地图链接 (en "Share"); `settings` = 地图设置 (en "Advanced settings"); `markers` = 标记 (en "My markers"); `search-nearby` = 搜索附近 (en "Nearest structure"); `loading` = 加载中; `terrain` = 地形估算; `depth` = 深度; `show-grid` = 显示网格.

---

## 4. 投影工坊 (Schematic workshop, `/lab/schematic-preview`)

Files:
- page: `UP\apps\app-frontend\src\pages\LabSchematicPreview.vue` (2829 lines)
- library: `UP\apps\app-frontend\src\lab\schematic-preview\{scene,mesh-worker,meshing,block-preview,resources,builtin-resources,editing,backend,storage}.ts`
- components: `UP\apps\app-frontend\src\components\lab\schematic-preview\{SchematicInstancePickerModal,SchematicBlockPickerModal,SchematicInfoModal,SchematicMaterialSwatch}.vue`
- native: `UP\apps\app\src\api\schematic_preview.rs`
- vanilla block data: `UP\apps\app-frontend\src\lab\schematic-preview\assets\vanilla\` (`texture-atlas.png` **2048×2128**, plus block model, state, name and property indexes synced from misode/mcmeta by `UP\scripts\axolotl\sync-schematic-resources.mjs`)
- libraries: `three@^0.185`, `deepslate@^0.26` (Minecraft block‑model builder)

### 4.1 What it is

- **投影** is the Chinese community term for Litematica schematics (in‑game they render as translucent ghost‑block "projections").
- **Formats:** Litematica **`.litematic`** ("Litematic v{n}") and Sponge **`.schem`** v2/v3 ("Sponge v{n}"). The file dialog filter, native drag‑drop and instance scan accept only these two. **No `.nbt`, no legacy `.schematic`.**
- **Sources:**
  - local file (打开文件);
  - an instance's schematic files (从实例选择), shown as a virtualised folder tree (`instance/schematics/...`, folders show "(n)");
  - instance **Files** tab context menu, or the instance content list (schematic items get an inline ✎ action) → **"在投影工坊中打开"**, which opens the route with `?instance=&path=`;
  - drag & drop onto the workspace;
  - **最近的投影** list.
- **Export:**
  - **导出投影** → Sponge 投影（.schem）/ Litematica 投影（.litematic）, saved as `{name}-edited.ext`;
  - **⋯ more** → 导出 PNG (canvas screenshot `{name}-preview.png`), 导出材料表 CSV (`block,count`), 重新加载;
  - materials tab → 导出材料表 JSON.

### 4.2 Empty state (what you see on entering)

```
main.schematic-page  height calc(100vh − 64px), min-h 576, bg --color-bg (#ebebeb)
├─ section.schematic-empty  flex-1, centred, p 32, min-h 352
│   └─ EmptyState type="no-documents"  max-w 512, gap 12, p 24
│       ├─ NoDocumentsIllustration  height min(200px, 36vh)
│       │    (UP\packages\assets\illustrations\no-documents.svg: stacked document sheets with speed lines,
│       │     filled with surface tokens, so in light theme it is pale white on #ebebeb.
│       │     Renders: research\_scratch\illustration-no-documents-light.png (light) / illustration-no-documents.png (dark))
│       ├─ h2 "编辑 Minecraft 投影"   24px/600 text-primary, centred
│       ├─ p  "打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。"  14px/24px tertiary
│       └─ actions (gap 8, mt 8): [FileArchiveIcon 打开文件] colored brand md (pink)   [FolderSearchIcon 从实例选择] outlined md
└─ section.schematic-recent  w min(832px, 100% − 48px), centred, mb 32   (only if there is history)
    header: h2 "最近的投影" 16px + [🗑 清空最近记录] quiet 2xs
    rows (py 8, gap 12): FileArchiveIcon 20 tertiary · filename (strong, text-default) /
        source 12px tertiary ("C:\…\x.litematic" or "实例名 · schematics/x.litematic", or red "文件不存在") · [✕ quiet 2xs]
```

### 4.3 Loaded layout

```
main.schematic-page (position relative)
├─ progress bar  absolute top, h 4, bg surface-5, fill brand; width transition 200ms
│     parse 12% → resources 38% → mesh 38% + 62% × progress
├─ header.schematic-toolbar  min-h 68, p 10.4/16, gap 16, border-bottom 1px surface-5, bg surface-2
│   ├─ left: h1 filename 16px/600 text-primary (truncate) + TagItem "Litematic v6" (example)
│   │        p 12px tertiary: "{W} × {H} × {L} · {blockCount} 方块"
│   └─ right (gap 8): [↶ 撤销 | ↷ 重做] group (1px surface-5, r12, p2, gap2, quiet circular 36 buttons; tooltips "撤销 (Ctrl+Z)" / "重做 (Ctrl+Y)")
│                     [FileArchiveIcon 打开 ⌄]  [SaveIcon 导出投影 ⌄]  [⋯]
│                     (inferred: these three triggers are unstyled reset <button>s (icon + label, no frame);
│                      their menus are .menu-surface popovers with quiet 20px-icon rows)
└─ div.schematic-workbench  grid [1fr | 340px], bg surface-1
    ├─ section.schematic-viewport  (WebGL canvas; border-right + inset 1px divider)
    │   overlay panel style ("glass"): 1px surface-5, r12, p4, bg color-mix(--color-bg 90%, transparent)
    │   (light ≈ rgba(235,235,235,.9)), --shadow-card, backdrop-filter blur(12px), z10:
    │   ├─ walk control (top 12, right 12): [MoveIcon 只读漫游预览] quiet 2xs (chip-text brand while walking, label → 轨道视角)
    │   ├─ mode toolbar (top 60, centred, gap 2.4):
    │   │     [CubeIcon 单选] [BoxesIcon 框选] [ArrowLeftRightIcon 测量] │ [UnfoldVerticalIcon 层间距]
    │   │     2xs (h24); active = chip-text brand (pink tint fill + pink label); divider 1×20 surface-5
    │   ├─ tool context (top 108, centred, w min(512px, 100% − 24px), p 8.8/10.4, gap 12):
    │   │     层间距: label (12.5px 600, pink icon) + Slider 0–100% step 10
    │   │     测量: "起点 x, y, z · 终点 x, y, z" (12px) /
    │   │           "ΔX n · ΔY n · ΔZ n · 距离 d · 方块跨度 a × b × c" (14px) + [✕ 清除测量]
    │   ├─ layer control (left 12, vertically centred, w 52, h min(384px, 100% − 128px)):
    │   │     [LayersIcon(pink) "Y"] 11.5px 700 tertiary · current-Y number (11.2px bold, centred) · ceiling (9.9px) ·
    │   │     vertical range slider (5.6px track in text-default colour, 12px pink thumb) · floor · "visible/total" ·
    │   │     [↻ 全部] quiet 2xs (32×32)
    │   ├─ canvas controls (bottom 40, right 12, gap 5.6): circular 2xs (24px), base when ON / outlined when OFF:
    │   │     [↺ 复位视角] [ScanEye 切换相机投影] [Grid 显示网格] [Box 显示区域边界] [Eye 显示透明方块] [Maximize 切换全屏 (F11)]
    │   ├─ loading status (top 64, right 12): Spinner 16 + "正在生成模型" + "12 / 40" (12px tertiary)
    │   ├─ WebGL lost (orange): "WebGL 上下文已丢失，恢复后将继续渲染。"
    │   ├─ DROP OVERLAY (while dragging a valid file): inset 12, 2px DASHED brand border, r12,
    │   │     bg color-mix(--color-bg 88%), centred brand bold text: [FileArchiveIcon 24px] "松开以打开投影"
    │   ├─ walk mode: centre crosshair 24×24 (four 2×8 white-72% bars + 4px dot) and pill "速度 8 · 滚轮调速"
    │   └─ status bar (bottom, h 28, border-top divider, bg surface-2 90% + blur 8, 11.5px text-primary):
    │         "x, y, z · 方块名 [prop=val,…] · 已选 n 个"  or  tertiary "minX, minY, minZ → maxX, maxY, maxZ"
    └─ aside.schematic-inspector  w 340, bg surface-2, p 12, gap 12, scroll
        ├─ Tabs (full width): [EditIcon 编辑] [ListIcon 材料]
        ├─ 编辑 tab: sections (border-top 1px surface-5, pt 12; h2 13.1px with 16px icon), 2-col button grid gap 8, left-aligned md buttons:
        │   • BoxesIcon 已选方块: summary box (1px surface-5, r12, p 10.4/12, bg surface-3): "已选 n 个" + block name;
        │       brand hint "请选择另一对角" in area-select mode
        │       [ListIcon 相同材料] [LayersIcon 同一层] [BoxesIcon 连通方块] [✕ 清除选择 (quiet)]
        │   • EyeIcon 可见性: [EyeOff 隐藏所选] [ScanEye 仅显示所选] [Eye 全部显示 (quiet)] [Copy 坐标 (quiet)]
        │   • EditIcon 编辑: [✎ 替换所选] colored brand (PINK) · [🗑 删除所选] outlined red
        │   • RotateClockwise 整体变换: [逆时针旋转] [顺时针旋转] [↔ 沿 X 轴镜像] [↕ 沿 Z 轴镜像]
        └─ 材料 tab: StyledInput "搜索材料" + [⬇ 导出材料表 JSON] outlined 2xs; list (gap 2) of rows
            min-h 40, p 5.6/7.2, r8, 11.5px, hover surface-4:
            [22.4px isometric block swatch, 1px divider, r3.2, pixelated] [zh block name] [count, bold tabular]
            expanded: blockstate codes (10.4px tertiary) + [BoxesIcon 全选此材料] [EditIcon 设为替换材料]
```

At 1440×900 (inferred): toolbar 68px, the **3D viewport is ≈1036×768**, and the inspector is 340×768.

Responsive: ≤900px stacks the viewport (h min(64vh, 544px)) above a collapsible inspector headed "检查器". ≤520px hides the toolbar labels.

### 4.4 The 3D viewer (`scene.ts`), exact parameters

| Aspect | Value |
|---|---|
| Renderer | three.js WebGLRenderer, antialias, `preserveDrawingBuffer` (PNG export), pixel ratio ≤2 |
| **Background** | **clear colour `#0a0a0a`** (near black, in both light and dark themes) |
| Colour | sRGB output, **ACESFilmic tone mapping, exposure 1.5** |
| Lights | Ambient `#ffffff` 0.8 · Hemisphere sky `#87ceeb` / ground `#444444` 0.6 · **Key** directional `#fffbf0` **4.0** from (−100, 151, 50) · Fill directional `#ffffff` 0.3 from (−30, 40, −30) |
| Blocks | **Real Minecraft block models** built with *deepslate* from vanilla models, textured from the 2048×2128 atlas with **NearestFilter (pixelated)**. `MeshLambertMaterial` with vertex colours (grass/foliage tint). Opaque `alphaTest .08`; translucent (glass, water…) `opacity .68`. "无缝玻璃" merges glass faces. Missing models use the missing texture tinted with a hashed pastel colour (0.55–0.95 per channel). |
| **Face brightness** (inferred, from the light math in the default view) | Top faces brightest. In the default camera view the **left visible face (+Z)** is about **75–80%** of the top, and the **right visible face (+X)** about **55–60%** (key light comes from −X +Y +Z). Good multipliers for CSS‑3D cubes: top 1.0 / left 0.78 / right 0.57. |
| **Grid floor** | Two `GridHelper`s at `bounds.min.y − 0.02`, size ≥200 blocks, centred on the build (snapped to 12). Cell lines every 1 block `#404040` opacity .72; **section lines every 12 blocks `#6b6b6b` opacity .9**. |
| **Region bounds** (显示区域边界) | `Box3Helper` per region, colour **`#58736a`** (muted green‑gray), opacity .52; hidden while layer spacing > 0 |
| **Selection** | Outer surface of the selected blocks filled with **brand colour (`#db2777`) at opacity .24** (polygon offset, double‑sided, not tone‑mapped), plus **solid brand edge lines** drawn on top. Multi‑block selections also get a brand bounding box (opacity .65, expanded by 0.025). |
| **Measurement** | Brand‑coloured wire box on the start and end blocks + a brand line between their centres, drawn over everything |
| **Layer range** (Y slider) | Clipping planes keep `[floor, Y]`, cutting the build away from the top |
| **Layer spacing** (层间距, 0–100% step 10) | Each block's Y += `(y − floorY) × t`. At 100% every layer floats one block above the one below (an exploded stack). Bounds hide; the selection and measurement follow. |
| Camera | Perspective FOV **50°**, near/far auto. **Fit view = target the centre, camera at centre + (m, 0.8m, m)** with m = max(size, 4): a 3/4 view from +X+Z about 30° above the horizon. Orthographic toggle (span 64, zoom = min(8, 42/m)). |
| Controls | OrbitControls with damping 0.1, `zoomToCursor`, screen‑space pan, min distance 3. A click (≤4px pointer travel) raycasts and selects the block under the cursor; a **double‑click** (`event.detail ≥ 2` → `onFocus`) moves the camera target to that block and closes in (distance × 0.35, min 4). **Walk view** (V key): PointerLock first‑person, WASD to move, Space up, Shift down, speed 4–60 (default 8; scroll to change). |
| Shortcuts | Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y undo/redo (50 steps) · Delete/Backspace = 删除所选 · V walk · Esc clear · F11 fullscreen |

**Block swatches** (inspector, block picker): 64×64 canvas isometric renders of the real model. Per‑face shade = `0.66 + 0.34·|n·L|` with L = (0.42, 0.82, 0.39), so top ≈ 0.94, sides ≈ 0.80, applied as black overlay alpha `1 − shade`.

**Block picker modal** "替换方块":
- width min(760px, 100vw − 32px);
- description **"选择用于替换当前 {count} 个已选方块的目标方块。"**; search **"按名称或 ID 搜索方块"** + "{count} 个方块";
- 4‑column grid of options: min‑h 68, 1px surface‑5, r12, p10, bg surface‑2, holding a 40px swatch + zh name 12.5px + id 9.9px tertiary. Selected: brand border + `color-mix(brand 10%, surface-2)`;
- footer: 取消 / **替换 {count} 个方块**.

**Info modal** "投影信息":
- 元数据 grid: 格式 / 作者 / 数据版本 / 实体 / 方块实体 …;
- 区域 rows (bg surface‑2, r8, p8): region visibility checkbox + [ScanEye 聚焦区域];
- 警告 (orange).

### 4.5 "Projection / hologram" visual language

- **Current cover:** isometric redstone build on a near‑black‑to‑white diagonal gradient. Missing blocks are **cyan `#00F8F8` 1px wireframe cubes** (Litematica ghost blocks) in a staircase, over a faint white perspective grid. White line glyph: tripod projector → dashed rays → framed cube.
- **Legacy cover** (screenshot only): starfield with a teal/blue data shimmer; projector glyph → grid screen holding a pixel cube; 4‑point sparkles.
- **In‑app:** dark `#0a0a0a` stage with a gray grid, muted green‑gray `#58736a` region wireframes, and **pink brand** selection and measurement highlights.

**Suggestion (inferred, for the film):** use cyan wireframes for "not yet built / projected" blocks (product cover language) and pink for "selected / this is the button" (in‑app selection language).

### 4.6 投影工坊 strings (zh‑CN verbatim)

| Area | zh‑CN |
|---|---|
| Title / empty | 投影工坊 · 编辑 Minecraft 投影 · 打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。 · 打开文件 · 从实例选择 · 最近的投影 · 清空最近记录 · 文件不存在 · 从最近记录移除 |
| Loading | 正在解析投影 · 正在读取资源 · 正在生成模型 |
| Toolbar | 打开 · 导出投影 · Sponge 投影（.schem） · Litematica 投影（.litematic） · 更多操作 · 投影信息 · 无缝玻璃 · 导出 PNG · 导出材料表 CSV · 重新加载 · 撤销 · 重做 · 导出完成 · 方块 |
| Viewport | 工作区工具 · 单选 · 框选 · 测量 · 层间距 · 起点 · 终点 · 距离 · 方块跨度 · 清除测量 · 全部 · Y {current} · 显示 {visible}/{total} 层 · 复位视角 · 切换相机投影 · 显示网格 · 显示区域边界 · 显示透明方块 · 切换全屏 · 退出全屏 · 漫游视角 · 轨道视角 · 只读漫游预览 · 速度 {speed} · 滚轮调速 · **松开以打开投影** · WebGL 上下文已丢失，恢复后将继续渲染。 |
| Inspector | 检查器 · 编辑 · 材料 · 已选方块 · 已选 {count} 个 · 请选择另一对角 · 相同材料 · 同一层 · 连通方块 · 清除选择 · 可见性 · 隐藏所选 · 仅显示所选 · 全部显示 · 坐标 · 替换所选 · 删除所选 · 整体变换 · 逆时针旋转 · 顺时针旋转 · 沿 X 轴镜像 · 沿 Z 轴镜像 · 搜索材料 · 没有匹配的材料 · 导出材料表 JSON · 全选此材料 · 设为替换材料 · 警告 · 有 {count} 个方块模型使用缺失纹理占位。 |
| Instance picker | 从实例打开 · 选择包含投影的实例 · 搜索实例 · 搜索投影 · 没有可用的已安装实例。 · 没有匹配搜索条件的实例。 · 该实例中没有找到 .litematic 或 .schem 文件。 · 没有匹配搜索条件的投影。 · 返回实例列表 · 浏览 {name} 中的投影 · 打开 {name} · 展开文件夹 {name} · 折叠文件夹 {name} |
| Block picker | 替换方块 · 选择用于替换当前 {count} 个已选方块的目标方块。 · 按名称或 ID 搜索方块 · {count} 个方块 · 没有匹配的方块 · 取消 · 替换 {count} 个方块 |
| Info modal | 元数据 · 区域 · 聚焦区域 · 作者 · 格式 · 数据版本 · 实体 · 方块实体 |
| Elsewhere | 在投影工坊中打开 (instance Files / content) · 拖放 .litematic 文件来导入投影。 (drop help) · 投影 (content type) |
| Onboarding | 放置前先检查建筑 / 打开本地 .litematic 或 .schem 文件，也可以从已安装实例中选择。3D 工作区集中提供查看、测量、图层控制、材料统计和本地编辑。 · 打开投影工坊，继续 |

---

## 5. Other Lab tools (summaries and key strings)

**渐变文字生成器** (`/lab/gradient-text`, `UP\apps\app-frontend\src\pages\LabGradientText.vue`)

- Layout: a two‑panel workbench (max‑w 1440, p 24). The header has **输出格式** (Combobox of 19 adapters: 原版, 原版兼容, 标准 HEX, CMI, MiniMessage, MiniMessage 渐变, MineDown, 字符串化 NBT, TrChat, TabooLib, TabooLib 渐变, RoseGarden 渐变, 聊天颜色, 服务器 MOTD, BBCode, JSON 文本组件, HTML, CSV, 泰拉瑞亚) plus [复制输出] outlined and [⬇ 导出输出] pink.
- Panels: **文本** (contenteditable on white r8, with toolbar 粗体/斜体/下划线/删除线/混淆) · **颜色** ("{count} 个颜色停靠点", 添加颜色, 随机生成颜色, 导入颜色 "粘贴 HEX、RGB 或 CSS 渐变") · **预览** · **输出** · **预设** (保存预设/应用预设/导入预设/导出预设/下载模板).
- **Preview is a fake Minecraft chat box:** a 704px‑wide panel whose background is `UP\apps\app-frontend\src\assets\lab\minecraft-preview.png` (1920×1200 **in‑game screenshot**: grassy hills, oak/birch trees, blue sky). Text sits on `rgb(1 1 1 / 40%)` in the Minecraft font `UP\apps\app-frontend\src\assets\lab\Minecraft_AE.ttf` (16 MB, includes CJK) at 18px/24px, with a 0.125em hard drop shadow.
- **This is the product's only bundled "Minecraft world" image** (candidate for the "进入世界" ending).

**皮肤编辑器** (`/lab/skin-editor`, `LabSkinEditor.vue`)

- A full‑bleed iframe of an embedded Blockbench skin editor (`third-party/blockbench` submodule) on surface‑1.
- Strings: 正在加载皮肤编辑器 · 无法加载皮肤编辑器 · 嵌入式编辑器未能完成加载，请重试。 · 重试 · Minecraft 皮肤 PNG.
- The Skins page links here with a pink button (`router.push('/lab/skin-editor')`).

**模组翻译** (`/lab/mod-translation`, `LabModTranslation.vue`)

- Layout: header (24px title + "把任意 Minecraft 模组 JAR 翻译成简体中文。", plus a "任务仍在后台运行" live‑dot badge) and a two‑column grid:
  - **输入**: 选择模组 JAR, [分析] pink, 本地预检 hint;
  - **分析结果**: stat tiles 语言条目 / 字符数 / Class 文本候选, with warnings;
  - **AI 与选项**: AI 提供商, 文本模型, 批次大小, toggles;
  - **任务** cards with a phase timeline: 准备 → 生成名称 → 语言 → 质量检查 → Class 文本 → 验收 → 打包 (order of the `phase` type in `UP\apps\app-frontend\src\lab\mod-translation\types.ts`), plus progress "当前批次 {completed} / {total}".
- Key strings: 开始翻译 · 翻译完成 · 预计消耗 · {tokens} 个 token · 打开输出目录 · 该模组带有数字签名，无法修改。

**配方生成器** (`/lab/recipe-generator`, `LabRecipeGenerator.vue`)

- Layout: header with Java version Combobox and [版权与来源] outlined 2xs.
- Recipe sidebar (+ 新建 pink). The centre slot grid sits on **real Minecraft GUI backgrounds**: `UP\apps\app-frontend\src\components\lab\recipe-generator\bg\{合成,熔炼,篝火,切石机,锻造}.png` (696×292; 3×3 crafting grid → arrow → result slot, light gray `#C6C6C6` GUI with a recipe‑book button).
- Item/tag palettes come from a vanilla texture atlas (`lab\recipe-generator\assets\texture-atlas.png`, per‑version item lists 1.12–26.2), with drag‑to‑slot.
- Options: 无序合成, 2x2 合成格, 分组, 分类, 经验值, 烹饪时间, 显示配方通知. Output: JSON (保存 JSON), 复制图片, "将数据包安装到世界" (instance → world picker).
- Categories: 方块 建筑 装备 食物 杂项 红石.

---

## 6. Cross‑feature hooks grounded in real UI (for the story)

| Story beat | Real product mechanism | Where |
|---|---|---|
| Button hides among content cards | Each Lab card already carries a pink `colored brand` button ("› 进入", 80×32, r10): six identical pink buttons in a column, so a runaway pink button can blend in. In the legacy grid, the category chip sits on the cover. | Lab.vue |
| Button stretches into a search box | Lab filter row: white r12 36px StyledInput "搜索工具" next to the "全部工具" combobox. An empty search shows "没有匹配的工具。". | Lab.vue |
| Becomes a map marker | Right‑click → popup → pink "📌 添加标记" → canvas pin in **any colour** (pink allowed) → toast "标记已保存". The name label is a dark tab beside the pin. | LabSeedMap.vue |
| The chase on the map | Cursor types X/Z and clicks the pink **"前往"** button; or "搜索附近"; or "居中显示出生点" (compass); drag/zoom with 250ms cubic easing; ruler "测量距离" draws an amber dashed line with "n 格". | LabSeedMap.vue |
| Map pixel → block | At zoom −2, 1 block = 16 screen px (pixelated). Matches 16×16 block textures in the workshop. | LabSeedMap.vue / scene.ts |
| Instance ↔ seed | "从实例导入" → instance → world → "已载入世界 {world} 的种子" | SeedMapWorldImportModal.vue |
| Falls into the workshop | Drop overlay: 2px dashed pink, "松开以打开投影" → 4px pink progress bar with three stages | LabSchematicPreview.vue |
| Instance → workshop | Instance Files context menu / content row ✎ "在投影工坊中打开" | pages\instance\Files.vue, Mods.vue |
| Button as a selected block | Selection = brand pink 24% fill + pink edges; status bar "x, y, z · 方块名 · 已选 1 个" | scene.ts |
| Exploded / unfolding stage | "层间距" slider 0→100% lifts every layer; Y‑slider clips layers from the top | scene.ts |
| Transforming itself | "替换所选" (pink) → block picker "替换 {n} 个方块"; "整体变换" rotate/mirror; undo/redo | LabSchematicPreview.vue |
| Entering the world | `minecraft-preview.png` in‑game landscape + Minecraft font (gradient text preview); walk view crosshair (只读漫游预览) | LabGradientText.vue / scene.ts |

---

## 7. Icon map (component → SVG, all `UP\packages\assets\icons\`)

Lucide‑style 24×24 stroke icons (`stroke-width 2`, round caps/joins, `currentColor`) unless noted.

| Used for | Component → file |
|---|---|
| Lab nav / breadcrumb | FlaskConicalIcon → `flask-conical.svg`; MapIcon → `map.svg` (seed map crumb); CodeIcon → `code.svg` (workshop crumb) |
| Lab index | SearchIcon → `search.svg`; StarIcon → `star.svg`; ChevronRightIcon → `chevron-right.svg` (`polyline 9 18 15 12 9 6`); Combobox chevron = `chevron-left.svg` rotated −90° |
| Registry fallbacks | PencilIcon `pencil.svg` · PaletteIcon `palette.svg` · WorldIcon `world.svg` (lucide earth) · BoxIcon `box.svg` (isometric box outline) · LanguagesIcon `languages.svg` · BlocksIcon `blocks.svg` |
| Seed map | HashIcon `hash.svg` · RefreshCwIcon `refresh-cw.svg` · HistoryIcon `history.svg` · ImportIcon `import.svg` · CompassIcon `compass.svg` · ShareIcon `share.svg` · CircleAlertIcon `circle-alert.svg` · LandmarkIcon `landmark.svg` · PickaxeIcon `pickaxe.svg` · EyeIcon/EyeOffIcon `eye.svg`/`eye-off.svg` · ChevronDownIcon `chevron-down.svg` · PlusIcon `plus.svg` · MinusIcon `minus.svg` · ExpandIcon `expand.svg` · ContractIcon `contract.svg` · ScaleIcon `scale.svg` · SettingsIcon `settings.svg` · LayersIcon `layers.svg` · GridIcon `grid.svg` · **PinIcon `pin.svg`** (lucide push‑pin, used on "添加标记") · ClipboardCopyIcon `clipboard-copy.svg` · TrashIcon `trash.svg` · XIcon `x.svg` · DatabaseIcon `database.svg` · HomeIcon `home.svg` · TagCategoryFlagIcon `tags\categories\flag.svg` |
| Workshop | FileArchiveIcon `file-archive.svg` · FolderSearchIcon `folder-search.svg` · FolderIcon `folder.svg` · SaveIcon `save.svg` · MoreHorizontalIcon `more-horizontal.svg` · UndoIcon/RedoIcon `undo.svg`/`redo.svg` · **CubeIcon `cube.svg`** (filled 20×20 isometric cube) · BoxesIcon `boxes.svg` · ArrowLeftRightIcon `arrow-left-right.svg` · ArrowUpDownIcon `arrow-up-down.svg` · UnfoldVerticalIcon `unfold-vertical.svg` · MoveIcon `move.svg` · RotateClockwiseIcon/RotateCounterClockwiseIcon `rotate-clockwise.svg`/`rotate-counter-clockwise.svg` · ScanEyeIcon `scan-eye.svg` · MaximizeIcon `maximize.svg` · EditIcon `edit.svg` · ListIcon `list.svg` · CopyIcon `copy.svg` · DownloadIcon `download.svg` · ImageIcon `image.svg` · InfoIcon `info.svg` · CheckIcon `check.svg` · SpinnerIcon `spinner.svg` · TriangleAlertIcon `triangle-alert.svg` |
| Illustrations | `UP\packages\assets\illustrations\no-documents.svg` (workshop empty), `no-search-result.svg` |

---

## 8. Asset inventory (absolute paths)

- Lab covers: `UP\apps\app-frontend\src\assets\lab\{skin-editor-tool-cover.png 768×382, gradient-text-tool-cover.png 1282×638, seed-map-tool-cover.png 1278×636, schematic-preview-cover.png 770×383, mod-translation-cover.png 1780×884, recipe-generator-tool-cover.png 768×382}`
- Gradient text extras: `…\assets\lab\minecraft-preview.png` 1920×1200, `Minecraft_AE.ttf`, `gradient-text-tool-{dark,light}.png` 220×212 (unused in code)
- Seed‑map stickers: `UP\apps\app-frontend\public\seed-map-assets\structures\*.webp` (27 files, 80×80)
- Biome islands: `UP\apps\app-frontend\public\seed-map-assets\biomes\*.webp` (65 files, 512×512)
- Ores: `UP\apps\app-frontend\public\seed-map-assets\ores\*.png` (10 files, 300×300) and `…\ores\ore-flat\*.png` (15 files, 16×16)
- Block texture atlas: `UP\apps\app-frontend\src\lab\schematic-preview\assets\vanilla\texture-atlas.png` (2048×2128) + `texture-layout.json`
- Recipe GUI backgrounds: `UP\apps\app-frontend\src\components\lab\recipe-generator\bg\*.png` (696×292)
- Website showcase (legacy Lab): `UP\apps\website\src\public\showcase\axolotl-lab.png` (3104×1814)

---

## 9. Reference renders I produced (`E:\GitHub\Axolotl-animation\research\_scratch\`)

| File | What |
|---|---|
| `06-mock-lab-index-current.png` / `.html` | Reconstruction of the **current** Lab index content viewport (1376×852) from code values. Not a capture. |
| `old-lab-cover-schematic.png`, `old-lab-card-schematic-full.png`, `old-lab-cover-gradient.png`, `old-lab-header-filters.png` | Crops of the legacy Lab from the website showcase (2× resolution) |
| `seedmap-canvas-glyphs-1x.png`, `seedmap-canvas-glyphs-3x.png` | Marker pins (default green, brand pink, pink with label "启动按钮"), completion badge, selected spawn ring, ruler, redrawn to the code's geometry on cubiomes ocean/plains/beach colours |
| `seedmap-cubiomes-palette.png` | All 65 biome swatches with zh names, hex, id, group |
| `seedmap-structures-sheet.png`, `seedmap-icons-zoom.png` | Structure sticker contact sheet; 3× zoom showing the die‑cut border and baked shadow |
| `seedmap-biomes-sheet.png` | 65 floating‑island biome icons |
| `seedmap-ores-sheet.png` | 3D ore buttons + flat 16px ore textures |
| `illustration-no-documents-light.png`, `illustration-no-documents.png`, `illustration-no-search-result.png` | EmptyState illustrations (light‑token and dark‑fallback renders) |

---

## 10. Caveats and uncertainties

- **Legacy vs current Lab index:** the screenshot (3 tools, grid, cover chips, projector‑starfield schematic cover) predates the current code (6 tools, list, star + "进入"). The old schematic cover asset is gone from the repo; only screenshot crops exist.
- **Layer‑toggle buttons in the seed map:** per `ButtonFrame.vue`, `type="colored"` with `color` undefined still resolves to brand, so active and inactive structure toggles look identically pink (only `aria-pressed` differs). This may be an upstream regression. Verify in a running build before animating an "off" state; a sensible off state would be outlined or neutral.
- **Workshop toolbar triggers** ("打开 ⌄", "导出投影 ⌄", "⋯") and the seed‑history trigger are unframed reset `<button>`s per code (no class gives them a frame). In the running app they likely appear as plain icon+label text. Unverified.
- **No in‑app capture** of the seed map or workshop exists in the research set. Their layouts here come from code. The in‑app map palette is cubiomes, which differs from the seed‑map cover art.
- **Face‑brightness ratios** for the 3D viewer are derived from the lighting setup, not measured.
- **Rights:** biome and structure art is credited to MinecraftSearch; block textures, ore textures and `minecraft-preview.png` depict Mojang content; Blockbench is third‑party. All are real product assets, but promotional reuse may need clearance. Package names `@modrinth/ui` / `@modrinth/assets` are internal only; no Modrinth branding is visible anywhere in the Lab UI (`ModrinthIcon` exists in assets but is not used here).
