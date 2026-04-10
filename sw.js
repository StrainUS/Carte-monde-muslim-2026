/* Cache statique minimal — compatible GitHub Pages (sous-chemin) */
const BASE = self.location.pathname.replace(/[^/]+$/, "");
const CACHE = "islammap-pro-v5";
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "pedagogie.html",
  BASE + "assets/css/common.css",
  BASE + "assets/css/map.css",
  BASE + "assets/css/app-pro.css",
  BASE + "assets/css/pedagogie.css",
  BASE + "assets/css/responsive.css",
  BASE + "assets/js/data.js",
  BASE + "assets/js/pedagogy-bundle.js",
  BASE + "assets/js/map-core.js",
  BASE + "assets/js/map-ui.js",
  BASE + "assets/js/slideshow.js",
  BASE + "assets/js/app-pro.js",
  BASE + "assets/data/editorial.json",
  BASE + "assets/img/pedagogie/slide-01-diversite.svg",
  BASE + "assets/img/pedagogie/slide-02-legende.svg",
  BASE + "assets/img/pedagogie/slide-03-sunnisme.svg",
  BASE + "assets/img/pedagogie/slide-04-chiisme.svg",
  BASE + "assets/img/pedagogie/slide-05-ibadi.svg",
  BASE + "assets/img/pedagogie/slide-06-conflits.svg",
  BASE + "assets/img/pedagogie/slide-07-classe.svg",
  BASE + "assets/img/pedagogie/slide-08-sources.svg",
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
