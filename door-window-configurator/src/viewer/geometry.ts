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
  SashOpening,
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

/**
 * The rectangle a light's glazing and furniture actually occupy: the cell,
 * less the sash section where the light opens.
 *
 * Checking containment against the whole cell is too loose to be useful — the
 * sash inset is wide enough to swallow a stray part and the test passes while
 * the render is wrong.
 */
export function windowLightRects(config: WindowConfigState): Rect[] {
  if (config.style.id !== 'casement' && config.style.id !== 'tilt-and-turn') return [];
  const frame = sightlines(config.material);
  const grid = config.style.options.grid;
  return windowCellRects(config).map((rect, index) => {
    const cell = grid.cells[index];
    return cell !== undefined && cell.opening !== 'fixed' ? inset(rect, frame.sash) : rect;
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
  const style = config.style;

  // A glazed leaf is stiles and rails around a hole, not a slab with a pane
  // laid on it. Glass inside an opaque box is invisible — the same mistake as
  // burying the raised panels, and again only a square-on render shows it.
  switch (style.id) {
    case 'solid-panel':
      parts.push(box('leaf', 'leaf', rect, z, frame.leafThickness));
      parts.push(...buildPanelDetail(style.options.panelDetail, rect, frame, frame.leafThickness));
      break;

    case 'full-glazed': {
      const aperture = style.options.aperture;
      parts.push(...frameMembers('leaf', 'leaf', rect, aperture.inset, z, frame.leafThickness));
      parts.push(...glazedArea('leaf-aperture', inset(rect, aperture.inset), aperture.bars, z, frame));
      break;
    }

    case 'half-glazed': {
      const aperture = style.options.aperture;
      const solidHeight = rect.height * (1 - style.options.glazedFraction);
      const solid: Rect = { ...rect, height: solidHeight };
      const glazed: Rect = {
        x: rect.x,
        y: rect.y + solidHeight,
        width: rect.width,
        height: rect.height - solidHeight,
      };

      parts.push(...frameMembers('leaf-upper', 'leaf', glazed, aperture.inset, z, frame.leafThickness));
      parts.push(...glazedArea('leaf-aperture', inset(glazed, aperture.inset), aperture.bars, z, frame));

      parts.push(box('leaf', 'leaf', solid, z, frame.leafThickness));
      parts.push(...buildPanelDetail(style.options.panelDetail, solid, frame, frame.leafThickness));
      break;
    }
  }

  parts.push(...buildDoorHardware(config, rect, solidRegion(config, frame, rect), z));
  return parts;
}

/**
 * The unglazed part of the leaf, where furniture can actually be fitted, and
 * the width of the stile the handle sits on.
 *
 * Door furniture was positioned against the whole leaf, which put a knocker
 * and a handle plate on the glass of a half-glazed door.
 */
function solidRegion(
  config: DoorConfigState,
  frame: Sightlines,
  rect: Rect,
): { area: Rect | null; stile: Mm } {
  switch (config.style.id) {
    case 'solid-panel':
      return { area: rect, stile: frame.doorLeafEdge };
    case 'full-glazed':
      return { area: null, stile: config.style.options.aperture.inset };
    case 'half-glazed':
      return {
        area: { ...rect, height: rect.height * (1 - config.style.options.glazedFraction) },
        stile: config.style.options.aperture.inset,
      };
  }
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

function buildDoorHardware(
  config: DoorConfigState,
  rect: Rect,
  solid: { area: Rect | null; stile: Mm },
  z: Mm,
): Part[] {
  const parts: Part[] = [];

  // The handle sits centred on the STILE, not wherever 90 mm from the edge
  // happens to land — on a glazed leaf that was the middle of the glass.
  const handleHeight = 1050;
  const centreline =
    config.hingeSide === 'left'
      ? rect.x + rect.width - solid.stile / 2
      : rect.x + solid.stile / 2;
  const inward = config.hingeSide === 'left' ? -1 : 1;

  if (config.hardware.handle === 'pull-bar') {
    parts.push(
      box(
        'handle',
        'hardware',
        { x: centreline - 16, y: rect.y + rect.height * 0.25, width: 32, height: rect.height * 0.5 },
        z + 40,
        32,
      ),
    );
  } else {
    const plate = config.hardware.handle === 'lever-backplate';
    const plateWidth = Math.min(plate ? 60 : 52, solid.stile);
    parts.push(
      box(
        'handle-plate',
        'hardware',
        {
          x: centreline - plateWidth / 2,
          y: handleHeight - (plate ? 110 : 26),
          width: plateWidth,
          height: plate ? 220 : 52,
        },
        z + 6,
        12,
      ),
    );
    if (config.hardware.handle === 'knob') {
      parts.push(box('handle-knob', 'hardware', { x: centreline - 27, y: handleHeight - 27, width: 54, height: 54 }, z + 26, 54));
    } else {
      // The lever stands proud of the leaf face, so it may legitimately
      // overhang glazing — that is how a real lever on a glazed door looks.
      const lever = 110;
      const x = inward < 0 ? centreline - lever : centreline;
      parts.push(box('handle-lever', 'hardware', { x, y: handleHeight - 9, width: lever, height: 18 }, z + 26, 18));
    }
  }

  // Everything else needs somewhere solid to be fixed to. A fully glazed leaf
  // has nowhere, so nothing is drawn — see the validation question raised with
  // this change.
  const area = solid.area;
  if (area === null || area.height <= 0) return parts;

  const centre = area.x + area.width / 2;
  if (config.hardware.letterplate) {
    parts.push(box('letterplate', 'hardware', { x: centre - 150, y: area.y + area.height * 0.35, width: 300, height: 78 }, z + 5, 10));
  }
  if (config.hardware.knocker !== null) {
    parts.push(box('knocker', 'hardware', { x: centre - 55, y: area.y + area.height * 0.78, width: 110, height: 110 }, z + 8, 16));
  }
  if (config.hardware.spyhole) {
    parts.push(box('spyhole', 'hardware', { x: centre - 12, y: area.y + area.height * 0.93, width: 24, height: 24 }, z + 4, 8));
  }
  return parts;
}

/* ------------------------------------------------------------------ *
 * Windows
 * ------------------------------------------------------------------ */

/**
 * The rectangle of every light in a gridded window, row-major from the top.
 *
 * Exported because the geometry and the tests that police it must agree on
 * where a cell is. A test that recomputes the bounds itself only proves the
 * two derivations match, which is the duplication this codebase has already
 * been bitten by once.
 */
export function windowCellRects(config: WindowConfigState): Rect[] {
  if (config.style.id !== 'casement' && config.style.id !== 'tilt-and-turn') return [];
  const frame = sightlines(config.material);
  const grid = config.style.options.grid;
  const opening: Rect = {
    x: -config.dimensions.width / 2 + frame.outerFrame,
    y: frame.outerFrame,
    width: config.dimensions.width - frame.outerFrame * 2,
    height: config.dimensions.height - frame.outerFrame * 2,
  };
  const columns = distribute(opening.width, grid.columnWeights, frame.mullion);
  const rows = distribute(opening.height, grid.rowWeights, frame.transom);

  const rects: Rect[] = [];
  rows.forEach((row) => {
    columns.forEach((column) => {
      rects.push({
        x: opening.x + column.offset,
        y: opening.y + opening.height - row.offset - row.size,
        width: column.size,
        height: row.size,
      });
    });
  });
  return rects;
}

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
      const cellRects = windowCellRects(config);
      const columnCount = grid.columnWeights.length;

      cellRects.forEach((cellRect, index) => {
        const columnIndex = index % columnCount;
        const rowIndex = Math.floor(index / columnCount);

        if (columnIndex > 0) {
          parts.push(
            box(
              `mullion-${rowIndex}-${columnIndex}`,
              'mullion',
              { x: cellRect.x - frame.mullion, y: opening.y, width: frame.mullion, height: opening.height },
              z,
              frame.frameDepth,
            ),
          );
        }
        if (columnIndex === 0 && rowIndex > 0) {
          parts.push(
            box(
              `transom-${rowIndex}`,
              'transom',
              { x: opening.x, y: cellRect.y + cellRect.height, width: opening.width, height: frame.transom },
              z,
              frame.frameDepth,
            ),
          );
        }

        const cell = grid.cells[index];
        if (cell === undefined) return;

        if (cell.opening === 'fixed') {
          parts.push(...glazedArea(`cell-${index}`, cellRect, cell.bars, z, frame));
        } else {
          parts.push(...frameMembers(`sash-${index}`, 'sash', cellRect, frame.sash, z + 12, frame.sashDepth));
          parts.push(...glazedArea(`cell-${index}`, inset(cellRect, frame.sash), cell.bars, z + 12, frame));
          parts.push(...buildWindowHandle(config, cell.opening, inset(cellRect, frame.sash), index, z));
        }
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
    // Vents sit IN the head member, not over the glazing: the head spans from
    // the top of the opening up to the outer frame face.
    const ventWidth = 260;
    const ventHeight = Math.min(18, frame.outerFrame * 0.4);
    const headCentre = opening.y + opening.height + frame.outerFrame / 2;
    const spread = distribute(opening.width, Array.from({ length: config.trickleVents.count }, () => 1), 0);
    spread.forEach((slot, index) => {
      const width = Math.min(ventWidth, slot.size * 0.8);
      parts.push(
        box(
          `vent-${index}`,
          'hardware',
          {
            x: opening.x + slot.offset + slot.size / 2 - width / 2,
            y: headCentre - ventHeight / 2,
            width,
            height: ventHeight,
          },
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
  opening: SashOpening,
  cell: Rect,
  index: number,
  z: Mm,
): Part[] {
  // The handle goes opposite the hinge, and the lever arm points back TOWARDS
  // the hinge — which is to say, into the sash. Pointing it outwards ran it
  // across the mullion and into the neighbouring light.
  const plate = 50;
  const lever = 80;
  const margin = 20;

  let plateX: Mm;
  let leverX: Mm;
  let y: Mm;

  switch (opening) {
    case 'side-hung-left':
      // Hinged left, handled on the right stile; lever points left.
      plateX = cell.x + cell.width - margin - plate;
      leverX = plateX - lever + plate / 2;
      y = cell.y + cell.height / 2;
      break;
    case 'side-hung-right':
      // Hinged right, handled on the left stile; lever points right.
      plateX = cell.x + margin;
      leverX = plateX + plate / 2;
      y = cell.y + cell.height / 2;
      break;
    case 'top-hung':
      plateX = cell.x + cell.width / 2 - plate / 2;
      leverX = plateX + plate / 2 - lever / 2;
      y = cell.y + margin + plate / 2;
      break;
    case 'bottom-hung':
      plateX = cell.x + cell.width / 2 - plate / 2;
      leverX = plateX + plate / 2 - lever / 2;
      y = cell.y + cell.height - margin - plate / 2;
      break;
    case 'fixed':
      return [];
  }

  // Nothing may leave its own light, in either axis. A narrow sash shortens
  // its furniture rather than lending it to the neighbour, and a shallow one
  // shrinks it rather than hanging it below the rail.
  const fit = (rect: Rect): Rect => {
    const width = Math.min(rect.width, cell.width);
    const height = Math.min(rect.height, cell.height);
    return {
      width,
      height,
      x: Math.max(cell.x, Math.min(rect.x, cell.x + cell.width - width)),
      y: Math.max(cell.y, Math.min(rect.y, cell.y + cell.height - height)),
    };
  };

  const parts: Part[] = [
    box(
      `handle-${index}-plate`,
      'hardware',
      fit({ x: plateX, y: y - plate / 2, width: plate, height: plate }),
      z + 22,
      12,
    ),
  ];
  if (config.hardware.handle !== 'knob') {
    parts.push(
      box(
        `handle-${index}-lever`,
        'hardware',
        fit({ x: leverX, y: y - 9, width: lever, height: 18 }),
        z + 34,
        18,
      ),
    );
  }
  return parts;
}
