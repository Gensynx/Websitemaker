/* Layout + shared components for the 381 Accountants site.
   Run `node sitegen/build.mjs` from the 381-accountants folder to
   regenerate the static HTML pages. No runtime build step. */

export const SITE = {
  name: '381 Accountants',
  legal: '381 Accountancy & Bookkeeping Services Ltd',
  companyNo: '07327043',
  established: 2010,
  phone1: '020 8214 1259',
  phone1tel: '+442082141259',
  phone2: '020 3129 8066',
  phone2tel: '+442031298066',
  email: 'info@381abs.com',
  address: '329 Fortis House, 160 London Road',
  town: 'Barking',
  postcode: 'IG11 8BB',
  hours: 'Mon–Fri 9:00–17:30',
  google: 'https://www.google.com/search?q=381+Accountancy+%26+Bookkeeping+Services+Ltd+Barking+reviews',
  maps: 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('381 Accountancy & Bookkeeping Services Ltd, Fortis House, 160 London Road, Barking IG11 8BB'),
  areas: ['Barking', 'Dagenham', 'Ilford', 'Canary Wharf', 'Woodford', 'Bexley', 'Romford', 'East London', 'Greater London', 'Essex'],
};

/* ---------------- Icons (1.5px stroke, 24 grid) ---------------- */
const paths = {
  arrow: '<path d="M3 12h17m0 0-6-6m6 6-6 6"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  pin: '<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2.5"/>',
  shield: '<path d="M12 3 5 5.8v5.4c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V5.8L12 3Z"/><path d="m9 11.5 2 2 4-4.5"/>',
  ledger: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 3v18M12.5 8H16M12.5 12H16M12.5 16H16"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 19h.01M12 19h.01M15.5 19h.01"/>',
  payroll: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16.5 8h4M16.5 12h4M18 16h2.5"/>',
  vat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"/><path d="m8.5 15.5 7-7M9.3 9.3h.01M14.7 14.7h.01"/>',
  accounts: '<path d="M4 20h16"/><path d="M6.5 20V11M11 20V6M15.5 20v-8M20 20V9" stroke-linecap="round"/>',
  formation: '<path d="M4 21V8l6-4.5L16 8v13"/><path d="M16 12h4v9M8 21v-4.5h4V21"/><path d="M4 21h18"/><path d="M8 10.5h.01M12 10.5h.01"/>',
  planning: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12 8 8"/><path d="M12 3.5V6M20.5 12H18M12 20.5V18M3.5 12H6"/>',
  selfassess: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M9.5 8H12M9.5 12h5M9.5 16h5"/><path d="m14.5 6.5 1.5 1.5 3-3.5"/>',
  star: '<path d="m12 2.8 2.8 5.9 6.2.8-4.6 4.4 1.2 6.3L12 17.1l-5.6 3.1 1.2-6.3L3 9.5l6.2-.8L12 2.8Z"/>',
  google: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12h6a6 6 0 1 1-1.8-4.3"/>',
  quote: '<path d="M5 16c-.7-1-1-2.2-1-3.7C4 8.6 6.2 6 9.5 5l.7 1.6C8 7.5 6.9 9 6.8 10.8c.3-.1.6-.2 1-.2 1.6 0 2.8 1.2 2.8 2.8S9.4 16.2 7.7 16.2c-1.1 0-2.1-.5-2.7-1.4Zm9 0c-.7-1-1-2.2-1-3.7 0-3.7 2.2-6.3 5.5-7.3l.7 1.6c-2.2.9-3.3 2.4-3.4 4.2.3-.1.6-.2 1-.2 1.6 0 2.8 1.2 2.8 2.8s-1.2 2.8-2.9 2.8c-1.1 0-2.1-.5-2.7-1.4Z" fill="currentColor" stroke="none"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.3 11a3.8 3.8 0 0 1-.8 7.5H7Z"/>',
  handshake: '<path d="m11 6.5-3.2-1.7L2 8l3.4 6.2 2.2-1.1"/><path d="m16.2 4.8 5.8 3-3.3 6.4-1.5-.8"/><path d="M11 6.5 16.2 4.8l1 8.6-2.5 3.7c-.6.9-1.9 1-2.7.3L7.6 14l3.4-7.5Z"/><path d="m10.4 17.8-1.2 1a1.6 1.6 0 0 1-2.3-.3"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  doc: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5M9.5 13h5M9.5 16.5h5"/>',
  pound: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 8.6a2.6 2.6 0 0 0-4.6 1.7c0 2.4.6 3.4-1.2 5.2h6"/><path d="M8.5 12.6h4.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8h.01"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.4 15a5.5 5.5 0 0 1 3.1 5"/>',
  send: '<path d="m4 11 16-7-5.5 16-3-6.5L4 11Z"/><path d="m11.5 13.5 4-4"/>',
};

