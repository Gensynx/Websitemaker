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
      '?view=el&v=3&m=u&p=w&w=2400&h=1400&ce=RAL7016&ci=m&fe=sm&fi=m&g=c.3&sg=n&tv=hf.2&s=cs&gd=1-2-1*1-1*shl.aa_2_2_22.i-f.aa_3_2_22.i-shr.aa_2_2_22.i-f.aa_2_2_22.i-f.aa_3_2_22.i-f.aa_2_2_22.i&hw=lr&hf=bk',
  },
  {
    name: 'window-sash',
    query:
      '?view=el&v=3&m=u&p=w&w=900&h=1600&ce=RAL9010&ci=m&fe=sm&fi=m&g=c.2&sg=n&tv=n&s=sa&op=dh&mr=0.55&ho=1&ub=aa_3_2_22&lb=aa_3_2_22&hw=lr&hf=sc',
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

/**
 * The link is written on a short debounce, and under software rendering the
 * main thread can be busy for a second or more after an edit. Link checks
 * therefore wait for the expected value (up to 5 s) instead of sampling once.
 */
async function paramEventually(key, pattern, timeout = 5000) {
  await page
    .waitForFunction(
      ([k, source]) => new RegExp(source).test(new URL(location.href).searchParams.get(k) ?? ''),
      [key, pattern.source],
      { timeout },
    )
    .catch(() => {});
  return new URL(page.url()).searchParams.get(key);
}

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

/* ------------------------------------------------------------------ *
 * Step 5 — colour
 * ------------------------------------------------------------------ */

{
  const param = (key) => new URL(page.url()).searchParams.get(key);
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  const colourToggle = page.locator('#section-colour-toggle');
  if ((await colourToggle.getAttribute('aria-expanded')) !== 'true') await colourToggle.click();

  // 5.1 An offered swatch goes into the configuration and the link.
  await page.getByRole('radio', { name: /^Wine Red/ }).first().check();
  await paramEventually('ce', /^RAL3005$/);
  console.log(`colour: swatch -> ce=${param('ce')}`);
  if (param('ce') !== 'RAL3005') problems.push(`choosing a swatch did not set the colour: ${param('ce')}`);

  // Only offered shades are on offer: Purple Red is RAL but not sold in uPVC.
  if ((await page.getByRole('radio', { name: /^Purple Red/ }).count()) !== 0) problems.push('a colour not offered in the material is in the grid');

  // 5.3 Finish is separate from colour.
  await page.getByRole('radio', { name: 'Woodgrain foil' }).first().check();
  await paramEventually('fe', /^wg$/);
  console.log(`colour: finish -> fe=${param('fe')} ce still ${param('ce')}`);
  if (param('ce') !== 'RAL3005' || param('fe') === 'sm') problems.push('changing the finish did not behave as a separate choice');

  // Inside, separately.
  await page.getByRole('radio', { name: 'Different' }).check();
  await page.getByRole('radio', { name: /^Traffic White/ }).nth(1).check();
  await paramEventually('ci', /^RAL9016$/);
  console.log(`colour: inside -> ci=${param('ci')}`);
  if (param('ci') !== 'RAL9016') problems.push(`the inside colour did not apply: ${param('ci')}`);
  await page.getByRole('radio', { name: 'Same as outside' }).check();
  await page.waitForTimeout(500);

  // 5.2 Explore: shown, flagged, never orderable, and a way back.
  await page.getByRole('button', { name: /^Explore any colour/ }).click();
  await page.getByLabel('Hex value').fill('#8A2BE2');
  await paramEventually('ce', /^x8a2be2$/);
  const flagged = await page.locator('.section[data-open] .section__flag').allTextContents();
  const warned = await page.locator('.messages').allTextContents();
  console.log(`colour: explore -> ce=${param('ce')} flag=${JSON.stringify(flagged)}`);
  if (param('ce') !== 'x8a2be2') problems.push(`an explore colour did not apply: ${param('ce')}`);
  if (!flagged.includes('Not orderable')) problems.push('an explore colour is not flagged as not orderable');
  if (!warned.some((text) => /cannot be ordered/.test(text))) problems.push('no statement that the explore colour cannot be ordered');
  await page.getByRole('button', { name: /^Use / }).click();
  await paramEventually('ce', /^RAL\d{4}$/);
  console.log(`colour: nearest offered -> ce=${param('ce')}`);
  if (!/^RAL\d{4}$/.test(param('ce') ?? '')) problems.push(`"use the closest offered colour" did not return to an offered shade: ${param('ce')}`);
  await page.screenshot({ path: `${SHOTS}/shot-colour.png` });
}

/* ------------------------------------------------------------------ *
 * Step 6 — door options
 * ------------------------------------------------------------------ */

{
  const param = (key) => new URL(page.url()).searchParams.get(key);
  const expect = async (label, key, pattern) => {
    const value = await paramEventually(key, pattern);
    console.log(`door: ${label} -> ${key}=${value}`);
    if (!pattern.test(value ?? '')) problems.push(`door option "${label}" did not reach the link: ${key}=${value}`);
  };
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.getByRole('radio', { name: 'Door', exact: true }).check();
  await page.waitForTimeout(800);
  for (const id of ['style', 'surround', 'hardware']) {
    const toggle = page.locator(`#section-${id}-toggle`);
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  }
  const settle = () => page.waitForTimeout(700);

  await page.getByRole('radio', { name: /^Half glazed/ }).check();
  await settle();
  await expect('half glazed', 's', /^hg$/);
  await page.getByRole('radio', { name: /^Grooved/ }).check();
  await settle();
  await expect('grooved panels', 'pd', /^g\./);

  // Side lights on a single door: the frame is not resized behind the customer's back...
  const widthBefore = param('w');
  await page.getByRole('group', { name: /^Side lights/ }).getByRole('radio', { name: 'Both', exact: true }).check();
  await page.waitForSelector('.keep--problem', { timeout: 5000 }).catch(() => {});
  const alert = await page.locator('.keep--problem').allTextContents();
  console.log(`door: both side lights on ${widthBefore} mm -> w=${param('w')}, problem=${alert.length > 0}`);
  if (param('w') !== widthBefore) problems.push('adding side lights changed the overall width by itself');
  if (alert.length === 0) problems.push('no reason given when side lights leave no room for the door');
  // ...and the explicit fix restores a buildable door.
  await page.getByRole('button', { name: /^Widen the frame/ }).click();
  await settle();
  await expect('widen to keep the door', 'w', /^1[5-9]\d\d$/);
  if ((await page.locator('.keep--problem').count()) !== 0) problems.push('the door is still unbuildable after widening the frame');

  await page.getByRole('group', { name: /^Top light/ }).getByRole('radio', { name: 'Top light', exact: true }).check();
  await settle();
  await expect('top light', 'tl', /^\d/);
  // "Right" is both a side light and a hinge side: scoped to its own group.
  await page.getByRole('group', { name: 'Hinged on the' }).getByRole('radio', { name: 'Right' }).check();
  await settle();
  await expect('hinged on the right', 'hg', /^r$/);

  await page.getByRole('radio', { name: 'Pull bar' }).check();
  await page.getByRole('radio', { name: 'Black' }).check();
  await page.getByRole('checkbox', { name: /^Knocker/ }).check();
  await settle();
  await expect('pull bar', 'hw', /^pb$|^pull/);
  await expect('black', 'hf', /^bk$/);
  await expect('knocker', 'kn', /^rg$/);

  // A fully glazed leaf takes no furniture, and says why.
  await page.getByRole('radio', { name: /^Fully glazed/ }).check();
  await settle();
  const disabled = await page.getByRole('checkbox', { name: /^Letterplate/ }).isDisabled();
  console.log(`door: fully glazed disables furniture=${disabled}`);
  if (!disabled) problems.push('furniture can still be switched on for a fully glazed door');
  await page.screenshot({ path: `${SHOTS}/shot-door-options.png` });
}

/* ------------------------------------------------------------------ *
 * Step 7 — window options and glazing
 * ------------------------------------------------------------------ */

{
  const expect = async (label, key, pattern) => {
    const value = await paramEventually(key, pattern);
    console.log(`window: ${label} -> ${key}=${value}`);
    if (!pattern.test(value ?? '')) problems.push(`window option "${label}" did not reach the link: ${key}=${value}`);
  };
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.getByRole('radio', { name: 'Window', exact: true }).check();
  await paramEventually('p', /^w$/);
  // A new window is the three-pane preset with top-hung vents over fixed lights.
  await expect('the default window', 'gd', /^1-2-1\*1-3\*th\.n\.i-th\.n\.i-th\.n\.i-f\.n\.i-f\.n\.i-f\.n\.i$/);
  await expect('the default size', 'w', /^1800$/);
  // The steps below re-divide a window, so they start from two fixed lights,
  // stated here rather than assumed to be the default.
  {
    const url = new URL(page.url());
    url.searchParams.set('gd', '1-1*1*f.n.i-f.n.i');
    url.searchParams.set('w', '1200');
    url.searchParams.set('h', '1050');
    await page.goto(url.toString(), { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas');
  }
  for (const id of ['style', 'glazing', 'hardware']) {
    const toggle = page.locator(`#section-${id}-toggle`);
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  }
  const widthBefore = new URL(page.url()).searchParams.get('w');

  // 7.1 and 7.2: style and divisions, never the size.
  await page.getByRole('radio', { name: /^Casement/ }).check();
  await page.getByRole('group', { name: 'Lights across' }).getByRole('radio', { name: '3' }).check();
  await expect('three lights across', 'gd', /^1-1-1\*/);
  // 7.3: the third light opens, hinged on the right.
  await page.getByRole('radio', { name: /^Light 3 of 3/ }).check();
  await page.getByRole('radio', { name: 'Side-hung, hinged right' }).check();
  await expect('light 3 hinged right', 'gd', /-shr\./);
  // 7.2: astragal bars, then the same in every light.
  await page.getByRole('group', { name: 'Light 3 glazing bars' }).getByRole('radio', { name: 'Astragal' }).check();
  await page.getByRole('button', { name: 'Use these bars in every light' }).click();
  // Exact: every light barred, and nothing else changed — the weights, the
  // one row, and light 3 still hinged right. (Loosened once, before it had
  // ever run, to a pattern that checked none of those; see TEST-AUDIT.md.)
  await expect('astragal bars everywhere', 'gd', /^1-1-1\*1\*f\.aa_2_2_22\.i-f\.aa_2_2_22\.i-shr\.aa_2_2_22\.i$/);
  await page.getByRole('radio', { name: /^Tilt and turn/ }).check();
  await expect('tilt and turn', 's', /^tt$/);
  await page.getByRole('radio', { name: /^Sliding sash/ }).check();
  await expect('sliding sash', 's', /^sa$/);
  if (new URL(page.url()).searchParams.get('w') !== widthBefore) problems.push('choosing a window style changed the overall width');

  // 7.4: handle, finish, vents.
  await page.getByRole('radio', { name: 'Knob' }).check();
  await page.getByRole('radio', { name: 'Brass' }).check();
  await expect('knob', 'hw', /^kb$/);
  await expect('brass', 'hf', /^br$/);
  await page.getByLabel('Vents fitted').fill('3');
  await expect('three vents', 'tv', /^hf\.3$/);

  // 7.5: unit, obscure pattern, laminated.
  await page.getByRole('radio', { name: 'Triple glazed' }).check();
  await page.getByRole('radio', { name: 'Obscure' }).check();
  await page.getByRole('radio', { name: /^Reeded/ }).check();
  await expect('triple, reeded', 'g', /^o\.3\.rd$/);
  await page.getByRole('radio', { name: 'Laminated' }).check();
  await expect('laminated', 'sg', /^l$/);
  await page.screenshot({ path: `${SHOTS}/shot-window-options.png` });

  // A door with glass low down: standard glass cannot be chosen, and the panel says why.
  await page.goto(`${BASE}/?view=el&v=3&m=u&p=d&w=926&h=2040&ce=RAL7016&ci=m&fe=sm&fi=m&g=c.2&sg=t&tv=n&s=fg&sl=n&sr=n&tl=n&hw=lr&hf=sc&lp=0&sh=0&kn=n&tr=st&hg=l&od=i`, { waitUntil: 'networkidle' });
  const glazing = page.locator('#section-glazing-toggle');
  if ((await glazing.getAttribute('aria-expanded')) !== 'true') await glazing.click();
  // "Standard" is also a threshold: scoped to the Glazing section.
  const standardDisabled = await page
    .getByRole('region', { name: 'Glazing' })
    .getByRole('radio', { name: 'Standard', exact: true })
    .isDisabled();
  const reason = await page.locator('#section-glazing-panel .keep').allTextContents();
  console.log(`glazing: critical location -> standard disabled=${standardDisabled}, reason=${reason.length > 0}`);
  if (!standardDisabled || reason.length === 0) problems.push('standard glass can be chosen at a critical location, or no reason is given');
}

/* ------------------------------------------------------------------ *
 * Step 8 — summary, share link, enquiry
 * ------------------------------------------------------------------ */

{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const tab = await context.newPage();
  tab.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  const setBase = `${BASE}/?view=el&v=3&m=u&p=d&w=1800&h=2200&ce=RAL7016&ci=m&fe=sm&fi=m&g=c.2&sg=t&tv=n&s=hg&pd=r.2.ov&gf=0.5&ap=r.120.i&ab=aa_2_3_22&sl=400.aa_1_4_22.i&sr=400.aa_1_4_22.i&tl=350.r.n.i&hw=lb&hf=br&lp=1&sh=1&kn=rg&tr=lo&hg=l&od=i`;
  await tab.goto(setBase, { waitUntil: 'networkidle' });
  await tab.waitForSelector('canvas');

  // 8.2 The copied link reopens exactly this configuration.
  await tab.getByRole('button', { name: 'Copy link', exact: true }).click();
  await tab.waitForTimeout(400);
  const copied = await tab.evaluate(() => navigator.clipboard.readText());
  const status = await tab.locator('.panel__actions-status').textContent();
  const configKeys = (url) => {
    const params = new URL(url).searchParams;
    params.delete('view');
    return [...params].sort().map((p) => p.join('=')).join('&');
  };
  const same = configKeys(copied) === configKeys(tab.url());
  console.log(`share: copied=${copied.length} chars, status="${status}", same configuration=${same}`);
  if (!same) problems.push('the copied link does not encode the configuration on screen');
  const opened = await context.newPage();
  await opened.goto(copied, { waitUntil: 'networkidle' });
  await opened.waitForSelector('.panel');
  const openedTitle = await opened.locator('.lede').textContent();
  console.log(`share: the link opens "${openedTitle}"`);
  if (!/1800 × 2200/.test(openedTitle ?? '')) problems.push('opening the shared link did not restore the configuration');
  await opened.close();

  // 8.1 The summary: open, focused, every group.
  const reviewButton = tab.getByRole('button', { name: 'Review and enquire' });
  await reviewButton.click();
  await tab.waitForSelector('dialog.review[open]');
  const focusedTitle = await tab.evaluate(() => document.activeElement?.textContent);
  const groups = await tab.locator('.review__group-title').allTextContents();
  const linkInDialog = await tab.locator('.review__share input').inputValue();
  console.log(`summary: focus on "${focusedTitle}", groups=${JSON.stringify(groups)}`);
  if (groups.length !== 6 || !groups.includes('Surround')) problems.push(`the summary does not list every section: ${groups.join(', ')}`);
  if (configKeys(linkInDialog) !== configKeys(tab.url())) problems.push('the summary link differs from the configuration');
  const lightsListed = await tab.locator('.review__summary').textContent();
  if (!/Left side light/.test(lightsListed ?? '') || !/Hinge side and opening direction are stated/.test(lightsListed ?? '')) {
    problems.push('the summary is missing options or the handing statement');
  }

  // 8.3 An empty form: an error summary, focused, one entry per problem.
  await tab.getByRole('button', { name: 'Send enquiry' }).click();
  await tab.waitForSelector('.error-summary');
  await tab.waitForTimeout(200);
  const summaryFocused = await tab.evaluate(() => document.activeElement?.classList.contains('error-summary'));
  const entries = await tab.locator('.error-summary li').count();
  console.log(`enquiry: empty submit -> error summary focused=${summaryFocused}, entries=${entries}`);
  if (!summaryFocused || entries !== 3) problems.push('an empty enquiry does not produce a focused error summary of name, email and consent');

  // A complete form: sent nowhere, and it says so.
  await tab.getByLabel('Name', { exact: true }).fill('Ada Lovelace');
  await tab.getByLabel('Email address').fill('ada@example.com');
  await tab.getByLabel(/You may contact me/).check();
  await tab.getByRole('button', { name: 'Send enquiry' }).click();
  await tab.waitForSelector('.review__result .review__status');
  const outcome = await tab.locator('.review__result').textContent();
  console.log(`enquiry: valid submit -> "${outcome?.slice(0, 80)}…"`);
  if (!/has not been sent/.test(outcome ?? '')) problems.push('the stubbed enquiry does not say that nothing was sent');
  await tab.screenshot({ path: `${SHOTS}/shot-review.png` });

  // Escape closes it and returns focus to the button that opened it.
  await tab.keyboard.press('Escape');
  await tab.waitForTimeout(300);
  const closed = (await tab.locator('dialog.review[open]').count()) === 0;
  const back = await tab.evaluate(() => document.activeElement?.textContent);
  console.log(`review: Escape closes=${closed}, focus back on "${back}"`);
  if (!closed || back !== 'Review and enquire') problems.push('closing the review does not return focus to its trigger');

  // Not orderable: an explore colour can still be enquired about, and says so.
  await tab.goto(setBase.replace('ce=RAL7016', 'ce=x8a2be2'), { waitUntil: 'networkidle' });
  await tab.getByRole('button', { name: 'Review and enquire' }).click();
  const note = await tab.locator('.review__summary .review__status').first().textContent();
  const formThere = (await tab.getByRole('button', { name: 'Send enquiry' }).count()) === 1;
  console.log(`review: explore colour -> "${note?.slice(0, 40)}…", form=${formThere}`);
  if (!/Not orderable/.test(note ?? '') || !formThere) problems.push('an explore colour is not reviewed as enquire-only');
  await tab.keyboard.press('Escape');

  // Cannot be made: no form, the reasons instead.
  await tab.goto(setBase.replace('w=1800', 'w=900'), { waitUntil: 'networkidle' });
  await tab.getByRole('button', { name: 'Review and enquire' }).click();
  const blocked = await tab.locator('.review__summary .review__status').first().textContent();
  const noForm = (await tab.getByRole('button', { name: 'Send enquiry' }).count()) === 0;
  const noPicture = (await tab.locator('.review__picture').count()) === 0;
  console.log(`review: unbuildable -> "${blocked?.slice(0, 40)}…", form hidden=${noForm}, drawing hidden=${noPicture}`);
  if (!/cannot be made/.test(blocked ?? '') || !noForm) problems.push('an unbuildable configuration can still be enquired about');
  if (!noPicture) problems.push('an unbuildable configuration is drawn in the review');
  await context.close();
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
