import { describe, expect, it } from 'vitest';
import {
  describeProduct,
  describeSection,
  sectionForField,
} from './describe';
import type { SectionId } from './describe';
import { DEFAULT_DOOR, DEFAULT_DOOR_STYLE_OPTIONS, DEFAULT_WINDOW, DEFAULT_WINDOW_STYLE_OPTIONS } from './defaults';
import { WINDOW_PRESETS } from './windowPresets';
import type { ConfigState, DoorConfigState, PanelDetail, WindowConfigState } from './types';
import { validateConfig } from './validate';

const SECTIONS: SectionId[] = ['style', 'size', 'colour', 'glazing', 'hardware'];

// Hyphenated words a customer would recognise. Anything else hyphenated and
// lower-case is an internal identifier leaking into the interface.
const ENGLISH = new Set(['side-hung', 'top-hung', 'bottom-hung', 'single-hung', 'double-hung', 'low-level']);

function leaks(text: string): string[] {
  const found: string[] = [];
  for (const token of text.match(/\b[a-z]+(?:-[a-z]+)+\b/g) ?? []) if (!ENGLISH.has(token)) found.push(token);
  if (/RAL\d/.test(text)) found.push('RAL code without a space');
  if (/undefined|NaN|\[object|null/.test(text)) found.push('placeholder value');
  return found;
}

const panels: PanelDetail[] = [
  { kind: 'flush' },
  { kind: 'raised', panels: 1, moulding: 'ovolo' },
  { kind: 'raised', panels: 4, moulding: 'chamfer' },
  { kind: 'grooved', grooves: 4, grooveWidth: 8, orientation: 'horizontal' },
];

const doors: DoorConfigState[] = [
  DEFAULT_DOOR,
  ...panels.map((panelDetail) => ({ ...DEFAULT_DOOR, style: { id: 'solid-panel' as const, options: { panelDetail } } })),
  { ...DEFAULT_DOOR, style: { id: 'half-glazed', options: DEFAULT_DOOR_STYLE_OPTIONS['half-glazed'] } },
  { ...DEFAULT_DOOR, style: { id: 'full-glazed', options: DEFAULT_DOOR_STYLE_OPTIONS['full-glazed'] } },
  {
    ...DEFAULT_DOOR,
    dimensions: { width: 1800, height: 2300 },
    surround: {
      leftSideLight: { width: 400, bars: { style: 'true-bar', columns: 1, rows: 4, barWidth: 22 }, safety: null },
      rightSideLight: { width: 400, bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
      topLight: { height: 300, shape: 'arched', bars: { style: 'none', columns: 1, rows: 1, barWidth: 0 }, safety: null },
    },
    hardware: { ...DEFAULT_DOOR.hardware, letterplate: true, knocker: 'doctor', spyhole: true },
    colour: { external: { mode: 'ral', code: 'RAL7016' }, internal: { mode: 'ral', code: 'RAL9016' } },
  },
  { ...DEFAULT_DOOR, colour: { external: { mode: 'explore', hex: '#123abc' }, internal: { mode: 'match' } } },
];

const windows: WindowConfigState[] = [
  DEFAULT_WINDOW,
  { ...DEFAULT_WINDOW, style: { id: 'sash', options: DEFAULT_WINDOW_STYLE_OPTIONS.sash } },
  { ...DEFAULT_WINDOW, style: { id: 'tilt-and-turn', options: DEFAULT_WINDOW_STYLE_OPTIONS['tilt-and-turn'] } },
  { ...DEFAULT_WINDOW, style: { id: 'fixed', options: DEFAULT_WINDOW_STYLE_OPTIONS.fixed } },
  ...WINDOW_PRESETS.map((preset) => ({ ...DEFAULT_WINDOW, style: preset.expand() })),
  { ...DEFAULT_WINDOW, glazing: { appearance: 'obscure', pattern: 'reeded', unit: 'triple', safety: 'laminated' } },
  { ...DEFAULT_WINDOW, glazing: { appearance: 'tinted', tint: 'bronze', unit: 'double', safety: 'none' } },
  { ...DEFAULT_WINDOW, trickleVents: { position: 'head-of-frame', count: 2 } },
];

const ALL: ConfigState[] = [...doors, ...windows];

describe('every configuration is described in plain language', () => {
  ALL.forEach((config, index) => {
    it(`${config.productType} #${index}: every section has a summary and lines, with no internal codes`, () => {
      for (const section of SECTIONS) {
        const { summary, lines } = describeSection(section, config);
        expect(summary.trim(), section).not.toBe('');
        expect(lines.length, section).toBeGreaterThan(0);
        const text = [summary, ...lines.flatMap((line) => [line.label, line.value])].join(' | ');
        expect(leaks(text), text).toEqual([]);
      }
      expect(leaks(describeProduct(config))).toEqual([]);
    });
  });
});

describe('specific wording', () => {
  it('names a RAL colour by name and spaced code', () => {
    const colour = describeSection('colour', doors[doors.length - 2] as ConfigState);
    expect(colour.lines[0]?.value).toBe('Anthracite Grey, RAL 7016, smooth');
    expect(colour.lines[1]?.value).toContain('Traffic White, RAL 9016');
  });

  it('says an explore colour cannot be ordered', () => {
    const colour = describeSection('colour', doors[doors.length - 1] as ConfigState);
    expect(colour.lines[0]?.value).toContain('not available to order');
  });

  it('states the handing and the viewpoint in the preview text', () => {
    expect(describeProduct(DEFAULT_DOOR)).toMatch(/Hinged on the (left|right), opening (inward|outward), as viewed from outside\./);
  });

  it('carries the size exactly once in the size summary, in W × H order', () => {
    expect(describeSection('size', { ...DEFAULT_DOOR, dimensions: { width: 926.5, height: 2040 } }).summary).toBe(
      '927 × 2040 mm (W × H)',
    );
  });

  it('names the panes where building regulations require safety glass', () => {
    const glazed = describeSection('glazing', doors[doors.length - 2] as ConfigState);
    expect(glazed.lines.some((line) => line.label === 'Safety glass required')).toBe(true);
  });
});

describe('validation issues land in a section', () => {
  it('maps every field validation can raise', () => {
    const fields = [
      'material', 'width', 'height', 'colour.external', 'colour.internal', 'finish.external', 'finish.internal',
      'glazing.safety', 'glazing.safety.leaf', 'glazing.safety.cell-3', 'surround.leftSideLight', 'surround.rightSideLight',
      'surround.topLight', 'trickleVents', 'trickleVents.count', 'style.glazedFraction', 'style.aperture.bars',
      'style.grid', 'style.grid.cells[2]', 'style.meetingRailPosition', 'style.upperBars', 'style.lowerBars',
      'style.bars', 'threshold',
    ];
    for (const field of fields) expect(sectionForField(field), field).not.toBeNull();
  });

  it('maps the fields actually raised by a broken configuration', () => {
    const broken: ConfigState = {
      ...DEFAULT_DOOR,
      dimensions: { width: 90000, height: 10 },
      colour: { external: { mode: 'explore', hex: '#123456' }, internal: { mode: 'match' } },
    };
    const { errors, nonOrderable, notices } = validateConfig(broken);
    for (const issue of [...errors, ...nonOrderable, ...notices]) expect(sectionForField(issue.field), issue.field).not.toBeNull();
  });
});

describe('a door with no glass', () => {
  it('is not described as glazed', () => {
    const solid: ConfigState = { ...DEFAULT_DOOR, style: { id: 'solid-panel', options: DEFAULT_DOOR_STYLE_OPTIONS['solid-panel'] } };
    expect(solid.productType === 'door' && solid.surround.leftSideLight).toBeFalsy();
    expect(describeSection('glazing', solid).summary).toBe('No glass in this design');
    expect(describeProduct(solid)).not.toMatch(/glazed/i);
  });
});
