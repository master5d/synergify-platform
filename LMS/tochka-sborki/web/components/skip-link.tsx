import type { Locale } from '@/lib/dictionaries'

// Skip-to-content link — first focusable element on every Nav-bearing page.
// Hidden off-screen (.skip-link in globals.css) until focused via keyboard.
export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a className="skip-link" href="#main-content">
      {locale === 'en' ? 'Skip to content' : 'Перейти к содержимому'}
    </a>
  )
}
