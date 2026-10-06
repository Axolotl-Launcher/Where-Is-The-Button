/**
 * M8 · Finale (Sh27–Sh31, film 69.00–80.00 s, local frames 0–660).
 *
 * Sh27 69.00–72.50  Home again, pixel-identical to Sh01 (flatCam(0)); the cursor
 *                   approaches slowly from lower left (real pointer behaviour)
 * Sh28 72.50–75.00  hover → pointer + the real darken; it does not flee: a 2° lean
 *                   toward the cursor; very slow 2 % push
 * Sh29 75.00–75.30  press 3: the real .97 — and it holds
 * Sh30 75.30–78.50  rush into the outline ▷ (2D at native resolution): its interior
 *                   is a window onto the evening world, clipped to the triangle's
 *                   projected inner edge, until the outline passes the frame edges
 *                   (75.80); the cursor is captured by the game; low glide toward
 *                   the cherry grove
 * Sh31 78.50–80.00  eases to a stop facing the sun through the blossoms; 79.60–80.00
 *                   dissolve to #ebebeb
 */
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {Cam, Stage} from '../stage/Stage';
import {camTrack, flatCam} from '../film/camera';
import {CursorOverlay} from '../film/CursorOverlay';
import {CursorKind} from '../characters/Cursor';
import {FLOOR_Z, toWorld} from '../film/timeline';
import {clamp, ease, lerp, prog} from '../lib/anim';
import {World} from '../world/World';
import {HomeFloor, HomeWindow} from './home/HomeFloor';
import {ButtonFace} from '../characters/LaunchButton';
import {MinimalCard, mhLayout} from '../ui/pages/MinimalHome';
import {C} from '../theme/tokens';
import {GLYPH_VERTS, SOCKET, topCam} from './home/geometry';

const F = {
	moveA: 30, // cursor starts its slow approach
	hoverIn: 210, // 72.50 (computed crossing of the hero's edge)
	push0: 210,
	press3: 360, // 75.00
	rush0: 378, // 75.30
	rush1: 408, // 75.80 outline beyond the frame
	dissolve0: 636, // 79.60
	end: 660,
};

const CAM0 = flatCam(FLOOR_Z.home);
const PUSH = {cx: 731, cy: 410, s: 1.36};
const CAM1 = topCam(PUSH.cx, PUSH.cy, PUSH.s);

function camera(f: number): Cam {
	return camTrack(f, [
		[0, CAM0],
		[F.push0, CAM0],
		[F.rush0, CAM1, Easing.bezier(0.4, 0, 0.6, 1)],
	]);
}

/* ───────────── cursor (real pointer: slow, one hesitation) ───────────── */

type Pt = [number, number];
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
	const u = 1 - t;
	return [
		u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
		u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
	];
};
const easeHand = Easing.bezier(0.45, 0, 0.3, 1);
const START: Pt = [803, 548];
const MID: Pt = [866, 497];
const TRI: Pt = [946, 429];

function cursorWin(f: number): Pt {
	if (f < F.moveA) return START;
	if (f < 150) return bez(START, [822, 536], [850, 511], MID, easeHand(clamp((f - F.moveA) / (150 - F.moveA), 0, 1)));
	if (f < 184) {
		const t = ease.inOut((f - 150) / 34);
		return [lerp(MID[0], MID[0] + 3, t), lerp(MID[1], MID[1] - 2, t)];
	}
	return bez([MID[0] + 3, MID[1] - 2], [895, 474], [925, 441], TRI, easeHand(clamp((f - 184) / 58, 0, 1)));
}

const inHero = ([x, y]: Pt) => x >= SOCKET.x && x <= SOCKET.x + SOCKET.w && y >= SOCKET.y && y <= SOCKET.y + SOCKET.h;

/* ───────────── the rush into the ▷ ───────────── */

const PRESS = 0.97;
const HC = {x: SOCKET.cx, y: SOCKET.cy};
/** The outline's inner edge (stroke 2 → 1 px inset), with the held .97 press about the hero centre. */
const INNER = (() => {
	const v = GLYPH_VERTS.map(([x, y]) => [HC.x + (x - HC.x) * PRESS, HC.y + (y - HC.y) * PRESS] as Pt);
	const len = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
	const la = len(v[1], v[2]);
	const lb = len(v[0], v[2]);
	const lc = len(v[0], v[1]);
	const per = la + lb + lc;
	const inc: Pt = [(la * v[0][0] + lb * v[1][0] + lc * v[2][0]) / per, (la * v[0][1] + lb * v[1][1] + lc * v[2][1]) / per];
	const area = Math.abs((v[1][0] - v[0][0]) * (v[2][1] - v[0][1]) - (v[2][0] - v[0][0]) * (v[1][1] - v[0][1])) / 2;
	const r = (2 * area) / per;
	const k = (r - 1 * PRESS) / r;
	return v.map(([x, y]) => [inc[0] + (x - inc[0]) * k, inc[1] + (y - inc[1]) * k] as Pt);
})();
/** Largest centred 16:9 frame inside the inner triangle (left edge vertical, apex right). */
const FIT = (() => {
	const xL = INNER[0][0];
	const xA = INNER[1][0];
	const H = INNER[2][1] - INNER[0][1];
	const W = xA - xL;
	const a = (H * W) / (2 * H + (1080 / 1920) * 2 * W);
	return {p: [xL + a, INNER[1][1]] as Pt, scale: 960 / a};
})();
const S_END = FIT.scale * 4;
/** ln-scale ramp: t² is an accelerating rush; the frame is inside the ▷ by t ≈ 0.89. */
const easeRush = (t: number) => t * t;

