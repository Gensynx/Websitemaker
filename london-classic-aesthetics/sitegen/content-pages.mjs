/* Bespoke pages: home, hubs, about, become-a-model, contact. Original copy. */
import { SITE, icon, arrow, goArrow, heroInner, ctaBand, faqBlock } from './lib.mjs';
import { courses } from './content-academy.mjs';

const check = icon('check');
/* canonical course titles by slug, so the course list stores the same
   name no matter where a course was added from */
const courseTitle = Object.fromEntries(courses.map((c) => [c.slug, c.title]));

/* ------------------------------------------------------------- HOME */
export function homeBody() {
  const r = '';
  return `
    <section class="hero">
      <div class="hero-art" aria-hidden="true">
        <div class="bloom" style="width:52rem;height:52rem;top:-20rem;right:-16rem;background:radial-gradient(circle, rgba(203,170,94,.34), transparent 65%)"></div>
        <div class="bloom b2" style="width:38rem;height:38rem;top:30%;left:-18rem;background:radial-gradient(circle, rgba(169,133,59,.20), transparent 65%)"></div>
        <div class="bloom b3" style="width:30rem;height:30rem;bottom:-14rem;right:22%;background:radial-gradient(circle, rgba(216,199,158,.4), transparent 65%)"></div>
      </div>
      <div class="wrap">
        <p class="kicker" data-hero>Marylebone · London W1</p>
        <h1 class="hero-title mt-2" data-hero style="--d:120ms">Doctor-led aesthetics,<br><span class="gold-line">practised classically.</span></h1>
        <p class="lede" data-hero style="--d:240ms">Anti-wrinkle treatments, dermal fillers, laser and skin therapies at 157 Seymour Place, under the care of Dr Hina, in a clinic that also trains the next generation of practitioners.</p>
        <div class="cta-row" data-hero style="--d:360ms">
          <a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book a consultation ${arrow}</a>
          <a class="btn btn-line" href="services/index.html">Explore treatments</a>
        </div>
        <div class="hero-meta" data-hero style="--d:460ms">
          <span>${icon('shield')} Doctor-led clinic</span>
          <span>${icon('rosette')} CPD-accredited academy</span>
          <span>${icon('check')} MHRA &amp; FDA approved products</span>
          <span>${icon('pin')} 5 min from ${SITE.station}</span>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <span>Doctor-led treatments</span>
        <span>CPD certified provider</span>
        <span>QUALIFI Levels 4 · 5 · 7</span>
        <span>ProQual Level 3</span>
        <span>OFQUAL-regulated diploma route</span>
        <span>MHRA &amp; FDA approved products</span>
        <span>English · Russian · Urdu · Hindi spoken</span>
      </div>
    </div>

    <section class="section">
      <div class="wrap feature-row">
        <div class="art" style="aspect-ratio:4/5;--art-tint:rgba(169,133,59,.28)" data-img="images/clinic.jpg" data-alt="Inside the London Classic Aesthetics clinic" data-reveal="left">
          <div class="art-mark">${icon('diamond')}</div>
        </div>
        <div>
          <p class="kicker" data-reveal>The clinic</p>
          <h2 class="mt-2" data-reveal style="--d:80ms">A clinic first.<br>The look follows.</h2>
          <p data-reveal style="--d:160ms">Aesthetics has a shortcut problem. Ours is the long way round: a medical consultation before any treatment, products approved by the MHRA and FDA, honest advice that sometimes means recommending less, and a doctor’s judgement behind every plan.</p>
          <p data-reveal style="--d:220ms">That discipline is why clients stay, and why other practitioners come here to train.</p>
          <ul class="checks mt-3" data-reveal style="--d:280ms">
            <li>${check}<span><strong>Consultation before commitment,</strong> every time, with honest suitability advice</span></li>
            <li>${check}<span><strong>Doctor-led care</strong> under Dr Hina, with proper screening and aftercare</span></li>
            <li>${check}<span><strong>Four languages spoken:</strong> English, Russian, Urdu and Hindi</span></li>
          </ul>
          <a class="link-more mt-3" href="about.html" data-reveal style="--d:340ms"><span>About the clinic</span> ${icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="section band-sand">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker" data-reveal>Treatments</p>
          <h2 data-reveal style="--d:80ms">Chosen for you, not for the menu.</h2>
          <p class="lede" data-reveal style="--d:160ms">Six core treatment families, each performed with medical oversight. Start where your concern is, and we will tell you honestly what belongs in your plan.</p>
        </div>
        <div class="grid grid-3">
          ${[
            ['services/dermal-fillers.html', 'droplet', 'rgba(176,116,92,.34)', 'dermal-fillers', 'Injectables', 'Dermal Fillers', 'Volume, contour and balance with MHRA-approved hyaluronic acid, dosed for faces rather than trends.'],
            ['services/anti-wrinkle.html', 'syringe', 'rgba(148,136,112,.32)', 'anti-wrinkle', 'Injectables', 'Anti-Wrinkle Injections', 'Prescription-only botulinum toxin, prescribed by a doctor after examining how your face moves.'],
            ['services/laser-therapy.html', 'beam', 'rgba(196,138,58,.34)', 'laser-therapy', 'Skin', 'Laser Therapy', 'Light-based renewal for tone, texture, pigment and unwanted hair, patch-tested and planned as a course.'],
            ['services/mesotherapy.html', 'face', 'rgba(146,142,84,.30)', 'mesotherapy', 'Skin & Hair', 'Mesotherapy', 'Micro-injected vitamins and hyaluronic acid for skin quality and early hair thinning.'],
            ['services/iv-drips.html', 'drip', 'rgba(180,150,90,.34)', 'iv-drips', 'Wellness', 'IV Drip Therapy', 'Screened, clinician-administered vitamin infusions: immunity, energy, skin and recovery blends.'],
            ['services/cupping-therapy.html', 'cup', 'rgba(150,90,50,.32)', 'cupping-therapy', 'Traditional', 'Cupping Therapy', 'Dry and wet cupping (hijama) with sterile single-use equipment and clinical aftercare.'],
          ]
            .map(
              ([href, ic, tint, img, tag, name, desc], i) => `
          <a class="tcard" href="${href}" data-reveal style="--d:${(i % 3) * 100}ms">
            <div class="art" style="--art-tint:${tint}" data-img="images/${img}.jpg" data-alt="${name} at London Classic Aesthetics">
              <div class="art-mark">${icon(ic)}</div>
            </div>
            <div class="tcard-body">
              <span class="tcard-tag">${tag}</span>
              <h3>${name}</h3>
              <p>${desc}</p>
              <span class="link-more"><span>Read more</span> ${icon('arrow')}</span>
            </div>
          </a>`
            )
            .join('')}
        </div>
        <p class="small muted mt-3" data-reveal>Also available in clinic: skin boosters, PDO threads, PRP therapy, fat dissolving and microneedling. <a class="gold" href="services/index.html">See the full treatment list</a>.</p>
      </div>
    </section>

    <section class="section band-night">
      <div class="wrap feature-row flip">
        <div class="art" style="aspect-ratio:4/5;--art-tint:rgba(203,170,94,.35)" data-img="images/academy.jpg" data-alt="Training at the LCA Academy" data-reveal="right">
          <div class="art-mark">${icon('cap')}</div>
        </div>
        <div>
          <p class="kicker" data-reveal>The Academy</p>
          <h2 class="mt-2" data-reveal style="--d:80ms">Where practitioners are made, not just certified.</h2>
          <p data-reveal style="--d:160ms">The same clinic that treats clients trains practitioners: twelve courses from foundation fillers and phlebotomy to regulated Level 3 qualifications, with hands-on practice on live models under the direct supervision of a registered doctor.</p>
          <ul class="checks mt-3" data-reveal style="--d:240ms">
            <li>${check}<span><strong>CPD-accredited courses</strong> and OFQUAL-regulated and QUALIFI routes to Level 7</span></li>
            <li>${check}<span><strong>Real clinic, real models,</strong> not classrooms pretending to be clinics</span></li>
            <li>${check}<span><strong>Progression mapped honestly,</strong> from first course to advanced practice</span></li>
          </ul>
          <div class="cta-row mt-3" data-reveal style="--d:320ms">
            <a class="btn btn-line" href="academy/index.html">Explore the Academy ${arrow}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap feature-row">
        <div class="art" style="aspect-ratio:4/5;--art-tint:rgba(176,116,92,.3)" data-img="images/dr-hina.jpg" data-alt="Dr Hina, lead practitioner at London Classic Aesthetics" data-reveal="left">
          <div class="art-mark">${icon('shield')}</div>
        </div>
        <div>
          <p class="kicker" data-reveal>Your practitioner</p>
          <h2 class="mt-2" data-reveal style="--d:80ms">Treated by Dr Hina.</h2>
          <p data-reveal style="--d:160ms">Aesthetic treatments at LCA are carried out under the care of Dr Hina, a practitioner with a strong medical background and broad experience across medical aesthetics. Her rule is simple and slightly unfashionable: the treatment has to be right for the face in front of her, or it does not happen.</p>
          <p data-reveal style="--d:220ms">Consultations are unhurried, questions are welcome, and “no, I would not recommend that” remains part of the service.</p>
          <a class="link-more mt-3" href="about.html" data-reveal style="--d:280ms"><span>Meet the clinic</span> ${icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="section-sm band-deep">
      <div class="wrap" style="display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:clamp(2rem,5vw,4rem);align-items:center" data-reveal>
        <div>
          <p class="kicker">Become a model</p>
          <h2 class="mt-2" style="font-size:clamp(1.7rem,3vw,2.4rem)">Discounted treatments. Supervised students. Fair trade.</h2>
          <p class="mt-2 muted">Our trainees perfect their technique on volunteer models under direct doctor supervision, and models receive treatments at a substantial discount. Everyone leaves better off.</p>
        </div>
        <div class="cta-row" style="justify-content:flex-end">
          <a class="btn" href="become-a-model.html">How it works ${arrow}</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker" data-reveal>Visit</p>
          <h2 data-reveal style="--d:80ms">Seymour Place, W1.</h2>
        </div>
        <div class="cred-band" data-reveal>
          <div>
            ${icon('pin')}
            <div class="cred-title">157 Seymour Place</div>
            <p>London W1H 4PQ, in Marylebone: five minutes on foot from ${SITE.station} station.</p>
          </div>
          <div>
            ${icon('clock')}
            <div class="cred-title">By appointment</div>
            <p>Book online any time on Fresha or Treatwell, or write to us for a consultation slot that suits you.</p>
          </div>
          <div>
            ${icon('mail')}
            <div class="cred-title">Talk to us first</div>
            <p><a class="gold" href="mailto:${SITE.email}">${SITE.email}</a> reaches the clinic directly, and we reply personally.</p>
          </div>
          <div>
            ${icon('lang')}
            <div class="cred-title">Four languages</div>
            <p>Consultations are comfortable in English, Russian, Urdu and Hindi.</p>
          </div>
        </div>
      </div>
    </section>

${ctaBand(r, {
    title: 'Begin with a conversation, not a needle.',
    lede: 'Book a consultation at Seymour Place. You will leave with an honest plan, whether or not it involves a treatment.',
    primary: `<a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="contact.html">Make an enquiry</a>`,
  })}`;
}

