/**
 * The evening world (Sh30–Sh31): layout in BLOCK units (1 block = B world px).
 * Axes as everywhere in the film: x east, y south (toward the camera), z up.
 * The camera glides north (−y) and stops at the origin, eye 1.7 blocks up,
 * facing a low sun through the hanging blossoms of a cherry grove.
 */
import {rand} from '../lib/anim';

export const B = 64;

export type MatKey = 'grass' | 'sand' | 'dirt' | 'water' | 'leaves' | 'log' | 'hill' | 'hillFar' | 'farGround' | 'cloud';
export type FaceKind = 'top' | 'south' | 'north' | 'east' | 'west' | 'bottom';

/** An axis-aligned box in blocks: [x0, x1] × [y0, y1] × [z0, z1]. */
export type Box = {x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; mat: MatKey; faces: FaceKind[]; id: string};

const TERRAIN: FaceKind[] = ['top', 'south', 'east', 'west'];

const box = (id: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, mat: MatKey, faces = TERRAIN): Box => ({
	id,
	x0,
	x1,
	y0,
	y1,
	z0,
	z1,
	mat,
	faces,
});

/** Pond: water surface 12 px below the grass, sand beaches at both ends. */
export const POND = {x0: -10, x1: -4, y0: 8, y1: 14, surface: -12 / B};

/** Valley floor rows (2 blocks deep) so nothing straddles the eye as it glides. */
function groundRows(): Box[] {
	const out: Box[] = [];
	for (let y = -8; y < 32; y += 2) {
		const segs: Array<[number, number, MatKey]> = [];
		if (y >= POND.y0 && y < POND.y1) {
			segs.push([-14, -11, 'grass'], [-11, -10, 'sand'], [-4, -3, 'sand'], [-3, 12, 'grass']);
		} else if (y === POND.y0 - 2 || y === POND.y1) {
			segs.push([-14, -11, 'grass'], [-11, -3, 'sand'], [-3, 12, 'grass']);
		} else {
			segs.push([-14, 12, 'grass']);
		}
		segs.forEach(([a, b, m], i) => out.push(box(`g${y}_${i}`, a, b, y, y + 2, -1, 0, m, ['top'])));
	}
	return out;
}

/** Side terraces flank the valley; chunked along y (4 blocks) for the same reason. */
function sideTerraces(): Box[] {
	const out: Box[] = [];
	const strip = (id: string, x0: number, x1: number, yFar: number, yNear: number, h: number) => {
		for (let y = yFar; y < yNear; y += 4) out.push(box(`${id}${y}`, x0, x1, y, Math.min(yNear, y + 4), 0, h, 'grass', ['top', 'east', 'west']));
	};
	strip('L1_', -22, -14, -8, 32, 1);
	strip('L2_', -32, -22, -16, 32, 2);
	strip('R1_', 12, 20, -8, 32, 1);
	strip('R2_', 20, 32, -14, 32, 2);
	return out;
}

export const TERRAIN_BOXES: Box[] = [
	...groundRows(),
	...sideTerraces(),
	// Terraces stepping up toward the grove and the sun (north).
	box('T1', -22, 20, -34, -8, 0, 1, 'grass'),
	box('T2', -18, 18, -34, -16, 1, 2, 'grass'),
	box('T3', -32, -8, -44, -26, 2, 3, 'grass'),
	box('T4', 6, 32, -46, -28, 2, 4, 'grass'),
	box('T5', -10, 8, -46, -34, 1, 2.5, 'grass'),
	// Pond basin walls (dirt) — only the ones that can face the camera.
	box('pondN', POND.x0, POND.x1, POND.y0 - 0.02, POND.y0, POND.surface, 0, 'dirt', ['south']),
	box('pondW', POND.x0 - 0.02, POND.x0, POND.y0, POND.y1, POND.surface, 0, 'dirt', ['east']),
	box('pondE', POND.x1, POND.x1 + 0.02, POND.y0, POND.y1, POND.surface, 0, 'dirt', ['west']),
	// Far land and hills in the haze.
	box('far', -220, 220, -170, -44, -1, 0, 'farGround', ['top']),
	box('H1', -96, -34, -112, -76, 0, 7, 'hill', ['south', 'east', 'west']),
	box('H2', -26, 44, -140, -108, 0, 10, 'hillFar', ['south', 'east', 'west']),
	box('H3', 36, 112, -118, -84, 0, 6, 'hill', ['south', 'west']),
	box('H4', -150, -80, -150, -120, 0, 9, 'hillFar', ['south', 'east']),
];

export type Tree = {
	id: string;
	/** Trunk base (blocks). */
	x: number;
	y: number;
	z: number;
	trunk: number;
	/** Canopy centre offset from the trunk + size. */
	cx: number;
	cy: number;
	w: number;
	d: number;
	h: number;
	/** Hanging strands: [dx, dy, length] relative to the canopy's north-west corner. */
	strands: Array<[number, number, number]>;
};

