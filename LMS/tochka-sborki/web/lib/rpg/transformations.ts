import type { CourseModuleSlug } from './modules'
import type { Bi, Locale } from './types'

export interface Transformation { from: Bi; to: Bi }

export const MICRO_TRANSFORMATIONS: Record<CourseModuleSlug, Transformation> = {
  '00-kickstart':        { from: { ru: 'теряюсь в терминах ИИ',          en: 'lost in AI jargon' },
                           to:   { ru: 'вижу карту местности',            en: 'I see the lay of the land' } },
  '01-introduction':     { from: { ru: '«ИИ — это про код»',             en: '"AI is about code"' },
                           to:   { ru: 'понимаю четыре сдвига Software 3.0', en: 'I grasp the four shifts of Software 3.0' } },
  '02-setup-guide':      { from: { ru: 'пустой терминал пугает',         en: 'an empty terminal is scary' },
                           to:   { ru: 'инструменты под рукой',           en: 'my tools are set up and at hand' } },
  '03-stack-selection':  { from: { ru: '«какой ИИ выбрать?»',            en: '"which AI do I pick?"' },
                           to:   { ru: 'осознанно выбрал свой стек',      en: "I've consciously chosen my stack" } },
  '04-prompt-engineering': { from: { ru: 'прошу — получаю не то',        en: 'I ask — I get the wrong thing' },
                           to:   { ru: 'формулирую так, что агент понимает', en: 'I phrase it so the agent understands' } },
  '05-context-memory':   { from: { ru: 'агент забывает контекст',        en: 'the agent forgets context' },
                           to:   { ru: 'держу контекст и память',         en: 'I hold context and memory' } },
  '06-audio-pipeline':   { from: { ru: 'данные разрознены',              en: 'data is scattered' },
                           to:   { ru: 'строю pipeline сырое → инсайт',   en: 'I build a pipeline from raw to insight' } },
  '07-tools':            { from: { ru: 'агент в вакууме',                en: 'the agent works in a vacuum' },
                           to:   { ru: 'подключаю инструменты, навыки, хуки', en: 'I plug in tools, skills, hooks' } },
  '08-agent-engineering': { from: { ru: 'делаю всё руками',              en: 'I do everything by hand' },
                           to:   { ru: 'оркеструю агентов под задачу',    en: 'I orchestrate agents for the task' } },
  '09-ai-notebook':      { from: { ru: 'смотрю часами',                  en: 'watch for hours' },
                           to:   { ru: 'извлекаю с уликами',             en: 'extract with evidence' } },
}

export function getTransformation(
  slug: string,
  locale: Locale,
): { from: string; to: string } | null {
  const t = MICRO_TRANSFORMATIONS[slug as CourseModuleSlug]
  return t ? { from: t.from[locale], to: t.to[locale] } : null
}
