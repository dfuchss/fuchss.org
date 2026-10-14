import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'zod';
import { parse as parseYaml } from 'yaml';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, posix, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  absoluteLink,
  anchorLink,
  collectImages,
  repoPath,
  rewriteImages,
  rewriteLinks,
  transformReadme,
} from './readme-transform.ts';

/** The `readme:` block of a project file: where its upstream README lives and what to keep. */
export const readmeSource = z.object({
  repo: z.string().regex(/^[\w.-]+(\/[\w.-]+)+$/),
  host: z.enum(['github', 'gitlab']).default('github'),
  ref: z.string().default('HEAD'),
  path: z.string().default('README.md'),
  omit: z.array(z.string()).default([]),
  // Whitelist of headings; `omit` still applies inside what it keeps.
  include: z.array(z.string()).optional(),
});
type ReadmeSource = z.infer<typeof readmeSource>;

const TIMEOUT_MS = 15_000;
const RETRIES = 2;
/**
 * How long a local build trusts the cached repository metadata without
 * asking again. Anonymous API calls are capped at 60 an hour, and `astro
 * check`, `astro build` and every dev restart each sync all projects.
 */
const API_FRESH_MS = 24 * 60 * 60 * 1000;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|tiff?|apng)$/i;
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

/** Per-project `index.json`: URL → cached file, its ETag, and when it was last confirmed. */
type CacheIndex = Record<string, { file: string; etag?: string; checked?: number }>;

const forge = (source: ReadmeSource) => {
  const web = `https://${source.host === 'github' ? 'github.com' : 'gitlab.com'}/${source.repo}`;
  return source.host === 'github'
    ? {
        web,
        raw: `https://raw.githubusercontent.com/${source.repo}/${source.ref}/`,
        blob: `${web}/blob/${source.ref}/`,
      }
    : { web, raw: `${web}/-/raw/${source.ref}/`, blob: `${web}/-/blob/${source.ref}/` };
};

