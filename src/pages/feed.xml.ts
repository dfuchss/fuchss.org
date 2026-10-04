import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../consts.ts';
import { publishedPosts, permalink } from '../lib/blog.ts';
import { getPage, fill, need } from '../lib/pages.ts';

// Same URL as the old Jekyll feed (/feed.xml); Atom → RSS 2.0, both universally
// supported by readers.
export const GET: APIRoute = async (context) => {
  const posts = await publishedPosts();
  const { data } = await getPage('blog');
  return rss({
    title: fill(need(data.feedTitle, 'blog.feedTitle'), { name: SITE.title }),
    description: need(data.feedDescription, 'blog.feedDescription'),
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? '',
      pubDate: post.data.date,
      link: permalink(post.id),
      categories: post.data.tags,
    })),
    customData: `<language>en</language>`,
  });
};
