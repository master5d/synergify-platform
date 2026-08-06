import { describe, it, expect } from 'vitest'
import { lintDehustle, lintOutlineDehustle } from './dehustle'
import type { CourseOutline } from './outline'

describe('lintDehustle', () => {
  it('catches EN profit/scarcity/avatar terms', () => {
    const hits = lintDehustle('Act now — only 3 spots left! Build your buyer avatar for passive income.')
    expect(hits).toEqual(expect.arrayContaining(['act now', 'passive income']))
    expect(hits.some(h => /spot/.test(h))).toBe(true)
    expect(hits.some(h => /avatar/.test(h))).toBe(true)
  })
  it('catches RU terms', () => {
    const hits = lintDehustle('Успей — осталось мест! Это инфобизнес про пассивный доход.')
    expect(hits).toEqual(expect.arrayContaining(['успей', 'инфобизнес', 'пассивный доход']))
  })
  it('returns [] for clean copy', () => {
    expect(lintDehustle('A calm, honest lesson about thinking with AI.')).toEqual([])
  })
})

const clean: CourseOutline = {
  name: { ru: 'Курс', en: 'Course' },
  modules: [{
    slug: '01-intro', level: 1,
    title: { ru: 'Введение', en: 'Intro' }, description: { ru: 'Спокойно', en: 'Calm' },
    units: [{ slug: 'u1-start', title: { ru: 'Старт', en: 'Start' }, objective: { ru: 'Понять основу', en: 'Grasp the basics' } }],
  }],
}

describe('lintOutlineDehustle', () => {
  it('returns [] for a clean outline', () => {
    expect(lintOutlineDehustle(clean)).toEqual([])
  })
  it('surfaces banned terms seeded into a field (deduplicated)', () => {
    const dirty = structuredClone(clean)
    dirty.modules[0].description = { ru: 'инфобизнес', en: 'passive income' }
    const hits = lintOutlineDehustle(dirty)
    expect(hits).toEqual(expect.arrayContaining(['инфобизнес', 'passive income']))
  })
})
