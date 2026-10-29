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

/* ============ the fitting room ============ */
var pvSite = $('pvSite');
if (pvSite) (function(){
var TRADES = {
  restaurant: { label: 'Restaurant', kick: 'Kitchen and dining room', h: 'Seasonal plates, cooked with care.', cta: 'Book a table',
    sub: '{n} is a neighbourhood dining room serving a short menu that changes with whatever the market brings in.',
    about: 'We opened {n} to cook the food we wanted to eat: honest, generous and made from scratch every morning. The menu is short on purpose, so everything on it is the best it can be.',
    st: 'The menu', s: [['Lunch', 'Two or three courses, served Tuesday to Saturday.', 'from £24'], ['Dinner', 'The full menu, with a wine list chosen to match.', 'from £38'], ['Private dining', 'The back room seats twenty, for birthdays and long tables.', 'on request']],
    pt: 'Set menus', p: [['Set lunch · two courses', '£24'], ['Set lunch · three courses', '£29'], ['Tasting menu', '£65'], ['Wine pairing', '£40']],
    q: 'The best meal we have had all year. We booked again before we had even left.', qc: 'a regular guest',
    faq: [['Do you cater for allergies?', 'Yes. Tell us when you book and the kitchen will plan around it.'], ['Can we walk in?', 'Most nights, though booking is the only way to be sure of a table.'], ['Is there parking?', 'There is a public car park two minutes away.']],
    c: 'Open Tuesday to Sunday · reservations by phone or online.', g: ['The dining room', 'From the kitchen', 'The bar', 'Private room'] },
  clinic: { label: 'Clinic', kick: 'Clinic and treatments', h: 'Results that look like you, rested.', cta: 'Book a consultation',
    sub: '{n} offers doctor led treatments in a calm private clinic, with honest advice before anything else.',
    about: 'Every treatment at {n} starts with a conversation. We take the time to understand what you want, explain what is realistic, and never push a treatment you do not need.',
    st: 'Treatments', s: [['Skin consultation', 'A full assessment and a plan, with no obligation.', 'free'], ['Skin boosters', 'Hydration from within for a fresh, even glow.', 'from £180'], ['Anti wrinkle', 'Subtle softening, reviewed at two weeks.', 'from £150']],
    pt: 'Prices', p: [['Consultation', 'Free'], ['Skin boosters · one session', '£180'], ['Anti wrinkle · one area', '£150'], ['Chemical peel', '£95']],
    q: 'I left feeling listened to, and the results are so natural that nobody can tell. Exactly what I wanted.', qc: 'a returning client',
    faq: [['Is there any downtime?', 'Most treatments let you return to your day straight away. We will tell you exactly what to expect.'], ['Who carries out the treatments?', 'Qualified medical practitioners, every time.'], ['How do I book?', 'Online or by phone. Your first visit is always a consultation.']],
    c: 'Appointments Monday to Saturday · consultation first.', g: ['Treatment room', 'Reception', 'Results', 'The team'] },
  property: { label: 'Property', kick: 'Property and development', h: 'Homes worth living in.', cta: 'Arrange a viewing',
    sub: '{n} acquires, redesigns and rebuilds houses and flats, from the day we secure the keys to the day we hand them back.',
    about: '{n} takes on the properties others walk past. We plan every project in detail, manage the build ourselves and finish each home as if we were moving in.',
    st: 'What we do', s: [['Acquisition', 'We find and secure properties with real potential.', 'direct'], ['Design', 'Layouts and finishes that make a home feel bigger and brighter.', 'in house'], ['Development', 'The full build, managed from first strip out to final snag.', 'end to end']],
    pt: 'Current homes', p: [['Two bedroom flat · Islington', '£595,000'], ['Three bedroom house · Walthamstow', '£825,000'], ['Studio · Hackney', '£375,000']],
    q: 'They turned a tired terrace into the home we had been searching for. The finish is outstanding.', qc: 'a homeowner',
    faq: [['Do you buy properties directly?', 'Yes. We can complete quickly and with certainty.'], ['Can I view a home before it is finished?', 'Often, yes. Ask us about upcoming projects.'], ['Which areas do you cover?', 'London and the surrounding counties.']],
    c: 'Viewings by appointment · seven days a week.', g: ['Before', 'During', 'After', 'The detail'] },
  motors: { label: 'Car hire', kick: 'Car hire and motors', h: 'The keys to a better drive.', cta: 'Reserve a car',
    sub: '{n} keeps a private collection of cars, prepared to a standard and handed over wherever you need them.',
    about: 'Every car at {n} is chosen, cleaned and checked by us before it leaves. No call centres and no surprises at the counter, just the car you booked, ready on time.',
    st: 'The fleet', s: [['Weekend hire', 'Friday to Monday, delivered to your door.', 'from £395'], ['Daily hire', 'Twenty four hours, with generous mileage.', 'from £180'], ['Chauffeur', 'A driver and a car for the occasion.', 'on request']],
    pt: 'Rates', p: [['Daily · up to 150 miles', '£180'], ['Weekend · up to 400 miles', '£395'], ['Weekly', '£990'], ['Delivery and collection', 'Included']],
    q: 'Delivered to my door, spotless and full of fuel. The easiest hire I have ever booked.', qc: 'a weekend client',
    faq: [['What do I need to hire?', 'A full licence held for three years and a valid card in your name.'], ['Is insurance included?', 'Yes, fully comprehensive cover comes with every hire.'], ['Can you deliver?', 'Anywhere in the city, at a time that suits you.']],
    c: 'Bookings seven days a week · by phone or WhatsApp.', g: ['The fleet', 'Interior', 'On the road', 'Handover'] },
  trades: { label: 'Trades', kick: 'Trades and repair', h: 'Fixed properly, the first time.', cta: 'Get a quote',
    sub: '{n} comes to you, explains the problem in plain words and fixes it at an agreed price.',
    about: 'At {n} we treat every job as if it were our own. You get a clear quote before we start, tidy work, and a call back if anything is not right.',
    st: 'Services', s: [['Diagnostics', 'We find the fault and explain it before any work begins.', 'from £45'], ['Repairs', 'Most jobs completed on the same visit.', 'quoted'], ['Servicing', 'Regular care that saves money later.', 'from £120']],
    pt: 'Prices', p: [['Call out', '£45'], ['Hourly rate', '£60'], ['Standard service', '£120'], ['Full service', '£190']],
    q: 'Turned up when they said, fixed it within the hour and charged exactly what they quoted.', qc: 'a local customer',
    faq: [['Do you charge for quotes?', 'No. Quotes are always free.'], ['Are you insured?', 'Yes, fully insured, and every job is guaranteed.'], ['How soon can you come?', 'Usually the same or the next day.']],
    c: 'Monday to Saturday · same day call outs.', g: ['On the job', 'The van', 'Before', 'After'] },
  boutique: { label: 'Boutique', kick: 'Boutique and studio', h: 'Made in small runs, built to last.', cta: 'Shop the collection',
    sub: '{n} makes a short collection each season, cut from good cloth and finished by hand.',
    about: '{n} began with one idea: make fewer things, and make them properly. Every piece is designed in house and produced in small numbers, so nothing is wasted.',
    st: 'The collection', s: [['Outerwear', 'Coats and jackets cut to layer.', 'from £220'], ['Knitwear', 'Heavy gauge, made to soften with wear.', 'from £140'], ['Essentials', 'The pieces you will reach for every day.', 'from £45']],
    pt: 'Price list', p: [['Heavyweight tee', '£45'], ['Merino crew', '£140'], ['Wool overcoat', '£420'], ['Delivery', 'Free over £100']],
    q: 'The quality is unreal for the price. I have bought three more pieces since my first order.', qc: 'a customer',
    faq: [['Do you ship worldwide?', 'Yes, to most countries, with tracked delivery.'], ['Can I return an item?', 'Within thirty days, unworn, for a full refund.'], ['Will you restock?', 'Some pieces return each season. Join the list to hear first.']],
    c: 'Studio visits by appointment · online orders ship daily.', g: ['Lookbook', 'Detail', 'The studio', 'On model'] },
  professional: { label: 'Professional', kick: 'Professional services', h: 'Your books in order, your deadlines met.', cta: 'Book a call',
    sub: '{n} looks after the accounts, tax and payroll of growing businesses, at fixed fees agreed in writing.',
    about: '{n} is a small firm by choice. You speak to the same people every time, you always know what you are paying, and you hear from us before deadlines, not after them.',
    st: 'Services', s: [['Bookkeeping', 'Monthly, accurate and always up to date.', 'from £150 a month'], ['Year end accounts', 'Prepared, explained and filed on time.', 'from £650'], ['Tax returns', 'Personal and company returns, handled.', 'from £250']],
    pt: 'Fees', p: [['Bookkeeping', 'from £150 a month'], ['Payroll', 'from £60 a month'], ['Year end accounts', 'from £650'], ['Self assessment', 'from £250']],
    q: 'Clear, quick and always ahead of the deadline. I would not move to another firm.', qc: 'a client since day one',
    faq: [['Do you offer fixed fees?', 'Always. You will know the cost before we begin.'], ['Can you take over from my current accountant?', 'Yes, and we handle the handover for you.'], ['Do you work with sole traders?', 'From sole traders to limited companies, whatever your size.']],
    c: 'Monday to Friday · nine till half past five.', g: ['The office', 'The team', 'Our clients', 'In the city'] }
};
var CLOTHS = {
  clean:     { group: 'Professional', label: 'Clean',     desc: 'White, crisp, colour led. Suits clinics and services' },
  ledger:    { group: 'Professional', label: 'Ledger',    desc: 'Paper white, serif headings, ruled lines. Suits finance and law' },
  boardroom: { group: 'Professional', label: 'Boardroom', desc: 'Cool grey, corporate sans, white cards. Suits firms and consultancies' },
  gallery:   { group: 'Professional', label: 'Gallery',   desc: 'Pure white, large quiet type, rounded buttons. Suits studios and agencies' },
  fresh:     { group: 'Professional', label: 'Fresh',     desc: 'Soft white, friendly rounded sans. Suits health and wellbeing' },
  slate:     { group: 'Professional', label: 'Slate',     desc: 'Dark slate, calm and modern. Suits tech and premium services' },
  savile:    { group: 'Signature',    label: 'Savile',    desc: 'Ivory, fashion house serif, hairline rules' },
  linen:     { group: 'Signature',    label: 'Linen',     desc: 'Warm sand, soft corners, gentle serif' },
  noir:      { group: 'Signature',    label: 'Noir',      desc: 'Black, bold, set in capitals' }
};
var DARK = { noir: 1, slate: 1 };
var LAYOUTS = {
  split:   { label: 'Split',   svg: '<svg viewBox="0 0 60 36" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="59" height="35"/><path d="M6 12h18M6 17h14M6 23h8"/><rect x="33" y="7" width="21" height="22" fill="currentColor" opacity=".18" stroke="none"/></svg>' },
  centred: { label: 'Centred', svg: '<svg viewBox="0 0 60 36" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="59" height="35"/><path d="M18 9h24M22 14h16M27 19h6"/><rect x="8" y="24" width="44" height="8" fill="currentColor" opacity=".18" stroke="none"/></svg>' },
  full:    { label: 'Full image', svg: '<svg viewBox="0 0 60 36" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="59" height="35" fill="currentColor" fill-opacity=".18"/><path d="M6 14h22M6 19h16M6 25h8"/></svg>' }
};
var ACCENTS = { navy: ['Navy', '#1F3A5F'], teal: ['Teal', '#1E6B67'], forest: ['Forest', '#2F5D46'], oxblood: ['Oxblood', '#7A2430'],
  graphite: ['Graphite', '#3D4249'], ochre: ['Ochre', '#A0702A'], chalk: ['Chalk red', '#B4412A'], ink: ['Ink', '#1B1712'] };
var SECS = { about: 'About', services: 'Services', gallery: 'Gallery', reviews: 'Reviews', prices: 'Prices', faq: 'Questions', contact: 'Contact' };
function fresh(){
  return { name: '', trade: 'restaurant', cloth: 'clean', layout: 'split', accent: 'navy', headline: '', device: window.innerWidth < 760 ? 'phone' : 'desktop',
    order: ['about', 'services', 'gallery', 'reviews', 'prices', 'faq', 'contact'],
    on: { about: 1, services: 1, gallery: 1, reviews: 1, prices: 0, faq: 0, contact: 1 } };
}
var S = fresh();
(function(){
  var q = new URLSearchParams(location.search);
  if (q.get('name')) S.name = q.get('name').slice(0, 32);
  var fit = q.get('fit');
  if (!fit) return;
  try {
    var o = JSON.parse(decodeURIComponent(escape(atob(fit.replace(/-/g, '+').replace(/_/g, '/')))));
    if (TRADES[o.trade]) S.trade = o.trade;
    if (CLOTHS[o.cloth]) S.cloth = o.cloth;
    if (LAYOUTS[o.layout]) S.layout = o.layout;
    if (ACCENTS[o.accent]) S.accent = o.accent;
    if (typeof o.name === 'string') S.name = o.name.slice(0, 32);
    if (typeof o.headline === 'string') S.headline = o.headline.slice(0, 70);
    if (Array.isArray(o.order) && o.order.length === 7 && o.order.every(function(k){ return SECS[k]; })) S.order = o.order;
    if (o.on) Object.keys(SECS).forEach(function(k){ S.on[k] = o.on[k] ? 1 : 0; });
  } catch(e) {}
})();
function encodeFit(){
  var o = { name: S.name, trade: S.trade, cloth: S.cloth, layout: S.layout, accent: S.accent, headline: S.headline, order: S.order, on: S.on };
  return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fitURL(){ return location.href.split('#')[0].split('?')[0] + '?fit=' + encodeFit(); }
function nm(){ return S.name.trim() || 'Your Business'; }
function fill(s){ return esc(s.replace(/\{n\}/g, nm())); }
function slug(){ return (nm().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '') || 'yourbusiness') + '.co.uk'; }
$('orderNo').textContent = 'Order no. ' + String(1000 + Math.floor(Math.random() * 9000));

/* build the controls */
$('fTrade').innerHTML = Object.keys(TRADES).map(function(k){
  return '<label class="chip"><input type="radio" name="trade" value="' + k + '"><span>' + TRADES[k].label + '</span></label>';
}).join('');
var lastGroup = '';
$('fCloth').innerHTML = Object.keys(CLOTHS).map(function(k){
  var c = CLOTHS[k], head = '';
  if (c.group !== lastGroup){ head = '<span class="cloth-group">' + c.group + '</span>'; lastGroup = c.group; }
  return head + '<label class="chip cloth" title="' + c.label + ' · ' + c.desc + '"><input type="radio" name="cloth" value="' + k + '"><span><i class="sw ' + k + '">Aa</i><b>' + c.label + '</b></span></label>';
}).join('');
$('fLayout').innerHTML = Object.keys(LAYOUTS).map(function(k){
  return '<label class="chip layout"><input type="radio" name="layout" value="' + k + '"><span>' + LAYOUTS[k].svg + LAYOUTS[k].label + '</span></label>';
}).join('');
$('fAccent').innerHTML = Object.keys(ACCENTS).map(function(k){
  return '<label class="swatch" title="' + ACCENTS[k][0] + '"><input type="radio" name="accent" value="' + k + '" aria-label="' + ACCENTS[k][0] + '"><span style="background:' + ACCENTS[k][1] + '"></span></label>';
}).join('') + '<span class="sw-name" id="fAccentName"></span>';
var UP = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
var DN = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
function drawSecs(focusKey, focusDir){
  var html = '<li class="fixed"><label><input type="checkbox" checked disabled> Opening</label><span class="fx">Always first</span></li>';
  S.order.forEach(function(k, i){
    html += '<li class="' + (S.on[k] ? '' : 'off') + '" data-k="' + k + '">' +
      '<label><input type="checkbox" data-k="' + k + '"' + (S.on[k] ? ' checked' : '') + '> ' + SECS[k] + '</label>' +
      '<span class="mv"><button type="button" data-up="' + k + '" aria-label="Move ' + SECS[k] + ' up"' + (i === 0 ? ' disabled' : '') + '>' + UP + '</button>' +
      '<button type="button" data-dn="' + k + '" aria-label="Move ' + SECS[k] + ' down"' + (i === S.order.length - 1 ? ' disabled' : '') + '>' + DN + '</button></span></li>';
  });
  $('fSecs').innerHTML = html;
  if (focusKey){
    var f = $('fSecs').querySelector('[data-' + focusDir + '="' + focusKey + '"]');
    if (f && !f.disabled) f.focus();
    else { var alt = $('fSecs').querySelector('[data-' + (focusDir === 'up' ? 'dn' : 'up') + '="' + focusKey + '"]'); if (alt) alt.focus(); }
  }
}
function describe(){
  $('fClothDesc').innerHTML = '<b>' + CLOTHS[S.cloth].label + '</b> · ' + esc(CLOTHS[S.cloth].desc);
  $('fAccentName').textContent = ACCENTS[S.accent][0];
}
function syncControls(){
  $('fName').value = S.name;
  $('fHead').value = S.headline;
  $('fHead').placeholder = TRADES[S.trade].h;
  [['trade', S.trade], ['cloth', S.cloth], ['layout', S.layout], ['accent', S.accent]].forEach(function(p){
    document.querySelectorAll('input[name=' + p[0] + ']').forEach(function(r){ r.checked = r.value === p[1]; });
  });
  document.querySelectorAll('.dev button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-dev') === S.device); });
  describe();
  drawSecs();
}

