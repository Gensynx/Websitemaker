import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const ROOT='/tmp/claude-0/-home-user-Websitemaker/fc710425-f4c3-5e46-80f2-b424d9f51c01/scratchpad/capture';
const ORIGIN='https://revolearn.co.uk';
const PAGES=['/','/pricing','/how-it-works','/about','/reviews','/faq','/gcse-maths-tuition','/contact'];
const slug=p=>p==='/'?'home':p.replace(/^\//,'');

const deep = () => {
  const label=el=>el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).slice(0,3).join('.'):'');
  const vis=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
  // every element with an explicit max-width (the real containers)
  const containers=[...document.querySelectorAll('div,section,main,article,header,footer')].filter(vis).map(el=>{
    const cs=getComputedStyle(el);return {label:label(el),maxWidth:cs.maxWidth,width:Math.round(el.getBoundingClientRect().width),pl:cs.paddingLeft,pr:cs.paddingRight,ml:cs.marginLeft};
  }).filter(c=>c.maxWidth!=='none');
  const seen=new Set();const uniqC=[];for(const c of containers){const k=c.label+c.maxWidth;if(!seen.has(k)){seen.add(k);uniqC.push(c);}}

  // Caveat / hand font usage
  const hand=[...document.querySelectorAll('*')].filter(el=>vis(el)&&/Caveat/i.test(getComputedStyle(el).fontFamily)&&el.children.length===0)
    .slice(0,8).map(el=>{const cs=getComputedStyle(el);return{label:label(el),text:(el.textContent||'').trim().slice(0,70),fontFamily:cs.fontFamily,fontSize:cs.fontSize,color:cs.color,transform:cs.transform};});

  // all visible h2 with their computed size (section headings)
  const h2s=[...document.querySelectorAll('h2')].filter(vis).map(el=>{const cs=getComputedStyle(el);
    return{text:(el.textContent||'').trim().slice(0,70),fontSize:cs.fontSize,fontWeight:cs.fontWeight,lh:cs.lineHeight,ls:cs.letterSpacing,fontFamily:cs.fontFamily.slice(0,30)};});

  // contrast pairs: every visible text-bearing leaf-ish node
  const toRGB=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(x=>parseFloat(x));return{r:p[0],g:p[1],b:p[2],a:p[3]===undefined?1:p[3]};};
  const effBg=el=>{let n=el;while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
    if(cs.backgroundImage&&cs.backgroundImage!=='none')return{c:cs.backgroundColor,img:cs.backgroundImage.slice(0,120),from:label(n)};
    const c=toRGB(cs.backgroundColor);if(c&&c.a>0.05)return{c:cs.backgroundColor,img:null,from:label(n)};n=n.parentElement;}
    return{c:getComputedStyle(document.body).backgroundColor,img:null,from:'body'};};
  const pairs=[];const pseen=new Set();
  for(const el of document.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,h6,li,button,label,small,strong,em,td,th,div')){
    if(!vis(el))continue;
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);
    if(!own)continue;
    const cs=getComputedStyle(el);const bg=effBg(el);
    const key=cs.color+'|'+bg.c+'|'+cs.fontSize+'|'+cs.fontWeight+'|'+(bg.img||'');
    if(pseen.has(key))continue;pseen.add(key);
    pairs.push({label:label(el),text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,60),color:cs.color,bg:bg.c,bgImage:bg.img,bgFrom:bg.from,fontSize:cs.fontSize,fontWeight:cs.fontWeight,opacity:cs.opacity});
  }

  // interactive affordances
  const inputs=[...document.querySelectorAll('input,textarea,select')].filter(vis).map(el=>{const cs=getComputedStyle(el);
    return{label:label(el),type:el.type||el.tagName,required:el.required,placeholder:el.placeholder||null,aria:el.getAttribute('aria-label'),border:cs.border,borderRadius:cs.borderRadius,padding:cs.padding,fontSize:cs.fontSize};});
  const details=[...document.querySelectorAll('details,[aria-expanded],[role="tab"],[data-state]')].filter(vis).slice(0,10)
    .map(el=>({label:label(el),tag:el.tagName,expanded:el.getAttribute('aria-expanded'),text:(el.textContent||'').trim().slice(0,60)}));
  const imgs=[...document.querySelectorAll('img')].map(el=>({src:(el.currentSrc||el.src||'').slice(-60),alt:el.getAttribute('alt'),w:el.naturalWidth,h:el.naturalHeight,loading:el.loading}));
  const svgs=document.querySelectorAll('svg').length;
  const landmarks=[...document.querySelectorAll('header,nav,main,footer,aside,section[aria-label],[role]')].slice(0,20)
    .map(el=>({tag:el.tagName.toLowerCase(),role:el.getAttribute('role'),aria:el.getAttribute('aria-label')}));
  const skip=!!document.querySelector('a[href^="#"][class*="skip"], a[class*="skip"]');
  const lang=document.documentElement.lang;
  const meta={title:document.title,desc:document.querySelector('meta[name=description]')?.content,
    og:!!document.querySelector('meta[property^="og:"]'),viewport:document.querySelector('meta[name=viewport]')?.content,
    jsonld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{const j=JSON.parse(s.textContent);return Array.isArray(j)?j.map(x=>x['@type']):j['@type'];}catch{return 'parse-error';}})};
  // animated elements currently having transition/animation
  const motion=[...document.querySelectorAll('*')].filter(vis).map(el=>{const cs=getComputedStyle(el);
    return{label:label(el),tr:cs.transitionProperty!=='all'&&cs.transitionProperty!=='none'?cs.transition:(cs.transitionDuration!=='0s'?cs.transition:null),an:cs.animationName!=='none'?cs.animationName+' '+cs.animationDuration+' '+cs.animationTimingFunction:null};})
    .filter(m=>m.tr||m.an);
  const mseen=new Set();const uniqM=[];for(const m of motion){const k=(m.tr||'')+(m.an||'');if(!mseen.has(k)){mseen.add(k);uniqM.push(m);}}
  return {containers:uniqC,hand,h2s,pairs,inputs,details,imgs,svgs,landmarks,skip,lang,meta,motion:uniqM.slice(0,40),
    focusTest:null};
};

