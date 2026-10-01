import { describe, it, expect } from 'vitest'
import { visibleQuestions, visibleOptions } from './visible'
import type { Question } from './types'

const qs: Question[] = [
  { id: 'F2', module: 'F', format: 'single', required: true, prompt: { ru: '', en: '' },
    options: [{ value: 'massage', label: { ru: '', en: '' } }] },
  { id: 'F2a', module: 'F', format: 'text', required: false, prompt: { ru: '', en: '' },
    showIf: { questionId: 'F2', equals: 'massage' } },
]

describe('visibleQuestions', () => {
  it('hides showIf question until condition met', () => {
    expect(visibleQuestions(qs, {}).map(q => q.id)).toEqual(['F2'])
    expect(visibleQuestions(qs, { F2: 'massage' }).map(q => q.id)).toEqual(['F2', 'F2a'])
  })
})

describe('visibleOptions', () => {
  const q: Question = {
    id: 'N', module: 'V', format: 'single', required: false, prompt: { ru: '', en: '' },
    options: [
      { value: 'both', label: { ru: '', en: '' } },
      { value: 'c', label: { ru: '', en: '' }, showIf: { questionId: 'R', equals: 'creator' } },
      { value: 'e', label: { ru: '', en: '' }, showIf: { questionId: 'R', equals: 'entrepreneur' } },
    ],
  }
  it('без ответа на условие — видны все опции', () => {
    expect(visibleOptions(q, {})!.map(o => o.value)).toEqual(['both', 'c', 'e'])
  })
  it('роль сужает опции', () => {
    expect(visibleOptions(q, { R: 'creator' })!.map(o => o.value)).toEqual(['both', 'c'])
    expect(visibleOptions(q, { R: 'entrepreneur' })!.map(o => o.value)).toEqual(['both', 'e'])
  })
})
