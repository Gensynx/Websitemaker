/**
 * The edits the window and glazing options make (Step 7), as pure functions.
 *
 * As with doors (doorEdits.ts): changing one thing never quietly changes
 * another, and the overall size — the opening in the wall — is never altered
 * as a side effect. Choosing a named layout changes the layout, not the size.
 */

import type {
  BarLayout,
  BarStyle,
  ConfigState,
  GlazingAppearance,
  GlazingUnit,
  HardwareFinish,
  ObscurePattern,
  SafetyGlazing,
  SashCell,
  SashGrid,
  SashOpening,
  TintColour,
  WindowConfigState,
  WindowHandleStyle,
  WindowStyle,
  WindowStyleId,
} from './types';
import { NO_BARS } from './types';
import { DEFAULT_WINDOW_STYLE_OPTIONS } from './defaults';
import { MAX_BAR_DIVISIONS, MAX_GRID_COLUMNS, MAX_GRID_ROWS, MAX_TRICKLE_VENTS } from './limits';
import type { WindowPreset } from './windowPresets';

/** Bar face width for a newly barred light. PLACEHOLDER, matching the presets. */
export const DEFAULT_BAR_WIDTH = 22;

/* ------------------------------------------------------------------ *
 * Style
 * ------------------------------------------------------------------ */

/** The grid of a casement or tilt-and-turn window, or null for the others. */
export function gridOf(config: WindowConfigState): SashGrid | null {
  return config.style.id === 'casement' || config.style.id === 'tilt-and-turn' ? config.style.options.grid : null;
}

/**
 * The openings a style offers per light. A tilt-and-turn light is hinged at
 * the side for turning and at the bottom for tilting, so its "side-hung"
 * codes mean tilt-and-turn and "bottom-hung" means tilt only; a casement
 * vents from the top.
 */
export function openingsFor(style: 'casement' | 'tilt-and-turn'): SashOpening[] {
  return style === 'casement'
    ? ['fixed', 'side-hung-left', 'side-hung-right', 'top-hung']
    : ['fixed', 'side-hung-left', 'side-hung-right', 'bottom-hung'];
}

function translateOpenings(grid: SashGrid, to: 'casement' | 'tilt-and-turn'): SashGrid {
  // A casement's top-hung vent becomes a tilt-only light, and back again: the
  // nearest equivalent, rather than an opening the new style cannot have.
  const map = (opening: SashOpening): SashOpening => {
    if (to === 'tilt-and-turn' && opening === 'top-hung') return 'bottom-hung';
    if (to === 'casement' && opening === 'bottom-hung') return 'top-hung';
    return opening;
  };
  return { ...grid, cells: grid.cells.map((cell) => ({ ...cell, opening: map(cell.opening) })) };
}

export function withWindowStyle(config: WindowConfigState, id: WindowStyleId): WindowConfigState {
  if (config.style.id === id) return config;
  const grid = gridOf(config);
  let style: WindowStyle;
  switch (id) {
    case 'casement':
      style = { id, options: { grid: grid ? translateOpenings(grid, 'casement') : DEFAULT_WINDOW_STYLE_OPTIONS.casement.grid } };
      break;
    case 'tilt-and-turn':
      style = { id, options: { grid: grid ? translateOpenings(grid, 'tilt-and-turn') : DEFAULT_WINDOW_STYLE_OPTIONS['tilt-and-turn'].grid } };
      break;
    case 'sash':
      style = { id, options: { ...DEFAULT_WINDOW_STYLE_OPTIONS.sash } };
      break;
    case 'fixed':
      // The bars of the first light carry over, so a Georgian casement made
      // fixed stays Georgian.
      style = { id, options: { bars: grid?.cells[0]?.bars ?? { ...NO_BARS } } };
      break;
  }
  return { ...config, style };
}

function withGrid(config: WindowConfigState, grid: SashGrid): WindowConfigState {
  const style = config.style;
  if (style.id === 'casement') return { ...config, style: { id: 'casement', options: { grid } } };
  if (style.id === 'tilt-and-turn') return { ...config, style: { id: 'tilt-and-turn', options: { grid } } };
  return config;
}

export function withPreset(config: WindowConfigState, preset: WindowPreset): WindowConfigState {
  return { ...config, style: preset.expand() };
}

/** Which preset, if any, the current layout is exactly. */
export function matchingPreset(config: WindowConfigState, presets: readonly WindowPreset[]): WindowPreset | null {
  const current = JSON.stringify(config.style);
  return presets.find((preset) => JSON.stringify(preset.expand()) === current) ?? null;
}

/* ------------------------------------------------------------------ *
 * Pane divisions and per-light options (7.2, 7.3)
 * ------------------------------------------------------------------ */

function freshCell(): SashCell {
  return { opening: 'fixed', bars: { ...NO_BARS }, safety: null };
}

/**
 * Re-divide the frame. Lights that survive keep their opening and bars, and
 * their column and row proportions; new ones start fixed, unbarred, equal.
 */
export function withGridSize(config: WindowConfigState, columns: number, rows: number): WindowConfigState {
  const grid = gridOf(config);
  if (grid === null) return config;
  const cols = Math.max(1, Math.min(MAX_GRID_COLUMNS, Math.round(columns)));
  const rws = Math.max(1, Math.min(MAX_GRID_ROWS, Math.round(rows)));
  const oldColumns = grid.columnWeights.length;
  const columnWeights = Array.from({ length: cols }, (_, i) => grid.columnWeights[i] ?? 1);
  const rowWeights = Array.from({ length: rws }, (_, i) => grid.rowWeights[i] ?? 1);
  const cells: SashCell[] = [];
  for (let r = 0; r < rws; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const existing = r < grid.rowWeights.length && c < oldColumns ? grid.cells[r * oldColumns + c] : undefined;
      cells.push(existing ?? freshCell());
    }
  }
  return withGrid(config, { columnWeights, rowWeights, cells });
}

