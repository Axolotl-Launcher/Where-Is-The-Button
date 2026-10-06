/**
 * 投影工坊 (LabSchematicPreview.vue, v1.9.7) in a 1440 × 810 window, right
 * panel collapsed (film default). Everything is laid out in WINDOW
 * coordinates from the page's own CSS (bible §4.7, report 06 §4):
 *
 *   page    x 64–1440, y 48–810, #ebebeb
 *   empty   EmptyState "no-documents" centred (illustration 250×200, h2 24/600,
 *           p 14/24 tertiary, [打开文件 pink md] [从实例选择 outlined md])
 *   loaded  toolbar y 48–116 (#f5f5f5) · workbench grid [1fr | 340]:
 *           viewport x 64–1100 (#0a0a0a canvas + grid) · inspector x 1100–1440 (#f5f5f5, p 12)
 *
 * Glass overlays (mode toolbar, tool context, Y-layer control, canvas
 * controls, walk control, loading status) are exported as separate parts
 * drawn at their own origin, so a scene can lift them off the stage (+20)
 * while `WSL` keeps their exact window rectangles. No filename is invented:
 * the toolbar's h1 (manifest.fileName) is left out.
 */
import React, {CSSProperties} from 'react';
import {C, FONT, SHADOW} from '../../theme/tokens';
import {Icon} from '../Icon';
import {IconName} from '../icons.generated';
import {Btn, Tag} from '../kit';
import {AppWindow} from '../shell/AppWindow';
import {NO_DOCUMENTS_MARKUP, NO_DOCUMENTS_VIEWBOX} from './workshop/noDocuments';

type Rect = {x: number; y: number; w: number; h: number};

/** Window-coordinate layout of the page (panel collapsed). */
export const WSL = {
	page: {x: 64, y: 48, w: 1376, h: 762},
	toolbar: {x: 64, y: 48, w: 1376, h: 68},
	viewport: {x: 64, y: 116, w: 1036, h: 694},
	inspector: {x: 1100, y: 116, w: 340, h: 694},
	/** Film: the drop overlay over the whole workspace (inset 12). */
	drop: {x: 76, y: 60, w: 1352, h: 738},
	/** Glass overlays (top 60 centred / top 108 centred / left 12 centred / bottom 40 right 12 / top 12 right 12). */
	modeBar: {x: 438.3, y: 176, w: 287.4, h: 34},
	toolCtx: {x: 326, y: 224, w: 512, h: 58},
	layerCtl: {x: 76, y: 271, w: 52, h: 384},
	canvasCtl: {x: 906, y: 736, w: 182, h: 34},
	walk: {x: 960, y: 128, w: 128, h: 34},
	loading: {x: 902, y: 180, w: 186, h: 32},
	status: {x: 64, y: 782, w: 1036, h: 28},
} satisfies Record<string, Rect>;

/** Centres (window coords) of the mode-toolbar buttons, the slider and the empty-state centre. */
export const WS_POINTS = {
	single: {x: 474.3, y: 193},
	box: {x: 538.7, y: 193},
	measure: {x: 603.1, y: 193},
	spacing: {x: 682.7, y: 193},
	/** Slider track inside the tool context: x from (0 %) → to (100 %), y of the track. */
	track: {x0: 414.4, x1: 712, y: 246},
	emptyCentre: {x: 752, y: 429},
};

export type WsTool = 'select' | 'box' | 'measure' | 'layer-spacing';
export type WsSelection = {count: number; pos?: [number, number, number]; block?: string} | null;

const PINK_CONCRETE = '粉红色混凝土';

const abs = (r: Rect, extra?: CSSProperties): CSSProperties => ({
	position: 'absolute',
	left: r.x,
	top: r.y,
	width: r.w,
	height: r.h,
	boxSizing: 'border-box',
	...extra,
});

/** `.schematic-*` glass: 1 px #ddd, r 12, p 4, color-mix(--color-bg 90 %), shadow-card. */
export const GLASS: CSSProperties = {
	boxSizing: 'border-box',
	border: `1px solid ${C.divider}`,
	borderRadius: 12,
	padding: 4,
	background: 'rgba(235, 235, 235, 0.9)',
	boxShadow: SHADOW.card,
};

