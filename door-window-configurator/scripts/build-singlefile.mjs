/**
 * Builds a single self-contained HTML file: CSS and JS inlined, no server, no
 * network. For sending someone a build they can just open.
 *
 * NOT the production artefact. It inlines the dynamic import, which defeats
 * the 3D bundle lazy-loading that the normal build exists to provide — first
 * paint waits on the whole 1 MB. Use `npm run build` for deployment.
 *
 *   npm run build:singlefile
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'dist-singlefile';

execFileSync('npx', ['vite', 'build', '--config', 'vite.singlefile.config.ts'], { stdio: 'inherit' });

const assets = readdirSync(join(OUT_DIR, 'assets'));
const js = readFileSync(join(OUT_DIR, 'assets', assets.find((f) => f.endsWith('.js'))), 'utf8');
const css = readFileSync(join(OUT_DIR, 'assets', assets.find((f) => f.endsWith('.css'))), 'utf8');

let html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8')
  .replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/g, '')
  .replace(/<link[^>]*rel="(stylesheet|modulepreload)"[^>]*>/g, '')
  // Function replacers, not strings: in a replacement STRING, `$'`, `$&` and
  // `` $` `` are patterns, and a minified bundle contains them — the file was
  // silently spliced with fragments of itself and failed to parse.
  .replace('</head>', () => `<style>\n${css}\n</style>\n</head>`)
  // Escape any literal closing tag inside the bundle so it cannot end the
  // script element early.
  .replace('</body>', () => `<script type="module">\n${js.replace(/<\/script>/g, () => '<\\/script>')}\n</script>\n</body>`);

mkdirSync(OUT_DIR, { recursive: true });
const out = join(OUT_DIR, 'door-window-configurator.html');
writeFileSync(out, html);
console.log(`\n${out}  ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
