// web/lib/course/try-chains.ts
// Движок+данные страницы «Попробуй до курса» (/try). Отображение — components/try-chains.tsx.
//
// Зачем страница: человек стоит на входе и не может решиться — не потому, что дорого
// (курс открыт), а потому, что не верит, что это про него. Списком возможностей такое
// не лечится. Лечится одним доведённым до конца делом на СВОИХ файлах.
//
// Почему цепочка, а не промпт: одиночный промпт даёт демонстрацию, цепочка даёт результат.
// И у каждой цепочки первый шаг — разведочный: агент показывает план и ничего не трогает.
// Это не украшение. Человек копирует эти строки в инструмент, который умеет переименовывать
// и перезаписывать его файлы, — значит порядок шагов здесь отвечает за его данные.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export type ChainKind = 'work' | 'life'

export interface ChainStep {
  /** Готовая к копированию инструкция агенту. */
  prompt: Bi
  /** Зачем этот шаг — иначе цепочка читается как заклинание. */
  why: Bi
}

export interface TryChain {
  id: string
  icon: string
  kind: ChainKind
  title: Bi
  /** Ситуация от первого лица: человек должен узнать свою боль. */
  situation: Bi
  /** Что понадобится под рукой. */
  needs: Bi
  /** Честная оценка времени ПЕРВОГО прохода, а не идеального. */
  minutes: number
  /**
   * Трогает ли цепочка файлы человека. У таких первый шаг обязан явно запрещать
   * агенту что-либо менять, а сама цепочка — оставлять путь назад (журнал отката
   * или работа с копиями). Свойство объявляют данные, проверяет тест: список
   * «опасных» цепочек, зашитый в тест, разъехался бы с данными на первой правке.
   */
  touchesFiles: boolean
  steps: ChainStep[]
  result: Bi
  /** Где именно эта цепочка обычно уходит не туда. */
  caution: Bi
}

export interface ResolvedStep { n: number; prompt: string; why: string }

export interface ResolvedChain {
  id: string
  icon: string
  kind: ChainKind
  title: string
  situation: string
  needs: string
  minutes: number
  steps: ResolvedStep[]
  result: string
  caution: string
}

export interface TryVM {
  eyebrow: string
  heading: string
  intro: string[]
  notProgramming: { heading: string; body: string[] }
  chains: ResolvedChain[]
  kindLabels: Record<ChainKind, string>
  honest: { heading: string; intro: string; items: string[] }
  outro: { heading: string; body: string[]; ctaLabel: string; ctaHref: string; noCta: string }
  copyLabel: string
  stepLabel: string
  minutesLabel: (n: number) => string
}

const EYEBROW: Bi = { ru: 'без записи и без почты', en: 'no signup, no email' }

const HEADING: Bi = {
  ru: 'Шесть дел, которые можно сделать сегодня',
  en: 'Six things you can get done today',
}

const INTRO: Bi[] = [
  {
    ru: 'Ниже — шесть цепочек команд. Каждая доводит одно конкретное дело до конца: не «пример из урока», а твои файлы, твоя таблица, твой архив.',
    en: 'Below are six chains of instructions. Each one carries a single real task to the end: not a lesson example — your files, your spreadsheet, your archive.',
  },
  {
    ru: 'Копируй по шагу, вставляй в агента, читай что он отвечает. Курс тут не нужен: если сработает — ты сам поймёшь, зачем идти дальше. Если не сработает — ты потерял двадцать минут и узнал границу.',
    en: 'Copy one step at a time, paste it into the agent, read what comes back. You do not need the course for this: if it works, you will see for yourself why to go further. If it does not, you spent twenty minutes and learned where the edge is.',
  },
  {
    ru: 'Почему сразу руками, а не «сначала почитаю». Чтение про ИИ даёт ориентацию, но не умение: можно год листать каналы и остаться там же, где начал. Уверенность растёт от сделанного, а не от прочитанного, — поэтому здесь нет ни одной строки теории.',
    en: 'Why hands first, rather than "let me read up on it". Reading about AI gives orientation, not skill: you can scroll the channels for a year and end up where you started. Confidence grows from what you did, not from what you read — which is why there is not a single line of theory here.',
  },
]

