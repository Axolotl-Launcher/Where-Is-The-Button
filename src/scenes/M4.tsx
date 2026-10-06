/**
 * M4 · Instance & Lab (Sh14–Sh16), film 30.50–40.00 s, frames 1830–2400.
 *
 * One continuous camera over three floors: F3 (实例 Vanilla Perfected · 内容)
 * → navigation plunge → F4 (实验室) → trapdoor dive toward F5 (种子地图).
 * The choreography lives in ./instance/choreo.ts (pure functions of the frame).
 *
 * Entry (30.50): flat real-app framing of F3, content well empty and fading in,
 * 实例库 slider white, quick circle #1 pink with the hero curled on it as the Disc,
 * cursor (arrow) at window (300, 160) on the F3 surface.
 * Exit (40.00): the dive camera has swung past F4's front edge and below it (F4
 * culled) and arrives — position AND velocity — on M5's frame-0 camera (CUT / CUT_V
 * in ./seedmap/plan.ts: look-at window (1260, 360) raised 100 above F5, dist 820,
 * pitch 56°, persp 900); hero (UI) falling 360 above F5 at (1380, 657), presented to
 * the lens; cursor ≈ 200 above it, still above the frame. F5 is drawn with M5's own
 * layering (SeedFloor + the map chrome lifted to +20, no fog), so nothing jumps at the cut.
 */
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Cam, Obj, Stage} from '../stage/Stage';
import {Floor} from '../film/Floor';
import {CursorOverlay, CursorShadow, CursorState} from '../film/CursorOverlay';
import {project} from '../film/camera';
import {toWorld} from '../film/timeline';
import {C, FONT} from '../theme/tokens';
import {Icon} from '../ui/Icon';
import {AppWindow, NAV_ITEMS, navY} from '../ui/shell/AppWindow';
import {INSTANCE_CRUMB, InstanceContent} from '../ui/pages/InstancePage';
import {LabContent} from '../ui/pages/LabPage';
import {SeedMapBase, SeedMapOverlay, SeedMapShell} from '../ui/pages/SeedMap';
import {
	badgeJiggle,
	camAt,
	cursorPose,
	eyeZ,
	F3,
	F4,
	F5,
	flapAngle,
	glassFor,
	heroPose,
	instanceState,
	labelShown,
	labFloorFade,
	labState,
	loadingBar,
	navState,
	shaftFade,
	SWAP,
} from './instance/choreo';
import {EnterFlap, LabFloor} from './instance/LabFloor';
import {BillboardCursor} from './instance/BillboardCursor';
import {InstanceHero} from './instance/InstanceHero';
import {SeedFloor} from './seedmap/SeedFloor';
import {arrivalCursorPx, liftK, s1Gate, viewAt} from './seedmap/plan';

const LAB_CRUMB = {icon: 'flask-conical' as const, text: '实验室'};
const BG = 'linear-gradient(#f2eef2, #d9d4dc)';

/** Pink count badge on nav 下载 (App.vue: absolute right-0 top-0, min-w 16, 10/700 white). */
const DownloadBadge: React.FC<{dy: number}> = ({dy}) => (
	<div
		style={{
			position: 'absolute',
			left: 40,
			top: 440,
			minWidth: 16,
			height: 16,
			padding: '0 4px',
			boxSizing: 'border-box',
			borderRadius: 9999,
			background: C.brand,
			color: '#fff',
			fontSize: 10,
			fontWeight: 700,
			lineHeight: '16px',
			textAlign: 'center',
			transform: dy ? `translateY(${dy}px)` : undefined,
		}}
	>
		1
	</div>
);

/**
 * 36.50 tone cross-fade: the pink pill (and the white icons it covers) fading in over the white
 * 实例库 slider, and the quick circle's pink fading out — the AppWindow itself only knows on/off tones.
 */
