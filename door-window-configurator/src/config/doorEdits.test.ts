import { describe, expect, it } from 'vitest';
import {
  heightToKeepLeaf,
  leafAlone,
  panelChoices,
  panelDetailOf,
  plainLeaf,
  sideLightsOf,
  widthToKeepLeaf,
  withDoorStyle,
  withFurniture,
  withHandle,
  withPanelDetail,
  withSideLights,
  withSideLightWidth,
  withTopLight,
} from './doorEdits';
import { DEFAULT_DOOR } from './defaults';
import { doorLayout } from './layout';
import { validateConfig } from './validate';
import { enforceSafetyGlazing } from './safety';
import type { DoorConfigState } from './types';
import { encodeConfig, decodeConfig } from './url';

describe('style and panels', () => {
  it('panels carry over between the styles that have them', () => {
    const grooved = withPanelDetail(DEFAULT_DOOR, { kind: 'grooved', grooves: 5, grooveWidth: 8, orientation: 'vertical' });
    const half = withDoorStyle(grooved, 'half-glazed');
    expect(panelDetailOf(half)).toEqual(panelDetailOf(grooved));
    expect(panelDetailOf(withDoorStyle(half, 'full-glazed'))).toBeNull();
  });

  it('offers flush, one to four raised panels and grooved (Step 6.2)', () => {
    const kinds = panelChoices(null).map((d) => (d.kind === 'raised' ? `raised-${d.panels}` : d.kind));
    expect(kinds).toEqual(['flush', 'raised-1', 'raised-2', 'raised-3', 'raised-4', 'grooved']);
  });

  it('every style and panel combination is valid at a standard size', () => {
    for (const style of ['solid-panel', 'half-glazed', 'full-glazed'] as const) {
      for (const detail of panelChoices(null)) {
        // Through the same safety step the store applies on every edit: glass
        // low in a door is a critical location and becomes toughened.
        const config = enforceSafetyGlazing(withPanelDetail(withDoorStyle(DEFAULT_DOOR, style), detail)).config;
        expect(validateConfig(config).errors, `${style} ${detail.kind}`).toEqual([]);
      }
    }
  });
});

describe('side lights and top light never resize the frame by themselves', () => {
  it('adding side lights keeps the overall width and narrows the leaf', () => {
    const wide: DoorConfigState = { ...DEFAULT_DOOR, dimensions: { width: 1800, height: 2100 } };
    const both = withSideLights(wide, 'both');
    expect(both.dimensions).toEqual(wide.dimensions);
    expect(sideLightsOf(both)).toBe('both');
    expect(doorLayout(both).leaf.width).toBeLessThan(doorLayout(wide).leaf.width);
  });

  it('the keep-the-leaf width puts the leaf back exactly', () => {
    const both = withSideLights(DEFAULT_DOOR, 'both');
    const target = plainLeaf(both).width;
    const widened: DoorConfigState = { ...both, dimensions: { ...both.dimensions, width: widthToKeepLeaf(both, target) } };
    expect(doorLayout(widened).leaf.width).toBeCloseTo(target, 9);
    expect(validateConfig(widened).errors.filter((e) => e.field === 'width')).toEqual([]);
  });

  it('the keep-the-leaf height puts the leaf height back exactly', () => {
    const topped = withTopLight(DEFAULT_DOOR, true);
    const target = plainLeaf(topped).height;
    const raised: DoorConfigState = { ...topped, dimensions: { ...topped.dimensions, height: heightToKeepLeaf(topped, target) } };
    expect(doorLayout(raised).leaf.height).toBeCloseTo(target, 9);
  });

  it('keeps an existing side light when the other is added, and both share one width', () => {
    const left = withSideLightWidth(withSideLights(DEFAULT_DOOR, 'left'), 420);
    const both = withSideLights(left, 'both');
    expect(both.surround.leftSideLight?.width).toBe(420);
    expect(both.surround.rightSideLight?.width).toBe(420);
  });

  it('a door set survives a shared link', () => {
    const set = withTopLight(withSideLights({ ...DEFAULT_DOOR, dimensions: { width: 1800, height: 2300 } }, 'both'), true);
    const decoded = decodeConfig(`?${encodeConfig(set).toString()}`).config as DoorConfigState;
    expect(decoded.surround).toEqual(set.surround);
  });
});

describe('hardware', () => {
  it('each piece of furniture toggles independently (Step 6.5)', () => {
    let config = withFurniture(DEFAULT_DOOR, 'letterplate', false);
    config = withFurniture(config, 'knocker', true);
    config = withFurniture(config, 'spyhole', true);
    expect(config.hardware.letterplate).toBe(false);
    expect(config.hardware.knocker).toBe('ring');
    expect(config.hardware.spyhole).toBe(true);
    expect(withFurniture(config, 'knocker', false).hardware.spyhole).toBe(true);
  });

  it('all four handles are valid (Step 6.3)', () => {
    for (const handle of ['lever-backplate', 'lever-rose', 'pull-bar', 'knob'] as const) {
      expect(validateConfig(withHandle(DEFAULT_DOOR, handle)).errors, handle).toEqual([]);
    }
  });
});

describe("the leaf alone, for the leaf's own option tiles", () => {
  it('drops the side and top lights and keeps the leaf exactly', () => {
    const set = withTopLight(withSideLights({ ...DEFAULT_DOOR, dimensions: { width: 2100, height: 2400 } }, 'both'), true);
    const alone = leafAlone(set);
    expect(alone.surround).toEqual({ leftSideLight: null, rightSideLight: null, topLight: null });
    expect(doorLayout(alone).leaf.width).toBeCloseTo(doorLayout(set).leaf.width, 9);
    expect(doorLayout(alone).leaf.height).toBeCloseTo(doorLayout(set).leaf.height, 9);
    expect(alone.style).toEqual(set.style);
  });

  it('leaves a door with no side or top lights as it is', () => {
    expect(leafAlone(DEFAULT_DOOR).dimensions.width).toBeCloseTo(DEFAULT_DOOR.dimensions.width, 9);
    expect(leafAlone(DEFAULT_DOOR).dimensions.height).toBeCloseTo(DEFAULT_DOOR.dimensions.height, 9);
  });
});
