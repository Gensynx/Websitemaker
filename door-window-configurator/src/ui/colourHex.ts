import type { ColourSelection } from '../config/types';
import { colourToHex } from '../config/colourHex';

/** The on-screen hex of a selection, lower case, as the explore picker works in. */
export function colourToHexString(colour: ColourSelection): string {
  return colourToHex(colour).toLowerCase();
}
