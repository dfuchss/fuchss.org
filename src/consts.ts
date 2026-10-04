import { cv } from './lib/cv.ts';

// The name comes from src/data/cv.yml; the last word is the family name.
const [last, ...given] = cv.name.split(' ').reverse();

export const SITE = {
  url: 'https://fuchss.org',
  title: cv.name,
  lang: 'en',
  author: { first: given.reverse().join(' '), last },
} as const;

export type Section =
  'home' | 'publications' | 'projects' | 'repositories' | 'conferences' | 'cv' | 'blog';
