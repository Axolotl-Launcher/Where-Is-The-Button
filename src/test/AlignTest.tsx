import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {camTrack, flatCam} from '../film/camera';
import {CursorOverlay, CursorShadow} from '../film/CursorOverlay';
import {Floor} from '../film/Floor';
import {FLOOR_Z, HOME_HERO, toWorld} from '../film/timeline';
import {Stage} from '../stage/Stage';
import {AppWindow} from '../ui/shell/AppWindow';
import {MinimalHomeContent} from '../ui/pages/MinimalHome';

export const AlignTest: React.FC = () => {
	const f = useCurrentFrame();
	const flat = flatCam(FLOOR_Z.home);
	const tilt = {...flatCam(FLOOR_Z.home), pitch: 55, yaw: -22, persp: 2600, dist: 4200, z: -600};
	const cam = camTrack(f, [[0, flat], [10, flat], [50, tilt]]);
	const hero = toWorld(HOME_HERO.cx, HOME_HERO.cy, FLOOR_Z.home + 60);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(#f2eef2, #d9d4dc)'}}>
			<Stage cam={cam}>
				<Floor z={FLOOR_Z.discover} fog={0.25}>
					<AppWindow nav="discover" breadcrumb={{icon: 'compass', text: '发现内容'}} frame={false} />
				</Floor>
				<Floor z={FLOOR_Z.home}>
					<AppWindow nav="home" panel={false} frame={false}>
						<MinimalHomeContent />
					</AppWindow>
				</Floor>
				<CursorShadow cursor={{...hero, kind: 'pointer'}} floorZ={FLOOR_Z.home} />
			</Stage>
			<CursorOverlay cam={cam} cursor={{...hero, kind: 'pointer'}} />
		</AbsoluteFill>
	);
};
