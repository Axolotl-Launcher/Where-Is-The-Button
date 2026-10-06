import React from 'react';
import {Composition, Folder} from 'remotion';
import {Film} from './film/Film';
import {TOTAL_FRAMES} from './film/timeline';
import {TechTest} from './test/TechTest';
import {ShellTest} from './test/ShellTest';
import {VoxelTest} from './test/VoxelTest';
import {AlignTest} from './test/AlignTest';
import './fonts';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="WhereIsTheLaunchButton" component={Film} durationInFrames={TOTAL_FRAMES} fps={60} width={1920} height={1080} />
			<Folder name="dev-tests">
			<Composition id="TechTest" component={TechTest} durationInFrames={60} fps={60} width={1920} height={1080} />
			<Composition id="ShellTest" component={ShellTest} durationInFrames={60} fps={60} width={1920} height={1080} />
			<Composition id="AlignTest" component={AlignTest} durationInFrames={60} fps={60} width={1920} height={1080} />
			<Composition id="VoxelTest" component={VoxelTest} durationInFrames={60} fps={60} width={1920} height={1080} />
			</Folder>
		</>
	);
};
