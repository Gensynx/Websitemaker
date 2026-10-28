import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const ROOT='/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const PAGES=['/','/pricing','/how-it-works','/about','/reviews','/faq','/gcse-maths-tuition','/contact'];
const slug=p=>p==='/'?'home':p.replace(/^\//,'');
const b=await chromium.launch({headless:true});
const slow=async pg=>pg.evaluate(async()=>{const H=document.body.scrollHeight;
  for(let y=0;y<H;y+=250){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,230));}
  window.scrollTo(0,0);await new Promise(r=>setTimeout(r,500));});
for(const p of PAGES){
  for(const [w,h,tag] of [[1440,900,'1440'],[390,844,'390']]){
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    const pg=await ctx.newPage();
    await pg.goto('https://revolearn.co.uk'+p,{waitUntil:'networkidle',timeout:60000});
    await pg.waitForTimeout(1200);
    await slow(pg);
    await pg.waitForTimeout(900);
    const faded=await pg.evaluate(()=>[...document.querySelectorAll('.rl-reveal-item,.rl-reveal,.rl-reveal-card,.rl-reveal-calm')].filter(e=>+getComputedStyle(e).opacity<0.9).length);
    await pg.screenshot({path:ROOT+'/screens/'+slug(p)+'-'+tag+'.png',fullPage:true});
    console.log('shot',slug(p),tag,'residualFaded='+faded);
    await ctx.close();
  }
}
await b.close();
