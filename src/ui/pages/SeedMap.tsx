/**
 * 种子地图 (LabSeedMap.vue, v1.9.7) in a 1440 × 810 window, panel collapsed,
 * light + pink. Window coordinates throughout (bible §4.6, report 06 §3):
 *
 *   header        y  64–108   「种子地图」 20/700 + 「Java 版 26.2 · 主世界」, badge 「1 像素 = n 格」 + ⓘ
 *   toolbar card  y 120–281   版本类型 · 游戏版本 · 种子 ‖ 维度 · 坐标 + 前往 · 深度 · 复制地图链接
 *   layer strip   y 293–357   「地图图层」 [结构 | 矿物] 👁 ⌄ + pink sticker toggles (names shown)
 *   canvas        x 81–1423, y 357–793 (1342 × 436; FILM: the shell fills the 810-tall
 *                 window instead of its 32 rem minimum, so the bottom toolbar stays on screen)
 *
 * The map is the generated cubiomes-style raster (scripts/gen-biome-map.py):
 * scale-4 tiles for zoom ≥ 1, scale-1 tiles below (streamed nearest-first),
 * drawn pixelated exactly like the canvas (`imageSmoothingEnabled = false`).
 * Map glyphs keep their pixel size and follow the map, like `drawFeatures`.
 *
 * Layers are split so the 2.5D stage can lift them: `SeedMapBase` (floor),
 * `SeedMapOverlay` (floating map chrome, +20), `MarkerPopup` / `SeedToast`
 * (+28). `SeedMapWindow` renders everything flat in its rest state.
 */
import React, {CSSProperties} from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT, SHADOW} from '../../theme/tokens';
import {Icon} from '../Icon';
import {IconName} from '../icons.generated';
import {CollapsedPanelHandle, ContentWell, NavRail, TitleBar} from '../shell/AppWindow';
import {PlayGlyph} from '../../characters/LaunchButton';
import {MAP_FEATURES, MAP_S1, MAP_S4, MAP_SPAWN, MapFeatureKind} from './seedMapData';

// ------------------------------------------------------------------ geometry

export const SM = {
	pageX: 80,
	pageW: 1344,
	header: {y: 64, h: 44},
	toolbar: {y: 120, h: 161},
	strip: {y: 293, h: 64},
	shell: {x: 80, y: 357, w: 1344, h: 437},
	canvas: {x: 81, y: 357, w: 1342, h: 436},
	/** Canvas centre in window coordinates (the map view's centre). */
	cx: 752,
	cy: 575,
} as const;

/** Map view: centre in blocks + zoom (scale = 4^zoom blocks per CSS px). */
export type MapView = {cx: number; cz: number; zoom: number};

export const REST_VIEW: MapView = {cx: -1524, cz: -140, zoom: 1};

export const mapScale = (v: MapView) => Math.pow(4, v.zoom);

/** Block → window point. */
export const blockToWin = (v: MapView, x: number, z: number) => {
	const s = mapScale(v);
	return {x: SM.cx + (x - v.cx) / s, y: SM.cy + (z - v.cz) / s};
};

/** Window point → block. */
export const winToBlock = (v: MapView, wx: number, wy: number) => {
	const s = mapScale(v);
	return {x: v.cx + (wx - SM.cx) * s, z: v.cz + (wy - SM.cy) * s};
};

/** The badge text, as the page formats it: scale ≥ 10 → integer, else toFixed(2) minus ".00". */
export const scaleLabel = (v: MapView) => {
	const s = mapScale(v);
	return s >= 10 ? String(Math.round(s)) : s.toFixed(2).replace(/\.00$/, '');
};

/** Native tile source for a zoom: SEED_MAP_SCALES[floor(zoom)] (1 or 4 here). */
export const tileScaleOf = (zoom: number) => (Math.floor(zoom + 1e-9) <= 0 ? 1 : 4);

// ------------------------------------------------------------------ small parts

const abs = (x: number, y: number, w: number, h: number, extra?: CSSProperties): CSSProperties => ({
	position: 'absolute',
	left: x,
	top: y,
	width: w,
	height: h,
	boxSizing: 'border-box',
	...extra,
});

type BtnKind = 'base' | 'colored' | 'outlined' | 'outlinedBrand' | 'quiet' | 'chipBrand';

const COLORED_SHADOW = `0 0 0 1px ${C.brandHairline}, 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03), inset 0 1px 0 rgba(255,255,255,.3)`;

