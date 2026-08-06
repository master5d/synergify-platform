import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { COURSE_MATERIALS, isExternalHref } from './materials'

const HERE = dirname(fileURLToPath(import.meta.url))   // web/lib

describe('isExternalHref', () => {
  it('treats http(s) URLs as external and relative paths as internal', () => {
    expect(isExternalHref('https://claude.ai')).toBe(true)
    expect(isExternalHref('http://x.dev')).toBe(true)
    expect(isExternalHref('/cheatsheet/')).toBe(false)
    expect(isExternalHref('/materials/agent-charter.md')).toBe(false)
  })
})

describe('COURSE_MATERIALS manifest', () => {
  it('is non-empty and every group is well-formed', () => {
    expect(COURSE_MATERIALS.length).toBeGreaterThan(0)
    for (const g of COURSE_MATERIALS) {
      expect(g.label.ru.length).toBeGreaterThan(0)
      expect(g.label.en.length).toBeGreaterThan(0)
      expect(g.items.length).toBeGreaterThan(0)
      for (const it of g.items) {
        expect(it.href.length).toBeGreaterThan(0)
        expect(it.title.ru.length).toBeGreaterThan(0)
        expect(it.title.en.length).toBeGreaterThan(0)
      }
    }
  })

  it('marks tool items as external links', () => {
    const tools = COURSE_MATERIALS.flatMap(g => g.items).filter(i => i.kind === 'tool')
    expect(tools.length).toBeGreaterThan(0)
    for (const t of tools) expect(t.external).toBe(true)
  })

  it('keeps external flag consistent with the href', () => {
    for (const it of COURSE_MATERIALS.flatMap(g => g.items)) {
      expect(Boolean(it.external)).toBe(isExternalHref(it.href))
    }
  })
})

/**
 * Манифест ссылается на реальные файлы в public/ и на реальные маршруты. Сборка
 * это не проверяет: строка href остаётся строкой, а ученик получает 404. Файл
 * материала легко потерять при уборке public/ — тогда ссылка «Курс Microsoft по
 * агентам — карта на русском» тихо перестаёт вести куда-либо.
 */
describe('внутренние ссылки манифеста ведут к существующим файлам и маршрутам', () => {
  const internal = COURSE_MATERIALS.flatMap(g => g.items).filter(i => !isExternalHref(i.href))

  it('манифест вообще содержит внутренние ссылки', () => {
    expect(internal.length).toBeGreaterThan(0)
  })

  it.each(internal.map(i => i.href))('%s', (href) => {
    const asFile = join(HERE, '..', 'public', href.replace(/^\//, ''))
    if (/\.(md|sh|ps1|pdf)$/.test(href)) {
      expect(existsSync(asFile), `нет файла public${href}`).toBe(true)
      return
    }
    // маршрут: либо статическая страница, либо файл в public/
    const asRoute = join(HERE, '..', 'app', href.replace(/^\//, '').replace(/\/$/, ''), 'page.tsx')
    expect(existsSync(asRoute) || existsSync(asFile), `нет ни маршрута ${href}, ни файла public${href}`).toBe(true)
  })
})