/* ---------------------------------------------------- SERVICES HUB */
export function servicesHubBody() {
  const r = '../'; /* page lives at services/index.html */
  const rows = [
    ['services/dermal-fillers.html', 'droplet', 'rgba(176,116,92,.34)', 'dermal-fillers', 'Injectables', 'Dermal Fillers', 'Hyaluronic acid, placed by a doctor, in doses your face can carry: lips, cheeks, jawline, chin, nose and tear troughs.', ['Restores lost volume and definition', 'Balances long-noticed asymmetries', 'Reversible where it matters']],
    ['services/anti-wrinkle.html', 'syringe', 'rgba(148,136,112,.32)', 'anti-wrinkle', 'Injectables', 'Anti-Wrinkle Injections', 'Prescription-only botulinum toxin for frown lines, forehead lines and crow’s feet: softer lines, kept expression.', ['Prescribed after a face-to-face medical consultation', 'Measured dosing that preserves movement', 'Reviewed and refined at two weeks']],
    ['services/laser-therapy.html', 'beam', 'rgba(196,138,58,.34)', 'laser-therapy', 'Skin', 'Laser Therapy', 'Controlled light for tone, texture, pigmentation and unwanted hair, always patch-tested, always planned as a course.', ['Reaches what skincare cannot', 'Settings matched to your skin type', 'Cumulative, natural-looking results']],
    ['services/mesotherapy.html', 'face', 'rgba(146,142,84,.30)', 'mesotherapy', 'Skin & Hair', 'Mesotherapy', 'Micro-injections of vitamins, minerals and hyaluronic acid for skin that looks rested and follicles that need support.', ['Deep hydration and lasting glow', 'Scalp programmes for early thinning', 'Gentle, cumulative, no-drama']],
    ['services/iv-drips.html', 'drip', 'rgba(180,150,90,.34)', 'iv-drips', 'Wellness', 'IV Drip Therapy', 'Vitamin infusions administered by trained clinicians: multivitamin, immunity, detox, biotin, B-complex and skin-brightening blends.', ['Medical screening before every drip', 'Clinical technique, calm setting', 'Honest claims, no miracle promises']],
    ['services/cupping-therapy.html', 'cup', 'rgba(150,90,50,.32)', 'cupping-therapy', 'Traditional', 'Cupping Therapy', 'Dry and wet cupping (hijama) for tension, circulation and recovery, practised with sterile single-use equipment.', ['Ancient practice, modern hygiene', 'Dry and traditional wet methods', 'Screened and clinically aftercared']],
  ];
  return `
${heroInner(r, {
    kicker: 'Clinic Services',
    title: 'Treatments, practised properly.',
    lede: 'Every treatment below is delivered in a doctor-led clinic with MHRA and FDA approved products, and every one of them begins with a consultation. That is not a formality; it is the treatment plan.',
    meta: `<span>${icon('shield')} Doctor-led</span><span>${icon('check')} Consultation first</span><span>${icon('pin')} Seymour Place, W1</span>`,
  })}

    <section class="section">
      <div class="wrap">
        ${rows
          .map(
            ([href, ic, tint, img, tag, name, desc, checks], i) => `
        <div class="feature-row${i % 2 ? ' flip' : ''}">
          <div class="art" data-img="images/${img}.jpg" data-alt="${name} at London Classic Aesthetics" style="--art-tint:${tint}" data-reveal="${i % 2 ? 'right' : 'left'}">
            <div class="art-mark">${icon(ic)}</div>
          </div>
          <div>
            <p class="kicker" data-reveal>${tag}</p>
            <h3 class="serif" data-reveal style="--d:60ms">${name}</h3>
            <p data-reveal style="--d:120ms">${desc}</p>
            <ul class="checks mt-2" data-reveal style="--d:180ms">
              ${checks.map((c) => `<li>${check}<span>${c}</span></li>`).join('')}
            </ul>
            <a class="link-more mt-3" href="${r}${href}" data-reveal style="--d:240ms"><span>Explore ${name.toLowerCase()}</span> ${icon('arrow')}</a>
          </div>
        </div>`
          )
          .join('\n')}
      </div>
    </section>

    <section class="section band-sand">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker" data-reveal>Also in clinic</p>
          <h2 data-reveal style="--d:80ms">Beyond the six.</h2>
          <p class="lede" data-reveal style="--d:160ms">These treatments are also performed at Seymour Place. Ask about any of them at your consultation, or book directly online.</p>
        </div>
        <ul class="index-list" data-reveal>
          ${[
            ['Skin Boosters', 'Injectable hyaluronic hydration for deep, lasting skin quality'],
            ['PDO Threads', 'The non-surgical lift: repositioning and collagen stimulation'],
            ['PRP Therapy', 'Regenerative treatment for skin and hair using your own plasma'],
            ['Fat Dissolving', 'Targeted injectable treatment for stubborn small areas such as the chin'],
            ['Microneedling', 'Collagen induction for texture, scars and overall skin quality'],
          ]
            .map(
              ([name, desc], i) => `
          <li><a class="index-row" href="${SITE.fresha}" target="_blank" rel="noopener">
            <span class="idx">${['I', 'II', 'III', 'IV', 'V'][i]}</span>
            <span class="name">${name}</span>
            <span class="desc">${desc}</span>
            ${goArrow}
          </a></li>`
            )
            .join('')}
        </ul>
        <p class="small muted mt-3" data-reveal>Availability and live pricing for all treatments are listed on <a class="gold" href="${SITE.fresha}" target="_blank" rel="noopener">Fresha</a> and <a class="gold" href="${SITE.treatwell}" target="_blank" rel="noopener">Treatwell</a>.</p>
      </div>
    </section>

${ctaBand(r, {
    title: 'Not sure which treatment is yours?',
    lede: 'That is precisely what consultations are for. Describe what bothers you; we will map the honest options, including the ones we would not recommend.',
    primary: `<a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book a consultation ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="${r}contact.html">Ask us first</a>`,
  })}`;
}

