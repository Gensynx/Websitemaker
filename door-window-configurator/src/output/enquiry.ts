/**
 * The enquiry: contact details validated, the request built, and sent.
 *
 * =====================================================================
 * WHERE IT GOES
 *
 * The website build (`npm run build`, mode "production") sends it to
 * `enquiry.php` beside the page (public/enquiry.php): a JSON POST that the
 * server re-validates, rate-limits and emails. The endpoint comes from
 * VITE_ENQUIRY_ENDPOINT in `.env.production`.
 *
 * Everywhere else — the dev server, the single shareable file, the tests —
 * there is no server, ENQUIRY_ENDPOINT is null, and submitEnquiry() returns
 * { status: 'not-sent' }: the page says in so many words that nothing was
 * sent. It never shows a false confirmation.
 *
 * The server must not trust any of this: anything from a browser can be
 * forged. There is deliberately no client-side honeypot: browsers autofill
 * hidden fields, and a false positive would silently discard a real
 * customer's enquiry — worse than the spam it stops.
 * =====================================================================
 */

import type { ConfigState } from '../config/types';
import { buildEnquiry } from '../config/validate';
import type { EnquiryPayload, InstallationDetails } from '../config/validate';
import { CONFIG_SCHEMA_VERSION } from '../config/types';
import { buildSummary, summaryText } from './summary';
import { fittedConfig } from './fitted';

/** Set by the website build; null (not connected) everywhere else. See above. */
export const ENQUIRY_ENDPOINT: string | null = (import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined) || null;

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  message: string;
  consent: boolean;
}

export const EMPTY_CONTACT: ContactDetails = {
  name: '',
  email: '',
  phone: '',
  postcode: '',
  message: '',
  consent: false,
};

export type ContactField = 'name' | 'email' | 'phone' | 'postcode' | 'consent' | 'cill';

export interface FieldError {
  field: ContactField;
  message: string;
}

/** UK postcode, loosely: enough to catch a typo, not to reject a real one. */
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every problem, in form order, each worded to say what to do. */
export function validateContact(contact: ContactDetails, cillHeight: string): FieldError[] {
  const errors: FieldError[] = [];
  if (contact.name.trim() === '') errors.push({ field: 'name', message: 'Enter your name.' });
  if (contact.email.trim() === '') errors.push({ field: 'email', message: 'Enter your email address.' });
  else if (!EMAIL.test(contact.email.trim())) {
    errors.push({ field: 'email', message: 'Enter an email address in the correct format, like name@example.com.' });
  }
  if (contact.phone.trim() !== '' && contact.phone.replace(/[\s()+-]/g, '').replace(/\D/g, '').length < 10) {
    errors.push({ field: 'phone', message: 'Enter a phone number with at least 10 digits, or leave it blank.' });
  }
  if (contact.postcode.trim() !== '' && !POSTCODE.test(contact.postcode.trim())) {
    errors.push({ field: 'postcode', message: 'Enter a full UK postcode, like SW1A 1AA, or leave it blank.' });
  }
  if (cillHeight.trim() !== '') {
    const value = Number(cillHeight);
    if (!Number.isFinite(value) || value < 0 || value > 3000) {
      errors.push({ field: 'cill', message: 'Enter the cill height in millimetres, between 0 and 3000, or leave it blank.' });
    }
  }
  if (!contact.consent) errors.push({ field: 'consent', message: 'Confirm that we may contact you about this enquiry.' });
  return errors;
}

export interface EnquiryRequest {
  schemaVersion: number;
  createdAt: string;
  contact: ContactDetails;
  /** Quotable, non-orderable (an explore colour) or invalid, with reasons. */
  payload: EnquiryPayload;
  /** The same summary the customer reviewed, as text. */
  summary: string;
  /** Reopens the configuration exactly as the customer left it. */
  shareUrl: string;
}

export function buildEnquiryRequest(
  config: ConfigState,
  contact: ContactDetails,
  installation: InstallationDetails,
  link: string,
  now: Date = new Date(),
): EnquiryRequest {
  const details = contact;
  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    createdAt: now.toISOString(),
    contact: {
      ...details,
      name: details.name.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
      postcode: details.postcode.trim().toUpperCase(),
      message: details.message.trim(),
    },
    // What is fitted, not everything stored: see fitted.ts.
    payload: buildEnquiry(fittedConfig(config), installation),
    summary: summaryText(buildSummary(config), link),
    shareUrl: link,
  };
}

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'not-sent'; reason: string }
  | { status: 'failed'; reason: string }
  | { status: 'blocked'; reason: string };

export async function submitEnquiry(
  request: EnquiryRequest,
  endpoint: string | null = ENQUIRY_ENDPOINT,
  send: typeof fetch = (...args) => fetch(...args),
): Promise<SubmitResult> {
  if (request.payload.kind === 'invalid') {
    return { status: 'blocked', reason: 'This configuration cannot be made yet. Fix what the summary lists, then send it.' };
  }
  if (endpoint === null) {
    return {
      status: 'not-sent',
      reason: 'Enquiries are not connected in this version of the configurator.',
    };
  }
  try {
    const response = await send(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      credentials: 'omit',
    });
    if (response.ok) return { status: 'sent' };
    // The server's own words where it gives them ("too many enquiries from
    // this connection…"); a status code means nothing to a customer.
    const message = await response
      .json()
      .then((body: unknown) => (typeof body === 'object' && body !== null && 'error' in body ? String((body as { error: unknown }).error) : null))
      .catch(() => null);
    return {
      status: 'failed',
      reason: message ?? 'Something went wrong on our side. Please try again, or copy the enquiry and email it to us.',
    };
  } catch {
    return { status: 'failed', reason: 'The enquiry could not reach the server. Check your connection and try again.' };
  }
}
