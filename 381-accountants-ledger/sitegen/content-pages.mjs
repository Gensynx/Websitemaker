/* Page bodies for the Ledger edition. */
import {
  SITE, REVIEWS, REVIEWS_ALL, services, fact, tbc,
  rel, CTA, bookHref, yearsExp, feeText, icon,
  sectionHead, pageHero, ctaBand, servicesLedger, reviewFigure, ratingLine,
  bookingForm, deadlineFinder, trustFaqs, faqList, breadcrumbs,
} from './lib.mjs';

function factRows() {
  return `<dl class="facts">
    <div><dt>Established</dt><dd class="mono">${SITE.established}</dd></div>
    <div><dt>Company no.</dt><dd class="mono">${SITE.companyNo}</dd></div>
    <div><dt>Google rating</dt><dd><a href="${SITE.google}" target="_blank" rel="noopener"><span class="mono">5.0</span> from ${SITE.reviewCount} reviews</a></dd></div>
    <div><dt>Office</dt><dd>30 Churchill Place, ${SITE.postcode}</dd></div>
  </dl>`;
}

function peopleBlock() {
  return `<div class="people">
    ${SITE.team.map((m) => `<article class="person">
      <p class="person-role mono">${fact(m.role, 'Role')}</p>
      <h3>${fact(m.name, 'Full name')}</h3>
      <p class="person-quals">${fact(m.quals, 'Qualification and professional body')}</p>
      <p>${fact(m.bio, 'Two lines on experience and the clients they look after')}</p>
    </article>`).join('\n    ')}
  </div>`;
}

function regulationBlock() {
  return `<dl class="reg">
    <div><dt>Company</dt><dd>${SITE.legal}, registered in England &amp; Wales, company no. <span class="mono">${SITE.companyNo}</span></dd></div>
    <div><dt>Professional body</dt><dd>${fact(SITE.professionalBody, 'Body and membership number')}</dd></div>
    <div><dt>Anti-money-laundering supervision</dt><dd>${fact(SITE.amlSupervisor, 'Supervisory body')}</dd></div>
    <div><dt>Professional indemnity insurance</dt><dd>${fact(SITE.indemnity, 'Insurer and level of cover')}</dd></div>
    <div><dt>Data protection</dt><dd>${SITE.icoNumber == null ? `ICO registration ${tbc('number')}` : `ICO registration <span class="mono">${SITE.icoNumber}</span>`}</dd></div>
  </dl>`;
}

/* ---------------- Home ---------------- */
export function homeBody(path = 'index.html') {
  const r = rel(path);
  const lead = REVIEWS[0];
  return `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker mono">Certified accountants · Canary Wharf · Since ${SITE.established}</p>
      <h1>Your books in order. <span class="hl">Your deadlines met.</span></h1>
      <p class="lede">An independent firm looking after the bookkeeping, payroll, VAT, accounts and tax of London businesses for ${yearsExp} years. Fixed fees agreed in writing, and the same people answering your calls.</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a>
        <a class="btn btn-quiet btn-lg" href="${r}services/index.html#fees">Services &amp; fees</a>
      </div>
    </div>
    <aside class="hero-proof" aria-label="What clients say">
      <p class="proof-label mono">Client for over 25 years</p>
      ${reviewFigure(lead, { large: true })}
      ${factRows()}
    </aside>
  </div>
</section>

<section class="figures" aria-label="The firm in figures">
  <div class="wrap fig-grid">
    <p><b class="mono">${yearsExp}+</b><span>years serving London</span></p>
    <p><b class="mono">5.0</b><span>Google rating, ${SITE.reviewCount} reviews</span></p>
    <p><b class="mono">7</b><span>services under one roof</span></p>
    <p><b class="mono">1</b><span>fixed fee, agreed in writing</span></p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '01', label: 'Services', title: 'Everything on one ledger', intro: 'One team for the whole year’s accounting, so nothing falls between two firms. Each service opens to exactly what we do, the deadlines involved and what it costs.' })}
    ${servicesLedger(path)}
  </div>
</section>

<section class="sec sec-alt" id="deadlines">
  <div class="wrap">
    ${sectionHead({ no: '02', label: 'Deadline finder', title: 'When is everything due?', intro: 'Enter your company’s year end and see your filing and payment dates, worked out the way Companies House and HMRC work them out.' })}
    ${deadlineFinder(path, { compact: true })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '03', label: 'How it starts', title: 'Three steps, and it stops being your problem' })}
    <ol class="steps">
      <li><span class="step-no mono" aria-hidden="true">1</span><h3>Free consultation</h3><p>Call, email or send the form. We look at where you are and quote a fixed fee in writing. No obligation, no jargon.</p></li>
      <li><span class="step-no mono" aria-hidden="true">2</span><h3>We take it over</h3><p>Professional clearance from your old accountant, records collected, registrations and software sorted. The handover is our job.</p></li>
      <li><span class="step-no mono" aria-hidden="true">3</span><h3>Deadlines met, all year</h3><p>Books kept current, returns filed early, and advice while decisions can still be made, not just at year end.</p></li>
    </ol>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    ${sectionHead({ no: '04', label: 'Clients', title: 'They stay for years. Some for decades.', intro: 'Real reviews from our Google listing, quoted with the reviewers’ published names.' })}
    ${ratingLine()}
    <div class="quote-grid">
      ${REVIEWS.slice(1).concat(REVIEWS_ALL.slice(0, 1)).map((q) => reviewFigure(q)).join('\n      ')}
    </div>
    <p class="more"><a class="text-link" href="${r}reviews.html">Read ${SITE.reviewCount} reviews ${icon('arrow')}</a></p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '05', label: 'People & regulation', title: 'Know who you are trusting', intro: 'The names on your emails, and who the firm answers to.' })}
    <div class="two-col">
      ${peopleBlock()}
      ${regulationBlock()}
    </div>
    <p class="more"><a class="text-link" href="${r}about.html">About the firm ${icon('arrow')}</a></p>
  </div>
</section>

${ctaBand(path)}
`;
}

