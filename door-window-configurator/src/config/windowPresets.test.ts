import { describe, expect, it } from 'vitest';
import { WINDOW_PRESETS, windowPreset } from './windowPresets';
import { DEFAULT_WINDOW } from './defaults';
import type { WindowConfigState } from './types';
import { validateConfig } from './validate';
import { decodeConfig, encodeConfig } from './url';
import { buildProduct, windowLightRects } from '../viewer/geometry';

function configFor(preset: (typeof WINDOW_PRESETS)[number]): WindowConfigState {
  return {
    ...DEFAULT_WINDOW,
    dimensions: preset.suggestedSize,
    style: preset.expand(),
  };
}

describe('window presets', () => {
  it('have unique ids and are all resolvable', () => {
    const ids = WINDOW_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(windowPreset(id)?.id).toBe(id);
  });

  it('every preset expands to a configuration that validates at its suggested size', () => {
    for (const preset of WINDOW_PRESETS) {
      const result = validateConfig(configFor(preset));
      expect(result.errors, `${preset.id}: ${result.errors.map((e) => e.message).join('; ')}`).toHaveLength(0);
    }
  });

  it('every preset round-trips through a shared link', () => {
    for (const preset of WINDOW_PRESETS) {
      const config = configFor(preset);
      expect(decodeConfig(encodeConfig(config)).config, preset.id).toEqual(config);
    }
  });

  it('expands fresh objects, so two configurations never share a grid', () => {
    const preset = windowPreset('casement-pair');
    if (preset === undefined) throw new Error('missing preset');
    const first = preset.expand();
    const second = preset.expand();
    if (first.id !== 'casement' || second.id !== 'casement') throw new Error('wrong style');

    first.options.grid.cells[0] = { opening: 'fixed', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null };
    expect(second.options.grid.cells[0]?.opening).toBe('side-hung-left');
  });

  it('draws every preset without a part escaping its light', () => {
    for (const preset of WINDOW_PRESETS) {
      const config = configFor(preset);
      const rects = windowLightRects(config);
      if (rects.length === 0) continue; // sash and fixed styles have no grid

      for (const part of buildProduct(config).parts) {
        const index = Number(/^(?:cell|handle)-(\d+)/.exec(part.id)?.[1]);
        const light = rects[index];
        if (light === undefined) continue;
        expect(part.position[0] - part.size[0] / 2, `${preset.id} ${part.id}`).toBeGreaterThanOrEqual(light.x - 1e-6);
        expect(part.position[0] + part.size[0] / 2, `${preset.id} ${part.id}`).toBeLessThanOrEqual(light.x + light.width + 1e-6);
      }
    }
  });

  it('carries no preset identity into the configuration or the link', () => {
    // A preset is expanded and discarded. Renaming or withdrawing one must not
    // change a product somebody has already shared.
    const config = configFor(WINDOW_PRESETS[2]!);
    expect(JSON.stringify(config)).not.toContain('casement-pair');
    expect(encodeConfig(config).toString()).not.toContain('casement-pair');
  });
});
