import { describe, expect, it } from 'vitest';
import {
  colourOn,
  insideMatches,
  withColour,
  withExternalFinish,
  withInsideMatching,
  withInternalFinish,
} from './colourEdits';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from './defaults';
import { buildEnquiry, mintQuotable, validateConfig } from './validate';
import { encodeConfig, decodeConfig } from './url';
import { resolveInternalColour, resolveInternalFinish } from './types';

describe('Step 5.2: an explore colour never feeds a quote', () => {
  for (const [name, base] of [['door', DEFAULT_DOOR], ['window', DEFAULT_WINDOW]] as const) {
    for (const side of ['external', 'internal'] as const) {
      it(`${name}, ${side}: explore blocks the quote; an offered colour restores it`, () => {
        expect(mintQuotable(base)).not.toBeNull();

        const explored = withColour(side === 'internal' ? withInsideMatching(base, false) : base, side, {
          mode: 'explore',
          hex: '#8a2be2',
        });
        expect(mintQuotable(explored)).toBeNull();
        // Not an error — the enquiry can still be sent — but never quotable.
        expect(validateConfig(explored).errors).toEqual([]);
        expect(buildEnquiry(explored).kind).toBe('non-orderable');

        const back = withColour(explored, side, { mode: 'ral', code: 'RAL7016' });
        expect(mintQuotable(back)).not.toBeNull();
        expect(buildEnquiry(back).kind).toBe('quotable');
      });
    }
  }

  it('an explore colour survives a shared link, and is still not quotable on arrival', () => {
    const explored = withColour(DEFAULT_DOOR, 'external', { mode: 'explore', hex: '#123abc' });
    const decoded = decodeConfig(`?${encodeConfig(explored).toString()}`).config;
    expect(decoded.colour.external).toEqual({ mode: 'explore', hex: '#123abc' });
    expect(mintQuotable(decoded)).toBeNull();
  });
});

describe('inside colour and finish', () => {
  it('going "different inside" changes nothing visible until something is picked', () => {
    const base = withExternalFinish(withColour(DEFAULT_DOOR, 'external', { mode: 'ral', code: 'RAL3005' }), 'woodgrain-foil');
    expect(insideMatches(base)).toBe(true);
    const separate = withInsideMatching(base, false);
    expect(insideMatches(separate)).toBe(false);
    expect(resolveInternalColour(separate.colour)).toEqual(resolveInternalColour(base.colour));
    expect(resolveInternalFinish(separate.finish)).toBe(resolveInternalFinish(base.finish));
  });

  it('going back to "same as outside" makes both colour and finish follow the outside', () => {
    let config = withInsideMatching(DEFAULT_DOOR, false);
    config = withColour(config, 'internal', { mode: 'ral', code: 'RAL9016' });
    config = withInternalFinish(config, 'textured');
    config = withInsideMatching(config, true);
    expect(config.colour.internal).toEqual({ mode: 'match' });
    expect(config.finish.internal).toBe('match');
    expect(colourOn(config, 'internal')).toEqual(config.colour.external);
  });

  it('finish is a separate selection from colour (Step 5.3)', () => {
    const before = DEFAULT_WINDOW;
    const after = withExternalFinish(before, 'textured');
    expect(after.colour).toEqual(before.colour);
    expect(after.finish.external).toBe('textured');
  });
});
