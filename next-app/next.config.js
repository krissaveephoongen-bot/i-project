/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  // Skip static generation for API-based pages that need dynamic rendering
  // Pages using client-side fetching will be handled as SSR
}

module.exports = nextConfig
