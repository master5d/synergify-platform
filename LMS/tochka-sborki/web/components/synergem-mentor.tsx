'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { buildSynergemMentorPrompt } from '@/lib/synergem-mentor'

export function SynergemMentor({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState(false)
  const prompt = buildSynergemMentorPrompt(locale)
  const t = locale === 'en'
    ? { title: 'AI mentor for your synergem', intro: "Paste this role into your synergem's own shared agent. It facilitates the group's dynamics — it never decides for you. Lead less, hand off more.", copy: 'Copy role', copied: 'Copied ✓' }
    : { title: 'ИИ-наставник для твоей синергемы', intro: 'Вставь эту роль в общий агент вашей синергемы. Он ведёт динамику группы — но не решает за вас. Меньше веди — больше передавай.', copy: 'Скопировать роль', copied: 'Скопировано ✓' }

  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ }
  }

  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
      <h2 style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{t.title}</h2>
      <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{t.intro}</p>
      <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem', overflowX: 'auto', fontSize: '.78rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0 }}>{prompt}</pre>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={copy} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{copied ? t.copied : t.copy}</button>
      </div>
    </section>
  )
}
