'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { buildCompanionRolePrompt } from '@/lib/intake/companion-role-prompt'
import { AGENT_MEMORY } from '@/lib/intake/agent-memory'
import { SheetSection, SHEET_PRE, SHEET_BTN } from './sheet-section'

/**
 * Durable companion setup: a role-prompt the learner pastes ONCE into their agent's
 * persistent memory + per-agent "where to paste" instructions. Collapsed accordion under
 * the charter card on /character.
 */
export function CompanionSetup({ profile, locale }: { profile: any; locale: Locale }) {
  const [copied, setCopied] = useState(false)
  const [agent, setAgent] = useState<string>(AGENT_MEMORY[0].key)
  const prompt = buildCompanionRolePrompt(profile, locale)
  const active = AGENT_MEMORY.find(a => a.key === agent) ?? AGENT_MEMORY[0]

  const t = locale === 'en'
    ? { title: 'Set up your AI companion for the whole course', intro: 'Paste this role into your own agent\'s memory once — it becomes your study companion across sessions.', copy: 'Copy role', copied: 'Copied ✓', where: 'Where to paste:' }
    : { title: 'Настрой ИИ-компаньона на весь курс', intro: 'Вставь эту роль в память своего агента один раз — он станет твоим study-напарником между сессиями.', copy: 'Скопировать роль', copied: 'Скопировано ✓', where: 'Куда вставить:' }

  const copy = async () => {
    // @ts-expect-error analytics global is optional
    if (typeof window !== 'undefined') window.plausible?.('companion_setup_copied', { props: { agent } })
    try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ }
  }

  const tab = (a: typeof AGENT_MEMORY[number]): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
    padding: '.35rem .7rem', borderRadius: 6, border: '1px solid var(--border-color)',
    background: a.key === agent ? 'var(--text-accent)' : 'transparent',
    color: a.key === agent ? 'var(--text-on-accent)' : 'var(--text-secondary)',
  })
  const btn = SHEET_BTN

  return (
    <SheetSection title={t.title} glyph="✨">
        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.55, margin: '0 0 1rem' }}>{t.intro}</p>
        <pre style={SHEET_PRE}>{prompt}</pre>
        <div style={{ marginTop: '1rem' }}>
          <button style={btn} onClick={copy}>{copied ? t.copied : t.copy}</button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {AGENT_MEMORY.map(a => (
            <button key={a.key} type="button" style={tab(a)} onClick={() => setAgent(a.key)}>{a.label}</button>
          ))}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', lineHeight: 1.5, margin: '.7rem 0 1rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{t.where}</strong> {active.where[locale === 'en' ? 'en' : 'ru']}
        </p>
    </SheetSection>
  )
}
