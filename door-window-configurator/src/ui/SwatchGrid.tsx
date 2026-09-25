/**
 * The RAL swatch grid (Step 5.1): the primary way to choose a colour, and
 * only ever the shades actually offered in the frame material.
 *
 * A native radio group, like every choice in the panel: one tab stop, arrow
 * keys to move, Space to choose, and a screen reader hears "Anthracite Grey,
 * RAL 7016, radio button, 4 of 11". The swatch chip is decoration — the name
 * and code carry the meaning, so nothing depends on seeing the colour.
 *
 * When the side is showing an explore colour, no swatch is checked: the grid
 * says truthfully that nothing offered is selected.
 */

import { useId } from 'react';
import type { RalCode } from '../config/ral';
import { ralEntry } from '../config/ral';

export function SwatchGrid({
  legend,
  codes,
  value,
  onChange,
}: {
  legend: string;
  codes: readonly RalCode[];
  /** The chosen code, or null when the side is an explore colour. */
  value: RalCode | null;
  onChange: (code: RalCode) => void;
}): JSX.Element {
  const name = useId();
  return (
    <fieldset className="swatches">
      <legend className="swatches__legend">{legend}</legend>
      <div className="swatches__grid">
        {codes.map((code) => {
          const entry = ralEntry(code);
          return (
            <label key={code} className="swatch">
              <input
                type="radio"
                name={name}
                value={code}
                checked={value === code}
                onChange={() => onChange(code)}
              />
              <span className="swatch__chip" style={{ background: entry.hex }} aria-hidden="true" />
              <span className="swatch__name">{entry.name}</span>
              <span className="swatch__code">{entry.code.replace(/^RAL/, 'RAL ')}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
