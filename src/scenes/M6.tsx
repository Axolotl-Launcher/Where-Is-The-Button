/**
 * M6 · Workshop (F6 投影工坊) — Sh21–Sh25, film 51.50–63.00 s (local 0–690).
 *
 * Entry (= M5's exit, src/scenes/seedmap/plan.ts CAM_END): camera in the map-hole
 *      shaft looking straight down at F6 (target shaft@F6, pitch 0, persp ≈ 800),
 *      still plunging, so frame 0 is that motion one frame on and then brakes; hero
 *      (UI, pressed .97, no shadow) 300 above F6 falling ≈ 11 px/frame; cursor (pointer,
 *      drooped −3°) at window (992, 435), F6 + 500, 45 px in front of the lens.
 * Sh21 51.50 the hero slows into a hover like a file being dragged; the drop overlay
 *      「松开以打开投影」 lights (52.50); it "lets go" and lands inside it (53.00);
 *      the overlay clears 53.30.
 * Sh22 53.50 projector click: a clean cut to the workbench (dark stage + grid, glass
 *      overlays settle) with 「正在解析投影」 12 %; the hero hops, startled, then looks up
 *      at the status → 「正在读取资源」 38 % (54.00, region bounds) → 生成模型 n / 40
 *      (54.50–56.00). The projector lifts the UI hero; layer 1 of pink concrete sweeps in
 *      under it (54.60–55.40), then it is consumed column by column into layer 2 with the
 *      white ▷ (55.40–56.20); loose blocks drop in, the ▷'s tip last.
 * Sh23 too heavy: strains and slams (57.00), lurches one block (57.50); the cursor
 *      (crosshair, as the real canvas shows) sweeps in after the thud and lands beside the
 *      slab at 57.25 — a witness, not the cause.
 * Sh24 框选 58.00 (the camera pans so the glass toolbar enters the top-left, no zoom pump)
 *      → corner 58.50 (「请选择另一对角」) → opposite corner 59.50: the selection
 *      captures with a flash (faces .6 → .24), light 2 px edges, one hologram scanline;
 *      「已选 600 个」. The camera eases into a slow drift.
 * Sh25 61.00 the look up, in the close shot: the hero raises its ▷ end (9°), the
 *      crosshair nods twice; then the camera dollies back out in front of the stack and
 *      cranes up to the tower wide (persp 3200, pitch 62°, yaw −22°) — each upper floor
 *      fades in from the top of frame as the eye rises past it. 62.33 the 投影工坊's glass
 *      toolbar slides in, crisp, as a screen-space panel (bottom-left); 62.50 the cursor
 *      flies to 「层间距」 and presses on the 63.00 click (M7 starts on the same camera).
 *      In the close-ups the inspector at the frame edge gets a slight depth of field.
 */
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {Cam, Obj, Stage} from '../stage/Stage';
import {FONT} from '../theme/tokens';
import {ease, lerp, prog, rand, track} from '../lib/anim';
import {FLOOR_Z, FloorKey} from '../film/timeline';
import {WS_POINTS, WsSelection, WsTool} from '../ui/pages/Workshop';
import {B, camKeys, eyeOf, HERO_NW, HCOLS, lerpCamLog, LURCH, lookAt, REGION, towerCam, wp, ZW} from './workshop/common';
import {boxSegs, ColState, HeroVoxel, LooseBlock, RegionBounds, ScreenLines, SEL_ALPHA, Seg, SelectionFaces} from './workshop/HeroVoxel';
import {SmoothHero} from './workshop/SmoothHero';
import {F6Floor, F6State} from './workshop/F6';
import {FOG_F6, TowerUpper} from './workshop/Tower';
import {cursorScreen, ScreenCursor, WsCursorShadow, WsCursorState, WsKind} from './workshop/WsCursor';
import {hudPt, WsHud} from './workshop/Hud';

/** Absolute film seconds → M6 local frame. */
const F = (s: number) => Math.round((s - 51.5) * 60);
const ts = (f: number) => 51.5 + f / 60;
const ENV = 'linear-gradient(180deg, #f2eef2 0%, #d9d4dc 100%)';

/* ─────────────────────────────── timing ─────────────────────────────── */

