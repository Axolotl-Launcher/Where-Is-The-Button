/**
 * 实例页 · 内容 tab for 「Vanilla Perfected」 (pages/instance/Index.vue +
 * packages/ui content-tab layout), light + pink, right panel collapsed, in a
 * 1440 × 810 window. Every position is a WINDOW coordinate (pane + (64, 48));
 * bible §4.4, report 05 §4–§5, mock research/_scratch/05-mock-instance-page.png.
 *
 * Vertical rhythm: header icon y 72–136 · divider 152 · NavTabs 169–215 ·
 * toolbar 231–271 · chips 287–319 · table 335 (header 336–384, 74 px rows
 * from 384). The twin 「▷ 开始游戏」 sits at x 1226–1352, y 72–120; every
 * row's toggle at x 1279–1327, y rowTop + 26 … + 50.
 */
import React, {CSSProperties} from 'react';
import {staticFile} from 'remotion';
import {ButtonFace} from '../../characters/LaunchButton';
import {C, SHADOW} from '../../theme/tokens';
import {Icon} from '../Icon';
import {IconName} from '../icons.generated';
import {Btn, SearchField, Tooltip} from '../kit';
import {AppWindow, navY} from '../shell/AppWindow';
import {MOD_ICONS, ModIcon, ModId} from '../ModIcon';

/** Layout constants (window coordinates) shared with the M4 scene. */
export const INST = {
	icon: {x: 88, y: 72, s: 64},
	title: {x: 168, y: 76},
	twin: {x: 1226, y: 72, w: 126, h: 48},
	gear: {x: 1360, y: 72, s: 48},
	tabs: {x: 88, y: 169, tabW: 88},
	toolbar: {x: 88, y: 231, w: 1328, h: 40},
	chips: {x: 88, y: 287},
	table: {x: 88, y: 335, w: 1328},
	headerH: 48,
	rowH: 74,
	/** y of row i's 1 px top border. */
	rowTop: (i: number) => 384 + 74 * i,
	/** Toggle box of row i (48 × 24). */
	toggle: (i: number) => ({x: 1279, y: 384 + 74 * i + 26, w: 48, h: 24, cx: 1303, cy: 384 + 74 * i + 38}),
	/** 48 px project icon of row i. */
	rowIcon: (i: number) => ({x: 137, y: 384 + 74 * i + 14, s: 48, cx: 161, cy: 384 + 74 * i + 38}),
	/** Index of the freshly installed Litematica row. */
	liteRow: 4,
} as const;

/** The instance's nav state: Library slider WHITE (sub-page), quick circle #1 pink. */
export const INSTANCE_SLIDER = {top: navY(5), bottom: navY(5) + 48, tone: 'white' as const};
export const INSTANCE_CRUMB = {iconImg: 'images/instance-icons/Fabric.png', text: 'Vanilla Perfected', sub: '内容'};

export type LiteState = {
	/** 1 = installing (row at 50 %, spinner on the icon), 0 = installed. */
	installing?: number;
	spin?: number;
	/** 「安装中……」 tooltip over the icon (0..1). */
	tooltip?: number;
	/** Toggle present (appears when the install finishes). */
	toggle?: boolean;
	/** Toggle on amount 0..1 (200 ms product transition). */
	on?: number;
	/** Knob hover (cursor over the toggle) 0..1. */
	knobHover?: number;
	/** Disabled look of columns A/B: grayscale + 50 % (0..1). */
	off?: number;
};

export type InstanceContentProps = {
	twinHover?: number;
	twinPress?: number;
	lite?: LiteState | null;
	/** Status-tab counts (已启用 / 已禁用). */
	enabled?: number;
	disabled?: number;
	style?: CSSProperties;
};

// ── small product primitives ────────────────────────────────────────────────

const abs = (x: number, y: number, w?: number, h?: number, extra?: CSSProperties): CSSProperties => ({
	position: 'absolute',
	left: x,
	top: y,
	width: w,
	height: h,
	boxSizing: 'border-box',
	...extra,
});

