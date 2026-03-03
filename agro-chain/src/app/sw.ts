// Custom Service Worker - Critical for Auth Safety
// app/sw.ts
import { defaultCache } from '@serwist/next/worker';
import { NetworkFirst, NetworkOnly, Serwist } from 'serwist';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

// Tell TypeScript about the injection point (important!)
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,

  runtimeCaching: [
    // 1. Protected routes → always go to network (middleware runs every time)
    {
      matcher: ({ url }) => url.pathname.startsWith('/dashboard'),
      handler: new NetworkOnly(),
    },

    // 2. API routes → never cache (auth, data fetching, etc.)
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },

    // 3. Public static-like pages (safe to cache lightly)
    {
      matcher: ({ url }) =>
        url.pathname === '/' || url.pathname.startsWith('/login'),
      handler: new NetworkFirst({
        cacheName: 'public-pages',
        networkTimeoutSeconds: 3,
      }),
    },

    // 4. Safe defaults for static assets, fonts, images, JS/CSS chunks
    ...defaultCache,
  ],
});

serwist.addEventListeners();