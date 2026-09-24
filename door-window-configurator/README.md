# 3D Door and Window Configurator

Phase 1, Steps 1 to 3: the state model, its URL serialisation, the 3D viewer,
and sizing. **Steps 4 to 8 are not built** — there is no configuration panel
yet, so the Size section sits below the stage rather than in one.

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
| `src/ui/SizePanel.tsx` | Sizing controls: two mm inputs, inline reasons, standard sizes |
| `src/viewer/geometry.ts` | Parametric part list, shared by the 3D scene and the SVG fallback |
| `src/viewer/shapes.ts` | Geometry per part shape: raised mouldings, lathed hardware |
| `src/viewer/materials.ts` | Physical materials; procedural woodgrain, texture and obscure-glass shaders |
| `src/viewer/Lighting.tsx` | Studio environment from Lightformers (no HDRI, works offline) and the key light |
| `src/viewer/Backdrop.tsx` | Studio contact shadow and glazing card; the wall scene (brick or render) |
| `src/viewer/Viewer.tsx` | Canvas, tone mapping, scene assembly (lazy-loaded) |
| `src/viewer/CameraRig.tsx` | Clamped orbit, the three camera presets, framing clear of the UI |
| `src/viewer/StaticElevation.tsx` | SVG elevation where WebGL is unavailable |
| `src/config/windowPresets.ts` | Named window configurations — data over the grid model |

```
npm install
npm run typecheck
npm test          # 163 unit tests, including text contrast read from styles.css
npm run dev -- --port 5180   # then, in another shell:
npm run smoke                # browser render, controls, wall scene, sizing
node scripts/lighting-metric.mjs   # relief on a dark finish: panelled vs flush, >= 2x
node scripts/colour-metric.mjs     # rendered RAL shades vs reference, CIE76 dE <= 6

npm run build:share   # two shareable files in dist-singlefile/
```

`build:share` produces `door-window-configurator.html` (the whole app inlined,
opens from the filesystem) and `catalogue.html` (every style as an SVG
elevation, each tile deep-linking into the 3D app). The Vite build empties
`dist-singlefile`, so the catalogue must be generated after it — which is what
`build:share` is for.

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

## What an error blocks

Every validation error declares whether it blocks the `render` or only the
`order`, at the point it is raised rather than inferred from its field name.

An unmanufacturable size blocks the render: the last valid model stays on
screen with the reason beside the input (Step 3.4). A material that has left
the range, an explore colour or a safety-glazing shortfall blocks only the
order — the product still draws as specified, because its shape is not what is
wrong with it. Treating the two the same made every link naming an
unsold material render the default product instead, silently discarding a
shape, size and style that were all perfectly drawable.

## Rendering

Lighting is measured, not judged by eye, because the defects it has had were
invisible in a single screenshot:

- **Relief on dark finishes comes from reflections, not shadows.** A shadow on
  RAL 7016 is still RAL 7016. The studio environment is built from uneven
  Lightformers so bevels facing different ways reflect different things.
  `lighting-metric.mjs` holds panelled against flush at 2x edge energy or more
  (currently 3.1x raised, 2.6x grooved).
- **Colour fidelity** uses Khronos PBR Neutral tone mapping, not ACES, which
  shifts saturated colours. `colour-metric.mjs` holds four RAL shades within
  dE 6 (currently 4.1 worst, on white).
- **Glass is transmissive with a real light transmittance** (78% double, 70%
  triple). In the studio a graded card behind the product, seen only through
  the glazing, gives the panes something to show; in the wall scene the room
  behind does the same job.
- **In a wall** is view-only: never in the link, never in the order. The wall
  and floor fade into the page. The wall does not take part in shadow
  mapping at all — see Outstanding.

## The catalogue

`catalogue.html` draws every door style, panel detail, surround and window
preset from `buildProduct` — the same part list the 3D scene uses. It is not
an illustration of the range: if a style is wrong on that page it is wrong in
the product.

## Outstanding

- No favicon. It is a branding decision, so none has been invented.
- Steps 4 to 8: the rest of the configuration panel (style, colour, glazing,
  hardware), summary and enquiry. The panel shell, product switch, sizing and
  setting are built.
- Shadows on the wall face are disabled. With the wall casting or receiving,
  the key light's shadow map put false shadows of the reveal and the door
  furniture on the brickwork up to 1.5 m from the opening. The root cause is
  not identified; the cost of the workaround is that the reveal throws no
  shadow across the frame head and a window cill none on the wall below.
- Vertical sliding sashes have no seal line round them yet; casements do.

## Placeholders requiring replacement before launch

- `material.ts` — the sightlines and the colour and finish restrictions.
  (Which materials are sold is answered: uPVC only, `OFFERED_MATERIALS`.)
- `limits.ts` — every size limit, grid cap and preset.
- `ral.ts` — the offered shade list and its approximate sRGB values.
- `safety.ts` — a simplified reading of Approved Document K (England and
  Wales). Not a compliance statement, and it cannot assess a window without the
  cill height above the finished floor.
