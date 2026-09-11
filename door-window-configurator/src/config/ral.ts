/**
 * RAL palette — the finishes actually offered.
 *
 * !! PLACEHOLDER DATA REQUIRING REPLACEMENT !!
 * Two separate things need supplying by the client before launch:
 *   1. The list itself. These are the RAL Classic shades commonly stocked for
 *      external doors and windows in the UK; the real list is whatever the
 *      fabricator offers, and it differs per frame material.
 *   2. The sRGB values. RAL is a proprietary colour standard defined by
 *      physical samples; the hex values below are widely published
 *      approximations, not licensed values, and are further subject to the
 *      "indicative only" notice required by the brief (Step 5.4).
 *
 * Adding a shade is one entry here. `RalCode` is derived from this array, so
 * the compiler and the URL codec pick it up automatically.
 */
export const RAL_PALETTE = [
  { code: 'RAL9016', name: 'Traffic White', hex: '#F1F0EA' },
  { code: 'RAL9010', name: 'Pure White', hex: '#F1ECE1' },
  { code: 'RAL9001', name: 'Cream', hex: '#EFE5D3' },
  { code: 'RAL7016', name: 'Anthracite Grey', hex: '#383E42' },
  { code: 'RAL7015', name: 'Slate Grey', hex: '#4E5255' },
  { code: 'RAL7012', name: 'Basalt Grey', hex: '#575D5E' },
  { code: 'RAL7035', name: 'Light Grey', hex: '#CBD0CC' },
  { code: 'RAL7039', name: 'Quartz Grey', hex: '#6B665E' },
  { code: 'RAL9005', name: 'Jet Black', hex: '#0E0E10' },
  { code: 'RAL6005', name: 'Moss Green', hex: '#114232' },
  { code: 'RAL6009', name: 'Fir Green', hex: '#26392F' },
  { code: 'RAL5011', name: 'Steel Blue', hex: '#1A2B3C' },
  { code: 'RAL5003', name: 'Sapphire Blue', hex: '#1F3855' },
  { code: 'RAL3004', name: 'Purple Red', hex: '#6B1C23' },
  { code: 'RAL3005', name: 'Wine Red', hex: '#59191F' },
  { code: 'RAL8017', name: 'Chocolate Brown', hex: '#442F29' },
  { code: 'RAL8003', name: 'Clay Brown', hex: '#7A4520' },
  { code: 'RAL1015', name: 'Light Ivory', hex: '#E6D2B5' },
] as const;

export type RalEntry = (typeof RAL_PALETTE)[number];

/** The set of orderable RAL codes, derived from the palette above. */
export type RalCode = RalEntry['code'];

const BY_CODE = new Map<string, RalEntry>(RAL_PALETTE.map((entry) => [entry.code, entry]));

export function isRalCode(value: string): value is RalCode {
  return BY_CODE.has(value);
}

export function ralEntry(code: RalCode): RalEntry {
  const entry = BY_CODE.get(code);
  // Unreachable while `code` is typed, but keeps the runtime path honest when
  // a code arrives from a URL.
  if (!entry) throw new Error(`Unknown RAL code: ${code}`);
  return entry;
}
