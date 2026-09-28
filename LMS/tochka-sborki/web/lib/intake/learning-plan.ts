import type { Locale } from './types'
import type { ZoneVM } from '@/lib/rpg/types'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { parseOutcome } from './parse-outcome'
import { WEEK_BUCKETS, WEEK_MAP_ANSWER_KEY, decodeWeekMap, planWeekRoute, type WeekRoute } from './week-map'
import { buildWeekMapContent, weekRouteModuleHref } from './week-map-content'

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
  /** Разложенная «Карта недели» (null/нет — раздела в плане нет). */
  weekRoute?: WeekRoute | null
  /** слаг модуля → название, для маршрута; нет — слаг. */
  moduleTitles?: Record<string, string>
}

/** Раздел плана «личный маршрут» текстом (для копирования) — те же подписи, что у <WeekRouteView>. */
function weekRouteSection(route: WeekRoute, locale: Locale, titles: Record<string, string> | undefined): string[] {
  const c = buildWeekMapContent(locale)
  const lines = [`## 🗺 ${c.routeHeading}`, c.routeLead]
  for (const b of WEEK_BUCKETS) {
    if (route.counts[b] === 0) continue
    lines.push('', `**${c.buckets[b].label}**`)
    for (const it of route.items.filter(i => i.bucket === b)) {
      const title = titles?.[it.moduleSlug] ?? it.moduleSlug
      lines.push(`- ${it.text} — ${c.buckets[b].moduleLead} ${title} (${weekRouteModuleHref(it.moduleSlug, locale)})`)
    }
  }
  if (route.unsortedCount > 0) lines.push('', c.unsortedInPlan(route.unsortedCount))
  return [...lines, '']
}

/**
 * Маршрут «Карты недели» из профиля анкеты (`answers` — JSON-строка или объект, как у parseOutcome).
 * null — карта не заполнена, дел меньше минимума или ни одно не разложено: блока в плане нет.
 */
export function profileWeekRoute(profile: { answers?: unknown } | null | undefined, locale: Locale): WeekRoute | null {
  let answers: Record<string, unknown> | null | undefined
  try {
    const raw = profile?.answers
    answers = typeof raw === 'string' ? JSON.parse(raw) : (raw as Record<string, unknown> | null | undefined)
  } catch {
    return null
  }
  const value = answers?.[WEEK_MAP_ANSWER_KEY]
  const tasks = decodeWeekMap(Array.isArray(value) ? (value as string[]) : undefined)
  return planWeekRoute(tasks, buildWeekMapContent(locale).moduleByKind)
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
    ...(i.weekRoute ? weekRouteSection(i.weekRoute, i.locale, i.moduleTitles) : []),
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

export function profileToLearningPlan(
  profile: any, zones: ZoneVM[], locale: Locale, moduleTitles?: Record<string, string>,
): string {
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
    weekRoute: profileWeekRoute(profile, locale),
    moduleTitles: moduleTitles ?? Object.fromEntries(zones.map(z => [z.slug, z.moduleTitle]).filter(([, t]) => t)),
  })
}
