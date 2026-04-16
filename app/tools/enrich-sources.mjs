#!/usr/bin/env node
/**
 * Enrichit countries.json avec des sources officielles et un millésime
 * pour les pays "pilotes". L'objectif est d'amorcer la traçabilité :
 * chaque pays peut lister des IDs pointant vers src/lib/data/generated/sources.json
 * et une chaîne `asOf` (millésime de la donnée).
 *
 * Les valeurs numériques (population, muslimPct, etc.) ne sont PAS modifiées.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const countriesPath = resolve(root, 'src/lib/data/generated/countries.json');

/**
 * Pour chaque pays : les IDs de sources à citer + le millésime "asOf"
 * représentatif (année de la dernière synthèse de référence utilisée).
 */
const PATCH = {
  Russie: {
    sources: ['pew', 'cia', 'un-wpp', 'arda', 'rosstat'],
    asOf: '2024'
  },
  France: {
    sources: ['pew', 'insee', 'insee-religion', 'cia', 'un-wpp'],
    asOf: '2024'
  },
  Allemagne: {
    sources: ['bamf', 'destatis', 'pew', 'un-wpp'],
    asOf: '2023'
  },
  'Royaume-Uni': {
    sources: ['ons-uk', 'pew', 'un-wpp'],
    asOf: '2021'
  },
  'États-Unis': {
    sources: ['pew', 'state-irf', 'arda', 'un-wpp'],
    asOf: '2023'
  },
  'Arabie Saoudite': {
    sources: ['pew', 'cia', 'state-irf', 'un-wpp'],
    asOf: '2024'
  },
  Iran: {
    sources: ['pew', 'cia', 'state-irf', 'un-wpp'],
    asOf: '2024'
  },
  Indonésie: {
    sources: ['pew', 'cia', 'arda', 'un-wpp'],
    asOf: '2024'
  },
  Pakistan: {
    sources: ['pew', 'cia', 'un-wpp', 'arda'],
    asOf: '2024'
  },
  Turquie: {
    sources: ['pew', 'cia', 'un-wpp', 'arda'],
    asOf: '2024'
  },
  Égypte: {
    sources: ['pew', 'cia', 'state-irf', 'un-wpp'],
    asOf: '2024'
  },
  Inde: {
    sources: ['pew', 'cia', 'un-wpp', 'arda'],
    asOf: '2024'
  },
  Nigeria: {
    sources: ['pew', 'cia', 'un-wpp', 'arda'],
    asOf: '2024'
  }
};

const raw = readFileSync(countriesPath, 'utf-8');
const countries = JSON.parse(raw);

let patched = 0;
const missing = [];
for (const [name, meta] of Object.entries(PATCH)) {
  const c = countries.find((x) => x.name === name);
  if (!c) {
    missing.push(name);
    continue;
  }
  c.sources = meta.sources;
  c.asOf = meta.asOf;
  patched++;
}

writeFileSync(countriesPath, JSON.stringify(countries, null, 2) + '\n');
console.log(`✅ ${patched} pays enrichis (sources + asOf).`);
if (missing.length) {
  console.warn(`⚠️  Non trouvés : ${missing.join(', ')}`);
}
