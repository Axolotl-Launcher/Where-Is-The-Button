/**
 * 「傍晚好」 — the evening voxel world the film ends in (Sh30–Sh31).
 *
 * Built from large CSS-3D boxes whose faces tile the real 16 px block
 * textures (public/images/blocks) — a few hundred faces in total — under an
 * evening sky: low square sun in the north, blocky clouds, hazy hills, a
 * cherry grove (pink leaves), a pond, drifting petals. The camera glides in
 * low over the grass, decelerating, and stops facing the sun through the
 * hanging blossoms.
 *
 * <World t={seconds since the world appears} /> fills its parent (1920 × 1080).
 */
import React, {CSSProperties} from 'react';
import {AbsoluteFill, Easing, staticFile} from 'remotion';
import {project} from '../film/camera';
import {clamp, ease, lerp, noise1, rand, track} from '../lib/anim';
import {Cam, Stage} from '../stage/Stage';
import {B, Box, CLOUDS, FaceKind, MatKey, PETAL_CARPETS, PLANTS, POND, SUN, TERRAIN_BOXES, TREES} from './layout';

/* ───────────────────────── palette ───────────────────────── */

const FOG = [247, 192, 178] as const; // horizon haze (peach-pink)
const SKY_STOPS: Array<[number, string]> = [
	// [elevation°, colour]
	[-6, '#f2b7a6'],
	[0, '#ffc79c'],
	[3.5, '#fbb7a3'],
	[9, '#f0a3b9'],
	[18, '#c99fcf'],
	[32, '#9b93cc'],
	[55, '#6f79bd'],
];

/** Per-orientation light: [black amount, tint rgb, tint alpha]. Sun low in the north, sky fill from above. */
const LIGHT: Record<FaceKind, [number, [number, number, number], number]> = {
	top: [0.0, [255, 170, 112], 0.16],
	north: [0.04, [255, 170, 110], 0.2],
	east: [0.16, [255, 160, 122], 0.1],
	west: [0.26, [92, 70, 150], 0.16],
	south: [0.3, [92, 70, 150], 0.2],
	bottom: [0.4, [92, 66, 140], 0.24],
};

