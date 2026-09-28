// Canonical module order — mirrors content/{ru,en}/ directory order. Engine config:
// the Worker can't import web content, so the ordered slug list lives here.
export const MODULE_ORDER = [
  '00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection',
  '04-prompt-engineering', '05-context-memory', '06-audio-pipeline', '07-tools',
  '08-agent-engineering',
] as const

type Bi = { ru: string; en: string }

/** Существенная переработка модуля = поле `revision` в `_meta.json` (ru/en: version и date общие,
 *  summary на языке файла). Нет поля = версия 1. Шаг письма `update` (lib/email-chains.ts). */
export interface ModuleRevision { version: number; date: string; summary: Bi }

/** Название модуля (ru/en = `title` из `_meta.json`), его трансформация «было → стало»
 *  (зеркало web `lib/rpg/transformations.ts`) и ревизия (`revision` из `_meta.json`). Воркер не
 *  видит контент — копия здесь, расхождение ловит course-order.test.ts. Письма берут отсюда. */
export const MODULE_META: Record<string, { title: Bi; from: Bi; to: Bi; revision?: ModuleRevision }> = {
  '00-kickstart': {
    title: { ru: 'Kickstart', en: 'Kickstart' },
    from: { ru: 'теряюсь в терминах ИИ', en: 'lost in AI jargon' },
    to: { ru: 'вижу карту местности', en: 'I see the lay of the land' },
  },
  '01-introduction': {
    title: { ru: 'Знакомство', en: 'Introduction' },
    from: { ru: '«ИИ — это про код»', en: '"AI is about code"' },
    to: { ru: 'понимаю четыре сдвига Software 3.0', en: 'I grasp the four shifts of Software 3.0' },
  },
  '02-setup-guide': {
    title: { ru: 'Базовый сетап', en: 'Setup' },
    from: { ru: 'пустой терминал пугает', en: 'an empty terminal is scary' },
    to: { ru: 'инструменты под рукой', en: 'my tools are set up and at hand' },
  },
  '03-stack-selection': {
    title: { ru: 'Выбор стека', en: 'Stack selection' },
    from: { ru: '«какой ИИ выбрать?»', en: '"which AI do I pick?"' },
    to: { ru: 'осознанно выбрал свой стек', en: "I've consciously chosen my stack" },
  },
  '04-prompt-engineering': {
    title: { ru: 'Промпт-инжиниринг', en: 'Prompt Engineering' },
    from: { ru: 'прошу — получаю не то', en: 'I ask — I get the wrong thing' },
    to: { ru: 'формулирую так, что агент понимает', en: 'I phrase it so the agent understands' },
  },
  '05-context-memory': {
    title: { ru: 'Контекст и память', en: 'Context & Memory' },
    from: { ru: 'агент забывает контекст', en: 'the agent forgets context' },
    to: { ru: 'держу контекст и память', en: 'I hold context and memory' },
  },
  '06-audio-pipeline': {
    title: { ru: 'Pipeline автоматизации', en: 'Automation Pipeline' },
    from: { ru: 'данные разрознены', en: 'data is scattered' },
    to: { ru: 'строю pipeline сырое → инсайт', en: 'I build a pipeline from raw to insight' },
  },
  '07-tools': {
    title: { ru: 'Инструменты расширения', en: 'Tools & Extensions' },
    from: { ru: 'агент в вакууме', en: 'the agent works in a vacuum' },
    to: { ru: 'подключаю инструменты, навыки, хуки', en: 'I plug in tools, skills, hooks' },
  },
  '08-agent-engineering': {
    title: { ru: 'Агентский инжиниринг', en: 'Agent Engineering' },
    from: { ru: 'делаю всё руками', en: 'I do everything by hand' },
    to: { ru: 'оркеструю агентов под задачу', en: 'I orchestrate agents for the task' },
  },
  '09-ai-notebook': {
    title: { ru: 'AI-тетрадка', en: 'AI Notebook' },
    from: { ru: 'смотрю часами', en: 'watch for hours' },
    to: { ru: 'извлекаю с уликами', en: 'extract with evidence' },
  },
  '10-model-training': {
    title: { ru: 'Обучение моделей', en: 'Model Training' },
    from: { ru: '«модель — чёрный ящик»', en: '"the model is a black box"' },
    to: { ru: 'знаю, когда хватит промпта, а когда учить модель', en: 'I know when a prompt is enough and when to train a model' },
  },
}

/** Модуль «AI-тетрадка» (вне спайна). */
export const NOTEBOOK_MODULE_SLUG = '09-ai-notebook'

export interface NextLesson { slug: string; resume: boolean }

// Earliest module not completed. resume = it was viewed but not completed.
// null when every module is completed.
export function nextLesson(completed: Set<string>, viewed: Set<string>): NextLesson | null {
  for (const slug of MODULE_ORDER) {
    if (!completed.has(slug)) return { slug, resume: viewed.has(slug) }
  }
  return null
}

export function lessonUrl(slug: string, locale: 'ru' | 'en'): string {
  const base = locale === 'en' ? 'https://ai.synergify.com/en' : 'https://ai.synergify.com'
  return `${base}/lessons/${slug}/`
}

/** Академия (LMS/registry.json → academy.url): вход открывается после прохождения Точки Сборки. */
export function academyUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://academy.synergify.com/en/' : 'https://academy.synergify.com/'
}

export function certificateUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://ai.synergify.com/en/certificate/' : 'https://ai.synergify.com/certificate/'
}

export function homeUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://ai.synergify.com/en/' : 'https://ai.synergify.com/'
}

/** «Поддержать» (донат) — кнопка Telegram-бота /support. */
export function supportUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://ai.synergify.com/en/support/' : 'https://ai.synergify.com/support/'
}

/** Служба заботы курса (волна 18). Не /support/ — там «Поддержать» (донат), учебные письма туда не ведут. */
export function careUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://ai.synergify.com/en/care/' : 'https://ai.synergify.com/care/'
}

export function storeUrl(locale: 'ru' | 'en'): string {
  // Магазин живёт на личном сайте владельца, не на домене курса.
  return locale === 'en' ? 'https://mamaev.coach/en/store/' : 'https://mamaev.coach/store/'
}
