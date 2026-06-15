# Next.js + Serwist

[Serwist](https://serwist.pages.dev) is a modern Workbox fork with a first-class Next.js integration via `@serwist/next`.

---

## Installation

```bash
pnpm add @serwist/next serwist
```

---

## next.config.ts

```ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // your existing config
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts", // your TypeScript service worker source
  swDest: "public/sw.js", // compiled output (served at /sw.js)
  disable: process.env.NODE_ENV === "development", // disable SW in dev
  register: true, // auto-register the SW via a script tag
});

export default withSerwist(nextConfig);
```

### SW cache header (important)

The SW file itself must never be cached by the browser - if it is, users will be stuck on an old version.

```ts
async headers() {
  return [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      ],
    },
  ];
},
```

---

## Service worker (src/app/sw.ts)

```ts
import { defaultCache } from "@serwist/next/worker";
import {
  NetworkFirst,
  NetworkOnly,
  CacheFirst,
  StaleWhileRevalidate,
  Serwist,
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
  offlineFallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    // Auth-gated routes - SW must not interfere with middleware
    {
      matcher: ({ url }) => url.pathname.startsWith("/dashboard"),
      handler: new NetworkOnly(),
    },

    // API routes - never cache
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },

    // Public pages - network first
    {
      matcher: ({ url }) =>
        url.pathname === "/" || url.pathname.startsWith("/about"),
      handler: new NetworkFirst({
        cacheName: "public-pages",
        networkTimeoutSeconds: 3,
      }),
    },

    // Images - cache first
    {
      matcher: ({ url }) => /\.(png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname),
      handler: new CacheFirst({ cacheName: "images" }),
    },

    // Next.js static chunks - stale while revalidate
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({ cacheName: "next-static" }),
    },

    ...defaultCache,
  ],
});

serwist.addEventListeners();
```

---

## Web App Manifest (src/app/manifest.ts)

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "My App",
    short_name: "App",
    description: "My progressive web app",
    start_url: "/",
    scope: "/",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1b4332",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

Next.js serves this at `/manifest.webmanifest` and automatically adds `<link rel="manifest">` to the `<head>`.

---

## Offline fallback page (src/app/offline/page.tsx)

```tsx
export default function OfflinePage() {
  return (
    <main>
      <h1>You are offline</h1>
      <p>Check your connection and try again.</p>
      <button onClick={() => window.location.reload()}>Try again</button>
    </main>
  );
}
```

This must be a static page (no `async` server data). Serwist precaches it via `__SW_MANIFEST` automatically.

---

## Fonts offline

`@import url(https://fonts.googleapis.com/...)` in CSS will not work offline. Use `next/font/google` instead - Next.js downloads the font at build time and self-hosts it.

```ts
// src/app/fonts.ts
import { Ubuntu, Roboto_Slab } from "next/font/google";

export const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
  weight: ["400", "500", "700"],
});
```

```tsx
// src/app/layout.tsx
import { ubuntu, robotoSlab } from "./fonts";

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={`${ubuntu.variable} ${robotoSlab.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

```css
/* globals.css - use the variable, not the string name */
.font-ubuntu {
  font-family: var(--font-ubuntu), sans-serif;
}
.font-roboto-slab {
  font-family: var(--font-roboto-slab), serif;
}
```

---

## Viewport and theme color

```ts
// src/app/layout.tsx
export const viewport = {
  themeColor: "#1b4332",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets content extend into the notch area on iOS
};
```

---

## Apple PWA metadata

```ts
export const metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My App",
  },
};
```

This generates:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="apple-mobile-web-app-title" content="My App" />
```

---

## Auth + service worker safety

Middleware runs on the Next.js server, but the SW intercepts before the request reaches the server. If the SW serves a cached dashboard page, middleware never runs and you have a security gap.

Solution: always use `NetworkOnly` for protected routes.

```ts
{
  matcher: ({ url }) =>
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/admin'),
  handler: new NetworkOnly(),
}
```

Never cache API routes that handle auth tokens or mutations.
