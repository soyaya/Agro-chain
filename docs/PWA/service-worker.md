# Service Worker

A service worker is a JavaScript file that runs in a background thread, separate from the main page. It acts as a programmable proxy between your app and the network.

---

## Lifecycle

```
Register → Install → Activate → Idle → Fetch / Message / Push
```

1. **Register** - the page calls `navigator.serviceWorker.register('/sw.js')`
2. **Install** - the SW runs `self.addEventListener('install', ...)` - good place to precache assets
3. **Activate** - old SW hands off control; new SW cleans up old caches
4. **Fetch** - every network request from controlled pages flows through `self.addEventListener('fetch', ...)`

A new service worker waits until all pages using the old one are closed before activating. `skipWaiting()` + `clients.claim()` lets it activate immediately.

---

## Caching strategies

### Cache First

Serve from cache immediately. Fall back to network if not cached. Update the cache from network.

Best for: static assets (fonts, icons, JS/CSS bundles), images.

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const clone = response.clone();
          caches
            .open("my-cache")
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
      );
    }),
  );
});
```

### Network First

Try the network. Fall back to cache if the network fails or times out.

Best for: HTML pages, API responses that change frequently.

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open("pages").then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
```

### Stale While Revalidate

Serve from cache immediately (stale). Update the cache from network in the background.

Best for: non-critical assets where speed matters more than freshness (e.g. Next.js JS chunks, fonts).

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("swrv").then((cache) => {
      return cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || networkFetch;
      });
    }),
  );
});
```

### Network Only

Always go to the network. Never cache.

Best for: API routes, auth endpoints, dashboard HTML (where middleware must run every time).

### Cache Only

Always serve from cache. Never go to the network.

Best for: assets you know are always precached (rare in practice).

---

## Precaching vs runtime caching

**Precaching** - assets cached at install time from a manifest list. Guaranteed to be available immediately.

- Use for: app shell HTML, critical CSS, critical JS, fonts.

**Runtime caching** - assets cached on first fetch, using a strategy.

- Use for: API responses, images, pages, third-party assets.

---

## Offline fallback

When a user is offline and requests a page that is not in any cache, you can serve a fallback page instead of a browser error.

```js
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline")),
    );
  }
});
```

The `/offline` page must be precached so it is available when offline.

---

## Push notifications

```js
// In the service worker
self.addEventListener("push", (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
    }),
  );
});

// In the page - subscribe
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
});
// Send subscription to your server
```

---

## Background sync

```js
// In the page - queue a sync when offline
navigator.serviceWorker.ready.then((sw) => {
  sw.sync.register("submit-form");
});

// In the service worker - retry when online
self.addEventListener("sync", (event) => {
  if (event.tag === "submit-form") {
    event.waitUntil(replayQueuedSubmissions());
  }
});
```

---

## Debugging

- Chrome DevTools > Application > Service Workers
- `chrome://serviceworker-internals/` for all registered SWs
- Unregister the old SW when iterating to avoid stale caching bugs during development

---

## Libraries

| Library                                              | Notes                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| [Serwist](https://serwist.pages.dev)                 | Modern Workbox fork. First-class Next.js integration.       |
| [Workbox](https://developer.chrome.com/docs/workbox) | Google's original. Vite/webpack/rollup plugins available.   |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app)  | Wraps Workbox for Vite-based projects (React, Vue, Svelte). |
