import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      // next/font/google is not available in the vitest node environment
      "next/font/google": path.resolve(__dirname, "./src/__tests__/__mocks__/next-font.ts"),
    },
  },
});
