# revolearn.co.uk — design teardown

**Captured:** 28 October 2026 · **Method:** Playwright + Chromium 1243, live site, computed values only
**Analyst note:** every measurement below cites the harvest JSON in `raw/`, not the raw CSS. Where a first-pass
measurement turned out to be an artefact of my own tooling, the correction is stated inline rather than quietly dropped.

---

## 1.1 Egress gate

```
curl -sSL -o /dev/null -m 15 -w "%{http_code} %{url_effective}\n" https://revolearn.co.uk/
200 https://revolearn.co.uk/
```

Final code **200**. No redirect — the apex is canonical, so every later step uses `https://revolearn.co.uk`.

This gate failed twice before it passed. The first two attempts returned `000` with `CONNECT tunnel failed, response 403`
— an egress-policy denial, not a site fault. The allowlist edit only took effect in a freshly provisioned container,
because the network policy is bound at session start. Noted here because it is the single most likely thing to break a
repeat of this teardown.

## 1.2 Capture

Eight distinct page types, driven in a real browser at 1440×900 and 390×844. Seventeen internal routes were
enumerated from the homepage; the eight below cover every distinct template. Omitted: `/privacy`, `/terms`,
`/safeguarding` (legal boilerplate), `/join-our-team` (recruitment), and five sibling subject pages
(`/a-level-maths-tuition`, `/gcse-english-tuition`, `/a-level-english-tuition`, `/gcse-science-tuition`,
`/a-level-science-tuition`) which share the `/gcse-maths-tuition` template.

| URL | Status | Failed requests | `document.fonts.status` | `document.fonts.size` | Requests | Transfer |
|---|---|---|---|---|---|---|
| `/` | 200 | 0 | loaded | 5 | 44 | 408 KB |
| `/pricing` | 200 | 0 | loaded | 5 | 34 | 390 KB |
| `/how-it-works` | 200 | 0 | loaded | 5 | 29 | 324 KB |
| `/about` | 200 | 0 | loaded | 5 | 36 | 393 KB |
| `/reviews` | 200 | 0 | loaded | 5 | 32 | 382 KB |
| `/faq` | 200 | 0 | loaded | 5 | 28 | 325 KB |
| `/gcse-maths-tuition` | 200 | 0 | loaded | 5 | 29 | 332 KB |
| `/contact` | 200 | 0 | loaded | 5 | 32 | 335 KB |

**No page returned non-200.** Raw HTML in `raw/` provenance, stylesheets listed below, screenshots in `screens/`
at both widths (`-1440.png`, `-390.png`).

## 1.3 Capture integrity

**PASS — measurement is safe.**

- **`requestfailed` events: zero, across all eight pages.** Nothing was blocked.
- **Every subresource is same-origin** (`revolearn.co.uk`). No Google Fonts, no CDN, no third-party analytics on the
  critical path. The allowlist risk I flagged before capture turned out not to exist: the site self-hosts everything.
- **`document.fonts.status === "loaded"`** on all eight pages, `size === 5`.

One nuance that a naive read would misreport: of the five font faces, four report individual status `unloaded`.
These are the Cyrillic, Cyrillic-ext and Latin-ext **unicode-range subsets** of Caveat
(`unicode-range:u+0460-052f,…`). English content never requests those codepoints, so the browser correctly declines
to fetch them. `document.fonts.status` is `loaded` because nothing is pending. This is correct subsetting, not a
failed load.

Three stylesheets, all same-origin, all 200:

```
/_next/static/css/f245fd843be22621.css   31,766 B
/_next/static/css/f54b8afd480333e5.css   28,537 B
/_next/static/css/e79333071b0730c4.css    1,278 B
```

Stack: Next.js, statically exported. Lenis for smooth scroll. Tailwind present, but the site's own design system is
hand-written CSS layered over it.

## 1.4 Computed style harvest

`raw/harvest.json` (1.4 MB) holds, per page, per viewport at **390 / 768 / 1024 / 1440**: computed styles for every
heading level, body text, link, button and card; resolved custom properties; container max-width and padding; plus
the full media-query and keyframes enumeration from `document.styleSheets`. Supporting files: `raw/deep.json`
(containers, contrast pairs, landmarks, motion), `raw/contrast.json` (279 computed pairs), `raw/perf-a11y.json`
(timings, alt-text audit), `raw/structure.json` (section order, CTA ladder), `raw/gaps.json` (gutters, component
states), `raw/final.json` (no-JS test, rating context).

**Correction worth recording:** the design tokens do **not** resolve on `:root`. They are declared on a page-scoped
wrapper, `.rl-home-root`. A `getComputedStyle(document.documentElement)` harvest returns empty strings for 38 of the
39 semantic tokens and would have produced a silently empty colour section. The values below are read from the
element that actually carries them.

---

## 2.1 Structure

Section order on `/`, with surface colour and the persuasion job each block is doing:

| # | Section | Surface | Height | Doing |
|---|---|---|---|---|
| 1 | Hero — "Built around the student" | `#1a1a1a` dark | 0.70 vh | Promise + product glimpse. A "Your plan" card shows a fabricated but concrete student state (Grade 5 in Maths, Quadratic equations, Friday 4:00pm). |
| 2 | Student reviews | `#faf7f0` cream | 1.24 vh | **Proof, placed second.** Three video testimonials, Google 5.0 / 45 reviews badge. |
| 3 | Start with the full picture | `#ffffff` white | 0.82 vh | The offer: three subjects, three-step method. |
| 4 | One-to-one, with a plan behind it | cream | 0.98 vh | Method and differentiation. |
| 5 | Progress stays visible | white | 1.00 vh | **Dual-audience split** — "A clearer path to your goals" (student) beside "Reassurance at every step" (parent). |
| 6 | Questions, answered | cream | 0.69 vh | Objection handling, six FAQs. |
| 7 | Final CTA — "Ready to see what focused support could look like?" | `#1a1a1a` dark | 0.49 vh | Conversion. |

