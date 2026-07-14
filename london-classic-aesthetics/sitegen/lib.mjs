/* Layout + shared components for the London Classic Aesthetics site.
   Run `node sitegen/build.mjs` from the london-classic-aesthetics folder
   to regenerate the static HTML pages. No runtime build step. */

export const SITE = {
  name: 'London Classic Aesthetics',
  short: 'LCA',
  email: 'info@londonclassicaesthetics.com',
  address: '157 Seymour Place, London W1H 4PQ',
  area: 'Marylebone, London W1',
  station: 'Edgware Road',
  fresha: 'https://www.fresha.com/a/london-classic-aesthetics-london-uk-157-seymour-place-nmef8zpm',
  treatwell: 'https://www.treatwell.co.uk/place/london-classic-aesthetics/',
  instagram: 'https://www.instagram.com/londonclassicaesthetic/',
  facebook: 'https://www.facebook.com/londonclassicaesthetic',
};

/* ---------------- Icons (1.5px stroke, 24 grid) ---------------- */
const paths = {
  arrow: '<path d="M3 12h17m0 0-6-6m6 6-6 6"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  caret: '<path d="m5 9 7 7 7-7"/>',
  pin: '<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  shield: '<path d="M12 3 5 5.8v5.4c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V5.8L12 3Z"/><path d="M12 8.2v5.6M9.2 11h5.6"/>',
  rosette: '<circle cx="12" cy="9.5" r="5.5"/><path d="m8.8 14.2-1.6 6 4.8-2.4 4.8 2.4-1.6-6"/><path d="m9.8 9.6 1.6 1.6 3-3.2"/>',
  syringe: '<path d="m17 3 4 4M19 5l-9.5 9.5a3 3 0 0 1-1.6.8l-3.4.7.7-3.4a3 3 0 0 1 .8-1.6L15.5 1.5M3 21l3.2-3.2"/><path d="m12 6 6 6"/>',
  droplet: '<path d="M12 3.5S6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5Z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  beam: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8"/><circle cx="12" cy="12" r="3"/>',
  face: '<path d="M8 3.5A8.5 8.5 0 0 0 12 20a8.5 8.5 0 0 0 4-16.5"/><path d="M9 10.5h.01M15 10.5h.01"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/><path d="M12 2v3"/>',
  cup: '<path d="M7 4h10v7a5 5 0 0 1-10 0V4Z"/><path d="M17 6h2.5a1.5 1.5 0 0 1 0 3H17M8.5 20h7M12 16v4"/>',
  drip: '<path d="M9 3h6v4a3 3 0 0 1-6 0V3Z"/><path d="M12 10v3m0 0s-3.5 3.4-3.5 5.7a3.5 3.5 0 0 0 7 0C15.5 16.4 12 13 12 13Z"/>',
  thread: '<path d="M3 16c3-6 6 6 9 0s6 6 9 0"/><path d="M3 8c3-6 6 6 9 0s6 6 9 0"/>',
  vial: '<path d="M9 3h6M10 3v6.5L5.8 17a3 3 0 0 0 2.7 4.5h7a3 3 0 0 0 2.7-4.5L14 9.5V3"/><path d="M8 14h8"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/><path d="M9 8h6"/>',
  cap: '<path d="m12 4 10 5-10 5L2 9l10-5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2.5"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  lang: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c-5 5.4-5 11.6 0 17M12 3.5c5 5.4 5 11.6 0 17"/>',
  hands: '<path d="M12 20.5 5.2 13a3 3 0 0 1 4.2-4.2l2.6 2.4 2.6-2.4a3 3 0 0 1 4.2 4.2L12 20.5Z"/>',
  diamond: '<path d="M12 3l7 9-7 9-7-9 7-9Z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
  facebook: '<path d="M15.5 4.5H13a3.5 3.5 0 0 0-3.5 3.5v2.5H7v3.5h2.5v6.5H13V14h2.5l.5-3.5h-3V8.5a1 1 0 0 1 1-1h2v-3Z"/>',
};