/** ButtonFrame (1 px transparent border included) in the variants this page uses. */
export const SBtn: React.FC<{
	kind?: BtnKind;
	size?: '2xs' | 'md';
	h?: number;
	r?: number;
	px?: number;
	icon?: IconName;
	iconNode?: React.ReactNode;
	label?: React.ReactNode;
	w?: number;
	minW?: number;
	circular?: boolean;
	hover?: number;
	press?: number;
	style?: CSSProperties;
}> = ({kind = 'base', size = 'md', h, r, px, icon, iconNode, label, w, minW, circular, hover = 0, press = 0, style}) => {
	const md = size === 'md';
	const H = h ?? (md ? 36 : 24);
	const iconSize = md ? 20 : 16;
	let bg = 'transparent';
	let fg: string = C.textPrimary;
	let ic: string = C.textDefault;
	let border = '1px solid transparent';
	let shadow: string | undefined;
	if (kind === 'base') {
		bg = C.control;
		shadow = SHADOW.control;
	} else if (kind === 'colored') {
		bg = C.brand;
		fg = '#fff';
		ic = '#fff';
		shadow = COLORED_SHADOW;
	} else if (kind === 'outlined') {
		border = `1px solid ${C.divider}`;
	} else if (kind === 'outlinedBrand') {
		border = `1px solid ${C.brand}`;
		fg = C.brand;
		ic = C.brand;
	} else if (kind === 'quiet') {
		fg = C.textDefault;
		ic = C.textDefault;
	} else if (kind === 'chipBrand') {
		bg = C.brandTintOnChrome;
		fg = C.brand;
		ic = C.brand;
	}
	const iconOnly = label == null;
	return (
		<div
			style={{
				position: 'relative',
				boxSizing: 'border-box',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
				height: H,
				width: iconOnly ? H : w,
				minWidth: minW,
				padding: iconOnly ? 0 : `0 ${px ?? (md ? 10 : 6)}px`,
				gap: md ? 6 : 4,
				borderRadius: circular ? 9999 : r ?? (md ? 12 : 8),
				border,
				background: bg,
				boxShadow: shadow,
				color: fg,
				fontSize: md ? 16 : 14,
				fontWeight: 600,
				lineHeight: '20px',
				whiteSpace: 'nowrap',
				filter: hover > 0 ? `brightness(${1 - 0.1 * hover})` : undefined,
				transform: press > 0 ? `scale(${1 - 0.03 * press})` : undefined,
				...style,
			}}
		>
			{iconNode ?? (icon ? <Icon name={icon} size={iconSize} color={ic} /> : null)}
			{label != null ? <span>{label}</span> : null}
		</div>
	);
};

const ControlLabel: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
	<div style={{position: 'absolute', left: x, top: y, fontSize: 11.2, fontWeight: 700, lineHeight: 1, color: C.textTertiary, whiteSpace: 'nowrap'}}>{children}</div>
);

/** Combobox trigger: white r12, px 16, label 600 text-default, chevron (ChevronLeft −90°) 20. */
const Combo: React.FC<{x: number; y: number; w: number; h: number; text: string}> = ({x, y, w, h, text}) => (
	<div
		style={abs(x, y, w, h, {
			borderRadius: 12,
			background: C.control,
			padding: '0 16px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 10,
			color: C.textDefault,
			fontSize: 16,
			fontWeight: 600,
			whiteSpace: 'nowrap',
		})}
	>
		<span>{text}</span>
		<Icon name="chevron-down" size={20} color={C.textDefault} />
	</div>
);

/** StyledInput look: white r12, 16/500 text-default. */
const Field: React.FC<{x: number; y: number; w: number; h: number; pl?: number; icon?: IconName; children?: React.ReactNode; style?: CSSProperties}> = ({
	x,
	y,
	w,
	h,
	pl = 12,
	icon,
	children,
	style,
}) => (
	<div
		style={abs(x, y, w, h, {
			borderRadius: 12,
			background: C.control,
			paddingLeft: pl,
			display: 'flex',
			alignItems: 'center',
			color: C.textDefault,
			fontSize: 16,
			fontWeight: 500,
			whiteSpace: 'nowrap',
			...style,
		})}
	>
		{icon ? (
			<div style={{position: 'absolute', left: 12, top: (h - 20) / 2}}>
				<Icon name={icon} size={20} color={C.textTertiary} />
			</div>
		) : null}
		{children}
	</div>
);

// ------------------------------------------------------------------ header + toolbar

const Header: React.FC<{view: MapView}> = ({view}) => (
	<>
		<div style={{position: 'absolute', left: SM.pageX, top: SM.header.y, fontSize: 20, lineHeight: '28px', fontWeight: 700, color: C.textPrimary}}>种子地图</div>
		<div style={{position: 'absolute', left: SM.pageX, top: SM.header.y + 28, fontSize: 12, lineHeight: '16px', color: C.textTertiary, whiteSpace: 'nowrap'}}>
			Java 版 26.2 · 主世界
		</div>
		<div
			style={abs(1260, 72, 120, 28, {
				border: `1px solid ${C.divider}`,
				borderRadius: 8,
				background: C.surface2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 11.2,
				fontWeight: 700,
				fontVariantNumeric: 'tabular-nums',
				color: C.textTertiary,
				whiteSpace: 'nowrap',
			})}
		>
			1 像素 = {scaleLabel(view)} 格
		</div>
		<SBtn kind="outlined" circular icon="circle-alert" style={{position: 'absolute', left: 1388, top: 68}} />
	</>
);

