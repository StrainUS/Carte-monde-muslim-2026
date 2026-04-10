#!/usr/bin/env python3
"""
bundle_offline.py — Génère index_offline.html (aucun CDN requis)
Usage : python3 bundle_offline.py
"""
import urllib.request, json, sys, os

DEPS = {
    "leaflet_css":  "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css",
    "leaflet_js":   "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js",
    "topojson_js":  "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js",
    "geodata":      "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json",
    "fonts_css":    "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Inter:wght@300;400;500;600&display=swap",
}

def fetch(url, label):
    print(f"  Téléchargement {label}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = r.read().decode("utf-8")
    print(f"  OK {label} ({len(data)//1024} Ko)")
    return data

def main():
    if not os.path.exists("index.html"):
        print("Erreur : index.html introuvable. Lance ce script depuis le dossier du projet.")
        sys.exit(1)
    print("\nBundling Islam 2026 — mode offline\n" + "-"*40)
    try:
        deps = {k: fetch(v, k) for k, v in DEPS.items()}
    except Exception as e:
        print(f"\nErreur réseau : {e}\nVérifie ta connexion internet.")
        sys.exit(1)
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    html = html.replace(
        '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">',
        f"<style>\n{deps['fonts_css']}\n</style>")
    html = html.replace(
        '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css"/>',
        f"<style>\n{deps['leaflet_css']}\n</style>")
    html = html.replace(
        '<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>',
        f"<script>\n{deps['leaflet_js']}\n</script>")
    html = html.replace(
        '<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>',
        f"<script>\n{deps['topojson_js']}\n</script>")
    old = "const resp = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json');"
    new = f"const _GEO = {json.dumps(deps['geodata'])};\n    const resp = {{ json: async () => JSON.parse(_GEO) }};"
    html = html.replace(old, new)
    with open("index_offline.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"\nindex_offline.html généré ({os.path.getsize('index_offline.html')//1024} Ko)")
    print("Lance : open index_offline.html")

if __name__ == "__main__":
    main()
