import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    warmup: {
      clientFiles: ["./src/main.tsx", "./src/routes/index.tsx"],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "axios",
      "socket.io-client",
      "lucide-react",
      "sonner",
      "date-fns",
    ],
    exclude: ["@react-pdf/renderer"],
  },
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@react-pdf")) return "vendor-pdf";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("socket.io-client")) return "vendor-socket";
          if (id.includes("@react-oauth")) return "vendor-google";
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("/react/")
          ) {
            return "vendor-react";
          }
          if (id.includes("@reduxjs") || id.includes("redux-persist")) {
            return "vendor-redux";
          }
          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