const Toolbar: React.FC<{view: MapView}> = ({view}) => {
	const y1 = 133;
	const c1 = 149.8;
	const y2 = 210.8;
	const c2 = 227.6;
	return (
		<>
			<div style={abs(SM.pageX, SM.toolbar.y, SM.pageW, SM.toolbar.h, {border: `1px solid ${C.divider}`, borderRadius: 12, background: C.surface2})} />
			{/* primary row */}
			<ControlLabel x={93} y={y1}>版本类型</ControlLabel>
			<Combo x={93} y={c1} w={345} h={36} text="Java 版" />
			<ControlLabel x={450} y={y1}>游戏版本</ControlLabel>
			<Combo x={450} y={c1} w={194} h={36} text="26.2" />
			<ControlLabel x={656} y={y1}>种子</ControlLabel>
			<Field x={656} y={c1} w={543} h={36} pl={40} icon="hash">
				10292992
			</Field>
			<SBtn kind="outlined" circular icon="refresh-cw" style={{position: 'absolute', left: 1207, top: c1}} />
			<div style={{position: 'absolute', left: 1251, top: c1 + 6}}>
				<Icon name="history" size={24} color={C.textDefault} />
			</div>
			<SBtn kind="outlined" icon="import" label="从实例导入" style={{position: 'absolute', left: 1283, top: c1, width: 128}} />
			{/* secondary row */}
			<div style={abs(93, 197.8, 1318, 1, {background: C.divider})} />
			<ControlLabel x={93} y={y2}>维度</ControlLabel>
			<div style={abs(93, c2, 266, 40, {borderRadius: 12, border: `1px solid ${C.divider}`, background: C.chrome, overflow: 'hidden', display: 'flex'})}>
				{['主世界', '下界', '末地'].map((d, i) => (
					<div
						key={d}
						style={{
							width: 88,
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 14,
							fontWeight: 600,
							color: i === 0 ? '#fff' : C.textDefault,
							background: i === 0 ? C.brand : 'transparent',
							borderRadius: i === 0 ? '11px 0 0 11px' : 0,
							boxShadow: i === 0 ? 'inset 0 1px 0 rgba(255,255,255,.3)' : undefined,
						}}
					>
						{d}
					</div>
				))}
			</div>
			<ControlLabel x={371} y={y2}>坐标</ControlLabel>
			<CoordField x={371} label="X" value={Math.round(view.cx)} />
			<CoordField x={690} label="Z" value={Math.round(view.cz)} />
			<SBtn kind="colored" icon="compass" label="前往" h={40} style={{position: 'absolute', left: 1009, top: c2, width: 80}} />
			<ControlLabel x={1101} y={y2}>深度</ControlLabel>
			<Combo x={1101} y={c2} w={154} h={40} text="地表 (Y=128)" />
			<SBtn kind="outlined" icon="share" label="复制地图链接" h={40} style={{position: 'absolute', left: 1267, top: c2, width: 144}} />
		</>
	);
};

const CoordField: React.FC<{x: number; label: string; value: number}> = ({x, label, value}) => (
	<Field x={x} y={227.6} w={311} h={40} pl={28}>
		<span style={{position: 'absolute', left: 10.4, fontSize: 11.2, fontWeight: 800, color: C.textTertiary}}>{label}</span>
		{value}
	</Field>
);

// ------------------------------------------------------------------ layer strip

const OVERWORLD_LAYERS: Array<{file: string; name: string}> = [
	{file: 'slime_chunks', name: '史莱姆区块'},
	{file: 'village', name: '村庄'},
	{file: 'pillager_outpost', name: '掠夺者前哨站'},
	{file: 'shipwreck', name: '沉船'},
	{file: 'ocean_monument', name: '海底神殿'},
	{file: 'woodland_mansion', name: '林地府邸'},
	{file: 'ancient_city', name: '远古城市'},
	{file: 'trail_ruin', name: '古迹废墟'},
	{file: 'trial_chambers', name: '试炼密室'},
];

const sticker = (file: string) => staticFile(`images/seedmap/${file}.png`);

/**
 * <Img> for the page's rasters (map tiles, stickers), hardened for long parallel renders: a dropped
 * local connection is retried with back-off (1, 2, 4, 8, 16 s) inside a generous delayRender window
 * (and the frame itself retried once on timeout) instead of aborting the render.
 */
const MapImg: React.FC<React.ComponentProps<typeof Img>> = (props) => (
	<Img maxRetries={5} delayRenderTimeoutInMilliseconds={120000} delayRenderRetries={1} {...props} />
);

/** CJK-aware label width at 16 px (Inter digits/latin ≈ 9). */
const labelW = (s: string, fs = 16) => {
	let w = 0;
	for (const ch of s) w += /[　-鿿＀-￯]/.test(ch) ? fs : fs * 0.56;
	return w;
};

