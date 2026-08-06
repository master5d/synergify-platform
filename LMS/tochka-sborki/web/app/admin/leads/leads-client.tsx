'use client'
import { useEffect, useMemo, useState } from 'react'

interface Lead {
  id: string
  email: string
  created_at: number
  language: string | null
  source: string | null
  telegram_handle: string | null
}

export function LeadsClient() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [stats, setStats] = useState<{ total: number; learners: number; intakeCompleted: number } | null>(null)

  useEffect(() => {
    fetch('/api/admin/leads?limit=2000', { credentials: 'include' })
      .then(r => {
        if (r.status === 401 || r.status === 403) { setError('Доступ только для владельца.'); return null }
        return r.ok ? r.json() : null
      })
      .then(d => { if (d) setLeads(d) })
      .catch(() => setError('Не удалось загрузить.'))
  }, [])

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
  }, [])

  const filtered = useMemo(
    () => (leads ?? []).filter(l => l.email.toLowerCase().includes(q.toLowerCase())),
    [leads, q],
  )

  function exportCsv() {
    const head = ['email', 'created_at', 'language', 'source', 'telegram_handle']
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [head.join(',')].concat(
      filtered.map(l => [l.email, new Date(l.created_at * 1000).toISOString(), l.language, l.source, l.telegram_handle].map(esc).join(',')),
    )
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  async function syncAll() {
    setSyncMsg('Синхронизация…')
    try {
      const r = await fetch('/api/admin/leads/sync-crm', { method: 'POST', credentials: 'include' })
      const d = await r.json()
      setSyncMsg(`Готово: ${d.synced}/${d.total} в CRM (ошибок: ${d.failed}).`)
    } catch { setSyncMsg('Не удалось синхронизировать.') }
  }

  const wrap = { maxWidth: 980, margin: '0 auto', padding: '3rem 1.5rem' } as const
  if (error) return <main style={wrap}>{error}</main>
  if (!leads) return <main style={wrap}>Загрузка…</main>

  return (
    <main style={wrap}>
      {stats && (
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { label: 'Студентов (начали курс)', value: stats.learners },
            { label: 'Всего зарегистрировано', value: stats.total },
            { label: 'Прошли интейк', value: stats.intakeCompleted },
          ].map(s => (
            <div key={s.label} style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-surface)', minWidth: 160 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Лиды ({leads.length})</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="поиск по email…"
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
        <button onClick={exportCsv} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer' }}>Экспорт CSV</button>
        <button onClick={syncAll} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--text-accent)', background: 'var(--text-accent)', color: 'var(--text-on-accent)', cursor: 'pointer', fontWeight: 700 }}>Sync all to Resend</button>
      </div>
      {syncMsg && <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{syncMsg}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '6px 8px' }}>email</th><th style={{ padding: '6px 8px' }}>дата</th>
              <th style={{ padding: '6px 8px' }}>source</th><th style={{ padding: '6px 8px' }}>telegram</th><th style={{ padding: '6px 8px' }}>язык</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '6px 8px' }}>{l.email}</td>
                <td style={{ padding: '6px 8px' }}>{new Date(l.created_at * 1000).toLocaleDateString()}</td>
                <td style={{ padding: '6px 8px' }}>{l.source ?? '—'}</td>
                <td style={{ padding: '6px 8px' }}>{l.telegram_handle ?? '—'}</td>
                <td style={{ padding: '6px 8px' }}>{l.language ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
