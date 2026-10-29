/* Coveworks · Atelier edition · shared behaviour (each block only runs on pages that have its elements) */
(function(){
'use strict';
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var LIVE = 'https://gensynx.github.io/Websitemaker/';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
var smooth = reduce ? 'auto' : 'smooth';

/* ============ entrance, clock, year ============ */
requestAnimationFrame(function(){ requestAnimationFrame(function(){ document.documentElement.classList.add('ready'); }); });
function clock(){
  var d = new Date(), c = $('clock');
  if (c){
    try { c.textContent = 'London · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }); }
    catch(e) { c.textContent = 'London'; }
  }
  document.querySelectorAll('.year').forEach(function(y){ y.textContent = d.getFullYear(); });
}
clock(); setInterval(clock, 15000);

/* ============ header + phone menu ============ */
var header = $('top'), lastY = 0;
function onHeader(y){
  if (document.documentElement.classList.contains('menu-open')) return;
  if (y > 400 && y > lastY + 6) header.classList.add('hide');
  else if (y < lastY - 6 || y < 400) header.classList.remove('hide');
  lastY = y;
}
var burger = $('burger');
if (burger){
  burger.addEventListener('click', function(){
    var open = !document.documentElement.classList.contains('menu-open');
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && document.documentElement.classList.contains('menu-open')) burger.click();
  });
}

/* ============ tape measure ============ */
var CM = 40, tapeTicks = $('tapeTicks'), tapeNums = $('tapeNums'), tapeRead = $('tapeRead'), numPool = [];
function drawTape(y){
  if (!tapeTicks || !tapeTicks.offsetParent) return;
  var vh = window.innerHeight;
  tapeTicks.style.backgroundPosition = 'right 0 top ' + (-(y % CM)) + 'px';
  var first = Math.floor(y / CM), last = Math.ceil((y + vh) / CM), k = 0;
  for (var c = first; c <= last; c++){
    if (c <= 0) continue;
    var el = numPool[k] || (numPool[k] = tapeNums.appendChild(document.createElement('span')));
    el.className = 'n' + (c % 10 === 0 ? ' big' : '');
    el.style.top = (c * CM - y) + 'px';
    el.textContent = c % 5 === 0 ? c : '';
    el.style.display = '';
    k++;
  }
  for (; k < numPool.length; k++) numPool[k].style.display = 'none';
  tapeRead.textContent = ((y + vh / 2) / CM).toFixed(1) + ' cm';
}

/* ============ reveals + counters ============ */
var io = new IntersectionObserver(function(es){
  es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-rise],.stitch').forEach(function(el){ io.observe(el); });
var cio = new IntersectionObserver(function(es){
  es.forEach(function(en){
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    var el = en.target, to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || to === 0){ el.textContent = to; return; }
    var t0 = performance.now();
    (function tick(now){
      var p = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(e * to);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

/* ============ work index ============ */
var WORKS = [
  { t: 'Vassallo Developments', tag: 'Property · Brand site · Film', img: 'vassallo', link: LIVE + 'vassallo/',
    d: 'A brand site for Vassallo Developments, who acquire, redesign and rebuild homes worth living in. It opens on a renovation film that walks into a derelict house and back out as every room rebuilds itself around the camera, and carries a 3D door and window configurator for their trade customers.' },
  { t: 'Dar Ul Amir', tag: 'Commerce · Art direction · Motion', img: 'dar', link: LIVE,
    d: 'The storefront of darulamir.com, House of the Prince: a thobe atelier and perfumery based in the United Kingdom, shipping worldwide. Four Emirati thobes in sizes 52 to 62 and fourteen perfumes with live pricing, beneath a scroll driven palace intro and a sky of gold dust.' },
  { t: 'Nuisance 1989', tag: 'Streetwear · Twelve page storefront', img: 'nuisance', link: LIVE + 'nuisance-1989/',
    d: 'A twelve page storefront for a London streetwear label: drops, the cut, lookbook, archive and a page for every piece, built on a two skin design system where each plate can be inverted to reveal its second colourway.' },
  { t: '381 Accountants', tag: 'Accountancy · Three editions', img: 'acc381', link: LIVE + '381-accountants/',
    d: 'Three complete editions for a Canary Wharf accountancy firm trusted by London businesses since 2010: a twelve page standard site, a dark premium edition with a fee calculator and deadline countdown, and a calm typographic Ledger edition with a deadline finder.' },
  { t: 'House of Autos', tag: 'Car hire · Booking', img: 'autos', link: LIVE + 'house-of-autos/',
    d: 'The keys to London’s finest drives: a private collection of performance cars for self drive hire, prepared to house standards and handed over anywhere in London. WhatsApp booking, a live fleet ticker and a night blue and gold identity.' },
  { t: 'Mobile Mechanic Romford', tag: 'Local service · Two designs', img: 'mechanic', link: LIVE + 'mobile-mechanic-romford/',
    d: 'A site for Farhan, the mobile mechanic who comes to your driveway across Romford and East London. Delivered as two complete designs to choose from, each a single self contained file.' },
  { t: 'London Classic Aesthetics', tag: 'Clinic · Twenty four pages', img: 'lca', link: LIVE + 'london-classic-aesthetics/',
    d: 'A full redesign of londonclassicaesthetics.com: twenty four pages covering six treatments, twelve training courses, about, become a model and contact, in an ivory, ink and champagne system set in Marcellus and Jost.' },
  { t: 'London’s Aesthetics Academy', tag: 'Training · Editorial', img: 'academy', link: null,
    d: 'A luxury single page redesign of londonsaestheticsacademy.co.uk: warm ivory, espresso ink and champagne gold with Playfair Display. Boutique, trustworthy and built to convert.' }
];
function imgSrc(k){ return 'assets/img/' + k + '.webp'; }
var wList = $('wList'), hov = null, hovImg = null, hx = 0, hy = 0, tx = 0, ty = 0, hovOn = false;
if (wList){
  var limit = parseInt(wList.getAttribute('data-limit') || '0', 10) || WORKS.length;
  WORKS.slice(0, limit).forEach(function(w, i){
    var row = document.createElement('div');
    row.className = 'w-row';
    var id = 'w' + i;
    row.innerHTML =
      '<button class="w-btn" aria-expanded="false" aria-controls="' + id + '" data-img="' + w.img + '">' +
        '<span class="no">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="nm">' + esc(w.t) + '</span>' +
        '<span class="tg">' + esc(w.tag) + '</span>' +
        '<span class="st' + (w.link ? ' live' : '') + '">' + (w.link ? 'Live' : 'Preview') + '</span>' +
        '<span class="pl" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="w-body" id="' + id + '"><div><div class="w-inner">' +
        '<div class="frame"><img src="' + imgSrc(w.img) + '" alt="The ' + esc(w.t) + ' website" loading="lazy"></div>' +
        '<div><p class="tags">' + esc(w.tag) + '</p><p>' + esc(w.d) + '</p>' +
        (w.link ? '<a class="btn" href="' + w.link + '" target="_blank" rel="noopener"><span>Visit the live site</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg></a>'
                : '<p class="note">Private preview · goes live with the client</p>') +
        '</div></div></div></div>';
    wList.appendChild(row);
  });
  if (wList.hasAttribute('data-next')){
    var nextRow = document.createElement('div');
    nextRow.className = 'w-row next';
    nextRow.innerHTML = '<a class="w-btn" href="fitting-room.html"><span class="no">' + String(WORKS.length + 1).padStart(2, '0') + '</span><span class="nm">Your name, <em>next.</em></span><span class="tg">Begin with a fitting</span><span class="st">Reserved</span><span class="pl" aria-hidden="true"></span></a>';
    wList.appendChild(nextRow);
  }
  wList.addEventListener('click', function(e){
    var b = e.target.closest('button.w-btn');
    if (!b) return;
    var row = b.parentNode, open = !row.classList.contains('open');
    wList.querySelectorAll('.w-row.open').forEach(function(r){ if (r !== row){ r.classList.remove('open'); r.querySelector('.w-btn').setAttribute('aria-expanded', 'false'); } });
    row.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open);
    if (hov) hov.classList.remove('on');
  });
  if (fine && !reduce){
    hov = document.createElement('div');
    hov.className = 'hov'; hov.setAttribute('aria-hidden', 'true');
    hov.innerHTML = '<div class="frame"><img alt=""></div>';
    document.body.appendChild(hov);
    hovImg = hov.querySelector('img');
    wList.addEventListener('pointermove', function(e){
      tx = e.clientX + 28; ty = e.clientY - 105;
      var b = e.target.closest('button.w-btn');
      var show = b && !b.parentNode.classList.contains('open');
      if (show){
        var src = imgSrc(b.getAttribute('data-img'));
        if (hovImg.getAttribute('src') !== src) hovImg.setAttribute('src', src);
        if (!hovOn){ hx = tx; hy = ty; }
      }
      hovOn = !!show;
      hov.classList.toggle('on', hovOn);
    });
    wList.addEventListener('pointerleave', function(){ hovOn = false; hov.classList.remove('on'); });
    (function hovLoop(){
      if (hovOn){
        hx += (tx - hx) * .16; hy += (ty - hy) * .16;
        hov.style.transform = 'translate(' + Math.min(hx, window.innerWidth - 350).toFixed(1) + 'px,' + hy.toFixed(1) + 'px)';
      }
      requestAnimationFrame(hovLoop);
    })();
  }
}

/* the fitting room lives in fitting.js */

/* ============ contact form ============ */
var cForm = $('cForm');
if (cForm) cForm.addEventListener('submit', function(e){
  e.preventDefault();
  var ok = true;
  ['cName', 'cEmail', 'cMsg'].forEach(function(id){
    var el = $(id), v = el.value.trim();
    var good = v !== '' && (id !== 'cEmail' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
    el.parentNode.classList.toggle('bad', !good);
    if (!good) ok = false;
  });
  if (!ok){ $('cOk').textContent = 'A field needs another look'; return; }
  var n = $('cName').value.trim(), em = $('cEmail').value.trim(), msg = $('cMsg').value.trim();
  window.location.href = 'mailto:hello@coveworks.studio?subject=' + encodeURIComponent('Project enquiry · ' + n) + '&body=' + encodeURIComponent(msg + '\n\n· ' + n + '\n· ' + em);
  $('cOk').textContent = 'Your email app has opened · hit send to finish';
});

/* ============ scroll loop ============ */
var ticking = false;
function frame(){ ticking = false; var y = window.scrollY; onHeader(y); drawTape(y); }
window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }, { passive: true });
window.addEventListener('resize', function(){ drawTape(window.scrollY); }, { passive: true });
frame();
})();
