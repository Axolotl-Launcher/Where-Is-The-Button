/**
 * M5 choreography: every actor as a pure function of the module-local frame
 * (frame 0 = film 40.00 s). See design/STORYBOARD.md §4 M5 and §5.
 *
 * Map staging (all derived from the product's own math, SeedMap.tsx):
 *   the hero lies on block (120, −64) — the popup's 「X 120, Z −64」 —
 *   and moves exactly like a map glyph: it follows pans, keeps its size
 *   through zooms. Rest view V0 (zoom 1) → 1:1 drag by D → two cursor-
 *   anchored wheel zooms (250 ms cubic ease-out, −0.5 each) at A1, A2 →
 *   V3 (zoom 0, 「1 像素 = 1 格」) where block (120, −64) sits at the shaft
 *   point, window (983, 428).
 */
import {Cam} from '../../stage/Stage';
import {bump, clamp, ease, EaseFn, lerp, noise1, prog, track, wobble} from '../../lib/anim';
import {flatCam} from '../../film/camera';
import {FLOOR_Z, SHAFT} from '../../film/timeline';
import {CursorKind} from '../../characters/Cursor';
import {MapView, MarkerDraw, PopupState, REST_VIEW, SM, blockToWin, popupBox} from '../../ui/pages/SeedMap';
import {MAP_HERO_BLOCK, MAP_S1} from '../../ui/pages/seedMapData';
import {C} from '../../theme/tokens';
import {CAM_PRESS, P2, cursorDive, pushDiveCam, sinkDrop} from './press2';

export const F5 = FLOOR_Z.seedmap;
export const F6 = FLOOR_Z.workshop;

/** Film seconds → M5-local frame. */
export const at = (s: number) => Math.round((s - 40) * 60);

export const T = {
	land: at(41.3),
	skid: at(41.5),
	still: at(42.3),
	flat: at(42.6),
	grab: at(43.2),
	dragEnd: at(44.0),
	zoom1: at(44.3),
	zoom2: at(44.8),
	found: at(45.2),
	rclick: at(45.5),
	ibeam: at(45.8),
	typeStart: at(46.0),
	commit: at(46.9),
	swatch: at(47.4),
	toAdd: at(47.6),
	add: at(48.0),
	pinDone: at(48.4),
	toast: at(48.5),
	heart: at(49.5),
	press: at(50.0),
	sink: at(50.15),
	hole: at(50.8),
	droop: at(51.0),
	dive: at(51.3),
	end: 690,
} as const;

const easeOutCubic: EaseFn = (t) => 1 - Math.pow(1 - t, 3);
const smooth: EaseFn = (t) => t * t * (3 - 2 * t);

// ------------------------------------------------------------------ map view

const CV = {x: SM.cx, y: SM.cy};
export const V0: MapView = REST_VIEW;
export const DRAG = {from: {x: 1292, y: 652}, d: {x: -110, y: -60}};
export const A1 = {x: 1099, y: 590};
export const A2 = {x: 1031, y: 528};
const ZOOM_FRAMES = 15; // 250 ms

/** Cursor-anchored zoom: the block under `a` stays under `a`. */
function anchored(v: MapView, a: {x: number; y: number}, zoom: number): MapView {
	const s0 = Math.pow(4, v.zoom);
	const s = Math.pow(4, zoom);
	const bx = v.cx + (a.x - CV.x) * s0;
	const bz = v.cz + (a.y - CV.y) * s0;
	return {cx: bx - (a.x - CV.x) * s, cz: bz - (a.y - CV.y) * s, zoom};
}

/** Drag progress → cursor/map offset (screen px), with a hand-drawn bow. */
export function dragOffset(f: number) {
	const p = prog(f, T.grab + 2, T.dragEnd, ease.inOut);
	const bow = Math.sin(Math.PI * p) * 7;
	// perpendicular to D (D points up-left; bow bulges down-left)
	const len = Math.hypot(DRAG.d.x, DRAG.d.y);
	const nx = -DRAG.d.y / len;
	const ny = DRAG.d.x / len;
	return {x: DRAG.d.x * p - nx * bow, y: DRAG.d.y * p - ny * bow};
}

export const V1: MapView = {cx: V0.cx - DRAG.d.x * 4, cz: V0.cz - DRAG.d.y * 4, zoom: 1};
export const V2: MapView = anchored(V1, A1, 0.5);
export const V3: MapView = anchored(V2, A2, 0);

export function viewAt(f: number): MapView {
	if (f < T.zoom1) {
		const o = dragOffset(f);
		return {cx: V0.cx - o.x * 4, cz: V0.cz - o.y * 4, zoom: 1};
	}
	if (f < T.zoom2) return anchored(V1, A1, 1 - 0.5 * easeOutCubic(clamp((f - T.zoom1) / ZOOM_FRAMES, 0, 1)));
	return anchored(V2, A2, 0.5 - 0.5 * easeOutCubic(clamp((f - T.zoom2) / ZOOM_FRAMES, 0, 1)));
}

/** Window position of the hero's map block under a view. */
export const heroOnMap = (v: MapView) => blockToWin(v, MAP_HERO_BLOCK.x, MAP_HERO_BLOCK.z);

