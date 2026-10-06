/**
 * M4 choreography — every value is a pure function of the module-local frame
 * (0 = 30.50 s, 570 = 40.00 s). Positions are WINDOW coordinates on a floor
 * plus a lift above that floor's surface; the scene converts to world space.
 *
 * Beat map (storyboard §4 Sh14–Sh16, SFX §7):
 *   0   30.50  Disc pops out of the quick circle            9  30.65 lands on Litematica's icon
 *   30  31.00  install finishes → toggle appears            33–72 crouch + three inchworm steps into the toggle
 *   90  32.00  cursor rushes to the twin 「开始游戏」          108 32.30 hover (twin darkens, stays)
 *   178 33.47  ▷-knob snickers (three giggles, then a gulp)  189 33.65 cursor whips round
 *   210 34.00  click → toggle OFF                            213 34.05 hero squirts out (cork)
 *   228 34.30  bounce                                        246–282 runs left · 282 35.20 leaps
 *   300 35.50  lands on the quick circle (Disc)              330 36.00 bonks 下载 (badge 「1」)
 *   360 36.50  lands hard on 实验室 → navigation (inchworm, plunge to F4, floor swap at 378)
 *   408 37.30  uncurls                                       462–510 38.20–39.00 the long leap
 *   510 39.00  lands on 种子地图 「› 进入」 → press           514 39.07 trapdoor (the button is the flap) opens
 *   519 39.15  squeezes through the 80 × 32 hole, drops     534 39.40 cursor clicks the same spot, dives in
 *   512–570    one continuous camera move: push into the trapdoor, then the dive — the eye swings past F4's
 *              front edge and below it (F4 dissolves, then is culled) and arrives on M5's hand-off camera
 *              WITH its velocity (CUT / CUT_V in src/scenes/seedmap/plan.ts), so the 40.00 cut has no stall.
 */
import {bump, clamp, ease, EaseFn, Key, lerp, noise1, prog, track, wobble} from '../../lib/anim';
import {Cam} from '../../stage/Stage';
import {flatCam} from '../../film/camera';
import {FLOOR_Z, toWorld} from '../../film/timeline';
import {CursorKind} from '../../characters/Cursor';
import {INST} from '../../ui/pages/InstancePage';
import {LAB} from '../../ui/pages/LabPage';
import {navY} from '../../ui/shell/AppWindow';
import {CamPose, camOf, CUT, CUT_CURSOR, CUT_CURSOR_V, CUT_V, DIVE_MID, fallTilt, hermite1, hermitePose, poseDiff, poseOf} from '../seedmap/plan';

export const FPS = 60;
export const M4_FROM = 30.5;
/** Film seconds → module-local frame. */
export const at = (s: number) => Math.round((s - M4_FROM) * FPS);

export const F3 = FLOOR_Z.instance;
export const F4 = FLOOR_Z.lab;
export const F5 = FLOOR_Z.seedmap;
/** Frame at which the content plunge swaps F3 for F4 (well empty, identical flat framing). */
export const SWAP = 378;
/** Module frame of the 40.00 cut. */
export const END = 570;

const std: EaseFn = (t) => ease.ui(t); // (.2,0,0,1)
/** Symmetric sine ease: peak speed only 1.57× the average (no one-frame lurches). */
const sine: EaseFn = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
/** Fast attack from rest, long brake: peak speed 1.52× the average. */
const rushEase: EaseFn = (t) => sine(Math.pow(clamp(t, 0, 1), 0.8));

// ── places (window coordinates) ─────────────────────────────────────────────
export const P = {
	quick: {x: 32, y: navY(8) + 17 + 24}, // quick-instance circle #1 (537)
	icon: {x: INST.rowIcon(INST.liteRow).cx, y: INST.rowIcon(INST.liteRow).cy}, // (161, 718)
	toggle: {x: INST.toggle(INST.liteRow).cx, y: INST.toggle(INST.liteRow).cy}, // (1303, 718)
	twin: {x: INST.twin.x + INST.twin.w / 2, y: INST.twin.y + INST.twin.h / 2}, // (1289, 96)
	downloads: {x: 32, y: navY(7) + 24}, // 464
	/** Where the bonk lands: the lower half of 下载, leaving its badge 「1」 visible above. */
	bonk: {x: 32, y: navY(7) + 42}, // 482
	labNav: {x: 32, y: navY(6) + 24}, // 408
	enter: {x: LAB.enter(LAB.seedMap).cx, y: LAB.enter(LAB.seedMap).cy}, // (1359, 641)
};

/**
 * M5's frame-0 state (film 40.00 s) as planned in src/scenes/seedmap/plan.ts — the dive ends exactly here.
 * Camera: CUT (look-at window (1260, 360) raised 100 above F5, dist 820, pitch 56°, persp 900; eye ≈ 160 below F4),
 * reached with velocity CUT_V. Hero (UI) falling 360 above F5 at (1380, 657); cursor ≈ 200 above it (CUT_CURSOR).
 */
