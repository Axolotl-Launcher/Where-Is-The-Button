/**
 * The cursor lives in world space but is drawn as a crisp screen-space
 * overlay at its projected position (always on top, exact hotspot). In
 * diorama shots it may scale gently with depth; its shadow is a separate
 * world-space element (`CursorShadow`) placed inside the Stage.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam} from '../stage/Stage';
import {CursorKind, CursorShadowShape, CursorSprite} from '../characters/Cursor';
import {project} from './camera';
import {REAL} from './timeline';

export type CursorState = {
	/** World position of the hotspot. */
	x: number;
	y: number;
	z: number;
	kind?: CursorKind;
	next?: CursorKind;
	mixT?: number;
	press?: number;
	rot?: number;
	opacity?: number;
};

export const CursorOverlay: React.FC<{
	cam: Cam;
	cursor: CursorState;
	/** Base on-screen size in px (44 in real-app shots). */
	size?: number;
	/** 0 = constant size; 1 = full perspective scaling relative to real-app scale. */
	depthScale?: number;
	minScale?: number;
	maxScale?: number;
}> = ({cam, cursor, size = 44, depthScale = 0, minScale = 0.6, maxScale = 1.6}) => {
	const p = project(cam, cursor);
	if (p.depth <= 20) return null; // behind/at the eye
	const rel = p.scale / REAL.scale;
	const k = Math.max(minScale, Math.min(maxScale, 1 + (rel - 1) * depthScale));
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: p.x, top: p.y}}>
				<CursorSprite
					kind={cursor.kind}
					next={cursor.next}
					mixT={cursor.mixT}
					size={size * k}
					press={cursor.press}
					rot={cursor.rot}
					opacity={cursor.opacity}
					shadow
				/>
			</div>
		</AbsoluteFill>
	);
};

/** Soft cursor-shaped shadow on a floor below the cursor (inside the Stage). */
export const CursorShadow: React.FC<{cursor: CursorState; floorZ: number; size?: number; strength?: number}> = ({cursor, floorZ, size = 44, strength = 1}) => {
	const h = Math.max(0, cursor.z - floorZ);
	const blur = 2 + h * 0.06;
	const op = (0.28 * strength) / (1 + h * 0.008);
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transform: `translate3d(${cursor.x + 0.12 * h}px, ${cursor.y + 0.32 * h}px, ${floorZ + 0.6}px)`,
			}}
		>
			<CursorShadowShape kind={cursor.kind} size={size} blur={blur} opacity={op} />
		</div>
	);
};
