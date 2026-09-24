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
  MouldingProfile,
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
  | 'seal'
  | 'spacer'
  | 'frame'
  | 'mullion'
  | 'transom'
  | 'threshold'
  | 'leaf'
  | 'sash'
  | 'panel'
  | 'bar'
  | 'glazing'
  | 'vent'
  | 'hardware';

/**
 * How a part is shaped WITHIN its bounding box.
 *
 * The bounding box (`position`, `size`) remains the contract: every
 * containment and overlap test, and the SVG fallback, work on it alone. The
 * shape only tells the 3D renderer what to draw inside it.
 *
 * `raised` is a stepped frustum whose front face is inset by the moulding
 * profile. It exists because a raised panel drawn as a plain box has a front
 * face parallel to the leaf — the same normal, the same reflection — and on a
 * dark finish is therefore invisible however it is lit. Relief on a dark
 * surface is carried by faces at DIFFERENT angles catching different parts of
 * the environment, which is what a real moulding is.
 */
export type PartShape =
  | { kind: 'box' }
  | {
      kind: 'raised';
      profile: MouldingProfile;
      /**
       * Width of the bevel, where it is dictated by something real rather than
       * proportion — a routed groove's V is half the groove each side.
       */
      bevel?: Mm;
    }
  | { kind: 'cylinder'; axis: 'x' | 'y' | 'z' }
  | { kind: 'sphere' }
  /** A ring lying in the plane of the product, facing out. */
  | { kind: 'torus' };

