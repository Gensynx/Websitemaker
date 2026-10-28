import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';

const ORIGIN = 'https://revolearn.co.uk';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const failures = [];
page.on('requestfailed', r => failures.push({ url: r.url(), method: r.method(), type: r.resourceType(), err: r.failure()?.errorText }));
const responses = [];
page.on('response', r => responses.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }));

const resp = await page.goto(ORIGIN + '/', { waitUntil: 'networkidle', timeout: 45000 });
console.log('STATUS', resp.status(), resp.url());
console.log('TITLE', await page.title());

const links = await page.evaluate(() => {
  const out = new Set();
  document.querySelectorAll('a[href]').forEach(a => {
    const u = new URL(a.getAttribute('href'), location.href);
    if (u.origin === location.origin) out.add(u.pathname + u.search);
  });
  return [...out];
});
console.log('LINKS', JSON.stringify(links, null, 1));

const fonts = await page.evaluate(() => ({ status: document.fonts.status, size: document.fonts.size }));
console.log('FONTS', JSON.stringify(fonts));
console.log('FAILURES', JSON.stringify(failures, null, 1));
console.log('NON200', JSON.stringify(responses.filter(r => r.status >= 400), null, 1));
console.log('HOSTS', JSON.stringify([...new Set(responses.map(r => new URL(r.url).host))]));
const sheets = await page.evaluate(() => [...document.styleSheets].map(s => s.href || 'INLINE'));
console.log('SHEETS', JSON.stringify(sheets, null, 1));
console.log('HTMLBYTES', (await page.content()).length);

await browser.close();