/* ---------------- Services hub ---------------- */
export function servicesHubBody(path = 'services/index.html') {
  return `
${pageHero(path, {
    trail: [['Home', 'index.html'], ['Services & fees', '']],
    kicker: 'Services &amp; fees',
    title: 'Seven services. One fixed fee each.',
    lede: 'Everything a small business or self-employed person needs from an accountant, from one team. Every fee is fixed and agreed in writing before work starts.',
    actions: `<a class="btn btn-primary btn-lg" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a><a class="btn btn-quiet btn-lg" href="#fees">Jump to fees</a>`,
  })}

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '01', label: 'Services', title: 'What we do', intro: 'Open any service for what is included, how it runs step by step and the deadlines that apply.' })}
    ${servicesLedger(path, { fees: false })}
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    ${sectionHead({ no: '02', label: 'Fees', id: 'fees', title: 'What it costs', intro: 'Starting prices. Your fixed fee depends on transaction volume and the state of your records, and is agreed in writing before we start.' })}
    <table class="fee-table">
      <caption class="sr-only">Starting fee by service</caption>
      <thead><tr><th scope="col">Service</th><th scope="col">Starting fee</th></tr></thead>
      <tbody>
        ${services.map((s) => `<tr><th scope="row"><a href="${s.slug}.html">${s.name}</a><span>${s.mini}</span></th><td>${feeText(s)}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '03', label: 'Before you book', title: 'Questions people ask first' })}
    ${faqList(trustFaqs(path))}
  </div>
</section>

${ctaBand(path)}
`;
}

/* ---------------- Service page ---------------- */
export function servicePage(svc, path) {
  const r = rel(path);
  const idx = services.indexOf(svc);
  return `
${pageHero(path, {
    trail: [['Home', 'index.html'], ['Services & fees', 'services/index.html'], [svc.name, '']],
    kicker: `Service ${String(idx + 1).padStart(2, '0')} / ${String(services.length).padStart(2, '0')}`,
    title: svc.name,
    lede: svc.heroLede,
    actions: `<a class="btn btn-primary btn-lg" href="${bookHref(path, svc.name)}">${CTA} ${icon('arrow')}</a><p class="hero-fee">${feeText(svc)}</p>`,
  })}

