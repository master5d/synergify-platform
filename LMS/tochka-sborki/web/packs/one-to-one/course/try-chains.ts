// packs/one-to-one/course/try-chains.ts
// Форма эталона (TryVM + резолверы). У курса нет агентных цепочек — «попробовать до курса»
// значит открыть первый урок и расчёт. CHAINS пустой: движок рендерит список тёмным,
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
  ru: 'Попробовать — значит посмотреть на свою практику',
  en: 'To try it is to look at your own practice',
}

const INTRO: Bi[] = [
  {
    ru: 'Курс открыт целиком и без записи: четыре модуля и четыре артефакта — карта, метод, предел, первый шаг.',
    en: 'The whole course is open with no signup: four modules and four outputs — a map, a method, a limit, a first step.',
  },
  {
    ru: 'Открой урок «Признаки потолка». Если за десять минут своя практика стала понятнее — остальное на месте. Если нет — ты ничего не должен.',
    en: 'Open the lesson "Signs of a ceiling". If your practice is clearer after ten minutes, the rest is right there. If not, you owe nothing.',
  },
]

const NOT_PROGRAMMING: { heading: Bi; body: Bi[] } = {
  heading: { ru: 'Что здесь пробуют', en: 'What you try here' },
  body: [
    {
      ru: 'Курс не учит вести сессии и не учит продавать. Он разбирает сам формат один на один: где он держит практику, а где становится потолком.',
      en: 'The course does not teach how to run sessions and does not teach selling. It works through the one-to-one format itself: where it holds a practice and where it becomes a ceiling.',
    },
    {
      ru: 'Практика курса — твои клиенты, твои часы и твой метод, разложенные в шаблоны. Шаблоны можно открыть до первого урока.',
      en: 'The practice of the course is your clients, your hours and your method, laid out in templates. You can open the templates before the first lesson.',
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
      ru: 'Он не обещает дохода и потока клиентов. Курс показывает, где практика упирается в потолок; сколько клиентов придёт, решает не он.',
      en: 'It does not promise income or a stream of clients. The course shows where a practice hits its ceiling; how many clients come is not its call.',
    },
    {
      ru: 'Он не учит самой практике. Мастерство ведущего растят другие модули академии; здесь — только формат.',
      en: 'It does not teach the practice itself. Other academy modules grow the leader’s craft; here it is only the format.',
    },
    {
      ru: 'Он не заменит врача, терапевта или юриста. Урок о границе компетенции учит видеть признаки и передавать клиента, а не ставить диагноз.',
      en: 'It will not replace a doctor, a therapist or a lawyer. The lesson on the edge of competence teaches you to see the signs and refer a client, not to diagnose.',
    },
    {
      ru: 'Он не скажет, что группа лучше. Верхняя ступень не лучше нижней, и часть клиентов остаётся один на один.',
      en: 'It will not say a group is better. A higher step is not better than a lower one, and some clients stay one to one.',
    },
  ],
}

const OUTRO: { heading: Bi; body: Bi[]; ctaLabel: Bi; noCta: Bi } = {
  heading: { ru: 'Если практика стала понятнее', en: 'If your practice got clearer' },
  body: [
    {
      ru: 'Значит дальше просто: четыре модуля подряд. В конце — план первого шага с датой, который можно записать в «Мою карту» на лесенке форматов.',
      en: 'Then the rest is simple: four modules in a row. At the end, a plan of the first step with a date, which you can record in "My map" on the format ladder.',
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
