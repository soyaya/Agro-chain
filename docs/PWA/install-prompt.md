# Install Prompt (Add to Home Screen)

Browsers trigger an install prompt automatically when a PWA meets the installability criteria. You can intercept this event to show your own custom UI at a better moment.

---

## How it works

1. Browser checks installability criteria (HTTPS, manifest, SW, icons).
2. If met, the browser fires `beforeinstallprompt` on `window`.
3. You call `event.preventDefault()` to suppress the default browser banner.
4. Store the event reference and show your own UI when ready.
5. When the user clicks your install button, call `event.prompt()`.
6. The browser shows the native dialog. Await `event.userChoice` to know if they accepted.

---

## React hook

```ts
// hooks/useInstallPrompt.ts
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async (): Promise<"accepted" | "dismissed" | null> => {
    if (!prompt) return null;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    return outcome;
  };

  return { canInstall: Boolean(prompt), install, installed };
}
```

### Usage

```tsx
function InstallBanner() {
  const { canInstall, install, installed } = useInstallPrompt();

  if (installed || !canInstall) return null;

  return (
    <div className="install-banner">
      <p>Install this app for a better experience</p>
      <button onClick={install}>Install</button>
    </div>
  );
}
```

---

## When to show the prompt

Never show it immediately on page load. Users dismiss prompts they did not ask for, and a dismissed prompt cannot be re-shown without user action.

Good moments to prompt:

- After a user completes a meaningful action (e.g. placed an order, saved a listing)
- When the user has visited at least 3 times
- In the app footer or settings page, always visible for interested users

---

## Detecting if already installed

```ts
// Check via display-mode media query
const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

// iOS Safari
const isIOSSafari =
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
```

Use this to skip showing install prompts to users who already installed the app.

---

## iOS limitations

iOS Safari does not support `beforeinstallprompt`. The only way to install a PWA on iOS is:

1. User taps the Share button in Safari
2. Taps "Add to Home Screen"

You must instruct iOS users manually. Show a tooltip when on iOS Safari:

```tsx
function IOSInstallHint() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isStandalone = (navigator as Navigator & { standalone?: boolean })
    .standalone;

  if (!isIOS || !isSafari || isStandalone) return null;

  return <p>To install: tap the Share button then "Add to Home Screen"</p>;
}
```

---

## Testing

- Chrome on Android triggers `beforeinstallprompt` automatically if criteria are met.
- Desktop Chrome also supports install (shows install icon in the address bar).
- iOS: must test on a real device or Safari on macOS with Responsive Design Mode.
- To reset the prompt after dismissing in Chrome: DevTools > Application > Manifest > "Add to homescreen" link.
