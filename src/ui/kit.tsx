/**
 * Faithful re-creations of Axolotl's base UI components (packages/ui), sized
 * and painted from the source (ButtonFrame.vue, Card, TagItem, Toggle,
 * StyledInput, NavTabs, tooltip overlays). Flat DOM — the stage decides depth.
 */
import React, {CSSProperties} from 'react';
import {C, SHADOW} from '../theme/tokens';
import {Icon} from './Icon';
import {IconName} from './icons.generated';

export type BtnSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BtnType = 'base' | 'colored' | 'outlined' | 'quiet' | 'highlight';

const SIZE: Record<BtnSize, {h: number; r: number; px: number; gap: number; font: number; weight: number; icon: number}> = {
	'2xs': {h: 24, r: 8, px: 6, gap: 4, font: 14, weight: 600, icon: 16},
	xs: {h: 28, r: 8, px: 6, gap: 4, font: 14, weight: 600, icon: 16},
	sm: {h: 32, r: 10, px: 6, gap: 4, font: 14, weight: 600, icon: 16},
	md: {h: 36, r: 12, px: 10, gap: 6, font: 16, weight: 600, icon: 20},
	lg: {h: 40, r: 14, px: 16, gap: 8, font: 16, weight: 600, icon: 20},
	xl: {h: 48, r: 16, px: 14, gap: 8, font: 16, weight: 800, icon: 24},
};

const COLOR = {brand: C.brand, red: C.red, green: C.green} as const;

export const Btn: React.FC<{
	size?: BtnSize;
	type?: BtnType;
	color?: keyof typeof COLOR;
	icon?: IconName;
	iconNode?: React.ReactNode;
	iconRight?: IconName;
	label?: React.ReactNode;
	circular?: boolean;
	iconOnly?: boolean;
	width?: number;
	hover?: number;
	press?: number;
	disabled?: boolean;
	justify?: CSSProperties['justifyContent'];
	style?: CSSProperties;
}> = ({size = 'md', type = 'base', color = 'brand', icon, iconNode, iconRight, label, circular, iconOnly, width, hover = 0, press = 0, disabled, justify = 'center', style}) => {
	const s = SIZE[size];
	const col = COLOR[color];
	let bg = 'transparent';
	let fg: string = C.textPrimary;
	let iconColor: string = C.textDefault;
	let shadow: string | undefined;
	let border = '1px solid transparent';
	if (type === 'base') {
		bg = C.control;
		shadow = SHADOW.control;
	} else if (type === 'colored') {
		bg = col;
		fg = '#fff';
		iconColor = '#fff';
		shadow = `0 0 0 1px ${col === C.brand ? C.brandHairline : col === C.red ? 'rgba(203,34,69,.3)' : 'rgba(0,175,92,.3)'}, 0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03), inset 0 1px 0 rgba(255,255,255,.3)`;
	} else if (type === 'outlined') {
		fg = col;
		iconColor = col;
		border = `1px solid ${col}`;
	} else if (type === 'quiet') {
		fg = C.textDefault;
		iconColor = C.textDefault;
		if (hover > 0) bg = `rgba(255,255,255,${hover})`;
	} else if (type === 'highlight') {
		bg = C.brandTint;
		fg = col;
		iconColor = col;
	}
	const w = iconOnly || circular ? s.h : width;
	return (
		<div
			style={{
				position: 'relative',
				boxSizing: 'border-box',
				height: s.h,
				width: w,
				minWidth: iconOnly ? s.h : undefined,
				padding: iconOnly ? 0 : `0 ${s.px}px`,
				borderRadius: circular ? 9999 : s.r,
				border,
				background: bg,
				boxShadow: shadow,
				color: fg,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: justify,
				gap: s.gap,
				fontSize: s.font,
				fontWeight: s.weight,
				lineHeight: '20px',
				whiteSpace: 'nowrap',
				filter: hover > 0 && type !== 'quiet' ? `brightness(${1 - 0.1 * hover})` : undefined,
				transform: press > 0 ? `scale(${1 - 0.03 * press})` : undefined,
				opacity: disabled ? 0.5 : 1,
				flexShrink: 0,
				...style,
			}}
		>
			{iconNode ?? (icon ? <Icon name={icon} size={s.icon} color={iconColor} /> : null)}
			{label != null && !iconOnly ? <span>{label}</span> : null}
			{iconRight ? <Icon name={iconRight} size={s.icon} color={iconColor} /> : null}
		</div>
	);
};

