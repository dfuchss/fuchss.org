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

const projects = defineCollection({
  loader: glob({ base: 'src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.enum(['research', 'matrix', 'misc']),
      order: z.number().int().default(100),
      redirect: z.url().optional(),
      logo: image().optional(),
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
const toArray = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

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

export const collections = { venues, authors, publications, projects, conferences, posts };
