/**
 * A collapsible panel section (Step 4.2).
 *
 * The WAI-ARIA disclosure pattern, as the Base UI accordion on 21st.dev
 * structures it: the trigger is a real <button> inside the section's heading,
 * so the heading outline still reads Style, Size, Colour, Glazing, Hardware,
 * and Enter and Space work without any key handling here. Several sections
 * may be open at once; nothing forces the others shut.
 *
 * Collapsed, a section still says what is chosen — its summary line sits in
 * the trigger, so it is part of the button's accessible name — and says when
 * it needs attention, in words rather than colour alone.
 *
 * The panel animates its height (grid rows 0fr to 1fr, 240 ms). A closed
 * panel is `inert` at once and `visibility: hidden` once the animation ends,
 * which together take it out of the tab order and the accessibility tree as
 * surely as `hidden` would, without killing the transition.
 */

import type { ReactNode } from 'react';

export function Section({
  id,
  title,
  summary,
  issues = 0,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  /** Problems that stop an order, counted for the collapsed header. */
  issues?: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}): JSX.Element {
  const titleId = `${id}-title`;
  const panelId = `${id}-panel`;
  return (
    <section className="section" data-open={open} data-issues={issues > 0}>
      <h2 className="section__heading">
        <button
          type="button"
          className="section__toggle"
          id={`${id}-toggle`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="section__title" id={titleId}>
            {title}
          </span>
          <span className="section__summary">{summary}</span>
          {issues > 0 && (
            <span className="section__issues">{issues === 1 ? '1 issue' : `${issues} issues`}</span>
          )}
          <span className="section__chevron" aria-hidden="true" />
        </button>
      </h2>
      <div
        className="section__panel"
        id={panelId}
        role="region"
        aria-labelledby={titleId}
        // `inert` the moment it closes: `visibility` only switches once the
        // 240 ms collapse has finished, and a quick Tab straight after Enter
        // landed in the fields of a section that was already closing. React 18
        // does not type the attribute, hence the spread.
        {...(open ? {} : { inert: '' })}
      >
        <div className="section__inner">
          <div className="section__content">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** A read-only list of what is currently chosen, for sections whose controls come later. */
export function Readout({ lines, note }: { lines: Array<{ label: string; value: string }>; note?: string }): JSX.Element {
  return (
    <>
      <dl className="readout">
        {lines.map((line) => (
          <div className="readout__row" key={line.label}>
            <dt>{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
      {note !== undefined && <p className="section__hint">{note}</p>}
    </>
  );
}
