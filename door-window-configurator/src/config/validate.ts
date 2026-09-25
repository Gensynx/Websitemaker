/**
 * Validation, material reconciliation, and the sole constructor for
 * `QuotableConfig`.
 *
 * Three outcomes are distinguished, because the brief treats them differently:
 *
 *   error        — not manufacturable. Blocks the quote and, per Step 3.4,
 *                  blocks rendering. Every message states the permitted range.
 *   nonOrderable — manufacturable as drawn, but something in it cannot be
 *                  ordered (an explore colour). Does NOT block the enquiry;
 *                  the enquiry is flagged instead (decision 13).
 *   notice       — worth telling the customer, blocks nothing.
 */

import type {
  ConfigState,
  DoorConfigState,
  QuotableConfig,
  SashGrid,
  WindowConfigState,
} from './types';
import { hasGlazedSurround } from './types';
import {
  MAX_BAR_DIVISIONS,
  MAX_DOOR_LEAF,
  MAX_GRID_COLUMNS,
  MAX_GRID_ROWS,
  MAX_TRICKLE_VENTS,
  MIN_DOOR_LEAF_WIDTH,
  MIN_SIDE_LIGHT_WIDTH,
  MIN_TOP_LIGHT_HEIGHT,
  sizeLimits,
} from './limits';
import {
  fallbackColour,
  fallbackFinish,
  FINISH_LABEL,
  isColourAvailable,
  isFinishAvailable,
  isMaterialOffered,
  MATERIALS,
  OFFERED_MATERIALS,
} from './material';
import { doorLayout } from './layout';
import { ralEntry } from './ral';
import type { RalCode } from './ral';
import { assessCriticalLocations } from './safety';
import { formatMm } from './units';
import type { Mm } from './units';

/** "Wine Red (RAL 3005)": names in messages, never bare codes. */
function colourLabel(code: RalCode): string {
  const entry = ralEntry(code);
  return `${entry.name} (${entry.code.replace(/^RAL/, 'RAL ')})`;
}

/**
 * What an error stops.
 *
 * `render` — the geometry must not be shown. Step 3.4: an unmanufacturable
 *   size never renders, and the last valid one stays on screen instead.
 * `order`  — the product draws correctly but cannot be bought as specified.
 *   A material that has left the range is the clearest case: the shape, size
 *   and style are all fine, so replacing the customer's whole configuration
 *   with a default would hide work they can still use.
 *
 * Declared where each error is raised rather than inferred from the field
 * name, so adding a rule forces the question to be answered.
 */
export type Blocks = 'render' | 'order';

export interface ValidationIssue {
  field: string;
  message: string;
  blocks: Blocks;
}

export interface ValidationResult {
  errors: ValidationIssue[];
  nonOrderable: ValidationIssue[];
  notices: ValidationIssue[];
}

export function isValid(result: ValidationResult): boolean {
  return result.errors.length === 0;
}

/** Errors that must stop the model being drawn. */
export function renderBlockers(result: ValidationResult): ValidationIssue[] {
  return result.errors.filter((error) => error.blocks === 'render');
}

/** Door leaf width, derived from the overall opening (decision 10). */
export function doorLeafWidth(config: DoorConfigState): Mm {
  return doorLayout(config).leaf.width;
}

