/* Offline-first with self-update and SPA-safe routing */
const VERSION = 'v2';
const CACHE = `pacman-pwa-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/game.js',
  './src/level.js',
  './src/input.js',
  './src/audio.js',
  './src/pwa.js',
  './src/utils.js',
  './src/entities/pacman.js',
  './src/entities/ghost.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-384.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await self.skipWaiting(); // activate new SW immediately
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim(); // take control without reload
  })());
});

/** Network-first for HTML/navigation for freshness. SWR for assets. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // Treat navigations and HTML as network-first to stay fresh
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(networkFirst(req));
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (sameOrigin) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Default: just try network, then cache
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(req, { cache: 'no-store' });
    if (fresh && fresh.ok) {
      cache.put(req, fresh.clone());
      return fresh;
    }
    const cached = await cache.match(req);
    return cached || fresh;
  } catch (err) {
    const cached = await cache.match(req);
    return cached || cache.match('./index.html') || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || fetchPromise || Response.error();
}

// Allow page to trigger immediate activation
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
