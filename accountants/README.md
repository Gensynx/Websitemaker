# 381 Accountants — website

A 13-page, conversion-focused site for **381 Accountancy & Bookkeeping Services Ltd**
(trading as 381 Accountants), the certified accountancy firm at 30 Churchill
Place, Canary Wharf, London E14 5RE, serving clients across London since 2010.

Everything a visitor needs to become a client: hero with the main service and
16+ years of experience, a booking section listing every service, testimonials
built from the firm's real Google reviews, an About Us page heavy on trust
signals, and clear calls to action on every page.

## Pages

```
index.html                          Home — hero, stats, services, deadline finder, booking, why-us, steps, reviews, CTA
deadlines.html                      Deadline finder — company, VAT and self assessment dates, plus the rules
about.html                          About Us — story, credentials, how we work, areas served
reviews.html                        Client reviews — real Google quotes, praise themes, review CTA
contact.html                        Contact — phones, email, address, hours, booking form
services/index.html                 Services hub — all seven services + booking panel + FAQs
services/bookkeeping.html           ┐
services/payroll.html               │
services/self-assessment.html       │  one detail page per service:
services/vat-returns.html           │  lede, what's included, callout,
services/annual-accounts.html       │  FAQs, sticky booking sidebar
services/company-formation.html     │
services/tax-planning.html          ┘
```

## Business facts used (sourced July 2026)

- Legal name: 381 Accountancy & Bookkeeping Services Ltd, company no. 07327043, incorporated 27 July 2010
- Address: 10th Floor, Office 104, Suite 10, 30 Churchill Place, Canary Wharf, London E14 5RE · Mon–Fri 9:00–17:30
- Phones: 020 8214 1259 · 020 3129 8066 · Email: info@381abs.com
- Software: Sage One, Sage 50, QuickBooks
- Testimonials are real Google reviews (5.0 from 42 reviews), quoted with the
  reviewers' published names and lightly tidied for spelling only. Three are
  featured on the home page; reviews.html carries a wall of eighteen more.

## Logo

The firm's logo artwork (supplied as a JPEG on a paper background) is cut
onto a transparent background in `assets/img/`:

- `logo-mark.png`: the "381" mark with the chart-and-ledger icon, used in
  the header (on its own) and in the footer (on a white chip, so the blue
  stays visible on navy). Exported at 2x for sharp rendering.
- `logo-full.png`: the full lockup with "Accountancy and Bookkeeping
  Services Ltd", for use elsewhere (e.g. email signatures, print).

The favicon is the logo's blue (`#005179`) square with a white "381".

## Deadline finder

`deadlines.html`, plus a compact version on the home page: enter a company
year end and VAT quarters to see the Companies House accounts, corporation
tax, CT600, next two VAT returns and self assessment dates, soonest first,
with the next one highlighted and days remaining. Month-end year ends
follow the month-end rule (30 June + 9 months = 31 March). Without
JavaScript the table shows the rules instead. The logic lives in
`assets/js/site.js`; service pages' "Key dates" notes link to it.

## Facts still to confirm before launch

Some sections are built but waiting on facts only the firm can supply. Each
gap renders as an outlined **[bracketed placeholder]** so none can go live
unnoticed, and none of them reach the structured data. Fill them in one
place and rebuild:

| What | Where to set it | Shown on |
|---|---|---|
| Starting fee for each service (`fee.from`, in pounds) | `sitegen/content-services.mjs` | Services hub fees table, each service page |
| Fee basis per service (per month, per return, per quarter, per year, one-off, quoted) | `sitegen/content-services.mjs` → `fee.basis` (currently assumed) | Same |
| Team: name, role, qualification, two-line bio (add one entry per person clients deal with) | `sitegen/lib.mjs` → `SITE.team` | About → "Who you will work with", FAQ |
| Professional body and membership number | `SITE.professionalBody` | About → "Regulation & protection", FAQ |
| Anti-money-laundering supervisory body | `SITE.amlSupervisor` | Same |
| Professional indemnity insurer and cover | `SITE.indemnity` | Same |
| ICO registration number | `SITE.icoNumber` | Same |
| Notice period for leaving | `SITE.noticePeriod` | FAQ |

Check before launch: `grep -rl 'class="tbc"' --include=*.html .` should
return nothing.

## Conversion and trust decisions

- **One primary action, one wording.** Every primary button reads
  "Book a free consultation" and lands on the booking form
  (`contact.html#book`, pre-selecting the service from service pages).
  Every page hero carries it.
- **Header button steps back while the page's own button is on screen.**
  `assets/js/site.js` hides the header copy while the page's first primary
  button is at least half visible and brings it back once that button
  scrolls away, so exactly one "Book" is in view. On phones it shows as a
  compact "Book". Without JavaScript it simply stays visible.
- **Proof, not a mock-up, beside the headline.** The home hero shows a real
  Google review, the rating linked to the public listing, and facts anyone
  can check (established 2010, company number, office address).
- **Prices published.** The services hub has a "What it costs" table
  (`#fees`) linked from the home hero and services note.
- **Service pages show the statutory deadlines** that apply to each service
  (key dates), which demonstrates expertise and answers a common question.
- **Who you deal with and who regulates the firm** is on the About page and
  answered in the services FAQs, along with how leaving works
  (professional clearance and records handover).

## Design system

Trust & Authority pattern: navy ink (`#0d1f42`/`#1e3a8a`) + gold CTA
(`#b45309`), light `#f7f9fc` surfaces, EB Garamond display over IBM Plex Sans
body (Google Fonts, `font-display: swap`). SVG icon set (1.5px stroke),
scroll reveals that respect `prefers-reduced-motion` and degrade gracefully
without JavaScript, JSON-LD `AccountingService` schema on home + contact
(prices are added to it only once confirmed).

- **Contrast-safe gold.** Buttons use `--grad-cta` (`#b45309` → `#92400e`),
  where every stop keeps white text above 5:1. The brighter `--grad-gold`
  is for decorative rules only. Eyebrows use `--gold-strong` on light grounds
  and `--gold-on-dark-2` on navy; `--text-soft` is `#5f6b82` (at least
  4.78:1 on every light ground).
- **No layout jump when fonts load.** `main.css` declares metric-matched
  fallback faces (`EB Garamond Fallback`, `IBM Plex Sans Fallback`) built on
  Times New Roman / Arial with `size-adjust` and ascent/descent overrides
  measured from the webfonts, so text keeps its size and line breaks while
  the Google Fonts load.
- Skip link, `role="img"` on star ratings, underlined inline links.

## Editing

Pages are generated for consistency by `sitegen/build.mjs`:

```
cd 381-accountants
node sitegen/build.mjs
```

- Site-wide facts (phones, address, hours): `sitegen/lib.mjs` → `SITE`
- Service copy: `sitegen/content-services.mjs`
- Page bodies: `sitegen/content-pages.mjs`
- Styles/behaviour: `assets/css/main.css`, `assets/js/site.js` (not generated)

The generated HTML is committed, so deployment needs **no build step** — host
the folder anywhere (Netlify drop, GitHub Pages, Vercel).

## Forms

The booking forms are client-side only: submitting opens a pre-filled email
draft to info@381abs.com (works on any static host). Wire them to a real
backend (Formspree, Netlify Forms, etc.) before launch if you want silent
submissions instead.
