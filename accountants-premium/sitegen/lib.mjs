/* Layout + shared components for the Fenwick & Rowe PREMIUM site.
   Run `node sitegen/build.mjs` from the accountants-premium folder to
   regenerate the static HTML pages. No runtime build step. */

export const SITE = {
  name: 'Fenwick & Rowe',
  legal: 'Fenwick & Rowe Accountants Ltd',
  companyNo: '00000000',
  established: 2012,
  phone1: '020 7946 0123',
  phone1tel: '+442079460123',
  phone2: '020 7946 0456',
  phone2tel: '+442079460456',
  email: 'fenwickrowe@example.com',
  address: '4 Larch Yard',
  town: 'City of London',
  postcode: 'EC2',
  hours: 'Mon–Fri 9:00–17:30',
  reviewCount: 21,
  areas: ['City of London', 'Shoreditch', 'Clerkenwell', 'Islington', 'Hackney', 'Southwark', 'Bermondsey', 'Camden', 'Greater London', 'Hertfordshire'],
};

export const yearsExp = new Date().getFullYear() - SITE.established;

/* ---------------- Icons (1.5px stroke, 24 grid) ---------------- */
const paths = {
  arrow: '<path d="M3 12h17m0 0-6-6m6 6-6 6"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  pin: '<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2.5"/>',
  shield: '<path d="M12 3 5 5.8v5.4c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V5.8L12 3Z"/><path d="m9 11.5 2 2 4-4.5"/>',
  ledger: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 3v18M12.5 8H16M12.5 12H16M12.5 16H16"/>',
  payroll: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16.5 8h4M16.5 12h4M18 16h2.5"/>',
  vat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"/><path d="m8.5 15.5 7-7M9.3 9.3h.01M14.7 14.7h.01"/>',
  accounts: '<path d="M4 20h16"/><path d="M6.5 20V11M11 20V6M15.5 20v-8M20 20V9" stroke-linecap="round"/>',
  formation: '<path d="M4 21V8l6-4.5L16 8v13"/><path d="M16 12h4v9M8 21v-4.5h4V21"/><path d="M4 21h18"/><path d="M8 10.5h.01M12 10.5h.01"/>',
  planning: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12 8 8"/><path d="M12 3.5V6M20.5 12H18M12 20.5V18M3.5 12H6"/>',
  selfassess: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M9.5 8H12M9.5 12h5M9.5 16h5"/><path d="m14.5 6.5 1.5 1.5 3-3.5"/>',
  star: '<path d="m12 2.8 2.8 5.9 6.2.8-4.6 4.4 1.2 6.3L12 17.1l-5.6 3.1 1.2-6.3L3 9.5l6.2-.8L12 2.8Z"/>',
  quote: '<path d="M5 16c-.7-1-1-2.2-1-3.7C4 8.6 6.2 6 9.5 5l.7 1.6C8 7.5 6.9 9 6.8 10.8c.3-.1.6-.2 1-.2 1.6 0 2.8 1.2 2.8 2.8S9.4 16.2 7.7 16.2c-1.1 0-2.1-.5-2.7-1.4Zm9 0c-.7-1-1-2.2-1-3.7 0-3.7 2.2-6.3 5.5-7.3l.7 1.6c-2.2.9-3.3 2.4-3.4 4.2.3-.1.6-.2 1-.2 1.6 0 2.8 1.2 2.8 2.8s-1.2 2.8-2.9 2.8c-1.1 0-2.1-.5-2.7-1.4Z" fill="currentColor" stroke="none"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.3 11a3.8 3.8 0 0 1-.8 7.5H7Z"/>',
  handshake: '<path d="m11 6.5-3.2-1.7L2 8l3.4 6.2 2.2-1.1"/><path d="m16.2 4.8 5.8 3-3.3 6.4-1.5-.8"/><path d="M11 6.5 16.2 4.8l1 8.6-2.5 3.7c-.6.9-1.9 1-2.7.3L7.6 14l3.4-7.5Z"/><path d="m10.4 17.8-1.2 1a1.6 1.6 0 0 1-2.3-.3"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  doc: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5M9.5 13h5M9.5 16.5h5"/>',
  pound: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 8.6a2.6 2.6 0 0 0-4.6 1.7c0 2.4.6 3.4-1.2 5.2h6"/><path d="M8.5 12.6h4.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8h.01"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.4 15a5.5 5.5 0 0 1 3.1 5"/>',
  send: '<path d="m4 11 16-7-5.5 16-3-6.5L4 11Z"/><path d="m11.5 13.5 4-4"/>',
  spark: '<path d="M12 3c.6 3.9 2.6 6 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5C9.4 9 11.4 6.9 12 3Z"/><path d="M19 14.5c.3 2 1.3 3 3.2 3.3-1.9.3-2.9 1.3-3.2 3.2-.3-1.9-1.3-2.9-3.2-3.2 1.9-.3 2.9-1.3 3.2-3.3Z"/>',
  timer: '<path d="M10 2.5h4M12 8.5v4.5l2.8 1.7"/><circle cx="12" cy="13.5" r="7.5"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M15 12h5v3.5h-5a1.75 1.75 0 1 1 0-3.5Z"/><path d="M4 9h11"/>',
  trend: '<path d="m3.5 16.5 5-5.5 3.6 3.4 8-8.4"/><path d="M15.5 6h4.6v4.6"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.1 5-5 2.1 2.1-5 5-2.1Z"/>',
};