export function icon(name, cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.check}</svg>`;
}

export const arrow = icon('arrow');
const starFilled = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.2.8-4.6 4.4 1.2 6.3L12 17.1l-5.6 3.1 1.2-6.3L3 9.5l6.2-.8L12 2.8Z"/></svg>';
export const stars5 = starFilled.repeat(5);

/* Favicon: navy rounded square, gold “381” */
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0d1f42"/><rect x="2.5" y="2.5" width="59" height="59" rx="12" fill="none" stroke="#e8a33d" stroke-opacity=".55" stroke-width="2"/><text x="32" y="42" font-family="Georgia,serif" font-size="26" font-weight="600" fill="#e8a33d" text-anchor="middle">381</text></svg>`
);

/* ---------------- Nav ---------------- */
export const NAV = [
  ['index.html', 'Home', 'home'],
  ['services/index.html', 'Services', 'services'],
  ['about.html', 'About Us', 'about'],
  ['reviews.html', 'Reviews', 'reviews'],
  ['contact.html', 'Contact', 'contact'],
];

const rel = (path) => (path.includes('/') ? '../' : '');

function head({ path, title, desc, jsonld }) {
  const r = rel(path);
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0d1f42">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/css/main.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>`;
}

function topStrip() {
  return `<div class="top-strip">
  <div class="wrap">
    <span class="strip-hours">${icon('clock')} ${SITE.hours} · ${SITE.town}, London</span>
    <div class="strip-links">
      <a href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
      <a href="mailto:${SITE.email}">${icon('mail')} ${SITE.email}</a>
    </div>
  </div>
</div>`;
}

function header_({ path, active }) {
  const r = rel(path);
  const links = NAV.map(([href, label, key]) =>
    `<li><a href="${r}${href}"${key === active ? ' class="active" aria-current="page"' : ''}>${label}</a></li>`
  ).join('\n      ');
  return `<header class="site-header">
  <div class="wrap nav-bar">
    <a class="brand" href="${r}index.html" aria-label="${SITE.name} — home">
      <span class="brand-mark"><span>381</span></span>
      <span class="brand-text"><b>381 Accountants</b><small>Accountancy &amp; Bookkeeping</small></span>
    </a>
    <nav aria-label="Main">
      <ul class="nav-links">
      ${links}
      <li class="nav-links-phone"><a class="btn btn-outline btn-block" href="tel:${SITE.phone1tel}">${icon('phone')} Call ${SITE.phone1}</a></li>
      <li class="nav-book-mobile"><a class="btn btn-gold btn-block" href="${r}contact.html">Book a free consultation</a></li>
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="nav-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
      <a class="btn btn-gold nav-book" href="${r}contact.html">Book a consultation</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false">
        <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>`;
}

