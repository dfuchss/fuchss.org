import { posix } from 'node:path';

/**
 * Pure transforms that turn an upstream README into the tail of a project page.
 * No I/O here: the loader fetches, downloads and renders, these only rewrite
 * text. Everything is line based and fence aware — a README's code samples
 * hold `# comments`, `<!-- -->` and `[x](y)` that must come through verbatim.
 */

export type Warn = (message: string) => void;

export interface Selection {
  /** The project file has its own intro, so the README's title and preamble go. */
  hasIntro: boolean;
  /** Headings to keep (with their subsections); everything else goes. */
  include?: string[];
  /** Headings to drop (with their subsections); applied after `include`. */
  omit: string[];
}

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})\s*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const HTML_BLOCK = /^ {0,3}<(p|div|table|center|picture|h[1-6]|a|img)\b/i;

/** An inline URL, allowing one level of balanced parentheses: `badge%20(Dev)/badge.svg`. */
const URL_PART = String.raw`<?((?:[^()\s<>]|\([^()\s]*\))+)>?(\s+"[^"]*")?`;
const IMAGE = new RegExp(String.raw`!\[([^\]]*)\]\(\s*${URL_PART}\s*\)`, 'g');
const LINK = new RegExp(String.raw`(?<!!)\[((?:[^\[\]]|\[[^\]]*\])*)\]\(\s*${URL_PART}\s*\)`, 'g');
const LINKED_IMAGE = new RegExp(
  String.raw`\[\s*(!\[[^\]]*\]\(\s*${URL_PART}\s*\))\s*\]\(\s*${URL_PART}\s*\)`,
  'g',
);
const REF_DEFINITION = /^( {0,3}\[[^\]]+\]:\s*)<?(\S+?)>?(\s.*)?$/;
const HREF = /\bhref\s*=\s*(["'])(.*?)\1/gi;

/** Status badges: CI, coverage, version and licence shields. */
const BADGE =
  /shields\.io|badgen\.net|badge\.fury\.io|\/badge\.svg|codecov\.io|coveralls\.io|travis-ci\.|circleci\.com|sonarcloud\.io|codacy\.com|deepsource\.io|snyk\.io\/test|\/actions\/workflows\//i;

/** Mark the lines that belong to fenced code blocks, fences included. */
function fenced(lines: string[]): boolean[] {
  let open: string | undefined;
  return lines.map((line) => {
    if (open) {
      const close = FENCE_CLOSE.exec(line)?.[1];
      if (close && close[0] === open[0] && close.length >= open.length) open = undefined;
      return true;
    }
    open = FENCE_OPEN.exec(line)?.[1];
    return open !== undefined;
  });
}

/**
 * Apply `fn` to every prose line. Inline code spans are swapped for
 * placeholders first, so a link whose text is `` `docs/X.md` `` still
 * matches as a whole, while a `[x](y)` inside backticks is never rewritten.
 */
function mapProse(md: string, fn: (line: string) => string): string {
  const lines = md.split('\n');
  const mask = fenced(lines);
  return lines
    .map((line, index) => {
      if (mask[index]) return line;
      const spans: string[] = [];
      const masked = line.replace(/(`+)[^`]*?\1/g, (span) => `\u0000${spans.push(span) - 1}\u0000`);
      return fn(masked).replace(/\u0000(\d+)\u0000/g, (_, n: string) => spans[Number(n)]);
    })
    .join('\n');
}

const decodeEntities = (text: string): string =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

/** A heading as an `include`/`omit` entry names it: no markup, case or trailing colon. */
const headingKey = (text: string): string =>
  decodeEntities(
    text
      .replace(IMAGE, '')
      .replace(LINK, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_`~]/g, ''),
  )
    .replace(/\s+/g, ' ')
    .replace(/[\s:]+$/, '')
    .trim()
    .toLowerCase();

/** Index of the last line of the HTML block opening at `start`. */
function htmlBlockEnd(lines: string[], start: number): number {
  const tag = HTML_BLOCK.exec(lines[start])![1].toLowerCase();
  const closing = new RegExp(`</${tag}\\s*>`, 'i');
  if (tag === 'img' || closing.test(lines[start])) return start;
  for (let index = start + 1; index < lines.length; index++) {
    if (lines[index].trim() === '') return index - 1;
    if (closing.test(lines[index])) return index;
  }
  return lines.length - 1;
}

const attr = (tag: string, name: string): string | undefined => {
  const match = new RegExp(String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`, 'i').exec(
    tag,
  );
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
};

/** Text that HTML shows besides its links and images, e.g. the `·` between nav links. */
const textBesides = (html: string): string =>
  decodeEntities(html.replace(/<a\b[\s\S]*?<\/a>/gi, '').replace(/<[^>]+>/g, '')).replace(
    /[\s·•|–—-]/g,
    '',
  );

const plainText = (html: string): string =>
  decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, '');

/**
 * Drop the README's own title, and — with a local intro — everything up to
 * its first section. Without one, the preamble is the intro, so only the
 * decoration goes: the H1, and centered blocks of nothing but a logo or links.
 */
function stripTop(lines: string[], hasIntro: boolean): string[] {
  const mask = fenced(lines);
  const headingAt = (index: number) => (mask[index] ? undefined : HEADING.exec(lines[index]));

  let title: [number, number] | undefined;
  let firstSection = lines.length;
  for (let index = 0; index < lines.length; index++) {
    const heading = headingAt(index);
    if (heading) {
      if (!title && heading[1].length === 1) {
        title = [index, index];
        continue;
      }
      firstSection = index;
      break;
    }
    if (!title && !mask[index] && /^ {0,3}<h1\b/i.test(lines[index])) {
      title = [index, htmlBlockEnd(lines, index)];
      index = title[1];
    }
  }

  if (hasIntro) return lines.slice(firstSection);

  const keep = lines.map(() => true);
  if (title) for (let index = title[0]; index <= title[1]; index++) keep[index] = false;
  // A rule closing the preamble only separates it from the first section.
  let last = firstSection - 1;
  while (last >= 0 && lines[last].trim() === '') last--;
  if (last >= 0 && !mask[last] && /^ {0,3}([-*_])( *\1){2,} *$/.test(lines[last]))
    keep[last] = false;
  for (let index = 0; index < firstSection; index++) {
    if (mask[index] || !/^ {0,3}<p\b[^>]*\balign=/i.test(lines[index])) continue;
    const end = htmlBlockEnd(lines, index);
    const block = lines.slice(index, end + 1).join('\n');
    if (/<(a|img)\b/i.test(block) && textBesides(block) === '') {
      for (let drop = index; drop <= end; drop++) keep[drop] = false;
    }
    index = end;
  }
  return lines.filter((_, index) => keep[index]);
}

/**
 * Keep the `include`d sections, then drop the `omit`ted ones. A section runs
 * to the next heading of the same or a higher level, so omitting an H1 such
 * as tacit's "Original README below" takes everything under it along.
 */
function selectSections(lines: string[], selection: Selection, warn: Warn): string[] {
  const mask = fenced(lines);
  const headings = lines.flatMap((line, index) => {
    const match = mask[index] ? null : HEADING.exec(line);
    return match ? [{ index, level: match[1].length, key: headingKey(match[2] ?? '') }] : [];
  });
  const sections = headings.map((heading, position) => {
    const next = headings.slice(position + 1).find((later) => later.level <= heading.level);
    return { ...heading, end: next?.index ?? lines.length };
  });

  const mark = (names: string[], label: string, value: boolean, keep: boolean[]) => {
    for (const name of names) {
      const matches = sections.filter((section) => section.key === headingKey(name));
      if (matches.length === 0) warn(`${label} "${name}" matches no heading`);
      for (const section of matches) {
        for (let index = section.index; index < section.end; index++) keep[index] = value;
      }
    }
  };

  // The preamble (before the first heading) is the intro and survives `include`.
  const firstHeading = headings[0]?.index ?? lines.length;
  const keep = lines.map((_, index) => !selection.include || index < firstHeading);
  if (selection.include) mark(selection.include, 'include', true, keep);
  mark(selection.omit, 'omit', false, keep);
  return lines.filter((_, index) => keep[index]);
}

/**
 * Turn HTML blocks that only arrange images — a centered `<p>`, a `<table>`
 * grid — into Markdown images, which is what Astro optimizes. A grid's
 * caption rows go with it. An image inside HTML with real text is left
 * alone: rewriting it would lose the text, so it is reported instead.
 */
function htmlImagesToMarkdown(lines: string[], warn: Warn): string[] {
  const mask = fenced(lines);
  const out: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    if (mask[index] || !HTML_BLOCK.test(lines[index])) {
      if (!mask[index] && /<img\b/i.test(lines[index])) {
        warn(`image inside inline HTML left as-is: ${lines[index].trim().slice(0, 80)}`);
      }
      out.push(lines[index]);
      continue;
    }
    const end = htmlBlockEnd(lines, index);
    const block = lines.slice(index, end + 1).join('\n');
    const images = block.match(/<img\b[^>]*>/gi) ?? [];
    const isTable = /^\s*<table\b/i.test(block);
    const pureImages = isTable
      ? block.split(/<tr\b[^>]*>/i).every((row) => !/<img\b/i.test(row) || plainText(row) === '')
      : plainText(block) === '';
    if (images.length === 0) {
      out.push(...lines.slice(index, end + 1));
    } else if (pureImages) {
      const markdown = images.flatMap((img) => {
        const src = attr(img, 'src');
        if (!src) return [];
        const alt = (attr(img, 'alt') ?? '').replace(/\s+/g, ' ').replace(/[[\]]/g, '\\$&');
        return [`![${decodeEntities(alt)}](${src})`, ''];
      });
      out.push('', ...markdown);
    } else {
      warn(`image inside mixed HTML left as-is: ${block.replace(/\s+/g, ' ').slice(0, 80)}`);
      out.push(...lines.slice(index, end + 1));
    }
    index = end;
  }
  return out;
}

