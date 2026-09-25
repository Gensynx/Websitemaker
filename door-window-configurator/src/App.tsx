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
 * The panel has its five collapsible sections (Step 4.2), each with its
 * controls: Style and Hardware per product (Steps 6 and 7), Size (3), Colour
 * (5) and Glazing (7.5) shared.
 *
 * Operable without the canvas (Step 4.4): every control is a native form
 * control; a skip link leads straight to them; the preview carries a text
 * alternative written from the same words as the summary; and the canvas is
 * never a tab stop.
 */

import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { useConfigurator } from './state/store';
import { StaticElevation } from './viewer/StaticElevation';
import { SizePanel } from './ui/SizePanel';
import { Segmented } from './ui/Segmented';
import { Section } from './ui/Section';
import { ColourPanel } from './ui/ColourPanel';
import { DoorStylePanel } from './ui/DoorStylePanel';
import { DoorHardwarePanel } from './ui/DoorHardwarePanel';
import { WindowStylePanel } from './ui/WindowStylePanel';
import { WindowHardwarePanel } from './ui/WindowHardwarePanel';
import { GlazingPanel } from './ui/GlazingPanel';
import { SurroundPanel } from './ui/SurroundPanel';
import { ReviewDialog } from './ui/ReviewDialog';
import type { ReviewDialogHandle } from './ui/ReviewDialog';
import { copyText, shareUrl } from './output/share';
import { useInsets } from './ui/useInsets';
import { useSections } from './ui/useSections';
import { useSheetGesture } from './ui/useSheetGesture';
import type { SheetState } from './ui/useSheetGesture';
import { renderBlockers } from './config/validate';
import type { ValidationIssue } from './config/validate';
import { formatSize } from './config/units';
import { describeProduct, describeSection, productName as nameOf, sectionForField, sectionsFor } from './config/describe';
import type { SectionId } from './config/describe';
import type { CameraPreset } from './config/view';

const Viewer = lazy(() => import('./viewer/Viewer'));

/**
 * `spoken` is the accessible name. It starts with the visible label (WCAG
 * 2.5.3, label in name) and says what the button does — without it, "Hardware"
 * here and the Hardware section of the panel were two buttons of one name.
 */
const PRESETS: Array<{ id: CameraPreset; label: string; spoken: string }> = [
  { id: 'elevation', label: 'Elevation', spoken: 'Elevation view' },
  { id: 'three-quarter', label: 'Three-quarter', spoken: 'Three-quarter view' },
  { id: 'hardware', label: 'Hardware', spoken: 'Hardware close-up' },
];

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') ?? canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

const SECTIONS: Array<{ id: SectionId; title: string }> = [
  { id: 'style', title: 'Style' },
  { id: 'surround', title: 'Surround' },
  { id: 'size', title: 'Size' },
  { id: 'colour', title: 'Colour' },
  { id: 'glazing', title: 'Glazing' },
  { id: 'hardware', title: 'Hardware' },
];

