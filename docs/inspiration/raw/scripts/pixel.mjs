import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const ROOT='/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
await page.goto('https://revolearn.co.uk/reviews',{waitUntil:'networkidle'});
await page.waitForTimeout(1500);
await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}});
await page.waitForTimeout(1200);

// sample the painted background behind an .rl-mark using canvas over a crop
const res=await page.evaluate(async()=>{
  const el=document.querySelector('.rl-mark');
  if(!el) return {err:'no mark'};
  el.scrollIntoView({block:'center'});
  await new Promise(r=>setTimeout(r,900));
  const r=el.getBoundingClientRect();
  const cs=getComputedStyle(el);
  return {rect:{x:r.x,y:r.y,w:r.width,h:r.height},color:cs.color,bgImage:cs.backgroundImage,bgSize:cs.backgroundSize,text:el.textContent.trim().slice(0,40)};
});
console.log('MARK',JSON.stringify(res,null,1));
if(res.rect){
  const {x,y,w,h}=res.rect;
  await page.screenshot({path:ROOT+'/raw/mark-crop.png',clip:{x:Math.max(0,x),y:Math.max(0,y),width:Math.min(w,400),height:h}});
}
// star sample on pricing
const ctx2=await browser.newContext({viewport:{width:1440,height:900}});
const p2=await ctx2.newPage();
await p2.goto('https://revolearn.co.uk/pricing',{waitUntil:'networkidle'});
await p2.waitForTimeout(1200);
const star=await p2.evaluate(async()=>{
  const el=document.querySelector('.text-gold');
  if(!el)return{err:'none'};
  el.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,700));
  const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
  // is there an adjacent textual rating?
  const parent=el.parentElement;
  return {text:el.textContent.trim(),color:cs.color,fontSize:cs.fontSize,rect:{x:r.x,y:r.y,w:r.width,h:r.height},
    parentText:(parent?.textContent||'').trim().replace(/\s+/g,' ').slice(0,160),
    ariaLabel:el.getAttribute('aria-label')||parent?.getAttribute('aria-label')||null,
    srSibling:[...(parent?.querySelectorAll('.sr-only')||[])].map(s=>s.textContent.trim()).slice(0,3)};
});
console.log('STAR',JSON.stringify(star,null,1));
if(star.rect) await p2.screenshot({path:ROOT+'/raw/star-crop.png',clip:{x:Math.max(0,star.rect.x-4),y:Math.max(0,star.rect.y-4),width:star.rect.w+8,height:star.rect.h+8}});
await browser.close();
