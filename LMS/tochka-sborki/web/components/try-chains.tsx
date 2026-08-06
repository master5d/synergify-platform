'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTryChains } from '@/lib/course/try-chains'
import type { Locale } from '@/lib/intake/types'

/**
 * Страница «Попробуй до курса». Главный элемент — кнопка копирования: человек
 * пришёл сюда за строкой, которую вставит в агента, а не за чтением.
 */
export function TryChains({ locale }: { locale: Locale }) {
  const t = getTryChains(locale)
  const [copied, setCopied] = useState<string | null>(null)
  const copiedLabel = locale === 'en' ? 'Copied' : 'Скопировано'

  /**
   * Копирование с запасным путём.
   *
   * `navigator.clipboard` есть не везде: он требует защищённого контекста и
   * разрешения, и при отказе промис просто отклоняется. Кнопка при этом
   * выглядела нажатой, а в буфере ничего не появлялось — молчаливый обман
   * ровно в том месте, ради которого страница и сделана. Поймано на живой
   * проверке в браузере: подпись не сменилась на «Скопировано».
   */
  const copy = async (key: string, text: string) => {
    const done = () => {
      setCopied(key)
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000)
    }
    try {
      await navigator.clipboard.writeText(text)
      done()
      return
    } catch {
      // падаем в старый путь ниже
    }
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      if (ok) done()
    } catch {
      // Оба пути закрыты — промпт остаётся текстом на странице и выделяется
      // мышью. Кнопка молчит, но и не врёт, что сработала.
    }
  }

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <style>{`
        .try-step { display: grid; grid-template-columns: 3.4rem 1fr; gap: 0.9rem; }
        .try-prompt { white-space: pre-wrap; word-break: break-word; }
        @media (max-width: 720px) {
          .try-step { grid-template-columns: 1fr; gap: 0.5rem; }
          .try-head { flex-direction: column; align-items: flex-start !important; gap: 0.4rem; }
        }
      `}</style>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)', margin: 0 }}>
        {t.eyebrow}
      </p>
      <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', lineHeight: 1.15, margin: '0.8rem 0 1.4rem', color: 'var(--text-primary)' }}>
        {t.heading}
      </h1>
      {t.intro.map((p, i) => (
        <p key={i} style={{ fontSize: 'var(--text-base)', lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 1rem' }}>{p}</p>
      ))}

      <section style={{ margin: '2.5rem 0', padding: '1.25rem 1.4rem', border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-secondary)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 0.7rem', color: 'var(--text-primary)' }}>{t.notProgramming.heading}</h2>
        {t.notProgramming.body.map((p, i) => (
          <p key={i} style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: i === 0 ? '0 0 0.7rem' : 0 }}>{p}</p>
        ))}
      </section>

      {t.chains.map((c) => (
        <article key={c.id} style={{ margin: '0 0 2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="try-head" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', margin: 0, color: 'var(--text-primary)' }}>
              <span aria-hidden="true" style={{ marginRight: '0.5rem' }}>{c.icon}</span>{c.title}
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {t.kindLabels[c.kind]} · {t.minutesLabel(c.minutes)}
            </span>
          </div>

          <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0.7rem 0 0.5rem' }}>{c.situation}</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '0 0 1.2rem' }}>
            {locale === 'en' ? 'you need: ' : 'понадобится: '}{c.needs}
          </p>

          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {c.steps.map((s) => {
              const key = `${c.id}-${s.n}`
              return (
                <li key={key} className="try-step" style={{ marginBottom: '1.1rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', paddingTop: '0.7rem', whiteSpace: 'nowrap' }}>
                    {t.stepLabel} {s.n}
                  </span>
                  <div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-surface)', padding: '0.8rem 0.9rem' }}>
                      <p className="try-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-primary)', margin: 0 }}>
                        {s.prompt}
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(key, s.prompt)}
                        style={{
                          marginTop: '0.7rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                          textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                          background: 'transparent', color: 'var(--text-accent)',
                          border: '1px solid var(--border-color)', borderRadius: 999, padding: '4px 12px',
                        }}
                      >
                        {copied === key ? copiedLabel : t.copyLabel}
                      </button>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>{s.why}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-primary)', margin: '1rem 0 0.4rem', fontWeight: 600 }}>
            {locale === 'en' ? 'What you end up with: ' : 'Что получится: '}
            <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{c.result}</span>
          </p>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, borderLeft: '2px solid var(--border-accent)', paddingLeft: '0.8rem' }}>
            {c.caution}
          </p>
        </article>
      ))}

      <section style={{ margin: '3rem 0 2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>{t.honest.heading}</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>{t.honest.intro}</p>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {t.honest.items.map((item, i) => (
            <li key={i} style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>{item}</li>
          ))}
        </ul>
      </section>

      <section style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 0.7rem', color: 'var(--text-primary)' }}>{t.outro.heading}</h2>
        {t.outro.body.map((p, i) => (
          <p key={i} style={{ fontSize: 'var(--text-base)', lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 0.9rem' }}>{p}</p>
        ))}
        <p style={{ margin: '1.2rem 0 0.8rem' }}>
          <Link href={t.outro.ctaHref} style={{ display: 'inline-block', background: 'var(--text-accent)', color: 'var(--text-on-accent)', fontWeight: 700, padding: '11px 22px', borderRadius: 10, textDecoration: 'none' }}>
            {t.outro.ctaLabel}
          </Link>
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>{t.outro.noCta}</p>
      </section>
    </main>
  )
}
