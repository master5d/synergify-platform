import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Офлайн — Точка Сборки',
  robots: { index: false, follow: false },
}

// Served by the service worker when a navigation fails offline.
export default function OfflinePage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">⬡</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Нет соединения</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Похоже, ты офлайн. Уже открытые уроки доступны из кеша — вернись к ним или попробуй обновить страницу, когда сеть появится.
      </p>
    </main>
  )
}
