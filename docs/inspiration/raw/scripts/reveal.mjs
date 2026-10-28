import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch({headless:true});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto('https://revolearn.co.uk/',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);

const probe=async(tag)=>p.evaluate((tag)=>{
  const els=[...document.querySelectorAll('.rl-reveal-item,.rl-reveal,.rl-reveal-card,.rl-reveal-calm')];
  const st=els.map(e=>({cls:String(e.className).split(' ').filter(c=>c.startsWith('rl-reveal')||c==='is-in').join(' '),
    op:+getComputedStyle(e).opacity, isIn:e.classList.contains('is-in'),
    txt:(e.textContent||'').trim().slice(0,26)}));
  return {tag,total:els.length,isIn:st.filter(s=>s.isIn).length,faded:st.filter(s=>s.op<0.9).length,
    samples:st.filter(s=>s.op<0.9).slice(0,6)};
},tag);

console.log('INITIAL', JSON.stringify(await probe('initial'),null,1));

// genuine slow scroll, human-like
await p.evaluate(async()=>{ const H=document.body.scrollHeight;
  for(let y=0;y<H;y+=250){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,260));} });
await p.waitForTimeout(2500);
const afterScroll=await probe('after-slow-scroll');
console.log('AFTER SLOW SCROLL', JSON.stringify(afterScroll,null,1));

// explicitly scroll the specific section into view and dwell
await p.evaluate(async()=>{ const el=[...document.querySelectorAll('*')].find(e=>/EVERY LESSON INCLUDES/i.test(e.textContent||'')&&e.children.length<6);
  if(el) el.scrollIntoView({block:'center'}); });
await p.waitForTimeout(2500);
console.log('AFTER DWELL', JSON.stringify(await probe('after-dwell'),null,1));
await b.close();