export interface Part {
  id: string;
  kind: PartKind;
  /** Centre of the part, in mm. */
  position: [Mm, Mm, Mm];
  /** Full extent of the part, in mm. */
  size: [Mm, Mm, Mm];
  /** Defaults to a box. */
  shape?: PartShape;
  /**
   * Which face of the product the part sits on, and so which finish it takes.
   * Defaults to external. Only meaningful for parts that are not six-sided
   * boxes, which carry both finishes on their own faces.
   */
  facing?: 'external' | 'internal';
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
/**
 * Glazing, its spacer bars, and its glazing bars, filling a rectangle.
 *
 * `cavities` is 1 for a double-glazed unit and 2 for triple. Each cavity has a
 * spacer bar round its edge, just inside the bead — the thin dark line seen in
 * every real sealed unit. It is most of what makes a pane read as GLAZING
 * rather than as a pale panel, and it is the visible difference between double
 * and triple when the product is turned.
 */
function glazedArea(id: string, rect: Rect, bars: BarLayout, z: Mm, frame: Sightlines, cavities: 1 | 2 = 1): Part[] {
  const pane = inset(rect, frame.glazingBead);
  if (pane.width <= 0 || pane.height <= 0) return [];

  const unitDepth = cavities === 2 ? 36 : 24;
  const parts: Part[] = [box(`${id}-glass`, 'glazing', pane, z, unitDepth)];

  const spacer = 7;
  const edge = inset(pane, 1.5);
  if (edge.width > spacer * 3 && edge.height > spacer * 3) {
    const offsets = cavities === 2 ? [-unitDepth / 4, unitDepth / 4] : [0];
    offsets.forEach((dz, layer) => {
      const tag = `${id}-spacer${cavities === 2 ? `-${layer}` : ''}`;
      parts.push(
        box(`${tag}-head`, 'spacer', { x: edge.x, y: edge.y + edge.height - spacer, width: edge.width, height: spacer }, z + dz, 6),
        box(`${tag}-foot`, 'spacer', { x: edge.x, y: edge.y, width: edge.width, height: spacer }, z + dz, 6),
        box(`${tag}-left`, 'spacer', { x: edge.x, y: edge.y + spacer, width: spacer, height: edge.height - spacer * 2 }, z + dz, 6),
        box(`${tag}-right`, 'spacer', { x: edge.x + edge.width - spacer, y: edge.y + spacer, width: spacer, height: edge.height - spacer * 2 }, z + dz, 6),
      );
    });
  }

  if (bars.style === 'none') return parts;

  // Bars divide the pane into `columns` x `rows`, so there are columns-1
  // vertical bars and rows-1 horizontal ones, evenly spaced. Georgian bars sit
  // INSIDE the unit, so they are thinner in depth than applied astragals.
  const barDepth = bars.style === 'georgian-internal' ? 10 : unitDepth + 4;
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
  const cavities: 1 | 2 = config.glazing.unit === 'triple' ? 2 : 1;
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
    parts.push(...glazedArea('top-light', layout.topLight, topLight.bars, z, frame, cavities));
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
    parts.push(...glazedArea('side-light-left', layout.leftSideLight, leftLight.bars, z, frame, cavities));
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
    parts.push(...glazedArea('side-light-right', layout.rightSideLight, rightLight.bars, z, frame, cavities));
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

/**
 * Clearance between the leaf and its frame, sides and head. Real, and
 * visible: the fine dark line it makes is most of what tells a frame from
 * a leaf of the same colour. Without it the two read as one slab.
 */
export const LEAF_CLEARANCE = 4;

/** The same, round an opening casement sash. */
export const SASH_CLEARANCE = 3;

function buildLeaf(config: DoorConfigState, frame: Sightlines, opening: Rect): Part[] {
  const parts: Part[] = [];
  const cavities: 1 | 2 = config.glazing.unit === 'triple' ? 2 : 1;
  // The leaf sits FLUSH with the frame face, as a uPVC or composite door
  // does, and stands back from it only by its thickness. It used to stand
  // 35 mm proud, which the flat lighting hid and a raking light turned into a
  // shadow line down the whole closing edge.
  const leafFaces = { external: frame.frameDepth / 2, internal: frame.frameDepth / 2 - frame.leafThickness };
  const z = (leafFaces.external + leafFaces.internal) / 2;
  // Clearance at the sides and head; the foot sits on the threshold.
  const rect: Rect = {
    x: opening.x + LEAF_CLEARANCE,
    y: opening.y,
    width: opening.width - LEAF_CLEARANCE * 2,
    height: opening.height - LEAF_CLEARANCE,
  };
  const style = config.style;

  // The clearance is not empty: it holds a black rubber weatherseal, as every
  // uPVC and composite door does. Leaving the gap open made it a sub-pixel
  // slot whose inside the environment lit unevenly, so the line between frame
  // and leaf rendered dashed. The seal is both correct and a line that reads.
  const sealDepth = 12;
  const sealZ = leafFaces.external - 4 - sealDepth / 2;
  parts.push(
    box('seal-left', 'seal', { x: opening.x, y: opening.y, width: LEAF_CLEARANCE, height: opening.height }, sealZ, sealDepth),
    box('seal-right', 'seal', { x: opening.x + opening.width - LEAF_CLEARANCE, y: opening.y, width: LEAF_CLEARANCE, height: opening.height }, sealZ, sealDepth),
    box('seal-head', 'seal', { x: opening.x, y: opening.y + opening.height - LEAF_CLEARANCE, width: opening.width, height: LEAF_CLEARANCE }, sealZ, sealDepth),
  );

  // A glazed leaf is stiles and rails around a hole, not a slab with a pane
  // laid on it. Glass inside an opaque box is invisible — the same mistake as
  // burying the raised panels, and again only a square-on render shows it.
  switch (style.id) {
    case 'solid-panel':
      parts.push(box('leaf', 'leaf', rect, z, frame.leafThickness));
      parts.push(...buildPanelDetail(style.options.panelDetail, rect, frame, leafFaces));
      break;

    case 'full-glazed': {
      const aperture = style.options.aperture;
      parts.push(...frameMembers('leaf', 'leaf', rect, aperture.inset, z, frame.leafThickness));
      parts.push(...glazedArea('leaf-aperture', inset(rect, aperture.inset), aperture.bars, z, frame, cavities));
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
      parts.push(...glazedArea('leaf-aperture', inset(glazed, aperture.inset), aperture.bars, z, frame, cavities));

      parts.push(box('leaf', 'leaf', solid, z, frame.leafThickness));
      parts.push(...buildPanelDetail(style.options.panelDetail, solid, frame, leafFaces));
      break;
    }
  }

  parts.push(
    ...buildDoorHardware(config, rect, solidRegion(config, frame, rect), leafFaces, panelRails(config, frame, rect)),
  );
  return parts;
}

/**
 * The horizontal rails between raised panels, as y-ranges. A letterplate
 * belongs on one: drawn over the whole leaf, it ended up buried behind the
 * lower panel.
 */
function panelRails(config: DoorConfigState, frame: Sightlines, rect: Rect): Array<{ y: Mm; height: Mm }> {
  if (config.style.id === 'full-glazed') return [];
  const detail = config.style.options.panelDetail;
  if (detail.kind !== 'raised') return [];
  const solidHeight =
    config.style.id === 'half-glazed' ? rect.height * (1 - config.style.options.glazedFraction) : rect.height;
  const margin = frame.doorLeafEdge;
  const field = inset({ ...rect, height: solidHeight }, margin);
  const rows = distribute(field.height, Array.from({ length: detail.panels }, () => 1), margin);
  const rails: Array<{ y: Mm; height: Mm }> = [];
  for (let index = 1; index < rows.length; index += 1) {
    const below = rows[index - 1];
    if (below === undefined) continue;
    rails.push({ y: field.y + below.offset + below.size, height: margin });
  }
  return rails;
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
  /** The leaf's external and internal face planes. */
  faces: { external: Mm; internal: Mm },
): Part[] {
  const margin = frame.doorLeafEdge;
  const field = inset(rect, margin);
  if (field.width <= 0 || field.height <= 0) return [];

  // Moulded door skins carry the detail on BOTH faces. Drawing it on the
  // outside only left the inside of every panelled door blank.
  const onBothFaces = (id: string, area: Rect, depth: Mm, overlap: Mm, shape: PartShape): Part[] => [
    {
      ...box(id, 'panel', area, faces.external + depth / 2 - overlap, depth),
      shape,
      facing: 'external',
    },
    {
      ...box(`${id}-inside`, 'panel', area, faces.internal - depth / 2 + overlap, depth),
      shape,
      facing: 'internal',
    },
  ];

  switch (detail.kind) {
    case 'flush':
      return [];
    case 'raised': {
      // Panels stand PROUD of the leaf face and carry the moulding profile, so
      // their bevels catch light at a different angle from the field.
      const depth = 18;
      const rows = distribute(field.height, Array.from({ length: detail.panels }, () => 1), margin);
      return rows.flatMap((row, index) =>
        onBothFaces(
          `panel-${index}`,
          { x: field.x, y: field.y + row.offset, width: field.width, height: row.size },
          depth,
          4,
          { kind: 'raised', profile: detail.moulding },
        ),
      );
    }
    case 'grooved': {
      // A routed groove is an absence, and a box cannot subtract one. The face
      // is built as slabs with gaps between them; each slab's edges are
      // chamfered, so a groove reads as the V it is cut as rather than as a
      // shadow line that vanishes on a dark finish.
      const depth = 10;
      const horizontal = detail.orientation === 'horizontal';
      const slabs = distribute(
        horizontal ? field.height : field.width,
        Array.from({ length: detail.grooves + 1 }, () => 1),
        detail.grooveWidth,
      );
      return slabs.flatMap((slab, index) =>
        onBothFaces(
          `groove-slab-${index}`,
          horizontal
            ? { x: field.x, y: field.y + slab.offset, width: field.width, height: slab.size }
            : { x: field.x + slab.offset, y: field.y, width: slab.size, height: field.height },
          depth,
          3,
          // Each slab edge is half of the routed V; together they make the
          // groove. Scaled with the slab, the bevels read as boards instead.
          { kind: 'raised', profile: 'chamfer', bevel: detail.grooveWidth / 2 },
        ),
      );
    }
  }
}

/**
 * A handle set on one face of the leaf: rose or backplate, neck, and lever or
 * knob. `out` is +1 on the external face and -1 on the internal one, so the
 * same code builds both sides without anything ending up inside the leaf.
 */
function handleSet(
  prefix: string,
  style: 'lever-rose' | 'lever-backplate' | 'knob',
  centreline: Mm,
  height: Mm,
  stile: Mm,
  towardsHinge: 1 | -1,
  face: Mm,
  out: 1 | -1,
  facing: 'external' | 'internal',
): Part[] {
  const at = (standoff: Mm, depth: Mm): Mm => face + out * (standoff + depth / 2);
  const parts: Part[] = [];

  if (style === 'lever-backplate') {
    const width = Math.min(44, stile * 0.8);
    parts.push({
      ...box(`${prefix}-plate`, 'hardware', { x: centreline - width / 2, y: height - 110, width, height: 220 }, at(0, 8), 8),
      facing,
    });
  } else {
    parts.push({
      ...box(`${prefix}-plate`, 'hardware', { x: centreline - 26, y: height - 26, width: 52, height: 52 }, at(0, 10), 10),
      shape: { kind: 'cylinder', axis: 'z' },
      facing,
    });
  }

  // The neck carries the grip out from the plate.
  parts.push({
    ...box(`${prefix}-neck`, 'hardware', { x: centreline - 8, y: height - 8, width: 16, height: 16 }, at(8, 40), 40),
    shape: { kind: 'cylinder', axis: 'z' },
    facing,
  });

  if (style === 'knob') {
    parts.push({
      ...box(`${prefix}-knob`, 'hardware', { x: centreline - 28, y: height - 28, width: 56, height: 56 }, at(40, 48), 48),
      shape: { kind: 'sphere' },
      facing,
    });
  } else {
    // UK levers point towards the hinge, so a hand pressing down clears the
    // frame on the closing edge.
    const length = 125;
    const x = towardsHinge < 0 ? centreline - length + 9 : centreline - 9;
    parts.push({
      ...box(`${prefix}-lever`, 'hardware', { x, y: height - 9, width: length, height: 18 }, at(40, 18), 18),
      shape: { kind: 'cylinder', axis: 'x' },
      facing,
    });
  }
  return parts;
}

/** Height of a letterplate's centre that suits posting and bending alike. */
const LETTERPLATE_IDEAL = 900;
/** How far a raised panel stands proud of the leaf face. Mirrors buildPanelDetail. */
const PANEL_PROUD = 14;

function buildDoorHardware(
  config: DoorConfigState,
  rect: Rect,
  solid: { area: Rect | null; stile: Mm },
  faces: { external: Mm; internal: Mm },
  rails: Array<{ y: Mm; height: Mm }>,
): Part[] {
  const parts: Part[] = [];

  // The handle sits centred on the STILE, not wherever 90 mm from the edge
  // happens to land — on a glazed leaf that was the middle of the glass.
  const handleHeight = 1050;
  const centreline =
    config.hingeSide === 'left'
      ? rect.x + rect.width - solid.stile / 2
      : rect.x + solid.stile / 2;
  const towardsHinge: 1 | -1 = config.hingeSide === 'left' ? -1 : 1;

  if (config.hardware.handle === 'pull-bar') {
    // A bar on two stand-offs. Pull-bar doors are opened from inside with a
    // lever, so the inside gets a backplate set rather than a second bar.
    const length = rect.height * 0.5;
    const bottom = rect.y + rect.height * 0.25;
    const standoff = 58;
    parts.push({
      ...box('handle', 'hardware', { x: centreline - 16, y: bottom, width: 32, height: length }, faces.external + standoff + 16, 32),
      shape: { kind: 'cylinder', axis: 'y' },
      facing: 'external',
    });
    for (const [id, y] of [
      ['handle-standoff-top', bottom + length - 60],
      ['handle-standoff-bottom', bottom + 40],
    ] as const) {
      parts.push({
        ...box(id, 'hardware', { x: centreline - 10, y: y - 10, width: 20, height: 20 }, faces.external + standoff / 2, standoff),
        shape: { kind: 'cylinder', axis: 'z' },
        facing: 'external',
      });
    }
    parts.push(
      ...handleSet('handle-inside', 'lever-backplate', centreline, handleHeight, solid.stile, towardsHinge, faces.internal, -1, 'internal'),
    );
  } else {
    const style = config.hardware.handle;
    parts.push(...handleSet('handle', style, centreline, handleHeight, solid.stile, towardsHinge, faces.external, 1, 'external'));
    parts.push(
      ...handleSet('handle-inside', style, centreline, handleHeight, solid.stile, towardsHinge, faces.internal, -1, 'internal'),
    );
  }

  // Everything else needs somewhere solid to be fixed to. A fully glazed leaf
  // has nowhere, so nothing is drawn — see the validation question raised with
  // this change.
  const area = solid.area;
  if (area === null || area.height <= 0) return parts;

  const centre = area.x + area.width / 2;
  if (config.hardware.letterplate) {
    const plateHeight = 78;
    // On the rail closest to a comfortable height, if there is one it fits on;
    // otherwise on the face, standing clear of any panel it crosses.
    const rail = rails
      .filter((r) => r.height >= plateHeight)
      .sort((a, b) => Math.abs(a.y + a.height / 2 - LETTERPLATE_IDEAL) - Math.abs(b.y + b.height / 2 - LETTERPLATE_IDEAL))[0];
    const y = rail ? rail.y + (rail.height - plateHeight) / 2 : area.y + area.height * 0.35;
    const standoff = rail || config.style.id === 'full-glazed' ? 0 : PANEL_PROUD;
    // A chamfered plate with a flap standing on it: flat slabs of brass read
    // as a sticker, because a flat metal face only reflects one thing.
    const plateFront = faces.external + standoff + 10;
    parts.push({
      ...box('letterplate', 'hardware', { x: centre - 150, y, width: 300, height: plateHeight }, plateFront - 5, 10),
      shape: { kind: 'raised', profile: 'chamfer', bevel: 5 },
      facing: 'external',
    });
    parts.push({
      ...box('letterplate-flap', 'hardware', { x: centre - 124, y: y + 17, width: 248, height: plateHeight - 34 }, plateFront + 2, 4),
      shape: { kind: 'raised', profile: 'square' },
      facing: 'external',
    });
    // Internal tidy: a larger, flatter cover over the aperture.
    parts.push({
      ...box('letterplate-inside', 'hardware', { x: centre - 165, y: y - 11, width: 330, height: 100 }, faces.internal - 3, 6),
      facing: 'internal',
    });
  }
  if (config.hardware.knocker !== null) {
    // A lathed ring hanging from a boss — the parametric forms promised for
    // the knocker, rather than a square slab.
    const ringTop = area.y + area.height * 0.78 + 110;
    parts.push({
      ...box('knocker', 'hardware', { x: centre - 55, y: ringTop - 110, width: 110, height: 110 }, faces.external + 14, 16),
      shape: { kind: 'torus' },
      facing: 'external',
    });
    parts.push({
      ...box('knocker-boss', 'hardware', { x: centre - 17, y: ringTop - 17, width: 34, height: 34 }, faces.external + 11, 22),
      shape: { kind: 'cylinder', axis: 'z' },
      facing: 'external',
    });
  }
  if (config.hardware.spyhole) {
    parts.push({
      ...box('spyhole', 'hardware', { x: centre - 14, y: area.y + area.height * 0.93, width: 28, height: 28 }, faces.external + 4, 8),
      shape: { kind: 'cylinder', axis: 'z' },
      facing: 'external',
    });
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
  const cavities: 1 | 2 = config.glazing.unit === 'triple' ? 2 : 1;
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
          parts.push(...glazedArea(`cell-${index}`, cellRect, cell.bars, z, frame, cavities));
        } else {
          // The sash stands a clearance in from the cell all round, and the
          // clearance holds its weatherseal — the same dark line that tells a
          // leaf from its frame. Flush to the cell, the sash's edge rendered
          // as broken fragments of line, or not at all. The glass is not
          // moved: the sash member is narrower by the clearance instead.
          const sashFront = z + 12 + frame.sashDepth / 2;
          parts.push(...frameMembers(`sash-${index}`, 'sash', inset(cellRect, SASH_CLEARANCE), frame.sash - SASH_CLEARANCE, z + 12, frame.sashDepth));
          parts.push(...frameMembers(`sash-${index}-seal`, 'seal', cellRect, SASH_CLEARANCE, sashFront - 3 - 6, 12));
          parts.push(...glazedArea(`cell-${index}`, inset(cellRect, frame.sash), cell.bars, z + 12, frame, cavities));
          // Handles are fitted on the INSIDE of the sash; from outside they are
          // seen through the glass, if at all.
          parts.push(
            ...buildWindowHandle(config, cell.opening, inset(cellRect, frame.sash), index, z + 12 - frame.sashDepth / 2),
          );
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
      parts.push(...glazedArea('sash-upper', inset(upper, frame.sash), options.upperBars, z + 6, frame, cavities));
      parts.push(...frameMembers('sash-lower', 'sash', lower, frame.sash, z + 24, frame.sashDepth));
      parts.push(...glazedArea('sash-lower', inset(lower, frame.sash), options.lowerBars, z + 24, frame, cavities));

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
      parts.push(...glazedArea('fixed', opening, config.style.options.bars, z, frame, cavities));
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
      const x = opening.x + slot.offset + slot.size / 2 - width / 2;
      const front = z + frame.frameDepth / 2;
      // A moulded housing in the frame colour, as fitted, with a dark slot
      // along it. Drawn as one black bar in the hardware finish, it read as a
      // hole in the frame.
      parts.push({
        ...box(`vent-${index}`, 'vent', { x, y: headCentre - ventHeight / 2, width, height: ventHeight }, front + 5, 10),
        shape: { kind: 'raised', profile: 'chamfer', bevel: 4 },
        facing: 'external',
      });
      parts.push(
        box(`ventslot-${index}`, 'seal', { x: x + 14, y: headCentre - 2, width: width - 28, height: 4 }, front + 9.5, 2),
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
    {
      ...box(
        `handle-${index}-plate`,
        'hardware',
        fit({ x: plateX, y: y - plate / 2, width: plate, height: plate }),
        // `z` is the sash's internal face; the plate sits on it, facing in.
        z - 5,
        10,
      ),
      facing: 'internal',
    },
  ];
  if (config.hardware.handle !== 'knob') {
    parts.push({
      ...box(`handle-${index}-lever`, 'hardware', fit({ x: leverX, y: y - 9, width: lever, height: 18 }), z - 28, 18),
      shape: { kind: 'cylinder', axis: 'x' },
      facing: 'internal',
    });
  } else {
    parts.push({
      ...box(`handle-${index}-knob`, 'hardware', fit({ x: plateX + plate / 2 - 20, y: y - 20, width: 40, height: 40 }), z - 26, 36),
      shape: { kind: 'sphere' },
      facing: 'internal',
    });
  }
  return parts;
}
