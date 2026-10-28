import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch({headless:true});
const PAGES=['/','/pricing','/how-it-works','/about','/reviews','/faq','/gcse-maths-tuition','/contact'];
for(const p of PAGES){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const pg=await ctx.newPage();
  await pg.goto('https://revolearn.co.uk'+p,{waitUntil:'networkidle',timeout:60000});
  const row=[];
  for(const w of [360,390,768,1024,1440]){
    await pg.setViewportSize({width:w,height:900});
    await pg.waitForTimeout(350);
    const r=await pg.evaluate(()=>{
      const de=document.documentElement;
      const over=[...document.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();
        return r.right>de.clientWidth+1.5&&r.width>0&&r.height>0&&getComputedStyle(el).position!=='fixed';});
      return {scrollW:de.scrollWidth,clientW:de.clientWidth,overflowX:de.scrollWidth>de.clientWidth+1,
        count:over.length,worst:over.slice(0,2).map(e=>String(e.className).slice(0,34)+'@'+Math.round(e.getBoundingClientRect().right))};
    });
    row.push(w+':'+(r.overflowX?'OVERFLOW '+r.scrollW+'>'+r.clientW:'ok')+(r.count?'('+r.count+' el)':''));
  }
  console.log(p.padEnd(22)+row.join('  '));
  await ctx.close();
}
await b.close();
