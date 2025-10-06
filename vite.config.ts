import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path to be relative.
  // This ensures that asset paths in the built HTML are relative (e.g., "./assets/index.js")
  // instead of absolute (e.g., "/assets/index.js"), which is necessary for deployments
  // to a subdirectory, like on GitHub Pages.
  base: './',
});