export const EXIT = {
	cam: camOf(CUT),
	hero: {x: 1372 + 14 * Math.sin(0.6), y: 652 + 5, lift: 360},
	cursor: CUT_CURSOR,
};

// ── hero forms ──────────────────────────────────────────────────────────────
export type Form = {w: number; h: number; r: number; glyph: number; label: number; d: number; gdx: number};
export const UI: Form = {w: 144, h: 48, r: 16, glyph: 24, label: 1, d: 8, gdx: 0};
/** Library hover-play disc: 48 circle, ▷ +2 px (ButtonFace adds the first +1). */
export const DISC: Form = {w: 48, h: 48, r: 24, glyph: 24, label: 0, d: 8, gdx: 1};
/** Toggle disguise: 48 × 24 pink track, 12 px white ▷ in the knob's ON slot (centre x 36). */
export const TOGGLE: Form = {w: 48, h: 24, r: 12, glyph: 12, label: 0, d: 1.5, gdx: 11};

export const mixForm = (a: Form, b: Form, t: number): Form => ({
	w: lerp(a.w, b.w, t),
	h: lerp(a.h, b.h, t),
	r: lerp(a.r, b.r, t),
	glyph: lerp(a.glyph, b.glyph, t),
	label: lerp(a.label, b.label, t),
	d: lerp(a.d, b.d, t),
	gdx: lerp(a.gdx, b.gdx, t),
});

/**
 * The label actually drawn: only once the body is wide enough to hold 「开始游戏」 (ButtonFace
 * would otherwise ellipsize it to 「开始游…」 while a morph widens or narrows the body).
 */
export const labelShown = (form: Form) => form.label * clamp((form.w - 128) / 16, 0, 1);

export type HeroPose = {
	/** Floor the window coordinates refer to. */
	floor: number;
	wx: number;
	wy: number;
	/** Height of the underside above that floor's surface. */
	lift: number;
	/** Floor receiving the contact shadow (null = none). */
	shadowZ: number | null;
	shadow: number;
	form: Form;
	/** Absolute window x of the ▷ centre (overrides the form's native slot). */
	glyphX?: number;
	glyphDy: number;
	glyphJx: number;
	sx: number;
	sy: number;
	sz: number;
	rx: number;
	ry: number;
	rz: number;
	hover: number;
	press: number;
};

/** Landing squash (bible §3.9: sx 1+0.2i, sy 1−0.16i, ≈220 ms decay) mapped to a slab lying on the floor. */
function land(f: number, fl: number, i: number) {
	if (f < fl) return {sx: 1, sy: 1, sz: 1};
	const t = (f - fl) / FPS;
	const s = i * Math.exp(-13 * t) * Math.cos(2 * Math.PI * 3.2 * t);
	return {sx: 1 + 0.16 * s, sy: 1 + 0.12 * s, sz: 1 - 0.45 * s};
}

/** Ballistic hop on [f0, f1] with apex h (lift), plus airborne stretch along the dominant axis. */
function hopAt(f: number, f0: number, f1: number, a: {x: number; y: number}, b: {x: number; y: number}, h: number, la = 0, lb = 0) {
	const t = clamp((f - f0) / (f1 - f0), 0, 1);
	const x = lerp(a.x, b.x, t);
	const y = lerp(a.y, b.y, t);
	const lift = lerp(la, lb, t) + 4 * h * t * (1 - t);
	const v = Math.abs(1 - 2 * t); // 1 at take-off / landing, 0 at apex
	const st = 0.1 * v;
	const alongX = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
	return {x, y, lift, t, sx: alongX ? 1 + st : 1 - st * 0.6, sy: alongX ? 1 - st * 0.6 : 1 + st};
}

const base = (over: Partial<HeroPose>): HeroPose => ({
	floor: F3,
	wx: P.quick.x,
	wy: P.quick.y,
	lift: 0,
	shadowZ: F3,
	shadow: 1,
	form: DISC,
	glyphDy: 0,
	glyphJx: 0,
	sx: 1,
	sy: 1,
	sz: 1,
	rx: 0,
	ry: 0,
	rz: 0,
	hover: 0,
	press: 0,
	...over,
});

const mul = (p: HeroPose, s: {sx: number; sy: number; sz: number}): HeroPose => ({...p, sx: p.sx * s.sx, sy: p.sy * s.sy, sz: p.sz * s.sz});

/**
 * Leans pivot about the centre of the underside, so a resting lean would sink one end of the body into the
 * surface it stands on (the floor plane slices it). Lift the body until its lowest corner touches the surface.
 */
function perch(p: HeroPose): HeroPose {
	if (p.lift < -0.01) return p; // sinking / falling: no contact
	const rx = (p.rx * Math.PI) / 180;
	const ry = (p.ry * Math.PI) / 180;
	const need = ((p.form.w * p.sx) / 2) * Math.abs(Math.sin(ry)) + ((p.form.h * p.sy) / 2) * Math.abs(Math.sin(rx)) * Math.cos(ry);
	return need > p.lift ? {...p, lift: need} : p;
}

export const heroPose = (f: number): HeroPose => perch(heroPoseRaw(f));

