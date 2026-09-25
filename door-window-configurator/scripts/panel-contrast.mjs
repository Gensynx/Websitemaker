/**
 * Can a customer tell the door panel styles apart at the size they choose
 * between them? Measured, not judged by eye.
 *
 * Every pair of panel styles is rasterised by the browser at the size each
 * drawing is actually shown, and compared pixel by pixel:
 *
 *   catalogue   the "Door panel detailing" tiles in dist-singlefile/catalogue.html
 *   thumbnail   the Panels tiles in the configurator (ElevationThumb)
 *   elevation   the SVG drawing used for the review and the no-WebGL fallback
 *               (StaticElevation)
 *
 * On a dark frame (RAL 7016, the default) and a light one (RAL 9016).
 *
 * A pair passes when at least MIN_PIXELS pixels differ by at least MIN_DELTA
 * in some channel. Found failing: flush, one raised panel and both grooved
 * styles rasterised identically in the catalogue (max channel delta 11/255),
 * as did two and four raised panels.
 *
 *   npm run build:share   # the catalogue is read from dist-singlefile
 *   npm run dev -- --port 5180 &
 *   node scripts/panel-contrast.mjs
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:5180';
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = process.env.SHOTS;
if (OUT) mkdirSync(OUT, { recursive: true });

/** A difference a customer can see: a quarter of the channel range... */
const MIN_DELTA = 64;
/**
 * ...over more than a speck. First set at 20 px, "roughly a panel edge at
 * tile size". Raised to 40 after the owner reported door-set tiles that look
 * the same: those measured 23 px here and passed. Calibrated on that report,
 * after seeing results — recorded in TEST-AUDIT.md (A20).
 */
const MIN_PIXELS = 40;

// The catalogue's seven panel styles, as the configurator link encodes them.
const PANELS = [
  ['Flush', 'fl'],
  ['1 raised panel', 'r.1.ov'],
  ['2 raised panels', 'r.2.ov'],
  ['3 raised panels', 'r.3.ov'],
  ['4 raised panels', 'r.4.ov'],
  ['Grooved, horizontal', 'g.5.18.h'],
  ['Grooved, vertical', 'g.4.18.v'],
];

const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const problems = [];

/**
 * Rasterise a drawing exactly as shown — same markup, same box size — but on
 * one fixed stage at the page origin. Screenshotting each tile where it sits
 * compared drawings at different sub-pixel offsets, and the misalignment of
 * the door's outline alone counted as "different": the first version of this
 * check passed the catalogue on exactly the pairs that look identical.
 */
const pixels = async (locator, name) => {
  const { markup, width, height } = await locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { markup: element.outerHTML, width: Math.round(box.width), height: Math.round(box.height) };
  });
  await page.evaluate(
    ({ markup, width, height }) => {
      let stage = document.getElementById('contrast-stage');
      if (stage === null) {
        stage = document.createElement('div');
        stage.id = 'contrast-stage';
        document.body.append(stage);
      }
      stage.style.cssText = `position:fixed;left:0;top:0;z-index:2147483647;background:#fff;width:${width}px;height:${height}px`;
      stage.innerHTML = markup;
      const svg = stage.firstElementChild;
      svg.setAttribute('width', String(width));
      svg.setAttribute('height', String(height));
      svg.style.cssText = 'display:block;width:100%;height:100%';
    },
    { markup, width, height },
  );
  const stage = page.locator('#contrast-stage');
  const png = PNG.sync.read(await stage.screenshot({ animations: 'disabled' }));
  if (OUT) await stage.screenshot({ path: `${OUT}/panels-${name.replace(/\W+/g, '-')}.png` });
  await page.evaluate(() => document.getElementById('contrast-stage')?.remove());
  return png;
};

/** The same drawing rendered twice must match exactly, or the comparison is measuring layout, not panels. */
async function control(renderer, locator) {
  const a = await pixels(locator, 'control-a');
  const b = await pixels(locator, 'control-b');
  const { visible, max } = compare(a, b);
  if (visible !== 0 || max > 2) problems.push(`${renderer}: the control is not stable (${visible} px, max ${max}); the comparison cannot be trusted`);
}

/** Pixels differing by at least MIN_DELTA, and the largest channel delta. */
function compare(a, b) {
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  let visible = 0;
  let max = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * a.width + x) * 4;
      const j = (y * b.width + x) * 4;
      const d = Math.max(
        Math.abs(a.data[i] - b.data[j]),
        Math.abs(a.data[i + 1] - b.data[j + 1]),
        Math.abs(a.data[i + 2] - b.data[j + 2]),
      );
      if (d > max) max = d;
      if (d >= MIN_DELTA) visible += 1;
    }
  }
  return { visible, max };
}

