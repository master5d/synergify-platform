// web/lib/intake/questions.ts
// Full 63-question bilingual intake instrument (Modules A–G + OS).
// Source: "AJTBD × Cognitive Load Questionnaire" (Modules A–F) and
// "ADDENDUM — Module G Cultural Scaffolding Layer" (Module G).
// Scored option `value` keys are aligned with scoring-weights.ts — do not edit.
import type { Question, ModuleIntro } from './types'

export const MODULE_INTROS: ModuleIntro[] = [
  {
    id: 'A',
    title: {
      ru: 'Ваш квест',
      en: 'Your Quest',
    },
    intro: {
      ru: 'Это короткая настройка под вас, а не экзамен: несколько небольших блоков, и почти любой вопрос можно пропустить, если он не откликается. Начнём с того, чего вы на самом деле хотите, — не с того, что обещает курс, а с того, что нужно именно вам прямо сейчас. Правильных ответов нет: чем конкретнее, тем точнее получится ваш персональный маршрут.',
      en: "This is a short setup for you, not a test: a few small sections, and you can skip almost any question that doesn't resonate. Let's start with what you actually want — not what the course promises, but what you need right now. There are no wrong answers: the more specific you are, the better your personalized roadmap.",
    },
  },
  {
    id: 'B',
    title: {
      ru: 'Ваша ситуация',
      en: 'Your Situation',
    },
    intro: {
      ru: 'Помогите нам понять, что вас сдерживало и что движет вперёд. Это про вашу реальность — а не тест.',
      en: "Help us understand what's been holding you back and what's driving you forward. This is about your reality — not a test.",
    },
  },
  {
    id: 'C',
    title: {
      ru: 'Ваш технический уровень',
      en: 'Your Technical Level',
    },
    intro: {
      ru: 'Здесь нет правильных или неправильных ответов — нам просто нужно знать, с какой точки вы стартуете, чтобы не наскучить вам и не перегрузить. Будьте честны: это поможет правильно построить ваш маршрут.',
      en: "No right or wrong answers here — we just need to know where you're starting from so we don't bore you or overwhelm you. Be honest: this helps us build your roadmap correctly.",
    },
  },
  {
    id: 'D',
    title: {
      ru: 'Ваш стиль обучения',
      en: 'Your Learning Style',
    },
    intro: {
      ru: 'Этот раздел помогает понять, сколько давать вам за один раз — и как именно подавать материал. Ваши ответы напрямую формируют темп вашего персонального маршрута.',
      en: 'This section helps us figure out how much to give you at once — and how to give it to you. Your answers here directly shape the pacing of your personal roadmap.',
    },
  },
  {
    id: 'E',
    title: {
      ru: 'Ваша энергия и драйв',
      en: 'Your Energy & Drive',
    },
    intro: {
      ru: 'Мы хотим быть уверены, что курс вас не выжжет — расскажите о своей энергии и о том, что вас держит. Этот раздел определяет, как ваш маршрут будет вас вознаграждать.',
      en: "We want to make sure this course doesn't burn you out — so tell us about your energy and what keeps you going. This section shapes how your roadmap rewards you.",
    },
  },
  {
    id: 'F',
    title: {
      ru: 'Ваш бизнес-контекст',
      en: 'Your Business Context',
    },
    intro: {
      ru: 'Последний раздел — расскажите о своей работе, чтобы мы первым делом показали вам самые подходящие части курса. Это напрямую определяет, какое Нишевое подземелье вы откроете.',
      en: 'Last section — tell us about your work so we can point you to the most relevant parts of the course first. This directly determines which Niche Dungeon you unlock.',
    },
  },
  {
    id: 'G',
    title: {
      ru: 'Культурный слой',
      en: 'Cultural Layer',
    },
    intro: {
      ru: 'Почти готово! Эти вопросы помогают персонализировать не только ЧТО вы учите, но и КАК мы с вами говорим об этом — какие аналогии используем, в какой эстетике выглядит ваш RPG-мир и каким тоном написаны все сообщения. Правильных ответов нет. Чем честнее и конкретнее — тем точнее ваш персональный маршрут.',
      en: 'Almost done! These questions help personalize not just WHAT you learn but HOW we talk to you about it — the analogies we use, the aesthetic of your RPG world, and the tone of every message. No right answers. The more honest and specific, the better.',
    },
  },
]

