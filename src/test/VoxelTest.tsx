import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {track} from '../lib/anim';
import {Stage} from '../stage/Stage';
import {BlockSpec, VoxelSet} from '../stage/Voxel';

export const VoxelTest: React.FC = () => {
	const f = useCurrentFrame();
	const blocks: BlockSpec[] = [];
	for (let x = -4; x <= 4; x++) for (let y = -3; y <= 3; y++) blocks.push({gx: x, gy: y, gz: 0, t: 'grass'});
	for (let z = 1; z <= 3; z++) blocks.push({gx: 2, gy: 0, gz: z, t: 'log'});
	for (let x = 1; x <= 3; x++) for (let y = -1; y <= 1; y++) blocks.push({gx: x, gy: y, gz: 4, t: 'cherryLeaves'});
	blocks.push({gx: -2, gy: 1, gz: 1, t: 'crafting'});
	for (let x = -3; x <= -1; x++) blocks.push({gx: x, gy: -1, gz: 1, t: 'pinkConcrete'});
	return (
		<AbsoluteFill style={{background: '#0a0a0a'}}>
			<Stage cam={{x: 0, y: 0, z: 60, dist: 1700, pitch: 58, yaw: track(f, [[0, -30], [60, 30]]), roll: 0, persp: 1700}}>
				<VoxelSet blocks={blocks} size={64} />
			</Stage>
		</AbsoluteFill>
	);
};
