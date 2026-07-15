# Coveworks · the flagship site with seven themes

The Coveworks studio site with seven complete personalities in one self contained file. Visitors land on a welcome screen ("Welcome to Coveworks. Select a theme.") with seven buttons, each rendered in its own theme. Picking one plays that theme's intro and lands on the hero. A floating bubble then lets them switch at any time.

## The seven themes
- **Scifi**: deep space blue, signal cyan, Chakra Petch type, HUD chrome, clipped corners, scramble decode headlines, warp starfield, terminal boot intro, crosshair cursor
- **Editorial**: warm black, brass, Fraunces serif with italic accents, rounded shapes, film grain, line rise headlines, drifting gold dust, counter curtain intro, quiet ring cursor
- **Light**: pure white and gold, Space Grotesk, pill and rounded shapes, halo glows, light rays, golden bokeh, shimmer sweep headlines, radiant intro
- **Terminal**: phosphor green on black, everything monospace, hard offset shadows, CRT flicker and scanlines, matrix rain, typed headlines with a block cursor
- **Glass**: deep water blue, 3d glass panels with blur and rim highlights, rising bubbles, underwater light shafts, character wave headlines, glass orb bubble
- **Futurist**: jet black, extrabold Archivo, red bloom accents, a red scan line sweeping the viewport, a dot matrix that heats up under the scan, word by word glitch fade headlines, and a WebGL hero: an organic contour ring blob generated procedurally with a true depth map, floating beside the headline with pointer parallax and a red dot wave flowing through its depth (matching the hero futuristic reference)
- **Mono**: grayscale shadcn minimalism on paper white, Archivo tracking tight, outlined accent headline, pill buttons, and a physics ballpit of chrome spheres with gravity and collisions where the lead ball chases the cursor

Each theme has its own intro, headline entrance, canvas particles, shapes, fonts and chrome, and the particle effect now runs across the entire page, not just the hero. Work screenshots are never tinted by a theme; only the chrome around them changes. Same words everywhere.

## The theme bubble
- Free roams the page with wandering physics while being pulled toward the pointer, settles beside it when you stop, and freezes when you reach for it; a small tag then reminds you that T cycles themes. Docks bottom right on phones
- Press it to cycle themes (spam friendly), or hover it to fan out four themed dots and pick one directly; the picker stays open with a grace period so the dots are easy to hit
- Morphs shape to match the active theme: cyan diamond, brass sphere, white halo orb, green terminal square, glass droplet orb
- A full page wipe in the new theme's colour carries the switch, and the headline replays its entrance
- Keyboard: press T anywhere to cycle themes
- The choice is remembered between visits, and `?theme=glass` (or any theme name) in the URL opens that theme directly, skipping the welcome screen

## Structure
```
index.html          the whole site (all font sets, images and WebGL textures embedded, ~815 KB)
```

## The works page
The portfolio lists real projects from this repository: Vassallo Developments, Dar Ul Amir (one build, with a four view gallery in its popup), the Coveworks editorial edition and the flagship itself. The work section links to an all works page (`#/works`), a themed grid of previews where each build opens a popup with the preview and gallery on one side and the story, tags and live link on the other. The theme's particles, chrome and cursor carry onto the works page and popup, the page content fades away beneath, and the grid staggers in with the theme's own title reveal.

## Also animated
- Velocity reactive ticker, draggable work carousel with momentum, snap and parallax
- Scanline overlays and signal sweeps on work frames (scifi)
- Process timeline with a charging rail and nodes that light up
- Counters that count up, word by word manifesto reveal
- Viewport HUD with scroll coordinates and progress rail (scifi)
- Spinning radar and live clock in the footer, magnetic buttons

The welcome screen has ambient drifting glows, a word by word title entrance and a live hover effect on every theme card: scanline glitch (scifi), brass shimmer (editorial), golden bloom (light) and CRT flicker with a blinking cursor (terminal). Full `prefers-reduced-motion` support; renders complete with JavaScript disabled (scifi theme, no overlays).

## Content notes
- The carousel shows live captures of the Dar Ul Amir build (repo root) and both Coveworks editions, embedded in the file.
- `hello@coveworks.studio` is a placeholder and the contact form is a demo until wired to an inbox.
- Copy is dash free by request.

## Deploy
Any static host. On GitHub Pages for this repo it lives at `/Websitemaker/coveworks-scifi/` once merged to `main`.