export const QUESTIONS: Question[] = [
  // ─── Module A — Your Quest ────────────────────────────────────────────────
  {
    id: 'A1', module: 'A', format: 'text', required: false,
    prompt: {
      ru: 'Опишите вашу работу или основное занятие одним предложением.',
      en: 'Describe your work or main activity in one sentence.',
    },
  },
  {
    id: 'A2', module: 'A', format: 'text', required: false,
    prompt: {
      ru: 'Какая одна самая важная задача, в которой вы хотите, чтобы ИИ помог вам в ближайшие 30 дней?',
      en: 'What is the single most important task you want AI to help you with in the next 30 days?',
    },
  },
  {
    id: 'A3', module: 'A', format: 'text', required: false,
    prompt: {
      ru: 'Представьте, что прошло 3 месяца и ИИ по-настоящему изменил то, как вы работаете. Что стало другим в вашем дне?',
      en: "Imagine it's 3 months from now and AI has genuinely changed how you work. What is different about your day?",
    },
  },
  {
    id: 'A4', module: 'A', format: 'text', required: false,
    prompt: {
      ru: 'Что вы делали для решения этой задачи до того, как нашли этот курс?',
      en: 'What were you doing before you found this course to solve this problem?',
    },
  },
  {
    id: 'A5', module: 'A', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы думаете об использовании ИИ в работе, как вы хотите себя чувствовать?',
      en: 'When you think about using AI in your work, how do you want to feel?',
    },
    options: [
      { value: 'confident', label: { ru: 'Уверенно и независимо', en: 'Confident and independent' } },
      { value: 'supported', label: { ru: 'С поддержкой и сопровождением', en: 'Supported and guided' } },
      { value: 'ahead', label: { ru: 'На шаг впереди', en: 'Ahead of the curve' } },
      { value: 'calm', label: { ru: 'Спокойно и под контролем', en: 'Calm and in control' } },
      { value: 'other', label: { ru: 'Другое (опишите)', en: 'Other (please describe)' } },
    ],
  },
  {
    id: 'A6', module: 'A', format: 'single', required: true,
    prompt: {
      ru: 'Как вы хотите, чтобы окружающие (клиенты, коллеги, знакомые) видели вас после прохождения этого курса?',
      en: 'How do you want the people around you (clients, colleagues, peers) to see you after completing this course?',
    },
    options: [
      { value: 'professional', label: { ru: 'Более профессиональным', en: 'More professional' } },
      { value: 'modern', label: { ru: 'Более современным и инновационным', en: 'More modern and innovative' } },
      { value: 'efficient', label: { ru: 'Более эффективным и собранным', en: 'More efficient and sharp' } },
      { value: 'creative', label: { ru: 'Более креативным', en: 'More creative' } },
      { value: 'other', label: { ru: 'Другое (опишите)', en: 'Other (please describe)' } },
    ],
  },
  {
    id: 'A7', module: 'A', format: 'single', required: true,
    prompt: {
      ru: 'Что главным образом мешает вам уже сейчас использовать ИИ так, как вам хочется?',
      en: 'What is the main thing stopping you from already using AI the way you want?',
    },
    options: [
      { value: 'where_start', label: { ru: 'Не знаю, с чего начать', en: "I don't know where to start" } },
      { value: 'confused', label: { ru: 'Пробовал(а) и запутался(ась)', en: "I've tried and got confused" } },
      { value: 'no_time', label: { ru: 'Не хватает времени', en: "I don't have enough time" } },
      { value: 'too_technical', label: { ru: 'Боюсь, что это слишком технически сложно для меня', en: "I'm worried it's too technical for me" } },
      { value: 'niche', label: { ru: 'Боюсь, что ИИ не поймёт мою специфическую нишу', en: "I'm worried AI won't understand my specific niche" } },
      { value: 'already_using', label: { ru: 'Я уже пользуюсь ИИ — просто не знаю, что ещё с ним возможно', en: "I already use AI — I just don't know what else is possible with it" } },
      { value: 'other', label: { ru: 'Другое', en: 'Other' } },
    ],
  },
  {
    id: 'A8', module: 'A', format: 'text', required: false,
    prompt: {
      ru: 'Что заставило вас записаться именно на этот курс?',
      en: 'What made you sign up for this course specifically?',
    },
  },
  {
    id: 'A9', module: 'A', format: 'likert', required: true,
    prompt: {
      ru: 'По шкале 1–5, насколько срочно вам нужно получить рабочее ИИ-решение в ближайшие 2–4 недели? (1 = совсем не срочно, 5 = очень срочно, результат нужен уже сейчас)',
      en: 'On a scale of 1–5, how urgent is it for you to get a working AI solution in the next 2–4 weeks? (1 = Not urgent at all, 5 = Very urgent — I need results now)',
    },
  },
  {
    id: 'A10', module: 'A', format: 'text', required: false,
    prompt: {
      ru: 'Как для вас выглядел бы «успех» по итогам этого курса? Опишите как можно конкретнее.',
      en: 'What would "success" look like for you at the end of this course? Be as specific as possible.',
    },
  },

  // ─── Module B — Your Situation ────────────────────────────────────────────
  {
    id: 'B1', module: 'B', format: 'likert', required: true,
    prompt: {
      ru: 'До этого курса насколько вы были довольны своим текущим подходом к привлечению клиентов, созданию контента или автоматизации задач? (1 = очень разочарован, 5 = полностью доволен)',
      en: 'Before this course, how satisfied were you with your current approach to getting clients, creating content, or automating tasks? (1 = Very frustrated, 5 = Completely satisfied)',
    },
  },
  {
    id: 'B2', module: 'B', format: 'text', required: false,
    prompt: {
      ru: 'Что вы уже пробовали, но это не сработало?',
      en: "What have you already tried that didn't work?",
    },
  },
  {
    id: 'B3', module: 'B', format: 'text', required: false,
    prompt: {
      ru: 'Что в этом курсе зацепило настолько, что вы решили попробовать?',
      en: 'What about this course made you want to give it a try?',
    },
  },
  {
    id: 'B4', module: 'B', format: 'single', required: true,
    prompt: {
      ru: 'Что больше всего вас беспокоит перед прохождением этого курса?',
      en: 'What is your biggest worry about taking this course?',
    },
    options: [
      { value: 'fall_behind', label: { ru: 'Что отстану от группы', en: "I'll fall behind the group" } },
      { value: 'too_technical', label: { ru: 'Что будет слишком технически сложно для меня', en: "It'll be too technical for me" } },
      { value: 'no_time_apply', label: { ru: 'Что не хватит времени применить то, чему учусь', en: "I won't have time to apply what I learn" } },
      { value: 'pay_not_finish', label: { ru: 'Что заплачу и не закончу', en: "I'll pay and not finish" } },
      { value: 'too_expensive', label: { ru: 'Что инструменты окажутся слишком дорогими', en: 'The tools will be too expensive' } },
      { value: 'not_worried', label: { ru: 'Меня ничего не беспокоит', en: "I'm not worried" } },
    ],
  },
  {
    id: 'B5', module: 'B', format: 'text', required: false,
    prompt: {
      ru: 'Есть ли в вашей работе что-то, что вы делаете вручную или «по старинке» и пока не готовы доверить ИИ? (Например: пишете тексты сами, ведёте записи на бумаге.)',
      en: 'Is there anything in your work you still do by hand or "the old way" and aren\'t ready to hand to AI yet? (For example: writing your own copy, keeping notes on paper.)',
    },
  },
  {
    id: 'B6', module: 'B', format: 'single', required: true,
    prompt: {
      ru: 'Случилось ли недавно что-то конкретное, из-за чего обучение ИИ стало ощущаться более срочным? (Например: конкурент начал его использовать, вы потеряли клиента, увидели чьи-то результаты.)',
      en: 'Has something specific recently happened that made learning AI feel more urgent? (For example: a competitor started using it, you lost a client, you saw someone else\'s results.)',
    },
    options: [
      { value: 'yes', label: { ru: 'Да (опишите)', en: 'Yes (please describe)' } },
      { value: 'no', label: { ru: 'Нет, ничего конкретного', en: 'No, nothing specific' } },
    ],
  },
  {
    id: 'B7', module: 'B', format: 'single', required: true,
    prompt: {
      ru: 'Как долго вы думали об обучении ИИ, прежде чем действительно записались?',
      en: 'How long had you been thinking about learning AI before you actually enrolled?',
    },
    options: [
      { value: 'lt_week', label: { ru: 'Меньше недели', en: 'Less than a week' } },
      { value: 'w1_4', label: { ru: '1–4 недели', en: '1–4 weeks' } },
      { value: 'm1_3', label: { ru: '1–3 месяца', en: '1–3 months' } },
      { value: 'm6_plus', label: { ru: '6 месяцев или больше', en: '6 months or more' } },
    ],
  },
  {
    id: 'B8', module: 'B', format: 'single', required: true,
    prompt: {
      ru: 'Что вероятнее всего заставит вас бросить курс на полпути?',
      en: 'What would most likely make you stop the course partway through?',
    },
    options: [
      { value: 'e0', label: { ru: 'Меня бы ничего не остановило — я довожу до конца', en: "Nothing — I'd see it through" } },
      { value: 'e1', label: { ru: 'Если стало бы слишком сложно или непонятно', en: 'If it got too hard or confusing' } },
      { value: 'e2', label: { ru: 'Если бы навалилась жизнь или пропала мотивация', en: 'If life got busy or I lost motivation' } },
    ],
  },

  // ─── Module C — Your Technical Level ──────────────────────────────────────
  {
    id: 'C1', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Что из этого лучше всего описывает вас прямо сейчас?',
      en: 'Which of these best describes you right now?',
    },
    options: [
      { value: 'tier0', label: { ru: 'Я никогда не пользовался(ась) никакими ИИ-инструментами', en: "I've never used any AI tool" } },
      { value: 'tier1', label: { ru: 'Я пользовался(ась) ChatGPT или похожим для бытовых задач', en: "I've used ChatGPT or something similar for casual things" } },
      { value: 'tier2', label: { ru: 'Я регулярно использую ИИ для рабочих задач', en: 'I use AI regularly for work tasks' } },
      { value: 'tier3', label: { ru: 'Я сам(а) настроил(а) ИИ-автоматизацию или интеграцию', en: "I've set up an AI automation or integration myself" } },
      { value: 'tier4', label: { ru: 'Я создал(а) или развернул(а) ИИ-агента или бота', en: "I've built or deployed an AI agent or bot" } },
    ],
  },
  {
    id: 'C2', module: 'C', format: 'multi', required: false,
    prompt: {
      ru: 'Какими ИИ-инструментами вы пользовались? (Выберите все подходящие.)',
      en: 'Which AI tools have you used? (Select all that apply.)',
    },
    options: [
      { value: 'chatgpt', label: { ru: 'ChatGPT', en: 'ChatGPT' } },
      { value: 'claude', label: { ru: 'Claude', en: 'Claude' } },
      { value: 'image_ai', label: { ru: 'Midjourney или похожий ИИ для картинок', en: 'Midjourney or similar image AI' } },
      { value: 'notion_ai', label: { ru: 'Notion AI', en: 'Notion AI' } },
      { value: 'zapier_make', label: { ru: 'Zapier или Make.com', en: 'Zapier or Make.com' } },
      { value: 'copilot', label: { ru: 'GitHub Copilot', en: 'GitHub Copilot' } },
      { value: 'custom_gpts', label: { ru: 'Кастомные GPT', en: 'Custom GPTs' } },
      { value: 'local_ai', label: { ru: 'Локальные ИИ-инструменты (Ollama, LM Studio и т.п.)', en: 'Local AI tools (Ollama, LM Studio, etc.)' } },
      { value: 'none', label: { ru: 'Ничего из этого', en: 'None of these' } },
    ],
  },
  {
    id: 'C3', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы слышите слово «API», какая реакция вам ближе всего?',
      en: 'When you hear the word "API," which reaction is closest to yours?',
    },
    options: [
      { value: 'never_heard', label: { ru: 'Никогда не слышал(а) этот термин', en: "I've never heard that term" } },
      { value: 'heard', label: { ru: 'Слышал(а), но не знаю, что это значит', en: "I've heard of it but don't know what it means" } },
      { value: 'know', label: { ru: 'Знаю, что это, но никогда не использовал(а)', en: "I know what it is but have never used one" } },
      { value: 'used', label: { ru: 'Я подключал(а) или использовал(а) API', en: "I've connected or used an API before" } },
    ],
  },
  {
    id: 'C4', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Писали ли вы когда-нибудь код, формулу или скрипт — хотя бы что-то базовое в Excel или Google Таблицах?',
      en: 'Have you ever written any code, formula, or script — even something basic in Excel or Google Sheets?',
    },
    options: [
      { value: 'never', label: { ru: 'Никогда', en: 'Never' } },
      { value: 'basic', label: { ru: 'Только базовые формулы (СУММ, ЕСЛИ)', en: 'Only basic formulas (SUM, IF)' } },
      { value: 'scripts', label: { ru: 'Да, писал(а) простые скрипты', en: "Yes, I've written simple scripts" } },
      { value: 'comfortable', label: { ru: 'Да, мне комфортно с кодом', en: "Yes, I'm comfortable with coding" } },
    ],
  },
  {
    id: 'C5', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Если бы вам дали понятную письменную инструкцию из 10 шагов по настройке нового приложения, что вероятнее всего произошло бы?',
      en: 'If you were given a clear 10-step written instruction to set up a new app, what would most likely happen?',
    },
    options: [
      { value: 'do_it', label: { ru: 'Я бы прошёл(прошла) каждый шаг и довёл(довела) до конца', en: "I'd follow every step and get it done" } },
      { value: 'stuck', label: { ru: 'Скорее всего где-то застрял(а) бы и нужна была бы помощь', en: "I'd probably get stuck somewhere and need help" } },
      { value: 'give_up', label: { ru: 'Дошёл(дошла) бы до середины и, вероятно, сдался(ась)', en: "I'd get halfway and likely give up" } },
      { value: 'ask_other', label: { ru: 'Попросил(а) бы кого-то сделать это за меня', en: "I'd ask someone else to do it for me" } },
    ],
  },
  {
    id: 'C6', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Когда ИИ-чат-бот даёт вам плохой или бесполезный ответ, что вы обычно делаете?',
      en: 'When you use an AI chatbot and it gives you a bad or unhelpful answer, what do you usually do?',
    },
    options: [
      { value: 'accept', label: { ru: 'Принимаю как есть и двигаюсь дальше', en: 'Accept it and move on' } },
      { value: 'rephrase', label: { ru: 'Пробую переформулировать свой вопрос', en: 'Try to rephrase my question' } },
      { value: 'better_prompts', label: { ru: 'Умею писать более точные промпты, чтобы это исправить', en: 'I know how to write better prompts to fix it' } },
      { value: 'engineer', label: { ru: 'Понимаю, почему не сработало, и могу обойти это инженерно', en: 'I understand why it failed and can engineer around it' } },
      { value: 'confront', label: { ru: 'Спорю с ним, поправляю логикой и заставляю исправиться', en: 'I push back, correct it with logic, and make it fix the answer' } },
    ],
  },
  {
    id: 'C7', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Бывало ли, что вы смотрели туториал или обучающее видео и затем успешно применяли это к чему-то в реальной работе?',
      en: 'Have you ever watched a tutorial or how-to video and then successfully applied what you learned to something in your actual work?',
    },
    options: [
      { value: 'often', label: { ru: 'Да, часто и успешно', en: 'Yes, often and successfully' } },
      { value: 'sometimes', label: { ru: 'Иногда — как повезёт', en: "Sometimes — it's hit or miss" } },
      { value: 'rarely', label: { ru: 'Редко', en: 'Rarely' } },
      { value: 'never_apply', label: { ru: 'Смотрю туториалы, но почти никогда сразу не применяю', en: 'I watch tutorials but almost never apply them right away' } },
    ],
  },
  {
    id: 'C8', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Насколько вам комфортно с абстрактными идеями — например, понимать, что «модель обучена на данных», не вникая в каждую техническую деталь?',
      en: 'How comfortable are you with abstract ideas — for example, understanding that "a model is trained on data" without needing to know every technical detail?',
    },
    options: [
      { value: 'very', label: { ru: 'Очень комфортно — я умею работать с абстрактными концепциями', en: 'Very comfortable — I can work with abstract concepts' } },
      { value: 'somewhat', label: { ru: 'Скорее комфортно', en: 'Somewhat comfortable' } },
      { value: 'concrete', label: { ru: 'Я предпочитаю конкретные примеры абстрактным описаниям', en: 'I prefer concrete examples over abstract descriptions' } },
      { value: 'confused', label: { ru: 'Абстрактные концепции меня запутывают', en: 'Abstract concepts confuse me' } },
    ],
  },
  {
    id: 'C9', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Каковы ваши отношения с технологиями в повседневной жизни?',
      en: 'What is your general relationship with technology in daily life?',
    },
    options: [
      { value: 'avoid', label: { ru: 'Избегаю новых технологий насколько возможно', en: 'I avoid new tech as much as possible' } },
      { value: 'must', label: { ru: 'Использую технологии, только когда совсем необходимо', en: 'I use tech when I absolutely have to' } },
      { value: 'sometimes', label: { ru: 'Время от времени пробую новые приложения', en: 'I try new apps every now and then' } },
      { value: 'early', label: { ru: 'Часто одним(одной) из первых среди знакомых пробую новое', en: "I'm often one of the first among my friends to try new technology" } },
    ],
  },
  {
    id: 'C10', module: 'C', format: 'text', required: false,
    prompt: {
      ru: 'Пробовали ли вы раньше настроить какой-то ИИ-инструмент или процесс и бросили? Что произошло?',
      en: 'Have you tried to set up any AI tool or workflow in the past and given up? What happened?',
    },
  },
  {
    id: 'OS', module: 'C', format: 'single', required: true,
    prompt: {
      ru: 'Какую операционную систему вы используете на основном компьютере?',
      en: 'Which operating system do you use on your main computer?',
    },
    options: [
      { value: 'mac', label: { ru: 'macOS (Mac)', en: 'macOS (Mac)' } },
      { value: 'windows', label: { ru: 'Windows', en: 'Windows' } },
      { value: 'linux', label: { ru: 'Linux', en: 'Linux' } },
    ],
  },

  // ─── Module D — Your Learning Style ───────────────────────────────────────
  {
    id: 'D1', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы учитесь чему-то новому, как вы предпочитаете начинать?',
      en: 'When you learn something new, how do you prefer to get started?',
    },
    options: [
      { value: 'video_copy', label: { ru: 'Смотрю видео и шаг за шагом повторяю то, что вижу', en: 'Watch a video and copy what I see step by step' } },
      { value: 'read_try', label: { ru: 'Читаю руководство, а потом пробую сам(а)', en: 'Read a guide and then try it myself' } },
      { value: 'jump_in', label: { ru: 'Сразу погружаюсь и разбираюсь по ходу', en: 'Jump straight in and figure it out as I go' } },
      { value: 'walk_through', label: { ru: 'Хочу, чтобы кто-то провёл меня вживую', en: 'Have someone walk me through it live' } },
    ],
  },
  {
    id: 'D2', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Как долго вы можете комфортно сосредоточенно изучать что-то совершенно новое, прежде чем нужен перерыв?',
      en: 'How long can you comfortably focus on learning something completely new before you need a break?',
    },
    options: [
      { value: '5_10', label: { ru: '5–10 минут', en: '5–10 minutes' } },
      { value: '15_20', label: { ru: '15–20 минут', en: '15–20 minutes' } },
      { value: '30_45', label: { ru: '30–45 минут', en: '30–45 minutes' } },
      { value: '60_plus', label: { ru: '60 минут или больше', en: '60 minutes or more' } },
    ],
  },
  {
    id: 'D3', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Когда урок вводит 3–4 новых концепции подряд, что происходит у вас?',
      en: 'When a lesson introduces 3–4 new concepts in a row, what happens for you?',
    },
    options: [
      { value: 'absorb', label: { ru: 'Усваиваю их все без проблем', en: 'I absorb all of them without trouble' } },
      { value: 'tired', label: { ru: 'Успеваю, но начинаю уставать', en: 'I keep up but start getting tired' } },
      { value: 'lose', label: { ru: 'Теряю нить после второй', en: 'I lose track after the second one' } },
      { value: 'rewatch', label: { ru: 'Останавливаюсь и пересматриваю', en: 'I stop and rewatch' } },
      { value: 'giveup', label: { ru: 'Сдаюсь и иду дальше', en: 'I give up and move on' } },
    ],
  },
  {
    id: 'D4', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Что вы предпочитаете: короткие, частые занятия (10–15 мин ежедневно) — ИЛИ — длинные, нечастые занятия (45–60 мин, 2–3 раза в неделю)?',
      en: 'Do you prefer: shorter, more frequent sessions (10–15 min daily) — OR — longer, less frequent sessions (45–60 min, 2–3 times per week)?',
    },
    options: [
      { value: 'short_frequent', label: { ru: 'Короткие и частые', en: 'Short and frequent' } },
      { value: 'long_infrequent', label: { ru: 'Длинные и нечастые', en: 'Long and infrequent' } },
      { value: 'no_pref', label: { ru: 'Без предпочтений', en: 'I have no preference' } },
    ],
  },
  {
    id: 'D5', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Как вы лучше всего запоминаете то, чему научились?',
      en: 'How do you best remember what you\'ve learned?',
    },
    options: [
      { value: 'do_now', label: { ru: 'Делая это сразу после урока', en: 'By doing it immediately after the lesson' } },
      { value: 'notes', label: { ru: 'Делая заметки', en: 'By taking notes' } },
      { value: 'teach', label: { ru: 'Объясняя или обучая кого-то другого', en: 'By teaching or explaining it to someone else' } },
      { value: 'review', label: { ru: 'Возвращаясь к материалу через несколько дней', en: 'By coming back to review it a few days later' } },
      { value: 'depends', label: { ru: 'Зависит от темы', en: 'It depends on the topic' } },
    ],
  },
  {
    id: 'D6', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы застреваете на техническом шаге, что вы делаете первым делом?',
      en: 'When you get stuck on a technical step, what do you do first?',
    },
    options: [
      { value: 'search', label: { ru: 'Ищу в Google или YouTube', en: 'Search Google or YouTube' } },
      { value: 'ask_friend', label: { ru: 'Спрашиваю друга или коллегу', en: 'Ask a friend or colleague' } },
      { value: 'ask_ai', label: { ru: 'Спрашиваю ИИ-чат-бота', en: 'Ask an AI chatbot' } },
      { value: 'keep_trying', label: { ru: 'Продолжаю пробовать, пока не получится', en: 'Keep trying until it works' } },
      { value: 'skip', label: { ru: 'Сдаюсь и пропускаю', en: 'Give up and skip it' } },
    ],
  },
  {
    id: 'D7', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Сколько новых инструментов вам комфортно осваивать за одну неделю?',
      en: 'How many new tools are you comfortable learning to use in a single week?',
    },
    options: [
      { value: 'one', label: { ru: 'Всего 1', en: 'Just 1' } },
      { value: 'two_three', label: { ru: '2–3', en: '2–3' } },
      { value: 'four_five', label: { ru: '4–5', en: '4–5' } },
      { value: 'many', label: { ru: 'Сколько потребуется', en: 'As many as it takes' } },
    ],
  },
  {
    id: 'D8', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Если урок просит установить программу или настроить новое приложение на компьютере, как вы себя чувствуете?',
      en: 'If a lesson asks you to install software or set up a new application on your computer, how do you feel?',
    },
    options: [
      { value: 'confident', label: { ru: 'Полностью уверенно — без проблем', en: 'Completely confident — no problem' } },
      { value: 'nervous', label: { ru: 'Нервно, но я бы попробовал(а)', en: "Nervous, but I'd try" } },
      { value: 'detailed', label: { ru: 'Мне нужна очень подробная пошаговая помощь', en: "I'd need very detailed step-by-step help" } },
      { value: 'ask_other', label: { ru: 'Попросил(а) бы кого-то сделать это', en: "I'd ask someone else to do it" } },
    ],
  },
  {
    id: 'D9', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'После учебной сессии сколько обычно проходит времени, прежде чем вы действительно пробуете применить выученное?',
      en: 'After a learning session, how long does it usually take before you actually try to apply what you learned?',
    },
    options: [
      { value: 'e0', label: { ru: 'Часто вообще не применяю сразу', en: "I often don't apply it right away" } },
      { value: 'e1', label: { ru: 'В течение недели', en: 'Within a week' } },
      { value: 'e2', label: { ru: 'В течение 1–3 дней', en: 'Within 1–3 days' } },
      { value: 'e3', label: { ru: 'В тот же день', en: 'Within the same day' } },
    ],
  },
  {
    id: 'D10', module: 'D', format: 'single', required: true,
    prompt: {
      ru: 'Как вы себя чувствуете, когда инструкции пропускают шаги, предполагая, что вы уже знаете то, чего на самом деле не знаете?',
      en: 'How do you feel when instructions skip steps, assuming you already know something you actually don\'t?',
    },
    options: [
      { value: 'fill_gaps', label: { ru: 'Обычно могу сам(а) заполнить пробелы', en: 'I can usually fill in the gaps myself' } },
      { value: 'push_through', label: { ru: 'Это меня раздражает, но я продавливаю', en: 'It bothers me but I push through' } },
      { value: 'lost', label: { ru: 'Полностью теряюсь и останавливаюсь', en: 'I get completely lost and stop' } },
      { value: 'depends', label: { ru: 'Зависит от темы', en: 'It depends on the topic' } },
    ],
  },

  // ─── Module E — Your Energy & Drive ───────────────────────────────────────
  {
    id: 'E1', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Какой процент онлайн-курсов или программ, которые вы начинали, вы реально завершили?',
      en: 'What percentage of online courses or programs you\'ve started have you actually completed?',
    },
    options: [
      { value: 'e0', label: { ru: '0–20%', en: '0–20%' } },
      { value: 'e1', label: { ru: '20–50%', en: '20–50%' } },
      { value: 'e2', label: { ru: '50–80%', en: '50–80%' } },
      { value: 'e3', label: { ru: '80–100%', en: '80–100%' } },
    ],
  },
  {
    id: 'E2', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Что обычно заставляет вас бросить курс, не закончив?',
      en: 'What usually makes you stop a course before finishing?',
    },
    options: [
      { value: 'e0', label: { ru: 'Становится слишком сложно', en: 'It gets too hard' } },
      { value: 'e1', label: { ru: 'Жизнь становится слишком занятой', en: 'Life gets too busy' } },
      { value: 'e2', label: { ru: 'Получаю нужное раньше и остальное мне не нужно / никогда не бросаю', en: "I got what I needed early, or I never stop courses once I start" } },
      { value: 'e3', label: { ru: 'Теряю мотивацию', en: 'I lose motivation' } },
    ],
  },
  {
    id: 'E3', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы учитесь чему-то новому, какой опыт надёжнее всего держит вас в движении?',
      en: 'When learning something new, which experience most reliably keeps you going?',
    },
    options: [
      { value: 'quick', label: { ru: 'Быстрые, видимые результаты', en: 'Seeing fast, visible results' } },
      { value: 'slow', label: { ru: 'Ощущение прогресса, пусть и медленного', en: "Feeling I'm making progress, even slowly" } },
      { value: 'community', label: { ru: 'Быть частью группы, идущей тем же путём', en: "Being part of a group who's on the same journey" } },
    ],
  },
  {
    id: 'E4', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Насколько вам важен чёткий пошаговый путь против свободы исследовать и экспериментировать?',
      en: 'How important is it to you to have a clear step-by-step path vs. freedom to explore and experiment?',
    },
    options: [
      { value: 'high', label: { ru: 'Мне абсолютно нужен чётко проложенный путь', en: 'I absolutely need a clear path laid out for me' } },
      { value: 'mid', label: { ru: 'Сочетание пути и свободы', en: 'A mix of a path and freedom' } },
      { value: 'low', label: { ru: 'Я сильно предпочитаю исследовать свободно', en: 'I strongly prefer to explore freely' } },
    ],
  },
  {
    id: 'E5', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Сколько времени в неделю вы реально можете уделять этому курсу?',
      en: 'How much time per week can you realistically dedicate to this course?',
    },
    options: [
      { value: 'lt2h', label: { ru: '1–2 часа', en: '1–2 hours' } },
      { value: 'h2_5', label: { ru: '3–5 часов', en: '3–5 hours' } },
      { value: 'h5_plus', label: { ru: '6 часов или больше', en: '6+ hours' } },
    ],
  },
  {
    id: 'E6', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Вы предпочли бы учиться в одиночку или вместе с другими людьми на той же ступени?',
      en: 'Would you prefer to learn alone, or alongside other people at the same stage as you?',
    },
    options: [
      { value: 'alone', label: { ru: 'В одиночку — мне лучше работается самостоятельно', en: 'Alone — I work better independently' } },
      { value: 'group', label: { ru: 'В группе — я заряжаюсь от других', en: 'With a group — I get energy from others' } },
      { value: 'mix', label: { ru: 'Сочетание того и другого', en: 'A mix of both' } },
    ],
  },
  {
    id: 'E7', module: 'E', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы достигаете чего-то по-настоящему трудного для вас, как долго обычно держится прилив мотивации?',
      en: 'When you accomplish something that was genuinely difficult for you, how long does the motivation boost typically last?',
    },
    options: [
      { value: 'e0', label: { ru: 'Всего несколько часов', en: 'Just a few hours' } },
      { value: 'e1', label: { ru: 'День или два', en: 'A day or two' } },
      { value: 'e2', label: { ru: 'Около недели', en: 'About a week' } },
      { value: 'e3', label: { ru: 'Долго — я набираю инерцию и иду дальше', en: 'A long time — I build momentum and keep going' } },
    ],
  },

  // ─── Module F — Your Business Context ─────────────────────────────────────
  {
    id: 'F1', module: 'F', format: 'single', required: true,
    prompt: {
      ru: 'Что лучше всего описывает вашу рабочую ситуацию?',
      en: 'What best describes your work situation?',
    },
    options: [
      { value: 'solo', label: { ru: 'Самозанятый специалист', en: 'Solo practitioner' } },
      { value: 'small_biz', label: { ru: 'Владелец малого бизнеса', en: 'Small business owner' } },
      { value: 'freelancer', label: { ru: 'Фрилансер', en: 'Freelancer' } },
      { value: 'employee', label: { ru: 'Сотрудник компании', en: 'Employee at a company' } },
      { value: 'student', label: { ru: 'Студент', en: 'Student' } },
      { value: 'other', label: { ru: 'Другое', en: 'Other' } },
    ],
  },
  {
    id: 'F2', module: 'F', format: 'single', required: true,
    prompt: {
      ru: 'Что из этого лучше всего описывает то, чем вы занимаетесь? (Выберите наиболее близкое.)',
      en: 'Which of these best describes what you do? (Select the closest match.)',
    },
    options: [
      { value: 'coach', label: { ru: 'Коуч или психотерапевт', en: 'Coach or therapist' } },
      { value: 'massage', label: { ru: 'Массажист или телесный практик', en: 'Massage or bodywork practitioner' } },
      { value: 'astrology', label: { ru: 'Астрология или духовные услуги', en: 'Astrology or spiritual services' } },
      { value: 'content', label: { ru: 'Контент-мейкер или инфлюенсер', en: 'Content creator or influencer' } },
      { value: 'ecommerce', label: { ru: 'Продавец в e-commerce', en: 'E-commerce seller' } },
      { value: 'service', label: { ru: 'Сервисный бизнес (другой)', en: 'Service business (other)' } },
      { value: 'tech', label: { ru: 'Технический специалист', en: 'Tech professional' } },
      { value: 'other', label: { ru: 'Другое — опишите', en: 'Other — please describe' } },
    ],
  },
  {
    id: 'F3', module: 'F', format: 'text', required: false,
    prompt: {
      ru: 'Какой один ИИ-результат напрямую принёс бы вам деньги или сэкономил значительное время в ближайшие 60 дней?',
      en: 'What is the one AI outcome that would most directly make you money or save you significant time in the next 60 days?',
    },
  },
  {
    id: 'F4', module: 'F', format: 'single', required: true,
    prompt: {
      ru: 'У вас есть команда или вы работаете полностью в одиночку?',
      en: 'Do you have a team, or are you working completely solo?',
    },
    options: [
      { value: 'solo', label: { ru: 'Полностью один(одна) — только я', en: 'Fully solo — just me' } },
      { value: 'helpers', label: { ru: 'У меня 1–2 помощника', en: 'I have 1–2 helpers' } },
      { value: 'small', label: { ru: 'Небольшая команда из 3–10 человек', en: 'Small team of 3–10' } },
      { value: 'large', label: { ru: 'Крупная организация', en: 'Larger organization' } },
    ],
  },
  {
    id: 'F5', module: 'F', format: 'single', required: true,
    prompt: {
      ru: 'Есть ли конкретный дедлайн или предстоящее событие, которое движет вашим обучением ИИ? (Например: запуск новой услуги, редизайн сайта, предстоящая кампания.)',
      en: 'Is there a specific deadline or upcoming event driving your AI learning? (For example: launching a new service, a website rebrand, an upcoming campaign.)',
    },
    options: [
      { value: 'yes', label: { ru: 'Да (опишите)', en: 'Yes (please describe)' } },
      { value: 'no', label: { ru: 'Нет, конкретного дедлайна нет', en: 'No, no specific deadline' } },
    ],
  },

  // ─── Module G — Cultural Scaffolding ──────────────────────────────────────
  {
    id: 'G1', module: 'G', format: 'number', required: true,
    prompt: {
      ru: 'В каком году вы родились?',
      en: 'What year were you born?',
    },
  },
  {
    id: 'G2', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'В каком городе или регионе вы находитесь?',
      en: 'What city or region are you in right now?',
    },
    options: [
      { value: 'moscow', label: { ru: 'Москва', en: 'Moscow' } },
      { value: 'spb', label: { ru: 'Санкт-Петербург', en: 'Saint Petersburg' } },
      { value: 'ru_other', label: { ru: 'Другой город России', en: 'Another city in Russia' } },
      { value: 'kz', label: { ru: 'Казахстан', en: 'Kazakhstan' } },
      { value: 'ua', label: { ru: 'Украина', en: 'Ukraine' } },
      { value: 'by', label: { ru: 'Беларусь', en: 'Belarus' } },
      { value: 'cis_other', label: { ru: 'Другая страна СНГ', en: 'Another CIS country' } },
      { value: 'outside_cis', label: { ru: 'За пределами СНГ', en: 'Outside the CIS' } },
    ],
  },
  {
    id: 'G3', module: 'G', format: 'text', required: false,
    prompt: {
      ru: 'Ваш любимый фильм или сериал всех времён? (Только один — тот, что пришёл в голову первым.)',
      en: 'Your all-time favourite film or TV series? (Just one — the first one that comes to mind.)',
    },
  },
  {
    id: 'G4', module: 'G', format: 'text', required: false,
    prompt: {
      ru: 'Назовите одного автора, мыслителя или книгу, которые по-настоящему изменили то, как вы видите мир.',
      en: 'Name one author, thinker, or book that genuinely changed how you see the world.',
    },
  },
  {
    id: 'G5', module: 'G', format: 'text', required: false,
    prompt: {
      ru: 'Какие Telegram-каналы, YouTube-каналы, блогеры или инфлюенсеры вы читаете регулярно? Перечислите до 5.',
      en: 'Which Telegram channels, YouTube channels, bloggers or influencers do you follow regularly? List up to 5.',
    },
  },
  {
    id: 'G6', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы смотрите/читаете/слушаете контент, который вам нравится, — какова типичная длина одного материала?',
      en: 'When you consume content you love, how long is a typical piece?',
    },
    options: [
      { value: 'under3', label: { ru: 'Меньше 3 минут', en: 'Under 3 minutes' } },
      { value: 'm3_10', label: { ru: '3–10 минут', en: '3–10 minutes' } },
      { value: 'm10_30', label: { ru: '10–30 минут', en: '10–30 minutes' } },
      { value: 'm30_60', label: { ru: '30–60 минут', en: '30–60 minutes' } },
      { value: 'longread', label: { ru: 'Люблю лонгриды (1ч+)', en: 'I love long reads (1h+)' } },
    ],
  },
  {
    id: 'G7', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'Какому формату контента вы доверяете больше всего?',
      en: 'Which content format do you trust most?',
    },
    options: [
      { value: 'tutorials', label: { ru: 'Пошаговые туториалы с записью экрана', en: 'Step-by-step tutorials with screen recording' } },
      { value: 'stories', label: { ru: 'Личные истории и кейсы', en: 'Personal stories and case studies' } },
      { value: 'expert', label: { ru: 'Экспертный анализ с данными и источниками', en: 'Expert analysis with data and sources' } },
      { value: 'tips', label: { ru: 'Короткие практичные советы', en: 'Short practical tips' } },
      { value: 'live', label: { ru: 'Живые демо и Q&A', en: 'Live demos and Q&A' } },
      { value: 'recommendations', label: { ru: 'Рекомендации от таких же людей, как я', en: 'Recommendations from people like me' } },
    ],
  },
  {
    id: 'G8', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'Как вам комфортнее, чтобы к вам обращались в сообщениях и уроках?',
      en: 'How do you prefer to be addressed in messages and lessons?',
    },
    options: [
      { value: 'vy', label: { ru: 'Официально (Вы, уважаемый/ая…)', en: 'Formally (polite, respectful)' } },
      { value: 'ty', label: { ru: 'По-свойски (ты, привет!)', en: 'Casually (first-name, friendly)' } },
      { value: 'playful', label: { ru: 'Игриво (с юмором и эмодзи)', en: 'Playfully (with humor and emoji)' } },
      { value: 'terse', label: { ru: 'Кратко и по делу', en: 'Short and to the point' } },
      { value: 'adaptive', label: { ru: 'По-разному в зависимости от контекста', en: 'It varies depending on context' } },
    ],
  },
  {
    id: 'G9', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'Выберите мир, в котором вы хотели бы проходить свой путь обучения:',
      en: "Pick the world you'd want your learning journey to look like:",
    },
    options: [
      { value: 'slavic-myth', label: { ru: 'Славянский миф', en: 'Slavic Myth' } },
      { value: 'dark-fantasy', label: { ru: 'Тёмное фэнтези', en: 'Dark Fantasy' } },
      { value: 'cyber-noir', label: { ru: 'Кибер-нуар', en: 'Cyber Noir' } },
      { value: 'space-opera', label: { ru: 'Космическая опера', en: 'Space Opera' } },
      { value: 'anime-quest', label: { ru: 'Аниме-квест', en: 'Anime Quest' } },
      { value: 'soviet-heroic', label: { ru: 'Советский героизм', en: 'Soviet Heroic' } },
      { value: 'mystic-arcane', label: { ru: 'Мистическая Аркана', en: 'Mystic Arcane' } },
    ],
  },
  {
    id: 'G10', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'Когда вы успешно освоили что-то сложное — как вам нравится это отмечать?',
      en: 'When you successfully learn something hard, how do you like to mark it?',
    },
    options: [
      { value: 'share', label: { ru: 'Делюсь с кем-нибудь', en: 'I share it with someone' } },
      { value: 'note', label: { ru: 'Записываю для себя', en: 'I write it down for myself' } },
      { value: 'buy', label: { ru: 'Покупаю себе что-нибудь', en: 'I buy myself something' } },
      { value: 'move_on', label: { ru: 'Просто двигаюсь дальше', en: 'I just move on' } },
      { value: 'public', label: { ru: 'Хочу публичного признания', en: 'I want public recognition' } },
      { value: 'inner', label: { ru: 'Переживаю это про себя', en: 'I process it privately' } },
    ],
  },
  {
    id: 'G11', module: 'G', format: 'text', required: false,
    prompt: {
      ru: 'Есть ли человек в вашей жизни — реальный или вымышленный — которым вы втайне хотите стать больше после окончания курса?',
      en: 'Is there a person — real or fictional — you secretly want to be more like after finishing this course?',
    },
  },
  {
    id: 'G12', module: 'G', format: 'single', required: true,
    prompt: {
      ru: 'На каком языке вам удобнее получать материалы курса и сообщения?',
      en: 'What language do you prefer for course materials and communications?',
    },
    options: [
      { value: 'ru', label: { ru: 'Только русский', en: 'Russian only' } },
      { value: 'en', label: { ru: 'Только английский', en: 'English only' } },
      { value: 'ru-tech', label: { ru: 'Русский с английскими техническими терминами там, где это стандарт', en: 'Russian with standard English technical terms' } },
      { value: 'mix', label: { ru: 'Смесь — мне всё равно', en: "A mix — I don't mind" } },
    ],
  },
]
