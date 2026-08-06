// web/lib/cs/award.ts
import type { Mode } from './types'
import { MODE } from './modes'

export const PHASE_BASE = { activation: 5, reflection: 25, concept: 25, practice: 15 } as const

export const BASE_TOTAL =
  PHASE_BASE.activation + PHASE_BASE.reflection + PHASE_BASE.concept + PHASE_BASE.practice // 70

export function computeUnitCS(mode: Mode): number {
  return Math.round(BASE_TOTAL * MODE[mode].multiplier) // 70 / 105 / 175
}
