import { describe, expect, it } from 'vitest';
import { configToUrl, decodeConfig, encodeConfig } from './url';
import { DEFAULT_DOOR, DEFAULT_WINDOW, makeGrid } from './defaults';
import type { ConfigState, DoorConfigState, SashGrid, WindowConfigState } from './types';
import { formatMm, roundMmHalfUp } from './units';
import { MAX_BAR_DIVISIONS, MAX_GRID_COLUMNS, MAX_GRID_ROWS } from './limits';
import { DEFAULT_CAMERA_PRESET, decodeView, encodeView } from './view';
import { buildEnquiry, doorLeafWidth, mintQuotable, reconcileWithMaterial, validateConfig } from './validate';
import { assessCriticalLocations, enforceSafetyGlazing, safetyControlState } from './safety';

function roundTrip(config: ConfigState): ConfigState {
  return decodeConfig(encodeConfig(config)).config;
}

/* ------------------------------------------------------------------ */

describe('round trip', () => {
  it('preserves the default door and window', () => {
    expect(roundTrip(DEFAULT_DOOR)).toEqual(DEFAULT_DOOR);
    expect(roundTrip(DEFAULT_WINDOW)).toEqual(DEFAULT_WINDOW);
  });

  it('preserves a fully loaded door', () => {
    const door: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'aluminium',
      dimensions: { width: 1802.5, height: 2100 },
      colour: {
        external: { mode: 'ral', code: 'RAL7016' },
        internal: { mode: 'ral', code: 'RAL9016' },
      },
      finish: { external: 'textured', internal: 'match' },
      glazing: { appearance: 'obscure', pattern: 'reeded', unit: 'triple', safety: 'laminated' },
      style: {
        id: 'half-glazed',
        options: {
          glazedFraction: 0.6,
          aperture: {
            shape: 'arched',
            inset: 140,
            bars: { style: 'true-bar', columns: 2, rows: 3, barWidth: 24 },
            safety: null,
          },
          panelDetail: { kind: 'grooved', grooves: 6, grooveWidth: 18, orientation: 'horizontal' },
        },
      },
      surround: {
        leftSideLight: { width: 400, bars: { style: 'applied-astragal', columns: 1, rows: 4, barWidth: 22 }, safety: null },
        rightSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
        topLight: {
          height: 350,
          shape: 'arched',
          bars: { style: 'georgian-internal', columns: 3, rows: 1, barWidth: 20 },
          safety: null,
        },
      },
      hardware: {
        handle: 'pull-bar',
        finish: 'brass',
        letterplate: true,
        spyhole: true,
        knocker: 'doctor',
      },
      threshold: 'low-level-access',
      trickleVents: { position: 'head-of-frame', count: 2 },
      hingeSide: 'right',
      openingDirection: 'outward',
    };
    expect(roundTrip(door)).toEqual(door);
  });

  it('preserves every window style', () => {
    const grid = makeGrid(3, 2);
    grid.cells[0] = {
      opening: 'side-hung-left',
      bars: { style: 'applied-astragal', columns: 2, rows: 2, barWidth: 22 },
      safety: null,
    };
    grid.cells[4] = { opening: 'top-hung', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null };

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

  it('preserves a matched internal colour as matched, not as a copy', () => {
    expect(roundTrip(DEFAULT_DOOR).colour.internal).toEqual({ mode: 'match' });
  });
});

/* ------------------------------------------------------------------ */

describe('decoding is total', () => {
  it('returns a usable configuration for an empty query string', () => {
    const { config, issues } = decodeConfig('');
    expect(config).toEqual(DEFAULT_DOOR);
    expect(issues).toHaveLength(0);
  });

  it('never throws on hostile input', () => {
    const hostile = [
      'p=zzz&s=???&w=NaN&h=-5&ce=javascript:alert(1)&g=%%%',
      'p=w&s=cs&gd=9*9*9',
      'p=d&s=hg&pd=r.9.xx&ap=q.nope&tv=..',
      'v=999&p=d',
      'v=-1&p=d',
      'm=zzz&p=d&sg=???',
      'p=d&ci=notacolour',
    ];
    for (const query of hostile) {
      expect(() => decodeConfig(query), query).not.toThrow();
      expect(decodeConfig(query).config.productType, query).toMatch(/door|window/);
    }
  });

  it('reports what it could not read', () => {
    const { issues } = decodeConfig('p=d&ce=RAL0000&fe=zz');
    expect(issues.map((i) => i.key)).toEqual(expect.arrayContaining(['ce', 'fe']));
  });

  it('clamps an out-of-range size and says so', () => {
    const { config, issues } = decodeConfig('m=u&p=d&w=99999&h=1981');
    expect(config.dimensions.width).toBe(2800);
    expect(issues.find((i) => i.key === 'w')?.reason).toContain('clamped');
  });

  it('rejects a grid whose cell count disagrees with its weights', () => {
    const { config, issues } = decodeConfig('p=w&s=cs&gd=1-1-1*1*f.n-f.n');
    expect(issues.some((i) => i.key === 'gd')).toBe(true);
    expect(roundTrip(config)).toEqual(config);
  });

  it('distinguishes an option switched off from an option missing from the link', () => {
    // Regression: presence-encoded booleans made these indistinguishable, so an
    // empty query string silently switched the letterplate off.
    expect(decodeConfig('p=d&lp=0').config).toMatchObject({ hardware: { letterplate: false } });
    expect(decodeConfig('p=d').config).toMatchObject({
      hardware: { letterplate: DEFAULT_DOOR.hardware.letterplate },
    });
  });
});

/* ------------------------------------------------------------------ */

describe('frame material gates the catalogue', () => {
  it('moves a shade that the chosen material does not offer', () => {
    // RAL6005 is offered in timber but not uPVC.
    const timber: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'timber',
      colour: { external: { mode: 'ral', code: 'RAL6005' }, internal: { mode: 'match' } },
    };
    expect(validateConfig(timber).errors).toHaveLength(0);

    const { config, issues } = reconcileWithMaterial({ ...timber, material: 'upvc' });
    expect(issues.some((i) => i.field === 'colour.external')).toBe(true);
    expect(config.colour.external).not.toEqual({ mode: 'ral', code: 'RAL6005' });
    expect(validateConfig(config).errors).toHaveLength(0);
  });

  it('moves a finish the material does not offer', () => {
    const upvc = { ...DEFAULT_DOOR, finish: { external: 'woodgrain-foil' as const, internal: 'match' as const } };
    const { config, issues } = reconcileWithMaterial({ ...upvc, material: 'timber' });
    expect(issues.some((i) => i.field === 'finish.external')).toBe(true);
    expect(config.finish.external).toBe('smooth');
  });

  it('applies different size limits per material', () => {
    const wide: WindowConfigState = { ...DEFAULT_WINDOW, dimensions: { width: 3500, height: 2000 } };
    expect(validateConfig({ ...wide, material: 'aluminium' }).errors.some((e) => e.field === 'width')).toBe(false);
    expect(validateConfig({ ...wide, material: 'timber' }).errors.some((e) => e.field === 'width')).toBe(true);
  });

  it('reconciles on decode, so an outdated link cannot open in an unavailable colour', () => {
    const { config } = decodeConfig('v=2&m=u&p=d&ce=RAL6005');
    expect(validateConfig(config).errors).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */

describe('the door leaf derives from the overall opening (decision 10)', () => {
  it('rejects an overall width that implies an unmanufacturable leaf', () => {
    const wide: DoorConfigState = { ...DEFAULT_DOOR, dimensions: { width: 2400, height: 2100 } };
    const error = validateConfig(wide).errors.find((e) => e.field === 'width');
    expect(error?.message).toContain('door leaf');
    expect(error?.message).toContain('side light');
  });

  it('accepts the same overall width once side lights absorb it', () => {
    const withLights: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 2400, height: 2100 },
      glazing: { ...DEFAULT_DOOR.glazing, safety: 'toughened' },
      surround: {
        ...DEFAULT_DOOR.surround,
        leftSideLight: { width: 600, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
        rightSideLight: { width: 600, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
      },
    };
    expect(validateConfig(withLights).errors).toHaveLength(0);
    expect(Math.round(doorLeafWidth(withLights))).toBe(880);
  });
});

/* ------------------------------------------------------------------ */

describe('safety glazing and critical locations', () => {
  it('forces safety glass in a fully glazed door', () => {
    const glazed: DoorConfigState = {
      ...DEFAULT_DOOR,
      style: {
        id: 'full-glazed',
        options: {
          aperture: { shape: 'rectangular', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, inset: 100, safety: null },
        },
      },
    };
    expect(assessCriticalLocations(glazed).safetyGlazingForced).toBe(true);
    expect(validateConfig(glazed).errors.some((e) => e.field.startsWith('glazing.safety'))).toBe(true);

    const toughened = { ...glazed, glazing: { ...glazed.glazing, safety: 'toughened' as const } };
    expect(validateConfig(toughened).errors.some((e) => e.field.startsWith('glazing.safety'))).toBe(false);
  });

  it('does not force safety glass on an unglazed leaf', () => {
    expect(assessCriticalLocations(DEFAULT_DOOR).safetyGlazingForced).toBe(false);
    expect(validateConfig(DEFAULT_DOOR).errors).toHaveLength(0);
  });

  it('treats a side light as a critical location', () => {
    const withSideLight: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 1450, height: 2100 },
      surround: {
        ...DEFAULT_DOOR.surround,
        leftSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
      },
    };
    const assessment = assessCriticalLocations(withSideLight);
    expect(assessment.panes.some((p) => p.label === 'Left side light' && p.status === 'required')).toBe(true);
  });

  it('cannot determine a window without the cill height, and says so rather than guessing', () => {
    const assessment = assessCriticalLocations(DEFAULT_WINDOW);
    expect(assessment.undetermined).toBe(true);
    expect(assessment.safetyGlazingForced).toBe(false);
    expect(validateConfig(DEFAULT_WINDOW).notices.some((n) => n.field === 'glazing.safety')).toBe(true);
  });
});

/* ------------------------------------------------------------------ */

describe('trickle vents', () => {
  it('refuses vents on a door with no glazed surround', () => {
    const config: DoorConfigState = {
      ...DEFAULT_DOOR,
      trickleVents: { position: 'head-of-frame', count: 1 },
    };
    expect(validateConfig(config).errors.some((e) => e.field === 'trickleVents')).toBe(true);
  });

  it('allows vents once a surround exists', () => {
    const config: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 1450, height: 2100 },
      surround: {
        ...DEFAULT_DOOR.surround,
        leftSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
      },
      glazing: { ...DEFAULT_DOOR.glazing, safety: 'toughened' },
      trickleVents: { position: 'head-of-frame', count: 1 },
    };
    expect(validateConfig(config).errors).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */

describe('the quotable brand', () => {
  it('is minted only by the validator', () => {
    expect(mintQuotable(DEFAULT_DOOR)).not.toBeNull();
  });

  it('is refused for an unmanufacturable size', () => {
    const tooWide = { ...DEFAULT_DOOR, dimensions: { width: 9000, height: 1981 } };
    expect(mintQuotable(tooWide)).toBeNull();
    expect(buildEnquiry(tooWide).kind).toBe('invalid');
  });

  it('is refused for an explore colour, without blocking the enquiry', () => {
    const explore: DoorConfigState = {
      ...DEFAULT_DOOR,
      colour: { external: { mode: 'explore', hex: '#3a7f5c' }, internal: { mode: 'match' } },
    };
    expect(mintQuotable(explore)).toBeNull();

    const enquiry = buildEnquiry(explore);
    expect(enquiry.kind).toBe('non-orderable');
    if (enquiry.kind === 'non-orderable') {
      expect(enquiry.reasons.some((r) => r.field === 'colour.external')).toBe(true);
    }
  });

  it('states the permitted range in its error messages', () => {
    const tooNarrow = { ...DEFAULT_DOOR, dimensions: { width: 100, height: 1981 } };
    const message = validateConfig(tooNarrow).errors[0]?.message ?? '';
    expect(message).toMatch(/between .* and .*/);
    expect(message).toContain('mm');
  });
});

/* ------------------------------------------------------------------ */

describe('schema migration', () => {
  const V1_DOOR = 'v=1&p=d&w=838&h=1981&c=RAL7016&f=sm&g=c.2&s=sp&pd=r.2.ov&sl=n&sr=n&tl=n&hw=lr&hf=sc&lp=1&sh=0&kn=n&nm=12A.c&hg=l&od=i';

  it('opens a v1 link, splitting the single colour into a pair', () => {
    const { config, issues } = decodeConfig(V1_DOOR);
    expect(config.schemaVersion).toBe(3);
    expect(config.colour.external).toEqual({ mode: 'ral', code: 'RAL7016' });
    expect(config.colour.internal).toEqual({ mode: 'match' });
    expect(issues.some((i) => i.key === 'm')).toBe(true);
    expect(issues.some((i) => i.key === 'nm')).toBe(true);
  });

  it('opens a v1 bay window as a casement and says so', () => {
    const { config, issues } = decodeConfig('v=1&p=w&s=by&bs=25-50-25&bg0=1*1*f.n&ca=135&rd=450');
    expect(config.productType).toBe('window');
    if (config.productType === 'window') expect(config.style.id).toBe('casement');
    expect(issues.some((i) => i.reason.includes('Bay'))).toBe(true);
  });

  it('opens a link from a newer build best-effort rather than failing', () => {
    const { config, issues } = decodeConfig('v=99&p=w&s=sa&unknownkey=whatever');
    expect(config.productType).toBe('window');
    expect(issues.some((i) => i.key === 'v')).toBe(true);
  });

  it('leaves a current-version link untouched', () => {
    const { issues } = decodeConfig(encodeConfig(DEFAULT_DOOR));
    expect(issues).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */

describe('view parameter', () => {
  it('travels separately from the configuration', () => {
    const params = encodeConfig(DEFAULT_DOOR);
    encodeView('hardware', params);
    expect(decodeView(params).preset).toBe('hardware');
    expect(decodeConfig(params).config).toEqual(DEFAULT_DOOR);
  });

  it('falls back without touching the configuration', () => {
    // Bound to the constant, not a literal: this expectation went stale the
    // moment the default view changed, which is the test's fault, not the
    // code's.
    expect(decodeView('view=nonsense')).toEqual({ preset: DEFAULT_CAMERA_PRESET, fellBack: true });
    expect(decodeConfig('p=d&view=nonsense').issues).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */

describe('millimetre rounding', () => {
  it('rounds halves up, once, at display only', () => {
    expect(roundMmHalfUp(1981.5)).toBe(1982);
    expect(roundMmHalfUp(1981.4999)).toBe(1981);
    expect(roundMmHalfUp(0.5)).toBe(1);
    expect(formatMm(837.5)).toBe('838 mm');
  });
});

/* ------------------------------------------------------------------ *
 * Worst-case link length (report-back item 16)
 * ------------------------------------------------------------------ */

function saturatedGrid(): SashGrid {
  const grid = makeGrid(MAX_GRID_COLUMNS, MAX_GRID_ROWS);
  grid.columnWeights = grid.columnWeights.map(() => 99);
  grid.rowWeights = grid.rowWeights.map(() => 99);
  grid.cells = grid.cells.map(() => ({
    opening: 'side-hung-right' as const,
    bars: { style: 'true-bar' as const, columns: MAX_BAR_DIVISIONS, rows: MAX_BAR_DIVISIONS, barWidth: 25 },
    safety: null,
  }));
  return grid;
}

/** The longest link each style can produce, at the caps in limits.ts. */
export function worstCaseByStyle(): Array<{ label: string; length: number; url: number }> {
  const explore = {
    external: { mode: 'explore' as const, hex: '#abcdef' },
    internal: { mode: 'explore' as const, hex: '#123456' },
  };
  const saturatedBars = {
    style: 'true-bar' as const,
    columns: MAX_BAR_DIVISIONS,
    rows: MAX_BAR_DIVISIONS,
    barWidth: 25,
  };

  const door: DoorConfigState = {
    ...DEFAULT_DOOR,
    material: 'aluminium',
    dimensions: { width: 2999.9, height: 2699.9 },
    colour: explore,
    finish: { external: 'woodgrain-foil', internal: 'match' },
    glazing: { appearance: 'obscure', pattern: 'sandblast', unit: 'triple', safety: 'laminated' },
    style: {
      id: 'half-glazed',
      options: {
        glazedFraction: 0.55,
        aperture: { shape: 'rectangular', inset: 140, bars: saturatedBars, safety: null },
        panelDetail: { kind: 'grooved', grooves: 20, grooveWidth: 18, orientation: 'horizontal' },
      },
    },
    surround: {
      leftSideLight: { width: 400, bars: saturatedBars, safety: null },
      rightSideLight: { width: 400, bars: saturatedBars, safety: null },
      topLight: { height: 350, shape: 'arched', bars: saturatedBars, safety: null },
    },
    hardware: { handle: 'lever-backplate', finish: 'satin-chrome', letterplate: true, spyhole: true, knocker: 'doctor' },
    threshold: 'low-level-access',
    trickleVents: { position: 'through-glazing', count: 6 },
    hingeSide: 'right',
    openingDirection: 'outward',
  };

  const windowBase: WindowConfigState = {
    ...DEFAULT_WINDOW,
    material: 'aluminium',
    dimensions: { width: 3999.9, height: 2599.9 },
    colour: explore,
    glazing: { appearance: 'obscure', pattern: 'sandblast', unit: 'triple', safety: 'laminated' },
    trickleVents: { position: 'through-glazing', count: 6 },
  };

  const configs: Array<{ label: string; config: ConfigState }> = [
    { label: 'door / half-glazed, two side lights, top light', config: door },
    { label: 'window / casement 6x6 saturated', config: { ...windowBase, style: { id: 'casement', options: { grid: saturatedGrid() } } } },
    {
      label: 'window / tilt-and-turn 6x6 saturated',
      config: { ...windowBase, style: { id: 'tilt-and-turn', options: { grid: saturatedGrid(), turnHingeSide: 'right' } } },
    },
    {
      label: 'window / sash',
      config: {
        ...windowBase,
        style: {
          id: 'sash',
          options: { operation: 'double-hung', meetingRailPosition: 0.55, horns: true, upperBars: saturatedBars, lowerBars: saturatedBars },
        },
      },
    },
    { label: 'window / fixed', config: { ...windowBase, style: { id: 'fixed', options: { bars: saturatedBars } } } },
  ];

  return configs.map(({ label, config }) => ({
    label,
    length: encodeConfig(config).toString().length,
    url: configToUrl(config, 'https://example.co.uk/configure').length,
  }));
}

describe('link length', () => {
  it('keeps a typical door link short enough to share', () => {
    expect(encodeConfig(DEFAULT_DOOR).toString().length).toBeLessThan(160);
  });

  it('bounds the worst case well inside every practical URL limit', () => {
    const rows = worstCaseByStyle();
    // eslint-disable-next-line no-console
    console.table(rows);
    const worst = Math.max(...rows.map((r) => r.url));
    // 2000 characters is the practical floor across browsers, mail clients and
    // messaging apps. The caps in limits.ts are what keep this bounded.
    expect(worst).toBeLessThan(2000);
  });

  it('round-trips the worst case losslessly', () => {
    const grid = saturatedGrid();
    const config: WindowConfigState = {
      ...DEFAULT_WINDOW,
      material: 'aluminium',
      style: { id: 'casement', options: { grid } },
    };
    expect(roundTrip(config)).toEqual(config);
  });
});

/* ------------------------------------------------------------------ *
 * v3 additions
 * ------------------------------------------------------------------ */

describe('finish is per side, like colour', () => {
  it('round-trips a split specification', () => {
    const door: DoorConfigState = {
      ...DEFAULT_DOOR,
      finish: { external: 'woodgrain-foil', internal: 'smooth' },
    };
    expect(roundTrip(door)).toEqual(door);
  });

  it('keeps a matched internal finish matched, not copied', () => {
    expect(roundTrip(DEFAULT_DOOR).finish).toEqual({ external: 'smooth', internal: 'match' });
  });

  it('gates each side against the material', () => {
    const timber: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'timber',
      finish: { external: 'smooth', internal: 'woodgrain-foil' },
    };
    expect(validateConfig(timber).errors.some((e) => e.field === 'finish.internal')).toBe(true);

    const { config, issues } = reconcileWithMaterial(timber);
    expect(issues.some((i) => i.field === 'finish.internal')).toBe(true);
    expect(config.finish.internal).toBe('match');
  });
});

describe('safety glazing is expressible per pane', () => {
  it('round-trips an override on a side light', () => {
    const door: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 1450, height: 2100 },
      glazing: { ...DEFAULT_DOOR.glazing, safety: 'toughened' },
      surround: {
        ...DEFAULT_DOOR.surround,
        leftSideLight: {
          width: 400,
          bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 },
          safety: 'laminated',
        },
      },
    };
    expect(roundTrip(door)).toEqual(door);
  });

  it('round-trips an override on a single window light', () => {
    const grid = makeGrid(2, 1);
    grid.cells[1] = { opening: 'fixed', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: 'toughened' };
    const config: WindowConfigState = { ...DEFAULT_WINDOW, style: { id: 'casement', options: { grid } } };
    expect(roundTrip(config)).toEqual(config);
  });

  it('assesses a top light separately from a side light on the same door', () => {
    const door: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 1450, height: 2400 },
      glazing: { ...DEFAULT_DOOR.glazing, safety: 'toughened' },
      surround: {
        leftSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
        rightSideLight: null,
        topLight: { height: 400, shape: 'rectangular', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
      },
    };
    const panes = assessCriticalLocations(door).panes;
    expect(panes.find((p) => p.id === 'side-light-left')?.status).toBe('required');
    expect(panes.find((p) => p.id === 'top-light')?.status).toBe('not-required');
  });

  it('locks the control rather than silently correcting, and raises with a notice', () => {
    const unsafe: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 1450, height: 2100 },
      surround: {
        ...DEFAULT_DOOR.surround,
        leftSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
      },
    };

    const control = safetyControlState(unsafe).find((c) => c.id === 'side-light-left');
    expect(control?.locked).toBe(true);
    expect(control?.value).toBe('toughened');
    expect(control?.reason).toContain('critical location');

    const { config, notices } = enforceSafetyGlazing(unsafe);
    expect(notices).toHaveLength(1);
    expect(notices[0]?.message).toContain('Left side light');
    expect(config.glazing.safety).toBe('toughened');
    expect(validateConfig(config).errors).toHaveLength(0);
  });
});

describe('cill height stays out of the configuration', () => {
  it('is not encoded in a shared link', () => {
    expect(encodeConfig(DEFAULT_WINDOW).toString()).not.toContain('cill');
  });

  it('rides on the enquiry as an optional detail and never gates it', () => {
    const withoutIt = buildEnquiry(DEFAULT_WINDOW);
    expect(withoutIt.kind).toBe('quotable');

    const withIt = buildEnquiry(DEFAULT_WINDOW, { cillHeightAboveFloor: 600 });
    expect(withIt.kind).toBe('quotable');
    if (withIt.kind === 'quotable') expect(withIt.installation.cillHeightAboveFloor).toBe(600);
  });

  it('carries the cannot-determine notice through to the enquiry', () => {
    const enquiry = buildEnquiry(DEFAULT_WINDOW);
    if (enquiry.kind === 'quotable') {
      expect(enquiry.notices.some((n) => n.message.includes('cill height'))).toBe(true);
    }
  });
});

describe('v2 to v3 migration', () => {
  const V2_DOOR =
    'v=2&m=u&p=d&w=838&h=1981&ce=RAL7016&ci=m&f=wg&g=c.2&sg=n&tv=n&s=sp&pd=r.2.ov&sl=n&sr=n&tl=n&hw=lr&hf=sc&lp=1&sh=0&kn=n&tr=st&hg=l&od=i';

  it('splits the single finish into a pair', () => {
    const { config } = decodeConfig(V2_DOOR);
    expect(config.schemaVersion).toBe(3);
    expect(config.finish).toEqual({ external: 'woodgrain-foil', internal: 'match' });
  });

  it('reads a v2 side light with no safety field as inheriting', () => {
    // Built by replacement, not by appending: a duplicate key would be read
    // as its first value and the v2 token would never be exercised.
    const query = V2_DOOR.replace('w=838', 'w=1450').replace('h=1981', 'h=2100').replace('sl=n', 'sl=400.n');
    const { config } = decodeConfig(query);
    if (config.productType === 'door') {
      expect(config.surround.leftSideLight).toEqual({
        width: 400,
        bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 },
        safety: null,
      });
    }
  });

  it('reads a v2 grid cell with no safety field as inheriting', () => {
    const { config } = decodeConfig('v=2&p=w&s=cs&gd=1-1*1*f.n-shl.n');
    if (config.productType === 'window' && config.style.id === 'casement') {
      expect(config.style.options.grid.cells.every((c) => c.safety === null)).toBe(true);
      expect(config.style.options.grid.cells[1]?.opening).toBe('side-hung-left');
    }
  });

  it('chains v1 straight through to v3', () => {
    const { config, issues } = decodeConfig('v=1&p=d&c=RAL7016&f=sm&s=sp');
    expect(config.schemaVersion).toBe(3);
    expect(config.colour.external).toEqual({ mode: 'ral', code: 'RAL7016' });
    expect(config.finish).toEqual({ external: 'smooth', internal: 'match' });
    expect(issues.some((i) => i.key === 'm')).toBe(true);
  });
});

describe('the enquiry payload has one constructor', () => {
  it('reaches kind quotable only through mintQuotable', () => {
    // Structural, not just behavioural: `buildEnquiry` is the only exported
    // function that constructs an EnquiryPayload, and its 'quotable' branch is
    // the only place the literal appears outside a type position.
    const enquiry = buildEnquiry(DEFAULT_DOOR);
    expect(enquiry.kind).toBe('quotable');
    if (enquiry.kind === 'quotable') expect(mintQuotable(enquiry.config)).not.toBeNull();
  });

  it('downgrades rather than throwing when validation and minting disagree', () => {
    const explore: DoorConfigState = {
      ...DEFAULT_DOOR,
      colour: { external: { mode: 'explore', hex: '#3a7f5c' }, internal: { mode: 'match' } },
    };
    expect(buildEnquiry(explore).kind).toBe('non-orderable');
  });
});

describe('the default view', () => {
  it('is elevation, so a customer reads the product square-on first', () => {
    expect(DEFAULT_CAMERA_PRESET).toBe('elevation');
    expect(decodeView('').preset).toBe('elevation');
  });
});
