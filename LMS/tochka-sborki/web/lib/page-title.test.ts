import { describe, expect, it } from 'vitest'
import { pageTitle } from './page-title'
import { COURSE } from '@/lib/course'

describe('pageTitle', () => {
  it('всегда заканчивается именем активного курса', () => {
    expect(pageTitle('Шпаргалка')).toBe(`Шпаргалка — ${COURSE.shortName}`)
  })

  it('не повторяет имя курса, если так назван модуль (курс из одного модуля)', () => {
    const title = pageTitle('Слон в комнате', COURSE.shortName)
    expect(title).toBe(`Слон в комнате — ${COURSE.shortName}`)
    expect(title.split(COURSE.shortName)).toHaveLength(2)
  })

  it('склеивает цепочку урок → модуль → курс', () => {
    expect(pageTitle('Юнит', 'Модуль')).toBe(`Юнит — Модуль — ${COURSE.shortName}`)
  })

  it('пропускает пустые части и не зависит от регистра дубля', () => {
    expect(pageTitle('', null, 'Раздел')).toBe(`Раздел — ${COURSE.shortName}`)
    expect(pageTitle(COURSE.shortName.toLocaleUpperCase())).toBe(COURSE.shortName.toLocaleUpperCase())
  })
})
