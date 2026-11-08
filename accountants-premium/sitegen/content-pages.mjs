/* Page bodies for the 381 Accountants premium site. */
import {
  SITE, yearsExp, icon, stars5, breadcrumbs, wizard, ctaBanner,
  quoteCard, REVIEWS, REVIEWS_ALL,
} from './lib.mjs';
import { services } from './content-services.mjs';

const rel = (path) => (path.includes('/') ? '../' : '');

/* ---------------- Shared fragments ---------------- */

function marqueeBand() {
  const items = [
    `<span class="mq-item"><span class="q-stars">${stars5}</span><b>5.0 on Google</b> · ${SITE.reviewCount} reviews</span>`,
    `<span class="mq-item">“Efficient, fast and reliable” <b>Sima Akram</b></span>`,
    `<span class="mq-item">Fast response</span>`,
    `<span class="mq-item">“No messing around!” <b>Zulfiqar Ali</b></span>`,
    `<span class="mq-item">Professional team</span>`,
    `<span class="mq-item">“Peace of mind, accuracy and no hidden charges” <b>Knowledge Bank</b></span>`,
    `<span class="mq-item">Value for money</span>`,
    `<span class="mq-item">“A pleasure to work with” <b>Sofia Gouveia</b></span>`,
    `<span class="mq-item">Cooperative staff</span>`,
    `<span class="mq-item">“I would never change to a different accountant” <b>Gulsara S. Wennell</b></span>`,
  ].join('<span class="mq-dot"></span>');
  return `<div class="marquee-band" aria-label="What clients say on Google">
  <div class="marquee"><div class="marquee-inner">${items}<span class="mq-dot"></span></div></div>
</div>`;
}

function statsStrip() {
  return `<div class="stats-strip rv">
  <div class="stat-cell"><b data-count="${yearsExp}" data-suffix="+">${yearsExp}+</b><span>Years serving London</span></div>
  <div class="stat-cell"><b data-count="5.0">5.0</b><span>Google rating</span></div>
  <div class="stat-cell"><b data-count="${SITE.reviewCount}">${SITE.reviewCount}</b><span>Reviews, all five stars</span></div>
  <div class="stat-cell"><b data-count="7">7</b><span>Services under one roof</span></div>
</div>`;
}

function showcase(path) {
  const r = rel(path);
  const tabs = services.map((s, i) => `<button class="show-item${i === 0 ? ' on' : ''}" role="tab" aria-selected="${i === 0}">
      ${icon(s.icon)}<b>${s.name}</b><span class="show-n">0${i + 1}</span>
    </button>`).join('\n    ');
  const views = services.map((s, i) => `<div class="show-view${i === 0 ? ' on' : ''}" role="tabpanel">
      <span class="svc-glyph">${icon(s.icon)}</span>
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <ul class="show-includes">
        ${s.included.slice(0, 4).map(([b]) => `<li>${icon('check')} <span>${b}</span></li>`).join('\n        ')}
      </ul>
      <div class="show-actions">
        <a class="btn btn-gold" href="${r}services/${s.slug}.html"><span>Full breakdown ${icon('arrow')}</span></a>
        <a class="btn btn-ghost" href="${r}contact.html?service=${encodeURIComponent(s.name)}"><span>Book this service</span></a>
      </div>
    </div>`).join('\n    ');
  return `<div class="showcase rv">
  <div class="show-list" role="tablist" aria-label="Services">
    ${tabs}
  </div>
  <div class="show-panel">
    ${views}
  </div>
</div>`;
}

