/**
 * URL serialisation for ConfigState (Step 1.2).
 *
 * Goals, in priority order:
 *   1. A link always decodes to a usable configuration. Unknown, missing or
 *      malformed values fall back to defaults and are reported as issues; the
 *      decoder never throws.
 *   2. Links are inspectable. Short keys and mnemonic codes, not an opaque
 *      base64 blob, so a support enquiry quoting a URL can be read by a human.
 *   3. Links stay short. Every field is encoded, not just the non-defaults, so
 *      a link keeps its meaning even after the default configuration changes.
 *
 * Separator discipline — only characters that `URLSearchParams` leaves
 * unescaped are used, so the query string stays readable rather than turning
 * into a wall of %2C:
 *      *   section separator within one value
 *      -   list item separator
 *      .   field separator within a list item, and the decimal point for
 *          standalone numeric values
 *      _   field separator inside a bar-layout token
 * Consequence: values encoded at list depth (grid weights, bar widths) are
 * rounded to whole units in the URL. Sub-millimetre bar widths and fractional
 * grid weights are not representable, which is deliberate.
 *
 * Precision: dimensions round-trip to 0.1 mm. They are held as floats in state
 * and rounded for display only (see units.ts), so the link is not the single
 * rounding point and does not become one.
 */

import type {
  BarLayout,
  BarStyle,
  ConfigState,
  DoorConfigState,
  DoorHandleStyle,
  DoorStyleId,
  Finish,
  Glazing,
  GlazingUnit,
  HardwareFinish,
  KnockerStyle,
  MouldingProfile,
  ObscurePattern,
  PanelDetail,
  ProductType,
  SashCell,
  SashGrid,
  SashOpening,
  SideLight,
  TintColour,
  TopLight,
  WindowConfigState,
  WindowHandleStyle,
  WindowStyleId,
} from './types';
import { CONFIG_SCHEMA_VERSION, NO_BARS } from './types';
import { isRalCode } from './ral';
import {
  DEFAULT_DOOR,
  DEFAULT_DOOR_STYLE_OPTIONS,
  DEFAULT_WINDOW,
  DEFAULT_WINDOW_STYLE_OPTIONS,
  makeGrid,
} from './defaults';
import { MAX_NUMERAL_LENGTH, SIZE_LIMITS } from './limits';

export interface DecodeIssue {
  /** Query key the problem was found in, or 'config' for whole-state issues. */
  key: string;
  reason: string;
}

export interface DecodeResult {
  config: ConfigState;
  issues: DecodeIssue[];
}

/* ------------------------------------------------------------------ *
 * Small codec helpers
 * ------------------------------------------------------------------ */

interface Codes<T extends string> {
  encode: (value: T) => string;
  decode: (raw: string | undefined) => T | undefined;
}

function codes<T extends string>(table: Record<T, string>): Codes<T> {
  const reverse = new Map<string, T>();
  for (const [key, code] of Object.entries(table) as Array<[T, string]>) {
    reverse.set(code, key);
  }
  return {
    encode: (value) => table[value],
    decode: (raw) => (raw === undefined ? undefined : reverse.get(raw)),
  };
}

