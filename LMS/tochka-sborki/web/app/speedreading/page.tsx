import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SpeedreadingSyllabus } from '@/components/speedreading-syllabus'
import { SpeedreadingHub } from '@/components/speedreading/speedreading-hub'

export const metadata: Metadata = {
  title: 'Скорочтение — Точка Сборки',
  description: 'Тренажёры скорочтения: RSVP-ридер, таблицы Шульте, замер скорости с проверкой понимания. Работают прямо сейчас, уроки в работе.',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <SpeedreadingSyllabus locale="ru" />
        <SpeedreadingHub locale="ru" />
      </main>
    </>
  )
}
