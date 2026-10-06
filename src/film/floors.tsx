/**
 * Registry of each floor's full window in a calm "rest" state, used by every
 * shot that shows other floors (tower wides, the 层间距 collapse, glimpses
 * through holes). Each entry is the page engineer's real window component.
 */
import React from 'react';
import {FloorKey} from './timeline';
import {HomeWindow} from '../scenes/home/HomeFloor';
import {DiscoverWindow} from '../ui/pages/Discover';
import {InstanceWindow} from '../ui/pages/InstancePage';
import {LabWindow} from '../ui/pages/LabPage';
import {SeedMapWindow} from '../ui/pages/SeedMap';
import {WorkshopWindow} from '../ui/pages/Workshop';

/** Home at rest (hero in place). Shots that need the empty socket use HomeFloor directly. */
export const HomeRestWindow: React.FC = () => <HomeWindow />;

export const FLOOR_WINDOWS: Record<FloorKey, React.FC> = {
	home: HomeRestWindow,
	discover: () => <DiscoverWindow />,
	instance: () => <InstanceWindow lite="off" />,
	lab: () => <LabWindow />,
	seedmap: () => <SeedMapWindow />,
	workshop: () => <WorkshopWindow state="empty" />,
};
