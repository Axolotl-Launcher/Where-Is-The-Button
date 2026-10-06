/**
 * Axolotl Launcher design tokens (v1.9.7, light theme + default pink accent),
 * transcribed from the product source — see research/PRODUCT_BIBLE.md §2.
 * Nothing here is invented: when the film needs a value the product does
 * not define (slab side colours, stage background) it is marked FILM.
 */
export const C = {
	// Surfaces (light)
	well: '#ebebeb', // --surface-1: content well / page floor
	rowOdd: '#ededed', // --surface-1-5
	surface2: '#f5f5f5', // list rows, toolbar cards
	selectedRow: '#eef1f5',
	chrome: '#f8f8f8', // --surface-3: title bar, nav rail, cards, menus, tooltips
	control: '#ffffff', // --surface-4: inputs, base buttons, card hairline
	divider: '#dddddd', // --surface-5
	// Text
	textPrimary: '#1a202c',
	textDefault: '#2c2e31',
	textTertiary: '#484d54',
	// Brand
	brand: '#db2777',
	brandHover: '#c5236b',
	brandRing: 'rgba(219, 39, 119, 0.68)', // 4px focus ring
	brandHairline: 'rgba(219, 39, 119, 0.30)',
	brandTint: 'rgba(219, 39, 119, 0.25)',
	brandTintOnWhite: '#f6c9dd',
	brandTintOnChrome: '#f1c4d8',
	brandBorder16: 'rgba(219, 39, 119, 0.16)',
	panelTop: '#ead9e1', // right panel brand wash (top)
	panelBottom: '#e9d0db',
	pink700: '#be185d',
	pink800: '#9d174d',
	// Semantic
	red: '#cb2245',
	green: '#00af5c',
	orange: '#e08325',
	blue: '#1f68c0',
	purple: '#8e32f3',
	gray: '#595b61',
	scrollbar: '#96a2b0',
	// Calendar heat ramp
	heat: ['#fdc9d7', '#f7a2bb', '#ee769e', '#db2777'],
	// macOS traffic lights (measured on the reference screenshot)
	macRed: '#ff5c60',
	macYellow: '#f8c800',
	macGreen: '#37c75c',
	// Workshop (投影工坊) stage
	wsBg: '#0a0a0a',
	wsGrid: '#404040',
	wsGridMajor: '#6b6b6b',
	wsRegion: '#58736a',
	wsGlass: 'rgba(235, 235, 235, 0.9)',
	// Seed map
	markerDefault: '#22C55E',
	markerLabelBg: 'rgba(20, 22, 26, 0.86)',
	ruler: '#F2B84B',
	// FILM: slab side faces use each surface's next-darker product value
	sideWhite: '#e6e6e6',
	sideChrome: '#dfdfdf',
	sideWell: '#d4d4d4',
	sidePink: '#c5236b',
	sidePinkDeep: '#be185d',
} as const;

/** Product shadows (bible §2.4). */
export const SHADOW = {
	card: 'rgba(50, 50, 100, 0.1) 0 2px 4px',
	control: 'inset 0 0 0 1px #dddddd, 0 1px 1px rgba(0, 0, 0, 0.12)',
	coloured:
		'0 0 0 1px rgba(219, 39, 119, 0.3), 0 2px 4px rgba(0, 0, 0, 0.04), 0 5px 8px rgba(0, 0, 0, 0.04), 0 10px 18px rgba(0, 0, 0, 0.03), 0 24px 48px rgba(0, 0, 0, 0.03)',
	xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
	toast: '0 4px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.2)',
	menu: '3px 3px 0.8rem rgba(0, 0, 0, 0.3)',
	tooltip: 'drop-shadow(2px 2px 0.4rem rgba(0, 0, 0, 0.5))',
	wellInset: 'inset 1px 1px 15px rgba(0, 0, 0, 0.1)',
	cartBar: '0 1px 3px rgba(0, 0, 0, 0.3), 0 6px 10px rgba(0, 0, 0, 0.15)',
	floating: '0 8px 20px rgba(0, 0, 0, 0.28)',
} as const;

/** Radii (bible §2.3). Buttons follow r ≈ h / 3. */
export const R = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	button: {24: 8, 28: 8, 32: 10, 36: 12, 40: 14, 48: 16} as Record<number, number>,
} as const;

/** Shell metrics (bible §4.1), CSS px of a 1440 × 810 window. */
export const SHELL = {
	winW: 1440,
	winH: 810,
	titleH: 48,
	railW: 64,
	panelW: 300,
	navBtn: 48,
	navPitch: 56,
	wellRadius: 20,
	macInset: 80,
	windowRadius: 18,
} as const;

/** Product motion vocabulary as cubic-bezier control points. */
export const EASE = {
	ui: [0, 0, 0.2, 1],
	standard: [0.4, 0, 0.2, 1],
	settle: [0.22, 1, 0.36, 1],
	reveal: [0.16, 1, 0.3, 1],
	spring: [0.15, 1.4, 0.64, 0.96],
	pop: [0.34, 1.56, 0.64, 1],
	regroup: [0.2, 0.8, 0.2, 1],
} as const;

export const FONT = {
	ui: `Inter, 'Noto Sans SC', -apple-system, 'Segoe UI', sans-serif`,
	mono: `ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`,
} as const;
