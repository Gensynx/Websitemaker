/**
 * The shareable link (Step 8.2): the whole configuration in the query
 * string, decoded independently by anyone who opens it (url.ts).
 *
 * The configuration only. The camera view, the wall setting and which panel
 * sections are open are the sender's viewing state, not the product, and
 * the recipient starts from the default view.
 */

import type { ConfigState } from '../config/types';
import { configToUrl } from '../config/url';

export function shareUrl(config: ConfigState, location: { origin: string; pathname: string }): string {
  return configToUrl(config, `${location.origin}${location.pathname}`);
}

/** Copies text, with a fallback for browsers or contexts without the async clipboard. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context: fall through to the old way.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const done = document.execCommand('copy');
    area.remove();
    return done;
  } catch {
    return false;
  }
}
