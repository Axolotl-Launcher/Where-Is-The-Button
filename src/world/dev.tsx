/** Dev entry for the evening world alone: node scripts/stills.mjs World <frames> out/World --entry=src/world/dev.tsx */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import '../fonts';
import {World} from './World';

const WorldDev: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<World t={f / 60} />
		</AbsoluteFill>
	);
};

registerRoot(() => <Composition id="World" component={WorldDev} durationInFrames={300} fps={60} width={1920} height={1080} />);
