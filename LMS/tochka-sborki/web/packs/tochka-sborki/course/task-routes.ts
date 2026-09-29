// packs/tochka-sborki/course/task-routes.ts
//
// Закрытый каталог «русел задачи» (развилка онбординга «криэйтор / предприниматель» + сквозная задача
// через курс; BACKLOG.md, решение владельца 2026-09-14; спека docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md).
// Логика — lib/intake/task-route.ts (движок); здесь — course-data: русла, их шаги по юнитам ЭТОГО курса,
// ложные дороги, уточняющие вопросы и тексты шага. Черновик: формулировки и состав каталога — на вычитку владельцем.
//
// Воркер читает этот файл (каталог для классификатора) — импорты только ОТНОСИТЕЛЬНЫЕ (Gotcha 2).
// Гварды (lib/intake/task-route.test.ts): каждый unit есть в контенте; шаги идут по модулям без возвратов;
// у каждого русла есть результат и ложная дорога; ключи уточняющих вопросов ⊂ каталог.
import type { Locale } from '../../../lib/intake/types'
import type { ClarifyQuestion, TaskRoute } from '../../../lib/intake/task-route'

type L = Record<Locale, string>

/** Шаг 0 любого русла (LMS#10): вердикт анкеты «Стоит ли автоматизировать?» + карта автоматизации модуля 06. */
const CHECK = { unit: '06-audio-pipeline/u4-reflect' }

