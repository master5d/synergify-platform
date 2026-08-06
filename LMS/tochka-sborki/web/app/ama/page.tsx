import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { CaptureFormBlock } from '@/components/capture-form-block'
import { getOfficeHours } from '@/lib/course/office-hours'

export const metadata: Metadata = {
  title: 'Открытый разбор (AMA) — Точка Сборки',
  description:
    'Живая групповая встреча: приноси вопросы по агентам, стеку и застрявшим проектам. Бесплатно, запись по почте.',
}

export default function Page() {
  const vm = getOfficeHours('ru')
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', margin: 0 }}>{vm.eyebrow}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{vm.heading}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{vm.intro}</p>
        <p style={{ color: 'var(--text-secondary)' }}>{vm.ama.cadenceNote}</p>
        <CaptureFormBlock id="ama-office-hours" locale="ru" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2rem' }}>{vm.honestNote}</p>
      </main>
    </>
  )
}
