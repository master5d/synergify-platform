import type { Metadata } from 'next'
import { CertificatePage } from '@/components/pages/certificate-page'

export const metadata: Metadata = {
  title: 'Сертификат — Точка Сборки',
  description: 'Сертификат об окончании курса по vibe-кодингу',
  openGraph: {
    title: 'Точка Сборки — Сертификат',
    description: 'Vibe coder — это новая базовая грамотность',
    type: 'website',
  },
}

export default function Page() {
  return <CertificatePage locale="ru" />
}
