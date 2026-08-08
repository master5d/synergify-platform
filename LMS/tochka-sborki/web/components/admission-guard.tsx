'use client'

import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { PLATFORM_API } from '@/lib/platform-api'

// Гейт курса академии (Ф4 S4): уроки открываются тем, кто прошёл курс-дверь.
// Перенесён из academy-аппа в движок, потому что курсы школы уезжают под движок:
// без него переезд открыл бы уроки всем. Проверка server-verified — клиент лишь
// спрашивает платформенный API, решение принимает воркер по реальному прогрессу.
//
// Fail-closed: нет сессии, нет допуска, API недоступен → дверь закрыта.
// Дверь, а не сейф: контент курса бесплатен, гейт — ритуал входа школы.
const COURSE = 'tochka-sborki'

type State = 'checking' | 'admitted' | 'gated'

async function check(fetchFn: typeof fetch = fetch): Promise<State> {
  try {
    const me = await fetchFn(`${PLATFORM_API}/api/academy/me`, { credentials: 'include' })
    if (me.ok) {
      const data = (await me.json()) as { admissions?: { course: string }[] }
      if (data.admissions?.some((a) => a.course === COURSE)) return 'admitted'
    } else if (me.status !== 401 && me.status !== 403) {
      return 'gated'
    }
    // Допуск мог быть заслужен, но не выдан — идемпотентный запрос его оформит.
    const grant = await fetchFn(`${PLATFORM_API}/api/academy/admission`, { method: 'POST', credentials: 'include' })
    if (grant.ok) {
      const data = (await grant.json()) as { granted?: boolean }
      if (data.granted) return 'admitted'
    }
    return 'gated'
  } catch {
    return 'gated'
  }
}

export { check as checkAdmission }

export function AdmissionGuard({ children, locale = 'ru' }: { children: React.ReactNode; locale?: Locale }) {
  const [state, setState] = useState<State>('checking')
  const t = getDictionary(locale).admission

  useEffect(() => {
    let alive = true
    check().then((s) => { if (alive) setState(s) })
    return () => { alive = false }
  }, [])

  if (state === 'admitted') return <>{children}</>

  if (state === 'checking') {
    return (
      <p style={{
        fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)', letterSpacing: '0.08em', padding: '3rem 0',
      }}>
        {t.checking}
      </p>
    )
  }

  return (
    <section aria-label={t.heading} style={{ padding: '3rem 0', maxWidth: '38rem' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', textTransform: 'lowercase',
        letterSpacing: '0.2em', fontSize: 'var(--text-xs)', margin: 0,
      }}>
        {t.eyebrow}
      </p>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
        letterSpacing: '-0.02em', margin: '1rem 0 1.5rem', color: 'var(--text-primary)',
      }}>
        {t.heading}
      </h2>
      {t.body.map((p, i) => (
        <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
      ))}
      <p style={{ marginTop: '1.5rem' }}>
        <a href={t.ctaHref} style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{t.cta}</a>
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '1rem' }}>{t.returnHint}</p>
    </section>
  )
}