/** `.card`: #f8f8f8, 1 px #fff, r 16, p 16. */
export const Card: React.FC<{children?: React.ReactNode; style?: CSSProperties; pad?: number; r?: number}> = ({children, style, pad = 16, r = 16}) => (
	<div style={{boxSizing: 'border-box', background: C.chrome, border: `1px solid ${C.control}`, borderRadius: r, padding: pad, ...style}}>{children}</div>
);

/** TagItem pill ≈24 tall. */
export const Tag: React.FC<{children: React.ReactNode; color?: string; icon?: IconName; style?: CSSProperties}> = ({children, color = C.textTertiary, icon, style}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 4,
			height: 24,
			padding: '0 8px',
			borderRadius: 9999,
			border: `1px solid ${C.divider}`,
			background: C.control,
			color,
			fontSize: 14,
			fontWeight: 400,
			lineHeight: 1,
			boxSizing: 'border-box',
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{icon ? <Icon name={icon} size={14} color={color} /> : null}
		{children}
	</div>
);

/** Toggle.vue: 48 × 24; on = pink track + black/90 knob; off = white track (inset #ddd) + gray knob. */
export const Toggle: React.FC<{on: number; style?: CSSProperties; knob?: number}> = ({on, style, knob = 16}) => {
	const t = Math.max(0, Math.min(1, on));
	const trackOn = t > 0.5;
	return (
		<div
			style={{
				position: 'relative',
				width: 48,
				height: 24,
				borderRadius: 9999,
				background: trackOn ? C.brand : C.control,
				boxShadow: trackOn ? undefined : `inset 0 0 0 1px ${C.divider}`,
				flexShrink: 0,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: (24 - knob) / 2,
					left: 4 + t * (48 - 8 - knob),
					width: knob,
					height: knob,
					borderRadius: 9999,
					background: trackOn ? 'rgba(0,0,0,0.9)' : C.gray,
				}}
			/>
		</div>
	);
};

/** StyledInput (Browse search): 48 tall, white, r 12, icon at x 12, pl 40. */
export const SearchField: React.FC<{
	w: number;
	h?: number;
	r?: number;
	placeholder?: string;
	value?: string;
	focused?: number;
	caret?: boolean;
	icon?: IconName;
	iconNode?: React.ReactNode;
	clear?: boolean;
	fontSize?: number;
	style?: CSSProperties;
}> = ({w, h = 48, r = 12, placeholder = '搜索模组……', value = '', focused = 0, caret = false, icon = 'search', iconNode, clear, fontSize = 16, style}) => (
	<div
		style={{
			position: 'relative',
			boxSizing: 'border-box',
			width: w,
			height: h,
			borderRadius: r,
			background: C.control,
			boxShadow: focused > 0 ? `0 0 0 ${4 * focused}px ${C.brandRing}` : undefined,
			display: 'flex',
			alignItems: 'center',
			paddingLeft: 40,
			paddingRight: clear ? 32 : 12,
			fontSize,
			fontWeight: 500,
			lineHeight: '20px',
			color: focused > 0.5 ? C.textPrimary : C.textDefault,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			...style,
		}}
	>
		<div style={{position: 'absolute', left: 12, top: (h - 20) / 2, opacity: focused > 0.5 ? 1 : 0.6}}>
			{iconNode ?? <Icon name={icon} size={20} color={focused > 0.5 ? C.textPrimary : C.textTertiary} />}
		</div>
		{value ? (
			<span>{value}</span>
		) : (
			<span style={{color: C.textTertiary, opacity: focused > 0.5 ? 0.8 : 0.6}}>{placeholder}</span>
		)}
		{caret ? <span style={{display: 'inline-block', width: 1.5, height: 20, background: C.textPrimary, marginLeft: value ? 1 : -placeholderShift(placeholder, fontSize)}} /> : null}
		{clear && value ? (
			<div style={{position: 'absolute', right: 8, top: (h - 20) / 2}}>
				<Icon name="x" size={20} color={C.textTertiary} />
			</div>
		) : null}
	</div>
);

// The caret sits at the start of the field when only the placeholder shows.
function placeholderShift(p: string, fs: number) {
	return [...p].length * fs + 1;
}

/**
 * NavTabs capsule (#f8f8f8, 1 px #fff, shadow-xl, padding 4, 46 tall);
 * tabs 36 tall px 16, 14/700. The pink slider is drawn from explicit edges so
 * scenes can animate the product's inchworm gait.
 */
