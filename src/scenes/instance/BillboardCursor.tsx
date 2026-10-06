/**
 * The cursor as a camera-facing sprite INSIDE the stage, used only for the
 * dive into the trapdoor (39.43–40.00): unlike the screen overlay it is
 * correctly hidden by the Lab floor while it is below it.
 * World size 33 px = 44 px on screen at real-app scale (1.333).
 */
import React from 'react';
import {Cam, Obj} from '../../stage/Stage';
import {CursorKind, CursorSprite} from '../../characters/Cursor';

export const BillboardCursor: React.FC<{cam: Cam; x: number; y: number; z: number; kind?: CursorKind; press?: number; rot?: number}> = ({
	cam,
	x,
	y,
	z,
	kind = 'pointer',
	press = 0,
	rot = 0,
}) => (
	<Obj x={x} y={y} z={z} rz={-cam.yaw} rx={-cam.pitch}>
		<CursorSprite kind={kind} size={33} press={press} rot={rot} shadow />
	</Obj>
);
