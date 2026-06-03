import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agro-chain | Nigeria's Catfish Marketplace",
    short_name: "Agro-chain",
    description:
      "Connecting verified catfish farmers to bulk buyers across Nigeria. Secure payments, fair pricing, and coordinated delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1b4332",
    orientation: "portrait-primary",
    categories: ["food", "shopping", "business"],
    lang: "en-NG",
    scope: "/",
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
        purpose: "any",
      },
      {
        src: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/images/og-hero.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
