/** Dev entry for M9 alone: node scripts/stills.mjs M9 <frames> out/M9 --entry=src/dev/M9.tsx */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '../fonts';
import {MODULES} from '../film/timeline';
import {M9} from '../scenes/M9';

const Empty: React.FC = () => null;

registerRoot(() => (
	<Composition id="M9" component={M9 ?? Empty} durationInFrames={MODULES.M9.to - MODULES.M9.from} fps={60} width={1920} height={1080} />
));
