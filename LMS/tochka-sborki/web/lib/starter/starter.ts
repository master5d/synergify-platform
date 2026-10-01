// Резолвер страницы «Стартер» (/starter): данные pack'а → строки одной локали.
// Данные — packs/<pack>/course/starter.ts (через стаб lib/course/starter.ts); у pack'а без
// стартера STARTER = null, и страница честно говорит, что стартера нет.
import type { Locale } from '@/lib/intake/types'
import type { StarterAgentId } from './types'
import { STARTER } from '@/lib/course/starter'

export interface ResolvedStarterAgent {
  id: StarterAgentId
  name: string
  command?: string
  open: string
  reads: string
  hook: string
  sources: { label: string; href: string }[]
}

export interface StarterVM {
  archive: string
  folder: string
  eyebrow: string
  heading: string
  intro: string[]
  steps: { n: number; title: string; body: string }[]
  gitInit: string
  firstPrompt: string
  agents: ResolvedStarterAgent[]
  files: { path: string; what: string; lesson?: string }[]
  honest: { heading: string; items: string[] }
  related: { href: string; label: string }[]
  labels: {
    download: string
    steps: string
    agentsHeading: string
    reads: string
    hook: string
    sources: string
    run: string
    filesHeading: string
    relatedHeading: string
    copy: string
    copied: string
    lesson: string
  }
}

const LABELS = {
  download: { ru: 'Скачать стартер (.zip)', en: 'Download the starter (.zip)' },
  steps: { ru: 'Три шага', en: 'Three steps' },
  agentsHeading: { ru: 'Что прочитает твой агент при старте', en: 'What your agent reads at start' },
  reads: { ru: 'Файл правил', en: 'Rules file' },
  hook: { ru: 'Hook начала сессии', en: 'Session-start hook' },
  sources: { ru: 'Источник', en: 'Source' },
  run: { ru: 'Запуск', en: 'Start' },
  filesHeading: { ru: 'Что внутри', en: 'What’s inside' },
  relatedHeading: { ru: 'Где это в курсе', en: 'Where this is in the course' },
  copy: { ru: 'Скопировать', en: 'Copy' },
  copied: { ru: 'Скопировано', en: 'Copied' },
  lesson: { ru: 'урок', en: 'lesson' },
} as const

/** Путь урока в нужной локали: RU — как есть, EN — с префиксом /en. */
export function localizeLesson(href: string, locale: Locale): string {
  return locale === 'en' ? `/en${href}` : href
}

export function getStarter(locale: Locale): StarterVM | null {
  if (!STARTER) return null
  const s = STARTER
  const labels = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [k, v[locale]])) as StarterVM['labels']
  return {
    archive: s.archive[locale],
    folder: s.folder,
    eyebrow: s.eyebrow[locale],
    heading: s.heading[locale],
    intro: s.intro.map((p) => p[locale]),
    steps: s.steps.map((st, i) => ({ n: i + 1, title: st.title[locale], body: st.body[locale] })),
    gitInit: s.gitInit,
    firstPrompt: s.firstPrompt[locale],
    agents: s.agents.map((a) => ({
      id: a.id,
      name: a.name,
      command: a.command,
      open: a.open[locale],
      reads: a.reads[locale],
      hook: a.hook[locale],
      sources: a.sources,
    })),
    files: s.files.map((f) => ({ path: f.path, what: f.what[locale], lesson: f.lesson ? localizeLesson(f.lesson, locale) : undefined })),
    honest: { heading: s.honest.heading[locale], items: s.honest.items.map((i) => i[locale]) },
    related: s.related.map((r) => ({ href: localizeLesson(r.href, locale), label: r.label[locale] })),
    labels,
  }
}
