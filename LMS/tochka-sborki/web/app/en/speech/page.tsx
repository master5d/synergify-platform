import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SpeechSyllabus } from '@/components/speech-syllabus'

export const metadata: Metadata = {
  title: 'The Art of Speaking — Tochka Sborki',
  description: 'A course on the art of speaking (in preparation).',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <SpeechSyllabus locale="en" />
      </main>
    </>
  )
}
