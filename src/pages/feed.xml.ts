import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../consts.ts';
import { publishedPosts, permalink } from '../lib/blog.ts';

// Same URL as the old Jekyll feed (/feed.xml); Atom → RSS 2.0, both universally
// supported by readers.
export const GET: APIRoute = async (context) => {
  const posts = await publishedPosts();
  return rss({
    title: `${SITE.title} — Blog`,
    description: '.. just some of my thoughts ..',
    site: context.site ?? SITE.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description ?? '',
      pubDate: p.data.date,
      link: permalink(p.id),
      categories: p.data.tags,
    })),
    customData: `<language>en</language>`,
  });
};