const NOT_PROGRAMMING: { heading: Bi; body: Bi[] } = {
  heading: { ru: 'Почему это не программирование', en: 'Why this is not programming' },
  body: [
    {
      ru: 'У инструмента в названии стоит слово «код», и это слово стоило людям многих часов: они решили, что оно не для них. На деле это не плагин к редактору, а агент, который сидит поверх твоих папок — читает файлы, переименовывает, переписывает, запускает нужное и отчитывается.',
      en: 'The tool has the word "code" in its name, and that word has cost people a lot of hours: they decided it was not for them. It is not an editor plugin. It is an agent that sits on top of your folders — it reads files, renames them, rewrites them, runs things and reports back.',
    },
    {
      ru: 'Всё, что ниже, — не разработка. Это канцелярия, которую ты до сих пор делаешь руками.',
      en: 'None of what follows is development. It is admin work you are still doing by hand.',
    },
  ],
}

const KIND_LABELS: Record<ChainKind, Bi> = {
  work: { ru: 'Рабочая рутина', en: 'Work routine' },
  life: { ru: 'Личное', en: 'Personal' },
}

// Первый шаг каждой цепочки — «покажи, ничего не меняя». Порядок здесь отвечает
// за чужие файлы, поэтому разведка не опция и не вежливость.
const CHAINS: TryChain[] = [
  {
    id: 'rename-files',
    icon: '🗂️',
    kind: 'work',
    title: { ru: 'Папка, в которой ничего не найти', en: 'The folder where nothing can be found' },
    situation: {
      ru: 'Четыреста файлов с именами «скан_final_2 (копия).pdf». Найти нужный можно только открыв половину.',
      en: 'Four hundred files named "scan_final_2 (copy).pdf". Finding one means opening half of them.',
    },
    needs: { ru: 'папка с файлами (копия — на всякий случай)', en: 'a folder of files (a copy, to be safe)' },
    minutes: 20,
    touchesFiles: true,
    steps: [
      {
        prompt: {
          ru: 'Посмотри файлы в этой папке и покажи таблицей: текущее имя, что внутри по сути, какое имя было бы понятным. Ничего пока не переименовывай.',
          en: 'Look through the files in this folder and show me a table: current name, what it actually contains, what a clear name would be. Do not rename anything yet.',
        },
        why: {
          ru: 'Сначала ты видишь, что агент понял. Именно здесь ловится «он решил, что это договоры, а это счета».',
          en: 'First you see what the agent understood. This is where you catch "it decided these were contracts when they are invoices".',
        },
      },
      {
        prompt: {
          ru: 'Схема имени: ГГГГ-ММ-ДД_контрагент_тип-документа. Перепиши предложенные имена по этой схеме и покажи таблицу ещё раз.',
          en: 'Naming scheme: YYYY-MM-DD_counterparty_document-type. Rewrite your proposed names to match it and show the table again.',
        },
        why: {
          ru: 'Схему задаёшь ты. Без неё агент придумает свою — красивую и неудобную ровно для твоих поисков.',
          en: 'You set the scheme. Without one the agent invents its own — pretty, and inconvenient for exactly the way you search.',
        },
      },
      {
        prompt: {
          ru: 'Хорошо. Переименуй по этой таблице, но сначала сохрани текущие имена в файл rename-log.csv, чтобы можно было откатить.',
          en: 'Good. Rename according to that table, but first save the current names into rename-log.csv so this can be undone.',
        },
        why: {
          ru: 'Журнал переименования — твоя кнопка «назад». Просить его нужно до, а не после.',
          en: 'The rename log is your undo button. You have to ask for it before, not after.',
        },
      },
      {
        prompt: {
          ru: 'Перечисли файлы, для которых ты не смог определить дату или контрагента, и оставь их без изменений.',
          en: 'List the files where you could not determine a date or counterparty, and leave those untouched.',
        },
        why: {
          ru: 'Остаток — самое ценное. Это те десять файлов, которые всё равно придётся посмотреть глазами, но теперь их десять, а не четыреста.',
          en: 'The leftovers are the valuable part: the ten files you will still open yourself — but ten, not four hundred.',
        },
      },
    ],
    result: {
      ru: 'Папка, где имя файла отвечает на вопрос «что это», журнал отката и короткий список спорных.',
      en: 'A folder where the filename answers "what is this", an undo log, and a short list of the doubtful ones.',
    },
    caution: {
      ru: 'На двадцати файлах руками быстрее. Эта цепочка окупается от сотни.',
      en: 'For twenty files, doing it by hand is faster. This chain pays off from a hundred up.',
    },
  },
  {
    id: 'sheet-to-letters',
    icon: '✉️',
    kind: 'work',
    title: { ru: 'Девяносто писем, которые нужно написать лично', en: 'Ninety letters that each need to be personal' },
    situation: {
      ru: 'Есть таблица людей. Каждому нужно написать по-человечески, а не рассылкой — но на девяносто раз тебя не хватит.',
      en: 'You have a spreadsheet of people. Each needs a human letter, not a blast — but you do not have ninety letters in you.',
    },
    needs: { ru: 'таблица (CSV или экспорт) и одно письмо, написанное тобой', en: 'a spreadsheet (CSV or export) and one letter written by you' },
    minutes: 30,
    touchesFiles: true,
    steps: [
      {
        prompt: {
          ru: 'Открой этот файл и скажи, какие колонки в нём есть и какие из них годятся, чтобы обратиться к человеку по-разному. Ничего не пиши.',
          en: 'Open this file and tell me what columns it has and which of them could make a letter different for each person. Do not write anything yet.',
        },
        why: {
          ru: 'Иногда персонализировать нечем: в таблице только имя и email. Лучше узнать это сразу.',
          en: 'Sometimes there is nothing to personalise with: just a name and an email. Better to learn that up front.',
        },
      },
      {
        prompt: {
          ru: 'Вот письмо, которое я написал одному человеку: [вставь своё письмо]. Разбери его: что здесь общее для всех, а что относится именно к нему.',
          en: 'Here is a letter I wrote to one person: [paste your letter]. Break it down: what here is common to everyone, and what belongs to that person specifically.',
        },
        why: {
          ru: 'Ты отдаёшь свой голос как образец, а не просишь «напиши письмо». Разница слышна в результате.',
          en: 'You hand over your voice as the sample instead of asking "write a letter". The difference is audible in the result.',
        },
      },
      {
        prompt: {
          ru: 'Сделай три письма — для первых трёх строк таблицы. Общую часть сохрани дословно, личную собери из их данных. Покажи мне, не отправляй.',
          en: 'Draft three letters — for the first three rows. Keep the common part word for word, build the personal part from their data. Show me; do not send.',
        },
        why: {
          ru: 'Три штуки — размер, на котором видно фальшь. На девяноста ты её уже не вычитаешь.',
          en: 'Three is the size where you can still spot the fake note. At ninety you will not proofread it.',
        },
      },
      {
        prompt: {
          ru: 'Правки: [что не так]. Учти их и сделай остальные, каждое отдельным файлом в папке letters/. Отправлять буду я сам.',
          en: 'Fixes: [what is off]. Apply them and produce the rest, each as its own file in letters/. I will send them myself.',
        },
        why: {
          ru: 'Отправка остаётся за тобой. Агент, которому дали ключи от почты, — отдельное решение, не для первого дня.',
          en: 'Sending stays with you. An agent holding your mail credentials is a separate decision, not a first-day one.',
        },
      },
    ],
    result: {
      ru: 'Девяносто черновиков твоим голосом, которые остаётся прочитать и отправить.',
      en: 'Ninety drafts in your own voice, left for you to read and send.',
    },
    caution: {
      ru: 'Если персонализация сводится к подстановке имени — это обычная рассылка, и агент тут лишний.',
      en: 'If the personalisation is just inserting a name, this is a mail merge and the agent adds nothing.',
    },
  },
  {
    id: 'reconcile',
    icon: '🧾',
    kind: 'work',
    title: { ru: 'Две выгрузки, которые должны сойтись', en: 'Two exports that should agree' },
    situation: {
      ru: 'Выписка из платёжной системы и выписка из банка. Раз в месяц ты сверяешь их глазами и каждый раз находишь не всё.',
      en: 'A payment-processor export and a bank statement. Once a month you reconcile them by eye and never catch everything.',
    },
    needs: { ru: 'два файла с операциями за один период', en: 'two files of transactions covering the same period' },
    minutes: 25,
    touchesFiles: true,
    steps: [
      {
        prompt: {
          ru: 'Вот два файла. Не сверяй пока. Скажи, по каким полям их вообще можно сопоставить и чем отличаются форматы дат и сумм.',
          en: 'Here are two files. Do not reconcile yet. Tell me which fields could match them at all, and how their date and amount formats differ.',
        },
        why: {
          ru: 'Девяносто процентов расхождений — это разный формат даты и комиссия, а не пропавшие деньги.',
          en: 'Ninety per cent of discrepancies are date formats and fees, not missing money.',
        },
      },
      {
        prompt: {
          ru: 'Сопоставь операции по сумме и дате с допуском три дня. Покажи три списка: совпало, есть только слева, есть только справа.',
          en: 'Match transactions by amount and date with a three-day tolerance. Show me three lists: matched, left-only, right-only.',
        },
        why: {
          ru: 'Допуск обязателен: деньги идут не мгновенно, и жёсткое совпадение по дате даст гору ложных расхождений.',
          en: 'The tolerance matters: money settles with a delay, and exact date matching produces a pile of false mismatches.',
        },
      },
      {
        prompt: {
          ru: 'По несовпавшим предложи объяснение каждой строки: комиссия, возврат, задержка, дубль. Где не уверен — так и напиши.',
          en: 'For each unmatched row, propose an explanation: fee, refund, delay, duplicate. Where you are unsure, say so.',
        },
        why: {
          ru: '«Где не уверен — напиши» переводит уверенный тон в честный список. Без этой фразы получишь ровные объяснения на всё.',
          en: '"Say where you are unsure" turns a confident tone into an honest list. Without that line you get tidy explanations for everything.',
        },
      },
    ],
    result: {
      ru: 'Список из нескольких строк, которые действительно требуют твоего решения, вместо часа за двумя таблицами.',
      en: 'A short list of rows that genuinely need your decision, instead of an hour spent between two spreadsheets.',
    },
    caution: {
      ru: 'Это разбор, а не бухгалтерия. Итог всё равно проверяет человек, который отвечает за отчётность.',
      en: 'This is triage, not accounting. The result is still checked by whoever is responsible for the books.',
    },
  },
  {
    id: 'notes-pile',
    icon: '🧠',
    kind: 'life',
    title: { ru: 'Свалка заметок, в которую страшно заходить', en: 'The pile of notes you avoid opening' },
    situation: {
      ru: 'Несколько лет заметок: обрывки, ссылки, мысли на бегу. Ты помнишь, что где-то это записывал, но не находишь.',
      en: 'Years of notes: fragments, links, thoughts on the run. You remember writing it down somewhere and cannot find it.',
    },
    needs: { ru: 'папка с заметками (экспорт из любого приложения)', en: 'a folder of notes (export from any app)' },
    minutes: 25,
    touchesFiles: true,
    steps: [
      {
        prompt: {
          ru: 'Прочитай эти заметки и назови темы, которые в них повторяются. Ничего пока не переименовывай и не перекладывай. Не выдумывай красивых рубрик — назови так, как это называю я сам.',
          en: 'Read these notes and name the themes that recur. Do not rename or move anything yet. Do not invent tidy categories — name them the way I name them myself.',
        },
        why: {
          ru: 'Чужая рубрикация — главная причина, почему второй мозг умирает. Просьба говорить твоими словами меняет результат.',
          en: 'Someone else’s taxonomy is the main reason a second brain dies. Asking for your own words changes the outcome.',
        },
      },
      {
        prompt: {
          ru: 'Возьми одну тему — [название] — и собери из разрозненных заметок один связный текст: что я уже понял, в чём противоречу себе, чего не хватает.',
          en: 'Take one theme — [name] — and assemble the scattered notes into one coherent text: what I already understood, where I contradict myself, what is missing.',
        },
        why: {
          ru: '«В чём противоречу себе» — то, ради чего это делается. Список заметок ты и сам видишь; противоречия — нет.',
          en: '"Where I contradict myself" is the reason to do this at all. You can see the list of notes yourself; the contradictions you cannot.',
        },
      },
      {
        prompt: {
          ru: 'Теперь разложи заметки по этим темам в папки, оригиналы не трогай — сделай копии. И составь список тех, что никуда не легли.',
          en: 'Now sort the notes into folders by theme — copies, leave the originals alone. And list the ones that fit nowhere.',
        },
        why: {
          ru: 'Копии, а не перемещение: свою систему заметок стоит менять только когда убедился, что новая лучше.',
          en: 'Copies, not moves: change your note system only once you are convinced the new shape is better.',
        },
      },
    ],
    result: {
      ru: 'Один живой текст по важной для тебя теме и понимание, что вообще лежит в архиве.',
      en: 'One living text on a theme that matters to you, and a sense of what is actually in the archive.',
    },
    caution: {
      ru: 'Агент соберёт связный текст даже там, где связи нет. Читай его как черновик собеседника, а не как вывод.',
      en: 'The agent will produce a coherent text even where there is no coherence. Read it as a draft from a partner, not as a conclusion.',
    },
  },
  {
    id: 'new-topic',
    icon: '🔍',
    kind: 'life',
    title: { ru: 'Тема, в которой надо разобраться к пятнице', en: 'A subject you must understand by Friday' },
    situation: {
      ru: 'Незнакомая область: врачебное заключение, договор, новая для тебя отрасль. Гуглить — утонуть, спросить — некого.',
      en: 'An unfamiliar field: a medical report, a contract, an industry new to you. Googling means drowning; there is no one to ask.',
    },
    needs: { ru: 'документ или просто название темы', en: 'a document, or just the name of the subject' },
    minutes: 20,
    touchesFiles: false,
    steps: [
      {
        prompt: {
          ru: 'Объясни мне эту тему как человеку, который в ней ноль, но не дурак. Три уровня: в двух словах, на страницу, и что здесь обычно понимают неправильно.',
          en: 'Explain this subject to someone who knows nothing about it but is not stupid. Three levels: in two sentences, in a page, and what people usually get wrong here.',
        },
        why: {
          ru: '«Что обычно понимают неправильно» — самый полезный из трёх уровней, и его почти никогда не спрашивают.',
          en: '"What people usually get wrong" is the most useful of the three, and almost nobody asks for it.',
        },
      },
      {
        prompt: {
          ru: 'Теперь назови пять вопросов, которые я должен задать специалисту, чтобы меня нельзя было ввести в заблуждение.',
          en: 'Now give me five questions to ask a specialist so that I cannot be misled.',
        },
        why: {
          ru: 'Цель не заменить специалиста, а перестать быть беспомощным в разговоре с ним.',
          en: 'The goal is not to replace the specialist but to stop being helpless in the conversation.',
        },
      },
      {
        prompt: {
          ru: 'На чём основано то, что ты сейчас сказал? Отдельно отметь: что общепринято, что спорно, а что ты достроил сам.',
          en: 'What is all that based on? Mark separately: what is settled, what is disputed, and what you filled in yourself.',
        },
        why: {
          ru: 'Этот вопрос отделяет знание от правдоподобной гладкой речи. Задавай его всегда — особенно когда ответ нравится.',
          en: 'This question separates knowledge from plausible fluent speech. Always ask it — especially when you like the answer.',
        },
      },
    ],
    result: {
      ru: 'Понимание темы на уровне «могу говорить со специалистом» и список того, что стоит перепроверить.',
      en: 'Enough grasp to hold a conversation with a specialist, plus a list of what to verify.',
    },
    caution: {
      ru: 'Про медицину, право и деньги агент говорит так же уверенно, как про всё остальное. Уверенность здесь ничего не значит — проверяй.',
      en: 'On medicine, law and money the agent speaks just as confidently as on anything else. Confidence means nothing here — verify.',
    },
  },
  {
    id: 'home-archive',
    icon: '📁',
    kind: 'life',
    title: { ru: 'Домашний архив документов', en: 'The household document archive' },
    situation: {
      ru: 'Счета, договоры, справки, гарантии — в трёх местах и в фотографиях. Когда что-то нужно срочно, найти невозможно.',
      en: 'Bills, contracts, certificates, warranties — across three places and a camera roll. When you urgently need one, it cannot be found.',
    },
    needs: { ru: 'папка со сканами и фотографиями документов', en: 'a folder of scans and photos of documents' },
    minutes: 30,
    touchesFiles: true,
    steps: [
      {
        prompt: {
          ru: 'Просмотри эти файлы и составь опись: что за документ, к чему относится, есть ли срок действия. Файлы не трогай.',
          en: 'Go through these files and build an inventory: what the document is, what it relates to, whether it expires. Do not touch the files.',
        },
        why: {
          ru: 'Опись полезна сама по себе, даже если ты остановишься на этом шаге: ты впервые видишь весь архив списком.',
          en: 'The inventory is useful on its own even if you stop here: for the first time you see the whole archive as a list.',
        },
      },
      {
        prompt: {
          ru: 'Отметь в описи то, что скоро истекает или уже истекло, и то, где у меня, похоже, нет второго экземпляра.',
          en: 'Flag in the inventory what expires soon or has already expired, and where I appear to have no second copy.',
        },
        why: {
          ru: 'Ради этого шага всё и затевалось: просроченная страховка находится не поиском, а описью.',
          en: 'This is the step that justifies the rest: an expired policy is found by inventory, not by search.',
        },
      },
      {
        prompt: {
          ru: 'Разложи копии по папкам: жильё, здоровье, транспорт, работа, прочее. Оригиналы оставь на месте, спорные сложи отдельно.',
          en: 'Sort copies into folders: home, health, transport, work, other. Leave the originals where they are; put the doubtful ones aside.',
        },
        why: {
          ru: 'Личные документы — не то место, где стоит доверять автоматике первый раз. Копии и «спорное отдельно» решают это.',
          en: 'Personal documents are not where you trust automation on the first run. Copies and a separate "doubtful" pile handle that.',
        },
      },
    ],
    result: {
      ru: 'Опись домашнего архива, список того, что пора продлить, и разложенные копии.',
      en: 'An inventory of the household archive, a list of what needs renewing, and sorted copies.',
    },
    caution: {
      ru: 'Здесь ты показываешь агенту паспорта и договоры. Прежде чем начать — реши, где он работает и куда уходят данные. В курсе это первый разговор, и не случайно.',
      en: 'Here you are showing the agent passports and contracts. Before starting, decide where it runs and where the data goes. In the course that is the first conversation, and not by accident.',
    },
  },
]

