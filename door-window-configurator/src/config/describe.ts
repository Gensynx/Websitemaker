/**
 * The configuration in plain language.
 *
 * One vocabulary for every place the configuration is put into words: the
 * collapsed section headers and read-only section contents in the panel
 * (Step 4), the preview's text alternative for screen readers (Step 4.4), and
 * the summary panel and enquiry (Step 8.1). Written once, here, so a door
 * cannot be "half glazed" in one place and "half-glazed" in another — and so
 * no internal code ('hg', 'side-hung-left', 'RAL7016') ever reaches a
 * customer.
 *
 * Every function is total over ConfigState: the compiler names any new style,
 * handle or pattern that has not been given words.
 */

import type {
  ApertureShape,
  BarLayout,
  BarStyle,
  ColourSelection,
  ConfigState,
  DoorConfigState,
  DoorHandleStyle,
  HardwareFinish,
  KnockerStyle,
  ObscurePattern,
  PanelDetail,
  SafetyGlazing,
  SashCell,
  SashOpening,
  TintColour,
  TrickleVentPosition,
  WindowConfigState,
  WindowHandleStyle,
} from './types';
import { assertNever, HANDING_CONVENTION, hasGlazedSurround, resolveInternalColour, resolveInternalFinish } from './types';
import type { Finish } from './material';
import { MATERIALS } from './material';
import { ralEntry } from './ral';
import { formatMm, formatSize, roundMmHalfUp } from './units';
import { safetyControlState } from './safety';

export type SectionId = 'style' | 'size' | 'colour' | 'glazing' | 'hardware';

export interface Line {
  label: string;
  value: string;
}

export interface SectionDescription {
  /** One line for a collapsed section header. */
  summary: string;
  /** The full picture, for an expanded read-only section or the summary panel. */
  lines: Line[];
}

/* ------------------------------------------------------------------ *
 * Words
 * ------------------------------------------------------------------ */

export function productName(config: ConfigState): string {
  return config.productType === 'door' ? 'External door' : 'Window';
}

const FINISH: Record<Finish, string> = {
  smooth: 'Smooth',
  textured: 'Textured',
  'woodgrain-foil': 'Woodgrain foil',
};

const HARDWARE_FINISH: Record<HardwareFinish, string> = {
  chrome: 'Polished chrome',
  'satin-chrome': 'Satin chrome',
  black: 'Black',
  brass: 'Brass',
  anthracite: 'Anthracite',
};

const DOOR_HANDLE: Record<DoorHandleStyle, string> = {
  'lever-backplate': 'Lever on backplate',
  'lever-rose': 'Lever on rose',
  'pull-bar': 'Pull bar',
  knob: 'Knob',
};

const WINDOW_HANDLE: Record<WindowHandleStyle, string> = {
  'lever-backplate': 'Lever on backplate',
  'lever-rose': 'Lever on rose',
  knob: 'Knob',
};

const KNOCKER: Record<KnockerStyle, string> = {
  ring: 'ring knocker',
  doctor: "doctor's knocker",
  urn: 'urn knocker',
};

const TINT: Record<TintColour, string> = { bronze: 'Bronze', grey: 'Grey', blue: 'Blue' };

const PATTERN: Record<ObscurePattern, string> = {
  sandblast: 'sandblast',
  reeded: 'reeded',
  stippled: 'stippled',
  cathedral: 'cathedral',
};

const SAFETY: Record<SafetyGlazing, string> = {
  none: 'Standard float glass',
  toughened: 'Toughened safety glass',
  laminated: 'Laminated safety glass',
};

const BAR_STYLE: Record<Exclude<BarStyle, 'none'>, string> = {
  'georgian-internal': 'Georgian bars inside the unit',
  'applied-astragal': 'applied astragal bars',
  'true-bar': 'true glazing bars',
};

const APERTURE: Record<ApertureShape, string> = {
  rectangular: 'rectangular',
  arched: 'arched',
  circular: 'circular',
};

const OPENING: Record<SashOpening, string> = {
  fixed: 'fixed',
  'side-hung-left': 'side-hung (hinged left)',
  'side-hung-right': 'side-hung (hinged right)',
  'top-hung': 'top-hung',
  'bottom-hung': 'bottom-hung',
};

const VENT_POSITION: Record<TrickleVentPosition, string> = {
  'head-of-frame': 'in the head of the frame',
  'in-sash': 'in the sash',
  'through-glazing': 'through the glazing',
};

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** "two raised panels", "one light". Words to twelve, then figures. */
function count(n: number, singular: string, plural = `${singular}s`): string {
  return `${NUMBER_WORDS[n] ?? String(n)} ${n === 1 ? singular : plural}`;
}