export function icon(name, cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.check}</svg>`;
}

const starFilled = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.2.8-4.6 4.4 1.2 6.3L12 17.1l-5.6 3.1 1.2-6.3L3 9.5l6.2-.8L12 2.8Z"/></svg>';
export const stars5 = starFilled.repeat(5);

/* Favicon: obsidian rounded square, gold F&R monogram */
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#060d1c"/><rect x="2.5" y="2.5" width="59" height="59" rx="14" fill="none" stroke="#e3a44b" stroke-opacity=".6" stroke-width="2"/><text x="32" y="43" font-family="Georgia,serif" font-size="21" font-weight="600" fill="#f2c076" text-anchor="middle">F&amp;R</text></svg>`
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
<meta name="theme-color" content="#060d1c">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/css/main.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>`;
}

function header_({ path, active }) {
  const r = rel(path);
  const links = NAV.map(([href, label, key]) =>
    `<li><a href="${r}${href}"${key === active ? ' class="active" aria-current="page"' : ''}>${label}</a></li>`
  ).join('\n      ');
  const mobileLinks = NAV.map(([href, label, key], i) =>
    `<li style="--i:${i}"><a href="${r}${href}"${key === active ? ' class="active" aria-current="page"' : ''}><span class="menu-num">0${i + 1}</span>${label}</a></li>`
  ).join('\n      ');
  return `<div class="progress-bar" aria-hidden="true"><i></i></div>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap nav-bar">
    <a class="brand" href="${r}index.html" aria-label="${SITE.name} home">
      <span class="brand-mark" aria-hidden="true"><span>F&amp;R</span></span>
      <span class="brand-text"><b>Fenwick &amp; Rowe</b><small>City of London · Est. ${SITE.established}</small></span>
    </a>
    <nav aria-label="Main">
      <ul class="nav-links">
      ${links}
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="nav-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
      <a class="btn btn-gold nav-book magnetic" href="${r}contact.html"><span>Book a consultation</span></a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="menu-overlay" aria-hidden="true">
  <div class="menu-aurora"></div>
  <nav aria-label="Mobile">
    <ul class="menu-links">
      ${mobileLinks}
    </ul>
    <div class="menu-foot">
      <a class="btn btn-gold btn-block" href="${r}contact.html">Book a free consultation</a>
      <a class="menu-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
    </div>
  </nav>
</div>`;
}

function footer_(path, servicesNav) {
  const r = rel(path);
  const svc = servicesNav.map((s) => `<li><a href="${r}services/${s.slug}.html">${s.name}</a></li>`).join('\n        ');
  return `<footer class="site-footer">
  <div class="footer-glow" aria-hidden="true"></div>
  <div class="wrap">
    <div class="footer-top">
      <p class="footer-word">Numbers, <em>kept straight</em>.</p>
      <a class="btn btn-gold magnetic" href="${r}contact.html"><span>Book a free consultation</span></a>
    </div>
    <div class="footer-grid">
      <div>
        <a class="brand" href="${r}index.html">
          <span class="brand-mark" aria-hidden="true"><span>F&amp;R</span></span>
          <span class="brand-text"><b>Fenwick &amp; Rowe</b><small>Accountancy &amp; Bookkeeping</small></span>
        </a>
        <p class="footer-about">${SITE.legal} is an independent firm of certified accountants at ${SITE.address} in the ${SITE.town}, serving businesses and individuals across London since ${SITE.established}.</p>
        <p class="footer-rating">${stars5} <span>5.0 · ${SITE.reviewCount} client reviews</span></p>
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
        </ul>
      </div>
      <div class="footer-col">
        <h4>Get in touch</h4>
        <ul class="footer-contact">
          <li>${icon('pin')} <span>${SITE.address},<br>London ${SITE.postcode}</span></li>
          <li>${icon('phone')} <span><a href="tel:${SITE.phone1tel}">${SITE.phone1}</a> · <a href="tel:${SITE.phone2tel}">${SITE.phone2}</a></span></li>
          <li>${icon('mail')} <a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li>${icon('clock')} <span>${SITE.hours}</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> ${SITE.legal}. Registered in England &amp; Wales, company no. ${SITE.companyNo}.</span>
      <a href="${r}reviews.html">Read client reviews</a>
    </div>
  </div>
