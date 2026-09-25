/**
 * The Style section for a window (Steps 7.1 to 7.3).
 *
 *   7.1  Casement, tilt and turn, sliding sash, fixed — and named layouts to
 *        start from. Bay is not offered: it is a run of facets with a corner
 *        angle and a projection, which width × height cannot describe
 *        (deferred at Step 1; see types.ts).
 *   7.2  How many lights across and high, and glazing bars per light.
 *   7.3  How each light opens.
 *
 * Choosing a style or a layout never changes the overall size.
 */

import { useId, useState } from 'react';
import { useConfigurator } from '../state/store';
import type { SashOpening, WindowConfigState, WindowStyleId } from '../config/types';
import { WINDOW_PRESETS } from '../config/windowPresets';
import {
  gridOf,
  hasEqualDivisions,
  matchingPreset,
  openingsFor,
  withBarsEverywhere,
  withCellBars,
  withCellOpening,
  withEqualDivisions,
  withFixedBars,
  withGridSize,
  withPreset,
  withSashOptions,
  withWindowStyle,
} from '../config/windowEdits';
import { MAX_GRID_COLUMNS, MAX_GRID_ROWS } from '../config/limits';
import { renderBlockers } from '../config/validate';
import { ElevationThumb } from './ElevationThumb';
import { OptionTiles, Toggle } from './OptionTiles';
import { Segmented } from './Segmented';
import { BarEditor } from './BarEditor';
import { LightPicker, OpeningLines } from './LightPicker';

const STYLES: Array<{ id: WindowStyleId; label: string; detail: string }> = [
  { id: 'casement', label: 'Casement', detail: 'Lights hinged at the side or top' },
  { id: 'tilt-and-turn', label: 'Tilt and turn', detail: 'Tilts to vent, turns to open' },
  { id: 'sash', label: 'Sliding sash', detail: 'Two sashes slide vertically' },
  { id: 'fixed', label: 'Fixed', detail: 'A single pane that does not open' },
];

export function openingLabel(style: 'casement' | 'tilt-and-turn', opening: SashOpening): string {
  if (opening === 'fixed') return 'Fixed';
  if (style === 'tilt-and-turn') {
    if (opening === 'bottom-hung') return 'Tilt only';
    return opening === 'side-hung-left' ? 'Tilt and turn, hinged left' : 'Tilt and turn, hinged right';
  }
  if (opening === 'top-hung') return 'Top-hung vent';
  if (opening === 'bottom-hung') return 'Bottom-hung';
  return opening === 'side-hung-left' ? 'Side-hung, hinged left' : 'Side-hung, hinged right';
}

