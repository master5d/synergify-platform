import { describe, it, expect } from 'vitest'
import { MODULE_SLUGS } from './modules'
import { MACRO_PHASES, phaseForSlug, buildTransformationArc } from './macro-phases'

describe('macro-phases', () => {
  it('has exactly 3 phases indexed 1,2,3', () => {
    expect(MACRO_PHASES).toHaveLength(3)
    expect(MACRO_PHASES.map(p => p.index)).toEqual([1, 2, 3])
  })

  it('covers every module slug exactly once', () => {
    const flat = MACRO_PHASES.flatMap(p => p.slugs)
    expect(flat).toHaveLength(MODULE_SLUGS.length)
    expect(new Set(flat).size).toBe(flat.length) // no duplicates
    expect(new Set(flat)).toEqual(new Set(MODULE_SLUGS))
  })

  it('has non-empty bilingual copy for every phase', () => {
    for (const p of MACRO_PHASES) {
      for (const field of [p.name, p.frustration, p.desire]) {
        expect(field.ru.trim().length).toBeGreaterThan(0)
        expect(field.en.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('resolves a slug to its phase, and null for unknown', () => {
    expect(phaseForSlug('04-prompt-engineering')?.key).toBe('craft')
    expect(phaseForSlug('00-kickstart')?.key).toBe('orient')
    expect(phaseForSlug('08-agent-engineering')?.key).toBe('orchestrate')
    expect(phaseForSlug('nope')).toBeNull()
  })

  it('builds a localized arc with exactly the current phase flagged', () => {
    const ru = buildTransformationArc('07-tools', 'ru')
    expect(ru.phases).toHaveLength(3)
    expect(ru.phases.filter(p => p.isCurrent).map(p => p.key)).toEqual(['orchestrate'])
    expect(ru.phases.find(p => p.key === 'orchestrate')!.name).toBe('Оркестрация')

    const en = buildTransformationArc('07-tools', 'en')
    expect(en.phases.find(p => p.key === 'orchestrate')!.name).toBe('Orchestration')

    const none = buildTransformationArc(null, 'ru')
    expect(none.phases.some(p => p.isCurrent)).toBe(false)
  })
})
