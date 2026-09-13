---
title: A new website, without the theme
date: 2026-09-13
description: Why I left al-folio after two years, what replaced it, and the two things I refused to break along the way.
tags: websites
featured: true
---

This site used to run on [al-folio](https://github.com/alshedivat/al-folio), a Jekyll theme for academics. I genuinely enjoyed being part of that ecosystem: eight of my pull requests are merged into it, covering the citation count, the bibliography, the image pipeline and the repositories page, and I built [a conference-site variant](https://github.com/dfuchss/al-folio-conf) on top of it. It served me well. But somewhere along the way the project stopped feeling like _my_ website and started feeling like a theme I was maintaining.

So I rebuilt it from scratch. Same content, same URLs, entirely different machinery.

<figure class="compare">
  <div class="compare-pair">
    <a href="/assets/img/posts/new-website/before.webp">
      <img
        src="/assets/img/posts/new-website/before.webp"
        alt="The old al-folio homepage: centred column, orange links, dropdown navigation."
        width="1440"
        height="666"
        loading="lazy"
      />
    </a>
    <a href="/assets/img/posts/new-website/after.webp">
      <img
        src="/assets/img/posts/new-website/after.webp"
        alt="The new homepage: left-aligned, monospace accents, a row of statistics."
        width="1440"
        height="666"
        loading="lazy"
      />
    </a>
  </div>
  <figcaption>The same page before and after. Left: al-folio. Right: what replaced it. Click either for full size.</figcaption>
</figure>

## Why I moved

Not "Jekyll is slow". Two things brought the maintenance bill into view.

**The theme went modular.** al-folio v1.0 split itself into a core gem plus a set of `al_*` plugin gems. Before that, customising a fork was easy in the way forks are easy: edit the Liquid file, pull upstream, let git resolve the merge, deal with the occasional conflict. Afterwards the files I had been editing lived inside gems I did not control. In February I [asked how customisation was meant to work](https://github.com/alshedivat/al-folio/discussions/3545) — my worry being that a one-line tweak would now mean forking a module, building a gem and releasing it, and that I would end up maintaining several forks for a handful of small changes. The answer, that local overrides should cover most cases, arrived three months later. By then my `Gemfile` pinned **18 `al_*` gems to exact versions**, and two modules had been pulled in as **git subtrees by a shell script**, because tracking upstream on files I needed to touch left no better option.

**And some changes simply take a while.** In February I asked for one of those vendored modules to be [bumped a version](https://github.com/alshedivat/al-folio/issues/3535), and wrote [the pull request](https://github.com/george-gca/jekyll-socials/pull/8) for the change behind it — support for more icon sets. The issue was picked up by the stale bot rather than by a person and closed in May; the pull request is still open. I want to be clear that this is nobody's failing: these are volunteer projects, my request was small, and plenty of my other reports were handled quickly and kindly. But it is the moment the shape of the thing became clear to me. A one-line change to my own website now had someone else's release process in front of it.

The rest is the sediment that collects when a fork lives inside a theme:

- **146 gems** in `Gemfile.lock`, of which **41** were Jekyll plugins — one pulled straight from a git URL, two path-based local modules.
- The theme core **vendored as a git subtree** in `_modules/al-folio-core`: 143 files, kept in sync by that shell script.
- The homepage pulled **25 separate JS and CSS files**, two of them from third-party origins. That came to **1.2 MB of JavaScript** and 222 KB of CSS, for a page whose only interactive elements were a navigation dropdown and a theme switch.
- **18 GitHub Actions workflows**, most of which existed to maintain the fork rather than the site. Two were still gated to `alshedivat/al-folio`, so they had never once run here.

Every design decision I cared about lived inside theme internals. That is a fine trade when you want a site _now_. It is a bad trade two years in.

## What it is now

[Astro](https://astro.build/) with TypeScript, and a design written by hand. No UI framework, no CSS framework, no theme.

I deliberately did **not** adopt one of the perfectly good Astro academic templates. That would have been faster, and it would have recreated exactly the situation I was leaving — someone else's abstractions, someone else's design decisions, my content as a guest.

The result:

|                            | before                   | after                        |
| -------------------------- | ------------------------ | ---------------------------- |
| Dependencies               | 146 gems, 41 plugins     | **12 npm packages**          |
| Homepage JS/CSS requests   | 25                       | **1**                        |
| Homepage JavaScript        | 1.2 MB across 17 scripts | **0 files**                  |
| Homepage total weight      | 1.71 MB                  | **115 KB**                   |
| Third-party origins        | 2                        | **0**                        |
| Total CSS                  | 222 KB on the homepage   | **40 KB** for the whole site |
| Workflows                  | 18                       | **3**                        |
| Build time                 | tens of seconds          | **~1 s** for 35 pages        |
| Site weight excluding PDFs | —                        | **3.6 MB**                   |

The JavaScript on this site is inlined and never exceeds **1.6 KB** on any page, and every piece of it is optional. The publication filter, the blog tag filter and the BibTeX copy buttons all ship `hidden` and are revealed by their own scripts, so you never get a dead control. The blog tags are ordinary links to tag pages that JavaScript upgrades into in-place filters. Collapsible sections are `<details>`. Scroll reveals are a no-op when JavaScript is off or when you have asked for reduced motion.

Fonts are self-hosted. The old site already went to the trouble of downloading DOI badge images at build time to avoid hotlinking them, though a badge script and a zoom library still came from two other origins. This page makes **zero** requests to anyone but this domain.

## The publication list is generated, properly

All 38 publications come from a single `papers.bib` parsed at build time into a typed content collection. Two details I am happy about:

Astro's `reference()` turns data errors into build failures. A venue abbreviation with no entry in `venues.yml`, a conference page pointing at a bib key that does not exist — the build stops. Under Jekyll those were silent Liquid lookups that rendered blank.

The loader also **checks that every referenced PDF exists on disk**. A publication list that links a missing paper is worse than useless, and now it cannot ship.

While migrating I found three entries with a duplicate `month` field, and one whose title and booktitle both contained a double-escaped `\&amp;` that only rendered correctly by accident, through Jekyll's HTML pipeline. Both are fixed.

I also added Highwire `citation_*` meta tags and JSON-LD to the paper pages. The old site emitted neither — which means Google Scholar was never given a clean pointer to the PDFs hosted right here.

## The two things I would not break

**Every publication PDF URL.** These are cited in published papers and indexed by Scholar, DBLP and KITopen. All 35 files are copied byte-for-byte and their SHA-256 hashes are asserted on every single build.

**The Matrix delegation.** `fuchss.org` serves `/.well-known/matrix/server`, `/client` and `/support`, which is how federation finds my homeserver. Those files have nothing whatsoever to do with the website — which is exactly what makes them dangerous. Break them and the site looks perfect while federation quietly stops working.

The rewrite came close to proving the point. It carried the three delegation files across and pinned their hashes — and left behind the `.htaccess` sitting beside them, which supplies the `Access-Control-Allow-Origin` header the Matrix spec requires on the `client` file. Nothing complained, because the hash list covered those three files and not the directory they live in. It never shipped in that state, but only because I happened to catch it; the file is back, and it is now the fourth hash in that list.

That is the whole lesson, really: a check only protects what it covers, and the gap is never where you are looking. So the deploy pipeline runs `npm run verify`, which asserts those two sets of hashes, then 50 feature contracts and a structural audit — undefined CSS custom properties, text contrast, 658 internal links and 38 `#fragment` anchors, images without intrinsic dimensions, pages with the wrong number of `<h1>`s.

The old repository could not tell me whether a change had broken any of that. This one refuses to deploy if it has.

## Odds and ends

The blog you are reading is back. I had disabled it at some point — `_pages/blog.md` renamed to `.blog.md`, so no index was generated and `/blog/` returned a 403 — with eight of my own posts parked unpublished in a dot-prefixed directory alongside it. Rebuilding the site was the right moment to re-enable the whole thing, so they are all here now. Two of the theme's own demo posts had stayed reachable that entire time.

Images went through Astro's pipeline on the way over. One project logo was a 1.1 MB PNG rendered at 72 pixels; it is now 3 KB of WebP, with a 9 KB variant for retina screens. That project's page dropped from about **9 MB to 1.25 MB**.

The site is dark only. There was a light theme for a while, resolved before first paint so it never flashed — but maintaining two sets of colour tokens for a personal site turned out to be exactly the kind of work I had just finished removing.

## Would I recommend it?

If you want an academic site this afternoon, use a theme. al-folio is genuinely good, the people around it were generous with their time, and it served this site well for two years. Leaving it is not a verdict on the project — it is a different answer to a different question.

If you have been running one for years, keep hitting its edges, and the thing you actually want is _yours_ — the rewrite is smaller than you think. The content was 38 bib entries, 10 projects, 4 paper pages, eight posts and a handful of YAML files. Everything else was machinery.
