/* Generates the static HTML pages. Run from the 381-accountants folder:
     node sitegen/build.mjs
   The generated files are committed; nothing runs at deploy time. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { page, SITE } from './lib.mjs';
import { services, servicesNav } from './content-services.mjs';
import {
  homeBody, servicesHubBody, servicePage,
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
  makesOffer: services.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: s.name },
  })),
};

const pages = [
  {
    path: 'index.html',
    title: '381 Accountants · Certified Accountants & Bookkeeping in Barking, London',
    desc: 'Independent certified accountants in Barking serving all of London since 2010. Bookkeeping, payroll, self assessment, VAT, annual accounts, company formation and tax planning. Rated 5.0 on Google. Free consultation.',
    active: 'home',
    body: homeBody,
    jsonld: BUSINESS_LD,
  },
  {
    path: 'services/index.html',
    title: 'Our Services · 381 Accountants, Barking & London',
    desc: 'All accounting services under one roof: bookkeeping, payroll, self assessment tax returns, VAT returns, annual accounts, company formation and tax planning. Fixed fees, free consultation.',
    active: 'services',
    body: servicesHubBody,
  },
  {
    path: 'about.html',
    title: 'About Us · 381 Accountants · Independent Certified Accountants Since 2010',
    desc: 'The story of 381 Accountancy & Bookkeeping Services Ltd: an independent firm of certified accountants in Barking with 16+ years serving London, cloud accounting on Sage & QuickBooks, and a five-star Google rating.',
    active: 'about',
    body: aboutBody,
  },
  {
    path: 'reviews.html',
    title: 'Client Reviews · 381 Accountants · Rated 5.0 on Google',
    desc: 'Real Google reviews of 381 Accountants: five stars across the board, with clients praising professionalism, trustworthiness, responsiveness, accuracy and value for money.',
    active: 'reviews',
    body: reviewsBody,
  },
  {
    path: 'contact.html',
    title: 'Contact & Book a Free Consultation · 381 Accountants, Barking',
    desc: 'Contact 381 Accountants: 020 8214 1259 · info@381abs.com · Fortis House, 160 London Road, Barking IG11 8BB. Open Mon–Fri 9:00–17:30. Book your free consultation online.',
    active: 'contact',
    body: contactBody,
    jsonld: BUSINESS_LD,
  },
  ...services.map((svc) => ({
    path: `services/${svc.slug}.html`,
    title: `${svc.name} · 381 Accountants, Barking & London`,
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
