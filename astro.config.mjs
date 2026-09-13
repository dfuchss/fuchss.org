// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fuchss.org',
  // Apache2 serves the gh-pages directory as-is, so emit <route>/index.html and
  // keep the trailing-slash URLs the old Jekyll build published.
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Redirect stubs for the al-folio demo-post URLs that are being retired.
  redirects: {
    '/blog/2022/': '/blog/',
    '/blog/2025/': '/blog/',
    '/blog/2022/10/15/rtl/': '/blog/',
    '/blog/2025/04/28/marimo/': '/blog/',
    '/blog/category/sample-posts/': '/blog/',
    '/blog/tag/code/': '/blog/',
    '/blog/tag/formatting/': '/blog/',
    '/blog/tag/internationalization/': '/blog/',
    // The /conferences/ index is gone; the paper pages it listed are reached
    // from /publications/ and the homepage now.
    '/_pages/conferences/': '/publications/',
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: true },
  },
  devToolbar: { enabled: false },
});
