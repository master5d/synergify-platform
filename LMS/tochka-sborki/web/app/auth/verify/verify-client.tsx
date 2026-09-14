'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BASE_PATH, pagePath } from '@/lib/base-path'
import { COURSE } from '@/lib/course'

/** router сам добавляет basePath: сохранённый полный путь (/praktika/…) без префикса, иначе /praktika/praktika/…. */
function stripBase(path: string): string {
  return BASE_PATH && path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) || '/' : path
}

export function VerifyClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setStatus('error'); return }

    fetch('/api/auth/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => {
        if (r.ok) {
          setStatus('success')
          const savedRedirect = sessionStorage.getItem('login_redirect')
          const savedLocale = sessionStorage.getItem('login_locale')
          sessionStorage.removeItem('login_redirect')
          sessionStorage.removeItem('login_locale')
          const base = savedLocale === 'en' ? '/en' : ''
          // Курс без анкеты (gates.intake: false) после входа ведёт в программу, а не в выключенный опросник.
          const fallback = COURSE.gates.intake ? `${base}/quest-intake/` : `${base}/syllabus/`
          const destination = savedRedirect ? stripBase(savedRedirect) : fallback
          setTimeout(() => router.replace(destination), 800)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [searchParams, router])

  if (status === 'loading') return (
    <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Проверяем ссылку...</p>
  )
  if (status === 'success') return (
    <p style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>✓ Вход выполнен. Перенаправляем...</p>
  )
  return (
    <p style={{ color: 'var(--crit)', fontFamily: 'var(--font-mono)' }}>Ссылка недействительна или истекла. <a href={pagePath('/login/')} style={{ color: 'var(--text-accent)' }}>Запросить новую →</a></p>
  )
}
