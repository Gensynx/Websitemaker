# Coverworks · studio site

A fully animated, single file website for **Coverworks**, the studio behind the builds in this repo. Dark, editorial, brass on warm black. No build step, no external dependencies: fonts (Fraunces, Archivo, Space Mono) are embedded in `index.html` as data URIs.

## Structure
```
index.html          the whole site (fonts embedded, ~320 KB)
images/             carousel screenshots of past builds (WebP)
```

## What is animated
- Preloader with counter and curtain reveal
- Hero headline line reveal, drifting gold dust canvas, ambient glows
- Velocity reactive marquee
- Draggable work carousel with momentum, snap, parallax frames, progress bar and arrows
- Word by word manifesto reveal on scroll
- Custom cursor with drag state, magnetic buttons (fine pointers only)
- Header that hides on scroll down and turns to glass on scroll
- Full `prefers-reduced-motion` support; the site also renders fine with JavaScript disabled

## Content notes
- The work carousel shows live screenshots of the Dar Ul Amir build (repo root). The Vassallo Developments slide is typographic since no visual asset exists in the repo.
- `hello@coverworks.studio` is a placeholder address and the contact form is a demo until wired to an inbox.
- Copy is dash free by request; separators use middots.

## Deploy
Any static host. For GitHub Pages on this repo it lives at `/Websitemaker/coverworks/` once merged to `main`.
