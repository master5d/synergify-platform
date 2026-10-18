// Общие стили и печать страницы анкеты — для конструктора и сводки.

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
export const GOLD = 'var(--accent-ink)'
export const field: React.CSSProperties = {
  width: '100%', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
}
export const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }
export const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }
export const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'var(--text-lg)', margin: '2.25rem 0 0.9rem', color: 'var(--text-primary)' }
export const button: React.CSSProperties = { ...field, width: 'auto', cursor: 'pointer' }

/** Печать одной части страницы: анкеты или списка «важно знать на месте» (атрибут на body на время печати). */
export function printPart(part: 'form' | 'safety') {
  document.body.dataset.gfPrint = part
  const done = () => { delete document.body.dataset.gfPrint; window.removeEventListener('afterprint', done) }
  window.addEventListener('afterprint', done)
  window.print()
}