const T = {
	overlayOn: F(52.5), // 60
	land: F(53.0), // 90
	overlayOff: F(53.3), // 108
	parse: F(53.5), // 120 — projector click: the workbench cuts in
	resources: F(54.0), // 150 — hover tick
	mesh: F(54.5), // 180
	l1: F(54.6), // 186
	l2: F(55.4), // 234
	meshDone: F(56.0), // 270
	thud1: F(57.0), // 330
	cursorIn: F(57.25), // 345 (lands 348)
	thud2: F(57.5), // 360
	boxTool: F(58.0), // 390
	corner1: F(58.5), // 420
	corner2: F(59.5), // 480
	lookUp: F(61.0), // 570
	hudIn: 650, // 62.33 the glass toolbar slides in
	fly: 660, // the cursor leaves the hero for 「层间距」
	click: 690, // 63.00 = M7 frame 0
};

/** Decaying impact oscillation that starts at its maximum. */
const impact = (f: number, f0: number, freq = 3, decay = 8) => {
	const t = (f - f0) / 60;
	return t < 0 ? 0 : Math.exp(-decay * t) * Math.cos(2 * Math.PI * freq * t);
};
const pr = (f: number, a: number, b: number, e: (t: number) => number) => (f <= a ? 0 : f >= b ? 1 : e((f - a) / (b - a)));

/* ─────────────────────────────── camera ─────────────────────────────── */

const FIT = {pitch: 58, yaw: -45, persp: 1160};
/** Continues M5's plunge (initial slope ≈ 9× the mean) and settles. */
const BRAKE = Easing.bezier(0.1, 0.9, 0.3, 1);
const C_CORNER2 = lookAt(942, 450, 5, {...FIT, pitch: 47, yaw: -14, scale: 3.25});
const CAM_KEYS: Array<[number, Cam, ((t: number) => number)?]> = [
	// M5 reaches CAM_END (shaft@F6, dist 600, persp 800, pitch 0) on its last frame still plunging
	// (eye ≈ −55 px/frame, lens ≈ +21/frame): frame 0 is that motion one frame on, then it brakes.
	[0, {...wp(983, 428, 0), dist: 545, pitch: 0, yaw: 0, roll: 0, persp: 821}],
	[24, {...wp(983, 428, 0), dist: 400, pitch: 0, yaw: 0, roll: 0, persp: 860}, BRAKE],
	[84, lookAt(900, 420, 0, {pitch: 30, yaw: -5, persp: 1100, scale: 1.75})],
	[118, lookAt(905, 418, 0, {pitch: 31, yaw: -6, persp: 1100, scale: 1.84})],
	[148, lookAt(800, 392, 0, {pitch: 24, yaw: -8, persp: 1050, scale: 1.38})],
	[160, lookAt(798, 392, 0, {pitch: 24.5, yaw: -8.5, persp: 1050, scale: 1.4})],
	[224, lookAt(935, 450, 6, {...FIT, pitch: 49, yaw: -24, scale: 3.35})],
	[300, lookAt(938, 450, 6, {...FIT, pitch: 47, yaw: -18, scale: 3.5})],
	[364, lookAt(940, 451, 6, {...FIT, pitch: 46, yaw: -15, scale: 3.7})],
	// 58.00 框选: a pan (scale ≥ 2.6) that brings the glass toolbar into the top-left while the hero stays in frame
	[390, lookAt(790, 395, 10, {...FIT, pitch: 42, yaw: -17, scale: 2.6})],
	[420, lookAt(940, 452, 5, {...FIT, pitch: 47, yaw: -16, scale: 3.1})],
	[T.corner2, C_CORNER2],
];

/** After the opposite-corner click the camera eases (12 frames) into a slow linear drift. */
const C_DRIFT = lookAt(960, 440, 5, {...FIT, pitch: 50, yaw: -16, scale: 2.9});
function driftCam(f: number): Cam {
	const u = Math.min(2, Math.max(0, (f - T.corner2) / 120));
	const a = 0.1;
	const v = u < a ? (u * u) / (2 * a) / (1 - a / 2) : (u - a / 2) / (1 - a / 2);
	return lerpCamLog(C_CORNER2, C_DRIFT, v);
}

/**
 * The look-up crane (61.47–62.90): separate tracks so the eye first dollies BACK out in front
 * of the stack (log-distance early, pitch overshooting to 66° = a lower, more frontal eye) and
 * only then rises (target late), keeping the eye ≥ 750 units in front of every floor's front
 * edge while it is within ±150 of that floor's plane; it lands on towerCam (shared with M7).
 */
