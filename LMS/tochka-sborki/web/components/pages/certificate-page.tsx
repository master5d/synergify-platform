'use client'

import { useEffect, useRef, useState } from 'react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { CertificateSVG } from '@/components/certificate-svg'
import type { Locale } from '@/lib/dictionaries'

const COPY = {
  ru: {
    label: '/ сертификат',
    heading: 'Твой золотой билет',
    sub: 'Скачай SVG или поделись.\nТочка сборки пройдена — впереди следующий виток.',
    nameLabel: 'Имя на сертификате',
    namePlaceholder: 'Введи имя…',
    download: '↓ Скачать SVG',
    shareX: 'Поделиться в X',
    shareLI: 'Поделиться в LinkedIn',
    copyLink: 'Скопировать ссылку',
    copied: '✓ Скопировано',
    shareText: 'Получил золотой билет «Точки Сборки» — vibe coding, Claude Code, агенты, автоматизация.',
    academyLabel: '/ академия',
    academyHeading: 'Дверь открыта',
    academyBody: 'Золотой билет — это и вход. Точка сборки пройдена, и академия S.A.S.H.A — закрытая школа живых связей — теперь узнаёт тебя.',
    academyCta: 'Войти в академию →',
    academyUrl: 'https://academy.synergify.com/',
  },
  en: {
    label: '/ certificate',
    heading: 'Your golden ticket',
    sub: 'Download the SVG or share.\nThe assembly point is set — the next turn is ahead.',
    nameLabel: 'Name on certificate',
    namePlaceholder: 'Enter name…',
    download: '↓ Download SVG',
    shareX: 'Share on X',
    shareLI: 'Share on LinkedIn',
    copyLink: 'Copy link',
    copied: '✓ Copied',
    shareText: 'Earned my Tochka Sborki golden ticket — vibe coding, Claude Code, agents, automation.',
    academyLabel: '/ academy',
    academyHeading: 'The door is open',
    academyBody: 'The golden ticket is also an entrance. Your assembly point is set, and S.A.S.H.A — the gated school of living connections — now recognizes you.',
    academyCta: 'Enter the academy →',
    academyUrl: 'https://academy.synergify.com/en/',
  },
}

const STORAGE_KEY = 'cert_name'

interface Props { locale: Locale }

export function CertificatePage({ locale }: Props) {
  const t = COPY[locale]
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
    })()
    if (stored) {
      setName(stored)
      return
    }
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.email) setName(d.email.split('@')[0])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (name) {
      try { localStorage.setItem(STORAGE_KEY, name) } catch { /* */ }
    }
  }, [name])

  // S4 (fb_97517f307a46): request the academy admission — the server verifies
  // completion; the ticket renders the same either way. On grant, the page
  // additionally shows the academy door (invitation block below the ticket).
  const [academyGranted, setAcademyGranted] = useState(false)
  useEffect(() => {
    fetch('/api/academy/admission', { method: 'POST', credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.granted) setAcademyGranted(true) })
      .catch(() => {})
  }, [])

  const date = new Date().toISOString().slice(0, 10)
  const displayName = name.trim() || (locale === 'en' ? 'Anonymous Vibe Coder' : 'Анонимный Vibe Coder')

  const certUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${locale === 'en' ? '/en' : ''}/certificate/`
    : 'https://ai.synergify.com/certificate/'

  function downloadSvg() {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgRef.current)
    const blob = new Blob(
      ['<?xml version="1.0" encoding="UTF-8"?>\n', svgString],
      { type: 'image/svg+xml;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tochka-sborki-${displayName.toLowerCase().replace(/\s+/g, '-')}-${date}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function shareX() {
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareText)}&url=${encodeURIComponent(certUrl)}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }

  function shareLI() {
    const u = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }

  function copyLink() {
    navigator.clipboard?.writeText(certUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <Nav locale={locale} />
      <main id="main-content" tabIndex={-1} style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '1rem',
        }}>
          {t.label}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 900,
          lineHeight: 0.9,
          textTransform: 'uppercase',
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          marginBottom: '1.5rem',
        }}>
          {t.heading}
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '500px',
          whiteSpace: 'pre-line',
          marginBottom: '3rem',
        }}>
          {t.sub}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}>
          {/* Left: SVG */}
          <div>
            <CertificateSVG ref={svgRef} name={displayName} date={date} locale={locale} />
          </div>

          {/* Right: controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.5rem',
              }}>
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              onClick={downloadSvg}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'var(--text-accent)',
                color: 'var(--text-on-accent)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              {t.download}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={shareX}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                𝕏  {t.shareX}
              </button>
              <button
                onClick={shareLI}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                in  {t.shareLI}
              </button>
              <button
                onClick={copyLink}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'transparent',
                  color: copied ? 'var(--text-accent)' : 'var(--text-primary)',
                  border: `1px solid ${copied ? 'var(--text-accent)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                ⎘  {copied ? t.copied : t.copyLink}
              </button>
            </div>
          </div>
        </div>

        {academyGranted && (
          <section aria-label={t.academyHeading} style={{
            marginTop: '3rem',
            border: '1px solid var(--text-accent)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            background: 'var(--bg-surface)',
            maxWidth: '640px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '0.75rem',
            }}>
              {t.academyLabel}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              margin: '0 0 0.75rem',
            }}>
              {t.academyHeading}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1rem' }}>
              {t.academyBody}
            </p>
            <a href={t.academyUrl} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--text-accent)',
              letterSpacing: '0.06em',
            }}>
              {t.academyCta}
            </a>
          </section>
        )}
      </main>
      {/* CTA «получи сертификат» на самой странице сертификата бессмысленна */}
      <Footer locale={locale} showCertificateCta={false} />
    </>
  )
}
