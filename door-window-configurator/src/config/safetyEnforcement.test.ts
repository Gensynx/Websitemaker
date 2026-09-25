/**
 * Enforcement raises each short pane at the value it takes its glass from:
 * its own override where it has one, otherwise the product value (safety.ts).
 */

import { describe, expect, it } from 'vitest';
import { DEFAULT_DOOR } from './defaults';
import { assessCriticalLocations, enforceSafetyGlazing, safetyControlState } from './safety';
import type { DoorConfigState, SafetyOverride } from './types';
import { NO_BARS } from './types';
import { decodeConfig, encodeConfig } from './url';
import { validateConfig } from './validate';

const withSideLight = (safety: SafetyOverride, product: DoorConfigState['glazing']['safety'] = 'none'): DoorConfigState => ({
  ...DEFAULT_DOOR,
  dimensions: { width: 1300, height: 2400 },
  glazing: { ...DEFAULT_DOOR.glazing, safety: product },
  surround: {
    leftSideLight: { width: 350, bars: { ...NO_BARS }, safety },
    rightSideLight: null,
    // Its bottom is at 2050 mm, above the 1500 mm line: not a critical location.
    topLight: { height: 350, shape: 'rectangular', bars: { ...NO_BARS }, safety: null },
  },
});

describe('safety enforcement', () => {
  it('raises a pane\'s own override when that is what leaves it short, and nothing else', () => {
    // The defect: a link can give a side light its own "none". Raising the
    // product value left the side light short and changed the top light.
    const decoded = decodeConfig(encodeConfig(withSideLight('none')));
    const start = decoded.config as DoorConfigState;
    expect(start.surround.leftSideLight?.safety).toBe('none');

    const { config, notices } = enforceSafetyGlazing(start);
    const door = config as DoorConfigState;
    expect(notices.map((n) => n.paneId)).toEqual(['side-light-left']);
    expect(door.surround.leftSideLight?.safety).toBe('toughened');
    expect(door.glazing.safety).toBe('none');
    expect(door.surround.topLight?.safety).toBeNull();
    expect(assessCriticalLocations(door).shortfalls).toEqual([]);
    expect(validateConfig(door).errors).toEqual([]);
  });

  it('raises the product value when the short pane inherits it (the Phase 1 control)', () => {
    const { config } = enforceSafetyGlazing(withSideLight(null));
    const door = config as DoorConfigState;
    expect(door.glazing.safety).toBe('toughened');
    expect(door.surround.leftSideLight?.safety).toBeNull();
    expect(validateConfig(door).errors).toEqual([]);
  });

  it('leaves a pane that already meets its minimum alone, even when the product value is standard', () => {
    const start = withSideLight('laminated');
    const { config, notices } = enforceSafetyGlazing(start);
    expect(notices).toEqual([]);
    expect(config).toBe(start);
  });

  it('never lowers anything: every pane resolves at or above what it had', () => {
    for (const safety of [null, 'none', 'toughened', 'laminated'] as const) {
      for (const product of ['none', 'toughened', 'laminated'] as const) {
        const before = assessCriticalLocations(withSideLight(safety, product)).panes;
        const after = assessCriticalLocations(enforceSafetyGlazing(withSideLight(safety, product)).config).panes;
        const rank = { none: 0, toughened: 1, laminated: 2 };
        after.forEach((pane, i) => expect(rank[pane.resolved]).toBeGreaterThanOrEqual(rank[before[i]!.resolved]));
        expect(after.filter((pane) => pane.short)).toEqual([]);
      }
    }
  });

  it('locks the product-level control only for a critical pane that inherits from it', () => {
    const inheriting = safetyControlState(withSideLight(null)).find((c) => c.id === 'side-light-left');
    const own = safetyControlState(withSideLight('toughened')).find((c) => c.id === 'side-light-left');
    expect(inheriting).toMatchObject({ locked: true, inherits: true });
    expect(own).toMatchObject({ locked: true, inherits: false });
  });
});
