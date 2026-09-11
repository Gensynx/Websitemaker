# 3D Door and Window Configurator

Phase 1, Step 1 only: the state model and its URL serialisation. **No rendering
code exists yet and none should be added until the state model is signed off.**

React + Vite + TypeScript. React Three Fiber, drei and Zustand are deliberately
not yet installed.

## What is here

| File | Purpose |
| --- | --- |
| `src/config/types.ts` | `ConfigState` — the canonical model |
| `src/config/material.ts` | Frame material: the gate on colour, finish, sightlines — **placeholder data** |
| `src/config/limits.ts` | Manufacturable limits per material, grid caps, presets — **placeholder data** |
| `src/config/ral.ts` | RAL palette — **placeholder data** |
| `src/config/safety.ts` | Approved Document K critical locations — **simplified, not a compliance tool** |
| `src/config/validate.ts` | Validation, material reconciliation, the sole `QuotableConfig` constructor |
| `src/config/url.ts` | Total encoder/decoder to and from a query string |
| `src/config/migrations.ts` | Schema migration policy and the v1 → v2 chain |
| `src/config/view.ts` | Camera preset, decoded independently of `ConfigState` |
| `src/config/units.ts` | Millimetres and normalised proportions; the single rounding point |
| `src/config/storage.ts` | localStorage persistence; the URL takes precedence |

```
npm install
npm run typecheck
npm test
```

## Design decisions

**Material gates the catalogue.** Colour, finish, sightlines and every size
limit hang off `material`. Those are cross-field rules, so they live in
`validate.ts` rather than the type system; `reconcileWithMaterial` runs on every
material change and after every decode, because a link can carry a combination
that was legal when it was shared and is not now.

**Units and bases live in type names.** `Mm`, `GlazedFractionOfLeafHeightFromTop`,
`MeetingRailFractionFromCill`, `HingeSideViewedFromOutside`. Handing is also
restated in the exported `HANDING_CONVENTION`, which the summary panel prints
verbatim — wrong-handedness is a manufacturing error, not a display bug.

**One brand, one constructor.** `QuotableConfig` is branded with a
module-scoped `declare const … unique symbol`, and `mintQuotable` in
`validate.ts` holds the only assertion that produces one. An explore colour or
a failed dimension check means no brand. Per decision 13 an explore colour does
not block the enquiry: `buildEnquiry` returns a `non-orderable` payload
carrying the reasons instead.

**The decoder is total.** Every path returns a usable configuration. Unreadable
values fall back per field and are reported in `issues`. Out-of-range
dimensions are clamped, not rejected — a shared link should still open.

**Every field is encoded, including the switched-off ones.** `lp=0` rather than
omitting the key, and `n` as an explicit "not fitted" token. Encoding by
presence alone makes "the customer switched this off" indistinguishable from
"this link predates the option".

## Link length

Worst case at the caps in `limits.ts`, including scheme and host:

| Configuration | Query | Full URL |
| --- | --- | --- |
| Door, half-glazed, two side lights, top light, saturated bars | 230 | 262 |
| Casement, 6 × 6 lights, every light with 12 × 12 true bars | 710 | 742 |
| Tilt and turn, 6 × 6 saturated | 715 | 747 |
| Sash | 143 | 175 |
| Fixed | 110 | 142 |

A typical default door is 137. The worst case is bounded by `MAX_GRID_COLUMNS`,
`MAX_GRID_ROWS` and `MAX_BAR_DIVISIONS`, which is why those caps are a product
decision rather than only a technical one.

## Migration policy

Stated in full at the top of `src/config/migrations.ts`. In short: the version
increments only when a field changes meaning or is removed; key codes are never
reused and retired ones are listed in `RETIRED_KEYS`; migration runs on the raw
query parameters as a chain of single-version steps before any field is
decoded; a step that cannot express an old configuration decodes to the nearest
equivalent and tells the customer; a link from a newer build is read
best-effort rather than rejected.

## Placeholders requiring replacement before launch

- `material.ts` — which materials are actually sold, their sightlines, and the
  colour and finish restrictions on each.
- `limits.ts` — every size limit, grid cap and preset.
- `ral.ts` — the offered shade list and its approximate sRGB values.
- `safety.ts` — a simplified reading of Approved Document K (England and
  Wales). Not a compliance statement, and it cannot assess a window without the
  cill height above the finished floor.
