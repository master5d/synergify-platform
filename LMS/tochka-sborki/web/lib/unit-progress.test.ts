import { describe, it, expect } from 'vitest'
import {
  parseProgress,
  isUnitCompleted,
  markUnit,
  completedCount,
  type UnitProgressMap,
} from './unit-progress'

const SAMPLE: UnitProgressMap = {
  '00-kickstart': { 'u1-map': true, 'u2-tools': true },
  '07-tools': { 'u2-mcp': true },
}

describe('parseProgress', () => {
  it('читает нормальную карту прогресса', () => {
    expect(parseProgress(JSON.stringify(SAMPLE))).toEqual(SAMPLE)
  })

  it('пустое хранилище — это пустой прогресс, а не ошибка', () => {
    expect(parseProgress(null)).toEqual({})
    expect(parseProgress('')).toEqual({})
  })

  it('обрезанный JSON не роняет курс', () => {
    expect(parseProgress('{"00-kickstart":{"u1-map":tr')).toEqual({})
  })

  it('строка вместо объекта не превращается в прогресс по буквам', () => {
    // Раньше JSON.parse('"abc"') отдавал строку, и первая же отметка делала
    // {...'abc'} = {0:'a',1:'b',2:'c'} — прогресс из ниоткуда.
    expect(parseProgress('"abc"')).toEqual({})
    expect(parseProgress('42')).toEqual({})
    expect(parseProgress('null')).toEqual({})
  })

  it('массив не считается картой модулей', () => {
    expect(parseProgress('["00-kickstart"]')).toEqual({})
  })

  it('мусорный модуль отбрасывается, соседние остаются', () => {
    const raw = JSON.stringify({ '00-kickstart': { 'u1-map': true }, 'сломанный': 'да' })
    expect(parseProgress(raw)).toEqual({ '00-kickstart': { 'u1-map': true } })
  })

  it('хранит только пройденное: false и мусор в значениях выбрасываются', () => {
    const raw = JSON.stringify({ m: { a: true, b: false, c: 'yes', d: 1 } })
    expect(parseProgress(raw)).toEqual({ m: { a: true } })
  })
})

describe('isUnitCompleted', () => {
  it('видит пройденный юнит', () => {
    expect(isUnitCompleted(SAMPLE, '00-kickstart', 'u1-map')).toBe(true)
  })

  it('незнакомый модуль или юнит — просто «ещё не проходил»', () => {
    expect(isUnitCompleted(SAMPLE, '00-kickstart', 'u4-sources')).toBe(false)
    expect(isUnitCompleted(SAMPLE, '99-нет-такого', 'u1')).toBe(false)
    expect(isUnitCompleted({}, 'm', 'u')).toBe(false)
  })
})

describe('markUnit', () => {
  it('отмечает юнит в существующем модуле, не трогая соседей', () => {
    const next = markUnit(SAMPLE, '00-kickstart', 'u3-first-steps')
    expect(isUnitCompleted(next, '00-kickstart', 'u3-first-steps')).toBe(true)
    expect(isUnitCompleted(next, '00-kickstart', 'u1-map')).toBe(true)
    expect(isUnitCompleted(next, '07-tools', 'u2-mcp')).toBe(true)
  })

  it('заводит модуль, которого ещё не было', () => {
    const next = markUnit({}, '08-agent-engineering', 'u1-activation')
    expect(next).toEqual({ '08-agent-engineering': { 'u1-activation': true } })
  })

  it('повторная отметка ничего не ломает', () => {
    const once = markUnit(SAMPLE, '07-tools', 'u2-mcp')
    const twice = markUnit(once, '07-tools', 'u2-mcp')
    expect(twice).toEqual(once)
  })

  it('не мутирует вход — иначе React не перерисует прогресс', () => {
    const before = JSON.stringify(SAMPLE)
    markUnit(SAMPLE, '00-kickstart', 'u9-новый')
    expect(JSON.stringify(SAMPLE)).toBe(before)
  })

  it('вложенный объект модуля тоже копируется, а не переиспользуется', () => {
    const next = markUnit(SAMPLE, '00-kickstart', 'u3-first-steps')
    expect(next['00-kickstart']).not.toBe(SAMPLE['00-kickstart'])
  })
})

describe('completedCount', () => {
  it('считает по всему курсу', () => {
    expect(completedCount(SAMPLE)).toBe(3)
  })

  it('считает внутри одного модуля', () => {
    expect(completedCount(SAMPLE, '00-kickstart')).toBe(2)
    expect(completedCount(SAMPLE, '07-tools')).toBe(1)
  })

  it('модуль, который не начинали, даёт ноль, а не падение', () => {
    expect(completedCount(SAMPLE, '99-нет-такого')).toBe(0)
    expect(completedCount({})).toBe(0)
  })
})

describe('круговой обход: запись → чтение', () => {
  it('карта, прошедшая через JSON, остаётся собой', () => {
    const next = markUnit(markUnit({}, 'm1', 'u1'), 'm2', 'u2')
    expect(parseProgress(JSON.stringify(next))).toEqual(next)
  })
})
