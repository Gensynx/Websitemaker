# Websitemaker

Static websites built with Claude Code. Each site is a self-contained folder that can be hosted anywhere (Netlify, Vercel, GitHub Pages) with no build step.

## Sites in this repo
- **Dar Ul Amir** — repo root (`index.html`), deployed at https://gensynx.github.io/Websitemaker/
- **Halcyon Drive** — `car-hire/` (self drive performance car hire, London; fictional brand)
- **Driveway Mechanic** — `mobile-mechanic/` (two designs; fictional brand)
- **Ivory Room Aesthetics** — `aesthetics-clinic/` (24 page clinic and academy site; fictional brand)
- **Coveworks** — `coveworks/` folder, the studio's own animated site, editorial luxury edition (see `coveworks/README.md`)
- **Coveworks flagship** — `coveworks-scifi/` folder: welcome theme selector, nine full themes and a cursor following switcher bubble in one file (see `coveworks-scifi/README.md`)
- **Coveworks Lab** — `coveworks-lab/` folder: a five page futuristic "lab white" edition of the studio site with the configurator, where visitors describe the site they need and get a preview built for that kind of business (twenty three types, each with its own structure and photography, plus a fallback built around any other brief, in fifteen looks) and send it as a brief (see `coveworks-lab/README.md`). The earlier `coveworks-atelier/` addresses forward here
- **Fenwick & Rowe** — `accountants/` (12 page accountancy site; fictional brand, see `accountants/README.md`)
- **Fenwick & Rowe premium** — `accountants-premium/` (dark, high interaction edition: calculator, countdown, wizard, marquee; see its README)
- **Fenwick & Rowe Ledger** — `accountants-ledger/` (calm, typographic third edition: Swiss grid, self hosted fonts, deadline finder; shares its facts with the standard edition; see its README)
- **Lowtide 1996** — `streetwear/` (12 page streetwear storefront with a two skin design system; fictional brand, see its README)
- **Vassallo Developments** — `vassallo/` (single-page site for the property developer, with a scroll-scrubbed renovation video intro; live at https://gensynx.github.io/Websitemaker/vassallo/)

## Site: Vassallo Developments (`vassallo/`)

A single-page site for Vassallo Developments (acquisition, design and development): intro, approach, work,
track record and enquiry sections. Opens with a 12s renovation film — into a derelict house, through the decayed
rooms, then back out as every room rebuilds itself around the camera.

### Structure
```
vassallo/
  index.html                          the site (fonts embedded as data URIs)
  assets/
    vassallo-transformation-v3.mp4    the intro film (desktop) — 1280x720, all-intra; -mobile-v2 and -portrait-v2 for phones
    README.txt                        asset provenance and re-encode instructions
```

### Notes
- The seven trade cards carry **AI generated placeholder imagery** (Higgsfield, Recraft V4.1), not photographs of real
  Vassallo projects. The section is headed "Projects we've worked on", so replace these with genuine project
  photography before the site is promoted. Drop a 4:3 image in at the same filename in `vassallo/images/` and the
  card picks it up with no code change. See `vassallo/images/README.txt`.
- The **3D door and window configurator** lives at `vassallo/configurator/` and is reached from the button under the
  trades. It is a build of the `door-window-configurator` project (branch `claude/stoic-knuth-ymog8j`); its PHP enquiry
  backend is deliberately not published, and its enquiry hands the specification back to this site's own form instead.
  See `vassallo/configurator/README.txt` before using it for real quoting.
- On desktop the film is **scrubbed by scroll**. Touch devices cannot seek a video reliably frame by frame, so
  phones and tablets autoplay the film straight through instead and time the copy beats to it. Upright phones show
  the whole wide frame (`object-fit:contain`) rather than a zoom-crop, so it stays sharp.
- The video is encoded all-intra (every frame a keyframe) specifically so scroll-scrubbing lands instantly on any
  frame. Re-encode the same way if it is ever replaced — the command is in `assets/README.txt`.
- If the video fails to load, the intro removes itself and the rest of the site still works.
- **Contact details are placeholders**: `hello@vassallodevelopments.com` and `tel:+00000000000`. Replace both
  before treating this as a live public site.

## Fictional portfolio brands

Fenwick & Rowe, Lowtide 1996, Halcyon Drive, Driveway Mechanic and Ivory Room Aesthetics are made up businesses. Each site was designed for a real client who did not agree to be shown, so every name, contact detail, address, review, staff name and external link was replaced with fictional ones. Phone numbers use Ofcom's reserved drama ranges (020 7946 0xxx, 07700 900xxx) and emails the reserved `example.com` domain, so nothing reaches a real person. Keep it that way when editing them.

## Site: Fenwick & Rowe (`accountants/`)

A conversion focused, multi page accountancy site: home, services hub and 7 service pages, about, sample reviews, contact with booking form. Navy and gold design system, EB Garamond and IBM Plex Sans, scroll reveals, JSON-LD local business schema.

- Open `accountants/index.html` directly, or serve the repo root.
- Pages are generated by `accountants/sitegen/build.mjs` (`node sitegen/build.mjs` from the site folder); the generated HTML is committed.

## Site: Ivory Room Aesthetics (`aesthetics-clinic/`)

A 24 page clinic and academy site: home, 6 treatment pages and hub, 12 training course pages and hub, about, become a model, contact. Ivory, ink and champagne design system, Marcellus and Jost (fonts committed as woff2), scroll reveal and hero animations, all self contained.

- Open `aesthetics-clinic/index.html` directly, or serve the repo root.
- Photo slots show branded gradient placeholders until photos are dropped into `aesthetics-clinic/images/` (filenames in that folder's README).
- Pages are generated by `aesthetics-clinic/sitegen/build.mjs` (`node sitegen/build.mjs` from the site folder); the generated HTML is committed.

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
