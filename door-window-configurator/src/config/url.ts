/**
 * URL serialisation for ConfigState (Step 1.2).
 *
 * Goals, in priority order:
 *   1. A link always decodes to a usable configuration. Unknown, missing or
 *      malformed values fall back to defaults and are reported as issues; the
 *      decoder never throws.
 *   2. Links are inspectable. Short keys and mnemonic codes, not an opaque
 *      blob, so a support enquiry quoting a URL can be read by a human.
 *   3. Links stay short, and bounded. See WORST_CASE notes in url.test.ts.
 *
 * Every field is written, including the switched-off ones, with `n` as the
 * explicit "not fitted" token. Encoding an option by its presence alone makes
 * "the customer turned this off" indistinguishable from "this link predates
 * the option", and those two must fall back differently.
 *
 * Separator discipline — only characters `URLSearchParams` leaves unescaped:
 *      *   section separator within one value
 *      -   list item separator
 *      .   field separator within a list item, and the decimal point for
 *          standalone numeric values
 *      _   field separator inside a bar-layout token
 * Consequence: values encoded at list depth (grid weights, bar widths) are
 * whole units in the URL. Dimensions, which have their own keys, round-trip to
 * 0.1 mm.
 *
 * Key codes are never reused across schema versions — see RETIRED_KEYS in
 * migrations.ts.
 */

import type {
  BarLayout,
  FinishPair,
  SafetyOverride,
  BarStyle,
  ColourPair,
  ColourSelection,
  ConfigState,
  DoorConfigState,
  DoorHandleStyle,
  DoorStyleId,
  Glazing,
  GlazingUnit,
  HardwareFinish,
  InternalColour,
  KnockerStyle,
  MouldingProfile,
  ObscurePattern,
  PanelDetail,
  ProductType,
  SafetyGlazing,
  SashCell,
  SashGrid,
  SashOpening,
  SideLight,
  ThresholdType,
  TintColour,
  TopLight,
  TrickleVentPosition,
  TrickleVents,
  WindowConfigState,
  WindowHandleStyle,
  WindowStyleId,
} from './types';
import { CONFIG_SCHEMA_VERSION, NO_BARS } from './types';
import type { Finish, FrameMaterial } from './material';
import { isMaterialOffered, MATERIALS } from './material';
import { isRalCode } from './ral';
import {
  DEFAULT_DOOR,
  DEFAULT_DOOR_STYLE_OPTIONS,
  DEFAULT_MATERIAL,
  DEFAULT_WINDOW,
  DEFAULT_WINDOW_STYLE_OPTIONS,
} from './defaults';
import { sizeLimits } from './limits';
import { migrateParams } from './migrations';
import { reconcileWithMaterial } from './validate';

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

const MATERIAL = codes<FrameMaterial>({
  upvc: 'u',
  aluminium: 'a',
  timber: 't',
  composite: 'c',
});
const PRODUCT = codes<ProductType>({ door: 'd', window: 'w' });
const FINISH = codes<Finish>({ smooth: 'sm', textured: 'tx', 'woodgrain-foil': 'wg' });
const UNIT = codes<GlazingUnit>({ double: '2', triple: '3' });
const SAFETY = codes<SafetyGlazing>({ none: 'n', toughened: 't', laminated: 'l' });

/**
 * Per-pane override. 'i' is an explicit "inherit the product-level value", so
 * a v3 link always states it. An ABSENT trailing field also reads as inherit,
 * which is what makes the v2 → v3 addition backward compatible.
 */
const INHERIT = 'i';

function encodeSafetyOverride(override: SafetyOverride): string {
  return override === null ? INHERIT : SAFETY.encode(override);
}