const HONEST: { heading: Bi; intro: Bi; items: Bi[] } = {
  heading: { ru: 'Где это съест твоё время', en: 'Where this will waste your time' },
  intro: {
    ru: 'Честная часть, без которой остальное было бы рекламой.',
    en: 'The honest part, without which the rest would be advertising.',
  },
  items: [
    {
      ru: 'Первый запуск дольше, чем кажется. Поставить инструмент, дать доступ к папке, понять, где он вообще берёт файлы, — это вечер, а не пять минут. Второй раз занимает минуты.',
      en: 'The first run takes longer than it looks. Installing, granting folder access, working out where it reads files from — that is an evening, not five minutes. The second time takes minutes.',
    },
    {
      ru: 'Малый объём не окупается. Двадцать файлов, три письма, одна страница текста — быстрее руками. Смысл появляется там, где счёт идёт на сотни.',
      en: 'Small volumes do not pay off. Twenty files, three letters, one page — faster by hand. It starts to matter when the count runs into hundreds.',
    },
    {
      ru: 'Задачи вкуса он делает средне. Где нужно твоё решение — что выкинуть, кому отказать, как это назвать по-твоему, — получишь усреднённый ответ и потратишь время на переделку.',
      en: 'Taste-driven work comes out average. Where your judgement is needed — what to cut, whom to refuse, what to call it in your own words — you get an averaged answer and spend the time redoing it.',
    },
    {
      ru: 'Он ошибается уверенно. Тон ответа одинаков и когда всё верно, и когда он достроил недостающее. Поэтому первый шаг каждой цепочки — «покажи, не меняя»: пропустишь его — будешь откатывать.',
      en: 'It is wrong with full confidence. The tone is identical whether it is right or filling gaps. That is why every chain starts with "show me, change nothing": skip that and you will be undoing things.',
    },
    {
      ru: 'Данные уходят туда, где работает модель. Для домашнего архива и рабочих документов это отдельный разговор — какой инструмент, где он запущен, что уезжает наружу.',
      en: 'Your data goes wherever the model runs. For a household archive or work documents that is its own conversation: which tool, running where, what leaves your machine.',
    },
  ],
}

