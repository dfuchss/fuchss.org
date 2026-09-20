// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fuchss.org',
  // Apache2 serves the gh-pages directory as-is, so emit <route>/index.html and
  // keep the trailing-slash URLs the old Jekyll build published.
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects: {
    // The /conferences/ index is gone; the paper pages it listed are reached
    // from /publications/ and the homepage now.
    '/_pages/conferences/': '/publications/',
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: true },
  },
  devToolbar: { enabled: false },
});
