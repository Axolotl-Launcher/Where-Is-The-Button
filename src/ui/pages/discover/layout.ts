/**
 * 发现内容 `/browse/mod` (target Vanilla Perfected, right panel forced open)
 * geometry in WINDOW coordinates of the 1440 × 810 window (bible §4.3,
 * report 04 §3–§7, mock scene-b). Every box the film's characters touch is
 * fixed here so the page DOM and the scene agree to the pixel.
 */
import {MOD_ICONS, ModId} from '../../ModIcon';

export const PANEL_X = 1140; // right panel (300) left edge
export const WELL = {x: 64, y: 48, r: 1140};
export const GUTTER = 16; // scrollbar-gutter: stable

/** Sticky toolbar (full-bleed, #ebebeb, 1 px #ddd bottom). */
export const TOOLBAR = {x: 64, y: 48, w: 1060, h: 220}; // bottom border at y 268
export const TABS = {x: 76, y: 61, w: 574, h: 46};
export const TRANSLATE = {x: 1018, y: 60, w: 94, h: 48};
/** StyledInput search field (48 tall, r 12). */
export const FIELD = {x: 76, y: 120, w: 708, h: 48, r: 12};
export const FIELD_ICON = {x: FIELD.x + 12, y: FIELD.y + 14, s: 20}; // SearchIcon slot
export const FIELD_TEXT_X = FIELD.x + 40; // padding-left 40
export const FIELD_CLEAR = {x: FIELD.x + FIELD.w - 2 - 8 - 20, y: FIELD.y + 14, s: 20};
export const INSTANCE_BTN = {x: 792, y: 126, w: 198, h: 36};
export const SOURCE_BTN = {x: 998, y: 126, w: 114, h: 36};
export const SORT_ROW_Y = 180; // 40 tall
export const PILLS_Y = 232; // 24 tall

/** Results list: x 88–1100 (1012), first card at y 281, 142 tall, gap 12. */
export const RESULTS = {x: 88, y: 281, w: 1012};
export const CARD_H = 142;
export const CARD_GAP = 12;
export const cardY = (i: number) => RESULTS.y + i * (CARD_H + CARD_GAP);
export const cardBox = (i: number) => ({x: RESULTS.x, y: cardY(i), w: RESULTS.w, h: CARD_H});

export type InstallState = 'install' | 'selected' | 'installed' | 'installing';

/** Install button (md outlined) — right edge at card x + 952, top at card y + 16. */
export const INSTALL_W: Record<InstallState, number> = {install: 80, selected: 96, installed: 96, installing: 128};
export const installBox = (i: number, s: InstallState) => {
	const right = RESULTS.x + 952;
	return {x: right - INSTALL_W[s], y: cardY(i) + 16, w: INSTALL_W[s], h: 36};
};

/** Card data: plausible stand-ins (bilingual titles from the MC百科 dictionary). */
export type CardData = {
	title: string;
	initials: string;
	tile: string; // neutral tile tint
	mod?: ModId; // real icon (public/images/mods)
	summary: string;
	downloads: string;
	updated: string;
	tags: string[];
	state: InstallState;
};

export const CARDS: CardData[] = [
	{
		title: '钠 (Sodium)',
		initials: 'Na',
		tile: '#8f9aa8',
		mod: 'sodium',
		summary: MOD_ICONS
			? 'A high-performance rendering engine replacement for Minecraft, which greatly improves frame rates and reduces micro-stutter.'
			: 'A modern rendering engine for Minecraft that greatly improves frame rates and fixes many graphical issues.',
		downloads: MOD_ICONS ? '238.13M' : '74.62M',
		updated: '3天前',
		tags: ['优化'],
		state: 'installed',
	},
	{
		title: '投影 (Litematica)',
		initials: 'Li',
		tile: '#93a39c',
		mod: 'litematica',
		summary: MOD_ICONS
			? 'A client-side schematic mod with extra features for creative mode work'
			: 'A client-side schematic mod: save, load and place building plans right inside your world.',
		downloads: MOD_ICONS ? '26.32M' : '19.84M',
		updated: '2周前',
		tags: ['实用'],
		state: 'install',
	},
	{
		title: 'Fabric API',
		initials: 'FA',
		tile: '#a89c8f',
		mod: 'fabric-api',
		summary: MOD_ICONS
			? 'Lightweight and modular API providing common hooks and intercompatibility measures utilized by mods using the Fabric toolchain.'
			: 'Lightweight, modular hooks and compatibility layers shared by mods built on the Fabric toolchain.',
		downloads: MOD_ICONS ? '269.85M' : '112.35M',
		updated: '昨天',
		tags: ['库'],
		state: 'installed',
	},
	{
		title: '模组菜单 (Mod Menu)',
		initials: 'MM',
		tile: '#a297a8',
		mod: 'modmenu',
		summary: MOD_ICONS
			? 'Adds a mod menu to view the list of mods you have installed.'
			: 'Adds a menu that lists the mods you have installed, with their descriptions and settings.',
		downloads: MOD_ICONS ? '150.84M' : '63.08M',
		updated: '上周',
		tags: ['实用'],
		state: 'install',
	},
];

/** Loading state (spinner row + list skeletons). */
export const LOADING_ROW_Y = 285; // 20 tall, centred on x 594
export const SKELETON_Y0 = 317;
export const SKELETON_H = 134;
export const COLUMN_CX = RESULTS.x + RESULTS.w / 2; // 594

/** Compact EmptyState (py-8 section, 40 px chip, 18/600 title, 14 text, base md button). */
export const EMPTY = {
	chip: {x: COLUMN_CX - 20, y: 329, s: 40},
	titleY: 377, // 32 line
	textY: 417, // 24 line
	button: {x: COLUMN_CX - 43, y: 457, w: 86, h: 36},
};

/** Floating cart bar (fixed bottom between rail and panel, max-width 60vw = 864). */
export const CART = {x: 170, y: 736, w: 864, h: 58};
export const CART_INSTALL = {x: 875, y: 747, w: 146, h: 36};

/** 「确认安装」 modal (40rem), centred in the window. */
export const MODAL = {x: 400, y: 137, w: 640, h: 536};
export const MODAL_INSTALL = {x: 969, y: 620, w: 54, h: 36};
export const MODAL_CANCEL = {x: 907, y: 620, w: 54, h: 36};

/** Download toast (popup group: top 72, right 24, 420 wide). */
export const TOAST = {x: 996, y: 72, w: 420, h: 125};
export const TOAST_BAR = {x: 997, y: 192, w: 418, h: 4};

/** Nav rail bits (window coords). */
export const NAV_DOWNLOAD_BADGE = {x: 40, y: 440, w: 16, h: 16};
export const QUICK1 = {x: 8, y: 513, s: 48, cx: 32, cy: 537};
