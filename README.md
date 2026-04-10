# Islam mondial 2026 — Carte interactive & support pédagogique

Application web **statique** en français : carte Leaflet (répartition sunnite / chiite / ibadi), indicateur de tensions, fiches pays, quiz avec score, et **page pédagogique** avec **diaporama illustré** (schémas SVG) pour la classe ou une présentation professionnelle.

## Arborescence utile

| Élément | Rôle |
|---------|------|
| `index.html` | **Carte** — couches, recherche, modale, quiz, mode présentation |
| `pedagogie.html` | **Diaporama** (8 écrans + visuels) + sections (courants, conflits, références, sources) |
| `assets/img/pedagogie/*.svg` | Illustrations du diaporama (vectoriel, sans dépendance externe) |
| `assets/js/data.js` | Données pays, centroïdes, quiz |
| `assets/js/map-core.js` | Leaflet, GeoJSON, couleurs, étiquettes (show/hide) |
| `assets/js/map-ui.js` | Modale, recherche, quiz (délégation d’événements), raccourcis |
| `assets/css/*.css` | Styles (tokens communs, carte, pédagogie) |
| `docs/SOURCES.md` | Méthodologie, liens officiels, limites |

## Lancer le projet

Le chargement du fichier pays (`fetch` vers jsDelivr) est **fiable** avec un serveur HTTP lancé **dans le dossier du dépôt** :

```bash
cd /Users/teo.rible/Carte-monde-muslim-2026
python3 -m http.server 8080
```

Ouvrir : **http://localhost:8080/** (pas le listing du répertoire home : le `cd` doit pointer vers ce projet).

## Dépendances externes (CDN)

- **Leaflet** — carte interactive  
- **TopoJSON + world-atlas** — polygones pays  
- **CARTO** + **OpenStreetMap** — fond de carte  
- **Google Fonts** — Cinzel + Inter  

## Fonctionnalités principales

- Couches sunnite / chiite / tensions / noms des pays  
- **Bouton de repli du panneau droit** calé sur le bord carte / panneau (`right: 0` dans `#map-wrap`)  
- Recherche sécurisée (`data-country` + `encodeURIComponent`)  
- Fiche pays (graphiques, note, lien vers la page Sources)  
- Quiz avec **score** et écran final « Recommencer » (délégation sur `#quiz-box`)  
- **Interface active dès le chargement du DOM** : si le GeoJSON échoue, boutons et recherche restent utilisables ; la carte affiche alors un message d’erreur  
- Mode présentation, impression, raccourcis **Échap**, **F**, **+** / **−**, **P** (hors champs de saisie)  

## Documentation pédagogique

- **`pedagogie.html`** : diapositives avec schémas, références vers Pew, ONU (WPP), CIA Factbook, UNHCR.  
- **`docs/SOURCES.md`** : nature des agrégats, bonnes pratiques de citation, mise à jour de `data.js`.  

## Avertissement méthodologique

Les chiffres sont des **synthèses indicatives** pour l’enseignement. Pour un exposé noté ou un article, citez les **sources primaires** et leur **millésime**. La carte ne remplace pas une enquête d’origine.

## Tests rapides (développement)

```bash
node --check assets/js/data.js assets/js/map-core.js assets/js/map-ui.js assets/js/pedagogie.js
```

Avec le serveur local : vérifier les codes HTTP 200 pour `/`, `/pedagogie.html`, `/assets/js/map-core.js`, `/assets/img/pedagogie/slide-01-diversite.svg`.

## Licence du contenu

Textes et données agrégées : usage **éducatif**. Réutilisation publique : créditer les sources primaires et, si pertinent, ce dépôt. Les SVG du dossier `assets/img/pedagogie/` sont fournis pour ce projet (usage pédagogique).
