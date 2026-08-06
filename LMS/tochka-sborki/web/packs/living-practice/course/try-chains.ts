// packs/living-practice/course/try-chains.ts
// Форма эталона (TryVM + резолверы). У курса практики нет агентных цепочек —
// «попробовать до курса» здесь значит просто прочитать первый урок. CHAINS пустой:
// движок рендерит список тёмным, страница остаётся честной прозой без записи и почты.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export type ChainKind = 'work' | 'life'

export interface ChainStep {
  /** Готовая к копированию инструкция агенту. */
  prompt: Bi
  /** Зачем этот шаг — иначе цепочка читается как заклинание. */
  why: Bi
}

export interface TryChain {
  id: string
  icon: string
  kind: ChainKind
  title: Bi
  situation: Bi
  needs: Bi
  minutes: number
  touchesFiles: boolean
  steps: ChainStep[]
  result: Bi
  caution: Bi
}

export interface ResolvedStep { n: number; prompt: string; why: string }

export interface ResolvedChain {
  id: string
  icon: string
  kind: ChainKind
  title: string
  situation: string
  needs: string
  minutes: number
  steps: ResolvedStep[]
  result: string
  caution: string
}

export interface TryVM {
  eyebrow: string
  heading: string
  intro: string[]
  notProgramming: { heading: string; body: string[] }
  chains: ResolvedChain[]
  kindLabels: Record<ChainKind, string>
  honest: { heading: string; intro: string; items: string[] }
  outro: { heading: string; body: string[]; ctaLabel: string; ctaHref: string; noCta: string }
  copyLabel: string
  stepLabel: string
  minutesLabel: (n: number) => string
}

const EYEBROW: Bi = { ru: 'без записи и без почты', en: 'no signup, no email' }

const HEADING: Bi = {
  ru: 'Попробовать — значит прочитать',
  en: 'To try it is to read it',
}

const INTRO: Bi[] = [
  {
    ru: 'У этого курса нет упражнений на вход и нет демо-версии. Он состоит из шести коротких уроков прозы — первый открыт прямо сейчас, целиком, без записи.',
    en: 'This course has no entry exercises and no demo. It consists of six short lessons of prose — the first one is open right now, in full, with no signup.',
  },
  {
    ru: 'Прочитай урок «Слон в комнате». Если текст тебя встретил — остальные пять на месте. Если нет — ты потратил десять минут и ничего не должен.',
    en: 'Read "The elephant in the room". If the text meets you, the other five are right there. If not, you spent ten minutes and owe nothing.',
  },
]

const NOT_PROGRAMMING: { heading: Bi; body: Bi[] } = {
  heading: { ru: 'Почему здесь нечего «пробовать»', en: 'Why there is nothing to "try out"' },
  body: [
    {
      ru: 'Курс не учит технике и не даёт заданий с проверкой. Это карта различий: как отличить практику, которая встречает человека, от практики, которая его изолирует. Карту не пробуют — по ней смотрят.',
      en: 'The course teaches no technique and sets no graded tasks. It is a map of distinctions: how to tell a practice that meets a person from a practice that isolates one. You do not try out a map — you look at it.',
    },
    {
      ru: 'Единственное настоящее «упражнение» курса — собрать свой круг — делается не на сайте, а с живыми людьми, и не раньше, чем ты сам этого захочешь.',
      en: 'The only real "exercise" of the course — assembling your circle — happens not on this site but with living people, and no sooner than you yourself want it.',
    },
  ],
}

const KIND_LABELS: Record<ChainKind, Bi> = {
  work: { ru: 'Рабочая рутина', en: 'Work routine' },
  life: { ru: 'Личное', en: 'Personal' },
}

// Агентных цепочек у курса нет — честно пусто, движок гасит список.
const CHAINS: TryChain[] = []

