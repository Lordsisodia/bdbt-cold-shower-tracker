import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI components and styling
          'ui-vendor': [
            '@headlessui/react',
            '@radix-ui/react-slot',
            'lucide-react',
            'react-icons',
            'framer-motion',
            'react-hot-toast'
          ],
          
          // PDF and document generation
          'pdf-vendor': ['jspdf', '@pdf-lib/fontkit', 'html2canvas', 'jszip'],
          
          // Supabase and data
          'data-vendor': ['@supabase/supabase-js', 'axios'],
          
          // Utilities
          'utils-vendor': [
            'date-fns',
            'uuid',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],
          
          // Development and MCP
          'dev-vendor': ['@modelcontextprotocol/sdk', '@notionhq/client']
        }
      }
    },
    // Increase chunk size warning limit since we're code splitting properly
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for production debugging
    sourcemap: false,
    
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ]
  }
})