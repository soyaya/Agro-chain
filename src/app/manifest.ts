import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stable PWA identity - browsers use this to deduplicate installs across URL changes
    id: "/",
    name: "Agro-chain | Nigeria's Catfish Marketplace",
    short_name: "Agro-chain",
    description:
      "Connecting verified catfish farmers to bulk buyers across Nigeria. Secure payments, fair pricing, and coordinated delivery.",
    start_url: "/",
    scope: "/",
    // display_override lets the browser pick the best supported mode in order
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1b4332",
    orientation: "portrait-primary",
    categories: ["food", "shopping", "business"],
    lang: "en-NG",
    dir: "ltr",
    icons: [
      {
        src: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon_io/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon_io/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        // "any" = browser can use it freely (resize, tint, crop)
        purpose: "any",
      },
      {
        src: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        // "maskable" = safe for adaptive icon shapes (Android squircle, etc.)
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/images/og-hero.png",
        sizes: "1200x630",
        type: "image/png",
        // "wide" targets desktop/tablet install prompts (aspect ratio > 1)
        // @ts-expect-error - form_factor is valid per W3C spec but not yet in Next.js types
        form_factor: "wide",
        label: "Agro-chain marketplace homepage",
      },
    ],
    shortcuts: [
      {
        name: "Browse Marketplace",
        short_name: "Marketplace",
        description: "Browse available catfish listings",
        url: "/marketplace",
        icons: [
          { src: "/favicon_io/android-chrome-192x192.png", sizes: "192x192" },
        ],
      },
    ],
    prefer_related_applications: false,
  };
}
