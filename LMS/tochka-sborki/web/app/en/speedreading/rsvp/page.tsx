import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { RsvpReader } from '@/components/speedreading/rsvp-reader'

export const metadata: Metadata = {
  title: 'RSVP reader — Speed Reading',
  description: 'A speed-reading trainer: words flashed at an adjustable rate (in preparation).',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 .5rem', color: 'var(--text-primary)' }}>RSVP reader</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Words appear one at a time. Set a comfortable pace and keep your eyes on the colored pivot letter.
        </p>
        <RsvpReader locale="en" />
      </main>
    </>
  )
}
