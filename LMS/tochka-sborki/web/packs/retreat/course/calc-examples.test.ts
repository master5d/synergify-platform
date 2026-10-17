// Ссылки уроков на калькулятор академии: каждая — из calcHref, разбирается обратно в свою сделку,
// несёт только поля формы v1 и ведёт на калькулятор своей локали. Итоги примеров против движка
// калькулятора сверяет тест академии (academy/lib/retreat-calc/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CALC_EXAMPLES, calcHref, type ExampleId } from './calc-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const FIXTURE = join(process.cwd(), '..', '..', '..', 'academy', 'lib', 'retreat-calc', 'fixtures', 'link-v1.json')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/kalkulyator-retrita\/#data=[A-Za-z0-9_-]+/g

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

const ids = CALC_EXAMPLES.map((e) => e.id) as ExampleId[]

describe('учебные ссылки на калькулятор', () => {
  it('id примеров уникальны', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в свою сделку с названием локали`, () => {
        const ex = CALC_EXAMPLES.find((e) => e.id === id)!
        expect(decode(calcHref(id, locale))).toEqual({ ...ex.data, title: ex.title[locale] })
      })
    }
  }

  it('ссылка детерминирована: ключи по алфавиту, повторный вызов — та же строка', () => {
    for (const id of ids) {
      const href = calcHref(id, 'ru')
      expect(calcHref(id, 'ru')).toBe(href)
      const json = JSON.stringify(decode(href))
      const top = Object.keys(JSON.parse(json))
      expect(top).toEqual([...top].sort())
    }
  })

  it('поля ссылок — только из формы v1 калькулятора', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Record<string, unknown>
    const allowed = new Set([...Object.keys(fixture), 'guestDepositPct', 'guestDeposit'])
    const allowedVenue = new Set([...Object.keys(fixture.venue as object), 'minGuests', 'buyoutFee'])
    for (const id of ids) {
      const d = decode(calcHref(id, 'ru'))
      for (const k of Object.keys(d)) expect(allowed.has(k), `${id}: поле ${k}`).toBe(true)
      for (const k of Object.keys(d.venue as object)) expect(allowedVenue.has(k), `${id}: venue.${k}`).toBe(true)
    }
  })

  it('EN-ссылка ведёт на /en/, RU — без /en/', () => {
    for (const id of ids) {
      expect(calcHref(id, 'en')).toContain('academy.synergify.com/en/instrumenty/')
      expect(calcHref(id, 'ru')).not.toContain('/en/')
    }
  })
})

describe('ссылки на калькулятор в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — calcHref учебного примера своей локали`, () => {
      const known = new Set(ids.map((id) => calcHref(id, locale)))
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из calcHref(…, '${locale}')`).toBe(true)
        }
      }
    })
  }
})
