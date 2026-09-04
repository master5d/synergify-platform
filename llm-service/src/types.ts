/** Зеркало типов воркера. Расхождение ловит test/types-drift.test.ts. */

export const WORLD_SKINS = [
  'slavic-myth', 'dark-fantasy', 'cyber-noir', 'space-opera',
  'anime-quest', 'soviet-heroic', 'mystic-arcane', 'wanderer',
] as const
export type WorldSkin = typeof WORLD_SKINS[number]

export interface ProseInput {
  charClass: string; worldSkin: string; language: string
  register?: string; niche?: string | null
  attributes?: Record<string, number>
  aspirational?: string; firstWin?: string; successDef?: string
}

export interface ProseOut {
  legendaryTitle: string; backstory: string; firstQuest: string; finalBoss: string
}

export interface CatalogEntry { slug: string; topic: { ru: string; en: string } }
export interface Signal { source: string; text: string }

export interface DemandClassification {
  classification: 'covered' | 'gap' | 'not_feasible' | 'unclassified'
  matched_module: string | null
  gap_topic_key: string | null
  gap_topic_label: { ru: string; en: string } | null
  feasibility_note: string | null
  value_tier: 'high' | 'normal'
}

export interface BriefProposal {
  proposed_type: 'module' | 'unit'
  title: { ru: string; en: string }
  learning_objective: string
  slot: string
  agentic_approach: string
  unit_count_estimate: number
  source_quotes: string[]
}