/** Encode a number with at most one decimal place, trailing zero trimmed. */
function num(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function int(value: number): string {
  return String(Math.round(value));
}

/** Explicit "not fitted" token, so absence always means "field not in link". */
const NONE = 'n';

const PRODUCT = codes<ProductType>({ door: 'd', window: 'w' });
const FINISH = codes<Finish>({ smooth: 'sm', textured: 'tx', 'woodgrain-foil': 'wg' });
const UNIT = codes<GlazingUnit>({ double: '2', triple: '3' });
const TINT = codes<TintColour>({ bronze: 'bz', grey: 'gy', blue: 'bl' });
const OBSCURE = codes<ObscurePattern>({
  sandblast: 'sb',
  reeded: 'rd',
  stippled: 'st',
  cathedral: 'ca',
});
const HARDWARE_FINISH = codes<HardwareFinish>({
  chrome: 'ch',
  'satin-chrome': 'sc',
  black: 'bk',
  brass: 'br',
  anthracite: 'an',
});
const DOOR_HANDLE = codes<DoorHandleStyle>({
  'lever-backplate': 'lb',
  'lever-rose': 'lr',
  'pull-bar': 'pb',
  knob: 'kn',
});
const WINDOW_HANDLE = codes<WindowHandleStyle>({
  'lever-backplate': 'lb',
  'lever-rose': 'lr',
  knob: 'kn',
});
const KNOCKER = codes<KnockerStyle>({ ring: 'rg', doctor: 'dr', urn: 'ur' });
const MOULDING = codes<MouldingProfile>({ ovolo: 'ov', chamfer: 'ch', square: 'sq' });
const DOOR_STYLE = codes<DoorStyleId>({
  'solid-panel': 'sp',
  'half-glazed': 'hg',
  'full-glazed': 'fg',
});
const WINDOW_STYLE = codes<WindowStyleId>({
  casement: 'cs',
  'tilt-and-turn': 'tt',
  sash: 'sa',
  bay: 'by',
  fixed: 'fx',
});
const BAR_STYLE = codes<BarStyle>({
  none: 'n',
  'georgian-internal': 'gi',
  'applied-astragal': 'aa',
  'true-bar': 'tb',
});
const OPENING = codes<SashOpening>({
  fixed: 'f',
  'side-hung-left': 'shl',
  'side-hung-right': 'shr',
  'top-hung': 'th',
  'bottom-hung': 'bh',
});

/* ------------------------------------------------------------------ *
 * Composite tokens
 * ------------------------------------------------------------------ */

function encodeBars(bars: BarLayout): string {
  if (bars.style === 'none') return 'n';
  return [BAR_STYLE.encode(bars.style), int(bars.columns), int(bars.rows), int(bars.barWidth)].join(
    '_',
  );
}

function encodeGrid(grid: SashGrid): string {
  const cells = grid.cells
    .map((cell) => `${OPENING.encode(cell.opening)}.${encodeBars(cell.bars)}`)
    .join('-');
  return [
    grid.columnWeights.map(int).join('-'),
    grid.rowWeights.map(int).join('-'),
    cells,
  ].join('*');
}

function encodePanelDetail(detail: PanelDetail): string {
  switch (detail.kind) {
    case 'flush':
      return 'fl';
    case 'raised':
      return `r.${detail.panels}.${MOULDING.encode(detail.moulding)}`;
    case 'grooved':
      return `g.${int(detail.grooves)}.${int(detail.grooveWidth)}.${
        detail.orientation === 'horizontal' ? 'h' : 'v'
      }`;
  }
}

function encodeGlazing(glazing: Glazing): string {
  const unit = UNIT.encode(glazing.unit);
  switch (glazing.appearance) {
    case 'clear':
      return `c.${unit}`;
    case 'tinted':
      return `t.${unit}.${TINT.encode(glazing.tint)}`;
    case 'obscure':
      return `o.${unit}.${OBSCURE.encode(glazing.pattern)}`;
  }
}

function encodeSideLight(light: SideLight): string {
  return `${int(light.width)}.${encodeBars(light.bars)}`;
}

function encodeTopLight(light: TopLight): string {
  return `${int(light.height)}.${light.shape === 'arched' ? 'a' : 'r'}.${encodeBars(light.bars)}`;
}

/* ------------------------------------------------------------------ *
 * Encoding
 * ------------------------------------------------------------------ */

export function encodeConfig(config: ConfigState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('v', String(config.schemaVersion));
  params.set('p', PRODUCT.encode(config.productType));
  params.set('w', num(config.dimensions.width));
  params.set('h', num(config.dimensions.height));
  params.set('c', config.colour.mode === 'ral' ? config.colour.code : `x${config.colour.hex.slice(1)}`);
  params.set('f', FINISH.encode(config.finish));
  params.set('g', encodeGlazing(config.glazing));

  if (config.productType === 'door') {
    encodeDoor(config, params);
  } else {
    encodeWindow(config, params);
  }
  return params;
}

function encodeDoor(config: DoorConfigState, params: URLSearchParams): void {
  params.set('s', DOOR_STYLE.encode(config.style.id));

  switch (config.style.id) {
    case 'solid-panel':
      params.set('pd', encodePanelDetail(config.style.options.panelDetail));
      break;
    case 'half-glazed':
      params.set('pd', encodePanelDetail(config.style.options.panelDetail));
      params.set('gf', num(config.style.options.glazedFraction));
      params.set('ap', `${config.style.options.aperture.shape[0]}.${int(config.style.options.aperture.inset)}`);
      params.set('ab', encodeBars(config.style.options.aperture.bars));
      break;
    case 'full-glazed':
      params.set('ap', `${config.style.options.aperture.shape[0]}.${int(config.style.options.aperture.inset)}`);
      params.set('ab', encodeBars(config.style.options.aperture.bars));
      break;
  }

  // Every field is written, including the absent ones, with NONE as the
  // explicit "not fitted" token. Encoding an option by its mere presence would
  // make "the customer turned this off" indistinguishable from "this link
  // predates the option", and the two must fall back differently.
  params.set('sl', config.surround.leftSideLight ? encodeSideLight(config.surround.leftSideLight) : NONE);
  params.set('sr', config.surround.rightSideLight ? encodeSideLight(config.surround.rightSideLight) : NONE);
  params.set('tl', config.surround.topLight ? encodeTopLight(config.surround.topLight) : NONE);

  params.set('hw', DOOR_HANDLE.encode(config.hardware.handle));
  params.set('hf', HARDWARE_FINISH.encode(config.hardware.finish));
  params.set('lp', config.hardware.letterplate ? '1' : '0');
  params.set('sh', config.hardware.spyhole ? '1' : '0');
  params.set('kn', config.hardware.knocker ? KNOCKER.encode(config.hardware.knocker) : NONE);
  if (config.hardware.numerals) {
    const placement =
      config.hardware.numerals.placement === 'centre'
        ? 'c'
        : config.hardware.numerals.placement === 'above-letterplate'
          ? 'a'
          : 's';
    params.set('nm', `${config.hardware.numerals.value}.${placement}`);
  } else {
    params.set('nm', NONE);
  }
  params.set('hg', config.hingeSide === 'left' ? 'l' : 'r');
  params.set('od', config.openingDirection === 'inward' ? 'i' : 'o');
}

function encodeWindow(config: WindowConfigState, params: URLSearchParams): void {
  params.set('s', WINDOW_STYLE.encode(config.style.id));

  switch (config.style.id) {
    case 'casement':
      params.set('gd', encodeGrid(config.style.options.grid));
      break;
    case 'tilt-and-turn':
      params.set('gd', encodeGrid(config.style.options.grid));
      params.set('th', config.style.options.turnHingeSide === 'left' ? 'l' : 'r');
      break;
    case 'sash':
      params.set('op', config.style.options.operation === 'double-hung' ? 'dh' : 'sh');
      params.set('mr', num(config.style.options.meetingRailPosition));
      params.set('ho', config.style.options.horns ? '1' : '0');
      params.set('ub', encodeBars(config.style.options.upperBars));
      params.set('lb', encodeBars(config.style.options.lowerBars));
      break;
    case 'bay':
      // One key per segment sidesteps a fourth level of nesting, which the
      // available separator set cannot express.
      params.set('bs', config.style.options.segments.map((seg) => int(seg.widthShare * 100)).join('-'));
      config.style.options.segments.forEach((seg, index) => {
        params.set(`bg${index}`, encodeGrid(seg.grid));
      });
      params.set('ca', String(config.style.options.cornerAngle));
      params.set('rd', int(config.style.options.returnDepth));
      break;
    case 'fixed':
      params.set('fb', encodeBars(config.style.options.bars));
      break;
  }

  params.set('hw', WINDOW_HANDLE.encode(config.hardware.handle));
  params.set('hf', HARDWARE_FINISH.encode(config.hardware.finish));
}

/** Full shareable URL for a configuration (Step 8.2 uses this). */
export function configToUrl(config: ConfigState, base: string): string {
  const url = new URL(base);
  url.search = encodeConfig(config).toString();
  return url.toString();
}

/* ------------------------------------------------------------------ *
 * Decoding
 *
 * The decoder is total: every path returns a configuration. Anything it cannot
 * read is replaced with the default for that field and reported in `issues`,
 * which the UI surfaces as a non-blocking notice ("part of this link could not
 * be read; those options were reset").
 * ------------------------------------------------------------------ */

class Issues {
  readonly list: DecodeIssue[] = [];
  add(key: string, reason: string): void {
    this.list.push({ key, reason });
  }
}

function readNumber(
  params: URLSearchParams,
  key: string,
  fallback: number,
  bounds: { min: number; max: number },
  issues: Issues,
): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    issues.add(key, `"${raw}" is not a number; using ${fallback}`);
    return fallback;
  }
  if (parsed < bounds.min || parsed > bounds.max) {
    const clamped = Math.min(bounds.max, Math.max(bounds.min, parsed));
    issues.add(key, `${parsed} is outside ${bounds.min}–${bounds.max}; clamped to ${clamped}`);
    return clamped;
  }
  return parsed;
}

