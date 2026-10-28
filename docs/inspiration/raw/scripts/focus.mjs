import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch({headless:true});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto('https://revolearn.co.uk/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{
  const toRGB=s=>{const m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;const q=m[1].split(',').map(parseFloat);return[q[0],q[1],q[2]];};
  const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);};
  const ratio=(a,c)=>{const L=lum(a),M=lum(c);return +(((Math.max(L,M)+0.05)/(Math.min(L,M)+0.05))).toFixed(2);};
  const out=[];
  const els=[...document.querySelectorAll('a[href],button')].filter(e=>{const x=e.getBoundingClientRect();return x.width>0&&x.height>0;});
  for(const el of els.slice(0,40)){
    el.focus();
    const cs=getComputedStyle(el);
    let n=el.parentElement,bg='';
    while(n){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)/.test(c)){bg=c;break;}n=n.parentElement;}
    const oc=toRGB(cs.outlineColor),bc=toRGB(bg);
    out.push({txt:(el.textContent||'').trim().slice(0,26),style:cs.outlineStyle,w:cs.outlineWidth,
      col:cs.outlineColor,bg,ratio:(oc&&bc)?ratio(oc,bc):null,shadow:cs.boxShadow.slice(0,30)});
  }
  const uniq=[];const seen=new Set();
  for(const o of out){const k=o.col+o.bg+o.w+o.style;if(seen.has(k))continue;seen.add(k);uniq.push(o);}
  return uniq;
});
for(const x of r) console.log(String(x.ratio).padStart(6)+':1  '+x.w.padEnd(5)+' '+x.style.padEnd(7)+' ring='+x.col.padEnd(22)+' on '+String(x.bg).padEnd(24)+' "'+x.txt+'"');
await b.close();
