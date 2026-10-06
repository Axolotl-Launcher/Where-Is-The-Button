/**
 * M9 · End card (Sh32, film 80.00–87.00 s, local frames 0–420).
 *
 * The product's own first-run brand intro (OnboardingWelcome.vue), light theme,
 * laid out in window CSS px at the film's 1.3333 window scale:
 *   0–900 ms     logo 176 px: scale .72 → 1.04 (65 %) → 1, opacity 0 → 1, (.16,1,.3,1) per segment
 *   900–1950     wordmark unrolls (max-width 0 → 42rem) while each word flies in from −4rem
 *   2050 / 2400  pink copies of 「Axolotl」/「Launcher」 scan away left → right (.22,1,.36,1)
 *   2240–3200    the brand group lifts (here to 40 % of the frame, leaving room for the copy)
 *   3.20–3.80 s  tagline 「你的下一个世界，从这里开始。」 + the greeting's 32 × 2 pink bar
 *   3.80 s       「美西螈启动器」 · 4.00–4.40 s disclaimer · hold · fade to ground over the last 0.5 s
 */
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {AxolotlLogo} from '../brand/AxolotlLogo';
import {clamp, lerp, prog} from '../lib/anim';
import {C, FONT} from '../theme/tokens';

const WIN_S = 4 / 3;
const reveal = Easing.bezier(0.16, 1, 0.3, 1);
const scan = Easing.bezier(0.22, 1, 0.36, 1);
const ms = (t: number) => (t / 1000) * 60; // ms → frames

/** CSS keyframe segment helper: value of a segment [a,b] (frames) with an easing applied inside it. */
const seg = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number) => lerp(v0, v1, e(clamp((f - a) / (b - a), 0, 1)));

const LOGO = 176; // clamp(7rem, 15vw, 11rem) at 1440 → 176
const GAP = 24; // clamp(.75rem, 2vw, 1.5rem)
const WORD_FS = 72; // 4.5rem
const LIFT_TO = 0.4; // fraction of the window height (product: 33vh; film: 40 % to make room for the tagline)

const Word: React.FC<{text: string; core: boolean; f: number; wipeAt: number}> = ({text, core, f, wipeAt}) => {
	// ::after pink copy: holds the first 12 % of 700 ms, then clip-path inset(0 0 0 0) → inset(0 0 0 100%)
	const d = ms(700);
	const hold = wipeAt + 0.12 * d;
	const cut = f < hold ? 0 : seg(f, hold, wipeAt + d, 0, 100, scan);
	const flight = seg(f, ms(900), ms(1950), 0, 1, reveal);
	const base: React.CSSProperties = {
		position: 'relative',
		display: 'inline-block',
		transform: `translateX(${(-64 * (1 - flight)).toFixed(2)}px)`,
		opacity: flight,
		fontWeight: core ? 800 : 700,
		color: core ? 'transparent' : C.textTertiary,
		backgroundImage: core ? `linear-gradient(90deg, ${C.textPrimary}, ${C.textDefault})` : undefined,
		WebkitBackgroundClip: core ? 'text' : undefined,
		backgroundClip: core ? 'text' : undefined,
	};
	return (
		<span style={base}>
			{text}
			{cut < 100 ? (
				<span style={{position: 'absolute', inset: 0, color: C.brand, WebkitTextFillColor: C.brand, clipPath: `inset(0 0 0 ${cut.toFixed(2)}%)`}}>{text}</span>
			) : null}
		</span>
	);
};

