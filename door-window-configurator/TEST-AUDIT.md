# Test audit: every assertion rewritten this session

Scope: the whole session on this branch, 2026-09-11 (Step 1) to 2026-09-25.

Method, so the list can be checked rather than trusted:

1. `git show` for every commit on the branch, keeping each removed line of a
   test file (unit tests, `smoke.mjs`, `a11y.mjs`, the metric and bundle
   scripts).
2. The session transcript, for every edit to a test file whose old text held
   an assertion (57 edits). This catches tests written and then rewritten
   before a commit, which git alone would miss.
3. Each candidate read by hand and sorted: rewritten after a failure (A),
   weakened without a failure (B), harness changes that leave the
   assertion as it was (C), and fixtures updated for a changed model (D).
   New tests are not listed.

"Still fails if" says what a production fault would still be caught by the
test as it now stands. **Weaker** marks every rewrite that catches less
than it did before. **Mutation-checked** means production code was
deliberately broken and the test was seen to fail; otherwise the claim is
reasoned from the code.

## A. Rewritten after they failed

| # | Where (commit) | Why it failed | Assertion before | Assertion after | Still fails if |
|---|---|---|---|---|---|
| A1 | `url.test.ts` size limits per material (dab6763) | Deriving the leaf from the opening made a 3000 mm single door invalid in every material, aluminium included | Door 3000 × 2200: aluminium has no width error, timber does | Same assertions, with a window at 3500 × 2000 | The limits table stopped differing by material. |
| A2 | `url.test.ts` schema v3 (dab6763) | The finish became per side and safety per pane | `issues` keys `['ce','f']`; `finish` → `'smooth'`; `e.field === 'glazing.safety'`; `assessment.locations…area` | `['ce','fe']`; `finish.external`; `e.field.startsWith('glazing.safety')`; `assessment.panes…label` | An unsafe door raised no safety error, or a toughened one did. **Weaker:** `startsWith` accepts an error on any pane, not a named one. |
| A3 | `url.test.ts` v1 migration (dab6763) | v3 was added | `schemaVersion` is 2 | `schemaVersion` is 3 | The migration chain stopped short of v3. The literal must change again at v4, which is deliberate. |
| A4 | `url.test.ts` v2 side light (dab6763) | **A test bug.** The query appended a second `sl`, the first value (`sl=n`) won, and the light decoded as absent | `sl=400.n` appended | `sl=n` replaced by `sl=400.n`; same assertion | A v2 side light with no safety field did not decode as inheriting. |
| A5 | `geometry.test.ts` column weights (dab6763) | Each pane is inset by the bead, so pane widths do not keep the 3:1 ratio | Pane ratio ≈ 3, to 1 dp | Light ratio (pane + 2 beads) ≈ 3, to 6 dp; and lights + mullion = the opening, to 6 dp | Weights were distributed wrongly, or did not account for the whole opening. **Stronger.** |
| A6 | `smoke.mjs` console filter (dab6763) | Chromium's 404 message does not name the file, so the missing favicon failed the run | Ignore errors whose text includes "favicon" | Ignore errors whose source URL includes "favicon" | Any other console error appeared. |
| A7 | `url.test.ts` fallback view (99844f4) | The default view changed to elevation | `preset: 'three-quarter'` | `preset: DEFAULT_CAMERA_PRESET`, plus a new test that the constant is `'elevation'` | Nonsense fell back to anything but the default. The new test catches a wrong default; the rewritten one no longer would on its own. |
| A8 | `url.test.ts` default link length (dab6763) | The link grew with dual colour and safety | Default door link < 120 characters | < 160 | The default link grew past 160. **Weaker:** the limit was raised to fit, not reasoned from a need. The worst-case test (< 2000) is the real bound. |
| A9 | `url.test.ts`: "explicit none token", "explore colour not orderable" (dab6763) | Rewritten for the dual-colour schema | Decoding `sl=n` gives no light; a decoded explore colour stays explore | The first was removed, and the default-door round trip (which encodes `sl=n`) covers it. The second became `mintQuotable(explore)` is null | A `none` token decoded to a light (via the round trip); an explore colour could be quoted. |
| A10 | `geometry.test.ts` leaf matches validation (179df33) | The drawn leaf gained a clearance gap | Leaf size = `doorLeafWidth` / `doorLeafHeight` | Width − 2 × `LEAF_CLEARANCE`; height − `LEAF_CLEARANCE` | Geometry derived the leaf any other way. **Weaker:** the size of the clearance itself is asserted only against its own constant. |
| A11 | `geometry.test.ts` panels stand proud (179df33) | Panels were added to the inside face | 2 panels, each in front of the leaf; 5 groove slabs | 2 outside and 2 inside, each clear of its face; 5 + 5 slabs | A panel sank into the leaf on either face, or the count changed. |
| A12 | `url.test.ts` shade not offered (96195c5) | Timber left the range and so carries a material error | Timber door with RAL 6005: no errors at all | No error on any `colour` field | RAL 6005 were rejected for timber. **Weaker:** it no longer says the rest of that configuration is error-free. |
| A13 | `store.test.ts` unmakeable size (96195c5) | Material now reported first, so `errors[0]` changed | Some error mentions "Timber"; `errors[0]` states a range | The `width` error mentions Timber and states a range | The size were resized silently, or the reason lacked the range. **Stronger.** Rewritten again in W9. |
| A14 | `store.test.ts` commit in one pass (96195c5) | Timber non-offered | No errors | Errors are exactly `['material']` | Reconciliation or enforcement left any other error. |
| A15 | `smoke.mjs` keyboard step (96195c5) | Switching product reset the size | Width reads `927` | Width reads start + 1 | ArrowUp did not step by exactly 1 mm. |
| A16 | `doorEdits.test.ts` every style and panel valid (f60b723) | Glass low in a door is a critical location | `validateConfig(config)` has no errors | `validateConfig(enforceSafetyGlazing(config))` has no errors | Any non-safety rule failed for a combination. **Weaker** in isolation; enforcement is the store's only path, and safety has its own tests. |
| A17 | `smoke.mjs` link sampling (f60b723) | The URL was read once, before the debounced write under SwiftShader | Read the parameter after a fixed wait | Wait up to 5 s for the expected value, then assert the same pattern | The value was wrong, or took longer than 5 s. |
| A18 | `a11y.mjs` focus stays in the review (251c3d7, before commit) | A native modal dialog sends Tab to the browser's own UI, which the page sees as `body` | Focus was inside the dialog on all 40 presses | `body` counts as browser UI; only a page element outside the dialog is an escape; where focus went is reported | Focus reached any page element behind the dialog (e.g. `show()` instead of `showModal()`). Not mutation-checked. |
| A19 | `panel-contrast.mjs`, its first version (today, before commit) | It passed the catalogue on pairs that look identical, because tiles at different offsets differ in their outline pixels alone | Each tile screenshotted where it sits | Every drawing re-rendered on one fixed stage, plus a control that renders one drawing twice and must match | Two panel styles differed in fewer than 20 px by 64/255 in any renderer. Reproduced failing on the old code before the fix. |
| A20 | `panel-contrast.mjs` thumbnails (today) | Not a failure, a miss. The check passed door-set tiles that the owner reported look the same: at 23 px they cleared the 20 px floor. The door-set fixture itself first failed silently, twice: it was unbuildable (a 580 mm leaf), so the tiles drew the default door, and the "fixture is buildable" guard counted an element that is always present | 20 px; door-set fixture at 2100 mm; guard counts `.stage__stale` | 40 px, **raised after seeing the results and calibrated on the owner's report**, not reasoned beforehand; fixture at 2300 mm (780 mm leaf); guard counts the notice's text | A pair of panel styles differed in fewer than 40 px by 64/255. Before the fix to the door-set thumbnails the old tiles score 23 px (fail); after, 48 px (pass). |

