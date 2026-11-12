/* Turns a build from the configurator into the starting files for the real site.

       node coveworks-lab/sitegen/export.mjs "<share link or fit code>" [output folder]

   The share link is the "Open their build" address in a lead email, or what Copy link gives.
   It renders that exact build with the configurator's own code in headless Chromium, then
   writes a plain, self contained folder (default: dist/builds/<name>/):

       index.html            the page the client approved, as real markup
       assets/site.css       only the styles this build uses, made responsive
       assets/img/           the photographs it shows (samples, to be replaced)
       assets/fonts/         the fonts it uses
       BRIEF.md              what the client chose, and what still needs their own content
       build.json            the same, for tools

   Needs Playwright (npm i -g playwright, or any install Node can resolve). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const LAB = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO = path.dirname(LAB);
const { chromium } = createRequire(import.meta.url)('playwright');

const arg = process.argv[2];
if (!arg) { console.error('Give the share link or fit code of the build to export.'); process.exit(2); }
const code = (arg.match(/[?&]fit=([A-Za-z0-9_-]+)/) || [null, arg])[1];
if (!/^[A-Za-z0-9_-]{8,}$/.test(code)) { console.error('That is not a share link or fit code.'); process.exit(2); }

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const file = path.join(LAB, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(LAB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE}preview.html?embed=1&fit=${code}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const got = await page.evaluate((base) => {
  const site = document.getElementById('pvSite');
  const rel = (u) => u.startsWith(base) ? u.slice(base.length) : u;

  /* styles: every rule that touches the preview site, plus the fonts it actually loaded */
  const used = new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '')));
  const rules = [], phone = [], fonts = [], fontFiles = new Set();
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        if (!used.has(rule.style.getPropertyValue('font-family').replace(/["']/g, ''))) continue;
        const css = rule.cssText.replace(/url\("?([^")]+)"?\)/g, (m, u) => {
          const file = rel(new URL(u, sheet.href || base).href);
          fontFiles.add(file);
          return `url("fonts/${file.split('/').pop()}")`;
        });
        fonts.push(css);
      } else if (rule.type === CSSRule.STYLE_RULE && rule.selectorText.includes('.pvs')) {
        if (rule.selectorText.includes('.is-phone')) {
          /* the phone layout was a class in the preview; in a real page it is a media query */
          phone.push(rule.cssText.replace(rule.selectorText, rule.selectorText.replace(/\.is-phone/g, '')));
        } else rules.push(rule.cssText);
      } else if (rule.type === CSSRule.KEYFRAMES_RULE && /^x-|pvs/.test(rule.name)) rules.push(rule.cssText);
    }
  }

  /* markup: the site itself, with our own photographs moved to assets/img and nothing left of the preview scaling */
  const clone = site.cloneNode(true);
  clone.className = site.className.replace(/\s*is-phone/, '');
  clone.removeAttribute('id');
  clone.style.transform = ''; clone.style.left = '';
  const images = [], external = [];
  clone.querySelectorAll('img').forEach(im => {
    const src = im.getAttribute('src');
    im.removeAttribute('onerror'); im.removeAttribute('referrerpolicy');
    if (/^https?:/.test(src)) { external.push(src); return; }
    images.push(src);
    im.setAttribute('src', 'assets/img/' + src.split('/').pop());
    im.setAttribute('loading', 'lazy');
  });
  clone.querySelectorAll('[data-sec]').forEach(el => { el.id = el.getAttribute('data-sec'); el.removeAttribute('data-sec'); });
  const hero = clone.querySelector('.x-hero img');
  if (hero) hero.removeAttribute('loading');

  const text = (sel) => (site.querySelector(sel) || {}).innerText || '';
  return {
    html: clone.outerHTML, rules, phone, fonts, fontFiles: [...fontFiles], images: [...new Set(images)], external,
    name: text('.x-logo'), headline: text('.x-hero h1'), intro: text('.x-hero-copy > p:not(.x-kick)'),
    sections: [...site.querySelectorAll('[data-sec]')].map(s => s.getAttribute('data-sec')),
    look: (site.className.match(/c-(\w+)/) || [])[1], layout: (site.className.match(/l-(\w+)/) || [])[1], type: (site.className.match(/t-(\w+)/) || [])[1],
    accent: site.style.getPropertyValue('--a')
  };
}, BASE);
await browser.close();
server.close();

