import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let createServer: (() => any) | undefined;

try {
  createServer = require("./server").createServer;
} catch {
  // Ignore error in production
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: "client", // Important: index.html is in client/
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["../shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "../server/**"],
    },
  },
  build: {
    outDir: "../dist/spa", // Build output goes outside client/
    emptyOutDir: true,
    base: "./",           // <--- Added this line for relative asset paths
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
    apply: "serve",
    configureServer(server) {
      if (!createServer) return;
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
