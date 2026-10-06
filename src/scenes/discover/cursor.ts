/**
 * The cursor in M3: window position on F2, height above F2 (glass in the
 * tilted Sh08, the clicked surface in flat shots), kind from the UI under
 * the hotspot, click presses, double-take and the dizzy spell.
 */
import {Easing} from 'remotion';
import {clamp, ease, EaseFn, track} from '../../lib/anim';
import {CursorKind} from '../../characters/Cursor';
import {B, pressPulse} from './beats';
import {CARD_H, CART, CART_INSTALL, cardY, EMPTY, FIELD, installBox, MODAL, MODAL_CANCEL, MODAL_INSTALL, RESULTS, TOAST} from '../../ui/pages/discover/layout';

type K = [number, number, number, number, EaseFn?]; // frame, wx, wy, h, ease into

const ib2 = installBox(1, 'install');

const CB = {x: EMPTY.button.x + 43, y: EMPTY.button.y + 19}; // 「清除搜索」
const C2 = {x: ib2.x + 40, y: ib2.y + 19}; // card 2 「＋ 安装」
const CI = {x: CART_INSTALL.x + 73, y: CART_INSTALL.y + 19}; // 「＋ 安装 1 个内容」
const MI = {x: MODAL_INSTALL.x + 27, y: MODAL_INSTALL.y + 19}; // modal 「安装」

/** Lunge into a click: accelerates all the way (frantic slam), last step ≈ 18–20 % of the distance. */
const LUNGE: EaseFn = (t) => Math.pow(t, 1.7);
/** A long approach: gentle start and settle, lower peak than ease.inOut. */
const APPROACH: EaseFn = Easing.bezier(0.33, 0, 0.3, 1);

const KEYS: K[] = [
	// Sh08: descends from above toward the cards (its shadow grows beside the hero) —
	// keys 0 and B.dart are the M2 hand-off (cursorAt(0), cursorAt(1)): keep them
	[0, 990, 640, 280],
	[B.dart, 880, 610, 150, ease.inOut],
	// chases the dart one step behind, reaching glass height over the field at 15.00
	[B.field, 720, 520, 96, ease.inOut],
	[B.glass, 610, 430, 60, ease.inOut],
	// Sh09: two searching arcs, then the field — clicks just right of where the title will end
	[B.glass + 12, 680, 500, 28, ease.inOut],
	[B.flat, 610, 470, 0, ease.inOut],
	[B.flat + 12, 520, 400, 0, ease.inOut],
	[B.flat + 22, 446, 296, 0, ease.inOut],
	[B.click, 298, 150, 0, ease.inOut],
	// Sh11: drifts left along the text toward the ▷; startle at the pop
	[B.drift, 298, 150, 0],
	[B.drift + 30, 142, 146, 0, ease.inOut],
	[B.pop, 142, 146, 0],
	[B.pop + 9, 170, 174, 0, ease.out],
	// M1: approach, 6-frame wind-up, lunge (7 frames), click 23.00, dwell
	[B.swoop1 - 8, 528, 428, 0, APPROACH],
	[B.swoop1 - 2, 516, 416, 0, ease.inOut],
	[B.click1 - 1, CB.x, CB.y, 0, LUNGE],
	[B.click1 + 4, CB.x, CB.y, 0],
	[B.click1 + 26, 640, 470, 0, ease.inOut],
	// M2
	[B.swoop2 - 8, 892, 548, 4, ease.inOut],
	[B.swoop2 - 2, 878, 540, 4, ease.inOut],
	[B.click2 - 1, C2.x, C2.y, 4, LUNGE],
	[B.click2 + 4, C2.x, C2.y, 4],
	[B.click2 + 34, 980, 560, 4, ease.inOut],
	// M3 (8-frame lunge)
	[B.swoop3 - 9, 812, 660, 10, ease.inOut],
	[B.swoop3 - 3, 800, 650, 12, ease.inOut],
	[B.click3 - 1, CI.x, CI.y, 20, LUNGE],
	[B.click3 + 4, CI.x, CI.y, 20],
	[B.click3 + 34, 900, 690, 30, ease.inOut],
	// M4: longest lunge (9 frames), a 2-frame slam, then the momentum carries it on into the dizzy wobble
	[B.swoop4 - 10, 804, 530, 36, ease.inOut],
	[B.swoop4 - 4, 790, 520, 36, ease.inOut],
	[B.click4 - 1, MI.x, MI.y, 36, LUNGE],
	[B.click4 + 1, MI.x, MI.y, 36],
	[B.click4 + 11, 1064, 679, 30, ease.inOut],
	[B.land5 + 12, 1058, 660, 8, ease.inOut],
	// Sh13: rushes to the toast, then chases the fling (one step behind) into the exit pose without a stop
	[B.toToast, 1040, 560, 4, ease.inOut],
	[B.fling - 2, 1252, 262, 10, ease.inOut],
	[B.end - 1, 300, 160, 0, ease.inOut],
];