export function validateConfig(config: ConfigState): ValidationResult {
  const errors: ValidationIssue[] = [];
  const nonOrderable: ValidationIssue[] = [];
  const notices: ValidationIssue[] = [];

  /* ---- material ---- */
  const material = MATERIALS[config.material].label;
  if (!isMaterialOffered(config.material)) {
    errors.push({
      field: 'material',
      message: `${material} is not currently offered. Available: ${OFFERED_MATERIALS.map((m) => MATERIALS[m].label).join(', ')}.`,
      blocks: 'order',
    });
  }

  /* ---- dimensions ---- */
  const limits = sizeLimits(config.material, config.productType);
  if (config.dimensions.width < limits.minWidth || config.dimensions.width > limits.maxWidth) {
    errors.push({
      field: 'width',
      message: `Width for a ${material} ${config.productType} must be between ${formatMm(limits.minWidth)} and ${formatMm(limits.maxWidth)}.`,
      blocks: 'render',
    });
  }
  if (config.dimensions.height < limits.minHeight || config.dimensions.height > limits.maxHeight) {
    errors.push({
      field: 'height',
      message: `Height for a ${material} ${config.productType} must be between ${formatMm(limits.minHeight)} and ${formatMm(limits.maxHeight)}.`,
      blocks: 'render',
    });
  }

  /* ---- colour and finish, gated by material ---- */
  const { external, internal } = config.colour;
  if (external.mode === 'explore') {
    nonOrderable.push({
      field: 'colour.external',
      message:
        'The outside colour was picked in explore mode. It is shown for ideas only and cannot be ordered; choose an offered colour to get a quote.',
      blocks: 'order',
    });
  } else if (!isColourAvailable(config.material, external.code)) {
    errors.push({
      field: 'colour.external',
      message: `${colourLabel(external.code)} is not offered in ${material}.`,
      blocks: 'order',
    });
  }

  if (internal.mode === 'explore') {
    nonOrderable.push({
      field: 'colour.internal',
      message:
        'The inside colour was picked in explore mode. It is shown for ideas only and cannot be ordered; choose an offered colour to get a quote.',
      blocks: 'order',
    });
  } else if (internal.mode === 'ral' && !isColourAvailable(config.material, internal.code)) {
    errors.push({
      field: 'colour.internal',
      message: `${colourLabel(internal.code)} is not offered in ${material}.`,
      blocks: 'order',
    });
  }

  if (!isFinishAvailable(config.material, config.finish.external)) {
    errors.push({
      field: 'finish.external',
      message: `A ${FINISH_LABEL[config.finish.external].toLowerCase()} finish outside is not offered in ${material}.`,
      blocks: 'order',
    });
  }
  if (config.finish.internal !== 'match' && !isFinishAvailable(config.material, config.finish.internal)) {
    errors.push({
      field: 'finish.internal',
      message: `A ${FINISH_LABEL[config.finish.internal].toLowerCase()} finish inside is not offered in ${material}.`,
      blocks: 'order',
    });
  }

  /* ---- safety glazing ---- */
  const assessment = assessCriticalLocations(config);
  // Assessed per pane: a side light reaching the floor is critical while a top
  // light at 1800 mm is not. This is a backstop — the panel locks the control
  // and `enforceSafetyGlazing` raises the value before it can get this far.
  for (const pane of assessment.shortfalls) {
    errors.push({
      field: `glazing.safety.${pane.id}`,
      message: `${pane.label} is a critical location, so ${pane.minimum} safety glass is required. ${pane.reason}`,
      blocks: 'order',
    });
  }
  if (assessment.undetermined) {
    notices.push({
      field: 'glazing.safety',
      message:
        'Whether safety glass is required depends on the cill height above the finished floor, which is a property of the installation rather than of the product. The enquiry form asks for it optionally, and the surveyor will confirm it.',
      blocks: 'order',
    });
  }

  /* ---- per-product ---- */
  if (config.productType === 'door') {
    validateDoor(config, errors, notices);
  } else {
    validateWindow(config, errors);
  }

  return { errors, nonOrderable, notices };
}

function validateDoor(
  config: DoorConfigState,
  errors: ValidationIssue[],
  notices: ValidationIssue[],
): void {
  const leaf = doorLeafWidth(config);
  if (leaf < MIN_DOOR_LEAF_WIDTH) {
    errors.push({
      field: 'width',
      message:
        leaf <= 0
          ? `The side lights take up the whole width, leaving no room for the door. Increase the overall width or reduce the side lights; the narrowest manufacturable leaf is ${formatMm(MIN_DOOR_LEAF_WIDTH)}.`
          : `This leaves a door leaf of ${formatMm(leaf)}. The narrowest manufacturable leaf is ${formatMm(MIN_DOOR_LEAF_WIDTH)} — reduce the side lights or increase the overall width.`,
      blocks: 'render',
    });
  }
  if (leaf > MAX_DOOR_LEAF.width) {
    errors.push({
      field: 'width',
      message: `This leaves a door leaf of ${formatMm(leaf)}. The widest manufacturable leaf is ${formatMm(MAX_DOOR_LEAF.width)} — add a side light or reduce the overall width.`,
      blocks: 'render',
    });
  }

  for (const [field, light] of [
    ['surround.leftSideLight', config.surround.leftSideLight],
    ['surround.rightSideLight', config.surround.rightSideLight],
  ] as const) {
    if (light !== null && light.width < MIN_SIDE_LIGHT_WIDTH) {
      errors.push({
        field,
        message: `A side light must be at least ${formatMm(MIN_SIDE_LIGHT_WIDTH)} wide.`,
        blocks: 'render',
      });
    }
    if (light !== null) validateBars(light.bars, field, errors);
  }

  const topLight = config.surround.topLight;
  if (topLight !== null) {
    if (topLight.height < MIN_TOP_LIGHT_HEIGHT) {
      errors.push({
        field: 'surround.topLight',
        message: `A top light must be at least ${formatMm(MIN_TOP_LIGHT_HEIGHT)} high.`,
        blocks: 'render',
      });
    }
    validateBars(topLight.bars, 'surround.topLight', errors);
  }

  if (config.trickleVents !== null && !hasGlazedSurround(config.surround)) {
    errors.push({
      field: 'trickleVents',
      message:
        'Trickle vents can only be fitted to a door with a glazed side light or top light. Remove them, or add a surround.',
      blocks: 'order',
    });
  }
  validateTrickleVents(config, errors);

  if (config.style.id === 'half-glazed') {
    const fraction = config.style.options.glazedFraction;
    if (fraction < 0.1 || fraction > 0.9) {
      errors.push({
        field: 'style.glazedFraction',
        message: 'The glazed portion must be between 10% and 90% of the leaf height.',
        blocks: 'render',
      });
    }
  }
  if (config.style.id !== 'solid-panel') {
    validateBars(config.style.options.aperture.bars, 'style.aperture.bars', errors);
  }

  if (config.threshold === 'low-level-access') {
    notices.push({
      field: 'threshold',
      message:
        'A low threshold gives step-free access and slightly reduces weather performance on exposed elevations.',
      blocks: 'order',
    });
  }
}

