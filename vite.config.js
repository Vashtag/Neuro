import { defineConfig } from 'vite';

// The repository is published to GitHub Pages at https://vashtag.github.io/Neuro/
// so the production base path must match the repo name EXACTLY (case-sensitive).
// Local `npm run dev` ignores `base`, so development is unaffected.
export default defineConfig({
  base: '/Neuro/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});
