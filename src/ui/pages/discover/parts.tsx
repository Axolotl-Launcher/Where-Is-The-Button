/**
 * Small Discover building blocks (flat DOM, window-scale CSS px), each a
 * faithful re-creation of the product component named in its comment.
 */
import React, {CSSProperties} from 'react';
import {staticFile} from 'remotion';
import {C, SHADOW} from '../../../theme/tokens';
import {Icon} from '../../Icon';
import {Btn} from '../../kit';
import {INSTALL_W, InstallState} from './layout';
import {MOD_ICONS, ModIcon, ModId} from '../../ModIcon';

/**
 * Mod icon slot: the real icon when the film renders with mod icons (default),
 * otherwise a neutral initial tile (Avatar r = 16/96 · size, 1 px #ddd).
 */
export const InitialTile: React.FC<{initials: string; tint: string; size: number; r?: number; ring?: string; style?: CSSProperties; mod?: ModId}> = ({
	initials,
	tint,
	size,
	r,
	ring = C.divider,
	style,
	mod,
}) =>
	MOD_ICONS && mod ? (
		<ModIcon id={mod} size={size} r={r} ring={ring} style={style} />
	) : (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: r ?? (16 / 96) * size,
			background: tint,
			boxShadow: `inset 0 0 0 1px ${ring}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: '#fff',
			fontWeight: 800,
			fontSize: Math.round(size * 0.34),
			letterSpacing: '-0.01em',
			flexShrink: 0,
			boxSizing: 'border-box',
			...style,
		}}
	>
		{initials}
	</div>
	);

/** Spinning SpinnerIcon (rotation from the frame). */
export const Spin: React.FC<{size: number; color: string; deg: number}> = ({size, color, deg}) => (
	<div style={{width: size, height: size, transform: `rotate(${deg}deg)`, flexShrink: 0}}>
		<Icon name="spinner" size={size} color={color} />
	</div>
);

/** Browse card action (Button md outlined): 安装 / ✓ 已选择 (green) / ✓ 已安装 (disabled) / 安装中…… */
export const InstallButton: React.FC<{state: InstallState; hover?: number; press?: number; spinDeg?: number; style?: CSSProperties}> = ({
	state,
	hover = 0,
	press = 0,
	spinDeg = 0,
	style,
}) => {
	const green = state === 'selected';
	const col = green ? C.green : C.brand;
	const label = state === 'install' ? '安装' : state === 'selected' ? '已选择' : state === 'installed' ? '已安装' : '安装中……';
	return (
		<Btn
			size="md"
			type="outlined"
			color={green ? 'green' : 'brand'}
			icon={state === 'install' ? 'plus' : state === 'installing' ? undefined : 'check'}
			iconNode={state === 'installing' ? <Spin size={20} color={col} deg={spinDeg} /> : undefined}
			label={label}
			width={INSTALL_W[state]}
			hover={hover}
			press={press}
			disabled={state === 'installed' || state === 'installing'}
			style={style}
		/>
	);
};

/** Favourite: quiet md circular icon-only, BookmarkIcon 20 #2c2e31. */
export const FavButton: React.FC = () => (
	<div style={{width: 36, height: 36, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<Icon name="bookmark" size={20} color={C.textDefault} />
	</div>
);

/** Combobox trigger (sort / per page): white, r 12, min-h 40, px 16, gap 10. */
export const Combo: React.FC<{icon: 'arrow-up-down' | 'eye'; label: string; width: number}> = ({icon, label, width}) => (
	<div
		style={{
			width,
			height: 40,
			boxSizing: 'border-box',
			borderRadius: 12,
			background: C.control,
			padding: '0 16px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 10,
		}}
	>
		<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
			<Icon name={icon} size={20} color={C.textDefault} />
			<span style={{fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: C.textTertiary}}>{label}</span>
		</div>
		<Icon name="chevron-down" size={20} color={C.textDefault} />
	</div>
);

const circ = (w: number, extra?: CSSProperties): CSSProperties => ({
	height: 36,
	minWidth: w,
	padding: w > 36 ? '0 10px' : 0,
	boxSizing: 'border-box',
	borderRadius: 99,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: 16,
	fontWeight: 600,
	color: C.textPrimary,
	...extra,
});

/** Pagination: current page = 25 % pink highlight; `[1] 2 ⋯ 5231 ›`. */
export const Pagination: React.FC = () => (
	<div style={{display: 'flex', alignItems: 'center', gap: 4}}>
		<div style={circ(36, {width: 36, background: C.brandTint, boxShadow: SHADOW.control})}>1</div>
		<div style={circ(36, {width: 36})}>2</div>
		<div style={{width: 32, height: 32, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(90deg)'}}>
			<Icon name="ellipsis-vertical" size={20} color={C.textTertiary} />
		</div>
		<div style={circ(60)}>5231</div>
		<div style={circ(36, {width: 36})}>
			<Icon name="chevron-right" size={20} color={C.textDefault} />
		</div>
	</div>
);

/** Locked (instance-provided) filter pill: LockIcon + value, #f5f5f5. */
export const LockedPill: React.FC<{label: string}> = ({label}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 4,
			height: 24,
			padding: '0 8px',
			borderRadius: 99,
			border: `1px solid ${C.divider}`,
			background: C.surface2,
			color: C.textTertiary,
			fontSize: 14,
			lineHeight: 1,
			boxSizing: 'border-box',
			whiteSpace: 'nowrap',
		}}
	>
		<Icon name="lock" size={16} color={C.textTertiary} />
		{label}
	</div>
);

/** TagItem (category). */
export const TagPill: React.FC<{label: string}> = ({label}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			height: 24,
			padding: '0 8px',
			borderRadius: 99,
			border: `1px solid ${C.divider}`,
			background: C.control,
			color: C.textTertiary,
			fontSize: 14,
			lineHeight: 1,
			boxSizing: 'border-box',
			whiteSpace: 'nowrap',
		}}
	>
		{label}
	</div>
);

/** Small sidebar Toggle (40 × 20, knob 12): off = white 50 % track, #595b61 knob. */
export const MiniToggle: React.FC = () => (
	<div style={{width: 40, height: 20, borderRadius: 99, background: 'rgba(255,255,255,0.5)', padding: 4, boxSizing: 'border-box', display: 'flex', alignItems: 'center'}}>
		<div style={{width: 12, height: 12, borderRadius: 99, background: C.gray}} />
	</div>
);

/** Checked Checkbox (modal dependency row). */
export const CheckBox: React.FC = () => (
	<div style={{width: 20, height: 20, borderRadius: 6, background: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
		<Icon name="check" size={14} color="#fff" strokeWidth={3} />
	</div>
);

/** Instance avatar (Fabric.png, pixelated) at a given size. */
export const InstanceIcon: React.FC<{size: number; r?: number}> = ({size, r}) => (
	<img
		src={staticFile('images/instance-icons/Fabric.png')}
		style={{width: size, height: size, borderRadius: r ?? (16 / 96) * size, imageRendering: 'pixelated', display: 'block', flexShrink: 0}}
	/>
);
