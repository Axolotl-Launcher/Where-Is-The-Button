/** Dev entry for M4 alone: node scripts/stills.mjs M4 <frames> out/M4 --entry=src/dev/M4.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M4} from '../scenes/M4';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M4" component={M4 ?? Empty} durationInFrames={MODULES.M4.to - MODULES.M4.from} fps={60} width={1920} height={1080} />
));
