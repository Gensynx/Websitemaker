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
assets/fitting-data.js   the configurator's content: site types, copy, looks, colours, the words the brief reader knows
assets/fitting.js        the configurator's behaviour: brief reader, state, share link, preview renderer
assets/fitting.css       the preview site's styles
sitegen/build.py         writes the five pages from one shared header, footer and tape
sitegen/work.json        the portfolio: one list for the work pages and for what gets uploaded under /work/
sitegen/package.py       stages the whole webspace in dist/site/ (and a zip) for upload
sitegen/trades.json      the trade landing pages: one entry per websites-for-<trade>.html
sitegen/export.mjs       turns a visitor's build into starter files for the real site
sitegen/check.mjs        regression check: every page, the headline, the work list, 36 briefs, every site type, share links,
                         trade pages, and (with PHP installed) the site reader and lead capture for real
preview.html             a shared build shown full page, with no configurator around it (also what the trade pages embed)
websites-for*.html       the trade landing pages and their index
api/lead.php             saves each lead on the server and emails it to the studio
api/site.php             reads a visitor's existing site (name, colour, headline, words) so the configurator can rebuild it
api/lib.php              shared helpers: JSON replies, rate limits, the locked data folder
sitemap.xml, robots.txt  written by build.py
```
The generated HTML is committed. Where to change things:

| To change | Edit | Then |
|---|---|---|
| Page copy or structure | `sitegen/build.py` | `python3 coveworks-lab/sitegen/build.py` |
| A trade landing page (add, remove, reword) | `sitegen/trades.json` | the same build |
| The portfolio (add, remove, reorder, reword) | `sitegen/work.json`, with a 1600 by 1000 capture in `assets/img/` | the same build |
| A site type's copy, sections, keywords or photos; a look; a colour | `assets/fitting-data.js` | nothing |
| How the configurator behaves | `assets/fitting.js` | nothing |
| Styles | `assets/site.css`, `assets/fitting.css` | nothing |

Before merging, run `node coveworks-lab/sitegen/check.mjs` (needs Playwright, and PHP for the endpoint checks). Merging to main uploads the site to coveworks.tech by itself; see `DEPLOY-IONOS.md`.

## Leads, site rebuilds, exports and trade pages

**Leads.** "Send this build" in the configurator and the contact form post to `api/lead.php`. Each lead is appended to `api/data/leads.php` on the server and then emailed to the studio with the visitor's address as the reply address, so one that cannot be emailed is still kept. If the endpoint cannot be reached, the form falls back to opening the visitor's own email app with the same brief. A hidden field and a minimum time on the page catch bots, and one address can send six an hour. To read the saved leads, open `public/api/data/leads.php` in the IONOS File Manager: one lead per line. The folder refuses every web request, and the file is also a PHP file that exits at once.

**Rebuild from an existing site.** Anything typed into the brief box that looks like a web address goes to `api/site.php`, which fetches that page on the server and returns a handful of fields: the business name, the title and description, the main headline, a few headings and paragraphs, the brand colour, the logo and the share image. The configurator picks the site type from those words and shows the same business in a new design, with their name, colour ("Your colour" joins the palette), headline and own words. The endpoint only fetches public web pages (never an address inside a private network, with every redirect checked), reads at most 900 KB, caches each result for an hour and allows thirty an hour per visitor. It returns the extracted fields, never the page.

**Preview page.** `preview.html?fit=<code>` shows any shared build full page, scaled to the window, with a bar leading back to the configurator. The trade pages embed it.

**Trade pages.** `sitegen/trades.json` drives `websites-for-<trade>.html`: an intro, a live sample for that trade, what such a site needs, the rebuild box, questions, and links to the other trades. `websites-for.html` lists them all and `sitemap.xml` includes every one.

**Export.** `node coveworks-lab/sitegen/export.mjs "<share link>"` renders a build with the configurator's own code and writes it as plain files: `index.html`, a stylesheet holding only what that build uses (with the phone layout turned into a media query), its images and fonts, and a `BRIEF.md` listing what the client chose and what is still sample content. Without a terminal: GitHub, Actions, **Export a build**, Run workflow, paste the link; the files arrive on a branch named `build/<name>-<n>` under `clients/<name>/`.

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

**00 · Describe the site you need.** Plain words such as "a minimal photography portfolio in black and white" or "an Italian restaurant called Nonna" are read for the kind of business, a look, a colour, a layout and a name, and the preview is cut to match. This is keyword reading in the browser, not an AI model, and nothing is saved unless the visitor sends the build. A web address typed in the same box is rebuilt instead (see above). Each type knows dozens of words, and close misspellings of long ones ("resturant", "photgrapher") still match. A brief that names no known type is never turned away: the Something else type builds a site around the words given ("a site for beekeeping supplies" becomes a site about beekeeping supplies, with neutral imagery) and offers any near types as alternatives.

**Site types.** Twenty three, each with its own page structure, written copy and photography, not one skeleton reskinned, plus Something else:

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
| Gaming | stream schedule, numbers, highlights, roster |
| Music | tour dates, releases, live photos |
| Salon | services with times and prices, stylists, opening hours |
| Education | subjects, three steps, lesson pricing, tutors |
| Charity | impact numbers, where your gift goes, the work on the ground |
| Creator | recent writing, featured in, subscribe |
| Community | what's on, weekly times, gallery |
| Childcare | joining steps, gallery, opening hours, team |
| Travel | stay booking bar, rooms with rates, gallery |
| Pets | services, three steps, photo strip, team |
| Something else | written around the visitor's own words, with neutral imagery |

Each type also has its own sections to switch on, off and reorder, its own call to action, and a default look, layout and colour.

**Looks.** Fifteen, in three groups:
- Professional: Clean, Swiss, Ledger, Boardroom, Gallery, Fresh, Slate
- Signature: Savile, Linen, Noir
- Modern, after the component styles popular on 21st.dev: Aurora (night with colour glows and glass cards), Glass (frosted panels over a colour wash), Brutalist (thick outlines and hard shadows), Blueprint (dot grid and mono labels), Mono (black and white component style)

**Layout** of the opening: split, centred or full image. **Colour**: ten accents. **Headline**: optional.

The preview renders a full width desktop site (1280 px, scaled to fit) or a phone cut (390 px). Reviews are marked as samples. **Copy link** encodes the whole fitting into the address (`configurator.html?fit=`); **Send this build** posts the brief, the visitor's own words and the share link to `api/lead.php` (see Leads above).

The configurator loads `assets/fitting-data.js` (content), `assets/fitting.js` (behaviour) and `assets/fitting.css` (the preview site) on that page only.

## Imagery
Every image in `assets/gen/` was generated for Coveworks with Higgsfield (GPT Image 2.5): six for each of the twenty three site types and the Something else fallback (eight for photography), three studio plates for the home and studio pages, and the share image `lab-cover.jpg`. They are illustrative and show no real client. A preview loads only the photos for its type. See `assets/gen/CREDITS.txt`.

## Content notes
- `sales@coveworks.tech` must exist (or be replaced in `sitegen/build.py` and `assets/site.js`) before go live
- The work list lives in `sitegen/work.json`. Its links point at copies of each site under coveworks.tech/work/, uploaded by the deploy workflow (see `sitegen/package.py`). Apart from Vassallo and Dar Ul Amir, the portfolio sites carry fictional brands, because the real clients did not agree to be shown
- Copy is dash free by request

## Deploy
Any static host; upload the whole folder. On GitHub Pages it lives at `/Websitemaker/coveworks-lab/`.

## Fixes in this edition
- The describe box tolerates typos and longer forms ("resturant", "photographer", "dentists")
- When a brief cannot be read, the old preview dims and the closest types are offered as buttons, instead of leaving an unrelated preview showing
- A name read from one description no longer follows into a different site type; a name the visitor typed does
- Full image openings keep their words readable: a stronger wash, a soft text shadow, and the small label in a dark pill
