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
| `src/config/describe.ts` | The configuration in plain language: section summaries, the preview's text alternative, the Step 8 summary to come |
| `src/config/colourMath.ts` | HSV and hex conversion, CIE76 ΔE, nearest offered RAL shade |
| `src/config/colourEdits.ts` | Colour and finish edits as pure functions; explore never reaches a quote |
| `src/ui/ColourPanel.tsx` | Colour section: swatches, finish, inside, explore |
| `src/ui/SwatchGrid.tsx` | RAL swatch grid as a native radio group |
| `src/ui/ExplorePicker.tsx` | Colour wheel (pointer) with hue, saturation, brightness sliders and hex field (keyboard) |
| `src/config/doorEdits.ts` | Door option edits; the frame is never resized as a side effect |
| `src/ui/DoorStylePanel.tsx` | Door style, panels, side and top lights, handing, threshold |
| `src/ui/DoorHardwarePanel.tsx` | Handle, finish, letterplate, knocker, spyhole |
| `src/ui/OptionTiles.tsx` | Radio tiles and checkbox toggles |
| `src/ui/ElevationThumb.tsx` | Option thumbnails drawn from the same part list as the 3D model |
| `src/config/colourHex.ts`, `src/viewer/keys.ts` | Pure helpers kept out of three.js modules so first paint stays light |
| `src/config/windowEdits.ts` | Window style, divisions, per-light opening and bars, sash, vents; glazing edits |
| `src/ui/WindowStylePanel.tsx` | Layouts, window style, lights across and high, per-light opening and bars |
| `src/ui/LightPicker.tsx` | The window as choosable lights, with the elevation opening convention |
| `src/ui/BarEditor.tsx` | Glazing bars for any glazed area, window or door |
| `src/ui/WindowHardwarePanel.tsx` | Window handle, finish, trickle vents |
| `src/ui/GlazingPanel.tsx` | Unit, clear/obscure/tinted, safety glass with locked critical locations; door glass bars |
| `src/ui/Section.tsx` | Collapsible panel section (disclosure pattern) and the read-only readout |
| `src/ui/useSections.ts` | Which sections are open; sections with a problem start open |
| `src/ui/useSheetGesture.ts` | Phone sheet handle: tap or drag, non-modal |
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
npm test          # 228 unit tests, including text contrast read from styles.css
npm run dev -- --port 5180   # then, in another shell:
npm run smoke                # browser render, controls, wall scene, sizing
npm run a11y                 # keyboard-only walk, sheet by keys and drag, axe scans
npm run build && npm run check:bundle   # fails if first paint would wait on the 3D bundle
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

## The configuration panel (Step 4)

- **Sections** Style, Size, Colour, Glazing, Hardware, each a disclosure: a
  real button inside the section heading, `aria-expanded`, height animated
  over 240 ms. Collapsed, the header states what is chosen; a section with a
  problem says so in words ("1 issue") and starts open. Size has its controls;
  the other four show the current selection read-only until Steps 5-7.
- **Problems are shown where they can be fixed.** `sectionForField` routes
  every validation field to its section; unit tests fail if one is unrouted.
- **Phone:** a non-modal bottom sheet. Tap or drag the handle, Escape closes it
  and returns focus to the handle. Open, it stops just over half-way and the
  camera re-frames the product above it.
- **Keyboard and screen reader (Step 4.4):** a skip link is the first tab
  stop; every control is native; the canvas is never a tab stop; the preview
  is one image whose text alternative is written by `describeProduct`.
  `npm run a11y` checks it by doing it, and scans with axe (WCAG 2.2 AA and
  best practice): no violations. Axe cannot compute contrast over the frosted
  panel and lists it for review; `tokens.test.ts` covers that case instead.
- **Styling** stays plain CSS with tokens rather than the Tailwind the brief
  named — decided at Step 4, since the tokens are contrast-tested and the
  Steps 1-3 UI was already built on them. Interaction patterns were taken from
  21st.dev (a Base UI accordion and a snap-point drawer) and reimplemented,
  not installed.

## The colour system (Step 5)

- **Offered first (5.1).** A swatch grid of the RAL shades offered in the frame
  material, and only those — a native radio group, named and coded, with the
  chip as decoration.
- **Explore (5.2).** "Explore any colour" is marked "Not available to order"
  before it is opened and says why once it is. It sets an `ExploreColour`,
  which validation reports as non-orderable and `mintQuotable` refuses, so it
  cannot reach a quote however the page is driven (`colourEdits.test.ts`,
  including through a shared link). The Colour section is flagged "Not
  orderable", no swatch shows as chosen, and the closest offered shade is
  offered as the way back. The wheel is for pointers; three sliders and a hex
  field are the keyboard and screen-reader path.
- **Finish is separate (5.3)**, outside and inside, from the material's list.
- **Inside** follows the outside unless set to "Different"; switching changes
  nothing visible until something is picked.
- **Indicative only (5.4)**: the note is fixed to the foot of the panel.
- Colour edits change materials only. The 3D product keys its geometry on
  shape and its materials on appearance, so dragging the wheel re-tints
  without rebuilding (`Product.test.ts`), and commits at most once a frame.

## Door options (Step 6)

- **Style (6.1):** solid panel, half glazed, fully glazed; side lights none,
  left, right or both; a top light. Each tile shows the door as it would be
  built, drawn from `buildProduct`.
- **Panels (6.2):** flush, one to four raised panels (ovolo, chamfer, square),
  or grooved (across or up and down, three to six grooves), wherever the leaf
  has a solid area.
