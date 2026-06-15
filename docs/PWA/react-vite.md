# React + Vite PWA

The easiest way to add PWA support to a Vite-based React app is [vite-plugin-pwa](https://vite-pwa-org.netlify.app), which wraps Workbox.

---

## Installation

```bash
pnpm add -D vite-plugin-pwa workbox-window
```

---

## vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // Inline the manifest rather than producing a separate file
      manifest: {
        id: "/",
        name: "My App",
        short_name: "App",
        description: "My PWA built with React and Vite",
        start_url: "/",
        scope: "/",
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
      },

      // Workbox config
      workbox: {
        // Precache all built assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],

        runtimeCaching: [
          // API calls - network first
          {
            urlPattern: /^https:\/\/api\.myapp\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },

          // Images - cache first
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },

          // Google Fonts - cache first
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],

        // Navigate fallback for offline
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/api\//],
      },

      // Dev options
      devOptions: {
        enabled: true, // enable SW in dev for testing
        type: "module",
      },
    }),
  ],
});
```

---

## Offline fallback page

`public/offline.html` is served when navigation fails offline.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Offline</title>
  </head>
  <body>
    <h1>You are offline</h1>
    <p>Check your internet connection and try again.</p>
    <button onclick="window.location.reload()">Retry</button>
  </body>
</html>
```

---

## Auto-update prompt

When a new SW version is available, vite-plugin-pwa fires an event. Show a toast so users know to refresh.

```tsx
// src/App.tsx
import { useRegisterSW } from "virtual:pwa-register/react";

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="update-banner">
      <p>A new version is available.</p>
      <button onClick={() => updateServiceWorker(true)}>Update</button>
    </div>
  );
}
```

---

## Fonts offline (Vite)

Vite does not self-host Google Fonts automatically. Options:

1. Download fonts manually and put them in `public/fonts/`. Reference via `@font-face` in CSS.
2. Use [fontsource](https://fontsource.org) which packages fonts as npm modules:

```bash
pnpm add @fontsource/ubuntu @fontsource/roboto-slab
```

```ts
// main.tsx
import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/700.css";
import "@fontsource/roboto-slab/400.css";
```

Fontsource fonts are bundled into your app and served from the same origin, so they work offline.

---

## TypeScript types for virtual imports

```ts
// vite-env.d.ts
/// <reference types="vite-plugin-pwa/client" />
```

---

## Checklist for Vite PWA

- [ ] `VitePWA` plugin added to `vite.config.ts`
- [ ] Manifest has 192 and 512 icons, correct name and theme
- [ ] `navigateFallback` pointing to your offline page
- [ ] API routes excluded from navigate fallback
- [ ] Fonts self-hosted via fontsource or `public/fonts/`
- [ ] Update prompt component shown when `needRefresh` is true
- [ ] SW disabled or handled gracefully in development
