/**
 * ConfigState — the canonical configuration model for the configurator.
 *
 * Design rules this file follows:
 *
 * 1. `ConfigState` is a discriminated union on `productType`, and again on
 *    `style.id`. Per-style options hang off the style discriminant, so
 *    impossible combinations do not type-check.
 *
 * 2. Frame material gates colour, finish, sightlines and every size limit.
 *    Those cross-field rules cannot be expressed in the type system without
 *    making the model unusable, so they live in validate.ts and are applied on
 *    every material change and every decode.
 *
 * 3. Units and bases live in type names, not comments. `Mm`,
 *    `GlazedFractionOfLeafHeightFromTop`, `HingeSideViewedFromOutside`.
 *
 * 4. Adding a style is a new key in the relevant style-option map plus a new
 *    parametric builder. The compiler then reports every switch that must
 *    handle it. No new art assets, per the core architectural constraint.
 *
 * 5. Nothing here is UI state. Camera preset, silhouette toggle, panel section
 *    expansion and the in-progress text of a numeric input live elsewhere; the
 *    camera preset travels in its own URL parameter (view.ts), decoded
 *    independently of ConfigState.
 */

import type {
  ColumnWeight,
  GlazedFractionOfLeafHeightFromTop,
  MeetingRailFractionFromCill,
  Mm,
  RowWeight,
} from './units';
import type { FrameMaterial, Finish } from './material';
import type { RalCode } from './ral';

/**
 * Incremented only when an existing field changes meaning or is removed.
 * Additive changes do not bump it. See migrations.ts for the policy and for
 * the migration chain applied to older links.
 *
 * v1 → v2: single `colour` became an external/internal pair; frame material
 * added; safety glazing, trickle vents and door threshold added; bay windows
 * removed from the catalogue.
 * v2 → v3: single `finish` became an external/internal pair, mirroring colour.
 *          Per-pane safety overrides were ADDED, not changed — see the note on
 *          `g` in migrations.ts for why that needed no retirement.
 */
export const CONFIG_SCHEMA_VERSION = 3;

/* ------------------------------------------------------------------ *
 * Handing
 *
 * Wrong-handedness is a manufacturing error, not a display bug, so the
 * viewpoint is part of the type name at every use site and is restated in an
 * exported constant that the summary panel (Step 8.1) prints verbatim.
 *
 * !! CONFIRM WITH THE FABRICATOR !!  Viewed-from-outside is the common UK
 * convention for external doors, but it is not universal, and some suppliers
 * quote handing from the inside. If theirs differs, change it HERE and nowhere
 * else — every consumer reads the convention from this constant.
 * ------------------------------------------------------------------ */

export const HANDING_CONVENTION = {
  viewpoint: 'outside',
  /** Printed on the summary panel and on the enquiry, verbatim. */
  statement: 'Hinge side and opening direction are stated as viewed from outside the building.',
} as const;

/** Side carrying the hinges, as viewed from OUTSIDE the building. */
export type HingeSideViewedFromOutside = 'left' | 'right';

/** Direction the leaf swings, as viewed from OUTSIDE the building. */
export type OpeningDirectionViewedFromOutside = 'inward' | 'outward';

/** Restates a hinge side from the opposite viewpoint. Mirrors, by definition. */
export function hingeSideViewedFromInside(side: HingeSideViewedFromOutside): 'left' | 'right' {
  return side === 'left' ? 'right' : 'left';
}

/* ------------------------------------------------------------------ *
 * Shared vocabulary
 * ------------------------------------------------------------------ */

export type ProductType = 'door' | 'window';

/** Structural size of the outer frame: the hole in the wall. */
export interface Dimensions {
  /**
   * Overall structural width, INCLUDING any side lights and their mullions.
   * The door leaf width is derived from this, not the other way round.
   */
  width: Mm;
  /** Overall structural height, including any top light and its transom. */
  height: Mm;
}

/**
 * Colour is split by orderability so that the explore path cannot reach an
 * order by accident. An explore colour does not block an enquiry (it is
 * recorded as non-orderable), but it can never produce a `QuotableConfig`.
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

/** Internal colour may simply follow the external one. */
export type InternalColour = ColourSelection | { mode: 'match' };

