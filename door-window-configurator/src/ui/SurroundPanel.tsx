/**
 * The Surround section for a door (Step 6.1): side lights — none, left,
 * right or both — and a top light, chosen independently.
 *
 * A section of its own rather than a corner of Style, so a customer looking
 * for "surround" finds it by name. Each tile shows the door as it would be
 * built with that choice, drawn from the same part list as the 3D model.
 *
 * Side and top lights change the leaf, never the frame (doorEdits.ts). When
 * that leaves the leaf smaller than the customer may expect — or smaller than
 * can be made — the panel says so and offers the frame size that keeps the
 * door as it was, as a button the customer presses, not a silent resize.
 */

import { useConfigurator } from '../state/store';
import type { DoorConfigState } from '../config/types';
import {
  heightToKeepLeaf,
  plainLeaf,
  sideLightsOf,
  sideLightWidthOf,
  widthToKeepLeaf,
  withSideLights,
  withSideLightWidth,
  withTopLight,
  withTopLightHeight,
} from '../config/doorEdits';
import type { SideLights } from '../config/doorEdits';
import { doorLayout } from '../config/layout';
import { renderBlockers } from '../config/validate';
import { MAX_DOOR_LEAF, MIN_DOOR_LEAF_WIDTH, MIN_SIDE_LIGHT_WIDTH, MIN_TOP_LIGHT_HEIGHT, sizeLimits } from '../config/limits';
import { formatMm, roundMmHalfUp } from '../config/units';
import { ElevationThumb } from './ElevationThumb';
import { OptionTiles } from './OptionTiles';
import { DimensionField } from './SizePanel';

const SIDE_LIGHTS: Array<{ value: SideLights; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'both', label: 'Both' },
];

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

export function SurroundPanel({ config }: { config: DoorConfigState }): JSX.Element {
  const edit = useConfigurator((state) => state.edit);
  const validation = useConfigurator((state) => state.validation);
  const lastValid = useConfigurator((state) => state.lastValid);
  // Thumbnails start from what is on screen: while the current configuration
  // cannot be built, that is the last buildable one, as in the 3D view.
  const shown: DoorConfigState =
    renderBlockers(validation).length > 0 && lastValid.productType === 'door' ? lastValid : config;
  const update = (mutate: (door: DoorConfigState) => DoorConfigState) =>
    edit((current) => (current.productType === 'door' ? mutate(current) : current));

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
      <div className="options__group">
        <OptionTiles<SideLights>
          legend="Side lights"
          columns={4}
          value={sides}
          hint="Glazed panels beside the door, inside the same frame."
          tiles={SIDE_LIGHTS.map((option) => ({
            value: option.value,
            label: option.label,
            picture: <ElevationThumb config={withSideLights(shown, option.value)} />,
          }))}
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
        <OptionTiles<'none' | 'top'>
          legend="Top light"
          columns={2}
          value={topLight === null ? 'none' : 'top'}
          hint="A glazed panel above the door, inside the same frame."
          tiles={[
            { value: 'none', label: 'No top light', picture: <ElevationThumb config={withTopLight(shown, false)} /> },
            { value: 'top', label: 'Top light', picture: <ElevationThumb config={withTopLight(shown, true)} /> },
          ]}
          onChange={(choice) => update((door) => withTopLight(door, choice === 'top'))}
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
    </div>
  );
}
