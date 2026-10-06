/**
 * F5 as a floor slab that can be pierced: a variant of film/Floor whose top
 * face and side layers share an even-odd clip-path, so the socket-shaped hole
 * the hero sinks through is see-through all the way down. The hole gets real
 * shaded walls and occlusion under its lip (HoleWalls); M5 lights F6 below it
 * with press2.ts SHAFT_GLOW, so it reads as a shaft, not a grey pill.
 */
import React from 'react';
import {Obj, mixColor} from '../../stage/Stage';
import {FLOOR_D} from '../../film/Floor';
import {FONT} from '../../theme/tokens';

export type Hole = {cx: number; cy: number; w: number; h: number; r: number};

export const holePath = (h: Hole) => {
	const x0 = h.cx - h.w / 2;
	const x1 = h.cx + h.w / 2;
	const y0 = h.cy - h.h / 2;
	const y1 = h.cy + h.h / 2;
	const r = Math.min(h.r, h.w / 2, h.h / 2);
	return (
		`M0 0 H1440 V810 H0 Z ` +
		`M${x0 + r} ${y0} H${x1 - r} A${r} ${r} 0 0 1 ${x1} ${y0 + r} V${y1 - r} A${r} ${r} 0 0 1 ${x1 - r} ${y1} ` +
		`H${x0 + r} A${r} ${r} 0 0 1 ${x0} ${y1 - r} V${y0 + r} A${r} ${r} 0 0 1 ${x0 + r} ${y0} Z`
	);
};

/** Perimeter of the hole (window coords), clockwise on screen, corners as short chords. */
function holePerimeter(h: Hole, seg = 6): Array<[number, number]> {
	const x0 = h.cx - h.w / 2;
	const x1 = h.cx + h.w / 2;
	const y0 = h.cy - h.h / 2;
	const y1 = h.cy + h.h / 2;
	const r = Math.min(h.r, h.w / 2, h.h / 2);
	const pts: Array<[number, number]> = [];
	const arc = (cx: number, cy: number, a0: number) => {
		for (let i = 0; i <= seg; i++) {
			const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
			pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
		}
	};
	arc(x1 - r, y0 + r, -90);
	arc(x1 - r, y1 - r, 0);
	arc(x0 + r, y1 - r, 90);
	arc(x0 + r, y0 + r, 180);
	return pts;
}

const rgb = (hex: string, k: number) => {
	const n = [1, 3, 5].map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k)));
	return `rgb(${n[0]}, ${n[1]}, ${n[2]})`;
};

/**
 * The hole's inner walls (the 6 px slab cut through, as in Sh03's socket): vertical quads around
 * the outline with a 1 px catch-light at the lip, shaded by which way they face (the light comes
 * from the north-west, so the north wall — the top inner edge on screen — is the darkest), plus
 * soft occlusion just under the lip that darkens the view down the shaft toward its rim.
 * Local z: 0 = slab bottom, FLOOR_D = map surface.
 */
const HoleWalls: React.FC<{hole: Hole}> = ({hole}) => {
	const out: React.ReactNode[] = [];
	const pts = holePerimeter(hole);
	const n = pts.length;
	for (let i = 0; i < n; i++) {
		const [ax, ay] = pts[i];
		const [bx, by] = pts[(i + 1) % n];
		const len = Math.hypot(bx - ax, by - ay);
		if (len < 0.01) continue;
		const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
		// inward normal; walls turned toward the light (north-west) read brighter
		const nx = -(by - ay) / len;
		const ny = (bx - ax) / len;
		const lit = 0.5 + 0.5 * (nx * -0.35 + ny * -0.94);
		const k = 0.66 + 0.5 * lit;
		out.push(
			<div
				key={i}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: len + 0.6,
					// 1 px past the slab bottom so the occlusion plane's rim tucks behind the walls
					height: FLOOR_D + 1,
					transformOrigin: '0 0',
					transform: `translate3d(${ax - 720}px, ${ay - 405}px, ${FLOOR_D}px) rotateZ(${ang}deg) rotateX(-90deg)`,
					background: `linear-gradient(to bottom, ${rgb('#d8d0de', k)} 0%, ${rgb('#d8d0de', k)} 12%, ${rgb('#7a7085', k)} 18%, ${rgb('#4a4254', k)} 55%, ${rgb('#241f2b', k)} 100%)`,
				}}
			/>,
		);
	}
	const r = Math.min(hole.r, hole.w / 2, hole.h / 2);
	out.push(
		<div
			key="ao"
			style={{
				position: 'absolute',
				left: hole.cx - hole.w / 2 - 720,
				top: hole.cy - hole.h / 2 - 405,
				width: hole.w,
				height: hole.h,
				borderRadius: r,
				boxShadow: 'inset 0 0 14px 4px rgba(16, 10, 24, 0.55), inset 0 0 3px 1px rgba(16, 10, 24, 0.45)',
				transform: 'translateZ(-0.5px)',
			}}
		/>,
	);
	return <>{out}</>;
};

/** The dark of the gap under the floor, seen through the hole past the lower floor's edges. */
export type Under = {depth: number; color: string; opacity: number};

export const SeedFloor: React.FC<{z: number; hole?: Hole | null; under?: Under | null; children?: React.ReactNode}> = ({z, hole, under, children}) => {
	const clip = hole ? `path(evenodd, "${holePath(hole)}")` : undefined;
	// inside a hole the walls are in their own shadow
	const side = hole ? '#3b3542' : '#cdc8d1';
	const sideTop = hole ? '#5d5666' : '#e2dee6';
	const n = 4;
	const layers: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const t = i / (n - 1);
		layers.push(
			<div
				key={i}
				style={{
					position: 'absolute',
					left: -720,
					top: -405,
					width: 1440,
					height: 810,
					borderRadius: 18,
					background: mixColor(side, sideTop, t),
					transform: `translateZ(${FLOOR_D * t * 0.985}px)`,
					clipPath: clip,
				}}
			/>,
		);
	}
	return (
		<Obj z={z - FLOOR_D}>
			{layers}
			{hole ? <HoleWalls hole={hole} /> : null}
			{hole && under && under.opacity > 0.001 ? (
				<div
					style={{
						position: 'absolute',
						left: -2000,
						top: -1200,
						width: 4000,
						height: 2400,
						background: under.color,
						opacity: under.opacity,
						transform: `translateZ(${FLOOR_D - under.depth}px)`,
					}}
				/>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: -720,
					top: -405,
					width: 1440,
					height: 810,
					borderRadius: 18,
					overflow: 'hidden',
					background: '#f8f8f8',
					transform: `translateZ(${FLOOR_D}px)`,
					clipPath: clip,
					fontFamily: FONT.ui,
				}}
			>
				{children}
			</div>
		</Obj>
	);
};