/** Avatar.vue fallback (no image): the grey isometric cube outline, r = 16/96 · size. */
export const AvatarCube: React.FC<{size: number; style?: CSSProperties}> = ({size, style}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: (16 / 96) * size,
			border: `1px solid ${C.divider}`,
			background: C.control,
			boxSizing: 'border-box',
			flexShrink: 0,
			overflow: 'hidden',
			...style,
		}}
	>
		<svg width="100%" height="100%" viewBox="0 0 104 104" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
			<path stroke="#9a9a9a" strokeWidth={5} d="M51.7 92.5V51.7L16.4 31.3l35.3 20.4L87 31.3 51.7 11 16.4 31.3v40.8l35.3 20.4L87 72V31.3L51.7 11" />
		</svg>
	</div>
);

/** Checkbox.vue (unchecked): 20 × 20, r 6, 1 px #ddd, #f5f5f5, soft shadow. */
const Checkbox: React.FC = () => (
	<div
		style={{
			width: 20,
			height: 20,
			borderRadius: 6,
			border: `1px solid ${C.divider}`,
			background: C.surface2,
			boxShadow: '1px 1px 2px rgba(0,0,0,0.08)',
			boxSizing: 'border-box',
			flexShrink: 0,
		}}
	/>
);

/** Toggle.vue (48 × 24): 200 ms transition of track colour and knob; hover knob 18, press 14. */
export const ContentToggle: React.FC<{on: number; hover?: number; press?: number; style?: CSSProperties}> = ({on, hover = 0, press = 0, style}) => {
	const t = Math.max(0, Math.min(1, on));
	const knob = 16 + 2 * hover - 4 * press;
	const mix = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
	return (
		<div
			style={{
				position: 'relative',
				width: 48,
				height: 24,
				borderRadius: 9999,
				background: mix([255, 255, 255], [219, 39, 119]),
				boxShadow: t < 1 ? `inset 0 0 0 1px rgba(221,221,221,${1 - t})` : undefined,
				flexShrink: 0,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 12 - knob / 2,
					left: 12 + 24 * t - knob / 2,
					width: knob,
					height: knob,
					borderRadius: 9999,
					background: t > 0 ? `rgba(${Math.round(89 * (1 - t))}, ${Math.round(91 * (1 - t))}, ${Math.round(97 * (1 - t))}, ${1 - 0.1 * t})` : C.gray,
				}}
			/>
		</div>
	);
};

/** NavTabs with icons (NavTabs.vue: p-1, tabs px-4 py-2 gap-2, 20 px icons, 14/700). */
const InstanceTabs: React.FC<{active?: number}> = ({active = 0}) => {
	const tabs: Array<{label: string; icon: IconName}> = [
		{label: '内容', icon: 'boxes'},
		{label: '文件', icon: 'folder-open'},
		{label: '截图', icon: 'image'},
		{label: '世界', icon: 'globe'},
		{label: '日志', icon: 'terminal-square'},
	];
	const W = INST.tabs.tabW;
	return (
		<div
			style={abs(INST.tabs.x, INST.tabs.y, W * tabs.length + 10, 46, {
				borderRadius: 9999,
				background: C.chrome,
				border: `1px solid ${C.control}`,
				boxShadow: SHADOW.xl,
				padding: 4,
				display: 'flex',
			})}
		>
			<div style={abs(4 + W * active, 4, W, 36, {borderRadius: 9999, background: C.brand})} />
			{tabs.map((t, i) => {
				const on = i === active;
				return (
					<div
						key={t.label}
						style={{
							position: 'relative',
							width: W,
							height: 36,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 8,
							fontSize: 14,
							fontWeight: 700,
							lineHeight: '20px',
							color: on ? '#fff' : C.textPrimary,
							whiteSpace: 'nowrap',
						}}
					>
						<Icon name={t.icon} size={20} color={on ? '#fff' : C.textTertiary} />
						{t.label}
					</div>
				);
			})}
		</div>
	);
};

const Chip: React.FC<{label: string; count: number; on?: boolean}> = ({label, count, on}) => (
	<div
		style={{
			height: 32,
			padding: '0 12px',
			borderRadius: 9999,
			background: on ? C.brandTint : C.control,
			color: on ? C.brand : C.textDefault,
			fontSize: 16,
			fontWeight: 600,
			lineHeight: '20px',
			display: 'flex',
			alignItems: 'center',
			whiteSpace: 'nowrap',
			boxSizing: 'border-box',
		}}
	>
		{label}
		<span style={{marginLeft: 4, fontSize: 14, fontWeight: 400, opacity: 0.7}}>{count}</span>
	</div>
);

