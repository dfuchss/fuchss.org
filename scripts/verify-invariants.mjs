#!/usr/bin/env node
/**
 * The two things on fuchss.org that must never change, asserted byte for byte.
 *
 * Neither has anything to do with how the site looks, which is exactly why
 * breaking them is easy to miss: the pages would render perfectly while the
 * damage sat somewhere nobody looks.
 *
 *   1. The publication PDFs. Their URLs are printed in published papers and
 *      indexed by Google Scholar, DBLP and KITopen. They cannot move and their
 *      bytes cannot change.
 *   2. The Matrix homeserver delegation, including the `.htaccess` beside it
 *      that carries the `Access-Control-Allow-Origin: *` the Matrix spec
 *      requires on the `client` file. The rewrite dropped that `.htaccess` once
 *      precisely because it was not pinned here.
 *
 * Checks the filesystem rather than HTTP on purpose: `astro preview` and Vite's
 * static middleware do not serve dotfile directories, so `/.well-known/matrix/*`
 * 404s there even though the files are present and correct in `dist/`. Apache2 —
 * which is what actually serves fuchss.org — has no such behaviour. Reading
 * `dist/` directly tests what gets deployed, not the dev server's quirks.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DIST = 'dist';
const failures = [];
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/**
 * Compare `dist/` against committed sha256 baselines rather than against another
 * directory in the tree, so an accidental edit to `public/` is caught too, not
 * just a build bug.
 */
function checkBaseline(file, label) {
  const lines = readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'));
  let checked = 0;
  for (const line of lines) {
    const [want, rel] = line.split(/\s+/);
    const out = `${DIST}/${rel}`;
    if (!existsSync(out)) failures.push(`${rel} absent from dist/`);
    else if (sha(out) !== want) failures.push(`${rel} does not match the ${label} baseline`);
    else checked++;
  }
  console.log(`${label} verified: ${checked}/${lines.length}`);
}

checkBaseline('verification/wellknown-sha256.txt', 'Matrix delegation');
checkBaseline('verification/pdf-sha256.txt', 'publication PDFs');

// Harmless here since Apache2 serves the site, but free insurance if it ever
// ends up behind GitHub Pages, which would otherwise skip /_astro/.
if (!existsSync(`${DIST}/.nojekyll`)) failures.push('dist/.nojekyll missing');

if (failures.length) {
  console.error(`\nFAILED invariants (${failures.length}):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('\nAll hard invariants OK (matrix delegation + PDF byte-identity + .nojekyll).');
