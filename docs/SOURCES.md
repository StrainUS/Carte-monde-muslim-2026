# Sources, méthode et limites

Ce document accompagne le projet **Islam mondial 2026** (`index.html` — interface unique ; `pedagogie.html` redirige vers l’app). Il précise comment interpréter les chiffres et où trouver les données primaires.

> Vérification éditoriale des liens : **avril 2026**.

## 1. Nature des données affichées

- Les pourcentages **musulmans / sunnites / chiites / ibadites** dans `assets/js/data.js` sont des **agrégats pédagogiques** : ils simplifient des réalités locales complexes (minorités, migrations, catégorisations variables selon les enquêtes).
- L’échelle de **tension** (`c` de 0 à 3) est un **indicateur didactique** pour mettre en évidence des contextes souvent cités en géopolitique. Elle ne constitue pas une classification onusienne ni un état de droit.

## 2. Références types (à consulter par pays et par année)

| Type | Organisation / support | Usage |
|------|------------------------|--------|
| Enquêtes et synthèses religieuses | [Pew Research Center](https://www.pewresearch.org/) | Ordres de grandeur mondiaux et régionaux, méthodologie documentée |
| Fiches pays | [CIA World Factbook](https://www.cia.gov/the-world-factbook/) | Religions et démographie indicatives |
| Population | [UN World Population Prospects](https://population.un.org/wpp/) | Totaux nationaux pour caler les « millions d’habitants » |
| Contextes humanitaires | [UNHCR](https://www.unhcr.org/), rapports ONU | Migrations, crises (à ne pas confondre avec statistiques religieuses) |
| Données macro publiques | [Banque mondiale](https://data.worldbank.org/), [OCDE](https://data.oecd.org/) | Variables socio-économiques de contexte |
| Analyses régionales | Think tanks et revues académiques (Moyen-Orient, Asie, Afrique) | Nuancer pays par pays |

## 3. Fond cartographique

- Contours pays : [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, résolution 110 m), via CDN jsDelivr.
- Tuiles : [CARTO Dark Matter](https://carto.com/basemaps/) (fond sombre), tuiles © OpenStreetMap contributeurs.

## 4. Bonnes pratiques pour un exposé ou un article

1. Citer la **source primaire** et l’**année** de l’estimation pour chaque chiffre important.
2. Distinguer **statistiques déclaratives** (enquêtes) et **reconnaissances légales** (religion d’État, minorités enregistrées).
3. Éviter les généralisations sur « les musulmans » sans préciser **quel pays, quelle époque, quelle source**.

## 5. Mise à jour du dépôt

Pour actualiser un pays : éditer l’entrée correspondante dans `assets/js/data.js` (champs `p`, `m`, `s`, `h`, `ib`, `c`, `n`), puis ajuster la note `n` et, si besoin, le centroïde dans `CENTROIDS` pour que l’étiquette reste bien positionnée sur la carte.

## 6. Références « officielles » ou de référence publique

Ces organismes publient des méthodologies et des tableaux utilisés pour **contrôler** les ordres de grandeur (toujours noter l’année de l’édition consultée) :

| Ressource | URL (indicative) | Usage |
|-----------|------------------|--------|
| Pew Research Center (religion) | https://www.pewresearch.org/topic/religion/ | Démographie religieuse, rapports méthodologiques |
| ONU — World Population Prospects | https://population.un.org/wpp/ | Populations nationales |
| CIA World Factbook — religions | https://www.cia.gov/the-world-factbook/field/religions/ | Fiches pays (à croiser) |
| UNHCR | https://www.unhcr.org/ | Crises et déplacements (≠ stats religieuses) |

Les définitions des **courants** (sunnisme, chiisme, etc.) dans le support pédagogique du dépôt reprennent des **formulations usuelles** dans ce type de publications et dans les manuels de sciences des religions : elles sont **descriptives** et ne valent pas position théologique.

## 7. Terrorisme — cadres « officiels » et terminologie (veille)

L’onglet **Terrorisme** de `index.html` et les entrées associées dans `pedagogy-bundle.js` (`SOURCES_2026`, glossaire) visent la **transparence juridique** : citer les textes primaires, pas seulement des synthèses médiatiques.

| Ressource | URL indicative | Usage |
|-----------|----------------|--------|
| France — Code pénal (consolidé) | https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/ | Intitulés d’infractions, articles 421-1 et suivants, procédures |
| France — section terrorisme | https://www.legifrance.gouv.fr/codes/section_LEGIARTI000006077839/LEGISCTA000006149768/ | Accès direct à la section « Infractions en matière de terrorisme » |
| UE — directive 2017/541 | https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017L0541 | Harmonisation et coopération ; croiser avec la transposition française |
| UE — Commission (justice / terrorisme) | https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/criminal-justice/terrorism_fr | Politiques et publications institutionnelles |
| ONU — Conseil de sécurité (thème terrorisme) | https://www.un.org/securitycouncil/content/threats-international-peace-and-security-terrorism | Résolutions, comités de sanctions (dont filière 1267) |
| ONU — Counter-Terrorism | https://www.un.org/counterterrorism/ | Stratégie globale, CTED, coordination inter-agences |
| ONUDC — Terrorisme | https://www.unodc.org/unodc/en/terrorism/index.html | Conventions sectorielles, assistance aux États |
| GAFI / FATF — financement du terrorisme | https://www.fatf-gafi.org/en/topics/terrorist-financing.html | Normes AML/CFT complémentaires au droit pénal |
| Europol — TE-SAT | https://www.europol.europa.eu/publications-events/main-reports/european-union-terrorism-situation-and-trend-report-te-sat | Rapport annuel UE (millésime à citer) |
| Eurojust | https://www.eurojust.europa.eu/ | Coopération judiciaire |

**Repère historique et méthode :** en français, la **Terreur** (1793–1794) désigne une politique d’État de la Révolution ; le sens **moderne** de « terrorisme » en droit pénal national et en coopération internationale repose sur des **textes et résolutions** successifs, sans une définition unique mondiale substituable à chaque ordre juridique interne.

Un fichier **`assets/data/france-terror-chronology.json`** alimente le tableau chronologique de l’onglet Terrorisme : il est **indicatif** (dates, lieux, auteurs tels que les parquets et jugements publics les ont établis) et doit être **complété** par les rapports du **SGDSN**, du **ministère de l’Intérieur** et les **décisions de justice** à jour pour toute utilisation probante.

## 8. Illustrations du diaporama

Les fichiers `assets/img/pedagogie/slide-*.svg` sont des schémas **produit pour ce dépôt** (SVG, texte éditable). Ils servent d’appui visuel au diaporama (onglet **Guide** dans `index.html`) et peuvent être modifiés avec un éditeur de texte ou Inkscape / Figma.

---

*Document rédigé pour un usage pédagogique et de transparence méthodologique.*