const CR = {d0: 588, d1: 684, p0: 586, p1: 624, t0: 610, t1: 684, pMax: 66};
const E_DIST = Easing.bezier(0.33, 0, 0.4, 1);
const E_PITCH = Easing.bezier(0.4, 0, 0.4, 1);
const E_TARGET = Easing.bezier(0.45, 0, 0.25, 1);
function craneCam(f: number): Cam {
	const a = driftCam(f);
	const b = towerCam(ts(f));
	const sd = pr(f, CR.d0, CR.d1, E_DIST);
	const sp = pr(f, CR.p0, CR.p1, E_PITCH);
	const st = pr(f, CR.t0, CR.t1, E_TARGET);
	const g = (u: number, v: number, k: number) => Math.exp(Math.log(u) + (Math.log(v) - Math.log(u)) * k);
	const persp = g(a.persp, b.persp, sd);
	const scale = g(a.persp / a.dist, b.persp / b.dist, sd);
	return {
		x: lerp(a.x, b.x, st),
		y: lerp(a.y, b.y, st),
		z: lerp(a.z, b.z, st),
		pitch: lerp(a.pitch, CR.pMax, sp) + (b.pitch - CR.pMax) * st,
		yaw: lerp(a.yaw, b.yaw, 0.5 * sp + 0.5 * st),
		roll: 0,
		persp,
		dist: persp / scale,
	};
}

function camAt(f: number): Cam {
	const c = f <= T.corner2 ? camKeys(f, CAM_KEYS) : craneCam(f);
	// heavy thuds shake the stage a little
	const sh = (f0: number, a: number) => {
		const t = (f - f0) / 60;
		return t < 0 ? 0 : a * Math.exp(-t * 14) * Math.sin(2 * Math.PI * 11 * t);
	};
	const s = sh(T.thud1, 1.4) + sh(T.thud2, 1.0);
	return {...c, x: c.x + s * 0.4, y: c.y + s, z: c.z - s * 0.3};
}

/* ─────────────────────────────── the hero ─────────────────────────────── */

const HC = wp(983, 428, 0); // hero/shaft centre on F6

type UI = {x: number; y: number; z: number; rx: number; ry: number; rz: number; sx: number; sy: number; sz: number; clipL: number; press: number};

/** The UI (smooth) hero: drift → hover (dragged file) → release → land → startled by the cut → lifted by the projector → consumed. */
function heroUI(f: number): UI | null {
	let z = ZW;
	let x = HC.x;
	let rx = 0;
	let ry = 0;
	let rz = 0;
	let sx = 1;
	let sy = 1;
	let sz = 1;
	if (f < 40) {
		// decelerating drift (enters falling at ≈ 12 px/frame) with a paper-like flutter
		const t = f / 40;
		z = ZW + 62 + 238 * (1 - t) * (1 - t);
		const fl = (1 - 0.55 * t) * Math.min(1, f / 10);
		rx = 5 * Math.sin(f * 0.23) * fl;
		ry = -4 * Math.sin(f * 0.19) * fl;
		x += 7 * Math.sin(f * 0.11);
	} else if (f < T.land) {
		// hovering like a dragged file; leans toward 「松开以打开投影」 when it lights; lets go at 52.70
		const h = f - 40;
		const bob = 3 * Math.sin((2 * Math.PI * h) / 40);
		const drop = prog(f, 76, T.land, ease.fall);
		const hitch = 3 * Math.sin(Math.PI * prog(f, 70, 77, ease.linear));
		z = ZW + (62 + bob * (1 - drop) + hitch) * (1 - drop);
		x += 7 * Math.sin(40 * 0.11) * (1 - prog(f, 40, 70)) + 4 * Math.sin((2 * Math.PI * h) / 64) * (1 - drop);
		rz = 2.2 * Math.sin((2 * Math.PI * h) / 52) * (1 - drop);
		rx = 5 * Math.sin(40 * 0.23) * 0.45 * (1 - prog(f, 40, 60));
		ry = track(f, [
			[40, -4 * Math.sin(40 * 0.19) * 0.45],
			[58, 0],
			[68, -7, ease.out],
			[76, -6],
			[T.land, 0, ease.in],
		]);
	} else {
		z = ZW;
		// soft landing squash (flatten + widen), decays ≈ 220 ms
		const i = impact(f, T.land, 3, 9);
		sz = 1 - 0.32 * i;
		sx = 1 + 0.06 * i;
		sy = 1 + 0.06 * i;
		// startled hop when the page cuts to the dark stage (53.50)
		const hopT = prog(f, T.parse + 3, T.parse + 15, ease.linear);
		if (f >= T.parse && f < T.parse + 3) {
			const a = prog(f, T.parse, T.parse + 3, ease.out);
			sz = 1 - 0.18 * a;
			sx = sy = 1 + 0.04 * a;
		} else if (hopT > 0 && hopT < 1) {
			z = ZW + 16 * 4 * hopT * (1 - hopT);
			const v = 1 - 2 * hopT;
			sz = 1 + 0.12 * Math.abs(v);
		} else if (f >= T.parse + 15) {
			const i2 = impact(f, T.parse + 15, 3, 10);
			sz *= 1 - 0.12 * i2;
		}
		// then it looks up at the status 「正在解析投影」 → 「正在读取资源」
		rx = track(f, [
			[T.parse + 18, 0],
			[T.parse + 26, 6, ease.out],
			[T.resources + 12, 5],
			[T.resources + 20, 0],
		]);
		// lifted off the stage by the projector, then hovers while it is meshed
		const lift = prog(f, T.resources + 22, T.l1 - 2, ease.out);
		if (lift > 0) z = ZW + 24 * lift + 1.2 * Math.sin((2 * Math.PI * (f - T.l1)) / 34) * lift;
		rz = 0.8 * Math.sin((2 * Math.PI * (f - T.resources)) / 50) * lift;
	}
	const clipCols = f < L2_RELEASE0 ? 0 : Math.min(HCOLS, Math.floor((f - L2_RELEASE0) / COL_STEP) + 1);
	if (clipCols >= HCOLS) return null;
	// M5 hands it over still pressed (.97) — it relaxes as it drifts
	const press = 1 - prog(f, 6, 22, ease.out);
	return {x, y: HC.y, z, rx, ry, rz, sx, sy, sz, clipL: clipCols / HCOLS, press};
}

