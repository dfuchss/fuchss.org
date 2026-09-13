import { SITE } from '../consts.ts';

export type Person = { first: string; last: string };

/** Is this the site owner? Compared on the last name, accent-insensitively. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ß/g, 'ss')
    .toLowerCase();

export const isSelf = (p: Person) => fold(p.last) === fold(SITE.author.last);

/** "Dominik Fuchß" */
export const fullName = (p: Person) => [p.first, p.last].filter(Boolean).join(' ');

/**
 * Author list with truncation.
 *
 * Mirrors al-folio's rule, including its grace clause: the limit is 4, but if
 * there are exactly limit+1 authors it shows all of them rather than hiding a
 * single name behind "and 1 more author".
 */
export function truncateAuthors(people: Person[], limit = 4) {
  if (people.length <= limit + 1) return { shown: people, hidden: 0 };
  return { shown: people.slice(0, limit), hidden: people.length - limit };
}
