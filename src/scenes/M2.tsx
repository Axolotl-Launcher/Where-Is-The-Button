/**
 * M2 · Tower reveal (Sh07, film 9.75–13.00 s, frames 585–780).
 *
 * The camera rises out of the F1 socket shaft, backs out through the front of
 * the stack and cranes up to the "bookshelf" wide: the launcher's six real
 * pages stacked as floors, each visible beneath the one above, fogging into
 * depth. On the 12.0 downbeat it holds, then cranes down onto Discover's
 * results, landing exactly on M3's first frame. Meanwhile the hero, alone on
 * F2, looks up at the falling cursor and scampers west to card 1.
 *
 * Joins: starts on M1_EXIT (src/scenes/home/handoff.ts), ends on M3's
 * CAM_ENTRY / heroAt(0) / cursorAt(0) (src/scenes/discover/*).
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cam, Obj, Stage} from '../stage/Stage';
import {Hero} from '../characters/LaunchButton';
import {CursorOverlay, CursorShadow} from '../film/CursorOverlay';
import {project} from '../film/camera';
import {Floor} from '../film/Floor';
import {FLOOR_WINDOWS} from '../film/floors';
import {FLOOR_Z, toWorld} from '../film/timeline';
import {clamp, ease, lerp, prog, V3} from '../lib/anim';
import {C, FONT} from '../theme/tokens';
import {HomeFloor} from './home/HomeFloor';
import {M1_EXIT} from './home/handoff';
import {CAM_ENTRY} from './discover/cam';
import {cursorAt} from './discover/cursor';
import {heroAt} from './discover/hero';
import {HeroBody} from './discover/HeroBody';
import {pageAt} from './discover/page';
import {CardSlab} from './discover/Rig';
import {DiscoverFloor, DISCOVER_NAV} from '../ui/pages/Discover';
import {CARDS} from '../ui/pages/discover/layout';
import {InstanceWindow} from '../ui/pages/InstancePage';

const ENV = 'linear-gradient(180deg, #f2eef2 0%, #d9d4dc 100%)';
const LEN = 195;
/** M2 local frame → M3 local frame. */
const M3_OFFSET = -195;

/* ─────────────── camera: eye/target spline, rest → rest ─────────────── */

const deg = (r: number) => (r * 180) / Math.PI;

/** Eye of a CSS camera (see camera.ts project()): target + (d·sinp·sinyaw, d·sinp·cosyaw, d·cosp). */
function eyeOf(c: Cam): V3 {
	const p = (c.pitch * Math.PI) / 180;
	const y = (c.yaw * Math.PI) / 180;
	return {x: c.x + c.dist * Math.sin(p) * Math.sin(y), y: c.y + c.dist * Math.sin(p) * Math.cos(y), z: c.z + c.dist * Math.cos(p)};
}

function lookAt(eye: V3, t: V3, persp: number): Cam {
	const v = {x: eye.x - t.x, y: eye.y - t.y, z: eye.z - t.z};
	const d = Math.hypot(v.x, v.y, v.z);
	return {x: t.x, y: t.y, z: t.z, dist: d, pitch: deg(Math.acos(clamp(v.z / d, -1, 1))), yaw: deg(Math.atan2(v.x, v.y)), roll: 0, persp};
}