/* render the demo site */
var pvSizer = $('pvSizer'), pvView = $('pvView');
function secHTML(k, T){
  var kick = function(t){ return '<p class="x-kick">' + t + '</p>'; };
  switch (k){
    case 'about': return '<section class="x-sec" data-sec="about"><div class="x-about"><div>' + kick('About') + '<h2>' + esc(nm()) + '</h2></div><p>' + fill(T.about) + '</p></div></section>';
    case 'services': return '<section class="x-sec" data-sec="services">' + kick(T.st) + '<h2>What we offer.</h2><div class="x-three">' +
      T.s.map(function(s){ return '<div class="x-card"><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p><b>' + esc(s[2]) + '</b></div>'; }).join('') + '</div></section>';
    case 'gallery': return '<section class="x-sec" data-sec="gallery">' + kick('Gallery') + '<h2>A look inside.</h2><div class="x-gal">' +
      T.g.map(function(g){ return '<div class="x-ph"><span>Photograph · ' + esc(g) + '</span></div>'; }).join('') + '</div></section>';
    case 'reviews': return '<section class="x-sec" data-sec="reviews"><div class="x-quote">' + kick('Kind words') + '<blockquote>“' + esc(T.q) + '”</blockquote><cite>Sample review · ' + esc(T.qc) + '</cite></div></section>';
    case 'prices': return '<section class="x-sec" data-sec="prices">' + kick(T.pt) + '<h2>Clear prices.</h2><div class="x-prices">' +
      T.p.map(function(p){ return '<div><span>' + esc(p[0]) + '</span><i></i><b>' + esc(p[1]) + '</b></div>'; }).join('') + '</div></section>';
    case 'faq': return '<section class="x-sec" data-sec="faq"><div class="x-faq"><div>' + kick('Questions') + '<h2>Asked often.</h2></div><dl>' +
      T.faq.map(function(f){ return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl></div></section>';
    case 'contact': return '<section class="x-sec x-contact" data-sec="contact"><div>' + kick('Contact') + '<h2>Ready when you are.</h2><p>' + esc(T.c) + '</p></div><span class="x-btn">' + esc(T.cta) + '</span></section>';
  }
  return '';
}
function render(){
  var T = TRADES[S.trade], phone = S.device === 'phone';
  var live = S.order.filter(function(k){ return S.on[k]; });
  pvSite.className = 'pvs c-' + S.cloth + ' l-' + S.layout + (phone ? ' is-phone' : '');
  var inkOnDark = S.accent === 'ink' && DARK[S.cloth];
  pvSite.style.setProperty('--a', inkOnDark ? '#ECE8E1' : ACCENTS[S.accent][1]);
  pvSite.style.setProperty('--on', inkOnDark ? '#111' : '#fff');
  var links = live.filter(function(k){ return k !== 'contact'; }).slice(0, 4).map(function(k){ return '<span>' + SECS[k] + '</span>'; }).join('');
  var head = S.headline.trim() || T.h;
  pvSite.innerHTML =
    '<div class="x-nav"><span class="x-logo">' + esc(nm()) + '</span><div class="x-links">' + links + '</div><span class="x-btn">' + esc(T.cta) + '</span></div>' +
    '<section class="x-hero" data-sec="hero"><div><p class="x-kick">' + esc(T.kick) + '</p><h1>' + esc(head) + '</h1><p>' + fill(T.sub) + '</p>' +
      '<div class="x-cta"><span class="x-btn">' + esc(T.cta) + '</span><span class="x-ghost">' + (live.indexOf('services') > -1 ? 'See ' + esc(T.st.toLowerCase()) : 'Find out more') + '</span></div></div>' +
      '<div class="x-ph tall"><span>Photograph · ' + esc(T.g[0]) + '</span></div></section>' +
    (live.length ? live.map(function(k){ return secHTML(k, T); }).join('') : '<div class="x-empty">Tick a section to add it to your site</div>') +
    '<div class="x-foot"><span>© ' + new Date().getFullYear() + ' ' + esc(nm()) + '</span><span>Site by Coveworks</span></div>';
  $('pvUrl').textContent = slug();
  fitPreview();
  $('fSend').setAttribute('href', mailto());
}
function fitPreview(){
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
function mailto(){
  var T = TRADES[S.trade];
  var live = S.order.filter(function(k){ return S.on[k]; }).map(function(k){ return SECS[k]; });
  var body = 'Hello Coveworks,\n\nI cut a demo in your fitting room and would like to talk about the real thing.\n\n' +
    'Business: ' + nm() + '\n' +
    'Trade: ' + T.label + '\n' +
    'Look: ' + CLOTHS[S.cloth].label + ' (' + CLOTHS[S.cloth].desc.split('.')[0].toLowerCase() + ')\n' +
    'Opening layout: ' + LAYOUTS[S.layout].label + '\n' +
    'Colour: ' + ACCENTS[S.accent][0] + '\n' +
    'Sections, in order: Opening · ' + (live.join(' · ') || 'none yet') + '\n' +
    'Headline: ' + (S.headline.trim() || T.h) + '\n\n' +
    'My fitting: ' + fitURL() + '\n\n' +
    'My name:\nBest way to reach me:\n';
  return 'mailto:hello@coveworks.studio?subject=' + encodeURIComponent('Fitting · ' + nm()) + '&body=' + encodeURIComponent(body);
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

/* wire up the controls */
$('fName').addEventListener('input', function(){ S.name = this.value; render(); });
$('fHead').addEventListener('input', function(){ S.headline = this.value; render(); });
$('fHead').addEventListener('focus', function(){ pvView.scrollTo({ top: 0, behavior: smooth }); });
document.querySelectorAll('input[name=trade]').forEach(function(r){
  r.addEventListener('change', function(){ S.trade = r.value; $('fHead').placeholder = TRADES[S.trade].h; render(); pvView.scrollTo({ top: 0, behavior: smooth }); });
});
document.querySelectorAll('input[name=cloth]').forEach(function(r){
  r.addEventListener('change', function(){ S.cloth = r.value; describe(); fadeRender(); });
});
document.querySelectorAll('input[name=layout]').forEach(function(r){
  r.addEventListener('change', function(){ S.layout = r.value; render(); pvView.scrollTo({ top: 0, behavior: smooth }); });
});
document.querySelectorAll('input[name=accent]').forEach(function(r){
  r.addEventListener('change', function(){ S.accent = r.value; describe(); render(); });
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
    navigator.clipboard.writeText(url).then(function(){ status('Link copied · it reopens this exact fitting'); }, function(){ status('Link is in the address bar'); });
  } else status('Link is in the address bar');
});
$('fReset').addEventListener('click', function(){
  var dev = S.device;
  S = fresh(); S.device = dev;
  try { history.replaceState(null, '', location.pathname); } catch(e) {}
  syncControls(); render();
  pvView.scrollTop = 0;
  status('Fresh cloth');
});
$('fSend').addEventListener('click', function(){ this.setAttribute('href', mailto()); status('Your email app is opening'); });

syncControls();
render();
if (S.name){
  var c = document.querySelector('input[name=trade]:checked');
  if (c) setTimeout(function(){ c.focus({ preventScroll: true }); }, 300);
}
if (window.ResizeObserver) new ResizeObserver(function(){ fitPreview(); }).observe(pvView);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPreview);
document.addEventListener('loadingdone', fitPreview);
})();

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
