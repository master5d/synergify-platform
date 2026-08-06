import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { WpmTest } from '@/components/speedreading/wpm-test'

export const metadata: Metadata = {
  title: 'Reading-speed test — Speed Reading',
  description: 'Measure your reading speed adjusted for comprehension.',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 .5rem', color: 'var(--text-primary)' }}>Reading-speed test</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Read a short text, answer the questions, and see your speed adjusted for comprehension. Take it again later to compare.
        </p>
        <WpmTest locale="en" />
      </main>
    </>
  )
}
