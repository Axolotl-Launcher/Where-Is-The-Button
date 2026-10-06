/**
 * A launcher page as a floor of the miniature building: a 1440 × 810 window
 * slab whose top face (z = surface) carries the flat page DOM. `faceStyle`
 * lets a scene cut holes (clip-path on the flat face) for the shaft.
 */
import React, {CSSProperties} from 'react';
import {Obj, Slab} from '../stage/Stage';
import {WIN} from './timeline';
import {FONT} from '../theme/tokens';

export const FLOOR_D = 6;

export const Floor: React.FC<{
	z: number;
	children?: React.ReactNode;
	faceStyle?: CSSProperties;
	/** Hide the slab sides (cheaper when only seen top-down). */
	flat?: boolean;
	/** Fog/dim amount 0..1 applied on the face (for distant floors in wides). */
	fog?: number;
	fogColor?: string;
	sideColor?: string;
}> = ({z, children, faceStyle, flat, fog = 0, fogColor = '#ddd8df', sideColor = '#cdc8d1'}) => (
	<Obj z={z - FLOOR_D}>
		<Slab
			w={WIN.w}
			h={WIN.h}
			d={FLOOR_D}
			r={18}
			face="#f8f8f8"
			side={sideColor}
			sideTop="#e2dee6"
			noSides={flat}
			faceStyle={faceStyle}
		>
			<div style={{position: 'absolute', inset: 0, fontFamily: FONT.ui}}>{children}</div>
			{fog > 0 ? <div style={{position: 'absolute', inset: 0, background: fogColor, opacity: fog}} /> : null}
		</Slab>
	</Obj>
);
