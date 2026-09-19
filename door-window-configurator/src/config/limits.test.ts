import { describe, expect, it } from 'vitest';
import { SIZE_PRESETS, sizeLimits } from './limits';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from './defaults';
import type { ConfigState, ProductType } from './types';
import { validateConfig } from './validate';
import { formatMm, roundMmHalfUp } from './units';

function at(productType: ProductType, width: number, height: number): ConfigState {
  const base = productType === 'door' ? DEFAULT_DOOR : DEFAULT_WINDOW;
  return { ...base, dimensions: { width, height } };
}

describe('standard size presets', () => {
  /**
   * The test that was missing. Two door presets assumed a surround was fitted
   * — "with one side light", 1450 mm — and applied on their own implied a
   * 1310 mm leaf, which is not manufacturable. A preset the customer cannot
   * click without producing an error is not a preset.
   */
  it('every preset validates as applied, with nothing else changed', () => {
    for (const productType of ['door', 'window'] as const) {
      for (const preset of SIZE_PRESETS[productType]) {
        const result = validateConfig(at(productType, preset.width, preset.height));
        expect(
          result.errors,
          `${productType} "${preset.label}" ${preset.width}×${preset.height}: ${result.errors.map((e) => e.message).join(' | ')}`,
        ).toHaveLength(0);
      }
    }
  });

  it('every preset sits inside the published range for its product', () => {
    for (const productType of ['door', 'window'] as const) {
      const limits = sizeLimits(DEFAULT_DOOR.material, productType);
      for (const preset of SIZE_PRESETS[productType]) {
        expect(preset.width, preset.label).toBeGreaterThanOrEqual(limits.minWidth);
        expect(preset.width, preset.label).toBeLessThanOrEqual(limits.maxWidth);
        expect(preset.height, preset.label).toBeGreaterThanOrEqual(limits.minHeight);
        expect(preset.height, preset.label).toBeLessThanOrEqual(limits.maxHeight);
      }
    }
  });

  it('offers at least one preset per product', () => {
    expect(SIZE_PRESETS.door.length).toBeGreaterThan(0);
    expect(SIZE_PRESETS.window.length).toBeGreaterThan(0);
  });
});

describe('the boundaries are inclusive', () => {
  it('accepts a size exactly on the limit and rejects one past it', () => {
    const limits = sizeLimits(DEFAULT_WINDOW.material, 'window');
    expect(validateConfig(at('window', limits.minWidth, limits.minHeight)).errors).toHaveLength(0);
    expect(validateConfig(at('window', limits.maxWidth, limits.maxHeight)).errors).toHaveLength(0);
    expect(
      validateConfig(at('window', limits.maxWidth + 1, limits.maxHeight)).errors.some((e) => e.field === 'width'),
    ).toBe(true);
    expect(
      validateConfig(at('window', limits.minWidth - 1, limits.minHeight)).errors.some((e) => e.field === 'width'),
    ).toBe(true);
  });

  it('states the permitted range in the reason, as Step 3.4 requires', () => {
    const limits = sizeLimits(DEFAULT_WINDOW.material, 'window');
    const message = validateConfig(at('window', 99_999, 1000)).errors.find((e) => e.field === 'width')?.message ?? '';
    expect(message).toContain(formatMm(limits.minWidth));
    expect(message).toContain(formatMm(limits.maxWidth));
    // Not a generic error.
    expect(message.toLowerCase()).not.toMatch(/invalid|error|try again/);
  });
});

describe('dimensions stay float until display', () => {
  it('keeps a fractional millimetre in state and rounds only for display', () => {
    const config = at('window', 1200.4, 1050.6);
    expect(config.dimensions.width).toBe(1200.4);
    expect(validateConfig(config).errors).toHaveLength(0);
    expect(roundMmHalfUp(config.dimensions.width)).toBe(1200);
    expect(formatMm(config.dimensions.height)).toBe('1051 mm');
  });
});
