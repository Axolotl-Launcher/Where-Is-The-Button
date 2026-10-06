/**
 * M7 · Return — Sh26, film 63.00–69.00 s (local 0–360).
 *
 * 63.00 the same tower wide M6 landed on (towerCam — the cut is one continuous camera). On
 *       the crisp screen-space glass toolbar (bottom-left, the 投影工坊's own overlay) the
 *       cursor presses 「层间距」; the tool context unfolds under it with the slider at
 *       100 % (63.05).
 * 63.50 grab the thumb. The hand drags left and passes each step's midpoint on the beat,
 *       so the thumb snaps under it (2 frames) and the number ticks 90 … 0 exactly on the
 *       notches 64.00 … 67.00; each notch ratchets the floor spacing 10 % closer, the floors
 *       converge UP onto Home and the camera follows the stack, never leaving the wide.
 * 66.00 (40 %) the voxel steps dissolve into the smooth slab, the label comes back; 66.25
 *       (30 %) the selection pink dissolves; 66.22–66.96 F5…F2 fold into Home from the bottom
 *       up (short hazy fades). F6 stops 150 under Home: through the empty socket it reads as
 *       a soft dark well with the hero waiting in it.
 * 67.10 release (the open hand becomes the arrow 2 frames later); the panel goes and the
 *       cursor glides to its Sh01 rest while the camera cranes to exactly flatCam(0) (68.00).
 * 68.00 the hero springs up through the socket, accelerating into contact, and is handed to
 *       the page DOM on the seat frame with a 2D snap (1.07 → 0.97 → 1.015 → 1, ≈ 220 ms).
 *       Hold to 69.00 — pixel-identical to M8's first frame (flatCam(0) + HomeFloor seated),
 *       cursor (arrow) at window (803, 548): 180 px left of / 120 px below the hero centre.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cam, Obj, Stage} from '../stage/Stage';
import {FONT} from '../theme/tokens';
import {ease, lerp, prog} from '../lib/anim';
import {flatCam} from '../film/camera';
import {FLOOR_Z, FloorKey} from '../film/timeline';
import {WS_POINTS, WsTool} from '../ui/pages/Workshop';
import {B, eyeOf, floorZAt, HCOLS, HERO_NW, LURCH, NOTCHES, sliderValue, spacingK, spacingSmooth, towerCam, wp} from './workshop/common';
import {boxSegs, fullLayer, HeroVoxel, ScreenLines, SelectionFaces} from './workshop/HeroVoxel';
import {SmoothHero} from './workshop/SmoothHero';
import {F6Floor, F6State} from './workshop/F6';
import {FOG_F6, TowerUpper} from './workshop/Tower';
import {cursorScreen, ScreenCursor, WsCursorOverlay, WsCursorState, WsKind} from './workshop/WsCursor';
import {hudPt, WsHud} from './workshop/Hud';

const F = (s: number) => Math.round((s - 63) * 60);
const ts = (f: number) => 63 + f / 60;
const ENV = 'linear-gradient(180deg, #f2eef2 0%, #d9d4dc 100%)';

const T = {
	click: 0,
	grab: F(63.5), // 30
	first: F(64.0), // 60
	last: F(67.0), // 240
	release: 246,
	morph: F(65.95), // 177
	selOut: F(66.22), // 193
	rise: 287, // 67.78 the spring up from the crouch
	seat: F(68.0), // 300 — contact: handed to the page (Sh01 DOM) with the snap
};

/* ─────────────────────────────── camera ─────────────────────────────── */

const HOME_CAM = flatCam(FLOOR_Z.home);

/** The tower wide following the converging stack, then a crane to exactly flatCam(0) by 68.00. */
function camAt(f: number): Cam {
	const t = ts(f);
	if (t >= 68.0) return HOME_CAM;
	const a = towerCam(t, spacingSmooth(t));
	const u = ease.inOut(Math.max(0, Math.min(1, (t - 66.3) / (68.0 - 66.3))));
	if (u <= 0) return a;
	const persp = Math.exp(Math.log(a.persp) * (1 - u) + Math.log(HOME_CAM.persp) * u);
	const scale = Math.exp(Math.log(a.persp / a.dist) * (1 - u) + Math.log(HOME_CAM.persp / HOME_CAM.dist) * u);
	return {x: lerp(a.x, HOME_CAM.x, u), y: lerp(a.y, HOME_CAM.y, u), z: lerp(a.z, HOME_CAM.z, u), pitch: a.pitch * (1 - u), yaw: a.yaw * (1 - u), roll: 0, persp, dist: persp / scale};
}

/* ─────────────────────────────── the stack ─────────────────────────────── */

