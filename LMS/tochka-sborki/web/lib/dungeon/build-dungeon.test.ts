import { describe, it, expect } from 'vitest'
import { buildDungeon } from './build-dungeon'
import type { DungeonInput } from './types'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { NICHE_MODULE } from '@/lib/course/niche-map'

function base(over: Partial<DungeonInput> = {}): DungeonInput {
  return {
    locale: 'ru',
    skin: 'slavic-myth',
    niche: 'coach',
    outcome: null,
    isModuleCompleted: () => true,
    ...over,
  }
}

describe('buildDungeon', () => {
  it('maps niche to its module and names from the flavor bank', () => {
    const v = buildDungeon(base())
    expect(v.niche).toBe('coach')
    expect(v.module).toBe('04-prompt-engineering')
    expect(v.dungeonName).toBe('Чертог Резонанса')
    expect(v.boss.name).toBe('Эхо Сомнения')
  })

  it('produces 3 stages at escalating tiers with cs 15', () => {
    const v = buildDungeon(base())
    expect(v.stages.map(s => s.tier)).toEqual(['task', 'process', 'outcome'])
    expect(v.stages.map(s => s.id)).toEqual(['dungeon:coach:s1', 'dungeon:coach:s2', 'dungeon:coach:s3'])
    expect(v.stages.every(s => s.cs === 15)).toBe(true)
    expect(v.stages.every(s => s.body.length > 0)).toBe(true)
  })

  it('boss has cs 50, namespaced id, and slot-filled body', () => {
    const v = buildDungeon(base({ niche: 'coach', outcome: 'more clients' }))
    expect(v.boss.id).toBe('dungeon:coach:boss')
    expect(v.boss.cs).toBe(50)
    expect(v.boss.body).toContain('more clients')
    expect(v.boss.body).not.toContain('{outcome}')
    expect(v.boss.body).not.toContain('{niche}')
  })

  it('is locked when the niche module is not completed', () => {
    expect(buildDungeon(base({ isModuleCompleted: () => false })).locked).toBe(true)
    expect(buildDungeon(base({ isModuleCompleted: () => true })).locked).toBe(false)
  })

  it('falls back to the "other" flavor for an unknown/null niche', () => {
    const v = buildDungeon(base({ niche: null }))
    expect(v.niche).toBe('other')
    expect(v.dungeonName).toBe('Безымянный Предел')
    expect(v.boss.id).toBe('dungeon:other:boss')
  })

  it('is deterministic for the same input', () => {
    expect(buildDungeon(base())).toEqual(buildDungeon(base()))
  })

  it('renders flavor names in the EN locale', () => {
    const v = buildDungeon(base({ locale: 'en' }))
    expect(v.dungeonName).toBe('Hall of Resonance')
    expect(v.boss.name).toBe('The Echo of Doubt')
  })

  it('fills the outcome-tier stage body with the learner outcome', () => {
    const v = buildDungeon(base({ niche: 'coach', outcome: 'grow my practice' }))
    const outcomeStage = v.stages.find(s => s.tier === 'outcome')!
    expect(outcomeStage.body).toContain('grow my practice')
  })
})

describe('flavor-bank / niche-map consistency', () => {
  it('every flavor-bank niche has a NICHE_MODULE mapping', () => {
    for (const niche of Object.keys(FLAVOR_BANK)) {
      expect(NICHE_MODULE[niche], `missing NICHE_MODULE entry for "${niche}"`).toBeTruthy()
    }
  })
  it('covers the 8 expected niches', () => {
    expect(Object.keys(FLAVOR_BANK).sort()).toEqual(
      ['astrology', 'coach', 'content', 'ecommerce', 'massage', 'other', 'service', 'tech'],
    )
  })
})
