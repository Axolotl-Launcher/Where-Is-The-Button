/**
 * F6 · 投影工坊 as a floor of the building, driven by a per-frame state:
 * the flat page (empty state ⇄ loaded workbench, drop overlay, loading bar,
 * canvas + grid, inspector, status bar) lives on the floor face; the glass
 * overlays are lifted +20 off the dark stage (floating bars), so the 3D
 * viewport reads as a real space in tilted shots.
 */
import React from 'react';
import {Obj, Plane} from '../../stage/Stage';
import {C, FONT} from '../../theme/tokens';
import {
	WorkshopEmpty,
	WorkshopShell,
	WsCanvasControls,
	WsDropOverlay,
	WsInspector,
	WsLayerControl,
	WsLoadingStatus,
	WsModeToolbar,
	WsProgressBar,
	WsSelection,
	WsStatusBar,
	WsTool,
	WsToolbar,
	WsToolContext,
	WsViewportCanvas,
	WsWalkControl,
	WSL,
} from '../../ui/pages/Workshop';
import {TowerFloor} from './TowerFloor';

export type F6State = {
	/** 0 = empty state, 1 = loaded workbench (cross-fade on the face). */
	loaded: number;
	drop?: number;
	bar?: number | null;
	tool: WsTool;
	toolHover?: WsTool | null;
	toolPress?: number;
	/** 层间距 slider value (panel shown when not null) and its fade-in. */
	spacing?: number | null;
	/** Thumb position (snaps between steps over 2 frames while the number changes at once). */
	thumbValue?: number;
	ctxIn?: number;
	thumb?: number;
	loading?: {label: string; count?: [number, number]; spin?: number} | null;
	/** Glass overlays settle 0..1. */
	overlays?: number;
	sel: WsSelection;
	anchorPending?: boolean;
	inspectorEnable?: number;
	grid?: number;
	bounds?: boolean;
};

type Rect = {x: number; y: number; w: number; h: number};

const Lifted: React.FC<{r: Rect; z: number; opacity: number; children: React.ReactNode}> = ({r, z, opacity, children}) =>
	opacity <= 0.001 ? null : (
		<Obj x={r.x + r.w / 2 - 720} y={r.y + r.h / 2 - 405} z={z}>
			<Plane w={r.w} h={r.h} style={{opacity, fontFamily: FONT.ui, color: C.textPrimary}}>
				{children}
			</Plane>
		</Obj>
	);

export const GLASS_LIFT = 20;

/**
 * Under Home's empty socket at the end of 层间距 the viewport reads as a soft dark well, not a black
 * screen with a grid (or F6's toolbar): a dark radial gradient on F6 centred where the line of sight
 * through the socket meets F6 (window coords, it drifts as the camera tilts), fading out before
 * the rest of F6.
 */
const socketWellBg = (x: number, y: number) =>
	`radial-gradient(ellipse 320px 190px at ${x.toFixed(1)}px ${y.toFixed(1)}px, #3e3446 0%, #31283a 38%, #1f1827 72%, rgba(26, 20, 32, 0) 100%)`;

/**
 * The inspector is its own flat leaf just above the floor face, so the workshop close-ups can
 * give it a deliberate depth of field: at ≈ 2–3.7× magnification Chrome's texture of the page
 * text reads soft and stair-stepped (no layer split or supersampling changes that), so while
 * the camera is close on the hero the panel at the frame edge is defocused a touch on purpose
 * (`dof`, CSS px of blur on the leaf), which reads as a focus pull to the hero, not low-res.
 */
const InspectorLeaf: React.FC<{z: number; st: F6State; alpha: number; fog: number; L: number; dof: number; well: {a: number; x: number; y: number} | null}> = ({
	z,
	st,
	alpha,
	fog,
	L,
	dof,
	well,
}) => {
	const r = WSL.inspector;
	if (L <= 0 || alpha <= 0) return null;
	return (
		<Obj x={r.x + r.w / 2 - 720} y={r.y + r.h / 2 - 405} z={z + 0.35}>
			<Plane
				w={r.w}
				h={r.h}
				style={{
					opacity: alpha * L,
					overflow: 'hidden',
					borderBottomRightRadius: 18,
					fontFamily: FONT.ui,
					color: C.textPrimary,
					filter: dof > 0.01 ? `blur(${dof.toFixed(3)}px)` : undefined,
				}}
			>
				<div style={{position: 'absolute', left: -r.x, top: -r.y, width: 1440, height: 810}}>
					<WsInspector sel={st.sel} anchorPending={st.anchorPending} loading={!!st.loading} enable={st.inspectorEnable} />
					{well ? <div style={{position: 'absolute', inset: 0, background: socketWellBg(well.x, well.y), opacity: Math.min(1, well.a)}} /> : null}
				</div>
				{fog > 0 ? <div style={{position: 'absolute', inset: 0, background: '#ddd8df', opacity: fog}} /> : null}
			</Plane>
		</Obj>
	);
};

