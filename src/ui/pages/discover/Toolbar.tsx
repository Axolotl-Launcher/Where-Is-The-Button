/**
 * Browse sticky toolbar (BrowsePageLayout `browse-toolbar-chrome`): NavTabs +
 * 翻译 · search StyledInput + instance button + 所有来源 · sort row ·
 * locked filter pills. Rendered in window coordinates inside the well.
 */
import React from 'react';
import {C, SHADOW} from '../../../theme/tokens';
import {Icon} from '../../Icon';
import {Btn, NavTabs} from '../../kit';
import {Combo, InstanceIcon, LockedPill, Pagination} from './parts';
import {FIELD, FIELD_CLEAR, FIELD_ICON, FIELD_TEXT_X, INSTANCE_BTN, PILLS_Y, SORT_ROW_Y, SOURCE_BTN, TABS, TOOLBAR, TRANSLATE} from './layout';

export const BROWSE_TABS = ['整合包', '模组', '资源包', '数据包', '地图', '光影包', '服务器', '收藏夹'].map((label) => ({label}));

export type FieldState = {
	/** Real focus visuals (text colour, placeholder 80 %). The 4 px ring is drawn by the scene (the hero). */
	focused?: number;
	/** Real focus ring amount (only when the hero is not the ring). */
	ring?: number;
	text?: string;
	/** Inline IME composition (underlined). */
	composition?: string;
	caret?: boolean;
	/** The hero's ▷ occupies the icon slot: hide the SearchIcon. */
	iconHidden?: boolean;
	/** ✕ clear button (appears with text). */
	clear?: boolean;
};

const abs = (x: number, y: number, extra?: React.CSSProperties): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

export const SearchFieldX: React.FC<{s: FieldState}> = ({s}) => {
	const focused = (s.focused ?? 0) > 0.5;
	const hasText = !!(s.text || s.composition);
	return (
		<div
			style={abs(FIELD.x, FIELD.y, {
				width: FIELD.w,
				height: FIELD.h,
				borderRadius: FIELD.r,
				background: C.control,
				boxShadow: (s.ring ?? 0) > 0 ? `0 0 0 ${4 * (s.ring ?? 0)}px ${C.brandRing}` : undefined,
			})}
		>
			{s.iconHidden ? null : (
				<div style={abs(FIELD_ICON.x - FIELD.x, FIELD_ICON.y - FIELD.y, {opacity: focused ? 1 : 0.6})}>
					<Icon name="search" size={20} color={focused ? C.textPrimary : C.textTertiary} />
				</div>
			)}
			<div
				style={abs(FIELD_TEXT_X - FIELD.x, 12, {
					height: 24,
					display: 'flex',
					alignItems: 'center',
					fontSize: 16,
					fontWeight: 500,
					lineHeight: '24px',
					color: focused ? C.textPrimary : C.textDefault,
					whiteSpace: 'nowrap',
				})}
			>
				{s.caret && !hasText ? <Caret /> : null}
				{hasText ? (
					<>
						{s.text ? <span>{s.text}</span> : null}
						{s.composition ? (
							<span style={{textDecoration: 'underline', textDecorationThickness: 1, textUnderlineOffset: 3, textDecorationColor: C.textPrimary}}>{s.composition}</span>
						) : null}
						{s.caret ? <Caret /> : null}
					</>
				) : (
					<span style={{color: C.textTertiary, opacity: focused ? 0.8 : 0.6}}>搜索模组……</span>
				)}
			</div>
			{s.clear && hasText ? (
				<div style={abs(FIELD_CLEAR.x - FIELD.x, FIELD_CLEAR.y - FIELD.y)}>
					<Icon name="x" size={20} color={C.textTertiary} />
				</div>
			) : null}
		</div>
	);
};

const Caret: React.FC = () => <span style={{display: 'inline-block', width: 1.5, height: 20, background: C.textPrimary, marginLeft: 1, flexShrink: 0}} />;

export const Toolbar: React.FC<{field: FieldState}> = ({field}) => (
	<>
		{/* full-bleed chrome: #ebebeb with the 1 px #ddd bottom line */}
		<div style={abs(TOOLBAR.x, TOOLBAR.y, {width: TOOLBAR.w, height: TOOLBAR.h, background: C.well, borderBottom: `1px solid ${C.divider}`, borderTopLeftRadius: 20, borderTopRightRadius: 20})} />
		<div style={abs(TABS.x, TABS.y)}>
			<NavTabs tabs={BROWSE_TABS} active={1} />
		</div>
		<div style={abs(TRANSLATE.x, TRANSLATE.y)}>
			<Btn size="xl" type="quiet" icon="languages" label="翻译" width={TRANSLATE.w} />
		</div>
		<SearchFieldX s={field} />
		{/* Button md base: [instance icon 20] Vanilla Perfected [ChevronDown 16] */}
		<div
			style={abs(INSTANCE_BTN.x, INSTANCE_BTN.y, {
				width: INSTANCE_BTN.w,
				height: INSTANCE_BTN.h,
				boxSizing: 'border-box',
				borderRadius: 12,
				background: C.control,
				boxShadow: SHADOW.control,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 8,
				fontSize: 16,
				fontWeight: 500,
				lineHeight: '20px',
				color: C.textPrimary,
				whiteSpace: 'nowrap',
			})}
		>
			<InstanceIcon size={20} r={3.33} />
			<span>Vanilla Perfected</span>
			<Icon name="chevron-down" size={16} color={C.textTertiary} />
		</div>
		<div style={abs(SOURCE_BTN.x, SOURCE_BTN.y)}>
			<Btn size="md" type="base" width={SOURCE_BTN.w} icon="globe" label="所有来源" style={{gap: 8}} />
		</div>
		<div style={abs(76, SORT_ROW_Y)}>
			<Combo icon="arrow-up-down" label="相关性" width={138} />
		</div>
		<div style={abs(222, SORT_ROW_Y)}>
			<Combo icon="eye" label="20" width={108} />
		</div>
		<div style={abs(338, SORT_ROW_Y + 2)}>
			<Btn size="md" type="base" circular iconOnly icon="list" />
		</div>
		<div style={abs(896, SORT_ROW_Y + 2)}>
			<Pagination />
		</div>
		<div style={abs(76, PILLS_Y, {display: 'flex', gap: 4})}>
			<LockedPill label="26.2" />
			<LockedPill label="Fabric" />
		</div>
	</>
);