export function icon(name, cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.diamond}</svg>`;
}

export const arrow = icon('arrow', 'btn-arrow');
export const goArrow = icon('arrow', 'go');

/* ---------------- Nav data ---------------- */
export const SERVICES_NAV = [
  ['services/dermal-fillers.html', 'Dermal Fillers', 'Volume, contour and balance'],
  ['services/anti-wrinkle.html', 'Anti-Wrinkle Injections', 'Botulinum toxin, prescribed care'],
  ['services/laser-therapy.html', 'Laser Therapy', 'Light-based skin renewal'],
  ['services/mesotherapy.html', 'Mesotherapy', 'Micro-nutrition for skin and hair'],
  ['services/iv-drips.html', 'IV Drip Therapy', 'Vitamins, delivered properly'],
  ['services/cupping-therapy.html', 'Cupping Therapy', 'Traditional dry and wet cupping'],
];

export const ACADEMY_NAV = [
  ['academy/dermal-filler-foundation.html', 'Dermal Filler Foundation'],
  ['academy/advanced-dermal-filler.html', 'Advanced Dermal Filler'],
  ['academy/skin-booster.html', 'Skin Booster Course'],
  ['academy/pdo-threads.html', 'PDO Threads Course'],
  ['academy/mesotherapy-course.html', 'Mesotherapy Course'],
  ['academy/prp.html', 'PRP Course'],
  ['academy/iv-therapy.html', 'IV Therapy Course'],
  ['academy/phlebotomy.html', 'Phlebotomy Course'],
  ['academy/chemical-peel.html', 'Chemical Peel Course'],
  ['academy/facial-electrotherapy.html', 'Facial Electrotherapy · ProQual L3'],
  ['academy/ofqual-level-3-diploma.html', 'OFQUAL Level 3 Diploma + CPD'],
  ['academy/anatomy-physiology.html', 'Anatomy & Physiology'],
];

/* ---------------- Layout ---------------- */
function relPrefix(path) {
  const depth = path.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#211C16"/><path d="M32 10 50 32 32 54 14 32Z" fill="none" stroke="#CBAA5E" stroke-width="2.5"/><text x="32" y="38" font-family="Georgia,serif" font-size="17" fill="#F3EEE4" text-anchor="middle" letter-spacing="1">L</text></svg>`
)}`;

export function page({ path, title, desc, active = '', body, bodyClass = '' }) {
  const r = relPrefix(path);
  const h = (p) => r + p;

  const navDrop = (label, hubHref, items, key, twoCol = false) => `
        <li class="has-drop${active === key ? ' current' : ''}">
          <button class="nav-link" type="button" aria-expanded="false" aria-haspopup="true">${label} ${icon('caret', 'caret')}</button>
          <div class="dropdown${twoCol ? ' two-col' : ''}" role="menu">
            <a class="dd-head" href="${h(hubHref)}">${label === 'Treatments' ? 'All treatments' : 'The Academy'}</a>
            ${items.map(([href, name, sub]) => `<a href="${h(href)}">${name}${sub ? `<small>${sub}</small>` : ''}</a>`).join('\n            ')}
          </div>
        </li>`;

  return `<!DOCTYPE html>
<html lang="en-GB" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="theme-color" content="#FAF7F1">
  <link rel="icon" href="${FAVICON}">
  <link rel="preload" href="${h('assets/fonts/marcellus-latin-400-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${h('assets/fonts/jost-latin-400-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${h('assets/css/main.css')}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="wrap wrap-wide header-inner">
      <a class="brand" href="${h('index.html')}" aria-label="London Classic Aesthetics, home">
        <span class="brand-name">London Classic</span>
        <span class="brand-sub">Aesthetics · W1</span>
      </a>
      <nav aria-label="Primary">
        <ul class="main-nav">
          ${navDrop('Treatments', 'services/index.html', SERVICES_NAV, 'treatments')}
          ${navDrop('Academy', 'academy/index.html', ACADEMY_NAV.map(([href, name]) => [href, name]), 'academy', true)}
          <li${active === 'about' ? ' class="current"' : ''}><a class="nav-link" href="${h('about.html')}">About</a></li>
          <li${active === 'model' ? ' class="current"' : ''}><a class="nav-link" href="${h('become-a-model.html')}">Become a Model</a></li>
          <li${active === 'contact' ? ' class="current"' : ''}><a class="nav-link" href="${h('contact.html')}">Contact</a></li>
        </ul>
      </nav>
      <div class="header-cta">
        <a class="btn" href="${SITE.fresha}" target="_blank" rel="noopener">Book now</a>
      </div>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu">
    <nav aria-label="Mobile">
      <a href="${h('index.html')}">Home</a>
      <div class="mob-group">
        <button type="button" aria-expanded="false">Treatments ${icon('caret', 'caret')}</button>
        <div class="mob-sub">
          <a href="${h('services/index.html')}">All treatments</a>
          ${SERVICES_NAV.map(([href, name]) => `<a href="${h(href)}">${name}</a>`).join('\n          ')}
        </div>
      </div>
      <div class="mob-group">
        <button type="button" aria-expanded="false">Academy ${icon('caret', 'caret')}</button>
        <div class="mob-sub">
          <a href="${h('academy/index.html')}">The Academy</a>
          ${ACADEMY_NAV.map(([href, name]) => `<a href="${h(href)}">${name}</a>`).join('\n          ')}
        </div>
      </div>
      <a href="${h('about.html')}">About</a>
      <a href="${h('become-a-model.html')}">Become a Model</a>
      <a href="${h('contact.html')}">Contact</a>
    </nav>
    <div class="cta-row">
      <a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha ${arrow}</a>
      <a class="btn btn-line" href="${h('contact.html')}">Make an enquiry</a>
    </div>
    <p class="menu-meta">${SITE.address}<br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
  </div>

  <main id="main">
