import type { Question, Answers } from './types'
export function visibleQuestions(all: Question[], answers: Answers): Question[] {
  return all.filter(q => !q.showIf || answers[q.showIf.questionId] === q.showIf.equals)
}
