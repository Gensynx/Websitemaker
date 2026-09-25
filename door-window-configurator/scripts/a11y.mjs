/**
 * Keyboard and screen-reader operability (Step 4.4).
 *
 * "Fully operable by keyboard and screen reader without interacting with the
 * 3D canvas" is checked here by DOING it: Tab from the top of a fresh page,
 * with the mouse never used, and record where focus goes; then operate the
 * sections, the product switch and the phone sheet with keys alone. An axe
 * scan runs over each state, and the accessibility tree is written out so a
 * reviewer can read what a screen reader is given.
 *
 * What this cannot do is listen. It proves the semantics are there; it does
 * not prove NVDA or VoiceOver announce them well. That remains a manual test.
 *
 *   npm run dev -- --port 5180    # then:
 *   node scripts/a11y.mjs
 */

import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:5180';
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = process.env.SHOTS ?? '/tmp';
const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const problems = [];

/** What has focus, in the terms a keyboard user meets it. */
async function focused(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const byIds = (ids) =>
      ids
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .join(' ');
    const name =
      el.getAttribute('aria-label') ??
      (el.getAttribute('aria-labelledby') ? byIds(el.getAttribute('aria-labelledby')) : null) ??
      (el.id ? document.querySelector(`label[for="${el.id}"]`)?.innerText : null) ??
      el.closest('label')?.innerText ??
      el.innerText;
    // A radio is visually hidden; its focus ring is drawn on the span after it.
    const ringHost = el.matches('input[type="radio"]') ? el.nextElementSibling : el;
    const style = ringHost ? getComputedStyle(ringHost) : null;
    const ring = style !== null && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    return {
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      name: (name ?? '').replace(/\s+/g, ' ').trim(),
      inCanvas: el.tagName === 'CANVAS' || el.closest('.stage__canvas') !== null,
      ring,
      expanded: el.getAttribute('aria-expanded'),
    };
  });
}

async function axe(page, label) {
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }),
  );
  for (const violation of result.violations) {
    problems.push(
      `axe ${label}: ${violation.id} (${violation.impact}) — ${violation.help} — ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(' | ')}`,
    );
  }
  console.log(`axe ${label}: ${result.violations.length} violations, ${result.incomplete.length} needing review, ${result.passes.length} rules passed`);
  for (const item of result.incomplete) console.log(`   review: ${item.id} — ${item.help} (${item.nodes.length})`);
}

