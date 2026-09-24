/**
 * View state in the URL (decision 14).
 *
 * Only the camera preset travels in a shared link, in its own `view`
 * parameter, decoded independently of ConfigState. Orbit position and the
 * human silhouette are deliberately excluded: they are per-session UI state,
 * and encoding a free orbit position would make two links to the same product
 * look different for no reason.
 *
 * `decodeView` never consults ConfigState and `decodeConfig` ignores `view`,
 * so a malformed view parameter cannot damage a configuration and a
 * configuration change cannot silently move the camera.
 */

export type CameraPreset = 'elevation' | 'three-quarter' | 'hardware';

/**
 * What the product is shown against. View state only: like orbit position and
 * the scale figure, it is not part of the configuration and does not travel in
 * a shared link (decision 14). Two people looking at the same link are looking
 * at the same product, whatever backdrop each prefers.
 */
export type SceneMode = 'studio' | 'wall';
export type WallFinish = 'render' | 'brick';

/**
 * Elevation, not three-quarter (Step 2.6). Alignment, proportion and sightline
 * balance can only be judged square-on; a three-quarter opener flatters the
 * product and hides exactly what a customer needs to check first.
 */
export const DEFAULT_CAMERA_PRESET: CameraPreset = 'elevation';

const CODES: Record<CameraPreset, string> = {
  elevation: 'el',
  'three-quarter': 'tq',
  hardware: 'hw',
};

const BY_CODE = new Map<string, CameraPreset>(
  (Object.entries(CODES) as Array<[CameraPreset, string]>).map(([preset, code]) => [code, preset]),
);

export function encodeView(preset: CameraPreset, params: URLSearchParams): URLSearchParams {
  params.set('view', CODES[preset]);
  return params;
}

export interface ViewDecodeResult {
  preset: CameraPreset;
  /** True where a `view` value was present but not recognised. */
  fellBack: boolean;
}

export function decodeView(input: URLSearchParams | string): ViewDecodeResult {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const raw = params.get('view');
  if (raw === null) return { preset: DEFAULT_CAMERA_PRESET, fellBack: false };
  const preset = BY_CODE.get(raw);
  if (preset === undefined) return { preset: DEFAULT_CAMERA_PRESET, fellBack: true };
  return { preset, fellBack: false };
}