function footer_(path, servicesNav) {
  const r = rel(path);
  const svc = servicesNav.map((s) => `<li><a href="${r}services/${s.slug}.html">${s.name}</a></li>`).join('\n        ');
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="${r}index.html">
          <span class="brand-mark"><span>381</span></span>
          <span class="brand-text"><b>381 Accountants</b><small>Accountancy &amp; Bookkeeping</small></span>
        </a>
        <p class="footer-about">${SITE.legal} — an independent firm of certified accountants in ${SITE.town}, serving businesses and individuals across London since ${SITE.established}. Efficient, proactive and personal.</p>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
        ${svc}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="${r}about.html">About us</a></li>
          <li><a href="${r}reviews.html">Client reviews</a></li>
          <li><a href="${r}services/index.html">All services</a></li>
          <li><a href="${r}contact.html">Contact &amp; booking</a></li>
          <li><a href="${SITE.maps}" target="_blank" rel="noopener">Find us on the map</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Get in touch</h4>
        <ul class="footer-contact">
          <li>${icon('pin')} <span>${SITE.address},<br>${SITE.town}, ${SITE.postcode}</span></li>
          <li>${icon('phone')} <span><a href="tel:${SITE.phone1tel}">${SITE.phone1}</a> · <a href="tel:${SITE.phone2tel}">${SITE.phone2}</a></span></li>
          <li>${icon('mail')} <a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li>${icon('clock')} <span>${SITE.hours}</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> ${SITE.legal}. Registered in England &amp; Wales, company no. ${SITE.companyNo}.</span>
      <a href="${SITE.google}" target="_blank" rel="noopener">Read our reviews on Google</a>
    </div>
  </div>
</footer>
<script src="${r}assets/js/site.js"></script>
</body>
</html>`;
}

export function page({ path, title, desc, active, body, servicesNav, jsonld }) {
  return [
    head({ path, title, desc, jsonld }),
    '<body>',
    topStrip(),
    header_({ path, active }),
    '<main>',
    body,
    '</main>',
    footer_(path, servicesNav),
  ].join('\n');
}

/* ---------------- Shared blocks ---------------- */

export function breadcrumbs(path, trail) {
  const r = rel(path);
  const items = trail.map(([label, href], i) =>
    i === trail.length - 1
      ? `<span class="here">${label}</span>`
      : `<a href="${r}${href}">${label}</a>${icon('chevron')}`
  ).join('');
  return `<nav class="crumbs" aria-label="Breadcrumb">${items}</nav>`;
}

export function bookingForm({ heading = 'Book a free consultation', note = 'Tell us what you need — we reply within one working day.', services, selected = '' }) {
  const opts = ['<option value="">Choose a service…</option>']
    .concat(services.map((s) => `<option value="${s.name}"${s.name === selected ? ' selected' : ''}>${s.name}</option>`))
    .concat(['<option value="Something else">Something else / not sure yet</option>'])
    .join('');
  return `<h3>${heading}</h3>
<p class="form-note">${note}</p>
<form class="form-grid" data-book novalidate>
  <div class="field">
    <label for="f-service">Service <span class="req">*</span></label>
    <select id="f-service" name="service" required>${opts}</select>
  </div>
  <div class="form-row">
    <div class="field">
      <label for="f-name">Your name <span class="req">*</span></label>
      <input id="f-name" name="name" type="text" autocomplete="name" required>
    </div>
    <div class="field">
      <label for="f-phone">Phone</label>
      <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">
    </div>
  </div>
  <div class="field">
    <label for="f-email">Email <span class="req">*</span></label>
    <input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required>
  </div>
  <div class="field">
    <label for="f-msg">Anything we should know?</label>
    <textarea id="f-msg" name="message" placeholder="e.g. limited company, first year, needs bookkeeping and VAT"></textarea>
  </div>
  <button class="btn btn-gold btn-block" type="submit">${icon('send')} Request my consultation</button>
  <p class="form-status" role="status" aria-live="polite"></p>
  <p class="form-foot">Prefer to talk? Call <a href="tel:${SITE.phone1tel}"><strong>${SITE.phone1}</strong></a> — ${SITE.hours}.</p>
</form>`;
}

export function ctaBanner(path, { title = 'Ready to hand your numbers to safe hands?', text } = {}) {
  const r = rel(path);
  return `<section class="section tight">
  <div class="wrap">
    <div class="cta-banner rv">
      <div>
        <h2>${title}</h2>
        <p>${text || `Book a free, no-obligation consultation and find out exactly what ${SITE.name} can take off your plate — usually within one working day.`}</p>
      </div>
      <div class="cta-actions">
        <a class="btn btn-gold" href="${r}contact.html">Book a free consultation ${icon('arrow')}</a>
        <a class="cta-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* Real Google reviews (lightly tidied for spelling only). */
export const REVIEWS = [
  {
    text: 'Very responsive, polite and efficient team and service from the very beginning. Very glad I have chosen them and would gladly recommend!',
    who: 'Google review · 5.0',
  },
  {
    text: 'I had my tax return done with 381 Accountants. I must say they know what they are doing. I definitely recommend 381 Accountants for tax advice.',
    who: 'Google review · Self assessment client',
  },
  {
    text: 'Used them for over 5 years now and never had a problem. I would highly recommend them to anyone needing accounting services.',
    who: 'Google review · Long-term client',
  },
];

export function quoteCards(revs = REVIEWS) {
  return revs.map((q, i) => `<figure class="quote-card rv${i ? ` rv-d${i}` : ''}">
  <span class="q-stars" aria-label="5 out of 5 stars">${stars5}</span>
  <blockquote>${q.text}</blockquote>
  <figcaption>${icon('shield')} <span><b>Verified client</b> · ${q.who}</span></figcaption>
</figure>`).join('\n');
}

export function ratingBanner() {
  return `<div class="rating-banner rv">
  <span class="stars" aria-hidden="true">${stars5}</span>
  <b>5.0 on Google</b>
  <span>Unanimous five-star rating from our clients</span>
</div>`;
}
