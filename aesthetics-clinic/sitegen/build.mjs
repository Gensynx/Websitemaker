/* Generates the static HTML pages. Run from the aesthetics-clinic
   folder:  node sitegen/build.mjs
   The generated files are committed; nothing runs at deploy time. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { page, servicePage, coursePage } from './lib.mjs';
import { services } from './content-services.mjs';
import { courses } from './content-academy.mjs';
import {
  homeBody,
  servicesHubBody,
  academyHubBody,
  aboutBody,
  modelBody,
  contactBody,
} from './content-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const pages = [
  {
    path: 'index.html',
    html: page({
      path: 'index.html',
      title: 'Ivory Room Aesthetics · Doctor-Led Clinic & Training Academy, Marylebone W1',
      desc: 'Doctor-led medical aesthetics in Marylebone, London W1: anti-wrinkle, dermal fillers, laser, mesotherapy, IV drips and cupping, plus an accredited training academy.',
      active: 'home',
      body: homeBody(),
    }),
  },
  {
    path: 'services/index.html',
    html: page({
      path: 'services/index.html',
      title: 'Clinic Treatments · Ivory Room Aesthetics',
      desc: 'All treatments at Ivory Room Aesthetics, Marylebone W1: dermal fillers, anti-wrinkle injections, laser therapy, mesotherapy, IV drips and cupping therapy.',
      active: 'treatments',
      body: servicesHubBody(),
    }),
  },
  {
    path: 'academy/index.html',
    html: page({
      path: 'academy/index.html',
      title: 'Training Academy · Ivory Room Aesthetics',
      desc: 'Aesthetics training in London W1: CPD courses and regulated qualifications with live-model practice under the direct supervision of a registered doctor.',
      active: 'academy',
      body: academyHubBody(),
    }),
  },
  {
    path: 'about.html',
    html: page({
      path: 'about.html',
      title: 'About the Clinic · Ivory Room Aesthetics',
      desc: 'About Ivory Room Aesthetics: a doctor-led clinic and accredited training academy at 18 Linden Mews, Marylebone, led by Dr Clara Ashby.',
      active: 'about',
      body: aboutBody(),
    }),
  },
  {
    path: 'become-a-model.html',
    html: page({
      path: 'become-a-model.html',
      title: 'Become a Model · Ivory Room Aesthetics',
      desc: 'Volunteer as a treatment model at Ivory Room Aesthetics and receive discounted treatments performed by supervised students under a registered doctor.',
      active: 'model',
      body: modelBody(),
    }),
  },
  {
    path: 'contact.html',
    html: page({
      path: 'contact.html',
      title: 'Contact & Visit · Ivory Room Aesthetics',
      desc: 'Contact Ivory Room Aesthetics at 18 Linden Mews, London W1: treatment bookings, course enquiries and the model programme.',
      active: 'contact',
      body: contactBody(),
    }),
  },
  ...services.map((s) => ({ path: `services/${s.slug}.html`, html: servicePage(s) })),
  ...courses.map((c) => ({ path: `academy/${c.slug}.html`, html: coursePage(c) })),
];

for (const { path, html } of pages) {
  const out = join(root, path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', path, `${(html.length / 1024).toFixed(1)}kb`);
}
console.log(`\n${pages.length} pages generated.`);
