import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { CaptureFormBlock } from '@/components/capture-form-block'
import { getOfficeHours } from '@/lib/course/office-hours'

export const metadata: Metadata = {
  title: 'Open AMA office-hours — Tochka Sborki',
  description:
    'A live group session: bring your questions about agents, your stack and stuck projects. Free; register by email.',
}

export default function Page() {
  const vm = getOfficeHours('en')
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', margin: 0 }}>{vm.eyebrow}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{vm.heading}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{vm.intro}</p>
        <p style={{ color: 'var(--text-secondary)' }}>{vm.ama.cadenceNote}</p>
        <CaptureFormBlock id="ama-office-hours" locale="en" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2rem' }}>{vm.honestNote}</p>
      </main>
    </>
  )
}
