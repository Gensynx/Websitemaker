import { chromium } from 'playwright';

const CASES = [
  { name: 'door-default', query: '' },
  { name: 'door-sidelights-toplight',
    query: '?v=3&m=u&p=d&w=1800&h=2200&ce=RAL7016&ci=m&fe=sm&fi=m&g=c.2&sg=t&tv=n&s=hg&pd=r.2.ov&gf=0.5&ap=r.120.i&ab=aa_2_3_22&sl=400.aa_1_4_22.i&sr=400.aa_1_4_22.i&tl=350.r.n.i&hw=lb&hf=br&lp=1&sh=1&kn=rg&tr=lo&hg=l&od=i' },
  { name: 'window-casement-3x2',
    query: '?v=3&m=a&p=w&w=2400&h=1400&ce=RAL9005&ci=m&fe=sm&fi=m&g=c.3&sg=n&tv=hf.2&s=cs&gd=1-2-1*1-1*shl.n.i-f.aa_2_2_22.i-shr.n.i-f.n.i-f.n.i-f.n.i&hw=lr&hf=bk' },
  { name: 'window-sash',
    query: '?v=3&m=t&p=w&w=900&h=1600&ce=RAL9010&ci=m&fe=sm&fi=m&g=c.2&sg=n&tv=n&s=sa&op=dh&mr=0.55&ho=1&ub=aa_3_2_22&lb=aa_3_2_22&hw=lr&hf=sc' },
];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });

const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

for (const testCase of CASES) {
  await page.goto(`http://localhost:5180/${testCase.query}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(1800);
  const drew = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas !== null && canvas.width > 0 && canvas.height > 0;
  });
  const heading = await page.textContent('h1');
  const lede = await page.textContent('.lede');
  console.log(`${testCase.name}: canvas=${drew} heading="${heading}" size="${lede}"`);
  await page.screenshot({ path: `/tmp/shot-${testCase.name}.png` });
}

// Controls
await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
for (const label of ['Elevation', 'Hardware', 'Scale figure', 'Reset view']) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(600);
}
await page.screenshot({ path: '/tmp/shot-controls.png' });
console.log('url after interaction:', page.url());

// Mobile width
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log('horizontal overflow at 390px:', overflow);
await page.screenshot({ path: '/tmp/shot-mobile.png' });

console.log(problems.length === 0 ? 'NO CONSOLE ERRORS' : `PROBLEMS:\n${problems.join('\n')}`);
await browser.close();
