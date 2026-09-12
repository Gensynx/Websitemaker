# 3D Door and Window Configurator

Phase 1, Steps 1 and 2: the state model, its URL serialisation, and the 3D
viewer. **Steps 3 to 8 are not built.** There are no sizing inputs and no
configuration panel yet; dimensions come from the URL or the last session.

React + Vite + TypeScript, React Three Fiber and drei for 3D, Zustand for state.

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
| `src/config/layout.ts` | Door layout maths — one source of truth for the leaf |
| `src/state/store.ts` | The single commit pipeline: reconcile, enforce, validate, persist |
| `src/viewer/geometry.ts` | Parametric part list, shared by the 3D scene and the SVG fallback |
| `src/viewer/materials.ts` | Per-face materials; procedural woodgrain shader |
| `src/viewer/Viewer.tsx` | Canvas, studio lighting, contact shadow (lazy-loaded) |
| `src/viewer/CameraRig.tsx` | Clamped orbit and the three camera presets |
| `src/viewer/StaticElevation.tsx` | SVG elevation where WebGL is unavailable |
| `src/config/windowPresets.ts` | Named window configurations — data over the grid model |

```
npm install
npm run typecheck
npm test          # 72 unit tests
npm run dev       # then, in another shell:
npm run smoke     # browser render across four configurations and two viewports
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

## The commit pipeline

Every mutation goes through `commit` in `src/state/store.ts`, which reconciles
against the frame material, enforces safety glazing at critical locations, then
validates and persists. There is no setter that writes `config` directly:
reconciliation running only at decode time was a real gap, and the fix is
structural rather than a rule to remember.

Dimensions are the one thing reconciliation does not correct. The URL decoder
clamps `w` and `h` as it reads them, because a shared link has nobody present
to tell; an edit has, so validation reports the permitted range instead and the
viewer keeps showing the last configuration that could be made.

## Window presets

The grid model is four independent axes, which is right architecturally and
unusable commercially. `windowPresets.ts` sits on top as data: a preset
EXPANDS to a full `WindowStyle` and is then discarded. `ConfigState` never
records which preset was chosen and a link carries the expanded grid, so
renaming or withdrawing a preset cannot alter a product somebody already has,
and the grid editor underneath stays authoritative.

## Why elevation is the default view

Alignment, sightline balance and bar registration across a mullion can only be
judged square-on. A three-quarter opener flatters the product and hides
exactly what a customer needs to check first — and, during Step 2, hid four
geometry defects from us as well.

## Outstanding

- No favicon. It is a branding decision, so none has been invented.
- Steps 3 to 8: sizing controls, configuration panel, colour system, door and
  window option UI, summary and enquiry.

## Placeholders requiring replacement before launch

- `material.ts` — the sightlines and the colour and finish restrictions.
  (Which materials are sold is answered: uPVC only, `OFFERED_MATERIALS`.)
- `limits.ts` — every size limit, grid cap and preset.
- `ral.ts` — the offered shade list and its approximate sRGB values.
- `safety.ts` — a simplified reading of Approved Document K (England and
  Wales). Not a compliance statement, and it cannot assess a window without the
  cill height above the finished floor.
