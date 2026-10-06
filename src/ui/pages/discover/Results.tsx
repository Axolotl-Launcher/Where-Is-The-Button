/**
 * Browse results: ProjectCard (list layout, ≥850 px), the loading row with
 * list skeletons, and the compact EmptyState. Flat DOM; cards are drawn in
 * card-local coordinates so the scene can lift them onto their own slabs.
 */
import React from 'react';
import {C} from '../../../theme/tokens';
import {Icon} from '../../Icon';
import {Btn} from '../../kit';
import {CardData, CARD_H, COLUMN_CX, EMPTY, InstallState, LOADING_ROW_Y, RESULTS, SKELETON_H, SKELETON_Y0} from './layout';
import {FavButton, InitialTile, InstallButton, Spin, TagPill} from './parts';

export type CardFx = {
	/** Card hover 0..1: brightness(.9), icon opacity .85, title underline. */
	hover?: number;
	/** Card press 0..1: contents scale .97 (SmartClickable, 125 ms ease-out). */
	press?: number;
	install?: InstallState;
	installHover?: number;
	installPress?: number;
	spinDeg?: number;
};

/** One ProjectCard face, 1012 × 142, card-local coordinates. */
export const ResultCardFace: React.FC<{d: CardData; fx?: CardFx}> = ({d, fx = {}}) => {
	const hover = fx.hover ?? 0;
	const press = fx.press ?? 0;
	const state = fx.install ?? d.state;
	return (
		<div
			style={{
				position: 'relative',
				width: RESULTS.w,
				height: CARD_H,
				boxSizing: 'border-box',
				borderRadius: 16,
				border: `1px solid ${C.control}`,
				background: C.chrome,
				filter: hover > 0.001 ? `brightness(${1 - 0.1 * hover})` : undefined,
				transform: press > 0.001 ? `scale(${1 - 0.03 * press})` : undefined,
				overflow: 'hidden',
			}}
		>
			<div style={{position: 'absolute', left: 15, top: 15, opacity: 1 - 0.15 * hover}}>
				<InitialTile initials={d.initials} tint={d.tile} size={100} mod={d.mod} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 127,
					top: 15,
					fontSize: 20,
					fontWeight: 600,
					lineHeight: '20px',
					color: C.textPrimary,
					whiteSpace: 'nowrap',
					textDecoration: hover > 0.5 ? 'underline' : 'none',
					textUnderlineOffset: 3,
				}}
			>
				{d.title}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 127,
					top: 43,
					width: 660,
					fontSize: 16,
					fontWeight: 400,
					lineHeight: '18.4px',
					color: C.textDefault,
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
				}}
			>
				{d.summary}
			</div>
			<div style={{position: 'absolute', left: 127, top: 101, display: 'flex', gap: 4}}>
				{d.tags.map((t) => (
					<TagPill key={t} label={t} />
				))}
			</div>
			{/* actions: install + favourite (gap 8), right edge at x 995 */}
			<div style={{position: 'absolute', right: 15, top: 15, display: 'flex', gap: 8, alignItems: 'center'}}>
				<InstallButton state={state} hover={fx.installHover} press={fx.installPress} spinDeg={fx.spinDeg} />
				<FavButton />
			</div>
			{/* stats column (mt-3 under the actions, gap 12, items-end) */}
			<div style={{position: 'absolute', right: 15, top: 71, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 20, color: C.textDefault, fontSize: 16, fontWeight: 500, lineHeight: '20px'}}>
					<Icon name="download" size={20} color={C.textDefault} />
					{d.downloads}
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 20, color: C.textDefault, fontSize: 16, lineHeight: '20px'}}>
					<Icon name="history" size={20} color={C.textDefault} />
					{d.updated}
				</div>
			</div>
		</div>
	);
};

const bar = (x: number, y: number, w: number | string, h: number, bg: string, r: number | string = 4, op = 1): React.CSSProperties => ({
	position: 'absolute',
	left: x,
	top: y,
	width: w,
	height: h,
	borderRadius: r,
	background: bg,
	opacity: op,
});

