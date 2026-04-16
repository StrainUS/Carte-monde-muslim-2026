<div align="center">

# Islam mondial 2026

**Carte interactive, veille et prévention du risque terroriste — à destination des agents de sécurité privée et publique.**

[![CI](https://github.com/StrainUS/Carte-monde-muslim-2026/actions/workflows/v2-ci.yml/badge.svg)](https://github.com/StrainUS/Carte-monde-muslim-2026/actions/workflows/v2-ci.yml)
[![Deploy](https://github.com/StrainUS/Carte-monde-muslim-2026/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/StrainUS/Carte-monde-muslim-2026/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## Sommaire

1. [À propos](#à-propos)
2. [Fonctionnalités](#fonctionnalités)
3. [Démarrage rapide](#démarrage-rapide)
4. [Scripts disponibles](#scripts-disponibles)
5. [Structure du dépôt](#structure-du-dépôt)
6. [Déploiement](#déploiement)
7. [Qualité et tests](#qualité-et-tests)
8. [Données et sources](#données-et-sources)
9. [Accessibilité et hors-ligne](#accessibilité-et-hors-ligne)
10. [Contribuer](#contribuer)
11. [Avertissement](#avertissement)
12. [Licence](#licence)

---

## À propos

Application web **statique** (aucun backend), dédiée à la **veille contextuelle** et à la **prévention** du risque terroriste en milieu professionnel de sécurité. Elle agrège sur une interface unique :

- une **carte Leaflet** des sensibilités religieuses et des points chauds,
- des **fiches pays** avec données démographiques, sécurité et sources,
- un **quiz d'auto-évaluation** (non certifiant),
- un **guide pédagogique** (courants, glossaire, chronologie, portails officiels).

> **Note éditoriale.** Ce dépôt ne remplace ni la formation réglementaire (CNAPS, SSIAP, etc.), ni les consignes de l'employeur, ni les publications officielles à jour. Il constitue un **outil d'appui** à la veille et à l'accueil du public.

## Fonctionnalités

| Module | Description |
| --- | --- |
| **Carte interactive** | Couches sunnite / chiite / tensions régionales (radars progressifs par zoom) / hotspots terroristes (triangles pulsants). Clic pays → fiche détaillée. |
| **Fiches pays** | Démographie, courants, notes sécurité, sources citées, horodatage (`asOf`). |
| **Guide** | Timeline, fiches courants, glossaire, portails officiels (Legifrance, EUR-Lex, Europol, ONUDC…). |
| **Quiz** | 20 QCU/QCM d'auto-évaluation, correction immédiate, **sans valeur certifiante**. |
| **Sources** | Bibliographie critique, accès direct aux textes primaires. |
| **Hors-ligne** | Application PWA installable, service worker avec stratégies mixtes, fallback `/offline`. |
| **Accessibilité** | Skip link, focus visibles, `prefers-color-scheme`, `prefers-reduced-motion`, raccourcis clavier sur la carte. |

## Démarrage rapide

**Prérequis :** Node.js ≥ 20, npm ≥ 10.

```bash
git clone https://github.com/StrainUS/Carte-monde-muslim-2026.git
cd Carte-monde-muslim-2026/app
npm ci
npm run data:geojson   # génère static/geo/countries-110m.json
npm run dev            # serveur de dev sur http://127.0.0.1:5173
```

Pour un build de production servi localement :

```bash
npm run build
npm run preview        # http://127.0.0.1:4173
```

Documentation technique détaillée : [`app/README.md`](app/README.md).
Guide opérateur (PDF-ready) : [`docs/manuel.html`](docs/manuel.html).

## Scripts disponibles

Tous les scripts s'exécutent depuis `app/`.

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de dev Vite (HMR) |
| `npm run build` | Build statique complet dans `app/build/` |
| `npm run preview` | Sert le build de production en local |
| `npm run check` | `svelte-kit sync` + `svelte-check` (TypeScript strict) |
| `npm run lint` | ESLint (flat config) |
| `npm run format` / `format:check` | Prettier |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests de bout en bout (Playwright / Chromium) |
| `npm run data:geojson` | (Re)génère le GeoJSON monde à partir de `world-atlas` |
| `npm run data:enrich` | Enrichit les données pays (sources, `asOf`) |
| `npm run audit` | Audit automatisé des routes (Playwright) |

## Structure du dépôt

```
.
├── app/                     Application SvelteKit (source unique de vérité)
│   ├── src/                 Composants, routes, stores, service worker
│   ├── static/              Assets statiques + GeoJSON embarqué
│   ├── tools/               Scripts de génération de données
│   └── e2e/                 Tests Playwright
├── docs/
│   ├── SOURCES.md           Méthodologie + sources primaires
│   └── manuel.html          Guide opérateur HTML (imprimable)
├── .github/workflows/       CI (lint, tests, build) + déploiement Pages
├── README.md                Ce fichier
├── CONTRIBUTING.md          Conventions de contribution
└── LICENSE                  MIT
```

> L'historique de la v1 monolithique (`index.html` + `assets/js/*`) reste accessible via le **tag git `v1-legacy-freeze`** :
> `git checkout v1-legacy-freeze`.

## Déploiement

Le déploiement est **automatique** à chaque push sur `main` via GitHub Actions ([`deploy-pages.yml`](.github/workflows/deploy-pages.yml)) :

1. Install + génération du GeoJSON
2. Build SvelteKit (`@sveltejs/adapter-static`, `BASE_PATH` injecté pour GitHub Pages)
3. Upload et déploiement du dossier `app/build` sur GitHub Pages

**URL de production :** <https://strainus.github.io/Carte-monde-muslim-2026/>

Le build étant 100 % statique, il peut également être servi depuis n'importe quel hébergement statique (Netlify, Vercel, S3, Nginx, clé USB…).

## Qualité et tests

Chaque push et chaque PR sur `main` déclenche la pipeline CI ([`v2-ci.yml`](.github/workflows/v2-ci.yml)) :

- `svelte-check` (TypeScript strict, Svelte 5)
- ESLint + Prettier (vérification de format)
- Vitest (invariants de données + moteur de quiz)
- Build de production
- Playwright E2E (chromium) sur le build

Les données chargées au runtime sont **validées par Zod** (`app/src/lib/data/schemas.ts`). Toute violation d'invariant (ISO dupliqué, pourcentage hors plage, `intensity` invalide…) fait **échouer le build**, interdisant toute régression silencieuse.

## Données et sources

- Les fichiers `app/src/lib/data/generated/*.json` constituent la **source de vérité** (pays, quiz, hotspots, glossaire, notes sécurité, chronologie, sources).
- Chaque pays dispose d'un champ `sources: string[]` (IDs vers `sources.json`) et `asOf: string` (date ISO de fraîcheur) pour la traçabilité.
- La méthodologie, les organismes de référence et les limites reconnues sont documentés dans [`docs/SOURCES.md`](docs/SOURCES.md).

Sources externes citées : Pew Research Center · CIA World Factbook · UN WPP · Europol (TE-SAT) · Legifrance · EUR-Lex · USCIRF · INSEE · BAMF · Destatis · ONS UK, etc.

## Accessibilité et hors-ligne

- **WCAG 2.1 AA** visé : contraste, focus visibles (`:focus-visible`), skip-link, landmarks ARIA, `aria-modal` sur les panneaux.
- **Clavier** : `+` / `-` zoom, flèches pour panner, `0` reset, `Échap` ferme les panneaux.
- **Réduction de mouvement** : animations radar et pulsations désactivées sous `prefers-reduced-motion: reduce`.
- **PWA** : manifest, icône, service worker — network-first pour le HTML (anti-staleness), cache-first pour les assets versionnés, stale-while-revalidate pour les JSON, fallback `/offline`.

## Contribuer

Les issues et PR sont les bienvenues. Consulter [`CONTRIBUTING.md`](CONTRIBUTING.md) pour les conventions de commit, la checklist de PR et le workflow de tests locaux.

## Avertissement

Les synthèses présentées dans l'application sont **indicatives** et reflètent l'état des sources publiques à la date d'édition (`asOf`). Elles **ne remplacent ni le droit positif, ni les consignes de votre employeur, ni les publications officielles à jour**. Le quiz est un outil d'auto-évaluation **sans valeur certifiante**.

Pour toute exploitation opérationnelle, se reporter aux textes primaires cités (Legifrance, EUR-Lex, rapports officiels) et aux instructions internes de votre structure.

## Licence

Le **code source** est distribué sous licence [MIT](LICENSE).
Les **textes éditoriaux**, chronologies et fiches pays agrègent des sources publiques citées dans `docs/SOURCES.md` et dans l'interface ; se reporter à chaque source primaire pour les conditions de réutilisation.

---

<div align="center">

*Projet open source · maintenu par [@StrainUS](https://github.com/StrainUS)*

</div>
