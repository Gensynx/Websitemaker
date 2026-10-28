import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const ROOT='/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const b=await chromium.launch({headless:true});
const out={gutters:{},components:{},sticky:null,faq:null,nav:null};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto('https://revolearn.co.uk/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
for(const w of [390,560,640,768,1024,1100,1280,1440,1560]){
  await p.setViewportSize({width:w,height:900});
  await p.waitForTimeout(260);
  out.gutters[w]=await p.evaluate(()=>{
    const s=document.querySelector('.shell,.rl-wrap');
    if(!s)return null;const cs=getComputedStyle(s);const r=s.getBoundingClientRect();
    return {maxWidth:cs.maxWidth,width:Math.round(r.width),pl:cs.paddingLeft,pr:cs.paddingRight,
      gutter:Math.round(r.left), sectionY:getComputedStyle(document.documentElement).getPropertyValue('--section-y')||
        getComputedStyle(document.querySelector('.rl-home-root')||document.body).getPropertyValue('--section-y'),
      heroH1:getComputedStyle(document.querySelector('h1')).fontSize};
  });
}
await p.setViewportSize({width:1440,height:900});
await p.waitForTimeout(300);
// sticky header
out.sticky=await p.evaluate(async()=>{
  const h=document.querySelector('header');const cs=getComputedStyle(h);
  const before={pos:cs.position,bg:cs.backgroundColor,h:h.getBoundingClientRect().height,shadow:cs.boxShadow,cls:String(h.className).slice(0,60)};
  window.scrollTo(0,1400);await new Promise(r=>setTimeout(r,700));
  const cs2=getComputedStyle(h);
  const after={bg:cs2.backgroundColor,h:h.getBoundingClientRect().height,shadow:cs2.boxShadow,top:h.getBoundingClientRect().top,cls:String(h.className).slice(0,60)};
  window.scrollTo(0,0);await new Promise(r=>setTimeout(r,400));
  return {before,after};
});
// FAQ accordion states
await p.goto('https://revolearn.co.uk/faq',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
out.faq=await p.evaluate(async()=>{
  const btn=document.querySelector('[aria-expanded]');
  if(!btn)return null;
  const closed={expanded:btn.getAttribute('aria-expanded'),tag:btn.tagName,controls:btn.getAttribute('aria-controls'),text:(btn.textContent||'').trim().slice(0,50)};
  btn.click();await new Promise(r=>setTimeout(r,800));
  const open={expanded:btn.getAttribute('aria-expanded')};
  const panel=btn.getAttribute('aria-controls')?document.getElementById(btn.getAttribute('aria-controls')):null;
  return {closed,open,panelFound:!!panel,panelHidden:panel?panel.hidden:null,
    panelH:panel?Math.round(panel.getBoundingClientRect().height):null};
});
// mobile nav
await p.setViewportSize({width:390,height:844});
await p.goto('https://revolearn.co.uk/',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
out.nav=await p.evaluate(async()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>/menu|nav/i.test(b.getAttribute('aria-label')||b.className||''))||document.querySelector('header button');
  if(!btn)return{err:'no toggle'};
  const before={expanded:btn.getAttribute('aria-expanded'),label:btn.getAttribute('aria-label')};
  btn.click();await new Promise(r=>setTimeout(r,700));
  const after={expanded:btn.getAttribute('aria-expanded'),
    visibleLinks:[...document.querySelectorAll('header a, nav a, [role=dialog] a')].filter(a=>a.getBoundingClientRect().height>0).length};
  return {before,after};
});
await p.screenshot({path:ROOT+'/screens/home-390-nav-open.png'});
fs.writeFileSync(ROOT+'/raw/gaps.json',JSON.stringify(out,null,1));
console.log('GUTTERS');
for(const [w,v] of Object.entries(out.gutters)) console.log('  '+w.padStart(5)+'px  max='+v.maxWidth+' w='+v.width+' pad='+v.pl+'/'+v.pr+' gutter='+v.gutter+'px sectionY='+v.sectionY.trim()+' h1='+v.heroH1);
console.log('\nSTICKY',JSON.stringify(out.sticky,null,1));
console.log('\nFAQ',JSON.stringify(out.faq,null,1));
console.log('\nNAV',JSON.stringify(out.nav,null,1));
await b.close();