${body}
  </main>

  <button class="courselist-fab" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Your course list">
    ${icon('book')} <span>My courses</span> <span class="count">0</span>
  </button>
  <div class="courselist-scrim" aria-hidden="true"></div>
  <aside class="courselist-drawer" role="dialog" aria-modal="true" aria-label="Your course list" data-browse="${h('academy/index.html')}">
    <div class="courselist-head">
      <h2>Your course list</h2>
      <button class="courselist-close" type="button" aria-label="Close course list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
    </div>
    <div class="courselist-items"></div>
    <div class="courselist-foot">
      <a class="btn btn-gold" href="${h('contact.html')}">Enquire about these ${arrow}</a>
      <p class="cl-note">One enquiry covers everything on your list, or <a class="cl-mailto" href="mailto:${SITE.email}">email it to us directly</a>.</p>
    </div>
  </aside>

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-main">
        <div class="footer-brand">
          <span class="brand-name">London Classic</span>
          <div class="brand-sub">Aesthetics · Est. in Marylebone</div>
          <p>A doctor-led medical aesthetics clinic and accredited training academy on Seymour Place, London W1.</p>
          <div class="footer-social">
            <a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a>
            <a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a>
            <a href="mailto:${SITE.email}" aria-label="Email">${icon('mail')}</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Treatments</h4>
          <ul>
            ${SERVICES_NAV.map(([href, name]) => `<li><a href="${h(href)}">${name}</a></li>`).join('\n            ')}
            <li><a href="${h('services/index.html')}">View all</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Academy</h4>
          <ul>
            <li><a href="${h('academy/index.html')}">All courses</a></li>
            <li><a href="${h('academy/dermal-filler-foundation.html')}">Dermal Filler Foundation</a></li>
            <li><a href="${h('academy/ofqual-level-3-diploma.html')}">OFQUAL Level 3 Diploma</a></li>
            <li><a href="${h('academy/skin-booster.html')}">Skin Boosters</a></li>
            <li><a href="${h('become-a-model.html')}">Become a Model</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Visit</h4>
          <address>
            157 Seymour Place<br>
            London W1H 4PQ<br>
            ${SITE.station} station, 5 min walk<br><br>
            <a href="mailto:${SITE.email}">${SITE.email}</a>
          </address>
          <ul style="margin-top:1rem">
            <li><a href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha</a></li>
            <li><a href="${SITE.treatwell}" target="_blank" rel="noopener">Book on Treatwell</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year>2026</span> London Classic Aesthetics. All rights reserved.</span>
        <span>Injectable treatments are for over-18s only. All medical treatments begin with a consultation.</span>
      </div>
    </div>
  </footer>

  <script src="${h('assets/js/main.js')}" defer></script>
