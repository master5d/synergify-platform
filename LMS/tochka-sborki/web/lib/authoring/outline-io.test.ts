// lib/authoring/outline-io.test.ts
// loadOutline — на sacrificial temp-каталоге (валид / битый JSON / ошибки схемы),
// мост moduleOutlineToCourseOutline и парсер extractOutlineOption.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { extractOutlineOption, loadOutline, moduleOutlineToCourseOutline } from './outline-io'
import { validateOutline } from './outline'
import type { CourseOutline } from './outline'
import type { ModuleOutline } from './module-outline'

const VALID: CourseOutline = {
  name: { ru: 'Курс', en: 'Course' },
  modules: [
    {
      slug: '01-intro', level: 1,
      title: { ru: 'Модуль', en: 'Module' },
      description: { ru: 'Описание', en: 'Description' },
      units: [
        {
          slug: 'u1-start',
          title: { ru: 'Юнит', en: 'Unit' },
          objective: { ru: 'Цель', en: 'Objective' },
        },
      ],
    },
  ],
}

const tmp = mkdtempSync(join(tmpdir(), 'outline-io-'))
afterAll(() => rmSync(tmp, { recursive: true, force: true }))

function tmpFile(name: string, content: string): string {
  const p = join(tmp, name)
  writeFileSync(p, content, 'utf8')
  return p
}

describe('loadOutline', () => {
  it('loads a valid CourseOutline from JSON', () => {
    const p = tmpFile('valid.json', JSON.stringify(VALID))
    const outline = loadOutline(p)
    expect(outline.name.ru).toBe('Курс')
    expect(outline.modules[0].units[0].slug).toBe('u1-start')
  })

  it('throws a clear error for a missing file', () => {
    expect(() => loadOutline(join(tmp, 'nope.json'))).toThrow(/cannot read outline file/)
  })

  it('throws a clear error for broken JSON', () => {
    const p = tmpFile('broken.json', '{ "name": ')
    expect(() => loadOutline(p)).toThrow(/not valid JSON/)
  })

  it('throws a clear error for a non-object JSON root', () => {
    const p = tmpFile('array.json', '[1, 2, 3]')
    expect(() => loadOutline(p)).toThrow(/must be a JSON object matching CourseOutline/)
  })

  it('surfaces validateOutline schema errors in the message', () => {
    const bad = { ...VALID, modules: [{ ...VALID.modules[0], slug: 'intro', units: [] }] }
    const p = tmpFile('schema-bad.json', JSON.stringify(bad))
    expect(() => loadOutline(p)).toThrow(/is invalid/)
    expect(() => loadOutline(p)).toThrow(/must match NN-slug/)
    expect(() => loadOutline(p)).toThrow(/at least one unit/)
  })
})

describe('moduleOutlineToCourseOutline', () => {
  const mo: ModuleOutline = {
    slug: '02-astrologia',
    author: { name: 'Наташа' },
    title: { ru: 'Астрология', en: 'Astrology' },
    description: { ru: 'Внутреннее небо', en: 'The inner sky' },
    units: [
      {
        slug: 'u1-karta',
        title: { ru: 'Карта', en: 'The chart' },
        objective: { ru: 'Прочитать карту', en: 'Read the chart' },
      },
    ],
  }

  it('wraps the module as a single-module course that passes validateOutline', () => {
    const course = moduleOutlineToCourseOutline(mo, { ru: 'Практика', en: 'Practice' })
    expect(validateOutline(course)).toEqual([])
    expect(course.name.en).toBe('Practice')
    expect(course.modules).toHaveLength(1)
    expect(course.modules[0].slug).toBe('02-astrologia')
    expect(course.modules[0].level).toBe(1)
    expect(course.modules[0].units[0].objective.ru).toBe('Прочитать карту')
  })
})

describe('extractOutlineOption', () => {
  it('passes argv through untouched when the flag is absent', () => {
    expect(extractOutlineOption(['01-intro', 'u1-start', 'ru']))
      .toEqual({ rest: ['01-intro', 'u1-start', 'ru'] })
  })

  it('extracts the path and keeps the remaining args in order', () => {
    expect(extractOutlineOption(['01-intro', '--outline', 'o.json', 'u1-start']))
      .toEqual({ outlinePath: 'o.json', rest: ['01-intro', 'u1-start'] })
  })

  it('throws when the flag has no value', () => {
    expect(() => extractOutlineOption(['x', '--outline'])).toThrow(/--outline requires/)
    expect(() => extractOutlineOption(['--outline', '--foo'])).toThrow(/--outline requires/)
  })
})
