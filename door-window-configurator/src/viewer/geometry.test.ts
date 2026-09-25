import { describe, expect, it } from 'vitest';
import { buildProduct, distribute, LEAF_CLEARANCE, windowLightRects } from './geometry';
import type { Part } from './geometry';
import { DEFAULT_DOOR, DEFAULT_WINDOW, makeGrid } from '../config/defaults';
import type { DoorConfigState, WindowConfigState } from '../config/types';
import { doorLeafWidth } from '../config/validate';
import { doorLeafHeight } from '../config/safety';
import { sightlines } from '../config/material';
import { MAX_BAR_DIVISIONS, MAX_GRID_COLUMNS, MAX_GRID_ROWS } from '../config/limits';

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
    // geometry. These agreeing is the point of that refactor. The drawn leaf
    // is the layout's leaf opening less a NAMED clearance — sides and head,
    // not the foot — rather than a second derivation of its own.
    expect(leaf.size[0]).toBeCloseTo(doorLeafWidth(door) - LEAF_CLEARANCE * 2, 6);
    expect(leaf.size[1]).toBeCloseTo(doorLeafHeight(door) - LEAF_CLEARANCE, 6);
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

describe('panel detail stands proud of the leaf, on both faces', () => {
  const external = (p: Part) => p.facing !== 'internal';
  const internal = (p: Part) => p.facing === 'internal';

  it('puts raised panels outside the leaf on each face, never buried in it', () => {
    const model = buildProduct({
      ...DEFAULT_DOOR,
      style: { id: 'solid-panel', options: { panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' } } },
    } satisfies DoorConfigState);

    const leaf = part(model.parts, 'leaf');
    const outsideFace = leaf.position[2] + leaf.size[2] / 2;
    const insideFace = leaf.position[2] - leaf.size[2] / 2;
    const panels = model.parts.filter((p) => p.id.startsWith('panel-'));

    // Regression: panels once sat inside the leaf's thickness and were
    // invisible in the render while every unit test passed. They now appear
    // on BOTH faces, because moulded door skins carry the detail both sides.
    expect(panels.filter(external)).toHaveLength(2);
    expect(panels.filter(internal)).toHaveLength(2);
    for (const panel of panels.filter(external)) {
      expect(panel.position[2] + panel.size[2] / 2, panel.id).toBeGreaterThan(outsideFace);
    }
    for (const panel of panels.filter(internal)) {
      expect(panel.position[2] - panel.size[2] / 2, panel.id).toBeLessThan(insideFace);
    }
  });

  it('carries the moulding profile, so the bevel has something to catch light with', () => {
    for (const moulding of ['ovolo', 'chamfer', 'square'] as const) {
      const panels = buildProduct({
        ...DEFAULT_DOOR,
        style: { id: 'solid-panel', options: { panelDetail: { kind: 'raised', panels: 1, moulding } } },
      } satisfies DoorConfigState).parts.filter((p) => p.kind === 'panel');
      for (const panel of panels) expect(panel.shape, panel.id).toEqual({ kind: 'raised', profile: moulding });
    }
  });

  it('cuts grooves as a V: each slab edge is half the groove width', () => {
    const slabs = buildProduct({
      ...DEFAULT_DOOR,
      style: {
        id: 'solid-panel',
        options: { panelDetail: { kind: 'grooved', grooves: 3, grooveWidth: 18, orientation: 'horizontal' } },
      },
    } satisfies DoorConfigState).parts.filter((p) => p.id.startsWith('groove-slab-'));
    for (const slab of slabs) {
      expect(slab.shape, slab.id).toEqual({ kind: 'raised', profile: 'chamfer', bevel: 9 });
    }
  });

  it('builds a grooved face as slabs with gaps, one more slab than grooves, each side', () => {
    const slabs = buildProduct({
      ...DEFAULT_DOOR,
      style: {
        id: 'solid-panel',
        options: { panelDetail: { kind: 'grooved', grooves: 4, grooveWidth: 18, orientation: 'horizontal' } },
      },
    } satisfies DoorConfigState).parts.filter((p) => p.id.startsWith('groove-slab-'));
    expect(slabs.filter(external)).toHaveLength(5);
    expect(slabs.filter(internal)).toHaveLength(5);
  });
});

describe('furniture stands on the face it is fixed to', () => {
  /**
   * Regression. Door hardware was positioned from the leaf's CENTRE with
   * offsets written as if it were the FACE, so the plate spanned 35-47 mm and
   * the lever 52-70 mm inside a leaf spanning 0-70 mm. It was visible only on
   * glazed doors, and only because it could be seen through the glass.
   */
  const handles = ['lever-rose', 'lever-backplate', 'knob', 'pull-bar'] as const;

  for (const handle of handles) {
    it(`keeps every ${handle} part clear of the leaf`, () => {
      const model = buildProduct({
        ...DEFAULT_DOOR,
        hardware: { ...DEFAULT_DOOR.hardware, handle, letterplate: true, spyhole: true, knocker: 'ring' },
      } satisfies DoorConfigState);
      const leaf = part(model.parts, 'leaf');
      const outsideFace = leaf.position[2] + leaf.size[2] / 2;
      const insideFace = leaf.position[2] - leaf.size[2] / 2;

      const hardware = model.parts.filter((p) => p.kind === 'hardware');
      expect(hardware.length).toBeGreaterThan(3);
      for (const piece of hardware) {
        const back = piece.position[2] - piece.size[2] / 2;
        const front = piece.position[2] + piece.size[2] / 2;
        if (piece.facing === 'internal') {
          expect(front, `${piece.id} sinks into the leaf from inside`).toBeLessThanOrEqual(insideFace + 1e-6);
        } else {
          expect(back, `${piece.id} sinks into the leaf from outside`).toBeGreaterThanOrEqual(outsideFace - 1e-6);
        }
      }
    });
  }

  it('puts a handle on both sides of the door', () => {
    const parts = buildProduct(DEFAULT_DOOR).parts.filter((p) => p.id.startsWith('handle'));
    expect(parts.some((p) => p.facing === 'external')).toBe(true);
    expect(parts.some((p) => p.facing === 'internal')).toBe(true);
  });

  it('fits window handles on the inside of the sash', () => {
    const grid = makeGrid(1, 1);
    grid.cells[0] = { opening: 'side-hung-left', bars: NO_BARS, safety: null };
    const parts = buildProduct({ ...DEFAULT_WINDOW, style: { id: 'casement', options: { grid } } } satisfies WindowConfigState).parts;
    const handle = parts.filter((p) => p.id.startsWith('handle-0'));
    const sash = parts.filter((p) => p.id.startsWith('sash-0'));
    const sashInsideFace = Math.min(...sash.map((p) => p.position[2] - p.size[2] / 2));
    expect(handle.length).toBeGreaterThan(0);
    for (const piece of handle) {
      expect(piece.facing, piece.id).toBe('internal');
      expect(piece.position[2] + piece.size[2] / 2, piece.id).toBeLessThanOrEqual(sashInsideFace + 1e-6);
    }
  });
});

/**
 * The outer edge of light `index`'s sash, from the sash members actually
 * emitted: where its handle must stay. Not windowLightRects — for an opening
 * light that is the GLAZED aperture, and holding handles inside it required
 * them to be on the glass.
 */
function sashRect(parts: Part[], index: number): { x: number; y: number; width: number; height: number } {
  const members = parts.filter((p) => p.kind === 'sash' && p.id.startsWith(`sash-${index}-`));
  if (members.length === 0) throw new Error(`light ${index} has no sash`);
  const x0 = Math.min(...members.map((p) => p.position[0] - p.size[0] / 2));
  const x1 = Math.max(...members.map((p) => p.position[0] + p.size[0] / 2));
  const y0 = Math.min(...members.map((p) => p.position[1] - p.size[1] / 2));
  const y1 = Math.max(...members.map((p) => p.position[1] + p.size[1] / 2));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

describe('nothing leaves its own light', () => {
  /** Every cell saturated: an opener, the maximum bars, uneven weights. */
  function saturated(): WindowConfigState {
    const columns = MAX_GRID_COLUMNS;
    const rows = MAX_GRID_ROWS;
    const openings = ['side-hung-left', 'side-hung-right', 'top-hung', 'bottom-hung', 'fixed'] as const;
    const grid = makeGrid(columns, rows);
    grid.columnWeights = [3, 1, 2, 1, 4, 1];
    grid.rowWeights = [1, 3, 1, 2, 1, 1];
    grid.cells = grid.cells.map((_, index) => ({
      opening: openings[index % openings.length] ?? 'fixed',
      bars: {
        style: 'georgian-internal' as const,
        columns: MAX_BAR_DIVISIONS,
        rows: MAX_BAR_DIVISIONS,
        barWidth: 22,
      },
      safety: null,
    }));
    return {
      ...DEFAULT_WINDOW,
      dimensions: { width: 3500, height: 2100 },
      style: { id: 'casement', options: { grid } },
    };
  }

  it('keeps every bar inside the cell it belongs to', () => {
    const config = saturated();
    // Against the LIGHT, not the cell: the sash section is wide enough to hide
    // a stray part inside the cell bounds, which made the first version of
    // this test pass against code that was visibly wrong in the render.
    const rects = windowLightRects(config);
    const parts = buildProduct(config).parts;
    const bars = parts.filter((p) => p.kind === 'bar');
    expect(bars.length).toBeGreaterThan(100);

    for (const bar of bars) {
      const index = Number(/^cell-(\d+)-bar/.exec(bar.id)?.[1]);
      const cell = rects[index];
      if (cell === undefined) throw new Error(`bar ${bar.id} belongs to no cell`);
      expect(bar.position[0] - bar.size[0] / 2, `${bar.id} left`).toBeGreaterThanOrEqual(cell.x - 1e-6);
      expect(bar.position[0] + bar.size[0] / 2, `${bar.id} right`).toBeLessThanOrEqual(cell.x + cell.width + 1e-6);
      expect(bar.position[1] - bar.size[1] / 2, `${bar.id} bottom`).toBeGreaterThanOrEqual(cell.y - 1e-6);
      expect(bar.position[1] + bar.size[1] / 2, `${bar.id} top`).toBeLessThanOrEqual(cell.y + cell.height + 1e-6);
    }
  });

  it('keeps every handle on the sash it belongs to', () => {
    // Regression: a side-hung-right lever pointed away from its own sash and
    // crossed the mullion into the neighbouring light, where the mullion then
    // occluded it — which read as a missing handle, not a stray one.
    const config = saturated();
    const parts = buildProduct(config).parts;
    const handles = parts.filter((p) => p.id.startsWith('handle-'));
    expect(handles.length).toBeGreaterThan(20);

    for (const handle of handles) {
      const index = Number(/^handle-(\d+)-/.exec(handle.id)?.[1]);
      const cell = sashRect(parts, index);
      expect(handle.position[0] - handle.size[0] / 2, `${handle.id} left`).toBeGreaterThanOrEqual(cell.x - 1e-6);
      expect(handle.position[0] + handle.size[0] / 2, `${handle.id} right`).toBeLessThanOrEqual(cell.x + cell.width + 1e-6);
      expect(handle.position[1] - handle.size[1] / 2, `${handle.id} bottom`).toBeGreaterThanOrEqual(cell.y - 1e-6);
      expect(handle.position[1] + handle.size[1] / 2, `${handle.id} top`).toBeLessThanOrEqual(cell.y + cell.height + 1e-6);
    }
  });

  it('gives every opening light a handle and no fixed light one', () => {
    const config = saturated();
    const grid = config.style.id === 'casement' ? config.style.options.grid : null;
    if (grid === null) throw new Error('fixture');

    const openingIndices = grid.cells
      .map((cell, index) => (cell.opening === 'fixed' ? null : index))
      .filter((index): index is number => index !== null);

    const handled = new Set(
      buildProduct(config)
        .parts.filter((p) => p.id.startsWith('handle-'))
        .map((p) => Number(/^handle-(\d+)-/.exec(p.id)?.[1])),
    );

    expect([...handled].sort((a, b) => a - b)).toEqual(openingIndices);
  });

  it('shortens furniture rather than lending it to a neighbour in a narrow light', () => {
    const grid = makeGrid(2, 1);
    grid.columnWeights = [20, 1];
    grid.cells[1] = { opening: 'side-hung-right', bars: NO_BARS, safety: null };
    const config: WindowConfigState = {
      ...DEFAULT_WINDOW,
      dimensions: { width: 2000, height: 1200 },
      style: { id: 'casement', options: { grid } },
    };
    const parts = buildProduct(config).parts;
    const narrow = sashRect(parts, 1);
    const handles = parts.filter((p) => p.id.startsWith('handle-1-'));
    expect(handles.length).toBeGreaterThan(0);

    for (const handle of handles) {
      expect(handle.size[0], handle.id).toBeLessThanOrEqual(narrow.width + 1e-6);
      expect(handle.position[0] - handle.size[0] / 2, handle.id).toBeGreaterThanOrEqual(narrow.x - 1e-6);
      expect(handle.position[0] + handle.size[0] / 2, handle.id).toBeLessThanOrEqual(narrow.x + narrow.width + 1e-6);
    }
  });
});

describe('handle direction', () => {
  /**
   * Containment cannot test this. The clamp that keeps furniture inside its
   * light also quietly corrects a lever pointing the wrong way, so a
   * bounds-only test passes against a handle that opens into its own hinge.
   */
  function leverAndPlate(opening: 'side-hung-left' | 'side-hung-right' | 'top-hung') {
    const grid = makeGrid(1, 1);
    grid.cells[0] = { opening, bars: NO_BARS, safety: null };
    const parts = buildProduct({
      ...DEFAULT_WINDOW,
      dimensions: { width: 1200, height: 1200 },
      style: { id: 'casement', options: { grid } },
    } satisfies WindowConfigState).parts;

    const plate = parts.find((p) => p.id === 'handle-0-plate');
    const lever = parts.find((p) => p.id === 'handle-0-lever');
    if (plate === undefined || lever === undefined) throw new Error('no handle emitted');
    return { plate, lever, sash: sashRect(parts, 0) };
  }

  // The lever rests along the member it is fitted to, as a closed handle
  // does: down the stile opposite the hinge, or along the bottom rail of a
  // top-hung vent. Lying across the sash towards the hinge, it crossed the
  // glass, which a handle on the member must not.
  it('keeps the lever on the right stile, pointing down, on a left-hung sash', () => {
    const { plate, lever, sash } = leverAndPlate('side-hung-left');
    expect(plate.position[0]).toBeGreaterThan(sash.x + sash.width / 2);
    expect(lever.position[0]).toBeCloseTo(plate.position[0]);
    expect(lever.size[1]).toBeGreaterThan(lever.size[0]);
    expect(lever.position[1]).toBeLessThan(plate.position[1]);
  });

  it('keeps the lever on the left stile, pointing down, on a right-hung sash', () => {
    const { plate, lever, sash } = leverAndPlate('side-hung-right');
    expect(plate.position[0]).toBeLessThan(sash.x + sash.width / 2);
    expect(lever.position[0]).toBeCloseTo(plate.position[0]);
    expect(lever.size[1]).toBeGreaterThan(lever.size[0]);
    expect(lever.position[1]).toBeLessThan(plate.position[1]);
  });

  it('lays the lever along the bottom rail of a top-hung vent', () => {
    const { plate, lever, sash } = leverAndPlate('top-hung');
    expect(plate.position[1]).toBeLessThan(sash.y + sash.height / 2);
    expect(lever.position[1]).toBeCloseTo(plate.position[1]);
    expect(lever.size[0]).toBeGreaterThan(lever.size[1]);
  });
});

describe('trickle vents', () => {
  it('sit in the head member, clear of every light', () => {
    const config: WindowConfigState = {
      ...DEFAULT_WINDOW,
      dimensions: { width: 2400, height: 1400 },
      trickleVents: { position: 'head-of-frame', count: 2 },
      style: { id: 'casement', options: { grid: makeGrid(3, 2) } },
    };
    const lights = windowLightRects(config);
    const topOfGlazing = Math.max(...lights.map((light) => light.y + light.height));

    const vents = buildProduct(config).parts.filter((p) => p.id.startsWith('vent-'));
    expect(vents).toHaveLength(2);
    for (const vent of vents) {
      // Regression: vents were drawn across the top of the glazing.
      expect(vent.position[1] - vent.size[1] / 2, vent.id).toBeGreaterThanOrEqual(topOfGlazing - 1e-6);
    }
  });
});

describe('the leaf sits in its frame as a real one does', () => {
  it('is flush with the frame face, not standing proud of it', () => {
    // Regression: the leaf stood 35 mm proud, which a raking light turned
    // into a shadow line down the whole closing edge.
    const parts = buildProduct(DEFAULT_DOOR).parts;
    const leaf = part(parts, 'leaf');
    const frame = part(parts, 'frame-left');
    expect(leaf.position[2] + leaf.size[2] / 2).toBeCloseTo(frame.position[2] + frame.size[2] / 2, 6);
  });

  it('leaves a clearance gap at the sides, so frame and leaf read apart', () => {
    const parts = buildProduct(DEFAULT_DOOR).parts;
    const leaf = part(parts, 'leaf');
    const frame = part(parts, 'frame-left');
    const frameInner = frame.position[0] + frame.size[0] / 2;
    const leafOuter = leaf.position[0] - leaf.size[0] / 2;
    expect(leafOuter - frameInner).toBeCloseTo(LEAF_CLEARANCE, 6);
  });
});

describe('the letterplate is never buried behind a panel', () => {
  // Regression: drawn at 35% of the leaf regardless of the panelling, the
  // letterplate sat behind the lower raised panel and could not be seen.
  const overlaps = (a: Part, b: Part) =>
    Math.min(a.position[0] + a.size[0] / 2, b.position[0] + b.size[0] / 2) >
      Math.max(a.position[0] - a.size[0] / 2, b.position[0] - b.size[0] / 2) &&
    Math.min(a.position[1] + a.size[1] / 2, b.position[1] + b.size[1] / 2) >
      Math.max(a.position[1] - a.size[1] / 2, b.position[1] - b.size[1] / 2);

  for (const panels of [1, 2, 3, 4] as const) {
    it(`${panels} raised panel${panels > 1 ? 's' : ''}: on a rail, or standing in front of the panel`, () => {
      const parts = buildProduct({
        ...DEFAULT_DOOR,
        hardware: { ...DEFAULT_DOOR.hardware, letterplate: true },
        style: { id: 'solid-panel', options: { panelDetail: { kind: 'raised', panels, moulding: 'ovolo' } } },
      } satisfies DoorConfigState).parts;
      const plate = part(parts, 'letterplate');
      const front = (p: Part) => p.position[2] + p.size[2] / 2;
      for (const panel of parts.filter((p) => p.kind === 'panel' && p.facing !== 'internal')) {
        if (overlaps(plate, panel)) {
          expect(plate.position[2] - plate.size[2] / 2, `${plate.id} behind ${panel.id}`).toBeGreaterThanOrEqual(front(panel) - 1e-6);
        }
      }
    });
  }

  it('goes on the mid-rail of a two-panel door', () => {
    const parts = buildProduct({
      ...DEFAULT_DOOR,
      hardware: { ...DEFAULT_DOOR.hardware, letterplate: true },
      style: { id: 'solid-panel', options: { panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' } } },
    } satisfies DoorConfigState).parts;
    const plate = part(parts, 'letterplate');
    const panels = parts.filter((p) => p.kind === 'panel' && p.facing !== 'internal');
    for (const panel of panels) expect(overlaps(plate, panel), panel.id).toBe(false);
  });
});

describe('glass is never buried in an opaque part', () => {
  /**
   * The general invariant behind two separate defects: a pane drawn inside the
   * thickness of a solid box renders as nothing at all. Opaque geometry may
   * abut a glazed area but must never overlap it in elevation.
   */
  function overlapsInElevation(a: Part, b: Part): boolean {
    const gap = 1e-6;
    const overlapX =
      Math.min(a.position[0] + a.size[0] / 2, b.position[0] + b.size[0] / 2) -
      Math.max(a.position[0] - a.size[0] / 2, b.position[0] - b.size[0] / 2);
    const overlapY =
      Math.min(a.position[1] + a.size[1] / 2, b.position[1] + b.size[1] / 2) -
      Math.max(a.position[1] - a.size[1] / 2, b.position[1] - b.size[1] / 2);
    return overlapX > gap && overlapY > gap;
  }

  const OPAQUE: ReadonlyArray<Part['kind']> = ['leaf', 'panel', 'frame', 'mullion', 'transom', 'sash'];

  const styles: Array<DoorConfigState['style']> = [
    { id: 'solid-panel', options: { panelDetail: { kind: 'raised', panels: 4, moulding: 'ovolo' } } },
    {
      id: 'full-glazed',
      options: { aperture: { shape: 'rectangular', inset: 100, bars: NO_BARS, safety: null } },
    },
    {
      id: 'half-glazed',
      options: {
        glazedFraction: 0.5,
        aperture: { shape: 'rectangular', inset: 120, bars: { style: 'applied-astragal', columns: 2, rows: 3, barWidth: 22 }, safety: null },
        panelDetail: { kind: 'raised', panels: 2, moulding: 'ovolo' },
      },
    },
  ];

  for (const style of styles) {
    it(`keeps glazing clear of opaque geometry on a ${style.id} door`, () => {
      const parts = buildProduct({
        ...DEFAULT_DOOR,
        dimensions: { width: 1800, height: 2200 },
        glazing: { ...DEFAULT_DOOR.glazing, safety: 'toughened' },
        style,
      } satisfies DoorConfigState).parts;

      const panes = parts.filter((p) => p.kind === 'glazing');
      if (style.id !== 'solid-panel') expect(panes.length, 'expected glazing').toBeGreaterThan(0);

      for (const pane of panes) {
        for (const opaque of parts.filter((p) => OPAQUE.includes(p.kind))) {
          expect(
            overlapsInElevation(pane, opaque),
            `${opaque.id} (${opaque.kind}) covers ${pane.id}`,
          ).toBe(false);
        }
      }
    });
  }
});
