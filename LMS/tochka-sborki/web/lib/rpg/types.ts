import type { WorldSkin, CharacterClass, Locale } from '../intake/types'

export type Bi = { ru: string; en: string }

export interface UnitFraming {
  intro: Bi        // shown at Activation (currentStep 0)
  mentorHint: Bi   // shown at Practice (currentStep 3)
  outro: Bi        // shown in the done state
}

export interface SkinPack {
  skin: WorldSkin
  zoneNames: Record<string, Bi>   // slug -> zone name
  questTitles: Record<string, Bi> // slug -> quest title
  units?: Record<string, UnitFraming> // "<moduleSlug>/<unitSlug>" -> framing
}

export interface SkinMeta {
  skin: WorldSkin
  accent: string                  // hex
  glyph: string                   // emoji
  displayName: Bi
  mentor?: { name: Bi; glyph: string } // named persona for hint box
  companion?: { name: Bi; glyph: string; vibe: Bi } // playful familiar/sidekick, distinct from the mentor («Machine Elves»)
  decoder?: Bi   // plain-language «что одевает твой мир» — для онбординг-моста
}

export type QuestStatus = 'completed' | 'current' | 'todo'

export interface ZoneVM {
  slug: string
  order: number                   // position in class order (0-based)
  zoneName: string                // localized
  questTitle: string              // localized
  moduleTitle: string             // real module title (subtitle)
  durationLabel: string
  status: QuestStatus
  isNiche: boolean
  href: string
  transform?: { from: string; to: string } // module micro-transformation, localized
}

export interface QuestLogVM {
  zones: ZoneVM[]
  summary: {
    completedCount: number
    total: number
    legendaryTitle: string
    charClass: CharacterClass
    skin: WorldSkin
    level: number
  }
}

export type { WorldSkin, CharacterClass, Locale }
