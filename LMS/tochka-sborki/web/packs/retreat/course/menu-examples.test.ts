// Ссылки уроков на генератор меню академии: каждая — из menuHref, разбирается обратно в свою неделю, несёт только
// поля паспорта и меню и ведёт на страницу своей локали. Итоги против движка сверяет тест академии
// (academy/lib/retreat-menu/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { MENU_EXAMPLES, menuHref, type MenuExampleId } from './menu-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/generator-menyu\/#data=[A-Za-z0-9_-]+/g
// allowlist ссылки — как в academy/lib/retreat-core/passport.ts и academy/lib/retreat-menu/form.ts
const RETREAT_KEYS = new Set(['title', 'currency', 'start', 'nights', 'guests', 'arrivalMeal', 'departureMeal'])
const CELL_KEYS = new Set(['dish', 'side', 'drink', 'meat', 'variants', 'allergens', 'priceCents', 'option'])
const KEY = /^\d{1,3}-(breakfast|lunch|dinner)$/

function decode(href: string): Record<string, unknown> {
  const b64 = href.split('#data=')[1].replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
}

function mdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? mdxFiles(p) : p.endsWith('.mdx') ? [p] : []
  })
}

const ids = MENU_EXAMPLES.map((e) => e.id) as MenuExampleId[]

describe('учебные ссылки на генератор меню', () => {
  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в свою неделю с названием локали`, () => {
        const ex = MENU_EXAMPLES.find((e) => e.id === id)!
        expect(decode(menuHref(id, locale))).toEqual({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] }, tool: { ...ex.data.tool, grid: ex.grid[locale] } })
      })
    }
  }
  it('ссылка детерминирована, несёт только поля allowlist и короче 8 000 знаков', () => {
    for (const id of ids) {
      const href = menuHref(id, 'ru')
      expect(menuHref(id, 'ru')).toBe(href)
      expect(href.length).toBeLessThan(8000)
      const d = decode(href) as { retreat: object; tool: { grid: Record<string, object>; diets: object } }
      for (const k of Object.keys(d.retreat)) expect(RETREAT_KEYS.has(k), `${id}: retreat.${k}`).toBe(true)
      expect(Object.keys(d.tool).sort()).toEqual(['diets', 'grid'])
      for (const [k, cell] of Object.entries(d.tool.grid)) {
        expect(KEY.test(k), `${id}: ${k}`).toBe(true)
        for (const f of Object.keys(cell)) expect(CELL_KEYS.has(f), `${id}: ${k}.${f}`).toBe(true)
      }
    }
  })
})

describe('ссылки на генератор меню в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — menuHref своей локали, и уроки на них ведут`, () => {
      const known = new Set(ids.map((id) => menuHref(id, locale)))
      let found = 0
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из menuHref(…, '${locale}')`).toBe(true)
          found++
        }
      }
      expect(found).toBeGreaterThan(0)
    })
  }
})
