import { REST_DAILY, REST_STREAK, LAPSE_DAYS } from '@/lib/pacing/thresholds'
import type { PacingState } from '@/lib/pacing/types'
import type { NudgeContext, SelectedNudge } from './types'

export function selectNudge(state: PacingState, ctx: NudgeContext, today: string): SelectedNudge | null {
  const blocked = (key: string) => state.dismissed[key] === today

  if (ctx.daysSinceActive >= LAPSE_DAYS && ctx.hasIncomplete && !blocked('reengage')) {
    return { kind: 'reengage' }
  }
  if ((ctx.todayCount >= REST_DAILY || ctx.recentDowngrade) && !blocked('checkin')) {
    return { kind: 'checkin' }
  }
  if ((ctx.todayCount >= REST_DAILY || ctx.currentStreak >= REST_STREAK) && !blocked('rest')) {
    return { kind: 'rest' }
  }
  if (ctx.freshModule && !state.calibration[ctx.freshModule.slug] && !blocked(`calibrate:${ctx.freshModule.slug}`)) {
    return { kind: 'calibrate', moduleSlug: ctx.freshModule.slug, moduleTitle: ctx.freshModule.title }
  }
  return null
}
