import { describe, expect, it } from 'vitest';
import {
  barsWith,
  gridOf,
  matchingPreset,
  withAppearance,
  withBarsEverywhere,
  withCellOpening,
  withEqualDivisions,
  withGlazingUnit,
  withGridSize,
  withPattern,
  withPreset,
  withSashOptions,
  withTrickleVents,
  withWindowStyle,
} from './windowEdits';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from './defaults';
import { WINDOW_PRESETS } from './windowPresets';
import { validateConfig } from './validate';
import { enforceSafetyGlazing } from './safety';
import { decodeConfig, encodeConfig } from './url';
import type { ConfigState, WindowConfigState } from './types';
import { withDoorGlassBars, doorGlassAreas, withSideLights, withTopLight } from './doorEdits';

const valid = (config: ConfigState) => validateConfig(enforceSafetyGlazing(config).config).errors;
const roundTrip = <T extends ConfigState>(config: T): T => decodeConfig(`?${encodeConfig(config).toString()}`).config as T;

describe('Step 7.1: every offered style is valid and survives a link', () => {
  for (const id of ['casement', 'tilt-and-turn', 'sash', 'fixed'] as const) {
    it(id, () => {
      const config = withWindowStyle(DEFAULT_WINDOW, id);
      expect(config.style.id).toBe(id);
      expect(valid(config)).toEqual([]);
      expect(roundTrip(config).style).toEqual(config.style);
    });
  }

  it('choosing a style never changes the size', () => {
    for (const id of ['tilt-and-turn', 'sash', 'fixed'] as const) {
      expect(withWindowStyle(DEFAULT_WINDOW, id).dimensions).toEqual(DEFAULT_WINDOW.dimensions);
    }
    for (const preset of WINDOW_PRESETS) expect(withPreset(DEFAULT_WINDOW, preset).dimensions).toEqual(DEFAULT_WINDOW.dimensions);
  });

  it('casement and tilt-and-turn translate the vents they cannot have', () => {
    const vented = withCellOpening(DEFAULT_WINDOW, 0, 'top-hung');
    const turned = withWindowStyle(vented, 'tilt-and-turn');
    expect(gridOf(turned)?.cells[0]?.opening).toBe('bottom-hung');
    expect(gridOf(withWindowStyle(turned, 'casement'))?.cells[0]?.opening).toBe('top-hung');
  });

  it('a fixed window keeps the Georgian bars of the casement it came from', () => {
    const georgian = withBarsEverywhere(DEFAULT_WINDOW, { style: 'applied-astragal', columns: 3, rows: 2, barWidth: 22 });
    const fixed = withWindowStyle(georgian, 'fixed');
    expect(fixed.style.id === 'fixed' && fixed.style.options.bars.columns).toBe(3);
  });

  it('recognises a preset layout, and stops once it is edited', () => {
    const preset = WINDOW_PRESETS[2]!;
    const applied = withPreset(DEFAULT_WINDOW, preset);
    expect(matchingPreset(applied, WINDOW_PRESETS)?.id).toBe(preset.id);
    expect(matchingPreset(withGridSize(applied, 3, 1), WINDOW_PRESETS)).toBeNull();
  });
});

describe('Step 7.2: pane divisions', () => {
  it('re-dividing keeps the surviving lights and starts new ones fixed and plain', () => {
    const opened = withCellOpening(DEFAULT_WINDOW, 0, 'side-hung-left');
    const wider = withGridSize(opened, 3, 2);
    const grid = gridOf(wider)!;
    expect(grid.cells).toHaveLength(6);
    expect(grid.cells[0]?.opening).toBe('side-hung-left');
    expect(grid.cells[2]?.opening).toBe('fixed');
    expect(valid(wider)).toEqual([]);
  });

  it('is clamped to the grid caps', () => {
    const grid = gridOf(withGridSize(DEFAULT_WINDOW, 99, 99))!;
    expect(grid.columnWeights.length).toBeLessThanOrEqual(6);
    expect(grid.rowWeights.length).toBeLessThanOrEqual(6);
  });

  it('equalises proportions on request only', () => {
    const preset = withPreset(DEFAULT_WINDOW, WINDOW_PRESETS.find((p) => p.id === 'casement-three-centre-fixed')!);
    expect(gridOf(preset)!.columnWeights).toEqual([1, 2, 1]);
    expect(gridOf(withEqualDivisions(preset))!.columnWeights).toEqual([1, 1, 1]);
  });

  it('bars: turning them on starts at two by two, and divisions are clamped', () => {
    expect(barsWith({ style: 'none', columns: 1, rows: 1, barWidth: 0 }, { style: 'applied-astragal' })).toEqual({
      style: 'applied-astragal',
      columns: 2,
      rows: 2,
      barWidth: 22,
    });
    expect(barsWith({ style: 'true-bar', columns: 2, rows: 2, barWidth: 22 }, { columns: 40 }).columns).toBe(12);
    expect(barsWith({ style: 'true-bar', columns: 2, rows: 2, barWidth: 22 }, { style: 'none' }).style).toBe('none');
  });
});