// scale-1 tiles stream in nearest-first from the first zoom's anchor
const TILE_LOAD = (() => {
	const s0 = 4;
	const bx = V1.cx + (A1.x - CV.x) * s0;
	const bz = V1.cz + (A1.y - CV.y) * s0;
	const list: Array<{k: string; d: number}> = [];
	for (let tx = MAP_S1.x0; tx < MAP_S1.x0 + MAP_S1.w; tx += 256)
		for (let tz = MAP_S1.z0; tz < MAP_S1.z0 + MAP_S1.h; tz += 256) list.push({k: `${tx}_${tz}`, d: Math.hypot(tx + 128 - bx, tz + 128 - bz)});
	list.sort((a, b) => a.d - b.d);
	const m = new Map<string, number>();
	list.forEach((t, i) => m.set(t.k, T.zoom1 + 2 + Math.floor(i / 4) * 2.2));
	return m;
})();

const TILES_DONE = Math.max(...TILE_LOAD.values());

/** Streaming gate for the scale-1 tiles; undefined once every tile has arrived (one image). */
export const s1Gate = (f: number) =>
	f > TILES_DONE ? undefined : (tx: number, tz: number) => f >= (TILE_LOAD.get(`${tx}_${tz}`) ?? Infinity);

/** Status pill: visible while a visible scale-1 tile is still missing. */
export function loadingAt(f: number): number | null {
	if (f <= T.zoom1 || f > T.zoom2) return null;
	const v = viewAt(f);
	if (v.zoom >= 1) return null;
	const s = Math.pow(4, v.zoom);
	const minBx = v.cx - (SM.cx - SM.canvas.x) * s;
	const maxBx = v.cx + (SM.canvas.x + SM.canvas.w - SM.cx) * s;
	const minBz = v.cz - (SM.cy - SM.canvas.y) * s;
	const maxBz = v.cz + (SM.canvas.y + SM.canvas.h - SM.cy) * s;
	let missing = false;
	for (let tx = MAP_S1.x0; tx < MAP_S1.x0 + MAP_S1.w; tx += 256)
		for (let tz = MAP_S1.z0; tz < MAP_S1.z0 + MAP_S1.h; tz += 256) {
			if (tx + 256 < minBx || tx > maxBx || tz + 256 < minBz || tz > maxBz) continue;
			if (f < (TILE_LOAD.get(`${tx}_${tz}`) ?? 0)) missing = true;
		}
	return missing ? (f - T.zoom1) * 6 : null;
}

// ------------------------------------------------------------------ camera

/** Cubic Hermite (Catmull-Rom tangents) through keyed values; zero velocity at the last key. */
function spline(f: number, keys: Array<[number, number]>): number {
	const n = keys.length;
	if (f <= keys[0][0]) return keys[0][1];
	if (f >= keys[n - 1][0]) return keys[n - 1][1];
	let i = 0;
	while (f > keys[i + 1][0]) i++;
	const [f1, p1] = keys[i];
	const [f2, p2] = keys[i + 1];
	const span = f2 - f1;
	const slope = (a: number) => {
		if (a === n - 1) return 0;
		const [fa0, pa0] = keys[Math.max(0, a - 1)];
		const [fa1, pa1] = keys[Math.min(n - 1, a + 1)];
		return (pa1 - pa0) / (fa1 - fa0);
	};
	const m1 = slope(i) * span;
	const m2 = slope(i + 1) * span;
	const t = (f - f1) / span;
	const t2 = t * t;
	const t3 = t2 * t;
	return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2;
}

function splineCam(f: number, keys: Array<[number, Cam]>): Cam {
	const field = (k: keyof Cam) => spline(f, keys.map(([fr, c]) => [fr, c[k]] as [number, number]));
	return {x: field('x'), y: field('y'), z: field('z'), dist: field('dist'), pitch: field('pitch'), yaw: field('yaw'), roll: 0, persp: field('persp')};
}

const lerpCamE = (a: Cam, b: Cam, t: number): Cam => ({
	x: lerp(a.x, b.x, t),
	y: lerp(a.y, b.y, t),
	z: lerp(a.z, b.z, t),
	dist: lerp(a.dist, b.dist, t),
	pitch: lerp(a.pitch, b.pitch, t),
	yaw: lerp(a.yaw, b.yaw, t),
	roll: 0,
	persp: lerp(a.persp, b.persp, t),
});

const W = (wx: number, wy: number) => ({x: wx - 720, y: wy - 405});

/** Real-app framing helper (pitch 0) on F5. */
const flat = (wx: number, wy: number, scale: number, persp = 1000): Cam => flatCam(F5, {wx, wy, scale, persp});

const CAM_OPEN: Array<[number, Cam]> = [
	[0, {...W(1200, 320), z: F5, dist: 880, pitch: 56, yaw: 0, roll: 0, persp: 900}],
	[36, {...W(1240, 560), z: F5, dist: 520, pitch: 42, yaw: 0, roll: 0, persp: 930}],
	[78, {...W(1215, 565), z: F5, dist: 520, pitch: 28, yaw: 0, roll: 0, persp: 960}],
	[116, {...W(1060, 520), z: F5, dist: 760, pitch: 9, yaw: 0, roll: 0, persp: 990}],
	[T.flat, {...flat(720, 405, 4 / 3), roll: 0}],
];

// ------------------------------------------------------------------ arrival (40.00–40.40, frames 0–24)
//
// The dive from the Lab's trapdoor (M4, src/scenes/instance/choreo.ts) runs straight through the cut:
// M4 ends exactly on CUT with velocity CUT_V, and frames 0–ARRIVE_END continue from that state into the
// opening spline (joined with the spline's own position and velocity), so 40.00 has no stall. The camera
// is interpolated as eye + look-at point (roll 0). Frames ≥ ARRIVE_END are untouched.

