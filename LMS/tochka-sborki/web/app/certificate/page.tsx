import type { Metadata } from 'next'
import { CertificatePage } from '@/components/pages/certificate-page'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Сертификат — ${COURSE.shortName}`,
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
