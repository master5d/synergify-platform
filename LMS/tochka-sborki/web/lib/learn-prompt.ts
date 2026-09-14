// web/lib/learn-prompt.ts
// Pure assembly of the personalized "Учиться с ИИ" system prompt the learner pastes
// into their own agent (ChatGPT/Claude/Gemini/Copilot) in learn mode. The ENGINE only
// assembles; who the companion is, which course it speaks for, its method and its
// boundaries come from the active course-pack (lib/course/companion → @pack), so a
// course never hands its learners another course's companion (intake LMS#16).
// Profile slots (skin/niche/F3/mode/MBTI/applied challenge) are used only when the
// pack opts in (COMPANION.usesProfile).
import type { Mode } from './cs/types'
import type { Locale } from './dictionaries'
import type { RelationalStyle } from './intake/types'
import { mentorFirmness, mentorFirmnessCompact, mentorStateAdaptation } from './mentor-persona'
import { COMPANION } from './course/companion'

export interface LearnPromptInput {
  locale: Locale
  moduleTitle: string
  unitIndex: number          // 0-based
  totalUnits: number
  skinName?: string | null   // SKINS_META[skin].displayName[locale]
  mentorName?: string | null // SKINS_META[skin].mentor.name[locale]
  niche?: string | null      // F2 enum
  outcome?: string | null    // F3 free text
  mode?: Mode | null
  appliedChallenge?: string | null
  mbti?: string | null
  relational?: RelationalStyle | null
}

const NICHE: Record<string, { ru: string; en: string }> = {
  coach: { ru: 'коучинг и психотерапия', en: 'coaching and therapy' },
  massage: { ru: 'телесные практики', en: 'bodywork' },
  astrology: { ru: 'астрология и духовные практики', en: 'astrology and spiritual practice' },
  content: { ru: 'контент и блогинг', en: 'content and influencing' },
  ecommerce: { ru: 'электронная торговля', en: 'e-commerce' },
  service: { ru: 'сервисный бизнес', en: 'a service business' },
  tech: { ru: 'технологии', en: 'tech' },
}

const MODE_DIRECTIVE: Record<Mode, { ru: string; en: string }> = {
  commander: {
    ru: 'Дай максимум опор: чёткие шаги, примеры и подсказки — это базовый темп.',
    en: 'Give maximum scaffolding: clear steps, examples, and hints — baseline pace.',
  },
  copilot: {
    ru: 'Средние опоры: подсказывай процесс, но задачу веду я.',
    en: 'Medium scaffolding: coach the process, but I drive the task.',
  },
  archmage: {
    ru: 'Минимум опор: дай только цель и наводящие вопросы — веду я.',
    en: 'Minimal scaffolding: give only the goal and probing questions — I lead.',
  },
}

const MODE_FALLBACK = {
  ru: 'Подстройся под мой уровень: начни с опор и убирай их по мере того, как я схватываю.',
  en: 'Match my level: start with scaffolding and fade it as I get it.',
}

function bondingLine(i: LearnPromptInput, ru: boolean): string {
  if (!i.mbti && !i.relational) return ''
  const r = i.relational
  const errMap = {
    ru: { soft_feedback: 'правь мягко', lose_motivation: 'береги мотивацию, хвали за попытку', calm: 'правь прямо, без смягчения', fix_immediately: 'давай сразу точную правку' },
    en: { soft_feedback: 'correct gently', lose_motivation: 'protect motivation, praise the attempt', calm: 'correct directly', fix_immediately: 'give the exact fix immediately' },
  }
  const attnMap = {
    ru: { short: 'короткими ходами по 3–5 минут', mid: 'блоками по 10–15 минут', long: 'можно длинными заходами' },
    en: { short: 'in short 3–5 minute turns', mid: 'in 10–15 minute blocks', long: 'longer stretches are fine' },
  }
  const parts: string[] = []
  if (i.mbti) parts.push(ru ? `мой психотип — ${i.mbti} (учитывай его в тоне и подаче)` : `my MBTI is ${i.mbti} (factor it into tone and delivery)`)
  if (r?.errorStyle) parts.push((ru ? errMap.ru : errMap.en)[r.errorStyle])
  if (r?.attention) parts.push((ru ? attnMap.ru : attnMap.en)[r.attention])
  if (!parts.length) return ''
  return (ru ? 'Под привязку: ' : 'For bonding: ') + parts.join('; ') + '.'
}

/** Hard cap for the bootstrap so it survives agent URL-length limits (before encodeURIComponent). */
export const MAX_BOOTSTRAP = 1500

