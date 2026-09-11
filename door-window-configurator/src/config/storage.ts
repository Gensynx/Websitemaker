/**
 * Persistence (phase 1 has no backend).
 *
 * Precedence on load, in order:
 *   1. A configuration in the URL query string. A shared link must always win —
 *      someone opening a friend's link has to see the friend's door, not their
 *      own last session.
 *   2. The last configuration in localStorage.
 *   3. The default configuration.
 *
 * Writes to localStorage are best-effort. Private browsing and storage-full
 * both throw, and neither is worth surfacing to the customer.
 */

import type { ConfigState } from './types';
import { DEFAULT_CONFIG } from './defaults';
import { decodeConfig, encodeConfig } from './url';
import type { DecodeIssue } from './url';

// Not versioned: the stored value carries its own `v`, and migrations.ts
// upgrades a returning customer's saved configuration exactly as it upgrades a
// shared link.
const STORAGE_KEY = 'dwc.config';

export interface LoadResult {
  config: ConfigState;
  issues: DecodeIssue[];
  source: 'url' | 'storage' | 'default';
}

export function loadConfig(search: string, storage: Storage | null = safeStorage()): LoadResult {
  const params = new URLSearchParams(search);
  if (params.has('p') || params.has('v')) {
    const { config, issues } = decodeConfig(params);
    return { config, issues, source: 'url' };
  }

  const stored = tryRead(storage);
  if (stored !== null) {
    const { config, issues } = decodeConfig(stored);
    return { config, issues, source: 'storage' };
  }

  return { config: DEFAULT_CONFIG, issues: [], source: 'default' };
}

export function saveConfig(config: ConfigState, storage: Storage | null = safeStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, encodeConfig(config).toString());
  } catch {
    // Storage unavailable; the URL remains the durable copy.
  }
}

function tryRead(storage: Storage | null): string | null {
  try {
    return storage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
