'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getStarter } from '@/lib/starter/starter'
import { assetPath } from '@/lib/base-path'
import type { Locale } from '@/lib/intake/types'

/**
 * Страница «Стартер»: скачай → открой в своём агенте → первая команда.
 * Вкладки по агентам показывают только то, что агент читает по своей документации.
 */
export function StarterGuide({ locale }: { locale: Locale }) {
  const t = getStarter(locale)
  const [agentId, setAgentId] = useState(t?.agents[0]?.id ?? '')
  const [copied, setCopied] = useState<string | null>(null)

  if (!t) {
    return (
      <main id="main-content" tabIndex={-1} style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          {locale === 'en' ? 'This course has no student starter.' : 'У этого курса нет стартера студента.'}
        </p>
      </main>
    )
  }

  const agent = t.agents.find((a) => a.id === agentId) ?? t.agents[0]

  // Копирование с запасным путём (как на /try): при отказе clipboard кнопка не врёт.
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
      // старый путь ниже
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
      // текст остаётся на странице и выделяется мышью
    }
  }

  const codeBox: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-primary)',
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
    padding: '0.8rem 0.9rem', margin: '0.6rem 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  }
  const pill: React.CSSProperties = {
    marginTop: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase',
    letterSpacing: '0.06em', cursor: 'pointer', background: 'transparent', color: 'var(--text-accent)',
    border: '1px solid var(--border-color)', borderRadius: 999, padding: '4px 12px',
  }
  const h2: React.CSSProperties = { fontSize: 'var(--text-lg)', margin: '0 0 0.8rem', color: 'var(--text-primary)' }
  const small: React.CSSProperties = { fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)' }

  return (
    <main id="main-content" tabIndex={-1} style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <style>{`
        .starter-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .starter-files { display: grid; grid-template-columns: minmax(10rem, 16rem) 1fr; gap: 0.5rem 1rem; }
        @media (max-width: 640px) { .starter-files { grid-template-columns: 1fr; gap: 0.15rem; } .starter-files dd { margin-bottom: 0.6rem; } }
      `}</style>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)', margin: 0 }}>
        {t.eyebrow}
      </p>
      <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', lineHeight: 1.15, margin: '0.8rem 0 1.4rem', color: 'var(--text-primary)' }}>
        {t.heading}
      </h1>
      {t.intro.map((p, i) => (
        <p key={i} style={{ fontSize: 'var(--text-base)', lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 1rem' }}>{p}</p>
      ))}

      <a
        href={assetPath(t.archive)}
        download
        data-testid="starter-download"
        style={{
          display: 'inline-block', margin: '0.6rem 0 2.2rem', background: 'var(--text-accent)', color: 'var(--text-on-accent)',
          border: '1px solid var(--text-accent)', borderRadius: 8, padding: '12px 20px', fontWeight: 700, textDecoration: 'none',
        }}
      >
        {t.labels.download}
      </a>

      <section aria-labelledby="starter-steps" style={{ margin: '0 0 2.5rem' }}>
        <h2 id="starter-steps" style={h2}>{t.labels.steps}</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {t.steps.map((s) => (
            <li key={s.n} style={{ margin: '0 0 1.4rem', paddingLeft: '0.9rem', borderLeft: '2px solid var(--border-accent)' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', marginRight: '0.5rem' }}>{s.n}.</span>{s.title}
              </p>
              <p style={{ ...small, margin: '0.3rem 0 0' }}>{s.body}</p>
              {s.n === 2 && (
                <>
                  <pre style={codeBox}>{t.gitInit}</pre>
                  <button type="button" style={pill} onClick={() => copy('git', t.gitInit)}>
                    {copied === 'git' ? t.labels.copied : t.labels.copy}
                  </button>
                </>
              )}
              {s.n === 3 && (
                <>
                  <p style={codeBox}>{t.firstPrompt}</p>
                  <button type="button" style={pill} onClick={() => copy('prompt', t.firstPrompt)}>
                    {copied === 'prompt' ? t.labels.copied : t.labels.copy}
                  </button>
                </>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="starter-agents" style={{ margin: '0 0 2.5rem' }}>
        <h2 id="starter-agents" style={h2}>{t.labels.agentsHeading}</h2>
        <div role="tablist" aria-label={t.labels.agentsHeading} className="starter-tabs">
          {t.agents.map((a) => {
            const on = a.id === agent.id
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                id={`starter-tab-${a.id}`}
                aria-selected={on}
                aria-controls={`starter-panel-${a.id}`}
                onClick={() => setAgentId(a.id)}
                style={{
                  fontFamily: 'inherit', fontSize: 'var(--text-sm)', cursor: 'pointer', borderRadius: 999, padding: '6px 14px',
                  border: `1px solid ${on ? 'var(--text-accent)' : 'var(--border-color)'}`,
                  background: on ? 'var(--text-accent)' : 'transparent',
                  color: on ? 'var(--text-on-accent)' : 'var(--text-primary)',
                  fontWeight: on ? 700 : 400,
                }}
              >
                {a.name}
              </button>
            )
          })}
        </div>
        <div
          role="tabpanel"
          id={`starter-panel-${agent.id}`}
          aria-labelledby={`starter-tab-${agent.id}`}
          style={{ marginTop: '1rem', padding: '1.1rem 1.2rem', border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-secondary)' }}
        >
          <p style={{ ...small, margin: '0 0 0.8rem', color: 'var(--text-primary)' }}>
            <strong>{t.labels.run}:</strong> {agent.open}          </p>
          <p style={{ ...small, margin: '0 0 0.8rem' }}><strong style={{ color: 'var(--text-primary)' }}>{t.labels.reads}:</strong> {agent.reads}</p>
          <p style={{ ...small, margin: '0 0 0.8rem' }}><strong style={{ color: 'var(--text-primary)' }}>{t.labels.hook}:</strong> {agent.hook}</p>
          <p style={{ ...small, margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{t.labels.sources}:</strong>{' '}
            {agent.sources.map((s, i) => (
              <span key={s.href}>
                {i > 0 && ' · '}
                <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-accent)' }}>{s.label}</a>
              </span>
            ))}
          </p>
        </div>
      </section>

      <section aria-labelledby="starter-files" style={{ margin: '0 0 2.5rem' }}>
        <h2 id="starter-files" style={h2}>{t.labels.filesHeading}</h2>
        <dl className="starter-files" style={{ margin: 0 }}>
          {t.files.map((f) => (
            <div key={f.path} style={{ display: 'contents' }}>
              <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{f.path}</dt>
              <dd style={{ ...small, margin: 0 }}>
                {f.what}
                {f.lesson && <> · <Link href={f.lesson} style={{ color: 'var(--text-accent)' }}>{t.labels.lesson}</Link></>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section style={{ margin: '0 0 2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={h2}>{t.honest.heading}</h2>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {t.honest.items.map((item, i) => (
            <li key={i} style={{ ...small, marginBottom: '0.7rem' }}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="starter-related" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 id="starter-related" style={h2}>{t.labels.relatedHeading}</h2>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {t.related.map((r) => (
            <li key={r.href} style={{ ...small, marginBottom: '0.4rem' }}>
              <Link href={r.href} style={{ color: 'var(--text-accent)' }}>{r.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