/** One overlay colour equivalent to "black at a_b, then tint at a_t" (source-over). */
function lightOverlay(k: FaceKind): string {
	const [ab, rgb, at] = LIGHT[k];
	const A = 1 - (1 - ab) * (1 - at);
	if (A <= 0) return 'transparent';
	const c = rgb.map((v) => Math.round((v * at) / A));
	return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${A.toFixed(3)})`;
}

const tex = (n: string) => `url(${staticFile(`images/blocks/${n}.png`)})`;

type Layer = {img: string; repeat?: string; size?: string};
type Mat = {top?: Layer[]; side?: Layer[]; bottom?: Layer[]; backing?: string; solid?: Partial<Record<FaceKind, string>>};

const MAT: Record<MatKey, Mat> = {
	grass: {top: [{img: tex('grass_block_top')}], side: [{img: tex('grass_block_side'), repeat: 'repeat-x'}, {img: tex('dirt')}]},
	sand: {top: [{img: tex('sand')}], side: [{img: tex('sand')}]},
	dirt: {top: [{img: tex('dirt')}], side: [{img: tex('dirt')}]},
	water: {
		top: [
			{img: 'linear-gradient(to bottom, rgba(255, 200, 172, 0.66), rgba(222, 156, 192, 0.46) 48%, rgba(118, 124, 204, 0.3))', size: '100% 100%', repeat: 'no-repeat'},
			{img: tex('water_still')},
		],
	},
	leaves: {top: [{img: tex('cherry_leaves')}], side: [{img: tex('cherry_leaves')}], bottom: [{img: tex('cherry_leaves')}], backing: 'rgba(196, 98, 140, 0.62)'},
	log: {top: [{img: tex('cherry_log_top')}], side: [{img: tex('cherry_log')}]},
	hill: {solid: {top: '#8da567', south: '#5f7650', east: '#71885a', west: '#5a6e4e'}},
	hillFar: {solid: {top: '#9aa877', south: '#6f7a62', east: '#7d886a', west: '#6a735c'}},
	farGround: {solid: {top: '#7f9a5c'}},
	cloud: {solid: {bottom: 'rgba(255, 207, 196, 0.93)', south: 'rgba(255, 226, 214, 0.93)', east: 'rgba(255, 233, 216, 0.93)', west: 'rgba(250, 214, 210, 0.93)'}},
};

/* ───────────────────────── camera ───────────────────────── */

const glide = Easing.bezier(0.18, 0.62, 0.32, 1);
/** Where the glide comes to rest (world y): facing the grove, the sun under tree A's canopy. */
export const STOP_Y = 4 * B;

/** World camera for world time t (s). Starts fast (the launch rush), settles at the origin by ≈3.7 s. */
export function worldCam(t: number): Cam & {eye: {x: number; y: number; z: number}} {
	const u = glide(clamp(t / 3.7, 0, 1));
	const eye = {
		x: lerp(-1.6 * B, 0.2 * B, u),
		y: lerp(27 * B, STOP_Y, u),
		z: lerp(4.4 * B, 1.7 * B, ease.inOut(clamp(t / 3.4, 0, 1))),
	};
	// handheld float (very small), fading as it settles
	const live = 1 - 0.6 * clamp(t / 4, 0, 1);
	const pitch = track(t, [[0, 80], [0.6, 83.5, ease.out], [3.5, 91.6, ease.inOut]]) + 0.25 * noise1(t * 0.9, 3) * live;
	const yaw = track(t, [[0, -4], [3.6, 1.2, ease.inOut]]) + 0.3 * noise1(t * 0.7, 7) * live;
	const roll = 0;
	const persp = 900;
	const dist = 1000;
	const p = (pitch * Math.PI) / 180;
	const y = (yaw * Math.PI) / 180;
	return {
		x: eye.x - dist * Math.sin(p) * Math.sin(y),
		y: eye.y - dist * Math.sin(p) * Math.cos(y),
		z: eye.z - dist * Math.cos(p),
		dist,
		pitch,
		yaw,
		roll,
		persp,
		eye,
	};
}

/* ───────────────────────── faces ───────────────────────── */

const FACE_ORIGIN: CSSProperties = {position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', backfaceVisibility: 'hidden'};

const fogAt = (d: number) => 0.9 * (1 - Math.exp(-Math.max(0, d - 520) / 3600));
const fogRgba = (a: number) => `rgba(${FOG[0]}, ${FOG[1]}, ${FOG[2]}, ${a.toFixed(3)})`;

/** Face geometry in world px: size and transform (see Voxel.tsx conventions, origin at a corner). */
function faceGeom(k: FaceKind, b: {x0: number; x1: number; y0: number; y1: number; z0: number; z1: number}) {
	const w = b.x1 - b.x0;
	const d = b.y1 - b.y0;
	const h = b.z1 - b.z0;
	switch (k) {
		case 'top':
			return {w, h: d, t: `translate3d(${b.x0}px, ${b.y0}px, ${b.z1}px)`};
		case 'bottom':
			return {w, h: d, t: `translate3d(${b.x0}px, ${b.y1}px, ${b.z0}px) rotateX(180deg)`};
		case 'south':
			return {w, h, t: `translate3d(${b.x0}px, ${b.y1}px, ${b.z1}px) rotateX(-90deg)`};
		case 'north':
			return {w, h, t: `translate3d(${b.x1}px, ${b.y0}px, ${b.z1}px) rotateZ(180deg) rotateX(-90deg)`};
		case 'east':
			return {w: d, h, t: `translate3d(${b.x1}px, ${b.y1}px, ${b.z1}px) rotateZ(-90deg) rotateX(-90deg)`};
		case 'west':
			return {w: d, h, t: `translate3d(${b.x0}px, ${b.y0}px, ${b.z1}px) rotateZ(90deg) rotateX(-90deg)`};
	}
}

type WB = {x0: number; x1: number; y0: number; y1: number; z0: number; z1: number};

/** Fog layer for a face: a gradient along its depth axis for faces that span depth. */
function fogLayer(k: FaceKind, b: WB, eye: {x: number; y: number; z: number}): string {
	const cx = clamp(eye.x, b.x0, b.x1);
	const cy = clamp(eye.y, b.y0, b.y1);
	const dist = (x: number, y: number) => Math.hypot(x - eye.x, y - eye.y);
	if (k === 'top' || k === 'bottom' || k === 'east' || k === 'west') {
		const far = fogAt(dist(cx, b.y0));
		const near = fogAt(dist(cx, Math.min(b.y1, Math.max(b.y0, eye.y))));
		if (Math.abs(far - near) < 0.01) return `linear-gradient(${fogRgba(far)}, ${fogRgba(far)})`;
		// top: div top = north (far); bottom: div top = south (near); east: div left = south; west: div left = north
		if (k === 'top') return `linear-gradient(to bottom, ${fogRgba(far)}, ${fogRgba(near)})`;
		if (k === 'bottom') return `linear-gradient(to bottom, ${fogRgba(near)}, ${fogRgba(far)})`;
		if (k === 'east') return `linear-gradient(to right, ${fogRgba(near)}, ${fogRgba(far)})`;
		return `linear-gradient(to right, ${fogRgba(far)}, ${fogRgba(near)})`;
	}
	const y = k === 'south' ? b.y1 : b.y0;
	const a = fogAt(dist(cx, y));
	return `linear-gradient(${fogRgba(a)}, ${fogRgba(a)})`;
}

/** Leaves are translucent against a low sun: they glow instead of going dark on the shaded side. */
const LEAF_LIGHT: Partial<Record<FaceKind, string>> = {
	south: 'rgba(255, 176, 196, 0.16)',
	east: 'rgba(255, 190, 170, 0.12)',
	west: 'rgba(150, 90, 150, 0.16)',
	bottom: 'rgba(120, 60, 120, 0.3)',
};

function faceStyle(k: FaceKind, mat: Mat, fog: string): CSSProperties {
	const layers = (k === 'top' ? mat.top : k === 'bottom' ? mat.bottom ?? mat.top : mat.side) ?? [];
	const solid = mat.solid?.[k];
	const light = (mat === MAT.leaves ? LEAF_LIGHT[k] : undefined) ?? lightOverlay(k);
	const imgs = [fog, `linear-gradient(${light}, ${light})`, ...layers.map((l) => l.img)];
	const sizes = ['100% 100%', '100% 100%', ...layers.map((l) => l.size ?? `${B}px ${B}px`)];
	const repeats = ['no-repeat', 'no-repeat', ...layers.map((l) => l.repeat ?? 'repeat')];
	return {
		backgroundImage: imgs.join(', '),
		backgroundSize: sizes.join(', '),
		backgroundRepeat: repeats.join(', '),
		backgroundColor: solid ?? mat.backing,
		imageRendering: 'pixelated',
	};
}

/** Block box → world px; tiled pieces overlap their south/east neighbours by 1.5 px to hide AA seams. */
const toPx = (b: Box): WB => {
	const tiled = b.id.startsWith('g') || /^[LR][12]_/.test(b.id);
	const o = tiled ? 1.5 : 0;
	return {x0: b.x0 * B, x1: b.x1 * B + o, y0: b.y0 * B, y1: b.y1 * B + o, z0: b.z0 * B, z1: b.z1 * B};
};

const BoxFaces: React.FC<{b: WB; mat: MatKey; faces: FaceKind[]; eye: {x: number; y: number; z: number}; id: string}> = ({b, mat, faces, eye, id}) => (
	<>
		{faces.map((k) => {
			// cheap visibility: skip faces turned away from the eye
			if (k === 'south' && eye.y < b.y1) return null;
			if (k === 'north' && eye.y > b.y0) return null;
			if (k === 'east' && eye.x < b.x1) return null;
			if (k === 'west' && eye.x > b.x0) return null;
			if (k === 'top' && eye.z < b.z1) return null;
			if (k === 'bottom' && eye.z > b.z0) return null;
			const g = faceGeom(k, b);
			return <div key={id + k} style={{...FACE_ORIGIN, width: g.w, height: g.h, transform: g.t, ...faceStyle(k, MAT[mat], fogLayer(k, b, eye))}} />;
		})}
	</>
);

/* ───────────────────────── world parts ───────────────────────── */

function treeBoxes(): Array<{b: WB; mat: MatKey; faces: FaceKind[]; id: string}> {
	const out: Array<{b: WB; mat: MatKey; faces: FaceKind[]; id: string}> = [];
	for (const t of TREES) {
		const tb = {x0: t.x * B, x1: (t.x + 1) * B, y0: t.y * B, y1: (t.y + 1) * B, z0: t.z * B, z1: (t.z + t.trunk) * B};
		out.push({b: tb, mat: 'log', faces: ['south', 'east', 'west'], id: `tr${t.id}`});
		const cx0 = t.x + 0.5 + t.cx - t.w / 2;
		const cy0 = t.y + 0.5 + t.cy - t.d / 2;
		const cz = t.z + t.trunk;
		out.push({b: {x0: cx0 * B, x1: (cx0 + t.w) * B, y0: cy0 * B, y1: (cy0 + t.d) * B, z0: cz * B, z1: (cz + t.h) * B}, mat: 'leaves', faces: ['south', 'east', 'west', 'bottom'], id: `cn${t.id}`});
		if (t.w > 4) {
			out.push({
				b: {x0: (cx0 + 1) * B, x1: (cx0 + t.w - 1) * B, y0: (cy0 + 1) * B, y1: (cy0 + t.d - 1) * B, z0: (cz + t.h) * B, z1: (cz + t.h + 1) * B},
				mat: 'leaves',
				faces: ['south', 'east', 'west'],
				id: `ct${t.id}`,
			});
		}
		t.strands.forEach(([dx, dy, len], i) => {
			out.push({
				b: {x0: (cx0 + dx) * B, x1: (cx0 + dx + 1) * B, y0: (cy0 + dy) * B, y1: (cy0 + dy + 1) * B, z0: (cz - len) * B, z1: cz * B},
				mat: 'leaves',
				faces: ['south', 'east', 'west', 'bottom'],
				id: `st${t.id}${i}`,
			});
		});
	}
	return out;
}
const TREE_BOXES = treeBoxes();

/** Cross-quad plant (two vertical sprites), base at world px. */
const PlantSprite: React.FC<{x: number; y: number; z: number; img: string; s: number; fog: number}> = ({x, y, z, img, s, fog}) => (
	<>
		{[45, 135].map((a) => (
			<div
				key={a}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: s,
					height: s,
					transformOrigin: '0 0',
					transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${a}deg) rotateX(-90deg) translate(${-s / 2}px, ${-s}px)`,
					backgroundImage: `linear-gradient(${fogRgba(fog)}, ${fogRgba(fog)}), ${img}`,
					backgroundSize: '100% 100%, 100% 100%',
					imageRendering: 'pixelated',
					WebkitMaskImage: img,
					maskImage: img,
					maskSize: '100% 100%',
					WebkitMaskSize: '100% 100%',
				}}
			/>
		))}
	</>
);

