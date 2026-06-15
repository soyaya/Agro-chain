# PWA Pre-ship Checklist

Run through this before marking PWA support as complete.

---

## Core (must pass Lighthouse)

- [ ] Served over HTTPS (or localhost for dev)
- [ ] `<link rel="manifest">` in every page `<head>`
- [ ] Manifest has valid `name`, `short_name`, `start_url`, `display`
- [ ] Manifest has a 192x192 icon and a 512x512 icon
- [ ] Service worker registered and active
- [ ] Service worker responds to `fetch` events
- [ ] App loads in some form when offline (either cached shell or offline page)

---

## Installability

- [ ] 192x192 icon with `purpose: "any"` in manifest
- [ ] 512x512 icon with `purpose: "maskable"` in manifest
- [ ] Maskable icon passes safe zone test at [maskable.app](https://maskable.app)
- [ ] `theme_color` in manifest matches `<meta name="theme-color">` in HTML
- [ ] `background_color` matches the page background (avoids flash on splash screen)
- [ ] `display` is `standalone` or `fullscreen` (not `browser`)
- [ ] `id` field set for stable install identity

---

## Offline experience

- [ ] Public pages (home, about, etc.) are cached with NetworkFirst or StaleWhileRevalidate
- [ ] A custom offline page exists and is precached
- [ ] Protected/auth-gated routes use NetworkOnly (middleware must always run)
- [ ] API routes use NetworkOnly (never cache mutations)
- [ ] Static assets (JS, CSS, fonts, icons) are cached

---

## Fonts

- [ ] Fonts are self-hosted or served from the same origin (not via Google Fonts @import at runtime)
- [ ] Fonts load correctly when offline

---

## iOS / Apple

- [ ] `<link rel="apple-touch-icon" href="...">` present with 180x180 icon
- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">` set
- [ ] `<meta name="apple-mobile-web-app-status-bar-style">` set
- [ ] `<meta name="apple-mobile-web-app-title">` set
- [ ] Tested on real iOS Safari (not just simulator)

---

## Performance

- [ ] Lighthouse PWA score 90+
- [ ] First Contentful Paint < 3s on 3G simulation
- [ ] App shell renders before JS bundles load (if SSR is used)
- [ ] No render-blocking fonts from external CDNs

---

## Security

- [ ] Auth-gated pages use `NetworkOnly` in SW - middleware cannot be bypassed
- [ ] Auth cookies are `HttpOnly` and `Secure`
- [ ] SW does not cache auth tokens or session data
- [ ] `/sw.js` served with `Cache-Control: no-cache, no-store`

---

## Advanced (optional but good)

- [ ] Install prompt shown at the right moment (not immediately on page load)
- [ ] Update prompt shown when a new SW version is available
- [ ] `shortcuts` in manifest for common user actions
- [ ] `screenshots` in manifest with `form_factor: "wide"` and `"narrow"` for richer install dialog
- [ ] Push notifications wired up with VAPID keys
- [ ] Background sync for offline form submissions

---

## Validation tools

- Chrome DevTools > Lighthouse > Progressive Web App
- Chrome DevTools > Application > Manifest / Service Workers
- [web.dev/measure](https://web.dev/measure) for a public URL audit
- [maskable.app](https://maskable.app) for icon safe zone preview
- [pwabuilder.com](https://pwabuilder.com) for cross-platform compatibility report
