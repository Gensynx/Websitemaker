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
  await pg.goto('https://revolearn.co.uk'+p,{waitUntil:'networkidle',timeout:60000});
  await pg.waitForTimeout(1000);
  await pg.evaluate(async()=>{const H=document.body.scrollHeight;for(let y=0;y<H;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,300));});
  await pg.waitForTimeout(700);
  out[slug(p)]=await pg.evaluate(()=>{
    const vh=window.innerHeight;
    const lab=el=>el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):'');
    // real sections: <section> tags, or direct children of .shell containers
    let secs=[...document.querySelectorAll('section')];
    if(secs.length<3) secs=[...document.querySelectorAll('.rl-page > *, .rl-page .shell > *')];
    const sections=secs.filter(el=>{const r=el.getBoundingClientRect();return r.height>80;}).map(el=>{
      const r=el.getBoundingClientRect();const h=el.querySelector('h1,h2,h3');const cs=getComputedStyle(el);
      let n=el,bg='';while(n){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)/.test(c)){bg=c;break;}n=n.parentElement;}
      return {label:lab(el),heading:h?h.textContent.trim().slice(0,70):null,
        top:Math.round(r.top+scrollY),h:Math.round(r.height),vhs:+(r.height/vh).toFixed(2),bg,
        padY:cs.paddingTop+'/'+cs.paddingBottom,
        text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,180)};});
    const allCta=[...document.querySelectorAll('a,button')].map(el=>{const r=el.getBoundingClientRect();
      if(r.width<=0||r.height<=0)return null;const cs=getComputedStyle(el);
      return {text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,46),href:el.getAttribute('href'),
        vhPos:+((r.top+scrollY)/vh).toFixed(2),bg:cs.backgroundColor,color:cs.color,
        isPrimary:/wa\.me|whatsapp/i.test(el.getAttribute('href')||'')};}).filter(Boolean);
    const wa=allCta.filter(c=>c.isPrimary);
    return {totalVhs:+(document.documentElement.scrollHeight/vh).toFixed(2),sections,
      waCtas:wa,ctaCount:wa.length,
      allLinkCount:allCta.length,
      firstWaVh:wa.length?wa[0].vhPos:null,
      bodyText:document.body.innerText.replace(/\s+/g,' ')};
  });
  console.log(slug(p).padEnd(20),'secs='+out[slug(p)].sections.length,'WA-CTAs='+out[slug(p)].ctaCount,'firstWA@'+out[slug(p)].firstWaVh+'vh','vhs='+out[slug(p)].totalVhs);
  await ctx.close();
}
fs.writeFileSync(ROOT+'/raw/structure.json',JSON.stringify(out,null,1));
console.log('\n=== HOME SECTION ORDER ===');
for(const s of out.home.sections) console.log('  '+String(s.vhs).padStart(5)+'vh bg:'+s.bg.padEnd(20)+' '+(s.heading||'—').slice(0,56));
console.log('\n=== HOME WHATSAPP CTA LADDER ===');
for(const c of out.home.waCtas) console.log('  @'+String(c.vhPos).padStart(5)+'vh  "'+c.text+'"  bg:'+c.bg);
await b.close();
