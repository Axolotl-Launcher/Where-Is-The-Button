/** Dev entry for M8 alone: node scripts/stills.mjs M8 <frames> out/M8 --entry=src/dev/M8.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M8} from '../scenes/M8';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M8" component={M8 ?? Empty} durationInFrames={MODULES.M8.to - MODULES.M8.from} fps={60} width={1920} height={1080} />
));
