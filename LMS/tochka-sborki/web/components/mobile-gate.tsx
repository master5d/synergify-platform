'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { getDictionary, type Locale } from '@/lib/dictionaries'

const DISMISS_KEY = 'mobile-gate-dismissed-until'
const DISMISS_DAYS = 7
const MOBILE_BREAKPOINT = 720

type EmailStatus = 'idle' | 'sending' | 'sent' | 'error'

interface Props {
  locale?: Locale
  children: React.ReactNode
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches ||
    document.documentElement.clientWidth < MOBILE_BREAKPOINT
  )
}

function detectDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const until = parseInt(raw, 10) || 0
    return Date.now() < until
  } catch { return false }
}

export function MobileGate({ locale = 'ru', children }: Props) {
  const t = getDictionary(locale).mobileGate
  // Lazy initializers — first client-render already knows mobile state.
  // SSR returns false (no window), then on hydration we may flip and re-render.
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobile())
  const [dismissed, setDismissed] = useState<boolean>(() => detectDismissed())
  const [showQr, setShowQr] = useState(false)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')

  useEffect(() => {
    setIsMobile(detectMobile())
    setDismissed(detectDismissed())
    setReady(true)
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handler = () => setIsMobile(detectMobile())
    mq.addEventListener('change', handler)
    window.addEventListener('resize', handler)
    return () => {
      mq.removeEventListener('change', handler)
      window.removeEventListener('resize', handler)
    }
  }, [])

  async function generateQr() {
    if (qrSvg) {
      setShowQr(prev => !prev)
      return
    }
    try {
      const url = window.location.href
      const svg = await QRCode.toString(url, {
        type: 'svg',
        margin: 1,
        color: { dark: '#0f0f0e', light: '#ebe7df' },
        width: 240,
      })
      setQrSvg(svg)
      setShowQr(true)
    } catch {
      setShowQr(false)
    }
  }

  async function sendEmailLink() {
    setEmailStatus('sending')
    try {
      // Fetch current user's email from the auth session
      const meRes = await fetch('/api/auth/me', { credentials: 'include' })
      const me = meRes.ok ? await meRes.json() : null
      if (!me?.email) {
        setEmailStatus('error')
        return
      }
      const redirect = window.location.pathname + window.location.search
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: me.email, redirect }),
      })
      setEmailStatus(res.ok ? 'sent' : 'error')
    } catch {
      setEmailStatus('error')
    }
  }

  function continueAnyway() {
    try {
      const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
      localStorage.setItem(DISMISS_KEY, String(until))
    } catch { /* ignore */ }
    setDismissed(true)
  }

  if (!ready) return null
  if (!isMobile || dismissed) return <>{children}</>

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-gate-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--bg)',
        overflowY: 'auto',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <Link
        href={locale === 'en' ? '/en/' : '/'}
        style={{
          alignSelf: 'flex-start',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
        }}
      >
        {t.backToHome}
      </Link>

      <h1
        id="mobile-gate-title"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(1.5rem, 7vw, 2rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          textWrap: 'balance',
        }}
      >
        {t.title}
      </h1>
      <p style={{
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        {t.body}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Email action — primary */}
        <button
          type="button"
          onClick={sendEmailLink}
          disabled={emailStatus === 'sending' || emailStatus === 'sent'}
          style={{
            padding: '0.95rem 1.25rem',
            background: emailStatus === 'sent' ? 'var(--bg-surface)' : 'var(--text-accent)',
            color: emailStatus === 'sent' ? 'var(--text-accent)' : 'var(--text-on-accent)',
            border: '1px solid var(--text-accent)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            fontWeight: 700,
            textAlign: 'left',
            cursor: emailStatus === 'sending' ? 'wait' : 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {emailStatus === 'sending' && t.emailSending}
          {emailStatus === 'sent' && t.emailSent}
          {(emailStatus === 'idle' || emailStatus === 'error') && t.emailAction}
        </button>
        {emailStatus === 'error' && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--crit)',
            padding: '0.25rem 0.5rem',
          }}>
            {t.emailFailed}
          </div>
        )}

        {/* QR action — secondary */}
        <button
          type="button"
          onClick={generateQr}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          {t.qrAction}
        </button>

        {showQr && qrSvg && (
          <div style={{
            padding: '1.25rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div
              style={{ width: 240, height: 240 }}
              aria-label="QR code with lesson URL"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              {t.qrHint}
            </div>
          </div>
        )}

        {/* Continue anyway — tertiary */}
        <button
          type="button"
          onClick={continueAnyway}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            textAlign: 'left',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          {t.continueAction}
          <span style={{
            display: 'block',
            fontSize: 'var(--text-xs)',
            opacity: 0.7,
            marginTop: '0.25rem',
          }}>
            {t.dismissHint}
          </span>
        </button>
      </div>
    </div>
  )
}
