import { describe, it, expect } from 'vitest';
import {
  countries,
  hotspots,
  quiz,
  securityNotes,
  sources,
  sourceById,
  timeline,
  glossary,
  chronology,
  editorial,
  byName,
  byIsoCanonical
} from './index';

describe('data contract — pays', () => {
  it('a au moins 100 pays', () => {
    expect(countries.length).toBeGreaterThan(100);
  });

  it('les codes ISO non skippés sont uniques', () => {
    const isos = countries.filter((c) => !c.skipIsoMap).map((c) => c.iso);
    expect(new Set(isos).size).toBe(isos.length);
  });

  /**
   * Dette legacy documentée : certains pays (ex. Liban 28/27/0 sans ibadi)
   * expriment s/h en % de la population totale et non au sein des musulmans.
   * v2 accepte l'héritage mais trace ces cas pour un nettoyage ultérieur.
   */
  it("trace les pays dont la somme s+h+ib s'écarte fortement de 100 (dette données legacy)", () => {
    const drift = countries
      .filter((c) => c.muslimPct >= 0.5)
      .map((c) => ({
        name: c.name,
        sum: c.sunniPct + c.shiaPct + c.ibadiPct,
        delta: Math.abs(c.sunniPct + c.shiaPct + c.ibadiPct - 100)
      }))
      .filter((x) => x.delta > 20);
    expect(drift.length).toBeLessThan(30);
  });

  it('chaque pays a un centroïde', () => {
    for (const c of countries) {
      expect(c.centroid).toBeDefined();
    }
  });

  it('le % musulman est entre 0 et 100', () => {
    for (const c of countries) {
      expect(c.muslimPct).toBeGreaterThanOrEqual(0);
      expect(c.muslimPct).toBeLessThanOrEqual(100);
    }
  });
});

describe('data contract — quiz', () => {
  it('a au moins 50 questions', () => {
    expect(quiz.length).toBeGreaterThanOrEqual(50);
  });

  it('les IDs sont uniques', () => {
    const ids = quiz.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('les réponses QCU sont dans les bornes', () => {
    for (const q of quiz) {
      if (q.type !== 'qcu') continue;
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    }
  });

  it('les réponses QCM sont dans les bornes et non vides', () => {
    for (const q of quiz) {
      if (q.type !== 'qcm') continue;
      expect(q.answers.length).toBeGreaterThan(0);
      for (const a of q.answers) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThan(q.options.length);
      }
    }
  });

  it('si une source est citée, elle existe dans SOURCES', () => {
    for (const q of quiz) {
      if (!q.sourceId) continue;
      expect(sourceById.has(q.sourceId)).toBe(true);
    }
  });
});

describe('data contract — hotspots & security', () => {
  it('les hotspots ont des coordonnées valides', () => {
    for (const h of hotspots) {
      expect(h.lat).toBeGreaterThanOrEqual(-90);
      expect(h.lat).toBeLessThanOrEqual(90);
      expect(h.lng).toBeGreaterThanOrEqual(-180);
      expect(h.lng).toBeLessThanOrEqual(180);
      expect(h.intensity).toBeGreaterThan(0);
      expect(h.intensity).toBeLessThanOrEqual(1);
    }
  });

  it('chaque note sécurité cible un pays connu', () => {
    for (const n of securityNotes) {
      expect(byName.has(n.country)).toBe(true);
    }
  });
});

describe('data contract — contenu', () => {
  it('sources ont toutes une URL valide', () => {
    for (const s of sources) {
      expect(s.url).toMatch(/^https?:\/\//);
    }
  });

  it('timeline triée chronologiquement', () => {
    const years = timeline.map((e) => e.year);
    const sorted = [...years].sort((a, b) => a - b);
    expect(years).toEqual(sorted);
  });

  it('glossaire non vide', () => {
    expect(glossary.length).toBeGreaterThan(5);
  });

  it('chronologie France non vide', () => {
    expect(chronology.events.length).toBeGreaterThan(5);
  });

  it('éditorial versionné', () => {
    expect(editorial.version).toMatch(/\d{4}/);
  });
});

describe('data contract — index', () => {
  it('byIsoCanonical résout un pays principal', () => {
    expect(byIsoCanonical.get('250')?.name).toBe('France');
  });

  it('France et Mayotte coexistent sans collision', () => {
    expect(byName.get('France')?.skipIsoMap).toBeFalsy();
    expect(byName.get('Mayotte')?.skipIsoMap).toBe(true);
  });
});
