// Снятие опор компаньона по самопроверкам (BACKLOG «Педагогика 4/5», :706). Чистая логика, без React и
// без хранилища: записи интервального повтора (lib/spaced-review.ts, store `check_reviews:<courseKey>`)
// → сигнал, который сдвигает уровень опор в промпте компаньона (lib/learn-prompt.ts).
//
// Режим анкеты остаётся базой; сигнал только сдвигает: «снимай опоры быстрее» или «добавь опор».
// Опора — только то, что реально хранится: у вопроса одна запись с ПОСЛЕДНИМ ответом (`correct`) и его
// временем (`last`). Истории попыток нет, поэтому «последние ответы» = последние по времени вопросы.
import type { ReviewStore } from './spaced-review'

/** none — данных мало, не судим; hold — середина, опоры как в режиме; fade — снимать быстрее; add — добавить. */
export type FadeSignal = 'fade' | 'hold' | 'add' | 'none'

/** Меньше ответов — сигнала нет. Почему 4: в юните 2–3 самопроверки, и один юнит — это, по сути, один
 *  заход; два верных из двух на 3–4 вариантах ответа случаются и наугад. Четыре — уже больше одного юнита. */
export const FADE_MIN_ANSWERS = 4

/** Сколько последних ответов смотрим. Почему 8: это примерно три юнита — свежий срез, а не весь модуль;
 *  ранние ошибки, которые ученик уже перерос, не тянут опоры назад. */
export const FADE_WINDOW = 8

/** Доля верных, с которой снимаем опоры быстрее. Почему 0.8: при 4 ответах — все верные, при 5 — четыре;
 *  одна ошибка из пяти — нормальная, не повод держать ученика на поручнях. */
export const FADE_HIGH = 0.8

/** Доля верных НИЖЕ этой — добавляем опор. Почему 0.5: на 3–4 вариантах наугад выходит 25–33%, и меньше
 *  половины верных — это ближе к угадыванию, чем к пониманию. Ровно половина — ещё «держим». */
export const FADE_LOW = 0.5

/** Модули, по которым судим: текущий и, если известен, предыдущий по порядку курса. */
export function fadeModules(current: string, order: readonly string[] = []): string[] {
  const i = order.indexOf(current)
  return i > 0 ? [current, order[i - 1]] : [current]
}

export function fadeSignal(store: ReviewStore, modules: readonly string[]): FadeSignal {
  const recent = Object.values(store)
    .filter(r => modules.includes(r.module))
    .sort((a, b) => b.last - a.last)
    .slice(0, FADE_WINDOW)
  if (recent.length < FADE_MIN_ANSWERS) return 'none'
  const ratio = recent.filter(r => r.correct).length / recent.length
  if (ratio >= FADE_HIGH) return 'fade'
  if (ratio < FADE_LOW) return 'add'
  return 'hold'
}

/** Фраза к строке режима (BACKLOG :706). hold/none — без фразы. Тексты приняты контроллером по слову владельца
 *  «реши сам» 2026-10-13: это служебная команда ученика компаньону от первого лица, не авторский текст курса. */
export const FADE_LINE: Record<'fade' | 'add', { ru: string; en: string }> = {
  fade: {
    ru: 'По самопроверкам я уверенно отвечаю — снимай опоры быстрее.',
    en: 'My self-checks show I answer confidently — fade the scaffolding faster.',
  },
  add: {
    ru: 'В самопроверках я ошибаюсь — добавь опор.',
    en: 'I am making mistakes in my self-checks — add more scaffolding.',
  },
}

/** Фраза для промпта или null. enabled — флаг pack'а `COURSE.pedagogy.fadeByChecks`. */
export function fadeLine(signal: FadeSignal | null | undefined, locale: 'ru' | 'en', enabled: boolean): string | null {
  if (!enabled || (signal !== 'fade' && signal !== 'add')) return null
  return FADE_LINE[signal][locale]
}
