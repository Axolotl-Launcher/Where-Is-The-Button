/**
 * M6/M7 shared constants: the voxel hero, the schematic region, the floor
 * stack under 层间距 and small math helpers. World units = window CSS px;
 * the hero's block = 4.8 px so 30 × 10 blocks = the 144 × 48 button.
 */
import {Cam} from '../../stage/Stage';
import {ease, EaseFn} from '../../lib/anim';
import {FLOOR_ORDER, FLOOR_Z, FloorKey, toWorld} from '../../film/timeline';
import {VOXEL_GLYPH, VOXEL_GLYPH_AT} from '../../ui/pages/Workshop';

export const ZW = FLOOR_Z.workshop;
export const B = 4.8;
export const HCOLS = 30;
export const HROWS = 10;
/** The hero's NW corner (window) on F6 before Sh23's one-block lurch (= the Home socket footprint). */
export const HERO_NW = {x: 911, y: 404};
export const LURCH = B;
/** Schematic region 32 × 2 × 12 (a one-block air margin around the 30 × 2 × 10 hero). */
export const REGION = {x: 911 - B, y: 404 - B, w: 32, l: 12, h: 2};

/** Pixel ▷ outline (white concrete) on the top layer — see VOXEL_GLYPH. */
export const isGlyph = (c: number, r: number) => {
	const gr = r - VOXEL_GLYPH_AT.row;
	const gc = c - VOXEL_GLYPH_AT.col;
	return gr >= 0 && gr < VOXEL_GLYPH.length && gc >= 0 && gc < VOXEL_GLYPH[0].length && VOXEL_GLYPH[gr][gc] === '#';
};

/** Block colours = the averages of the real 16 px textures (pink_concrete / white_concrete are flat). */
export const PINK_CONCRETE = '#d5658e';
export const WHITE_CONCRETE = '#cfd5d6';
/** Viewer-style face brightness (S .8 · W .72 · E .6 · N .55 as Voxel.tsx; top 1.06 ≈ the viewer's exposure on lit tops). */
export const SHADE = {top: 1.06, south: 0.8, west: 0.72, east: 0.6, north: 0.55} as const;

export function shade(hex: string, k: number): string {
	const s = hex.replace('#', '');
	const n = [0, 2, 4].map((i) => Math.min(255, Math.round(parseInt(s.slice(i, i + 2), 16) * k)));
	return `rgb(${n[0]}, ${n[1]}, ${n[2]})`;
}

/** Window point on a floor (+ height) → world. */
export const wp = (wx: number, wy: number, dz = 0, floorZ: number = ZW) => toWorld(wx, wy, floorZ + dz);

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const smooth = (t: number) => {
	const u = clamp01(t);
	return u * u * (3 - 2 * u);
};

/** Eye position of a Stage camera (inverse of camTransform). */
export function eyeOf(c: Cam) {
	const p = (c.pitch * Math.PI) / 180;
	const y = (c.yaw * Math.PI) / 180;
	return {x: c.x + c.dist * Math.sin(p) * Math.sin(y), y: c.y + c.dist * Math.sin(p) * Math.cos(y), z: c.z + c.dist * Math.cos(p)};
}

/** Camera interpolation with lens and distance blended geometrically (constant-feel zooms). */
export function lerpCamLog(a: Cam, b: Cam, t: number): Cam {
	const l = (u: number, v: number) => u + (v - u) * t;
	const g = (u: number, v: number) => Math.exp(Math.log(u) + (Math.log(v) - Math.log(u)) * t);
	const persp = g(a.persp, b.persp);
	const scale = g(a.persp / a.dist, b.persp / b.dist);
	return {x: l(a.x, b.x), y: l(a.y, b.y), z: l(a.z, b.z), pitch: l(a.pitch, b.pitch), yaw: l(a.yaw, b.yaw), roll: l(a.roll, b.roll), persp, dist: persp / scale};
}

export function camKeys(frame: number, keys: Array<[number, Cam, EaseFn?]>): Cam {
	if (frame <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		const [f1, c1, e] = keys[i];
		if (frame <= f1) {
			const [f0, c0] = keys[i - 1];
			const t = f1 === f0 ? 1 : (frame - f0) / (f1 - f0);
			return lerpCamLog(c0, c1, (e ?? ease.inOut)(clamp01(t)));
		}
	}
	return keys[keys.length - 1][1];
}

