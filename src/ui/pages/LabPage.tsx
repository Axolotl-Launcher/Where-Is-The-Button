/**
 * 实验室 index (pages/Lab.vue, v1.9.7) in a 1440 × 810 window, light + pink,
 * right panel collapsed. Window coordinates: main p-6 gap-6 → content x 88–1416;
 * h1 y 72–104, 「6 个工具」 y 108–128, filter row y 152–188 (search 88–1016,
 * comboboxes 1024–1216 / 1224–1416), cards from y 212 every 158 (146 tall).
 * Card k: cover 224×112 at (105, y+17); text column x 345; 「› 进入」 80×32 at
 * x 1319–1399, y+97…+129 (种子地图 = card 2 → 1319–1399 × 625–657, centre
 * (1359, 641) = the M4→M5 trapdoor). Bible §4.5, report 06 §2,
 * mock research/_scratch/06-mock-lab-index-current.png.
 */
import React, {CSSProperties} from 'react';
import {staticFile} from 'remotion';
import {C} from '../../theme/tokens';
import {Icon} from '../Icon';
import {Btn, SearchField, Tag} from '../kit';
import {AppWindow} from '../shell/AppWindow';

export type LabTool = {id: string; title: string; desc: string; tag: string; cover: string};

/** Registry order (pages/Lab.vue + lab/registry.ts), verbatim zh-CN. */
export const LAB_TOOLS: LabTool[] = [
	{id: 'skin-editor', title: '皮肤编辑器', desc: '在本地创建和编辑 Minecraft 玩家皮肤。', tag: '创作', cover: 'skin-editor-tool-cover.png'},
	{id: 'gradient-text', title: '渐变文字生成器', desc: '无需浏览器即可创建适用于 Minecraft 的渐变文字。', tag: '创作', cover: 'gradient-text-tool-cover.png'},
	{id: 'seed-map', title: '种子地图', desc: '在本地查看 Minecraft 种子的群系、结构和保存的标记。', tag: '世界', cover: 'seed-map-tool-cover.png'},
	{id: 'schematic-preview', title: '投影工坊', desc: '快速预览、编辑你的投影', tag: '创作', cover: 'schematic-preview-cover.png'},
	{id: 'mod-translation', title: '模组翻译', desc: '把任意 Minecraft 模组 JAR 翻译成简体中文。', tag: '维护', cover: 'mod-translation-cover.png'},
	{id: 'recipe-generator', title: '配方生成器', desc: '轻易地修改合成表，自定义配方，生成数据包。', tag: '创作', cover: 'recipe-generator-tool-cover.png'},
];

/** Layout (window coordinates). */
export const LAB = {
	x: 88,
	w: 1328,
	cardTop: (k: number) => 212 + 158 * k,
	cardH: 146,
	enter: (k: number) => ({x: 1319, y: 212 + 158 * k + 97, w: 80, h: 32, cx: 1359, cy: 212 + 158 * k + 113}),
	seedMap: 2,
} as const;

export type LabContentProps = {
	/** Card hover (border #ddd + brightness 1.05) per card index. */
	cardHover?: Partial<Record<number, number>>;
	enterHover?: Partial<Record<number, number>>;
	enterPress?: Partial<Record<number, number>>;
	/** Card indices whose 「› 进入」 is drawn elsewhere (lifted out as a 3D flap). */
	enterHidden?: number[];
	style?: CSSProperties;
};

const abs = (x: number, y: number, w?: number, h?: number, extra?: CSSProperties): CSSProperties => ({
	position: 'absolute',
	left: x,
	top: y,
	width: w,
	height: h,
	boxSizing: 'border-box',
	...extra,
});

/** The pink sm 「› 进入」 (Button colored sm, min-w-20 justify-between px-3). */
export const EnterButton: React.FC<{hover?: number; press?: number}> = ({hover = 0, press = 0}) => (
	<Btn
		size="sm"
		type="colored"
		icon="chevron-right"
		label="进入"
		width={80}
		hover={hover}
		press={press}
		justify="space-between"
		style={{padding: '0 12px'}}
	/>
);

