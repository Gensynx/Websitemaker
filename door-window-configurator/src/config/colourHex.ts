/**
 * The on-screen hex of a colour selection: a RAL shade's published
 * approximation, or the explore value.
 *
 * Kept out of viewer/materials.ts on purpose. That module imports three.js,
 * and anything on the first-paint path that imported this helper from there
 * — the SVG elevation, the option thumbnails — pulled the whole 1 MB 3D
 * bundle in ahead of first paint, against the performance budget.
 */

import type { ColourSelection } from './types';
import { ralEntry } from './ral';

export function colourToHex(colour: ColourSelection): string {
  return colour.mode === 'ral' ? ralEntry(colour.code).hex : colour.hex;
}