const tk = (f: number, i: 1 | 2 | 3) =>
	track(
		f,
		KEYS.map((k) => [k[0], k[i], k[4]] as const),
	);

export type CursorPose = {wx: number; wy: number; h: number; kind: CursorKind; press: number; rot: number; speed: number};

const CLICKS = [B.click, B.click1, B.click2, B.click3, B.click4];

const inBox = (x: number, y: number, b: {x: number; y: number; w: number; h: number}, m = 0) => x >= b.x - m && x <= b.x + b.w + m && y >= b.y - m && y <= b.y + b.h + m;

/** Kind from the UI under the hotspot (a real pointer). */
function kindAt(f: number, x: number, y: number, h: number): CursorKind {
	if (h > 24 || f >= B.quick) return 'arrow';
	if (f >= B.modal && f < B.click4 + 6) {
		if (inBox(x, y, MODAL)) return inBox(x, y, MODAL_INSTALL) || inBox(x, y, MODAL_CANCEL) ? 'pointer' : 'arrow';
		return 'arrow';
	}
	if (f >= B.cart + 6 && f < B.modal && inBox(x, y, CART)) return inBox(x, y, CART_INSTALL) || x < CART.x + 300 ? 'pointer' : 'arrow';
	if (f >= B.toast + 12 && f < B.fling + 6 && inBox(x, y, TOAST)) return 'pointer';
	if (inBox(x, y, FIELD)) return 'ibeam';
	const cardsOn = f < B.search || f >= B.click1 + 16;
	if (cardsOn) {
		for (let i = 0; i < 4; i++) if (inBox(x, y, {x: RESULTS.x, y: cardY(i), w: RESULTS.w, h: CARD_H})) return 'pointer';
	}
	if (f >= B.empty && f < B.click1 + 2 && inBox(x, y, EMPTY.button)) return 'pointer';
	return 'arrow';
}

export function cursorAt(f: number): CursorPose {
	let wx = tk(f, 1);
	let wy = tk(f, 2);
	const h = f >= B.quick ? 0 : Math.max(0, tk(f, 3));
	let rot = 0;
	// 21.90 double-take: quick ±4 px jiggle
	if (f >= B.doubleTake && f < B.doubleTake + 14) {
		const t = (f - B.doubleTake) / 60;
		wx += 4 * Math.sin(2 * Math.PI * 6 * t) * Math.exp(-6 * t);
		rot = -4 * Math.sin(2 * Math.PI * 3 * t) * Math.exp(-5 * t);
	}
	// 27.6–28.2 overshoot → dizzy wobble
	if (f >= B.click4 + 6 && f < B.land5 + 16) {
		const t = (f - (B.click4 + 6)) / 60;
		const env = Math.sin(Math.PI * clamp((f - (B.click4 + 6)) / (B.land5 + 16 - (B.click4 + 6)), 0, 1));
		wx += 13 * Math.sin(2 * Math.PI * 1.9 * t) * env;
		wy += 8 * Math.cos(2 * Math.PI * 1.9 * t) * env;
		rot = 11 * Math.sin(2 * Math.PI * 1.9 * t + 0.6) * env;
	}
	let press = 0;
	for (const c of CLICKS) press = Math.max(press, pressPulse(f, c));
	const a = {x: tk(f - 1, 1), y: tk(f - 1, 2)};
	const speed = Math.hypot(wx - a.x, wy - a.y);
	return {wx, wy, h, kind: kindAt(f, wx, wy, h), press, rot, speed};
}
