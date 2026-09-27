import { getDictionary, type Locale } from '@/lib/dictionaries'

/**
 * Рамка входа (intake LMS#1 + LMS#10): короткое обещание «бесплатно, без встроенных
 * продаж» и одна фраза позиционирования — на лендинге и на экране перед модулем 0.
 * Строки — данные pack'а (dictionary.entryFrame); pack без поля блока не получает.
 * Обещание гейтится манифестом pack'а: правило против встроенных продаж держит его
 * честным во всём контенте и словарях (packs/<slug>/manifest.ts).
 */
export function EntryFrame({ locale, style }: { locale: Locale; style?: React.CSSProperties }) {
  const frame = getDictionary(locale).entryFrame
  if (!frame) return null
  return (
    <aside aria-label={frame.label} data-entry-frame="" style={{
      maxWidth: '560px',
      padding: '1rem 1.25rem',
      borderLeft: 'var(--accent-line)',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius)',
      ...style,
    }}>
      <p style={{
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.5,
        marginBottom: '0.5rem',
      }}>
        {frame.promise}
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {frame.positioning}
      </p>
    </aside>
  )
}
