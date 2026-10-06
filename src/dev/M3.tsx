/** Dev entry for M3 alone: node scripts/stills.mjs M3 <frames> out/M3 --entry=src/dev/M3.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M3} from '../scenes/M3';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M3" component={M3 ?? Empty} durationInFrames={MODULES.M3.to - MODULES.M3.from} fps={60} width={1920} height={1080} />
));