function readCode<T extends string>(
  params: URLSearchParams,
  key: string,
  codec: Codes<T>,
  fallback: T,
  issues: Issues,
): T {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const value = codec.decode(raw);
  if (value === undefined) {
    issues.add(key, `"${raw}" is not a recognised value; using "${fallback}"`);
    return fallback;
  }
  return value;
}

function readFlag(params: URLSearchParams, key: string, fallback: boolean): boolean {
  const raw = params.get(key);
  if (raw === null) return fallback;
  return raw === '1';
}

function readOptionalCode<T extends string>(
  params: URLSearchParams,
  key: string,
  codec: Codes<T>,
  fallback: T | null,
  issues: Issues,
): T | null {
  const raw = params.get(key);
  if (raw === null) return fallback;
  if (raw === NONE) return null;
  const value = codec.decode(raw);
  if (value === undefined) {
    issues.add(key, `"${raw}" is not a recognised value; that option has been removed`);
    return null;
  }
  return value;
}

function decodeBars(raw: string | null, fallback: BarLayout, key: string, issues: Issues): BarLayout {
  if (raw === null) return fallback;
  if (raw === 'n') return { ...NO_BARS };
  const parts = raw.split('_');
  const style = BAR_STYLE.decode(parts[0]);
  const columns = Number(parts[1]);
  const rows = Number(parts[2]);
  const barWidth = Number(parts[3]);
  if (
    style === undefined ||
    !Number.isFinite(columns) ||
    !Number.isFinite(rows) ||
    !Number.isFinite(barWidth) ||
    columns < 1 ||
    rows < 1 ||
    columns > 12 ||
    rows > 12
  ) {
    issues.add(key, `"${raw}" is not a valid bar layout; using the default`);
    return fallback;
  }
  return { style, columns: Math.round(columns), rows: Math.round(rows), barWidth };
}

