import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeLink, encodeLink, type LinkData } from './link'
import { applyLink, DEFAULT_FORM, toInputs } from './form'

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
  it('переносит payInFull и точный срок до старта', () => {
    const data: LinkData = { v: 1, daysToStart: 61, venue: { payInFull: true } }
    expect(decodeLink(encodeLink(data))).toEqual({ ok: true, data })
  })
  it('переносит опции через encode, decode, applyLink и toInputs', () => {
    const accommodation = [{ name: 'палатка', guests: 3, surcharge: 125, cost: 40 }]
    const decoded = decodeLink(encodeLink({ v: 1, accommodation }))
    expect(decoded.ok).toBe(true)
    if (decoded.ok) {
      const form = applyLink(DEFAULT_FORM, decoded.data)
      expect(toInputs(form).accommodation).toEqual([
        { name: 'палатка', guests: 3, surcharge: 12500, cost: 4000 },
      ])
    }
  })
  it('ссылка без accommodation читается как раньше', () => {
    expect(decodeLink(encodeLink({ v: 1, guests: 4 }))).toEqual({ ok: true, data: { v: 1, guests: 4 } })
  })
  it('неверная опция в ссылке отклоняется', () => {
    expect(decodeLink(encodeLink({ v: 1, accommodation: [{ name: 'палатка', guests: 1, surcharge: -1, cost: 0 }] }))).toEqual({
      ok: false, error: 'accommodation[0].surcharge: ожидалось число от 0 до 10000000',
    })
    expect(decodeLink(encodeLink({ v: 1, accommodation: Array.from({ length: 9 }, () => ({ name: 'x', guests: 0, surcharge: 0, cost: 0 })) }))).toEqual({
      ok: false, error: 'accommodation: не больше 8 вариантов',
    })
  })
  it('отбрасывает неверные типы payInFull и daysToStart', () => {
    expect(decodeLink(encodeLink({ v: 1, daysToStart: '61' } as unknown as LinkData)).ok).toBe(false)
    expect(decodeLink(encodeLink({ v: 1, venue: { payInFull: 'yes' } } as unknown as LinkData)).ok).toBe(false)
  })
})

describe('id ретрита в ссылке калькулятора', () => {
  it('неверный id отбрасывается, ссылка остаётся рабочей', () => {
    const d = decodeLink(encodeLink({ v: 1, title: 'Ретрит', id: 'BAD ID!' } as never), 'ru')
    expect(d.ok).toBe(true)
    if (d.ok) expect(d.data.id).toBeUndefined()
  })
})
