// Типы данных страницы «Стартер» (движок). Данные — packs/<pack>/course/starter.ts.

export interface Bi { ru: string; en: string }

export type StarterAgentId = 'claude-code' | 'codex' | 'gemini-cli' | 'antigravity' | 'hermes'

export interface StarterAgent {
  id: StarterAgentId
  name: string
  /** Как открыть папку (шаг 2). */
  open: Bi
  /** Команда запуска в терминале, если агент консольный. */
  command?: string
  /** Какой файл правил агент прочитает при старте — по документации. */
  reads: Bi
  /** Поддержан ли hook начала сессии в стартере и что для этого нужно. */
  hook: Bi
  sources: { label: string; href: string }[]
}

export interface StarterFile { path: string; what: Bi; lesson?: string }

export interface StarterData {
  /** Путь архива в public/ по локалям — обязан совпадать с starter.json и его editions (гвард в тесте). */
  archive: Bi
  /** Корневая папка внутри архива. */
  folder: string
  eyebrow: Bi
  heading: Bi
  intro: Bi[]
  steps: { title: Bi; body: Bi }[]
  gitInit: string
  firstPrompt: Bi
  agents: StarterAgent[]
  files: StarterFile[]
  honest: { heading: Bi; items: Bi[] }
  /** Уроки, к которым стартер привязан: путь без локали, `/lessons/<модуль>/<юнит>/`. */
  related: { href: string; label: Bi }[]
}
