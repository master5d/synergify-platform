import type { Metadata } from 'next'
import { CertificatePage } from '@/components/pages/certificate-page'

export const metadata: Metadata = {
  title: 'Certificate — Tochka Sborki',
  description: 'Certificate of completion for the vibe-coding course',
  openGraph: {
    title: 'Tochka Sborki — Certificate',
    description: 'Vibe coding is the new basic literacy',
    type: 'website',
  },
}

export default function Page() {
  return <CertificatePage locale="en" />
}
