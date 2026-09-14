// packs/living-practice/course/intake-gate.ts
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
    ru: '«Тишина, в которой слышно» — восемь шагов практики внимания: польза и риск названы до первой сессии, собеседник между сессиями, живой круг в конце. Курс не лечит и не заменяет терапию.',
    en: '"The Silence Where You Can Hear" — eight steps of attention practice: benefit and risk named before the first session, a companion between sessions, a living circle at the end. The course treats nothing and does not replace therapy.',
  },
  beforeLabel: { ru: 'Как часто бывает', en: 'How it often goes' },
  afterLabel: { ru: 'Здесь', en: 'Here' },
  keep: {
    ru: 'Курс удался, когда стал не нужен: дальше — живые люди рядом.',
    en: 'The course has worked when it is no longer needed: after it, living people nearby.',
  },
  frame: {
    ru: 'Дальше — только уроки: без игровой обёртки и без опросника.',
    en: 'Next come just the lessons: no game wrapper and no questionnaire.',
  },
  enter: { ru: 'Начать →', en: 'Start →' },
  more: { ru: 'Подробнее о курсе →', en: 'More about the course →' },
  rows: [
    {
      before: { ru: 'Дневник читает незнакомый проверяющий', en: 'A stranger grades your journal' },
      after: { ru: 'Опыт произносится вслух и слышится без оценки', en: 'Experience is spoken aloud and heard without grading' },
    },
    {
      before: { ru: 'Обещан комфорт; всё трудное — «разбирайся сам»', en: 'Comfort is promised; anything hard is "sort it out yourself"' },
      after: { ru: 'Трудное ожидаемо и разделяемо; граница с терапией названа вслух', en: 'Difficulty is expected and shared; the line with therapy is named aloud' },
    },
    {
      before: { ru: 'Слова не дают никому: сессии — трансляция', en: 'Nobody gets to speak: sessions are a broadcast' },
      after: { ru: 'Малый круг: слово успевает взять каждый', en: 'A small circle: everyone gets to speak' },
    },
  ],
}