/** F5 … F2 fold into Home from the bottom up: short fades (with haze, see TowerUpper) so they never double-expose. */
const fadeWin: Partial<Record<FloorKey, [number, number]>> = {
	seedmap: [66.22, 66.42],
	lab: [66.4, 66.6],
	instance: [66.58, 66.78],
	discover: [66.76, 66.96],
};
/** F6 stops short under Home so the empty socket reads as a hole until the hero springs up. */
const z6At = (k: number) => FLOOR_Z.workshop * k - 150 * (1 - k);
const UPPER: FloorKey[] = ['seedmap', 'lab', 'instance', 'discover'];

/* ─────────────────────────────── the slider ─────────────────────────────── */

const thumbX = (v: number) => WS_POINTS.track.x0 + (v / 100) * (WS_POINTS.track.x1 - WS_POINTS.track.x0);
const notchFrame = (tn: number) => Math.round((tn - 63) * 60);

/** The thumb (and the pink fill): snaps to each step over 2 frames, starting on the notch frame. */
function thumbValue(f: number): number {
	let v = 100;
	for (const [tn, val] of NOTCHES) {
		const df = f - notchFrame(tn);
		if (df >= 0) v += (val - v) * (df >= 1 ? 1 : 0.65);
	}
	return v;
}

/**
 * The dragging hand's slider value: it passes the midpoint between two steps exactly on each
 * notch (so the thumb snaps to under it), accelerating with the notches; monotone cubic.
 */
const HAND: Array<[number, number]> = [
	[63.5, 100],
	[64.0, 95],
	[64.5, 85],
	[65.0, 75],
	[65.5, 65],
	[65.75, 55],
	[66.0, 45],
	[66.25, 35],
	[66.5, 25],
	[66.75, 15],
	[67.0, 5],
	[67.08, 0],
];
const HAND_M = (() => {
	const n = HAND.length;
	const d = HAND.slice(0, -1).map(([x0, y0], i) => (HAND[i + 1][1] - y0) / (HAND[i + 1][0] - x0));
	const h = HAND.slice(0, -1).map(([x0], i) => HAND[i + 1][0] - x0);
	const m = new Array<number>(n).fill(0);
	for (let i = 1; i < n - 1; i++) {
		if (d[i - 1] * d[i] <= 0) continue;
		const w1 = 2 * h[i] + h[i - 1];
		const w2 = h[i] + 2 * h[i - 1];
		m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
	}
	return m; // ends at rest (0)
})();
function handValue(t: number): number {
	if (t <= HAND[0][0]) return HAND[0][1];
	const n = HAND.length;
	if (t >= HAND[n - 1][0]) return HAND[n - 1][1];
	let i = 0;
	while (t > HAND[i + 1][0]) i++;
	const [x0, y0] = HAND[i];
	const [x1, y1] = HAND[i + 1];
	const h = x1 - x0;
	const u = (t - x0) / h;
	const u2 = u * u;
	const u3 = u2 * u;
	return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * HAND_M[i] + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * HAND_M[i + 1];
}

/* ─────────────────────────────── the cursor ─────────────────────────────── */

const REST = {x: 983 - 180, y: 428 + 120};
const REST_W = wp(REST.x, REST.y, 0, FLOOR_Z.home);
const OVERLAY = {depthScale: 0.22, minScale: 0.7, maxScale: 1.25};
/** From the glass toolbar's thumb (screen space) to the Sh01 rest point on Home (world). */
const LEAVE = {from: 250, to: 296};

function cursorState(f: number): Omit<WsCursorState, 'x' | 'y' | 'z'> {
	let kind: WsKind = 'pointer';
	let next: WsKind | undefined;
	let mixT = 0;
	if (f >= 22 && f < T.grab) {
		next = 'grab';
		mixT = prog(f, 22, 27, ease.linear);
	} else if (f >= T.grab && f < T.release) {
		kind = 'grab';
		next = 'grabbing';
		mixT = prog(f, T.grab, T.grab + 3, ease.linear);
	} else if (f >= T.release) {
		// let go: the hand opens, and over empty UI it is the arrow 2 frames later
		kind = f < T.release + 1 ? 'grabbing' : f < T.release + 2 ? 'grab' : 'arrow';
		next = f < T.release + 2 ? (f < T.release + 1 ? 'grab' : 'arrow') : undefined;
		mixT = f < T.release + 2 ? 0.5 : 0;
	}
	const press = Math.max(0, 1 - Math.abs(f - 1) / 4) + (f >= T.grab && f < T.release ? 0.35 : 0);
	return {kind, next, mixT, press};
}

/** Screen position of the cursor while it works the glass panel (f < LEAVE.to). */
function cursorPanel(f: number) {
	const sp = hudPt(WS_POINTS.spacing.x, WS_POINTS.spacing.y);
	const thumbAt = (v: number) => hudPt(thumbX(v), WS_POINTS.track.y);
	if (f < T.grab) {
		const m = prog(f, 8, 26, ease.inOut);
		const th = thumbAt(100);
		return {x: lerp(sp.x, th.x, m), y: lerp(sp.y, th.y, m)};
	}
	return thumbAt(handValue(ts(f)));
}

