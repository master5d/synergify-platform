// packs/retreat/course/intake-gate.ts
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
    ru: '«Ретрит с двух сторон» — одна сделка ретрита глазами ведущего и площадки: деньги во времени, договор, отмены и недобор, программа, гости. Курс не обещает дохода и не заменяет юриста.',
    en: '"A Retreat From Both Sides" — one retreat deal through the eyes of the leader and the venue: money over time, the contract, cancellations and a short group, the program, the guests. The course promises no income and does not replace a lawyer.',
  },
  beforeLabel: { ru: 'Как часто бывает', en: 'How it often goes' },
  afterLabel: { ru: 'Здесь', en: 'Here' },
  keep: {
    ru: 'Курс удался, когда ты считаешь сделку раньше, чем подписываешь.',
    en: 'The course has worked when you calculate the deal before you sign it.',
  },
  frame: {
    ru: 'Дальше — только уроки: без игровой обёртки и без опросника.',
    en: 'Next come just the lessons: no game wrapper and no questionnaire.',
  },
  enter: { ru: 'Начать →', en: 'Start →' },
  more: { ru: 'Подробнее о курсе →', en: 'More about the course →' },
  rows: [
    {
      before: { ru: 'Цену списывают у похожих ретритов', en: 'The price is copied from similar retreats' },
      after: { ru: 'Цену выводят из желаемой прибыли и считают в калькуляторе', en: 'The price is derived from the profit you want and checked in the calculator' },
    },
    {
      before: { ru: 'Площадку бронируют до того, как гости заплатили', en: 'The venue is booked before guests have paid' },
      after: { ru: 'Касса построена так, что деньги гостей приходят раньше платежей площадке', en: "Cash is planned so guests' money arrives before the venue payments" },
    },
    {
      before: { ru: 'Отмены ведущего и площадки живут в разных календарях', en: "The leader's and the venue's cancellations live in different calendars" },
      after: { ru: 'Два календаря отмен сверены, дыра между ними видна заранее', en: 'The two cancellation calendars are lined up, and any gap shows in advance' },
    },
  ],
}
