export const THROTTLE_SEC = 20 * 60 * 60        // 20h — at most one nudge/day; dedupes double cron runs
export const ACTIVE_SEC = 20 * 60 * 60          // 20h — skip if the learner was just active
export const LAPSE_SEC = 14 * 24 * 60 * 60      // 14d — stop nudging the lapsed

export interface NudgeInput {
  optout: boolean
  lastNudgeAt: number | null
  lastActivityAt: number      // MAX(viewed, completed) ?? created_at
  hasIncomplete: boolean
  nowSec: number
}

// Priority guard-chain (mirrors web wellbeing/select-nudge): returns whether to send today.
export function shouldNudge(i: NudgeInput): boolean {
  if (i.optout) return false
  if (!i.hasIncomplete) return false
  if (i.lastNudgeAt != null && i.nowSec - i.lastNudgeAt < THROTTLE_SEC) return false
  if (i.nowSec - i.lastActivityAt < ACTIVE_SEC) return false
  if (i.nowSec - i.lastActivityAt > LAPSE_SEC) return false
  return true
}
