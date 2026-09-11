/**
 * Units.
 *
 * Every dimension in ConfigState is held as a floating-point number of
 * millimetres. Rounding to whole millimetres happens exactly once, at the
 * display boundary, via `formatMm` / `roundMmHalfUp`. Nothing else in the
 * codebase may round a dimension.
 *
 * The 3D scene works in metres (the R3F/three.js convention, which keeps
 * shadow-camera and light falloff defaults sane). `toSceneUnits` is the single
 * conversion point between the two systems.
 */

/** A length in millimetres, held as a float. */
export type Mm = number;

/** Scene units are metres. */
export const MM_PER_SCENE_UNIT = 1000;

export function toSceneUnits(value: Mm): number {
  return value / MM_PER_SCENE_UNIT;
}

export function fromSceneUnits(value: number): Mm {
  return value * MM_PER_SCENE_UNIT;
}

/**
 * Round half-up (ties away from zero) to whole millimetres.
 *
 * All configurator dimensions are positive, so "half-up" and "half away from
 * zero" coincide here; the sign handling exists so the function is not a trap
 * if it is ever reused for an offset.
 *
 * Note: this rounds the binary double as it actually is. A value that is
 * 2.4999999999999996 because of accumulated arithmetic rounds to 2, not 3. The
 * mitigation is the single-rounding-point rule above, not an epsilon fudge.
 */
export function roundMmHalfUp(value: Mm): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

/** Display string for a dimension, e.g. "1981 mm". The only rounding point. */
export function formatMm(value: Mm): string {
  const rounded = roundMmHalfUp(value);
  return Number.isNaN(rounded) ? '—' : `${rounded} mm`;
}

/** Display string for a width x height pair, in the stated W x H order. */
export function formatSize(width: Mm, height: Mm): string {
  return `${roundMmHalfUp(width)} × ${roundMmHalfUp(height)} mm (W × H)`;
}
