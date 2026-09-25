/**
 * Colour arithmetic for the colour system (Step 5).
 *
 * The explore picker works in HSV — hue round the wheel, saturation out from
 * the centre, brightness on its own slider — because that is the model a
 * colour wheel draws. Closeness between colours is CIE76 ΔE in L*a*b*, the
 * same measure scripts/colour-metric.mjs holds the renderer to: simple, and
 * good enough to say which offered shade an explore colour is nearest.
 *
 * All hex values are "#rrggbb", lower case.
 */

import type { FrameMaterial } from './material';
import { availableColours } from './material';
import type { RalCode } from './ral';
import { ralEntry } from './ral';

export type Rgb = [number, number, number];

/** Hue in degrees [0, 360); saturation and value in [0, 1]. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

export function isHex(value: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(value.trim());
}

/** "#aabbcc" from "aabbcc", "#AABBCC" or " #aabbcc ". Assumes isHex. */
export function normaliseHex(value: string): string {
  const clean = value.trim().replace(/^#/, '').toLowerCase();
  return `#${clean}`;
}

export function hexToRgb(hex: string): Rgb {
  const clean = normaliseHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16)) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const hue = (((h % 360) + 360) % 360) / 60;
  const chroma = v * s;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const [r, g, b] =
    hue < 1 ? [chroma, x, 0] :
    hue < 2 ? [x, chroma, 0] :
    hue < 3 ? [0, chroma, x] :
    hue < 4 ? [0, x, chroma] :
    hue < 5 ? [x, 0, chroma] :
    [chroma, 0, x];
  const m = v - chroma;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function rgbToHsv([r, g, b]: Rgb): Hsv {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta > 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  return { h: (h + 360) % 360, s: max === 0 ? 0 : delta / max, v: max };
}

export const hsvToHex = (hsv: Hsv): string => rgbToHex(hsvToRgb(hsv));
export const hexToHsv = (hex: string): Hsv => rgbToHsv(hexToRgb(hex));

/** sRGB (D65) to CIE L*a*b*. */
export function toLab([r, g, b]: Rgb): [number, number, number] {
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

/** CIE76 colour difference. Roughly: under 2 hard to tell apart, over 10 clearly different. */
export function deltaE(a: string, b: string): number {
  const [L1, a1, b1] = toLab(hexToRgb(a));
  const [L2, a2, b2] = toLab(hexToRgb(b));
  return Math.hypot(L1 - L2, a1 - a2, b1 - b2);
}

/** The offered shade closest to any colour — the way back from explore to an order. */
export function nearestOffered(hex: string, material: FrameMaterial): { code: RalCode; deltaE: number } {
  let best: { code: RalCode; deltaE: number } | null = null;
  for (const code of availableColours(material)) {
    const difference = deltaE(hex, ralEntry(code).hex);
    if (best === null || difference < best.deltaE) best = { code, deltaE: difference };
  }
  if (best === null) throw new Error(`Material ${material} offers no colours`);
  return best;
}

/** A plain word for a hue, for screen readers: "210 degrees, blue". */
export function hueName(h: number): string {
  const hue = ((h % 360) + 360) % 360;
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 160) return 'green';
  if (hue < 200) return 'cyan';
  if (hue < 255) return 'blue';
  if (hue < 290) return 'purple';
  return 'pink';
}
