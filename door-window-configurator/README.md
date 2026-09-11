# 3D Door and Window Configurator

Phase 1, Step 1 only: the state model and its URL serialisation. **No rendering
code exists yet and none should be added until the state model is signed off.**

React + Vite + TypeScript. React Three Fiber, drei and Zustand are deliberately
not yet installed — Step 1 has no need of them, and installing them early
invites rendering code to creep in ahead of approval.

## What is here

| File | Purpose |
| --- | --- |
| `src/config/types.ts` | `ConfigState` — the canonical model (Step 1.1) |
| `src/config/url.ts` | Total encoder/decoder to and from a query string (Step 1.2) |
| `src/config/units.ts` | Millimetre handling; the single rounding point (Step 3.5) |
| `src/config/ral.ts` | RAL palette — **placeholder data** |
| `src/config/limits.ts` | Manufacturable limits and size presets — **placeholder data** |
| `src/config/defaults.ts` | Default configurations and per-style option defaults |
| `src/config/storage.ts` | localStorage persistence; URL takes precedence |
| `src/config/url.test.ts` | Round-trip, hostile-input and rounding tests |

```
npm install
npm run typecheck
npm test
```

## Design decisions taken

**Discriminated union on `productType`, and again on style.** Per-style options
hang off the style discriminant, so a full-glazed door cannot carry raised panel
detailing and a fixed window cannot carry an opening direction. Adding a style
is a new key in `DoorStyleOptions` / `WindowStyleOptions` plus a parametric
builder; the compiler then reports every switch that must handle it.

**Colour is split by orderability.** `OrderableColour` (a RAL code) and
`ExploreColour` (a free hex value) are separate variants. The enquiry payload in
Step 8 will accept `QuotableConfig`, which narrows colour to `OrderableColour`,
so an explore colour cannot reach a quote by accident rather than by discipline.

**Glazing is two axes, not one.** The brief lists "clear, obscure, tinted,
double, triple" as one set. Appearance and pane count are independent, so they
are modelled separately as `appearance` and `unit`.

**Dimensions are floats in millimetres.** Rounded half-up to whole millimetres
exactly once, in `formatMm`, at the display boundary. The scene works in metres;
`toSceneUnits` is the only conversion point.

**The decoder is total.** Every path returns a usable configuration. Unknown,
missing or malformed values fall back to the default for that field and are
reported in `issues` for the UI to surface as a non-blocking notice. An
out-of-range dimension is clamped, not rejected — a shared link should still
open.

**Every field is encoded, including the off ones.** `lp=0` rather than omitting
the key. Encoding an option by its presence alone makes "the customer switched
this off" indistinguishable from "this link predates the option", and the two
must fall back differently. A typical door link is 113 characters.

## Placeholders requiring replacement before launch

- `src/config/limits.ts` — every size limit and preset is a plausible industry
  figure, not a supplied one.
- `src/config/ral.ts` — both the list of offered shades and the approximate sRGB
  values.