export const M9: React.FC = () => {
	const f = useCurrentFrame();

	// logo: 0–65 % → .72 → 1.04 (opacity 0 → 1), 65–100 % → 1.04 → 1, the curve applied per segment
	const k1 = ms(900) * 0.65;
	const logoS = f < k1 ? seg(f, 0, k1, 0.72, 1.04, reveal) : seg(f, k1, ms(900), 1.04, 1, reveal);
	const logoO = seg(f, 0, k1, 0, 1, reveal);

	// wordmark container max-width 0 → 42rem (672 px)
	const maxW = seg(f, ms(900), ms(1950), 0, 672, reveal);

	// lift: 70 % → 100 % of 3200 ms, top 50 % → 40 %
	const lift = seg(f, ms(2240), ms(3200), 0, 1, scan);
	const groupY = lerp(405, 810 * LIFT_TO, lift);

	// copy under the brand group
	const tagT = prog(f, ms(3200), ms(3800), reveal);
	const barT = prog(f, ms(3500), ms(3950), reveal);
	const nameT = prog(f, ms(3800), ms(4300), reveal);
	const discT = prog(f, ms(4000), ms(4400), reveal);
	const out = prog(f, 390, 420, Easing.bezier(0.4, 0, 0.6, 1));
	const wash = prog(f, 0, 40, Easing.bezier(0.4, 0, 0.6, 1));

	const copyTop = 810 * LIFT_TO + LOGO / 2 + 78; // tagline line box top (window px)
	return (
		<AbsoluteFill style={{background: C.well, fontFamily: FONT.ui}}>
			{/* faint brand wash along the bottom 30 % */}
			<AbsoluteFill
				style={{
					background: `linear-gradient(to bottom, rgba(234, 217, 225, 0) 70%, rgba(234, 217, 225, 0.5) 85%, rgba(233, 208, 219, 0.5) 100%)`,
					opacity: wash,
				}}
			/>
			<AbsoluteFill style={{opacity: 1 - out}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: 1440, height: 810, transform: `scale(${WIN_S})`, transformOrigin: '0 0'}}>
					{/* brand group: centred, translate(-50%, -50%) — it re-centres as the wordmark unrolls */}
					<div
						style={{
							position: 'absolute',
							left: 720,
							top: groupY,
							display: 'flex',
							alignItems: 'center',
							gap: GAP,
							transform: 'translate(-50%, -50%)',
							whiteSpace: 'nowrap',
						}}
					>
						<div style={{width: LOGO, height: LOGO, flex: 'none', opacity: logoO, transform: `scale(${logoS.toFixed(4)})`}}>
							<AxolotlLogo size={LOGO} />
						</div>
						<div
							style={{
								display: 'flex',
								alignItems: 'baseline',
								gap: '0.35em',
								maxWidth: maxW,
								overflow: 'hidden',
								fontSize: WORD_FS,
								lineHeight: 1,
								letterSpacing: 0,
								color: C.textPrimary,
							}}
						>
							<Word text="Axolotl" core f={f} wipeAt={ms(2050)} />
							<Word text="Launcher" core={false} f={f} wipeAt={ms(2400)} />
						</div>
					</div>

					{/* tagline — the greeting's typography (24 / CJK 600) and its 32 × 2 pink bar */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							width: 1440,
							top: copyTop + 4 * (1 - tagT),
							textAlign: 'center',
							fontSize: 31,
							fontWeight: 600,
							lineHeight: '40px',
							color: C.textPrimary,
							opacity: tagT,
						}}
					>
						你的下一个世界，从这里开始。
					</div>
					<div
						style={{
							position: 'absolute',
							left: 720 - 16 * barT,
							top: copyTop + 54,
							width: 32 * barT,
							height: 2,
							borderRadius: 9,
							background: C.brand,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							width: 1440,
							top: copyTop + 74 + 3 * (1 - nameT),
							textAlign: 'center',
							fontSize: 16,
							fontWeight: 500,
							lineHeight: '22px',
							letterSpacing: '0.04em',
							color: C.textTertiary,
							opacity: nameT,
						}}
					>
						美西螈启动器
					</div>

					{/* legal line, bottom-centred, 48 px (screen) from the edge */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							width: 1440,
							bottom: 36,
							textAlign: 'center',
							fontSize: 14,
							lineHeight: '20px',
							color: C.textTertiary,
							opacity: discT,
						}}
					>
						非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
