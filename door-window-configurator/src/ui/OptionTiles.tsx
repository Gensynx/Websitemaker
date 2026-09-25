/**
 * A choice among a few visual options: style, panelling, handle, finish.
 *
 * A native radio group like every other choice in the panel (Step 4.4):
 * one tab stop, arrow keys, and a screen reader hears the label and detail.
 * The picture on each tile is decoration and hidden from assistive
 * technology; nothing depends on seeing it.
 */

import { useId } from 'react';
import type { ReactNode } from 'react';

export interface Tile<T extends string> {
  value: T;
  label: string;
  detail?: string;
  picture?: ReactNode;
}

export function OptionTiles<T extends string>({
  legend,
  value,
  tiles,
  onChange,
  columns = 3,
  hint,
}: {
  legend: string;
  value: T | null;
  tiles: ReadonlyArray<Tile<T>>;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
  hint?: string;
}): JSX.Element {
  const name = useId();
  return (
    <fieldset className="tiles">
      <legend className="tiles__legend">{legend}</legend>
      {hint !== undefined && <p className="tiles__hint">{hint}</p>}
      <div className="tiles__grid" data-columns={columns}>
        {tiles.map((tile) => (
          <label key={tile.value} className="tile">
            <input
              type="radio"
              name={name}
              value={tile.value}
              checked={value === tile.value}
              onChange={() => onChange(tile.value)}
            />
            {tile.picture !== undefined && (
              <span className="tile__picture" aria-hidden="true">
                {tile.picture}
              </span>
            )}
            <span className="tile__label">{tile.label}</span>
            {tile.detail !== undefined && <span className="tile__detail">{tile.detail}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A labelled on/off choice, as a real checkbox. */
export function Toggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  const id = useId();
  return (
    <div className="toggle">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <label htmlFor={id}>
        <span className="toggle__label">{label}</span>
        {detail !== undefined && <span className="toggle__detail">{detail}</span>}
      </label>
    </div>
  );
}
