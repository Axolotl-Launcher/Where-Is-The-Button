/**
 * The Voxel form (concept §2.4, storyboard §2): 30 × 10 × 2 blocks of pink
 * concrete with a white-concrete pixel ▷ outline on the top layer, block =
 * 4.8 world px (footprint 144 × 48 × 9.6). Coplanar block faces are merged
 * into boxes (one box per run of landed columns) so the whole build costs a
 * dozen faces at rest; columns in flight and loose blocks are their own
 * boxes. Concrete is flat in Minecraft, so faces use the textures' average
 * colours with the viewer-style face shading.
 *
 * Also: the in-app selection look (outer faces brand @ .24, edges in screen
 * space like the viewer's depthTest-off lines) and the region bounds box.
 */
import React, {CSSProperties} from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam} from '../../stage/Stage';
import {project} from '../../film/camera';
import {B, HCOLS, HROWS, isGlyph, PINK_CONCRETE, SHADE, shade, WHITE_CONCRETE} from './common';

type V3 = {x: number; y: number; z: number};
export type FaceKey = 'top' | 's' | 'n' | 'e' | 'w';

/** CSS transform placing a w × h div (origin top-left) as one face of an axis-aligned box. */
function faceXf(k: FaceKey, x0: number, y0: number, x1: number, y1: number, zTop: number) {
	switch (k) {
		case 'top':
			return `translate3d(${x0}px, ${y0}px, ${zTop}px)`;
		case 's':
			return `translate3d(${x0}px, ${y1}px, ${zTop}px) rotateX(-90deg)`;
		case 'n':
			return `translate3d(${x1}px, ${y0}px, ${zTop}px) rotateZ(180deg) rotateX(-90deg)`;
		case 'e':
			return `translate3d(${x1}px, ${y1}px, ${zTop}px) rotateZ(-90deg) rotateX(-90deg)`;
		case 'w':
			return `translate3d(${x0}px, ${y0}px, ${zTop}px) rotateZ(90deg) rotateX(-90deg)`;
	}
}

const faceSize = (k: FaceKey, w: number, l: number, h: number) => (k === 'top' ? [w, l] : k === 's' || k === 'n' ? [w, h] : [l, h]);

const SH: Record<FaceKey, number> = {top: SHADE.top, s: SHADE.south, n: SHADE.north, e: SHADE.east, w: SHADE.west};

/** One merged box of blocks: columns [c0, c1) × rows [r0, r1), bottom at z (hero-local px). */
export const VBox: React.FC<{
	c0: number;
	c1: number;
	r0: number;
	r1: number;
	z: number;
	glyph?: boolean;
	opacity?: number;
	faces?: FaceKey[];
}> = ({c0, c1, r0, r1, z, glyph, opacity = 1, faces = ['top', 's', 'n', 'e', 'w']}) => {
	const x0 = c0 * B;
	const x1 = c1 * B;
	const y0 = r0 * B;
	const y1 = r1 * B;
	const zTop = z + B;
	return (
		<>
			{faces.map((k) => {
				const [w, h] = faceSize(k, x1 - x0, y1 - y0, B);
				const cells: React.ReactNode[] = [];
				if (glyph && k === 'top') {
					for (let c = c0; c < c1; c++)
						for (let r = r0; r < r1; r++)
							if (isGlyph(c, r))
								cells.push(
									<div key={`${c}-${r}`} style={{position: 'absolute', left: (c - c0) * B - 0.05, top: (r - r0) * B - 0.05, width: B + 0.1, height: B + 0.1, background: shade(WHITE_CONCRETE, SHADE.top)}} />,
								);
				}
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: w,
							height: h,
							transformOrigin: '0 0',
							transform: faceXf(k, x0, y0, x1, y1, zTop),
							background: shade(PINK_CONCRETE, SH[k]),
							backfaceVisibility: 'hidden',
							opacity,
						}}
					>
						{cells}
					</div>
				);
			})}
		</>
	);
};

