#!/usr/bin/env node
/**
 * Structural + accessibility audit of the built site.
 *
 * Catches the classes of bug a hand-built design actually hits: a CSS custom
 * property referenced but never defined, a colour token missing from one theme,
 * insufficient text contrast, broken internal links, images without intrinsic
 * dimensions, duplicate or missing <h1>.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const walk = (dir, out = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const cssFiles = files.filter((f) => f.endsWith('.css'));
const allCss = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
const allHtml = htmlFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

const problems = [];
const note = (m) => problems.push(m);

// ---- 1. every var() has a definition somewhere ----
const defined = new Set([...allCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
// inline styles can define tokens too (e.g. --brand on venue badges)
for (const m of allHtml.matchAll(/(--[a-z0-9-]+)\s*:/g)) defined.add(m[1]);
const used = new Set([...allCss.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
for (const m of allHtml.matchAll(/var\((--[a-z0-9-]+)/g)) used.add(m[1]);
const undef = [...used].filter((t) => !defined.has(t)).sort();
console.log(`CSS tokens: ${defined.size} defined, ${used.size} referenced`);
if (undef.length) note(`undefined CSS tokens referenced: ${undef.join(', ')}`);

// ---- 2. dark-only: every colour token lives on bare :root ----
const rootBlock = /:root\s*\{([^}]*)\}/.exec(allCss)?.[1] ?? '';
const colourish = (name) => /^--(bg|text|border|green|cyan|violet|amber|danger|warn)/.test(name);
const rootColours = [...rootBlock.matchAll(/(--[a-z0-9-]+)\s*:/g)]
  .map((m) => m[1])
  .filter(colourish);
console.log(`Colour tokens on :root: ${rootColours.length}`);
// The site is dark-only; a [data-theme] block would reintroduce the split.
if (/\[data-theme/.test(allCss)) note('CSS still contains a [data-theme] block');

// ---- 3. contrast ratios ----
const hex = (h) => {
  const s = h.replace('#', '');
  const v = s.length === 3 ? [...s].map((c) => c + c).join('') : s;
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
};
const lum = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(hex(a)), lum(hex(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const tok = (block, name) =>
  (new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,6})`).exec(block) ?? [])[1];

for (const [label, block, bgName] of [['dark', rootBlock, '--bg']]) {
  const bg = tok(block, bgName);
  if (!bg) continue;
  console.log(`\nContrast on ${label} background ${bg}:`);
  for (const fg of [
    '--text',
    '--text-muted',
    '--text-faint',
    '--green',
    '--cyan',
    '--violet',
    '--amber',
  ]) {
    const c = tok(block, fg);
    if (!c) continue;
    const r = ratio(c, bg);
    const isBody = fg.startsWith('--text');
    // Body text needs 4.5:1; accents are used for large text, chips and borders → 3:1
    const need = isBody && fg !== '--text-faint' ? 4.5 : 3;
    const ok = r >= need;
    console.log(`  ${fg.padEnd(14)} ${c}  ${r.toFixed(2)}:1  need ${need}  ${ok ? 'OK' : 'LOW'}`);
    if (!ok) note(`${label} theme: ${fg} (${c}) is ${r.toFixed(2)}:1 on ${bg}, below ${need}:1`);
  }
}

// ---- 4. internal links resolve ----
const resolve = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return `${DIST}/index.html`;
  const p = clean.replace(/^\//, '').replace(/\/$/, '');
  return p.includes('.') ? `${DIST}/${p}` : `${DIST}/${p}/index.html`;
};
/** Ids a page offers as anchor targets. */
const idsOf = (file) => {
  const html = readFileSync(file, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
  for (const m of html.matchAll(/\bname="([^"]+)"/g)) ids.add(m[1]);
  return ids;
};
const idCache = new Map();

let linkCount = 0;
let fragmentCount = 0;
const broken = new Set();
const brokenFragments = new Set();
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const from = `/${relative(DIST, f)}`;
  for (const m of html.matchAll(/href="((?:\/|#)[^"]*)"/g)) {
    const href = m[1];
    // A bare "#frag" points at the current page; "/path/#frag" at another.
    const target = href.startsWith('#') ? f : resolve(href);
    if (!href.startsWith('#')) {
      linkCount++;
      if (!existsSync(target)) {
        broken.add(`${href}  (from ${from})`);
        continue;
      }
    }
    const frag = href.split('#')[1];
    if (!frag) continue;
    fragmentCount++;
    if (!idCache.has(target)) idCache.set(target, idsOf(target));
    if (!idCache.get(target).has(decodeURIComponent(frag))) {
      brokenFragments.add(`${href}  (from ${from})`);
    }
  }
}
console.log(`\nInternal links: ${linkCount} checked, ${broken.size} broken`);
for (const b of broken) note(`broken internal link: ${b}`);
// An anchor pointing at no such id is a broken link that a file-existence check
// cannot see, so check the fragment against the ids the target page offers.
console.log(`Link fragments: ${fragmentCount} checked, ${brokenFragments.size} broken`);
for (const b of brokenFragments) note(`broken #fragment: ${b}`);

// ---- 5. per-page structure ----
console.log('\nPer-page structure:');
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const url = '/' + relative(DIST, f).replace(/index\.html$/, '');
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  const title = /<title>(.*?)<\/title>/.exec(html)?.[1];
  const desc = /<meta name="description"/.test(html);
  const canonical = /<link rel="canonical"/.test(html);
  // redirect stubs are intentionally bare
  const isStub = /http-equiv="refresh"/.test(html);
  if (isStub) continue;
  const issues = [];
  if (h1 !== 1) issues.push(`${h1} h1`);
  if (!title) issues.push('no title');
  if (!desc) issues.push('no description');
  if (!canonical) issues.push('no canonical');
  if (issues.length) note(`${url}: ${issues.join(', ')}`);
}

// ---- 6. images have intrinsic dimensions (no layout shift) ----
let imgs = 0;
let noDim = 0;
for (const f of htmlFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/<img\b[^>]*>/g)) {
    imgs++;
    if (!/\bwidth=/.test(m[0]) || !/\bheight=/.test(m[0])) {
      noDim++;
      note(`img without width/height in /${relative(DIST, f)}: ${m[0].slice(0, 90)}`);
    }
  }
}
console.log(`Images: ${imgs} total, ${noDim} missing intrinsic dimensions`);

// ---- 7. no external origins (privacy / CSP posture) ----
const origins = new Set(
  [...allHtml.matchAll(/(?:src|href)="https?:\/\/([^/"]+)/g)].map((m) => m[1]),
);
const ASSET_ORIGINS = [...origins].filter((o) => /gstatic|googleapis|cdn|jsdelivr|unpkg/.test(o));
console.log(`External asset origins: ${ASSET_ORIGINS.length ? ASSET_ORIGINS.join(', ') : 'none'}`);
if (ASSET_ORIGINS.length) note(`external asset origins present: ${ASSET_ORIGINS.join(', ')}`);

// ---- 8. JS weight ----
const js = files.filter((f) => f.endsWith('.js'));
const jsBytes = js.reduce((n, f) => n + statSync(f).size, 0);
const cssBytes = cssFiles.reduce((n, f) => n + statSync(f).size, 0);
console.log(
  `Bundles: ${js.length} JS (${(jsBytes / 1024).toFixed(1)} KB), ${cssFiles.length} CSS (${(cssBytes / 1024).toFixed(1)} KB)`,
);

console.log('\n' + '='.repeat(60));
if (problems.length === 0) {
  console.log('AUDIT CLEAN — no problems found.');
} else {
  console.log(`${problems.length} problem(s):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exitCode = 1;
}
