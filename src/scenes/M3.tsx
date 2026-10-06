/**
 * M3 · Discover (Sh08–Sh13, film 13.00–30.50 s, frames 780–1830).
 * See design/STORYBOARD.md §4 and src/scenes/discover/* for the beat sheet,
 * the hero / cursor / page state functions and the camera.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage} from '../stage/Stage';
import {Floor} from '../film/Floor';
import {CursorOverlay, CursorShadow} from '../film/CursorOverlay';
import {toWorld} from '../film/timeline';
import {DiscoverFloor} from '../ui/pages/Discover';
import {CARDS, CART, MODAL, TOAST} from '../ui/pages/discover/layout';
import {CartBar, ConfirmModal, DownloadToast, ModalScrim} from '../ui/pages/discover/Overlays';
import {B, Z2, Z3} from './discover/beats';
import {camAt} from './discover/cam';
import {cursorAt} from './discover/cursor';
import {heroAt} from './discover/hero';
import {pageAt} from './discover/page';
import {HeroBody} from './discover/HeroBody';
import {MorphFace, RING_PLANE, RingFace} from './discover/HeroRing';
import {CardSlab, InstanceWellOnly, ShellOverlay, WinPlane} from './discover/Rig';
import {DISCOVER_NAV} from '../ui/pages/Discover';
import {C, FONT} from '../theme/tokens';
import {InstanceWindow} from '../ui/pages/InstancePage';

const ENV = 'linear-gradient(180deg, #f2eef2 0%, #d9d4dc 100%)';

// Elevations (STORYBOARD §1): cards +4, floating bars +20, modal +36; the toast sits at +20 here (flat shots, see notes).
const E_CART = 20;
const E_TOAST = 20;
const E_SCRIM = 32;
const E_MODAL = 36;

export const M3: React.FC = () => {
	const f = useCurrentFrame();
	const cam = camAt(f);
	const pg = pageAt(f);
	const hero = heroAt(f);
	const cur = cursorAt(f);
	const tilted = cam.pitch > 0.5;
	const plunge = f >= B.quick;
	const showF2 = f < B.quick + 11;
	const blur = 5 * pg.scrim;

	// cursor: glass height in the diorama, on the clicked surface when flat,
	// screen-fixed (camera target plane) during the navigation plunge
	const curZ = plunge ? cam.z : Z2 + cur.h;
	const cw = toWorld(cur.wx, cur.wy, curZ);
	const cursorState = {x: cw.x, y: cw.y, z: cw.z, kind: cur.kind, press: cur.press, rot: cur.rot};
	// motion trail for fast flat-shot moves: ghosts spaced ≤ ~12 screen px over the last frame
	const nGhost = !tilted && cur.speed > 14 ? Math.min(6, Math.max(3, Math.ceil((cur.speed * (cam.persp / cam.dist)) / 12))) : 0;
	const ghosts = Array.from({length: nGhost}, (_, i) => cursorAt(f - (i + 1) / nGhost));

	return (
		<AbsoluteFill style={{background: ENV, fontFamily: FONT.ui, color: C.textPrimary}}>
			<Stage cam={cam}>
				{plunge || tilted ? (
					// during the plunge F3 is only its content well: the 2D shell overlay is the chrome
					<Floor z={Z3} flat={!tilted} faceStyle={plunge ? {background: 'transparent'} : undefined} fog={plunge ? 0 : 0.35}>
						{plunge ? <InstanceWellOnly fog={0.3 * (1 - Math.min(1, (f - B.quick) / 24))} /> : <InstanceWindow lite="none" />}
					</Floor>
				) : null}
				{showF2 ? (
					<Floor
						z={Z2}
						flat={!tilted}
						faceStyle={plunge ? {background: 'transparent', opacity: pg.content} : undefined}
					>
						<div style={{position: 'absolute', inset: 0, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
							<DiscoverFloor
								s={{
									field: pg.field,
									results: {loading: pg.loading, empty: pg.empty, emptyHover: pg.emptyHover, emptyPress: pg.emptyPress, thumb: pg.thumb},
									nav: {...DISCOVER_NAV, badge: {s: pg.badge, count: 1}},
									frame: f,
								}}
							/>
						</div>
					</Floor>
				) : null}
				{showF2
					? CARDS.map((d, i) => (
							<CardSlab key={d.title} i={i} d={d} fx={pg.cards.fx[i]} opacity={pg.cards.opacity * (plunge ? pg.content : 1)} dy={pg.cards.dy} blur={blur} />
						))
					: null}
				{pg.cart ? (
					<WinPlane x={CART.x} y={CART.y} w={CART.w} h={CART.h} elev={E_CART}>
						<div
							style={{
								opacity: pg.cart.opacity,
								transform: `scale(${0.5 + 0.5 * pg.cart.t}) translateY(${-160 * (1 - pg.cart.t)}px)`,
								transformOrigin: '50% 50%',
							}}
						>
							<CartBar installHover={pg.cart.hover} installPress={pg.cart.press} preparing={pg.cart.preparing} spinDeg={pg.spin} />
						</div>
					</WinPlane>
				) : null}
				{pg.scrim > 0.001 ? (
					<WinPlane x={0} y={0} w={1440} h={810} elev={E_SCRIM}>
						<ModalScrim opacity={pg.scrim} />
					</WinPlane>
				) : null}
				{pg.modal && pg.modal.opacity > 0.001 ? (
					<WinPlane x={MODAL.x} y={MODAL.y} w={MODAL.w} h={MODAL.h} elev={E_MODAL}>
						<div
							style={{
								opacity: pg.modal.opacity,
								transform: `translate(${pg.modal.dx}px, ${pg.modal.dy}px) scale(${pg.modal.scale})`,
								transformOrigin: '50% 50%',
							}}
						>
							<ConfirmModal installHover={pg.modal.hover} installPress={pg.modal.press} />
						</div>
					</WinPlane>
				) : null}
				{pg.toast && pg.toast.opacity > 0.001 ? (
					<WinPlane x={TOAST.x} y={TOAST.y} w={TOAST.w} h={TOAST.h} elev={E_TOAST}>
						<div
							style={{
								opacity: pg.toast.opacity,
								transform: `translateX(${pg.toast.tx * 100}%) scale(${pg.toast.scale})`,
								transformOrigin: '50% 50%',
							}}
						>
							<DownloadToast p={pg.toast.p} counter={pg.toast.counter} />
						</div>
					</WinPlane>
				) : null}
				{hero.mode === 'body' ? <HeroBody pose={hero} /> : null}
				{hero.mode === 'morph' && hero.morph ? (
					<WinPlane x={RING_PLANE.x} y={RING_PLANE.y} w={RING_PLANE.w} h={RING_PLANE.h} elev={0.6}>
						<MorphFace m={hero.morph} />
					</WinPlane>
				) : null}
				{hero.mode === 'ring' && hero.ring ? (
					<WinPlane x={RING_PLANE.x} y={RING_PLANE.y} w={RING_PLANE.w} h={RING_PLANE.h} elev={0.6}>
						<RingFace r={hero.ring} />
					</WinPlane>
				) : null}
				{tilted && cur.h > 2 ? (
					<CursorShadow
						cursor={{...cursorState, z: Z2 + 4 + cur.h}}
						floorZ={Z2 + 4}
						size={44 * (1 + 0.6 * (1 - Math.min(1, cur.h / 330)))}
						strength={1.5 + 1.1 * (1 - Math.min(1, cur.h / 330))}
					/>
				) : null}
			</Stage>
			{plunge ? <ShellOverlay f={f} hero={hero} /> : null}
			{ghosts.map((g, i) => {
				const gw = toWorld(g.wx, g.wy, plunge ? cam.z : Z2 + g.h);
				return <CursorOverlay key={i} cam={cam} cursor={{x: gw.x, y: gw.y, z: gw.z, kind: cur.kind, rot: g.rot, opacity: 0.22 * (1 - i / nGhost) + 0.02}} />;
			})}
			<CursorOverlay cam={cam} cursor={cursorState} depthScale={tilted ? 0.5 : 0} minScale={0.8} maxScale={1.2} />
		</AbsoluteFill>
	);
};
