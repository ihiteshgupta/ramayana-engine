import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "renderer",
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "renderer/src/engine"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
