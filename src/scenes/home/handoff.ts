/**
 * Exact states at the cuts this engineer owns (design/STORYBOARD.md §5), so the
 * neighbouring modules can start/end on the same picture.
 */
import {Cam} from '../../stage/Stage';
import {flatCam} from '../../film/camera';
import {FLOOR_Z, toWorld} from '../../film/timeline';
import {camFromEye} from './geometry';

/** M1 → M2 at 9.75 s (film frame 585): dive camera inside the F1 socket shaft, F1 culled. */
export const M1_EXIT = {
	/** Eye just under F1 in the shaft, pitch 20°, persp 800 (eye world = (263, 46, −25)). */
	cam: camFromEye(toWorld(983, 451, -25), 20, 400, 800) as Cam,
	/** Cursor (arrow) at world (263, 21, −150), falling ≈ 1.8 px/frame (110 px/s) toward F2. */
	cursor: {...toWorld(983, 426, -150), kind: 'arrow' as const, vz: -110},
	/** Hero (UI form) resting on F2 at the shaft: underside at FLOOR_Z.discover, idle, label on. */
	hero: {...toWorld(983, 428, FLOOR_Z.discover)},
	/** F2 rendered plain (no fog) at the cut; F1 not rendered. */
	culled: ['home'] as const,
};

/** M7 → M8 at 69.00 s: exactly the Sh01 framing; hero seated (flat, idle); cursor arrow. */
export const M8_ENTRY = {
	cam: flatCam(FLOOR_Z.home) as Cam,
	/** ≈ 180 px left of and 120 px below the hero centre (983, 428), on the floor surface. */
	cursor: {...toWorld(803, 548, 0), kind: 'arrow' as const},
};
