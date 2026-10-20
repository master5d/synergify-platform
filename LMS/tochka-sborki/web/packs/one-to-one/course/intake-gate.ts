// packs/one-to-one/course/intake-gate.ts
// Форма эталона. Ворота анкеты у этого курса выключены (gates.intake: false в course.config) —
// текст держим честным на случай, если их включат: что здесь есть и чего нет, без обещаний.
import type { Locale } from '@/lib/intake/types'

type L = Record<Locale, string>

export interface IntakeGateData {
  eyebrow: L
  title: L
  lead: L
  beforeLabel: L
  afterLabel: L
  keep: L
  frame: L
  enter: L
  more: L
  rows: { before: L; after: L }[]
}

export const INTAKE_GATE: IntakeGateData = {
  eyebrow: { ru: 'Курс академии S.A.S.H.A', en: 'A S.A.S.H.A academy course' },
  title: {
    ru: 'Прежде чем начать — что здесь есть и чего нет',
    en: 'Before you start — what is here and what is not',
  },
  lead: {
    ru: '«Один на один и дальше» — работа один на один как первая ступень лесенки: карта практики, метод на одной странице, предел часов и цены, первый шаг к малой группе. Курс не обещает дохода, не учит самой практике и не заменяет врача, терапевта или юриста.',
    en: '"One to One and Beyond" — one-to-one work as the first step of the ladder: a map of your practice, a method on one page, the limit of hours and price, a first step to a small group. The course promises no income, does not teach the practice itself and does not replace a doctor, a therapist or a lawyer.',
  },
  beforeLabel: { ru: 'Как часто бывает', en: 'How it often goes' },
  afterLabel: { ru: 'Здесь', en: 'Here' },
  keep: {
    ru: 'Курс удался, когда у тебя в руках карта практики, метод, расчёт предела и дата первого шага.',
    en: 'The course has worked when you hold a map of your practice, a method, the limit worked out and a date for the first step.',
  },
  frame: {
    ru: 'Дальше — только уроки: без игровой обёртки и без опросника.',
    en: 'Next come just the lessons: no game wrapper and no questionnaire.',
  },
  enter: { ru: 'Начать →', en: 'Start →' },
  more: { ru: 'Подробнее о курсе →', en: 'More about the course →' },
  rows: [
    {
      before: { ru: 'Клиенты ходят «к тебе лично», а что они получают, не названо', en: 'Clients come "to you personally", and what they get has no name' },
      after: { ru: 'Для каждого клиента видно, что даёт метод, а что отношения', en: 'For each client you see what the method gives and what the relationship gives' },
    },
    {
      before: { ru: 'Цена — за сессию, часы вне сессий не видны', en: 'The price is per session; hours outside sessions are invisible' },
      after: { ru: 'Посчитаны цена рабочего часа и предел недели', en: 'The price of a working hour and the weekly limit are worked out' },
    },
    {
      before: { ru: 'Группа — «когда-нибудь потом»', en: 'A group is for "some day later"' },
      after: { ru: 'Первая встреча на 2–7 человек стоит в плане с датой', en: 'The first meeting for 2–7 people is in the plan with a date' },
    },
  ],
}
