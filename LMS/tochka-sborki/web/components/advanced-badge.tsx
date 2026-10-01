// Значок «advanced» у продвинутого модуля (поле `advanced: true` в _meta.json модуля).
// Один компонент на все места, где модуль показан списком: главная, программа, сайдбар.
export function AdvancedBadge({ size = 'sm' }: { size?: 'sm' | 'xs' }) {
  return (
    <span
      title="advanced"
      style={{
        display: 'inline-block',
        marginLeft: '0.5rem',
        verticalAlign: 'middle',
        fontFamily: 'var(--font-mono)',
        fontSize: size === 'xs' ? '0.6rem' : 'var(--text-xs)',
        fontWeight: 600,
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-accent)',
        padding: size === 'xs' ? '0 0.35rem' : '0.1rem 0.45rem',
        border: '1px solid var(--text-accent)',
        borderRadius: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      advanced
    </span>
  )
}
