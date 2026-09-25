import { describe, expect, it } from 'vitest';
import { deltaE, hexToHsv, hsvToHex, hueName, isHex, nearestOffered, normaliseHex } from './colourMath';
import { availableColours } from './material';
import { ralEntry } from './ral';

describe('hex handling', () => {
  it('accepts six hex digits with or without #, and normalises to lower case', () => {
    expect(isHex('#A1b2C3')).toBe(true);
    expect(isHex('a1b2c3')).toBe(true);
    expect(isHex('#a1b2c')).toBe(false);
    expect(isHex('#a1b2cg')).toBe(false);
    expect(normaliseHex(' A1B2C3 ')).toBe('#a1b2c3');
  });
});

describe('HSV round trip', () => {
  for (const hex of ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#383e42', '#59191f', '#f1f0ea', '#7a4520']) {
    it(`${hex} survives hex -> hsv -> hex`, () => {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    });
  }

  it('puts pure red at hue 0 and pure blue at 240', () => {
    expect(hexToHsv('#ff0000').h).toBeCloseTo(0, 6);
    expect(hexToHsv('#0000ff').h).toBeCloseTo(240, 6);
  });
});

describe('colour difference', () => {
  it('is zero for the same colour and symmetric', () => {
    expect(deltaE('#383e42', '#383e42')).toBe(0);
    expect(deltaE('#383e42', '#59191f')).toBeCloseTo(deltaE('#59191f', '#383e42'), 10);
  });

  it('finds an offered shade exactly when given its own value', () => {
    for (const code of availableColours('upvc')) {
      const nearest = nearestOffered(ralEntry(code).hex, 'upvc');
      expect(nearest.code, code).toBe(code);
      expect(nearest.deltaE).toBeCloseTo(0, 6);
    }
  });

  it('only ever suggests a colour offered in the material', () => {
    // A bright purple: whatever is closest, it must be something uPVC is sold in.
    const nearest = nearestOffered('#8a2be2', 'upvc');
    expect(availableColours('upvc')).toContain(nearest.code);
  });

  it('finds anthracite for a near-anthracite grey', () => {
    expect(nearestOffered('#3a4044', 'upvc').code).toBe('RAL7016');
  });
});

describe('hue words for screen readers', () => {
  it('names the families', () => {
    expect(hueName(0)).toBe('red');
    expect(hueName(359)).toBe('red');
    expect(hueName(120)).toBe('green');
    expect(hueName(220)).toBe('blue');
  });
});
