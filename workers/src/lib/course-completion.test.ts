import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { COURSE_CATALOG } from './course-catalog'
import { CATALOG_UNITS, completedCatalogModules, missingCatalogModules } from './course-completion'

const CONTENT = fileURLToPath(new URL('../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/', import.meta.url))

describe('CATALOG_UNITS', () => {
  it('has the units of every catalog module, equal to _meta.json in both locales', () => {
    for (const { slug } of COURSE_CATALOG) {
      for (const lang of ['ru', 'en']) {
        const meta = JSON.parse(readFileSync(`${CONTENT}${lang}/${slug}/_meta.json`, 'utf8')) as { units: { slug: string }[] }
        expect(CATALOG_UNITS[slug], `${lang}/${slug}`).toEqual(meta.units.map(u => u.slug))
      }
      expect(CATALOG_UNITS[slug].length).toBeGreaterThan(0)
    }
  })
})

describe('completedCatalogModules', () => {
  it('module row or all units close a module; a partial module stays open', () => {
    const [u1, u2] = CATALOG_UNITS['01-introduction']
    const rows = [
      { lesson_slug: '00-kickstart', completed_at: 10 },
      ...CATALOG_UNITS['02-setup-guide'].map((u, i) => ({ lesson_slug: `02-setup-guide/${u}`, completed_at: 20 + i })),
      { lesson_slug: `01-introduction/${u1}`, completed_at: 30 },
      { lesson_slug: `01-introduction/${u2}`, completed_at: 31 },
    ]
    const done = completedCatalogModules(rows)
    expect(done.map(m => m.slug)).toEqual(['00-kickstart', '02-setup-guide'])
    expect(done[1].completedAt).toBe(20 + CATALOG_UNITS['02-setup-guide'].length - 1)
    expect(missingCatalogModules(rows)).toContain('01-introduction')
  })

  it('ignores slugs outside the catalog (optional modules, junk)', () => {
    const rows = [{ lesson_slug: '09-ai-notebook', completed_at: 1 }, { lesson_slug: 'cheatsheet', completed_at: 1 }]
    expect(completedCatalogModules(rows)).toEqual([])
  })
})
