import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { buildWallGeometry, CONTEXT_CILL_HEIGHT, productBase } from './Backdrop';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from '../config/defaults';
import type { ConfigState } from '../config/types';

/** Every wall vertex lies outside the opening or exactly on its edge. */
function assertOpeningIsClear(config: ConfigState, base: number) {
  const { geometry } = buildWallGeometry(config, base);
  const position = geometry.getAttribute('position');
  const { width, height } = config.dimensions;
  const [x0, x1, y0, y1] = [-width / 2, width / 2, base, base + height];
  let onEdge = 0;
  for (let i = 0; i < position.count; i += 1) {
    const v = new THREE.Vector3().fromBufferAttribute(position, i);
    const inside = v.x > x0 + 1e-6 && v.x < x1 - 1e-6 && v.y > y0 + 1e-6 && v.y < y1 - 1e-6;
    expect(inside, `wall vertex inside the opening at ${v.x.toFixed(1)}, ${v.y.toFixed(1)}`).toBe(false);
    if (Math.abs(v.x - x0) < 1e-6 || Math.abs(v.x - x1) < 1e-6) onEdge += 1;
  }
  // The reveals exist: the wall has vertices on both jambs of the opening.
  expect(onEdge).toBeGreaterThan(0);
}

describe('the wall opening is the structural opening', () => {
  it('for a door, running down to the floor', () => {
    assertOpeningIsClear(DEFAULT_DOOR, productBase(DEFAULT_DOOR, 'wall'));
  });

  it('for a window, sitting on the nominal cill', () => {
    expect(productBase(DEFAULT_WINDOW, 'wall')).toBe(CONTEXT_CILL_HEIGHT);
    assertOpeningIsClear(DEFAULT_WINDOW, CONTEXT_CILL_HEIGHT);
  });

  it('for an oversized door set', () => {
    const wide = { ...DEFAULT_DOOR, dimensions: { width: 2800, height: 2500 } };
    assertOpeningIsClear(wide, 0);
  });

  it('puts nothing below the floor or in front of the wall face', () => {
    const { geometry, faceZ } = buildWallGeometry(DEFAULT_WINDOW, CONTEXT_CILL_HEIGHT);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox as THREE.Box3;
    expect(box.min.y).toBeGreaterThanOrEqual(-1e-6);
    expect(box.max.z).toBeCloseTo(faceZ, 6);
  });

  it('never moves the product in the studio', () => {
    expect(productBase(DEFAULT_WINDOW, 'studio')).toBe(0);
    expect(productBase(DEFAULT_DOOR, 'wall')).toBe(0);
  });
});