Surface rhythm: **dark → cream → white → cream → white → cream → dark**. Three surfaces only, dark at both ends.
The page is bookended, not gradient-washed.

**The notable structural decision is proof at position two** — before the offer is explained. The site asks you to
believe other people first, then explains itself.

**CTA ladder on `/`** — three instances, all identical in label and target:

| Position | Context |
|---|---|
| 0.01 vh | Sticky header (persistent, 77px, `bg-cream/[.97]`) |
| 0.45 vh | Hero, primary |
| 5.78 vh | Final CTA section |

Every CTA sitewide is `Message us on WhatsApp` → `https://wa.me/447949348441?text=Hello%20Revolearn,%20I%20would%20like%20to%20enquire%20about%20tutoring.`
— pre-filled message included. Two to three per page, never more.

**Scroll depth** (desktop / mobile, viewport heights):

| Page | 1440 | 390 |
|---|---|---|
| `/contact` | 2.61 | 4.51 |
| `/faq` | 4.03 | 5.58 |
| `/pricing` | 4.53 | 7.31 |
| `/about` | 4.70 | 7.57 |
| `/how-it-works` | 5.05 | 8.49 |
| `/` | 6.60 | 11.51 |
| `/gcse-maths-tuition` | 9.38 | 16.71 |
| `/reviews` | 10.14 | 23.34 |

`/reviews` at 23 viewport-heights on mobile is the outlier and is simply a long list.

## 2.2 Typography

**Two families, both self-hosted woff2 variable fonts.**

- **Lexend Variable** (`/fonts/lexend-variable.woff2`), weight axis 100–900, `font-display:swap`. Carries all UI and
  content text. Lexend is a legibility-research typeface designed to improve reading proficiency — a defensible,
  non-decorative choice for a tutoring brand.
- **Caveat Variable** (4 unicode-range subsets), weight axis 400–700. Used **only** for decorative background
  annotation, never for content.

Resolved stacks:

```
--font-display:    var(--font-lexend), system-ui, sans-serif
--font-text:       var(--font-lexend), system-ui, sans-serif
--font-hand-stack: var(--font-hand), "Segoe Print", cursive
```

**No family resolved to a fallback.** Every sampled element computed to `"Lexend Variable", system-ui, sans-serif`.

### Scale (computed, `/` unless noted)

| Role | 390 | 768 | 1024 | 1440 | Token |
|---|---|---|---|---|---|
| h1 hero | 44px | 44px | 47.1px | 64px | `--h-hero: clamp(44px,4.6vw,64px)` |
| h2 section | — | — | — | 46–52px | `--h-section: clamp(36px,3.7vw,52px)` |
| h2 sub | — | — | — | 32–36px | `--h-sub: clamp(28px,2.6vw,36px)` |
| h3 card | 18px | 22px | 22px | 22px | `--h-card: 22px` |
| h4 item | 19px | 19px | 19px | 19px | `--h-item: 19px` |
| body | 17px | 17px | 17px | 18.72px | `--lede: clamp(17px,1.3vw,19px)` |

**Ratio between steps at 1440:** 64 → 52 → 36 → 22 → 18.72 → 17. That is roughly **1.23 / 1.44 / 1.64 / 1.17 / 1.10**
— deliberately *not* a uniform modular scale. The gap is widest between section heading and card heading (1.64),
which is what gives the page its clear two-tier hierarchy; the lower steps are compressed so cards and body sit close
together.

**Line heights:** display is set tight — h1 `line-height: 1.0` (64px/64px). Section h2 ≈ 1.05 (52/54.6). Card h3 1.35
(22/29.7). Body 1.55 (18.72/29.016). A clean inverse relationship: the larger the type, the tighter the leading.

**Letter spacing on display sizes:** `--track-display: -0.03em`, `--track-heading: -0.025em`. Computed: h1 −1.92px at
64px, h2 −1.3px at 52px, h3 −0.33px at 22px. Body is `normal`. Negative tracking applied only above ~20px, which is
correct — tightening body text would hurt.

**Measured characters per line, body copy at 1440** (via `Range.getClientRects()` line-box counting, not estimation):
**53, 61 and 75 ch** across three paragraphs at 540px, 600px and 660px column widths. The 45–75 ch comfort band is
respected, but the 660px column sits exactly on the ceiling. The `max-w-prose` container computes to **660.417px**.

## 2.3 Colour and surface

**39 semantic tokens**, declared on `.rl-home-root`. (The harvest also lists ~64 Tailwind internals like
`--tw-ring-color`; those are plumbing, excluded here.)

```
GROUND        --cream           #faf7f0    page default
              --dark            #1a1a1a    hero + final CTA
              --dark-card       #262626    cards on dark
                                 #ffffff   white band (alternating sections)

INK           --ink             #171717    primary text
              --ink-soft        #2a2a2a
              --grey            #6b6b6b    secondary
              --grey-soft       #767063    captions / eyebrows

ON DARK       --on-dark-lede    #c9c9c9
              --on-dark-muted   #8a8a8a
              --on-dark-caption #a39d90
              --on-dark-line    #303030

ACCENT        --gold            #eac050    the brand accent
              --gold-deep       #d9a93b
              --gold-text       #8c680c    gold legible on light
              --icon-pale       #f5e7bb
              --icon-highlight  #fffdf8

LINE          --border          #e7e1d2
              --line-strong     #d6ccb6

PLACEHOLDER   --placeholder     #dad5c8    --placeholder-deep #c8c2b4
              --placeholder-text #5e5a50

BACKDROP      --backdrop-hi     #f8f3e8    --backdrop-mid #f2ede2  --backdrop-lo #eee8da

ACTION        --wa-fill         #15803d    WhatsApp green
              --wa-fill-hover   #166534
              --wa-edge         #8c680c
```

