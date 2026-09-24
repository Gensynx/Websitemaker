/**
 * Application shell.
 *
 * The product is the hero: the canvas fills the viewport, and the interface
 * sits over it — title top-left, view controls along the bottom, and the
 * configuration panel on the right (a bottom sheet on a phone, Step 4.3). The
 * panel is frosted glass over the canvas with an opaque fallback, and its text
 * holds 4.5:1 contrast whatever is rendered behind it (Step 4.1).
 *
 * The 3D bundle is lazy. First paint shows an SVG elevation drawn from the
 * same part list — dimensionally exact, not a placeholder — and the 3D view
 * fades in over it once its first real frame is ready. Where WebGL is
 * unavailable, the elevation simply stays.
 *
 * Only the Size section of the panel exists. Style, Colour, Glazing and
 * Hardware are Steps 4-7 and are not built; the panel does not pretend they are.
 */

import { lazy, Suspense, useDeferredValue, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useConfigurator } from './state/store';
import { StaticElevation } from './viewer/StaticElevation';
import { SizePanel } from './ui/SizePanel';
import { Segmented } from './ui/Segmented';
import { useInsets } from './ui/useInsets';
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
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') ?? canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

const NARROW = '(max-width: 899px)';
function useIsNarrow(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(NARROW);
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

export function App(): JSX.Element {
  const config = useConfigurator((state) => state.config);
  const lastValid = useConfigurator((state) => state.lastValid);
  const validation = useConfigurator((state) => state.validation);
  const notices = useConfigurator((state) => state.notices);
  const camera = useConfigurator((state) => state.camera);
  const showSilhouette = useConfigurator((state) => state.showSilhouette);
  const scene = useConfigurator((state) => state.scene);
  const wallFinish = useConfigurator((state) => state.wallFinish);
  const setCamera = useConfigurator((state) => state.setCamera);
  const resetView = useConfigurator((state) => state.resetView);
  const toggleSilhouette = useConfigurator((state) => state.toggleSilhouette);
  const setProductType = useConfigurator((state) => state.setProductType);
  const setScene = useConfigurator((state) => state.setScene);
  const setWallFinish = useConfigurator((state) => state.setWallFinish);

  const [presetToken, setPresetToken] = useState(0);
  const [ready, setReady] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const webgl = useMemo(hasWebGL, []);
  const narrow = useIsNarrow();

  // Step 3.4: an unmanufacturable size never renders. Only errors that block
  // the RENDER fall back — an unavailable material or an explore colour leaves
  // the product on screen, because its shape is not what is wrong with it.
  const blockers = renderBlockers(validation);
  const rendered = blockers.length === 0 ? config : lastValid;
  // Keeps the panel responsive on every keystroke while the scene rebuilds at
  // lower priority (performance budget: throttle during continuous input).
  const deferred = useDeferredValue(rendered);

  const stageRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const viewbarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const insets = useInsets(
    { stage: stageRef, title: titleRef, viewbar: viewbarRef, panel: panelRef },
    `${narrow}-${sheetOpen}-${validation.errors.length}-${notices.length}`,
  );

  const panelOpen = !narrow || sheetOpen;
  const productName = config.productType === 'door' ? 'External door' : 'Window';
  const orderIssues = validation.errors.filter((error) => error.field !== 'width' && error.field !== 'height');

  return (
    <div className="shell" data-scene={scene}>
      <main className="stage" ref={stageRef} aria-label="Product preview">
        <div
          className="stage__poster"
          data-hidden={webgl && ready}
          style={{ padding: `${insets.top}px ${insets.right}px ${insets.bottom}px ${insets.left}px` }}
          aria-hidden={webgl && ready}
        >
          <StaticElevation config={deferred} caption={!webgl} />
        </div>

        {webgl && (
          <div className="stage__canvas" data-ready={ready}>
            <Suspense fallback={null}>
              <Viewer
                config={deferred}
                camera={camera}
                presetToken={presetToken}
                showSilhouette={showSilhouette}
                scene={scene}
                wallFinish={wallFinish}
                insets={insets}
                onReady={() => setReady(true)}
              />
            </Suspense>
          </div>
        )}

        <header className="title" ref={titleRef}>
          <p className="eyebrow">Configurator</p>
          <h1>{productName}</h1>
          <p className="lede" aria-live="polite">
            {formatSize(config.dimensions.width, config.dimensions.height)}
          </p>
        </header>

        <div className="viewbar" ref={viewbarRef} role="group" aria-label="View">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="viewbar__button"
              aria-pressed={camera === preset.id}
              onClick={() => {
                setCamera(preset.id);
                setPresetToken((token) => token + 1);
              }}
            >
              {preset.label}
            </button>
          ))}
          <span className="viewbar__rule" aria-hidden="true" />
          <button
            type="button"
            className="viewbar__button"
            onClick={() => {
              resetView();
              setPresetToken((token) => token + 1);
            }}
          >
            Reset view
          </button>
          <button type="button" className="viewbar__button" aria-pressed={showSilhouette} onClick={toggleSilhouette}>
            Scale figure
          </button>
        </div>
      </main>

      <aside className="panel" ref={panelRef} aria-label="Configure" data-open={panelOpen}>
        {narrow && (
          <button
            type="button"
            className="panel__toggle"
            aria-expanded={sheetOpen}
            aria-controls="panel-body"
            onClick={() => setSheetOpen((open) => !open)}
          >
            <span className="panel__grip" aria-hidden="true" />
            <span className="panel__toggle-text">
              <span className="panel__toggle-title">Configure</span>
              <span className="panel__toggle-summary">
                {productName} · {formatSize(config.dimensions.width, config.dimensions.height)}
              </span>
            </span>
            <span className="panel__chevron" aria-hidden="true" />
          </button>
        )}

        <div className="panel__body" id="panel-body" hidden={!panelOpen}>
          <section className="section">
            <Segmented
              legend="Product"
              value={config.productType}
              options={[
                { value: 'door', label: 'Door' },
                { value: 'window', label: 'Window' },
              ]}
              onChange={setProductType}
            />
          </section>

          <SizePanel />

          {orderIssues.length > 0 && (
            <div className="messages messages--blocking" role="alert">
              {orderIssues.map((error) => (
                <p key={`${error.field}-${error.message}`}>{error.message}</p>
              ))}
            </div>
          )}
          {blockers.length > 0 && (
            <p className="messages messages--note" role="status">
              This size cannot be made, so the drawing still shows{' '}
              {formatSize(lastValid.dimensions.width, lastValid.dimensions.height)}.
            </p>
          )}
          {notices.length > 0 && (
            <div className="messages" role="status">
              {notices.map((notice) => (
                <p key={`${notice.field}-${notice.message}`}>{notice.message}</p>
              ))}
            </div>
          )}

          <section className="section section--quiet">
            <h2 className="section__title">Setting</h2>
            <Segmented
              legend="Show the product"
              hideLegend
              value={scene}
              options={[
                { value: 'studio', label: 'Studio' },
                { value: 'wall', label: 'In a wall' },
              ]}
              onChange={setScene}
            />
            {scene === 'wall' && (
              <Segmented
                legend="Wall"
                value={wallFinish}
                options={[
                  { value: 'brick', label: 'Brick' },
                  { value: 'render', label: 'Render' },
                ]}
                onChange={setWallFinish}
              />
            )}
            <p className="section__hint">
              {scene === 'wall' && config.productType === 'window'
                ? 'Shown at a nominal 900 mm cill. The setting changes the picture, never the order.'
                : 'The setting changes the picture, never the order.'}
            </p>
          </section>
        </div>

        <p className="panel__note">
          On-screen colours, finishes and obscure glass patterns are indicative only. Confirm against a physical
          sample before ordering.
        </p>
      </aside>
    </div>
  );
}
