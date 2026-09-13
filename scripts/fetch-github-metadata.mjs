#!/usr/bin/env node
/**
 * Port of the old `_plugins/github-metadata.rb`.
 *
 * That plugin hit the GitHub API during every Jekyll build, which made the build
 * non-hermetic: an API outage, a rate limit, or an expired token would either
 * break the deploy or silently render zeros. Here the fetch is a separate step
 * whose output (src/data/github-metadata.json) is committed, exactly like the
 * daily Google Scholar citation refresh. The build itself never touches the
 * network.
 *
 * Usage:  node scripts/fetch-github-metadata.mjs
 *         GITHUB_TOKEN=… node scripts/fetch-github-metadata.mjs   (higher rate limit)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const cfg = parse(readFileSync('src/data/repositories.yml', 'utf8'));
const token = process.env.GITHUB_TOKEN ?? process.env.PAT;

const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'fuchss.org-build',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

const out = { fetched: new Date().toISOString().slice(0, 10), users: {}, repos: {} };

for (const login of cfg.github_users ?? []) {
  const u = await gh(`/users/${login}`);
  out.users[login] = {
    login: u.login,
    name: u.name,
    bio: u.bio,
    followers: u.followers,
    publicRepos: u.public_repos,
    htmlUrl: u.html_url,
    avatarUrl: u.avatar_url,
  };
  console.log(`  user  ${login}`);
}

for (const full of cfg.github_repos ?? []) {
  const r = await gh(`/repos/${full}`);
  out.repos[full] = {
    fullName: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    license: r.license?.spdx_id ?? null,
    archived: r.archived,
    htmlUrl: r.html_url,
    pushedAt: r.pushed_at?.slice(0, 10) ?? null,
  };
  console.log(`  repo  ${full.padEnd(26)} ★${r.stargazers_count}  ${r.language ?? '—'}`);
}

writeFileSync('src/data/github-metadata.json', JSON.stringify(out, null, 2) + '\n');
console.log(`\nwrote src/data/github-metadata.json (${Object.keys(out.repos).length} repos)`);
if (!token) console.log('note: run with GITHUB_TOKEN for a higher rate limit');