export type V3 = {x: number; y: number; z: number};
/** A camera as eye + look-at point (roll 0). Also used for per-frame velocities. */
export type CamPose = {eye: V3; tgt: V3; persp: number};

/** Eye + look-at of a camera. */
export function poseOf(c: Cam): CamPose {
	const p = (c.pitch * Math.PI) / 180;
	const y = (c.yaw * Math.PI) / 180;
	const h = c.dist * Math.sin(p);
	return {eye: {x: c.x + h * Math.sin(y), y: c.y + h * Math.cos(y), z: c.z + c.dist * Math.cos(p)}, tgt: {x: c.x, y: c.y, z: c.z}, persp: c.persp};
}

/** The camera looking from `eye` at `tgt` (roll 0). */
export function camOf(q: CamPose): Cam {
	const dx = q.eye.x - q.tgt.x;
	const dy = q.eye.y - q.tgt.y;
	const dz = q.eye.z - q.tgt.z;
	const h = Math.hypot(dx, dy);
	return {...q.tgt, dist: Math.hypot(h, dz), pitch: (Math.atan2(h, dz) * 180) / Math.PI, yaw: (Math.atan2(dx, dy) * 180) / Math.PI, roll: 0, persp: q.persp};
}

const poseVec = (q: CamPose) => [q.eye.x, q.eye.y, q.eye.z, q.tgt.x, q.tgt.y, q.tgt.z, q.persp];
const vecPose = (a: number[]): CamPose => ({eye: {x: a[0], y: a[1], z: a[2]}, tgt: {x: a[3], y: a[4], z: a[5]}, persp: a[6]});

/** (a − b)·k, component-wise. */
export const poseDiff = (a: CamPose, b: CamPose, k = 1): CamPose => {
	const bv = poseVec(b);
	return vecPose(poseVec(a).map((v, i) => (v - bv[i]) * k));
};

/** Scalar cubic Hermite on [f0, f1] with per-frame end velocities. */
export function hermite1(f: number, f0: number, p0: number, v0: number, f1: number, p1: number, v1: number): number {
	const span = f1 - f0;
	const t = clamp((f - f0) / span, 0, 1);
	const t2 = t * t;
	const t3 = t2 * t;
	return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * span * v0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * span * v1;
}

/** Cubic Hermite between keyed camera poses (velocities per frame). */
export function hermitePose(f: number, f0: number, p0: CamPose, v0: CamPose, f1: number, p1: CamPose, v1: CamPose): CamPose {
	const a = poseVec(p0);
	const va = poseVec(v0);
	const b = poseVec(p1);
	const vb = poseVec(v1);
	return vecPose(a.map((_, i) => hermite1(f, f0, a[i], va[i], f1, b[i], vb[i])));
}

const W3 = (wx: number, wy: number, h: number): V3 => ({x: wx - 720, y: wy - 405, z: F5 + h});

/** The arrival hands over to the opening spline here (40.40). */
export const ARRIVE_END = 24;
/** Mid-dive key (M4's frame 556 = −14 here): the eye, already south of F4's front edge, drops below F4. */
export const DIVE_MID: {f: number; pose: CamPose} = {f: -14, pose: {eye: W3(1292, 1012, 690), tgt: W3(1296, 476, 230), persp: 935}};
/** The 40.00 camera: pitch 56°, persp 900, look-at raised 100 above the map so the falling hero sits near frame centre. */
export const CUT_CAM: Cam = {...W(1260, 360), z: F5 + 100, dist: 820, pitch: 56, yaw: 0, roll: 0, persp: 900};
export const CUT: CamPose = poseOf(CUT_CAM);
const ARRIVE_P = poseOf(splineCam(ARRIVE_END, CAM_OPEN));
const ARRIVE_V = poseDiff(poseOf(splineCam(ARRIVE_END + 0.5, CAM_OPEN)), poseOf(splineCam(ARRIVE_END - 0.5, CAM_OPEN)));
/** Camera velocity at 40.00 (per frame): the Catmull-Rom tangent through the mid-dive key and the join. */
export const CUT_V: CamPose = poseDiff(ARRIVE_P, DIVE_MID.pose, 1 / (ARRIVE_END - DIVE_MID.f));

/** 40.00–40.40: the dive's momentum carried into the opening spline. */
export const arrivalCam = (f: number): Cam => camOf(hermitePose(f, 0, CUT, CUT_V, ARRIVE_END, ARRIVE_P, ARRIVE_V));

/**
 * Around the cut the falling card is presented to the lens: an rx bias toward the camera and half the
 * flutter for 39.80–40.20, eased back to the plain flutter by 40.40. T = seconds from 40.00 (negative in M4);
 * both modules apply it, so the pose is continuous across the cut.
 */
export function fallTilt(T: number) {
	const w = smooth(clamp((T + 0.45) / 0.25, 0, 1)) * (1 - smooth(clamp((T - 0.18) / 0.22, 0, 1)));
	return {rx: -30 * w, amp: 1 - 0.5 * w};
}

/** The cursor at 40.00 (diving after the hero, ≈ 90 above it and in frame) and its per-frame velocity, shared with M4's dive. */
export const CUT_CURSOR = {wx: 1280, wy: 628, e: 450, rot: -14};
export const CUT_CURSOR_V = {wx: 0, wy: 0.4, e: -12, rot: 0.2};

