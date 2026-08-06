'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { agentUrl } from '@/lib/learn-prompt'

const DISMISS_KEY = 'lwai_dock_dismissed'

const T = {
  ru: { pill: '✨ Учиться с ИИ', hide: 'Скрыть', copy: 'Скопировать устав', copied: 'Скопировано ✓' },
  en: { pill: '✨ Learn with AI', hide: 'Hide', copy: 'Copy charter', copied: 'Copied ✓' },
}

/**
 * Floating, dismissible right-side panel for «Учиться с ИИ» — persistent across the unit
 * (not just the end-of-unit block). Mirrors blog ReadWithAIDock. ChatGPT/Claude carry the
 * compact bootstrap via `?q=`; the full charter goes through the clipboard.
 */
export function LearnWithAIDock({ prompt, bootstrap, locale = 'ru' }: { prompt: string; bootstrap: string; locale?: Locale }) {
  const t = T[locale === 'en' ? 'en' : 'ru']
  const [dismissed, setDismissed] = useState(true) // hidden until storage read
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch { /* ignore */ }
    setDismissed(false)
    const onScroll = () => {
      const h = document.documentElement
      const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1)
      setShown(pct > 0.4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (dismissed || !shown) return null

  const track = (agent: string) => {
    // @ts-expect-error analytics global is optional
    if (typeof window !== 'undefined') window.plausible?.('learn_with_ai_clicked', { props: { agent, mode: 'dock' } })
  }
  const close = () => {
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }
  const copy = async () => {
    track('copy')
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — agent buttons still open */ }
  }

  const link: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
    padding: '0.4rem 0.7rem', borderRadius: 'var(--radius)', textDecoration: 'none',
    background: 'var(--text-accent)', color: 'var(--text-on-accent)',
  }
  const ghost: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
    padding: '0.4rem 0.7rem', borderRadius: 'var(--radius)', cursor: 'pointer',
    border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-accent)',
  }

  return (
    <div style={{ position: 'fixed', right: '1.25rem', bottom: '1.25rem', zIndex: 50,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
      {open && (
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem', flexWrap: 'wrap', maxWidth: '15rem', justifyContent: 'flex-end',
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          <a href={agentUrl('chatgpt', bootstrap)} target="_blank" rel="noopener" onClick={() => track('chatgpt')} style={link}>ChatGPT</a>
          <a href={agentUrl('claude', bootstrap)} target="_blank" rel="noopener" onClick={() => track('claude')} style={link}>Claude</a>
          <button type="button" onClick={copy} style={ghost}>{copied ? t.copied : t.copy}</button>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '1px',
        background: 'var(--border-color)', borderRadius: '22px', overflow: 'hidden',
        border: '1px solid var(--border-color)' }}>
        <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
          style={{ border: 'none', cursor: 'pointer', padding: '0.55rem 0.95rem',
            background: 'var(--bg-surface)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
          {t.pill}
        </button>
        <button type="button" onClick={close} aria-label={t.hide}
          style={{ border: 'none', cursor: 'pointer', padding: '0.55rem 0.7rem',
            background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          ×
        </button>
      </div>
    </div>
  )
}
