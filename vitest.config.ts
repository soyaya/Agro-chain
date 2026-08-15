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
