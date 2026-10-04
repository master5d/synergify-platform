import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'
import { MODULE_SLUGS, OPTIONAL_MODULE_SLUGS } from '../rpg/modules'

type Locale = 'ru' | 'en'
const ALL_MODULES = [...MODULE_SLUGS, ...OPTIONAL_MODULE_SLUGS]
const unitLine = (locale: Locale) => locale === 'ru' ? /^\*\*Юниты:\*\* (.+)$/m : /^\*\*Units:\*\* (.+)$/m
const durationUnit = (locale: Locale) => locale === 'ru' ? /^(\d+)\s*мин$/ : /^(\d+)\s*min$/

function meta(locale: Locale, slug: string) {
  return JSON.parse(readFileSync(join(CONTENT_ROOT, locale, slug, '_meta.json'), 'utf8')) as {
    title: string
    duration: string
    units: { slug: string; title: string }[]
  }
}

function roadmap(locale: Locale) {
  return readFileSync(join(CONTENT_ROOT, locale, 'roadmap.mdx'), 'utf8')
}

function unitSlugs(locale: Locale, module: string) {
  return readdirSync(join(CONTENT_ROOT, locale, module))
    .filter((name) => /^u\d.*\.mdx$/.test(name))
    .map((name) => name.slice(0, -4))
}

// Roadmap и шпаргалка — артефакты Точки Сборки; у другого pack'а их нет по замыслу (деплой 2026-10-04, living-practice).
describe.runIf(PACK_SLUG === 'tochka-sborki')('roadmap stays aligned with _meta.json', () => {
  for (const locale of ['ru', 'en'] as const) {
    const text = roadmap(locale)

    it(`${locale}: every module has its metadata title, units, and duration`, () => {
      for (const slug of ALL_MODULES) {
        const m = meta(locale, slug)
        expect(text, `${locale}/${slug}: missing section title`).toContain(`## ${m.title}`)

        const sectionStart = text.indexOf(`## ${m.title}`)
        const nextSection = text.indexOf('\n## ', sectionStart + 4)
        const section = text.slice(sectionStart, nextSection < 0 ? text.length : nextSection)
        const units = section.match(unitLine(locale))?.[1].split(' · ')
        expect(units, `${locale}/${slug}: missing units line`).toEqual(m.units.map((u) => u.title))

        const tableRow = text.match(new RegExp(`\\(/(?:en/)?lessons/${slug}/\\)[^\\n]*`))?.[0]
        expect(tableRow, `${locale}/${slug}: missing module table row`).toBeTruthy()
        const shown = tableRow?.match(/(\d+)\s*(?:мин|min)/)?.[0]
        expect(shown && durationUnit(locale).test(shown), `${locale}/${slug}: duration is not ${m.duration}`).toBe(true)
        expect(shown?.match(/\d+/)?.[0]).toBe(m.duration.match(/\d+/)?.[0])
      }
    })

    it(`${locale}: lesson links and experiment filenames exist in module content`, () => {
      const badLinks: string[] = []
      for (const [, href] of text.matchAll(/\]\((\/(?:en\/)?lessons\/[^)]+)\)/g)) {
        const parts = href.replace(/^\/(?:en\/)?lessons\//, '').replace(/\/$/, '').split('/')
        const [module, unit] = parts
        if (!ALL_MODULES.includes(module as never) || (unit !== undefined && !unitSlugs(locale, module).includes(unit))) badLinks.push(href)
      }
      expect(badLinks).toEqual([])

      const refs = [...text.matchAll(/`(my-experiments\/[^`]+)`/g)].map((m) => m[1])
      const missing: string[] = []
      for (const ref of refs) {
        const found = ALL_MODULES.some((module) =>
          unitSlugs(locale, module).some((unit) => readFileSync(join(CONTENT_ROOT, locale, module, `${unit}.mdx`), 'utf8').includes(ref))
        )
        if (!found) missing.push(ref)
      }
      expect(missing, 'experiment file is not mentioned by a unit in this roadmap').toEqual([])
    })

    it(`${locale}: module and lesson totals are current`, () => {
      const total = ALL_MODULES.reduce((sum, slug) => sum + meta(locale, slug).units.length, 0)
      const core = MODULE_SLUGS.reduce((sum, slug) => sum + meta(locale, slug).units.length, 0)
      expect(text).toMatch(new RegExp(`${total}\\s+(?:юнит|units)`))
      expect(text).toMatch(new RegExp(`${core}\\s+(?:в ядре|in the core)`))
      expect(text).toMatch(locale === 'ru' ? /9 модулей ядра \+ 3 опциональных/ : /9 core modules \+ 3 optional/)
    })
  }
})