/* voxel build (mesh progress) */
const COL_STEP = 1.6;
const L1_FALL = 6;
const L2_FALL = 7;
const L2_RELEASE0 = T.l2 - L2_FALL; // the first layer-2 column leaves the hero here
const LOOSE: Array<{c: number; r: number; land: number}> = [
	{c: 3, r: 2, land: 262},
	{c: 26, r: 6, land: 266},
	{c: 14, r: 8, land: 270},
	{c: 20, r: 1, land: 273},
	{c: 7, r: 9, land: 276},
	{c: 23, r: 4, land: 279},
	{c: 17, r: 5, land: 282},
	{c: 10, r: 4, land: 288}, // the tip of the ▷ — the last piece
];
const LOOSE_FALL = 12;

function bounce(f: number, a: number, amp: number) {
	return f >= a && f < a + 6 ? amp * Math.sin((Math.PI * (f - a)) / 6) : 0;
}

function layer1(f: number) {
	return (c: number): ColState => {
		const land = T.l1 + COL_STEP * c;
		const start = land - L1_FALL;
		if (f < start) return null;
		if (f < land) {
			const t = (f - start) / L1_FALL;
			return {dz: 10 * (1 - t * t)};
		}
		return {dz: bounce(f, land, 0.9)};
	};
}

function layer2(f: number) {
	return (c: number): ColState => {
		const rel = L2_RELEASE0 + COL_STEP * c;
		if (f < rel) return null;
		const missing = LOOSE.filter((b) => b.c === c && f < b.land).map((b) => b.r);
		if (f < rel + L2_FALL) {
			const t = (f - rel) / L2_FALL;
			return {dz: 19.2 * (1 - t * t), missing};
		}
		return {dz: bounce(f, rel + L2_FALL, 1.1), missing};
	};
}

function loose(f: number): LooseBlock[] {
	const out: LooseBlock[] = [];
	for (const b of LOOSE) {
		const start = b.land - LOOSE_FALL;
		if (f < start || f >= b.land + 6) continue;
		const t = Math.min(1, (f - start) / LOOSE_FALL);
		const dz = f < b.land ? 46 * (1 - t * t) : bounce(f, b.land, 1.3);
		if (f >= b.land && dz <= 0.01) continue;
		out.push({c: b.c, r: b.r, l: 1, dz});
	}
	return out;
}

type Pose = {pivot: number; ry: number; lurch: number; shiver: number};

