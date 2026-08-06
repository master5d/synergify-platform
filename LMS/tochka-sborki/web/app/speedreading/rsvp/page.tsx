import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { RsvpReader } from '@/components/speedreading/rsvp-reader'

export const metadata: Metadata = {
  title: 'RSVP-читалка — Скорочтение',
  description: 'Тренажёр скорочтения: слова вспышками с регулируемой скоростью (готовится).',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 .5rem', color: 'var(--text-primary)' }}>RSVP-читалка</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Слова показываются по одному. Поставь удобную скорость и держи взгляд на цветной опорной букве.
        </p>
        <RsvpReader locale="ru" />
      </main>
    </>
  )
}
