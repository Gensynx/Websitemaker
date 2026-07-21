/* Page bodies for the 381 Accountants site. */
import {
  SITE, icon, stars5, breadcrumbs, bookingForm, ctaBanner,
  quoteCards, ratingBanner, REVIEWS, REVIEWS_ALL,
} from './lib.mjs';
import { services } from './content-services.mjs';

const rel = (path) => (path.includes('/') ? '../' : '');
const yearsExp = new Date().getFullYear() - SITE.established;

/* ---------------- Shared fragments ---------------- */

function servicesGrid(path) {
  const r = rel(path);
  return `<div class="svc-grid">
${services.map((s, i) => `  <article class="svc-card rv${i % 3 ? ` rv-d${i % 3}` : ''}">
    <span class="svc-icon">${icon(s.icon)}</span>
    <h3>${s.name}</h3>
    <p>${s.short}</p>
    <a class="text-link" href="${r}services/${s.slug}.html">Full breakdown ${icon('arrow')}</a>
  </article>`).join('\n')}
</div>`;
}

function bookingPanel(path, { selected = '' } = {}) {
  return `<div class="book-panel rv">
  <div class="book-info">
    <span class="eyebrow">Book a service</span>
    <h2>One conversation, and your paperwork problem is ours.</h2>
    <p>Every engagement starts with a free consultation. Choose the service you need, or tell us you are not sure and we will help you work it out.</p>
    <ul class="book-list">
${services.map((s) => `      <li>${icon('check')} <span><b>${s.name}:</b> ${s.mini}</span></li>`).join('\n')}
    </ul>
  </div>
  <div class="book-side">
    ${bookingForm({ services, selected })}
  </div>
</div>`;
}

function statsBar() {
  return `<section class="trust-bar" aria-label="Key facts">
  <div class="wrap">
    <div class="trust-grid">
      <div class="trust-cell"><b data-count="${yearsExp}" data-suffix="+">${yearsExp}+</b><span>Years serving London</span></div>
      <div class="trust-cell"><b data-count="5.0">5.0</b><span>Google rating · ${SITE.reviewCount} reviews</span></div>
      <div class="trust-cell"><b data-count="7">7</b><span>Core services under one roof</span></div>
      <div class="trust-cell"><b>${SITE.established}</b><span>Independent firm, est. ${SITE.established}</span></div>
    </div>
  </div>
</section>`;
}

/* ---------------- Home ---------------- */

