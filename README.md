# ☪ Islam 2026 — Carte mondiale interactive, terrorisme & prévention

**FR —** Site web **statique** pour la **veille** et la **prévention** du risque terrorisme à l’usage des **agents de sécurité** et de toute équipe en **accueil du public** : carte **Leaflet** (sunnites / chiites / tensions), **hotspots terrorisme**, fiches pays (conflit, terrorisme, France, UE), onglet **Savoir** (timeline, courants, glossaire, portails), **quiz** (banque QCU/QCM) (auto-évaluation, **sans valeur certifiante**), sources Pew / BAMF / Europol / Intérieur, **PWA** (`sw.js`). **Ce dépôt ne propose pas une formation diplômante** ; il complète les **consignes employeur** et les **référentiels officiels**.

**Repères prévention (France) :** [interieur.gouv.fr](https://www.interieur.gouv.fr/) · [stop-djihadisme.gouv.fr](https://www.stop-djihadisme.gouv.fr/)

**EN —** Static site: Leaflet map, terrorism context, security-oriented notes in modals, tabbed Savoir section, 20-question self-check quiz (not a certificate), optional service worker.

---

## Lancer en local (urgence / démo)

1. Ouvrez le **Terminal**.
2. Allez dans le dossier du projet (celui qui contient `package.json`), par exemple :  
   `cd ~/Downloads/Carte-monde-muslim-2026-1`
3. Tapez **exactement** (une commande par ligne, sans texte après sur la même ligne) :

```bash
npm install
npm start
```

4. Regardez le message dans le terminal : il affiche **une URL** du type `http://127.0.0.1:8080/` ou `http://127.0.0.1:8081/` si le port 8080 est déjà pris. **Copiez-collez cette URL** dans Safari ou Chrome.  
   - **Tout est dans `index.html`** : la carte s’ouvre par défaut ; l’onglet **Guide** contient le diaporama et les approfondissements.  
   - L’URL `pedagogie.html` **redirige** vers l’app (`index.html#guide-hub`) pour les anciens favoris.

**Si le navigateur ne s’ouvre pas tout seul**, ce n’est pas grave : l’URL affichée suffit.

**Sans Node.js** (secours) : dans le même dossier du projet, `python3 -m http.server 8080 --bind 127.0.0.1` puis ouvrez manuellement `http://127.0.0.1:8080/`.

---

## Démarrage rapide

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

En ouverture directe du fichier, certaines fonctions (vidéo, chargements réseau, parfois affichage d’images du **guide & diaporama**) sont **dégradées ou bloquées**. Pour une démo fiable, **utilisez toujours un serveur HTTP** comme ci-dessus.

**Pages utiles :**

- Application complète : `http://127.0.0.1:<PORT>/index.html` (carte par défaut ; onglet **Guide** pour le diaporama)
- Redirection historique : `http://127.0.0.1:<PORT>/pedagogie.html` → `index.html#…`

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
cd ~/Downloads/Carte-monde-muslim
python3 bundle_offline.py
open index_offline.html
```

*(Si `bundle_offline.py` est présent dans votre clone.)*

## Arborescence utile

| Élément | Rôle |
|--------|------|
| `index.html` | Application unique — Carte (défaut), Savoir, Terrorisme, Quiz, Références, **Guide intégré** (diaporama + textes) |
| `pedagogie.html` | Redirection légère vers `index.html` (ancre conservée si présente) |
| `assets/img/pedagogie/*.svg` | Illustrations du diaporama |
| `assets/js/data.js` | Données pays (chargement) |
| `assets/js/pedagogy-bundle.js` | Quiz 20 Q, hotspots, glossaire, notes sécurité |
| `assets/js/map-core.js` | Leaflet, GeoJSON |
| `assets/js/map-ui.js` | Modale, recherche, hotspots |
| `assets/js/slideshow.js` | Diaporama (onglet Guide dans `index.html`) |
| `assets/js/app-pro.js` | Hub à onglets, Plotly, thème |
| `assets/css/app-pro.css` | Styles coque SPA |
| `assets/css/pedagogie.css` | Styles diaporama |
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

**Option A — dépôt tel quel (sans Actions)**  
1. **Settings → Pages** : source **Deploy from a branch**, branche `main`, dossier `/ (root)`.  
2. URL : `https://<user>.github.io/<repo>/`

**Option B — build `dist/` puis Pages via Actions (recommandé si vous voulez un artefact minimal)**  
1. **Settings → Pages** : source **GitHub Actions** (pas « branch »).  
2. Poussez sur `main` : le workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) exécute `npm run build:html` et publie le contenu de `dist/`.  
3. En local, même build : `npm run build:html` (vérifie le projet puis copie HTML, `sw.js`, `assets/`, `docs/` dans `dist/` — dossier prêt à zipper pour tout hébergeur statique).

### Vérification JS

```bash
node --check assets/js/data.js assets/js/map-core.js assets/js/map-ui.js assets/js/app-pro.js
```

## Fonctionnalités (synthèse)

- Carte : couches sunnite/chiite/tensions, hotspots conflit/terrorisme, recherche pays  
- Clic pays → données + camembert + blocs sécurité (si fiche disponible)  
- Savoir : timeline, fiches courants, glossaire, portails ; quiz dédié (auto-évaluation)  
- Mode présentation sur la carte · raccourcis **F**, **Échap**, **+** / **−**

## Sources

Pew Research · CIA World Factbook · BAMF · Europol · Ministère de l’Intérieur (FR) · UNHCR · ICG / ACLED / HRW (selon sujets) — croiser les **sources primaires** pour tout compte rendu sérieux.

## Avertissement

Synthèses indicatives dans l’application : ne remplacent pas le droit positif, les consignes de votre employeur ni les publications officielles à jour.

---

*Projet open source — StrainUS*
