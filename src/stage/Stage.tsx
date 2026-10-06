/**
 * The 2.5D miniature stage.
 *
 * World axes: x → right, y → down (screen-like), z → UP out of the page.
 * Every launcher page is a horizontal "floor" lying in an x-y plane, so a
 * camera with pitch 0 looking straight down sees exactly the flat UI the
 * player knows; tilting the camera reveals the diorama: thin slabs, real
 * heights (UI elevation becomes literal z) and soft shadows cast downward.
 * Gravity points to -z, so "falling through the UI" means dropping to the
 * floor below.
 */
import React, {CSSProperties} from 'react';
import {AbsoluteFill} from 'remotion';

export type Cam = {
	/** Look-at target in world space. */
	x: number;
	y: number;
	z: number;
	/** Distance from the eye to the target (== persp → 1:1 scale at target). */
	dist: number;
	/** Tilt in degrees. 0 = top-down; positive looks from the south (bottom of frame). */
	pitch: number;
	/** Rotation of the world about its vertical axis, degrees. */
	yaw: number;
	/** Screen roll, degrees. */
	roll: number;
	/** CSS perspective (lens). Larger = longer lens, flatter. */
	persp: number;
};

export const defaultCam: Cam = {x: 0, y: 0, z: 0, dist: 2000, pitch: 0, yaw: 0, roll: 0, persp: 2000};

export const camTransform = (c: Cam) =>
	`translateZ(${c.persp - c.dist}px) rotateZ(${c.roll}deg) rotateX(${c.pitch}deg) rotateZ(${c.yaw}deg) translate3d(${-c.x}px, ${-c.y}px, ${-c.z}px)`;

export const Stage: React.FC<{
	cam: Cam;
	children: React.ReactNode;
	background?: string;
	style?: CSSProperties;
}> = ({cam, children, background, style}) => {
	return (
		<AbsoluteFill
			style={{
				perspective: cam.persp,
				perspectiveOrigin: '50% 50%',
				overflow: 'hidden',
				background,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 0,
					height: 0,
					transformStyle: 'preserve-3d',
					transform: camTransform(cam),
				}}
			>
				{children}
			</div>
		</AbsoluteFill>
	);
};

export type XForm = {
	x?: number;
	y?: number;
	z?: number;
	/** Rotation about world x (tip forward/back), degrees. */
	rx?: number;
	/** Rotation about world y (tilt left/right), degrees. */
	ry?: number;
	/** Rotation about vertical axis (spin on the floor), degrees. */
	rz?: number;
	s?: number;
	sx?: number;
	sy?: number;
	sz?: number;
};

export const xform = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, sx = 1, sy = 1, sz = 1}: XForm) =>
	`translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rz}deg) rotateY(${ry}deg) rotateX(${rx}deg) scale3d(${s * sx}, ${s * sy}, ${s * sz})`;

/** A positioned group in world space (origin = its pivot). */
export const Obj: React.FC<
	XForm & {children?: React.ReactNode; style?: CSSProperties; flat?: boolean; opacity?: number}
> = ({children, style, flat, opacity, ...t}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			transformStyle: flat ? 'flat' : 'preserve-3d',
			transform: xform(t),
			opacity,
			...style,
		}}
	>
		{children}
	</div>
);

/**
 * A flat 2D drawing (UI page, card face…) of size w×h centred on the pivot.
 * Its content is ordinary DOM, flattened into one plane.
 */
export const Plane: React.FC<{
	w: number;
	h: number;
	children?: React.ReactNode;
	style?: CSSProperties;
	/** Anchor: 'center' (default) or 'topleft'. */
	anchor?: 'center' | 'topleft';
	z?: number;
}> = ({w, h, children, style, anchor = 'center', z = 0}) => (
	<div
		style={{
			position: 'absolute',
			left: anchor === 'center' ? -w / 2 : 0,
			top: anchor === 'center' ? -h / 2 : 0,
			width: w,
			height: h,
			transform: z ? `translateZ(${z}px)` : undefined,
			...style,
		}}
	>
		{children}
	</div>
);

/**
 * Extruded rounded slab: a thin volume made of stacked layers so rounded
 * corners keep their thickness at oblique angles. Pivot = centre of the
 * bottom face; top face sits at z = d and carries `children`.
 */
export const Slab: React.FC<{
	w: number;
	h: number;
	d?: number;
	r?: number;
	/** Top face background. */
	face?: string;
	/** Side colour (bottom layer). */
	side?: string;
	/** Side colour near the top edge (gradient across layers). */
	sideTop?: string;
	layers?: number;
	children?: React.ReactNode;
	faceStyle?: CSSProperties;
	/** Draw a hairline border on the top face (like UI cards). */
	border?: string;
	/** Hide the side layers (e.g. when seen straight from above, saves work). */
	noSides?: boolean;
}> = ({w, h, d = 10, r = 12, face = '#fff', side = '#d9d9de', sideTop, layers, children, faceStyle, border, noSides}) => {
	const n = layers ?? Math.max(2, Math.min(12, Math.ceil(d / 1.6)));
	const sides: React.ReactNode[] = [];
	if (!noSides && d > 0) {
		for (let i = 0; i < n; i++) {
			const t = n === 1 ? 0 : i / (n - 1);
			const z = d * t * 0.985;
			sides.push(
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -w / 2,
						top: -h / 2,
						width: w,
						height: h,
						borderRadius: r,
						background: sideTop ? mixColor(side, sideTop, t) : side,
						transform: `translateZ(${z}px)`,
						backfaceVisibility: 'visible',
					}}
				/>,
			);
		}
	}
	return (
		<>
			{sides}
			<div
				style={{
					position: 'absolute',
					left: -w / 2,
					top: -h / 2,
					width: w,
					height: h,
					borderRadius: r,
					background: face,
					transform: `translateZ(${d}px)`,
					overflow: 'hidden',
					boxShadow: border ? `inset 0 0 0 1px ${border}` : undefined,
					...faceStyle,
				}}
			>
				{children}
			</div>
		</>
	);
};

/**
 * Soft contact shadow cast straight down onto a floor (z = floorZ + 0.5).
 * `height` is how far the caster's underside is above the floor: higher →
 * larger, softer, fainter, and pushed along the light direction.
 */
export const FloorShadow: React.FC<{
	x: number;
	y: number;
	floorZ?: number;
	w: number;
	h: number;
	r?: number;
	height: number;
	strength?: number;
	color?: string;
	/** Light direction offset per unit height (x,y). */
	light?: {x: number; y: number};
	rz?: number;
}> = ({x, y, floorZ = 0, w, h, r = 12, height, strength = 1, color = '20, 16, 40', light = {x: 0.12, y: 0.32}, rz = 0}) => {
	const hh = Math.max(0, height);
	const blur = 4 + hh * 0.28;
	const grow = 1 + hh * 0.0016;
	const op = (0.32 * strength) / (1 + hh * 0.006);
	return (
		<div
			style={{
				position: 'absolute',
				left: -w / 2,
				top: -h / 2,
				width: w,
				height: h,
				borderRadius: r,
				background: `rgba(${color}, ${op})`,
				filter: `blur(${blur}px)`,
				transform: `translate3d(${x + light.x * hh}px, ${y + light.y * hh}px, ${floorZ + 0.5}px) rotateZ(${rz}deg) scale(${grow})`,
			}}
		/>
	);
};

/** Mix two hex colours (#rrggbb) by t. */
export function mixColor(a: string, b: string, t: number): string {
	const pa = hex(a);
	const pb = hex(b);
	const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
	return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function hex(h: string): [number, number, number] {
	const s = h.replace('#', '');
	const n = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
	return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
