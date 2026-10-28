import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const ROOT='/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const PAGES=['/','/pricing','/how-it-works','/about','/reviews','/faq','/gcse-maths-tuition','/contact'];
const slug=p=>p==='/'?'home':p.replace(/^\//,'');
const b=await chromium.launch({headless:true});
const out={};
for(const p of PAGES){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const pg=await ctx.newPage();
  const bytes={total:0,byType:{}};
  pg.on('response',async r=>{ try{ const h=r.headers(); const len=parseInt(h['content-length']||'0',10)||0;
    const t=r.request().resourceType(); bytes.total+=len; bytes.byType[t]=(bytes.byType[t]||0)+len; }catch{} });
  const t0=Date.now();
  await pg.goto('https://revolearn.co.uk'+p,{waitUntil:'networkidle',timeout:60000});
  const loadMs=Date.now()-t0;
  await pg.waitForTimeout(900);
  const r=await pg.evaluate(()=>{
    const imgs=[...document.querySelectorAll('img')].map(i=>({hasAlt:i.hasAttribute('alt'),alt:i.getAttribute('alt'),
      ariaHidden:i.getAttribute('aria-hidden'),src:(i.currentSrc||i.src||'').slice(-46),w:i.naturalWidth,h:i.naturalHeight,
      loading:i.loading,decoding:i.decoding,sizes:i.getAttribute('sizes'),srcset:!!i.getAttribute('srcset')}));
    const deco=[...document.querySelectorAll('*')].filter(el=>/Caveat/i.test(getComputedStyle(el).fontFamily));
    const decoAria=deco.map(el=>{let n=el,hidden=false;while(n){if(n.getAttribute&&n.getAttribute('aria-hidden')==='true'){hidden=true;break;}n=n.parentElement;}
      return {text:(el.textContent||'').trim().slice(0,30),hidden};});
    const nav=performance.getEntriesByType('navigation')[0]||{};
    const paints={};for(const e of performance.getEntriesByType('paint'))paints[e.name]=Math.round(e.startTime);
    const res=performance.getEntriesByType('resource');
    const transfer=res.reduce((a,x)=>a+(x.transferSize||0),0);
    const byT={};for(const x of res){const k=x.initiatorType;byT[k]=(byT[k]||0)+(x.transferSize||0);}
    return {imgs,decoAria,
      nav:{domContentLoaded:Math.round(nav.domContentLoadedEventEnd||0),load:Math.round(nav.loadEventEnd||0),
        transferSize:nav.transferSize,encodedBodySize:nav.encodedBodySize,decodedBodySize:nav.decodedBodySize},
      paints,resourceCount:res.length,resourceTransfer:transfer,byInitiator:byT,
      h1Count:document.querySelectorAll('h1').length,
      headingSeq:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>+h.tagName[1]),
      focusables:document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length,
      ariaExpanded:document.querySelectorAll('[aria-expanded]').length,
      details:document.querySelectorAll('details').length};
  });
  // LCP
  const lcp=await pg.evaluate(()=>new Promise(res=>{let v=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())v=Math.round(e.startTime);}).observe({type:'largest-contentful-paint',buffered:true});}catch{}setTimeout(()=>res(v),700);}));
  out[slug(p)]={...r,lcp,loadMs,clHeaderBytes:bytes};
  const noAlt=r.imgs.filter(i=>!i.hasAlt);
  const emptyAlt=r.imgs.filter(i=>i.hasAlt&&!String(i.alt).trim());
  console.log(slug(p).padEnd(20),'imgs='+r.imgs.length,'NOattr='+noAlt.length,'alt=""='+emptyAlt.length,
    'described='+(r.imgs.length-noAlt.length-emptyAlt.length),
    '| transfer='+Math.round(r.resourceTransfer/1024)+'KB reqs='+r.resourceCount,
    'FCP='+(r.paints['first-contentful-paint']||'?')+'ms LCP='+lcp+'ms DCL='+r.nav.domContentLoaded+'ms',
    '| h1='+r.h1Count,'focusables='+r.focusables,'details='+r.details);
  await ctx.close();
}
const allDeco=Object.values(out).flatMap(o=>o.decoAria);
console.log('\nCAVEAT decorative nodes:',allDeco.length,'aria-hidden:',allDeco.filter(d=>d.hidden).length);
fs.writeFileSync(ROOT+'/raw/perf-a11y.json',JSON.stringify(out,null,1));
await b.close();
