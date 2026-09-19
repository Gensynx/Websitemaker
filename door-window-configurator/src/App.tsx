/**
 * Application shell for Step 2.
 *
 * The 3D bundle is lazy: first paint shows the shell and the dimension
 * readout, and never waits on WebGL. Where WebGL is absent the SVG elevation
 * takes its place, drawn from the same parametric part list.
 *
 * The configuration panel is Step 4 and the sizing controls are Step 3, so
 * neither is here. Until Step 3 lands, dimensions come from the URL or from
 * the last session.
 */

import { lazy, Suspense, useDeferredValue, useMemo, useState } from 'react';
import { useConfigurator } from './state/store';
import { StaticElevation } from './viewer/StaticElevation';
import { SizePanel } from './ui/SizePanel';
import { renderBlockers } from './config/validate';
import { formatSize } from './config/units';
import type { CameraPreset } from './config/view';

const Viewer = lazy(() => import('./viewer/Viewer'));

const PRESETS: Array<{ id: CameraPreset; label: string }> = [
  { id: 'elevation', label: 'Elevation' },
  { id: 'three-quarter', label: 'Three-quarter' },
  { id: 'hardware', label: 'Hardware' },
];

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

export function App(): JSX.Element {
  const config = useConfigurator((state) => state.config);
  const setProductType = useConfigurator((state) => state.setProductType);
  const lastValid = useConfigurator((state) => state.lastValid);
  const validation = useConfigurator((state) => state.validation);
  const notices = useConfigurator((state) => state.notices);
  const camera = useConfigurator((state) => state.camera);
  const showSilhouette = useConfigurator((state) => state.showSilhouette);
  const setCamera = useConfigurator((state) => state.setCamera);
  const resetView = useConfigurator((state) => state.resetView);
  const toggleSilhouette = useConfigurator((state) => state.toggleSilhouette);

  // A preset can be re-selected to recentre after an orbit, so the rig needs a
  // change it can see even when the preset itself has not changed.
  const [presetToken, setPresetToken] = useState(0);
  const webgl = useMemo(hasWebGL, []);

  // Step 3.4: an unmanufacturable size never renders. Only errors that block
  // the RENDER fall back — an unavailable material or an explore colour leaves
  // the product on screen, because its shape is not what is wrong with it.
  const blockers = renderBlockers(validation);
  const rendered = blockers.length === 0 ? config : lastValid;

  // Throttles the viewer during continuous dimension input (performance
  // budget). The panel stays responsive on every keystroke while the scene
  // rebuilds at a lower priority and catches up, rather than rebuilding the
  // geometry and materials once per character.
  const deferred = useDeferredValue(rendered);

  return (
    <div className="app">
      <header className="app__header">
        <p className="eyebrow">Configurator</p>
        <h1>{config.productType === 'door' ? 'External door' : 'Window'}</h1>
        <p className="lede" aria-live="polite">
          {formatSize(config.dimensions.width, config.dimensions.height)}
        </p>
      </header>

      <main className="stage">
        {webgl ? (
          // Absolutely filled rather than relying on a percentage height: the
          // canvas measures its parent, and a flex item's height is not a
          // definite containing block for one.
          <div className="stage__canvas">
            <Suspense fallback={<div className="stage__placeholder">Preparing the 3D view…</div>}>
              <Viewer
                config={deferred}
                camera={camera}
                presetToken={presetToken}
                showSilhouette={showSilhouette}
              />
            </Suspense>
          </div>
        ) : (
          <StaticElevation config={deferred} />
        )}

        <div className="controls controls--product" role="group" aria-label="Product">
          <button
            type="button"
            className="control"
            aria-pressed={config.productType === 'door'}
            onClick={() => setProductType('door')}
          >
            Door
          </button>
          <button
            type="button"
            className="control"
            aria-pressed={config.productType === 'window'}
            onClick={() => setProductType('window')}
          >
            Window
          </button>
        </div>

        <div className="controls" role="group" aria-label="View controls">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="control"
              aria-pressed={camera === preset.id}
              onClick={() => {
                setCamera(preset.id);
                setPresetToken((token) => token + 1);
              }}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            className="control"
            onClick={() => {
              resetView();
              setPresetToken((token) => token + 1);
            }}
          >
            Reset view
          </button>
          <button
            type="button"
            className="control"
            aria-pressed={showSilhouette}
            onClick={toggleSilhouette}
          >
            Scale figure
          </button>
        </div>
      </main>

      <SizePanel />

      {/* Reasons that belong to a specific input are shown against that input.
          What is left here is everything else, plus the statement of what the
          viewer is actually showing. */}
      {validation.errors.length > 0 && (
        <div className="messages messages--blocking" role="alert">
          {validation.errors
            .filter((error) => error.field !== 'width' && error.field !== 'height')
            .map((error) => (
              <p key={`${error.field}-${error.message}`}>{error.message}</p>
            ))}
          {blockers.length > 0 && (
            <p className="messages__note">
              This size cannot be made, so the drawing still shows{' '}
              {formatSize(lastValid.dimensions.width, lastValid.dimensions.height)}.
            </p>
          )}
        </div>
      )}

      {notices.length > 0 && (
        <div className="messages" role="status">
          {notices.map((notice) => (
            <p key={`${notice.field}-${notice.message}`}>{notice.message}</p>
          ))}
        </div>
      )}

      <footer className="app__footer">
        <p>
          On-screen colours, finishes and obscure glass patterns are indicative only. Confirm
          against a physical sample before ordering.
        </p>
      </footer>
    </div>
  );
}
