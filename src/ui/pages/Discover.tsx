/**
 * 发现内容 · `/browse/mod` with target instance Vanilla Perfected and the right
 * panel forced open (bible §4.3, report 04, mock research/_scratch/04-browse/
 * scene-b). The page is split so the film can lift parts to their real
 * elevations: `DiscoverFloor` is the flat floor DOM (shell + toolbar +
 * results states + filter panel), cards / cart bar / modal / toast live in
 * `discover/*` and are mounted by the scene. `DiscoverWindow` is the calm
 * rest state (cards inline) for the tower wides.
 */
import React from 'react';
import {SHELL} from '../../theme/tokens';
import {C} from '../../theme/tokens';
import {ContentWell, TitleBar} from '../shell/AppWindow';
import {CARDS, cardY, RESULTS} from './discover/layout';
import {CardFx, EmptyResults, LoadingResults, ResultCardFace, ScrollThumb} from './discover/Results';
import {BrowsePanel, NavRailX, NavRailXProps} from './discover/Shell';
import {FieldState, Toolbar} from './discover/Toolbar';
import {navY} from '../shell/AppWindow';

export type DiscoverResultsState = {
	/** Loading row + skeletons opacity. */
	loading?: number;
	/** Empty state opacity. */
	empty?: number;
	emptyHover?: number;
	emptyPress?: number;
	/** Scrollbar thumb (long result list) opacity. */
	thumb?: number;
	/** Cards drawn inline (flat) — only for rest windows / stills. */
	cards?: {opacity: number; dy: number; fx?: CardFx[]} | null;
};

export type DiscoverFloorState = {
	field: FieldState;
	results: DiscoverResultsState;
	nav: NavRailXProps;
	frame: number;
	/** Opacity of the page content inside the well (navigation fade-out). */
	content?: number;
};

export const DISCOVER_NAV: NavRailXProps = {slider: {top: navY(2), bottom: navY(2) + 48, white: 0}};

export const DISCOVER_REST: DiscoverFloorState = {
	field: {},
	results: {thumb: 1, cards: {opacity: 1, dy: 0}},
	nav: DISCOVER_NAV,
	frame: 0,
};

/** Cards inline (flat) — used by the rest window. */
const InlineCards: React.FC<{opacity: number; dy: number; fx?: CardFx[]}> = ({opacity, dy, fx}) => (
	<>
		{CARDS.map((d, i) =>
			cardY(i) < SHELL.winH ? (
				<div key={d.title} style={{position: 'absolute', left: RESULTS.x, top: cardY(i) + dy, opacity}}>
					<ResultCardFace d={d} fx={fx?.[i]} />
				</div>
			) : null,
		)}
	</>
);

/** The whole Discover window as flat DOM (1440 × 810), panel open. */
export const DiscoverFloor: React.FC<{s: DiscoverFloorState}> = ({s}) => {
	const r = s.results;
	const content = s.content ?? 1;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: SHELL.winW, height: SHELL.winH, background: C.chrome, overflow: 'hidden'}}>
			<TitleBar breadcrumb={{icon: 'compass', text: '发现内容'}} />
			<NavRailX {...s.nav} />
			<ContentWell right={SHELL.panelW}>
				<div style={{position: 'absolute', inset: 0, opacity: content}}>
					{(r.loading ?? 0) > 0.001 ? <LoadingResults frame={s.frame} opacity={r.loading} /> : null}
					{(r.empty ?? 0) > 0.001 ? <EmptyResults opacity={r.empty} buttonHover={r.emptyHover} buttonPress={r.emptyPress} /> : null}
					{r.cards ? <InlineCards {...r.cards} /> : null}
					<Toolbar field={s.field} />
					{(r.thumb ?? 0) > 0.001 ? <ScrollThumb opacity={r.thumb} /> : null}
				</div>
			</ContentWell>
			<BrowsePanel />
		</div>
	);
};

/** Rest state of the Discover floor for the tower wides (M2, M6/M7): default results, no characters. */
export const DiscoverWindow: React.FC<{frame?: number}> = ({frame = 0}) => <DiscoverFloor s={{...DISCOVER_REST, frame}} />;
