import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "renderer",
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "renderer/src/engine"),
    },
  },
  publicDir: resolve(__dirname, "public-dev"),
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
