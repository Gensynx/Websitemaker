/**
 * Schema migration policy and chain.
 *
 * POLICY
 *
 * 1. `CONFIG_SCHEMA_VERSION` increments only when an existing field changes
 *    meaning or is removed. Adding a style, a RAL shade, a material or a new
 *    optional field is additive: older links stay valid and are not migrated,
 *    because the decoder already falls back per field.
 *
 * 2. A key code is never reused for a different meaning. A retired code stays
 *    retired and is listed in RETIRED_KEYS below. This is the rule that makes
 *    migration tractable: without it, a v1 link and a v3 link can disagree
 *    about what `c=RAL7016` means and neither the decoder nor a human reading
 *    a support ticket can tell which is which.
 *
 * 3. Migration runs on the raw query parameters, before any field is decoded,
 *    as a chain of single-version steps: v1 → v2 → v3. Each step is small,
 *    independently testable, and never removed once shipped. Old links must
 *    keep working indefinitely; they are in customers' emails and in our own
 *    quotes.
 *
 * 4. A migration may not silently change what a customer configured. Where an
 *    old configuration cannot be expressed in the new schema, the step decodes
 *    to the nearest equivalent and records an issue, which the UI surfaces as
 *    a non-blocking notice. Losing a bay window is something the customer is
 *    told about, not something that happens quietly.
 *
 * 5. A link from a NEWER version than this build is decoded best-effort: the
 *    fields this build understands are read and the rest ignored, with a
 *    notice. It is never rejected — the customer would just see an error page
 *    for a link that works fine for everyone on the current deploy.
 *
 * 6. localStorage entries carry the same version marker and run through the
 *    same chain, so a returning customer is migrated exactly as a link is.
 */

import { CONFIG_SCHEMA_VERSION } from './types';

export interface MigrationIssue {
  key: string;
  reason: string;
}

/** Key codes that have been retired and must never be reused. */
export const RETIRED_KEYS: ReadonlyArray<{ key: string; retiredIn: number; note: string }> = [
  { key: 'c', retiredIn: 2, note: 'v1 single colour; replaced by ce (external) and ci (internal).' },
  { key: 'nm', retiredIn: 2, note: 'v1 house numerals; deferred out of phase 1.' },
  { key: 'bs', retiredIn: 2, note: 'v1 bay segment shares; bay deferred out of phase 1.' },
  { key: 'ca', retiredIn: 2, note: 'v1 bay corner angle.' },
  { key: 'rd', retiredIn: 2, note: 'v1 bay return depth.' },
  { key: 'f', retiredIn: 3, note: 'v2 single finish; replaced by fe (external) and fi (internal).' },
];

/**
 * Why `g` is NOT retired, though glazing went from two axes to three.
 *
 * Rule 2 retires a key whose MEANING changed. `g` encoded appearance and pane
 * count in v1 and encodes exactly that in v3: `c.2` decodes identically in
 * both. The third axis was given its own key, `sg`, precisely so that `g` did
 * not have to change — which is what the rule is for. Had safety been appended
 * as a fourth field of `g`, `g` would have had to be retired and replaced.
 *
 * The same reasoning covers the per-pane safety overrides added in v3. They
 * are optional trailing fields on tokens that were already positional
 * (`sl`, `sr`, `tl`, `ap`, and the cell tokens inside `gd`), so a v2 value
 * parses in v3 to the same configuration, with the override reading as
 * "inherit". Additive, therefore no retirement.
 *
 * `f`, by contrast, genuinely changed: it named THE finish, and there are now
 * two. Retired and replaced by `fe` / `fi`, exactly as `c` was.
 */

type MigrationStep = (params: URLSearchParams, issues: MigrationIssue[]) => URLSearchParams;

/** Keyed by the version being migrated FROM. */
const STEPS: Record<number, MigrationStep> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
};

/**
 * Runs the chain up to the current version. Returns the parameters as this
 * build expects them, plus anything the customer should be told.
 */
export function migrateParams(input: URLSearchParams): {
  params: URLSearchParams;
  issues: MigrationIssue[];
} {
  const issues: MigrationIssue[] = [];
  let params = new URLSearchParams(input.toString());

  const declared = Number(params.get('v') ?? CONFIG_SCHEMA_VERSION);
  let version = Number.isFinite(declared) ? declared : CONFIG_SCHEMA_VERSION;

  if (version > CONFIG_SCHEMA_VERSION) {
    issues.push({
      key: 'v',
      reason: `This link was created with a newer version of the configurator (v${version}). Options this version does not recognise have been left at their defaults.`,
    });
    return { params, issues };
  }

  while (version < CONFIG_SCHEMA_VERSION) {
    const step = STEPS[version];
    if (step === undefined) {
      issues.push({
        key: 'v',
        reason: `No migration exists from v${version}; the configuration was reset to the defaults.`,
      });
      return { params: new URLSearchParams(), issues };
    }
    params = step(params, issues);
    version += 1;
    params.set('v', String(version));
  }

  return { params, issues };
}

/**
 * v1 → v2.
 *   - `c` (single colour) becomes `ce` (external) with `ci=match`.
 *   - `m` (frame material) did not exist; left absent so the decoder applies
 *     the default, and the customer is told the material needs confirming.
 *   - Safety glazing did not exist; left absent, so validation decides whether
 *     a critical location forces it.
 *   - Bay windows were removed from the catalogue; a v1 bay decodes to a
 *     casement and says so.
 *   - House numerals were removed; a v1 `nm` is dropped and said so.
 */
function migrateV1toV2(params: URLSearchParams, issues: MigrationIssue[]): URLSearchParams {
  const next = new URLSearchParams(params.toString());

  const colour = next.get('c');
  if (colour !== null) {
    next.delete('c');
    next.set('ce', colour);
    next.set('ci', 'match');
  }

  if (!next.has('m')) {
    issues.push({
      key: 'm',
      reason: 'This link predates frame material being configurable. Please confirm the material.',
    });
  }

  if (next.get('p') === 'w' && next.get('s') === 'by') {
    next.set('s', 'cs');
    for (const key of ['bs', 'ca', 'rd']) next.delete(key);
    for (let index = 0; index < 8; index += 1) next.delete(`bg${index}`);
    issues.push({
      key: 's',
      reason: 'Bay windows are not currently offered. This link has been opened as a casement.',
    });
  }

  if (next.has('nm')) {
    next.delete('nm');
    issues.push({
      key: 'nm',
      reason: 'House numerals are not currently offered, so they have been removed from this link.',
    });
  }

  return next;
}

/**
 * v2 → v3.
 *   - `f` (single finish) becomes `fe` (external) with `fi=m` (match).
 *   - Per-pane safety overrides are additive trailing fields; nothing to do.
 */
function migrateV2toV3(params: URLSearchParams, _issues: MigrationIssue[]): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  const finish = next.get('f');
  if (finish !== null) {
    next.delete('f');
    next.set('fe', finish);
    next.set('fi', 'm');
  }
  return next;
}
