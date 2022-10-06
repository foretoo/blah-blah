import { defineConfig } from "vite"
import glsl from "vite-plugin-glsl"

export default defineConfig({
  publicDir: false,
  plugins: [glsl()],
  server: {
    open: "/pkg/index.html",
    host: true,
  },
  optimizeDeps: { entries: "./pkg/index.ts" },
  build: {
    // assetsDir: ".",
    // rollupOptions: {
    //   input: "/src/index.ts",
    //   output: {
    //     dir: "dist",
    //     assetFileNames: "style.css",
    //     entryFileNames: "bundle.js",
    //   },
    // },
    lib: {
      entry: "./pkg/index.ts",
      fileName: "index",
      formats: [ "es" ],
    },
    outDir: "build",
    rollupOptions: { external: "three" },
    emptyOutDir: false,
  },
})