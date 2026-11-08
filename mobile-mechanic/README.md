# Mobile Mechanic Romford

Premium, single-page website(s) for **Farhan · Mobile Mechanic Romford** — the mobile
mechanic who comes to your driveway across Romford and East London.

Each page is self-contained: one HTML file with all CSS and JS inline. No build step, no
image files, no external dependencies except Google Fonts (which fall back gracefully to
system fonts if blocked). Host either one anywhere.

## Two designs — pick one
| File | Vibe |
|---|---|
| **`index.html`** | Clean "premium concierge" — molten gold on charcoal, Sora/Inter, restrained luxury. |
| **`garage.html`** | Full car/garage theme — gunmetal + racing-red + hazard-yellow, Rajdhani, carbon fibre, a car illustration with spinning wheels, a speedometer rating gauge, an interactive **dashboard warning-light decoder**, tyre-tread dividers and a radar coverage map. |

Both share the same content, real reviews and `CONFIG` block. Decide which you prefer and
make it the site's `index.html` (rename or copy), or A/B test them.

## Design (index.html)
- **Look:** dark "molten gold on charcoal" automotive luxury — bold Sora/Inter type,
  gold gradient accents, glass cards, subtle motion.
- **Structure:** Hero → assurance marquee → Services → Instant Quote estimator →
  How It Works → Why Choose → Stats → Reviews (slider + scrolling wall) →
  Coverage map → FAQ → Contact/callback form → Footer.
- **Interactive:** animated rating gauge + count-up stats, live price estimator
  (service × vehicle type), auto-playing testimonial slider, scrolling review wall,
  FAQ accordion, pointer-follow glow on service cards, sticky mobile call bar,
  scroll reveals, mobile drawer, back-to-top. Respects `prefers-reduced-motion`.
- **Reviews** are the real Google reviews supplied by the owner (lightly trimmed).

## ⚠️ Before it goes live — set the real contact details
All phone / WhatsApp links are placeholders. Open `index.html`, find the `CONFIG`
object near the bottom of the `<script>` and set three values — the whole page
(header, hero, drawer, contact section, footer, mobile bar) updates automatically:

```js
const CONFIG = {
  phoneDisplay: "07000 000000",                       // shown on the page
  phoneHref:    "tel:+447000000000",                  // tap-to-call
  whatsapp:     "https://wa.me/447000000000?text=..." // WhatsApp deep link
};
```

The callback form is a front-end demo (shows a success state, sends nothing). Wire it
to an inbox/Formspree/Netlify Forms before launch if you want submissions delivered.

## Deploy
- **Netlify:** drag this folder onto https://app.netlify.com/drop.
- **GitHub Pages:** served at `/mobile-mechanic-romford/` if Pages is on for the repo.
- **Vercel:** import the repo, framework preset "Other", no build command.

## Optional polish
- Add real photos of Farhan / jobs by dropping `<img>`s into the hero or a gallery.
- Confirm the exact callout radius and area list in the Coverage section.
- Numbers used: 4.8★, 90+ reviews, 10+ years, ~30 min response — adjust to taste.
