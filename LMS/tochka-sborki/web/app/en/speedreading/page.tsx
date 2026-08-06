import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SpeedreadingSyllabus } from '@/components/speedreading-syllabus'
import { SpeedreadingHub } from '@/components/speedreading/speedreading-hub'

export const metadata: Metadata = {
  title: 'Speed Reading — Tochka Sborki',
  description: 'Speed-reading trainers: RSVP reader, Schulte tables, a speed test with comprehension check. Working now; lessons in progress.',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <SpeedreadingSyllabus locale="en" />
        <SpeedreadingHub locale="en" />
      </main>
    </>
  )
}
