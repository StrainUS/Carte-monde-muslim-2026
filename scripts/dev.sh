#!/usr/bin/env bash
# Tests → serveur statique → ouverture du navigateur (macOS : open, Linux : xdg-open).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "═══ Tests locaux ═══"
npm test

PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}/"

echo ""
echo "═══ Serveur ${URL} (Ctrl+C pour arrêter) ═══"

open_browser() {
  if command -v open >/dev/null 2>&1; then
    open "$1"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$1"
  fi
}

(sleep 1 && open_browser "$URL") &

exec python3 -m http.server "$PORT" --bind 127.0.0.1