// 33–72 「收拢」: crouch, then three inchworm steps along the row into the toggle. The leading edge reaches
// first, the tail follows ≈5 frames later; the body never stretches past ≈2.6× its length (≤ 372 px).
const WORM_R: Key[] = [
	[33, 281],
	[38, 268, ease.inOut], // crouch: pulls back
	[48, 620, sine],
	[49, 620],
	[59, 980, sine],
	[68, 1327, sine],
];
const WORM_L: Key[] = [
	[33, 137],
	[38, 141, ease.inOut],
	[43, 141],
	[53, 500, sine],
	[54, 500],
	[63, 880, sine],
	[72, 1279, sine],
];
/** Rest length of the body as it thins step by step (144 → 120 → 100 → 48). */
const WORM_REST: Key[] = [
	[43, 144],
	[53, 120, sine],
	[54, 120],
	[63, 100, sine],
	[72, 48, sine],
];

function heroPoseRaw(f: number): HeroPose {
	// Sh14 · 0–9 pop out of the quick circle onto Litematica's icon
	// (M3 hands over a flat 2D Disc drawn with the shell: start paper-thin, gain the 8 px body in the pop)
	const thick = (ff: number) => ({...DISC, d: lerp(1, 8, prog(ff, 0, 6, ease.out))});
	if (f < 2) {
		const s = prog(f, 0, 2, ease.out);
		return base({form: thick(f), sx: 1 + 0.08 * s, sy: 1 + 0.08 * s, sz: 1 - 0.4 * s, shadow: prog(f, 0, 6)});
	}
	if (f < 9) {
		const hp = hopAt(f, 2, 9, P.quick, P.icon, 58);
		return base({form: thick(f), wx: hp.x, wy: hp.y, lift: hp.lift, sx: hp.sx, sy: hp.sy, shadow: prog(f, 0, 6)});
	}
	// 9–33 land, uncurl (left edge stays on the icon's), look left, then at the new toggle
	if (f < 33) {
		const u = prog(f, 11, 24, rushEase);
		const form = mixForm(DISC, UI, u);
		const ry = track(f, [
			[24, 0],
			[28, -6, ease.inOut],
			[30, -6],
			[33, 8, ease.outBack],
		]);
		return mul(base({form, wx: 137 + form.w / 2 + ry * 0.35, wy: P.icon.y, ry}), land(f, 9, 1));
	}
	// 33–72 the inchworm squeeze (「收拢」)
	if (f < 72) {
		const right = track(f, WORM_R);
		const left = track(f, WORM_L);
		const w = right - left;
		const rest = track(f, WORM_REST);
		const stretch = Math.max(1, w / rest);
		const crouch = bump(f, 33, 43); // anticipation: bunches up (thicker, taller), then launches
		const hb = track(f, [
			[38, 48],
			[53, 42, sine],
			[63, 34, sine],
			[72, 24, sine],
		]);
		const h = (hb * (1 + 0.06 * crouch)) / (1 + 0.22 * (stretch - 1));
		const label = 1 - prog(f, 33, 37);
		const glyph = f < 59 ? 24 : lerp(24, 12, prog(f, 59, 70, sine));
		const d = lerp(8, 1.5, prog(f, 40, 70));
		const form: Form = {w, h, r: Math.min(h / 2, lerp(16, 12, prog(f, 38, 70))), glyph, label, d, gdx: 0};
		// the ▷ (its nose) moves to the leading end in the crouch and rides it; it ends in the knob's ON slot
		const nativeX = 137 + 37; // ▷ slot of the UI form
		const lead = right - lerp(26, 12, prog(f, 59, 68, sine));
		const glyphX = lerp(nativeX, lead, sine(prog(f, 33, 40)));
		return base({
			form,
			glyphX,
			wx: (left + right) / 2,
			wy: P.toggle.y,
			ry: track(f, [
				[33, 8],
				[37, -3, ease.inOut],
				[42, 0, ease.inOut],
			]),
			sz: 1 + 0.3 * crouch,
			sy: 1 - 0.04 * bump(f, 40, 70),
			shadow: lerp(1, 0.2, prog(f, 60, 72)),
		});
	}
	// 72–213 hidden as the toggle: settles; snicker 178–196 (three giggles, the last cut short by a gulp);
	// frozen tremble 196–210; pressed 210–213
	if (f < 213) {
		const settle = wobble(f, 71, FPS, 5.5, 9);
		const gs = 178;
		const gp = 6;
		const ph = (f - gs) / gp; // 0..3 over the three giggles
		const on = ph > 0 && ph < 3;
		const env = on ? clamp((f - gs) / 2, 0, 1) * (1 - 0.15 * Math.floor(ph)) : 0;
		const bounce = on ? Math.sin(Math.PI * (ph % 1)) : 0; // airborne part of each giggle
		const hop = bounce * env;
		const squash = on ? Math.pow(1 - bounce, 3) * env : 0; // contact squash between giggles
		const gulp = prog(f, 195, 199, ease.out) * (1 - prog(f, 206, 210)); // freezes, a little squashed
		const tremble = f >= 196 && f < 210 ? (noise1(f * 0.9, 3) > 0 ? 0.5 : -0.5) : 0;
		const pressed = prog(f, 210, 212, ease.out);
		return base({
			form: TOGGLE,
			wx: P.toggle.x + tremble,
			wy: P.toggle.y - 5 * hop,
			lift: 3 * hop,
			glyphDy: -2.5 * hop,
			glyphJx: 1.6 * Math.sin((2 * Math.PI * (f - gs)) / 4.5) * env,
			sx: 1 + 0.07 * settle + 0.12 * squash - 0.03 * hop + 0.04 * gulp + 0.05 * pressed,
			sy: 1 - 0.09 * settle - 0.25 * squash + 0.06 * hop - 0.1 * gulp - 0.16 * pressed,
			press: pressed,
			shadow: 0.2 + 0.5 * hop,
		});
	}
	// 213–228 squirts out like soap, pops up and back over the track (cork)
	if (f < 228) {
		const hp = hopAt(f, 213, 228, {x: P.toggle.x + 10, y: P.toggle.y}, {x: 1150, y: 650}, 92);
		const m = prog(f, 213, 222, ease.out);
		const form = mixForm(TOGGLE, UI, m);
		const sx = track(f, [
			[213, 1.65],
			[217, 1.2, ease.out],
			[222, 0.94],
			[227, 1],
		]);
		const sy = track(f, [
			[213, 0.55],
			[217, 0.85, ease.out],
			[222, 1.06],
			[227, 1],
		]);
		return base({form, wx: hp.x, wy: hp.y, lift: hp.lift, sx, sy, ry: lerp(-12, 6, hp.t), shadow: lerp(0.2, 1, m)});
	}
	// 228–246 bounce, second small hop leftwards
	if (f < 246) {
		const hp = hopAt(f, 230, 246, {x: 1150, y: 650}, {x: 990, y: 622}, 34);
		return mul(base({form: UI, wx: hp.x, wy: hp.y, lift: hp.lift, sx: hp.sx, sy: hp.sy, ry: -5}), land(f, 228, 0.95));
	}
	// 246–282 runs left (three skips)
	if (f < 282) {
		const u = prog(f, 246, 282, (t) => ease.inOut(t) * 0.25 + t * 0.75);
		const skip = Math.abs(Math.sin((Math.PI * (f - 246)) / 12));
		const a = prog(f, 276, 282, ease.out); // anticipation for the leap
		return mul(
			base({
				form: UI,
				wx: lerp(990, 360, u),
				wy: lerp(622, 565, u),
				lift: 13 * skip * (1 - a),
				ry: -8,
				sx: 1.08 - 0.06 * a,
				sy: 0.95,
				sz: 1 - 0.35 * a,
			}),
			land(f, 246, 0.6),
		);
	}
	// 282–300 leaps for the rail, curling into the Disc
	if (f < 300) {
		const hp = hopAt(f, 282, 300, {x: 360, y: 565}, P.quick, 72);
		const form = mixForm(UI, DISC, prog(f, 284, 297, ease.inOut));
		return base({form, wx: hp.x, wy: hp.y, lift: hp.lift, sx: hp.sx, sy: hp.sy, ry: lerp(-10, 4, hp.t)});
	}
	// Sh15 · 300–360 up the rail: quick circle → bonk 下载 (330) → 实验室 (360)
	if (f < 318) {
		const a = prog(f, 312, 318, ease.out);
		return mul(base({sz: 1 - 0.35 * a, sx: 1 + 0.05 * a, sy: 1 + 0.05 * a}), land(f, 300, 0.9));
	}
	if (f < 330) {
		const hp = hopAt(f, 318, 330, P.quick, P.bonk, 38);
		return base({wx: hp.x, wy: hp.y, lift: hp.lift, sx: hp.sx, sy: hp.sy});
	}
	if (f < 338) {
		const a = prog(f, 334, 338, ease.out);
		return mul(base({wx: P.bonk.x, wy: P.bonk.y, sz: 1 - 0.3 * a}), land(f, 330, 1.15));
	}
	if (f < 360) {
		const hp = hopAt(f, 338, 360, P.bonk, P.labNav, 50);
		return base({wx: hp.x, wy: hp.y, lift: hp.lift, sx: hp.sx, sy: hp.sy});
	}
	const floor = f < SWAP ? F3 : F4;
	if (f < 408) {
		const press = track(f, [
			[360, 0],
			[363, 1, ease.out],
			[372, 0, ease.inOut],
		]);
		return mul(base({floor, shadowZ: floor, wx: P.labNav.x, wy: P.labNav.y, press}), land(f, 360, 1.35));
	}
	// Sh16 · 408–462 uncurls on the rail, eyes the column of pink 「› 进入」, winds up
	if (f < 462) {
		const u = prog(f, 408, 421, rushEase);
		const form = mixForm(DISC, UI, u);
		const ry = track(f, [
			[421, 0],
			[430, 8, ease.outBack],
			[450, 8],
			[462, -4, ease.inOut],
		]);
		const rx = track(f, [
			[430, 0],
			[436, -5, ease.inOut],
			[442, 4, ease.inOut],
			[448, 0, ease.inOut],
		]);
		const a = prog(f, 450, 462, ease.inOut);
		return base({
			floor: F4,
			shadowZ: F4,
			form,
			wx: 8 + form.w / 2,
			wy: P.labNav.y,
			ry,
			rx,
			sz: 1 - 0.4 * a,
			sx: 1 + 0.07 * a,
			sy: 1 + 0.05 * a,
		});
	}
	// 462–510 the long leap across the Lab (clears 渐变文字生成器)
	const from = {x: 80, y: P.labNav.y};
	if (f < 510) {
		const hp = hopAt(f, 462, 510, from, P.enter, 232);
		return base({floor: F4, shadowZ: F4, form: UI, wx: hp.x, wy: hp.y, lift: hp.lift, sx: 1 + 0.12 * Math.abs(1 - 2 * hp.t), sy: 0.96, ry: lerp(-11, 12, hp.t)});
	}
	// 510–527 lands on 「› 进入」, presses it; the button flap drops and it squeezes through the 80 × 32 hole:
	// it sags into the slot, gathers itself (a 2-frame bulge), then pops through narrow and stretched deep
	if (f < 527) {
		const l = land(f, 510, 1.1);
		const sink = track(f, [
			[514, 0],
			[518, -2.5, ease.inOut], // sags onto the rim as the flap falls away
			[520, -2, ease.inOut],
			[523, -14, ease.in],
			[527, -46, ease.in],
		]);
		const sqx = track(f, [
			[516, 1],
			[519, 1.15, ease.out], // gathers…
			[523, 0.52, ease.in], // …and pops through
		]);
		const sqy = track(f, [
			[516, 1],
			[519, 0.9, ease.out],
			[523, 0.62, ease.in],
		]);
		const sqz = track(f, [
			[519, 1],
			[524, 2.6, ease.inOut],
		]);
		const press = track(f, [
			[510, 0],
			[513, 1, ease.out],
		]);
		return base({
			floor: F4,
			shadowZ: f < 520 ? F4 : null,
			form: UI,
			wx: P.enter.x,
			wy: P.enter.y,
			lift: sink,
			sx: l.sx * sqx,
			sy: l.sy * sqy,
			sz: l.sz * sqz,
			press,
		});
	}
	// 527–570 falls toward F5; ends exactly in M5's frame-0 state (src/scenes/seedmap/plan.ts heroAt(0)):
	// (1379.9, 657), 360 above F5, falling at 700 px/s, presented to the lens (fallTilt: rx −30, half flutter)
	const tau = (f - 527) / FPS;
	const TE = (END - 527) / FPS;
	const lift = -46 - 176.2 * tau - 365.4 * tau * tau;
	const s = Math.exp(-5.5 * tau) * Math.cos(2 * Math.PI * 3.4 * tau); // squeeze recovery: 1 → damped overshoot
	const k = clamp(tau / TE, 0, 1);
	const env = 1 - (1 - k) * (1 - k);
	const tt = tau - TE; // M5's clock (0 at 40.00)
	const ft = fallTilt(tt);
	return base({
		floor: F4,
		shadowZ: F5,
		shadow: prog(f, 527, 545),
		form: UI,
		wx: P.enter.x + (EXIT.hero.x - P.enter.x) * Math.pow(k, 1.5),
		wy: P.enter.y + (EXIT.hero.y - P.enter.y) * Math.pow(k, 1.5),
		lift,
		sx: 1 - 0.48 * s,
		sy: 1 - 0.38 * s,
		sz: 1 + 1.6 * s,
		rx: ft.rx + ft.amp * Math.sin(tt * 2 * Math.PI * 1.25) * 13 * env,
		ry: ft.amp * Math.cos(tt * 2 * Math.PI * 0.9 + 0.6) * 15 * env,
		rz: (-9 + Math.sin(tt * 3.1) * 3) * env,
	});
}

