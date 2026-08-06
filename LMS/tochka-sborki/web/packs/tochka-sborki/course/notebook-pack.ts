// web/lib/course/notebook-pack.ts
// Движок+данные страницы «Пакет тетрадки» (/notebook). Отображение — components/notebook-pack.tsx.
//
// Зачем: source-grounded тетрадка (Gemini Notebook, бывший NotebookLM, и класс инструментов
// вокруг) превращает кучу видео и PDF в конспект, где каждое утверждение кликабельно в точку
// источника. Курс НЕ ходит в LLM сам: страница собирает пакет — что положить, какие промпты
// дать, как проверить. Промпты работают и в обычном чате с приложенными файлами.
//
// Методологическое ядро: каждый промпт ТРЕБУЕТ цитату с точкой в источнике. Конспект без
// улик — пересказ; проверить пересказ нельзя. Мост к модулю 00/u4 «Первоисточник или упаковка».
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface NotebookPrompt { id: string; label: Bi; prompt: Bi }

export interface NotebookPack {
  id: string
  icon: string
  title: Bi
  situation: Bi
  sources: Bi
  steps: Bi[]
}

export const INTRO: Bi[] = [
  {
    ru: 'Source-grounded тетрадка — это конспект, где ответ привязан к загруженным источникам: видео, PDF, статьям, заметкам. Нормальный результат не просто звучит убедительно, а ведёт цитатой в точку источника.',
    en: 'A source-grounded notebook is a digest tied to the sources you upload: videos, PDFs, articles, notes. A useful answer does not just sound convincing; it points back to the exact source with a quote.',
  },
  {
    ru: 'Gemini Notebook, бывший NotebookLM, — удобный референс такого инструмента. Для этой страницы бесплатного тира достаточно: нужна не магия, а тетрадка, которая умеет читать твои источники и показывать, откуда взяла тезис.',
    en: 'Gemini Notebook, formerly NotebookLM, is a useful reference for this kind of tool. The free tier is enough for this page: you need a notebook that can read your sources and show where each point came from.',
  },
  {
    ru: 'Если отдельной тетрадки нет, промпты работают и в обычном чате с приложенными файлами. Разница только в дисциплине: каждый вывод проси подкрепить цитатой, иначе это пересказ без проверки.',
    en: 'If you do not have a separate notebook tool, the prompts also work in a regular chat with attached files. The discipline is the same: ask for a quote behind every conclusion, otherwise it is an unchecked retelling.',
  },
]

export const PACKS: NotebookPack[] = [
  {
    id: 'youtube-playlist',
    icon: '🎬',
    title: { ru: 'Плейлист вместо вечера у экрана', en: 'A playlist instead of an evening of watching' },
    situation: {
      ru: 'Накопился плейлист докладов или обучающих роликов. Смотреть всё подряд — вечер; бросить — жалко.',
      en: 'A playlist of talks or tutorials has piled up. Watching it all takes an evening; dropping it feels like a waste.',
    },
    sources: {
      ru: 'Ссылки на ролики или весь плейлист. В тетрадке: «Добавить источник» → «YouTube» — по ссылке на каждый ролик. Тетрадка читает субтитры, а не смотрит видео: ролик без субтитров останется пустым источником.',
      en: 'Links to the videos or the whole playlist. In the notebook: "Add source" → "YouTube" — one link per video. The notebook reads subtitles, not the video itself: a video without subtitles stays an empty source.',
    },
    steps: [
      { ru: 'Собери ссылки роликов и добавь каждый источником в новую тетрадку.', en: 'Collect the video links and add each one as a source in a fresh notebook.' },
      { ru: 'Задай вопрос «О чём эти ролики расходятся между собой?» — расхождения интереснее пересказа.', en: 'Ask "Where do these videos disagree with each other?" — disagreements are more useful than a summary.' },
      { ru: 'Возьми из промпт-кита «Сравнение в таблицу» и «Вопросы с цитатами».', en: 'Take "Comparison table" and "Questions with citations" from the prompt kit.' },
      { ru: 'Пройди чек-лист верификации по двум-трём ответам, прежде чем верить конспекту.', en: 'Run the verification checklist on two or three answers before trusting the digest.' },
    ],
  },
  {
    id: 'lesson-sources',
    icon: '📚',
    title: { ru: 'Материалы юнита глубже', en: 'Going deeper on unit materials' },
    situation: {
      ru: 'Юнит курса даёт внешние первоисточники, а времени прочитать их целиком нет.',
      en: 'A course unit points to external primary sources, and there is no time to read them in full.',
    },
    sources: {
      ru: 'Ссылки из раздела «Материалы» юнита: статьи, документация, каталоги примеров. PDF можно загрузить файлом.',
      en: 'Links from the unit "Materials" section: articles, documentation, example catalogs. PDFs can be uploaded as files.',
    },
    steps: [
      { ru: 'Положи в тетрадку два-три первоисточника юнита — не пересказы о них.', en: 'Put two or three of the unit’s primary sources in the notebook — not retellings of them.' },
      { ru: 'Спроси: «Что здесь противоречит тому, как это обычно пересказывают?»', en: 'Ask: "What here contradicts the way this is usually retold?"' },
      { ru: 'Сгенерируй конспект с цитатами и сверь пару цитат кликом в источник.', en: 'Generate a digest with citations and spot-check a couple of them by clicking into the source.' },
    ],
  },
  {
    id: 'own-docs',
    icon: '🗂️',
    title: { ru: 'Свои документы под вопросы', en: 'Your own documents, questionable' },
    situation: {
      ru: 'Папка своих PDF, заметок или выгрузок, в которой давно никто не ориентируется.',
      en: 'A folder of your own PDFs, notes, or exports that nobody can navigate anymore.',
    },
    sources: {
      ru: 'Свои файлы: PDF, текст, таблицы. Личные данные остаются твоим решением — в тетрадку попадает только то, что ты сам загрузил.',
      en: 'Your own files: PDFs, text, spreadsheets. Personal data stays your call — the notebook only sees what you yourself upload.',
    },
    steps: [
      { ru: 'Выбери 5–10 документов одной темы и загрузи их источниками.', en: 'Pick 5–10 documents on one topic and upload them as sources.' },
      { ru: 'Спроси то, ради чего папку вообще открывал — своими словами, без «правильных» формулировок.', en: 'Ask the question you opened the folder for — in your own words, no "proper" phrasing.' },
      { ru: 'Потребуй цитату на каждый вывод; вывод без цитаты — кандидат на выдумку.', en: 'Demand a citation for every conclusion; a conclusion without one is a fabrication candidate.' },
    ],
  },
]

