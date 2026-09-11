/**
 * Critical locations and forced safety glazing.
 *
 * !! NOT A COMPLIANCE TOOL — VERIFY BEFORE RELYING ON IT !!
 * This implements a simplified reading of Approved Document K (England and
 * Wales), section K5, "critical locations" in glazing. Scotland (Technical
 * Handbooks) and Northern Ireland (Technical Booklets) differ. The output is a
 * prompt for the customer and a note for the surveyor. It is not a compliance
 * statement, must not be presented as one, and a competent person must confirm
 * the specification on survey.
 *
 * The rules modelled, as commonly summarised:
 *   - Glazing in a door, between finished floor level and 1500 mm above it.
 *   - Glazing in a side panel within 300 mm of a door edge, between finished
 *     floor level and 1500 mm above it.
 *   - Glazing in a wall or partition, between finished floor level and 800 mm
 *     above it.
 *
 * The third rule is the one the configurator cannot evaluate: whether a window
 * is a critical location depends on the height of its cill above the finished
 * floor, which is a property of the installation, not of the product. See the
 * gap raised at Step 1 — either `sillHeightAboveFloor` joins ConfigState, or
 * windows stay "cannot determine" and the question moves to the enquiry form.
 */

import type { ConfigState, DoorConfigState, SafetyGlazing, WindowConfigState } from './types';
import type { Mm } from './units';
import { sightlines } from './material';

/** Height above finished floor level below which door glazing is critical. */
export const DOOR_CRITICAL_HEIGHT: Mm = 1500;
/** Height above finished floor level below which wall glazing is critical. */
export const WALL_CRITICAL_HEIGHT: Mm = 800;
/** Distance from a door edge within which a side panel counts as door-adjacent. */
export const DOOR_ADJACENT_DISTANCE: Mm = 300;

export type CriticalStatus = 'required' | 'not-required' | 'cannot-determine';

export interface CriticalLocation {
  /** Which glazed area of the product this refers to. */
  area: string;
  status: CriticalStatus;
  reason: string;
}

export interface SafetyAssessment {
  locations: CriticalLocation[];
  /** True where at least one area is a critical location. */
  safetyGlazingForced: boolean;
  /** True where at least one area could not be assessed from the configuration. */
  undetermined: boolean;
}

export function assessCriticalLocations(config: ConfigState): SafetyAssessment {
  const locations =
    config.productType === 'door' ? assessDoor(config) : assessWindow(config);

  return {
    locations,
    safetyGlazingForced: locations.some((l) => l.status === 'required'),
    undetermined: locations.some((l) => l.status === 'cannot-determine'),
  };
}

/** Height of the door leaf, derived from the overall opening (Step 1 decision 10). */
export function doorLeafHeight(config: DoorConfigState): Mm {
  const frame = sightlines(config.material);
  const topLight = config.surround.topLight;
  const topLightAllowance = topLight === null ? 0 : topLight.height + frame.transom;
  return config.dimensions.height - topLightAllowance - frame.outerFrame;
}

function assessDoor(config: DoorConfigState): CriticalLocation[] {
  const locations: CriticalLocation[] = [];
  const leafHeight = doorLeafHeight(config);

  switch (config.style.id) {
    case 'solid-panel':
      locations.push({
        area: 'Door leaf',
        status: 'not-required',
        reason: 'The leaf is unglazed.',
      });
      break;
    case 'full-glazed':
      locations.push({
        area: 'Door leaf',
        status: 'required',
        reason: `Glazing in a door below ${DOOR_CRITICAL_HEIGHT} mm is a critical location.`,
      });
      break;
    case 'half-glazed': {
      // Glazing runs down from the top of the leaf by `glazedFraction`.
      const glazingBottom = leafHeight * (1 - config.style.options.glazedFraction);
      locations.push(
        glazingBottom < DOOR_CRITICAL_HEIGHT
          ? {
              area: 'Door leaf',
              status: 'required',
              reason: `The glazed panel reaches ${Math.round(glazingBottom)} mm above floor level, below the ${DOOR_CRITICAL_HEIGHT} mm threshold for a door.`,
            }
          : {
              area: 'Door leaf',
              status: 'not-required',
              reason: `The glazed panel starts at ${Math.round(glazingBottom)} mm above floor level, above the ${DOOR_CRITICAL_HEIGHT} mm threshold.`,
            },
      );
      break;
    }
  }

  for (const [label, light] of [
    ['Left side light', config.surround.leftSideLight],
    ['Right side light', config.surround.rightSideLight],
  ] as const) {
    if (light === null) continue;
    // A side light sits immediately against the door, so it is always within
    // the 300 mm door-adjacent distance, and it runs to floor level.
    locations.push({
      area: label,
      status: 'required',
      reason: `A glazed side panel within ${DOOR_ADJACENT_DISTANCE} mm of a door edge is a critical location below ${DOOR_CRITICAL_HEIGHT} mm.`,
    });
  }

  const topLight = config.surround.topLight;
  if (topLight !== null) {
    const bottom = config.dimensions.height - topLight.height;
    locations.push(
      bottom >= DOOR_CRITICAL_HEIGHT
        ? {
            area: 'Top light',
            status: 'not-required',
            reason: `The top light sits at ${Math.round(bottom)} mm above floor level, above the ${DOOR_CRITICAL_HEIGHT} mm threshold.`,
          }
        : {
            area: 'Top light',
            status: 'required',
            reason: `The top light reaches ${Math.round(bottom)} mm above floor level, below the ${DOOR_CRITICAL_HEIGHT} mm threshold.`,
          },
    );
  }

  return locations;
}

function assessWindow(_config: WindowConfigState): CriticalLocation[] {
  return [
    {
      area: 'Window',
      status: 'cannot-determine',
      reason: `Whether this window is a critical location depends on the height of its cill above the finished floor, which the configurator does not know. Glazing below ${WALL_CRITICAL_HEIGHT} mm requires safety glass.`,
    },
  ];
}

/**
 * The safety glazing that must be fitted, given the configuration. Returns the
 * customer's own choice where no location is critical, and the minimum
 * acceptable specification where one is.
 */
export function requiredSafetyGlazing(config: ConfigState): SafetyGlazing {
  const assessment = assessCriticalLocations(config);
  if (!assessment.safetyGlazingForced) return config.glazing.safety;
  // Toughened is the minimum; a customer who chose laminated keeps it.
  return config.glazing.safety === 'laminated' ? 'laminated' : 'toughened';
}
