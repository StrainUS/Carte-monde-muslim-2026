# ☪ Islam 2026 — Carte mondiale interactive & formation sécurité

**FR —** Application web **statique** : carte **Leaflet** (sunnites / chiites / tensions), **hotspots terrorisme**, fiches pays (**conflit / terrorisme / France / UE**), module **Savoir** (timeline Plotly, glossaire, mini-quiz), **quiz 20 Q**, sources Pew / BAMF / Europol / Intérieur, **PWA** (`sw.js`). Repères formation **SSIAP / CQPM**, lecture **CNAPS**.

**EN —** Static site: **Leaflet** map, terrorism hotspot circles, security notes in modals, tabbed Savoir module, 20-question quiz, optional **service worker**.

---

## Lancer en local (urgence / démo demain)

1. Ouvrez le **Terminal**.
2. Allez dans le dossier du projet (celui qui contient `package.json`), par exemple :  
   `cd ~/Downloads/Carte-monde-muslim-2026-1`
3. Tapez **exactement** (une commande par ligne, sans texte après sur la même ligne) :

```bash
npm install
npm start
```

4. Regardez le message dans le terminal : il affiche **une URL** du type `http://127.0.0.1:8080/` ou `http://127.0.0.1:8081/` si le port 8080 est déjà pris. **Copiez-collez cette URL** dans Safari ou Chrome.  
   - Carte : la page d’accueil s’ouvre.  
   - Pédagogie : ajoutez `pedagogie.html` (l’URL complète est aussi indiquée dans le terminal).

**Si le navigateur ne s’ouvre pas tout seul**, ce n’est pas grave : l’URL affichée suffit.

**Sans Node.js** (secours) : dans le même dossier du projet, `python3 -m http.server 8080 --bind 127.0.0.1` puis ouvrez manuellement `http://127.0.0.1:8080/`.

---

## Démarrage rapide (à présenter en formation)

**1. Aller dans le dossier du projet** (celui qui contient `package.json`).

**Important :** dans la doc, `cd /chemin/vers/...` était un **exemple à adapter**. Il n’existe pas sur votre Mac. Remplacez-le par **le vrai chemin** du dossier (souvent `Downloads` si vous avez dézippé le projet là).

**Exemple** si le dossier s’appelle `Carte-monde-muslim-2026-1` et qu’il est dans Téléchargements :

La **première fois** (ou après un nouveau téléchargement du zip), installez les dépendances, **sans** coller de commentaire sur la même ligne que la commande — certains shells (zsh) réagissent mal aux parenthèses après `#`.

```bash
cd ~/Downloads/Carte-monde-muslim-2026-1
npm install
npm start
```

*(Si votre dossier a un autre nom ou n’est pas dans Téléchargements, adaptez la première ligne — par ex. `cd ~/Desktop/Carte-monde-muslim-2026-1`.)*

**Astuce macOS :** dans le Finder, ouvrez le dossier du projet, tapez **Cmd+Option+C** sur le dossier pour copier le chemin, ou **glissez le dossier** depuis le Finder **dans la fenêtre du Terminal** après avoir tapé `cd ` (un espace après `cd`).

**2. Lancer le site :**

```bash
npm start
```

(La commande `npm start` doit être exécutée **déjà placé** dans le dossier du projet, après le `cd` ci-dessus.)

- Le serveur utilise d’abord le port **8080** ; s’il est pris, il en choisit un autre (**8081**, **8082**, …) et l’affiche clairement. Le navigateur s’ouvre souvent tout seul.
- **Arrêt :** `Ctrl+C` dans le terminal.

**Prérequis :** [Node.js](https://nodejs.org/) installé (commande `node` et `npm` disponibles).

### Erreur `Could not read package.json` / `ENOENT`

Vous n’êtes **pas** dans le bon dossier (souvent parce que `cd` a échoué ou n’a pas été fait). Vérifiez :

```bash
pwd
ls package.json
```

Le fichier `package.json` doit s’afficher. Sinon, refaites un `cd` vers le **vrai** dossier du projet (pas `~` seul).

### Erreur `EADDRINUSE` / port déjà utilisé

Par défaut, `npm start` **essaie automatiquement 8081, 8082…** si 8080 est occupé. Si vous forcez un port et qu’il est pris, utilisez par exemple :

```bash
PORT=3000 npm start
```

Puis ouvrez **`http://127.0.0.1:3000/`**. Pour voir ce qui écoute sur 8080 (macOS) : `lsof -iTCP:8080 -sTCP:LISTEN`

### Sans Node.js — serveur Python

```bash
cd ~/Downloads/Carte-monde-muslim-2026-1
python3 -m http.server 8080
```

(Adaptez le `cd` si votre projet n’est pas dans `Downloads`.)

Puis ouvrez manuellement : **`http://127.0.0.1:8080/`**

### Important : ne pas ouvrir `index.html` en double-clic (fichier `file://`)

En ouverture directe du fichier, certaines fonctions (vidéo, chargements réseau, parfois affichage d’images du module **Pédagogie**) sont **dégradées ou bloquées**. Pour une démo ou une formation, **utilisez toujours un serveur HTTP** comme ci-dessus.

**Pages utiles :**

- Carte & modules : `http://127.0.0.1:<PORT>/index.html`
- Pédagogie & diaporama : `http://127.0.0.1:<PORT>/pedagogie.html`

(`npm start` affiche la valeur réelle de `<PORT>` : 8080, 8081, etc.)

---

## Tests (optionnel, développeurs)

```bash
npm install
npm run test:e2e:install
npm run test:e2e
```

---

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
| `index.html` | Page principale — onglets Accueil, Carte, Savoir, Terrorisme, Quiz, Sources |
| `pedagogie.html` | Diaporama SVG et approfondissements |
| `assets/img/pedagogie/*.svg` | Illustrations du diaporama |
| `assets/js/data.js` | Données pays, `SECURITY_NOTES`, `TERROR_HOTSPOTS`, quiz 20 Q |
| `assets/js/map-core.js` | Leaflet, GeoJSON |
| `assets/js/map-ui.js` | Modale, recherche, hotspots |
| `assets/js/slideshow.js` | Diaporama (Savoir + page Pédagogie) |
| `assets/js/app-pro.js` | Hub à onglets, Plotly, thème |
| `assets/css/app-pro.css` | Styles formation |
| `assets/css/pedagogie.css` | Styles diaporama (aussi chargés sur l’index pour l’onglet Savoir) |
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