// ── cursor ──────────────────────────────────────────────────────────────────
export type CursorPose = {
	floor: number;
	wx: number;
	wy: number;
	/** Height above the floor (0 in flat shots, glass +60 when tilted). */
	lift: number;
	kind: CursorKind;
	next?: CursorKind;
	mixT?: number;
	press: number;
	rot: number;
};

type CK = [number, number, number, EaseFn?];
/** 2D keyed path: [frame, x, y, ease]. */
function path2(f: number, keys: CK[]) {
	return {
		x: track(
			f,
			keys.map(([k, x, , e]) => [k, x, e] as const),
		),
		y: track(
			f,
			keys.map(([k, , y, e]) => [k, y, e] as const),
		),
	};
}

const CURSOR_KEYS: CK[] = [
	[0, 300, 160],
	[34, 556, 204, ease.inOut],
	[50, 560, 200],
	[76, 640, 186, ease.inOut],
	[84, 646, 184],
	[90, 634, 188, ease.inOut], // anticipation before the rush
	[109, 1288, 99, rushEase], // the rush (≤ 1.52× its average speed, no one-frame jump), a hair past the button's centre
	[118, 1287, 100, ease.inOut],
	[174, 1287, 99],
	[189, 1287, 99],
	[206, 1306, 726, rushEase], // whip round
	[209, 1305, 721, ease.inOut],
	[246, 1305, 721],
	[270, 900, 640, ease.inOut],
	[296, 420, 575, ease.inOut],
	[330, 46, 548, ease.inOut],
	[356, 42, 472, ease.inOut],
	[392, 42, 414, ease.inOut],
	[400, 44, 412],
	[432, 380, 472, ease.inOut],
	[462, 596, 500, ease.inOut],
	[482, 604, 503, ease.inOut],
	[488, 610, 505],
	[531, 1362, 644, sine], // follows the hero to the 进入 in one smooth move
	[534, 1361, 643, ease.out],
];

