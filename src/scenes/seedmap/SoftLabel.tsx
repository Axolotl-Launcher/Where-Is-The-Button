/**
 * The hero's 「开始游戏」 while it fades in or out during a morph (squeezing into the Swatch,
 * uncurling from the Pin). Same box as ButtonFace's own label — 16/800 on a 20 px line, the 8 px
 * gap, 64 px max width, all scaled by k — but clipped without an ellipsis: the stock label, being
 * text-overflow: ellipsis, reads 「开…」 at fractional visibility. Pass it as the face's child with
 * label = 0. Opacity k² so the fading text is nearly gone before its box is visibly cut.
 */
import React from 'react';

export const SoftLabel: React.FC<{k: number; text?: string}> = ({k, text = '开始游戏'}) => (
	<span
		style={{
			marginLeft: 8 * k,
			fontSize: 16,
			fontWeight: 800,
			lineHeight: '20px',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			maxWidth: 64 * k + 0.01,
			opacity: k * k,
			letterSpacing: 0,
		}}
	>
		{text}
	</span>
);
