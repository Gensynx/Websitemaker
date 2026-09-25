/**
 * A handle is fitted to the sash or leaf, never to the glass.
 *
 * Found by measuring the built catalogue: every opening window had its handle
 * centre inside the pane — side-hung at 75–91% across, top-hung at 50% across
 * and 26% up — because the handle was positioned against the glazed aperture
 * rather than the sash member.
 */

import { describe, expect, it } from 'vitest';
import { CATALOGUE_CONFIGS } from '../config/catalogue';
import { DEFAULT_WINDOW } from '../config/defaults';
import type { ConfigState, SashOpening, WindowConfigState, WindowHandleStyle } from '../config/types';
import { NO_BARS } from '../config/types';
import { buildProduct } from './geometry';
import type { Part } from './geometry';

interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const rectOf = (part: Part): Rect => ({
  x0: part.position[0] - part.size[0] / 2,
  x1: part.position[0] + part.size[0] / 2,
  y0: part.position[1] - part.size[1] / 2,
  y1: part.position[1] + part.size[1] / 2,
});
// Strictly inside: a centre exactly on an edge is on the member, not the glass.
const inside = (x: number, y: number, r: Rect) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1;
const within = (x: number, y: number, r: Rect) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;

function describeConfig(config: ConfigState): string {
  return `${config.productType} ${config.style.id} ${config.dimensions.width}×${config.dimensions.height} ${config.hardware.handle}`;
}

/** Every handle part whose centre falls on any glass, as readable strings. */
function handlesOnGlass(config: ConfigState): string[] {
  const parts = buildProduct(config).parts;
  const glass = parts.filter((part) => part.kind === 'glazing').map((part) => ({ id: part.id, rect: rectOf(part) }));
  const found: string[] = [];
  for (const part of parts.filter((p) => p.id.startsWith('handle'))) {
    const [x, y] = part.position;
    for (const pane of glass) if (inside(x, y, pane.rect)) found.push(`${part.id} centre (${x.toFixed(0)}, ${y.toFixed(0)}) is on ${pane.id}`);
  }
  return found;
}

/** Window handle parts whose centre is not on their own sash's members. */
function windowHandlesOffTheSash(config: ConfigState): string[] {
  const parts = buildProduct(config).parts;
  const found: string[] = [];
  for (const part of parts.filter((p) => /^handle-\d+-/.test(p.id))) {
    const index = part.id.split('-')[1];
    const members = parts.filter((p) => p.kind === 'sash' && p.id.startsWith(`sash-${index}-`) && !p.id.includes('seal'));
    const [x, y] = part.position;
    if (!members.some((member) => within(x, y, rectOf(member)))) found.push(`${part.id} centre (${x.toFixed(0)}, ${y.toFixed(0)}) is off sash ${index}`);
  }
  return found;
}

// Every opening, every handle style, at a small and a large light, for both
// grid styles — beyond what the catalogue happens to show.
const OPENINGS: Record<'casement' | 'tilt-and-turn', SashOpening[]> = {
  casement: ['side-hung-left', 'side-hung-right', 'top-hung'],
  'tilt-and-turn': ['side-hung-left', 'side-hung-right', 'bottom-hung'],
};
const HANDLES: WindowHandleStyle[] = ['lever-rose', 'lever-backplate', 'knob'];
const generated: WindowConfigState[] = [];
for (const style of ['casement', 'tilt-and-turn'] as const) {
  for (const opening of OPENINGS[style]) {
    for (const handle of HANDLES) {
      for (const dimensions of [
        { width: 500, height: 600 },
        { width: 1800, height: 1500 },
      ]) {
        const grid = { columnWeights: [1, 1], rowWeights: [1], cells: [
          { opening, bars: { ...NO_BARS }, safety: null },
          { opening: 'fixed' as const, bars: { ...NO_BARS }, safety: null },
        ] };
        generated.push({
          ...DEFAULT_WINDOW,
          dimensions,
          hardware: { ...DEFAULT_WINDOW.hardware, handle },
          style: style === 'casement' ? { id: 'casement', options: { grid } } : { id: 'tilt-and-turn', options: { grid } },
        } as WindowConfigState);
      }
    }
  }
}

describe('no handle centre falls within any glass', () => {
  it('holds for every catalogue configuration', () => {
    const found = CATALOGUE_CONFIGS.flatMap((config) => handlesOnGlass(config).map((problem) => `${describeConfig(config)}: ${problem}`));
    expect(found).toEqual([]);
  });

  it('holds for every opening and handle style, small and large', () => {
    const found = generated.flatMap((config) => handlesOnGlass(config).map((problem) => `${describeConfig(config)}: ${problem}`));
    expect(found).toEqual([]);
  });

  it('checks something: the catalogue and generated sets contain opening windows with handles', () => {
    const withHandles = [...CATALOGUE_CONFIGS, ...generated].filter((config) =>
      buildProduct(config).parts.some((part) => /^handle-\d+-plate$/.test(part.id)),
    );
    expect(withHandles.length).toBeGreaterThan(generated.length);
  });
});

describe('a window handle sits on its own sash member', () => {
  it.each([...CATALOGUE_CONFIGS.filter((c) => c.productType === 'window'), ...generated].map((c) => [describeConfig(c), c]))(
    '%s',
    (_, config) => {
      expect(windowHandlesOffTheSash(config as ConfigState)).toEqual([]);
    },
  );
});
