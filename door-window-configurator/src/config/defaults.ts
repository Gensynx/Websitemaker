/**
 * Default configurations, and the per-style option defaults the decoder falls
 * back to when a link omits or corrupts a field.
 */

import type {
  ConfigState,
  DoorConfigState,
  DoorStyleId,
  DoorStyleOptions,
  SashGrid,
  WindowConfigState,
  WindowStyleId,
  WindowStyleOptions,
} from './types';
import { CONFIG_SCHEMA_VERSION, NO_BARS } from './types';
import type { FrameMaterial } from './material';
import { windowPreset } from './windowPresets';

/** uPVC, the only material offered: the developer's narrowing of 2026-09-12, confirmed by the owner for the demo on 2026-09-25. */
export const DEFAULT_MATERIAL: FrameMaterial = 'upvc';

export function makeGrid(columns: number, rows: number): SashGrid {
  return {
    columnWeights: Array.from({ length: columns }, () => 1),
    rowWeights: Array.from({ length: rows }, () => 1),
    cells: Array.from({ length: columns * rows }, () => ({
      opening: 'fixed' as const,
      bars: { ...NO_BARS },
      safety: null,
    })),
  };
}

export const DEFAULT_DOOR_STYLE_OPTIONS: { [K in DoorStyleId]: DoorStyleOptions[K] } = {
  'solid-panel': {
    panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' },
  },
  'half-glazed': {
    glazedFraction: 0.45,
    aperture: { shape: 'rectangular', bars: { ...NO_BARS }, inset: 120, safety: null },
    panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' },
  },
  'full-glazed': {
    aperture: { shape: 'rectangular', bars: { ...NO_BARS }, inset: 100, safety: null },
  },
};

export const DEFAULT_WINDOW_STYLE_OPTIONS: { [K in WindowStyleId]: WindowStyleOptions[K] } = {
  casement: { grid: makeGrid(2, 1) },
  'tilt-and-turn': { grid: makeGrid(1, 1) },
  sash: {
    operation: 'double-hung',
    meetingRailPosition: 0.5,
    horns: true,
    upperBars: { style: 'applied-astragal', columns: 3, rows: 2, barWidth: 22 },
    lowerBars: { style: 'applied-astragal', columns: 3, rows: 2, barWidth: 22 },
  },
  fixed: { bars: { ...NO_BARS } },
};

export const DEFAULT_DOOR: DoorConfigState = {
  schemaVersion: CONFIG_SCHEMA_VERSION,
  productType: 'door',
  material: DEFAULT_MATERIAL,
  dimensions: { width: 838, height: 1981 },
  colour: { external: { mode: 'ral', code: 'RAL7016' }, internal: { mode: 'match' } },
  finish: { external: 'smooth', internal: 'match' },
  glazing: { appearance: 'clear', unit: 'double', safety: 'none' },
  style: { id: 'solid-panel', options: DEFAULT_DOOR_STYLE_OPTIONS['solid-panel'] },
  surround: { leftSideLight: null, rightSideLight: null, topLight: null },
  hardware: {
    handle: 'lever-rose',
    finish: 'satin-chrome',
    letterplate: true,
    knocker: null,
    spyhole: false,
  },
  threshold: 'standard',
  trickleVents: null,
  hingeSide: 'left',
  openingDirection: 'inward',
};

/**
 * The window a customer first sees: the "Three-pane with top openers" preset
 * at its suggested size, so the product demonstrates itself — openers,
 * handles, unequal lights — rather than two fixed panes (the owner's decision
 * of 2026-09-25). Switching an existing window to casement still starts from
 * DEFAULT_WINDOW_STYLE_OPTIONS.casement.
 */
const DEFAULT_WINDOW_PRESET = (() => {
  const preset = windowPreset('casement-three-top-openers');
  // A renamed or withdrawn preset must fail loudly, not ship a blank window.
  if (preset === undefined) throw new Error('The default window preset "casement-three-top-openers" is missing.');
  return preset;
})();

export const DEFAULT_WINDOW: WindowConfigState = {
  schemaVersion: CONFIG_SCHEMA_VERSION,
  productType: 'window',
  material: DEFAULT_MATERIAL,
  dimensions: { ...DEFAULT_WINDOW_PRESET.suggestedSize },
  colour: { external: { mode: 'ral', code: 'RAL9016' }, internal: { mode: 'match' } },
  finish: { external: 'smooth', internal: 'match' },
  glazing: { appearance: 'clear', unit: 'double', safety: 'none' },
  style: DEFAULT_WINDOW_PRESET.expand(),
  hardware: { handle: 'lever-rose', finish: 'satin-chrome' },
  trickleVents: { position: 'head-of-frame', count: 1 },
};

export const DEFAULT_CONFIG: ConfigState = DEFAULT_DOOR;

export function defaultFor(productType: 'door' | 'window'): ConfigState {
  return productType === 'door' ? DEFAULT_DOOR : DEFAULT_WINDOW;
}
