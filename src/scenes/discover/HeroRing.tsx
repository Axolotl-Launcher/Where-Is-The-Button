/**
 * The hero's Ring form, flat on the search field (Sh08 14.40 → Sh11 22.25):
 *  - morph: the flattened body stretches along the field and hollows into a
 *    4 px band (CSS border), its ▷ sliding into the SearchIcon slot;
 *  - ring: the field's focus ring look — 4 px at rgba(219,39,119,.68) — drawn
 *    as one SVG loop that starts and ends at the ▷, so the 22.10 snap-back
 *    can retract both strands into it like a rubber band; 21.60 the flinch
 *    clenches it (inset, width, #c5236b at .95) and the ▷ recoils.
 */
import React from 'react';
import {PlayGlyph} from '../../characters/LaunchButton';
import {mixColor} from '../../stage/Stage';
import {C} from '../../theme/tokens';
import {FIELD} from '../../ui/pages/discover/layout';
import {GLYPH_SLOT, MorphShape, RingState} from './hero';

/** Plane origin (window coords) — the plane covers the field and its ring. */
export const RING_PLANE = {x: 56, y: 100, w: 760, h: 92};

export const MorphFace: React.FC<{m: MorphShape}> = ({m}) => {
	const ox = RING_PLANE.x;
	const oy = RING_PLANE.y;
	const col = `rgba(219, 39, 119, ${m.alpha})`;
	const gcol = mixColor('#ffffff', C.brand, m.glyph.pink);
	// solid stage: a filled box (its 1 px top rim sits on the real top edge); hollow stage: a border band.
	// (An all-border box has a zero-height padding box, so an inset rim would draw through its middle.)
	const solid = m.b >= m.h / 2 - 0.25;
	const shadows: string[] = [];
	if (m.rim > 0) {
		if (solid) shadows.push(`inset 0 1px 0 rgba(255,255,255,${0.3 * m.rim})`);
		shadows.push(`0 0 0 1px rgba(219,39,119,${0.3 * m.rim})`);
	}
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: m.x - ox,
					top: m.y - oy,
					width: m.w,
					height: m.h,
					boxSizing: 'border-box',
					borderRadius: m.r,
					background: solid ? col : undefined,
					border: solid ? undefined : `${m.b}px solid ${col}`,
					boxShadow: shadows.length ? shadows.join(', ') : undefined,
				}}
			/>
			{m.label > 0.01 ? (
				<div
					style={{
						position: 'absolute',
						left: m.glyph.x + 16 - ox,
						top: m.y + m.h / 2 - 10 - oy,
						fontSize: 16,
						fontWeight: 800,
						lineHeight: '20px',
						color: '#fff',
						opacity: m.label,
						whiteSpace: 'nowrap',
						transform: `scaleX(${1 + (1 - m.label) * 0.6})`,
						transformOrigin: '0 50%',
					}}
				>
					开始游戏
				</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: m.glyph.x - m.glyph.size / 2 - ox,
					top: m.glyph.y - m.glyph.size / 2 - oy,
					transform: `scale(${m.glyph.scale})`,
				}}
			>
				<PlayGlyph size={m.glyph.size} color={gcol} />
			</div>
		</>
	);
};

/** Ring loop path (centre line 2 px outside the field, pulled in by `inset`), starting/ending at its left middle. */
function loopPath(inset = 0) {
	const x = FIELD.x - 2 + inset;
	const y = FIELD.y - 2 + inset;
	const w = FIELD.w + 4 - 2 * inset;
	const h = FIELD.h + 4 - 2 * inset;
	const r = Math.max(6, 14 - inset);
	const my = y + h / 2;
	const d = [
		`M ${x} ${my}`,
		`L ${x} ${y + r}`,
		`A ${r} ${r} 0 0 1 ${x + r} ${y}`,
		`L ${x + w - r} ${y}`,
		`A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
		`L ${x + w} ${y + h - r}`,
		`A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
		`L ${x + r} ${y + h}`,
		`A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
		`L ${x} ${my}`,
	].join(' ');
	const len = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
	return {d, len};
}

export const RingFace: React.FC<{r: RingState}> = ({r}) => {
	const ox = RING_PLANE.x;
	const oy = RING_PLANE.y;
	const base = mixColor(C.brand, C.brandHover, r.dark);
	const rgb = base.replace('rgb(', '').replace(')', '');
	const loop = loopPath(r.inset);
	const L = loop.len;
	const a = (L / 2) * r.visible;
	const stroke = `rgba(${rgb}, ${r.alpha})`;
	return (
		<>
			{r.visible > 0.002 ? (
				<svg
					width={RING_PLANE.w}
					height={RING_PLANE.h}
					viewBox={`${ox} ${oy} ${RING_PLANE.w} ${RING_PLANE.h}`}
					style={{position: 'absolute', left: r.dx, top: r.dy, overflow: 'visible'}}
				>
					{r.visible >= 0.999 ? (
						<path d={loop.d + ' Z'} fill="none" stroke={stroke} strokeWidth={r.width} />
					) : (
						<path
							d={loop.d}
							fill="none"
							stroke={stroke}
							strokeWidth={r.width}
							strokeLinecap="round"
							strokeDasharray={`${a} ${Math.max(0, L - 2 * a)} ${a} 0`}
						/>
					)}
				</svg>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: GLYPH_SLOT.x - 10 - ox + r.dx,
					top: GLYPH_SLOT.y - 10 - oy + r.dy,
					transform: `translateX(${r.glyphDx}px) scale(${r.glyphScale * r.glyphSx}, ${r.glyphScale * r.glyphSy})`,
				}}
			>
				<PlayGlyph size={20} color={base} />
			</div>
		</>
	);
};
