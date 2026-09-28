import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MODULE_ORDER, MODULE_META, NOTEBOOK_MODULE_SLUG, nextLesson, lessonUrl, homeUrl, certificateUrl } from './course-order'
import { MICRO_TRANSFORMATIONS } from '../../../LMS/tochka-sborki/web/lib/rpg/transformations'

describe('nextLesson', () => {
  it('returns the first module when nothing is done', () => {
    expect(nextLesson(new Set(), new Set())).toEqual({ slug: '00-kickstart', resume: false })
  })

  it('returns the earliest incomplete module (no-skip)', () => {
    const completed = new Set(['00-kickstart', '01-introduction'])
    expect(nextLesson(completed, completed)).toEqual({ slug: '02-setup-guide', resume: false })
  })

  it('marks resume when the next module was viewed but not completed', () => {
    const completed = new Set(['00-kickstart'])
    const viewed = new Set(['00-kickstart', '01-introduction'])
    expect(nextLesson(completed, viewed)).toEqual({ slug: '01-introduction', resume: true })
  })

  it('returns null when every module is completed', () => {
    const all = new Set(MODULE_ORDER)
    expect(nextLesson(all, all)).toBeNull()
  })
})

describe('lessonUrl / homeUrl', () => {
  it('builds ru and en lesson URLs', () => {
    expect(lessonUrl('02-setup-guide', 'ru')).toBe('https://ai.synergify.com/lessons/02-setup-guide/')
    expect(lessonUrl('02-setup-guide', 'en')).toBe('https://ai.synergify.com/en/lessons/02-setup-guide/')
  })
  it('builds ru and en home URLs', () => {
    expect(homeUrl('ru')).toBe('https://ai.synergify.com/')
    expect(homeUrl('en')).toBe('https://ai.synergify.com/en/')
  })
})

// Названия модулей и трансформации для писем — копия контента pack'а; сверяем с источником
// (`_meta.json` ru/en + web lib/rpg/transformations.ts), как stats.test.ts сверяет порядок.
describe('MODULE_META vs real course pack', () => {
  const CONTENT = fileURLToPath(new URL('../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/', import.meta.url))
  const modulesOf = (lang: string) => readdirSync(`${CONTENT}${lang}`, { withFileTypes: true })
    .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name)).map(e => e.name).sort()
  const title = (lang: string, slug: string) =>
    JSON.parse(readFileSync(`${CONTENT}${lang}/${slug}/_meta.json`, 'utf8')).title as string

  it('covers exactly the modules that exist in content (ru and en)', () => {
    expect(Object.keys(MODULE_META).sort()).toEqual(modulesOf('ru'))
    expect(Object.keys(MODULE_META).sort()).toEqual(modulesOf('en'))
  })

  for (const slug of Object.keys(MODULE_META)) {
    it(`${slug}: title == _meta.json title, from/to == transformations.ts`, () => {
      expect(MODULE_META[slug].title).toEqual({ ru: title('ru', slug), en: title('en', slug) })
      const t = (MICRO_TRANSFORMATIONS as Record<string, { from: unknown; to: unknown }>)[slug]
      expect(t).toBeDefined()
      expect({ from: MODULE_META[slug].from, to: MODULE_META[slug].to }).toEqual({ from: t.from, to: t.to })
    })
  }

  it('MODULE_ORDER (spine) and the notebook module are in the pack', () => {
    for (const slug of [...MODULE_ORDER, NOTEBOOK_MODULE_SLUG]) expect(MODULE_META[slug]).toBeDefined()
  })

  it('builds certificate URLs', () => {
    expect(certificateUrl('ru')).toBe('https://ai.synergify.com/certificate/')
    expect(certificateUrl('en')).toBe('https://ai.synergify.com/en/certificate/')
  })
})
