/**
 * The configuration as it would actually be made.
 *
 * The configuration a customer builds can hold choices that do not apply to
 * what they finally chose — kept on purpose, so switching back restores them.
 * The share link carries them (it reopens exactly what the customer saw). An
 * ORDER must not: it states what is fitted.
 *
 *   - A fully glazed leaf has nowhere to fix a letterplate, knocker or
 *     spyhole (Step 6), so none is fitted.
 */

import type { ConfigState } from '../config/types';

export function fittedConfig(config: ConfigState): ConfigState {
  if (config.productType === 'door' && config.style.id === 'full-glazed') {
    return { ...config, hardware: { ...config.hardware, letterplate: false, knocker: null, spyhole: false } };
  }
  return config;
}