/**
 * On-screen cursor size (px) around the cut, for a hotspot at perspective scale k. M4 draws the diving cursor
 * as a camera-facing sprite (33 world px); from 39.93 it hands it to the screen overlay at that same size, and
 * frames 0–ARRIVE_END here blend it to M5's own depth-scaled overlay size. Both modules call this.
 */
export function arrivalCursorPx(f: number, k: number, pitch: number) {
	const tilt = clamp(pitch / 25, 0, 1);
	const own = 44 * clamp(1 + (k / (4 / 3) - 1) * 0.55 * tilt, 0.8, 1.3);
	return lerp(33 * k, own, smooth(clamp(f / ARRIVE_END, 0, 1)));
}

/** Flat-shot keys after the opening (camTrack-style with eased segments). */
const FLAT_KEYS: Array<[number, Cam, EaseFn?]> = [
	[T.flat, flat(720, 405, 4 / 3)],
	[T.grab - 6, flat(720, 405, 4 / 3)],
	[T.found, flat(888, 482, 1.74), ease.inOut],
	[T.rclick, flat(888, 482, 1.74)],
	[T.rclick + 46, flat(1062, 496, 2.6), ease.inOut],
	[T.add - 4, flat(1062, 496, 2.6)],
	// pin, popup and the toast (lifted above the bottom toolbar) in one frame
	[T.toast + 10, flat(1005, 548, 2.3), ease.inOut],
	[P2.shaftFrom, flat(1005, 548, 2.3)],
	// 48.97–49.43: onto the shaft as the cursor heads for the pin; held there through the heartbeat and press 2
	[P2.shaftTo, CAM_PRESS, ease.inOut],
];

/**
 * Hand-off camera (51.50 − 1 frame): in the map-hole shaft, below F5, looking down at F6.
 * press2.ts pushDiveCam reaches it exactly on M5's last frame (eye still dropping ≈ 55 px/frame).
 */
export const CAM_END: Cam = {...W(SHAFT.x, SHAFT.y), z: F6, dist: 600, pitch: 0, yaw: 0, roll: 0, persp: 800};

export function camAt(f: number): Cam {
	if (f < ARRIVE_END) return arrivalCam(f);
	if (f <= T.flat) return splineCam(f, CAM_OPEN);
	// 50.20 →: the slow vertigo push gathers into the dive (no hold) and lands on CAM_END on the last frame
	if (f > P2.push) return pushDiveCam(f);
	let i = 0;
	while (i < FLAT_KEYS.length - 1 && f > FLAT_KEYS[i + 1][0]) i++;
	if (i >= FLAT_KEYS.length - 1) return FLAT_KEYS[FLAT_KEYS.length - 1][1];
	const [f0, c0] = FLAT_KEYS[i];
	const [f1, c1, e] = FLAT_KEYS[i + 1];
	return lerpCamE(c0, c1, (e ?? ease.inOut)(clamp((f - f0) / (f1 - f0), 0, 1)));
}

/** Eye height above F5 (pitch-0 cameras). */
export const eyeAboveF5 = (c: Cam) => c.z + c.dist * Math.cos((c.pitch * Math.PI) / 180) - F5;

/** F5 is culled once the hole fills the frame (and from then on). */
export const f5Culled = (f: number) => f > T.dive && eyeAboveF5(camAt(f)) < 30;

/**
 * Parallax compensation for elevated UI in real-app (flat) shots: a plane at
 * elevation e is pre-scaled about the camera axis so it lands exactly on its
 * window coordinates; it fades out as the camera tilts (true 2.5D parallax).
 */
export function liftK(c: Cam, e: number) {
	const w = clamp(1 - c.pitch / 14, 0, 1);
	const H = eyeAboveF5(c);
	const k = H > e + 1 ? (H - e) / H : 1;
	return {k: lerp(1, k, w), ox: c.x + 720, oy: c.y + 405};
}

// ------------------------------------------------------------------ hero

export type HeroPose =
	| {
			kind: '3d';
			/** Apparent window position of the face centre. */
			wx: number;
			wy: number;
			/** Underside height above F5. */
			e: number;
			/** Elevation used for flat-shot compensation (the surface it rests on / flies from). */
			eBase: number;
			w: number;
			h: number;
			r: number;
			d: number;
			rx: number;
			ry: number;
			rz: number;
			sx: number;
			sy: number;
			sz: number;
			label: number;
			glyph: number;
			hover: number;
			press: number;
			bright: number;
			shadow: number;
			shadowOn: number;
	  }
	| {kind: 'pin'; marker: MarkerDraw}
	| {kind: 'none'};

const LAND = {x: 1359, y: 641};
const REST0 = heroOnMap(V0); // (1163, 594)
const HERO_UI = {w: 144, h: 48, r: 16, d: 8};
const POP = popupBox(SHAFT.x, SHAFT.y, true);
export const SWATCH = {x: POP.swatch.x + 18, y: POP.swatch.y + 18};
const PIN_HEAD = {x: SHAFT.x, y: SHAFT.y - 3};

/** Fall from the Lab's trapdoor: drag-limited flutter, v0 ≈ 700 px/s → terminal ≈ 177 px/s. */
function fallHeight(f: number) {
	const t = f / 60;
	const v0 = 700;
	const tau = 0.25;
	const vt = 176.9;
	return Math.max(0, 360 - (vt * t + (v0 - vt) * tau * (1 - Math.exp(-t / tau))));
}