/* ───────────────────────── sky ───────────────────────── */

function dirPoint(cam: Cam & {eye: {x: number; y: number; z: number}}, azDeg: number, elDeg: number, R = 1e5) {
	const az = (azDeg * Math.PI) / 180;
	const el = (elDeg * Math.PI) / 180;
	return project(cam, {x: cam.eye.x + R * Math.sin(az) * Math.cos(el), y: cam.eye.y - R * Math.cos(az) * Math.cos(el), z: cam.eye.z + R * Math.sin(el)});
}

const Sky: React.FC<{cam: Cam & {eye: {x: number; y: number; z: number}}}> = ({cam}) => {
	// Vertical bands by elevation (the camera never rolls).
	const stops = [...SKY_STOPS]
		.reverse()
		.map(([el, c]) => `${c} ${dirPoint(cam, 0, el).y.toFixed(1)}px`)
		.join(', ');
	const sun = dirPoint(cam, SUN.azimuth, SUN.elevation);
	return (
		<AbsoluteFill style={{background: `linear-gradient(to bottom, ${stops})`}}>
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle 760px at ${sun.x}px ${sun.y}px, rgba(255, 214, 160, 0.75), rgba(255, 186, 150, 0.34) 32%, rgba(255, 170, 160, 0) 100%)`}} />
			{/* the square sun: soft halo + core */}
			<div style={{position: 'absolute', left: sun.x - 86, top: sun.y - 86, width: 172, height: 172, background: 'rgba(255, 236, 190, 0.28)', boxShadow: '0 0 60px 30px rgba(255, 214, 160, 0.35)'}} />
			<div style={{position: 'absolute', left: sun.x - 46, top: sun.y - 46, width: 92, height: 92, background: '#fff6dc', boxShadow: '0 0 34px 12px rgba(255, 232, 180, 0.85)'}} />
		</AbsoluteFill>
	);
};

/* ───────────────────────── petals ───────────────────────── */

const PETAL_COLS = ['#f9c4dc', '#f4a6c9', '#ffd9ea', '#f08fbd'];

function petals(t: number, eye: {x: number; y: number; z: number}) {
	const out: React.ReactNode[] = [];
	for (let i = 0; i < 46; i++) {
		const x0 = (rand(i * 1.37) - 0.5) * 20 * B;
		const y0 = (-rand(i * 2.71 + 1) * 22 + 9) * B;
		const z0 = (0.6 + rand(i * 3.93 + 2) * 5.5) * B;
		const sp = 0.7 + rand(i * 5.1) * 0.6;
		const x = x0 + (36 * t + 26 * Math.sin(t * 1.3 * sp + i)) * sp;
		const y = y0 + 10 * Math.sin(t * 0.9 + i * 2.1);
		const z = z0 - 22 * t * sp + 8 * Math.sin(t * 2.1 * sp + i * 1.7);
		const ahead = eye.y - y;
		if (ahead < 70 || ahead > 26 * B) continue;
		const s = 8 + rand(i * 7.7) * 5;
		const fog = fogAt(Math.hypot(x - eye.x, y - eye.y));
		out.push(
			<div
				key={i}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: s,
					height: s * 0.8,
					borderRadius: '60% 10% 60% 10%',
					background: PETAL_COLS[i % PETAL_COLS.length],
					opacity: 1 - fog * 0.8,
					transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${t * 160 * sp + i * 40}deg) rotateY(${t * 110 * sp + i * 17}deg) rotateZ(${i * 33 + t * 40}deg)`,
				}}
			/>,
		);
	}
	return out;
}