const StatusTab: React.FC<{label: string; count?: number; on?: boolean}> = ({label, count, on}) => (
	<div style={{position: 'relative', paddingBottom: 4, paddingTop: 4, fontSize: 16, fontWeight: 600, lineHeight: '20px', color: on ? C.brand : C.textTertiary, whiteSpace: 'nowrap'}}>
		{label}
		{count != null ? <span style={{marginLeft: 4, fontSize: 14, fontWeight: 400, opacity: 0.7}}>{count}</span> : null}
		{on ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, borderRadius: 9999, background: C.brand}} /> : null}
	</div>
);

const QuietIcon: React.FC<{name: IconName; color?: string; w?: number}> = ({name, color = C.textDefault, w = 36}) => (
	<div style={{width: w, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
		<Icon name={name} size={20} color={color} />
	</div>
);

// ── rows ────────────────────────────────────────────────────────────────────

type RowData = {
	title: string;
	badge?: string;
	owner?: string;
	version: string;
	date: string;
	file: string;
	update?: boolean;
	enabled?: boolean;
	schematic?: boolean;
	mod?: ModId;
};

export const INSTANCE_ROWS: RowData[] = [
	{title: 'Sodium', mod: 'sodium', owner: 'CaffeineMC', version: 'mc1.21.x-0.6.13-fabric', date: '3个月前', file: 'sodium-fabric-0.6.13+mc1.21.x.jar', update: true, enabled: true},
	{title: 'Lithium', mod: 'lithium', owner: 'CaffeineMC', version: 'mc1.21.x-0.15.0', date: '3个月前', file: 'lithium-fabric-0.15.0+mc1.21.x.jar', enabled: true},
	{title: 'Iris Shaders', mod: 'iris', owner: 'coderbot', version: '1.8.8+1.21.x-fabric', date: '3个月前', file: 'iris-fabric-1.8.8+mc1.21.x.jar', enabled: false},
	{title: 'Fabric API', mod: 'fabric-api', badge: '前置', owner: 'modmuss50', version: '0.128.1+26.2', date: '3个月前', file: 'fabric-api-0.128.1+26.2.jar', update: true, enabled: true},
	{title: 'Litematica', mod: 'litematica', owner: 'maruohon', version: '0.24.0', date: '2周前', file: 'litematica-fabric-26.2-0.24.0.jar', enabled: true},
	{title: 'starter_house', version: '未知', date: '3个月前', file: 'starter_house.litematic', schematic: true},
];

const Row: React.FC<{i: number; d: RowData; lite?: LiteState | null}> = ({i, d, lite}) => {
	const y0 = INST.rowTop(i);
	const isLite = d.title === 'Litematica';
	const installing = isLite && lite ? lite.installing ?? 0 : 0;
	const offAmt = isLite && lite ? lite.off ?? 0 : d.enabled === false ? 1 : 0;
	const dim: CSSProperties = offAmt > 0 ? {filter: `grayscale(${offAmt})`, opacity: 1 - 0.5 * offAmt} : {};
	const rowOpacity = installing > 0.5 ? 0.5 : 1;
	const tg = INST.toggle(i);
	const showToggle = d.schematic ? false : isLite ? !!lite?.toggle : true;
	const on = isLite ? lite?.on ?? 1 : d.enabled ? 1 : 0;
	const midY = 38; // row-local vertical centre
	return (
		<div
			style={abs(0, y0 - INST.table.y - 1, INST.table.w - 2, INST.rowH, {
				background: i % 2 === 0 ? C.surface2 : C.rowOdd,
				borderTop: `1px solid ${C.control}`,
			})}
		>
			<div style={{position: 'absolute', inset: 0, top: -1, opacity: rowOpacity}}>
				{/* col A */}
				<div style={abs(12, midY - 10, 20, 20)}>
					<Checkbox />
				</div>
				<div style={{position: 'absolute', left: 48, top: 14, display: 'flex', alignItems: 'center', gap: 12, ...dim}}>
					<div style={{position: 'relative', width: 48, height: 48}}>
						{MOD_ICONS && d.mod ? <ModIcon id={d.mod} size={48} /> : <AvatarCube size={48} />}
						{installing > 0.5 ? (
							<div style={{position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{transform: `rotate(${lite?.spin ?? 0}deg)`, width: 20, height: 20}}>
									<Icon name="spinner" size={20} color="#fff" />
								</div>
							</div>
						) : null}
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 2, height: d.owner ? 50 : 24, justifyContent: 'center'}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 4, height: 24}}>
							<span style={{fontSize: 16, fontWeight: 600, lineHeight: '24px', color: C.textPrimary, whiteSpace: 'nowrap'}}>{d.title}</span>
							{d.badge ? (
								<span style={{borderRadius: 6, background: C.chrome, padding: '2px 6px', fontSize: 12, fontWeight: 500, lineHeight: '16px', color: C.textTertiary}}>{d.badge}</span>
							) : null}
						</div>
						{d.owner ? (
							<div style={{display: 'flex', alignItems: 'center', gap: 4, height: 24}}>
								<AvatarCube size={24} />
								<span style={{fontSize: 14, lineHeight: '20px', color: C.textTertiary, whiteSpace: 'nowrap'}}>{d.owner}</span>
							</div>
						) : null}
					</div>
				</div>
				{/* col B */}
				<div style={{position: 'absolute', left: 614, top: 12, width: 500, display: 'flex', flexDirection: 'column', gap: 2, ...dim}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 6, height: 24, fontSize: 16, fontWeight: 500, color: C.textPrimary, whiteSpace: 'nowrap'}}>
						{d.version}
						<Icon name="clock" size={16} color={C.textTertiary} />
						<span style={{fontSize: 14, fontWeight: 400, color: C.textTertiary}}>{d.date}</span>
					</div>
					<div style={{height: 24, fontSize: 16, lineHeight: '24px', color: C.textTertiary, whiteSpace: 'nowrap'}}>{d.file}</div>
				</div>
			</div>
			{/* col C (right-aligned, gap 8): [update/switch 32] [✎ 36] [toggle 48] [🗑 36] [⋮ 24] — integer positions */}
			<div style={{position: 'absolute', inset: 0, top: -1, opacity: rowOpacity}}>
				{d.schematic ? (
					<>
						<div style={abs(1251 - 89, midY - 18)}>
							<QuietIcon name="arrow-left-right" w={32} color={C.textDefault} />
						</div>
						<div style={abs(1291 - 89, midY - 18)}>
							<QuietIcon name="pencil" color={C.textDefault} />
						</div>
					</>
				) : (
					<div style={abs(1239 - 89, midY - 18)}>
						<QuietIcon name={d.update ? 'download' : 'arrow-left-right'} w={32} color={d.update ? C.green : C.textDefault} />
					</div>
				)}
				{showToggle ? (
					<div style={abs(tg.x - 89, 26)}>
						<ContentToggle on={on} hover={isLite ? lite?.knobHover ?? 0 : 0} />
					</div>
				) : null}
				<div style={abs(1335 - 89, midY - 18)}>
					<QuietIcon name="trash" color={C.textTertiary} />
				</div>
				<div style={abs(1379 - 89, midY - 18)}>
					<QuietIcon name="more-vertical" w={24} color={C.textDefault} />
				</div>
			</div>
		</div>
	);
};