- **Handles and finishes (6.3, 6.4):** lever on backplate, lever on rose, pull
  bar, knob; polished chrome, satin chrome, black, brass, anthracite.
- **Furniture (6.5):** letterplate, knocker and spyhole, each on its own. A
  fully glazed leaf has nowhere to fix them: the toggles are disabled with the
  reason, the choices are kept for when the style changes back, and the
  description does not list them as fitted. House numerals are not offered
  (below).
- **Handing (6.6):** hinge side and opening direction, stated as viewed from
  outside.
- **The frame is the opening in the wall and is never resized as a side
  effect.** Side lights narrow the leaf and a top light shortens it. Where
  that leaves less door than before, or less than can be made, the panel says
  so and offers the frame size that keeps the door as it was — as a button.

## Window options and glazing (Step 7)

- **Styles (7.1):** casement, tilt and turn, sliding sash, fixed, and the named
  layouts in `windowPresets.ts` as a starting point. A layout sets the style
  and lights, never the size. **Bay is not offered** (deferred at Step 1: a
  bay is facets, a corner angle and a projection, which width × height cannot
  describe).
- **Divisions and bars (7.2):** one to six lights across and high; unequal
  proportions from a layout are kept until "Make them equal". Bars per light
  — Georgian (inside the unit), applied astragal, or true bars — with panes
  across and high, and "Use these bars in every light". The same bar editor
  serves door glass, in the Glazing section.
- **Openings (7.3):** per light, chosen on a drawing of the window that uses
  the elevation convention (lines meeting at the hinge). Casement: fixed,
  side-hung left or right, top-hung vent. Tilt and turn: fixed, tilt and turn
  left or right, tilt only.
- **Hardware (7.4):** lever on backplate, lever on rose, knob; the five
  finishes. Backplate and rose were drawn identically on windows and now
  differ (tall plate, round rose). Trickle vents in the frame head, 1 to 6.
- **Glazing (7.5), doors and windows:** double or triple; clear, obscure
  (stippled, reeded, cathedral, sandblast) or tinted (grey, bronze, blue);
  standard, toughened or laminated. At a critical location standard glass is
  disabled and the panes and the reason are stated. Obscure glass now renders
  partly diffusing — pale, as it looks in daylight — rather than clear glass
  with a texture over a dark room.

## Performance budget

`npm run check:bundle` reads the production build and fails if the entry
chunk imports, or the HTML preloads, the three.js chunk. Found broken at
Step 6 and fixed: React had been bundled inside the 3D chunk (Rollup pulls a
manual chunk's dependencies into it), and the SVG elevation imported a helper
from a three.js module, so first paint waited on 1 MB of WebGL code. Now the
first paint loads 88 KB of app and 156 KB of React; with the 3D chunk held
back four seconds, the elevation and controls are up in about 150 ms.

## Rendering

Lighting is measured, not judged by eye, because the defects it has had were
invisible in a single screenshot:

- **Relief on dark finishes comes from reflections, not shadows.** A shadow on
  RAL 7016 is still RAL 7016. The studio environment is built from uneven
  Lightformers so bevels facing different ways reflect different things.
  `lighting-metric.mjs` holds panelled against flush at 2x edge energy or more
  (currently 2.8x raised, 2.4x grooved; 3.1x and 2.6x before Step 7 added a
  soft light on the room side so that metal facing inside — window handle
  plates — reflects something other than black. A larger, brighter room-side
  light lifted the plates further but cost a fifth of the relief.)
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
- Step 8: summary, share link and enquiry.
- **Tilt and turn holds its hinge side twice**: per light (what is drawn) and
  as a style-level `turnHingeSide`. The panel keeps the second in step with
  the first opening light; the model should drop one.
- **Trickle vents** can be modelled in the sash or through the glazing, but
  only the frame-head position is drawn, so only it is offered.
- **No minimum light size.** A 600 mm window can be divided into six lights
  of under 100 mm. A limit is needed in `limits.ts`.
- Safety glass is set for the whole product. Per-pane overrides exist in the
  model (`SafetyOverride`) but have no control yet.
- **The model carries door options the renderer does not draw**, so they are
  not offered as controls: arched and circular leaf apertures, an arched top
  light, doctor's and urn knockers (every knocker draws as a ring), and
  trickle vents on doors. A link that sets one renders something different
  from what it describes. Either draw them or drop them from the model.
- **House numerals (6.5) are not offered.** Glyphs need a typeface, an art
  asset under the core constraint; deferred at Step 1 (`types.ts`).
- There is no minimum door-leaf HEIGHT: a top light can shorten a leaf to
  any height. A limit is needed in `limits.ts`.
- On a fully glazed door, furniture chosen earlier stays in the
  configuration (and the link) while not being fitted. The Step 8 enquiry
  must send what is fitted, not what is stored.
- The RAL list and its sRGB values are placeholders (`ral.ts`), as is which
  shades each material offers (`material.ts`). Woodgrain foil is modelled as
  a woodgrain-embossed foil in a solid RAL colour; named timber-effect foils
  (Golden Oak, Rosewood) are not in the model.
- There is no control for frame material in any step of the brief. A link
  carrying a material that is not offered shows the issue in Style, but the
  customer cannot fix it there — only by switching product, which resets.
- The default window is a casement in which no light opens (two fixed
  lights). Step 7 data, flagged rather than changed.
- Screen-reader behaviour is verified structurally (accessibility tree, axe),
  not by listening. NVDA and VoiceOver passes are outstanding.
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
