/* Coveworks · Lab edition · shared behaviour (each block only runs on pages that have its elements) */
(function(){
'use strict';
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
var smooth = reduce ? 'auto' : 'smooth';

/* ============ entrance, clock, year ============ */
requestAnimationFrame(function(){ requestAnimationFrame(function(){ document.documentElement.classList.add('ready'); }); });

/* dot matrix headline powers up character by character, in a random order */
(function(){
  var h = document.querySelector('#hero h1');
  if (!h) return;
  var chars = [];
  h.querySelectorAll('.ln').forEach(function(ln){
    var nodes = Array.prototype.slice.call(ln.childNodes), word = null;
    ln.textContent = '';
    nodes.forEach(function(n){
      var text = n.textContent, cls = n.nodeType === 1 ? n.className : '';
      for (var i = 0; i < text.length; i++){
        var c = document.createElement('span');
        c.className = 'ch' + (cls ? ' ' + cls : '');
        c.textContent = text[i];
        if (text[i] === ' '){ c.style.width = '.3em'; ln.appendChild(c); word = null; }
        else {
          /* letters of one word share a wrapper, so a line can only break at a space, never inside MEASURE */
          if (!word){ word = document.createElement('span'); word.className = 'wd'; ln.appendChild(word); }
          word.appendChild(c);
        }
        chars.push(c);
      }
    });
  });
  if (reduce){ h.classList.add('on'); return; }
  var order = chars.map(function(c, i){ return i; }).sort(function(){ return Math.random() - .5; });
  order.forEach(function(idx, k){ setTimeout(function(){ chars[idx].style.opacity = '1'; }, 120 + k * 22 + Math.random() * 60); });
  setTimeout(function(){ h.classList.add('on'); }, 160 + order.length * 22 + 120);
})();
function clock(){
  var d = new Date(), c = $('clock');
  if (c){
    try { c.textContent = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }); }
    catch(e) { c.textContent = ''; }
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
  var max = Math.max(1, document.documentElement.scrollHeight - vh);
  tapeRead.textContent = String(Math.round(Math.min(1, y / max) * 100)).padStart(3, '0') + '%';
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
/* the portfolio comes from sitegen/work.json, written into the page by build.py */
var WORKS = (window.WORKS || []).map(function(w){ return { t: w.title, tag: w.tag, img: w.image, link: w.link, d: w.text }; });
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
    nextRow.innerHTML = '<a class="w-btn" href="configurator.html"><span class="no">' + String(WORKS.length + 1).padStart(2, '0') + '</span><span class="nm">Your name, <em>next.</em></span><span class="tg">Start in the configurator</span><span class="st">Reserved</span><span class="pl" aria-hidden="true"></span></a>';
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

/* ============ leads ============ */
/* Posts an enquiry to api/lead.php, which saves it and emails the studio. Resolves with { id },
   rejects with { error, field } so the caller can fall back to the visitor's own email app. */
var opened = Date.now();
window.cwLead = function(lead){
  lead.t = Date.now() - opened;
  return fetch('api/lead.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
    .then(function(r){ return r.json(); })
    .then(function(d){ if (!d || !d.ok) throw d || {}; return d; });
};

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
  var btn = cForm.querySelector('button[type=submit]');
  btn.disabled = true;
  $('cOk').textContent = 'Sending';
  window.cwLead({ kind: 'contact', name: n, email: em, message: msg, website: $('cWeb').value }).then(function(d){
    cForm.innerHTML = '<p class="lead-done"><span class="led ok"></span><b>Sent.</b> Thank you, ' + esc(n) + '. Your message is with us as ' + esc(d.id) + ' and we will reply to ' + esc(em) + ' within a day.</p>';
  }, function(){
    /* the server could not take it: open the visitor's own email app with the message written */
    btn.disabled = false;
    window.location.href = 'mailto:sales@coveworks.tech?subject=' + encodeURIComponent('Project enquiry · ' + n) + '&body=' + encodeURIComponent(msg + '\n\n· ' + n + '\n· ' + em);
    $('cOk').textContent = 'Your email app has opened · hit send to finish';
  });
});

/* ============ live previews ============ */
/* Each .live-frame holds a full page preview in an iframe, drawn at desktop or phone width and scaled to fit. */
var lives = document.querySelectorAll('.live-frame');
function fitLives(){
  lives.forEach(function(box){
    var f = box.querySelector('iframe'), w = box.clientWidth, phone = w < 560;
    var fw = phone ? 390 : 1280, fh = phone ? 760 : 800, k = Math.min(1, w / fw);
    f.style.width = fw + 'px'; f.style.height = fh + 'px';
    f.style.transform = 'scale(' + k + ')';
    f.style.left = Math.max(0, (w - fw * k) / 2) + 'px';
    box.style.height = Math.round(fh * k) + 'px';
  });
}
if (lives.length){ fitLives(); window.addEventListener('resize', fitLives, { passive: true }); }

/* ============ scroll loop ============ */
var ticking = false;
function frame(){ ticking = false; var y = window.scrollY; onHeader(y); drawTape(y); }
window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }, { passive: true });
window.addEventListener('resize', function(){ drawTape(window.scrollY); }, { passive: true });
frame();
})();
