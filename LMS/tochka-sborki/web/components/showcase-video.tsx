'use client'

import { useState } from 'react'
import { withAutoplay, type VideoSource } from '@/lib/course/showcase'
import { MediaTranscript } from '@/components/media-transcript'
import type { CaptionTrack } from '@/lib/a11y/media'

const FRAME: React.CSSProperties = {
  position: 'relative', aspectRatio: '16 / 9', width: '100%',
  borderRadius: 14, overflow: 'hidden',
  border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
  marginBottom: '2rem',
}
const FILL: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }

export function ShowcaseVideo({ source, poster, caption, title, captionTrack, transcript, locale }: {
  source: VideoSource | null
  poster: string | null
  caption: string
  title: string
  captionTrack: CaptionTrack | null
  transcript: string | null
  locale: 'ru' | 'en'
}) {
  const [playing, setPlaying] = useState(false)

  // No video configured yet → static placeholder (preserves current look).
  if (!source) {
    return (
      <>
        <div style={FRAME}>
          <div style={{ ...FILL, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
            <span aria-hidden="true" style={{ fontSize: '2.4rem' }}>▶</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{caption}</span>
          </div>
        </div>
        <MediaTranscript text={transcript} locale={locale} />
      </>
    )
  }

  // Facade: poster (or surface) + play button; load the real player only on click.
  if (!playing) {
    return (
      <>
        <div style={FRAME}>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={title}
            style={{
              ...FILL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: poster ? `center / cover no-repeat url(${poster})` : 'var(--bg-surface)',
            }}
          >
            <span aria-hidden="true" style={{
              fontSize: '1.6rem', width: 72, height: 72, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--text-accent)', color: 'var(--text-on-accent)',
            }}>▶</span>
          </button>
        </div>
        <MediaTranscript text={transcript} locale={locale} />
      </>
    )
  }

  // Playing.
  return (
    <>
      <div style={FRAME}>
        {source.kind === 'embed' ? (
          <iframe
            src={withAutoplay(source.src)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={FILL}
          />
        ) : (
          <video src={source.src} controls autoPlay playsInline poster={poster ?? undefined} style={FILL}>
            {captionTrack && (
              <track
                kind="captions"
                src={captionTrack.src}
                srcLang={captionTrack.srclang}
                label={captionTrack.label}
                default
              />
            )}
          </video>
        )}
      </div>
      <MediaTranscript text={transcript} locale={locale} />
    </>
  )
}
