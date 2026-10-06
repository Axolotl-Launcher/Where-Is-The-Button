/**
 * Module registry: each module file exports its component (or null while it
 * is a stub). Frame 0 of each component = the module's start (src/film/timeline.ts).
 */
import React from 'react';
import {ModuleId} from '../film/timeline';
import {M1} from './M1';
import {M2} from './M2';
import {M3} from './M3';
import {M4} from './M4';
import {M5} from './M5';
import {M6} from './M6';
import {M7} from './M7';
import {M8} from './M8';
import {M9} from './M9';

const all: Record<ModuleId, React.FC | null> = {M1, M2, M3, M4, M5, M6, M7, M8, M9};
export const SCENES: Partial<Record<ModuleId, React.FC>> = Object.fromEntries(
	Object.entries(all).filter(([, v]) => v != null),
) as Partial<Record<ModuleId, React.FC>>;
