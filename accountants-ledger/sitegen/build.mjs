/* Generates the static HTML pages. Run from the 381-accountants-ledger folder:
     node sitegen/build.mjs
   The generated files are committed; nothing runs at deploy time. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { page, SITE, services } from './lib.mjs';
import {
  homeBody, servicesHubBody, servicePage, deadlinesBody,
  aboutBody, reviewsBody, contactBody,
} from './content-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const BUSINESS_LD = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: SITE.legal,
  alternateName: SITE.name,
  url: 'https://www.381accountants.com/',
  email: SITE.email,
  telephone: '+44 20 8214 1259',
  foundingDate: String(SITE.established),
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address,
    addressLocality: SITE.town,
    addressRegion: 'London',
    postalCode: SITE.postcode,
    addressCountry: 'GB',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:30',
  },
  areaServed: SITE.areas.map((name) => ({ '@type': 'Place', name })),
  /* Prices reach structured data only once the firm has confirmed them. */
  makesOffer: services.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: s.name },
    ...(s.fee.from == null ? {} : {
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: s.fee.from,
        priceCurrency: 'GBP',
        description: `From £${s.fee.from} ${s.fee.basis}`,
      },
    }),
  })),
};

const pages = [
  {
    path: 'index.html',
    title: '381 Accountants · Certified Accountants in Canary Wharf, London',
    desc: `Independent certified accountants at 30 Churchill Place, Canary Wharf, since ${SITE.established}. Bookkeeping, payroll, self assessment, VAT, annual accounts, company formation and tax planning, on fixed fees. Rated 5.0 from ${SITE.reviewCount} Google reviews.`,
    active: 'home',
    body: homeBody,
    jsonld: BUSINESS_LD,
  },
  {
    path: 'services/index.html',
    title: 'Services & Fees · 381 Accountants, Canary Wharf',
    desc: 'Seven accounting services from one team, each on a fixed fee agreed in writing: bookkeeping, payroll, self assessment, VAT returns, annual accounts, company formation and tax planning.',
    active: 'services',
    body: servicesHubBody,
  },
  {
    path: 'deadlines.html',
    title: 'Deadline Finder: Accounts, Corporation Tax & VAT Dates · 381 Accountants',
    desc: 'Enter your company year end and VAT quarters to see your Companies House accounts, corporation tax, CT600 and VAT deadlines, worked out using the standard rules.',
    active: 'deadlines',
    body: deadlinesBody,
  },
  {
    path: 'about.html',
    title: `About & Regulation · 381 Accountants · Independent Since ${SITE.established}`,
    desc: `The people behind 381 Accountants, who regulates the firm, and how we work. An independent firm of certified accountants in Canary Wharf since ${SITE.established}.`,
    active: 'about',
    body: aboutBody,
  },
  {
    path: 'reviews.html',
    title: `Client Reviews · 381 Accountants · 5.0 from ${SITE.reviewCount} Google Reviews`,
    desc: `Real Google reviews of 381 Accountants: ${SITE.reviewCount} reviews, all five stars, from clients of up to 25 years.`,
    active: 'reviews',
    body: reviewsBody,
  },
  {
    path: 'contact.html',
    title: 'Contact & Book a Free Consultation · 381 Accountants',
    desc: `Call ${SITE.phone1}, email ${SITE.email} or book a free consultation online. 30 Churchill Place, Canary Wharf, London ${SITE.postcode}. ${SITE.hours}.`,
    active: 'contact',
    body: contactBody,
    jsonld: BUSINESS_LD,
  },
  ...services.map((svc) => ({
    path: `services/${svc.slug}.html`,
    title: `${svc.name} · 381 Accountants, Canary Wharf`,
    desc: svc.short.replace(/<[^>]+>/g, ''),
    active: 'services',
    body: (path) => servicePage(svc, path),
  })),
];

for (const p of pages) {
  const html = page({
    path: p.path,
    title: p.title,
    desc: p.desc,
    active: p.active,
    body: p.body(p.path),
    jsonld: p.jsonld,
  });
  const out = join(root, p.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', p.path, `(${(html.length / 1024).toFixed(1)} kB)`);
}
console.log(`\n${pages.length} pages generated.`);
