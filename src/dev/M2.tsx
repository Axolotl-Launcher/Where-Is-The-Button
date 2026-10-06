/** Dev entry for M2 alone: node scripts/stills.mjs M2 <frames> out/M2 --entry=src/dev/M2.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M2} from '../scenes/M2';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M2" component={M2 ?? Empty} durationInFrames={MODULES.M2.to - MODULES.M2.from} fps={60} width={1920} height={1080} />
));
