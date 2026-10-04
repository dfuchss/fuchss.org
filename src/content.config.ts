import { defineCollection, reference } from 'astro:content';
import { z } from 'zod';
import { glob, file } from 'astro/loaders';
import { bibtexLoader } from './loaders/bibtex.ts';

/** Venue badge definitions: abbr → brand colour + optional series URL. */
const venues = defineCollection({
  loader: file('src/data/venues.yml'),
  schema: z.object({
    url: z.url().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    abbr: z.string().optional(), // long name, e.g. SE → "Software Engineering"
  }),
});

/** Co-authors referenced by the conference pages, with ORCIDs. */
const authors = defineCollection({
  loader: file('src/data/authors.yml'),
  schema: z.object({
    name: z.string(),
    orcid: z.string().nullable().default(null),
  }),
});

const publications = defineCollection({
  loader: bibtexLoader({ file: 'src/data/papers.bib', pdfRoot: 'public/assets/pdf' }),
  schema: z.object({
    key: z.string(),
    type: z.string(),
    title: z.string(),
    authors: z.array(z.object({ first: z.string(), last: z.string() })).min(1),
    year: z.number().int(),
    month: z.number().int().min(1).max(12).optional(),
    // reference() turns a missing venues.yml entry into a build failure
    abbr: reference('venues'),
    booktitle: z.string().optional(),
    journal: z.string().optional(),
    school: z.string().optional(),
    institution: z.string().optional(),
    publisher: z.string().optional(),
    series: z.string().optional(),
    volume: z.string().optional(),
    number: z.string().optional(),
    pages: z.string().optional(),
    location: z.string().optional(),
    doi: z.string().optional(),
    url: z.url().optional(),
    keywords: z.array(z.string()).default([]),
    googleScholarId: z.string().optional(),
    pdfUrl: z.string().optional(),
    bibtex: z.string(),
    searchText: z.string(),
  }),
});

/** Project categories; a project's `category` references one by id. */
const projectGroups = defineCollection({
  loader: file('src/data/project-groups.yml'),
  schema: z.object({
    order: z.number().int(),
    label: z.string(),
    short: z.string(),
    blurb: z.string(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: 'src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: reference('projectGroups'),
      order: z.number().int().default(100),
      redirect: z.url().optional(),
      logo: image().optional(),
    }),
});

const link = z.object({ label: z.string(), href: z.string(), section: z.string().optional() });
/** Singular/plural pair; the template picks one and fills in {count}. */
const plural = z.object({ one: z.string(), other: z.string() });

/**
 * One Markdown file per top-level page (src/content/pages/<id>.md). Frontmatter
 * holds meta and short strings, the body holds the rich intro. Fields beyond
 * title/description are specific to a page and optional.
 */
const pages = defineCollection({
  loader: glob({ base: 'src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    // site/site
    brand: z.string().optional(),
    brandPrompt: z.string().optional(),
    // site-wide: nav.md, footer.md and 404.md share a list of links
    links: z.array(link).optional(),
    // home
    statLabels: z
      .object({
        publications: z.string(),
        citations: z.string(),
        hIndex: z.string(),
        replicationPackages: z.string(),
      })
      .optional(),
    statNote: z.string().optional(),
    moreLinks: z
      .object({ publications: z.string(), projects: z.string(), posts: z.string(), cv: z.string() })
      .optional(),
    staffLink: z.string().optional(),
    papersIntro: z.string().optional(),
    contact: z
      .object({ intro: z.string(), pgpNote: z.string(), officeNote: z.string() })
      .optional(),
    // projects, blog, publications (ledes may hold {placeholders})
    lede: z.string().optional(),
    backLink: z.string().optional(),
    counts: z.string().optional(),
    noPosts: z.string().optional(),
    tagTitle: z.string().optional(),
    tagDescription: z.string().optional(),
    feedTitle: z.string().optional(),
    feedDescription: z.string().optional(),
    tagCount: plural.optional(),
    older: z.string().optional(),
    newer: z.string().optional(),
    metrics: z.array(z.object({ label: z.string(), sub: z.string() })).optional(),
    noResults: z.string().optional(),
    // repositories
    capturedNote: z.string().optional(),
    replicationIntro: z.string().optional(),
    // cv
    present: z.string().optional(),
    since: z.string().optional(),
    teachingCount: z.string().optional(),
    assistantships: z.string().optional(),
    earlierCourses: z.string().optional(),
    // site/publication.md
    pdf: z.string().optional(),
    doi: z.string().optional(),
    paperPage: z.string().optional(),
    bibtex: z.string().optional(),
    readPdf: z.string().optional(),
    moreAuthors: z.string().optional(),
    citations: plural.optional(),
    publishedAt: z.string().optional(),
    toBePublishedAt: z.string().optional(),
    fallbackDescription: z.string().optional(),
    figureLabel: z.string().optional(),
    linkLabels: z.record(z.string(), z.string()).optional(),
    // impressum
    kicker: z.string().optional(),
    email: z.string().optional(),
  }),
});

const conferences = defineCollection({
  loader: glob({ base: 'src/content/conferences', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publication: reference('publications'),
    authors: z.array(reference('authors')).min(1),
    conferenceName: z.string(),
    conferenceUrl: z.url().optional(),
    alreadyPublished: z.boolean().default(true),
    order: z.number().int(),
    figure: z
      .object({
        src: z.string(),
        alt: z.string(),
        // these diagrams are light-background SVGs and need a white plate
        plate: z.boolean().default(true),
      })
      .optional(),
    links: z
      .object({
        paper: z.record(z.string(), z.url()).optional(),
        replication: z.record(z.string(), z.url()).optional(),
      })
      .default({}),
  }),
});

/** Front matter in the existing posts uses both `tags: x` and `tags: [x, y]`. */
const toArray = (value: string | string[]) => (Array.isArray(value) ? value : [value]);

const posts = defineCollection({
  loader: glob({ base: 'src/content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z
      .union([z.string(), z.array(z.string())])
      .transform(toArray)
      .default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  venues,
  authors,
  publications,
  projectGroups,
  projects,
  conferences,
  posts,
  pages,
};
