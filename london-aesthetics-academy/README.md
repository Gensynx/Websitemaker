# London's Aesthetics Academy — luxury redesign

A complete, self-contained single-page redesign of
[londonsaestheticsacademy.co.uk](https://www.londonsaestheticsacademy.co.uk/),
rebuilt with a premium, editorial look. No build step — open `index.html`.

## Design language
- **Palette:** warm ivory, espresso ink, champagne gold, deep aubergine (a
  refined, editorial take — deliberately more upmarket than the original).
- **Type:** Playfair Display (display) + Inter (body), loaded from Google Fonts.
- **Feel:** boutique, trustworthy, conversion-focused.

## Sections (the whole site, in one page)
Announcement bar · sticky nav · **hero** · trust strip · stats · About/Trainers ·
**Signature Pathways** (Bronze / Silver / Gold) · Individual Courses (9) ·
Why Train With Us · Your Journey · Gallery · Reviews · FAQ · CTA band ·
Contact + enquiry form · footer.

## Before launch — replace the placeholders
Everything works as-is, but these are demo values to confirm with the client:

1. **Prices** — pathway (£1,499 / £2,499 / £3,499) and per-course "from" prices
   are **indicative placeholders**. Update the numbers in `index.html`.
2. **Course list & inclusions** — based on the Bronze/Silver public info plus
   standard industry courses; confirm exact contents per tier.
3. **Contact details** — email `hello@londonsaestheticsacademy.co.uk`, "West
   London · UB7 · Elizabeth Line", Instagram `@londonsaestheticsacademy_`.
   Set the real email/phone/address and Facebook URL.
4. **Reviews** — sample testimonials; swap for real graduate quotes.
5. **Photos** — add real images to `images/` (see `images/README.md`).
6. **Enquiry form** — currently a front-end demo (shows a success state). Wire it
   to an inbox with [Formspree](https://formspree.io), Netlify Forms, or similar.

## Deploy
- **Netlify:** drag this folder onto https://app.netlify.com/drop.
- **GitHub Pages:** served at `/london-aesthetics-academy/` from the repo root.
- **Vercel:** import the repo, framework "Other", no build command.
