// packs/tochka-sborki/course/faded-examples.ts
//
// Faded worked examples «Точки Сборки» (BACKLOG «Педагогика 4», intake LMS#20). Каждый пример собран из
// материала своего юнита: полный разбор берёт пример из Концепции, ступень с пропусками — соседний пример
// того же модуля, самостоятельная — практику юнита. Метка в practice — <FadedExample id="…"/>; форма ступеней
// и гварды — движок (lib/faded-example.ts, lib/faded-example.test.ts).
import type { FadedExampleData } from '../../../lib/faded-example'

export const FADED_EXAMPLES: FadedExampleData[] = [
  {
    module: '04-prompt-engineering',
    unit: 'u2-spec-formula',
    id: 'ctid-prompt',
    title: { ru: 'Промпт по полной структуре CTID', en: 'A prompt in the full CTID structure' },
    worked: {
      task: {
        ru: 'Пример из Концепции: справка по API для Python-разработчиков. Разберём его по пяти разделам.',
        en: 'The example from Concept: an API reference for Python developers. Let’s take it apart section by section.',
      },
      steps: [
        {
          label: { ru: 'Роль', en: 'Role' },
          text: {
            ru: 'Ты — исследовательский агент, специализирующийся на анализе технических документов и извлечении ключевых инсайтов.',
            en: 'You are a research agent specializing in analyzing technical docs and extracting key insights.',
          },
          why: {
            ru: 'Роль задаёт экспертизу. Без неё модель отвечает как типичный автор и сама решает, на чём сосредоточиться.',
            en: 'The role sets the expertise. Without it the model answers like a typical writer and decides on its own what to focus on.',
          },
        },
        {
          label: { ru: 'Задача', en: 'Task' },
          text: {
            ru: 'Проанализируй документацию по API и создай краткую справку с примерами для Python-разработчиков среднего уровня.',
            en: 'Analyze the API documentation and create a short reference with examples for intermediate Python developers.',
          },
          why: {
            ru: 'Одна конкретная цель одним предложением. В ней уже названа аудитория, и от неё зависит глубина справки.',
            en: 'One specific goal in one sentence. It already names the audience, and the depth of the reference depends on it.',
          },
        },
        {
          label: { ru: 'Входные данные', en: 'Inputs' },
          text: {
            ru: 'Документация по API: файл или ссылка, которую ты прикладываешь к промпту.',
            en: 'The API documentation: the file or link you attach to the prompt.',
          },
          why: {
            ru: 'В примере из Концепции этого раздела нет, документацию там подразумевают. Надёжнее назвать её явно: модель работает с тем, что получила.',
            en: 'The Concept example leaves this section out and takes the docs for granted. It is safer to name them: the model works with what it was given.',
          },
        },
        {
          label: { ru: 'Ожидаемый результат', en: 'Expected output' },
          text: {
            ru: 'Markdown-файл: описание API (2–3 предложения), основные endpoints (таблица), Authentication, 3 практических примера с кодом.',
            en: 'A Markdown file: API description (2–3 sentences), main endpoints (table), Authentication, 3 practical code examples.',
          },
          why: {
            ru: 'Формат, структура и объём. По этому разделу ты потом проверяешь ответ: всё ли на месте.',
            en: 'Format, structure and length. This is the section you later check the answer against.',
          },
        },
        {
          label: { ru: 'Ограничения', en: 'Constraints' },
          text: {
            ru: 'Примеры полные, их можно скопировать и запустить. Объём не более 500 строк. Python 3.10+.',
            en: 'Examples are complete and copy-paste runnable. Max 500 lines. Python 3.10+.',
          },
          why: {
            ru: 'Рамки, которые модель иначе выберет сама: объём, версия языка, что обязательно и что нельзя.',
            en: 'Limits the model would otherwise pick on its own: length, language version, what is required and what is off-limits.',
          },
        },
      ],
    },
    faded: {
      task: {
        ru: 'Промпт из самопроверки первого урока: «Ты — опытный копирайтер. Напиши пост про наш новый продукт». Роль и задача уже есть. Допиши три недостающих раздела: опиши, что в каждом должно стоять.',
        en: 'The prompt from the self-check in the first lesson: “You are an experienced copywriter. Write a post about our new product.” The role and the task are there. Fill in the three missing sections: describe what belongs in each.',
      },
      steps: [
        {
          label: { ru: 'Роль', en: 'Role' },
          text: { ru: 'Ты — опытный копирайтер.', en: 'You are an experienced copywriter.' },
          why: { ru: 'Роль в исходном промпте уже была.', en: 'The original prompt already had a role.' },
        },
        {
          label: { ru: 'Задача', en: 'Task' },
          text: { ru: 'Напиши пост про наш новый продукт.', en: 'Write a post about our new product.' },
          why: { ru: 'Задача тоже была: одна цель одним предложением.', en: 'The task was there too: one goal in one sentence.' },
        },
        {
          label: { ru: 'Входные данные', en: 'Inputs' },
          blank: true,
          text: {
            ru: 'Сведения о продукте: что это, для кого, чем отличается.',
            en: 'Facts about the product: what it is, who it is for, what sets it apart.',
          },
          why: {
            ru: 'Модель не знает «наш» продукт. Всё, что не дано, она заполнит самыми типичными значениями.',
            en: 'The model does not know “our” product. Whatever is missing it fills with the most typical values.',
          },
        },
        {
          label: { ru: 'Ожидаемый результат', en: 'Expected output' },
          blank: true,
          text: {
            ru: 'Формат, структура и объём поста: где он выйдет, сколько абзацев, нужен ли заголовок.',
            en: 'Format, structure and length of the post: where it goes, how many paragraphs, whether it needs a headline.',
          },
          why: {
            ru: 'По этому разделу ты проверяешь ответ. Без него модель сама выберет длину и форму.',
            en: 'This is what you check the answer against. Without it the model picks the length and shape itself.',
          },
        },
        {
          label: { ru: 'Ограничения', en: 'Constraints' },
          blank: true,
          text: {
            ru: 'Чего не делать и какие рамки: например, без жаргона, объём не больше заданного, только факты из входных данных.',
            en: 'What not to do and which limits apply: for example, no jargon, a length cap, only facts from the inputs.',
          },
          why: {
            ru: 'Ограничения закрывают то, что модель иначе додумает: тон, объём, подробности, которых нет во входных данных.',
            en: 'Constraints close off what the model would otherwise make up: tone, length, details that are not in the inputs.',
          },
        },
      ],
    },
    solo: {
      task: {
        ru: 'Теперь задача из твоей реальной работы: напиши промпт по всем пяти разделам. Задание — ниже.',
        en: 'Now a task from your actual work: write a prompt with all five sections. The assignment is below.',
      },
    },
  },
  {
    module: '05-context-memory',
    unit: 'u3-memory',
    id: 'memory-sort',
    title: { ru: 'Куда записать: AGENTS.md, TODO.md или STATE.md', en: 'Where it goes: AGENTS.md, TODO.md or STATE.md' },
    worked: {
      task: {
        ru: 'После рабочей сессии у тебя четыре заметки. Разложим их по файлам памяти.',
        en: 'After a work session you have four notes. Let’s sort them into the memory files.',
      },
      steps: [
        {
          label: { ru: '«Проект на Node.js 18, запуск — npm install && npm run dev»', en: '“The project runs on Node.js 18, start with npm install && npm run dev”' },
          text: { ru: 'AGENTS.md, разделы «Стек» и «Как запустить».', en: 'AGENTS.md, the “Stack” and “How to run” sections.' },
          why: {
            ru: 'Это нужно агенту в каждой сессии, а AGENTS.md он читает всегда.',
            en: 'The agent needs this in every session, and it always reads AGENTS.md.',
          },
        },
        {
          label: { ru: '«Дописать тесты к форме входа (2 ч)»', en: '“Finish the tests for the login form (2 h)”' },
          text: { ru: 'TODO.md, «СЕЙЧАС».', en: 'TODO.md, “NOW”.' },
          why: {
            ru: 'Это задача. TODO.md держит текущие задачи; сделанная уйдёт в «ГОТОВО».',
            en: 'This is a task. TODO.md holds current tasks; once done it moves to “DONE”.',
          },
        },
        {
          label: { ru: '«Остановились на форме входа: проверка полей готова, отправка — нет»', en: '“Stopped at the login form: field checks done, submit not yet”' },
          text: { ru: 'STATE.md, «Где мы сейчас» и «Следующий шаг».', en: 'STATE.md, “Where we are” and “Next step”.' },
          why: {
            ru: 'Новая сессия начинается с чистого листа. STATE.md возвращает ей картину за минуту.',
            en: 'A new session starts from a blank slate. STATE.md gives it the picture back in a minute.',
          },
        },
        {
          label: { ru: '«Агент второй раз поменял структуру папок без спроса — я откатил»', en: '“The agent changed the folder structure without asking, twice — I rolled it back”' },
          text: {
            ru: 'AGENTS.md, «Правила» или «Чего избегать»: «Не меняй архитектуру без согласования».',
            en: 'AGENTS.md, “Rules” or “What to avoid”: “Don’t change architecture without sign-off”.',
          },
          why: {
            ru: 'Правило, которое должно работать наверняка, записываешь ты. Что попадёт в MEMORY.md, решает Claude, так что на эту память не полагайся.',
            en: 'A rule that must hold for sure is one you write yourself. Claude decides on its own what goes into MEMORY.md, so do not rely on it.',
          },
        },
      ],
    },
    faded: {
      task: {
        ru: 'Следующая сессия, ещё четыре заметки. Первая разложена, остальные — твои: напиши файл и раздел.',
        en: 'The next session, four more notes. The first one is sorted, the rest are yours: write the file and the section.',
      },
      steps: [
        {
          label: { ru: '«Архитектуру и финальный review делаю сам»', en: '“I do the architecture and the final review myself”' },
          text: { ru: 'AGENTS.md, «Что решаю сам».', en: 'AGENTS.md, “What I decide myself”.' },
          why: {
            ru: 'Это граница делегирования, она нужна агенту в каждой сессии.',
            en: 'This is the delegation boundary; the agent needs it in every session.',
          },
        },
        {
          label: { ru: '«Нет доступа к тестовой базе, тесты не запускаются»', en: '“No access to the test database, tests won’t run”' },
          blank: true,
          text: { ru: 'STATE.md, «Что мешает».', en: 'STATE.md, “Blockers”.' },
          why: {
            ru: 'Это состояние работы на сейчас. Следующая сессия должна сразу увидеть, что мешает.',
            en: 'This is the current state of the work. The next session should see the blocker right away.',
          },
        },
        {
          label: { ru: '«После формы входа — страница профиля»', en: '“After the login form — the profile page”' },
          blank: true,
          text: { ru: 'TODO.md, «СЛЕДУЮЩИЕ».', en: 'TODO.md, “NEXT”.' },
          why: {
            ru: 'Это следующая задача, а не правило и не состояние.',
            en: 'This is the next task, not a rule and not a state.',
          },
        },
        {
          label: { ru: '«Агент начал большую правку, не показав план, — пришлось переделывать»', en: '“The agent started a big change without showing a plan — had to redo it”' },
          blank: true,
          text: {
            ru: 'AGENTS.md, «Правила»: «Перед большой правкой покажи план».',
            en: 'AGENTS.md, “Rules”: “Show a plan before a big change”.',
          },
          why: {
            ru: 'Ошибку агента, которую ты исправил, закрепляет правило в AGENTS.md: так она не повторится в следующих сессиях.',
            en: 'An agent mistake you corrected becomes a rule in AGENTS.md, so it does not come back in later sessions.',
          },
        },
      ],
    },
    solo: {
      task: {
        ru: 'Теперь твой проект: создай файлы памяти и разложи по ним то, что знаешь о своей задаче. Задание — ниже.',
        en: 'Now your own project: create the memory files and sort what you know about your task into them. The assignment is below.',
      },
    },
  },
  {
    module: '06-audio-pipeline',
    unit: 'u2-pipeline-theory',
    id: 'pipeline-design',
    title: { ru: 'Описать pipeline: Trigger, Actions, Condition', en: 'Describe a pipeline: Trigger, Actions, Condition' },
    worked: {
      task: {
        ru: 'Schedule pipeline из Концепции: «Каждое утро в 8:00 → собрать RSS → анализировать → отчёт в Slack». Так он выглядит в формате практики.',
        en: 'The scheduled pipeline from Concept: “Every morning at 8:00 → collect RSS → analyze → report to Slack”. Here it is in the practice format.',
      },
      steps: [
        {
          label: { ru: 'Trigger', en: 'Trigger' },
          text: { ru: 'Каждое утро в 8:00.', en: 'Every morning at 8:00.' },
          why: {
            ru: 'Запуск по времени — это schedule pipeline, он подходит для регулярной задачи.',
            en: 'A clock start makes it a scheduled pipeline, which suits a regular task.',
          },
        },
        {
          label: { ru: 'Actions', en: 'Actions' },
          text: { ru: '1. Собрать RSS. 2. Проанализировать новые записи. 3. Подготовить отчёт.', en: '1. Collect RSS. 2. Analyze the new entries. 3. Put together the report.' },
          why: {
            ru: 'Шаги идут по порядку: выход одного становится входом следующего.',
            en: 'The steps run in order: the output of one is the input of the next.',
          },
        },
        {
          label: { ru: 'Condition', en: 'Condition' },
          text: {
            ru: 'Не запускать, если новых записей нет; не повторять то, что уже было в прошлом отчёте.',
            en: 'Do not run if there are no new entries; do not repeat what was already in the last report.',
          },
          why: {
            ru: 'Condition говорит, когда НЕ запускать: дубли, ошибки, лимиты.',
            en: 'Condition says when NOT to run: duplicates, errors, limits.',
          },
        },
        {
          label: { ru: 'Результат', en: 'Result' },
          text: { ru: 'Отчёт в Slack.', en: 'A report in Slack.' },
          why: {
            ru: 'Формат и место, куда приходит результат. Без этого непонятно, где его искать.',
            en: 'The format and the place the result lands. Without it you do not know where to look.',
          },
        },
        {
          label: { ru: 'Частота', en: 'Frequency' },
          text: { ru: 'Ежедневно.', en: 'Daily.' },
          why: {
            ru: 'Частота подтверждает тип: регулярная задача — расписание.',
            en: 'The frequency confirms the type: a regular task means a schedule.',
          },
        },
      ],
    },
    faded: {
      task: {
        ru: 'Event-driven pipeline из Концепции: «Новый email → классифицировать → черновик ответа → на согласование». Часть уже заполнена, допиши остальное.',
        en: 'The event-driven pipeline from Concept: “New email → classify → draft reply → for approval”. Part of it is filled in; complete the rest.',
      },
      steps: [
        {
          label: { ru: 'Trigger', en: 'Trigger' },
          blank: true,
          text: { ru: 'Пришло новое письмо.', en: 'A new email arrives.' },
          why: {
            ru: 'Процесс запускает событие, а не время и не твоё решение. Это event-driven pipeline.',
            en: 'An event starts the process, not the clock and not your decision. That makes it event-driven.',
          },
        },
        {
          label: { ru: 'Actions', en: 'Actions' },
          text: {
            ru: '1. Классифицировать письмо. 2. Подготовить черновик ответа. 3. Отправить черновик на согласование.',
            en: '1. Classify the email. 2. Draft a reply. 3. Send the draft for approval.',
          },
          why: { ru: 'Шаги из Концепции, по порядку.', en: 'The steps from Concept, in order.' },
        },
        {
          label: { ru: 'Condition', en: 'Condition' },
          blank: true,
          text: {
            ru: 'Не запускать повторно на уже обработанное письмо (дубли). Не отправлять ответ автоматически — только черновик на согласование.',
            en: 'Do not run again on an email that was already handled (duplicates). Do not send the reply itself — only a draft for approval.',
          },
          why: {
            ru: 'Condition — когда НЕ запускать и чего не делать. Решение об отправке остаётся за человеком.',
            en: 'Condition covers when NOT to run and what not to do. The decision to send stays with a human.',
          },
        },
        {
          label: { ru: 'Результат', en: 'Result' },
          blank: true,
          text: { ru: 'Черновик ответа, который ждёт твоего согласования.', en: 'A draft reply waiting for your approval.' },
          why: {
            ru: 'Результат — черновик, а не отправленное письмо: так решение остаётся за тобой.',
            en: 'The result is a draft, not a sent email: that keeps the decision with you.',
          },
        },
        {
          label: { ru: 'Частота', en: 'Frequency' },
          text: { ru: 'По событию: на каждое новое письмо.', en: 'Per event: on every new email.' },
          why: {
            ru: 'У event-driven pipeline частоту задаёт поток событий.',
            en: 'For an event-driven pipeline the flow of events sets the frequency.',
          },
        },
      ],
    },
    solo: {
      task: {
        ru: 'Теперь свой pipeline из Активации: опиши его в том же формате. Задание — ниже.',
        en: 'Now your own pipeline from Activation: describe it in the same format. The assignment is below.',
      },
    },
  },
  {
    module: '08-agent-engineering',
    unit: 'u2-jagged-intelligence',
    id: 'ai-tool-code',
    title: { ru: 'Разложить pipeline на узлы AI, Tool и Code', en: 'Split a pipeline into AI, Tool and Code nodes' },
    worked: {
      task: {
        ru: 'Gmail-агент из модуля 08: письмо проходит семь шагов. Тип каждого узла и почему.',
        en: 'The Gmail agent from module 08: an email passes through seven steps. The type of each node and why.',
      },
      steps: [
        {
          label: { ru: 'Poll', en: 'Poll' },
          text: { ru: 'Tool: инструмент, не AI.', en: 'Tool: a tool, not AI.' },
          why: { ru: 'Получить письмо — вызов API, решать здесь нечего.', en: 'Getting the email is an API call; there is nothing to decide.' },
        },
        {
          label: { ru: 'Normalize', en: 'Normalize' },
          text: { ru: 'Code: детерминирован.', en: 'Code: deterministic.' },
          why: {
            ru: 'Привести поля к одному виду можно правилом: один и тот же вход даёт один и тот же выход.',
            en: 'Standardizing fields is a rule: the same input always gives the same output.',
          },
        },
        {
          label: { ru: 'Classify', en: 'Classify' },
          text: { ru: 'AI: выбирает одну из меток письма.', en: 'AI: chooses one of the email labels.' },
          why: { ru: 'Классификация смысла — то, в чём AI силён.', en: 'Classifying meaning is where AI is strong.' },
        },
        {
          label: { ru: 'Apply', en: 'Apply' },
          text: { ru: 'Tool + Code: Gmail API применяет метку, код обновляет состояние.', en: 'Tool + Code: the Gmail API applies the label, and code updates the state.' },
          why: {
            ru: 'Вызов Gmail API — Tool, а запись состояния и защита от повторного прохода — детерминированный код.',
            en: 'Calling the Gmail API is a Tool; recording state and preventing a second pass is deterministic code.',
          },
        },
        {
          label: { ru: 'Draft', en: 'Draft' },
          text: { ru: 'AI: готовит черновик ответа.', en: 'AI: prepares a reply draft.' },
          why: { ru: 'Сформулировать ответ по смыслу письма — задача для AI.', en: 'Writing a reply from the email meaning is an AI task.' },
        },
        {
          label: { ru: 'Review', en: 'Review' },
          text: { ru: 'Code: ждёт проверки человека.', en: 'Code: waits for human review.' },
          why: { ru: 'Проверка и решение отправлять — контрольный шаг, а не генерация.', en: 'Reviewing and deciding to send is a control step, not generation.' },
        },
        {
          label: { ru: 'Send', en: 'Send' },
          text: { ru: 'Tool: Gmail API.', en: 'Tool: Gmail API.' },
          why: { ru: 'Отправить одобренное письмо — вызов API.', en: 'Sending an approved email is an API call.' },
        },
      ],
    },
    faded: {
      task: {
        ru: 'Похожая задача: письма разбираются и попадают в файлы. Часть шагов размечена, для остальных напиши тип и кто делает.',
        en: 'A similar task: emails get sorted into files. Some steps are labeled; for the rest write the type and who does it.',
      },
      steps: [
        {
          label: { ru: 'Скачать письма', en: 'Download emails' },
          text: { ru: 'Tool: Gmail API.', en: 'Tool: Gmail API.' },
          why: { ru: 'Получить данные — вызов API.', en: 'Fetching data is an API call.' },
        },
        {
          label: { ru: 'Понять тему', en: 'Understand the topic' },
          blank: true,
          text: { ru: 'AI: LLM.', en: 'AI: LLM.' },
          why: {
            ru: 'Понять смысл текста и отнести его к теме — сильная сторона AI.',
            en: 'Reading a text for meaning and assigning a topic is a strength of AI.',
          },
        },
        {
          label: { ru: 'Записать в файл', en: 'Write to file' },
          text: { ru: 'Tool: файловая система.', en: 'Tool: file system.' },
          why: { ru: 'Запись — операция инструмента, а не решение.', en: 'Writing is a tool operation, not a decision.' },
        },
        {
          label: { ru: 'Проверить, что не дубликат', en: 'Check for duplicates' },
          blank: true,
          text: { ru: 'Code: детерминированный код.', en: 'Code: deterministic code.' },
          why: {
            ru: 'Сравнить с уже записанным можно точно и без модели. AI там, где хватает кода, — частый источник ненадёжности.',
            en: 'Comparing with what is already stored can be done exactly, without a model. AI where code is enough is a common source of unreliability.',
          },
        },
        {
          label: { ru: 'Уведомить тебя', en: 'Notify you' },
          blank: true,
          text: { ru: 'Tool: Telegram/Slack API.', en: 'Tool: Telegram/Slack API.' },
          why: {
            ru: 'Отправить уведомление — вызов API, AI здесь не нужен.',
            en: 'Sending a notification is an API call; no AI is needed.',
          },
        },
      ],
    },
    solo: {
      task: {
        ru: 'Теперь твоя задача из юнита 1: разбей её на шаги и для каждого укажи тип и кто делает. Задание — ниже.',
        en: 'Now your task from unit 1: break it into steps and give each one a type and who does it. The assignment is below.',
      },
    },
  },
]