const browser=await chromium.launch({headless:true});
const out={};
for(const p of PAGES){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await ctx.newPage();
  await page.goto(ORIGIN+p,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(1200);
  // scroll through to trigger reveal animations
  await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);});
  await page.waitForTimeout(600);
  out[slug(p)]=await page.evaluate(deep);
  console.log('deep',p,'pairs='+out[slug(p)].pairs.length,'containers='+out[slug(p)].containers.length,'hand='+out[slug(p)].hand.length);
  await ctx.close();
}

// reduced motion comparison on homepage
const mkMotion=async(reduce)=>{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:reduce?'reduce':'no-preference'});
  const page=await ctx.newPage();
  await page.goto(ORIGIN+'/',{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(1400);
  const r=await page.evaluate(()=>{
    const vis=el=>{const b=el.getBoundingClientRect();return b.width>0&&b.height>0;};
    const els=[...document.querySelectorAll('*')].filter(vis);
    const anims=els.flatMap(el=>el.getAnimations?el.getAnimations().map(a=>({name:a.animationName||(a.effect?.getKeyframes?.()?.length?'css':'?'),dur:a.effect?.getTiming?.().duration,state:a.playState})):[]);
    const withAnim=els.filter(el=>getComputedStyle(el).animationName!=='none').length;
    const withTrans=els.filter(el=>{const d=getComputedStyle(el).transitionDuration;return d&&d!=='0s'&&!/^0s(, 0s)*$/.test(d);}).length;
    const opacity0=els.filter(el=>parseFloat(getComputedStyle(el).opacity)<0.99).length;
    const transformed=els.filter(el=>getComputedStyle(el).transform!=='none').length;
    return {matches:matchMedia('(prefers-reduced-motion: reduce)').matches,animCount:anims.length,withAnim,withTrans,opacity0,transformed,
      sampleAnims:anims.slice(0,10)};
  });
  // screenshot above the fold in reduced mode
  await page.screenshot({path:ROOT+'/screens/home-1440-reduced-'+(reduce?'on':'off')+'.png'});
  await ctx.close();return r;
};
const motionOff=await mkMotion(false);
const motionOn=await mkMotion(true);
console.log('MOTION no-preference:',JSON.stringify(motionOff));
console.log('MOTION reduce      :',JSON.stringify(motionOn));

fs.writeFileSync(ROOT+'/raw/deep.json',JSON.stringify({pages:out,motion:{noPreference:motionOff,reduce:motionOn}},null,1));
console.log('DONE');
await browser.close();
