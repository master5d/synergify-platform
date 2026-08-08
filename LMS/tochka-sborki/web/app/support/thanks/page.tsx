import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { buildSupportContent } from '@/lib/checkout/support-content'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = { title: `Спасибо — ${COURSE.shortName}` }

export default function Page() {
  const c = buildSupportContent('ru')
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1>{c.thanksTitle}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{c.thanksBody}</p>
        <Link href="/" style={{ color: 'var(--text-accent)' }}>← На главную</Link>
      </main>
    </>
  )
}
