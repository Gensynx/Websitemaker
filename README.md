# Websitemaker

Static websites built with Claude Code. Each site is a self-contained folder that can be hosted anywhere (Netlify, Vercel, GitHub Pages) with no build step.

## Sites in this repo

| Site | Where | URL when hosted on GitHub Pages |
|---|---|---|
| Dar Ul Amir (thobes & perfumery) | repo root (`index.html`) | `https://gensynx.github.io/Websitemaker/` |
| Vassallo Developments | `vassallo/` | `https://gensynx.github.io/Websitemaker/vassallo/` |

## Site: Vassallo Developments (`vassallo/`)

Property acquisition / design / development one-pager. Opens with a
scroll-scrubbed Higgsfield film — a derelict townhouse rebuilt floor by floor,
ending on the new front door closing — capped by the line *"We make the
impossible possible."*, then hands off into the brochure site (approach, work,
track record, enquiry form).

```
vassallo/
  index.html                          the site (fonts embedded)
  assets/
    vassallo-transformation.mp4       ADD THIS FILE (see assets/README.txt) —
                                      until it exists the page streams the clip
                                      from the Higgsfield CDN as a fallback
    vassallo-transformation-vertical.mp4  optional 9:16 cut for phones
```

## Site: Dar Ul Amir

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