const LayerStrip: React.FC = () => {
	const {y, h} = SM.strip;
	const innerX = SM.pageX + 1 + 9.6;
	const midY = y + h / 2;
	// heading: 「地图图层」 + mode switch + 👁 + ⌄  (≈ 272 px)
	const optX = innerX + 272 + 8;
	const optRight = SM.pageX + SM.pageW - 1 - 9.6;
	let ox = optX;
	const buttons: React.ReactNode[] = [];
	for (const l of OVERWORLD_LAYERS) {
		const w = Math.max(128, 10.4 * 2 + 24 + 6 + labelW(l.name) + 2);
		if (ox > optRight) break;
		buttons.push(
			<SBtn
				key={l.file}
				kind="colored"
				label={l.name}
				iconNode={<MapImg src={sticker(l.file)} style={{width: 24, height: 24, display: 'block'}} />}
				px={10.4}
				style={{position: 'absolute', left: ox, top: midY - 18, width: w, justifyContent: 'flex-start'}}
			/>,
		);
		ox += w + 6.4;
	}
	return (
		<>
			<div
				style={abs(SM.pageX, y, SM.pageW, h, {
					border: `1px solid ${C.divider}`,
					borderRadius: '12px 12px 0 0',
					background: C.chrome,
					boxShadow: '0 8px 20px rgba(0,0,0,.2)',
				})}
			/>
			<div style={{position: 'absolute', left: innerX + 4, top: midY - 8, fontSize: 12, lineHeight: '16px', fontWeight: 800, color: C.textTertiary, whiteSpace: 'nowrap'}}>
				地图图层
			</div>
			<div
				style={abs(innerX + 56, midY - 16.2, 135.6, 32.4, {
					border: `1px solid ${C.divider}`,
					borderRadius: 8,
					background: C.surface2,
					padding: 3.2,
					display: 'flex',
					gap: 3.2,
				})}
			>
				<SBtn kind="colored" size="2xs" icon="landmark" label="结构" style={{width: 62}} />
				<SBtn kind="quiet" size="2xs" icon="pickaxe" label="矿物" style={{width: 62}} />
			</div>
			<SBtn kind="base" circular icon="eye-off" style={{position: 'absolute', left: innerX + 195.6, top: midY - 18}} />
			<SBtn kind="base" circular icon="chevron-down" style={{position: 'absolute', left: innerX + 235.6, top: midY - 18}} />
			{/* the options row scrolls horizontally with a hidden scrollbar: clip at the strip's padding box */}
			<div style={abs(optX - 2, y + 1, optRight - optX + 2, h - 2, {overflow: 'hidden'})}>
				<div style={{position: 'absolute', left: -(optX - 2), top: -(y + 1)}}>{buttons}</div>
			</div>
		</>
	);
};

// ------------------------------------------------------------------ the map canvas

export type MarkerDraw = {
	x: number;
	z: number;
	color: string;
	name: string;
	/** 0..1 appearance of the tail (the pin grows its point). */
	tail?: number;
	/** 0..1 label tab extension. */
	label?: number;
	/** Uniform scale about the map point (morph squash). */
	s?: number;
	/** Tiny ▷ in the head (the hero inside the marker). */
	glyph?: number;
	/** Screen offset (tremble). */
	dx?: number;
	dy?: number;
	opacity?: number;
};

/** The exact canvas marker (drawMarkers) at window point (x, y). */
export const MarkerGlyph: React.FC<{x: number; y: number; m: MarkerDraw}> = ({x, y, m}) => {
	const tail = m.tail ?? 1;
	const s = m.s ?? 1;
	const lab = m.label ?? 1;
	const tw = labelW(m.name, 11) + 10;
	const tipY = 2 + 9 * tail;
	return (
		<div style={{position: 'absolute', left: x + (m.dx ?? 0), top: y + (m.dy ?? 0), opacity: m.opacity}}>
			{lab > 0.001 ? (
				<div
					style={{
						position: 'absolute',
						left: 10,
						top: -12,
						width: tw * lab,
						height: 22,
						background: C.markerLabelBg,
						overflow: 'hidden',
						fontFamily: FONT.ui,
						fontSize: 11,
						fontWeight: 600,
						lineHeight: '22px',
						color: '#fff',
						whiteSpace: 'nowrap',
					}}
				>
					<span style={{position: 'absolute', left: 5, top: 0}}>{m.name}</span>
				</div>
			) : null}
			<svg width={40} height={40} viewBox="-20 -20 40 40" style={{position: 'absolute', left: -20, top: -20, overflow: 'visible', transform: `scale(${s})`, transformOrigin: '20px 20px'}}>
				<path
					d={`M 7 -3 A 7 7 0 1 1 -7 -3 A 7 7 0 1 1 7 -3 Z M -4 2 L 0 ${tipY} L 4 2`}
					fill={m.color}
					stroke="#ffffff"
					strokeWidth={2}
				/>
				{m.glyph && m.glyph > 0.001 ? (
					<g transform={`translate(${-4 + 0.4}, ${-3 - 4}) scale(${(8 / 24) * m.glyph})`} opacity={Math.min(1, m.glyph * 1.4)}>
						<polygon points="5 3 19 12 5 21 5 3" fill="none" stroke="#fff" strokeWidth={2.8} strokeLinejoin="round" strokeLinecap="round" />
					</g>
				) : null}
			</svg>
		</div>
	);
};

const FEATURE_FILE: Record<MapFeatureKind, string> = {
	village: 'village',
	'ruined-portal': 'ruined_portal',
	stronghold: 'stronghold',
};

/**
 * Which scale-1 tiles are loaded (streaming emulation): called with the tile's
 * block origin; return true when the tile is drawn.
 */
export type TileGate = (tx: number, tz: number) => boolean;