/* ----------------------------------------------------- ACADEMY HUB */
export function academyHubBody() {
  const r = '../'; /* page lives at academy/index.html */
  const cpd = [
    ['academy/dermal-filler-foundation.html', 'Dermal Filler Foundation', 'Your entry into injectables, supervised by a doctor'],
    ['academy/advanced-dermal-filler.html', 'Advanced Dermal Filler', 'Cheeks, jaw, chin, tear trough and non-surgical rhinoplasty'],
    ['academy/skin-booster.html', 'Skin Boosters', 'The injectable hydration treatment clients ask for by name'],
    ['academy/pdo-threads.html', 'PDO Threads', 'Thread lifting: vectors, placement and judgement'],
    ['academy/mesotherapy-course.html', 'Mesotherapy', 'Micro-injection therapy for skin quality and hair'],
    ['academy/prp.html', 'Platelet-Rich Plasma', 'Draw, spin, prepare, treat: the full regenerative workflow'],
    ['academy/iv-therapy.html', 'IV Therapy', 'Cannulation and infusion protocols for the wellness sector'],
    ['academy/phlebotomy.html', 'Phlebotomy', 'The foundational clinical skill of drawing blood'],
    ['academy/chemical-peel.html', 'Chemical Peels', 'Acids, depths and the judgement to match them'],
    ['academy/anatomy-physiology.html', 'Anatomy & Physiology', 'The theory underneath every safe treatment'],
  ];
  return `
${heroInner(r, {
    kicker: 'The Training Academy',
    title: 'Train inside a working clinic.',
    lede: 'Twelve courses, one standard: theory taught properly, then hands-on practice on live models under the direct supervision of a registered doctor, in the same Marylebone rooms where clients are treated.',
    meta: `<span>${icon('rosette')} CPD certified provider</span><span>${icon('cap')} QUALIFI Levels 4 · 5 · 7</span><span>${icon('check')} OFQUAL-regulated route</span>`,
  })}

    <section class="section">
      <div class="wrap feature-row">
        <div class="art" style="aspect-ratio:4/5;--art-tint:rgba(203,170,94,.32)" data-img="images/academy-training.jpg" data-alt="Hands-on training at the LCA Academy" data-reveal="left">
          <div class="art-mark">${icon('cap')}</div>
        </div>
        <div>
          <p class="kicker" data-reveal>Why train here</p>
          <h2 class="mt-2" data-reveal style="--d:80ms">Supervision worth the name.</h2>
          <p data-reveal style="--d:160ms">Plenty of academies rent a room and a mannequin. LCA trains you inside a registered, working clinic: live models, real client flow, and a registered doctor directly supervising your hands-on practice, correcting technique the moment it needs correcting.</p>
          <ul class="checks mt-3" data-reveal style="--d:240ms">
            <li>${check}<span><strong>Live models provided,</strong> so you practise on people, not props</span></li>
            <li>${check}<span><strong>Direct doctor supervision</strong> during every practical session</span></li>
            <li>${check}<span><strong>Recognised certification:</strong> CPD courses plus regulated ProQual, OFQUAL and QUALIFI routes</span></li>
            <li>${check}<span><strong>A certificate built to travel,</strong> designed for recognition across European countries</span></li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section band-sand">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker" data-reveal>CPD Courses</p>
          <h2 data-reveal style="--d:80ms">Ten skills. One discipline.</h2>
          <p class="lede" data-reveal style="--d:160ms">Hands-on treatment courses, each pairing structured theory with supervised live-model practice. Start where your ambition points.</p>
        </div>
        <ul class="index-list" data-reveal>
          ${cpd
            .map(
              ([href, name, desc], i) => `
          <li class="index-li"><a class="index-row" href="${r}${href}">
            <span class="idx">${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i]}</span>
            <span class="name">${name}</span>
            <span class="desc">${desc}</span>
            ${goArrow}
          </a><button class="row-add" type="button" data-course-add data-slug="${href.replace('academy/', '').replace('.html', '')}" data-name="${courseTitle[href.replace('academy/', '').replace('.html', '')] || name}" data-tag="CPD Course" aria-pressed="false" aria-label="Add ${name} to your course list">${icon('plus')}</button></li>`
            )
            .join('')}
        </ul>
        <p class="small muted mt-3" data-reveal>Collecting more than one skill? Use the <strong>+</strong> buttons to build your course list as you browse; a floating <em>My courses</em> button follows you, and a single enquiry covers everything on it.</p>
      </div>
    </section>

    <section class="section band-night">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker" data-reveal>Regulated Qualifications</p>
          <h2 data-reveal style="--d:80ms">Certificates that sit on the national framework.</h2>
          <p class="lede" data-reveal style="--d:160ms">For recognition that insurers and advanced training providers ask for by name, choose the regulated routes: delivered by LCA as a registered clinic and training academy, with progression available to QUALIFI Levels 4, 5 and 7.</p>
        </div>
        <div class="grid grid-2">
          <a class="tcard" href="${r}academy/ofqual-level-3-diploma.html" data-reveal style="background:var(--night-2);border-color:var(--line-night)">
            <div class="tcard-body">
              <span class="tcard-tag" style="color:var(--gold-bright)">OFQUAL-regulated</span>
              <h3 style="color:var(--paper-on-night)">Level 3 Diploma + CPD Courses</h3>
              <p style="color:var(--soft-on-night)">The combined route: nationally regulated status and hands-on treatment skills in one designed programme.</p>
              <span class="link-more"><span>Explore the route</span> ${icon('arrow')}</span>
            </div>
          </a>
          <a class="tcard" href="${r}academy/facial-electrotherapy.html" data-reveal style="--d:100ms;background:var(--night-2);border-color:var(--line-night)">
            <div class="tcard-body">
              <span class="tcard-tag" style="color:var(--gold-bright)">ProQual Level 3</span>
              <h3 style="color:var(--paper-on-night)">Certificate in Facial Electrotherapy</h3>
              <p style="color:var(--soft-on-night)">The regulated machine-facial qualification that unlocks advanced aesthetic study.</p>
              <span class="link-more"><span>Explore the qualification</span> ${icon('arrow')}</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap wrap-narrow">
        <div class="section-head centered">
          <p class="kicker" data-reveal>Enrolment</p>
          <h2 data-reveal style="--d:80ms">From enquiry to certificate.</h2>
        </div>
        <ol class="steps" data-reveal>
          <li><div><h4>Tell us where you are heading</h4><p>Write with your background and the course or career you have in mind. Real people read it, and reply personally.</p></div></li>
          <li><div><h4>Get an honest route map</h4><p>We confirm suitability and sequence: which course first, what it leads to, and what we would genuinely recommend, even when that is a smaller start.</p></div></li>
          <li><div><h4>Train, supervised</h4><p>Theory taught for understanding, then live-model practice in the clinic under direct doctor supervision.</p></div></li>
          <li><div><h4>Certify and progress</h4><p>Leave with your certificate and a mapped next step, from CPD skills to regulated Levels 3 through 7.</p></div></li>
        </ol>
        <div class="cta-row mt-4" style="justify-content:center" data-reveal>
          <a class="btn btn-gold" href="${r}contact.html">Start your enquiry ${arrow}</a>
        </div>
      </div>
    </section>

${ctaBand(r, {
    title: 'Careers begin with supervision.',
    lede: 'Tell the Academy where you want your practice to go, and we will map the honest route from where you stand today.',
    primary: `<a class="btn btn-gold" href="${r}contact.html">Enquire now ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="${r}become-a-model.html">Or volunteer as a model</a>`,
    note: `Or write directly to <a href="mailto:${SITE.email}">${SITE.email}</a> with the course name in the subject line.`,
  })}`;
}

