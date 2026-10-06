/**
 * Discover's UI state per frame (search field, results, cards, cart bar,
 * modal, toast, nav badge). Product timings (150 ms hovers, 220 ms card
 * reveal, 250 ms cart spring, 200 ms modal, 300 ms toast) stretched ≤ ×2.
 */
import {Easing} from 'remotion';
import {clamp, ease} from '../../lib/anim';
import {B, pressPulse, ramp, smooth} from './beats';
import {cursorAt} from './cursor';
import {toastP} from './hero';
import {CardFx} from '../../ui/pages/discover/Results';
import {FieldState} from '../../ui/pages/discover/Toolbar';
import {CARD_H, CART_INSTALL, cardY, EMPTY, InstallState, installBox, MODAL, MODAL_INSTALL, RESULTS} from '../../ui/pages/discover/layout';

const spring = Easing.bezier(0.15, 1.4, 0.64, 0.96);

const PINYIN = 'qidonganniuqunale';
/** Key times: syllable bursts q i | d o n g | a n | n i u | q u | n a | l e over 16.40–17.90. */
const KEY_T: number[] = (() => {
	const breaks = new Set([1, 5, 7, 10, 12, 14]);
	const a = 4.725;
	const b = 7.125;
	const out = [B.pinyin0];
	for (let i = 1; i < PINYIN.length; i++) out.push(out[i - 1] + (breaks.has(i - 1) ? b : a));
	return out.map((t) => Math.round(t));
})();

export type PageState = {
	field: FieldState;
	loading: number;
	empty: number;
	emptyHover: number;
	emptyPress: number;
	thumb: number;
	cards: {opacity: number; dy: number; fx: CardFx[]};
	cart: {t: number; opacity: number; preparing: boolean; hover: number; press: number} | null;
	modal: {opacity: number; scale: number; dx: number; dy: number; hover: number; press: number} | null;
	scrim: number;
	toast: {tx: number; scale: number; opacity: number; p: number; counter: string} | null;
	badge: number;
	content: number;
	spin: number;
};

const inBox = (x: number, y: number, b: {x: number; y: number; w: number; h: number}) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

/**
 * Hero card taps in Sh08 (piano keys): [card, land, leave]. Each touch holds
 * the real hover (brightness .9, 150 ms) for ≥ 10 frames so it reaches full
 * strength, and presses the card (contents scale .97, 125 ms ease-out) while
 * the hero stands on it.
 */
const TAPS: Array<[number, number, number]> = [
	[0, B.tap1, B.tap1 + 3],
	[1, B.tap2, B.tap2 + 3],
	[2, B.tap3, B.dart],
	[0, B.dart + 11, B.dart + 13], // the skip during the dart
];
const TAP_HOVER = 10;

function tapPress(i: number, f: number): number {
	let p = 0;
	for (const [c, land, leave] of TAPS) {
		if (c !== i || f < land) continue;
		const down = ease.out(ramp(f, land, land + 7));
		const up = ease.out(ramp(f, leave, leave + 7));
		p = Math.max(p, down * (1 - up));
	}
	return p;
}

const cardsVisible = (f: number) => f < B.search || f >= B.click1 + 16;

function field(f: number): FieldState {
	const s: FieldState = {};
	// the ▷ sits in the icon slot from mid-morph until the pop
	s.iconHidden = f >= B.field + 12 && f < B.pop;
	if (f >= B.click && f < B.snap) {
		s.focused = 1;
		const n = KEY_T.filter((t) => f >= t).length;
		if (f < B.commit) s.composition = PINYIN.slice(0, n);
		else s.text = f < B.q ? '启动按钮去哪了' : '启动按钮去哪了？';
		const lastInput = f >= B.q ? B.q : f >= B.commit ? B.commit : n > 0 ? KEY_T[n - 1] : B.click;
		const since = f - lastInput;
		s.caret = Math.floor(since / 32) % 2 === 0;
		s.clear = f >= B.commit;
	} else if (f >= B.snap && f < B.click1) {
		s.text = '启动按钮去哪了？';
		s.clear = true;
	}
	return s;
}