export interface ColourPair {
  external: ColourSelection;
  /** Defaults to `{ mode: 'match' }`. */
  internal: InternalColour;
}

export function isOrderableColour(colour: ColourSelection): colour is OrderableColour {
  return colour.mode === 'ral';
}

/** Resolves `match` to the external selection. */
export function resolveInternalColour(pair: ColourPair): ColourSelection {
  return pair.internal.mode === 'match' ? pair.external : pair.internal;
}

/**
 * Finish is per side, like colour. A woodgrain-foil external face with a
 * smooth white internal face is an ordinary specification, and the renderer
 * has to know which face carries which material.
 */
export interface FinishPair {
  external: Finish;
  /** 'match' follows the external face. */
  internal: Finish | 'match';
}

export function resolveInternalFinish(pair: FinishPair): Finish {
  return pair.internal === 'match' ? pair.external : pair.internal;
}

export type GlazingUnit = 'double' | 'triple';

export type TintColour = 'bronze' | 'grey' | 'blue';

/**
 * Obscure patterns are generated procedurally (a computed normal map), not
 * photographed. Named commercial patterns are approximations — covered by the
 * indicative-only notice, which extends to finishes and obscure glass as well
 * as colour.
 */
export type ObscurePattern = 'sandblast' | 'reeded' | 'stippled' | 'cathedral';

/**
 * Safety glazing, independent of appearance and of pane count. Where Approved
 * Document K makes a location critical this is not the customer's choice —
 * see safety.ts, which returns the forced value and the reason for it.
 */
export type SafetyGlazing = 'none' | 'toughened' | 'laminated';

/**
 * The brief listed "clear, obscure, tinted, double, triple" as one set. They
 * are three independent axes: how the glass looks, how many panes the sealed
 * unit has, and whether it is a safety glass.
 */
/**
 * Per-pane override of the product-level safety glazing. `null` inherits.
 *
 * A critical location is a property of a PANE, not of a product: a side light
 * reaching the floor is critical while a top light at 1800 mm is not, and the
 * two can legitimately carry different glass. Phase 1 only ever sets safety at
 * product level, but the shape is here now so that per-pane specification is
 * not a schema change waiting behind the renderer.
 */
export type SafetyOverride = SafetyGlazing | null;

/** Identifies one glazed area within a product. */
export type PaneId =
  | 'leaf'
  | 'side-light-left'
  | 'side-light-right'
  | 'top-light'
  | `cell-${number}`;

export function resolveSafety(product: SafetyGlazing, override: SafetyOverride): SafetyGlazing {
  return override ?? product;
}

export type GlazingAppearance =
  | { appearance: 'clear' }
  | { appearance: 'tinted'; tint: TintColour }
  | { appearance: 'obscure'; pattern: ObscurePattern };

export type Glazing = GlazingAppearance & {
  unit: GlazingUnit;
  safety: SafetyGlazing;
};

export type HardwareFinish = 'chrome' | 'satin-chrome' | 'black' | 'brass' | 'anthracite';

/**
 * Glazing bar layout. `true-bar` genuinely divides the glazing into separate
 * sealed units; the other two are applied to a single unit. The distinction is
 * visible at the reveal and changes the price, so it is modelled, not styled.
 */
export type BarStyle = 'none' | 'georgian-internal' | 'applied-astragal' | 'true-bar';

export interface BarLayout {
  style: BarStyle;
  /** Vertical divisions of the glazed area. 1 = no vertical bar. */
  columns: number;
  /** Horizontal divisions of the glazed area. 1 = no horizontal bar. */
  rows: number;
  /** Face width of the bar. */
  barWidth: Mm;
}

export const NO_BARS: BarLayout = { style: 'none', columns: 1, rows: 1, barWidth: 0 };

