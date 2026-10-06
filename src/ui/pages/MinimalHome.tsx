/**
 * 极简主页 (HomeMinimal.vue) in a 1440 × 810 window. Positions are window
 * coordinates computed from the stage CSS (bible §3.5, +9 px for the 810-tall
 * 16:9 window). Panel collapsed (film default): greeting centred at x 744,
 * card x 360–1128 y 384–472, hero 「开始游戏」 x 911–1055 y 404–452, list
 * button x 1063–1111. Panel open: everything 150 px further left.
 */
import React from 'react';
import {staticFile} from 'remotion';
import {ButtonFace, FaceProps} from '../../characters/LaunchButton';
import {C} from '../../theme/tokens';
import {Icon} from '../Icon';

/** Layout in window coordinates; the film uses the panel-collapsed variant (hero x 911–1055). */
export const mhLayout = (panel: boolean) => {
	const dx = panel ? 0 : 150; // column re-centres from x 594 to x 744 when the right panel is collapsed
	return {
		centerX: 594 + dx,
		greetTop: 298,
		barTop: 342,
		card: {x: 210 + dx, y: 384, w: 768, h: 88},
		hero: {x: 761 + dx, y: 404, w: 144, h: 48},
		list: {x: 913 + dx, y: 404, w: 48, h: 48},
		icon: {x: 227 + dx, y: 412, s: 32},
		name: {x: 279 + dx, y: 401},
	};
};
export type MHLayout = ReturnType<typeof mhLayout>;
export const MH = mhLayout(false);

/** Hero centre in window coordinates (panel collapsed). */
export const HERO_HOME = {x: MH.hero.x + MH.hero.w / 2, y: MH.hero.y + MH.hero.h / 2};

export const Greeting: React.FC<{text?: string; name?: string; L?: MHLayout}> = ({text = '傍晚好', name = 'Mystic_Stars', L = MH}) => (
	<>
		<div
			style={{
				position: 'absolute',
				left: L.centerX - 400,
				width: 800,
				top: L.greetTop,
				textAlign: 'center',
				fontSize: 24,
				fontWeight: 800,
				lineHeight: '32px',
				color: C.textPrimary,
			}}
		>
			{text}，{name}
		</div>
		<div style={{position: 'absolute', left: L.centerX - 16, top: L.barTop, width: 32, height: 2, borderRadius: 9, background: C.brand}} />
	</>
);

/** The card body (no hero) — the hero is drawn by `heroSlot` so scenes can lift it out. */
export const MinimalCard: React.FC<{
	heroSlot?: React.ReactNode;
	listHover?: number;
	instanceName?: string;
	style?: React.CSSProperties;
	L?: MHLayout;
}> = ({heroSlot, listHover = 0, instanceName = 'Vanilla Perfected', style, L = MH}) => {
	const {card} = L;
	return (
		<div style={{position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h, ...style}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: C.chrome,
					border: `1px solid ${C.control}`,
					borderRadius: 16,
					boxSizing: 'border-box',
				}}
			/>
			{/* instance link */}
			<img
				src={staticFile('images/instance-icons/Fabric.png')}
				style={{position: 'absolute', left: L.icon.x - card.x, top: L.icon.y - card.y, width: 32, height: 32, objectFit: 'contain', imageRendering: 'pixelated'}}
			/>
			<div style={{position: 'absolute', left: L.name.x - card.x, top: L.name.y - card.y, display: 'flex', flexDirection: 'column', gap: 6}}>
				<div style={{fontSize: 20, fontWeight: 700, lineHeight: '28px', color: C.textPrimary, whiteSpace: 'nowrap'}}>{instanceName}</div>
				<div style={{display: 'flex', gap: 16, fontSize: 14, lineHeight: '20px', color: C.textTertiary, whiteSpace: 'nowrap'}}>
					<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
						<Icon name="game" size={16} color={C.textTertiary} />
						Fabric 26.2
					</span>
					<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
						<Icon name="timer" size={16} color={C.textTertiary} />
						游玩于 2分钟前
					</span>
				</div>
			</div>
			{/* neighbour: quiet xl circular 「更换主页实例」 */}
			<div
				style={{
					position: 'absolute',
					left: L.list.x - card.x,
					top: L.list.y - card.y,
					width: 48,
					height: 48,
					borderRadius: 99,
					background: listHover > 0 ? `rgba(255,255,255,${listHover})` : undefined,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Icon name="list" size={24} color={C.textDefault} />
			</div>
			<div style={{position: 'absolute', left: L.hero.x - card.x, top: L.hero.y - card.y}}>{heroSlot}</div>
		</div>
	);
};

/** Everything inside the well for Minimal Home, in WINDOW coordinates (render inside a 1440 × 810 box). */
export const MinimalHomeContent: React.FC<{hero?: FaceProps | null; greeting?: string; panel?: boolean}> = ({hero = {}, greeting, panel = false}) => {
	const L = mhLayout(panel);
	return (
		<>
			<Greeting text={greeting} L={L} />
			<MinimalCard L={L} heroSlot={hero ? <ButtonFace {...hero} /> : null} />
		</>
	);
};
