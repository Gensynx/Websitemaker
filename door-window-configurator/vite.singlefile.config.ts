import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * One-off config for a self-contained HTML build.
 *
 * Deliberately inlines the dynamic import, which DEFEATS the lazy-loading of
 * the 3D bundle that the production config exists to provide. This output is
 * for viewing and sharing, not for deployment.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-singlefile',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: { inlineDynamicImports: true, manualChunks: undefined },
    },
  },
});
