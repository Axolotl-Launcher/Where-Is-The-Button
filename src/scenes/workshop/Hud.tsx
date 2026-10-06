/**
 * The 投影工坊's glass overlays as the app really draws them — a flat, screen-space layer
 * over its 3D viewport — presented crisp over the tower wide (Sh25 end → Sh26): the mode
 * toolbar 「单选 · 框选 · 测量 │ 层间距」 with the 层间距 tool context (slider 0–100 %,
 * step 10) under it, at their real relative layout (toolbar top 60 / context top 108 of the
 * viewport, both centred) at the real-app scale (4/3, like every real-app shot) and parked
 * bottom-left of the frame, clear of the stack. The film camera is the viewer's camera
 * here, so its UI floats on the glass.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from '../../theme/tokens';
import {WSL, WsModeToolbar, WsTool, WsToolContext} from '../../ui/pages/Workshop';

/** Screen placement: top-left of the union of the two panels (window x = toolCtx.x, y = modeBar.y). */
export const HUD = {s: 4 / 3, x: 52, y: 862, ox: WSL.toolCtx.x, oy: WSL.modeBar.y};
const UNION = {w: WSL.toolCtx.w, h: WSL.toolCtx.y + WSL.toolCtx.h - WSL.modeBar.y};

/** Window point of the glass panels (WS_POINTS / WSL coordinates) → screen px of the HUD. */
export const hudPt = (wx: number, wy: number) => ({x: HUD.x + (wx - HUD.ox) * HUD.s, y: HUD.y + (wy - HUD.oy) * HUD.s});

export const WsHud: React.FC<{
	/** Entry 0..1 (fade + rise). */
	inT: number;
	/** The tool context unfolding under the toolbar 0..1 (after the 层间距 click). */
	ctxT?: number;
	/** Exit 0..1. */
	outT?: number;
	tool: WsTool;
	hover?: WsTool | null;
	press?: number;
	value?: number;
	thumbValue?: number;
	thumb?: number;
}> = ({inT, ctxT = 0, outT = 0, tool, hover = null, press = 0, value, thumbValue, thumb = 0}) => {
	if (inT <= 0 || outT >= 1) return null;
	const a = Math.max(0, Math.min(1, inT)) * (1 - Math.max(0, outT));
	const rise = (1 - inT) * 18 + outT * 12;
	const sc = 0.965 + 0.035 * inT;
	const mb = WSL.modeBar;
	const tc = WSL.toolCtx;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: HUD.x,
					top: HUD.y,
					width: UNION.w,
					height: UNION.h,
					transformOrigin: '0 0',
					transform: `scale(${HUD.s})`,
					fontFamily: FONT.ui,
					color: C.textPrimary,
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						transformOrigin: '50% 60%',
						transform: `translateY(${(rise / HUD.s).toFixed(3)}px) scale(${sc.toFixed(4)})`,
						opacity: a,
					}}
				>
					<div style={{position: 'absolute', left: mb.x - HUD.ox, top: 0, width: mb.w, height: mb.h}}>
						<WsModeToolbar tool={tool} hover={hover} press={press} />
					</div>
					{ctxT > 0 && value != null ? (
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: tc.y - HUD.oy,
								width: tc.w,
								height: tc.h,
								opacity: Math.min(1, ctxT),
								transformOrigin: '50% 0',
								transform: `translateY(${((1 - ctxT) * -8).toFixed(3)}px) scaleY(${(0.88 + 0.12 * ctxT).toFixed(4)})`,
							}}
						>
							<WsToolContext value={value} thumbValue={thumbValue} thumb={thumb} />
						</div>
					) : null}
				</div>
			</div>
		</AbsoluteFill>
	);
};
