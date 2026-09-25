import { describe, expect, it } from 'vitest';
import { buildSummary, INDICATIVE_NOTE, summaryText } from './summary';
import { fittedConfig } from './fitted';
import { shareUrl } from './share';
import { buildEnquiryRequest, EMPTY_CONTACT, submitEnquiry, validateContact } from './enquiry';
import type { ContactDetails } from './enquiry';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from '../config/defaults';
import { decodeConfig } from '../config/url';
import { HANDING_STATEMENT } from '../config/describe';
import { withDoorStyle, withFurniture, withSideLights } from '../config/doorEdits';
import { withColour } from '../config/colourEdits';
import { withCellOpening, withGridSize } from '../config/windowEdits';
import type { ConfigState, DoorConfigState, WindowConfigState } from '../config/types';

const LOCATION = { origin: 'https://example.test', pathname: '/configure' };
const CONTACT: ContactDetails = { ...EMPTY_CONTACT, name: ' Ada Lovelace ', email: 'ada@example.com', postcode: 'sw1a 1aa', consent: true };

describe('Step 8.1: the summary lists every selected option', () => {
  it('has a group for every section, and the statements an order carries', () => {
    const summary = buildSummary(DEFAULT_DOOR);
    expect(summary.groups.map((g) => g.title)).toEqual(['Size', 'Style', 'Colour and finish', 'Glazing', 'Hardware']);
    expect(summary.notes).toContain(HANDING_STATEMENT);
    expect(summary.notes).toContain(INDICATIVE_NOTE);
    expect(summary.status.kind).toBe('quotable');
  });

  it('lists every window light individually', () => {
    const window = withCellOpening(withGridSize(DEFAULT_WINDOW, 3, 2), 2, 'side-hung-right') as WindowConfigState;
    const style = buildSummary(window).groups.find((g) => g.title === 'Style')!;
    const lights = style.lines.filter((line) => line.label.startsWith('Light '));
    expect(lights).toHaveLength(6);
    expect(lights[2]).toEqual({ label: 'Light 3 (top row, right)', value: 'Side-hung (hinged right); no bars' });
    // The per-light lines replace the roll-up, in its place: before the frame.
    const labels = style.lines.map((line) => line.label);
    expect(labels).not.toContain('Openings');
    expect(labels).not.toContain('Glazing bars');
    expect(labels.indexOf('Light 6 (bottom row, right)')).toBeLessThan(labels.indexOf('Frame'));
  });

  it('says when a window safety requirement depends on the cill height', () => {
    expect(buildSummary(DEFAULT_WINDOW).notes.some((note) => /cill/.test(note))).toBe(true);
  });

  it('names the panes that need safety glass, with the reason', () => {
    const set = withSideLights({ ...DEFAULT_DOOR, dimensions: { width: 1800, height: 2100 } }, 'both');
    const notes = buildSummary(set).notes.join(' ');
    expect(notes).toMatch(/side light.*safety glass is required/i);
  });

  it('an explore colour is non-orderable, and an unmakeable size is invalid — each with its reason', () => {
    const explored = withColour(DEFAULT_DOOR, 'external', { mode: 'explore', hex: '#123456' });
    const s1 = buildSummary(explored).status;
    expect(s1.kind).toBe('non-orderable');
    expect(s1.kind !== 'quotable' && s1.reasons[0]).toMatch(/cannot be ordered/);
    const s2 = buildSummary({ ...DEFAULT_DOOR, dimensions: { width: 5000, height: 2100 } }).status;
    expect(s2.kind).toBe('invalid');
  });

  it('plain text carries every group, every note and the link', () => {
    const text = summaryText(buildSummary(DEFAULT_DOOR), 'https://example.test/?x');
    expect(text).toContain('SIZE');
    expect(text).toContain('HARDWARE');
    expect(text).toContain(INDICATIVE_NOTE);
    expect(text).toContain('Configuration link: https://example.test/?x');
  });
});

