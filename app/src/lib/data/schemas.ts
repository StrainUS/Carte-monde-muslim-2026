import { z } from 'zod';

export const ConflictLevel = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export type ConflictLevel = z.infer<typeof ConflictLevel>;

export const CountrySchema = z.object({
  name: z.string().min(1),
  iso: z.string().regex(/^\d{3}$/),
  skipIsoMap: z.boolean().optional(),
  population: z.number().nonnegative(),
  muslimPct: z.number().min(0).max(100),
  sunniPct: z.number().min(0).max(100),
  shiaPct: z.number().min(0).max(100),
  ibadiPct: z.number().min(0).max(100),
  conflict: ConflictLevel,
  region: z.string().min(1),
  notes: z.string().min(1),
  centroid: z.tuple([z.number(), z.number()]).optional(),
  overseasOf: z.string().optional(),
  // Traçabilité : IDs renvoyant vers `sources.json`, et millésime de la donnée.
  sources: z.array(z.string()).optional(),
  asOf: z.string().optional()
});
export type Country = z.infer<typeof CountrySchema>;

export const HotspotSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radiusKm: z.number().positive(),
  intensity: z.number().min(0).max(1),
  label: z.string(),
  zone: z.string()
});
export type Hotspot = z.infer<typeof HotspotSchema>;

export const SecurityNoteSchema = z.object({
  country: z.string(),
  conflit: z.string().optional(),
  terrorisme: z.string().optional(),
  france: z.string().optional(),
  ue: z.string().optional()
});
export type SecurityNote = z.infer<typeof SecurityNoteSchema>;

export const TimelineEventSchema = z.object({
  year: z.number().int(),
  title: z.string(),
  detail: z.string()
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url(),
  note: z.string().optional()
});
export type Source = z.infer<typeof SourceSchema>;

export const GlossaryEntrySchema = z.object({
  term: z.string(),
  definition: z.string()
});
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;

export const QuizQuestionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('qcu'),
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()).min(2),
    answer: z.number().int().nonnegative(),
    explain: z.string(),
    sourceId: z.string().optional()
  }),
  z.object({
    type: z.literal('qcm'),
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()).min(2),
    answers: z.array(z.number().int().nonnegative()).min(1),
    explain: z.string(),
    sourceId: z.string().optional()
  })
]);
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const ChronologyEventSchema = z.object({
  date: z.string(),
  place: z.string(),
  summary: z.string(),
  actorsOfficial: z.string().optional(),
  judicialNote: z.string().optional()
});
export type ChronologyEvent = z.infer<typeof ChronologyEventSchema>;

export const ChronologySchema = z.object({
  version: z.string(),
  disclaimer: z.string(),
  officialCatalogNote: z.string().optional(),
  events: z.array(ChronologyEventSchema)
});
export type Chronology = z.infer<typeof ChronologySchema>;

export const EditorialSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  legal: z.string(),
  method: z.string()
});
export type Editorial = z.infer<typeof EditorialSchema>;