export const MapCanvas: React.FC<{
	view: MapView;
	s1Gate?: TileGate;
	markers?: MarkerDraw[];
	/** Draw structures / spawn (default true). */
	glyphs?: boolean;
	/** Extra children in window coordinates, clipped to the canvas. */
	children?: React.ReactNode;
}> = ({view, s1Gate, markers, glyphs = true, children}) => {
	const {canvas} = SM;
	const s = mapScale(view);
	const ts = tileScaleOf(view.zoom);
	// window → canvas-local helpers
	const lx = (bx: number) => SM.cx + (bx - view.cx) / s - canvas.x;
	const ly = (bz: number) => SM.cy + (bz - view.cz) / s - canvas.y;
	const pix: CSSProperties = {position: 'absolute', display: 'block', imageRendering: 'pixelated', maxWidth: 'none'};
	const layers: React.ReactNode[] = [];
	// fallback / zoom ≥ 1 source: the scale-4 image (always underneath)
	layers.push(
		<MapImg
			key="s4"
			src={staticFile(MAP_S4.src)}
			style={{...pix, left: lx(MAP_S4.x0), top: ly(MAP_S4.z0), width: MAP_S4.w / s, height: MAP_S4.h / s}}
		/>,
	);
	if (ts === 1) {
		const all = !s1Gate;
		if (all) {
			layers.push(
				<MapImg
					key="s1"
					src={staticFile(MAP_S1.src)}
					style={{...pix, left: lx(MAP_S1.x0), top: ly(MAP_S1.z0), width: MAP_S1.w / s, height: MAP_S1.h / s}}
				/>,
			);
		} else {
			// visible tiles only (256-block native tiles)
			const minBx = view.cx - (SM.cx - canvas.x) * s;
			const maxBx = view.cx + (canvas.x + canvas.w - SM.cx) * s;
			const minBz = view.cz - (SM.cy - canvas.y) * s;
			const maxBz = view.cz + (canvas.y + canvas.h - SM.cy) * s;
			for (let tx = MAP_S1.x0; tx < MAP_S1.x0 + MAP_S1.w; tx += 256) {
				if (tx + 256 < minBx || tx > maxBx) continue;
				for (let tz = MAP_S1.z0; tz < MAP_S1.z0 + MAP_S1.h; tz += 256) {
					if (tz + 256 < minBz || tz > maxBz) continue;
					if (!s1Gate(tx, tz)) continue;
					layers.push(
						<div key={`t${tx}_${tz}`} style={{position: 'absolute', left: lx(tx), top: ly(tz), width: 256 / s, height: 256 / s, overflow: 'hidden'}}>
							<MapImg
								src={staticFile(MAP_S1.src)}
								style={{...pix, left: (MAP_S1.x0 - tx) / s, top: (MAP_S1.z0 - tz) / s, width: MAP_S1.w / s, height: MAP_S1.h / s}}
							/>
						</div>,
					);
				}
			}
		}
	}
	const inside = (x: number, y: number, pad: number) => x > -pad && x < canvas.w + pad && y > -pad && y < canvas.h + pad;
	const stickers: React.ReactNode[] = [];
	if (glyphs) {
		MAP_FEATURES.forEach((f, i) => {
			const x = lx(f.x);
			const y = ly(f.z);
			if (!inside(x, y, 18)) return;
			stickers.push(
				<MapImg
					key={`f${i}`}
					src={sticker(FEATURE_FILE[f.kind])}
					style={{position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, filter: 'drop-shadow(0 2px 2.5px rgba(0,0,0,.48))'}}
				/>,
			);
		});
		const sx = lx(MAP_SPAWN.x);
		const sy = ly(MAP_SPAWN.z);
		if (inside(sx, sy, 20)) {
			stickers.push(
				<MapImg
					key="spawn"
					src={sticker('spawn_point')}
					style={{position: 'absolute', left: sx - 16, top: sy - 16, width: 32, height: 32, filter: 'drop-shadow(0 2px 2.5px rgba(0,0,0,.48))'}}
				/>,
			);
		}
	}
	return (
		<div style={abs(canvas.x, canvas.y, canvas.w, canvas.h, {overflow: 'hidden', background: C.surface2})}>
			{layers}
			{stickers}
			{(markers ?? []).map((m, i) => {
				const x = lx(m.x);
				const y = ly(m.z);
				return inside(x, y, 20) ? <MarkerGlyph key={`m${i}`} x={x} y={y} m={m} /> : null;
			})}
			{children ? <div style={{position: 'absolute', left: -canvas.x, top: -canvas.y}}>{children}</div> : null}
		</div>
	);
};

const CanvasShell: React.FC = () => (
	<div
		style={abs(SM.shell.x, SM.shell.y, SM.shell.w, SM.shell.h, {
			borderLeft: `1px solid ${C.divider}`,
			borderRight: `1px solid ${C.divider}`,
			borderBottom: `1px solid ${C.divider}`,
			borderRadius: '0 0 12px 12px',
			background: C.surface2,
		})}
	/>
);

