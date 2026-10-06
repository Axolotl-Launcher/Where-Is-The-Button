/**
 * The launcher shell (App.vue): title bar 48, nav rail 64, recessed content
 * well (#ebebeb, 20 px top-left radius, inset shadow + 1 px #ddd), right panel
 * 300 with the brand wash. Coordinates are CSS px of a 1440 × 810 window.
 * Every part is exported separately so a scene can lift parts onto different
 * depths of the 2.5D stage while keeping their exact window positions.
 */
import React, {CSSProperties} from 'react';
import {staticFile} from 'remotion';
import {TitlebarLogo} from '../../brand/AxolotlLogo';
import {C, FONT, SHADOW, SHELL} from '../../theme/tokens';
import {Icon} from '../Icon';
import {IconName} from '../icons.generated';

export type NavKey = 'home' | 'screenshots' | 'discover' | 'skins' | 'multiplayer' | 'library' | 'lab' | 'downloads';

export const NAV_ITEMS: Array<{key: NavKey; icon: IconName; label: string}> = [
	{key: 'home', icon: 'home', label: '主页'},
	{key: 'screenshots', icon: 'images', label: '截图中心'},
	{key: 'discover', icon: 'compass', label: '发现内容'},
	{key: 'skins', icon: 'change-skin', label: '皮肤选择器'},
	{key: 'multiplayer', icon: 'users', label: '多人游戏'},
	{key: 'library', icon: 'library', label: '实例库'},
	{key: 'lab', icon: 'flask-conical', label: '实验室'},
	{key: 'downloads', icon: 'download', label: '下载'},
];

/** Top y of nav item i in window coordinates. */
export const navY = (i: number) => SHELL.titleH + SHELL.navPitch * i;
export const navIndex = (k: NavKey) => NAV_ITEMS.findIndex((n) => n.key === k);

const abs = (x: number, y: number, w: number, h: number, extra?: CSSProperties): CSSProperties => ({
	position: 'absolute',
	left: x,
	top: y,
	width: w,
	height: h,
	boxSizing: 'border-box',
	...extra,
});

