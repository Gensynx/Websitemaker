/**
 * The catalogue's configurations: every door style, panel detail and
 * surround, and every window preset, at each one's suggested size.
 *
 * Shared by scripts/catalogue.ts, which publishes them, and by the tests that
 * must hold for everything the catalogue shows (e.g. no window handle on the
 * glass), so the two cannot list different things.
 */

import { DEFAULT_DOOR, DEFAULT_WINDOW } from './defaults';
import type { ConfigState, DoorConfigState, PanelDetail, WindowConfigState } from './types';
import { NO_BARS } from './types';
import { WINDOW_PRESETS } from './windowPresets';

export interface CatalogueTile {
  label: string;
  config: ConfigState;
}

const panelDetails: Array<[string, PanelDetail]> = [
  ['Flush', { kind: 'flush' }],
  ['1 raised panel', { kind: 'raised', panels: 1, moulding: 'ovolo' }],
  ['2 raised panels', { kind: 'raised', panels: 2, moulding: 'ovolo' }],
  ['3 raised panels', { kind: 'raised', panels: 3, moulding: 'ovolo' }],
  ['4 raised panels', { kind: 'raised', panels: 4, moulding: 'ovolo' }],
  ['Grooved, horizontal', { kind: 'grooved', grooves: 5, grooveWidth: 18, orientation: 'horizontal' }],
  ['Grooved, vertical', { kind: 'grooved', grooves: 4, grooveWidth: 18, orientation: 'vertical' }],
];

const aperture = { shape: 'rectangular' as const, inset: 120, bars: { ...NO_BARS }, safety: null };
const sideLight = { width: 400, bars: { style: 'applied-astragal' as const, columns: 1, rows: 4, barWidth: 22 }, safety: null };
const topLight = { height: 350, shape: 'rectangular' as const, bars: { ...NO_BARS }, safety: null };
const safe = { ...DEFAULT_DOOR.glazing, safety: 'toughened' as const };

const doorStyles: CatalogueTile[] = [
  { label: 'Solid panel', config: DEFAULT_DOOR },
  {
    label: 'Half glazed',
    config: {
      ...DEFAULT_DOOR,
      glazing: safe,
      style: { id: 'half-glazed', options: { glazedFraction: 0.45, aperture, panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' } } },
    } satisfies DoorConfigState,
  },
  {
    label: 'Full glazed',
    config: { ...DEFAULT_DOOR, glazing: safe, style: { id: 'full-glazed', options: { aperture } } } satisfies DoorConfigState,
  },
];

const doorPanels: CatalogueTile[] = panelDetails.map(([label, panelDetail]) => ({
  label,
  config: { ...DEFAULT_DOOR, style: { id: 'solid-panel', options: { panelDetail } } } satisfies DoorConfigState,
}));

const wide = { width: 1450, height: 2100 };
const wider = { width: 1850, height: 2100 };
const doorSurrounds: CatalogueTile[] = [
  { label: 'No surround', config: DEFAULT_DOOR },
  {
    label: 'One side light',
    config: { ...DEFAULT_DOOR, dimensions: wide, glazing: safe, surround: { ...DEFAULT_DOOR.surround, leftSideLight: sideLight } } satisfies DoorConfigState,
  },
  {
    label: 'Two side lights',
    config: { ...DEFAULT_DOOR, dimensions: wider, glazing: safe, surround: { leftSideLight: sideLight, rightSideLight: sideLight, topLight: null } } satisfies DoorConfigState,
  },
  {
    label: 'Top light',
    config: { ...DEFAULT_DOOR, dimensions: { width: 900, height: 2350 }, glazing: safe, surround: { ...DEFAULT_DOOR.surround, topLight } } satisfies DoorConfigState,
  },
  {
    label: 'Two side lights and a top light',
    config: { ...DEFAULT_DOOR, dimensions: { width: 1850, height: 2400 }, glazing: safe, surround: { leftSideLight: sideLight, rightSideLight: sideLight, topLight } } satisfies DoorConfigState,
  },
];

const windows: CatalogueTile[] = WINDOW_PRESETS.map((preset) => ({
  label: preset.label,
  config: { ...DEFAULT_WINDOW, dimensions: preset.suggestedSize, style: preset.expand() } satisfies WindowConfigState,
}));

export const CATALOGUE: ReadonlyArray<{ title: string; note: string; tiles: CatalogueTile[] }> = [
  { title: 'Door styles', note: 'Step 6.1. Side lights and top lights are shown separately below.', tiles: doorStyles },
  {
    title: 'Door panel detailing',
    note: 'Step 6.2. Raised panels stand proud of the leaf; grooves are the leaf showing between slabs, because a routed groove is an absence and cannot be added as a box.',
    tiles: doorPanels,
  },
  {
    title: 'Door surrounds',
    note: 'Step 6.1. Overall width is the structural opening; the leaf width derives from it, which is why the leaf narrows as side lights are added at a fixed overall size.',
    tiles: doorSurrounds,
  },
  { title: 'Window presets', note: 'Step 7.1. Twelve named configurations expanding to a full sash grid. Cut or extend this list.', tiles: windows },
];

/** Every configuration the catalogue shows. */
export const CATALOGUE_CONFIGS: ConfigState[] = CATALOGUE.flatMap((section) => section.tiles.map((tile) => tile.config));
