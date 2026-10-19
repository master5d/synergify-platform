// Ссылки уроков на буклет ретрита академии: каждая — из bookletHref, разбирается обратно в свой буклет и ведёт на страницу
// своей локали. Ошибки и замечания буклета против движка сверяет тест академии (academy/lib/retreat-booklet/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { BOOKLET_EXAMPLES, bookletHref, type BookletExampleId } from './booklet-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/buklet\/#data=[A-Za-z0-9_-]+/g

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

const ids = BOOKLET_EXAMPLES.map((e) => e.id) as BookletExampleId[]

describe('учебные ссылки на буклет ретрита', () => {
  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в свой буклет`, () => {
        const ex = BOOKLET_EXAMPLES.find((e) => e.id === id)!
        expect(decode(bookletHref(id, locale))).toEqual(ex.data[locale])
      })
      it(`${id} (${locale}): ссылка детерминирована и укладывается в предел ссылки инструмента`, () => {
        expect(bookletHref(id, locale)).toBe(bookletHref(id, locale))
        expect(bookletHref(id, locale).length).toBeLessThan(64_000)
      })
    }
  }
})

describe('ссылки на буклет ретрита в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — bookletHref своей локали, и уроки на них ведут`, () => {
      const known = new Set(ids.map((id) => bookletHref(id, locale)))
      let found = 0
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из bookletHref(…, '${locale}')`).toBe(true)
          found++
        }
      }
      expect(found).toBeGreaterThan(0)
    })
  }
})
