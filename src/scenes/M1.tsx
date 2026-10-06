/**
 * M1 · Opening (Sh01–Sh06, film 0.00–9.75 s, frames 0–585).
 *
 * Sh01 0.00–3.00  the real app, still (flatCam(0)); cursor enters bottom-right at 1.80
 * Sh02 3.00–5.00  slow push; cursor glides in, 4.30 pointer + real hover darken
 * Sh03 5.00–6.00  press 1: the real .97 — and it keeps sinking through its socket,
 *                 falls 712 px to F2 (lands 5.95); camera centres on the shaft
 * Sh04 6.00–7.75  silence; dolly-zoom persp 1000 → 600 (the hole deepens). After the
 *                 plop the hero scoots sideways out of the hole's view (6.33–6.67) and
 *                 hides under F1; 6.90 cursor double-take at the empty hole; 7.20 the
 *                 hero slides back into the light, brakes in the middle and looks up
 *                 (bob toward the lens, ▷ end up, curious tilt, frozen tremble) —
 *                 all of it acted in the image plane, since the camera looks straight down
 * Sh05 7.75–8.75  the peek: spring-jump up the shaft, pops into the socket at 8.00
 *                 (overshoot → flush), innocent hold, drops again at 8.50
 * Sh06 8.75–9.75  cursor wind-up and dive; camera follows into the shaft (Dive),
 *                 F1 culled once the hole fills the frame; exit = M1_EXIT
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Hero} from '../characters/LaunchButton';
import {CursorKind} from '../characters/Cursor';
import {camTrack, flatCam, project} from '../film/camera';
import {CursorOverlay, CursorState} from '../film/CursorOverlay';
import {Floor} from '../film/Floor';
import {FLOOR_WINDOWS} from '../film/floors';
import {FLOOR_Z, toWorld} from '../film/timeline';
import {bump, clamp, ease, lerp, prog, springStep, track} from '../lib/anim';
import {Cam, Stage, mixColor} from '../stage/Stage';
import {Easing} from 'remotion';
import {HomeFloor, SHAFT_LIGHT} from './home/HomeFloor';
import {HERO_D, camFromEye, topCam, visiblePlaneRect} from './home/geometry';

/** Story beats (frames, 60 fps; M1 local = film). */
const F = {
	cursorIn: 108, // 1.80
	pushA: 180, // 3.00
	hoverIn: 258, // 4.30 (cursor crosses the hero's bottom edge)
	press1: 300, // 5.00
	land1: 357, // 5.95
	dz0: 372, // 6.20
	dz1: 450, // 7.50
	jiggle: 414, // 6.90
	scoot: 380, // 6.33: wind-up, then the dash out of the hole's view (gone by ≈6.67)
	dash: 386,
	peekIn: 428, // starts back from its hiding place; in view at 7.20
	look: 443, // 7.38: looks up
	squash: 465, // 7.75
	jump: 471, // 7.85
	pop: 480, // 8.00
	twitch: 507, // 8.45
	drop2: 510, // 8.50
	windup: 525, // 8.75
	dive: 531, // 8.85
	land2: 558, // 9.30
	cull: 565, // ≈9.42: the hole fills the frame
	end: 585, // 9.75 (= M2 frame 0)
};

const G1 = 1578; // px/s² — first fall lands at 5.95
const G2 = 2225; // second drop, faster: lands at 9.30
const F2 = FLOOR_Z.discover;
const F2_TOP = F2 + HERO_D; // hero top face when resting on F2
const SHAFT_W = toWorld(983, 428, 0);

const easeHand = Easing.bezier(0.42, 0, 0.22, 1);
const easeEnter = Easing.bezier(0.25, 0.6, 0.3, 1);
const easeDive = Easing.bezier(0.3, 0.5, 0.6, 0.75);

/* ───────────────────────── camera ───────────────────────── */

const CAM0 = flatCam(FLOOR_Z.home);
const CAM1 = topCam(752, 416, 1.4);
const S_HOLE = 2.5; // screen scale of F1 while we stare into the socket
const CAM2 = topCam(983, 428, S_HOLE);

export function camera(f: number): Cam {
	if (f < F.dz0) {
		return camTrack(f, [
			[0, CAM0],
			[F.pushA, CAM0],
			[306, CAM1, ease.inOut],
			[354, CAM2, ease.inOut],
		]);
	}
	if (f < F.dive) return topCam(983, 428, S_HOLE, track(f, [[F.dz0, 1000], [F.dz1, 600, ease.inOut]]));
	// Dive: the eye drops through the socket and tips forward to 20°.
	const ez = track(f, [[F.dive, 600 / S_HOLE], [F.end, -25, ease.inOut]]);
	const ey = track(f, [[F.dive, 428], [566, 432, ease.inOut], [F.end, 451, ease.inOut]]);
	const pitch = track(f, [[545, 0], [F.end, 20, ease.inOut]]);
	const persp = track(f, [[F.dive, 600], [F.end, 800, ease.inOut]]);
	return camFromEye(toWorld(983, ey, ez), pitch, 400, persp);
}

