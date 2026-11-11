/* Regression check for Coveworks Lab. Serves the folder itself, drives it in headless
   Chromium and exits 1 if anything is off.

       node coveworks-lab/sitegen/check.mjs

   Needs Playwright (npm i -g playwright, or any install Node can resolve). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { chromium } = createRequire(import.meta.url)('playwright');

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

/* what a visitor types, and the site type it must build */
const BRIEFS = {
  'gamer site': 'gaming', 'a minecraft server': 'gaming',
  'a resturant site': 'restaurant', 'a restraunt': 'restaurant', 'village pub': 'restaurant',
  'my band': 'music', 'dj hire': 'music',
  'a hair salon': 'salon', 'barber shop in Leeds': 'salon', 'tattoo studio': 'salon',
  'maths tutor': 'education', 'driving school': 'education',
  'charity for homeless people': 'charity',
  'a blog about books': 'blog', 'podcast': 'blog', 'youtube channel': 'blog',
  'church website': 'community', 'a nursery for toddlers': 'childcare',
  'boutique hotel in Cornwall': 'travel', 'dog groomer': 'pets',
  'web developer portfolio': 'agency', 'golf club': 'fitness', 'personal training': 'fitness',
  'a technology company': 'saas', 'a launch page for our app, dark': 'saas',
  'wedding photographer': 'photography', 'a beautiful website for a bakery': 'cafe',
  'plumber, bold and blue': 'trades', 'lawn care': 'trades',
  'skincare clinic': 'clinic', 'kids clothing shop': 'boutique',
  'a dark luxury site for my candle brand called Ember': 'boutique',
  /* no known type: built around the visitor's own words */
  'beekeeping supplies': 'custom', 'escape room in Bristol': 'custom', 'funeral director': 'custom'
};

const fails = [];
const fail = (what) => { fails.push(what); console.log('  FAIL', what); };
const browser = await chromium.launch();

async function open(url, viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', e => fail(`${url}: script error: ${e.message}`));
  page.on('response', r => { if (r.status() >= 400) fail(`${url}: ${r.status()} ${r.url()}`); });
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  return page;
}

console.log('Pages');
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const p of ['index.html', 'work.html', 'configurator.html', 'studio.html', 'contact.html']) {
    const page = await open(p, viewport);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
    await page.waitForLoadState('networkidle');
    const r = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth > innerWidth,
      broken: [...document.images].filter(i => i.complete && i.getAttribute('src') && !i.naturalWidth).map(i => i.getAttribute('src'))
    }));
    if (r.over) fail(`${p} at ${viewport.width}px scrolls sideways`);
    if (r.broken.length) fail(`${p} at ${viewport.width}px has broken images: ${r.broken.join(', ')}`);
    await page.close();
  }
}

console.log('Headline');
for (const width of [360, 768, 1280, 1600, 2560]) {
  const page = await open('index.html', { width, height: 900 });
  const split = await page.evaluate(() => [...document.querySelectorAll('#hero h1 .wd')]
    .filter(w => new Set([...w.children].map(c => Math.round(c.getBoundingClientRect().top))).size > 1).map(w => w.textContent));
  if (split.length) fail(`headline breaks inside a word at ${width}px: ${split.join(', ')}`);
  await page.close();
}

console.log('Work list');
{
  const page = await open('work.html');
  const rows = await page.$$eval('#wList .w-row:not(.next)', els => els.map(e => ({
    name: e.querySelector('.nm').textContent, link: e.querySelector('a.btn')?.href || '', img: e.querySelector('img').getAttribute('src') })));
  if (rows.length < 2) fail('work list did not render');
  for (const r of rows) {
    if (!r.link.startsWith('https://www.coveworks.tech/work/')) fail(`work "${r.name}" links to ${r.link || 'nothing'}`);
    if (!fs.existsSync(path.join(ROOT, r.img))) fail(`work "${r.name}" image missing: ${r.img}`);
  }
  await page.close();
}

console.log('Configurator');
{
  const page = await open('configurator.html');
  for (const [brief, want] of Object.entries(BRIEFS)) {
    await page.fill('#fBrief', brief); await page.press('#fBrief', 'Enter'); await page.waitForTimeout(220);
    const got = await page.evaluate(() => document.querySelector('#fType input:checked')?.value);
    const unsure = await page.evaluate(() => document.querySelector('.stage').classList.contains('unsure'));
    if (got !== want || unsure) fail(`brief "${brief}" built ${unsure ? 'nothing' : got}, expected ${want}`);
  }
  await page.fill('#fBrief', 'a website'); await page.press('#fBrief', 'Enter'); await page.waitForTimeout(220);
  if (!await page.evaluate(() => document.querySelector('.stage').classList.contains('unsure'))) fail('a brief with no subject should ask for more');

  const types = await page.$$eval('#fType input', els => els.map(e => e.value));
  for (const t of types) {
    await page.click(`#fType input[value="${t}"]`, { force: true }); await page.waitForTimeout(250);
    await page.evaluate(async () => { const v = document.getElementById('pvView'); for (let y = 0; y < 9000; y += 600) { v.scrollTop = y; await new Promise(r => setTimeout(r, 25)); } });
    await page.waitForLoadState('networkidle');
    const r = await page.evaluate(() => ({ h1: document.querySelector('#pvSite h1')?.innerText || '',
      broken: [...document.querySelectorAll('#pvSite img')].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')) }));
    if (!r.h1) fail(`type ${t} rendered no headline`);
    if (r.broken.length) fail(`type ${t} has broken images: ${r.broken.join(', ')}`);
  }
  await page.close();

  /* a brief handed over from the home page, then its share link reopened */
  const handoff = await open('configurator.html?brief=' + encodeURIComponent('a site for my beekeeping supplies called Hive and Honey'));
  await handoff.waitForTimeout(600);
  const first = await handoff.evaluate(() => [document.querySelector('#pvSite h1').innerText, document.querySelector('#pvSite .x-logo').innerText]);
  if (first[0] !== 'Beekeeping supplies, done properly.' || first[1] !== 'Hive and Honey') fail(`brief handoff built "${first.join('" / "')}"`);
  await handoff.click('#fCopy'); await handoff.waitForTimeout(200);
  const share = await handoff.evaluate(() => location.search);
  await handoff.close();
  const again = await open('configurator.html' + share);
  await again.waitForTimeout(600);
  const second = await again.evaluate(() => [document.querySelector('#pvSite h1').innerText, document.querySelector('#pvSite .x-logo').innerText]);
  if (second.join() !== first.join()) fail(`share link reopened as "${second.join('" / "')}"`);
  const mail = decodeURIComponent(await again.getAttribute('#fSend', 'href'));
  if (!mail.startsWith('mailto:sales@coveworks.tech') || !mail.includes('Something else · beekeeping supplies')) fail('email brief is wrong');
  await again.close();
}

await browser.close();
server.close();
console.log(fails.length ? `\n${fails.length} problem(s)` : '\nAll checks passed');
process.exit(fails.length ? 1 : 0);