/* ─────────────────────────── occlusion by folding floors ─────────────────────────── */

const floorAlpha = (key: FloorKey, t: number) => {
	const w = fadeWin[key];
	return w ? 1 - prog(t, w[0], w[1], ease.inOut) : 1;
};

/** 1 when the line of sight to p crosses an (still opaque) upper floor's footprint. */
function hiddenAt(f: number, p: (f: number) => {x: number; y: number; z: number}): number {
	const t = ts(f);
	const k = spacingK(t);
	const e = eyeOf(camAt(f));
	const q = p(f);
	for (const key of UPPER) {
		if (floorAlpha(key, t) < 0.5) continue;
		const z = floorZAt(key, k);
		if ((e.z - z) * (q.z - z) >= 0) continue;
		const s = (z - e.z) / (q.z - e.z);
		const x = e.x + (q.x - e.x) * s;
		const y = e.y + (q.y - e.y) * s;
		if (Math.abs(x) <= 720 && Math.abs(y) <= 405) return 1;
	}
	return 0;
}

/** Smoothed visibility (0..1) of a world point that rides F6. */
function visibleAt(f: number, p: (f: number) => {x: number; y: number; z: number}) {
	let v = 0;
	for (let i = -4; i <= 4; i++) v += 1 - hiddenAt(f + i, p);
	return v / 9;
}

const heroAtF = (f: number) => wp(983, 428, 6, z6At(spacingK(ts(f))));

/** Window point on F6 seen through the centre of Home's socket (the eye → socket ray meets F6). */
function throughSocket(cam: Cam, z6: number) {
	const e = eyeOf(cam);
	const s = wp(983, 428, 0, FLOOR_Z.home);
	const k = (z6 - e.z) / (s.z - e.z);
	return {x: e.x + (s.x - e.x) * k + 720, y: e.y + (s.y - e.y) * k + 405};
}

/* ─────────────────────────────── the seat ─────────────────────────────── */

/** Rise profile from the crouch into contact: starts at half speed and accelerates (end slope 1.1). */
const riseP = (u: number) => {
	const v = Math.max(0, Math.min(1, u));
	const v2 = v * v;
	const v3 = v2 * v;
	return (v3 - 2 * v2 + v) * 0.5 + (-2 * v3 + 3 * v2) + (v3 - v2) * 1.1;
};
/** 2D snap of the seated hero: 1.07 on contact, two damped cycles over ≈ 14 frames; exactly 1 from ≈ 330 on. */
const snapAt = (f: number) => (f >= T.seat ? 0.07 * Math.exp(-(f - T.seat) / 4.5) * Math.cos((2 * Math.PI * (f - T.seat)) / 7) : 0);

/* ─────────────────────────────── composition ─────────────────────────────── */

