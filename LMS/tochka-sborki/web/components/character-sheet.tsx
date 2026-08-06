'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ATTRIBUTES } from '@/lib/intake/attributes'
import { skinCompanion } from '@/lib/rpg/skins-meta'
import type { Locale } from '@/lib/intake/types'
import type { WorldSkin } from '@/lib/intake/types'
import { useRpgMode } from '@/lib/use-rpg-mode'
import { SKILL_GATING_NOTE } from '@/lib/rpg-mode'

export function CharacterSheet({ locale, profile }: { locale: Locale; profile?: any }) {
  const { plain } = useRpgMode(locale)
  const [fetched, setFetched] = useState<any>(null)
  useEffect(() => {
    if (profile) return
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null).then(setFetched).catch(() => {})
  }, [profile])
  const p = profile ?? fetched
  if (!p) return null
  const scores: Record<string, number> = { INT: p.int_score ?? 0, WIS: p.wis_score ?? 0, CON: p.con_score ?? 0, DEX: p.dex_score ?? 0, CHA: p.cha_score ?? 0, STR: p.str_score ?? 0 }
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', color: 'var(--text-accent)', textTransform: 'uppercase' }}>
        {p.world_skin} · {p.char_class} · {locale === 'en' ? 'Level' : 'Уровень'} {p.char_level}
      </div>
      <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '.4rem 0 1rem' }}>{p.legendary_title}</h1>
      {(() => {
        const line = skinCompanion(p.world_skin as WorldSkin, locale)
        return line ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.74rem', color: 'var(--text-secondary)', margin: '0 0 1.4rem' }}>{line}</div> : null
      })()}
      {ATTRIBUTES.map(a => (
        <div key={a.code} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '.74rem' }}>
            <span>{a.emoji} {a.name[locale]} <em style={{ color: 'var(--text-secondary)', fontSize: '.62rem' }}>{a.code}</em></span>
            <b style={{ color: 'var(--text-accent)' }}>{scores[a.code]} / {a.max}</b>
          </div>
          <div style={{ fontSize: '.74rem', color: 'var(--text-secondary)', margin: '.2rem 0' }}>{a.meaning[locale]}</div>
          <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${(scores[a.code] / a.max) * 100}%`, background: 'var(--text-accent)', borderRadius: 3 }} />
          </div>
        </div>
      ))}
      <p style={{ fontSize: '.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem', fontStyle: 'italic' }}>
        {SKILL_GATING_NOTE[locale]}
      </p>
      {[['backstory', p.backstory], ['first_quest', p.first_quest], ['final_boss', p.final_boss]].map(([k, v]) => (
        <div key={k as string} style={{ borderLeft: '3px solid var(--text-accent)', paddingLeft: '.9rem', margin: '1rem 0' }}>{v}</div>
      ))}
      <Link
        href={locale === 'en' ? '/en/dashboard/' : '/dashboard/'}
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: '2.5rem',
          padding: '15px 20px',
          background: 'var(--text-accent)',
          color: 'var(--text-on-accent)',
          fontWeight: 700,
          borderRadius: 10,
          textDecoration: 'none',
        }}
      >
        {plain('enterQuestLog', locale === 'en' ? 'Enter your Quest Log →' : 'Войти в Квест-лог →')}
      </Link>
      <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text-secondary)', marginTop: '.8rem' }}>
        {locale === 'en'
          ? `Your ${plain('sheetName', 'character sheet')} stays here — you can revisit it anytime.`
          : `${(s => s.charAt(0).toUpperCase() + s.slice(1))(plain('sheetName', 'Лист персонажа'))} останется здесь — можно вернуться в любой момент.`}
      </p>
    </main>
  )
}
