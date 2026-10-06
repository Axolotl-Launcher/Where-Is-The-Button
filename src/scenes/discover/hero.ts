/**
 * The hero's pose in M3 as a pure function of the local frame.
 * Positions are WINDOW coordinates on F2 (the face centre); `h` is the height
 * of its underside above the F2 surface; `ground` the surface its shadow
 * falls on; `rest` the surface it is standing on (for the anti-clip lift).
 *
 * Forms: 'body' (3D UI slab / Disc), 'morph' (flattening + stretching into
 * the search field), 'ring' (the field's 4 px pink ring, ▷ in the icon slot),
 * 'overlay' (the Disc in quick-instance circle #1, drawn with the 2D shell).
 *
 * Frames ≤ 0 are shared with M2 (its last 12 frames render heroAt(−12…0)):
 * keep them unchanged.
 */
import {clamp, ease, lerp, noise1, springStep, V3} from '../../lib/anim';
import {B, landing, ramp, smooth} from './beats';
import {cursorAt} from './cursor';
import {CART_INSTALL, FIELD, installBox, MODAL_INSTALL, QUICK1, TOAST_BAR, EMPTY} from '../../ui/pages/discover/layout';

export type MorphShape = {
	x: number;
	y: number;
	w: number;
	h: number;
	r: number;
	/** Band thickness (≥ h/2 → solid). */
	b: number;
	/** Pink alpha of the body/band. */
	alpha: number;
	label: number;
	glyph: {x: number; y: number; size: number; pink: number; scale: number};
	rim: number;
};

export type RingState = {
	/** 0..1 visible fraction of the loop (snap-back retracts both strands into the ▷). */
	visible: number;
	/** 0..1 toward the hover darken #c5236b. */
	dark: number;
	/** Stroke alpha (.68 = the focus-ring look). */
	alpha: number;
	/** Stroke width (window px). */
	width: number;
	/** Loop contraction toward the field (window px; negative = springs past rest). */
	inset: number;
	glyphScale: number;
	/** ▷ recoil (window px) and squash. */
	glyphDx: number;
	glyphSx: number;
	glyphSy: number;
	dx: number;
	dy: number;
};

export type HeroPose = {
	mode: 'body' | 'morph' | 'ring' | 'overlay' | 'hidden';
	x: number;
	y: number;
	h: number;
	ground: number;
	/** Surface height it stands on (anti-clip lift); defaults to `ground`. */
	rest?: number;
	w: number;
	hh: number;
	r: number;
	d: number;
	sx: number;
	sy: number;
	sz: number;
	s: number;
	stretch: {angle: number; k: number};
	rx: number;
	ry: number;
	rz: number;
	hover: number;
	press: number;
	label: number;
	glyphDx: number;
	shadow: number;
	morph?: MorphShape;
	ring?: RingState;
};

type P = {x: number; y: number; h: number};
const p = (x: number, y: number, h: number): P => ({x, y, h});

// Surfaces (height above F2)
const CARD = 4;
const CARTH = 20;
const MODALH = 36;
const TOASTH = 20;

// Stations (window coords)
const PRE = p(548, 398, CARD);
const P1 = p(620, 392, CARD);
const P2 = p(700, 506, CARD);
const P3 = p(780, 660, CARD);
const PF = p(230, 144, 0);
const ib = installBox(1, 'install');
const CLEAR = p(EMPTY.button.x + EMPTY.button.w / 2, EMPTY.button.y + EMPTY.button.h / 2, 0);
const CLEAR3 = {x: CLEAR.x, y: CLEAR.y, z: 0};
const C2 = p(ib.x + ib.w / 2, ib.y + ib.h / 2, CARD);
const CART = p(CART_INSTALL.x + CART_INSTALL.w / 2 - 1, CART_INSTALL.y + CART_INSTALL.h / 2, CARTH);
// on the modal's 「取消」/「安装」, nudged left so the 144 px body (even squashed on landing) stays on the modal (right edge 1040)
const MOD = p(MODAL_INSTALL.x + MODAL_INSTALL.w / 2 - 46, MODAL_INSTALL.y + MODAL_INSTALL.h / 2, MODALH);
const L5 = p(780, 506, CARD);
const SKIP = p(1000, 330, CARD);
export const RIDE_Y = 205;
const RIDE0 = p(1112, RIDE_Y, TOASTH);
const QUICK = p(QUICK1.cx, QUICK1.cy, 0);
export const GLYPH_SLOT = {x: FIELD.x + 22, y: FIELD.y + 24};

