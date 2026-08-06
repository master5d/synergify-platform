// lib/breaks/data.ts
// Содержимое микро-пауз. Вопросы взяты из УЖЕ пройденного материала курса: пауза
// вспоминает прочитанное и переключает внимание, а не задаёт новое задание.
// Порядок в массиве задаёт чередование — каждая третья карточка пассивная, иначе
// девять вопросов подряд превращают паузу в экзамен.
// Тон: без похвалы и без пристыживания (оверлей не показывает очков и серий).
import type { Locale } from '@/lib/intake/types'
import type { BreakActivity, ResolvedBreak } from './types'

export const BREAKS: BreakActivity[] = [
  {
    kind: 'puzzle',
    key: 'ctx-rot',
    title: { ru: 'Протухание контекста', en: 'Context rot' },
    question: {
      ru: 'Разговор с агентом идёт третий час. Что происходит с информацией, которую вы дали в самом начале?',
      en: 'You are three hours into a session with an agent. What happens to what you told it at the very start?',
    },
    choices: [
      { ru: 'Модель помнит её лучше всего — это же основа диалога', en: 'The model remembers it best — it is the basis of the dialogue' },
      { ru: 'Работать с ней становится хуже: чем длиннее контекст, тем сильнее «протухание»', en: 'It gets harder to use: the longer the context, the stronger the rot' },
      { ru: 'Ничего не меняется: контекст либо влезает, либо нет', en: 'Nothing changes: the context either fits or it does not' },
    ],
    answer: 1,
    reveal: {
      ru: 'Context rot — деградация постепенная, а не обрыв. Длинный диалог дешевле пересобрать заново, чем тянуть.',
      en: 'Context rot is gradual, not a cliff. A long session is cheaper to restart than to drag along.',
    },
  },
  {
    kind: 'puzzle',
    key: 'lost-middle',
    title: { ru: 'Середина теряется', en: 'The middle gets lost' },
    question: {
      ru: 'Куда НЕ стоит класть самое важное в длинном контексте?',
      en: 'Where should you NOT put the most important thing in a long context?',
    },
    choices: [
      { ru: 'В начало', en: 'At the start' },
      { ru: 'В середину', en: 'In the middle' },
      { ru: 'В конец', en: 'At the end' },
    ],
    answer: 1,
    reveal: {
      ru: 'Модель переоценивает начало и конец. Критичное в середине рискует остаться незамеченным.',
      en: 'Models over-weight the start and the end. Anything critical in the middle risks going unseen.',
    },
  },
  {
    kind: 'passive',
    key: 'look-away',
    title: { ru: 'Двадцать секунд вдаль', en: 'Twenty seconds far away' },
    prompt: {
      ru: 'Найдите в окне самую дальнюю точку и смотрите на неё, пока считаете до двадцати. Глазам нужен другой фокус, а не другой экран.',
      en: 'Find the farthest point out the window and look at it while you count to twenty. Your eyes need a different focus, not a different screen.',
    },
  },
  {
    kind: 'puzzle',
    key: 'context-vs-prompt',
    title: { ru: 'Контекст ≠ инструкция', en: 'Context is not instruction' },
    question: {
      ru: '«Ты senior-разработчик, работаем над платёжным модулем» — это что?',
      en: '"You are a senior developer, we are working on the payments module" — what is this?',
    },
    choices: [
      { ru: 'Инструкция', en: 'An instruction' },
      { ru: 'Контекст: кто ты и что происходит. Инструкция — что конкретно сделать', en: 'Context: who you are and what is going on. The instruction is what to actually do' },
      { ru: 'И то и другое одновременно', en: 'Both at once' },
    ],
    answer: 1,
    reveal: {
      ru: 'Смешение контекста и инструкции — один из пяти грехов промптинга. Разводите их явно.',
      en: 'Mixing context and instruction is one of the five sins of prompting. Separate them explicitly.',
    },
  },
  {
    kind: 'puzzle',
    key: 'distractors',
    title: { ru: 'Дистракторы', en: 'Distractors' },
    question: {
      ru: 'В контекст попали три похожих фрагмента кода, нужный — один. Что будет?',
      en: 'Three similar code fragments end up in the context; only one is relevant. What happens?',
    },
    choices: [
      { ru: 'Модель выберет нужный, остальные проигнорирует', en: 'The model picks the right one and ignores the rest' },
      { ru: 'Похожие фрагменты собьют её с правильного ответа', en: 'The lookalikes pull it away from the right answer' },
      { ru: 'Качество не изменится, лишний контекст безвреден', en: 'Quality stays the same — extra context is harmless' },
    ],
    answer: 1,
    reveal: {
      ru: 'Лишнее не нейтрально. Чистить контекст — часть работы, а не педантизм.',
      en: 'Extra context is not neutral. Cleaning it is part of the work, not fussiness.',
    },
  },
  {
    kind: 'passive',
    key: 'breathe',
    title: { ru: 'Один длинный выдох', en: 'One long exhale' },
    prompt: {
      ru: 'Вдох на четыре счёта, выдох на шесть. Три раза. Ничего больше делать не нужно.',
      en: 'Inhale for four counts, exhale for six. Three times. Nothing else is required.',
    },
  },
  {
    kind: 'puzzle',
    key: 'tone',
    title: { ru: 'Тон в промпте', en: 'Tone in the prompt' },
    question: {
      ru: 'Помогает ли давление и брань в промпте выжать из модели лучший результат?',
      en: 'Does pressure or abuse in a prompt squeeze a better result out of the model?',
    },
    choices: [
      { ru: 'Да, жёсткая формулировка мобилизует', en: 'Yes, harsh wording mobilises it' },
      { ru: 'Нет, агрессивный тон измеримо ухудшает качество', en: 'No — an aggressive tone measurably degrades quality' },
      { ru: 'Не влияет никак', en: 'It makes no difference' },
    ],
    answer: 1,
    reveal: {
      ru: 'Эффект реальный и проверяемый. Тон — не вежливость ради вежливости, а параметр качества.',
      en: 'The effect is real and testable. Tone is not politeness for its own sake — it is a quality parameter.',
    },
  },
  {
    kind: 'puzzle',
    key: 'mcp-what',
    title: { ru: 'Что такое MCP', en: 'What MCP is' },
    question: {
      ru: 'MCP — это про что?',
      en: 'What is MCP about?',
    },
    choices: [
      { ru: 'Язык программирования для агентов', en: 'A programming language for agents' },
      { ru: 'Протокол, которым агент подключается к внешним инструментам и данным', en: 'A protocol by which an agent connects to external tools and data' },
      { ru: 'Формат хранения промптов', en: 'A storage format for prompts' },
    ],
    answer: 1,
    reveal: {
      ru: 'MCP — разъём. Агент получает не «больше ума», а больше рук.',
      en: 'MCP is a socket. The agent gains not more mind, but more hands.',
    },
  },
  {
    kind: 'passive',
    key: 'stand',
    title: { ru: 'Встаньте', en: 'Stand up' },
    prompt: {
      ru: 'Просто встаньте и потянитесь. Тело не обязано ждать конца модуля.',
      en: 'Just stand up and stretch. Your body does not have to wait for the end of the module.',
    },
  },
  {
    kind: 'puzzle',
    key: 'jagged',
    title: { ru: 'Зубчатый интеллект', en: 'Jagged intelligence' },
    question: {
      ru: 'Модель решает олимпиадную задачу, но путается в счёте букв. Это что?',
      en: 'A model solves an olympiad problem but miscounts letters. What is this?',
    },
    choices: [
      { ru: 'Баг конкретной версии', en: 'A bug in this particular version' },
      { ru: 'Зубчатость: неравномерный профиль способностей — норма, а не поломка', en: 'Jaggedness: an uneven ability profile is the norm, not a fault' },
      { ru: 'Признак того, что модель устарела', en: 'A sign the model is outdated' },
    ],
    answer: 1,
    reveal: {
      ru: 'Ждать ровного профиля — значит проектировать под несуществующую машину.',
      en: 'Expecting an even profile means designing for a machine that does not exist.',
    },
  },
  {
    kind: 'passive',
    key: 'what-changed',
    title: { ru: 'Что сдвинулось', en: 'What shifted' },
    prompt: {
      ru: 'Вспомните одну вещь из этого модуля, которую вы бы объяснили другу своими словами. Не проверяем — просто отметьте про себя.',
      en: 'Recall one thing from this module you could explain to a friend in your own words. No one is checking — just note it to yourself.',
    },
  },
]

const DEFAULT_CTA: Record<Locale, string> = { ru: 'Продолжить', en: 'Continue' }

export function resolveBreaks(locale: Locale, source: BreakActivity[] = BREAKS): ResolvedBreak[] {
  return source.map(b => {
    const cta = b.cta ? b.cta[locale] : DEFAULT_CTA[locale]
    if (b.kind === 'puzzle') {
      return {
        kind: 'puzzle',
        key: b.key,
        title: b.title[locale],
        question: b.question[locale],
        choices: b.choices.map(c => c[locale]),
        answer: b.answer,
        reveal: b.reveal[locale],
        cta,
      }
    }
    return {
      kind: 'passive',
      key: b.key,
      title: b.title[locale],
      prompt: b.prompt[locale],
      cta,
    }
  })
}
