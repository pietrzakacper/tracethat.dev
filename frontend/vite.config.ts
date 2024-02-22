import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dir, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/events": {
        target: "http://localhost:8080",
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});