/**
 * Renders one of Axolotl's own icons (Lucide-style, 24-unit grid, 2px round
 * strokes) inline, so it stays razor-sharp at any camera distance.
 */
import React, {CSSProperties} from 'react';
import {ICONS, IconName} from './icons.generated';

export const Icon: React.FC<{
	name: IconName;
	size?: number;
	color?: string;
	strokeWidth?: number;
	/** Fill the shape with the current colour (e.g. a solid play triangle). */
	filled?: boolean;
	style?: CSSProperties;
}> = ({name, size = 20, color = 'currentColor', strokeWidth, filled, style}) => {
	const def = ICONS[name] as {viewBox: string; fill?: string; stroke?: string; strokeWidth?: string; inner: string};
	const fill = filled ? 'currentColor' : def.fill;
	return (
		<svg
			width={size}
			height={size}
			viewBox={def.viewBox}
			fill={fill}
			stroke={def.stroke}
			strokeWidth={strokeWidth ?? def.strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{color, flexShrink: 0, display: 'block', overflow: 'visible', ...style}}
			dangerouslySetInnerHTML={{__html: def.inner}}
		/>
	);
};