/* ------------------------------------------------------------ ABOUT */
export function aboutBody() {
  const r = '';
  return `
${heroInner(r, {
    kicker: 'About the clinic',
    title: 'The long way round is the whole point.',
    lede: 'London Classic Aesthetics exists for people who want their face treated with medical seriousness and their questions answered without a sales script.',
  })}

    <section class="section">
      <div class="wrap feature-row">
        <div class="art" style="aspect-ratio:4/5;--art-tint:rgba(176,116,92,.3)" data-img="images/dr-hina.jpg" data-alt="Dr Hina, lead practitioner at London Classic Aesthetics" data-reveal="left">
          <div class="art-mark">${icon('shield')}</div>
        </div>
        <div>
          <p class="kicker" data-reveal>Led by</p>
          <h2 class="mt-2" data-reveal style="--d:80ms">Dr Hina.</h2>
          <p data-reveal style="--d:160ms">Aesthetic treatments at LCA are carried out under the care of Dr Hina, a practitioner with a strong medical background and broad, hands-on experience across medical aesthetics. She built the clinic around a conviction the industry too often skips: that aesthetics is medicine practised on well people, and deserves the same seriousness.</p>
          <p data-reveal style="--d:220ms">In practice that means face-to-face consultations before any treatment, prescribing done properly, doses that respect anatomy, and a genuine willingness to say “not yet” or “not this”.</p>
          <p data-reveal style="--d:280ms">It also means teaching. Dr Hina supervises the Academy’s practical training directly, which keeps the clinic’s standards circulating into the next generation of practitioners.</p>
        </div>
      </div>
    </section>

    <section class="section band-sand">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker" data-reveal>Standards</p>
          <h2 data-reveal style="--d:80ms">What we will not compromise.</h2>
        </div>
        <div class="cred-band" data-reveal>
          <div>
            ${icon('shield')}
            <div class="cred-title">Consultation first</div>
            <p>No injectable is placed on a first meeting’s impulse. Assessment, honest advice, then treatment, in that order, every time.</p>
          </div>
          <div>
            ${icon('check')}
            <div class="cred-title">Approved products only</div>
            <p>MHRA and FDA approved products from reputable pharmaceutical suppliers. Nothing grey-market, ever.</p>
          </div>
          <div>
            ${icon('rosette')}
            <div class="cred-title">Recognised training</div>
            <p>A CPD certified provider delivering regulated routes: ProQual, OFQUAL-regulated study and QUALIFI Levels 4, 5 and 7.</p>
          </div>
          <div>
            ${icon('lang')}
            <div class="cred-title">Care in your language</div>
            <p>Consultations run comfortably in English, Russian, Urdu and Hindi, because informed consent should never be lost in translation.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap feature-row flip">
        <div class="art" style="aspect-ratio:4/5;--art-tint:rgba(203,170,94,.32)" data-img="images/clinic-interior.jpg" data-alt="Inside the clinic at 157 Seymour Place" data-reveal="right">
          <div class="art-mark">${icon('pin')}</div>
        </div>
        <div>
          <p class="kicker" data-reveal>The place</p>
          <h2 class="mt-2" data-reveal style="--d:80ms">A quiet street in Marylebone.</h2>
          <p data-reveal style="--d:160ms">You will find us at 157 Seymour Place, London W1H 4PQ: five minutes on foot from ${SITE.station} station, close enough to Marble Arch to walk off a consultation in Hyde Park.</p>
          <p data-reveal style="--d:220ms">The clinic doubles as the Academy’s training floor, so the rooms you are treated in are the rooms where treatment is taught. We think that transparency keeps everyone honest.</p>
          <ul class="checks mt-3" data-reveal style="--d:280ms">
            <li>${check}<span><strong>Appointments</strong> bookable online on Fresha and Treatwell</span></li>
            <li>${check}<span><strong>Enquiries</strong> answered personally at ${SITE.email}</span></li>
          </ul>
          <div class="cta-row mt-3" data-reveal style="--d:340ms">
            <a class="btn" href="contact.html">Visit or contact us ${arrow}</a>
          </div>
        </div>
      </div>
    </section>

${ctaBand(r, {
    title: 'Come and ask us anything.',
    lede: 'The consultation is the treatment plan. Book yours, bring every question you have, and expect straight answers.',
    primary: `<a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="services/index.html">Browse treatments</a>`,
  })}`;
}

