interface AssignmentBlockProps {
  text: string
}

export function AssignmentBlock({ text }: AssignmentBlockProps) {
  return (
    <div style={{
      marginTop: '3rem',
      padding: '1.5rem',
      background: 'var(--bg-surface)',
      border: 'var(--accent-line)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--section-label-size)',
        color: 'var(--text-accent)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '0.75rem',
      }}>
        ⬡ Практика
      </div>
      <p style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{text}</p>
    </div>
  )
}