const base3d = (over: Partial<Extract<HeroPose, {kind: '3d'}>>): HeroPose => ({
	kind: '3d',
	wx: SHAFT.x,
	wy: SHAFT.y,
	e: 0,
	eBase: 0,
	...HERO_UI,
	rx: 0,
	ry: 0,
	rz: 0,
	sx: 1,
	sy: 1,
	sz: 1,
	label: 1,
	glyph: 24,
	hover: 0,
	press: 0,
	bright: 1,
	shadow: 1,
	shadowOn: 0,
	...over,
});

/**
 * Darkening inside the shaft (F5 shades it) until the camera passes the hole. It is already dark when
 * the sinking hero first uncovers the hole's rim (≈ 50.20), and lifts as the camera dives through.
 */
export function shaftDark(f: number) {
	const into = prog(f, T.sink - 2, T.sink + 6, ease.out);
	// lifts while the hole's rim sweeps out of frame (51.37–51.47), not before
	const out = prog(f, T.dive + 4, T.end - 2, ease.inOut);
	return into * (1 - out);
}

export function heroAt(f: number): HeroPose {
	// A · fall (flutter like a card), 40.00–41.30
	if (f < T.land) {
		const t = f / 60;
		const env = 1 - Math.pow(f / T.land, 2);
		const h = fallHeight(f);
		const sway = Math.sin(t * 2 * Math.PI * 0.9 + 0.6) * 14 * env;
		// 40.00–40.40 (arrival): still tilted toward the lens with half the flutter (fallTilt, shared with M4)
		const ft = f < ARRIVE_END ? fallTilt(t) : {rx: 0, amp: 1};
		return base3d({
			wx: lerp(1372, LAND.x, smooth(f / T.land)) + sway,
			wy: lerp(652, LAND.y, smooth(f / T.land)) + Math.cos(t * 2 * Math.PI * 0.9) * 5 * env,
			e: h,
			rx: ft.rx + ft.amp * Math.sin(t * 2 * Math.PI * 1.25) * 13 * env,
			ry: ft.amp * Math.cos(t * 2 * Math.PI * 0.9 + 0.6) * 15 * env,
			rz: -9 * env + Math.sin(t * 3.1) * 3 * env,
		});
	}
	// B · land, glance up, scoot into the grove, 41.30–42.30
	if (f < T.still + 4) {
		const imp = Math.exp(-(f - T.land) / 8) * (f >= T.land ? 1 : 0);
		const look = bump(f, T.land + 5, T.skid - 1);
		const anti = bump(f, T.skid - 4, T.skid + 3);
		const p = prog(f, T.skid + 1, T.still - 4, (u) => 1 - Math.pow(1 - u, 2.6));
		const speed = Math.max(0, prog(f + 1, T.skid + 1, T.still - 4, (u) => 1 - Math.pow(1 - u, 2.6)) - p) * 38;
		const settle = wobble(f, T.still - 6, 60, 3.2, 7);
		const dir = {x: REST0.x - LAND.x, y: REST0.y - LAND.y};
		return base3d({
			wx: LAND.x + dir.x * p + 5 * anti,
			wy: LAND.y + dir.y * p + 1.5 * anti,
			e: 0,
			rx: -9 * look,
			rz: lerp(0, -4, bump(f, T.skid + 2, T.still)) + 2.2 * settle,
			sx: 1 + 0.12 * imp - 0.05 * anti + 0.06 * clamp(speed, 0, 1) + 0.02 * settle,
			sy: 1 + 0.05 * imp + 0.03 * anti - 0.035 * clamp(speed, 0, 1) - 0.015 * settle,
			sz: 1 - 0.4 * imp,
		});
	}
	// C · hiding: rides the map like a glyph (slight drag lag), 42.30–45.20
	if (f < T.found) {
		const lag = f > T.grab && f < T.zoom2 + ZOOM_FRAMES + 4 ? 1.6 : 0;
		const p = heroOnMap(viewAt(f - lag));
		const nudge = wobble(f, T.dragEnd, 60, 2.6, 6) * 1.5;
		return base3d({wx: p.x + nudge * -0.88, wy: p.y + nudge * -0.48});
	}
	// D · found: hover-darken, freeze, named, 45.20–47.20
	if (f < T.swatch - 12) {
		const hover = prog(f, T.found, T.found + 9, ease.ui) * (1 - prog(f, T.rclick + 2, T.rclick + 11, ease.ui));
		const freeze = f < T.ibeam ? 1 : 0.35;
		const trem = (f >= T.found ? 1 : 0) * freeze;
		const jx = (noise1(f * 0.8, 3) > 0 ? 0.6 : -0.6) * trem;
		const poke = bump(f, T.rclick, T.rclick + 7);
		const typing = f >= T.typeStart && f < T.commit + 2 ? bump((f - T.typeStart) % 5, 0, 3) * 0.6 : 0;
		const named = wobble(f, T.commit, 60, 5, 7);
		const lean = 3.5 * prog(f, T.typeStart, T.commit, ease.inOut) + 4.5 * prog(f, T.commit + 6, T.swatch - 14, ease.inOut);
		const wind = prog(f, T.swatch - 20, T.swatch - 12, ease.inOut);
		return base3d({
			wx: SHAFT.x + jx - 4 * wind,
			wy: SHAFT.y + typing * 0.4,
			rz: lean + 1.8 * named,
			sx: 1 - 0.03 * poke + 0.03 * named - 0.07 * wind,
			sy: 1 - 0.03 * poke + 0.03 * named + 0.04 * wind,
			hover,
		});
	}
	// E · squeeze out and hop into the colour square (Swatch), 47.20–47.40
	if (f < T.swatch) {
		const p = clamp((f - (T.swatch - 12)) / 12, 0, 1);
		const pe = ease.inOut(p);
		const m = ease.out(clamp(p * 1.3, 0, 1));
		return base3d({
			wx: lerp(SHAFT.x - 4, SWATCH.x, pe),
			wy: lerp(SHAFT.y, SWATCH.y, pe),
			e: lerp(0, 28.5, pe) + 46 * Math.sin(Math.PI * p),
			eBase: lerp(0, 28.5, pe),
			w: lerp(144, 36, m),
			h: lerp(48, 36, m),
			r: lerp(16, 8, m),
			d: lerp(8, 4, m),
			// gone within 2 frames, before the face narrows (M5 clips a fading label without an ellipsis)
			label: 1 - clamp(p * 5, 0, 1),
			glyph: lerp(24, 16, m),
			rz: lerp(8, 0, pe),
			sx: 1 + 0.12 * Math.sin(Math.PI * p),
			sy: 1 - 0.08 * Math.sin(Math.PI * p),
			shadowOn: 28 * pe,
		});
	}
	// F · the Swatch, in the popup's colour square, 47.40–47.97 (it leaves 2 frames before the card swaps)
	const launch = T.add - 3;
	if (f < launch) {
		const land = Math.exp(-(f - T.swatch) / 6);
		const breathe = Math.sin(((f - T.swatch) / 60) * 2 * Math.PI * 1.1) * 0.012;
		// cocks (squats) as the pointer comes down on 「添加标记」
		const cock = prog(f, launch - 6, launch, ease.inOut);
		return base3d({
			wx: SWATCH.x,
			wy: SWATCH.y,
			e: 28.5,
			eBase: 28.5,
			w: 36,
			h: 36,
			r: 8,
			d: 4,
			label: 0,
			glyph: 16,
			sx: 1 + 0.14 * land + breathe + 0.07 * cock,
			sy: 1 - 0.1 * land + breathe - 0.06 * cock,
			sz: 1 - 0.5 * land - 0.3 * cock,
			shadowOn: 28,
		});
	}
	// G · shot out of the swatch (fast exit: already over the card when it swaps at 48.00) to the map
	//     point, curling into the pin head, 47.95–48.23
	const flyEnd = launch + 17;
	if (f < flyEnd) {
		const p = clamp((f - launch) / 17, 0, 1);
		const pe = easeOutCubic(p);
		const m = ease.inOut(clamp(pe * 1.1, 0, 1));
		return base3d({
			wx: lerp(SWATCH.x, PIN_HEAD.x, pe),
			wy: lerp(SWATCH.y, PIN_HEAD.y, pe),
			e: lerp(28.5, 0, pe) + 60 * Math.sin(Math.PI * pe),
			eBase: lerp(28.5, 0, pe),
			w: lerp(36, 14, m),
			h: lerp(36, 14, m),
			r: lerp(8, 7, m),
			d: lerp(4, 3, m),
			label: 0,
			glyph: lerp(16, 8, m),
			// leans into the flight and lands upright: the ▷ never reads ▽ or ◁
			rz: -12 * Math.sin(Math.PI * p),
			shadowOn: lerp(28, 0, pe),
		});
	}
	// H · the Pin: exact canvas marker + 「启动按钮」, 48.27–50.00
	if (f < T.press) {
		const k = f - flyEnd;
		const s = 1 + 0.32 * Math.exp(-k / 3) * Math.cos(k * 0.9);
		const heart = bump(f, T.heart, T.heart + 6) + 0.7 * bump(f, T.heart + 9, T.heart + 15);
		const shiver = f > T.heart - 4 ? (noise1(f * 0.9, 7) > 0 ? 0.5 : -0.5) * clamp((f - T.heart + 4) / 10, 0, 1) : 0;
		return {
			kind: 'pin',
			marker: {
				x: MAP_HERO_BLOCK.x,
				z: MAP_HERO_BLOCK.z,
				color: C.brand,
				name: '启动按钮',
				tail: ease.out(clamp(k / 7, 0, 1)),
				label: ease.out(clamp((k - 3) / 9, 0, 1)),
				// the heartbeat reads at the 2.4× press framing (lub +15 %, dub +10 %)
				s: s * (1 + 0.15 * heart),
				glyph: 1,
				dx: shiver,
			},
		};
	}
	// I · press 2: uncurls back to the UI form (150 ms) …
	const sinkF = f - T.sink;
	const uncurl = ease.outBackSoft(clamp((f - T.press) / 9, 0, 1));
	const press = prog(f, T.press + 4, T.press + 10, ease.ui);
	// J · … and sinks through the map at the shaft at once, gathering speed toward F6 (press2.ts)
	const drop = sinkDrop(f);
	const darkK = shaftDark(f);
	return base3d({
		wx: SHAFT.x,
		wy: lerp(PIN_HEAD.y, SHAFT.y, uncurl),
		e: -drop,
		w: lerp(14, 144, uncurl),
		h: lerp(14, 48, uncurl),
		r: lerp(7, 16, clamp(uncurl, 0, 1)),
		d: lerp(3, 8, clamp(uncurl, 0, 1)),
		label: clamp((f - T.press - 3) / 6, 0, 1),
		glyph: lerp(8, 24, clamp(uncurl, 0, 1)),
		press,
		rz: 2.5 * Math.sin(clamp(sinkF / 50, 0, 1) * Math.PI) * clamp(sinkF / 20, 0, 1),
		// it falls through the light the hole lets down: only gently shaded
		bright: 1 - 0.3 * darkK * clamp(drop / 220, 0, 1),
		shadow: sinkF > 0 ? 0 : 1,
	});
}

