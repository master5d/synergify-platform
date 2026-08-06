export interface CatalogEntry {
  slug: string
  topic: { ru: string; en: string }
}

// One-line topic per module — the grounding the demand classifier matches against.
export const COURSE_CATALOG: CatalogEntry[] = [
  { slug: '00-kickstart', topic: { ru: 'Карта местности для нонкодеров: что такое agentic AI и зачем', en: 'Orientation map for non-coders: what agentic AI is and why' } },
  { slug: '01-introduction', topic: { ru: 'Software 3.0, четыре сдвига в работе с ИИ', en: 'Software 3.0 and the four shifts in working with AI' } },
  { slug: '02-setup-guide', topic: { ru: 'Установка инструментов: Warp, Claude Code, Git, Marp', en: 'Installing tools: Warp, Claude Code, Git, Marp' } },
  { slug: '03-stack-selection', topic: { ru: 'Выбор стека: Claude/Sovereign/Cloud-OSS/Behind-GFW, Hermes, миграция', en: 'Choosing a stack: Claude/Sovereign/Cloud-OSS/Behind-GFW, Hermes, migration' } },
  { slug: '04-prompt-engineering', topic: { ru: 'Промпт-инжиниринг, магические слова, структура запроса', en: 'Prompt engineering, magic words, request structure' } },
  { slug: '05-context-memory', topic: { ru: 'Контекст, память, файлы контекста для агентов', en: 'Context, memory, and context files for agents' } },
  { slug: '06-audio-pipeline', topic: { ru: 'Pipeline: скрапинг → анализ → insights, работа с аудио/контентом', en: 'Pipeline: scraping → analysis → insights, working with audio/content' } },
  { slug: '07-tools', topic: { ru: 'MCP-серверы, Agent Skills, Hooks, Superpowers', en: 'MCP servers, Agent Skills, Hooks, Superpowers' } },
  { slug: '08-agent-engineering', topic: { ru: 'Агентский инжиниринг и оркестрация многоагентных систем', en: 'Agent engineering and multi-agent orchestration' } },
]
