# Vanilla JS / Plain HTML PWA

No build tool or framework required. Three files: `index.html`, `manifest.webmanifest`, `sw.js`.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1b4332" />
    <title>My App</title>
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/icons/icon-180.png" />
  </head>
  <body>
    <!-- app content -->
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("/sw.js").catch(console.error);
        });
      }
    </script>
  </body>
</html>
```

---

## manifest.webmanifest

```json
{
  "id": "/",
  "name": "My App",
  "short_name": "App",
  "description": "A simple PWA",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1b4332",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## sw.js

```js
const CACHE_NAME = "app-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/styles.css",
  "/app.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)),
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: network first for navigations, cache first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // Navigation: network first, fall back to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    }),
  );
});
```

---

## offline.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Offline</title>
    <style>
      body {
        font-family: sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 1rem;
        background: #f0fdf4;
      }
    </style>
  </head>
  <body>
    <h1>You are offline</h1>
    <p>Check your connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </body>
</html>
```

---

## Updating the cache

When you deploy a new version:

1. Change `CACHE_NAME = 'app-v2'`
2. The new SW installs and caches fresh assets
3. The activate handler deletes `app-v1`
4. Users get the new version on next reload

This is the manual equivalent of what Workbox/Serwist manages automatically.