/* ───────────────────────── the world ───────────────────────── */

export const World: React.FC<{t: number}> = ({t}) => {
	const cam = worldCam(t);
	const {eye} = cam;
	const lowest = ((90 - cam.pitch) * Math.PI) / 180 + Math.atan(540 / cam.persp);
	const nearGround = eye.z / Math.tan(Math.max(0.05, lowest)); // nearest visible ground ahead
	// Drop pieces that are (nearly) under or behind the eye: they cannot be seen, and
	// CSS 3D has no near plane. Rows are 2 blocks deep, side strips 4, so nothing straddles.
	const terrain = TERRAIN_BOXES.filter((b) => {
		const northAhead = eye.y - b.y0 * B;
		if (b.id.startsWith('g')) return northAhead > 0.75 * nearGround;
		if (b.id.startsWith('pond')) return northAhead > 0.6 * nearGround;
		if (/^[LR][12]_/.test(b.id)) return northAhead > 10 * B && b.y1 * B < eye.y - 8;
		return true;
	});
	const sun = dirPoint(cam, SUN.azimuth, SUN.elevation);
	const horizon = dirPoint(cam, 0, 0).y;
	const tCloud = t * 14;
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Sky cam={cam} />
			<Stage cam={cam}>
				{terrain.map((b) => (
					<BoxFaces key={b.id} id={b.id} b={toPx(b)} mat={b.mat} faces={b.faces} eye={eye} />
				))}
				{/* pond water: sky reflection over the real water texture */}
				{eye.y - POND.y0 * B > 0.6 * nearGround ? (
					<BoxFaces
						id="water"
						b={{x0: POND.x0 * B, x1: POND.x1 * B, y0: POND.y0 * B, y1: POND.y1 * B, z0: POND.surface * B - 2, z1: POND.surface * B}}
						mat="water"
						faces={['top']}
						eye={eye}
					/>
				) : null}
				{TREE_BOXES.map((tb) => (
					<BoxFaces key={tb.id} id={tb.id} b={tb.b} mat={tb.mat} faces={tb.faces} eye={eye} />
				))}
				{PETAL_CARPETS.map(([x, y, z], i) => (
					<div
						key={`pc${i}`}
						style={{
							...FACE_ORIGIN,
							width: B,
							height: B,
							transform: `translate3d(${x * B}px, ${y * B}px, ${z * B + 0.6}px)`,
							backgroundImage: `linear-gradient(${lightOverlay('top')}, ${lightOverlay('top')}), ${tex('pink_petals')}`,
							backgroundSize: '100% 100%',
							imageRendering: 'pixelated',
							WebkitMaskImage: tex('pink_petals'),
							WebkitMaskSize: '100% 100%',
							maskImage: tex('pink_petals'),
							maskSize: '100% 100%',
						}}
					/>
				))}
				{PLANTS.map((p, i) => {
					const ahead = eye.y - p.y * B;
					if (ahead < 0.5 * nearGround) return null;
					return <PlantSprite key={`pl${i}`} x={p.x * B} y={p.y * B} z={p.z * B} img={tex(p.tex)} s={B * p.s} fog={fogAt(Math.hypot(p.x * B - eye.x, ahead))} />;
				})}
				{CLOUDS.map((c, i) => (
					<BoxFaces
						key={`cl${i}`}
						id={`cl${i}`}
						b={{x0: c.x0 * B + tCloud, x1: c.x1 * B + tCloud, y0: c.y0 * B, y1: c.y1 * B, z0: c.z * B, z1: c.z * B + 0.5 * B}}
						mat="cloud"
						faces={['bottom', 'south', 'east', 'west']}
						eye={eye}
					/>
				))}
				{petals(t, eye)}
			</Stage>
			{/* atmosphere: horizon haze, light wrap around the sun, vignette */}
			<AbsoluteFill
				style={{
					background: `linear-gradient(to bottom, rgba(255, 205, 186, 0) ${horizon - 90}px, rgba(255, 205, 186, 0.32) ${horizon}px, rgba(255, 205, 186, 0) ${horizon + 170}px)`,
				}}
			/>
			<AbsoluteFill style={{background: `radial-gradient(circle 460px at ${sun.x}px ${sun.y}px, rgba(255, 226, 180, 0.55), rgba(255, 214, 170, 0.12) 55%, rgba(255, 226, 180, 0) 100%)`, mixBlendMode: 'screen'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(40, 20, 60, 0) 60%, rgba(40, 20, 60, 0.26) 100%)'}} />
		</AbsoluteFill>
	);
};
