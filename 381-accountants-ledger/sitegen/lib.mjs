/* Layout + shared components for the Ledger edition of the 381 Accountants
   site. Run `node sitegen/build.mjs` from the 381-accountants-ledger folder
   to regenerate the static HTML pages. No runtime build step.

   Business facts, reviews and service content are imported from the
   standard edition's generator, so a fact confirmed once (fees, team,
   regulation) appears in both editions after a rebuild of each. */
import {
  SITE, REVIEWS, REVIEWS_ALL, tbc, fact,
} from '../../381-accountants/sitegen/lib.mjs';
import { services } from '../../381-accountants/sitegen/content-services.mjs';

export { SITE, REVIEWS, REVIEWS_ALL, tbc, fact, services };

export const rel = (path) => (path.includes('/') ? '../' : '');
export const CTA = 'Book a free consultation';
export const bookHref = (path, service = '') =>
  `${rel(path)}contact.html${service ? `?service=${encodeURIComponent(service)}` : ''}#book`;
export const yearsExp = new Date().getFullYear() - SITE.established;

export const feeText = (svc) => (svc.fee.from == null
  ? `From ${tbc('£ to confirm')} ${svc.fee.basis}`
  : `From £${svc.fee.from.toLocaleString('en-GB')} ${svc.fee.basis}`);

/* ---------------- Icons (1.5px stroke, 24 grid) ---------------- */
const paths = {
  arrow: '<path d="M4 12h16m0 0-6-6m6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  pin: '<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m4.5 12.5 4.5 4.5L19.5 6.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
};
export function icon(name, cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#0B5A43"/><text x="32" y="41" font-family="ui-monospace,Menlo,monospace" font-size="24" font-weight="600" fill="#F4F1EA" text-anchor="middle">381</text></svg>'
);

/* ---------------- Nav ---------------- */
export const NAV = [
  ['services/index.html', 'Services & fees', 'services'],
  ['deadlines.html', 'Deadlines', 'deadlines'],
  ['about.html', 'About', 'about'],
  ['reviews.html', 'Reviews', 'reviews'],
  ['contact.html', 'Contact', 'contact'],
];

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
<meta name="theme-color" content="#F4F1EA">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="icon" href="${FAVICON}">
<link rel="preload" href="${r}assets/fonts/schibsted-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${r}assets/css/main.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>`;
}

function header_({ path, active }) {
  const r = rel(path);
  const links = NAV.map(([href, label, key]) =>
    `<li><a href="${r}${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a></li>`
  ).join('\n        ');
  return `<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="${r}index.html" aria-label="${SITE.name}, home">
      <span class="brand-mark" aria-hidden="true">381</span>
      <span class="brand-name">Accountants</span>
    </a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul>
        ${links}
      </ul>
      <div class="nav-extra">
        <a class="nav-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
        <a class="btn btn-primary btn-block" href="${bookHref(path)}">${CTA}</a>
      </div>
    </nav>
    <div class="bar-end">
      <a class="bar-phone" href="tel:${SITE.phone1tel}">${SITE.phone1}</a>
      <a class="btn btn-primary bar-book" href="${bookHref(path)}"><span class="bb-long">${CTA}</span><span class="bb-short" aria-hidden="true">Book</span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">Menu</span>${icon('menu', 'i-open')}${icon('close', 'i-close')}</button>
    </div>
  </div>
</header>`;
}