<div class="wrap svc-grid">
  <article class="svc-body">
    ${svc.intro.map((p) => `<p class="svc-intro">${p}</p>`).join('\n    ')}

    <h2>What is included</h2>
    <ul class="ruled">
      ${svc.included.map(([b, s]) => `<li>${icon('check')}<span><b>${b}</b> ${s}</span></li>`).join('\n      ')}
    </ul>

    <h2>How it runs</h2>
    <ol class="how">
      ${svc.steps.map(([t, d], i) => `<li><span class="mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('\n      ')}
    </ol>

    ${svc.keyDates ? `<h2>Key dates</h2>
    <table class="dates">
      <caption class="sr-only">Standard deadlines for ${svc.name.toLowerCase()}</caption>
      <thead><tr><th scope="col">When</th><th scope="col">What is due</th></tr></thead>
      <tbody>
        ${svc.keyDates.map(([d, what]) => `<tr><td class="mono">${d}</td><td>${what}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
    <p class="small">Standard HMRC and Companies House deadlines. Yours depend on your year end and circumstances; the <a href="${r}deadlines.html">deadline finder</a> works out company dates, and we diarise every one when you join.</p>` : ''}

    <aside class="note"><p><b>Worth knowing.</b> ${svc.callout}</p></aside>

    <h2>Questions about ${svc.name.toLowerCase()}</h2>
    ${faqList(svc.faqs)}
  </article>

  <aside class="svc-side" aria-label="Book and other services">
    <div class="side-book">
      <p class="mono side-label">${svc.name}</p>
      <p class="side-fee">${feeText(svc)}</p>
      <p>Fixed fee in writing before work starts. Free first consultation; reply within one working day.</p>
      <a class="btn btn-primary btn-block" href="${bookHref(path, svc.name)}">${CTA}</a>
      <a class="side-phone" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>
    </div>
    <nav class="side-nav" aria-label="All services">
      <p class="mono side-label">All services</p>
      <ul>
        ${services.map((s) => `<li><a href="${s.slug}.html"${s === svc ? ' aria-current="page"' : ''}>${s.name}</a></li>`).join('\n        ')}
      </ul>
    </nav>
  </aside>
</div>

${ctaBand(path, { title: `Hand over your ${svc.name.toLowerCase()}.` })}
`;
}

/* ---------------- Deadlines ---------------- */
export function deadlinesBody(path = 'deadlines.html') {
  return `
${pageHero(path, {
    trail: [['Home', 'index.html'], ['Deadlines', '']],
    kicker: 'Deadline finder',
    title: 'Your filing and payment dates, worked out',
    lede: 'Enter your company’s year end, and your VAT quarters if you have them. The dates follow the standard Companies House and HMRC rules.',
  })}

<section class="sec">
  <div class="wrap">
    ${deadlineFinder(path)}
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    ${sectionHead({ no: '01', label: 'The rules', title: 'How each date is worked out' })}
    <table class="dates rules">
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
</section>

${ctaBand(path, { title: 'Rather we kept the diary?', text: 'Every client’s deadlines are diarised the day they join, and returns go in early. The first consultation is free.' })}
`;
}

/* ---------------- About ---------------- */
export function aboutBody(path = 'about.html') {
  return `
${pageHero(path, {
    trail: [['Home', 'index.html'], ['About', '']],
    kicker: `Independent since ${SITE.established}`,
    title: 'An independent firm you can check before you call',
    lede: `${SITE.legal} has looked after London businesses and individuals since ${SITE.established}: bookkeeping, payroll, tax and accounts, with the personal attention of an independent firm.`,
    actions: `<a class="btn btn-primary btn-lg" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a><a class="btn btn-quiet btn-lg" href="#people">Meet the team</a>`,
  })}

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '01', label: 'The firm', title: 'East London roots, at home in Canary Wharf' })}
    <div class="prose">
      <p>381 Accountants was set up in ${SITE.established} as an independent firm of certified accountants with one aim: an efficient, proactive service for every client, whatever their size.</p>
      <p>From 30 Churchill Place we work with sole traders, landlords, contractors and limited companies across ${SITE.areas.slice(0, 6).join(', ')} and the wider London area, on Sage One, Sage 50 and QuickBooks. Our senior team’s experience goes back more than 25 years, through every change in tax law and filing regime along the way.</p>
      <p>Clients come to us for one return and stay for years. Our reviews say it better than we can: professional, responsive, accurate and good value.</p>
    </div>
  </div>
</section>

