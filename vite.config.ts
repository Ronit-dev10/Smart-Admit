import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let createServer: (() => any) | undefined;

try {
  createServer = require("./server").createServer;
} catch {
  // Ignore if ./server doesn't exist (e.g., in production build)
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: "client", // Tell Vite the root folder where index.html lives
  server: {
    host: "::",
    port: 8080,
    fs: {
      // Since root is "client", allow access to shared folder relative to root
      allow: ["../shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "../server/**"],
    },
  },
  build: {
    // Build output relative to root, so go up one folder to dist/spa
    outDir: "../dist/spa",
    emptyOutDir: true, // Clean output folder on build
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only during development
    configureServer(server) {
      if (!createServer) return;
      const app = createServer();

      // Use express app as middleware in vite dev server
      server.middlewares.use(app);
    },
  };
}
