/**
 * Shell variants for Discover (copied from src/ui/shell/AppWindow.tsx and
 * extended, the shared file stays untouched):
 *  - NavRailX: pink→white slider tone (sub-page active), 下载 count badge,
 *    quick-instance circle turning pink.
 *  - BrowsePanel: the right sidebar as it is on /browse — forced open, no
 *    toggle handle, no account block (the teleported filter panel replaces
 *    the default content), filters inside.
 */
import React, {CSSProperties} from 'react';
import {staticFile} from 'remotion';
import {C, SHELL} from '../../../theme/tokens';
import {Icon} from '../../Icon';
import {NAV_ITEMS, navY} from '../../shell/AppWindow';
import {mixColor} from '../../../stage/Stage';
import {MiniToggle} from './parts';
import {Btn} from '../../kit';

const abs = (x: number, y: number, w: number, h: number, extra?: CSSProperties): CSSProperties => ({
	position: 'absolute',
	left: x,
	top: y,
	width: w,
	height: h,
	boxSizing: 'border-box',
	...extra,
});

export type NavRailXProps = {
	/** Slider edges (window y) and tone 0 = pink, 1 = white (sub-page). */
	slider: {top: number; bottom: number; white?: number};
	/** 下载 badge: scale 0..1 (pop), count. */
	badge?: {s: number; count: number};
	/** Quick-instance circle #1 pink amount. */
	quickPink?: number;
	height?: number;
};

export const NavRailX: React.FC<NavRailXProps> = ({slider, badge, quickPink = 0, height = SHELL.winH}) => {
	const white = slider.white ?? 0;
	const slColor = white <= 0 ? C.brand : white >= 1 ? C.control : mixColor(C.brand, C.control, white);
	const plusY = height - 8 - 48 - 56;
	const setY = height - 8 - 48;
	const quick = ['images/instance-icons/Fabric.png', 'images/instance-icons/grass-block.png', 'images/instance-icons/anvil.png'];
	return (
		<div style={abs(0, SHELL.titleH, SHELL.railW, height - SHELL.titleH, {background: C.chrome})}>
			<div style={{position: 'absolute', left: 0, top: -SHELL.titleH, width: SHELL.railW, height}}>
				<div style={abs(8, slider.top, 48, Math.max(0, slider.bottom - slider.top), {borderRadius: 24, background: slColor})} />
				{NAV_ITEMS.map((n, i) => {
					const on = slider.top <= navY(i) + 6 && slider.bottom >= navY(i) + 42;
					const iconCol = on ? (white > 0.5 ? C.textPrimary : '#fff') : C.textDefault;
					return (
						<div key={n.key} style={abs(8, navY(i), 48, 48, {display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24})}>
							<Icon name={n.icon} size={24} color={iconCol} style={on && white < 0.5 ? {filter: 'drop-shadow(0 0 0.5rem rgba(0,0,0,0.35))'} : undefined} />
						</div>
					);
				})}
				{badge && badge.s > 0.001 ? (
					<div
						style={abs(40, navY(7), 16, 16, {
							borderRadius: 99,
							background: C.brand,
							color: '#fff',
							fontSize: 10,
							fontWeight: 700,
							lineHeight: '16px',
							textAlign: 'center',
							transform: `scale(${badge.s})`,
							transformOrigin: '50% 50%',
						})}
					>
						{badge.count}
					</div>
				) : null}
				<div style={abs(20, navY(8) + 8, 24, 1, {background: C.divider})} />
				{quick.map((src, i) => (
					<div
						key={src}
						style={abs(8, navY(8) + 17 + 56 * i, 48, 48, {
							borderRadius: 24,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: i === 0 && quickPink > 0 ? `rgba(219, 39, 119, ${quickPink})` : undefined,
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

const BR16 = C.brandBorder16;

/** Locked filter section box (2 px dashed brand-16 %, r 16). */
const LockedBox: React.FC<{y: number; title: string; unlock?: boolean}> = ({y, title, unlock}) => (
	<div
		style={abs(8, y, 280, unlock ? 136 : 92, {
			border: `2px dashed ${BR16}`,
			borderRadius: 16,
			padding: 12,
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
		})}
	>
		<div style={{fontSize: 16, fontWeight: 700, lineHeight: '20px', color: C.textPrimary}}>{title}</div>
		<div style={{fontSize: 14, lineHeight: 1.3, color: C.textTertiary}}>解锁这个筛选项可能导致安装不兼容的内容。</div>
		{unlock ? (
			<div>
				<Btn size="md" type="base" icon="lock-open" label="解锁筛选" style={{background: 'rgba(255,255,255,0.5)', gap: 8}} />
			</div>
		) : null}
	</div>
);

const SectionHead: React.FC<{y: number; title: string}> = ({y, title}) => (
	<div style={abs(0, y, 300, 44, {padding: '0 12px', display: 'flex', alignItems: 'center', color: C.textPrimary})}>
		<span style={{fontSize: 16, fontWeight: 700}}>{title}</span>
		<div style={{marginLeft: 'auto', transform: 'rotate(180deg)', display: 'flex'}}>
			<Icon name="dropdown" size={20} color={C.textDefault} />
		</div>
	</div>
);

const Rule: React.FC<{y: number}> = ({y}) => <div style={abs(0, y, 300, 1, {background: BR16})} />;

/** BrowseSidebar (filters) inside the forced-open right panel; panel-local coordinates (y from the window top − 48). */
export const FilterPanelContent: React.FC = () => (
	<>
		<div style={abs(0, 1, 300, 52, {padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, fontWeight: 500, color: C.textPrimary})}>
			隐藏已安装内容
			<MiniToggle />
		</div>
		<Rule y={53} />
		<SectionHead y={54} title="游戏版本" />
		<LockedBox y={106} title="游戏版本由实例提供" unlock />
		<Rule y={254} />
		<SectionHead y={255} title="加载器" />
		<LockedBox y={307} title="加载器版本由实例提供" />
		<Rule y={411} />
		<SectionHead y={412} title="类别" />
		<Rule y={456} />
	</>
);

/** The right panel as it is on /browse (no handle, no account block). `x` lets it slide shut. */
export const BrowsePanel: React.FC<{x?: number; height?: number; children?: React.ReactNode}> = ({x = SHELL.winW - SHELL.panelW, height = SHELL.winH, children}) => (
	<div
		style={abs(x, SHELL.titleH, SHELL.panelW, height - SHELL.titleH, {
			background: `linear-gradient(0deg, ${C.panelBottom}, ${C.panelTop})`,
			borderLeft: `1px solid ${C.brandBorder16}`,
			boxShadow: 'inset 15px 0 15px -15px rgba(0,0,0,0.1)',
			overflow: 'hidden',
		})}
	>
		{children ?? <FilterPanelContent />}
	</div>
);
