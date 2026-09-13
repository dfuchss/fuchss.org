#!/usr/bin/env node
/**
 * Inline a built page into a single self-contained HTML file.
 *
 * Used to produce reviewable snapshots: local stylesheets are inlined, images
 * become data: URIs, and the self-hosted @fontsource faces are swapped for the
 * same families from Google Fonts (the viewer sandbox allows that origin but not
 * arbitrary font files).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const OUT = 'preview';
mkdirSync(OUT, { recursive: true });

const MIME = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const dataUri = (urlPath) => {
  const file = join(DIST, urlPath.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  const ext = urlPath.slice(urlPath.lastIndexOf('.')).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return null;
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
};

function inline(route, outName) {
  const src = join(DIST, route.replace(/^\//, '') || '.', 'index.html');
  let html = readFileSync(src, 'utf8');

  // 1. inline every local stylesheet
  html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, (tag) => {
    const href = /href="([^"]+)"/.exec(tag)?.[1];
    if (!href?.startsWith('/')) return tag;
    const file = join(DIST, href.replace(/^\//, ''));
    if (!existsSync(file)) return '';
    let css = readFileSync(file, 'utf8');
    // @fontsource points at local woff2 files that won't exist here
    css = css.replace(/@font-face\s*\{[^}]*\}/g, '');
    return `<style>${css}</style>`;
  });

  // 2. same families, from an origin the viewer allows
  html = html.replace(
    '</head>',
    `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>`,
  );

  // 3. images → data URIs (src and srcset)
  html = html.replace(/srcset="([^"]+)"/g, (_m, val) => {
    const parts = val.split(',').map((p) => p.trim().split(/\s+/));
    const rewritten = parts
      .map(([u, d]) => {
        const uri = u.startsWith('/') ? dataUri(u) : null;
        return uri ? `${uri}${d ? ' ' + d : ''}` : null;
      })
      .filter(Boolean);
    return rewritten.length ? `srcset="${rewritten.join(', ')}"` : '';
  });
  html = html.replace(/src="(\/[^"]+)"/g, (m, u) => {
    const uri = dataUri(u);
    return uri ? `src="${uri}"` : m;
  });

  writeFileSync(join(OUT, outName), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`  ${outName.padEnd(22)} ${kb} KB  ← ${route || '/'}`);
}

inline('', 'home.html');
inline('publications', 'publications.html');
inline('cv', 'cv.html');
inline('projects', 'projects.html');
inline('projects/tacit', 'project-tacit.html');
inline('conferences/icse25', 'conference-icse25.html');
inline('repositories', 'repositories.html');
inline('blog', 'blog.html');
console.log('\nSelf-contained snapshots written to preview/');
