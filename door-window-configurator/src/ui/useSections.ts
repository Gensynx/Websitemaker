/**
 * Which panel sections are open. UI state, not configuration: it is never in
 * a link or an order (types.ts, rule 5).
 *
 * Remembered for the browser tab in sessionStorage — a per-viewer convenience
 * only, so every read and write is guarded and the panel works the same
 * without it (private windows, blocked storage).
 *
 * A section with a problem in it starts open, so a link that arrives with
 * something to fix does not hide it behind a collapsed header.
 */

import { useCallback, useEffect, useState } from 'react';

const KEY = 'configurator.sections.open';

function readStored(): string[] | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : null;
  } catch {
    return null;
  }
}

export function useSections<T extends string>(
  all: readonly T[],
  defaults: readonly T[],
  hasProblem: (id: T) => boolean,
): { isOpen: (id: T) => boolean; toggle: (id: T) => void } {
  const [open, setOpen] = useState<Set<T>>(() => {
    const stored = readStored();
    const initial = new Set<T>(stored === null ? defaults : all.filter((id) => stored.includes(id)));
    for (const id of all) if (hasProblem(id)) initial.add(id);
    return initial;
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify([...open]));
    } catch {
      // Storage unavailable: the panel still works, it just will not remember.
    }
  }, [open]);

  const toggle = useCallback((id: T) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { isOpen: (id: T) => open.has(id), toggle };
}