const OUTRO: { heading: Bi; body: Bi[]; ctaLabel: Bi; noCta: Bi } = {
  heading: { ru: 'Если сработало', en: 'If it worked' },
  body: [
    {
      ru: 'Значит дело было не в способностях и не в слове «код». Курс — про то же самое, только дальше: свой стек, свои цепочки под свои задачи и агент, который помнит твой контекст, а не начинает каждый раз с нуля.',
      en: 'Then it was never about ability or about the word "code". The course is the same thing carried further: your own stack, your own chains for your own work, and an agent that holds your context instead of starting from zero every time.',
    },
    {
      ru: 'Если не сработало — это тоже ответ, и он честный. Ты потратил вечер и узнал границу инструмента; это больше, чем даёт любое описание курса.',
      en: 'If it did not work, that is an answer too, and an honest one. You spent an evening and found the tool’s edge — more than any course description could give you.',
    },
  ],
  ctaLabel: { ru: 'Посмотреть программу →', en: 'See the syllabus →' },
  noCta: {
    ru: 'Ничего не нужно оставлять: ни почты, ни имени. Страница открыта и будет открыта.',
    en: 'Nothing to leave behind: no email, no name. The page is open and will stay open.',
  },
}

const COPY_LABEL: Bi = { ru: 'Скопировать', en: 'Copy' }
const STEP_LABEL: Bi = { ru: 'Шаг', en: 'Step' }

