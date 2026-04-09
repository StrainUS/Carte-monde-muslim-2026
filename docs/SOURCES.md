# Sources, méthode et limites

Ce document accompagne le projet **Islam mondial 2026** (`index.html`, `pedagogie.html`). Il précise comment interpréter les chiffres et où trouver les données primaires.

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

---

*Document rédigé pour un usage pédagogique et de transparence méthodologique.*
