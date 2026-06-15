# Offline Patterns

A good offline experience is one of the main things that separates a PWA from a regular website. Users should get useful feedback - not a browser error page - when they lose their connection.

---

## Offline fallback page

The simplest offline pattern. When a navigation request fails and nothing is cached, serve a dedicated offline page.

### Requirements

1. The `/offline` page must be precached at SW install time (so it is available without a network).
2. A `fetch` event handler must catch failed navigations and return the cached offline page.

### With Serwist (Next.js)

```ts
// sw.ts
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  offlineFallbacks: {
    document: '/offline',
  },
  runtimeCaching: [...],
});
```

Create `app/offline/page.tsx` as a static page (no server-side data fetching). Serwist precaches it automatically because it is a static route.

### Plain service worker

```js
// sw.js
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("offline-v1").then((cache) => cache.add(OFFLINE_URL)),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});
```

---

## App shell pattern

Cache the minimum HTML/CSS/JS needed to render the UI shell (header, nav, skeleton) and serve it instantly. Fill the content from the network or cache.

```
┌─────────────────────────────────────┐
│  App Shell (precached)              │
│  ┌─────────────────────────────┐   │
│  │  Dynamic content (network)  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

The shell renders offline. The inner content shows a loading state or "you are offline" message.

---

## Offline-first data with IndexedDB

For apps that need to write data while offline and sync later:

1. All writes go to IndexedDB first.
2. A background sync listener in the SW replays queued writes when the network returns.
3. The UI reads from IndexedDB, not the API.

```ts
// Simplified write flow
async function submitOrder(order: Order) {
  await idb.put("pending-orders", order);
  navigator.serviceWorker.ready.then((sw) => sw.sync.register("sync-orders"));
}

// In the service worker
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(syncPendingOrders());
  }
});
```

Libraries: [idb](https://github.com/jakearchibald/idb), [Dexie.js](https://dexie.org).

---

## Detecting online / offline state

```ts
// React hook
function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
```

Use this to show a banner ("You are offline - changes will sync when you reconnect") rather than silently failing.

---

## What to cache vs what not to cache

| Cache                   | Do not cache                           |
| ----------------------- | -------------------------------------- |
| App shell (HTML/CSS/JS) | Auth API responses                     |
| Fonts and icons         | Mutation endpoints (POST, PUT, DELETE) |
| Static images           | Dashboard HTML (middleware must run)   |
| Marketing pages         | Session tokens or credentials          |
| Error and offline pages | Personal user data                     |
