import type { Locale } from './types'
import type { ZoneVM } from '@/lib/rpg/types'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { parseOutcome } from './parse-outcome'

export interface PlanStep { name: string; transform?: { from: string; to: string } }

export interface LearningPlanInput {
  locale: Locale
  outcome: string | null
  niche: string | null
  level: number
  completedCount: number
  total: number
  steps: PlanStep[]
  experiential: string[]
  accountability: string[]
}

export function buildLearningPlan(i: LearningPlanInput): string {
  const ru = i.locale !== 'en'
  const t = ru ? {
    title: 'Личный план обучения',
    goal: '🎯 Цель', outcomeFallback: '— (впиши свой результат)', deadline: 'Дедлайн: ___ (поставь свой)',
    status: '📍 Где я сейчас', field: 'Сфера', level: 'уровень', doneA: 'пройдено', doneB: 'из', doneC: 'модулей',
    steps: '📚 Шаги обучения (следующие)', from: 'из', to: 'в', allDone: 'Все модули пройдены — выбери, что углубить.',
    exp: '🛠 Шаги через опыт', help: '🤝 Кто может помочь',
    review: '🔁 Ревью',
    reviewBody: 'После каждого модуля вернись к этому плану и обнови. Раз в неделю спроси себя: что сдвинулось, что застряло, какой следующий шаг.',
    closing: 'Этот план — твой. Скопируй его, держи под рукой, переписывай по мере роста.',
  } : {
    title: 'Personal Learning Plan',
    goal: '🎯 Goal', outcomeFallback: '— (write your own outcome)', deadline: 'Deadline: ___ (set your own)',
    status: '📍 Where I am now', field: 'Field', level: 'level', doneA: '', doneB: 'of', doneC: 'modules done',
    steps: '📚 Learning steps (next)', from: 'from', to: 'to', allDone: 'All modules done — pick what to deepen.',
    exp: '🛠 Experiential steps', help: '🤝 Who can help',
    review: '🔁 Review',
    reviewBody: 'After each module, return to this plan and update it. Once a week, ask yourself: what moved, what is stuck, what is the next step.',
    closing: 'This plan is yours. Copy it, keep it close, rewrite it as you grow.',
  }

  const statusLine = ru
    ? `${t.field}: ${i.niche ?? '—'} · ${t.level} ${i.level} · ${t.doneA} ${i.completedCount} ${t.doneB} ${i.total} ${t.doneC}`
    : `${t.field}: ${i.niche ?? '—'} · ${t.level} ${i.level} · ${i.completedCount} ${t.doneB} ${i.total} ${t.doneC}`

  const stepsBlock = i.steps.length
    ? i.steps.map(s => `- ${s.name}${s.transform ? `: ${t.from} ${s.transform.from} → ${t.to} ${s.transform.to}` : ''}`).join('\n')
    : t.allDone

  return [
    `# ${t.title}`,
    ``,
    `## ${t.goal}`,
    i.outcome ?? t.outcomeFallback,
    t.deadline,
    ``,
    `## ${t.status}`,
    statusLine,
    ``,
    `## ${t.steps}`,
    stepsBlock,
    ``,
    `## ${t.exp}`,
    i.experiential.map(e => `- ${e}`).join('\n'),
    ``,
    `## ${t.help}`,
    i.accountability.map(a => `- ${a}`).join('\n'),
    ``,
    `## ${t.review}`,
    t.reviewBody,
    ``,
    `> ${t.closing}`,
  ].join('\n')
}

export function profileToLearningPlan(profile: any, zones: ZoneVM[], locale: Locale): string {
  const ru = locale !== 'en'
  const completedCount = zones.filter(z => z.status === 'completed').length
  const curIdx = zones.findIndex(z => z.status === 'current')
  const picked = curIdx >= 0 ? zones.slice(curIdx, curIdx + 3) : []
  const steps: PlanStep[] = picked.map(z => ({ name: z.zoneName, transform: z.transform }))

  const meta = SKINS_META[profile?.world_skin as keyof typeof SKINS_META]
  const companion = meta?.mentor?.name?.[locale] ?? (ru ? 'твой со-мыслящий напарник' : 'your co-thinking partner')

  const experiential = ru ? [
    'Упражнения 1–8 — закрепи навыки (/exercises)',
    'Опц. трек: упакуй свою экспертизу в продукт',
    'Опц. трек: задокументируй и автоматизируй свою практику',
  ] : [
    'Exercises 1–8 — consolidate the skills (/exercises)',
    'Optional track: package your expertise into a product',
    'Optional track: document and automate your practice',
  ]

  const accountability = ru ? [
    `${companion} — ИИ-напарник для со-мышления (устав на этой странице)`,
    'Спроси автора: команда /ask в боте',
    'Найди одного человека, кому покажешь прогресс',
  ] : [
    `${companion} — an AI partner for co-thinking (charter on this page)`,
    'Ask the author: the /ask command in the bot',
    'Find one person to show your progress to',
  ]

  return buildLearningPlan({
    locale,
    outcome: parseOutcome(profile),
    niche: profile?.niche ?? null,
    level: profile?.char_level ?? 1,
    completedCount,
    total: zones.length,
    steps,
    experiential,
    accountability,
  })
}
