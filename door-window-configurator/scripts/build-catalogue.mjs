/**
 * Renders the whole parametric range to one static HTML page.
 *
 * Every tile is an SVG elevation drawn from `buildProduct` — the same part
 * list the 3D scene uses — so this is not a mock-up of the catalogue, it IS
 * the catalogue, at whatever the code currently produces. If a style is wrong
 * here it is wrong in the viewer.
 *
 *   npm run build:catalogue
 *
 * Note the ordering: the single-file Vite build EMPTIES dist-singlefile, so
 * this must run after it, never before. `npm run build:share` does both in
 * the right order.
 */

import { execFileSync } from 'node:child_process';

execFileSync('npx', ['vite-node', 'scripts/catalogue.ts'], { stdio: 'inherit' });
