/**
 * Floors F1–F5 for the tower wides (Sh25) and the 层间距 collapse (Sh26).
 * F2–F5 come from FLOOR_WINDOWS (placeholders until integration swaps in the
 * real pages). F1 is M1/M8's shared `HomeFloor` (src/scenes/home), so Home is
 * the exact Sh01 page: with its EMPTY socket (a real hole with walls — the hero
 * has been gone since Sh05) until the hero seats again, then seated and flat,
 * pixel-identical to M8's first frame. Dollhouse culling: a floor is mounted
 * only while the camera's eye is above it (from below it could never be in
 * view, and CSS 3D has no near plane).
 */
import React from 'react';
import {Cam} from '../../stage/Stage';
import {FLOOR_WINDOWS} from '../../film/floors';
import {FloorKey} from '../../film/timeline';
import {HomeFloor} from '../home/HomeFloor';
import {eyeOf} from './common';
import {TowerFloor} from './TowerFloor';

const MID: FloorKey[] = ['discover', 'instance', 'lab', 'seedmap'];
const FOG: Record<FloorKey, number> = {home: 0, discover: 0.05, instance: 0.09, lab: 0.13, seedmap: 0.16, workshop: 0.12};

export const TowerUpper: React.FC<{
	cam: Cam;
	z: (k: FloorKey) => number;
	alpha?: (k: FloorKey) => number;
	fogK?: number;
	/** Home with the hero seated in its slot (no hole) — the Sh01 picture. */
	seated?: boolean;
	/** 2D scale of the seated hero in its page slot (the snap overshoot); 1 = exactly Sh01. */
	heroScale?: number;
	/**
	 * Fade F2–F5 in after they mount, over this much eye height above the floor (0 = pop),
	 * so a crane rising past a floor plane never pops a slab into the frame.
	 */
	mountFade?: number;
	/** Home slab corner radius: 18 in the wides, easing to 0 as the camera lands on the real-app framing (matches M1/M8). */
	homeRadius?: number;
}> = ({cam, z, alpha = () => 1, fogK = 1, seated, heroScale = 1, mountFade = 0, homeRadius = 18}) => {
	const eye = eyeOf(cam);
	const on = (k: FloorKey) => eye.z > z(k) + 30 && alpha(k) > 0;
	return (
		<>
			{MID.map((k) => {
				if (!on(k)) return null;
				const Win = FLOOR_WINDOWS[k];
				const m = mountFade > 0 ? Math.min(1, (eye.z - z(k) - 30) / mountFade) : 1;
				const a = alpha(k) * m * m * (3 - 2 * m);
				// a floor that is fading (folding into Home / materialising) also hazes, so it never
				// reads as a crisp double exposure over the floors behind it
				return (
					<TowerFloor key={k} z={z(k)} alpha={a} fog={FOG[k] * fogK + 0.4 * (1 - a)}>
						<Win />
					</TowerFloor>
				);
			})}
			{on('home') ? (
				seated ? (
					<HomeFloor z={z('home')} radius={homeRadius} hero={{}} heroWrapStyle={Math.abs(heroScale - 1) > 1e-4 ? {transform: `scale(${heroScale})`} : undefined} />
				) : (
					<HomeFloor z={z('home')} radius={homeRadius} socket sides hero={null} />
				)
			) : null}
		</>
	);
};

export const FOG_F6 = FOG.workshop;
