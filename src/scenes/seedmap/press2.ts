/**
 * M5 · Sh20 (48.97–51.50): the shaft framing for the heartbeat and press 2, the sink,
 * and the push that gathers into the dive. Pure functions of the M5-local frame
 * (frame 0 = film 40.00 s). plan.ts imports this file, never the other way round.
 *
 *   48.97–49.43  the camera leaves the toast framing for the shaft as the cursor heads for the pin
 *   49.43–50.20  held on the shaft at 2.4× (Sh03 presses at 2.5×): heartbeat 49.50, press 2 50.00
 *   50.15        the sink starts at once (≈ 27 below F5 by 50.33) and accelerates into the hand-off
 *                (420 below F5 = 300 above F6 at 51.50, ≈ 12 px/frame: M6's entry)
 *   50.20–51.25  a slow vertigo push: F5 2.4× → 2.76× while the lens opens 1000 → ≈ 715,
 *                so the hole deepens and the falling hero recedes faster
 *   51.25–51.48  it gathers, without a hold, into the plunge after the cursor (51.30) and reaches
 *                CAM_END on M5's last frame with the eye still dropping ≈ 55 px/frame and the lens
 *                ≈ +21/frame (M6 frame 0 is that motion one frame on)
 */
import {Cam} from '../../stage/Stage';
import {flatCam} from '../../film/camera';
import {FLOOR_Z, SHAFT} from '../../film/timeline';

const F5 = FLOOR_Z.seedmap;
const F6 = FLOOR_Z.workshop;
const at = (s: number) => Math.round((s - 40) * 60);

export const P2 = {
	shaftFrom: at(48.97), // 538 (the cursor leaves 「添加标记」 at 540)
	shaftTo: at(49.43), // 566
	sink: at(50.15), // 609
	push: at(50.2), // 612
	turn: at(51.25), // 675
	dive: at(51.3), // 678
	end: 690,
} as const;

/** Screen scale of F5 while the heartbeat and press 2 play (the hero uncurls to ≈ 346 × 115 px). */
export const S_PRESS = 2.4;
export const CAM_PRESS: Cam = flatCam(F5, {wx: SHAFT.x, wy: SHAFT.y, scale: S_PRESS, persp: 1000});

// ------------------------------------------------------------------ push → dive

const LAST = P2.end - 1; // M5's last frame: the camera is exactly CAM_END (plan.ts)
const H_PRESS = 1000 / S_PRESS; // eye above F5 while held (416.7)
const H_END = 600 - (F5 - F6); // CAM_END's eye relative to F5 (−120)
const V_END = 55; // eye speed at the cut, px/frame
const P_END = 800;
const PV_END = 21; // lens opening per frame at the cut
const V_TURN = 7.5; // eye speed when the push gathers into the plunge
const PUSH_N = P2.turn - P2.push; // 63
const DIVE_N = LAST - P2.turn; // 14
const H_TURN = H_PRESS - (V_TURN * PUSH_N) / 3; // eye speed ramps as V_TURN·u² → 259.2 at the turn
const S_GROW = 0.15; // F5 grows 15 % over the push (∝ u³: no visible start)
const S_TURN = S_PRESS * (1 + S_GROW);
const P_TURN = S_TURN * H_TURN;
const PV_TURN = ((S_PRESS * S_GROW * 3) / PUSH_N) * H_TURN - S_TURN * V_TURN; // dP/df at the turn (≈ −16)
/** Plunge speed V_TURN + (V_END − V_TURN)·w^(Q−1): its integral over DIVE_N frames is H_TURN − H_END. */
const Q = (DIVE_N * (V_END - V_TURN)) / (H_TURN - H_END - DIVE_N * V_TURN);

const hermite = (w: number, p0: number, m0: number, p1: number, m1: number) => {
	const w2 = w * w;
	const w3 = w2 * w;
	return (2 * w3 - 3 * w2 + 1) * p0 + (w3 - 2 * w2 + w) * m0 + (-2 * w3 + 3 * w2) * p1 + (w3 - w2) * m1;
};

/** Eye height above F5 and lens from the press framing to the hand-off. */
export function pushDive(f: number): {h: number; persp: number} {
	if (f <= P2.push) return {h: H_PRESS, persp: 1000};
	if (f <= P2.turn) {
		const u3 = Math.pow((f - P2.push) / PUSH_N, 3);
		const h = H_PRESS - ((V_TURN * PUSH_N) / 3) * u3;
		return {h, persp: S_PRESS * (1 + S_GROW * u3) * h};
	}
	const w = Math.min(1, (f - P2.turn) / DIVE_N);
	const h = H_TURN - DIVE_N * (V_TURN * w + ((V_END - V_TURN) * Math.pow(w, Q)) / Q);
	return {h, persp: hermite(w, P_TURN, PV_TURN * DIVE_N, P_END, PV_END * DIVE_N)};
}

/** The camera from 50.20 on: top-down on the shaft (target kept on F6 so dist stays positive). */
export function pushDiveCam(f: number): Cam {
	const {h, persp} = pushDive(f);
	return {x: SHAFT.x - 720, y: SHAFT.y - 405, z: F6, dist: h + (F5 - F6), pitch: 0, yaw: 0, roll: 0, persp};
}

// ------------------------------------------------------------------ the hero's sink

/**
 * Depth below F5 of press 2's sink: moving at once (≈ 2.6 px/frame, ≈ 27 by 50.33), then
 * gathering speed into M6's entry (420 at 51.50, slope ≈ 11.9 px/frame).
 */
export function sinkDrop(f: number): number {
	if (f <= P2.sink) return 0;
	const u = (f - P2.sink) / (P2.end - P2.sink);
	return 420 * (0.5 * u - 0.295 * u * u + 0.795 * u * u * u);
}

// ------------------------------------------------------------------ the cursor's dive

/**
 * Height of the diving cursor above F5 (without the wind-up): it leaves at 51.30 and accelerates
 * so that its gap to the lens closes smoothly to ≈ 49 on the last frame (M6 frame 0: 45, then 43
 * and back up), and it is 220 below F5 at 51.50 (M6: F6 + 500).
 */
export function cursorDive(f: number): number {
	const t = Math.max(0, (f - P2.dive) / (P2.end - P2.dive));
	return -220 * Math.pow(t, 2.96);
}

// ------------------------------------------------------------------ light under the hole

/**
 * F6 seen through the hole lies in F5's shadow: dark, with a soft patch where the hole lets the
 * light down (Sh03's SHAFT_LIGHT, scaled to the deeper gap). Use as a Floor fogColor at fog 0..1.
 */
export const SHAFT_GLOW = `radial-gradient(ellipse 240px 104px at ${SHAFT.x}px ${SHAFT.y}px, rgba(18,12,26,0.26) 0%, rgba(18,12,26,0.5) 42%, rgba(18,12,26,0.93) 100%)`;
