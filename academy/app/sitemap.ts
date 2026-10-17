import type { MetadataRoute } from 'next'
import { writtenSpeedreadingSlugs } from '../lib/speedreading/lessons'
import { isEideticsLive } from '../lib/eidetics/course'
import { writtenEideticsSlugs } from '../lib/eidetics/lessons'

// ⚠ Metadata-route под `output: 'export'` требует force-static (гоча Next 16).
export const dynamic = 'force-static'

const SITE = 'https://academy.synergify.com'

/** Публичные страницы академии; RU канон, EN — альтернатива через hreflang.
 *  Уроки /praktika/<slug>/ за admission-гейтом — в sitemap не попадают (noindex).
 *  Тренажёры и уроки скорочтения публичны (public-domain метод) — попадают. */
const PATHS: string[] = [
  '', 'pravila', 'zabota',
  'trenazhery', 'trenazhery/rsvp', 'trenazhery/schulte', 'trenazhery/test',
  // инструменты академии: калькулятор экономики ретрита (считает в браузере, данные не уходят)
  'instrumenty/kalkulyator-retrita',
  ...writtenSpeedreadingSlugs().map((slug) => `trenazhery/${slug}`),
  // «Эйдетика» — только после вычитки владельцем (status 'live'); до того страницы noindex.
  ...(isEideticsLive() ? ['trenazhery/eidetika', 'trenazhery/eidetika/ryad', 'trenazhery/eidetika/dvorec'] : []),
  ...(isEideticsLive() ? writtenEideticsSlugs().map((slug) => `trenazhery/eidetika/${slug}`) : []),
]

/** Курсы движка, вклеенные в подпуть (scripts/merge-course.mjs): у них своя маршрутизация,
 *  EN живёт ВНУТРИ подпути (/<sub>/en/), а не в /en/<sub>/. Только открытые курсы:
 *  «Тишина» (/praktika) — за admission-гейтом, её в sitemap нет. */
const COURSE_SUBPATHS: string[] = ['retrit']

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = PATHS.map((path) => {
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
  const courses = COURSE_SUBPATHS.map((sub) => ({
    url: `${SITE}/${sub}/`,
    alternates: {
      languages: {
        ru: `${SITE}/${sub}/`,
        en: `${SITE}/${sub}/en/`,
        'x-default': `${SITE}/${sub}/`,
      },
    },
  }))
  return [...pages, ...courses]
}