/* ───────────────────────── small faithful controls ───────────────────────── */

/** Outlined Button without a colour: 1 px surface-5 ring, primary label, default-coloured icon. */
const OBtn: React.FC<{icon: IconName; label: string; disabled?: boolean; width?: number; size?: 'md' | '2xs'}> = ({icon, label, disabled, width, size = 'md'}) => (
	<Btn
		size={size}
		type="outlined"
		iconNode={<Icon name={icon} size={size === 'md' ? 20 : 16} color={C.textDefault} />}
		label={label}
		disabled={disabled}
		width={width}
		justify={width ? 'flex-start' : 'center'}
		style={{border: `1px solid ${C.divider}`, color: C.textPrimary}}
	/>
);

/** Circular 2xs icon button (canvas controls): base = white + inset ring; outlined = #ddd ring. */
const CircleBtn: React.FC<{icon: IconName; on: boolean}> = ({icon, on}) => (
	<div
		style={{
			width: 24,
			height: 24,
			borderRadius: 999,
			boxSizing: 'border-box',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: on ? C.control : 'transparent',
			boxShadow: on ? SHADOW.control : undefined,
			border: on ? '1px solid transparent' : `1px solid ${C.divider}`,
			flexShrink: 0,
		}}
	>
		<Icon name={icon} size={16} color={C.textDefault} />
	</div>
);

/* ───────────────────────────── title-bar crumb ───────────────────────────── */

/** Breadcrumb 「[flask] 实验室 › [code] 投影工坊」 (Breadcrumbs.vue: gap 4, link text-default, current 600 primary). */
export const WorkshopCrumb: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: 240,
			top: 12,
			height: 26,
			paddingTop: 2,
			boxSizing: 'border-box',
			display: 'flex',
			alignItems: 'center',
			gap: 4,
			fontFamily: FONT.ui,
			fontSize: 16,
			whiteSpace: 'nowrap',
		}}
	>
		<span style={{display: 'flex', alignItems: 'center', gap: 4, color: C.textDefault, fontWeight: 400}}>
			<Icon name="flask-conical" size={20} color={C.textDefault} />
			实验室
		</span>
		<Icon name="chevron-right" size={20} color={C.textDefault} />
		<span style={{display: 'flex', alignItems: 'center', gap: 4, color: C.textPrimary, fontWeight: 600}}>
			<Icon name="code" size={20} color={C.textDefault} />
			投影工坊
		</span>
	</div>
);

/** The shell for F6: AppWindow (实验室 pill, panel collapsed) + the workshop crumb. */
export const WorkshopShell: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<div style={{position: 'relative', width: 1440, height: 810}}>
		<AppWindow nav="lab" panel={false} frame={false} breadcrumb={{text: ''}}>
			{children}
		</AppWindow>
		<WorkshopCrumb />
	</div>
);

/* ─────────────────────────────── empty state ─────────────────────────────── */