function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "Anthracite Grey, RAL 7016"; explore colours say plainly that they cannot be ordered. */
export function colourName(colour: ColourSelection): string {
  if (colour.mode === 'explore') return `Explore colour ${colour.hex.toUpperCase()} (not available to order)`;
  const entry = ralEntry(colour.code);
  return `${entry.name}, ${entry.code.replace(/^RAL/, 'RAL ')}`;
}

function shortColourName(colour: ColourSelection): string {
  return colour.mode === 'explore' ? 'Explore colour' : ralEntry(colour.code).name;
}

export function barsDescription(bars: BarLayout): string {
  if (bars.style === 'none' || (bars.columns <= 1 && bars.rows <= 1)) return 'No glazing bars';
  return `${bars.columns} × ${bars.rows} ${BAR_STYLE[bars.style]}`;
}

function panelDescription(detail: PanelDetail): string {
  switch (detail.kind) {
    case 'flush':
      return 'Flush';
    case 'raised':
      return `${sentence(count(detail.panels, 'raised panel'))}, ${detail.moulding} moulding`;
    case 'grooved':
      return `${sentence(count(detail.grooves, `${detail.orientation} groove`))}`;
    default:
      return assertNever(detail);
  }
}

/* ------------------------------------------------------------------ *
 * Style
 * ------------------------------------------------------------------ */

function doorStyleName(config: DoorConfigState): string {
  switch (config.style.id) {
    case 'solid-panel':
      return 'Solid panel';
    case 'half-glazed':
      return 'Half glazed';
    case 'full-glazed':
      return 'Fully glazed';
    default:
      return assertNever(config.style);
  }
}

function surroundSummary(config: DoorConfigState): string {
  const { leftSideLight, rightSideLight, topLight } = config.surround;
  const sides = [leftSideLight, rightSideLight].filter((light) => light !== null).length;
  const parts: string[] = [];
  if (sides > 0) parts.push(count(sides, 'side light'));
  if (topLight !== null) parts.push('a top light');
  return parts.length === 0 ? 'no side or top lights' : list(parts);
}

function describeDoorStyle(config: DoorConfigState): SectionDescription {
  const lines: Line[] = [{ label: 'Style', value: doorStyleName(config) }];
  const style = config.style;
  if (style.id === 'half-glazed') {
    lines.push({
      label: 'Glazed area',
      value: `Top ${Math.round(style.options.glazedFraction * 100)}% of the leaf, ${APERTURE[style.options.aperture.shape]}`,
    });
    lines.push({ label: 'Leaf glazing bars', value: barsDescription(style.options.aperture.bars) });
  }
  if (style.id === 'full-glazed') {
    lines.push({ label: 'Glazed area', value: `${sentence(APERTURE[style.options.aperture.shape])}` });
    lines.push({ label: 'Leaf glazing bars', value: barsDescription(style.options.aperture.bars) });
  }
  if (style.id !== 'full-glazed') lines.push({ label: 'Panels', value: panelDescription(style.options.panelDetail) });

  const { leftSideLight, rightSideLight, topLight } = config.surround;
  for (const [label, light] of [
    ['Left side light', leftSideLight],
    ['Right side light', rightSideLight],
  ] as const) {
    if (light !== null) lines.push({ label, value: `${formatMm(light.width)} wide, ${barsDescription(light.bars).toLowerCase()}` });
  }
  if (topLight !== null) {
    lines.push({
      label: 'Top light',
      value: `${formatMm(topLight.height)} high, ${topLight.shape}, ${barsDescription(topLight.bars).toLowerCase()}`,
    });
  }
  if (leftSideLight === null && rightSideLight === null && topLight === null) {
    lines.push({ label: 'Side and top lights', value: 'None' });
  }

  lines.push({
    label: 'Opening',
    value: `Hinged on the ${config.hingeSide}, opens ${config.openingDirection}, as viewed from outside`,
  });
  lines.push({ label: 'Threshold', value: config.threshold === 'standard' ? 'Standard' : 'Low-level access' });
  lines.push({ label: 'Frame', value: MATERIALS[config.material].label });

  return { summary: `${doorStyleName(config)}, ${surroundSummary(config)}`, lines };
}

function windowStyleName(config: WindowConfigState): string {
  switch (config.style.id) {
    case 'casement':
      return 'Casement';
    case 'tilt-and-turn':
      return 'Tilt and turn';
    case 'sash':
      return 'Sliding sash';
    case 'fixed':
      return 'Fixed light';
    default:
      return assertNever(config.style);
  }
}

