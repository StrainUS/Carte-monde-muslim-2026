# ☪ Islam 2026 — Carte Mondiale Interactive

Carte mondiale interactive sunnites & chiites — Pew Research 2026 · CIA World Factbook.

## Ouvrir la carte
Double-cliquer sur `index.html` → s'ouvre dans Safari/Chrome/Firefox (internet requis).

## Version offline (clé USB / sans internet)

**Prérequis :** Python 3 (déjà installé sur macOS)

**Étape 1 — Aller dans le dossier du projet :**
```bash
cd ~/Downloads/Carte-monde-muslim-2026
```

**Étape 2 — Générer la version offline :**
```bash
python3 bundle_offline.py
```

**Étape 3 — Ouvrir :**
```bash
open index_offline.html
```

**Copier sur clé USB :**
```bash
cp index_offline.html /Volumes/NOM_DE_TA_CLE/
```

## Workflow Git

```bash
git pull
git add index.html
git commit -m "description"
git push
```

> Si push échoue : faire `git pull` puis `git push` à nouveau.

## Fonctionnalités
- 🗺 120 pays colorés sunnite/chiite/ibadi
- 📊 Clic pays → données + camembert + onglets Histoire/Conflit
- 📖 Module Savoir → Timeline 570–2026, articles, glossaire, 12 sources
- ⚡ Couche conflits (Yémen, Syrie, Irak, Bahreïn, Pakistan, Nigeria)
- 📝 Quiz 10 questions avec score
- 🎬 Mode présentation plein écran
- `F` plein écran · `Échap` ferme popup · `+/-` zoom

## Sources
Pew Research 2026 · CIA World Factbook · ICG · ACLED · HRW · ONU OCHA

---
*Projet pédagogique open source — StrainUS*
