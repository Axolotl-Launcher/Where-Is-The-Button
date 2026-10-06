/** Dev entry for M6 alone: node scripts/stills.mjs M6 <frames> out/M6 --entry=src/dev/M6.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M6} from '../scenes/M6';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M6" component={M6 ?? Empty} durationInFrames={MODULES.M6.to - MODULES.M6.from} fps={60} width={1920} height={1080} />
));
