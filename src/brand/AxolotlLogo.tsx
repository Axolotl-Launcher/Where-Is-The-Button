/**
 * Axolotl's own brand mark: the voxel pink axolotl (head facing left),
 * inlined from packages/assets/branding/axolotl.svg so it stays vector-sharp.
 */
import React, {CSSProperties} from 'react';
import {AXOLOTL_MARKUP, AXOLOTL_VIEWBOX} from './axolotl-markup';

export const AxolotlLogo: React.FC<{size?: number; style?: CSSProperties; seamStroke?: boolean}> = ({
	size = 24,
	style,
	seamStroke = size > 96,
}) => (
	<svg
		width={size}
		height={size}
		viewBox={AXOLOTL_VIEWBOX}
		style={{display: 'block', overflow: 'visible', ...style}}
		// At large sizes a hairline in each polygon's own colour hides antialiasing seams.
		className={seamStroke ? 'axl-seams' : undefined}
		dangerouslySetInnerHTML={{
			__html: (seamStroke ? '<style>.axl-seams polygon,.axl-seams rect,.axl-seams path{stroke-width:0.7;paint-order:stroke}</style>' : '') + seamify(AXOLOTL_MARKUP, seamStroke),
		}}
	/>
);

function seamify(markup: string, on: boolean) {
	if (!on) return markup;
	return markup.replace(/fill="(#[0-9A-Fa-f]{6})"/g, 'fill="$1" stroke="$1"');
}

/** The title-bar lockup: 24 px logo box + 8 px + 「Axolotl」 14/800, tracking .025em. */
export const TitlebarLogo: React.FC = () => (
	<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 24}}>
		<AxolotlLogo size={24} />
		<span style={{fontSize: 14, fontWeight: 800, letterSpacing: '0.025em', color: '#1a202c'}}>Axolotl</span>
	</div>
);
