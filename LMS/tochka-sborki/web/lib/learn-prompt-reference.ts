// web/lib/learn-prompt-reference.ts
// Эталон юнита для компаньона «Учиться с ИИ» (Педагогика 5, intake LMS#20; Bastani 2025 PNAS,
// Kestin 2025 Sci Rep). В обоих сильных RCT тьютор знал решение и типичные ошибки из system prompt
// и вёл подсказками, не раскрывая ответа. Здесь эталон собирается из данных pack'а:
//   - ключевые идеи юнита — его вопросы «Проверь себя» из _meta.json (верный вариант + explain);
//   - эталон практики и типичные ошибки — packs/<pack>/course/practice-references.ts (заполнен пилотно;
//     юнит без записи получает только ключевые идеи, юнит без checks и записи — промпт без эталона).
// Эталон едет ТОЛЬКО в полном копируемом промпте (buildLearnPrompt), не в `?q=`-prefill: там кап
// MAX_BOOTSTRAP, и ссылка оседает в истории браузера. Правило «не раскрывай, направляй» — движка.
import type { Locale } from './dictionaries'
import type { ModuleMeta } from './content'

type L10n = { ru: string; en: string }

/** Запись pack'а: эталон практики одного юнита и типичные ошибки на ней. */
export interface PracticeReference {
  module: string
  unit: string
  /** Как выглядит хорошее выполнение практики: критерии, а не готовый текст за ученика. */
  solution: L10n
  /** 2–4 типичные ошибки, которые компаньон помогает увидеть вопросом. */
  mistakes: L10n[]
}

/** Эталон, готовый к вставке в промпт (уже на языке ученика). */
export interface UnitReference {
  /** «Вопрос → верный ответ. Почему.» по checks юнита. */
  keyPoints: string[]
  solution: string | null
  mistakes: string[]
}

export function unitReference(
  meta: Pick<ModuleMeta, 'checks'>,
  moduleSlug: string,
  unitSlug: string,
  locale: Locale,
  practice: PracticeReference[] = [],
): UnitReference | null {
  const L = locale === 'en' ? 'en' : 'ru'
  const keyPoints = (meta.checks ?? [])
    .filter((c) => c.unit === unitSlug && c.options[c.answer] != null)
    .map((c) => `${c.question} → ${c.options[c.answer]}. ${c.explain}`.replace(/\s+/g, ' ').trim())
  const p = practice.find((r) => r.module === moduleSlug && r.unit === unitSlug)
  const solution = p ? p.solution[L] : null
  const mistakes = p ? p.mistakes.map((m) => m[L]) : []
  if (!keyPoints.length && !solution && !mistakes.length) return null
  return { keyPoints, solution, mistakes }
}

/** Блок эталона для полного промпта. Правила — движка: одинаковы для любого курса. */
export const REFERENCE_RULES = {
  heading: {
    ru: 'Эталон этого юнита — для тебя, не для меня:',
    en: 'Reference for this unit — for you, not for me:',
  },
  rules: [
    {
      ru: 'Не раскрывай эталон: не пересказывай его, не выдавай верные ответы самопроверок и готовое решение практики — ни целиком, ни по частям. Используй его, чтобы направлять: сверяй с ним мои ответы и задавай вопрос туда, где я от него расхожусь.',
      en: 'Do not reveal the reference: do not paraphrase it, do not give away the self-check answers or a finished solution to the practice — neither whole nor in pieces. Use it to guide me: compare my answers against it and ask a question exactly where I diverge from it.',
    },
    {
      ru: 'Если я делаю типичную ошибку из списка ниже — не называй её сразу; задай вопрос, после которого я замечу её сам, и подсказывай по шагам.',
      en: 'If I make one of the typical mistakes below, do not name it straight away; ask a question that lets me notice it myself, and hint step by step.',
    },
    {
      ru: 'Если после своей попытки я прошу разбор — сравни мою работу с эталоном по пунктам: что совпало, чего не хватает. Исправляю я сам.',
      en: 'If I ask for a review after my own attempt, compare my work with the reference point by point: what matches, what is missing. I make the fix myself.',
    },
    // intake LMS#24 (поправка Zwingmann к Mr. Ranedeer; комментарий о конфабуляции): граница материала курса.
    {
      ru: 'Если мой вопрос выходит за материал этого юнита — скажи прямо: «этого нет в материале урока», и отдели своё объяснение от того, чему учит курс.',
      en: 'If my question goes beyond this unit\'s material, say so plainly: "this is not in the lesson material", and keep your own explanation apart from what the course teaches.',
    },
  ],
  keyPoints: { ru: 'Ключевые идеи юнита (вопрос → верный ответ):', en: 'Key ideas of the unit (question → correct answer):' },
  solution: { ru: 'Эталон практики:', en: 'Practice reference:' },
  mistakes: { ru: 'Типичные ошибки:', en: 'Typical mistakes:' },
} as const

export function referenceLines(ref: UnitReference | null | undefined, locale: Locale): string[] {
  if (!ref) return []
  const L = locale === 'en' ? 'en' : 'ru'
  const R = REFERENCE_RULES
  return [
    R.heading[L],
    ...R.rules.map((r) => `- ${r[L]}`),
    '',
    ...(ref.keyPoints.length ? [R.keyPoints[L], ...ref.keyPoints.map((k) => `- ${k}`), ''] : []),
    ...(ref.solution ? [R.solution[L], ref.solution, ''] : []),
    ...(ref.mistakes.length ? [R.mistakes[L], ...ref.mistakes.map((m) => `- ${m}`), ''] : []),
  ]
}
