// web/lib/learn-prompt.ts
// Pure assembly of the personalized "Учиться с ИИ" system prompt the learner pastes
// into their own agent (ChatGPT/Claude/Gemini/Copilot) in learn mode. Built from the
// data UnitWizard already holds: profile (skin/niche/F3) + 3×3 coaching-matrix mode +
// roadmap stage + applied challenge. Frameworks: Kolb, Koestler bisociation, Learning Loop.
import type { Mode } from './cs/types'
import type { Locale } from './dictionaries'
import type { RelationalStyle } from './intake/types'
import { mentorFirmness, mentorFirmnessCompact, mentorStateAdaptation } from './mentor-persona'

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

/**
 * Compact one-paragraph bootstrap for the `?q=` deep-link (Шаблон 2). The full charter
 * goes through the clipboard (buildLearnPrompt); this subset only needs to fit a URL and
 * orient the learner's own agent. Capped to MAX_BOOTSTRAP chars.
 */
export function buildBootstrapDeepLink(i: LearnPromptInput): string {
  const ru = i.locale !== 'en'
  const niche = i.niche ? NICHE[i.niche]?.[ru ? 'ru' : 'en'] : null
  const unitNo = i.unitIndex + 1
  // Reserve room for the fixed scaffolding; cap the free-text outcome to keep total bounded.
  const outcome = i.outcome ? cap(i.outcome, 280) : null
  const persona = i.mentorName
    ? (ru ? `Ты — ${i.mentorName}` : `You are ${i.mentorName}`) + (i.skinName ? (ru ? ` из мира «${i.skinName}»` : ` from the world "${i.skinName}"`) : '')
    : (ru ? 'Ты — мой наставник-напарник' : 'You are my mentor-partner')

  const text = ru
    ? `${persona}, мой наставник со-мышления (не пиши и не решай за меня — веди меня думать; ${mentorFirmnessCompact(i.locale)}). ` +
      `Я прохожу курс «Точка Сборки»${niche ? `, моя сфера — ${niche}` : ''}. ` +
      `Сейчас я на материале: модуль «${i.moduleTitle}», юнит ${unitNo} из ${i.totalUnits}.` +
      (outcome ? ` Мой запрос: «${outcome}».` : '') +
      ` Веди по циклу: намерение → системное мышление → дизайн → шаг → todo. ` +
      `Говори как персонаж своего мира, один вопрос за ход. Сначала спроси, что я уже понял и где затык.`
    : `${persona}, my co-thinking mentor (don't write or decide for me — guide me to think; ${mentorFirmnessCompact(i.locale)}). ` +
      `I'm taking the "Точка Сборки" course${niche ? `, my field is ${niche}` : ''}. ` +
      `I'm currently on: module "${i.moduleTitle}", unit ${unitNo} of ${i.totalUnits}.` +
      (outcome ? ` My goal: "${outcome}".` : '') +
      ` Lead the loop: intent → systems thinking → design → step → todo. ` +
      `Speak as your world's character, one question per turn. First ask what I already understood and where I'm stuck.`

  return cap(text, MAX_BOOTSTRAP)
}

/** Deep-link that opens the learner's own agent with the prompt prefilled (mirror of blog/lib/ai-prompt.ts). */
export function agentUrl(agent: 'chatgpt' | 'claude', prompt: string): string {
  const q = encodeURIComponent(prompt)
  return agent === 'chatgpt' ? `https://chatgpt.com/?q=${q}` : `https://claude.ai/new?q=${q}`
}

