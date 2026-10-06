/**
 * Global timeline and world conventions — see design/STORYBOARD.md §0–§5.
 * All modules use these constants so their hand-offs line up exactly.
 */
export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);

export type ModuleId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9';

/** Module frame ranges [from, to) in film frames. */
export const MODULES: Record<ModuleId, {from: number; to: number; name: string}> = {
	M1: {from: 0, to: 585, name: 'Opening'},
	M2: {from: 585, to: 780, name: 'Tower reveal'},
	M3: {from: 780, to: 1830, name: 'Discover'},
	M4: {from: 1830, to: 2400, name: 'Instance & Lab'},
	M5: {from: 2400, to: 3090, name: 'Seed map'},
	M6: {from: 3090, to: 3780, name: 'Workshop'},
	M7: {from: 3780, to: 4140, name: 'Return'},
	M8: {from: 4140, to: 4800, name: 'Finale'},
	M9: {from: 4800, to: 5220, name: 'End card'},
};

export const TOTAL_FRAMES = 5220;

/** Convert an absolute film time (seconds) into a module-local frame. */
export const localFrame = (m: ModuleId, seconds: number) => sec(seconds) - MODULES[m].from;

/** Floor surfaces (z of the UI top face). */
export const FLOOR_Z = {
	home: 0,
	discover: -720,
	instance: -1440,
	lab: -2160,
	seedmap: -2880,
	workshop: -3600,
} as const;
export type FloorKey = keyof typeof FLOOR_Z;
export const FLOOR_ORDER: FloorKey[] = ['home', 'discover', 'instance', 'lab', 'seedmap', 'workshop'];
export const FLOOR_GAP = 720;

/** Window size (CSS px) and its centre. */
export const WIN = {w: 1440, h: 810, cx: 720, cy: 405} as const;

/** Window coordinates on a floor → world coordinates. */
export const toWorld = (wx: number, wy: number, z: number) => ({x: wx - WIN.cx, y: wy - WIN.cy, z});

/** The shaft: every vertical passage through a floor happens here (window coords). */
export const SHAFT = {x: 983, y: 428} as const;

/** Home hero box (panel collapsed), window coords. */
export const HOME_HERO = {x: 911, y: 404, w: 144, h: 48, cx: 983, cy: 428} as const;

/** Elevations above a floor's surface (bible §2.4 → film). */
export const ELEV = {card: 4, control: 8, pinkButton: 12, floating: 20, popup: 28, modal: 36, glass: 60} as const;

/** Real-app framing constants. */
export const REAL = {persp: 1000, dist: 750, scale: 4 / 3} as const;
