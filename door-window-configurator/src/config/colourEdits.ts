/**
 * The edits the colour panel makes, as pure functions over ConfigState.
 *
 * Kept out of the component so the rules that matter — an explore colour
 * never reaches a quote, and choosing "different inside" changes nothing you
 * can see until you pick something — are tested without a browser.
 */

import type { ColourSelection, ConfigState, InternalColour } from './types';
import { resolveInternalColour, resolveInternalFinish } from './types';
import type { Finish } from './material';

export type Side = 'external' | 'internal';

export function withExternalColour(config: ConfigState, colour: ColourSelection): ConfigState {
  return { ...config, colour: { ...config.colour, external: colour } };
}

export function withInternalColour(config: ConfigState, colour: InternalColour): ConfigState {
  return { ...config, colour: { ...config.colour, internal: colour } };
}

export function withColour(config: ConfigState, side: Side, colour: ColourSelection): ConfigState {
  return side === 'external' ? withExternalColour(config, colour) : withInternalColour(config, colour);
}

export function withExternalFinish(config: ConfigState, finish: Finish): ConfigState {
  return { ...config, finish: { ...config.finish, external: finish } };
}

export function withInternalFinish(config: ConfigState, finish: Finish | 'match'): ConfigState {
  return { ...config, finish: { ...config.finish, internal: finish } };
}

/** Whether the inside simply follows the outside, in both colour and finish. */
export function insideMatches(config: ConfigState): boolean {
  return config.colour.internal.mode === 'match' && config.finish.internal === 'match';
}

/**
 * "Same as outside" or "different inside". Going different starts the inside
 * from exactly what it already looked like, so the switch itself changes
 * nothing on screen or in the order; only the next pick does.
 */
export function withInsideMatching(config: ConfigState, match: boolean): ConfigState {
  if (match) {
    return { ...config, colour: { ...config.colour, internal: { mode: 'match' } }, finish: { ...config.finish, internal: 'match' } };
  }
  return {
    ...config,
    colour: { ...config.colour, internal: resolveInternalColour(config.colour) },
    finish: { ...config.finish, internal: resolveInternalFinish(config.finish) },
  };
}

/** The colour currently shown on one side, resolving "same as outside". */
export function colourOn(config: ConfigState, side: Side): ColourSelection {
  return side === 'external' ? config.colour.external : resolveInternalColour(config.colour);
}
