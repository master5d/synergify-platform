import { videoEmbedUrl } from '@/lib/course/showcase'
import { MediaTranscript } from '@/components/media-transcript'

/**
 * Lightweight interactive video: embeds a video and pins a reflection checkpoint beside it —
 * the pedagogy-compatible 80% of LearnWorlds-style interactive video (no heavy overlay editor).
 * The checkpoint is a MENTAL prompt (reflection-first; don't phrase it as "write/type").
 *
 * MDX usage:
 *   <VideoCheckpoint src="https://youtu.be/XXXX" title="..." transcript="Полная расшифровка…" locale="ru">
 *   Прокрути в голове: где это уже встречалось тебе?
 *   </VideoCheckpoint>
 *
 * `transcript` is a plain locale-correct string (lesson files are per-locale); it
 * renders below the figure as a disclosure, dark when absent. Embeds use the
 * platform's native captions, so there is no caption <track> here.
 */
export function VideoCheckpoint({ src, title, children, transcript, locale }: { src: string; title?: string; children?: React.ReactNode; transcript?: string; locale?: 'ru' | 'en' }) {
  const embed = videoEmbedUrl(src)
  return (
    <figure style={{ margin: '1.5rem 0' }}>
      {embed && (
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <iframe
            src={embed}
            title={title ?? 'video'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      )}
      {children && (
        <figcaption style={{
          display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          marginTop: '0.9rem', padding: '0.9rem 1rem',
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderLeft: '3px solid var(--text-accent)', borderRadius: 'var(--radius)',
        }}>
          <span aria-hidden="true" style={{ fontSize: '1rem' }}>⏸</span>
          <span style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{children}</span>
        </figcaption>
      )}
      <MediaTranscript text={transcript ?? null} locale={locale ?? 'ru'} />
    </figure>
  )
}