type Key = {f: number; eye: V3; tgt: V3; persp: number};
const START: Cam = M1_EXIT.cam;
const KEYS: Key[] = [
	{f: 0, eye: eyeOf(START), tgt: {x: START.x, y: START.y, z: START.z}, persp: START.persp},
	// backing south out from under F1, still below its plane, looking down at F2
	{f: 34, eye: {x: 236, y: 560, z: -100}, tgt: {x: 120, y: -40, z: -640}, persp: 980},
	// rising out in front of the stack (crosses F1's plane well outside its footprint)
	{f: 70, eye: {x: -900, y: 2400, z: 800}, tgt: {x: -60, y: 10, z: -800}, persp: 2200},
	// the bookshelf wide: pitch 60°, yaw −30°, long lens — F1 whole at the top, F2–F4 below, F5's map band at the bottom edge (out/frame-solver.mjs)
	{f: 112, eye: {x: -3244, y: 5550, z: 2760}, tgt: {x: -40, y: 0, z: -940}, persp: 3200},
	{f: 140, eye: {x: -3150, y: 5470, z: 2700}, tgt: {x: -40, y: 8, z: -950}, persp: 3200},
	// crane down onto Discover's results (M3 CAM_ENTRY)
	{f: LEN, eye: eyeOf(CAM_ENTRY), tgt: {x: CAM_ENTRY.x, y: CAM_ENTRY.y, z: CAM_ENTRY.z}, persp: CAM_ENTRY.persp},
];

/** Non-uniform cubic Hermite through the keys (Catmull-Rom tangents, zero at the ends). */
function spline<T>(f: number, get: (k: Key) => number): number {
	const n = KEYS.length;
	if (f <= KEYS[0].f) return get(KEYS[0]);
	if (f >= KEYS[n - 1].f) return get(KEYS[n - 1]);
	let i = 0;
	while (i < n - 2 && f > KEYS[i + 1].f) i++;
	const k0 = KEYS[i];
	const k1 = KEYS[i + 1];
	const tan = (j: number) => (j <= 0 || j >= n - 1 ? 0 : (get(KEYS[j + 1]) - get(KEYS[j - 1])) / (KEYS[j + 1].f - KEYS[j - 1].f));
	const h = k1.f - k0.f;
	const t = (f - k0.f) / h;
	const t2 = t * t;
	const t3 = t2 * t;
	return (2 * t3 - 3 * t2 + 1) * get(k0) + (t3 - 2 * t2 + t) * h * tan(i) + (-2 * t3 + 3 * t2) * get(k1) + (t3 - t2) * h * tan(i + 1);
}

function camAt(f: number): {cam: Cam; eye: V3} {
	// Gentle global time-warp: leave the shaft softly, settle softly onto M3.
	const u = LEN * ease.inOut(clamp(f / LEN, 0, 1)) * 0.35 + f * 0.65;
	const eye = {x: spline(u, (k) => k.eye.x), y: spline(u, (k) => k.eye.y), z: spline(u, (k) => k.eye.z)};
	const tgt = {x: spline(u, (k) => k.tgt.x), y: spline(u, (k) => k.tgt.y), z: spline(u, (k) => k.tgt.z)};
	const persp = spline(u, (k) => k.persp);
	if (f >= LEN - 0.5) return {cam: CAM_ENTRY, eye: eyeOf(CAM_ENTRY)};
	if (f <= 0) return {cam: START, eye};
	return {cam: lookAt(eye, tgt, persp), eye};
}

/* ─────────────── hero: on F2, looks up, scampers to card 1 ─────────────── */

const Z2 = FLOOR_Z.discover;
const CARD_TOP = Z2 + 4;
type Stop = {x: number; y: number};
const HOPS: Array<{a: number; b: number; from: Stop; to: Stop; apex: number}> = [
	{a: 76, b: 95, from: {x: 983, y: 428}, to: {x: 852, y: 420}, apex: 42},
	{a: 97, b: 116, from: {x: 852, y: 420}, to: {x: 716, y: 410}, apex: 42},
	{a: 118, b: 137, from: {x: 716, y: 410}, to: {x: 602, y: 402}, apex: 40},
	{a: 140, b: 154, from: {x: 602, y: 402}, to: {x: 548, y: 398}, apex: 22},
];
const LAST_HOP_END = 154;
const M3_HANDOVER = 183; // M3's first hop (h0) starts here (film 12.80 s)

