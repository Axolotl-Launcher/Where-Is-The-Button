/**
 * Cursor overlay for M6/M7 (copy of film/CursorOverlay) adding the one shape
 * the 3D viewport really shows: the CROSSHAIR (LabSchematicPreview's canvas
 * is `cursor-crosshair` in 单选/框选/测量). Same macOS idiom as the other
 * shapes: black strokes with a white keyline, hotspot at the centre.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam} from '../../stage/Stage';
import {CursorKind, CursorShadowShape, CursorSprite} from '../../characters/Cursor';
import {project} from '../../film/camera';
import {REAL} from '../../film/timeline';

export type WsKind = CursorKind | 'crosshair';

export type WsCursorState = {
	x: number;
	y: number;
	z: number;
	kind: WsKind;
	/** Cross-fade to a second kind (0..1). */
	next?: WsKind;
	mixT?: number;
	press?: number;
	rot?: number;
	opacity?: number;
};

const Crosshair: React.FC<{size: number; press: number; opacity: number}> = ({size, press, opacity}) => {
	const k = (size / 32) * (1 - 0.12 * press);
	const arm = 'M16 4.5 V27.5 M4.5 16 H27.5';
	return (
		<svg
			width={32 * k}
			height={32 * k}
			viewBox="0 0 32 32"
			style={{position: 'absolute', left: -16 * k, top: -16 * k, overflow: 'visible', opacity, filter: 'drop-shadow(0 2px 2.5px rgba(0,0,0,0.28))'}}
		>
			<path d={arm} stroke="#ffffff" strokeWidth={4.2} strokeLinecap="square" fill="none" />
			<path d={arm} stroke="#0b0b0f" strokeWidth={1.7} strokeLinecap="butt" fill="none" />
		</svg>
	);
};

const Sprite: React.FC<{kind: WsKind; size: number; press: number; rot: number; opacity: number}> = ({kind, size, press, rot, opacity}) =>
	kind === 'crosshair' ? (
		<Crosshair size={size} press={press} opacity={opacity} />
	) : (
		<CursorSprite kind={kind} size={size} press={press} rot={rot} opacity={opacity} shadow />
	);

/** Screen position + size of a world cursor (the same depth scaling as the overlay); null behind the eye. */
export function cursorScreen(cam: Cam, cursor: {x: number; y: number; z: number}, o: {size?: number; depthScale?: number; minScale?: number; maxScale?: number} = {}) {
	const {size = 44, depthScale = 0, minScale = 0.55, maxScale = 1.6} = o;
	const p = project(cam, cursor);
	if (p.depth <= 20) return null;
	const rel = p.scale / REAL.scale;
	const k = Math.max(minScale, Math.min(maxScale, 1 + (rel - 1) * depthScale));
	return {x: p.x, y: p.y, size: size * k};
}

/** A cursor drawn directly in screen space (screen-space glass panels, or a blend toward one). */
export const ScreenCursor: React.FC<{x: number; y: number; size: number; cursor: Omit<WsCursorState, 'x' | 'y' | 'z'>}> = ({x, y, size, cursor}) => {
	const press = cursor.press ?? 0;
	const rot = cursor.rot ?? 0;
	const op = cursor.opacity ?? 1;
	const mix = cursor.next && cursor.mixT ? Math.max(0, Math.min(1, cursor.mixT)) : 0;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: x, top: y}}>
				{mix < 1 ? <Sprite kind={cursor.kind} size={size} press={press} rot={rot} opacity={op * (1 - mix)} /> : null}
				{mix > 0 && cursor.next ? <Sprite kind={cursor.next} size={size} press={press} rot={rot} opacity={op * mix} /> : null}
			</div>
		</AbsoluteFill>
	);
};

export const WsCursorOverlay: React.FC<{
	cam: Cam;
	cursor: WsCursorState;
	size?: number;
	depthScale?: number;
	minScale?: number;
	maxScale?: number;
}> = ({cam, cursor, size = 44, depthScale = 0, minScale = 0.55, maxScale = 1.6}) => {
	const s = cursorScreen(cam, cursor, {size, depthScale, minScale, maxScale});
	return s ? <ScreenCursor x={s.x} y={s.y} size={s.size} cursor={cursor} /> : null;
};

/** Soft cursor shadow on a floor (inside the Stage). Crosshair shadows are drawn as a blurred plus. */
export const WsCursorShadow: React.FC<{cursor: WsCursorState; floorZ: number; size?: number; strength?: number}> = ({cursor, floorZ, size = 44, strength = 1}) => {
	const h = Math.max(0, cursor.z - floorZ);
	const blur = 2 + h * 0.06;
	const op = ((0.28 * strength) / (1 + h * 0.008)) * (cursor.opacity ?? 1);
	if (op <= 0.003) return null;
	const kind = cursor.mixT && cursor.mixT > 0.5 && cursor.next ? cursor.next : cursor.kind;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, transform: `translate3d(${cursor.x + 0.12 * h}px, ${cursor.y + 0.32 * h}px, ${floorZ + 0.6}px)`}}>
			{kind === 'crosshair' ? (
				<svg width={size} height={size} viewBox="0 0 32 32" style={{position: 'absolute', left: -size / 2, top: -size / 2, overflow: 'visible', opacity: op, filter: `blur(${blur}px)`}}>
					<path d="M16 4.5 V27.5 M4.5 16 H27.5" stroke="#000" strokeWidth={3} fill="none" />
				</svg>
			) : (
				<CursorShadowShape kind={kind} size={size} blur={blur} opacity={op} />
			)}
		</div>
	);
};
