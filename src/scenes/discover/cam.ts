/**
 * M3 camera: diorama over the results (Sh08) → flat real-app framing (Sh09)
 * → push to ≈4× on the field while typing, ease out to the whole field for
 * the title (Sh10) → 1.6× on the results, push in on the ring for the tell
 * (Sh11) → full window / 1.5× on the modal / full window for the toast and
 * badge (Sh12) → 1.46× top-right on the toast, pan left with the fling
 * (Sh13) → navigation dolly to flatCam(F3) (exit).
 */
import {Cam} from '../../stage/Stage';
import {camTrack, flatCam, lerpCam} from '../../film/camera';
import {clamp, ease, EaseFn, lerp} from '../../lib/anim';
import {toWorld} from '../../film/timeline';
import {B, ramp, Z2, Z3} from './beats';
import {dartPlanar} from './hero';

const dcam = (wx: number, wy: number, pitch: number, yaw: number, persp: number, dist: number): Cam => ({
	...toWorld(wx, wy, Z2),
	dist,
	pitch,
	yaw,
	roll: 0,
	persp,
});

/** Entry state (hand-off from M2 at 13.00 s). */
export const CAM_ENTRY = dcam(700, 470, 50, -15, 1600, 1080);

// 13.00–13.70 the lens lengthens (dolly-zoom 1600 → 2500 at constant scale): the crane settles into a calm miniature
const DART_FROM = dcam(752, 560, 49, -15, 2600, 1760);
const DIORAMA: Array<[number, Cam, EaseFn?]> = [
	[0, CAM_ENTRY],
	[B.tap3, dcam(742, 548, 50, -15, 2500, 1690), ease.inOut],
	[B.dart, DART_FROM, ease.inOut],
];

// 14.00–14.55 the dart: the camera FOLLOWS the hero up the page (a smoothed —
// double box filter, nearly centred — copy of its path progress, covering ~60 %
// of its travel), so on screen the hero always leads and never slides
// backwards; zoom and tilt lag behind (the zoom pushes outward from the centre,
// so it waits until the hero is past it).
const DART_TO = dcam(424, 200, 40, -10, 2550, 1330);
// 14.55–15.0 a slow drift onto the ring while it wraps the field
const RING_CAM = dcam(434, 176, 35, -8, 2450, 1275);

/** Double box filter (lag) of the hero's progress: W1 then W2 frames. */
function follow(f: number, w1 = 6, w2 = 5): number {
	let s = 0;
	for (let j = 0; j < w2; j++) {
		let t = 0;
		for (let k = 0; k < w1; k++) t += dartPlanar(f - j - k).g;
		s += t / w1;
	}
	return s / w2;
}

const TILT_END = B.flat + 4;

function dioramaAt(f: number): Cam {
	const c0 = camTrack(f, DIORAMA); // holds DART_FROM after B.dart
	if (f <= B.dart - 3) return c0;
	const u = follow(f + 2); // nearly centred: eases in with the take-off, settles soon after the landing
	const v = ease.inOut(ramp(f, B.dart + 4, B.field + 8));
	const a: Cam = {
		x: c0.x + (DART_TO.x - DART_FROM.x) * u,
		y: c0.y + (DART_TO.y - DART_FROM.y) * u,
		z: Z2,
		dist: lerp(c0.dist, DART_TO.dist, v),
		pitch: lerp(c0.pitch, DART_TO.pitch, v),
		yaw: lerp(c0.yaw, DART_TO.yaw, v),
		roll: 0,
		persp: lerp(c0.persp, DART_TO.persp, v),
	};
	const b = lerpCam(a, RING_CAM, ease.inOut(ramp(f, B.field + 6, B.ring + 6)));
	// one continuous tilt up to the real-app framing, 14.77 → 15.47 (no linear segment, no hitch)
	return lerpCam(b, flatCam(Z2), ease.inOut(ramp(f, B.ring - 8, TILT_END)));
}

