/**
 * M5 · Seed map (F5), film 40.00–51.50 s (frames 2400–3090).
 *
 *   Sh16 end  40.00–41.00  the dive from the Lab's trapdoor settles over the seed map
 *   Sh17      41.00–43.00  the hero flutters down, lands at the trapdoor point (41.30),
 *                          scoots into the cherry grove, still by 42.30
 *   Sh18      43.00–45.50  1:1 drag pan, two cursor-anchored wheel zooms (44.30, 44.80):
 *                          「1 像素 = 4 格」 → 2 → 1; 45.20 the cursor finds it, stops dead
 *   Sh19      45.50–49.50  right-click → 「位置 / X 120, Z -64」, pinyin → 「启动按钮」 (46.90),
 *                          the hero becomes the colour square (47.40), 「添加标记」 (48.00) →
 *                          the Pin 「启动按钮」, toast 「标记已保存」 (48.50)
 *   Sh20      49.50–51.50  heartbeat, press 2 (50.00): uncurls and sinks through the map at
 *                          the shaft (983, 428); droop (51.00); the cursor dives (51.30)
 *
 * Choreography lives in ./seedmap/plan.ts; the page in src/ui/pages/SeedMap.tsx.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cam, Obj, Stage} from '../stage/Stage';
import {Floor} from '../film/Floor';
import {FLOOR_WINDOWS} from '../film/floors';
import {CursorOverlay, CursorShadow} from '../film/CursorOverlay';
import {Hero} from '../characters/LaunchButton';
import {FONT} from '../theme/tokens';
import {MarkerPopup, SeedMapBase, SeedMapOverlay, SeedMapShell, SeedToast} from '../ui/pages/SeedMap';
import {SeedFloor} from './seedmap/SeedFloor';
import {project} from '../film/camera';
import {ARRIVE_END, F5, F6, T, arrivalCursorPx, camAt, clamp, cursorAt, f5Culled, heroAt, holeAt, liftK, loadingAt, popupAt, s1Gate, shaftDark, toastAt, viewAt} from './seedmap/plan';
import {SHAFT_GLOW} from './seedmap/press2';
import {SoftLabel} from './seedmap/SoftLabel';

/** A full-window UI plane lifted to elevation e above F5 (parallax-compensated in flat shots). */
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

const WorkshopRest = FLOOR_WINDOWS.workshop;

export const M5: React.FC = () => {
	const f = useCurrentFrame();
	const cam = camAt(f);
	const view = viewAt(f);
	const hero = heroAt(f);
	const cur = cursorAt(f);
	const popup = popupAt(f);
	const toast = toastAt(f);
	const hole = holeAt(f);
	const culled = f5Culled(f);
	const dark = shaftDark(f);
	const loading = loadingAt(f);
	const tilt = clamp(cam.pitch / 25, 0, 1);

	let heroNode: React.ReactNode = null;
	if (hero.kind === '3d') {
		const {k, ox, oy} = liftK(cam, hero.eBase);
		const wx = ox + (hero.wx - ox) * k;
		const wy = oy + (hero.wy - oy) * k;
		// a label fading in/out is clipped without the stock ellipsis (「开…」)
		const softLabel = hero.label > 0.001 && hero.label < 0.999;
		heroNode = (
			<Hero
				x={wx - 720}
				y={wy - 405}
				z={F5 + hero.e}
				floorZ={F5 + hero.shadowOn}
				w={hero.w}
				h={hero.h}
				r={hero.r}
				d={hero.d}
				rx={hero.rx}
				ry={hero.ry}
				rz={hero.rz}
				sx={hero.sx * k}
				sy={hero.sy * k}
				sz={hero.sz}
				label={softLabel ? 0 : hero.label}
				glyph={hero.glyph}
				hover={hero.hover}
				press={hero.press}
				shadow={hero.shadow > 0.01 && hero.e > -1}
				shadowStrength={hero.shadow}
				style={hero.bright < 0.999 ? {filter: `brightness(${hero.bright})`} : undefined}
			>
				{softLabel ? <SoftLabel k={hero.label} /> : null}
			</Hero>
		);
	}

	const cursorWorld = {x: cur.wx - 720, y: cur.wy - 405, z: F5 + cur.e};

	return (
		<AbsoluteFill style={{background: 'linear-gradient(#f2eef2, #d9d4dc)'}}>
			<Stage cam={cam}>
				{f >= T.press ? (
					// F6 lies in F5's shadow, lit only where the hole lets the light down
					<Floor z={F6} fog={dark} fogColor={SHAFT_GLOW}>
						<WorkshopRest />
					</Floor>
				) : null}
				{!culled ? (
					<SeedFloor z={F5} hole={hole} under={{depth: F5 - F6 + 8, color: '#120c1a', opacity: dark}}>
						<SeedMapShell>
							<SeedMapBase view={view} s1Gate={s1Gate(f)} markers={hero.kind === 'pin' ? [hero.marker] : undefined} />
						</SeedMapShell>
					</SeedFloor>
				) : null}
				{!culled ? (
					<Lifted cam={cam} e={20}>
						<SeedMapOverlay view={view} state={{loading}} />
					</Lifted>
				) : null}
				{heroNode}
				{popup && !culled ? (
					<Lifted cam={cam} e={28}>
						<MarkerPopup p={popup} />
					</Lifted>
				) : null}
				{toast != null && !culled ? (
					<Lifted cam={cam} e={28}>
						<SeedToast t={toast} />
					</Lifted>
				) : null}
				{tilt > 0.01 ? <CursorShadow cursor={{...cursorWorld, kind: cur.kind}} floorZ={F5} strength={tilt} /> : null}
			</Stage>
			{f < ARRIVE_END ? (
				// 40.00–40.40: the cursor arrives from M4's dive at M4's size, blending into the depth-scaled size below
				<CursorOverlay
					cam={cam}
					cursor={{...cursorWorld, kind: cur.kind, next: cur.next, mixT: cur.mixT, press: cur.press, rot: cur.rot}}
					size={arrivalCursorPx(f, project(cam, cursorWorld).scale, cam.pitch)}
					depthScale={0}
				/>
			) : (
				<CursorOverlay
					cam={cam}
					cursor={{...cursorWorld, kind: cur.kind, next: cur.next, mixT: cur.mixT, press: cur.press, rot: cur.rot}}
					depthScale={0.55 * tilt}
					minScale={0.8}
					maxScale={1.3}
				/>
			)}
		</AbsoluteFill>
	);
};
