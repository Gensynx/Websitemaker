/**
 * Does the colour on screen resemble the colour being ordered?
 *
 * Renders a flush door in several RAL shades at the elevation preset, samples
 * the flat face of the leaf, and reports CIE76 ΔE against the RAL reference.
 * On-screen colour is indicative only and the page says so — but "indicative"
 * has to mean something. A white that renders beige, or a red that drifts
 * orange, is a fault in a product whose purpose includes choosing a colour.
 *
 * Run alongside lighting-metric.mjs: lifting whites by flooding the scene with
 * light is easy, and it is exactly what flattens the relief on dark finishes.
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:5180';
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const MAX_DELTA_E = Number(process.env.MAX_DELTA_E ?? 6);

const SHADES = {
  RAL9016: '#F1F0EA',
  RAL7016: '#383E42',
  RAL3005: '#59191F',
  RAL6009: '#26392F',
};

const query = (code) =>
  `view=el&v=3&m=u&p=d&w=900&h=2100&ce=${code}&ci=m&fe=sm&fi=m&g=c.2&sg=n&tv=n&s=sp&pd=fl&sl=n&sr=n&tl=n&hw=lr&hf=sc&lp=0&sh=0&kn=n&tr=st&hg=l&od=i`;

function toLab([r, g, b]) {
  const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function sampleLeaf(buffer, right) {
  const png = PNG.sync.read(buffer);
  const at = (x, y) => { const i = (png.width * y + x) << 2; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  const bg = at(4, 4);
  let [x0, y0, x1, y1] = [png.width, png.height, 0, 0];
  for (let y = 0; y < png.height; y += 2) for (let x = 0; x < right; x += 2) {
    const c = at(x, y);
    if (Math.abs(c[0] - bg[0]) + Math.abs(c[1] - bg[1]) + Math.abs(c[2] - bg[2]) > 30) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  // Left of centre and in the upper half: clear of the handle, the seals and
  // the frame, on the flat face of a flush leaf.
  const w = x1 - x0, h = y1 - y0;
  const values = [];
  for (let y = Math.round(y0 + h * 0.22); y < y0 + h * 0.36; y += 1)
    for (let x = Math.round(x0 + w * 0.26); x < x0 + w * 0.42; x += 1) values.push(at(x, y));
  const median = (k) => values.map((v) => v[k]).sort((a, b) => a - b)[values.length >> 1];
  return [median(0), median(1), median(2)];
}

const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });

let worst = 0;
for (const [code, hex] of Object.entries(SHADES)) {
  await page.goto(`${BASE}/?${query(code)}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
  await page.waitForTimeout(2500);
  // The panel, title and view bar float over the full-bleed canvas. Masked in
  // the ground colour, they vanish into the background the leaf is found
  // against, rather than stretching its bounding box to the screen edges.
  const chrome = ['.panel', '.title', '.viewbar', '.annotation'].map((selector) => page.locator(selector));
  // Searched only left of the panel, whose soft drop shadow spills past its mask.
  const panel = await page.locator('.panel').boundingBox();
  const shot = await page.locator('canvas').screenshot({ mask: chrome, maskColor: '#f4f3f0' });
  const rendered = sampleLeaf(shot, Math.floor((panel?.x ?? 1280) - 40));
  const [L1, a1, b1] = toLab(hexRgb(hex));
  const [L2, a2, b2] = toLab(rendered);
  const dE = Math.hypot(L1 - L2, a1 - a2, b1 - b2);
  worst = Math.max(worst, dE);
  const renderedHex = '#' + rendered.map((c) => c.toString(16).padStart(2, '0')).join('');
  console.log(`${code}  ref ${hex}  rendered ${renderedHex}  ΔE ${dE.toFixed(1).padStart(5)}  (L ${L1.toFixed(0)} -> ${L2.toFixed(0)})`);
}
await browser.close();

console.log(`\nworst ΔE ${worst.toFixed(1)} (limit ${MAX_DELTA_E})`);
if (worst > MAX_DELTA_E) {
  console.error('FAILED: rendered colour is too far from the RAL reference');
  process.exit(1);
}
