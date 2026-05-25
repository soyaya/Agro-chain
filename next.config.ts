import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const BACKEND_ORIGIN = (process.env.BASE_BACKEND_URL ?? "http://localhost:5002")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig: NextConfig = {
  turbopack: {},
  reactStrictMode: true,

  // Proxy /api/* to the backend so httpOnly auth_token cookie stays same-origin.
  // afterFiles means Next.js API routes (e.g. /api/auth/*) are matched first;
  // everything else falls through to this rewrite and is forwarded to the backend.
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${BACKEND_ORIGIN}/api/:path*`,
        },
      ],
    };
  },

  // Security headers (applied globally)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Never cache the service worker itself
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',           // your custom service worker
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  // skipWaiting: true,
  //clientsClaim: true,
  // We will define runtimeCaching in sw.ts for maximum control
});

export default withSerwist(nextConfig);
