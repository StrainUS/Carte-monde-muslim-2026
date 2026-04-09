# Islam mondial 2026 — Carte interactive & support pédagogique

Application web **statique** en français : carte Leaflet des populations musulmanes (répartition sunnite / chiite / ibadi), indicateur de tensions, fiches pays, quiz et **page pédagogique** avec **diaporama** pour la présentation en classe ou devant des collègues.

## Aperçu du dépôt

| Élément | Rôle |
|---------|------|
| `index.html` | **Carte principale** — navigation, couches, recherche, modale, quiz |
| `pedagogie.html` | **Diaporama** (8 écrans) + sections structurées (courants, conflits, sources) |
| `assets/js/data.js` | Données pays, centroïdes des étiquettes, banque de questions du quiz |
| `assets/js/map-core.js` | Leaflet, GeoJSON, couleurs, zoom fluide, étiquettes |
| `assets/js/map-ui.js` | Modale, recherche (debounce), quiz, raccourcis, mode présentation |
| `assets/css/common.css` | Design tokens partagés |
| `assets/css/map.css` | Mise en page de la carte |
| `assets/css/pedagogie.css` | Mise en page pédagogique |
| `docs/SOURCES.md` | Méthodologie et références détaillées |

## Lancer le projet

Un simple double-clic sur `index.html` peut suffire, mais le chargement des données (`fetch` vers le CDN) est **plus fiable** avec un petit serveur HTTP :

```bash
cd /chemin/vers/Carte-monde-muslim-2026
python3 -m http.server 8080
```

Ouvrir : `http://localhost:8080`

## Dépendances externes (CDN)

- **Leaflet** — carte interactive  
- **TopoJSON / world-atlas** — polygones pays  
- **Google Fonts** — Cinzel + Inter  

## Fonctionnalités principales

- Couches sunnite / chiite / tensions / noms des pays  
- Recherche de pays (sécurisée contre les apostrophes dans les noms)  
- Fiche pays avec graphiques et note pédagogique  
- Quiz à choix multiples  
- Mode **présentation** (masque panneaux et barre d’indicateurs)  
- Impression / PDF via la fonction d’impression du navigateur  
- Raccourcis : **Échap** ferme la modale, **F** plein écran (hors champs de saisie), **+/−** zoom  

## Avertissement méthodologique

Les chiffres sont des **synthèses indicatives** pour l’enseignement. Ils doivent être croisés avec les sources listées dans `docs/SOURCES.md` et dans la section **Sources** de `pedagogie.html`.

## Licence du contenu

Les textes pédagogiques et les données agrégées sont fournis pour un usage **éducatif**. Réutilisation publique : vérifier les sources primaires et créditer le projet si pertinent.