function decodeGrid(raw: string | null, fallback: SashGrid, key: string, issues: Issues): SashGrid {
  if (raw === null) return fallback;
  const sections = raw.split('*');
  if (sections.length !== 3) {
    issues.add(key, `"${raw}" is not a valid grid; using the default`);
    return fallback;
  }
  const columnWeights = (sections[0] ?? '').split('-').map(Number);
  const rowWeights = (sections[1] ?? '').split('-').map(Number);
  const cellTokens = (sections[2] ?? '').split('-');

  const weightsValid =
    columnWeights.length > 0 &&
    rowWeights.length > 0 &&
    columnWeights.every((n) => Number.isFinite(n) && n > 0) &&
    rowWeights.every((n) => Number.isFinite(n) && n > 0);

  if (!weightsValid || cellTokens.length !== columnWeights.length * rowWeights.length) {
    issues.add(key, `"${raw}" has an inconsistent grid; using the default`);
    return fallback;
  }

  const cells: SashCell[] = [];
  for (const token of cellTokens) {
    const dot = token.indexOf('.');
    const openingRaw = dot === -1 ? token : token.slice(0, dot);
    const barsRaw = dot === -1 ? 'n' : token.slice(dot + 1);
    const opening = OPENING.decode(openingRaw);
    if (opening === undefined) {
      issues.add(key, `"${openingRaw}" is not a recognised opening; that light is now fixed`);
    }
    cells.push({
      opening: opening ?? 'fixed',
      bars: decodeBars(barsRaw, { ...NO_BARS }, key, issues),
    });
  }
  return { columnWeights, rowWeights, cells };
}

