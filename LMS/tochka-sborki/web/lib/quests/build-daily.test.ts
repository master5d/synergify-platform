import { describe, it, expect } from 'vitest'
import { buildDaily } from './build-daily'
import type { DailyInput } from './types'

const units = {
  '00-kickstart': [{ slug: 'u1', title: 'K1' }, { slug: 'u2', title: 'K2' }],
  '01-introduction': [{ slug: 'u1', title: 'I1' }],
  '04-prompt-engineering': [{ slug: 'u1', title: 'P1' }],
}

function base(over: Partial<DailyInput> = {}): DailyInput {
  return {
    date: '2026-05-24',
    locale: 'ru',
    skin: 'slavic-myth',
    cogTier: 3,
    niche: 'coach',
    outcome: null,
    unitsByModule: units,
    isUnitDone: () => false,
    completedModules: [],
    ...over,
  }
}

describe('buildDaily', () => {
  it('tier 1 → exactly one advance quest', () => {
    const set = buildDaily(base({ cogTier: 1 }))
    expect(set.quests).toHaveLength(1)
    expect(set.quests[0].kind).toBe('advance')
  })

  it('advance targets the first not-done unit in module order', () => {
    const set = buildDaily(base({ cogTier: 1 }))
    expect(set.quests[0].id).toBe('advance:00-kickstart/u1')
    expect(set.quests[0].href).toBe('/lessons/00-kickstart/u1/')
    expect(set.quests[0].cs).toBe(0)
  })

  it('advance skips completed units', () => {
    const set = buildDaily(base({ cogTier: 1, isUnitDone: (m, u) => m === '00-kickstart' }))
    expect(set.quests[0].id).toBe('advance:01-introduction/u1')
  })

  it('en locale produces an /en advance href', () => {
    const set = buildDaily(base({ cogTier: 1, locale: 'en' }))
    expect(set.quests[0].href).toBe('/en/lessons/00-kickstart/u1/')
  })

  it('whole course complete → a single complete quest, no advance', () => {
    const set = buildDaily(base({ cogTier: 1, isUnitDone: () => true }))
    expect(set.quests).toHaveLength(1)
    expect(set.quests[0].kind).toBe('complete')
  })

  it('tier 2 adds a practice quest from a reached module with a niche-filled body', () => {
    const set = buildDaily(base({ cogTier: 2 }))
    const practice = set.quests.find(q => q.kind === 'practice')
    expect(practice).toBeTruthy()
    expect(practice!.cs).toBe(10)
    expect(practice!.body).toContain('коучинге')
    expect(practice!.body).not.toContain('{niche}')
  })

  it('tier 3 with a completed module adds a retrieval quest prefixed by the mentor name', () => {
    const set = buildDaily(base({ cogTier: 3, isUnitDone: (m) => m === '00-kickstart', completedModules: ['00-kickstart', '01-introduction'] }))
    const retrieval = set.quests.find(q => q.kind === 'retrieval')
    expect(retrieval).toBeTruthy()
    expect(retrieval!.cs).toBe(10)
    expect(retrieval!.body).toContain('Домовой')
  })

  it('tier 3 day-1 (no completed modules) yields no retrieval quest', () => {
    const set = buildDaily(base({ cogTier: 3, completedModules: [] }))
    expect(set.quests.some(q => q.kind === 'retrieval')).toBe(false)
  })

  it('is deterministic for the same inputs', () => {
    expect(buildDaily(base({ cogTier: 3, completedModules: ['00-kickstart', '01-introduction'], isUnitDone: (m) => m !== '04-prompt-engineering' })))
      .toEqual(buildDaily(base({ cogTier: 3, completedModules: ['00-kickstart', '01-introduction'], isUnitDone: (m) => m !== '04-prompt-engineering' })))
  })

  it('invalid cogTier falls back to 2 (advance + practice)', () => {
    const set = buildDaily(base({ cogTier: 99 }))
    expect(set.quests).toHaveLength(2)
  })

  it('retrieval uses the EN mentor name for en locale', () => {
    const set = buildDaily(base({ cogTier: 3, locale: 'en', isUnitDone: (m) => m === '00-kickstart', completedModules: ['00-kickstart', '01-introduction'] }))
    const retrieval = set.quests.find(q => q.kind === 'retrieval')
    expect(retrieval).toBeTruthy()
    expect(retrieval!.body).toContain('House-Spirit') // slavic-myth mentor name (en)
  })

  it('practice body is rendered in the en template for en locale', () => {
    const set = buildDaily(base({ cogTier: 2, locale: 'en', niche: 'coach' }))
    const practice = set.quests.find(q => q.kind === 'practice')
    expect(practice).toBeTruthy()
    expect(practice!.body).toContain('coaching')
    expect(practice!.body).not.toContain('{niche}')
  })
})
