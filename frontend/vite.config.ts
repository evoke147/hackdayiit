import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split vendor libraries into separate cacheable chunks
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router'
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query'
          }
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
            return 'vendor-forms'
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
            return 'vendor-charts'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
        }
      }
    }
  },
  // @ts-ignore
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Use the dedicated test tsconfig so vitest/globals and jest-dom types are recognised
    typecheck: {
      tsconfig: './tsconfig.test.json'
    }
  },
})
