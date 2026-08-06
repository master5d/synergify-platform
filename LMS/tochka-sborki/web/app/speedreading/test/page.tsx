import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { WpmTest } from '@/components/speedreading/wpm-test'

export const metadata: Metadata = {
  title: 'Тест скорости — Скорочтение',
  description: 'Замерь скорость чтения с поправкой на понимание.',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 .5rem', color: 'var(--text-primary)' }}>Тест скорости чтения</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Прочитай короткий текст, ответь на вопросы и увидь свою скорость с поправкой на понимание. Повтори позже, чтобы сравнить.
        </p>
        <WpmTest locale="ru" />
      </main>
    </>
  )
}
