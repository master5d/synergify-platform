import { describe, expect, it } from 'vitest'
import { encodeLink } from '../retreat-calc/link'
import { encodeToolLink } from '../retreat-core/tool-link'
import { PROGRAM_PATH } from '../retreat-program/form'
import { MENU_PATH } from '../retreat-menu/form'
import { CALC_PATH, TIMELINE_PATH } from '../retreat-timeline/form'
import { decodeToolLink } from '../retreat-core/tool-link'
import { formFromDecoded as timelineFromDecoded, pickTimelineTool } from '../retreat-timeline/form'
import { checkBooklet } from './checks'
import { defaultForm } from './form'
import { importLink } from './imports'

const today = '2027-01-01' as const
const retreat = { title: 'Нейтральный ретрит', start: '2027-09-13' as const, nights: 7, currency: 'USD' }
const programHash = encodeToolLink({ v: 1, retreat, tool: { blocks: [], cards: [] } })
const menuHash = encodeToolLink({ v: 1, retreat, tool: { grid: {}, diets: {} } })
const timelineHash = encodeToolLink({ v: 1, retreat, tool: { signDate: today, guestBalanceDueDays: 30 } })
const calcHash = encodeLink({ v: 1, title: retreat.title, currency: 'USD', nights: 7, monthsToStart: 8, guests: 4, price: 1200,
  guestDepositPct: 30, guestBalanceDueDays: 30, venue: { model: 'per_guest', ratePerGuest: 200 } })

describe('booklet imports', () => {
  it('B01 конструктор по полному EN-URL кладёт блоки, карточки и дату импорта', () => {
    const r = importLink(defaultForm(today, 'en'), `https://host/en${PROGRAM_PATH}${programHash}`, 'en', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.imports.program).toEqual({ at: today, retreat, blocks: [], cards: [] })
  })
  it('B02 русская ссылка конструктора принимается в английском буклете', () => {
    const r = importLink(defaultForm(today, 'en'), `https://host${PROGRAM_PATH}${programHash}`, 'en', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.imports.program).toEqual({ at: today, retreat, blocks: [], cards: [] })
  })
  it('B03 импорт меню кладёт сетку и диеты', () => {
    const r = importLink(defaultForm(today, 'ru'), `https://host${MENU_PATH}${menuHash}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.imports.menu).toEqual({ at: today, retreat, grid: {}, diets: {} })
  })
  it('B04 импорт калькулятора новой ссылкой кладёт данные калькулятора', () => {
    const r = importLink(defaultForm(today, 'ru'), `https://host${CALC_PATH}${calcHash}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.imports.calc?.data).toMatchObject({ v: 1, title: retreat.title, guests: 4, nights: 7 })
    if (r.ok) expect(r.form.imports.calc?.at).toBe(today)
  })
  it('B05 калькулятор v1 без retreat', () => {
    const r = importLink(defaultForm(today, 'ru'), `https://host${CALC_PATH}${encodeLink({ v: 1, title: 'Вариант', nights: 3 })}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.imports.calc?.data).toEqual({ v: 1, title: 'Вариант', nights: 3 })
  })
  it('B06 калькулятор kind calc через ссылку инструмента на пути калькулятора', () => {
    const v1 = encodeLink({ v: 1, title: 'Variant', nights: 4, price: 900 })
    const r = importLink(defaultForm(today, 'en'), `https://host/en${CALC_PATH}${v1}`, 'en', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.kind).toBe('calc')
    if (r.ok) expect(r.form.imports.calc).toEqual({ at: today, data: { v: 1, title: 'Variant', nights: 4, price: 900 } })
  })
  it('B31 неизвестный путь — ошибка', () => {
    expect(importLink(defaultForm(today, 'ru'), `https://host/instrumenty/chto-to/${programHash}`, 'ru', today).ok).toBe(false)
  })
  it('B07 ссылка калькулятора на пути конструктора — ошибка, а не исключение', () => {
    expect(importLink(defaultForm(today, 'ru'), `https://host${PROGRAM_PATH}${calcHash}`, 'ru', today)).toEqual({ ok: false,
      error: 'Это ссылка калькулятора — вставьте её с адресом калькулятора' })
  })
  it('B08 импорт таймлайна: terms совпадают с таймлайном ссылки', () => {
    const r = importLink(defaultForm(today, 'ru'), `https://host${TIMELINE_PATH}${timelineHash}`, 'ru', today)
    expect(r.ok).toBe(true)
    const expected = timelineFromDecoded(decodeToolLink(timelineHash, pickTimelineTool, 'ru'), today)
    expect(expected).not.toBeNull()
    if (r.ok) expect(r.form.imports.timeline?.terms).toEqual(expected?.terms)
  })
  it('B09 паспорт ссылки не затирает заполненное поле буклета', () => {
    const f = defaultForm(today, 'ru'); f.passport.title = 'Своё название'
    const r = importLink(f, `https://host${PROGRAM_PATH}${programHash}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.passport.title).toBe('Своё название')
  })
  it('B10 паспорт ссылки заполняет поле с пустой строкой', () => {
    const f = defaultForm(today, 'ru'); f.passport.title = ''
    const r = importLink(f, `https://host${PROGRAM_PATH}${programHash}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.passport.title).toBe(retreat.title)
  })
  it('B11 дата из ссылки попадает в пустой паспорт defaultForm', () => {
    const r = importLink(defaultForm(today, 'ru'), `https://host${PROGRAM_PATH}${programHash}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.passport.start).toBe(retreat.start)
  })
  it('B12 import-passport-mismatch у калькулятора с другой датой', () => {
    const f = defaultForm(today, 'ru'); f.passport.start = '2027-09-20'
    const r = importLink(f, `https://host${CALC_PATH}${encodeLink({ v: 1, daysToStart: 243 })}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(checkBooklet(r.form, 'ru', today).errors).toContainEqual({ id: 'import-passport-mismatch', detail: 'calc.start' })
  })
  it('B13 нет import-passport-mismatch у калькулятора с той же датой', () => {
    const f = defaultForm(today, 'ru'); f.passport.start = '2027-09-01'
    const r = importLink(f, `https://host${CALC_PATH}${encodeLink({ v: 1, daysToStart: 243 })}`, 'ru', today)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.form.passport.start).toBe('2027-09-01')
    if (r.ok) expect(checkBooklet(r.form, 'ru', today).errors.filter((x) => x.id === 'import-passport-mismatch')).toEqual([])
  })
})
