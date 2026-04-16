# Islam 2026 — v2

> Carte interactive, veille pédagogique et prévention terrorisme
> destinée aux agents de sécurité privée et publique.

Refonte complète de la v1 monolithique vers une application SvelteKit
statique, hors-ligne-d'abord, testable et maintenable.

---

## Stack

| Couche | Choix |
| --- | --- |
| Framework | SvelteKit + Svelte 5 (`$state`, runes) |
| Langage | TypeScript strict |
| Style | Tailwind CSS + design tokens CSS |
| Carte | Leaflet + GeoJSON local (world-atlas 110m) |
| Données | Zod schemas + JSON générés depuis legacy |
| Build | Vite + `@sveltejs/adapter-static` (prerender complet) |
| Tests | Vitest (unit) + Playwright (e2e) |
| Offline | Service worker natif SvelteKit, stratégies mixtes |
| Lint/format | ESLint + Prettier |

Aucun runtime serveur : l'ensemble est pré-rendu en HTML et sert depuis
GitHub Pages, une clé USB, ou tout hébergement statique.

---

## Arborescence

```
app/
├── src/
│   ├── app.css                     tokens + base Tailwind
│   ├── app.html                    shell HTML (theme init inline)
│   ├── service-worker.ts           précache + SWR + network-first
│   ├── lib/
│   │   ├── data/
│   │   │   ├── schemas.ts          contrats Zod
│   │   │   ├── index.ts            store + accesseurs typés
│   │   │   ├── contracts.test.ts   invariants testés
│   │   │   └── generated/          issus de tools/import-legacy.mjs
│   │   ├── map/                    MapCanvas, colors, layers, panel…
│   │   ├── quiz/                   engine.ts + tests
│   │   └── ui/                     Header, Footer, ThemeToggle, Offline
│   └── routes/
│       ├── +layout.svelte          shell global + SW register
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
│   └── geo/countries-110m.json     GeoJSON embarqué (offline)
├── tools/
│   ├── import-legacy.mjs           extraction data v1 → JSON
│   └── build-geojson.mjs           TopoJSON → GeoJSON
└── e2e/                            specs Playwright
```

---

## Démarrage

Prérequis : Node 20+.

```bash
cd app
npm ci
npm run import:legacy          # génère src/lib/data/generated/
node tools/build-geojson.mjs   # génère static/geo/countries-110m.json
npm run dev
```

L'application est servie sur <http://127.0.0.1:5173>.

## Scripts npm

| Script | Rôle |
| --- | --- |
| `dev` | serveur de dev (HMR) |
| `build` | build statique dans `build/` |
| `preview` | sert `build/` en local |
| `check` | `svelte-kit sync && svelte-check` |
| `lint` | ESLint |
| `format` | Prettier |
| `test` | Vitest (unitaires) |
| `test:e2e` | Playwright (chromium) |
| `import:legacy` | reconstruit les JSON depuis la v1 |

---

## Architecture de la donnée

La v1 exposait `window.IslamMapData` dans un IIFE. `tools/import-legacy.mjs`
exécute ce bundle dans un sandbox `vm`, extrait les structures et émet
des JSON normalisés dans `src/lib/data/generated/`.

À la compilation, `src/lib/data/index.ts` charge ces JSON et les valide
via Zod (`schemas.ts`). **Toute donnée violant un invariant fait échouer
le build**, ce qui interdit la régression silencieuse :

- `countries` — 100+ entrées, ISO uniques, centroïdes présents
- `quiz` — IDs uniques, `answer` dans la plage des options
- `hotspots` — `intensity ∈ [0,1]`
- etc.

La dette legacy (sommes sunnite+chiite+ibadi qui dévient de 100) est
**tracée et documentée** par un test (`contracts.test.ts`) plutôt que
masquée.

## Thème et accessibilité

- Sombre par défaut (contexte veille nocturne / OPEX), bascule clair.
- Préférence persistée en `localStorage`, initialisée avant l'hydratation
  pour éviter le flash.
- `prefers-color-scheme` respecté au premier chargement.
- Skip link, landmarks ARIA, focus visibles, raccourcis clavier sur la
  carte (`+/-`, flèches, `0` reset, `Esc` ferme le panneau).
- Styles `@media print` dédiés pour export papier.

## Offline-first

Le `service-worker.ts` :

1. **Précache** tous les chunks `build` et fichiers `static` à l'install.
2. **Cache-first** pour les assets versionnés (hash dans l'URL).
3. **Network-first + fallback cache + fallback `/`** pour les pages HTML.
4. **Stale-while-revalidate** pour les GeoJSON et JSON dynamiques.
5. **Badge visuel** (`OfflineBadge.svelte`) quand `navigator.onLine = false`.
6. Route `/offline` dédiée.

L'application complète (~3 MB compressé) tient sur une clé USB et
fonctionne sans réseau après la première visite.

## Tests

```bash
npm test          # 25 tests unitaires (data + quiz engine)
npm run test:e2e  # smoke e2e : accueil, carte, quiz, thème, timeline
```

Un workflow GitHub Actions (`.github/workflows/v2-ci.yml`) rejoue
lint + check + unit + build + e2e à chaque push et PR.

---

## Migration depuis la v1

La v1 monolithique (`/index.html`, `/assets/`) reste présente dans
la branche `v1-legacy-freeze` à titre de référence. La v2 vit dans
`app/` et n'a aucune dépendance vers elle en runtime — seul
`tools/import-legacy.mjs` lit les fichiers de la v1 pour reconstruire
les données. Une fois la v2 déployée, la v1 peut être retirée sans
risque.

## Limites et dette reconnue

- Certains pourcentages sunnite/chiite/ibadi de la v1 mélangent "% de
  la population totale" et "% des musulmans" — document dans
  `contracts.test.ts`, à nettoyer avec relecture éditoriale.
- i18n non implémentée (FR uniquement pour l'instant).
- Layer "tensions" et "hotspots" ont vocation à s'enrichir d'un flux
  open-source (Europol TE-SAT, GTD) — actuellement données locales.

## Licence

Le code est sous licence MIT. Les textes éditoriaux, la chronologie
et les fiches pays proviennent de sources publiques citées dans
`/sources` ; se reporter à ces sources pour la réutilisation.