function rush(f: number) {
	const t = clamp((f - F.rush0) / (F.rush1 - F.rush0), 0, 1);
	const s = Math.exp(lerp(Math.log(PUSH.s), Math.log(S_END), easeRush(t)));
	// the ▷'s screen offset from frame centre shrinks as 1/s while the scale explodes:
	// keeps the window's right edge off-frame early and centres the ▷ by the end
	const off0: Pt = [(FIT.p[0] - PUSH.cx) * PUSH.s, (FIT.p[1] - PUSH.cy) * PUSH.s];
	const k = PUSH.s / s;
	const c: Pt = [FIT.p[0] - (off0[0] * k) / s, FIT.p[1] - (off0[1] * k) / s];
	const scr = (p: Pt): Pt => [960 + (p[0] - c[0]) * s, 540 + (p[1] - c[1]) * s];
	const tri = INNER.map(scr);
	return {t, s, c, tri, center: scr(FIT.p), covered: t >= 1 || [[0, 0], [1920, 0], [1920, 1080], [0, 1080]].every((q) => inTri(q as Pt, tri))};
}

function inTri(p: Pt, [a, b, c]: Pt[]): boolean {
	const cross = (o: Pt, u: Pt, v: Pt) => (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]);
	const d1 = cross(a, b, p);
	const d2 = cross(b, c, p);
	const d3 = cross(c, a, p);
	return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0);
}

/* ───────────── scene ───────────── */

export const M8: React.FC = () => {
	const f = useCurrentFrame();
	const cur = cursorWin(f);
	const hoverAt = (() => {
		for (let g = F.moveA; g <= f; g++) if (inHero(cursorWin(g))) return g;
		return Infinity;
	})();
	const hover = prog(f, hoverAt, hoverAt + 9, ease.ui);
	const lean = -2 * prog(f, hoverAt + 26, hoverAt + 70, ease.inOut) * (1 - prog(f, F.press3, F.press3 + 9, ease.ui));
	const press = prog(f, F.press3, F.press3 + 9, ease.ui);
	const hero = {hover, press};
	const heroWrapStyle = lean ? {transform: `translate(${0.6 * lean}px, ${-0.4 * lean}px) rotate(${lean}deg)`} : undefined;

	if (f < F.rush0) {
		const cam = camera(f);
		const kind: CursorKind = f >= hoverAt ? 'pointer' : 'arrow';
		const mouse = 0.5 * prog(f, F.press3, F.press3 + 3, ease.out);
		return (
			<AbsoluteFill style={{background: '#ebebeb'}}>
				<Stage cam={cam} background="linear-gradient(#f2eef2, #d9d4dc)">
					<HomeFloor radius={0} hero={hero} heroWrapStyle={heroWrapStyle} />
				</Stage>
				<CursorOverlay cam={cam} cursor={{...toWorld(cur[0], cur[1], 0), kind, press: mouse}} />
			</AbsoluteFill>
		);
	}

	const r = rush(f);
	const wt = (f - F.rush0) / 60;
	const inside = !r.covered;
	const poly = r.tri.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(', ');
	// keep the world's centre behind the window while it travels to frame centre
	const shift = inside ? [r.center[0] - 960, r.center[1] - 540] : [0, 0];
	// beyond ×4 the soft drop shadows are off-frame anyway (and costly to blur); beyond ×6 only the card is in view
	const face = {...hero, cssShadow: r.s <= 4};
	const cardOnly = r.s > 6;
	const triSize = Math.abs(r.tri[1][0] - r.tri[0][0]);
	const dissolve = prog(f, F.dissolve0, F.end, ease.inOut);
	return (
		<AbsoluteFill style={{background: '#ebebeb'}}>
			{inside ? (
				<AbsoluteFill>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1440,
							height: 810,
							borderRadius: 18,
							overflow: 'hidden',
							background: '#f8f8f8',
							transformOrigin: '0 0',
							transform: `translate(960px, 540px) scale(${r.s}) translate(${-r.c[0]}px, ${-r.c[1]}px)`,
						}}
					>
						{cardOnly ? (
							<>
								<div style={{position: 'absolute', inset: 0, background: C.well}} />
								<MinimalCard
									L={mhLayout(false)}
									heroSlot={
										<div style={{position: 'relative', width: SOCKET.w, height: SOCKET.h}}>
											<ButtonFace {...face} />
										</div>
									}
								/>
							</>
						) : (
							<HomeWindow hero={face} />
						)}
					</div>
				</AbsoluteFill>
			) : null}
			<AbsoluteFill style={{clipPath: inside ? `polygon(${poly})` : undefined}}>
				<AbsoluteFill style={{transform: inside ? `translate(${shift[0]}px, ${shift[1]}px)` : undefined}}>
					<World t={wt} />
				</AbsoluteFill>
			</AbsoluteFill>
			{inside ? (
				// light spilling out of the opening window
				<AbsoluteFill
					style={{
						background: `radial-gradient(circle ${Math.max(30, triSize * 1.5).toFixed(0)}px at ${r.center[0]}px ${r.center[1]}px, rgba(255, 236, 214, ${(0.26 * (1 - r.t)).toFixed(3)}), rgba(255, 236, 214, 0) 100%)`,
						mixBlendMode: 'screen',
					}}
				/>
			) : null}
			{dissolve > 0 ? <AbsoluteFill style={{background: '#ebebeb', opacity: dissolve}} /> : null}
		</AbsoluteFill>
	);
};