/** Pose of the voxel: rock (57.00), lurch one block (57.50), shiver in the selection, raise its ▷ end (61.00). */
function voxelPose(f: number): Pose {
	let pivot = 0; // local x of the bottom edge it rotates about
	let ry = 0;
	const lurch = LURCH * prog(f, 350, 358, ease.inOut);
	if (f >= 296 && f < 346) {
		pivot = 0;
		ry = track(f, [
			[300, 0],
			[314, -5.2, ease.out],
			[322, -5.8],
			[T.thud1, 0, ease.in],
		]);
		if (f >= 316 && f < T.thud1 - 2) ry += 0.35 * Math.sin(f * 2.7); // straining tremble
		if (f >= T.thud1) ry = 0.7 * impact(f, T.thud1, 4, 14);
	} else if (f >= 346 && f < 380) {
		pivot = HCOLS * B;
		ry = track(f, [
			[348, 0],
			[354, 8.5, ease.out],
			[T.thud2, 0, ease.in],
		]);
		if (f >= T.thud2) ry = -0.6 * impact(f, T.thud2, 4, 14);
	} else if (f >= 566) {
		// the look up: its ▷ end (the nose) rises toward the floors above, held through the crane
		pivot = HCOLS * B;
		ry = track(f, [
			[T.lookUp, 0],
			[584, 9, ease.out],
			[600, 8.5],
			[638, 8],
			[670, 0, ease.inOut],
		]);
		if (f >= 584 && f < 640) ry += 0.22 * Math.sin(f * 1.9);
	}
	const shiver = f >= T.corner2 + 6 && f < T.corner2 + 20 ? (rand(f * 7.3) - 0.5) * 1.1 * (1 - (f - T.corner2 - 6) / 14) : 0;
	return {pivot, ry, lurch, shiver};
}

/** Hero-local point (origin NW-bottom, before the lurch) → world, through the current pose. */
function posePoint(p: {x: number; y: number; z: number}, pose: Pose) {
	const o = wp(HERO_NW.x + pose.lurch + pose.shiver, HERO_NW.y, 0);
	const th = (pose.ry * Math.PI) / 180;
	const lx = p.x - pose.pivot;
	return {x: o.x + pose.pivot + lx * Math.cos(th) + p.z * Math.sin(th), y: o.y + p.y, z: o.z - lx * Math.sin(th) + p.z * Math.cos(th)};
}

/* ─────────────────────────────── the page state ─────────────────────────────── */

function meshCount(f: number) {
	return Math.max(0, Math.min(40, Math.floor((40 * (f - T.mesh)) / (T.meshDone - T.mesh))));
}

/** The 层间距 press that M7 continues (its frame 1 = the click's bottom). */
const spacingPress = (f: number) => Math.max(0, 1 - Math.abs(f - (T.click + 1)) / 4);

function pageState(f: number): F6State {
	// a clean cut on the projector click — the real page swaps, it does not dissolve
	const loaded = f >= T.parse ? 1 : 0;
	const drop = f < T.overlayOn ? 0 : f < T.overlayOff ? prog(f, T.overlayOn, T.overlayOn + 8, ease.out) : 1 - prog(f, T.overlayOff, T.overlayOff + 7, ease.linear);
	let bar: number | null = null;
	if (f >= T.parse && f < T.meshDone + 2) {
		const n = meshCount(f);
		bar = f < T.resources ? 12 * prog(f, T.parse, T.parse + 12, ease.ui) : f < T.mesh ? 12 + 26 * prog(f, T.resources, T.resources + 12, ease.ui) : 38 + 62 * (n / 40);
	}
	const spin = f * 6;
	const loading =
		f >= T.parse && f < T.meshDone + 2
			? f < T.resources
				? {label: '正在解析投影', spin}
				: f < T.mesh
					? {label: '正在读取资源', spin}
					: {label: '正在生成模型', count: [meshCount(f), 40] as [number, number], spin}
			: null;
	const tool: WsTool = f >= T.boxTool + 2 ? 'box' : 'select';
	const toolHover: WsTool | null = f >= 378 && f < 398 ? 'box' : f >= 680 ? 'layer-spacing' : null;
	const toolPress = Math.max(0, 1 - Math.abs(f - (T.boxTool + 1)) / 4) + spacingPress(f);
	let sel: WsSelection = null;
	let anchorPending = false;
	if (f >= T.corner2) sel = {count: 600, pos: [31, 1, 1]};
	else if (f >= T.corner1) {
		sel = {count: 1, pos: [2, 0, 10]};
		anchorPending = true;
	}
	return {
		loaded,
		drop: Math.max(0, drop),
		bar,
		tool,
		toolHover,
		toolPress,
		loading,
		overlays: prog(f, T.parse + 2, T.parse + 26, ease.linear),
		sel,
		anchorPending,
		grid: 1,
	};
}

