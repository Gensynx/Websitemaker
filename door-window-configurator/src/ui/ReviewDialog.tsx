/**
 * Review and enquire (Step 8): the summary, the share link and the enquiry
 * form, in one native modal <dialog>.
 *
 * The native element is the accessibility work: showModal() makes the page
 * behind inert, traps focus inside, closes on Escape, and — with the
 * trigger's focus restored below — returns the customer where they were.
 *
 * The form follows the error-summary pattern: on a failed submit, a summary
 * of every problem appears at the top, takes focus, and links to each field;
 * each field also carries its own message, tied to it with aria-describedby.
 *
 * Nothing here pretends. With no enquiry destination configured (see
 * output/enquiry.ts), submitting says plainly that nothing was sent. Contact
 * details are never written to storage.
 */

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConfigState } from '../config/types';
import { buildSummary, summaryText } from '../output/summary';
import { copyText, shareUrl } from '../output/share';
import { buildEnquiryRequest, EMPTY_CONTACT, submitEnquiry, validateContact } from '../output/enquiry';
import type { ContactDetails, ContactField, FieldError, SubmitResult } from '../output/enquiry';
import { StaticElevation } from '../viewer/StaticElevation';

export interface ReviewDialogHandle {
  open: (trigger?: HTMLElement | null) => void;
}