/** Floor-level page content (window coordinates), inside the content well. */
export const SeedMapBase: React.FC<{
	view: MapView;
	s1Gate?: TileGate;
	markers?: MarkerDraw[];
	canvasChildren?: React.ReactNode;
}> = ({view, s1Gate, markers, canvasChildren}) => (
	<>
		<Header view={view} />
		<Toolbar view={view} />
		<CanvasShell />
		<div style={{position: 'absolute', left: 0, top: 0, width: 1440, height: 810, clipPath: 'inset(357px 17px 17px 81px round 0 0 11px 11px)'}}>
			<MapCanvas view={view} s1Gate={s1Gate} markers={markers}>
				{canvasChildren}
			</MapCanvas>
		</div>
		<LayerStrip />
	</>
);

// ------------------------------------------------------------------ floating map chrome

const RULER_TAB: CSSProperties = {
	border: `1px solid ${C.divider}`,
	background: C.chrome,
	padding: '2.4px 5.6px',
	boxShadow: '0 3px 8px rgba(0,0,0,.24)',
	fontSize: 10.4,
	fontWeight: 700,
	lineHeight: '13px',
	color: C.textPrimary,
	whiteSpace: 'nowrap',
	fontVariantNumeric: 'tabular-nums',
};

const Stack: React.FC<{x: number; items: Array<{icon: IconName; kind: BtnKind}>}> = ({x, items}) => (
	<div
		style={abs(x, SM.canvas.y + 40, 49.2, 130.8, {
			border: `1px solid ${C.divider}`,
			borderRadius: 12,
			background: C.chrome,
			boxShadow: '0 8px 20px rgba(0,0,0,.28)',
			padding: 5.6,
			display: 'flex',
			flexDirection: 'column',
			gap: 4.8,
		})}
	>
		{items.map((it) => (
			<SBtn key={it.icon} kind={it.kind} icon={it.icon} r={8} />
		))}
	</div>
);

export type OverlayState = {
	/** Status pill 「⟳ 加载中」 (spinner angle in degrees), null = hidden. */
	loading?: number | null;
};

