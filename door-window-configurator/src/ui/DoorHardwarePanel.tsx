/**
 * The Hardware section for a door (Steps 6.3 to 6.5).
 *
 *   6.3  Lever on backplate, lever on rose, pull bar, knob.
 *   6.4  Chrome, satin chrome, black, brass, anthracite.
 *   6.5  Letterplate, knocker and spyhole, each on its own.
 *
 * House numerals (also 6.5) are not offered. Glyphs need a typeface, and a
 * typeface is an art asset under the core constraint — the deferral recorded
 * at Step 1 (types.ts, DoorHardware). The panel says so rather than showing a
 * toggle that would do nothing.
 *
 * A fully glazed leaf has no solid area to fix furniture to, and the renderer
 * draws none there. Those toggles are disabled with the reason, rather than
 * left switchable with no effect on the picture.
 */

import { useConfigurator } from '../state/store';
import type { DoorConfigState, DoorHandleStyle, HardwareFinish } from '../config/types';
import { hasFurniture, withFurniture, withHandle, withHardwareFinish } from '../config/doorEdits';
import type { Furniture } from '../config/doorEdits';
import { OptionTiles, Toggle } from './OptionTiles';

const HANDLES: Array<{ value: DoorHandleStyle; label: string }> = [
  { value: 'lever-backplate', label: 'Lever on backplate' },
  { value: 'lever-rose', label: 'Lever on rose' },
  { value: 'pull-bar', label: 'Pull bar' },
  { value: 'knob', label: 'Knob' },
];

const FINISHES: Array<{ value: HardwareFinish; label: string }> = [
  { value: 'chrome', label: 'Polished chrome' },
  { value: 'satin-chrome', label: 'Satin chrome' },
  { value: 'black', label: 'Black' },
  { value: 'brass', label: 'Brass' },
  { value: 'anthracite', label: 'Anthracite' },
];

const FURNITURE: Array<{ item: Furniture; label: string; detail: string }> = [
  { item: 'letterplate', label: 'Letterplate', detail: 'On the mid-rail where there is one' },
  { item: 'knocker', label: 'Knocker', detail: 'Ring knocker' },
  { item: 'spyhole', label: 'Spyhole', detail: 'Wide-angle viewer' },
];

/** Line drawings of each handle, built from primitives: no artwork. */
export function HandleGlyph({ style }: { style: DoorHandleStyle }): JSX.Element {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 48 48" className="glyph" aria-hidden="true" focusable="false">
      {style === 'lever-backplate' && (
        <>
          <rect x="26" y="6" width="10" height="36" rx="2" {...stroke} />
          <path d="M31 16 H10" {...stroke} strokeWidth={3} />
          <circle cx="31" cy="32" r="1.6" fill="currentColor" />
        </>
      )}
      {style === 'lever-rose' && (
        <>
          <circle cx="32" cy="24" r="6" {...stroke} />
          <path d="M32 24 H10" {...stroke} strokeWidth={3} />
        </>
      )}
      {style === 'pull-bar' && (
        <>
          <path d="M24 4 V44" {...stroke} strokeWidth={3} />
          <path d="M24 10 H32 M24 38 H32" {...stroke} />
        </>
      )}
      {style === 'knob' && (
        <>
          <circle cx="24" cy="24" r="10" {...stroke} />
          <circle cx="24" cy="24" r="5" {...stroke} />
        </>
      )}
    </svg>
  );
}

export function FinishChip({ finish }: { finish: HardwareFinish }): JSX.Element {
  return <span className="metal" data-finish={finish} aria-hidden="true" />;
}

export function DoorHardwarePanel({ config }: { config: DoorConfigState }): JSX.Element {
  const edit = useConfigurator((state) => state.edit);
  const update = (mutate: (door: DoorConfigState) => DoorConfigState) =>
    edit((current) => (current.productType === 'door' ? mutate(current) : current));
  const noSolidArea = config.style.id === 'full-glazed';

  return (
    <div className="options">
      <OptionTiles<DoorHandleStyle>
        legend="Handle"
        columns={2}
        value={config.hardware.handle}
        tiles={HANDLES.map((handle) => ({ ...handle, picture: <HandleGlyph style={handle.value} /> }))}
        onChange={(handle) => update((door) => withHandle(door, handle))}
      />

      <OptionTiles<HardwareFinish>
        legend="Finish"
        value={config.hardware.finish}
        tiles={FINISHES.map((finish) => ({ ...finish, picture: <FinishChip finish={finish.value} /> }))}
        onChange={(finish) => update((door) => withHardwareFinish(door, finish))}
      />

      <fieldset className="toggles" disabled={noSolidArea}>
        <legend className="tiles__legend">Door furniture</legend>
        {noSolidArea && (
          <p className="section__hint">A fully glazed door has nowhere to fix a letterplate, knocker or spyhole.</p>
        )}
        {FURNITURE.map(({ item, label, detail }) => (
          <Toggle
            key={item}
            label={label}
            detail={detail}
            checked={!noSolidArea && hasFurniture(config, item)}
            onChange={(on) => update((door) => withFurniture(door, item, on))}
          />
        ))}
        <p className="section__hint">
          House numerals are not offered yet: they need a typeface, which this configurator does not use.
        </p>
      </fieldset>
    </div>
  );
}
