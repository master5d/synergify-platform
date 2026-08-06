'use client'

import { useState } from 'react'
import { useLite } from '@/components/lite-provider'

/**
 * Embeds a self-contained "Learn-mode walkthrough" HTML (exported from the sovern-mindmap app)
 * into a lesson via a sandboxed iframe. The file in public/walkthroughs/<slug>.html is fully
 * self-contained (zero external resources). Static asset + iframe ONLY.
 *
 * Lite mode (data-saver): the ~4 MB iframe is NOT loaded up front — a lightweight placeholder
 * with a "load" button defers the fetch until the learner asks (mirrors the ShowcaseVideo facade).
 *
 * MDX usage:
 *   <Walkthrough slug="my-diagram" title="Как собрать пайплайн" />
 */
export function Walkthrough({ slug, title, minHeight = 480 }: { slug: string; title?: string; minHeight?: number }) {
  const { lite } = useLite()
  const [load, setLoad] = useState(false)
  const showIframe = !lite || load

  const caption = title && (
    <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
      {title}
    </figcaption>
  )

  if (!showIframe) {
    const isEn = typeof document !== 'undefined' && /^\/en(\/|$)/.test(location.pathname)
    const hint = isEn ? 'Interactive diagram — heavy; tap to load' : 'Интерактивная схема — тяжёлая, нажми чтобы загрузить'
    const cta = isEn ? 'Load diagram' : 'Загрузить схему'
    return (
      <figure style={{ margin: '1.5rem 0' }}>
        <div
          style={{
            width: '100%', minHeight, border: '1px dashed var(--border-color)', borderRadius: 'var(--radius)',
            background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '0.8rem', padding: '1.5rem', textAlign: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hint}</span>
          <button
            type="button"
            onClick={() => setLoad(true)}
            style={{
              background: 'var(--text-accent)', color: 'var(--text-on-accent)', border: 'none',
              borderRadius: 'var(--radius)', padding: '0.5rem 1.1rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
        {caption}
      </figure>
    )
  }

  return (
    <figure style={{ margin: '1.5rem 0' }}>
      <iframe
        src={`/walkthroughs/${slug}.html`}
        title={title ?? 'walkthrough'}
        loading="lazy"
        // Self-contained file: scripts to run the step-through, but no same-origin/storage/forms.
        sandbox="allow-scripts"
        style={{ width: '100%', minHeight, border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}
      />
      {caption}
    </figure>
  )
}