const strandsFor = (w: number, d: number, seed: number): Array<[number, number, number]> => {
	const out: Array<[number, number, number]> = [];
	// along the south edge (facing the camera) and both sides
	for (let i = 0; i < w; i++) if (rand(seed + i * 3.1) > 0.45) out.push([i, d - 1, 1 + Math.round(rand(seed + i * 7.7) * 1.4)]);
	for (let j = 1; j < d - 1; j++) {
		if (rand(seed + j * 5.3) > 0.55) out.push([0, j, 1 + Math.round(rand(seed + j * 2.9))]);
		if (rand(seed + j * 9.1) > 0.55) out.push([w - 1, j, 1 + Math.round(rand(seed + j * 4.3))]);
	}
	return out;
};

export const TREES: Tree[] = [
	// A: the tree the sun sets behind (its strands catch the light).
	{id: 'A', x: -1.5, y: -12.5, z: 1, trunk: 4, cx: 2, cy: 0, w: 7, d: 6, h: 2, strands: strandsFor(7, 6, 11)},
	{id: 'B', x: -8, y: -13.5, z: 1, trunk: 4, cx: 0, cy: 0, w: 6, d: 6, h: 2, strands: strandsFor(6, 6, 23)},
	{id: 'C', x: 10, y: -15.5, z: 1, trunk: 5, cx: 0, cy: 0, w: 6, d: 6, h: 2, strands: strandsFor(6, 6, 37)},
	{id: 'D', x: -3, y: -24.5, z: 2, trunk: 5, cx: 1, cy: 0, w: 7, d: 7, h: 2, strands: strandsFor(7, 7, 41)},
	{id: 'E', x: -16, y: -21.5, z: 2, trunk: 4, cx: 0, cy: 0, w: 6, d: 6, h: 2, strands: strandsFor(6, 6, 53)},
	{id: 'F', x: 16, y: -23.5, z: 2, trunk: 5, cx: 0, cy: 0, w: 6, d: 6, h: 2, strands: strandsFor(6, 6, 67)},
	// G: a branch of blossoms overhanging the stop point from the right (its trunk stays out of frame).
	{id: 'G', x: 12.5, y: -3, z: 0, trunk: 3.5, cx: -4.5, cy: 0, w: 5, d: 4, h: 1, strands: strandsFor(5, 4, 79)},
];

export type Plant = {x: number; y: number; z: number; tex: string; s: number};

const PLANT_TEX = ['short_grass', 'short_grass', 'short_grass', 'pink_tulip', 'short_grass', 'poppy', 'short_grass', 'dandelion'];

/** Grass tufts and flowers along the glide path (strong parallax). */
export const PLANTS: Plant[] = Array.from({length: 22}, (_, i) => {
	const y = 26 - i * 1.55 + rand(i * 3.3) * 0.8;
	const side = i % 2 === 0 ? -1 : 1;
	const x = side * (1.2 + rand(i * 7.1) * 4.5) - 0.5;
	return {x: Math.round(x) + 0.5, y: Math.round(y) + 0.5, z: 0, tex: PLANT_TEX[i % PLANT_TEX.length], s: 1};
}).filter((p) => !(p.x > POND.x0 - 1.5 && p.x < POND.x1 + 1.5 && p.y > POND.y0 - 2.5 && p.y < POND.y1 + 2.5));

/** Pink petal carpets on the grove terrace (flat, pink_petals texture). */
export const PETAL_CARPETS: Array<[number, number, number]> = [
	[0, -10, 1],
	[2, -11, 1],
	[-3, -10, 1],
	[-7, -11, 1],
	[5, -9, 1],
	[9, -12, 1],
	[-1, -9, 1],
	[3, -7, 0],
	[7, -5, 0],
	[5, -4, 0],
];

export type Cloud = {x0: number; x1: number; y0: number; y1: number; z: number};
export const CLOUDS: Cloud[] = [
	{x0: -46, x1: -22, y0: -74, y1: -64, z: 18},
	{x0: -40, x1: -30, y0: -64, y1: -60, z: 18},
	{x0: -12, x1: 8, y0: -96, y1: -86, z: 20},
	{x0: 14, x1: 36, y0: -64, y1: -56, z: 16},
	{x0: 22, x1: 30, y0: -56, y1: -52, z: 16},
	{x0: 34, x1: 50, y0: -104, y1: -94, z: 22},
	{x0: -30, x1: -18, y0: -44, y1: -38, z: 15},
	{x0: 4, x1: 18, y0: -40, y1: -35, z: 17.5},
];

/** The low evening sun (direction). */
export const SUN = {azimuth: 4, elevation: 9.5};
