import { describe, expect, it } from 'vitest';
import { appearanceKey, shapeKey } from './Product';
import { DEFAULT_DOOR } from '../config/defaults';
import type { DoorConfigState } from '../config/types';
import { withColour, withExternalFinish } from '../config/colourEdits';

describe('colour changes re-tint the model without rebuilding it', () => {
  it('a colour, finish or hardware finish leaves the geometry key alone', () => {
    const base = DEFAULT_DOOR;
    const recoloured = withExternalFinish(withColour(base, 'external', { mode: 'explore', hex: '#8a2be2' }), 'textured');
    const refinished: DoorConfigState = { ...base, colour: recoloured.colour, finish: recoloured.finish, hardware: { ...base.hardware, finish: 'brass' } };
    expect(shapeKey(refinished)).toBe(shapeKey(base));
    expect(appearanceKey(refinished)).not.toBe(appearanceKey(base));
  });

  it('a change of shape does change it', () => {
    expect(shapeKey({ ...DEFAULT_DOOR, dimensions: { width: 900, height: 2040 } })).not.toBe(shapeKey(DEFAULT_DOOR));
    expect(shapeKey({ ...DEFAULT_DOOR, hingeSide: 'right' })).not.toBe(shapeKey(DEFAULT_DOOR));
  });
});
