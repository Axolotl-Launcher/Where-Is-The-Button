/**
 * M3 beat sheet (design/STORYBOARD.md §4 Sh08–Sh13). All values are M3-local
 * frames (0 = film 13.00 s = film frame 780).
 */
import {clamp} from '../../lib/anim';
import {FLOOR_Z} from '../../film/timeline';

/** Film seconds → M3-local frame. */
export const F = (s: number) => Math.round(s * 60) - 780;

export const Z2 = FLOOR_Z.discover;
export const Z3 = FLOOR_Z.instance;

export const B = {
	// Sh08 · through the cards, into the search box
	tap1: F(13.1),
	tap2: F(13.4),
	tap3: F(13.7),
	see: F(13.85),
	dart: F(14.0),
	field: F(14.4),
	ring: F(14.9),
	glass: F(15.0),
	// Sh09
	flat: F(15.4),
	// Sh10 · title
	click: F(16.0),
	pinyin0: F(16.4),
	pinyin1: F(17.9),
	commit: F(18.0),
	q: F(18.5),
	search: F(18.7),
	// Sh11
	pull: F(19.5),
	pulled: F(20.0),
	empty: F(20.5),
	drift: F(21.3),
	flinch: F(21.6),
	doubleTake: F(21.9),
	snap: F(22.1),
	pop: F(22.25),
	onClear: F(22.45),
	// Sh12 · four misses
	perch: F(22.5),
	swoop1: F(22.9),
	click1: F(23.0),
	land2: F(23.75),
	swoop2: F(24.4),
	click2: F(24.5),
	cart: F(24.6),
	land3: F(25.25),
	swoop3: F(25.9),
	click3: F(26.0),
	modal: F(26.2),
	land4: F(26.75),
	swoop4: F(27.4),
	bigHop: F(27.45),
	click4: F(27.5),
	toast: F(27.7),
	badge: F(27.9),
	land5: F(28.0),
	// Sh13 · riding the progress bar
	toToast: F(28.5),
	ride: F(28.6),
	fling: F(29.3),
	curl: F(29.4),
	quick: F(30.0),
	end: F(30.5),
} as const;

export const LAST = B.end - 1; // 1049

/** Linear 0..1 ramp, clamped. */
export const ramp = (f: number, a: number, b: number) => clamp((f - a) / (b - a), 0, 1);

/** Average of a frame→number function over the previous n frames (deterministic smoothing, e.g. 150 ms UI transitions). */
export function smooth(fn: (f: number) => number, f: number, n: number): number {
	let s = 0;
	for (let k = 0; k < n; k++) s += fn(f - k);
	return s / n;
}

/** Landing squash with a little rebound: returns signed amount (≥0 squash, <0 stretch). */
export function landing(f: number, at: number, impact: number): number {
	const t = (f - at) / 60;
	if (t < 0 || impact <= 0) return 0;
	return impact * Math.exp(-9 * t) * Math.cos(2 * Math.PI * 3.6 * t);
}

/** Press pulse for a click at `at` (mouse down 2 frames before, up 5 after). */
export function pressPulse(f: number, at: number): number {
	if (f < at - 3 || f > at + 9) return 0;
	if (f <= at) return clamp((f - (at - 3)) / 3, 0, 1);
	return clamp(1 - (f - at - 3) / 6, 0, 1);
}