/* ─────────────────────────────── the cursor ─────────────────────────────── */

/** Where it parks after the opposite corner (and in the wide): beside the slab, clear of the ▷. */
const REST = {x: 875, y: 518};
const CX: Array<[number, number, ((t: number) => number)?]> = [
	// M5 hands it over right in front of the lens: it stays over the shaft until it has fallen clear
	[0, 992],
	[16, 990, ease.out],
	[58, 700, ease.inOut],
	[88, 846, ease.inOut],
	[150, 858, ease.inOut],
	[200, 720, ease.in],
	// too heavy: off frame (bottom-left) until after thud 1, sweeps in and lands beside the slab at 57.25
	[330, 748],
	[348, 872, ease.inOut],
	[366, 876],
	[388, 538.7, ease.inOut],
	[396, 538.7],
	[412, 918.2, ease.inOut],
	[426, 918.2],
	[474, 1057.4, ease.inOut],
	[486, 1057.4],
	[540, REST.x, ease.inOut],
	[T.click, REST.x],
];
const CY: Array<[number, number, ((t: number) => number)?]> = [
	[0, 435],
	[16, 437, ease.out],
	[58, 405, ease.inOut],
	[88, 472, ease.inOut],
	[150, 486, ease.inOut],
	[200, 300, ease.in],
	[330, 566],
	[348, 486, ease.inOut],
	[366, 484],
	[388, 193, ease.inOut],
	[396, 193],
	[412, 452, ease.inOut],
	[426, 452],
	[474, 406.4, ease.inOut],
	[486, 406.4],
	[540, REST.y, ease.inOut],
	[T.click, REST.y],
];
/**
 * M5 hands the cursor over 45 px in front of a lens that is still plunging and must brake
 * within ≈ 170 px: for 5 frames the cursor brakes with it (gap 45 → 43 → 49 → 63 → 85 → 115,
 * a smooth turnaround of its near-lens slide), then falls clear to glass height.
 */
const nearGap = (f: number) => 45 - 6 * f + 4 * f * f;
const eyeH = (f: number) => eyeOf(camKeys(f, CAM_KEYS)).z - ZW;
const CZ_NEAR_END = 5;
const CZ: Array<[number, number, ((t: number) => number)?]> = [
	[CZ_NEAR_END, eyeH(CZ_NEAR_END) - nearGap(CZ_NEAR_END)],
	[56, 60, ease.out],
	[150, 64],
	[200, 240, ease.in],
	[330, 45],
	[348, 40, ease.inOut],
	[366, 40],
	[388, 21, ease.inOut],
	[396, 21],
	[408, 16, ease.inOut],
	[416, 3.5, ease.out],
	[426, 3.5],
	[446, 18, ease.out],
	[466, 18],
	[476, 10, ease.out],
	[486, 10],
	[500, 32, ease.out],
	[540, 40],
	[570, 40],
	[590, 66, ease.out],
	[T.click, 66],
];

/** The cursor is drawn (in the stage) before it dives away and again once it arrives after thud 1. */
const cursorShown = (f: number) => f < 200 || f >= 330;

function cursorAt(f: number): WsCursorState {
	let x = track(f, CX);
	let y = track(f, CY);
	const dz = f < CZ_NEAR_END ? eyeH(f) - nearGap(f) : track(f, CZ);
	// double-take at the second thunk
	if (f >= T.thud2 && f < T.thud2 + 16) x += 4 * Math.sin(((f - T.thud2) / 16) * Math.PI * 3) * (1 - (f - T.thud2) / 16);
	// tiny hand drift while it watches (not in the realism bookends)
	if ((f > 90 && f < 150) || (f > 500 && f < 586)) {
		x += 1.2 * Math.sin(f * 0.09);
		y += 0.9 * Math.sin(f * 0.07 + 1);
	}
	const p = wp(x, y, dz);
	let kind: WsKind = 'arrow';
	let next: WsKind | undefined;
	let mixT = 0;
	if (f < 16) {
		kind = 'pointer';
		next = 'arrow';
		mixT = prog(f, 8, 15, ease.linear);
	}
	if (f >= 300) kind = 'crosshair';
	if (f >= 380 && f < 398) {
		kind = 'crosshair';
		next = 'pointer';
		mixT = f < 390 ? prog(f, 380, 384, ease.linear) : 1 - prog(f, 394, 398, ease.linear);
	}
	if (f >= 668) {
		// off the 3D canvas onto the glass toolbar: crosshair → pointer
		kind = 'crosshair';
		next = 'pointer';
		mixT = prog(f, 668, 678, ease.linear);
	}
	const press =
		Math.max(0, 1 - Math.abs(f - (T.boxTool - 1)) / 4) +
		Math.max(0, 1 - Math.abs(f - (T.corner1 - 1)) / 4) +
		Math.max(0, 1 - Math.abs(f - (T.corner2 - 1)) / 4) +
		spacingPress(f);
	const rot = -3 * (1 - prog(f, 0, 24, ease.inOut)); // M5's droop, recovering
	return {...p, kind, next, mixT, press, rot};
}