function footer_(path) {
  const r = rel(path);
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="${r}index.html"><span class="brand-mark" aria-hidden="true">381</span><span class="brand-name">Accountants</span></a>
        <p>${SITE.legal}. Independent certified accountants in ${SITE.town}, serving businesses and individuals across London since ${SITE.established}.</p>
      </div>
      <div>
        <h2 class="foot-h">Services</h2>
        <ul>
          ${services.map((s) => `<li><a href="${r}services/${s.slug}.html">${s.name}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h2 class="foot-h">Firm</h2>
        <ul>
          <li><a href="${r}services/index.html#fees">Fees</a></li>
          <li><a href="${r}deadlines.html">Deadline finder</a></li>
          <li><a href="${r}about.html">About &amp; regulation</a></li>
          <li><a href="${r}reviews.html">Client reviews</a></li>
          <li><a href="${r}contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2 class="foot-h">Office</h2>
        <address>${SITE.address}<br>${SITE.town}, London ${SITE.postcode}</address>
        <p class="foot-lines"><a href="tel:${SITE.phone1tel}">${SITE.phone1}</a><br><a href="tel:${SITE.phone2tel}">${SITE.phone2}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a><br>${SITE.hours}</p>
      </div>
    </div>
    <div class="foot-base">
      <span>© <span data-year>2026</span> ${SITE.legal}. Registered in England &amp; Wales, company no. ${SITE.companyNo}.</span>
      <a href="${SITE.google}" target="_blank" rel="noopener">Our reviews on Google ${icon('arrowUpRight')}</a>
    </div>
  </div>
</footer>
<script src="${r}assets/js/site.js" defer></script>
</body>
</html>`;
}

export function page({ path, title, desc, active, body, jsonld }) {
  return [
    head({ path, title, desc, jsonld }),
    '<body>',
    '<a class="skip-link" href="#main">Skip to content</a>',
    header_({ path, active }),
    '<main id="main" tabindex="-1">',
    body,
    '</main>',
    footer_(path),
  ].join('\n');
}

/* ---------------- Shared blocks ---------------- */

/* Section heading on the Swiss grid: a numbered label in the left column,
   the heading and intro in the right. */
export function sectionHead({ no, label, title, intro = '', id = '' }) {
  return `<div class="sec-head">
  <p class="sec-label"><span class="mono">${no}</span> ${label}</p>
  <div>
    <h2${id ? ` id="${id}"` : ''}>${title}</h2>
    ${intro ? `<p class="sec-intro">${intro}</p>` : ''}
  </div>
</div>`;
}

export function breadcrumbs(path, trail) {
  const r = rel(path);
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map(([label, href], i) =>
    i === trail.length - 1
      ? `<li aria-current="page">${label}</li>`
      : `<li><a href="${r}${href}">${label}</a></li>`
  ).join('')}</ol></nav>`;
}

export function pageHero(path, { trail, kicker, title, lede, actions = '' }) {
  return `<section class="page-hero">
  <div class="wrap">
    ${breadcrumbs(path, trail)}
    <div class="ph-grid">
      <p class="kicker mono">${kicker}</p>
      <div>
        <h1>${title}</h1>
        <p class="lede">${lede}</p>
        ${actions ? `<div class="actions">${actions}</div>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

export function ctaBand(path, { title = 'One conversation, and the paperwork becomes ours.', text } = {}) {
  return `<section class="cta-band">
  <div class="wrap cta-grid">
    <div>
      <h2>${title}</h2>
      <p>${text || `The first consultation is free and without obligation. You leave it with a fixed fee in writing, or simply with answers. A real person replies within one working day.`}</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-light" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
      <a class="cta-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
    </div>
  </div>
</section>`;
}

export function servicesLedger(path, { fees = true, headingLevel = 3 } = {}) {
  const r = rel(path);
  const h = `h${headingLevel}`;
  return `<ol class="ledger">
${services.map((s, i) => `  <li class="ledger-row">
    <span class="ledger-no mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <div class="ledger-main">
      <${h}><a class="row-link" href="${r}services/${s.slug}.html">${s.name}</a></${h}>
      <p>${s.short}</p>
    </div>
    ${fees ? `<p class="ledger-fee">${feeText(s)}</p>` : ''}
    <span class="ledger-go" aria-hidden="true">${icon('arrow')}</span>
  </li>`).join('\n')}
</ol>`;
}

export function reviewFigure(q, { large = false } = {}) {
  return `<figure class="quote${large ? ' quote-lg' : ''}">
  <blockquote><p>${q.text}</p></blockquote>
  <figcaption><b>${q.name}</b> <span>${q.meta} · Google review</span></figcaption>
</figure>`;
}

export function ratingLine() {
  return `<p class="rating-line"><span class="stars" role="img" aria-label="5 out of 5 stars">★★★★★</span> <b>5.0</b> from ${SITE.reviewCount} Google reviews · <a href="${SITE.google}" target="_blank" rel="noopener">check them on Google ${icon('arrowUpRight')}</a></p>`;
}

export function bookingForm({ heading = CTA, note = 'Tell us what you need. A real person replies within one working day.' } = {}) {
  const opts = ['<option value="">Choose a service…</option>']
    .concat(services.map((s) => `<option value="${s.name}">${s.name}</option>`))
    .concat(['<option value="Something else">Something else / not sure yet</option>'])
    .join('');
  return `<form class="book-form" data-book novalidate aria-labelledby="book-h">
  <h2 id="book-h">${heading}</h2>
  <p class="form-note">${note}</p>
  <div class="field">
    <label for="f-service">Service <span class="req" aria-hidden="true">*</span></label>
    <select id="f-service" name="service" required>${opts}</select>
  </div>
  <div class="field-row">
    <div class="field">
      <label for="f-name">Your name <span class="req" aria-hidden="true">*</span></label>
      <input id="f-name" name="name" type="text" autocomplete="name" required>
    </div>
    <div class="field">
      <label for="f-phone">Phone</label>
      <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">
    </div>
  </div>
  <div class="field">
    <label for="f-email">Email <span class="req" aria-hidden="true">*</span></label>
    <input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-hint">
    <p class="hint" id="f-email-hint">We only use it to reply to you.</p>
  </div>
  <div class="field">
    <label for="f-msg">Anything we should know?</label>
    <textarea id="f-msg" name="message" rows="4" placeholder="e.g. limited company, year end 31 March, bookkeeping is six months behind"></textarea>
  </div>
  <p class="form-errors" role="alert" hidden></p>
  <button class="btn btn-primary btn-block" type="submit">Send my request ${icon('arrow')}</button>
  <p class="form-status" role="status" aria-live="polite"></p>
  <p class="form-foot">Submitting opens an email to ${SITE.email} with your details filled in. Prefer to talk? <a href="tel:${SITE.phone1tel}">${SITE.phone1}</a>, ${SITE.hours}.</p>
</form>`;
}

/* Deadline finder. Server-rendered with the rules written out, so it is
   useful without JavaScript; site.js adds the date calculation. */
export function deadlineFinder(path, { compact = false } = {}) {
  const r = rel(path);
  return `<div class="finder" data-finder>
  <form class="finder-form" aria-describedby="finder-note">
    <div class="field">
      <label for="ye">Your company’s year end</label>
      <input id="ye" name="ye" type="date" required>
    </div>
    <div class="field">
      <label for="vat">VAT quarters end in <span class="opt">(optional)</span></label>
      <select id="vat" name="vat">
        <option value="">Not VAT registered</option>
        <option value="3">Mar, Jun, Sep, Dec</option>
        <option value="1">Jan, Apr, Jul, Oct</option>
        <option value="2">Feb, May, Aug, Nov</option>
      </select>
    </div>
    <button class="btn btn-primary" type="submit">Show my dates ${icon('calendar')}</button>
  </form>
  <div class="finder-out" aria-live="polite">
    <table class="dates">
      <caption class="sr-only">Standard filing and payment deadlines</caption>
      <thead><tr><th scope="col">Deadline</th><th scope="col">What is due</th><th scope="col" class="dates-left"><span class="sr-only">Time left</span></th></tr></thead>
      <tbody data-finder-rows>
        <tr><td class="mono">Year end + 9 months</td><td>Company accounts filed at Companies House</td><td></td></tr>
        <tr><td class="mono">Year end + 9 months + 1 day</td><td>Corporation tax paid to HMRC</td><td></td></tr>
        <tr><td class="mono">Year end + 12 months</td><td>Company tax return (CT600) filed with HMRC</td><td></td></tr>
        <tr><td class="mono">1 month + 7 days after each VAT quarter</td><td>VAT return filed and paid</td><td></td></tr>
        <tr><td class="mono">31 January</td><td>Self assessment return filed and balance paid, plus first payment on account</td><td></td></tr>
        <tr><td class="mono">31 July</td><td>Second self assessment payment on account</td><td></td></tr>
      </tbody>
    </table>
  </div>
  <p class="finder-note" id="finder-note">Standard deadlines for a private limited company filing its second or later accounts, and for personal self assessment. First accounts, changed year ends and some VAT schemes differ; we confirm every date at the consultation.${compact ? ` <a href="${r}deadlines.html">How each date is worked out</a>.` : ''}</p>
</div>`;
}

/* Questions people ask before trusting an accountant with their records. */
export function trustFaqs(path) {
  const r = rel(path);
  const lead = SITE.team[0];
  return [
    ['How do your fees work?', `Every engagement is a fixed fee agreed in writing before work starts, based on the services you need and the state of your records. Starting prices for each service are in the <a href="${r}services/index.html#fees">fees table</a>. The consultation that produces your quote is free.`],
    ['Who will I actually deal with?', `The people doing your work, directly, by phone or email during office hours: ${fact(lead.name, 'name')}, ${fact(lead.quals, 'qualification')}, and the team on the <a href="${r}about.html#people">About page</a>.`],
    ['Who regulates you?', `${SITE.legal} is registered in England &amp; Wales (company no. ${SITE.companyNo}). Professional body: ${fact(SITE.professionalBody, 'to confirm')}. Anti-money-laundering supervision: ${fact(SITE.amlSupervisor, 'to confirm')}. Professional indemnity insurance: ${fact(SITE.indemnity, 'to confirm')}.`],
    ['Can you take over from my current accountant?', 'Yes. With your permission we write to your current accountant for professional clearance and your records, and handle the whole handover.'],
    ['What if I want to move on later?', `Give us ${fact(SITE.noticePeriod, 'notice period')} notice. Your new accountant writes to us for professional clearance and we hand over your records and everything they need to carry on.`],
    ['My books are months behind. Is that a problem?', 'No. Backlogs, missed returns and HMRC letters are routine work for us. The sooner you get in touch, the cheaper they are to fix.'],
  ];
}

export function faqList(items) {
  return `<div class="faq">
${items.map(([q, a]) => `  <details><summary><span>${q}</span>${icon('plus')}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}
</div>`;
}
