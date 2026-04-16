#!/usr/bin/env node
/**
 * Import legacy data from v1 (../assets/js/data.js, pedagogy-bundle.js, quiz-bank.js,
 * ../assets/data/*.json) and emit typed JSON into src/lib/data/generated/.
 *
 * The legacy code attaches data to `window.IslamMapData` and `window.IslamMapQuizBank`
 * inside IIFEs, so we evaluate them in a minimal vm sandbox.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const legacyRoot = resolve(appRoot, '..');
const outDir = resolve(appRoot, 'src/lib/data/generated');
mkdirSync(outDir, { recursive: true });

const read = (p) => readFileSync(resolve(legacyRoot, p), 'utf8');

const sandbox = {
  window: {},
  console: { error: () => {}, log: () => {}, warn: () => {} }
};
vm.createContext(sandbox);
for (const file of [
  'assets/js/quiz-bank.js',
  'assets/js/data.js',
  'assets/js/pedagogy-bundle.js'
]) {
  vm.runInContext(read(file), sandbox, { filename: file });
}

const legacy = sandbox.window.IslamMapData;
if (!legacy) {
  console.error('Failed to load legacy data');
  process.exit(1);
}

/* ── Pays ─────────────────────────────────────────────── */
const countries = [];
for (const [name, d] of Object.entries(legacy.DATA)) {
  const centroid = legacy.CENTROIDS[name];
  const isOverseas = name !== 'France' && d.skipIsoMap === true && d.iso === '250';
  countries.push({
    name,
    iso: d.iso,
    skipIsoMap: d.skipIsoMap ?? false,
    population: d.p,
    muslimPct: d.m,
    sunniPct: d.s,
    shiaPct: d.h,
    ibadiPct: d.ib ?? 0,
    conflict: d.c ?? 0,
    region: d.r,
    notes: d.n,
    centroid: centroid ? [centroid[0], centroid[1]] : undefined,
    overseasOf: isOverseas ? 'France' : undefined
  });
}
countries.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

/* ── Hotspots ─────────────────────────────────────────── */
const hotspots = legacy.TERROR_HOTSPOTS.map((h) => ({
  lat: h.lat,
  lng: h.lng,
  radiusKm: h.km,
  intensity: h.intensity,
  label: h.label,
  zone: h.zone
}));

/* ── Notes sécurité ───────────────────────────────────── */
const securityNotes = Object.entries(legacy.SECURITY_NOTES).map(([country, n]) => ({
  country,
  ...n
}));

/* ── Timeline ─────────────────────────────────────────── */
const timeline = legacy.TIMELINE_EVENTS.map((e) => ({
  year: e.year,
  title: e.t,
  detail: e.d
}));

/* ── Glossaire ────────────────────────────────────────── */
const glossary = Object.entries(legacy.GLOSSARY).map(([term, definition]) => ({
  term,
  definition
}));

/* ── Sources ──────────────────────────────────────────── */
const sources = legacy.SOURCES_2026.map((s) => ({
  id: s.id,
  label: s.label,
  url: s.url,
  note: s.note
}));

/* ── Quiz ─────────────────────────────────────────────── */
const quiz = legacy.QUIZ_DATA.map((q, i) => {
  const id = `q${String(i + 1).padStart(3, '0')}`;
  const base = {
    id,
    question: q.q,
    options: q.opts,
    explain: q.explain,
    sourceId: q.srcId
  };
  if (q.type === 'qcu') {
    return { type: 'qcu', ...base, answer: q.ans };
  }
  return { type: 'qcm', ...base, answers: q.ans };
});

/* ── Données externes ─────────────────────────────────── */
const chronoRaw = JSON.parse(read('assets/data/france-terror-chronology.json'));
const chronology = {
  version: chronoRaw.version,
  disclaimer: chronoRaw.disclaimer,
  officialCatalogNote: chronoRaw.official_catalog_note,
  events: chronoRaw.events.map((e) => ({
    date: e.date,
    place: e.place,
    summary: e.summary,
    actorsOfficial: e.actors_official,
    judicialNote: e.judicial_note
  }))
};

const editorial = JSON.parse(read('assets/data/editorial.json'));

/* ── Overseas bounding boxes ──────────────────────────── */
const overseasBoxes = legacy.OVERSEAS_BY_ISO;

/* ── Index ISO → nom canonique ────────────────────────── */
const byIso = {};
for (const c of countries) {
  if (!c.skipIsoMap) byIso[c.iso] = c.name;
}

/* ── Write outputs ────────────────────────────────────── */
const write = (name, data) => {
  const path = resolve(outDir, name);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`  → ${name} (${Array.isArray(data) ? data.length + ' items' : 'object'})`);
};

console.log('Importing legacy data…');
write('countries.json', countries);
write('hotspots.json', hotspots);
write('security-notes.json', securityNotes);
write('timeline.json', timeline);
write('glossary.json', glossary);
write('sources.json', sources);
write('quiz.json', quiz);
write('chronology.json', chronology);
write('editorial.json', editorial);
write('overseas-boxes.json', overseasBoxes);
write('iso-index.json', byIso);

console.log(`\n✔ Legacy data imported → ${outDir}`);
