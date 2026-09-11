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

/* ------------------------------------------------------------------ *
 * Normalised proportions
 *
 * A bare `number` between 0 and 1 says nothing about what it is a proportion
 * OF, or which end it is measured FROM. Both have been wrong in configurators
 * before. The aliases below carry the basis in the name, the same way `Mm`
 * carries the unit, and every consumer reads the basis at the use site.
 * ------------------------------------------------------------------ */

/** A proportion in the closed interval 0..1. */
export type Fraction = number;

/**
 * Proportion of the door LEAF height that is glazed, measured DOWN FROM THE
 * TOP of the leaf. 0.45 on a 1981 mm leaf glazes the upper 891 mm.
 */
export type GlazedFractionOfLeafHeightFromTop = Fraction;

/**
 * Height of the meeting rail as a proportion of the sash frame height,
 * measured UP FROM THE CILL. 0.5 puts the rail at mid-height; 0.6 gives the
 * taller lower sash of a traditional box sash window.
 */
export type MeetingRailFractionFromCill = Fraction;

/**
 * Share of the overall structural width taken by one grid column, relative to
 * its siblings rather than absolute. Normalised at render time, so the grid
 * stays proportional as the overall dimensions change.
 */
export type ColumnWeight = number;

/** As ColumnWeight, for rows, measured top to bottom. */
export type RowWeight = number;

export function clampFraction(value: Fraction, min: Fraction, max: Fraction): Fraction {
  return Math.min(max, Math.max(min, value));
}
