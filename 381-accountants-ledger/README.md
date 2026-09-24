# 381 Accountants — Ledger edition

A third take on the 381 Accountants site, alongside the standard edition
(`381-accountants/`) and the dark premium edition
(`381-accountants-premium/`). Same verified business, rebuilt as a calm,
typographic, very fast site: a Swiss grid on warm ledger paper, one signal
colour, hairline rules instead of cards and shadows, and tabular figures.
Thirteen pages, no dependencies, no build step to deploy.

## What is different here

- **Deadline finder** (`deadlines.html`, and a compact version on the home
  page): enter a company year end and VAT quarters and it lists the actual
  dates for Companies House accounts, corporation tax, the CT600, the next
  two VAT returns and personal self assessment, soonest first, with the
  next one highlighted and days remaining. Month-end year ends follow the
  Companies House / HMRC month-end rule (30 June + 9 months = 31 March).
  Without JavaScript the table shows the rules instead.
- **Services as a ledger**: one ruled row per service with its starting fee,
  instead of a card grid. The whole row is the link.
- **Proof beside the headline**: a real Google review, the rating linked to
  the public listing, and checkable facts (established, company number,
  office) set with dotted leaders.
- **People & regulation** on the home page and About page.
- **One action, one wording**: every primary button reads "Book a free
  consultation" and goes to the form on `contact.html#book` (pre-selecting
  the service from service pages). The header copy steps back while the
  page's own booking button is on screen.
- **Almost no motion**: hover and focus transitions only; nothing is hidden
  waiting for a scroll animation.
- **Booking form** validates on submit (error summary, `aria-invalid`,
  focus moves to the first problem), then opens a pre-filled email to
  info@381abs.com. Swap for a form service before launch if preferred.

## Shared facts (fill in once)

Business facts, reviews and service content (including fees and key dates)
are imported from the standard edition's generator
(`../381-accountants/sitegen/lib.mjs` and `content-services.mjs`). Facts the
firm has not confirmed yet (fees, team, professional body, AML supervisor,
indemnity insurance, ICO number, notice period) render as outlined
**[placeholders]** and are kept out of structured data. Fill them in there,
then rebuild both editions. See `../381-accountants/README.md` for the list.

## Design system

| Token | Value | Use |
|---|---|---|
| `--paper` / `--paper-2` | `#F4F1EA` / `#EAE5D8` | page / alternate bands |
| `--ink` | `#15181D` | text (15.8:1 on paper) |
| `--muted` | `#5A606A` | secondary text (at least 5.0:1) |
| `--green` | `#0B5A43` | links and primary buttons (7.3:1; white on it 7.9:1) |
| `--lime` | `#D9F07A` | highlight marker and buttons on the dark band only |
| `--night` | `#0F231C` | closing band and footer |

Type: Schibsted Grotesk (variable, 400–900) with IBM Plex Mono for figures,
labels and dates. Both SIL Open Font License, latin subsets self-hosted in
`assets/fonts/`, the grotesk preloaded, with metric-matched local fallbacks
so nothing reflows when the fonts arrive.

## Editing

```
cd 381-accountants-ledger
node sitegen/build.mjs
```

- Layout and shared blocks: `sitegen/lib.mjs`
- Page bodies: `sitegen/content-pages.mjs`
- Styles and behaviour: `assets/css/main.css`, `assets/js/site.js` (not generated)

The generated HTML is committed, so the folder can be hosted as it is.
