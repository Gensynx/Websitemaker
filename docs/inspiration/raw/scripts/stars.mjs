import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch({headless:true});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto('https://revolearn.co.uk/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{
  const out=[];
  for(const el of document.querySelectorAll('span,div')){
    const t=(el.textContent||'').trim();
    if(!/★/.test(t)||el.children.length>0)continue;
    const cs=getComputedStyle(el);
    let n=el,bg='';while(n){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)/.test(c)){bg=c+' @'+n.tagName+'.'+String(n.className).slice(0,30);break;}n=n.parentElement;}
    out.push({text:t.slice(0,12),color:cs.color,fontSize:cs.fontSize,bg,
      ariaHidden:el.getAttribute('aria-hidden'),ariaLabel:el.getAttribute('aria-label'),
      parentText:(el.parentElement?.textContent||'').trim().replace(/\s+/g,' ').slice(0,120),
      parentAria:el.parentElement?.getAttribute('aria-label')});
  }
  // the page thread
  const thread=document.querySelector('.rl-page-thread,[class*="thread"]');
  const threadInfo=thread?{tag:thread.tagName,cls:String(thread.className).slice(0,60),
    svgPaths:thread.querySelectorAll('path').length,
    pathData:[...thread.querySelectorAll('path')].slice(0,2).map(x=>({d:(x.getAttribute('d')||'').slice(0,80),stroke:getComputedStyle(x).stroke,sw:getComputedStyle(x).strokeWidth,dash:getComputedStyle(x).strokeDasharray.slice(0,40)}))}:null;
  return {stars:out,thread:threadInfo};
});
console.log(JSON.stringify(r,null,1));
await b.close();
