/**
 * Real mod icons (from each project's Modrinth page — the same images the
 * launcher itself loads) drawn in the product's Avatar style: white backing,
 * 1 px #dddddd ring on top, radius 16/96 · size, object-fit contain.
 * Pixel-art icons scale with nearest-neighbour so they stay crisp.
 *
 * Variant switch: icons are on by default; render the neutral-tile version with
 *   npx remotion render WhereIsTheLaunchButton out/neutral.mp4 --props='{"modIcons":false}'
 */
import React, {CSSProperties} from 'react';
import {getInputProps, Img, staticFile} from 'remotion';
import {C} from '../theme/tokens';

export const MOD_ICONS: boolean = (getInputProps() as {modIcons?: boolean}).modIcons !== false;

export type ModId = 'sodium' | 'lithium' | 'iris' | 'fabric-api' | 'litematica' | 'modmenu' | 'malilib';

const PIXEL_ART: Record<ModId, boolean> = {
	sodium: false,
	lithium: false,
	iris: false,
	'fabric-api': true,
	litematica: true,
	modmenu: true,
	malilib: true,
};

export const ModIcon: React.FC<{id: ModId; size: number; r?: number; ring?: string; style?: CSSProperties}> = ({id, size, r, ring = C.divider, style}) => {
	const radius = r ?? (16 / 96) * size;
	return (
		<div style={{position: 'relative', width: size, height: size, borderRadius: radius, overflow: 'hidden', background: C.control, flexShrink: 0, ...style}}>
			<Img
				src={staticFile(`images/mods/${id}.png`)}
				maxRetries={5}
				style={{display: 'block', width: '100%', height: '100%', objectFit: 'contain', imageRendering: PIXEL_ART[id] ? 'pixelated' : 'auto'}}
			/>
			{ring !== 'transparent' ? (
				<div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: `inset 0 0 0 1px ${ring}`, pointerEvents: 'none'}} />
			) : null}
		</div>
	);
};
