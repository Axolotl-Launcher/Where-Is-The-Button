/**
 * The protagonist: Minimal Home's real 「开始游戏」 button (HomeMinimal.vue
 * L273–282 → ButtonFrame xl coloured brand). Native geometry 144 × 48, r 16,
 * #db2777, outline Lucide play triangle 24 px (+1 px optical shift), label
 * 16/800 white, 1 px white top rim, 30 % pink hairline, soft 4-layer shadow.
 *
 * `ButtonFace` draws the flat face at any morph geometry; `Hero` mounts it in
 * the 2.5D world as a thin pink slab with a floor shadow and squash/stretch.
 * Identity core kept through every morph: brand pink + the outline triangle.
 */
import React, {CSSProperties} from 'react';
import {C, SHADOW} from '../theme/tokens';
import {Icon} from '../ui/Icon';
import {FloorShadow, Obj, Slab} from '../stage/Stage';

export const HERO_W = 144;
export const HERO_H = 48;
export const HERO_R = 16;

export type HeroState = 'idle' | 'hover' | 'busy' | 'running';

/** Outline play triangle, drawn exactly like PlayIcon (polygon 5 3 19 12 5 21, stroke 2/24). */
export const PlayGlyph: React.FC<{size?: number; color?: string; rot?: number; style?: CSSProperties; stroke?: number}> = ({
	size = 24,
	color = '#fff',
	rot = 0,
	style,
	stroke = 2,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{display: 'block', overflow: 'visible', flexShrink: 0, transform: rot ? `rotate(${rot}deg)` : undefined, transformOrigin: '50% 50%', ...style}}
	>
		<polygon points="5 3 19 12 5 21 5 3" />
	</svg>
);

export type FaceProps = {
	w?: number;
	h?: number;
	r?: number;
	state?: HeroState;
	/** 0..1 hover darkening (brightness .9 at 1). */
	hover?: number;
	/** 0..1 press (scale .97 at 1 — the real :active). */
	press?: number;
	/** Label visibility 0..1 (morphs hide it). */
	label?: number;
	labelText?: string;
	/** Triangle size in px (24 native). */
	glyph?: number;
	/** Triangle rotation ("gaze"), degrees; 0 = pointing right. */
	gaze?: number;
	/** Offset of the triangle from its native slot (px). */
	glyphDx?: number;
	glyphDy?: number;
	/** Fill override (e.g. while lending its pink). */
	fill?: string;
	/** CSS drop shadow (only when sitting flat in the UI). */
	cssShadow?: boolean;
	/** 4 px focus ring amount 0..1. */
	ring?: number;
	/** Spinner rotation for the busy state, degrees. */
	spin?: number;
	opacity?: number;
	style?: CSSProperties;
	children?: React.ReactNode;
};

/** The flat face at its morph geometry, top-left anchored. */
export const ButtonFace: React.FC<FaceProps> = ({
	w = HERO_W,
	h = HERO_H,
	r = HERO_R,
	state = 'idle',
	hover = 0,
	press = 0,
	label = 1,
	labelText,
	glyph = 24,
	gaze = 0,
	glyphDx = 0,
	glyphDy = 0,
	fill,
	cssShadow = true,
	ring = 0,
	spin = 0,
	opacity = 1,
	style,
	children,
}) => {
	const busy = state === 'busy';
	const running = state === 'running';
	const bg = fill ?? (busy ? C.control : running ? C.red : C.brand);
	const fg = busy ? C.textPrimary : '#ffffff';
	const text = labelText ?? (busy ? '实例正在加载……' : running ? '停止' : '开始游戏');
	const shadows: string[] = [];
	if (ring > 0) shadows.push(`0 0 0 ${4 * ring}px ${C.brandRing}`);
	if (busy) shadows.push(SHADOW.control);
	else {
		shadows.push(`0 0 0 1px ${running ? 'rgba(203,34,69,0.3)' : C.brandHairline}`);
		if (cssShadow) shadows.push('0 2px 4px rgba(0,0,0,.04), 0 5px 8px rgba(0,0,0,.04), 0 10px 18px rgba(0,0,0,.03), 0 24px 48px rgba(0,0,0,.03)');
		shadows.push('inset 0 1px 0 rgba(255,255,255,0.3)'); // the 1 px top-lit rim
	}
	// Native content block: 24 icon + 8 gap + label, centred; label fades & collapses during morphs.
	const showLabel = label > 0.001;
	return (
		<div
			style={{
				position: 'relative',
				width: w,
				height: h,
				borderRadius: r,
				background: bg,
				boxShadow: shadows.join(', '),
				filter: hover > 0 ? `brightness(${1 - 0.1 * hover})` : undefined,
				transform: press > 0 ? `scale(${1 - 0.03 * press})` : undefined,
				opacity: busy ? 0.5 * opacity : opacity,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 8 * label,
				color: fg,
				overflow: 'hidden',
				boxSizing: 'border-box',
				...style,
			}}
		>
			<div style={{transform: `translate(${1 + glyphDx}px, ${glyphDy}px)`, display: 'flex'}}>
				{busy ? (
					<div style={{transform: `rotate(${spin}deg)`}}>
						<Icon name="spinner" size={glyph} color={C.textDefault} />
					</div>
				) : running ? (
					<Icon name="stop-circle" size={glyph} color="#fff" />
				) : (
					<PlayGlyph size={glyph} rot={gaze} />
				)}
			</div>
			{showLabel ? (
				<span
					style={{
						fontSize: 16,
						fontWeight: 800,
						lineHeight: '20px',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						maxWidth: busy ? 72 : 64 * label + 0.01,
						opacity: label,
						letterSpacing: 0,
					}}
				>
					{text}
				</span>
			) : null}
			{children}
		</div>
	);
};

export type HeroProps = FaceProps & {
	/** World position of the face centre (z = height of the slab's underside). */
	x: number;
	y: number;
	z: number;
	floorZ?: number;
	/** Thin-volume thickness (FILM; product has none). */
	d?: number;
	rx?: number;
	ry?: number;
	rz?: number;
	/** Squash & stretch in the face plane and thickness. */
	sx?: number;
	sy?: number;
	sz?: number;
	shadow?: boolean;
	shadowStrength?: number;
};

/** The hero as a 3D object: pink slab + floor shadow. */
export const Hero: React.FC<HeroProps> = ({
	x,
	y,
	z,
	floorZ = 0,
	d = 8,
	rx = 0,
	ry = 0,
	rz = 0,
	sx = 1,
	sy = 1,
	sz = 1,
	shadow = true,
	shadowStrength = 1,
	w = HERO_W,
	h = HERO_H,
	r = HERO_R,
	...face
}) => {
	const busy = face.state === 'busy';
	const running = face.state === 'running';
	const side = busy ? C.sideWhite : running ? '#a51b38' : C.sidePink;
	const sideTop = busy ? '#f2f2f2' : running ? '#b81f3f' : '#d0256f';
	return (
		<>
			{shadow ? (
				<FloorShadow x={x} y={y} floorZ={floorZ} w={w * sx} h={h * sy} r={r} height={Math.max(0, z - floorZ)} strength={shadowStrength} rz={rz} />
			) : null}
			<Obj x={x} y={y} z={z} rx={rx} ry={ry} rz={rz} sx={sx} sy={sy} sz={sz}>
				<Slab w={w} h={h} d={d} r={r} face="transparent" side={side} sideTop={sideTop} faceStyle={{overflow: 'visible'}}>
					<ButtonFace w={w} h={h} r={r} cssShadow={false} {...face} />
				</Slab>
			</Obj>
		</>
	);
};
