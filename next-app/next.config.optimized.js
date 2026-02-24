/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Output configuration
  output: 'standalone',
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB
    serverComponentsExternalPackages: ['@mui/material', '@mui/icons-material'],
  },
  
  // Image optimization
  images: {
    domains: ['rllhsiguqezuzltsjntp.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
          components: {
            test: /[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          pages: {
            test: /[\\/]pages[\\/]/,
            name: 'pages',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
        },
      };
      
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type' },
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable',
          },
        ],
      },
      {
        source: '/(.*\\.(?:jpg|jpeg|png|gif|webp|avif|svg))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API routes
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'https://i-project-mgnt-apw.vercel.app';
    return [
      // Proxy vendor/expense backoffice APIs to Express backend
      {
        source: '/api/vendors-management/:path*',
        destination: `${backendBase}/api/vendors-management/:path*`,
      },
      {
        source: '/api/vendor-contracts/:path*',
        destination: `${backendBase}/api/vendor-contracts/:path*`,
      },
      {
        source: '/api/vendor-payments/:path*',
        destination: `${backendBase}/api/vendor-payments/:path*`,
      },
      {
        source: '/api/vendor-kpi/:path*',
        destination: `${backendBase}/api/vendor-kpi/:path*`,
      },
      {
        source: '/api/expense-items/:path*',
        destination: `${backendBase}/api/expense-items/:path*`,
      },
      // Keep internal Next APIs untouched
      {
        source: '/api/health',
        destination: '/api/health',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Compression
  compress: true,
  
  // Security headers
  poweredByHeader: false,
  
  // Enable SWC minification
  swcMinify: true,
};

module.exports = nextConfig;
