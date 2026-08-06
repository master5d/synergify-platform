// web/lib/quests/use-daily-quests.ts
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Locale, WorldSkin } from '@/lib/intake/types'
import type { DailyQuest } from './types'
import { buildDaily } from './build-daily'
import { readDaily, writeDaily, markDone, localDate, type DailyStore } from './daily-store'
import { useShards } from '@/lib/cs/use-shards'

interface Params {
  locale: Locale
  skin: WorldSkin
  cogTier: number
  niche: string | null
  outcome: string | null
  unitsByModule: Record<string, { slug: string; title: string }[]>
  isUnitDone: (moduleSlug: string, unitSlug: string) => boolean
  completedModules: string[]
}

export function useDailyQuests(params: Params) {
  const { credit, ready: shardsReady } = useShards()
  const [today] = useState(() => localDate())
  const [store, setStore] = useState<DailyStore | null>(null)

  useEffect(() => {
    setStore(readDaily(today))
  }, [today])

  const set = useMemo(
    () => buildDaily({ date: today, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      today,
      params.locale,
      params.skin,
      params.cogTier,
      params.niche,
      params.outcome,
      params.unitsByModule,
      params.isUnitDone,
      params.completedModules,
    ],
  )

  const isDone = useCallback(
    (q: DailyQuest): boolean => {
      if (q.kind === 'complete') return true
      if (q.kind === 'advance') return q.module && q.unit ? params.isUnitDone(q.module, q.unit) : false
      return store?.completedIds.includes(q.id) ?? false
    },
    [store, params.isUnitDone],
  )

  const complete = useCallback(
    (q: DailyQuest) => {
      if (q.cs <= 0) return // advance/complete are not self-checked
      setStore(prev => {
        const base = prev ?? { date: today, completedIds: [] }
        if (base.completedIds.includes(q.id)) return base
        const next = markDone(base, q.id)
        writeDaily(next)
        return next
      })
      credit(`daily:${today}:${q.id}`, q.cs)
    },
    [today, credit],
  )

  const allDone = set.quests.length > 0 && set.quests.every(q => isDone(q))
  const hasRewardable = set.quests.some(q => q.cs > 0)

  // All-done bonus: fires once (credit key is idempotent), only when the set has a rewardable quest
  // (so a tier-1 advance-only day doesn't grant a free bonus on top of the unit's own CS).
  useEffect(() => {
    if (shardsReady && store !== null && allDone && hasRewardable) {
      credit(`daily:${today}:bonus`, 15)
    }
  }, [shardsReady, store, allDone, hasRewardable, today, credit])

  return {
    set,
    isDone,
    complete,
    allDone,
    ready: store !== null && shardsReady,
  }
}
