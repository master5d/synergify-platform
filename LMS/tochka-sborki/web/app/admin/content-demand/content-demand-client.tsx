'use client'
import { useEffect, useState } from 'react'

interface Brief {
  id: string
  gap_topic_key: string
  status: string
  signal_count: number
  proposal: {
    proposed_type: string
    title: { ru: string; en: string }
    learning_objective: string
    slot: string
    agentic_approach: string
    unit_count_estimate: number
    source_quotes: string[]
  } | null
}

interface Signal {
  id: string
  source_question: string
  raw_text: string
  classification: string
  gap_topic_key: string | null
  feasibility_note: string | null
  value_tier: string
}

export function ContentDemandClient() {
  const [briefs, setBriefs] = useState<Brief[] | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [error, setError] = useState<string | null>(null)

  function load() {
    fetch('/api/admin/content-demand/briefs?status=open', { credentials: 'include' })
      .then(r => {
        if (r.status === 401 || r.status === 403) { setError('Доступ только для владельца.'); return null }
        return r.ok ? r.json() : null
      })
      .then(d => { if (d) setBriefs(d) })
      .catch(() => setError('Не удалось загрузить.'))
    fetch('/api/admin/content-demand/signals', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSignals(d) })
      .catch(() => {})
  }
  useEffect(load, [])

  async function decide(id: string, status: string) {
    await fetch(`/api/admin/content-demand/briefs/${id}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    load()
  }

  if (error) return <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>{error}</main>
  if (!briefs) return <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>Загрузка…</main>

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem' }}>Кузница квестов · открытые брифы</h1>
      {briefs.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Пока нет открытых брифов.</p>}
      {briefs.map(b => (
        <div key={b.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.2rem', marginBottom: '1.2rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--text-accent)', textTransform: 'uppercase' }}>
            {b.proposal?.proposed_type} · {b.gap_topic_key} · {b.signal_count} сигнал(ов)
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '.4rem 0' }}>{b.proposal?.title.ru}</h2>
          <p style={{ margin: '.3rem 0' }}><b>Цель:</b> {b.proposal?.learning_objective}</p>
          <p style={{ margin: '.3rem 0' }}><b>Куда:</b> {b.proposal?.slot} · ~{b.proposal?.unit_count_estimate} юнит(ов)</p>
          <p style={{ margin: '.3rem 0' }}><b>Agentic-подход:</b> {b.proposal?.agentic_approach}</p>
          {b.proposal?.source_quotes?.length ? (
            <ul style={{ margin: '.5rem 0', paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '.85rem' }}>
              {b.proposal.source_quotes.map((q, i) => <li key={i}>«{q}»</li>)}
            </ul>
          ) : null}
          <div style={{ display: 'flex', gap: 10, marginTop: '.8rem' }}>
            <button onClick={() => decide(b.id, 'accepted')} style={{ background: 'var(--text-accent)', color: 'var(--text-on-accent)', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Принять</button>
            <button onClick={() => decide(b.id, 'rejected')} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>Отклонить</button>
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2.5rem 0 1rem' }}>Сигналы спроса</h2>
      {signals.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Сигналов пока нет.</p>}
      {signals.map(s => (
        <div key={s.id} style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '.9rem', margin: '.7rem 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {s.classification}{s.gap_topic_key ? ` · ${s.gap_topic_key}` : ''} · {s.source_question} · {s.value_tier}
          </div>
          <div style={{ fontSize: '.9rem' }}>«{s.raw_text}»</div>
          {s.feasibility_note && <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>↳ {s.feasibility_note}</div>}
        </div>
      ))}
    </main>
  )
}