/* ------------------------------------------------------------------ *
 * Ventilation
 *
 * Background ventilation is a regulatory requirement on most replacement
 * work in England (Approved Document F), so "fitted or not" is closer to a
 * compliance output than a customer preference. What actually gets specified
 * is equivalent area in mm² per room, which depends on the room the unit
 * serves — information the configurator does not have. See the note raised at
 * Step 1: `count` is a proxy and the enquiry must not read as a compliance
 * statement.
 * ------------------------------------------------------------------ */

export type TrickleVentPosition = 'head-of-frame' | 'in-sash' | 'through-glazing';

export interface TrickleVents {
  position: TrickleVentPosition;
  /** Number fitted across the head of the frame. */
  count: number;
}

/* ------------------------------------------------------------------ *
 * Doors
 * ------------------------------------------------------------------ */

export type DoorStyleId = 'solid-panel' | 'half-glazed' | 'full-glazed';

export type ApertureShape = 'rectangular' | 'arched' | 'circular';

export interface DoorAperture {
  shape: ApertureShape;
  bars: BarLayout;
  /** Distance from the leaf edge to the aperture, all four sides. */
  inset: Mm;
  safety: SafetyOverride;
}

export type MouldingProfile = 'ovolo' | 'chamfer' | 'square';

/** Panel detailing (Step 6.2). Only where a solid area exists. */
export type PanelDetail =
  | { kind: 'flush' }
  | { kind: 'raised'; panels: 1 | 2 | 3 | 4; moulding: MouldingProfile }
  | { kind: 'grooved'; grooves: number; grooveWidth: Mm; orientation: 'horizontal' | 'vertical' };

export interface DoorStyleOptions {
  'solid-panel': {
    panelDetail: PanelDetail;
  };
  'half-glazed': {
    glazedFraction: GlazedFractionOfLeafHeightFromTop;
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
  leftSideLight: SideLight | null;
  rightSideLight: SideLight | null;
  topLight: TopLight | null;
}

export interface SideLight {
  width: Mm;
  bars: BarLayout;
  safety: SafetyOverride;
}

export interface TopLight {
  height: Mm;
  shape: 'rectangular' | 'arched';
  bars: BarLayout;
  safety: SafetyOverride;
}

export function hasGlazedSurround(surround: DoorSurround): boolean {
  return (
    surround.leftSideLight !== null || surround.rightSideLight !== null || surround.topLight !== null
  );
}

/**
 * Threshold type. A low/level-access threshold trades weather performance for
 * step-free entry; it is the accessible option for a principal entrance.
 */
export type ThresholdType = 'standard' | 'low-level-access';

export type DoorHandleStyle = 'lever-backplate' | 'lever-rose' | 'pull-bar' | 'knob';

/**
 * Knocker forms are restricted to shapes that can be lathed or extruded
 * parametrically. Figurative knockers are out of scope under the no-asset
 * constraint.
 */
export type KnockerStyle = 'ring' | 'doctor' | 'urn';

export interface DoorHardware {
  handle: DoorHandleStyle;
  finish: HardwareFinish;
  letterplate: boolean;
  knocker: KnockerStyle | null;
  spyhole: boolean;
  /**
   * House numerals are deferred out of phase 1: glyphs require a font, which
   * is an art asset by any reading of the core constraint. Extension point —
   * add `numerals: DoorNumerals | null` here, an `nm` key in url.ts, and pick
   * between an extruded typeface and SVG-extruded digits.
   */
}

export interface DoorConfig {
  productType: 'door';
  style: DoorStyle;
  surround: DoorSurround;
  hardware: DoorHardware;
  threshold: ThresholdType;
  /**
   * Only permitted where the door has a glazed surround; a solid door leaf has
   * nowhere to put one. Cross-field, so enforced in validate.ts.
   */
  trickleVents: TrickleVents | null;
  hingeSide: HingeSideViewedFromOutside;
  openingDirection: OpeningDirectionViewedFromOutside;
}

/* ------------------------------------------------------------------ *
 * Windows
 * ------------------------------------------------------------------ */

export type WindowStyleId = 'casement' | 'tilt-and-turn' | 'sash' | 'fixed';

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
  safety: SafetyOverride;
}