function TextField({
  id,
  label,
  hint,
  type = 'text',
  autoComplete,
  inputMode,
  value,
  error,
  required = false,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  value: string;
  error: string | undefined;
  required?: boolean;
  onChange: (value: string) => void;
}): JSX.Element {
  const described = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {!required && <span className="field__unit"> (optional)</span>}
      </label>
      {hint && (
        <p className="field__hint field__hint--above" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
      <input
        id={id}
        className="field__input"
        type={type}
        {...(autoComplete ? { autoComplete } : {})}
        {...(inputMode ? { inputMode } : {})}
        value={value}
        aria-invalid={error !== undefined}
        {...(described ? { 'aria-describedby': described } : {})}
        {...(required ? { 'aria-required': true } : {})}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function Status({ kind, children }: { kind: 'good' | 'note' | 'problem'; children: ReactNode }): JSX.Element {
  return <div className={`review__status review__status--${kind}`}>{children}</div>;
}

export const ReviewDialog = forwardRef<ReviewDialogHandle, { config: ConfigState }>(function ReviewDialog(
  { config },
  ref,
) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contact, setContact] = useState<ContactDetails>(EMPTY_CONTACT);
  const [cill, setCill] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ids = useId();
  const fieldId = (field: ContactField) => `${ids}-${field}`;

  useImperativeHandle(ref, () => ({
    open: (from) => {
      trigger.current = from ?? (document.activeElement as HTMLElement | null);
      setResult(null);
      setErrors([]);
      setCopied(null);
      setIsOpen(true);
    },
  }));

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) {
      element.showModal();
      heading.current?.focus();
    }
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  // Built only while the dialog is open: closed, it would otherwise redo the
  // summary, the link and the drawing on every edit (every frame of a colour
  // drag), and draw configurations that cannot be built.
  const summary = isOpen ? buildSummary(config) : null;
  const link = isOpen ? shareUrl(config, window.location) : '';
  const errorFor = (field: ContactField) => errors.find((error) => error.field === field)?.message;
  const set = (field: keyof ContactDetails) => (value: string | boolean) =>
    setContact((c) => ({ ...c, [field]: value }));

  const copy = async (what: 'link' | 'enquiry') => {
    if (summary === null) return;
    const ok = await copyText(what === 'link' ? link : summaryText(summary, link));
    setCopied(
      ok
        ? what === 'link'
          ? 'Link copied.'
          : 'Enquiry copied.'
        : 'Could not copy. Select the text and copy it instead.',
    );
  };

  const submit = async () => {
    const problems = validateContact(contact, cill);
    setErrors(problems);
    setResult(null);
    if (problems.length > 0) {
      // Let React render the summary, then move focus to it.
      requestAnimationFrame(() => errorSummary.current?.focus());
      return;
    }
    setSending(true);
    const cillValue = cill.trim() === '' ? undefined : Number(cill);
    const request = buildEnquiryRequest(
      config,
      contact,
      cillValue === undefined ? {} : { cillHeightAboveFloor: cillValue },
      link,
    );
    const outcome = await submitEnquiry(request);
    setSending(false);
    setResult(outcome);
  };

  return (
    <dialog
      ref={dialog}
      className="review"
      aria-labelledby={`${ids}-title`}
      onClose={() => {
        setIsOpen(false);
        trigger.current?.focus();
      }}
    >
      {summary !== null && (
        <>
          <div className="review__head">
            <h2 className="review__title" id={`${ids}-title`} ref={heading} tabIndex={-1}>
              Your {summary.title.toLowerCase()}
            </h2>
            <button type="button" className="button button--quiet" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>

          <div className="review__body">
            <section className="review__summary" aria-labelledby={`${ids}-summary`}>
              <h3 className="review__subtitle" id={`${ids}-summary`}>
                Summary
              </h3>

              {summary.status.kind === 'quotable' && (
                <Status kind="good">
                  <p>This configuration can be quoted.</p>
                </Status>
              )}
              {summary.status.kind === 'non-orderable' && (
                <Status kind="note">
                  <p>
                    <strong>Not orderable as it stands.</strong> You can still send an enquiry, and we will agree the
                    colour with you before pricing.
                  </p>
                  {summary.status.reasons.map((reason) => (
                    <p key={reason}>{reason}</p>
                  ))}
                </Status>
              )}
              {summary.status.kind === 'invalid' && (
                <Status kind="problem">
                  <p>
                    <strong>This cannot be made yet.</strong> Close this and change the following, then come back:
                  </p>
                  <ul>
                    {summary.status.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </Status>
              )}

              {/* No drawing of something that cannot be made: the part list may not
              even be buildable, and a picture beside "cannot be made" misleads. */}
              {summary.status.kind !== 'invalid' && (
                <div className="review__picture" aria-hidden="true">
                  <StaticElevation config={config} caption={false} />
                </div>
              )}

              {summary.groups.map((group) => (
                <div className="review__group" key={group.title}>
                  <h4 className="review__group-title">{group.title}</h4>
                  <dl className="readout">
                    {group.lines.map((line) => (
                      <div className="readout__row" key={line.label}>
                        <dt>{line.label}</dt>
                        <dd>{line.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}

              <ul className="review__notes">
                {summary.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>

              <div className="review__share">
                <label className="field__label" htmlFor={`${ids}-link`}>
                  Link to this configuration
                </label>
                <div className="review__share-row">
                  <input
                    id={`${ids}-link`}
                    className="field__input"
                    type="text"
                    readOnly
                    value={link}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button type="button" className="button" onClick={() => void copy('link')}>
                    Copy link
                  </button>
                </div>
                <p className="field__hint" role="status">
                  {copied ??
                    (window.location.protocol === 'file:'
                      ? 'This copy of the configurator was opened from a file, so the link works only on this computer.'
                      : 'Anyone with the link opens this exact configuration.')}
                </p>
              </div>
            </section>

            <section className="review__enquiry" aria-labelledby={`${ids}-enquiry`}>
              <h3 className="review__subtitle" id={`${ids}-enquiry`}>
                Send an enquiry
              </h3>

              {summary.status.kind === 'invalid' ? (
                <p className="section__hint">An enquiry can be sent once the configuration can be made.</p>
              ) : (
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                  }}
                >
                  {errors.length > 0 && (
                    <div
                      className="error-summary"
                      ref={errorSummary}
                      tabIndex={-1}
                      role="alert"
                      aria-labelledby={`${ids}-errors`}
                    >
                      <h4 id={`${ids}-errors`}>
                        There {errors.length === 1 ? 'is a problem' : `are ${errors.length} problems`}
                      </h4>
                      <ul>
                        {errors.map((error) => (
                          <li key={error.field}>
                            <a
                              href={`#${fieldId(error.field)}`}
                              onClick={(event) => {
                                event.preventDefault();
                                document.getElementById(fieldId(error.field))?.focus();
                              }}
                            >
                              {error.message}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <TextField
                    id={fieldId('name')}
                    label="Name"
                    autoComplete="name"
                    required
                    value={contact.name}
                    error={errorFor('name')}
                    onChange={set('name')}
                  />
                  <TextField
                    id={fieldId('email')}
                    label="Email address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={contact.email}
                    error={errorFor('email')}
                    onChange={set('email')}
                  />
                  <TextField
                    id={fieldId('phone')}
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={contact.phone}
                    error={errorFor('phone')}
                    onChange={set('phone')}
                  />
                  <TextField
                    id={fieldId('postcode')}
                    label="Postcode of the property"
                    autoComplete="postal-code"
                    value={contact.postcode}
                    error={errorFor('postcode')}
                    onChange={set('postcode')}
                  />
                  {config.productType === 'window' && (
                    <TextField
                      id={fieldId('cill')}
                      label="Cill height above the floor, in mm"
                      hint="Inside the room, from the finished floor to the bottom of the window. It decides whether safety glass is needed; the surveyor will confirm it."
                      inputMode="numeric"
                      value={cill}
                      error={errorFor('cill')}
                      onChange={setCill}
                    />
                  )}
                  <div className="field">
                    <label className="field__label" htmlFor={`${ids}-message`}>
                      Anything else we should know
                      <span className="field__unit"> (optional)</span>
                    </label>
                    <textarea
                      id={`${ids}-message`}
                      className="field__input field__input--area"
                      rows={4}
                      value={contact.message}
                      onChange={(event) => set('message')(event.target.value)}
                    />
                  </div>

                  <div className="toggle">
                    <input
                      id={fieldId('consent')}
                      type="checkbox"
                      checked={contact.consent}
                      aria-invalid={errorFor('consent') !== undefined}
                      {...(errorFor('consent') ? { 'aria-describedby': `${fieldId('consent')}-error` } : {})}
                      onChange={(event) => set('consent')(event.target.checked)}
                    />
                    <label htmlFor={fieldId('consent')}>
                      <span className="toggle__label">You may contact me about this enquiry</span>
                      <span className="toggle__detail">We use your details only to reply to this enquiry.</span>
                      {errorFor('consent') && (
                        <span className="field__error" id={`${fieldId('consent')}-error`}>
                          {errorFor('consent')}
                        </span>
                      )}
                    </label>
                  </div>

                  <button type="submit" className="button review__send" disabled={sending}>
                    {sending ? 'Sending…' : 'Send enquiry'}
                  </button>

                  <div role="status" className="review__result">
                    {result?.status === 'sent' && (
                      <Status kind="good">
                        <p>
                          <strong>Thank you — your enquiry has been sent.</strong> We will reply by email.
                        </p>
                      </Status>
                    )}
                    {result?.status === 'not-sent' && (
                      <Status kind="note">
                        <p>
                          <strong>Your enquiry has not been sent.</strong> {result.reason} Your details have not been
                          stored.
                        </p>
                        <p>You can copy the enquiry, with the configuration link, to send it another way.</p>
                        <button type="button" className="button button--quiet" onClick={() => void copy('enquiry')}>
                          Copy the enquiry
                        </button>
                      </Status>
                    )}
                    {(result?.status === 'failed' || result?.status === 'blocked') && (
                      <Status kind="problem">
                        <p>
                          <strong>Your enquiry has not been sent.</strong> {result.reason}
                        </p>
                      </Status>
                    )}
                  </div>
                </form>
              )}
            </section>
          </div>
        </>
      )}
    </dialog>
  );
});
