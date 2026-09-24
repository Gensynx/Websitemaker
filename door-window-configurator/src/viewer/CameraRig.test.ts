import { describe, expect, it } from 'vitest';
import { frustumFor, NO_INSETS, viewOffset } from './CameraRig';

describe('framing around the UI', () => {
  it('puts the optical centre in the middle of the clear area', () => {
    // 1200 px canvas with a 400 px panel on the right: the clear area is
    // [0, 800], centred at 400.
    const view = viewOffset(1200, 800, { top: 0, right: 400, bottom: 0, left: 0 });
    const opticalCentreX = view.fullWidth / 2 - view.offsetX;
    expect(opticalCentreX).toBe(400);
  });

  it('does the same vertically for a bottom sheet and a title block', () => {
    const insets = { top: 120, right: 0, bottom: 300, left: 0 };
    const view = viewOffset(400, 900, insets);
    const opticalCentreY = view.fullHeight / 2 - view.offsetY;
    // Clear span [120, 600], centred at 360.
    expect(opticalCentreY).toBe(360);
  });

  it('is the identity with nothing covering the canvas', () => {
    expect(viewOffset(1000, 700, NO_INSETS)).toEqual({ fullWidth: 1000, fullHeight: 700, offsetX: 0, offsetY: 0 });
    const plain = frustumFor(35, 1000, 700, NO_INSETS);
    const tan = Math.tan((35 * Math.PI) / 360);
    expect(plain.tanHalfV).toBeCloseTo(tan, 9);
    expect(plain.tanHalfH).toBeCloseTo((tan * 1000) / 700, 9);
  });

  it('narrows the usable frustum by exactly the covered share', () => {
    const covered = frustumFor(35, 1200, 800, { top: 0, right: 400, bottom: 0, left: 0 });
    const tan = Math.tan((35 * Math.PI) / 360);
    // 800 clear pixels out of a virtual 800-high frame.
    expect(covered.tanHalfH).toBeCloseTo(tan * (800 / 800), 9);
    expect(covered.tanHalfV).toBeCloseTo(tan, 9);
  });
});
