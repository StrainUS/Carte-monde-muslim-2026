#!/usr/bin/env node
/**
 * Convert world-atlas countries-110m topojson → static GeoJSON served by the app.
 * Produces static/geo/countries-110m.json (lean, offline-safe).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { feature } from 'topojson-client';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');

const topology = JSON.parse(
  readFileSync(resolve(appRoot, 'node_modules/world-atlas/countries-110m.json'), 'utf8')
);

const collection = feature(topology, topology.objects.countries);

for (const f of collection.features) {
  const id = String(f.id).padStart(3, '0');
  f.id = id;
  if (f.properties) f.properties.iso = id;
}

const out = resolve(appRoot, 'static/geo');
mkdirSync(out, { recursive: true });
const target = resolve(out, 'countries-110m.json');
writeFileSync(target, JSON.stringify(collection));
console.log(`✔ ${target}  (${collection.features.length} features)`);
