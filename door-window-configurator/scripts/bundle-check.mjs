/**
 * Performance budget, checked: "Lazy-load the 3D bundle so first paint does
 * not wait on WebGL."
 *
 * Reads the production build and fails if the entry chunk imports, or the
 * HTML preloads, the three.js chunk. Found broken at Step 6: React had been
 * bundled inside the 3D chunk, so the page needed it to start at all.
 *
 *   npm run build && node scripts/bundle-check.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';

const assets = readdirSync('dist/assets');
const entry = assets.find((file) => /^index-.*\.js$/.test(file));
const viewer = assets.find((file) => /^viewer3d-.*\.js$/.test(file));
if (!entry || !viewer) {
  console.error('build output not found: run npm run build first');
  process.exit(1);
}

const html = readFileSync('dist/index.html', 'utf8');
const code = readFileSync(`dist/assets/${entry}`, 'utf8');
// Static imports only: the lazy Viewer is loaded with import(), which is fine.
const staticImports = [...code.matchAll(/import\s*\{[^}]*\}\s*from\s*"\.\/([^"]+)"/g)].map((match) => match[1]);
const problems = [];
if (staticImports.includes(viewer)) problems.push(`the entry chunk statically imports ${viewer}`);
if (html.includes(viewer)) problems.push(`index.html preloads ${viewer}`);

const size = (file) => `${(readFileSync(`dist/assets/${file}`).length / 1024).toFixed(0)} KB`;
console.log(`entry ${entry} ${size(entry)}; static imports: ${staticImports.join(', ') || 'none'}; 3D chunk ${viewer} ${size(viewer)}`);
if (problems.length > 0) {
  console.error(`FAILED:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('first paint does not wait on the 3D bundle');
