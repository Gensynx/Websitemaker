import { describe, expect, it } from 'vitest';
import { buildProduct, distribute } from './geometry';
import type { Part } from './geometry';
import { DEFAULT_DOOR, DEFAULT_WINDOW, makeGrid } from '../config/defaults';
import type { DoorConfigState, WindowConfigState } from '../config/types';
import { doorLeafWidth } from '../config/validate';
import { doorLeafHeight } from '../config/safety';
import { sightlines } from '../config/material';

function part(parts: Part[], id: string): Part {
  const found = parts.find((p) => p.id === id);
  if (found === undefined) throw new Error(`No part "${id}" in [${parts.map((p) => p.id).join(', ')}]`);
  return found;
}

const NO_BARS = { style: 'none' as const, columns: 1, rows: 1, barWidth: 0 };

describe('the model is dimension-driven, not a scaled shape', () => {
  it('keeps frame members at their true sightline as the product grows', () => {
    const narrow = buildProduct({ ...DEFAULT_DOOR, dimensions: { width: 838, height: 1981 } });
    const wide = buildProduct({ ...DEFAULT_DOOR, dimensions: { width: 1676, height: 1981 } });

    const narrowHead = part(narrow.parts, 'frame-head');
    const wideHead = part(wide.parts, 'frame-head');

    // Twice as wide overall...
    expect(wideHead.size[0]).toBeCloseTo(narrowHead.size[0] * 2, 6);
    // ...but the member is exactly as thick as before. A uniformly scaled
    // model would have doubled this too, which is the failure mode Step 3.2
    // is guarding against.
    expect(wideHead.size[1]).toBe(narrowHead.size[1]);
    expect(wideHead.size[1]).toBe(sightlines(DEFAULT_DOOR.material).outerFrame);
  });

  it('changes sightlines with the frame material, not with the size', () => {
    const upvc = buildProduct({ ...DEFAULT_DOOR, material: 'upvc' });
    const aluminium = buildProduct({ ...DEFAULT_DOOR, material: 'aluminium' });
    expect(part(aluminium.parts, 'frame-head').size[1]).toBeLessThan(
      part(upvc.parts, 'frame-head').size[1],
    );
  });

  it('produces no degenerate parts at either size limit', () => {
    for (const dimensions of [
      { width: 700, height: 1800 },
      { width: 2600, height: 2400 },
    ]) {
      const model = buildProduct({ ...DEFAULT_DOOR, dimensions });
      for (const p of model.parts) {
        expect(p.size.every((value) => Number.isFinite(value) && value > 0), `${p.id} ${p.size}`).toBe(true);
        expect(p.position.every(Number.isFinite), p.id).toBe(true);
      }
    }
  });
});

describe('the door leaf agrees with validation', () => {
  it('matches doorLeafWidth and doorLeafHeight exactly', () => {
    const door: DoorConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 2400, height: 2400 },
      surround: {
        leftSideLight: { width: 400, bars: NO_BARS, safety: null },
        rightSideLight: { width: 500, bars: NO_BARS, safety: null },
        topLight: { height: 350, shape: 'rectangular', bars: NO_BARS, safety: null },
      },
    };
    const leaf = part(buildProduct(door).parts, 'leaf');
    // One layout module feeds validation, the safety assessment and the
    // geometry. These three agreeing is the point of that refactor.
    expect(leaf.size[0]).toBeCloseTo(doorLeafWidth(door), 6);
    expect(leaf.size[1]).toBeCloseTo(doorLeafHeight(door), 6);
  });

  it('narrows the leaf by the side light plus its mullion', () => {
    const plain = { ...DEFAULT_DOOR, dimensions: { width: 1450, height: 2100 } };
    const withLight: DoorConfigState = {
      ...plain,
      surround: { ...plain.surround, leftSideLight: { width: 400, bars: NO_BARS, safety: null } },
    };
    const before = part(buildProduct(plain).parts, 'leaf').size[0];
    const after = part(buildProduct(withLight).parts, 'leaf').size[0];
    expect(before - after).toBeCloseTo(400 + sightlines(plain.material).mullion, 6);
  });

  it('seats the leaf on the threshold, and a low threshold lowers it', () => {
    const standard = buildProduct({ ...DEFAULT_DOOR, threshold: 'standard' });
    const low = buildProduct({ ...DEFAULT_DOOR, threshold: 'low-level-access' });
    const standardLeaf = part(standard.parts, 'leaf');
    const lowLeaf = part(low.parts, 'leaf');
    expect(lowLeaf.position[1]).toBeLessThan(standardLeaf.position[1]);
    expect(lowLeaf.size[1]).toBeGreaterThan(standardLeaf.size[1]);
  });
});