</footer>
<button class="to-top" aria-label="Back to top">
  <svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle class="ring-fill" cx="24" cy="24" r="21"/></svg>
  ${icon('chevron', 'up')}
</button>
<script src="${r}assets/js/site.js"></script>
</body>
</html>`;
}

export function page({ path, title, desc, active, body, servicesNav, jsonld }) {
  return [
    head({ path, title, desc, jsonld }),
    '<body>',
    header_({ path, active }),
    '<main id="main">',
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

/* Sample reviews written for this demonstration site. Names and details
   are fictional. */
export const REVIEWS = [
  { text: 'Calm, careful and quick to answer. I joined when the firm was still small and have never once thought about moving. Every deadline is handled before I have even remembered it exists.', name: 'Priya S.', meta: 'Café owner, client since 2012' },
  { text: 'They took over my books when they were a real mess and had everything straightened out within a month. Clear advice, no jargon and a fixed fee that never creeps up.', name: 'Tom W.', meta: 'Builder, client for 8 years' },
  { text: 'Our accountant knows the business as well as we do. Friendly, sharp and always there when HMRC sends a letter. We would not go anywhere else.', name: 'Grace O.', meta: 'Design studio director, client for 10 years' },
];

export const REVIEWS_ALL = [
  { text: 'Switching to Fenwick &amp; Rowe was painless. They handled the clearance letter and the handover, and our first year end with them went smoothly. I recommend them to anyone who needs an accountant.', name: 'Marcus L.', meta: 'Client for 6 years' },
  { text: 'Over a decade with this firm and they have only become more useful. Proper advice, not just form filling.', name: 'Hannah B.', meta: 'Client for 11 years' },
  { text: 'Very organised and very patient. They explained my tax position in plain English and spotted reliefs I had no idea I could claim. Always quick to pick up the phone when something comes up.', name: 'Daniel K.', meta: 'Client for 5 years' },
  { text: 'They have looked after our payroll and VAT since 2014. Accurate every month, and the fees are exactly what we agreed at the start.', name: 'Ellis M.', meta: 'Director, Bramblewick Joinery Ltd, client since 2014' },
  { text: 'Trustworthy and efficient from day one. I have never had a late filing or a surprise bill.', name: 'Sofia R.', meta: 'Client since 2014' },
  { text: 'Proactive rather than reactive. They tell me what is coming up months before it is due, and the team is organised from top to bottom.', name: 'Ravi P.', meta: 'Client since 2017' },
  { text: 'They look after both my limited company and my personal return. Helpful and professional in every respect, and fairly priced for the City.', name: 'Amira H.', meta: 'Company and personal tax client' },
  { text: 'Replies come back the same day, usually within the hour. Exactly what a small business needs from its accountant.', name: 'Oliver T.', meta: 'Client since 2015' },
  { text: 'Sharp, honest and genuinely good company. Ten out of ten.', name: 'Jess N.', meta: 'Florist' },
  { text: 'Good value, straight answers and a team that clearly cares about getting it right.', name: 'Kwame A.', meta: 'Restaurant owner' },
  { text: 'My first ever tax return and they made it feel easy. I booked them again for next year straight away.', name: 'Lucy F.', meta: 'First time self assessment client' },
  { text: 'We have worked with them since 2013 and it is still a pleasure every year.', name: 'Martin D.', meta: 'Client since 2013' },
  { text: 'Peace of mind for a fixed monthly fee. No hidden charges and no chasing.', name: 'Chloe V.', meta: 'Online shop owner' },
  { text: 'They rescued a self assessment for me with two days to spare. Very grateful!', name: 'Sam G.', meta: 'Self assessment client' },
  { text: 'Fast, professional and no fuss at all. Highly recommended.', name: 'Nadia Q.', meta: 'Physiotherapist' },
  { text: 'Clear on tax and clear on fees. A reliable accountant and a good adviser.', name: 'Ben C.', meta: 'IT contractor' },
  { text: 'They know their work inside out. We feel lucky to have found them.', name: 'Ruth E.', meta: 'Bookshop owner' },
  { text: 'Calm and dependable when things get difficult. I recommend them to everyone I know.', name: 'Leon J.', meta: 'Landlord' },
];

export function quoteCard(q, extra = '') {
  return `<figure class="quote-card tilt${extra ? ' ' + extra : ''}">
  <span class="q-stars" aria-label="5 out of 5 stars">${stars5}</span>
  <blockquote>${q.text}</blockquote>
  <figcaption>${icon('quote')} <span><b>${q.name}</b> · ${q.meta} · Sample review</span></figcaption>
