// web/lib/dungeon/types.ts
import type { Locale, WorldSkin } from '@/lib/intake/types'
import type { Bi } from '@/lib/rpg/types'

export type StageTier = 'task' | 'process' | 'outcome'

export interface DungeonStage { id: string; tier: StageTier; body: string; cs: number }
export interface DungeonBoss { id: string; name: string; body: string; cs: number }

export interface DungeonView {
  niche: string
  module: string
  locked: boolean
  dungeonName: string
  intro: string
  stages: DungeonStage[]
  boss: DungeonBoss
}

export interface NicheFlavor { dungeonName: Bi; bossName: Bi; intro: Bi; bossChallenge: Bi }

export interface DungeonInput {
  locale: Locale
  skin: WorldSkin // reserved for future skin-aware dungeon chrome; not used by buildDungeon yet
  niche: string | null
  outcome: string | null
  isModuleCompleted: (moduleSlug: string) => boolean
}
