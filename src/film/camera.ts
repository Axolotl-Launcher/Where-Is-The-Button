/**
 * Camera helpers: real-app framing, interpolation, keyframed camera paths and
 * the exact CSS-3D projection (used to draw the cursor as a crisp overlay at
 * the screen position of its world point).
 */
import {Cam} from '../stage/Stage';
import {ease, EaseFn} from '../lib/anim';
import {REAL, toWorld, WIN} from './timeline';

/** Real-app framing of a floor: top-down, window centre (or point) at given screen scale. */
export function flatCam(floorZ: number, opts: {wx?: number; wy?: number; scale?: number; persp?: number} = {}): Cam {
	const persp = opts.persp ?? REAL.persp;
	const scale = opts.scale ?? REAL.scale;
	const p = toWorld(opts.wx ?? WIN.cx, opts.wy ?? WIN.cy, floorZ);
	return {x: p.x, y: p.y, z: p.z, dist: persp / scale, pitch: 0, yaw: 0, roll: 0, persp};
}

export function lerpCam(a: Cam, b: Cam, t: number): Cam {
	const l = (u: number, v: number) => u + (v - u) * t;
	return {
		x: l(a.x, b.x),
		y: l(a.y, b.y),
		z: l(a.z, b.z),
		dist: l(a.dist, b.dist),
		pitch: l(a.pitch, b.pitch),
		yaw: l(a.yaw, b.yaw),
		roll: l(a.roll, b.roll),
		persp: l(a.persp, b.persp),
	};
}

/** Keyframed camera: [frame, Cam, easing into this key]. Holds outside the range. */
export function camTrack(frame: number, keys: Array<[number, Cam, EaseFn?]>): Cam {
	if (frame <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		const [f1, c1, e] = keys[i];
		if (frame <= f1) {
			const [f0, c0] = keys[i - 1];
			const t = f1 === f0 ? 1 : (frame - f0) / (f1 - f0);
			return lerpCam(c0, c1, (e ?? ease.inOut)(Math.max(0, Math.min(1, t))));
		}
	}
	return keys[keys.length - 1][1];
}

/** Keep the floor's apparent size while changing the lens (dolly zoom / vertigo). */
export function dollyZoom(c: Cam, newPersp: number): Cam {
	const scale = c.persp / c.dist;
	return {...c, persp: newPersp, dist: newPersp / scale};
}

const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Project a world point to screen pixels exactly as the Stage's CSS does:
 * translateZ(persp − dist) rotateZ(roll) rotateX(pitch) rotateZ(yaw) translate(−target),
 * then perspective `persp` about the screen centre.
 * Returns screen x/y (px), the perspective scale at that point and its view depth.
 */
export function project(c: Cam, p: {x: number; y: number; z: number}, screen = {w: 1920, h: 1080}) {
	let x = p.x - c.x;
	let y = p.y - c.y;
	let z = p.z - c.z;
	// rotateZ(yaw)
	let cs = Math.cos(rad(c.yaw));
	let sn = Math.sin(rad(c.yaw));
	[x, y] = [x * cs - y * sn, x * sn + y * cs];
	// rotateX(pitch)
	cs = Math.cos(rad(c.pitch));
	sn = Math.sin(rad(c.pitch));
	[y, z] = [y * cs - z * sn, y * sn + z * cs];
	// rotateZ(roll)
	cs = Math.cos(rad(c.roll));
	sn = Math.sin(rad(c.roll));
	[x, y] = [x * cs - y * sn, x * sn + y * cs];
	// translateZ
	z += c.persp - c.dist;
	const k = c.persp / Math.max(1e-3, c.persp - z);
	return {x: screen.w / 2 + x * k, y: screen.h / 2 + y * k, scale: k, depth: c.persp - z};
}