function pick(b: Bi, l: 'ru' | 'en'): string {
  return b[l]
}

export function resolveChain(chain: TryChain, locale: Locale): ResolvedChain {
  const l: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    id: chain.id,
    icon: chain.icon,
    kind: chain.kind,
    title: pick(chain.title, l),
    situation: pick(chain.situation, l),
    needs: pick(chain.needs, l),
    minutes: chain.minutes,
    steps: chain.steps.map((s, i) => ({ n: i + 1, prompt: pick(s.prompt, l), why: pick(s.why, l) })),
    result: pick(chain.result, l),
    caution: pick(chain.caution, l),
  }
}

export function getTryChains(locale: Locale): TryVM {
  const l: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  const base = locale === 'en' ? '/en' : ''
  return {
    eyebrow: pick(EYEBROW, l),
    heading: pick(HEADING, l),
    intro: INTRO.map((b) => pick(b, l)),
    notProgramming: {
      heading: pick(NOT_PROGRAMMING.heading, l),
      body: NOT_PROGRAMMING.body.map((b) => pick(b, l)),
    },
    chains: CHAINS.map((c) => resolveChain(c, locale)),
    kindLabels: { work: pick(KIND_LABELS.work, l), life: pick(KIND_LABELS.life, l) },
    honest: {
      heading: pick(HONEST.heading, l),
      intro: pick(HONEST.intro, l),
      items: HONEST.items.map((b) => pick(b, l)),
    },
    outro: {
      heading: pick(OUTRO.heading, l),
      body: OUTRO.body.map((b) => pick(b, l)),
      ctaLabel: pick(OUTRO.ctaLabel, l),
      ctaHref: `${base}/syllabus/`,
      noCta: pick(OUTRO.noCta, l),
    },
    copyLabel: pick(COPY_LABEL, l),
    stepLabel: pick(STEP_LABEL, l),
    minutesLabel: (n: number) => (l === 'en' ? `~${n} min` : `~${n} мин`),
  }
}

/** Для тестов и гвардов: сырые цепочки без локали. */
export const ALL_CHAINS: readonly TryChain[] = CHAINS
export const HONEST_ITEMS: readonly Bi[] = HONEST.items
