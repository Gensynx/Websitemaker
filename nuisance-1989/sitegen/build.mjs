/* ============================================================
   NUISANCE 1989 — site generator
   Run: node sitegen/build.mjs   (from the nuisance-1989 folder)
   Emits every page plus assets/data.js. Generated HTML is
   committed, so hosting needs no build step — same pattern as
   the other client folders in this repo.
   ============================================================ */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p, s) => { mkdirSync(dirname(join(ROOT, p)), { recursive: true }); writeFileSync(join(ROOT, p), s); };

/* ---------------- data ---------------- */
const SIZES = ["S", "M", "L", "XL", "XXL"];

const PRODUCTS = [
  { no:"I", slug:"heavyweight-tee-bone", sku:"NSC-T03-BN", name:"Heavyweight Tee", colour:"Bone",
    price:85, shape:"tee", cloth:"bone", gsm:"380 GSM", fit:"Boxy, drop shoulder",
    photo:"tee-bone-back.jpg", stock:{S:6,M:11,L:0,XL:7,XXL:3},
    lede:"The piece the label was built around. Garment-dyed in one bath, so no two runs match exactly.",
    body:"Cut from 380 GSM ring-spun cotton and dyed after making up, which is why the bone sits warm rather than optical white and why it will keep softening without losing its shape. The wordmark is printed high on the back in water-based discharge, so the ink sits in the cloth instead of on top of it." },
  { no:"II", slug:"heavyweight-tee-asphalt", sku:"NSC-T03-AS", name:"Heavyweight Tee", colour:"Asphalt",
    price:85, shape:"tee", cloth:"asphalt", gsm:"380 GSM", fit:"Boxy, drop shoulder",
    photo:"tee-asphalt-back.jpg", stock:{S:4,M:9,L:12,XL:5,XXL:2},
    lede:"The same pattern and the same cloth as the bone, dyed the other way.",
    body:"Black garment dye on heavyweight cotton settles slightly warm rather than dead neutral, and the print reverses to bone. Everything else is identical: same 380 GSM body, same drop shoulder, same twin-needle hems." },
  { no:"III", slug:"arch-hoodie-bone", sku:"NSC-H03-BN", name:"Arch Hoodie", colour:"Bone",
    price:165, shape:"hoodie", cloth:"bone", gsm:"450 GSM", fit:"Oversized",
    photo:"hoodie-bone-back.jpg", stock:{S:2,M:3,L:2,XL:0,XXL:0},
    lede:"450 GSM brushed-back loopback. Heavy enough to stand up on its own.",
    body:"A loopback hoodie in the same boxy line as the tee, with a two-panel hood, thick ribbed cuffs and hem, and no pouch seam across the print. Between sizes, take the smaller: the loopback relaxes about a centimetre through the body after the first wash." },
  { no:"IV", slug:"arch-hoodie-asphalt", sku:"NSC-H03-AS", name:"Arch Hoodie", colour:"Asphalt",
    price:165, shape:"hoodie", cloth:"asphalt", gsm:"450 GSM", fit:"Oversized",
    photo:"hoodie-asphalt-back.jpg", stock:{S:5,M:8,L:9,XL:4,XXL:1},
    lede:"The hoodie in black, print reversed to bone.",
    body:"Same 450 GSM loopback, same pattern, dyed black. The most forgiving piece in the drop and the one that sells first every time." },
  { no:"V", slug:"ring-short", sku:"NSC-S03-RG", name:"Ring Short", colour:"Glove Red",
    price:95, shape:"shorts", cloth:"ring", gsm:"Satin", fit:"Gym cut",
    photo:"", stock:{S:0,M:0,L:0,XL:0,XXL:0},
    lede:"Cut off a boxing short pattern, in the red the gloves were.",
    body:"Satin, side-vented, elasticated waist with a flat drawcord, and the wordmark small on the left leg. The most literal reference to where the label started and the fastest thing to go in Drop 03." },
  { no:"VI", slug:"plate-cap", sku:"NSC-C03-PL", name:"Plate Cap", colour:"Plate Yellow",
    price:45, shape:"cap", cloth:"plate", gsm:"6 panel", fit:"One size",
    photo:"", stock:{L:24}, onesize:true,
    lede:"Six panel, in the exact yellow of a UK rear plate.",
    body:"Unstructured six panel in a heavy cotton twill, embroidered rather than printed, with a brass slider at the back. The yellow is matched to a reflective registration plate, which is where the whole palette came from." }
];

const total = p => Object.values(p.stock).reduce((a, b) => a + b, 0);

