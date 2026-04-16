# `app/` — application SvelteKit

Documentation technique de l'application. Pour la présentation produit et le guide utilisateur, voir le [README racine](../README.md).

---

## Stack

| Couche      | Choix                                                       |
| ----------- | ----------------------------------------------------------- |
| Framework   | SvelteKit 2 + Svelte 5 (runes `$state`, `$derived`)         |
| Langage     | TypeScript strict                                           |
| Style       | Tailwind CSS + design tokens CSS (`app.css`)                |
| Carte       | Leaflet + GeoJSON local (world-atlas 110m, SVG renderer)    |
| Données     | Zod schemas + JSON versionnés en source de vérité           |
| Build       | Vite + `@sveltejs/adapter-static` (prerender complet)       |
| Tests       | Vitest (unit) + Playwright (e2e, Chromium)                  |
| Offline     | Service worker natif SvelteKit (network-first HTML, CF/SWR) |
| Lint/format | ESLint (flat config) + Prettier                             |

Aucun runtime serveur : l'ensemble est pré-rendu en HTML et sert depuis GitHub Pages, un bucket statique, un Nginx, ou une clé USB.

---

## Arborescence

```
app/
├── src/
│   ├── app.css                     tokens + base Tailwind
│   ├── app.html                    shell HTML (theme init inline)
│   ├── service-worker.ts           précache + SWR + network-first HTML
│   ├── lib/
│   │   ├── data/
│   │   │   ├── schemas.ts          contrats Zod
│   │   │   ├── index.ts            store + accesseurs typés
│   │   │   ├── contracts.test.ts   invariants testés
│   │   │   └── generated/          source de vérité (JSON versionnés)
│   │   ├── map/                    MapCanvas, colors, layers, panels…
│   │   ├── quiz/                   engine.ts + tests
│   │   └── ui/                     Header, Footer, ThemeToggle, Offline
│   └── routes/
│       ├── +layout.svelte          shell global + enregistrement SW
│       ├── +page.svelte            accueil
│       ├── carte/                  carte interactive
│       ├── savoir/                 timeline, courants, glossaire
│       ├── terrorisme/             chronologie, hotspots, vigilance
│       ├── guide/                  slideshow pédagogique
│       ├── sources/                bibliographie critique
│       ├── quiz/                   auto-évaluation
│       └── offline/                page fallback hors-ligne
├── static/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── geo/countries-110m.json     GeoJSON monde (généré, versionné)
├── tools/
│   ├── build-geojson.mjs           TopoJSON world-atlas → GeoJSON lean
│   ├── enrich-sources.mjs          patch des champs sources[] / asOf
│   └── audit.mjs                   audit multi-routes Playwright
└── e2e/                            specs Playwright
```

---

## Démarrage

**Prérequis :** Node 20+.

```bash
npm ci
npm run data:geojson     # génère static/geo/countries-110m.json
npm run dev              # http://127.0.0.1:5173
```

## Scripts npm

| Script             | Rôle                                     |
| ------------------ | ---------------------------------------- |
| `dev`              | Serveur de dev Vite (HMR)                |
| `build`            | Build statique dans `build/`             |
| `preview`          | Sert `build/` en local (`:4173`)         |
| `check`            | `svelte-kit sync && svelte-check`        |
| `check:watch`      | Idem en mode watch                       |
| `lint`             | ESLint (flat config)                     |
| `format`           | Prettier `--write`                       |
| `format:check`     | Prettier `--check` (utilisé par la CI)   |
| `test`             | Vitest (unitaires)                       |
| `test:watch`       | Vitest en mode watch                     |
| `test:e2e`         | Playwright (Chromium)                    |
| `test:e2e:install` | Télécharge le navigateur Playwright      |
| `data:geojson`     | Régénère le GeoJSON monde                |
| `data:enrich`      | Applique les patchs de sources / `asOf`  |
| `audit`            | Audit automatisé des routes (Playwright) |

---

## Architecture des données

Les fichiers de `src/lib/data/generated/` sont **versionnés** dans le dépôt et constituent la **source de vérité** :