</body>
</html>
`;
}

/* ---------------- Shared sections ---------------- */
export function ctaBand(r, { title, lede, primary, secondary, note }) {
  return `
    <section class="section band-night cta-band">
      <div class="wrap">
        <p class="kicker no-rule" data-reveal>Begin</p>
        <h2 class="mt-2" data-reveal style="--d:80ms">${title}</h2>
        <p class="lede" data-reveal style="--d:160ms">${lede}</p>
        <div class="cta-row" data-reveal style="--d:240ms">
          ${primary}
          ${secondary || ''}
        </div>
        <p class="cta-note" data-reveal style="--d:300ms">${note || `Prefer to talk first? Write to <a href="mailto:${SITE.email}">${SITE.email}</a> and we will reply personally.`}</p>
      </div>
    </section>`;
}

export function bookButtons(r, goldLabel = 'Book on Fresha') {
  return `<a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">${goldLabel} ${arrow}</a>
          <a class="btn btn-line" href="${relPrefix(r) ? '' : ''}${r}contact.html">Ask a question</a>`;
}

export function heroInner(r, { kicker, title, lede, meta }) {
  return `
    <section class="hero hero-inner">
      <div class="hero-art" aria-hidden="true">
        <div class="bloom" style="width:44rem;height:44rem;top:-22rem;right:-14rem;background:radial-gradient(circle, rgba(203,170,94,.30), transparent 65%)"></div>
        <div class="bloom b2" style="width:34rem;height:34rem;bottom:-20rem;left:-12rem;background:radial-gradient(circle, rgba(169,133,59,.18), transparent 65%)"></div>
      </div>
      <div class="wrap">
        <p class="kicker" data-hero>${kicker}</p>
        <h1 class="hero-title mt-2" data-hero style="--d:100ms">${title}</h1>
        ${lede ? `<p class="lede" data-hero style="--d:200ms">${lede}</p>` : ''}
        ${meta ? `<div class="hero-meta" data-hero style="--d:300ms">${meta}</div>` : ''}
      </div>
    </section>`;
}

export function faqBlock(faqs) {
  return `
        <div class="faq">
          ${faqs.map(([q, a]) => `<details>
            <summary>${q} ${icon('plus', 'plus')}</summary>
            <div class="faq-body"><p>${a}</p></div>
          </details>`).join('\n          ')}
        </div>`;
}

export function relatedStrip(r, items, label = 'Related') {
  return `
    <section class="section-sm band-sand">
      <div class="wrap">
        <p class="kicker" data-reveal>${label}</p>
        <div class="related mt-3">
          ${items.map(([href, tag, name], i) => `<a href="${r}${href}" data-reveal style="--d:${i * 90}ms"><span><small>${tag}</small>${name}</span> ${goArrow}</a>`).join('\n          ')}
        </div>
      </div>
    </section>`;
}

/* ---------------- Detail page templates ---------------- */
export function servicePage(d) {
  const r = '../';
  const railRows = d.rail
    .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
    .join('\n              ');
  const body = `
