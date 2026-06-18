import { defineConfig } from 'vite';

// The repository is published to GitHub Pages at https://vashtag.github.io/neuro/
// so the production base path must match the repo name. Local `npm run dev`
// ignores `base`, so development is unaffected.
export default defineConfig({
  base: '/neuro/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});
