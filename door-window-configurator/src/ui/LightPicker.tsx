/**
 * The window drawn as its lights, to choose which one to set (Steps 7.2, 7.3).
 *
 * Proportions follow the real column and row weights, and each light shows
 * how it opens in the architectural elevation convention: two lines meeting
 * at the hinge side (a side-hung light's lines meet at its hinged stile, a
 * top-hung vent's at its head). A fixed light has none.
 *
 * A radio group — one tab stop, arrow keys between lights — and each light
 * is named for a screen reader by position and opening: "Light 3 of 6, top
 * row, right: side-hung, hinged right". The drawing itself is decoration.
 */

import { useId } from 'react';
import type { SashGrid, SashOpening } from '../config/types';
import { lightPosition } from '../config/describe';

const OPENING_WORDS: Record<SashOpening, string> = {
  fixed: 'fixed',
  'side-hung-left': 'hinged left',
  'side-hung-right': 'hinged right',
  'top-hung': 'top-hung',
  'bottom-hung': 'bottom-hung',
};

/** The opening convention inside a unit square. */
export function OpeningLines({ opening }: { opening: SashOpening }): JSX.Element | null {
  const paths: Record<SashOpening, string | null> = {
    fixed: null,
    'side-hung-left': 'M100 0 L0 50 L100 100',
    'side-hung-right': 'M0 0 L100 50 L0 100',
    'top-hung': 'M0 100 L50 0 L100 100',
    'bottom-hung': 'M0 0 L50 100 L100 0',
  };
  const d = paths[opening];
  if (d === null) return null;
  return (
    <svg className="light__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 3" />
    </svg>
  );
}

export function LightPicker({
  grid,
  selected,
  onSelect,
  describeOpening = (opening) => OPENING_WORDS[opening],
  aspect,
}: {
  grid: SashGrid;
  /** Width over height of the window, so the drawing has its real shape. */
  aspect: number;
  selected: number;
  onSelect: (index: number) => void;
  describeOpening?: (opening: SashOpening) => string;
}): JSX.Element {
  const name = useId();
  const columns = grid.columnWeights.length;
  const rows = grid.rowWeights.length;
  return (
    <fieldset className="lights">
      <legend className="tiles__legend">Choose a light to set</legend>
      <div
        className="lights__frame"
        style={{
          ['--aspect' as string]: String(aspect),
          gridTemplateColumns: grid.columnWeights.map((w) => `${w}fr`).join(' '),
          gridTemplateRows: grid.rowWeights.map((w) => `${w}fr`).join(' '),
        }}
      >
        {grid.cells.map((cell, index) => {
          const where = lightPosition(index, columns, rows);
          return (
            <label key={index} className="light" data-opening={cell.opening}>
              <input
                type="radio"
                name={name}
                checked={selected === index}
                onChange={() => onSelect(index)}
                aria-label={`Light ${index + 1} of ${grid.cells.length}${where ? `, ${where}` : ''}: ${describeOpening(cell.opening)}${cell.bars.style !== 'none' ? `, ${cell.bars.columns} × ${cell.bars.rows} panes` : ''}`}
              />
              <OpeningLines opening={cell.opening} />
              <span className="light__number" aria-hidden="true">
                {index + 1}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