function calculator(path) {
  const r = rel(path);
  return `<div class="calc-panel rv" data-calc>
  <div class="calc-controls">
    <span class="eyebrow">Interactive estimate</span>
    <h3 style="margin-top:14px">See what you could take home</h3>
    <p>Slide your yearly income and compare how you are paid. Then let us make the numbers better in real life.</p>
    <div class="seg" role="group" aria-label="How you earn">
      <button type="button" class="on" data-mode="employee">Employee</button>
      <button type="button" data-mode="sole">Sole trader</button>
      <button type="button" data-mode="ltd">Limited co.</button>
    </div>
    <div class="calc-slider">
      <label for="calc-income">Yearly income <output for="calc-income">£55,000</output></label>
      <input type="range" id="calc-income" min="15000" max="150000" step="1000" value="55000">
    </div>
    <p class="calc-note">Indicative only: 2025/26 rates for England, full personal allowance, no pension or student loan. The limited company view uses a simplified salary plus dividends model after corporation tax. Your consultation gives you exact, optimised numbers.</p>
  </div>
  <div class="calc-results">
    <div class="calc-big">
      <span>Estimated take-home</span>
      <b data-out="take">£0</b>
      <small>You keep <span data-out="keep" style="color:var(--gold-2)">0%</span> of what you earn</small>
    </div>
    <div class="calc-rows">
      <div class="calc-row cr-take"><div class="cr-head"><span>Take-home</span><b data-out-bar="take"></b></div><div class="cr-bar"><i></i></div></div>
      <div class="calc-row cr-tax"><div class="cr-head"><span>Tax</span><b data-out="tax">£0</b></div><div class="cr-bar"><i></i></div></div>
      <div class="calc-row cr-ni"><div class="cr-head"><span>National Insurance</span><b data-out="ni">£0</b></div><div class="cr-bar"><i></i></div></div>
    </div>
    <div class="calc-cta">
      <a class="btn btn-gold magnetic" href="${r}contact.html?service=${encodeURIComponent('Tax Planning & Investigations')}"><span>Make it better ${icon('arrow')}</span></a>
      <span class="hint">Structure, timing and reliefs often move these numbers meaningfully.</span>
    </div>
  </div>
</div>`;
}

function countdownStrip(path) {
  const r = rel(path);
  return `<div class="count-strip">
  <div class="wrap">
    <span class="cs-label">${icon('timer')} Self assessment deadline · 31 January</span>
    <div class="count-digits" data-countdown aria-label="Time until the self assessment deadline">
      <span class="cd-box"><b data-cd-d>0</b><span>Days</span></span>
      <span class="cd-box"><b data-cd-h>00</b><span>Hours</span></span>
      <span class="cd-box"><b data-cd-m>00</b><span>Mins</span></span>
      <span class="cd-box"><b data-cd-s>00</b><span>Secs</span></span>
    </div>
    <a class="text-link" href="${r}services/self-assessment.html">Beat the deadline ${icon('arrow')}</a>
  </div>
</div>`;
}

function reviewsCarousel(path, revs) {
  const r = rel(path);
  return `<div data-carousel>
  <div class="carousel-head rv">
    <div class="section-head" style="margin:0;max-width:560px">
      <span class="eyebrow">Client reviews</span>
      <h2>Five stars, <em>${SITE.reviewCount} times over</em></h2>
    </div>
    <div class="carousel-nav">
      <button class="car-btn car-prev" aria-label="Previous reviews">${icon('left')}</button>
      <button class="car-btn car-next" aria-label="Next reviews">${icon('chevron')}</button>
    </div>
  </div>
  <div class="carousel rv">
    ${revs.map((q) => quoteCard(q)).join('\n    ')}
  </div>
  <p class="divider-note rv">${icon('google')} Real Google reviews, published names, lightly tidied for spelling only. <a class="text-link" href="${r}reviews.html">Read the full wall ${icon('arrow')}</a></p>
</div>`;
}

/* ---------------- Home ---------------- */