// ── page ────────────────────────────────────────────────────────────────────

/** The page content (inside the content well), laid out in window coordinates. */
export const InstanceContent: React.FC<InstanceContentProps> = ({twinHover = 0, twinPress = 0, lite = null, enabled = 86, disabled = 1, style}) => {
	const rows = lite === null ? INSTANCE_ROWS.filter((r) => r.title !== 'Litematica') : INSTANCE_ROWS;
	const tableH = INST.headerH + INST.rowH * rows.length + 2;
	return (
		<div style={{position: 'absolute', inset: 0, ...style}}>
			{/* header */}
			<img
				src={staticFile('images/instance-icons/Fabric.png')}
				style={abs(INST.icon.x, INST.icon.y, 64, 64, {objectFit: 'contain', imageRendering: 'pixelated'})}
			/>
			<div style={abs(INST.title.x, INST.title.y, 700, 24, {fontSize: 24, fontWeight: 600, lineHeight: '24px', color: C.textPrimary, whiteSpace: 'nowrap'})}>
				Vanilla Perfected
			</div>
			<div style={abs(INST.title.x, 108, 700, 24, {display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 500, color: C.textDefault, whiteSpace: 'nowrap'})}>
				<div style={{display: 'flex', alignItems: 'center', gap: 6}}>
					<Icon name="box" size={16} color={C.textDefault} />
					26.2
				</div>
				<div style={{width: 6, height: 6, borderRadius: 9999, background: C.divider}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 6}}>
					<img src={staticFile('images/instance/fabric-loader.svg')} style={{width: 16, height: 16, opacity: 0.86}} />
					Fabric 0.17.2
				</div>
			</div>
			<div style={abs(INST.twin.x, INST.twin.y)}>
				<ButtonFace w={INST.twin.w} hover={twinHover} press={twinPress} />
			</div>
			<div style={abs(INST.gear.x, INST.gear.y)}>
				<Btn size="xl" type="base" circular iconOnly icon="settings" />
			</div>
			<div style={abs(1416, 88, 16, 16)}>
				<Icon name="more-vertical" size={16} color={C.textDefault} />
			</div>
			<div style={abs(88, 152, 1344, 1, {background: C.divider})} />
			<InstanceTabs />
			{/* toolbar: search · 浏览内容 · 查看依赖关系 · 刷新 */}
			<div style={abs(INST.toolbar.x, INST.toolbar.y, INST.toolbar.w, 40, {display: 'flex', gap: 8})}>
				<SearchField w={962} h={40} placeholder="搜索到 87个项目……" />
				<Btn size="md" type="colored" icon="compass" label="浏览内容" style={{height: 40, gap: 8}} />
				<Btn
					size="md"
					type="outlined"
					iconNode={<Icon name="git-graph" size={20} color={C.textDefault} />}
					label="查看依赖关系"
					style={{height: 40, gap: 8, border: `1px solid ${C.divider}`, color: C.textPrimary}}
				/>
				<Btn
					size="md"
					type="outlined"
					iconNode={<Icon name="refresh-cw" size={20} color={C.textDefault} />}
					label="刷新"
					style={{height: 40, gap: 8, border: `1px solid ${C.divider}`, color: C.textPrimary}}
				/>
			</div>
			{/* type chips */}
			<div style={abs(INST.chips.x, INST.chips.y, 900, 32, {display: 'flex', gap: 6})}>
				<Chip label="全部" count={87} on />
				<Chip label="模组" count={79} />
				<Chip label="资源包" count={5} />
				<Chip label="光影包" count={2} />
				<Chip label="投影" count={1} />
			</div>
			{/* table */}
			<div
				style={abs(INST.table.x, INST.table.y, INST.table.w, tableH, {
					borderRadius: 20,
					border: `1px solid ${C.control}`,
					boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
					overflow: 'hidden',
				})}
			>
				<div style={abs(0, 0, INST.table.w - 2, INST.headerH, {background: C.chrome, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'})}>
					<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
						<Checkbox />
						<StatusTab label="全部" on />
						<StatusTab label="可更新" count={2} />
						<StatusTab label="已启用" count={enabled} />
						<StatusTab label="已禁用" count={disabled} />
						<QuietIcon name="filter" />
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
						<QuietIcon name="arrow-down-a-z" />
						<QuietIcon name="pin" />
						<QuietIcon name="download" color={C.green} />
					</div>
				</div>
				{rows.map((d, k) => (
					<Row key={d.title} i={k} d={d} lite={d.title === 'Litematica' ? lite : null} />
				))}
			</div>
			{lite && (lite.tooltip ?? 0) > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: INST.rowIcon(INST.liteRow).cx,
						top: INST.rowIcon(INST.liteRow).y - 12,
						transform: 'translate(-50%, -100%)',
						opacity: lite.tooltip,
					}}
				>
					<Tooltip text="安装中……" side="top" />
				</div>
			) : null}
		</div>
	);
};

/** Rest window of floor F3 (tower wides): nav 实例库 white + quick circle pink, Litematica installed and switched off. */
export const InstanceWindow: React.FC<{frame?: number; lite?: 'none' | 'on' | 'off'}> = ({lite = 'off'}) => (
	<AppWindow nav={null} navSlider={INSTANCE_SLIDER} quickActive={0} breadcrumb={INSTANCE_CRUMB} panel={false} frame={false}>
		<InstanceContent
			lite={lite === 'none' ? null : {installing: 0, toggle: true, on: lite === 'on' ? 1 : 0, off: lite === 'on' ? 0 : 1}}
			enabled={lite === 'off' ? 85 : 86}
			disabled={lite === 'off' ? 2 : 1}
		/>
	</AppWindow>
);

