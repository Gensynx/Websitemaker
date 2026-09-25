/**
 * The Colour section (Step 5).
 *
 *   5.1  A swatch grid of the RAL shades offered in the frame material.
 *   5.2  "Explore any colour", clearly marked as not available to order.
 *        What it sets is an ExploreColour, which validation reports as
 *        non-orderable and mintQuotable refuses — so it cannot reach a quote
 *        however the page is used (colourEdits.test.ts).
 *   5.3  Finish, chosen separately from colour.
 *   5.4  The indicative-only note stays on the panel at all times (App.tsx).
 *
 * Outside and inside are specified separately, as uPVC and composite frames
 * are ordered; by default the inside simply follows the outside.
 */

import { useId, useState } from 'react';
import { useConfigurator } from '../state/store';
import { availableColours, availableFinishes, FINISH_LABEL } from '../config/material';
import type { Finish } from '../config/material';
import { colourToHexString } from './colourHex';
import {
  colourOn,
  insideMatches,
  withColour,
  withExternalFinish,
  withInsideMatching,
  withInternalFinish,
} from '../config/colourEdits';
import type { Side } from '../config/colourEdits';
import type { RalCode } from '../config/ral';
import { resolveInternalFinish } from '../config/types';
import { Segmented } from './Segmented';
import { SwatchGrid } from './SwatchGrid';
import { ExplorePicker } from './ExplorePicker';

export function ColourPanel(): JSX.Element {
  const config = useConfigurator((state) => state.config);
  const edit = useConfigurator((state) => state.edit);
  const [exploring, setExploring] = useState(false);
  const [target, setTarget] = useState<Side>('external');
  // Bumped only when an OFFERED colour is chosen, so the explore picker
  // restarts from it. Keying the picker on the colour itself remounted it on
  // the first explore change — dropping keyboard focus off the slider being
  // used, and the pointer off a wheel mid-drag.
  const [pickerRevision, setPickerRevision] = useState(0);
  const pickOffered = (which: Side, code: RalCode) => {
    edit((c) => withColour(c, which, { mode: 'ral', code }));
    setPickerRevision((revision) => revision + 1);
  };
  const exploreId = useId();

  const codes = availableColours(config.material);
  const finishes = availableFinishes(config.material).map((finish) => ({ value: finish, label: FINISH_LABEL[finish] }));
  const matching = insideMatches(config);
  const side: Side = matching ? 'external' : target;

  const ralOn = (which: Side) => {
    const colour = colourOn(config, which);
    return colour.mode === 'ral' ? colour.code : null;
  };

  return (
    <div className="colour">
      <SwatchGrid
        legend="Outside colour"
        codes={codes}
        value={ralOn('external')}
        onChange={(code) => pickOffered('external', code)}
      />
      <Segmented<Finish>
        legend="Outside finish"
        value={config.finish.external}
        options={finishes}
        onChange={(finish) => edit((c) => withExternalFinish(c, finish))}
      />

      <div className="colour__inside">
        <Segmented<'match' | 'different'>
          legend="Inside"
          value={matching ? 'match' : 'different'}
          options={[
            { value: 'match', label: 'Same as outside' },
            { value: 'different', label: 'Different' },
          ]}
          onChange={(choice) => edit((c) => withInsideMatching(c, choice === 'match'))}
        />
        {!matching && (
          <>
            <SwatchGrid
              legend="Inside colour"
              codes={codes}
              value={ralOn('internal')}
              onChange={(code) => pickOffered('internal', code)}
            />
            <Segmented<Finish>
              legend="Inside finish"
              value={resolveInternalFinish(config.finish)}
              options={finishes}
              onChange={(finish) => edit((c) => withInternalFinish(c, finish))}
            />
          </>
        )}
      </div>

      <div className="explore" data-open={exploring}>
        <button
          type="button"
          className="explore__toggle"
          aria-expanded={exploring}
          aria-controls={exploreId}
          onClick={() => setExploring((open) => !open)}
        >
          <span>Explore any colour</span>
          <span className="explore__tag">Not available to order</span>
        </button>
        {exploring && (
          <div className="explore__body" id={exploreId}>
            <p className="explore__warning">
              For ideas only. A colour chosen here is shown on the model but cannot be ordered and is never included in
              a quote. Choose one of the colours above to order.
            </p>
            {!matching && (
              <Segmented<Side>
                legend="Apply to"
                value={target}
                options={[
                  { value: 'external', label: 'Outside' },
                  { value: 'internal', label: 'Inside' },
                ]}
                onChange={setTarget}
              />
            )}
            <ExplorePicker
              key={`${side}-${pickerRevision}`}
              start={colourToHexString(colourOn(config, side))}
              exploring={colourOn(config, side).mode === 'explore'}
              material={config.material}
              onChange={(hex) => edit((c) => withColour(c, side, { mode: 'explore', hex }))}
              onUseOffered={(code) => pickOffered(side, code)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
