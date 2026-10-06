/**
 * F4 for M4: the Lab floor slab with an optional trapdoor — the 种子地图
 * 「› 进入」 button (80 × 32, r 10) becomes a flap hinged on its north edge;
 * the hole is cut through the face AND every side layer (clip-path, evenodd,
 * on flat leaves only), with a short dark-graded shaft under it so it reads as a hole.
 * A variant of src/film/Floor.tsx (read-only core), kept in this module.
 */
import React, {CSSProperties} from 'react';
import {mixColor, Obj} from '../../stage/Stage';
import {FLOOR_D} from '../../film/Floor';
import {WIN} from '../../film/timeline';
import {FONT} from '../../theme/tokens';
import {EnterButton, LAB} from '../../ui/pages/LabPage';

export const HOLE = LAB.enter(LAB.seedMap); // x 1319–1399, y 625–657
const R = 10;
/** Depth of the shaft drawn under the trapdoor (film: reads as a hole, not a window). */
const SHAFT = 36;

const holeClip = () => {
	const {x, y, w, h} = HOLE;
	const d =
		`M0 0H${WIN.w}V${WIN.h}H0Z ` +
		`M${x + R} ${y}H${x + w - R}A${R} ${R} 0 0 1 ${x + w} ${y + R}V${y + h - R}A${R} ${R} 0 0 1 ${x + w - R} ${y + h}` +
		`H${x + R}A${R} ${R} 0 0 1 ${x} ${y + h - R}V${y + R}A${R} ${R} 0 0 1 ${x + R} ${y}Z`;
	return `path(evenodd, '${d}')`;
};

const SIDE = '#cdc8d1';
const SIDE_TOP = '#e2dee6';

export const LabFloor: React.FC<{z: number; open: boolean; shaft?: number; opacity?: number; flat?: boolean; children?: React.ReactNode}> = ({z, open, shaft = 1, opacity = 1, flat, children}) => {
	const clip: CSSProperties = open ? {clipPath: holeClip()} : {};
	const n = 4;
	const layers: React.ReactNode[] = [];
	if (!flat) {
		for (let i = 0; i < n; i++) {
			const t = i / (n - 1);
			layers.push(
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -WIN.w / 2,
						top: -WIN.h / 2,
						width: WIN.w,
						height: WIN.h,
						borderRadius: 18,
						background: mixColor(SIDE, SIDE_TOP, t),
						transform: `translateZ(${FLOOR_D * t * 0.985}px)`,
						opacity: opacity < 1 ? opacity : undefined,
						...clip,
					}}
				/>,
			);
		}
	}
	// the hole's shaft: four walls running from the face down SHAFT px, light at the lip → dark below
	const hx = HOLE.x - WIN.cx;
	const hy = HOLE.y - WIN.cy;
	const grad = (dir: string) => `linear-gradient(${dir}, #c9c4ce 0%, #8f8798 30%, #3d3446 100%)`;
	const wo = shaft * opacity;
	const walls = open && wo > 0 ? (
		<>
			<div style={{position: 'absolute', left: hx, top: hy, width: HOLE.w, height: SHAFT, background: grad('to bottom'), opacity: wo, transformOrigin: 'center top', transform: `translateZ(${FLOOR_D}px) rotateX(-90deg)`}} />
			<div style={{position: 'absolute', left: hx, top: hy + HOLE.h, width: HOLE.w, height: SHAFT, background: grad('to bottom'), opacity: wo, transformOrigin: 'center top', transform: `translateZ(${FLOOR_D}px) rotateX(-90deg)`}} />
			<div style={{position: 'absolute', left: hx, top: hy, width: SHAFT, height: HOLE.h, background: grad('to right'), opacity: wo, transformOrigin: 'left center', transform: `translateZ(${FLOOR_D}px) rotateY(90deg)`}} />
			<div style={{position: 'absolute', left: hx + HOLE.w, top: hy, width: SHAFT, height: HOLE.h, background: grad('to right'), opacity: wo, transformOrigin: 'left center', transform: `translateZ(${FLOOR_D}px) rotateY(90deg)`}} />
		</>
	) : null;
	return (
		<Obj z={z - FLOOR_D}>
			{layers}
			{walls}
			<div
				style={{
					position: 'absolute',
					left: -WIN.w / 2,
					top: -WIN.h / 2,
					width: WIN.w,
					height: WIN.h,
					borderRadius: 18,
					background: '#f8f8f8',
					transform: `translateZ(${FLOOR_D}px)`,
					overflow: 'hidden',
					opacity: opacity < 1 ? opacity : undefined,
					...clip,
				}}
			>
				<div style={{position: 'absolute', inset: 0, fontFamily: FONT.ui}}>{children}</div>
			</div>
		</Obj>
	);
};

/** The 「› 进入」 flap, hinged on the hole's north edge; `angle` 0 = closed, 90 = hanging straight down. */
export const EnterFlap: React.FC<{floorZ: number; angle: number; opacity?: number}> = ({floorZ, angle, opacity = 1}) => (
	<Obj x={HOLE.x + HOLE.w / 2 - WIN.cx} y={HOLE.y - WIN.cy} z={floorZ + 0.4} rx={-angle}>
		<div style={{position: 'absolute', left: -HOLE.w / 2, top: 0, width: HOLE.w, height: HOLE.h, fontFamily: FONT.ui, opacity: opacity < 1 ? opacity : undefined}}>
			<EnterButton press={angle > 1 ? 0 : 1} />
		</div>
	</Obj>
);
