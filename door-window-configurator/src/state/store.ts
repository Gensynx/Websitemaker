/**
 * Configurator store.
 *
 * ONE pipeline, no side doors. Every mutation goes through `commit`, which
 * reconciles against the frame material, enforces safety glazing at critical
 * locations, and then persists. There is deliberately no setter that writes
 * `config` directly: reconciliation running only on decode was the gap, and
 * the fix is structural rather than a rule people have to remember.
 *
 * Persistence is throttled. Continuous dimension input fires on every
 * keystroke and drag frame; the URL and localStorage are written on a trailing
 * edge so that neither history nor storage is hammered mid-interaction.
 */

import { create } from 'zustand';
import type { ConfigState, ProductType } from '../config/types';
import type { FrameMaterial } from '../config/material';
import type { Mm } from '../config/units';
import { defaultFor } from '../config/defaults';
import { encodeConfig, decodeConfig } from '../config/url';
import type { DecodeIssue } from '../config/url';
import { enforceSafetyGlazing } from '../config/safety';
import { reconcileWithMaterial, validateConfig } from '../config/validate';
import type { ValidationResult } from '../config/validate';
import { loadConfig, saveConfig } from '../config/storage';
import type { CameraPreset } from '../config/view';
import { decodeView, DEFAULT_CAMERA_PRESET, encodeView } from '../config/view';

export interface Notice {
  /** Where it came from, so the UI can place it beside the right control. */
  field: string;
  message: string;
}

export interface ConfiguratorState {
  config: ConfigState;
  /** Non-blocking messages from the last commit: reconciliation, safety, decode. */
  notices: Notice[];
  /** Blocking problems. Step 3.4: an unmanufacturable size never renders. */
  validation: ValidationResult;
  /**
   * The last configuration that passed validation. The viewer renders this, so
   * an invalid size shows the previous good model plus an inline reason rather
   * than an empty canvas.
   */
  lastValid: ConfigState;

  camera: CameraPreset;
  showSilhouette: boolean;

  setProductType: (productType: ProductType) => void;
  setMaterial: (material: FrameMaterial) => void;
  setDimensions: (width: Mm, height: Mm) => void;
  /** Generic edit. The mutator returns the next configuration. */
  edit: (mutator: (config: ConfigState) => ConfigState) => void;

  setCamera: (preset: CameraPreset) => void;
  resetView: () => void;
  toggleSilhouette: () => void;
  dismissNotices: () => void;
}

/* ------------------------------------------------------------------ *
 * Persistence, trailing-edge throttled
 * ------------------------------------------------------------------ */

const PERSIST_INTERVAL_MS = 250;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function persist(config: ConfigState, camera: CameraPreset): void {
  if (persistTimer !== null) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const params = encodeConfig(config);
    encodeView(camera, params);
    saveConfig(config);
    if (typeof history !== 'undefined' && typeof location !== 'undefined') {
      // replaceState, not pushState: configuring is one continuous act, and a
      // back button that unwinds every slider nudge is hostile.
      history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
    }
  }, PERSIST_INTERVAL_MS);
}

/** Exposed for tests, which must not wait 250 ms to observe a write. */
export function flushPersist(): void {
  if (persistTimer === null) return;
  clearTimeout(persistTimer);
  persistTimer = null;
}

/* ------------------------------------------------------------------ *
 * The pipeline
 * ------------------------------------------------------------------ */

interface Committed {
  config: ConfigState;
  notices: Notice[];
  validation: ValidationResult;
}

/**
 * The single path a configuration takes to become state. Exported so the
 * pipeline can be tested without a store, and so nothing needs to reimplement
 * the order of operations.
 */
export function commit(next: ConfigState, carried: Notice[] = []): Committed {
  const reconciled = reconcileWithMaterial(next);
  const enforced = enforceSafetyGlazing(reconciled.config);

  const notices: Notice[] = [
    ...carried,
    ...reconciled.issues.map((issue) => ({ field: issue.field, message: issue.message })),
    ...enforced.notices.map((notice) => ({ field: `glazing.safety.${notice.paneId}`, message: notice.message })),
  ];

  return { config: enforced.config, notices, validation: validateConfig(enforced.config) };
}

function toNotices(issues: DecodeIssue[]): Notice[] {
  return issues.map((issue) => ({ field: issue.key, message: issue.reason }));
}

/* ------------------------------------------------------------------ *
 * Store
 * ------------------------------------------------------------------ */

export function createInitialState(search: string): Committed & { camera: CameraPreset } {
  const loaded = loadConfig(search);
  const committed = commit(loaded.config, toNotices(loaded.issues));
  const camera = loaded.source === 'url' ? decodeView(search).preset : DEFAULT_CAMERA_PRESET;
  return { ...committed, camera };
}

export const useConfigurator = create<ConfiguratorState>((set, get) => {
  const initial = createInitialState(typeof location === 'undefined' ? '' : location.search);

  function apply(next: ConfigState, carried: Notice[] = []): void {
    const committed = commit(next, carried);
    const lastValid = committed.validation.errors.length === 0 ? committed.config : get().lastValid;
    set({ ...committed, lastValid });
    persist(committed.config, get().camera);
  }

  return {
    config: initial.config,
    notices: initial.notices,
    validation: initial.validation,
    lastValid: initial.validation.errors.length === 0 ? initial.config : defaultFor(initial.config.productType),
    camera: initial.camera,
    showSilhouette: false,

    setProductType: (productType) => {
      if (get().config.productType === productType) return;
      // Switching product is a fresh start: a door's style, surround and
      // handing have no window equivalent, so carrying them over would mean
      // inventing a mapping nobody asked for.
      apply(defaultFor(productType));
    },

    setMaterial: (material) => apply({ ...get().config, material }),

    setDimensions: (width, height) =>
      apply({ ...get().config, dimensions: { width, height } }),

    edit: (mutator) => apply(mutator(get().config)),

    setCamera: (camera) => {
      set({ camera });
      persist(get().config, camera);
    },
    resetView: () => {
      set({ camera: DEFAULT_CAMERA_PRESET });
      persist(get().config, DEFAULT_CAMERA_PRESET);
    },
    toggleSilhouette: () => set({ showSilhouette: !get().showSilhouette }),
    dismissNotices: () => set({ notices: [] }),
  };
});

/** Re-exported so callers do not reach past the store for a decode. */
export { decodeConfig };