/** "two side-hung (hinged left) and one fixed", in the order they first appear. */
function openingsSummary(cells: SashCell[]): string {
  const tally = new Map<SashOpening, number>();
  for (const cell of cells) tally.set(cell.opening, (tally.get(cell.opening) ?? 0) + 1);
  return list([...tally].map(([opening, n]) => `${NUMBER_WORDS[n] ?? n} ${OPENING[opening]}`));
}

function describeWindowStyle(config: WindowConfigState): SectionDescription {
  const lines: Line[] = [{ label: 'Style', value: windowStyleName(config) }];
  let summary = windowStyleName(config);
  const style = config.style;
  switch (style.id) {
    case 'casement':
    case 'tilt-and-turn': {
      const { grid } = style.options;
      const across = grid.columnWeights.length;
      const high = grid.rowWeights.length;
      lines.push({ label: 'Lights', value: `${across} across, ${high} high` });
      lines.push({ label: 'Openings', value: sentence(openingsSummary(grid.cells)) });
      const barred = grid.cells.filter((cell) => cell.bars.style !== 'none').length;
      lines.push({ label: 'Glazing bars', value: barred === 0 ? 'None' : `In ${count(barred, 'light')}` });
      if (style.id === 'tilt-and-turn') {
        lines.push({ label: 'Turn hinge', value: `On the ${style.options.turnHingeSide}` });
      }
      summary = `${summary}, ${across} × ${high} lights`;
      break;
    }
    case 'sash':
      lines.push({
        label: 'Operation',
        value: style.options.operation === 'single-hung' ? 'Single-hung: the lower sash slides' : 'Double-hung: both sashes slide',
      });
      lines.push({ label: 'Meeting rail', value: `${Math.round(style.options.meetingRailPosition * 100)}% of the height, from the cill` });
      lines.push({ label: 'Horns', value: style.options.horns ? 'Yes' : 'No' });
      lines.push({ label: 'Upper sash bars', value: barsDescription(style.options.upperBars) });
      lines.push({ label: 'Lower sash bars', value: barsDescription(style.options.lowerBars) });
      summary = `${summary}, ${style.options.operation}`;
      break;
    case 'fixed':
      lines.push({ label: 'Glazing bars', value: barsDescription(style.options.bars) });
      break;
    default:
      return assertNever(style);
  }
  lines.push({ label: 'Frame', value: MATERIALS[config.material].label });
  return { summary, lines };
}

export function describeStyle(config: ConfigState): SectionDescription {
  return config.productType === 'door' ? describeDoorStyle(config) : describeWindowStyle(config);
}

/* ------------------------------------------------------------------ *
 * Size, colour, glazing, hardware
 * ------------------------------------------------------------------ */

export function describeSize(config: ConfigState): SectionDescription {
  const { width, height } = config.dimensions;
  return {
    summary: formatSize(width, height),
    lines: [
      { label: 'Width', value: formatMm(width) },
      { label: 'Height', value: formatMm(height) },
    ],
  };
}

export function describeColour(config: ConfigState): SectionDescription {
  const external = config.colour.external;
  const internal = resolveInternalColour(config.colour);
  const externalFinish = config.finish.external;
  const internalFinish = resolveInternalFinish(config.finish);
  const sameColour = config.colour.internal.mode === 'match';
  const sameFinish = config.finish.internal === 'match';

  const lines: Line[] = [
    { label: 'Outside', value: `${colourName(external)}, ${FINISH[externalFinish].toLowerCase()}` },
    {
      label: 'Inside',
      value:
        sameColour && sameFinish
          ? 'Same as outside'
          : `${sameColour ? 'Same colour as outside' : colourName(internal)}, ${FINISH[internalFinish].toLowerCase()}`,
    },
  ];

  let summary = `${shortColourName(external)}, ${FINISH[externalFinish].toLowerCase()}`;
  if (!(sameColour && sameFinish)) summary += `; inside ${shortColourName(internal).toLowerCase()}`;
  return { summary, lines };
}

function glazingAppearance(config: ConfigState): string {
  const glazing = config.glazing;
  switch (glazing.appearance) {
    case 'clear':
      return 'Clear';
    case 'tinted':
      return `${TINT[glazing.tint]} tint`;
    case 'obscure':
      return `Obscure, ${PATTERN[glazing.pattern]} pattern`;
    default:
      return assertNever(glazing);
  }
}

/** False for a solid door with no side or top lights: there is no glass to describe. */
export function hasGlass(config: ConfigState): boolean {
  if (config.productType === 'window') return true;
  return config.style.id !== 'solid-panel' || hasGlazedSurround(config.surround);
}