export const TASK_ROUTES: TaskRoute[] = [
  {
    key: 'content-pipeline',
    roles: ['creator', 'entrepreneur'],
    title: { ru: 'Контент-пайплайн', en: 'Content pipeline' },
    summary: {
      ru: 'Одна идея на входе — серия готовых материалов в твоём голосе на выходе.',
      en: 'One idea in — a series of ready pieces in your voice out.',
    },
    classifierHint:
      'Recurring production of content: posts, articles, newsletters, video scripts, social media series, marketing content for a business (e.g. content for a mortgage or real-estate business). The steps are the same every time, even if the learner calls it "agents" or "a system".',
    check: CHECK,
    steps: [
      {
        unit: '04-prompt-engineering/u2-spec-formula',
        title: { ru: 'Эталон одного материала', en: 'One reference piece' },
        action: {
          ru: 'Опиши по формуле спецификации один эталонный материал: для кого, какой формат, какой тон, пример удачного.',
          en: 'Use the spec formula to describe one reference piece: who it is for, format, tone, an example that worked.',
        },
      },
      {
        unit: '05-context-memory/u3-memory',
        title: { ru: 'Голос и факты — в память', en: 'Voice and facts into memory' },
        action: {
          ru: 'Вынеси голос, факты о продукте и запреты в память, чтобы не объяснять их в каждом запросе.',
          en: 'Move your voice, product facts and no-gos into memory so you stop re-explaining them every time.',
        },
      },
      {
        unit: '06-audio-pipeline/u2-pipeline-theory',
        title: { ru: 'Разложи на trigger → action', en: 'Break it into trigger → action' },
        action: {
          ru: 'Опиши конвейер: что его запускает, какие шаги (план → черновики серии → адаптация под площадки), когда не запускать.',
          en: 'Describe the pipeline: what starts it, which steps (plan → series drafts → per-channel versions), when not to run.',
        },
      },
      {
        unit: '06-audio-pipeline/u3-build',
        title: { ru: 'Собери и прогони вручную', en: 'Build it and run it by hand' },
        action: {
          ru: 'Прогони конвейер руками на одной идее и найди звено, которое провисает.',
          en: 'Run the pipeline by hand on one idea and find the link that sags.',
        },
      },
      {
        unit: '07-tools/u4-skills',
        title: { ru: 'Упакуй в skill', en: 'Package it as a skill' },
        action: {
          ru: 'Сделай из конвейера skill, который запускается одной командой.',
          en: 'Turn the pipeline into a skill that runs with one command.',
        },
      },
    ],
    falseRoad: {
      title: {
        ru: 'Мультиагентная оркестрация («агент-писатель, агент-редактор, агент-SMM»)',
        en: 'Multi-agent orchestration ("a writer agent, an editor agent, an SMM agent")',
      },
      why: {
        ru: 'Порядок шагов здесь известен заранее и каждый раз один и тот же — это пайплайн, а не оркестрация. Оркестрация (модуль 08) нужна, когда шаги сами решают, что делать дальше. Не оркестрация — пайплайн: 04 → 05 → 06 → 07.',
        en: 'The order of steps is known in advance and is the same every time — that is a pipeline, not orchestration. Orchestration (module 08) is for when the steps decide what to do next. Not orchestration — a pipeline: 04 → 05 → 06 → 07.',
      },
    },
    result: {
      ru: 'Работающий контент-конвейер под «{outcome}»: одна идея на входе — серия черновиков в твоём голосе на выходе; ты проверяешь и публикуешь.',
      en: 'A working content pipeline for "{outcome}": one idea in — a series of drafts in your voice out; you review and publish.',
    },
  },
  {
    key: 'landing-funnel',
    roles: ['creator', 'entrepreneur'],
    title: { ru: 'Лендинг и воронка', en: 'Landing page and funnel' },
    summary: {
      ru: 'Страница с одним целевым действием и заявки, которые доходят до тебя.',
      en: 'A page with one target action and leads that actually reach you.',
    },
    classifierHint:
      'A landing page, website, sales page, sign-up or order form, lead-capture funnel, a simple web page or app for customers.',
    check: CHECK,
    steps: [
      {
        unit: '02-setup-guide/u3-first-project',
        title: { ru: 'Проект страницы в агенте', en: 'The page as a project in your agent' },
        action: {
          ru: 'Заведи проект страницы в своём агенте и получи черновой каркас.',
          en: 'Start the page as a project in your agent and get a rough skeleton.',
        },
      },
      {
        unit: '04-prompt-engineering/u2-spec-formula',
        title: { ru: 'ТЗ страницы по формуле', en: 'Page spec by the formula' },
        action: {
          ru: 'Опиши оффер, аудиторию, блоки страницы и одно целевое действие — заявку или покупку.',
          en: 'Describe the offer, the audience, the page blocks and one target action — a lead or a purchase.',
        },
      },
      {
        unit: '04-prompt-engineering/u5-practice',
        title: { ru: 'Тексты блоков', en: 'Copy for the blocks' },
        action: {
          ru: 'Собери профессиональный промпт для текстов блоков и прогони его на своём оффере.',
          en: 'Build a professional prompt for the block copy and run it on your offer.',
        },
      },
      {
        unit: '07-tools/u2-mcp',
        title: { ru: 'Заявки — в таблицу или CRM', en: 'Leads into a sheet or CRM' },
        action: {
          ru: 'Подключи через MCP место, куда падают заявки с формы.',
          en: 'Connect the place where form leads land, via MCP.',
        },
      },
      {
        unit: '08-agent-engineering/u4-production-infra',
        title: { ru: 'Из прототипа — в прод', en: 'From prototype to production' },
        action: {
          ru: 'Опубликуй страницу и проверь путь заявки от формы до тебя.',
          en: 'Publish the page and test the path of a lead from the form to you.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Сначала выучить вёрстку и программирование', en: 'Learn HTML and programming first' },
      why: {
        ru: 'Для лендинга не нужен курс вёрстки: нужна точная спецификация и агент, который собирает по ней страницу. Код пишет агент, решения и проверка — за тобой.',
        en: 'A landing page does not need a coding course: it needs a precise spec and an agent that builds the page from it. The agent writes the code; decisions and review are yours.',
      },
    },
    result: {
      ru: 'Опубликованная страница под «{outcome}» с формой, заявки с которой приходят тебе в таблицу или почту.',
      en: 'A published page for "{outcome}" with a form whose leads reach you in a sheet or your inbox.',
    },
  },
  {
    key: 'reports-routine',
    roles: ['entrepreneur'],
    title: { ru: 'Автоматизация отчётов и рутины', en: 'Reports and routine automation' },
    summary: {
      ru: 'То, что ты собираешь руками каждую неделю, собирается само — ты читаешь итог.',
      en: 'What you assemble by hand every week assembles itself — you read the result.',
    },
    classifierHint:
      'Recurring reports, spreadsheets, data collection, invoices, summaries of numbers, admin routine, sorting email or documents, internal operations of a business.',
    check: CHECK,
    steps: [
      {
        unit: '04-prompt-engineering/u2-spec-formula',
        title: { ru: 'Шаблон результата', en: 'The shape of the result' },
        action: {
          ru: 'Опиши, как выглядит готовый отчёт: разделы, цифры и откуда они берутся.',
          en: 'Describe what the finished report looks like: sections, numbers and where they come from.',
        },
      },
      {
        unit: '06-audio-pipeline/u1-activation',
        title: { ru: 'Найди ручной поток', en: 'Find the manual flow' },
        action: {
          ru: 'Выпиши, откуда сейчас руками собираются данные и сколько это занимает.',
          en: 'Write down where the data is gathered by hand today and how long it takes.',
        },
      },
      {
        unit: '06-audio-pipeline/u3-build',
        title: { ru: 'Собери pipeline и прогони вручную', en: 'Build the pipeline and run it by hand' },
        action: {
          ru: 'Собери цепочку и прогони её руками на прошлой неделе — сверь с тем, что делал сам.',
          en: 'Build the chain and run it by hand on last week — compare with what you did yourself.',
        },
      },
      {
        unit: '07-tools/u2-mcp',
        title: { ru: 'Подключи источники', en: 'Connect the sources' },
        action: {
          ru: 'Подключи через MCP таблицы, почту или CRM, откуда берутся данные.',
          en: 'Connect the sheets, mail or CRM the data comes from, via MCP.',
        },
      },
      {
        unit: '07-tools/u3-hooks',
        title: { ru: 'Запуск по событию или расписанию', en: 'Run on an event or a schedule' },
        action: {
          ru: 'Повесь запуск на событие или расписание и оставь себе проверку итога.',
          en: 'Trigger it on an event or a schedule and keep the final check for yourself.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Автономный агент, который «сам разберётся в данных»', en: 'An autonomous agent that "figures out the data itself"' },
      why: {
        ru: 'Отчёт повторяется по одним и тем же шагам — это pipeline с условиями, а не агент, принимающий решения. Решения по цифрам карта автоматизации оставляет человеку (модуль 06).',
        en: 'The report repeats the same steps — that is a pipeline with conditions, not an agent making decisions. The automation map leaves decisions on the numbers to a human (module 06).',
      },
    },
    result: {
      ru: 'Отчёт или рутина «{outcome}», которые собираются сами по расписанию или событию; ты читаешь итог и принимаешь решения.',
      en: 'The report or routine "{outcome}" assembling itself on a schedule or an event; you read the result and make the calls.',
    },
  },
  {
    key: 'support-booking-bot',
    roles: ['entrepreneur'],
    title: { ru: 'Бот поддержки и записи', en: 'Support and booking bot' },
    summary: {
      ru: 'Типовые вопросы и запись — боту, нетиповое — тебе.',
      en: 'Routine questions and bookings go to the bot, the unusual ones to you.',
    },
    classifierHint:
      'A chatbot for customers: answering client questions, messages or DMs, booking appointments, scheduling clients, reminders, qualifying leads in chat.',
    check: CHECK,
    steps: [
      {
        unit: '04-prompt-engineering/u2-spec-formula',
        title: { ru: 'Правила ответов', en: 'Answering rules' },
        action: {
          ru: 'Опиши, на что бот отвечает, каким тоном и когда обязан позвать тебя.',
          en: 'Describe what the bot answers, in what tone, and when it must call you.',
        },
      },
      {
        unit: '05-context-memory/u2-context-vs-prompt',
        title: { ru: 'База ответов — в контекст', en: 'The answer base as context' },
        action: {
          ru: 'Собери FAQ, прайс и условия в контекст, по которому бот отвечает, — а не в промпт.',
          en: 'Put the FAQ, prices and terms into the context the bot answers from — not into the prompt.',
        },
      },
      {
        unit: '06-audio-pipeline/u2-pipeline-theory',
        title: { ru: 'Поток по событию', en: 'An event-driven flow' },
        action: {
          ru: 'Новое сообщение → черновик ответа → проверка: опиши trigger, action и condition.',
          en: 'New message → draft reply → check: describe the trigger, action and condition.',
        },
      },
      {
        unit: '07-tools/u2-mcp',
        title: { ru: 'Календарь и CRM', en: 'Calendar and CRM' },
        action: {
          ru: 'Подключи через MCP календарь или CRM, чтобы бот мог записывать.',
          en: 'Connect a calendar or CRM via MCP so the bot can book.',
        },
      },
      {
        unit: '08-agent-engineering/u2-jagged-intelligence',
        title: { ru: 'Что не отдавать боту', en: 'What not to hand to the bot' },
        action: {
          ru: 'Отметь вопросы, где ошибка дорогая, — там бот передаёт разговор тебе.',
          en: 'Mark the questions where a mistake is costly — there the bot hands the conversation to you.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Полностью автономный агент-продавец', en: 'A fully autonomous sales agent' },
      why: {
        ru: 'С клиентом цена ошибки высокая. Бот, который отвечает по твоей базе и передаёт нетиповое человеку, надёжнее и быстрее в сборке, чем «ИИ, который ведёт клиентов сам».',
        en: 'With clients a mistake is expensive. A bot that answers from your base and hands the unusual to a human is more reliable and faster to build than "AI that runs clients on its own".',
      },
    },
    result: {
      ru: 'Бот для «{outcome}»: отвечает на типовые вопросы по твоей базе, записывает в календарь, нетиповое передаёт тебе.',
      en: 'A bot for "{outcome}": answers routine questions from your base, books into the calendar, hands the unusual to you.',
    },
  },
  {
    key: 'source-notebook',
    roles: ['creator', 'entrepreneur'],
    title: { ru: 'Тетрадка по своим источникам', en: 'A notebook on your own sources' },
    summary: {
      ru: 'Ответы только по твоим материалам — со ссылкой, откуда взято.',
      en: 'Answers only from your materials — with a link to where it came from.',
    },
    classifierHint:
      'Answering questions from my own documents, notes, books, recordings or transcripts; a knowledge base; research over my own sources; turning my materials into summaries, FAQ, course outlines or scripts.',
    check: CHECK,
    steps: [
      {
        unit: '00-kickstart/u4-sources',
        title: { ru: 'Первоисточники, а не пересказы', en: 'Sources, not retellings' },
        action: {
          ru: 'Собери свои материалы — записи, статьи, документы; первоисточники, а не чужие пересказы.',
          en: 'Gather your materials — recordings, articles, documents; the sources, not other people’s retellings.',
        },
      },
      {
        unit: '09-ai-notebook/u1-first-notebook',
        title: { ru: 'Первая тетрадка', en: 'Your first notebook' },
        action: {
          ru: 'Загрузи источники и задай первые вопросы по своей задаче.',
          en: 'Load the sources and ask the first questions about your task.',
        },
      },
      {
        unit: '09-ai-notebook/u3-where-it-lies',
        title: { ru: 'Проверь, где врёт', en: 'Check where it lies' },
        action: {
          ru: 'Найди ответы без опоры на источник и научись их ловить.',
          en: 'Find the answers with no source behind them and learn to catch them.',
        },
      },
      {
        unit: '09-ai-notebook/u4-formats',
        title: { ru: 'Формат вывода', en: 'Output format' },
        action: {
          ru: 'Выбери формат под задачу: конспект, FAQ, план курса, сценарий.',
          en: 'Pick the format for the task: summary, FAQ, course outline, script.',
        },
      },
      {
        unit: '09-ai-notebook/u5-practice',
        title: { ru: 'Рабочая тетрадка', en: 'A working notebook' },
        action: {
          ru: 'Собери тетрадку под свою задачу целиком и проверь её на трёх настоящих вопросах.',
          en: 'Build the notebook for your task end to end and test it on three real questions.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Дообучить свою модель на своих текстах', en: 'Fine-tune your own model on your texts' },
      why: {
        ru: 'Ответы по источникам дешевле, проверяемы ссылкой и обновляются добавлением файла. Дообучение (модуль 10) меняет манеру модели, но не делает её ответы проверяемыми по твоим материалам.',
        en: 'Answers from sources are cheaper, checkable by a link and updated by adding a file. Fine-tuning (module 10) changes how a model writes, but does not make its answers checkable against your materials.',
      },
    },
    result: {
      ru: 'Тетрадка по твоим материалам для «{outcome}»: отвечает со ссылкой на источник и выдаёт нужный формат.',
      en: 'A notebook on your materials for "{outcome}": answers with a link to the source and gives the format you need.',
    },
  },
  {
    key: 'memory-agent',
    roles: ['creator', 'entrepreneur'],
    title: { ru: 'Агент с памятью', en: 'An agent with memory' },
    summary: {
      ru: 'Помощник, который помнит тебя и твои проекты и не требует вводного инструктажа.',
      en: 'An assistant that remembers you and your projects and needs no briefing every time.',
    },
    classifierHint:
      'A personal AI assistant or "clone" that remembers me, my projects and preferences; a second brain; an assistant that keeps context between sessions.',
    check: CHECK,
    steps: [
      {
        unit: '01-introduction/u3-clones',
        title: { ru: 'Выбери своего клона', en: 'Pick your clone' },
        action: {
          ru: 'Определи, какой из пяти типов клона тебе нужен и что он берёт на себя.',
          en: 'Decide which of the five clone types you need and what it takes over.',
        },
      },
      {
        unit: '04-prompt-engineering/u2-spec-formula',
        title: { ru: 'Роль и границы', en: 'Role and limits' },
        action: {
          ru: 'Опиши роль клона, его задачи и границы по формуле спецификации.',
          en: 'Describe the clone’s role, tasks and limits using the spec formula.',
        },
      },
      {
        unit: '05-context-memory/u3-memory',
        title: { ru: 'Система памяти', en: 'The memory system' },
        action: {
          ru: 'Разложи, что клон должен помнить о тебе и проектах и где это хранится.',
          en: 'Lay out what the clone must remember about you and your projects, and where it is kept.',
        },
      },
      {
        unit: '05-context-memory/u4-practice',
        title: { ru: 'Настрой память', en: 'Tune the memory' },
        action: {
          ru: 'Настрой память и проверь: клон не переспрашивает то, что уже знает.',
          en: 'Set the memory up and check the clone does not re-ask what it already knows.',
        },
      },
      {
        unit: '07-tools/u4-skills',
        title: { ru: 'Навыки клона', en: 'The clone’s skills' },
        action: {
          ru: 'Добавь повторяющиеся действия как skills.',
          en: 'Add the repeated actions as skills.',
        },
      },
      {
        unit: '11-second-brain/u5-practice',
        title: { ru: 'Второй мозг на связи', en: 'A second brain within reach' },
        action: {
          ru: 'Подключи канал связи и один чужой навык — по чек-листу безопасности.',
          en: 'Connect a channel and one skill from someone else — following the security checklist.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Дообучить модель, чтобы она «помнила меня»', en: 'Fine-tune a model so it "remembers me"' },
      why: {
        ru: 'Память агента — это контекст и файлы (модуль 05), а не веса модели. Их можно прочитать, поправить и обновить за минуту; дообучение (модуль 10) так не умеет.',
        en: 'An agent’s memory is context and files (module 05), not model weights. You can read, fix and update them in a minute; fine-tuning (module 10) cannot.',
      },
    },
    result: {
      ru: 'Свой помощник для «{outcome}» с устойчивой памятью о тебе и проектах и набором навыков — без инструктажа в каждом разговоре.',
      en: 'Your own assistant for "{outcome}" with lasting memory of you and your projects and a set of skills — no briefing in every conversation.',
    },
  },
  {
    key: 'multi-agent-orchestration',
    roles: ['creator', 'entrepreneur'],
    title: { ru: 'Мультиагентная оркестрация', en: 'Multi-agent orchestration' },
    summary: {
      ru: 'Несколько агентов с ролями, где следующий шаг зависит от промежуточного результата.',
      en: 'Several agents with roles, where the next step depends on an intermediate result.',
    },
    classifierHint:
      'Genuinely dynamic multi-step work where the next step depends on intermediate results: agents that research and branch, software-building agents, several agents with different roles handing work to each other. NOT for fixed recurring sequences — those are pipelines.',
    check: CHECK,
    steps: [
      {
        unit: '06-audio-pipeline/u3-build',
        title: { ru: 'Сначала — цепочка руками', en: 'First, a chain by hand' },
        action: {
          ru: 'Собери задачу как цепочку шагов вручную: если порядок известен заранее, оркестрация не нужна.',
          en: 'Build the task as a chain of steps by hand: if the order is known in advance, you do not need orchestration.',
        },
      },
      {
        unit: '08-agent-engineering/u1-activation',
        title: { ru: 'Где цепочки не хватает', en: 'Where a chain falls short' },
        action: {
          ru: 'Найди место, где шаг сам должен решать, что делать дальше.',
          en: 'Find the point where a step has to decide what happens next.',
        },
      },
      {
        unit: '08-agent-engineering/u2-jagged-intelligence',
        title: { ru: 'Что отдавать агентам', en: 'What to hand to agents' },
        action: {
          ru: 'Раздели работу: что агентам, что тебе.',
          en: 'Split the work: what goes to agents, what stays with you.',
        },
      },
      {
        unit: '08-agent-engineering/u3-orchestration',
        title: { ru: 'Спроектируй оркестрацию', en: 'Design the orchestration' },
        action: {
          ru: 'Роли агентов, передача результатов между ними, точка проверки человеком.',
          en: 'Agent roles, hand-offs between them, a human checkpoint.',
        },
      },
      {
        unit: '08-agent-engineering/u5-practice',
        title: { ru: 'Собери систему', en: 'Build the system' },
        action: {
          ru: 'Спроектируй и собери свою систему агентов под задачу.',
          en: 'Design and build your agent system for the task.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Начать сразу с оркестрации', en: 'Start with orchestration right away' },
      why: {
        ru: 'Без работающей цепочки шагов оркестрация множит ошибки. Если порядок шагов известен заранее — это пайплайн (модуль 06), и агенты-роли там лишние.',
        en: 'Without a working chain of steps, orchestration multiplies mistakes. If the order of steps is known in advance, it is a pipeline (module 06) and agent roles are overhead.',
      },
    },
    result: {
      ru: 'Система из нескольких агентов для «{outcome}», где шаги сами решают, что дальше, — с точкой проверки человеком.',
      en: 'A system of several agents for "{outcome}" where the steps decide what comes next — with a human checkpoint.',
    },
  },
  {
    key: 'fine-tune-model',
    roles: ['creator', 'entrepreneur'],
    title: { ru: 'Своя дообученная модель', en: 'Your own fine-tuned model' },
    summary: {
      ru: 'Малая модель, дообученная на твоих данных, — и замер, что она правда лучше.',
      en: 'A small model fine-tuned on your data — and a measurement that it really is better.',
    },
    classifierHint:
      'Training or fine-tuning my own model, a custom model on my own data, a model that writes in a specific style at scale, evaluating models.',
    check: CHECK,
    steps: [
      {
        unit: '04-prompt-engineering/u2-spec-formula',
        title: { ru: 'Сначала — промпт', en: 'Prompt first' },
        action: {
          ru: 'Проверь, не решает ли задачу хорошая спецификация.',
          en: 'Check whether a good spec already solves the task.',
        },
      },
      {
        unit: '05-context-memory/u2-context-vs-prompt',
        title: { ru: 'Потом — контекст', en: 'Then context' },
        action: {
          ru: 'Проверь, не решает ли её контекст с примерами.',
          en: 'Check whether context with examples solves it.',
        },
      },
      {
        unit: '10-model-training/u2-data-is-the-work',
        title: { ru: 'Данные', en: 'Data' },
        action: {
          ru: 'Собери и почисти данные — это основная работа.',
          en: 'Collect and clean the data — that is the main work.',
        },
      },
      {
        unit: '10-model-training/u3-fine-tuning',
        title: { ru: 'Дообучение', en: 'Fine-tuning' },
        action: {
          ru: 'Дообучи малую модель на своих данных.',
          en: 'Fine-tune a small model on your data.',
        },
      },
      {
        unit: '10-model-training/u4-evaluation',
        title: { ru: 'Оценка: помогло ли', en: 'Evaluation: did it help' },
        action: {
          ru: 'Сравни дообученную модель с промптом и контекстом на одних и тех же примерах.',
          en: 'Compare the fine-tuned model with prompt plus context on the same examples.',
        },
      },
    ],
    falseRoad: {
      title: { ru: 'Дообучать, не проверив промпт и контекст', en: 'Fine-tune before trying prompt and context' },
      why: {
        ru: 'Чаще всего задачу закрывают промпт (модуль 04) и контекст (модуль 05) — это на порядки дешевле. Дообучение оправдано, когда замер показал, что их не хватает.',
        en: 'Most tasks are solved by a prompt (module 04) and context (module 05) — orders of magnitude cheaper. Fine-tuning pays off once a measurement shows they are not enough.',
      },
    },
    result: {
      ru: 'Дообученная малая модель для «{outcome}» и замер, что на твоих примерах она лучше промпта с контекстом.',
      en: 'A fine-tuned small model for "{outcome}" and a measurement that it beats prompt plus context on your examples.',
    },
  },
]

/** Уточнение при низкой уверенности: три вопроса с готовыми вариантами, у каждого — ключи каталога. */
export const TASK_ROUTE_CLARIFY: ClarifyQuestion[] = [
  {
    id: 'output',
    weight: 2,
    prompt: { ru: 'Что должно получаться на выходе?', en: 'What should come out at the end?' },
    options: [
      { value: 'stream', routes: ['content-pipeline'], label: { ru: 'Поток материалов: посты, статьи, рассылки, сценарии', en: 'A stream of pieces: posts, articles, newsletters, scripts' } },
      { value: 'page', routes: ['landing-funnel'], label: { ru: 'Страница, где люди оставляют заявку или покупают', en: 'A page where people sign up or buy' } },
      { value: 'report', routes: ['reports-routine'], label: { ru: 'Отчёт, таблица, сводка по данным', en: 'A report, a sheet, a summary of data' } },
      { value: 'replies', routes: ['support-booking-bot'], label: { ru: 'Ответы клиентам и запись на приём', en: 'Replies to clients and bookings' } },
      { value: 'answers', routes: ['source-notebook'], label: { ru: 'Ответы по моим материалам и документам', en: 'Answers from my materials and documents' } },
      { value: 'assistant', routes: ['memory-agent'], label: { ru: 'Помощник, который помнит меня и мои дела', en: 'An assistant that remembers me and my work' } },
      { value: 'system', routes: ['multi-agent-orchestration'], label: { ru: 'Система, где несколько агентов делят работу', en: 'A system where several agents split the work' } },
      { value: 'model', routes: ['fine-tune-model'], label: { ru: 'Своя модель, обученная на моих данных', en: 'My own model trained on my data' } },
    ],
  },
  {
    id: 'steps',
    weight: 1,
    prompt: { ru: 'Шаги каждый раз одни и те же?', en: 'Are the steps the same every time?' },
    options: [
      { value: 'fixed', routes: ['content-pipeline', 'reports-routine', 'landing-funnel', 'support-booking-bot'], label: { ru: 'Да, одни и те же шаги по порядку', en: 'Yes, the same steps in order' } },
      { value: 'dynamic', routes: ['multi-agent-orchestration', 'memory-agent'], label: { ru: 'Нет, по ходу нужно решать, что делать дальше', en: 'No, what comes next has to be decided along the way' } },
      { value: 'unsure', routes: [], label: { ru: 'Пока не знаю', en: "Don't know yet" } },
    ],
  },
  {
    id: 'trigger',
    weight: 1,
    prompt: { ru: 'Что запускает работу?', en: 'What starts the work?' },
    options: [
      { value: 'me', routes: ['content-pipeline', 'source-notebook', 'memory-agent', 'fine-tune-model'], label: { ru: 'Я сам, когда нужно', en: 'Me, when I need it' } },
      { value: 'schedule', routes: ['reports-routine', 'content-pipeline'], label: { ru: 'Расписание: каждый день или неделю', en: 'A schedule: every day or week' } },
      { value: 'event', routes: ['support-booking-bot', 'reports-routine'], label: { ru: 'Событие: пришло письмо, заявка, сообщение', en: 'An event: an email, a lead, a message arrives' } },
      { value: 'visitor', routes: ['landing-funnel'], label: { ru: 'Человек заходит на страницу', en: 'A person lands on a page' } },
    ],
  },
]

export interface TaskRouteCopy {
  eyebrow: L
  lead: L
  yourTask: L
  noText: L
  matchButton: L
  matching: L
  matchedLead: L
  unsureLead: L
  clarifyButton: L
  clarifyTie: L
  unavailableLead: L
  manualLead: L
  manualButton: L
  showAll: L
  chooseButton: L
  changeButton: L
  leaderHint: L
  checkTitle: L
  checkBody: L
  stepsHeading: L
  falseRoadLabel: L
  resultLabel: L
  routeHeading: L
  /** Подпись шага в квест-логе: {n} — номер шага. */
  questStepLabel: L
  /** Плашка на странице юнита, который — шаг русла ученика: {n} — номер шага. */
  unitStepLabel: L
  /** Ссылка с плашки юнита на «Личный план обучения». */
  unitPlanLink: L
}

export const TASK_ROUTE_COPY: TaskRouteCopy = {
  eyebrow: { ru: 'Русло задачи', en: 'Your task route' },
  lead: {
    ru: 'Сопоставим твою задачу с руслами, по которым такие задачи реально делаются, — и покажем шаги по модулям курса, ложную дорогу и что будет в конце.',
    en: 'We match your task to the routes such tasks are actually built by — and show the steps through the course modules, the false road and what you end up with.',
  },
  yourTask: { ru: 'Твоя задача:', en: 'Your task:' },
  noText: {
    ru: 'Сначала опиши задачу на прошлом шаге — одной-двумя фразами. Или выбери русло сам.',
    en: 'Describe your task on the previous step first — in a sentence or two. Or pick a route yourself.',
  },
  matchButton: { ru: 'Подобрать русло', en: 'Find my route' },
  matching: { ru: 'Сопоставляю с каталогом…', en: 'Matching against the catalog…' },
  matchedLead: { ru: 'Похоже, твоя задача — это:', en: 'Looks like your task is:' },
  unsureLead: {
    ru: 'Не уверен, какое русло твоё. Три коротких вопроса — и выберем точнее:',
    en: "Not sure which route is yours. Three quick questions and we'll pick more precisely:",
  },
  clarifyButton: { ru: 'Выбрать по ответам', en: 'Pick from my answers' },
  clarifyTie: {
    ru: 'Ответы подходят к нескольким руслам — выбери своё из списка, подходящие отмечены.',
    en: 'Your answers fit several routes — pick yours from the list, the matching ones are marked.',
  },
  unavailableLead: {
    ru: 'Подбор сейчас недоступен — выбери русло сам из списка:',
    en: 'Matching is unavailable right now — pick the route yourself:',
  },
  manualLead: { ru: 'Выбери русло сам:', en: 'Pick the route yourself:' },
  manualButton: { ru: 'Выбрать самому', en: 'Pick it myself' },
  showAll: { ru: 'Показать все русла', en: 'Show all routes' },
  chooseButton: { ru: 'Это моё', en: "That's mine" },
  changeButton: { ru: 'Выбрать другое русло', en: 'Pick another route' },
  leaderHint: { ru: 'подходит по ответам', en: 'fits your answers' },
  checkTitle: { ru: 'Шаг 0. Стоит ли это автоматизировать?', en: 'Step 0. Is it worth automating?' },
  checkBody: {
    ru: 'Прежде чем строить — проверь окупаемость: это следующий шаг анкеты, а карта автоматизации разобрана в юните',
    en: 'Before you build, check the payback: it is the next step of this setup, and the automation map is covered in the unit',
  },
  stepsHeading: { ru: 'Шаги по курсу', en: 'Steps through the course' },
  falseRoadLabel: { ru: 'Ложная дорога:', en: 'The false road:' },
  resultLabel: { ru: 'В конце у тебя:', en: 'What you end up with:' },
  routeHeading: { ru: 'Твоя задача — русло', en: 'Your task — the route' },
  questStepLabel: { ru: 'шаг {n} задачи', en: 'task step {n}' },
  unitStepLabel: { ru: 'Шаг {n} твоей задачи', en: 'Step {n} of your task' },
  unitPlanLink: { ru: 'Весь план', en: 'Full plan' },
}
