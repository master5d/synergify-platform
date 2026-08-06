// lib/authoring/sample-outline.ts
// A tiny, de-hustle-clean example outline the CLI materializes into a NON-colliding
// `01-sample` demo. (The hand-authored `01-example` in _template is the richer reference
// stub documenting the engine's MDX component palette — the scaffolder must not clobber it.)
import type { CourseOutline } from './outline'

export const SAMPLE_OUTLINE: CourseOutline = {
  name: { ru: 'Пример курса', en: 'Example Course' },
  modules: [
    {
      slug: '01-sample', level: 1,
      title: { ru: 'Пример модуля', en: 'Example module' },
      description: { ru: 'Как устроен модуль курса', en: 'How a course module is shaped' },
      units: [
        {
          slug: 'u1-intro',
          title: { ru: 'Знакомство', en: 'Getting started' },
          objective: { ru: 'Понять, зачем этот модуль', en: 'Understand why this module exists' },
        },
        {
          slug: 'u2-practice',
          title: { ru: 'Первый шаг', en: 'First step' },
          objective: { ru: 'Сделать один конкретный шаг', en: 'Take one concrete step' },
        },
      ],
    },
  ],
}