/** Window-xy of the cursor on its keyed path (with the acting offsets), any real frame. */
function cursorXY(f: number) {
	const p = path2(f, CURSOR_KEYS);
	// wait-and-wiggle on the twin (32.60–33.40)
	const wig = bump(f, 132, 160);
	p.x += 6 * Math.sin(((f - 132) / 28) * Math.PI * 2) * wig;
	p.y += 3 * Math.sin(((f - 132) / 14) * Math.PI * 2) * wig;
	// double-take as the hero flies over (38.57)
	const dt = bump(f, 484, 494);
	p.x += 4 * Math.sin(((f - 484) / 10) * Math.PI * 4) * dt;
	// droop after the miss (34.0x)
	const droop = prog(f, 216, 230, ease.out) * (1 - prog(f, 246, 256));
	p.y += 4 * droop;
	return {x: p.x, y: p.y, droop};
}

/** The cursor's own dive (39.43–40.00) into the trapdoor right after its click, arriving with M5's velocity. */
const DIVE_C0 = 535;
const DIVE_C1 = 546;

export function cursorPose(f: number, glass: number): CursorPose {
	const p = cursorXY(f);
	const rot = -3 * p.droop + (f >= 189 && f < 197 ? -10 * (1 - prog(f, 189, 197, ease.out)) : 0);
	// clicks
	const press = Math.max(
		track(f, [
			[209, 0],
			[211, 1, ease.out],
			[216, 0, ease.inOut],
		]),
		track(f, [
			[533, 0],
			[535, 1, ease.out],
			[540, 0, ease.inOut],
		]),
	);
	// kinds: arrow on plain surfaces, pointer over controls
	let kind: CursorKind = 'arrow';
	if (f >= 104 && f < 191) kind = 'pointer'; // twin
	else if (f >= 203 && f < 250) kind = 'pointer'; // toggle
	else if (f >= 322 && f < 404) kind = 'pointer'; // nav rail
	else if (f >= 526) kind = 'pointer'; // 进入 / the hole
	const floor = f < SWAP ? F3 : F4;
	let lift = glass;
	let {x, y} = p;
	let r = rot;
	if (f >= 520 && f <= DIVE_C0)
		lift = track(f, [
			[520, glass],
			[533, 2, ease.inOut],
		]);
	if (f > DIVE_C0) {
		// straight down the hole after the hero (it keeps pace with the diving camera instead of flying up
		// out of the frame), handed to M5 in motion
		const cutLift = CUT_CURSOR.e - (F4 - F5);
		lift = f <= DIVE_C1 ? hermite1(f, DIVE_C0, 2, 0, DIVE_C1, -60, -9) : hermite1(f, DIVE_C1, -60, -9, END, cutLift, CUT_CURSOR_V.e);
		const h = (p0: number, p1: number, v1: number) => hermite1(f, DIVE_C0, p0, 0, END, p1, v1);
		x = h(1361, CUT_CURSOR.wx, CUT_CURSOR_V.wx);
		y = h(643, CUT_CURSOR.wy, CUT_CURSOR_V.wy);
		r = h(0, CUT_CURSOR.rot, CUT_CURSOR_V.rot);
		if (f >= 541) kind = 'arrow'; // nothing to point at in the air (M5 starts with the arrow)
	}
	return {floor, wx: x, wy: y, lift, kind, press, rot: r};
}

