/**
 * Frame material — the gate on everything else.
 *
 * Material determines which RAL shades and finishes can be ordered, how wide
 * the frame members are, and what sizes are manufacturable. It is therefore
 * resolved before colour, finish or dimensions are validated, and changing it
 * can invalidate selections that were legal a moment ago (see `reconcile` in
 * validate.ts).
 *
 * !! PLACEHOLDER CATALOGUE REQUIRING REPLACEMENT !!
 * All four materials are modelled because the brief did not say which are
 * actually sold. Narrowing the list is a data change here, not a schema change.
 * Every sightline, colour restriction and finish restriction below is a
 * plausible industry figure, not a supplied one.
 */

import type { Mm } from './units';
import type { RalCode } from './ral';
import { RAL_PALETTE } from './ral';

export type FrameMaterial = 'upvc' | 'aluminium' | 'timber' | 'composite';

export const FRAME_MATERIALS: readonly FrameMaterial[] = ['upvc', 'aluminium', 'timber', 'composite'];

export type Finish = 'smooth' | 'textured' | 'woodgrain-foil';

/**
 * Visible face widths of frame members. Consumed by the parametric geometry in
 * Step 2 — a uPVC frame reads as chunky and an aluminium one as slim because
 * these numbers differ, not because the models differ.
 */
export interface Sightlines {
  outerFrame: Mm;
  sash: Mm;
  mullion: Mm;
  transom: Mm;
  doorLeafEdge: Mm;
  glazingBead: Mm;
}

export interface MaterialDefinition {
  label: string;
  sightlines: Sightlines;
  finishes: readonly Finish[];
  /**
   * RAL shades offered in this material. `null` means the whole palette is
   * available — used for powder-coated aluminium, where any RAL can be sprayed.
   */
  colours: readonly RalCode[] | null;
}

/** PLACEHOLDER. */
export const MATERIALS: Record<FrameMaterial, MaterialDefinition> = {
  upvc: {
    label: 'uPVC',
    sightlines: { outerFrame: 70, sash: 76, mullion: 90, transom: 90, doorLeafEdge: 100, glazingBead: 18 },
    finishes: ['smooth', 'textured', 'woodgrain-foil'],
    colours: ['RAL9016', 'RAL9010', 'RAL9001', 'RAL7016', 'RAL7015', 'RAL7035', 'RAL6009', 'RAL5011', 'RAL3005', 'RAL8017', 'RAL1015'],
  },
  aluminium: {
    label: 'Aluminium',
    sightlines: { outerFrame: 50, sash: 54, mullion: 60, transom: 60, doorLeafEdge: 80, glazingBead: 14 },
    finishes: ['smooth', 'textured'],
    // Powder coating takes any RAL.
    colours: null,
  },
  timber: {
    label: 'Timber',
    sightlines: { outerFrame: 63, sash: 58, mullion: 75, transom: 75, doorLeafEdge: 95, glazingBead: 16 },
    finishes: ['smooth'],
    colours: ['RAL9016', 'RAL9010', 'RAL9001', 'RAL7016', 'RAL7012', 'RAL6005', 'RAL6009', 'RAL5003', 'RAL3004', 'RAL8003', 'RAL1015'],
  },
  composite: {
    label: 'Composite',
    sightlines: { outerFrame: 70, sash: 76, mullion: 90, transom: 90, doorLeafEdge: 110, glazingBead: 18 },
    finishes: ['smooth', 'woodgrain-foil'],
    colours: ['RAL9016', 'RAL7016', 'RAL7015', 'RAL6009', 'RAL5011', 'RAL5003', 'RAL3005', 'RAL8017', 'RAL9005'],
  },
};

export function sightlines(material: FrameMaterial): Sightlines {
  return MATERIALS[material].sightlines;
}

export function availableFinishes(material: FrameMaterial): readonly Finish[] {
  return MATERIALS[material].finishes;
}

export function availableColours(material: FrameMaterial): readonly RalCode[] {
  const allowed = MATERIALS[material].colours;
  return allowed ?? RAL_PALETTE.map((entry) => entry.code);
}

export function isColourAvailable(material: FrameMaterial, code: RalCode): boolean {
  const allowed = MATERIALS[material].colours;
  return allowed === null || allowed.includes(code);
}

export function isFinishAvailable(material: FrameMaterial, finish: Finish): boolean {
  return MATERIALS[material].finishes.includes(finish);
}

/** First available option, used when a material change invalidates a selection. */
export function fallbackColour(material: FrameMaterial): RalCode {
  const first = availableColours(material)[0];
  if (first === undefined) throw new Error(`Material ${material} offers no colours`);
  return first;
}

export function fallbackFinish(material: FrameMaterial): Finish {
  const first = availableFinishes(material)[0];
  if (first === undefined) throw new Error(`Material ${material} offers no finishes`);
  return first;
}
