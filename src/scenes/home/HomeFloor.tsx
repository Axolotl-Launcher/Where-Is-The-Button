/**
 * F1 — the Minimal Home floor (panel collapsed), reusable by M1, M7 and M8.
 *
 *   <HomeWindow>  flat 1440 × 810 page DOM (title bar, rail, greeting, card,
 *                 layout switch) with the hero drawn in its real slot.
 *   <HomeFloor>   the same page as a floor of the building (inside a <Stage>):
 *                 optional socket = a 144 × 48 r16 hole cut through the card
 *                 and the floor (clip-path on the flat faces only) with thin
 *                 shaded walls, so whatever is below (F2…) shows through it.
 *                 Without `sides`, the clipped face gets an opaque, unclipped
 *                 backing (no mask pinholes); `radius` sets the slab corners
 *                 (0 for edge-to-edge real-app framings).
 *
 * Seated hero for 3D scenes: <Hero x={HOME_SEAT.x} y={HOME_SEAT.y} z={HOME_SEAT.zUnder} …/>
 * sits with its top face flush with the floor — identical to the flat slot.
 */
import React, {CSSProperties} from 'react';
import {ButtonFace, FaceProps} from '../../characters/LaunchButton';
import {FLOOR_Z, WIN} from '../../film/timeline';
import {Obj, mixColor} from '../../stage/Stage';
import {C, FONT, SHELL} from '../../theme/tokens';
import {Icon} from '../../ui/Icon';
import {AppWindow} from '../../ui/shell/AppWindow';
import {Greeting, MinimalCard, mhLayout} from '../../ui/pages/MinimalHome';
import {SOCKET, SOCKET_CLIP, SOCKET_DEPTH, socketClipIn} from './geometry';

const L = mhLayout(false);

/**
 * The floating layout switch of Minimal Home (Index.vue `.home-floating-controls`):
 * bottom-right of the viewport (16 / 16), 74 × 40 pill, 64 × 32 white track,
 * 28 px pink thumb on the 「极简主页」 side.
 */