/** Loading: spinner + 「正在加载结果……」 above list skeletons (animate-pulse 2 s). */
export const LoadingResults: React.FC<{frame: number; count?: number; opacity?: number}> = ({frame, count = 4, opacity = 1}) => {
	// Tailwind animate-pulse: opacity 1 → .5 → 1 every 2 s, cubic-bezier(.4,0,.6,1)
	const ph = ((frame / 120) % 1 + 1) % 1;
	const pulse = 1 - 0.5 * Math.sin(Math.PI * ph) ** 2;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, opacity}}>
			<div
				style={{
					position: 'absolute',
					left: COLUMN_CX - 68,
					top: LOADING_ROW_Y,
					width: 136,
					height: 20,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 8,
					fontSize: 14,
					fontWeight: 500,
					color: C.textTertiary,
					whiteSpace: 'nowrap',
				}}
			>
				<Spin size={16} color={C.textTertiary} deg={(frame * 6) % 360} />
				正在加载结果……
			</div>
			{Array.from({length: count}, (_, i) => {
				const y = SKELETON_Y0 + i * (SKELETON_H + 12);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: RESULTS.x,
							top: y,
							width: RESULTS.w,
							height: SKELETON_H,
							boxSizing: 'border-box',
							borderRadius: 12,
							border: `1px solid ${C.divider}`,
							background: C.well,
						}}
					>
						<div style={bar(15, 15, 100, 100, C.chrome, 16, pulse)} />
						<div style={bar(127, 17, 260, 16, C.chrome, 4, pulse)} />
						<div style={bar(395, 15, 48, 20, C.surface2, 99, pulse)} />
						<div style={bar(127, 41, 720, 12, C.surface2, 4, pulse)} />
						<div style={bar(127, 61, 480, 12, C.surface2, 4, pulse)} />
						<div style={bar(127, 89, 56, 20, C.surface2, 99, pulse)} />
						<div style={bar(191, 89, 64, 20, C.surface2, 99, pulse)} />
						<div style={bar(263, 89, 48, 20, C.surface2, 99, pulse)} />
						<div style={bar(RESULTS.w - 17 - 64, 17, 64, 16, C.surface2, 4, pulse)} />
						<div style={bar(RESULTS.w - 17 - 48, 41, 48, 12, C.surface2, 4, pulse)} />
					</div>
				);
			})}
		</div>
	);
};

/** Compact EmptyState (no-results): FolderSearch chip, 这里还是空的 / 没有找到您的查询结果！ / 清除搜索. */
export const EmptyResults: React.FC<{opacity?: number; buttonHover?: number; buttonPress?: number}> = ({opacity = 1, buttonHover = 0, buttonPress = 0}) => (
	<div style={{position: 'absolute', left: 0, top: 0, opacity}}>
		<div
			style={{
				position: 'absolute',
				left: EMPTY.chip.x,
				top: EMPTY.chip.y,
				width: 40,
				height: 40,
				boxSizing: 'border-box',
				borderRadius: 12,
				border: `1px solid ${C.divider}`,
				background: C.surface2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Icon name="folder-search" size={24} color={C.textTertiary} />
		</div>
		<div style={{position: 'absolute', left: COLUMN_CX - 200, width: 400, top: EMPTY.titleY, height: 32, textAlign: 'center', fontSize: 18, fontWeight: 600, lineHeight: '32px', color: C.textPrimary}}>
			这里还是空的
		</div>
		<div style={{position: 'absolute', left: COLUMN_CX - 200, width: 400, top: EMPTY.textY, height: 24, textAlign: 'center', fontSize: 14, lineHeight: '24px', color: C.textTertiary}}>
			没有找到您的查询结果！
		</div>
		<div style={{position: 'absolute', left: EMPTY.button.x, top: EMPTY.button.y}}>
			<Btn size="md" type="base" label="清除搜索" width={EMPTY.button.w} hover={buttonHover} press={buttonPress} />
		</div>
	</div>
);

/** Viewport scrollbar thumb in the 16 px gutter (only while the list is long). */
export const ScrollThumb: React.FC<{opacity?: number}> = ({opacity = 1}) => (
	<div style={{position: 'absolute', left: 1129, top: 53, width: 6, height: 172, borderRadius: 3, background: C.scrollbar, opacity}} />
);
