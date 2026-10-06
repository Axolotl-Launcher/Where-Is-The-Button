/**
 * Motion toolkit shared by every shot.
 *
 * Everything is a pure function of the frame number so Remotion can render
 * any frame in isolation (and in parallel) and always get the same picture.
 */
import {Easing} from 'remotion';

export type EaseFn = (t: number) => number;

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Named easings. Cubic beziers are tuned for UI-scale motion at 60 fps. */
export const ease = {
	linear: (t: number) => t,
	/** Soft symmetric ease — default for camera moves. */
	inOut: Easing.bezier(0.45, 0, 0.2, 1),
	/** Gentle, long settle (expo-like). */
	out: Easing.bezier(0.16, 1, 0.3, 1),
	/** Quick acceleration from rest (gravity-like start). */
	in: Easing.bezier(0.55, 0, 0.85, 0.35),
	/** Pure quadratic in — free fall. */
	fall: (t: number) => t * t,
	/** Pure quadratic out — thrown upward, decelerating. */
	rise: (t: number) => 1 - (1 - t) * (1 - t),
	outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
	outBackSoft: Easing.bezier(0.3, 1.3, 0.6, 1),
	inBack: Easing.bezier(0.36, 0, 0.66, -0.56),
	/** App UI standard (similar to the launcher's own transitions). */
	ui: Easing.bezier(0.2, 0, 0, 1),
	step: (t: number) => (t < 1 ? 0 : 1),
	hold: () => 0,
} satisfies Record<string, EaseFn>;

/** A keyframe: [frame, value, easing used to travel INTO this key]. */
export type Key = readonly [number, number, EaseFn?];

/** Piecewise keyframe interpolation (values held before first / after last key). */
export function track(frame: number, keys: readonly Key[]): number {
	if (keys.length === 0) return 0;
	if (frame <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		const [f1, v1, e] = keys[i];
		if (frame <= f1) {
			const [f0, v0] = keys[i - 1];
			const span = f1 - f0;
			const t = span <= 0 ? 1 : (frame - f0) / span;
			return v0 + (v1 - v0) * (e ?? ease.inOut)(clamp01(t));
		}
	}
	return keys[keys.length - 1][1];
}

/** Map frame range → 0..1 with easing (clamped). */
export function prog(frame: number, from: number, to: number, e: EaseFn = ease.inOut): number {
	if (to <= from) return frame >= to ? 1 : 0;
	return e(clamp01((frame - from) / (to - from)));
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const mix = lerp;

/** Remap v from [a,b] to [c,d], clamped. */
export function remap(v: number, a: number, b: number, c: number, d: number, e: EaseFn = ease.linear) {
	return lerp(c, d, e(clamp01((v - a) / (b - a))));
}

/**
 * Damped spring response to a step at `start` (0 → 1, overshooting).
 * `freq` in Hz-ish (oscillations per second at 60fps), `damp` 0..1.
 */
export function springStep(frame: number, start: number, fps = 60, freq = 2.2, damp = 0.32): number {
	const t = (frame - start) / fps;
	if (t <= 0) return 0;
	const w = 2 * Math.PI * freq;
	const zeta = damp;
	const wd = w * Math.sqrt(1 - zeta * zeta);
	return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
}

/** Decaying oscillation kick at `start` (0 at rest): amplitude 1 initially. */
export function wobble(frame: number, start: number, fps = 60, freq = 3, decay = 5): number {
	const t = (frame - start) / fps;
	if (t < 0) return 0;
	return Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * t);
}

/** Smooth 0→1→0 bump over [a,b]. */
export function bump(frame: number, a: number, b: number): number {
	if (frame <= a || frame >= b) return 0;
	const t = (frame - a) / (b - a);
	return Math.sin(Math.PI * t);
}

/** Numerical derivative (per frame) of any frame→number function. */
export function velocity(fn: (f: number) => number, frame: number, h = 0.5): number {
	return (fn(frame + h) - fn(frame - h)) / (2 * h);
}

/** Deterministic pseudo random in [0,1) from an integer/float seed. */
export function rand(seed: number): number {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
}

/** Smooth value noise in [-1,1] for organic idle motion. */
export function noise1(t: number, seed = 0): number {
	const i = Math.floor(t);
	const f = t - i;
	const a = rand(i + seed * 101.7) * 2 - 1;
	const b = rand(i + 1 + seed * 101.7) * 2 - 1;
	const u = f * f * (3 - 2 * f);
	return a + (b - a) * u;
}

export type V2 = {x: number; y: number};
export type V3 = {x: number; y: number; z: number};

/** Quadratic bezier point. */
export function qbez(p0: V2, p1: V2, p2: V2, t: number): V2 {
	const u = 1 - t;
	return {x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y};
}

/** Cubic bezier point. */
export function cbez(p0: V2, p1: V2, p2: V2, p3: V2, t: number): V2 {
	const u = 1 - t;
	const a = u * u * u;
	const b = 3 * u * u * t;
	const c = 3 * u * t * t;
	const d = t * t * t;
	return {x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y};
}

/**
 * Ballistic hop between two points with apex height `h` above the higher end.
 * Returns {x, y, z} for t in 0..1 (z is height).
 */
export function hop(from: V3, to: V3, h: number, t: number): V3 {
	const tt = clamp01(t);
	const zLin = lerp(from.z, to.z, tt);
	const arc = 4 * h * tt * (1 - tt);
	return {x: lerp(from.x, to.x, tt), y: lerp(from.y, to.y, tt), z: zLin + arc};
}

/**
 * Squash & stretch volume-preserving scale from a signed vertical speed:
 * moving fast → stretched along motion; impact → squashed.
 */
export function stretchFromSpeed(speed: number, k = 0.012, max = 0.35): {along: number; across: number} {
	const s = clamp(Math.abs(speed) * k, 0, max);
	const along = 1 + s;
	return {along, across: 1 / Math.sqrt(along)};
}

/** Frame helpers (60 fps). */
export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);
