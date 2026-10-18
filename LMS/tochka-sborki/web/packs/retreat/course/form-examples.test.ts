// Ссылки уроков на анкету гостя академии: каждая — из formHref, разбирается обратно в паспорт учебной недели,
// не несёт ничего, кроме полей паспорта, и ведёт на страницу своей локали. Сводку учебных ответов против движка
// сверяет тест академии (academy/lib/retreat-guest-form/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { FORM_EXAMPLES, formHref, formSamplePath, type FormExampleId } from './form-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/anketa-gostya\/#data=[A-Za-z0-9_-]+/g
// allowlist ссылки — как в academy/lib/retreat-core/passport.ts и academy/lib/retreat-guest-form/form.ts
const RETREAT_KEYS = new Set(['title', 'currency', 'start', 'nights', 'guests', 'arrivalMeal', 'departureMeal'])

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

const ids = FORM_EXAMPLES.map((e) => e.id) as FormExampleId[]

describe('учебные ссылки на анкету гостя', () => {
  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в паспорт учебной недели с названием локали`, () => {
        const ex = FORM_EXAMPLES.find((e) => e.id === id)!
        expect(decode(formHref(id, locale))).toEqual({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] } })
      })
      it(`${id} (${locale}): файл учебных ответов лежит в материалах курса`, () => {
        expect(existsSync(join(process.cwd(), 'public', formSamplePath(id, locale)))).toBe(true)
      })
    }
  }
  it('ссылка детерминирована и несёт только поля паспорта — ответов в ней нет', () => {
    for (const id of ids) {
      const href = formHref(id, 'ru')
      expect(formHref(id, 'ru')).toBe(href)
      const d = decode(href) as { retreat: object; tool: object }
      for (const k of Object.keys(d.retreat)) expect(RETREAT_KEYS.has(k), `${id}: retreat.${k}`).toBe(true)
      expect(d.tool).toEqual({})
    }
  })
})

describe('ссылки на анкету гостя в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — formHref своей локали, и уроки на них ведут`, () => {
      const known = new Set(ids.map((id) => formHref(id, locale)))
      let found = 0
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из formHref(…, '${locale}')`).toBe(true)
          found++
        }
      }
      expect(found).toBeGreaterThan(0)
    })
  }
})