/**
 * A hop: parabolic height over time; the planar path is a line (or a
 * quadratic curve through `via`), optionally with a burst (fast take-off that
 * eases into the landing: planar speed 1 + 2·burst × the mean at take-off).
 */
type Hop = {a: number; b: number; from: P; to: P; apex: number; via?: {x: number; y: number}; burst?: number};
/** Misses: the hero leaves this many frames before the click, so the pointer lands on the bare button. */
const LEAVE = 4;
const HOPS: Record<string, Hop> = {
	h0: {a: B.tap1 - 18, b: B.tap1, from: PRE, to: P1, apex: 40},
	h1: {a: B.tap1 + 3, b: B.tap2, from: P1, to: P2, apex: 46},
	h2: {a: B.tap2 + 3, b: B.tap3, from: P2, to: P3, apex: 46},
	pop: {a: B.pop, b: B.onClear, from: p(GLYPH_SLOT.x, GLYPH_SLOT.y, 0), to: CLEAR, apex: 120},
	perch: {a: B.perch, b: B.perch + 14, from: CLEAR, to: CLEAR, apex: 22},
	A: {a: B.click1 - LEAVE, b: B.land2, from: CLEAR, to: C2, apex: 150, burst: 1},
	// dodges down-right, away from the lunge, then curls down onto the cart (kept low: the cart sits at the frame's bottom edge)
	Bh: {a: B.click2 - LEAVE, b: B.land3, from: C2, to: CART, apex: 80, via: {x: 1080, y: 640}, burst: 0.6},
	// up toward the frame centre and back down onto the modal as it grows (stays in frame)
	Ch: {a: B.click3 - LEAVE, b: B.land4, from: CART, to: MOD, apex: 70, via: {x: 905, y: 500}, burst: 0.85},
	D: {a: B.bigHop, b: B.land5, from: MOD, to: L5, apex: 165, via: {x: 820, y: 470}, burst: 0.35},
	E: {a: B.land5 + 14, b: B.land5 + 26, from: L5, to: SKIP, apex: 40},
	T: {a: B.toToast, b: B.ride, from: SKIP, to: RIDE0, apex: 34},
	fl: {a: B.fling, b: B.quick, from: p(0, RIDE_Y, TOASTH), to: QUICK, apex: 230},
};

const hopAt = (hp: Hop, f: number): V3 & {t: number} => {
	const t = clamp((f - hp.a) / (hp.b - hp.a), 0, 1);
	const bu = hp.burst ?? 0;
	const u = bu > 0 ? (1 - bu) * t + bu * (1 - (1 - t) ** 3) : t;
	let x: number;
	let y: number;
	if (hp.via) {
		const w0 = (1 - u) * (1 - u);
		const w1 = 2 * u * (1 - u);
		const w2 = u * u;
		x = w0 * hp.from.x + w1 * hp.via.x + w2 * hp.to.x;
		y = w0 * hp.from.y + w1 * hp.via.y + w2 * hp.to.y;
	} else {
		x = lerp(hp.from.x, hp.to.x, u);
		y = lerp(hp.from.y, hp.to.y, u);
	}
	return {x, y, z: lerp(hp.from.h, hp.to.h, t) + 4 * hp.apex * t * (1 - t), t};
};

const base = (): HeroPose => ({
	mode: 'body',
	x: 0,
	y: 0,
	h: 0,
	ground: 0,
	w: 144,
	hh: 48,
	r: 16,
	d: 8,
	sx: 1,
	sy: 1,
	sz: 1,
	s: 1,
	stretch: {angle: 0, k: 1},
	rx: 0,
	ry: 0,
	rz: 0,
	hover: 0,
	press: 0,
	label: 1,
	glyphDx: 0,
	shadow: 1,
});

