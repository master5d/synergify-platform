import Link from 'next/link'
import { MIRROR_COPY, mainSiteUrl } from '@/lib/mirror'

type Locale = 'ru' | 'en'

export function MirrorStub({ pathname, locale }: { pathname: string; locale: Locale }) {
  return (
    <main data-mirror-stub style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1rem', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '1.5rem' }}>{MIRROR_COPY.stubTitle[locale]}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{MIRROR_COPY.stubBody[locale]}</p>
      <p><a href={mainSiteUrl(pathname)}>{MIRROR_COPY.stubLink[locale]}</a></p>
      <p><Link href={locale === 'en' ? '/en/roadmap/' : '/roadmap/'}>{MIRROR_COPY.stubHome[locale]}</Link></p>
    </main>
  )
}

export function MirrorFormNote({ pathname, locale }: { pathname: string; locale: Locale }) {
  return (
    <p data-mirror-form-note style={{ color: 'var(--text-secondary)' }}>
      {MIRROR_COPY.formNote[locale]}{' '}
      <a href={mainSiteUrl(pathname)}>{MIRROR_COPY.bannerLink[locale]}</a>
    </p>
  )
}
