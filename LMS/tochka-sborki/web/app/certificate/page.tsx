import type { Metadata } from 'next'
import { CertificatePage } from '@/components/pages/certificate-page'
import { COURSE } from '@/lib/course'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Сертификат'),
  description: 'Сертификат об окончании курса по vibe-кодингу',
  openGraph: {
    title: `${COURSE.shortName} — Сертификат`,
    description: 'Vibe coder — это новая базовая грамотность',
    type: 'website',
  },
}

export default function Page() {
  return <CertificatePage locale="ru" />
}
