# Web App Manifest

The manifest is a JSON file that tells the browser how your app should look and behave when installed. It is linked from the HTML `<head>` via a `<link rel="manifest">` tag.

---

## Minimal valid manifest

```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1b4332",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
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

A browser will not show the install prompt unless the app has at least a 192x192 and a 512x512 icon.

---

## All important fields

### Identity

| Field         | Purpose                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Stable PWA identity string. Use `/` or `/?source=pwa`. The browser uses this to deduplicate installs if the URL ever changes. |
| `name`        | Full name shown on the install dialog and OS app drawer. Max ~45 characters.                                                  |
| `short_name`  | Shown on the home screen under the icon. Max ~12 characters.                                                                  |
| `description` | Used by app stores and some OS install flows.                                                                                 |

### Display

| Field              | Values                                              | Notes                                                                                                   |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `display`          | `standalone`, `fullscreen`, `minimal-ui`, `browser` | `standalone` is the most common choice. Hides browser chrome.                                           |
| `display_override` | Array of display modes                              | Browser picks the first one it supports. E.g. `["window-controls-overlay", "standalone", "minimal-ui"]` |
| `orientation`      | `portrait-primary`, `landscape`, `any`              | Lock or hint at orientation.                                                                            |

### Colors

| Field              | Purpose                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `background_color` | Shown on the splash screen before the app shell loads. Match your page background.         |
| `theme_color`      | Colors the browser toolbar and status bar. Must match `<meta name="theme-color">` in HTML. |

### Scope and start URL

| Field       | Purpose                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `scope`     | Defines which URLs are part of the installed app. Usually `/`. If a user navigates outside scope, the browser opens a new tab. |
| `start_url` | Where the app opens when launched from home screen. Can include UTM params: `/?source=pwa`                                     |

### Icons

The `icons` array must include at least 192x192 and 512x512 entries. Each icon object:

```json
{
  "src": "/icons/icon-512.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "any maskable"
}
```

`purpose` values:

- `any` - browser can use freely (resize, tint, crop)
- `maskable` - safe for adaptive icon shapes (Android squircle, etc.). The icon must have safe-zone padding (80% of the image in the center circle is the safe area).
- You can combine: `"any maskable"` if one icon works for both.

### Screenshots

Used by Chrome and Android to show a richer install dialog.

```json
{
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "App dashboard"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "App on mobile"
    }
  ]
}
```

`form_factor` values: `wide` (desktop/tablet, aspect ratio > 1) or `narrow` (mobile, portrait).

### Shortcuts

App shortcuts appear when long-pressing the icon on Android or right-clicking the taskbar icon on desktop.

```json
{
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dash",
      "description": "Go to your dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/icons/icon-192.png", "sizes": "192x192" }]
    }
  ]
}
```

### Other useful fields

| Field                         | Purpose                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `lang`                        | Language of the app name/description. E.g. `en-NG`.                                  |
| `dir`                         | Text direction. `ltr` or `rtl`.                                                      |
| `categories`                  | Hint for app stores. E.g. `["food", "shopping"]`.                                    |
| `prefer_related_applications` | Set to `false` to indicate the web app is preferred over a native app.               |
| `related_applications`        | Array of native app store listings. Only relevant if you have companion native apps. |

---

## Linking the manifest in HTML

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

In Next.js App Router, create `app/manifest.ts` and export a function - Next.js handles the `<link>` tag automatically.

---

## Validation

- Chrome DevTools > Application > Manifest
- Lighthouse audit (installability section)
- [web.dev/pwa-checklist](https://web.dev/pwa-checklist/)
