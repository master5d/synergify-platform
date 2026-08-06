import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SupportForm } from '@/components/support/support-form'
import { buildSupportContent } from '@/lib/checkout/support-content'

export const metadata: Metadata = { title: 'Поддержать — Точка Сборки', description: 'Поддержать автора курса.' }

export default function Page() {
  const c = buildSupportContent('ru')
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', margin: 0 }}>{c.eyebrow}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{c.title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{c.lead}</p>
        <SupportForm locale="ru" />
      </main>
    </>
  )
}
