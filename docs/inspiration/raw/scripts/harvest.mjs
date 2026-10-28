import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const ORIGIN = 'https://revolearn.co.uk';
const PAGES = ['/', '/pricing', '/how-it-works', '/about', '/reviews', '/faq', '/gcse-maths-tuition', '/contact'];
const WIDTHS = [390, 768, 1024, 1440];
const slug = p => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-'));

const PROPS = ['font-family','font-size','font-weight','line-height','letter-spacing','text-transform',
  'color','background-color','background-image','margin-top','margin-bottom','padding',
  'border-radius','border','box-shadow','max-width','width','display','gap','text-align','opacity','transition','transform'];

const harvestFn = (PROPS) => {
  const g = el => { const cs = getComputedStyle(el); const o = {}; for (const p of PROPS) o[p] = cs.getPropertyValue(p); return o; };
  const label = el => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0,4).join('.') : ''));
  const txt = el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90);
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const take = (sel, n) => [...document.querySelectorAll(sel)].filter(vis).slice(0, n);

  // effective background: walk up until a non-transparent bg
  const effBg = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const bg = cs.backgroundColor;
      const img = cs.backgroundImage;
      if (img && img !== 'none') return { color: bg, image: img, from: label(n), overImage: true };
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return { color: bg, image: img, from: label(n), overImage: false };
      n = n.parentElement;
    }
    const cs = getComputedStyle(document.body);
    return { color: cs.backgroundColor, image: cs.backgroundImage, from: 'body', overImage: false };
  };

  const out = { headings: [], body: [], links: [], buttons: [], cards: [], root: {}, container: null, charsPerLine: [] };

  for (const h of ['h1','h2','h3','h4','h5','h6']) {
    for (const el of take(h, 3)) out.headings.push({ tag: h, label: label(el), text: txt(el), style: g(el), bg: effBg(el) });
  }
  for (const el of take('p', 6)) out.body.push({ label: label(el), text: txt(el), style: g(el), bg: effBg(el) });
  for (const el of take('a:not([class*="btn"]):not([class*="button"])', 6)) out.links.push({ label: label(el), text: txt(el), href: el.getAttribute('href'), style: g(el), bg: effBg(el) });
  for (const el of take('button, a[class*="btn"], a[class*="button"], [role="button"], input[type="submit"]', 8)) out.buttons.push({ label: label(el), text: txt(el), style: g(el), bg: effBg(el) });
  for (const el of take('[class*="card"], article, [class*="Card"], [class*="tier"], [class*="plan"]', 6)) out.cards.push({ label: label(el), text: txt(el), style: g(el), bg: effBg(el) });

  // :root custom properties
  const rootCS = getComputedStyle(document.documentElement);
  const names = new Set();
  for (const sheet of document.styleSheets) {
    try { for (const rule of sheet.cssRules) {
      if (rule.style) for (const p of rule.style) if (p.startsWith('--')) names.add(p);
      if (rule.cssRules) for (const r2 of rule.cssRules) if (r2.style) for (const p of r2.style) if (p.startsWith('--')) names.add(p);
    } } catch {}
  }
  for (const n of [...names].sort()) out.root[n] = rootCS.getPropertyValue(n).trim();
  out.rootCount = names.size;

  // container
  const cand = document.querySelector('[class*="container"], [class*="Container"], main > div, main > section > div');
  if (cand) { const cs = getComputedStyle(cand); out.container = { label: label(cand), maxWidth: cs.maxWidth, width: cs.width, paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight, marginLeft: cs.marginLeft, rect: cand.getBoundingClientRect().width }; }

  // chars per line for body paragraphs
  for (const el of take('p', 4)) {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().length > 60);
    if (!node) continue;
    const r = document.createRange(); r.selectNodeContents(node);
    const lines = r.getClientRects().length;
    const len = node.textContent.trim().length;
    if (lines > 0) out.charsPerLine.push({ label: label(el), chars: len, lines, perLine: Math.round(len / lines), width: Math.round(el.getBoundingClientRect().width), fontSize: getComputedStyle(el).fontSize });
  }
  return out;
};

