/** Dev entry for M5 alone: node scripts/stills.mjs M5 <frames> out/M5 --entry=src/dev/M5.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M5} from '../scenes/M5';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M5" component={M5 ?? Empty} durationInFrames={MODULES.M5.to - MODULES.M5.from} fps={60} width={1920} height={1080} />
));
