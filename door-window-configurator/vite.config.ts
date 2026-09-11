import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
