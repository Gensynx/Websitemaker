/* Regression check for Coveworks Lab. Serves the folder itself, drives it in headless
   Chromium and exits 1 if anything is off.

       node coveworks-lab/sitegen/check.mjs

   Needs Playwright (npm i -g playwright, or any install Node can resolve). With PHP installed
   it also runs the two endpoints in api/ for real: leads are written to a temporary folder,
   nothing is emailed, and the site reader is pointed at a small fixture site served from here. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { chromium } = createRequire(import.meta.url)('playwright');

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
/* a small business site for the site reader to rebuild */
const FIXTURE = `<!doctype html><html><head><meta charset="utf-8"><title>Home | Kingsley's Barbers – Traditional cuts in Leeds</title>
<meta name="description" content="Traditional barbering in the heart of Leeds. Skin fades, hot towel shaves and beard trims.">
<style>.btn{background:#0B6E4F}a{color:#0b6e4f}</style></head><body><h1>Sharp cuts, no fuss.</h1><h2>Our services</h2>
<p>Kingsley's has been cutting hair on Call Lane since 2009. Good barbers, fair prices and a proper hot towel shave.</p></body></html>`;

const HAS_PHP = spawnSync('php', ['-v']).status === 0;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'cw-check-'));
let php = null, phpPort = 0;
if (HAS_PHP) {
  phpPort = 20000 + Math.floor(Math.random() * 20000);
  php = spawn('php', ['-S', `127.0.0.1:${phpPort}`, '-t', ROOT], { stdio: 'ignore', env: { ...process.env, CW_ALLOW_LOCAL: '1', CW_NO_MAIL: '1', CW_DATA_DIR: DATA } });
  await new Promise(r => setTimeout(r, 900));
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/__fixture/')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(FIXTURE); return; }
  if (req.url.startsWith('/api/')) {                       // the endpoints run in PHP's own server
    if (!php) { res.writeHead(503, { 'content-type': 'application/json' }); res.end('{"ok":false,"error":"PHP is not installed"}'); return; }
    const up = http.request({ host: '127.0.0.1', port: phpPort, path: req.url, method: req.method, headers: req.headers }, r => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    up.on('error', () => { res.writeHead(502); res.end(); });
    req.pipe(up);
    return;
  }
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
  for (const p of ['index.html', 'work.html', 'configurator.html', 'studio.html', 'contact.html', 'websites-for.html', 'websites-for-barbers.html', 'websites-for-online-shops.html', 'privacy.html']) {
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
  await again.close();

  /* the same build, full page, with a way back into the configurator */
  const full = await open('preview.html' + share);
  await full.waitForTimeout(500);
  const shown = await full.evaluate(() => [document.querySelector('#pvSite h1').innerText, document.getElementById('pvBar').getAttribute('href'), document.documentElement.scrollWidth > innerWidth]);
  if (shown[0] !== first[0]) fail(`preview page shows "${shown[0]}"`);
  if (!shown[1].includes('configurator.html?fit=')) fail('preview page does not link back to the configurator');
  if (shown[2]) fail('preview page scrolls sideways');
  await full.close();
}

console.log('Trade pages');
{
  const made = fs.readdirSync(ROOT).filter(f => /^websites-for-.+\.html$/.test(f));
  const listed = JSON.parse(fs.readFileSync(path.join(ROOT, 'sitegen', 'trades.json'), 'utf8')).trades;
  if (made.length !== listed.length) fail(`${listed.length} trades listed but ${made.length} pages built: run build.py`);
  const map = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  for (const t of listed) if (!map.includes(`websites-for-${t.slug}.html`)) fail(`sitemap is missing ${t.slug}`);
  const page = await open('websites-for-dentists.html');
  const frame = page.frameLocator('.live-frame iframe');
  await page.locator('.live-frame').scrollIntoViewIfNeeded();
  const h1 = await frame.locator('#pvSite h1').innerText({ timeout: 8000 }).catch(() => '');
  const name = await frame.locator('#pvSite .x-logo').first().innerText().catch(() => '');
  if (!h1 || name !== 'Mill Street Dental') fail(`dentists sample shows "${name}" / "${h1}"`);
  if (await frame.locator('#pvBar').count()) fail('embedded preview still shows its bar');
  const cta = await page.getAttribute('.live-cta a', 'href');
  if (cta !== 'configurator.html?brief=a%20dental%20practice') fail(`dentists page opens the configurator with ${cta}`);
  await page.close();
}

if (!HAS_PHP) console.log('Endpoints: skipped, PHP is not installed');
else {
  console.log('Rebuild from an existing site');
  const page = await open('configurator.html');
  await page.fill('#fBrief', BASE + '__fixture/'); await page.press('#fBrief', 'Enter');
  await page.waitForFunction(() => /Rebuilt from|could not/i.test(document.getElementById('fBriefRead').innerText), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({
    read: document.getElementById('fBriefRead').innerText, type: document.querySelector('#fType input:checked')?.value,
    h1: document.querySelector('#pvSite h1').innerText, name: document.querySelector('#pvSite .x-logo').innerText,
    sub: document.querySelector('#pvSite .x-hero-copy > p:not(.x-kick)').innerText,
    colour: document.getElementById('pvSite').style.getPropertyValue('--a'), accent: document.querySelector('#fAccent input:checked')?.value }));
  if (r.type !== 'salon') fail(`site rebuild chose ${r.type}, expected salon (${r.read})`);
  if (r.h1 !== 'Sharp cuts, no fuss.' || r.name !== "Kingsley's Barbers") fail(`site rebuild shows "${r.name}" / "${r.h1}"`);
  if (!r.sub.startsWith('Traditional barbering')) fail(`site rebuild did not keep their words: "${r.sub}"`);
  if (r.colour !== '#0B6E4F' || r.accent !== 'own') fail(`site rebuild colour is ${r.colour} (${r.accent})`);
  await page.fill('#fBrief', 'a plumber'); await page.press('#fBrief', 'Enter'); await page.waitForTimeout(300);
  const after = await page.evaluate(() => [document.querySelector('#pvSite h1').innerText, !!document.querySelector('#fAccent input[value=own]')]);
  if (after[0] === 'Sharp cuts, no fuss.' || after[1]) fail('a new brief should clear what was read from the site');

  console.log('Leads');
  /* a lead from two years ago is already on file: the next one in must clear it out */
  fs.writeFileSync(path.join(DATA, 'leads.php'), '<?php http_response_code(404); exit; ?>\n' +
    JSON.stringify({ id: 'CW-OLD000', at: new Date(Date.now() - 730 * 864e5).toISOString(), kind: 'contact', email: 'old@example.com' }) + '\n' +
    JSON.stringify({ id: 'CW-NEW000', at: new Date(Date.now() - 30 * 864e5).toISOString(), kind: 'contact', email: 'recent@example.com' }) + '\n');
  await page.fill('#lName', 'Sam Kingsley'); await page.fill('#lEmail', 'not an email'); await page.click('#fSend');
  await page.waitForTimeout(200);
  if (await page.locator('.lead-done').count()) fail('lead form accepted a bad email');
  await page.fill('#lEmail', 'sam@example.com');
  await page.waitForTimeout(2600);                      // the endpoint ignores forms sent faster than a person could
  await page.click('#fSend');
  await page.waitForSelector('.lead-done', { timeout: 8000 }).catch(() => fail('lead form did not confirm'));
  const saved = fs.existsSync(path.join(DATA, 'leads.php')) ? fs.readFileSync(path.join(DATA, 'leads.php'), 'utf8').trim().split('\n').slice(1).map(l => JSON.parse(l)) : [];
  const lead = saved.find(l => l.email === 'sam@example.com');
  if (!lead) fail('the lead was not saved');
  else {
    if (lead.kind !== 'build' || !lead.summary.includes('Type of site: Trades') || !lead.link.includes('configurator.html?fit=')) fail('the saved lead is missing the build');
    if (!/^CW-[0-9A-F]{6}$/.test(lead.id)) fail('the saved lead has no reference');
  }
  await page.close();

  const contact = await open('contact.html');
  await contact.fill('#cName', 'Ada'); await contact.fill('#cEmail', 'ada@example.com'); await contact.fill('#cMsg', 'A site for my studio, please.');
  await contact.waitForTimeout(2600);
  await contact.click('#cForm button[type=submit]');
  await contact.waitForSelector('.lead-done', { timeout: 8000 }).catch(() => fail('contact form did not confirm'));
  const all = fs.readFileSync(path.join(DATA, 'leads.php'), 'utf8');
  if (!all.includes('"kind":"contact"') || !all.includes('ada@example.com')) fail('the contact message was not saved');
  if (!all.startsWith('<?php http_response_code(404); exit; ?>')) fail('the leads file is not guarded');
  if (all.includes('old@example.com')) fail('a lead older than twelve months was not deleted');
  if (!all.includes('recent@example.com')) fail('a recent lead was deleted');
  await contact.close();
}

await browser.close();
server.close();
if (php) php.kill();
fs.rmSync(DATA, { recursive: true, force: true });
console.log(fails.length ? `\n${fails.length} problem(s)` : '\nAll checks passed');
process.exit(fails.length ? 1 : 0);