function decodeSafetyOverride(raw: string | undefined): SafetyOverride {
  if (raw === undefined || raw === INHERIT) return null;
  return SAFETY.decode(raw) ?? null;
}
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
  knob: 'kb',
});
const WINDOW_HANDLE = codes<WindowHandleStyle>({
  'lever-backplate': 'lb',
  'lever-rose': 'lr',
  knob: 'kb',
});
const KNOCKER = codes<KnockerStyle>({ ring: 'rg', doctor: 'dr', urn: 'ur' });
const MOULDING = codes<MouldingProfile>({ ovolo: 'ov', chamfer: 'cf', square: 'sq' });
const THRESHOLD = codes<ThresholdType>({ standard: 'st', 'low-level-access': 'lo' });
const VENT_POSITION = codes<TrickleVentPosition>({
  'head-of-frame': 'hf',
  'in-sash': 'is',
  'through-glazing': 'tg',
});
const DOOR_STYLE = codes<DoorStyleId>({
  'solid-panel': 'sp',
  'half-glazed': 'hg',
  'full-glazed': 'fg',
});
const WINDOW_STYLE = codes<WindowStyleId>({
  casement: 'cs',
  'tilt-and-turn': 'tt',
  sash: 'sa',
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
  if (bars.style === 'none') return NONE;
  return [BAR_STYLE.encode(bars.style), int(bars.columns), int(bars.rows), int(bars.barWidth)].join('_');
}

function encodeGrid(grid: SashGrid): string {
  const cells = grid.cells
    .map(
      (cell) =>
        `${OPENING.encode(cell.opening)}.${encodeBars(cell.bars)}.${encodeSafetyOverride(cell.safety)}`,
    )
    .join('-');
  return [grid.columnWeights.map(int).join('-'), grid.rowWeights.map(int).join('-'), cells].join('*');
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

function encodeFinishPair(finish: FinishPair, params: URLSearchParams): void {
  params.set('fe', FINISH.encode(finish.external));
  params.set('fi', finish.internal === 'match' ? 'm' : FINISH.encode(finish.internal));
}

function encodeColour(colour: ColourSelection): string {
  return colour.mode === 'ral' ? colour.code : `x${colour.hex.slice(1)}`;
}

function encodeInternalColour(colour: InternalColour): string {
  return colour.mode === 'match' ? 'm' : encodeColour(colour);
}

function encodeSideLight(light: SideLight): string {
  return `${int(light.width)}.${encodeBars(light.bars)}.${encodeSafetyOverride(light.safety)}`;
}

function encodeTopLight(light: TopLight): string {
  return [
    int(light.height),
    light.shape === 'arched' ? 'a' : 'r',
    encodeBars(light.bars),
    encodeSafetyOverride(light.safety),
  ].join('.');
}

function encodeTrickleVents(vents: TrickleVents | null): string {
  return vents === null ? NONE : `${VENT_POSITION.encode(vents.position)}.${int(vents.count)}`;
}

/* ------------------------------------------------------------------ *
 * Encoding
 * ------------------------------------------------------------------ */

export function encodeConfig(config: ConfigState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('v', String(config.schemaVersion));
  params.set('m', MATERIAL.encode(config.material));
  params.set('p', PRODUCT.encode(config.productType));
  params.set('w', num(config.dimensions.width));
  params.set('h', num(config.dimensions.height));
  params.set('ce', encodeColour(config.colour.external));
  params.set('ci', encodeInternalColour(config.colour.internal));
  encodeFinishPair(config.finish, params);
  params.set('g', encodeGlazing(config.glazing));
  params.set('sg', SAFETY.encode(config.glazing.safety));
  params.set('tv', encodeTrickleVents(config.trickleVents));

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
      params.set(
        'ap',
        `${config.style.options.aperture.shape[0]}.${int(config.style.options.aperture.inset)}.${encodeSafetyOverride(config.style.options.aperture.safety)}`,
      );
      params.set('ab', encodeBars(config.style.options.aperture.bars));
      break;
    case 'full-glazed':
      params.set(
        'ap',
        `${config.style.options.aperture.shape[0]}.${int(config.style.options.aperture.inset)}.${encodeSafetyOverride(config.style.options.aperture.safety)}`,
      );
      params.set('ab', encodeBars(config.style.options.aperture.bars));
      break;
  }

  params.set('sl', config.surround.leftSideLight ? encodeSideLight(config.surround.leftSideLight) : NONE);
  params.set('sr', config.surround.rightSideLight ? encodeSideLight(config.surround.rightSideLight) : NONE);
  params.set('tl', config.surround.topLight ? encodeTopLight(config.surround.topLight) : NONE);

  params.set('hw', DOOR_HANDLE.encode(config.hardware.handle));
  params.set('hf', HARDWARE_FINISH.encode(config.hardware.finish));
  params.set('lp', config.hardware.letterplate ? '1' : '0');
  params.set('sh', config.hardware.spyhole ? '1' : '0');
  params.set('kn', config.hardware.knocker ? KNOCKER.encode(config.hardware.knocker) : NONE);
  params.set('tr', THRESHOLD.encode(config.threshold));
  // Handing, stated as viewed from outside — see HANDING_CONVENTION.
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
      // The turn hinge is each light's opening, in `gd`. Links made before
      // it had one source also carry `th`; the decoder ignores it.
      params.set('gd', encodeGrid(config.style.options.grid));
      break;
    case 'sash':
      params.set('op', config.style.options.operation === 'double-hung' ? 'dh' : 'sh');
      params.set('mr', num(config.style.options.meetingRailPosition));
      params.set('ho', config.style.options.horns ? '1' : '0');
      params.set('ub', encodeBars(config.style.options.upperBars));
      params.set('lb', encodeBars(config.style.options.lowerBars));
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
 * Total by construction: every path returns a configuration. Anything
 * unreadable is replaced with the default for that field and reported in
 * `issues`, which the UI surfaces as a non-blocking notice. The decoded result
 * is then reconciled against the frame material, because a link may carry a
 * combination that was legal when it was shared and is not now.
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
  if (raw === NONE) return { ...NO_BARS };
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
    // Positional: opening.bars[.safety]. The trailing field was added in v3;
    // a v2 token has two fields and reads as "inherit".
    const [openingRaw, barsRaw, safetyRaw] = token.split('.');
    const opening = OPENING.decode(openingRaw);
    if (opening === undefined) {
      issues.add(key, `"${openingRaw ?? ''}" is not a recognised opening; that light is now fixed`);
    }
    cells.push({
      opening: opening ?? 'fixed',
      bars: decodeBars(barsRaw ?? NONE, { ...NO_BARS }, key, issues),
      safety: decodeSafetyOverride(safetyRaw),
    });
  }
  return { columnWeights, rowWeights, cells };
}

