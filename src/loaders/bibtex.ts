import type { Loader } from 'astro/loaders';
import { parse } from '@retorquere/bibtex-parser';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Fields stripped from the copyable BibTeX: al-folio bookkeeping, not bibliography. */
const PRIVATE_FIELDS = new Set(['abbr', 'google_scholar_id', 'pdf']);

const str = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  const joined = Array.isArray(value) ? value.join(', ') : String(value);
  const trimmed = joined.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * Strip the LaTeX escapes the cooked parse leaves behind.
 *
 * The decoder only rewrites escapes that stand for a Unicode character, so an
 * escaped ASCII punctuation mark survives verbatim: the Springer and GI DOIs
 * keep their `\_`, and `https://doi.org/10.1007/978-3-031-88531-0\_27`
 * resolves to nothing. Only for the values we turn into links or plain text —
 * the copyable BibTeX is built from the raw parse and keeps its escapes.
 */
const unLatex = (value: string | undefined): string | undefined =>
  value?.replace(/\\([_&%$#{}])/g, '$1');

const num = (value: unknown): number | undefined => {
  const text = str(value);
  if (text === undefined) return undefined;
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * Re-serialize one entry as public BibTeX, dropping the private fields.
 *
 * Built from the RAW parse so LaTeX escapes and brace protection survive
 * verbatim — a reader pasting this into their own .bib gets what the source
 * file says, not a Unicode-normalized approximation.
 */
/** A parsed BibTeX name. The parser hands these back even in `raw` mode. */
type BibName = { lastName?: string; firstName?: string; prefix?: string; suffix?: string };

const isNameList = (value: unknown): value is BibName[] =>
  Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null;

/**
 * `author` and `editor` come back as name objects, never as a string — so
 * stringifying them naively yields "[object Object]". Rebuild the BibTeX form:
 * "Last, First" joined by " and ", with the LaTeX escapes left untouched.
 */
const names = (list: BibName[]): string =>
  list
    .map((name) => {
      const last = (name.lastName ?? '').trim();
      const first = (name.firstName ?? '').trim();
      if (last && first) return `${last}, ${first}`;
      return last || first;
    })
    .filter(Boolean)
    .join(' and ');

function serialize(type: string, key: string, fields: Record<string, unknown>): string {
  const rows = Object.entries(fields)
    .filter(([field]) => !PRIVATE_FIELDS.has(field.toLowerCase()))
    .map(
      ([field, value]) =>
        `  ${field.padEnd(12)} = {${(isNameList(value) ? names(value) : str(value)) ?? ''}}`,
    );
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
        for (const parseError of cooked.errors) {
          logger.error(`${opts.file}: ${JSON.stringify(parseError)}`);
        }
        throw new Error(`${cooked.errors.length} BibTeX parse error(s) in ${opts.file}`);
      }

      const rawByKey = new Map(raw.entries.map((rawBibEntry) => [rawBibEntry.key, rawBibEntry]));
      store.clear();

      for (const entry of cooked.entries) {
        const fields = entry.fields as Record<string, unknown>;

        const authors = (fields.author as BibName[] | undefined) ?? [];
        if (authors.length === 0) throw new Error(`${entry.key}: no authors parsed`);

        // `pdf` is the only PDF field. The 9 entries that used to carry the PDF
        // in `preprint` were migrated to `pdf`, and the field is gone.
        const pdfRel = str(fields.pdf);
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
          (rawEntry?.fields as Record<string, unknown>) ?? fields,
        );

        // The normalizing parse splits a nobiliary particle off into `prefix`
        // and a "Jr."-style tail into `suffix`. Reading `lastName` alone turns
        // "von Geisau, Johannes" into "Johannes Geisau".
        const people = authors.map((author) => ({
          first: str(author.firstName) ?? '',
          last: [str(author.prefix), str(author.lastName), str(author.suffix)]
            .filter(Boolean)
            .join(' '),
        }));

        const data = {
          key: entry.key,
          type: entry.type,
          title: str(fields.title) ?? entry.key,
          authors: people,
          year: num(fields.year) ?? 0,
          month: num(fields.month),
          abbr: str(fields.abbr) ?? 'misc',
          booktitle: str(fields.booktitle),
          journal: str(fields.journal),
          school: str(fields.school),
          institution: str(fields.institution),
          publisher: str(fields.publisher),
          series: str(fields.series),
          volume: str(fields.volume),
          number: str(fields.number),
          pages: str(fields.pages),
          // 6 biblatex entries carry `venue` where the rest use `location`;
          // fall back so those stop rendering without a place.
          location: str(fields.location) ?? str(fields.venue) ?? str(fields.address),
          doi: unLatex(str(fields.doi)),
          url: unLatex(str(fields.url)),
          keywords: (str(fields.keywords) ?? '')
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean),
          googleScholarId: str(fields.google_scholar_id),
          pdfUrl,
          bibtex,
          searchText: [
            str(fields.title),
            people.map((person) => `${person.first} ${person.last}`).join(' '),
            str(fields.booktitle),
            str(fields.journal),
            str(fields.abbr),
            str(fields.year),
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
