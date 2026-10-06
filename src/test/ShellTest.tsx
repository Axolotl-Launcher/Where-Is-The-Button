import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_STACK} from '../fonts';
import {AppWindow} from '../ui/shell/AppWindow';
import {MinimalHomeContent} from '../ui/pages/MinimalHome';

/** Flat, 1:1-scaled Minimal Home for fidelity checks (frame 0 idle, 30 hover, 45 press). */
export const ShellTest: React.FC = () => {
	const f = useCurrentFrame();
	const hover = f >= 30 ? 1 : 0;
	const press = f >= 45 ? 1 : 0;
	return (
		<AbsoluteFill style={{background: '#d9d4dc', fontFamily: FONT_STACK, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: 'scale(1.25)', boxShadow: '0 30px 80px rgba(40,20,50,0.25)', borderRadius: 18}}>
				<AppWindow nav="home">
					<MinimalHomeContent hero={{hover, press}} />
				</AppWindow>
			</div>
		</AbsoluteFill>
	);
};
