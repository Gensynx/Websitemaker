# Handover Brief — Dar Ul Amir storefront

_Last updated: this session. Static site, no build step._

## 1. What this is
A redesign of **darulamir.com** (Dar Ul Amir — a Thobe Atelier and Perfumery, "House of the prince"). It is a single-page, multi-view static site: **Home · Thobes · Perfumes · Contact · Refund Policy**, opening with a scroll-scrubbed Arabian-palace video that hands off into a matching hero. Built to match the original brand (deep plum + gold, Lora/Outfit type) with real content carried over from the live store.

## 2. Where everything lives
| Thing | Location |
|---|---|
| **This site (source + deploy)** | `Gensynx/Websitemaker` (this repo), branch `main` |
| **Live site** | https://gensynx.github.io/Websitemaker/ (GitHub Pages, Deploy from a branch → main / root) |
| **Design skill used to build it** | `Mehdi-Gensynx/ui-ux-pro-max-skill` (private) — a Claude Code skill, loaded from a repo's `.claude/skills/`, NOT a claude.ai account Skill |
| **NOT here** | The production app `Gensynx/gensynx` was deliberately kept clean — none of this work touched it |

A separate earlier build (Vassallo Developments) exists only as a Claude artifact + a sent HTML file; it was never committed anywhere.

## 3. Current state
**Done and deployed:**
- Full site: Home (hero → trust marks → Elevate band → Amir Series feature → Essentials band), Thobes page (4 thobes, filter bar, size chips 52–62, hover-swap), Perfumes page (all 14 with correct prices + SALE/SOLD OUT badges), Contact form, full Refund Policy accordion, footer with mailing list + socials.
- **Spotlight product cards** (the 21st.dev GlowCard effect, recoloured plum/gold).
- **Intro video:** `assets/darulamir-intro.mp4` — 16:9, upscaled to 1440p with a de-band + mild sharpen pass (fixes the night-sky banding). Full-bleed on desktop.
- **Vertical intro:** `assets/darulamir-intro-vertical.mp4` — 720×1280, used automatically on phones.
- Fonts (Lora, Outfit) embedded in `index.html` as data URIs — no external font dependency.
- Copy is dash-free (product names use middots).

**Outstanding (the only real gap):**
1. **Product photos.** Every product/lifestyle slot currently shows a branded placeholder and falls back gracefully. Drop real images into `images/` using the exact names in `images/README.md` (elevate, essentials, logo, each thobe + a `-2` hover image, each perfume). Filename = product name lowercased, spaces/`·` → hyphens (note `ombr-oud-50ml.jpg`).
2. **Optional:** a true **AI 2K/4K** intro video. The current 1440p de-banded version is a big improvement, but not AI-invented detail. If wanted, upscale in the Higgsfield app (Upscale → 2K) and replace `assets/darulamir-intro.mp4`.
3. **Before launch:** wire the Contact + mailing-list forms to a real inbox/Shopify (they're demos), and set real contact details (currently `info@darulamir.com` + placeholders).

## 4. How to finish it
- **Photos:** upload the files (see constraint below), rename to the slugs in `images/README.md`, commit to `images/`, push. Placeholders swap automatically.
- **Deploy is already on:** any push to `main` republishes GitHub Pages within ~1 min.
- **Hero hand-off polish (optional):** the live hero overlays a crescent moon; the current 16:9 clip ends on the Arabic wordmark instead. Buttons/tagline align, but the hero could be tuned to match the clip's final frame exactly for a seamless transition.

## 5. Operating constraints discovered this session (important)
- **This is a sandboxed, network-restricted environment.** Outbound access is blocked to most hosts (the live store, Higgsfield's CDN, github.io). So: I cannot fetch the original site, download Higgsfield outputs, or preview the live URL from inside. A more open environment (or doing generation in the source app) avoids the download/re-upload loop.
- **Media reaches me only as `@` file uploads, never as pasted screenshots.** Pastes are visible but not on disk; uploads land on disk and can be committed.
- **The Claude "artifact" preview always compresses embedded media** (it must be one self-contained file). Judge quality on the **hosted site**, never the artifact.
- **Higgsfield MCP was unreliable** all session (connected in settings but tools often not loaded). A fresh session reconnects it cleanly; or use the Higgsfield app directly.

## 6. Asset spec for future builds (avoids the quality problems we hit)
- **Full-screen video:** generate natively at the shape it will display — **16:9 ≥1080p (2K/4K ideal) for desktop**, a separate **9:16 1080×1920 for phones**. Do not reframe/crop a wide clip to fit; make it the right shape at the source.
- **Images:** provide at ~**2× the display size** (a ~400px card → 800px+ image; a full-width band → 2000px+).
- **Judge quality on the deployed URL**, not the preview.

## 7. Quick reference
- Live: https://gensynx.github.io/Websitemaker/
- Preview artifact: https://claude.ai/code/artifact/7ea64d27-efdd-4e92-8941-0977c86e06c5
- Repo: `Gensynx/Websitemaker` (main)
- Structure: `index.html`, `assets/` (two videos), `images/` (photos to add), `README.md`, `images/README.md`
