'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ProgressState = 'none' | 'viewed' | 'completed'

interface ProgressRow {
  lesson_slug: string
  viewed_at: number
  completed_at: number | null
}

interface ProgressContextValue {
  getState: (slug: string) => ProgressState
  markViewed: (slug: string) => Promise<void>
  markCompleted: (slug: string) => Promise<void>
  loaded: boolean
  /** Есть сессия: /api/progress/list ответил 200 (он под requireAuth). До ответа — false. */
  authed: boolean
}

const ProgressContext = createContext<ProgressContextValue>({
  getState: () => 'none',
  markViewed: async () => {},
  markCompleted: async () => {},
  loaded: false,
  authed: false,
})

export function useProgress(): ProgressContextValue {
  return useContext(ProgressContext)
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progressMap, setProgressMap] = useState<Map<string, ProgressState>>(new Map())
  const [loaded, setLoaded] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/progress/list', { credentials: 'include' })
      .then(r => {
        if (!r.ok) return []
        setAuthed(true)
        return r.json() as Promise<ProgressRow[]>
      })
      .then(rows => {
        const map = new Map<string, ProgressState>()
        for (const row of rows) {
          map.set(row.lesson_slug, row.completed_at ? 'completed' : 'viewed')
        }
        setProgressMap(map)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const markViewed = useCallback(async (slug: string) => {
    if (progressMap.get(slug)) return
    await fetch('/api/progress/view', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_slug: slug }),
    }).catch(() => {})
    setProgressMap(prev => {
      const next = new Map(prev)
      if (!next.get(slug)) next.set(slug, 'viewed')
      return next
    })
  }, [progressMap])

  const markCompleted = useCallback(async (slug: string) => {
    await fetch('/api/progress/complete', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_slug: slug }),
    }).catch(() => {})
    setProgressMap(prev => {
      const next = new Map(prev)
      next.set(slug, 'completed')
      return next
    })
  }, [])

  const getState = useCallback((slug: string): ProgressState => {
    return progressMap.get(slug) ?? 'none'
  }, [progressMap])

  return (
    <ProgressContext.Provider value={{ getState, markViewed, markCompleted, loaded, authed }}>
      {children}
    </ProgressContext.Provider>
  )
}
