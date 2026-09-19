/**
 * Manufacturable limits, gated by frame material.
 *
 * !! PLACEHOLDER VALUES REQUIRING REPLACEMENT !!
 * Every number is a plausible industry figure, not a supplied one. Real limits
 * come from the system supplier and vary by material, style and glazed-unit
 * weight. In particular, windows are really constrained by sealed-unit area and
 * weight, not by width and height independently; the linear model below is a
 * simplification as well as a guess.
 */

import type { Mm } from './units';
import type { ProductType } from './types';
import type { FrameMaterial } from './material';

export interface SizeLimits {
  minWidth: Mm;
  maxWidth: Mm;
  minHeight: Mm;
  maxHeight: Mm;
}

/** PLACEHOLDER. Overall structural opening, not leaf size. */
const DOOR_LIMITS: Record<FrameMaterial, SizeLimits> = {
  upvc: { minWidth: 700, maxWidth: 2800, minHeight: 1800, maxHeight: 2500 },
  aluminium: { minWidth: 700, maxWidth: 3200, minHeight: 1800, maxHeight: 2700 },
  timber: { minWidth: 700, maxWidth: 2600, minHeight: 1800, maxHeight: 2400 },
  composite: { minWidth: 700, maxWidth: 2600, minHeight: 1800, maxHeight: 2400 },
};

/** PLACEHOLDER. */
const WINDOW_LIMITS: Record<FrameMaterial, SizeLimits> = {
  upvc: { minWidth: 300, maxWidth: 3500, minHeight: 300, maxHeight: 2200 },
  aluminium: { minWidth: 300, maxWidth: 4000, minHeight: 300, maxHeight: 2600 },
  timber: { minWidth: 300, maxWidth: 3000, minHeight: 300, maxHeight: 2100 },
  composite: { minWidth: 300, maxWidth: 3000, minHeight: 300, maxHeight: 2100 },
};

export function sizeLimits(material: FrameMaterial, productType: ProductType): SizeLimits {
  return productType === 'door' ? DOOR_LIMITS[material] : WINDOW_LIMITS[material];
}

/** Widest limits across all materials — used when clamping before material is known. */
export function widestLimits(productType: ProductType): SizeLimits {
  const table = productType === 'door' ? DOOR_LIMITS : WINDOW_LIMITS;
  const all = Object.values(table);
  return {
    minWidth: Math.min(...all.map((l) => l.minWidth)),
    maxWidth: Math.max(...all.map((l) => l.maxWidth)),
    minHeight: Math.min(...all.map((l) => l.minHeight)),
    maxHeight: Math.max(...all.map((l) => l.maxHeight)),
  };
}

/** PLACEHOLDER. Maximum single door leaf, once side lights are subtracted. */
export const MAX_DOOR_LEAF: { width: Mm; height: Mm } = { width: 1000, height: 2400 };
/** PLACEHOLDER. */
export const MIN_DOOR_LEAF_WIDTH: Mm = 610;
/** PLACEHOLDER. */
export const MIN_SIDE_LIGHT_WIDTH: Mm = 200;
/** PLACEHOLDER. */
export const MIN_TOP_LIGHT_HEIGHT: Mm = 200;

/**
 * Caps on the sash grid. These bound the worst-case shareable link as well as
 * the geometry cost, so they are a product decision, not only a technical one.
 */
export const MAX_GRID_COLUMNS = 6;
export const MAX_GRID_ROWS = 6;
/** Maximum divisions of a single glazed area by astragal or Georgian bars. */
export const MAX_BAR_DIVISIONS = 12;

/** PLACEHOLDER. Upstand of the door threshold above finished floor level. */
export const THRESHOLD_HEIGHT: Record<'standard' | 'low-level-access', Mm> = {
  standard: 60,
  'low-level-access': 15,
};

/** PLACEHOLDER. Trickle vents fitted across the head of one frame. */
export const MAX_TRICKLE_VENTS = 6;

/**
 * Standard-size presets (Step 3.1). PLACEHOLDER SIZES.
 *
 * A size preset sets the SIZE and nothing else. Sizes that only make sense
 * with a surround fitted — "with one side light", 1450 mm — are not size
 * presets at all: applied on their own they imply a 1310 mm door leaf, which
 * is not manufacturable, and validation correctly rejects them. Door sets
 * belong with the surround options in Step 6, as the window presets already
 * do for grids.
 *
 * Every entry below is checked by test to validate as-is.
 */
export const SIZE_PRESETS: Record<ProductType, ReadonlyArray<{ label: string; width: Mm; height: Mm }>> = {
  door: [
    { label: "2'6\"", width: 762, height: 1981 },
    { label: "2'9\"", width: 838, height: 1981 },
    { label: "3'0\"", width: 914, height: 1981 },
    { label: 'Metric', width: 926, height: 2040 },
    { label: 'Wide', width: 1067, height: 2083 },
  ],
  window: [
    { label: 'Small', width: 600, height: 900 },
    { label: 'Standard', width: 1200, height: 1050 },
    { label: 'Large', width: 1770, height: 1200 },
    { label: 'Sash', width: 860, height: 1500 },
  ],
};
