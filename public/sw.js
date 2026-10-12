// Debford Production Service Worker (PWA)
const CACHE_NAME = "debford-v1";
const STATIC_ASSETS = [
  "/",
  "/vehicles",
  "/garage",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install Event — Precaching core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event — Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Network-first with fallback to cache for offline resilience
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Ignore browser extensions, chrome-extension, or cross-origin analytics
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Avoid caching API routes or server actions
  if (url.pathname.startsWith("/api/") || request.headers.get("RSC")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Clone and cache successful response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline navigation fallback for HTML requests
        if (request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/");
        }

        return new Response("Network unavailable", {
          status: 503,
          statusText: "Service Unavailable",
        });
      })
  );
});