export function homeBody(path = 'index.html') {
  const r = rel(path);
  return `
<section class="hero">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-grid-lines" aria-hidden="true"></div>
  <div class="wrap">
    <div class="hero-inner">
      <div>
        <span class="eyebrow">Certified accountants · Canary Wharf, London</span>
        <h1>Your numbers, in <em>expert hands</em>.</h1>
        <p class="hero-sub">${SITE.name} is an independent firm of certified accountants at 30 Churchill Place. For <strong>${yearsExp}+ years</strong> we have kept London businesses compliant, informed and ahead, <strong>whatever their size</strong>.</p>
        <div class="hero-ctas">
          <a class="btn btn-gold btn-lg magnetic" href="${r}contact.html"><span>Book a free consultation ${icon('arrow')}</span></a>
          <a class="btn btn-ghost" href="${r}services/index.html"><span>Explore services</span></a>
        </div>
        <ul class="hero-meta">
          <li>${icon('star')} 5.0 · ${SITE.reviewCount} Google reviews</li>
          <li>${icon('shield')} HMRC &amp; Companies House compliant</li>
          <li>${icon('cloud')} Sage &amp; QuickBooks certified</li>
        </ul>
        <div class="count-chip" aria-label="Self assessment countdown">
          ${icon('timer')}
          <span><span class="cc-label">Self assessment deadline · 31 Jan</span><br><span class="cc-time" data-countdown data-compact>counting…</span></span>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="hv-layer" data-depth="10" style="position:absolute;inset:0">
          <div class="hv-card hv-main" style="position:absolute;inset:6% 8% auto 0">
            <div class="hv-head"><b>Your year, handled</b><span class="hv-badge">381 · Est. ${SITE.established}</span></div>
            <div class="hv-rows">
              <div class="hv-row"><span>Bookkeeping</span><b class="pos">UP TO DATE</b></div>
              <div class="hv-row"><span>VAT return · Q2</span><b class="pos">FILED EARLY</b></div>
              <div class="hv-row"><span>Payroll · July</span><b class="pos">PAID ON TIME</b></div>
              <div class="hv-row"><span>Corporation tax saved</span><b>£4,820</b></div>
            </div>
            <div class="hv-bars">
              <i style="height:32%"></i><i style="height:54%"></i><i style="height:42%"></i><i style="height:68%"></i><i style="height:56%"></i><i style="height:84%"></i><i style="height:72%"></i><i style="height:96%"></i>
            </div>
            <div class="hv-ticker">
              <p>${icon('check')} VAT Q2 filed nine days early</p>
              <p>${icon('check')} Payroll RTI accepted by HMRC</p>
              <p>${icon('check')} CT600 submitted and confirmed</p>
              <p>${icon('check')} Books reconciled to the last penny</p>
            </div>
          </div>
        </div>
        <div class="hv-layer hv-c1" data-depth="26" style="position:absolute">
          <div class="hv-card hv-chip">
            ${icon('star')}
            <span><b>5.0 on Google</b><small class="hv-stars">★★★★★ · ${SITE.reviewCount} reviews</small></span>
          </div>
        </div>
        <div class="hv-layer hv-c2" data-depth="18" style="position:absolute">
          <div class="hv-card hv-chip">
            ${icon('shield')}
            <span><b>Deadline never missed</b><small>Every filing diarised</small></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

${marqueeBand()}

<section class="section tight">
  <div class="wrap">
    ${statsStrip()}
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head rv">
      <span class="eyebrow">What we do</span>
      <h2>Seven services. One team. <em>Zero gaps.</em></h2>
      <p>Choose a service to see what it covers. Every one links to a full breakdown of exactly what happens, step by step.</p>
    </div>
    ${showcase(path)}
  </div>
</section>

<section class="section raised">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow center">Try it now</span>
      <h2>Keep more of <em>what you earn</em></h2>
    </div>
    ${calculator(path)}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head rv">
      <span class="eyebrow">Why 381</span>
      <h2>The firm London businesses <em>keep</em></h2>
    </div>
    <div class="bento">
      <div class="tile tilt wide rv"><span class="tile-big">${yearsExp}+</span><h3>Years serving London</h3><p>Established ${SITE.established}, with senior experience in the industry stretching back over 25 years. Clients who joined us in 2011, 2012 and 2013 are still with us today.</p></div>
      <div class="tile tilt rv rv-d1"><span class="q-stars">${stars5}</span><h3>5.0 from ${SITE.reviewCount} reviews</h3><p>Every Google review we have ever received is five stars.</p></div>
      <div class="tile tilt rv rv-d2"><span class="svc-glyph">${icon('cloud')}</span><h3>Cloud accounting</h3><p>Sage One, Sage 50 and QuickBooks as standard. Your live numbers, any device.</p></div>
      <div class="tile tilt rv"><span class="svc-glyph">${icon('shield')}</span><h3>Compliance, guaranteed</h3><p>Every VAT, payroll, accounts and tax deadline diarised and hit early.</p></div>
      <div class="tile tilt rv rv-d1"><span class="svc-glyph">${icon('pin')}</span><h3>Canary Wharf</h3><p>30 Churchill Place, E14. Serving clients across all of Greater London and Essex.</p></div>
      <div class="tile tilt wide rv rv-d2"><span class="svc-glyph">${icon('handshake')}</span><h3>A person, not a portal</h3><p>Our mission is an efficient, proactive service for every client, regardless of size. You deal directly with the people doing your work; reviewers mention Habib and the team by name.</p></div>
    </div>
  </div>
</section>

<section class="section raised">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow center">How it works</span>
      <h2>Three steps to <em>never worrying</em> again</h2>
    </div>
    <div class="steps">
      <div class="step tilt rv"><h3>Book a free consultation</h3><p>Call, email or use the booking wizard. We listen, look at where you are and quote a clear fixed fee. No obligation, no jargon.</p></div>
      <div class="step tilt rv rv-d1"><h3>We take everything over</h3><p>Records collected, registrations sorted, backlogs cleared and software set up. The handover is our job, not yours.</p></div>
      <div class="step tilt rv rv-d2"><h3>You get on with business</h3><p>Books current, returns filed early, deadlines met, with proactive advice through the year, not just at year end.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${reviewsCarousel(path, [...REVIEWS, ...REVIEWS_ALL.slice(0, 6)])}
  </div>
</section>

${countdownStrip(path)}

${ctaBanner(path, {
    title: 'Speak to an accountant today. The consultation is free.',
    text: `Call ${SITE.phone1}, email ${SITE.email} or book online. We serve clients across ${SITE.areas.slice(0, 6).join(', ')} and the wider London area.`,
  })}
`;
}

