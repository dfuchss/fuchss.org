import { cvRawParsed } from './data.ts';

export type Experience = {
  company: string;
  position: string;
  url?: string;
  start_date: string;
  end_date?: string;
  summary?: string;
};
export type Education = {
  institution: string;
  location?: string;
  url?: string;
  studyType: string;
  start_date: string;
  end_date?: string;
  area?: string;
};
export type Award = { title: string; date: string | number; awarder?: string; url?: string };
export type Certificate = {
  name: string;
  date: string | number;
  issuer?: string;
  url?: string;
};
export type ProjectItem = {
  name: string;
  summary?: string;
  highlights?: string[];
  start_date?: string;
  url?: string;
};
export type Course = { course: string; type: string; semester: string; url?: string };
export type CommunityItem = { label: string; details?: string };

type Raw = {
  cv: {
    name: string;
    email: string;
    matrix: string;
    summary: string;
    sections: {
      Experience: Experience[];
      Education: Education[];
      Languages: { name: string; summary: string }[];
      Awards: Award[];
      Certificates: Certificate[];
      Projects: ProjectItem[];
      Teaching: Course[];
      Community: CommunityItem[];
      Research: { bullet: string }[];
    };
  };
};

const raw = cvRawParsed as Raw;
export const cv = raw.cv;
export const sections = raw.cv.sections;

/**
 * The Experience entry with no end date — the job currently held. The home
 * page links its `url` as the office page rather than repeating the address,
 * which is already in `cv.yml`.
 */
export const currentPosition = raw.cv.sections.Experience.find((e) => !e.end_date);

/** "2020-12-01" → "Dec 2020"; a bare "2020" stays "2020". */
export function formatDate(value?: string | number): string {
  if (value == null) return '';
  const s = String(value);
  if (/^\d{4}$/.test(s)) return s;
  const m = /^(\d{4})-(\d{2})/.exec(s);
  if (!m) return s;
  const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(
    new Date(`${m[1]}-${m[2]}-01T00:00:00Z`),
  );
  return `${month} ${m[1]}`;
}

export const dateRange = (start?: string | number, end?: string | number) =>
  `${formatDate(start)} — ${end ? formatDate(end) : 'present'}`;

/**
 * `Education[].area` holds raw HTML like `<b>Thesis:</b> 'Some Title'`.
 * Pull the title out so the template does not need `set:html`.
 */
export function thesisOf(area?: string): string | undefined {
  if (!area) return undefined;
  const m = /['‘’"“](.+)['‘’"“]/.exec(area);
  return m
    ? m[1]
    : area
        .replace(/<[^>]+>/g, '')
        .replace(/^\s*Thesis:\s*/, '')
        .trim() || undefined;
}

/**
 * `Community[].details` mixes plain text and markdown links, separated by `;`.
 * Parsed into structured parts rather than pulling in a markdown renderer for
 * three strings.
 */
export type DetailPart = { text: string; url?: string };
export function parseDetails(details?: string): DetailPart[] {
  if (!details) return [];
  return details
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(chunk);
      return m ? { text: m[1], url: m[2] } : { text: chunk };
    });
}

/** Teaching assistantships are numerous and secondary; group them separately. */
export function splitExperience(items: Experience[]) {
  const isTA = (e: Experience) => e.position === 'Teaching Assistant';
  return { main: items.filter((e) => !isTA(e)), assistantships: items.filter(isTA) };
}

/** A semester string like "SS 2026" / "WS 2024/25" → a sortable number. */
export function semesterKey(semester: string): number {
  const y = /(\d{4})/.exec(semester);
  const year = y ? Number(y[1]) : 0;
  return year * 10 + (semester.startsWith('WS') ? 1 : 0);
}