function count(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

export function WindowStylePanel({ config }: { config: WindowConfigState }): JSX.Element {
  const edit = useConfigurator((state) => state.edit);
  const validation = useConfigurator((state) => state.validation);
  const lastValid = useConfigurator((state) => state.lastValid);
  const update = (mutate: (window: WindowConfigState) => WindowConfigState) =>
    edit((current) => (current.productType === 'window' ? mutate(current) : current));
  const shown: WindowConfigState =
    renderBlockers(validation).length > 0 && lastValid.productType === 'window' ? lastValid : config;

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [selectedLight, setSelectedLight] = useState(0);
  const presetsId = useId();

  const grid = gridOf(config);
  const light = grid ? Math.min(selectedLight, grid.cells.length - 1) : 0;
  const cell = grid?.cells[light];
  const gridStyle = config.style.id === 'casement' || config.style.id === 'tilt-and-turn' ? config.style.id : null;
  const current = matchingPreset(config, WINDOW_PRESETS);

  return (
    <div className="options">
      <div className="explore" data-open={presetsOpen}>
        <button
          type="button"
          className="explore__toggle"
          aria-expanded={presetsOpen}
          aria-controls={presetsId}
          onClick={() => setPresetsOpen((open) => !open)}
        >
          <span>Start from a layout</span>
          {current !== null && <span className="section__flag">{current.label}</span>}
        </button>
        {presetsOpen && (
          <div className="explore__body" id={presetsId}>
            <OptionTiles<string>
              legend="Layouts"
              columns={2}
              value={current?.id ?? null}
              hint="A layout sets the style and lights. The size stays as it is."
              tiles={WINDOW_PRESETS.map((preset) => ({
                value: preset.id,
                label: preset.label,
                detail: preset.description,
                picture: <ElevationThumb config={withPreset(shown, preset)} />,
              }))}
              onChange={(id) => {
                const preset = WINDOW_PRESETS.find((p) => p.id === id);
                if (preset) {
                  update((window) => withPreset(window, preset));
                  setSelectedLight(0);
                }
              }}
            />
          </div>
        )}
      </div>

      <OptionTiles<WindowStyleId>
        legend="Window style"
        columns={2}
        value={config.style.id}
        tiles={STYLES.map((style) => ({
          value: style.id,
          label: style.label,
          detail: style.detail,
          picture: <ElevationThumb config={withWindowStyle(shown, style.id)} />,
        }))}
        onChange={(id) => update((window) => withWindowStyle(window, id))}
      />
      <p className="section__hint">Bay windows are not offered yet.</p>

      {grid !== null && gridStyle !== null && cell !== undefined && (
        <>
          <div className="options__group">
            <Segmented<string>
              legend="Lights across"
              value={String(grid.columnWeights.length)}
              options={count(MAX_GRID_COLUMNS).map((n) => ({ value: n, label: n }))}
              onChange={(n) => update((window) => withGridSize(window, Number(n), grid.rowWeights.length))}
            />
            <Segmented<string>
              legend="Lights high"
              value={String(grid.rowWeights.length)}
              options={count(MAX_GRID_ROWS).map((n) => ({ value: n, label: n }))}
              onChange={(n) => update((window) => withGridSize(window, grid.columnWeights.length, Number(n)))}
            />
            {!hasEqualDivisions(grid) && (
              <div className="keep">
                <p>The lights are different sizes, as the layout drew them.</p>
                <button type="button" className="button button--quiet" onClick={() => update(withEqualDivisions)}>
                  Make them equal
                </button>
              </div>
            )}
          </div>

          <div className="options__group">
            <LightPicker
              grid={grid}
              selected={light}
              onSelect={setSelectedLight}
              describeOpening={(opening) => openingLabel(gridStyle, opening).toLowerCase()}
              aspect={config.dimensions.width / config.dimensions.height}
            />
            <OptionTiles<SashOpening>
              legend={`Light ${light + 1} opens`}
              columns={2}
              value={cell.opening}
              tiles={openingsFor(gridStyle).map((opening) => ({
                value: opening,
                label: openingLabel(gridStyle, opening),
                picture: (
                  <span className="opening-glyph">
                    <OpeningLines opening={opening} />
                  </span>
                ),
              }))}
              onChange={(opening) => update((window) => withCellOpening(window, light, opening))}
            />
            <BarEditor
              legend={`Light ${light + 1} glazing bars`}
              bars={cell.bars}
              onChange={(bars) => update((window) => withCellBars(window, light, bars))}
            />
            {grid.cells.length > 1 && (
              <button
                type="button"
                className="button button--quiet options__apply"
                onClick={() => update((window) => withBarsEverywhere(window, cell.bars))}
              >
                Use these bars in every light
              </button>
            )}
          </div>
        </>
      )}

      {config.style.id === 'sash' &&
        (() => {
          const sash = config.style.options;
          return (
            <div className="options__group">
              <Segmented<'double-hung' | 'single-hung'>
                legend="Which sashes slide"
                value={sash.operation}
                options={[
                  { value: 'double-hung', label: 'Both' },
                  { value: 'single-hung', label: 'Lower only' },
                ]}
                onChange={(operation) => update((window) => withSashOptions(window, { operation }))}
              />
              <label className="range" htmlFor={`${presetsId}-rail`}>
                <span className="range__label">Meeting rail height</span>
                <input
                  id={`${presetsId}-rail`}
                  type="range"
                  min={30}
                  max={70}
                  step={5}
                  value={Math.round(sash.meetingRailPosition * 100)}
                  aria-valuetext={`${Math.round(sash.meetingRailPosition * 100)} percent of the height, from the cill`}
                  className="range__input range__input--plain"
                  onChange={(event) =>
                    update((window) => withSashOptions(window, { meetingRailPosition: Number(event.target.value) / 100 }))
                  }
                />
              </label>
              <Toggle
                label="Horns"
                detail="Decorative extensions below the upper sash"
                checked={sash.horns}
                onChange={(horns) => update((window) => withSashOptions(window, { horns }))}
              />
              <BarEditor
                legend="Upper sash bars"
                bars={sash.upperBars}
                onChange={(upperBars) => update((window) => withSashOptions(window, { upperBars }))}
              />
              <BarEditor
                legend="Lower sash bars"
                bars={sash.lowerBars}
                onChange={(lowerBars) => update((window) => withSashOptions(window, { lowerBars }))}
              />
            </div>
          );
        })()}

      {config.style.id === 'fixed' && (
        <div className="options__group">
          <BarEditor
            legend="Glazing bars"
            bars={config.style.options.bars}
            onChange={(bars) => update((window) => withFixedBars(window, bars))}
          />
        </div>
      )}
    </div>
  );
}
