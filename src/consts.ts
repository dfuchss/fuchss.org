export const SITE = {
  url: 'https://fuchss.org',
  title: 'Dominik Fuchß',
  description:
    'Personal website of Dominik Fuchß, researcher at the Karlsruhe Institute of Technology (KIT).',
  lang: 'en',
  author: { first: 'Dominik', last: 'Fuchß' },
} as const;

export type Section =
  'home' | 'publications' | 'projects' | 'repositories' | 'conferences' | 'cv' | 'blog';

/**
 * Top-level navigation, ordered by what people actually come here for.
 *
 * `conferences` is deliberately absent: the individual paper pages still live at
 * /conferences/<slug>/ (those URLs were published and must not move), but they
 * are reached from the homepage section and from their publication entry rather
 * than from a nav slot of their own.
 */
export const NAV: { label: string; href: string; section: Section }[] = [
  { label: 'about', href: '/', section: 'home' },
  { label: 'publications', href: '/publications/', section: 'publications' },
  { label: 'projects', href: '/projects/', section: 'projects' },
  { label: 'blog', href: '/blog/', section: 'blog' },
  { label: 'repositories', href: '/repositories/', section: 'repositories' },
  { label: 'cv', href: '/cv/', section: 'cv' },
];
