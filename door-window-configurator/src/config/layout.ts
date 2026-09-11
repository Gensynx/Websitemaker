/**
 * Door layout maths — one source of truth.
 *
 * The leaf size was derived independently in validation, in the safety
 * assessment and in the geometry, and the three had already drifted: two of
 * them ignored the threshold upstand. Everything that needs to know where a
 * part sits now asks this module.
 *
 * Coordinate convention, shared with the viewer geometry: millimetres, X to
 * the right with the opening centred on zero, Y up from finished floor level.
 */

import type { DoorConfigState } from './types';
import type { Mm } from './units';
import { sightlines } from './material';
import { THRESHOLD_HEIGHT } from './limits';

export interface Rect {
  x: Mm;
  y: Mm;
  width: Mm;
  height: Mm;
}

export interface DoorLayout {
  /** Upstand of the threshold above finished floor level. */
  thresholdHeight: Mm;
  /** Inside the outer frame, above the threshold. */
  opening: Rect;
  leftSideLight: Rect | null;
  rightSideLight: Rect | null;
  topLight: Rect | null;
  /** The door leaf itself, whose size derives from everything above. */
  leaf: Rect;
}

export function doorLayout(config: DoorConfigState): DoorLayout {
  const frame = sightlines(config.material);
  const { width, height } = config.dimensions;
  const thresholdHeight = THRESHOLD_HEIGHT[config.threshold];

  const opening: Rect = {
    x: -width / 2 + frame.outerFrame,
    y: thresholdHeight,
    width: width - frame.outerFrame * 2,
    height: height - frame.outerFrame - thresholdHeight,
  };

  let belowTransom = opening;
  let topLight: Rect | null = null;
  const top = config.surround.topLight;
  if (top !== null) {
    topLight = {
      x: opening.x,
      y: opening.y + opening.height - top.height,
      width: opening.width,
      height: top.height,
    };
    belowTransom = { ...opening, height: opening.height - top.height - frame.transom };
  }

  let leaf = belowTransom;
  let leftSideLight: Rect | null = null;
  let rightSideLight: Rect | null = null;

  const left = config.surround.leftSideLight;
  if (left !== null) {
    leftSideLight = { x: belowTransom.x, y: belowTransom.y, width: left.width, height: belowTransom.height };
    leaf = {
      ...leaf,
      x: leaf.x + left.width + frame.mullion,
      width: leaf.width - left.width - frame.mullion,
    };
  }

  const right = config.surround.rightSideLight;
  if (right !== null) {
    rightSideLight = {
      x: belowTransom.x + belowTransom.width - right.width,
      y: belowTransom.y,
      width: right.width,
      height: belowTransom.height,
    };
    leaf = { ...leaf, width: leaf.width - right.width - frame.mullion };
  }

  return { thresholdHeight, opening, leftSideLight, rightSideLight, topLight, leaf };
}

/**
 * Height above finished floor level at which the leaf's glazing starts.
 * Measured from FFL, not from the bottom of the leaf, because that is what
 * Approved Document K asks about.
 */
export function leafGlazingBottom(config: DoorConfigState, glazedFraction: number): Mm {
  const { leaf } = doorLayout(config);
  return leaf.y + leaf.height * (1 - glazedFraction);
}
