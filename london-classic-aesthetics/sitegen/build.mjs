/* Generates the static HTML pages. Run from the london-classic-aesthetics
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
      title: 'London Classic Aesthetics · Doctor-Led Clinic & Training Academy, Marylebone W1',
      desc: 'Doctor-led medical aesthetics in Marylebone, London W1: anti-wrinkle, dermal fillers, laser, mesotherapy, IV drips and cupping, plus an accredited training academy.',
      active: 'home',
      body: homeBody(),
    }),
  },
  {
    path: 'services/index.html',
    html: page({
      path: 'services/index.html',
      title: 'Clinic Treatments · London Classic Aesthetics',
      desc: 'All treatments at London Classic Aesthetics, Marylebone W1: dermal fillers, anti-wrinkle injections, laser therapy, mesotherapy, IV drips and cupping therapy.',
      active: 'treatments',
      body: servicesHubBody(),
    }),
  },
  {
    path: 'academy/index.html',
    html: page({
      path: 'academy/index.html',
      title: 'Training Academy · London Classic Aesthetics',
      desc: 'Aesthetics training in London W1: CPD courses and regulated qualifications with live-model practice under the direct supervision of a registered doctor.',
      active: 'academy',
      body: academyHubBody(),
    }),
  },
  {
    path: 'about.html',
    html: page({
      path: 'about.html',
      title: 'About the Clinic · London Classic Aesthetics',
      desc: 'About London Classic Aesthetics: a doctor-led clinic and accredited training academy at 157 Seymour Place, Marylebone, led by Dr Hina.',
      active: 'about',
      body: aboutBody(),
    }),
  },
  {
    path: 'become-a-model.html',
    html: page({
      path: 'become-a-model.html',
      title: 'Become a Model · London Classic Aesthetics',
      desc: 'Volunteer as a treatment model at London Classic Aesthetics and receive discounted treatments performed by supervised students under a registered doctor.',
      active: 'model',
      body: modelBody(),
    }),
  },
  {
    path: 'contact.html',
    html: page({
      path: 'contact.html',
      title: 'Contact & Visit · London Classic Aesthetics',
      desc: 'Contact London Classic Aesthetics at 157 Seymour Place, London W1H 4PQ: treatment bookings, course enquiries and the model programme.',
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
