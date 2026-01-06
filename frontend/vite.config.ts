import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';

// Load environment variables
const env = loadEnv('development', process.cwd(), '');

// Environment variables with VITE_ prefix are automatically exposed to the client

export default defineConfig({
  base: '/',
  define: {
    'process.env': {
      NODE_ENV: env.NODE_ENV || 'development',
      NODE_DEBUG: 'false'
    },
    'process.version': '"18.0.0"',
    'process.platform': '"browser"',
    'process.browser': 'true',
    __APP_ENV__: env.APP_ENV,
    global: 'globalThis',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-macros',
        ],
      },
    }),
    svgr({
      svgrOptions: {
        // Disable SVGO optimization to prevent issues with some SVGs
        svgo: false,
      },
    }),
    visualizer({
      filename: './dist/stats.html',
      open: process.env.NODE_ENV !== 'CI',
      gzipSize: true,
      brotliSize: true,
    }) as Plugin,
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Node.js polyfills
      stream: 'stream-browserify',
      util: 'util/',
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      path: 'path-browserify',
      process: 'process/browser',
      zlib: 'browserify-zlib',
      fs: './empty-module.js',
      net: './empty-module.js',
      tls: './empty-module.js',
      dns: './empty-module.js',
      child_process: './empty-module.js',
      module: './empty-module.js',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'recharts',
      'date-fns',
      'lodash',
      'zod',
      'axios',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  worker: {
    format: 'es',
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000KB
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Group large dependencies into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts', 'd3-shape', 'd3-scale', 'd3-array'],
          'vendor-utils': ['date-fns', 'lodash', 'zod'],
          'vendor-http': ['axios'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
});
