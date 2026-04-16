# Contribuer à Islam mondial 2026

Merci de votre intérêt. Ce document récapitule les conventions en vigueur pour contribuer au projet.

---

## Philosophie

- **Stabilité des données avant tout.** Toute modification des fiches pays, chronologies ou sources doit être **traçable** (champ `sources[]` + `asOf`) et **validée** par les schémas Zod.
- **Aucune régression silencieuse.** Les invariants de données sont testés (`contracts.test.ts`) et le build échoue en cas de violation.
- **Accessibilité non négociable.** Toute nouvelle UI doit passer les exigences clavier, focus visibles et `prefers-reduced-motion`.
- **Offline-first.** L'application doit rester utilisable sans réseau après la première visite.

## Prérequis

- Node.js ≥ 20, npm ≥ 10
- Git
- (optionnel) Playwright installé via `npm run test:e2e:install`

## Workflow local

```bash
git clone https://github.com/StrainUS/Carte-monde-muslim-2026.git
cd Carte-monde-muslim-2026/app
npm ci
npm run data:geojson
npm run dev
```

Avant de pousser, **exécuter l'équivalent local de la CI** :

```bash
cd app
npm run check          # TypeScript + Svelte
npm run lint           # ESLint
npm run format:check   # Prettier (strict)
npm test               # Vitest
npm run build          # vérifie que le build passe
npm run test:e2e       # Playwright (facultatif si modif UI mineure)
```

## Conventions

### Commits

Format inspiré de [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): sujet court à l'impératif

Description détaillée si nécessaire, en paragraphes.
Expliquer le *pourquoi*, pas le *quoi* (le diff le montre).
```

Types utilisés : `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `build`.

Scopes fréquents : `carte`, `quiz`, `data`, `ui`, `pwa`, `ci`, `header`, `deploy`.

Exemples :

```
feat(carte): afficher les sources citées dans la fiche pays
fix(pwa): servir le HTML en network-first pour éviter les pages dé-stylées
docs: clarifier la procédure d'enrichissement des fiches pays
```

### Branches

- `main` est la branche protégée et déployée.
- Créer une branche thématique : `feat/...`, `fix/...`, `docs/...`.
- Ouvrir une **Pull Request** ; la CI doit être verte avant merge.

### Style de code

- TypeScript strict — aucune erreur tolérée.
- ESLint + Prettier appliqués automatiquement. `npm run format` pour corriger.
- Svelte 5 avec runes (`$state`, `$derived`, `$effect`) — éviter les stores Svelte 4 sauf nécessité.

## Ajouter ou modifier une fiche pays

1. Éditer `app/src/lib/data/generated/countries.json`.
2. Renseigner **obligatoirement** `sources` (IDs existants dans `sources.json`) et `asOf`.
3. Si une source est nouvelle, l'ajouter d'abord à `sources.json` :
   ```json
   { "id": "mon-organisme", "name": "Organisme officiel", "url": "https://…", "kind": "official" }
   ```
4. Exécuter `npm test` pour valider les schémas.
5. Commit séparé type `data(countries): …` si possible.

## Ajouter une nouvelle fonctionnalité

1. Discuter d'abord via une **issue** pour éviter les doublons.
2. Respecter les principes : accessibilité, offline, tests.
3. Ajouter un test unitaire (Vitest) ou e2e (Playwright) couvrant le chemin heureux.
4. Mettre à jour la documentation (`README.md`, `app/README.md`, `docs/manuel.html` si pertinent).

## Checklist de Pull Request

- [ ] La CI est verte (lint, check, format, unit, build, e2e)
- [ ] Les tests couvrent les nouveaux cas
- [ ] La documentation est à jour (README, manuel, SOURCES si pertinent)
- [ ] Aucun fichier généré inutile (node_modules, build, .svelte-kit…)
- [ ] Les fiches pays modifiées ont `sources` et `asOf` renseignés
- [ ] Les commits suivent la convention ci-dessus

## Code de conduite

Soyez bienveillant, professionnel et orienté solution. Les discussions éditoriales et techniques sont les bienvenues ; les attaques personnelles ne le sont pas.

## Signaler un bug ou une erreur factuelle

- **Bug technique** : ouvrir une issue avec étapes de reproduction, navigateur, OS, et une capture si pertinent.
- **Erreur factuelle dans une fiche** : ouvrir une issue citant la **source primaire** qui contredit la donnée actuelle.

## Contact

Questions, suggestions : [@StrainUS](https://github.com/StrainUS) sur GitHub.
