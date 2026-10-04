import type { CollectionEntry } from 'astro:content';

/**
 * Newest first, and fully deterministic.
 *
 * Year and month alone leave ties: several 2026 papers share `month = 8`, and
 * the order among them fell out of however the loader happened to emit them —
 * which split the two RE 2026 papers around an unrelated SoSyM entry. Venue and
 * then title break the tie, so same-venue papers from the same month stay
 * together and the list does not shuffle between builds.
 */
export function byNewest(
  first: CollectionEntry<'publications'>,
  second: CollectionEntry<'publications'>,
) {
  return (
    second.data.year - first.data.year ||
    (second.data.month ?? 0) - (first.data.month ?? 0) ||
    first.data.abbr.id.localeCompare(second.data.abbr.id) ||
    first.data.title.localeCompare(second.data.title)
  );
}
