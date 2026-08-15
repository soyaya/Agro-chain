import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";
import fs from "fs";

// Get the real canonical path, resolving any symlinks and normalising casing.
// On Windows, pnpm's SWC/flight loaders pass lowercase paths like
// C:\users\user\dev\... while the real path is C:\Users\User\dev\...
// Webpack treats them as different modules, so Next.js internals get
// bundled twice → "invariant expected layout router to be mounted".
function realpath(p: string): string {
  try {
    return fs.realpathSync.native(p);
  } catch {
    return p;
  }
}

const nextModulesDir = realpath(
  path.join(__dirname, "node_modules", "next", "dist")
);

// The specific Next.js files that hold shared React context.
// Aliasing these forces webpack to always use exactly one module instance.
const nextInternals: Record<string, string> = {
  // App Router context — the one that throws the invariant
  "next/dist/client/components/layout-router":
    path.join(nextModulesDir, "client/components/layout-router.js"),
  "next/dist/client/components/app-router":
    path.join(nextModulesDir, "client/components/app-router.js"),
  "next/dist/client/components/navigation":
    path.join(nextModulesDir, "client/components/navigation.js"),
  "next/dist/client/components/render-from-template-context":
    path.join(nextModulesDir, "client/components/render-from-template-context.js"),
  // Shared runtime singletons
  "next/dist/shared/lib/router/context.shared-runtime":
    path.join(nextModulesDir, "shared/lib/router/context.shared-runtime.js"),
  "next/dist/shared/lib/server-inserted-html.shared-runtime":
    path.join(nextModulesDir, "shared/lib/server-inserted-html.shared-runtime.js"),
  "next/dist/client/app-index":
    path.join(nextModulesDir, "client/app-index.js"),
};

const nextConfig: NextConfig = {
  reactStrictMode: true,

  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> ?? {}),
      ...nextInternals,
    };
    return config;
  },

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
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: true,
  register: true,
});

export default withSerwist(nextConfig);
