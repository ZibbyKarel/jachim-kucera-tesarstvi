import type { MetadataRoute } from 'next'
import { SITE, services, projects } from '@/lib/constants'
import { routing } from '@/i18n/routing'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/realizace',
    '/o-mne',
    '/kontakt',
    ...services.map((s) => `/sluzby/${s.slug}`),
  ]

  const now = new Date()

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'monthly' : 'yearly',
    priority: path === '' ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [
          loc,
          loc === routing.defaultLocale
            ? `${BASE}${path}`
            : `${BASE}/${loc}${path}`,
        ])
      ),
    },
  }))

  // Realizace jsou řešené modálem na /realizace, přidáme je jako kotvy pro úplnost.
  for (const project of projects) {
    entries.push({
      url: `${BASE}/realizace#${project.id}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    })
  }

  return entries
}