export const NavTabs: React.FC<{
	tabs: Array<{label: string; icon?: IconName}>;
	active: number;
	/** Optional explicit slider edges in px relative to the first tab's left. */
	slider?: {left: number; right: number; opacity?: number};
	style?: CSSProperties;
	tabWidths?: number[];
}> = ({tabs, active, slider, style, tabWidths}) => {
	const widths = tabWidths ?? tabs.map((t) => measureTab(t.label, !!t.icon));
	const lefts: number[] = [];
	let acc = 0;
	for (const w of widths) {
		lefts.push(acc);
		acc += w;
	}
	const sl = slider ?? {left: lefts[active], right: lefts[active] + widths[active], opacity: 1};
	return (
		<div
			style={{
				position: 'relative',
				display: 'inline-flex',
				padding: 4,
				borderRadius: 9999,
				background: C.chrome,
				border: `1px solid ${C.control}`,
				boxShadow: SHADOW.xl,
				boxSizing: 'border-box',
				height: 46,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 4,
					left: 4 + sl.left,
					width: Math.max(0, sl.right - sl.left),
					height: 36,
					borderRadius: 9999,
					background: C.brand,
					opacity: sl.opacity ?? 1,
				}}
			/>
			{tabs.map((t, i) => {
				const isActive = sl.left <= lefts[i] + 2 && sl.right >= lefts[i] + widths[i] - 2;
				const col = isActive ? '#fff' : C.textPrimary;
				return (
					<div
						key={i}
						style={{
							position: 'relative',
							width: widths[i],
							height: 36,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 6,
							fontSize: 14,
							fontWeight: 700,
							lineHeight: '20px',
							color: col,
							whiteSpace: 'nowrap',
						}}
					>
						{t.icon ? <Icon name={t.icon} size={16} color={col} /> : null}
						{t.label}
					</div>
				);
			})}
		</div>
	);
};

/** Approximate tab width: px-4 + label (CJK 14px glyphs) + optional 16 px icon + gap. */
export function measureTab(label: string, icon: boolean) {
	let w = 32;
	for (const ch of label) w += /[　-鿿＀-￯]/.test(ch) ? 14 : 8;
	if (icon) w += 22;
	return w;
}

/** Tooltip (nav opens to the right): #f8f8f8, 1 px #ddd, r 8, 10 × 12, 14.4 / 500. */
export const Tooltip: React.FC<{text: React.ReactNode; side?: 'right' | 'top' | 'bottom'; style?: CSSProperties}> = ({text, side = 'top', style}) => {
	const arrow: CSSProperties =
		side === 'right'
			? {left: -7, top: '50%', marginTop: -7, borderWidth: '7px 7px 7px 0', borderColor: `transparent ${C.chrome} transparent transparent`}
			: side === 'top'
				? {bottom: -7, left: '50%', marginLeft: -7, borderWidth: '7px 7px 0 7px', borderColor: `${C.chrome} transparent transparent transparent`}
				: {top: -7, left: '50%', marginLeft: -7, borderWidth: '0 7px 7px 7px', borderColor: `transparent transparent ${C.chrome} transparent`};
	return (
		<div style={{position: 'relative', display: 'inline-block', filter: SHADOW.tooltip, ...style}}>
			<div
				style={{
					background: C.chrome,
					border: `1px solid ${C.divider}`,
					borderRadius: 8,
					padding: '10px 12px',
					fontSize: 14.4,
					fontWeight: 500,
					lineHeight: 1,
					color: C.textPrimary,
					whiteSpace: 'nowrap',
				}}
			>
				{text}
			</div>
			<div style={{position: 'absolute', width: 0, height: 0, borderStyle: 'solid', ...arrow}} />
		</div>
	);
};

/** Avatar: square image with radius 16/96 × size and a 1 px #ddd ring. */
export const Avatar: React.FC<{src: string; size: number; pixelated?: boolean; frameless?: boolean; style?: CSSProperties; bg?: string}> = ({src, size, pixelated, frameless, style, bg}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: (16 / 96) * size,
			overflow: 'hidden',
			background: frameless ? 'transparent' : bg ?? C.control,
			boxShadow: frameless ? undefined : `inset 0 0 0 1px ${C.divider}`,
			flexShrink: 0,
			...style,
		}}
	>
		<img src={src} style={{width: '100%', height: '100%', objectFit: 'contain', imageRendering: pixelated ? 'pixelated' : 'auto', display: 'block'}} />
	</div>
);

/** Spinner (25 % ring + 75 % arc), rotation driven by the frame. */
export const Spinner: React.FC<{size?: number; color?: string; deg: number}> = ({size = 24, color = C.textDefault, deg}) => (
	<div style={{width: size, height: size, transform: `rotate(${deg}deg)`}}>
		<Icon name="spinner" size={size} color={color} />
	</div>
);
