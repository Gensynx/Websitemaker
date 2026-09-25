/**
 * The summary (Step 8.1): every selected option, in plain language.
 *
 * Built from describe.ts — the same words as the panel — over the FITTED
 * configuration, with the statements the order must carry verbatim: the
 * handing convention, which panes need safety glass and why, and that
 * on-screen colour is indicative only.
 *
 * Its status says, before anything is sent, whether the configuration can be
 * quoted, can only be enquired about (an explore colour), or cannot be made.
 */

import type { ConfigState } from '../config/types';
import {
  describeColour,
  describeGlazing,
  describeHardware,
  describeLights,
  describeSize,
  describeStyle,
  HANDING_STATEMENT,
  hasGlass,
  productName,
} from '../config/describe';
import type { Line } from '../config/describe';
import { assessCriticalLocations } from '../config/safety';
import { validateConfig } from '../config/validate';
import type { ValidationIssue } from '../config/validate';
import { fittedConfig } from './fitted';

export type SummaryStatus =
  | { kind: 'quotable' }
  | { kind: 'non-orderable'; reasons: string[] }
  | { kind: 'invalid'; reasons: string[] };

export interface SummaryGroup {
  title: string;
  lines: Line[];
}

export interface Summary {
  title: string;
  status: SummaryStatus;
  groups: SummaryGroup[];
  /** Statements every summary and enquiry carries. */
  notes: string[];
}

export const INDICATIVE_NOTE =
  'On-screen colours, finishes and obscure glass patterns are indicative only. Confirm against a physical sample before ordering.';

function status(issues: { errors: ValidationIssue[]; nonOrderable: ValidationIssue[] }): SummaryStatus {
  if (issues.errors.length > 0) return { kind: 'invalid', reasons: issues.errors.map((issue) => issue.message) };
  if (issues.nonOrderable.length > 0) return { kind: 'non-orderable', reasons: issues.nonOrderable.map((issue) => issue.message) };
  return { kind: 'quotable' };
}

export function buildSummary(stored: ConfigState): Summary {
  const config = fittedConfig(stored);
  const style = describeStyle(config);
  // For a divided window the order names each light; the panel's roll-up
  // ("Two fixed", "In 2 lights") gives way to them, in the same place.
  const lights = config.productType === 'window' ? describeLights(config) : [];
  const rolledUp = new Set(['Openings', 'Glazing bars']);
  const styleLines =
    lights.length === 0
      ? [...style.lines]
      : style.lines.flatMap((line) => (line.label === 'Openings' ? lights : rolledUp.has(line.label) ? [] : [line]));

  const groups: SummaryGroup[] = [
    { title: 'Size', lines: describeSize(config).lines },
    { title: 'Style', lines: styleLines },
    { title: 'Colour and finish', lines: describeColour(config).lines },
    { title: 'Glazing', lines: describeGlazing(config).lines },
    { title: 'Hardware', lines: describeHardware(config).lines },
  ];

  const notes: string[] = [];
  if (config.productType === 'door') notes.push(HANDING_STATEMENT);
  if (hasGlass(config)) {
    const assessment = assessCriticalLocations(config);
    for (const pane of assessment.panes.filter((p) => p.status === 'required')) {
      notes.push(`${pane.label}: safety glass is required. ${pane.reason}`);
    }
    if (assessment.undetermined) {
      notes.push(
        'Whether this window needs safety glass depends on the height of its cill above the finished floor. Give it with your enquiry if you know it; the surveyor will confirm it.',
      );
    }
  }
  if (config.trickleVents !== null) {
    notes.push('Trickle vents are shown as a starting point for the survey. The ventilation a room needs is set by building regulations, not by this summary.');
  }
  notes.push(INDICATIVE_NOTE);

  return {
    title: productName(config),
    status: status(validateConfig(config)),
    groups,
    notes,
  };
}

/** The summary as plain text, for the enquiry payload and for copying. */
export function summaryText(summary: Summary, shareUrl: string): string {
  const lines: string[] = [summary.title, ''];
  for (const group of summary.groups) {
    lines.push(group.title.toUpperCase());
    for (const line of group.lines) lines.push(`${line.label}: ${line.value}`);
    lines.push('');
  }
  lines.push(...summary.notes, '', `Configuration link: ${shareUrl}`);
  return lines.join('\n');
}
