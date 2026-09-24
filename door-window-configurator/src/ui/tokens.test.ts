/**
 * Contrast is a tested constraint (Step 4.1): "a minimum 4.5:1 text contrast
 * ratio regardless of what is rendered behind" the panel.
 *
 * "Regardless" is taken literally. The panel is translucent, so the worst case
 * is the canvas putting solid black behind it — a zoomed-in anthracite door
 * can. Every text colour is checked against that composite, against the panel
 * over white, and against the page ground. The tokens are read from the real
 * stylesheet, so an edit there cannot slip past this.
 */

import { describe, expect, it } from 'vitest';
import css from '../styles.css?raw';

function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
  if (!match?.[1]) throw new Error(`token --${name} not found in styles.css`);
  return match[1].trim();
}

type Rgb = [number, number, number];

function hex(value: string): Rgb {
  const clean = value.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16)) as Rgb;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function over(foreground: Rgb, alpha: number, background: Rgb): Rgb {
  return foreground.map((f, i) => f * alpha + (background[i] as number) * (1 - alpha)) as Rgb;
}

const TEXT = ['ink', 'ink-soft', 'ink-faint', 'accent', 'warn'] as const;
const panel = token('panel-rgb').split(',').map((n) => Number(n.trim())) as Rgb;
const alpha = Number(token('panel-alpha'));

const ground = token('ground-rgb').split(',').map((n) => Number(n.trim())) as Rgb;
const titleAlpha = Number(token('title-alpha'));

const BACKGROUNDS: Record<string, Rgb> = {
  'page ground': hex(token('ground')),
  'panel over black (worst case)': over(panel, alpha, [0, 0, 0]),
  'panel over white': over(panel, alpha, [255, 255, 255]),
  // The title floats over the canvas too: a close-up puts a dark door under it.
  'title backing over black (worst case)': over(ground, titleAlpha, [0, 0, 0]),
};

it('the title backing is the ground colour, so it is invisible over the studio', () => {
  expect(hex(token('ground'))).toEqual(ground);
});

describe('text contrast holds at 4.5:1 or better', () => {
  for (const [where, background] of Object.entries(BACKGROUNDS)) {
    for (const name of TEXT) {
      it(`--${name} on ${where}`, () => {
        const ratio = contrast(hex(token(name)), background);
        expect(ratio, `--${name} is ${ratio.toFixed(2)}:1 on ${where}`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('would have caught the old faint text', () => {
    // #8b9195 was the previous --ink-faint: range hints and the disclaimer
    // were set in it at 2.96:1.
    expect(contrast(hex('#8b9195'), hex(token('ground')))).toBeLessThan(4.5);
  });
});