/* --------------------------------------------------------- MODEL */
export function modelBody() {
  const r = '';
  return `
${heroInner(r, {
    kicker: 'Become a Model',
    title: 'Help someone learn.<br>Pay a fraction for it.',
    lede: 'Academy students perfect their technique on volunteer models under the direct supervision of a registered doctor, and models receive their treatments at a substantial discount. It is a fair trade, done safely.',
  })}

    <section class="section">
      <div class="wrap detail-layout">
        <article class="prose">
          <h2 data-reveal><span class="roman">I</span>How it works</h2>
          <p data-reveal>Training in aesthetics is only honest when it happens on real people, which is where you come in. As a model, you receive a genuine treatment, dermal fillers, anti-wrinkle injections, skin boosters and more, performed by a supervised student rather than the lead practitioner, at a substantially reduced price.</p>
          <p data-reveal>“Supervised” is the load-bearing word. A registered doctor is present and directing throughout: your suitability is assessed exactly as it would be for a full-price client, the plan is approved before a needle is lifted, and the supervisor steps in at any point it serves your result.</p>

          <h2 data-reveal><span class="roman">II</span>What you should expect</h2>
          <ul class="checks mt-2" data-reveal>
            <li>${check}<span><strong>A real consultation first.</strong> Screening and consent are identical to clinic standard, and unsuitable treatments are declined, model or not.</span></li>
            <li>${check}<span><strong>More time than a normal appointment.</strong> Teaching happens around your treatment, so bring patience and enjoy the attention to detail.</span></li>
            <li>${check}<span><strong>Doctor supervision throughout.</strong> Students practise; the doctor safeguards.</span></li>
            <li>${check}<span><strong>The same aftercare.</strong> Written guidance and a direct line back to the clinic, exactly as any client receives.</span></li>
            <li>${check}<span><strong>Honest limits.</strong> Model sessions run when courses run, so dates are offered around the training calendar rather than on demand.</span></li>
          </ul>

          <h2 data-reveal><span class="roman">III</span>Questions, answered</h2>
          ${faqBlock([
            ['Is it safe to be treated by a student?', 'You are treated by a student whose every step is directed by a registered doctor in the room. Screening, products and protocols are identical to clinic standard; the pace is simply more deliberate.'],
            ['Which treatments need models?', 'It follows the course calendar: dermal fillers, anti-wrinkle, skin boosters, mesotherapy, PDO threads and PRP most commonly. Tell us what interests you and we will match you to upcoming sessions.'],
            ['How big is the discount?', 'Substantial, and it varies by treatment and course. Exact model pricing is confirmed when we offer you a date, before you commit to anything.'],
            ['Can anyone volunteer?', 'Over-18s who pass the same medical screening as any client. Suitability rules are not relaxed for models, which is precisely why the programme is safe.'],
            ['How do I join?', 'Email or use the contact form, tell us which treatments interest you, and we will add you to the model list and contact you when a matching session is scheduled.'],
          ])}
        </article>

        <aside class="side-rail" data-reveal="right">
          <div class="rail-card">
            <h4>At a glance</h4>
            <dl>
              <div><dt>You receive</dt><dd>Real treatments at a substantial discount</dd></div>
              <div><dt>Performed by</dt><dd>Academy students, directly supervised by a registered doctor</dd></div>
              <div><dt>Screening</dt><dd>Full clinic-standard consultation and consent</dd></div>
              <div><dt>Eligibility</dt><dd>Over-18s who pass medical screening</dd></div>
              <div><dt>Where</dt><dd>157 Seymour Place, London W1</dd></div>
            </dl>
            <a class="btn btn-gold" href="contact.html">Join the model list ${arrow}</a>
            <p class="rail-note">Or email ${SITE.email} with “Model” in the subject line.</p>
          </div>
        </aside>
      </div>
    </section>

${ctaBand(r, {
    title: 'Fair trade, clinically supervised.',
    lede: 'Join the model list and be first to hear when a session matching your treatment interest is scheduled.',
    primary: `<a class="btn btn-gold" href="contact.html">Register your interest ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="academy/index.html">See what students learn</a>`,
  })}`;
}