const Combo: React.FC<{x: number; label: string}> = ({x, label}) => (
	<div
		style={abs(x, 152, 192, 36, {
			borderRadius: 12,
			background: C.control,
			padding: '0 16px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			fontSize: 16,
			fontWeight: 600,
			lineHeight: '20px',
			color: C.textDefault,
		})}
	>
		{label}
		<Icon name="chevron-down" size={20} color={C.textDefault} />
	</div>
);

const ToolCard: React.FC<{k: number; t: LabTool; hover?: number; enterHover?: number; enterPress?: number; enterHidden?: boolean}> = ({
	k,
	t,
	hover = 0,
	enterHover = 0,
	enterPress = 0,
	enterHidden,
}) => {
	const y = LAB.cardTop(k);
	return (
		<div
			style={abs(LAB.x, y, LAB.w, LAB.cardH, {
				borderRadius: 16,
				background: C.chrome,
				border: `1px solid ${hover > 0.5 ? C.divider : C.control}`,
				filter: hover > 0 ? `brightness(${1 + 0.05 * hover})` : undefined,
			})}
		>
			{/* star (absolute right-4 top-4, 32 × 32, StarIcon 20 tertiary) */}
			<div style={abs(LAB.w - 2 - 16 - 32, 16, 32, 32, {display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
				<Icon name="star" size={20} color={C.textTertiary} />
			</div>
			{/* cover 224 × 112, r 16 */}
			<div style={abs(16, 16, 224, 112, {borderRadius: 16, overflow: 'hidden', background: C.surface2})}>
				<img src={staticFile(`images/lab/${t.cover}`)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
			</div>
			{/* text column (bottom-aligned): title 18/700 lh 22.5, desc 14/20, row pt 16 */}
			<div style={abs(256, 16 + 112 - 94.5, LAB.w - 2 - 256 - 16, 94.5)}>
				<div style={{fontSize: 18, fontWeight: 700, lineHeight: '22.5px', color: C.textPrimary, paddingRight: 40, whiteSpace: 'nowrap'}}>{t.title}</div>
				<div style={{marginTop: 4, fontSize: 14, lineHeight: '20px', color: C.textTertiary, whiteSpace: 'nowrap'}}>{t.desc}</div>
			</div>
			<div style={abs(256, 16 + 112 - 32 + 4, 120, 24)}>
				<Tag>{t.tag}</Tag>
			</div>
			{!enterHidden ? (
				<div style={abs(LAB.w - 2 - 16 - 80, 16 + 112 - 32)}>
					<EnterButton hover={enterHover} press={enterPress} />
				</div>
			) : null}
		</div>
	);
};

/** Page content in window coordinates (only the cards that reach into the 810 px window are rendered). */
export const LabContent: React.FC<LabContentProps> = ({cardHover = {}, enterHover = {}, enterPress = {}, enterHidden = [], style}) => (
	<div style={{position: 'absolute', inset: 0, ...style}}>
		<div style={abs(LAB.x, 72, 600, 32, {fontSize: 24, fontWeight: 700, lineHeight: '32px', color: C.textPrimary})}>实验室</div>
		<div style={abs(LAB.x, 108, 600, 20, {fontSize: 14, lineHeight: '20px', color: C.textTertiary})}>6 个工具</div>
		<div style={abs(LAB.x, 152)}>
			<SearchField w={928} h={36} placeholder="搜索工具" />
		</div>
		<Combo x={1024} label="全部工具" />
		<Combo x={1224} label="全部" />
		{LAB_TOOLS.map((t, k) =>
			LAB.cardTop(k) < 810 ? (
				<ToolCard
					key={t.id}
					k={k}
					t={t}
					hover={cardHover[k]}
					enterHover={enterHover[k]}
					enterPress={enterPress[k]}
					enterHidden={enterHidden.includes(k)}
				/>
			) : null,
		)}
	</div>
);

/** Rest window of floor F4 (tower wides): 实验室 pill pink, breadcrumb 实验室. */
export const LabWindow: React.FC<{frame?: number}> = () => (
	<AppWindow nav="lab" breadcrumb={{icon: 'flask-conical', text: '实验室'}} panel={false} frame={false}>
		<LabContent />
	</AppWindow>
);