export const PROMPT_KIT: NotebookPrompt[] = [
  {
    id: 'compare-table',
    label: { ru: 'Сравнение в таблицу', en: 'Comparison table' },
    prompt: {
      ru: 'Сравни, как источники отвечают на вопрос [твой вопрос], таблицей: строка на источник, колонки — позиция, аргумент, цитата. В колонке «цитата» — дословная фраза из источника, не пересказ.',
      en: 'Compare how the sources answer [your question] in a table: one row per source, columns — position, argument, quote. The "quote" column must hold a verbatim phrase from the source, not a retelling.',
    },
  },
  {
    id: 'cited-answers',
    label: { ru: 'Вопросы с цитатами', en: 'Questions with citations' },
    prompt: {
      ru: 'Ответь на вопрос [твой вопрос] только по загруженным источникам. К каждому утверждению — цитата с указанием источника. Если в источниках ответа нет, скажи это прямо, не отвечай из общих знаний.',
      en: 'Answer [your question] using the uploaded sources only. Attach a source quote to every claim. If the sources do not contain the answer, say so directly — do not answer from general knowledge.',
    },
  },
  {
    id: 'audio-brief',
    label: { ru: 'Аудио-обзор с фокусом', en: 'Focused audio overview' },
    prompt: {
      ru: 'Сделай короткий аудио-обзор с фокусом на [трудная для тебя тема]. Пусть ведущие называют, из какого источника берут каждый тезис, и дают цитату — тезис без источника пропускай.',
      en: 'Create a short audio overview focused on [the topic you find hard]. Have the hosts name which source each point comes from and give a quote — skip any point without a source.',
    },
  },
  {
    id: 'mind-map',
    label: { ru: 'Карта связей', en: 'Mind map' },
    prompt: {
      ru: 'Построй карту связей между [тема А] и [тема Б] по источникам. Для каждой связи укажи источник и цитату, на которой связь держится.',
      en: 'Build a mind map linking [topic A] and [topic B] from the sources. For every link, name the source and the quote the link rests on.',
    },
  },
  {
    id: 'slides',
    label: { ru: 'Слайды по источникам', en: 'Slides from sources' },
    prompt: {
      ru: 'Собери слайды по теме [тема] строго из загруженных источников. На каждом слайде — сноска: источник и цитата. Слайд без сноски убери.',
      en: 'Assemble slides on [topic] strictly from the uploaded sources. Every slide carries a footnote: source and quote. Remove any slide without one.',
    },
  },
]

export const VERIFY_CHECKLIST: Bi[] = [
  { ru: 'Кликни две-три цитаты: они обязаны вести в точку источника, где эта фраза действительно стоит.', en: 'Click two or three citations: they must land on the exact spot in the source where the phrase actually appears.' },
  { ru: 'Уверенный ответ без единой цитаты — пересказ. Переспроси с требованием цитат.', en: 'A confident answer with no citation at all is a retelling. Re-ask and demand citations.' },
  { ru: 'Числа и проценты сверяй с источником отдельно: именно на них пересказ чаще всего плывёт.', en: 'Check numbers and percentages against the source separately: that is where retellings drift most.' },
  { ru: 'Спроси о том, чего в источниках заведомо нет. Честный ответ — «в источниках этого нет», а не ответ из головы.', en: 'Ask about something you know is not in the sources. The honest reply is "the sources do not cover this," not an answer from memory.' },
  { ru: 'Вывод, который держится на одном источнике, не выдавай за консенсус — проверь, кто ещё это утверждает.', en: 'Do not pass off a single-source conclusion as consensus — check who else actually claims it.' },
  { ru: 'Ролик без субтитров — пустой источник: тетрадка «читала» не его, а свои общие знания.', en: 'A video without subtitles is an empty source: the notebook "read" its general knowledge, not the video.' },
]

export interface ResolvedNotebookPack {
  id: string
  icon: string
  title: string
  situation: string
  sources: string
  steps: { n: number; text: string }[]
}

export function resolveNotebookPack(id: string, locale: Locale): ResolvedNotebookPack | null {
  const p = PACKS.find(x => x.id === id)
  if (!p) return null
  return {
    id: p.id, icon: p.icon,
    title: p.title[locale], situation: p.situation[locale], sources: p.sources[locale],
    steps: p.steps.map((s, i) => ({ n: i + 1, text: s[locale] })),
  }
}

export function resolvePromptKit(locale: Locale) {
  return PROMPT_KIT.map(p => ({ id: p.id, label: p.label[locale], prompt: p.prompt[locale] }))
}

export function resolveChecklist(locale: Locale) {
  return VERIFY_CHECKLIST.map(b => b[locale])
}
