/**
 * Parametric product geometry.
 *
 * Everything the viewer draws is computed here from ConfigState and the frame
 * material's sightlines. There are no modelled assets: a part list of boxes,
 * glazed panes and swept details, positioned in millimetres.
 *
 * Because the part list is plain data it serves three consumers — the WebGL
 * scene, the SVG fallback drawn when WebGL is unavailable, and the tests that
 * prove proportions are genuinely dimension-driven rather than a fixed model
 * being scaled.
 *
 * Coordinate system: millimetres, X to the right, Y up from finished floor
 * level, Z towards the outside. The origin sits on the floor at the centre of
 * the structural opening.
 */

import type {
  BarLayout,
  ConfigState,
  DoorConfigState,
  PanelDetail,
  WindowConfigState,
} from '../config/types';
import type { Mm } from '../config/units';
import { sightlines } from '../config/material';
import type { Sightlines } from '../config/material';
import { doorLayout } from '../config/layout';
import type { Rect } from '../config/layout';

export type PartKind =
  | 'frame'
  | 'mullion'
  | 'transom'
  | 'threshold'
  | 'leaf'
  | 'sash'
  | 'panel'
  | 'bar'
  | 'glazing'
  | 'hardware';

export interface Part {
  id: string;
  kind: PartKind;
  /** Centre of the part, in mm. */
  position: [Mm, Mm, Mm];
  /** Full extent of the part, in mm. */
  size: [Mm, Mm, Mm];
}

export interface ProductModel {
  parts: Part[];
  /** Overall structural extent, for framing the camera and the annotations. */
  bounds: { width: Mm; height: Mm; depth: Mm };
}

