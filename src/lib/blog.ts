import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Derive the permalink parts from the FILENAME, never from the parsed date.
 *
 * Jekyll's permalink was /blog/:year/:month/:day/:title/ with zero-padded month
 * and day. Reading a parsed `Date` with local getters shifts the day backwards
 * anywhere west of UTC, silently changing URLs depending on where the build ran.
 * The filename already carries the canonical zero-padded values.
 */
export function permalinkParts(id: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/.exec(id);
  if (!match) throw new Error(`post id "${id}" is not YYYY-MM-DD-slug`);
  const [, year, month, day, slug] = match;
  return { year, month, day, slug };
}

export function permalink(id: string): string {
  const { year, month, day, slug } = permalinkParts(id);
  return `/blog/${year}/${month}/${day}/${slug}/`;
}

/** Published posts, newest first. Also asserts front matter matches the filename. */
export async function publishedPosts(): Promise<Post[]> {
  const posts = (await getCollection('posts')).filter((post) => !post.data.draft);
  for (const post of posts) {
    const { year, month, day } = permalinkParts(post.id);
    const iso = post.data.date.toISOString().slice(0, 10);
    if (iso !== `${year}-${month}-${day}`) {
      throw new Error(`${post.id}: front-matter date ${iso} disagrees with the filename`);
    }
  }
  return posts.sort((older, newer) => newer.data.date.getTime() - older.data.date.getTime());
}

export const formatPostDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);

/** tag → posts, sorted by frequency then name. */
export function groupByTag(posts: Post[]) {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, [...(map.get(tag) ?? []), post]);
    }
  }
  return [...map.entries()].sort(
    ([nameA, postsA], [nameB, postsB]) =>
      postsB.length - postsA.length || nameA.localeCompare(nameB),
  );
}

export const slugifyTag = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