/** Column state per layer: null = not built yet; dz = height above its rest place; missing = rows still in flight. */
export type ColState = {dz: number; missing?: number[]} | null;
export type LooseBlock = {c: number; r: number; l: 0 | 1; dz: number};

/** The voxel hero in hero-local coordinates (origin = NW-bottom corner). */
export const HeroVoxel: React.FC<{
	layer: [(c: number) => ColState, (c: number) => ColState];
	loose?: LooseBlock[];
	/** 层间距 lift of the top layer (px). */
	gap?: number;
	opacity?: number;
}> = ({layer, loose = [], gap = 0, opacity = 1}) => {
	const out: React.ReactNode[] = [];
	([0, 1] as const).forEach((l) => {
		const fn = layer[l];
		const z = l * B + (l ? gap : 0);
		let run = -1;
		const flush = (end: number) => {
			if (run >= 0) out.push(<VBox key={`run-${l}-${run}`} c0={run} c1={end} r0={0} r1={HROWS} z={z} glyph={l === 1} opacity={opacity} />);
			run = -1;
		};
		for (let c = 0; c < HCOLS; c++) {
			const st = fn(c);
			const full = !!st && Math.abs(st.dz) < 0.01 && !(st.missing && st.missing.length);
			if (full) {
				if (run < 0) run = c;
				continue;
			}
			flush(c);
			if (!st) continue;
			const miss = new Set(st.missing ?? []);
			let r0 = -1;
			for (let r = 0; r <= HROWS; r++) {
				const present = r < HROWS && !miss.has(r);
				if (present && r0 < 0) r0 = r;
				if (!present && r0 >= 0) {
					out.push(<VBox key={`col-${l}-${c}-${r0}`} c0={c} c1={c + 1} r0={r0} r1={r} z={z + st.dz} glyph={l === 1} opacity={opacity} />);
					r0 = -1;
				}
			}
		}
		flush(HCOLS);
	});
	loose.forEach((b, i) =>
		out.push(<VBox key={`loose-${i}`} c0={b.c} c1={b.c + 1} r0={b.r} r1={b.r + 1} z={b.l * B + (b.l ? gap : 0) + b.dz} glyph={b.l === 1} opacity={opacity} />),
	);
	return <>{out}</>;
};

/** The finished build (both layers landed). */
export const fullLayer = () => ({dz: 0});

/* ─────────────────────────────── selection ─────────────────────────────── */

/** The viewer's selection fill alpha (brand @ .24). */
export const SEL_ALPHA = 0.24;

/**
 * Selected outer faces: brand @ .24, double-sided, a hair outside the blocks (polygon offset).
 * `fill` overrides the alpha (the capture flash); `scan` (0..1) runs one hologram scanline west → east
 * across the top and south faces.
 */
export const SelectionFaces: React.FC<{
	box: {x0: number; y0: number; z0: number; x1: number; y1: number; z1: number};
	faces?: FaceKey[];
	opacity?: number;
	fill?: number;
	scan?: number | null;
}> = ({box, faces = ['top', 's', 'n', 'e', 'w'], opacity = 1, fill = SEL_ALPHA, scan = null}) => {
	if (opacity <= 0) return null;
	const o = 0.15;
	const {x0, y0, z0, x1, y1, z1} = box;
	const X0 = x0 - o;
	const Y0 = y0 - o;
	const X1 = x1 + o;
	const Y1 = y1 + o;
	const h = z1 - z0;
	const sweep =
		scan != null && scan > 0 && scan < 1
			? (() => {
					const p = -12 + 124 * scan; // band centre in % of the face width (enters and leaves fully)
					const a = Math.sin(Math.PI * scan) * 0.5 + 0.5;
					return `linear-gradient(90deg, rgba(255,214,236,0) ${p - 9}%, rgba(255,226,242,${(0.85 * a).toFixed(3)}) ${p - 1.2}%, rgba(255,255,255,${(0.95 * a).toFixed(3)}) ${p}%, rgba(255,226,242,${(0.85 * a).toFixed(3)}) ${p + 1.2}%, rgba(255,214,236,0) ${p + 9}%)`;
				})()
			: null;
	return (
		<>
			{faces.map((k) => {
				const zTop = k === 'top' ? z1 + o : z1;
				const [w, hh] = k === 'top' ? [X1 - X0, Y1 - Y0] : k === 's' || k === 'n' ? [X1 - X0, h] : [Y1 - Y0, h];
				const bg = `rgba(219, 39, 119, ${fill.toFixed(3)})`;
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: w,
							height: hh,
							transformOrigin: '0 0',
							transform: faceXf(k, X0, Y0, X1, Y1, zTop),
							background: sweep && (k === 'top' || k === 's') ? `${sweep}, ${bg}` : bg,
							opacity,
						}}
					/>
				);
			})}
		</>
	);
};

