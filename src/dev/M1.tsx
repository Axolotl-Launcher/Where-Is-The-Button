/** Dev entry for M1 alone: node scripts/stills.mjs M1 <frames> out/M1 --entry=src/dev/M1.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M1} from '../scenes/M1';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M1" component={M1 ?? Empty} durationInFrames={MODULES.M1.to - MODULES.M1.from} fps={60} width={1920} height={1080} />
));