function cap(s: string, max: number): string {
  const clean = s.trim().replace(/\s+/g, ' ')
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

/** Profile slots, or nothing when the active course does not use the questionnaire profile. */
function profileOf(i: LearnPromptInput) {
  if (!COMPANION.usesProfile) {
    return { skinName: null, mentorName: null, niche: null, outcome: null, mode: null, appliedChallenge: null, bonding: false }
  }
  return {
    skinName: i.skinName ?? null,
    mentorName: i.mentorName ?? null,
    niche: i.niche ?? null,
    outcome: i.outcome ?? null,
    mode: i.mode ?? null,
    appliedChallenge: i.appliedChallenge ?? null,
    bonding: true,
  }
}

/**
 * Compact one-paragraph bootstrap for the `?q=` deep-link (Шаблон 2). The full charter
 * goes through the clipboard (buildLearnPrompt); this subset only needs to fit a URL and
 * orient the learner's own agent. Capped to MAX_BOOTSTRAP chars.
 */
export function buildBootstrapDeepLink(i: LearnPromptInput): string {
  const ru = i.locale !== 'en'
  const L = ru ? 'ru' : 'en'
  const B = COMPANION.bootstrap
  const p = profileOf(i)
  const niche = p.niche ? NICHE[p.niche]?.[L] : null
  const unitNo = i.unitIndex + 1
  // Reserve room for the fixed scaffolding; cap the free-text outcome to keep total bounded.
  const outcome = p.outcome ? cap(p.outcome, 280) : null
  const persona = p.mentorName
    ? (ru ? `Ты — ${p.mentorName}` : `You are ${p.mentorName}`) + (p.skinName ? (ru ? ` из мира «${p.skinName}»` : ` from the world "${p.skinName}"`) : '')
    : B.personaDefault[L]
  const role = B.role[L].replace('{firm}', mentorFirmnessCompact(i.locale))

  const text = ru
    ? `${persona}${role} ` +
      `${B.course.ru}${niche ? `, моя сфера — ${niche}` : ''}. ` +
      `Сейчас я на материале: модуль «${i.moduleTitle}», юнит ${unitNo} из ${i.totalUnits}.` +
      (outcome ? ` Мой запрос: «${outcome}».` : '') +
      B.loop.ru +
      B.opener.ru
    : `${persona}${role} ` +
      `${B.course.en}${niche ? `, my field is ${niche}` : ''}. ` +
      `I'm currently on: module "${i.moduleTitle}", unit ${unitNo} of ${i.totalUnits}.` +
      (outcome ? ` My goal: "${outcome}".` : '') +
      B.loop.en +
      B.opener.en

  return cap(text, MAX_BOOTSTRAP)
}

/** Deep-link that opens the learner's own agent with the prompt prefilled (mirror of blog/lib/ai-prompt.ts). */
export function agentUrl(agent: 'chatgpt' | 'claude', prompt: string): string {
  const q = encodeURIComponent(prompt)
  return agent === 'chatgpt' ? `https://chatgpt.com/?q=${q}` : `https://claude.ai/new?q=${q}`
}

export function buildLearnPrompt(i: LearnPromptInput): string {
  const ru = i.locale !== 'en'
  const L = ru ? 'ru' : 'en'
  const C = COMPANION
  const p = profileOf(i)
  const niche = p.niche ? NICHE[p.niche]?.[L] : null
  const modeLine = C.usesProfile ? (p.mode ? MODE_DIRECTIVE[p.mode][L] : MODE_FALLBACK[L]) : ''
  const unitNo = i.unitIndex + 1

  const persona = C.mentorPersona ? [mentorFirmness(i.locale), '', mentorStateAdaptation(i.locale), ''] : []

  const context = ru
    ? C.context.ru +
      (p.skinName ? ` Мой обучающий мир — «${p.skinName}»${p.mentorName ? `, наставник в нём — ${p.mentorName}` : ''}.` : '') +
      (niche ? ` Моя сфера — ${niche}.` : '') +
      (p.outcome ? ` Мой запрос: «${p.outcome}».` : '')
    : C.context.en +
      (p.skinName ? ` My learning world is "${p.skinName}"${p.mentorName ? `, my mentor in it is ${p.mentorName}` : ''}.` : '') +
      (niche ? ` My field is ${niche}.` : '') +
      (p.outcome ? ` My goal: "${p.outcome}".` : '')

  const unitLine = (ru
    ? `Сейчас я на материале: модуль «${i.moduleTitle}», юнит ${unitNo} из ${i.totalUnits}.`
    : `I'm currently on: module "${i.moduleTitle}", unit ${unitNo} of ${i.totalUnits}.`) + (modeLine ? ` ${modeLine}` : '')

  const worldVoice = p.skinName
    ? (ru
      ? ` Можешь подавать эти шаги через образ мира «${p.skinName}»${p.mentorName ? ` и голос ${p.mentorName}` : ''} — мне так легче впитывать.`
      : ` You may frame these steps through the world "${p.skinName}"${p.mentorName ? ` and the voice of ${p.mentorName}` : ''} — it helps me absorb them.`)
    : ''

  const method = C.method.flatMap((m, idx) => [m[L] + (idx === C.method.length - 1 ? worldVoice : ''), ''])
  const guardrails = C.guardrails.length ? [C.guardrailsHeading[L], ...C.guardrails.map((g) => `- ${g[L]}`), ''] : []
  const applied = p.appliedChallenge
    ? (ru ? `Привяжи всё к моему прикладному заданию: ${p.appliedChallenge}` : `Tie everything to my applied task: ${p.appliedChallenge}`)
    : ''

  const lines = [
    C.identity[L],
    '',
    ...persona,
    context,
    '',
    unitLine,
    p.bonding ? bondingLine(i, ru) : '',
    '',
    ...method,
    ...guardrails,
    applied,
    '',
    C.opener[L],
  ]
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