/** Messages shown inside a section: errors stop an order, notes only inform. */
function Messages({ errors, notes }: { errors: string[]; notes: string[] }): JSX.Element | null {
  if (errors.length === 0 && notes.length === 0) return null;
  return (
    <>
      {errors.length > 0 && (
        <div className="messages messages--blocking" role="alert">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      {notes.length > 0 && (
        <div className="messages" role="status">
          {notes.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
    </>
  );
}

function bySection<T extends { field: string }>(items: T[]): Map<SectionId | null, T[]> {
  const grouped = new Map<SectionId | null, T[]>();
  for (const item of items) {
    const section = sectionForField(item.field);
    grouped.set(section, [...(grouped.get(section) ?? []), item]);
  }
  return grouped;
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
  const review = useRef<ReviewDialogHandle>(null);
  const [linkStatus, setLinkStatus] = useState('');
  // A copied link describes the configuration as it was; once it changes,
  // "Link copied" would be stale.
  useEffect(() => setLinkStatus(''), [config]);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState<SheetState>('closed');
  const sheetOpen = sheet !== 'closed';
  const sheetToggleRef = useRef<HTMLButtonElement>(null);
  const sheetGesture = useSheetGesture(sheet, setSheet);
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
  const panelRef = useRef<HTMLFormElement>(null);
  const insets = useInsets(
    { stage: stageRef, title: titleRef, viewbar: viewbarRef, panel: panelRef },
    `${narrow}-${sheet}-${validation.errors.length}-${notices.length}`,
  );

  const panelOpen = !narrow || sheetOpen;
  const productName = nameOf(config);
  const description = useMemo(() => describeProduct(deferred), [deferred]);

  // Every problem is shown in the section it can be fixed in. Size shows its
  // own inline against the field, so here it only counts towards the badge.
  const errors = bySection<ValidationIssue>(validation.errors);
  const nonOrderable = bySection<ValidationIssue>(validation.nonOrderable);
  const sectionNotices = bySection(notices);
  const issuesIn = (id: SectionId) => errors.get(id)?.length ?? 0;
  const sections = useSections(SECTIONS.map((section) => section.id), ['size'], (id) => issuesIn(id) > 0);

  const sectionMessages = (id: SectionId): ReactNode => {
    const blocking = id === 'size' ? [] : (errors.get(id) ?? []).map((issue) => issue.message);
    const notes = [...(nonOrderable.get(id) ?? []), ...(sectionNotices.get(id) ?? [])].map((issue) => issue.message);
    return <Messages errors={blocking} notes={notes} />;
  };
  const generalErrors = (errors.get(null) ?? []).map((issue) => issue.message);
  const generalNotes = [...(nonOrderable.get(null) ?? []), ...(sectionNotices.get(null) ?? [])].map((issue) => issue.message);

  return (
    <main className="shell" data-scene={scene}>
      <a className="skip" href="#configure">
        Skip to the configuration
      </a>

      <section className="stage" ref={stageRef} aria-label="Preview">
        {/*
          The picture, as one image with a text alternative. Everything inside
          — the SVG elevation, the WebGL canvas, the floating dimension labels
          — is presentational to assistive technology; the description says
          what they show, in the same words as the panel.
        */}
        <div className="stage__picture" role="img" aria-label={description}>
        <div
          className="stage__poster"
          data-hidden={webgl && ready}
          style={{ padding: `${insets.top}px ${insets.right}px ${insets.bottom}px ${insets.left}px` }}
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
        </div>

        <header className="title" ref={titleRef}>
          <p className="eyebrow">Configurator</p>
          <h1>{productName}</h1>
          {/* Not a live region: it changes on every keystroke in the size fields, which already say the value. */}
          <p className="lede">{formatSize(config.dimensions.width, config.dimensions.height)}</p>
        </header>

        <div className="viewbar" ref={viewbarRef} role="group" aria-label="View">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="viewbar__button"
              aria-label={preset.spoken}
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
      </section>

      <form
        className="panel"
        id="configure"
        ref={panelRef}
        aria-label="Configure"
        data-open={panelOpen}
        data-sheet={narrow ? sheet : undefined}
        tabIndex={-1}
        noValidate
        // Nothing submits from here: Enter in a size field must not reload the page.
        onSubmit={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          // Escape folds the bottom sheet away and returns focus to its handle.
          if (event.key === 'Escape' && narrow && sheetOpen) {
            setSheet('closed');
            sheetToggleRef.current?.focus();
          }
        }}
      >
        {narrow && (
          <button
            type="button"
            className="panel__toggle"
            ref={sheetToggleRef}
            aria-expanded={sheetOpen}
            aria-controls="panel-body"
            {...sheetGesture}
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
          <div className="panel__group">
            <Segmented
              legend="Product"
              value={config.productType}
              options={[
                { value: 'door', label: 'Door' },
                { value: 'window', label: 'Window' },
              ]}
              onChange={setProductType}
            />
          </div>

          <Messages errors={generalErrors} notes={generalNotes} />

          {SECTIONS.filter((section) => sectionsFor(config.productType).includes(section.id)).map((section) => {
            const description = describeSection(section.id, config);
            return (
              <Section
                key={section.id}
                id={`section-${section.id}`}
                title={section.title}
                summary={description.summary}
                issues={issuesIn(section.id)}
                flag={
                  (nonOrderable.get(section.id)?.length ?? 0) > 0
                    ? 'Not orderable'
                    : (sectionNotices.get(section.id)?.length ?? 0) > 0
                      ? 'See note'
                      : undefined
                }
                open={sections.isOpen(section.id)}
                onToggle={() => sections.toggle(section.id)}
              >
                {sectionMessages(section.id)}
                {section.id === 'size' ? (
                  <>
                    <SizePanel />
                    {blockers.length > 0 && (
                      <p className="messages messages--note" role="status">
                        This size cannot be made, so the drawing still shows{' '}
                        {formatSize(lastValid.dimensions.width, lastValid.dimensions.height)}.
                      </p>
                    )}
                  </>
                ) : section.id === 'colour' ? (
                  <ColourPanel />
                ) : section.id === 'glazing' ? (
                  <GlazingPanel config={config} />
                ) : section.id === 'surround' ? (
                  config.productType === 'door' && <SurroundPanel config={config} />
                ) : section.id === 'style' ? (
                  config.productType === 'door' ? <DoorStylePanel config={config} /> : <WindowStylePanel config={config} />
                ) : config.productType === 'door' ? (
                  <DoorHardwarePanel config={config} />
                ) : (
                  <WindowHardwarePanel config={config} />
                )}
              </Section>
            );
          })}

          <section className="panel__group panel__group--quiet" aria-labelledby="setting-title">
            <h2 className="panel__group-title" id="setting-title">
              Setting
            </h2>
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

        <div className="panel__actions">
          <button
            type="button"
            className="button button--quiet"
            onClick={async () => {
              const ok = await copyText(shareUrl(config, window.location));
              setLinkStatus(ok ? 'Link copied.' : 'Could not copy the link. Use Review and enquire to see it.');
            }}
          >
            Copy link
          </button>
          <button type="button" className="button" onClick={(event) => review.current?.open(event.currentTarget)}>
            Review and enquire
          </button>
          <p className="panel__actions-status" role="status">
            {linkStatus}
          </p>
        </div>

        <p className="panel__note">
          On-screen colours, finishes and obscure glass patterns are indicative only. Confirm against a physical
          sample before ordering.
        </p>
      </form>

      {/* Outside the panel: the dialog has its own form, and forms cannot nest. */}
      <ReviewDialog ref={review} config={config} />
    </main>
  );
}
