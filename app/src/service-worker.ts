/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `islam2026-${version}`;
const PRECACHE_URLS = [...build, ...files, '/'];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE && k.startsWith('islam2026-')).map((k) => caches.delete(k))
        )
      )
      .then(() => sw.clients.claim())
  );
});

/**
 * Fetch strategy:
 * - Build assets & static files : cache-first (they are content-hashed or stable)
 * - HTML navigation : network-first with cache fallback (fresh content when online)
 * - Other GET requests : stale-while-revalidate
 * Never intercept POST / non-GET.
 */
sw.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isPrecached = PRECACHE_URLS.includes(url.pathname);
  const isHtml = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');

  if (isPrecached) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (isHtml) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(staleWhileRevalidate(req));
});

async function cacheFirst(req: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    const fallback = await cache.match('/');
    if (fallback) return fallback;
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Hors ligne</title><p>Application indisponible hors ligne.</p>',
      {
        status: 503,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      }
    );
  }
}

async function staleWhileRevalidate(req: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached ?? Promise.reject(new Error('offline')));
  return cached ?? fetchPromise;
}
