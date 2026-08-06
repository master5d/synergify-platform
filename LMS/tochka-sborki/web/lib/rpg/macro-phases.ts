import type { ModuleSlug } from './modules'
import type { Bi, Locale } from './types'

export interface MacroPhase {
  key: string          // stable id
  index: number        // 1-based position
  name: Bi
  frustration: Bi      // the pain that opens the phase
  desire: Bi           // the outcome that closes it
  slugs: ModuleSlug[]
}

export const MACRO_PHASES: MacroPhase[] = [
  {
    key: 'orient', index: 1,
    name:        { ru: 'Ориентация',  en: 'Orientation' },
    frustration: { ru: 'теряюсь в мире ИИ, не знаю с чего начать', en: "lost in the world of AI, I don't know where to start" },
    desire:      { ru: 'сориентирован, среда готова, стек выбран',  en: 'oriented, environment ready, stack chosen' },
    slugs: ['00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection'],
  },
  {
    key: 'craft', index: 2,
    name:        { ru: 'Ремесло', en: 'Craft' },
    frustration: { ru: 'прошу — получаю не то, агент забывает, всё вручную', en: 'I ask and get the wrong thing, the agent forgets, everything is manual' },
    desire:      { ru: 'бегло сотрудничаю: формулирую, держу контекст, строю pipeline', en: 'I collaborate fluently: I phrase, hold context, build pipelines' },
    slugs: ['04-prompt-engineering', '05-context-memory', '06-audio-pipeline'],
  },
  {
    key: 'orchestrate', index: 3,
    name:        { ru: 'Оркестрация', en: 'Orchestration' },
    frustration: { ru: 'делаю всё в одиночку, агент в вакууме', en: 'I do it all alone, the agent works in a vacuum' },
    desire:      { ru: 'оркеструю агентов и инструменты под задачу', en: 'I orchestrate agents and tools for the task' },
    slugs: ['07-tools', '08-agent-engineering'],
  },
]

export function phaseForSlug(slug: string): MacroPhase | null {
  return MACRO_PHASES.find(p => (p.slugs as string[]).includes(slug)) ?? null
}

export interface ArcPhaseVM {
  key: string
  index: number
  name: string
  frustration: string
  desire: string
  isCurrent: boolean
}
export interface TransformationArcVM { phases: ArcPhaseVM[] }

export function buildTransformationArc(currentSlug: string | null, locale: Locale): TransformationArcVM {
  const cur = currentSlug ? phaseForSlug(currentSlug) : null
  return {
    phases: MACRO_PHASES.map(p => ({
      key: p.key,
      index: p.index,
      name: p.name[locale],
      frustration: p.frustration[locale],
      desire: p.desire[locale],
      isCurrent: cur?.key === p.key,
    })),
  }
}
