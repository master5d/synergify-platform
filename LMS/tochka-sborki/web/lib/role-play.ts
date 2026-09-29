// web/lib/role-play.ts
// Role Play как вид практики (intake LMS#18, Coursera Role Play; решение владельца 2026-09-28).
// Ученик тренируется на AI-персонаже по сценарию автора — промптом в СВОЁМ агенте (ChatGPT/Claude/…),
// как компаньон «Учиться с ИИ»: наш LLM во время обучения не вызывается.
//
// Сценарии — данные pack'а (packs/<pack>/course/role-plays.ts): кто персонаж, ситуация, цель ученика,
// 3–5 критериев успеха, стоп-правила автора. Правила сцены (персонаж не выходит из роли, не решает за
// ученика, разбор по критериям в конце) — движка: они про форму тренировки, а не про предмет курса,
// и ложатся на любой сценарий. Персонализация — вариант сценария под роль ученика из анкеты (V_ROLE:
// криэйтор / предприниматель); нет профиля — общий вариант.
//
// Относительные импорты: pack-файл берёт отсюда типы относительно (как interest-examples).
import { MAX_BOOTSTRAP, agentUrl } from './learn-prompt'
import { ROLE_ANSWER_KEY, isTaskRole, type TaskRole } from './intake/task-route'

export type RolePlayLocale = 'ru' | 'en'
type L = Record<RolePlayLocale, string>

/** Что меняется под роль ученика. Критерии и цель — общие: их задаёт автор один раз. */
export interface RolePlayVariant {
  /** Короткое имя персонажа для заголовка блока: «Заказчик», «Редактор». */
  persona: L
  /** Кто персонаж и как держится. */
  character: L
  /** Ситуация сцены. */
  context: L
  /** Первая реплика персонажа — ею агент открывает сцену. */
  opener: L
}

export interface RolePlayScenario extends RolePlayVariant {
  module: string
  unit: string
  id: string
  /** Чего ученик добивается в сцене. */
  goal: L
  /** Критерии успеха автора — по ним агент делает разбор в конце. 3–5 штук. */
  criteria: L[]
  /** Стоп-правила автора сверх правил движка: чего персонажу нельзя в этой сцене. */
  rules: L[]
  /** Варианты под роль ученика из анкеты; нет варианта — общий. */
  byRole?: Partial<Record<TaskRole, RolePlayVariant>>
}

export const MIN_CRITERIA = 3
export const MAX_CRITERIA = 5

/**
 * Правила сцены — движка. Гвард проверяет, что каждый собранный промпт их несёт
 * (персонаж не выходит из роли, не решает за ученика, разбор по критериям).
 */
export const SCENE_RULES = {
  heading: { ru: 'Правила сцены:', en: 'Scene rules:' },
  rules: [
    {
      ru: 'Оставайся в роли до конца сцены: не выходи из неё, не комментируй со стороны и не подсказывай мне как ИИ-ассистент.',
      en: 'Stay in character until the scene ends: do not step out of it, do not comment from the side, and do not coach me as an AI assistant.',
    },
    {
      ru: 'Не решай за меня и не пиши мои реплики: цель сцены — моя, персонаж только реагирует так, как отреагировал бы живой человек в этой ситуации.',
      en: 'Do not solve it for me and do not write my lines: the goal is mine; the character only reacts the way a real person in this situation would.',
    },
    {
      ru: 'Одна короткая реплика за ход (2–4 предложения), как в живом разговоре. Потом жди моего ответа.',
      en: 'One short line per turn (2–4 sentences), as in a live conversation. Then wait for my reply.',
    },
    {
      ru: 'Будь реалистичным: не соглашайся слишком легко и не усложняй искусственно. Если я сделал то, что нужно, — персонаж это замечает.',
      en: 'Be realistic: do not agree too easily and do not make it artificially hard. If I do the right thing, the character notices.',
    },
    {
      ru: 'Если я напишу «стоп» или сцена мне неприятна — сразу выйди из роли.',
      en: 'If I write "stop" or the scene feels uncomfortable to me, step out of character right away.',
    },
  ],
  end: {
    ru: 'Сцена заканчивается, когда я напишу «стоп», когда цель достигнута или примерно через 12 ходов. Тогда выйди из роли и сделай разбор по критериям автора курса:',
    en: 'The scene ends when I write "stop", when the goal is reached, or after about 12 turns. Then step out of character and debrief me against the course author\'s criteria:',
  },
  debrief: {
    ru: 'По каждому критерию: выполнено / частично / нет — и короткая цитата из нашего диалога как доказательство. Потом одно, что попробовать в следующий раз. Без баллов и без оценки меня как человека: разбираем ход разговора.',
    en: 'For each criterion: met / partly / not yet — with a short quote from our dialogue as evidence. Then one thing to try next time. No scores and no judgment of me as a person: we review the conversation.',
  },
  /** Компактная версия для `?q=` — те же правила одной фразой. */
  compact: {
    ru: 'Правила: держи роль до конца сцены, не подсказывай как ассистент, не решай за меня и не пиши мои реплики; одна короткая реплика за ход. На «стоп» или когда цель достигнута — выйди из роли и сделай разбор по критериям: выполнено / частично / нет с цитатой из диалога, плюс одно, что попробовать дальше; без баллов и без оценки меня как человека.',
    en: 'Rules: stay in character to the end, do not coach me as an assistant, do not solve it for me or write my lines; one short line per turn. On "stop" or once the goal is reached, step out and debrief against the criteria: met / partly / not yet with a quote from the dialogue, plus one thing to try next; no scores, no judgment of me as a person.',
  },
} as const

