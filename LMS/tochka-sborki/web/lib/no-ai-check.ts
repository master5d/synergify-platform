// web/lib/no-ai-check.ts
// «Проверь себя без ИИ» после практики с агентом (BACKLOG «Педагогика 5», часть про самопроверку; intake LMS#20).
// Опора: Bastani et al. 2025, PNAS — с GPT на практике ученики решали лучше, на экзамене без ИИ хуже,
// и сами этого не замечали. Короткий вопрос своими словами после работы с агентом показывает, что осталось
// у ученика, а не у агента.
//
// Вопросы и опорные пункты — данные pack'а (packs/<pack>/course/no-ai-checks.ts). Движок держит пояснение
// «зачем» (одна фраза, общая для всех курсов) и порядок: сначала ответ, потом опорные пункты.
// Ответ ученика не хранится и никуда не уходит: это проверка для него самого.

export type NoAiLocale = 'ru' | 'en'
type L = Record<NoAiLocale, string>

export interface NoAiQuestion {
  /** Вопрос, на который ученик отвечает своими словами, не открывая чат с агентом. */
  question: L
  /** Что должно быть в ответе — открывается после ответа, для сравнения. 2–4 пункта из материала юнита. */
  points: L[]
}

export interface NoAiCheckData {
  module: string
  unit: string
  id: string
  /** 1–2 вопроса: блок короткий, он стоит в конце практики. */
  questions: NoAiQuestion[]
}

export const MIN_QUESTIONS = 1
export const MAX_QUESTIONS = 2
export const MIN_POINTS = 2
export const MAX_POINTS = 4

/** Пояснение «зачем» — одна фраза, общая для всех блоков (правило движка, не предмета курса). */
export const NO_AI_WHY: L = {
  ru: 'Закрой чат с агентом и ответь своими словами: в исследовании Bastani и соавторов (2025) с ИИ ученики решали практику лучше, а без него — хуже, и сами этого не замечали.',
  en: 'Close the chat with your agent and answer in your own words: in the study by Bastani and colleagues (2025), students solved practice problems better with AI and worse without it, and did not notice the gap themselves.',
}

export function findNoAiCheck(list: readonly NoAiCheckData[], module: string, unit: string, id: string): NoAiCheckData | null {
  return list.find(x => x.module === module && x.unit === unit && x.id === id) ?? null
}

/** Опорные пункты открываются, только когда ответ написан: сначала вспомнить самому. */
export function canShowPoints(answer: string): boolean {
  return answer.trim().length > 0
}

/** Все тексты блока (для гвардов заполненности и тона). */
export function noAiTexts(x: NoAiCheckData, locale: NoAiLocale): string[] {
  return x.questions.flatMap(q => [q.question[locale], ...q.points.map(p => p[locale])])
}
