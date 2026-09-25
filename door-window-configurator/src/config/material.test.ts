import { describe, expect, it } from 'vitest';
import { FRAME_MATERIALS, isMaterialOffered, MATERIALS, OFFERED_MATERIALS } from './material';
import { DEFAULT_MATERIAL } from './defaults';

describe('offered materials', () => {
  it('is uPVC only, as confirmed for the demo on 2026-09-25', () => {
    expect([...OFFERED_MATERIALS]).toEqual(['upvc']);
  });

  it('defaults to a material that is actually offered', () => {
    expect(isMaterialOffered(DEFAULT_MATERIAL)).toBe(true);
  });

  it('keeps the dormant definitions intact, so adding one back is one line', () => {
    for (const material of FRAME_MATERIALS) {
      expect(MATERIALS[material].sightlines.outerFrame, material).toBeGreaterThan(0);
      expect(MATERIALS[material].finishes.length, material).toBeGreaterThan(0);
    }
  });
});