</figure>`;
}

/* Multi-step booking wizard. Services passed in for step one. */
export function wizard(services, { heading = 'Book your free consultation' } = {}) {
  const chips = services.map((s) => `<button type="button" class="wiz-chip" data-service="${s.name}">${icon(s.icon)}<span>${s.name}</span></button>`).join('\n        ')
    + `\n        <button type="button" class="wiz-chip" data-service="Not sure yet">${icon('compass')}<span>Not sure yet</span></button>`;
  return `<div class="wizard" data-wizard>
  <div class="wiz-head">
    <h3>${heading}</h3>
    <div class="wiz-progress" aria-hidden="true"><i></i></div>
    <ol class="wiz-dots">
      <li class="on">Service</li><li>Details</li><li>Send</li>
    </ol>
  </div>
  <form novalidate>
    <fieldset class="wiz-step on" data-step="1">
      <legend>Which service do you need?</legend>
      <div class="wiz-chips">
        ${chips}
      </div>
      <input type="hidden" name="service" value="">
      <p class="wiz-err" role="alert"></p>
      <div class="wiz-nav">
        <span></span>
        <button type="button" class="btn btn-gold wiz-next"><span>Continue</span> ${icon('arrow')}</button>
      </div>
    </fieldset>
    <fieldset class="wiz-step" data-step="2">
      <legend>Tell us where to reach you</legend>
      <div class="form-row">
        <div class="field">
          <label for="w-name">Your name <span class="req">*</span></label>
          <input id="w-name" name="name" type="text" autocomplete="name" required>
        </div>
        <div class="field">
          <label for="w-phone">Phone</label>
          <input id="w-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">
        </div>
      </div>
      <div class="field">
        <label for="w-email">Email <span class="req">*</span></label>
        <input id="w-email" name="email" type="email" autocomplete="email" inputmode="email" required>
      </div>
      <div class="field">
        <label for="w-msg">Anything we should know?</label>
        <textarea id="w-msg" name="message" placeholder="e.g. limited company, first year, books three months behind"></textarea>
      </div>
      <p class="wiz-err" role="alert"></p>
      <div class="wiz-nav">
        <button type="button" class="btn btn-ghost wiz-back">${icon('left')} <span>Back</span></button>
        <button type="button" class="btn btn-gold wiz-next"><span>Review</span> ${icon('arrow')}</button>
      </div>
    </fieldset>
    <fieldset class="wiz-step" data-step="3">
      <legend>Ready to send</legend>
      <div class="wiz-summary"></div>
      <p class="wiz-note">Sending opens a pre-addressed email draft to <b>${SITE.email}</b>. Press send in your mail app and we reply within one working day.</p>
      <p class="form-status" role="status" aria-live="polite"></p>
      <div class="wiz-nav">
        <button type="button" class="btn btn-ghost wiz-back">${icon('left')} <span>Back</span></button>
        <button type="submit" class="btn btn-gold magnetic"><span>${icon('send')} Open my email draft</span></button>
      </div>
    </fieldset>
  </form>
  <p class="wiz-alt">Rather talk? Call <a href="tel:${SITE.phone1tel}"><b>${SITE.phone1}</b></a> (${SITE.hours}).</p>
</div>`;
}

export function ctaBanner(path, { title = 'Ready to put your numbers with someone who keeps them straight?', text } = {}) {
  const r = rel(path);
  return `<section class="section tight">
  <div class="wrap">
    <div class="cta-banner rv">
      <div class="cta-aurora" aria-hidden="true"></div>
      <div>
        <h2>${title}</h2>
        <p>${text || `Book a free, no-obligation consultation and find out exactly what ${SITE.name} can take off your plate. We usually reply within one working day.`}</p>
      </div>
      <div class="cta-actions">
        <a class="btn btn-gold btn-lg magnetic" href="${r}contact.html"><span>Book a free consultation ${icon('arrow')}</span></a>
        <a class="cta-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
      </div>
    </div>
  </div>
</section>`;
}
