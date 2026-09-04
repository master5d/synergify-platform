import type { ReactNode } from 'react'

// Намеренно БЕЗ 'use client': раскрытие несёт нативный <details>, своего JS у
// раздела нет. Иначе серверный office-hours-card утащило бы в клиентский бандл.

/**
 * Один сворачиваемый раздел листа персонажа.
 *
 * Появился, когда четыре блока под картой мира (план обучения, устав напарника,
 * настройка ИИ-компаньона, «за пределами курса») выросли в сплошную простыню:
 * каждый несёт длинный `<pre>` для копирования, и до нижнего надо было
 * прокручивать три чужих. Паттерн не новый — `CompanionSetup` уже был
 * `<details>`; здесь он вынесен в общий дом, чтобы все четыре выглядели
 * и вели себя одинаково.
 *
 * Разделы НЕЗАВИСИМЫ (не `<details name>`): взаимоисключающее раскрытие
 * закрывало бы план в момент, когда человек сверяет его с уставом, — а это
 * ровно тот сценарий, ради которого оба блока и существуют.
 */
export function SheetSection(
  { title, glyph, children, marginBottom = '1rem' }:
  { title: string; glyph?: string; children: ReactNode; marginBottom?: string },
) {
  return (
    <section style={{ maxWidth: 640, margin: `1rem auto ${marginBottom}`, padding: '0 1.5rem' }}>
      <details style={{ border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-surface)', padding: '0 1rem' }}>
        <summary style={{
          cursor: 'pointer', padding: '1rem 0', fontFamily: 'var(--font-mono)',
          fontSize: '.85rem', fontWeight: 700, color: 'var(--text-primary)',
          listStyle: 'revert',
        }}>
          {glyph ? `${glyph} ` : ''}{title}
        </summary>
        <div style={{ paddingBottom: '1rem' }}>{children}</div>
      </details>
    </section>
  )
}

/** Общий вид блока для копирования внутри раздела. Фон — `--bg-secondary`,
 *  а не `--bg-surface`: на фоне раскрытого раздела последний сливается. */
export const SHEET_PRE: React.CSSProperties = {
  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
  borderRadius: 10, padding: '1rem', overflowX: 'auto', fontSize: '.8rem',
  lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0,
}

/** Кнопка раздела — та же во всех четырёх блоках. */
export const SHEET_BTN: React.CSSProperties = {
  background: 'var(--bg-surface)', color: 'var(--text-primary)',
  border: '1px solid var(--border-color)', borderRadius: 8,
  padding: '10px 16px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
}
