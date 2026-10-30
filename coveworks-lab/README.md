# Coveworks · Lab edition

A five page edition of the Coveworks studio site in a futuristic "lab white" style: bright white with a dot grid, a dot matrix display face (Doto) for headlines and numbers, Space Grotesk for text, one signal red, and the page built from hardware style modules with status lights. Its centrepiece is the **configurator**, where a visitor describes the site they need and gets a preview built for that kind of business, then sends it to the studio as a brief. This edition replaces the earlier tailor themed Atelier edition; the old `coveworks-atelier/` addresses forward here.

## Pages
```
index.html          home: hero with the fitting starter, four selected builds, configurator teaser, services, contact band
work.html           every build in the repo, as an index with trailing previews and expandable stories
configurator.html   the demo builder
studio.html         statement and numbers, services, process
contact.html        email, facts and the contact form
assets/site.css     shared styles (including every look in the configurator preview)
assets/site.js      shared behaviour; each part only runs on pages that have its elements
assets/fonts/       Bodoni Moda, Archivo, JetBrains Mono, plus Source Serif 4, IBM Plex Sans and Manrope for the configurator looks
assets/img/         work captures
assets/gen/         imagery generated with Higgsfield: configurator photography, studio plates, share image
assets/fitting.*    the configurator script and preview styles
sitegen/build.py    writes the five pages from one shared header, footer and tape
```
The generated HTML is committed. After editing a page in `sitegen/build.py`, run `python3 coveworks-lab/sitegen/build.py`. Styles and behaviour are edited directly in `assets/`.

## The look
- Bright white with a fine dot grid, one signal red, and green status lights; inspired by hardware such as Nothing and Teenage Engineering rather than neon sci fi
- Doto, a dot matrix face, for the headline, numbers and emphasis; Space Grotesk for text; JetBrains Mono for labels
- The home headline powers up character by character, like a display switching on
- Content sits in rounded white modules with numbered headers; the work index, services, process and contact are all modules
- A telemetry rail runs down the left edge on desktop: dot ticks that slide with the page and a red readout of how far down you are
- A live London clock in the home status module
- No italics, no gradients, no glow; all motion respects reduced motion settings

## The configurator
Visitors arrive from the home page ("Begin your fitting · what site do you need?", which carries their words across) or any Book a fitting button.

**00 · Describe the site you need.** Plain words such as "a minimal photography portfolio in black and white" or "an Italian restaurant called Nonna" are read for the kind of business, a look, a colour, a layout and a name, and the preview is cut to match. This is keyword reading in the browser, not an AI model, so it needs no server and stores nothing.

**Site types.** Thirteen, each with its own page structure, written copy and real photography, not one skeleton reskinned:

| Type | Built around |
|---|---|
| Photography | full bleed opening, photo wall with captions, ongoing series, packages |
| Restaurant | booking bar, menu with prices, photo strip, opening hours |
| Café | booking bar, counter menu, opening hours |
| Clinic | treatments with times and prices, team, three steps, questions |
| Property | search bar, listings with prices and sizes, numbers |
| Car hire | fleet with specs and day rates, three steps |
| Trades | quote request card, services, areas covered |
| Shop | product grid with prices, photo strip |
| Professional | client names, services, fee tiers, team |
| Software | product dashboard mock, client logos, features grid, pricing tiers |
| Studio | case studies, services, numbers |
| Fitness | class timetable, memberships, coaches |
| Events | dates for the diary, packages, gallery |

Each type also has its own sections to switch on, off and reorder, its own call to action, and a default look, layout and colour.

**Looks.** Fifteen, in three groups:
- Professional: Clean, Swiss, Ledger, Boardroom, Gallery, Fresh, Slate
- Signature: Savile, Linen, Noir
- Modern, after the component styles popular on 21st.dev: Aurora (night with colour glows and glass cards), Glass (frosted panels over a colour wash), Brutalist (thick outlines and hard shadows), Blueprint (dot grid and mono labels), Mono (black and white component style)

**Layout** of the opening: split, centred or full image. **Colour**: ten accents. **Headline**: optional.

The preview renders a full width desktop site (1280 px, scaled to fit) or a phone cut (390 px). Reviews are marked as samples. **Copy link** encodes the whole fitting into the address (`configurator.html?fit=`); **Send this fitting** opens the visitor's own email app with the brief, including their own words, addressed to `hello@coveworks.studio`.

The configurator's code is `assets/fitting.js` (types, copy, looks and the brief reader) and `assets/fitting.css` (the preview site), loaded only on that page.

## Imagery
Every image in `assets/gen/` was generated for Coveworks with Higgsfield (GPT Image 2.5): six for each of the thirteen site types (eight for photography), three studio plates for the home and studio pages, and the share image `lab-cover.jpg`. They are illustrative and show no real client. A preview loads only the photos for its type. See `assets/gen/CREDITS.txt`.

## Content notes
- `hello@coveworks.studio` must exist (or be replaced in `sitegen/build.py` and `assets/site.js`) before go live
- The work list lives in `assets/site.js` (`WORKS`); London's Aesthetics Academy shows as a private preview until it goes live
- Copy is dash free by request

## Deploy
Any static host; upload the whole folder. On GitHub Pages it lives at `/Websitemaker/coveworks-lab/`.

## Fixes in this edition
- The describe box tolerates typos and longer forms ("resturant", "photographer", "dentists")
- When a brief cannot be read, the old preview dims and the closest types are offered as buttons, instead of leaving an unrelated preview showing
- A name read from one description no longer follows into a different site type; a name the visitor typed does
- Full image openings keep their words readable: a stronger wash, a soft text shadow, and the small label in a dark pill
