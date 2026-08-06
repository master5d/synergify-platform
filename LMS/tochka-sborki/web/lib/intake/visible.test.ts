import { describe, it, expect } from 'vitest'
import { visibleQuestions } from './visible'
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
