/**
 * The edits the door options make (Step 6), as pure functions.
 *
 * Two rules run through them:
 *
 * 1. Changing one thing never quietly changes another. Switching style keeps
 *    the panel detailing where the new style has panels; adding a side light
 *    keeps the one already there; hardware toggles touch only themselves.
 *
 * 2. Overall size is the opening in the wall (types.ts) and is never altered
 *    as a side effect. Adding side lights narrows the leaf, adding a top light
 *    shortens it — and where the customer would rather keep the leaf, the
 *    panel offers `widthToKeepLeaf` / `heightToKeepLeaf` as an explicit,
 *    labelled action. Step 3 forbids silently resizing what someone typed.
 */

import type {
  BarLayout,
  DoorConfigState,
  DoorHandleStyle,
  DoorStyleId,
  HardwareFinish,
  HingeSideViewedFromOutside,
  OpeningDirectionViewedFromOutside,
  PanelDetail,
  SideLight,
  ThresholdType,
  TopLight,
} from './types';
import { NO_BARS } from './types';
import { DEFAULT_DOOR_STYLE_OPTIONS } from './defaults';
import { doorLayout } from './layout';
import type { Mm } from './units';

/** Width a newly added side light starts at. PLACEHOLDER, like every size default. */
export const NEW_SIDE_LIGHT_WIDTH: Mm = 350;
/** Height a newly added top light starts at. PLACEHOLDER. */
export const NEW_TOP_LIGHT_HEIGHT: Mm = 350;

export type SideLights = 'none' | 'left' | 'right' | 'both';

/* ------------------------------------------------------------------ *
 * Style and panels
 * ------------------------------------------------------------------ */

/** The panel detailing a style carries, or null where the leaf is all glass. */
export function panelDetailOf(config: DoorConfigState): PanelDetail | null {
  return config.style.id === 'full-glazed' ? null : config.style.options.panelDetail;
}

export function withDoorStyle(config: DoorConfigState, id: DoorStyleId): DoorConfigState {
  if (config.style.id === id) return config;
  // Panels carry over wherever the new style has a solid area to put them on.
  const panelDetail = panelDetailOf(config) ?? DEFAULT_DOOR_STYLE_OPTIONS['solid-panel'].panelDetail;
  switch (id) {
    case 'solid-panel':
      return { ...config, style: { id, options: { panelDetail } } };
    case 'half-glazed':
      return { ...config, style: { id, options: { ...DEFAULT_DOOR_STYLE_OPTIONS['half-glazed'], panelDetail } } };
    case 'full-glazed':
      return { ...config, style: { id, options: { ...DEFAULT_DOOR_STYLE_OPTIONS['full-glazed'] } } };
  }
}

export function withPanelDetail(config: DoorConfigState, panelDetail: PanelDetail): DoorConfigState {
  const style = config.style;
  if (style.id === 'full-glazed') return config;
  return { ...config, style: { ...style, options: { ...style.options, panelDetail } } } as DoorConfigState;
}

/** The panel choices offered, in order, carrying over the moulding and groove settings in use. */
export function panelChoices(current: PanelDetail | null): PanelDetail[] {
  const moulding = current?.kind === 'raised' ? current.moulding : 'ovolo';
  const grooved: PanelDetail =
    current?.kind === 'grooved' ? current : { kind: 'grooved', grooves: 4, grooveWidth: 8, orientation: 'horizontal' };
  return [
    { kind: 'flush' },
    { kind: 'raised', panels: 1, moulding },
    { kind: 'raised', panels: 2, moulding },
    { kind: 'raised', panels: 3, moulding },
    { kind: 'raised', panels: 4, moulding },
    grooved,
  ];
}

/** A stable id for a panel choice, for radio values and keys. */
export function panelChoiceId(detail: PanelDetail): string {
  return detail.kind === 'raised' ? `raised-${detail.panels}` : detail.kind;
}

/* ------------------------------------------------------------------ *
 * Side lights and top light
 * ------------------------------------------------------------------ */

export function sideLightsOf(config: DoorConfigState): SideLights {
  const { leftSideLight: left, rightSideLight: right } = config.surround;
  if (left && right) return 'both';
  if (left) return 'left';
  if (right) return 'right';
  return 'none';
}

function newSideLight(width: Mm): SideLight {
  return { width, bars: { ...NO_BARS }, safety: null };
}

/** The width side lights share: the first one present, or the default for a new one. */
export function sideLightWidthOf(config: DoorConfigState): Mm {
  return config.surround.leftSideLight?.width ?? config.surround.rightSideLight?.width ?? NEW_SIDE_LIGHT_WIDTH;
}

export function withSideLights(config: DoorConfigState, which: SideLights): DoorConfigState {
  const width = sideLightWidthOf(config);
  const keep = (existing: SideLight | null, wanted: boolean): SideLight | null =>
    wanted ? existing ?? newSideLight(width) : null;
  return {
    ...config,
    surround: {
      ...config.surround,
      leftSideLight: keep(config.surround.leftSideLight, which === 'left' || which === 'both'),
      rightSideLight: keep(config.surround.rightSideLight, which === 'right' || which === 'both'),
    },
  };
}

/** Both side lights take the same width: a door set is symmetrical unless ordered otherwise. */
export function withSideLightWidth(config: DoorConfigState, width: Mm): DoorConfigState {
  const resize = (light: SideLight | null): SideLight | null => (light ? { ...light, width } : null);
  return {
    ...config,
    surround: {
      ...config.surround,
      leftSideLight: resize(config.surround.leftSideLight),
      rightSideLight: resize(config.surround.rightSideLight),
    },
  };
}

