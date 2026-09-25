/**
 * Glazing bars for one glazed area (Step 7.2): the bar type, and how many
 * panes it divides the glass into each way. Shared by every window light and
 * every piece of door glass.
 *
 * The three types are genuinely different products, not styles: Georgian bars
 * sit inside the sealed unit, applied astragals are bonded to both faces of
 * one unit, and true bars divide the glass into separate units.
 */

import type { BarLayout, BarStyle } from '../config/types';
import { barsWith } from '../config/windowEdits';
import { MAX_BAR_DIVISIONS } from '../config/limits';
import { Segmented } from './Segmented';
import { CountField } from './CountField';

export function BarEditor({
  legend,
  bars,
  onChange,
}: {
  legend: string;
  bars: BarLayout;
  onChange: (bars: BarLayout) => void;
}): JSX.Element {
  return (
    <div className="bars">
      <Segmented<BarStyle>
        legend={legend}
        value={bars.style}
        options={[
          { value: 'none', label: 'None' },
          { value: 'georgian-internal', label: 'Georgian' },
          { value: 'applied-astragal', label: 'Astragal' },
          { value: 'true-bar', label: 'True bars' },
        ]}
        onChange={(style) => onChange(barsWith(bars, { style }))}
      />
      {bars.style !== 'none' && (
        <>
          <p className="section__hint">
            {bars.style === 'georgian-internal'
              ? 'Bars inside the sealed unit: flat glass on both faces.'
              : bars.style === 'applied-astragal'
                ? 'Moulded bars bonded to both faces of one sealed unit.'
                : 'Separate sealed units between structural bars.'}
          </p>
          <div className="fields fields--pair">
            <CountField
              label="Panes across"
              value={bars.columns}
              min={1}
              max={MAX_BAR_DIVISIONS}
              onCommit={(columns) => onChange(barsWith(bars, { columns }))}
            />
            <CountField
              label="Panes high"
              value={bars.rows}
              min={1}
              max={MAX_BAR_DIVISIONS}
              onCommit={(rows) => onChange(barsWith(bars, { rows }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
