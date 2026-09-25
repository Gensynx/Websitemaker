/**
 * The Style section for a door (Steps 6.1, 6.2 and 6.6).
 *
 *   6.1  Solid panel, half glazed or fully glazed. The surround — side and
 *        top lights — is its own section (SurroundPanel.tsx).
 *   6.2  Flush, one to four raised panels, or contemporary grooved — wherever
 *        the leaf has a solid area to carry them.
 *   6.6  Hinge side and opening direction, stated as viewed from outside.
 *
 * Every style and panel tile shows the door as it would be built, drawn from
 * the same part list as the 3D model (ElevationThumb).
 */

import { useConfigurator } from '../state/store';
import type { DoorConfigState, DoorStyleId, MouldingProfile, PanelDetail } from '../config/types';
import { HANDING_STATEMENT } from '../config/describe';
import {
  leafAlone,
  panelChoiceId,
  panelChoices,
  panelDetailOf,
  withDoorStyle,
  withHingeSide,
  withOpeningDirection,
  withPanelDetail,
  withThreshold,
} from '../config/doorEdits';
import { renderBlockers } from '../config/validate';
import { ElevationThumb } from './ElevationThumb';
import { OptionTiles } from './OptionTiles';
import { Segmented } from './Segmented';

const STYLES: Array<{ id: DoorStyleId; label: string; detail: string }> = [
  { id: 'solid-panel', label: 'Solid panel', detail: 'No glass in the door' },
  { id: 'half-glazed', label: 'Half glazed', detail: 'Glass in the upper part' },
  { id: 'full-glazed', label: 'Fully glazed', detail: 'Glass to the full height' },
];

function panelLabel(detail: PanelDetail): { label: string; detail?: string } {
  switch (detail.kind) {
    case 'flush':
      return { label: 'Flush', detail: 'Plain face' };
    case 'raised':
      return { label: `${detail.panels} panel${detail.panels === 1 ? '' : 's'}`, detail: 'Raised and fielded' };
    case 'grooved':
      return { label: 'Grooved', detail: 'Contemporary' };
  }
}

export function DoorStylePanel({ config }: { config: DoorConfigState }): JSX.Element {
  const edit = useConfigurator((state) => state.edit);
  const validation = useConfigurator((state) => state.validation);
  const lastValid = useConfigurator((state) => state.lastValid);
  // Thumbnails start from what is actually on screen. While the current
  // configuration cannot be built (a side light leaving a 190 mm leaf), that
  // is the last buildable one, exactly as the 3D view shows.
  const shown: DoorConfigState =
    renderBlockers(validation).length > 0 && lastValid.productType === 'door' ? lastValid : config;
  const update = (mutate: (door: DoorConfigState) => DoorConfigState) =>
    edit((current) => (current.productType === 'door' ? mutate(current) : current));

  // Style and panels belong to the leaf, so their tiles draw the leaf alone.
  const leaf = leafAlone(shown);
  const panels = panelDetailOf(config);
  return (
    <div className="options">
      <OptionTiles<DoorStyleId>
        legend="Door style"
        value={config.style.id}
        tiles={STYLES.map((style) => ({
          value: style.id,
          label: style.label,
          detail: style.detail,
          picture: <ElevationThumb config={withDoorStyle(leaf, style.id)} />,
        }))}
        onChange={(id) => update((door) => withDoorStyle(door, id))}
      />

      {panels !== null && (
        <div className="options__group">
          <OptionTiles<string>
            legend="Panels"
            value={panelChoiceId(panels)}
            tiles={panelChoices(panels).map((detail) => ({
              value: panelChoiceId(detail),
              ...panelLabel(detail),
              picture: <ElevationThumb config={withPanelDetail(leaf, detail)} />,
            }))}
            onChange={(id) => {
              const detail = panelChoices(panels).find((choice) => panelChoiceId(choice) === id);
              if (detail) update((door) => withPanelDetail(door, detail));
            }}
          />
          {panels.kind === 'raised' && (
            <Segmented<MouldingProfile>
              legend="Moulding"
              value={panels.moulding}
              options={[
                { value: 'ovolo', label: 'Ovolo' },
                { value: 'chamfer', label: 'Chamfer' },
                { value: 'square', label: 'Square' },
              ]}
              onChange={(moulding) => update((door) => withPanelDetail(door, { ...panels, moulding }))}
            />
          )}
          {panels.kind === 'grooved' && (
            <>
              <Segmented<'horizontal' | 'vertical'>
                legend="Grooves run"
                value={panels.orientation}
                options={[
                  { value: 'horizontal', label: 'Across' },
                  { value: 'vertical', label: 'Up and down' },
                ]}
                onChange={(orientation) => update((door) => withPanelDetail(door, { ...panels, orientation }))}
              />
              <Segmented<string>
                legend="Number of grooves"
                value={String(panels.grooves)}
                options={['3', '4', '5', '6'].map((n) => ({ value: n, label: n }))}
                onChange={(n) => update((door) => withPanelDetail(door, { ...panels, grooves: Number(n) }))}
              />
            </>
          )}
        </div>
      )}

      <div className="options__group">
        <Segmented<'left' | 'right'>
          legend="Hinged on the"
          value={config.hingeSide}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
          onChange={(side) => update((door) => withHingeSide(door, side))}
        />
        <Segmented<'inward' | 'outward'>
          legend="Opens"
          value={config.openingDirection}
          options={[
            { value: 'inward', label: 'Inward' },
            { value: 'outward', label: 'Outward' },
          ]}
          onChange={(direction) => update((door) => withOpeningDirection(door, direction))}
        />
        <p className="section__hint">{HANDING_STATEMENT}</p>
      </div>

      <div className="options__group">
        <Segmented<'standard' | 'low-level-access'>
          legend="Threshold"
          value={config.threshold}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'low-level-access', label: 'Level access' },
          ]}
          onChange={(threshold) => update((door) => withThreshold(door, threshold))}
        />
      </div>
    </div>
  );
}
