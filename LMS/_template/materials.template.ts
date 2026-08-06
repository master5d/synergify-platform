// TEMPLATE — copy to web/lib/materials.ts and fill in. Declarative Course Materials manifest;
// the engine renders any course's materials from this data (MaterialsSection).
import type { Bi } from './course'

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
    label: { ru: 'TODO: Группа', en: 'TODO: Group' },
    items: [
      // template → downloadable file in web/public/materials/
      { kind: 'template', title: { ru: 'TODO', en: 'TODO' }, href: '/materials/TODO.md' },
      // link → internal course route
      { kind: 'link', title: { ru: 'Шпаргалка', en: 'Cheatsheet' }, href: '/cheatsheet/' },
      // tool → external (mark external: true)
      { kind: 'tool', title: { ru: 'TODO', en: 'TODO' }, href: 'https://TODO.example.com', external: true },
    ],
  },
]
