/**
 * The Glazing section (Step 7.5), for doors and windows alike.
 *
 * The brief listed "clear, obscure, tinted, double, triple" as one set; they
 * are independent choices (types.ts): how the glass looks, how many panes the
 * sealed unit has, and — a third axis — whether it is safety glass.
 *
 * Safety glass is not always the customer's choice. Where building
 * regulations make a pane a critical location, standard glass is disabled
 * and the panes and the reason are stated beside it (safety.ts) — never a
 * silently changed value, never an error with nothing to press.
 *
 * Glazing bars live with the glass they divide: per light in a window's Style
 * section, and here for each piece of door glass.
 */

import { useConfigurator } from '../state/store';
import type { ConfigState, DoorConfigState, GlazingUnit, ObscurePattern, SafetyGlazing, TintColour } from '../config/types';
import { withAppearance, withGlazingUnit, withPattern, withSafety, withTint } from '../config/windowEdits';
import type { Appearance } from '../config/windowEdits';
import { doorGlassAreas, withDoorGlassBars } from '../config/doorEdits';
import { hasGlass } from '../config/describe';
import { safetyControlState } from '../config/safety';
import { OptionTiles } from './OptionTiles';
import { Segmented } from './Segmented';
import { BarEditor } from './BarEditor';

const PATTERNS: Array<{ value: ObscurePattern; label: string; detail: string }> = [
  { value: 'stippled', label: 'Stippled', detail: 'Fine dimpled texture' },
  { value: 'reeded', label: 'Reeded', detail: 'Vertical ribs' },
  { value: 'cathedral', label: 'Cathedral', detail: 'Soft rippled texture' },
  { value: 'sandblast', label: 'Sandblast', detail: 'Smooth frosted finish' },
];

const TINTS: Array<{ value: TintColour; label: string }> = [
  { value: 'grey', label: 'Grey' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'blue', label: 'Blue' },
];

/** A small drawn sample of each obscure pattern: parametric, no artwork. */
function PatternSample({ pattern }: { pattern: ObscurePattern }): JSX.Element {
  return <span className="glass-sample" data-pattern={pattern} aria-hidden="true" />;
}

export function GlazingPanel({ config }: { config: ConfigState }): JSX.Element {
  const edit = useConfigurator((state) => state.edit);
  const update = (mutate: (current: ConfigState) => ConfigState) => edit(mutate);

  if (!hasGlass(config)) {
    return (
      <p className="section__hint">
        This door has no glass. Glazing options appear when you choose a glazed style, a side light or a top light.
      </p>
    );
  }

  const glazing = config.glazing;
  const locked = safetyControlState(config).filter((pane) => pane.locked);

  return (
    <div className="options">
      <Segmented<GlazingUnit>
        legend="Sealed unit"
        value={glazing.unit}
        options={[
          { value: 'double', label: 'Double glazed' },
          { value: 'triple', label: 'Triple glazed' },
        ]}
        onChange={(unit) => update((c) => withGlazingUnit(c, unit))}
      />

      <div className="options__group">
        <Segmented<Appearance>
          legend="Glass"
          value={glazing.appearance}
          options={[
            { value: 'clear', label: 'Clear' },
            { value: 'obscure', label: 'Obscure' },
            { value: 'tinted', label: 'Tinted' },
          ]}
          onChange={(appearance) => update((c) => withAppearance(c, appearance))}
        />
        {glazing.appearance === 'obscure' && (
          <OptionTiles<ObscurePattern>
            legend="Pattern"
            columns={2}
            value={glazing.pattern}
            tiles={PATTERNS.map((pattern) => ({ ...pattern, picture: <PatternSample pattern={pattern.value} /> }))}
            onChange={(pattern) => update((c) => withPattern(c, pattern))}
          />
        )}
        {glazing.appearance === 'tinted' && (
          <OptionTiles<TintColour>
            legend="Tint"
            value={glazing.tint}
            tiles={TINTS.map((tint) => ({
              ...tint,
              picture: <span className="glass-sample" data-tint={tint.value} aria-hidden="true" />,
            }))}
            onChange={(tint) => update((c) => withTint(c, tint))}
          />
        )}
      </div>

      <div className="options__group">
        <Segmented<SafetyGlazing>
          legend="Safety glass"
          value={glazing.safety}
          options={[
            { value: 'none', label: 'Standard', disabled: locked.length > 0 },
            { value: 'toughened', label: 'Toughened' },
            { value: 'laminated', label: 'Laminated' },
          ]}
          onChange={(safety) => update((c) => withSafety(c, safety))}
        />
        {locked.length > 0 ? (
          <div className="keep">
            <p>
              Safety glass is required by building regulations for:{' '}
              {locked.map((pane) => pane.label.toLowerCase()).join(', ')}. {locked[0]?.reason}
            </p>
          </div>
        ) : (
          <p className="section__hint">Toughened glass breaks into small blunt pieces; laminated holds together when broken.</p>
        )}
      </div>

      {config.productType === 'door' && <DoorGlassBars config={config} />}
    </div>
  );
}

function DoorGlassBars({ config }: { config: DoorConfigState }): JSX.Element | null {
  const edit = useConfigurator((state) => state.edit);
  const areas = doorGlassAreas(config);
  if (areas.length === 0) return null;
  return (
    <div className="options__group">
      {areas.map(({ area, label, bars }) => (
        <BarEditor
          key={area}
          legend={`${label}: glazing bars`}
          bars={bars}
          onChange={(next) => edit((c) => (c.productType === 'door' ? withDoorGlassBars(c, area, next) : c))}
        />
      ))}
    </div>
  );
}
