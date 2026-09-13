#!/usr/bin/env node
/**
 * Feature contract checks.
 *
 * The scripts on this site are tiny and query the DOM by selector, so the real
 * failure mode is a silent contract break: a class renamed in the template while
 * the script still looks for the old name. These assertions pin the contracts.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Derive expected counts from the source of truth rather than hardcoding them,
// so adding a post or a paper does not produce a false failure.
const POST_COUNT = readdirSync('src/content/posts').filter((f) => f.endsWith('.md')).length;
const PUB_COUNT = (readFileSync('src/data/papers.bib', 'utf8').match(/^@/gm) ?? []).length;

const DIST = 'dist';
const walk = (d, o = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, o) : o.push(p);
  }
  return o;
};
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const read = (f) => readFileSync(f, 'utf8');
const fail = [];
const ok = [];
const check = (cond, msg) => (cond ? ok.push(msg) : fail.push(msg));

const real = pages.filter((f) => !/http-equiv="refresh"/.test(read(f)));

// --- the site is dark-only: no theme switching should have crept back in ---
const withTheme = real.filter((f) => /id="theme-toggle"|data-theme=/.test(read(f)));
check(
  withTheme.length === 0,
  `dark-only: no theme toggle or data-theme (found: ${withTheme.length})`,
);

// --- reveal animations must be a no-op without JS ---
const css = walk(DIST)
  .filter((f) => f.endsWith('.css'))
  .map(read)
  .join('\n');
check(/html:not\(\.js\)\s+\.reveal/.test(css), 'reveal has a no-JS fallback rule');
check(/prefers-reduced-motion/.test(css), 'reduced-motion guard present in CSS');

// --- publications filter contract ---
const pubs = read(join(DIST, 'publications/index.html'));
const pubScript =
  pubs.match(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)?.join('') ?? '';
for (const sel of ['#pubsearch', '.no-results', '.entry', '.year']) {
  const inScript = pubScript.includes(sel);
  const inMarkup = new RegExp(`(id|class)="[^"]*${sel.slice(1)}[^"]*"`).test(pubs);
  check(inScript && inMarkup, `filter selector ${sel}: queried by script AND present in markup`);
}
check(
  /id="pubsearch"[^>]*hidden/.test(pubs),
  'search input ships hidden (progressive enhancement)',
);

// --- copy-BibTeX: every data-copy target must exist as an id ---
let copyPairs = 0;
let copyBroken = 0;
for (const f of real) {
  const html = read(f);
  for (const m of html.matchAll(/data-copy="([^"]+)"/g)) {
    copyPairs++;
    if (!html.includes(`id="${m[1]}"`)) copyBroken++;
  }
}
check(
  copyPairs > 0 && copyBroken === 0,
  `copy-BibTeX: ${copyPairs} buttons, ${copyBroken} with a missing target`,
);
check(
  /data-copy="[^"]+"[^>]*hidden/.test(pubs),
  'copy buttons ship hidden (progressive enhancement)',
);
// the <pre> is always rendered, so there is a no-JS path to the BibTeX
check(
  (pubs.match(/<details class="bib"/g) ?? []).length === PUB_COUNT,
  `all ${PUB_COUNT} BibTeX blocks render without JS`,
);

// --- publications content ---
check(
  (pubs.match(/class="entry[^"]*" id=/g) ?? []).length === PUB_COUNT,
  `${PUB_COUNT} publication entries`,
);
check((pubs.match(/class="venue"/g) ?? []).length === PUB_COUNT, `${PUB_COUNT} venue badges`);
check(
  new Set(pubs.match(/href="\/assets\/pdf\/[^"]+"/g) ?? []).size === 35,
  '35 distinct PDF links',
);
check((pubs.match(/href="https:\/\/doi\.org\//g) ?? []).length === 36, '36 DOI links');

// The parser returns author/editor as name objects even in raw mode, so a naive
// stringify silently produces "[object Object]" in every copyable BibTeX block.
const bibBlocks = [...pubs.matchAll(/id="bib-[^"]*"[^>]*>([\s\S]*?)<\/pre>/g)].map((m) => m[1]);
check(bibBlocks.length === PUB_COUNT, `${PUB_COUNT} BibTeX blocks`);
check(
  bibBlocks.every((b) => !b.includes('[object Object]')),
  'no stringified objects in BibTeX',
);
// Match the whole line: names like Fuch{\ss} close a brace before the comma.
const authorLines = bibBlocks.map((b) => /^\s*author\s+=\s+\{(.*)\},?$/m.exec(b)?.[1] ?? '');
check(
  authorLines.every((a) => a.includes(',')),
  'every BibTeX block has a "Last, First" author list',
);
const years = [...pubs.matchAll(/year-head[^>]*>(\d{4})</g)].map((m) => Number(m[1]));
check(
  years.length === 9 && years.every((y, i) => i === 0 || years[i - 1] > y),
  'year headings descending, 9 of them',
);

// --- CV collapsibles ---
const cv = read(join(DIST, 'cv/index.html'));
check((cv.match(/<details/g) ?? []).length === 2, 'CV has 2 <details> collapsibles (zero JS)');
check((cv.match(/class="course(?: now)?"[^>]*>/g) ?? []).length === 23, 'CV lists 23 courses');
check(/@media print/.test(css), 'print stylesheet present for /cv/');

// --- conference pages ---
for (const slug of ['aire25', 'icse25', 'icsa25', 'ecsa22']) {
  const c = read(join(DIST, `conferences/${slug}/index.html`));
  check(/name="citation_title"/.test(c), `${slug}: Highwire citation_title`);
  check(/ScholarlyArticle/.test(c), `${slug}: JSON-LD ScholarlyArticle`);
  check(/Cite this paper/.test(c), `${slug}: cite block`);
}
const icse = read(join(DIST, 'conferences/icse25/index.html'));
// All 7 icse25 authors have an ORCID in authors.yml; the footer adds Dominik's again.
const icseOrcids = new Set(icse.match(/orcid\.org\/[0-9X-]+/g) ?? []);
check(icseOrcids.size === 7, `icse25: 7 distinct author ORCID links (got ${icseOrcids.size})`);
check(/class="frame-bar"/.test(icse), 'icse25: diagram in a chrome frame');

// --- blog ---
const blog = read(join(DIST, 'blog/index.html'));
check(
  (blog.match(/class="post"/g) ?? []).length === POST_COUNT,
  `blog index lists ${POST_COUNT} posts`,
);
const perma = [...blog.matchAll(/href="(\/blog\/\d{4}\/\d{2}\/\d{2}\/[^"]+\/)"/g)].map((m) => m[1]);
check(perma.length === POST_COUNT, `${POST_COUNT} zero-padded permalinks`);
check(
  perma.every((p) => statSync(join(DIST, p.slice(1), 'index.html')).isFile()),
  'every permalink resolves to a file',
);

// --- feed + sitemap are well-formed XML ---
for (const [f, root] of [
  ['feed.xml', 'rss'],
  ['sitemap.xml', 'urlset'],
]) {
  const xml = read(join(DIST, f));
  check(xml.startsWith('<?xml'), `${f}: XML declaration`);
  check(xml.includes(`<${root}`), `${f}: <${root}> root element`);
  // Stack-based well-formedness check: ignores the declaration, CDATA and
  // self-closing tags, and reports the first actual mismatch.
  const stack = [];
  let mismatch = null;
  const body = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w:.-]*)[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClose] = m;
    if (selfClose) continue;
    if (closing) {
      if (stack.pop() !== name) {
        mismatch ??= name;
      }
    } else {
      stack.push(name);
    }
  }
  check(
    stack.length === 0 && !mismatch,
    `${f}: well-formed (unclosed: ${stack.length}${mismatch ? `, first mismatch: ${mismatch}` : ''})`,
  );
}
check(
  (read(join(DIST, 'feed.xml')).match(/<item>/g) ?? []).length === POST_COUNT,
  `feed has ${POST_COUNT} items`,
);
check(
  (read(join(DIST, 'sitemap.xml')).match(/assets\/pdf/g) ?? []).length === 35,
  'sitemap lists 35 PDFs',
);

// --- email obfuscation ---
// Addresses are emitted as HTML numeric character references, so the raw bytes
// contain no address. Checking the raw bytes alone would therefore prove almost
// nothing — a harvester calling the equivalent of `unescape` defeats that in one
// line. So decode entities first and search the result, which is what a scraper
// that bothers would actually see.
const decodeEntities = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const ADDRESS = /[A-Za-z0-9._%+-]+@fuchss\.org/g;

// Every served file, not just pages: the PGP key is downloadable too, and its
// armor comments used to carry both addresses in plain text.
const servedFiles = walk(DIST).filter((f) => /\.(html|xml|txt|json|css|js|asc)$/.test(f));

const rawLeaks = servedFiles.filter((f) => new RegExp(ADDRESS.source).test(read(f)));
const decodedLeaks = servedFiles.filter((f) =>
  new RegExp(ADDRESS.source).test(decodeEntities(read(f))),
);

check(rawLeaks.length === 0, `no address in the served bytes (files with one: ${rawLeaks.length})`);
check(
  decodedLeaks.length === 0,
  `no address after entity-decoding either (files with one: ${decodedLeaks.length})`,
);

// The no-JS fallback must still show something a human can read and type,
// otherwise the obfuscation has just removed the contact details.
const fallbacks = servedFiles.filter((f) => /\(at\)/.test(read(f)));
check(fallbacks.length >= 2, `readable address fallback without JS (pages: ${fallbacks.length})`);

// --- 404 ---
check(/404/.test(read(join(DIST, '404.html'))), '404 page rendered');

// --- retired URLs redirect rather than 404 ---
const stubs = pages.filter((f) => /http-equiv="refresh"/.test(read(f)));
check(stubs.length === 10, `${stubs.length} redirect stubs (9 retired al-folio URLs + ardoco)`);

console.log(`PASS ${ok.length}`);
for (const o of ok) console.log(`  ✓ ${o}`);
if (fail.length) {
  console.log(`\nFAIL ${fail.length}`);
  for (const f of fail) console.log(`  ✗ ${f}`);
  process.exitCode = 1;
} else {
  console.log('\nAll feature contracts hold.');
}
