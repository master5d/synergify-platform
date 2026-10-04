export type GlossaryEntry = {
  term: string
  canon: { ru: string; en: string }
  banned: { ru: RegExp[]; en: RegExp[] }
  /** Literal snippets whose surrounding context is intentionally allowed. */
  allow?: string[]
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'program with tools',
    canon: { ru: 'агент', en: 'agent' },
    banned: { ru: [/\bассистент\b/gi, /\bнапарник\b/gi], en: [/\bAI assistant\b/gi] },
  },
  {
    term: 'course learner project',
    canon: { ru: 'AI-клон', en: 'AI clone' },
    banned: { ru: [], en: [] },
  },
  {
    term: 'processing chain',
    canon: { ru: 'pipeline', en: 'pipeline' },
    banned: { ru: [/(?<![A-Za-zА-Яа-яЁё])пайплайн(?![A-Za-zА-Яа-яЁё])/gi, /(?<![A-Za-zА-Яа-яЁё])конвейер(?![A-Za-zА-Яа-яЁё])/gi], en: [] },
    allow: ['контент-конвейер'], // идиома «content mill», не pipeline
  },
  {
    term: 'Claude Code event script',
    canon: { ru: 'Hook / Hooks', en: 'Hook / Hooks' },
    banned: { ru: [/(?<![A-Za-zА-Яа-яЁё])хуки?(?![A-Za-zА-Яа-яЁё])/gi], en: [] },
  },
  {
    term: 'agent capability',
    canon: { ru: 'Skill / Skills', en: 'Skill / Skills' },
    banned: { ru: [/(?<![A-Za-zА-Яа-яЁё])скилл(ы|ов|а|ом|ами|ах)?(?![A-Za-zА-Яа-яЁё])/gi, /\bнавык(?:и|а|ов|ом|ами|ах)?\b/gi], en: [] },
  },
  {
    term: 'artificial intelligence',
    canon: { ru: 'AI', en: 'AI' },
    banned: { ru: [/(?<![A-Za-zА-Яа-яЁё])ИИ(?![A-Za-zА-Яа-яЁё])/g], en: [] },
  },
  {
    term: 'course unit',
    canon: { ru: 'юнит', en: 'unit' },
    banned: { ru: [/(?<![A-Za-zА-Яа-яЁё])урок(?:а|и|ов|у|ом|ами|ах)?(?![A-Za-zА-Яа-яЁё])/gi], en: [/(?<![A-Za-z])lessons?(?![A-Za-z])/gi] },
    allow: ['урок из ошибки', 'lessons learned'],
  },
  {
    term: 'course section',
    canon: { ru: 'модуль', en: 'module' },
    banned: { ru: [/(?<![A-Za-zА-Яа-яЁё])тем(?:а|ы|е|у|ой|ами|ах)(?![A-Za-zА-Яа-яЁё])/gi], en: [/(?<![A-Za-z])theme(?![A-Za-z])/gi] },
    allow: ['color theme'],
  },
  {
    term: 'subordinate agent',
    canon: { ru: 'субагент', en: 'subagent' },
    banned: { ru: [/\bсаб-агент\b/gi], en: [/(?<![A-Za-z])sub-agent(?![A-Za-z])/gi] },
  },
  {
    term: 'model request',
    canon: { ru: 'промпт', en: 'prompt' },
    banned: { ru: [/\bзапрос(?:а|ы|у|ом|ами|ах)?\b/gi], en: [] },
    allow: ['HTTP-запрос', 'API-запрос'],
  },
  {
    term: 'specification',
    canon: { ru: 'ТЗ / спецификация', en: 'specification' },
    banned: { ru: [], en: [] },
  },
  {
    term: 'single model entry point',
    canon: { ru: 'шлюз к моделям', en: 'model gateway' },
    banned: { ru: [/\bгейтвей\b/gi], en: [/(?<!model )\bgateway\b/gi] },
  },
  {
    term: 'working style',
    canon: { ru: 'vibe coding', en: 'vibe coding' },
    banned: { ru: [/vibe-coding/gi, /вайб-кодинг[а-яё]*/gi], en: [/vibe-coding/gi] },
  },
]
