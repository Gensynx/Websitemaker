# Coveworks · Atelier edition

A five page edition of the Coveworks studio site, built around the studio's own line: *the web, made to measure*. The site is dressed as a tailor's atelier, and its centrepiece is the **fitting room**, where a visitor cuts a demo website for their own business and sends it to the studio as a brief.

## Pages
```
index.html          home: hero with the fitting starter, four selected builds, fitting room teaser, services, contact band
work.html           every build in the repo, as an index with trailing previews and expandable stories
fitting-room.html   the demo builder
studio.html         statement and numbers, services, process
contact.html        email, facts and the contact form
assets/site.css     shared styles (including every look in the fitting room preview)
assets/site.js      shared behaviour; each part only runs on pages that have its elements
assets/fonts/       Bodoni Moda, Archivo, JetBrains Mono, plus Source Serif 4, IBM Plex Sans and Manrope for the fitting room looks
assets/img/         work captures
sitegen/build.py    writes the five pages from one shared header, footer and tape
```
The generated HTML is committed. After editing a page in `sitegen/build.py`, run `python3 coveworks-atelier/sitegen/build.py`. Styles and behaviour are edited directly in `assets/`.

## The look
- Pattern paper, ink and one chalk red. Bodoni Moda for display, Archivo for text, JetBrains Mono for measurements and labels. No italics anywhere; emphasis is set in chalk red
- Compact spacing: the hero sits straight under the header and sections run close together
- A tape measure runs down the left edge on desktop and slides with the page; a chalk marker reads out where you are in centimetres
- The home headline carries a drawn dimension line ("Made to measure · 1 : 1")
- The phone menu is a full width drop down with every page
- No custom cursor, no gradients, no glow; all motion respects reduced motion settings

## The fitting room
Visitors arrive from the home page ("Begin your fitting · what is your business called?", which carries the name across) or any Book a fitting button.

1. **Name**: appears on the demo's logo, copy, footer and web address
2. **Trade**: restaurant, clinic, property, car hire, trades, boutique or professional services, each with its own written copy, call to action, services, prices, questions and photography labels
3. **Look**: nine, in two groups
   - Professional: Clean (white, colour led), Ledger (paper white, serif headings, ruled lines), Boardroom (cool grey, corporate sans, white cards), Gallery (pure white, large quiet type), Fresh (soft white, friendly rounded sans), Slate (calm dark)
   - Signature: Savile (ivory, fashion house serif), Linen (warm sand, soft corners), Noir (black, bold capitals)
4. **Layout** of the opening section: split, centred, or full image with the words over it
5. **Colour**: navy, teal, forest, oxblood, graphite, ochre, chalk red or ink
6. **Sections**: about, services, gallery, reviews, prices, questions and contact, switched on or off and reordered; the preview scrolls to the section you change and outlines it
7. **Headline**: optional, replaces the trade's headline

That is 7 trades × 9 looks × 3 layouts × 8 colours before sections are touched. The live preview renders a full width desktop site (1280 px, scaled to fit) or a phone cut (390 px). Photography slots are labelled placeholders, and the review is marked as a sample.

**Copy link** encodes the whole fitting into the address (`fitting-room.html?fit=`), so it reopens exactly. **Send this fitting** opens the visitor's own email app with the brief written out, addressed to `hello@coveworks.studio`. Nothing is stored anywhere.

## Content notes
- `hello@coveworks.studio` must exist (or be replaced in `sitegen/build.py` and `assets/site.js`) before go live
- The work list lives in `assets/site.js` (`WORKS`); London's Aesthetics Academy shows as a private preview until it goes live
- Copy is dash free by request

## Deploy
Any static host; upload the whole folder. On GitHub Pages it lives at `/Websitemaker/coveworks-atelier/`.
