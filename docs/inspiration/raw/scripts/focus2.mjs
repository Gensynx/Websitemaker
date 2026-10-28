import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch({headless:true});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto('https://revolearn.co.uk/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
// keyboard-driven focus (focus-visible needs real keyboard interaction)
const res=[];
for(let i=0;i<8;i++){
  await p.keyboard.press('Tab');
  await p.waitForTimeout(180);
  res.push(await p.evaluate(()=>{
    const el=document.activeElement; if(!el||el===document.body)return null;
    const cs=getComputedStyle(el);
    let n=el.parentElement,bg='';while(n){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)/.test(c)){bg=c;break;}n=n.parentElement;}
    return {txt:(el.textContent||'').trim().slice(0,30),tag:el.tagName,
      outline:cs.outline,outlineOffset:cs.outlineOffset,boxShadow:cs.boxShadow.slice(0,70),bg,
      matchesFV:el.matches(':focus-visible')};
  }));
}
for(const r of res) if(r) console.log(r.tag.padEnd(7)+' fv='+String(r.matchesFV).padEnd(6)+' outline='+String(r.outline).padEnd(30)+' off='+r.outlineOffset+' shadow='+r.boxShadow.padEnd(26)+' "'+r.txt+'"');
await b.close();