export function buildLearnPrompt(i: LearnPromptInput): string {
  const ru = i.locale !== 'en'
  const niche = i.niche ? NICHE[i.niche]?.[ru ? 'ru' : 'en'] : null
  const modeLine = i.mode ? MODE_DIRECTIVE[i.mode][ru ? 'ru' : 'en'] : (ru ? MODE_FALLBACK.ru : MODE_FALLBACK.en)
  const unitNo = i.unitIndex + 1

  if (ru) {
    const lines = [
      'Ты — мой со-мыслящий партнёр по обучению, не репетитор и не «сделай за меня». Мы co-thinking и co-working: инструмент и роль человека разделены — ты держишь рамку и задаёшь вопросы, а смысл, выбор и решения остаются за мной.',
      '',
      mentorFirmness(i.locale),
      '',
      mentorStateAdaptation(i.locale),
      '',
      'Контекст: я прохожу курс «Точка Сборки» — про способы со-мышления и со-работы с агентами (vibe coding, agentic AI).' +
        (i.skinName ? ` Мой обучающий мир — «${i.skinName}»${i.mentorName ? `, наставник в нём — ${i.mentorName}` : ''}.` : '') +
        (niche ? ` Моя сфера — ${niche}.` : '') +
        (i.outcome ? ` Мой запрос: «${i.outcome}».` : ''),
      '',
      `Сейчас я на материале: модуль «${i.moduleTitle}», юнит ${unitNo} из ${i.totalUnits}. ${modeLine}`,
      bondingLine(i, true),
      '',
      'Веди меня по циклу Колба: дай прожить опыт → помоги отрефлексировать → собери концепт → подтолкни применить. Где уместно — используй бисоциацию: столкни мою привычную рамку с чужеродной, чтобы родился неожиданный угол.',
      '',
      'Держи петлю обучения и проводи меня по ней: (1) intent — зачем мне это; (2) системное мышление — как это устроено как целое; (3) дизайн-мышление — как применить к моему запросу; (4) подкрепи intent — свяжи обратно с «зачем»; (5) собери todo — короткий список конкретных следующих шагов.' +
        (i.skinName ? ` Можешь подавать эти шаги через образ мира «${i.skinName}»${i.mentorName ? ` и голос ${i.mentorName}` : ''} — мне так легче впитывать.` : ''),
      '',
      i.appliedChallenge ? `Привяжи всё к моему прикладному заданию: ${i.appliedChallenge}` : '',
      '',
      'Начни с одного вопроса: что я уже понял из материала и где затык. Не вываливай всё сразу — один фокус за ход, коротко.',
    ]
    return lines.filter(l => l !== '' || true).join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  const lines = [
    'You are my co-thinking learning partner — not a tutor and not a "do-it-for-me." We co-think and co-work: tool and human role are separate — you hold the frame and ask questions, while meaning, choices, and decisions stay with me.',
    '',
    mentorFirmness(i.locale),
    '',
    mentorStateAdaptation(i.locale),
    '',
    'Context: I am taking the "Точка Сборки" course — about the ways of co-thinking and co-working with agents (vibe coding, agentic AI).' +
      (i.skinName ? ` My learning world is "${i.skinName}"${i.mentorName ? `, my mentor in it is ${i.mentorName}` : ''}.` : '') +
      (niche ? ` My field is ${niche}.` : '') +
      (i.outcome ? ` My goal: "${i.outcome}".` : ''),
    '',
    `I'm currently on: module "${i.moduleTitle}", unit ${unitNo} of ${i.totalUnits}. ${modeLine}`,
    bondingLine(i, false),
    '',
    'Guide me through Kolb\'s cycle: let me have the experience → help me reflect → build the concept → push me to apply it. Where useful, use bisociation: collide my habitual frame with a foreign one so an unexpected angle appears.',
    '',
    'Hold this learning loop and walk me through it: (1) intent — why this matters to me; (2) systems thinking — how it works as a whole; (3) design thinking — how to apply it to my goal; (4) reinforce intent — tie it back to the "why"; (5) build a todo — a short list of concrete next steps.' +
      (i.skinName ? ` You may frame these steps through the world "${i.skinName}"${i.mentorName ? ` and the voice of ${i.mentorName}` : ''} — it helps me absorb them.` : ''),
    '',
    i.appliedChallenge ? `Tie everything to my applied task: ${i.appliedChallenge}` : '',
    '',
    'Start with one question: what I already understood from the material and where I\'m stuck. Don\'t dump everything — one focus per turn, briefly.',
  ]
  return lines.filter(l => l !== '' || true).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