// ── camera ──────────────────────────────────────────────────────────────────
const cam = (floor: number, wx: number, wy: number, o: Partial<Cam> & {scale?: number} = {}): Cam => {
	const {scale, ...rest} = o;
	return {...flatCam(floor, {wx, wy, scale}), ...rest};
};

/** Camera up to the landing on 进入 (frames 0–512), as keyed real-app / diorama framings. */
function camKeyed(f: number): Cam {
	const floor = f < SWAP ? F3 : F4;
	const keys: Array<[number, Cam, EaseFn?]> = [
		[0, cam(floor, 720, 405)],
		// Sh14 slight diorama tilt over the table (8°), framed so the window still fills the frame (no front edge or background)
		[44, cam(floor, 730, 460, {pitch: 8, yaw: 0, dist: 680}), ease.inOut],
		[70, cam(floor, 732, 461, {pitch: 8, yaw: 0, dist: 679}), ease.inOut],
		// flat again by 32.03 — the twin is fully framed when the cursor rushes to it
		[92, cam(floor, 720, 405), ease.inOut],
		[150, cam(floor, 720, 405)],
		// 150–226: see HOVER_KEYS (a smooth chain: slow push with the twin kept clear of the top edge, then
		// following the cursor's whip down to the row)
		[226, cam(floor, 781, 438, {scale: 1.46})],
		[262, cam(floor, 700, 445, {scale: 1.62}), ease.inOut],
		[298, cam(floor, 480, 466, {scale: 2.0}), ease.inOut],
		// Sh15 · 2.4× on the rail with the window's left edge exactly on the frame edge (no margin outside the app)
		[326, cam(floor, 400, 455, {scale: 2.4}), ease.inOut],
		[396, cam(floor, 400, 455, {scale: 2.4})],
		[436, cam(floor, 720, 405), ease.inOut],
		[462, cam(floor, 720, 405)],
		// the long leap: tilt + orbit from take-off; the landing framing keeps 种子地图's cover and title and its 进入 in frame
		[512, cam(floor, 920, 600, {pitch: 28, yaw: 16, dist: 660}), ease.inOut],
	];
	if (f > HOVER_KEYS[0][0] && f < HOVER_KEYS[HOVER_KEYS.length - 1][0]) return chainCam(f, HOVER_KEYS);
	const k = keys.map(([kf, c, e]) => [kf, {...c, z: floor}, e] as [number, Cam, EaseFn?]);
	// camTrack (inline, to re-base z on the current floor)
	if (f <= k[0][0]) return k[0][1];
	for (let i = 1; i < k.length; i++) {
		const [f1, c1, e] = k[i];
		if (f <= f1) {
			const [f0, c0] = k[i - 1];
			const t = (e ?? ease.inOut)(clamp((f - f0) / (f1 - f0), 0, 1));
			return lerpCamFields(c0, c1, t);
		}
	}
	return k[k.length - 1][1];
}

