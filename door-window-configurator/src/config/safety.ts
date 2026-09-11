/**
 * Critical locations and forced safety glazing, assessed per pane.
 *
 * !! NOT A COMPLIANCE TOOL — VERIFY BEFORE RELYING ON IT !!
 * A simplified reading of Approved Document K (England and Wales), section K5,
 * "critical locations" in glazing. Scotland (Technical Handbooks) and Northern
 * Ireland (Technical Booklets) differ. The output prompts the customer and
 * notes the point for the surveyor. It is not a compliance statement and a
 * competent person must confirm the specification on survey.
 *
 * The rules modelled, as commonly summarised:
 *   - Glazing in a door, between finished floor level and 1500 mm above it.
 *   - Glazing in a side panel within 300 mm of a door edge, between finished
 *     floor level and 1500 mm above it.
 *   - Glazing in a wall or partition, between finished floor level and 800 mm.
 *
 * The third rule cannot be evaluated here: whether a window is a critical
 * location depends on its cill height above the finished floor, which is a
 * property of the installation, not of the product. Per decision 3 that stays
 * out of ConfigState and is asked, optionally, on the enquiry form. Windows
 * therefore always return `cannot-determine`, and the notice carries through
 * to the summary and the enquiry.
 */

import type {
  ConfigState,
  DoorConfigState,
  PaneId,
  SafetyGlazing,
  SafetyOverride,
  WindowConfigState,
} from './types';
import { resolveSafety } from './types';
import type { Mm } from './units';
import { doorLayout, leafGlazingBottom } from './layout';

export const DOOR_CRITICAL_HEIGHT: Mm = 1500;
export const WALL_CRITICAL_HEIGHT: Mm = 800;
export const DOOR_ADJACENT_DISTANCE: Mm = 300;

export type CriticalStatus = 'required' | 'not-required' | 'cannot-determine';

/** The minimum acceptable glass where a location is critical. */
export const MINIMUM_SAFETY_GLASS: SafetyGlazing = 'toughened';

export interface PaneAssessment {
  id: PaneId;
  /** Human label for the summary panel and the enquiry. */
  label: string;
  status: CriticalStatus;
  reason: string;
  /** The pane's own override, before inheritance. */
  override: SafetyOverride;
  /** What the pane is actually glazed with, after inheritance. */
  resolved: SafetyGlazing;
  /** Lowest acceptable specification for this pane. */
  minimum: SafetyGlazing;
  /** True where `resolved` does not meet `minimum`. */
  short: boolean;
}

export interface SafetyAssessment {
  panes: PaneAssessment[];
  safetyGlazingForced: boolean;
  undetermined: boolean;
  /** Panes glazed below their required minimum. */
  shortfalls: PaneAssessment[];
}

/** Height of the door leaf, derived from the overall opening (decision 10). */
export function doorLeafHeight(config: DoorConfigState): Mm {
  return doorLayout(config).leaf.height;
}

function complete(
  partial: Omit<PaneAssessment, 'resolved' | 'minimum' | 'short'>,
  product: SafetyGlazing,
): PaneAssessment {
  const resolved = resolveSafety(product, partial.override);
  const minimum: SafetyGlazing = partial.status === 'required' ? MINIMUM_SAFETY_GLASS : 'none';
  const short = partial.status === 'required' && resolved === 'none';
  return { ...partial, resolved, minimum, short };
}

export function assessCriticalLocations(config: ConfigState): SafetyAssessment {
  const panes =
    config.productType === 'door'
      ? assessDoor(config).map((p) => complete(p, config.glazing.safety))
      : assessWindow(config).map((p) => complete(p, config.glazing.safety));

  return {
    panes,
    safetyGlazingForced: panes.some((p) => p.status === 'required'),
    undetermined: panes.some((p) => p.status === 'cannot-determine'),
    shortfalls: panes.filter((p) => p.short),
  };
}

type RawPane = Omit<PaneAssessment, 'resolved' | 'minimum' | 'short'>;