/** The rounded hole the hero leaves in the map (window coords), once it sinks. */
export const holeAt = (f: number) => (f >= T.sink ? {cx: SHAFT.x, cy: SHAFT.y, w: 144 * 0.97, h: 48 * 0.97, r: 15.5} : null);

// ------------------------------------------------------------------ cursor

export type CursorPose = {wx: number; wy: number; e: number; kind: CursorKind; next?: CursorKind; mixT?: number; press: number; rot: number};

const HOVER_SPOT = {x: 1013, y: 446};
const INPUT_SPOT = {x: POP.input.x + 58, y: POP.input.y + 19};
const PARK = {x: 1152, y: 489};
const ADD_SPOT = {x: POP.add.x + 44, y: POP.add.y + 12};
/** The pin's lower-right rim, between its tail and the label tab: the hand never hides the head's ▷. */
const PIN_SPOT = {x: SHAFT.x + 9, y: SHAFT.y + 7};

/** Cursor path keys (window xy) after it reaches the map. */
const CX: Array<[number, number, EaseFn?]> = [
	[T.skid, 1338],
	[T.skid + 18, 1328, ease.inOut],
	[T.skid + 30, 1342, ease.inOut],
	[T.skid + 44, 1318, ease.inOut],
	[T.grab - 4, DRAG.from.x, ease.inOut],
	[T.grab + 2, DRAG.from.x],
];
const CY: Array<[number, number, EaseFn?]> = [
	[T.skid, 668],
	[T.skid + 18, 660, ease.inOut],
	[T.skid + 30, 664, ease.inOut],
	[T.skid + 44, 657, ease.inOut],
	[T.grab - 4, DRAG.from.y, ease.inOut],
	[T.grab + 2, DRAG.from.y],
];

