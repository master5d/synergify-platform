import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { unitLayout, type ModuleMeta } from '../content'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'

// Ф4 S1: разметка юнита — свойство pack'а, а не движка.
// Гвард держит два инварианта: дефолт не поехал (без ключа = phases) и
// заявленная разметка совпадает с телами уроков (фазы ↔ <Phase>).

function modules(locale: 'ru' | 'en') {
  const root = join(CONTENT_ROOT, locale)
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d\d-/.test(e.name))
    .map((e) => ({
      slug: e.name,
      meta: JSON.parse(readFileSync(join(root, e.name, '_meta.json'), 'utf8')) as ModuleMeta,
      dir: join(root, e.name),
    }))
}

describe('unitLayout', () => {
  it('defaults to phases when the key is absent or unknown', () => {
    expect(unitLayout({})).toBe('phases')
    expect(unitLayout({ layout: undefined })).toBe('phases')
    expect(unitLayout({ layout: 'phases' })).toBe('phases')
  })

  it('honours an explicit prose layout', () => {
    expect(unitLayout({ layout: 'prose' })).toBe('prose')
  })
})

describe(`pack "${PACK_SLUG}": заявленная разметка совпадает с уроками`, () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: у phases-модулей есть <Phase>, у prose-модулей его нет`, () => {
      for (const m of modules(locale)) {
        const layout = unitLayout(m.meta)
        const units = readdirSync(m.dir).filter((f) => /^u\d.*\.mdx$/.test(f))
        expect(units.length, `${m.slug} без юнитов`).toBeGreaterThan(0)
        for (const file of units) {
          const body = readFileSync(join(m.dir, file), 'utf8')
          const hasPhase = /<Phase\b/.test(body)
          if (layout === 'phases') {
            expect(hasPhase, `${m.slug}/${file}: layout=phases, но <Phase> нет`).toBe(true)
          } else {
            expect(hasPhase, `${m.slug}/${file}: layout=prose, но внутри <Phase>`).toBe(false)
          }
        }
      }
    })
  }

  it('каждый _meta.json объявляет разметку явно (кроме канона ТС)', () => {
    // Точка Сборки исторически без ключа — это и есть проверка дефолта.
    if (PACK_SLUG === 'tochka-sborki') return
    for (const m of modules('ru')) {
      expect(m.meta.layout, `${m.slug}: pack обязан объявить layout явно`).toBeDefined()
    }
  })
})

describe('движок предоставляет обе оболочки', () => {
  it('unit-page выбирает оболочку по layout, а не по имени pack’а', () => {
    const src = readFileSync(join(process.cwd(), 'components', 'pages', 'unit-page.tsx'), 'utf8')
    expect(src).toContain('unitLayout(moduleMeta)')
    expect(src).toContain('UnitProse')
    expect(src).not.toMatch(/PACK_SLUG|tochka-sborki|living-practice/)
  })

  it('UnitProse не рисует фазовую шкалу', () => {
    const src = readFileSync(join(process.cwd(), 'components', 'unit-prose.tsx'), 'utf8')
    expect(src).not.toContain('phases')
    expect(existsSync(join(process.cwd(), 'components', 'unit-prose.tsx'))).toBe(true)
  })
})
