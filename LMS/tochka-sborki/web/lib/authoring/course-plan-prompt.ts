// lib/authoring/course-plan-prompt.ts
// Ф3: sovereign-эмиттер Plan-стадии НОВОГО КУРСА — course-level аналог
// module-plan-prompt. Фрактальная декомпозиция «идея → референсы → ICP →
// разворот → модули → юниты → CourseOutline JSON». Промпт исполняет агент
// ВЛАДЕЛЬЦА (BYO) — движок детерминирован, ноль LLM-вызовов.
// Рамка тона = лейблы CORE_MANIFEST (ядро манифеста академии) + де-hustle.
import type { Locale } from '@/lib/dictionaries'

export interface CoursePlanInput {
  /** идея курса в одну строку */
  idea: string
  locale: Locale
  /** будущий домен/сайт курса (optional) — контекст для референс-поиска */
  domain?: string
  /** лейблы правил CORE_MANIFEST — ограничения тона всех курсов академии */
  manifestLabels: string[]
}

// Схема полей CourseOutline — зеркало lib/authoring/outline.ts (validateOutline).
const SCHEMA = `{
  "name": { "ru": "...", "en": "..." },
  "modules": [                                      // 3..8 модулей
    {
      "slug": "NN-kebab-case",                      // NN — порядковый номер, напр. "01-foundation"
      "title": { "ru": "...", "en": "..." },
      "description": { "ru": "...", "en": "..." },
      "level": 1,                                   // integer >= 1 — уровень сложности модуля
      "units": [                                    // 2..6 юнитов
        {
          "slug": "u1-kebab-case",
          "title": { "ru": "...", "en": "..." },
          "objective": { "ru": "...", "en": "..." }
        }
      ]
    }
  ]
}`

/** Промпт Plan-стадии нового курса для агента владельца. Чистая функция, RU — дефолт. */
export function buildCoursePlanPrompt(i: CoursePlanInput): string {
  const constraints = i.manifestLabels.map(l => `- ${l}`).join('\n')
  if (i.locale === 'en') {
    return [
      `You are helping me plan a WHOLE NEW COURSE — honest, calm, no selling.`,
      `Course idea (one line): ${i.idea}`,
      ...(i.domain ? [`Course domain/site: ${i.domain}`] : []),
      ``,
      `Work through these steps, in order, showing your reasoning:`,
      `1. Find 5-7 tier-0/tier-1 reference courses/schools in this domain and extract their structural moves (sequencing, entry points, practice formats).`,
      `2. Build the course ICP: who exactly comes, with what background and what blockers.`,
      `3. Write a one-page spread: "for whom / what they bring in / what they leave with" — concrete, no hype.`,
      `4. Decompose the course fractally: 3-8 modules, each split into 2-6 units with a clear objective. Then recurse INTO each unit: key concepts, a bisociative mental hook, one common misconception, one concrete practice step.`,
      `5. Output the final result as a CourseOutline JSON exactly in this schema (lib/authoring/outline.ts):`,
      SCHEMA,
      ``,
      `Tone frame — the academy core manifest. The course text must NEVER contain:`,
      constraints,
      ``,
      `De-hustle: no income promises, no scarcity, no sales pitch — the course speaks calmly.`,
      `Every string must be filled in BOTH locales (ru + en). No marketing, no promised results.`,
    ].join('\n')
  }
  return [
    `Помоги мне спланировать НОВЫЙ КУРС целиком — честно, спокойно, без продаж.`,
    `Идея курса (одна строка): ${i.idea}`,
    ...(i.domain ? [`Домен/сайт курса: ${i.domain}`] : []),
    ``,
    `Пройди шаги по порядку, показывая ход мысли:`,
    `1. Найди 5-7 референс-курсов/школ этого домена уровня tier-0/tier-1 и вытащи их структурные ходы (последовательность, точки входа, форматы практики).`,
    `2. Построй ICP курса: кто именно приходит, с каким бэкграундом и какими затыками.`,
    `3. Сформулируй разворотом на страницу: «для кого / что на входе / что на выходе» — конкретно, без хайпа.`,
    `4. Разложи курс фрактально: 3-8 модулей, каждый — на 2-6 юнитов с внятной целью (objective). Затем рекурсивно провались НА УРОВЕНЬ каждого юнита: ключевые концепты, бисоциативный мысленный hook, одна частая misconception, один конкретный шаг практики.`,
    `5. Выведи итог как CourseOutline JSON строго по этой схеме (lib/authoring/outline.ts):`,
    SCHEMA,
    ``,
    `Рамка тона — ядро манифеста академии. В текстах курса НИКОГДА не должно быть:`,
    constraints,
    ``,
    `Де-hustle: без обещаний дохода, без scarcity, без продающего тона — курс говорит спокойно.`,
    `Каждая строка заполняется в ОБЕИХ локалях (ru + en). Без маркетинга, без обещанных результатов.`,
  ].join('\n')
}