/** Rulers, control stacks, status pill and the bottom toolbar (window coordinates). */
export const SeedMapOverlay: React.FC<{view: MapView; state?: OverlayState}> = ({view, state}) => {
	const {canvas} = SM;
	const s = mapScale(view);
	const xs = [-2, -1, 0, 1, 2].map((o) => Math.round(view.cx + (o * canvas.w * s) / 4));
	const zs = [-1, 0, 1].map((o) => Math.round(view.cz + (o * canvas.h * s) / 3));
	const bt = {x: canvas.x + 12, y: canvas.y + canvas.h - 12 - 58, w: canvas.w - 24, h: 58};
	const inX = bt.x + 1 + 9.6;
	const rowY = bt.y + 9;
	return (
		<>
			{/* X ruler: inset 0 56px, five tabs justify-between */}
			<div style={abs(canvas.x + 56, canvas.y, canvas.w - 112, 22, {display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'})}>
				{xs.map((v, i) => (
					<span key={i} style={{...RULER_TAB, borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
						{v}
					</span>
				))}
			</div>
			{/* Z ruler: inset 48px 0, three tabs */}
			<div style={abs(canvas.x, canvas.y + 48, 80, canvas.h - 96, {display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start'})}>
				{zs.map((v, i) => (
					<span key={i} style={{...RULER_TAB, borderLeft: 'none', borderRadius: '0 8px 8px 0'}}>
						{v}
					</span>
				))}
			</div>
			<Stack
				x={canvas.x + 12}
				items={[
					{icon: 'plus', kind: 'base'},
					{icon: 'minus', kind: 'base'},
					{icon: 'compass', kind: 'base'},
				]}
			/>
			<Stack
				x={canvas.x + canvas.w - 12 - 49.2}
				items={[
					{icon: 'expand', kind: 'base'},
					{icon: 'scale', kind: 'outlined'},
					{icon: 'settings', kind: 'outlined'},
				]}
			/>
			{state?.loading != null ? (
				<div
					style={{
						position: 'absolute',
						left: SM.cx,
						top: canvas.y + 12,
						transform: 'translateX(-50%)',
						border: `1px solid ${C.divider}`,
						borderRadius: 12,
						background: C.chrome,
						padding: '5.6px 8.8px',
						display: 'flex',
						alignItems: 'center',
						gap: 5.6,
						fontSize: 11.5,
						fontWeight: 700,
						lineHeight: '14px',
						color: C.textTertiary,
						whiteSpace: 'nowrap',
					}}
				>
					<div style={{transform: `rotate(${state.loading}deg)`, width: 12, height: 12}}>
						<Icon name="refresh-cw" size={12} color={C.textTertiary} />
					</div>
					加载中
				</div>
			) : null}
			{/* bottom toolbar */}
			<div
				style={abs(bt.x, bt.y, bt.w, bt.h, {
					border: `1px solid ${C.divider}`,
					borderRadius: 12,
					background: C.chrome,
					boxShadow: '0 10px 26px rgba(0,0,0,.3)',
				})}
			/>
			<div
				style={abs(inX, rowY, 117.2, 40, {
					border: `1px solid ${C.divider}`,
					borderRadius: 12,
					background: C.control,
					padding: '0 9.6px',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontSize: 12,
					fontWeight: 700,
					color: C.textPrimary,
					whiteSpace: 'nowrap',
				})}
			>
				<span>群系高亮</span>
				<div style={{position: 'relative', width: 40, height: 20, borderRadius: 99, background: C.control, boxShadow: `inset 0 0 0 1px ${C.divider}`}}>
					<div style={{position: 'absolute', left: 4, top: 4, width: 12, height: 12, borderRadius: 99, background: C.gray}} />
				</div>
			</div>
			<div
				style={abs(inX + 125.2, rowY + 2, 799.6, 36, {
					border: `1px solid ${C.divider}`,
					borderRadius: 12,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 6,
					fontSize: 16,
					fontWeight: 600,
					color: C.textPrimary,
				})}
			>
				<Icon name="layers" size={20} color={C.textPrimary} />
				<span>选择群系</span>
				<Icon name="chevron-down" size={20} color={C.textPrimary} />
			</div>
			<SBtn kind="chipBrand" icon="layers" label="地形估算" h={40} style={{position: 'absolute', left: inX + 932.8, top: rowY, width: 116}} />
			<SBtn kind="outlinedBrand" icon="grid" label="显示网格" h={40} style={{position: 'absolute', left: inX + 1056.8, top: rowY, width: 116}} />
			<SBtn kind="outlined" icon="search" label="搜索附近" h={40} style={{position: 'absolute', left: inX + 1180.8, top: rowY, width: 116}} />
		</>
	);
};

// ------------------------------------------------------------------ marker popup + toast

export type PopupState = {
	/** Anchor (the selected map point) in window coordinates. */
	ax: number;
	ay: number;
	title: string;
	subtitle: string;
	/** Marker draft row (name input + colour square). */
	draft?: {
		text: string;
		/** Pinyin being composed (underlined marked text), shown after `text`. */
		composing?: string;
		focused?: number;
		caret?: boolean;
		/** The colour square: its swatch colour, or null when the hero has taken its place. */
		swatch?: string | null;
	};
	/** After saving: 复制 /tp + 删除标记. */
	saved?: boolean;
	addHover?: number;
	addPress?: number;
	opacity?: number;
};

/** Popup geometry for an anchor: +14/+14, clamped inside the canvas (selectionStyle). */
export const popupBox = (ax: number, ay: number, draft: boolean) => {
	const px = ax - SM.canvas.x;
	const py = ay - SM.canvas.y;
	const left = Math.min(Math.max(px + 14, 8), Math.max(SM.canvas.w - 286, 8));
	const top = Math.min(Math.max(py + 14, 8), Math.max(SM.canvas.h - 226, 8));
	const x = SM.canvas.x + left;
	const y = SM.canvas.y + top;
	const titleY = y + 13;
	const draftY = titleY + 36 + 12;
	const actionsY = draft ? draftY + 36 + 12 : draftY;
	return {
		x,
		y,
		w: 272,
		h: actionsY + 24 + 13 - y,
		titleY,
		input: {x: x + 13, y: draftY, w: 204, h: 36},
		swatch: {x: x + 13 + 212, y: draftY, w: 36, h: 36},
		add: {x: x + 13, y: actionsY, w: 90, h: 24},
		copy: {x: x + 13 + (draft ? 98 : 0), y: actionsY, w: 83, h: 24},
	};
};

export const MarkerPopup: React.FC<{p: PopupState}> = ({p}) => {
	const draft = !!p.draft && !p.saved;
	const b = popupBox(p.ax, p.ay, draft);
	const d = p.draft;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, opacity: p.opacity}}>
			<div
				style={abs(b.x, b.y, b.w, b.h, {
					border: `1px solid ${C.divider}`,
					borderRadius: 12,
					background: C.chrome,
					boxShadow: '0 12px 28px rgba(0,0,0,.28)',
				})}
			/>
			<div style={{position: 'absolute', left: b.x + 13, top: b.titleY, width: 200}}>
				<div style={{fontSize: 14, lineHeight: '20px', fontWeight: 700, color: C.textPrimary, whiteSpace: 'nowrap'}}>{p.title}</div>
				<div style={{fontSize: 12, lineHeight: '16px', color: C.textTertiary, whiteSpace: 'nowrap'}}>{p.subtitle}</div>
			</div>
			<SBtn kind="quiet" size="2xs" circular icon="x" style={{position: 'absolute', left: b.x + b.w - 13 - 24, top: b.titleY}} />
			{draft && d ? (
				<>
					<div
						style={abs(b.input.x, b.input.y, b.input.w, b.input.h, {
							borderRadius: 12,
							background: C.control,
							boxShadow: d.focused ? `0 0 0 ${4 * d.focused}px ${C.brandRing}` : undefined,
							paddingLeft: 12,
							display: 'flex',
							alignItems: 'center',
							fontSize: 16,
							fontWeight: 500,
							color: d.focused ? C.textPrimary : C.textDefault,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
						})}
					>
						{d.text || d.composing ? (
							<>
								{d.text ? <span>{d.text}</span> : null}
								{d.composing ? <span style={{textDecoration: 'underline', textUnderlineOffset: 3, textDecorationThickness: 1}}>{d.composing}</span> : null}
							</>
						) : (
							<span style={{color: C.textTertiary, opacity: 0.9}}>标记名称</span>
						)}
						{d.caret ? (
							<span
								style={{
									display: 'inline-block',
									width: 1.5,
									height: 20,
									background: C.textPrimary,
									marginLeft: d.text || d.composing ? 1 : -labelW('标记名称') - 0.5,
								}}
							/>
						) : null}
					</div>
					<div
						style={abs(b.swatch.x, b.swatch.y, 36, 36, {
							border: `1px solid ${C.divider}`,
							borderRadius: 8,
							background: C.control,
							padding: 3.2,
						})}
					>
						{d.swatch ? <div style={{width: '100%', height: '100%', borderRadius: 4, background: d.swatch, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.18)'}} /> : null}
					</div>
					<SBtn
						kind="colored"
						size="2xs"
						icon="pin"
						label="添加标记"
						hover={p.addHover}
						press={p.addPress}
						style={{position: 'absolute', left: b.add.x, top: b.add.y, width: b.add.w}}
					/>
				</>
			) : null}
			<SBtn kind="outlined" size="2xs" icon="clipboard-copy" label="复制 /tp" style={{position: 'absolute', left: b.copy.x, top: b.copy.y, width: b.copy.w}} />
			{p.saved ? <SBtn kind="outlined" size="2xs" icon="trash" label="删除标记" style={{position: 'absolute', left: b.copy.x + b.copy.w + 8, top: b.copy.y, width: 90}} /> : null}
		</div>
	);
};

/**
 * Success notification (NotificationPanel): right 24, 450 wide, r 8, green stripe, 40 tall (py-2 around
 * the 24 px row). The app pins the stack at bottom 24, but lifts it (bottom 90) when a floating bar sits
 * at the bottom; FILM: the map's bottom toolbar plays that bar here (the canvas is shortened to fit
 * 810), so the toast clears it by 9 px instead of covering 「地形估算」/「显示网格」.
 */
export const SEED_TOAST = {x: 1440 - 24 - 450, y: 810 - 96 - 40, w: 450, h: 40} as const;

export const SeedToast: React.FC<{title?: string; t?: number}> = ({title = '标记已保存', t = 1}) => {
	// enter: translateY(100%) scale(.8) + fade, 0.25 s ease-in-out (driven by t 0..1)
	const e = Math.max(0, Math.min(1, t));
	return (
		<div
			style={abs(SEED_TOAST.x, SEED_TOAST.y, SEED_TOAST.w, SEED_TOAST.h, {
				display: 'flex',
				gap: 8,
				borderRadius: 8,
				overflow: 'hidden',
				background: C.chrome,
				boxShadow: SHADOW.xl,
				opacity: e,
				transform: e < 1 ? `translateY(${(1 - e) * 100}%) scale(${0.8 + 0.2 * e})` : undefined,
			})}
		>
			<div style={{width: 8, background: C.green, flexShrink: 0}} />
			<div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 0 4px'}}>
				<Icon name="check-circle" size={24} color={C.green} />
				<div style={{flex: 1, fontSize: 16, fontWeight: 700, color: C.textPrimary, whiteSpace: 'nowrap'}}>{title}</div>
				<div style={{display: 'flex', gap: 4}}>
					<SBtn kind="base" size="2xs" circular icon="copy" />
					<SBtn kind="base" size="2xs" circular icon="x" />
				</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ window

const Crumbs: React.FC = () => (
	<div
		style={abs(240, 12, 400, 26, {
			display: 'flex',
			alignItems: 'center',
			gap: 4,
			paddingTop: 2,
			fontSize: 16,
			whiteSpace: 'nowrap',
			background: C.chrome,
		})}
	>
		<Icon name="flask-conical" size={20} color={C.textDefault} />
		<span style={{color: C.textDefault, fontWeight: 500}}>实验室</span>
		<Icon name="chevron-right" size={20} color={C.textDefault} />
		<Icon name="map" size={20} color={C.textDefault} />
		<span style={{color: C.textPrimary, fontWeight: 600}}>种子地图</span>
	</div>
);

/** Window chrome for the seed map route: title bar 「实验室 › 种子地图」, rail on 实验室, panel collapsed. */
export const SeedMapShell: React.FC<{children?: React.ReactNode; style?: CSSProperties}> = ({children, style}) => (
	<div style={{position: 'relative', width: 1440, height: 810, overflow: 'hidden', background: C.chrome, fontFamily: FONT.ui, color: C.textPrimary, ...style}}>
		<TitleBar breadcrumb={{text: ''}} />
		<Crumbs />
		<NavRail active="lab" />
		<ContentWell right={0}>{children}</ContentWell>
		<CollapsedPanelHandle />
	</div>
);

/** The seed-map floor in its calm rest state (fully loaded, zoom 1), flat. */
export const SeedMapWindow: React.FC<{frame?: number}> = () => (
	<SeedMapShell>
		<SeedMapBase view={REST_VIEW} />
		<SeedMapOverlay view={REST_VIEW} />
	</SeedMapShell>
);

/** Re-export for scenes that draw the hero's ▷ inside map glyphs. */
export {PlayGlyph};