const NavToneFade: React.FC<{top: number; bottom: number; tone: number; quick: number}> = ({top, bottom, tone, quick}) => (
	<>
		{tone > 0 && tone < 1 ? (
			<>
				<div style={{position: 'absolute', left: 8, top, width: 48, height: Math.max(0, bottom - top), borderRadius: 24, background: C.brand, opacity: tone}} />
				{NAV_ITEMS.map((n, i) =>
					top <= navY(i) + 6 && bottom >= navY(i) + 42 ? (
						<div key={n.key} style={{position: 'absolute', left: 8, top: navY(i), width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tone}}>
							<Icon name={n.icon} size={24} color="#fff" style={{filter: 'drop-shadow(0 0 0.5rem rgba(0,0,0,0.35))'}} />
						</div>
					) : null,
				)}
			</>
		) : null}
		{quick > 0 ? (
			<div style={{position: 'absolute', left: 8, top: navY(8) + 17, width: 48, height: 48, borderRadius: 24, background: C.brand, opacity: quick, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<img src={staticFile('images/instance-icons/Fabric.png')} style={{width: 28, height: 28, objectFit: 'contain', imageRendering: 'pixelated'}} />
			</div>
		) : null}
	</>
);

/** The shell + page for whichever floor the content plunge is on. */
const Shell: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
	const nav = navState(f);
	const bar = loadingBar(f);
	return (
		<>
			<AppWindow
				nav={null}
				navSlider={nav.slider}
				quickActive={nav.quickActive}
				breadcrumb={nav.crumbLab ? LAB_CRUMB : INSTANCE_CRUMB}
				hoverNav={nav.hoverNav}
				panel={false}
				frame={false}
			>
				{children}
				{bar.w > 0 && bar.o > 0 ? (
					<div style={{position: 'absolute', left: 64, top: 48, width: 1376 * bar.w, height: 2, opacity: bar.o, background: 'linear-gradient(90deg, #db2777, #e76ca3)'}} />
				) : null}
			</AppWindow>
			<NavToneFade top={nav.slider.top} bottom={nav.slider.bottom} tone={nav.tone} quick={nav.quickFade} />
			<DownloadBadge dy={badgeJiggle(f)} />
		</>
	);
};

/** A full-window UI plane lifted to elevation e above F5 — M5's own layering (src/scenes/M5.tsx). */
const Lifted: React.FC<{cam: Cam; e: number; children: React.ReactNode}> = ({cam, e, children}) => {
	const {k, ox, oy} = liftK(cam, e);
	return (
		<Obj z={F5 + e}>
			<div
				style={{
					position: 'absolute',
					left: -720,
					top: -405,
					width: 1440,
					height: 810,
					transform: k !== 1 ? `scale(${k})` : undefined,
					transformOrigin: `${ox}px ${oy}px`,
					fontFamily: FONT.ui,
				}}
			>
				{children}
			</div>
		</Obj>
	);
};

/** F5 exactly as M5 draws it at its frame 0 (map at rest, chrome at +20, no fog). */
const SeedMapArrival: React.FC<{cam: Cam}> = ({cam}) => {
	const view = viewAt(0);
	return (
		<>
			<SeedFloor z={F5}>
				<SeedMapShell>
					<SeedMapBase view={view} s1Gate={s1Gate(0)} />
				</SeedMapShell>
			</SeedFloor>
			<Lifted cam={cam} e={20}>
				<SeedMapOverlay view={view} state={{loading: null}} />
			</Lifted>
		</>
	);
};

export const M4: React.FC = () => {
	const f = useCurrentFrame();
	const cam = camAt(f);
	const tilted = cam.pitch > 0.3;
	const eye = eyeZ(cam);

	// ── hero ──
	const h = heroPose(f);
	// Rail hops (Sh15) are seen top-down far from the frame centre: keep the hero over the rail on screen
	// by cancelling the perspective drift of its lift (it reads as growing toward the lens instead).
	// The same correction pins the Disc's top face exactly on M3's flat hand-off Disc at 30.50; it blends
	// out over the pop and with the camera's tilt (no hard switch when the pitch starts rising).
	let hx = h.wx;
	let hy = h.wy;
	const pin = (f >= 300 && f < 362 ? 1 : 1 - Math.min(1, Math.max(0, (f - 2) / 6))) * Math.min(1, Math.max(0, 1 - cam.pitch / 2));
	if (pin > 0) {
		const top = f < 300 ? h.lift + h.form.d * h.sz + 0.6 : Math.max(0, h.lift);
		const k = 1 - (pin * top) / cam.dist;
		hx = cam.x + 720 + (hx - cam.x - 720) * k;
		hy = cam.y + 405 + (hy - cam.y - 405) * k;
	}
	const hw = toWorld(hx, hy, h.floor + h.lift + 0.6 * Math.min(1, Math.max(0, 1 + h.lift / 100))); // +0.6 off the surface; none in the fall (M5's exact height)
	// the label is drawn only once the body can hold it (InstanceHero fades it, never squeezes it); the ▷ is laid
	// out alone at the body's centre, so place it in the morph's native slot (w/2 − 36·label) or at glyphX
	const label = labelShown(h.form);
	const gdx = (h.glyphX != null ? h.glyphX - h.wx - 1 : h.form.gdx - 36 * h.form.label) + h.glyphJx;

	// ── cursor ──
	const glass = glassFor(cam);
	const cp = cursorPose(f, glass);
	const cw = toWorld(cp.wx, cp.wy, cp.floor + cp.lift);
	const cursor: CursorState = {...cw, kind: cp.kind, press: cp.press, rot: cp.rot};
	// 39.42–39.93 the cursor dives into the trapdoor as an in-stage sprite (hidden by F4 while below it); once F4
	// is culled it is handed to the screen overlay at the same size (arrivalCursorPx), exactly as M5 draws it at 40.00
	const billboard = f >= 535 && f < 556;
	const arriving = f >= 556;
	// motion trail (as M3): three fading ghosts along the last frame of travel when the pointer moves fast
	const at = (ff: number) => {
		const c = cursorPose(ff, glass);
		return {c, w: toWorld(c.wx, c.wy, c.floor + c.lift)};
	};
	const prev = at(f - 1);
	const sNow = project(cam, cw);
	const sPrev = project(cam, prev.w);
	const fast = f < 535 && f >= 1 && Math.hypot(sNow.x - sPrev.x, sNow.y - sPrev.y) > 18;
	const ghosts = fast ? [0.34, 0.67, 1].map((d) => at(f - d)) : [];
	const depthScale = f >= 400 ? 1 : 0.6;
	const maxScale = f >= 400 ? 2.2 : 1.6;

	// ── pages ──
	const inst = instanceState(f);
	const lab = labState(f);
	const onF3 = f < SWAP;
	const showF4 = !onF3 && eye > F4 + 1;
	const showF5 = !onF3 && (tilted || f >= 514);

	return (
		<AbsoluteFill style={{background: BG}}>
			<Stage cam={cam}>
				{showF5 ? <SeedMapArrival cam={cam} /> : null}
				{onF3 ? (
					<Floor z={F3} flat={!tilted}>
						<Shell f={f}>
							<InstanceContent
								twinHover={inst.twinHover}
								lite={inst.lite}
								enabled={inst.enabled}
								disabled={inst.disabled}
								style={{opacity: inst.contentOpacity}}
							/>
						</Shell>
					</Floor>
				) : null}
				{showF4 ? (
					<>
						<LabFloor z={F4} open={f >= 514} shaft={shaftFade(f)} opacity={labFloorFade(f)} flat={!tilted}>
							<Shell f={f}>
								<LabContent
									cardHover={lab.cardHover}
									enterPress={lab.enterPress}
									enterHidden={lab.enterHidden}
									style={{opacity: lab.contentOpacity}}
								/>
							</Shell>
						</LabFloor>
						{f >= 514 ? <EnterFlap floorZ={F4} angle={flapAngle(f)} opacity={labFloorFade(f)} /> : null}
					</>
				) : null}
				{glass > 4 && f < 530 ? <CursorShadow cursor={cursor} floorZ={cp.floor} /> : null}
				{f >= 546 ? <CursorShadow cursor={cursor} floorZ={F5} strength={Math.min(1, (f - 546) / 10) * Math.min(1, Math.max(0, cam.pitch / 25))} /> : null}
				<InstanceHero
					x={hw.x}
					y={hw.y}
					z={hw.z}
					floorZ={h.shadowZ ?? 0}
					shadow={h.shadowZ != null}
					shadowStrength={h.shadow}
					w={h.form.w}
					h={h.form.h}
					r={h.form.r}
					d={h.form.d}
					label={label}
					glyph={h.form.glyph}
					glyphDx={gdx}
					glyphDy={h.glyphDy}
					sx={h.sx}
					sy={h.sy}
					sz={h.sz}
					rx={h.rx}
					ry={h.ry}
					rz={h.rz}
					press={h.press}
				/>
				{billboard ? <BillboardCursor cam={cam} x={cw.x} y={cw.y} z={cw.z} kind={cp.kind} press={cp.press} rot={cp.rot} /> : null}
			</Stage>
			{ghosts.map((g, i) => (
				<CursorOverlay
					key={i}
					cam={cam}
					cursor={{...g.w, kind: cp.kind, rot: g.c.rot, opacity: [0.22, 0.13, 0.07][i]}}
					depthScale={depthScale}
					maxScale={maxScale}
				/>
			))}
			{f < 535 ? <CursorOverlay cam={cam} cursor={cursor} depthScale={depthScale} maxScale={maxScale} /> : null}
			{arriving ? <CursorOverlay cam={cam} cursor={cursor} size={arrivalCursorPx(f - 570, project(cam, cw).scale, cam.pitch)} depthScale={0} /> : null}
		</AbsoluteFill>
	);
};
