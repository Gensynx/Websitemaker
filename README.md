# Websitemaker

Static websites built with Claude Code. Each site is a self-contained folder that can be hosted anywhere (Netlify, Vercel, GitHub Pages) with no build step.

## Sites in this repo
- **Dar Ul Amir** — repo root (`index.html`), deployed at https://gensynx.github.io/Websitemaker/
- **House of Autos** — `house-of-autos/` (self drive performance car hire, London)
- **Mobile Mechanic Romford** — `mobile-mechanic-romford/` (two designs)
- **London Classic Aesthetics** — `london-classic-aesthetics/` (24 page redesign)
- **Coveworks** — `coveworks/` folder, the studio's own animated site, editorial luxury edition (see `coveworks/README.md`)
- **Coveworks flagship** — `coveworks-scifi/` folder: welcome theme selector, nine full themes and a cursor following switcher bubble in one file (see `coveworks-scifi/README.md`)
- **381 Accountants** — `381-accountants/` (12-page site for the Barking accountancy firm, see `381-accountants/README.md`)

## Site: 381 Accountants (`381-accountants/`)

A conversion-focused, multi-page site for 381 Accountancy & Bookkeeping Services Ltd (381accountants.com): home, services hub + 7 service pages, about, reviews (real Google quotes), contact with booking form. Navy + gold Trust & Authority design system, EB Garamond + IBM Plex Sans, scroll reveals, JSON-LD local-business schema.

- Open `381-accountants/index.html` directly, or serve the repo root.
- Pages are generated for consistency by `381-accountants/sitegen/build.mjs` (`node sitegen/build.mjs` from the site folder); the generated HTML is committed, so deployment needs no build step.
- Booking forms open a pre-filled email to info@381abs.com — no backend needed; swap for a form service before launch if preferred.

## Site: London Classic Aesthetics (`london-classic-aesthetics/`)

A full multi-page redesign of londonclassicaesthetics.com: 24 pages (home, 6 treatment pages + hub, 12 training course pages + hub, about, become-a-model, contact). Ivory/ink/champagne design system, Marcellus + Jost type (fonts committed as woff2), scroll-reveal and hero animations, all self-contained.

- Open `london-classic-aesthetics/index.html` directly, or serve the repo root.
- Photo slots show branded gradient placeholders until real photos are dropped into `london-classic-aesthetics/images/` (exact filenames in that folder's README) — they swap in automatically.
- Pages are generated for consistency by `london-classic-aesthetics/sitegen/build.mjs` (`node sitegen/build.mjs` from the site folder); the generated HTML is committed, so deployment needs no build step.

## Site: Dar Ul Amir (repo root)

`index.html` is the Dar Ul Amir storefront redesign (Thobe Atelier and Perfumery). It is a single-page, multi-view site: Home, Thobes, Perfumes, Contact, Refund Policy, with a scroll-scrubbed palace video intro that hands off into a matching hero.

### Structure
```
index.html                     the site (fonts embedded; images and video referenced as files)
assets/
  darulamir-intro.mp4          wide palace intro video (used on desktop) — committed, full quality
  darulamir-intro-vertical.mp4 9:16 vertical cut (used on phones) — ADD THIS FILE (see below)
images/
  <product photos>             ADD THESE (exact filenames in images/README.md)
```

### To finish the site
1. **Vertical video** — download the 9:16 reframe from Higgsfield and save it as `assets/darulamir-intro-vertical.mp4`. On phones the site auto-uses it; on desktop it uses the wide clip. If the file is absent, phones simply fall back to the wide clip.
2. **Product photos** — drop your images into `images/` using the exact names listed in `images/README.md`. Each slot falls back to a branded placeholder until its file exists, so the site never breaks.

### Deploy
- **Netlify**: drag this folder onto https://app.netlify.com/drop for an instant URL, or connect the repo.
- **GitHub Pages**: repo Settings, Pages, Source = `main` / root. Lives at `https://gensynx.github.io/Websitemaker/`.
- **Vercel**: import the repo, framework preset "Other", no build command.

### Notes
- Everything is full quality when hosted. The Claude preview artifact embeds and compresses media only because it must be one self-contained file; this repo has no such limit.
- Fonts (Lora, Outfit) are embedded in `index.html` as data URIs, so there is no external font dependency.
- The contact and mailing-list forms are demos; wire them to your inbox or Shopify before launch.
