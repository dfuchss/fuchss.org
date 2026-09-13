import { citations } from './data.ts';

/**
 * Google Scholar cluster id → citation count.
 *
 * Keys in citations.yml look like `bVvFp4oAAAAJ:<clusterId>`; bib entries carry
 * only the part after the last colon in `google_scholar_id`, so index on that.
 */
const byCluster = new Map<string, number>(
  Object.entries(citations.papers).map(([key, value]) => [
    key.split(':').at(-1)!,
    value.citations ?? 0,
  ]),
);

export function citationsFor(googleScholarId?: string): number {
  if (!googleScholarId) return 0;
  return byCluster.get(googleScholarId.split(':').at(-1)!) ?? 0;
}

/**
 * Total citations, h-index and i10-index.
 *
 * Computed over the whole of citations.yml — i.e. the full Scholar profile, not
 * just the entries present in papers.bib. That is what the current Liquid does,
 * and it is why the numbers match Scholar's own.
 */
export function scholarMetrics() {
  const counts = Object.values(citations.papers)
    .map((p) => p.citations ?? 0)
    .sort((a, b) => b - a);

  return {
    total: counts.reduce((sum, n) => sum + n, 0),
    hIndex: counts.reduce((h, n, i) => (n >= i + 1 ? i + 1 : h), 0),
    i10: counts.filter((n) => n >= 10).length,
    lastUpdated: citations.metadata.last_updated,
  };
}

/**
 * Format the `last_updated` date. Parsed as UTC on purpose: `new Date('2026-09-13')`
 * is midnight UTC, but reading it with local getters west of UTC yields the
 * previous day. Pinning the timeZone keeps the rendered date stable wherever the
 * build runs.
 */
export function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

export const formatCount = (n: number) => new Intl.NumberFormat('en-US').format(n);
