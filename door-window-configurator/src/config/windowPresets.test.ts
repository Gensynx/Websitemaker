import { describe, expect, it } from 'vitest';
import { WINDOW_PRESETS, windowPreset } from './windowPresets';
import { DEFAULT_WINDOW } from './defaults';
import type { WindowConfigState } from './types';
import { validateConfig } from './validate';
import { decodeConfig, encodeConfig } from './url';
import { buildProduct, windowLightRects } from '../viewer/geometry';
import type { Part } from '../viewer/geometry';

function configFor(preset: (typeof WINDOW_PRESETS)[number]): WindowConfigState {
  return {
    ...DEFAULT_WINDOW,
    dimensions: preset.suggestedSize,
    style: preset.expand(),
  };
}

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

      const parts = buildProduct(config).parts;
      for (const part of parts) {
        // Glass and bars stay inside the light; a handle stays on its own
        // sash, which is the light plus the sash member it is fitted to.
        const match = /^(cell|handle)-(\d+)/.exec(part.id);
        if (match === null) continue;
        const index = Number(match[2]);
        const light = match[1] === 'handle' ? sashRect(parts, index) : rects[index];
        if (light === undefined) continue;
        expect(part.position[0] - part.size[0] / 2, `${preset.id} ${part.id}`).toBeGreaterThanOrEqual(light.x - 1e-6);
        expect(part.position[0] + part.size[0] / 2, `${preset.id} ${part.id}`).toBeLessThanOrEqual(light.x + light.width + 1e-6);
      }
    }
  });

  it('opens a new window as the three-pane preset with top openers, so it demonstrates itself', () => {
    const preset = windowPreset('casement-three-top-openers')!;
    expect(DEFAULT_WINDOW.style).toEqual(preset.expand());
    expect(DEFAULT_WINDOW.dimensions).toEqual(preset.suggestedSize);
    const handles = buildProduct(DEFAULT_WINDOW).parts.filter((part) => /^handle-\d+-plate$/.test(part.id));
    expect(handles).toHaveLength(3);
    expect(validateConfig(DEFAULT_WINDOW).errors).toEqual([]);
  });

  it('carries no preset identity into the configuration or the link', () => {
    // A preset is expanded and discarded. Renaming or withdrawing one must not
    // change a product somebody has already shared.
    const config = configFor(WINDOW_PRESETS[2]!);
    expect(JSON.stringify(config)).not.toContain('casement-pair');
    expect(encodeConfig(config).toString()).not.toContain('casement-pair');
  });
});