/** The nod (61.47–61.75): two quick dips of the crosshair in screen space, "yes — up there". */
const nod = (f: number) => 8 * Math.sin(Math.PI * prog(f, 588, 596, ease.linear)) + 6 * Math.sin(Math.PI * prog(f, 597, 605, ease.linear));
/** Depth scaling strengthens as the camera pulls out, so in the wide it is ≈ 0.3 × (not as big as the hero). */
const depthScaleAt = (f: number) => (f < 150 ? 0.35 * prog(f, 0, 30, ease.inOut) : 0.22 + 0.63 * prog(f, 596, 650, ease.inOut));

/** Screen position/size: projected from the world, then flown to the glass 「层间距」 button. */
function cursorOnScreen(cam: Cam, cur: WsCursorState, f: number) {
	const w = cursorScreen(cam, cur, {depthScale: depthScaleAt(f), minScale: f < 596 ? 0.7 : 0.3, maxScale: 1.3});
	if (!w) return null;
	const y = w.y + nod(f);
	const b = prog(f, T.fly, T.fly + 24, ease.inOut);
	if (b <= 0) return {x: w.x, y, size: w.size};
	const h = hudPt(WS_POINTS.spacing.x, WS_POINTS.spacing.y);
	return {x: lerp(w.x, h.x, b), y: lerp(y, h.y, b) - 34 * Math.sin(Math.PI * b), size: lerp(w.size, 44, b)};
}

/* ─────────────────────────────── selection geometry ─────────────────────────────── */

const SEL_EDGE = '#ff8cc6';
const SEL_BOX = {x0: 0, y0: 0, z0: 0, x1: HCOLS * B, y1: 10 * B, z1: 2 * B};

function selectionSegs(f: number, pose: Pose): {segs: Seg[]; box: Seg[]; opacity: number} {
	const P = (x: number, y: number, z: number) => posePoint({x, y, z}, pose);
	const T6 = (s: Seg[]): Seg[] => s.map(([a, b]) => [P(a.x, a.y, a.z), P(b.x, b.y, b.z)] as Seg);
	if (f >= T.corner2) {
		const e = 0.12;
		return {
			segs: T6(boxSegs({x: 0, y: 0, z: 0}, {x: SEL_BOX.x1, y: SEL_BOX.y1, z: SEL_BOX.z1})),
			box: T6(boxSegs({x: -e, y: -e, z: -e}, {x: SEL_BOX.x1 + e, y: SEL_BOX.y1 + e, z: SEL_BOX.z1 + e})),
			opacity: 1,
		};
	}
	if (f >= T.corner1) {
		// the anchor block (2, 0, 10): its two exposed faces (south + west) and their edges
		const y1 = 10 * B;
		const s: Seg[] = [
			[P(0, y1, 0), P(B, y1, 0)],
			[P(B, y1, 0), P(B, y1, B)],
			[P(B, y1, B), P(0, y1, B)],
			[P(0, y1, B), P(0, y1, 0)],
			[P(0, y1 - B, 0), P(0, y1, 0)],
			[P(0, y1 - B, B), P(0, y1, B)],
			[P(0, y1 - B, 0), P(0, y1 - B, B)],
		];
		return {segs: s, box: [], opacity: 1};
	}
	return {segs: [], box: [], opacity: 0};
}

/** The capture (59.50): faces flash to .6 for 5 frames and settle to the viewer's .24. */
const selFill = (f: number) => (f < T.corner2 ? SEL_ALPHA : track(f, [[T.corner2, 0.6], [T.corner2 + 5, 0.6], [T.corner2 + 15, SEL_ALPHA, ease.out]]));
/** One hologram scanline across the slab over 18 frames. */
const selScan = (f: number) => (f >= T.corner2 + 2 && f < T.corner2 + 20 ? (f - T.corner2 - 2) / 18 : null);