function decodeGlazing(raw: string | null, fallback: Glazing, issues: Issues): Glazing {
  if (raw === null) return fallback;
  const [appearance, unitRaw, detail] = raw.split('.');
  const unit = UNIT.decode(unitRaw) ?? fallback.unit;
  if (unitRaw !== undefined && UNIT.decode(unitRaw) === undefined) {
    issues.add('g', `"${unitRaw}" is not a recognised glazing unit; using "${fallback.unit}"`);
  }
  switch (appearance) {
    case 'c':
      return { appearance: 'clear', unit };
    case 't': {
      const tint = TINT.decode(detail);
      if (tint === undefined) {
        issues.add('g', `"${detail}" is not a recognised tint; using bronze`);
      }
      return { appearance: 'tinted', tint: tint ?? 'bronze', unit };
    }
    case 'o': {
      const pattern = OBSCURE.decode(detail);
      if (pattern === undefined) {
        issues.add('g', `"${detail}" is not a recognised obscure pattern; using sandblast`);
      }
      return { appearance: 'obscure', pattern: pattern ?? 'sandblast', unit };
    }
    default:
      issues.add('g', `"${raw}" is not a recognised glazing; using the default`);
      return fallback;
  }
}

function decodePanelDetail(raw: string | null, fallback: PanelDetail, issues: Issues): PanelDetail {
  if (raw === null) return fallback;
  const parts = raw.split('.');
  switch (parts[0]) {
    case 'fl':
      return { kind: 'flush' };
    case 'r': {
      const panels = Number(parts[1]);
      const moulding = MOULDING.decode(parts[2]);
      if (![1, 2, 3, 4].includes(panels) || moulding === undefined) {
        issues.add('pd', `"${raw}" is not a valid raised-panel detail; using the default`);
        return fallback;
      }
      return { kind: 'raised', panels: panels as 1 | 2 | 3 | 4, moulding };
    }
    case 'g': {
      const grooves = Number(parts[1]);
      const grooveWidth = Number(parts[2]);
      if (!Number.isFinite(grooves) || grooves < 1 || grooves > 20 || !Number.isFinite(grooveWidth)) {
        issues.add('pd', `"${raw}" is not a valid grooved detail; using the default`);
        return fallback;
      }
      return {
        kind: 'grooved',
        grooves: Math.round(grooves),
        grooveWidth,
        orientation: parts[3] === 'h' ? 'horizontal' : 'vertical',
      };
    }
    default:
      issues.add('pd', `"${raw}" is not a recognised panel detail; using the default`);
      return fallback;
  }
}

function decodeAperture(
  params: URLSearchParams,
  fallback: { shape: 'rectangular' | 'arched' | 'circular'; bars: BarLayout; inset: number },
  issues: Issues,
) {
  const raw = params.get('ap');
  let shape = fallback.shape;
  let inset = fallback.inset;
  if (raw !== null) {
    const [shapeCode, insetRaw] = raw.split('.');
    shape = shapeCode === 'a' ? 'arched' : shapeCode === 'c' ? 'circular' : 'rectangular';
    if (shapeCode !== 'a' && shapeCode !== 'c' && shapeCode !== 'r') {
      issues.add('ap', `"${shapeCode}" is not a recognised aperture shape; using rectangular`);
    }
    const parsed = Number(insetRaw);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 500) {
      inset = parsed;
    } else {
      issues.add('ap', `"${insetRaw}" is not a valid aperture inset; using ${fallback.inset}`);
    }
  }
  return { shape, inset, bars: decodeBars(params.get('ab'), fallback.bars, 'ab', issues) };
}

function decodeSideLight(
  raw: string | null,
  fallback: SideLight | null,
  key: string,
  issues: Issues,
): SideLight | null {
  if (raw === null) return fallback;
  if (raw === NONE) return null;
  const [widthRaw, ...barParts] = raw.split('.');
  const width = Number(widthRaw);
  if (!Number.isFinite(width) || width <= 0) {
    issues.add(key, `"${raw}" is not a valid side light; it has been removed`);
    return null;
  }
  return {
    width,
    bars: decodeBars(barParts.join('.') || 'n', { ...NO_BARS }, key, issues),
  };
}

function decodeTopLight(raw: string | null, fallback: TopLight | null, issues: Issues): TopLight | null {
  if (raw === null) return fallback;
  if (raw === NONE) return null;
  const [heightRaw, shapeRaw, ...barParts] = raw.split('.');
  const height = Number(heightRaw);
  if (!Number.isFinite(height) || height <= 0) {
    issues.add('tl', `"${raw}" is not a valid top light; it has been removed`);
    return null;
  }
  return {
    shape: shapeRaw === 'a' ? 'arched' : 'rectangular',
    height,
    bars: decodeBars(barParts.join('.') || 'n', { ...NO_BARS }, 'tl', issues),
  };
}

