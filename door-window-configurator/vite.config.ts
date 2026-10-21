import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * A Content-Security-Policy for the built page, as a <meta> tag so it works on
 * hosts that cannot set headers. Scripts may only come from the site's own
 * files, and the page may only talk to its own origin plus the enquiry
 * endpoint when that is on another one.
 *
 * Build only: the dev server injects an inline script for hot reload, which
 * this policy would block. frame-ancestors is ignored in a <meta> tag, so
 * clickjacking protection still has to come from a response header.
 */
function contentSecurityPolicy(): Plugin {
  let connect = "'self'";
  return {
    name: 'content-security-policy',
    apply: 'build',
    configResolved(config) {
      const endpoint = config.env.VITE_ENQUIRY_ENDPOINT;
      if (typeof endpoint === 'string' && /^https:\/\//.test(endpoint)) connect += ` ${new URL(endpoint).origin}`;
    },
    transformIndexHtml(html) {
      const policy = [
        "default-src 'self'",
        "script-src 'self'",
        // React and the 3D canvas set inline styles.
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        `connect-src ${connect}`,
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ].join('; ');
      // Straight after the charset, so it is in force before any script or
      // stylesheet tag is read.
      const charset = /(<meta charset="[^"]*"\s*\/?>)/i;
      if (!charset.test(html)) throw new Error('index.html needs <meta charset> for the security policy to follow');
      return html.replace(
        charset,
        `$1\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />` +
          `\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), contentSecurityPolicy()],
  // Relative asset paths, so the built site works from any folder of any
  // domain (e.g. /configurator/), not only from a domain's root.
  base: './',
  test: {
    // Vitest stubs every stylesheet to an empty string unless told otherwise —
    // even with ?raw — which silently left the contrast test with no tokens to
    // read. The stylesheet is data to that test, so it is let through.
    css: { include: [/styles\.css/] },
  },
  build: {
    // The 3D bundle is split out so first paint never waits on WebGL (see the
    // performance budget in the brief).
    //
    // React goes in a chunk of its own FIRST. Rollup pulls a manual chunk's
    // unassigned dependencies into that chunk, and React is a dependency of
    // @react-three/fiber — so it landed in viewer3d, the page imported React
    // from there, and the whole 1 MB 3D bundle loaded before first paint.
    // scripts/bundle-check.mjs fails the build if that ever recurs.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (/node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store)\//.test(id)) return 'react';
          // Bundler helpers are shared by everything; left unassigned they
          // follow the same rule into viewer3d.
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'react';
          if (id.includes('three') || id.includes('@react-three')) return 'viewer3d';
          return undefined;
        },
      },
    },
  },
});
