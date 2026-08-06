import { describe, it, expect } from 'vitest'
import { validateModuleOutline } from './module-outline'
import type { ModuleOutline } from './module-outline'

const EXISTING = ['01-living-practice']

const valid: ModuleOutline = {
  slug: '02-astrologia-vnutrennego-neba',
  author: { name: 'Наташа', contact: 'natasha@example.com' },
  title: { ru: 'Астрология внутреннего неба', en: 'Astrology of the Inner Sky' },
  description: { ru: 'Спокойный модуль о символическом языке', en: 'A calm module on symbolic language' },
  units: [
    { slug: 'u1-karta', title: { ru: 'Карта', en: 'The Chart' }, objective: { ru: 'Понять карту', en: 'Grasp the chart' } },
    { slug: 'u2-yazyk', title: { ru: 'Язык', en: 'The Language' }, objective: { ru: 'Освоить язык', en: 'Learn the language' } },
  ],
}

describe('validateModuleOutline', () => {
  it('accepts a valid guest-module outline', () => {
    expect(validateModuleOutline(valid, EXISTING)).toEqual([])
  })

  it('rejects a module number already taken in the pack', () => {
    const clash = structuredClone(valid)
    clash.slug = '01-astrologia'
    const errors = validateModuleOutline(clash, EXISTING)
    expect(errors.some(e => /number 01 is already taken by "01-living-practice"/.test(e))).toBe(true)
  })

  it('rejects malformed module and unit slugs', () => {
    const bad = structuredClone(valid)
    bad.slug = 'astrologia'
    bad.units[0].slug = 'karta'
    const errors = validateModuleOutline(bad, EXISTING)
    expect(errors.some(e => /module slug "astrologia"/.test(e))).toBe(true)
    expect(errors.some(e => /unit slug "karta"/.test(e))).toBe(true)
  })

  it('rejects duplicate unit slugs and missing locales', () => {
    const bad = structuredClone(valid)
    bad.units[1].slug = 'u1-karta'
    bad.units[0].objective = { ru: 'Понять', en: '' }
    const errors = validateModuleOutline(bad, EXISTING)
    expect(errors.some(e => /duplicate unit slug "u1-karta"/.test(e))).toBe(true)
    expect(errors.some(e => /objective must be non-empty in ru and en/.test(e))).toBe(true)
  })

  it('rejects author without a name and unit counts out of 1..8', () => {
    const bad = structuredClone(valid)
    bad.author = { name: '  ' }
    bad.units = []
    const errors = validateModuleOutline(bad, EXISTING)
    expect(errors.some(e => /author\.name/.test(e))).toBe(true)
    expect(errors.some(e => /at least one unit/.test(e))).toBe(true)

    const nine = structuredClone(valid)
    nine.units = Array.from({ length: 9 }, (_, i) => ({
      slug: `u${i + 1}-x`, title: valid.units[0].title, objective: valid.units[0].objective,
    }))
    expect(validateModuleOutline(nine, EXISTING).some(e => /at most 8 units/.test(e))).toBe(true)
  })

  it('runs the de-hustle lint over every outline string', () => {
    const hustly = structuredClone(valid)
    hustly.description = { ru: 'Успей — это инфобизнес', en: 'Build passive income' }
    const errors = validateModuleOutline(hustly, EXISTING)
    expect(errors.some(e => /de-hustle: banned term "успей"/.test(e))).toBe(true)
    expect(errors.some(e => /de-hustle: banned term "passive income"/.test(e))).toBe(true)
  })
})
