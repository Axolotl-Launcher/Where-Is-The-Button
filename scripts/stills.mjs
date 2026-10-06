/**
 * Render selected frames as PNG stills (+ optional contact sheet) for review.
 *
 *   node scripts/stills.mjs <compositionId> <frames> [outDir] [--sheet] [--scale=0.5] [--par=2] [--entry=src/dev/M3.tsx]
 *
 * <frames>: "120" | "0,90,180" | "0-600:60" (start-end:step) | mixes "0-300:30,450"
 * Bundles once, opens one browser, renders frames with limited parallelism.
 */
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const pos = args.filter((a) => !a.startsWith('--'));
const [compId = 'Film', framesArg = '0', outDir = 'out/stills'] = pos;
const sheet = flags.includes('--sheet');
const scaleFlag = flags.find((f) => f.startsWith('--scale='));
const scale = scaleFlag ? Number(scaleFlag.split('=')[1]) : 1;
const parFlag = flags.find((f) => f.startsWith('--par='));
const PAR = parFlag ? Number(parFlag.split('=')[1]) : 4;
const entryFlag = flags.find((f) => f.startsWith('--entry='));
const ENTRY = entryFlag ? entryFlag.split('=')[1] : 'src/index.ts';

function parseFrames(s) {
	const out = [];
	for (const part of s.split(',')) {
		const m = part.match(/^(\d+)-(\d+)(?::(\d+))?$/);
		if (m) {
			const [a, b, st] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 1)];
			for (let f = a; f <= b; f += st) out.push(f);
		} else if (part.trim()) out.push(Number(part));
	}
	return [...new Set(out)].sort((x, y) => x - y);
}

const frames = parseFrames(framesArg);
fs.mkdirSync(outDir, {recursive: true});
const t0 = Date.now();
// Bundle onto E: (not %TEMP% on C:), link public/ instead of copying it, and
// delete the bundle afterwards — every run used to leave ~140 MB in %TEMP%.
const bundleDir = path.resolve('out/.bundles', `run-${process.pid}-${Date.now()}`);
fs.mkdirSync(path.dirname(bundleDir), {recursive: true});
let serveUrl;
try {
	serveUrl = await bundle({entryPoint: path.resolve(ENTRY), outDir: bundleDir, symlinkPublicDir: true, onProgress: () => undefined});
} catch (e) {
	console.warn('symlinked public dir failed, copying instead:', e.message);
	fs.rmSync(bundleDir, {recursive: true, force: true});
	serveUrl = await bundle({entryPoint: path.resolve(ENTRY), outDir: bundleDir, onProgress: () => undefined});
}
const cleanup = () => {
	try {
		fs.rmSync(bundleDir, {recursive: true, force: true});
	} catch {}
};
process.on('exit', cleanup);
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
const composition = await selectComposition({serveUrl, id: compId, puppeteerInstance: browser});
const files = [];
let next = 0;
async function worker() {
	while (next < frames.length) {
		const f = frames[next++];
		if (f >= composition.durationInFrames) continue;
		const output = path.join(outDir, `${compId}-${String(f).padStart(5, '0')}.png`);
		await renderStill({composition, serveUrl, output, frame: f, puppeteerInstance: browser, scale, imageFormat: 'png', overwrite: true});
		files.push({f, output});
		process.stdout.write(`frame ${f} -> ${output}\n`);
	}
}
await Promise.all(Array.from({length: Math.min(PAR, frames.length)}, worker));
await browser.close({silent: true});
files.sort((a, b) => a.f - b.f);

if (sheet && files.length > 1) {
	const cols = files.length <= 4 ? files.length : files.length <= 9 ? 3 : 4;
	const sheetPath = path.join(outDir, `${compId}-sheet-${frames[0]}-${frames[frames.length - 1]}.png`);
	execFileSync('python', ['scripts/sheet.py', sheetPath, String(cols), ...files.map((x) => x.output)], {stdio: 'inherit'});
}
console.log(`done ${files.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
