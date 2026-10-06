/** Dev entry for M7 alone: node scripts/stills.mjs M7 <frames> out/M7 --entry=src/dev/M7.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M7} from '../scenes/M7';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M7" component={M7 ?? Empty} durationInFrames={MODULES.M7.to - MODULES.M7.from} fps={60} width={1920} height={1080} />
));
