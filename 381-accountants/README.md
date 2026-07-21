# 381 Accountants — website

A 12-page, conversion-focused site for **381 Accountancy & Bookkeeping Services Ltd**
(trading as 381 Accountants), the certified accountancy firm at 30 Churchill
Place, Canary Wharf, London E14 5RE, serving clients across London since 2010.

Everything a visitor needs to become a client: hero with the main service and
16+ years of experience, a booking section listing every service, testimonials
built from the firm's real Google reviews, an About Us page heavy on trust
signals, and clear calls to action on every page.

## Pages

```
index.html                          Home — hero, stats, services, booking, why-us, steps, reviews, CTA
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

## Design system

Trust & Authority pattern: navy ink (`#0d1f42`/`#1e3a8a`) + gold CTA
(`#b45309`), light `#f7f9fc` surfaces, EB Garamond display over IBM Plex Sans
body (Google Fonts, `font-display: swap`, system fallbacks). SVG icon set
(1.5px stroke), scroll reveals that respect `prefers-reduced-motion` and
degrade gracefully without JavaScript, JSON-LD `AccountingService` schema on
home + contact.

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
