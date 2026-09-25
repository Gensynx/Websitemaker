import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