const HONEST: { heading: Bi; intro: Bi; items: Bi[] } = {
  heading: { ru: 'Что этот курс не сделает', en: 'What this course will not do' },
  intro: {
    ru: 'Честная часть, без которой остальное было бы рекламой.',
    en: 'The honest part, without which the rest would be advertising.',
  },
  items: [
    {
      ru: 'Он не даст состояния. Ни спокойствия, ни ясности, ни «глубины» — курс не производит переживаний и не обещает их. Это чтение о различиях, а не практика; что с различиями делать, решаешь ты.',
      en: 'It will not give you a state. No calm, no clarity, no "depth" — the course produces no experiences and promises none. It is reading about distinctions, not a practice; what to do with the distinctions is up to you.',
    },
    {
      ru: 'Он не заменит ни психотерапию, ни врача. Есть состояния, с которыми правильно идти к специалисту, и никакой текст этого похода не отменяет. Курс повторяет эту границу не раз — и это не формальность.',
      en: 'It will not replace psychotherapy or a doctor. There are states with which the right move is to see a specialist, and no text cancels that visit. The course repeats this boundary more than once — and not as a formality.',
    },
    {
      ru: 'Он не соберёт за тебя круг. Пятый урок даёт правила, но живые люди, календарь и решимость встречаться — твои. Возможно, круг не соберётся ни в этом месяце, ни в этом году; курс от этого не «не сработал».',
      en: 'It will not assemble your circle for you. Lesson five gives the rules, but the living people, the calendar, and the resolve to meet are yours. The circle may not gather this month or this year; that does not mean the course "failed".',
    },
    {
      ru: 'Он не назовёт «правильную школу». Курс даёт вопросы, а не рейтинг: ни одной рекомендации, ни одного списка «проверенных». Решение о том, кому отдать своё время, остаётся целиком твоим.',
      en: 'It will not name "the right school". The course gives questions, not a ranking: no recommendations, no list of "vetted" ones. The decision about who gets your time remains entirely yours.',
    },
  ],
}

const OUTRO: { heading: Bi; body: Bi[]; ctaLabel: Bi; noCta: Bi } = {
  heading: { ru: 'Если текст встретил', en: 'If the text met you' },
  body: [
    {
      ru: 'Значит дальше просто: ещё пять уроков, та же проза, тот же тон. В конце — короткий список вопросов, который можно унести с собой и задать любой школе.',
      en: 'Then the rest is simple: five more lessons, the same prose, the same tone. At the end — a short list of questions you can take with you and put to any school.',
    },
    {
      ru: 'Если не встретил — это тоже ответ, и он честный. Не всякий текст для всякого времени; страница останется открытой.',
      en: 'If it did not — that is an answer too, and an honest one. Not every text is for every season; the page will stay open.',
    },
  ],
  ctaLabel: { ru: 'Посмотреть уроки →', en: 'See the lessons →' },
  noCta: {
    ru: 'Ничего не нужно оставлять: ни почты, ни имени. Страница открыта и будет открыта.',
    en: 'Nothing to leave behind: no email, no name. The page is open and will stay open.',
  },
}

const COPY_LABEL: Bi = { ru: 'Скопировать', en: 'Copy' }
const STEP_LABEL: Bi = { ru: 'Шаг', en: 'Step' }

function pick(b: Bi, l: 'ru' | 'en'): string {
  return b[l]
}

export function resolveChain(chain: TryChain, locale: Locale): ResolvedChain {
  const l: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    id: chain.id,
    icon: chain.icon,
    kind: chain.kind,
    title: pick(chain.title, l),
    situation: pick(chain.situation, l),
    needs: pick(chain.needs, l),
    minutes: chain.minutes,
    steps: chain.steps.map((s, i) => ({ n: i + 1, prompt: pick(s.prompt, l), why: pick(s.why, l) })),
    result: pick(chain.result, l),
    caution: pick(chain.caution, l),
  }
}

export function getTryChains(locale: Locale): TryVM {
  const l: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  const base = locale === 'en' ? '/en' : ''
  return {
    eyebrow: pick(EYEBROW, l),
    heading: pick(HEADING, l),
    intro: INTRO.map((b) => pick(b, l)),
    notProgramming: {
      heading: pick(NOT_PROGRAMMING.heading, l),
      body: NOT_PROGRAMMING.body.map((b) => pick(b, l)),
    },
    chains: CHAINS.map((c) => resolveChain(c, locale)),
    kindLabels: { work: pick(KIND_LABELS.work, l), life: pick(KIND_LABELS.life, l) },
    honest: {
      heading: pick(HONEST.heading, l),
      intro: pick(HONEST.intro, l),
      items: HONEST.items.map((b) => pick(b, l)),
    },
    outro: {
      heading: pick(OUTRO.heading, l),
      body: OUTRO.body.map((b) => pick(b, l)),
      ctaLabel: pick(OUTRO.ctaLabel, l),
      ctaHref: `${base}/syllabus/`,
      noCta: pick(OUTRO.noCta, l),
    },
    copyLabel: pick(COPY_LABEL, l),
    stepLabel: pick(STEP_LABEL, l),
    minutesLabel: (n: number) => (l === 'en' ? `~${n} min` : `~${n} мин`),
  }
}

/** Для тестов и гвардов: сырые цепочки без локали. */
export const ALL_CHAINS: readonly TryChain[] = CHAINS
export const HONEST_ITEMS: readonly Bi[] = HONEST.items
