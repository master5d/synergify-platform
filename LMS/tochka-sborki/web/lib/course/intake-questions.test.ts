import { describe, it, expect } from 'vitest'
import { QUESTIONS_V2, MODULE_INTROS_V2 } from './intake-questions'

const NICHE = new Set(['coach','massage','astrology','content','ecommerce','service','tech','other'])
const SKIN = new Set(['slavic-myth','dark-fantasy','cyber-noir','space-opera','anime-quest','soviet-heroic','mystic-arcane'])

describe('QUESTIONS_V2', () => {
  it('every question is bilingual and optional', () => {
    for (const q of QUESTIONS_V2) {
      expect(q.prompt.ru, q.id).toBeTruthy()
      expect(q.prompt.en, q.id).toBeTruthy()
      expect(q.required, `${q.id} must be optional`).toBe(false)
    }
  })
  it('every showIf points at a real question', () => {
    const ids = new Set(QUESTIONS_V2.map(q => q.id))
    for (const q of QUESTIONS_V2) if (q.showIf) expect(ids.has(q.showIf.questionId), q.id).toBe(true)
  })
  it('niche + skin options reuse the canonical enums', () => {
    const niche = QUESTIONS_V2.find(q => q.id === 'V_NICHE')!
    const skin = QUESTIONS_V2.find(q => q.id === 'V_SKIN')!
    expect(niche.options!.every(o => NICHE.has(o.value))).toBe(true)
    expect(skin.options!.every(o => SKIN.has(o.value))).toBe(true)
  })
  it('MBTI: self-report + 4 axis pairs gated on unknown', () => {
    for (const axis of ['V_MBTI_EI','V_MBTI_SN','V_MBTI_TF','V_MBTI_JP']) {
      const q = QUESTIONS_V2.find(x => x.id === axis)!
      expect(q.showIf).toEqual({ questionId: 'V_MBTI_SR', equals: 'unknown' })
      expect(q.options!.length).toBe(2)
    }
  })
  it('depth battery is gated behind V_DEEPEN == yes', () => {
    const depth = QUESTIONS_V2.filter(q => q.id.startsWith('VD_'))
    expect(depth.length).toBeGreaterThanOrEqual(5)
    for (const q of depth) expect(q.showIf).toEqual({ questionId: 'V_DEEPEN', equals: 'yes' })
  })
  it('one module intro per distinct module id', () => {
    const mods = new Set(QUESTIONS_V2.map(q => q.module))
    for (const m of mods) expect(MODULE_INTROS_V2.some(i => i.id === m)).toBe(true)
  })
})