/**
 * A frame divided into a grid of lights. Weights are relative and normalised
 * at render time, so proportions are genuinely driven by the dimensions rather
 * than a fixed shape being scaled.
 *
 * Invariant: cells.length === columnWeights.length * rowWeights.length, in
 * row-major order. Enforced at decode and in validate.ts.
 */
export interface SashGrid {
  columnWeights: ColumnWeight[];
  rowWeights: RowWeight[];
  cells: SashCell[];
}

export interface WindowStyleOptions {
  casement: {
    grid: SashGrid;
  };
  'tilt-and-turn': {
    /**
     * Each light's opening says which side it turns on (side-hung left or
     * right, viewed from outside) or that it only tilts (bottom-hung). That
     * is the only record of the turn hinge: a separate style-level
     * `turnHingeSide` was removed because it could disagree with the lights.
     */
    grid: SashGrid;
  };
  sash: {
    operation: 'single-hung' | 'double-hung';
    meetingRailPosition: MeetingRailFractionFromCill;
    horns: boolean;
    upperBars: BarLayout;
    lowerBars: BarLayout;
  };
  fixed: {
    bars: BarLayout;
  };
}

export type WindowStyle = {
  [K in WindowStyleId]: { id: K; options: WindowStyleOptions[K] };
}[WindowStyleId];

/* ------------------------------------------------------------------ *
 * Extension point — styles deferred out of phase 1
 *
 * BAY (deferred 2026-09-11). A bay is not expressible as width × height: it is
 * a run of facets with a corner angle and a projection from the wall, so it
 * needs its own sizing panel in Step 3 rather than the two numeric inputs.
 *
 * To restore, in this order:
 *   1. Add 'bay' to WindowStyleId and an entry to WindowStyleOptions using
 *      DeferredBayOptions below. The compiler then names every switch that
 *      must handle it — url.ts, defaults.ts, validate.ts and the Step 2
 *      geometry builder.
 *   2. Add the `bs` / `bg<n>` / `ca` / `rd` key group to url.ts. One key per
 *      segment, because the separator set cannot express a fourth level of
 *      nesting.
 *   3. Give Step 3 a per-style sizing panel; `width` for a bay means the span
 *      across the wall opening, with `returnDepth` as the projection.
 * No schema version bump is required: adding a style is additive, and older
 * links are unaffected.
 * ------------------------------------------------------------------ */

export interface DeferredBaySegment {
  /** Share of the overall structural width taken by this facet. */
  widthShare: number;
  grid: SashGrid;
}

export interface DeferredBayOptions {
  segments: DeferredBaySegment[];
  /** Internal angle between adjacent facets, degrees. */
  cornerAngle: 90 | 135 | 150;
  /** Projection from the wall face. */
  returnDepth: Mm;
}

/**
 * Window handles mirror the door set minus the pull bar, which does not exist
 * as a window handle.
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
  trickleVents: TrickleVents | null;
}

/* ------------------------------------------------------------------ *
 * ConfigState
 * ------------------------------------------------------------------ */

interface ConfigCommon {
  schemaVersion: number;
  /** Gates colour, finish, sightlines and every size limit. */
  material: FrameMaterial;
  dimensions: Dimensions;
  colour: ColourPair;
  finish: FinishPair;
  glazing: Glazing;
}

export type ConfigState = DoorConfigState | WindowConfigState;

export type DoorConfigState = ConfigCommon & DoorConfig;
export type WindowConfigState = ConfigCommon & WindowConfig;

/* ------------------------------------------------------------------ *
 * The quotable brand
 *
 * Declared as a module-scoped `unique symbol` so that the only way to obtain a
 * QuotableConfig is through `mintQuotable` in validate.ts, which owns the sole
 * type assertion. A brand nobody can construct gates nothing; a brand anybody
 * can construct gates nothing either. One constructor, one validator.
 * ------------------------------------------------------------------ */

declare const quotableBrand: unique symbol;

export type QuotableConfig = ConfigState & { readonly [quotableBrand]: true };

/** Exhaustiveness guard for style switches. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
