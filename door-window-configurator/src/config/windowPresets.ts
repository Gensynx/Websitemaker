/**
 * Named window configurations.
 *
 * The grid model is four independent axes — style, grid size, weights, and
 * per-cell opening and bars — which is right architecturally and unusable
 * commercially. Nobody asks for "columnWeights [1,2,1] with cells 0 and 2
 * side-hung"; they ask for a three-pane casement with a fixed centre.
 *
 * This is data on top of the existing model, not a change to it. A preset
 * EXPANDS to a full WindowStyle and is then discarded: ConfigState never
 * records which preset was chosen, and a shared link carries the expanded
 * grid. So renaming or withdrawing a preset cannot alter a configuration
 * somebody already has, and the grid editor underneath stays authoritative.
 *
 * !! PLACEHOLDER SELECTION !!
 * Twelve common UK specifications, to be cut or extended to what is actually
 * sold. Suggested sizes are typical, not supplied.
 */

import type { BarLayout, SashCell, SashGrid, SashOpening, WindowStyle } from './types';
import { NO_BARS } from './types';
import type { Mm } from './units';

export interface WindowPreset {
  id: string;
  label: string;
  /** One line, shown beneath the label in the picker. */
  description: string;
  suggestedSize: { width: Mm; height: Mm };
  /** Expands to a complete style. Called once, on selection. */
  expand: () => WindowStyle;
}

function cell(opening: SashOpening, bars: BarLayout = { ...NO_BARS }): SashCell {
  return { opening, bars, safety: null };
}

function grid(columnWeights: number[], rowWeights: number[], cells: SashCell[]): SashGrid {
  if (cells.length !== columnWeights.length * rowWeights.length) {
    throw new Error(`Preset grid is ${columnWeights.length}×${rowWeights.length} but lists ${cells.length} lights`);
  }
  return { columnWeights, rowWeights, cells };
}

const GEORGIAN: BarLayout = { style: 'applied-astragal', columns: 3, rows: 2, barWidth: 22 };

export const WINDOW_PRESETS: readonly WindowPreset[] = [
  {
    id: 'fixed-light',
    label: 'Fixed light',
    description: 'A single pane that does not open.',
    suggestedSize: { width: 900, height: 1050 },
    expand: () => ({ id: 'fixed', options: { bars: { ...NO_BARS } } }),
  },
  {
    id: 'casement-single',
    label: 'Single casement',
    description: 'One side-hung opener, hinged on the left.',
    suggestedSize: { width: 600, height: 1050 },
    expand: () => ({ id: 'casement', options: { grid: grid([1], [1], [cell('side-hung-left')]) } }),
  },
  {
    id: 'casement-pair',
    label: 'Casement pair',
    description: 'Two equal openers, hinged outwards from the centre.',
    suggestedSize: { width: 1200, height: 1050 },
    expand: () => ({
      id: 'casement',
      options: { grid: grid([1, 1], [1], [cell('side-hung-left'), cell('side-hung-right')]) },
    }),
  },
  {
    id: 'casement-one-opener',
    label: 'Casement, one opener',
    description: 'Two equal lights, the left one opening and the right fixed.',
    suggestedSize: { width: 1200, height: 1050 },
    expand: () => ({
      id: 'casement',
      options: { grid: grid([1, 1], [1], [cell('side-hung-left'), cell('fixed')]) },
    }),
  },
  {
    id: 'casement-top-opener',
    label: 'Top opener over fixed',
    description: 'A top-hung vent above a full-width fixed light.',
    suggestedSize: { width: 900, height: 1200 },
    expand: () => ({
      id: 'casement',
      options: { grid: grid([1], [1, 3], [cell('top-hung'), cell('fixed')]) },
    }),
  },
  {
    id: 'casement-three-centre-fixed',
    label: 'Three-pane, fixed centre',
    description: 'A wide fixed centre light with a narrower opener each side.',
    suggestedSize: { width: 1800, height: 1200 },
    expand: () => ({
      id: 'casement',
      options: {
        grid: grid([1, 2, 1], [1], [cell('side-hung-left'), cell('fixed'), cell('side-hung-right')]),
      },
    }),
  },
  {
    id: 'casement-three-top-openers',
    label: 'Three-pane with top openers',
    description: 'Three fixed lights beneath a row of top-hung vents.',
    suggestedSize: { width: 1800, height: 1400 },
    expand: () => ({
      id: 'casement',
      options: {
        grid: grid(
          [1, 2, 1],
          [1, 3],
          [
            cell('top-hung'),
            cell('top-hung'),
            cell('top-hung'),
            cell('fixed'),
            cell('fixed'),
            cell('fixed'),
          ],
        ),
      },
    }),
  },
  {
    id: 'casement-four-light',
    label: 'Four-light casement',
    description: 'Two openers below, two top-hung vents above.',
    suggestedSize: { width: 1200, height: 1400 },
    expand: () => ({
      id: 'casement',
      options: {
        grid: grid(
          [1, 1],
          [1, 3],
          [cell('top-hung'), cell('top-hung'), cell('side-hung-left'), cell('side-hung-right')],
        ),
      },
    }),
  },
  {
    id: 'cottage-casement',
    label: 'Cottage casement',
    description: 'Three lights with Georgian bars, the outer two opening.',
    suggestedSize: { width: 1500, height: 1050 },
    expand: () => ({
      id: 'casement',
      options: {
        grid: grid(
          [1, 1, 1],
          [1],
          [
            cell('side-hung-left', { ...GEORGIAN, columns: 2, rows: 3 }),
            cell('fixed', { ...GEORGIAN, columns: 2, rows: 3 }),
            cell('side-hung-right', { ...GEORGIAN, columns: 2, rows: 3 }),
          ],
        ),
      },
    }),
  },
  {
    id: 'tilt-turn-single',
    label: 'Tilt and turn',
    description: 'One light that tilts at the head or turns on the side.',
    suggestedSize: { width: 900, height: 1300 },
    expand: () => ({
      id: 'tilt-and-turn',
      options: { grid: grid([1], [1], [cell('side-hung-left')]) },
    }),
  },
  {
    id: 'sash-plain',
    label: 'Sash, one over one',
    description: 'A plain double-hung sash window with horns.',
    suggestedSize: { width: 860, height: 1500 },
    expand: () => ({
      id: 'sash',
      options: {
        operation: 'double-hung',
        meetingRailPosition: 0.5,
        horns: true,
        upperBars: { ...NO_BARS },
        lowerBars: { ...NO_BARS },
      },
    }),
  },
  {
    id: 'sash-georgian',
    label: 'Sash, six over six',
    description: 'A double-hung sash with Georgian astragal bars to both sashes.',
    suggestedSize: { width: 860, height: 1600 },
    expand: () => ({
      id: 'sash',
      options: {
        operation: 'double-hung',
        meetingRailPosition: 0.5,
        horns: true,
        upperBars: { ...GEORGIAN },
        lowerBars: { ...GEORGIAN },
      },
    }),
  },
];

export function windowPreset(id: string): WindowPreset | undefined {
  return WINDOW_PRESETS.find((preset) => preset.id === id);
}