let state = {};
try { state = JSON.parse(Buffer.from(code.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch (e) {}

const slug = (got.name || 'build').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'build';
const OUT = path.resolve(process.argv[3] || path.join(REPO, 'dist', 'builds', slug));
fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ['assets/img', 'assets/fonts']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
for (const f of got.images) fs.copyFileSync(path.join(LAB, f), path.join(OUT, 'assets/img', path.basename(f)));
for (const f of got.fontFiles) fs.copyFileSync(path.join(LAB, f), path.join(OUT, 'assets/fonts', path.basename(f)));

const css = `/* ${got.name} · starter styles, exported from the Coveworks configurator.
   Look: ${got.look} · layout: ${got.layout} · accent: ${got.accent}. Only what this build uses. */
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0}
img{max-width:100%;display:block}
${got.fonts.join('\n')}
${got.rules.join('\n')}
/* the preview drew the site at a fixed 1280 pixels and scaled it; a real page fills the window */
.pvs{position:relative;left:auto;top:auto;width:100%;transform:none}
@media (max-width:760px){
${got.phone.map(r => '  ' + r).join('\n')}
  .pvs{width:100%}
}
`;
fs.writeFileSync(path.join(OUT, 'assets/site.css'), css);

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(got.name)}</title>
<meta name="description" content="${esc(got.intro)}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
${got.html.replace(/src="assets\/gen\//g, 'src="assets/img/')}
</body>
</html>
`);

const LABELS = { work: 'Work', series: 'Projects', about: 'About', packages: 'Packages', testimonial: 'Reviews', faq: 'Questions', contact: 'Contact', menu: 'Menu',
  strip: 'Photos', hours: 'Hours', treatments: 'Treatments', team: 'Team', steps: 'How it works', listings: 'Listings', stats: 'Numbers', fleet: 'Fleet',
  services: 'Services', areas: 'Areas', products: 'Products', logos: 'Clients', pricing: 'Pricing', bento: 'Features', timetable: 'Timetable', dates: 'Dates', gallery: 'Gallery' };
fs.writeFileSync(path.join(OUT, 'BRIEF.md'), `# ${got.name} · build brief

Exported from the Coveworks configurator. This folder is the page the client built and approved,
as plain files: the starting point for the real site, not the finished one.

## What they chose
- **Business:** ${got.name}
- **Kind of site:** ${got.type}${state.topic ? ` (in their words: ${state.topic})` : ''}
- **Look:** ${got.look} · **opening layout:** ${got.layout} · **accent colour:** ${got.accent}
- **Headline:** ${got.headline}
- **Sections, in their order:** Opening, ${got.sections.map(s => LABELS[s] || s).join(', ')}
${state.site ? `- **Their current site:** ${state.site} (name, colour and opening words were read from it)\n` : ''}- **Reopen their build:** https://www.coveworks.tech/configurator.html?fit=${code}

## What is real and what is a sample
${state.site ? 'The name, headline, opening paragraph and About text came from their current site. Everything else' : 'The business name' + (state.headline ? ' and headline are' : ' is') + ' theirs. Everything else'} is sample copy
written for this kind of business: prices, team names, reviews, opening hours and addresses all need
replacing with the client's own before anything goes live. Reviews are marked as samples on the page.

## Still to collect from the client
- Their own photographs (the ${got.images.length} in \`assets/img/\` are illustrative, generated images)
${got.external.length ? got.external.map(u => `- A proper copy of this image from their current site: ${u}`).join('\n') + '\n' : ''}- Real copy for each section above, contact details, and any booking or payment links
- Logo files, and the domain the site will live on

## Files
- \`index.html\` · the page as real markup, each section with its own id
- \`assets/site.css\` · only the styles this build uses; the phone layout is a media query at 760px
- \`assets/img/\`, \`assets/fonts/\` · what the page loads
- \`build.json\` · the choices above, for tools
`);
fs.writeFileSync(path.join(OUT, 'build.json'), JSON.stringify({ fit: code, state, name: got.name, type: got.type, look: got.look, layout: got.layout, accent: got.accent,
  headline: got.headline, sections: got.sections, images: got.images.map(f => path.basename(f)), external: got.external }, null, 2) + '\n');

const size = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`Exported "${got.name}" (${got.type}, ${got.look}) to ${path.relative(process.cwd(), OUT) || OUT}`);
console.log(`${got.sections.length + 1} sections, ${got.images.length} images, ${got.fontFiles.length} fonts, ${Math.round(size(OUT) / 1024)} KB`);
