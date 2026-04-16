# Sources, méthode et limites

> Document d'accompagnement du projet **Islam mondial 2026**.
> Vérification éditoriale des liens : **avril 2026**.

Ce document décrit **comment les données sont constituées, horodatées et sourcées** dans l'application, ainsi que les organismes de référence à consulter pour toute exploitation opérationnelle.

---

## Sommaire

1. [Nature des données affichées](#1-nature-des-données-affichées)
2. [Traçabilité dans le code (`sources` et `asOf`)](#2-traçabilité-dans-le-code-sources-et-asof)
3. [Fond cartographique](#3-fond-cartographique)
4. [Organismes de référence — démographie religieuse](#4-organismes-de-référence--démographie-religieuse)
5. [Organismes de référence — terrorisme et droit](#5-organismes-de-référence--terrorisme-et-droit)
6. [Méthodologie éditoriale recommandée](#6-méthodologie-éditoriale-recommandée)
7. [Illustrations et schémas](#7-illustrations-et-schémas)
8. [Limites reconnues](#8-limites-reconnues)

---

## 1. Nature des données affichées

Les valeurs présentées dans l'application sont **des agrégats pédagogiques** issus de sources publiques (cf. §4 et §5). Elles simplifient des réalités locales complexes : minorités, migrations, catégorisations variables selon les enquêtes.

| Champ | Nature | Précaution |
| --- | --- | --- |
| `muslim` | % de la population identifiée comme musulmane | Selon l'enquête : auto-déclaration, recensement, projection Pew |
| `sunni` / `shia` / `ibadi` | % (au sein de la population totale ou des musulmans selon la source) | Les ambiguïtés historiques sont **tracées** dans `contracts.test.ts` |
| `conflict` (0 à 3) | Indicateur didactique de tension | **Pas** une classification onusienne ni un état de droit |
| `intensity` (hotspots, 0 à 1) | Intensité relative pédagogique | Ne constitue pas une prévision opérationnelle |

## 2. Traçabilité dans le code (`sources` et `asOf`)

Chaque fiche pays dans `app/src/lib/data/generated/countries.json` dispose de deux champs dédiés à la traçabilité :

```json
{
  "iso": "FRA",
  "name": "France",
  "muslim": 8.8,
  "sources": ["insee-religion", "interieur-fr", "europol-tesat"],
  "asOf": "2026-03"
}
```

- **`sources`** — tableau d'identifiants pointant vers `sources.json`, qui contient pour chaque entrée `{id, name, url, kind}`. Cliquer sur une source dans le panneau pays de l'application ouvre l'URL officielle.
- **`asOf`** — date ISO (format `YYYY-MM`) de la dernière révision éditoriale du pays. Affichée en badge dans le panneau pays.

Ce contrat est **validé par Zod** au build : toute fiche sans `sources` ou `asOf` est signalée par le test d'invariants ; toute fiche avec une source inexistante fait échouer la compilation.

## 3. Fond cartographique

| Élément | Origine |
| --- | --- |
| Contours pays | [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, 110 m) — généré par `app/tools/build-geojson.mjs` avec correction d'antiméridien |
| Référentiel ISO-3 | `world-atlas` + correspondance interne dans `iso-index.json` |
| Tuiles (fond sombre, optionnel) | [CARTO Dark Matter](https://carto.com/basemaps/) · tuiles © OpenStreetMap contributeurs |

Le GeoJSON est **embarqué dans le build** (`static/geo/countries-110m.json`) pour fonctionner hors ligne.

## 4. Organismes de référence — démographie religieuse

| Ressource | URL | Usage |
| --- | --- | --- |
| [Pew Research Center — Religion](https://www.pewresearch.org/topic/religion/) | `pewresearch.org/topic/religion/` | Ordres de grandeur mondiaux, méthodologie documentée |
| [CIA World Factbook — Religions](https://www.cia.gov/the-world-factbook/field/religions/) | `cia.gov/the-world-factbook` | Fiches pays (à croiser) |
| [UN WPP — World Population Prospects](https://population.un.org/wpp/) | `population.un.org/wpp/` | Populations nationales pour caler les « millions d'habitants » |
| [UNHCR](https://www.unhcr.org/) | `unhcr.org` | Crises humanitaires, déplacements (≠ stats religieuses) |
| [Banque mondiale](https://data.worldbank.org/) · [OCDE](https://data.oecd.org/) | `data.worldbank.org` · `data.oecd.org` | Variables socio-économiques de contexte |
| [INSEE — études sur la religion](https://www.insee.fr/) | `insee.fr` | France : pratique religieuse, enquêtes TeO |
| [BAMF — Muslimisches Leben](https://www.bamf.de/) | `bamf.de` | Allemagne : études fédérales sur la vie musulmane |
| [Destatis — Zensus](https://www.destatis.de/) | `destatis.de` | Allemagne : recensements |
| [ONS UK — religion](https://www.ons.gov.uk/) | `ons.gov.uk` | Royaume-Uni : recensement religion |
| [ARDA — Association of Religion Data Archives](https://www.thearda.com/) | `thearda.com` | Agrégateur universitaire multi-sources |
| [Rosstat](https://rosstat.gov.ru/) | `rosstat.gov.ru` | Fédération de Russie : démographie officielle |
| [USCIRF](https://www.uscirf.gov/) | `uscirf.gov` | US Commission on International Religious Freedom — rapport annuel |
| [State Department — IRF reports](https://www.state.gov/religiousfreedomreport/) | `state.gov/religiousfreedomreport/` | International Religious Freedom Reports |

## 5. Organismes de référence — terrorisme et droit

| Ressource | URL | Usage |
| --- | --- | --- |
| [Legifrance — Code pénal](https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/) | `legifrance.gouv.fr` | Infractions terrorisme (art. 421-1 et suivants), procédures |
| [Legifrance — section terrorisme](https://www.legifrance.gouv.fr/codes/section_LEGIARTI000006077839/LEGISCTA000006149768/) | idem | Accès direct à la section « Infractions en matière de terrorisme » |
| [EUR-Lex — directive 2017/541](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017L0541) | `eur-lex.europa.eu` | Harmonisation UE, à croiser avec la transposition française |
| [Commission européenne — terrorisme](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/criminal-justice/terrorism_fr) | `commission.europa.eu` | Politiques et publications institutionnelles |
| [Europol — TE-SAT](https://www.europol.europa.eu/publications-events/main-reports/european-union-terrorism-situation-and-trend-report-te-sat) | `europol.europa.eu` | Rapport annuel UE (millésime à citer) |
| [Eurojust](https://www.eurojust.europa.eu/) | `eurojust.europa.eu` | Coopération judiciaire |
| [ONU — Conseil de sécurité / terrorisme](https://www.un.org/securitycouncil/content/threats-international-peace-and-security-terrorism) | `un.org/securitycouncil` | Résolutions, comités de sanctions (dont filière 1267) |
| [ONU — Counter-Terrorism](https://www.un.org/counterterrorism/) | `un.org/counterterrorism` | Stratégie globale, CTED, coordination |
| [ONUDC — Terrorisme](https://www.unodc.org/unodc/en/terrorism/index.html) | `unodc.org` | Conventions sectorielles, assistance aux États |
| [GAFI / FATF — financement du terrorisme](https://www.fatf-gafi.org/en/topics/terrorist-financing.html) | `fatf-gafi.org` | Normes AML/CFT |
| [Ministère de l'Intérieur (FR)](https://www.interieur.gouv.fr/) | `interieur.gouv.fr` | SGDSN, DGSI — publications et vigilance |
| [stop-djihadisme.gouv.fr](https://www.stop-djihadisme.gouv.fr/) | `stop-djihadisme.gouv.fr` | Communication gouvernementale, signalement |

**Repère méthodologique.** Le sens moderne de « terrorisme » en droit pénal national et en coopération internationale repose sur des textes successifs, **sans définition unique mondiale** substituable à chaque ordre juridique interne. Citer les textes primaires, pas seulement les synthèses médiatiques.

## 6. Méthodologie éditoriale recommandée

1. **Citer la source primaire et l'année** pour chaque chiffre important.
2. Distinguer **statistiques déclaratives** (enquêtes) et **reconnaissances légales** (religion d'État, minorités enregistrées).
3. Éviter les généralisations sur « les musulmans » sans préciser *quel pays, quelle époque, quelle source*.
4. Pour un exposé ou un document professionnel, **croiser deux sources** de nature différente (organisme international + source nationale).
5. Maintenir le champ `asOf` à jour à chaque révision et renseigner `sources[]` de façon exhaustive.

## 7. Illustrations et schémas

Les SVG utilisés dans le guide et les pages éditoriales sont produits **pour ce dépôt**. Ils servent d'appui visuel et peuvent être modifiés avec un éditeur de texte, Inkscape ou Figma. Les composants React/Svelte de l'interface sont rendus dynamiquement (carte Leaflet, SVG inline).

## 8. Limites reconnues

- **Ambiguïté sunnite/chiite/ibadi** : certaines valeurs héritées mélangent « % de la population totale » et « % des musulmans ». Les écarts à 100 sont **tracés** par `contracts.test.ts` (`countries: somme s+h+ib ≈ 100, tolérance 5`) plutôt que masqués.
- **Couverture `sources[]`** : actuellement renseignée pour un noyau de ~13 pays critiques ; l'extension est en cours.
- **Fraîcheur `asOf`** : vérifier la date de révision avant toute citation ; les sources officielles peuvent avoir publié une mise à jour plus récente.
- **Flux temps réel** : l'application n'intègre **pas** de flux Europol TE-SAT / GTD en direct ; les hotspots et chronologies sont des snapshots versionnés.

---

*Document rédigé pour un usage pédagogique et de transparence méthodologique.*