export const LayoutSwitch: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: WIN.w - 16 - 74,
			top: WIN.h - 16 - 40,
			width: 74,
			height: 40,
			boxSizing: 'border-box',
			padding: 4,
			border: `1px solid ${C.divider}`,
			borderRadius: 9999,
			background: C.chrome,
			boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)',
			display: 'flex',
			alignItems: 'center',
		}}
	>
		<div style={{position: 'relative', width: 64, height: 32, flexShrink: 0, borderRadius: 9999, background: C.control}}>
			<div style={{position: 'absolute', top: 2, left: 2 + 32, width: 28, height: 28, borderRadius: 9999, background: C.brand}} />
			<div style={{position: 'absolute', left: 0, top: 2, width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="layout-template" size={16} color={C.textTertiary} />
			</div>
			<div style={{position: 'absolute', left: 32, top: 2, width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="minimize" size={16} color="#ffffff" />
			</div>
		</div>
	</div>
);

export type HomeWindowProps = {
	/** Flat hero in its real slot (null = empty slot, e.g. while the 3D hero is elsewhere). */
	hero?: FaceProps | null;
	/** Extra transform/style on the hero slot wrapper (e.g. a 2° lean). */
	heroWrapStyle?: CSSProperties;
	greeting?: string;
	layoutSwitch?: boolean;
	/** Extra DOM in window coordinates, drawn inside the content well. */
	children?: React.ReactNode;
};

/** Minimal Home, the whole 1440 × 810 window as flat DOM (no window frame). */
export const HomeWindow: React.FC<HomeWindowProps> = ({hero = {}, heroWrapStyle, greeting, layoutSwitch = true, children}) => (
	<AppWindow nav="home" panel={false} frame={false}>
		<Greeting L={L} text={greeting} />
		<MinimalCard
			L={L}
			heroSlot={
				hero ? (
					<div style={{position: 'relative', width: SOCKET.w, height: SOCKET.h, transformOrigin: '50% 50%', ...heroWrapStyle}}>
						<ButtonFace {...hero} />
					</div>
				) : null
			}
		/>
		{children}
		{layoutSwitch ? <LayoutSwitch /> : null}
	</AppWindow>
);

/** Perimeter of the socket (window coords), clockwise on screen, corners as short chords. */
function socketPerimeter(seg = 6): Array<[number, number]> {
	const {x, y, w, h, r} = SOCKET;
	const pts: Array<[number, number]> = [];
	const arc = (cx: number, cy: number, a0: number) => {
		for (let i = 0; i <= seg; i++) {
			const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
			pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
		}
	};
	arc(x + w - r, y + r, -90); // top-right
	arc(x + w - r, y + h - r, 0); // bottom-right
	arc(x + r, y + h - r, 90); // bottom-left
	arc(x + r, y + r, 180); // top-left
	return pts;
}
const PERIM = socketPerimeter();

/**
 * Thin walls of the socket: continuous vertical quads around its rounded
 * outline (card band #dfdfdf over the floor band #d4d4d4, darkening with
 * depth, a 1 px white lip), facing into the hole, plus soft occlusion below.
 */
export const SocketWalls: React.FC<{depth?: number}> = ({depth = SOCKET_DEPTH}) => {
	const out: React.ReactNode[] = [];
	const n = PERIM.length;
	for (let i = 0; i < n; i++) {
		const [ax, ay] = PERIM[i];
		const [bx, by] = PERIM[(i + 1) % n];
		const len = Math.hypot(bx - ax, by - ay);
		if (len < 0.01) continue;
		const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
		// inner faces turned toward the light (it comes from the north-west, shadows fall +x/+y) read brighter
		const nx = -(by - ay) / len;
		const ny = (bx - ax) / len;
		const lit = 0.5 + 0.5 * (nx * -0.35 + ny * -0.94);
		const k = 0.92 + 0.1 * lit;
		const c = (v: number) => Math.round(Math.min(255, v * k));
		const g = (v: number) => `rgb(${c(v)}, ${c(v)}, ${c(v + 3)})`;
		out.push(
			<div
				key={i}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: len + 0.6,
					height: depth,
					transformOrigin: '0 0',
					transform: `translate3d(${ax - WIN.cx}px, ${ay - WIN.cy}px, 0px) rotateZ(${ang}deg) rotateX(-90deg)`,
					background: `linear-gradient(to bottom, #ffffff 0, #ffffff ${(1 / depth) * 100}%, ${g(226)} ${(1.2 / depth) * 100}%, ${g(218)} 40%, ${g(210)} 41%, ${g(184)} 100%)`,
				}}
			/>,
		);
	}
	// Soft ambient occlusion just under the lip: darkens the view down the shaft toward its rim.
	out.push(
		<div
			key="ao"
			style={{
				position: 'absolute',
				left: SOCKET.x - WIN.cx,
				top: SOCKET.y - WIN.cy,
				width: SOCKET.w,
				height: SOCKET.h,
				borderRadius: SOCKET.r,
				boxShadow: 'inset 0 0 12px 3px rgba(22, 16, 30, 0.5), inset 0 0 3px 1px rgba(22, 16, 30, 0.35)',
				transform: `translateZ(${-depth - 0.4}px)`,
			}}
		/>,
	);
	return <>{out}</>;
};

/**
 * The floor under the socket is in F1's shadow: dark, with a soft patch of
 * light where the socket lets it in (use as a Floor `fogColor` at fog 0..1).
 */
export const SHAFT_LIGHT = (wx = SOCKET.cx, wy = SOCKET.cy) =>
	`radial-gradient(ellipse 230px 118px at ${wx}px ${wy}px, rgba(24,18,30,0.10) 0%, rgba(24,18,30,0.30) 42%, rgba(24,18,30,0.80) 100%)`;

type WinRect = {x0: number; y0: number; x1: number; y1: number};

export type HomeFloorProps = HomeWindowProps & {
	/** Floor surface z (default F1 = 0). */
	z?: number;
	/** Cut the socket hole (card + floor) and draw its walls. Pass hero={null} and draw the 3D hero instead. */
	socket?: boolean;
	/** Keep only this window rect of the face (dives: drop what is behind the eye). */
	crop?: WinRect | null;
	/** Draw the 6 px slab sides (tilted / wide shots). */
	sides?: boolean;
	/** Dim/fog overlay on the page face (0..1). */
	fog?: number;
	fogColor?: string;
	/**
	 * Corner radius of the floor slab (default 18). Real-app framings that show the
	 * window edge to edge (M1's opening) pass 0, so the frame corners are the page's
	 * own square corners rather than wedges of the stage background.
	 */
	radius?: number;
	/**
	 * Opaque under-layer for the clip-pathed face (default: on whenever the socket is
	 * cut without `sides`). The evenodd clip-path is rasterised through a mask, which
	 * leaves 1 px pinholes at random spots of the 1440 × 810 face; with nothing opaque
	 * under it they show the dark shaft below as dead pixels. The backing repeats the
	 * page's flat colours as plain rectangles (no clip-path, no mask) around the socket's
	 * box, 0.5 px under the face, so a pinhole shows the colour that is already there.
	 */
	backing?: boolean;
};

const FLOOR_D = 6;

/** The page's flat colour regions (chrome L, content well, Minimal Home card), window coords. */
const BackingPage: React.FC<{r: number}> = ({r}) => (
	<>
		<div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: WIN.h, borderRadius: r, background: C.chrome}} />
		<div
			style={{
				position: 'absolute',
				left: SHELL.railW,
				top: SHELL.titleH,
				width: WIN.w - SHELL.railW,
				height: WIN.h - SHELL.titleH,
				borderRadius: `${SHELL.wellRadius}px 0 ${r}px 0`,
				background: C.well,
			}}
		/>
		<div style={{position: 'absolute', left: L.card.x, top: L.card.y, width: L.card.w, height: L.card.h, borderRadius: 16, background: C.chrome}} />
	</>
);