function checkAll(renderer, shots) {
  const names = Object.keys(shots);
  let worst = null;
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const result = compare(shots[names[i]], shots[names[j]]);
      if (worst === null || result.visible < worst.visible) worst = { ...result, pair: `${names[i]} / ${names[j]}` };
      if (result.visible < MIN_PIXELS) {
        problems.push(`${renderer}: "${names[i]}" and "${names[j]}" look the same (${result.visible} px differ by ${MIN_DELTA}+, max delta ${result.max}/255)`);
      }
    }
  }
  const size = shots[names[0]];
  console.log(
    `${renderer} (${size.width} × ${size.height} px, ${names.length} styles): worst pair ${worst.pair}, ${worst.visible} px visibly different, max delta ${worst.max}/255`,
  );
}

// 1. The catalogue, as published.
{
  await page.goto(`file://${resolve('dist-singlefile/catalogue.html')}`);
  const shots = {};
  for (const [label] of PANELS) {
    const tile = page.locator('figure.tile').filter({ has: page.locator('.tile__label', { hasText: new RegExp(`^${label}$`) }) });
    shots[label] = await pixels(tile.first().locator('.tile__art svg'), `catalogue-${label}`);
  }
  await control('catalogue', page.locator('figure.tile .tile__art svg').first());
  checkAll('catalogue, RAL 7016', shots);
}

// 2 and 3. The configurator's thumbnails and its SVG elevation, dark and light.
for (const [colourName, colour] of [
  ['RAL 7016', 'RAL7016'],
  ['RAL 9016', 'RAL9016'],
]) {
  // The Panels tiles: each is a thumbnail of the current door with that
  // panel. On a single door, and on a door set with two wide side lights,
  // where the leaf is a small part of the frame — the case found failing
  // after this check passed: it had only ever looked at a single door.
  for (const [doorName, query] of [
    ['single door', `p=d&ce=${colour}`],
    ['door set', `v=3&m=u&p=d&w=2300&h=2100&ce=${colour}&ci=m&fe=sm&fi=m&g=c.2&sg=t&tv=n&s=sp&pd=r.2.ov&sl=600.n.i&sr=600.n.i&tl=n&hw=lr&hf=sc&lp=1&sh=0&kn=n&tr=st&hg=l&od=i`],
  ]) {
    await page.goto(`${BASE}/?${query}&view=el`, { waitUntil: 'networkidle' });
    await page.evaluate(() => sessionStorage.clear());
    // The fixture must be a buildable door, or the tiles show another one.
    if ((await page.locator('.stage__stale p').count()) > 0) problems.push(`thumbnail fixture "${doorName}" cannot be built`);
    const toggle = page.locator('#section-style-toggle');
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
    const group = page.getByRole('group', { name: 'Panels' });
    await group.waitFor();
    const thumbs = {};
    for (const label of await group.locator('.tile__label').allTextContents()) {
      const tile = group.locator('label.tile').filter({ has: page.locator('.tile__label', { hasText: new RegExp(`^${label}$`) }) });
      thumbs[label] = await pixels(tile.locator('.tile__picture svg'), `thumb-${colour}-${doorName}-${label}`);
    }
    await control('thumbnail', group.locator('.tile__picture svg').first());
    checkAll(`thumbnail, ${doorName}, ${colourName}`, thumbs);
  }

  // The elevation, as the review dialog shows it.
  const drawings = {};
  for (const [label, code] of PANELS) {
    await page.goto(`${BASE}/?p=d&s=sp&pd=${code}&ce=${colour}&view=el`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Review and enquire' }).click();
    const picture = page.locator('.review__picture svg');
    await picture.waitFor();
    // Taken from the dialog, drawn on the stage once the dialog (and its
    // backdrop) is closed.
    const markup = await picture.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { html: element.outerHTML, width: box.width, height: box.height };
    });
    await page.keyboard.press('Escape');
    await page.evaluate(({ html, width, height }) => {
      const holder = document.createElement('div');
      holder.id = 'contrast-source';
      holder.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px`;
      holder.innerHTML = html;
      holder.firstElementChild.style.cssText = `width:${width}px;height:${height}px`;
      document.body.append(holder);
    }, markup);
    const source = page.locator('#contrast-source svg');
    drawings[label] = await pixels(source, `elevation-${colour}-${label}`);
    if (label === PANELS[0][0]) await control('elevation', source);
    await page.evaluate(() => document.getElementById('contrast-source')?.remove());
  }
  checkAll(`elevation, ${colourName}`, drawings);
}

await browser.close();

if (problems.length > 0) {
  console.log('\nFAILED:');
  for (const problem of problems) console.log(`  ${problem}`);
  process.exit(1);
}
console.log(`every pair of panel styles differs visibly (>= ${MIN_PIXELS} px by >= ${MIN_DELTA}/255) in every renderer`);