async function tabUntil(page, predicate, limit = 60) {
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press('Tab');
    const now = await focused(page);
    if (now && predicate(now)) return now;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Desktop
 * ------------------------------------------------------------------ */

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });

  // 1. The first stop is the skip link, and it lands in the configuration.
  await page.keyboard.press('Tab');
  const first = await focused(page);
  console.log('first tab stop:', first?.name);
  if (!first || !/skip to the configuration/i.test(first.name)) problems.push(`the first tab stop is not the skip link: ${JSON.stringify(first)}`);
  await page.keyboard.press('Enter');
  const landed = await page.evaluate(() => document.activeElement?.closest('#configure') !== null);
  console.log('skip link lands in the configuration:', landed);
  if (!landed) problems.push('the skip link does not move focus into the configuration');

  // 2. A full keyboard walk from the top: every stop named, ringed, and never the canvas.
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
  const stops = [];
  for (let i = 0; i < 60; i += 1) {
    await page.keyboard.press('Tab');
    const now = await focused(page);
    if (now === null) break;
    if (stops.length > 0 && stops[0].name === now.name && stops[0].tag === now.tag) break; // wrapped round
    stops.push(now);
  }
  console.log(`keyboard walk: ${stops.length} stops`);
  for (const stop of stops) console.log(`   ${stop.tag}${stop.type ? `[${stop.type}]` : ''}  ${stop.name.slice(0, 70)}${stop.ring ? '' : '   <- NO FOCUS RING'}`);
  for (const stop of stops) {
    if (stop.inCanvas) problems.push(`focus entered the canvas: ${stop.name}`);
    if (stop.name === '') problems.push(`an unnamed tab stop: ${stop.tag}`);
    if (!stop.ring) problems.push(`no visible focus indicator on: ${stop.name}`);
  }
  const names = stops.map((stop) => stop.name);
  for (const expected of [/^Style /, /^Size /, /^Colour /, /^Glazing /, /^Hardware (?!close-up)/, /^Width/, /^Height/, /^Door$/, /^Studio$/, /^Elevation view$/, /^Hardware close-up$/, /^Reset view$/]) {
    if (!names.some((name) => expected.test(name))) problems.push(`the keyboard walk never reached ${expected}`);
  }

  // 3. A section opens and closes from the keyboard, and a closed one takes its controls out of the tab order.
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
  const style = await tabUntil(page, (f) => /^Style /.test(f.name));
  await page.keyboard.press('Enter');
  const afterEnter = await focused(page);
  await page.keyboard.press(' ');
  const afterSpace = await focused(page);
  console.log(`style section: start=${style?.expanded} enter=${afterEnter?.expanded} space=${afterSpace?.expanded}`);
  if (style?.expanded !== 'false' || afterEnter?.expanded !== 'true' || afterSpace?.expanded !== 'false') {
    problems.push('the Style section does not open with Enter and close with Space');
  }
  const size = await tabUntil(page, (f) => /^Size /.test(f.name));
  await page.keyboard.press('Enter'); // Size starts open: this closes it
  const next = await tabUntil(page, () => true, 1);
  console.log(`with Size closed, the next stop is: ${next?.name}`);
  if (size?.expanded !== 'true') problems.push('the Size section does not start open');
  if (next && /^(Width|Height)/.test(next.name)) problems.push('a collapsed section left its fields in the tab order');

  // 4. The product switch by arrow keys alone.
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
  await tabUntil(page, (f) => f.name === 'Door' || f.name === 'Window');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  const heading = await page.locator('h1').textContent();
  console.log(`arrow key on the product switch -> ${heading}`);
  if (heading !== 'Window') problems.push(`the product switch did not respond to the arrow keys: ${heading}`);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(800);

  // 4b. Colour by keyboard alone: a swatch by arrow key, explore by slider, and back.
  {
    const param = (key) => new URL(page.url()).searchParams.get(key);
    await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
    const toggle = await tabUntil(page, (f) => /^Colour /.test(f.name));
    if (toggle?.expanded !== 'true') await page.keyboard.press('Enter');
    const swatch = await tabUntil(page, (f) => f.type === 'radio', 5);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    const moved = await focused(page);
    console.log(`colour by keyboard: from "${swatch?.name}" to "${moved?.name}", ce=${param('ce')}`);
    if (!swatch || !moved || swatch.name === moved.name || !/^RAL/.test(param('ce') ?? '')) {
      problems.push('the colour swatches cannot be operated with the arrow keys');
    }
    const explore = await tabUntil(page, (f) => /^Explore any colour/.test(f.name), 15);
    await page.keyboard.press('Enter');
    const hue = await tabUntil(page, (f) => f.name === 'Hue', 5);
    for (let i = 0; i < 20; i += 1) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    const valuetext = await page.evaluate(() => document.activeElement?.getAttribute('aria-valuetext'));
    console.log(`explore by keyboard: toggle=${Boolean(explore)} hue=${Boolean(hue)} valuetext="${valuetext}" ce=${param('ce')}`);
    if (!explore || !hue || !/^x[0-9a-f]{6}$/.test(param('ce') ?? '')) problems.push('explore mode cannot be operated from the keyboard');
    if (!valuetext || !/degrees, [a-z]+/.test(valuetext)) problems.push('the hue slider does not say its value in words');
    await axe(page, 'desktop, explore open');
    const back = await tabUntil(page, (f) => /^Use /.test(f.name), 10);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    console.log(`back to an offered colour by keyboard: ${back?.name} -> ce=${param('ce')}`);
    if (!back || !/^RAL/.test(param('ce') ?? '')) problems.push('the way back from explore is not reachable by keyboard');
  }

  // 4c. Door options by keyboard alone: a style tile by arrow key, a toggle by Space.
  {
    const param = (key) => new URL(page.url()).searchParams.get(key);
    await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
    const styleToggle = await tabUntil(page, (f) => /^Style /.test(f.name));
    await page.keyboard.press('Enter');
    const tile = await tabUntil(page, (f) => f.type === 'radio', 3);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    console.log(`door style by keyboard: toggle=${Boolean(styleToggle)} from "${tile?.name}" -> s=${param('s')}`);
    if (!tile || param('s') === 'sp') problems.push('the door style tiles cannot be operated with the arrow keys');
    const topLight = await tabUntil(page, (f) => f.type === 'checkbox' && /^Top light/.test(f.name), 30);
    await page.keyboard.press(' ');
    // The link is written on a short debounce; under software rendering the
    // main thread can be busy for a while, so wait for it rather than sample.
    await page.waitForFunction(() => /^\d/.test(new URL(location.href).searchParams.get('tl') ?? ''), null, { timeout: 5000 }).catch(() => {});
    console.log(`top light by keyboard: reached=${Boolean(topLight)} tl=${param('tl')}`);
    if (!topLight || !/^\d/.test(param('tl') ?? '')) problems.push('the top light cannot be switched on from the keyboard');
  }

  // 4d. Window lights by keyboard: arrow between lights, each named by position and opening.
  {
    const param = (key) => new URL(page.url()).searchParams.get(key);
    await page.goto(`${BASE}/?view=el&v=3&m=u&p=w&w=2400&h=1400&ce=RAL9016&ci=m&fe=sm&fi=m&g=c.2&sg=n&tv=hf.1&s=cs&gd=1-2-1*1*shl.n-f.n-shr.n&hw=lr&hf=sc`, { waitUntil: 'networkidle' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
    await tabUntil(page, (f) => /^Style /.test(f.name));
    await page.keyboard.press('Enter');
    const first = await tabUntil(page, (f) => /^Light 1 of 3/.test(f.name), 40);
    await page.keyboard.press('ArrowRight');
    const second = await focused(page);
    console.log(`lights by keyboard: "${first?.name}" -> "${second?.name}"`);
    if (!first || !second || !/^Light 2 of 3, centre: fixed/.test(second.name)) problems.push('the window lights cannot be chosen and heard by keyboard');
    const opens = await tabUntil(page, (f) => f.type === 'radio' && /^Fixed/.test(f.name), 5);
    await page.keyboard.press('ArrowRight');
    const expected = /^1-2-1\*1\*shl\.n\.i-shl\.n\.i-shr\.n\.i$/;
    await page.waitForFunction((source) => new RegExp(source).test(new URL(location.href).searchParams.get('gd') ?? ''), expected.source, { timeout: 5000 }).catch(() => {});
    console.log(`opening by keyboard: reached=${Boolean(opens)} gd=${param('gd')}`);
    if (!opens || !expected.test(param('gd') ?? '')) problems.push("a light's opening cannot be set from the keyboard");
    for (const id of ['colour', 'glazing', 'hardware']) {
      const toggle = page.locator(`#section-${id}-toggle`);
      if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
    }
    await page.waitForTimeout(500);
    await axe(page, 'desktop, window, all sections open');
  }

  // 5. The preview has a text alternative, in plain words.
  const alt = await page.locator('.stage__picture').getAttribute('aria-label');
  console.log(`preview text alternative: ${alt}`);
  if (!alt || !/mm wide by .* mm high/.test(alt)) problems.push('the preview has no usable text alternative');

  // 6. axe, with every section open and then with the defaults.
  await axe(page, 'desktop, defaults');
  for (const title of ['Style', 'Colour', 'Glazing', 'Hardware']) {
    await page.locator(`#section-${title.toLowerCase()}-toggle`).click();
  }
  await page.waitForTimeout(500);
  await axe(page, 'desktop, all sections open');

  writeFileSync(`${OUT}/a11y-tree-desktop.yml`, await page.locator('body').ariaSnapshot());
  await context.close();
}

/* ------------------------------------------------------------------ *
 * Phone: the bottom sheet
 * ------------------------------------------------------------------ */

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE}/?view=el`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage__canvas[data-ready="true"]', { timeout: 40000 });
  const toggle = page.locator('.panel__toggle');

  await axe(page, 'phone, sheet closed');

  // Keyboard: open with Enter, reach a section, close with Escape, focus back on the handle.
  const handle = await tabUntil(page, (f) => /^Configure/.test(f.name));
  await page.keyboard.press('Enter');
  const opened = await toggle.getAttribute('aria-expanded');
  const inside = await tabUntil(page, (f) => /^Style /.test(f.name), 10);
  await page.keyboard.press('Escape');
  const closed = await toggle.getAttribute('aria-expanded');
  const back = await focused(page);
  console.log(`sheet by keyboard: handle=${Boolean(handle)} opened=${opened} reachedStyle=${Boolean(inside)} escape=${closed} focusBack=${back?.name.startsWith('Configure')}`);
  if (!handle || opened !== 'true' || !inside || closed !== 'false' || !back?.name.startsWith('Configure')) {
    problems.push('the sheet is not fully operable from the keyboard (open, reach, Escape, focus return)');
  }

  // Pointer: each drag moves one resting state — closed, half, full — and a drag is not also a tap.
  const panel = page.locator('.panel');
  const drag = async (dy) => {
    const box = await toggle.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + 20;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + dy, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(450);
    return panel.getAttribute('data-sheet');
  };
  const states = [await drag(-120), await drag(-120), await drag(160), await drag(160)];
  console.log(`sheet by drag: ${states.join(' -> ')}`);
  if (states.join(',') !== 'half,full,half,closed') problems.push(`dragging the sheet handle did not step through its states: ${states.join(',')}`);

  await toggle.click();
  await page.waitForTimeout(600);
  await axe(page, 'phone, sheet open');
  writeFileSync(`${OUT}/a11y-tree-phone.yml`, await page.locator('body').ariaSnapshot());
  await context.close();
}

await browser.close();

if (problems.length > 0) {
  console.error(`\nFAILED:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('\naccessibility checks passed');