/* ─────────────────────────────── composition ─────────────────────────────── */

/** Depth of field on the inspector while the camera is close on the hero (0 below 2.2×, 0.6 px at ≥ 3.4×). */
const inspectorDof = (c: Cam) => Math.max(0, Math.min(0.6, ((c.persp / c.dist - 2.2) / 1.2) * 0.6));

const towerZ = (k: FloorKey) => FLOOR_Z[k];

export const M6: React.FC = () => {
	const f = useCurrentFrame();
	const cam = camAt(f);
	const st = pageState(f);
	const ui = heroUI(f);
	const pose = voxelPose(f);
	const showVoxel = f >= T.l1 - L1_FALL;
	const vOrigin = wp(HERO_NW.x + pose.lurch + pose.shiver, HERO_NW.y, 0);
	const region = wp(REGION.x, REGION.y, 0);
	const sel = selectionSegs(f, pose);
	const cur = cursorAt(f);
	const scr = cursorShown(f) ? cursorOnScreen(cam, cur, f) : null;
	const wide = f >= CR.p0;
	const f6fog = FOG_F6 * prog(f, 610, 660, ease.inOut);
	const shadowK = (f < T.parse ? 1 : 0.5) * prog(f, 0, 30, ease.inOut) * (1 - prog(f, T.fly - 4, T.fly + 8, ease.linear));
	const hudIn = prog(f, T.hudIn, T.hudIn + 18, ease.out);
	return (
		<AbsoluteFill style={{background: ENV, fontFamily: FONT.ui}}>
			<Stage cam={cam} background={ENV}>
				{wide ? <TowerUpper cam={cam} z={towerZ} mountFade={1200} /> : null}
				<F6Floor z={ZW} st={st} fog={f6fog} inspectorDof={inspectorDof(cam)} />
				{/* region bounds appear with 「正在读取资源」 (54.00) */}
				{f >= T.resources ? (
					<Obj x={region.x} y={region.y} z={region.z}>
						<RegionBounds x0={0} y0={0} x1={REGION.w * B} y1={REGION.l * B} h={REGION.h * B} opacity={prog(f, T.resources, T.resources + 8, ease.linear)} />
					</Obj>
				) : null}
				{showVoxel ? (
					<Obj x={vOrigin.x + pose.pivot} y={vOrigin.y} z={vOrigin.z} ry={pose.ry}>
						<Obj x={-pose.pivot}>
							<HeroVoxel layer={[layer1(f), layer2(f)]} loose={loose(f)} />
							{f >= T.corner2 ? (
								<SelectionFaces box={SEL_BOX} fill={selFill(f)} scan={selScan(f)} />
							) : f >= T.corner1 ? (
								<SelectionFaces box={{x0: 0, y0: 9 * B, z0: 0, x1: B, y1: 10 * B, z1: B}} faces={['s', 'w']} />
							) : null}
						</Obj>
					</Obj>
				) : null}
				{ui ? (
					<SmoothHero
						x={ui.x}
						y={ui.y}
						z={ui.z}
						floorZ={ZW}
						rx={ui.rx}
						ry={ui.ry}
						rz={ui.rz}
						sx={ui.sx}
						sy={ui.sy}
						sz={ui.sz}
						clipL={ui.clipL}
						press={ui.press}
						shadowStrength={(f < T.parse ? 1 : 0.6) * prog(f, 0, 36, ease.inOut)}
					/>
				) : null}
				{cursorShown(f) && shadowK > 0 ? <WsCursorShadow cursor={cur} floorZ={ZW} strength={shadowK} /> : null}
			</Stage>
			<ScreenLines cam={cam} segs={sel.box} opacity={0.65 * sel.opacity} width={1.6} />
			<ScreenLines cam={cam} segs={sel.segs} opacity={sel.opacity} color={f >= T.corner2 ? SEL_EDGE : undefined} width={f >= T.corner2 ? (wide ? 1.4 + 0.6 * (1 - prog(f, 596, 640, ease.inOut)) : 2) : 1.7} />
			<WsHud inT={hudIn} tool="box" hover={f >= 680 ? 'layer-spacing' : null} press={spacingPress(f)} />
			{scr ? <ScreenCursor x={scr.x} y={scr.y} size={scr.size} cursor={cur} /> : null}
		</AbsoluteFill>
	);
};