export const TrafficLights: React.FC = () => (
	<>
		{[C.macRed, C.macYellow, C.macGreen].map((c, i) => (
			<div
				key={c}
				style={abs(22 + 23 * i - 6.5, 22 - 6.5, 13, 13, {borderRadius: 99, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)'})}
			/>
		))}
	</>
);

export type RunningPill = {kind: 'idle'} | {kind: 'running'; name: string};

export const TitleBar: React.FC<{
	breadcrumb?: {icon?: IconName; iconImg?: string; text: string; sub?: string};
	pill?: RunningPill;
	width?: number;
}> = ({breadcrumb = {icon: 'home', text: '主页'}, pill = {kind: 'idle'}, width = SHELL.winW}) => (
	<div style={abs(0, 0, width, SHELL.titleH, {background: C.chrome})}>
		<TrafficLights />
		<div style={abs(80, 12, 90, 24)}>
			<TitlebarLogo />
		</div>
		{(['left-arrow', 'right-arrow'] as IconName[]).map((n, i) => (
			<div key={n} style={abs(176 + 28 * i, 12, 24, 24, {borderRadius: 99, background: C.control, display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
				<Icon name={n} size={16} color={C.textPrimary} />
			</div>
		))}
		<div style={abs(240, 12, 400, 26, {display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2, fontSize: 16, fontWeight: 600, color: C.textPrimary, whiteSpace: 'nowrap'})}>
			{breadcrumb.iconImg ? (
				<img src={staticFile(breadcrumb.iconImg)} style={{width: 20, height: 20, borderRadius: 6, imageRendering: 'pixelated'}} />
			) : breadcrumb.icon ? (
				<Icon name={breadcrumb.icon} size={20} color={C.textDefault} />
			) : null}
			<span>{breadcrumb.text}</span>
			{breadcrumb.sub ? (
				<>
					<Icon name="chevron-right" size={16} color={C.textTertiary} />
					<span>{breadcrumb.sub}</span>
				</>
			) : null}
		</div>
		<div style={{position: 'absolute', right: 12, top: 7, height: 34, display: 'flex', alignItems: 'center', gap: 8}}>
			<div style={{width: 36, height: 36, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="newspaper" size={20} color={C.textDefault} />
			</div>
			<div
				style={{
					height: 34,
					borderRadius: 12,
					border: `1px solid ${C.divider}`,
					padding: '0 12px',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontSize: 14,
					color: pill.kind === 'idle' ? C.textTertiary : C.textPrimary,
					boxSizing: 'border-box',
					whiteSpace: 'nowrap',
				}}
			>
				{pill.kind === 'idle' ? (
					<>
						<div style={{width: 8, height: 8, borderRadius: 99, background: C.textTertiary}} />
						<span>没有运行中的实例</span>
					</>
				) : (
					<>
						<div style={{width: 14, height: 14, borderRadius: 99, background: 'rgba(0,175,92,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<div style={{width: 7, height: 7, borderRadius: 99, background: C.green}} />
						</div>
						<span style={{fontWeight: 500}}>{pill.name}</span>
						<Icon name="stop-circle" size={20} color={C.red} />
						<Icon name="terminal-square" size={20} color={C.textTertiary} />
					</>
				)}
			</div>
		</div>
	</div>
);

export const NavRail: React.FC<{
	active?: NavKey | null;
	/** Explicit slider edges (window y) for the inchworm gait; defaults to the active item. */
	slider?: {top: number; bottom: number; tone?: 'pink' | 'white'; opacity?: number} | null;
	quick?: string[];
	quickActive?: number;
	height?: number;
	hoverKey?: NavKey | null;
}> = ({active = 'home', slider, quick = ['images/instance-icons/Fabric.png', 'images/instance-icons/grass-block.png', 'images/instance-icons/anvil.png'], quickActive = -1, height = SHELL.winH, hoverKey}) => {
	const ai = active ? navIndex(active) : -1;
	const sl = slider === null ? null : slider ?? (ai >= 0 ? {top: navY(ai), bottom: navY(ai) + 48, tone: 'pink' as const} : null);
	const plusY = height - 8 - 48 - 56;
	const setY = height - 8 - 48;
	return (
		<div style={abs(0, SHELL.titleH, SHELL.railW, height - SHELL.titleH, {background: C.chrome})}>
			<div style={{position: 'absolute', left: 0, top: -SHELL.titleH, width: SHELL.railW, height}}>
				{sl ? (
					<div
						style={abs(8, sl.top, 48, Math.max(0, sl.bottom - sl.top), {
							borderRadius: 24,
							background: sl.tone === 'white' ? C.control : C.brand,
							opacity: sl.opacity ?? 1,
						})}
					/>
				) : null}
				{NAV_ITEMS.map((n, i) => {
					const on = sl && sl.tone !== 'white' && sl.top <= navY(i) + 6 && sl.bottom >= navY(i) + 42;
					return (
						<div key={n.key} style={abs(8, navY(i), 48, 48, {display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: hoverKey === n.key && !on ? C.control : undefined})}>
							<Icon
								name={n.icon}
								size={24}
								color={on ? '#fff' : hoverKey === n.key ? C.textPrimary : C.textDefault}
								style={on ? {filter: 'drop-shadow(0 0 0.5rem rgba(0,0,0,0.35))'} : undefined}
							/>
						</div>
					);
				})}
				<div style={abs(20, navY(8) + 8, 24, 1, {background: C.divider})} />
				{quick.map((src, i) => (
					<div
						key={src + i}
						style={abs(8, navY(8) + 17 + 56 * i, 48, 48, {
							borderRadius: 24,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: quickActive === i ? C.brand : undefined,
						})}
					>
						<img src={staticFile(src)} style={{width: 28, height: 28, objectFit: 'contain', imageRendering: 'pixelated'}} />
					</div>
				))}
				<div style={abs(8, plusY, 48, 48, {display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
					<Icon name="plus" size={24} color={C.textDefault} />
				</div>
				<div style={abs(8, setY, 48, 48, {display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
					<Icon name="settings" size={24} color={C.textDefault} />
				</div>
			</div>
		</div>
	);
};

/** The recessed content well (+ its inset shadow/stroke overlay). Children use window coordinates. */
export const ContentWell: React.FC<{right?: number; height?: number; children?: React.ReactNode; overlay?: boolean}> = ({right = SHELL.panelW, height = SHELL.winH, children, overlay = true}) => {
	const w = SHELL.winW - SHELL.railW - right;
	return (
		<div style={abs(SHELL.railW, SHELL.titleH, w, height - SHELL.titleH, {background: C.well, borderTopLeftRadius: SHELL.wellRadius, overflow: 'hidden'})}>
			{/* children are laid out in WINDOW coordinates, clipped to the well */}
			<div style={{position: 'absolute', left: -SHELL.railW, top: -SHELL.titleH, width: SHELL.winW, height}}>{children}</div>
			{overlay ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderTopLeftRadius: SHELL.wellRadius,
						boxShadow: `${SHADOW.wellInset}, inset 1px 1px 0 ${C.divider}`,
						pointerEvents: 'none',
					}}
				/>
			) : null}
		</div>
	);
};

/** Pixel face of a 64×64 skin (head front 8×8 + hat layer). */
export const SkinFace: React.FC<{size: number; src?: string}> = ({size, src = 'images/skins/steve.png'}) => {
	const k = size / 8;
	const layer = (sx: number): CSSProperties => ({
		position: 'absolute',
		inset: 0,
		backgroundImage: `url(${staticFile(src)})`,
		backgroundSize: `${64 * k}px ${64 * k}px`,
		backgroundPosition: `${-sx * k}px ${-8 * k}px`,
		imageRendering: 'pixelated',
	});
	return (
		<div style={{position: 'relative', width: size, height: size, borderRadius: 4, overflow: 'hidden'}}>
			<div style={layer(8)} />
			<div style={layer(40)} />
		</div>
	);
};

export const RightPanel: React.FC<{height?: number; children?: React.ReactNode; playerName?: string}> = ({height = SHELL.winH, children, playerName = 'Mystic_Stars'}) => (
	<div
		style={abs(SHELL.winW - SHELL.panelW, SHELL.titleH, SHELL.panelW, height - SHELL.titleH, {
			background: `linear-gradient(0deg, ${C.panelBottom}, ${C.panelTop})`,
			borderLeft: `1px solid ${C.brandBorder16}`,
			boxShadow: 'inset 15px 0 15px -15px rgba(0,0,0,0.1)',
		})}
	>
		<div style={{position: 'absolute', left: 20, top: 22, fontSize: 16, fontWeight: 500, color: C.textPrimary}}>当前游玩账号：</div>
		<div
			style={abs(20, 56, 260, 60, {
				borderRadius: 12,
				border: `1px solid ${C.divider}`,
				background: 'rgba(255,255,255,0.5)',
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				padding: '0 12px',
			})}
		>
			<SkinFace size={36} />
			<div style={{display: 'flex', flexDirection: 'column', gap: 2, flex: 1}}>
				<div style={{fontSize: 16, fontWeight: 600, color: C.textPrimary}}>{playerName}</div>
				<div style={{fontSize: 13, color: C.textTertiary}}>Minecraft 账户</div>
			</div>
			<Icon name="chevron-down" size={20} color={C.textDefault} />
		</div>
		<div style={abs(-15, (height - SHELL.titleH) / 2 - 20, 15, 40, {background: '#e9d3dd', borderRadius: '12px 0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
			<Icon name="chevron-right" size={10} color={C.textTertiary} />
		</div>
		{children}
	</div>
);

/** Complete flat window (for top-down shots); `children` render inside the well. */
export const AppWindow: React.FC<{
	nav?: NavKey | null;
	navSlider?: {top: number; bottom: number; tone?: 'pink' | 'white'; opacity?: number} | null;
	breadcrumb?: {icon?: IconName; iconImg?: string; text: string; sub?: string};
	pill?: RunningPill;
	panel?: boolean;
	panelChildren?: React.ReactNode;
	children?: React.ReactNode;
	quickActive?: number;
	hoverNav?: NavKey | null;
	style?: CSSProperties;
	frame?: boolean;
}> = ({nav = 'home', navSlider, breadcrumb, pill, panel = true, panelChildren, children, quickActive, hoverNav, style, frame = true}) => (
	<div
		style={{
			position: 'relative',
			width: SHELL.winW,
			height: SHELL.winH,
			borderRadius: frame ? SHELL.windowRadius : 0,
			overflow: 'hidden',
			background: C.chrome,
			boxShadow: frame ? '0 0 0 1px rgba(0,0,0,0.08)' : undefined,
			fontFamily: FONT.ui,
			color: C.textPrimary,
			...style,
		}}
	>
		<TitleBar breadcrumb={breadcrumb} pill={pill} />
		<NavRail active={nav} slider={navSlider} quickActive={quickActive} hoverKey={hoverNav} />
		<ContentWell right={panel ? SHELL.panelW : 0}>{children}</ContentWell>
		{panel ? <RightPanel>{panelChildren}</RightPanel> : <CollapsedPanelHandle />}
	</div>
);

/** With the right panel collapsed its 15 × 40 handle hangs on the window's right edge. */
export const CollapsedPanelHandle: React.FC<{height?: number}> = ({height = SHELL.winH}) => (
	<div
		style={abs(SHELL.winW - 15, SHELL.titleH + (height - SHELL.titleH) / 2 - 20, 15, 40, {
			background: '#e9d3dd',
			borderRadius: '12px 0 0 12px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		})}
	>
		<Icon name="chevron-left" size={10} color={C.textTertiary} />
	</div>
);
