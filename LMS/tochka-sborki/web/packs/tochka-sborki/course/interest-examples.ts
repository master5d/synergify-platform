// packs/tochka-sborki/course/interest-examples.ts
//
// Примеры концепт-фазы, которые можно пересказать через сферу ученика (intake LMS#8,
// спека docs/superpowers/specs/2026-09-28-interest-example.md). Пилот — 3 юнита; волна 19 — +00/u0-azbuka.
// Метка в MDX юнита: <InterestExample id="…"/>. Текст здесь — ОБЩИЙ пример: его видит каждый
// до ответа воркера и при любом отказе. Воркер берёт исходник отсюда, а не от клиента.
// Относительные импорты: файл тянет воркер. Черновик: формулировки на вычитку владельцем.
import type { InterestExampleItem } from '../../../lib/interest-example/types'

export const INTEREST_EXAMPLES: InterestExampleItem[] = [
  // Волна 19: вынесено из MDX юнита ДОСЛОВНО (без переписывания); подпись «Как увидеть самому.» осталась в MDX.
  {
    module: '00-kickstart',
    unit: 'u0-azbuka',
    id: 'temperature',
    text: {
      ru: 'Задай один и тот же вопрос дважды, каждый раз в новом чате: «Придумай название для кофейни у реки». Ответы будут разными — это и есть случайность выбора в работе. В обычном чате ручки температуры не видно, её заранее выставил сервис; напрямую её задают через API. Вывод для практики: один удачный ответ ещё не значит, что так будет всегда, — проверяй.',
      en: 'Ask the same question twice, each time in a new chat: "Come up with a name for a riverside café." The answers will differ — that\'s randomness of choice at work. In an ordinary chat you don\'t see the temperature dial; the service has set it for you, and it\'s set directly through the API. The practical takeaway: one good answer doesn\'t mean it will always come out that way — check.',
    },
  },
  {
    module: '01-introduction',
    unit: 'u2-four-shifts',
    id: 'delegation',
    text: {
      ru: 'Команда: «Напиши пост». Делегирование: «Я веду небольшую студию. Нужен пост-анонс нового занятия для подписчиков: тёплый тон, три коротких абзаца, в конце — вопрос к читателям».\n\nВо втором варианте агент знает, кто ты, для кого текст и каким он должен быть. Угадывать ему не приходится.',
      en: 'Command: "Write a post". Delegation: "I run a small studio. I need a post announcing a new session for my followers: warm tone, three short paragraphs, end with a question to readers."\n\nIn the second version the agent knows who you are, who the text is for and what it should look like. It does not have to guess.',
    },
  },
  {
    module: '05-context-memory',
    unit: 'u2-context-vs-prompt',
    id: 'context-vs-prompt',
    text: {
      ru: '«Напиши письмо» — это промпт: задание на этот раз.\n\n«Я основатель стартапа, пишу инвестору, стиль лаконичный и уверенный, цель: договориться о встрече» — это контекст: кто пишет, кому, каким тоном и зачем.',
      en: '"Write an email" is the prompt: the task for this time.\n\n"I\'m a startup founder writing to an investor, style is concise and confident, goal: lock in a meeting" is the context: who is writing, to whom, in what tone and why.',
    },
  },
  {
    module: '10-model-training',
    unit: 'u2-data-is-the-work',
    id: 'pairs',
    text: {
      ru: 'Допустим, модель должна раскладывать входящие письма небольшой компании по темам: заказ, жалоба, вопрос. Шаг 1 — собрать настоящие письма и к каждому записать правильную тему. Шаг 2 — перечитать пары и поправить спорные метки.\n\nПара выглядит просто: «Где мой заказ, жду уже неделю» → «заказ». Сотня проверенных пар полезнее любой настройки модели.',
      en: 'Say a model has to sort a small company\'s incoming emails by topic: order, complaint, question. Step 1 is collecting real emails and writing the right topic next to each one. Step 2 is rereading the pairs and fixing the doubtful labels.\n\nA pair looks simple: "Where is my order, I have been waiting a week" → "order". A hundred checked pairs help more than any model tuning.',
    },
  },
]
