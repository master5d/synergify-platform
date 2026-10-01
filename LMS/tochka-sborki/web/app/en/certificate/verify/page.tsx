import type { Metadata } from 'next'
import { CertificateVerifyPage } from '@/components/pages/certificate-verify-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Certificate check'),
  description: 'Verify a course completion certificate',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <CertificateVerifyPage locale="en" />
}
