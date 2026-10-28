import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const ROOT='/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const PAGES=['/','/pricing','/how-it-works','/about','/reviews','/faq','/gcse-maths-tuition','/contact'];
const slug=p=>p==='/'?'home':p.replace(/^\//,'');
const b=await chromium.launch({headless:true});
const out={};

// 1. JS-disabled test (no-JS robustness)
const nojsCtx=await b.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false});
const nojs=await nojsCtx.newPage();
await nojs.goto('https://revolearn.co.uk/',{waitUntil:'domcontentloaded',timeout:60000});
await nojs.waitForTimeout(2500);
out.noJS=await nojs.evaluate(()=>{
  const vis=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
  const els=[...document.querySelectorAll('*')].filter(vis);
  const faded=els.filter(el=>parseFloat(getComputedStyle(el).opacity)<0.9);
  return {total:els.length,fadedCount:faded.length,
    samples:faded.slice(0,8).map(el=>({cls:String(el.className).slice(0,44),op:getComputedStyle(el).opacity,text:(el.textContent||'').trim().slice(0,46)})),
    textLen:document.body.innerText.length, h1:document.querySelector('h1')?.textContent.trim()};
});
await nojs.screenshot({path:ROOT+'/screens/home-1440-nojs.png',fullPage:false});
await nojsCtx.close();
console.log('NOJS',JSON.stringify(out.noJS,null,1));

// 2. proper screenshots: scroll through so reveals fire, then capture
for(const p of PAGES){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const pg=await ctx.newPage();
  await pg.goto('https://revolearn.co.uk'+p,{waitUntil:'networkidle',timeout:60000});
  await pg.waitForTimeout(1200);
  await pg.evaluate(async()=>{const H=document.body.scrollHeight;for(let y=0;y<H;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,400));});
  await pg.waitForTimeout(1000);
  await pg.screenshot({path:ROOT+'/screens/'+slug(p)+'-1440.png',fullPage:true});
  await pg.setViewportSize({width:390,height:844});
  await pg.waitForTimeout(500);
  await pg.evaluate(async()=>{const H=document.body.scrollHeight;for(let y=0;y<H;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,400));});
  await pg.waitForTimeout(900);
  await pg.screenshot({path:ROOT+'/screens/'+slug(p)+'-390.png',fullPage:true});
  console.log('shot',p);
  await ctx.close();
}

// 3. star/rating contrast context + nav/focus + form
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const pg=await ctx.newPage();
await pg.goto('https://revolearn.co.uk/pricing',{waitUntil:'networkidle'});
await pg.waitForTimeout(1200);
out.rating=await pg.evaluate(()=>{
  const res=[];
  const walk=el=>{ if(el.children.length===0&&/★|☆/.test(el.textContent||'')){
      const cs=getComputedStyle(el);let n=el,bg='';
      while(n){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)/.test(c)){bg=c;break;}n=n.parentElement;}
      let anc=el,ctxTxt='';for(let i=0;i<4&&anc;i++){anc=anc.parentElement;if(anc)ctxTxt=(anc.textContent||'').trim().replace(/\s+/g,' ').slice(0,140);}
      res.push({text:el.textContent.trim().slice(0,10),color:cs.color,bg,fontSize:cs.fontSize,
        ariaHidden:el.getAttribute('aria-hidden'),ctxTxt});}
    for(const c of el.children)walk(c); };
  walk(document.body);
  return res;
});
out.focus=await pg.evaluate(()=>{
  const el=document.querySelector('a[href], button');el.focus();
  const cs=getComputedStyle(el);
  return {outline:cs.outline,outlineWidth:cs.outlineWidth,outlineColor:cs.outlineColor,boxShadow:cs.boxShadow};
});
await ctx.close();
console.log('RATING',JSON.stringify(out.rating,null,1));
console.log('FOCUS',JSON.stringify(out.focus));

// 4. contact form
const c2=await b.newContext({viewport:{width:1440,height:900}});
const p2=await c2.newPage();
await p2.goto('https://revolearn.co.uk/contact',{waitUntil:'networkidle'});
await p2.waitForTimeout(1000);
out.contact=await p2.evaluate(()=>{
  const f=document.querySelector('form');
  return {hasForm:!!f, action:f?.getAttribute('action'), method:f?.getAttribute('method'),
    fields:[...document.querySelectorAll('input,textarea,select')].map(i=>({type:i.type||i.tagName,name:i.name,required:i.required,
      labelled:!!(i.labels&&i.labels.length)||!!i.getAttribute('aria-label')})),
    links:[...document.querySelectorAll('a[href^="mailto"],a[href^="tel"],a[href*="wa.me"],a[href*="whatsapp"]')].map(a=>a.getAttribute('href')),
    bodyText:document.body.innerText.replace(/\s+/g,' ').slice(0,700)};
});
await c2.close();
console.log('CONTACT',JSON.stringify(out.contact,null,1));
fs.writeFileSync(ROOT+'/raw/final.json',JSON.stringify(out,null,1));
await b.close();