/* ───────────────────────── hero ───────────────────────── */

export type Hero3D = {
	z: number;
	/** In-plane offset from the shaft (window px on the floor it is on). */
	dx: number;
	dy: number;
	/** Squash & stretch: in-plane length / height, thickness. */
	sx: number;
	sy: number;
	sz: number;
	ry: number;
	rz: number;
	hover: number;
	/** Brightness of the face (1 in the light under the socket, darker in F1's shadow). */
	shade: number;
};

const fallTop = (f: number, f0: number, g: number) => {
	const t = (f - f0) / 60;
	return -0.5 * g * t * t;
};
const impact = (f: number, f0: number, amp = 1, tau = 7) => (f < f0 ? 0 : amp * Math.exp(-(f - f0) / tau));

/** Where it hides: north of the shaft on F2, under F1, well outside what the socket shows (±93 px at persp 600). */
const HIDE_Y = -170;

/**
 * Sh03/Sh04 hide-and-peek on F2 (concept: "then scoots sideways out of the hole's
 * view … at 7.20 the hero slides back into view"). Offset along y from the shaft,
 * window px (− = north). Seen straight down, so all of it reads in the image plane.
 */
function peekY(f: number): number {
	if (f < F.scoot) return 0;
	// wind-up: a half-step the other way
	if (f < F.dash) return 5 * ease.inOut((f - F.scoot) / (F.dash - F.scoot));
	// the dash: pushes off from rest and accelerates out of view (gone by ≈ f400)
	if (f < F.peekIn) return 5 + (HIDE_Y - 5) * Math.pow(clamp((f - F.dash) / 18, 0, 1), 2);
	// slides back into the light (in view at 7.20) and brakes in the middle, overshooting ≈ 8 px
	return HIDE_Y * (1 - springStep(f, F.peekIn, 60, 3.0, 0.7));
}

/**
 * The floor under F1 is in its shadow (SHAFT_LIGHT: a lit ellipse 230 × 118 around the
 * shaft, ≈ 80 % dark at its rim); the hero darkens the same way when it leaves the light.
 */
function shadeAt(dy: number): number {
	const r = Math.abs(dy) / 118;
	const dark = r < 0.42 ? 0.1 + (0.2 * r) / 0.42 : Math.min(0.8, 0.3 + (0.5 * (r - 0.42)) / 0.58);
	return 1 - 0.85 * (dark - 0.1);
}

