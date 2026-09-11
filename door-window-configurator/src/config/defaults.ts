/**
 * Default configurations, and the per-style option defaults the decoder falls
 * back to when a shared link omits or corrupts a field.
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

export function makeGrid(columns: number, rows: number): SashGrid {
  return {
    columnWeights: Array.from({ length: columns }, () => 1),
    rowWeights: Array.from({ length: rows }, () => 1),
    cells: Array.from({ length: columns * rows }, () => ({
      opening: 'fixed' as const,
      bars: { ...NO_BARS },
    })),
  };
}

export const DEFAULT_DOOR_STYLE_OPTIONS: {
  [K in DoorStyleId]: DoorStyleOptions[K];
} = {
  'solid-panel': {
    panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' },
  },
  'half-glazed': {
    glazedFraction: 0.45,
    aperture: { shape: 'rectangular', bars: { ...NO_BARS }, inset: 120 },
    panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' },
  },
  'full-glazed': {
    aperture: { shape: 'rectangular', bars: { ...NO_BARS }, inset: 100 },
  },
};

export const DEFAULT_WINDOW_STYLE_OPTIONS: {
  [K in WindowStyleId]: WindowStyleOptions[K];
} = {
  casement: { grid: makeGrid(2, 1) },
  'tilt-and-turn': { grid: makeGrid(1, 1), turnHingeSide: 'left' },
  sash: {
    operation: 'double-hung',
    meetingRailPosition: 0.5,
    horns: true,
    upperBars: { style: 'applied-astragal', columns: 3, rows: 2, barWidth: 22 },
    lowerBars: { style: 'applied-astragal', columns: 3, rows: 2, barWidth: 22 },
  },
  bay: {
    segments: [
      { widthShare: 0.25, grid: makeGrid(1, 1) },
      { widthShare: 0.5, grid: makeGrid(2, 1) },
      { widthShare: 0.25, grid: makeGrid(1, 1) },
    ],
    cornerAngle: 135,
    returnDepth: 450,
  },
  fixed: { bars: { ...NO_BARS } },
};

export const DEFAULT_DOOR: DoorConfigState = {
  schemaVersion: CONFIG_SCHEMA_VERSION,
  productType: 'door',
  dimensions: { width: 838, height: 1981 },
  colour: { mode: 'ral', code: 'RAL7016' },
  finish: 'smooth',
  glazing: { appearance: 'clear', unit: 'double' },
  style: { id: 'solid-panel', options: DEFAULT_DOOR_STYLE_OPTIONS['solid-panel'] },
  surround: { leftSideLight: null, rightSideLight: null, topLight: null },
  hardware: {
    handle: 'lever-rose',
    finish: 'satin-chrome',
    letterplate: true,
    knocker: null,
    spyhole: false,
    numerals: null,
  },
  hingeSide: 'left',
  openingDirection: 'inward',
};

export const DEFAULT_WINDOW: WindowConfigState = {
  schemaVersion: CONFIG_SCHEMA_VERSION,
  productType: 'window',
  dimensions: { width: 1200, height: 1050 },
  colour: { mode: 'ral', code: 'RAL9016' },
  finish: 'smooth',
  glazing: { appearance: 'clear', unit: 'double' },
  style: { id: 'casement', options: DEFAULT_WINDOW_STYLE_OPTIONS.casement },
  hardware: { handle: 'lever-rose', finish: 'satin-chrome' },
};

export const DEFAULT_CONFIG: ConfigState = DEFAULT_DOOR;

export function defaultFor(productType: 'door' | 'window'): ConfigState {
  return productType === 'door' ? DEFAULT_DOOR : DEFAULT_WINDOW;
}
