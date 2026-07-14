# Coveworks · scifi edition

A second, heavily animated take on the Coveworks studio site. Mission control theme: deep space blue, signal cyan, HUD chrome everywhere. One self contained file: fonts (Chakra Petch, Space Grotesk, Share Tech Mono) and all images are embedded as data URIs, so it works opened straight from disk.

## Structure
```
index.html          the whole site (fonts and images embedded, ~350 KB)
```

## What is animated
- Terminal boot sequence with typing status lines and a counter
- Headline decode effect (characters scramble into place)
- Canvas starfield that goes to warp when you scroll fast, with mouse parallax
- Rotating orbital rings, blinking status beacon, typing cursor
- Viewport HUD: corner brackets, scroll coordinates, sector readout, vertical progress rail
- Velocity reactive ticker
- Draggable transmissions carousel with momentum, snap, parallax, scanline overlays and a signal sweep on hover
- Section titles scramble into view; capability cards with traveling light beams
- Flight plan timeline with a charging rail and nodes that light up as you pass
- Telemetry counters that count up on view
- Word by word manifesto reveal
- Crosshair reticle cursor with drag state, magnetic buttons
- Spinning radar in the footer, live UTC clock

Full `prefers-reduced-motion` support; the page renders complete with JavaScript disabled.

## Content notes
- The carousel reuses live captures of the Dar Ul Amir build (repo root), embedded in the file.
- `hello@coveworks.studio` is a placeholder and the transmission form is a demo until wired to an inbox.
- Copy is dash free by request.

## Deploy
Any static host. On GitHub Pages for this repo it lives at `/Websitemaker/coveworks-scifi/` once merged to `main`.