**Surface levels: four** — `#1a1a1a` dark, `#faf7f0` cream, `#ffffff` white, `#262626` dark-card. Plus a three-step
backdrop ramp (`hi`/`mid`/`lo`) for subtle tonal blocks within cream.

**Elevation is expressed almost entirely by surface change and hairline borders, not shadow.** There is exactly one
shadow token — `--shadow-note: 0 10px 30px rgba(0,0,0,.08)` — reserved for the "note" cards (the hero plan card, the
lesson-review note). Everything else separates by a 1px `--border` hairline against a different ground. This is a
deliberate, disciplined choice and it is why the page reads as calm.

**Dark mode: not implemented.** No `prefers-color-scheme` media query exists anywhere in the three stylesheets. The
dark sections are compositional, not a theme.

**Note on `--gold-text: #8c680c`.** The system carries two golds: `--gold #eac050` for use on dark, and
`--gold-text #8c680c` for use on light. That is the correct way to solve accent legibility across inverted surfaces,
and it is used correctly in most places.

### Contrast (279 computed pairs, `raw/contrast.json`)

Measured as computed `color` against the effective painted background, walking the ancestor chain. **Thresholds:**
4.5:1 normal, 3:1 large (≥24px, or ≥18.66px at ≥700).

Representative passes:

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#171717` | `#faf7f0` | **16.76:1** | body/headings on cream |
| `#171717` | `#ffffff` | **17.93:1** | headings on white |
| `#ffffff` | `#1a1a1a` | **17.40:1** | hero text |
| `#c9c9c9` | `#1a1a1a` | **10.51:1** | hero lede |
| `#eac050` | `#1a1a1a` | **10.07:1** | gold accent on dark |
| `#a39d90` | `#1a1a1a` | **6.45:1** | dark captions |
| `#6b6b6b` | `#faf7f0` | **4.98:1** | secondary text |
| `#8c680c` | `#ffffff` | **5.12:1** | gold-on-light token |
| `#767063` | `#faf7f0` | **4.60:1** | smallest eyebrow text, 11px |
| `#ffffff` | `#15803d` | **5.02:1** | WhatsApp button |

**Flagged — one real failure:**

| Foreground | Background | Ratio | Threshold | Element |
|---|---|---|---|---|
| `#eac050` | `#faf7f0` | **1.61:1** | 4.5:1 | `★★★★★` in the Google reviews badge, 16px |

Gold stars on cream. Appears on `/`, `/pricing` and `/gcse-maths-tuition`.
**Mitigation, verified:** the stars carry `aria-hidden="true"` and the rating is given in adjacent live text —
"5.0 … 45 Google reviews". Assistive tech gets the rating; the failure is purely visual, for low-vision sighted users.
Real, but minor. The fix is one token swap to `--gold-text #8c680c` (5.12:1), which the system already has.

**Two findings I initially flagged and then disproved — recorded so they are not re-raised:**

1. *"`#171717` on `#000000` = 1.17:1 across nine headings."* **False positive.** These are `.rl-mark` spans, whose
   background is `linear-gradient(transparent 60%, rgba(234,192,80,.45) 0, …)` — a highlighter-pen band over the lower
   40% of the text, animated in via `background-size: 0 100% → 100% 100%`. My ancestor walk hit a transparent
   `background-color` and parsed it as black. The true ground is cream, or cream blended with 45% gold (≈`#f3dea8`).
   Both are high-contrast. Not a defect.
2. *"`sr-only` text at 1.17:1."* **False positive.** `.sr-only` is `clip:rect(0,0,0,0)` — visually hidden by design.
   No contrast obligation.

**Decorative sub-threshold text, by design:** the background equations and literary annotations render in Caveat at
`rgba(255,255,255,0.14)` on dark — deliberately near-invisible texture. **161 of 168** such nodes are `aria-hidden`.
Seven are not, which is a small tidiness gap rather than a barrier.

## 2.4 Spacing and layout

**Container:** `max-width: 1200px` (`.shell` / `.rl-wrap`). Prose columns clamp separately to **660px**
(`.max-w-prose`).

**Gutter ladder, measured:**

| Viewport | Container width | Side padding |
|---|---|---|
| 390 | 390 | 20px |
| 560 | 560 | 20px |
| 640 | 640 | 32px |
| 768 | 768 | 32px |
| 1024 | 1024 | 40px |
| 1100 | 1100 | 40px |
| 1280 | 1200 (capped) | 40px |
| 1440 | 1200 (capped) | 40px |
| 1560 | 1200 (capped) | 40px |

Three-step gutter: **20 → 32 → 40px**, with the container pinning at 1200px from 1280 upward.

**Breakpoints enumerated from `document.styleSheets`** — 17 distinct, which is more than a tidy system needs:

```
max-width:  560, 640, 700, 800, 900, 1000, 1023, 1100
min-width:  640, 680, 700, 768, 1024, 1100, 1280, 1440, 1560
plus:       prefers-reduced-motion: reduce | no-preference
```

The mix of `max-` and `min-` width queries with near-duplicate values (700 appears as both; 1023 and 1024 both appear)
suggests accretion rather than a designed ladder. It works, but it is the least disciplined part of the system.

**Vertical rhythm:** one token governs section spacing — `--section-y: clamp(72px, 8vw, 112px)`. Within sections the
spacing scale is a loose 2px grid rather than an 8pt system: observed values 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,
24, 26, 28, 30, 32, 40, 44, 48px. Hand-tuned, not generated.