describe('Step 7.3: opening per light', () => {
  it('sets one light without touching the others', () => {
    const grid = gridOf(withCellOpening(withGridSize(DEFAULT_WINDOW, 3, 1), 2, 'side-hung-right'))!;
    expect(grid.cells.map((cell) => cell.opening)).toEqual(['fixed', 'fixed', 'side-hung-right']);
  });

  it("keeps a tilt-and-turn window's hinge side in step with its lights", () => {
    const turned = withWindowStyle(DEFAULT_WINDOW, 'tilt-and-turn');
    const right = withCellOpening(turned, 0, 'side-hung-right') as WindowConfigState;
    expect(right.style.id === 'tilt-and-turn' && right.style.options.turnHingeSide).toBe('right');
  });
});

describe('sash, hardware, vents', () => {
  it('sash options change only themselves', () => {
    const sash = withSashOptions(withWindowStyle(DEFAULT_WINDOW, 'sash'), { horns: false, operation: 'single-hung' });
    expect(sash.style.id === 'sash' && sash.style.options.horns).toBe(false);
    expect(valid(sash)).toEqual([]);
  });

  it('trickle vents: 0 removes them, and the count is clamped', () => {
    expect(withTrickleVents(DEFAULT_WINDOW, 0).trickleVents).toBeNull();
    expect(withTrickleVents(DEFAULT_WINDOW, 40).trickleVents?.count).toBe(6);
  });
});

describe('Step 7.5: glazing', () => {
  it('clear, obscure and tinted, double and triple, all valid for door and window', () => {
    for (const base of [DEFAULT_WINDOW, withSideLights({ ...DEFAULT_DOOR, dimensions: { width: 1800, height: 2100 } }, 'both')] as ConfigState[]) {
      for (const unit of ['double', 'triple'] as const) {
        for (const appearance of ['clear', 'obscure', 'tinted'] as const) {
          const config = withAppearance(withGlazingUnit(base, unit), appearance);
          expect(valid(config), `${base.productType} ${unit} ${appearance}`).toEqual([]);
          expect(roundTrip(config).glazing).toEqual(config.glazing);
        }
      }
    }
  });

  it('keeps the chosen pattern when switching away and back', () => {
    const reeded = withPattern(DEFAULT_WINDOW, 'reeded');
    const back = withAppearance(withAppearance(reeded, 'obscure'), 'obscure');
    expect(back.glazing.appearance === 'obscure' && back.glazing.pattern).toBe('reeded');
  });
});

describe('door glass bars', () => {
  it('lists each glazed area and sets its bars alone', () => {
    const set = withTopLight(withSideLights({ ...DEFAULT_DOOR, dimensions: { width: 1800, height: 2300 } }, 'both'), true);
    expect(doorGlassAreas(set).map((a) => a.area)).toEqual(['top', 'left', 'right']);
    const barred = withDoorGlassBars(set, 'left', { style: 'applied-astragal', columns: 1, rows: 3, barWidth: 22 });
    expect(barred.surround.leftSideLight?.bars.rows).toBe(3);
    expect(barred.surround.rightSideLight?.bars.style).toBe('none');
    expect(valid(barred)).toEqual([]);
  });
});
