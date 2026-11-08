/* Generates the static HTML pages. Run from the accountants folder:
     node sitegen/build.mjs
   The generated files are committed; nothing runs at deploy time. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { page, SITE } from './lib.mjs';
import { services, servicesNav } from './content-services.mjs';
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
  url: 'https://www.example.com/',
  email: SITE.email,
  telephone: '+44 20 7946 0123',
  foundingDate: String(SITE.established),
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address,
    addressLocality: 'London',
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
  /* Prices are only published in structured data once the firm has
     confirmed them; placeholders never reach search engines. */
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
    title: 'Fenwick & Rowe · Certified Accountants & Bookkeeping in the City of London',
    desc: `Independent certified accountants at ${SITE.address}, London ${SITE.postcode}, serving all of London since ${SITE.established}. Bookkeeping, payroll, self assessment, VAT, annual accounts, company formation and tax planning. Rated 5.0 by clients. Free consultation.`,
    active: 'home',
    body: homeBody,
    jsonld: BUSINESS_LD,
  },
  {
    path: 'services/index.html',
    title: 'Our Services · Fenwick & Rowe, City of London',
    desc: 'All accounting services under one roof: bookkeeping, payroll, self assessment tax returns, VAT returns, annual accounts, company formation and tax planning. Starting fees for each, fixed and agreed up front, and a free consultation.',
    active: 'services',
    body: servicesHubBody,
  },
  {
    path: 'deadlines.html',
    title: 'Deadline Finder: Accounts, Corporation Tax & VAT Dates · Fenwick & Rowe',
    desc: 'Enter your company year end and VAT quarters to see your Companies House accounts, corporation tax, CT600 and VAT deadlines, worked out using the standard rules.',
    active: 'deadlines',
    body: deadlinesBody,
  },
  {
    path: 'about.html',
    title: `About Us · Fenwick & Rowe · Independent Certified Accountants Since ${SITE.established}`,
    desc: `The story of ${SITE.legal}: an independent firm of certified accountants in the City of London, serving London since ${SITE.established}, with cloud accounting on Sage & QuickBooks and a five star client rating.`,
    active: 'about',
    body: aboutBody,
  },
  {
    path: 'reviews.html',
    title: 'Client Reviews · Fenwick & Rowe · Rated 5.0 by Clients',
    desc: `Sample client reviews of Fenwick & Rowe: ${SITE.reviewCount} reviews, a 5.0 rating, five stars across the board. Fast response, professional team and value for money.`,
    active: 'reviews',
    body: reviewsBody,
  },
  {
    path: 'contact.html',
    title: 'Contact & Book a Free Consultation · Fenwick & Rowe, City of London',
    desc: `Contact Fenwick & Rowe: ${SITE.phone1} · ${SITE.email} · ${SITE.address}, London ${SITE.postcode}. Open ${SITE.hours}. Book your free consultation online.`,
    active: 'contact',
    body: contactBody,
    jsonld: BUSINESS_LD,
  },
  ...services.map((svc) => ({
    path: `services/${svc.slug}.html`,
    title: `${svc.name} · Fenwick & Rowe, City of London`,
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
    servicesNav,
    jsonld: p.jsonld,
  });
  const out = join(root, p.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', p.path, `(${(html.length / 1024).toFixed(1)} kB)`);
}
console.log(`\n${pages.length} pages generated.`);
