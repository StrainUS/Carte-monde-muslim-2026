/* Cache statique minimal — compatible GitHub Pages (sous-chemin) */
const BASE = self.location.pathname.replace(/[^/]+$/, "");
const CACHE = "islammap-pro-v2";
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "pedagogie.html",
  BASE + "assets/css/common.css",
  BASE + "assets/css/map.css",
  BASE + "assets/css/app-pro.css",
  BASE + "assets/js/data.js",
  BASE + "assets/js/map-core.js",
  BASE + "assets/js/map-ui.js",
  BASE + "assets/js/app-pro.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.url.includes("cdn.jsdelivr") || req.url.includes("openstreetmap") || req.url.includes("cartocdn"))
    return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req))
  );
});
