// web/lib/help/use-help-seen.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

export type SeenMap = Record<string, boolean>

const STORAGE_KEY = 'help_seen'

export function markSeen(map: SeenMap, page: string): SeenMap {
  if (map[page]) return map
  return { ...map, [page]: true }
}

export function isSeen(map: SeenMap, page: string): boolean {
  return map[page] === true
}

function readSeen(): SeenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as SeenMap) : {}
  } catch {
    return {}
  }
}

function writeSeen(map: SeenMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

export function useHelpSeen(page: string) {
  const [map, setMap] = useState<SeenMap | null>(null)

  useEffect(() => {
    setMap(readSeen())
  }, [])

  const dismiss = useCallback(() => {
    setMap(prev => {
      const next = markSeen(prev ?? {}, page)
      writeSeen(next)
      return next
    })
  }, [page])

  return { seen: map ? isSeen(map, page) : false, dismiss, ready: map !== null }
}
