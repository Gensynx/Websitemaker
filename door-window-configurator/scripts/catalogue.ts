import { mkdirSync, writeFileSync } from 'node:fs';
import type { ConfigState } from '../src/config/types';
import { CATALOGUE } from '../src/config/catalogue';
import type { CatalogueTile } from '../src/config/catalogue';
import { buildProduct } from '../src/viewer/geometry';
import { colourToHex } from '../src/viewer/materials';
import { encodeConfig } from '../src/config/url';
import { formatSize } from '../src/config/units';
import { fillFor, OUTLINE_WIDTH_PX, outlineFor, SHAPE_RENDERING } from '../src/viewer/elevationStyle';

function svg(config: ConfigState): string {
  const model = buildProduct(config);
  const frameFill = colourToHex(config.colour.external);
  const { width, height } = model.bounds;
  const margin = Math.max(width, height) * 0.06;
  const ordered = [...model.parts].sort((a, b) => a.position[2] - b.position[2]);

  const rects = ordered
    .map((part) => {
      const fill = fillFor(part.kind, frameFill);
      return `<rect x="${(part.position[0] - part.size[0] / 2).toFixed(1)}" y="${(part.position[1] - part.size[1] / 2).toFixed(1)}" width="${part.size[0].toFixed(1)}" height="${part.size[1].toFixed(1)}" fill="${fill}" stroke="${outlineFor(fill)}" stroke-width="${OUTLINE_WIDTH_PX}" vector-effect="non-scaling-stroke"/>`;
    })
    .join('');

  return `<svg shape-rendering="${SHAPE_RENDERING}" viewBox="${-width / 2 - margin} ${-margin} ${width + margin * 2} ${height + margin * 2}" preserveAspectRatio="xMidYMid meet"><g transform="translate(0 ${height}) scale(1 -1)">${rects}</g></svg>`;
}

function section(title: string, note: string, tiles: CatalogueTile[]): string {
  const cards = tiles
    .map(
      (tile) => `<figure class="tile">
        <div class="tile__art">${svg(tile.config)}</div>
        <figcaption>
          <span class="tile__label">${tile.label}</span>
          <span class="tile__size">${formatSize(tile.config.dimensions.width, tile.config.dimensions.height)}</span>
          <a class="tile__link" href="./door-window-configurator.html?view=el&amp;${encodeConfig(tile.config).toString().replace(/&/g, '&amp;')}">Open in 3D</a>
        </figcaption>
      </figure>`,
    )
    .join('');
  return `<section><h2>${title}</h2><p class="note">${note}</p><div class="grid">${cards}</div></section>`;
}

const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Door and window catalogue</title>
<style>
:root{--ink:#16181a;--ink-soft:#5b6165;--ink-faint:#8b9195;--ground:#f5f5f3;--surface:#fff;--line:rgba(22,24,26,.1);--accent:#1f5f4b;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font:16px/1.55 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:82rem;margin-inline:auto;padding:clamp(1.5rem,4vw,3.5rem)}
.eyebrow{margin:0 0 .75rem;font-size:.8125rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint)}
h1{margin:0;font-size:clamp(2.4rem,5vw,3.6rem);font-weight:600;letter-spacing:-.022em;line-height:1.03}
.lede{margin:1rem 0 0;max-width:46rem;color:var(--ink-soft)}
h2{margin:0 0 .35rem;font-size:1.35rem;font-weight:600;letter-spacing:-.01em}
section{margin-top:clamp(2.5rem,5vw,4rem)}
.note{margin:0 0 1.5rem;color:var(--ink-faint);font-size:.8125rem;max-width:44rem}
.grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))}
.tile{margin:0;background:var(--surface);border:1px solid var(--line);display:flex;flex-direction:column}
.tile__art{padding:1.5rem 1.25rem;display:grid;place-items:center;min-height:15rem}
.tile__art svg{width:100%;height:100%;max-height:13rem}
figcaption{border-top:1px solid var(--line);padding:.875rem 1rem;display:grid;gap:.2rem}
.tile__label{font-size:.9375rem}
.tile__size{font-size:.75rem;color:var(--ink-faint);font-variant-numeric:tabular-nums}
.tile__link{font-size:.75rem;color:var(--accent);text-decoration:none;margin-top:.35rem}
.tile__link:hover{text-decoration:underline}
footer{margin-top:clamp(2.5rem,5vw,4rem);color:var(--ink-faint);font-size:.8125rem;max-width:46rem}
</style>
</head>
<body>
<div class="wrap">
<header>
  <p class="eyebrow">Configurator</p>
  <h1>Catalogue</h1>
  <p class="lede">Every style the parametric model currently produces, drawn as elevations from the same geometry the 3D viewer uses. Nothing here is an illustration: if a style is wrong on this page it is wrong in the product.</p>
</header>
${CATALOGUE.map((entry) => section(entry.title, entry.note, entry.tiles)).join('\n')}
<footer>
  <p>uPVC, RAL 7016 Anthracite Grey for doors and RAL 9016 Traffic White for windows, at each style's suggested size. Sightlines, limits and RAL values are placeholders. On-screen colours, finishes and obscure glass patterns are indicative only.</p>
  <p>"Open in 3D" expects door-window-configurator.html beside this file.</p>
</footer>
</div>
</body>
</html>`;

mkdirSync('dist-singlefile', { recursive: true });
const out = 'dist-singlefile/catalogue.html';
writeFileSync(out, html);
const tiles = CATALOGUE.reduce((total, entry) => total + entry.tiles.length, 0);
console.log(`${out}  ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB  ${tiles} tiles`);