/**
 * Airborne look: stretch along the planar velocity, lean nose-first. The lean
 * fades in over `fadeIn` frames after take-off and out over `fadeOut` frames
 * before landing (no one-frame lean snaps).
 */
function airborne(o: HeroPose, hp: Hop, f: number, gain = 1, fadeIn = 3, fadeOut = 3) {
	const a = hopAt(hp, f - 0.5);
	const b = hopAt(hp, f + 0.5);
	const vx = b.x - a.x;
	const vy = b.y - a.y;
	const vz = b.z - a.z;
	const sp = Math.hypot(vx, vy);
	const k = 1 + clamp(gain * (sp * 0.006 + Math.abs(vz) * 0.003), 0, 0.2);
	o.stretch = {angle: (Math.atan2(vy, vx) * 180) / Math.PI, k};
	const env = (fadeIn > 0 ? ramp(f, hp.a, hp.a + fadeIn) : 1) * (fadeOut > 0 ? 1 - ramp(f, hp.b - fadeOut, hp.b) : 1);
	o.ry = clamp(vx * 0.7, -10, 10) * env;
	o.rx = clamp(-vy * 0.7, -10, 10) * env;
}

function squash(o: HeroPose, L: number) {
	o.sx *= 1 + 0.2 * L;
	o.sy *= 1 - 0.16 * L;
	o.sz *= 1 - 0.35 * L;
}

function anticipate(o: HeroPose, f: number, takeoff: number, n = 5, amt = 1) {
	if (f < takeoff - n || f >= takeoff) return;
	const c = Math.sin((Math.PI / 2) * ((f - (takeoff - n)) / n)) * amt;
	o.sx *= 1 + 0.09 * c;
	o.sy *= 1 - 0.08 * c;
	o.sz *= 1 - 0.3 * c;
}

function place(o: HeroPose, q: {x: number; y: number; z: number}, ground: number) {
	o.x = q.x;
	o.y = q.y;
	o.h = q.z;
	o.ground = ground;
}

/** Lean toward the cursor (the ▷ is its nose), ±8°. */
function lookAtCursor(o: HeroPose, f: number, amt = 1) {
	if (amt <= 0) return;
	const c = cursorAt(f);
	const dx = c.wx - o.x;
	const dy = c.wy - o.y;
	const dd = Math.max(1, Math.hypot(dx, dy));
	o.ry += clamp((dx / dd) * 8, -8, 8) * amt;
	o.rx += clamp((-dy / dd) * 8, -8, 8) * amt;
}

/** Its tell: the real hover darken (brightness .9) as the cursor closes in (within `radius`). */
function hoverFromCursor(f: number, cx: number, cy: number, radius = 240): number {
	return smooth(
		(k) => {
			const c = cursorAt(k);
			return Math.hypot(c.wx - cx, c.wy - cy) < radius ? 1 : 0;
		},
		f,
		5,
	);
}

