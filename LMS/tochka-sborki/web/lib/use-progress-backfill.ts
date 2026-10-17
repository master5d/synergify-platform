'use client'

// Хук досылки прогресса после логина (логика и тесты — lib/progress-backfill.ts). Зовётся со страницы
// урока, где известен outline курса. Один раз на сессию вкладки: флаг ставится только когда сервер
// ответил сессией, — вход в той же вкладке (Google OAuth) ещё даст досылку. На зеркале API нет.
import { useEffect, useRef } from 'react'
import { COURSE } from '@/lib/course'
import { IS_MIRROR } from '@/lib/mirror'
import { backfillCompletions, backfillEnabled, backfillSessionKey } from './progress-backfill'
import { STORAGE_KEY } from './unit-progress'
import type { CourseOutline } from './progress-sync'

export function useProgressBackfill(outline?: CourseOutline): void {
  // Один запуск на монтирование: outline может приходить новым объектом на каждом рендере мастера,
  // и без защёлки анонимный читатель звал бы /api/progress/list на каждом шаге.
  const started = useRef(false)
  useEffect(() => {
    if (!backfillEnabled(COURSE.gates, IS_MIRROR) || !outline || started.current) return
    started.current = true
    const key = backfillSessionKey(COURSE.progressKey)
    try {
      if (sessionStorage.getItem(key)) return
    } catch { /* без sessionStorage — досылка на каждом уроке, это лишь лишний запрос list */ }
    void backfillCompletions({
      course: COURSE.progressKey,
      outline,
      readLocal: () => {
        try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
      },
    }).then((sent) => {
      if (sent === null) return
      try { sessionStorage.setItem(key, '1') } catch { /* см. выше */ }
    })
  }, [outline])
}
