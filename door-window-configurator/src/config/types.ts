/**
 * ConfigState — the canonical configuration model for the configurator.
 *
 * Design rules this file follows:
 *
 * 1. `ConfigState` is a discriminated union on `productType`. Doors and windows
 *    share dimensions, colour, finish and glazing; everything else is specific
 *    to the product and is not representable on the wrong one.
 *
 * 2. Per-style options hang off the style discriminant, so impossible
 *    combinations do not type-check. A full-glazed door cannot carry raised
 *    panel detailing; a fixed window cannot carry an opening direction.
 *
 * 3. Adding a style is a new key in the relevant style-option map plus a new
 *    parametric builder. The compiler then reports every switch that must
 *    handle it. No new art assets, per the core architectural constraint.
 *
 * 4. Nothing here is UI state. Camera preset, silhouette toggle, panel section
 *    expansion and the in-progress text of a numeric input all live in UI
 *    state, not in the shared configuration.
 */

import type { Mm } from './units';
import type { RalCode } from './ral';

/**
 * Bumped whenever an existing field changes meaning or is removed. Additive
 * changes (a new style, a new RAL shade) do not require a bump — the decoder
 * falls back to defaults for anything it does not recognise.
 */
export const CONFIG_SCHEMA_VERSION = 1;

/* ------------------------------------------------------------------ *
 * Shared vocabulary
 * ------------------------------------------------------------------ */

export type ProductType = 'door' | 'window';

/** Structural size of the outer frame, i.e. the hole in the wall. */
export interface Dimensions {
  /** Overall structural width, including any side lights and their mullions. */
  width: Mm;
  /** Overall structural height, including any top light and its transom. */
  height: Mm;
}

/**
 * Colour is split by orderability so that the "explore" path cannot reach a
 * quote by accident. Only `OrderableColour` is accepted by the enquiry payload
 * (Step 8), which the compiler enforces.
 */
export type ColourSelection = OrderableColour | ExploreColour;

export interface OrderableColour {
  mode: 'ral';
  code: RalCode;
}

export interface ExploreColour {
  mode: 'explore';
  /** Lowercase six-digit hex, with leading '#'. */
  hex: string;
}

export function isOrderableColour(colour: ColourSelection): colour is OrderableColour {
  return colour.mode === 'ral';
}

/** Surface finish, selected independently of colour (Step 5.3). */
export type Finish = 'smooth' | 'textured' | 'woodgrain-foil';

export type GlazingUnit = 'double' | 'triple';

export type TintColour = 'bronze' | 'grey' | 'blue';

/**
 * Obscure patterns are rendered procedurally (a generated normal map), not from
 * photographed glass. Named commercial patterns are approximations.
 */
export type ObscurePattern = 'sandblast' | 'reeded' | 'stippled' | 'cathedral';

/**
 * The brief lists "clear, obscure, tinted, double, triple" as one set. They are
 * two orthogonal axes — how the glass looks, and how many panes the sealed unit
 * has — so they are modelled separately here. See the note raised at Step 1.
 */
export type GlazingAppearance =
  | { appearance: 'clear' }
  | { appearance: 'tinted'; tint: TintColour }
  | { appearance: 'obscure'; pattern: ObscurePattern };

export type Glazing = GlazingAppearance & { unit: GlazingUnit };

export type HardwareFinish = 'chrome' | 'satin-chrome' | 'black' | 'brass' | 'anthracite';

/**
 * Glazing bar layout. `true-bar` genuinely divides the glazing into separate
 * sealed units; the other two are applied to a single unit. The distinction is
 * visible at the reveal and affects price, so it is modelled, not styled.
 */
export type BarStyle = 'none' | 'georgian-internal' | 'applied-astragal' | 'true-bar';

export interface BarLayout {
  style: BarStyle;
  /** Number of vertical divisions of the glazed area. 1 = no vertical bar. */
  columns: number;
  /** Number of horizontal divisions of the glazed area. 1 = no horizontal bar. */
  rows: number;
  /** Face width of the bar. */
  barWidth: Mm;
}

export const NO_BARS: BarLayout = { style: 'none', columns: 1, rows: 1, barWidth: 0 };

/* ------------------------------------------------------------------ *
 * Doors
 * ------------------------------------------------------------------ */

export type DoorStyleId = 'solid-panel' | 'half-glazed' | 'full-glazed';

/** Shape of the glazed aperture in a door leaf. All parametric. */
export type ApertureShape = 'rectangular' | 'arched' | 'circular';

export interface DoorAperture {
  shape: ApertureShape;
  bars: BarLayout;
  /** Distance from the leaf edge to the aperture, all four sides. */
  inset: Mm;
}

/** Panel detailing (Step 6.2). Only meaningful where a solid area exists. */
export type PanelDetail =
  | { kind: 'flush' }
  | { kind: 'raised'; panels: 1 | 2 | 3 | 4; moulding: MouldingProfile }
  | { kind: 'grooved'; grooves: number; grooveWidth: Mm; orientation: 'horizontal' | 'vertical' };

/** Swept profile for a raised panel surround, extruded along the panel path. */
export type MouldingProfile = 'ovolo' | 'chamfer' | 'square';

/**
 * Per-style door options. A style's options are reachable only through that
 * style, so `solid-panel` has no aperture and `full-glazed` has no panelling.
 */
export interface DoorStyleOptions {
  'solid-panel': {
    panelDetail: PanelDetail;
  };
  'half-glazed': {
    /** Proportion of the leaf height that is glazed, measured from the top. */
    glazedFraction: number;
    aperture: DoorAperture;
    panelDetail: PanelDetail;
  };
  'full-glazed': {
    aperture: DoorAperture;
  };
}