const tremble = (f: number, amt: number, seed: number) => ({x: noise1(f * 0.9, seed) * amt, y: noise1(f * 0.9, seed + 7) * amt});
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Anti-clip: a body resting on a surface that leans (rx/ry about the centre
 * of its underside) would push one end through that surface. Raise it so the
 * underside's lowest corner sits on the surface (= tipping onto that edge).
 * Only for frames > 0 (frames ≤ 0 belong to M2's hand-off).
 */
function finalize(o: HeroPose, f: number): HeroPose {
	if (f <= 0 || o.mode !== 'body') return o;
	const rest = o.rest ?? o.ground;
	const W = o.w * o.sx * o.s;
	const H = o.hh * o.sy * o.s;
	const L = (W / 2) * Math.abs(Math.sin(rad(o.ry))) + (H / 2) * Math.abs(Math.sin(rad(o.rx))) * Math.cos(rad(o.ry));
	o.h = Math.max(o.h, rest + L + 0.6 * Math.min(1, L / 2));
	return o;
}

/** Toast bar fill 0..1 (shared with the page). */
export function toastP(f: number): number {
	if (f < B.toast) return 0;
	if (f < B.ride) return 0.103 * ease.out(ramp(f, B.toast + 10, B.ride));
	if (f >= B.fling) return 1;
	return 0.103 + (1 - 0.103) * rideFill(f - B.ride);
}

// install ticks (audio/cues.py: 8 ticks, 0.11 s apart from 28.60): the fill is a
// continuous conveyor that surges just after each tick (speed 0.55×–1.45× the mean)
const RIDE_LEN = B.fling - B.ride;
const TICK = 6.6;
const SURGE = 0.45;
const LAG = 1.5;
const fillRaw = (tau: number) => tau + ((SURGE * TICK) / (2 * Math.PI)) * (Math.sin((2 * Math.PI * (tau - LAG)) / TICK) - Math.sin((2 * Math.PI * -LAG) / TICK));
const rideFill = (tau: number) => fillRaw(clamp(tau, 0, RIDE_LEN)) / fillRaw(RIDE_LEN);
/** 0..1 pulse right after each install tick (the bar's shove). */
const tickPulse = (tau: number) => Math.max(0, Math.cos((2 * Math.PI * (tau - LAG)) / TICK));

export const barX = (pp: number) => TOAST_BAR.x + TOAST_BAR.w * pp;

const smin = (a: number, b: number, k: number) => Math.min(a, b) - k * Math.log(1 + Math.exp(-Math.abs(a - b) / k));
const smax = (a: number, b: number, k: number) => Math.max(a, b) + k * Math.log(1 + Math.exp(-Math.abs(a - b) / k));
const RIDE_STOP = TOAST_BAR.x + TOAST_BAR.w + 1; // the toast's right end

/**
 * Ride: the bar's leading edge pushes the hero's left edge; its right edge is
 * cushioned against the toast's end (soft-min) and the squeeze bottoms out
 * softly at 89 px (the bar then fills underneath it).
 */
function rideShape(f: number) {
	const xf = Math.max(RIDE0.x - 72, barX(toastP(f)));
	const right = smin(xf + 144, RIDE_STOP, 9);
	const w = smax(right - xf, 89, 6);
	const left = right - w;
	return {cx: (left + right) / 2, sx: w / 144, right};
}

/**
 * 14.00–14.40 the dart: one straight run P3 → PF (no stop: the camera follows
 * it, so a stop would read as sliding backwards), fast off the mark and easing
 * into the field; two arcs with a 2-frame skip on the Sodium card between.
 */
const DART_N = B.field - B.dart;
const DART_BURST = 0.55;
const DART_SKIP: [number, number] = [11, 13];
const DART_LEAN = 6;
/** Planar dart position (window) and its progress 0..1 (shared with the camera). */
export function dartPlanar(f: number) {
	const t = clamp((f - B.dart) / DART_N, 0, 1);
	const g = (1 - DART_BURST) * t + DART_BURST * (1 - (1 - t) * (1 - t));
	return {x: lerp(P3.x, PF.x, g), y: lerp(P3.y, PF.y, g), g};
}
function dartAt(f: number) {
	const q = dartPlanar(f);
	const tau = clamp(f - B.dart, 0, DART_N);
	let z: number;
	let ground: number;
	if (tau < DART_SKIP[0]) {
		const t = tau / DART_SKIP[0];
		z = CARD + 4 * 30 * t * (1 - t);
		ground = CARD;
	} else if (tau < DART_SKIP[1]) {
		z = CARD;
		ground = CARD;
	} else {
		const t = (tau - DART_SKIP[1]) / (DART_N - DART_SKIP[1]);
		z = lerp(CARD, 0, t) + 4 * 34 * t * (1 - t);
		ground = CARD * (1 - t);
	}
	return {x: q.x, y: q.y, z, ground};
}

export function heroAt(f: number): HeroPose {
	const o = base();

	// ── Sh08 · three card taps ───────────────────────────────────────────
	if (f < B.tap1) {
		place(o, hopAt(HOPS.h0, f), CARD);
		// no lean fade-in: the take-off (−12) is drawn by M2 and must stay as it is
		airborne(o, HOPS.h0, f, 1, 0, 3);
		return finalize(o, f);
	}
	if (f < HOPS.h1.a) {
		place(o, {x: P1.x, y: P1.y, z: CARD}, CARD);
		squash(o, landing(f, B.tap1, 0.7));
		return finalize(o, f);
	}
	if (f < B.tap2) {
		place(o, hopAt(HOPS.h1, f), CARD);
		airborne(o, HOPS.h1, f);
		if (f < HOPS.h1.a + 3) squash(o, landing(f, B.tap1, 0.7));
		return finalize(o, f);
	}
	if (f < HOPS.h2.a) {
		place(o, {x: P2.x, y: P2.y, z: CARD}, CARD);
		squash(o, landing(f, B.tap2, 0.75));
		return finalize(o, f);
	}
	if (f < B.tap3) {
		place(o, hopAt(HOPS.h2, f), CARD);
		airborne(o, HOPS.h2, f);
		return finalize(o, f);
	}
	if (f < B.dart) {
		place(o, {x: P3.x, y: P3.y, z: CARD}, CARD);
		squash(o, landing(f, B.tap3, 0.85));
		// 13.85 sees the cursor's shadow → leans back (away, down-right threat), trembles
		const lb = ease.out(ramp(f, B.see, B.see + 6));
		o.ry -= 9 * lb;
		o.rx += 7 * lb;
		const tr = tremble(f, 0.7 * lb, 3);
		o.x += tr.x;
		o.y += tr.y;
		anticipate(o, f, B.dart, 5, 1.2);
		return finalize(o, f);
	}
	// ── 14.00–14.40 the dart: one continuous run up the page with a skip on the Sodium card ──
	if (f < B.field) {
		const q = dartAt(f);
		place(o, q, q.ground);
		const tau = f - B.dart;
		const a = dartAt(f - 0.5);
		const b = dartAt(f + 0.5);
		const sp = Math.hypot(b.x - a.x, b.y - a.y);
		o.stretch = {angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, k: 1 + clamp(sp * 0.004 + Math.abs(b.z - a.z) * 0.003, 0, 0.18)};
		// nose-first lean (up-left), held through the skip, fading out into the field
		const env = 1 - ramp(f, B.field - 3, B.field);
		const blend = ramp(tau, 0, 4); // from the 13.85 lean-back (rx 7, ry −9)
		o.rx = lerp(7, DART_LEAN, blend) * env;
		o.ry = -lerp(9, DART_LEAN, blend) * env;
		if (tau >= DART_SKIP[0] && tau < DART_SKIP[1] + 1) {
			// the skip: a 2-frame squash-and-push, momentum unbroken
			squash(o, [0.45, 0.4, 0.1][Math.round(clamp(tau - DART_SKIP[0], 0, 2))]);
		}
		return finalize(o, f);
	}
	// ── 14.40–14.90 stretches along the field and wraps it as the ring ──
	const M0 = B.field + 3; // flat from here
	if (f < M0) {
		place(o, {x: PF.x, y: PF.y, z: 0}, 0);
		const L = ramp(f, B.field, M0);
		o.sx = 1 + 0.14 * L;
		o.sy = 1 - 0.1 * L;
		o.sz = 1 - 0.85 * L;
		return finalize(o, f);
	}
	if (f < B.ring + 4) {
		o.mode = 'morph';
		o.morph = morphAt(f, M0);
		return o;
	}
	// ── the ring (Sh09–Sh11) ─────────────────────────────────────────────
	if (f < B.pop) {
		o.mode = 'ring';
		o.ring = ringAt(f);
		return o;
	}
	// ── 22.25 pops out and arcs onto 「清除搜索」 ───────────────────────
	if (f < B.onClear) {
		place(o, hopAt(HOPS.pop, f), 0);
		airborne(o, HOPS.pop, f, 0.9);
		o.s = f < B.pop + 5 ? 0.3 + 0.82 * ease.outBack(ramp(f, B.pop, B.pop + 5)) : 1;
		o.hover = 1 - ramp(f, B.pop, B.pop + 9);
		return finalize(o, f);
	}
	if (f < HOPS.A.a) {
		const inPerch = f >= HOPS.perch.a && f < HOPS.perch.b;
		if (inPerch) {
			place(o, hopAt(HOPS.perch, f), 0);
			airborne(o, HOPS.perch, f);
		} else place(o, CLEAR3, 0);
		if (f < HOPS.perch.a) squash(o, landing(f, B.onClear, 1));
		else if (f >= HOPS.perch.b) squash(o, landing(f, HOPS.perch.b, 0.5));
		if (!inPerch) {
			const env = f < HOPS.perch.a ? 0 : ramp(f, HOPS.perch.b, HOPS.perch.b + 6) * (1 - ramp(f, HOPS.A.a - 5, HOPS.A.a));
			lookAtCursor(o, f, 0.8 * env);
			o.hover = hoverFromCursor(f, CLEAR.x, CLEAR.y);
			anticipate(o, f, HOPS.A.a, 5, 1);
		}
		return finalize(o, f);
	}
	// ── the four misses: hop A → card 2 「＋ 安装」, B → cart, C → modal, D big hop
	const seq: Array<[Hop, P, number]> = [
		[HOPS.A, C2, HOPS.Bh.a],
		[HOPS.Bh, CART, HOPS.Ch.a],
		[HOPS.Ch, MOD, HOPS.D.a],
	];
	for (let i = 0; i < seq.length; i++) {
		const [hp, st, next] = seq[i];
		if (f < hp.b) {
			const q = hopAt(hp, f);
			place(o, q, q.t > 0.5 ? hp.to.h : hp.from.h);
			airborne(o, hp, f);
			if (f < hp.a + 3) squash(o, -0.4 * Math.sin(Math.PI * ramp(f, hp.a, hp.a + 3)));
			// the hover darken it left with fades in the air (no one-frame pop)
			const prev = i === 0 ? CLEAR : seq[i - 1][1];
			o.hover = hoverFromCursor(hp.a - 1, prev.x, prev.y) * (1 - ramp(f, hp.a - 1, hp.a + 5));
			return finalize(o, f);
		}
		if (f < next) {
			place(o, {x: st.x, y: st.y, z: st.h}, st.h);
			squash(o, landing(f, hp.b, 0.9));
			lookAtCursor(o, f, 0.9 * ramp(f, hp.b, hp.b + 6) * (1 - ramp(f, next - 5, next)));
			o.hover = hoverFromCursor(f, st.x, st.y);
			const tr = tremble(f, 0.6 * o.hover, 5);
			o.x += tr.x;
			o.y += tr.y;
			anticipate(o, f, next, 5, 1.1);
			return finalize(o, f);
		}
	}
	// D · the biggest hop, a smug twirl
	if (f < HOPS.D.b) {
		const q = hopAt(HOPS.D, f);
		place(o, q, q.t < 0.5 ? MODALH : CARD);
		airborne(o, HOPS.D, f, 0.8);
		o.rz = 360 * ease.inOut(ramp(f, HOPS.D.a + 3, HOPS.D.b - 5));
		if (f < HOPS.D.a + 3) squash(o, -0.5 * Math.sin(Math.PI * ramp(f, HOPS.D.a, HOPS.D.a + 3)));
		o.hover = hoverFromCursor(HOPS.D.a - 1, MOD.x, MOD.y) * (1 - ramp(f, HOPS.D.a - 1, HOPS.D.a + 5));
		return finalize(o, f);
	}
	// lands back on the results, eyes the toast, skips toward it
	if (f < HOPS.E.a) {
		place(o, {x: L5.x, y: L5.y, z: CARD}, CARD);
		squash(o, landing(f, HOPS.D.b, 1));
		const look = ease.out(ramp(f, HOPS.D.b + 4, HOPS.D.b + 10));
		o.ry += 9 * look;
		o.rx += 9 * look;
		anticipate(o, f, HOPS.E.a, 4, 0.8);
		return finalize(o, f);
	}
	// E → SKIP → T: one bouncy run at the toast, nose up-right the whole way
	if (f < HOPS.E.b) {
		place(o, hopAt(HOPS.E, f), CARD);
		airborne(o, HOPS.E, f, 1, 0, 0);
		return finalize(o, f);
	}
	if (f < HOPS.T.a) {
		place(o, {x: SKIP.x, y: SKIP.y, z: CARD}, CARD);
		squash(o, landing(f, HOPS.E.b, 0.5));
		o.ry += 10;
		o.rx += 10;
		anticipate(o, f, HOPS.T.a, 4, 1.2);
		return finalize(o, f);
	}
	if (f < HOPS.T.b) {
		const q = hopAt(HOPS.T, f);
		place(o, q, q.t < 0.5 ? CARD : TOASTH);
		airborne(o, HOPS.T, f, 1.1, 0, 3);
		return finalize(o, f);
	}
	// ── Sh13 · riding the progress bar ───────────────────────────────────
	if (f < B.fling) {
		const r = rideShape(f);
		const tau = f - B.ride;
		// it hangs over the toast's bottom edge: shadow on the page below, stands on the toast
		place(o, {x: r.cx, y: RIDE_Y, z: TOASTH}, 0);
		o.rest = TOASTH;
		o.shadow = 0.8;
		squash(o, landing(f, B.ride, 0.7));
		o.sx *= r.sx;
		o.sy *= 1 + (1 - r.sx) * 0.55;
		o.ry -= 7 * ramp(f, B.ride, B.ride + 6); // leans back against the push
		o.h += 1.4 * tickPulse(tau) * (1 - ramp(f, B.fling - 14, B.fling - 8));
		if (r.sx < 0.99) {
			const tr = tremble(f, 1.1 * (1 - r.sx) * 2.2, 9);
			o.x += tr.x;
			o.y += tr.y;
		}
		return finalize(o, f);
	}
	// 29.30 flung (whoosh) in a long arc to the rail; curls into the Disc; frisbee spin
	if (f < B.quick) {
		const held = rideShape(B.fling - 1);
		const hp: Hop = {...HOPS.fl, from: p(held.cx, RIDE_Y, TOASTH)};
		const q = hopAt(hp, f);
		place(o, q, 0);
		airborne(o, hp, f, 0.6);
		o.shadow = 0.9;
		// release: the held squash springs open over 5 frames (sine ramp, ≤ ~30 px/frame), overshoots, settles
		const open = 0.5 - 0.5 * Math.cos(Math.PI * ramp(f, B.fling, B.fling + 5));
		const sxRel = f < B.fling + 5 ? lerp(held.sx, 1.3, open) : lerp(1.3, 1.0, ease.inOut(ramp(f, B.fling + 5, B.fling + 13)));
		o.sx *= sxRel;
		o.sy *= 1 / Math.sqrt(sxRel);
		// curl into the Disc (label fades first, ▷ recentres)
		const cu = ease.inOut(ramp(f, B.curl, B.curl + 13));
		o.w = lerp(144, 48, cu);
		o.r = lerp(16, 24, cu);
		o.label = 1 - ramp(f, B.curl, B.curl + 5);
		o.glyphDx = cu;
		// frisbee spin: one turn, upright for the last 0.2 s; tilt like a thrown disc
		o.rz = -360 * ease.inOut(ramp(f, B.curl + 3, B.quick - 12));
		o.rx += 14 * Math.sin(Math.PI * ramp(f, B.curl, B.quick));
		o.stretch.k = 1 + (o.stretch.k - 1) * (1 - cu);
		// flatten into the slot at touchdown
		o.sz *= 1 - 0.8 * ease.in(ramp(f, B.quick - 4, B.quick));
		// it springs off the toast's end: never past it while opening
		const k = o.stretch.k;
		const half = (o.w / 2) * o.sx * (Math.abs(Math.cos(rad(o.stretch.angle))) * (k - 1) + 1);
		o.x = Math.min(o.x, RIDE_STOP - half);
		return finalize(o, f);
	}
	// ── 30.00 lands on quick-instance circle #1 (drawn with the 2D shell) ─
	o.mode = 'overlay';
	o.x = QUICK.x;
	o.y = QUICK.y;
	o.w = 48;
	o.r = 24;
	o.label = 0;
	o.glyphDx = 1;
	squash(o, landing(f, B.quick, 0.75) * 0.8);
	o.press = Math.sin(Math.PI * ramp(f, B.quick, B.quick + 9));
	return o;
}

/**
 * The ring in Sh09–Sh11. 21.60 the flinch (the tell): in 3 frames the loop
 * clenches 3 px onto the field, thickens 4 → 7 px and darkens to #c5236b at
 * .95; the ▷ recoils away from the I-beam and squashes; then everything
 * springs back (overshoot) and holds tense, trembling ~1 px, until the snap.
 */
function ringAt(f: number): RingState {
	const fl = f - B.flinch;
	const att = fl < 0 ? 0 : fl < 3 ? ease.out(fl / 3) : 1 - springStep(f, B.flinch + 3, 60, 6, 0.35);
	const tense = fl < 0 ? 0 : ease.out(clamp(fl / 3, 0, 1));
	const tr = tremble(f, 1.0 * ramp(f, B.flinch + 4, B.flinch + 10), 11);
	const snapU = ramp(f, B.snap, B.pop);
	let gs = 1;
	if (f >= B.pop - 3) gs *= 1 + 0.28 * Math.sin(Math.PI * ramp(f, B.pop - 3, B.pop + 1));
	return {
		visible: 1 - snapU * snapU,
		dark: tense,
		alpha: 0.68 + 0.27 * tense - 0.07 * ramp(f, B.flinch + 3, B.flinch + 24),
		width: 4 + 0.8 * tense + 2.2 * Math.max(0, att),
		inset: 3 * att,
		glyphScale: gs,
		glyphDx: -4 * att,
		glyphSx: 1 - 0.2 * att,
		glyphSy: 1 + 0.08 * att,
		dx: tr.x,
		dy: tr.y,
	};
}

/** UI body → field ring (frames M0 … ring+4). */
function morphAt(f: number, M0: number): MorphShape {
	const A1 = M0 + 13; // elongation done
	const B1 = B.ring - 2; // wrapped
	const ua = ease.inOut(ramp(f, M0, A1));
	const ub = ease.out(ramp(f, A1 - 2, B1));
	// edges of the outer box
	const ringL = FIELD.x - 4;
	const ringR = FIELD.x + FIELD.w + 4;
	const ringT = FIELD.y - 4;
	const ringB = FIELD.y + FIELD.h + 4;
	const l0 = PF.x - 72 * 1.14;
	const r0 = PF.x + 72 * 1.14;
	const lA = lerp(l0, ringL + 10, ua);
	const rA = lerp(r0, ringR - 34, ua);
	const thin = 48 * 0.9 - 9 * Math.sin(Math.PI * ua) * (1 - ub);
	// tiny snap (14.90): overshoot outward 2 px and settle
	const snap = f >= B1 ? 2 * Math.sin(Math.PI * ramp(f, B1, B.ring + 4)) : 0;
	const L = lerp(lA, ringL, ub) - snap;
	const R = lerp(rA, ringR, ub) + snap;
	const hgt = lerp(thin, ringB - ringT, ub) + 2 * snap;
	const cy = FIELD.y + FIELD.h / 2;
	const bSolid = hgt / 2;
	const b = lerp(bSolid, 4, ease.inOut(ramp(f, A1 - 1, B1)));
	const gx0 = l0 + 37 * 1.14;
	const gx = lerp(lerp(gx0, ringL + 34, ua), GLYPH_SLOT.x, ub);
	const gsize = lerp(24, 20, ub);
	// ▷ colour keyed to what is under it: white on the solid band, brand pink
	// once the interior has opened around it (a 2-frame switch as the hole
	// reaches half the triangle's height)
	const interior = hgt - 2 * b;
	const pink = clamp((interior - 5) / 8, 0, 1);
	return {
		x: L,
		y: cy - hgt / 2,
		w: R - L,
		h: hgt,
		r: 16,
		b,
		alpha: lerp(1, 0.68, ramp(f, A1 + 2, B1)),
		label: 1 - ramp(f, M0, M0 + 6),
		glyph: {x: gx, y: cy, size: gsize, pink, scale: 1},
		rim: 1 - ramp(f, M0, A1),
	};
}
