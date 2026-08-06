// web/lib/dungeon/use-dungeon.ts
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { DungeonInput } from './types'
import { buildDungeon } from './build-dungeon'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { readDungeon, writeDungeon, markCleared, type DungeonStore } from './dungeon-store'
import { useShards } from '@/lib/cs/use-shards'

export function useDungeon(params: DungeonInput) {
  const { credit, ready: shardsReady } = useShards()
  const [store, setStore] = useState<DungeonStore | null>(null)

  useEffect(() => {
    setStore(readDungeon())
  }, [])

  const view = useMemo(
    () => buildDungeon(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.locale, params.skin, params.niche, params.outcome, params.isModuleCompleted],
  )

  const isCleared = useCallback(
    (id: string): boolean => store?.clearedIds.includes(id) ?? false,
    [store],
  )

  const clear = useCallback(
    (id: string, cs: number) => {
      setStore(prev => {
        const base = prev ?? { clearedIds: [] }
        if (base.clearedIds.includes(id)) return base
        const next = markCleared(base, id)
        writeDungeon(next)
        return next
      })
      credit(id, cs) // key is already namespaced (dungeon:<niche>:…); applyCredit is idempotent
    },
    [credit],
  )

  const bossCleared = isCleared(view.boss.id)

  return { view, isCleared, clear, bossCleared, ready: store !== null && shardsReady }
}

// Lightweight read for the World Map flip (no CS, no build).
export function useNicheDungeonCleared(niche: string | null): boolean {
  const [cleared, setCleared] = useState(false)
  useEffect(() => {
    const n = niche && FLAVOR_BANK[niche] ? niche : 'other'
    setCleared(readDungeon().clearedIds.includes(`dungeon:${n}:boss`))
  }, [niche])
  return cleared
}
