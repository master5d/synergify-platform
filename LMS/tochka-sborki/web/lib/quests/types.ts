// web/lib/quests/types.ts
import type { Locale, WorldSkin } from '@/lib/intake/types'

export type QuestKind = 'advance' | 'practice' | 'retrieval' | 'complete'

export interface DailyQuest {
  id: string          // stable: advance:<module>/<unit> | practice:<module> | retrieval:<module> | complete
  kind: QuestKind
  title: string       // localized heading
  body: string        // localized body (unit title, applied challenge, or recall prompt)
  cs: number          // CS awarded on self-complete (0 for advance/complete)
  module?: string     // owning module slug (absent for 'complete')
  unit?: string       // target unit slug (advance only)
  href?: string       // link to open (advance only)
}

export interface DailySet {
  date: string        // YYYY-MM-DD (local)
  quests: DailyQuest[]
}

export interface DailyInput {
  date: string
  locale: Locale
  skin: WorldSkin
  cogTier: number
  niche: string | null
  outcome: string | null
  unitsByModule: Record<string, { slug: string; title: string }[]> // ordered units per module slug
  isUnitDone: (moduleSlug: string, unitSlug: string) => boolean     // from unit_progress
  completedModules: string[]                                        // module-level 'completed' slugs
}