function decodeGlazing(
  raw: string | null,
  safetyRaw: string | null,
  fallback: Glazing,
  issues: Issues,
): Glazing {
  const safety = safetyRaw === null ? fallback.safety : (SAFETY.decode(safetyRaw) ?? fallback.safety);
  if (safetyRaw !== null && SAFETY.decode(safetyRaw) === undefined) {
    issues.add('sg', `"${safetyRaw}" is not a recognised safety glazing; using "${fallback.safety}"`);
  }

  if (raw === null) return { ...fallback, safety };
  const [appearance, unitRaw, detail] = raw.split('.');
  const unit = UNIT.decode(unitRaw) ?? fallback.unit;
  if (unitRaw !== undefined && UNIT.decode(unitRaw) === undefined) {
    issues.add('g', `"${unitRaw}" is not a recognised glazing unit; using "${fallback.unit}"`);
  }
  switch (appearance) {
    case 'c':
      return { appearance: 'clear', unit, safety };
    case 't': {
      const tint = TINT.decode(detail);
      if (tint === undefined) issues.add('g', `"${detail}" is not a recognised tint; using bronze`);
      return { appearance: 'tinted', tint: tint ?? 'bronze', unit, safety };
    }
    case 'o': {
      const pattern = OBSCURE.decode(detail);
      if (pattern === undefined) {
        issues.add('g', `"${detail}" is not a recognised obscure pattern; using sandblast`);
      }
      return { appearance: 'obscure', pattern: pattern ?? 'sandblast', unit, safety };
    }
    default:
      issues.add('g', `"${raw}" is not a recognised glazing; using the default`);
      return { ...fallback, safety };
  }
}

function decodeColour(
  raw: string | null,
  fallback: ColourSelection,
  key: string,
  issues: Issues,
): ColourSelection {
  if (raw === null) return fallback;
  if (isRalCode(raw)) return { mode: 'ral', code: raw };
  if (/^x[0-9a-fA-F]{6}$/.test(raw)) return { mode: 'explore', hex: `#${raw.slice(1).toLowerCase()}` };
  issues.add(key, `"${raw}" is not an available colour; using the default`);
  return fallback;
}

