// packs/retreat/materials.ts
// Манифест материалов курса. Шаблоны для практики (public/materials/retreat/) и страницы курса
// добавляются в задачах плана, когда их файлы появятся; до тех пор — только ссылки на академию.
import type { Bi } from './course.config'

export type MaterialKind = 'template' | 'link' | 'tool'

export interface Material {
  kind: MaterialKind
  title: Bi
  description?: Bi
  href: string
  /** True for off-site links (open in a new tab). Keep in sync with the href. */
  external?: boolean
}

export interface MaterialGroup {
  label: Bi
  items: Material[]
}

/** http(s):// → external; anything else (relative path) is internal. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href)
}

export const COURSE_MATERIALS: MaterialGroup[] = [
  {
    label: { ru: 'Ссылки', en: 'Links' },
    items: [
      {
        kind: 'link',
        title: { ru: 'Манифест школы синергемы', en: 'The Synergema School manifesto' },
        description: {
          ru: 'Откуда этот курс и на каких правилах стоит академия',
          en: 'Where this course comes from and the rules the academy stands on',
        },
        href: 'https://academy.synergify.com/',
        external: true,
      },
      {
        kind: 'link',
        title: { ru: 'Правила дома', en: 'House rules' },
        description: {
          ru: 'Правила академии: слова имеют происхождение, выход ничего не стоит',
          en: 'The academy rules: words have origins, the exit costs nothing',
        },
        href: 'https://academy.synergify.com/pravila/',
        external: true,
      },
    ],
  },
]