/** 32.00–34.27 on F3: from rest, a slow push that keeps the twin clear of the top edge while the cursor waits on it,
 * then down after the whip toward the row (33.65–34.07), to rest at 34.27. */
const HOVER_KEYS: Array<[number, Cam]> = [
	[150, cam(F3, 720, 405)],
	[189, cam(F3, 745, 417, {scale: 1.385})],
	[214, cam(F3, 780, 436, {scale: 1.46})],
	[226, cam(F3, 781, 438, {scale: 1.46})],
];

/** Catmull-Rom through camera keys (field space), at rest on the first and last key. */
function chainCam(f: number, keys: Array<[number, Cam]>): Cam {
	let i = 0;
	while (i < keys.length - 2 && f > keys[i + 1][0]) i++;
	const fields = ['x', 'y', 'z', 'dist', 'pitch', 'yaw', 'roll', 'persp'] as const;
	const vel = (j: number, key: (typeof fields)[number]) =>
		j <= 0 || j >= keys.length - 1 ? 0 : (keys[j + 1][1][key] - keys[j - 1][1][key]) / (keys[j + 1][0] - keys[j - 1][0]);
	const out = {} as Cam;
	for (const key of fields) out[key] = hermite1(f, keys[i][0], keys[i][1][key], vel(i, key), keys[i + 1][0], keys[i + 1][1][key], vel(i + 1, key));
	return out;
}

function lerpCamFields(a: Cam, b: Cam, t: number): Cam {
	const l = (u: number, v: number) => u + (v - u) * t;
	return {x: l(a.x, b.x), y: l(a.y, b.y), z: l(a.z, b.z), dist: l(a.dist, b.dist), pitch: l(a.pitch, b.pitch), yaw: l(a.yaw, b.yaw), roll: l(a.roll, b.roll), persp: l(a.persp, b.persp)};
}

/** Eye position (world) of a camera. */
export const eyeOf = (c: Cam) => poseOf(c).eye;

/**
 * 39.00–40.00: one Hermite move through eye/look-at keys — from rest on the landing framing (512), into the
 * trapdoor (540, while the cursor clicks it), then the dive: the eye swings south past F4's front edge and below
 * it (556 = plan.ts DIVE_MID) while the look-at falls through the hole to the map, arriving on CUT with CUT_V.
 */
const DIVE_KEYS: Array<{f: number; pose: CamPose; v?: CamPose}> = (() => {
	const zero = poseDiff(CUT, CUT, 0);
	const keys: Array<{f: number; pose: CamPose; v?: CamPose}> = [
		{f: 512, pose: poseOf(camKeyed(512)), v: zero},
		{f: 540, pose: poseOf({...cam(F4, 1336, 640, {pitch: 31, yaw: 9, dist: 520}), z: F4})},
		{f: END + DIVE_MID.f, pose: DIVE_MID.pose},
		{f: END, pose: CUT, v: CUT_V},
	];
	// Catmull-Rom tangents for the inner keys
	for (let i = 1; i < keys.length - 1; i++) keys[i].v = poseDiff(keys[i + 1].pose, keys[i - 1].pose, 1 / (keys[i + 1].f - keys[i - 1].f));
	return keys;
})();