/**
 * The backing: (window ∩ crop) minus the socket's bounding box (inset 1 px so it never
 * touches the walls), as four overlapping plain rectangles, each showing its part of
 * BackingPage, plus a ring that fills the socket box's rounded corners. Rectangular
 * overflow clips only — nothing here goes through a mask.
 */
const RING = 18;
const FaceBacking: React.FC<{crop?: WinRect | null; hole: boolean; r: number; fog: number; fogColor: string}> = ({crop, hole, r, fog, fogColor}) => {
	const x0 = Math.max(0, crop ? Math.floor(crop.x0) : 0);
	const y0 = Math.max(0, crop ? Math.floor(crop.y0) : 0);
	const x1 = Math.min(WIN.w, crop ? Math.ceil(crop.x1) : WIN.w);
	const y1 = Math.min(WIN.h, crop ? Math.ceil(crop.y1) : WIN.h);
	if (x1 <= x0 || y1 <= y0) return null;
	const sx0 = SOCKET.x - 1;
	const sy0 = SOCKET.y - 1;
	const sx1 = SOCKET.x + SOCKET.w + 1;
	const sy1 = SOCKET.y + SOCKET.h + 1;
	const bands: WinRect[] = (
		hole
			? [
					{x0, y0, x1, y1: Math.min(y1, sy0)}, // north of the socket
					{x0, y0: Math.max(y0, sy1), x1, y1}, // south
					{x0, y0, x1: Math.min(x1, sx0), y1}, // west (full height)
					{x0: Math.max(x0, sx1), y0, x1, y1}, // east (full height)
				]
			: [{x0, y0, x1, y1}]
	).filter((b) => b.x1 > b.x0 && b.y1 > b.y0);
	// The ring right around the socket (its rounded corners and the 1 px gap): the hole's exact
	// outline with an 18 px spread of the card colour — painted, not clipped — kept inside the crop.
	const ring = {
		x0: Math.max(x0, SOCKET.x - RING),
		y0: Math.max(y0, SOCKET.y - RING),
		x1: Math.min(x1, SOCKET.x + SOCKET.w + RING),
		y1: Math.min(y1, SOCKET.y + SOCKET.h + RING),
	};
	const ringColor = fog > 0 && /^#[0-9a-f]{6}$/i.test(fogColor) ? mixColor(C.chrome, fogColor, fog) : C.chrome;
	return (
		<>
			{hole && ring.x1 > ring.x0 && ring.y1 > ring.y0 ? (
				<div
					style={{
						position: 'absolute',
						left: ring.x0 - WIN.cx,
						top: ring.y0 - WIN.cy,
						width: ring.x1 - ring.x0,
						height: ring.y1 - ring.y0,
						overflow: 'hidden',
						transform: 'translateZ(-0.5px)',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: SOCKET.x - ring.x0,
							top: SOCKET.y - ring.y0,
							width: SOCKET.w,
							height: SOCKET.h,
							borderRadius: SOCKET.r,
							boxShadow: `0 0 0 ${RING}px ${ringColor}`,
						}}
					/>
				</div>
			) : null}
			{bands.map((b, i) => (
				<div
					key={`bk${i}`}
					style={{
						position: 'absolute',
						left: b.x0 - WIN.cx,
						top: b.y0 - WIN.cy,
						width: b.x1 - b.x0,
						height: b.y1 - b.y0,
						overflow: 'hidden',
						transform: 'translateZ(-0.5px)',
					}}
				>
					<div style={{position: 'absolute', left: -b.x0, top: -b.y0, width: WIN.w, height: WIN.h}}>
						<BackingPage r={r} />
						{fog > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: r, background: fogColor, opacity: fog}} /> : null}
					</div>
				</div>
			))}
		</>
	);
};

