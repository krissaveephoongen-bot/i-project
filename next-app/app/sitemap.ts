import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://i-projects.skin'
  const now = new Date()
  const staticPaths = [
    '/',
    '/dashboard',
    '/projects',
    '/projects/weekly-activities',
    '/reports',
    '/resources',
    '/expenses',
    '/timesheet',
    '/users',
    '/vendor',
    '/vendor/login',
    '/staff',
    '/staff/login',
    '/settings',
    '/help',
    '/profile',
    '/admin',
    '/admin/users',
    '/admin/health'
  ]
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '/' ? 'daily' : 'weekly',
    priority: p === '/' ? 1 : 0.7,
  }))
  try {
    const res = await fetch(`${base}/api/projects`, { cache: 'no-store' })
    if (res.ok) {
      const rows: any[] = await res.json()
      for (const prj of rows || []) {
        const updated = prj.updated_at || prj.updatedAt || now
        entries.push({
          url: `${base}/projects/${prj.id}`,
          lastModified: new Date(updated),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {}
  return entries
}