function pathAfterDrag(f: number) {
	const end = {x: DRAG.from.x + DRAG.d.x, y: DRAG.from.y + DRAG.d.y};
	const keys: Array<[number, {x: number; y: number}, EaseFn?]> = [
		[T.dragEnd, end],
		[T.dragEnd + 4, end],
		[T.zoom1 - 2, A1, ease.inOut],
		[T.zoom1 + ZOOM_FRAMES - 2, A1],
		[T.zoom2 - 2, A2, ease.inOut],
		[T.zoom2 + ZOOM_FRAMES + 1, A2],
		[T.found, HOVER_SPOT, ease.linear],
		[T.rclick + 6, HOVER_SPOT],
		[T.ibeam - 2, INPUT_SPOT, ease.inOut],
		[T.ibeam + 9, INPUT_SPOT],
		[T.typeStart + 14, PARK, ease.inOut],
		[T.toAdd, PARK],
		[T.add - 6, ADD_SPOT, ease.inOut],
		[T.toast + 30, ADD_SPOT],
		[T.heart - 2, PIN_SPOT, ease.inOut],
	];
	let i = 0;
	while (i < keys.length - 1 && f > keys[i + 1][0]) i++;
	if (i >= keys.length - 1) return keys[keys.length - 1][1];
	const [f0, p0] = keys[i];
	const [f1, p1, e] = keys[i + 1];
	const t = (e ?? ease.inOut)(clamp((f - f0) / (f1 - f0), 0, 1));
	return {x: lerp(p0.x, p1.x, t), y: lerp(p0.y, p1.y, t)};
}

/** The cursor's dive in after the hero, decelerating to glass height (41.50). */
function diveIn(f: number) {
	const p = ease.out(clamp(f / (T.skid - 4), 0, 1));
	return {wx: lerp(1378, 1338, p), wy: lerp(628, 668, p), e: lerp(610, 60, p), rot: lerp(-14, 0, p)};
}