function heroPose(f: number) {
	let x = 983;
	let y = 428;
	let z = lerp(Z2, CARD_TOP, prog(f, 0, 20, ease.inOut));
	let sx = 1;
	let sy = 1;
	let sz = 1;
	let rx = 0;
	let rz = 0;
	// looks up at the falling cursor: rears its nose (the ▷ end) up, holds, settles
	const look = prog(f, 14, 40, ease.out) * (1 - prog(f, 64, 76, ease.inOut));
	rx = -0; // keep the face readable from above
	let ry = -16 * look; // the ▷ end (east) lifts toward the cursor
	for (const h of HOPS) {
		if (f >= h.a - 5 && f < h.a) {
			const c = Math.sin((Math.PI / 2) * ((f - (h.a - 5)) / 5));
			sy = 1 - 0.12 * c;
			sx = 1 + 0.07 * c;
			sz = 1 - 0.2 * c;
		}
		if (f >= h.a && f <= h.b) {
			const t = (f - h.a) / (h.b - h.a);
			x = lerp(h.from.x, h.to.x, t);
			y = lerp(h.from.y, h.to.y, t);
			z = CARD_TOP + 4 * h.apex * t * (1 - t);
			const v = 1 - 2 * t; // +up … −down
			sy = 1 + 0.08 * v * v;
			sx = 1 / Math.sqrt(sy);
			rz = 4 * Math.sin(Math.PI * t);
			ry = 8 * (t - 0.5);
		} else if (f > h.b && f < h.b + 14) {
			x = h.to.x;
			y = h.to.y;
			z = CARD_TOP;
			const imp = Math.exp(-(f - h.b) / 4);
			sx = 1 + 0.16 * imp;
			sy = 1 - 0.12 * imp;
			sz = 1 - 0.3 * imp;
		}
	}
	if (f > LAST_HOP_END + 13) {
		x = 548;
		y = 398;
		z = CARD_TOP;
		// glance back over its shoulder at the cursor, then crouch for the next hop (anticipation into M3's h0 at 183)
		ry = 10 * prog(f, 160, 170, ease.out) * (1 - prog(f, 172, 178, ease.inOut));
		const crouch = prog(f, 176, 182, ease.inOut);
		sy = 1 - 0.14 * crouch;
		sx = 1 + 0.08 * crouch;
		sz = 1 - 0.25 * crouch;
	}
	// between hops: land on the next start
	if (f > 95 && f < 97) ({x, y} = HOPS[0].to);
	return {x, y, z, sx, sy, sz, rx, ry, rz};
}

/* ─────────────── cursor: drifts down the gap to M3's start ─────────────── */

function cursorAtM2(f: number) {
	const end = cursorAt(0);
	const endNext = cursorAt(1);
	const a = M1_EXIT.cursor; // world (263, 21, −150), falling 110 px/s
	const bW = toWorld(end.wx, end.wy, Z2 + end.h);
	const bW1 = toWorld(endNext.wx, endNext.wy, Z2 + endNext.h);
	const t = f / LEN;
	const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
	const h10 = t ** 3 - 2 * t ** 2 + t;
	const h01 = -2 * t ** 3 + 3 * t ** 2;
	const h11 = t ** 3 - t ** 2;
	const v0 = {x: 0, y: 0, z: (-110 / 60) * LEN};
	const v1 = {x: (bW1.x - bW.x) * LEN, y: (bW1.y - bW.y) * LEN, z: (bW1.z - bW.z) * LEN};
	const lerpH = (p0: number, m0: number, p1: number, m1: number) => h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
	// a little sideways sway, like a falling leaf, that dies out before the hand-off
	const sway = 26 * Math.sin((f / 60) * Math.PI * 1.6) * Math.sin(Math.PI * t);
	return {
		x: lerpH(a.x, v0.x, bW.x, v1.x) + sway,
		y: lerpH(a.y, v0.y, bW.y, v1.y),
		z: lerpH(a.z, v0.z, bW.z, v1.z),
		rot: lerp(9, end.rot ?? 0, ease.inOut(t)) + 6 * Math.sin((f / 60) * Math.PI * 1.6) * Math.sin(Math.PI * t),
	};
}