export function camAt(f: number): Cam {
	if (f <= DIVE_KEYS[0].f) return camKeyed(f);
	let i = 0;
	while (i < DIVE_KEYS.length - 2 && f > DIVE_KEYS[i + 1].f) i++;
	const a = DIVE_KEYS[i];
	const b = DIVE_KEYS[i + 1];
	return camOf(hermitePose(Math.min(f, END), a.f, a.pose, a.v!, b.f, b.pose, b.v!));
}

/** World state at 40.00 s (module frame 570 = M5 frame 0), for the M5 hand-off. */
export function exitState() {
	const f = END;
	const h = heroPose(f);
	const cp = cursorPose(f, 0);
	return {cam: camAt(f), hero: toWorld(h.wx, h.wy, h.floor + h.lift), heroRot: [h.rx, h.ry, h.rz], cursor: toWorld(cp.wx, cp.wy, cp.floor + cp.lift), cursorRot: cp.rot};
}

/** Eye height (world z) — used for culling floors the eye has passed. */
export const eyeZ = (c: Cam) => c.z + c.dist * Math.cos((c.pitch * Math.PI) / 180);

/** Glass height for the cursor: 0 in flat framing, +60 once the camera tilts. */
export const glassFor = (c: Cam) => 60 * clamp(c.pitch / 14, 0, 1);

// ── UI state ────────────────────────────────────────────────────────────────
export function navState(f: number) {
	const moving = f >= 360;
	// 36.50: the 实例库 pill cross-fades white → pink (8 frames) while it inchworms to 实验室;
	// the quick circle loses its pink over the same frames (drawn by the scene as an overlay)
	const tone = prog(f, 360, 368, ease.inOut);
	const slider = moving
		? {
				top: lerp(navY(5), navY(6), std(prog(f, 374, 392))),
				bottom: lerp(navY(5) + 48, navY(6) + 48, std(prog(f, 360, 378))),
				tone: tone < 1 ? ('white' as const) : ('pink' as const),
			}
		: {top: navY(5), bottom: navY(5) + 48, tone: 'white' as const};
	const quickActive = f < 360 ? 0 : -1;
	const crumbLab = f >= 364;
	const hoverDl = (f >= 326 && f < 338) || (f >= 348 && f < 366);
	return {slider, tone, quickFade: f >= 360 && tone < 1 ? 1 - tone : 0, quickActive, crumbLab, hoverNav: hoverDl ? ('downloads' as const) : null};
}

/** 下载 badge jiggle (px) when the hero bonks it. */
export const badgeJiggle = (f: number) => -3.2 * wobble(f, 330, FPS, 6, 7);

/** 2 px pink route LoadingBar along the well's top during the navigation. */
export const loadingBar = (f: number) => ({w: prog(f, 361, 384, ease.out), o: 1 - prog(f, 384, 394)});

export function instanceState(f: number) {
	return {
		contentOpacity: prog(f, 0, 16, ease.ui) * (1 - prog(f, 362, 374, ease.ui)),
		twinHover: prog(f, 104, 113, ease.ui) * (1 - prog(f, 190, 199, ease.ui)),
		lite: {
			installing: f < 30 ? 1 : 0,
			spin: f * 6,
			tooltip: f >= 17 && f < 30 ? 1 : 0,
			// the real toggle appears at 31.00; while the hero IS the toggle (68–211) the slot under it stays empty,
			// so its giggles never reveal a second toggle; it is back under the hero for the click
			toggle: f >= 30 && !(f >= 68 && f < 211),
			on: 1 - prog(f, 210, 222, ease.ui),
			knobHover: f >= 213 && f < 248 ? 1 : 0,
			off: prog(f, 210, 222, ease.ui),
		},
		enabled: f < 212 ? 86 : 85,
		disabled: f < 212 ? 1 : 2,
	};
}

export function labState(f: number) {
	return {
		contentOpacity: prog(f, 380, 398, ease.ui),
		cardHover: {[LAB.seedMap]: prog(f, 512, 524, ease.ui)},
		enterPress: {
			[LAB.seedMap]: track(f, [
				[510, 0],
				[513, 1, ease.out],
			]),
		},
		enterHidden: f >= 514 ? [LAB.seedMap] : [],
	};
}

/** F4 dissolves over the last frames before the eye crosses its plane (no 1-frame pop at the cull). */
export const labFloorFade = (f: number) => 1 - prog(f, 546, 553, ease.in);
/** The trapdoor shaft fades once the camera starts swooping away from it. */
export const shaftFade = (f: number) => 1 - prog(f, 543, 549);

/** Trapdoor flap angle (deg, 0 = closed, 90 = hanging straight down), hinged on the button's north edge. */
export const flapAngle = (f: number) =>
	track(f, [
		[514, 0],
		[520, 108, ease.in],
		[524, 86, ease.out],
		[528, 99, ease.inOut],
		[533, 93, ease.inOut],
		[540, 96, ease.inOut],
	]);