export function pageAt(f: number): PageState {
	const vis = cardsVisible(f);
	// card reveal after 清除搜索: opacity 0 → 1, translateY 4 → 0 (220 ms → 300 ms film)
	const rv = f >= B.click1 ? ease.out(ramp(f, B.click1 + 16, B.click1 + 34)) : 1;
	const fx: CardFx[] = [0, 1, 2, 3].map((i) => {
		const hover = smooth(
			(k) => {
				if (TAPS.some(([c, a, b]) => c === i && k >= a && k < Math.max(b, a + TAP_HOVER))) return 1;
				const c = cursorAt(k);
				if (k >= B.flat && cardsVisible(k) && c.h < 24 && inBox(c.wx, c.wy, {x: RESULTS.x, y: cardY(i), w: RESULTS.w, h: CARD_H})) {
					// not while a modal/cart/toast sits above the pointer
					if (k >= B.modal && k < B.click4 + 4) return 0;
					return 1;
				}
				return 0;
			},
			f,
			9,
		);
		const fxi: CardFx = {hover, press: tapPress(i, f), spinDeg: (f * 6) % 360};
		if (i === 1) {
			const st: InstallState = f < B.click2 ? 'install' : f < B.toast ? 'selected' : 'installing';
			fxi.install = st;
			const box = installBox(1, st);
			fxi.installHover = smooth((k) => (k < B.click2 + 3 && inBox(cursorAt(k).wx, cursorAt(k).wy, box) ? 1 : 0), f, 9);
			fxi.installPress = pressPulse(f, B.click2);
		}
		return fxi;
	});

	const loading = (f >= B.search && f < B.empty) || (f >= B.click1 && f < B.click1 + 16) ? 1 : 0;
	const empty = f >= B.empty && f < B.click1 ? 1 : 0;

	// cart bar: springs in at 24.60 (scale .5 + translateY(-10rem) → rest), hides when the modal opens
	let cart: PageState['cart'] = null;
	if (f >= B.cart && f < B.modal + 15) {
		const t = spring(ramp(f, B.cart, B.cart + 24));
		const leave = ramp(f, B.modal, B.modal + 15);
		cart = {
			t: t - 0.04 * leave,
			opacity: clamp(ramp(f, B.cart, B.cart + 10), 0, 1) * (1 - ease.in(leave)),
			preparing: f >= B.click3,
			hover: smooth((k) => (k < B.click3 + 2 && inBox(cursorAt(k).wx, cursorAt(k).wy, CART_INSTALL) ? 1 : 0), f, 9),
			press: pressPulse(f, B.click3),
		};
	}

	// 「确认安装」 modal: container from (click − centre)/16 → 0, body .97 → 1 + fade; closes .97 + fade
	let modal: PageState['modal'] = null;
	let scrim = 0;
	if (f >= B.modal && f < B.click4 + 14) {
		const u = ramp(f, B.modal, B.modal + 21);
		const cl = ramp(f, B.click4 + 2, B.click4 + 14);
		const clickX = CART_INSTALL.x + 73;
		const clickY = CART_INSTALL.y + 19;
		const off = 1 - ease.out(u);
		modal = {
			opacity: ease.inOut(u) * (1 - ease.inOut(cl)),
			scale: 0.97 + 0.03 * ease.inOut(u) - 0.03 * ease.inOut(cl),
			dx: ((clickX - (MODAL.x + MODAL.w / 2)) / 16) * off,
			dy: ((clickY - (MODAL.y + MODAL.h / 2)) / 16) * off,
			hover: smooth((k) => (inBox(cursorAt(k).wx, cursorAt(k).wy, MODAL_INSTALL) ? 1 : 0), f, 9),
			press: pressPulse(f, B.click4),
		};
		scrim = ease.inOut(u) * (1 - ease.inOut(ramp(f, B.click4 + 1, B.click4 + 14)));
	}

	// download toast: enters translateX(100%) scale(.8) → rest; kicked out by the release
	let toast: PageState['toast'] = null;
	if (f >= B.toast && f < B.fling + 22) {
		const u = ease.inOut(ramp(f, B.toast, B.toast + 25));
		const out = ease.in(ramp(f, B.fling + 2, B.fling + 20));
		const k = u * (1 - out);
		toast = {tx: 1 - k, scale: 0.8 + 0.2 * k, opacity: k, p: toastP(f), counter: f < B.fling ? '1 / 2' : '2 / 2'};
	}

	const badge = f < B.badge ? 0 : spring(ramp(f, B.badge, B.badge + 14));

	return {
		field: field(f),
		loading,
		empty,
		emptyHover: smooth((k) => (k >= B.empty && k < B.click1 + 2 && inBox(cursorAt(k).wx, cursorAt(k).wy, EMPTY.button) ? 1 : 0), f, 9),
		emptyPress: pressPulse(f, B.click1),
		thumb: vis ? rv : 0,
		cards: {opacity: vis ? rv : 0, dy: 4 * (1 - rv), fx},
		cart,
		modal,
		scrim,
		toast,
		badge,
		content: 1 - ease.out(ramp(f, B.quick, B.quick + 10)),
		spin: (f * 6) % 360,
	};
}