/** Equal widths and heights, for when a layout's proportions are no longer wanted. */
export function withEqualDivisions(config: WindowConfigState): WindowConfigState {
  const grid = gridOf(config);
  if (grid === null) return config;
  return withGrid(config, { ...grid, columnWeights: grid.columnWeights.map(() => 1), rowWeights: grid.rowWeights.map(() => 1) });
}

export function hasEqualDivisions(grid: SashGrid): boolean {
  const same = (weights: number[]) => weights.every((weight) => weight === weights[0]);
  return same(grid.columnWeights) && same(grid.rowWeights);
}

function withCell(config: WindowConfigState, index: number, update: (cell: SashCell) => SashCell): WindowConfigState {
  const grid = gridOf(config);
  if (grid === null || index < 0 || index >= grid.cells.length) return config;
  return withGrid(config, { ...grid, cells: grid.cells.map((cell, i) => (i === index ? update(cell) : cell)) });
}

export function withCellOpening(config: WindowConfigState, index: number, opening: SashOpening): WindowConfigState {
  return withCell(config, index, (cell) => ({ ...cell, opening }));
}

export function withCellBars(config: WindowConfigState, index: number, bars: BarLayout): WindowConfigState {
  return withCell(config, index, (cell) => ({ ...cell, bars }));
}

/** The same bars in every light — the usual way a Georgian window is specified. */
export function withBarsEverywhere(config: WindowConfigState, bars: BarLayout): WindowConfigState {
  const grid = gridOf(config);
  if (grid === null) return config;
  return withGrid(config, { ...grid, cells: grid.cells.map((cell) => ({ ...cell, bars: { ...bars } })) });
}

/** A bar layout with one thing changed, clamped to what can be made. */
export function barsWith(bars: BarLayout, change: { style?: BarStyle; columns?: number; rows?: number }): BarLayout {
  const clamp = (n: number) => Math.max(1, Math.min(MAX_BAR_DIVISIONS, Math.round(n)));
  const style = change.style ?? bars.style;
  if (style === 'none') return { ...NO_BARS };
  // Turning bars on from none starts at a two-by-two layout, not an invisible 1 × 1.
  const fromNone = bars.style === 'none';
  return {
    style,
    columns: clamp(change.columns ?? (fromNone ? 2 : bars.columns)),
    rows: clamp(change.rows ?? (fromNone ? 2 : bars.rows)),
    barWidth: bars.barWidth > 0 ? bars.barWidth : DEFAULT_BAR_WIDTH,
  };
}

/* ------------------------------------------------------------------ *
 * Sash and fixed
 * ------------------------------------------------------------------ */

type SashOptions = Extract<WindowStyle, { id: 'sash' }>['options'];

export function withSashOptions(config: WindowConfigState, change: Partial<SashOptions>): WindowConfigState {
  if (config.style.id !== 'sash') return config;
  return { ...config, style: { id: 'sash', options: { ...config.style.options, ...change } } };
}

export function withFixedBars(config: WindowConfigState, bars: BarLayout): WindowConfigState {
  if (config.style.id !== 'fixed') return config;
  return { ...config, style: { id: 'fixed', options: { bars } } };
}

/* ------------------------------------------------------------------ *
 * Hardware and ventilation (7.4)
 * ------------------------------------------------------------------ */

export function withWindowHandle(config: WindowConfigState, handle: WindowHandleStyle): WindowConfigState {
  return { ...config, hardware: { ...config.hardware, handle } };
}

export function withWindowHardwareFinish(config: WindowConfigState, finish: HardwareFinish): WindowConfigState {
  return { ...config, hardware: { ...config.hardware, finish } };
}

/**
 * Trickle vents in the head of the frame: 0 for none. Only that position is
 * offered because it is the only one the renderer draws.
 */
export function withTrickleVents(config: WindowConfigState, count: number): WindowConfigState {
  const n = Math.max(0, Math.min(MAX_TRICKLE_VENTS, Math.round(count)));
  return { ...config, trickleVents: n === 0 ? null : { position: 'head-of-frame', count: n } };
}

/* ------------------------------------------------------------------ *
 * Glazing (7.5), shared by doors and windows
 * ------------------------------------------------------------------ */

export type Appearance = GlazingAppearance['appearance'];

export function withGlazingUnit<T extends ConfigState>(config: T, unit: GlazingUnit): T {
  return { ...config, glazing: { ...config.glazing, unit } };
}

export function withAppearance<T extends ConfigState>(config: T, appearance: Appearance): T {
  const { unit, safety } = config.glazing;
  const current = config.glazing;
  const next: GlazingAppearance =
    appearance === 'clear'
      ? { appearance }
      : appearance === 'tinted'
        ? { appearance, tint: current.appearance === 'tinted' ? current.tint : 'grey' }
        : { appearance, pattern: current.appearance === 'obscure' ? current.pattern : 'stippled' };
  return { ...config, glazing: { ...next, unit, safety } };
}

export function withTint<T extends ConfigState>(config: T, tint: TintColour): T {
  const { unit, safety } = config.glazing;
  return { ...config, glazing: { appearance: 'tinted', tint, unit, safety } };
}

export function withPattern<T extends ConfigState>(config: T, pattern: ObscurePattern): T {
  const { unit, safety } = config.glazing;
  return { ...config, glazing: { appearance: 'obscure', pattern, unit, safety } };
}

export function withSafety<T extends ConfigState>(config: T, safety: SafetyGlazing): T {
  return { ...config, glazing: { ...config.glazing, safety } };
}
