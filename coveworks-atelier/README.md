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
assets/stock/       photography for the fitting room previews, with CREDITS.txt
assets/fitting.*    the fitting room script and preview styles
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

The preview renders a full width desktop site (1280 px, scaled to fit) or a phone cut (390 px). Reviews are marked as samples. **Copy link** encodes the whole fitting into the address (`fitting-room.html?fit=`); **Send this fitting** opens the visitor's own email app with the brief, including their own words, addressed to `hello@coveworks.studio`.

The fitting room's code is `assets/fitting.js` (types, copy, looks and the brief reader) and `assets/fitting.css` (the preview site), loaded only on that page.

## Photography
`assets/stock/` holds 76 photographs from Unsplash, via Lorem Picsum, free to use under the Unsplash License. Photographers are credited in `assets/stock/CREDITS.txt`. A preview loads only the five or six photos for its type.

## Content notes
- `hello@coveworks.studio` must exist (or be replaced in `sitegen/build.py` and `assets/site.js`) before go live
- The work list lives in `assets/site.js` (`WORKS`); London's Aesthetics Academy shows as a private preview until it goes live
- Copy is dash free by request

## Deploy
Any static host; upload the whole folder. On GitHub Pages it lives at `/Websitemaker/coveworks-atelier/`.