export function homeBody(path = 'index.html') {
  const r = rel(path);
  return `
<section class="hero">
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <span class="eyebrow">Certified accountants · Canary Wharf, London</span>
        <h1>Accounting &amp; bookkeeping in <em>safe hands</em> for ${yearsExp}+ years.</h1>
        <p class="hero-sub">${SITE.name} is an independent firm of certified accountants trusted by London businesses since <strong>${SITE.established}</strong>. From daily bookkeeping to year-end accounts and tax, we keep you compliant, informed and ahead, <strong>whatever your size</strong>.</p>
        <div class="hero-ctas">
          <a class="btn btn-gold" href="${r}contact.html">Book a free consultation ${icon('arrow')}</a>
          <a class="btn btn-outline" href="${r}services/index.html">Explore our services</a>
        </div>
        <ul class="hero-points">
          <li>${icon('star')} 5.0 rating on Google</li>
          <li>${icon('shield')} HMRC &amp; Companies House compliant</li>
          <li>${icon('cloud')} Sage &amp; QuickBooks certified</li>
        </ul>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="hv-card hv-main">
          <div class="hv-title"><b>Your year, handled</b><span class="hv-badge">381 · Est. ${SITE.established}</span></div>
          <div class="hv-rows">
            <div class="hv-row"><span>Bookkeeping</span><b class="pos">Up to date</b></div>
            <div class="hv-row"><span>VAT return · Q2</span><b class="pos">Filed early</b></div>
            <div class="hv-row"><span>Payroll · June</span><b class="pos">Paid on time</b></div>
            <div class="hv-row"><span>Corporation tax saved</span><b>£4,820</b></div>
          </div>
          <div class="hv-bars">
            <i style="height:34%"></i><i style="height:52%"></i><i style="height:41%"></i><i style="height:66%"></i><i style="height:58%"></i><i style="height:82%"></i><i style="height:74%"></i><i style="height:96%"></i>
          </div>
        </div>
        <div class="hv-card hv-chip c1">
          ${icon('star')}
          <span><b>5.0 on Google</b><span class="hv-stars">★★★★★</span></span>
        </div>
        <div class="hv-card hv-chip c2">
          ${icon('shield')}
          <span><b>Deadline never missed</b><span>Self assessment · 31 Jan</span></span>
        </div>
      </div>
    </div>
  </div>
</section>

${statsBar()}

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">What we do</span>
      <h2>Every service your business needs, under one roof</h2>
      <p>Bookkeeping to tax investigations: one team that knows your numbers end to end, so nothing falls between the gaps. Every service links to a full breakdown of exactly what we do and how.</p>
    </div>
    ${servicesGrid(path)}
    <p class="divider-note rv">${icon('info')} Not sure which service you need? <a class="text-link" href="${r}contact.html">Book a free consultation${icon('arrow')}</a> and we will point you the right way, no obligation.</p>
  </div>
</section>

<section class="section tight" id="book">
  <div class="wrap">
    ${bookingPanel(path)}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="rv">
        <span class="eyebrow">Why 381</span>
        <h2 style="font-size:clamp(1.9rem,4vw,2.7rem);margin-top:14px">The accountants London businesses keep for the long run</h2>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">${icon('handshake')}</span>
            <div><h4>Personal, proactive service</h4><p>Our mission is an efficient, proactive service for every client. You deal with people who know your business, not a call queue.</p></div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">${icon('shield')}</span>
            <div><h4>Certified &amp; established</h4><p>An independent firm of certified accountants, registered in England &amp; Wales and serving London since ${SITE.established}.</p></div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">${icon('cloud')}</span>
            <div><h4>Cloud accounting as standard</h4><p>Sage One, Sage 50 and QuickBooks: live numbers you can see any time, from anywhere, on any device.</p></div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">${icon('pound')}</span>
            <div><h4>Value clients rate five stars</h4><p>Professionalism, accuracy and value for money. Those are the words our clients use in their own Google reviews.</p></div>
          </div>
        </div>
      </div>
      <div class="cred-stack rv rv-d1">
        <div class="cred-card"><span class="svc-icon">${icon('users')}</span><div><b>Businesses of every size</b><span>Sole traders, landlords, contractors and limited companies</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('target')}</span><div><b>Clients stay for years</b><span>Reviewers report relationships of five years and longer</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('doc')}</span><div><b>Every deadline diarised</b><span>VAT, payroll, accounts and tax, tracked so you never get a penalty</span></div></div>
        <div class="cred-note"><b>${yearsExp}+ years</b>of keeping London businesses compliant, informed and ahead, with senior experience in the industry stretching back over 25 years.</div>
      </div>
    </div>
  </div>
</section>

<section class="section muted-section">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">How it works</span>
      <h2>Three steps to never worrying about this again</h2>
    </div>
    <div class="steps">
      <div class="step rv"><h3>Book a free consultation</h3><p>Call, email or use the form. We listen, look at where you are and quote a clear fee. No obligation, no jargon.</p></div>
      <div class="step rv rv-d1"><h3>We take everything over</h3><p>Records collected, registrations sorted, backlogs cleared and software set up. The handover is our job, not yours.</p></div>
      <div class="step rv rv-d2"><h3>You get on with business</h3><p>Books kept current, returns filed early, deadlines met, with proactive advice through the year, not just at year end.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">Client reviews</span>
      <h2>Rated five stars by the people who pay us</h2>
      <p>Real reviews from our Google listing: ${SITE.reviewCount} of them, every one five stars, many from clients of ten years and longer.</p>
    </div>
    ${ratingBanner()}
    <div class="quote-grid">
      ${quoteCards()}
    </div>
    <p class="divider-note rv">${icon('google')} <a class="text-link" href="${r}reviews.html">Read more client reviews${icon('arrow')}</a></p>
  </div>
</section>

${ctaBanner(path, {
    title: 'Speak to an accountant today. The consultation is free.',
    text: `Call us on ${SITE.phone1}, email ${SITE.email} or book online. We serve clients across ${SITE.areas.slice(0, 6).join(', ')} and the wider London area.`,
  })}
`;
}

/* ---------------- Services hub ---------------- */

