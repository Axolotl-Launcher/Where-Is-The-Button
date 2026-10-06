/**
 * The film: modules M1–M9 placed on the global timeline (design/STORYBOARD.md).
 * Each module is a component whose frame 0 is its start. A module that is not
 * built yet renders a labelled placeholder so the cut can always be previewed.
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT_STACK} from '../fonts';
import {ModuleId, MODULES} from './timeline';
import {SCENES} from '../scenes';
import {AUDIO_READY} from '../scenes/audio-flag';

const Placeholder: React.FC<{id: ModuleId}> = ({id}) => {
	const f = useCurrentFrame();
	const m = MODULES[id];
	return (
		<AbsoluteFill style={{background: '#e9e5eb', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_STACK, color: '#484d54'}}>
			<div style={{fontSize: 48, fontWeight: 800}}>{id} · {m.name}</div>
			<div style={{fontSize: 28, marginTop: 12}}>{((m.from + f) / 60).toFixed(2)} s</div>
		</AbsoluteFill>
	);
};

export const Film: React.FC = () => (
	<AbsoluteFill style={{background: '#000', fontFamily: FONT_STACK}}>
		{(Object.keys(MODULES) as ModuleId[]).map((id) => {
			const m = MODULES[id];
			const Comp = SCENES[id];
			return (
				<Sequence key={id} from={m.from} durationInFrames={m.to - m.from} name={`${id} ${m.name}`}>
					{Comp ? <Comp /> : <Placeholder id={id} />}
				</Sequence>
			);
		})}
		{AUDIO_READY ? <Audio src={staticFile('audio/soundtrack.wav')} /> : null}
	</AbsoluteFill>
);
