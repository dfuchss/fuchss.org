import { getEntry, render } from 'astro:content';

/**
 * Load a page from src/content/pages/<id>.md: validated frontmatter plus the
 * rendered Markdown body. A missing file fails the build with a clear message.
 */
export async function getPage(id: string) {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing page content: src/content/pages/${id}.md`);
  const { Content } = await render(entry);
  return { data: entry.data, Content };
}

/** Fill `{name}` placeholders in a content string with computed values. */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (placeholder, name) =>
    name in vars ? String(vars[name]) : placeholder,
  );
}

/** Pick the singular or plural form for `count` and fill in `{count}`. */
export function pluralize(forms: { one: string; other: string }, count: number) {
  return fill(count === 1 ? forms.one : forms.other, { count });
}

/**
 * Read a content field that the page requires. The schema keeps every field
 * optional because the collection mixes page shapes, so a missing field is
 * caught here at build time instead of rendering "undefined".
 */
export function need<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`Missing page content field: ${name}`);
  return value;
}