export function decodeConfig(input: URLSearchParams | string): DecodeResult {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const issues = new Issues();

  const version = Number(params.get('v') ?? CONFIG_SCHEMA_VERSION);
  if (Number.isFinite(version) && version > CONFIG_SCHEMA_VERSION) {
    issues.add(
      'v',
      `this link was made with a newer version of the configurator (v${version}); some options may have been reset`,
    );
  }

  const productType = readCode(params, 'p', PRODUCT, 'door', issues);
  const base = productType === 'door' ? DEFAULT_DOOR : DEFAULT_WINDOW;
  const limits = SIZE_LIMITS[productType];

  const dimensions = {
    width: readNumber(params, 'w', base.dimensions.width, {
      min: limits.minWidth,
      max: limits.maxWidth,
    }, issues),
    height: readNumber(params, 'h', base.dimensions.height, {
      min: limits.minHeight,
      max: limits.maxHeight,
    }, issues),
  };

  const colourRaw = params.get('c');
  let colour = base.colour;
  if (colourRaw !== null) {
    if (isRalCode(colourRaw)) {
      colour = { mode: 'ral', code: colourRaw };
    } else if (/^x[0-9a-fA-F]{6}$/.test(colourRaw)) {
      colour = { mode: 'explore', hex: `#${colourRaw.slice(1).toLowerCase()}` };
    } else {
      issues.add('c', `"${colourRaw}" is not an available colour; using the default`);
    }
  }

  const common = {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    dimensions,
    colour,
    finish: readCode(params, 'f', FINISH, base.finish, issues),
    glazing: decodeGlazing(params.get('g'), base.glazing, issues),
  };

  const config: ConfigState =
    productType === 'door'
      ? { ...common, ...decodeDoor(params, issues) }
      : { ...common, ...decodeWindow(params, issues) };

  return { config, issues: issues.list };
}

function decodeDoor(params: URLSearchParams, issues: Issues): Omit<DoorConfigState, keyof typeof COMMON_KEYS> {
  const styleId = readCode(params, 's', DOOR_STYLE, DEFAULT_DOOR.style.id, issues);

  let style: DoorConfigState['style'];
  switch (styleId) {
    case 'solid-panel':
      style = {
        id: 'solid-panel',
        options: {
          panelDetail: decodePanelDetail(
            params.get('pd'),
            DEFAULT_DOOR_STYLE_OPTIONS['solid-panel'].panelDetail,
            issues,
          ),
        },
      };
      break;
    case 'half-glazed': {
      const defaults = DEFAULT_DOOR_STYLE_OPTIONS['half-glazed'];
      style = {
        id: 'half-glazed',
        options: {
          glazedFraction: readNumber(params, 'gf', defaults.glazedFraction, { min: 0.1, max: 0.9 }, issues),
          aperture: decodeAperture(params, defaults.aperture, issues),
          panelDetail: decodePanelDetail(params.get('pd'), defaults.panelDetail, issues),
        },
      };
      break;
    }
    case 'full-glazed': {
      const defaults = DEFAULT_DOOR_STYLE_OPTIONS['full-glazed'];
      style = { id: 'full-glazed', options: { aperture: decodeAperture(params, defaults.aperture, issues) } };
      break;
    }
  }

  const numeralsRaw = params.get('nm');
  let numerals: DoorConfigState['hardware']['numerals'] =
    numeralsRaw === null ? DEFAULT_DOOR.hardware.numerals : null;
  if (numeralsRaw !== null && numeralsRaw !== NONE) {
    const [value, placementCode] = numeralsRaw.split('.');
    if (!value || value.length > MAX_NUMERAL_LENGTH) {
      issues.add('nm', `"${numeralsRaw}" is not a usable house number; numerals have been removed`);
    } else {
      numerals = {
        value,
        placement:
          placementCode === 'a' ? 'above-letterplate' : placementCode === 's' ? 'on-side-light' : 'centre',
      };
    }
  }

  return {
    productType: 'door',
    style,
    surround: {
      leftSideLight: decodeSideLight(params.get('sl'), DEFAULT_DOOR.surround.leftSideLight, 'sl', issues),
      rightSideLight: decodeSideLight(params.get('sr'), DEFAULT_DOOR.surround.rightSideLight, 'sr', issues),
      topLight: decodeTopLight(params.get('tl'), DEFAULT_DOOR.surround.topLight, issues),
    },
    hardware: {
      handle: readCode(params, 'hw', DOOR_HANDLE, DEFAULT_DOOR.hardware.handle, issues),
      finish: readCode(params, 'hf', HARDWARE_FINISH, DEFAULT_DOOR.hardware.finish, issues),
      letterplate: readFlag(params, 'lp', DEFAULT_DOOR.hardware.letterplate),
      spyhole: readFlag(params, 'sh', DEFAULT_DOOR.hardware.spyhole),
      knocker: readOptionalCode(params, 'kn', KNOCKER, DEFAULT_DOOR.hardware.knocker, issues),
      numerals,
    },
    hingeSide: params.get('hg') === 'r' ? 'right' : 'left',
    openingDirection: params.get('od') === 'o' ? 'outward' : 'inward',
  };
}

