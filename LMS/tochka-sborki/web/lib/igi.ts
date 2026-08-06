// lib/igi.ts
// ИГИ — Игра в Групповой Инсайт (fb_c5d771f00e9a). Self-contained group-bonding
// insight ritual for a синергема: a 6-card deck + 4-step protocol + the generative
// Q&U rule. Engine + keyed bilingual data (mirror lib/course/certificate.ts); the
// presentational card is components/igi-ritual.tsx. No backend — a formed cluster
// runs it offline.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface IgiCard { id: string; name: Bi; prompt: Bi }
export interface IgiStep { id: string; title: Bi; body: Bi }
export interface IgiRitual {
  title: Bi
  intro: Bi
  generative: Bi
  cards: IgiCard[]
  steps: IgiStep[]
}

export const IGI: IgiRitual = {
  title: { ru: '«ИГИ» — Игра в Групповой Инсайт', en: '"GII" — the Group Insight Game' },
  intro: {
    ru: 'Ритуал для синергемы: как из группы соучеников вырастить общий инсайт. Проведите вместе — вслух, по кругу.',
    en: 'A ritual for the synergem: how a group of fellow learners grows a shared insight. Run it together — aloud, in a circle.',
  },
  generative: {
    ru: 'Генеративный вопрос рождается на пересечении Вопроса и Умвельта: возьмите один вопрос группы и чей-то Умвельт — личный мир восприятия — и спросите, как этот вопрос выглядит изнутри этого мира.',
    en: "The generative question is born where a Question meets an Umwelt: take one of the group's questions and one person's Umwelt — their perceptual world — and ask how that question looks from inside it.",
  },
  cards: [
    { id: 'question', name: { ru: 'Вопрос', en: 'Question' }, prompt: { ru: 'Что мы на самом деле хотим понять? Сформулируй живой вопрос, а не задачу.', en: 'What do we actually want to understand? Phrase a living question, not a task.' } },
    { id: 'learning', name: { ru: 'Обучение', en: 'Learning' }, prompt: { ru: 'Чему каждый из нас сейчас учится? Назови свой текущий край роста.', en: 'What is each of us learning right now? Name your current growth edge.' } },
    { id: 'knowledge', name: { ru: 'Знание', en: 'Knowledge' }, prompt: { ru: 'Что мы уже знаем по этому вопросу? Выложи общее на стол.', en: 'What do we already know about this? Put the shared knowledge on the table.' } },
    { id: 'umwelt', name: { ru: 'Умвельт', en: 'Umwelt' }, prompt: { ru: 'Из какого мира восприятия ты смотришь? Опиши, как вопрос выглядит изнутри тебя.', en: 'From which perceptual world do you look? Describe how the question looks from inside you.' } },
    { id: 'trust', name: { ru: 'Доверие', en: 'Trust' }, prompt: { ru: 'Что даёт группе безопасность быть открытой? Назови одно условие доверия.', en: 'What lets the group feel safe to be open? Name one condition of trust.' } },
    { id: 'opinion', name: { ru: 'Мнение', en: 'Opinion' }, prompt: { ru: 'Какое у тебя мнение — и где его край? Держи его как гипотезу, а не как истину.', en: 'What is your opinion — and where is its edge? Hold it as a hypothesis, not a truth.' } },
  ],
  steps: [
    { id: 'frame', title: { ru: 'Постановка вопроса', en: 'Framing the question' }, body: { ru: 'Соберите вопросы (карта «Вопрос»). Выберите один живой вопрос, важный для всех.', en: 'Gather questions (the Question card). Choose one living question that matters to everyone.' } },
    { id: 'choose', title: { ru: 'Выбор карт', en: 'Choosing cards' }, body: { ru: 'Каждый берёт 1–2 карты (Умвельт, Знание, Мнение…) и отвечает на вопрос через них. Слушайте, не спорьте.', en: "Each person takes 1–2 cards (Umwelt, Knowledge, Opinion…) and answers the question through them. Listen, don't argue." } },
    { id: 'cultivate', title: { ru: 'Культивация понимания', en: 'Cultivating understanding' }, body: { ru: 'Сформируйте генеративный вопрос Q&U и пройдите по кругу ещё раз. Понимание растёт из встречи миров.', en: 'Form the generative Q&U question and go around the circle again. Understanding grows from the meeting of worlds.' } },
    { id: 'wisdom', title: { ru: 'Практическая мудрость', en: 'Practical wisdom' }, body: { ru: 'Назовите один общий вывод и один маленький шаг, который сделает группа. Инсайт без шага остывает.', en: 'Name one shared conclusion and one small step the group will take. An insight without a step goes cold.' } },
  ],
}

export interface ResolvedIgiCard { id: string; name: string; prompt: string }
export interface ResolvedIgiStep { id: string; title: string; body: string }
export interface ResolvedIgi {
  title: string
  intro: string
  generative: string
  cards: ResolvedIgiCard[]
  steps: ResolvedIgiStep[]
}

export function resolveIgi(locale: Locale, source: IgiRitual = IGI): ResolvedIgi {
  return {
    title: source.title[locale],
    intro: source.intro[locale],
    generative: source.generative[locale],
    cards: source.cards.map((c) => ({ id: c.id, name: c.name[locale], prompt: c.prompt[locale] })),
    steps: source.steps.map((s) => ({ id: s.id, title: s.title[locale], body: s.body[locale] })),
  }
}