function validateWindow(config: WindowConfigState, errors: ValidationIssue[]): void {
  switch (config.style.id) {
    case 'casement':
      validateGrid(config.style.options.grid, 'style.grid', errors);
      break;
    case 'tilt-and-turn':
      validateGrid(config.style.options.grid, 'style.grid', errors);
      break;
    case 'sash': {
      const position = config.style.options.meetingRailPosition;
      if (position < 0.2 || position > 0.8) {
        errors.push({
          field: 'style.meetingRailPosition',
          message: 'The meeting rail must sit between 20% and 80% of the frame height above the cill.',
          blocks: 'render',
        });
      }
      validateBars(config.style.options.upperBars, 'style.upperBars', errors);
      validateBars(config.style.options.lowerBars, 'style.lowerBars', errors);
      break;
    }
    case 'fixed':
      validateBars(config.style.options.bars, 'style.bars', errors);
      break;
  }
  validateTrickleVents(config, errors);
}

function validateTrickleVents(config: ConfigState, errors: ValidationIssue[]): void {
  const vents = config.trickleVents;
  if (vents === null) return;
  if (vents.count < 1 || vents.count > MAX_TRICKLE_VENTS) {
    errors.push({
      field: 'trickleVents.count',
      message: `Between 1 and ${MAX_TRICKLE_VENTS} trickle vents can be fitted.`,
      blocks: 'order',
    });
  }
}

function validateGrid(grid: SashGrid, field: string, errors: ValidationIssue[]): void {
  const columns = grid.columnWeights.length;
  const rows = grid.rowWeights.length;
  if (columns < 1 || columns > MAX_GRID_COLUMNS || rows < 1 || rows > MAX_GRID_ROWS) {
    errors.push({
      field,
      message: `A window can be divided into at most ${MAX_GRID_COLUMNS} columns and ${MAX_GRID_ROWS} rows.`,
      blocks: 'render',
    });
    return;
  }
  if (grid.cells.length !== columns * rows) {
    errors.push({
      field,
      message: `This layout describes ${columns} × ${rows} lights but lists ${grid.cells.length}.`,
      blocks: 'render',
    });
    return;
  }
  grid.cells.forEach((cell, index) => validateBars(cell.bars, `${field}.cells[${index}]`, errors));
}

function validateBars(bars: import('./types').BarLayout, field: string, errors: ValidationIssue[]): void {
  if (bars.style === 'none') return;
  if (
    bars.columns < 1 ||
    bars.rows < 1 ||
    bars.columns > MAX_BAR_DIVISIONS ||
    bars.rows > MAX_BAR_DIVISIONS
  ) {
    errors.push({
      field,
      message: `Glazing bars can divide a light into at most ${MAX_BAR_DIVISIONS} parts in each direction.`,
      blocks: 'render',
    });
  }
}

/* ------------------------------------------------------------------ *
 * Material reconciliation
 * ------------------------------------------------------------------ */

/**
 * Brings a configuration back into line with its frame material. Called on
 * every material change and after every decode, because a link may carry a
 * combination that was legal when it was shared and is not now.
 */
