// web/lib/sitemap.ts
// Pure sitemap assembly with RU/EN hreflang alternates. RU lives at /<path>, EN at /en/<path>.
// Declaring the pairing here (one sitemap, all URLs) is the canonical way to tell search
// engines the two locales are translations, not duplicates — fixing the language conflict.
import type { MetadataRoute } from 'next'

const EN = (path: string) => (path === '/' ? '/en/' : `/en${path}`)

/** One entry per locale-agnostic path, each carrying ru / en / x-default alternates. */
export function buildSitemap(paths: string[], base: string): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${base}${path}`,
    alternates: {
      languages: {
        ru: `${base}${path}`,
        en: `${base}${EN(path)}`,
        'x-default': `${base}${path}`,
      },
    },
  }))
}
