import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
      ],
      manifest: {
        id: "./",
        name: "RandomGroup",
        short_name: "RandomGroup",
        description: "Sorteie grupos, ordem, temas e jogos com as suas regras.",
        lang: "pt",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1557e8",
        categories: ["education", "utilities"],
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,mjs,css,html,png,svg,ttf,webmanifest}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
