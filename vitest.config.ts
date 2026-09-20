import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom covers both component and node-style tests
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/__tests__/setup.ts"],
    // e2e/ holds Playwright specs (its own test()/test.use() API, run via
    // `npm run test:e2e`) — vitest's default glob would otherwise also pick
    // up *.spec.ts files there and crash on the API mismatch. .claude/ can
    // contain leftover agent worktrees with their own node_modules, which
    // vitest would otherwise also try to run as a second, version-mismatched
    // copy of this same test suite.
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.claude/**"],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "next/font/google": path.resolve(__dirname, "./src/__tests__/__mocks__/next-font.ts"),
      "next/server": path.resolve(__dirname, "./src/__tests__/__mocks__/next-server.ts"),
      "next/navigation": path.resolve(__dirname, "./src/__tests__/__mocks__/next-navigation.ts"),
    },
  },
});