export function servicesHubBody(path = 'services/index.html') {
  return `
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Services', '']])}
    <h1>Accounting services, end to end</h1>
    <p class="lede">Seven core services, one team, zero gaps. Every engagement starts with a <strong>free consultation</strong> and a clear, agreed fee, so you always know exactly what you are getting and what it costs. Open any service for the full breakdown.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${servicesGrid(path)}
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    ${bookingPanel(path)}
  </div>
</section>

<section class="section muted-section tight">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">Good to know</span>
      <h2>Common questions before booking</h2>
    </div>
    <div class="faq" style="margin-inline:auto">
      <details class="rv"><summary>How do your fees work?${icon('plus')}</summary><p>We agree a fixed fee before any work starts, based on the services you need and the state of your records. No surprise invoices, no hourly meters running.</p></details>
      <details class="rv"><summary>Can you take over from my current accountant?${icon('plus')}</summary><p>Yes. Switching is easier than most people expect. With your permission we write to your current accountant for professional clearance and your records, and we handle the whole handover.</p></details>
      <details class="rv"><summary>Do you only work with businesses near Canary Wharf?${icon('plus')}</summary><p>No. We are based at 30 Churchill Place in ${SITE.town} and work with clients across ${SITE.areas.slice(1, 8).join(', ')} and beyond. Cloud accounting means we can serve you wherever you are.</p></details>
      <details class="rv"><summary>My books are months behind. Is that a problem?${icon('plus')}</summary><p>It is a Tuesday. Backlogs, missed returns and HMRC letters are routine rescue work for us. The sooner you get in touch, the cheaper they are to fix.</p></details>
    </div>
  </div>
</section>

${ctaBanner(path)}
`;
}

/* ---------------- Service detail page ---------------- */

export function servicePage(svc, path) {
  const r = rel(path);
  const others = services.filter((s) => s.slug !== svc.slug);
  return `
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Services', 'services/index.html'], [svc.name, '']])}
    <h1>${svc.name}</h1>
    <p class="lede">${svc.heroLede}</p>
    <div class="hero-ctas">
      <a class="btn btn-gold" href="${r}contact.html?service=${encodeURIComponent(svc.name)}">Book this service ${icon('arrow')}</a>
      <a class="btn btn-outline" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="svc-layout">
      <div class="svc-body">
        ${svc.intro.map((p) => `<p class="rv">${p}</p>`).join('\n        ')}
        <h2 class="rv">What’s included</h2>
        <ul class="check-list">
          ${svc.included.map(([b, s], i) => `<li class="rv${i % 2 ? ' rv-d1' : ''}">${icon('check')} <span><b>${b}:</b> ${s}</span></li>`).join('\n          ')}
        </ul>
        <h2 class="rv">How it works, step by step</h2>
        <ol class="how-steps">
          ${svc.steps.map(([t, d], i) => `<li class="rv${i % 2 ? ' rv-d1' : ''}"><div class="how-num">${i + 1}</div><div><h3>${t}</h3><p>${d}</p></div></li>`).join('\n          ')}
        </ol>
        <div class="info-callout rv">${icon('info')} <p><b>Worth knowing:</b> ${svc.callout}</p></div>
        <h2 class="rv">Frequently asked</h2>
        <div class="faq">
          ${svc.faqs.map(([q, a]) => `<details class="rv"><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('\n          ')}
        </div>
      </div>
      <aside class="svc-aside">
        <div class="aside-card dark-card rv">
          <h3>Book ${svc.name.toLowerCase().startsWith('tax') || svc.name.toLowerCase().startsWith('self') ? 'this service' : svc.name.toLowerCase()}</h3>
          <p>Free consultation, fixed fee agreed up front, reply within one working day.</p>
          <a class="btn btn-gold" href="${r}contact.html?service=${encodeURIComponent(svc.name)}">Book a free consultation</a>
          <a class="btn btn-outline" href="tel:${SITE.phone1tel}">${icon('phone')} Call ${SITE.phone1}</a>
        </div>
        <div class="aside-card rv">
          <h3>All services</h3>
          <div class="aside-links">
            ${[svc, ...others].sort((a, b) => services.indexOf(a) - services.indexOf(b)).map((s) => `<a href="${r}services/${s.slug}.html"${s.slug === svc.slug ? ' class="now" aria-current="page"' : ''}>${s.name} ${icon('chevron')}</a>`).join('\n            ')}
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
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['About Us', '']])}
    <h1>An independent firm you can build on</h1>
    <p class="lede">${SITE.legal} has served London businesses and individuals since <strong>${SITE.established}</strong>: ${yearsExp}+ years of bookkeeping, payroll, tax and accounts, delivered with the personal attention only an independent firm gives.</p>
  </div>
</section>

${statsBar()}

