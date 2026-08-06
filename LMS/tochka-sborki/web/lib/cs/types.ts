// web/lib/cs/types.ts
import type { Bi } from '@/lib/rpg/types'

export type Mode = 'commander' | 'copilot' | 'archmage'
export type ChallengeTier = 'task' | 'process' | 'outcome'

export interface ModeConfig {
  multiplier: number
  hintVisible: boolean
  challengeTier: ChallengeTier
  label: Bi
  desc: Bi
}

export interface Wallet {
  balance: number
  earnedUnits: string[]
  unlocks: string[]
  modeByUnit: Record<string, Mode>
}

export interface IntakeLite {
  niche?: string | null
  outcome?: string | null
}

export interface ChallengeFraming {
  task: Bi
  process: Bi
  outcome: Bi
  outcomeGeneric: Bi
}

export const STORAGE_KEY = 'cs_wallet'

export const DEFAULT_WALLET: Wallet = Object.freeze({
  balance: 0,
  earnedUnits: Object.freeze([]) as unknown as string[],
  unlocks: Object.freeze([]) as unknown as string[],
  modeByUnit: Object.freeze({}) as Record<string, Mode>,
})

export const SKIN_UNLOCK_COST = 300
