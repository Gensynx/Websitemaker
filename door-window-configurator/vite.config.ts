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
    // performance budget in the brief). Populated once Step 2 lands.
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          id.includes('three') || id.includes('@react-three') ? 'viewer3d' : undefined,
      },
    },
  },
});
