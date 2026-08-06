import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SchulteTable } from '@/components/speedreading/schulte-table'

export const metadata: Metadata = {
  title: 'Schulte tables — Speed Reading',
  description: 'A peripheral-vision trainer: find the numbers in order (in preparation).',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 .5rem', color: 'var(--text-primary)' }}>Schulte tables</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Keep your eyes on the center dot and find the numbers in order, catching them with your side vision.
        </p>
        <SchulteTable locale="en" />
      </main>
    </>
  )
}