### Today (these changes)

Every entry below was either mutation-checked or seen failing on the old code.

| # | Where | Why it failed | Assertion before | Assertion after | Still fails if |
|---|---|---|---|---|---|
| W1 | `geometry.test.ts` handle containment | **The old assertion encoded the bug:** `windowLightRects` is the glass aperture for an opening light, so it required handles on the glass | Every handle part within its light | Within its own sash's outer edge, from the sash parts emitted; also more than 20 handles exist | A handle left its sash, e.g. across the mullion. Mutation-checked: a handle moved outside its sash with no clamp fails it. |
| W2 | `geometry.test.ts` narrow light | As W1 (the light was −68 mm wide, so the old test was meaningless there) | Size ≤ light width; left ≥ light x | Size ≤ sash width; left and right edges within the sash; a handle exists | Furniture were lent to the neighbour. Mutation-checked. |
| W3, W4 | `geometry.test.ts` lever direction | The lever now rests down the stile, as a closed handle does. Lying across towards the hinge, it crossed the glass | `lever.x < plate.x` (left-hung) and `>` (right-hung) | Plate on the stile opposite the hinge; lever on the same x, longer than wide, below the plate; plus a new top-hung rail test | The lever lay across the sash, or the plate were on the hinge side. Mutation-checked: a horizontal lever fails both. |
| W5 | `windowPresets.test.ts` nothing escapes its light | As W1 | `cell-*` and `handle-*` within the light | `cell-*` within the light; `handle-*` within its sash | As W1. Mutation-checked. |
| W6 | `windowEdits.test.ts` tilt-and-turn hinge | `turnHingeSide` was removed (item 4) | The style-level `turnHingeSide` follows the light | The options hold only `grid` (edits, round trip, every preset); an old link with a contradicting `th` decodes by the light and re-encodes without `th` | A second hinge record returned, or an old link's `th` overrode the light. |
| W7 | `url.test.ts` fully loaded door | Aluminium now decodes to uPVC (item 5) | Aluminium door round-trips | The same door in uPVC round-trips; new: aluminium, timber and composite links open in uPVC with an `m` issue and the rest of the link kept | Any field were lost in a link, or a non-offered material decoded. |
| W8 | `url.test.ts` worst-case round trip | As W7 | Aluminium window round-trips | uPVC window round-trips | As W7. The length fixture also moved to uPVC maxima (same digit count, lengths unchanged; that test never failed). |
| W9 | `store.test.ts` unmakeable size | `setMaterial('timber')` is now refused | Set through the store | The same assertions through `commit()`; new: the store refuses all three unsold materials | A size were silently resized after a material change, or an unsold material could be set. |
| W10 | `windowEdits.test.ts` re-divide, per-light opening | The new default window (item 6) is three lights, not two fixed | Built from `DEFAULT_WINDOW` | Built from an explicit two-fixed-lights fixture; assertions unchanged | Unchanged. |
| W11 | `smoke.mjs` Step 7 | As W10 | Started from the default window | New: asserts the default window's `gd` and width exactly; then loads an explicit two-light link; the bars check is exact again (B1) | Unchanged, plus the default window checked in the browser. |

