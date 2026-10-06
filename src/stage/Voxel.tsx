/**
 * CSS-3D Minecraft blocks textured with real 16 px textures extracted from
 * the 投影工坊's own vanilla atlas (public/images/blocks, nearest-neighbour).
 * Face shading follows the workshop viewer's look: top 1.0, south .8,
 * west .72, east .6, north .55 (light from above, front-left).
 */
import React, {CSSProperties} from 'react';
import {staticFile} from 'remotion';

export type BlockTex = {top: string; side: string; bottom?: string; south?: string};

export const TEX: Record<string, BlockTex> = {
	grass: {top: 'grass_block_top', side: 'grass_block_side', bottom: 'dirt'},
	dirt: {top: 'dirt', side: 'dirt'},
	stone: {top: 'stone', side: 'stone'},
	cobble: {top: 'cobblestone', side: 'cobblestone'},
	planks: {top: 'oak_planks', side: 'oak_planks'},
	log: {top: 'oak_log_top', side: 'oak_log'},
	leaves: {top: 'oak_leaves', side: 'oak_leaves'},
	cherryLeaves: {top: 'cherry_leaves', side: 'cherry_leaves'},
	cherryLog: {top: 'cherry_log_top', side: 'cherry_log'},
	cherryPlanks: {top: 'cherry_planks', side: 'cherry_planks'},
	glass: {top: 'glass', side: 'glass'},
	sand: {top: 'sand', side: 'sand'},
	water: {top: 'water_still', side: 'water_still'},
	redstone: {top: 'redstone_block', side: 'redstone_block'},
	lamp: {top: 'redstone_lamp', side: 'redstone_lamp'},
	lampOn: {top: 'redstone_lamp_on', side: 'redstone_lamp_on'},
	piston: {top: 'piston_top', side: 'piston_side'},
	bricks: {top: 'bricks', side: 'bricks'},
	stoneBricks: {top: 'stone_bricks', side: 'stone_bricks'},
	smooth: {top: 'smooth_stone', side: 'smooth_stone'},
	quartz: {top: 'quartz_block_side', side: 'quartz_block_side'},
	pinkConcrete: {top: 'pink_concrete', side: 'pink_concrete'},
	pinkWool: {top: 'pink_wool', side: 'pink_wool'},
	white: {top: 'white_concrete', side: 'white_concrete'},
	seaLantern: {top: 'sea_lantern', side: 'sea_lantern'},
	crafting: {top: 'crafting_table_top', side: 'crafting_table_side', south: 'crafting_table_front', bottom: 'oak_planks'},
	bookshelf: {top: 'oak_planks', side: 'bookshelf'},
	gold: {top: 'gold_block', side: 'gold_block'},
	snow: {top: 'snow', side: 'snow'},
	moss: {top: 'moss_block', side: 'moss_block'},
	deepslate: {top: 'deepslate', side: 'deepslate'},
};

export const SHADE = {top: 1, south: 0.8, west: 0.72, east: 0.6, north: 0.55, bottom: 0.45} as const;

type FaceKey = keyof typeof SHADE;

const faceTransform = (k: FaceKey, s: number) => {
	const wall = `translate3d(0, ${s / 2}px, ${s / 2}px) rotateX(-90deg)`;
	switch (k) {
		case 'top':
			return `translateZ(${s}px)`;
		case 'bottom':
			return `rotateX(180deg)`;
		case 'south':
			return wall;
		case 'north':
			return `rotateZ(180deg) ${wall}`;
		case 'east':
			return `rotateZ(-90deg) ${wall}`;
		case 'west':
			return `rotateZ(90deg) ${wall}`;
	}
};

const texUrl = (name: string) => staticFile(`images/blocks/${name}.png`);

export const BlockFace: React.FC<{tex: string; s: number; k: FaceKey; overlay?: React.ReactNode; tint?: string; light?: number; opacity?: number}> = ({tex, s, k, overlay, tint, light = 1, opacity}) => (
	<div
		style={{
			position: 'absolute',
			left: -s / 2,
			top: -s / 2,
			width: s,
			height: s,
			transform: faceTransform(k, s),
			backgroundImage: `url(${texUrl(tex)})`,
			backgroundSize: '100% 100%',
			imageRendering: 'pixelated',
			backfaceVisibility: 'hidden',
			opacity,
		}}
	>
		<div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${Math.max(0, 1 - SHADE[k] * light)})`}} />
		{tint ? <div style={{position: 'absolute', inset: 0, background: tint}} /> : null}
		{overlay}
	</div>
);

export type BlockSpec = {
	/** Grid coordinates (x east, y south, z up). */
	gx: number;
	gy: number;
	gz: number;
	t: keyof typeof TEX | BlockTex;
	/** Extra per-block offset (for explode / pop animations), world px. */
	dx?: number;
	dy?: number;
	dz?: number;
	s?: number;
	tint?: string;
	opacity?: number;
	hidden?: boolean;
};

/**
 * A set of blocks with interior faces culled. `size` = world px per block.
 * Pivot = grid origin (block 0,0,0's bottom centre).
 */
export const VoxelSet: React.FC<{blocks: BlockSpec[]; size: number; light?: number; style?: CSSProperties; cull?: boolean}> = ({blocks, size, light = 1, style, cull = true}) => {
	const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
	const occ = new Set(blocks.filter((b) => !b.hidden && !b.dx && !b.dy && !b.dz && (b.opacity ?? 1) >= 1).map((b) => key(b.gx, b.gy, b.gz)));
	const out: React.ReactNode[] = [];
	blocks.forEach((b, i) => {
		if (b.hidden) return;
		const tex = typeof b.t === 'string' ? TEX[b.t] : b.t;
		const s = b.s ?? size;
		const moved = !!(b.dx || b.dy || b.dz);
		const faces: FaceKey[] = [];
		const nb = (dx: number, dy: number, dz: number) => cull && !moved && occ.has(key(b.gx + dx, b.gy + dy, b.gz + dz));
		if (!nb(0, 0, 1)) faces.push('top');
		if (!nb(0, 1, 0)) faces.push('south');
		if (!nb(0, -1, 0)) faces.push('north');
		if (!nb(1, 0, 0)) faces.push('east');
		if (!nb(-1, 0, 0)) faces.push('west');
		if (!nb(0, 0, -1) && b.gz > 0) faces.push('bottom');
		out.push(
			<div
				key={i}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					transformStyle: 'preserve-3d',
					transform: `translate3d(${b.gx * size + (b.dx ?? 0)}px, ${b.gy * size + (b.dy ?? 0)}px, ${b.gz * size + (b.dz ?? 0)}px)`,
				}}
			>
				{faces.map((k) => (
					<BlockFace
						key={k}
						k={k}
						s={s}
						light={light}
						tint={b.tint}
						opacity={b.opacity}
						tex={k === 'top' ? tex.top : k === 'bottom' ? tex.bottom ?? tex.top : k === 'south' && tex.south ? tex.south : tex.side}
					/>
				))}
			</div>,
		);
	});
	return <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', ...style}}>{out}</div>;
};