/* ---------------- Services hub ---------------- */

export function servicesHubBody(path = 'services/index.html') {
  const r = rel(path);
  return `
<section class="page-hero">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-grid-lines" aria-hidden="true"></div>
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Services', '']])}
    <h1>Accounting services, <em>end to end</em></h1>
    <p class="lede">Seven core services, one team, zero gaps. Every engagement starts with a <strong>free consultation</strong> and a clear fixed fee agreed up front. Open any service for the full breakdown.</p>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    ${showcase(path)}
  </div>
</section>

<section class="section raised">
  <div class="wrap">
    <div class="section-head rv">
      <span class="eyebrow">Browse all seven</span>
      <h2>Pick a service, see <em>everything it includes</em></h2>
    </div>
    <div class="bento">
      ${services.map((s, i) => `<div class="tile tilt${i === 0 || i === 6 ? ' wide' : ''} rv${i % 3 ? ` rv-d${i % 3}` : ''}">
        <span class="svc-glyph">${icon(s.icon)}</span>
        <h3>${s.name}</h3>
        <p>${s.short}</p>
        <p style="margin-top:14px"><a class="text-link" href="${r}services/${s.slug}.html">Full breakdown ${icon('arrow')}</a></p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="book-split">
      <div class="rv">
        <span class="eyebrow">Book a service</span>
        <h2 style="font-size:clamp(1.9rem,4vw,2.8rem);margin-top:14px">One conversation, and the paperwork problem is <em>ours</em></h2>
        <p style="color:var(--muted);margin-top:16px;max-width:34rem">Three quick steps: choose the service, tell us where to reach you, send. A real person replies within one working day with a clear fixed quote.</p>
        <div class="faq" style="margin-top:30px">
          <details class="rv"><summary>How do your fees work?${icon('plus')}</summary><p>We agree a fixed fee before any work starts, based on the services you need and the state of your records. No surprise invoices, no hourly meters running.</p></details>
          <details class="rv"><summary>Can you take over from my current accountant?${icon('plus')}</summary><p>Yes. With your permission we write to your current accountant for professional clearance and your records, and we handle the whole handover.</p></details>
          <details class="rv"><summary>My books are months behind. Is that a problem?${icon('plus')}</summary><p>It is a Tuesday. Backlogs, missed returns and HMRC letters are routine rescue work for us. The sooner you get in touch, the cheaper they are to fix.</p></details>
        </div>
      </div>
      <div class="rv rv-d1">
        ${wizard(services)}
      </div>
    </div>
  </div>
</section>

${ctaBanner(path)}
`;
}

/* ---------------- Service detail ---------------- */

export function servicePage(svc, path) {
  const r = rel(path);
  return `
<section class="page-hero">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-grid-lines" aria-hidden="true"></div>
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Services', 'services/index.html'], [svc.name, '']])}
    <h1>${svc.name}</h1>
    <p class="lede">${svc.heroLede}</p>
    <div class="hero-ctas">
      <a class="btn btn-gold btn-lg magnetic" href="${r}contact.html?service=${encodeURIComponent(svc.name)}"><span>Book this service ${icon('arrow')}</span></a>
      <a class="btn btn-ghost" href="tel:${SITE.phone1tel}"><span>${icon('phone')} ${SITE.phone1}</span></a>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="svc-layout">
      <div class="svc-body">
        ${svc.intro.map((p) => `<p class="rv">${p}</p>`).join('\n        ')}
        <h2 class="rv">What’s included</h2>
        <ul class="check-list">
          ${svc.included.map(([b, s], i) => `<li class="rv${i % 2 ? ' rv-d1' : ''}">${icon('check')} <span><b>${b}:</b> ${s}</span></li>`).join('\n          ')}
        </ul>
        <h2 class="rv">How it works, step by step</h2>
        <ol class="timeline">
          ${svc.steps.map(([t, d], i) => `<li class="rv"><span class="tl-num">0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('\n          ')}
        </ol>
        <div class="info-callout rv">${icon('info')} <p><b>Worth knowing:</b> ${svc.callout}</p></div>
        <h2 class="rv">Frequently asked</h2>
        <div class="faq">
          ${svc.faqs.map(([q, a]) => `<details class="rv"><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('\n          ')}
        </div>
      </div>
      <aside class="svc-aside">
        <div class="aside-card gold-card rv">
          <h3>Book ${svc.name.toLowerCase().startsWith('tax') || svc.name.toLowerCase().startsWith('self') ? 'this service' : svc.name.toLowerCase()}</h3>
          <p>Free consultation, fixed fee agreed up front, reply within one working day.</p>
          <a class="btn btn-gold" href="${r}contact.html?service=${encodeURIComponent(svc.name)}"><span>Book a free consultation</span></a>
          <a class="btn btn-ghost" href="tel:${SITE.phone1tel}"><span>${icon('phone')} Call ${SITE.phone1}</span></a>
        </div>
        <div class="aside-card rv">
          <h3>All services</h3>
          <div class="aside-links">
            ${services.map((s) => `<a href="${r}services/${s.slug}.html"${s.slug === svc.slug ? ' class="now" aria-current="page"' : ''}>${s.name} ${icon('chevron')}</a>`).join('\n            ')}
          </div>
        </div>
        <div class="aside-card rv">
          <h3>Talk to us</h3>
          <div class="aside-links">
            <a href="tel:${SITE.phone1tel}">${SITE.phone1} ${icon('phone')}</a>
            <a href="mailto:${SITE.email}">${SITE.email} ${icon('mail')}</a>
            <a href="${SITE.maps}" target="_blank" rel="noopener">${SITE.town}, ${SITE.postcode} ${icon('pin')}</a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

${ctaBanner(path, { title: `Ready to hand over your ${svc.name.toLowerCase()}?` })}
`;
}

/* ---------------- About ---------------- */

export function aboutBody(path = 'about.html') {
  const r = rel(path);
  return `
<section class="page-hero">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-grid-lines" aria-hidden="true"></div>
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['About Us', '']])}
    <h1>An independent firm you can <em>build on</em></h1>
    <p class="lede">${SITE.legal} has served London businesses and individuals since <strong>${SITE.established}</strong>: ${yearsExp}+ years of bookkeeping, payroll, tax and accounts, delivered with the personal attention only an independent firm gives.</p>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    ${statsStrip()}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="book-split">
      <div class="rv-l rv">
        <span class="eyebrow">Our story</span>
        <h2 style="font-size:clamp(1.9rem,4vw,2.8rem);margin-top:14px">East London roots. At home in <em>Canary Wharf</em>.</h2>
        <div style="display:grid;gap:16px;margin-top:22px;color:var(--muted)">
          <p>381 Accountants was established in ${SITE.established} as an independent firm of certified accountants with a simple mission: <strong style="color:var(--text)">to provide an efficient and proactive service to every client, and to assure them they are investing in the right accountants, regardless of size.</strong></p>
          <p>From our office at 30 Churchill Place in Canary Wharf we serve sole traders, landlords, contractors and limited companies across ${SITE.areas.slice(0, 6).join(', ')} and the wider London area. Our senior team’s experience in the industry stretches back more than 25 years, through every change in tax law, filing regime and software along the way.</p>
          <p>Clients come to us for a tax return or a tidy-up, and stay for years. Our Google reviews tell that story better than we can: 5.0 from ${SITE.reviewCount} reviews, with reviewers describing relationships of five, ten and twenty-five years.</p>
        </div>
        <div class="hero-ctas" style="margin-top:30px">
          <a class="btn btn-gold magnetic" href="${r}reviews.html"><span>Read our reviews ${icon('arrow')}</span></a>
          <a class="btn btn-ghost" href="${r}contact.html"><span>Meet us: book a consultation</span></a>
        </div>
      </div>
      <div class="bento rv rv-d1" style="grid-template-columns:1fr">
        <div class="tile tilt"><span class="svc-glyph">${icon('shield')}</span><h3>Certified accountants</h3><p>An independent, certified firm registered in England &amp; Wales, company no. ${SITE.companyNo}.</p></div>
        <div class="tile tilt"><span class="svc-glyph">${icon('cloud')}</span><h3>Sage &amp; QuickBooks</h3><p>Cloud accounting on Sage One, Sage 50 and QuickBooks as standard.</p></div>
        <div class="tile tilt"><span class="q-stars">${stars5}</span><h3>5.0 · ${SITE.reviewCount} Google reviews</h3><p>Every review we have ever received is five stars.</p></div>
        <div class="tile tilt"><span class="svc-glyph">${icon('pin')}</span><h3>Canary Wharf address</h3><p>30 Churchill Place, London ${SITE.postcode}, serving all of Greater London.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section raised">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow center">How we work</span>
      <h2>What “proactive” <em>actually means</em> here</h2>
      <p>Plenty of firms file what you send them. We think that is the smallest part of the job.</p>
    </div>
    <div class="steps">
      <article class="step tilt rv"><h3>Ahead of deadlines</h3><p>Every filing date, from VAT and payroll to accounts and self assessment, is diarised and hit early, so penalties simply never happen.</p></article>
      <article class="step tilt rv rv-d1"><h3>A person, not a portal</h3><p>You get direct access to the people doing your work. Responsive, polite and efficient: their words, not ours.</p></article>
      <article class="step tilt rv rv-d2"><h3>Advice before the fact</h3><p>Tax planning happens while decisions can still be made (salary mix, timing, structure), not after the year has closed.</p></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow center">Where we work</span>
      <h2>Serving clients across <em>London &amp; Essex</em></h2>
      <p>Based in ${SITE.town}, and with cloud accounting, distance has never mattered less.</p>
    </div>
    <ul class="area-cloud rv" style="justify-content:center">
      ${SITE.areas.map((a) => `<li>${a}</li>`).join('\n      ')}
    </ul>
  </div>