export function hero3d(f: number): Hero3D {
	let zTop = 0;
	let s = 1;
	let sz = 1;
	let ax = 1; // extra in-plane squash/stretch (length, height)
	let ay = 1;
	let theta = 0; // nose-up lean, degrees (▷ end up, pivoting on the label end)
	let rz = 0;
	let hover = 0;
	let dx = 0;
	let dy = 0;
	if (f < F.land1) {
		// Press 1: the real .97 — and it keeps going.
		zTop = Math.max(F2_TOP, fallTop(f, F.press1, G1));
		s = 1 - 0.03 * prog(f, F.press1, F.press1 + 9, ease.ui);
		hover = 1 - prog(f, F.press1 + 2, F.press1 + 11, ease.ui);
	} else if (f < F.jump) {
		// On F2: plop, one small bounce …
		const i1 = impact(f, F.land1, 1, 6);
		const i2 = impact(f, 373, 0.35, 5);
		zTop = F2_TOP + 11 * bump(f, F.land1 + 1, 373);
		s = 1 + 0.12 * (i1 + i2);
		sz = 1 - 0.45 * (i1 + i2);
		// … then it scoots sideways out of the hole's view, hides, and at 7.20 slides back.
		dy = peekY(f);
		const v = peekY(f + 0.5) - peekY(f - 0.5);
		const stretch = clamp(Math.abs(v) * 0.009, 0, 0.2); // stretched along the slide
		const wind = bump(f, F.scoot, F.dash + 2); // squats against the dash
		const stop = bump(f, F.peekIn + 7, F.peekIn + 18); // brakes: squashed along the slide
		ay = (1 + stretch) * (1 - 0.1 * wind) * (1 - 0.17 * stop);
		ax = (1 / Math.sqrt(1 + stretch)) * (1 + 0.06 * wind) * (1 + 0.1 * stop);
		// 7.38 it looks up: a bob toward the lens (≈ +12 % on screen), nose (▷ end) up,
		// a curious tilt that lifts the ▷ end on screen, a frozen 1 px tremble, then down.
		const up = track(f, [[F.look, 0], [F.look + 8, 1, ease.rise], [F.look + 15, 0.93, ease.inOut], [F.look + 20, 0, ease.fall]]);
		zTop += 100 * up;
		theta = 20 * track(f, [[F.look, 0], [F.look + 8, 1, ease.outBack], [F.look + 15, 0.9, ease.inOut], [F.look + 20, 0, ease.in]]);
		rz = 7 * track(f, [[F.look + 1, 0], [F.look + 9, 1, ease.outBack], [F.look + 15, 0.85, ease.inOut], [F.look + 21, 0, ease.inOut]]);
		const frozen = prog(f, F.look + 7, F.look + 9) * (1 - prog(f, F.look + 14, F.look + 16));
		dx += 1.5 * Math.sin((f - F.look) * 2.6) * frozen;
		const touch = impact(f, F.look + 20, 0.5, 4);
		s *= 1 + 0.1 * touch;
		sz *= 1 - 0.3 * touch;
		// 7.75 anticipation squash before the jump.
		const sq = prog(f, F.squash, F.jump, ease.out);
		s *= 1 + 0.09 * sq;
		sz *= 1 - 0.42 * sq;
	} else if (f < F.drop2) {
		if (f < F.pop) {
			// Spring-jump straight up the shaft (cartoon exception), stretched.
			zTop = lerp(F2_TOP, 9, ease.rise((f - F.jump) / (F.pop - F.jump)));
			s = 0.93;
			sz = 1.45;
		} else {
			// Pops into the socket, overshoots above flush, settles: "as if nothing happened".
			const k = springStep(f, F.pop, 60, 3.0, 0.42);
			zTop = 9 * (1 - k);
			s = 1 + 0.012 * (1 - k);
			sz = 1 - 0.25 * impact(f, F.pop, 1, 4);
		}
		hover = prog(f, F.pop + 3, F.pop + 12, ease.ui);
		// 8.45 the cursor twitches → a cheeky 3 px lift just before it goes.
		zTop += 3 * bump(f, F.twitch - 1, F.drop2 + 1);
	} else {
		// 8.50 drops again, faster; lands 9.30, plops.
		zTop = Math.max(F2_TOP, fallTop(f, F.drop2, G2));
		hover = 1 - prog(f, F.drop2 + 1, F.drop2 + 10, ease.ui);
		const i = impact(f, F.land2, 1, 6);
		const i2 = impact(f, 572, 0.3, 5);
		zTop += 8 * bump(f, F.land2 + 1, 572);
		s = 1 + 0.12 * (i + i2);
		sz = 1 - 0.45 * (i + i2);
		rz = 1.5 * bump(f, F.land2, 580);
	}
	const th = (theta * Math.PI) / 180;
	// The lean lifts the ▷ end (its nose) and pivots on the label end, so that end stays put.
	const half = 72 * s * ax;
	const pivot = half * (1 - Math.cos(th));
	const rr = (rz * Math.PI) / 180;
	return {
		z: zTop - HERO_D * sz + half * Math.sin(th),
		dx: dx + pivot * Math.cos(rr),
		dy: dy + pivot * Math.sin(rr),
		sx: s * ax,
		sy: s * ay,
		sz,
		ry: theta,
		rz,
		hover,
		shade: shadeAt(dy),
	};
}

/* ───────────────────────── cursor ───────────────────────── */

type Pt = [number, number];
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
	const u = 1 - t;
	return [
		u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
		u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
	];
};

const REST: Pt = [946, 429]; // over the outline ▷

/** Cursor hotspot in window coords + height above F1 (world z). */
function cursorWin(f: number): {x: number; y: number; z: number} {
	if (f < 183) {
		const [x, y] = bez([1492, 868], [1380, 700], [1190, 575], [1121, 541], easeEnter(clamp((f - F.cursorIn) / (183 - F.cursorIn), 0, 1)));
		return {x, y, z: 0};
	}
	if (f < 234) {
		const t = ease.inOut(clamp((f - 183) / 51, 0, 1));
		return {x: lerp(1121, 1114, t), y: lerp(541, 533, t), z: 0};
	}
	if (f < 282) {
		const [x, y] = bez([1114, 533], [1080, 500], [1000, 446], REST, easeHand(clamp((f - 234) / 48, 0, 1)));
		return {x, y, z: 0};
	}
	if (f < F.windup) {
		// Frozen at the click point. 6.90 double-take jiggle; 8.45 twitch toward it.
		const jig = f >= F.jiggle && f < F.jiggle + 15 ? 4 * Math.sin((2 * Math.PI * 3 * (f - F.jiggle)) / 15) * (1 - 0.35 * ((f - F.jiggle) / 15)) : 0;
		const tw = 5 * bump(f, F.twitch - 1, F.twitch + 7);
		return {x: REST[0] + jig + tw, y: REST[1] + 0.4 * tw, z: 0};
	}
	// Wind-up: back up 6 px (and up off the glass), then the dive into the shaft.
	if (f < F.dive) {
		const t = ease.out((f - F.windup) / (F.dive - F.windup));
		return {x: lerp(REST[0], 941, t), y: lerp(REST[1], 424.5, t), z: 7 * t};
	}
	const t = clamp((f - F.dive) / (F.end - F.dive), 0, 1);
	const txy = ease.out(clamp((f - F.dive) / 25, 0, 1));
	return {x: lerp(941, 983, txy), y: lerp(424.5, 426, txy), z: lerp(7, -150, easeDive(t))};
}

