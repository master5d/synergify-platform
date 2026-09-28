import type { Question, Answers, QuestionOption } from './types'
export function visibleQuestions(all: Question[], answers: Answers): Question[] {
  return all.filter(q => !q.showIf || answers[q.showIf.questionId] === q.showIf.equals)
}
/** Опции вопроса под уже данные ответы (напр. V_NICHE по роли V_ROLE). На условие не ответили — видны все. */
export function visibleOptions(q: Question, answers: Answers): QuestionOption[] | undefined {
  return q.options?.filter(o => {
    if (!o.showIf) return true
    const got = answers[o.showIf.questionId]
    return got == null || got === '' || got === o.showIf.equals
  })
}