describe('what is fitted, not everything stored', () => {
  it('a fully glazed door carries no furniture in the order, though the link keeps it', () => {
    const withPlate = withFurniture(withFurniture(DEFAULT_DOOR, 'letterplate', true), 'knocker', true);
    const glazed = withDoorStyle(withPlate, 'full-glazed');
    const fitted = fittedConfig(glazed) as DoorConfigState;
    expect(fitted.hardware.letterplate).toBe(false);
    expect(fitted.hardware.knocker).toBeNull();
    const request = buildEnquiryRequest(glazed, CONTACT, {}, shareUrl(glazed, LOCATION));
    expect(request.payload.kind === 'quotable' && (request.payload.config as DoorConfigState).hardware.letterplate).toBe(false);
    // The link reopens what the customer saw, stored choices included.
    const reopened = decodeConfig(new URL(request.shareUrl).search).config as DoorConfigState;
    expect(reopened.hardware.letterplate).toBe(true);
  });
});

describe('Step 8.2: the share link encodes the full configuration', () => {
  for (const [name, config] of [
    ['door set', withSideLights({ ...DEFAULT_DOOR, dimensions: { width: 1800, height: 2100 } }, 'both')],
    ['window', withCellOpening(withGridSize(DEFAULT_WINDOW, 3, 2), 4, 'top-hung')],
    ['explore colour', withColour(DEFAULT_WINDOW, 'external', { mode: 'explore', hex: '#abcdef' })],
  ] as Array<[string, ConfigState]>) {
    it(`${name}: decodes to the same configuration, with no issues`, () => {
      const url = shareUrl(config, LOCATION);
      expect(url.startsWith('https://example.test/configure?')).toBe(true);
      const decoded = decodeConfig(new URL(url).search);
      expect(decoded.issues).toEqual([]);
      expect(decoded.config).toEqual(config);
    });
  }
});

describe('Step 8.3: the enquiry', () => {
  it('asks for what it needs, in form order, each saying what to do', () => {
    const errors = validateContact({ ...EMPTY_CONTACT, email: 'not-an-email', phone: '123', postcode: 'nope' }, 'tall');
    expect(errors.map((e) => e.field)).toEqual(['name', 'email', 'phone', 'postcode', 'cill', 'consent']);
    expect(validateContact(CONTACT, '')).toEqual([]);
    expect(validateContact(CONTACT, '850')).toEqual([]);
  });

  it('builds a request with the fitted payload, the summary, the link and tidy contact details', () => {
    const request = buildEnquiryRequest(DEFAULT_WINDOW, CONTACT, { cillHeightAboveFloor: 850 }, 'https://example.test/?x', new Date('2026-09-25T10:00:00Z'));
    expect(request.contact.name).toBe('Ada Lovelace');
    expect(request.contact.postcode).toBe('SW1A 1AA');
    expect(request.payload.kind).toBe('quotable');
    expect(request.payload.kind !== 'invalid' && request.payload.installation.cillHeightAboveFloor).toBe(850);
    expect(request.summary).toContain('Configuration link: https://example.test/?x');
    expect(request.createdAt).toBe('2026-09-25T10:00:00.000Z');
  });

  it('STUB: with no endpoint nothing is sent, and it says so', async () => {
    const request = buildEnquiryRequest(DEFAULT_DOOR, CONTACT, {}, 'https://example.test/?x');
    let called = false;
    const result = await submitEnquiry(request, null, async () => {
      called = true;
      return new Response(null, { status: 200 });
    });
    expect(result.status).toBe('not-sent');
    expect(called).toBe(false);
  });

  it('with an endpoint it POSTs JSON once, and reports failure honestly', async () => {
    const request = buildEnquiryRequest(DEFAULT_DOOR, CONTACT, {}, 'https://example.test/?x');
    const calls: Array<[string, RequestInit | undefined]> = [];
    const ok = await submitEnquiry(request, 'https://api.example.test/enquiry', async (url, init) => {
      calls.push([String(url), init]);
      return new Response(null, { status: 201 });
    });
    expect(ok.status).toBe('sent');
    expect(calls).toHaveLength(1);
    expect(JSON.parse(String(calls[0]?.[1]?.body)).contact.email).toBe('ada@example.com');
    const failed = await submitEnquiry(request, 'https://api.example.test/enquiry', async () => new Response(null, { status: 500 }));
    expect(failed.status).toBe('failed');
  });

  it('never submits a configuration that cannot be made', async () => {
    const request = buildEnquiryRequest({ ...DEFAULT_DOOR, dimensions: { width: 5000, height: 2100 } }, CONTACT, {}, 'x');
    expect((await submitEnquiry(request, 'https://api.example.test/enquiry')).status).toBe('blocked');
  });
});
