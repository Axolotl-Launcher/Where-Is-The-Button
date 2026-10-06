import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CursorKind, CursorSprite} from '../characters/Cursor';
import {track} from '../lib/anim';
import {FloorShadow, Obj, Slab, Stage} from '../stage/Stage';
import {FONT_STACK} from '../fonts';

export const TechTest: React.FC = () => {
	const f = useCurrentFrame();
	const pitch = track(f, [
		[0, 0],
		[60, 48],
	]);
	const yaw = track(f, [
		[0, 0],
		[60, -18],
	]);
	const kinds: CursorKind[] = ['arrow', 'pointer', 'ibeam', 'grab', 'grabbing', 'move'];
	return (
		<AbsoluteFill style={{fontFamily: FONT_STACK}}>
			<Stage cam={{x: 0, y: 0, z: 0, dist: 2000, pitch, yaw, roll: 0, persp: 2000}} background="linear-gradient(#f3eef2, #e7e2ea)">
				<Obj>
					<Slab w={1500} h={820} d={16} r={28} face="#f4f4f5" side="#cfcbd6" sideTop="#e6e3ea" />
				</Obj>
				{[0, 1, 2].map((i) => (
					<Obj key={i} x={-380 + i * 0} y={-200 + i * 130} z={16}>
						<Slab w={640} h={104} d={6} r={20} face="#ffffff" side="#d8d6de">
							<div style={{padding: '22px 28px', fontSize: 26, fontWeight: 600, color: '#1f2128'}}>Vanilla Perfected</div>
						</Slab>
					</Obj>
				))}
				<FloorShadow x={300} y={40} floorZ={16} w={240} h={72} r={14} height={90} />
				<Obj x={300} y={40} z={16 + 90}>
					<Slab w={240} h={72} d={12} r={14} face="#db2777" side="#9d174d" sideTop="#be185d">
						<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#fff', fontSize: 28, fontWeight: 600}}>
							<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
								<polygon points="6 3 20 12 6 21 6 3" fill="#fff" />
							</svg>
							启动
						</div>
					</Slab>
				</Obj>
			</Stage>
			<div style={{position: 'absolute', left: 80, bottom: 70, display: 'flex', gap: 90}}>
				{kinds.map((k) => (
					<div key={k} style={{position: 'relative', width: 40, height: 40}}>
						<CursorSprite kind={k} size={48} shadow />
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};