export const M2: React.FC = () => {
	const f = useCurrentFrame();
	const {cam, eye} = camAt(f);
	const pg = pageAt(0);
	const showF1 = eye.z > 0;
	const cardRise = prog(f, 0, 20, ease.inOut);
	const cur = cursorAtM2(f);
	const curState = {x: cur.x, y: cur.y, z: cur.z, kind: 'arrow' as const, rot: cur.rot};
	// cursor size: M1's depth-boosted pointer → M3's depthScale 0.5 (min .8, max 1.2)
	const k = project(cam, curState).scale / (4 / 3);
	const sizeM1 = 44 * clamp(1 + 0.35 * (k - 1), 1, 1.45);
	const sizeM3 = 44 * clamp(1 + (k - 1) * 0.5, 0.8, 1.2);
	const size = lerp(sizeM1, sizeM3, prog(f, 0, 60, ease.inOut));
	const hp = heroPose(f);
	const useM3Hero = f >= M3_HANDOVER;
	const Lab = FLOOR_WINDOWS.lab;
	const Seed = FLOOR_WINDOWS.seedmap;
	const Ws = FLOOR_WINDOWS.workshop;
	const fogC = '#ddd8df';
	return (
		<AbsoluteFill style={{background: ENV, fontFamily: FONT.ui, color: C.textPrimary}}>
			<Stage cam={cam}>
				<Floor z={FLOOR_Z.workshop} fog={0.7} fogColor={fogC}>
					<Ws />
				</Floor>
				<Floor z={FLOOR_Z.seedmap} fog={0.6} fogColor={fogC}>
					<Seed />
				</Floor>
				<Floor z={FLOOR_Z.lab} fog={0.5} fogColor={fogC}>
					<Lab />
				</Floor>
				<Floor z={FLOOR_Z.instance} fog={0.35} fogColor={fogC}>
					<InstanceWindow lite="none" />
				</Floor>
				<Floor z={Z2}>
					<DiscoverFloor
						s={{
							field: pg.field,
							results: {loading: pg.loading, empty: pg.empty, emptyHover: pg.emptyHover, emptyPress: pg.emptyPress, thumb: pg.thumb},
							nav: {...DISCOVER_NAV, badge: {s: pg.badge, count: 1}},
							frame: 0,
						}}
					/>
				</Floor>
				<Obj z={-4 * (1 - cardRise)}>
					{CARDS.map((d, i) => (
						<CardSlab key={d.title} i={i} d={d} fx={pg.cards.fx[i]} opacity={pg.cards.opacity} dy={pg.cards.dy} />
					))}
				</Obj>
				{useM3Hero ? (
					<HeroBody pose={heroAt(f + M3_OFFSET)} />
				) : (
					<Hero
						x={toWorld(hp.x, hp.y, 0).x}
						y={toWorld(hp.x, hp.y, 0).y}
						z={hp.z}
						floorZ={CARD_TOP}
						sx={hp.sx}
						sy={hp.sy}
						sz={hp.sz}
						rx={hp.rx}
						ry={hp.ry}
						rz={hp.rz}
						shadowStrength={0.85}
					/>
				)}
				<CursorShadow cursor={curState} floorZ={CARD_TOP} strength={0.8} />
				{showF1 ? (
					<>
						{/* the empty socket reads as a dark slot from afar */}
						<Obj x={toWorld(983, 428, 0).x} y={toWorld(983, 428, 0).y} z={-12}>
							<div style={{position: 'absolute', left: -72, top: -24, width: 144, height: 48, borderRadius: 16, background: 'rgba(47,42,54,0.88)'}} />
						</Obj>
						<HomeFloor socket hero={null} sides />
					</>
				) : null}
			</Stage>
			<CursorOverlay cam={cam} cursor={curState} size={size} depthScale={0} />
		</AbsoluteFill>
	);
};
