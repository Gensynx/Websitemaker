import type { ColourSelection } from '../config/types';
import { ralEntry } from '../config/ral';

/** The on-screen hex of a selection, lower case: a RAL shade's published approximation, or the explore value. */
export function colourToHexString(colour: ColourSelection): string {
  return (colour.mode === 'ral' ? ralEntry(colour.code).hex : colour.hex).toLowerCase();
}
