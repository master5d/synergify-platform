// packs/retreat/course/try-chains.ts
// Форма эталона (TryVM + резолверы). У курса нет агентных цепочек — «попробовать до курса»
// значит открыть первый урок и калькулятор. CHAINS пустой: движок рендерит список тёмным,
// страница остаётся честной прозой без записи и почты.
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
  ru: 'Попробовать — значит посчитать',
  en: 'To try it is to run the numbers',
}

const INTRO: Bi[] = [
  {
    ru: 'Курс открыт целиком и без записи: шесть модулей, общее ядро и два пути — ведущего и площадки.',
    en: 'The whole course is open with no signup: six modules, a shared core and two paths — the leader and the venue.',
  },
  {
    ru: 'Открой урок «Одна сделка в калькуляторе». Если за десять минут сделка стала понятнее — остальное на месте. Если нет — ты ничего не должен.',
    en: 'Open the lesson "One deal in the calculator". If the deal is clearer after ten minutes, the rest is right there. If not, you owe nothing.',
  },
]

const NOT_PROGRAMMING: { heading: Bi; body: Bi[] } = {
  heading: { ru: 'Что здесь пробуют', en: 'What you try here' },
  body: [
    {
      ru: 'Курс не продаёт ретриты и не учит продавать. Он разбирает одну сделку с двух сторон: кто платит, когда платит и кто несёт пустое место.',
      en: 'The course does not sell retreats and does not teach selling. It works through one deal from two sides: who pays, when they pay, and who carries an empty place.',
    },
    {
      ru: 'Практика курса — цифры и даты: калькулятор ретрита академии и шаблоны. Их можно открыть до первого урока.',
      en: 'The practice of the course is numbers and dates: the academy retreat calculator and templates. You can open them before the first lesson.',
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
      ru: 'Он не обещает дохода и полной группы. Курс показывает, где сделка теряет деньги; сколько гостей придёт, решает не он.',
      en: 'It does not promise income or a full group. The course shows where a deal loses money; how many guests come is not its call.',
    },
    {
      ru: 'Он не заменит юриста. Нормы об отменах и пакетных турах даны с источником и датой, но для своей страны их проверяют у специалиста.',
      en: 'It will not replace a lawyer. The rules on cancellations and package travel come with a source and a date, but for your country you check them with a specialist.',
    },
    {
      ru: 'Он не назовёт площадку или ведущего. Курс даёт вопросы и расчёт, а не рейтинг: ни одной рекомендации, ни одного списка «проверенных».',
      en: 'It will not name a venue or a leader. The course gives questions and arithmetic, not a ranking: no recommendations, no list of "vetted" ones.',
    },
    {
      ru: 'Он не оценит здоровье гостей. Противопоказания практик названы в карточках, а решение остаётся за гостем и его врачом.',
      en: "It will not assess guests' health. The contraindications of practices are named on the cards, and the decision stays with the guest and their doctor.",
    },
  ],
}

const OUTRO: { heading: Bi; body: Bi[]; ctaLabel: Bi; noCta: Bi } = {
  heading: { ru: 'Если сделка стала понятнее', en: 'If the deal got clearer' },
  body: [
    {
      ru: 'Значит дальше просто: ядро из двух модулей, потом твой путь — ведущего или площадки. В конце — список вопросов к договору, который можно унести с собой.',
      en: 'Then the rest is simple: a core of two modules, then your path — the leader or the venue. At the end, a list of questions for the contract that you can take with you.',
    },
    {
      ru: 'Если нет — это тоже ответ, и он честный. Страница останется открытой.',
      en: 'If not — that is an answer too, and an honest one. The page will stay open.',
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