const T = {
  ru: {
    intro: 'Давай сыграем тренировочную сцену (Role Play) из курса. Ты играешь персонажа, я — себя.',
    character: 'Персонаж',
    context: 'Ситуация',
    goal: 'Моя цель в сцене',
    authorRules: 'В этой сцене персонажу также нельзя:',
    start: 'Начни сцену первой репликой персонажа:',
    startShort: 'Начни сцену первой репликой персонажа.',
    criteria: 'Критерии разбора',
  },
  en: {
    intro: 'Let\'s play a practice scene (Role Play) from my course. You play the character; I play myself.',
    character: 'Character',
    context: 'Situation',
    goal: 'My goal in the scene',
    authorRules: 'In this scene the character also must not:',
    start: 'Open the scene with the character\'s first line:',
    startShort: 'Open the scene with the character\'s first line.',
    criteria: 'Debrief criteria',
  },
} as const

function quote(x: string, locale: RolePlayLocale): string {
  return locale === 'en' ? `"${x}"` : `«${x}»`
}

/** Вариант сценария под роль ученика; роль неизвестна или варианта нет — общий. */
export function variantFor(s: RolePlayScenario, role?: TaskRole | null): RolePlayVariant {
  const v = role ? s.byRole?.[role] : undefined
  return v ?? { persona: s.persona, character: s.character, context: s.context, opener: s.opener }
}

/** Полный промпт сцены — идёт в буфер обмена. */
export function buildRolePlayPrompt(s: RolePlayScenario, locale: RolePlayLocale, role?: TaskRole | null): string {
  const t = T[locale]
  const v = variantFor(s, role)
  const lines = [
    t.intro,
    '',
    `${t.character}: ${v.character[locale]}`,
    '',
    `${t.context}: ${v.context[locale]}`,
    '',
    `${t.goal}: ${s.goal[locale]}`,
    '',
    SCENE_RULES.heading[locale],
    ...SCENE_RULES.rules.map(r => `- ${r[locale]}`),
    ...(s.rules.length ? ['', t.authorRules, ...s.rules.map(r => `- ${r[locale]}`)] : []),
    '',
    SCENE_RULES.end[locale],
    ...s.criteria.map((c, i) => `${i + 1}. ${c[locale]}`),
    SCENE_RULES.debrief[locale],
    '',
    `${t.start} ${quote(v.opener[locale], locale)}`,
  ]
  return lines.join('\n').trim()
}

/**
 * Компактный bootstrap для `?q=` ChatGPT/Claude (тот же лимит MAX_BOOTSTRAP, что у компаньона).
 * Ничего не режется молча: гвард требует, чтобы каждый сценарий укладывался целиком, с критериями.
 */
export function buildRolePlayBootstrap(s: RolePlayScenario, locale: RolePlayLocale, role?: TaskRole | null): string {
  const t = T[locale]
  const v = variantFor(s, role)
  const parts = [
    t.intro,
    `${t.character}: ${v.character[locale]}`,
    `${t.context}: ${v.context[locale]}`,
    `${t.goal}: ${s.goal[locale]}`,
    SCENE_RULES.compact[locale],
    ...s.rules.map(r => r[locale]),
    `${t.criteria}: ${s.criteria.map((c, i) => `${i + 1}) ${c[locale]}`).join(' ')}`,
    // Первую реплику prefill не несёт (лимит URL): агент открывает сцену сам, в образе персонажа.
    t.startShort,
  ]
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/** Prefill-ссылка агента ученика; bootstrap длиннее лимита — ссылка без `?q=` (копирование всё равно работает). */
export function rolePlayAgentUrl(agent: 'chatgpt' | 'claude', bootstrap: string): string {
  if (bootstrap.length > MAX_BOOTSTRAP) return agent === 'chatgpt' ? 'https://chatgpt.com/' : 'https://claude.ai/new'
  return agentUrl(agent, bootstrap)
}

export function findRolePlay(list: readonly RolePlayScenario[], module: string, unit: string, id: string): RolePlayScenario | null {
  return list.find(s => s.module === module && s.unit === unit && s.id === id) ?? null
}

/** Роль ученика из профиля анкеты (/api/intake/me), как плашка шага русла; нет/битый профиль — null. */
export function profileTaskRole(profile: { answers?: unknown } | null | undefined): TaskRole | null {
  try {
    const raw = profile?.answers
    const a = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown> | null | undefined
    const r = a?.[ROLE_ANSWER_KEY]
    return isTaskRole(r) ? r : null
  } catch {
    return null
  }
}

/** Все тексты сценария (для гварда тона). */
export function scenarioTexts(s: RolePlayScenario, locale: RolePlayLocale): string[] {
  const variants = [variantFor(s), ...Object.values(s.byRole ?? {}).filter((v): v is RolePlayVariant => !!v)]
  return [
    s.goal[locale],
    ...s.criteria.map(c => c[locale]),
    ...s.rules.map(r => r[locale]),
    ...variants.flatMap(v => [v.persona[locale], v.character[locale], v.context[locale], v.opener[locale]]),
  ]
}