export function cursorAt(f: number): CursorPose {
	// dive in after the hero, decelerating to glass height, then down to the surface for flat shots
	if (f < T.skid) {
		let c = diveIn(f);
		if (f < ARRIVE_END) {
			// 40.00–40.40: carry M4's dive (CUT_CURSOR, CUT_CURSOR_V) into the descent, joined at ARRIVE_END
			const a = diveIn(ARRIVE_END);
			const a0 = diveIn(ARRIVE_END - 0.5);
			const a1 = diveIn(ARRIVE_END + 0.5);
			const h = (k: 'wx' | 'wy' | 'e' | 'rot') => hermite1(f, 0, CUT_CURSOR[k], CUT_CURSOR_V[k], ARRIVE_END, a[k], a1[k] - a0[k]);
			// x is held back until the cursor has dropped past the hero's ▷ end (40.20), then it swings in under it
			const M = ARRIVE_END / 2;
			const vM = 2.2;
			const mx = CUT_CURSOR.wx - 6;
			const wx = f <= M ? hermite1(f, 0, CUT_CURSOR.wx, CUT_CURSOR_V.wx, M, mx, vM) : hermite1(f, M, mx, vM, ARRIVE_END, a.wx, a1.wx - a0.wx);
			c = {wx, wy: h('wy'), e: h('e'), rot: h('rot')};
		}
		return {...c, kind: 'arrow', press: 0};
	}
	const glassDown = 60 * (1 - prog(f, T.still - 10, T.flat - 2, ease.inOut));
	if (f < T.grab + 2) {
		const jig = f > T.skid + 6 && f < T.skid + 22 ? wobble(f, T.skid + 6, 60, 7, 9) * 3 : 0;
		const handT = prog(f, T.still + 6, T.still + 12, ease.linear);
		return {
			wx: track(f, CX) + jig,
			wy: track(f, CY),
			e: glassDown,
			kind: handT < 1 ? 'arrow' : 'grab',
			next: handT > 0 && handT < 1 ? 'grab' : undefined,
			mixT: handT,
			press: prog(f, T.grab - 3, T.grab + 1, ease.ui),
			rot: 0,
		};
	}
	if (f < T.dragEnd + 2) {
		const o = dragOffset(f);
		return {wx: DRAG.from.x + o.x, wy: DRAG.from.y + o.y, e: 0, kind: 'grabbing', press: 1 - prog(f, T.dragEnd - 1, T.dragEnd + 2, ease.ui), rot: 0};
	}
	const p = pathAfterDrag(f);
	let kind: CursorKind = 'grab';
	let press = 0;
	let rot = 0;
	let wx = p.x;
	let wy = p.y;
	let e = 0;
	if (f >= T.found) kind = 'pointer';
	if (f >= T.found && f < T.found + 5) {
		// stops dead: a 2.5 px overshoot along the approach, settled in 5 frames
		const o = ((T.found + 5 - f) / 5) * 2.5;
		wx -= 0.21 * o;
		wy -= 0.98 * o;
	}
	press = bump(f, T.rclick - 1, T.rclick + 5) * 0.9;
	if (f >= T.rclick + 6) kind = 'arrow';
	if (f >= T.ibeam - 6 && f < T.ibeam + 13) kind = 'ibeam';
	press += bump(f, T.ibeam + 1, T.ibeam + 7) * 0.9;
	if (f >= T.add - 12 && f < T.add + 1) kind = 'pointer';
	press += bump(f, T.add - 3, T.add + 3);
	if (f >= T.add + 1) kind = 'grab';
	// a double-take when the colour square turns pink
	if (f > T.swatch + 2 && f < T.swatch + 20) wx += wobble(f, T.swatch + 2, 60, 6, 8) * 3;
	if (f >= T.heart - 6) kind = 'pointer';
	// heartbeat: lub-dub on the pointer
	press += 0.35 * bump(f, T.heart, T.heart + 6) + 0.25 * bump(f, T.heart + 9, T.heart + 15);
	// press 2
	press += bump(f, T.press - 3, T.press + 7) * 1.0;
	// frozen, then the droop, then the dive
	rot = -3 * prog(f, T.droop, T.droop + 14, ease.inOut);
	wy += 3 * prog(f, T.droop, T.droop + 14, ease.inOut);
	if (f >= T.dive - 8) {
		const wind = bump(f, T.dive - 8, T.dive + 1);
		const dive = prog(f, T.dive, T.end, ease.fall);
		// press2.ts: its lens gap closes smoothly to ≈ 49 on the last frame (M6 takes it over at 45)
		e = 14 * wind + cursorDive(f);
		wx = lerp(wx, SHAFT.x + 9, dive);
		wy = lerp(wy, SHAFT.y + 7, dive);
	}
	return {wx, wy, e, kind, press: clamp(press, 0, 1), rot};
}

// ------------------------------------------------------------------ popup + toast

const PINYIN = 'qidonganniu';

export function popupAt(f: number): PopupState | null {
	if (f < T.rclick + 2 || f > T.press) return null;
	const saved = f >= T.add;
	const typed = Math.max(0, Math.min(PINYIN.length, Math.floor((f - T.typeStart) / 5) + 1));
	const composing = f >= T.typeStart && f < T.commit ? PINYIN.slice(0, typed) : '';
	const text = f >= T.commit ? '启动按钮' : '';
	const focused = prog(f, T.ibeam + 4, T.ibeam + 13, ease.ui);
	const blinkOn = f < T.commit + 30 || Math.floor((f - T.commit - 30) / 32) % 2 === 0;
	return {
		ax: SHAFT.x,
		ay: SHAFT.y,
		title: saved ? '启动按钮' : '位置',
		subtitle: 'X 120, Z -64',
		saved,
		draft: {
			text,
			composing,
			focused,
			caret: focused > 0.5 && blinkOn,
			swatch: f >= T.swatch ? null : C.markerDefault,
		},
		addHover: prog(f, T.add - 8, T.add - 2, ease.ui),
		addPress: bump(f, T.add - 3, T.add + 1),
	};
}

/** Toast enter (0.25 s); not drawn once the camera has left it for the shaft (49.43, it is out of frame by then). */
export const toastAt = (f: number) => (f >= T.toast && f <= P2.shaftTo ? ease.inOut(clamp((f - T.toast) / 15, 0, 1)) : null);

export {lerp, clamp};
