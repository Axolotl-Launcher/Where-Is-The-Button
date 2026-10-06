/**
 * Home-floor geometry shared by M1 (opening), M7 (the seat) and M8 (finale).
 * Window coordinates are CSS px of the 1440 × 810 window (panel collapsed).
 */
import {Cam} from '../../stage/Stage';
import {HOME_HERO, toWorld, WIN} from '../../film/timeline';

/** The socket = the hero's rectangle in Minimal Home (panel collapsed). */
export const SOCKET = {x: HOME_HERO.x, y: HOME_HERO.y, w: HOME_HERO.w, h: HOME_HERO.h, r: 16, cx: HOME_HERO.cx, cy: HOME_HERO.cy} as const;

/** Depth of the socket walls below the floor surface (card band + floor band). */
export const SOCKET_DEPTH = 6;

/** Hero slab thickness (Hero default d). */
export const HERO_D = 8;

/**
 * Where the 3D hero sits when seated (world coords, floor z = 0):
 * its top face is flush with the floor surface, so its underside is at −HERO_D.
 */
export const HOME_SEAT = {...toWorld(SOCKET.cx, SOCKET.cy, 0), zTop: 0, zUnder: -HERO_D} as const;

/** The outline ▷ of the seated hero, window coords (bible §3.2: icon box x 25–49, y 12–36). */
export const GLYPH_VERTS: Array<[number, number]> = [
	[SOCKET.x + 30, SOCKET.y + 15],
	[SOCKET.x + 44, SOCKET.y + 24],
	[SOCKET.x + 30, SOCKET.y + 33],
];

/** Rounded-rect outline as an SVG path (clockwise). */
export function roundRectPath(x: number, y: number, w: number, h: number, r: number): string {
	return [
		`M${x + r} ${y}`,
		`H${x + w - r}`,
		`A${r} ${r} 0 0 1 ${x + w} ${y + r}`,
		`V${y + h - r}`,
		`A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
		`H${x + r}`,
		`A${r} ${r} 0 0 1 ${x} ${y + h - r}`,
		`V${y + r}`,
		`A${r} ${r} 0 0 1 ${x + r} ${y}`,
		'Z',
	].join(' ');
}

/** clip-path that keeps the whole window except the socket (even-odd hole). */
export const SOCKET_CLIP = `path(evenodd, "M0 0 H${WIN.w} V${WIN.h} H0 Z ${roundRectPath(SOCKET.x, SOCKET.y, SOCKET.w, SOCKET.h, SOCKET.r)}")`;

/** Cam from an eye position (yaw 0): the eye sits `dist` from the target along (0, sin p, cos p). */
export function camFromEye(eye: {x: number; y: number; z: number}, pitch: number, dist: number, persp: number): Cam {
	const p = (pitch * Math.PI) / 180;
	return {x: eye.x, y: eye.y - dist * Math.sin(p), z: eye.z - dist * Math.cos(p), dist, pitch, yaw: 0, roll: 0, persp};
}

/** Top-down cam centred on window point (wx, wy) of a floor at screen scale s. */
export function topCam(wx: number, wy: number, s: number, persp = 1000, floorZ = 0): Cam {
	const p = toWorld(wx, wy, floorZ);
	return {x: p.x, y: p.y, z: p.z, dist: persp / s, pitch: 0, yaw: 0, roll: 0, persp};
}

/**
 * Window-coordinate bounding box of what the camera can see of the plane
 * z = planeZ (null when a frame corner looks above that plane's horizon).
 * Used to crop a floor the eye is about to cross (CSS 3D has no near plane).
 */
export function visiblePlaneRect(c: Cam, planeZ: number, margin = 24) {
	const p = (c.pitch * Math.PI) / 180;
	const eye = {x: c.x, y: c.y + c.dist * Math.sin(p), z: c.z + c.dist * Math.cos(p)};
	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;
	for (const [sx, sy] of [
		[0, 0],
		[1920, 0],
		[0, 1080],
		[1920, 1080],
	]) {
		const q = unproject(c, sx, sy, 1000);
		const dz = q.z - eye.z;
		if (dz >= -1e-6) return null;
		const t = (planeZ - eye.z) / dz;
		if (t <= 0) return null;
		const hx = eye.x + (q.x - eye.x) * t + WIN.cx;
		const hy = eye.y + (q.y - eye.y) * t + WIN.cy;
		x0 = Math.min(x0, hx);
		y0 = Math.min(y0, hy);
		x1 = Math.max(x1, hx);
		y1 = Math.max(y1, hy);
	}
	return {x0: x0 - margin, y0: y0 - margin, x1: x1 + margin, y1: y1 + margin};
}

/** Like SOCKET_CLIP but keeping only the given window rect (minus the socket). */
export function socketClipIn(r: {x0: number; y0: number; x1: number; y1: number} | null, hole = true): string {
	const x0 = Math.max(-4, r ? r.x0 : -4);
	const y0 = Math.max(-4, r ? r.y0 : -4);
	const x1 = Math.min(WIN.w + 4, r ? r.x1 : WIN.w + 4);
	const y1 = Math.min(WIN.h + 4, r ? r.y1 : WIN.h + 4);
	const outer = `M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${y1.toFixed(1)} H${x0.toFixed(1)} Z`;
	return `path(evenodd, "${outer}${hole ? ' ' + roundRectPath(SOCKET.x, SOCKET.y, SOCKET.w, SOCKET.h, SOCKET.r) : ''}")`;
}

/**
 * Inverse of `project` (src/film/camera.ts): the world point that appears at
 * screen (sx, sy) at view depth `depth` (distance along the view axis from the eye).
 */
export function unproject(c: Cam, sx: number, sy: number, depth: number, screen = {w: 1920, h: 1080}) {
	const rad = (d: number) => (d * Math.PI) / 180;
	const k = c.persp / depth;
	// camera-space point (before translateZ): x, y scaled back; z' = persp − depth
	let x = (sx - screen.w / 2) / k;
	let y = (sy - screen.h / 2) / k;
	let z = c.persp - depth - (c.persp - c.dist);
	// undo rotateZ(roll)
	let cs = Math.cos(rad(-c.roll));
	let sn = Math.sin(rad(-c.roll));
	[x, y] = [x * cs - y * sn, x * sn + y * cs];
	// undo rotateX(pitch)
	cs = Math.cos(rad(-c.pitch));
	sn = Math.sin(rad(-c.pitch));
	[y, z] = [y * cs - z * sn, y * sn + z * cs];
	// undo rotateZ(yaw)
	cs = Math.cos(rad(-c.yaw));
	sn = Math.sin(rad(-c.yaw));
	[x, y] = [x * cs - y * sn, x * sn + y * cs];
	return {x: x + c.x, y: y + c.y, z: z + c.z};
}