describe('window grids are proportional', () => {
  it('splits the opening by weight, allowing for mullions', () => {
    const grid = makeGrid(2, 1);
    grid.columnWeights = [3, 1];
    const config: WindowConfigState = {
      ...DEFAULT_WINDOW,
      dimensions: { width: 2000, height: 1200 },
      style: { id: 'casement', options: { grid } },
    };
    const model = buildProduct(config);
    const panes = model.parts.filter((p) => p.id.startsWith('cell-') && p.kind === 'glazing');
    expect(panes).toHaveLength(2);

    const wide = panes[0];
    const narrow = panes[1];
    if (wide === undefined || narrow === undefined) throw new Error('missing panes');

    // Compare the LIGHTS, not the panes: each pane is inset by the glazing
    // bead on both sides, so pane widths carry a constant offset and their
    // raw ratio is not the 3:1 the weights asked for.
    const bead = sightlines(config.material).glazingBead;
    const wideLight = wide.size[0] + bead * 2;
    const narrowLight = narrow.size[0] + bead * 2;
    expect(wideLight / narrowLight).toBeCloseTo(3, 6);

    // And the two lights plus the mullion account for the whole opening.
    const frame = sightlines(config.material);
    expect(wideLight + narrowLight + frame.mullion).toBeCloseTo(
      config.dimensions.width - frame.outerFrame * 2,
      6,
    );
  });

  it('distributes with dividers taken off the span first', () => {
    const slots = distribute(1000, [1, 1], 100);
    expect(slots).toHaveLength(2);
    expect(slots[0]?.size).toBeCloseTo(450, 6);
    expect(slots[1]?.offset).toBeCloseTo(550, 6);
  });

  it('draws a sash frame only around opening lights', () => {
    const grid = makeGrid(2, 1);
    grid.cells[0] = { opening: 'side-hung-left', bars: NO_BARS, safety: null };
    const model = buildProduct({
      ...DEFAULT_WINDOW,
      style: { id: 'casement', options: { grid } },
    } satisfies WindowConfigState);
    expect(model.parts.some((p) => p.id.startsWith('sash-0'))).toBe(true);
    expect(model.parts.some((p) => p.id.startsWith('sash-1'))).toBe(false);
  });

  it('places one trickle vent per configured vent', () => {
    const model = buildProduct({
      ...DEFAULT_WINDOW,
      trickleVents: { position: 'head-of-frame', count: 3 },
    });
    expect(model.parts.filter((p) => p.id.startsWith('vent-'))).toHaveLength(3);
  });
});

describe('glazing bars', () => {
  it('draws divisions minus one bar in each direction', () => {
    const model = buildProduct({
      ...DEFAULT_WINDOW,
      style: {
        id: 'fixed',
        options: { bars: { style: 'applied-astragal', columns: 3, rows: 4, barWidth: 22 } },
      },
    } satisfies WindowConfigState);
    const bars = model.parts.filter((p) => p.kind === 'bar');
    expect(bars.filter((b) => b.id.includes('-bar-v'))).toHaveLength(2);
    expect(bars.filter((b) => b.id.includes('-bar-h'))).toHaveLength(3);
  });
});

describe('panel detail stands proud of the leaf face', () => {
  it('puts raised panels outside the leaf, not buried in it', () => {
    const model = buildProduct({
      ...DEFAULT_DOOR,
      style: { id: 'solid-panel', options: { panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' } } },
    } satisfies DoorConfigState);

    const leaf = part(model.parts, 'leaf');
    const leafFaceZ = leaf.position[2] + leaf.size[2] / 2;
    const panels = model.parts.filter((p) => p.id.startsWith('panel-'));
    expect(panels).toHaveLength(2);

    for (const panel of panels) {
      const panelFaceZ = panel.position[2] + panel.size[2] / 2;
      // Regression: panels used to sit inside the leaf's thickness and were
      // invisible in the render while every unit test passed.
      expect(panelFaceZ, panel.id).toBeGreaterThan(leafFaceZ);
    }
  });

  it('builds a grooved face as slabs with gaps, one more slab than grooves', () => {
    const model = buildProduct({
      ...DEFAULT_DOOR,
      style: {
        id: 'solid-panel',
        options: { panelDetail: { kind: 'grooved', grooves: 4, grooveWidth: 18, orientation: 'horizontal' } },
      },
    } satisfies DoorConfigState);
    expect(model.parts.filter((p) => p.id.startsWith('groove-slab-'))).toHaveLength(5);
  });
});