const NAV = [
  { href:"drop.html", label:"Drop 03" },
  { href:"cut.html", label:"The Cut" },
  { href:"story.html", label:"1989" },
  { href:"lookbook.html", label:"Lookbook" },
  { href:"archive.html", label:"Archive" },
  { href:"contact.html", label:"Contact" }
];

const SIZETABLE = [["S",54,68,21,52],["M",57,71,22,55],["L",60,74,23,58],["XL",63,76,24,61],["XXL",66,78,25,64]];

/* ---------------- shell ---------------- */
const shell = ({ title, desc, current = "", body, cls = "" }) => `<!doctype html>
<html lang="en-GB" data-skin="asphalt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0B0A09">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,700;1,6..96,400&family=Archivo:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap">
<link rel="stylesheet" href="assets/site.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%230B0A09'/><text x='16' y='23' font-size='20' font-family='Georgia,serif' fill='%23F2CB05' text-anchor='middle'>N</text></svg>">
<script>/* Set the skin before first paint so the page never flashes the other one.
   ?skin=paper wins over the stored choice and is then remembered, so a skin
   can be shared as a link rather than only toggled in the viewer's own browser. */
(function(){try{var q=new URLSearchParams(location.search).get("skin");
var s=(q==="paper"||q==="asphalt")?q:localStorage.getItem("nsc-skin");
if(s==="paper"||s==="asphalt"){document.documentElement.setAttribute("data-skin",s);
if(q)localStorage.setItem("nsc-skin",s);}}catch(e){}})();</script>
</head>
<body${cls ? ` class="${cls}"` : ""}>
<a class="skip" href="#main">Skip to content</a>

<div class="ticker" aria-hidden="true"><div class="ticker__t">${
  Array(2).fill('<span>Drop 03 — Marina — Friday 20:00 UK</span><span>·</span><span>No restocks</span><span>·</span><span>Free UK delivery over £100</span><span>·</span><span>380 GSM garment dyed</span><span>·</span>').join("")
}</div></div>

<header class="mast">
  <div class="wrap mast__in">
    <a class="mast__id" href="index.html">Nuisance <sup>1989</sup></a>
    <nav class="mast__nav" aria-label="Primary">
      ${NAV.map(n => `<a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${n.label}</a>`).join("\n      ")}
    </nav>
    <button class="bag" id="bagBtn" aria-label="Open bag">Bag <span class="bag__n" id="bagN" data-empty="1">0</span></button>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot__g">
      <div>
        <p class="foot__mark">Nuisance</p>
        <span class="plate plate--sm">1989</span>
        <p style="color:var(--mute);font-size:.875rem;max-width:32ch;margin-top:1rem">Exclusive pieces only. Streetwear redefined. London W10.</p>
      </div>
      <div><h3>Shop</h3><ul>
        <li><a href="drop.html">Drop 03 — Marina</a></li>
        ${PRODUCTS.slice(0, 4).map(p => `<li><a href="piece-${p.slug}.html">${p.name} — ${p.colour}</a></li>`).join("\n        ")}
      </ul></div>
      <div><h3>Help</h3><ul>
        <li><a href="cut.html">Size guide</a></li>
        <li><a href="contact.html">Delivery &amp; returns</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul></div>
      <div><h3>More</h3><ul>
        <li><a href="story.html">1989</a></li>
        <li><a href="lookbook.html">Lookbook</a></li>
        <li><a href="https://www.instagram.com/nuisance1989/" rel="noopener">Instagram</a></li>
      </ul></div>
    </div>
    <div class="foot__bar">
      <span>&copy; 1989–2026 Nuisance Clothing Ltd</span>
      <span class="skin" role="group" aria-label="Colour scheme">
        <button type="button" data-skin-btn="asphalt" aria-pressed="true">Asphalt</button>
        <button type="button" data-skin-btn="paper" aria-pressed="false">Paper</button>
      </span>
      <span>Free UK delivery over £100</span>
    </div>
  </div>
</footer>

<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="drawer" aria-label="Shopping bag" aria-hidden="true">
  <div class="drawer__h"><h2>Your bag</h2><button id="closeBag" class="mono" style="color:var(--ink)">Close &times;</button></div>
  <div class="drawer__b" id="bagBody"></div>
  <div class="drawer__f">
    <div class="total"><span>Subtotal</span><b id="subtotal">£0</b></div>
    <div class="total" style="color:var(--mute)"><span>Delivery</span><b id="ship">—</b></div>
    <button class="btn btn--fill" style="margin-top:.9rem" id="checkout"><span>Checkout</span><span>&rarr;</span></button>
  </div>
</aside>

<div class="mockbar">Design mock-up · <b>Nuisance 1989</b> · imagery and checkout are placeholders</div>
<script src="assets/data.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
`;

