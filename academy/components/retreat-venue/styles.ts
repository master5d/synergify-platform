import type React from 'react'
export const field: React.CSSProperties = {
  width: '100%',
  padding: '.4rem .55rem',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  fontSize: 'var(--text-sm)',
}
export const label: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '.3rem',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-secondary)',
}
export const card: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-soft)',
  borderRadius: 'var(--radius)',
  padding: '1rem 1.1rem',
}
export const button: React.CSSProperties = { ...field, width: 'auto', cursor: 'pointer' }
export const h2: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 300,
  fontSize: 'var(--text-lg)',
  margin: '2rem 0 .9rem',
  color: 'var(--text-primary)',
}
