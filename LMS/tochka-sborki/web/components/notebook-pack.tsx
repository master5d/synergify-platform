'use client'

import { useState } from 'react'
import { INTRO, PACKS, resolveChecklist, resolveNotebookPack, resolvePromptKit } from '@/lib/course/notebook-pack'
import type { Locale } from '@/lib/intake/types'

export function NotebookPack({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState<string | null>(null)
  const prompts = resolvePromptKit(locale)
  const checklist = resolveChecklist(locale)
  const copiedLabel = locale === 'en' ? 'Copied' : 'Скопировано'
  const copyLabel = locale === 'en' ? 'Copy prompt' : 'Скопировать промпт'

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
      // Fall through to the legacy copy path.
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
      // The prompt remains selectable text if the browser blocks both copy APIs.
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <style>{`
        .notebook-pack-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
        .notebook-step { display: grid; grid-template-columns: 3rem 1fr; gap: 0.8rem; }
        .notebook-prompt { white-space: pre-wrap; word-break: break-word; }
        @media (max-width: 820px) {
          .notebook-pack-grid { grid-template-columns: 1fr; }
          .notebook-step { grid-template-columns: 1fr; gap: 0.4rem; }
        }
      `}</style>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)', margin: 0 }}>
        {locale === 'en' ? 'Notebook pack' : 'Пакет тетрадки'}
      </p>
      <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', lineHeight: 1.15, margin: '0.8rem 0 1.4rem', color: 'var(--text-primary)' }}>
        {locale === 'en' ? 'Extract from sources, not from vibes' : 'Извлекай из источников, а не из ощущения'}
      </h1>
      {INTRO.map((p, i) => (
        <p key={i} style={{ fontSize: 'var(--text-base)', lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 1rem' }}>{p[locale]}</p>
      ))}

      <section style={{ margin: '2.6rem 0 3rem' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 1rem', color: 'var(--text-primary)' }}>
          {locale === 'en' ? 'Three source packs' : 'Три пака источников'}
        </h2>
        <div className="notebook-pack-grid">
          {PACKS.map((raw) => {
            const pack = resolveNotebookPack(raw.id, locale)
            if (!pack) return null
            return (
              <article key={pack.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-secondary)', padding: '1rem' }}>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0, color: 'var(--text-primary)' }}>
                  <span aria-hidden="true" style={{ marginRight: '0.45rem' }}>{pack.icon}</span>{pack.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: '0.7rem 0' }}>{pack.situation}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 0.9rem' }}>
                  {locale === 'en' ? 'sources: ' : 'источники: '}{pack.sources}
                </p>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {pack.steps.map((s) => (
                    <li key={s.n} className="notebook-step" style={{ marginBottom: '0.7rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', whiteSpace: 'nowrap' }}>{s.n}</span>
                      <span style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{s.text}</span>
                    </li>
                  ))}
                </ol>
              </article>
            )
          })}
        </div>
      </section>

      <section style={{ margin: '0 0 3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 1rem', color: 'var(--text-primary)' }}>
          {locale === 'en' ? 'Prompt kit' : 'Промпт-кит'}
        </h2>
        {prompts.map((p) => (
          <article key={p.id} style={{ margin: '0 0 1.2rem', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-surface)', padding: '0.9rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', margin: '0 0 0.65rem', color: 'var(--text-primary)' }}>{p.label}</h3>
            <pre className="notebook-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-primary)', margin: 0 }}>
              {p.prompt}
            </pre>
            <button
              type="button"
              aria-label={locale === 'en' ? `Copy prompt: ${p.label}` : `Скопировать промпт: ${p.label}`}
              onClick={() => copy(p.id, p.prompt)}
              style={{
                marginTop: '0.7rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-accent)',
                border: '1px solid var(--border-color)', borderRadius: 999, padding: '4px 12px',
              }}
            >
              {copied === p.id ? copiedLabel : copyLabel}
            </button>
          </article>
        ))}
      </section>

      <section style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 1rem', color: 'var(--text-primary)' }}>
          {locale === 'en' ? 'Verification checklist' : 'Чек-лист верификации'}
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {checklist.map((item, i) => (
            <li key={i} style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
