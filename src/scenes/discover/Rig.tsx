/**
 * Stage rigging for M3: window-anchored planes at real elevations, card
 * slabs (+4), the empty F3 shell, and the 2D shell overlay used during the
 * navigation plunge (R3: title bar + nav rail stay put while the content
 * well drops one floor).
 */
import React, {CSSProperties} from 'react';
import {Obj} from '../../stage/Stage';
import {toWorld} from '../../film/timeline';
import {C, SHELL} from '../../theme/tokens';
import {ButtonFace} from '../../characters/LaunchButton';
import {Icon} from '../../ui/Icon';
import {AppWindow, ContentWell, navY, TitleBar} from '../../ui/shell/AppWindow';
import {CardData, cardY, RESULTS, CARD_H, QUICK1} from '../../ui/pages/discover/layout';
import {CardFx, ResultCardFace} from '../../ui/pages/discover/Results';
import {BrowsePanel, NavRailX} from '../../ui/pages/discover/Shell';
import {clamp, ease, lerp} from '../../lib/anim';
import {Easing} from 'remotion';
import {B, ramp, Z2} from './beats';
import {HeroPose} from './hero';

/** A flat plane whose top-left sits at window (x, y) on F2 at height `elev`. */
export const WinPlane: React.FC<{x: number; y: number; w: number; h: number; elev: number; floorZ?: number; style?: CSSProperties; children?: React.ReactNode}> = ({
	x,
	y,
	w,
	h,
	elev,
	floorZ = Z2,
	style,
	children,
}) => {
	const p = toWorld(x, y, floorZ + elev);
	return (
		<Obj x={p.x} y={p.y} z={p.z}>
			<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, ...style}}>{children}</div>
		</Obj>
	);
};

/** A result card as a 4 px slab (side layers + face), clipped at the window bottom. */
export const CardSlab: React.FC<{i: number; d: CardData; fx?: CardFx; opacity: number; dy: number; blur?: number}> = ({i, d, fx, opacity, dy, blur = 0}) => {
	const y = cardY(i) + dy;
	const p = toWorld(RESULTS.x, y, Z2);
	const cut = Math.max(0, y + CARD_H - SHELL.winH);
	const clip = cut > 0 ? `inset(0 0 ${cut}px 0)` : undefined;
	if (opacity <= 0.001) return null;
	const layer = (z: number, bg: string): CSSProperties => ({
		position: 'absolute',
		left: 0,
		top: 0,
		width: RESULTS.w,
		height: CARD_H,
		borderRadius: 16,
		background: bg,
		transform: `translateZ(${z}px)`,
		opacity,
		clipPath: clip,
	});
	return (
		<Obj x={p.x} y={p.y} z={p.z}>
			<div style={layer(0.4, '#dcdcdc')} />
			<div style={layer(2.2, '#e6e6e6')} />
			<div style={{...layer(4, 'transparent'), filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
				<ResultCardFace d={d} fx={fx} />
			</div>
		</Obj>
	);
};

/** F3 at the cut: the instance shell with an empty well (#ebebeb). */
export const InstanceShellEmpty: React.FC = () => (
	<AppWindow
		nav={null}
		navSlider={{top: navY(5), bottom: navY(5) + 48, tone: 'white'}}
		quickActive={0}
		breadcrumb={{iconImg: 'images/instance-icons/Fabric.png', text: 'Vanilla Perfected', sub: '内容'}}
		panel={false}
		frame={false}
	/>
);

/**
 * F3 during the navigation plunge: only its content well (#ebebeb, 20 px
 * top-left radius, inset shadow — the shell's own ContentWell, clipped to
 * the well's outline) — the persistent 2D ShellOverlay supplies the title
 * bar, nav rail and collapse handle, so no second window appears inside the
 * first. At the cut it is identical under the overlay to the full shell.
 */
export const InstanceWellOnly: React.FC<{fog?: number}> = ({fog = 0}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			clipPath: `inset(${SHELL.titleH}px 0 0 ${SHELL.railW}px round ${SHELL.wellRadius}px 0 0 0)`,
		}}
	>
		<ContentWell right={0} />
		{fog > 0.001 ? <div style={{position: 'absolute', inset: 0, background: '#ddd8df', opacity: fog}} /> : null}
	</div>
);

