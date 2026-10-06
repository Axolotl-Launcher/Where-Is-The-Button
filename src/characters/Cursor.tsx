/**
 * The cursor — our pursuer. Drawn as crisp SVG in the macOS idiom the
 * product's screenshots use (black arrow / white hand, contrasting outline),
 * and changing shape with the UI it touches, exactly as a real pointer would:
 * arrow → pointing hand over buttons → I-beam over text fields → open/closed
 * hand while dragging the seed map → move cross in the 3D viewer.
 */
import React from 'react';

export type CursorKind = 'arrow' | 'pointer' | 'ibeam' | 'grab' | 'grabbing' | 'move';

/** Hotspot (in the 32×32 drawing) for each shape. */
export const HOTSPOT: Record<CursorKind, {x: number; y: number}> = {
	arrow: {x: 5, y: 3},
	pointer: {x: 11.5, y: 3.2},
	ibeam: {x: 13, y: 15},
	grab: {x: 15, y: 15},
	grabbing: {x: 15, y: 16},
	move: {x: 16, y: 16},
};

const INK = '#0b0b0f';
const PAPER = '#ffffff';

const Arrow = () => (
	<path
		d="M5 3 L5 25.6 L10.7 20.2 L14.5 28.7 L18.3 27.1 L14.6 18.7 L22.2 18.7 Z"
		fill={INK}
		stroke={PAPER}
		strokeWidth={1.9}
		strokeLinejoin="round"
	/>
);

const Pointer = () => (
	<g strokeLinejoin="round" strokeLinecap="round">
		<path
			d="M11.5 3.2 C12.9 3.2 13.8 4.1 13.8 5.5 L13.8 12.6 C14.1 11.9 14.8 11.5 15.6 11.5 C16.6 11.5 17.3 12.1 17.4 13 C17.8 12.5 18.4 12.2 19.1 12.2 C20.2 12.2 20.9 12.9 21 13.9 C21.4 13.5 21.9 13.3 22.5 13.3 C23.6 13.3 24.3 14.1 24.3 15.2 L24.3 21 C24.3 25.4 21.6 28.6 17.4 28.6 L14.8 28.6 C12.1 28.6 10.6 27.6 9.2 25.6 L5.4 19.9 C4.7 18.9 4.9 17.7 5.8 17.1 C6.7 16.5 7.9 16.7 8.6 17.6 L9.3 18.6 L9.3 5.5 C9.3 4.1 10.2 3.2 11.5 3.2 Z"
			fill={PAPER}
			stroke={INK}
			strokeWidth={1.5}
		/>
		<path d="M13.8 12.6 L13.8 17.4 M17.4 13 L17.4 17.6 M21 13.9 L21 17.8" stroke={INK} strokeWidth={1.2} fill="none" />
	</g>
);

const IBeam = () => (
	<g fill="none" strokeLinecap="round">
		<path d="M9.5 4.5 C11.5 4.5 13 5.2 13 6.6 C13 5.2 14.5 4.5 16.5 4.5 M13 6.6 L13 23.4 M9.5 25.5 C11.5 25.5 13 24.8 13 23.4 C13 24.8 14.5 25.5 16.5 25.5" stroke={PAPER} strokeWidth={4.2} />
		<path d="M9.5 4.5 C11.5 4.5 13 5.2 13 6.6 C13 5.2 14.5 4.5 16.5 4.5 M13 6.6 L13 23.4 M9.5 25.5 C11.5 25.5 13 24.8 13 23.4 C13 24.8 14.5 25.5 16.5 25.5" stroke={INK} strokeWidth={1.7} />
	</g>
);

