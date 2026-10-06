/**
 * The hero's UI form as a 3D slab (copy of characters/LaunchButton `Hero`)
 * with two extras the workshop needs: leaf-level opacity (fading a
 * preserve-3d group would flatten it) and a left-edge clip, so the 投影工坊
 * can "consume" it column by column while the voxel is meshed.
 */
import React from 'react';
import {ButtonFace, FaceProps, HERO_H, HERO_R, HERO_W} from '../../characters/LaunchButton';
import {FloorShadow, mixColor, Obj} from '../../stage/Stage';
import {C} from '../../theme/tokens';

export type SmoothHeroProps = FaceProps & {
	/** World position of the face centre; z = underside height. */
	x: number;
	y: number;
	z: number;
	floorZ?: number;
	d?: number;
	rx?: number;
	ry?: number;
	rz?: number;
	sx?: number;
	sy?: number;
	sz?: number;
	/** Fraction of the width removed from the left (0..1). */
	clipL?: number;
	/** Leaf opacity of the whole slab (0..1). */
	alpha?: number;
	shadow?: boolean;
	shadowStrength?: number;
};

export const SmoothHero: React.FC<SmoothHeroProps> = ({
	x,
	y,
	z,
	floorZ = 0,
	d = 8,
	rx = 0,
	ry = 0,
	rz = 0,
	sx = 1,
	sy = 1,
	sz = 1,
	clipL = 0,
	alpha = 1,
	shadow = true,
	shadowStrength = 1,
	w = HERO_W,
	h = HERO_H,
	r = HERO_R,
	...face
}) => {
	if (alpha <= 0 || clipL >= 1) return null;
	const n = 5;
	const clip = clipL > 0 ? `inset(0 0 0 ${clipL * 100}% round ${r}px)` : undefined;
	const layers: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const t = i / (n - 1);
		layers.push(
			<div
				key={i}
				style={{
					position: 'absolute',
					left: -w / 2,
					top: -h / 2,
					width: w,
					height: h,
					borderRadius: r,
					background: mixColor(C.sidePink, '#d0256f', t),
					transform: `translateZ(${d * t * 0.985}px)`,
					clipPath: clip,
					opacity: alpha,
				}}
			/>,
		);
	}
	const visibleW = w * (1 - clipL);
	return (
		<>
			{shadow ? (
				<FloorShadow
					x={x + (w * clipL * sx) / 2}
					y={y}
					floorZ={floorZ}
					w={visibleW * sx}
					h={h * sy}
					r={r}
					height={Math.max(0, z - floorZ)}
					strength={shadowStrength * alpha}
					rz={rz}
				/>
			) : null}
			<Obj x={x} y={y} z={z} rx={rx} ry={ry} rz={rz} sx={sx} sy={sy} sz={sz}>
				{layers}
				<div style={{position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transform: `translateZ(${d}px)`, clipPath: clip, opacity: alpha}}>
					<ButtonFace w={w} h={h} r={r} cssShadow={false} {...face} />
				</div>
			</Obj>
		</>
	);
};
