/**
 * Discover's floating layers, each drawn in its own local box so the scene
 * can mount it at its real elevation: the cart bar (SelectedProjectsFloatingBar
 * → FloatingActionBar), the 「确认安装」 modal (ContentInstallPreviewModal in
 * NewModal), the modal scrim, and the download toast (NotificationToast
 * type="instance-download").
 */
import React from 'react';
import {C, SHADOW} from '../../../theme/tokens';
import {Icon} from '../../Icon';
import {Btn} from '../../kit';
import {CART, CART_INSTALL, MODAL, MODAL_CANCEL, MODAL_INSTALL, TOAST} from './layout';
import {CheckBox, InitialTile, Spin} from './parts';

const LI = {initials: 'Li', tint: '#93a39c'};

/** Cart bar, local to CART (864 × 58). `preparing` swaps the pink button to 「正在准备 0/1」. */
export const CartBar: React.FC<{installHover?: number; installPress?: number; preparing?: boolean; spinDeg?: number}> = ({
	installHover = 0,
	installPress = 0,
	preparing,
	spinDeg = 0,
}) => (
	<div
		style={{
			position: 'relative',
			width: CART.w,
			height: CART.h,
			boxSizing: 'border-box',
			borderRadius: 20,
			border: `1px solid ${C.divider}`,
			background: C.chrome,
			boxShadow: `${SHADOW.cartBar}, 0 25px 25px rgba(0,0,0,0.15)`,
			display: 'flex',
			alignItems: 'center',
			gap: 6,
			padding: '10px 12px',
		}}
	>
		<div style={{width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${C.chrome}`, boxSizing: 'border-box', overflow: 'hidden', flexShrink: 0}}>
			<InitialTile initials={LI.initials} tint={LI.tint} size={29} r={4.83} mod="litematica" />
		</div>
		<span style={{padding: '8px 12px', fontSize: 16, fontWeight: 600, color: C.textPrimary, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>1个已选择的项目</span>
		<span style={{width: 1, height: 24, background: C.divider, margin: '0 2px', flexShrink: 0}} />
		<Btn size="md" type="quiet" label="清除" />
		<div style={{position: 'absolute', left: CART_INSTALL.x - CART.x - 1, top: CART_INSTALL.y - CART.y - 1}}>
			{preparing ? (
				<Btn
					size="md"
					type="colored"
					width={CART_INSTALL.w}
					iconNode={<Spin size={20} color="#fff" deg={spinDeg} />}
					label="正在准备 0/1"
					disabled
				/>
			) : (
				<Btn size="md" type="colored" width={CART_INSTALL.w} icon="plus" label="安装 1 个内容" hover={installHover} press={installPress} />
			)}
		</div>
	</div>
);

/** Modal overlay (NewModal `.modal-overlay.standard`), full window + 5 rem bleed. */
export const ModalScrim: React.FC<{opacity: number}> = ({opacity}) => (
	<div
		style={{
			position: 'absolute',
			left: -80,
			top: -80,
			width: 1440 + 160,
			height: 810 + 160,
			borderRadius: 180,
			opacity,
			background: 'linear-gradient(to bottom, rgba(28, 5, 15, 0.536) 0%, rgba(3, 1, 2, 0.945) 100%)',
		}}
	/>
);

const T = {primary: C.textPrimary, tert: C.textTertiary};

/** 「确认安装」 modal body, local to MODAL (640 × 536). */
export const ConfirmModal: React.FC<{installHover?: number; installPress?: number}> = ({installHover = 0, installPress = 0}) => (
	<div
		style={{
			position: 'relative',
			width: MODAL.w,
			height: MODAL.h,
			boxSizing: 'border-box',
			borderRadius: 16,
			border: `1px solid ${C.divider}`,
			background: C.chrome,
			boxShadow: '4px 4px 26px 10px rgba(0,0,0,0.08)',
			overflow: 'hidden',
		}}
	>
		{/* header: p-6, 24/600, closable circle, 1 px divider */}
		<div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 85, boxSizing: 'border-box', borderBottom: `1px solid ${C.divider}`}}>
			<div style={{position: 'absolute', left: 23, top: 25, fontSize: 24, fontWeight: 600, lineHeight: '32px', color: T.primary}}>确认安装</div>
			<div style={{position: 'absolute', right: 23, top: 23}}>
				<Btn size="md" type="base" circular iconOnly icon="x" />
			</div>
		</div>
		{/* content p-6, gap-4 */}
		<div style={{position: 'absolute', left: 23, top: 108, width: 592, display: 'flex', flexDirection: 'column', gap: 16}}>
			<div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<span style={{fontSize: 16, fontWeight: 600, lineHeight: '20px', color: T.primary}}>已选内容</span>
				<div style={{height: 68, boxSizing: 'border-box', borderRadius: 8, border: `1px solid ${C.control}`, background: C.surface2, padding: 12, display: 'flex', alignItems: 'center', gap: 12}}>
					<InitialTile initials={LI.initials} tint={LI.tint} size={40} ring="transparent" mod="litematica" />
					<div style={{display: 'flex', flexDirection: 'column', gap: 2, flex: 1}}>
						<span style={{fontSize: 16, fontWeight: 600, lineHeight: '20px', color: T.primary}}>投影 (Litematica)</span>
						<span style={{fontSize: 14, lineHeight: '20px', color: T.tert}}>0.26.0 · mod</span>
					</div>
					<div style={{width: 36, height: 36, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="x" size={20} color={C.textDefault} />
					</div>
				</div>
			</div>
			<p style={{margin: 0, fontSize: 16, lineHeight: '24px', color: C.textDefault, whiteSpace: 'nowrap'}}>请确认将在 Vanilla Perfected 中安装 1 个内容 和 1 个前置。</p>
			<div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: T.primary}}>
					前置
					<span style={{borderRadius: 99, background: C.control, padding: '2px 8px', fontSize: 12, fontWeight: 500, lineHeight: '16px', color: T.tert}}>1 个前置</span>
				</span>
				<span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: T.primary}}>
					必要前置
					<span style={{borderRadius: 99, background: C.control, padding: '2px 8px', fontSize: 12, fontWeight: 500, lineHeight: '16px', color: T.tert}}>1</span>
				</span>
				<div style={{height: 90, boxSizing: 'border-box', borderRadius: 12, border: `1px solid ${C.control}`, background: C.surface2, padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12}}>
					<div style={{marginTop: 10}}>
						<CheckBox />
					</div>
					<InitialTile initials="Ma" tint="#9ea3ad" size={40} ring="transparent" mod="malilib" />
					<div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
						<span style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 16, fontWeight: 600, lineHeight: '20px', color: T.primary}}>
							MaLiLib
							<Icon name="chevron-down" size={20} color={T.tert} />
						</span>
						<span style={{fontSize: 14, lineHeight: '20px', color: T.tert}}>0.26.0</span>
						<span style={{fontSize: 14, lineHeight: '20px', color: T.tert}}>被 投影 (Litematica) 需要</span>
					</div>
				</div>
				<span style={{fontSize: 14, lineHeight: '20px', color: T.tert}}>只会安装勾选的前置。</span>
			</div>
		</div>
		{/* actions: p-4, justify-end gap-2 — 取消 (outlined) · 安装 (pink) */}
		<div style={{position: 'absolute', left: MODAL_CANCEL.x - MODAL.x - 1, top: MODAL_CANCEL.y - MODAL.y - 1}}>
			<Btn size="md" type="outlined" label="取消" width={MODAL_CANCEL.w} style={{border: `1px solid ${C.divider}`, color: T.primary}} />
		</div>
		<div style={{position: 'absolute', left: MODAL_INSTALL.x - MODAL.x - 1, top: MODAL_INSTALL.y - MODAL.y - 1}}>
			<Btn size="md" type="colored" label="安装" width={MODAL_INSTALL.w} hover={installHover} press={installPress} />
		</div>
	</div>
);

/** Download toast, local to TOAST (420 × 125). `p` = bottom bar fill 0..1. */
export const DownloadToast: React.FC<{p: number; counter: string}> = ({p, counter}) => (
	<div
		style={{
			position: 'relative',
			width: TOAST.w,
			height: TOAST.h,
			boxSizing: 'border-box',
			borderRadius: 20,
			border: `1px solid ${C.divider}`,
			background: C.chrome,
			boxShadow: SHADOW.toast,
			overflow: 'hidden',
		}}
	>
		<div style={{position: 'absolute', left: 15, top: 15}}>
			<InitialTile initials={LI.initials} tint={LI.tint} size={44} r={12} mod="litematica" />
		</div>
		<div style={{position: 'absolute', left: 71, top: 15, width: 318, fontSize: 18, fontWeight: 600, lineHeight: '24px', color: T.primary, whiteSpace: 'nowrap'}}>投影 (Litematica)</div>
		<div style={{position: 'absolute', right: 15, top: 15, width: 24, height: 24, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Icon name="x" size={16} color={C.textDefault} />
		</div>
		<div style={{position: 'absolute', left: 71, top: 42, width: 318, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
			<span style={{fontSize: 16, lineHeight: '20px', color: 'rgba(26,32,44,0.85)'}}>正在下载内容</span>
			<span style={{fontSize: 12, color: T.tert, fontVariantNumeric: 'tabular-nums'}}>{counter}</span>
		</div>
		<div style={{position: 'absolute', left: 70, top: 70}}>
			<Btn size="md" type="colored" color="red" icon="x" label="取消" />
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(245,245,245,0.5)', overflow: 'hidden'}}>
			<div style={{width: `${Math.max(0, Math.min(1, p)) * 100}%`, height: '100%', background: C.brand}} />
		</div>
	</div>
);
