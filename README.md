# fuchss.org

Personal website of Dominik Fuchß — researcher at the Karlsruhe Institute of Technology.

Built with [Astro](https://astro.build/) and a hand-written design. No UI framework, no CSS
framework, no theme. Previously ran on al-folio (Jekyll); see
`/blog/2026/09/13/new-website/` for why it does not any more.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321, hot reload
npm run build      # → dist/
npm run preview    # serves dist/ the way the web server does
npm run check      # astro check + prettier --check
npm run verify     # byte-identity invariants (PDFs + Matrix delegation)
```

## Layout

```
src/
  content.config.ts     collections + Zod schemas
  loaders/bibtex.ts     papers.bib → typed publications collection
  data/                 papers.bib, cv.yml, citations.yml, venues.yml, authors.yml,
                        repositories.yml, socials.yml, github-metadata.json, …
  content/              projects/ (10), conferences/ (4), posts/
  components/ layouts/ pages/ styles/
public/                 copied verbatim — the stable URL surface
  assets/pdf/           35 publication PDFs; these URLs are permanent
  .well-known/matrix/   Matrix homeserver delegation for the domain
scripts/                data refresh + verification
verification/           committed SHA-256 baselines for the PDFs and the Matrix delegation
```

## Two things that must not break

**`public/assets/pdf/**`** — cited in published papers and indexed by Google Scholar, DBLP and
KITopen. Never rename, move, or run these through any tool.

**`public/.well-known/matrix/{server,client,support}` and the `.htaccess` beside them** —
federation for the `fuchss.org` Matrix homeserver depends on these bytes, and the `.htaccess`
carries the `Access-Control-Allow-Origin: *` that the Matrix spec requires on the `client` file.
Nothing to do with the website, which is what makes breaking them easy to miss.

Both are pinned by SHA-256 in `verification/` and asserted by `npm run verify`, which the deploy
workflow runs before publishing. The URL-parity checks that guarded the migration have been
retired now that the rewrite is done, as have the structural and feature audits carried over
from the al-folio site — they pinned counts that change with ordinary content edits.

## Content tasks

| Task                       | How                                                                               |
| -------------------------- | --------------------------------------------------------------------------------- |
| Add a publication          | append to `src/data/papers.bib` (needs `abbr`; `pdf` for the PDF link)            |
| Add a venue badge          | add the abbreviation to `src/data/venues.yml` — an unknown `abbr` fails the build |
| Add a project              | new `.md` in `src/content/projects/`, images under `src/assets/projects/<slug>/`  |
| Add a post                 | new `src/content/posts/YYYY-MM-DD-slug.md`; the filename sets the permalink       |
| Update the CV              | edit `src/data/cv.yml`                                                            |
| Refresh citations          | daily workflow, or `python scripts/update_scholar_citations.py`                   |
| Check bib against Crossref | `python scripts/update_bib.py` (add `--write` to apply)                           |
| Refresh GitHub stars       | `node scripts/fetch-github-metadata.mjs` (weekly workflow)                        |
| Reviewable page snapshots  | `npm run preview:files` → `preview/*.html`, self-contained                        |

## Deployment

`.github/workflows/deploy.yml` builds on push to `main`, runs `npm run verify`, and publishes
`dist/` to the `gh-pages` branch. The Apache2 server hosting `fuchss.org` pulls that branch via
webhook — GitHub Pages does not serve this domain, which is why the `.htaccess` files matter.
