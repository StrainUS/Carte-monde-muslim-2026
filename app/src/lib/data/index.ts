import countriesJson from './generated/countries.json';
import hotspotsJson from './generated/hotspots.json';
import securityNotesJson from './generated/security-notes.json';
import timelineJson from './generated/timeline.json';
import glossaryJson from './generated/glossary.json';
import sourcesJson from './generated/sources.json';
import quizJson from './generated/quiz.json';
import chronologyJson from './generated/chronology.json';
import editorialJson from './generated/editorial.json';
import overseasBoxesJson from './generated/overseas-boxes.json';
import isoIndexJson from './generated/iso-index.json';

import {
  CountrySchema,
  HotspotSchema,
  SecurityNoteSchema,
  TimelineEventSchema,
  GlossaryEntrySchema,
  SourceSchema,
  QuizQuestionSchema,
  ChronologySchema,
  EditorialSchema,
  type Country,
  type Hotspot,
  type SecurityNote,
  type TimelineEvent,
  type GlossaryEntry,
  type Source,
  type QuizQuestion,
  type Chronology,
  type Editorial
} from './schemas';
import { z } from 'zod';

function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown, name: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Data contract violation in ${name}: ${result.error.message}`);
  }
  return result.data;
}

export const countries: Country[] = parseOrThrow(
  z.array(CountrySchema),
  countriesJson,
  'countries'
);

export const hotspots: Hotspot[] = parseOrThrow(z.array(HotspotSchema), hotspotsJson, 'hotspots');

export const securityNotes: SecurityNote[] = parseOrThrow(
  z.array(SecurityNoteSchema),
  securityNotesJson,
  'security-notes'
);

export const timeline: TimelineEvent[] = parseOrThrow(
  z.array(TimelineEventSchema),
  timelineJson,
  'timeline'
);

export const glossary: GlossaryEntry[] = parseOrThrow(
  z.array(GlossaryEntrySchema),
  glossaryJson,
  'glossary'
);

export const sources: Source[] = parseOrThrow(z.array(SourceSchema), sourcesJson, 'sources');

export const quiz: QuizQuestion[] = parseOrThrow(
  z.array(QuizQuestionSchema),
  quizJson,
  'quiz'
);

export const chronology: Chronology = parseOrThrow(
  ChronologySchema,
  chronologyJson,
  'chronology'
);

export const editorial: Editorial = parseOrThrow(
  EditorialSchema,
  editorialJson,
  'editorial'
);

export const overseasBoxes = overseasBoxesJson as Record<
  string,
  Array<{ lat0: number; lat1: number; lng0: number; lng1: number; name: string }>
>;

export const isoIndex = isoIndexJson as Record<string, string>;

export const byName = new Map<string, Country>(countries.map((c) => [c.name, c]));
export const byIsoCanonical = new Map<string, Country>(
  countries.filter((c) => !c.skipIsoMap).map((c) => [c.iso, c])
);
export const securityByCountry = new Map<string, SecurityNote>(
  securityNotes.map((n) => [n.country, n])
);
export const sourceById = new Map<string, Source>(sources.map((s) => [s.id, s]));

export function findCountry(query: string): Country[] {
  const q = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (!q) return [];
  return countries
    .filter((c) => {
      const hay = c.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return hay.includes(q);
    })
    .slice(0, 12);
}

export function getSecurityFor(country: string): SecurityNote | undefined {
  return securityByCountry.get(country);
}

export type {
  Country,
  Hotspot,
  SecurityNote,
  TimelineEvent,
  GlossaryEntry,
  Source,
  QuizQuestion,
  Chronology,
  Editorial
};
