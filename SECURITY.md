# Politique de sécurité

## Portée

Cette application est un site statique SvelteKit sans backend applicatif ni comptes utilisateurs.

Les zones sensibles sont principalement :

- les données éditoriales et leurs sources ;
- le service worker et le cache hors-ligne ;
- les dépendances npm ;
- les liens sortants vers sources institutionnelles ;
- les contenus pouvant être interprétés comme aide opérationnelle.

## Signaler un problème

Pour une vulnérabilité technique ou une erreur factuelle sensible, ouvrez une issue avec :

- étapes de reproduction ;
- navigateur / OS si pertinent ;
- fichier ou route concernée ;
- source primaire contradictoire si le problème concerne une donnée.

Ne publiez jamais de données personnelles, informations opérationnelles confidentielles, secrets, tokens ou détails exploitables dans une issue publique.

## Règles contributeur

- Ne jamais committer `.env`, clés API, tokens, données personnelles ou documents non publics.
- Les fiches pays doivent rester sourcées (`sources[]`) et datées (`asOf`).
- Les changements éditoriaux sensibles doivent privilégier les sources primaires et organismes reconnus.
- L'application ne remplace pas les textes officiels, consignes employeur, formations réglementaires ou décisions d'autorités compétentes.

## Vérifications recommandées

```bash
cd app
npm run check
npm run lint
npm run format:check
npm test
npm run build
```

Pour les changements UI ou PWA :

```bash
npm run test:e2e
```