export function describeGlazing(config: ConfigState): SectionDescription {
  // The glazing specification is still held — it applies the moment a side
  // light is added — but describing "double glazed, clear" for a door with
  // no glass in it would be untrue.
  if (!hasGlass(config)) {
    return {
      summary: 'No glass in this design',
      lines: [{ label: 'Glass', value: 'None: a solid door with no side or top lights' }],
    };
  }
  const unit = config.glazing.unit === 'double' ? 'Double glazed' : 'Triple glazed';
  const appearance = glazingAppearance(config);
  const lines: Line[] = [
    { label: 'Unit', value: unit },
    { label: 'Glass', value: appearance },
    { label: 'Safety', value: SAFETY[config.glazing.safety] },
  ];
  // A critical location is stated where it applies, with the pane named — not
  // left for the customer to infer from a changed default.
  const required = safetyControlState(config).filter((pane) => pane.locked);
  if (required.length > 0) {
    lines.push({
      label: 'Safety glass required',
      value: `${sentence(list(required.map((pane) => pane.label.toLowerCase())))}, by building regulations`,
    });
  }
  return { summary: `${unit}, ${appearance.toLowerCase()}`, lines };
}

export function describeHardware(config: ConfigState): SectionDescription {
  const finish = HARDWARE_FINISH[config.hardware.finish];
  const vents =
    config.trickleVents === null
      ? 'None'
      : `${sentence(count(config.trickleVents.count, 'vent'))} ${VENT_POSITION[config.trickleVents.position]}`;

  if (config.productType === 'window') {
    const handle = WINDOW_HANDLE[config.hardware.handle];
    return {
      summary: `${handle}, ${finish.toLowerCase()}`,
      lines: [
        { label: 'Handle', value: handle },
        { label: 'Finish', value: finish },
        { label: 'Trickle vents', value: vents },
      ],
    };
  }

  const hardware = config.hardware;
  const handle = DOOR_HANDLE[hardware.handle];
  const furniture: string[] = [];
  if (hardware.letterplate) furniture.push('letterplate');
  if (hardware.knocker !== null) furniture.push(KNOCKER[hardware.knocker]);
  if (hardware.spyhole) furniture.push('spyhole');
  return {
    summary: `${handle}, ${finish.toLowerCase()}`,
    lines: [
      { label: 'Handle', value: handle },
      { label: 'Finish', value: finish },
      { label: 'Door furniture', value: furniture.length === 0 ? 'None' : sentence(list(furniture)) },
      { label: 'Trickle vents', value: vents },
    ],
  };
}

export function describeSection(section: SectionId, config: ConfigState): SectionDescription {
  switch (section) {
    case 'style':
      return describeStyle(config);
    case 'size':
      return describeSize(config);
    case 'colour':
      return describeColour(config);
    case 'glazing':
      return describeGlazing(config);
    case 'hardware':
      return describeHardware(config);
    default:
      return assertNever(section);
  }
}

/**
 * The preview in one paragraph: the text alternative for the canvas, so a
 * screen-reader user is told what the picture shows instead of meeting an
 * unlabelled graphic (Step 4.4).
 */
export function describeProduct(config: ConfigState): string {
  const parts = [
    `${productName(config)}, ${roundMmHalfUp(config.dimensions.width)} mm wide by ${roundMmHalfUp(config.dimensions.height)} mm high`,
    describeStyle(config).summary,
    describeColour(config).summary,
    ...(hasGlass(config) ? [describeGlazing(config).summary] : []),
    describeHardware(config).summary,
  ];
  let text = parts.map(sentence).join('. ');
  if (config.productType === 'door') {
    text += `. Hinged on the ${config.hingeSide}, opening ${config.openingDirection}, as viewed from outside`;
  }
  return `${text}.`;
}

/** Restated verbatim wherever handing is shown (see types.ts). */
export const HANDING_STATEMENT = HANDING_CONVENTION.statement;

/* ------------------------------------------------------------------ *
 * Where a validation issue belongs
 * ------------------------------------------------------------------ */

/**
 * The panel section a validation field belongs to, so a problem is shown
 * against the section the customer can fix it in — and a collapsed section
 * can say it needs attention. `null` for anything with no section of its own.
 */
export function sectionForField(field: string): SectionId | null {
  const root = field.split(/[.[]/)[0] ?? '';
  switch (root) {
    case 'width':
    case 'height':
    case 'dimensions':
      return 'size';
    case 'colour':
    case 'finish':
      return 'colour';
    case 'glazing':
      return 'glazing';
    case 'hardware':
    case 'trickleVents':
      return 'hardware';
    case 'material':
    case 'style':
    case 'surround':
    case 'threshold':
    case 'hingeSide':
    case 'openingDirection':
      return 'style';
    default:
      return null;
  }
}
