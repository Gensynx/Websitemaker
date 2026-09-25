import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../config/colourMath';
import { RAL_PALETTE } from '../config/ral';
import { ELEVATION_FILLS, OUTLINE_CONTRAST, outlineFor } from './elevationStyle';

// The rendered check — every pair of panel styles visibly different at tile
// size, in the catalogue, the thumbnails and the elevation — needs a browser:
// scripts/panel-contrast.mjs. This holds the rule it depends on.
describe('elevation outlines are derived from the fill', () => {
  const fills = [...RAL_PALETTE.map((entry) => entry.hex), ...Object.values(ELEVATION_FILLS), '#000000', '#ffffff', '#777777'];

  it.each(fills)('an outline on %s reaches the target contrast', (fill) => {
    expect(contrastRatio(outlineFor(fill), fill)).toBeGreaterThanOrEqual(OUTLINE_CONTRAST);
  });

  it.each(fills)('an outline on %s is lighter on a dark fill and darker on a light one', (fill) => {
    const lighter = relativeLuminance(outlineFor(fill)) > relativeLuminance(fill);
    expect(lighter).toBe(relativeLuminance(fill) < 0.179);
  });

  it('is not a fixed colour: the default door and a white door get different outlines', () => {
    const anthracite = RAL_PALETTE.find((entry) => entry.code === 'RAL7016')!.hex;
    const white = RAL_PALETTE.find((entry) => entry.code === 'RAL9016')!.hex;
    expect(outlineFor(anthracite)).not.toBe(outlineFor(white));
  });
});
