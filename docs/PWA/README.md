# PWA Reference

A Progressive Web App (PWA) is a web application that uses modern browser APIs to deliver app-like capabilities: offline support, installability, push notifications, and hardware access - without shipping a native app.

This folder documents everything you need to build a production-quality PWA in any framework.

---

## What makes a PWA

Three hard requirements from the browser's perspective:

| Requirement          | Why it matters                                           |
| -------------------- | -------------------------------------------------------- |
| HTTPS (or localhost) | Service workers only register on secure origins          |
| Web App Manifest     | Tells the browser how to install and display the app     |
| Service Worker       | Intercepts network requests; enables offline and caching |

Beyond those three, the quality of your PWA is determined by your caching strategy, icon set, offline experience, and how well you handle the install lifecycle.

---

## Core concepts

- [Web App Manifest](./manifest.md) - identity, icons, display mode, installability
- [Service Worker](./service-worker.md) - lifecycle, caching strategies, fetch interception
- [Offline Patterns](./offline.md) - fallback pages, stale-while-revalidate, background sync
- [Icons and Splash Screens](./icons.md) - sizes, maskable icons, platform requirements
- [Install Prompt](./install-prompt.md) - beforeinstallprompt, A2HS, deferring the prompt

---

## Framework guides

- [Next.js + Serwist](./next-js-serwist.md) - what this project uses
- [React + Vite PWA Plugin](./react-vite.md) - vite-plugin-pwa setup
- [Plain HTML / Vanilla JS](./vanilla.md) - no build tool required

---

## Checklist

Use [checklist.md](./checklist.md) before shipping.

---

## What was implemented in this project

See [implementation-notes.md](./implementation-notes.md) for the exact changes made to this Next.js app and why each decision was made.
