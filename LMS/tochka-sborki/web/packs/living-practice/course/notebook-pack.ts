// packs/living-practice/course/notebook-pack.ts
// Форма эталона. Методология source-grounded тетрадки курс-агностична (каждый вывод —
// с цитатой), поэтому INTRO/промпт-кит/чек-лист близки к эталону; паков — один честный:
// проверить первоисточники этого курса (MBSR, Уилбер) самому, а не верить пересказу.
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
    ru: 'Source-grounded тетрадка — это конспект, где ответ привязан к загруженным источникам: книгам, PDF, статьям, заметкам. Нормальный результат не просто звучит убедительно, а ведёт цитатой в точку источника.',
    en: 'A source-grounded notebook is a digest tied to the sources you upload: books, PDFs, articles, notes. A useful answer does not just sound convincing; it points back to the exact source with a quote.',
  },
  {
    ru: 'Курс сам ссылается на источники — MBSR Кабат-Зинна, «Бумерит» Уилбера — и шестой урок прямо советует проверять происхождение метода. Этот инструмент — способ проверить и сам курс тоже.',
    en: 'The course cites its own sources — Kabat-Zinn’s MBSR, Wilber’s "Boomeritis" — and lesson six explicitly advises checking where a method comes from. This tool is a way to check this course as well.',
  },
  {
    ru: 'Если отдельной тетрадки нет, промпты работают и в обычном чате с приложенными файлами. Разница только в дисциплине: каждый вывод проси подкрепить цитатой, иначе это пересказ без проверки.',
    en: 'If you do not have a separate notebook tool, the prompts also work in a regular chat with attached files. The discipline is the same: ask for a quote behind every conclusion, otherwise it is an unchecked retelling.',
  },
]

export const PACKS: NotebookPack[] = [
  {
    id: 'course-sources',
    icon: '📚',
    title: { ru: 'Проверить источники курса', en: 'Check the course’s sources' },
    situation: {
      ru: 'Курс ссылается на MBSR и на критику «духовного нарциссизма». Верить пересказу не обязательно — первоисточники доступны.',
      en: 'The course cites MBSR and the critique of "spiritual narcissism". You do not have to trust the retelling — the primary sources are available.',
    },
    sources: {
      ru: 'Открытые описания программы MBSR (статьи Кабат-Зинна), книга Уилбера «Бумерит» (если она у тебя есть), тексты уроков этого курса.',
      en: 'Open descriptions of the MBSR program (Kabat-Zinn’s papers), Wilber’s "Boomeritis" (if you own it), the lesson texts of this course.',
    },
    steps: [
      { ru: 'Сложи источники в новую тетрадку: статьи об MBSR, тексты уроков, что найдёшь из первоисточников.', en: 'Put the sources into a fresh notebook: MBSR papers, the lesson texts, whatever primary sources you can find.' },
      { ru: 'Спроси: «Что из утверждений курса о формате MBSR подтверждается источниками — с цитатами?»', en: 'Ask: "Which of the course’s claims about the MBSR format are confirmed by the sources — with quotes?"' },
      { ru: 'Спроси и обратное: «Где курс упрощает или где источники с ним расходятся?» Расхождения ценнее пересказа.', en: 'Ask the opposite too: "Where does the course simplify, and where do the sources disagree with it?" Disagreements are worth more than a summary.' },
      { ru: 'Пройди чек-лист верификации по двум-трём ответам, прежде чем верить конспекту.', en: 'Run the verification checklist on two or three answers before trusting the digest.' },
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
    id: 'origins',
    label: { ru: 'Происхождение метода', en: 'Origins of a method' },
    prompt: {
      ru: 'По источникам: откуда происходит метод [метод]? Назови традицию, автора и время, и к каждому пункту дай цитату. Если происхождение в источниках не названо, скажи это прямо.',
      en: 'From the sources: where does the method [method] come from? Name the tradition, the author, and the period, with a quote for each point. If the origin is not named in the sources, say so directly.',
    },
  },
]

export const VERIFY_CHECKLIST: Bi[] = [
  { ru: 'Кликни две-три цитаты: они обязаны вести в точку источника, где эта фраза действительно стоит.', en: 'Click two or three citations: they must land on the exact spot in the source where the phrase actually appears.' },
  { ru: 'Уверенный ответ без единой цитаты — пересказ. Переспроси с требованием цитат.', en: 'A confident answer with no citation at all is a retelling. Re-ask and demand citations.' },
  { ru: 'Числа и даты сверяй с источником отдельно: именно на них пересказ чаще всего плывёт.', en: 'Check numbers and dates against the source separately: that is where retellings drift most.' },
  { ru: 'Спроси о том, чего в источниках заведомо нет. Честный ответ — «в источниках этого нет», а не ответ из головы.', en: 'Ask about something you know is not in the sources. The honest reply is "the sources do not cover this," not an answer from memory.' },
  { ru: 'Вывод, который держится на одном источнике, не выдавай за консенсус — проверь, кто ещё это утверждает.', en: 'Do not pass off a single-source conclusion as consensus — check who else actually claims it.' },
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