/** EmptyState type="no-documents" with the two actions, centred in the page (window coords). */
export const WorkshopEmpty: React.FC<{style?: CSSProperties}> = ({style}) => (
	<div style={{position: 'absolute', left: 64, top: 48, width: 1376, height: 762, ...style}}>
		<div
			style={{
				position: 'absolute',
				left: 688 - 256,
				top: 381 - 190,
				width: 512,
				height: 380,
				boxSizing: 'border-box',
				padding: 24,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 12,
				textAlign: 'center',
			}}
		>
			<svg
				width={250}
				height={200}
				viewBox={NO_DOCUMENTS_VIEWBOX}
				fill="none"
				style={{display: 'block', flexShrink: 0}}
				dangerouslySetInnerHTML={{__html: NO_DOCUMENTS_MARKUP}}
			/>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
				<div style={{fontSize: 24, fontWeight: 600, lineHeight: '32px', color: C.textPrimary, whiteSpace: 'nowrap'}}>编辑 Minecraft 投影</div>
				<div style={{fontSize: 14, lineHeight: '24px', color: C.textTertiary, whiteSpace: 'nowrap'}}>
					打开 Litematica 或 Sponge 投影，在本地进行 3D 查看和编辑。
				</div>
			</div>
			<div style={{marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center'}}>
				<Btn size="md" type="colored" icon="file-archive" label="打开文件" />
				<OBtn icon="folder-search" label="从实例选择" />
			</div>
		</div>
	</div>
);

/** `.schematic-drop-overlay`: inset 12, 2 px dashed brand, r 12, bg #ebebeb @ 88 %, pink bold [FileArchive 24] 松开以打开投影. */
export const WsDropOverlay: React.FC<{r?: Rect; opacity?: number}> = ({r = WSL.drop, opacity = 1}) =>
	opacity <= 0 ? null : (
		<div
			style={abs(r, {
				border: `2px dashed ${C.brand}`,
				borderRadius: 12,
				background: 'rgba(235, 235, 235, 0.88)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 12,
				color: C.brand,
				fontSize: 16,
				fontWeight: 700,
				lineHeight: '24px',
				opacity,
			})}
		>
			<Icon name="file-archive" size={24} color={C.brand} />
			<span>松开以打开投影</span>
		</div>
	);

/** 4 px loading bar at the very top of the page (track #ddd, fill brand). */
export const WsProgressBar: React.FC<{pct: number}> = ({pct}) => (
	<div style={abs({x: 64, y: 48, w: 1376, h: 4}, {background: C.divider, overflow: 'hidden'})}>
		<div style={{width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: C.brand}} />
	</div>
);

/* ─────────────────────────────── loaded layout ────────────────────────────── */

/** `.schematic-toolbar` (filename h1 deliberately omitted — no invented filename). */
export const WsToolbar: React.FC<{dims?: string}> = ({dims = '32 × 2 × 12 · 600 方块'}) => (
	<div
		style={abs(WSL.toolbar, {
			background: C.surface2,
			borderBottom: `1px solid ${C.divider}`,
			padding: '10.4px 16px',
			display: 'flex',
			alignItems: 'center',
			gap: 16,
		})}
	>
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
				<Tag>Litematic v6</Tag>
			</div>
			<div style={{marginTop: 2, fontSize: 12, lineHeight: '16px', color: C.textTertiary, whiteSpace: 'nowrap'}}>{dims}</div>
		</div>
		<div style={{display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${C.divider}`, borderRadius: 12, padding: 2, background: C.surface2}}>
				{(['undo', 'redo'] as IconName[]).map((n) => (
					<div key={n} style={{width: 36, height: 36, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5}}>
						<Icon name={n} size={20} color={C.textDefault} />
					</div>
				))}
			</div>
			{(
				[
					['file-archive', '打开'],
					['save', '导出投影'],
				] as Array<[IconName, string]>
			).map(([icon, label]) => (
				<div key={label} style={{display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px', height: 36, fontSize: 16, fontWeight: 500, color: C.textPrimary, whiteSpace: 'nowrap'}}>
					<Icon name={icon} size={20} color={C.textDefault} />
					{label}
					<Icon name="chevron-down" size={14} color={C.textDefault} />
				</div>
			))}
			<div style={{width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="more-horizontal" size={20} color={C.textDefault} />
			</div>
		</div>
	</div>
);

/**
 * The 3D viewport's canvas: clear colour #0a0a0a and the GridHelper floor
 * (cells every block #404040 @ .72, sections every 12 blocks #6b6b6b @ .9),
 * 200 blocks square, centred on the build snapped to 12 (block = `block` px).
 */
export const WsViewportCanvas: React.FC<{
	grid?: number;
	block?: number;
	/** Grid centre (window coords) — a section crossing. */
	gridCentre?: {x: number; y: number};
	line?: number;
}> = ({grid = 1, block = 4.8, gridCentre = {x: 963.8, y: 456.8}, line = 0.45}) => {
	const vp = WSL.viewport;
	const half = 100 * block;
	const gx0 = gridCentre.x - half;
	const gy0 = gridCentre.y - half;
	const sec = 12 * block;
	return (
		<div style={abs(vp, {background: C.wsBg, overflow: 'hidden'})}>
			{grid > 0 ? (
				<svg
					width={2 * half}
					height={2 * half}
					style={{position: 'absolute', left: gx0 - vp.x, top: gy0 - vp.y, opacity: grid, overflow: 'visible'}}
				>
					<defs>
						{/* lines drawn half a stroke inside each tile so the tile clip never halves them */}
						<pattern id="ws-cell" width={block} height={block} patternUnits="userSpaceOnUse">
							<path d={`M ${block} ${line / 2} H ${line / 2} V ${block}`} fill="none" stroke="rgba(64,64,64,0.72)" strokeWidth={line} />
						</pattern>
						<pattern id="ws-sec" width={sec} height={sec} patternUnits="userSpaceOnUse">
							<path d={`M ${sec} ${line * 0.55} H ${line * 0.55} V ${sec}`} fill="none" stroke="rgba(107,107,107,0.9)" strokeWidth={line * 1.1} />
						</pattern>
					</defs>
					<rect x={0} y={0} width={2 * half} height={2 * half} fill="url(#ws-cell)" />
					<rect x={0} y={0} width={2 * half} height={2 * half} fill="url(#ws-sec)" />
					<path d={`M ${2 * half} 0 V ${2 * half} H 0`} fill="none" stroke="rgba(107,107,107,0.9)" strokeWidth={line * 1.1} />
				</svg>
			) : null}
			{/* border-right 1 px divider + inset 0 0 0 1 px divider */}
			<div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${C.divider}`, borderRight: `1px solid ${C.divider}`}} />
		</div>
	);
};

/** Mode toolbar `[单选] [框选] [测量] │ [层间距]` (2xs; active = chip-text brand). Drawn at its own origin. */
export const WsModeToolbar: React.FC<{tool: WsTool; hover?: WsTool | null; press?: number}> = ({tool, hover = null, press = 0}) => {
	const items: Array<{k: WsTool; icon: IconName; label: string}> = [
		{k: 'select', icon: 'cube', label: '单选'},
		{k: 'box', icon: 'boxes', label: '框选'},
		{k: 'measure', icon: 'arrow-left-right', label: '测量'},
	];
	const b = (it: {k: WsTool; icon: IconName; label: string}) => {
		const on = tool === it.k;
		const hv = hover === it.k;
		return (
			<Btn
				key={it.k}
				size="2xs"
				type={on ? 'highlight' : 'quiet'}
				icon={it.icon}
				label={it.label}
				hover={hv && !on ? 1 : 0}
				press={hv ? press : 0}
				style={hv && on ? {filter: 'brightness(0.9)'} : undefined}
			/>
		);
	};
	return (
		<div style={{...GLASS, width: WSL.modeBar.w, height: WSL.modeBar.h, display: 'flex', alignItems: 'center', gap: 2.4}}>
			{items.map(b)}
			<div style={{width: 1, height: 20, margin: '0 2.4px', flex: 'none', background: C.divider}} />
			{b({k: 'layer-spacing', icon: 'unfold-vertical', label: '层间距'})}
		</div>
	);
};

/**
 * `.schematic-tool-context` for 层间距: label + Slider 0–100 % step 10 (track brand ≤ value, text-default after).
 * `thumbValue` (default `value`) lets a scene animate the thumb/fill between steps while the number snaps.
 */
export const WsToolContext: React.FC<{value: number; thumb?: number; thumbValue?: number}> = ({value, thumb = 0, thumbValue}) => {
	const pct = Math.max(0, Math.min(100, thumbValue ?? value)) / 100;
	const trackW = WS_POINTS.track.x1 - WS_POINTS.track.x0 + 12; // full input width
	const tSize = 12 + 4 * thumb;
	return (
		<div
			style={{
				...GLASS,
				width: WSL.toolCtx.w,
				height: WSL.toolCtx.h,
				padding: '8.8px 10.4px',
				display: 'flex',
				alignItems: 'center',
				gap: 12,
			}}
		>
			<span style={{display: 'flex', alignItems: 'center', gap: 5.6, flex: 'none', color: C.textPrimary, fontSize: 12.48, fontWeight: 600, whiteSpace: 'nowrap'}}>
				<Icon name="unfold-vertical" size={16} color={C.brand} />
				层间距
			</span>
			<div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
				<div style={{position: 'relative', width: trackW, height: 38, flexShrink: 0}}>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 10,
							width: trackW,
							height: 4,
							borderRadius: 2,
							background: `linear-gradient(to right, ${C.brand} 0%, ${C.brand} ${pct * 100}%, ${C.textDefault} ${pct * 100}%, ${C.textDefault} 100%)`,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: 6 + pct * (trackW - 12) - tSize / 2,
							top: 12 - tSize / 2,
							width: tSize,
							height: tSize,
							borderRadius: 999,
							background: C.brand,
						}}
					/>
					<div style={{position: 'absolute', left: 0, right: 0, top: 21, display: 'flex', justifyContent: 'space-between', fontSize: 12, lineHeight: '16px', color: C.textDefault, whiteSpace: 'pre'}}>
						<span> 0 % </span>
						<span> 100 % </span>
					</div>
				</div>
				<div
					style={{
						marginLeft: 12,
						width: 96,
						height: 36,
						flexShrink: 0,
						borderRadius: 12,
						background: C.control,
						boxSizing: 'border-box',
						paddingLeft: 12,
						display: 'flex',
						alignItems: 'center',
						fontSize: 16,
						fontWeight: 500,
						color: C.textDefault,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{Math.round(value)}
				</div>
			</div>
		</div>
	);
};

/** `.schematic-layer-control`: Y heading, current, ceiling, vertical range (pink thumb), floor, count, 全部. */
export const WsLayerControl: React.FC<{top?: number; floor?: number}> = ({top = 1, floor = 0}) => {
	const total = top - floor + 1;
	return (
		<div
			style={{
				...GLASS,
				width: WSL.layerCtl.w,
				height: WSL.layerCtl.h,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 5.6,
			}}
		>
			<span style={{display: 'flex', alignItems: 'center', gap: 3.2, color: C.textTertiary, fontSize: 11.5, fontWeight: 700, lineHeight: '16px'}}>
				<Icon name="layers" size={16} color={C.brand} />Y
			</span>
			<div style={{width: 38, height: 16, borderRadius: 3.2, background: C.control, color: C.textPrimary, fontSize: 11.2, fontWeight: 700, lineHeight: '16px', textAlign: 'center'}}>{top}</div>
			<span style={{color: C.textTertiary, fontSize: 9.9, lineHeight: '12px'}}>{top}</span>
			<div style={{position: 'relative', flex: 1, width: 5.6, borderRadius: 999, background: C.textDefault}}>
				<div style={{position: 'absolute', left: -3.2, top: 0, width: 12, height: 12, borderRadius: 999, background: C.brand}} />
			</div>
			<span style={{color: C.textTertiary, fontSize: 9.9, lineHeight: '12px'}}>{floor}</span>
			<span style={{color: C.textTertiary, fontSize: 9.9, lineHeight: '12px'}}>
				{total}/{total}
			</span>
			<div style={{width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5}}>
				<Icon name="refresh-cw" size={16} color={C.textDefault} />
			</div>
		</div>
	);
};

/** `.schematic-canvas-controls`: 复位视角 · 切换相机投影 · 显示网格 · 显示区域边界 · 显示透明方块 · 切换全屏. */
export const WsCanvasControls: React.FC<{bounds?: boolean}> = ({bounds = true}) => (
	<div style={{...GLASS, width: WSL.canvasCtl.w, height: WSL.canvasCtl.h, display: 'flex', gap: 5.6}}>
		<CircleBtn icon="rotate-counter-clockwise" on />
		<CircleBtn icon="scan-eye" on={false} />
		<CircleBtn icon="grid" on />
		<CircleBtn icon="box" on={bounds} />
		<CircleBtn icon="eye" on />
		<CircleBtn icon="maximize" on={false} />
	</div>
);

/** `.schematic-walk-control`: [Move 只读漫游预览] quiet 2xs. */
export const WsWalkControl: React.FC = () => (
	<div style={{...GLASS, width: WSL.walk.w, height: WSL.walk.h, display: 'flex'}}>
		<Btn size="2xs" type="quiet" icon="move" label="只读漫游预览" />
	</div>
);

/** `.schematic-loading-status`: Spinner 16 + label (+ "n / N" during the mesh stage). Right-aligned to `WSL.loading`. */
export const WsLoadingStatus: React.FC<{label: string; count?: [number, number]; spin?: number}> = ({label, count, spin = 0}) => (
	<div style={{position: 'absolute', right: 0, top: 0, display: 'flex', justifyContent: 'flex-end'}}>
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 7.2,
				boxSizing: 'border-box',
				border: `1px solid ${C.divider}`,
				borderRadius: 12,
				padding: '7.2px 10.4px',
				background: 'rgba(235, 235, 235, 0.9)',
				color: C.textTertiary,
				fontSize: 12,
				lineHeight: '16px',
				whiteSpace: 'nowrap',
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			<div style={{transform: `rotate(${spin}deg)`, width: 16, height: 16}}>
				<Icon name="spinner" size={16} color={C.textTertiary} />
			</div>
			<span>{label}</span>
			{count ? (
				<span>
					{count[0]} / {count[1]}
				</span>
			) : null}
		</div>
	</div>
);

/** `.schematic-statusbar` text for a selection (or the tertiary bounds when nothing is selected). */
export const WsStatusBar: React.FC<{sel: WsSelection; bounds?: string}> = ({sel, bounds = '0, 0, 0 → 31, 1, 11'}) => (
	<div
		style={abs(WSL.status, {
			borderTop: `1px solid ${C.divider}`,
			padding: '0 10.4px',
			background: 'rgba(245, 245, 245, 0.9)',
			color: C.textPrimary,
			fontSize: 11.52,
			display: 'flex',
			alignItems: 'center',
			whiteSpace: 'nowrap',
		})}
	>
		{sel && sel.count > 0 && sel.pos ? (
			<span>
				<strong style={{fontWeight: 700}}>{sel.pos.join(', ')}</strong> · {sel.block ?? PINK_CONCRETE} · 已选 {sel.count} 个
			</span>
		) : (
			<span style={{color: C.textTertiary}}>{bounds}</span>
		)}
	</div>
);

const SectionHead: React.FC<{icon: IconName; label: string}> = ({icon, label}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 6.4, color: C.textPrimary, fontSize: 13.12, fontWeight: 700, lineHeight: '20px'}}>
		<Icon name={icon} size={16} color={C.textPrimary} />
		{label}
	</div>
);

