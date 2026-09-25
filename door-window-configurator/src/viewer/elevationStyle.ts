/**
 * How every flat elevation draws a part: the option thumbnails, the SVG
 * elevation (review drawing and no-WebGL fallback), and the catalogue.
 *
 * One module so the three cannot drift apart. Kept free of three.js, like
 * config/colourHex.ts, because the thumbnails and the fallback are on the
 * first-paint path.
 *
 * A door's panels, mouldings and grooves are the same colour as the leaf, so
 * in a flat drawing the outline is the ONLY thing that tells them apart. The
 * outline was a fixed rgba(0,0,0,0.16–0.22) at a width in millimetres: black
 * at 18% on RAL 7016 is RAL 7016, and 2 mm at tile scale is a fifth of a
 * pixel. Flush, one raised panel and both grooved styles rasterised
 * identically (scripts/panel-contrast.mjs). Now the outline colour is derived
 * from the fill's luminance — light on a dark fill, dark on a light one — to
 * a set contrast, and its width is in screen pixels whatever the scale.
 */

import { contrastRatio, hexToRgb, relativeLuminance, rgbToHex } from '../config/colourMath';

/** Fills for parts that are not the frame colour. */
export const ELEVATION_FILLS: Readonly<Record<string, string>> = {
  glazing: '#cfd8dc',
  hardware: '#9aa0a6',
  seal: '#141516',
  spacer: '#3a3c3e',
};

/**
 * Outline contrast against the part's own fill. 3:1 is the WCAG minimum for
 * graphical objects; an outline anti-aliased across two pixels loses about
 * half of it, so the target is 4.5:1.
 */
export const OUTLINE_CONTRAST = 4.5;

/** Outline width in CSS pixels, at every drawing size. */
export const OUTLINE_WIDTH_PX = 1;

/**
 * Every part is an axis-aligned rectangle, so edges can snap to whole pixels.
 * Anti-aliased, a one-pixel outline that fell between two pixel rows was
 * drawn at half strength in each, and at thumbnail size the rail between one
 * panel and two all but vanished.
 */
export const SHAPE_RENDERING = 'crispEdges';

export function fillFor(kind: string, frameHex: string): string {
  return ELEVATION_FILLS[kind] ?? frameHex;
}

const cache = new Map<string, string>();

/**
 * The outline for a fill: the fill mixed towards white (dark fills) or black
 * (light fills) just far enough to reach OUTLINE_CONTRAST — so it reads as an
 * edge of the same material, not a black line — or pure white or black where
 * even that cannot reach it.
 */
export function outlineFor(fillHex: string): string {
  const cached = cache.get(fillHex);
  if (cached !== undefined) return cached;
  // Towards whichever end gives more room: the crossover where white and
  // black contrast equally with the fill is a luminance of about 0.18.
  const towards = relativeLuminance(fillHex) < 0.179 ? 255 : 0;
  const rgb = hexToRgb(fillHex);
  let result = towards === 255 ? '#ffffff' : '#000000';
  for (let step = 1; step <= 20; step += 1) {
    const t = step / 20;
    const candidate = rgbToHex(rgb.map((c) => c + (towards - c) * t) as [number, number, number]);
    if (contrastRatio(candidate, fillHex) >= OUTLINE_CONTRAST) {
      result = candidate;
      break;
    }
  }
  cache.set(fillHex, result);
  return result;
}
