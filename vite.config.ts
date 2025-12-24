import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// Load environment variables
const env = loadEnv('development', process.cwd(), '');

export default defineConfig({
  define: {
    'process.env': { ...env, NODE_DEBUG: 'false' },
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
    svgr(),
    nodePolyfills({
      include: [
        'crypto',
        'events',
        'stream',
        'util',
        'buffer',
        'process',
        'assert',
        'url',
        'path',
        'os',
        'querystring',
        'string_decoder',
        'timers',
        'readline',
        'zlib'
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true,
        __dirname: true,
      },
      protocolImports: true,
    }),
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
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      module: false,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin()
      ],
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['pg', 'dotenv'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['@headlessui/react', '@heroicons/react'],
        },
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
