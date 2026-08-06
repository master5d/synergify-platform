// lib/authoring/module-plan-prompt.ts
// Sovereign-эмиттер Plan-стадии гостевого модуля (Ф2 S1): фрактальная декомпозиция
// «идея → референсы → ICP → разворот → юниты → ModuleOutline JSON». Промпт исполняет
// АГЕНТ МАСТЕРА (BYO, как research.ts) — движок детерминирован, ноль LLM-вызовов.
// Рамка манифеста целевого курса вшивается в промпт лейблами правил.
import type { Locale } from '@/lib/dictionaries'

export interface ModulePlanInput {
  courseName: string
  packSlug: string
  /** идея модуля в одну строку */
  idea: string
  locale: Locale
  /** лейблы правил MANIFEST целевого pack'а — ограничения тона */
  manifestLabels: string[]
}

const SCHEMA = `{
  "slug": "NN-kebab-case",                          // NN — свободный номер модуля, напр. "02-astrologia"
  "author": { "name": "Имя Мастера", "contact": "email/telegram (optional)" },
  "title": { "ru": "...", "en": "..." },
  "description": { "ru": "...", "en": "..." },
  "units": [                                        // 3..6 юнитов
    {
      "slug": "u1-kebab-case",
      "title": { "ru": "...", "en": "..." },
      "objective": { "ru": "...", "en": "..." }
    }
  ]
}`

/** Промпт Plan-стадии для агента мастера. Чистая функция, RU — дефолтная локаль. */
export function buildModulePlanPrompt(i: ModulePlanInput): string {
  const constraints = i.manifestLabels.map(l => `- ${l}`).join('\n')
  if (i.locale === 'en') {
    return [
      `You are helping me plan ONE guest module for the course "${i.courseName}" (pack: ${i.packSlug}) — honest, calm, no selling.`,
      `Module idea (one line): ${i.idea}`,
      ``,
      `Work through these steps, in order, showing your reasoning:`,
      `1. Find 5-7 tier-0/tier-1 reference courses/programs in this domain and extract their structural moves (sequencing, entry points, practice formats).`,
      `2. Build the module's ICP: who exactly comes to this module inside this course, with what background and what blockers.`,
      `3. Write a one-page spread: "for whom / what they bring in / what they leave with" — concrete, no hype.`,
      `4. Decompose the module into 3-6 units, each with a clear objective. Then recurse INTO each unit: key concepts, a bisociative mental hook, one common misconception, one concrete practice step.`,
      `5. Output the final result as a ModuleOutline JSON exactly in this schema:`,
      SCHEMA,
      ``,
      `Tone frame — the course manifest. The module text must NEVER contain:`,
      constraints,
      ``,
      `Every string must be filled in BOTH locales (ru + en). No marketing, no promised results.`,
    ].join('\n')
  }
  return [
    `Помоги мне спланировать ОДИН гостевой модуль для курса «${i.courseName}» (pack: ${i.packSlug}) — честно, спокойно, без продаж.`,
    `Идея модуля (одна строка): ${i.idea}`,
    ``,
    `Пройди шаги по порядку, показывая ход мысли:`,
    `1. Найди 5-7 референс-курсов/программ домена уровня tier-0/tier-1 и вытащи их структурные ходы (последовательность, точки входа, форматы практики).`,
    `2. Построй ICP модуля: кто именно приходит в этот модуль внутри этого курса, с каким бэкграундом и какими затыками.`,
    `3. Сформулируй разворотом на страницу: «для кого / что на входе / что на выходе» — конкретно, без хайпа.`,
    `4. Разложи модуль на 3-6 юнитов, у каждого — внятная цель (objective). Затем рекурсивно провались НА УРОВЕНЬ каждого юнита: ключевые концепты, бисоциативный мысленный hook, одна частая misconception, один конкретный шаг практики.`,
    `5. Выведи итог как ModuleOutline JSON строго по этой схеме:`,
    SCHEMA,
    ``,
    `Рамка тона — манифест курса. В текстах модуля НИКОГДА не должно быть:`,
    constraints,
    ``,
    `Каждая строка заполняется в ОБЕИХ локалях (ru + en). Без маркетинга, без обещанных результатов.`,
  ].join('\n')
}
