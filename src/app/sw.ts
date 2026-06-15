import { defaultCache } from "@serwist/next/worker";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

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

  // When a fetch fails (offline) and no runtime cache matches, serve /offline
  offlineFallbacks: {
    document: "/offline",
  },

  runtimeCaching: [
    // === Protected routes - bypass SW entirely so auth middleware always runs
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/farmers-dashboard") ||
        url.pathname.startsWith("/buyers-dashboard") ||
        url.pathname.startsWith("/cluster-dashboard") ||
        url.pathname.startsWith("/admin-dashboard"),
      handler: new NetworkOnly(),
    },

    // === API routes - never cache (auth, data mutations)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },

    // === Auth pages - network first; fall back to cache so the login form
    //     renders offline (the actual submit will fail gracefully)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/login") ||
        url.pathname.startsWith("/register") ||
        url.pathname.startsWith("/forgot-password"),
      handler: new NetworkFirst({
        cacheName: "auth-pages",
        networkTimeoutSeconds: 3,
      }),
    },

    // === Public marketing pages - network first with short timeout
    {
      matcher: ({ url }) =>
        url.pathname === "/" ||
        url.pathname.startsWith("/about") ||
        url.pathname.startsWith("/how-it-works") ||
        url.pathname.startsWith("/contact") ||
        url.pathname.startsWith("/marketplace") ||
        url.pathname.startsWith("/privacy") ||
        url.pathname.startsWith("/terms") ||
        url.pathname.startsWith("/support"),
      handler: new NetworkFirst({
        cacheName: "public-pages",
        networkTimeoutSeconds: 3,
      }),
    },

    // === Product/listing images - cache first (rarely change, expensive to re-fetch)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/images/") ||
        url.pathname.startsWith("/favicon_io/") ||
        /\.(png|jpg|jpeg|webp|avif|gif|svg|ico)$/.test(url.pathname),
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [],
      }),
    },

    // === Next.js static chunks (JS/CSS) - stale-while-revalidate
    //     Serves instantly from cache and updates in the background
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-static",
      }),
    },

    // === Google Fonts and other cross-origin assets - cache first
    //     Fonts are self-hosted via next/font so this is a safety net
    {
      matcher: ({ url }) =>
        url.origin === "https://fonts.googleapis.com" ||
        url.origin === "https://fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "google-fonts",
      }),
    },

    // === Everything else (Next.js image optimization, etc.)
    ...defaultCache,
  ],
});

serwist.addEventListeners();
