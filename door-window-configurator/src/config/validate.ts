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
  isColourAvailable,
  isFinishAvailable,
  MATERIALS,
  sightlines,
} from './material';
import { assessCriticalLocations, requiredSafetyGlazing } from './safety';
import { formatMm } from './units';
import type { Mm } from './units';

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationIssue[];
  nonOrderable: ValidationIssue[];
  notices: ValidationIssue[];
}

export function isValid(result: ValidationResult): boolean {
  return result.errors.length === 0;
}

/** Door leaf width, derived from the overall opening (decision 10). */
export function doorLeafWidth(config: DoorConfigState): Mm {
  const frame = sightlines(config.material);
  const left = config.surround.leftSideLight;
  const right = config.surround.rightSideLight;
  const sideLights =
    (left === null ? 0 : left.width + frame.mullion) +
    (right === null ? 0 : right.width + frame.mullion);
  return config.dimensions.width - sideLights - frame.outerFrame * 2;
}

export function validateConfig(config: ConfigState): ValidationResult {
  const errors: ValidationIssue[] = [];
  const nonOrderable: ValidationIssue[] = [];
  const notices: ValidationIssue[] = [];

  /* ---- dimensions ---- */
  const limits = sizeLimits(config.material, config.productType);
  const material = MATERIALS[config.material].label;
  if (config.dimensions.width < limits.minWidth || config.dimensions.width > limits.maxWidth) {
    errors.push({
      field: 'width',
      message: `Width for a ${material} ${config.productType} must be between ${formatMm(limits.minWidth)} and ${formatMm(limits.maxWidth)}.`,
    });
  }
  if (config.dimensions.height < limits.minHeight || config.dimensions.height > limits.maxHeight) {
    errors.push({
      field: 'height',
      message: `Height for a ${material} ${config.productType} must be between ${formatMm(limits.minHeight)} and ${formatMm(limits.maxHeight)}.`,
    });
  }

  /* ---- colour and finish, gated by material ---- */
  const { external, internal } = config.colour;
  if (external.mode === 'explore') {
    nonOrderable.push({
      field: 'colour.external',
      message: 'The external colour was picked in explore mode and is not available to order.',
    });
  } else if (!isColourAvailable(config.material, external.code)) {
    errors.push({
      field: 'colour.external',
      message: `${external.code} is not offered in ${material}.`,
    });
  }

  if (internal.mode === 'explore') {
    nonOrderable.push({
      field: 'colour.internal',
      message: 'The internal colour was picked in explore mode and is not available to order.',
    });
  } else if (internal.mode === 'ral' && !isColourAvailable(config.material, internal.code)) {
    errors.push({
      field: 'colour.internal',
      message: `${internal.code} is not offered in ${material}.`,
    });
  }

  if (!isFinishAvailable(config.material, config.finish)) {
    errors.push({
      field: 'finish',
      message: `A ${config.finish} finish is not offered in ${material}.`,
    });
  }

  /* ---- safety glazing ---- */
  const assessment = assessCriticalLocations(config);
  const required = requiredSafetyGlazing(config);
  if (assessment.safetyGlazingForced && config.glazing.safety === 'none') {
    errors.push({
      field: 'glazing.safety',
      message: `This configuration includes a critical location, so ${required} safety glass is required: ${
        assessment.locations.find((l) => l.status === 'required')?.reason ?? ''
      }`,
    });
  }
  if (assessment.undetermined) {
    notices.push({
      field: 'glazing.safety',
      message:
        'Whether safety glass is required depends on the cill height above the finished floor. The surveyor will confirm this.',
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
      message: `This leaves a door leaf of ${formatMm(leaf)}. The narrowest manufacturable leaf is ${formatMm(MIN_DOOR_LEAF_WIDTH)} — reduce the side lights or increase the overall width.`,
    });
  }
  if (leaf > MAX_DOOR_LEAF.width) {
    errors.push({
      field: 'width',
      message: `This leaves a door leaf of ${formatMm(leaf)}. The widest manufacturable leaf is ${formatMm(MAX_DOOR_LEAF.width)} — add a side light or reduce the overall width.`,
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
      });
    }
    validateBars(topLight.bars, 'surround.topLight', errors);
  }

  if (config.trickleVents !== null && !hasGlazedSurround(config.surround)) {
    errors.push({
      field: 'trickleVents',
      message:
        'Trickle vents can only be fitted to a door with a glazed side light or top light. Remove them, or add a surround.',
    });
  }
  validateTrickleVents(config, errors);

  if (config.style.id === 'half-glazed') {
    const fraction = config.style.options.glazedFraction;
    if (fraction < 0.1 || fraction > 0.9) {
      errors.push({
        field: 'style.glazedFraction',
        message: 'The glazed portion must be between 10% and 90% of the leaf height.',
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
    });
    return;
  }
  if (grid.cells.length !== columns * rows) {
    errors.push({
      field,
      message: `This layout describes ${columns} × ${rows} lights but lists ${grid.cells.length}.`,
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

  if (!isFinishAvailable(next.material, next.finish)) {
    const replacement = fallbackFinish(next.material);
    issues.push({
      field: 'finish',
      message: `A ${next.finish} finish is not offered in ${MATERIALS[next.material].label}; changed to ${replacement}.`,
    });
    next = { ...next, finish: replacement };
  }

  const external = next.colour.external;
  if (external.mode === 'ral' && !isColourAvailable(next.material, external.code)) {
    const replacement = fallbackColour(next.material);
    issues.push({
      field: 'colour.external',
      message: `${external.code} is not offered in ${MATERIALS[next.material].label}; changed to ${replacement}.`,
    });
    next = { ...next, colour: { ...next.colour, external: { mode: 'ral', code: replacement } } };
  }

  const internal = next.colour.internal;
  if (internal.mode === 'ral' && !isColourAvailable(next.material, internal.code)) {
    issues.push({
      field: 'colour.internal',
      message: `${internal.code} is not offered in ${MATERIALS[next.material].label}; the inside now matches the outside.`,
    });
    next = { ...next, colour: { ...next.colour, internal: { mode: 'match' } } };
  }

  const limits = sizeLimits(next.material, next.productType);
  const width = Math.min(limits.maxWidth, Math.max(limits.minWidth, next.dimensions.width));
  const height = Math.min(limits.maxHeight, Math.max(limits.minHeight, next.dimensions.height));
  if (width !== next.dimensions.width || height !== next.dimensions.height) {
    issues.push({
      field: 'dimensions',
      message: `Size adjusted to the range manufacturable in ${MATERIALS[next.material].label}.`,
    });
    next = { ...next, dimensions: { width, height } };
  }

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

export type EnquiryPayload =
  | { kind: 'quotable'; config: QuotableConfig; notices: ValidationIssue[] }
  | {
      kind: 'non-orderable';
      config: ConfigState;
      reasons: ValidationIssue[];
      notices: ValidationIssue[];
    }
  | { kind: 'invalid'; errors: ValidationIssue[] };

/**
 * Builds the payload the enquiry form (Step 8.3) submits. An explore colour
 * does not block submission; it downgrades the payload to `non-orderable` so
 * that whoever picks it up knows the colour has to be agreed before pricing.
 */
export function buildEnquiry(config: ConfigState): EnquiryPayload {
  const result = validateConfig(config);
  if (result.errors.length > 0) return { kind: 'invalid', errors: result.errors };

  if (result.nonOrderable.length > 0) {
    return {
      kind: 'non-orderable',
      config,
      reasons: result.nonOrderable,
      notices: result.notices,
    };
  }

  const quotable = mintQuotable(config);
  if (quotable === null) return { kind: 'invalid', errors: result.errors };
  return { kind: 'quotable', config: quotable, notices: result.notices };
}
