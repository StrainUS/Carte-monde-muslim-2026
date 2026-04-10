# ☪ Islam 2026 — Carte mondiale interactive & formation sécurité

**FR —** Application web **statique** : carte **Leaflet** (sunnites / chiites / tensions), **hotspots terrorisme**, fiches pays (**conflit / terrorisme / France / UE**), module **Savoir** (timeline Plotly, glossaire, mini-quiz), **quiz 20 Q**, sources Pew / BAMF / Europol / Intérieur, **PWA** (`sw.js`). Repères formation **SSIAP / CQPM**, lecture **CNAPS**.

**EN —** Static site: **Leaflet** map, terrorism hotspot circles, security notes in modals, tabbed Savoir module, 20-question quiz, optional **service worker**.

## Ouvrir la carte

Avec un serveur HTTP (recommandé) :

```bash
cd /chemin/vers/Carte-monde-muslim-2026
python3 -m http.server 8080
```

Ouvrir : `http://localhost:8080/`

Double-cliquer sur `index.html` peut fonctionner pour un test rapide, mais le chargement GeoJSON (jsDelivr) est plus fiable via HTTP.

## Version offline (clé USB / sans internet)

**Prérequis :** Python 3

```bash
cd ~/Downloads/Carte-monde-muslim-2026
python3 bundle_offline.py
open index_offline.html
```

*(Si `bundle_offline.py` est présent dans votre clone.)*

## Arborescence utile

| Élément | Rôle |
|--------|------|
| `index.html` | Page principale — sections Accueil, Carte, Savoir, Terrorisme, Quiz, Sources |
| `pedagogie.html` | Diaporama et approfondissements |
| `assets/js/data.js` | Données pays, `SECURITY_NOTES`, `TERROR_HOTSPOTS`, quiz 20 Q |
| `assets/js/map-core.js` | Leaflet, GeoJSON |
| `assets/js/map-ui.js` | Modale, recherche, hotspots |
| `assets/js/app-pro.js` | Navigation, Plotly, thème |
| `assets/css/app-pro.css` | Styles formation |
| `sw.js` | Service Worker (GitHub Pages) |
| `docs/SOURCES.md` | Méthodologie |

## Workflow Git

```bash
git pull
git add .
git commit -m "description"
git push
```

## Déploiement GitHub Pages

1. **Settings → Pages** : branche `main`, dossier `/ (root)`.
2. URL : `https://<user>.github.io/<repo>/`

### Vérification JS

```bash
node --check assets/js/data.js assets/js/map-core.js assets/js/map-ui.js assets/js/app-pro.js
```

## Fonctionnalités (synthèse)

- Carte : couches sunnite/chiite/tensions, **hotspots** conflit/terrorisme, recherche pays  
- Clic pays → données + camembert + blocs sécurité (si fiche disponible)  
- Savoir : timeline, fiches écoles, glossaire, mini-quiz, quiz certif **20 Q**  
- Mode présentation sur la carte · raccourcis **F**, **Échap**, **+** / **−**

## Sources

Pew Research · CIA World Factbook · BAMF · Europol · Ministère de l’Intérieur (FR) · UNHCR · ICG / ACLED / HRW (selon sujets) — croiser les **sources primaires** pour tout travail noté.

## Avertissement

Synthèses pédagogiques : ne remplacent pas le droit positif ni les consignes employeur/CNAPS.

---

*Projet pédagogique open source — StrainUS*