function decodeColourPair(params: URLSearchParams, fallback: ColourPair, issues: Issues): ColourPair {
  const external = decodeColour(params.get('ce'), fallback.external, 'ce', issues);
  const internalRaw = params.get('ci');
  if (internalRaw === null) return { external, internal: fallback.internal };
  if (internalRaw === 'm') return { external, internal: { mode: 'match' } };

  // An unreadable internal colour falls back to matching the outside rather
  // than to some other shade: matching is the one answer that is never wrong
  // for a customer who did not choose a contrasting inside.
  if (isRalCode(internalRaw)) return { external, internal: { mode: 'ral', code: internalRaw } };
  if (/^x[0-9a-fA-F]{6}$/.test(internalRaw)) {
    return { external, internal: { mode: 'explore', hex: `#${internalRaw.slice(1).toLowerCase()}` } };
  }
  issues.add('ci', `"${internalRaw}" is not an available colour; the inside now matches the outside`);
  return { external, internal: { mode: 'match' } };
}

function decodeFinishPair(params: URLSearchParams, fallback: FinishPair, issues: Issues): FinishPair {
  const external = readCode(params, 'fe', FINISH, fallback.external, issues);
  const internalRaw = params.get('fi');
  if (internalRaw === null) return { external, internal: fallback.internal };
  if (internalRaw === 'm') return { external, internal: 'match' };
  const internal = FINISH.decode(internalRaw);
  if (internal === undefined) {
    issues.add('fi', `"${internalRaw}" is not a recognised finish; the inside now matches the outside`);
    return { external, internal: 'match' };
  }
  return { external, internal };
}