const panelEase = Easing.bezier(0.22, 1, 0.36, 1);

/** Slider inchworm 发现内容 → 实例库 (leading edge first, trailing +; film ×≈1.7) and pink → white. */
export function plungeNav(f: number) {
	const lead = ease.inOut(ramp(f, B.quick, B.quick + 16));
	const trail = ease.inOut(ramp(f, B.quick + 9, B.quick + 26));
	const top = lerp(navY(2), navY(5), trail);
	const bottom = lerp(navY(2) + 48, navY(5) + 48, lead);
	return {top, bottom, white: ease.inOut(ramp(f, B.quick + 5, B.quick + 22))};
}

/** The persistent shell drawn in screen space during the plunge (window coords × 4/3). */
export const ShellOverlay: React.FC<{f: number; hero: HeroPose}> = ({f, hero}) => {
	const panelT = panelEase(clamp((f - B.quick) / 27, 0, 1));
	const panelX = lerp(SHELL.winW - SHELL.panelW, SHELL.winW, panelT);
	const bc = ramp(f, B.quick, B.quick + 6);
	const sl = plungeNav(f);
	const wellRight = panelX;
	const disc = hero.mode === 'overlay';
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: SHELL.winW, height: SHELL.winH, transform: 'scale(1.3333333)', transformOrigin: '0 0', overflow: 'hidden'}}>
			<TitleBar breadcrumb={{icon: 'compass', text: '发现内容'}} />
			<div style={{position: 'absolute', inset: 0, opacity: bc}}>
				<TitleBar breadcrumb={{iconImg: 'images/instance-icons/Fabric.png', text: 'Vanilla Perfected', sub: '内容'}} />
			</div>
			<NavRailX slider={sl} badge={{s: 1, count: 1}} quickPink={1} />
			{/* chrome outside the well's rounded top-left corner */}
			<div
				style={{
					position: 'absolute',
					left: SHELL.railW,
					top: SHELL.titleH,
					width: 20,
					height: 20,
					background: `radial-gradient(circle at 100% 100%, transparent 19.5px, ${C.chrome} 20px)`,
				}}
			/>
			{/* the well's inset shadow + 1 px #ddd stroke (App.vue .app-contents::before) */}
			<div
				style={{
					position: 'absolute',
					left: SHELL.railW,
					top: SHELL.titleH,
					width: wellRight - SHELL.railW,
					height: SHELL.winH - SHELL.titleH,
					borderTopLeftRadius: SHELL.wellRadius,
					boxShadow: `inset 1px 1px 15px rgba(0,0,0,0.1), inset 1px 1px 0 ${C.divider}`,
				}}
			/>
			<BrowsePanel x={panelX} />
			{/* the instance route has the collapse handle; it rides the closing panel's edge */}
			<div
				style={{
					position: 'absolute',
					left: panelX - 15,
					top: SHELL.titleH + (SHELL.winH - SHELL.titleH) / 2 - 20,
					width: 15,
					height: 40,
					background: '#e9d3dd',
					borderRadius: '12px 0 0 12px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: ramp(f, B.quick + 4, B.quick + 14),
				}}
			>
				<Icon name="chevron-left" size={10} color={C.textTertiary} />
			</div>
			{disc ? (
				<div
					style={{
						position: 'absolute',
						left: QUICK1.x,
						top: QUICK1.y,
						width: 48,
						height: 48,
						transform: `scale(${hero.sx}, ${hero.sy})`,
						transformOrigin: '50% 50%',
					}}
				>
					<ButtonFace w={48} h={48} r={24} label={0} glyphDx={1} press={hero.press} cssShadow={false} />
				</div>
			) : null}
		</div>
	);
};