/* -------------------------------------------------------- CONTACT */
export function contactBody() {
  const r = '';
  return `
${heroInner(r, {
    kicker: 'Contact',
    title: 'Talk to the clinic.',
    lede: 'Booking, treatment questions, course enquiries or the model list: one address reaches us all, and a real person replies.',
  })}

    <section class="section" style="padding-top:clamp(2.5rem,5vw,4rem)">
      <div class="wrap detail-layout">
        <div>
          <form data-demo novalidate>
            <div class="form-grid">
              <div class="field">
                <label for="f-name">Name <span class="req">*</span></label>
                <input id="f-name" name="name" type="text" autocomplete="name" required>
              </div>
              <div class="field">
                <label for="f-email">Email <span class="req">*</span></label>
                <input id="f-email" name="email" type="email" autocomplete="email" required>
              </div>
              <div class="field">
                <label for="f-phone">Phone</label>
                <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">
              </div>
              <div class="field">
                <label for="f-topic">I am asking about <span class="req">*</span></label>
                <select id="f-topic" name="topic" required>
                  <option value="">Choose one</option>
                  <option>A treatment</option>
                  <option>A training course</option>
                  <option>Becoming a model</option>
                  <option>Something else</option>
                </select>
              </div>
              <div class="field full" id="course-summary" hidden>
                <label>Courses on your list</label>
                <div class="course-chips" id="course-chips"></div>
                <p class="hint">These are included with your enquiry automatically. Remove any you have changed your mind about.</p>
              </div>
              <div class="field full">
                <label for="f-msg">Your message <span class="req">*</span></label>
                <textarea id="f-msg" name="message" required></textarea>
                <p class="hint">Tell us what you are hoping for; honest detail gets honest advice.</p>
              </div>
            </div>
            <div class="cta-row mt-3">
              <button class="btn btn-gold" type="submit">Send enquiry ${arrow}</button>
              <a class="btn btn-line" href="mailto:${SITE.email}" data-mailto-courses>Or email us directly</a>
            </div>
            <p class="form-status" role="status" aria-live="polite" tabindex="-1"></p>
          </form>
        </div>

        <aside class="side-rail">
          <div class="rail-card">
            <h4>The clinic</h4>
            <dl>
              <div><dt>Address</dt><dd>157 Seymour Place<br>London W1H 4PQ</dd></div>
              <div><dt>Nearest station</dt><dd>${SITE.station}, five minutes on foot; Marble Arch and Baker Street within a stroll</dd></div>
              <div><dt>Email</dt><dd><a class="gold" href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
              <div><dt>Hours</dt><dd>By appointment; book online any time</dd></div>
              <div><dt>Languages</dt><dd>English, Russian, Urdu, Hindi</dd></div>
            </dl>
          </div>
          <div class="rail-card" style="background:var(--paper)">
            <h4>Book instantly</h4>
            <p class="small muted">Live availability and pricing sit on our booking partners, day and night.</p>
            <div style="display:grid;gap:.7rem;margin-top:1.1rem">
              <a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha ${arrow}</a>
              <a class="btn btn-line" href="${SITE.treatwell}" target="_blank" rel="noopener">Book on Treatwell</a>
            </div>
          </div>
        </aside>
      </div>
    </section>

${ctaBand(r, {
    title: 'Or skip the form entirely.',
    lede: 'Appointments live online around the clock; consultations are the right first step for anything medical.',
    primary: `<a class="btn btn-gold" href="${SITE.fresha}" target="_blank" rel="noopener">Book on Fresha ${arrow}</a>`,
    secondary: `<a class="btn btn-line" href="services/index.html">Browse treatments first</a>`,
    note: `Follow the clinic on <a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a> and <a href="${SITE.facebook}" target="_blank" rel="noopener">Facebook</a>.`,
  })}`;
}
