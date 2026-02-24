import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://i-projects.skin').replace(/\/+$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/staff/login', '/vendor/login', '/settings', '/profile'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
