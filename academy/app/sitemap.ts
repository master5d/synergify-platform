import type { MetadataRoute } from 'next'

// ⚠ Metadata-route под `output: 'export'` требует force-static (гоча Next 16).
export const dynamic = 'force-static'

const SITE = 'https://academy.synergify.com'

/** Публичные страницы академии; RU канон, EN — альтернатива через hreflang.
 *  Уроки /praktika/<slug>/ за admission-гейтом — в sitemap не попадают (noindex). */
const PATHS: string[] = ['', 'pravila', 'praktika']

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