/** Collapse runs of blank lines outside code, and trim the ends. */
function tidy(md: string): string {
  const lines = md.split('\n');
  const mask = fenced(lines);
  return lines
    .filter((line, index) => mask[index] || line.trim() !== '' || lines[index - 1]?.trim() !== '')
    .join('\n')
    .trim();
}

/**
 * Steps 1–7 and 11 of the README transform: everything that does not need
 * the network or the rest of the page. Images and links are rewritten
 * afterwards, by {@link rewriteImages} and {@link rewriteLinks}.
 */
export function transformReadme(readme: string, selection: Selection, warn: Warn): string {
  // 1. Line endings and comments. Comments are removed per run of prose lines,
  //    since one can span several lines but must never reach into a fence.
  const source = readme.replace(/\r\n?/g, '\n').split('\n');
  const sourceMask = fenced(source);
  const chunks: string[] = [];
  for (let index = 0; index < source.length;) {
    const inFence = sourceMask[index];
    let end = index;
    while (end < source.length && sourceMask[end] === inFence) end++;
    const chunk = source.slice(index, end).join('\n');
    chunks.push(inFence ? chunk : chunk.replace(/<!--[\s\S]*?-->/g, ''));
    index = end;
  }

  // 2.–4. Title, sections, and H1s demoted so none competes with the page's own.
  let lines = stripTop(chunks.join('\n').split('\n'), selection.hasIntro);
  lines = selectSections(lines, selection, warn);
  const mask = fenced(lines);
  lines = lines.map((line, index) => (mask[index] ? line : line.replace(/^( {0,3})# /, '$1## ')));

  // 5. HTML image layouts to Markdown images.
  lines = htmlImagesToMarkdown(lines, warn);

  // 6., 7. and 11. Unwrap linked images, drop badges, translate GitHub alerts.
  // A line that held nothing but badges is dropped, not left blank.
  const md = mapProse(lines.join('\n'), (line) => {
    const cleaned = line
      .replace(LINKED_IMAGE, '$1')
      .replace(IMAGE, (image, _alt, src: string) => (BADGE.test(src) ? '' : image))
      .replace(
        /^(\s*>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i,
        (_, quote: string, kind: string) =>
          `${quote}**${kind[0].toUpperCase()}${kind.slice(1).toLowerCase()}**`,
      );
    return cleaned.trim() === '' && line.trim() !== '' ? '\u0001' : cleaned;
  });
  return tidy(
    md
      .split('\n')
      .filter((line) => line !== '\u0001')
      .join('\n'),
  );
}

/** The `src` of every Markdown image outside code, in order. */
export function collectImages(md: string): string[] {
  const found: string[] = [];
  mapProse(md, (line) => {
    for (const match of line.matchAll(IMAGE)) found.push(match[2]);
    return line;
  });
  return found;
}

/** Replace Markdown image sources; `map` returns undefined to leave one as it is. */
export function rewriteImages(md: string, map: (src: string) => string | undefined): string {
  return mapProse(md, (line) =>
    line.replace(IMAGE, (image, alt: string, src: string, title?: string) => {
      const next = map(src);
      return next === undefined ? image : `![${alt}](${next}${title ?? ''})`;
    }),
  );
}

/** Replace every link target: inline links, reference definitions and `href` attributes. */
export function rewriteLinks(md: string, map: (href: string) => string): string {
  return mapProse(md, (line) =>
    line
      .replace(LINK, (_, text: string, href: string, title?: string) => {
        return `[${text}](${map(href)}${title ?? ''})`;
      })
      .replace(REF_DEFINITION, (_, head: string, href: string, tail?: string) => {
        return `${head}${map(href)}${tail ?? ''}`;
      })
      .replace(HREF, (_, quote: string, href: string) => `href=${quote}${map(href)}${quote}`),
  );
}

const hasScheme = (href: string) => /^[a-z][a-z\d+.-]*:|^\/\//i.test(href);

/**
 * Resolve a README-relative path against the directory the README lives in;
 * a leading `/` means the repository root, as on GitHub.
 */
export function repoPath(readmePath: string, href: string): string {
  if (href.startsWith('/')) return href.slice(1);
  return posix.normalize(posix.join(posix.dirname(readmePath), href)).replace(/^(\.\/)+/, '');
}

/** A link relative to the README, pointed at the file view on the forge instead. */
export function absoluteLink(href: string, readmePath: string, blobBase: string): string {
  if (href === '' || href.startsWith('#') || hasScheme(href)) return href;
  const split = href.search(/[?#]/);
  const path = split === -1 ? href : href.slice(0, split);
  const rest = split === -1 ? '' : href.slice(split);
  return `${blobBase}${repoPath(readmePath, path)}${rest}`;
}

/**
 * Point `#anchor` links whose heading did not make it onto the page — an
 * omitted section — at the README on the forge, where the heading still is.
 */
export function anchorLink(href: string, ids: Set<string>, readmeUrl: string): string {
  if (!href.startsWith('#') || href.length === 1) return href;
  let id = href.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // keep the raw fragment
  }
  return ids.has(id) ? href : `${readmeUrl}${href}`;
}
