import { QUESTIONS, MODULE_INTROS } from './questions'
import { QUESTIONS_V2, MODULE_INTROS_V2 } from '../course/intake-questions'
import type { InstrumentVersion, Question, ModuleIntro } from './types'

export function getQuestions(v: InstrumentVersion): Question[] {
  return v === 2 ? QUESTIONS_V2 : QUESTIONS
}
export function getModuleIntros(v: InstrumentVersion): ModuleIntro[] {
  return v === 2 ? MODULE_INTROS_V2 : MODULE_INTROS
}
export function requiredIds(v: InstrumentVersion): string[] {
  return getQuestions(v).filter(q => q.required).map(q => q.id)
}