function cursorKind(f: number): CursorKind {
	if (f < F.hoverIn) return 'arrow';
	if (f < 366) return 'pointer'; // button held down while it falls
	if (f < F.pop + 3) return 'arrow'; // nothing under it any more
	if (f < F.drop2 + 6) return 'pointer'; // it is back under the pointer
	return 'arrow';
}

function cursorState(f: number, cam: Cam): {state: CursorState; size: number} | null {
	if (f < F.cursorIn) return null;
	const w = cursorWin(f);
	const p = toWorld(w.x, w.y, w.z);
	const press = 0.55 * prog(f, F.press1, F.press1 + 3, ease.out) * (1 - prog(f, F.land1, F.land1 + 6, ease.out)) + 0.25 * bump(f, F.twitch, F.twitch + 6);
	const rot = 9 * prog(f, F.dive, 548, ease.inOut);
	// Real-app shots: a constant 44 px pointer; it gains a little depth scaling once the camera pushes in.
	const k = project(cam, p).scale;
	const blend = prog(f, 306, 354, ease.inOut);
	const size = 44 * lerp(1, clamp(1 + 0.35 * (k / (4 / 3) - 1), 1, 1.45), blend);
	return {state: {...p, kind: cursorKind(f), press, rot}, size};
}

/* ───────────────────────── scene ───────────────────────── */

/** Environment behind everything: only ever seen through the shaft, where it sits in F1's shadow until we come out under it. */
function background(f: number): string {
	const t = prog(f, 560, F.end, ease.inOut);
	const top = mixColor('#2f2a36', '#f2eef2', t);
	const bot = mixColor('#3a3442', '#d9d4dc', t);
	return `linear-gradient(${top}, ${bot})`;
}

export const M1: React.FC = () => {
	const f = useCurrentFrame();
	const cam = camera(f);
	const Discover = FLOOR_WINDOWS.discover;
	const seated = f < F.press1;
	const h = seated ? null : hero3d(f);
	const heroHover = prog(f, F.hoverIn, F.hoverIn + 9, ease.ui);
	const dim = prog(f, F.press1, F.press1 + 24, ease.out) * (1 - prog(f, 545, F.end, ease.inOut));
	const crop = f >= F.dive ? visiblePlaneRect(cam, 0, 32) : null;
	const cur = cursorState(f, cam);
	return (
		<AbsoluteFill style={{background: '#ebebeb'}}>
			<Stage cam={cam} background={background(f)}>
				<Floor z={F2} flat={f < 555} fog={dim} fogColor={SHAFT_LIGHT()}>
					<Discover />
				</Floor>
				{h ? (
					<Hero
						x={SHAFT_W.x + h.dx}
						y={SHAFT_W.y + h.dy}
						z={h.z}
						floorZ={F2}
						sx={h.sx}
						sy={h.sy}
						sz={h.sz}
						ry={h.ry}
						rz={h.rz}
						hover={h.hover}
						style={h.shade < 0.999 ? {filter: `brightness(${(h.shade * (1 - 0.1 * h.hover)).toFixed(3)})`} : undefined}
						shadowStrength={0.9}
					/>
				) : null}
				{/* r 0: in the opening the window fills the frame edge to edge like the real app (no slab-corner wedges);
				    F1's corners are never in frame later in M1. The socket's face gets an opaque backing (HomeFloor default). */}
				{f < F.cull ? <HomeFloor socket={!seated} hero={seated ? {hover: heroHover} : null} crop={crop} radius={0} backing={!seated} /> : null}
			</Stage>
			{cur ? <CursorOverlay cam={cam} cursor={cur.state} size={cur.size} depthScale={0} /> : null}
		</AbsoluteFill>
	);
};
