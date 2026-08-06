// lib/breaks/should-break.ts
// Pure trigger decision for the dopamine-break interstitial. Every gate must pass.
import { MIN_BREAK_STEP, BREAK_COOLDOWN_STEPS, MAX_BREAKS_PER_SESSION } from './thresholds'
import type { BreakContext } from './types'

export function shouldBreak(ctx: BreakContext): boolean {
  if (ctx.availableCount <= 0) return false                       // dark-ship: no content
  if (ctx.currentStep < MIN_BREAK_STEP) return false             // skip intro steps
  if (ctx.stepsSinceLastBreak < BREAK_COOLDOWN_STEPS) return false // cooldown
  if (ctx.breaksShownThisSession >= MAX_BREAKS_PER_SESSION) return false // frequency cap
  if (ctx.restMode) return false                                 // don't stack on a rest nudge
  return true
}
