/* Layout + shared components for the 381 Accountants PREMIUM site.
   Run `node sitegen/build.mjs` from the 381-accountants-premium folder to
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
  address: '10th Floor, Office 104, Suite 10, 30 Churchill Place',
  town: 'Canary Wharf',
  postcode: 'E14 5RE',
  hours: 'Mon–Fri 9:00–17:30',
  reviewCount: 42,
  google: 'https://www.google.com/search?q=381+Accountancy+%26+Bookkeeping+Services+Ltd+Canary+Wharf+reviews',
  maps: 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('381 Accountancy & Bookkeeping Services Ltd, 30 Churchill Pl, Canary Wharf, London E14 5RE'),
  areas: ['Canary Wharf', 'Barking', 'Ilford', 'Dagenham', 'Woodford', 'Bexley', 'Romford', 'East London', 'Greater London', 'Essex'],
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
  google: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12h6a6 6 0 1 1-1.8-4.3"/>',
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

/* Favicon: obsidian rounded square, gold 381 */
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#060d1c"/><rect x="2.5" y="2.5" width="59" height="59" rx="14" fill="none" stroke="#e3a44b" stroke-opacity=".6" stroke-width="2"/><text x="32" y="43" font-family="Georgia,serif" font-size="26" font-weight="600" fill="#f2c076" text-anchor="middle">381</text></svg>`
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
      <span class="brand-mark"><span>381</span></span>
      <span class="brand-text"><b>381 Accountants</b><small>Canary Wharf · Est. ${SITE.established}</small></span>
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
      <p class="footer-word">Numbers, in <em>safe hands</em>.</p>
      <a class="btn btn-gold magnetic" href="${r}contact.html"><span>Book a free consultation</span></a>
    </div>
    <div class="footer-grid">
      <div>
        <a class="brand" href="${r}index.html">
          <span class="brand-mark"><span>381</span></span>
          <span class="brand-text"><b>381 Accountants</b><small>Accountancy &amp; Bookkeeping</small></span>
        </a>
        <p class="footer-about">${SITE.legal} is an independent firm of certified accountants at 30 Churchill Place, ${SITE.town}, serving businesses and individuals across London since ${SITE.established}.</p>
        <p class="footer-rating">${stars5} <span>5.0 · ${SITE.reviewCount} Google reviews</span></p>
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
          <li>${icon('pin')} <span>${SITE.address},<br>${SITE.town}, London ${SITE.postcode}</span></li>
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

/* Real Google reviews, published names, lightly tidied for spelling only. */
export const REVIEWS = [
  { text: 'Very professional, specialised, trustworthy and friendly service. Fast and quick response to any question. I strongly recommend to new customers and clients. I have been with this firm over 25 years and I would never change to a different accountant.', name: 'Gulsara Sarah Wennell', meta: 'Client for over 25 years' },
  { text: 'I’ve been using 381 accountants for nearly 7 years. They’ve always provided an excellent service. They are efficient, fast and reliable and also great with giving advice that could benefit your business. I would highly recommend them.', name: 'Sima Akram', meta: 'Client for 7 years' },
  { text: 'Been with 381 Accountancy for a decade now; I have never come across such professionalism. My accountant is very down to earth. Very reliable service, always there to help, no messing around!', name: 'Zulfiqar Ali', meta: 'Client for 10 years' },
];

export const REVIEWS_ALL = [
  { text: 'Habib and team offer an amazing service. I have used them for over 5 years now and never had a problem. I would highly recommend them to anyone needing accounting services.', name: 'Dustin Clark', meta: 'Client for 5+ years' },
  { text: 'We have been using 381 accountancy service for more than 10 years. One of the best decisions we have taken to go with this company.', name: 'Ram Krish', meta: 'Client for 10+ years' },
  { text: 'I have been using 381 Accountancy service for 5 years now. They have always been very professional, extremely knowledgeable and efficient. They are always available to answer any questions and help resolve any issues promptly. I would recommend them highly.', name: 'William Punter', meta: 'Client for 5 years' },
  { text: 'Since 2013 we’ve been with the 381 Accountancy & Bookkeeping family. An amazing service provided by Habib and the entire team; the value they give to their customers is remarkable.', name: 'Universal Electronic Limited', meta: 'Business client since 2013' },
  { text: 'I use them since 2011 and they have never let me down. Trusting and efficient, this is how I describe their services. Thank you so much!', name: 'Priscila Currie', meta: 'Client since 2011' },
  { text: 'I have been using 381 Accountants since 2017 and never had any issues with them. I found the team very professional and organised, and they are proactive rather than reactive.', name: 'Ajaz Ul Hussin', meta: 'Client since 2017' },
  { text: 'I’m using this accountancy service for the last 5 years, for my company and for self employment, and found them extremely cooperative and professional in every aspect. Their rates are also competitive with any top-class UK accountancy firm.', name: 'Amir Kh', meta: 'Company & self-employed client' },
  { text: 'I have been with 381 Accountancy since 2013. They are extremely professional in the accounting process and always respond promptly to my queries. I would definitely recommend this service.', name: 'Srinivas Marisetti', meta: 'Client since 2013' },
  { text: 'Extremely responsive and prompt, professional integrity, solid competence and advice, very proactive. Above all a joy to work with. 10/10.', name: 'Shubh', meta: 'Google review' },
  { text: 'Very professional, very helpful and honest, good value for money, and gives great advice. Would definitely recommend Habib and his team at 381 Accountants.', name: 'Zoob Khan', meta: 'Google review' },
  { text: 'Best service ever seen so far. Very professional and prompt. Very helpful with my first tax returns. Will try them again next year.', name: 'Taqweem Mirza', meta: 'First-time self assessment client' },
  { text: 'We’ve been working with them since 2012, always very helpful and professional. A pleasure to work with.', name: 'Sofia Gouveia', meta: 'Client since 2012' },
  { text: 'The best accountancy service provider. Peace of mind, accuracy and no hidden charges. Highly recommended.', name: 'Knowledge Bank', meta: 'Google review' },
  { text: 'Super helpful, helping with a self assessment on very short notice!', name: 'Carlo Rizzo', meta: 'Self assessment client' },
  { text: 'Great price. Fast, professional, and hassle-free. Highly recommended.', name: 'Waleed Nawaz', meta: 'Google review' },
  { text: 'I would highly recommend them as tax consultant and accountant. They are very professional and reliable.', name: 'Qasim Mehmood', meta: 'Google review' },
  { text: 'Excellent service and they know their job thoroughly. Lucky to have such a good accountant.', name: 'Muhammad Tareen', meta: 'Google review' },
  { text: 'Excellent and reliable work, always there to help in times of difficulty. A great accountant; I will recommend them to anyone.', name: 'Calm Souls', meta: 'Google review' },
];

export function quoteCard(q, extra = '') {
  return `<figure class="quote-card tilt${extra ? ' ' + extra : ''}">
  <span class="q-stars" aria-label="5 out of 5 stars">${stars5}</span>
  <blockquote>${q.text}</blockquote>
  <figcaption>${icon('google')} <span><b>${q.name}</b> · ${q.meta} · Google review</span></figcaption>
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

export function ctaBanner(path, { title = 'Ready to put your numbers in safe hands?', text } = {}) {
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
