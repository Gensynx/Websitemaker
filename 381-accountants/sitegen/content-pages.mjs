/* Page bodies for the 381 Accountants site. */
import {
  SITE, icon, stars5, breadcrumbs, bookingForm, ctaBanner,
  quoteCards, ratingBanner, REVIEWS, REVIEWS_ALL,
  rel, tbc, fact, CTA, bookHref, deadlineFinder,
} from './lib.mjs';
import { services } from './content-services.mjs';
const yearsExp = new Date().getFullYear() - SITE.established;

/* ---------------- Shared fragments ---------------- */

const feeText = (svc) => (svc.fee.from == null
  ? `From ${tbc('£ to confirm')} ${svc.fee.basis}`
  : `From £${svc.fee.from.toLocaleString('en-GB')} ${svc.fee.basis}`);

function feesTable(path) {
  const r = rel(path);
  return `<div class="fee-table rv">
  <table>
    <caption class="sr-only">Starting fees by service</caption>
    <thead><tr><th scope="col">Service</th><th scope="col">Starting fee</th></tr></thead>
    <tbody>
${services.map((s) => `      <tr><th scope="row"><a href="${r}services/${s.slug}.html">${s.name}</a><span>${s.mini}</span></th><td>${feeText(s)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <p class="fee-note">${icon('info')} Every fee is fixed and agreed in writing before work starts. Your quote depends on transaction volume and the state of your records; the consultation that produces it is free.</p>
</div>`;
}

function teamCards() {
  return SITE.team.map((m) => `<article class="person-card rv">
    <span class="person-mark" aria-hidden="true">${icon('users')}</span>
    <div>
      <h3>${fact(m.name, 'Full name')}</h3>
      <p class="person-role">${fact(m.role, 'Role')} · ${fact(m.quals, 'Qualification, e.g. professional body membership')}</p>
      <p>${fact(m.bio, 'Two lines on experience and the clients they look after')}</p>
    </div>
  </article>`).join('\n');
}

function regulationList() {
  return `<dl class="reg-list rv">
    <div><dt>Company</dt><dd>${SITE.legal}, registered in England &amp; Wales, company no. ${SITE.companyNo}</dd></div>
    <div><dt>Professional body</dt><dd>${fact(SITE.professionalBody, 'Body and membership number')}</dd></div>
    <div><dt>Anti-money-laundering supervision</dt><dd>${fact(SITE.amlSupervisor, 'Supervisory body')}</dd></div>
    <div><dt>Professional indemnity insurance</dt><dd>${fact(SITE.indemnity, 'Insurer and level of cover')}</dd></div>
    <div><dt>Data protection</dt><dd>${SITE.icoNumber == null ? `ICO registration ${tbc('number')}` : `ICO registration ${SITE.icoNumber}`}</dd></div>
  </dl>`;
}

/* FAQs every page type can reuse: the questions people ask before trusting
   an accountant with their records. */
function trustFaqs(path) {
  const r = rel(path);
  const lead = SITE.team[0];
  return `<details class="rv"><summary>Who will I actually deal with?${icon('plus')}</summary><p>The people doing your work, directly, by phone or email during office hours: ${fact(lead.name, 'name')}, ${fact(lead.quals, 'qualification')}, and the team on the <a class="text-link inline" href="${r}about.html#team">About page</a>.</p></details>
      <details class="rv"><summary>Who regulates you?${icon('plus')}</summary><p>${SITE.legal} is registered in England &amp; Wales (company no. ${SITE.companyNo}). Professional body: ${fact(SITE.professionalBody, 'to confirm')}. Anti-money-laundering supervision: ${fact(SITE.amlSupervisor, 'to confirm')}. Professional indemnity insurance: ${fact(SITE.indemnity, 'to confirm')}.</p></details>
      <details class="rv"><summary>What if I want to move to another accountant later?${icon('plus')}</summary><p>Give us ${fact(SITE.noticePeriod, 'notice period')} notice. Your new accountant will write to us for professional clearance, and we hand over your records and the information they need to carry on.</p></details>`;
}

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
          <a class="btn btn-gold" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
          <a class="btn btn-outline" href="${r}services/index.html#fees">Services &amp; fees</a>
        </div>
        <ul class="hero-points">
          <li><a href="${SITE.google}" target="_blank" rel="noopener">${icon('star')} 5.0 rating on Google</a></li>
          <li>${icon('shield')} HMRC &amp; Companies House compliant</li>
          <li>${icon('cloud')} Sage &amp; QuickBooks certified</li>
        </ul>
      </div>
      <figure class="proof-card">
        <div class="proof-top">
          <span class="stars" role="img" aria-label="5 out of 5 stars">${stars5}</span>
          <a href="${SITE.google}" target="_blank" rel="noopener"><b>5.0 on Google</b> · ${SITE.reviewCount} reviews</a>
        </div>
        <blockquote>${REVIEWS[0].text}</blockquote>
        <figcaption><b>${REVIEWS[0].name}</b> · ${REVIEWS[0].meta}</figcaption>
        <dl class="proof-facts">
          <div><dt>Established</dt><dd>${SITE.established}</dd></div>
          <div><dt>Company no.</dt><dd>${SITE.companyNo}</dd></div>
          <div><dt>Office</dt><dd>30 Churchill Place, ${SITE.postcode}</dd></div>
        </dl>
      </figure>
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
    <p class="divider-note rv">${icon('pound')} Fixed fees, agreed before any work starts. <a class="text-link" href="${r}services/index.html#fees">See starting fees${icon('arrow')}</a></p>
  </div>
</section>

<section class="section muted-section" id="deadlines">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">Deadline finder</span>
      <h2>When is everything due?</h2>
      <p>Enter your company’s year end, and your VAT quarters if you have them, to see your filing and payment dates worked out the way Companies House and HMRC work them out.</p>
    </div>
    ${deadlineFinder(path, { compact: true })}
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
    <div class="hero-ctas">
      <a class="btn btn-gold" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
      <a class="btn btn-outline" href="#fees">See starting fees</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${servicesGrid(path)}
  </div>
</section>

<section class="section muted-section" id="fees">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">Fees</span>
      <h2>What it costs</h2>
      <p>Starting prices for each service. The fee you pay is fixed and agreed before we start, so there is never an hourly meter running.</p>
    </div>
    ${feesTable(path)}
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
      <details class="rv"><summary>How do your fees work?${icon('plus')}</summary><p>We agree a fixed fee before any work starts, based on the services you need and the state of your records. No surprise invoices, no hourly meters running. Starting prices for every service are in the <a class="text-link inline" href="#fees">fees table</a> above.</p></details>
      <details class="rv"><summary>Can you take over from my current accountant?${icon('plus')}</summary><p>Yes. Switching is easier than most people expect. With your permission we write to your current accountant for professional clearance and your records, and we handle the whole handover.</p></details>
      <details class="rv"><summary>Do you only work with businesses near Canary Wharf?${icon('plus')}</summary><p>No. We are based at 30 Churchill Place in ${SITE.town} and work with clients across ${SITE.areas.slice(1, 8).join(', ')} and beyond. Cloud accounting means we can serve you wherever you are.</p></details>
      <details class="rv"><summary>My books are months behind. Is that a problem?${icon('plus')}</summary><p>It is a Tuesday. Backlogs, missed returns and HMRC letters are routine rescue work for us. The sooner you get in touch, the cheaper they are to fix.</p></details>
      ${trustFaqs(path)}
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
      <a class="btn btn-gold" href="${bookHref(path, svc.name)}">${CTA} ${icon('arrow')}</a>
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
        ${svc.keyDates ? `<h2 class="rv">Key dates</h2>
        <dl class="key-dates rv">
          ${svc.keyDates.map(([d, what]) => `<div><dt>${d}</dt><dd>${what}</dd></div>`).join('\n          ')}
        </dl>
        <p class="key-dates-note rv">Standard HMRC and Companies House deadlines. Yours depend on your year end and circumstances: the <a class="text-link inline" href="${r}deadlines.html">deadline finder</a> works out company dates, and we diarise every one when you join.</p>` : ''}
        <h2 class="rv">Frequently asked</h2>
        <div class="faq">
          ${svc.faqs.map(([q, a]) => `<details class="rv"><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('\n          ')}
        </div>
      </div>
      <aside class="svc-aside">
        <div class="aside-card dark-card rv">
          <h3>${svc.name}</h3>
          <p class="aside-fee">${feeText(svc)}</p>
          <p>Free consultation, fixed fee agreed up front, reply within one working day.</p>
          <a class="btn btn-gold" href="${bookHref(path, svc.name)}">${CTA}</a>
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

/* ---------------- Deadlines ---------------- */

export function deadlinesBody(path = 'deadlines.html') {
  return `
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbs(path, [['Home', 'index.html'], ['Deadlines', '']])}
    <h1>Your filing and payment dates, worked out</h1>
    <p class="lede">Enter your company’s year end, and your VAT quarters if you have them. The dates follow the standard Companies House and HMRC rules, soonest first.</p>
    <div class="hero-ctas">
      <a class="btn btn-gold" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
      <a class="btn btn-outline" href="#rules">How the dates are worked out</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${deadlineFinder(path)}
  </div>
</section>

<section class="section muted-section" id="rules">
  <div class="wrap">
    <div class="section-head center rv">
      <span class="eyebrow">The rules</span>
      <h2>How each date is worked out</h2>
    </div>
    <div class="rules rv">
      <table>
        <caption class="sr-only">Deadline rules</caption>
        <thead><tr><th scope="col">Deadline</th><th scope="col">Rule</th></tr></thead>
        <tbody>
          <tr><th scope="row">Accounts to Companies House</th><td>9 months after the year end for a private company. If the year end is the last day of a month, the deadline is the last day of the month 9 months later. First accounts are due 21 months after incorporation.</td></tr>
          <tr><th scope="row">Corporation tax payment</th><td>9 months and 1 day after the end of the accounting period, for companies that are not large. A 31 March year end pays on 1 January.</td></tr>
          <tr><th scope="row">Company tax return (CT600)</th><td>12 months after the end of the accounting period.</td></tr>
          <tr><th scope="row">VAT return and payment</th><td>1 calendar month and 7 days after the end of each VAT period.</td></tr>
          <tr><th scope="row">Self assessment</th><td>Register by 5 October after the tax year you first need to file for. Paper returns by 31 October; online returns and the balance of tax by 31 January; payments on account on 31 January and 31 July.</td></tr>
          <tr><th scope="row">Payroll</th><td>Full Payment Submission on or before each payday; PAYE paid by the 22nd of the following month when paying electronically; P60s by 31 May; P11Ds by 6 July.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

${ctaBanner(path, { title: 'Rather we kept the diary?', text: 'Every client’s deadlines are diarised the day they join, and returns go in early. The first consultation is free.' })}
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
    <div class="hero-ctas">
      <a class="btn btn-gold" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
      <a class="btn btn-outline" href="#team">Meet the team</a>
    </div>
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
          <a class="btn btn-gold" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
          <a class="btn btn-outline" href="${r}reviews.html">Read our reviews</a>
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

<section class="section muted-section" id="team">
  <div class="wrap">
    <div class="split top">
      <div>
        <div class="section-head rv">
          <span class="eyebrow">Who you will work with</span>
          <h2>The people behind your accounts</h2>
          <p>You deal with the people doing your work, not a call queue. These are the names you will see on your emails and hear on the phone.</p>
        </div>
        <div class="person-list">
          ${teamCards()}
        </div>
      </div>
      <div>
        <div class="section-head rv">
          <span class="eyebrow">Regulation &amp; protection</span>
          <h2>Checks you can make before you call</h2>
          <p>Handing over your records is a trust decision. Here is who we answer to.</p>
        </div>
        ${regulationList()}
      </div>
    </div>
  </div>
</section>

<section class="section">
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

<section class="section muted-section">
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
      <a class="btn btn-gold" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
      <a class="btn btn-outline" href="${SITE.google}" target="_blank" rel="noopener">Check them on Google</a>
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
      <a class="btn btn-gold" href="${bookHref(path)}">${CTA}</a>
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
    <div class="hero-ctas">
      <a class="btn btn-gold" href="#book">${CTA} ${icon('arrow')}</a>
      <a class="btn btn-outline" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
    </div>
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

<section class="section tight" id="book">
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
        <p style="margin-top:26px">Outside these hours, email <a class="inline-link" href="mailto:${SITE.email}">${SITE.email}</a> or send the form. It lands in our inbox for the next working morning.</p>
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