const Grid2: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{display: 'grid', gridTemplateColumns: '154px 154px', gap: 8}}>{children}</div>
);

/** `aside.schematic-inspector` (编辑 tab). */
export const WsInspector: React.FC<{sel: WsSelection; anchorPending?: boolean; loading?: boolean; enable?: number}> = ({
	sel,
	anchorPending = false,
	loading = false,
	enable,
}) => {
	const has = !!sel && sel.count > 0;
	// `enable` lets a scene fade the buttons from disabled (.5) to enabled (1) when a selection lands.
	const on = enable ?? (has && !loading ? 1 : 0);
	const dis = (base: boolean) => (base ? {opacity: 0.5 + 0.5 * on} : {});
	const transformOn = loading ? 0.5 : 1;
	const sec: CSSProperties = {display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${C.divider}`, paddingTop: 12};
	return (
		<div style={abs(WSL.inspector, {background: C.surface2, padding: 12, display: 'flex', flexDirection: 'column', gap: 12})}>
			{/* Tabs 「编辑 · 材料」 */}
			<div
				style={{
					width: 316,
					height: 38,
					boxSizing: 'border-box',
					display: 'flex',
					alignItems: 'center',
					gap: 4,
					padding: 2,
					borderRadius: 12,
					border: `1px solid ${C.divider}`,
					boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
				}}
			>
				{(
					[
						['edit', '编辑', true],
						['list', '材料', false],
					] as Array<[IconName, string, boolean]>
				).map(([icon, label, active]) => (
					<div
						key={label}
						style={{
							flex: 1,
							height: '100%',
							boxSizing: 'border-box',
							borderRadius: 10,
							border: `1px solid ${active ? C.brand : 'transparent'}`,
							background: active ? '#eec2d6' : 'transparent',
							color: active ? C.brand : C.textDefault,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 8,
							fontSize: 14,
							fontWeight: 500,
						}}
					>
						<Icon name={icon} size={20} color={active ? C.brand : C.textTertiary} />
						{label}
					</div>
				))}
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{...sec, borderTop: 0, paddingTop: 0}}>
					<SectionHead icon="boxes" label="已选方块" />
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 12,
							border: `1px solid ${C.divider}`,
							borderRadius: 12,
							padding: '10.4px 12px',
							background: C.chrome,
							color: C.textPrimary,
							fontSize: 16,
							lineHeight: '20px',
						}}
					>
						<strong style={{fontWeight: 700}}>已选 {sel?.count ?? 0} 个</strong>
						{has ? <span style={{fontSize: 12, color: C.textTertiary}}>{sel?.block ?? PINK_CONCRETE}</span> : null}
					</div>
					{anchorPending ? <div style={{fontSize: 12, lineHeight: '16px', color: C.brand}}>请选择另一对角</div> : null}
					<Grid2>
						<div style={dis(true)}><OBtn icon="list" label="相同材料" width={154} /></div>
						<div style={dis(true)}><OBtn icon="layers" label="同一层" width={154} /></div>
						<div style={dis(true)}><OBtn icon="boxes" label="连通方块" width={154} /></div>
						<div style={dis(true)}><Btn size="md" type="quiet" icon="x" label="清除选择" width={154} justify="flex-start" /></div>
					</Grid2>
				</div>
				<div style={sec}>
					<SectionHead icon="eye" label="可见性" />
					<Grid2>
						<div style={dis(true)}><OBtn icon="eye-off" label="隐藏所选" width={154} /></div>
						<div style={dis(true)}><OBtn icon="scan-eye" label="仅显示所选" width={154} /></div>
						<div style={{opacity: 0.5}}><Btn size="md" type="quiet" icon="eye" label="全部显示" width={154} justify="flex-start" /></div>
						<div style={dis(true)}><Btn size="md" type="quiet" icon="copy" label="坐标" width={154} justify="flex-start" /></div>
					</Grid2>
				</div>
				<div style={sec}>
					<SectionHead icon="edit" label="编辑" />
					<Grid2>
						<div style={dis(true)}><Btn size="md" type="colored" icon="edit" label="替换所选" width={154} justify="flex-start" /></div>
						<div style={dis(true)}><Btn size="md" type="outlined" color="red" icon="trash" label="删除所选" width={154} justify="flex-start" /></div>
					</Grid2>
				</div>
				<div style={{...sec, opacity: transformOn}}>
					<SectionHead icon="rotate-clockwise" label="整体变换" />
					<Grid2>
						<OBtn icon="rotate-counter-clockwise" label="逆时针旋转" width={154} />
						<OBtn icon="rotate-clockwise" label="顺时针旋转" width={154} />
						<OBtn icon="arrow-left-right" label="沿 X 轴镜像" width={154} />
						<OBtn icon="arrow-up-down" label="沿 Z 轴镜像" width={154} />
					</Grid2>
				</div>
			</div>
		</div>
	);
};

/**
 * The voxel hero's pixel ▷ OUTLINE (white concrete, 1-block stroke): a proper outline triangle
 * 6 columns × 9 rows (5 : 4 diagonal steps, 12 pink cells inside) at columns 5–10 / rows 0–8 of the
 * 30 × 10 top layer — the real PlayIcon's columns, drawn tall enough to read as ▷ at any zoom.
 */
export const VOXEL_GLYPH = ['#.....', '##....', '#.##..', '#...#.', '#....#', '#...#.', '#.##..', '##....', '#.....'];
export const VOXEL_GLYPH_AT = {col: 5, row: 0};

/** Top-down pixel picture of the voxel hero (pink concrete + white-concrete ▷ outline) for flat windows. */
export const FlatVoxelHero: React.FC<{x: number; y: number; block?: number}> = ({x, y, block = 4.8}) => {
	const cells: React.ReactNode[] = [];
	VOXEL_GLYPH.forEach((row, r) =>
		[...row].forEach((ch, c) => {
			if (ch === '#')
				cells.push(<rect key={`${r}-${c}`} x={(VOXEL_GLYPH_AT.col + c) * block} y={(VOXEL_GLYPH_AT.row + r) * block} width={block} height={block} fill="#cfd5d6" />);
		}),
	);
	return (
		<svg width={30 * block} height={10 * block} style={{position: 'absolute', left: x, top: y}} shapeRendering="crispEdges">
			<rect x={0} y={0} width={30 * block} height={10 * block} fill="#d5658e" />
			{cells}
		</svg>
	);
};

export type WorkshopLoadedProps = {
	tool?: WsTool;
	spacing?: number | null;
	sel?: WsSelection;
	anchorPending?: boolean;
	/** Draw the glass overlays flat into the page (rest window). */
	overlays?: boolean;
	loading?: {label: string; count?: [number, number]; spin?: number} | null;
	bar?: number | null;
	/** Draw the pixel hero flat (rest window only — scenes mount the 3D voxel). */
	hero?: boolean;
	grid?: number;
	inspectorEnable?: number;
};

/** The whole loaded page in window coordinates (render inside the shell's content well). */
export const WorkshopLoaded: React.FC<WorkshopLoadedProps> = ({
	tool = 'select',
	spacing = null,
	sel = null,
	anchorPending = false,
	overlays = true,
	loading = null,
	bar = null,
	hero = false,
	grid = 1,
	inspectorEnable,
}) => (
	<>
		<WsToolbar />
		<WsViewportCanvas grid={grid} />
		{hero ? <FlatVoxelHero x={911 + 4.8} y={404} /> : null}
		{overlays ? (
			<>
				<div style={abs(WSL.modeBar)}>
					<WsModeToolbar tool={tool} />
				</div>
				{tool === 'layer-spacing' && spacing != null ? (
					<div style={abs(WSL.toolCtx)}>
						<WsToolContext value={spacing} />
					</div>
				) : null}
				<div style={abs(WSL.layerCtl)}>
					<WsLayerControl />
				</div>
				<div style={abs(WSL.canvasCtl)}>
					<WsCanvasControls bounds />
				</div>
				<div style={abs(WSL.walk)}>
					<WsWalkControl />
				</div>
				{loading ? (
					<div style={abs(WSL.loading)}>
						<WsLoadingStatus {...loading} />
					</div>
				) : null}
			</>
		) : null}
		<WsStatusBar sel={sel} />
		<WsInspector sel={sel} anchorPending={anchorPending} loading={!!loading} enable={inspectorEnable} />
		{bar != null ? <WsProgressBar pct={bar} /> : null}
	</>
);

/**
 * F6 in a calm rest state for the tower wides. Default 'empty' = what the
 * page shows before anything is opened (the M2 reveal); 'loaded' = the
 * workbench with the voxel hero drawn flat and selected (M6/M7 wides).
 */
export const WorkshopWindow: React.FC<{frame?: number; state?: 'empty' | 'loaded'}> = ({state = 'empty'}) => (
	<WorkshopShell>
		{state === 'empty' ? <WorkshopEmpty /> : <WorkshopLoaded tool="box" sel={{count: 600, pos: [31, 1, 1]}} hero />}
	</WorkshopShell>
);
