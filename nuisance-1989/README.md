# Nuisance 1989 — storefront

A twelve-page static site for **Nuisance 1989** (`nuisance1989` on Instagram), a London
luxury-streetwear label selling in limited drops. No build step to host: the generated HTML is
committed.

**Live:** https://gensynx.github.io/Websitemaker/nuisance-1989/

Both looks are shareable as links:

| | |
|---|---|
| Asphalt (default) | https://gensynx.github.io/Websitemaker/nuisance-1989/ |
| Paper (the old Archive design) | https://gensynx.github.io/Websitemaker/nuisance-1989/?skin=paper |

`?skin=paper` or `?skin=asphalt` on any page opens in that skin and is then remembered, so the rest
of the visit stays in it. Toggling in the footer stamps the URL to match, so copying the address
always shares what is actually on screen.

## Two skins, one site

The site ships both design directions as a **skin toggle in the footer**, so the look can be
decided without a rebuild. The skin is stored in `localStorage` and applied by a tiny inline
script in each page's `<head>` before first paint, so it never flashes the other one. A `?skin=`
parameter beats the stored choice, which is what makes a skin shareable rather than only
togglable in the viewer's own browser.

| | **Asphalt** (default) | **Paper** |
|---|---|---|
| Ground | `#0B0A09` warm near-black | `#F1EDE4` warm bone paper |
| Surface | `#14120F` | `#E7E1D5` |
| Type colour | `#EDE7DB` bone | `#14120F` ink |
| Muted | `#7A736A` | `#6B6459` |
| Text face | Archivo | Instrument Sans |

Shared across both: **Bodoni Moda** for display (the Didone the wordmark sits in), **JetBrains
Mono** for SKUs, measurements and the drop clock, and `#F2CB05` plate yellow as the single accent —
the brand's own UK rear number plate, used as plate objects rather than as glow. Layout, spacing
and density do not change between skins: a toggle should change the light in the room, not the
brand.

## Pages

| File | Page |
|---|---|
| `index.html` | Home — wordmark, live drop clock, six-piece grid, 1989 teaser |
| `drop.html` | Drop 03 — catalogue index with a plate that follows the hovered row |
| `piece-<slug>.html` | Six product pages, one per piece |
| `cut.html` | The Cut — fabric spec, published measurements, how to measure |
| `story.html` | 1989 — origin note and the facts stack |
| `lookbook.html` | Marina — horizontal plate rail |
| `contact.html` | Contact, delivery and returns, The List signup |

## Structure

```
assets/site.css     both skins as token sets
assets/site.js      skin toggle, garment flats, bag, drop clock, previews, forms
assets/data.js      generated — product data shared by pages and the bag
sitegen/build.mjs   the generator
images/             photography slots (see images/README.md)
source/             the untouched master photo the recolour reads
tools-recolour.py   derives the asphalt colourway from the bone photo
```

Regenerate with `node sitegen/build.mjs` from this folder. Product data lives in one place —
`PRODUCTS` in `sitegen/build.mjs` — and is emitted to `assets/data.js`, so the pages and the bag
cannot drift apart.

## Behaviour worth knowing

- **The bag persists across pages** in `localStorage`, which a multi-page shop needs.
- **The drop clock** counts to the next Friday 20:00 UK, DST-correct via `Intl` rather than a
  hardcoded offset.
- **Photo slots degrade.** Every slot draws an SVG garment flat first and layers the photo over it.
  A missing file removes its own `<img>` and the flat shows through, so photography can land one
  piece at a time without breaking a page.
- **Hover depth-of-field.** A second masked copy of each photo blurs the surround on hover, so a
  lifestyle frame reads as a product shot. On the drop page's plate it is always on.

## Before launch

- **Photography.** Only three slots have real files. See `images/README.md` for the filenames.
- **Copy.** Prices, stock counts, the Portugal manufacturing line and the sold-out timings are
  plausible placeholders. Every factual claim needs the founder's confirmation.
- **Commerce.** No backend. The bag is in-memory-plus-localStorage and Checkout is inert. A drop
  model with hard stock counts needs real inventory locking at checkout or two people buy the last
  Large — Shopify handles that out of the box and this design system ports to a theme.
- **Forms** are demos. Point them at a real inbox or Klaviyo.
