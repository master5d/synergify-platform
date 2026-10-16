import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeLink, encodeLink, type LinkData } from './link'

// Общая фикстура формы JSON: генератор ссылок держит тот же файл с тем же sha256 —
// меняешь форму здесь, обнови фикстуру и хэш и там (README инструмента).
const FIXTURE = join(__dirname, 'fixtures', 'link-v1.json')
const FIXTURE_SHA256 = '287d132a8aa0f291c9edf46bd0ecde61a5259b09859de65214992381bd3923c3'

describe('ссылка #data=…', () => {
  it('фикстура формы v1 закреплена и разбирается', () => {
    // переводы строк — к LF: git с autocrlf на Windows переписывает их при checkout
    const text = readFileSync(FIXTURE, 'utf8').replace(/\r\n/g, '\n')
    expect(createHash('sha256').update(text).digest('hex')).toBe(FIXTURE_SHA256)
    const data = JSON.parse(text) as LinkData
    expect(decodeLink(encodeLink(data))).toEqual({ ok: true, data })
  })
  it('кириллица в названии переживает кодирование', () => {
    const decoded = decodeLink(encodeLink({ v: 1, title: 'Ретрит у моря' }))
    expect(decoded.ok && decoded.data.title).toBe('Ретрит у моря')
  })
  it('битая, чужая и пустая ссылка — ошибка с причиной, а не исключение', () => {
    expect(decodeLink('')).toEqual({ ok: false, error: 'в ссылке нет данных калькулятора' })
    expect(decodeLink('#data=%%%')).toEqual({ ok: false, error: 'в ссылке нет данных калькулятора' })
    expect(decodeLink('#data=bm90LWpzb24')).toEqual({ ok: false, error: 'данные в ссылке повреждены' })
    expect(decodeLink(encodeLink({ v: 2 } as LinkData)).ok).toBe(false)
    expect(decodeLink(encodeLink({ v: 1, price: -5 } as LinkData)))
      .toEqual({ ok: false, error: 'price: ожидалось число от 0 до 10000000' })
    expect(decodeLink(encodeLink({ v: 1, venue: { model: 'rent' } } as unknown as LinkData)).ok).toBe(false)
  })
  it('числа вне потолка не проходят: страница не падает и не виснет', () => {
    expect(decodeLink(encodeLink({ v: 1, monthsToStart: 1e10 })))
      .toEqual({ ok: false, error: 'monthsToStart: ожидалось число от 0 до 120' })
    expect(decodeLink(encodeLink({ v: 1, guests: 1e9 })).ok).toBe(false)
    expect(decodeLink(encodeLink({ v: 1, venue: { capacity: 1e7 } })).ok).toBe(false)
    expect(decodeLink('#data=' + 'A'.repeat(9000))).toEqual({ ok: false, error: 'данные в ссылке повреждены' })
  })
  it('сообщения на английском для EN-страницы', () => {
    expect(decodeLink('', 'en')).toEqual({ ok: false, error: 'the link carries no calculator data' })
  })
})