/** Flat keys: [frame, wx, wy, scale, ease into, persp]. Scale interpolates geometrically. */
type FK = [number, number, number, number, EaseFn?, number?];
const FLAT: FK[] = [
	[B.flat, 720, 405, 4 / 3],
	[B.click, 720, 405, 4 / 3],
	// typing at ≈4.2× on the field's left half
	[B.click + 36, 293, 165, 4.2, ease.inOut],
	[B.q, 292, 164.5, 4.26, ease.inOut],
	// 18.50–18.83 the title frame: the whole ring, ▷, text and ✕ as one sentence (top edge stays on the window)
	[B.q + 20, 430, 216, 2.5, ease.inOut],
	[B.pull, 432, 217, 2.47, ease.inOut],
	[B.pulled, 600, 340, 1.6, ease.inOut],
	[B.drift - 4, 597, 338, 1.62, ease.inOut],
	// 21.23–21.63 push in on the ring for the tell (whole ring + I-beam + 「这里还是空的」 in frame)
	[B.flinch + 2, 462, 258, 2.1, ease.inOut],
	[B.snap, 466, 262, 2.14, ease.inOut],
	// the ring lets go: pull back through the snap and the pop → the full window for miss 1
	[B.swoop1, 720, 405, 4 / 3, ease.inOut],
	[B.click3 + 2, 720, 405, 4 / 3],
	[B.land4 - 3, 720, 405, 1.5, ease.inOut],
	[B.click4 + 4, 720, 405, 1.5],
	// the modal closes: back to the full window for the twirl, the toast and the 「1」 badge
	[B.badge, 720, 405, 4 / 3, ease.inOut],
	[B.land5 + 8, 720, 405, 4 / 3],
	[B.toToast + 4, 802, 372, 1.46, ease.inOut, 1400],
	[B.fling, 804, 371, 1.47, ease.linear, 1400],
	[B.quick, 720, 405, 4 / 3, ease.inOut],
];

function flatAt(f: number): Cam {
	if (f <= FLAT[0][0]) return flatCam(Z2, {wx: FLAT[0][1], wy: FLAT[0][2], scale: FLAT[0][3]});
	for (let i = 1; i < FLAT.length; i++) {
		const [f1, x1, y1, s1, e, p1 = 1000] = FLAT[i];
		if (f <= f1) {
			const [f0, x0, y0, s0, , p0 = 1000] = FLAT[i - 1];
			const t = (e ?? ease.inOut)(clamp((f - f0) / Math.max(1, f1 - f0), 0, 1));
			// zoom about a fixed screen point: interpolate the scale geometrically and the
			// centre so that features travel in straight lines on screen
			const s = Math.exp(lerp(Math.log(s0), Math.log(s1), t));
			const k = (1 / s - 1 / s1) / (1 / s0 - 1 / s1 || 1e-9);
			const kk = Math.abs(s1 - s0) < 1e-6 ? 1 - t : clamp(k, 0, 1);
			return flatCam(Z2, {wx: lerp(x1, x0, kk), wy: lerp(y1, y0, kk), scale: s, persp: lerp(p0, p1, t)});
		}
	}
	const l = FLAT[FLAT.length - 1];
	return flatCam(Z2, {wx: l[1], wy: l[2], scale: l[3], persp: l[5] ?? 1000});
}

export const CAM_EXIT = flatCam(Z3);
const DOLLY_END = B.end - 4;

export function camAt(f: number): Cam {
	if (f < TILT_END) return dioramaAt(f);
	if (f < B.quick) return flatAt(f);
	// navigation plunge: the content well drops one floor (dolly 720 down)
	const u = ease.inOut(clamp((f - B.quick) / (DOLLY_END - B.quick), 0, 1));
	const c = flatCam(Z2);
	return {...c, z: lerp(Z2, Z3, u)};
}
