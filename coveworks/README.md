# Coveworks · studio site

A fully animated, single file website for **Coveworks**, the studio behind the builds in this repo. Dark, editorial, brass on warm black. No build step, no external dependencies: fonts (Fraunces, Archivo, Space Mono) and the carousel images are embedded in `index.html` as data URIs, so the single file works anywhere, even opened directly from disk.

## Structure
```
index.html          the whole site (fonts and images embedded, ~490 KB)
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
- The work carousel shows live screenshots of the Dar Ul Amir build (repo root), embedded in the file. The Vassallo Developments slide is typographic since no visual asset exists in the repo.
- `hello@coveworks.studio` is a placeholder address and the contact form is a demo until wired to an inbox.
- Copy is dash free by request; separators use middots.

## Book a call (Google Calendar)
The contact section carries a hidden **Book a call** button wired to Google Calendar appointment scheduling. To switch it on: create an appointment schedule in Google Calendar, copy its share link, and paste it into the `CW_BOOKING_URL` constant near the top of the script in `index.html`. Full schedule links open in an in-page overlay; `calendar.app.google` short links open in a new tab. Until a link is set the button does not render at all. Setup guide and reusable widgets: [`../google-calendar/`](../google-calendar/).

## Deploy
Any static host. For GitHub Pages on this repo it lives at `/Websitemaker/coveworks/` once merged to `main`.
