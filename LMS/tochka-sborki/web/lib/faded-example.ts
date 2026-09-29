// web/lib/faded-example.ts
// Faded worked examples в практике юнита (BACKLOG «Педагогика 4», intake LMS#20; решение владельца 2026-09-28).
// Опора: Barbieri et al. 2023 (worked examples, g≈0.48), Renkl & Atkinson (постепенное снятие шагов лучше пар
// «пример–задача»), Kalyuga (expertise reversal: продвинутым разбор мешает — отсюда «Сразу к самостоятельной»).
//
// Три ступени одного типа задачи:
//   1. worked — полный разбор: каждый шаг с ответом и «почему так»;
//   2. faded  — та же задача на другом материале, часть шагов пропущена: ученик пишет сам, эталон скрыт
//               до кнопки «Сравнить с эталоном» (сравнивает сам ученик — свободный текст мы не оцениваем);
//   3. solo   — только постановка: дальше ученик делает практику юнита на своей задаче.
//
// Примеры — данные pack'а (packs/<pack>/course/faded-examples.ts), движок держит форму ступеней и гварды.
// Относительные импорты: pack-файл берёт отсюда типы относительно (как role-plays).

export type FadedLocale = 'ru' | 'en'
type L = Record<FadedLocale, string>

/** Шаг разбора: что делаем (метка), ответ и почему он такой. */
export interface FadedStep {
  /** Метка шага: раздел промпта, шаг pipeline, заметка для сортировки. */
  label: L
  /** Ответ шага. На ступени faded у пропуска — скрытый эталон. */
  text: L
  /** Почему так — одна-две фразы из материала юнита. */
  why: L
}

export interface FadedBlankStep extends FadedStep {
  /** true — шаг пропущен: ученик пишет ответ сам, эталон открывается по кнопке. */
  blank?: boolean
}

export interface FadedExampleData {
  module: string
  unit: string
  id: string
  /** Тип задачи одной строкой: «Промпт по CTID», «Разложить pipeline на AI/Tool/Code». */
  title: L
  worked: { task: L; steps: FadedStep[] }
  faded: { task: L; steps: FadedBlankStep[] }
  /** Самостоятельная ступень — только постановка, без шагов. */
  solo: { task: L }
}

export const MIN_WORKED_STEPS = 3
export const STAGES = ['worked', 'faded', 'solo'] as const
export type FadedStage = (typeof STAGES)[number]

export function findFadedExample(list: readonly FadedExampleData[], module: string, unit: string, id: string): FadedExampleData | null {
  return list.find(x => x.module === module && x.unit === unit && x.id === id) ?? null
}

/** Индексы пропусков ступени faded. */
export function blankIndexes(x: FadedExampleData): number[] {
  return x.faded.steps.flatMap((s, i) => (s.blank ? [i] : []))
}

/** Эталон открывается, только когда ученик написал что-то в каждом пропуске: сначала сам, потом сравнение. */
export function canReveal(answers: readonly string[], blanks: readonly number[]): boolean {
  return blanks.length > 0 && blanks.every(i => (answers[i] ?? '').trim().length > 0)
}

/** Все тексты примера (для гвардов заполненности и тона). */
export function fadedTexts(x: FadedExampleData, locale: FadedLocale): string[] {
  const steps = [...x.worked.steps, ...x.faded.steps]
  return [
    x.title[locale], x.worked.task[locale], x.faded.task[locale], x.solo.task[locale],
    ...steps.flatMap(s => [s.label[locale], s.text[locale], s.why[locale]]),
  ]
}
