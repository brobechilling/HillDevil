import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "zustand"],
    force: true,
  },

  server: {
    port: 5000,
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

});
