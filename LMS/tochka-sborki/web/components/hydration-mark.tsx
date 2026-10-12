'use client'
import { useEffect } from 'react'
import { markHydrated } from '@/lib/mirror-watchdog'

// Отметка «страница ожила» для сторожа зеркала (lib/mirror-watchdog.ts): флаг на window и уборка уже
// показанной плашки. Ничего не рендерит.
export function HydrationMark() {
  useEffect(() => {
    markHydrated(window as unknown as Record<string, unknown>, document)
  }, [])
  return null
}