function assessDoor(config: DoorConfigState): RawPane[] {
  const panes: RawPane[] = [];

  switch (config.style.id) {
    case 'solid-panel':
      break; // No glazing in the leaf, so no pane to assess.
    case 'full-glazed':
      panes.push({
        id: 'leaf',
        label: 'Door leaf',
        status: 'required',
        reason: `Glazing in a door below ${DOOR_CRITICAL_HEIGHT} mm is a critical location.`,
        override: config.style.options.aperture.safety,
      });
      break;
    case 'half-glazed': {
      // Measured from finished floor level, so the threshold upstand counts.
      const glazingBottom = leafGlazingBottom(config, config.style.options.glazedFraction);
      panes.push({
        id: 'leaf',
        label: 'Door leaf',
        status: glazingBottom < DOOR_CRITICAL_HEIGHT ? 'required' : 'not-required',
        reason:
          glazingBottom < DOOR_CRITICAL_HEIGHT
            ? `The glazed panel reaches ${Math.round(glazingBottom)} mm above floor level, below the ${DOOR_CRITICAL_HEIGHT} mm threshold for a door.`
            : `The glazed panel starts at ${Math.round(glazingBottom)} mm above floor level, above the ${DOOR_CRITICAL_HEIGHT} mm threshold.`,
        override: config.style.options.aperture.safety,
      });
      break;
    }
  }

  for (const [id, label, light] of [
    ['side-light-left', 'Left side light', config.surround.leftSideLight],
    ['side-light-right', 'Right side light', config.surround.rightSideLight],
  ] as const) {
    if (light === null) continue;
    // A side light sits against the door, so it is always inside the 300 mm
    // door-adjacent distance, and it runs down to floor level.
    panes.push({
      id,
      label,
      status: 'required',
      reason: `A glazed side panel within ${DOOR_ADJACENT_DISTANCE} mm of a door edge is a critical location below ${DOOR_CRITICAL_HEIGHT} mm.`,
      override: light.safety,
    });
  }

  const topLight = config.surround.topLight;
  if (topLight !== null) {
    const bottom = config.dimensions.height - topLight.height;
    panes.push({
      id: 'top-light',
      label: 'Top light',
      status: bottom >= DOOR_CRITICAL_HEIGHT ? 'not-required' : 'required',
      reason:
        bottom >= DOOR_CRITICAL_HEIGHT
          ? `The top light sits at ${Math.round(bottom)} mm above floor level, above the ${DOOR_CRITICAL_HEIGHT} mm threshold.`
          : `The top light reaches ${Math.round(bottom)} mm above floor level, below the ${DOOR_CRITICAL_HEIGHT} mm threshold.`,
      override: topLight.safety,
    });
  }

  return panes;
}

function assessWindow(config: WindowConfigState): RawPane[] {
  const reason = `Whether this window is a critical location depends on the height of its cill above the finished floor, which the configurator does not know. Glazing below ${WALL_CRITICAL_HEIGHT} mm requires safety glass.`;

  if (config.style.id === 'casement' || config.style.id === 'tilt-and-turn') {
    return config.style.options.grid.cells.map((cell, index) => ({
      id: `cell-${index}` as PaneId,
      label: `Light ${index + 1}`,
      status: 'cannot-determine' as const,
      reason,
      override: cell.safety,
    }));
  }

  return [
    {
      id: 'cell-0',
      label: 'Window',
      status: 'cannot-determine',
      reason,
      override: null,
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Enforcement and the UI contract
 * ------------------------------------------------------------------ */

export interface SafetyControl {
  id: PaneId;
  label: string;
  /** True where the customer must not be able to choose 'none'. */
  locked: boolean;
  /** The value the locked control shows. */
  value: SafetyGlazing;
  /** Displayed beside the locked control, verbatim. */
  reason: string;
}

/**
 * What the Colour/Glazing panel renders (Step 4). A critical location is shown
 * as a LOCKED control carrying its reason — never as a silently corrected
 * value, and never as an error the customer has no control to fix.
 */
export function safetyControlState(config: ConfigState): SafetyControl[] {
  return assessCriticalLocations(config).panes.map((pane) => ({
    id: pane.id,
    label: pane.label,
    locked: pane.status === 'required',
    value: pane.status === 'required' && pane.resolved === 'none' ? MINIMUM_SAFETY_GLASS : pane.resolved,
    reason: pane.reason,
  }));
}

export interface SafetyNotice {
  paneId: PaneId;
  message: string;
}

/**
 * Raises any pane glazed below its required minimum and reports every change.
 *
 * Runs whenever a configuration arrives or changes shape — a decoded link, or
 * an edit that makes a location critical, such as adding a side light. The
 * customer is told; nothing is corrected silently. Validation still errors on
 * a shortfall, as a backstop for any path that skips this.
 */
export function enforceSafetyGlazing(config: ConfigState): {
  config: ConfigState;
  notices: SafetyNotice[];
} {
  const assessment = assessCriticalLocations(config);
  if (assessment.shortfalls.length === 0) return { config, notices: [] };

  const notices: SafetyNotice[] = assessment.shortfalls.map((pane) => ({
    paneId: pane.id,
    message: `${pane.label}: ${MINIMUM_SAFETY_GLASS} safety glass has been specified because this is a critical location. ${pane.reason}`,
  }));

  // Phase 1 sets safety at product level, so the product-level value is raised
  // rather than each pane being overridden individually. Per-pane overrides
  // survive untouched, and a pane that already specifies laminated keeps it.
  return {
    config: { ...config, glazing: { ...config.glazing, safety: MINIMUM_SAFETY_GLASS } },
    notices,
  };
}
