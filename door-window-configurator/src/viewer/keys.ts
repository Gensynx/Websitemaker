/**
 * What the 3D geometry and the materials each depend on, as cache keys.
 *
 * Pure and free of three.js, so the 2D thumbnails can share them without
 * pulling the 3D bundle onto the first-paint path.
 *
 * Geometry depends on everything except appearance: a colour, a finish or a
 * hardware finish changes materials only, so dragging the explore colour
 * wheel re-tints the product without rebuilding and re-uploading every
 * part's geometry on each frame (performance budget: throttle continuous input).
 */

import type { ConfigState } from '../config/types';

export function shapeKey(config: ConfigState): string {
  const { colour: _colour, finish: _finish, ...shape } = config;
  return JSON.stringify({ ...shape, hardware: { ...shape.hardware, finish: null } });
}

export function appearanceKey(config: ConfigState): string {
  return JSON.stringify([config.colour, config.finish, config.glazing, config.hardware.finish]);
}
