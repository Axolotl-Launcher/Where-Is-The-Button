# Build guide for module engineers

You are building one module of 《启动按钮去哪了？》, a 1920×1080 / 60 fps Remotion film about Axolotl Launcher. Read, in this order:
1. `design/STORYBOARD.md` — the build document (timeline, conventions §1, your module's shots, hand-offs §5, SFX/music for timing context).
2. `design/concept-product.md` — detailed shot cards; the storyboard says which ones apply to you (with new timings).
3. `research/PRODUCT_BIBLE.md` — only the sections your pages need (§2 visual system, §3 the hero, §4.x your screens, §6 copy). Area reports `research/0*.md` hold deeper detail. Reference mocks: `research/_scratch/*.png`, screenshots `research/ref/*.png`.

## Non-negotiables
- **Fidelity**: real v1.9.7 layouts, sizes, colours, icons and verbatim zh-CN copy (bible §6). Light theme, pink `#db2777`. Inter + Noto Sans SC (CJK capped at 600 automatically by `src/fonts.ts`; just set the weight the product uses). Icons ONLY via `<Icon name=…>` (`src/ui/Icon.tsx`, the product's own SVGs; names = file names in `src/assets/icons`). Never Modrinth marks. PlayIcon is never filled.
- **Hero identity**: pink + outline ▷ visible in every form (storyboard §2).
- **Deterministic**: everything is a pure function of `useCurrentFrame()`. No CSS transitions/animations, no `Math.random()` (use `rand(seed)` / `noise1` from `src/lib/anim.ts`), no timers.
- **Own files only.** Create files under `src/scenes/<YourModule>/…`, `src/ui/pages/…` (your pages), `src/world/…` (M1/M8 only), `public/images/<your-folder>/…`. Replace your stub `src/scenes/Mx.tsx` so it exports `export const Mx: React.FC = …`. **Read-only shared core** (do not edit; if you need a variant, copy it into your own folder): `src/lib/*`, `src/stage/*`, `src/film/*`, `src/characters/*`, `src/ui/kit.tsx`, `src/ui/Icon.tsx`, `src/ui/shell/*`, `src/ui/pages/MinimalHome.tsx`, `src/theme/*`, `src/fonts.ts`, `src/Root.tsx`, `src/scenes/index.ts`, other modules' files. Report any core bug in your final message instead of editing.

## Engine API (read the source for details)
- `src/lib/anim.ts`: `track(frame, [[f, v, ease?], …])`, `prog(frame, a, b, ease)`, `ease.*` (inOut, out, in, fall, rise, outBack, ui, …), `springStep`, `wobble`, `bump`, `hop(from, to, h, t)`, `stretchFromSpeed`, `rand`, `noise1`, `lerp`, `clamp`, `remap`.
- `src/stage/Stage.tsx`: `<Stage cam>` (CSS-3D world; axes x right, y down, **z up**), `Cam {x,y,z,dist,pitch,yaw,roll,persp}`, `<Obj x y z rx ry rz s sx sy sz>`, `<Plane w h>`, `<Slab w h d r face side sideTop>` (extruded rounded volume; children = top face), `<FloorShadow x y floorZ w h r height>`.
- `src/stage/Voxel.tsx`: `<VoxelSet blocks size>` with real 16 px textures in `public/images/blocks/*.png` (`TEX` presets; add your own `BlockTex` objects). Keep visible faces < ~1,500.
- `src/film/timeline.ts`: `MODULES`, `localFrame(m, seconds)`, `sec()`, `FLOOR_Z`, `toWorld(wx, wy, z)`, `SHAFT`, `HOME_HERO`, `ELEV`, `REAL`.
- `src/film/camera.ts`: `flatCam(floorZ, {wx, wy, scale, persp})` (real-app framing), `camTrack(frame, [[f, cam, ease?]…])`, `lerpCam`, `dollyZoom`, `project(cam, p)`.
- `src/film/Floor.tsx`: `<Floor z>` — a 1440×810 window slab whose top face (at z) carries your page DOM in **window coordinates**.
- `src/film/CursorOverlay.tsx`: `<CursorOverlay cam cursor={{x,y,z,kind,press,rot,next,mixT}}>` (render AFTER the Stage, as a sibling), `<CursorShadow cursor floorZ>` (inside the Stage). **In real-app (flat) shots put the cursor at z = floor surface** so its hotspot lands exactly on the UI (glass height +60 causes ~30 px parallax); use +60 only in tilted shots and blend z when the camera tilts.
- `src/characters/LaunchButton.tsx`: `<ButtonFace>` (flat hero face, any morph geometry/state), `<Hero x y z …>` (3D slab + shadow), `<PlayGlyph>`.
- `src/characters/Cursor.tsx`: kinds `arrow | pointer | ibeam | grab | grabbing | move`.
- `src/ui/kit.tsx`: `Btn` (ButtonFrame sizes 2xs…xl × base/colored/outlined/quiet/highlight), `Card`, `Tag`, `Toggle`, `SearchField`, `NavTabs` (explicit slider edges for the inchworm), `Tooltip`, `Avatar`, `Spinner`.
- `src/ui/shell/AppWindow.tsx`: `<AppWindow nav breadcrumb pill panel navSlider quickActive>` and its parts (`TitleBar`, `NavRail`, `ContentWell`, `RightPanel`, `CollapsedPanelHandle`, `NAV_ITEMS`, `navY(i)`); children of the well are laid out in **window coordinates**.
- `src/ui/pages/MinimalHome.tsx`: `mhLayout(panel)`, `Greeting`, `MinimalCard`, `MinimalHomeContent` (film default: panel collapsed).
- `src/brand/AxolotlLogo.tsx`: `<AxolotlLogo size>`.

## CSS-3D pitfalls
- `opacity < 1`, `filter`, `overflow: hidden`, `clip-path`, `mask` on an element with `transform-style: preserve-3d` **flatten** its 3D children. Apply them only to flat leaves (faces, page DOM).
- Put each page's flat DOM inside a `Floor`/`Plane`; put moving 3D characters as siblings in the Stage.
- Prefer `translate3d` positions over layout changes; never use `will-change`.
- Text must stay crisp: avoid scaling flat DOM via `scale()` > 1.5 inside 3D — move the camera instead.

## Pages: export a "rest" window for the tower wides
Each page engineer must also export a component rendering the full window of their floor in a calm default state, e.g. `export const DiscoverWindow: React.FC<{frame?: number}>` (the M2 tower reveal and M6/M7 wides use these). Keep it lean (no off-screen DOM).

## Verify (be economical — every image you view costs budget)
- Dev entry for your module: `src/dev/Mx.tsx` (composition id `Mx`, local frames). Render stills with
  `node scripts/stills.mjs Mx <frames> out/Mx --entry=src/dev/Mx.tsx --sheet --scale=0.5 --par=2`
  e.g. `0-930:60` for a contact sheet. View the sheet, then full-res stills only where detail matters (hand-off frames, typography, the hero's identity).
- Check: hand-off frames match storyboard §5; text crisp and correct; no flattened 3D; hero always recognisable; nothing invented.
- `npx tsc --noEmit` must pass for your files.
- Aim for ≤ 3 contact sheets and ≤ 10 full stills in total.

## Final message (your return value)
Files created; what each shot does (1 line each); deviations from the storyboard and why; known issues; any core bugs found.
