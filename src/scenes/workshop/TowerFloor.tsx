/**
 * Floor variant for the M6/M7 tower shots (copy of film/Floor + Slab):
 * - `hole` cuts a rounded-rect hole through every slab layer (Home's empty
 *   socket after the hero left it in Sh05);
 * - `alpha` fades the floor on its leaves (a preserve-3d fade would flatten it),
 *   used when F2–F6 fold under Home at the end of 层间距.
 */
import React from 'react';
import {mixColor, Obj} from '../../stage/Stage';
import {FLOOR_D} from '../../film/Floor';
import {WIN} from '../../film/timeline';
import {FONT} from '../../theme/tokens';

export type Hole = {x: number; y: number; w: number; h: number; r: number};

function holePath(o: Hole) {
	const {x, y, w, h, r} = o;
	return (
		`path(evenodd, "M0 0 H${WIN.w} V${WIN.h} H0 Z ` +
		`M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} ` +
		`H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z")`
	);
}

export const TowerFloor: React.FC<{
	z: number;
	children?: React.ReactNode;
	hole?: Hole | null;
	alpha?: number;
	fog?: number;
	fogColor?: string;
	flat?: boolean;
}> = ({z, children, hole, alpha = 1, fog = 0, fogColor = '#ddd8df', flat}) => {
	if (alpha <= 0) return null;
	const clip = hole ? holePath(hole) : undefined;
	const n = 4;
	const sides: React.ReactNode[] = [];
	if (!flat) {
		for (let i = 0; i < n; i++) {
			const t = i / (n - 1);
			sides.push(
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -WIN.w / 2,
						top: -WIN.h / 2,
						width: WIN.w,
						height: WIN.h,
						borderRadius: 18,
						background: mixColor('#cdc8d1', '#e2dee6', t),
						transform: `translateZ(${FLOOR_D * t * 0.985}px)`,
						clipPath: clip,
						opacity: alpha,
					}}
				/>,
			);
		}
	}
	return (
		<Obj z={z - FLOOR_D}>
			{sides}
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
					clipPath: clip,
					opacity: alpha,
				}}
			>
				<div style={{position: 'absolute', inset: 0, fontFamily: FONT.ui}}>{children}</div>
				{fog > 0 ? <div style={{position: 'absolute', inset: 0, background: fogColor, opacity: fog}} /> : null}
			</div>
		</Obj>
	);
};
