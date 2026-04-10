#!/usr/bin/env bash
# Installe la commande cartemonde dans ~/.local/bin (ou le dossier passé en $1).
set -euo pipefail
RAW="https://raw.githubusercontent.com/StrainUS/Carte-monde-muslim-2026/main/scripts/cartemonde"
BIN="${1:-$HOME/.local/bin}"
mkdir -p "$BIN"
echo "→ Téléchargement vers $BIN/cartemonde"
curl -fsSL "$RAW" -o "$BIN/cartemonde"
chmod +x "$BIN/cartemonde"
echo "→ Terminé. Ajoutez au PATH (dans ~/.zshrc) :"
echo "   export PATH=\"$BIN:\$PATH\""
echo "Puis : source ~/.zshrc && cartemonde"