## B. Weakened without having failed

| # | Where (commit) | Before | After | Status |
|---|---|---|---|---|
| B1 | `smoke.mjs` "astragal bars everywhere" (fad24ad) | Exact: `1-1-1*1*f.aa_2_2_22.i-f.aa_2_2_22.i-shr.aa_2_2_22.i` | A pattern checking only that every cell carried the bars; not weights, rows or openings | Loosened before it had ever run, after reading the encoder. **Restored to exact today (W11).** |

## C. Harness changes; the assertions stayed as they were

- **Colour metric:** pixel detection was confined to the left of the panel, whose drop shadow spilled past its mask. A threshold raised from 30 to 90 was tried and reverted within a minute. The pass limit (ΔE ≤ 6) never changed.
- **Lighting metric:** the pass limit (relief ≥ 2×) never changed.
- **Smoke and a11y screenshots** mask the UI chrome, so the panel and title are not compared as part of the model.
- **The Step 3 "unmanufacturable size is not rendered" check** (rewritten after failing; **weaker in one respect**). Before: the canvas pixels are identical before and after typing 9000. After: the drawing's own dimension labels still read 1000 mm and never 9000, and the picture is marked stale. Why: the new "not drawn" notice makes the title taller and the camera re-frames to keep the door clear of it, so the pixels change although the model does not (confirmed: labels 1000 × 1981 before and after, top inset 194 → 368 px). A model that took the 9000 mm size would still fail it. What it no longer catches: a change to the drawing that leaves both dimensions the same.
- **The new stuck-state smoke check** first expected "Widen the frame" at 875 mm side lights on 2600 mm; the product correctly offers no such button there (it would pass the 2800 mm maximum) and says to narrow the side lights, which the check now does. The test's error, not the product's.
- **Strict-mode selector fixes:** "Hardware" (two buttons, now separated by `aria-label`); "Right" (scoped to the hinge group); "Both" (scoped to the side-light group); product switch buttons became radios.
- **The a11y sheet-drag check** became a three-state check (closed → half → full) when the sheet gained a third state. Stricter.
- **The a11y section loop** skips a section a window does not have (Surround). The Surround section is scanned with axe on a door instead.

## D. Fixtures updated for a changed model

Schema v3 (`safety: null` on every light and cell; finish as a pair) and the
Surround section (summary groups 5 → 6, the top light a radio rather than a
checkbox). The assertions are unchanged, or extended to the new field.

## What this audit does not cover

- Tests I wrote that never failed but might be too weak: A8 and A12 are the
  kind to look for. Nothing short of mutation testing the whole suite finds
  them systematically; W1–W5 and A19 are the only ones mutation-checked here.