function decodeTrickleVents(
  raw: string | null,
  fallback: TrickleVents | null,
  issues: Issues,
): TrickleVents | null {
  if (raw === null) return fallback;
  if (raw === NONE) return null;
  const [positionRaw, countRaw] = raw.split('.');
  const position = VENT_POSITION.decode(positionRaw);
  const count = Number(countRaw);
  if (position === undefined || !Number.isFinite(count) || count < 1 || count > 12) {
    issues.add('tv', `"${raw}" is not a valid trickle vent specification; using the default`);
    return fallback;
  }
  return { position, count: Math.round(count) };
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
  fallback: {
    shape: 'rectangular' | 'arched' | 'circular';
    bars: BarLayout;
    inset: number;
    safety: SafetyOverride;
  },
  issues: Issues,
) {
  const raw = params.get('ap');
  let shape = fallback.shape;
  let inset = fallback.inset;
  let safety = fallback.safety;
  if (raw !== null) {
    const [shapeCode, insetRaw, safetyRaw] = raw.split('.');
    safety = decodeSafetyOverride(safetyRaw);
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
  return { shape, inset, safety, bars: decodeBars(params.get('ab'), fallback.bars, 'ab', issues) };
}

function decodeSideLight(
  raw: string | null,
  fallback: SideLight | null,
  key: string,
  issues: Issues,
): SideLight | null {
  if (raw === null) return fallback;
  if (raw === NONE) return null;
  const [widthRaw, barsRaw, safetyRaw] = raw.split('.');
  const width = Number(widthRaw);
  if (!Number.isFinite(width) || width <= 0) {
    issues.add(key, `"${raw}" is not a valid side light; it has been removed`);
    return null;
  }
  return {
    width,
    bars: decodeBars(barsRaw ?? NONE, { ...NO_BARS }, key, issues),
    safety: decodeSafetyOverride(safetyRaw),
  };
}

function decodeTopLight(raw: string | null, fallback: TopLight | null, issues: Issues): TopLight | null {
  if (raw === null) return fallback;
  if (raw === NONE) return null;
  const [heightRaw, shapeRaw, barsRaw, safetyRaw] = raw.split('.');
  const height = Number(heightRaw);
  if (!Number.isFinite(height) || height <= 0) {
    issues.add('tl', `"${raw}" is not a valid top light; it has been removed`);
    return null;
  }
  return {
    shape: shapeRaw === 'a' ? 'arched' : 'rectangular',
    height,
    bars: decodeBars(barsRaw ?? NONE, { ...NO_BARS }, 'tl', issues),
    safety: decodeSafetyOverride(safetyRaw),
  };
}

export function decodeConfig(input: URLSearchParams | string): DecodeResult {
  const raw = typeof input === 'string' ? new URLSearchParams(input) : input;
  const issues = new Issues();

  // Older links are brought up to the current schema before any field is read.
  const { params, issues: migrationIssues } = migrateParams(raw);
  for (const issue of migrationIssues) issues.add(issue.key, issue.reason);

  const productType = readCode(params, 'p', PRODUCT, 'door', issues);
  // Only a material that is sold can come out of a link or stored state
  // (decided 2026-09-25 for the demo: uPVC only, and no link may decode to a
  // material that cannot be ordered). An older link for another material is
  // shown in the default, and says so.
  const requested = readCode(params, 'm', MATERIAL, DEFAULT_MATERIAL, issues);
  const material = isMaterialOffered(requested) ? requested : DEFAULT_MATERIAL;
  if (material !== requested) {
    issues.add('m', `made for ${MATERIALS[requested].label} frames, which are not offered; shown in ${MATERIALS[material].label}`);
  }
  const base = productType === 'door' ? DEFAULT_DOOR : DEFAULT_WINDOW;
  const limits = sizeLimits(material, productType);

  const common = {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    material,
    dimensions: {
      width: readNumber(params, 'w', base.dimensions.width, { min: limits.minWidth, max: limits.maxWidth }, issues),
      height: readNumber(params, 'h', base.dimensions.height, { min: limits.minHeight, max: limits.maxHeight }, issues),
    },
    colour: decodeColourPair(params, base.colour, issues),
    finish: decodeFinishPair(params, base.finish, issues),
    glazing: decodeGlazing(params.get('g'), params.get('sg'), base.glazing, issues),
  };

  const decoded: ConfigState =
    productType === 'door'
      ? { ...common, ...decodeDoor(params, issues) }
      : { ...common, ...decodeWindow(params, issues) };

  // A link can carry a combination that the catalogue no longer allows.
  const { config, issues: reconciliation } = reconcileWithMaterial(decoded);
  for (const issue of reconciliation) issues.add(issue.field, issue.message);

  return { config, issues: issues.list };
}

type DoorSpecific = Omit<DoorConfigState, keyof CommonKeys>;
type WindowSpecific = Omit<WindowConfigState, keyof CommonKeys>;

interface CommonKeys {
  schemaVersion: unknown;
  material: unknown;
  dimensions: unknown;
  colour: unknown;
  finish: unknown;
  glazing: unknown;
}

function decodeDoor(params: URLSearchParams, issues: Issues): DoorSpecific {
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
    },
    threshold: readCode(params, 'tr', THRESHOLD, DEFAULT_DOOR.threshold, issues),
    trickleVents: decodeTrickleVents(params.get('tv'), DEFAULT_DOOR.trickleVents, issues),
    hingeSide: params.get('hg') === 'r' ? 'right' : 'left',
    openingDirection: params.get('od') === 'o' ? 'outward' : 'inward',
  };
}

function decodeWindow(params: URLSearchParams, issues: Issues): WindowSpecific {
  const styleId = readCode(params, 's', WINDOW_STYLE, DEFAULT_WINDOW.style.id, issues);

  let style: WindowConfigState['style'];
  switch (styleId) {
    case 'casement':
      style = {
        id: 'casement',
        // Absent, the grid is the default window's own, not the style's: the
        // default window is a preset, and `p=w` must open as it.
        options: {
          grid: decodeGrid(
            params.get('gd'),
            DEFAULT_WINDOW.style.id === 'casement' ? DEFAULT_WINDOW.style.options.grid : DEFAULT_WINDOW_STYLE_OPTIONS.casement.grid,
            'gd',
            issues,
          ),
        },
      };
      break;
    case 'tilt-and-turn':
      style = {
        id: 'tilt-and-turn',
        options: {
          grid: decodeGrid(params.get('gd'), DEFAULT_WINDOW_STYLE_OPTIONS['tilt-and-turn'].grid, 'gd', issues),
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
    case 'fixed':
      style = {
        id: 'fixed',
        options: { bars: decodeBars(params.get('fb'), DEFAULT_WINDOW_STYLE_OPTIONS.fixed.bars, 'fb', issues) },
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
    trickleVents: decodeTrickleVents(params.get('tv'), DEFAULT_WINDOW.trickleVents, issues),
  };
}