**Radii:** 2, 3, 8, 10, 14, 18px and `999px` for pills. Cards sit at 10–14px; buttons are fully round.

**Deliberate grid breaks:** the decorative annotation layer (`.rl-page-thread`, the Caveat equations) is positioned
absolutely, ignores the container, and bleeds past the viewport edge — at 360/390px, 37–44 elements extend beyond
`clientWidth`. **This causes no horizontal scroll**, because `.rl-page { overflow: hidden }` clips it. Verified across
all eight pages at 360/390/768/1024/1440: `scrollWidth` never exceeds `clientWidth`. Intentional bleed, correctly
contained.

## 2.5 Motion

**Eight keyframe animations:** `rl-rise`, `rl-fade-up`, `rl-card-in`, `rl-write`, `rl-underline`, `rl-tick-pop`,
`rl-ring`, `wa-arrive`.

| Animation | Trigger | Duration | Easing | Animates |
|---|---|---|---|---|
| `rl-rise` | page load, hero | 0.95s | `cubic-bezier(.16,1,.3,1)` | transform + opacity |
| `rl-fade-up` | page load | 0.60s | same | transform + opacity |
| `rl-card-in` | page load, hero card | 0.90s | same | transform + opacity + scale |
| `wa-arrive` | page load, CTA | 1.00s | same | transform |
| `rl-ring` | `.is-lit` state | 1.20s | same | icon ring pulse |
| `rl-write` / `rl-underline` / `rl-tick-pop` | state | — | same | annotation draw-on |

**Scroll-triggered reveals** (IntersectionObserver adding `.is-in`), gated behind
`@media (prefers-reduced-motion: no-preference)`:

```css
.rl-reveal, .rl-reveal-calm, .rl-reveal-card, .rl-reveal-item, .rl-carousel {
  transition: transform .7s cubic-bezier(.16,1,.3,1), opacity .5s ease-out;
  transition-delay: var(--rl-reveal-delay, 0ms);
}
.rl-reveal      { transform: translateY(24px) }
.rl-reveal-calm { transform: translateY(40px) }
.rl-reveal-item { transform: translateX(28px); opacity: .25 }
.rl-reveal-card { transform: translateY(56px) scale(.96); opacity: .35 }
```

Staggering is done with `--rl-reveal-delay` at 0 / 70 / 140ms.

**The signature device: `.rl-page-thread`.** A single gold SVG line (`stroke: #eac050`, `stroke-width: 3px`) that
starts at the hero plan card and snakes down the entire page, passing through every section to the footer. It is drawn
on scroll via `stroke-dasharray` / `stroke-dashoffset` (`transition: stroke-dashoffset .55s cubic-bezier(.16,1,.3,1) .12s`).
Three paths. It is the one piece of motion here that is doing real work rather than decorating: it visually asserts
continuity — "a plan that runs through everything" — which is precisely the product claim.

**Easing discipline:** `cubic-bezier(.16,1,.3,1)` (a strong ease-out) is used almost universally, tokenised as
`--ease-out`. Micro-interactions on controls use the faster `cubic-bezier(.4,0,.2,1)` at 0.15–0.2s. Two curves, two
speed bands, applied consistently.

### `prefers-reduced-motion` — verified by emulation, not by reading CSS

Rendered twice with the media feature emulated:

| | `no-preference` | `reduce` |
|---|---|---|
| Running animations | **8** | **0** |
| Elements with `animation-name` | 8 | 0 |
| Elements at opacity < 1 | **25** | **3** |
| Transformed elements | 49 | 10 |

