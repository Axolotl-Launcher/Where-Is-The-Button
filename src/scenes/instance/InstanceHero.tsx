/**
 * M4's hero: src/characters/LaunchButton.tsx `Hero` (read-only core) with one change — the label is never
 * squeezed: it sits at its native place (24 px from the body's right end) at full width and only fades, so
 * while a morph widens or narrows the body the hero never carries a fake-looking 「开始游…」. The ▷ is laid
 * out alone (centred, then offset by glyphDx), so the scene positions it independently of the label.
 * At the UI form (label 1, w 144) this is pixel-identical to the shared Hero (▷ centre 37, label 56–120),
 * which M5 uses on the other side of the 40.00 cut.
 */
import React from 'react';
import {C} from '../../theme/tokens';
import {FloorShadow, Obj, Slab} from '../../stage/Stage';
import {HeroProps, PlayGlyph} from '../../characters/LaunchButton';

const Face: React.FC<{w: number; h: number; r: number; hover: number; press: number; label: number; glyph: number; glyphDx: number; glyphDy: number}> = ({
	w,
	h,
	r,
	hover,
	press,
	label,
	glyph,
	glyphDx,
	glyphDy,
}) => {
	const shadows = [`0 0 0 1px ${C.brandHairline}`, 'inset 0 1px 0 rgba(255,255,255,0.3)'];
	return (
		<div
			style={{
				position: 'relative',
				width: w,
				height: h,
				borderRadius: r,
				background: C.brand,
				boxShadow: shadows.join(', '),
				filter: hover > 0 ? `brightness(${1 - 0.1 * hover})` : undefined,
				transform: press > 0 ? `scale(${1 - 0.03 * press})` : undefined,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#ffffff',
				overflow: 'hidden',
				boxSizing: 'border-box',
			}}
		>
			<div style={{transform: `translate(${1 + glyphDx}px, ${glyphDy}px)`, display: 'flex'}}>
				<PlayGlyph size={glyph} />
			</div>
			{label > 0.001 ? (
				<span
					style={{
						position: 'absolute',
						left: w - 88,
						top: (h - 20) / 2,
						fontSize: 16,
						fontWeight: 800,
						lineHeight: '20px',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						maxWidth: 64.01,
						opacity: label,
						letterSpacing: 0,
					}}
				>
					开始游戏
				</span>
			) : null}
		</div>
	);
};

export const InstanceHero: React.FC<HeroProps> = ({
	x,
	y,
	z,
	floorZ = 0,
	d = 8,
	rx = 0,
	ry = 0,
	rz = 0,
	sx = 1,
	sy = 1,
	sz = 1,
	shadow = true,
	shadowStrength = 1,
	w = 144,
	h = 48,
	r = 16,
	hover = 0,
	press = 0,
	label = 1,
	glyph = 24,
	glyphDx = 0,
	glyphDy = 0,
}) => (
	<>
		{shadow ? <FloorShadow x={x} y={y} floorZ={floorZ} w={w * sx} h={h * sy} r={r} height={Math.max(0, z - floorZ)} strength={shadowStrength} rz={rz} /> : null}
		<Obj x={x} y={y} z={z} rx={rx} ry={ry} rz={rz} sx={sx} sy={sy} sz={sz}>
			<Slab w={w} h={h} d={d} r={r} face="transparent" side={C.sidePink} sideTop="#d0256f" faceStyle={{overflow: 'visible'}}>
				<Face w={w} h={h} r={r} hover={hover} press={press} label={label} glyph={glyph} glyphDx={glyphDx} glyphDy={glyphDy} />
			</Slab>
		</Obj>
	</>
);
