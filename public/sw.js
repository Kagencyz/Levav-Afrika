// v2: navigation/HTML is now network-first (was cache-first, which meant a
// phone that had ever visited before would keep getting served the OLD
// index.html forever — even online — pointing at JS/CSS filenames that no
// longer exist after the next deploy (Vite hashes every filename per build).
// That 404 silently fails as a <script type="module"> load, so React never
// mounts: a blank white page that never recovers on its own. Cache-first
// remains fine for hashed JS/CSS/images/fonts, since a given hash's content
// never changes — only the HTML that references new hashes must always be
// fetched fresh when online.
const CACHE_NAME = 'levav-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up every previous cache version (v1 and earlier)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls: network first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Navigation / HTML: ALWAYS network-first. This is the page shell that
  // names every other asset by hash, so it must never go stale while online.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Everything else (hashed JS/CSS/images/fonts): cache-first is safe here
  // because Vite gives each build's files new filenames — a cached hash's
  // content can never go stale.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (
            response.ok &&
            (url.origin === self.location.origin ||
              request.destination === 'image' ||
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'font')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
