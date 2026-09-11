import { describe, expect, it } from 'vitest';
import { decodeConfig, encodeConfig } from './url';
import { DEFAULT_DOOR, DEFAULT_WINDOW, DEFAULT_WINDOW_STYLE_OPTIONS, makeGrid } from './defaults';
import type { ConfigState, DoorConfigState, WindowConfigState } from './types';
import { formatMm, roundMmHalfUp } from './units';

function roundTrip(config: ConfigState): ConfigState {
  return decodeConfig(encodeConfig(config)).config;
}

describe('round trip', () => {
  it('preserves the default door', () => {
    expect(roundTrip(DEFAULT_DOOR)).toEqual(DEFAULT_DOOR);
  });

  it('preserves the default window', () => {
    expect(roundTrip(DEFAULT_WINDOW)).toEqual(DEFAULT_WINDOW);
  });

  it('preserves a fully loaded door', () => {
    const door: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 1802.5, height: 2100 },
      colour: { mode: 'explore', hex: '#3a7f5c' },
      finish: 'woodgrain-foil',
      glazing: { appearance: 'obscure', pattern: 'reeded', unit: 'triple' },
      style: {
        id: 'half-glazed',
        options: {
          glazedFraction: 0.6,
          aperture: {
            shape: 'arched',
            inset: 140,
            bars: { style: 'true-bar', columns: 2, rows: 3, barWidth: 24 },
          },
          panelDetail: { kind: 'grooved', grooves: 6, grooveWidth: 18, orientation: 'horizontal' },
        },
      },
      surround: {
        leftSideLight: { width: 400, bars: { style: 'applied-astragal', columns: 1, rows: 4, barWidth: 22 } },
        rightSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 } },
        topLight: { height: 350, shape: 'arched', bars: { style: 'georgian-internal', columns: 3, rows: 1, barWidth: 20 } },
      },
      hardware: {
        handle: 'pull-bar',
        finish: 'brass',
        letterplate: true,
        spyhole: true,
        knocker: 'doctor',
        numerals: { value: '221B', placement: 'on-side-light' },
      },
      hingeSide: 'right',
      openingDirection: 'outward',
    };
    expect(roundTrip(door)).toEqual(door);
  });

  it('preserves every window style', () => {
    const grid = makeGrid(3, 2);
    grid.cells[0] = { opening: 'side-hung-left', bars: { style: 'applied-astragal', columns: 2, rows: 2, barWidth: 22 } };
    grid.cells[4] = { opening: 'top-hung', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 } };

    const styles: Array<WindowConfigState['style']> = [
      { id: 'casement', options: { grid } },
      { id: 'tilt-and-turn', options: { grid: makeGrid(1, 1), turnHingeSide: 'right' } },
      {
        id: 'sash',
        options: {
          operation: 'single-hung',
          meetingRailPosition: 0.4,
          horns: false,
          upperBars: { style: 'true-bar', columns: 2, rows: 2, barWidth: 25 },
          lowerBars: { style: 'none', columns: 1, rows: 1, barWidth: 0 },
        },
      },
      { id: 'bay', options: DEFAULT_WINDOW_STYLE_OPTIONS.bay },
      { id: 'fixed', options: { bars: { style: 'georgian-internal', columns: 4, rows: 3, barWidth: 20 } } },
    ];

    for (const style of styles) {
      const config: WindowConfigState = { ...DEFAULT_WINDOW, style };
      expect(roundTrip(config), `style ${style.id}`).toEqual(config);
    }
  });

  it('keeps dimensions to 0.1 mm', () => {
    const config = { ...DEFAULT_DOOR, dimensions: { width: 838.4, height: 1981.6 } };
    expect(roundTrip(config).dimensions).toEqual({ width: 838.4, height: 1981.6 });
  });
});

describe('decoding is total', () => {
  it('returns a usable configuration for an empty query string', () => {
    const { config, issues } = decodeConfig('');
    expect(config).toEqual(DEFAULT_DOOR);
    expect(issues).toHaveLength(0);
  });

  it('never throws on hostile input', () => {
    const hostile = [
      'p=zzz&s=???&w=NaN&h=-5&c=javascript:alert(1)&g=%%%',
      'p=w&s=cs&gd=9*9*9',
      'p=w&s=by&bs=a-b-c',
      'p=d&s=hg&pd=r.9.xx&ap=q.nope&nm=' + 'x'.repeat(50),
      'v=999&p=d',
    ];
    for (const query of hostile) {
      expect(() => decodeConfig(query), query).not.toThrow();
      expect(decodeConfig(query).config.productType, query).toMatch(/door|window/);
    }
  });

  it('reports what it could not read', () => {
    const { issues } = decodeConfig('p=d&c=RAL0000&f=zz');
    expect(issues.map((i) => i.key)).toEqual(expect.arrayContaining(['c', 'f']));
  });

  it('clamps an out-of-range size and says so', () => {
    const { config, issues } = decodeConfig('p=d&w=99999&h=1981');
    expect(config.dimensions.width).toBe(3000);
    expect(issues.find((i) => i.key === 'w')?.reason).toContain('clamped');
  });

  it('rejects a grid whose cell count disagrees with its weights', () => {
    const { config, issues } = decodeConfig('p=w&s=cs&gd=1-1-1*1*f.n-f.n');
    expect(config.productType).toBe('window');
    expect(issues.some((i) => i.key === 'gd')).toBe(true);
    expect(roundTrip(config)).toEqual(config);
  });

  it('does not let an explore colour survive as orderable', () => {
    const { config } = decodeConfig('p=d&c=xff0000');
    expect(config.colour).toEqual({ mode: 'explore', hex: '#ff0000' });
  });
});

describe('millimetre rounding', () => {
  it('rounds halves up, once, at display only', () => {
    expect(roundMmHalfUp(1981.5)).toBe(1982);
    expect(roundMmHalfUp(1981.4999)).toBe(1981);
    expect(roundMmHalfUp(0.5)).toBe(1);
    expect(formatMm(837.5)).toBe('838 mm');
  });
});

describe('link size', () => {
  it('keeps a typical door link short enough to share', () => {
    expect(encodeConfig(DEFAULT_DOOR).toString().length).toBeLessThan(120);
  });
});

describe('field absence versus field off', () => {
  it('distinguishes an option switched off from an option missing from the link', () => {
    // Regression: presence-encoded booleans made these two indistinguishable,
    // so an empty query string silently switched the letterplate off.
    expect(decodeConfig('p=d&lp=0').config).toMatchObject({
      hardware: { letterplate: false },
    });
    expect(decodeConfig('p=d').config).toMatchObject({
      hardware: { letterplate: DEFAULT_DOOR.hardware.letterplate },
    });
  });

  it('treats an explicit none token as not fitted', () => {
    const withLights = {
      ...DEFAULT_DOOR,
      surround: {
        ...DEFAULT_DOOR.surround,
        leftSideLight: { width: 400, bars: { style: 'none' as const, columns: 1, rows: 1, barWidth: 0 } },
      },
    };
    expect(decodeConfig(encodeConfig(withLights)).config).toEqual(withLights);
    expect(decodeConfig('p=d&sl=n').config.productType === 'door' &&
      decodeConfig('p=d&sl=n').config).toMatchObject({ surround: { leftSideLight: null } });
  });
});
