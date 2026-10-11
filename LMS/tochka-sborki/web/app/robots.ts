import type { MetadataRoute } from 'next'
import { COURSE } from '@/lib/course'
import { IS_MIRROR } from '@/lib/mirror'

export const dynamic = 'force-static'

const BASE = COURSE.domain

export default function robots(): MetadataRoute.Robots {
  // Зеркало: robots.txt в подпути краулеры не читают — настоящая защита от дубля — meta noindex в layout.
  if (IS_MIRROR) return { rules: { userAgent: '*', disallow: '/' } }
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
