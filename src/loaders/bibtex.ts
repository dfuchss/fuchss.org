import type { Loader } from 'astro/loaders';
import { parse } from '@retorquere/bibtex-parser';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Fields stripped from the copyable BibTeX: al-folio bookkeeping, not bibliography. */
const PRIVATE_FIELDS = new Set(['abbr', 'google_scholar_id', 'pdf']);

const str = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = Array.isArray(v) ? v.join(', ') : String(v);
  const t = s.trim();
  return t === '' ? undefined : t;
};

const num = (v: unknown): number | undefined => {
  const s = str(v);
  if (s === undefined) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? undefined : n;
};

/**
 * Re-serialize one entry as public BibTeX, dropping the private fields.
 *
 * Built from the RAW parse so LaTeX escapes and brace protection survive
 * verbatim — a reader pasting this into their own .bib gets what the source
 * file says, not a Unicode-normalized approximation.
 */
/** A parsed BibTeX name. The parser hands these back even in `raw` mode. */
type BibName = { lastName?: string; firstName?: string };

const isNameList = (v: unknown): v is BibName[] =>
  Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null;

/**
 * `author` and `editor` come back as name objects, never as a string — so
 * stringifying them naively yields "[object Object]". Rebuild the BibTeX form:
 * "Last, First" joined by " and ", with the LaTeX escapes left untouched.
 */
const names = (list: BibName[]): string =>
  list
    .map((n) => {
      const last = (n.lastName ?? '').trim();
      const first = (n.firstName ?? '').trim();
      if (last && first) return `${last}, ${first}`;
      return last || first;
    })
    .filter(Boolean)
    .join(' and ');

function serialize(type: string, key: string, fields: Record<string, unknown>): string {
  const rows = Object.entries(fields)
    .filter(([k]) => !PRIVATE_FIELDS.has(k.toLowerCase()))
    .map(([k, v]) => `  ${k.padEnd(12)} = {${(isNameList(v) ? names(v) : str(v)) ?? ''}}`);
  return `@${type}{${key},\n${rows.join(',\n')}\n}`;
}

export function bibtexLoader(opts: { file: string; pdfRoot: string }): Loader {
  return {
    name: 'bibtex',
    load: async ({ store, parseData, generateDigest, logger, watcher }) => {
      const bibPath = fileURLToPath(new URL(`../../${opts.file}`, import.meta.url));
      watcher?.add(bibPath);
      // Watch this loader too. Entries are cached in `.astro/`, keyed off the
      // source file, so editing the parsing logic alone left the dev server
      // serving the previous parse indefinitely — a fix could look like it had
      // done nothing at all.
      watcher?.add(fileURLToPath(import.meta.url));

      const source = await readFile(bibPath, 'utf8');

      // Two passes: `cooked` gives LaTeX decoded to Unicode for display;
      // `raw` keeps the original escapes for the copyable BibTeX block.
      // sentenceCase:false preserves brace-protected casing ({LiSSA}, {ExArch}).
      const cooked = parse(source, { sentenceCase: false });
      const raw = parse(source, { sentenceCase: false, raw: true });

      if (cooked.errors.length > 0) {
        for (const e of cooked.errors) logger.error(`${opts.file}: ${JSON.stringify(e)}`);
        throw new Error(`${cooked.errors.length} BibTeX parse error(s) in ${opts.file}`);
      }

      const rawByKey = new Map(raw.entries.map((e) => [e.key, e]));
      store.clear();

      for (const entry of cooked.entries) {
        const f = entry.fields as Record<string, unknown>;

        const authors = (f.author as { firstName?: string; lastName?: string }[] | undefined) ?? [];
        if (authors.length === 0) throw new Error(`${entry.key}: no authors parsed`);

        // `pdf` is the only PDF field. The 9 entries that used to carry the PDF
        // in `preprint` were migrated to `pdf`, and the field is gone.
        const pdfRel = str(f.pdf);
        let pdfUrl: string | undefined;
        if (pdfRel) {
          if (/^https?:\/\//.test(pdfRel)) {
            pdfUrl = pdfRel;
          } else {
            const onDisk = fileURLToPath(
              new URL(`../../${opts.pdfRoot}/${pdfRel}`, import.meta.url),
            );
            if (!existsSync(onDisk)) {
              throw new Error(`${entry.key}: PDF not found → ${opts.pdfRoot}/${pdfRel}`);
            }
            pdfUrl = `/assets/pdf/${pdfRel}`;
          }
        }

        const rawEntry = rawByKey.get(entry.key);
        const bibtex = serialize(
          entry.type,
          entry.key,
          (rawEntry?.fields as Record<string, unknown>) ?? f,
        );

        const people = authors.map((a) => ({
          first: str(a.firstName) ?? '',
          last: str(a.lastName) ?? '',
        }));

        const data = {
          key: entry.key,
          type: entry.type,
          title: str(f.title) ?? entry.key,
          authors: people,
          year: num(f.year) ?? 0,
          month: num(f.month),
          abbr: str(f.abbr) ?? 'misc',
          booktitle: str(f.booktitle),
          journal: str(f.journal),
          school: str(f.school),
          institution: str(f.institution),
          publisher: str(f.publisher),
          series: str(f.series),
          volume: str(f.volume),
          number: str(f.number),
          pages: str(f.pages),
          // 6 biblatex entries carry `venue` where the rest use `location`;
          // fall back so those stop rendering without a place.
          location: str(f.location) ?? str(f.venue) ?? str(f.address),
          doi: str(f.doi),
          url: str(f.url),
          keywords: (str(f.keywords) ?? '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          googleScholarId: str(f.google_scholar_id),
          pdfUrl,
          bibtex,
          searchText: [
            str(f.title),
            people.map((p) => `${p.first} ${p.last}`).join(' '),
            str(f.booktitle),
            str(f.journal),
            str(f.abbr),
            str(f.year),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        };

        const parsed = await parseData({ id: entry.key, data });
        store.set({ id: entry.key, data: parsed, digest: generateDigest(parsed) });
      }

      logger.info(`parsed ${cooked.entries.length} publications`);
    },
  };
}
