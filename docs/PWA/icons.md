# Icons and Splash Screens

Icons are required for the install prompt. The wrong sizes or missing `purpose` fields cause Lighthouse to flag the app as non-installable.

---

## Required icon sizes

| Size    | Used for                                   |
| ------- | ------------------------------------------ |
| 192x192 | Android home screen, Chrome install prompt |
| 512x512 | Android splash screen, app stores          |
| 180x180 | Apple touch icon (iOS home screen)         |
| 32x32   | Browser tab favicon                        |
| 16x16   | Browser tab favicon (small)                |

The 192 and 512 sizes are the bare minimum for Chrome's installability check.

---

## Icon purpose

```json
{
  "src": "/icons/icon-512.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "any"
}
```

| Value          | Meaning                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `any`          | Browser can use the icon freely - resize, tint, crop to any shape        |
| `maskable`     | Safe for adaptive icon shapes (Android squircle, circle, teardrop, etc.) |
| `any maskable` | Both. Only use if your icon is genuinely safe for both uses.             |

### Maskable icon safe zone

Android's adaptive icons crop the icon to a shape (squircle, circle, etc.). The safe zone is the inner 80% of the image (a circle with radius 40% of the image width). Anything outside that circle may be cropped.

Use [maskable.app](https://maskable.app) to preview your icon in all shapes.

```
┌──────────────────────┐
│                      │
│    ┌──────────┐      │
│    │  SAFE    │      │
│    │  ZONE    │      │
│    └──────────┘      │
│                      │
└──────────────────────┘
  Full image (512x512)
  Safe zone = inner circle at 40% radius
```

### Best practice

Maintain two separate icon files:

- `icon-192-any.png` - regular icon, no padding
- `icon-512-maskable.png` - icon with extra padding so the design is inside the safe zone

Then reference them separately in the manifest:

```json
{
  "icons": [
    {
      "src": "/icons/icon-192-any.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## Apple-specific requirements

iOS does not use the web app manifest for icons. It uses `<link rel="apple-touch-icon">` tags in the HTML `<head>`.

```html
<link
  rel="apple-touch-icon"
  sizes="180x180"
  href="/icons/apple-touch-icon.png"
/>
```

In Next.js:

```ts
export const metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My App",
  },
};
```

And in the `icons` metadata field:

```ts
export const metadata = {
  icons: {
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};
```

---

## Splash screens (iOS)

iOS generates splash screens from the apple-touch-icon. You cannot customize them with an image file alone unless you provide `apple-touch-startup-image` link tags for every device resolution.

There are many screen sizes. Use a generator tool rather than maintaining them manually:

- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - generates all required sizes from a single source image
- [Progressier](https://progressier.com) - SaaS splash screen generator

---

## Generating icons

Given one high-resolution source image (1024x1024 or larger, square, on a solid background):

```bash
# Using pwa-asset-generator (generates icons AND splash screens)
npx pwa-asset-generator logo.png public/icons \
  --index public/index.html \
  --manifest public/manifest.json \
  --padding "10%" \
  --maskable

# Outputs: icon-192.png, icon-512.png, apple-touch-icon.png,
#          splash images for all iOS resolutions, and updates manifest/index
```

---

## Favicon

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="shortcut icon" href="/favicon.ico" />
```

In Next.js App Router, place a `favicon.ico` in the `app/` directory and it is automatically linked. For SVG favicons with dark mode support:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-32x32.png" type="image/png" />
```