export function withTopLight(config: DoorConfigState, on: boolean): DoorConfigState {
  const existing = config.surround.topLight;
  const topLight: TopLight | null = on
    ? existing ?? { height: NEW_TOP_LIGHT_HEIGHT, shape: 'rectangular', bars: { ...NO_BARS }, safety: null }
    : null;
  return { ...config, surround: { ...config.surround, topLight } };
}

export function withTopLightHeight(config: DoorConfigState, height: Mm): DoorConfigState {
  const topLight = config.surround.topLight;
  return topLight ? { ...config, surround: { ...config.surround, topLight: { ...topLight, height } } } : config;
}

/**
 * The overall width at which the leaf would be `leafWidth`. The leaf is the
 * opening less the side lights and their mullions, so it moves one for one
 * with the overall width.
 */
export function widthToKeepLeaf(config: DoorConfigState, leafWidth: Mm): Mm {
  return config.dimensions.width + (leafWidth - doorLayout(config).leaf.width);
}

/** The overall height at which the leaf would be `leafHeight`; the same, vertically. */
export function heightToKeepLeaf(config: DoorConfigState, leafHeight: Mm): Mm {
  return config.dimensions.height + (leafHeight - doorLayout(config).leaf.height);
}

/** The leaf of the same door with no side or top lights: what "keep the door" means. */
export function plainLeaf(config: DoorConfigState): { width: Mm; height: Mm } {
  const leaf = doorLayout({ ...config, surround: { leftSideLight: null, rightSideLight: null, topLight: null } }).leaf;
  return { width: leaf.width, height: leaf.height };
}

/* ------------------------------------------------------------------ *
 * Handing, threshold, hardware
 * ------------------------------------------------------------------ */

export function withHingeSide(config: DoorConfigState, hingeSide: HingeSideViewedFromOutside): DoorConfigState {
  return { ...config, hingeSide };
}

export function withOpeningDirection(
  config: DoorConfigState,
  openingDirection: OpeningDirectionViewedFromOutside,
): DoorConfigState {
  return { ...config, openingDirection };
}

export function withThreshold(config: DoorConfigState, threshold: ThresholdType): DoorConfigState {
  return { ...config, threshold };
}

export function withHandle(config: DoorConfigState, handle: DoorHandleStyle): DoorConfigState {
  return { ...config, hardware: { ...config.hardware, handle } };
}

export function withHardwareFinish(config: DoorConfigState, finish: HardwareFinish): DoorConfigState {
  return { ...config, hardware: { ...config.hardware, finish } };
}

export type Furniture = 'letterplate' | 'knocker' | 'spyhole';

export function hasFurniture(config: DoorConfigState, item: Furniture): boolean {
  if (item === 'knocker') return config.hardware.knocker !== null;
  return config.hardware[item];
}

/**
 * Each piece independently (Step 6.5). A knocker switched on is a ring, the
 * only form the renderer draws; one that arrived in a link keeps its style
 * for as long as it stays switched on.
 */
export function withFurniture(config: DoorConfigState, item: Furniture, on: boolean): DoorConfigState {
  if (item === 'knocker') {
    return { ...config, hardware: { ...config.hardware, knocker: on ? config.hardware.knocker ?? 'ring' : null } };
  }
  return { ...config, hardware: { ...config.hardware, [item]: on } };
}

/* ------------------------------------------------------------------ *
 * Glazing bars in door glass (the bar editor of Step 7.2, reused)
 * ------------------------------------------------------------------ */

export type DoorGlass = 'leaf' | 'left' | 'right' | 'top';

/** The glazed areas this door has, in reading order, with their bars. */
export function doorGlassAreas(config: DoorConfigState): Array<{ area: DoorGlass; label: string; bars: BarLayout }> {
  const areas: Array<{ area: DoorGlass; label: string; bars: BarLayout }> = [];
  if (config.surround.topLight) areas.push({ area: 'top', label: 'Top light', bars: config.surround.topLight.bars });
  if (config.surround.leftSideLight) areas.push({ area: 'left', label: 'Left side light', bars: config.surround.leftSideLight.bars });
  if (config.style.id !== 'solid-panel') areas.push({ area: 'leaf', label: 'Door glass', bars: config.style.options.aperture.bars });
  if (config.surround.rightSideLight) areas.push({ area: 'right', label: 'Right side light', bars: config.surround.rightSideLight.bars });
  return areas;
}

export function withDoorGlassBars(config: DoorConfigState, area: DoorGlass, bars: BarLayout): DoorConfigState {
  const { surround } = config;
  switch (area) {
    case 'top':
      return surround.topLight ? { ...config, surround: { ...surround, topLight: { ...surround.topLight, bars } } } : config;
    case 'left':
      return surround.leftSideLight
        ? { ...config, surround: { ...surround, leftSideLight: { ...surround.leftSideLight, bars } } }
        : config;
    case 'right':
      return surround.rightSideLight
        ? { ...config, surround: { ...surround, rightSideLight: { ...surround.rightSideLight, bars } } }
        : config;
    case 'leaf': {
      const style = config.style;
      if (style.id === 'solid-panel') return config;
      return { ...config, style: { ...style, options: { ...style.options, aperture: { ...style.options.aperture, bars } } } } as DoorConfigState;
    }
  }
}