export function reconcileWithMaterial(config: ConfigState): {
  config: ConfigState;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  let next = config;

  // Material is not reconciled here. A material outside the range cannot
  // reach this point from a link or stored state: the decoder shows it in the
  // default and says so (url.ts, the owner's decision of 2026-09-25). The
  // material error in validateConfig remains as a backstop for any other path.

  if (!isFinishAvailable(next.material, next.finish.external)) {
    const replacement = fallbackFinish(next.material);
    issues.push({
      field: 'finish.external',
      message: `A ${FINISH_LABEL[next.finish.external].toLowerCase()} finish is not offered in ${MATERIALS[next.material].label}; changed to ${FINISH_LABEL[replacement].toLowerCase()}.`,
      blocks: 'order',
    });
    next = { ...next, finish: { ...next.finish, external: replacement } };
  }

  if (next.finish.internal !== 'match' && !isFinishAvailable(next.material, next.finish.internal)) {
    issues.push({
      field: 'finish.internal',
      message: `A ${FINISH_LABEL[next.finish.internal].toLowerCase()} finish is not offered in ${MATERIALS[next.material].label}; the inside now matches the outside.`,
      blocks: 'order',
    });
    next = { ...next, finish: { ...next.finish, internal: 'match' } };
  }

  const external = next.colour.external;
  if (external.mode === 'ral' && !isColourAvailable(next.material, external.code)) {
    const replacement = fallbackColour(next.material);
    issues.push({
      field: 'colour.external',
      message: `${colourLabel(external.code)} is not offered in ${MATERIALS[next.material].label}; changed to ${colourLabel(replacement)}.`,
      blocks: 'order',
    });
    next = { ...next, colour: { ...next.colour, external: { mode: 'ral', code: replacement } } };
  }

  const internal = next.colour.internal;
  if (internal.mode === 'ral' && !isColourAvailable(next.material, internal.code)) {
    issues.push({
      field: 'colour.internal',
      message: `${colourLabel(internal.code)} is not offered in ${MATERIALS[next.material].label}; the inside now matches the outside.`,
      blocks: 'order',
    });
    next = { ...next, colour: { ...next.colour, internal: { mode: 'match' } } };
  }

  // Dimensions are deliberately NOT clamped here.
  //
  // Reconciliation runs on live edits as well as on decode, and silently
  // resizing what someone just typed is exactly what Step 3.4 forbids: an
  // invalid size must show an inline reason stating the permitted range. The
  // URL decoder clamps `w` and `h` as it reads them, because a shared link has
  // nobody present to tell; an edit has, so validateConfig reports instead.

  return { config: next, issues };
}

/* ------------------------------------------------------------------ *
 * The quotable constructor
 * ------------------------------------------------------------------ */

/**
 * The only place a `QuotableConfig` is created. The assertion below is the
 * sole one in the codebase, and it sits immediately behind the checks that
 * justify it.
 */
export function mintQuotable(config: ConfigState): QuotableConfig | null {
  const result = validateConfig(config);
  if (result.errors.length > 0 || result.nonOrderable.length > 0) return null;
  return config as QuotableConfig;
}

/**
 * Installation facts the configurator cannot know. Optional, never gating: a
 * customer who does not know their cill height still gets to send an enquiry,
 * and the surveyor confirms it. Deliberately NOT part of ConfigState — it is a
 * property of the opening, meaningless in a shared link (decision 3).
 */
export interface InstallationDetails {
  /** Height of the cill above the finished floor, in mm. */
  cillHeightAboveFloor?: number;
}

export type EnquiryPayload =
  | {
      kind: 'quotable';
      config: QuotableConfig;
      notices: ValidationIssue[];
      installation: InstallationDetails;
    }
  | {
      kind: 'non-orderable';
      config: ConfigState;
      reasons: ValidationIssue[];
      notices: ValidationIssue[];
      installation: InstallationDetails;
    }
  | { kind: 'invalid'; errors: ValidationIssue[] };

/**
 * Builds the payload the enquiry form (Step 8.3) submits. An explore colour
 * does not block submission; it downgrades the payload to `non-orderable` so
 * that whoever picks it up knows the colour has to be agreed before pricing.
 */
export function buildEnquiry(
  config: ConfigState,
  installation: InstallationDetails = {},
): EnquiryPayload {
  const result = validateConfig(config);
  if (result.errors.length > 0) return { kind: 'invalid', errors: result.errors };

  if (result.nonOrderable.length > 0) {
    return {
      kind: 'non-orderable',
      config,
      reasons: result.nonOrderable,
      notices: result.notices,
      installation,
    };
  }

  // The only construction of a 'quotable' payload, and it cannot be reached
  // except through mintQuotable.
  const quotable = mintQuotable(config);
  if (quotable === null) {
    return {
      kind: 'non-orderable',
      config,
      reasons: result.nonOrderable,
      notices: result.notices,
      installation,
    };
  }
  return { kind: 'quotable', config: quotable, notices: result.notices, installation };
}
