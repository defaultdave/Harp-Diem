import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Default to '/' for root-domain hosting (AWS S3 + CloudFront).
  // The gh-pages deploy script overrides this via VITE_BASE_PATH=/Harp-Diem/.
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    // Do not ship source maps to production (avoids exposing readable source).
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // React and related libraries in a separate chunk
          'vendor-react': ['react', 'react-dom'],
          // Tonal music theory library in a separate chunk
          'vendor-tonal': ['tonal'],
          // Export-related libraries (lazy loaded) in a separate chunk
          'vendor-export': ['html2canvas', 'jspdf'],
        },
      },
    },
  },
})