function decodeWindow(
  params: URLSearchParams,
  issues: Issues,
): Omit<WindowConfigState, keyof typeof COMMON_KEYS> {
  const styleId = readCode(params, 's', WINDOW_STYLE, DEFAULT_WINDOW.style.id, issues);

  let style: WindowConfigState['style'];
  switch (styleId) {
    case 'casement':
      style = {
        id: 'casement',
        options: {
          grid: decodeGrid(params.get('gd'), DEFAULT_WINDOW_STYLE_OPTIONS.casement.grid, 'gd', issues),
        },
      };
      break;
    case 'tilt-and-turn':
      style = {
        id: 'tilt-and-turn',
        options: {
          grid: decodeGrid(
            params.get('gd'),
            DEFAULT_WINDOW_STYLE_OPTIONS['tilt-and-turn'].grid,
            'gd',
            issues,
          ),
          turnHingeSide: params.get('th') === 'r' ? 'right' : 'left',
        },
      };
      break;
    case 'sash': {
      const defaults = DEFAULT_WINDOW_STYLE_OPTIONS.sash;
      style = {
        id: 'sash',
        options: {
          operation: params.get('op') === 'sh' ? 'single-hung' : 'double-hung',
          meetingRailPosition: readNumber(params, 'mr', defaults.meetingRailPosition, { min: 0.2, max: 0.8 }, issues),
          horns: readFlag(params, 'ho', defaults.horns),
          upperBars: decodeBars(params.get('ub'), defaults.upperBars, 'ub', issues),
          lowerBars: decodeBars(params.get('lb'), defaults.lowerBars, 'lb', issues),
        },
      };
      break;
    }
    case 'bay': {
      const defaults = DEFAULT_WINDOW_STYLE_OPTIONS.bay;
      const sharesRaw = params.get('bs');
      let segments = defaults.segments;
      if (sharesRaw !== null) {
        const shares = sharesRaw.split('-').map(Number);
        const total = shares.reduce((sum, n) => sum + n, 0);
        if (shares.length < 2 || shares.length > 5 || shares.some((n) => !Number.isFinite(n) || n <= 0)) {
          issues.add('bs', `"${sharesRaw}" is not a valid bay layout; using the default`);
        } else {
          segments = shares.map((share, index) => ({
            widthShare: share / total,
            grid: decodeGrid(params.get(`bg${index}`), makeGrid(1, 1), `bg${index}`, issues),
          }));
        }
      }
      const angle = Number(params.get('ca') ?? defaults.cornerAngle);
      style = {
        id: 'bay',
        options: {
          segments,
          cornerAngle: angle === 90 || angle === 135 || angle === 150 ? angle : defaults.cornerAngle,
          returnDepth: readNumber(params, 'rd', defaults.returnDepth, { min: 150, max: 1200 }, issues),
        },
      };
      break;
    }
    case 'fixed':
      style = {
        id: 'fixed',
        options: {
          bars: decodeBars(params.get('fb'), DEFAULT_WINDOW_STYLE_OPTIONS.fixed.bars, 'fb', issues),
        },
      };
      break;
  }

  return {
    productType: 'window',
    style,
    hardware: {
      handle: readCode(params, 'hw', WINDOW_HANDLE, DEFAULT_WINDOW.hardware.handle, issues),
      finish: readCode(params, 'hf', HARDWARE_FINISH, DEFAULT_WINDOW.hardware.finish, issues),
    },
  };
}

/** Field names owned by ConfigCommon, excluded from the per-product decoders. */
const COMMON_KEYS = {
  schemaVersion: 0,
  dimensions: 0,
  colour: 0,
  finish: 0,
  glazing: 0,
} as const;