/** F1 as a floor slab of the building; use inside a <Stage>. */
export const HomeFloor: React.FC<HomeFloorProps> = ({
	z = FLOOR_Z.home,
	socket = false,
	crop,
	sides = false,
	fog = 0,
	fogColor = '#ddd8df',
	radius = 18,
	backing,
	...win
}) => {
	const clip = crop ? socketClipIn(crop, socket) : socket ? SOCKET_CLIP : undefined;
	const withBacking = (backing ?? (socket && !sides)) && clip !== undefined;
	const layers: React.ReactNode[] = [];
	if (sides) {
		const n = 4;
		for (let i = 0; i < n; i++) {
			const t = i / (n - 1);
			layers.push(
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -WIN.cx,
						top: -WIN.cy,
						width: WIN.w,
						height: WIN.h,
						borderRadius: radius,
						background: mixColor('#cdc8d1', '#e2dee6', t),
						clipPath: clip,
						transform: `translateZ(${-FLOOR_D + FLOOR_D * t * 0.985}px)`,
					}}
				/>,
			);
		}
	}
	return (
		<Obj z={z}>
			{layers}
			{socket ? <SocketWalls /> : null}
			{withBacking ? <FaceBacking crop={crop} hole={socket} r={radius} fog={fog} fogColor={fogColor} /> : null}
			<div
				style={{
					position: 'absolute',
					left: -WIN.cx,
					top: -WIN.cy,
					width: WIN.w,
					height: WIN.h,
					borderRadius: radius,
					overflow: 'hidden',
					background: '#f8f8f8',
					clipPath: clip,
					fontFamily: FONT.ui,
				}}
			>
				<HomeWindow {...win} />
				{fog > 0 ? <div style={{position: 'absolute', inset: 0, background: fogColor, opacity: fog}} /> : null}
			</div>
		</Obj>
	);
};