export const F6Floor: React.FC<{
	z: number;
	st: F6State;
	alpha?: number;
	fog?: number;
	flat?: boolean;
	/** The dark well under Home's socket: strength 0..1 and its centre on F6 (window coords); glass overlays go. */
	socketWell?: {a: number; x: number; y: number} | null;
	/** Depth-of-field blur of the inspector leaf (CSS px; the close-ups ramp it with magnification). */
	inspectorDof?: number;
}> = ({z, st, alpha = 1, fog = 0, flat, socketWell = null, inspectorDof = 0}) => {
	const L = Math.max(0, Math.min(1, st.loaded));
	const well = socketWell && socketWell.a > 0 ? socketWell : null;
	const keepGlass = 1 - Math.max(0, Math.min(1, (well?.a ?? 0) * 1.5));
	const ov = (st.overlays ?? 1) * alpha * keepGlass;
	const settle = (delay: number) => {
		const t = Math.max(0, Math.min(1, (st.overlays ?? 1) * 1.6 - delay));
		return {o: t * alpha * keepGlass, dz: (1 - t) * (1 - t) * 26};
	};
	const mb = settle(0);
	const lc = settle(0.2);
	const cc = settle(0.35);
	const wk = settle(0.5);
	return (
		<>
			<TowerFloor z={z} alpha={alpha} fog={fog} flat={flat}>
				<WorkshopShell>
					{L < 1 ? <WorkshopEmpty style={{opacity: 1 - L}} /> : null}
					{L > 0 ? (
						<div style={{position: 'absolute', inset: 0, opacity: L}}>
							<WsToolbar />
							<WsViewportCanvas grid={st.grid ?? 1} />
							<WsStatusBar sel={st.sel} />
						</div>
					) : null}
					{st.drop ? <WsDropOverlay opacity={st.drop} /> : null}
					{st.bar != null ? <WsProgressBar pct={st.bar} /> : null}
				</WorkshopShell>
				{well ? <div style={{position: 'absolute', inset: 0, background: socketWellBg(well.x, well.y), opacity: Math.min(1, well.a)}} /> : null}
			</TowerFloor>
			<InspectorLeaf z={z} st={st} alpha={alpha} fog={fog} L={L} dof={inspectorDof} well={well} />
			{L > 0.5 && keepGlass > 0 ? (
				<>
					<Lifted r={WSL.modeBar} z={z + GLASS_LIFT + mb.dz} opacity={mb.o}>
						<WsModeToolbar tool={st.tool} hover={st.toolHover} press={st.toolPress} />
					</Lifted>
					{st.spacing != null ? (
						<Lifted r={WSL.toolCtx} z={z + GLASS_LIFT} opacity={(st.ctxIn ?? 1) * alpha * keepGlass}>
							<WsToolContext value={st.spacing} thumb={st.thumb} thumbValue={st.thumbValue} />
						</Lifted>
					) : null}
					<Lifted r={WSL.layerCtl} z={z + GLASS_LIFT + lc.dz} opacity={lc.o}>
						<WsLayerControl />
					</Lifted>
					<Lifted r={WSL.canvasCtl} z={z + GLASS_LIFT + cc.dz} opacity={cc.o}>
						<WsCanvasControls bounds={st.bounds ?? true} />
					</Lifted>
					<Lifted r={WSL.walk} z={z + GLASS_LIFT + wk.dz} opacity={wk.o}>
						<WsWalkControl />
					</Lifted>
					{st.loading ? (
						<Lifted r={WSL.loading} z={z + GLASS_LIFT} opacity={Math.min(1, ov * 3)}>
							<WsLoadingStatus {...st.loading} />
						</Lifted>
					) : null}
				</>
			) : null}
		</>
	);
};

