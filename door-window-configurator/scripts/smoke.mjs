/**
 * Browser smoke test.
 *
 * Unit tests cannot tell you that the canvas mounted, that the product is in
 * frame, or that a prop React Three Fiber does not understand threw before
 * the first render. This does. Run it against a dev or preview server:
 *
 *   npm run dev            # in one shell
 *   npm run smoke          # in another
 *
 * Every case is a shareable link, which is also a check that the codec and
 * the viewer agree.
 */

import { chromium } from 'playwright';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:5180';
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHOTS = process.env.SMOKE_SHOTS ?? '/tmp';

/**
 * Every case renders at the ELEVATION preset (Step 2.7): alignment, sightline
 * balance and bar registration across mullions can only be judged square-on.
 */
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const CASES = [
  { name: 'door-default', query: '?view=el' },
  {
    name: 'door-sidelights-toplight',
    query:
      '?view=el&v=3&m=u&p=d&w=1800&h=2200&ce=RAL7016&ci=m&fe=sm&fi=m&g=c.2&sg=t&tv=n&s=hg&pd=r.2.ov&gf=0.5&ap=r.120.i&ab=aa_2_3_22&sl=400.aa_1_4_22.i&sr=400.aa_1_4_22.i&tl=350.r.n.i&hw=lb&hf=br&lp=1&sh=1&kn=rg&tr=lo&hg=l&od=i',
  },
  {
    name: 'window-casement-3x2',
    query:
      // Bars in EVERY light, and an opener in each outer column, so bar
      // registration across mullions and handle placement are both visible.
      '?view=el&v=3&m=a&p=w&w=2400&h=1400&ce=RAL9005&ci=m&fe=sm&fi=m&g=c.3&sg=n&tv=hf.2&s=cs&gd=1-2-1*1-1*shl.aa_2_2_22.i-f.aa_3_2_22.i-shr.aa_2_2_22.i-f.aa_2_2_22.i-f.aa_3_2_22.i-f.aa_2_2_22.i&hw=lr&hf=bk',
  },
  {
    name: 'window-sash',
    query:
      '?view=el&v=3&m=t&p=w&w=900&h=1600&ce=RAL9010&ci=m&fe=sm&fi=m&g=c.2&sg=n&tv=n&s=sa&op=dh&mr=0.55&ho=1&ub=aa_3_2_22&lb=aa_3_2_22&hw=lr&hf=sc',
  },
];

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  // Headless Chromium has no GPU; SwiftShader gives it a real WebGL context.
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, hasTouch: true });

const problems = [];
page.on('console', (message) => {
  if (message.type() !== 'error') return;
  // The URL is on the location, not in the text: a bare "404 (Not Found)"
  // message says nothing about what was missing. A missing favicon is a
  // branding decision outstanding, not a fault.
  const source = message.location().url;
  if (source.includes('favicon')) return;
  problems.push(`console: ${message.text()} (${source})`);
});
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

for (const viewport of VIEWPORTS) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  for (const testCase of CASES) {
    await page.goto(`${BASE}/${testCase.query}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(1800);

    const painted = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas !== null && canvas.width > 0 && canvas.height > 0;
    });

    // Both dimension labels state their unit. Read from the DOM, because
    // "does it say mm" is a question about what is on screen.
    const labels = await page.locator('.annotation').allTextContents();
    const unitless = labels.filter((text) => !/^\d+\s?mm$/.test(text.trim()));
    if (labels.length !== 2) problems.push(`${viewport.name}/${testCase.name}: expected 2 annotations, saw ${labels.length}`);
    if (unitless.length > 0) {
      problems.push(`${viewport.name}/${testCase.name}: annotation without a unit: ${JSON.stringify(unitless)}`);
    }

    console.log(
      `${viewport.name}/${testCase.name}: canvas=${painted} annotations=${JSON.stringify(labels)}`,
    );
    await page.screenshot({ path: `${SHOTS}/shot-${viewport.name}-${testCase.name}.png` });
  }
}
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
for (const label of ['Elevation', 'Hardware', 'Scale figure', 'Reset view']) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(600);
}
console.log('url carries the configuration and the view:', page.url().includes('view='));
await page.screenshot({ path: `${SHOTS}/shot-controls.png` });

/*
 * Touch orbit, both axes.
 *
 * Added after a false alarm: the canvas carries an inline `touch-action: auto`
 * which LOOKS like the page will steal a drag, and it does not — OrbitControls
 * owns the gesture on the R3F event container. Two things confounded the first
 * measurement: the polar clamp blocks an upward drag from the elevation preset,
 * and Playwright's own screenshot() scrolls the element into view. Hence a
 * control run, a downward drag, and scroll measured before any screenshot.
 */
await page.setViewportSize({ width: 390, height: 460 });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(2500);

async function dragAndCompare(dx, dy) {
  const box = await page.locator('canvas').boundingBox();
  const before = await page.locator('canvas').screenshot();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  if (dx !== 0 || dy !== 0) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    for (let step = 1; step <= 12; step += 1) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: cx + step * dx, y: cy + step * dy }],
      });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await page.waitForTimeout(1200);
  const scrollAfter = await page.evaluate(() => window.scrollY);
  const after = await page.locator('canvas').screenshot();
  return { moved: Buffer.compare(before, after) !== 0, scrolled: scrollAfter - scrollBefore };
}

const control = await dragAndCompare(0, 0);
if (control.moved) problems.push('control: the canvas changed with no input, so the drag results mean nothing');

// Downward, away from the polar clamp that an elevation view sits against.
const vertical = await dragAndCompare(0, 12);
const horizontal = await dragAndCompare(-14, 0);
console.log(`touch orbit: vertical=${vertical.moved} horizontal=${horizontal.moved} pageScroll=${vertical.scrolled + horizontal.scrolled}`);
if (!vertical.moved) problems.push('a vertical touch drag does not orbit the model');
if (!horizontal.moved) problems.push('a horizontal touch drag does not orbit the model');
if (vertical.scrolled !== 0 || horizontal.scrolled !== 0) problems.push('a touch drag on the canvas scrolled the page');

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log('horizontal overflow at 390px:', overflows);
if (overflows) problems.push('the page scrolls sideways at 390px');
await page.screenshot({ path: `${SHOTS}/shot-mobile.png` });

await browser.close();

if (problems.length > 0) {
  console.error(`\nFAILED:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('\nsmoke test passed');