export const M7: React.FC = () => {
	const f = useCurrentFrame();
	const t = ts(f);
	const k = spacingK(t);
	const cam = camAt(f);
	const zOf = (key: FloorKey) => (key === 'workshop' ? z6At(k) : floorZAt(key, k));
	const z6 = zOf('workshop');
	const alphaOf = (key: FloorKey) => floorAlpha(key, t);
	const value = f < 2 ? 100 : sliderValue(t);
	const thumbV = f < 2 ? 100 : thumbValue(f);
	const thumb = f >= 22 && f < T.release + 4 ? prog(f, 22, 30, ease.out) : f >= T.release + 4 ? 1 - prog(f, T.release + 4, T.release + 16, ease.out) : 0;
	const tool: WsTool = f >= 2 ? 'layer-spacing' : 'box';
	const toolHover: WsTool | null = f < 8 ? 'layer-spacing' : null;
	const toolPress = Math.max(0, 1 - Math.abs(f - 1) / 4);
	const ctxIn = prog(f, 2, 9, ease.out);
	const st: F6State = {
		loaded: 1,
		tool,
		toolHover,
		toolPress,
		spacing: f >= 2 ? value : null,
		thumbValue: thumbV,
		ctxIn,
		thumb,
		sel: {count: 600, pos: [31, 1, 1]},
		grid: 1,
		bounds: true,
	};
	// the hero rides F6: voxel → smooth slab, sliding back over the socket, then springs up into it
	const lurch = LURCH * (1 - prog(f, 150, 232, ease.inOut));
	const origin = wp(HERO_NW.x + lurch, HERO_NW.y, 0, z6);
	const vAlpha = 1 - prog(f, T.morph, T.morph + 22, ease.inOut);
	const sAlpha = prog(f, T.morph + 2, T.morph + 22, ease.inOut);
	const label = prog(f, T.morph + 12, T.morph + 40, ease.inOut);
	const selA = 1 - prog(f, T.selOut, T.selOut + 18, ease.inOut);
	// seat: crouch 67.57, spring up 67.78 accelerating into contact on 68.00, snap 1.07 → 1
	const crouch = prog(f, 274, T.rise, ease.out) * (1 - prog(f, T.rise, T.rise + 5, ease.in));
	const zSeat = -8;
	const heroZ = f < T.rise ? z6 : lerp(z6, zSeat, riseP((f - T.rise) / (T.seat - T.rise)));
	const stretch = f >= T.rise && f < T.seat ? Math.sin(Math.PI * prog(f, T.rise, T.seat, ease.linear)) : 0;
	const sxy = 1 + 0.05 * crouch - 0.03 * stretch;
	const sz = 1 - 0.22 * crouch + 0.18 * stretch;
	const seated = f >= T.seat;
	const snap = snapAt(f);
	const hc = wp(983 + lurch, 428, 0, z6);
	const selOrigin = wp(HERO_NW.x + LURCH * (1 - prog(f, 150, 232, ease.inOut)), HERO_NW.y, 0, z6);
	const segs = selA > 0 ? boxSegs({x: selOrigin.x, y: selOrigin.y, z: selOrigin.z}, {x: selOrigin.x + HCOLS * B, y: selOrigin.y + 10 * B, z: selOrigin.z + 2 * B}) : [];
	const selVis = selA > 0 ? visibleAt(f, heroAtF) : 1;
	// the dark well on F6 where the line of sight through Home's socket lands (from as F2 folds away)
	const wellA = prog(t, 66.8, 66.92, ease.inOut);
	const socketWell = wellA > 0 ? {a: wellA, ...throughSocket(cam, z6)} : null;
	// the cursor: on the glass panel, then home to the Sh01 rest point (exactly the world overlay from LEAVE.to)
	const cs = cursorState(f);
	const g = prog(f, LEAVE.from, LEAVE.to, ease.inOut);
	const atRest = f >= LEAVE.to;
	const panel = atRest ? null : cursorPanel(Math.min(f, T.release + 2));
	const rest = atRest ? null : cursorScreen(cam, REST_W, OVERLAY);
	const scr =
		panel && rest
			? {x: lerp(panel.x, rest.x, g), y: lerp(panel.y, rest.y, g) + 36 * Math.sin(Math.PI * g), size: lerp(44, rest.size, g)}
			: null;
	return (
		<AbsoluteFill style={{background: ENV, fontFamily: FONT.ui}}>
			<Stage cam={cam} background={ENV}>
				<TowerUpper cam={cam} z={zOf} alpha={alphaOf} fogK={k} seated={seated} heroScale={1 + snap} homeRadius={18 * (1 - prog(f, 270, 300, ease.inOut))} />
				{f < T.seat + 10 ? <F6Floor z={z6} st={st} fog={FOG_F6 * k} socketWell={socketWell} /> : null}
				{vAlpha > 0 ? (
					<Obj x={origin.x} y={origin.y} z={origin.z}>
						<HeroVoxel layer={[fullLayer, fullLayer]} opacity={vAlpha} />
					</Obj>
				) : null}
				{selA > 0 ? (
					<Obj x={selOrigin.x} y={selOrigin.y} z={selOrigin.z}>
						<SelectionFaces box={{x0: 0, y0: 0, z0: 0, x1: HCOLS * B, y1: 10 * B, z1: 2 * B}} opacity={selA} />
					</Obj>
				) : null}
				{sAlpha > 0 && !seated ? (
					<SmoothHero
						x={hc.x}
						y={hc.y}
						z={heroZ}
						floorZ={z6}
						d={8}
						alpha={sAlpha}
						label={label}
						sx={sxy}
						sy={sxy}
						sz={sz}
						cssShadow={false}
						shadow={f < T.rise}
						shadowStrength={0.6}
					/>
				) : null}
			</Stage>
			<ScreenLines cam={cam} segs={segs} opacity={selA * selVis * 0.65} width={1.6} />
			<ScreenLines cam={cam} segs={segs} opacity={selA * selVis} color="#ff8cc6" width={1.4} />
			<WsHud
				inT={1}
				ctxT={ctxIn}
				outT={prog(f, T.release + 4, T.release + 24, ease.inOut)}
				tool={tool}
				hover={toolHover}
				press={toolPress}
				value={value}
				thumbValue={thumbV}
				thumb={thumb}
			/>
			{atRest ? (
				<WsCursorOverlay cam={cam} cursor={{...REST_W, ...cs}} {...OVERLAY} />
			) : scr ? (
				<ScreenCursor x={scr.x} y={scr.y} size={scr.size} cursor={cs} />
			) : null}
		</AbsoluteFill>
	);
};
