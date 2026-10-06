import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

/**
 * Inter 3.19 for Latin and digits (as the product ships), Noto Sans SC as the
 * stand-in for the PingFang SC the product falls back to on macOS. PingFang
 * tops out at Semibold, so Chinese set at 700/800 in the app renders as
 * Semibold beside true-weight Inter — reproduced by mapping 600–900 to a
 * static 600 instance (no synthetic bolding).
 *
 * Fonts are fetched with retries: under high render concurrency a single
 * fetch from the bundle server can fail transiently ("Failed to fetch"),
 * which would otherwise abort the whole render.
 */
const FACES: Array<{family: string; file: string; weight: string}> = [
	{family: 'Inter', file: 'Inter-Regular.woff2', weight: '400'},
	{family: 'Inter', file: 'Inter-Medium.woff2', weight: '500'},
	{family: 'Inter', file: 'Inter-SemiBold.woff2', weight: '600'},
	{family: 'Inter', file: 'Inter-Bold.woff2', weight: '700'},
	{family: 'Inter', file: 'Inter-ExtraBold.woff2', weight: '800'},
	{family: 'Noto Sans SC', file: 'NotoSansSC-subset.woff2', weight: '100 599'},
	{family: 'Noto Sans SC', file: 'NotoSansSC-600-subset.woff2', weight: '600 900'},
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loadFace(family: string, file: string, weight: string, attempts = 8): Promise<void> {
	let last: unknown;
	for (let i = 0; i < attempts; i++) {
		try {
			const face = new FontFace(family, `url('${staticFile(`fonts/${file}`)}') format('woff2')`, {weight, style: 'normal', display: 'block'});
			await face.load();
			(document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
			return;
		} catch (e) {
			last = e;
			await sleep(200 * (i + 1));
		}
	}
	throw last;
}

const handle = typeof document === 'undefined' ? null : delayRender('Loading Inter + Noto Sans SC', {timeoutInMilliseconds: 120000});

export const fontsLoaded: Promise<void> =
	typeof document === 'undefined'
		? Promise.resolve()
		: Promise.all(FACES.map((f) => loadFace(f.family, f.file, f.weight)))
				.then(() => {
					if (handle !== null) continueRender(handle);
				})
				.catch((err) => cancelRender(err));

export const FONT_STACK = `Inter, 'Noto Sans SC', -apple-system, 'Segoe UI', sans-serif`;
