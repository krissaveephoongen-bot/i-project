/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@supabase/supabase-js'],
  staticPageGenerationTimeout: 120,
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react', 'clsx'],
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    dangerouslyAllowSVG: true,
  },
  // Optimize fonts
  optimizeFonts: true,
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const backendBase = isDev 
      ? 'http://localhost:3001' 
      : (process.env.NEXT_PUBLIC_API_URL || 'https://i-project-mgnt-apw.vercel.app');
    return [
      // Proxy vendor & expense item APIs to Express backend
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
    ];
  }
}

module.exports = nextConfig
