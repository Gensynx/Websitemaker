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

/*
 * The canvas is full-bleed and the panel, title and view bar float over it, so
 * a screenshot of the canvas's box includes them. Compared as-is, an error
 * message appearing in the panel reads as "the model redrew". They are masked
 * out of every canvas comparison; the dimension labels are not, because they
 * belong to the picture.
 */
const CHROME = ['.panel', '.title', '.viewbar'].map((selector) => page.locator(selector));
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
for (const label of ['Elevation view', 'Hardware close-up', 'Scale figure', 'Reset view']) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(600);
}
console.log('url carries the configuration and the view:', page.url().includes('view='));
await page.screenshot({ path: `${SHOTS}/shot-controls.png` });

/*
 * The title stays legible whatever the canvas puts behind it. The hardware
 * close-up fills the screen with the door, which is exactly the case that
 * failed: black heading on an anthracite leaf, with no backing.
 */
{
  await page.getByRole('button', { name: 'Hardware close-up' }).click();
  await page.waitForTimeout(1200);
  const backing = await page.locator('.title').evaluate((el) => getComputedStyle(el).backgroundColor);
  const alpha = /rgba?\(([^)]+)\)/.exec(backing)?.[1].split(',')[3];
  const opaqueEnough = alpha === undefined || Number(alpha) >= 0.85;
  console.log(`title backing over the close-up: ${backing}`);
  if (!opaqueEnough) problems.push(`the title has no backing over the canvas: ${backing}`);
  await page.getByRole('button', { name: 'Elevation view' }).click();
  await page.waitForTimeout(600);
}

/*
 * The wall setting. View-only: it changes the picture, never the order, so
 * the configuration in the URL must not move when it is switched.
 */
for (const product of ['Door', 'Window']) {
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.getByRole('radio', { name: product, exact: true }).check();
  await page.waitForTimeout(1200);
  const configBefore = new URL(page.url()).search;
  const before = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
  await page.getByRole('radio', { name: 'In a wall', exact: true }).check();
  await page.waitForTimeout(2000);
  const inWall = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
  await page.getByRole('radio', { name: 'Render', exact: true }).check();
  await page.waitForTimeout(2000);
  const rendered = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
  const configAfter = new URL(page.url()).search;
  await page.screenshot({ path: `${SHOTS}/shot-wall-${product.toLowerCase()}.png` });
  const changed = Buffer.compare(before, inWall) !== 0;
  const finishChanged = Buffer.compare(inWall, rendered) !== 0;
  console.log(`wall/${product.toLowerCase()}: redrew=${changed} finishRedrew=${finishChanged} configUnchanged=${configBefore === configAfter}`);
  if (!changed) problems.push(`${product}: switching to a wall did not change the picture`);
  if (!finishChanged) problems.push(`${product}: switching wall finish did not change the picture`);
  if (configBefore !== configAfter) problems.push(`${product}: the wall setting changed the configuration: ${configBefore} -> ${configAfter}`);
  await page.getByRole('radio', { name: 'Studio', exact: true }).check();
  await page.waitForTimeout(600);
}

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
  const before = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
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
  const after = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
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

/* ------------------------------------------------------------------ *
 * Step 3 — sizing
 * ------------------------------------------------------------------ */

await page.setViewportSize({ width: 1280, height: 1100 });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(2500);

// The product persists in localStorage, so whatever an earlier section left
// selected would carry into this one. Sizing is exercised on a door.
await page.getByRole('radio', { name: 'Door', exact: true }).check();
await page.waitForTimeout(1500);

const widthField = page.getByLabel(/^Width/);
const heightField = page.getByLabel(/^Height/);

// A valid resize redraws. 1000 mm leaves an 860 mm leaf, inside the leaf
// range — 1200 would not, and a fixture that quietly breaks a derived rule
// reads as a failing renderer.
{
  const before = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
  await widthField.fill('1000');
  await page.waitForTimeout(1500);
  const redrew = Buffer.compare(before, await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' })) !== 0;
  const errors = await page.locator('.field__error').count();
  console.log(`sizing: valid resize redrew=${redrew} errors=${errors}`);
  if (!redrew) problems.push('a valid resize did not redraw the model');
  if (errors !== 0) problems.push('a valid size reported an error');
}

// An unmanufacturable size states the range inline and never reaches the model.
{
  const before = await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' });
  await widthField.fill('9000');
  await page.waitForTimeout(1500);
  const reason = (await page.locator('.field__error').allTextContents()).join(' ');
  const held = Buffer.compare(before, await page.locator('canvas').screenshot({ mask: CHROME, maskColor: '#000' })) === 0;
  console.log(`sizing: oversize held=${held} statesRange=${/between .* and .*/.test(reason)}`);
  if (!held) problems.push('an unmanufacturable size was rendered');
  if (!/between .* and .*/.test(reason) || !reason.includes('mm')) {
    problems.push(`the inline reason does not state the permitted range: ${JSON.stringify(reason)}`);
  }
  if ((await widthField.getAttribute('aria-invalid')) !== 'true') {
    problems.push('an invalid field is not marked aria-invalid');
  }
}

// Reasons belong to the field the customer can act on, not to a banner.
{
  await widthField.fill('900');
  await heightField.fill('500');
  await page.waitForTimeout(1200);
  const perField = await page.locator('.field').evaluateAll((fields) =>
    fields.map((field) => ({
      label: field.querySelector('label')?.textContent?.trim().split(' ')[0],
      count: field.querySelectorAll('.field__error').length,
    })),
  );
  console.log('sizing: errors per field', JSON.stringify(perField));
  const height = perField.find((f) => f.label === 'Height');
  const width = perField.find((f) => f.label === 'Width');
  if (height?.count !== 1 || width?.count !== 0) {
    problems.push('an inline reason landed against the wrong field');
  }
}

// Recovery, then a preset.
{
  await heightField.fill('1981');
  await page.waitForTimeout(1000);
  if ((await page.locator('.field__error').count()) !== 0) problems.push('a valid size still reports an error');

  await page.getByRole('button', { name: /Metric/ }).click();
  await page.waitForTimeout(900);
  const applied = `${await widthField.inputValue()}x${await heightField.inputValue()}`;
  const pressed = await page.getByRole('button', { name: /Metric/ }).getAttribute('aria-pressed');
  console.log(`sizing: preset applied=${applied} pressed=${pressed}`);
  if (applied !== '926x2040') problems.push(`a size preset did not apply: ${applied}`);
  if (pressed !== 'true') problems.push('the applied preset is not marked as pressed');
}

// Limits follow the product type.
{
  await page.getByRole('radio', { name: 'Window', exact: true }).check();
  await page.waitForTimeout(1000);
  const hints = (await page.locator('.field__hint').allTextContents()).join(' / ');
  console.log('sizing: window range', hints);
  if (!hints.includes('300 mm')) problems.push(`window limits did not replace door limits: ${hints}`);
  await page.getByRole('radio', { name: 'Door', exact: true }).check();
  await page.waitForTimeout(800);
}

// Operable by keyboard alone, without touching the canvas (Step 4.4 ahead of time).
{
  // Relative, not absolute: switching product type resets to that product's
  // defaults by design, so whatever the preset was is gone by now.
  await widthField.focus();
  const start = Number(await widthField.inputValue());
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(500);
  const stepped = Number(await widthField.inputValue());
  console.log(`sizing: keyboard step ${start} -> ${stepped}`);
  if (stepped !== start + 1) problems.push(`the width field did not step by 1 mm from the keyboard: ${start} -> ${stepped}`);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(1500);
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
