import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SchulteTable } from '@/components/speedreading/schulte-table'

export const metadata: Metadata = {
  title: 'Таблицы Шульте — Скорочтение',
  description: 'Тренажёр периферийного зрения: находи числа по порядку (готовится).',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 .5rem', color: 'var(--text-primary)' }}>Таблицы Шульте</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Держи взгляд на точке в центре и находи числа по порядку, замечая их боковым зрением.
        </p>
        <SchulteTable locale="ru" />
      </main>
    </>
  )
}
