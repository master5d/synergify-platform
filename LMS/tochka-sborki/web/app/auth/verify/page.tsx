import { Suspense } from 'react'
import { Nav } from '@/components/nav'
import { VerifyClient } from './verify-client'

export default function VerifyPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '6rem 2rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '2rem',
        }}>
          ⬡ Верификация
        </div>
        <Suspense fallback={<p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>}>
          <VerifyClient />
        </Suspense>
      </main>
    </>
  )
}
