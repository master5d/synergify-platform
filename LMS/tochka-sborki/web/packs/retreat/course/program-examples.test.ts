// Ссылки уроков на конструктор программы академии: каждая — из programHref, разбирается обратно в свою неделю,
// несёт только поля паспорта и блоки сетки (без карточек и чужих полей) и ведёт на страницу своей локали. Проблемы сетки
// против движка сверяет тест академии (academy/lib/retreat-program/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { PROGRAM_EXAMPLES, programHref, type ProgramExampleId } from './program-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/konstruktor-programmy\/#data=[A-Za-z0-9_-]+/g
// allowlist ссылки — как в academy/lib/retreat-core/passport.ts и academy/lib/retreat-program/grid.ts
const RETREAT_KEYS = new Set(['title', 'currency', 'start', 'nights', 'guests', 'arrivalMeal', 'departureMeal'])
const BLOCK_KEYS = new Set(['day', 'start', 'minutes', 'kind', 'practiceId', 'title'])

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

const ids = PROGRAM_EXAMPLES.map((e) => e.id) as ProgramExampleId[]

describe('учебные ссылки на конструктор программы', () => {
  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в свою неделю с названием локали`, () => {
        const ex = PROGRAM_EXAMPLES.find((e) => e.id === id)!
        expect(decode(programHref(id, locale))).toEqual({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] } })
      })
    }
  }
  it('ссылка детерминирована, несёт только поля allowlist и короче 8 000 знаков', () => {
    for (const id of ids) {
      const href = programHref(id, 'ru')
      expect(programHref(id, 'ru')).toBe(href)
      expect(href.length).toBeLessThan(8000)
      const d = decode(href) as { retreat: object; tool: { blocks: Record<string, unknown>[] } }
      for (const k of Object.keys(d.retreat)) expect(RETREAT_KEYS.has(k), `${id}: retreat.${k}`).toBe(true)
      expect(Object.keys(d.tool)).toEqual(['blocks'])
      for (const b of d.tool.blocks) for (const k of Object.keys(b)) expect(BLOCK_KEYS.has(k), `${id}: block.${k}`).toBe(true)
    }
  })
})

describe('ссылки на конструктор программы в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — programHref своей локали, и уроки на них ведут`, () => {
      const known = new Set(ids.map((id) => programHref(id, locale)))
      let found = 0
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из programHref(…, '${locale}')`).toBe(true)
          found++
        }
      }
      expect(found).toBeGreaterThan(0)
    })
  }
})
