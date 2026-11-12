/* Coveworks · Lab · the configurator
   Behaviour only: reading a brief or an existing website, state, the share link, rendering the preview,
   sending the build as a lead, and wiring the controls. On preview.html there are no controls: the same
   code renders the shared build full page.
   The content it works from (site types, looks, colours, vocabulary) is in assets/fitting-data.js.
   A brief that names no known type still builds: the "custom" type is written around the words it was given. */
(function(){
'use strict';
var pvSite = document.getElementById('pvSite');
if (!pvSite) return;
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var smooth = reduce ? 'auto' : 'smooth';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
var UI = !!$('fType');   /* the configurator; false on preview.html, which only renders */
function okUrl(u){ return typeof u === 'string' && /^https:\/\/[^\s"'<>]{4,400}$/.test(u); }
function okHex(c){ return typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c); }
/* a photo from our own set, or one from the visitor's own site (which falls back to ours if it will not load) */
function img(id, cls, alt, fallback){
  var own = okUrl(id);
  return '<span class="x-ph' + (cls ? ' ' + cls : '') + '"><img src="' + (own ? esc(id) : 'assets/gen/' + id + '.webp') + '" alt="' + esc(alt || '') + '" decoding="async"' +
    (own ? ' referrerpolicy="no-referrer"' + (fallback ? ' onerror="this.onerror=null;this.src=\'assets/gen/' + fallback + '.webp\'"' : '') : '') + '></span>';
}


/* ============ content, from fitting-data.js ============ */
var FIT = window.FIT;
var TYPES = FIT.TYPES, BLOCKS = FIT.BLOCKS, LOOKS = FIT.LOOKS, DARK = FIT.DARK, LAYOUTS = FIT.LAYOUTS, ACCENTS = FIT.ACCENTS,
  LOOK_WORDS = FIT.LOOK_WORDS, COLOUR_WORDS = FIT.COLOUR_WORDS, LAYOUT_WORDS = FIT.LAYOUT_WORDS, FILLER = FIT.FILLER;

/* ============ reading a plain words brief ============ */
function lev(a, b){
  if (a === b) return 0;
  var prev = [], cur, i, j;
  for (j = 0; j <= b.length; j++) prev[j] = j;
  for (i = 1; i <= a.length; i++){
    cur = [i];
    for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
/* how well one keyword matches the brief: exact word, a longer form of it (photographer, minimalist),
   or a near spelling (resturant). Keywords padded with spaces must match exactly as written. */
function hit(kw, t, ws, loose){
  if (/^\s|\s$/.test(kw) || kw.indexOf(' ') > -1) return t.indexOf(kw) > -1 ? kw.trim().length + 1 : 0;
  var best = 0;
  ws.forEach(function(w){
    if (w === kw || w === kw + 's' || w === kw + 'es'){ best = Math.max(best, kw.length + 1); return; }
    if (w.indexOf(kw) === 0 && (kw.length >= 4 || w.length <= kw.length + 1)){ best = Math.max(best, kw.length); return; }
    if (kw.length < 5 || w.length < 4) return;
    var tol = (kw.length >= 8 ? 2 : 1) + (loose ? 1 : 0);
    if (Math.abs(w.length - kw.length) <= tol && lev(w, kw) <= tol) best = Math.max(best, kw.length - 1);
    else if (loose && w.length > kw.length && lev(w.slice(0, kw.length), kw) <= tol) best = Math.max(best, kw.length - 2);
  });
  return best;
}
function scoreTypes(t, ws, loose){
  return Object.keys(TYPES).map(function(k){
    var score = 0;
    TYPES[k].kw.forEach(function(w){ score += hit(w, t, ws, loose); });
    return [k, score];
  }).filter(function(p){ return p[1] > 0; }).sort(function(x, y){ return y[1] - x[1]; });
}
function readTopic(text, name){
  var t = name ? text.split(name).join(' ') : text;
  var skip = {};
  FILLER.forEach(function(w){ skip[w] = 1; });
  LOOK_WORDS.concat(COLOUR_WORDS).forEach(function(p){ p[0].split(' ').forEach(function(w){ skip[w] = 1; }); });
  var link = { 'in': 1, 'of': 1, 'and': 1, 'for': 1, 'with': 1, '&': 1 }, ws = [];
  t.replace(/[^A-Za-z0-9& ]+/g, ' ').split(/\s+/).forEach(function(w){
    var l = w.toLowerCase();
    if (link[l]){ if (ws.length && !link[ws[ws.length - 1]]) ws.push(l); return; }   /* keep "in" in "escape room in Bristol" */
    if (w.length > 1 && !skip[l]) ws.push(/^[A-Z][a-z]/.test(w) ? w : l);            /* keep place and proper names as typed */
  });
  while (ws.length && link[ws[ws.length - 1]]) ws.pop();
  return ws.slice(0, 5).join(' ');
}
function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
var CUSTOM = JSON.stringify(TYPES.custom);
function setTopic(t){
  S.topic = String(t || '').replace(/[^A-Za-z0-9& ]+/g, '').trim().slice(0, 40);
  var w = S.topic || 'what you do';
  TYPES.custom = JSON.parse(CUSTOM.replace(/\{t\}/g, w).replace(/\{T\}/g, cap(w)));
}
function readBrief(text){
  var t = ' ' + text.toLowerCase().replace(/[^a-z0-9&é ]+/g, ' ') + ' ';
  var ws = t.split(/\s+/).filter(Boolean);
  var found = { type: null, look: null, accent: null, layout: null, name: null, guesses: [] };
  var ranked = scoreTypes(t, ws, false);
  if (ranked.length) found.type = ranked[0][0];
  else {
    var near = scoreTypes(t, ws, true);
    if (near.length && near[0][1] >= 8) found.type = near[0][0];   /* a clear misspelling of a long keyword: resturant, photgrapher */
    else found.guesses = near.filter(function(p){ return p[1] >= 5; }).slice(0, 3).map(function(p){ return p[0]; });
  }
  LOOK_WORDS.forEach(function(p){ if (!found.look && hit(p[0], t, ws, false)) found.look = p[1]; });
  COLOUR_WORDS.forEach(function(p){ if (!found.accent && hit(p[0], t, ws, false)) found.accent = p[1]; });
  LAYOUT_WORDS.forEach(function(p){ if (!found.layout && t.indexOf(p[0]) > -1) found.layout = p[1]; });
  var m = text.match(/(?:called|named)\s+["“']?([^,.;"”']{2,32})/i) || text.match(/["“]([^"”]{2,32})["”]/);
  if (m) found.name = m[1].trim();
  if (!found.type) found.topic = readTopic(text, found.name);
  return found;
}

/* ============ state ============ */
function typeDefaults(k){
  var T = TYPES[k], order = [], on = {};
  T.blocks.forEach(function(b){ order.push(b[0]); on[b[0]] = b[1]; });
  return { type: k, look: T.look, layout: T.layout, accent: T.accent, order: order, on: on };
}
function fresh(){
  var s = typeDefaults('photography');
  s.name = ''; s.nameSrc = ''; s.headline = ''; s.topic = ''; s.device = window.innerWidth < 760 ? 'phone' : 'desktop';
  /* filled when the build was read from the visitor's existing site */
  s.site = ''; s.sub = ''; s.about = ''; s.heroImg = ''; s.logo = ''; s.hex = '';
  return s;
}
var S = fresh();
setTopic('');
var pendingBrief = '';
/* the visitor's own brand colour joins the palette as one more accent */
function setOwnColour(hex){
  S.hex = okHex(hex) ? hex.toUpperCase() : '';
  if (S.hex) ACCENTS.own = ['Your colour', S.hex]; else delete ACCENTS.own;
}
function clearSite(){
  if (S.accent === 'own') S.accent = TYPES[S.type].accent;
  S.site = S.sub = S.about = S.heroImg = S.logo = '';
  setOwnColour('');
}
function applyType(k){
  var d = typeDefaults(k);
  Object.keys(d).forEach(function(key){ S[key] = d[key]; });
}
(function(){
  var q = new URLSearchParams(location.search);
  if (q.get('name')){ S.name = q.get('name').slice(0, 32); S.nameSrc = 'user'; }
  if (q.get('brief')){ pendingBrief = q.get('brief').slice(0, 140); var bi = document.getElementById('fBrief'); if (bi) bi.value = pendingBrief; }
  var fit = q.get('fit');
  if (!fit) return;
  try {
    var o = JSON.parse(decodeURIComponent(escape(atob(fit.replace(/-/g, '+').replace(/_/g, '/')))));
    if (typeof o.topic === 'string') setTopic(o.topic);
    if (okHex(o.hex)) setOwnColour(o.hex);
    if (okUrl(o.site)) S.site = o.site;
    if (typeof o.sub === 'string') S.sub = o.sub.slice(0, 220);
    if (typeof o.about === 'string') S.about = o.about.slice(0, 420);
    if (okUrl(o.heroImg)) S.heroImg = o.heroImg;
    if (okUrl(o.logo)) S.logo = o.logo;
    if (TYPES[o.type]) applyType(o.type);
    if (LOOKS[o.look]) S.look = o.look;
    if (LAYOUTS[o.layout]) S.layout = o.layout;
    if (ACCENTS[o.accent]) S.accent = o.accent;
    if (typeof o.name === 'string') S.name = o.name.slice(0, 32);
    if (typeof o.headline === 'string') S.headline = o.headline.slice(0, 70);
    var valid = S.order.slice().sort().join();
    if (Array.isArray(o.order) && o.order.slice().sort().join() === valid) S.order = o.order;
    if (o.on) S.order.forEach(function(k){ S.on[k] = o.on[k] ? 1 : 0; });
  } catch(e) {}
})();
function encodeFit(){
  var o = { type: S.type, topic: S.topic, name: S.name, look: S.look, layout: S.layout, accent: S.accent, headline: S.headline, order: S.order, on: S.on };
  ['site', 'sub', 'about', 'heroImg', 'logo', 'hex'].forEach(function(k){ if (S[k]) o[k] = S[k]; });
  return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fitURL(page){ return location.href.split('#')[0].split('?')[0].replace(/[^\/]*$/, page || 'configurator.html') + '?fit=' + encodeFit(); }
function nm(){ return S.name.trim() || 'Your Business'; }
function fill(s){ return esc(String(s).replace(/\{n\}/g, nm())); }
function slug(){ return (nm().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '') || 'yourbusiness') + '.co.uk'; }
function initials(n){ return n.replace(/^Dr\s+/, '').split(' ').map(function(w){ return w[0]; }).join('').slice(0, 2); }
var buildNo = 'Build no. ' + String(1000 + Math.floor(Math.random() * 9000));
if (UI) $('orderNo').textContent = buildNo;

/* ============ controls ============ */
if (UI){
$('fType').innerHTML = Object.keys(TYPES).map(function(k){
  return '<label class="chip"><input type="radio" name="type" value="' + k + '"><span>' + TYPES[k].label + '</span></label>';
}).join('');
var lastGroup = '';
$('fCloth').innerHTML = Object.keys(LOOKS).map(function(k){
  var c = LOOKS[k], head = '';
  if (c.group !== lastGroup){ head = '<span class="cloth-group">' + c.group + '</span>'; lastGroup = c.group; }
  return head + '<label class="chip cloth" title="' + c.label + ' · ' + c.desc + '"><input type="radio" name="look" value="' + k + '"><span><i class="sw ' + k + '">Aa</i><b>' + c.label + '</b></span></label>';
}).join('');
$('fLayout').innerHTML = Object.keys(LAYOUTS).map(function(k){
  return '<label class="chip layout"><input type="radio" name="layout" value="' + k + '"><span>' + LAYOUTS[k].svg + LAYOUTS[k].label + '</span></label>';
}).join('');
}
function drawAccents(){
  $('fAccent').innerHTML = Object.keys(ACCENTS).map(function(k){
    return '<label class="swatch' + (k === 'own' ? ' own' : '') + '" title="' + ACCENTS[k][0] + '"><input type="radio" name="accent" value="' + k + '" aria-label="' + ACCENTS[k][0] + '"' + (k === S.accent ? ' checked' : '') + '><span style="background:' + ACCENTS[k][1] + '"></span></label>';
  }).join('') + '<span class="sw-name" id="fAccentName"></span>';
}
var UP = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
var DN = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
function drawSecs(focusKey, focusDir){
  var html = '<li class="fixed"><label><input type="checkbox" checked disabled> Opening</label><span class="fx">Always first</span></li>';
  S.order.forEach(function(k, i){
    html += '<li class="' + (S.on[k] ? '' : 'off') + '">' +
      '<label><input type="checkbox" data-k="' + k + '"' + (S.on[k] ? ' checked' : '') + '> ' + BLOCKS[k] + '</label>' +
      '<span class="mv"><button type="button" data-up="' + k + '" aria-label="Move ' + BLOCKS[k] + ' up"' + (i === 0 ? ' disabled' : '') + '>' + UP + '</button>' +
      '<button type="button" data-dn="' + k + '" aria-label="Move ' + BLOCKS[k] + ' down"' + (i === S.order.length - 1 ? ' disabled' : '') + '>' + DN + '</button></span></li>';
  });
  $('fSecs').innerHTML = html;
  if (focusKey){
    var f = $('fSecs').querySelector('[data-' + focusDir + '="' + focusKey + '"]');
    if (f && !f.disabled) f.focus();
    else { var alt = $('fSecs').querySelector('[data-' + (focusDir === 'up' ? 'dn' : 'up') + '="' + focusKey + '"]'); if (alt) alt.focus(); }
  }
}
function describe(){
  $('fClothDesc').innerHTML = '<b>' + LOOKS[S.look].label + '</b> · ' + esc(LOOKS[S.look].desc);
  $('fAccentName').textContent = ACCENTS[S.accent][0];
}
function syncControls(){
  $('fName').value = S.name;
  $('fHead').value = S.headline;
  $('fHead').placeholder = TYPES[S.type].h;
  drawAccents();
  [['type', S.type], ['look', S.look], ['layout', S.layout]].forEach(function(p){
    document.querySelectorAll('input[name=' + p[0] + ']').forEach(function(r){ r.checked = r.value === p[1]; });
  });
  document.querySelectorAll('.dev button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-dev') === S.device); });
  describe();
  drawSecs();
}

/* ============ block renderers ============ */
function H(T, k, d){ return (T.heads && T.heads[k]) || d; }
function head(T, k, d){ var h = H(T, k, d); return '<div class="x-head">' + kick(h[0]) + '<h2>' + esc(h[1]) + '</h2></div>'; }
function kick(t){ return '<p class="x-kick">' + esc(t) + '</p>'; }
function sec(k, inner, cls){ return '<section class="x-sec s-' + k + (cls ? ' ' + cls : '') + '" data-sec="' + k + '">' + inner + '</section>'; }
var R = {
  work: function(T){
    return sec('work', '<div class="x-head">' + kick('Selected work') + '<h2>Recent photographs.</h2></div><div class="x-masonry">' +
      T.imgs.slice(0, 6).map(function(id, i){ return '<figure>' + img(id, '', T.caps[i]) + '<figcaption>' + esc(T.caps[i] || '') + '</figcaption></figure>'; }).join('') + '</div>');
  },
  series: function(T){
    return sec('series', head(T, 'series', ['Series', 'Ongoing series.']) + '<div class="x-list">' +
      T.series.map(function(s, i){ return '<div class="x-li"><span class="x-n">' + String(i + 1).padStart(2, '0') + '</span><strong>' + esc(s[0]) + '</strong><span>' + esc(s[1]) + '</span><span>' + esc(s[2]) + '</span>' + img(T.imgs[(i + 2) % T.imgs.length], 'x-li-img') + '</div>'; }).join('') + '</div>');
  },
  about: function(T){
    return sec('about', '<div class="x-about"><div>' + kick('About') + '<h2>' + esc(nm()) + '</h2><p>' + (S.about ? esc(S.about) : fill(T.about)) + '</p></div>' + img(T.imgs[T.imgs.length - 1], 'x-about-img') + '</div>');
  },
  packages: function(T){
    return sec('packages', head(T, 'packages', ['Packages', 'Simple, clear packages.']) + '<div class="x-three">' +
      T.packages.map(function(p){ return '<div class="x-card"><h3>' + esc(p[0]) + '</h3><p>' + esc(p[1]) + '</p><b>' + esc(p[2]) + '</b></div>'; }).join('') + '</div>');
  },
  testimonial: function(T){
    return sec('testimonial', '<div class="x-quote">' + kick('Kind words') + '<blockquote>“' + esc(T.q) + '”</blockquote><cite>Sample review · ' + esc(T.qc.replace(', sample review', '')) + '</cite></div>');
  },
  faq: function(T){
    return sec('faq', '<div class="x-faq"><div>' + kick('Questions') + '<h2>Asked often.</h2></div><dl>' +
      T.faq.map(function(f){ return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl></div>');
  },
  contact: function(T){
    return sec('contact', '<div>' + kick('Contact') + '<h2>Ready when you are.</h2><p>' + esc(T.c) + '</p></div><span class="x-btn x-btn-inv">' + esc(T.cta) + '</span>');
  },
  menu: function(T){
    return sec('menu', '<div class="x-head">' + kick('Menu') + '<h2>' + (T.label === 'Café' ? 'On the counter today.' : 'This week’s menu.') + '</h2></div><div class="x-menu">' +
      T.menu.map(function(g){ return '<div><h3>' + esc(g[0]) + '</h3>' + g[1].map(function(it){ return '<div class="x-mi"><span><strong>' + esc(it[0]) + '</strong><em>' + esc(it[1]) + '</em></span><i></i><b>' + esc(it[2]) + '</b></div>'; }).join('') + '</div>'; }).join('') + '</div>');
  },
  strip: function(T){
    return sec('strip', '<div class="x-strip">' + T.imgs.slice(0, 3).map(function(id){ return img(id); }).join('') + '</div>', 'x-flush');
  },
  hours: function(T){
    var h = H(T, 'hours', ['Visit', 'Opening hours.']);
    return sec('hours', '<div class="x-hours"><div>' + kick(h[0]) + '<h2>' + esc(h[1]) + '</h2><p>' + esc(T.addr || '') + '</p></div><dl>' +
      T.hours.map(function(h){ return '<div><dt>' + esc(h[0]) + '</dt><dd>' + esc(h[1]) + '</dd></div>'; }).join('') + '</dl></div>');
  },
  treatments: function(T){
    return sec('treatments', head(T, 'treatments', ['Treatments', 'Treatments and prices.']) + '<div class="x-rows">' +
      T.treatments.map(function(t){ return '<div><strong>' + esc(t[0]) + '</strong><span>' + esc(t[1]) + '</span><b>' + esc(t[2]) + '</b><span class="x-book">Book</span></div>'; }).join('') + '</div>');
  },
  team: function(T){
    return sec('team', head(T, 'team', ['The team', 'The people you will meet.']) + '<div class="x-team">' +
      T.team.map(function(p){ return '<div><span class="x-av">' + esc(initials(p[0])) + '</span><strong>' + esc(p[0]) + '</strong><span>' + esc(p[1]) + '</span></div>'; }).join('') + '</div>');
  },
  steps: function(T){
    return sec('steps', head(T, 'steps', ['How it works', 'Three simple steps.']) + '<div class="x-steps">' +
      T.steps.map(function(s, i){ return '<div><span class="x-n">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></div>'; }).join('') + '</div>');
  },
  listings: function(T){
    var h = H(T, 'listings', ['Listings', 'Available now.', 'View all homes']);
    return sec('listings', '<div class="x-head x-head-row"><div>' + kick(h[0]) + '<h2>' + esc(h[1]) + '</h2></div><span class="x-ghost">' + esc(h[2]) + '</span></div><div class="x-three">' +
      T.listings.map(function(l){ return '<div class="x-listing">' + img(l[0]) + '<div><b>' + esc(l[1]) + '</b><h3>' + esc(l[2]) + '</h3><p>' + esc(l[3]) + '</p></div></div>'; }).join('') + '</div>');
  },
  stats: function(T){
    return sec('stats', '<div class="x-stats">' + T.stats.map(function(s){ return '<div><strong>' + esc(s[0]) + '</strong><span>' + esc(s[1]) + '</span></div>'; }).join('') + '</div>');
  },
  fleet: function(T){
    return sec('fleet', '<div class="x-head x-head-row"><div>' + kick('The fleet') + '<h2>Choose your car.</h2></div><span class="x-ghost">Full fleet</span></div><div class="x-three">' +
      T.fleet.map(function(f){ return '<div class="x-listing">' + img(f[0]) + '<div><h3>' + esc(f[1]) + '</h3><p>' + esc(f[2]) + '</p><div class="x-row"><b>' + esc(f[3]) + '<small> a day</small></b><span class="x-btn x-btn-sm">Reserve</span></div></div></div>'; }).join('') + '</div>');
  },
  services: function(T){
    return sec('services', head(T, 'services', ['Services', 'What we offer.']) + '<div class="x-three">' +
      T.services.map(function(s){ return '<div class="x-card"><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p><b>' + esc(s[2]) + '</b></div>'; }).join('') + '</div>');
  },
  areas: function(T){
    return sec('areas', '<div class="x-areas"><div>' + kick('Coverage') + '<h2>Areas we cover.</h2></div><div class="x-chips">' + T.areas.map(function(a){ return '<span>' + esc(a) + '</span>'; }).join('') + '</div></div>');
  },
  products: function(T){
    return sec('products', '<div class="x-head x-head-row"><div>' + kick('New in') + '<h2>The collection.</h2></div><span class="x-ghost">Shop all</span></div><div class="x-four">' +
      T.products.map(function(p){ return '<div class="x-product">' + img(p[0]) + '<div class="x-row"><strong>' + esc(p[1]) + '</strong><b>' + esc(p[2]) + '</b></div><span class="x-add">Add to bag</span></div>'; }).join('') + '</div>');
  },
  logos: function(T){
    return sec('logos', '<p class="x-trust">' + esc(H(T, 'logos', 'Trusted by teams at')) + '</p><div class="x-logos">' + T.logos.map(function(l){ return '<span>' + esc(l) + '</span>'; }).join('') + '</div>', 'x-thin');
  },
  pricing: function(T){
    return sec('pricing', '<div class="x-head x-center">' + kick('Pricing') + '<h2>Simple, honest pricing.</h2></div><div class="x-three">' +
      T.pricing.map(function(p){ return '<div class="x-card x-tier' + (p[4] ? ' x-featured' : '') + '">' + (p[4] ? '<span class="x-badge">Most popular</span>' : '') + '<h3>' + esc(p[0]) + '</h3><div class="x-price"><strong>' + esc(p[1]) + '</strong><span>' + esc(p[2]) + '</span></div><ul>' +
        p[3].map(function(f){ return '<li>' + esc(f) + '</li>'; }).join('') + '</ul><span class="x-btn' + (p[4] ? '' : ' x-btn-ghost') + '">Choose ' + esc(p[0].toLowerCase()) + '</span></div>'; }).join('') + '</div>');
  },
  bento: function(T){
    var b = T.bento;
    return sec('bento', '<div class="x-head x-center">' + kick('Features') + '<h2>Everything in one calm place.</h2></div><div class="x-bento">' +
      '<div class="x-b1"><h3>' + esc(b[0][0]) + '</h3><p>' + esc(b[0][1]) + '</p><div class="x-mini">' + mockRows(5) + '</div></div>' +
      '<div class="x-b2"><h3>' + esc(b[1][0]) + '</h3><p>' + esc(b[1][1]) + '</p><div class="x-pills"><span>Design</span><span class="on">Approved</span><span>Legal</span></div></div>' +
      '<div class="x-b3">' + img(T.imgs[0]) + '<div><h3>' + esc(b[2][0]) + '</h3><p>' + esc(b[2][1]) + '</p></div></div>' +
      '<div class="x-b4"><h3>' + esc(b[3][0]) + '</h3><p>' + esc(b[3][1]) + '</p><div class="x-bars">' + [40, 65, 52, 80, 70, 92].map(function(h){ return '<i style="height:' + h + '%"></i>'; }).join('') + '</div></div></div>');
  },
  timetable: function(T){
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return sec('timetable', '<div class="x-head">' + kick('Timetable') + '<h2>This week’s classes.</h2></div><div class="x-table"><div class="x-tr x-th"><span></span>' + days.map(function(d){ return '<span>' + d + '</span>'; }).join('') + '</div>' +
      T.timetable.map(function(r){ return '<div class="x-tr"><span class="x-time">' + esc(r[0]) + '</span>' + r[1].map(function(c){ return '<span class="x-class">' + esc(c) + '</span>'; }).join('') + '</div>'; }).join('') + '</div>');
  },
  dates: function(T){
    return sec('dates', head(T, 'dates', ['Coming up', 'Dates for your diary.']) + '<div class="x-dates">' +
      T.dates.map(function(d){ var p = d[0].split(' '); return '<div><span class="x-cal"><strong>' + esc(p[0]) + '</strong>' + esc(p[1]) + '</span><span><strong>' + esc(d[1]) + '</strong><em>' + esc(d[2]) + '</em></span><span class="x-ghost">Reserve</span></div>'; }).join('') + '</div>');
  },
  gallery: function(T){
    return sec('gallery', head(T, 'gallery', ['Gallery', 'A look inside.']) + '<div class="x-gal">' + T.imgs.slice(0, 4).map(function(id){ return img(id); }).join('') + '</div>');
  }
};
function mockRows(n){
  var out = '';
  for (var i = 0; i < n; i++) out += '<div class="x-mrow"><i></i><span style="width:' + (38 + (i * 17) % 40) + '%"></span><b class="' + (i % 3 === 0 ? 'ok' : '') + '"></b></div>';
  return out;
}
function mock(){
  return '<div class="x-mock"><div class="x-mock-bar"><i></i><i></i><i></i></div><div class="x-mock-body"><div class="x-mock-side">' +
    '<span class="on"></span><span></span><span></span><span></span><span></span></div><div class="x-mock-main"><div class="x-mock-cards"><div><small>Open tasks</small><strong>128</strong></div><div><small>Approved</small><strong>94%</strong></div><div><small>This week</small><strong>+32</strong></div></div>' +
    '<div class="x-mock-chart">' + [30, 46, 38, 60, 52, 74, 66, 88, 80, 96].map(function(h){ return '<i style="height:' + h + '%"></i>'; }).join('') + '</div>' + mockRows(4) + '</div></div></div>';
}
function heroExtra(T){
  if (T.extra === 'search') return '<div class="x-search"><span><small>Location</small>Islington, London</span><span><small>Type</small>Any home</span><span><small>Budget</small>Up to £900,000</span><span class="x-btn">Search</span></div>';
  if (T.extra === 'reserve') return '<div class="x-search x-reserve"><span><small>Guests</small>2 people</span><span><small>Date</small>Friday 14 June</span><span><small>Time</small>19:30</span><span class="x-btn">' + esc(T.cta) + '</span></div>';
  if (T.extra === 'stay') return '<div class="x-search x-reserve"><span><small>Check in</small>Friday 14 June</span><span><small>Check out</small>Sunday 16 June</span><span><small>Guests</small>2 adults</span><span class="x-btn">' + esc(T.cta) + '</span></div>';
  if (T.extra === 'quote') return '<div class="x-quotecard"><strong>Get a quote in minutes</strong><span class="x-field">Your postcode</span><span class="x-field">What needs doing?</span><span class="x-btn">Send request</span><small>Replies within the hour</small></div>';
  return '';
}
function hero(T){
  var head = S.headline.trim() || T.h;
  var media = (T.extra === 'mock' && S.layout !== 'full') ? mock() : (T.extra === 'quote' && S.layout === 'split') ? heroExtra(T) : img(S.heroImg || T.hero, 'x-hero-img', T.label, T.hero);
  var after = (T.extra === 'search' || T.extra === 'reserve' || T.extra === 'stay') ? heroExtra(T) : '';
  return '<section class="x-hero" data-sec="hero"><div class="x-hero-copy"><p class="x-kick">' + esc(T.kick) + '</p><h1>' + esc(head) + '</h1><p>' + (S.sub ? esc(S.sub) : fill(T.sub)) + '</p>' +
    '<div class="x-cta"><span class="x-btn">' + esc(T.cta) + '</span><span class="x-ghost">Find out more</span></div>' + after + '</div>' + media + '</section>';
}
function logo(){
  return '<span class="x-logo">' + (S.logo ? '<img class="x-logo-img" src="' + esc(S.logo) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + esc(nm()) + '</span>';
}
function nav(T, live){
  var links = live.filter(function(k){ return k !== 'contact' && k !== 'logos' && k !== 'strip' && k !== 'testimonial'; }).slice(0, 4).map(function(k){ return '<span>' + BLOCKS[k] + '</span>'; });
  if (T.nav === 'centre'){
    var half = Math.ceil(links.length / 2);
    return '<div class="x-nav x-nav-c"><div class="x-links">' + links.slice(0, half).join('') + '</div>' + logo() + '<div class="x-links x-links-r">' + links.slice(half).join('') + '<span class="x-navbtn">' + esc(T.cta) + '</span></div></div>';
  }
  return '<div class="x-nav">' + logo() + '<div class="x-links">' + links.join('') + '</div><span class="x-btn x-navbtn">' + esc(T.cta) + '</span></div>';
}

/* ============ render ============ */
var pvSizer = $('pvSizer'), pvView = $('pvView');
function render(){
  var T = TYPES[S.type], phone = S.device === 'phone';
  var live = S.order.filter(function(k){ return S.on[k]; });
  pvSite.className = 'pvs c-' + S.look + ' l-' + S.layout + ' t-' + S.type + (phone ? ' is-phone' : '');
  var inkOnDark = S.accent === 'ink' && DARK[S.look], colour = (ACCENTS[S.accent] || ACCENTS[T.accent])[1];
  pvSite.style.setProperty('--a', inkOnDark ? '#ECE8E1' : colour);
  pvSite.style.setProperty('--on', inkOnDark || light(colour) ? '#111' : '#fff');
  pvSite.innerHTML = nav(T, live) + hero(T) +
    (live.length ? live.map(function(k){ return R[k](T); }).join('') : '<div class="x-empty">Tick a section to add it to your site</div>') +
    '<div class="x-foot"><span>© ' + new Date().getFullYear() + ' ' + esc(nm()) + '</span><span>Site by Coveworks</span></div>';
  if (UI) $('pvUrl').textContent = S.site ? S.site.replace(/^https:\/\/(www\.)?/, '').replace(/\/.*$/, '') : slug();
  else document.title = nm() + ' · preview by Coveworks';
  fitPreview();
  pvSite.querySelectorAll('img').forEach(function(im){ if (!im.complete) im.addEventListener('load', fitPreview, { once: true }); });
}
/* is this colour too pale to carry white text? */
function light(hex){
  var n = parseInt(hex.slice(1), 16);
  return (0.2126 * (n >> 16) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255 > 0.6;
}
function fitPreview(){
  if (!UI){
    /* full page: the 1280 or 390 wide design, scaled to the window */
    var ww = document.documentElement.clientWidth, small = ww < 760;
    if (small !== (S.device === 'phone')){ S.device = small ? 'phone' : 'desktop'; render(); return; }
    var base = small ? 390 : 1280, k = small ? ww / base : Math.min(ww / base, 1.25);
    pvSite.style.transform = 'scale(' + k + ')';
    pvSite.style.left = Math.max(0, (ww - base * k) / 2) + 'px';
    pvSizer.style.height = Math.ceil(pvSite.offsetHeight * k) + 'px';
    return;
  }
  var phone = S.device === 'phone';
  pvView.classList.toggle('phone', phone);
  var fw = pvView.clientWidth, siteW = phone ? 390 : 1280;
  var w = phone ? Math.min(fw - 40, 330) : fw, s = w / siteW;
  pvSite.style.transform = 'scale(' + s + ')';
  pvSizer.style.width = w + 'px';
  pvSizer.style.height = Math.ceil(pvSite.offsetHeight * s) + 'px';
  pvSizer._s = s;
}
function showSection(k){
  var el = pvSite.querySelector('[data-sec="' + k + '"]');
  if (!el) return;
  var top = el.offsetTop * (pvSizer._s || 1) + (S.device === 'phone' ? 18 : 0) - 12;
  pvView.scrollTo({ top: Math.max(0, top), behavior: smooth });
  el.classList.add('flash');
  setTimeout(function(){ el.classList.remove('flash'); }, 900);
}
/* the build in plain words, for the lead and for the email fallback */
function summary(){
  var T = TYPES[S.type];
  var live = S.order.filter(function(k){ return S.on[k]; }).map(function(k){ return BLOCKS[k]; });
  return 'Business: ' + nm() + '\n' +
    'Type of site: ' + (S.type === 'custom' ? 'Something else · ' + (S.topic || 'not described') : T.label) + '\n' +
    'Look: ' + LOOKS[S.look].label + ' (' + LOOKS[S.look].desc.toLowerCase() + ')\n' +
    'Opening layout: ' + LAYOUTS[S.layout].label + '\n' +
    'Colour: ' + ACCENTS[S.accent][0] + (S.accent === 'own' ? ' (' + S.hex + ')' : '') + '\n' +
    'Sections, in order: Opening · ' + (live.join(' · ') || 'none yet') + '\n' +
    'Headline: ' + (S.headline.trim() || T.h) + '\n' +
    (S.site ? 'Rebuilt from: ' + S.site + '\n' : '');
}
function mailto(){
  var body = 'Hello Coveworks,\n\nI built a demo in your configurator and would like to talk about the real thing.\n\n' + summary() +
    ($('fBrief').value.trim() ? 'In my words: ' + $('fBrief').value.trim() + '\n' : '') + '\n' +
    'My build: ' + fitURL() + '\n\n' +
    'My name:\nBest way to reach me:\n';
  return 'mailto:sales@coveworks.tech?subject=' + encodeURIComponent('Configurator · ' + nm()) + '&body=' + encodeURIComponent(body);
}
function status(t){
  var el = $('fStatus');
  el.textContent = t;
  clearTimeout(status._t);
  status._t = setTimeout(function(){ el.textContent = ''; }, 2600);
}
function fadeRender(){
  if (reduce){ render(); return; }
  pvSite.style.transition = 'opacity .16s ease';
  pvSite.style.opacity = '0';
  setTimeout(function(){ render(); pvSite.style.opacity = '1'; }, 160);
}

/* ============ wiring ============ */
function setUnsure(on){ document.querySelector('.stage').classList.toggle('unsure', !!on); }
/* a web address rather than a description: one word, with a dot and a real ending */
function looksLikeSite(t){ t = t.trim(); return /^https?:\/\/\S+$/i.test(t) || /^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(t); }
function runBrief(text){
  if (looksLikeSite(text)){ runSite(text.trim()); return; }
  clearSite();
  var f = readBrief(text), said = [], also = '';
  if (!f.type && f.topic){
    setTopic(f.topic);
    f.type = 'custom';
    if (f.guesses.length) also = ' Or did you mean:<span class="brief-pick">' + f.guesses.map(function(k){ return '<button type="button" data-pick="' + k + '">' + TYPES[k].label + '</button>'; }).join('') + '</span>';
  }
  if (!f.type){
    var picks = (f.guesses.length ? f.guesses : ['photography', 'restaurant', 'clinic']);
    $('fBriefRead').innerHTML = '<b>What is the site for?</b> ' + (f.guesses.length ? 'Did you mean' : 'Add a word or two about what you do, or start from one of these') + ':' +
      '<span class="brief-pick">' + picks.map(function(k){ return '<button type="button" data-pick="' + k + '">' + TYPES[k].label + '</button>'; }).join('') + '</span>';
    setUnsure(true);
    return;
  }
  setUnsure(false);
  applyType(f.type); said.push(f.type === 'custom' ? 'a site about ' + S.topic : TYPES[f.type].label + ' site');
  if (f.look){ S.look = f.look; said.push(LOOKS[f.look].label + ' look'); }
  else said.push(LOOKS[S.look].label + ' look');
  if (f.layout){ S.layout = f.layout; }
  said.push(LAYOUTS[S.layout].label.toLowerCase() + ' opening');
  if (f.accent){ S.accent = f.accent; said.push(ACCENTS[f.accent][0].toLowerCase()); }
  if (f.name){ S.name = f.name.slice(0, 32); S.nameSrc = 'brief'; said.push('named ' + S.name); }
  else if (S.nameSrc === 'brief'){ S.name = ''; S.nameSrc = ''; }
  S.headline = '';
  syncControls();
  fadeRender();
  pvView.scrollTo({ top: 0, behavior: smooth });
  $('fBriefRead').innerHTML = '<b>Built as</b> ' + esc(said.join(' · ')) + '.' + (also || ' Adjust anything below.');
}
/* ============ rebuilding the visitor's existing site ============ */
function runSite(address){
  var url = /^https?:\/\//i.test(address) ? address : 'https://' + address;
  var host = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, '');
  var stage = document.querySelector('.stage');
  setUnsure(false);
  stage.classList.add('reading');
  $('fBriefRead').innerHTML = '<b>Reading</b> ' + esc(host) + ' for your name, colour and words.';
  fetch('api/site.php?url=' + encodeURIComponent(url)).then(function(r){ return r.json(); }).then(function(d){
    stage.classList.remove('reading');
    if (!d || !d.ok) throw new Error(d && d.error || '');
    applySite(d);
  }).catch(function(e){
    stage.classList.remove('reading');
    $('fBriefRead').innerHTML = '<b>We could not read ' + esc(host) + '.</b> ' + esc(e && e.message && !/fetch|JSON|token/i.test(e.message) ? e.message : 'Describe the site in a few words instead, or pick a type below.');
  });
}
function secure(u){ u = String(u || '').replace(/^http:\/\//i, 'https://'); return okUrl(u) ? u : ''; }
function applySite(d){
  var words = [d.name, d.title, d.description, d.h1].concat((d.headings || []).slice(0, 6)).filter(Boolean).join(' . ');
  var f = readBrief(words), took = [];
  clearSite();
  if (!f.type){ setTopic(readTopic(d.description || d.title || d.h1 || '', d.name) || 'what you do'); f.type = 'custom'; }
  applyType(f.type);
  S.site = secure(d.url);
  if (d.name){ S.name = String(d.name).slice(0, 32); S.nameSrc = 'user'; took.push('your name'); }
  if (okHex(d.colour)){ setOwnColour(d.colour); S.accent = 'own'; took.push('your colour'); }
  var h = String(d.h1 || '').trim();
  S.headline = h.length >= 8 && h.length <= 70 ? h : '';
  if (S.headline) took.push('your headline');
  S.sub = String(d.description || '').slice(0, 220);
  S.about = String((d.paragraphs || [])[0] || '').slice(0, 420);
  if (S.sub || S.about) took.push('your own words');
  S.heroImg = secure(d.image);
  S.logo = secure(d.logo);
  if (S.heroImg) took.push('your photo');
  syncControls();
  fadeRender();
  pvView.scrollTo({ top: 0, behavior: smooth });
  $('fBriefRead').innerHTML = '<b>Rebuilt from ' + esc(d.host || 'your site') + '</b> as a ' + esc(f.type === 'custom' ? 'site about ' + S.topic : TYPES[f.type].label + ' site') +
    (took.length ? ', keeping ' + esc(took.join(', ')) : '') + '. Try another look or type below.';
}

if (UI){
$('fBriefRead').addEventListener('click', function(e){
  var b = e.target.closest('[data-pick]');
  if (!b) return;
  var k = b.getAttribute('data-pick');
  if (S.nameSrc === 'brief'){ S.name = ''; S.nameSrc = ''; }
  applyType(k); S.headline = ''; setUnsure(false);
  syncControls(); fadeRender(); pvView.scrollTo({ top: 0, behavior: smooth });
  $('fBriefRead').innerHTML = '<b>Built as</b> ' + esc(TYPES[k].label + ' site · ' + LOOKS[S.look].label + ' look') + '. Adjust anything below.';
});
$('fBriefForm').addEventListener('submit', function(e){ e.preventDefault(); runBrief($('fBrief').value); });
document.querySelectorAll('.brief-eg button').forEach(function(b){
  b.addEventListener('click', function(){ $('fBrief').value = b.textContent; runBrief(b.textContent); });
});
$('fName').addEventListener('input', function(){ S.name = this.value; S.nameSrc = this.value ? 'user' : ''; render(); });
$('fHead').addEventListener('input', function(){ S.headline = this.value; render(); });
$('fHead').addEventListener('focus', function(){ pvView.scrollTo({ top: 0, behavior: smooth }); });
document.querySelectorAll('input[name=type]').forEach(function(r){
  r.addEventListener('change', function(){ if (S.nameSrc === 'brief'){ S.name = ''; S.nameSrc = ''; } applyType(r.value); S.headline = ''; setUnsure(false); syncControls(); fadeRender(); pvView.scrollTo({ top: 0, behavior: smooth }); });
});
document.querySelectorAll('input[name=look]').forEach(function(r){
  r.addEventListener('change', function(){ S.look = r.value; describe(); fadeRender(); });
});
document.querySelectorAll('input[name=layout]').forEach(function(r){
  r.addEventListener('change', function(){ S.layout = r.value; render(); pvView.scrollTo({ top: 0, behavior: smooth }); });
});
$('fAccent').addEventListener('change', function(e){
  if (e.target.name === 'accent' && ACCENTS[e.target.value]){ S.accent = e.target.value; describe(); render(); }
});
$('fSecs').addEventListener('change', function(e){
  var k = e.target.getAttribute('data-k');
  if (!k) return;
  S.on[k] = e.target.checked ? 1 : 0;
  e.target.closest('li').classList.toggle('off', !S.on[k]);
  render();
  if (S.on[k]) showSection(k);
});
$('fSecs').addEventListener('click', function(e){
  var b = e.target.closest('button');
  if (!b || b.disabled) return;
  var k = b.getAttribute('data-up') || b.getAttribute('data-dn');
  var dir = b.hasAttribute('data-up') ? 'up' : 'dn';
  var i = S.order.indexOf(k), j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= S.order.length) return;
  S.order[i] = S.order[j]; S.order[j] = k;
  drawSecs(k, dir);
  render();
  if (S.on[k]) showSection(k);
});
document.querySelectorAll('.dev button').forEach(function(b){
  b.addEventListener('click', function(){
    S.device = b.getAttribute('data-dev');
    document.querySelectorAll('.dev button').forEach(function(o){ o.setAttribute('aria-pressed', o === b); });
    render();
    pvView.scrollTop = 0;
  });
});
$('fCopy').addEventListener('click', function(){
  var url = fitURL();
  try { history.replaceState(null, '', url); } catch(e) {}
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ status('Link copied · it reopens this exact build'); }, function(){ status('Link is in the address bar'); });
  } else status('Link is in the address bar');
});
$('fReset').addEventListener('click', function(){
  var dev = S.device;
  S = fresh(); S.device = dev; setTopic(''); setOwnColour('');
  $('fBrief').value = ''; $('fBriefRead').innerHTML = '';
  try { history.replaceState(null, '', location.pathname); } catch(e) {}
  syncControls(); render();
  pvView.scrollTop = 0;
  status('Reset');
  setUnsure(false);
});

/* ============ sending the build ============ */
$('fLead').addEventListener('submit', function(e){
  e.preventDefault();
  var form = this, email = $('lEmail').value.trim(), btn = $('fSend');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ $('lEmail').focus(); status('Add your email so we can reply'); return; }
  btn.disabled = true; form.classList.add('busy');
  window.cwLead({ kind: 'build', name: $('lName').value, email: email, phone: $('lPhone').value, business: nm(), summary: summary(),
    link: fitURL(), brief: $('fBrief').value.trim(), site: S.site, ref: buildNo, website: $('lWeb').value }).then(function(d){
    form.innerHTML = '<p class="lead-done"><span class="led ok"></span><b>Sent.</b> Your build is with us as ' + esc(d.id) + '. We will reply to ' + esc(email) + ' within a day.</p>';
  }, function(err){
    btn.disabled = false; form.classList.remove('busy');
    if (err && err.field === 'email'){ $('lEmail').focus(); status(err.error); return; }
    /* the server could not take it: hand the same brief to the visitor's email app instead */
    $('fLeadAlt').hidden = false;
    $('fLeadAlt').querySelector('a').setAttribute('href', mailto());
    status(err && err.error ? err.error : 'That did not send');
  });
});
}

if (UI) syncControls();
else {
  /* preview.html: the bar leads back to the configurator with this build loaded; embedded previews have no bar */
  var bar = $('pvBar');
  if (/[?&]embed=1/.test(location.search)) bar.remove(); else bar.setAttribute('href', fitURL('configurator.html'));
}
render();
if (UI && pendingBrief) runBrief(pendingBrief);
if (!UI) window.addEventListener('resize', fitPreview);
else if (window.ResizeObserver) new ResizeObserver(function(){ fitPreview(); }).observe(pvView);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPreview);
document.addEventListener('loadingdone', fitPreview);
})();
