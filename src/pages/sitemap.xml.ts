import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { SITE } from '../consts.ts';
import { publishedPosts, permalink, groupByTag, slugifyTag } from '../lib/blog.ts';

/**
 * Hand-rolled rather than using @astrojs/sitemap, for two concrete reasons:
 *  1. the integration emits `sitemap-index.xml` + `sitemap-0.xml`, but
 *     robots.txt points at `/sitemap.xml` and that URL is in Search Console;
 *  2. the old Jekyll sitemap listed all 35 publication PDFs, which the
 *     integration will not do — and those are the highest-value URLs here.
 */
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export const GET: APIRoute = async () => {
  const paths = new Set<string>(['/']);

  for (const staticPath of [
    '/publications/',
    '/projects/',
    '/repositories/',
    '/cv/',
    '/blog/',
    '/impressum/',
    '/pgp-key/',
  ]) {
    paths.add(staticPath);
  }

  for (const project of await getCollection('projects')) {
    if (!project.data.redirect) paths.add(`/projects/${project.id}/`);
  }
  for (const conference of await getCollection('conferences')) {
    paths.add(`/conferences/${conference.id}/`);
  }

  const posts = await publishedPosts();
  for (const post of posts) paths.add(permalink(post.id));
  for (const [tag] of groupByTag(posts)) paths.add(`/blog/tag/${slugifyTag(tag)}/`);

  // The PDFs: list every file actually present under public/assets/pdf.
  const pdfRoot = 'public/assets/pdf';
  for (const file of walk(pdfRoot)) {
    if (!file.endsWith('.pdf')) continue;
    paths.add(`/assets/pdf/${relative(pdfRoot, file).split(/[\\/]/).join('/')}`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...paths]
  .sort()
  .map((path) => `  <url><loc>${new URL(path, SITE.url).href}</loc></url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
