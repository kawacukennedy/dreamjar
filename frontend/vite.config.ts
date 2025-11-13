import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      //   registerType: "autoUpdate",
      //   workbox: {
      //     globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      //     runtimeCaching: [
      //       {
      //         urlPattern: /^https:\/\/api\./,
      //         handler: "NetworkFirst",
      //         options: {
      //           cacheName: "api-cache",
      //           expiration: {
      //             maxEntries: 100,
      //             maxAgeSeconds: 60 * 60 * 24, // 24 hours
      //           },
      //         },
      //       },
      //     ],
      //   },
      //   includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      //   manifest: {
      //     name: "DreamJar",
      //     short_name: "DreamJar",
      //     description: "Turn your dreams into smart contracts on TON",
      //     theme_color: "#6C5CE7",
      //     background_color: "#F7F7FB",
      //     display: "standalone",
      //     start_url: "/",
      //     icons: [
      //       {
      //         src: "icon-192.png",
      //         sizes: "192x192",
      //         type: "image/png",
      //         purpose: "any maskable",
      //       },
      //       {
      //         src: "icon-512.png",
      //         sizes: "512x512",
      //         type: "image/png",
      //         purpose: "any maskable",
      //       },
      //     ],
      //   },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ton: ["@tonconnect/ui-react", "@twa-dev/sdk"],
          ui: ["react-router-dom", "react-intersection-observer"],
        },
      },
    },
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    host: true,
    port: 3000,
  },
});