<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="rv">
        <span class="eyebrow">Our story</span>
        <h2 style="font-size:clamp(1.9rem,4vw,2.6rem);margin-top:14px">East London roots. At home in Canary Wharf.</h2>
        <div style="display:grid;gap:16px;margin-top:22px;color:var(--text-muted)">
          <p>381 Accountants was established in ${SITE.established} as an independent firm of certified accountants with a simple mission: <strong style="color:var(--ink)">to provide an efficient and proactive service to every client, and to assure them they are investing in the right accountants, regardless of size.</strong></p>
          <p>From our office at 30 Churchill Place in Canary Wharf we serve sole traders, landlords, contractors and limited companies across ${SITE.areas.slice(0, 6).join(', ')} and the wider London area. Our senior team’s experience in the industry stretches back more than 25 years, through every change in tax law, filing regime and software along the way.</p>
          <p>Clients come to us for a tax return or a tidy-up, and stay for years. Our Google reviews tell that story better than we can: five stars across the board, with reviewers citing professionalism, trustworthiness, responsiveness, accuracy and value for money.</p>
        </div>
        <div class="hero-ctas" style="margin-top:28px">
          <a class="btn btn-navy" href="${r}reviews.html">Read our reviews ${icon('arrow')}</a>
          <a class="btn btn-outline" href="${r}contact.html">Meet us: book a consultation</a>
        </div>
      </div>
      <div class="cred-stack rv rv-d1">
        <div class="cred-card"><span class="svc-icon">${icon('shield')}</span><div><b>Certified accountants</b><span>An independent, certified firm registered in England &amp; Wales, no. ${SITE.companyNo}</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('cloud')}</span><div><b>Sage &amp; QuickBooks</b><span>Cloud accounting on Sage One, Sage 50 and QuickBooks as standard</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('star')}</span><div><b>5.0 on Google</b><span>Unanimous five-star rating from verified client reviews</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('pin')}</span><div><b>Canary Wharf address</b><span>30 Churchill Place, London ${SITE.postcode}, serving all of Greater London</span></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section muted-section">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">How we work</span>
      <h2>What “proactive” actually means here</h2>
      <p>Plenty of firms file what you send them. We think that is the smallest part of the job.</p>
    </div>
    <div class="svc-grid">
      <article class="svc-card rv"><span class="svc-icon">${icon('clock')}</span><h3>Ahead of deadlines</h3><p>Every filing date, from VAT and payroll to accounts and self assessment, is diarised and hit early, so penalties simply never happen.</p></article>
      <article class="svc-card rv rv-d1"><span class="svc-icon">${icon('handshake')}</span><h3>A person, not a portal</h3><p>You get direct access to the people doing your work. Responsive, polite and efficient: their words, not ours.</p></article>
      <article class="svc-card rv rv-d2"><span class="svc-icon">${icon('planning')}</span><h3>Advice before the fact</h3><p>Tax planning happens while decisions can still be made (salary mix, timing, structure), not after the year has closed.</p></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">Where we work</span>
      <h2>Serving clients across London &amp; Essex</h2>
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
  const r = rel(path);
  return `
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Reviews', '']])}
    <h1>Five stars, ${SITE.reviewCount} times over</h1>
    <p class="lede">We could tell you we are professional, responsive and worth the money, but our clients already did, in public, on Google. <strong>${SITE.reviewCount} reviews, a 5.0 rating, and every single one five stars.</strong></p>
    <div class="hero-ctas">
      <a class="btn btn-gold" href="${SITE.google}" target="_blank" rel="noopener">See our reviews on Google ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${ratingBanner()}
    <div class="quote-grid">
      ${quoteCards()}
    </div>
    <div class="praise-row rv">
      ${['Fast response', 'Professional team', 'Cooperative staff', 'Value for money', 'Trustworthy advice'].map((p) => `<span class="praise-chip">${icon('check')} ${p}</span>`).join('\n      ')}
    </div>
    <p class="divider-note rv">${icon('google')} The topics above are the ones Google highlights across our ${SITE.reviewCount} reviews. Quotes are shown with the reviewers’ published names, lightly tidied for spelling only.</p>
  </div>
</section>

<section class="section muted-section">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">Straight from Google</span>
      <h2>In their own words</h2>
      <p>A selection from the ${SITE.reviewCount} five-star reviews on our Google listing. Clients of a year, of a decade, and of twenty-five.</p>
    </div>
    <div class="review-wall">
      ${quoteCards(REVIEWS_ALL, false)}
    </div>
  </div>
</section>

<section class="section muted-section tight">
  <div class="wrap">
    <div class="split">
      <div class="rv">
        <span class="eyebrow">The long version</span>
        <h2 style="font-size:clamp(1.8rem,3.6vw,2.4rem);margin-top:14px">Clients don’t just rate us. They stay.</h2>
        <div style="display:grid;gap:14px;margin-top:18px;color:var(--text-muted)">
          <p>The review we are proudest of is not a sentence. It is a duration. Reviewers describe working with us for <strong style="color:var(--ink)">five, ten, even twenty-five years</strong>: Priscila since 2011, Sofia since 2012, Srinivas since 2013, and Gulsara for over two decades.</p>
          <p>Accountancy is a trust business. You are handing over the numbers your livelihood depends on, and the only honest evidence anyone can offer is a track record. Ours is public, unanimous and growing.</p>
        </div>
      </div>
      <div class="cred-stack rv rv-d1">
        <div class="cred-card"><span class="svc-icon">${icon('star')}</span><div><b>5.0 from ${SITE.reviewCount} reviews</b><span>Every Google review left for us is five stars</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('users')}</span><div><b>Clients for the long run</b><span>“I have been with this firm over 25 years.” Gulsara Sarah Wennell</span></div></div>
        <div class="cred-card"><span class="svc-icon">${icon('handshake')}</span><div><b>Recommended onward</b><span>“I would highly recommend them to anyone needing accounting services.” Dustin Clark</span></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap center">
    <div class="section-head center rv" style="margin-bottom:22px">
      <span class="eyebrow">Add your voice</span>
      <h2>Worked with us? Tell others.</h2>
      <p>Reviews help small businesses like ours, and like yours, get found. If we have looked after you, two minutes on Google goes a long way.</p>
    </div>
    <div class="hero-ctas rv" style="justify-content:center">
      <a class="btn btn-navy" href="${SITE.google}" target="_blank" rel="noopener">${icon('google')} Review us on Google</a>
      <a class="btn btn-outline" href="${r}contact.html" style="color:var(--ink);border-color:var(--border-strong)">Become a client first ${icon('arrow')}</a>
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
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Contact', '']])}
    <h1>Talk to an accountant today</h1>
    <p class="lede">Call, email, or book below. A real person replies within <strong>one working day</strong>, and the first consultation is always free and always without obligation.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="contact-grid">
      <div class="contact-card rv">
        <span class="svc-icon">${icon('phone')}</span>
        <h3>Call us</h3>
        <p>${SITE.hours}. If we are with a client, leave a message and we will call back the same day.</p>
        <a class="big" href="tel:${SITE.phone1tel}">${SITE.phone1}</a>
        <a class="big" href="tel:${SITE.phone2tel}">${SITE.phone2}</a>
      </div>
      <div class="contact-card rv rv-d1">
        <span class="svc-icon">${icon('mail')}</span>
        <h3>Email us</h3>
        <p>Send your question, your HMRC letter or your shoebox of receipts. We have seen it all.</p>
        <a class="big" href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
      <div class="contact-card rv rv-d2">
        <span class="svc-icon">${icon('pin')}</span>
        <h3>Visit us</h3>
        <address>${SITE.address},<br>${SITE.town}, London ${SITE.postcode}</address>
        <a class="big" href="${SITE.maps}" target="_blank" rel="noopener">Open in Google Maps</a>
      </div>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="book-panel rv">
      <div class="book-info">
        <span class="eyebrow">Opening hours</span>
        <h2>When to find us</h2>
        <table class="hours-table" style="margin-top:20px;color:var(--d-muted)">
          <tr><td>Monday – Friday</td><td style="color:var(--d-text)">9:00 – 17:30</td></tr>
          <tr class="closed"><td>Saturday</td><td>Closed</td></tr>
          <tr class="closed"><td>Sunday</td><td>Closed</td></tr>
        </table>
        <p style="margin-top:26px">Outside these hours, email <a href="mailto:${SITE.email}" style="color:var(--gold-on-dark-2)">${SITE.email}</a> or send the form. It lands in our inbox for the next working morning.</p>
        <h3 style="color:var(--d-text);margin-top:30px;font-size:1.15rem">Areas we serve</h3>
        <ul class="area-cloud" style="margin-top:14px">
          ${SITE.areas.slice(0, 8).map((a) => `<li>${a}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="book-side">
        ${bookingForm({ heading: 'Book your free consultation', note: 'Pick a service, or “not sure yet” is a perfectly good answer.', services })}
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