/** A camera looking at window point (wx, wy) on a floor at screen scale `scale`. */
export function lookAt(wx: number, wy: number, dz: number, o: {pitch: number; yaw: number; persp: number; scale: number; floorZ?: number}): Cam {
	const t = wp(wx, wy, dz, o.floorZ ?? ZW);
	return {x: t.x, y: t.y, z: t.z, pitch: o.pitch, yaw: o.yaw, roll: 0, persp: o.persp, dist: o.persp / o.scale};
}

/* ───────────────────────── the tower wide (Sh25 → Sh26) ───────────────────────── */

/** Screen scale of the tower wide at full spacing (before its slow push-in). */
export const TOWER_S = 0.225;
/** Camera target depth (below Home) of the wide at full spacing. */
export const TOWER_Z = 2050;
/** World units the stack slides right (camera target left) to make room for the 层间距 panel. */
export const TOWER_XOFF = 300;
/** The wide's slow push-in: saturating, ≈ 6 %/s at 62.5 s, +6 % in total. */
export const towerDrift = (t: number) => Math.exp(0.06 * (1 - Math.exp(-(t - 62.5) / 1.0)));
/** The stack slides right as the glass 层间距 panel comes in (62.45 → 63.10 s). */
export const towerXOff = (t: number) => TOWER_XOFF * smooth((t - 62.45) / 0.65);

/**
 * The tower wide (persp 3200, pitch 62°, yaw −22°) at absolute time t (s) with the
 * (smoothed) 层间距 spacing ks: M6 lands its crane on it and M7 starts from it, so the
 * 63.00 cut is one continuous camera. The framing follows the stack as it converges
 * (screen scale ∝ 1 / stack height) and dips a touch while the gaps close.
 */
export function towerCam(t: number, ks = 1): Cam {
	const sw = (TOWER_S * towerDrift(t) * 3830) / (3400 * ks + 430);
	const low = Math.sin(Math.PI * clamp01((1 - ks) / 0.75)) * 2.5;
	return {x: -towerXOff(t), y: 40 * ks, z: -TOWER_Z * ks, pitch: 62 + low, yaw: -22, roll: 0, persp: 3200, dist: 3200 / sw};
}

/* ───────────────────────── 层间距: the floor stack ───────────────────────── */

/** Slider notches (seconds → value %) — storyboard Sh26. */
export const NOTCHES: Array<[number, number]> = [
	[64.0, 90],
	[64.5, 80],
	[65.0, 70],
	[65.5, 60],
	[65.75, 50],
	[66.0, 40],
	[66.25, 30],
	[66.5, 20],
	[66.75, 10],
	[67.0, 0],
];
const NOTCH_EASE: EaseFn = ease.outBackSoft;
const NOTCH_DUR = 0.15;

/** Slider value (snapped, what the UI shows) at absolute time t (s). */
export function sliderValue(t: number): number {
	let v = 100;
	for (const [tn, val] of NOTCHES) if (t >= tn) v = val;
	return v;
}

/** Stack spacing k (1 = 100 %) at time t: each notch is a quick ratchet ease. */
export function spacingK(t: number): number {
	let v = 100;
	for (const [tn, val] of NOTCHES) {
		if (t >= tn) {
			const p = clamp01((t - tn) / NOTCH_DUR);
			v = v + (val - v) * NOTCH_EASE(p);
		}
	}
	return v / 100;
}

/** Smoothed spacing (moving average) for the camera to follow without jerks. */
export function spacingSmooth(t: number): number {
	let s = 0;
	const n = 13;
	for (let i = 0; i < n; i++) s += spacingK(t + ((i - (n - 1) / 2) / (n - 1)) * 0.5);
	return s / n;
}

/** Floor surface z under spacing k: proportional, and stacked just under Home at k = 0. */
export function floorZAt(key: FloorKey, k: number): number {
	const i = FLOOR_ORDER.indexOf(key);
	if (i === 0) return 0;
	return FLOOR_Z[key] * k - 6 * i * (1 - k);
}
