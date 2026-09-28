'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { CertificateSVG } from '@/components/certificate-svg'
import { GraduateRetroForm } from '@/components/graduate-retro-form'
import { COURSE } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'
import type { CourseOutline } from '@/lib/progress-sync'
import { BASE_PATH } from '@/lib/base-path'
import { buildEvidence, verifyPageUrl, SPINE_TOTAL, type ProgressRow } from '@/lib/certificate-evidence'

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
    evidenceLabel: '/ улики',
    evidenceHeading: 'Что освоено',
    evidenceNone: 'Платформа пока не видит ни одного пройденного модуля. Улики появятся, когда ты войдёшь и пройдёшь юниты — они попадут и на сертификат.',
    unitsDone: (d: number, t: number | null) => `юнитов на платформе: ${d}${t ? ` из ${t}` : ''}`,
    moduleRowOnly: 'модуль отмечен пройденным',
    evidenceNote: 'Здесь только то, что записано на платформе в твоём аккаунте. Отметки юнитов без входа (они живут в этом браузере) и ответы «Проверь себя» (они нигде не хранятся) в улики не входят.',
    verifyLabel: 'Проверить сертификат',
    verifyNote: 'Любой может открыть этот адрес и увидеть, что курс пройден и какие модули в него вошли, — без твоего email и без имени.',
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
    evidenceLabel: '/ evidence',
    evidenceHeading: 'What was mastered',
    evidenceNone: 'The platform does not see any completed module yet. Evidence appears once you sign in and complete units — it goes onto the certificate too.',
    unitsDone: (d: number, t: number | null) => `units on the platform: ${d}${t ? ` of ${t}` : ''}`,
    moduleRowOnly: 'module marked complete',
    evidenceNote: 'Only what the platform recorded in your account is shown. Unit marks made without signing in (they live in this browser) and “Check yourself” answers (never stored) are not evidence.',
    verifyLabel: 'Verify certificate',
    verifyNote: 'Anyone can open this address and see that the course is complete and which modules it covers — without your email or name.',
  },
}

const STORAGE_KEY = 'cert_name'

interface Props {
  locale: Locale
  /** Модуль → юниты (из навигации pack'а): знаменатель «юнитов N из M» и правило «все юниты = модуль». */
  outline?: CourseOutline
}

const NO_OUTLINE: CourseOutline = {}

export function CertificatePage({ locale, outline = NO_OUTLINE }: Props) {
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

  // Улики: только прогресс, записанный на платформе (D1), — см. lib/certificate-evidence.ts.
  const [rows, setRows] = useState<ProgressRow[] | null>(null)
  useEffect(() => {
    if (!COURSE.features.rpg) return
    fetch('/api/progress/list', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(d => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
  }, [])
  const evidence = useMemo(
    () => (rows ? buildEvidence(rows, outline, locale, COURSE.progressKey) : []),
    [rows, outline, locale],
  )

  // Публичный адрес проверки: код выдаёт воркер только по сессии; показываем, лишь когда
  // курс засчитан сервером (admission) — иначе проверка ответила бы «не подтверждён».
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  useEffect(() => {
    if (!academyGranted) return
    fetch('/api/certificate/code', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (typeof d?.code === 'string') setVerifyUrl(verifyPageUrl(window.location.origin, locale, d.code, BASE_PATH))
      })
      .catch(() => {})
  }, [academyGranted, locale])
  useEffect(() => {
    if (!verifyUrl) return
    QRCode.toString(verifyUrl, { type: 'svg', margin: 1, color: { dark: '#0f0f0e', light: '#ebe7df' }, width: 160 })
      .then(setQrSvg)
      .catch(() => {})
  }, [verifyUrl])

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
            <CertificateSVG
              ref={svgRef}
              name={displayName}
              date={date}
              locale={locale}
              evidence={evidence}
              evidenceTotal={SPINE_TOTAL}
              verifyUrl={verifyUrl ?? undefined}
            />
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

        {COURSE.features.rpg && rows && (
          <section aria-label={t.evidenceHeading} style={{ marginTop: '3rem', maxWidth: '720px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '0.75rem',
            }}>
              {t.evidenceLabel}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
            }}>
              {t.evidenceHeading} · {evidence.length} / {SPINE_TOTAL}
            </h2>
            {evidence.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{t.evidenceNone}</p>
            ) : (
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {evidence.map(m => (
                  <li key={m.slug} style={{ borderLeft: '2px solid var(--text-accent)', paddingLeft: '0.875rem' }}>
                    <div style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{m.from}</span>
                      <span aria-hidden="true" style={{ color: 'var(--text-accent)' }}> → </span>
                      {m.to}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {m.slug} · {m.units.done > 0 ? t.unitsDone(m.units.done, m.units.total) : t.moduleRowOnly}
                      {' · '}{new Date(m.completedAt * 1000).toISOString().slice(0, 10)}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: '1rem 0 0' }}>
              {t.evidenceNote}
            </p>
          </section>
        )}

        {verifyUrl && (
          <section aria-label={t.verifyLabel} style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            maxWidth: '720px',
          }}>
            {qrSvg && (
              <div
                aria-hidden="true"
                style={{ width: 120, height: 120, flexShrink: 0, borderRadius: 'var(--radius)', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <a href={verifyUrl} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--text-accent)',
                letterSpacing: '0.06em',
              }}>
                {t.verifyLabel} →
              </a>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', wordBreak: 'break-all', margin: '0.375rem 0' }}>
                {verifyUrl}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5, margin: 0 }}>
                {t.verifyNote}
              </p>
            </div>
          </section>
        )}

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

        {COURSE.features.graduateRetro && <GraduateRetroForm locale={locale} name={name} />}
      </main>
      {/* CTA «получи сертификат» на самой странице сертификата бессмысленна */}
      <Footer locale={locale} showCertificateCta={false} />
    </>
  )
}