/** Open hand: union outline trick — thick ink shapes first, paper fills on top. */
const handShapes = (closed: boolean) => {
	const fingers = closed
		? [
				{x: 9.6, y: 11.2, h: 6},
				{x: 12.9, y: 10.4, h: 6.6},
				{x: 16.2, y: 10.6, h: 6.4},
				{x: 19.5, y: 11.6, h: 5.6},
			]
		: [
				{x: 9.4, y: 6.6, h: 11},
				{x: 12.7, y: 4.4, h: 13},
				{x: 16, y: 5, h: 12.4},
				{x: 19.3, y: 7.6, h: 10},
			];
	const parts = (fill: string, stroke: string, sw: number) => (
		<g fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
			{fingers.map((f, i) => (
				<rect key={i} x={f.x} y={f.y} width={3.3} height={f.h} rx={1.65} />
			))}
			<rect x={8.6} y={13.2} width={15.4} height={14.6} rx={5.4} />
			{closed ? (
				<rect x={6.2} y={15.6} width={7.5} height={3.4} rx={1.7} transform="rotate(-8 10 17)" />
			) : (
				<rect x={4.2} y={13.6} width={3.4} height={9} rx={1.7} transform="rotate(-38 6 18)" />
			)}
		</g>
	);
	return (
		<>
			{parts(INK, INK, 3)}
			{parts(PAPER, 'none', 0)}
			<path
				d={closed ? 'M12.9 13.6 L12.9 15.6 M16.2 13.6 L16.2 15.6 M19.5 13.8 L19.5 15.6' : 'M12.7 12.4 L12.7 16.2 M16 12.4 L16 16.2 M19.3 12.6 L19.3 16.2'}
				stroke={INK}
				strokeWidth={1.1}
				strokeLinecap="round"
			/>
		</>
	);
};

const Move = () => (
	<g strokeLinejoin="round">
		<path
			d="M16 3 L20.5 8 L17.6 8 L17.6 14.4 L24 14.4 L24 11.5 L29 16 L24 20.5 L24 17.6 L17.6 17.6 L17.6 24 L20.5 24 L16 29 L11.5 24 L14.4 24 L14.4 17.6 L8 17.6 L8 20.5 L3 16 L8 11.5 L8 14.4 L14.4 14.4 L14.4 8 L11.5 8 Z"
			fill={INK}
			stroke={PAPER}
			strokeWidth={1.6}
		/>
	</g>
);

const SHAPES: Record<CursorKind, () => React.ReactElement> = {
	arrow: Arrow,
	pointer: Pointer,
	ibeam: IBeam,
	grab: () => <g>{handShapes(false)}</g>,
	grabbing: () => <g>{handShapes(true)}</g>,
	move: Move,
};

/**
 * 2D cursor drawing whose hotspot sits at (0,0) of its parent.
 * `size` = rendered px of the 32-unit drawing (real macOS ≈ 32 at 2×).
 */
export const CursorSprite: React.FC<{
	kind?: CursorKind;
	size?: number;
	/** 0..1 press amount (mouse-down squash). */
	press?: number;
	rot?: number;
	opacity?: number;
	/** Cross-fade to a second kind (0 = kind, 1 = next). */
	next?: CursorKind;
	mixT?: number;
	shadow?: boolean;
}> = ({kind = 'arrow', size = 44, press = 0, rot = 0, opacity = 1, next, mixT = 0, shadow = false}) => {
	const scale = size / 32;
	const pressS = 1 - 0.12 * press;
	const draw = (k: CursorKind, o: number) => {
		const hs = HOTSPOT[k];
		const Shape = SHAPES[k];
		return (
			<svg
				width={32 * scale}
				height={32 * scale}
				viewBox="0 0 32 32"
				style={{
					position: 'absolute',
					left: -hs.x * scale,
					top: -hs.y * scale,
					opacity: o,
					overflow: 'visible',
					filter: shadow ? 'drop-shadow(0 2px 2.5px rgba(0,0,0,0.28))' : undefined,
					transformOrigin: `${hs.x * scale}px ${hs.y * scale}px`,
				}}
			>
				<Shape />
			</svg>
		);
	};
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transform: `rotate(${rot}deg) scale(${pressS})`,
				transformOrigin: '0 0',
				opacity,
			}}
		>
			{next && mixT > 0 ? (
				<>
					{draw(kind, 1 - mixT)}
					{draw(next, mixT)}
				</>
			) : (
				draw(kind, 1)
			)}
		</div>
	);
};

/** Flat silhouette used for the cursor's shadow on the floor. */
export const CursorShadowShape: React.FC<{kind?: CursorKind; size?: number; blur: number; opacity: number}> = ({
	kind = 'arrow',
	size = 44,
	blur,
	opacity,
}) => {
	const scale = size / 32;
	const hs = HOTSPOT[kind];
	const Shape = SHAPES[kind];
	return (
		<svg
			width={32 * scale}
			height={32 * scale}
			viewBox="0 0 32 32"
			style={{position: 'absolute', left: -hs.x * scale, top: -hs.y * scale, overflow: 'visible', opacity, filter: `blur(${blur}px) brightness(0)`}}
		>
			<Shape />
		</svg>
	);
};
