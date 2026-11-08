# 381 Accountants — premium edition

The high-interaction sibling of `381-accountants/`: same verified business
content (services, real Google reviews, Canary Wharf address), rebuilt as a
dark, cinematic, agency-grade experience. Twelve pages, no build step to
deploy, no dependencies.

## What makes it interactive

- **Hero**: staggered word-reveal headline, drifting aurora background,
  pointer-parallax dashboard with a rotating status ticker, live countdown
  chip to the self assessment deadline
- **Take-home calculator**: slider plus Employee / Sole trader / Limited
  toggle computing indicative 2025/26 tax, NI and take-home with animated
  numbers and bars (clearly labelled as an estimate)
- **Service showcase**: tabbed explorer on home and the services hub; every
  service links to a full step-by-step breakdown page with a timeline
- **Booking wizard**: three-step flow (service chips, details, review) with
  validation and a pre-filled email draft at the end; `?service=` pre-selects
- **Review marquee + carousel + masonry wall**: real named Google reviews
  (5.0 from 42) in three presentations
- **Micro-interactions**: magnetic CTAs, 3D tilt + spotlight cards, scroll
  progress bar, back-to-top orb with progress ring, full-screen staggered
  mobile menu, cross-document view transitions on supporting browsers
- Everything respects `prefers-reduced-motion` and works without JavaScript
  (content is always visible; enhancements simply switch off)

## Design system

Obsidian navy (`#060d1c`) with aurora glows (royal blue, gold, a whisper of
teal), glass surfaces, gold gradient CTAs. Cormorant Garamond display,
Manrope body, IBM Plex Mono for eyebrows, stats and data. Single dark theme
by design.

## Pages

Same structure as the standard edition: home, services hub + 7 service
detail pages, about, reviews, contact.

## Editing

```
cd 381-accountants-premium
node sitegen/build.mjs
```

- Site-wide facts: `sitegen/lib.mjs` → `SITE`
- Service copy (shared source with the standard edition): `sitegen/content-services.mjs`
- Page bodies and interactive blocks: `sitegen/content-pages.mjs`
- Styles / behaviour: `assets/css/main.css`, `assets/js/site.js` (not generated)

The generated HTML is committed, so hosting needs no build step. The
calculator is indicative only (2025/26 England rates, simplified limited
company model) and says so in its copy.