**Respected, and respected correctly.** The mechanism is the standard global reset plus per-component opt-outs:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto }
  *, ::after, ::before {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

The important part is the opacity column. The common failure mode for reveal systems is that disabling the animation
leaves content stranded at its starting opacity. Here, elements at opacity < 1 fall from 25 to 3 — content ends up
**visible**, not hidden. The reveal styles are scoped inside `@media (prefers-reduced-motion: no-preference)`, so under
`reduce` the starting transform and opacity are never applied in the first place. That is the right construction.

**Verdict on the motion: mostly doing work.** The thread earns its place. The staggered reveals are conventional but
restrained (0.5–0.7s, one direction, no bounce). Nothing loops, nothing autoplays, nothing competes with reading.

**One correction to my own process:** my first screenshots showed large blocks washed out at 25–35% opacity, which
looked like a defect. It was my capture artefact — scrolling too fast for IntersectionObserver. On a human-paced
scroll, **all 31 reveal elements reach `.is-in` and opacity 1** (verified: `isIn: 31, faded: 0`). The committed
screenshots were regenerated with a 250px/230ms scroll and show `residualFaded=0` on all sixteen captures.

## 2.6 Components

| Component | States | Affordances | Standard or specific |
|---|---|---|---|
| **Sticky header** | one — does not shrink, shade or shadow on scroll (verified at scrollY 1400: identical height 77px, identical `rgba(250,247,240,.97)`, `box-shadow: none`) | nav links, "Subjects" disclosure, persistent WhatsApp CTA | Standard, unusually static |
| **WhatsApp CTA pill** | default / hover / focus / `wa-arrive` entrance | 44px height, `border-radius:999px`, `#15803d`, white label + icon, pre-filled `?text=` | **Specific** — conversion is a messaging handoff, not a form |
| **Hero "Your plan" card** | static | white card, `--shadow-note`, three labelled rows (Current level / This week's focus / Next lesson) | **Specific** — product glimpse as hero art |
| **Video testimonial card** | poster / play / duration badge | 9:16 poster, centred play button, duration pill, name + "GCSE STUDENT" below | Standard pattern, well executed |
| **Google reviews badge** | static | G logo, "5.0", stars, "45 reviews" | Standard |
| **Subject icon tile** | static, `.is-lit` ring pulse | pale gold circle, line icon, title, one-line benefit, GCSE/A-Level tags | Standard |
| **Numbered step** | reveal-in, staggered | gold numeral disc, title, body | Standard |
| **Pricing card** | static | eyebrow rule + label, large £ figure, "per hour, per subject", qualifier, three subject chips | Standard, very legible |
| **FAQ accordion** | collapsed / expanded via `aria-expanded` | custom (no `<details>`; 0 found), 9–15 per page | Standard |
| **Mobile nav** | closed / open | `aria-label="Open menu"`, `aria-expanded` toggles correctly, reveals 15 links | Standard |
| **Checklist row** | reveal-in | gold circle tick, label, description | Standard |
| **Annotation layer** | draw-on | Caveat equations, Macbeth quote, hand-drawn circle, the gold thread | **Specific — the brand's whole identity** |
| **Lesson-review note** | static | rotated white note card, `--shadow-note`, handwritten-style content | **Specific** |

**No contact form exists anywhere on the site.** Zero `<input>`, `<textarea>` or `<select>` elements across all eight
pages, and `/contact` has no `<form>`. Conversion is WhatsApp (pre-filled), `tel:07949348441`, and
`mailto:revolearnuk@gmail.com`. For a small UK service business whose buyers are parents on phones, this is a
defensible and probably correct decision — it removes the highest-friction step entirely.

## 2.7 Copy

**Voice:** second person to the parent ("your child"), third person about the student ("they", "their"), first person
plural for the company ("we"). The dual-addressing is explicit and structural — one homepage section is literally
split into "A clearer path to your goals" (student) and "Reassurance at every step" (parent).

**Measured** (navigation and footer chrome stripped):

| Page | Sentences | Words | Avg sentence | Flesch–Kincaid grade | Reading ease |
|---|---|---|---|---|---|
| `/` | 62 | 832 | 13.4 | 7.2 | 67 |
| `/pricing` | 35 | 591 | 16.9 | 8.7 | 62 |
| `/how-it-works` | 54 | 852 | 15.8 | 8.3 | 63 |
| `/about` | 22 | 464 | 21.1 | 10.3 | 59 |
| `/reviews` | 104 | 1297 | 12.5 | 7.6 | 63 |
| `/faq` | 46 | 644 | 14.0 | 7.8 | 64 |
| `/gcse-maths-tuition` | 83 | 1581 | 19.0 | 10.0 | 58 |
| `/contact` | 17 | 281 | 16.5 | 8.7 | 62 |
| **Sitewide** | **423** | **6542** | **15.5** | **8.4** | **63** |

Grade 8.4 / reading ease 63 is plain English — appropriate for parents, and notably *not* dumbed down. Tense is
present and declarative throughout. `/about` and `/gcse-maths-tuition` drift longer (21 and 19 words per sentence)
and are the two pages that read as heaviest.

**Three representative lines, verbatim:**

> "Personal 1:1 online GCSE & A-Level tutoring that adapts to each student, helping them reach the next step."

> "Every lesson is planned around the student in front of the tutor, not a fixed programme."

> "There is no obligation."

**What the copy claims, and how it handles proof:**

- **Proof is specific and externally anchored.** Google reviews badge (5.0, 45 reviews, referenced 24 times sitewide),
  three named video testimonials with transcripts in the DOM, `VideoObject` JSON-LD. No anonymous "parents say…".
- **Pricing is stated upfront, not gated.** `£` appears 27 times. "GCSE lessons start from £25 an hour and A-Level
  lessons from £30, charged per subject." The charged-per-subject caveat — the thing that doubles a bill — is stated
  in the same sentence as the price, not buried. That is unusually honest.
- **Objections are named directly.** "There is no obligation" (7 instances). Safeguarding/DBS referenced 8 times.
  Exam boards named 15 times (AQA, Edexcel, OCR) — answering "do you know *my* child's syllabus?".
- **Claims are hedged, not absolute.** 48 hedging constructions (*can*, *helps*, *aims*) against 13 absolutes, and
  **zero** instances of "guarantee", "promise" or "risk-free". For a sector where grade-guarantee puffery is common,
  the restraint is a trust signal in itself.

---

## 3.1 Verdict

### WORTH TAKING

1. **The continuous thread as a structural device.** One gold SVG line drawn on scroll, running hero → footer through
   every section. It is cheap (3 paths, one `stroke-dashoffset` transition), it is unmistakably ownable, and it does
   argumentative work — it asserts continuity, which is the product claim. The single best idea on the site.
2. **Two accent tokens for one accent colour.** `--gold #eac050` for dark grounds, `--gold-text #8c680c` for light.
   This is the correct structural answer to accent legibility across inverted surfaces, and it is the fix for the
   site's own one contrast failure.
3. **Elevation by surface and hairline, not shadow.** Exactly one shadow token in the entire system, reserved for two
   "note" components. Everything else separates by a 1px border against a different ground. This is why the page
   reads calm at 6.6 viewport-heights.
4. **Reveal styles scoped inside `@media (prefers-reduced-motion: no-preference)`.** Not a global override bolted on
   afterwards — the starting transform and opacity are never applied under `reduce`. Verified: content ends visible,
   not stranded. This is the construction most reveal systems get wrong.
5. **Tight display leading with negative tracking above 20px only.** h1 at `line-height: 1.0` and −0.03em; body
   untouched at 1.55 and `normal`. A two-line rule that makes headlines look professionally set.
6. **Three-surface alternation, dark-bookended.** dark → cream → white → cream → white → cream → dark. Gives rhythm
   and a clear end without introducing a fourth colour.
7. **Price stated with its own worst caveat in the same sentence.** "from £25 an hour … charged per subject."
   Pre-empting the billing surprise where the buyer first sees the number is a transferable persuasion move.
8. **Proof placed at position two, before the offer.** Structurally unusual and worth stealing where the proof is
   genuinely strong.
9. **Decorative bleed contained by `overflow:hidden` on the page wrapper.** 37–44 elements intentionally exceed the
   viewport at 390px with zero horizontal scroll on any page. The enabling pattern for ambient background art.
10. **Two easing curves, two speed bands, tokenised.** `--ease-out: cubic-bezier(.16,1,.3,1)` for entrances at
    0.5–0.95s; `cubic-bezier(.4,0,.2,1)` for controls at 0.15–0.25s. Consistency, not variety.
11. **Decorative images explicitly marked.** All 22 homepage `<img>` carry an `alt` attribute; 21 are deliberate
    `alt=""` with text equivalents adjacent. **Correction to my own first pass:** I initially recorded these as
    "missing alt". They are not — zero images lack the attribute. Deliberate decorative marking is the correct
    pattern and the opposite of the defect I nearly reported.
12. **A fully self-hosted critical path.** Every subresource same-origin. No font CDN, no third-party on first paint.
    LCP 380–508ms on seven of eight pages.

### TEMPLATE DEFAULT

Present, competent, generic — adopting these would not improve anything in this repo.

1. Sticky translucent header at `bg-cream/[.97]`. It does not even shrink or gain a shadow on scroll (verified
   identical at scrollY 1400).
2. Three-column subject/feature tiles with a circular icon, a title and a one-line benefit.
3. Numbered 1-2-3 process steps with a coloured numeral disc.
4. FAQ accordion driven by `aria-expanded`.
5. Two-card pricing comparison with a large figure and a chip row.
6. Video testimonial cards with a centred play button and a duration badge.
7. Google reviews badge.
8. Dark final-CTA band with a centred question headline.
9. Footer with four link columns, company number and legal links.
10. `clamp()`-based fluid type. Standard practice now; the site's particular ratios are the interesting part, not the
    technique.
11. Staggered fade-up-on-scroll reveals at 0/70/140ms.
12. Breadcrumb + `BreadcrumbList` / `FAQPage` / `Service` JSON-LD on inner pages.

### ACTIVELY BAD

Would hurt a site in this repo, with the reason.

1. **Reveal start states that hide content when JavaScript does not run.** With JS disabled the page still renders and
   the DOM is complete (`innerText` 5,621 chars, h1 present), but reveal elements sit permanently at their start
   opacity — `.rl-reveal-item` at **0.25**, `.rl-reveal-card` at **0.35**. Entire testimonial cards and process steps
   are washed out and effectively unreadable, with no recovery path. **This repo's sites are committed static HTML
   whose whole premise is that they work with no build and no runtime.** Importing an IntersectionObserver-gated
   opacity system would trade that away for a fade. If reveals are wanted, the start state must be opacity 1 with the
   animation as pure enhancement, or gated behind a `.js` class set by an inline script before paint.
2. **17 breakpoints with near-duplicates.** `700px` appears as both `max-` and `min-`; `1023` and `1024` both appear;
   560/640/680/700/800/900/1000/1100 all carry rules. This is accretion. For hand-maintained static sites edited
   infrequently and often by a different person months later, this is a maintenance trap — copy the three-step gutter
   ladder (20/32/40 at a 1200px cap), not the breakpoint list.
3. **Gold-on-cream for anything that must be read.** `#eac050` on `#faf7f0` is **1.61:1**. The site gets away with it
   because the stars are `aria-hidden` with a text equivalent beside them. Copied naively onto a client site — for a
   rating, a price, an icon that carries meaning — it is a straightforward accessibility failure. The system already
   contains the fix (`--gold-text #8c680c`, 5.12:1); use it.
4. **Gold focus ring on light grounds.** The indicator itself is well built — verified by real keyboard `Tab`
   traversal, every focusable matches `:focus-visible` and receives `3px solid #eac050` with `outline-offset: 2px`.
   The problem is only the colour: **1.61:1 against cream, 1.73:1 against white**, versus 10.07:1 on the dark hero.
   WCAG 2.4.11 expects ≥3:1 for a focus indicator, so it fails on the surface that covers most of the site. A keyboard
   user on the cream body cannot reliably see where they are. Copy the 3px and the 2px offset; do not copy the ring
   colour — use `--gold-text #8c680c`. (The site already does something like this in one place: the WhatsApp button on
   dark takes a `#8c680c` ring, which at 3.4:1 only just clears the bar — the variants appear to be applied by
   component rather than by ground.)
5. **No skip link on any page.** Verified absent on all eight. With a 15-link header and a 61-focusable homepage,
   keyboard users traverse the whole nav on every page.
6. **Tokens scoped to `.rl-home-root` rather than `:root`.** Harmless inside a Next.js build, actively annoying in a
   hand-authored static site: every consuming rule must sit inside that wrapper, `getComputedStyle(document.documentElement)`
   returns nothing, and DevTools inspection of the palette is awkward. It cost me a measurement pass. In this repo,
   put tokens on `:root`.
7. **Smooth-scroll hijacking via Lenis.** The site ships a scroll library that overrides native scrolling
   (`html.lenis`, `.lenis-smooth { scroll-behavior: auto !important }`). It is JS weight and an input-feel override on
   a site whose content is text. None of this repo's sites need it.

### Observed but not attributable

Stated here rather than forced into a list:

- **`aria-expanded` without `aria-controls`.** The header "Subjects" disclosure reports `aria-expanded` and toggles it
  correctly, but `aria-controls` is `null` and I could not resolve the panel it governs. The accordions may well be
  wired correctly through another mechanism; I did not establish it either way, so I am not calling it a defect.
- **Seven of 168 Caveat decorative nodes lack `aria-hidden`.** I did not determine whether those seven are reached in
  the accessibility tree or are hidden by an ancestor I failed to walk.
- **Whether the "Your plan" hero card reflects a real product.** It presents as a product screenshot, but I saw no
  student-facing application on the public site. I cannot tell whether it is a genuine UI or an illustration, and that
  distinction matters before copying the pattern.
- **CLS, and performance on real mobile hardware over a real network.** Everything I measured is a warm datacentre
  load in headless Chromium. The LCP figures are a floor, not a field measurement.

## 3.2 Transfer constraint

| # | WORTH TAKING item | Transfers to a client marketing site? |
|---|---|---|
| 1 | Continuous scroll-drawn thread | **Yes, as a principle** — "one ownable graphic device that carries the page's argument". The specific gold line is Revolearn's. The repo's sites each need their own: a tape measure for a mechanic, a rule for the accountants. The technique (one SVG path, `stroke-dashoffset` on scroll) is cheap and framework-free. |
| 2 | Dual accent tokens (dark/light variants) | **Yes.** Pure system design, zero ed-tech content. Any site alternating dark and light sections needs this. |
| 3 | Elevation by surface + hairline, one shadow token | **Yes.** Fully general. Probably the highest value-per-effort item here. |
| 4 | Reveals scoped inside `no-preference` | **Yes**, as the *correct construction* if reveals are used at all — but see ACTIVELY BAD #1: the no-JS hole must be closed too. Transfer the scoping, not the start-state. |
| 5 | Tight display leading, tracking above 20px only | **Yes.** Pure typography. |
| 6 | Three-surface dark-bookended alternation | **Yes.** General compositional rhythm. |
| 7 | Price stated with its worst caveat attached | **Yes** — and sharply relevant to this repo. The accountants and mobile-mechanic sites have exactly this problem (per-service pricing, call-out fees). |
| 8 | Proof at position two | **Conditional.** Transfers only where proof is genuinely strong — 45 Google reviews and three video testimonials earn the position. With two text quotes it would read as thin. Judgement call per client, not a default. |
| 9 | Decorative bleed clipped at the wrapper | **Yes.** The enabling technique for ambient background art without mobile overflow. |
| 10 | Two easing curves, two speed bands | **Yes.** Pure system discipline. |
| 11 | Explicit `alt=""` on decorative images | **Yes.** Baseline correctness. |
| 12 | Self-hosted critical path | **Yes, and already the repo's convention** — sites here ship woff2 or data-URI fonts. Confirmation rather than news. |

**Nothing in the WORTH TAKING list is an ed-tech product pattern.** That is partly because this site has almost no
product surface: no dashboard, no streaks, no lesson cards, no gamified state, no login. The only product-shaped
element is the "Your plan" hero card, and I have deliberately classed it as a **non-transferable product pattern** —
it works because it shows a plausible student record, and a marketing site with no product behind it cannot
manufacture that honestly. The nearest transferable principle is weaker and worth stating separately: *show a concrete
artefact of the service rather than a stock photograph* — a sample report, a worked quote, an actual invoice layout.
That generalises; the dashboard mock does not.

---

## 4.1 Rubric

Ten criteria. Each is checkable by inspection or measurement, not by opinion. Scored 0–10.

| # | Criterion | How to check | Pass bar |
|---|---|---|---|
| 1 | **Fluid, bounded type scale** | Computed `font-size` of h1 and body at 390 and 1440 | h1 scales ≥1.3× between 390 and 1440 via `clamp()`; body measure 45–75 ch at 1440, measured by line-box count |
| 2 | **Tokenised colour** | Count semantic custom properties; trace every painted colour to one | ≥90% of painted colours resolve to a token set of ≤40 entries; zero hard-coded hex in component rules |
| 3 | **Text contrast** | Computed `color` vs effective background, all text nodes | 100% of content text ≥4.5:1 (≥3:1 large). `aria-hidden` decorative text exempt |
| 4 | **Focus visibility** | Focus each interactive element; read `outline`/`box-shadow` | Indicator ≥2px AND ≥3:1 against its own adjacent background, on **every** surface the element appears on |
| 5 | **Reduced motion, verified** | Re-render with `prefers-reduced-motion: reduce` emulated | Running animations → 0 AND no element carrying content left below opacity 0.9 |
| 6 | **Content survives without JS** | Load with JavaScript disabled | Zero elements carrying meaningful text below opacity 0.9; no content gated behind an observer |
| 7 | **Performance budget** | Cold load, per page | LCP ≤1500ms AND transfer ≤500KB AND zero render-blocking third-party origins |
| 8 | **Semantic structure** | Parse heading sequence and landmarks | Exactly one `h1`; no skipped levels; `header`/`main`/`footer` present; skip link present |
| 9 | **Single conversion path** | Enumerate CTAs by label and target | Primary CTA identical in label and href everywhere; present in first viewport and at page end; ≤3 per page |
| 10 | **Responsive integrity** | `scrollWidth` vs `clientWidth` at 360/390/768/1024/1440 | No horizontal scroll at any width; container max-width with a defined gutter ladder of ≤4 steps |

### Baseline: revolearn.co.uk scored against it

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Fluid, bounded type scale | **9** | h1 44→64px (1.45×) via `clamp(44px,4.6vw,64px)`. Measured 53/61/75 ch. The 75 ch column sits exactly on the ceiling — one point off. |
| 2 | Tokenised colour | **10** | 39 semantic tokens; every painted colour traced to one. Penalty-free. |
| 3 | Text contrast | **8** | All content text passes (4.60:1 worst at 11px; most 10–18:1). One failure: `#eac050` on `#faf7f0` = 1.61:1 on star glyphs — mitigated by `aria-hidden` + adjacent text, so not a barrier, but it is visible text below threshold. |
| 4 | Focus visibility | **5** | Indicator consistently present and correctly built: verified by keyboard `Tab`, every focusable matches `:focus-visible` and gets `3px solid`, `outline-offset: 2px`. Deduction is contrast alone — `#eac050` is 1.61:1 on cream, 1.73:1 on white, 10.07:1 on dark. Fails the ≥3:1 bar on the majority surface. |
| 5 | Reduced motion, verified | **10** | Emulated: animations 8→0, elements below opacity 1 fall 25→3. Content ends visible. Correct construction. |
| 6 | Content survives without JS | **2** | Fails. `.rl-reveal-item` stuck at 0.25, `.rl-reveal-card` at 0.35. DOM is complete, so not 0 — but testimonials and process steps are unreadable. |
| 7 | Performance budget | **10** | LCP 380–1048ms (seven of eight ≤508ms); transfer 324–408KB; zero third-party origins. Comfortably inside on every page. |
| 8 | Semantic structure | **8** | Exactly one `h1` per page, zero skipped levels across all eight, landmarks present, `lang="en-GB"`, rich JSON-LD. No skip link anywhere — the whole deduction. |
| 9 | Single conversion path | **10** | Identical WhatsApp CTA (same label, same pre-filled href) sitewide; sticky header + hero + footer; 2–3 per page. |
| 10 | Responsive integrity | **10** | No horizontal scroll at any of five widths on any of eight pages, despite 37–44 deliberately bleeding elements at 390px. Three-step gutter ladder, 1200px cap. |

**Total: 82 / 100.**

Shape of the score: this is a site that is **excellent at system design and performance, and weak at
progressive enhancement and keyboard accessibility**. The two low scores (no-JS at 2, focus at 5) are both
*single, specific, cheaply fixable* defects — a start-state change and a token swap — not architectural problems.
Everything structural is right.

### How much this baseline is worth

**Stated plainly: this baseline derives from a single site, and that weakens it in four specific ways.**

1. **n=1 confounds "good" with "characteristic".** I cannot distinguish a genuine quality bar from one studio's house
   style. The one-shadow-token discipline might be excellent practice or might be this designer's habit; a second and
   third site would tell me which.
2. **The rubric was written after seeing the site it scores.** Criteria 5 and 6 exist partly *because* revolearn is
   conspicuously strong on one and weak on the other. That is a real circularity. Criteria 1–4 and 7–10 would survive
   on any marketing site; 5 and 6 should be regarded as provisional until tested against sites that did not inspire
   them.
3. **82/100 has no distribution behind it.** I do not know whether 82 is top-decile or median for a competently built
   UK SME site. It is a *reference point*, not a *percentile*. Treating it as a target risks aiming at the wrong
   altitude in either direction.
4. **One sector, one business model.** A tutoring service with a WhatsApp-first funnel and no product surface. Nothing
   here tests how the rubric behaves on a site with a booking engine, a product catalogue or a checkout — which
   several sites in this repo have or will have.

**Recommended use:** treat 82 as the number to beat and the rubric as a checklist, but re-derive the bar after
scoring two or three further sites, ideally including one with a transactional flow. Criteria 3, 4, 5, 6 and 7 are the
ones that will hold up; 8's skip-link clause and 9's "≤3 CTAs" are the ones most likely to need revision.

---

## Appendix — files

- `screens/` — full-page screenshots, 1440 and 390, all eight pages. Plus `home-1440-nojs.png` (JavaScript disabled),
  `home-1440-reduced-on.png` / `-off.png` (reduced-motion comparison), `home-390-nav-open.png`.
  All captured after a 250px/230ms scroll pass so scroll-reveals have fired (`residualFaded=0` on every capture).
- `raw/harvest.json` — the Step 1.4 harvest: computed styles at 390/768/1024/1440, tokens, containers, media queries,
  keyframes, per page.
- `raw/deep.json` — containers, Caveat usage, contrast pairs, landmarks, metadata, motion inventory.
- `raw/contrast.json` — 279 computed foreground/background pairs with ratios and pass/fail.
- `raw/perf-a11y.json` — FCP/LCP/DCL, transfer sizes, alt-text audit, heading sequences.
- `raw/structure.json` — section order, surfaces, CTA ladder, full body text per page.
- `raw/gaps.json` — gutter ladder at nine widths, sticky-header before/after, accordion and nav states.
- `raw/final.json` — no-JS test results, rating context, focus-ring measurement.
- `raw/scripts/` — the Playwright capture scripts, so every number above can be re-derived independently:
  `discover.mjs` (route enumeration), `harvest.mjs` (Step 1.4 multi-viewport harvest), `supp.mjs` (contrast pairs,
  containers, motion), `verify.mjs` (performance, alt audit), `struct.mjs` (sections, CTA ladder), `gaps.mjs`
  (gutters, component states), `reveal.mjs` (scroll-reveal firing), `overflow.mjs` (horizontal overflow),
  `focus.mjs` / `focus2.mjs` (focus indicators, programmatic vs keyboard), `final.mjs` (no-JS test), `shots.mjs`
  (screenshot regeneration), `pixel.mjs` / `stars.mjs` (pixel-level verification of flagged contrast pairs).
  They hard-code the scratchpad output path; change `ROOT` before re-running.
