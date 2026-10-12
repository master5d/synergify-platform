'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { IS_MIRROR } from '@/lib/mirror'
import {
  loadLessonProgress, mergeLessonProgress, nextLessonState, saveLessonProgress, type LessonStateMap,
} from '@/lib/mirror-progress'

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

function LiveProgressProvider({ children }: { children: React.ReactNode }) {
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

function browserStorage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.localStorage } catch { return null }
}

function MirrorProgressProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<LessonStateMap>({})
  const [loaded, setLoaded] = useState(false)

  // Дочерние эффекты (markViewed на странице урока) идут раньше этого — слияние, а не замена,
  // иначе ранняя отметка перезаписала бы сохранённый прогресс.
  useEffect(() => {
    setMap(prev => mergeLessonProgress(loadLessonProgress(browserStorage()), prev))
    setLoaded(true)
  }, [])

  // Пишем только после загрузки: до неё в storage лежит старая карта, и её нельзя затереть.
  useEffect(() => {
    if (loaded) {
      const s = browserStorage()
      saveLessonProgress(s, mergeLessonProgress(loadLessonProgress(s), map))
    }
  }, [map, loaded])

  const update = useCallback((slug: string, to: 'viewed' | 'completed') => {
    setMap(prev => nextLessonState(prev, slug, to))
  }, [])

  const markViewed = useCallback(async (slug: string) => { update(slug, 'viewed') }, [update])
  const markCompleted = useCallback(async (slug: string) => { update(slug, 'completed') }, [update])
  const getState = useCallback((slug: string): ProgressState => map[slug] ?? 'none', [map])

  return (
    <ProgressContext.Provider value={{ getState, markViewed, markCompleted, loaded, authed: false }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  return IS_MIRROR
    ? <MirrorProgressProvider>{children}</MirrorProgressProvider>
    : <LiveProgressProvider>{children}</LiveProgressProvider>
}
