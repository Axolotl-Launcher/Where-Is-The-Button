/**
 * The hero as a 3D slab (variant of src/characters/LaunchButton.tsx `Hero`):
 * adds squash/stretch along an arbitrary direction in the floor plane
 * (R(θ)·S·R(−θ), so the face never rotates), a uniform pop scale and a
 * fade-free shadow strength. The face is the real ButtonFace.
 */
import React from 'react';
import {ButtonFace} from '../../characters/LaunchButton';
import {FloorShadow, Obj, Slab} from '../../stage/Stage';
import {C} from '../../theme/tokens';
import {toWorld} from '../../film/timeline';
import {HeroPose} from './hero';
import {Z2} from './beats';

export const HeroBody: React.FC<{pose: HeroPose; floorZ?: number}> = ({pose: o, floorZ = Z2}) => {
	const w = o.w;
	const h = o.hh;
	const p = toWorld(o.x, o.y, floorZ + o.h);
	const k = o.stretch.k;
	const sxEff = o.sx * o.s * (Math.abs(Math.cos((o.stretch.angle * Math.PI) / 180)) * (k - 1) + 1);
	const syEff = o.sy * o.s * (Math.abs(Math.sin((o.stretch.angle * Math.PI) / 180)) * (k - 1) + 1);
	const d = Math.max(0.5, o.d * o.sz);
	return (
		<>
			{o.shadow > 0 ? (
				<FloorShadow
					x={p.x}
					y={p.y}
					floorZ={floorZ + o.ground}
					w={w * sxEff}
					h={h * syEff}
					r={o.r}
					height={Math.max(0, o.h - o.ground)}
					strength={0.85 * o.shadow}
				/>
			) : null}
			<Obj x={p.x} y={p.y} z={p.z} rz={o.stretch.angle} sx={k} sy={1 / Math.sqrt(k)}>
				<Obj rz={-o.stretch.angle + o.rz} ry={o.ry} rx={o.rx} sx={o.sx * o.s} sy={o.sy * o.s}>
					<Slab w={w} h={h} d={d} r={o.r} face="transparent" side={C.sidePink} sideTop="#d0256f" faceStyle={{overflow: 'visible'}} layers={Math.max(2, Math.min(5, Math.ceil(d / 1.6)))}>
						<ButtonFace w={w} h={h} r={o.r} cssShadow={false} hover={o.hover} press={o.press} label={o.label} glyphDx={o.glyphDx} />
					</Slab>
				</Obj>
			</Obj>
		</>
	);
};
