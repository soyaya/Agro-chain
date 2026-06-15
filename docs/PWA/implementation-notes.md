# Agro-chain PWA - Implementation Notes

Documents every PWA change made to this project, what was wrong before, and why each decision was made.

---

## What was already in place

- `@serwist/next` and `serwist` installed as dependencies
- `src/app/manifest.ts` generating a `/manifest.webmanifest` endpoint
- `src/app/sw.ts` service worker with basic NetworkOnly for dashboards and API routes
- `next.config.ts` wired up with `withSerwistInit`
- Viewport and `appleWebApp` metadata set in root layout
- Icons at `public/favicon_io/` in all required sizes

---

## Changes made

### 1. Fonts moved to next/font (offline support)

**Before:**

```css
/* globals.css */
@import url("https://fonts.googleapis.com/css2?family=Ubuntu...");
@import url("https://fonts.googleapis.com/css2?family=Roboto+Slab...");
```

**After:**

```ts
// fonts.ts
export const ubuntu = Ubuntu({ subsets: ['latin'], variable: '--font-ubuntu', ... });
export const robotoSlab = Roboto_Slab({ subsets: ['latin'], variable: '--font-roboto-slab', ... });
```

**Why:** `@import url(https://fonts.googleapis.com/...)` loads fonts from a third-party server at runtime. The service worker cannot cache cross-origin responses from Google Fonts without extra configuration. Moving to `next/font/google` causes Next.js to download the font files at build time and self-host them on the same origin - they are then included in the SW precache manifest and available offline automatically.

The `.font-ubuntu` and `.font-roboto-slab` utility classes in `globals.css` now reference the CSS variables (`var(--font-ubuntu)`) instead of the string `"Ubuntu"`. The variables are injected into `<body>` via the font object's `.variable` class.

---

### 2. Offline fallback page created

**File:** `src/app/offline/page.tsx`

**Why:** Without a fallback, a user who is offline and navigates to an uncached route sees the browser's native "no connection" error page (the dinosaur on Chrome). This breaks the app-like feel of a PWA. A custom offline page with a retry button and brand styling maintains the experience.

The page is a static React component with no server-side data fetching, so Serwist includes it in the precache manifest at build time. This guarantees it is available offline before any user interaction.

**Service worker config:**

```ts
offlineFallbacks: {
  document: '/offline',
},
```

This tells Serwist to serve `/offline` for any failed navigation fetch (when no runtime cache matches either).

---

### 3. Service worker improved

**File:** `src/app/sw.ts`

**Before:** Only `/` and `/login` were covered by NetworkFirst caching.

**After:** All public marketing pages are cached:

```ts
matcher: ({ url }) =>
  url.pathname === '/' ||
  url.pathname.startsWith('/about') ||
  url.pathname.startsWith('/how-it-works') ||
  url.pathname.startsWith('/contact') ||
  url.pathname.startsWith('/marketplace') ||
  url.pathname.startsWith('/privacy') ||
  url.pathname.startsWith('/terms') ||
  url.pathname.startsWith('/support'),
```

Added caching strategies:

- **Auth pages** (login, register, forgot-password): NetworkFirst with 3s timeout. The form renders offline; the actual submit fails gracefully with a network error message.
- **Images** (`/images/`, `/favicon_io/`, `*.png`): CacheFirst. Product images rarely change and are expensive to re-fetch.
- **Next.js static chunks** (`/_next/static/`): StaleWhileRevalidate. Serves instantly from cache, updates in the background.
- **offlineFallbacks**: `document: '/offline'` for any uncached navigation.

**What stays NetworkOnly:**

- All dashboard routes - Next.js middleware must run on every request for auth redirects.
- All `/api/` routes - auth tokens, mutations, and session checks must never be cached.

---

### 4. manifest.ts improved

**File:** `src/app/manifest.ts`

Changes:

- Added `id: '/'` for stable PWA identity across URL changes.
- Added `display_override: ['window-controls-overlay', 'standalone', 'minimal-ui']` so the browser picks the best supported display mode.
- Added `dir: 'ltr'`.
- Fixed `screenshots` to include `form_factor: 'wide'` (required for Chrome's richer install dialog on Android).
- Added `label` to the screenshot entry.
- Added `shortcuts` with a "Browse Marketplace" shortcut.
- Added `prefer_related_applications: false` to explicitly signal the web app is the preferred version.

---

### 5. Dead middleware file deleted

**Deleted:** `src/app/middleware.ts`

Next.js only reads middleware from `src/middleware.ts` (or project root `middleware.ts`). The file at `src/app/middleware.ts` was unreachable dead code with a different auth implementation (JWT token-based vs. the active cookie-based one at `src/middleware.ts`). Keeping it risked confusion about which middleware was actually running.

---

### 6. site.webmanifest fixed

**File:** `public/favicon_io/site.webmanifest`

**Before:** `name` and `short_name` were empty strings. Icon paths pointed to `/android-chrome-192x192.png` (wrong - icons are in `/favicon_io/`).

**After:** Correct name, theme color, and icon paths matching the actual file locations.

Note: The primary manifest is served by Next.js at `/manifest.webmanifest` from `src/app/manifest.ts`. The `public/favicon_io/site.webmanifest` is a secondary static file that some browsers or link tags might reference. Keeping it consistent avoids subtle bugs.

---

## Files changed summary

| File                                 | Change                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `src/app/fonts.ts`                   | Added Ubuntu and Roboto Slab via `next/font/google`                              |
| `src/app/globals.css`                | Removed `@import url(...)` for both fonts; font utility classes now use CSS vars |
| `src/app/layout.tsx`                 | Added `ubuntu.variable` and `robotoSlab.variable` to body class                  |
| `src/app/manifest.ts`                | Added `id`, `display_override`, `dir`, `shortcuts`, fixed `screenshots`          |
| `src/app/sw.ts`                      | Expanded public page caching, added image cache, added `offlineFallbacks`        |
| `src/app/offline/page.tsx`           | Created offline fallback page                                                    |
| `src/app/middleware.ts`              | Deleted (dead code)                                                              |
| `public/favicon_io/site.webmanifest` | Fixed name, short_name, and icon paths                                           |