export type DoorStyle = {
  [K in DoorStyleId]: { id: K; options: DoorStyleOptions[K] };
}[DoorStyleId];

/** Side lights and top light (Step 6.1). */
export interface DoorSurround {
  /** Structural width of the left side light, or null for none. */
  leftSideLight: SideLight | null;
  rightSideLight: SideLight | null;
  topLight: TopLight | null;
}

export interface SideLight {
  width: Mm;
  bars: BarLayout;
}

export interface TopLight {
  height: Mm;
  shape: 'rectangular' | 'arched';
  bars: BarLayout;
}

export type DoorHandleStyle = 'lever-backplate' | 'lever-rose' | 'pull-bar' | 'knob';

/**
 * Knocker forms are restricted to shapes that can be generated parametrically
 * (a lathed ring, a lathed urn body). Figurative knockers are out of scope
 * under the no-asset constraint.
 */
export type KnockerStyle = 'ring' | 'doctor' | 'urn';

export interface DoorNumerals {
  /** Free text so that "12A" and "221B" work. Length-capped at validation. */
  value: string;
  placement: 'centre' | 'above-letterplate' | 'on-side-light';
}

export interface DoorHardware {
  handle: DoorHandleStyle;
  finish: HardwareFinish;
  letterplate: boolean;
  knocker: KnockerStyle | null;
  spyhole: boolean;
  numerals: DoorNumerals | null;
}

export interface DoorConfig {
  productType: 'door';
  style: DoorStyle;
  surround: DoorSurround;
  hardware: DoorHardware;
  /** Side carrying the hinges, viewed from outside. */
  hingeSide: 'left' | 'right';
  /** Direction the leaf swings, viewed from outside. */
  openingDirection: 'inward' | 'outward';
}

/* ------------------------------------------------------------------ *
 * Windows
 * ------------------------------------------------------------------ */

export type WindowStyleId = 'casement' | 'tilt-and-turn' | 'sash' | 'bay' | 'fixed';

/** How an individual light opens (Step 7.3). */
export type SashOpening =
  | 'fixed'
  | 'side-hung-left'
  | 'side-hung-right'
  | 'top-hung'
  | 'bottom-hung';

export interface SashCell {
  opening: SashOpening;
  bars: BarLayout;
}

/**
 * A frame divided into a grid of lights. Column and row weights are relative
 * and normalised at render time, so the grid stays proportional as the overall
 * dimensions change — the model is genuinely dimension-driven rather than a
 * fixed shape scaled up.
 *
 * Invariant: cells.length === columnWeights.length * rowWeights.length, in
 * row-major order. Enforced at decode and by the store's update helpers.
 */
export interface SashGrid {
  columnWeights: number[];
  rowWeights: number[];
  cells: SashCell[];
}

export interface BaySegment {
  /** Share of the overall structural width taken by this facet. */
  widthShare: number;
  grid: SashGrid;
}

export interface WindowStyleOptions {
  casement: {
    grid: SashGrid;
  };
  'tilt-and-turn': {
    grid: SashGrid;
    /** Side the turn hinge sits on; tilt is always at the head. */
    turnHingeSide: 'left' | 'right';
  };
  sash: {
    operation: 'single-hung' | 'double-hung';
    /** Height of the meeting rail as a fraction of the frame height. */
    meetingRailPosition: number;
    horns: boolean;
    upperBars: BarLayout;
    lowerBars: BarLayout;
  };
  bay: {
    /**
     * Facets across the front, left to right. Two segments make a splayed bay,
     * three or more a classic bay. See the flag raised at Step 1: `width` for a
     * bay is the overall span across the wall opening, and `returnDepth` is how
     * far the bay projects from it.
     */
    segments: BaySegment[];
    /** Internal angle between adjacent facets, degrees. */
    cornerAngle: 90 | 135 | 150;
    returnDepth: Mm;
  };
  fixed: {
    bars: BarLayout;
  };
}

export type WindowStyle = {
  [K in WindowStyleId]: { id: K; options: WindowStyleOptions[K] };
}[WindowStyleId];

/**
 * Window handles mirror the door set minus the pull bar, which does not exist
 * as a window handle. Flagged at Step 1 as a deliberate deviation from 7.4.
 */
export type WindowHandleStyle = 'lever-backplate' | 'lever-rose' | 'knob';

export interface WindowHardware {
  handle: WindowHandleStyle;
  finish: HardwareFinish;
}

export interface WindowConfig {
  productType: 'window';
  style: WindowStyle;
  hardware: WindowHardware;
}

/* ------------------------------------------------------------------ *
 * ConfigState
 * ------------------------------------------------------------------ */

interface ConfigCommon {
  schemaVersion: number;
  dimensions: Dimensions;
  colour: ColourSelection;
  finish: Finish;
  glazing: Glazing;
}

export type ConfigState = (ConfigCommon & DoorConfig) | (ConfigCommon & WindowConfig);

export type DoorConfigState = ConfigCommon & DoorConfig;
export type WindowConfigState = ConfigCommon & WindowConfig;

/**
 * A configuration that has passed dimension validation and carries an orderable
 * colour. The enquiry payload (Step 8) takes this type and nothing else, so an
 * explore colour or an unmanufacturable size cannot reach a quote.
 */
export type QuotableConfig = ConfigState & { colour: OrderableColour } & {
  readonly __quotable: unique symbol;
};

/** Exhaustiveness guard for style switches. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