/** Split a Markdown file into its YAML frontmatter and its body. */
function splitFrontmatter(text: string, file: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${file}: no frontmatter`);
  return { data: (parseYaml(match[1]) ?? {}) as Record<string, unknown>, body: match[2].trim() };
}

export function readmeLoader(opts: { base: string }): Loader {
  return {
    name: 'readme',
    load: async (context: LoaderContext) => {
      const { config, store, parseData, renderMarkdown, generateDigest, logger, watcher } = context;
      const root = fileURLToPath(config.root);
      const baseDir = join(root, opts.base);
      // node_modules/.astro/readmes/: already ignored by git, prettier and
      // Vite's watcher, and survives between builds so ETags can do their job.
      const cacheDir = fileURLToPath(new URL('readmes/', config.cacheDir));
      // In CI a stale page must fail the build; locally the last good copy will do.
      const strict = !!process.env.CI && process.env.CI !== 'false';
      const token = process.env.GITHUB_TOKEN;
      const stats = { fetched: 0, unchanged: 0, stale: 0, images: 0 };

      /**
       * Fetch `url` into `dir`, revalidating with the ETag from the last run.
       * Returns the cached file's absolute path. `name` without an image
       * extension gets one from the Content-Type. A copy confirmed less than
       * `freshMs` ago is used without a request.
       */
      async function fetchCached(
        url: string,
        dir: string,
        index: CacheIndex,
        name: string,
        headers: Record<string, string> = {},
        freshMs = 0,
      ): Promise<string> {
        const known = index[url];
        const cached = known && existsSync(join(dir, known.file)) ? known : undefined;
        if (cached && Date.now() - (cached.checked ?? 0) < freshMs) {
          stats.unchanged++;
          return join(dir, cached.file);
        }
        let lastError: unknown;
        for (let attempt = 0; attempt <= RETRIES; attempt++) {
          try {
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'fuchss.org-build',
                ...headers,
                ...(cached?.etag ? { 'If-None-Match': cached.etag } : {}),
              },
              signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            if (response.status === 304 && cached) {
              index[url] = { ...cached, checked: Date.now() };
              stats.unchanged++;
              return join(dir, cached.file);
            }
            if (!response.ok) {
              const error = new Error(`HTTP ${response.status}`);
              // Only server-side trouble is worth another try; a 404 stays a 404.
              if (response.status < 500 && response.status !== 429) {
                attempt = RETRIES;
              }
              throw error;
            }
            const type = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
            const file =
              IMAGE_EXT.test(name) || !EXT_BY_TYPE[type] ? name : name + EXT_BY_TYPE[type];
            const bytes = Buffer.from(await response.arrayBuffer());
            // Write-then-rename: Vite never sees a half-written image.
            await writeFile(join(dir, `${file}.tmp`), bytes);
            await rename(join(dir, `${file}.tmp`), join(dir, file));
            index[url] = {
              file,
              etag: response.headers.get('etag') ?? undefined,
              checked: Date.now(),
            };
            stats.fetched++;
            return join(dir, file);
          } catch (error) {
            lastError = error;
          }
        }
        const reason = lastError instanceof Error ? lastError.message : String(lastError);
        if (strict || !cached) throw new Error(`could not fetch ${url}: ${reason}`);
        logger.warn(`could not fetch ${url} (${reason}); using the cached copy`);
        stats.stale++;
        return join(dir, cached.file);
      }

      /** Fetch, transform and assemble one project's README tail and local intro. */
      async function upstream(id: string, source: ReadmeSource, localBody: string) {
        const dir = join(cacheDir, id);
        await mkdir(dir, { recursive: true });
        const indexPath = join(dir, 'index.json');
        const previous: CacheIndex = existsSync(indexPath)
          ? JSON.parse(await readFile(indexPath, 'utf8'))
          : {};
        // Only what this run asks for is carried over, so an image dropped
        // upstream leaves the index here and its file goes in `prune`.
        const index: CacheIndex = {};
        const get = (url: string, name: string, headers?: Record<string, string>, freshMs = 0) => {
          if (previous[url]) index[url] = previous[url];
          return fetchCached(url, dir, index, name, headers, freshMs);
        };
        const { web, raw, blob } = forge(source);
        const warn = (message: string) => logger.warn(`${id}: ${message}`);
        // An explicit `include: []` means the local body replaces the README.
        const useReadme = source.include?.length !== 0;
        const github = source.host === 'github';

        const [readmeFile, repoFile] = await Promise.all([
          useReadme ? get(raw + source.path, 'README.md') : undefined,
          // The README and images come from the raw host; the API is only
          // asked for `archived` and the licence.
          get(
            github
              ? `https://api.github.com/repos/${source.repo}`
              : `https://gitlab.com/api/v4/projects/${encodeURIComponent(source.repo)}?license=true`,
            'repo.json',
            {
              Accept: github ? 'application/vnd.github+json' : 'application/json',
              ...(github && token ? { Authorization: `Bearer ${token}` } : {}),
            },
            strict ? 0 : API_FRESH_MS,
          ).catch((error: unknown) => {
            // Only a chip and a line depend on it, so locally an exhausted
            // anonymous rate limit costs those, not the build.
            if (strict) throw error;
            warn(
              `${error instanceof Error ? error.message : error}; assuming not archived, no licence`,
            );
            return undefined;
          }),
        ]);
        const repo = repoFile
          ? (JSON.parse(await readFile(repoFile, 'utf8')) as {
              archived?: boolean;
              license?: { spdx_id?: string; key?: string } | null;
            })
          : {};
        // GitLab projects are never treated as archived.
        const archived = github && repo.archived === true;
        const licenseId = github ? repo.license?.spdx_id : repo.license?.key?.toUpperCase();
        const license = licenseId && licenseId !== 'NOASSERTION' ? licenseId : null;
        // An org profile README (`<org>/.github`) belongs to the org, not the repo.
        const name = source.repo.split('/').pop();
        const sourceInfo = {
          host: github ? ('GitHub' as const) : ('GitLab' as const),
          url: github && name === '.github' ? web.replace(/\/\.github$/, '') : web,
          license,
        };

        let md = readmeFile
          ? transformReadme(
              await readFile(readmeFile, 'utf8'),
              { hasIntro: localBody !== '', ...source },
              warn,
            )
          : '';
        // The local body is written as if it were part of the README: relative
        // images and links are repo paths. Site-absolute `/…` stays on this site.
        let intro = localBody;
        const siteAbsolute = (href: string) => href.startsWith('/') && !href.startsWith('//');

        // Download every image, absolute ones too, so nothing on the page is
        // hotlinked and Astro can optimize all of them.
        const images = new Map<string, string>();
        const introImages = collectImages(intro).filter((src) => !siteAbsolute(src));
        await Promise.all(
          [...new Set([...collectImages(md), ...introImages])].map(async (src) => {
            if (src.startsWith('data:')) return;
            const url = /^https?:\/\//.test(src)
              ? src.replace(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/blob\//, '$1/raw/')
              : raw + repoPath(source.path, src);
            const base = decodeURIComponent(posix.basename(new URL(url).pathname)) || 'image';
            const hash = createHash('sha256').update(url).digest('hex').slice(0, 8);
            const name = `${hash}-${base.replace(/[^\w.-]+/g, '-')}`;
            const file = await get(url, name);
            // Relative to the entry's own file, which is what Astro resolves against.
            images.set(src, relative(baseDir, file).split(sep).join('/'));
            stats.images++;
          }),
        );
        md = rewriteImages(md, (src) => images.get(src));
        intro = rewriteImages(intro, (src) => (siteAbsolute(src) ? undefined : images.get(src)));
        md = rewriteLinks(md, (href) => absoluteLink(href, source.path, blob));
        intro = rewriteLinks(intro, (href) =>
          siteAbsolute(href) ? href : absoluteLink(href, source.path, blob),
        );

        await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
        const used = new Set(['index.json', ...Object.values(index).map((entry) => entry.file)]);
        const readmeUrl = source.path === 'README.md' ? web : blob + source.path;
        return { md, intro, archived, source: sourceInfo, readmeUrl, used, dir };
      }

      /** Build one store entry from a project file. */
      async function entry(fileName: string) {
        const id = fileName.replace(/\.md$/, '');
        const absPath = join(baseDir, fileName);
        const { data: frontmatter, body } = splitFrontmatter(
          await readFile(absPath, 'utf8'),
          fileName,
        );
        const fileURL = pathToFileURL(absPath);
        // The empty frontmatter keeps a leading `---` rule from being read as one.
        const wrap = (intro: string, tail: string) =>
          `---\n---\n${[intro, tail].filter(Boolean).join('\n\n')}\n`;
        let assemble = (tail: string) => wrap(body, tail);

        let md = assemble('');
        let extra: Record<string, unknown> | undefined;
        let cache: Awaited<ReturnType<typeof upstream>> | undefined;
        if (frontmatter.readme !== undefined) {
          const parsed = readmeSource.safeParse(frontmatter.readme);
          if (!parsed.success) throw new Error(`${fileName}: readme: ${parsed.error.message}`);
          cache = await upstream(id, parsed.data, body);
          extra = { archived: cache.archived, source: cache.source };
          const intro = cache.intro;
          assemble = (tail: string) => wrap(intro, tail);
          md = assemble(cache.md);
          // Anchors are checked against the ids the Markdown processor really
          // assigns, so a section that was omitted links to the forge instead.
          const { metadata } = await renderMarkdown(md, { fileURL });
          const ids = new Set(metadata?.headings?.map((heading) => heading.slug));
          const readmeUrl = cache.readmeUrl;
          md = assemble(rewriteLinks(cache.md, (href) => anchorLink(href, ids, readmeUrl)));
        }

        const data = await parseData({
          id,
          data: extra ? { ...frontmatter, ...extra } : frontmatter,
          filePath: absPath,
        });
        const rendered = await renderMarkdown(md, { fileURL });
        return {
          used: cache ? { dir: cache.dir, files: cache.used } : undefined,
          entry: {
            id,
            data,
            body: md,
            filePath: posix.join(opts.base, fileName),
            digest: generateDigest({ md, data }),
            rendered,
            assetImports: rendered.metadata?.imagePaths,
          },
        };
      }

      /** Delete cached files no project references any more. */
      async function prune(used: { dir: string; files: Set<string> }[]) {
        if (!existsSync(cacheDir)) return;
        const byDir = new Map(used.map((project) => [project.dir, project.files]));
        for (const name of await readdir(cacheDir)) {
          const dir = join(cacheDir, name);
          const keep = byDir.get(dir);
          if (!keep) {
            await rm(dir, { recursive: true, force: true });
            continue;
          }
          for (const file of await readdir(dir)) {
            if (!keep.has(file)) await rm(join(dir, file), { force: true });
          }
        }
      }

      const files = (await readdir(baseDir)).filter((name) => name.endsWith('.md')).sort();
      const results = await Promise.all(files.map(entry));
      // Cleared only once everything loaded, so a failed refresh in dev keeps the old pages.
      store.clear();
      for (const result of results) store.set(result.entry);
      await prune(results.flatMap((result) => (result.used ? [result.used] : [])));
      logger.info(
        `${results.filter((result) => result.used).length} READMEs, ${stats.images} images: ` +
          `${stats.fetched} downloaded, ${stats.unchanged} unchanged` +
          (stats.stale ? `, ${stats.stale} from cache after a failed fetch` : ''),
      );

      if (!watcher) return;
      watcher.add(baseDir);
      // Watch the loader too: the store is cached in `.astro/`, so a change to
      // the transform alone would otherwise leave the old pages in place.
      watcher.add(fileURLToPath(import.meta.url));
      watcher.add(fileURLToPath(new URL('./readme-transform.ts', import.meta.url)));
      const onChange = async (path: string) => {
        if (relative(baseDir, path) !== posix.basename(path) || !path.endsWith('.md')) return;
        try {
          const result = await entry(posix.basename(path));
          store.set(result.entry);
          logger.info(`reloaded ${result.entry.id}`);
        } catch (error) {
          logger.error(`${path}: ${error instanceof Error ? error.message : String(error)}`);
        }
      };
      watcher.on('change', onChange);
      watcher.on('add', onChange);
      watcher.on('unlink', (path: string) => {
        if (relative(baseDir, path) === posix.basename(path) && path.endsWith('.md')) {
          store.delete(posix.basename(path, '.md'));
        }
      });
    },
  };
}
