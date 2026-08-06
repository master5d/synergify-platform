export type NudgeKind = 'reengage' | 'checkin' | 'rest' | 'calibrate'

export interface NudgeContext {
  daysSinceActive: number
  todayCount: number
  currentStreak: number
  recentDowngrade: boolean
  hasIncomplete: boolean
  freshModule: { slug: string; title: string } | null
  g11: string | null
  outcome: string | null
  questsLeft: number
}

export interface SelectedNudge {
  kind: NudgeKind
  moduleSlug?: string
  moduleTitle?: string
}