export function buildProduct(config: ConfigState): ProductModel {
  const frame = sightlines(config.material);
  const parts =
    config.productType === 'door' ? buildDoor(config, frame) : buildWindow(config, frame);

  return {
    parts,
    bounds: {
      width: config.dimensions.width,
      height: config.dimensions.height,
      depth: frame.frameDepth,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

function box(id: string, kind: PartKind, rect: Rect, z: Mm, depth: Mm): Part {
  return {
    id,
    kind,
    position: [rect.x + rect.width / 2, rect.y + rect.height / 2, z],
    size: [rect.width, rect.height, depth],
  };
}

/** The four members of a frame around a rectangle, drawn inwards. */
function frameMembers(
  id: string,
  kind: PartKind,
  outer: Rect,
  face: Mm,
  z: Mm,
  depth: Mm,
): Part[] {
  return [
    box(`${id}-head`, kind, { x: outer.x, y: outer.y + outer.height - face, width: outer.width, height: face }, z, depth),
    box(`${id}-cill`, kind, { x: outer.x, y: outer.y, width: outer.width, height: face }, z, depth),
    box(`${id}-left`, kind, { x: outer.x, y: outer.y + face, width: face, height: outer.height - face * 2 }, z, depth),
    box(`${id}-right`, kind, { x: outer.x + outer.width - face, y: outer.y + face, width: face, height: outer.height - face * 2 }, z, depth),
  ];
}

function inset(rect: Rect, by: Mm): Rect {
  return { x: rect.x + by, y: rect.y + by, width: rect.width - by * 2, height: rect.height - by * 2 };
}

/** Glazing plus its bars, filling a rectangle. */
function glazedArea(id: string, rect: Rect, bars: BarLayout, z: Mm, frame: Sightlines): Part[] {
  const pane = inset(rect, frame.glazingBead);
  if (pane.width <= 0 || pane.height <= 0) return [];

  const parts: Part[] = [box(`${id}-glass`, 'glazing', pane, z, 24)];
  if (bars.style === 'none') return parts;

  // Bars divide the pane into `columns` x `rows`, so there are columns-1
  // vertical bars and rows-1 horizontal ones, evenly spaced.
  const barDepth = bars.style === 'georgian-internal' ? 20 : 26;
  for (let index = 1; index < bars.columns; index += 1) {
    const x = pane.x + (pane.width * index) / bars.columns - bars.barWidth / 2;
    parts.push(box(`${id}-bar-v${index}`, 'bar', { x, y: pane.y, width: bars.barWidth, height: pane.height }, z, barDepth));
  }
  for (let index = 1; index < bars.rows; index += 1) {
    const y = pane.y + (pane.height * index) / bars.rows - bars.barWidth / 2;
    parts.push(box(`${id}-bar-h${index}`, 'bar', { x: pane.x, y, width: pane.width, height: bars.barWidth }, z, barDepth));
  }
  return parts;
}

/** Distributes relative weights across a span, allowing for dividers between. */
export function distribute(span: Mm, weights: number[], divider: Mm): Array<{ offset: Mm; size: Mm }> {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0 || weights.length === 0) return [];
  const available = span - divider * (weights.length - 1);
  let offset = 0;
  return weights.map((weight) => {
    const size = (available * weight) / total;
    const result = { offset, size };
    offset += size + divider;
    return result;
  });
}

/* ------------------------------------------------------------------ *
 * Doors
 * ------------------------------------------------------------------ */

function buildDoor(config: DoorConfigState, frame: Sightlines): Part[] {
  const { width, height } = config.dimensions;
  const layout = doorLayout(config);
  const parts: Part[] = [];
  const z = 0;

  parts.push(
    ...frameMembers('frame', 'frame', { x: -width / 2, y: 0, width, height }, frame.outerFrame, z, frame.frameDepth),
  );

  parts.push(
    box(
      'threshold',
      'threshold',
      { x: layout.opening.x, y: 0, width: layout.opening.width, height: layout.thresholdHeight },
      z + 10,
      frame.frameDepth + 20,
    ),
  );

  const topLight = config.surround.topLight;
  if (topLight !== null && layout.topLight !== null) {
    parts.push(...glazedArea('top-light', layout.topLight, topLight.bars, z, frame));
    parts.push(
      box(
        'transom',
        'transom',
        { x: layout.opening.x, y: layout.topLight.y - frame.transom, width: layout.opening.width, height: frame.transom },
        z,
        frame.frameDepth,
      ),
    );
  }

  const leftLight = config.surround.leftSideLight;
  if (leftLight !== null && layout.leftSideLight !== null) {
    parts.push(...glazedArea('side-light-left', layout.leftSideLight, leftLight.bars, z, frame));
    parts.push(
      box(
        'mullion-left',
        'mullion',
        { x: layout.leaf.x - frame.mullion, y: layout.leaf.y, width: frame.mullion, height: layout.leaf.height },
        z,
        frame.frameDepth,
      ),
    );
  }

  const rightLight = config.surround.rightSideLight;
  if (rightLight !== null && layout.rightSideLight !== null) {
    parts.push(...glazedArea('side-light-right', layout.rightSideLight, rightLight.bars, z, frame));
    parts.push(
      box(
        'mullion-right',
        'mullion',
        { x: layout.leaf.x + layout.leaf.width, y: layout.leaf.y, width: frame.mullion, height: layout.leaf.height },
        z,
        frame.frameDepth,
      ),
    );
  }

  parts.push(...buildLeaf(config, frame, layout.leaf));
  return parts;
}

function buildLeaf(config: DoorConfigState, frame: Sightlines, rect: Rect): Part[] {
  const parts: Part[] = [];
  const z = frame.leafThickness / 2;
  parts.push(box('leaf', 'leaf', rect, z, frame.leafThickness));

  const style = config.style;
  if (style.id !== 'solid-panel') {
    const aperture = style.options.aperture;
    const glazed: Rect =
      style.id === 'full-glazed'
        ? inset(rect, aperture.inset)
        : {
            x: rect.x + aperture.inset,
            y: rect.y + rect.height * (1 - style.options.glazedFraction),
            width: rect.width - aperture.inset * 2,
            height: rect.height * style.options.glazedFraction - aperture.inset,
          };
    parts.push(...glazedArea('leaf-aperture', glazed, aperture.bars, z, frame));
  }

  // Panel detailing sits on the solid part of the leaf.
  if (style.id !== 'full-glazed') {
    const solid: Rect =
      style.id === 'solid-panel'
        ? rect
        : { ...rect, height: rect.height * (1 - style.options.glazedFraction) };
    parts.push(...buildPanelDetail(style.options.panelDetail, solid, frame, frame.leafThickness));
  }

  parts.push(...buildDoorHardware(config, frame, rect, z));
  return parts;
}

function buildPanelDetail(
  detail: PanelDetail,
  rect: Rect,
  frame: Sightlines,
  faceZ: Mm,
): Part[] {
  const margin = frame.doorLeafEdge;
  const field = inset(rect, margin);
  if (field.width <= 0 || field.height <= 0) return [];

  switch (detail.kind) {
    case 'flush':
      return [];
    case 'raised': {
      // Panels stand PROUD of the leaf face. Sitting them inside its thickness
      // made them invisible, which is what a render showed and no unit test
      // could have.
      const depth = 18;
      const rows = distribute(field.height, Array.from({ length: detail.panels }, () => 1), margin);
      return rows.map((row, index) =>
        box(
          `panel-${index}`,
          'panel',
          { x: field.x, y: field.y + row.offset, width: field.width, height: row.size },
          faceZ + depth / 2 - 4,
          depth,
        ),
      );
    }
    case 'grooved': {
      // A routed groove is an absence, and a box cannot subtract one. The face
      // is built instead as slabs standing proud with gaps between them, so
      // the groove is the leaf showing through — which is what it is.
      const depth = 10;
      const horizontal = detail.orientation === 'horizontal';
      const slabs = distribute(
        horizontal ? field.height : field.width,
        Array.from({ length: detail.grooves + 1 }, () => 1),
        detail.grooveWidth,
      );
      return slabs.map((slab, index) => {
        const slabRect: Rect = horizontal
          ? { x: field.x, y: field.y + slab.offset, width: field.width, height: slab.size }
          : { x: field.x + slab.offset, y: field.y, width: slab.size, height: field.height };
        return box(`groove-slab-${index}`, 'panel', slabRect, faceZ + depth / 2 - 3, depth);
      });
    }
  }
}

function buildDoorHardware(config: DoorConfigState, frame: Sightlines, rect: Rect, z: Mm): Part[] {
  const parts: Part[] = [];
  // Handle sits on the leading edge, opposite the hinges, at 1050 mm — the
  // stile width sets how far in it lands, so it tracks the frame material.
  const stile = frame.doorLeafEdge * 0.9;
  const leading = config.hingeSide === 'left' ? rect.x + rect.width - stile : rect.x + stile;
  const handleHeight = 1050;

  if (config.hardware.handle === 'pull-bar') {
    parts.push(box('handle', 'hardware', { x: leading - 16, y: rect.y + rect.height * 0.25, width: 32, height: rect.height * 0.5 }, z + 40, 32));
  } else {
    const plate = config.hardware.handle === 'lever-backplate';
    parts.push(box('handle-plate', 'hardware', { x: leading - (plate ? 30 : 26), y: handleHeight - (plate ? 110 : 26), width: plate ? 60 : 52, height: plate ? 220 : 52 }, z + 6, 12));
    if (config.hardware.handle !== 'knob') {
      parts.push(box('handle-lever', 'hardware', { x: leading - 100, y: handleHeight - 9, width: 110, height: 18 }, z + 26, 18));
    } else {
      parts.push(box('handle-knob', 'hardware', { x: leading - 27, y: handleHeight - 27, width: 54, height: 54 }, z + 26, 54));
    }
  }

  if (config.hardware.letterplate) {
    parts.push(box('letterplate', 'hardware', { x: rect.x + rect.width / 2 - 150, y: rect.y + rect.height * 0.42, width: 300, height: 78 }, z + 5, 10));
  }
  if (config.hardware.spyhole) {
    parts.push(box('spyhole', 'hardware', { x: rect.x + rect.width / 2 - 12, y: rect.y + rect.height * 0.78, width: 24, height: 24 }, z + 4, 8));
  }
  if (config.hardware.knocker !== null) {
    parts.push(box('knocker', 'hardware', { x: rect.x + rect.width / 2 - 55, y: rect.y + rect.height * 0.66, width: 110, height: 110 }, z + 8, 16));
  }
  return parts;
}

/* ------------------------------------------------------------------ *
 * Windows
 * ------------------------------------------------------------------ */

function buildWindow(config: WindowConfigState, frame: Sightlines): Part[] {
  const { width, height } = config.dimensions;
  const left = -width / 2;
  const parts: Part[] = [];
  const z = 0;

  parts.push(...frameMembers('frame', 'frame', { x: left, y: 0, width, height }, frame.outerFrame, z, frame.frameDepth));

  const opening: Rect = {
    x: left + frame.outerFrame,
    y: frame.outerFrame,
    width: width - frame.outerFrame * 2,
    height: height - frame.outerFrame * 2,
  };

  switch (config.style.id) {
    case 'casement':
    case 'tilt-and-turn': {
      const grid = config.style.options.grid;
      const columns = distribute(opening.width, grid.columnWeights, frame.mullion);
      // Rows are laid out from the top, which is how a customer reads them.
      const rows = distribute(opening.height, grid.rowWeights, frame.transom);

      columns.forEach((column, columnIndex) => {
        if (columnIndex > 0) {
          parts.push(box(`mullion-${columnIndex}`, 'mullion', { x: opening.x + column.offset - frame.mullion, y: opening.y, width: frame.mullion, height: opening.height }, z, frame.frameDepth));
        }
        rows.forEach((row, rowIndex) => {
          if (columnIndex === 0 && rowIndex > 0) {
            parts.push(box(`transom-${rowIndex}`, 'transom', { x: opening.x, y: opening.y + opening.height - row.offset, width: opening.width, height: frame.transom }, z, frame.frameDepth));
          }
          const index = rowIndex * columns.length + columnIndex;
          const cell = grid.cells[index];
          if (cell === undefined) return;

          const cellRect: Rect = {
            x: opening.x + column.offset,
            y: opening.y + opening.height - row.offset - row.size,
            width: column.size,
            height: row.size,
          };

          if (cell.opening === 'fixed') {
            parts.push(...glazedArea(`cell-${index}`, cellRect, cell.bars, z, frame));
          } else {
            parts.push(...frameMembers(`sash-${index}`, 'sash', cellRect, frame.sash, z + 12, frame.sashDepth));
            parts.push(...glazedArea(`cell-${index}`, inset(cellRect, frame.sash), cell.bars, z + 12, frame));
            parts.push(...buildWindowHandle(config, cell.opening, cellRect, index, z));
          }
        });
      });
      break;
    }
    case 'sash': {
      const options = config.style.options;
      const railY = opening.y + opening.height * options.meetingRailPosition;
      const lower: Rect = { ...opening, height: railY - opening.y };
      const upper: Rect = { x: opening.x, y: railY, width: opening.width, height: opening.y + opening.height - railY };

      parts.push(...frameMembers('sash-upper', 'sash', upper, frame.sash, z + 6, frame.sashDepth));
      parts.push(...glazedArea('sash-upper', inset(upper, frame.sash), options.upperBars, z + 6, frame));
      parts.push(...frameMembers('sash-lower', 'sash', lower, frame.sash, z + 24, frame.sashDepth));
      parts.push(...glazedArea('sash-lower', inset(lower, frame.sash), options.lowerBars, z + 24, frame));

      if (options.horns) {
        const hornHeight = frame.sash * 1.4;
        for (const [id, x] of [
          ['horn-left', upper.x],
          ['horn-right', upper.x + upper.width - frame.sash],
        ] as const) {
          parts.push(box(id, 'sash', { x, y: upper.y - hornHeight, width: frame.sash, height: hornHeight }, z + 6, frame.sashDepth));
        }
      }
      break;
    }
    case 'fixed':
      parts.push(...glazedArea('fixed', opening, config.style.options.bars, z, frame));
      break;
  }

  if (config.trickleVents !== null) {
    const ventWidth = 260;
    const spread = distribute(opening.width, Array.from({ length: config.trickleVents.count }, () => 1), 0);
    spread.forEach((slot, index) => {
      parts.push(
        box(
          `vent-${index}`,
          'hardware',
          { x: opening.x + slot.offset + slot.size / 2 - ventWidth / 2, y: opening.y + opening.height - frame.outerFrame * 0.6, width: Math.min(ventWidth, slot.size * 0.8), height: 18 },
          z + frame.frameDepth / 2 + 2,
          10,
        ),
      );
    });
  }

  return parts;
}

function buildWindowHandle(
  config: WindowConfigState,
  opening: string,
  cell: Rect,
  index: number,
  z: Mm,
): Part[] {
  // The handle goes opposite the hinge: a left-hung sash is handled on the
  // right, a top-hung one at the cill.
  const y = opening === 'top-hung' ? cell.y + 60 : cell.y + cell.height / 2;
  const x =
    opening === 'side-hung-left'
      ? cell.x + cell.width - 70
      : opening === 'side-hung-right'
        ? cell.x + 20
        : cell.x + cell.width / 2 - 25;

  const parts: Part[] = [
    box(`handle-${index}-plate`, 'hardware', { x, y: y - 25, width: 50, height: 50 }, z + 22, 12),
  ];
  if (config.hardware.handle !== 'knob') {
    parts.push(box(`handle-${index}-lever`, 'hardware', { x: x - 70, y: y - 9, width: 80, height: 18 }, z + 34, 18));
  }
  return parts;
}
