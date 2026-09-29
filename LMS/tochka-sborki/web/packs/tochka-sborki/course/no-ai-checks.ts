// packs/tochka-sborki/course/no-ai-checks.ts
//
// «Проверь себя без ИИ» «Точки Сборки» (BACKLOG «Педагогика 5», intake LMS#20): в конце практик, где ученик
// работает с агентом (чат, Claude Code, Role Play). Вопросы — своими словами, опорные пункты — из материала
// юнита и модуля. Метка в practice — <NoAiCheck id="…"/>; пояснение «зачем» и гварды — движок
// (lib/no-ai-check.ts, lib/no-ai-check.test.ts).
import type { NoAiCheckData } from '../../../lib/no-ai-check'

export const NO_AI_CHECKS: NoAiCheckData[] = [
  {
    module: '00-kickstart',
    unit: 'u1-map',
    id: 'no-ai',
    questions: [
      {
        question: {
          ru: 'Своими словами: как в vibe coding делится работа между тобой и агентом?',
          en: 'In your own words: how is the work split between you and the agent in vibe coding?',
        },
        points: [
          { ru: 'Ты знаешь, что должно получиться, и решаешь, что строить', en: 'You know what the result should be and decide what to build' },
          { ru: 'Код пишет агент: исполнение можно отдать', en: 'The agent writes the code: execution can be handed off' },
          { ru: 'Проверяешь, что результат работает, ты, а не агент', en: 'You, not the agent, check that the result works' },
        ],
      },
    ],
  },
  {
    module: '04-prompt-engineering',
    unit: 'u2-spec-formula',
    id: 'no-ai',
    questions: [
      {
        question: {
          ru: 'Не подглядывая: назови пять разделов полной структуры промпта и что стоит в каждом.',
          en: 'Without looking: name the five sections of the full prompt structure and what goes in each.',
        },
        points: [
          { ru: 'Роль — экспертиза и специализация', en: 'Role — expertise and specialization' },
          { ru: 'Задача — конкретная цель одним предложением', en: 'Task — a specific goal in one sentence' },
          { ru: 'Входные данные — что ты даёшь: файлы, ссылки, данные, контекст', en: 'Inputs — what you provide: files, URLs, data, context' },
          { ru: 'Ожидаемый результат — формат, структура, объём; Ограничения — чего не делать и какие рамки', en: 'Expected output — format, structure, length; Constraints — what not to do and which limits apply' },
        ],
      },
      {
        question: {
          ru: 'Почему автоматизация идёт только после того, как задачу получается написать и проверить?',
          en: 'Why does automation come only after you can write and check the task?',
        },
        points: [
          { ru: 'Порядок ступеней: воображение, потом задача, потом автоматизация', en: 'The order of steps: imagination, then the task, then automation' },
          { ru: 'Если перепрыгнуть ступень, автоматизируешь собственную растерянность', en: 'Skip a step and you automate your own confusion' },
        ],
      },
    ],
  },
  {
    module: '05-context-memory',
    unit: 'u4-practice',
    id: 'no-ai',
    questions: [
      {
        question: {
          ru: 'Агент ошибся, ты поправил. Куда запишешь правило и почему не стоит ждать, что агент запомнит сам?',
          en: 'The agent made a mistake and you fixed it. Where do you write the rule, and why not wait for the agent to remember on its own?',
        },
        points: [
          { ru: 'В раздел «Правила» в AGENTS.md', en: 'In the “Rules” section of AGENTS.md' },
          { ru: 'Что запомнить в MEMORY.md, Claude решает сам; правило, которое должно работать наверняка, пишешь ты', en: 'Claude decides on its own what goes into MEMORY.md; a rule that must hold for sure is one you write yourself' },
        ],
      },
      {
        question: {
          ru: 'Чем уточнение обычным сообщением отличается от вопроса через /btw?',
          en: 'How does a clarification sent as a normal message differ from a question asked via /btw?',
        },
        points: [
          { ru: 'Обычное сообщение попадает в историю разговора, и агент учитывает его дальше', en: 'A normal message goes into the conversation history, and the agent uses it later' },
          { ru: '/btw — побочный вопрос: в историю разговора он не попадает', en: '/btw is a side question: it is not added to the conversation history' },
        ],
      },
    ],
  },
  {
    module: '06-audio-pipeline',
    unit: 'u3-build',
    id: 'no-ai',
    questions: [
      {
        question: {
          ru: 'Опиши своими словами цепочку, которую ты только что запустил: что на входе, какие шаги, что на выходе.',
          en: 'Describe in your own words the chain you just ran: what goes in, which steps, what comes out.',
        },
        points: [
          { ru: 'На входе — ссылка или текст реальной статьи', en: 'In: a link to, or the text of, a real article' },
          { ru: 'Шаги — промпт из Концепции: идеи, темы для изучения, цитаты в заданном формате', en: 'Steps: the prompt from Concept — ideas, topics to explore, quotes in a set format' },
          { ru: 'На выходе — файл с результатом и сохранённый промпт для следующего раза', en: 'Out: a file with the result and the saved prompt for next time' },
        ],
      },
      {
        question: {
          ru: 'Какое одно место провисло при первом прогоне и что изменишь во второй версии?',
          en: 'Which one spot sagged on the first run, and what will you change in version two?',
        },
        points: [
          { ru: 'Первый прогон — черновой монтаж: он показывает, где цепочка проседает', en: 'The first run is a rough cut: it shows where the chain sags' },
          { ru: 'Одно найденное слабое место и есть план второй версии', en: 'The one weak spot you found is the plan for version two' },
          { ru: 'Если ссылка не открылась, ответ «по догадке» не принимают: вставляют текст статьи', en: 'If the link did not open, a guessed answer does not count: paste the article text instead' },
        ],
      },
    ],
  },
  {
    module: '08-agent-engineering',
    unit: 'u5-practice',
    id: 'no-ai',
    questions: [
      {
        question: {
          ru: 'Не открывая спеку: какие узлы твоего агента — LLM, какие — нет, и почему так?',
          en: 'Without opening the spec: which nodes of your agent are LLM nodes, which are not, and why?',
        },
        points: [
          { ru: 'AI — там, где он силён: классификация, текст-в-структуру', en: 'AI goes where it shines: classification, text-to-structure' },
          { ru: 'Точный счёт, проверка дублей, вызовы API — код или инструмент', en: 'Exact counting, duplicate checks, API calls — code or a tool' },
          { ru: 'Чего не знаешь, то в спеке стоит как [?], а не догадкой', en: 'What you do not know stays in the spec as [?], not as a guess' },
        ],
      },
      {
        question: {
          ru: 'Назови один failure mode своего агента и где ты его увидишь.',
          en: 'Name one failure mode of your agent and where you will see it.',
        },
        points: [
          { ru: 'В спеке описано, что сломается и что тогда происходит', en: 'The spec says what breaks and what happens then' },
          { ru: 'Указано, где смотреть трейсы', en: 'It says where to look at traces' },
        ],
      },
    ],
  },
]
