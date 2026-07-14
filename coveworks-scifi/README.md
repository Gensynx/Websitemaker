# Coveworks · scifi edition, with a theme switcher

A heavily animated take on the Coveworks studio site, now with two full themes in one file. A floating bubble (bottom right) follows the visitor, morphs shape to match the active theme, and swaps the entire personality of the page:

- **Scifi cut** (default): deep space blue, signal cyan, Chakra Petch type, HUD chrome, clipped corners, warp starfield, crosshair cursor
- **Editorial cut**: warm black, brass, Fraunces serif, rounded shapes, film grain, drifting gold dust, quiet ring cursor

The choice is remembered between visits. One self contained file: both font sets and all images are embedded as data URIs, so it works opened straight from disk.

## Structure
```
index.html          the whole site (both theme font sets and images embedded, ~630 KB)
```

## What is animated
- The theme bubble: bobs idly, lags with your scroll, leans toward the cursor, morphs from cyan diamond to brass sphere on switch, and replays the headline decode in the new theme
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