</section>

${ctaBanner(path, { title: `${yearsExp} years in. Yours could be the next relationship that lasts.` })}
`;
}

/* ---------------- Reviews ---------------- */

export function reviewsBody(path = 'reviews.html') {
  return `
<section class="page-hero">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-grid-lines" aria-hidden="true"></div>
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Reviews', '']])}
    <h1>Five stars, <em>${SITE.reviewCount} times over</em></h1>
    <p class="lede">We could tell you we are professional, responsive and worth the money, but our clients already did, in public, on Google. <strong>${SITE.reviewCount} reviews, a 5.0 rating, every single one five stars.</strong></p>
    <div class="hero-ctas">
      <a class="btn btn-gold magnetic" href="${SITE.google}" target="_blank" rel="noopener"><span>See our reviews on Google ${icon('arrow')}</span></a>
    </div>
  </div>
</section>

${marqueeBand()}

<section class="section">
  <div class="wrap">
    <div class="rating-banner rv">
      <span class="stars" aria-hidden="true">${stars5}</span>
      <b>5.0 on Google</b>
      <span>${SITE.reviewCount} reviews, every one of them five stars</span>
    </div>
    <div class="bento" style="grid-template-columns:repeat(3,1fr)">
      ${REVIEWS.map((q, i) => quoteCard(q, `rv${i ? ` rv-d${i}` : ''}`)).join('\n      ')}
    </div>
    <div class="praise-row rv">
      ${['Fast response', 'Professional team', 'Cooperative staff', 'Value for money', 'Trustworthy advice'].map((p) => `<span class="praise-chip">${icon('check')} ${p}</span>`).join('\n      ')}
    </div>
    <p class="divider-note rv">${icon('google')} The topics above are the ones Google highlights across our ${SITE.reviewCount} reviews.</p>
  </div>
