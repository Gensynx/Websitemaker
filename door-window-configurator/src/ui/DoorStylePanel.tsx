/**
 * The Style section for a door (Steps 6.1, 6.2 and 6.6).
 *
 *   6.1  Solid panel, half glazed or fully glazed; side lights (none, left,
 *        right, both) and a top light, independently.
 *   6.2  Flush, one to four raised panels, or contemporary grooved — wherever
 *        the leaf has a solid area to carry them.
 *   6.6  Hinge side and opening direction, stated as viewed from outside.
 *
 * Every style and panel tile shows the door as it would be built, drawn from
 * the same part list as the 3D model (ElevationThumb).
 *
 * Side and top lights change the leaf, never the frame (doorEdits.ts). When
 * that leaves the leaf smaller than the customer may expect — or smaller than
 * can be made — the panel says so and offers the frame size that keeps the
 * door as it was, as a button the customer presses, not a silent resize.
 */

import { useConfigurator } from '../state/store';
import type { DoorConfigState, DoorStyleId, MouldingProfile, PanelDetail } from '../config/types';
import { HANDING_STATEMENT } from '../config/describe';
import {
  heightToKeepLeaf,
  panelChoiceId,
  panelChoices,
  panelDetailOf,
  plainLeaf,
  sideLightsOf,
  sideLightWidthOf,
  widthToKeepLeaf,
  withDoorStyle,
  withHingeSide,
  withOpeningDirection,
  withPanelDetail,
  withSideLights,
  withSideLightWidth,
  withThreshold,
  withTopLight,
  withTopLightHeight,
} from '../config/doorEdits';
import type { SideLights } from '../config/doorEdits';
import { doorLayout } from '../config/layout';
import { renderBlockers } from '../config/validate';
import { MAX_DOOR_LEAF, MIN_DOOR_LEAF_WIDTH, MIN_SIDE_LIGHT_WIDTH, MIN_TOP_LIGHT_HEIGHT, sizeLimits } from '../config/limits';
import { formatMm, roundMmHalfUp } from '../config/units';
import { ElevationThumb } from './ElevationThumb';
import { OptionTiles, Toggle } from './OptionTiles';
import { Segmented } from './Segmented';
import { DimensionField } from './SizePanel';

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

/** Inline "keep the door as it was" offer, with the reason it is there. */
function KeepLeaf({
  problem,
  note,
  action,
  onApply,
}: {
  problem: string | null;
  note: string | null;
  action: string | null;
  onApply: () => void;
}): JSX.Element | null {
  if (problem === null && note === null) return null;
  return (
    <div className={problem === null ? 'keep' : 'keep keep--problem'} role={problem === null ? undefined : 'alert'}>
      <p>{problem ?? note}</p>
      {action !== null && (
        <button type="button" className="button button--quiet" onClick={onApply}>
          {action}
        </button>
      )}
    </div>
  );
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

  const panels = panelDetailOf(config);
  const sides = sideLightsOf(config);
  const topLight = config.surround.topLight;
  const layout = doorLayout(config);
  const plain = plainLeaf(config);
  const limits = sizeLimits(config.material, 'door');

  // What "keep the door as it was" means, within what can be made.
  const targetWidth = Math.min(Math.max(plain.width, MIN_DOOR_LEAF_WIDTH), MAX_DOOR_LEAF.width);
  const keepWidth = roundMmHalfUp(widthToKeepLeaf(config, targetWidth));
  const widthFixable = keepWidth <= limits.maxWidth;
  const leafTooNarrow = layout.leaf.width < MIN_DOOR_LEAF_WIDTH;
  const leafNarrowed = sides !== 'none' && roundMmHalfUp(layout.leaf.width) < roundMmHalfUp(targetWidth);

  const keepHeight = roundMmHalfUp(heightToKeepLeaf(config, plain.height));
  const heightFixable = keepHeight <= limits.maxHeight;
  const leafShortened = topLight !== null && roundMmHalfUp(layout.leaf.height) < roundMmHalfUp(plain.height);

  const errorsFor = (field: string) => validation.errors.filter((error) => error.field === field);

  return (
    <div className="options">
      <OptionTiles<DoorStyleId>
        legend="Door style"
        value={config.style.id}
        tiles={STYLES.map((style) => ({
          value: style.id,
          label: style.label,
          detail: style.detail,
          picture: <ElevationThumb config={withDoorStyle(shown, style.id)} />,
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
              picture: <ElevationThumb config={withPanelDetail(shown, detail)} />,
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
        <Segmented<SideLights>
          legend="Side lights"
          value={sides}
          options={[
            { value: 'none', label: 'None' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'both', label: 'Both' },
          ]}
          onChange={(which) => update((door) => withSideLights(door, which))}
        />
        {sides !== 'none' && (
          <DimensionField
            label={sides === 'both' ? 'Side light width, each' : 'Side light width'}
            value={sideLightWidthOf(config)}
            min={MIN_SIDE_LIGHT_WIDTH}
            errors={[...errorsFor('surround.leftSideLight'), ...errorsFor('surround.rightSideLight')].filter(
              (error, index, all) => all.findIndex((other) => other.message === error.message) === index,
            )}
            onCommit={(width) => update((door) => withSideLightWidth(door, width))}
          />
        )}
        <KeepLeaf
          problem={
            leafTooNarrow
              ? layout.leaf.width <= 0
                ? `${sides === 'both' ? 'The side lights take' : 'The side light takes'} the whole ${formatMm(config.dimensions.width)} frame: there is no room left for the door.`
                : `With ${sides === 'both' ? 'side lights' : 'a side light'}, the door itself would be only ${formatMm(layout.leaf.width)} wide. The narrowest we make is ${formatMm(MIN_DOOR_LEAF_WIDTH)}.`
              : null
          }
          note={
            !leafTooNarrow && leafNarrowed
              ? `Side lights take their width from the door: it is now ${formatMm(layout.leaf.width)} wide, and the frame stays ${formatMm(config.dimensions.width)}.`
              : null
          }
          action={
            (leafTooNarrow || leafNarrowed) && widthFixable
              ? `Widen the frame to ${formatMm(keepWidth)} to keep the door at ${formatMm(targetWidth)}`
              : null
          }
          onApply={() => update((door) => ({ ...door, dimensions: { ...door.dimensions, width: keepWidth } }))}
        />
        {leafTooNarrow && !widthFixable && (
          <p className="section__hint">
            The frame would need to be wider than {formatMm(limits.maxWidth)}. Use narrower side lights, or one only.
          </p>
        )}
      </div>

      <div className="options__group">
        <Toggle
          label="Top light"
          detail="A glazed panel above the door"
          checked={topLight !== null}
          onChange={(on) => update((door) => withTopLight(door, on))}
        />
        {topLight !== null && (
          <DimensionField
            label="Top light height"
            value={topLight.height}
            min={MIN_TOP_LIGHT_HEIGHT}
            errors={errorsFor('surround.topLight')}
            onCommit={(height) => update((door) => withTopLightHeight(door, height))}
          />
        )}
        <KeepLeaf
          problem={null}
          note={
            leafShortened
              ? `The top light takes its height from the door: it is now ${formatMm(layout.leaf.height)} high, and the frame stays ${formatMm(config.dimensions.height)}.`
              : null
          }
          action={leafShortened && heightFixable ? `Raise the frame to ${formatMm(keepHeight)} to keep the door at ${formatMm(plain.height)}` : null}
          onApply={() => update((door) => ({ ...door, dimensions: { ...door.dimensions, height: keepHeight } }))}
        />
      </div>

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
