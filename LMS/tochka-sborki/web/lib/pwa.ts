// web/lib/pwa.ts
// SSR-safe environment checks for the PWA install affordance. Pure — unit-tested.

/** True on iPhone/iPad (incl. iPadOS reporting as Mac with touch). SSR-safe. */
export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  // iPadOS 13+ presents a Mac UA but is touch-capable.
  return /Macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1
}

/** True when the app runs as an installed PWA (display-mode standalone, or iOS standalone). SSR-safe. */
export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  } catch { /* matchMedia unavailable */ }
  // iOS Safari exposes a non-standard navigator.standalone.
  return typeof navigator !== 'undefined' && (navigator as unknown as { standalone?: boolean }).standalone === true
}
