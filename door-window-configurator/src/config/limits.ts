/**
 * Manufacturable size limits.
 *
 * !! PLACEHOLDER VALUES REQUIRING REPLACEMENT !!
 * Every number below is a plausible industry figure, not a supplied one. Real
 * limits vary by frame material (uPVC, aluminium, timber, composite), by system
 * supplier, and by style — and for windows they are also governed by a maximum
 * glazed-unit area and weight, not by width and height independently. The model
 * below is therefore a simplification as well as a guess.
 *
 * Replace with the fabricator's published limits before launch, and revisit
 * whether an area/weight constraint is needed alongside the linear ones.
 */

import type { Mm } from './units';
import type { ProductType } from './types';

export interface SizeLimits {
  minWidth: Mm;
  maxWidth: Mm;
  minHeight: Mm;
  maxHeight: Mm;
}

/** PLACEHOLDER. */
export const SIZE_LIMITS: Record<ProductType, SizeLimits> = {
  // Overall structural size including side lights and top light, not leaf size.
  door: { minWidth: 700, maxWidth: 3000, minHeight: 1800, maxHeight: 2700 },
  window: { minWidth: 300, maxWidth: 4000, minHeight: 300, maxHeight: 2400 },
};

/** PLACEHOLDER. Maximum size of a single door leaf, once side lights are removed. */
export const MAX_DOOR_LEAF: { width: Mm; height: Mm } = { width: 1000, height: 2400 };

/** PLACEHOLDER. A side light narrower than this is not manufacturable. */
export const MIN_SIDE_LIGHT_WIDTH: Mm = 200;

/** PLACEHOLDER. A top light shorter than this is not manufacturable. */
export const MIN_TOP_LIGHT_HEIGHT: Mm = 200;

/** Maximum characters in a door numeral string. */
export const MAX_NUMERAL_LENGTH = 5;

/** Standard-size presets offered as one-tap choices (Step 3.1). PLACEHOLDER. */
export const SIZE_PRESETS: Record<ProductType, ReadonlyArray<{ label: string; width: Mm; height: Mm }>> = {
  door: [
    { label: 'Standard', width: 838, height: 1981 },
    { label: 'Wide', width: 914, height: 2032 },
    { label: 'Metric', width: 926, height: 2040 },
    { label: 'With one side light', width: 1450, height: 2100 },
    { label: 'With two side lights', width: 1800, height: 2100 },
  ],
  window: [
    { label: 'Small casement', width: 600, height: 900 },
    { label: 'Standard casement', width: 1200, height: 1050 },
    { label: 'Large casement', width: 1770, height: 1200 },
    { label: 'Sash', width: 860, height: 1500 },
  ],
};
