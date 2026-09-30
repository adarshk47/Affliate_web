import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow.
// When you connect your own domain, set SITE_URL=https://yourdomain.in and BASE_PATH=/
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
