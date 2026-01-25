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
  base: '/Harp-Diem/',
  build: {
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
