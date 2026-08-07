import type { MetadataRoute } from 'next'
import { writtenSpeedreadingSlugs } from '../lib/speedreading/lessons'

// ⚠ Metadata-route под `output: 'export'` требует force-static (гоча Next 16).
export const dynamic = 'force-static'

const SITE = 'https://academy.synergify.com'

/** Публичные страницы академии; RU канон, EN — альтернатива через hreflang.
 *  Уроки /praktika/<slug>/ за admission-гейтом — в sitemap не попадают (noindex).
 *  Тренажёры и уроки скорочтения публичны (public-domain метод) — попадают. */
const PATHS: string[] = [
  '', 'pravila', 'praktika',
  'trenazhery', 'trenazhery/rsvp', 'trenazhery/schulte', 'trenazhery/test',
  ...writtenSpeedreadingSlugs().map((slug) => `trenazhery/${slug}`),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => {
    const suffix = path ? `${path}/` : ''
    return {
      url: `${SITE}/${suffix}`,
      alternates: {
        languages: {
          ru: `${SITE}/${suffix}`,
          en: `${SITE}/en/${suffix}`,
          'x-default': `${SITE}/${suffix}`,
        },
      },
    }
  })
}
