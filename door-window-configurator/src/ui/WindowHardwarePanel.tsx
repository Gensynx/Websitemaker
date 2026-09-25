/**
 * The Hardware section for a window (Step 7.4): handles and finishes
 * mirroring the door set — without the pull bar, which is not a window
 * handle — and trickle vents.
 *
 * Handles are fitted inside the sash, on each light that opens. Trickle vents
 * are offered in the head of the frame only: it is the one position the
 * renderer draws, and a vent in the sash or through the glass would look the
 * same on screen as one in the head.
 */

import { useConfigurator } from '../state/store';
import type { HardwareFinish, WindowConfigState, WindowHandleStyle } from '../config/types';
import { withTrickleVents, withWindowHandle, withWindowHardwareFinish, gridOf } from '../config/windowEdits';
import { MAX_TRICKLE_VENTS } from '../config/limits';
import { OptionTiles, Toggle } from './OptionTiles';
import { FinishChip, HandleGlyph } from './DoorHardwarePanel';
import { CountField } from './CountField';

const HANDLES: Array<{ value: WindowHandleStyle; label: string }> = [
  { value: 'lever-backplate', label: 'Lever on backplate' },
  { value: 'lever-rose', label: 'Lever on rose' },
  { value: 'knob', label: 'Knob' },
];

const FINISHES: Array<{ value: HardwareFinish; label: string }> = [
  { value: 'chrome', label: 'Polished chrome' },
  { value: 'satin-chrome', label: 'Satin chrome' },
  { value: 'black', label: 'Black' },
  { value: 'brass', label: 'Brass' },
  { value: 'anthracite', label: 'Anthracite' },
];

export function WindowHardwarePanel({ config }: { config: WindowConfigState }): JSX.Element {
  const edit = useConfigurator((state) => state.edit);
  const update = (mutate: (window: WindowConfigState) => WindowConfigState) =>
    edit((current) => (current.productType === 'window' ? mutate(current) : current));

  const grid = gridOf(config);
  const openers = grid ? grid.cells.filter((cell) => cell.opening !== 'fixed').length : config.style.id === 'sash' ? 1 : 0;

  return (
    <div className="options">
      {openers === 0 && (
        <p className="section__hint">
          Nothing in this window opens, so no handles are fitted. The choice below applies if a light is made to open.
        </p>
      )}
      <OptionTiles<WindowHandleStyle>
        legend="Handle"
        value={config.hardware.handle}
        tiles={HANDLES.map((handle) => ({ ...handle, picture: <HandleGlyph style={handle.value} /> }))}
        onChange={(handle) => update((window) => withWindowHandle(window, handle))}
      />
      <OptionTiles<HardwareFinish>
        legend="Finish"
        value={config.hardware.finish}
        tiles={FINISHES.map((finish) => ({ ...finish, picture: <FinishChip finish={finish.value} /> }))}
        onChange={(finish) => update((window) => withWindowHardwareFinish(window, finish))}
      />
      <div className="options__group">
        <Toggle
          label="Trickle vents"
          detail="Background ventilation in the head of the frame"
          checked={config.trickleVents !== null}
          onChange={(on) => update((window) => withTrickleVents(window, on ? Math.max(1, config.trickleVents?.count ?? 1) : 0))}
        />
        {config.trickleVents !== null && (
          <CountField
            label="Vents fitted"
            value={config.trickleVents.count}
            min={1}
            max={MAX_TRICKLE_VENTS}
            onCommit={(n) => update((window) => withTrickleVents(window, n))}
          />
        )}
        <p className="section__hint">
          Building regulations set ventilation by room. The number fitted here is a starting point for the survey, not a
          compliance statement.
        </p>
      </div>
    </div>
  );
}
