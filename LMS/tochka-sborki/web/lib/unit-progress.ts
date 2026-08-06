'use client'

import { useState, useEffect, useCallback } from 'react'

export type UnitProgressMap = Record<string, Record<string, boolean>>

export const STORAGE_KEY = 'unit_progress'

/**
 * Разбор того, что лежит в localStorage.
 *
 * Хранилище переживает версии приложения и чужие вкладки, поэтому там может
 * оказаться что угодно: обрезанный JSON, строка, массив, null. Раньше разбор
 * возвращал результат `JSON.parse` как есть, и на строке `markCompleted` делал
 * `{...'abc'}` — прогресс превращался в `{0:'a',1:'b'}` и молча оставался таким.
 * Валидные данные разбираются ровно как прежде; чинится только мусор.
 */
export function parseProgress(raw: string | null): UnitProgressMap {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: UnitProgressMap = {}
    for (const [moduleSlug, units] of Object.entries(parsed)) {
      if (!units || typeof units !== 'object' || Array.isArray(units)) continue
      const clean: Record<string, boolean> = {}
      for (const [unitSlug, done] of Object.entries(units as Record<string, unknown>)) {
        if (done === true) clean[unitSlug] = true      // хранится только пройденное
      }
      out[moduleSlug] = clean
    }
    return out
  } catch {
    return {}
  }
}

/** Пройден ли юнит. Отсутствующий модуль — это не ошибка, а «ещё не начинал». */
export function isUnitCompleted(map: UnitProgressMap, moduleSlug: string, unitSlug: string): boolean {
  return map[moduleSlug]?.[unitSlug] === true
}

/**
 * Отметить юнит пройденным. Новая карта, вход не мутируется: прогресс живёт
 * в состоянии React, и правка на месте не вызвала бы перерисовку.
 */
export function markUnit(map: UnitProgressMap, moduleSlug: string, unitSlug: string): UnitProgressMap {
  return { ...map, [moduleSlug]: { ...(map[moduleSlug] ?? {}), [unitSlug]: true } }
}

/** Сколько юнитов пройдено — во всём курсе или в одном модуле. */
export function completedCount(map: UnitProgressMap, moduleSlug?: string): number {
  const scope = moduleSlug ? { [moduleSlug]: map[moduleSlug] ?? {} } : map
  return Object.values(scope).reduce(
    (n, units) => n + Object.values(units).filter(Boolean).length,
    0,
  )
}

function readProgress(): UnitProgressMap {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY))
  } catch {
    return {}
  }
}

function writeProgress(map: UnitProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

export function useUnitProgress() {
  const [progress, setProgress] = useState<UnitProgressMap>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setProgress(readProgress())
    setReady(true)
  }, [])

  const isCompleted = useCallback(
    (moduleSlug: string, unitSlug: string): boolean => isUnitCompleted(progress, moduleSlug, unitSlug),
    [progress]
  )

  const markCompleted = useCallback((moduleSlug: string, unitSlug: string) => {
    setProgress(prev => {
      const next = markUnit(prev, moduleSlug, unitSlug)
      writeProgress(next)
      return next
    })
  }, [])

  return { isCompleted, markCompleted, ready }
}
