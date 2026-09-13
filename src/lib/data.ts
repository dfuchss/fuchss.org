/**
 * Typed access to the YAML data files in `src/data/`.
 *
 * Imported with Vite's `?raw` so the content is inlined at build time. An
 * earlier version read these with `fs` + `import.meta.url`, which resolved
 * against the bundled chunk rather than the source tree and broke the
 * prerender step. Inlining sidesteps path resolution entirely and gives HMR
 * for free.
 */
import { parse } from 'yaml';

import citationsRaw from '../data/citations.yml?raw';
import socialsRaw from '../data/socials.yml?raw';
import cvRaw from '../data/cv.yml?raw';
import repositoriesRaw from '../data/repositories.yml?raw';
import languageColorsRaw from '../data/language_colors.yml?raw';
import githubMetadata from '../data/github-metadata.json';

export type CitationsFile = {
  metadata: { last_updated: string };
  papers: Record<string, { citations?: number; title?: string; year?: number }>;
};

export type Socials = {
  orcid_id: string;
  scholar_userid: string;
  dblp_url: string;
  semanticscholar_id?: string;
  github_username: string;
  linkedin_username: string;
  codeberg?: { title: string; url: string };
  pgp_fingerprint: string;
};

export type Repositories = {
  github_users?: string[];
  github_repos?: string[];
  zenodo_repos?: { name: string; doi: string }[];
};

export type GithubMetadata = {
  fetched: string;
  users: Record<
    string,
    {
      login: string;
      name: string | null;
      bio: string | null;
      followers: number;
      publicRepos: number;
      htmlUrl: string;
      avatarUrl: string;
    }
  >;
  repos: Record<
    string,
    {
      fullName: string;
      description: string | null;
      stars: number;
      forks: number;
      language: string | null;
      license: string | null;
      archived: boolean;
      htmlUrl: string;
      pushedAt: string | null;
    }
  >;
};

/**
 * Committed by `scripts/fetch-github-metadata.mjs`, not fetched at build time —
 * the build stays hermetic and offline-buildable.
 */
export const github = githubMetadata as GithubMetadata;

export const citations = parse(citationsRaw) as CitationsFile;
export const socials = parse(socialsRaw) as Socials;
export const repositories = parse(repositoriesRaw) as Repositories;
export const languageColors = parse(languageColorsRaw) as Record<string, string>;
// cv.yml is deliberately left loosely typed here; src/lib/cv.ts validates it.
export const cvRawParsed = parse(cvRaw) as unknown;
