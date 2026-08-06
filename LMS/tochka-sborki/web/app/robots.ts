import type { MetadataRoute } from 'next'
import { COURSE } from '@/lib/course'

export const dynamic = 'force-static'

const BASE = COURSE.domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Auth-gated / private routes — keep out of the index.
      disallow: ['/dashboard/', '/character/', '/login/', '/quest-intake/', '/admin/', '/dungeon/', '/exercises/', '/offline/', '/alumni/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
