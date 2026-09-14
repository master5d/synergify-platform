// packs/tochka-sborki/course/intake-gate.ts
// Копия ворот анкеты (шаг 0 мастера, ДО первого RPG-вопроса): «что это / что получишь /
// это метафора, а не игра». Движок — lib/intake/intake-gate-content.ts + <IntakeGate>.
// Перенесено из движка дословно (intake LMS#16): у Точки Сборки ворота не изменились.
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
  eyebrow: { ru: '⬡ Открытый курс · Бесплатно', en: '⬡ Open course · Free' },
  title: {
    ru: 'Прежде чем начать — что это и что ты получишь',
    en: "Before you start — what this is and what you'll get",
  },
  lead: {
    ru: 'Точка Сборки — бесплатный курс. Научишься поручать AI собирать рабочие системы под твои задачи — не переписываться с чатом, а получать готовый результат. Без кода, на твоём языке.',
    en: "Tochka Sborki is a free course. You'll learn to have AI build working systems for your tasks — not chat back and forth, but get a finished result. No code, in your own language.",
  },
  beforeLabel: { ru: 'Сейчас', en: 'Now' },
  afterLabel: { ru: 'После курса', en: 'After the course' },
  keep: {
    ru: 'Даже если ты не станешь вайб-кодером — навык думать вместе с AI останется с тобой навсегда.',
    en: "Even if you never become a vibe coder, the skill of thinking with AI stays with you for good.",
  },
  frame: {
    ru: 'Дальше — пара вопросов и игровая обёртка: миры, спутник, карта пути. Это метафора курса, чтобы учиться было живее — не компьютерная игра и не про программирование, просто способ подачи.',
    en: "Next come a few questions and a game wrapper: worlds, a companion, a path map. It's a metaphor for the course, to make learning livelier — not a video game and not about programming, just a way of framing it.",
  },
  enter: { ru: 'Поехали →', en: "Let's go →" },
  more: { ru: 'Подробнее о курсе →', en: 'More about the course →' },
  rows: [
    {
      before: { ru: 'AI советует — делаешь руками', en: 'AI advises — you do it by hand' },
      after: { ru: 'Поручаешь — получаешь готовое', en: 'You delegate — you get a finished result' },
    },
    {
      before: { ru: 'Каждый раз объясняешь заново', en: 'You explain everything from scratch each time' },
      after: { ru: 'Система уже знает твой проект', en: 'The system already knows your project' },
    },
    {
      before: { ru: 'Ответ живёт во вкладке', en: 'The answer lives in a browser tab' },
      after: { ru: 'Результат там, где нужен — в файлах, письмах, таблицах', en: 'The result lands where you need it — in files, emails, sheets' },
    },
  ],
}
