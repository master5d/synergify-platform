import type { ReactNode } from 'react'

/**
 * Markdown-lite рендер прозы уроков скорочтения. В LMS проза шла через MDXRemote;
 * академия не тянет MDX-стек ради трёх конструкций — уроки используют только
 * `## заголовки`, нумерованные списки и inline-код, и этого парсера достаточно.
 * Появится новая конструкция в прозе — тест не поймает, поэтому парсер честный:
 * незнакомый блок рендерится как обычный абзац, ничего не теряется.
 */

function inline(text: string, keyBase: string): ReactNode[] {
  // Чётные сегменты — текст, нечётные — inline-код между backticks.
  return text.split('`').map((seg, i) =>
    i % 2 === 1
      ? <code key={`${keyBase}-${i}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em', color: 'var(--accent)' }}>{seg}</code>
      : <span key={`${keyBase}-${i}`}>{seg}</span>,
  )
}

export function LessonProse({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return (
    <>
      {blocks.map((block, bi) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={bi} style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'var(--text-lg)', letterSpacing: '0.02em', margin: '2.5rem 0 1rem' }}>
              {inline(block.slice(3), `h${bi}`)}
            </h2>
          )
        }
        const lines = block.split('\n').map((l) => l.trim())
        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={bi} style={{ margin: '0 0 1.1rem', paddingLeft: '1.4rem', display: 'grid', gap: '0.6rem' }}>
              {lines.map((l, li) => (
                <li key={li} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>
                  {inline(l.replace(/^\d+\.\s/, ''), `l${bi}-${li}`)}
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={bi} style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 'var(--text-base)', marginBottom: '1.1rem' }}>
            {inline(block.replace(/\n/g, ' '), `p${bi}`)}
          </p>
        )
      })}
    </>
  )
}
