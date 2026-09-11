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

export const DEFAULT_CAMERA_PRESET: CameraPreset = 'three-quarter';

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
