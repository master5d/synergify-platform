// lib/speedreading/local-date.ts
// Локальная дата YYYY-MM-DD для логов сессий. В LMS жила в lib/quests/daily-store;
// академия квестов не имеет — переносим только эту функцию.
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
