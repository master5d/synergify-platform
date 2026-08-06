'use client'

const LIKERT = ['1', '2', '3', '4', '5']

export function LikertScale({ name, label, value, onChange, disagree, agree, required = true }: {
  name: string; label: string; value: string; onChange: (v: string) => void
  disagree: string; agree: string; required?: boolean
}) {
  return (
    <fieldset style={{ border: 'none', marginBottom: '2rem' }}>
      <legend style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.5 }}>
        {label}
      </legend>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', minWidth: '5rem' }}>{disagree}</span>
        {LIKERT.map(v => (
          <label key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input
              type="radio" name={name} value={v} required={required}
              checked={value === v}
              onChange={() => onChange(v)}
              style={{ accentColor: 'var(--text-accent)' }}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{v}</span>
          </label>
        ))}
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', minWidth: '4rem' }}>{agree}</span>
      </div>
    </fieldset>
  )
}
