/**
 * Can a customer tell a panelled door from a flush one?
 *
 * Renders the same anthracite door twice at the elevation preset — once with
 * raised panels, once flush — and measures edge energy (mean luminance
 * gradient) across the door. If panel detailing is invisible, the two numbers
 * are the same and the ratio is ~1. That was the defect: geometrically correct
 * panels that the lighting could not show on a near-black surface.
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:5180';
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const COMMON = 'view=el&v=3&m=u&p=d&w=900&h=2100&ce=RAL7016&ci=m&fe=sm&fi=m&g=c.2&sg=n&tv=n&s=sp&sl=n&sr=n&tl=n&hw=lr&hf=sc&lp=0&sh=0&kn=n&tr=st&hg=l&od=i';
const CASES = {
  flush: `${COMMON}&pd=fl`,
  raised4: `${COMMON}&pd=r.4.ov`,
  grooved: `${COMMON}&pd=g.5.18.h`,
};

function luminance(png, x, y) {
  const i = (png.width * y + x) << 2;
  return 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
}

/** Mean gradient magnitude over the dark (door) pixels, ignoring the frame edge. */
function edgeEnergy(buffer) {
  const png = PNG.sync.read(buffer);
  const dark = (x, y) => luminance(png, x, y) < 110;
  let sum = 0;
  let count = 0;
  for (let y = 2; y < png.height - 2; y += 1) {
    for (let x = 2; x < png.width - 2; x += 1) {
      // Only interior door pixels: dark here and in a 2 px ring, so the
      // door's own silhouette against the background does not count.
      if (!(dark(x, y) && dark(x - 2, y) && dark(x + 2, y) && dark(x, y - 2) && dark(x, y + 2))) continue;
      const gx = luminance(png, x + 1, y) - luminance(png, x - 1, y);
      const gy = luminance(png, x, y + 1) - luminance(png, x, y - 1);
      sum += Math.hypot(gx, gy);
      count += 1;
    }
  }
  return { energy: count === 0 ? 0 : sum / count, pixels: count };
}

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });

const results = {};
for (const [name, query] of Object.entries(CASES)) {
  await page.goto(`${BASE}/?${query}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForTimeout(3500);
  // The heading and panel text over the full-bleed canvas are dark too, and
  // would count as door pixels. Masked in the ground colour, they drop out.
  const chrome = ['.panel', '.title', '.viewbar', '.annotation'].map((selector) => page.locator(selector));
  const options = { mask: chrome, maskColor: '#f4f3f0' };
  const shot = await page.locator('canvas').screenshot(options);
  results[name] = edgeEnergy(shot);
  if (process.env.SHOTS) await page.locator('canvas').screenshot({ ...options, path: `${process.env.SHOTS}/metric-${name}.png` });
}
await browser.close();

const raisedRatio = results.raised4.energy / results.flush.energy;
const groovedRatio = results.grooved.energy / results.flush.energy;
for (const [name, r] of Object.entries(results)) {
  console.log(`${name.padEnd(8)} edge energy ${r.energy.toFixed(2).padStart(6)}  over ${r.pixels} door pixels`);
}
console.log(`raised / flush  = ${raisedRatio.toFixed(2)}`);
console.log(`grooved / flush = ${groovedRatio.toFixed(2)}`);

const THRESHOLD = Number(process.env.MIN_RATIO ?? 2);
if (raisedRatio < THRESHOLD || groovedRatio < THRESHOLD) {
  console.error(`\nFAILED: panel detailing is not distinguishable from a flush door (need >= ${THRESHOLD}x)`);
  process.exit(1);
}
console.log('\npanel detailing is visible');
