# Nuisance 1989 — storefront design mock-up

A single-file, no-build storefront for **Nuisance 1989** (`nuisance1989` on Instagram) — a London
luxury-streetwear label selling in limited drops.

Open `nuisance-1989/index.html` directly in a browser, or serve the repo root.

## Design system

| | |
|---|---|
| **Ground** | `#0B0A09` asphalt (warm-biased near-black, not pure black) |
| **Surface** | `#14120F` tarmac · `#1F1C18` kerb hairline |
| **Type colour** | `#EDE7DB` bone (the cotton) · `#7A736A` warm smoke |
| **Accent** | `#F2CB05` plate yellow — the brand's own UK rear number plate, used as *plate objects* (black on yellow, hard edges, keyline), never as glow |
| **Scarcity** | `#B0342C` glove red — last-pieces state only |
| **Display** | Bodoni Moda (the Didone class the wordmark sits in) |
| **Text/UI** | Archivo |
| **Data** | JetBrains Mono — SKUs, GSM, measurements, drop clock |

Zero border-radius throughout except the plates, which take the 3px of a real registration plate.
Single-theme by intent: the brand lives on black, so every colour is painted explicitly rather
than inherited from the viewer's theme.

## What's on the page

1. **Ticker + sticky nav** with a live bag count
2. **Hero** — wordmark, thesis line, and a **live drop clock** counting to the next Friday 20:00
   UK local time (DST-correct via `Intl`, not a hardcoded offset)
3. **Plate strip** divider — the brand's bio line, set as a moving plate
4. **Drop 03 · Marina** — six pieces, per-size stock, sold-out sizes struck through, hover reveals
   the back print, size must be chosen before a piece can be bagged
5. **The Cut** — fabric spec and a real measurement table (cm, flat, ±1.5 cm on garment-dyed)
6. **1989** — origin copy, plus a facts stack
7. **Lookbook** — photography slots at their shooting sizes
8. **The List** — early-access capture with validation
9. **Bag drawer** — add, remove, subtotal, free delivery over £100

## Placeholders to replace before launch

- **Product photography.** Every garment is an **SVG flat** drawn in the page, and each tile carries
  its slot size (`2000×2500` for product, `1600×1280` for lookbook wides). Shoot to those sizes,
  drop the files in an `images/` folder and swap the `art()` call in the product renderer for an
  `<img>`.
- **Copy.** Prices, stock counts, the sold-out timings, the Portugal manufacturing line and the
  origin story are written to be plausible, not verified. The founder needs to confirm every factual
  claim — particularly *made in Portugal*, *34 countries*, and *Drop 02 sold out in 4 min 12 s*.
- **Commerce.** There is no backend. Bag state is in memory only and Checkout is inert. See the
  note below before wiring one.
- **The List** form is a demo — point it at Klaviyo, Mailchimp or Shopify before launch.

## Note on commerce

The bag here is a mock-up of the *experience*, not a foundation to build on. A drop model with hard
stock counts needs real inventory locking at checkout, or two people buy the last Large. Shopify
handles that out of the box and this page can be rebuilt as a Shopify theme with the same design
system; a bespoke build would need its own stock reservation, payments and fraud handling. That's a
decision to take before any more front-end work.