const structureFn = () => {
  const label = el => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0,3).join('.') : ''));
  const vh = window.innerHeight;
  const roots = document.querySelectorAll('main > *, body > header, body > footer, body > nav');
  const sections = [...roots].map(el => {
    const r = el.getBoundingClientRect();
    const h = el.querySelector('h1,h2,h3');
    return { label: label(el), heading: h ? h.textContent.trim().slice(0,100) : null,
      top: Math.round(r.top + window.scrollY), height: Math.round(r.height), vhs: +(r.height / vh).toFixed(2),
      text: (el.textContent||'').trim().replace(/\s+/g,' ').slice(0,260) };
  });
  const ctaRe = /book|start|get started|free trial|trial|sign up|enquir|contact|call|request|join|try|apply|find out|speak/i;
  const ctas = [...document.querySelectorAll('a,button')].filter(el => {
    const r = el.getBoundingClientRect(); return r.width>0 && r.height>0 && ctaRe.test((el.textContent||'').trim());
  }).map(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { text: (el.textContent||'').trim().slice(0,60), href: el.getAttribute('href'), label: label(el),
      top: Math.round(r.top + window.scrollY), vhPos: +((r.top + window.scrollY)/vh).toFixed(2),
      bg: cs.backgroundColor, color: cs.color, fontSize: cs.fontSize, padding: cs.padding, borderRadius: cs.borderRadius }; });
  return { scrollHeight: document.documentElement.scrollHeight, vh, totalVhs: +(document.documentElement.scrollHeight / vh).toFixed(2), sections, ctas,
    headingOutline: [...document.querySelectorAll('h1,h2,h3')].map(h => ({ t: h.tagName, text: h.textContent.trim().slice(0,120) })) };
};

const cssMetaFn = () => {
  const media = new Set(); const keyframes = []; const transitions = new Set(); const animations = new Set();
  const walk = (rules) => { for (const rule of rules) {
    if (rule.type === 4 || rule.constructor.name === 'CSSMediaRule') { media.add(rule.conditionText || rule.media.mediaText); if (rule.cssRules) walk(rule.cssRules); }
    else if (rule.constructor.name === 'CSSKeyframesRule') { keyframes.push({ name: rule.name, frames: [...rule.cssRules].map(f => ({ key: f.keyText, css: f.style.cssText.slice(0,300) })) }); }
    else if (rule.constructor.name === 'CSSSupportsRule' && rule.cssRules) walk(rule.cssRules);
    else if (rule.style) {
      const t = rule.style.transition || rule.style.transitionProperty;
      if (t) transitions.add(rule.selectorText + ' {' + t + '}');
      const a = rule.style.animation || rule.style.animationName;
      if (a) animations.add(rule.selectorText + ' {' + a + '}');
    }
  } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch(e) {} }
  return { media: [...media].sort(), keyframes, transitions: [...transitions].slice(0,160), animations: [...animations].slice(0,160) };
};

const browser = await chromium.launch({ headless: true });
const report = { pages: {}, integrity: {}, visited: [] };

for (const p of PAGES) {
  const s = slug(p);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const failures = []; const responses = [];
  page.on('requestfailed', r => failures.push({ url: r.url(), type: r.resourceType(), err: r.failure()?.errorText }));
  page.on('response', r => responses.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }));

  let status = null, finalUrl = null;
  try { const resp = await page.goto(ORIGIN + p, { waitUntil: 'networkidle', timeout: 60000 }); status = resp.status(); finalUrl = resp.url(); }
  catch (e) { report.pages[s] = { error: String(e) }; await ctx.close(); continue; }

  await page.waitForTimeout(900);
  const fonts = await page.evaluate(() => ({ status: document.fonts.status, size: document.fonts.size,
    faces: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })) }));

  fs.writeFileSync(path.join(ROOT, 'html', s + '.html'), await page.content());

  const byWidth = {};
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: w < 500 ? 844 : 900 });
    await page.waitForTimeout(450);
    byWidth[w] = await page.evaluate(harvestFn, PROPS);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(400);
  const structure = await page.evaluate(structureFn);
  const cssMeta = await page.evaluate(cssMetaFn);
  await page.screenshot({ path: path.join(ROOT, 'screens', s + '-1440.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const structure390 = await page.evaluate(structureFn);
  await page.screenshot({ path: path.join(ROOT, 'screens', s + '-390.png'), fullPage: true });

  const sheets = responses.filter(r => r.type === 'stylesheet').map(r => r.url);
  report.pages[s] = { path: p, status, finalUrl, fonts, byWidth, structure, structure390, cssMeta, sheets,
    failures, non200: responses.filter(r => r.status >= 400), hosts: [...new Set(responses.map(r => { try { return new URL(r.url).host; } catch { return 'data'; } }))],
    requestCount: responses.length };
  report.visited.push({ path: p, status, finalUrl, failures: failures.length, fontStatus: fonts.status, fontSize: fonts.size });
  console.log('OK', p, status, 'fonts=' + fonts.status + '/' + fonts.size, 'fails=' + failures.length, 'vhs=' + structure.totalVhs, 'reqs=' + responses.length);
  await ctx.close();
}

fs.writeFileSync(path.join(ROOT, 'raw', 'harvest.json'), JSON.stringify(report, null, 1));
console.log('DONE pages=' + Object.keys(report.pages).length);
await browser.close();