| Fichier               | Contenu                                                      |
| --------------------- | ------------------------------------------------------------ |
| `countries.json`      | Fiches pays (démographie, courants, sécurité, sources, asOf) |
| `iso-index.json`      | Correspondance ISO-3 / ID interne                            |
| `quiz.json`           | Banque de 20 questions QCU/QCM                               |
| `hotspots.json`       | Points chauds terrorisme (intensité, géolocalisation)        |
| `security-notes.json` | Notes de vigilance par pays                                  |
| `glossary.json`       | Glossaire (sunnisme, chiisme, djihadisme…)                   |
| `chronology.json`     | Chronologie terrorisme France                                |
| `timeline.json`       | Repères historiques religieux                                |
| `editorial.json`      | Textes éditoriaux (intros, mises en garde)                   |
| `sources.json`        | Catalogue des organismes cités                               |
| `overseas-boxes.json` | Cadres DROM-COM pour la carte                                |

À la compilation, `src/lib/data/index.ts` charge ces JSON et les **valide via Zod** (`schemas.ts`). Toute donnée violant un invariant fait échouer le build :

- `countries` — ISO uniques, centroïdes présents, pourcentages ∈ [0, 100]
- `quiz` — IDs uniques, `answer` dans la plage des options
- `hotspots` — `intensity ∈ [0, 1]`, coordonnées valides

La dette héritée (sommes sunnite + chiite + ibadi qui dévient de 100 pour certains pays) est **tracée et documentée** par `contracts.test.ts` plutôt que masquée.

### Enrichir les données

Pour ajouter une source à un pays :

1. Éditer `src/lib/data/generated/sources.json` (ajouter une entrée `{id, name, url, kind}`).
2. Éditer la fiche pays dans `countries.json` :
   ```json
   {
     "iso": "FRA",
     "name": "France",
     "sources": ["insee-religion", "interieur-fr", "europol-tesat"],
     "asOf": "2026-03"
   }
   ```
3. Les schémas Zod valident automatiquement au build.

---

## Thème et accessibilité

- Sombre par défaut (contexte veille nocturne / OPEX), bascule clair.
- Préférence persistée en `localStorage`, initialisée **avant l'hydratation** pour éviter le flash.
- `prefers-color-scheme` respecté au premier chargement.
- Skip link, landmarks ARIA, `:focus-visible`, raccourcis clavier sur la carte (`+`/`-`, flèches, `0` reset, `Échap`).
- `prefers-reduced-motion` désactive les animations radar et les pulsations hotspot.
- Styles `@media print` dédiés pour export papier.

## Offline-first

`service-worker.ts` applique quatre stratégies :

1. **Précache** des chunks `build` et fichiers `static` à l'install.
2. **Cache-first** pour les assets versionnés (hash dans l'URL).
3. **Network-first + fallback cache + fallback `/offline`** pour les navigations HTML — garantit de toujours récupérer l'index courant et évite les pages dé-stylées après un nouveau déploiement.
4. **Stale-while-revalidate** pour les JSON dynamiques (`geo/`, `data/`).

L'application complète (~3 Mo compressés) tient sur une clé USB et fonctionne sans réseau après la première visite. Un **badge visuel** (`OfflineBadge.svelte`) apparaît dès que `navigator.onLine = false`, et une route `/offline` sert de fallback.

Un bouton **Réinitialiser le cache et recharger** est proposé dans la carte après 6 s de chargement anormal, pour purger le service worker en cas de pépin (migration majeure, cache corrompu).

## Tests

```bash
npm test          # invariants data + moteur de quiz
npm run test:e2e  # smoke : accueil, carte, quiz, thème, timeline
```

La CI (`.github/workflows/v2-ci.yml`) rejoue **lint + check + format:check + unit + build + e2e** à chaque push et PR sur `main`.

## Limites et dette reconnue

- Certains pourcentages sunnite/chiite/ibadi héritent d'ambiguïtés (« % de la population totale » vs « % des musulmans ») — tracés dans `contracts.test.ts`, à nettoyer avec relecture éditoriale.
- i18n non implémentée (FR uniquement pour l'instant).
- Les couches « tensions » et « hotspots » ont vocation à s'enrichir d'un flux open-source (Europol TE-SAT, GTD) — actuellement données locales versionnées.

## Licence

Code sous licence MIT (voir `LICENSE` à la racine).
Textes éditoriaux : voir les sources citées dans `docs/SOURCES.md` et dans l'application (`/sources`).
