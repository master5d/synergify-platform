import { describe, it, expect } from 'vitest'
import { QUESTIONS, MODULE_INTROS } from './questions'
import { SCORING } from './scoring-weights'

describe('QUESTIONS', () => {
  it('has 63 questions across modules A–G', () => {
    expect(QUESTIONS.length).toBe(63)
    expect(new Set(QUESTIONS.map(q => q.module))).toEqual(new Set(['A','B','C','D','E','F','G']))
  })
  it('every question has RU and EN prompt', () => {
    for (const q of QUESTIONS) { expect(q.prompt.ru).toBeTruthy(); expect(q.prompt.en).toBeTruthy() }
  })
  it('single/multi questions have options with ru+en labels', () => {
    for (const q of QUESTIONS.filter(q => q.format === 'single' || q.format === 'multi')) {
      expect(q.options && q.options.length).toBeGreaterThan(0)
      for (const o of q.options!) { expect(o.label.ru).toBeTruthy(); expect(o.label.en).toBeTruthy() }
    }
  })
  it('every option value used in SCORING exists in its question', () => {
    for (const [qid, table] of Object.entries(SCORING)) {
      const q = QUESTIONS.find(q => q.id === qid)
      if (!q || !q.options) continue
      const values = new Set(q.options.map(o => o.value))
      for (const key of Object.keys(table)) {
        if (/^\d+$/.test(key)) continue
        expect(values.has(key), `${qid} missing option ${key}`).toBe(true)
      }
    }
  })
  it('has an intro for every module', () => {
    expect(MODULE_INTROS.map(m => m.id)).toEqual(['A','B','C','D','E','F','G'])
  })
  it('unique question ids', () => {
    expect(new Set(QUESTIONS.map(q => q.id)).size).toBe(QUESTIONS.length)
  })
})