<section class="sec sec-alt" id="people">
  <div class="wrap">
    ${sectionHead({ no: '02', label: 'People & regulation', title: 'Who you will work with, and who we answer to', intro: 'Handing over your records is a trust decision. These are the checks you can make before you do.' })}
    <div class="two-col">
      ${peopleBlock()}
      ${regulationBlock()}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ no: '03', label: 'How we work', title: 'What proactive means here' })}
    <ol class="steps">
      <li><span class="step-no mono" aria-hidden="true">A</span><h3>Ahead of deadlines</h3><p>Every VAT, payroll, accounts and tax date is diarised and met early, so penalties do not happen.</p></li>
      <li><span class="step-no mono" aria-hidden="true">B</span><h3>A person, not a portal</h3><p>Direct access to the people doing your work, by phone and email during office hours.</p></li>
      <li><span class="step-no mono" aria-hidden="true">C</span><h3>Advice before the fact</h3><p>Salary and dividend mix, timing and structure are planned while decisions can still be made.</p></li>
    </ol>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    ${sectionHead({ no: '04', label: 'Where', title: 'Clients across London and Essex', intro: `Based in ${SITE.town}; with cloud accounting, distance has never mattered less.` })}
    <ul class="areas">${SITE.areas.map((a) => `<li>${a}</li>`).join('')}</ul>
  </div>
</section>

${ctaBand(path)}
`;
}

/* ---------------- Reviews ---------------- */
export function reviewsBody(path = 'reviews.html') {
  return `
${pageHero(path, {
    trail: [['Home', 'index.html'], ['Reviews', '']],
    kicker: `5.0 · ${SITE.reviewCount} Google reviews`,
    title: 'Every review five stars. Many from clients of ten years or more.',
    lede: 'Quoted from our public Google listing with the reviewers’ published names, lightly tidied for spelling only. Check any of them on Google.',
    actions: `<a class="btn btn-primary btn-lg" href="${bookHref(path)}">${CTA} ${icon('arrow')}</a><a class="btn btn-quiet btn-lg" href="${SITE.google}" target="_blank" rel="noopener">Check them on Google ${icon('arrowUpRight')}</a>`,
  })}

<section class="sec">
  <div class="wrap">
    <div class="quote-grid">
      ${REVIEWS.map((q) => reviewFigure(q, { large: true })).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    ${sectionHead({ no: '01', label: 'More reviews', title: 'In their own words' })}
    <div class="review-wall">
      ${REVIEWS_ALL.map((q) => reviewFigure(q)).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap narrow center">
    <h2>Already a client?</h2>
    <p class="sec-intro">Two minutes on Google helps other businesses find an accountant they can trust.</p>
    <p class="actions center"><a class="btn btn-quiet" href="${SITE.google}" target="_blank" rel="noopener">Leave a review on Google ${icon('arrowUpRight')}</a></p>
  </div>
</section>

${ctaBand(path)}
`;
}

/* ---------------- Contact ---------------- */
export function contactBody(path = 'contact.html') {
  return `
${pageHero(path, {
    trail: [['Home', 'index.html'], ['Contact', '']],
    kicker: SITE.hours,
    title: 'Talk to an accountant',
    lede: 'Call, email or send the form. A real person replies within one working day, and the first consultation is free and without obligation.',
    actions: `<a class="btn btn-primary btn-lg" href="#book">${CTA} ${icon('arrow')}</a><a class="btn btn-quiet btn-lg" href="tel:${SITE.phone1tel}">${icon('phone')} ${SITE.phone1}</a>`,
  })}

<section class="sec" id="book">
  <div class="wrap contact-grid">
    <div class="book-wrap">
      ${bookingForm()}
    </div>
    <div class="contact-side">
      <dl class="contact-list">
        <div><dt>Phone</dt><dd><a href="tel:${SITE.phone1tel}">${SITE.phone1}</a><br><a href="tel:${SITE.phone2tel}">${SITE.phone2}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
        <div><dt>Office</dt><dd><address>${SITE.address}<br>${SITE.town}, London ${SITE.postcode}</address><a href="${SITE.maps}" target="_blank" rel="noopener">Open in Google Maps ${icon('arrowUpRight')}</a></dd></div>
        <div><dt>Hours</dt><dd>Monday to Friday, 9:00 to 17:30<br>Closed weekends. Email or the form outside these hours; we reply the next working morning.</dd></div>
      </dl>
      <div class="next">
        <h2 class="h-small">What happens next</h2>
        <ol>
          <li>We reply within one working day to arrange a call or meeting.</li>
          <li>We look at your records and what you need, and quote a fixed fee in writing.</li>
          <li>If you go ahead, we handle the handover from your current accountant.</li>
        </ol>
      </div>
    </div>
  </div>
</section>
`;
}

export { breadcrumbs };
