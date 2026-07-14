# Coveworks · the flagship site with four themes

The Coveworks studio site with four complete personalities in one self contained file. Visitors land on a welcome screen ("Welcome to Coveworks. Select a theme.") with three buttons, each rendered in its own theme. Picking one plays that theme's intro and lands on the hero. A floating bubble then lets them switch at any time.

## The four themes
- **Scifi**: deep space blue, signal cyan, Chakra Petch type, HUD chrome, clipped corners, scramble decode headlines, warp starfield, terminal boot intro, crosshair cursor
- **Editorial**: warm black, brass, Fraunces serif with italic accents, rounded shapes, film grain, line rise headlines, drifting gold dust, counter curtain intro, quiet ring cursor
- **Light**: pure white and gold, Space Grotesk, pill and rounded shapes, halo glows, light rays, golden bokeh, shimmer sweep headlines, radiant intro
- **Terminal**: phosphor green on black, everything monospace, hard offset shadows, CRT flicker and scanlines, matrix rain, typed headlines with a block cursor, green tinted work frames

Each theme has its own intro, headline entrance, canvas particles, shapes, fonts and chrome. Same words everywhere.

## The theme bubble
- Chases the pointer around the page on desktop, settling right beside it, and freezes when you reach for it so it is easy to catch; docks bottom right on phones
- Press it to cycle themes (spam friendly), or hover it to fan out four themed dots and pick one directly; the picker stays open with a grace period so the dots are easy to hit
- Morphs shape to match the active theme: cyan diamond, brass sphere, white halo orb, green terminal square
- A full page wipe in the new theme's colour carries the switch, and the headline replays its entrance
- Keyboard: press T anywhere to cycle themes
- The choice is remembered between visits

## Structure
```
index.html          the whole site (all font sets and images embedded, ~660 KB)
```

## Also animated
- Velocity reactive ticker, draggable work carousel with momentum, snap and parallax
- Scanline overlays and signal sweeps on work frames (scifi)
- Process timeline with a charging rail and nodes that light up
- Counters that count up, word by word manifesto reveal
- Viewport HUD with scroll coordinates and progress rail (scifi)
- Spinning radar and live clock in the footer, magnetic buttons

The welcome screen has ambient drifting glows, a word by word title entrance and a live hover effect on every theme card: scanline glitch (scifi), brass shimmer (editorial), golden bloom (light) and CRT flicker with a blinking cursor (terminal). Full `prefers-reduced-motion` support; renders complete with JavaScript disabled (scifi theme, no overlays).

## Content notes
- The carousel shows live captures of the Dar Ul Amir build (repo root), embedded in the file.
- `hello@coveworks.studio` is a placeholder and the contact form is a demo until wired to an inbox.
- Copy is dash free by request.

## Deploy
Any static host. On GitHub Pages for this repo it lives at `/Websitemaker/coveworks-scifi/` once merged to `main`.