${heroInner(r, {
    kicker: `Treatments · ${d.kickerTag}`,
    title: d.title,
    lede: d.lede,
  })}

    <section class="section" style="padding-top:clamp(2.5rem,5vw,4rem)">
      <div class="wrap detail-layout">
        <article class="prose">
          <div class="art" style="aspect-ratio:16/9;--art-tint:${d.tint}" data-img="${r}images/${d.img}" data-alt="${d.imgAlt}" data-reveal="fade">
            <div class="art-mark">${icon(d.icon)}</div>
          </div>

          <h2 data-reveal><span class="roman">I</span>${d.h.about}</h2>
          ${d.about.map((p) => `<p data-reveal>${p}</p>`).join('\n          ')}

          <h2 data-reveal><span class="roman">II</span>${d.h.fit}</h2>
          <p data-reveal>${d.fitIntro}</p>
          <div class="fit-grid" data-reveal>
            <div class="fit-col yes">
              <h4>${icon('check')} Consider it if</h4>
              <ul>${d.fitYes.map((x) => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div class="fit-col">
              <h4>${icon('plus')} It is not for</h4>
              <ul>${d.fitNo.map((x) => `<li>${x}</li>`).join('')}</ul>
            </div>
          </div>

          <h2 data-reveal><span class="roman">III</span>Your appointment, step by step</h2>
          <p data-reveal>${d.stepsIntro}</p>
          <ol class="steps" data-reveal>
            ${d.steps.map(([t, p]) => `<li><div><h4>${t}</h4><p>${p}</p></div></li>`).join('\n            ')}
          </ol>

          <div class="notice mt-3" data-reveal><strong>Safety, before style.</strong> ${d.safety}</div>

          <h2 data-reveal><span class="roman">IV</span>Questions, answered</h2>
          ${faqBlock(d.faqs)}
        </article>

        <aside class="side-rail" data-reveal="right">
          <div class="rail-card">
            <h4>At a glance</h4>
            <dl>
              ${railRows}
            </dl>
            <a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha ${arrow}</a>
            <p class="rail-note">Every treatment begins with a consultation. Over-18s only.</p>
          </div>
          <div class="rail-card" style="background:var(--paper)">
            <h4>Rather ask first?</h4>
            <p class="small muted">Tell us what you would like to change and we will advise honestly, including when the answer is “not yet” or “not this”.</p>
            <a class="link-more mt-2" href="${r}contact.html"><span>Send an enquiry</span> ${icon('arrow')}</a>
          </div>
        </aside>
      </div>
    </section>

${relatedStrip(r, d.related, 'Pairs well with')}
${ctaBand(r, {
    title: d.ctaTitle,
    lede: d.ctaLede,
    primary: `<a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book a consultation ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="${r}services/index.html">All treatments</a>`,
  })}`;

  return page({
    path: `services/${d.slug}.html`,
    title: `${d.title} · London Classic Aesthetics`,
    desc: d.metaDesc,
    active: 'treatments',
    body,
  });
}

export function coursePage(d) {
  const r = '../';
  const railRows = d.rail
    .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
    .join('\n              ');
  const body = `
${heroInner(r, {
    kicker: `Academy · ${d.kickerTag}`,
    title: d.title,
    lede: d.lede,
  })}

    <section class="section" style="padding-top:clamp(2.5rem,5vw,4rem)">
      <div class="wrap detail-layout">
        <article class="prose">
          <div class="art" style="aspect-ratio:16/9;--art-tint:${d.tint}" data-img="${r}images/${d.img}" data-alt="${d.imgAlt}" data-reveal="fade">
            <div class="art-mark">${icon(d.icon)}</div>
          </div>

          <h2 data-reveal><span class="roman">I</span>About this course</h2>
          ${d.about.map((p) => `<p data-reveal>${p}</p>`).join('\n          ')}

          <h2 data-reveal><span class="roman">II</span>What you will cover</h2>
          <p data-reveal>${d.coverIntro}</p>
          <ul class="checks mt-2" data-reveal>
            ${d.covers.map((c) => `<li>${icon('check')}<span>${c}</span></li>`).join('\n            ')}
          </ul>

          <h2 data-reveal><span class="roman">III</span>How your training runs</h2>
          <ol class="steps" data-reveal>
            ${d.steps.map(([t, p]) => `<li><div><h4>${t}</h4><p>${p}</p></div></li>`).join('\n            ')}
          </ol>

          <h2 data-reveal><span class="roman">IV</span>Accreditation and recognition</h2>
          ${d.accreditation.map((p) => `<p data-reveal>${p}</p>`).join('\n          ')}

          <h2 data-reveal><span class="roman">V</span>Questions, answered</h2>
          ${faqBlock(d.faqs)}
        </article>

        <aside class="side-rail" data-reveal="right">
          <div class="rail-card">
            <h4>At a glance</h4>
            <dl>
              ${railRows}
            </dl>
            <a class="btn btn-gold" href="${r}contact.html">Enquire about this course ${arrow}</a>
            <button class="btn btn-line btn-add" type="button" style="width:100%;margin-top:.7rem" data-course-add data-slug="${d.slug}" data-name="${d.title}" data-tag="${d.kickerTag}" aria-pressed="false">${icon('plus')} <span>Add to my course list</span></button>
            <p class="rail-note">Places are confirmed after a suitability check at enrolment.</p>
          </div>
          <div class="rail-card" style="background:var(--paper)">
            <h4>Practise on live models</h4>
            <p class="small muted">Hands-on sessions run in our working W1 clinic on volunteer models, under the direct supervision of a registered doctor.</p>
            <a class="link-more mt-2" href="${r}become-a-model.html"><span>About our model programme</span> ${icon('arrow')}</a>
          </div>
        </aside>
      </div>
    </section>

${relatedStrip(r, d.related, 'Continue your training')}
${ctaBand(r, {
    title: d.ctaTitle,
    lede: d.ctaLede,
    primary: `<a class="btn btn-gold" href="${r}contact.html">Enquire now ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="${r}academy/index.html">All courses</a>`,
    note: `Or write directly to <a href="mailto:${SITE.email}">${SITE.email}</a> with the course name in the subject line.`,
  })}`;

  return page({
    path: `academy/${d.slug}.html`,
    title: `${d.title} · LCA Training Academy`,
    desc: d.metaDesc,
    active: 'academy',
    body,
  });
}