/* ---------------- fragments ---------------- */
const sizesFor = p => p.onesize
  ? `<button class="size" data-sku="${p.sku}" data-size="OS" aria-pressed="false">One size</button>`
  : SIZES.map(s => {
      const q = p.stock[s] || 0;
      return `<button class="size" data-sku="${p.sku}" data-size="${s}" aria-pressed="false"${q ? "" : " disabled"} aria-label="Size ${s}${q ? "" : ", sold out"}">${s}</button>`;
    }).join("");

const tagFor = p => {
  const n = total(p);
  if (!n) return '<span class="tag tag--out">Sold out</span>';
  return n <= 8 ? `<span class="tag tag--last">${n} left</span>` : '<span class="tag tag--new">New</span>';
};

const strip = `<div class="strip" aria-hidden="true"><div class="strip__t">${
  Array(2).fill('<span>Exclusive Pieces Only <i>— 1989 —</i></span><span>Streetwear Redefined <i>— W10 —</i></span>').join("")
}</div></div>`;

const sizeTable = `<div class="tw"><table>
  <caption>Measured flat, in centimetres. Allow &plusmn;1.5 cm on garment-dyed cloth. Model 186 cm wears Large.</caption>
  <thead><tr><th scope="col">Size</th><th scope="col">Chest</th><th scope="col">Length</th><th scope="col">Sleeve</th><th scope="col">Shoulder</th></tr></thead>
  <tbody>${SIZETABLE.map(r => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const SPEC = [
  ["Cloth", "380 GSM ring-spun cotton single jersey, garment-dyed in one bath, so no two runs match exactly."],
  ["Hoodie cloth", "450 GSM brushed-back loopback, 100% cotton."],
  ["Fit", "Boxy, drop shoulder. Body cut 4 cm wider than a standard tee — size down for a regular fit."],
  ["Collar", "2&times;2 rib with self-fabric taping across the back neck."],
  ["Hems", "Twin-needle at cuff and hem. Side-seamed, no tubular bodies."],
  ["Print", "Water-based discharge. 90 mm chest, 280 mm back."],
  ["Made", "Cut and sewn in Portugal. Dyed in Porto."],
  ["Care", "Cold wash, inside out, line dry. It will soften, it will not shrink out of shape."]
];
const specList = `<dl class="dl" style="margin-top:0">${SPEC.map(([k, v]) => `<div class="r"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

export { PRODUCTS, SIZES, NAV, shell, sizesFor, tagFor, strip, sizeTable, specList, total, out };

/* the plate: one garment, two colourways, shared by home and the archive */
const plate = () => `
<section class="plateview" id="plateview" data-inverted="0">
  <div class="plateview__f">
    <div class="layer layer--dark">
      <div class="layer__flat" data-shape="tee" data-cloth="asphalt"></div>
      <img src="images/tee-asphalt-back.jpg" alt="Heavyweight Tee in Asphalt, back print" onerror="this.remove()">
    </div>
    <div class="layer layer--light">
      <div class="layer__flat" data-shape="tee" data-cloth="bone"></div>
      <img src="images/tee-bone-back.jpg" alt="Heavyweight Tee in Bone, back print" onerror="this.remove()">
    </div>
    <div class="pvw">
      <div class="pvw__top"><span class="mono">Drop 03 · Marina</span></div>
      <div>
        <h1 class="pvw__mark">Nuisance</h1>
        <div class="pvw__bot">
          <span class="mono">Heavyweight Tee · 380 GSM<span class="cap-b"> · Bone / Asphalt</span></span>
          <span class="mono">Plate I of VI &nbsp;·&nbsp; £85</span>
        </div>
      </div>
    </div>
    <button class="swap" id="pvSwap" aria-pressed="false">Invert</button>
    <span class="hint" id="pvHint">Move across the plate to reveal the second colourway</span>
  </div>
</section>`;

/* the catalogue index, shared by the drop page and the archive */
const index = () => `
  <div class="idxwrap">
    <div class="idx" id="idx">
      ${PRODUCTS.map(p => {
        const n = total(p);
        const flagTxt = n === 0 ? ` · <span class="flag">Sold out</span>` : (n <= 8 ? ` · <span class="flag">${n} left</span>` : "");
        return `<div class="row${n ? "" : " row--gone"}" data-sku="${p.sku}" tabindex="0">
        <span class="row__no">${p.no}</span>
        <div>
          <h3 class="row__n"><a href="piece-${p.slug}.html">${p.name} &mdash; ${p.colour}</a></h3>
          <p class="row__m">${p.gsm} · ${p.sku}${flagTxt}</p>
          <div class="row__s">${sizesFor(p)}</div>
        </div>
        <div class="row__r">
          <span class="row__p">£${p.price}</span>
          <button class="mini" data-add="${p.sku}"${n ? "" : " disabled"}>${n ? "Add" : "Gone"}</button>
        </div></div>`;
      }).join("\n      ")}
    </div>
    <figure class="preview">
      <div class="preview__f" id="pvFrame"></div>
      <figcaption class="preview__c"><b id="pvName">${PRODUCTS[0].name}</b><span id="pvMeta">${PRODUCTS[0].colour} · ${PRODUCTS[0].gsm}</span></figcaption>
    </figure>
  </div>`;

/* ---------------- pages ---------------- */

/* home — opens on the plate, then the drop */
out("index.html", shell({
  title: "Nuisance 1989", current: "",
  desc: "Nuisance 1989 — heavyweight streetwear cut in limited drops. London W10, worn worldwide.",
  body: `
${plate()}

<section class="hero wrap">
  <div class="hero__g">
    <div>
      <div class="hero__eyebrow">
        <span class="plate plate--sm">Nuisance</span>
        <span class="plate plate--sm">1989</span>
        <span class="mono">London · W10</span>
      </div>
      <p class="hero__sub" style="margin-top:0"><span>Est. 1989</span><i></i><span>Drop 03 · Marina</span></p>
      <p class="hero__thesis">Cut heavy, dyed once, made in counts of two hundred. <b>Exclusive pieces only.</b></p>
      <a class="btn btn--auto" href="piece-heavyweight-tee-bone.html" style="margin-top:1.6rem"><span>Shop the tee</span><span>&rarr;</span></a>
    </div>
    <div class="clock">
      <div class="clock__h"><span class="mono">Drop 03 opens</span><span class="mono" style="color:var(--accent)">200 pieces</span></div>
      <div class="clock__d">
        <div class="clock__c"><b id="cd">00</b><span>Days</span></div>
        <div class="clock__c"><b id="ch">00</b><span>Hrs</span></div>
        <div class="clock__c"><b id="cm">00</b><span>Min</span></div>
        <div class="clock__c"><b id="cs">00</b><span>Sec</span></div>
      </div>
      <p class="clock__f"><strong>Friday, 20:00 UK.</strong> Six pieces, two hundred units total, sold once. The list gets in ten minutes early.</p>
      <a class="btn btn--fill" style="margin-top:1rem" href="drop.html"><span>See the drop</span><span>&rarr;</span></a>
    </div>
  </div>
</section>

${strip}

<section class="band wrap">
  <div class="phead">
    <div><span class="mono">Drop 03 · Marina · SS26</span><h2>Six pieces.<br>Two hundred units.</h2></div>
    <p>Every piece is cut, dyed and numbered in one run. When the run is gone it is gone — we do not restock, and we do not re-cut a colourway.</p>
  </div>
  <div class="grid">
    ${PRODUCTS.map(p => {
      const n = total(p);
      return `<article class="card">
      <a class="slot" data-slot="${p.sku}" href="piece-${p.slug}.html" aria-label="${p.name}, ${p.colour}"><span class="slot__tag">${tagFor(p)}</span></a>
      <div class="card__b">
        <div class="card__r"><h3 class="card__n"><a href="piece-${p.slug}.html">${p.name}</a></h3><span class="card__p">£${p.price}</span></div>
        <p class="card__m">${p.colour} · ${p.gsm} · ${p.sku}</p>
        <div class="sizes">${sizesFor(p)}</div>
        <button class="btn" data-add="${p.sku}"${n ? "" : " disabled"}><span>${n ? "Add to bag" : "Sold out"}</span><span>${n ? "+" : "—"}</span></button>
      </div></article>`;
    }).join("\n    ")}
  </div>
  <p class="mono" style="margin-top:1.2rem">Prices in GBP · Free UK delivery over £100 · DPD next day</p>
</section>

<section class="band wrap" style="padding-top:0">
  <div class="two">
    <div>
      <span class="mono">The name</span>
      <h2 class="serif" style="font-size:clamp(1.9rem,5vw,3.2rem);line-height:1.02;margin:.4rem 0 1.1rem">1989</h2>
      <div class="prose"><p>It started in a gym off Ladbroke Grove — a ring in the middle, a board on the ropes, no mirrors. Everyone in there had somewhere else to be by ten, and the clothes had to work for both.</p></div>
      <a class="btn btn--auto" href="story.html" style="margin-top:.4rem"><span>Read the note</span><span>&rarr;</span></a>
    </div>
    <dl class="stack">
      <div class="fact"><dt>Established</dt><dd>1989</dd></div>
      <div class="fact"><dt>Pieces per run</dt><dd>200</dd></div>
      <div class="fact"><dt>Restocks to date</dt><dd>0</dd></div>
      <div class="fact"><dt>Cloth weight</dt><dd>380 GSM</dd></div>
      <div class="fact"><dt>Shipped to</dt><dd>34 countries</dd></div>
    </dl>
  </div>
</section>`
}));

/* drop — the catalogue index */
out("drop.html", shell({
  title: "Drop 03 — Marina", current: "drop.html",
  desc: "Drop 03, Marina. Six pieces, two hundred units, catalogued in the order they were cut.",
  body: `
<section class="band wrap">
  <div class="phead">
    <div><span class="mono">Index · Drop 03</span><h1>Six entries</h1></div>
    <p>Catalogued in the order they were cut. Two hundred units across the run, numbered, not restocked.</p>
  </div>
  ${index()}
  <p class="mono" style="margin-top:1.2rem">Prices in GBP · Free UK delivery over £100 · DPD next day</p>
</section>`
}));

/* piece pages */
PRODUCTS.forEach((p, i) => {
  const n = total(p);
  const others = PRODUCTS.filter(o => o.sku !== p.sku).slice(0, 3);
  out(`piece-${p.slug}.html`, shell({
    title: `${p.name} — ${p.colour}`, current: "drop.html",
    desc: `${p.name} in ${p.colour}. ${p.gsm}, ${p.fit.toLowerCase()}. £${p.price}. Drop 03, Marina.`,
    body: `
<section class="band wrap">
  <p class="mono" style="margin:0 0 1.4rem"><a href="drop.html">Drop 03</a> &nbsp;/&nbsp; Entry ${p.no}</p>
  <div class="piece">
    <div class="piece__media">
      <div class="slot slot--soft" data-slot="${p.sku}"><span class="slot__tag">${tagFor(p)}</span></div>
    </div>
    <div class="piece__buy">
      <span class="mono">${p.sku}</span>
      <h1>${p.name} &mdash; ${p.colour}</h1>
      <p class="piece__price">£${p.price}</p>
      <p class="piece__lede">${p.lede}</p>
      <div class="pickline"><span class="mono">Size</span><a class="mono" href="cut.html" style="color:var(--ink)">Size guide &rarr;</a></div>
      <div class="sizes" style="margin-bottom:1.1rem">${sizesFor(p)}</div>
      <button class="btn btn--fill" data-add="${p.sku}"${n ? "" : " disabled"}><span>${n ? "Add to bag" : "Sold out"}</span><span>${n ? "+" : "—"}</span></button>
      <p class="mono" style="margin-top:.8rem">${n ? `${n} of 200 remaining in this run` : "This run is finished. There will be no restock."}</p>
      <div class="prose" style="margin-top:1.6rem"><p style="font-size:.9375rem">${p.body}</p></div>
      <dl class="dl">
        <div class="r"><dt>Cloth</dt><dd>${p.gsm}${p.shape === "tee" ? " ring-spun cotton single jersey, garment-dyed" : p.shape === "hoodie" ? " brushed-back loopback, 100% cotton" : ""}</dd></div>
        <div class="r"><dt>Fit</dt><dd>${p.fit}</dd></div>
        <div class="r"><dt>Colour</dt><dd>${p.colour}</dd></div>
        <div class="r"><dt>Made</dt><dd>Cut and sewn in Portugal. Dyed in Porto.</dd></div>
        <div class="r"><dt>Care</dt><dd>Cold wash, inside out, line dry.</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="band wrap" style="padding-top:0">
  <div class="phead"><div><span class="mono">Also in Drop 03</span><h2>Three more</h2></div></div>
  <div class="grid">
    ${others.map(o => {
      const m = total(o);
      return `<article class="card">
      <a class="slot" data-slot="${o.sku}" href="piece-${o.slug}.html" aria-label="${o.name}, ${o.colour}"><span class="slot__tag">${tagFor(o)}</span></a>
      <div class="card__b">
        <div class="card__r"><h3 class="card__n"><a href="piece-${o.slug}.html">${o.name}</a></h3><span class="card__p">£${o.price}</span></div>
        <p class="card__m">${o.colour} · ${o.gsm}</p>
        <div class="sizes">${sizesFor(o)}</div>
        <button class="btn" data-add="${o.sku}"${m ? "" : " disabled"}><span>${m ? "Add to bag" : "Sold out"}</span><span>${m ? "+" : "—"}</span></button>
      </div></article>`;
    }).join("\n    ")}
  </div>
</section>`
  }));
});

/* the cut — specification and sizing */
out("cut.html", shell({
  title: "The Cut", current: "cut.html",
  desc: "Fabric specification and published measurements for Nuisance 1989. Buy your size once.",
  body: `
<section class="band wrap">
  <div class="phead">
    <div><span class="mono">Specification</span><h1>The Cut</h1></div>
    <p>Nothing here is a blank with a print on it. The pattern is ours, the weight is deliberate, and the measurements are published so you can buy your size once.</p>
  </div>
  <div class="two">
    ${specList}
    <div>
      ${sizeTable}
      <p style="color:var(--mute);font-size:.875rem;margin-top:1.1rem;max-width:52ch">Between sizes on the hoodie, take the smaller — the 450 GSM loopback relaxes about a centimetre through the body after the first wash. On the tee, size down for a regular fit: the body is cut 4 cm wider than standard.</p>
      <a class="btn btn--auto" href="drop.html" style="margin-top:1.2rem"><span>Back to the drop</span><span>&rarr;</span></a>
    </div>
  </div>
</section>

${strip}

<section class="band wrap">
  <div class="phead"><div><span class="mono">How to measure</span><h2>Against a shirt you own</h2></div>
  <p>Lay a garment you already like flat, measure it, and match the numbers above. It beats guessing from a body measurement every time.</p></div>
  <div class="two">
    <dl class="dl" style="margin-top:0">
      <div class="r"><dt>Chest</dt><dd>Across the garment one centimetre below the armhole, seam to seam.</dd></div>
      <div class="r"><dt>Length</dt><dd>From the highest point of the shoulder straight down to the hem.</dd></div>
      <div class="r"><dt>Sleeve</dt><dd>From the shoulder seam to the cuff edge.</dd></div>
      <div class="r"><dt>Shoulder</dt><dd>Seam to seam across the back. On a drop shoulder this sits below the joint by design.</dd></div>
    </dl>
    <div class="prose">
      <p>Garment dyeing happens after the piece is made up, which is what gives the colour its depth and why two pieces from different runs will never match exactly. It also means a tolerance: allow about 1.5 cm either way on any measurement.</p>
      <p>If you are between two sizes and the piece is not listed as sold out in both, order the smaller. Returns are free within the UK for fourteen days, unworn, tags on.</p>
    </div>
  </div>
</section>`
}));

/* 1989 — the story */
out("story.html", shell({
  title: "1989", current: "story.html",
  desc: "Where Nuisance 1989 started: a gym off Ladbroke Grove, and what the brief has been ever since.",
  body: `
<section class="band wrap">
  <div class="phead"><div><span class="mono">Archive note</span><h1>1989</h1></div><p>Two postcodes, one wardrobe.</p></div>
  <div class="two">
    <div class="prose">
      <p class="lede">Nuisance was what they called us before it was what we called ourselves.</p>
      <p>It started in a gym off Ladbroke Grove — the kind with a ring in the middle, a board on the ropes and no mirrors. Everyone in there had somewhere else to be by ten. The clothes had to work for both: the session, and whatever came after it.</p>
      <p>That is still the brief. Heavy enough to hold its shape through a night out, plain enough that the only loud thing about it is the fact you own one. The wordmark is set in a Didone because the joke is worth making properly — a nuisance, engraved.</p>
      <p>Now it turns up in Business Bay as often as it does on the Grove. Same cloth, same two hundred pieces, same rule: if you missed it, you missed it.</p>
    </div>
    <div>
      <dl class="stack">
        <div class="fact"><dt>Established</dt><dd>1989</dd></div>
        <div class="fact"><dt>Pieces per run</dt><dd>200</dd></div>
        <div class="fact"><dt>Restocks to date</dt><dd>0</dd></div>
        <div class="fact"><dt>Cloth weight</dt><dd>380 GSM</dd></div>
        <div class="fact"><dt>Shipped to</dt><dd>34 countries</dd></div>
        <div class="fact"><dt>Drop 02 sold out in</dt><dd>4 min 12 s</dd></div>
      </dl>
      <a class="btn btn--auto" href="lookbook.html" style="margin-top:1.4rem"><span>See the plates</span><span>&rarr;</span></a>
    </div>
  </div>
</section>`
}));

/* lookbook */
const PLATES = [
  { f:"look-01.jpg", t:"Back print, Palm Jumeirah", m:"Drop 03 · Frame 04", shape:"tee", cloth:"bone" },
  { f:"tee-bone-back.jpg", t:"Heavyweight Tee, Bone", m:"Plate II · 380 GSM", shape:"tee", cloth:"bone" },
  { f:"tee-asphalt-back.jpg", t:"Heavyweight Tee, Asphalt", m:"Plate III · 380 GSM", shape:"tee", cloth:"asphalt" },
  { f:"look-02.jpg", t:"Flat lay, both colourways", m:"Drop 03 · Frame 09", shape:"hoodie", cloth:"bone", wide:true },
  { f:"look-03.jpg", t:"The ring, Ladbroke Grove", m:"Archive · 1989", shape:"hoodie", cloth:"asphalt", wide:true }
];
out("lookbook.html", shell({
  title: "Lookbook — Marina", current: "lookbook.html",
  desc: "Drop 03, Marina. Shot over two nights.",
  body: `
<section class="band wrap" style="padding-bottom:clamp(28px,4vw,52px)">
  <div class="phead"><div><span class="mono">Plates · Drop 03</span><h1>Marina</h1></div>
  <p>Shot over two nights. Scroll the rail. Slots are sized for the real photography and swap in on filename.</p></div>
</section>
<div class="rail">
  ${PLATES.map((p) => `<figure class="plate2${p.wide ? " plate2--wide" : ""}" style="margin:0">
    <div class="pl-flat" data-shape="${p.shape}" data-cloth="${p.cloth}"></div>
    <img src="images/${p.f}" alt="${p.t}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">
    <img class="blur" src="images/${p.f}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <figcaption class="plate2__c"><b>${p.t}</b><span>${p.m}</span></figcaption>
  </figure>`).join("\n  ")}
</div>
<section class="band wrap">
  <div class="two">
    <div class="prose"><p>Every slot on this page is sized for real photography. Product plates want 2000&nbsp;&times;&nbsp;2500, the wides 1600&nbsp;&times;&nbsp;1280. Until a file lands, the drawn flat behind it shows through, so the page never breaks halfway through a shoot.</p></div>
    <a class="btn btn--auto" href="drop.html" style="align-self:start"><span>Shop Drop 03</span><span>&rarr;</span></a>
  </div>
</section>`
}));

/* contact */
out("contact.html", shell({
  title: "Contact", current: "contact.html",
  desc: "Delivery, returns and how to reach Nuisance 1989.",
  body: `
<section class="band wrap">
  <div class="phead"><div><span class="mono">Reach us</span><h1>Contact</h1></div>
  <p>One inbox, answered inside a working day. Drop questions go to the same place.</p></div>
  <div class="two">
    <div>
      <form class="form" data-demo="Thanks — we will come back to you inside a working day." novalidate>
        <label class="mono" for="cname">Name</label>
        <div class="field"><input id="cname" name="name" type="text" autocomplete="name" placeholder="Your name" required></div>
        <label class="mono" for="cemail">Email</label>
        <div class="field"><input id="cemail" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@domain.com" required></div>
        <label class="mono" for="cmsg">Message</label>
        <div class="field"><textarea id="cmsg" name="message" placeholder="Order number if you have one"></textarea></div>
        <button class="btn btn--fill" type="submit"><span>Send</span><span>&rarr;</span></button>
        <p class="note" role="status"></p>
        <small>This form is a mock-up — wire it to a real inbox before launch.</small>
      </form>
    </div>
    <div>
      <dl class="dl" style="margin-top:0">
        <div class="r"><dt>Delivery UK</dt><dd>DPD next day. Free over £100, otherwise £4.95.</dd></div>
        <div class="r"><dt>Delivery world</dt><dd>DHL, 3–5 working days. Duties payable on receipt.</dd></div>
        <div class="r"><dt>Returns</dt><dd>Fourteen days, unworn, tags on. Free within the UK.</dd></div>
        <div class="r"><dt>Exchanges</dt><dd>Subject to the run. We cannot re-cut a sold-out size.</dd></div>
        <div class="r"><dt>Email</dt><dd>hello@nuisance1989.com</dd></div>
        <div class="r"><dt>Instagram</dt><dd><a href="https://www.instagram.com/nuisance1989/" rel="noopener" style="box-shadow:inset 0 -1px 0 currentColor">@nuisance1989</a></dd></div>
      </dl>
      <div style="border:var(--edge);padding:clamp(18px,2.4vw,26px);margin-top:1.6rem">
        <span class="mono">Early access</span>
        <h2 class="serif" style="font-size:1.5rem;margin:.4rem 0 .6rem">The List</h2>
        <p style="color:var(--mute);font-size:.9rem;margin:0 0 1rem">Ten minutes before everyone else, and the only place the size run gets posted before it goes live.</p>
        <form class="form" data-demo="You are on the list. Drop 03 opens to you at 19:50 Friday." novalidate>
          <div class="field">
            <input id="listEmail" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@domain.com" required aria-label="Email address">
            <button type="submit">Join</button>
          </div>
          <p class="note" role="status"></p>
        </form>
      </div>
    </div>
  </div>
</section>`
}));

/* archive — the single-page edition. Same shell, same shop, same data:
   the plate, the index, the plates rail and the note in one scroll. */
out("archive.html", shell({
  title: "The Archive", current: "archive.html",
  desc: "Nuisance 1989 on one page — the plate, the index, the plates and the note.",
  body: `
${plate()}

<section class="band wrap">
  <div class="phead">
    <div><span class="mono">Index · Drop 03</span><h2>Six entries</h2></div>
    <p>Catalogued in the order they were cut. Two hundred units across the run, numbered, not restocked. Everything here adds to the same bag as the shop.</p>
  </div>
  ${index()}
  <p class="mono" style="margin-top:1.2rem">Prices in GBP · Free UK delivery over £100 · DPD next day</p>
</section>

${strip}

<section class="band wrap" style="padding-bottom:clamp(24px,3.4vw,44px)">
  <div class="phead"><div><span class="mono">Plates · Drop 03</span><h2>Marina</h2></div>
  <p>Shot over two nights. Scroll the rail.</p></div>
</section>
<div class="rail">
  ${PLATES.map(pl => `<figure class="plate2${pl.wide ? " plate2--wide" : ""}" style="margin:0">
    <div class="pl-flat" data-shape="${pl.shape}" data-cloth="${pl.cloth}"></div>
    <img src="images/${pl.f}" alt="${pl.t}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">
    <img class="blur" src="images/${pl.f}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <figcaption class="plate2__c"><b>${pl.t}</b><span>${pl.m}</span></figcaption>
  </figure>`).join("\n  ")}
</div>

<section class="band wrap">
  <div class="phead"><div><span class="mono">Specification</span><h2>The Cut</h2></div>
  <p>Published so you buy your size once. Measured flat, in centimetres.</p></div>
  <div class="two">
    ${specList}
    <div>${sizeTable}
      <a class="btn btn--auto" href="cut.html" style="margin-top:1.2rem"><span>Full size guide</span><span>&rarr;</span></a>
    </div>
  </div>
</section>

<section class="band wrap" style="padding-top:0">
  <div class="phead"><div><span class="mono">Archive note</span><h2>1989</h2></div><p>Two postcodes, one wardrobe.</p></div>
  <div class="two">
    <div class="prose">
      <p class="lede">Nuisance was what they called us before it was what we called ourselves.</p>
      <p>It started in a gym off Ladbroke Grove — the kind with a ring in the middle, a board on the ropes and no mirrors. Everyone in there had somewhere else to be by ten. The clothes had to work for both.</p>
      <p>That is still the brief. Heavy enough to hold its shape through a night out, plain enough that the only loud thing about it is the fact you own one.</p>
      <a class="btn btn--auto" href="story.html"><span>Read the full note</span><span>&rarr;</span></a>
    </div>
    <dl class="stack">
      <div class="fact"><dt>Established</dt><dd>1989</dd></div>
      <div class="fact"><dt>Pieces per run</dt><dd>200</dd></div>
      <div class="fact"><dt>Restocks to date</dt><dd>0</dd></div>
      <div class="fact"><dt>Cloth weight</dt><dd>380 GSM</dd></div>
      <div class="fact"><dt>Shipped to</dt><dd>34 countries</dd></div>
      <div class="fact"><dt>Drop 02 sold out in</dt><dd>4 min 12 s</dd></div>
    </dl>
  </div>
</section>`
}));

/* data for the client side — one source of truth with these templates */
out("assets/data.js", "window.NSC_PRODUCTS = " + JSON.stringify(
  PRODUCTS.map(p => ({ sku:p.sku, slug:p.slug, name:p.name, colour:p.colour, price:p.price,
    shape:p.shape, cloth:p.cloth, gsm:p.gsm, photo:p.photo, onesize:!!p.onesize, stock:p.stock })), null, 1) + ";\n");

console.log(`built ${PRODUCTS.length + 7} pages + assets/data.js`);