</section>

<section class="section raised">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow center">Straight from Google</span>
      <h2>In their <em>own words</em></h2>
      <p>A selection from the ${SITE.reviewCount} five-star reviews on our Google listing. Clients of a year, of a decade, and of twenty-five.</p>
    </div>
    <div class="review-wall">
      ${REVIEWS_ALL.map((q) => quoteCard(q, 'rv')).join('\n      ')}
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap center">
    <div class="section-head center rv" style="margin-bottom:24px">
      <span class="eyebrow center">Add your voice</span>
      <h2>Worked with us? <em>Tell others.</em></h2>
      <p>Reviews help small businesses like ours, and like yours, get found. If we have looked after you, two minutes on Google goes a long way.</p>
    </div>
    <div class="hero-ctas rv" style="justify-content:center">
      <a class="btn btn-gold magnetic" href="${SITE.google}" target="_blank" rel="noopener"><span>${icon('google')} Review us on Google</span></a>
    </div>
  </div>
</section>

${ctaBanner(path, { title: 'Experience the five-star service yourself.' })}
`;
}

/* ---------------- Contact ---------------- */

export function contactBody(path = 'contact.html') {
  return `
<section class="page-hero">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-grid-lines" aria-hidden="true"></div>
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Contact', '']])}
    <h1>Talk to an accountant <em>today</em></h1>
    <p class="lede">Call, email, or use the three-step booking wizard below. A real person replies within <strong>one working day</strong>, and the first consultation is always free and without obligation.</p>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="contact-grid">
      <div class="contact-card tilt rv">
        <span class="svc-glyph">${icon('phone')}</span>
        <h3>Call us</h3>
        <p>${SITE.hours}. If we are with a client, leave a message and we will call back the same day.</p>
        <a class="big" href="tel:${SITE.phone1tel}">${SITE.phone1}</a>
        <a class="big" href="tel:${SITE.phone2tel}">${SITE.phone2}</a>
      </div>
      <div class="contact-card tilt rv rv-d1">
        <span class="svc-glyph">${icon('mail')}</span>
        <h3>Email us</h3>
        <p>Send your question, your HMRC letter or your shoebox of receipts. We have seen it all.</p>
        <a class="big" href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
      <div class="contact-card tilt rv rv-d2">
        <span class="svc-glyph">${icon('pin')}</span>
        <h3>Visit us</h3>
        <address>${SITE.address},<br>${SITE.town}, London ${SITE.postcode}</address>
        <a class="big" href="${SITE.maps}" target="_blank" rel="noopener">Open in Google Maps</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="book-split">
      <div class="rv">
        <span class="eyebrow">Opening hours</span>
        <h2 style="font-size:clamp(1.8rem,3.6vw,2.5rem);margin-top:14px">When to <em>find us</em></h2>
        <table class="hours-table" style="margin-top:22px">
          <tr><td>Monday – Friday</td><td>9:00 – 17:30</td></tr>
          <tr class="closed"><td>Saturday</td><td>Closed</td></tr>
          <tr class="closed"><td>Sunday</td><td>Closed</td></tr>
        </table>
        <p style="margin-top:24px;color:var(--muted)">Outside these hours, email <a href="mailto:${SITE.email}" style="color:var(--gold-2)">${SITE.email}</a> or send the wizard. It lands in our inbox for the next working morning.</p>
        <h3 style="margin-top:32px;font-size:1.1rem;font-family:var(--sans);font-weight:700">Areas we serve</h3>
        <ul class="area-cloud" style="margin-top:16px">
          ${SITE.areas.slice(0, 8).map((a) => `<li>${a}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="rv rv-d1">
        ${wizard(services)}
      </div>
    </div>
  </div>
</section>

${ctaBanner(path, {
    title: 'Rather just pick up the phone?',
    text: `No forms, no waiting: call ${SITE.phone1} now and speak to the team directly. ${SITE.hours}.`,
  })}
`;
}
