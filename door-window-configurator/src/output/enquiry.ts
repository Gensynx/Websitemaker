/**
 * The enquiry (Step 8.3): the configuration and the customer's contact
 * details, as one request.
 *
 * ================================ STUB ================================
 * The brief leaves the destination unstated, so NOTHING IS SENT. With
 * ENQUIRY_ENDPOINT null, submitEnquiry() returns { status: 'not-sent' } and
 * the page tells the customer, in so many words, that their enquiry has not
 * been sent. It never shows a false confirmation.
 *
 * To connect it: set ENQUIRY_ENDPOINT to an HTTPS URL that accepts a JSON
 * POST of EnquiryRequest and answers 2xx. The server must re-validate
 * everything — the configuration by decoding `shareUrl` or `payload.config`
 * with url.ts / validate.ts, and the contact details — because anything that
 * arrives from a browser can be forged. Rate limiting and spam filtering
 * belong there too. There is deliberately no client-side honeypot: browsers
 * autofill hidden fields, and a false positive would silently discard a real
 * customer's enquiry — worse than the spam it stops.
 * =====================================================================
 */

import type { ConfigState } from '../config/types';
import { buildEnquiry } from '../config/validate';
import type { EnquiryPayload, InstallationDetails } from '../config/validate';
import { CONFIG_SCHEMA_VERSION } from '../config/types';
import { buildSummary, summaryText } from './summary';
import { fittedConfig } from './fitted';

/** STUB: no destination configured. See the note at the top of this file. */
export const ENQUIRY_ENDPOINT: string | null = null;

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
    return response.ok ? { status: 'sent' } : { status: 'failed', reason: `The server answered ${response.status}.` };
  } catch {
    return { status: 'failed', reason: 'The enquiry could not reach the server. Check your connection and try again.' };
  }
}