/** Region bounds (Box3Helper #58736a @ .52): thin lines that the blocks can occlude. */
export const RegionBounds: React.FC<{x0: number; y0: number; x1: number; y1: number; h: number; opacity?: number; w?: number}> = ({
	x0,
	y0,
	x1,
	y1,
	h,
	opacity = 1,
	w = 0.55,
}) => {
	if (opacity <= 0) return null;
	const col = `rgba(88, 115, 106, ${0.52 * opacity})`;
	const rect = (z: number, key: string) => (
		<div
			key={key}
			style={{
				position: 'absolute',
				left: x0 - w / 2,
				top: y0 - w / 2,
				width: x1 - x0 + w,
				height: y1 - y0 + w,
				boxSizing: 'border-box',
				border: `${w}px solid ${col}`,
				transform: `translateZ(${z}px)`,
			}}
		/>
	);
	const post = (x: number, y: number, key: string) =>
		[0, 90].map((a) => (
			<div
				key={`${key}-${a}`}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: w,
					height: h,
					background: col,
					transformOrigin: '0 0',
					transform: `translate3d(${x}px, ${y}px, ${h}px) rotateZ(${a + 45}deg) translateX(${-w / 2}px) rotateX(-90deg)`,
				}}
			/>
		));
	return (
		<>
			{rect(0.08, 'b')}
			{rect(h, 't')}
			{post(x0, y0, 'nw')}
			{post(x1, y0, 'ne')}
			{post(x0, y1, 'sw')}
			{post(x1, y1, 'se')}
		</>
	);
};

export type Seg = [V3, V3];

/** The 12 edges of an axis-aligned box (world coords). */
export function boxSegs(a: V3, b: V3): Seg[] {
	const P = (x: number, y: number, z: number) => ({x, y, z});
	const c = [P(a.x, a.y, a.z), P(b.x, a.y, a.z), P(b.x, b.y, a.z), P(a.x, b.y, a.z), P(a.x, a.y, b.z), P(b.x, a.y, b.z), P(b.x, b.y, b.z), P(a.x, b.y, b.z)];
	const idx = [
		[0, 1], [1, 2], [2, 3], [3, 0],
		[4, 5], [5, 6], [6, 7], [7, 4],
		[0, 4], [1, 5], [2, 6], [3, 7],
	];
	return idx.map(([i, j]) => [c[i], c[j]] as Seg);
}

/** Lines drawn over everything at their projected position (the viewer's depthTest-off edges). */
export const ScreenLines: React.FC<{cam: Cam; segs: Seg[]; color?: string; width?: number; opacity?: number; style?: CSSProperties}> = ({
	cam,
	segs,
	color = '#db2777',
	width = 1.6,
	opacity = 1,
	style,
}) => {
	if (opacity <= 0 || segs.length === 0) return null;
	const lines = segs
		.map(([a, b]) => [project(cam, a), project(cam, b)] as const)
		.filter(([p, q]) => p.depth > 1 && q.depth > 1);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', ...style}}>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity}}>
				{lines.map(([p, q], i) => (
					<line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
				))}
			</svg>
		</AbsoluteFill>
	);
};
